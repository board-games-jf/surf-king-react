// Presentation-only interpolation. Authoritative snapshots always win.
export const FALL_SECONDS = 1.08
export const REMOUNT_SECONDS = 1.35
export const MOVE_SECONDS = .95

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
  if (reducedMotion) return motion.value === motion.to ? motion : createFallMotion(motion.to === 1)
  if (!motion.duration || motion.elapsed >= motion.duration) return motion
  const elapsed = Math.min(motion.duration, motion.elapsed + Math.max(0, dt))
  const value = motion.from + (motion.to - motion.from) * ease(elapsed / motion.duration)
  return { ...motion, elapsed, value }
}

export function sampleRiderMotion(fall, travel = 0, time = 0, reducedMotion = false, bank = 0) {
  const f = clamp01(fall)
  const riding = 1 - f
  const moving = reducedMotion ? 0 : Math.sin(Math.PI * clamp01(travel))
  const wobble = Math.sin(Math.PI * f)
  // Preserve the initial stumble. Only the last phase enters the water.
  const immersion = ease((f - .58) / .42)
  const boardRise = ease((f - .62) / .38)
  const carve = reducedMotion ? 0 : Math.max(-1, Math.min(1,
    bank / .19 + Math.sin(time * 1.6) * .16))
  return {
    fall: f, lean: -.24 * f + .36 * wobble,
    immersion, boardRise,
    side: 0, sink: 0,
    boardRoll: reducedMotion ? 0 : (Math.sin(3 * Math.PI * f) * wobble * .13 + f * .025) * (1 - boardRise),
    floatBob: reducedMotion ? 0 : Math.sin(time * 2.2) * .018 * immersion,
    travelBank: carve * riding,
    travelLift: moving * .035 * riding
  }
}

export function shortestHeading(from, to) {
  return from + Math.atan2(Math.sin(to - from), Math.cos(to - from))
}

// Carving is a visual offset, never an alteration of the destination cell.
// Travel follows an S curve with zero offset and zero lateral velocity at
// either endpoint. Idle carving is blended out at mid-travel and back in.
export function sampleCarve(travel = 1, time = 0, distance = 0, fall = 0, reducedMotion = false) {
  const t = clamp01(travel)
  const progress = ease(t)
  const riding = 1 - clamp01(fall)
  if (reducedMotion) return { progress: 1, idle: 0, idleForward: 0, travel: 0, yaw: 0, bank: 0, lift: 0 }
  const envelope = Math.sin(Math.PI * progress) ** 2
  const phase = time * 2.1
  const idleWave = Math.sin(phase)
  const travelWave = Math.sin(2 * Math.PI * progress)
  const amplitude = Math.min(.26, Math.max(0, distance) * .12)
  const idle = idleWave * .075 * (1 - envelope) * riding
  const lateral = travelWave * envelope * amplitude * riding
  const slope = amplitude * Math.PI * (2 * Math.cos(2 * Math.PI * progress) * envelope + travelWave ** 2)
  const tangentYaw = distance > 1e-6 ? Math.max(-.22, Math.min(.22, -Math.atan2(slope, distance))) : 0
  const yaw = (Math.cos(phase) * (1 - envelope) * .105 + tangentYaw) * riding
  return { progress, idle, idleForward: Math.sin(phase * 2) * .032 * (1 - envelope) * riding,
    travel: lateral, yaw,
    bank: -yaw * .81, lift: envelope * .025 * riding }
}
