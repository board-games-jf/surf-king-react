import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { BOARD_LAYOUT } from '../../layout/boardLayout'

// Scene design inspired by the user's standalone Three.js tropical preview.
// This renderer receives public state and never validates moves or changes rules.
const R = 0.765
const colors = { sand:'#f4d49b', rock:'#a6aaa0', trunk:'#b5804f', green:'#4c9755', leaf:'#91be5e',
  cream:'#fff3cb', orange:'#ffbb41', coral:'#f27763', teal:'#38b4ae', blue:'#337a91',
  skin:'#c8824b', dark:'#294b46' }

export function createScene(container,onCellSelect,onError) {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#b9e2e1')
  scene.fog = new THREE.Fog('#b9e2e1',45,110)
  const camera = new THREE.PerspectiveCamera(37,1,.1,160)
  const renderer = new THREE.WebGLRenderer({antialias:true})
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.12
  renderer.shadowMap.enabled = true
  renderer.domElement.setAttribute('aria-label','Interactive Surf King 3D board')
  container.appendChild(renderer.domElement)
  const controls = new OrbitControls(camera,renderer.domElement)
  Object.assign(controls,{enableDamping:true,enablePan:true,minDistance:9,maxDistance:65,minPolarAngle:.08,maxPolarAngle:Math.PI*.47})
  const resetCamera=()=>{camera.position.set(11,23,24);controls.target.set(0,0,-.5);controls.update()}
  resetCamera()
  scene.add(new THREE.HemisphereLight('#e4fbff','#c4ac76',2))
  const sun = new THREE.DirectionalLight('#fff1cc',2.35)
  sun.position.set(-11,24,-13);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024)
  Object.assign(sun.shadow.camera,{left:-17,right:17,top:18,bottom:-18})
  scene.add(sun)
  const materials=new Map()
  function mat(color,opts={}){const key=color+JSON.stringify(opts);if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness:.76,...opts}));return materials.get(key)}
  function mesh(geo,color,parent=scene,opts={}){const m=new THREE.Mesh(geo,mat(color,opts));m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
  function ball(parent,color,pos,size){const m=mesh(new THREE.IcosahedronGeometry(1,2),color,parent);m.position.set(...pos);m.scale.set(...size);return m}
  function rod(parent,color,start,end,r=.06){const a=new THREE.Vector3(...start),b=new THREE.Vector3(...end);const m=mesh(new THREE.CylinderGeometry(r,r,a.distanceTo(b),8),color,parent);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.sub(a).normalize());return m}
  const time={value:0}
  const ocean=new THREE.Mesh(new THREE.PlaneGeometry(130,130,100,100),new THREE.ShaderMaterial({
    uniforms:{time},
    vertexShader:[
      'uniform float time; varying vec3 wp;',
      'void main(){vec3 p=position;',
      'p.z+=sin(p.x*.7+time*.65)*.043+sin(p.y*.9-time*.48)*.036;',
      'wp=(modelMatrix*vec4(p,1.)).xyz;',
      'gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}'
    ].join('\n'),
    fragmentShader:[
      'uniform float time; varying vec3 wp;',
      'void main(){vec2 p=wp.xz;',
      'float shallow=1.-smoothstep(-9.,9.,p.y);',
      'float c=pow(1.-abs(sin(p.x*2.6+sin(p.y*2.+time*.3))*cos(p.y*2.1+sin(p.x*1.7))),14.);',
      'float w=pow(.5+.5*sin(p.y*5.+sin(p.x)*2.+time*1.3),28.);',
      'vec3 water=mix(vec3(.012,.21,.31),vec3(.025,.45,.38),shallow);',
      'water+=vec3(.05,.16,.11)*c+vec3(.07,.13,.10)*w;',
      'gl_FragColor=vec4(water,1.);',
      '#include <tonemapping_fragment>',
      '#include <colorspace_fragment>',
      '}'
    ].join('\n'),side:THREE.DoubleSide
  }))
  ocean.rotation.x=-Math.PI/2;ocean.position.y=-.09;scene.add(ocean)
  // Decorative shore stays beyond the winning row; it is not a game cell.
  const sand=new THREE.Shape()
  sand.moveTo(-11,10.2);sand.bezierCurveTo(-5,9.7,5,9.7,11,10.2)
  sand.lineTo(11,15.4);sand.lineTo(6,17);sand.lineTo(-6,17);sand.lineTo(-11,15.4);sand.closePath()
  const beach=mesh(new THREE.ExtrudeGeometry(sand,{depth:.8,bevelEnabled:true,bevelSize:.2,bevelThickness:.16,bevelSegments:2}),colors.sand)
  beach.rotation.x=-Math.PI/2;beach.position.y=-.5
  const palms=[]
  function palm(x,z,h){const g=new THREE.Group();g.position.set(x,.35,z);scene.add(g)
    for(let i=0;i<8;i++){const t=i/8,u=(i+1)/8;rod(g,colors.trunk,[.45*t*t,h*t,0],[.45*u*u,h*u,0],.16-t*.06)}
    const crown=new THREE.Group();crown.position.set(.45,h,0);g.add(crown)
    for(let i=0;i<9;i++){const a=i*2*Math.PI/9;const leaf=ball(crown,i%3?colors.green:colors.leaf,[Math.cos(a)*.88,-.12,Math.sin(a)*.88],[.16,.08,1.3]);leaf.rotation.y=Math.PI/2-a;leaf.rotation.x=.16}
    for(let i=0;i<3;i++)ball(crown,'#936b37',[Math.cos(i*2)*.17,-.17,Math.sin(i*2)*.17],[.15,.17,.15])
    palms.push({crown,phase:x*.8})
  }
  palm(-7.5,-14.2,3.7);palm(7.6,-14.4,3.6);palm(-4,-16,2.8);palm(4.1,-16,3.1)
  const umbrella=new THREE.Group();umbrella.position.set(-2,0,-12.8);scene.add(umbrella)
  rod(umbrella,colors.cream,[0,0,0],[0,2.4,0],.055)
  for(let i=0;i<10;i++){const a=i*Math.PI/5,b=(i+1)*Math.PI/5;const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([0,2.5,0,Math.cos(a)*1.4,2,Math.sin(a)*1.4,Math.cos(b)*1.4,2,Math.sin(b)*1.4],3));geo.computeVertexNormals();mesh(geo,i%2?colors.cream:colors.coral,umbrella,{side:THREE.DoubleSide})}
  for(const x of [-3.1,-1.25]){const g=new THREE.Group();g.position.set(x,.4,-14.8);scene.add(g);mesh(new THREE.BoxGeometry(.67,.08,.75),colors.cream,g).position.y=.45;const back=mesh(new THREE.BoxGeometry(.67,.06,.85),colors.orange,g);back.position.set(0,.8,-.33);back.rotation.x=.95;for(const side of [-.28,.28])rod(g,colors.trunk,[side,0,.3],[side,.9,-.5],.042)}
  const hut=new THREE.Group();hut.position.set(3.0,.1,-14.7);scene.add(hut)
  mesh(new THREE.BoxGeometry(1.8,1.4,1.4),'#d3ac6d',hut).position.y=.75
  const roof=mesh(new THREE.ConeGeometry(1.65,.85,4),'#deb574',hut);roof.rotation.y=Math.PI/4;roof.position.y=1.88
  mesh(new THREE.BoxGeometry(.9,.5,.05),colors.dark,hut).position.set(0,1.15,.73)
  const tower=new THREE.Group();tower.position.set(-9.3,.15,-11.4);scene.add(tower)
  for(const x of [-.4,.4])for(const z of [-.4,.4])rod(tower,colors.trunk,[x,0,z],[x*.85,2,z],.05)
  mesh(new THREE.BoxGeometry(1.3,.12,1.1),colors.teal,tower).position.y=1.55
  mesh(new THREE.BoxGeometry(1.2,.72,.12),colors.teal,tower).position.set(0,1.95,-.45)
  mesh(new THREE.BoxGeometry(1,.7,.65),colors.blue).position.set(8,.34,-11.8)
  mesh(new THREE.BoxGeometry(1.1,.13,.75),colors.cream).position.set(8,.75,-11.8)
  const hex=new THREE.Shape(),outline=[]
  for(let i=0;i<=6;i++){const a=Math.PI/6+i*Math.PI/3,x=Math.cos(a)*R,z=Math.sin(a)*R;if(!i)hex.moveTo(x,z);else hex.lineTo(x,z);outline.push(new THREE.Vector3(x,0,z))}
  const shapeGeo=new THREE.ShapeGeometry(hex)
  const hitMat=new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide})
  const outlineGeo=new THREE.BufferGeometry().setFromPoints(outline)
  const lines=new THREE.LineBasicMaterial({color:'#b9ffec',transparent:true,opacity:.77})
  const targets=[]
  for(const cell of BOARD_LAYOUT){const hit=new THREE.Mesh(shapeGeo,hitMat);hit.position.set(cell.x,.12,cell.z);hit.rotation.x=-Math.PI/2;hit.userData.cellId=cell.id;scene.add(hit);targets.push(hit);const edge=new THREE.LineLoop(outlineGeo,lines);edge.position.set(cell.x,.13,cell.z);scene.add(edge)}
  const cellLabels=new THREE.Group();cellLabels.visible=false;scene.add(cellLabels)
  for(const cell of BOARD_LAYOUT){const canvas=document.createElement('canvas');canvas.width=128;canvas.height=70;const context=canvas.getContext('2d');context.fillStyle='rgba(12,49,57,.8)';context.fillRect(18,7,92,56);context.font='bold 43px sans-serif';context.fillStyle='#fff';context.textAlign='center';context.fillText(String(cell.id),64,51);const texture=new THREE.CanvasTexture(canvas);const label=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false}));label.position.set(cell.x,.34,cell.z);label.scale.set(.43,.25,1);cellLabels.add(label)}
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
  function createSurfer(id){const g=new THREE.Group();g.scale.setScalar(.68);scene.add(g);const color=playerColors[Number(id)%playerColors.length]||colors.orange
    ball(g,color,[0,.08,0],[.33,.075,.88]);ball(g,colors.cream,[0,.15,0],[.23,.025,.75]);ball(g,color,[0,.76,0],[.22,.34,.18]);ball(g,colors.skin,[0,1.20,0],[.23,.25,.22]);ball(g,Number(id)%2?'#6f4b32':'#b77d39',[0,1.39,0],[.23,.12,.24]);rod(g,colors.skin,[-.2,.97,0],[-.42,.65,.15],.07);rod(g,colors.skin,[.2,.97,0],[.38,.62,-.16],.07);rod(g,colors.skin,[-.14,.54,0],[-.22,.19,.28],.09);rod(g,colors.skin,[.14,.54,0],[.24,.19,-.24],.09)
    return {g,id,cellId:null,from:null,to:null,t:1}
  }
  function createObstacle(cell){const g=new THREE.Group();scene.add(g);const position=BOARD_LAYOUT[cell.id];g.position.set(position.x,.1,position.z)
    switch(cell.obstacleType){
      case 'Shark':{const fin=new THREE.Shape();fin.moveTo(-.35,0);fin.lineTo(.10,.65);fin.lineTo(.35,0);fin.closePath();mesh(new THREE.ExtrudeGeometry(fin,{depth:.12,bevelEnabled:true,bevelThickness:.02}),'#899ea1',g).rotation.y=Math.PI/2;break}
      case 'Stone':ball(g,colors.rock,[0,.23,0],[.46,.35,.45]);break
      case 'Island':ball(g,colors.sand,[0,.15,0],[.48,.30,.45]);ball(g,colors.green,[0,.34,0],[.36,.13,.35]);break
      case 'Storm':case 'Cyclone':{const m=mesh(new THREE.TorusGeometry(.28,.085,7,32),cell.obstacleType==='Storm'?'#708ba2':'#c8f4f5',g);m.rotation.x=Math.PI/2;m.position.y=.35;for(const x of [-.2,0,.2])ball(g,'#e0eaf0',[x,.55,0],[.23,.15,.21]);break}
      default:ball(g,colors.orange,[0,.25,0],[.3,.37,.30])
    }
    return g
  }
  function removeGroup(g){scene.remove(g);g.traverse(o=>{if(o.geometry)o.geometry.dispose()})}
  function update(snapshot){positionRing(selected,snapshot.selectedCellId)
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
    for(const c of snapshot.cells)if(c.obstacleType){const key=c.id+':'+c.obstacleType;keys.add(key);if(!obstacles.has(key))obstacles.set(key,createObstacle(c))}
    for(const [key,g] of obstacles)if(!keys.has(key)){removeGroup(g);obstacles.delete(key)}
  }
  let elapsed=0,last=performance.now(),raf=0,disposed=false
  function frame(now){if(disposed)return;const dt=Math.min((now-last)/1000,.1);last=now;elapsed+=dt;time.value=elapsed
    for(const p of palms)p.crown.rotation.z=Math.sin(elapsed*.8+p.phase)*.028
    for(const a of actors.values()){if(a.from&&a.to){a.t=Math.min(1,a.t+dt*2);const t=a.t*a.t*(3-2*a.t);a.g.position.lerpVectors(a.from,a.to,t);if(a.t===1){a.from=null;a.to=null}}a.g.position.y=.13+Math.sin(elapsed*1.6+Number(a.id))*.015;a.g.rotation.z=Math.sin(elapsed*1.2+Number(a.id))*.02}
    for(const [key,g] of obstacles)if(key.endsWith(':Shark'))g.rotation.z=Math.sin(elapsed*.7+g.position.x)*.06
    controls.update();renderer.render(scene,camera);raf=requestAnimationFrame(frame)
  }
  function resize(){const width=Math.max(container.clientWidth,1),height=Math.max(container.clientHeight,1);camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height,false)}
  let observer
  if(typeof ResizeObserver!=='undefined'){observer=new ResizeObserver(resize);observer.observe(container)}else window.addEventListener('resize',resize)
  function contextLost(e){e.preventDefault();if(onError)onError('WebGL context lost. Switch back to 2D.')}
  renderer.domElement.addEventListener('webglcontextlost',contextLost)
  resize();raf=requestAnimationFrame(frame)
  return {update,resetCamera,toggleIds(visible){cellLabels.visible=visible},dispose(){disposed=true;cancelAnimationFrame(raf);if(observer)observer.disconnect();else window.removeEventListener('resize',resize);renderer.domElement.removeEventListener('pointermove',move);renderer.domElement.removeEventListener('pointerdown',down);renderer.domElement.removeEventListener('pointerup',up);renderer.domElement.removeEventListener('pointerleave',leave);renderer.domElement.removeEventListener('webglcontextlost',contextLost);controls.dispose();const geometries=new Set(),mats=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>mats.add(m))});geometries.forEach(g=>g.dispose());mats.forEach(m=>{if(m.map)m.map.dispose();m.dispose()});renderer.dispose();renderer.domElement.remove()}}
}
