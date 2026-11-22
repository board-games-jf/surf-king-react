import * as THREE from 'three'
import { createPremiumSurfboardProof } from './premiumSurfboardProof'
import { BOARD_TYPES } from './surferStyle'

export const ATHLETE_SURFER_PATH = '/assets/surfers/female-athlete-rigged-review.glb'

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
  return {
    upperArm: up.clone().negate().addScaledVector(lateral, sign * (relaxed ? .22 : .12))
      .addScaledVector(forward, relaxed ? .10 : .02).normalize(),
    forearm: up.clone().negate().addScaledVector(lateral, sign * (relaxed ? .08 : .10))
      .addScaledVector(forward, relaxed ? .30 : .04).normalize()
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
  display.add(root, reviewBoard)
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
  const setPose = pose => {
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
  return { display, get surfboard() { return reviewBoard }, setPose, setBoardStyle, animate() {}, dispose }
}
