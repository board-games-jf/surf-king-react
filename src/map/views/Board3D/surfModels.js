import * as THREE from 'three'
import { palette } from './scenePrimitives'

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

export function createSurferModel(scene, helpers, color, skin, hairColor, ponytail) {
  const { mesh, sphere, box, rod } = helpers;
  const group=new THREE.Group();
  group.name = 'surfer-model';
  group.scale.setScalar(.65);
  group.rotation.y=-.15;
  scene.add(group);
  const board=surfboard(group,color,0,0,0,1,helpers);
  const body=new THREE.Group();
  body.name = 'surfer-stance';
  body.position.set(0,.075,0);
  body.rotation.y=SURF_STANCE.yaw;
  group.add(body);
  const upperBody=new THREE.Group();
  body.add(upperBody);
  sphere(upperBody,color,[0,.72,.05],[.21,.23,.18],2);
  sphere(upperBody,skin,[0,1.01,0],[.24,.33,.17],2);
  const legs=SURF_STANCE.feet.map(([footX,footY,footZ])=>{
    const upper=mesh(new THREE.CylinderGeometry(1,1,1,9),skin,body);
    const lower=mesh(new THREE.CylinderGeometry(1,1,1,9),skin,body);
    const side=Math.sign(footX);
    return {upper,lower,hipX:side*.16,kneeX:side*.32,kneeZ:-.16,footX,footY,footZ};
  });
  SURF_STANCE.feet.forEach(position=>sphere(body,skin,position,[.105,.065,.20],2));
  const arms=[-1,1].map(side=>{
    const pivot=new THREE.Group();
    pivot.position.set(side*.19,1.2,0);
    upperBody.add(pivot);
    const elbow=[side*.29,side<0?-.21:-.1,side<0?-.12:.24];
    const hand=[side*.55,side<0?-.11:.06,side<0?-.28:.35];
    rod(pivot,skin,[0,0,0],elbow,.073);
    rod(pivot,skin,elbow,hand,.065);
    sphere(pivot,skin,hand,[.10,.065,.07],2);
    return pivot;
  });
  rod(upperBody,skin,[0,1.26,0],[0,1.39,-.015],.087);
  const head=new THREE.Group();
  head.position.set(0,1.59,-.035);
  head.rotation.y=SURF_STANCE.headYaw;
  upperBody.add(head);
  sphere(head,skin,[0,0,0],[.245,.28,.245],3);
  sphere(head,hairColor,[0,.18,.045],[.26,.18,.25],2);
  for(let i=0;i<7;i++) sphere(head,hairColor,[(i-3)*.061,.2+Math.sin(i)*.025,-.15],[.09,.10,.095],1);
  if(ponytail) {
    sphere(head,color,[.12,.13,.22],[.10,.10,.09],2);
    sphere(head,hairColor,[.19,.08,.39],[.16,.19,.22],2);
    sphere(head,hairColor,[.27,-.05,.52],[.13,.16,.16],2);
  }
  box(head,palette.dark,[0,.06,-.231],[.45,.13,.04]);
  for(const x of [-.115,.115]) sphere(head,palette.blue,[x,.06,-.26],[.092,.072,.035],2);
  sphere(head,skin,[0,-.015,-.255],[.045,.055,.05],2);
  const smile=mesh(new THREE.TorusGeometry(.06,.009,5,16,Math.PI),palette.cream,head);
  smile.rotation.z=Math.PI;
  smile.position.set(0,-.09,-.233);
  function animate(elapsed, i, bank) {
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
      setLimb(leg.upper, hip, knee, .1)
      setLimb(leg.lower, knee, foot, .085)
    }
    arms[0].rotation.z = pose.leftArm
    arms[1].rotation.z = pose.rightArm
    board.rotation.x = pose.boardPitch
    board.rotation.z = bank * .05
  }
  return { group, animate }
}

function surfboard(parent, color, x, y, z, scale = 1, helpers) {
  const { mesh } = helpers
  const group = new THREE.Group()
  group.name = 'surfboard'
  group.position.set(x, y, z)
  group.scale.setScalar(scale)
  parent.add(group)

  // The board is an actual tapered, bevelled 3D hull, not an ellipsoid or flat image.
  // The pointed nose faces negative Z; the short squash tail faces positive Z.
  const outline = new THREE.Shape()
  outline.moveTo(0, -1.08)
  outline.bezierCurveTo(-.21, -1.04, -.38, -.62, -.40, -.12)
  outline.bezierCurveTo(-.42, .32, -.31, .75, -.21, .89)
  outline.quadraticCurveTo(0, .96, .21, .89)
  outline.bezierCurveTo(.31, .75, .42, .32, .40, -.12)
  outline.bezierCurveTo(.38, -.62, .21, -1.04, 0, -1.08)
  const hull = mesh(new THREE.ExtrudeGeometry(outline, {
    depth: .105, steps: 1, bevelEnabled: true, bevelThickness: .014,
    bevelSize: .02, bevelSegments: 2, curveSegments: 16
  }), color, group, { roughness: .45, metalness: .03 })
  hull.name = 'surfboard-hull'
  hull.rotation.x = Math.PI / 2
  hull.position.y = .12

  // Cream deck graphics give the seven existing player colors a shared identity.
  const stripe = new THREE.Shape()
  stripe.moveTo(0, -1.00)
  stripe.lineTo(-.055, -.86)
  stripe.lineTo(-.055, .67)
  stripe.lineTo(0, .73)
  stripe.lineTo(.055, .67)
  stripe.lineTo(.055, -.86)
  stripe.closePath()
  const stripeMesh = mesh(new THREE.ShapeGeometry(stripe), palette.cream, group, {
    roughness: .75, side: THREE.DoubleSide
  })
  stripeMesh.name = 'surfboard-deck-stripe'
  stripeMesh.rotation.x = Math.PI / 2
  stripeMesh.position.y = .148

  const grip = new THREE.Shape()
  grip.moveTo(-.19, .62)
  grip.quadraticCurveTo(0, .52, .19, .62)
  grip.lineTo(.16, .79)
  grip.quadraticCurveTo(0, .86, -.16, .79)
  grip.closePath()
  const pad = mesh(new THREE.ShapeGeometry(grip), palette.dark, group, {
    roughness: .9, side: THREE.DoubleSide
  })
  pad.name = 'surfboard-tail-grip'
  pad.rotation.x = Math.PI / 2
  pad.position.y = .149

  // A swept underside fin: visible when the camera is lowered.
  const profile = new THREE.Shape()
  profile.moveTo(-.14, 0)
  profile.bezierCurveTo(-.12, -.10, .04, -.23, .075, -.29)
  profile.quadraticCurveTo(.11, -.18, .15, 0)
  profile.closePath()
  const fin = mesh(new THREE.ExtrudeGeometry(profile, {
    depth: .035, bevelEnabled: true, bevelThickness: .009,
    bevelSize: .007, bevelSegments: 1, curveSegments: 12
  }), palette.dark, group, { roughness: .65 })
  fin.name = 'surfboard-fin'
  fin.rotation.y = Math.PI / 2
  fin.position.set(-.017, -.03, .68)
  return group
}
