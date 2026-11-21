import * as THREE from 'three'
import { MAX_REVIEW_ASSET_BYTES, inspectRiggedAsset, validateReviewFile, reviewStanceFrame, reviewKneeTarget } from './artReviewUtils'

describe('isolated external GLB art review', () => {
  test('requires a nonempty GLB no larger than the review limit', () => {
    expect(validateReviewFile(null)).toMatch(/Choose/)
    expect(validateReviewFile({ name: 'avatar.png', size: 50 })).toMatch(/\.glb/)
    expect(validateReviewFile({ name: 'avatar.glb', size: 0 })).toMatch(/nonempty/)
    expect(validateReviewFile({ name: 'avatar.glb', size: MAX_REVIEW_ASSET_BYTES + 1 })).toMatch(/40 MB/)
    expect(validateReviewFile({ name: 'female-athlete-rigged.GLB', size: 13000000 })).toBeNull()
  })

  test('reports real skinning, distinct joints, triangles and actual clip names', () => {
    const scene = new THREE.Group()
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([
      0, 0, 0, 1, 0, 0, 0, 1, 0
    ], 3))
    geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ], 4))
    geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute([
      1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0
    ], 4))
    const mesh = new THREE.SkinnedMesh(geometry, new THREE.MeshStandardMaterial())
    const bone = new THREE.Bone()
    bone.name = 'Hips'
    mesh.add(bone)
    mesh.bind(new THREE.Skeleton([bone]))
    scene.add(mesh)
    expect(inspectRiggedAsset({ scene, animations: [new THREE.AnimationClip('Walk', 1, [])] })).toEqual({
      skinnedMeshes: 1, bones: 1, triangles: 1, animations: ['Walk'], rigged: true
    })
    geometry.dispose()
    mesh.material.dispose()
  })

  test('does not mistake an unrigged mesh for an articulated model', () => {
    const scene = new THREE.Group()
    scene.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial()))
    const result = inspectRiggedAsset({ scene })
    expect(result.rigged).toBe(false)
    expect(result.bones).toBe(0)
    expect(result.animations).toEqual([])
    scene.traverse(node => {
      node.geometry?.dispose()
      node.material?.dispose()
    })
  })
})


describe('anatomical surf pose geometry', () => {
  test.each([0, Math.PI / 2, Math.PI])('uses the same forward knee direction after yaw %s', yaw => {
    const up = new THREE.Vector3(0, 1, 0)
    const left = new THREE.Vector3(.2, 1, 0).applyAxisAngle(up, yaw)
    const right = new THREE.Vector3(-.2, 1, 0).applyAxisAngle(up, yaw)
    const toe = new THREE.Vector3(0, 0, 1).applyAxisAngle(up, yaw)
    const frame = reviewStanceFrame(THREE, left, right, [toe])
    expect(frame.forward.dot(toe)).toBeCloseTo(1)
    expect(frame.lateral.dot(left.clone().sub(right))).toBeGreaterThan(0)
    const ankle = left.clone().addScaledVector(up, -.75).addScaledVector(frame.lateral, .2)
    const knee = reviewKneeTarget(left, ankle, .5, .5, frame.forward)
    expect(knee.clone().sub(left).dot(toe)).toBeGreaterThan(0)
    expect(knee.distanceTo(left)).toBeCloseTo(.5)
    expect(knee.distanceTo(ankle)).toBeCloseTo(.5)
  })

  test('honors toe direction and rejects unreachable ankle targets', () => {
    const left = new THREE.Vector3(.2, 1, 0)
    const right = new THREE.Vector3(-.2, 1, 0)
    const toe = new THREE.Vector3(0, 0, -1)
    const frame = reviewStanceFrame(THREE, left, right, [toe])
    expect(frame.forward.dot(toe)).toBeCloseTo(1)
    expect(reviewKneeTarget(left, new THREE.Vector3(.2, -1, 0), .5, .5, frame.forward)).toBeNull()
  })
})
