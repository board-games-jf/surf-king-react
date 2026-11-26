import { getMixedTargetBorderPaths } from './targetHighlight'

test.each([.5, 1, 3])('mixed perimeter at radius %s covers six edges without overlap', radius => {
    const [first, second] = getMixedTargetBorderPaths(radius)
    expect(first).toHaveLength(4)
    expect(second).toHaveLength(4)
    expect(first[3]).toEqual(second[0])
    expect(second[3]).toEqual(first[0])
    const vertices = [...first.slice(0, 3), ...second.slice(0, 3)]
    expect(new Set(vertices.map(p => p.join(','))).size).toBe(6)
    for (const path of [first, second]) {
        path.forEach(p => expect(Math.hypot(...p)).toBeCloseTo(radius))
        path.slice(1).forEach((p, i) => expect(Math.hypot(p[0] - path[i][0], p[1] - path[i][1])).toBeCloseTo(radius))
    }
})
