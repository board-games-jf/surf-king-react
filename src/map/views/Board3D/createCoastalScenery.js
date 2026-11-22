import * as THREE from 'three'
import { createScenePrimitives, palette } from './scenePrimitives'

// Scenery from the standalone Surf King preview. The game owns the playable cells.
export function createCoastalScenery(scene) {
  scene.add(new THREE.HemisphereLight('#e4fbff', '#ba9b62', 1.7));
  const sun = new THREE.DirectionalLight('#fff1cc', 2.5);
  sun.position.set(-12, 24, -10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -20, right: 20, top: 23, bottom: -23, near: 1, far: 65 });
  sun.shadow.normalBias = 0.05;
  sun.shadow.bias = -0.0001;
  sun.shadow.radius = 4;
  scene.add(sun);
  const fill = new THREE.DirectionalLight('#a9e7ef', 0.7);
  fill.position.set(14, 6, 14);
  scene.add(fill);

  const { mesh, sphere, box, rod } = createScenePrimitives(scene);
  let seed = 391;
  function random() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  }
  const shoreBaseZ = -9.85;
  const shoreCurve = .014;
  function shoreZ(x) {
    return shoreBaseZ - x * x * shoreCurve + Math.sin(x * .5) * .12;
  }
  const shoreline = Array.from({ length: 45 }, (_, i) => {
    const x = -11 + i * .5;
    return new THREE.Vector2(x, shoreZ(x));
  });
  const backEdge = [
    new THREE.Vector2(11, shoreZ(11)),
    new THREE.Vector2(12.7, -13.2),
    new THREE.Vector2(10, -16.2),
    new THREE.Vector2(4, -17.5),
    new THREE.Vector2(-3, -17.8),
    new THREE.Vector2(-9, -16.3),
    new THREE.Vector2(-12.5, -13.4),
    new THREE.Vector2(-11, shoreZ(-11))
  ];
  // Rotating the extrusion onto the water reverses its local Y coordinate.
  const beachShape = new THREE.Shape(
    [...shoreline, ...backEdge.slice(1, -1)].map(p => new THREE.Vector2(p.x, -p.y))
  );
  const beach = mesh(new THREE.ExtrudeGeometry(beachShape, { depth: .8, bevelEnabled: true, bevelSize: .18, bevelThickness: .18, bevelSegments: 2, steps: 1 }), palette.sand);
  beach.rotation.x = -Math.PI / 2;
  beach.position.y = -.47;
  const foundation = mesh(new THREE.ExtrudeGeometry(beachShape, { depth: 1.15, bevelEnabled: true, bevelSize: .25, bevelThickness: .2, bevelSegments: 1 }), palette.rock);
  foundation.rotation.x = -Math.PI / 2;
  foundation.position.y = -1.18;

  const slopeVertices = [], slopeIndices = [];
  shoreline.forEach((p, i) => {
    slopeVertices.push(p.x, .52, p.y - .65, p.x, -.12, p.y + .65);
    if (i < shoreline.length - 1) {
      const k = i * 2;
      slopeIndices.push(k, k + 2, k + 1, k + 1, k + 2, k + 3);
    }
  });
  const slopeGeometry = new THREE.BufferGeometry();
  slopeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(slopeVertices, 3));
  slopeGeometry.setIndex(slopeIndices);
  slopeGeometry.computeVertexNormals();
  mesh(slopeGeometry, palette.sand, scene, { side: THREE.DoubleSide });

  for (let i = 0; i < 42; i++) {
    const segment = i / 42 * (backEdge.length - 1);
    const index = Math.floor(segment);
    const p = backEdge[index].clone().lerp(backEdge[index + 1], segment - index);
    const stone = sphere(scene, i % 3 ? palette.stone : palette.rock, [p.x + (random() - .5) * .6, -.3 + random() * .18, p.y + (random() - .5) * .7], [.4 + random() * .45, .4 + random() * .35, .45 + random() * .45], 0);
    stone.rotation.set(random(), random() * 6, random());
  }
  for (let i = 0; i < 40; i++) {
    sphere(scene, palette.cream, [(random() - .5) * 17, .52, -12 - random() * 3.5], [.045, .025, .07], 0);
  }

  const oceanUniforms = {
    uTime: { value: 0 },
    uSun: { value: new THREE.Vector3(-0.4, 0.85, -0.35).normalize() },
    uShoreZ: { value: shoreBaseZ },
    uShoreCurve: { value: shoreCurve }
  };
  const ocean = new THREE.Mesh(new THREE.PlaneGeometry(180, 180, 220, 220), new THREE.ShaderMaterial({
    uniforms: oceanUniforms,
    vertexShader: `
      uniform float uTime;
      varying vec3 vWorld;
      varying float vWave;
      void main() {
        vec3 p = position;
        float a = p.x * .67 + uTime * .72;
        float b = p.y * .91 - uTime * .48;
        p.z += sin(a) * .043 + sin(b) * .036 + sin(p.x * 1.8 + p.y * 1.4 + uTime) * .016;
        vWave = p.z;
        vWorld = (modelMatrix * vec4(p, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uSun;
      uniform float uShoreZ;
      uniform float uShoreCurve;
      varying vec3 vWorld;
      varying float vWave;
      void main() {
        vec2 p = vWorld.xz;
        float shore = uShoreZ - p.x * p.x * uShoreCurve + sin(p.x * .5) * .12;
        float shoreDistance = p.y - shore;
        float shallows = (1.0 - smoothstep(0.0, 21.0, shoreDistance))
          * (1.0 - smoothstep(11.0, 18.0, abs(p.x)));
        vec3 color = mix(vec3(.012, .19, .25), vec3(.025, .40, .32), shallows);
        vec2 q = p * 2.0;
        q += vec2(sin(p.y * .65 + uTime * .34), cos(p.x * .62 - uTime * .28)) * .30;
        float caustic = pow(1.0 - abs(sin(q.x + sin(q.y)) * cos(q.y + sin(q.x))), 14.0);
        color += vec3(.035, .13, .085) * caustic * (.15 + shallows * .65);
        float waveLine = pow(.5 + .5 * sin(p.y * 5.0 + sin(p.x * 1.1) * 2.0 + uTime * 1.15), 30.0);
        color += vec3(.07, .15, .12) * waveLine * .32;
        float breaker = pow(.5 + .5 * sin(shoreDistance * 3.2 + uTime * 1.1), 16.0);
        breaker *= smoothstep(.25, .7, shoreDistance) * (1.0 - smoothstep(.8, 2.7, shoreDistance));
        color = mix(color, vec3(.65, .85, .73), breaker * shallows * .5);
        vec3 normal = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
        if (!gl_FrontFacing) normal = -normal;
        vec3 eye = normalize(cameraPosition - vWorld);
        float shine = pow(max(dot(reflect(-uSun, normal), eye), 0.0), 80.0);
        color += vec3(.8, .86, .65) * shine * .45;
        float farFog = smoothstep(68.0, 125.0, distance(cameraPosition, vWorld));
        color = mix(color, vec3(.43,.67,.65), farFog);
        gl_FragColor = vec4(color, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    side: THREE.DoubleSide
  }));
  ocean.rotation.x = -Math.PI / 2;
  ocean.position.y = -.015;
  scene.add(ocean);
  const foamMaterial = new THREE.MeshBasicMaterial({ color: '#f1fff1', transparent: true, opacity: .62, depthWrite: false });
  for (let i = 0; i < 75; i++) {
    const x = -11 + i / 74 * 22;
    const z = shoreZ(x) + .6 + random() * .13;
    const dot = new THREE.Mesh(new THREE.CircleGeometry(.08 + random() * .13, 7), foamMaterial);
    dot.rotation.x = -Math.PI / 2;
    dot.position.set(x, .075, z);
    dot.scale.y = .45 + random();
    scene.add(dot);
  }
  for (let i = 0; i < 14; i++) {
    const x = (random() - .5) * 6;
    const z = (random() - .5) * 16;
    const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(x - .35, .06, z), new THREE.Vector3(x, .08, z + .2), new THREE.Vector3(x + .35, .06, z));
    const crest = mesh(new THREE.TubeGeometry(curve, 15, .017, 4, false), '#deffed');
    crest.castShadow = false;
  }

  const palms = [];
  function palm(x, z, height = 3.6, angle = 0) {
    const group = new THREE.Group();
    group.position.set(x, .5, z);
    group.rotation.y = angle;
    scene.add(group);
    const lean = .5;
    for (let i = 0; i < 9; i++) {
      const t = i / 9, next = (i + 1) / 9;
      rod(group, i % 2 ? '#bd925b' : '#ad7e4f', [lean * t * t, height * t, 0], [lean * next * next, height * next, 0], .17 - t * .07, .16 - t * .07);
    }
    const crown = new THREE.Group();
    crown.position.set(lean, height, 0);
    group.add(crown);
    for (let i = 0; i < 9; i++) {
      const leaf = new THREE.Group();
      leaf.rotation.y = i * Math.PI * 2 / 9;
      crown.add(leaf);
      const points = [], indices = [];
      const length = 1.5 + random() * .55;
      for (let j = 0; j <= 10; j++) {
        const t = j / 10;
        const y = Math.sin(t * Math.PI) * .45 - t * t * .7;
        const w = Math.sin(Math.PI * Math.pow(t, .65)) * .25;
        points.push(-w, y, t * length, 0, y + .065, t * length, w, y, t * length);
        if (j < 10) {
          const k = j * 3;
          indices.push(k, k + 3, k + 1, k + 1, k + 3, k + 4, k + 1, k + 4, k + 2, k + 2, k + 4, k + 5);
        }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
      geo.setIndex(indices);
      geo.computeVertexNormals();
      mesh(geo, i % 3 === 0 ? palette.lightGreen : palette.green, leaf, { side: THREE.DoubleSide });
    }
    for (let i = 0; i < 3; i++) sphere(crown, '#8c6c3e', [Math.cos(i * 2) * .19, -.16, Math.sin(i * 2) * .19], [.16, .19, .16], 1);
    palms.push({ crown, phase: random() * 6 });
    return group;
  }
  palm(-8.7, -13.7, 4.1, .9);
  palm(8.8, -13.8, 3.5, -1);
  palm(-5.4, -15.4, 3.1, .3);
  palm(5.7, -15.5, 3.8, -1.1);
  palm(-9.6, -12, 3, 2);
  palm(.1, -16.3, 3.2, -2);

  function plant(x, z, scale = 1) {
    const group = new THREE.Group();
    group.position.set(x, .48, z);
    group.scale.setScalar(scale);
    scene.add(group);
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * Math.PI * 2;
      const leaf = sphere(group, i % 2 ? palette.darkGreen : palette.lightGreen, [Math.sin(a) * .25, .17, Math.cos(a) * .25], [.11, .45, .065], 1);
      leaf.rotation.set(Math.cos(a) * .8, a, Math.sin(a) * .8);
    }
    if (random() > .5) {
      for (let i = 0; i < 5; i++) sphere(group, palette.coral, [Math.sin(i * 1.26) * .13, .34, Math.cos(i * 1.26) * .13], [.105, .05, .08], 1);
      sphere(group, palette.orange, [0, .36, 0], [.065, .06, .065], 1);
    }
  }
  for (const [x,z,s] of [[-8.4,-13,1.5],[8.5,-13.1,1.5],[-5.5,-15,1.4],[5.8,-15.1,1.3],[-9.2,-12,1.4],[.1,-16,1.3],[-7,-15.5,1],[7.7,-14.4,1],[-3.6,-16,1.2],[3.8,-16,1.3],[-2.3,-14.5,1],[3.3,-14,1]]) plant(x,z,s);

  function umbrella(x, z, color = palette.coral) {
    const group = new THREE.Group();
    group.position.set(x, .47, z);
    scene.add(group);
    rod(group, palette.cream, [0,0,0], [0,2.3,0], .045);
    for (let i = 0; i < 10; i++) {
      const a = i * Math.PI / 5, b = (i + 1) * Math.PI / 5;
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute([0,2.45,0, Math.cos(a)*1.45,1.94,Math.sin(a)*1.45, Math.cos(b)*1.45,1.94,Math.sin(b)*1.45],3));
      geo.computeVertexNormals();
      mesh(geo, i % 2 ? palette.cream : color, group, { side: THREE.DoubleSide });
      rod(group, palette.cream, [Math.cos(a)*1.45,1.94,Math.sin(a)*1.45], [Math.cos(b)*1.45,1.94,Math.sin(b)*1.45], .025);
    }
    sphere(group, color, [0,2.46,0], [.09,.09,.09], 1);
  }
  function chair(x, z, angle, color) {
    const group = new THREE.Group();
    group.position.set(x,.55,z);
    group.rotation.y = angle;
    scene.add(group);
    for (const side of [-1,1]) {
      rod(group,palette.trunk,[side*.31,0,-.42],[side*.31,.5,.42],.045);
      rod(group,palette.trunk,[side*.31,0,.45],[side*.31,.65,-.33],.045);
      rod(group,palette.trunk,[side*.31,.38,-.15],[side*.31,1.06,-.62],.045);
    }
    const back = box(group, palette.cream,[0,.72,-.36],[.57,.055,.85]);
    back.rotation.x = .94;
    for (const x of [-.18,.18]) {
      const stripe = box(group,color,[x,.75,-.34],[.09,.061,.82]);
      stripe.rotation.x = .94;
    }
    box(group,palette.cream,[0,.43,.16],[.58,.05,.53]);
    for (const x of [-.18,.18]) box(group,color,[x,.465,.16],[.09,.015,.53]);
  }
  umbrella(-3.6,-12.7);
  chair(-4.35,-11.9,.12,palette.orange);
  chair(-2.85,-11.9,.12,palette.orange);
  umbrella(6.1,-13.2,palette.orange);
  chair(5.5,-12.3,-.3,palette.teal);
  const hut = new THREE.Group();
  hut.position.set(1.8,.5,-14);
  scene.add(hut);
  box(hut,'#be975a',[0,.65,0],[1.8,1.3,1.3]);
  for (let i = 0; i < 12; i++) box(hut,'#d8af68',[-.85+i*.15,.64,.675],[.025,1.27,.05]);
  box(hut,palette.dark,[0,.95,.70],[1.17,.48,.05]);
  box(hut,palette.trunk,[0,.61,.88],[1.85,.11,.42]);
  const roof = mesh(new THREE.ConeGeometry(1.65,.82,4), '#dcae60', hut);
  roof.position.y = 1.71;
  roof.rotation.y = Math.PI / 4;
  roof.scale.z = .85;
  for (let i=0;i<18;i++) rod(hut,'#eaca83',[-1.1+i*.13,1.34,.89],[-.55+i*.065,2.09,0],.022);
  rod(hut,palette.trunk,[.65,1.6,0],[.65,3.3,0],.035);
  const flag = box(hut,palette.teal,[1.06,3.02,0],[.8,.48,.035]);
  flag.rotation.y = -.1;
  for (let i=0;i<3;i++) {
    const tip = mesh(new THREE.ConeGeometry(.065,.15,3),palette.orange,hut);
    tip.position.set(.93+i*.13,3.08,.025);
  }

  function surfboard(parent, color, x, y, z, scale = 1) {
    const group = new THREE.Group();
    group.position.set(x,y,z);
    group.scale.setScalar(scale);
    parent.add(group);
    sphere(group,color,[0,0,0],[.32,.085,1.02],3);
    sphere(group,palette.cream,[0,.057,0],[.24,.034,.91],2);
    box(group,color,[0,.095,.02],[.11,.012,1.48]);
    const fin = mesh(new THREE.ConeGeometry(.12,.28,3),palette.dark,group);
    fin.position.set(0,-.16,.62);
    fin.rotation.x = Math.PI;
    return group;
  }
  const displayBoard = surfboard(scene,palette.teal,3.2,.95,-13.3,.83);
  displayBoard.rotation.x = -.18;
  displayBoard.rotation.z = -.15;
  displayBoard.rotation.x = Math.PI / 2 - .13;
  const lifeguard = new THREE.Group();
  lifeguard.position.set(-7.2,.45,-11.9);
  lifeguard.rotation.y = Math.PI / 2;
  scene.add(lifeguard);
  for(const x of [-.42,.42]) for(const z of [-.35,.35]) rod(lifeguard,palette.trunk,[x*1.4,0,z*1.35],[x,1.9,z],.055);
  box(lifeguard,palette.teal,[0,1.55,0],[1.12,.12,.95]);
  box(lifeguard,palette.teal,[0,1.92,-.4],[1.1,.72,.11]);
  for(const x of [-.48,.48]) {
    rod(lifeguard,palette.teal,[x,1.6,-.35],[x,1.6,.48],.055);
    rod(lifeguard,palette.trunk,[x,0,1.06],[x,1.5,.46],.04);
  }
  for(let i=0;i<5;i++) rod(lifeguard,palette.cream,[-.48,.2+i*.27,.98-i*.11],[.48,.2+i*.27,.98-i*.11],.035);
  const lifesaver=mesh(new THREE.TorusGeometry(.3,.08,9,32),palette.coral,lifeguard);
  lifesaver.position.set(.65,1.25,.1);
  lifesaver.rotation.y=Math.PI/2;

  const cooler = new THREE.Group();
  cooler.position.set(6.8,.5,-11.8);
  cooler.rotation.y=-.5;
  scene.add(cooler);
  box(cooler,palette.blue,[0,.28,0],[.95,.55,.65]);
  box(cooler,palette.cream,[0,.59,0],[1.02,.10,.70]);
  box(cooler,palette.cream,[0,.32,.34],[.24,.2,.035]);
  for(const x of [-.52,.52]) box(cooler,palette.cream,[x,.43,0],[.06,.09,.28]);
  for(const [x,color] of [[-.22,palette.orange],[.18,palette.coral]]) {
    rod(cooler,color,[x,.65,0],[x,.88,0],.08);
    rod(cooler,palette.cream,[x,.87,0],[x,.99,0],.035);
  }
  const ball = sphere(scene,palette.cream,[-5.4,.82,-11.6],[.36,.36,.36],3);
  const ballStripe = mesh(new THREE.TorusGeometry(.36,.018,6,40),palette.teal);
  ballStripe.position.copy(ball.position);
  ballStripe.rotation.x=.8;
  for (const [x,z] of [[-1.4,-10.6],[5.2,-11]]) {
    const star = new THREE.Shape();
    for(let i=0;i<10;i++) {
      const a=i*Math.PI/5;
      const r=i%2?.11:.27;
      if(i===0)star.moveTo(Math.sin(a)*r,Math.cos(a)*r);else star.lineTo(Math.sin(a)*r,Math.cos(a)*r);
    }
    const object=mesh(new THREE.ExtrudeGeometry(star,{depth:.04,bevelEnabled:false}),palette.orange);
    object.rotation.x=-Math.PI/2;
    object.position.set(x,.56,z);
  }

  function distantIsland(x,z,scale) {
    const group=new THREE.Group();
    group.position.set(x,-.6,z);
    group.scale.setScalar(scale);
    scene.add(group);
    sphere(group,'#a3b3a3',[0,.4,0],[3,1.1,2.1],0);
    sphere(group,palette.lightGreen,[0,1.05,0],[2.6,.45,1.8],1);
    const p=palm(0,0,2.5);
    scene.remove(p);
    p.position.set(.3,1.1,0);
    group.add(p);
  }
  distantIsland(-21,-28,1.8);
  distantIsland(26,-24,1.1);
  const boat = new THREE.Group();
  boat.position.set(17,.02,-4);
  boat.rotation.y=.6;
  scene.add(boat);
  sphere(boat,palette.cream,[0,.17,0],[.45,.16,1.2],2);
  rod(boat,palette.trunk,[0,.2,0],[0,2.3,0],.025);
  const sailGeo=new THREE.BufferGeometry();
  sailGeo.setAttribute('position',new THREE.Float32BufferAttribute([0,2.2,0,0,.45,0,0,.5,-1.02],3));
  sailGeo.computeVertexNormals();
  mesh(sailGeo,palette.coral,boat,{side:THREE.DoubleSide});
  return (elapsed) => {
    oceanUniforms.uTime.value = elapsed
    for (const { crown, phase } of palms) {
      crown.rotation.z = Math.sin(elapsed * .7 + phase) * .028
      crown.rotation.x = Math.cos(elapsed * .6 + phase) * .025
    }
  }
}
