// Isolated asset-review checks; never replace production player avatars.
export const MAX_REVIEW_ASSET_BYTES = 40 * 1024 * 1024

export function validateReviewFile(file) {
  if (!file) return 'Choose a GLB file.'
  if (!/\.glb$/i.test(file.name || '')) return 'Only .glb files are supported.'
  if (!file.size || file.size > MAX_REVIEW_ASSET_BYTES) {
    return 'GLB must be nonempty and at most 40 MB.'
  }
  return null
}

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
