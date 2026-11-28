import * as THREE from 'three'
import { createVictoryFireworks, sampleFirework, chooseFirework, writeRay } from './createVictoryFireworks'

test.each([0, .5, .999])('firework samples remain above the beach (%s)', value => {
    const spec = sampleFirework(() => value)
    const shore = -9.85 - spec.x * spec.x * .014 + Math.sin(spec.x * .5) * .12
    expect(Math.abs(spec.x)).toBeLessThanOrEqual(8)
    expect(spec.z).toBeLessThan(shore)
    expect(shore - spec.z).toBeLessThanOrEqual(1.31)
    expect(spec.radius).toBeLessThanOrEqual(1.25)
    expect(spec.interval).toBeGreaterThanOrEqual(1)
})

test('victory effects repeat with a fixed pool and stop on rewind, reduced motion and disposal', () => {
    const scene = new THREE.Scene()
    const effects = createVictoryFireworks(scene, () => .5)
    effects.update(0)
    expect(effects.group.visible).toBe(false)
    effects.setActive(true)
    effects.update(0)
    effects.update(.4)
    expect(effects.group.children.some(child => child.visible)).toBe(true)
    const pool = effects.group.children.slice()
    for (let time = 1; time < 100; time += .1) effects.update(time)
    expect(effects.group.children).toEqual(pool)
    effects.update(101, true)
    expect(effects.group.visible).toBe(false)
    effects.update(102)
    effects.update(102.4)
    expect(effects.group.children.some(child => child.visible)).toBe(true)
    effects.setActive(false)
    expect(effects.group.visible).toBe(false)
    effects.update(103)
    expect(effects.group.visible).toBe(false)
    effects.dispose()
    expect(scene.children).not.toContain(effects.group)
    effects.update(104)
})


test('samples close to each finish lane, prioritizing camera-visible origins with bounded retries', () => {
    for (const anchor of [-5.96, -1.99, 1.99, 5.96]) {
        for (const value of [0, .5, .999]) {
            const spec = sampleFirework(() => value, anchor)
            expect(Math.abs(spec.x - anchor)).toBeLessThanOrEqual(3.2)
        }
    }
    const score = jest.fn().mockReturnValueOnce(2).mockReturnValueOnce(.5)
    expect(chooseFirework(() => .5, 0, score)).toBeDefined()
    expect(score).toHaveBeenCalledTimes(2)
    const offscreen = jest.fn(() => Infinity)
    expect(chooseFirework(() => .5, 0, offscreen)).toBeDefined()
    expect(offscreen).toHaveBeenCalledTimes(8)
})

test('trails have real thickness and face the camera without extra scene objects', () => {
    const positions = new Float32Array(18)
    writeRay(positions, 0, 1, 0, .2, .7, 0, .05, 0)
    expect(positions[1] - positions[4]).toBeCloseTo(.1)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(36, 1.5, .1, 100)
    camera.position.set(2, 8, 3)
    camera.lookAt(2, 0, -8)
    camera.updateMatrixWorld()
    const effect = createVictoryFireworks(scene, () => .5)
    effect.setActive(true, 2)
    effect.update(0, false, camera)
    effect.update(.4, false, camera)
    const mesh = effect.group.children.find(child => child.visible)
    expect(mesh.isMesh).toBe(true)
    expect(mesh.material.toneMapped).toBe(false)
    expect(mesh.quaternion.equals(camera.quaternion)).toBe(true)
    expect(mesh.geometry.getAttribute('position').count).toBe(24 * 12)
    expect(mesh.geometry.getAttribute('color').count).toBe(24 * 12)
    effect.dispose()
})
