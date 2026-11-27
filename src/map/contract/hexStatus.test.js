import { getHexStatus, sampleHexDanger } from './hexStatus'
const status = (overrides = {}) => getHexStatus({ id: 7, terrain: null, count: 0, capacity: 2, energy: 3, ...overrides })
test('terrain danger and capacity never erase independently legal actions', () => {
    const move = { kind: 'move', cellIds: [7] }
    expect(status({ terrain: 'Shark', energy: 2, highlight: move })).toMatchObject({ danger: true, activeDanger: true, lethal: true, entryDamage: 2, blocked: false })
    expect(status({ terrain: 'Storm', highlight: move })).toMatchObject({ danger: true, lethal: false, entryDamage: 1 })
    expect(status({ terrain: 'Cyclone', highlight: move })).toMatchObject({ danger: true, entryDamage: 0, lethal: false })
    expect(status({ terrain: 'Island', highlight: move }).danger).toBe(false)
    expect(status({ terrain: 'Shark', highlight: { kind: 'jump', cellIds: [7] } }).danger).toBe(false)
    expect(status({ count: 2, highlight: { kind: 'move', cellIds: [], attackCellIds: [7] } })).toMatchObject({ full: true, blocked: false })
    expect(status({ count: 2 })).toMatchObject({ full: true, blocked: true })
    expect(status({ highlight: { kind: 'attack', cellIds: [7], blocked: [{ id: 7 }] } }).blocked).toBe(false)
    expect(status({ highlight: { kind: 'attack', cellIds: [], blocked: [{ id: 7 }] } }).blocked).toBe(true)
    expect(status().blocked).toBe(false)
})
test('danger pulses locally with a static reduced-motion alternative', () => {
    expect(sampleHexDanger(.9, false).opacity).toBeGreaterThan(sampleHexDanger(0, false).opacity)
    expect(sampleHexDanger(.9, false).scale).toBeGreaterThan(sampleHexDanger(0, false).scale)
    expect(sampleHexDanger(1.8, false)).toEqual(sampleHexDanger(0, false))
    expect(sampleHexDanger(.2, true)).toEqual(sampleHexDanger(1.1, true))
})
