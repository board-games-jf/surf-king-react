import React, { useState } from 'react'
import './R1Hud.css'
import { PLAYER_BOARD_COLORS } from '../../constants/playerBoardColors'
import {
    r1PlayerCard, r1CardPlayable, r1DropPlayerTargets, isBeach, HEX_CAPACITY,
    DROP_IN_RANGE, r1AttackUnavailableReason, r1MaxAttackDice,
} from '../../game/r1/SurfKingR1'
import { CardEffects, HexEffects, FeedbackIcon, cardEffectKind, terrainArt, compactReason, compactHexAction } from './r1FeedbackVisuals'
import { getR1CardFeedback } from './r1CardFeedback'
import { getR1RoundOrder } from './r1RoundOrder'
import { getR1TargetHighlight, r1SelectionTargets, r1SelectionPlayerTargets } from './r1TargetHighlight'
import { getTargetHighlightStyle, getTargetBlockStyle } from '../../map/contract/targetHighlight'
import { cardArt, cardTone } from './r1CardArt'

const descriptions = {
    'Energy x2': 'Gain 2 energy (max 5).',
    'Lifeguard float': 'Recover with 3 energy.',
    'Big wave': 'Opponent within 2 edges loses up to 2 energy (minimum 1 remaining).',
    Sunburn: 'Opponent within 3 edges loses 1 energy (minimum 1 remaining).',
    Stone: 'Place within 3 edges; the surfer who first enters normally loses 1 energy and Stone is removed.',
    Tsunami: 'Adjacent opponent loses up to 3 energy (minimum 1 remaining).',
    Storm: 'Place within 2 edges; entry costs 1 energy.',
    Cyclone: 'Place within 2 edges; entry redirects to a random free neighboring hex.',
    Island: 'Place within 2 edges; every ordinary entry restores 2 energy; Island stays in place.',
    Jumping: 'Land on an adjacent hazard, stay there and ignore its effect.',
    Amulet: 'Protect against opponent attacks and Change until your next turn.',
    Change: 'Swap positions with an unprotected standing opponent within 2 hexes instead of moving.',
    'Hang loose': 'Block Drop In until your next turn; attack cards and Change still apply.',
    'Surf Current': 'Move up to two legal steps; draw only once.',
}
const shortEffects = {
    'Energy x2': '+2 energy', 'Lifeguard float': 'Recover to 3',
    'Big wave': 'Up to −2', Sunburn: '−1 energy', Tsunami: 'Up to −3',
    Stone: 'Entry −1', Storm: 'Entry −1', Cyclone: 'Redirect', Island: 'Entry +2',
    Jumping: 'Safe landing', Amulet: 'Shield', 'Surf Current': '2 steps', Change: 'Swap · 2 hexes', 'Hang loose': 'Block Drop In',
}

export { r1SelectionTargets } from './r1TargetHighlight'

function EnergyMeter({ energy }) {
    return <div className="r1-energy-meter" role="meter" aria-label="Energy" aria-valuemin={0} aria-valuemax={5} aria-valuenow={energy}>
        {Array.from({ length: 5 }, (_, i) => <span key={i} aria-hidden="true" data-filled={i < energy} />)}
        <span className="r1-sr-only">{energy}/5 energy</span>
    </div>
}

export default function R1Controls({ G, ctx, moves, selection, setSelection, onTarget, targetHighlight, onPreviewCard = () => {}, hexFeedback = null, pinnedHex = false, onClearHex = () => {} }) {
    const player = G.players[ctx.currentPlayer]
    const roundOrder = getR1RoundOrder(G, ctx)
    const hand = player
    const targets = r1SelectionTargets(G, ctx, selection)
    const highlight = targetHighlight || getR1TargetHighlight(G, ctx, selection)
    const highlightStyle = getTargetHighlightStyle(highlight.kind)
    const playerTargets = r1SelectionPlayerTargets(G, ctx, selection)
    const dropTargets = r1DropPlayerTargets(G, ctx)
    const dropReason = r1AttackUnavailableReason(G, ctx, DROP_IN_RANGE, dropTargets)
    const maxAttackDice = r1MaxAttackDice(player.energy)
    const selectedCard = selection?.kind === 'card' ? hand.cards[selection.index] : null
    const attacking = selection?.kind === 'drop' || r1PlayerCard(selectedCard?.Name)
    const swapChoice = G.currentMove === 'swap_choice' && G.pendingSwap
    const swapCard = G.currentMove === 'swap_card'
    const canPass = swapCard || G.currentMove === 'use_card' || G.currentMove === 'current_second' ||
        (G.currentMove === 'maneuver' && targets.length === 0)
    const winner = G.winner !== null ? G.players[G.winner] : null
    const [handHidden, setHandHidden] = useState(false)
    const [inspection, setInspection] = useState(null)
    const inspected = !handHidden && inspection?.playerId === ctx.currentPlayer && inspection?.turn === G.turn ?
        hand.cards.find(card => card.id === inspection.cardId) : null
    const detailCard = inspected || selectedCard
    const detailIndex = detailCard ? hand.cards.indexOf(detailCard) : -1
    const feedback = getR1CardFeedback(G, ctx, detailIndex)
    const inspectingOther = !!selection && !!inspected && inspected.id !== selectedCard?.id
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
    const moveLabel = G.currentMove === 'use_card' ? 'Move' :
        G.currentMove === 'current_second' ? 'Finish movement' :
        canPass ? 'End turn' : 'Choose a hex'

    return (
        <section className="r1-floating-hud" aria-label="R1 match controls">
            <header className="r1-hud-brand r1-glass">
                <span className="r1-brand-wave" aria-hidden="true">〰</span>
                <div><strong>SURF KING</strong><span>ROUND {String(G.turn).padStart(2, '0')}</span></div>
            </header>
            <div className="r1-round-order" aria-label="Round play order">
                {roundOrder.map(({ id, status }, slot) => {
                    const p = G.players[id]
                    const state = G.winner === p.position ? 'Winner' : isBeach(p.cellPosition) ? 'Finished' : p.energy === 0 ? 'Fallen' :
                        p.activeCard.some(c => c.Name === 'Amulet') ? 'Protected' : p.activeCard.some(c => c.Name === 'Hang loose') ? 'Drop In shield' : ''
                    return (
                        <div key={p.position} className="surf-hand r1-player-badge r1-glass"
                            style={{ '--r1-player-color': PLAYER_BOARD_COLORS[p.position % PLAYER_BOARD_COLORS.length] }}
                            data-current={status === 'now'} data-order-status={status}
                            data-attack-target={highlight.playerIds?.includes(p.position) || false}
                            aria-current={status === 'now' ? 'step' : undefined}>
                            <div className="r1-player-heading">
                                <span className="r1-player-avatar" aria-hidden="true">{p.position + 1}</span>
                                <strong>{slot + 1}. Player {p.position + 1}</strong>
                            </div>
                            <EnergyMeter energy={p.energy} />
                            <div className="r1-player-meta">
                                <span className="r1-order-status">{status === 'now' ? 'NOW' : status === 'played' ? 'Played' : 'Up next'}</span>
                                <span>{p.cards.length} cards</span>
                            </div>
                            {state && <span className="r1-player-state">{state}</span>}
                        </div>
                    )
                })}
            </div>
            <div className="r1-top-feedback" data-pinned={pinnedHex}>
            {hexFeedback && <div className="r1-match-feedback r1-glass r1-hex-feedback" aria-label="Hex information" data-status={hexFeedback.status}>
                <div className="r1-inspection-body r1-hex-elements">
                    <div className="r1-inspection-heading"><strong>Hex {hexFeedback.id + 1}</strong>
                        {hexFeedback.occupants?.length > 0 && <span className="r1-hex-number">{hexFeedback.occupants.length}/{HEX_CAPACITY} surfers{hexFeedback.full ? ' · Full' : ''}</span>}
                    </div>
                    <div className="r1-hex-terrain">
                        {terrainArt[hexFeedback.title] ? <img className="r1-inspection-art" src={terrainArt[hexFeedback.title]} alt=""/> :
                            <span className="r1-inspection-symbol"><FeedbackIcon kind={hexFeedback.title === 'Beach' ? 'flag' : 'wave'}/></span>}
                        <div className="r1-hex-element-body">
                            <strong>{hexFeedback.title}</strong>
                            <HexEffects info={hexFeedback}/>
                            {hexFeedback.occupants?.length > 0 && <span className="r1-hex-entry">{hexFeedback.entry}</span>}
                        </div>
                    </div>
                    {hexFeedback.occupants?.map(p => <div key={p.position} className="r1-hex-occupant" role="group" aria-label={'Player ' + (p.position + 1) + ' details'}>
                        <span className="r1-hex-player-avatar" aria-hidden="true" style={{ background: PLAYER_BOARD_COLORS[p.position] }}>P{p.position + 1}</span>
                        <div className="r1-hex-element-body">
                            <div className="r1-hex-player-line"><strong>{p.text}</strong><EnergyMeter energy={p.energy}/></div>
                            {p.states?.map(state => <span key={state} className="r1-hex-player-status"><FeedbackIcon kind={state.includes('Protected') || state.includes('shield') ? 'shield' : state === 'Winner' || state === 'Finished' ? 'flag' : 'wave'}/>{state}</span>)}
                            {p.eligible && <span className="r1-hex-player-status" data-eligible="true"><FeedbackIcon kind="check"/>Eligible target</span>}
                            {p.blocked && <span className="r1-hex-player-status" title={p.blocked}><FeedbackIcon kind="blocked"/>{p.blocked}</span>}
                        </div>
                    </div>)}
                    <span className="r1-hex-action"><FeedbackIcon kind={hexFeedback.status === 'ready' ? 'check' : hexFeedback.status === 'preview' ? 'move' : 'blocked'}/>{compactHexAction(hexFeedback)}</span>
                    <span className="r1-sr-only">{hexFeedback.entry} {hexFeedback.occupantText} {hexFeedback.action} {hexFeedback.risk}</span>
                </div>
                {pinnedHex && <button type="button" className="r1-inspection-close" aria-label="Close hex information" onClick={onClearHex}>×</button>}
            </div>}
            {(winner || G.atkDices.length > 0 || (G.message && !['Round 1: no attacks.', 'Choose a card, attack or move.'].includes(G.message) && /fell|lost|loses|recover|swap|redirect|jumped|surf current|kept/i.test(G.message))) &&
                <div className="r1-match-event r1-glass" aria-live="polite">
                    {winner ? <><FeedbackIcon kind="flag"/><strong>Player {winner.position + 1} wins!</strong><span>First to the beach.</span></> : <span>{G.message}</span>}
                {G.atkDices.length > 0 && <div className="r1-dice-results" aria-label="Drop In dice results">
                    {G.atkDices.map((die, i) => <span key={i} data-result={G.defDices[i] === undefined || die === G.defDices[i] ? 'tie' : die > G.defDices[i] ? 'win' : 'loss'}>
                        {die}{G.defDices[i] !== undefined ? ' vs ' + G.defDices[i] + ' — ' +
                            (die > G.defDices[i] ? 'Defender −1' : die < G.defDices[i] ? 'Attacker −1' : 'Tie') : ' (unpaired)'}
                    </span>)}
                    {G.defDices.slice(G.atkDices.length).map((die, i) => <span key={'def-' + i}>Defender {die} (unpaired)</span>)}
                </div>}
                </div>}
            </div>
            {!winner && <div className="r1-hud-dock">
                <div className="r1-dock-scroll">
                {swapChoice && <div className="r1-swap-choice r1-glass" role="group" aria-label="Position conquest">
                    <strong>Player {G.pendingSwap.targetPlayerId + 1} fell!</strong>
                    <span>Take their hex instead of moving, or keep your position and continue.</span>
                    <div className="r1-action-row">
                        <button type="button" className="r1-move-button" onClick={() => resolveSwap(true)}>Swap positions</button>
                        <button type="button" onClick={() => resolveSwap(false)}>Keep position</button>
                    </div>
                </div>}
                {detailCard && feedback && <div className="r1-card-detail r1-glass" aria-live="polite">
                    <img className="r1-inspection-art" src={cardArt[detailCard.Name]} alt="" />
                    <div className="r1-inspection-body">
                        <div className="r1-inspection-heading">
                            <strong>{detailCard.Name}</strong>
                            <span className="r1-card-availability" data-playable={feedback.playable} role="img" aria-label={feedback.playable ? 'Available' : 'Unavailable'} title={feedback.playable ? 'Available' : 'Unavailable'}><FeedbackIcon kind={feedback.playable ? 'check' : 'blocked'}/></span>
                        </div>
                        <CardEffects name={detailCard.Name}/>
                        {feedback.reason && <span className="r1-blocked-reason"><FeedbackIcon kind="blocked"/>{compactReason(feedback.reason)}</span>}
                        {feedback.playable && <span className="r1-card-next-action">
                            <FeedbackIcon kind={feedback.targets.length ? 'range' : 'move'}/>
                            {feedback.targets.length && attacking ? feedback.playerIds.length + (feedback.playerIds.length === 1 ? ' target' : ' targets') : feedback.action}{' · '}{inspectingOther ? 'Switch card' : selectedCard ? feedback.targets.length ? 'Pick target' : 'Confirm' : 'Select card'}
                        </span>}
                        {feedback.blocked?.length > 0 && <div className="r1-blocked-targets" aria-label="Blocked opponents">
                            {feedback.blocked.map(block => {
                                const style = getTargetBlockStyle(block.code)
                                const label = block.reason || style.label
                                return <span key={`${block.id}:${block.playerId}`} className="r1-blocked-target-chip" style={{ color: style.color }} title={label} aria-label={'Player ' + (block.playerId + 1) + ': ' + label}>
                                    P{block.playerId + 1} <FeedbackIcon kind={style.symbol === 'one' ? 'energy' : style.symbol === 'shield' ? 'shield' : 'blocked'}/> {style.shortLabel}
                                </span>
                            })}
                        </div>}
                        <span className="r1-sr-only">{descriptions[detailCard.Name]} {feedback.reason}</span>
                    </div>
                    {inspection?.pinned && !selectedCard && <button type="button" className="r1-inspection-close" aria-label="Close card information" onClick={() => inspectCard(null)}>×</button>}
                    {canConfirmCard && !inspectingOther && <button type="button" className="r1-confirm-card" onClick={confirmCard}>Use card</button>}
                </div>}
                <div className="r1-hud-context r1-glass">
                    {swapCard && <span>Position conquered. Use one remaining non-movement card or end turn.</span>}
                    {G.currentMove === 'recover' && <div className="r1-action-row">
                        <button type="button" className="r1-recover-button" onClick={() => { setSelection(null); moves.recover() }}>Recover free (1 energy)</button>
                        <span>Or use Lifeguard Float.</span>
                    </div>}
                    {selection?.kind === 'drop' && !dropReason && <div className="r1-action-row" role="group" aria-label="Attack dice">
                        <strong>Choose attack dice</strong>
                        {Array.from({ length: maxAttackDice }, (_, i) => i + 1).map(count =>
                            <button type="button" className="r1-dice-button" key={count} aria-pressed={selection.diceCount === count}
                                onClick={() => setSelection({ kind: 'drop', diceCount: count })}>
                                <span aria-hidden="true">{count === 1 ? '⚀' : '⚁'}</span> {count} {count === 1 ? 'die' : 'dice'}
                            </button>)}
                        <span className="r1-sr-only">Compare highest dice first. Each lost pair costs 1 energy; ties cost nothing.</span>
                    </div>}
                    {!detailCard && highlight.cellIds.length > 0 && highlightStyle && <div className="r1-target-legend">
                        <span className="r1-target-swatch" style={{ backgroundColor: highlightStyle.color }} aria-hidden="true" />
                        {highlight.preview ? 'Choose a card, attack or move.' : highlightStyle.label + ' — select a highlighted ' + (attacking ? 'opponent.' : 'hex.')}
                    </div>}
                    {targets.length > 0 && <div className="r1-targets" aria-label="Legal target hexes">
                        {attacking ? playerTargets.map(id => <button type="button" key={id}
                            aria-label={(selectedCard?.Name === 'Change' ? 'Swap with Player ' : 'Attack Player ') + (id + 1)}
                            onClick={() => onTarget(G.players[id].cellPosition, id)}>Player {id + 1}</button>) :
                            targets.map(id => <button type="button" key={id} aria-label={'Select hex ' + (id + 1)}
                                onClick={() => onTarget(id)}>{id + 1}</button>)}
                    </div>}
                </div>
                <div className="r1-hand-heading r1-glass">
                    <span>YOUR HAND <strong>{hand.cards.length}/5</strong></span>
                    <button type="button" onClick={() => { inspectCard(null); setHandHidden(value => !value) }} aria-expanded={!handHidden}>{handHidden ? 'Show cards' : 'Hide cards'}</button>
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
                            <span className="r1-card-ready" data-playable={playable} aria-hidden="true">{playable ? '✓' : '–'}</span>
                            <strong>{card.Name}</strong><span className="r1-card-effect"><FeedbackIcon kind={cardEffectKind(card.Name)}/>{shortEffects[card.Name]}</span>
                            <span className="r1-sr-only">{descriptions[card.Name]} {reason}</span>
                        </button>
                    })}
                    {!hand.cards.length && <span className="r1-empty-hand r1-glass">No cards in hand</span>}
                </div>}
                </div>
                <div className="r1-action-bar r1-glass">
                    <button type="button" className="r1-drop-button" disabled={!!dropReason}
                        aria-pressed={selection?.kind === 'drop'} aria-describedby="r1-drop-status"
                        aria-label="Attack · Drop In (2 hexes)"
                        onClick={() => { inspectCard(null); setSelection({ kind: 'drop', diceCount: maxAttackDice }) }}>
                        <span aria-hidden="true">⚔</span> Drop In
                    </button>
                    {selection && <button type="button" className="r1-cancel-button" onClick={() => { inspectCard(null); setSelection(null) }}>Cancel selection</button>}
                    {!selection && !swapChoice && G.currentMove !== 'recover' && <button type="button" className="r1-move-button" disabled={!canPass}
                        onClick={() => { inspectCard(null); moves.pass() }}>{moveLabel} <span aria-hidden="true">→</span></button>}
                    <span id="r1-drop-status" role="status">{dropReason || (dropTargets.length + ' opponent(s) in range · Free attack, risk up to ' + maxAttackDice + ' energy')}</span>
                </div>
            </div>}
        </section>
    )
}
