import React from 'react'
import {
    r1CardPlayable, r1CardTargets, r1DropTargets, r1MoveTargets, isBeach,
} from '../../game/r1/SurfKingR1'
import { getR1RoundOrder } from './r1RoundOrder'
import cardArt0 from '../../assets/cards/energyx2.png'
import cardArt1 from '../../assets/cards/lifeguardfloat.png'
import cardArt2 from '../../assets/cards/bigwave.png'
import cardArt3 from '../../assets/cards/sunburn.png'
import cardArt4 from '../../assets/cards/storm.png'
import cardArt5 from '../../assets/cards/cyclone.png'
import cardArt6 from '../../assets/cards/island.png'
import cardArt7 from '../../assets/cards/jumping.png'
import cardArt8 from '../../assets/cards/amulet.png'
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
    'Surf Current': surfCurrentArt,
}


const descriptions = {
    'Energy x2': 'Gain 2 energy (max 5).',
    'Lifeguard float': 'Recover with 3 energy.',
    'Big wave': 'Opponent within 2 edges loses 2 energy.',
    Sunburn: 'Opponent within 3 edges loses 1 energy.',
    Storm: 'Place on any free course hex; entry costs 1 energy.',
    Cyclone: 'Place on any free course hex; entry redirects to a random free neighboring hex.',
    Island: 'Place on any free course hex; first ordinary entrant gains 2 energy.',
    Jumping: 'Land on an adjacent hazard, stay there and ignore its effect.',
    Amulet: 'Protect against opponent attacks until your next turn.',
    'Surf Current': 'Move up to two legal steps; draw only once.',
}
export const r1SelectionTargets = (G, ctx, selection) => selection?.kind === 'card'
    ? r1CardTargets(G, ctx, selection.index)
    : selection?.kind === 'drop' ? r1DropTargets(G, ctx) : r1MoveTargets(G, ctx)

export default function R1Controls({ G, ctx, moves, selection, setSelection, onTarget }) {
    const player = G.players[ctx.currentPlayer]
    const roundOrder = getR1RoundOrder(G, ctx)
    const overflow = G.currentMove === 'discard'
    const hand = overflow ? G.players[G.overflowPlayer] : player
    const targets = r1SelectionTargets(G, ctx, selection)
    const canPass = G.currentMove === 'use_card' || G.currentMove === 'current_second' ||
        (G.currentMove === 'maneuver' && targets.length === 0)
    const winner = G.winner !== null ? G.players[G.winner] : null
    function playCard(index) {
        if (overflow) { moves.discardOverflow(index); return }
        if (!r1CardPlayable(G, ctx, index)) return
        if (r1CardTargets(G, ctx, index).length) setSelection({ kind: 'card', index })
        else { setSelection(null); moves.useCard(index) }
    }
    return (
        <section className="surf-hud" aria-label="R1 match controls">
            <div className="surf-turn">
                <strong aria-live="polite">{winner ? 'Player ' + (winner.position + 1) + ' wins!' :
                    'R1 pilot · Round ' + G.turn + ' · Player ' + (player.position + 1)}</strong>
                {!winner && <span>{G.currentMove.replace(/_/g, ' ')}</span>}
                {!winner && G.turn === 1 && <span>No attacks this round</span>}
            </div>
            <div aria-live="polite">{G.message}</div>
            {G.atkDices.length > 0 && <div>Drop In dice: {G.atkDices.join(', ')} vs {G.defDices.join(', ')}</div>}
            <div className="surf-hands r1-round-order" aria-label="Round play order">
                {roundOrder.map(({ id, status }, slot) => {
                    const p = G.players[id]
                    return (
                    <div key={p.position} className="surf-hand" data-current={status === 'now'} data-order-status={status} aria-current={status === 'now' ? 'step' : undefined}>
                        <strong>{slot + 1}. Player {p.position + 1}</strong>
                        <span className="r1-order-status">{status === 'now' ? 'NOW' : status === 'played' ? 'Played' : 'Up next'}</span>
                        <div>{p.energy}/5 energy · {p.cards.length} cards</div>
                        <div>{isBeach(p.cellPosition) ? 'Finished' : p.energy === 0 ? 'Fallen' :
                            p.activeCard.length ? 'Protected' : ''}</div>
                    </div>
                    )
                })}
            </div>
            {!winner && <div>
                {overflow && <strong>Player {hand.position + 1}: choose one card to discard.</strong>}
                {G.currentMove === 'recover' && <div className="surf-turn">
                    <button type="button" onClick={() => moves.recover()}>Recover free (1 energy)</button>
                    <span>Or use Lifeguard Float.</span>
                </div>}
                <div className="r1-hand" aria-label={'Player ' + (hand.position + 1) + ' hand'}>
                    {hand.cards.map((card, index) => (
                        <button type="button" key={card.id} title={descriptions[card.Name]}
                            disabled={!overflow && !r1CardPlayable(G, ctx, index)}
                            aria-pressed={selection?.kind === 'card' && selection.index === index}
                            onClick={() => playCard(index)}>
                            <img src={cardArt[card.Name]} alt="" className="r1-card-art" />
                            <strong>{card.Name}</strong><span>{descriptions[card.Name]}</span>
                        </button>
                    ))}
                </div>
                <div className="surf-turn">
                    {r1DropTargets(G, ctx).length > 0 &&
                        <button type="button" aria-pressed={selection?.kind === 'drop'}
                            onClick={() => setSelection({ kind: 'drop' })}>Drop In</button>}
                    {selection && <button type="button" onClick={() => setSelection(null)}>Cancel selection</button>}
                    {canPass && !selection && <button type="button" onClick={() => moves.pass()}>
                        {G.currentMove === 'use_card' ? 'No tactic — move' :
                            G.currentMove === 'current_second' ? 'Finish movement' : 'No legal move — end turn'}
                    </button>}
                    {targets.length > 0 && <span>Select a highlighted hex on the map.</span>}
                </div>
                {targets.length > 0 && <div className="r1-targets" aria-label="Legal target hexes">
                    {targets.map(id => <button type="button" key={id}
                        aria-label={'Select hex ' + (id + 1)} onClick={() => onTarget(id)}>{id + 1}</button>)}
                </div>}
            </div>}
        </section>
    )
}
