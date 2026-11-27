import React, { useEffect, useRef, useState } from 'react'
import './R1Hud.css'
import { PLAYER_BOARD_COLORS } from '../../constants/playerBoardColors'
import {
    r1PlayerCard, r1CardPlayable, r1DropPlayerTargets, r1MoveTargets, isBeach, HEX_CAPACITY,
    DROP_IN_RANGE, r1AttackUnavailableReason, r1MaxAttackDice,
} from '../../game/r1/SurfKingR1'
import { HexBadge, HexEffects, FeedbackIcon, terrainArt, compactHexAction } from './r1FeedbackVisuals'
import { getR1CardFeedback } from './r1CardFeedback'
import DropInAdvantage from './DropInAdvantage'
import { getDropInAdvantage } from './r1DropInOdds'
import { getR1RoundOrder } from './r1RoundOrder'
import { getCardRailState, getRoundHudProgress, TURN_STATUS_LABELS, CARD_RAIL_LABELS } from './r1HudState'
import { getR1TargetHighlight, r1SelectionTargets, r1SelectionPlayerTargets } from './r1TargetHighlight'
import { getTargetHighlightStyle } from '../../map/contract/targetHighlight'
import { cardArt, cardTone } from './r1CardArt'
import cardBack from '../../assets/cards/r1/cardback.webp'

const descriptions = {
    'Energy x2': 'Gain 2 energy (max 5).',
    'Lifeguard float': 'Recover with 3 energy.',
    'Big wave': 'Opponent within 2 hexes loses up to 2 energy (minimum 1 remaining).',
    Sunburn: 'Opponent within 3 hexes loses 1 energy (minimum 1 remaining).',
    Stone: 'Place within 3 hexes; the surfer who first enters normally loses 1 energy and Stone is removed.',
    Tsunami: 'Adjacent opponent loses up to 3 energy (minimum 1 remaining).',
    Storm: 'Place within 2 hexes; entry costs 1 energy.',
    Cyclone: 'Place within 2 hexes; entry redirects to a random free neighboring hex.',
    Island: 'Place within 2 hexes; every ordinary entry restores 2 energy; Island stays in place.',
    Jumping: 'Land on an adjacent hazard, stay there and ignore its effect.',
    Amulet: 'Protect against opponent attacks and Change until your next turn.',
    Change: 'Swap positions with an unprotected standing opponent within 2 hexes instead of moving.',
    'Hang loose': 'Block Drop In until your next turn; attack cards and Change still apply.',
    'Surf Current': 'Move up to two legal steps; draw only once.',
}

export { r1SelectionTargets } from './r1TargetHighlight'

export function PlayerIcon({ playerId, variant = '' }) {
    return <span className={'r1-player-avatar' + (variant ? ' ' + variant : '')} aria-hidden="true"
        style={{ '--r1-player-color': PLAYER_BOARD_COLORS[playerId % PLAYER_BOARD_COLORS.length] }}>{playerId + 1}</span>
}

const DIE_PIPS = {
    1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8],
}

function DiceFace({ value, lost }) {
    return <span className="r1-die" data-lost={lost} data-empty={value == null} aria-hidden="true">
        {value == null ? '–' : Array.from({ length: 9 }, (_, index) =>
            <i key={index} className="r1-die-pip" data-visible={DIE_PIPS[value]?.includes(index) || false}/>)}
    </span>
}

function EnergyMeter({ energy, lost = 0 }) {
    return <div className="r1-energy-meter" role="meter" aria-label="Energy" aria-valuemin={0} aria-valuemax={5} aria-valuenow={energy}>
        {Array.from({ length: 5 }, (_, i) => <span key={i} aria-hidden="true" data-filled={i < energy} data-lost={i >= energy && i < energy + lost} />)}
        <span className="r1-sr-only">{energy}/5 energy</span>
    </div>
}

export function HexInspectionBody({ hexFeedback, expanded = false }) {
    const singleAmuletBlock = hexFeedback?.occupants?.length === 1 &&
        hexFeedback.occupants[0].blocked === 'Amulet' && hexFeedback.action === 'This opponent is protected.'
    return (
        <div className="r1-inspection-body r1-hex-elements">
                    <div className="r1-inspection-heading"><strong>Hex {hexFeedback.id + 1}</strong>
                        <span className="r1-hex-number" aria-label={(hexFeedback.occupants?.length || 0) + ' of ' + HEX_CAPACITY + ' spaces occupied'}>
                            <span className="r1-hex-capacity" aria-hidden="true">{Array.from({ length: HEX_CAPACITY }, (_, i) => <i key={i} data-occupied={i < (hexFeedback.occupants?.length || 0)}/>)}</span>{hexFeedback.full ? ' Full' : ''}
                        </span>
                    </div>
                    <div className="r1-hex-terrain">
                        {terrainArt[hexFeedback.title] ? <img className="r1-inspection-art" src={terrainArt[hexFeedback.title]} alt=""/> :
                            <span className="r1-inspection-symbol"><FeedbackIcon kind={hexFeedback.title === 'Beach' ? 'flag' : 'wave'}/></span>}
                        <div className="r1-hex-element-body">
                            <strong>{hexFeedback.title}</strong>
                            <HexEffects info={hexFeedback}/>
                            {hexFeedback.entry && <span className="r1-hex-entry">{hexFeedback.entry}</span>}
                        </div>
                    </div>
                    {hexFeedback.occupants?.map(p => <div key={p.position} className="r1-hex-occupant" role="group" aria-label={'Player ' + (p.position + 1) + ' details'}>
                        <PlayerIcon playerId={p.position} variant="r1-hex-player-avatar"/>
                        <div className="r1-hex-element-body">
                            <div className="r1-hex-player-line"><EnergyMeter energy={p.energy}/></div>
                            {p.states?.filter(state => !(singleAmuletBlock && state === 'Amulet · Protected')).map(state => <span key={state} className="r1-hex-player-status"><FeedbackIcon kind={state.includes('Protected') || state.includes('shield') ? 'shield' : state === 'Winner' || state === 'Finished' ? 'flag' : 'wave'}/>{state}</span>)}
                            {p.eligible && !(hexFeedback.occupants.length === 1 && ['Attack here', 'Drop In'].includes(compactHexAction(hexFeedback))) && <span className="r1-hex-player-status" data-eligible="true"><FeedbackIcon kind="target"/>Eligible target</span>}
                            {p.blocked && !singleAmuletBlock && !(hexFeedback.occupants.length === 1 && p.blocked.includes(compactHexAction(hexFeedback))) && <span className="r1-hex-player-status" title={p.blocked}><FeedbackIcon kind="blocked"/>{p.blocked}</span>}
                        </div>
                    </div>)}
                    {!expanded && <span className="r1-hex-action"><FeedbackIcon kind={hexFeedback.status === 'ready' ? 'active' : hexFeedback.status === 'preview' ? 'move' : 'lock'}/>{singleAmuletBlock ? 'Amulet · Protected' : compactHexAction(hexFeedback)}</span>}
                    <span className="r1-sr-only">{hexFeedback.entry} {hexFeedback.occupantText} {hexFeedback.action} {hexFeedback.risk}</span>
                </div>
    )
}

export default function R1Controls({ G, ctx, moves, selection, setSelection, onTarget, targetHighlight, onPreviewCard = () => {}, hexFeedback = null, pinnedHex = false, onClearHex = () => {}, worldPiles = false, discardOpen: externalDiscardOpen, onDiscardOpenChange, onFocusPlayer = () => {} }) {
    const player = G.players[ctx.currentPlayer]
    const roundOrder = getR1RoundOrder(G, ctx)
    const roundProgress = getRoundHudProgress(roundOrder)
    const hand = player
    const targets = r1SelectionTargets(G, ctx, selection)
    const highlight = targetHighlight || getR1TargetHighlight(G, ctx, selection)
    const highlightStyle = getTargetHighlightStyle(highlight.kind)
    const playerTargets = r1SelectionPlayerTargets(G, ctx, selection)
    const dropTargets = r1DropPlayerTargets(G, ctx)
    const dropReason = r1AttackUnavailableReason(G, ctx, DROP_IN_RANGE, dropTargets)
    const maxAttackDice = r1MaxAttackDice(player.energy)
    const selectedDefender = selection?.kind === 'drop' && selection.targetPlayerId !== undefined ? G.players[selection.targetPlayerId] : null
    const selectedCard = selection?.kind === 'card' ? hand.cards[selection.index] : null
    const attacking = selection?.kind === 'drop' || r1PlayerCard(selectedCard?.Name)
    const swapChoice = G.currentMove === 'swap_choice' && G.pendingSwap
    const swapCard = G.currentMove === 'swap_card'
    const showTurnSteps = ['use_card', 'maneuver', 'current_first', 'current_second'].includes(G.currentMove)
    const cardAvailable = ['use_card', 'swap_card', 'recover'].includes(G.currentMove) && hand.cards.some((_, index) => r1CardPlayable(G, ctx, index))
    const cardRailState = getCardRailState(G, ctx, cardAvailable)
    const dropUsed = G.dropResult && String(G.dropResult.attackerId) === String(ctx.currentPlayer)
    const noMoveAvailable = G.currentMove === 'use_card' && !r1MoveTargets({ ...G, currentMove: 'maneuver' }, ctx).length
    const keyboardMoves = !selection && ['use_card', 'maneuver', 'current_first'].includes(G.currentMove) ?
        r1MoveTargets(G.currentMove === 'use_card' ? { ...G, currentMove: 'maneuver' } : G, ctx) : []
    const canPass = swapCard || G.currentMove === 'use_card' || G.currentMove === 'current_second' ||
        (G.currentMove === 'maneuver' && targets.length === 0)
    const winner = G.winner !== null ? G.players[G.winner] : null
    const [dismissedDice, setDismissedDice] = useState(null)
    const diceKey = G.dropResult?.id != null ? 'roll:' + G.dropResult.id :
        ['legacy', G.turn, ctx.currentPlayer, G.atkDices.join(','), G.defDices.join(',')].join(':')
    const showDice = G.atkDices.length > 0 && dismissedDice !== diceKey
    const repeatTarget = G.dropResult && Number(ctx.currentPlayer) === G.dropResult.attackerId && !selection && dropTargets.includes(G.dropResult.defenderId) ? G.dropResult.defenderId : null
    const [handHidden, setHandHidden] = useState(false)
    const [localDiscardOpen, setLocalDiscardOpen] = useState(false)
    const discardOpen = externalDiscardOpen ?? localDiscardOpen
    const setDiscardOpen = onDiscardOpenChange || setLocalDiscardOpen
    const [reshuffling, setReshuffling] = useState(false)
    const previousPiles = useRef({ deck: G.deck.length, discard: G.discardedCards.length })
    useEffect(() => {
        const previous = previousPiles.current
        previousPiles.current = { deck: G.deck.length, discard: G.discardedCards.length }
        if (previous.deck !== 0 || previous.discard === 0 || G.discardedCards.length !== 0) return
        setReshuffling(true)
    }, [G.deck.length, G.discardedCards.length])
    useEffect(() => {
        if (!reshuffling) return
        const timer = setTimeout(() => setReshuffling(false), 1100)
        return () => clearTimeout(timer)
    }, [reshuffling])
    const [terrainNotice, setTerrainNotice] = useState(null)
    const { id: terrainEventId, playerId: terrainPlayer, amount: terrainAmount, source: terrainSource, direction: terrainDirection } = G.terrainEnergyEvent || {}
    const seenTerrainEvent = useRef(terrainEventId ?? null)
    useEffect(() => {
        if (terrainEventId == null || terrainEventId === seenTerrainEvent.current) return
        seenTerrainEvent.current = terrainEventId
        setTerrainNotice({ playerId: terrainPlayer, amount: terrainAmount, source: terrainSource, direction: terrainDirection })
        const timer = setTimeout(() => setTerrainNotice(null), 2800)
        return () => clearTimeout(timer)
    }, [terrainEventId, terrainPlayer, terrainAmount, terrainSource, terrainDirection])
    const [inspection, setInspection] = useState(null)
    const inspected = !handHidden && inspection?.playerId === ctx.currentPlayer && inspection?.turn === G.turn ?
        hand.cards.find(card => card.id === inspection.cardId) : null
    const detailCard = inspected || selectedCard
    const detailIndex = detailCard ? hand.cards.indexOf(detailCard) : -1
    const feedback = getR1CardFeedback(G, ctx, detailIndex)
    const inspectingOther = !!selection && !!inspected && inspected.id !== selectedCard?.id
    const nextCardAction = inspectingOther ? 'Select this card to switch.' : !selectedCard ?
        'Select this card to continue.' : feedback?.targets.length ?
        (feedback.kind === 'attack' ? 'Choose a highlighted player.' : 'Choose a highlighted hex.') : 'Press Use card to confirm.'
    function inspectCard(cardId, pinned = false) {
        setInspection(cardId == null ? null : { cardId, pinned, playerId: ctx.currentPlayer, turn: G.turn })
        onPreviewCard(cardId)
    }
    const canConfirmCard = !!selectedCard && r1CardPlayable(G, ctx, selection.index) && targets.length === 0
    function playCard(index) {
        if (!r1CardPlayable(G, ctx, index)) {
            if (selection) setSelection(null)
            inspectCard(hand.cards[index].id, true)
            return
        }
        inspectCard(null)
        setSelection({ kind: 'card', index })
    }
    function confirmCard() {
        if (!canConfirmCard) return
        inspectCard(null)
        moves.useCard(selection.index)
        setSelection(null)
    }
    function resolveSwap(accept) {
        inspectCard(null)
        setSelection(null)
        moves.resolveSwap(accept)
    }
    const moveLabel = G.currentMove === 'use_card' ? 'Continue' :
        G.currentMove === 'current_second' ? 'Finish movement' :
        canPass ? 'End turn' : 'Choose a hex'
    const showFinishControl = !swapChoice && (swapCard || G.currentMove === 'current_second' || (G.currentMove === 'maneuver' && !targets.length) || noMoveAvailable)
    const handToggle = <button type="button" className="r1-hand-toggle" onClick={() => { inspectCard(null); setHandHidden(value => !value) }} aria-expanded={!handHidden} aria-label={handHidden ? 'Show cards' : 'Hide cards'} aria-describedby="r1-hand-count-description" title={handHidden ? 'Show cards' : 'Hide cards'}>
        <span className="r1-hand-toggle-icon" aria-hidden="true"><FeedbackIcon kind="cards"/></span>
        {showTurnSteps && <span className="r1-rail-copy"><strong>Cards</strong></span>}
        <span className="r1-hand-count" aria-hidden="true">{hand.cards.length}/5</span>
        <span id="r1-hand-count-description" className="r1-sr-only">{hand.cards.length} of 5 cards in hand{showTurnSteps ? ('; card ' + CARD_RAIL_LABELS[cardRailState].toLowerCase()) : ''}</span>
        <svg className="r1-hand-toggle-chevron" aria-hidden="true" viewBox="0 0 24 24"><path d={handHidden ? 'm6 15 6-6 6 6' : 'm6 9 6 6 6-6'}/></svg>
    </button>
    const handCard = <span className="r1-turn-card" data-available={cardAvailable} data-state={cardRailState} title={'Card ' + CARD_RAIL_LABELS[cardRailState].toLowerCase()}>{handToggle}</span>

    const choosingDropTarget = selection?.kind === 'drop' && selection.targetPlayerId === undefined
    const targetButtons = targets.length > 0 && <div className={choosingDropTarget ? 'r1-drop-target-list' : 'r1-targets'} aria-label={attacking ? "Legal target players" : "Legal target hexes"}>
                        {attacking ? playerTargets.map(id => choosingDropTarget ? <button type="button" key={id} className="r1-drop-target-option"
                            aria-label={'Attack Player ' + (id + 1)} aria-describedby={'r1-drop-target-' + id}
                            onClick={() => onTarget(G.players[id].cellPosition, id)}>
                            <PlayerIcon playerId={id} variant="r1-hex-player-avatar"/>
                            <span className="r1-drop-target-energy" aria-hidden="true">{Array.from({ length: 5 }, (_, i) => <span key={i} data-filled={i < G.players[id].energy}><FeedbackIcon kind="energy"/></span>)}</span>
                            <DropInAdvantage odds={getDropInAdvantage(player.energy, G.players[id].energy, maxAttackDice)}/>
                            <span id={'r1-drop-target-' + id} className="r1-sr-only">Hex {G.players[id].cellPosition + 1}; {G.players[id].energy} of 5 energy; {getDropInAdvantage(player.energy, G.players[id].energy, maxAttackDice)?.tone} with {maxAttackDice} {maxAttackDice === 1 ? 'die' : 'dice'}</span>
                        </button> : <button type="button" key={id}
                            aria-label={(selectedCard?.Name === 'Change' ? 'Swap with Player ' : 'Attack Player ') + (id + 1)}
                            className="r1-target-player" title={'Player ' + (id + 1)}
                            onClick={() => onTarget(G.players[id].cellPosition, id)}><PlayerIcon playerId={id} variant="r1-target-player-avatar"/></button>) :
                            targets.map(id => <button type="button" key={id} className="r1-target-hex" aria-label={'Select hex ' + (id + 1)}
                                onClick={() => onTarget(id)}><HexBadge id={id}/></button>)}
                    </div>

    return (
        <section className="r1-floating-hud" aria-label="R1 match controls">
            <header className="r1-hud-brand r1-glass" aria-label="Round status">
                <div className="r1-round-heading"><span className="r1-brand-wave" aria-hidden="true"><FeedbackIcon kind="wave"/></span>
                    <span>ROUND</span><strong>{String(G.turn).padStart(2, '0')}</strong></div>
                <div className="r1-round-progress-label"><span>Turn order</span><strong>{roundProgress.current}/{roundProgress.total}</strong></div>
                <div className="r1-round-segments" role="progressbar" aria-label="Completed turns this round" aria-valuemin={0}
                    aria-valuemax={roundProgress.total} aria-valuenow={roundProgress.completed}>
                    {roundOrder.map(({ id, status }) => <span key={id} data-status={status} aria-hidden="true"/>)}
                </div>
            </header>
            <div className="r1-card-piles" aria-label="Card piles" data-reshuffling={reshuffling} data-world-piles={worldPiles}>
                <div className="r1-pile-item" aria-label={'Draw pile: ' + G.deck.length + ' cards'}>
                    <div className="r1-pile-stack" data-empty={G.deck.length === 0} style={{ '--pile-depth': Math.min(14, Math.ceil(G.deck.length / 5)) + 'px' }}>
                        {G.deck.length > 0 && <img className="r1-pile-top" src={cardBack} alt="" />}
                    </div>
                    <span className="r1-pile-label">Deck <strong>{G.deck.length}</strong></span>
                </div>
                <button type="button" className="r1-pile-item r1-discard-button" aria-label={'Discard ' + G.discardedCards.length} aria-expanded={discardOpen} onClick={() => setDiscardOpen(value => !value)}>
                    <div className="r1-pile-stack" data-empty={G.discardedCards.length === 0} style={{ '--pile-depth': Math.min(14, Math.ceil(G.discardedCards.length / 5)) + 'px' }}>
                        {G.discardedCards.length > 0 && <div className="r1-pile-face" data-card-tone={cardTone[G.discardedCards[G.discardedCards.length - 1].Name]}><img src={cardArt[G.discardedCards[G.discardedCards.length - 1].Name]} alt="" /><strong>{G.discardedCards[G.discardedCards.length - 1].Name}</strong></div>}
                    </div>
                    <span className="r1-pile-label">Discard <strong>{G.discardedCards.length}</strong></span>
                </button>
                {reshuffling && <img className="r1-shuffle-card" src={cardBack} alt="" />}
                {discardOpen && <div className="r1-discard-list r1-glass" aria-label="Discarded cards">
                    <div className="r1-discard-list-header"><strong>Discarded cards</strong><button type="button" aria-label="Close discarded cards" onClick={() => setDiscardOpen(false)}>×</button></div>
                    <div className="r1-discard-cards">{G.discardedCards.length ? G.discardedCards.slice().reverse().map(card => <div className="r1-discard-card" data-card-tone={cardTone[card.Name]} key={card.id}><img src={cardArt[card.Name]} alt="" /><strong>{card.Name}</strong></div>) : <span>No discarded cards</span>}</div>
                    <small>When the deck is empty, the discard is shuffled on the next draw.</small>
                </div>}
            </div>
            <div className="r1-round-order" aria-label="Round play order">
                {roundOrder.map(({ id, status }) => {
                    const p = G.players[id]
                    const state = G.winner === p.position ? 'Winner' : isBeach(p.cellPosition) ? 'Finished' : p.energy === 0 ? 'Fallen' :
                        p.activeCard.some(c => c.Name === 'Amulet') ? 'Protected' : p.activeCard.some(c => c.Name === 'Hang loose') ? 'Drop In shield' : ''
                    return (
                        <button type="button" key={p.position} className="surf-hand r1-player-badge r1-glass"
                            style={{ '--r1-player-color': PLAYER_BOARD_COLORS[p.position % PLAYER_BOARD_COLORS.length] }}
                            data-current={status === 'now'} data-order-status={status}
                            data-attack-target={highlight.playerIds?.includes(p.position) || false}
                            aria-current={status === 'now' ? 'step' : undefined}
                            aria-label={'Focus camera on Player ' + (p.position + 1) + ', ' + p.energy + ' of 5 energy, ' + p.cards.length + ' cards, ' + (status === 'now' ? 'current turn' : status === 'played' ? 'played' : 'up next') + (state ? ', ' + state : '')}
                            title={'Focus camera on Player ' + (p.position + 1)}
                            onClick={() => onFocusPlayer(p.position)}>
                            <span className="r1-sidebar-player-heading">
                                <PlayerIcon playerId={p.position}/>
                                <span className="r1-sidebar-player-copy"><strong>Player {p.position + 1}</strong>
                                    <small className="r1-sidebar-turn-label">{TURN_STATUS_LABELS[status]}</small></span>
                                <span className={status === 'played' ? 'r1-player-played' : 'r1-sidebar-status-icon'} aria-hidden="true">
                                    <FeedbackIcon kind={status === 'played' ? 'check' : status === 'now' ? 'active' : 'clock'}/>
                                </span>
                            </span>
                            <span className="r1-player-compact-energy" aria-hidden="true">
                                <FeedbackIcon kind="energy"/>
                                <span className="r1-player-energy-segments">{Array.from({ length: 5 }, (_, i) => <span key={i} data-filled={i < p.energy} />)}</span>
                                {p.energy}/5
                            </span>
                            {state && <span className="r1-player-compact-state" aria-hidden="true" title={state}><FeedbackIcon kind={state === 'Protected' || state === 'Drop In shield' ? 'shield' : state === 'Winner' || state === 'Finished' ? 'flag' : 'warning'}/>{state}</span>}
                        </button>
                    )
                })}
            </div>
            <div className="r1-top-feedback" data-pinned={pinnedHex}>
            {terrainNotice && <div className="r1-match-feedback r1-glass r1-terrain-loss" data-gain={terrainNotice.direction === 'gain'} role="status" aria-label={terrainNotice.direction === 'gain' ? 'Terrain energy gain' : 'Terrain energy loss'}>Player {terrainNotice.playerId + 1} · {terrainNotice.source} · {terrainNotice.direction === 'gain' ? (terrainNotice.amount ? '+' + terrainNotice.amount + ' energy' : 'Energy full (5/5)') : '−' + terrainNotice.amount + ' energy'}</div>}
            {hexFeedback && <div className="r1-match-feedback r1-glass r1-hex-feedback r1-hex-information" aria-label="Hex information" data-status={hexFeedback.status}>
                <HexInspectionBody hexFeedback={hexFeedback}/>
                {pinnedHex && <button type="button" className="r1-inspection-close" aria-label="Close hex information" onClick={onClearHex}>×</button>}
            </div>}
            </div>
            {(winner || showDice || (G.message && !G.message.startsWith('Drop In:') && !['Round 1: no attacks.', 'Choose a card, attack or move.'].includes(G.message) && /fell|lost|loses|recover|swap|redirect|jumped|surf current|kept/i.test(G.message))) &&
                <div className={"r1-match-event r1-glass" + (showDice ? " r1-dice-event" : "")} aria-live="polite">
                    {winner ? <><FeedbackIcon kind="flag"/><strong>Player {winner.position + 1} wins!</strong><span>First to the beach.</span></> : !(G.dropResult && G.message?.startsWith('Drop In:')) && <span>{G.message}</span>}
                {showDice && <button type="button" className="r1-dice-close" aria-label="Close dice result" onClick={() => setDismissedDice(diceKey)}>×</button>}
                {showDice && <div className="r1-dice-results" aria-label="Drop In dice results">
                    {G.dropResult && <div className="r1-dice-sides">
                        {[['Attacker', G.dropResult.attackerId, G.dropResult.attackerLoss], ['Defender', G.dropResult.defenderId, G.dropResult.defenderLoss]].map(([role, id, loss]) =>
                            <div className="r1-dice-side" key={role} aria-label={role + ', Player ' + (id + 1) + ', ' + loss + ' energy lost'}>
                                <PlayerIcon playerId={id}/><EnergyMeter energy={G.players[id]?.energy ?? 0} lost={loss}/>{loss > 0 ? <strong className="r1-dice-energy" data-loss="true" aria-hidden="true"><FeedbackIcon kind="energy"/>−{loss}</strong> : <span className="r1-dice-energy-placeholder" aria-hidden="true"/>}
                            </div>)}
                    </div>}
                    <div className="r1-dice-pairs" key={diceKey}>
                        {Array.from({ length: Math.max(G.atkDices.length, G.defDices.length) }, (_, i) => {
                            const attack = G.atkDices[i], defense = G.defDices[i]
                            const result = attack == null || defense == null ? 'unpaired' : attack === defense ? 'tie' : attack > defense ? 'win' : 'loss'
                            const label = result === 'unpaired' ? 'Unpaired' : result === 'tie' ? 'Tie' : result === 'win' ? 'Defender −1' : 'Attacker −1'
                            return <div key={i} className="r1-dice-pair" data-result={result} aria-label={(attack == null ? 'No attacker die' : 'Attacker ' + attack) + ', ' + (defense == null ? 'no defender die' : 'defender ' + defense) + ', ' + label}>
                                <DiceFace value={attack} lost={result === 'loss'}/>
                                <span className="r1-dice-versus" aria-hidden="true">{result === 'tie' ? '=' : result === 'win' ? '→' : result === 'loss' ? '←' : '·'}</span>
                                <DiceFace value={defense} lost={result === 'win'}/>
                            </div>
                        })}
                    </div>
                    {repeatTarget != null && <button type="button" className="r1-repeat-drop" onClick={() => {
                        setDismissedDice(diceKey)
                        setSelection({ kind: 'drop', diceCount: maxAttackDice, targetCell: G.players[repeatTarget].cellPosition, targetPlayerId: repeatTarget })
                    }}><FeedbackIcon kind="dropIn"/>Attack again</button>}
                </div>}
                </div>}
            {!winner && <div className="r1-hud-dock">
                <div className="r1-dock-scroll">
                {(keyboardMoves.length > 0 || (!selection && dropTargets.length > 0)) && <div className="r1-movement-access" aria-label="Keyboard board actions">
                    {keyboardMoves.map(id => <button type="button" key={id} aria-label={'Move to hex ' + (id + 1)} onClick={() => moves.quickManeuver(id)}><HexBadge id={id}/></button>)}
                    {!selection && dropTargets.map(id => <button type="button" key={'attack-' + id} aria-label={'Attack Player ' + (id + 1)} onClick={() => setSelection({ kind: 'drop', diceCount: maxAttackDice, targetCell: G.players[id].cellPosition, targetPlayerId: id })}><PlayerIcon playerId={id}/></button>)}
                </div>}
                {swapChoice && <div className="r1-swap-choice r1-glass" role="group" aria-label="Position conquest">
                    <strong>Player {G.pendingSwap.targetPlayerId + 1} fell!</strong>
                    <span>Take their hex instead of moving, or keep your position and continue.</span>
                    <div className="r1-action-row">
                        <button type="button" className="r1-move-button" onClick={() => resolveSwap(true)}>Swap positions</button>
                        <button type="button" onClick={() => resolveSwap(false)}>Keep position</button>
                    </div>
                </div>}
                {detailCard && feedback && <div className="r1-card-detail r1-glass" data-selected={!!selectedCard && !inspectingOther} data-closable={!!selectedCard || !!inspection?.pinned} aria-live="polite">
                    <img className="r1-inspection-art" src={cardArt[detailCard.Name]} alt="" />
                    <div className="r1-inspection-body">
                        <div className="r1-inspection-heading">
                            <strong>{detailCard.Name}</strong>
                            <span className="r1-card-availability" data-playable={feedback.playable} role="img" aria-label={feedback.playable ? 'Available' : 'Unavailable'}><FeedbackIcon kind={feedback.playable ? 'active' : 'lock'}/></span>

                        </div>
                        <p className="r1-card-description">{descriptions[detailCard.Name]}</p>
                        {feedback.reason && <span className="r1-blocked-reason"><FeedbackIcon kind="blocked"/>{feedback.reason}</span>}
                        {feedback.playable && <div className="r1-card-guidance">

                            {['Energy x2', 'Lifeguard float'].includes(detailCard.Name) && <span className="r1-card-target-count">Your energy: {feedback.action}</span>}
                            {canConfirmCard && !inspectingOther ? <button type="button" className="r1-confirm-card" onClick={confirmCard}>Use card</button> :
                                <span className="r1-card-next-action"><FeedbackIcon kind="move"/>{nextCardAction}</span>}
                        </div>}
                        {selectedCard && attacking && !inspectingOther && targetButtons}

                    </div>
                    {(selectedCard || inspection?.pinned) && <button type="button" className="r1-inspection-close" aria-label={selectedCard ? "Deselect card" : "Close card information"} onClick={() => { inspectCard(null); if (selectedCard) setSelection(null) }}>×</button>}
                </div>}
                <div className="r1-hud-context r1-glass" data-attack-open={selection?.kind === 'drop' || undefined}>
                    {selection?.kind === 'drop' && <button type="button" className="r1-attack-close" aria-label="Close attack selection" onClick={() => { inspectCard(null); setSelection(null) }}>×</button>}
                    {swapCard && <span>Position conquered. Use one remaining non-movement card or end turn.</span>}
                    {G.currentMove === 'recover' && <div className="r1-action-row">
                        <button type="button" className="r1-recover-button" onClick={() => { setSelection(null); moves.recover() }}>Recover free (1 energy)</button>
                        <span>Or use Lifeguard Float.</span>
                    </div>}
                    {selection?.kind === 'drop' && !dropReason && selectedDefender && <div className="r1-attack-dice" role="group" aria-label="Attack dice">
                        <div className="r1-dice-options">
                        {Array.from({ length: maxAttackDice }, (_, i) => i + 1).map(count => {
                            const odds = selectedDefender ? getDropInAdvantage(player.energy, selectedDefender.energy, count) : null
                            return <button type="button" className="r1-dice-button" key={count} aria-label={count === 1 ? '1 die' : count + ' dice'} aria-describedby={'r1-dice-loss-' + count} aria-pressed={selection.diceCount === count} data-advantage={odds?.tone}
                                onClick={() => setSelection({ ...selection, diceCount: count })}>
                                <span className="r1-dice-option-faces" aria-hidden="true">{Array.from({ length: count }, (_, i) => <span className="r1-dice-option-face" key={i}/>)}</span>
                                <span>{count === 1 ? '1 die' : count + ' dice'}</span>
                                <DropInAdvantage odds={odds}/>
                                <span className="r1-dice-option-loss" aria-hidden="true">Up to ⚡−{odds?.maxLoss ?? count}</span>
                                <span className="r1-sr-only" id={'r1-dice-loss-' + count}>{odds ? odds.tone + ' · ' : ''}Maximum own energy loss: {odds?.maxLoss ?? count}</span>
                            </button>
                        })}
                        </div>
                        {selection.targetPlayerId !== undefined && <button type="button" className="r1-drop-button r1-drop-confirm" aria-label={'Confirm Drop In · Player ' + (selection.targetPlayerId + 1)} onClick={() => onTarget(selection.targetCell, selection.targetPlayerId)}>Confirm Drop In</button>}
                        <span className="r1-sr-only">Compare highest dice first. Each lost pair costs 1 energy; ties cost nothing.</span>
                    </div>}
                    {!detailCard && (selection || !['use_card', 'maneuver'].includes(G.currentMove)) && highlight.cellIds.length > 0 && highlightStyle && <div className="r1-target-legend">
                        {selection?.kind === 'drop' && selection.targetPlayerId !== undefined ? <>
                            <PlayerIcon playerId={selection.targetPlayerId} variant="r1-legend-player-avatar"/>
                            <span className="r1-sr-only">Player {selection.targetPlayerId + 1} </span>selected · choose dice.
                        </> : <><span className="r1-target-swatch" style={{ backgroundColor: highlightStyle.color }} aria-hidden="true" />
                            {choosingDropTarget ? 'Choose an opponent · up to ' + maxAttackDice + (maxAttackDice === 1 ? ' die' : ' dice') : highlight.preview ? 'Choose a card, attack or move.' : highlightStyle.label + ' — select a highlighted ' + (attacking ? 'opponent.' : 'hex.')}</>}
                    </div>}
                    {selection?.targetPlayerId === undefined && (!selectedCard || (!attacking && !inspectingOther)) && (selection || !['use_card', 'maneuver'].includes(G.currentMove)) && targetButtons}
                </div>
                {!handHidden && <div className="r1-hand" aria-label={'Player ' + (hand.position + 1) + ' hand'}>
                    {hand.cards.map((card, index) => {
                        const { reason, playable } = getR1CardFeedback(G, ctx, index)
                        return <button type="button" key={card.id} data-card-tone={cardTone[card.Name]}
                            aria-disabled={!playable} aria-pressed={selection?.kind === 'card' && selection.index === index}
                            style={{ '--r1-fan-angle': ((index - (hand.cards.length - 1) / 2) * 3) + 'deg' }}
                            onMouseEnter={() => inspectCard(card.id)}
                            onMouseLeave={() => { if (!inspection?.pinned) inspectCard(null) }}
                            onFocus={() => inspectCard(card.id)}
                            onBlur={() => { if (!inspection?.pinned) inspectCard(null) }}
                            onClick={() => playCard(index)}>
                            <img src={cardArt[card.Name]} alt="" className="r1-card-art" draggable="false" />
                            <strong>{card.Name}</strong>
                            <span className="r1-sr-only">{descriptions[card.Name]} {reason}</span>
                        </button>
                    })}
                    {!hand.cards.length && <span className="r1-empty-hand r1-glass">No cards in hand</span>}
                </div>}
                </div>
                {(!showTurnSteps || showFinishControl) && <div className="r1-action-bar r1-glass">
                    {!showTurnSteps && handToggle}
                    {showFinishControl && <button type="button" className="r1-move-button" disabled={!canPass || !!selection}
                        aria-label={moveLabel} onClick={() => { inspectCard(null); moves.pass() }}><span className="r1-board-action-icon"><FeedbackIcon kind="move"/></span><span className="r1-move-label">{moveLabel}</span></button>}
                </div>}
                {showTurnSteps && <div className="r1-turn-progress r1-glass">
                    <div className="r1-turn-summary" aria-label="Turn progress">
                        {handCard}
                        <button type="button" className="r1-drop-shortcut" disabled={!!dropReason || (!!selection && selection.kind !== 'drop')}
                            aria-pressed={selection?.kind === 'drop'} aria-describedby="r1-drop-status"
                            title={dropReason || (selection && selection.kind !== 'drop' ? 'Close the selected card first.' : 'Choose a Drop In opponent')}
                            onClick={() => { inspectCard(null); setSelection(selection?.kind === 'drop' ? null : { kind: 'drop', diceCount: maxAttackDice }) }}>
                            <FeedbackIcon kind="dropIn"/>Drop In
                        </button>
                        <div className="r1-turn-guidance">
                            {(!selection || (selection.kind === 'drop' && selection.targetPlayerId === undefined)) && <span className="r1-select-hex">{selection?.kind === 'drop' ? 'Choose an opponent' : G.currentMove === 'current_second' ? 'Select a second hex' : 'Select a hex'} <span aria-hidden="true">↗</span></span>}
                            {(cardRailState === 'used' || dropUsed) && <span className="r1-turn-history">
                                {cardRailState === 'used' && <span><FeedbackIcon kind="check"/>Card used</span>}
                                {dropUsed && <span><FeedbackIcon kind="check"/>Drop In used</span>}
                            </span>}
                            {dropReason && !selection && <span className="r1-drop-unavailable">{dropReason}</span>}
                        </div>
                    </div>
                </div>}
                <span id="r1-drop-status" role="status" className="r1-sr-only">{dropReason || (dropTargets.length + ' opponent(s) in range · Free attack, maximum energy loss ' + maxAttackDice + ' energy')}</span>
            </div>}
        </section>
    )
}
