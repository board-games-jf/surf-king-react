import * as THREE from 'three'
import { createScenePrimitives } from './scenePrimitives'
import { createObstacleModel, OBSTACLE_TYPES } from './obstacleModels'

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
