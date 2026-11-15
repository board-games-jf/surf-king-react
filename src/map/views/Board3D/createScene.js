import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { BOARD_LAYOUT } from '../../layout/boardLayout'
import { createCoastalScenery } from './createCoastalScenery'
import { createScenePrimitives, palette } from './scenePrimitives'
import { createSurferModel } from './surfModels'
import sharkModel from './sharkModel'
import { createHexDepth } from './hexDepth'

// This renderer receives public state and never validates moves or changes rules.
const R = 0.765
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
  Object.assign(controls,{enableDamping:true,enablePan:true,enableRotate:false,zoomToCursor:true,minDistance:9,maxDistance:105})
  controls.mouseButtons.LEFT = THREE.MOUSE.PAN
  controls.touches.ONE = THREE.TOUCH.PAN
  controls.touches.TWO = THREE.TOUCH.DOLLY_PAN
  const resetCamera = () => {
    controls.target.set(0, 0, -2)
    camera.position.set(10, 26, 34).multiplyScalar(Math.min(2.4, Math.max(1, .85 / camera.aspect))).add(controls.target)
    controls.update()
  }
  resetCamera()
  const animateScenery = createCoastalScenery(scene)
  const materials=new Map()
  function mat(color,opts={}){const key=color+JSON.stringify(opts);if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness:.76,...opts}));return materials.get(key)}
  function mesh(geo,color,parent=scene,opts={}){const m=new THREE.Mesh(geo,mat(color,opts));m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
  function ball(parent,color,pos,size){const m=mesh(new THREE.IcosahedronGeometry(1,2),color,parent);m.position.set(...pos);m.scale.set(...size);return m}
  const modelHelpers = createScenePrimitives(scene)
  const wakeMaterial = new THREE.MeshBasicMaterial({ color: '#d1fff4', transparent: true, opacity: .48, depthWrite: false })
  const hex=new THREE.Shape(),outline=[]
  for(let i=0;i<=6;i++){const a=Math.PI/6+i*Math.PI/3,x=Math.cos(a)*R,z=Math.sin(a)*R;if(!i)hex.moveTo(x,z);else hex.lineTo(x,z);outline.push(new THREE.Vector3(x,0,z))}
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
  function positionRing(ring,id){const cell=Number.isInteger(id)?BOARD_LAYOUT[id]:null;ring.visible=!!cell;if(cell)ring.position.set(cell.x,.23,cell.z)}
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2()
  function pick(event){const box=renderer.domElement.getBoundingClientRect();if(!box.width||!box.height)return null;pointer.set((event.clientX-box.left)/box.width*2-1,-(event.clientY-box.top)/box.height*2+1);raycaster.setFromCamera(pointer,camera);return raycaster.intersectObjects(targets,false)[0]?.object.userData.cellId??null}
  let start=null
  function move(e){const id=pick(e);positionRing(hovered,id);renderer.domElement.style.cursor=id===null?'grab':'pointer'}
  function down(e){start={x:e.clientX,y:e.clientY}}
  function up(e){if(start&&Math.hypot(e.clientX-start.x,e.clientY-start.y)<6){const id=pick(e);if(id!==null)onCellSelect(id)}start=null}
  function leave(){positionRing(hovered,null)}
  renderer.domElement.addEventListener('pointermove',move)
  renderer.domElement.addEventListener('pointerdown',down)
  renderer.domElement.addEventListener('pointerup',up)
  renderer.domElement.addEventListener('pointerleave',leave)
  const playerColors=[colors.orange,colors.coral,colors.teal,colors.blue,'#e4c45a','#b17bb6','#83c16e']
  const actors=new Map(),obstacles=new Map()
  function createSurfer(id) {
    const index = Number(id)
    const model = createSurferModel(scene, modelHelpers, playerColors[index] || colors.orange,
      index % 2 ? palette.skin : palette.skinLight, index % 2 ? '#724c35' : '#e8b449', index % 2 === 1)
    return { g: model.group, animate: model.animate, id, cellId: null, from: null, to: null, t: 1 }
  }
  function createObstacle(cell){const g=new THREE.Group();scene.add(g);const position=BOARD_LAYOUT[cell.id];g.position.set(position.x,.1,position.z)
    switch(cell.obstacleType){
      case 'Shark': {
        const shark = sharkModel.create({
          settings: sharkModel.defaults,
          helpers: { mesh, ripple(parent, radius) {
            const wake = new THREE.Mesh(new THREE.RingGeometry(radius, radius + .03, 40), wakeMaterial)
            wake.rotation.x = -Math.PI / 2
            parent.add(wake)
            return wake
          } }
        })
        g.add(shark.object)
        g.userData.animate = (elapsed) => shark.update(elapsed, cell.id)
        break
      }
      case 'Stone':ball(g,colors.rock,[0,.23,0],[.46,.35,.45]);break
      case 'Island':ball(g,colors.sand,[0,.15,0],[.48,.30,.45]);ball(g,colors.green,[0,.34,0],[.36,.13,.35]);break
      case 'Storm':case 'Cyclone':{const m=mesh(new THREE.TorusGeometry(.28,.085,7,32),cell.obstacleType==='Storm'?'#708ba2':'#c8f4f5',g);m.rotation.x=Math.PI/2;m.position.y=.35;for(const x of [-.2,0,.2])ball(g,'#e0eaf0',[x,.55,0],[.23,.15,.21]);break}
      default:ball(g,colors.orange,[0,.25,0],[.3,.37,.30])
    }
    if(cell.remainingTurns !== null && Number.isFinite(cell.remainingTurns)) {
      const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128
      const context=canvas.getContext('2d')
      context.fillStyle='#173c45';context.fillRect(19,16,90,90)
      context.font='bold 74px sans-serif';context.textAlign='center';context.fillStyle='#fff'
      context.fillText(String(cell.remainingTurns),64,90)
      const texture=new THREE.CanvasTexture(canvas)
      const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false}))
      sprite.position.set(0,.9,0);sprite.scale.set(.48,.48,1);g.add(sprite)
    }
    return g
  }
  function removeGroup(g){scene.remove(g);g.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.isSprite&&o.material){if(o.material.map)o.material.map.dispose();o.material.dispose()}})}
  function update(snapshot){positionRing(selected,snapshot.selectedCellId);hexDepth.select(snapshot.selectedCellId)
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
    controls.update();renderer.render(scene,camera);raf=requestAnimationFrame(frame)
  }
  function resize(){const width=Math.max(container.clientWidth,1),height=Math.max(container.clientHeight,1);camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height,false)}
  let observer
  if(typeof ResizeObserver!=='undefined'){observer=new ResizeObserver(resize);observer.observe(container)}else window.addEventListener('resize',resize)
  function contextLost(e){e.preventDefault();if(onError)onError('WebGL context lost. Switch back to 2D.')}
  renderer.domElement.addEventListener('webglcontextlost',contextLost)
  resize();resetCamera();raf=requestAnimationFrame(frame)
  function zoom(scale) {
    const offset = camera.position.clone().sub(controls.target)
    offset.setLength(THREE.MathUtils.clamp(offset.length() * scale, controls.minDistance, controls.maxDistance))
    camera.position.copy(controls.target).add(offset)
    controls.update()
  }
  return {update,resetCamera,zoom,toggleIds(visible){cellLabels.visible=visible},dispose(){disposed=true;cancelAnimationFrame(raf);if(observer)observer.disconnect();else window.removeEventListener('resize',resize);renderer.domElement.removeEventListener('pointermove',move);renderer.domElement.removeEventListener('pointerdown',down);renderer.domElement.removeEventListener('pointerup',up);renderer.domElement.removeEventListener('pointerleave',leave);renderer.domElement.removeEventListener('webglcontextlost',contextLost);controls.dispose();const geometries=new Set(),mats=new Set();scene.traverse(o=>{if(o.isLight&&o.shadow)o.shadow.dispose();if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>mats.add(m))});geometries.forEach(g=>g.dispose());mats.forEach(m=>{if(m.map)m.map.dispose();m.dispose()});wakeMaterial.dispose();renderer.dispose();renderer.domElement.remove()}}
}
