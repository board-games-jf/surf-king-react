import manifest from './board-layout.json'

// This manifest maps game-engine IDs to 3D board coordinates.
// Its geometry is provisional until checked against the approved design.
export const BOARD_LAYOUT = manifest.cells
export const BOARD_LAYOUT_VERSION = manifest.version

export const getBoardCellById = (cellId) =>
    Number.isInteger(cellId) && cellId >= 0 && cellId < BOARD_LAYOUT.length ? BOARD_LAYOUT[cellId] : null

export const getBoardCellIdAt = (row, column) => {
    if (!Number.isInteger(row) || !Number.isInteger(column) || row < 0 || row > 14) return null
    const rowLength = row % 2 === 0 ? 4 : 3
    if (column < 0 || column >= rowLength) return null
    return Math.floor(row / 2) * 7 + (row % 2 === 0 ? column : column + 4)
}
