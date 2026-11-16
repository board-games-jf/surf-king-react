import * as THREE from 'three'
import { createRiggedBoardSurfer, PLAYER_BOARD_COLORS } from './riggedBoardSurfers'

function makeSkinnedTemplate() {
  const root = new THREE.Group()
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute([
    -.16, 0, 0, .16, 0, 0, -.16, 1.8, 0,
    .16, 1.8, 0, 0, 1.25, .09, 0, 1.66, .07
  ], 3))
  geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute([
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
  ], 4))
  geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute([
    1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0,
    1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0
  ], 4))
  const body = new THREE.SkinnedMesh(geometry,
    new THREE.MeshStandardMaterial({ color: '#aaccbb' }))
  body.name = 'SuperHero_Male'
  const rootBone = new THREE.Bone()
  rootBone.name = 'root'
  const joints = [rootBone]
  for (const name of ['spine_02', 'spine_03', 'upperarm_l', 'upperarm_r']) {
    const joint = new THREE.Bone()
    joint.name = name
    rootBone.add(joint)
    joints.push(joint)
  }
  body.add(rootBone)
  body.bind(new THREE.Skeleton(joints))
  root.add(body)
  return { root, body, geometry }
}

describe('shared real rigged surfer integration for the 3D board', () => {
  test('preserves seven recognizable player colors and creates independent skeletons', () => {
    const { root, body, geometry } = makeSkinnedTemplate()
    const riders = PLAYER_BOARD_COLORS.map((color, id) => {
      const art = createRiggedBoardSurfer(root, id)
      const mesh = art.display.getObjectByName('SuperHero_Male')
      const hull = art.display.getObjectByName('styled-board-hull')
      expect(mesh.isSkinnedMesh).toBe(true)
      expect(mesh).not.toBe(body)
      expect(hull.material.color.equals(new THREE.Color(color))).toBe(true)
      expect(art.display.getObjectByName('surfer-preview-stage')).toBeUndefined()
      expect(art.display.getObjectByName('rigged-sculpted-hair')).toBeTruthy()
      return art
    })
    const firstArm = riders[0].display.getObjectByName('upperarm_l')
    const secondArm = riders[1].display.getObjectByName('upperarm_l')
    expect(firstArm).not.toBe(secondArm)
    const secondPose = secondArm.quaternion.clone()
    riders[0].animate(2.4)
    expect(secondArm.quaternion.equals(secondPose)).toBe(true)
    expect(body.material.vertexColors).toBeFalsy()
    riders.forEach(art => art.dispose())
    body.material.dispose()
    geometry.dispose()
  })

  test.each(['shortboard', 'fish', 'longboard'])('places the %s under the surfer feet within a hex', boardType => {
    const { root, body, geometry } = makeSkinnedTemplate()
    // The first four preview presets expose distinct board silhouettes.
    const id = { shortboard: 0, fish: 1, longboard: 2 }[boardType]
    const art = createRiggedBoardSurfer(root, id)
    const board = art.display.getObjectByName('cosmetic-surfboard')
    expect(board.rotation.x).toBeCloseTo(-Math.PI / 2)
    expect(board.position.x).toBe(0)
    expect(board.position.y).toBeLessThan(.1)
    const bounds = new THREE.Box3().setFromObject(art.display)
    const size = bounds.getSize(new THREE.Vector3())
    expect(size.x).toBeLessThan(1.6)
    expect(size.y).toBeLessThan(1.7)
    expect(size.z).toBeLessThan(1.7)
    expect(art.display.scale.x).toBeCloseTo(.68)
    art.dispose()
    body.material.dispose()
    geometry.dispose()
  })

  test('rejects a non-rigged GLB rather than crashing the board', () => {
    const invalid = new THREE.Group()
    expect(() => createRiggedBoardSurfer(invalid, 0)).toThrow(/skinned character/)
  })
})
