import * as THREE from 'three'
import { createScenePrimitives } from './scenePrimitives'
import { createObstacleModel, OBSTACLE_TYPES, sampleCycloneWander, sampleStormLightning } from './obstacleModels'

describe('3D obstacle geometry', () => {
  test.each(OBSTACLE_TYPES)('%s is a bounded, animatable Three.js model', (type) => {
    const scene = new THREE.Scene()
    const model = createObstacleModel(type, createScenePrimitives(scene))
    scene.add(model.object)

    const meshes = []
    model.object.traverse(node => {
      if (node.isMesh) meshes.push(node)
    })
    expect(meshes.length).toBeGreaterThan(2)
    expect(model.object.name).toBe('obstacle-' + type)
    expect(typeof model.update).toBe('function')

    const bounds = new THREE.Box3().setFromObject(model.object)
    const size = bounds.getSize(new THREE.Vector3())
    expect(size.x).toBeLessThan(1.6)
    expect(size.y).toBeLessThan(1.6)
    expect(size.z).toBeLessThan(1.6)
    expect(bounds.isEmpty()).toBe(false)

    expect(() => model.update(0, 1)).not.toThrow()
    expect(() => model.update(3.14, 1)).not.toThrow()
    model.object.traverse(node => {
      expect(node.position.toArray().every(Number.isFinite)).toBe(true)
    })
  })

  test('shark has a sculpted fin rather than a flat image', () => {
    const model = createObstacleModel('Shark', createScenePrimitives(new THREE.Scene()))
    let fin = null
    model.object.traverse(node => {
      if (node.name === 'shark-fin') fin = node
    })
    expect(fin).toBeTruthy()
    expect(fin.geometry.type).toBe('ExtrudeGeometry')
  })

  test('unknown game obstacle types fail explicitly', () => {
    expect(() => createObstacleModel('Unknown', createScenePrimitives(new THREE.Scene())))
      .toThrow('Unsupported Surf King obstacle: Unknown')
  })
})


describe('card silhouette and environmental motion', () => {
  const make = type => createObstacleModel(type, createScenePrimitives(new THREE.Scene()))

  test('the Stone uses two pointed sandstone crags', () => {
    const model = make('Stone')
    const crags = []
    model.object.traverse(node => {
      if (node.name === 'stone-crag') crags.push(node)
    })
    expect(crags).toHaveLength(2)
    crags.forEach(crag => {
      expect(crag.geometry.type).toBe('BufferGeometry')
      expect(crag.geometry.attributes.color).toBeDefined()
    })
  })

  test('the Island has orange sand and two recognizable palm crowns', () => {
    const model = make('Island')
    let sand = null
    const leafyMeshes = []
    model.object.traverse(node => {
      if (node.name === 'island-orange-sand') sand = node
      if (node.geometry?.type === 'BufferGeometry' &&
          node.material?.side === THREE.DoubleSide) leafyMeshes.push(node)
    })
    expect(sand).toBeTruthy()
    expect(leafyMeshes.length).toBeGreaterThanOrEqual(14)
  })

  test.each(['Shark', 'Storm', 'Cyclone'])('%s has no opaque blue water cylinder beneath it', type => {
    const model = make(type)
    const opaqueDisks = []
    model.object.traverse(node => {
      const p = node.geometry?.parameters
      if (node.isMesh && node.geometry?.type === 'CylinderGeometry' &&
          p.height < .16 && p.radiusBottom > .40) opaqueDisks.push(node)
    })
    expect(opaqueDisks).toHaveLength(0)
  })

  test('cyclone wanders smoothly and remains within a 0.34-unit center radius', () => {
    for (let phase = 0; phase < 5; phase++) {
      for (let t = 0; t <= 120; t += .25) {
        const a = sampleCycloneWander(t, phase)
        const b = sampleCycloneWander(t, phase)
        const next = sampleCycloneWander(t + .02, phase)
        expect(a).toEqual(b)
        expect(Math.hypot(a.x, a.z)).toBeLessThan(.34)
        expect(Math.hypot(a.x - next.x, a.z - next.z)).toBeLessThan(.02)
      }
    }
  })

  test('lightning is seeded, varied, and not constantly visible', () => {
    const states = []
    for (let t = 0; t < 36; t += .02) {
      const state = sampleStormLightning(t, 7)
      expect(state).toEqual(sampleStormLightning(t, 7))
      states.push(state)
    }
    expect(states.some(s => s.visible)).toBe(true)
    expect(states.some(s => !s.visible)).toBe(true)
    expect(new Set(states.filter(s => s.visible).map(s => s.variant)).size).toBeGreaterThan(1)
  })

  test('shark moves over time and all animated model transforms stay finite', () => {
    for (const type of ['Shark', 'Storm', 'Cyclone']) {
      const model = make(type)
      const positions = []
      for (const time of [0, 1.3, 3, 5.6]) {
        model.update(time, 13)
        let positionSum = 0
        model.object.traverse(node => {
          expect(node.position.toArray().every(Number.isFinite)).toBe(true)
          positionSum += node.position.x + node.position.y + node.position.z
        })
        positions.push(positionSum)
      }
      expect(new Set(positions.map(x => x.toFixed(3))).size).toBeGreaterThan(1)
    }
  })
})
