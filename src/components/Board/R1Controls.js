import React from 'react'
import {
    r1CardPlayable, r1CardTargets, r1DropTargets, r1MoveTargets, isBeach,
} from '../../game/r1/SurfKingR1'

const descriptions = {
    'Energy x2': 'Gain 2 energy (max 5).',
    'Lifeguard float': 'Recover with 3 energy.',
    'Big wave': 'Opponent within 2 edges loses 2 energy.',
    Sunburn: 'Opponent within 3 edges loses 1 energy.',
    Storm: 'Place within 2 edges; entry costs 1 energy.',
    Cyclone: 'Place within 2 edges; entry redirects to a random free neighboring hex.',
    Island: 'Place within 2 edges; first ordinary entrant gains 2 energy.',
    Jumping: 'Land on an adjacent hazard, stay there and ignore its effect.',
    Amulet: 'Protect against opponent attacks until your next turn.',
    'Surf Current': 'Move up to two legal steps; draw only once.',
}
export const r1SelectionTargets = (G, ctx, selection) => selection?.kind === 'card'
    ? r1CardTargets(G, ctx, selection.index)
    : selection?.kind === 'drop' ? r1DropTargets(G, ctx) : r1MoveTargets(G, ctx)

export default function R1Controls({ G, ctx, moves, selection, setSelection, onTarget }) {
    const player = G.players[ctx.currentPlayer]
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
            <div className="surf-hands">
                {Object.values(G.players).map(p => (
                    <div key={p.position} className="surf-hand" data-current={p.position === player.position}>
                        <strong>Player {p.position + 1}</strong>
                        <div>{p.energy}/5 energy · {p.cards.length} cards</div>
                        <div>{isBeach(p.cellPosition) ? 'Finished' : p.energy === 0 ? 'Fallen' :
                            p.activeCard.length ? 'Protected' : ''}</div>
                    </div>
                ))}
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
