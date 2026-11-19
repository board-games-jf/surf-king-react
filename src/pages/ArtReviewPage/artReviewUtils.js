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
