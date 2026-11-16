import * as THREE from 'three'
import { palette } from './scenePrimitives'
import { normalizeSurferStyle, SKIN_TONES, HAIR_COLORS, SURFWEAR_COLORS, BOARD_COLORS } from './surferStyle'

const SURF_STANCE = Object.freeze({
  yaw: Math.PI / 2,
  headYaw: -Math.PI * .42,
  feet: [[-.44, .08, -.025], [.44, .08, .025]]
});

export function sampleSharkAnimation(time, phase) {
  const axis = .35 + phase * .14;
  const glide = Math.sin(time * .38 + phase) * .105;
  return {
    x: -Math.sin(axis) * glide,
    z: -Math.cos(axis) * glide,
    bob: Math.sin(time * .72 + phase) * .004,
    heading: axis + Math.sin(time * .8 + phase) * .045,
    roll: Math.sin(time * .9 + phase) * .018,
    rippleScale: 1 + Math.sin(time * .9 + phase) * .035
  };
}

function setLimb(object, start, end, radius) {
  const direction = new THREE.Vector3().subVectors(end, start);
  object.position.copy(start).add(end).multiplyScalar(.5);
  object.scale.set(radius, direction.length(), radius);
  object.quaternion.setFromUnitVectors(THREE.Object3D.DEFAULT_UP, direction.normalize());
}

// Slow multi-frequency balance avoids a mechanical looping pose and is shared
// by all seven rider variants without changing their logical game positions.
export function sampleSurferBalance(time, phase = 0, bank = 0) {
  const sway = Math.sin(time * 1.63 + phase * 1.3)
  const counter = Math.sin(time * .87 + phase * .73 + .8)
  return {
    crouch: .018 + .009 * sway + .004 * counter,
    lean: .018 * sway + .010 * counter - bank * .58,
    twist: .030 * counter,
    headYaw: .075 * Math.sin(time * .79 + phase),
    leftArm: .075 * sway + .025 * counter - bank * .40,
    rightArm: -.065 * sway - .020 * counter - bank * .40,
    boardPitch: .017 * counter
  }
}


export function createSurferModel(scene, helpers, color, skin, hairColor, ponytail, options = null) {
  const { mesh, sphere, rod } = helpers
  const style = options ? normalizeSurferStyle(options) : null
  const selectedSkin = style ? SKIN_TONES[style.skinTone] : skin
  const selectedHair = style ? HAIR_COLORS[style.hairColor] : hairColor
  const outfit = style ? SURFWEAR_COLORS[style.surfwear] : color
  const boardColor = style ? BOARD_COLORS[style.boardColor] : color
  const female = style ? style.character === 'female' : !!ponytail
  const hairStyle = style ? style.hairstyle : ponytail ? 'ponytail' : 'short'

  const group = new THREE.Group()
  group.name = 'surfer-model'
  group.scale.setScalar(.65)
  group.rotation.y = -.15
  scene.add(group)
  const board = surfboard(group, boardColor, style?.boardType || 'shortboard', helpers)
  const body = new THREE.Group()
  body.name = 'surfer-stance'
  body.position.y = .075
  body.rotation.y = SURF_STANCE.yaw
  group.add(body)
  const upperBody = new THREE.Group()
  body.add(upperBody)

  // More expressive, rounded proportions; lightweight geometry suits many riders.
  const torso = sphere(upperBody, female ? outfit : selectedSkin,
    [0, .90, .025], [female ? .225 : .27, .36, .205], 3)
  torso.name = 'surfer-torso'
  const shorts = sphere(upperBody, outfit, [0, .665, .025], [.26, .16, .215], 3)
  shorts.name = 'surfer-shorts'
  if (female) {
    const chest = sphere(upperBody, outfit, [0, 1.04, -.012], [.239, .145, .20], 3)
    chest.name = 'surfer-top'
    const hem = sphere(upperBody, '#fff5cf', [0, .95, -.158], [.17, .014, .012], 2)
    hem.name = 'surfer-top-trim'
  } else {
    const necklace = mesh(new THREE.TorusGeometry(.13, .013, 6, 24, Math.PI), '#f7e8b7', upperBody)
    necklace.name = 'surfer-necklace'
    necklace.rotation.x = -.21
    necklace.position.set(0, 1.18, -.14)
  }
  const feet = SURF_STANCE.feet.map(position => {
    const foot = sphere(body, selectedSkin, position, [.125, .075, .20], 2)
    return foot
  })
  const legs = SURF_STANCE.feet.map(([footX, footY, footZ]) => {
    const upper = mesh(new THREE.CylinderGeometry(1, 1, 1, 10), selectedSkin, body)
    const lower = mesh(new THREE.CylinderGeometry(1, 1, 1, 10), selectedSkin, body)
    const side = Math.sign(footX)
    return { upper, lower, hipX: side * .165, kneeX: side * .32,
      kneeZ: -.16, footX, footY, footZ }
  })
  const arms = [-1, 1].map(side => {
    const pivot = new THREE.Group()
    pivot.position.set(side * (female ? .205 : .245), 1.15, 0)
    upperBody.add(pivot)
    const elbow = [side * .31, side < 0 ? -.21 : -.10, side < 0 ? -.12 : .24]
    const hand = [side * .51, side < 0 ? -.13 : .05, side < 0 ? -.23 : .34]
    rod(pivot, selectedSkin, [0, 0, 0], elbow, .079)
    rod(pivot, selectedSkin, elbow, hand, .070)
    sphere(pivot, selectedSkin, hand, [.102, .071, .087], 2)
    return pivot
  })
  rod(upperBody, selectedSkin, [0, 1.20, 0], [0, 1.40, -.01], .09)

  const head = new THREE.Group()
  head.name = 'surfer-head'
  head.position.set(0, 1.61, -.045)
  head.rotation.y = SURF_STANCE.headYaw
  upperBody.add(head)
  sphere(head, selectedSkin, [0, 0, 0], [.27, .30, .24], 4)
  for (const side of [-1, 1]) {
    sphere(head, selectedSkin, [side * .26, -.025, 0], [.054, .09, .057], 2)
    sphere(head, '#fff9eb', [side * .112, .035, -.235], [.082, .096, .045], 3)
    sphere(head, '#51372c', [side * .11, .027, -.273], [.040, .051, .020], 3)
    sphere(head, '#ffffff', [side * .11 - .014, .045, -.292], [.014, .018, .009], 2)
    const eyebrow = sphere(head, selectedHair,
      [side * .114, .147, -.239], [.093, .022, .021], 2)
    eyebrow.rotation.z = -side * .11
    sphere(head, '#e88d7b', [side * .189, -.078, -.185], [.047, .024, .014], 2)
  }
  sphere(head, selectedSkin, [0, -.049, -.243], [.065, .066, .050], 2)
  const smile = mesh(new THREE.TorusGeometry(.091, .010, 5, 20, Math.PI),
    '#8d4b40', head, { side: THREE.DoubleSide })
  smile.position.set(0, -.115, -.239)
  smile.rotation.z = Math.PI

  // Interchangeable procedural hair, rather than hard-coded player identity.
  const hair = new THREE.Group()
  hair.name = 'surfer-hair'
  head.add(hair)
  sphere(hair, selectedHair, [0, .214, .036], [.281, .14, .234], 3)
  if (hairStyle === 'short') {
    for (const [x, y, z, rx] of [[-.19,.257,-.14,-.45],[-.06,.303,-.12,-.15],
      [.11,.298,-.08,.29],[.21,.248,-.02,.52]]) {
      const lock = sphere(hair, selectedHair, [x,y,z],[.113,.108,.112],2)
      lock.rotation.z=rx
    }
  } else if (hairStyle === 'wavy') {
    for(const side of [-1,1]) {
      for(let i=0;i<4;i++) {
        sphere(hair, selectedHair, [side*(.25+.018*Math.sin(i)), .12-i*.125, .045],
          [.108,.115,.116],2)
      }
    }
    for(const x of [-.13,0,.13]) sphere(hair,selectedHair,[x,.25,-.135],[.12,.115,.085],2)
  } else {
    for(const x of [-.13,0,.13]) sphere(hair,selectedHair,[x,.26,-.14],[.125,.102,.088],2)
    const ponytailRoot = new THREE.Group()
    ponytailRoot.name = 'surfer-ponytail'
    ponytailRoot.position.set(.12, .18, .19)
    hair.add(ponytailRoot)
    sphere(ponytailRoot, selectedHair, [.12,.03,.16], [.14,.14,.17], 3)
    sphere(ponytailRoot, selectedHair, [.17,-.12,.27], [.125,.17,.14], 3)
    sphere(ponytailRoot, selectedHair, [.21,-.25,.31], [.09,.12,.11], 2)
    sphere(ponytailRoot, outfit, [.105,.04,.11], [.09,.043,.078], 2)
  }

  function animate(elapsed, i = 0, bank = 0) {
    const pose = sampleSurferBalance(elapsed, i, bank)
    upperBody.position.y = -pose.crouch
    upperBody.rotation.z = pose.lean
    upperBody.rotation.x = bank * .38
    upperBody.rotation.y = pose.twist
    head.rotation.y = SURF_STANCE.headYaw + pose.headYaw
    for (const leg of legs) {
      const hip = new THREE.Vector3(leg.hipX, .73 - pose.crouch, .05)
      const knee = new THREE.Vector3(leg.kneeX, .38 - pose.crouch * .45, leg.kneeZ)
      const foot = new THREE.Vector3(leg.footX, leg.footY, leg.footZ)
      setLimb(leg.upper, hip, knee, .10)
      setLimb(leg.lower, knee, foot, .085)
    }
    arms[0].rotation.z = pose.leftArm
    arms[1].rotation.z = pose.rightArm
    board.rotation.x = pose.boardPitch
    board.rotation.z = bank * .05
  }
  return { group, animate, board, head, feet }
}

function surfboard(parent, color, type, helpers) {
  const { mesh } = helpers
  const group = new THREE.Group()
  group.name = 'surfboard'
  parent.add(group)
  const scale = type === 'longboard' ? 1.14 : type === 'fish' ? .88 : 1
  group.scale.set(1, 1, scale)

  const outline = new THREE.Shape()
  if (type === 'fish') {
    outline.moveTo(0, -1.02)
    outline.bezierCurveTo(-.32,-1.00,-.45,-.47,-.45,.04)
    outline.bezierCurveTo(-.46,.36,-.33,.81,-.20,.88)
    outline.lineTo(0,.69)
    outline.lineTo(.20,.88)
    outline.bezierCurveTo(.33,.81,.46,.36,.45,.04)
    outline.bezierCurveTo(.45,-.47,.32,-1.00,0,-1.02)
  } else {
    outline.moveTo(0, type === 'longboard' ? -1.15 : -1.08)
    outline.bezierCurveTo(-.24,-1.04,-.39,-.61,-.40,-.12)
    outline.bezierCurveTo(-.42,.32,-.31,.75,-.21,.89)
    outline.quadraticCurveTo(0,.97,.21,.89)
    outline.bezierCurveTo(.31,.75,.42,.32,.40,-.12)
    outline.bezierCurveTo(.39,-.61,.24,-1.04,0,type==='longboard'?-1.15:-1.08)
  }
  const hull = mesh(new THREE.ExtrudeGeometry(outline, {
    depth: .105,steps:1,bevelEnabled:true,bevelThickness:.014,
    bevelSize:.018,bevelSegments:2,curveSegments:18
  }), color, group, { roughness:.46,metalness:.03 })
  hull.name='surfboard-hull'
  hull.rotation.x=Math.PI/2
  hull.position.y=.12

  const stripe=new THREE.Shape()
  stripe.moveTo(0,-1.00)
  stripe.lineTo(-.05,-.87)
  stripe.lineTo(-.05,.62)
  stripe.lineTo(0,.71)
  stripe.lineTo(.05,.62)
  stripe.lineTo(.05,-.87)
  stripe.closePath()
  const deck=mesh(new THREE.ShapeGeometry(stripe),palette.cream,group,
    {roughness:.72,side:THREE.DoubleSide})
  deck.name='surfboard-deck-stripe'
  deck.rotation.x=Math.PI/2
  deck.position.y=.148

  const grip=new THREE.Shape()
  grip.moveTo(-.19,.60)
  grip.quadraticCurveTo(0,.52,.19,.60)
  grip.lineTo(.16,.76)
  grip.quadraticCurveTo(0,.83,-.16,.76)
  grip.closePath()
  const pad=mesh(new THREE.ShapeGeometry(grip),palette.dark,group,
    {roughness:.85,side:THREE.DoubleSide})
  pad.name='surfboard-tail-grip'
  pad.rotation.x=Math.PI/2
  pad.position.y=.149

  const profile=new THREE.Shape()
  profile.moveTo(-.14,0)
  profile.bezierCurveTo(-.12,-.10,.04,-.23,.075,-.29)
  profile.quadraticCurveTo(.11,-.18,.15,0)
  profile.closePath()
  const fin=mesh(new THREE.ExtrudeGeometry(profile,{
    depth:.035,bevelEnabled:true,bevelThickness:.009,
    bevelSize:.007,bevelSegments:1,curveSegments:12
  }),palette.dark,group,{roughness:.65})
  fin.name='surfboard-fin'
  fin.rotation.y=Math.PI/2
  fin.position.set(-.017,-.03,.68)
  return group
}
