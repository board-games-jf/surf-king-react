import * as THREE from 'three'
import { createRiggedBoardSurfer, loadRiggedBoardTemplate, loadRiggedBoardTemplates, RIGGED_SURFER_ASSETS, PLAYER_BOARD_COLORS } from './riggedBoardSurfers'
import { PRESET_SURFERS } from './surferStyle'

function makeSkinnedTemplate(character = 'male') {
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
  body.name = RIGGED_SURFER_ASSETS[character].body
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
    const male = makeSkinnedTemplate('male')
    const female = makeSkinnedTemplate('female')
    const templates = { male: male.root, female: female.root }
    const riders = PLAYER_BOARD_COLORS.map((color, id) => {
      const art = createRiggedBoardSurfer(templates, id)
      const character = PRESET_SURFERS[id % PRESET_SURFERS.length].character
      const mesh = art.display.getObjectByName(RIGGED_SURFER_ASSETS[character].body)
      const hull = art.display.getObjectByName('styled-board-hull')
      expect(mesh.isSkinnedMesh).toBe(true)
      expect(mesh).not.toBe(templates[character].getObjectByName(RIGGED_SURFER_ASSETS[character].body))
      expect(art.display.userData.character).toBe(character)
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
    expect(male.body.material.vertexColors).toBeFalsy()
    expect(female.body.material.vertexColors).toBeFalsy()
    riders.forEach(art => art.dispose())
    for (const model of [male, female]) {
      model.body.material.dispose()
      model.geometry.dispose()
    }
  })

  test.each(['shortboard', 'fish', 'longboard'])('places the %s under the surfer feet within a hex', boardType => {
    const male = makeSkinnedTemplate('male')
    const female = makeSkinnedTemplate('female')
    const templates = { male: male.root, female: female.root }
    // The first four preview presets expose distinct board silhouettes.
    const id = { shortboard: 0, fish: 1, longboard: 2 }[boardType]
    const art = createRiggedBoardSurfer(templates, id)
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
    for (const model of [male, female]) {
      model.body.material.dispose()
      model.geometry.dispose()
    }
  })

  test('rejects a non-rigged GLB rather than crashing the board', () => {
    const invalid = new THREE.Group()
    expect(() => createRiggedBoardSurfer({ male: invalid }, 0)).toThrow(/skinned character/)
  })
  test('requests the same local GLB exactly once and accepts a valid skeleton', () => {
    const { root, body, geometry } = makeSkinnedTemplate()
    const success = jest.fn(), failure = jest.fn()
    const loader = { load: jest.fn((path, resolve) => resolve({ scene: root })) }
    loadRiggedBoardTemplate(success, failure, loader)
    expect(loader.load).toHaveBeenCalledTimes(1)
    expect(loader.load.mock.calls[0][0]).toMatch(/\/assets\/surfers\/quaternius-male-base\.glb$/)
    expect(success).toHaveBeenCalledWith(root)
    expect(failure).not.toHaveBeenCalled()
    body.material.dispose()
    geometry.dispose()
  })

  test('invalid loaded model safely reports an error instead of replacing fallback', () => {
    const success = jest.fn(), failure = jest.fn()
    const loader = { load: jest.fn((path, resolve) => resolve({ scene: new THREE.Group() })) }
    loadRiggedBoardTemplate(success, failure, loader)
    expect(success).not.toHaveBeenCalled()
    expect(failure).toHaveBeenCalledWith(expect.any(Error))
  })
  test('loads male and female sources once and validates each real body separately', () => {
    const male = makeSkinnedTemplate('male'), female = makeSkinnedTemplate('female')
    const success = jest.fn(), failure = jest.fn()
    const loader = { load: jest.fn((path, resolve) => {
      resolve({ scene: path.includes('-female-') ? female.root : male.root })
    }) }
    loadRiggedBoardTemplates(success, failure, loader)
    expect(loader.load).toHaveBeenCalledTimes(2)
    expect(loader.load.mock.calls.map(call => call[0])).toEqual([
      expect.stringMatching(/quaternius-male-base\.glb$/),
      expect.stringMatching(/quaternius-female-base\.glb$/)
    ])
    expect(success).toHaveBeenCalledWith('male', male.root)
    expect(success).toHaveBeenCalledWith('female', female.root)
    expect(failure).not.toHaveBeenCalled()
    for (const model of [male, female]) {
      model.body.material.dispose()
      model.geometry.dispose()
    }
  })

  test('missing female skeleton reports a gender-specific error', () => {
    const male = makeSkinnedTemplate('male')
    const success = jest.fn(), failure = jest.fn()
    const loader = { load: jest.fn((path, resolve) => {
      resolve({ scene: path.includes('-female-') ? new THREE.Group() : male.root })
    }) }
    loadRiggedBoardTemplates(success, failure, loader)
    expect(success).toHaveBeenCalledTimes(2)
    expect(failure).toHaveBeenCalledWith('female', expect.any(Error))
    male.body.material.dispose()
    male.geometry.dispose()
  })


})

test('catalog opt-in selects the textured female asset', () => {
  const male = makeSkinnedTemplate('male'), female = makeSkinnedTemplate('female')
  const success = jest.fn(), failure = jest.fn()
  const loader = { load: jest.fn((path, resolve) => resolve({ scene: path.includes('female-athlete') ? female.root : male.root })) }
  loadRiggedBoardTemplates(success, failure, loader, { previewFemaleAthlete: true })
  expect(loader.load.mock.calls.map(call => call[0])).toEqual([
    expect.stringMatching(/quaternius-male-base\.glb$/),
    expect.stringMatching(/female-athlete-rigged-review\.glb$/)
  ])
  expect(success).toHaveBeenCalledWith('female', female.root)
  expect(failure).not.toHaveBeenCalled()
  for (const model of [male, female]) { model.geometry.dispose(); model.body.material.dispose() }
})
