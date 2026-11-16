import * as THREE from 'three'
import { createScenePrimitives } from './scenePrimitives'
import { createSurferModel, sampleSurferBalance, sampleSharkAnimation } from './surfModels'

const PLAYER_COLORS = [
  '#ffbb41', '#f27763', '#38b4ae', '#337a91',
  '#e4c45a', '#b17bb6', '#83c16e'
]

function makeSurfer(color = PLAYER_COLORS[0], ponytail = false) {
  const scene = new THREE.Scene()
  const model = createSurferModel(scene, createScenePrimitives(scene), color,
    '#e5a875', '#724c35', ponytail)
  return { scene, model }
}

describe('3D surfer and surfboard refinement', () => {
  test.each(PLAYER_COLORS)('keeps the existing player color %s on a sculpted hull', color => {
    const { model } = makeSurfer(color)
    expect(model.group.name).toBe('surfer-model')
    const hull = model.group.getObjectByName('surfboard-hull')
    const stripe = model.group.getObjectByName('surfboard-deck-stripe')
    const grip = model.group.getObjectByName('surfboard-tail-grip')
    const fin = model.group.getObjectByName('surfboard-fin')

    expect(hull).toBeTruthy()
    expect(hull.geometry.type).toBe('ExtrudeGeometry')
    expect(hull.material.color.getHexString()).toBe(new THREE.Color(color).getHexString())
    expect(stripe.geometry.type).toBe('ShapeGeometry')
    expect(grip.geometry.type).toBe('ShapeGeometry')
    expect(fin.geometry.type).toBe('ExtrudeGeometry')
  })

  test('keeps rider and board inside a playable-sized footprint', () => {
    const { model } = makeSurfer()
    model.animate(1.3, 0, .04)
    const bounds = new THREE.Box3().setFromObject(model.group)
    const size = bounds.getSize(new THREE.Vector3())
    expect(bounds.isEmpty()).toBe(false)
    expect(size.x).toBeLessThan(1.6)
    expect(size.y).toBeLessThan(1.7)
    expect(size.z).toBeLessThan(1.7)
    expect(model.group.scale.x).toBe(.65)
  })

  test('balanced poses remain smooth, finite, and individual for each rider', () => {
    for (let rider = 0; rider < 7; rider++) {
      let previous = null
      for (let t = 0; t < 60; t += .08) {
        const pose = sampleSurferBalance(t, rider, .04)
        const values = Object.values(pose)
        expect(values.every(Number.isFinite)).toBe(true)
        expect(pose.crouch).toBeGreaterThan(0)
        expect(pose.crouch).toBeLessThan(.04)
        if (previous) {
          expect(Math.abs(pose.lean - previous.lean)).toBeLessThan(.02)
          expect(Math.abs(pose.boardPitch - previous.boardPitch)).toBeLessThan(.02)
        }
        previous = pose
      }
    }
    expect(sampleSurferBalance(1, 0)).toEqual(sampleSurferBalance(1, 0))
    expect(sampleSurferBalance(1, 0)).not.toEqual(sampleSurferBalance(1, 1))
  })

  test('existing shark animation sampler keeps its previous public contract', () => {
    const pose = sampleSharkAnimation(1.2, 3)
    expect(Object.keys(pose).sort()).toEqual(
      ['x', 'z', 'bob', 'heading', 'roll', 'rippleScale'].sort()
    )
  })

  test('poses animate both hair variants without invalid mesh transforms', () => {
    for (const ponytail of [false, true]) {
      const { model } = makeSurfer(PLAYER_COLORS[1], ponytail)
      for (const time of [0, .8, 2.6, 12]) {
        expect(() => model.animate(time, 1, .05)).not.toThrow()
        model.group.traverse(node => {
          expect(node.position.toArray().every(Number.isFinite)).toBe(true)
          expect(node.rotation.toArray().slice(0, 3).every(Number.isFinite)).toBe(true)
        })
      }
    }
  })
})
