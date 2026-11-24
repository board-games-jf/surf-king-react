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
  const sun = new THREE.Mesh(new THREE.SphereGeometry(.34, 20, 12), new THREE.MeshBasicMaterial({ color: 0xffb829, transparent: true, depthWrite: false }))
  sun.position.y = 3.4
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(.18, .85, 2.7, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0xffc83d, transparent: true, opacity: .25, depthWrite: false, side: THREE.DoubleSide }))
  beam.position.y = 1.85
  const flare = new THREE.Mesh(new THREE.RingGeometry(.55, .8, 32), new THREE.MeshBasicMaterial({ color: 0xff9832, transparent: true, opacity: .7, depthWrite: false, side: THREE.DoubleSide }))
  flare.rotation.x = -Math.PI / 2
  flare.position.y = .18
  sunburn.add(sun, beam, flare)
  sunburn.visible = false
  scene.add(sunburn)
  let sunburnPreview = null
  function playSunburn(playerId) {
    const actor = actors.get(String(playerId))
    if (!actor || !actor.g.visible) return
    sunburnPreview = { playerId: String(playerId), started: performance.now() }
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
    const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }))
    label.position.set(cell.x, .35, cell.z)
    label.scale.set(.9, .56, 1)
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
    group.userData.animate = elapsed => model.update(elapsed, cell.id)

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
      if (!target || !target.g.visible || t >= 2.2) {
        sunburn.visible = false
        sunburnPreview = null
      } else {
        sunburn.visible = true
        sunburn.position.copy(target.g.position)
        const fade = Math.min(1, t / .25, (2.2 - t) / .45)
        sun.material.opacity = fade
        beam.material.opacity = .3 * fade
        flare.material.opacity = .75 * fade
        flare.scale.setScalar(reduce ? 1 : 1 + .25 * Math.sin(t * 8))
        sun.scale.setScalar(reduce ? 1 : 1 + .12 * Math.sin(t * 9))
      }
    }
    const activeActor = actors.get(turnMarkerPlayerId)
    turnMarker.visible = !!activeActor && activeActor.g.visible
    if (turnMarker.visible) {
      turnMarker.position.copy(activeActor.g.position)
      turnMarker.position.y += 2.1
    }
    for(const g of obstacles.values())g.userData.animate?.(elapsed)
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
  return {update,resetCamera,zoom,orbit,focusCell,playSunburn,toggleIds(visible){cellLabels.visible=visible},dispose(){disposed=true;cancelAnimationFrame(raf);if(observer)observer.disconnect();else window.removeEventListener('resize',resize);renderer.domElement.removeEventListener('pointermove',move);renderer.domElement.removeEventListener('pointerdown',down);renderer.domElement.removeEventListener('pointerup',up);renderer.domElement.removeEventListener('pointercancel',cancel);renderer.domElement.removeEventListener('pointerleave',leave);renderer.domElement.removeEventListener('webglcontextlost',contextLost);controls.dispose();actors.forEach(actor => {if(actor.avatar){actor.avatar.dispose();actor.g.remove(actor.avatar.display)}});const geometries=new Set(),mats=new Set();const collect=o=>{if(o.isLight&&o.shadow)o.shadow.dispose();if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>mats.add(m))};scene.traverse(collect);Object.values(riggedTemplates).forEach(template => template.traverse(collect));geometries.forEach(g=>g.dispose());mats.forEach(m=>{if(m.map)m.map.dispose();m.dispose()});renderer.dispose();renderer.domElement.remove()}}
}
