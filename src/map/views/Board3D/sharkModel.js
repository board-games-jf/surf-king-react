import * as THREE from 'three'
import { sampleSharkAnimation } from './surfModels'

// The shark is deliberately represented by a dorsal fin, not an entire body.
const sharkModel = {
  defaults: { color: '#527a92' },
  create({ settings, helpers }) {
    const object = new THREE.Group()
    const body = new THREE.Group()
    object.add(body)

    const finRoot = new THREE.Group()
    body.add(finRoot)
    finRoot.rotation.y = Math.PI / 2

    const shape = new THREE.Shape()
    shape.moveTo(-.34, 0)
    shape.bezierCurveTo(-.19, .36, .13, .70, .33, .72)
    shape.quadraticCurveTo(.23, .39, .13, .25)
    shape.quadraticCurveTo(.22, .09, .32, 0)
    shape.closePath()

    const fin = helpers.mesh(new THREE.ExtrudeGeometry(shape, {
      depth: .10,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: .035,
      bevelThickness: .032,
      curveSegments: 16
    }), settings.color, finRoot, { roughness: .43, metalness: .08 })
    fin.name = 'shark-fin'
    fin.position.z = -.05

    const accent = new THREE.Shape()
    accent.moveTo(-.12, .05)
    accent.quadraticCurveTo(.02, .17, .14, .13)
    accent.lineTo(.24, .05)
    accent.closePath()
    const inset = helpers.mesh(new THREE.ShapeGeometry(accent), '#a6c0c6', finRoot, {
      roughness: .46,
      side: THREE.DoubleSide
    })
    inset.position.z = .093
    inset.name = 'shark-fin-accent'

    // Only partial foam trails: the water surface itself belongs to the map.
    const wake = helpers.ripple(object, .38)
    const trailingFoam = helpers.ripple(object, .56)
    trailingFoam.scale.set(.88, .68, .88)
    const bubble = helpers.mesh(
      new THREE.IcosahedronGeometry(1, 1), '#c6f5e9', body,
      { transparent: true, opacity: .84, depthWrite: false })
    bubble.scale.set(.057, .022, .044)
    bubble.position.set(-.23, .045, .10)

    return {
      object,
      update(time, phase = 0) {
        const pose = sampleSharkAnimation(time, phase)
        // Overlaid smooth frequencies create a non-repeating, bounded glide.
        const x = pose.x + .17 * Math.sin(time * .61 + phase * .43)
        const z = pose.z + .17 * Math.sin(time * .47 + phase * .71 + 1.5)
        const heading = pose.heading + .18 * Math.sin(time * .36 + phase)
        body.position.set(x, .12 + pose.bob + .013 * Math.sin(time * 1.1 + phase), z)
        body.rotation.set(0, heading, pose.roll)
        finRoot.rotation.z = .04 * Math.sin(time * 1.1 + phase)

        wake.position.set(x, .035, z)
        wake.rotation.z = .3 - heading
        wake.scale.set(pose.rippleScale, pose.rippleScale * .86, 1)
        trailingFoam.position.set(x - .10, .025, z - .09)
        trailingFoam.rotation.z = 1.7 - heading
        const ripple = 1 + Math.sin(time * 1.4 + phase) * .09
        trailingFoam.scale.set(.88 * ripple, .68 * ripple, 1)
      }
    }
  }
}

export default sharkModel
