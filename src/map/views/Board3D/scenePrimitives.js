import * as THREE from 'three';

export const palette = {
  sand: '#f4d49b', rock: '#a6aaa0', stone: '#d0c8ad', trunk: '#b5804f',
  green: '#4c9755', darkGreen: '#24724b', lightGreen: '#91be5e',
  cream: '#fff3cb', orange: '#ffbb41', coral: '#f27763', teal: '#38b4ae',
  skin: '#c8824b', skinLight: '#e5a875', blue: '#337a91', dark: '#294b46'
};

export function createScenePrimitives(scene) {
  const materials = new Map();
  function material(color, options = {}) {
    const key = color + JSON.stringify(options);
    if (!materials.has(key)) materials.set(key, new THREE.MeshStandardMaterial({ color, roughness: .75, ...options }));
    return materials.get(key);
  }
  function mesh(geometry, color, parent = scene, options = {}) {
    const object = new THREE.Mesh(geometry, material(color, options));
    object.castShadow = true;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  }
  function sphere(parent, color, position, scale, detail = 2) {
    const object = mesh(new THREE.IcosahedronGeometry(1, detail), color, parent);
    object.position.set(...position);
    object.scale.set(...scale);
    return object;
  }
  function box(parent, color, position, scale, rotation = 0) {
    const object = mesh(new THREE.BoxGeometry(...scale), color, parent);
    object.position.set(...position);
    object.rotation.y = rotation;
    return object;
  }
  function rod(parent, color, start, end, radius = .07, topRadius = radius) {
    const a = new THREE.Vector3(...start), b = new THREE.Vector3(...end);
    const object = mesh(new THREE.CylinderGeometry(topRadius, radius, a.distanceTo(b), 9), color, parent);
    object.position.copy(a).add(b).multiplyScalar(.5);
    object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.sub(a).normalize());
    return object;
  }
  return { mesh, sphere, box, rod };
}
