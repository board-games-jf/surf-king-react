import { createFallMotion, targetFallMotion, stepFallMotion, sampleRiderMotion, shortestHeading, FALL_SECONDS, REMOUNT_SECONDS } from './surferMotion'

test('a loaded fallen player starts in water without replaying a fall', () => {
  expect(createFallMotion(true).value).toBe(1)
  expect(createFallMotion(false).value).toBe(0)
})

test('fall persists and remount begins only when the authoritative marker clears', () => {
  let motion = targetFallMotion(createFallMotion(), true)
  motion = stepFallMotion(motion, FALL_SECONDS / 2)
  expect(motion.value).toBeCloseTo(.5)
  expect(targetFallMotion(motion, true)).toBe(motion)
  motion = stepFallMotion(motion, FALL_SECONDS)
  expect(motion.value).toBe(1)
  motion = targetFallMotion(motion, false)
  expect(motion.value).toBe(1)
  expect(stepFallMotion(motion, REMOUNT_SECONDS).value).toBe(0)
})

test('interruption reverses from the current value; reduced motion snaps to target', () => {
  const falling = stepFallMotion(targetFallMotion(createFallMotion(), true), .3)
  const remounting = targetFallMotion(falling, false)
  expect(remounting.from).toBe(falling.value)
  expect(remounting.value).toBe(falling.value)
  expect(stepFallMotion(remounting, .1, true).value).toBe(0)
  expect(stepFallMotion(targetFallMotion(remounting, true), .01, true).value).toBe(1)
})

test('the fallen rider leaves the deck while the board remains visible', () => {
  expect(sampleRiderMotion(0, 0, 0, true)).toMatchObject({ lean: 0, side: 0, sink: 0, boardRoll: 0, travelBank: 0, travelLift: 0 })
  const fallen = sampleRiderMotion(1, .5, 0, true)
  expect(fallen.lean).toBeGreaterThan(1)
  expect(fallen.side).toBeGreaterThan(.5)
  expect(fallen.sink).toBeLessThan(0)
  expect(fallen.travelBank).toBe(0)
  expect(sampleRiderMotion(0, .5).travelBank).toBeGreaterThan(0)
  expect(shortestHeading(Math.PI - .1, -Math.PI + .1)).toBeCloseTo(Math.PI + .1)
})
