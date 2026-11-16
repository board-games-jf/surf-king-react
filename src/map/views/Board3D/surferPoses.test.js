import { SURFER_POSES, normalizeSurferPose, sampleSurferPose } from './surferPoses'

describe('authored-GLB rig pose presets', () => {
  test('exposes the three intentionally distinct, cosmetic-only stances', () => {
    expect(SURFER_POSES).toEqual(['standing', 'relaxed', 'surfing'])
    expect(normalizeSurferPose('invalid')).toBe('relaxed')
    expect(normalizeSurferPose('surfing')).toBe('surfing')
    const standing = sampleSurferPose('standing', 0, true)
    const relaxed = sampleSurferPose('relaxed', 0, true)
    const surfing = sampleSurferPose('surfing', 0, true)
    expect(standing.upperarm_l[2]).toBeLessThan(-1.1)
    expect(standing.upperarm_r[2]).toBeGreaterThan(1.1)
    expect(relaxed.upperarm_l).not.toEqual(standing.upperarm_l)
    expect(surfing.calf_l[0]).toBeLessThan(-.3)
    expect(surfing.thigh_r[0]).toBeGreaterThan(.2)
    expect(surfing.lowerarm_l).not.toEqual(relaxed.lowerarm_l)
  })

  test.each(SURFER_POSES)('keeps %s finite, repeatable and still with reduced motion', pose => {
    const staticPose = sampleSurferPose(pose, 0, true)
    expect(sampleSurferPose(pose, 100, true)).toEqual(staticPose)
    for (const time of [0, .5, 8.4, 101.5]) {
      const bones = sampleSurferPose(pose, time)
      expect(Object.keys(bones).length).toBeGreaterThan(5)
      Object.values(bones).forEach(xyz => {
        expect(xyz).toHaveLength(3)
        expect(xyz.every(Number.isFinite)).toBe(true)
      })
    }
  })

  test('surfing balances an asymmetric front and trailing leg without changing rest poses', () => {
    const stance = sampleSurferPose('surfing', 0, true)
    const still = sampleSurferPose('surfing', 16, true)
    expect(stance).toEqual(still)
    expect(stance.thigh_l[0]).toBeGreaterThan(stance.thigh_r[0])
    expect(stance.calf_l[0]).toBeLessThan(stance.calf_r[0])
    expect(stance.upperarm_l[2]).not.toBeCloseTo(-stance.upperarm_r[2])
    expect(stance.spine_02[1]).not.toBe(0)
    expect(stance.pelvis[1]).not.toBe(0)
    expect(sampleSurferPose('standing', 0, true).thigh_l).toEqual([0, 0, 0])
  })

  test('surfing has bounded breathing/balance changes without posing drift', () => {
    const first = sampleSurferPose('surfing', 0)
    const later = sampleSurferPose('surfing', 1.6)
    expect(first.spine_02).not.toEqual(later.spine_02)
    expect(Math.abs(first.spine_02[2] - later.spine_02[2])).toBeLessThan(.10)
    expect(Math.abs(first.thigh_l[0] - later.thigh_l[0])).toBeLessThan(.03)
    expect(sampleSurferPose('surfing', 1.6)).toEqual(later)
  })
})
