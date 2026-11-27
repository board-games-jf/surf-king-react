import { getDropInAdvantage } from './r1DropInOdds'
test.each([[2,1,1,15,6,15,0,6],[2,2,1,55,36,125,0,36],[3,1,2,125,36,55,0,36],[3,2,2,515,266,515,200,66]])(
    'exact pairwise odds %i/%i energy, %i attack dice', (a,d,n,f,b,u,m,z) => {
        const result = getDropInAdvantage(a,d,n)
        expect(result).toMatchObject({favorable:f,balanced:b,unfavorable:u,mutual:m,noDamage:z,maxLoss:Math.min(n,d)})
        expect(result.position).toBeCloseTo(f/(f+u))
    })
test('energy caps and directional classifications', () => {
    expect(getDropInAdvantage(2,2,2)).toBeNull()
    expect(getDropInAdvantage(1,2,1)).toBeNull()
    expect(getDropInAdvantage(3,0,1)).toBeNull()
    expect(getDropInAdvantage(3,2,0)).toBeNull()
    expect(getDropInAdvantage(2,2,1).tone).toBe('unfavorable')
    expect(getDropInAdvantage(5,5,2).tone).toBe('balanced')
    expect(getDropInAdvantage(3,1,2).tone).toBe('favorable')
})
