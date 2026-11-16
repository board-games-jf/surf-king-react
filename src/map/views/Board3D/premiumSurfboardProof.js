import * as THREE from 'three'

// Isolated geometry proof for the approved surfboard art direction (#33).
// Horizontal x-axis is the board length; y is up; z is cross-deck.
// This proof must be visually reviewed before replacing the shared board.
const SHAPES = Object.freeze({
  shortboard: { length: 1.82, halfWidth: .25, tail: .89 },
  fish: { length: 1.65, halfWidth: .285, tail: .93 },
  longboard: { length: 2.12, halfWidth: .25, tail: .96 }
})

const lerp = (a, b, t) => a + (b - a) * t

function widthAt(t, shape) {
  const shoulder = Math.pow(Math.sin(Math.PI * t), .68)
  // Keep the center broad, with a rounder rear and a finer nose.
  return shape.halfWidth * shoulder * (shape.tail + (1 - shape.tail) * (1 - t))
}

function rockerAt(t) {
  return .035 * Math.pow(2 * t - 1, 2)
}

function thicknessAt(t) {
  return .008 + .059 * Math.pow(Math.sin(Math.PI * t), .52)
}

function makeHullGeometry(shape) {
  const longitudinal = 94
  const around = 36
  const vertices = []
  const indices = []
  for (let i = 0; i <= longitudinal; i++) {
    const t = .002 + .996 * i / longitudinal
    const x = (t - .5) * shape.length
    const width = widthAt(t, shape)
    const rocker = rockerAt(t)
    const thickness = thicknessAt(t)
    for (let j = 0; j < around; j++) {
      const angle = j / around * Math.PI * 2
      vertices.push(x, .10 + rocker + thickness * Math.cos(angle),
        width * Math.sin(angle))
    }
  }
  for (let i = 0; i < longitudinal; i++) {
    for (let j = 0; j < around; j++) {
      const next = (j + 1) % around
      const a = i * around + j
      const b = i * around + next
      const c = (i + 1) * around + j
      const d = (i + 1) * around + next
      indices.push(a, b, c, b, d, c)
    }
  }
  for (let j = 1; j < around - 1; j++) {
    indices.push(0, (j + 1), j)
    const last = longitudinal * around
    indices.push(last, last + j, last + j + 1)
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

function makeDeckStripeGeometry(shape) {
  const segments = 88
  const vertices = []
  const indices = []
  for (let i = 0; i <= segments; i++) {
    const t = .045 + .91 * i / segments
    const width = widthAt(t, shape)
    const stripeWidth = Math.min(width * .44, .047) *
      Math.pow(Math.sin(Math.PI * (t - .045) / .91), .38)
    for (const sign of [-1, 1]) {
      const z = sign * stripeWidth
      const half = thicknessAt(t)
      const y = .10 + rockerAt(t) +
        half * Math.sqrt(Math.max(0, 1 - (z / width) ** 2)) + .003
      vertices.push((t - .5) * shape.length, y, z)
    }
    if (i) {
      const a = 2 * (i - 1), b = 2 * i
      indices.push(a, b, a + 1, a + 1, b, b + 1)
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

function makeFin(shape) {
  const fin = new THREE.Shape()
  const x = -shape.length * .27
  fin.moveTo(x - .13, .108)
  fin.bezierCurveTo(x - .135, -.014, x - .17, -.108, x - .11, -.14)
  fin.bezierCurveTo(x - .005, -.136, x + .08, .018, x + .15, .108)
  fin.closePath()
  const geometry = new THREE.ExtrudeGeometry(fin, {
    depth: .014, bevelEnabled: true, bevelThickness: .005,
    bevelSize: .003, bevelSegments: 2, curveSegments: 14
  })
  const mesh = new THREE.Mesh(geometry, new THREE.MeshPhysicalMaterial({
    color: '#164753', roughness: .35, metalness: .10, clearcoat: .45
  }))
  mesh.name = 'premium-board-fin'
  mesh.position.z = -.007
  return mesh
}

export function createPremiumSurfboardProof(type = 'shortboard', color = '#33b9c4') {
  const shape = SHAPES[type] || SHAPES.shortboard
  const group = new THREE.Group()
  group.name = 'premium-surfboard-proof'

  const hull = new THREE.Mesh(makeHullGeometry(shape),
    new THREE.MeshPhysicalMaterial({
      color, roughness: .28, metalness: .04, clearcoat: .7,
      clearcoatRoughness: .22, side: THREE.DoubleSide
    }))
  hull.name = 'premium-board-hull'
  group.add(hull)

  const stripe = new THREE.Mesh(makeDeckStripeGeometry(shape),
    new THREE.MeshPhysicalMaterial({
      color: '#fff8ed', roughness: .43, metalness: 0,
      clearcoat: .42, side: THREE.DoubleSide, depthWrite: false
    }))
  stripe.name = 'premium-deck-stripe'
  stripe.renderOrder = 1
  group.add(stripe)
  group.add(makeFin(shape))
  return group
}

export function getPremiumBoardShape(type) {
  const source = SHAPES[type] || SHAPES.shortboard
  return { ...source }
}
