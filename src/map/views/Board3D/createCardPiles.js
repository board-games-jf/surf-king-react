import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { BOARD_LAYOUT } from '../../layout/boardLayout'
import { cardArt, cardTone } from '../../../components/Board/r1CardArt'
import cardBack from '../../../assets/cards/r1/cardback.webp'
import { sampleOceanHeight } from './createCoastalScenery'

// Presentation-only piles on a raft; card order and match actions stay outside the scene.
export function createCardPiles() {
  const group = new THREE.Group()
  group.name = 'card-pile-raft'
  group.scale.setScalar(.65)
  group.position.set(9.3, .12, 1.1)
  group.visible = false
  const raft = new THREE.Mesh(new THREE.BoxGeometry(2.4, .28, 5.6), new THREE.MeshStandardMaterial({ color: '#9a6842', roughness: .85 }))
  raft.position.y = .13
  group.add(raft)
  const timber = new THREE.MeshStandardMaterial({ color: '#ca9a68', roughness: .85 })
  for (let i = 0; i < 4; i++) {
    const plank = new THREE.Mesh(new THREE.BoxGeometry(.53, .06, 5.45), timber)
    plank.position.set(-.84 + i * .56, .30, 0)
    group.add(plank)
  }
  const logMaterial = new THREE.MeshStandardMaterial({ color: '#714b33', roughness: .95 })
  const logGeometry = new THREE.CylinderGeometry(.19, .19, 5.65, 12)
  for (const x of [-.94, .94]) {
    const log = new THREE.Mesh(logGeometry, logMaterial)
    log.rotation.x = Math.PI / 2
    log.position.set(x, -.03, 0)
    group.add(log)
  }
  const ropeMaterial = new THREE.MeshStandardMaterial({ color: '#e4c48d', roughness: .95 })
  for (const z of [-2.23, 2.23]) {
    const rope = new THREE.Mesh(new THREE.BoxGeometry(2.42, .025, .09), ropeMaterial)
    rope.position.set(0, .345, z)
    group.add(rope)
  }
  // A small buoy ties the platform into the seaside setting without covering the cards.
  const buoy = new THREE.Mesh(new THREE.TorusGeometry(.25, .075, 10, 32), new THREE.MeshStandardMaterial({ color: '#f3e5cb', roughness: .6 }))
  buoy.position.set(-1.23, .19, 0)
  buoy.rotation.y = Math.PI / 2
  group.add(buoy)
  for (let i = 0; i < 4; i++) {
    const stripe = new THREE.Mesh(new THREE.TorusGeometry(.25, .078, 8, 6, .3), new THREE.MeshStandardMaterial({ color: '#db674b', roughness: .65 }))
    stripe.position.copy(buoy.position)
    stripe.rotation.set(0, Math.PI / 2, i * Math.PI / 2)
    group.add(stripe)
  }
  const colors = { attack: '#b83c37', obstacle: '#a94e08', recovery: '#087c71', move: '#087c71', protection: '#2467a7', jump: '#7446ae' }
  function makePile(z, name) {
    const part = new THREE.Group()
    part.position.z = z
    group.add(part)
    const edgeCanvas = document.createElement('canvas')
    edgeCanvas.width = 32; edgeCanvas.height = 256
    const edgeTexture = new THREE.CanvasTexture(edgeCanvas)
    edgeTexture.colorSpace = THREE.SRGBColorSpace
    const body = new THREE.Mesh(new RoundedBoxGeometry(1.55, 1, 2.12, 3, .09), new THREE.MeshStandardMaterial({ map: edgeTexture, roughness: .85 }))
    body.name = 'card-pile-' + name + '-body'
    part.add(body)
    const faceCanvas = document.createElement('canvas')
    faceCanvas.width = 256; faceCanvas.height = 352
    const faceTexture = new THREE.CanvasTexture(faceCanvas)
    faceTexture.colorSpace = THREE.SRGBColorSpace
    const face = new THREE.Mesh(new THREE.PlaneGeometry(1.55, 2.12), new THREE.MeshBasicMaterial({ map: faceTexture, transparent: true, alphaTest: .1, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }))
    face.rotation.x = -Math.PI / 2
    part.add(face)
    const hit = new THREE.Mesh(new THREE.BoxGeometry(1.8, .3, 2.3), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }))
    hit.position.y = .5
    hit.userData.pile = name
    part.add(hit)
    const labelCanvas = document.createElement('canvas')
    labelCanvas.width = 256; labelCanvas.height = 80
    const labelTexture = new THREE.CanvasTexture(labelCanvas)
    labelTexture.colorSpace = THREE.SRGBColorSpace
    const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTexture, transparent: true, depthWrite: false, depthTest: false, toneMapped: false }))
    label.position.set(-2.35, 1.15, name === 'deck' ? .55 : -.55)
    label.scale.set(2.7, .84, 1)
    label.renderOrder = 1000
    part.add(label)
    return { part, body, face, hit, edgeCanvas, edgeTexture, edgeCount: null, faceCanvas, faceTexture, label, labelCanvas, labelTexture, faceKey: null }
  }
  const deck = makePile(1.25, 'deck')
  const discard = makePile(-1.25, 'discard')
  let previous = null
  let disposed = false
  let shuffleAt = null
  let cardEventSeen = null
  let cardEventReady = false
  let discardFlight = null
  let heldDiscard = null
  let pendingDiscard = null
  const flightCanvas = document.createElement('canvas')
  flightCanvas.width = 256; flightCanvas.height = 352
  const flightTexture = new THREE.CanvasTexture(flightCanvas)
  flightTexture.colorSpace = THREE.SRGBColorSpace
  const flightFace = { faceCanvas: flightCanvas, faceTexture: flightTexture, faceKey: null }
  const discardedCard = new THREE.Mesh(new THREE.PlaneGeometry(1.55, 2.12), new THREE.MeshBasicMaterial({ map: flightTexture, transparent: true, alphaTest: .1, side: THREE.DoubleSide }))
  discardedCard.name = 'discard-flight-card'
  discardedCard.rotation.x = -Math.PI / 2
  discardedCard.visible = false
  group.add(discardedCard)
  const flying = new THREE.Mesh(new THREE.PlaneGeometry(1.55, 2.12), new THREE.MeshBasicMaterial({ map: deck.faceTexture, side: THREE.DoubleSide }))
  flying.rotation.x = -Math.PI / 2
  flying.visible = false
  group.add(flying)
  function renderFace(pile, name, isDeck) {
    const key = isDeck ? 'back' : (name || '')
    if (pile.faceKey === key) return
    pile.faceKey = key
    const canvas = pile.faceCanvas, c = canvas.getContext('2d')
    c.clearRect(0, 0, 256, 352)
    const clipCard = () => {
      c.save(); c.beginPath(); c.roundRect(0, 0, 256, 352, 20); c.clip()
    }
    if (!key) {
      clipCard()
      c.fillStyle = '#29555a'; c.fillRect(0, 0, 256, 352)
      c.strokeStyle = '#b9d7c8'; c.lineWidth = 8; c.setLineDash([12, 10]); c.strokeRect(8, 8, 240, 336); c.setLineDash([]); c.restore()
      pile.faceTexture.needsUpdate = true
      return
    }
    const image = new Image()
    image.onload = () => {
      if (disposed || pile.faceKey !== key) return
      clipCard()
      if (isDeck) c.drawImage(image, 0, 0, 256, 352)
      else {
        c.fillStyle = colors[cardTone[name]] || '#387a8c'; c.fillRect(0, 0, 256, 352)
        c.fillStyle = '#f9f2e5'; c.fillRect(8, 8, 240, 336)
        c.drawImage(image, 16, 16, 224, 248)
        c.fillStyle = colors[cardTone[name]] || '#387a8c'; c.fillRect(16, 272, 224, 64)
        c.font = 'bold 28px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#fff'
        const words = name.split(' ')
        if (name.length > 13 && words.length > 1) { const cut = Math.ceil(words.length / 2); c.fillText(words.slice(0, cut).join(' '), 128, 295, 214); c.fillText(words.slice(cut).join(' '), 128, 320, 214) }
        else c.fillText(name, 128, 304, 214)
      }
      c.restore()
      pile.faceTexture.needsUpdate = true
    }
    image.src = isDeck ? cardBack : cardArt[name]
  }
  function setPile(pile, count, name, isDeck) {
    const height = count ? .018 + count * .007 : .012
    pile.body.position.y = .34 + height / 2
    pile.body.scale.y = height
    pile.body.visible = count > 0
    if (pile.edgeCount !== count) {
      const c = pile.edgeCanvas.getContext('2d')
      c.fillStyle = '#eee4cf'; c.fillRect(0, 0, 32, 256)
      c.fillStyle = '#a99b82'
      const layers = Math.max(1, count)
      for (let i = 1; i < layers; i++) c.fillRect(0, Math.round(i * 256 / layers), 32, 1)
      pile.edgeTexture.needsUpdate = true
      pile.edgeCount = count
    }
    pile.face.position.y = .375 + height
    pile.hit.position.y = .44 + height
    renderFace(pile, count ? name : null, isDeck && count > 0)
    const c = pile.labelCanvas.getContext('2d')
    c.clearRect(0, 0, 256, 80); c.fillStyle = 'rgba(18, 61, 71, .91)'
    c.beginPath(); c.roundRect(8, 8, 240, 64, 24); c.fill()
    c.textAlign = 'left'; c.textBaseline = 'middle'; c.font = 'bold 34px sans-serif'
    const title = isDeck ? 'Deck' : 'Discard'
    const amount = String(count)
    const titleWidth = c.measureText(title).width
    const amountWidth = c.measureText(amount).width
    const start = (256 - titleWidth - 9 - amountWidth) / 2
    c.fillStyle = '#eef9f2'; c.fillText(title, start, 40)
    c.fillStyle = '#ffe0a1'; c.fillText(amount, start + titleWidth + 9, 40)
    pile.labelTexture.needsUpdate = true
  }
  return {
    group, hitTargets: [discard.hit],
    toggleLabels(visible) { deck.label.visible = visible; discard.label.visible = visible },
    update(piles) {
      group.visible = !!piles
      if (!piles) { previous = null; cardEventReady = false; return }
      const event = piles.event
      if (previous && previous.deck === 0 && previous.discard > 0 && piles.discard === 0) shuffleAt = performance.now()
      if (cardEventReady && event && event.id !== cardEventSeen && event.discarded && piles.topDiscard === event.name && BOARD_LAYOUT[event.origin]) {
        group.updateWorldMatrix(true, false)
        const origin = BOARD_LAYOUT[event.origin]
        const from = group.worldToLocal(new THREE.Vector3(origin.x, 1.6, origin.z))
        discardFlight = { started: performance.now(), from }
        heldDiscard = { count: previous?.discard || 0, name: previous?.topDiscard || null }
        renderFace(flightFace, event.name, false)
      }
      cardEventSeen = event?.id ?? null
      cardEventReady = true
      setPile(deck, piles.deck, null, true)
      pendingDiscard = { count: piles.discard, name: piles.topDiscard }
      const visible = discardFlight ? heldDiscard : pendingDiscard
      setPile(discard, visible.count, visible.name, false)
      previous = { deck: piles.deck, discard: piles.discard, topDiscard: piles.topDiscard }
    },
    animate(now, reduced, elapsed) {
      group.position.y = .12 + (reduced ? 0 : sampleOceanHeight(group.position.x, group.position.z, elapsed))
      group.rotation.x = reduced ? 0 : .012 * Math.sin(elapsed * .7)
      group.rotation.z = reduced ? 0 : .016 * Math.sin(elapsed * .9 + .5)
      if (discardFlight && group.visible) {
        const t = reduced ? 1 : Math.min(1, (now - discardFlight.started) / 900)
        if (t >= 1) {
          discardedCard.visible = false; discardFlight = null; heldDiscard = null
          if (pendingDiscard) setPile(discard, pendingDiscard.count, pendingDiscard.name, false)
        } else {
          discardedCard.visible = true
          const end = new THREE.Vector3(0, .8, -1.25)
          discardedCard.position.copy(discardFlight.from).lerp(end, t)
          discardedCard.position.y += .75 * Math.sin(Math.PI * t)
        }
      }
      if (!group.visible || shuffleAt === null || reduced) { flying.visible = false; return }
      const t = (now - shuffleAt) / 1100
      if (t >= 1) { flying.visible = false; shuffleAt = null; return }
      flying.visible = true
      flying.position.set(0, .8 + .4 * Math.sin(Math.PI * t), THREE.MathUtils.lerp(-1.25, 1.25, t))
      flying.rotation.z = .18 * Math.sin(Math.PI * t)
    },
    dispose() { disposed = true }
  }
}
