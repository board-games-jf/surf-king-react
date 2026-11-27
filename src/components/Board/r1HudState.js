// Presentation only: a phase change is not evidence of card use.
export function getCardRailState(G, ctx, available) {
    if (available) return 'available'
    const event = G.cardVisualEvent
    const used = event && String(event.playerId) === String(ctx.currentPlayer) &&
        event.round === G.turn && event.turnSlot === G.completedInRound
    return used ? 'used' : 'unavailable'
}
export function getRoundHudProgress(order) {
    const completed = order.filter(player => player.status === 'played').length
    const active = order.findIndex(player => player.status === 'now')
    return { completed, current: active >= 0 ? active + 1 : completed, total: order.length }
}
export const TURN_STATUS_LABELS = { played: 'Turn completed', now: 'Playing now', next: 'Waiting' }
export const CARD_RAIL_LABELS = { available: 'Available', unavailable: 'Unavailable', used: 'Used' }
