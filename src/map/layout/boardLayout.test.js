import manifest from './board-layout.json'
import { BOARD_LAYOUT, BOARD_LAYOUT_VERSION, getBoardCellById, getBoardCellIdAt } from './boardLayout'

describe('Surf King engine cell to 3D layout mapping', () => {
    test('contains 53 unique engine IDs and centers', () => {
        expect(manifest.status).toBe('provisional')
        expect(BOARD_LAYOUT_VERSION).toBe(1)
        expect(BOARD_LAYOUT).toHaveLength(53)
        expect(BOARD_LAYOUT.map((cell) => cell.id)).toEqual(Array.from({ length: 53 }, (_, id) => id))
        expect(new Set(BOARD_LAYOUT.map(({ x, z }) => `${x}:${z}`)).size).toBe(53)
    })

    test('forms 15 alternating horizontal rows of 4 and 3 cells', () => {
        for (let row = 0; row < 15; row++) {
            const cells = BOARD_LAYOUT.filter((cell) => cell.row === row)
            const count = row % 2 === 0 ? 4 : 3
            expect(cells).toHaveLength(count)
            expect(cells.map((cell) => cell.column)).toEqual(Array.from({ length: count }, (_, i) => i))
            cells.forEach(({ id, column }) => expect(getBoardCellIdAt(row, column)).toBe(id))
            if (row < 14) {
                expect(cells[0].z).toBeGreaterThan(BOARD_LAYOUT.find((cell) => cell.row === row + 1).z)
            }
        }
    })

    test('places starting players offshore, four initial sharks midway and win cells at the beach', () => {
        expect(BOARD_LAYOUT.slice(0, 7).map((cell) => cell.row)).toEqual([0, 0, 0, 0, 1, 1, 1])
        expect(BOARD_LAYOUT.slice(28, 32).map((cell) => cell.row)).toEqual([8, 8, 8, 8])
        expect(BOARD_LAYOUT.slice(49, 53).map((cell) => cell.row)).toEqual([14, 14, 14, 14])
    })

    test('preserves representative engine index offsets without redefining legal moves', () => {
        for (let id = 0; id + 7 < 53; id++) {
            expect(getBoardCellById(id + 7).x).toBe(getBoardCellById(id).x)
            expect(getBoardCellById(id).z - getBoardCellById(id + 7).z)
                .toBeCloseTo(Math.sqrt(3) * manifest.hexRadius, 8)
        }
        ;[[0, 4], [1, 4], [4, 7], [4, 8]].forEach(([from, to]) => {
            expect(getBoardCellById(to).z).toBeLessThan(getBoardCellById(from).z)
            expect(getBoardCellById(to).x).not.toBe(getBoardCellById(from).x)
        })
    })

    test('rejects invalid cell and grid coordinates', () => {
        ;[-1, 53, 1.5, '0', null].forEach((id) => expect(getBoardCellById(id)).toBeNull())
        ;[[-1, 0], [15, 0], [0, 4], [1, 3], [0, -1], [0.5, 0]].forEach(([row, column]) =>
            expect(getBoardCellIdAt(row, column)).toBeNull()
        )
    })
})
