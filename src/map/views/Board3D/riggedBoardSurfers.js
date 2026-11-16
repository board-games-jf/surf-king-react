import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { PRESET_SURFERS } from './surferStyle'
import { decorateRiggedSurfer } from './riggedSurferArt'

// Both actual male and female meshes come from the same Quaternius CC0 pack.
// Never substitute the male mesh for a selected female player silently.
export const RIGGED_SURFER_ASSETS = Object.freeze({
  male: { path: '/assets/surfers/quaternius-male-base.glb', body: 'SuperHero_Male' },
  female: { path: '/assets/surfers/quaternius-female-base.glb', body: 'Superhero_Female' }
})

// Keep seven established player identities separate from appearance presets.
export const PLAYER_BOARD_COLORS = Object.freeze([
  '#ffbb41', '#f27763', '#38b4ae', '#337a91',
  '#e4c45a', '#b17bb6', '#83c16e'
])

export function createRiggedBoardSurfer(templates, playerId) {
  const id = Number(playerId)
  const index = Number.isInteger(id) && id >= 0 ? id % PLAYER_BOARD_COLORS.length : 0
  const style = PRESET_SURFERS[index % PRESET_SURFERS.length]
  const character = style.character
  const template = templates?.[character]
  if (!template) throw new Error('Missing ' + character + ' skinned surfer GLB')
  const independentRig = cloneSkinned(template)
  const body = independentRig.getObjectByName(RIGGED_SURFER_ASSETS[character].body)
  if (!body?.isSkinnedMesh || !body.skeleton?.bones.length) {
    throw new Error('The ' + character + ' surfer GLB is missing the expected skinned character')
  }
  const art = decorateRiggedSurfer(
    independentRig,
    style,
    { boardMode: true, pose: 'surfing', playerColor: PLAYER_BOARD_COLORS[index] }
  )
  art.animate(0, true)
  art.display.name = 'board-rigged-surfer'
  art.display.userData.character = character
  art.display.traverse(node => { if (node.isMesh) node.castShadow = true })
  return art
}

function validateTemplate(loaded, character) {
  const scene = loaded?.scene
  const body = scene?.getObjectByName(RIGGED_SURFER_ASSETS[character].body)
  if (!body?.isSkinnedMesh || !body.skeleton?.bones.length) {
    throw new Error('The local ' + character + ' surfer GLB has no valid skeleton')
  }
  return scene
}

// One request per gender and scene, independent of how many players are present.
// Failure in one gender leaves its procedural players intact and does not block
// successfully loaded players of the other gender.
export function loadRiggedBoardTemplates(onReady, onError, loader = new GLTFLoader()) {
  Object.entries(RIGGED_SURFER_ASSETS).forEach(([character, asset]) => {
    const path = (process.env.PUBLIC_URL || '') + asset.path
    loader.load(path, loaded => {
      try {
        onReady(character, validateTemplate(loaded, character))
      } catch (error) { onError(character, error) }
    }, undefined, error => onError(character, error))
  })
}

// Backwards-compatible single-model loader retained for test callers.
export function loadRiggedBoardTemplate(onReady, onError, loader = new GLTFLoader()) {
  const asset = RIGGED_SURFER_ASSETS.male
  loader.load((process.env.PUBLIC_URL || '') + asset.path, loaded => {
    try { onReady(validateTemplate(loaded, 'male')) }
    catch (error) { onError(error) }
  }, undefined, onError)
}
