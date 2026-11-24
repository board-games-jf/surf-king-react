import layoutManifest from '../../layout/board-layout.json'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { BOARD_LAYOUT } from '../../layout/boardLayout'
import { createCoastalScenery, sampleOceanHeight } from './createCoastalScenery'
import { createScenePrimitives, palette } from './scenePrimitives'
import { createSurferModel } from './surfModels'
import { PLAYER_BOARD_COLORS, createRiggedBoardSurfer, loadRiggedBoardTemplates, resolveBoardSurferStyle } from './riggedBoardSurfers'
import { readLocalSurferProfiles } from './localSurferProfiles'
import { createObstacleModel } from './obstacleModels'
import { createHexDepth } from './hexDepth'
import { createTargetHighlights } from './createTargetHighlights'
import { getTargetBlockStyle } from '../../contract/targetHighlight'
import { createBoardViewportResize } from './resizeBoardViewport'
import { createFallMotion, targetFallMotion, stepFallMotion, sampleRiderMotion, sampleRemount, sampleCarve, shortestHeading, MOVE_SECONDS } from './surferMotion'

// This renderer receives public state and never validates moves or changes rules.
const R = layoutManifest.hexRadius
const colors = { sand:'#f4d49b', rock:'#a6aaa0', trunk:'#b5804f', green:'#4c9755', leaf:'#91be5e',
  cream:'#fff3cb', orange:'#ffbb41', coral:'#f27763', teal:'#38b4ae', blue:'#337a91',
  skin:'#c8824b', dark:'#294b46' }

export function createScene(container,onCellSelect,onError, { previewFemaleAthlete = false, athleteBoardType = null, onCellHover } = {}) {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#c8e8e5')
  scene.fog = new THREE.Fog('#c8e8e5',42,105)
  const camera = new THREE.PerspectiveCamera(36,1,.1,180)
  const renderer = new THREE.WebGLRenderer({antialias:true})
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.98
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.domElement.setAttribute('aria-label','Interactive Surf King 3D board')
  Object.assign(renderer.domElement.style, { display: 'block', width: '100%', height: '100%' })
  container.appendChild(renderer.domElement)
  // One scene-owned, camera-facing marker, independent of the surfer's roll.
  const turnCanvas = document.createElement('canvas')
  turnCanvas.width = 256
  turnCanvas.height = 128
  const turnContext = turnCanvas.getContext('2d')
  turnContext.fillStyle = '#173d36'
  turnContext.fillRect(24, 8, 208, 68)
  turnContext.strokeStyle = '#ffcf53'
  turnContext.lineWidth = 6
  turnContext.strokeRect(24, 8, 208, 68)
  turnContext.font = 'bold 44px sans-serif'
  turnContext.textAlign = 'center'
  turnContext.fillStyle = '#fff4c5'
  turnContext.fillText('NOW', 128, 57)
  turnContext.beginPath()
  turnContext.moveTo(99, 76)
  turnContext.lineTo(157, 76)
  turnContext.lineTo(128, 117)
  turnContext.closePath()
  turnContext.fillStyle = '#ffcf53'
  turnContext.fill()
  const turnTexture = new THREE.CanvasTexture(turnCanvas)
  turnTexture.colorSpace = THREE.SRGBColorSpace
  const turnMarker = new THREE.Sprite(new THREE.SpriteMaterial({
    map: turnTexture, transparent: true, depthTest: false, depthWrite: false, toneMapped: false
  }))
  turnMarker.scale.set(1.6, .8, 1)
  turnMarker.renderOrder = 1000
  turnMarker.visible = false
  scene.add(turnMarker)
  // Presentation-only Sunburn preview, owned and disposed by the scene.
  const sunburn = new THREE.Group()
  const sunCanvas = document.createElement('canvas')
  sunCanvas.width = sunCanvas.height = 256
  const sunContext = sunCanvas.getContext('2d')
  const glow = sunContext.createRadialGradient(128, 128, 20, 128, 128, 125)
  glow.addColorStop(0, 'rgba(255,255,223,1)')
  glow.addColorStop(.3, 'rgba(255,200,55,.95)')
  glow.addColorStop(.65, 'rgba(255,137,23,.35)')
  glow.addColorStop(1, 'rgba(255,115,0,0)')
  sunContext.fillStyle = glow
  sunContext.fillRect(0, 0, 256, 256)
  sunContext.fillStyle = '#fff0a0'
  for (let i = 0; i < 12; i++) {
    const angle = i * Math.PI / 6
    sunContext.save()
    sunContext.translate(128, 128)
    sunContext.rotate(angle)
    sunContext.beginPath()
    sunContext.moveTo(38, -6)
    sunContext.lineTo(i % 2 ? 75 : 94, 0)
    sunContext.lineTo(38, 6)
    sunContext.fill()
    sunContext.restore()
  }
  const sunTexture = new THREE.CanvasTexture(sunCanvas)
  sunTexture.colorSpace = THREE.SRGBColorSpace
  const sun = new THREE.Sprite(new THREE.SpriteMaterial({ map: sunTexture, transparent: true, depthWrite: false, toneMapped: false }))
  sun.position.y = 3.5
  sun.scale.set(2.1, 2.1, 1)
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(.12, .68, 2.8, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0xffd55e, transparent: true, opacity: .15, depthWrite: false, side: THREE.DoubleSide }))
  beam.position.y = 1.9
  const flare = new THREE.Mesh(new THREE.RingGeometry(.58, .67, 48), new THREE.MeshBasicMaterial({ color: 0xffad35, transparent: true, opacity: .7, depthWrite: false, side: THREE.DoubleSide }))
  flare.rotation.x = -Math.PI / 2
  flare.position.y = .2
  const sparks = Array.from({ length: 8 }, (_, i) => {
    const spark = new THREE.Sprite(new THREE.SpriteMaterial({ map: sunTexture, color: 0xffa52e, transparent: true, depthWrite: false, toneMapped: false }))
    spark.scale.set(.28, .28, 1)
    sunburn.add(spark)
    return spark
  })
  sunburn.add(sun, beam, flare)
  sunburn.visible = false
  scene.add(sunburn)
  let sunburnPreview = null
  function playSunburn(playerId) {
    const actor = actors.get(String(playerId))
    if (!actor || !actor.g.visible) return
    sunburnPreview = { playerId: String(playerId), started: performance.now() }
    showEnergyLoss(playerId, 1, .4)
  }
  // Local review effect: a breaking wave passes through the chosen actor.
  const bigWave = new THREE.Group()
  // Curved surface curls forward at the lip, giving the wave depth from all views.
  const waveGeometry = new THREE.PlaneGeometry(3.4, 1, 36, 24)
  const wavePositions = waveGeometry.attributes.position
  const waveColors = []
  const deep = new THREE.Color('#087d9c'), crest = new THREE.Color('#8de5df')
  for (let i = 0; i < wavePositions.count; i++) {
    const x = wavePositions.getX(i)
    const u = wavePositions.getY(i) + .5
    const edge = Math.max(.25, 1 - .55 * Math.pow(Math.abs(x) / 1.7, 2))
    const height = (1.9 * u - .32 * Math.pow(u, 8)) * edge
    const curl = -.45 * Math.sin(u * Math.PI) + .8 * Math.pow(u, 5)
    wavePositions.setXYZ(i, x, height, curl)
    const color = deep.clone().lerp(crest, Math.pow(u, 2.3))
    waveColors.push(color.r, color.g, color.b)
  }
  waveGeometry.setAttribute('color', new THREE.Float32BufferAttribute(waveColors, 3))
  waveGeometry.computeVertexNormals()
  const water = new THREE.Mesh(waveGeometry, new THREE.MeshPhongMaterial({ vertexColors: true, transparent: true, opacity: .86, shininess: 95, side: THREE.DoubleSide, depthWrite: false }))
  const foamPoints = []
  for (let i = 0; i <= 16; i++) {
    const x = -1.7 + 3.4 * i / 16
    const edge = Math.max(.25, 1 - .55 * Math.pow(Math.abs(x) / 1.7, 2))
    foamPoints.push(new THREE.Vector3(x, 1.58 * edge, .8))
  }
  const foam = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(foamPoints), 48, .095, 8, false), new THREE.MeshBasicMaterial({ color: 0xe7ffff, transparent: true, depthWrite: false }))
  bigWave.add(water, foam)
  bigWave.visible = false
  scene.add(bigWave)
  const tsunamiFollower = bigWave.clone()
  tsunamiFollower.visible = false
  scene.add(tsunamiFollower)
  const tsunamiSwirl = new THREE.Group()
  const swirlArcs = Array.from({ length: 3 }, (_, i) => {
    const arc = new THREE.Mesh(
      new THREE.TorusGeometry(.75 + i * .37, .035, 8, 48, Math.PI * 1.45),
      new THREE.MeshBasicMaterial({ color: i === 1 ? 0xa2fff3 : 0xe2ffff, transparent: true, depthWrite: false })
    )
    arc.rotation.x = -Math.PI / 2
    arc.position.y = .12 + i * .05
    tsunamiSwirl.add(arc)
    return arc
  })
  tsunamiSwirl.visible = false
  scene.add(tsunamiSwirl)
  const waveImpact = new THREE.Group()
  const splash = new THREE.Mesh(new THREE.RingGeometry(.52, .65, 48), new THREE.MeshBasicMaterial({ color: 0xd5ffff, transparent: true, side: THREE.DoubleSide, depthWrite: false }))
  splash.rotation.x = -Math.PI / 2
  splash.position.y = .08
  waveImpact.add(splash)
  const dropletGeometry = new THREE.SphereGeometry(.08, 8, 6)
  const dropletMaterial = new THREE.MeshBasicMaterial({ color: 0xe4ffff, transparent: true, depthWrite: false })
  const droplets = Array.from({ length: 18 }, () => {
    const drop = new THREE.Mesh(dropletGeometry, dropletMaterial)
    waveImpact.add(drop)
    return drop
  })
  waveImpact.visible = false
  scene.add(waveImpact)
  let bigWavePreview = null
  function playBigWave(playerId, tsunami = false) {
    const actor = actors.get(String(playerId))
    if (!actor || !actor.g.visible) return
    bigWavePreview = { playerId: String(playerId), tsunami, started: performance.now() }
    showEnergyLoss(playerId, tsunami ? 3 : 2, tsunami ? 1.5 : .9)
  }
  // Amulet activation preview: a golden charm summons a protective aqua bubble.
  const amuletEffect = new THREE.Group()
  const barrier = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), new THREE.MeshBasicMaterial({ color: 0x60dcf2, transparent: true, opacity: .15, depthWrite: false, side: THREE.DoubleSide }))
  barrier.position.y = .92
  barrier.scale.set(1.05, 1.2, 1.05)
  const halo = new THREE.Mesh(new THREE.TorusGeometry(1.03, .045, 8, 64), new THREE.MeshBasicMaterial({ color: 0x9cffff, transparent: true, depthWrite: false }))
  halo.rotation.x = Math.PI / 2
  halo.position.y = .22
  const charm = new THREE.Group()
  const charmRing = new THREE.Mesh(new THREE.TorusGeometry(.25, .055, 10, 32), new THREE.MeshBasicMaterial({ color: 0xffc65a, transparent: true, depthWrite: false }))
  const charmCore = new THREE.Mesh(new THREE.SphereGeometry(.14, 16, 12), new THREE.MeshBasicMaterial({ color: 0x6cf4ef, transparent: true, depthWrite: false }))
  charm.add(charmRing, charmCore)
  charm.position.y = 2.5
  const amuletSparks = Array.from({ length: 10 }, () => {
    const spark = new THREE.Sprite(new THREE.SpriteMaterial({ map: sunTexture, color: 0x95fff4, transparent: true, depthWrite: false, toneMapped: false }))
    spark.scale.set(.28, .28, 1)
    amuletEffect.add(spark)
    return spark
  })
  amuletEffect.add(barrier, halo, charm)
  amuletEffect.visible = false
  scene.add(amuletEffect)
  let amuletPreview = null
  function playAmulet(playerId) {
    const actor = actors.get(String(playerId))
    if (!actor || !actor.g.visible) return
    amuletPreview = { playerId: String(playerId), started: performance.now() }
  }
  const stoneSplash = new THREE.Group()
  const stoneRing = new THREE.Mesh(new THREE.RingGeometry(.4, .52, 48), new THREE.MeshBasicMaterial({ color: 0xd8ffff, transparent: true, side: THREE.DoubleSide, depthWrite: false }))
  stoneRing.rotation.x = -Math.PI / 2
  stoneRing.position.y = .12
  stoneSplash.add(stoneRing)
  const stoneDrops = Array.from({ length: 14 }, () => {
    const drop = new THREE.Mesh(dropletGeometry, dropletMaterial.clone())
    stoneSplash.add(drop)
    return drop
  })
  stoneSplash.visible = false
  scene.add(stoneSplash)
  let stonePreview = null
  function playStone(cellId) {
    const stone = obstacles.get(cellId + ':Stone:')
    if (!stone) return
    if (stonePreview) stonePreview.stone.position.y = .1
    stonePreview = { stone, cellId, started: performance.now() }
  }
  const stormArrival = new THREE.Mesh(new THREE.RingGeometry(.52, .58, 48), new THREE.MeshBasicMaterial({ color: 0xa7ddff, transparent: true, side: THREE.DoubleSide, depthWrite: false }))
  stormArrival.rotation.x = -Math.PI / 2
  stormArrival.visible = false
  scene.add(stormArrival)
  let stormPreview = null
  function playStorm(cellId) {
    const storm = obstacles.get(cellId + ':Storm:')
    if (!storm) return
    if (stormPreview) stormPreview.storm.position.y = .1
    stormPreview = { storm, cellId, started: performance.now() }
  }
  const cycloneArrival = new THREE.Group()
  const cycloneRings = Array.from({ length: 3 }, (_, i) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.5 + i * .2, .035, 8, 48, Math.PI * 1.5), new THREE.MeshBasicMaterial({ color: 0xd9ffff, transparent: true, depthWrite: false }))
    ring.rotation.x = -Math.PI / 2
    ring.position.y = .13 + i * .03
    cycloneArrival.add(ring)
    return ring
  })
  cycloneArrival.visible = false
  scene.add(cycloneArrival)
  let cyclonePreview = null
  function playCyclone(cellId) {
    const cyclone = obstacles.get(cellId + ':Cyclone:')
    if (!cyclone) return
    if (cyclonePreview) cyclonePreview.cyclone.scale.set(1, 1, 1)
    cyclonePreview = { cyclone, cellId, started: performance.now() }
  }
  let islandPreview = null
  function resetIsland(island) {
    island.getObjectByName('island-sand')?.scale.set(1, 1, 1)
    island.traverse(object => { if (object.name === 'island-palm') object.scale.set(1, 1, 1) })
  }
  function playIsland(cellId) {
    const island = obstacles.get(cellId + ':Island:')
    if (!island) return
    if (islandPreview) resetIsland(islandPreview.island)
    islandPreview = { island, cellId, started: performance.now() }
  }
  // Preview only: a rising golden charge around the selected rider.
  const energyEffect = new THREE.Group()
  const energyHex = new THREE.Mesh(new THREE.CircleGeometry(R * .90, 6), new THREE.MeshBasicMaterial({ color: 0xffdb46, transparent: true, opacity: .3, depthWrite: false, side: THREE.DoubleSide }))
  energyHex.rotation.x = -Math.PI / 2
  energyHex.position.y = .10
  energyEffect.add(energyHex)
  const boltShape = new THREE.Shape()
  boltShape.moveTo(.05, .48)
  boltShape.lineTo(-.25, -.04)
  boltShape.lineTo(-.035, -.04)
  boltShape.lineTo(-.12, -.48)
  boltShape.lineTo(.28, .12)
  boltShape.lineTo(.06, .12)
  boltShape.lineTo(.18, .48)
  boltShape.closePath()
  const boltGeometry = new THREE.ExtrudeGeometry(boltShape, {
    depth: .10, bevelEnabled: true, bevelThickness: .025, bevelSize: .025, bevelSegments: 2
  })
  boltGeometry.center()
  const energyBolts = Array.from({ length: 3 }, () => {
    const bolt = new THREE.Mesh(boltGeometry, new THREE.MeshStandardMaterial({
      color: 0xffc928, emissive: 0xff9500, emissiveIntensity: .45,
      metalness: .45, roughness: .25, transparent: true, depthWrite: false
    }))
    energyEffect.add(bolt)
    return bolt
  })
  const energyCanvas = document.createElement('canvas')
  energyCanvas.width = 256
  energyCanvas.height = 128
  const energyContext = energyCanvas.getContext('2d')
  energyContext.font = 'bold 88px sans-serif'
  energyContext.textAlign = 'center'
  energyContext.textBaseline = 'middle'
  energyContext.lineWidth = 10
  energyContext.strokeStyle = '#87500c'
  energyContext.strokeText('+2', 128, 64)
  energyContext.fillStyle = '#fff4a3'
  energyContext.fillText('+2', 128, 64)
  const energyTexture = new THREE.CanvasTexture(energyCanvas)
  energyTexture.colorSpace = THREE.SRGBColorSpace
  const energyText = new THREE.Sprite(new THREE.SpriteMaterial({ map: energyTexture, transparent: true, depthWrite: false, toneMapped: false }))
  energyText.scale.set(1.4, .7, 1)
  energyEffect.add(energyText)
  energyEffect.visible = false
  scene.add(energyEffect)
  let energyPreview = null
  function playEnergy(playerId) {
    const actor = actors.get(String(playerId))
    if (!actor || !actor.g.visible) return
    energyPreview = { playerId: String(playerId), started: performance.now() }
  }
  const lossCanvas = document.createElement('canvas')
  lossCanvas.width = 256
  lossCanvas.height = 128
  const lossTexture = new THREE.CanvasTexture(lossCanvas)
  lossTexture.colorSpace = THREE.SRGBColorSpace
  const lossText = new THREE.Sprite(new THREE.SpriteMaterial({ map: lossTexture, transparent: true, depthWrite: false, toneMapped: false }))
  lossText.scale.set(1.4, .7, 1)
  lossText.visible = false
  scene.add(lossText)
  let lossPreview = null
  function showEnergyLoss(playerId, amount, delay) {
    const context = lossCanvas.getContext('2d')
    context.clearRect(0, 0, 256, 128)
    context.font = 'bold 88px sans-serif'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.lineWidth = 10
    context.strokeStyle = '#6d2119'
    context.strokeText('−' + amount, 128, 64)
    context.fillStyle = '#ffb0a1'
    context.fillText('−' + amount, 128, 64)
    lossTexture.needsUpdate = true
    lossText.visible = false
    lossPreview = { playerId: String(playerId), started: performance.now(), delay }
  }
  // A preview lifebuoy approaches over the water before the rider remounts.
  const lifeguardEffect = new THREE.Group()
  const buoy = new THREE.Group()
  const buoyRing = new THREE.Mesh(new THREE.TorusGeometry(.42, .115, 12, 48), new THREE.MeshStandardMaterial({ color: 0xe8442d, roughness: .42 }))
  buoy.add(buoyRing)
  for (let i = 0; i < 4; i++) {
    const stripe = new THREE.Mesh(new THREE.TorusGeometry(.42, .118, 10, 8, .24), new THREE.MeshStandardMaterial({ color: 0xfff8e6, roughness: .55 }))
    stripe.rotation.z = i * Math.PI / 2 - .12
    buoy.add(stripe)
  }
  buoy.rotation.x = -Math.PI / 2
  lifeguardEffect.add(buoy)
  const rescueCanvas = document.createElement('canvas')
  rescueCanvas.width = 256
  rescueCanvas.height = 128
  const rescueContext = rescueCanvas.getContext('2d')
  rescueContext.font = 'bold 88px sans-serif'
  rescueContext.textAlign = 'center'
  rescueContext.textBaseline = 'middle'
  rescueContext.lineWidth = 10
  rescueContext.strokeStyle = '#23533f'
  rescueContext.strokeText('+3', 128, 64)
  rescueContext.fillStyle = '#c9ffe2'
  rescueContext.fillText('+3', 128, 64)
  const rescueTexture = new THREE.CanvasTexture(rescueCanvas)
  rescueTexture.colorSpace = THREE.SRGBColorSpace
  const rescueText = new THREE.Sprite(new THREE.SpriteMaterial({ map: rescueTexture, transparent: true, depthWrite: false, toneMapped: false }))
  rescueText.scale.set(1.4, .7, 1)
  lifeguardEffect.add(rescueText)
  lifeguardEffect.visible = false
  scene.add(lifeguardEffect)
  let lifeguardPreview = null
  function playLifeguard(playerId) {
    const actor = actors.get(String(playerId))
    if (!actor || !actor.g.visible) return
    lifeguardPreview = { playerId: String(playerId), started: performance.now() }
  }
  let turnMarkerPlayerId = null
  const controls = new OrbitControls(camera,renderer.domElement)
  Object.assign(controls,{enableDamping:true,enablePan:true,enableRotate:true,zoomToCursor:true,minDistance:9,maxDistance:105,minPolarAngle:.08,maxPolarAngle:Math.PI * .46})
  controls.mouseButtons.LEFT = THREE.MOUSE.PAN
  controls.mouseButtons.RIGHT = THREE.MOUSE.ROTATE
  controls.touches.ONE = THREE.TOUCH.PAN
  controls.touches.TWO = THREE.TOUCH.DOLLY_ROTATE
  const defaultTarget = new THREE.Vector3(0, 0, -2)
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  let cameraTransition = null
  const cameraOffset = () => new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target))
  const defaultOffset = () => new THREE.Spherical().setFromVector3(
    new THREE.Vector3(10, 26, 34).multiplyScalar(Math.min(2.4, Math.max(1, .85 / camera.aspect)))
  )
  function moveCamera(offset, target = controls.target) {
    if (reducedMotion.matches) {
      cameraTransition = null
      controls.target.copy(target)
      camera.position.setFromSpherical(offset).add(controls.target)
      controls.update()
      return
    }
    const from = cameraOffset()
    const angle = offset.theta - from.theta
    offset.theta = from.theta + Math.atan2(Math.sin(angle), Math.cos(angle))
    cameraTransition = { from, offset, fromTarget: controls.target.clone(), target: target.clone(), start: performance.now() }
  }
  function animateCamera(now) {
    if (!cameraTransition) return
    const { from, offset, fromTarget, target, start } = cameraTransition
    const t = THREE.MathUtils.clamp((now - start) / 300, 0, 1)
    const eased = t * t * (3 - 2 * t)
    controls.target.lerpVectors(fromTarget, target, eased)
    camera.position.setFromSphericalCoords(
      THREE.MathUtils.lerp(from.radius, offset.radius, eased),
      THREE.MathUtils.lerp(from.phi, offset.phi, eased),
      THREE.MathUtils.lerp(from.theta, offset.theta, eased)
    ).add(controls.target)
    if (t === 1) cameraTransition = null
  }
  controls.addEventListener('start', () => { cameraTransition = null })
  const resetCamera = () => moveCamera(defaultOffset(), defaultTarget)
  const animateScenery = createCoastalScenery(scene)
  const modelHelpers = createScenePrimitives(scene)
  const hex=new THREE.Shape(),outline=[]
  for(let i=0;i<=6;i++){const a=i*Math.PI/3,x=Math.cos(a)*R,z=Math.sin(a)*R;if(!i)hex.moveTo(x,z);else hex.lineTo(x,z);outline.push(new THREE.Vector3(x,0,z))}
  const shapeGeo=new THREE.ShapeGeometry(hex)
  const hitMat=new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide})
  const outlineGeo=new THREE.BufferGeometry().setFromPoints(outline)
  const lines=new THREE.LineBasicMaterial({color:'#b9ffec',transparent:true,opacity:.77})
  const targets = []
  const hexDepth = createHexDepth(BOARD_LAYOUT, R)
  hexDepth.group.visible = true
  scene.add(hexDepth.group)
  const fillMaterial = new THREE.MeshBasicMaterial({
    color: '#b4f2df', transparent: true, opacity: .15, depthWrite: false, side: THREE.DoubleSide
  })
  const cellLabels = new THREE.Group()
  const cellLabelGeometry = new THREE.PlaneGeometry(.84, .525)
  scene.add(cellLabels)
  for (const cell of BOARD_LAYOUT) {
    const hit = new THREE.Mesh(shapeGeo, hitMat)
    hit.position.set(cell.x, .12, cell.z)
    hit.rotation.x = -Math.PI / 2
    hit.userData.cellId = cell.id
    scene.add(hit)
    targets.push(hit)

    const fill = new THREE.Mesh(shapeGeo, fillMaterial)
    fill.rotation.x = -Math.PI / 2
    fill.position.set(cell.x, .04, cell.z)
    scene.add(fill)
    const edge = new THREE.LineLoop(outlineGeo, lines)
    edge.position.set(cell.x, .187, cell.z)
    scene.add(edge)

    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 80
    const context = canvas.getContext('2d')
    context.beginPath()
    context.arc(42, 40, 36, Math.PI / 2, Math.PI * 1.5)
    context.arc(86, 40, 36, -Math.PI / 2, Math.PI / 2)
    context.closePath()
    context.fillStyle = 'rgba(17, 84, 78, .78)'
    context.fill()
    context.font = cell.id >= 49 ? 'bold 28px sans-serif' : 'bold 46px sans-serif'
    context.fillStyle = '#fff'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(cell.id >= 49 ? 'FINISH' : String(cell.id + 1), 64, 41, 114)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    const label = new THREE.Mesh(cellLabelGeometry, new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, side: THREE.DoubleSide }))
    label.rotation.x = -Math.PI / 2
    label.position.set(cell.x, .21, cell.z + .84)
    cellLabels.add(label)
  }
  function ring(color){const o=new THREE.LineLoop(outlineGeo,new THREE.LineBasicMaterial({color}));o.position.y=.22;o.visible=false;scene.add(o);return o}
  const hovered=ring('#f8ffff'),selected=ring('#ffda57')
  const maneuverRings = Array.from({ length: 6 }, () => ring('#ffda57'))
  const targetHighlights = createTargetHighlights(BOARD_LAYOUT, shapeGeo, outlineGeo)
  scene.add(targetHighlights.group)
  function positionRing(ring,id){const cell=Number.isInteger(id)?BOARD_LAYOUT[id]:null;ring.visible=!!cell;if(cell)ring.position.set(cell.x,.23,cell.z)}
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2()
  function pick(event){const box=renderer.domElement.getBoundingClientRect();if(!box.width||!box.height)return null;pointer.set((event.clientX-box.left)/box.width*2-1,-(event.clientY-box.top)/box.height*2+1);raycaster.setFromCamera(pointer,camera);return raycaster.intersectObjects(targets,false)[0]?.object.userData.cellId??null}
  let start = null
  const pressedPointers = new Set()
  let hoverId = null
  function setHover(id) {
    if (id === hoverId) return
    hoverId = id
    positionRing(hovered, id)
    onCellHover?.(id)
  }
  function move(e) {
    if (start && e.pointerId === start.id && Math.hypot(e.clientX - start.x, e.clientY - start.y) >= 6) start = null
    const id = pressedPointers.size ? null : pick(e)
    setHover(id)
    renderer.domElement.style.cursor = id === null ? 'grab' : 'pointer'
  }
  function down(e) {
    pressedPointers.add(e.pointerId)
    setHover(null)
    start = pressedPointers.size === 1 && e.button === 0 && !e.shiftKey && !e.ctrlKey && !e.metaKey
      ? { id: e.pointerId, x: e.clientX, y: e.clientY } : null
  }
  function cancel(e) {
    pressedPointers.delete(e.pointerId)
    start = null
  }
  function up(e) {
    const isTap = start?.id === e.pointerId && Math.hypot(e.clientX - start.x, e.clientY - start.y) < 6
    cancel(e)
    if (isTap) {
      const id = pick(e)
      if (id !== null) onCellSelect(id)
    }
  }
  function leave(){setHover(null)}
  renderer.domElement.addEventListener('pointermove',move)
  renderer.domElement.addEventListener('pointerdown',down)
  renderer.domElement.addEventListener('pointerup',up)
  renderer.domElement.addEventListener('pointercancel',cancel)
  renderer.domElement.addEventListener('pointerleave',leave)
  const actors=new Map(),obstacles=new Map()
  const riggedTemplates = {}
  const localProfiles = previewFemaleAthlete ? readLocalSurferProfiles() : {}
  function upgradeSurfer(actor) {
    const id = Number(actor.id)
    const style = resolveBoardSurferStyle(id, localProfiles[String(id)])
    if (!riggedTemplates[style.character] || actor.avatar) return
    try {
      // One independent bone hierarchy per rider; keep the existing procedural
      // model invisible as a safe fallback if GLB parsing or styling fails.
      const avatar = createRiggedBoardSurfer(riggedTemplates, actor.id, {
        previewFemaleAthlete, athleteBoardType, localProfile: localProfiles[String(id)]
      })
      actor.g.add(avatar.display)
      actor.legacy.group.visible = false
      actor.avatar = avatar
      if (avatar.surfboard) {
        actor.boardYaw = avatar.surfboard.rotation.y
        actor.rollAxis.set(Math.cos(actor.boardYaw),0,-Math.sin(actor.boardYaw))
      }
      if (avatar.display.userData.athletePreview) {
        renderer.domElement.dataset.athleteReady = 'true'
        renderer.domElement.dataset[avatar.display.userData.character === 'male' ? 'athleteMaleReady' : 'athleteFemaleReady'] = 'true'
      }
    } catch (error) {
      console.warn('Using the procedural surfer fallback:', error)
    }
  }
  function createSurfer(id) {
    const index = Number(id)
    const model = createSurferModel(scene, modelHelpers, PLAYER_BOARD_COLORS[index] || colors.orange,
      index % 2 ? palette.skin : palette.skinLight, index % 2 ? '#724c35' : '#e8b449', index % 2 === 1)
    const group = new THREE.Group()
    group.name = 'player-surfer'
    scene.remove(model.group)
    group.add(model.group)
    scene.add(group)
    // A separate camera-facing identity badge follows the actor, not its roll.
    const badgeCanvas = document.createElement('canvas')
    badgeCanvas.width = 256
    badgeCanvas.height = 64
    const badgeTexture = new THREE.CanvasTexture(badgeCanvas)
    badgeTexture.colorSpace = THREE.SRGBColorSpace
    const badge = new THREE.Sprite(new THREE.SpriteMaterial({
      map: badgeTexture, transparent: true, depthTest: false, depthWrite: false, toneMapped: false
    }))
    badge.visible = false
    badge.scale.set(1.28,.32,1)
    badge.renderOrder = 998
    scene.add(badge)
    const actor = {
      badge, badgeCanvas, badgeKey: null,
      g: group, legacy: model, avatar: null, id,
      cellId: null, from: null, to: null, t: 1,
      anchor: new THREE.Vector3(), heading: 0, startHeading: 0, endHeading: 0,
      boardYaw: model.group.rotation.y + Math.PI / 2,
      rollAxis: new THREE.Vector3(Math.cos(model.group.rotation.y + Math.PI / 2),0,-Math.sin(model.group.rotation.y + Math.PI / 2)),
      dx: 0, dz: 0, distance: 0, fallMotion: createFallMotion(),
      legacyBody: model.group.getObjectByName('surfer-stance'),
      animate(seconds, phase, bank) {
        if (this.avatar) this.avatar.animate(seconds + phase * .37, reducedMotion.matches)
        else this.legacy.animate(seconds, phase, bank)
      }
    }
    upgradeSurfer(actor)
    return actor
  }
  function createObstacle(cell) {
    const group = new THREE.Group()
    scene.add(group)
    const position = BOARD_LAYOUT[cell.id]
    group.position.set(position.x, .1, position.z)

    const model = createObstacleModel(cell.obstacleType, modelHelpers)
    group.add(model.object)
    group.userData.animate = (elapsed, reduced) => model.update(elapsed, cell.id, reduced)

    if (cell.remainingTurns !== null && Number.isFinite(cell.remainingTurns)) {
      const canvas = document.createElement('canvas')
      canvas.width = 128
      canvas.height = 128
      const context = canvas.getContext('2d')
      context.fillStyle = '#173c45'
      context.fillRect(19, 16, 90, 90)
      context.font = 'bold 74px sans-serif'
      context.textAlign = 'center'
      context.fillStyle = '#fff'
      context.fillText(String(cell.remainingTurns), 64, 90)
      const texture = new THREE.CanvasTexture(canvas)
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }))
      sprite.position.set(0, 1.37, 0)
      sprite.scale.set(.48, .48, 1)
      group.add(sprite)
    }
    return group
  }
  function removeSurfer(actor) {
    if (actor.avatar) {
      actor.avatar.dispose()
      actor.g.remove(actor.avatar.display)
    }
    // Scene primitives pool materials across riders: dispose only the
    // procedural geometry here, never a shared GLB or pooled material.
    actor.legacy.group.traverse(node => { if (node.geometry) node.geometry.dispose() })
    scene.remove(actor.g)
    scene.remove(actor.badge)
    actor.badge.material.map.dispose()
    actor.badge.material.dispose()
    delete renderer.domElement.dataset['surferMotion'+actor.id]
  }
  function removeGroup(g){scene.remove(g);g.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.isSprite&&o.material){if(o.material.map)o.material.map.dispose();o.material.dispose()}})}
  function update(snapshot){positionRing(selected,snapshot.selectedCellId);hexDepth.select(snapshot.selectedCellId)
    turnMarkerPlayerId = snapshot.turnMarkerPlayerId ?? null
    turnMarker.visible = false
    if (turnMarkerPlayerId === null) delete renderer.domElement.dataset.activeTurnPlayer
    else renderer.domElement.dataset.activeTurnPlayer = turnMarkerPlayerId
    maneuverRings.forEach((marker, index) => {
      positionRing(marker, snapshot.targetHighlight ? null : snapshot.maneuverDestinations?.[index])
    })
    targetHighlights.update(snapshot.targetHighlight, true)
    const live=new Set()
    for(const p of snapshot.players){live.add(p.id);let a=actors.get(p.id);if(!a){a=createSurfer(p.id);actors.set(p.id,a)}
      const cell=p.cellId===null?null:BOARD_LAYOUT[p.cellId];a.g.visible=!!cell
      if(!cell){a.cellId=null;a.from=null;a.to=null;a.badge.visible=false;continue}
      const occupants = snapshot.players.filter(other => other.cellId === p.cellId).sort((a,b) => Number(a.id)-Number(b.id))
      const shared = occupants.length > 1
      const slot = occupants.findIndex(other => other.id === p.id)
      const offset = shared ? (slot === 0 ? -.56 : .56) : 0
      const target=new THREE.Vector3(cell.x+offset,.13,cell.z)
      a.g.scale.setScalar(shared ? .74 : 1)
      const blocked = snapshot.targetHighlight?.blocked?.find(item => String(item.playerId) === p.id)
      const legal = snapshot.targetHighlight?.playerIds?.includes(Number(p.id))
      const winner = snapshot.winnerPlayerId === p.id
      a.badge.visible = shared || !!blocked || !!legal || winner || p.fallen
      a.badge.scale.set(shared ? 1.35 : 1.9, shared ? .34 : .48, 1)
      const label = 'P' + (Number(p.id)+1) + (winner ? ' · WINNER' : legal ? ' · TARGET' :
        blocked ? ' · ' + getTargetBlockStyle(blocked.code).shortLabel : p.fallen ? ' · Fallen' : '')
      const tint = winner ? '#ffcf53' : legal ? '#ff9882' : blocked ? getTargetBlockStyle(blocked.code).color : PLAYER_BOARD_COLORS[Number(p.id)]
      const badgeKey = label + tint
      if (a.badgeKey !== badgeKey) {
        const c = a.badgeCanvas.getContext('2d')
        c.clearRect(0,0,256,64)
        c.fillStyle = '#173640'
        c.fillRect(2,5,252,54)
        c.strokeStyle = tint || '#fff4c5'
        c.lineWidth = 5
        c.strokeRect(4,7,248,50)
        c.fillStyle = tint || '#fff4c5'
        c.font = 'bold 30px sans-serif'
        c.textAlign = 'center'
        c.textBaseline = 'middle'
        c.fillText(label,128,32,238)
        a.badge.material.map.needsUpdate = true
        a.badgeKey = badgeKey
      }
      const immediate = a.cellId === null || reducedMotion.matches
      a.fallMotion = targetFallMotion(a.fallMotion, p.fallen === true, immediate)
      if(immediate){a.anchor.copy(target);a.g.position.copy(target);a.from=null;a.to=null;a.t=1}
      else if(a.cellId!==p.cellId || a.slotOffset!==offset){
        a.from=a.anchor.clone();a.to=target;a.t=0
        a.dx=target.x-a.from.x;a.dz=target.z-a.from.z
        a.distance=Math.hypot(a.dx,a.dz)
        a.startHeading=a.heading
        a.endHeading=shortestHeading(a.heading,Math.atan2(-a.dz,a.dx)-a.boardYaw)
      }
      a.cellId=p.cellId
      a.slotOffset=offset
    }
    for(const [id,a] of actors)if(!live.has(id)){removeSurfer(a);actors.delete(id)}
    const keys=new Set()
    for(const c of snapshot.cells)if(c.obstacleType){const key=c.id+':'+c.obstacleType+':'+(c.remainingTurns??'');keys.add(key);if(!obstacles.has(key))obstacles.set(key,createObstacle(c))}
    for(const [key,g] of obstacles)if(!keys.has(key)){removeGroup(g);obstacles.delete(key)}
  }
  let elapsed=0,last=performance.now(),raf=0,disposed=false
  function frame(now){if(disposed)return;const dt=Math.min((now-last)/1000,.1);last=now;elapsed+=dt
    animateScenery(elapsed)
    const reduce = reducedMotion.matches
    for(const a of actors.values()){
      if(a.cellId===null) continue
      const phase=elapsed+Number(a.id)*.71
      a.fallMotion=stepFallMotion(a.fallMotion,dt,reduce)
      const fall=a.fallMotion.value
      if(a.from&&a.to) a.t=reduce?1:Math.min(1,a.t+dt/MOVE_SECONDS)
      const carve=sampleCarve(a.t,phase,a.distance,a.fallMotion.remount ? 1 : fall,reduce)
      if(a.from&&a.to){
        a.anchor.lerpVectors(a.from,a.to,carve.progress)
        if(a.distance>1e-6){
          a.anchor.x+=-a.dz/a.distance*carve.travel
          a.anchor.z+=a.dx/a.distance*carve.travel
        }
        a.heading=a.startHeading+(a.endHeading-a.startHeading)*carve.progress
        if(a.t===1){a.anchor.copy(a.to);a.from=null;a.to=null}
      }
      const heading=a.heading+a.boardYaw
      a.g.position.copy(a.anchor)
      a.g.position.x+=Math.sin(heading)*carve.idle
      a.g.position.z+=Math.cos(heading)*carve.idle
      a.g.position.x+=Math.cos(heading)*carve.idleForward
      a.g.position.z-=Math.sin(heading)*carve.idleForward
      a.g.position.y=.13+carve.lift+(reduce?0:Math.sin(phase*1.6)*.012)
      a.g.rotation.set(0,a.heading+carve.yaw,0)
      const bank=carve.bank
      // Roll around the board's own longitudinal axis, not a fixed world axis.
      a.g.rotateOnAxis(a.rollAxis,bank)
      if (a.badge.visible) { a.badge.position.copy(a.g.position); a.badge.position.y += 1.6 }
      const sample=a.fallMotion.remount
        ? sampleRemount(1-fall,phase,reduce)
        : sampleRiderMotion(fall,a.t,phase,reduce,bank)
      sample.waterOffset=sampleOceanHeight(a.g.position.x,a.g.position.z,elapsed)-a.g.position.y
      a.animate(elapsed,Number(a.id),bank)
      if(a.avatar?.setBoardMotion) a.avatar.setBoardMotion(sample)
      else if(!a.avatar&&a.legacyBody){
        const immersion=sample.immersion
        a.legacyBody.position.set(.34*(sample.riderAside??immersion),.075+immersion*(sample.waterOffset/.65-.95),0)
        a.legacyBody.rotation.z=-sample.lean*(1-immersion)
        // Procedural board has its long axis along Z.
        a.legacy.board.position.set(-.48*(sample.boardAside??sample.boardRise),(sample.waterOffset/.65-.05)*sample.boardRise,0)
        a.legacy.board.rotation.x=THREE.MathUtils.lerp(a.legacy.board.rotation.x,1.32,sample.boardRise)+sample.boardRoll
        a.legacy.board.rotation.z=bank*.05
      }
      a.g.userData.motionState=fall>0?(a.fallMotion.to===0?'remounting':fall>=1?'fallen':'falling'):(a.t<1?'moving':'riding')
      renderer.domElement.dataset['surferMotion'+a.id]=a.g.userData.motionState
      if(sample.remount!==undefined) renderer.domElement.dataset['surferRemount'+a.id]=sample.handContact>.9?'press':sample.remount>.7?'stand':'reach'
      else delete renderer.domElement.dataset['surferRemount'+a.id]
    }
    if (sunburnPreview) {
      const target = actors.get(sunburnPreview.playerId)
      const t = (now - sunburnPreview.started) / 1000
      if (!target || !target.g.visible || t >= 3) {
        sunburn.visible = false
        sunburnPreview = null
      } else {
        sunburn.visible = true
        sunburn.position.copy(target.g.position)
        const fade = Math.min(1, t / .35, (3 - t) / .65)
        sun.material.opacity = fade
        beam.material.opacity = .16 * fade
        flare.material.opacity = .7 * fade
        flare.scale.setScalar(reduce ? 1 : 1 + .45 * ((t * .65) % 1))
        const sunSize = reduce ? 2.1 : 2.1 + .14 * Math.sin(t * 4)
        sun.scale.set(sunSize, sunSize, 1)
        sparks.forEach((spark, i) => {
          const phase = reduce ? .5 : (t * .65 + i / sparks.length) % 1
          const angle = i * Math.PI * 2 / sparks.length
          spark.position.set(Math.cos(angle) * (.55 + phase * .3), .35 + phase * 1.6, Math.sin(angle) * (.55 + phase * .3))
          spark.material.opacity = fade * Math.sin(phase * Math.PI) * .8
        })
      }
    }
    if (bigWavePreview) {
      const target = actors.get(bigWavePreview.playerId)
      const t = (now - bigWavePreview.started) / 1000
      const tsunami = bigWavePreview.tsunami
      const duration = tsunami ? 4.4 : 2.6
      if (!target || !target.g.visible || t >= duration) {
        bigWave.visible = false
        tsunamiFollower.visible = false
        tsunamiSwirl.visible = false
        waveImpact.visible = false
        bigWavePreview = null
      } else {
        const surge = reduce ? 1 : THREE.MathUtils.clamp((t - .55) / 1.9, 0, 1)
        const rise = reduce ? 1 : THREE.MathUtils.smoothstep(t, .3, 1.4)
        bigWave.visible = !tsunami || t >= .3
        bigWave.position.copy(target.g.position)
        bigWave.scale.set(tsunami ? 1.45 : 1, tsunami ? .2 + 1.5 * rise : 1, tsunami ? 1.3 : 1)
        bigWave.position.z += reduce ? 0 : (tsunami ? 3.1 - surge * 4.3 : 2.2 - Math.min(1, t / 1.45) * 2.8)
        tsunamiFollower.visible = tsunami && !reduce && t > 1
        if (tsunamiFollower.visible) {
          const follow = THREE.MathUtils.clamp((t - 1) / 2.2, 0, 1)
          tsunamiFollower.scale.set(1.12, .55 + .6 * Math.sin(follow * Math.PI), 1)
          tsunamiFollower.position.copy(target.g.position)
          tsunamiFollower.position.z += 4.2 - follow * 5.4
        }
        tsunamiSwirl.visible = tsunami && t < 3.4
        if (tsunamiSwirl.visible) {
          tsunamiSwirl.position.copy(target.g.position)
          swirlArcs.forEach((arc, i) => {
            arc.rotation.z = reduce ? 0 : t * (i % 2 ? -1.8 : 1.5) + i * 2
            arc.material.opacity = Math.min(1, t / .35, (3.4 - t) / .6) * .8
            arc.scale.setScalar(reduce ? 1 : 1 + .08 * Math.sin(t * 5 + i))
          })
        }
        const fade = Math.min(1, t / .3, (duration - t) / .65)
        water.material.opacity = .82 * fade
        foam.material.opacity = fade
        const impact = reduce ? .5 : THREE.MathUtils.clamp((t - (tsunami ? 1.45 : .85)) / (tsunami ? 2 : 1.3), 0, 1)
        waveImpact.visible = impact > 0
        waveImpact.position.copy(target.g.position)
        splash.material.opacity = .8 * (1 - impact) * fade
        splash.scale.setScalar(1 + impact * 1.6)
        dropletMaterial.opacity = Math.sin(impact * Math.PI) * fade
        droplets.forEach((drop, i) => {
          const angle = i * Math.PI * 2 / droplets.length
          const distance = .35 + impact * (tsunami ? 2 : 1) * (1.1 + (i % 3) * .17)
          drop.position.set(Math.cos(angle) * distance, .2 + Math.sin(impact * Math.PI) * (tsunami ? 1.7 : 1) * (.55 + (i % 4) * .2), Math.sin(angle) * distance)
          drop.scale.setScalar(1 - impact * .45)
        })
      }
    }
    if (amuletPreview) {
      const target = actors.get(amuletPreview.playerId)
      const t = (now - amuletPreview.started) / 1000
      if (!target || !target.g.visible || t >= 4) {
        amuletEffect.visible = false
        amuletPreview = null
      } else {
        amuletEffect.visible = true
        amuletEffect.position.copy(target.g.position)
        const fade = Math.min(1, t / .4, (4 - t) / .55)
        const appear = reduce ? 1 : THREE.MathUtils.smoothstep(t, .15, .9)
        barrier.scale.set(1.05 * appear, 1.2 * appear, 1.05 * appear)
        barrier.material.opacity = .14 * fade
        halo.material.opacity = .85 * fade
        halo.scale.setScalar(reduce ? 1 : .75 + .25 * appear)
        charm.rotation.y = reduce ? 0 : t * 2
        charm.position.y = 2.5 + (reduce ? 0 : .1 * Math.sin(t * 3))
        charmRing.material.opacity = charmCore.material.opacity = fade
        amuletSparks.forEach((spark, i) => {
          const angle = i * Math.PI * 2 / amuletSparks.length + (reduce ? 0 : t * 1.4)
          spark.position.set(Math.cos(angle) * 1.05, .35 + (i % 5) * .32, Math.sin(angle) * 1.05)
          spark.material.opacity = fade * .8
        })
      }
    }
    if (stonePreview) {
      const { stone, cellId, started } = stonePreview
      const t = (now - started) / 1000
      if (!obstacles.has(cellId + ':Stone:') || t >= 2.7) {
        stone.position.y = .1
        stoneSplash.visible = false
        stonePreview = null
      } else {
        const falling = reduce ? 1 : THREE.MathUtils.clamp(t / .7, 0, 1)
        stone.position.y = .1 + 3.2 * (1 - falling * falling)
        const impact = reduce ? .4 : THREE.MathUtils.clamp((t - .7) / 1.4, 0, 1)
        stoneSplash.visible = impact > 0 && impact < 1
        stoneSplash.position.set(BOARD_LAYOUT[cellId].x, .1, BOARD_LAYOUT[cellId].z)
        stoneRing.scale.setScalar(1 + impact * 2)
        stoneRing.material.opacity = .85 * (1 - impact)
        stoneDrops.forEach((drop, i) => {
          const angle = i * Math.PI * 2 / stoneDrops.length
          const distance = .35 + impact * (1.1 + (i % 3) * .16)
          drop.position.set(Math.cos(angle) * distance, .1 + Math.sin(impact * Math.PI) * (.55 + (i % 3) * .2), Math.sin(angle) * distance)
          drop.material.opacity = Math.sin(impact * Math.PI)
        })
      }
    }
    if (stormPreview) {
      const { storm, cellId, started } = stormPreview
      const t = (now - started) / 1000
      if (!obstacles.has(cellId + ':Storm:') || t >= 3) {
        storm.position.y = .1
        stormArrival.visible = false
        stormPreview = null
      } else {
        const growth = reduce ? 1 : THREE.MathUtils.smoothstep(t, .2, 1.4)
        storm.position.y = .1 + 2.2 * (1 - growth)
        const ripple = reduce ? .5 : THREE.MathUtils.clamp((t - 1.1) / 1.5, 0, 1)
        stormArrival.visible = ripple > 0 && ripple < 1
        stormArrival.position.set(BOARD_LAYOUT[cellId].x, .19, BOARD_LAYOUT[cellId].z)
        stormArrival.scale.setScalar(.5 + ripple * 2)
        stormArrival.material.opacity = .65 * (1 - ripple)
      }
    }
    if (cyclonePreview) {
      const { cyclone, cellId, started } = cyclonePreview
      const t = (now - started) / 1000
      if (!obstacles.has(cellId + ':Cyclone:') || t >= 3.4) {
        cyclone.scale.set(1, 1, 1)
        cycloneArrival.visible = false
        cyclonePreview = null
      } else {
        const rise = reduce ? 1 : THREE.MathUtils.smoothstep(t, .25, 2)
        cyclone.scale.set(1, .04 + .96 * rise, 1)
        cycloneArrival.visible = true
        cycloneArrival.position.set(BOARD_LAYOUT[cellId].x, .1, BOARD_LAYOUT[cellId].z)
        cycloneRings.forEach((ring, i) => {
          ring.rotation.z = reduce ? 0 : t * (i % 2 ? -2 : 2) + i * 2
          ring.scale.setScalar(reduce ? 1 : .8 + .2 * rise)
          ring.material.opacity = Math.min(1, t / .3, (3.4 - t) / .7) * .7
        })
      }
    }
    if (islandPreview) {
      const { island, cellId, started } = islandPreview
      const t = (now - started) / 1000
      if (!obstacles.has(cellId + ':Island:') || t >= 4.4) {
        resetIsland(island)
        islandPreview = null
      } else {
        const sand = reduce ? 1 : THREE.MathUtils.smoothstep(t, .1, 1.7)
        const growth = reduce ? 1 : THREE.MathUtils.smoothstep(t, 1.65, 3.8)
        island.getObjectByName('island-sand')?.scale.set(1, Math.max(.001, sand), 1)
        island.traverse(object => {
          if (object.name === 'island-palm') object.scale.setScalar(Math.max(.001, growth))
          if (object.name === 'island-falling-coconut' && growth < 1) object.visible = false
        })
      }
    }
    if (energyPreview) {
      const target = actors.get(energyPreview.playerId)
      const t = (now - energyPreview.started) / 1000
      if (!target || !target.g.visible || t >= 3) {
        energyEffect.visible = false
        energyPreview = null
      } else {
        energyEffect.visible = true
        energyEffect.position.copy(target.g.position)
        const fade = Math.min(1, t / .3, (3 - t) / .55)
        energyHex.material.opacity = fade * (reduce ? .3 : .25 + .08 * Math.sin(t * 3))
        energyText.position.y = reduce ? 2.3 : 1.8 + Math.min(1, t / 1.4) * .8
        energyText.material.opacity = fade
        energyBolts.forEach((bolt, i) => {
          const phase = reduce ? .5 : (t * .38 + i / energyBolts.length) % 1
          const eased = phase * phase * (3 - 2 * phase)
          const angle = i * Math.PI * 2 / energyBolts.length
          bolt.position.set(Math.cos(angle) * .85, .25 + eased * 1.8, Math.sin(angle) * .85)
          bolt.rotation.set(0, angle + Math.PI / 2, 0)
          const size = reduce ? .65 : .65 * Math.min(1, phase * 5, (1 - phase) * 5)
          bolt.scale.setScalar(size)
          bolt.material.opacity = fade * Math.min(1, phase * 5, (1 - phase) * 5)
        })
      }
    }
    if (lossPreview) {
      const target = actors.get(lossPreview.playerId)
      const t = (now - lossPreview.started) / 1000 - lossPreview.delay
      if (!target || !target.g.visible || t >= 1.8) {
        lossText.visible = false
        lossPreview = null
      } else if (t >= 0) {
        lossText.visible = true
        lossText.position.copy(target.g.position)
        lossText.position.y += reduce ? 2.2 : 1.8 + Math.min(1, t) * .7
        lossText.material.opacity = Math.min(1, t / .2, (1.8 - t) / .4)
      }
    }
    if (lifeguardPreview) {
      const target = actors.get(lifeguardPreview.playerId)
      const t = (now - lifeguardPreview.started) / 1000
      if (!target || !target.g.visible || t >= 4.2) {
        lifeguardEffect.visible = false
        lifeguardPreview = null
      } else {
        lifeguardEffect.visible = true
        lifeguardEffect.position.copy(target.g.position)
        const approach = reduce ? 1 : THREE.MathUtils.smoothstep(t, .1, 1.8)
        const offsetX = -2.2 * (1 - approach) - .4
        buoy.position.set(offsetX, sampleOceanHeight(target.g.position.x + offsetX, target.g.position.z, elapsed) - target.g.position.y + .16, .25)
        buoy.rotation.z = reduce ? 0 : .08 * Math.sin(t * 3)
        const buoyScale = t < 2.2 ? 1 : Math.max(0, 1 - (t - 2.2) / .5)
        buoy.scale.setScalar(reduce ? 1 : buoyScale)
        const textTime = t - (reduce ? .1 : 1.8)
        rescueText.position.y = reduce ? 2.2 : 1.8 + Math.max(0, Math.min(1, textTime)) * .7
        rescueText.material.opacity = textTime < 0 ? 0 : Math.min(1, textTime / .25, (4.2 - t) / .5)
      }
    }
    const activeActor = actors.get(turnMarkerPlayerId)
    turnMarker.visible = !!activeActor && activeActor.g.visible
    if (turnMarker.visible) {
      turnMarker.position.copy(activeActor.g.position)
      turnMarker.position.y += 2.1
    }
    for(const g of obstacles.values())g.userData.animate?.(elapsed, reduce)
    if (islandPreview && (now - islandPreview.started) < 3800) {
      const coconut = islandPreview.island.getObjectByName('island-falling-coconut')
      if (coconut) coconut.visible = false
    }
    animateCamera(now)
    controls.update();renderer.render(scene,camera);raf=requestAnimationFrame(frame)
  }
  const resize = createBoardViewportResize(container, camera, renderer)
  let observer
  if(typeof ResizeObserver!=='undefined'){observer=new ResizeObserver(resize);observer.observe(container)}else window.addEventListener('resize',resize)
  function contextLost(e){e.preventDefault();if(onError)onError('WebGL context lost. Switch back to 2D.')}
  renderer.domElement.addEventListener('webglcontextlost',contextLost)
  resize()
  controls.target.copy(defaultTarget)
  camera.position.setFromSpherical(defaultOffset()).add(controls.target)
  controls.update()
  raf = requestAnimationFrame(frame)
  loadRiggedBoardTemplates((character, template) => {
    if (disposed) {
      // The asynchronous asset must never resurrect a disposed 3D scene.
      template.traverse(node => {
        if (node.geometry) node.geometry.dispose()
        if (node.material) (Array.isArray(node.material) ? node.material : [node.material])
          .forEach(material => material.dispose())
      })
      return
    }
    riggedTemplates[character] = template
    actors.forEach(upgradeSurfer)
  }, (character, error) => {
    // Failure of one gender never prevents other surfers from rendering.
    if (!disposed) console.warn('Using procedural ' + character + ' surfer fallback:', error)
  }, undefined, { previewFemaleAthlete })

  function zoom(scale) {
    const offset = cameraTransition?.offset.clone() ?? cameraOffset()
    offset.radius = THREE.MathUtils.clamp(offset.radius * scale, controls.minDistance, controls.maxDistance)
    moveCamera(offset, cameraTransition?.target)
  }
  function focusCell(id) {
    if (!Number.isInteger(id) || !BOARD_LAYOUT[id]) return
    const cell = BOARD_LAYOUT[id]
    const offset = cameraTransition?.offset.clone() ?? cameraOffset()
    offset.radius = THREE.MathUtils.clamp(12, controls.minDistance, controls.maxDistance)
    moveCamera(offset, new THREE.Vector3(cell.x, 0, cell.z))
  }
  function orbit(azimuth, inclination) {
    const offset = cameraTransition?.offset.clone() ?? cameraOffset()
    offset.theta += azimuth
    offset.phi = THREE.MathUtils.clamp(
      offset.phi + inclination, controls.minPolarAngle, controls.maxPolarAngle
    )
    moveCamera(offset, cameraTransition?.target)
  }
  return {update,resetCamera,zoom,orbit,focusCell,playSunburn,playBigWave,playAmulet,playStone,playStorm,playCyclone,playIsland,playEnergy,playLifeguard,toggleIds(visible){cellLabels.visible=visible},dispose(){disposed=true;cancelAnimationFrame(raf);if(observer)observer.disconnect();else window.removeEventListener('resize',resize);renderer.domElement.removeEventListener('pointermove',move);renderer.domElement.removeEventListener('pointerdown',down);renderer.domElement.removeEventListener('pointerup',up);renderer.domElement.removeEventListener('pointercancel',cancel);renderer.domElement.removeEventListener('pointerleave',leave);renderer.domElement.removeEventListener('webglcontextlost',contextLost);controls.dispose();actors.forEach(actor => {if(actor.avatar){actor.avatar.dispose();actor.g.remove(actor.avatar.display)}});const geometries=new Set(),mats=new Set();const collect=o=>{if(o.isLight&&o.shadow)o.shadow.dispose();if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>mats.add(m))};scene.traverse(collect);Object.values(riggedTemplates).forEach(template => template.traverse(collect));geometries.forEach(g=>g.dispose());mats.forEach(m=>{if(m.map)m.map.dispose();m.dispose()});renderer.dispose();renderer.domElement.remove()}}
}
