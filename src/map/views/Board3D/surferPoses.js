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
    spine_01: [.095, 0, 0], spine_02: [.16, 0, .07],
    spine_03: [.07, 0, -.035], pelvis: [.075, 0, .035],
    upperarm_l: [-.09, 0, -.52], upperarm_r: [.13, 0, .53],
    lowerarm_l: [-.09, 0, -.55], lowerarm_r: [.04, 0, .48],
    thigh_l: [.30, 0, -.115], thigh_r: [.33, 0, .11],
    calf_l: [-.47, 0, .055], calf_r: [-.48, 0, -.055],
    foot_l: [.12, 0, 0], foot_r: [.12, 0, 0]
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
    offsets.thigh_l[0] += balance * .22
    offsets.thigh_r[0] -= balance * .22
    offsets.calf_l[0] -= balance * .18
    offsets.calf_r[0] += balance * .18
  }
  return offsets
}
