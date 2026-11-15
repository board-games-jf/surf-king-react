import * as THREE from 'three';

export function createHexDepth(cells, radius) {
  const group = new THREE.Group();
  group.name = 'optional-hex-depth';
  group.visible = false;
  const edges = new Map();
  for (const cell of cells) {
    for (let side = 0; side < 6; side++) {
      const endpoints = [side, side + 1].map(index => {
        const angle = index * Math.PI / 3;
        return { x: cell.x + Math.cos(angle) * radius, z: cell.z + Math.sin(angle) * radius };
      });
      const key = endpoints.map(p => `${Math.round(p.x * 1e6)},${Math.round(p.z * 1e6)}`).sort().join(':');
      edges.set(key, endpoints);
    }
  }
  const vertices = [];
  for (const [a, b] of edges.values()) {
    vertices.push(a.x, -.12, a.z, b.x, -.12, b.z, a.x, .17, a.z,
      a.x, .17, a.z, b.x, -.12, b.z, b.x, .17, b.z);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  const sides = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
    color: '#49cece', transparent: true, opacity: .26, depthWrite: false, side: THREE.DoubleSide
  }));
  group.add(sides);
  const shape = new THREE.Shape();
  for (let side = 0; side <= 6; side++) {
    const angle = side * Math.PI / 3;
    const x = Math.cos(angle) * radius * .985, z = Math.sin(angle) * radius * .985;
    if (side === 0) shape.moveTo(x, z); else shape.lineTo(x, z);
  }
  const selected = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, {
    depth: .16, bevelEnabled: true, bevelSize: .018, bevelThickness: .018, bevelSegments: 2
  }), new THREE.MeshBasicMaterial({ color: '#88e3d0', transparent: true, opacity: .18, depthWrite: false }));
  selected.rotation.x = -Math.PI / 2;
  selected.visible = false;
  group.add(selected);
  return {
    group,
    select(cellId) {
      if (cellId === null) {
        selected.visible = false;
        return;
      }
      const cell = cells.find(item => item.id === cellId);
      if (!cell) throw new Error(`Unknown cell ID for hex depth: ${cellId}`);
      selected.position.set(cell.x, .085, cell.z);
      selected.visible = true;
    }
  };
}
