import {
    R1_PLACEMENT_RANGE, DROP_IN_RANGE, r1CardTargets, r1DropTargets, r1MoveTargets, r1AttackTargetBlocks, r1PlayerCard, r1CardPlayerTargets, r1DropPlayerTargets,
} from '../../game/r1/SurfKingR1'

import { getR1CardFeedback } from './r1CardFeedback'

export const r1SelectionPlayerTargets = (G, ctx, selection) => {
    if (G.winner != null) return []
    if (selection?.kind === 'drop') return r1DropPlayerTargets(G, ctx)
    if (selection?.kind === 'card') return r1CardPlayerTargets(G, ctx, selection.index)
    return []
}
export const r1SelectionTargets = (G, ctx, selection) => {
    if (G.winner != null) return []
    if (selection?.kind === 'card') return r1CardTargets(G, ctx, selection.index)
    if (selection?.kind === 'drop') return r1DropTargets(G, ctx)
    return r1MoveTargets(G, ctx)
}

// Before the optional card is skipped, preview the same engine movement query
// in the maneuver phase without mutating the actual state or enabling a move.
export function getR1TargetHighlight(G, ctx, selection, previewCardId = null) {
    if (G.winner != null) return { kind: 'move', cellIds: [], preview: false }
    // Hover is read-only and cannot replace a committed selection.
    if (!selection && previewCardId != null && ['use_card', 'swap_card', 'recover'].includes(G.currentMove)) {
        const index = G.players[ctx.currentPlayer]?.cards.findIndex(c => c.id === previewCardId)
        const feedback = getR1CardFeedback(G, ctx, index)
        if (feedback) return withBlocks({ kind: feedback.kind, cellIds: feedback.previewIds, preview: true }, feedback.blocked, feedback.playerIds)
    }
    const name = selection?.kind === 'card' ? G.players[ctx.currentPlayer]?.cards[selection.index]?.Name : null
    const kind = selection?.kind === 'drop' || r1PlayerCard(name) ? 'attack' :
        R1_PLACEMENT_RANGE[name] ? 'placement' : name === 'Jumping' ? 'jump' : 'move'
    const preview = !selection && G.currentMove === 'use_card'
    const cellIds = preview ? r1MoveTargets({ ...G, currentMove: 'maneuver' }, ctx) :
        r1SelectionTargets(G, ctx, selection)
    if (selection?.kind === 'card') {
        const feedback = getR1CardFeedback(G, ctx, selection.index)
        if (feedback) return withBlocks({ kind, cellIds: cellIds.length ? cellIds : feedback.previewIds,
            preview: cellIds.length === 0 && feedback.previewIds.length > 0 }, feedback.blocked)
    }
    if (selection?.kind === 'drop') return withBlocks({ kind, cellIds, preview },
        r1AttackTargetBlocks(G, ctx, DROP_IN_RANGE, cellIds, 'drop', r1DropPlayerTargets(G, ctx)), r1DropPlayerTargets(G, ctx))
    return { kind, cellIds, preview }
}

function withBlocks(highlight, blocked, playerIds) {
    return { ...highlight, ...(blocked?.length ? { blocked } : {}), ...(playerIds?.length ? { playerIds } : {}) }
}
