import * as THREE from 'three'
import { sampleSharkAnimation } from './surfModels'

// A single dorsal fin remains the visual language for the shark obstacle.
export default {
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

    const wake = helpers.ripple(object, .40)
    return {
      object,
      update(time, phase) {
        const pose = sampleSharkAnimation(time, phase)
        body.position.set(pose.x, .12 + pose.bob, pose.z)
        body.rotation.set(0, pose.heading, pose.roll)
        wake.position.set(pose.x, .10, pose.z)
        wake.rotation.z = -pose.heading
        wake.scale.set(pose.rippleScale, pose.rippleScale * .86, 1)
      }
    }
  }
}
