// Single local-asset registry shared by the studio preview and game board.
// Both base meshes are from Quaternius Universal Base Characters (CC0).
export const RIGGED_SURFER_ASSETS = Object.freeze({
  male: Object.freeze({
    path: '/assets/surfers/quaternius-male-base.glb',
    body: 'SuperHero_Male'
  }),
  female: Object.freeze({
    path: '/assets/surfers/quaternius-female-base.glb',
    body: 'Superhero_Female'
  })
})

export function getRiggedSurferAsset(character) {
  return RIGGED_SURFER_ASSETS[character === 'female' ? 'female' : 'male']
}
