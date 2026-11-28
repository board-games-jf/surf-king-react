import { getDropInAdvantage } from './r1DropInOdds'
test.each([[2,1,1,15,6,15,0,6],[2,2,1,55,36,125,0,36],[3,1,2,125,36,55,0,36],[3,2,2,515,266,515,200,66]])(
    'exact pairwise odds %i/%i energy, %i attack dice', (a,d,n,f,b,u,m,z) => {
        const result = getDropInAdvantage(a,d,n)
        expect(result).toMatchObject({favorable:f,balanced:b,unfavorable:u,mutual:m,noDamage:z,maxLoss:Math.min(n,d)})
    })
test.each([
    [2, 1, 1, .5], [2, 2, 1, 11 / 72], [3, 2, 1, 3013 / 7776],
    [3, 2, 2, .5], [3, 1, 2, 61 / 72], [3, 5, 2, 39912662939 / 347282443008],
    [5, 5, 2, 3910943247919141 / 10508072160536064],
])('cumulative knockdown chance with %i/%i energy and %i first-roll dice', (a, d, dice, expected) => {
    expect(getDropInAdvantage(a, d, dice).position).toBeCloseTo(expected, 10)
})
test('energy caps and directional classifications', () => {
    expect(getDropInAdvantage(2,2,2)).toBeNull()
    expect(getDropInAdvantage(1,2,1)).toBeNull()
    expect(getDropInAdvantage(3,0,1)).toBeNull()
    expect(getDropInAdvantage(3,2,0)).toBeNull()
    expect(getDropInAdvantage(2,2,1).tone).toBe('unfavorable')
    expect(getDropInAdvantage(5,5,2).tone).toBe('unfavorable')
    expect(getDropInAdvantage(3,1,2).tone).toBe('favorable')
})
