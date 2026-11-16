// Cosmetic pose previews only. These values never enter boardgame.io state.
export const SURFER_POSES = Object.freeze(['standing', 'relaxed', 'surfing'])

const REST_POSES = Object.freeze({
  standing: {
    spine_02: [0, 0, 0], spine_03: [0, 0, 0],
    upperarm_l: [0, 0, -1.28], upperarm_r: [0, 0, 1.28],
    lowerarm_l: [0, 0, -.12], lowerarm_r: [0, 0, .12],
    thigh_l: [0, 0, 0], thigh_r: [0, 0, 0],
    calf_l: [0, 0, 0], calf_r: [0, 0, 0]
  },
  relaxed: {
    spine_02: [.018, 0, .02], spine_03: [.012, 0, -.014],
    upperarm_l: [-.06, 0, -1.03], upperarm_r: [.08, 0, 1.22],
    lowerarm_l: [0, 0, -.28], lowerarm_r: [0, 0, .24],
    thigh_l: [.035, 0, -.035], thigh_r: [0, 0, .045],
    calf_l: [-.055, 0, 0], calf_r: [-.08, 0, 0]
  },
  surfing: {
    // A low, staggered stance: the front knee drives forward while the
    // trailing leg and opposing arms counterbalance the board's direction.
    spine_01: [.055, -.07, -.025], spine_02: [.085, -.12, .055],
    spine_03: [-.035, .10, -.025], pelvis: [.115, .11, -.025],
    // Keep arms raised for balance rather than hanging beside the body.
    upperarm_l: [-.36, -.24, -.24], upperarm_r: [.28, .22, .26],
    lowerarm_l: [-.16, .08, -.22], lowerarm_r: [-.12, -.08, .29],
    // A lower, staggered stance needs visibly flexed hips and knees.
    thigh_l: [.62, -.06, -.15], thigh_r: [.46, .08, .12],
    calf_l: [-.86, .02, .06], calf_r: [-.67, -.02, -.06],
    foot_l: [.22, 0, .03], foot_r: [.14, 0, -.03]
  }
})

export function normalizeSurferPose(pose, fallback = 'relaxed') {
  return SURFER_POSES.includes(pose) ? pose : fallback
}

// Map of local bone Euler offsets from each GLB's original binding pose.
// The original skeleton is never modified permanently, and reduced-motion
// users get the same readable stance without periodic motion.
export function sampleSurferPose(pose, elapsed = 0, reducedMotion = false) {
  const stance = normalizeSurferPose(pose)
  const t = Number.isFinite(elapsed) ? elapsed : 0
  const motion = reducedMotion ? 0 : 1
  const breath = Math.sin(t * 1.07) * .015 * motion
  const balance = Math.sin(t * .88) * .045 * motion
  const offsets = Object.fromEntries(
    Object.entries(REST_POSES[stance]).map(([name, xyz]) => [name, [...xyz]])
  )
  if (offsets.spine_02) {
    offsets.spine_02[0] += breath
    offsets.spine_02[2] += balance * (stance === 'surfing' ? 1 : .22)
  }
  if (offsets.upperarm_l) offsets.upperarm_l[2] += balance * (stance === 'surfing' ? .9 : .12)
  if (offsets.upperarm_r) offsets.upperarm_r[2] += balance * (stance === 'surfing' ? -.8 : -.12)
  if (stance === 'surfing') {
    // The torso leads the adjustment; the trailing knee and arms respond with
    // smaller phase-shifted offsets. No changes accumulate between frames.
    const settle = Math.sin(t * .88 + .75) * .035 * motion
    offsets.pelvis[2] += settle * .55
    offsets.spine_01[1] += settle * .48
    offsets.upperarm_l[0] -= settle * .45
    offsets.upperarm_r[0] += settle * .5
    offsets.thigh_l[0] += balance * .22
    offsets.thigh_r[0] -= balance * .16
    offsets.calf_l[0] -= balance * .18
    offsets.calf_r[0] += balance * .12
  }
  return offsets
}
