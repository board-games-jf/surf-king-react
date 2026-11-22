// Presentation-only interpolation. Authoritative snapshots always win.
export const FALL_SECONDS = .72
export const REMOUNT_SECONDS = 1.05
export const MOVE_SECONDS = .65

export const clamp01 = value => Math.min(1, Math.max(0, value))
export const ease = value => {
  const t = clamp01(value)
  return t * t * (3 - 2 * t)
}

export function createFallMotion(fallen = false) {
  const value = fallen ? 1 : 0
  return { value, from: value, to: value, elapsed: 0, duration: 0 }
}

export function targetFallMotion(motion, fallen, immediate = false) {
  const to = fallen ? 1 : 0
  if (immediate) return createFallMotion(fallen)
  if (to === motion.to) return motion
  return { value: motion.value, from: motion.value, to, elapsed: 0,
    duration: (fallen ? FALL_SECONDS : REMOUNT_SECONDS) * Math.abs(to - motion.value) }
}

export function stepFallMotion(motion, dt, reducedMotion = false) {
  if (reducedMotion || !motion.duration) return createFallMotion(motion.to === 1)
  const elapsed = Math.min(motion.duration, motion.elapsed + Math.max(0, dt))
  const value = motion.from + (motion.to - motion.from) * ease(elapsed / motion.duration)
  return { ...motion, elapsed, value }
}

export function sampleRiderMotion(fall, travel = 0, time = 0, reducedMotion = false) {
  const f = clamp01(fall)
  const moving = reducedMotion ? 0 : Math.sin(Math.PI * clamp01(travel))
  const bob = reducedMotion ? 0 : Math.sin(time * 2.6) * .025 * f
  return {
    fall: f, lean: f * Math.PI * .47, side: f * .97,
    sink: -f * .23 + bob,
    boardRoll: f * .16,
    travelBank: moving * .12 * (1 - f),
    travelLift: moving * .035 * (1 - f)
  }
}

export function shortestHeading(from, to) {
  return from + Math.atan2(Math.sin(to - from), Math.cos(to - from))
}
