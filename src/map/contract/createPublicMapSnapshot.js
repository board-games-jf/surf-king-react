// Expose only the information required to draw the map: no cards or deck contents.
export function createPublicMapSnapshot(G, ctx, selectedCellId = null) {
    if (!G || !Array.isArray(G.cells) || G.cells.length !== 53) {
        throw new Error('Surf King map requires exactly 53 game cells')
    }
    const stoneTurns = new Map()
    Object.values(G.players || {}).forEach((player) => {
        ;(player.activeCard || []).forEach((card) => {
            if (card.Name === 'Stone' && Number.isInteger(card.CellPosition)) {
                stoneTurns.set(card.CellPosition, card.RemaningTurn ?? null)
            }
        })
    })
    return {
        cells: G.cells.map((cell, id) => ({
            id,
            obstacleType: cell?.obstacle?.Name || null,
            remainingTurns: stoneTurns.get(id) ?? null,
        })),
        players: Object.values(G.players || {}).map((player) => ({
            id: String(player.position),
            cellId: Number.isInteger(player.cellPosition) && player.cellPosition >= 0 && player.cellPosition < 53
                ? player.cellPosition : null,
        })),
        turn: G.turn,
        activePlayerId: ctx?.currentPlayer == null ? null : String(ctx.currentPlayer),
        selectedCellId: Number.isInteger(selectedCellId) && selectedCellId >= 0 && selectedCellId < 53
            ? selectedCellId : null,
    }
}
