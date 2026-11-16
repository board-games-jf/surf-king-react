import * as THREE from 'three'
import { decorateRiggedSurfer, resolveRiggedPalette } from './riggedSurferArt'

const baseStyle = {
  character: 'male', hairstyle: 'short', hairColor: 'brown',
  skinTone: 'tan', surfwear: 'coral', boardType: 'shortboard',
  boardColor: 'turquoise'
}

function makeMockRig() {
  const root = new THREE.Group()
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute([
    -.1, 1.16, 0, .10, 1.25, 0, -.1, .91, 0,
    .10, .90, 0, 0, 1.66, .09, 0, .12, .3
  ], 3))
  const material = new THREE.MeshStandardMaterial({ color: '#aaccbb' })
  const model = new THREE.SkinnedMesh(geometry, material)
  model.name = 'SuperHero_Male'
  root.add(model)
  for (const name of ['spine_02', 'spine_03', 'upperarm_l', 'upperarm_r']) {
    const bone = new THREE.Bone()
    bone.name = name
    root.add(bone)
  }
  return { root, model, geometry, material }
}

describe('styled rigged avatar preview — cosmetic geometry only', () => {
  test('normalizes the existing surf studio palette without gameplay stats', () => {
    const palette = resolveRiggedPalette({ ...baseStyle, boardType: 'fish', boardColor: 'pink' })
    expect(palette.style.boardType).toBe('fish')
    expect(palette.board).toBe('#ef8290')
    expect(palette.skin).toBe('#c9875d')
    expect(palette).not.toHaveProperty('energy')
    expect(palette).not.toHaveProperty('speed')
  })

  test.each(['shortboard', 'fish', 'longboard'])('builds a real %s alongside the skinned body', type => {
    const { root, model, geometry, material } = makeMockRig()
    const art = decorateRiggedSurfer(root, { ...baseStyle, boardType: type })
    expect(model.isSkinnedMesh).toBe(true)
    expect(art.display.getObjectByName('SuperHero_Male')).toBe(model)
    expect(model.geometry).not.toBe(geometry)
    expect(model.geometry.getAttribute('color').count).toBe(6)
    expect(model.material.vertexColors).toBe(true)
    expect(art.display.getObjectByName('rigged-sculpted-hair')).toBeTruthy()
    expect(art.display.getObjectByName('styled-board-hull')).toBeTruthy()
    expect(art.display.getObjectByName('styled-board-deck-stripe')).toBeTruthy()
    expect(art.display.getObjectByName('styled-board-fin')).toBeTruthy()
    const arm = root.getObjectByName('upperarm_l')
    const referencePose = arm.quaternion.clone()
    expect(() => art.animate(1.5)).not.toThrow()
    expect(arm.quaternion.equals(referencePose)).toBe(false)
    expect(() => art.dispose()).not.toThrow()
    expect(arm.quaternion.equals(referencePose)).toBe(true)
    expect(model.geometry).toBe(geometry)
    expect(model.material).toBe(material)
    material.dispose()
    geometry.dispose()
  })

  test('supports all hair and color variants without replacing the rig', () => {
    for (const hairstyle of ['short', 'wavy', 'ponytail']) {
      const { root, model, geometry, material } = makeMockRig()
      const art = decorateRiggedSurfer(root, {
        ...baseStyle, hairstyle, character: 'female', skinTone: 'deep',
        surfwear: 'green', boardColor: 'orange'
      })
      expect(art.display.getObjectByName('cosmetic-accessories')).toBeTruthy()
      expect(art.display.getObjectByName('rigged-hair-strand')).toBeTruthy()
      expect(() => art.animate(0, true)).not.toThrow()
      expect(model.isSkinnedMesh).toBe(true)
      art.dispose()
      expect(model.geometry).toBe(geometry)
      expect(model.material).toBe(material)
      material.dispose()
      geometry.dispose()
    }
  })
  test('male rashguard and female-presenting top use different color zones', () => {
    const first = makeMockRig(), second = makeMockRig()
    const male = decorateRiggedSurfer(first.root, { ...baseStyle, character: 'male' })
    const female = decorateRiggedSurfer(second.root, { ...baseStyle, character: 'female' })
    const maleColors = first.model.geometry.getAttribute('color').array
    const femaleColors = second.model.geometry.getAttribute('color').array
    // A vertex at y=1.16 is suit-colored for the rashguard but exposed skin
    // for the cropped top. The underlying licensed body geometry is the same.
    expect(maleColors[0]).not.toBeCloseTo(femaleColors[0])
    expect(first.model.isSkinnedMesh && second.model.isSkinnedMesh).toBe(true)
    male.dispose()
    female.dispose()
    first.geometry.dispose()
    second.geometry.dispose()
    first.material.dispose()
    second.material.dispose()
  })

})
