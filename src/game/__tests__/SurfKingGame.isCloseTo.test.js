import { isCloseTo } from '../SurfKingGame'

describe('SurfKingGame isCloseTo', () => {
    it('Forward', () => {
        expect(isCloseTo(0, 7)).toBeTruthy()
    })

    it('Backward', () => {
        expect(isCloseTo(7, 0)).toBeTruthy()
    })

    it('Forward right', () => {
        expect(isCloseTo(0, 4)).toBeTruthy()
    })

    it('Backward right', () => {
        expect(isCloseTo(4, 0)).toBeTruthy()
    })

    it('Forward left', () => {
        expect(isCloseTo(1, 4)).toBeTruthy()
    })

    it('Backward left', () => {
        expect(isCloseTo(4, 1)).toBeTruthy()
    })

    it('Invalids', () => {
        expect(isCloseTo(0, 14)).toBeFalsy()
        expect(isCloseTo(14, 0)).toBeFalsy()
        expect(isCloseTo(0, 8)).toBeFalsy()
        expect(isCloseTo(8, 0)).toBeFalsy()
        expect(isCloseTo(1, 7)).toBeFalsy()
        expect(isCloseTo(7, 1)).toBeFalsy()
    })
})
