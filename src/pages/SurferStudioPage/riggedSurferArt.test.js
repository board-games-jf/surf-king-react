import * as THREE from 'three'
import { decorateRiggedSurfer, resolveRiggedPalette } from '../../map/views/Board3D/riggedSurferArt'
import { SURFER_POSES } from '../../map/views/Board3D/surferPoses'

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
  for (const name of ['spine_01', 'spine_02', 'spine_03', 'upperarm_l', 'upperarm_r',
    'lowerarm_l', 'lowerarm_r', 'pelvis', 'thigh_l', 'thigh_r', 'calf_l', 'calf_r', 'foot_l', 'foot_r']) {
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
      const hair = art.display.getObjectByName('rigged-hair-strand')
      expect(hair).toBeTruthy()
      // Hair uses tapered sculpted meshes rather than constant-radius tubes.
      expect(hair.geometry.type).toBe('BufferGeometry')
      expect(hair.geometry.type).not.toBe('TubeGeometry')
      expect(hair.geometry.getAttribute('position').count).toBeGreaterThan(20)
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

  test.each(SURFER_POSES)('uses authored bone pose %s and restores the original bind pose', pose => {
    const { root, model, geometry, material } = makeMockRig()
    const arm = root.getObjectByName('upperarm_l')
    const leg = root.getObjectByName('calf_l')
    const restArm = arm.quaternion.clone(), restLeg = leg.quaternion.clone()
    const art = decorateRiggedSurfer(root, baseStyle, { pose })
    art.animate(2.6)
    expect(arm.quaternion.equals(restArm)).toBe(false)
    if (pose === 'surfing') {
      expect(leg.quaternion.equals(restLeg)).toBe(false)
      expect(art.display.getObjectByName('cosmetic-surfboard').rotation.x)
        .toBeCloseTo(-Math.PI / 2)
      expect(art.display.getObjectByName('surfer-preview-stage')).toBeUndefined()
    } else {
      expect(art.display.getObjectByName('surfer-preview-stage')).toBeTruthy()
    }
    art.dispose()
    expect(arm.quaternion.equals(restArm)).toBe(true)
    expect(leg.quaternion.equals(restLeg)).toBe(true)
    expect(model.geometry).toBe(geometry)
    material.dispose()
    geometry.dispose()
  })

  test('ponytail band and tapered locks dispose without touching the original rig', () => {
    const { root, model, geometry, material } = makeMockRig()
    const art = decorateRiggedSurfer(root, {
      ...baseStyle, character: 'female', hairstyle: 'ponytail'
    }, { pose: 'surfing' })
    const hair = art.display.getObjectByName('rigged-hair-strand')
    const band = art.display.getObjectByName('rigged-hair-band')
    expect(hair).toBeTruthy()
    expect(band).toBeTruthy()
    const sculpt = hair.geometry
    const bandGeometry = band.geometry
    const disposeHair = jest.spyOn(sculpt, 'dispose')
    const disposeBand = jest.spyOn(bandGeometry, 'dispose')
    art.animate(3.4)
    art.dispose()
    expect(disposeHair).toHaveBeenCalledTimes(1)
    expect(disposeBand).toHaveBeenCalledTimes(1)
    expect(model.geometry).toBe(geometry)
    expect(model.material).toBe(material)
    geometry.dispose()
    material.dispose()
  })

  test('attaches hair to the actual head bone in a surf crouch and detaches on disposal', () => {
    const { root, geometry, material } = makeMockRig()
    const head = new THREE.Bone()
    head.name = 'head'
    head.position.set(0, 1.68, 0)
    root.add(head)
    const art = decorateRiggedSurfer(root, baseStyle, { pose: 'surfing' })
    const hair = art.display.getObjectByName('surfer-hair-root')
    expect(hair.parent).toBe(head)
    const before = hair.getWorldPosition(new THREE.Vector3()).clone()
    head.rotation.z = .28
    const after = hair.getWorldPosition(new THREE.Vector3())
    expect(after.distanceTo(before)).toBeGreaterThan(.001)
    const strand = hair.getObjectByName('rigged-hair-strand')
    const disposeStrand = jest.spyOn(strand.geometry, 'dispose')
    art.dispose()
    expect(hair.parent).toBeNull()
    expect(disposeStrand).toHaveBeenCalledTimes(1)
    geometry.dispose()
    material.dispose()
  })

  test('aligns hair with the smaller female face without modifying the shared body', () => {
    const male = makeMockRig(), female = makeMockRig()
    const maleArt = decorateRiggedSurfer(male.root, { ...baseStyle, character: 'male' })
    const femaleArt = decorateRiggedSurfer(female.root, { ...baseStyle, character: 'female' })
    const maleHair = maleArt.display.getObjectByName('surfer-hair-root')
    const femaleHair = femaleArt.display.getObjectByName('surfer-hair-root')
    expect(maleHair.position.y).toBe(0)
    expect(femaleHair.position.y).toBeLessThan(-.05)
    expect(femaleHair.scale.x).toBeLessThan(maleHair.scale.x)
    maleArt.dispose()
    femaleArt.dispose()
    for (const model of [male, female]) {
      model.material.dispose()
      model.geometry.dispose()
    }
  })

})
