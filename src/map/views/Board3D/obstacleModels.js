import * as THREE from 'three'
import sharkModel from './sharkModel'

// Same mesh factory for the live match, the board catalog, and the model gallery.
export const OBSTACLE_TYPES = Object.freeze(['Shark', 'Stone', 'Island', 'Storm', 'Cyclone'])

// Smooth, deterministic variation: every obstacle has a different phase without
// frame-by-frame Math.random() jitter or new geometries during animation.
function noise(seed) {
  const value = Math.sin(seed * 127.1 + 78.233) * 43758.5453
  return value - Math.floor(value)
}

export function sampleCycloneWander(time, phase = 0) {
  const t = Math.max(0, time)
  const x = .17 * Math.sin(t * .57 + phase * .39) +
    .065 * Math.sin(t * 1.31 + phase * .83)
  const z = .15 * Math.sin(t * .49 + phase * .67 + 1.8) +
    .065 * Math.cos(t * 1.17 + phase * .37)
  return { x, z }
}

export function sampleStormLightning(time, phase = 0) {
  const adjusted = Math.max(0, time + phase * .071)
  const cycle = Math.floor(adjusted / 9)
  const within = adjusted - cycle * 9
  const positions = [.55, 1.9, 3.15, 5.4, 7.35]
  for (let i = 0; i < positions.length; i++) {
    const seed = cycle * 31 + i * 7 + phase * .23
    if (noise(seed + 17) < .16) continue
    const start = positions[i] + (noise(seed + 2) - .5) * .63
    const local = within - start
    const duration = .07 + noise(seed + 5) * .115
    // Occasional two-part flash: irregular timing without random mesh rebuilds.
    const active = (local >= 0 && local < duration) ||
      (noise(seed + 11) > .55 && local >= duration + .065 && local < duration + .13)
    if (active) return { visible: true, variant: Math.floor(noise(seed + 23) * 5) }
  }
  return { visible: false, variant: 0 }
}

function tube(parent, helpers, points, radius, color, options = {}) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)))
  const result = helpers.mesh(new THREE.TubeGeometry(curve, 24, radius, 5, false), color, parent, options)
  result.castShadow = false
  return result
}

function foamArc(parent, helpers, radius, start, length, color = '#d7fff1') {
  const arc = helpers.mesh(
    new THREE.TorusGeometry(radius, .017, 5, 28, length),
    color, parent, { transparent: true, opacity: .80, depthWrite: false }
  )
  arc.rotation.x = -Math.PI / 2
  arc.rotation.z = start
  arc.position.y = .025
  arc.castShadow = false
  return arc
}

function crag(parent, helpers, x, z, height, radius, lean, colors) {
  const geometry = new THREE.BufferGeometry()
  const vertices = [], shading = []
  const sides = 7
  function vertex(p) { vertices.push(...p) }
  function triangle(a, b, c, tint) {
    const color = new THREE.Color(tint)
    for (const v of [a, b, c]) {
      vertex(v)
      shading.push(color.r, color.g, color.b)
    }
  }
  const bottom = [], shoulder = []
  for (let i = 0; i < sides; i++) {
    const angle = i / sides * Math.PI * 2
    const irregularity = .84 + noise(i * 7 + height * 13) * .22
    bottom.push([x + Math.cos(angle) * radius * irregularity, .045,
      z + Math.sin(angle) * radius * irregularity])
    shoulder.push([x + Math.cos(angle) * radius * .60 + lean * .43, height * .58,
      z + Math.sin(angle) * radius * .58])
  }
  const peak = [x + lean, height, z - radius * .13]
  for (let i = 0; i < sides; i++) {
    const next = (i + 1) % sides
    triangle(bottom[i], bottom[next], shoulder[i], colors[i % colors.length])
    triangle(bottom[next], shoulder[next], shoulder[i], colors[i % colors.length])
    triangle(shoulder[i], shoulder[next], peak, colors[(i + 2) % colors.length])
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(shading, 3))
  geometry.computeVertexNormals()
  const object = helpers.mesh(geometry, '#ffffff', parent,
    { vertexColors: true, side: THREE.DoubleSide, roughness: .83, flatShading: true })
  object.name = 'stone-crag'
  return object
}

function stoneModel(parent, helpers) {
  // Warm sandstone peaks inspired by the R1 Stone card.
  crag(parent, helpers, -.15, -.03, 1.15, .43, .09,
    ['#f2b66d', '#dc8b40', '#b85c25', '#8f431d', '#cb7130', '#ffd299', '#e79a50'])
  crag(parent, helpers, .24, .14, .83, .32, -.08,
    ['#e9a35a', '#c96f2c', '#9f481e', '#da843b', '#ffcb86', '#bd6229'])
  const ripples = [[.44,.3,1.4],[.50,3.0,1.1]].map(([r, a, len]) => foamArc(parent, helpers, r, a, len))
  return (time, phase = 0, reducedMotion = false) => {
    ripples.forEach((arc, index) => {
      const pulse = reducedMotion ? 0 : Math.sin(time * 1.25 + phase * .3 + index * 2)
      arc.scale.setScalar(1 + .055 * pulse)
      arc.rotation.z = (index === 0 ? .3 : 3) + (reducedMotion ? 0 : .08 * Math.sin(time * .65 + index))
    })
  }
}

function palm(parent, helpers, x, z, height, lean, angleOffset) {
  const { sphere, rod, mesh } = helpers
  const base = 0
  const crown = [x + lean, base + height, z]
  const points = []
  for (let i = 0; i <= 6; i++) {
    const t = i / 6
    points.push([x + lean * t * t, base + height * t, z])
  }
  for (let i = 0; i < 6; i++) {
    const width = .052 - i * .004
    rod(parent, i % 2 ? '#ba6d32' : '#d38a43', points[i], points[i + 1], width)
  }
  const leaves = new THREE.Group()
  leaves.position.set(...crown)
  parent.add(leaves)

  for (let i = 0; i < 8; i++) {
    const frond = new THREE.Group()
    frond.rotation.y = angleOffset + i / 8 * Math.PI * 2
    leaves.add(frond)
    const positions = [], indices = []
    for (let j = 0; j <= 8; j++) {
      const t = j / 8
      const width = Math.pow(Math.sin(t * Math.PI), .85) * (.075 + (i % 3) * .009)
      const dip = .095 * Math.sin(t * Math.PI) - t * t * .28
      const reach = t * (.32 + (i % 3) * .03)
      positions.push(-width, dip, reach, 0, dip + .026, reach, width, dip, reach)
      if (j < 8) {
        const k = j * 3
        indices.push(k, k+3, k+1, k+1, k+3, k+4, k+1, k+4, k+2, k+2, k+4, k+5)
      }
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setIndex(indices)
    geometry.computeVertexNormals()
    const leaf = mesh(geometry, i % 3 === 0 ? '#b5dc54' : '#68b743',
      frond, { side: THREE.DoubleSide, roughness: .8 })
    leaf.castShadow = false
  }
  for (const a of [0, 2.2, 4.4]) {
    sphere(leaves, '#8f6738', [Math.sin(a) * .055, -.08, Math.cos(a) * .06],
      [.07,.075,.066], 1)
  }
}

function islandModel(parent, helpers) {
  const { sphere } = helpers
  const sandGroup = new THREE.Group()
  sandGroup.name = 'island-sand'
  parent.add(sandGroup)
  const sand = sphere(sandGroup, '#f8b348', [0,.09,0],[.58,.16,.49],2)
  sand.name = 'island-orange-sand'
  sphere(sandGroup, '#f5cf78', [-.11,.188,.09],[.38,.024,.31],2)
  for (const [x,z] of [[-.45,-.12],[.43,.15]]) {
    sphere(sandGroup, '#ffe0a3', [x,.16,z],[.06,.018,.05],1)
  }
  const shoreFoam = [foamArc(sandGroup, helpers, .55, .25, 1.6),
    foamArc(sandGroup, helpers, .57, 3.25, 1.35)]
  const palms = [[-.22, -.07, 1.02, -.20, -.35], [.17, .10, .76, .17, .60]].map(([x,z,height,lean,angle]) => {
    const tree = new THREE.Group()
    tree.name = 'island-palm'
    tree.position.set(x, .22, z)
    parent.add(tree)
    palm(tree, helpers, 0, 0, height, lean, angle)
    return tree
  })
  // Find the nearest point on the island's elliptical shore for each palm.
  const coconutPaths = palms.map((tree, index) => {
    const x = tree.position.x + (index === 0 ? -.20 : .17), z = tree.position.z
    let nearest = null, best = Infinity
    for (let i = 0; i < 128; i++) {
      const angle = i * Math.PI * 2 / 128
      const shoreX = .58 * Math.cos(angle), shoreZ = .49 * Math.sin(angle)
      const distance = Math.hypot(shoreX - x, shoreZ - z)
      if (distance < best) { best = distance; nearest = { x: shoreX, z: shoreZ } }
    }
    const dx = nearest.x - x, dz = nearest.z - z
    const length = Math.hypot(dx, dz) || 1
    return { x, z, endX: nearest.x + dx / length * .35, endZ: nearest.z + dz / length * .35 }
  })
  const coconut = sphere(parent, '#8f6738', [0,0,0], [.075,.075,.075], 1)
  coconut.name = 'island-falling-coconut'
  coconut.visible = false
  return (time, phase = 0, reducedMotion = false) => {
    palms.forEach((tree, i) => {
      tree.rotation.z = reducedMotion ? 0 : .035 * Math.sin(time * .9 + phase * .31 + i * 1.7)
      tree.rotation.x = reducedMotion ? 0 : .025 * Math.sin(time * .7 + phase * .19 + i)
    })
    shoreFoam.forEach((arc, i) => {
      const pulse = reducedMotion ? 0 : Math.sin(time * 1.05 + phase * .25 + i * 2)
      arc.scale.setScalar(1 + .06 * pulse)
      arc.rotation.z = (i === 0 ? .25 : 3.25) + (reducedMotion ? 0 : .05 * Math.sin(time * .7 + i))
    })
    const cycle = Math.floor((time + phase * 1.7) / 13)
    const t = (time + phase * 1.7) % 13
    coconut.visible = !reducedMotion && t < 3
    if (coconut.visible) {
      const index = Math.floor(noise(cycle * 9 + phase * 3) * 2) % 2
      const { x: startX, z: startZ, endX, endZ } = coconutPaths[index]
      const fall = THREE.MathUtils.clamp(t / .85, 0, 1)
      const roll = THREE.MathUtils.clamp((t - .85) / 1.8, 0, 1)
      const startY = .22 + (index === 0 ? 1.02 : .76)
      coconut.position.set(THREE.MathUtils.lerp(startX, endX, roll),
        .26 + (startY - .26) * (1 - fall * fall) - .42 * THREE.MathUtils.smoothstep(roll, .7, 1),
        THREE.MathUtils.lerp(startZ, endZ, roll))
      coconut.rotation.set(roll * 9, 0, roll * 6)
    }
  }
}

function cloudCluster(parent, sphere, color) {
  const cloud = new THREE.Group()
  parent.add(cloud)
  ;[
    [-.31,.80,0,.21],[-.14,.94,-.08,.25],[.14,.91,-.02,.27],
    [.35,.78,.06,.21],[0,.76,.20,.25],[-.15,.73,.22,.19]
  ].forEach(([x,y,z,r], i) => {
    sphere(cloud, i % 3 === 0 ? '#a4b2c0' : color,
      [x,y,z], [r,r*.82,r*.9], 2)
  })
  return cloud
}

function lightningShape(parent, helpers, variant) {
  const bolt = new THREE.Group()
  parent.add(bolt)
  const points = []
  const startingX = -.16 + noise(variant + 2) * .32
  let x = startingX
  let z = .22
  for (let i = 0; i <= 7; i++) {
    if (i > 0) {
      x += (noise(variant * 17 + i * 4) - .5) * .20
      z += (noise(variant * 23 + i * 3) - .5) * .09
    }
    points.push([x, .77 - i * .09, z])
  }
  function stroke(path, width, color, glow = false) {
    // LineCurve3 segments preserve the sharp forks of lightning.
    const curve = new THREE.CurvePath()
    for (let i = 0; i < path.length - 1; i++) {
      curve.add(new THREE.LineCurve3(
        new THREE.Vector3(...path[i]), new THREE.Vector3(...path[i + 1])
      ))
    }
    const mesh = helpers.mesh(
      new THREE.TubeGeometry(curve, path.length * 6, width, 5, false),
      color, bolt, { emissive: color, emissiveIntensity: glow ? 1.5 : .9,
        transparent: glow, opacity: glow ? .30 : 1,
        depthWrite: !glow, roughness: .3 }
    )
    mesh.castShadow = false
    return mesh
  }
  stroke(points, .026, '#9de5ff', true)
  stroke(points, .011, '#fff6c7')
  const split = 2 + (variant % 3)
  const branch = [
    points[split],
    [points[split][0] + (variant % 2 ? -.13 : .13), points[split][1] - .11, points[split][2] + .05],
    [points[split][0] + (variant % 2 ? -.22 : .23), points[split][1] - .21, points[split][2] + .08]
  ]
  stroke(branch, .009, '#e3f8ff')
  // No torus or circular blue disk beneath the storm cloud.
  return bolt
}

function stormModel(parent, helpers) {
  const { sphere, rod } = helpers
  const cloud = cloudCluster(parent, sphere, '#647b95')
  const lightning = Array.from({length:5}, (_,i) => lightningShape(parent, helpers, i))
  const rain = new THREE.Group()
  parent.add(rain)
  for (const [x,z] of [[-.36,.13],[-.20,-.13],[0,.25],[.16,-.18],[.34,.09]]) {
    rod(rain, '#80d9f0', [x,.65,z], [x-.045,.36,z], .016)
  }
  for (const [r,a] of [[.25,.3],[.35,2.4]]) foamArc(parent, helpers, r, a, .95)
  return (time, phase = 0) => {
    cloud.position.y = Math.sin(time * 1.18 + phase) * .026
    cloud.rotation.y = Math.sin(time * .32 + phase) * .08
    rain.position.y = Math.sin(time * 2.9 + phase) * .075
    const flash = sampleStormLightning(time, phase)
    lightning.forEach((bolt, i) => { bolt.visible = flash.visible && flash.variant === i })
  }
}

function cycloneModel(parent, helpers) {
  const { mesh, sphere } = helpers
  const drift = new THREE.Group()
  parent.add(drift)
  const vortex = new THREE.Group()
  drift.add(vortex)

  const funnel = mesh(new THREE.CylinderGeometry(.37,.075,1.16,22,1,true),
    '#42bad0', vortex, { transparent:true, opacity:.62, depthWrite:false,
      side:THREE.DoubleSide, roughness:.24 })
  funnel.position.y = .66
  const main = [], secondary = []
  for (let i = 0; i <= 70; i++) {
    const t = i / 70
    const a = t * Math.PI * 6
    const radius = .09 + t * .29
    main.push([Math.cos(a)*radius,.10+t*1.16,Math.sin(a)*radius])
    secondary.push([Math.cos(a+.35)*(radius+.044),.10+t*1.16,Math.sin(a+.35)*(radius+.044)])
  }
  tube(vortex, helpers, main, .040, '#d2ffff')
  tube(vortex, helpers, secondary, .018, '#efffff')

  // A larger, energetic cloud crown; foam follows the wandering waterspout.
  const crown = new THREE.Group()
  drift.add(crown)
  for (const [x,z,s] of [[0,0,.23],[-.25,.04,.16],[.24,.08,.17],[0,-.19,.15]]) {
    sphere(crown, '#c5e0e8', [x,1.36,z], [s,s*.72,s], 2)
  }
  const foam = new THREE.Group()
  drift.add(foam)
  const arcs = [
    foamArc(foam, helpers, .31, .3, 2.25),
    foamArc(foam, helpers, .43, 3.5, 1.65),
    foamArc(foam, helpers, .50, 1.0, 1.05)
  ]
  return (time, phase = 0) => {
    const wander = sampleCycloneWander(time, phase)
    drift.position.set(wander.x, 0, wander.z)
    vortex.rotation.y = time * .9 + phase * .31
    vortex.rotation.z = .055 * Math.sin(time * .9 + phase)
    crown.rotation.y = -time * .33
    crown.position.y = .025 * Math.sin(time * 1.5 + phase)
    foam.rotation.y = -time * .15
    arcs[0].scale.setScalar(1 + .09*Math.sin(time * 1.3+phase))
    arcs[1].scale.setScalar(1 + .06*Math.sin(time * 1.1+phase+2))
  }
}

export function createObstacleModel(type, helpers) {
  const object = new THREE.Group()
  object.name = 'obstacle-' + type
  let update = () => {}

  switch (type) {
    case 'Shark': {
      const shark = sharkModel.create({
        settings: sharkModel.defaults,
        helpers: {
          mesh: helpers.mesh,
          ripple(parent, radius) {
            return foamArc(parent, helpers, radius, .3, Math.PI * 1.55)
          }
        }
      })
      object.add(shark.object)
      update = (time, phase) => shark.update(time, phase)
      break
    }
    case 'Stone':
      update = stoneModel(object, helpers)
      break
    case 'Island':
      update = islandModel(object, helpers)
      break
    case 'Storm':
      update = stormModel(object, helpers)
      break
    case 'Cyclone':
      update = cycloneModel(object, helpers)
      break
    default:
      throw new Error('Unsupported Surf King obstacle: ' + type)
  }
  return { object, update }
}
