// Presentation only: preserve the engine's actual cyclic order and completed count.
export function getR1RoundOrder(G, ctx) {
    const count = Object.keys(G.players).length
    return Array.from({ length: count }, (_, slot) => {
        const id = (G.firstPlayer + slot) % count
        const status = slot < G.completedInRound ? 'played' :
            G.winner == null && String(id) === String(ctx.currentPlayer) ? 'now' : 'next'
        return { id, status }
    })
}
