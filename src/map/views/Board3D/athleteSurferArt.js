import * as THREE from 'three'
import { createPremiumSurfboardProof } from './premiumSurfboardProof'
import { BOARD_TYPES } from './surferStyle'

export const ATHLETE_SURFER_PATH = '/assets/surfers/female-athlete-rigged-review.glb'
export const ATHLETE_ASSET_PATHS = Object.freeze({
  female: ATHLETE_SURFER_PATH,
  male: '/assets/surfers/man-base-character-rigged.glb'
})

// Shared textured athlete inspection and anatomical stance geometry.
export function inspectRiggedAsset(loaded) {
  const scene = loaded?.scene
  if (!scene?.traverse) throw new Error('Missing GLB scene.')
  let skinnedMeshes = 0
  let triangles = 0
  const bones = new Set()
  scene.traverse(node => {
    if (!node.isMesh) return
    if (node.isSkinnedMesh && node.skeleton?.bones?.length) {
      skinnedMeshes += 1
      node.skeleton.bones.forEach(bone => bones.add(bone))
    }
    const geometry = node.geometry
    if (geometry?.index) triangles += Math.floor(geometry.index.count / 3)
    else if (geometry?.attributes?.position) {
      triangles += Math.floor(geometry.attributes.position.count / 3)
    }
  })
  return {
    skinnedMeshes,
    bones: bones.size,
    triangles,
    animations: (loaded.animations || []).map(clip => clip.name),
    rigged: skinnedMeshes > 0 && bones.size > 0
  }
}


// Use the actual joint positions, not the imported bones' arbitrary local axes.
export function reviewStanceFrame(THREE, left, right, toeDirections = []) {
  const up = new THREE.Vector3(0, 1, 0)
  const lateral = left.clone().sub(right).setY(0)
  if (lateral.lengthSq() < 1e-8) return null
  lateral.normalize()
  const forward = lateral.clone().cross(up).normalize()
  const toes = toeDirections.reduce((sum, direction) => sum.add(direction), new THREE.Vector3())
  if (forward.dot(toes) < 0) forward.negate()
  return { lateral, forward, up }
}

// The knee is placed on the forward side of the hip-to-ankle line.
export function reviewKneeTarget(hip, ankle, upper, lower, forward) {
  const axis = ankle.clone().sub(hip)
  const distance = axis.length()
  if (distance < 1e-6 || upper < 1e-6 || lower < 1e-6 ||
      distance >= upper + lower || distance <= Math.abs(upper - lower)) return null
  axis.normalize()
  const pole = forward.clone().addScaledVector(axis, -forward.dot(axis))
  if (pole.lengthSq() < 1e-8) return null
  pole.normalize()
  const along = (upper * upper - lower * lower + distance * distance) / (2 * distance)
  const bend = Math.sqrt(Math.max(0, upper * upper - along * along))
  return hip.clone().addScaledVector(axis, along).addScaledVector(pole, bend)
}

// All directions use the measured anatomical frame, independent of imported bone axes.
export function reviewSurfDirections({ lateral, forward, up }, lead) {
  const sign = lead ? 1 : -1
  return {
    toe: forward.clone().addScaledVector(lateral, lead ? .60 : -.10).normalize(),
    upperArm: lateral.clone().multiplyScalar(sign * (lead ? .80 : .54))
      .addScaledVector(forward, lead ? .20 : .18).addScaledVector(up, lead ? -.60 : -.78).normalize(),
    forearm: lateral.clone().multiplyScalar(sign * (lead ? .36 : .83))
      .addScaledVector(forward, lead ? .82 : .46).addScaledVector(up, lead ? .38 : .08).normalize()
  }
}

export const ATHLETE_POSES = Object.freeze(['standing', 'relaxed', 'surf'])

export function reviewStandingArmDirections({ lateral, forward, up }, lead, relaxed) {
  const sign = lead ? 1 : -1
  // The owner's previous relaxed pose becomes the exact standing pose.
  if (!relaxed) return {
    upperArm: up.clone().negate().addScaledVector(lateral, sign * .22)
      .addScaledVector(forward, .10).normalize(),
    forearm: up.clone().negate().addScaledVector(lateral, sign * .08)
      .addScaledVector(forward, .30).normalize()
  }
  // Relaxed: the left arm stays loose and the anatomical right arm waves.
  if (!lead) return {
    upperArm: lateral.clone().multiplyScalar(-.82).addScaledVector(up, -.48)
      .addScaledVector(forward, .16).normalize(),
    forearm: up.clone().addScaledVector(lateral, -.18)
      .addScaledVector(forward, .16).normalize()
  }
  return {
    upperArm: up.clone().negate().addScaledVector(lateral, .14)
      .addScaledVector(forward, .05).normalize(),
    forearm: up.clone().negate().addScaledVector(lateral, .04)
      .addScaledVector(forward, .12).normalize()
  }
}

const BOARD_SCALE = 1.28
const BOARD_CENTER_DECK = .167 * BOARD_SCALE
const normalizedBoardType = type => BOARD_TYPES.includes(type) ? type : 'shortboard'

function disposeBoard(board) {
  board.traverse(node => {
    node.geometry?.dispose()
    node.material?.dispose()
  })
}

function createAthleteBoard(type, color) {
  const board = createPremiumSurfboardProof(type, color)
  board.scale.setScalar(BOARD_SCALE)
  return board
}

// Pose an independently-owned skeleton at identity, before attaching the display to a scene actor.
// Geometry and textures belong to the caller's GLB template; only the board and cloned skin are owned here.
export function createAthleteSurferArt(root, { color = '#19c8c2', scale = 1, initialPose = 'surf', boardType = 'shortboard', ownsSkeleton = false } = {}) {
  if (!inspectRiggedAsset({ scene: root }).rigged) throw new Error('The athlete model has no skeleton.')
  const deckY = .12
  const display = new THREE.Group()
  display.name = 'textured-athlete-surfer'
  let currentType = normalizedBoardType(boardType)
  let currentColor = color
  let reviewBoard = createAthleteBoard(currentType, color)
  const riderPivot = new THREE.Group()
  riderPivot.name = 'athlete-rider-motion'
  riderPivot.add(root)
  display.add(riderPivot, reviewBoard)
  const motionAxis = new THREE.Vector3()
  const boardRest = new THREE.Quaternion()
  const boardRestPosition = new THREE.Vector3()
  const boardRoll = new THREE.Quaternion()
  const boardPitch = new THREE.Quaternion()
  const boardCrossAxis = new THREE.Vector3()
  let floatingChestY = 0
  let motionFrames = null
  let carveFrames = null
  let remountFrames = null
  let remountHands = null
  let motionReady = false
  const restorePose = bindPose => {
    bindPose.forEach(({ bone, position, quaternion }) => {
      bone.position.copy(position)
      bone.quaternion.copy(quaternion)
    })
  }
  const rootPosition = root.position.clone()
  const bindPose = new Map()
  const bones = new Map()
  root.traverse(node => {
    if (!node.isBone) return
    bindPose.set(node, {
      bone: node, position: node.position.clone(), quaternion: node.quaternion.clone()
    })
    bones.set(node.name, node)
  })
  let wave = null
  const setPose = pose => {
    wave = null
    if (motionReady) {
      reviewBoard.position.copy(boardRestPosition)
      reviewBoard.quaternion.copy(boardRest)
    }
    motionReady = false
    motionFrames = null
    carveFrames = null
    remountFrames = null
    remountHands = null
    riderPivot.position.set(0, 0, 0)
    riderPivot.quaternion.identity()
    riderPivot.updateMatrixWorld(true)
    restorePose(bindPose)
    root.position.copy(rootPosition)
    reviewBoard.visible = pose !== 'base'
    if (pose === 'base') { root.updateMatrixWorld(true); return }
    root.updateMatrixWorld(true)
    const sides = ['Left', 'Right']
    const required = ['Hips', ...sides.flatMap(side =>
      ['UpLeg', 'Leg', 'Foot', 'Arm', 'ForeArm', 'Hand'].map(joint => side + joint))]
    if (!required.every(name => bones.has(name))) {
      reviewBoard.visible = false
      throw new Error('The athlete skeleton is missing required joints.')
    }

    const point = name => bones.get(name).getWorldPosition(new THREE.Vector3())
    const toes = sides.map(side => {
      const toe = [...bones.keys()].find(name => name.startsWith(side) && /toe/i.test(name))
      return toe ? point(toe).sub(point(side + 'Foot')).setY(0) : null
    })
    const frame = reviewStanceFrame(THREE, point('LeftUpLeg'), point('RightUpLeg'), toes.filter(Boolean))
    if (!frame) { reviewBoard.visible = false; throw new Error('Invalid anatomical frame.') }
    const { lateral, forward, up } = frame
    const rotateWorld = (bone, worldDelta) => {
      const parentWorld = bone.parent.getWorldQuaternion(new THREE.Quaternion())
      const localDelta = parentWorld.clone().invert().multiply(worldDelta).multiply(parentWorld)
      bone.quaternion.premultiply(localDelta)
      root.updateMatrixWorld(true)
    }
    const turn = (bone, from, to) => {
      if (bone) rotateWorld(bone, new THREE.Quaternion().setFromUnitVectors(from, to))
    }
    const aimBone = (name, childName, target) => {
      const bone = bones.get(name)
      const start = point(name)
      const end = point(childName)
      const direction = target.clone().sub(start)
      if (direction.lengthSq() < 1e-8 || end.distanceToSquared(start) < 1e-8) return
      const worldDelta = new THREE.Quaternion().setFromUnitVectors(
        end.sub(start).normalize(), direction.normalize()
      )
      rotateWorld(bone, worldDelta)
    }

    if (pose !== 'surf') {
      // A modest weight shift, solving both knees against their original ankles.
      // Skip the shift on a different rig if either target cannot be reached.
      if (pose === 'relaxed') {
        const legs = sides.map(side => ({
          side, hip: point(side + 'UpLeg'), knee: point(side + 'Leg'),
          ankle: point(side + 'Foot'),
          footRotation: bones.get(side + 'Foot').getWorldQuaternion(new THREE.Quaternion())
        }))
        const length = Math.min(...legs.map(leg =>
          leg.hip.distanceTo(leg.knee) + leg.knee.distanceTo(leg.ankle)))
        const shift = lateral.clone().multiplyScalar(length * .055)
          .addScaledVector(up, -length * .035)
        const targets = legs.map(leg => ({
          ...leg,
          targetKnee: reviewKneeTarget(leg.hip.clone().add(shift), leg.ankle,
            leg.hip.distanceTo(leg.knee), leg.knee.distanceTo(leg.ankle), forward)
        }))
        if (targets.every(leg => leg.targetKnee)) {
          const hips = bones.get('Hips')
          hips.position.copy(hips.parent.worldToLocal(point('Hips').add(shift)))
          root.updateMatrixWorld(true)
          targets.forEach(({ side, ankle, targetKnee, footRotation }) => {
            aimBone(side + 'UpLeg', side + 'Leg', targetKnee)
            aimBone(side + 'Leg', side + 'Foot', ankle)
            const foot = bones.get(side + 'Foot')
            foot.quaternion.copy(foot.parent.getWorldQuaternion(new THREE.Quaternion())
              .invert().multiply(footRotation))
            root.updateMatrixWorld(true)
          })
        }
      }
      // Stand on the same board with arms lowered from the reference T-pose.
      sides.forEach((side, i) => {
        const shoulder = point(side + 'Arm')
        const upper = shoulder.distanceTo(point(side + 'ForeArm'))
        const lower = point(side + 'ForeArm').distanceTo(point(side + 'Hand'))
        const directions = reviewStandingArmDirections(frame, i === 0, pose === 'relaxed')
        aimBone(side + 'Arm', side + 'ForeArm', shoulder.addScaledVector(directions.upperArm, upper))
        aimBone(side + 'ForeArm', side + 'Hand',
          point(side + 'ForeArm').addScaledVector(directions.forearm, lower))
      })
      if (pose === 'relaxed') {
        const bone = bones.get('RightForeArm')
        const axis = forward.clone().applyQuaternion(bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert())
        wave = { bone, axis, neutral: bone.quaternion.clone() }
      }
      const ankleCenter = point('LeftFoot').add(point('RightFoot')).multiplyScalar(.5)
      reviewBoard.rotation.y = Math.atan2(-lateral.z, lateral.x)
      reviewBoard.position.set(ankleCenter.x, deckY - BOARD_CENTER_DECK, ankleCenter.z)
      const bounds = new THREE.Box3().setFromObject(root, true)
      root.position.y += deckY - bounds.min.y
      root.updateMatrixWorld(true)
      return
    }

    const legs = sides.map(side => {
      const hip = point(side + 'UpLeg')
      const knee = point(side + 'Leg')
      const ankle = point(side + 'Foot')
      return { side, hip, ankle, upper: hip.distanceTo(knee), lower: knee.distanceTo(ankle),
        footRotation: bones.get(side + 'Foot').getWorldQuaternion(new THREE.Quaternion()) }
    })
    const legLength = Math.min(...legs.map(leg => leg.upper + leg.lower))
    if (legLength < 1e-6) { reviewBoard.visible = false; throw new Error('Invalid leg length.') }
    const ankleCenter = legs[0].ankle.clone().add(legs[1].ankle).multiplyScalar(.5)
    const hips = bones.get('Hips')
    const lowerHips = point('Hips').addScaledVector(up, -legLength * .29)
      .addScaledVector(lateral, legLength * .055).addScaledVector(forward, -legLength * .04)
    hips.position.copy(hips.parent.worldToLocal(lowerHips))
    root.updateMatrixWorld(true)

    // Left foot leads; both ankles are on the board's long axis.
    const targets = legs.map((leg, i) => {
      const sign = i === 0 ? 1 : -1
      const ankle = ankleCenter.clone().addScaledVector(lateral, sign * legLength * .36)
      const knee = reviewKneeTarget(point(leg.side + 'UpLeg'), ankle,
        leg.upper, leg.lower, reviewSurfDirections(frame, i === 0).toe)
      return { ...leg, ankle, knee }
    })
    if (targets.some(leg => !leg.knee)) {
      restorePose(bindPose)
      root.updateMatrixWorld(true)
      reviewBoard.visible = false
      throw new Error('The athlete feet cannot reach the requested stance.')
    }
    targets.forEach(({ side, ankle, knee, footRotation }, i) => {
      aimBone(side + 'UpLeg', side + 'Leg', knee)
      aimBone(side + 'Leg', side + 'Foot', ankle)
      const foot = bones.get(side + 'Foot')
      // Rotate the original flat shoe around the vertical axis only.
      const originalToe = toes[i]?.lengthSq() > 1e-8 ? toes[i].clone().normalize() : forward
      const toe = reviewSurfDirections(frame, i === 0).toe
      const yaw = new THREE.Quaternion().setFromUnitVectors(originalToe, toe)
      const desired = yaw.multiply(footRotation)
      foot.quaternion.copy(foot.parent.getWorldQuaternion(new THREE.Quaternion())
        .invert().multiply(desired))
      root.updateMatrixWorld(true)
    })

    // Open the chest toward the nose, then turn the head farther in that direction.
    const chestForward = forward.clone().addScaledVector(lateral, .34).normalize()
    const gaze = forward.clone().addScaledVector(lateral, 1.05).normalize()
    turn(bones.get('Spine') || bones.get('Spine01'), forward, chestForward)
    turn(bones.get('Head') || bones.get('Neck'), chestForward, gaze)

    // Keep hands on their own sides while the lead elbow bends more deeply.
    sides.forEach((side, i) => {
      const shoulder = point(side + 'Arm')
      const upper = shoulder.distanceTo(point(side + 'ForeArm'))
      const lower = point(side + 'ForeArm').distanceTo(point(side + 'Hand'))
      const { upperArm, forearm: handDirection } = reviewSurfDirections(frame, i === 0)
      aimBone(side + 'Arm', side + 'ForeArm', shoulder.addScaledVector(upperArm, upper))
      aimBone(side + 'ForeArm', side + 'Hand',
        point(side + 'ForeArm').addScaledVector(handDirection, lower))
    })
    root.updateMatrixWorld(true)
    // Fit the board to the feet, not to a hard-coded world X/Z orientation.
    reviewBoard.rotation.y = Math.atan2(-lateral.z, lateral.x)
    reviewBoard.position.set(ankleCenter.x, deckY - BOARD_CENTER_DECK, ankleCenter.z)
    const feet = new THREE.Box3().setFromObject(root, true)
    root.position.y += deckY - feet.min.y
    root.updateMatrixWorld(true)

    // Precompute staged surf reactions with the original ankle targets. This
    // avoids whole-model tipping, expensive per-frame IK and accumulating drift.
    boardRest.copy(reviewBoard.quaternion)
    boardRestPosition.copy(reviewBoard.position)
    motionAxis.copy(lateral)
    boardCrossAxis.copy(lateral).cross(up).normalize()
    const capture = () => Array.from(bones.values(), bone => ({
      bone, position: bone.position.clone(), quaternion: bone.quaternion.clone()
    }))
    const restore = frame => {
      frame.forEach(({ bone, position, quaternion }) => {
        bone.position.copy(position)
        bone.quaternion.copy(quaternion)
      })
      root.updateMatrixWorld(true)
    }
    const rest = capture()
    const planted = sides.map((side, i) => ({
      side, ankle: point(side + 'Foot'), hip: point(side + 'UpLeg'),
      upper: legs[i].upper, lower: legs[i].lower,
      pole: reviewSurfDirections(frame, i === 0).toe,
      rotation: bones.get(side + 'Foot').getWorldQuaternion(new THREE.Quaternion())
    }))
    const poseFrame = ({ shift = 0, drop = 0, pitch = 0, roll = 0, twist = 0,
      arms = 0, asymmetry = 0, reach = 0 }) => {
      restore(rest)
      const offset = forward.clone().multiplyScalar(shift * legLength)
        .addScaledVector(up, -drop * legLength)
      const knees = planted.map(leg => reviewKneeTarget(leg.hip.clone().add(offset),
        leg.ankle, leg.upper, leg.lower, leg.pole))
      if (knees.every(Boolean)) {
        hips.position.copy(hips.parent.worldToLocal(point('Hips').add(offset)))
        root.updateMatrixWorld(true)
        planted.forEach((leg, i) => {
          aimBone(leg.side + 'UpLeg', leg.side + 'Leg', knees[i])
          aimBone(leg.side + 'Leg', leg.side + 'Foot', leg.ankle)
          const foot = bones.get(leg.side + 'Foot')
          foot.quaternion.copy(foot.parent.getWorldQuaternion(new THREE.Quaternion())
            .invert().multiply(leg.rotation))
          root.updateMatrixWorld(true)
        })
      }
      const spine = bones.get('Spine') || bones.get('Spine01')
      const rotate = (bone, axis, angle) => {
        if (bone && angle) rotateWorld(bone, new THREE.Quaternion().setFromAxisAngle(axis, angle))
      }
      rotate(spine, lateral, pitch)
      rotate(spine, forward, roll)
      rotate(spine, up, twist)
      rotate(bones.get('Head') || bones.get('Neck'), lateral, -pitch * .32)
      sides.forEach((side, i) => {
        const sign = i === 0 ? 1 : -1
        const shoulder = point(side + 'Arm')
        const upper = shoulder.distanceTo(point(side + 'ForeArm'))
        const lower = point(side + 'ForeArm').distanceTo(point(side + 'Hand'))
        const directions = reviewSurfDirections(frame, i === 0)
        const arm = directions.upperArm.addScaledVector(up, arms + sign * asymmetry)
          .addScaledVector(forward, reach).normalize()
        const forearm = directions.forearm.addScaledVector(up, arms * .65 - reach * .5)
          .addScaledVector(forward, reach * .8).normalize()
        aimBone(side + 'Arm', side + 'ForeArm', shoulder.addScaledVector(arm, upper))
        aimBone(side + 'ForeArm', side + 'Hand',
          point(side + 'ForeArm').addScaledVector(forearm, lower))
      })
      return capture()
    }
    // Carving: alternate compression, shoulder counter-rotation and arm balance.
    carveFrames = [
      poseFrame({ shift: -.065, drop: .045, pitch: -.055, roll: -.13, twist: .10, asymmetry: -.22 }),
      rest,
      poseFrame({ shift: .065, drop: .045, pitch: .055, roll: .13, twist: -.10, asymmetry: .22 })
    ]
    // Keep the reviewed stumble, then transition to upright floating beside
    // the board. The ocean occludes the submerged body rather than hiding it.
    motionFrames = [
      { at: 0, pose: rest },
      { at: .24, pose: poseFrame({ shift: -.075, drop: -.015, pitch: -.22, roll: -.18, arms: .85, asymmetry: .22 }) },
      { at: .58, pose: poseFrame({ shift: .095, drop: .12, pitch: .24, roll: .24, arms: .48, asymmetry: -.45, reach: .4 }) },
      { at: .72, pose: poseFrame({ shift: .04, drop: .23, pitch: .43, roll: -.12, arms: -.42, asymmetry: .20, reach: .45 }) },
      { at: 1, pose: poseFrame({ shift: .015, drop: .075, pitch: .08, roll: -.07, arms: .32, asymmetry: .24, reach: .28 }) }
    ]
    // Independent self-rescue poses: reach, press up, tuck the legs, stand.
    // Reuse the exact floating endpoint and riding endpoint of the fall.
    remountFrames = [
      { at: 0, pose: motionFrames[motionFrames.length - 1].pose },
      { at: .26, pose: poseFrame({ shift: -.035, drop: .045, pitch: .34, roll: -.28, twist: -.30, arms: .15, asymmetry: -.28, reach: .75 }) },
      { at: .53, pose: poseFrame({ shift: .08, drop: .17, pitch: .65, roll: -.15, twist: -.18, arms: -.65, reach: .65 }) },
      { at: .74, pose: poseFrame({ shift: .03, drop: .25, pitch: .40, roll: .04, arms: -.48, reach: .38 }) },
      { at: 1, pose: rest }
    ]
    // Target the actual moving board deck in world coordinates. Clamp to
    // reachable arm length and preserve the current elbow bending direction.
    // This is visual IK, not a physics constraint or a finger grip.
    const handTarget = new THREE.Vector3()
    remountHands = weight => {
      display.updateWorldMatrix(true, true)
      sides.forEach((side, i) => {
        const shoulder = point(side + 'Arm')
        const elbow = point(side + 'ForeArm')
        const hand = point(side + 'Hand')
        const upper = shoulder.distanceTo(elbow)
        const lower = elbow.distanceTo(hand)
        if (upper < 1e-6 || lower < 1e-6) return
        handTarget.set(i === 0 ? .24 : -.24, .17, .095)
        reviewBoard.localToWorld(handTarget)
        handTarget.lerp(hand, 1 - weight)
        const direction = handTarget.clone().sub(shoulder)
        const distance = direction.length()
        if (distance < 1e-6) return
        const reach = Math.max(Math.abs(upper - lower) + 1e-5,
          Math.min(upper + lower - 1e-5, distance))
        handTarget.copy(shoulder).addScaledVector(direction, reach / distance)
        const pole = elbow.clone().sub(shoulder)
        const bend = reviewKneeTarget(shoulder, handTarget, upper, lower, pole)
        if (!bend) return
        aimBone(side + 'Arm', side + 'ForeArm', bend)
        aimBone(side + 'ForeArm', side + 'Hand', handTarget)
      })
    }
    restore(motionFrames[motionFrames.length - 1].pose)
    // Derive a chest-level waterline from each model's actual joint heights.
    const head = bones.get('Head') || bones.get('Neck')
    const hipY = point('Hips').y
    const headY = head ? head.getWorldPosition(new THREE.Vector3()).y : hipY + legLength * .7
    floatingChestY = hipY + (headY - hipY) * .66
    restore(rest)
    motionReady = true
  }

  const bounds = new THREE.Box3().setFromObject(root, true)
  if (bounds.isEmpty()) throw new Error('The athlete model is empty.')
  const center = bounds.getCenter(new THREE.Vector3())
  root.position.add(new THREE.Vector3(-center.x, deckY - bounds.min.y, -center.z))
  rootPosition.copy(root.position)
  let disposed = false
  const dispose = () => {
    if (disposed) return
    disposed = true
    disposeBoard(reviewBoard)
    if (ownsSkeleton) {
      const skeletons = new Set()
      root.traverse(node => { if (node.isSkinnedMesh) skeletons.add(node.skeleton) })
      skeletons.forEach(skeleton => skeleton.dispose())
    }
  }
  try {
    setPose(initialPose)
  } catch (error) {
    dispose()
    throw error
  }
  display.scale.setScalar(scale)
  const setBoardStyle = (type, paint) => {
    const next = normalizedBoardType(type)
    if (next !== currentType) {
      const old = reviewBoard
      reviewBoard = createAthleteBoard(next, paint)
      reviewBoard.position.copy(old.position)
      reviewBoard.quaternion.copy(old.quaternion)
      reviewBoard.visible = old.visible
      display.add(reviewBoard)
      old.removeFromParent()
      disposeBoard(old)
      currentType = next
    } else if (paint !== currentColor) {
      reviewBoard.getObjectByName('premium-board-hull').material.color.set(paint)
    }
    currentColor = paint
  }
  // Absolute local rotation avoids drift and is confined to the relaxed preview.
  const waveRotation = new THREE.Quaternion()
  const animate = (time, reduceMotion = false) => {
    if (!wave) return
    const angle = reduceMotion || !Number.isFinite(time) ? 0 : Math.sin(time * 5.5) * .19
    wave.bone.quaternion.copy(wave.neutral).premultiply(waveRotation.setFromAxisAngle(wave.axis, angle))
  }
  const scratchPosition = new THREE.Vector3()
  const scratchQuaternion = new THREE.Quaternion()
  const setBoardMotion = sample => {
    if (!motionReady) return
    const { fall, boardRoll: roll = 0, travelBank = 0, immersion = 0,
      boardRise = 0, floatBob = 0, waterOffset = -.145, remount,
      riderAside = immersion, boardAside = boardRise, handContact = 0 } = sample
    const waterY = waterOffset / scale
    // The actor's logical cell never moves. Small opposite offsets separate
    // the rider and board inside that cell only after the initial stumble.
    riderPivot.position.copy(motionAxis).multiplyScalar(.40 * riderAside)
    riderPivot.position.y = (waterY - floatingChestY) * immersion + floatBob / scale
    riderPivot.quaternion.identity()
    reviewBoard.position.copy(boardRestPosition).addScaledVector(motionAxis, -.60 * boardAside)
    reviewBoard.position.y += (waterY - .065 - boardRestPosition.y) * boardRise
    // The longitudinal X axis pitches toward vertical, not merely rolling.
    reviewBoard.quaternion.copy(boardRest)
      .premultiply(boardRoll.setFromAxisAngle(motionAxis, -roll))
      .premultiply(boardPitch.setFromAxisAngle(boardCrossAxis, 1.34 * boardRise))
    const carve = Math.max(-1, Math.min(1, travelBank))
    const carveTarget = carveFrames[carve < 0 ? 0 : 2]
    const rest = carveFrames[1]
    const rescuing = Number.isFinite(remount)
    const sequence = rescuing ? remountFrames : motionFrames
    const progress = rescuing ? Math.max(0, Math.min(1, remount)) : fall
    const upper = sequence.findIndex(frame => frame.at >= progress)
    const next = sequence[Math.max(1, upper)]
    const previous = sequence[Math.max(0, upper - 1)]
    const t = Math.max(0, Math.min(1, (progress - previous.at) / (next.at - previous.at)))
    const eased = t * t * (3 - 2 * t)
    const falling = rescuing ? 1 : Math.min(1, fall * 6)
    rest.forEach(({ bone, position, quaternion }, i) => {
      bone.position.copy(position).lerp(carveTarget[i].position, Math.abs(carve))
      bone.quaternion.copy(quaternion).slerp(carveTarget[i].quaternion, Math.abs(carve))
      if (rescuing || fall > 0) {
        scratchPosition.copy(previous.pose[i].position).lerp(next.pose[i].position, eased)
        scratchQuaternion.copy(previous.pose[i].quaternion).slerp(next.pose[i].quaternion, eased)
        bone.position.lerp(scratchPosition, falling)
        bone.quaternion.slerp(scratchQuaternion, falling)
      }
    })
    if (rescuing && handContact > 0) remountHands(handContact)
  }
  return { display, get surfboard() { return reviewBoard }, setPose, setBoardStyle, setBoardMotion, animate, dispose }
}
