import * as THREE from 'three'
import sharkModel from './sharkModel'

// All five obstacles are real Three.js meshes. The figures stay within one
// playable hex and are driven exclusively by the public map snapshot.
export const OBSTACLE_TYPES = Object.freeze(['Shark', 'Stone', 'Island', 'Storm', 'Cyclone'])

function waterBase(parent, helpers, deep = false) {
  const { mesh } = helpers
  const bottom = mesh(
    new THREE.CylinderGeometry(.57, .59, .075, 36),
    deep ? '#176eaa' : '#168eac', parent, { roughness: .3, metalness: .08 }
  )
  bottom.position.y = .012
  const surface = mesh(
    new THREE.CylinderGeometry(.515, .52, .013, 36),
    deep ? '#1c9dbd' : '#25b7bd', parent, { roughness: .25, metalness: .12 }
  )
  surface.position.y = .055
  const foam = mesh(new THREE.TorusGeometry(.48, .019, 6, 48), '#d4f9ef', parent)
  foam.rotation.x = Math.PI / 2
  foam.position.y = .073
  return { surface, foam }
}

function curvedRibbon(parent, helpers, points, radius, color, options = {}) {
  return helpers.mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))), 32, radius, 6, false),
    color, parent, options
  )
}

function stoneModel(parent, { sphere, mesh }) {
  const rock = new THREE.Group()
  parent.add(rock)
  const pieces = [
    { p: [-.23, .17, -.07], s: [.27, .2, .30], c: '#778c91' },
    { p: [.20, .18, -.10], s: [.29, .20, .26], c: '#a2adb0' },
    { p: [0, .37, .07], s: [.42, .29, .35], c: '#9ba5a9' },
    { p: [-.18, .14, .24], s: [.25, .14, .20], c: '#819496' },
    { p: [.25, .12, .24], s: [.22, .15, .19], c: '#657e81' },
  ]
  pieces.forEach(({ p, s, c }, i) => {
    const part = sphere(rock, c, p, s, 1)
    part.rotation.set(.13 * i, .3 * i, -.09 * i)
  })
  for (const [x, z] of [[-.35,.15],[.32,-.10],[.15,.31]]) {
    sphere(rock, '#639d58', [x, .11, z], [.12, .035, .10], 1)
  }
  for (const [x, z] of [[-.25,.30],[-.15,.32],[.28,.23]]) {
    const shell = mesh(new THREE.TorusGeometry(.035, .012, 5, 10), '#e6d9b7', rock)
    shell.position.set(x, .19, z)
    shell.rotation.x = Math.PI / 2
  }
}

function islandModel(parent, helpers) {
  const { sphere, rod } = helpers
  sphere(parent, '#e7bb79', [0, .14, 0], [.55, .18, .48], 1)
  sphere(parent, '#6cae54', [0, .27, -.03], [.41, .13, .35], 1)
  for (const [x,z,s] of [[-.39,.22,.13],[.37,.12,.17],[-.25,-.30,.11]]) {
    sphere(parent, '#8d9798', [x, .19, z], [s, s * .75, s], 1)
  }
  const trunk = [[-.08,.29,-.04],[-.12,.47,-.06],[-.06,.65,-.08],[.04,.81,-.08]]
  for (let i=0; i<trunk.length-1; i++) {
    rod(parent, '#a77647', trunk[i], trunk[i+1], .057 - i*.008)
  }
  for (let i=0; i<7; i++) {
    const angle=i*Math.PI*2/7
    const leaf = sphere(parent, i%2 ? '#66b956' : '#41944e',
      [.04 + Math.sin(angle)*.17, .83, -.08 + Math.cos(angle)*.17],
      [.115,.047,.28], 1)
    leaf.rotation.y=angle
    leaf.rotation.x=.18
  }
  for (const [x,z,color] of [[-.28,.03,'#ee795f'],[.25,-.24,'#ffcf58']]) {
    sphere(parent, color, [x, .41, z], [.055,.035,.054], 1)
  }
}

function cloudCluster(parent, sphere, color) {
  const cloud = new THREE.Group()
  parent.add(cloud)
  ;[
    [-.31,.80,0,.21],[-.14,.94,-.08,.25],[.14,.91,-.02,.27],
    [.35,.78,.06,.21],[0,.76,.20,.25],[-.15,.73,.22,.19]
  ].forEach(([x,y,z,r],i) => {
    sphere(cloud, i%3===0 ? '#a4b2c0' : color, [x,y,z], [r,r*.82,r*.9], 2)
  })
  return cloud
}

function stormModel(parent, helpers) {
  const { sphere, rod } = helpers
  const base = waterBase(parent, helpers, true)
  const cloud = cloudCluster(parent, sphere, '#6d8198')
  const bolts = new THREE.Group()
  parent.add(bolts)
  for (const x of [-.20,.18]) {
    rod(bolts, '#ffcd64', [x,.65,.28], [x-.06,.49,.28], .035)
    rod(bolts, '#ffcd64', [x-.06,.49,.28], [x+.06,.47,.28], .035)
    rod(bolts, '#ffcd64', [x+.06,.47,.28], [x-.03,.31,.28], .031)
  }
  const rain = new THREE.Group()
  parent.add(rain)
  for (const [x,z] of [[-.36,.13],[-.20,-.13],[0,.25],[.16,-.18],[.34,.09]]) {
    rod(rain, '#7ad7f0', [x,.64,z], [x-.045,.36,z], .016)
  }
  return (time, phase) => {
    cloud.position.y = Math.sin(time*1.2+phase)*.023
    bolts.visible = Math.sin(time*4.1+phase) > -.35
    rain.position.y = Math.sin(time*2.4+phase)*.02
    base.foam.rotation.z = Math.sin(time*.8+phase)*.1
  }
}

function cycloneModel(parent, helpers) {
  const { mesh, sphere } = helpers
  const base = waterBase(parent, helpers)
  const vortex = new THREE.Group()
  parent.add(vortex)
  const funnel = mesh(new THREE.CylinderGeometry(.31,.07,.66,18,1,true),
    '#3ab7cf', vortex, { transparent:true, opacity:.70, depthWrite:false, side:THREE.DoubleSide, roughness:.26 })
  funnel.position.y=.43
  const spiral = []
  const paleSpiral = []
  for (let i=0; i<=48; i++) {
    const t=i/48, a=t*Math.PI*4
    const r=.11 + t*.21
    spiral.push([Math.cos(a)*r,.14+t*.67,Math.sin(a)*r])
    paleSpiral.push([Math.cos(a+.16)*(r+.045),.14+t*.67,Math.sin(a+.16)*(r+.045)])
  }
  curvedRibbon(vortex, helpers, spiral, .043, '#b7f5f2')
  curvedRibbon(vortex, helpers, paleSpiral, .018, '#e8fff8')
  const cloud = cloudCluster(parent, sphere, '#c2d9e7')
  cloud.position.y=.15
  cloud.scale.setScalar(.65)
  for (const [x,z] of [[-.37,.17],[.27,-.36],[.41,.11]]) {
    sphere(parent, '#d4fffa', [x,.14,z], [.045,.045,.05], 1)
  }
  return (time, phase) => {
    vortex.rotation.y = time*.43 + phase*.03
    cloud.rotation.y = -time*.15
    cloud.position.y = .15 + Math.sin(time*1.2+phase)*.02
    base.foam.rotation.z = time*.08
  }
}

export function createObstacleModel(type, helpers) {
  const object = new THREE.Group()
  object.name = 'obstacle-' + type
  let update = () => {}

  switch (type) {
    case 'Shark': {
      waterBase(object, helpers)
      const shark = sharkModel.create({
        settings: sharkModel.defaults,
        helpers: {
          mesh: helpers.mesh,
          ripple(parent, radius) {
            const ring = helpers.mesh(new THREE.TorusGeometry(radius, .022, 6, 40), '#ecfff8', parent)
            ring.rotation.x = Math.PI / 2
            return ring
          }
        }
      })
      object.add(shark.object)
      update = (time, phase) => shark.update(time, phase)
      break
    }
    case 'Stone':
      stoneModel(object, helpers)
      break
    case 'Island':
      islandModel(object, helpers)
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
