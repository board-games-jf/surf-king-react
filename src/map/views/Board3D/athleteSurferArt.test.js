import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import * as THREE from 'three'
import { inspectRiggedAsset, reviewStanceFrame, reviewKneeTarget, reviewSurfDirections } from './athleteSurferArt'

describe('isolated external GLB art review', () => {
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

describe('refined surf stance directions', () => {
  test.each([0, Math.PI / 2, Math.PI, Math.PI * 1.5])('keeps anatomical sides at yaw %s', yaw => {
    const up = new THREE.Vector3(0, 1, 0)
    const lateral = new THREE.Vector3(1, 0, 0).applyAxisAngle(up, yaw)
    const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(up, yaw)
    const lead = reviewSurfDirections({ lateral, forward, up }, true)
    const rear = reviewSurfDirections({ lateral, forward, up }, false)
    expect(lead.toe.dot(lateral)).toBeGreaterThan(.4)
    expect(Math.abs(rear.toe.dot(lateral))).toBeLessThan(.15)
    for (const [directions, sign] of [[lead, 1], [rear, -1]]) {
      expect(directions.toe.dot(up)).toBeCloseTo(0)
      expect(directions.toe.dot(forward)).toBeGreaterThan(0)
      expect(directions.upperArm.dot(lateral) * sign).toBeGreaterThan(0)
      expect(directions.forearm.dot(lateral) * sign).toBeGreaterThan(0)
      expect(directions.upperArm.dot(directions.forearm)).toBeLessThan(.8)
    }
    expect(lead.upperArm.dot(lead.forearm)).not.toBeCloseTo(rear.upperArm.dot(rear.forearm))
  })
})

test('bundled athlete is the exact owner-supplied rigged GLB', () => {
  const data = fs.readFileSync(path.join(process.cwd(), 'public/assets/surfers/female-athlete-rigged-review.glb'))
  expect(data.subarray(0, 4).toString('ascii')).toBe('glTF')
  expect(data.readUInt32LE(4)).toBe(2)
  expect(data.readUInt32LE(8)).toBe(data.length)
  expect(crypto.createHash('sha256').update(data).digest('hex')).toBe('c40e86e7e3566990b46472e231b21eb5e10581a1491fc453b49f062c45c332f6')
  const gltf = JSON.parse(data.subarray(20, 20 + data.readUInt32LE(12)).toString('utf8'))
  const joints = gltf.skins[0].joints.map(index => gltf.nodes[index].name)
  expect(joints).toEqual(expect.arrayContaining(['Hips','LeftUpLeg','RightUpLeg','LeftFoot','RightFoot','LeftArm','RightArm','LeftHand','RightHand']))
  expect(joints).toHaveLength(24)
  expect(gltf.buffers.every(buffer => !buffer.uri)).toBe(true)
  expect(gltf.animations.map(clip => clip.name)).toEqual(expect.arrayContaining(['walk','run']))
})
