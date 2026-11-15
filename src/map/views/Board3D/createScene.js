import layoutManifest from '../../layout/board-layout.json'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { BOARD_LAYOUT } from '../../layout/boardLayout'
import { createCoastalScenery } from './createCoastalScenery'
import { createScenePrimitives, palette } from './scenePrimitives'
import { createSurferModel } from './surfModels'
import { createObstacleModel } from './obstacleModels'
import { createHexDepth } from './hexDepth'

// This renderer receives public state and never validates moves or changes rules.
const R = layoutManifest.hexRadius
const colors = { sand:'#f4d49b', rock:'#a6aaa0', trunk:'#b5804f', green:'#4c9755', leaf:'#91be5e',
  cream:'#fff3cb', orange:'#ffbb41', coral:'#f27763', teal:'#38b4ae', blue:'#337a91',
  skin:'#c8824b', dark:'#294b46' }

export function createScene(container,onCellSelect,onError) {
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
    context.font = 'bold 46px sans-serif'
    context.fillStyle = '#fff'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(String(cell.id + 1), 64, 41)
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
  function positionRing(ring,id){const cell=Number.isInteger(id)?BOARD_LAYOUT[id]:null;ring.visible=!!cell;if(cell)ring.position.set(cell.x,.23,cell.z)}
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2()
  function pick(event){const box=renderer.domElement.getBoundingClientRect();if(!box.width||!box.height)return null;pointer.set((event.clientX-box.left)/box.width*2-1,-(event.clientY-box.top)/box.height*2+1);raycaster.setFromCamera(pointer,camera);return raycaster.intersectObjects(targets,false)[0]?.object.userData.cellId??null}
  let start = null
  const pressedPointers = new Set()
  function move(e) {
    if (start && e.pointerId === start.id && Math.hypot(e.clientX - start.x, e.clientY - start.y) >= 6) start = null
    const id = pick(e)
    positionRing(hovered, id)
    renderer.domElement.style.cursor = id === null ? 'grab' : 'pointer'
  }
  function down(e) {
    pressedPointers.add(e.pointerId)
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
  function leave(){positionRing(hovered,null)}
  renderer.domElement.addEventListener('pointermove',move)
  renderer.domElement.addEventListener('pointerdown',down)
  renderer.domElement.addEventListener('pointerup',up)
  renderer.domElement.addEventListener('pointercancel',cancel)
  renderer.domElement.addEventListener('pointerleave',leave)
  const playerColors=[colors.orange,colors.coral,colors.teal,colors.blue,'#e4c45a','#b17bb6','#83c16e']
  const actors=new Map(),obstacles=new Map()
  function createSurfer(id) {
    const index = Number(id)
    const model = createSurferModel(scene, modelHelpers, playerColors[index] || colors.orange,
      index % 2 ? palette.skin : palette.skinLight, index % 2 ? '#724c35' : '#e8b449', index % 2 === 1)
    return { g: model.group, animate: model.animate, id, cellId: null, from: null, to: null, t: 1 }
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
  function removeGroup(g){scene.remove(g);g.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.isSprite&&o.material){if(o.material.map)o.material.map.dispose();o.material.dispose()}})}
  function update(snapshot){positionRing(selected,snapshot.selectedCellId);hexDepth.select(snapshot.selectedCellId)
    maneuverRings.forEach((marker, index) => {
      positionRing(marker, snapshot.maneuverDestinations?.[index])
    })
    const live=new Set()
    for(const p of snapshot.players){live.add(p.id);let a=actors.get(p.id);if(!a){a=createSurfer(p.id);actors.set(p.id,a)}
      const cell=p.cellId===null?null:BOARD_LAYOUT[p.cellId];a.g.visible=!!cell;if(!cell){a.cellId=null;continue}
      const target=new THREE.Vector3(cell.x,.13,cell.z)
      if(a.cellId===null){a.g.position.copy(target);a.from=null;a.to=null}
      else if(a.cellId!==p.cellId){a.from=a.g.position.clone();a.to=target;a.t=0}
      a.cellId=p.cellId
    }
    for(const [id,a] of actors)if(!live.has(id)){removeGroup(a.g);actors.delete(id)}
    const keys=new Set()
    for(const c of snapshot.cells)if(c.obstacleType){const key=c.id+':'+c.obstacleType+':'+(c.remainingTurns??'');keys.add(key);if(!obstacles.has(key))obstacles.set(key,createObstacle(c))}
    for(const [key,g] of obstacles)if(!keys.has(key)){removeGroup(g);obstacles.delete(key)}
  }
  let elapsed=0,last=performance.now(),raf=0,disposed=false
  function frame(now){if(disposed)return;const dt=Math.min((now-last)/1000,.1);last=now;elapsed+=dt
    animateScenery(elapsed)
    for(const a of actors.values()){if(a.from&&a.to){a.t=Math.min(1,a.t+dt*2);const t=a.t*a.t*(3-2*a.t);a.g.position.lerpVectors(a.from,a.to,t);if(a.t===1){a.from=null;a.to=null}}a.g.position.y=.13+Math.sin(elapsed*1.6+Number(a.id))*.015;const bank=Math.sin(elapsed*1.2+Number(a.id))*.045;a.g.rotation.z=bank;a.animate(elapsed,Number(a.id),bank)}
    for(const g of obstacles.values())g.userData.animate?.(elapsed)
    animateCamera(now)
    controls.update();renderer.render(scene,camera);raf=requestAnimationFrame(frame)
  }
  function resize(){const width=Math.max(container.clientWidth,1),height=Math.max(container.clientHeight,1);camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height,false)}
  let observer
  if(typeof ResizeObserver!=='undefined'){observer=new ResizeObserver(resize);observer.observe(container)}else window.addEventListener('resize',resize)
  function contextLost(e){e.preventDefault();if(onError)onError('WebGL context lost. Switch back to 2D.')}
  renderer.domElement.addEventListener('webglcontextlost',contextLost)
  resize()
  controls.target.copy(defaultTarget)
  camera.position.setFromSpherical(defaultOffset()).add(controls.target)
  controls.update()
  raf = requestAnimationFrame(frame)

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
  return {update,resetCamera,zoom,orbit,focusCell,toggleIds(visible){cellLabels.visible=visible},dispose(){disposed=true;cancelAnimationFrame(raf);if(observer)observer.disconnect();else window.removeEventListener('resize',resize);renderer.domElement.removeEventListener('pointermove',move);renderer.domElement.removeEventListener('pointerdown',down);renderer.domElement.removeEventListener('pointerup',up);renderer.domElement.removeEventListener('pointercancel',cancel);renderer.domElement.removeEventListener('pointerleave',leave);renderer.domElement.removeEventListener('webglcontextlost',contextLost);controls.dispose();const geometries=new Set(),mats=new Set();scene.traverse(o=>{if(o.isLight&&o.shadow)o.shadow.dispose();if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>mats.add(m))});geometries.forEach(g=>g.dispose());mats.forEach(m=>{if(m.map)m.map.dispose();m.dispose()});renderer.dispose();renderer.domElement.remove()}}
}
