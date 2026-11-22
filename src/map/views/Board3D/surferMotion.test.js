import { createFallMotion, targetFallMotion, stepFallMotion, sampleRiderMotion, sampleCarve, shortestHeading, FALL_SECONDS, REMOUNT_SECONDS } from './surferMotion'

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

test('idle carving is bounded within one cell and changes direction continuously', () => {
  const samples = Array.from({length: 100}, (_, i) => sampleCarve(1, i / 20, 0))
  expect(samples.every(s => Math.abs(s.idle) <= .075 && Math.abs(s.idleForward) <= .032 && Math.abs(s.travel) < 1e-12)).toBe(true)
  expect(samples.some(s => s.idle > .05)).toBe(true)
  expect(samples.some(s => s.idle < -.05)).toBe(true)
  expect(samples.some(s => s.bank > .05)).toBe(true)
  expect(samples.some(s => s.bank < -.05)).toBe(true)
})

test('travel accelerates and brakes, makes two opposite bends and lands at the cell centerline', () => {
  const start = sampleCarve(0, 0, 2.4)
  const first = sampleCarve(.35, 0, 2.4)
  const second = sampleCarve(.65, 0, 2.4)
  const end = sampleCarve(1, 0, 2.4)
  expect(start.progress).toBe(0)
  expect(end.progress).toBe(1)
  expect(Math.abs(start.travel)).toBeLessThan(1e-10)
  expect(Math.abs(end.travel)).toBeLessThan(1e-10)
  expect(first.travel).toBeGreaterThan(.08)
  expect(second.travel).toBeLessThan(-.08)
  expect(sampleCarve(.1).progress).toBeLessThan(.1)
  expect(sampleCarve(.9).progress).toBeGreaterThan(.9)
  expect(sampleCarve(.6).progress - sampleCarve(.4).progress).toBeGreaterThan(sampleCarve(.2).progress)
})

test('carving stops in the water or under reduced motion', () => {
  expect(Object.values(sampleCarve(.35, 2, 2, 1)).slice(1).every(v => v === 0)).toBe(true)
  expect(sampleCarve(.35, 2, 2, 0, true)).toEqual({ progress: 1, idle: 0, idleForward: 0, travel: 0, yaw: 0, bank: 0, lift: 0 })
})
