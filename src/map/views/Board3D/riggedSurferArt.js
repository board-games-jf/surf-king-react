import * as THREE from 'three'
import {
  BOARD_COLORS, HAIR_COLORS, SKIN_TONES, SURFWEAR_COLORS, normalizeSurferStyle
} from './surferStyle'
import { normalizeSurferPose, sampleSurferPose } from './surferPoses'

// This preview retains the imported skinned body and armature.
// Only appearance materials and a handful of removable accessories are authored here.
export function resolveRiggedPalette(options) {
  const style = normalizeSurferStyle(options)
  return {
    style,
    skin: SKIN_TONES[style.skinTone],
    hair: HAIR_COLORS[style.hairColor],
    suit: SURFWEAR_COLORS[style.surfwear],
    board: BOARD_COLORS[style.boardColor]
  }
}

function material(color, roughness = .86, options = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, ...options })
}

function smoothScalp() {
  // Rounded, asymmetrical hairline with continuous surface instead of a pile of spheres.
  const segments = 36
  const rings = [
    { y: 1.725, rx: .151, rz: .116 },
    { y: 1.757, rx: .168, rz: .144 },
    { y: 1.791, rx: .154, rz: .132 },
    { y: 1.832, rx: .115, rz: .095 },
    { y: 1.857, rx: .012, rz: .011 }
  ]
  const positions = [], indices = []
  rings.forEach((ring, ri) => {
    for (let i = 0; i < segments; i++) {
      const a = i * Math.PI * 2 / segments
      const front = Math.max(0, Math.cos(a))
      const sweep = .012 * Math.sin(a * 2.1 + .6)
      positions.push(
        Math.sin(a) * ring.rx + sweep,
        ring.y - (ri < 2 ? .016 * front : 0),
        -.003 + Math.cos(a) * ring.rz
      )
      if (ri) {
        const prev = (ri - 1) * segments, curr = ri * segments
        const next = (i + 1) % segments
        indices.push(prev + i, prev + next, curr + i)
        indices.push(curr + i, prev + next, curr + next)
      }
    }
  })
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

function hairLocks(group, style, hairMaterial) {
  const addLock = (points, thickness) => {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)))
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 12, thickness, 6, false), hairMaterial)
    mesh.name = 'rigged-hair-strand'
    group.add(mesh)
  }
  if (style.hairstyle === 'short') {
    for (const x of [-.098, -.032, .037, .106]) {
      addLock([[x, 1.828, .055], [x - .019, 1.813, .116], [x - .033, 1.763, .137]], .020)
    }
  } else if (style.hairstyle === 'wavy') {
    for (const side of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const x = side * (.126 + i * .018)
        addLock([[x, 1.79, .025], [x + side * .023, 1.69, .02],
          [x - side * .016, 1.60, .035], [x + side * .016, 1.53 - i * .03, -.014]], .025)
      }
    }
  } else {
    addLock([[.065, 1.816, -.077], [.19, 1.775, -.15],
      [.217, 1.675, -.19], [.169, 1.575, -.205]], .049)
    const band = new THREE.Mesh(new THREE.TorusGeometry(.053, .014, 6, 24), material('#f4d76e'))
    band.rotation.x = Math.PI / 2
    band.position.set(.195, 1.75, -.17)
    band.name = 'rigged-hair-band'
    group.add(band)
  }
}

function buildBoard(type, paint) {
  // Genuine tapered and bevelled 3D board, displayed upright beside the avatar.
  const group = new THREE.Group()
  group.name = 'cosmetic-surfboard'
  const width = type === 'fish' ? .27 : type === 'longboard' ? .235 : .21
  const height = type === 'longboard' ? 1.73 : type === 'fish' ? 1.34 : 1.51
  const half = height / 2
  const shape = new THREE.Shape()
  shape.moveTo(0, half)
  shape.bezierCurveTo(-width * .82, half * .88, -width, half * .26, -width, -.11)
  shape.bezierCurveTo(-width, -half * .64, -width * .83, -half * .93, -width * .50, -half)
  if (type === 'fish') {
    shape.lineTo(0, -half + .15)
    shape.lineTo(width * .50, -half)
  } else shape.quadraticCurveTo(0, -half - .018, width * .50, -half)
  shape.bezierCurveTo(width * .83, -half * .93, width, -half * .64, width, -.11)
  shape.bezierCurveTo(width, half * .26, width * .82, half * .88, 0, half)
  const hull = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, {
    depth: .065, bevelEnabled: true, bevelThickness: .016, bevelSize: .018,
    bevelSegments: 2, curveSegments: 16
  }), material(paint, .39))
  hull.name = 'styled-board-hull'
  group.add(hull)
  const strip = new THREE.Shape()
  strip.moveTo(0, half - .09)
  strip.lineTo(-.028, half - .20)
  strip.lineTo(-.028, -half + .20)
  strip.lineTo(0, -half + .13)
  strip.lineTo(.028, -half + .20)
  strip.lineTo(.028, half - .20)
  strip.closePath()
  const stripe = new THREE.Mesh(new THREE.ShapeGeometry(strip),
    material('#fff7e3', .52, { side: THREE.DoubleSide }))
  stripe.position.z = .083
  stripe.name = 'styled-board-deck-stripe'
  group.add(stripe)
  const finShape = new THREE.Shape()
  finShape.moveTo(-.056, 0)
  finShape.quadraticCurveTo(-.09, -.095, -.028, -.167)
  finShape.quadraticCurveTo(.043, -.09, .069, 0)
  const fin = new THREE.Mesh(new THREE.ExtrudeGeometry(finShape,
    { depth: .017, bevelEnabled: false, curveSegments: 12 }),
    material('#183c49'))
  fin.name = 'styled-board-fin'
  fin.position.set(0, -half + .26, -.045)
  fin.rotation.y = Math.PI / 2
  group.add(fin)
  group.position.set(.72, half + .08, -.20)
  group.rotation.set(0, -.19, -.095)
  return group
}

function createShoreStage() {
  const stage = new THREE.Group()
  stage.name = 'surfer-preview-stage'
  const ground = new THREE.Mesh(new THREE.CylinderGeometry(.95, 1.01, .075, 56),
    material('#dfc08e', .98))
  ground.position.set(.30, -.048, 0)
  stage.add(ground)
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(.64, 40),
    new THREE.MeshBasicMaterial({ color: '#597e77', transparent: true, opacity: .22, depthWrite: false }))
  shadow.rotation.x = -Math.PI / 2
  shadow.position.set(.27, -.004, .06)
  stage.add(shadow)
  return stage
}

export function decorateRiggedSurfer(loadedScene, choices, presentation = {}) {
  const pose = normalizeSurferPose(presentation.pose, presentation.boardMode ? 'surfing' : 'relaxed')
  const boardMode = presentation.boardMode === true || pose === 'surfing'
  const { style, skin, hair, suit, board } = resolveRiggedPalette(choices)
  const display = new THREE.Group()
  display.name = 'styled-rigged-surfer'
  const figure = new THREE.Group()
  figure.name = 'surfer-figure'
  display.add(figure)
  figure.add(loadedScene)
  const owner = new THREE.Group()
  owner.name = 'cosmetic-accessories'
  figure.add(owner)
  const skinColor = new THREE.Color(skin)
  const fabricColor = new THREE.Color(suit)
  const shortsColor = fabricColor.clone().multiplyScalar(.67)
  const cream = new THREE.Color('#f7eccc')
  const materials = []
  const swapped = []
  loadedScene.traverse(node => {
    if (!node.isSkinnedMesh) return
    const originalMaterial = node.material
    const originalGeometry = node.geometry
    const name = node.name || ''
    let replacement, geometry = originalGeometry
    if (name === 'Eyebrows') {
      replacement = material(hair, .95)
    } else if (name === 'Eyes') {
      replacement = material('#f8f6eb', .54)
    } else {
      geometry = originalGeometry.clone()
      const positions = geometry.getAttribute('position')
      const colors = new Float32Array(positions.count * 3)
      for (let i = 0; i < positions.count; i++) {
        const x = Math.abs(positions.getX(i)), y = positions.getY(i)
        let c = skinColor
        // Clothes are painted on the existing deforming body surface, not
        // simulated with non-skinned cylinders that would break during posing.
        if (y > .82 && y < 1.07 && x < .35) c = shortsColor
        else if (style.character === 'female') {
          // The cropped surf top colors the separately authored female skinned mesh.
          // Clothing remains cosmetic and follows the original skin weights.
          if (y >= 1.22 && y < 1.49 && x < .31) c = fabricColor
          else if (y >= 1.20 && y < 1.23 && x < .31) c = cream
        } else {
          if (y >= 1.07 && y < 1.49 && x < .31) c = fabricColor
          else if (y >= 1.485 && y < 1.515 && x < .31) c = cream
        }
        colors[i * 3] = c.r
        colors[i * 3 + 1] = c.g
        colors[i * 3 + 2] = c.b
      }
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      replacement = material('#ffffff', .88, { vertexColors: true })
    }
    materials.push(replacement)
    node.material = replacement
    node.geometry = geometry
    swapped.push({ node, originalMaterial, originalGeometry })
  })

  const hairMat = material(hair, .94, { side: THREE.DoubleSide })
  materials.push(hairMat)
  const hairGroup = new THREE.Group()
  hairGroup.name = 'surfer-hair-root'
  // The separately authored female base is slightly shorter with a smaller
  // head. Keep the sculpted hairstyle aligned to its actual head silhouette.
  if (style.character === 'female') {
    hairGroup.position.y = -.072
    hairGroup.scale.setScalar(.96)
  }
  owner.add(hairGroup)
  const cap = new THREE.Mesh(smoothScalp(), hairMat)
  cap.name = 'rigged-sculpted-hair'
  hairGroup.add(cap)
  hairLocks(hairGroup, style, hairMat)
  const surfboard = buildBoard(style.boardType, presentation.playerColor || board)
  if (boardMode) {
    // Keep the same skinned avatar and accessory hair, but place the
    // board flat under both feet inside a playable hex.
    figure.position.y = .11
    figure.rotation.y = Math.PI / 2
    surfboard.position.set(0, .025, 0)
    surfboard.rotation.set(-Math.PI / 2, 0, 0)
    display.add(surfboard)
    display.scale.setScalar(.68)
  } else {
    owner.add(surfboard)
    owner.add(createShoreStage())
  }

  // Animate from each authored GLB's own bind pose; never assume male and
  // female joints share the same absolute rest rotation.
  const sampleRest = sampleSurferPose(pose, 0, true)
  const rest = {}
  Object.keys(sampleRest).forEach(name => {
    const bone = loadedScene.getObjectByName(name)
    if (bone?.isBone) rest[name] = { bone, quaternion: bone.quaternion.clone() }
  })
  const euler = new THREE.Euler()
  const delta = new THREE.Quaternion()
  const animate = (seconds, reduceMotion = false) => {
    const offsets = sampleSurferPose(pose, seconds, reduceMotion)
    Object.entries(offsets).forEach(([name, xyz]) => {
      const joint = rest[name]
      if (!joint) return
      euler.set(xyz[0], xyz[1], xyz[2], 'XYZ')
      joint.bone.quaternion.copy(joint.quaternion)
        .multiply(delta.setFromEuler(euler))
    })
  }
  animate(0, true)
  return {
    display, surfboard, animate,
    dispose() {
      // A comparison mode must restore the untouched GLB reference pose.
      Object.values(rest).forEach(({ bone, quaternion }) => bone.quaternion.copy(quaternion))
      swapped.forEach(({ node, originalMaterial, originalGeometry }) => {
        if (node.geometry !== originalGeometry) node.geometry.dispose()
        node.material = originalMaterial
        node.geometry = originalGeometry
      })
      materials.forEach(m => m.dispose())
      const accessories = boardMode ? [owner, surfboard] : [owner]
      accessories.forEach(accessory => accessory.traverse(node => {
        if (node.geometry) node.geometry.dispose()
        if (node.material && !materials.includes(node.material)) node.material.dispose()
      }))
    }
  }
}
