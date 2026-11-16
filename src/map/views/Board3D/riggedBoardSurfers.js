import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { PRESET_SURFERS } from './surferStyle'
import { decorateRiggedSurfer } from './riggedSurferArt'

// Keep the seven authoritative player colors, independently of appearance
// presets and the cosmetic draft saved by the character creator.
export const PLAYER_BOARD_COLORS = Object.freeze([
  '#ffbb41', '#f27763', '#38b4ae', '#337a91',
  '#e4c45a', '#b17bb6', '#83c16e'
])

export function createRiggedBoardSurfer(template, playerId) {
  const id = Number(playerId)
  const index = Number.isInteger(id) && id >= 0 ? id % PLAYER_BOARD_COLORS.length : 0
  const independentRig = cloneSkinned(template)
  const body = independentRig.getObjectByName('SuperHero_Male')
  if (!body?.isSkinnedMesh || !body.skeleton?.bones.length) {
    throw new Error('The surfer GLB is missing the expected skinned character')
  }
  const art = decorateRiggedSurfer(
    independentRig,
    PRESET_SURFERS[index % PRESET_SURFERS.length],
    { boardMode: true, playerColor: PLAYER_BOARD_COLORS[index] }
  )
  art.animate(0, true)
  art.display.name = 'board-rigged-surfer'
  art.display.traverse(node => {
    if (node.isMesh) node.castShadow = true
  })
  return art
}

export function loadRiggedBoardTemplate(onReady, onError) {
  // One fetch and parse per 3D scene; clones share immutable source geometry.
  const path = (process.env.PUBLIC_URL || '') + '/assets/surfers/quaternius-male-base.glb'
  new GLTFLoader().load(path, loaded => {
    const body = loaded.scene.getObjectByName('SuperHero_Male')
    if (!body?.isSkinnedMesh || !body.skeleton?.bones.length) {
      onError(new Error('The local surfer GLB has no valid skeleton'))
      return
    }
    onReady(loaded.scene)
  }, undefined, onError)
}
