// Presentation only: preserve the engine's fixed shuffled order and completed count.
export function getR1RoundOrder(G, ctx) {
    return G.order.map((id, slot) => {
        const status = slot < G.completedInRound ? 'played' :
            G.winner == null && String(id) === String(ctx.currentPlayer) ? 'now' : 'next'
        return { id, status }
    })
}
