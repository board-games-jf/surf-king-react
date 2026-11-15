import * as THREE from 'three';
import { sampleSharkAnimation } from './surfModels';

export default {
  defaults: { color: '#688e95' },
  create({ settings, helpers }) {
    const object = new THREE.Group();
    const body = new THREE.Group();
    object.add(body);
    const shape = new THREE.Shape();
    shape.moveTo(-.32, 0);
    shape.quadraticCurveTo(-.22, .33, .12, .57);
    shape.quadraticCurveTo(.02, .27, .28, 0);
    shape.closePath();
    const fin = helpers.mesh(new THREE.ExtrudeGeometry(shape, {
      depth: .10, bevelEnabled: true, bevelSegments: 2, bevelSize: .035, bevelThickness: .035
    }), settings.color, body);
    fin.name = 'shark-fin';
    fin.position.z = -.05;
    fin.rotation.y = Math.PI / 2;
    const wake = helpers.ripple(object, .41);
    return {
      object,
      update(time, phase) {
        const pose = sampleSharkAnimation(time, phase);
        body.position.set(pose.x, .065 + pose.bob, pose.z);
        body.rotation.set(0, pose.heading, pose.roll);
        wake.position.set(pose.x, .09, pose.z);
        wake.rotation.z = -pose.heading;
        wake.scale.set(pose.rippleScale, pose.rippleScale * .86, 1);
      }
    };
  }
};
