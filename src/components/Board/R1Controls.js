import React, { useState } from 'react'
import './R1Hud.css'
import { PLAYER_BOARD_COLORS } from '../../constants/playerBoardColors'
import {
    R1_ATTACK_RANGE, r1CardPlayable, r1CardTargets, r1DropTargets, isBeach,
    DROP_IN_RANGE, r1AttackUnavailableReason, r1MaxAttackDice,
} from '../../game/r1/SurfKingR1'
import { getR1RoundOrder } from './r1RoundOrder'
import { getR1TargetHighlight, r1SelectionTargets } from './r1TargetHighlight'
import { getTargetHighlightStyle } from '../../map/contract/targetHighlight'
import cardArt0 from '../../assets/cards/energyx2.png'
import cardArt1 from '../../assets/cards/lifeguardfloat.png'
import cardArt2 from '../../assets/cards/bigwave.png'
import cardArt3 from '../../assets/cards/sunburn.png'
import cardArt4 from '../../assets/cards/storm.png'
import cardArt5 from '../../assets/cards/cyclone.png'
import cardArt6 from '../../assets/cards/island.png'
import cardArt7 from '../../assets/cards/jumping.png'
import cardArt8 from '../../assets/cards/amulet.png'
import stoneArt from '../../assets/cards/stone.png'
import tsunamiArt from '../../assets/cards/tsunami.png'
import surfCurrentArt from '../../assets/cards/surfcurrent.svg'

const cardArt = {
    'Energy x2': cardArt0,
    'Lifeguard float': cardArt1,
    'Big wave': cardArt2,
    'Sunburn': cardArt3,
    'Storm': cardArt4,
    'Cyclone': cardArt5,
    'Island': cardArt6,
    'Jumping': cardArt7,
    'Amulet': cardArt8,
    Stone: stoneArt,
    Tsunami: tsunamiArt,
    'Surf Current': surfCurrentArt,
}


const descriptions = {
    'Energy x2': 'Gain 2 energy (max 5).',
    'Lifeguard float': 'Recover with 3 energy.',
    'Big wave': 'Opponent within 2 edges loses up to 2 energy (minimum 1 remaining).',
    Sunburn: 'Opponent within 3 edges loses 1 energy (minimum 1 remaining).',
    Stone: 'Place within 3 edges; first ordinary entry costs 1 energy and removes Stone.',
    Tsunami: 'Adjacent opponent loses up to 3 energy (minimum 1 remaining).',
    Storm: 'Place within 2 edges; entry costs 1 energy.',
    Cyclone: 'Place within 2 edges; entry redirects to a random free neighboring hex.',
    Island: 'Place within 2 edges; every ordinary entry restores 2 energy; Island stays in place.',
    Jumping: 'Land on an adjacent hazard, stay there and ignore its effect.',
    Amulet: 'Protect against opponent attacks until your next turn.',
    'Surf Current': 'Move up to two legal steps; draw only once.',
}
const shortEffects = {
    'Energy x2': '+2 energy', 'Lifeguard float': 'Recover to 3',
    'Big wave': 'Up to −2', Sunburn: '−1 energy', Tsunami: 'Up to −3',
    Stone: 'Place · −1', Storm: 'Place · −1', Cyclone: 'Redirect', Island: 'Place · +2',
    Jumping: 'Safe landing', Amulet: 'Shield', 'Surf Current': '2 steps',
}

export { r1SelectionTargets } from './r1TargetHighlight'

function EnergyMeter({ energy }) {
    return <div className="r1-energy-meter" role="meter" aria-label="Energy" aria-valuemin={0} aria-valuemax={5} aria-valuenow={energy}>
        {Array.from({ length: 5 }, (_, i) => <span key={i} aria-hidden="true" data-filled={i < energy} />)}
        <span className="r1-sr-only">{energy}/5 energy</span>
    </div>
}

export default function R1Controls({ G, ctx, moves, selection, setSelection, onTarget, targetHighlight }) {
    const player = G.players[ctx.currentPlayer]
    const roundOrder = getR1RoundOrder(G, ctx)
    const hand = player
    const targets = r1SelectionTargets(G, ctx, selection)
    const highlight = targetHighlight || getR1TargetHighlight(G, ctx, selection)
    const highlightStyle = getTargetHighlightStyle(highlight.kind)
    const dropTargets = r1DropTargets(G, ctx)
    const dropReason = r1AttackUnavailableReason(G, ctx, DROP_IN_RANGE, dropTargets)
    const maxAttackDice = r1MaxAttackDice(player.energy)
    const selectedCard = selection?.kind === 'card' ? hand.cards[selection.index] : null
    const attacking = selection?.kind === 'drop' || Boolean(R1_ATTACK_RANGE[selectedCard?.Name])
    const swapChoice = G.currentMove === 'swap_choice' && G.pendingSwap
    const swapCard = G.currentMove === 'swap_card'
    const canPass = swapCard || G.currentMove === 'use_card' || G.currentMove === 'current_second' ||
        (G.currentMove === 'maneuver' && targets.length === 0)
    const winner = G.winner !== null ? G.players[G.winner] : null
    const [handHidden, setHandHidden] = useState(false)
    const [inspectedId, setInspectedId] = useState(null)
    const inspected = hand.cards.find(card => card.id === inspectedId)
    const detailCard = selectedCard || inspected
    const detailIndex = detailCard ? hand.cards.indexOf(detailCard) : -1
    const detailRange = detailCard && R1_ATTACK_RANGE[detailCard.Name]
    const detailReason = detailRange ? r1AttackUnavailableReason(G, ctx, detailRange,
        r1CardTargets(G, ctx, detailIndex), 'card') : null
    const canConfirmCard = !!selectedCard && r1CardPlayable(G, ctx, selection.index) && targets.length === 0
    function playCard(index) {
        if (!r1CardPlayable(G, ctx, index)) return
        setInspectedId(null)
        setSelection({ kind: 'card', index })
    }
    function confirmCard() {
        if (!canConfirmCard) return
        moves.useCard(selection.index)
        setSelection(null)
    }
    function resolveSwap(accept) {
        setInspectedId(null)
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
                    const state = isBeach(p.cellPosition) ? 'Finished' : p.energy === 0 ? 'Fallen' :
                        p.activeCard.length ? 'Protected' : ''
                    return (
                        <div key={p.position} className="surf-hand r1-player-badge r1-glass"
                            style={{ '--r1-player-color': PLAYER_BOARD_COLORS[p.position % PLAYER_BOARD_COLORS.length] }}
                            data-current={status === 'now'} data-order-status={status}
                            data-attack-target={attacking && targets.includes(p.cellPosition)}
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
            <div className="r1-match-feedback r1-glass" aria-live="polite">
                <strong>{winner ? 'Player ' + (winner.position + 1) + ' wins!' : 'Player ' + (player.position + 1) + ' · Your turn'}</strong>
                <span>{G.message}</span>
                {G.atkDices.length > 0 && <div className="r1-dice-results" aria-label="Drop In dice results">
                    {G.atkDices.map((die, i) => <span key={i} data-result={G.defDices[i] === undefined || die === G.defDices[i] ? 'tie' : die > G.defDices[i] ? 'win' : 'loss'}>
                        {die}{G.defDices[i] !== undefined ? ' vs ' + G.defDices[i] + ' — ' +
                            (die > G.defDices[i] ? 'Defender −1' : die < G.defDices[i] ? 'Attacker −1' : 'Tie') : ' (unpaired)'}
                    </span>)}
                    {G.defDices.slice(G.atkDices.length).map((die, i) => <span key={'def-' + i}>Defender {die} (unpaired)</span>)}
                </div>}
            </div>
            {!winner && <div className="r1-hud-dock">
                {swapChoice && <div className="r1-swap-choice r1-glass" role="group" aria-label="Position conquest">
                    <strong>Player {G.pendingSwap.targetPlayerId + 1} fell!</strong>
                    <span>Take their hex instead of moving, or keep your position and continue.</span>
                    <div className="r1-action-row">
                        <button type="button" className="r1-move-button" onClick={() => resolveSwap(true)}>Swap positions</button>
                        <button type="button" onClick={() => resolveSwap(false)}>Keep position</button>
                    </div>
                </div>}
                <div className="r1-hud-context r1-glass">
                    {swapCard && <span>Position conquered. Use one remaining non-movement card or end turn.</span>}
                    {G.currentMove === 'recover' && <div className="r1-action-row">
                        <button type="button" className="r1-recover-button" onClick={() => { setSelection(null); moves.recover() }}>Recover free (1 energy)</button>
                        <span>Or use Lifeguard Float.</span>
                    </div>}
                    {detailCard && <div className="r1-card-detail" aria-live="polite">
                        <strong>{detailCard.Name}</strong><span>{descriptions[detailCard.Name]}</span>
                        {detailReason && <span className="r1-blocked-reason">{detailReason}</span>}
                        {canConfirmCard && <button type="button" className="r1-confirm-card" onClick={confirmCard}>Use card</button>}
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
                    {highlight.cellIds.length > 0 && highlightStyle && <div className="r1-target-legend">
                        <span className="r1-target-swatch" style={{ backgroundColor: highlightStyle.color }} aria-hidden="true" />
                        {highlight.preview ? 'Choose a card, attack or move.' : highlightStyle.label + ' — select a highlighted ' + (attacking ? 'opponent.' : 'hex.')}
                    </div>}
                    {targets.length > 0 && <div className="r1-targets" aria-label="Legal target hexes">
                        {targets.map(id => <button type="button" key={id}
                            aria-label={attacking ? 'Attack Player ' + (G.cells[id].player.position + 1) : 'Select hex ' + (id + 1)}
                            onClick={() => onTarget(id)}>{attacking ? 'Player ' + (G.cells[id].player.position + 1) : id + 1}</button>)}
                    </div>}
                </div>
                <div className="r1-hand-heading r1-glass">
                    <span>YOUR HAND <strong>{hand.cards.length}/5</strong></span>
                    <button type="button" onClick={() => setHandHidden(value => !value)} aria-expanded={!handHidden}>{handHidden ? 'Show cards' : 'Hide cards'}</button>
                </div>
                {!handHidden && <div className="r1-hand" aria-label={'Player ' + (hand.position + 1) + ' hand'}>
                    {hand.cards.map((card, index) => {
                        const range = R1_ATTACK_RANGE[card.Name]
                        const reason = range ? r1AttackUnavailableReason(G, ctx, range, r1CardTargets(G, ctx, index), 'card') : null
                        const playable = r1CardPlayable(G, ctx, index)
                        return <button type="button" key={card.id} title={reason || descriptions[card.Name]}
                            aria-disabled={!playable} aria-pressed={selection?.kind === 'card' && selection.index === index}
                            style={{ '--r1-fan-angle': ((index - (hand.cards.length - 1) / 2) * 3) + 'deg' }}
                            onMouseEnter={() => setInspectedId(card.id)}
                            onMouseLeave={() => setInspectedId(null)}
                            onFocus={() => setInspectedId(card.id)}
                            onBlur={() => setInspectedId(null)}
                            onClick={() => { setInspectedId(card.id); playCard(index) }}>
                            <img src={cardArt[card.Name]} alt="" className="r1-card-art" draggable="false" />
                            <strong>{card.Name}</strong><span className="r1-card-effect">{shortEffects[card.Name]}</span>
                            <span className="r1-sr-only">{descriptions[card.Name]} {reason}</span>
                        </button>
                    })}
                    {!hand.cards.length && <span className="r1-empty-hand r1-glass">No cards in hand</span>}
                </div>}
                <div className="r1-action-bar r1-glass">
                    <button type="button" className="r1-drop-button" disabled={!!dropReason}
                        aria-pressed={selection?.kind === 'drop'} aria-describedby="r1-drop-status"
                        aria-label="Attack · Drop In (2 hexes)"
                        onClick={() => { setInspectedId(null); setSelection({ kind: 'drop', diceCount: maxAttackDice }) }}>
                        <span aria-hidden="true">⚔</span> Drop In
                    </button>
                    {selection && <button type="button" className="r1-cancel-button" onClick={() => { setInspectedId(null); setSelection(null) }}>Cancel selection</button>}
                    {!selection && !swapChoice && G.currentMove !== 'recover' && <button type="button" className="r1-move-button" disabled={!canPass}
                        onClick={() => { setInspectedId(null); moves.pass() }}>{moveLabel} <span aria-hidden="true">→</span></button>}
                    <span id="r1-drop-status" role="status">{dropReason || (dropTargets.length + ' opponent(s) in range · Free attack, risk up to ' + maxAttackDice + ' energy')}</span>
                </div>
            </div>}
        </section>
    )
}
