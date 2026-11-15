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

export function createSurferModel(scene, helpers, color, skin, hairColor, ponytail) {
  const { mesh, sphere, box, rod } = helpers;
  const group=new THREE.Group();
  group.scale.setScalar(.65);
  group.rotation.y=-.15;
  scene.add(group);
  const board=surfboard(group,color,0,0,0,1,helpers);
  const body=new THREE.Group();
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
    const balance = Math.sin(elapsed * 1.7 + i * 2)
    const crouch = .012 + .012 * balance
    upperBody.position.y = -crouch
    upperBody.rotation.z = -bank * .6 + balance * .025
    upperBody.rotation.x = bank * .6
    head.rotation.y = SURF_STANCE.headYaw + Math.sin(elapsed * .8 + i) * .1
    for (const leg of legs) {
      const hip = new THREE.Vector3(leg.hipX, .73 - crouch, .05)
      const knee = new THREE.Vector3(leg.kneeX, .38 - crouch * .4, leg.kneeZ)
      const foot = new THREE.Vector3(leg.footX, leg.footY, leg.footZ)
      setLimb(leg.upper, hip, knee, .1)
      setLimb(leg.lower, knee, foot, .085)
    }
    arms.forEach(arm => { arm.rotation.z = balance * .055 - bank * .45 })
    board.rotation.z = bank * .1
  }
  return { group, animate }
}

function surfboard(parent, color, x, y, z, scale = 1, helpers) {
  const { mesh, sphere, box } = helpers;
  const group = new THREE.Group();
  group.position.set(x,y,z);
  group.scale.setScalar(scale);
  parent.add(group);
  sphere(group,color,[0,0,0],[.32,.085,1.02],3);
  sphere(group,palette.cream,[0,.057,0],[.24,.034,.91],2);
  box(group,color,[0,.095,.02],[.11,.012,1.48]);
  const fin = mesh(new THREE.ConeGeometry(.12,.28,3),palette.dark,group);
  fin.position.set(0,-.16,.62);
  fin.rotation.x = Math.PI;
  return group;
}