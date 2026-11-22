import { createFallMotion, targetFallMotion, stepFallMotion, sampleRiderMotion, sampleRemount, sampleCarve, shortestHeading, FALL_SECONDS, REMOUNT_SECONDS } from './surferMotion'

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

test('loss of balance remains in place and changes direction before settling', () => {
  const normal = sampleRiderMotion(0, 1, 0, true)
  expect(normal).toMatchObject({ lean: 0, side: 0, sink: 0, boardRoll: 0, travelBank: 0, travelLift: 0 })
  const stumble = sampleRiderMotion(.35, 1, 0)
  const fallen = sampleRiderMotion(1, 1, 0)
  expect(stumble.lean).toBeGreaterThan(.1)
  expect(fallen.lean).toBeLessThan(-.1)
  for (let i = 0; i <= 100; i++) {
    const sample = sampleRiderMotion(i / 100, .5, 2)
    expect(sample.side).toBe(0)
    expect(sample.sink).toBe(0)
    expect(Math.abs(sample.boardRoll)).toBeLessThan(.16)
  }
  expect(fallen.travelBank === 0).toBe(true)
  expect(sampleRiderMotion(0, .5, 0, false, .16).travelBank).toBeGreaterThan(.7)
  expect(sampleRiderMotion(0, .5, 0, false, -.16).travelBank).toBeLessThan(-.7)
  expect(sampleRiderMotion(0, .5, 0, true, .16).travelBank).toBe(0)
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

test('water entry and board rise start only after the initial imbalance', () => {
  for (const f of [0, .24, .58]) {
    expect(sampleRiderMotion(f).immersion).toBe(0)
    expect(sampleRiderMotion(f).boardRise).toBe(0)
  }
  const entry = sampleRiderMotion(.80, 1, 0)
  expect(entry.immersion).toBeGreaterThan(0)
  expect(entry.immersion).toBeLessThan(1)
  expect(entry.boardRise).toBeGreaterThan(0)
  expect(entry.boardRise).toBeLessThan(entry.immersion)
  expect(sampleRiderMotion(1, 1, 2, true)).toMatchObject({
    immersion: 1, boardRise: 1, floatBob: 0, travelBank: 0
  })
})

test('full water recovery uses a separate sequence while interrupted transitions remain continuous', () => {
  const recovery = targetFallMotion(createFallMotion(true), false)
  expect(recovery.remount).toBe(true)
  const mid = stepFallMotion(recovery, REMOUNT_SECONDS / 2)
  expect(mid.remount).toBe(true)
  const interrupted = targetFallMotion(mid, true)
  expect(interrupted.remount).toBe(true)
  expect(interrupted.value).toBe(mid.value)
  expect(stepFallMotion(interrupted, FALL_SECONDS).remount).toBe(false)
  expect(stepFallMotion(recovery, REMOUNT_SECONDS).remount).toBe(false)
  expect(stepFallMotion(recovery, .1, true).remount).toBe(false)
})

test('board flattens before the rider rises, and both hands release after mounting', () => {
  const water = sampleRemount(0, 0)
  expect(water).toMatchObject({ immersion: 1, boardRise: 1, riderAside: 1, boardAside: 1, handContact: 0 })
  const press = sampleRemount(.30, 0)
  expect(press.boardRise).toBe(0)
  expect(press.immersion).toBeGreaterThan(.9)
  expect(press.handContact).toBeCloseTo(1)
  expect(sampleRemount(.5, 0).immersion).toBeGreaterThan(sampleRiderMotion(.5, 1, 0).immersion)
  const crouch = sampleRemount(.74, 0)
  expect(crouch.immersion).toBe(0)
  expect(crouch.riderAside).toBe(0)
  const riding = sampleRemount(1, 0)
  expect(riding).toMatchObject({ immersion: 0, boardRise: 0, riderAside: 0, boardAside: 0, handContact: 0 })
  expect(sampleRemount(.2, 0, true)).toEqual(riding)
})
