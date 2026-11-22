// Isolated asset-review checks; never replace production player avatars.
export function inspectRiggedAsset(loaded) {
  const scene = loaded?.scene
  if (!scene?.traverse) throw new Error('Missing GLB scene.')
  let skinnedMeshes = 0
  let triangles = 0
  const bones = new Set()
  scene.traverse(node => {
    if (!node.isMesh) return
    if (node.isSkinnedMesh && node.skeleton?.bones?.length) {
      skinnedMeshes += 1
      node.skeleton.bones.forEach(bone => bones.add(bone))
    }
    const geometry = node.geometry
    if (geometry?.index) triangles += Math.floor(geometry.index.count / 3)
    else if (geometry?.attributes?.position) {
      triangles += Math.floor(geometry.attributes.position.count / 3)
    }
  })
  return {
    skinnedMeshes,
    bones: bones.size,
    triangles,
    animations: (loaded.animations || []).map(clip => clip.name),
    rigged: skinnedMeshes > 0 && bones.size > 0
  }
}


// Use the actual joint positions, not the imported bones' arbitrary local axes.
export function reviewStanceFrame(THREE, left, right, toeDirections = []) {
  const up = new THREE.Vector3(0, 1, 0)
  const lateral = left.clone().sub(right).setY(0)
  if (lateral.lengthSq() < 1e-8) return null
  lateral.normalize()
  const forward = lateral.clone().cross(up).normalize()
  const toes = toeDirections.reduce((sum, direction) => sum.add(direction), new THREE.Vector3())
  if (forward.dot(toes) < 0) forward.negate()
  return { lateral, forward, up }
}

// The knee is placed on the forward side of the hip-to-ankle line.
export function reviewKneeTarget(hip, ankle, upper, lower, forward) {
  const axis = ankle.clone().sub(hip)
  const distance = axis.length()
  if (distance < 1e-6 || upper < 1e-6 || lower < 1e-6 ||
      distance >= upper + lower || distance <= Math.abs(upper - lower)) return null
  axis.normalize()
  const pole = forward.clone().addScaledVector(axis, -forward.dot(axis))
  if (pole.lengthSq() < 1e-8) return null
  pole.normalize()
  const along = (upper * upper - lower * lower + distance * distance) / (2 * distance)
  const bend = Math.sqrt(Math.max(0, upper * upper - along * along))
  return hip.clone().addScaledVector(axis, along).addScaledVector(pole, bend)
}

// All directions use the measured anatomical frame, independent of imported bone axes.
export function reviewSurfDirections({ lateral, forward, up }, lead) {
  const sign = lead ? 1 : -1
  return {
    toe: forward.clone().addScaledVector(lateral, lead ? .60 : -.10).normalize(),
    upperArm: lateral.clone().multiplyScalar(sign * (lead ? .80 : .54))
      .addScaledVector(forward, lead ? .20 : .18).addScaledVector(up, lead ? -.60 : -.78).normalize(),
    forearm: lateral.clone().multiplyScalar(sign * (lead ? .36 : .83))
      .addScaledVector(forward, lead ? .82 : .46).addScaledVector(up, lead ? .38 : .08).normalize()
  }
}
