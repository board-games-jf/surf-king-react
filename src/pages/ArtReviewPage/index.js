import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { inspectRiggedAsset, validateReviewFile } from './artReviewUtils'
import './ArtReviewPage.css'

const CANDIDATE = 'https://grab3d.com/models/characters/female-athlete/'
const REVIEW_SURFER = '/assets/surfers/female-athlete-rigged-review.glb'

const SURF_POSE_OFFSETS = {
  Hips: [.08, .08, 0],
  Spine: [.06, -.08, 0], Spine01: [.08, -.06, .04], Spine02: [.04, -.05, -.03],
  LeftUpLeg: [.62, .06, -.10], LeftLeg: [-.82, 0, .04], LeftFoot: [.12, 0, 0],
  RightUpLeg: [.44, -.08, .10], RightLeg: [-.60, 0, -.04], RightFoot: [.10, 0, 0],
}

function createReviewBoard(THREE) {
  const board = new THREE.Group()
  board.name = 'isolated-review-surfboard'
  const outline = new THREE.Shape()
  outline.moveTo(-1.16, 0)
  outline.bezierCurveTo(-1.02, -.22, -.62, -.31, 0, -.32)
  outline.bezierCurveTo(.65, -.31, 1.02, -.22, 1.18, 0)
  outline.bezierCurveTo(1.02, .22, .65, .31, 0, .32)
  outline.bezierCurveTo(-.62, .31, -1.02, .22, -1.16, 0)
  const hull = new THREE.Mesh(
    new THREE.ExtrudeGeometry(outline, { depth: .12, bevelEnabled: true, bevelThickness: .025, bevelSize: .02, bevelSegments: 3, curveSegments: 24 }),
    new THREE.MeshStandardMaterial({ color: '#19c8c2', roughness: .26, metalness: .08 })
  )
  hull.rotation.x = Math.PI / 2
  board.add(hull)
  const stripe = new THREE.Mesh(
    new THREE.PlaneGeometry(1.64, .055),
    new THREE.MeshStandardMaterial({ color: '#f7fffb', roughness: .58 })
  )
  stripe.rotation.x = -Math.PI / 2
  stripe.position.y = .008
  board.add(stripe)
  board.visible = false
  return board
}

// Free an imported asset's GPU resources when switching files or leaving the page.
function disposeImported(root) {
  if (!root) return
  const geometries = new Set()
  const materials = new Set()
  const textures = new Set()
  root.traverse(node => {
    if (node.geometry) geometries.add(node.geometry)
    const mats = Array.isArray(node.material) ? node.material : node.material ? [node.material] : []
    mats.forEach(material => {
      materials.add(material)
      Object.values(material).forEach(value => {
        if (value?.isTexture) textures.add(value)
      })
    })
  })
  textures.forEach(texture => texture.dispose())
  materials.forEach(material => material.dispose())
  geometries.forEach(geometry => geometry.dispose())
}

export default function ArtReviewPage() {
  const holder = useRef(null)
  const active = useRef(null)
  const [surferFile, setSurferFile] = useState(null)
  const [boardFile, setBoardFile] = useState(null)
  const [status, setStatus] = useState('A carregar a surfista de revisão...')
  const [report, setReport] = useState(null)
  const [clips, setClips] = useState([])
  const [selectedClip, setSelectedClip] = useState('')
  const [selectedPose, setSelectedPose] = useState('base')

  const changeFile = (event, setter) => {
    const file = event.target.files?.[0] || null
    // An empty input removes the corresponding model.
    if (!file) { setter(null); return }
    const error = validateReviewFile(file)
    if (error) {
      event.target.value = ''
      setStatus(error)
      return
    }
    setter(file)
  }

  useEffect(() => {
    let cancelled = false
    let dispose = () => {}
    active.current = null
    setReport(null)
    setClips([])
    setSelectedClip('')
    setSelectedPose('base')

    setStatus('A preparar a visualização 3D...')
    async function start() {
      const [THREE, { GLTFLoader }, { OrbitControls }] = await Promise.all([
        import('three'),
        import('three/examples/jsm/loaders/GLTFLoader.js'),
        import('three/examples/jsm/controls/OrbitControls.js')
      ])
      if (cancelled || !holder.current) return

      const scene = new THREE.Scene()
      scene.background = new THREE.Color('#ccecea')
      scene.add(new THREE.HemisphereLight('#f5fffc', '#4e9793', 2.4))
      const sunlight = new THREE.DirectionalLight('#fff1d9', 2.7)
      sunlight.position.set(-3, 7, 5)
      scene.add(sunlight)
      const rim = new THREE.DirectionalLight('#b5ecfa', 1.35)
      rim.position.set(4, 3, -5)
      scene.add(rim)

      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 20),
        new THREE.MeshStandardMaterial({ color: '#b3e2db', roughness: 1 })
      )
      ground.rotation.x = -Math.PI / 2
      ground.position.y = -.055
      scene.add(ground)
      const reviewBoard = createReviewBoard(THREE)
      scene.add(reviewBoard)

      const camera = new THREE.PerspectiveCamera(36, 1, .02, 200)
      const renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.03
      renderer.domElement.setAttribute('aria-label', 'Rotating imported GLB asset review')
      renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;touch-action:none'
      holder.current.appendChild(renderer.domElement)
      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.enablePan = false
      controls.minPolarAngle = .05
      controls.maxPolarAngle = Math.PI - .05
      controls.minDistance = .8
      controls.maxDistance = 22

      const resize = () => {
        if (!holder.current) return
        const width = Math.max(holder.current.clientWidth, 1)
        const height = Math.max(holder.current.clientHeight, 1)
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height, false)
      }
      resize()
      const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null
      if (observer) observer.observe(holder.current)
      else window.addEventListener('resize', resize)

      const loadedRoots = []
      let mixer = null
      let animationClips = []
      const restorePose = bindPose => {
        bindPose.forEach(({ bone, position, quaternion }) => {
          bone.position.copy(position)
          bone.quaternion.copy(quaternion)
        })
      }
      const playClip = (name, bindPose) => {
        if (!mixer) return
        restorePose(bindPose)
        mixer.stopAllAction()
        const clip = animationClips.find(item => item.name === name)
        if (clip) mixer.clipAction(clip).reset().play()
      }
      const clock = new THREE.Clock()
      let frameId = 0
      const render = () => {
        frameId = requestAnimationFrame(render)
        const delta = Math.min(clock.getDelta(), .1)
        if (mixer) mixer.update(delta)
        controls.update()
        renderer.render(scene, camera)
      }
      render()

      dispose = () => {
        cancelAnimationFrame(frameId)
        if (observer) observer.disconnect()
        else window.removeEventListener('resize', resize)
        controls.dispose()
        mixer?.stopAllAction()
        loadedRoots.forEach(root => {
          root.removeFromParent()
          disposeImported(root)
        })
        ground.geometry.dispose()
        ground.material.dispose()
        reviewBoard.traverse(node => {
          node.geometry?.dispose()
          node.material?.dispose()
        })
        renderer.dispose()
        renderer.domElement.remove()
        active.current = null
      }

      const loader = new GLTFLoader()
      const loadFile = async (file, fallbackUrl = null) => {
        const buffer = file
          ? await file.arrayBuffer()
          : await fetch(fallbackUrl).then(response => {
            if (!response.ok) throw new Error('Não foi possível carregar a surfista de revisão.')
            return response.arrayBuffer()
          })
        if (cancelled) return null
        return new Promise((resolve, reject) => {
          loader.parse(buffer, '', resolve, reject)
        })
      }

      let character = null
      {
        character = await loadFile(surferFile, REVIEW_SURFER)
        if (cancelled || !character) return
        const stats = inspectRiggedAsset(character)
        const root = character.scene
        const rootPosition = root.position.clone()
        const bindPose = new Map()
        const bones = new Map()
        root.traverse(node => {
          if (!node.isBone) return
          bindPose.set(node, {
            bone: node, position: node.position.clone(), quaternion: node.quaternion.clone()
          })
          bones.set(node.name, node)
        })
        const setPose = pose => {
          mixer?.stopAllAction()
          restorePose(bindPose)
          root.position.copy(rootPosition)
          reviewBoard.visible = pose === 'surf'
          if (pose !== 'surf') return
          Object.entries(SURF_POSE_OFFSETS).forEach(([name, offset]) => {
            const bone = bones.get(name)
            if (bone) bone.quaternion.multiply(new THREE.Quaternion().setFromEuler(
              new THREE.Euler(...offset)
            ))
          })
          const hips = bones.get('Hips')
          if (hips) hips.position.y -= .20
          root.updateMatrixWorld(true)
          if (hips) {
            const hipPoint = hips.getWorldPosition(new THREE.Vector3())
            const aimBone = (name, childName, target) => {
              const bone = bones.get(name)
              const child = bones.get(childName)
              if (!bone || !child) return
              const start = bone.getWorldPosition(new THREE.Vector3())
              const end = child.getWorldPosition(new THREE.Vector3())
              const worldDelta = new THREE.Quaternion().setFromUnitVectors(
                end.sub(start).normalize(), target.sub(start).normalize()
              )
              const parentWorld = bone.parent.getWorldQuaternion(new THREE.Quaternion())
              const localDelta = parentWorld.clone().invert().multiply(worldDelta).multiply(parentWorld)
              bone.quaternion.premultiply(localDelta)
              root.updateMatrixWorld(true)
            }
            aimBone('LeftArm', 'LeftForeArm', hipPoint.clone().add(new THREE.Vector3(-.52, .14, .16)))
            aimBone('LeftForeArm', 'LeftHand', hipPoint.clone().add(new THREE.Vector3(-.84, -.12, .10)))
            aimBone('RightArm', 'RightForeArm', hipPoint.clone().add(new THREE.Vector3(.52, .10, -.16)))
            aimBone('RightForeArm', 'RightHand', hipPoint.clone().add(new THREE.Vector3(.84, -.14, -.10)))
          }
          root.updateMatrixWorld(true)
          const feet = new THREE.Box3().setFromObject(root)
          root.position.y += .25 - feet.min.y
          reviewBoard.position.y = .25
        }
        const bounds = new THREE.Box3().setFromObject(root)
        if (bounds.isEmpty()) throw new Error('A surfista GLB está vazia.')
        root.position.set(
          -bounds.getCenter(new THREE.Vector3()).x,
          .12 - bounds.min.y,
          -bounds.getCenter(new THREE.Vector3()).z
        )
        scene.add(root)
        loadedRoots.push(root)
        mixer = new THREE.AnimationMixer(root)
        animationClips = character.animations || []
        active.current = {
          selectClip: name => playClip(name, bindPose),
          selectPose: setPose
        }
        setPose('base')
        setReport(stats)
        const available = stats.animations.filter(Boolean)
        setClips(available)
        setSelectedClip('')
      }

      if (boardFile) {
        const board = await loadFile(boardFile)
        if (cancelled || !board) return
        const root = board.scene
        const box = new THREE.Box3().setFromObject(root)
        if (box.isEmpty()) throw new Error('A prancha GLB está vazia.')
        const size = box.getSize(new THREE.Vector3())
        const boardLength = Math.max(size.x, size.z)
        if (!boardLength) throw new Error('A prancha não tem dimensões válidas.')
        root.scale.setScalar(1.85 / boardLength)
        const fittedBox = new THREE.Box3().setFromObject(root)
        const center = fittedBox.getCenter(new THREE.Vector3())
        root.position.set(-center.x, .04 - fittedBox.min.y, -center.z)
        scene.add(root)
        loadedRoots.push(root)
      }

      const subject = new THREE.Group()
      loadedRoots.forEach(root => subject.add(root))
      const fitted = new THREE.Box3().setFromObject(subject)
      const center = fitted.getCenter(new THREE.Vector3())
      const height = Math.max(fitted.getSize(new THREE.Vector3()).y, 1.4)
      const distance = Math.max(height * 2.5, 3.8)
      controls.target.set(0, center.y, 0)
      camera.position.set(distance * .58, center.y + distance * .28, distance * .85)
      controls.update()
      // Return models to the scene so disposal does not affect the temporary group.
      loadedRoots.forEach(root => scene.add(root))
      setStatus('GLB real carregado. Roda com o rato ou o dedo; aproxima com scroll/pinch.')
    }
    start().catch(error => {
      if (!cancelled) {
        dispose()
        setStatus('Erro a carregar GLB: ' + (error?.message || 'ficheiro incompatível'))
      }
    })

    return () => {
      cancelled = true
      dispose()
    }
  }, [surferFile, boardFile])

  return (
    <main className="art-review">
      <header className="art-review-header">
        <Link to="/customize">← Criador de surfistas</Link>
        <div>
          <h1>Laboratório de modelos 3D</h1>
          <p>Inspeção técnica isolada. Não modifica o surfista do jogo.</p>
        </div>
      </header>
      <div className="art-review-grid">
        <section className="art-review-controls" aria-label="Importar ficheiros GLB">
          <h2>Modelos para avaliar</h2>
          <p>A <a href={CANDIDATE} target="_blank" rel="noopener noreferrer">Female Athlete do Grab3D</a> rigged está carregada para a prova. Podes substituir por outro <strong>Rigged GLB</strong> abaixo.</p>
          <label htmlFor="art-review-surfer">Surfista GLB</label>
          <input id="art-review-surfer" type="file" accept=".glb,model/gltf-binary"
            onChange={event => changeFile(event, setSurferFile)} />
          <label htmlFor="art-review-board">Prancha GLB (opcional)</label>
          <input id="art-review-board" type="file" accept=".glb,model/gltf-binary"
            onChange={event => changeFile(event, setBoardFile)} />
          <p className="art-review-note">A surfista de revisão vem incluída neste laboratório. Ficheiros escolhidos manualmente ficam no navegador e não são enviados para servidores. A pose de surf é uma prova isolada, não uma integração no jogo.</p>
          {report && <div className="art-review-report">
            <h2>Inspeção do ficheiro</h2>
            <p><strong>{report.rigged ? 'Articulada' : 'Sem articulação detetada'}</strong> · {report.skinnedMeshes} malhas com rig · {report.bones} ossos · {report.triangles.toLocaleString()} triângulos</p>
            <label htmlFor="art-review-animation">Animação do GLB</label>
            <select id="art-review-animation" value={selectedClip}
              onChange={event => {
                const name = event.target.value
                setSelectedPose('base')
                setSelectedClip(name)
                active.current?.selectClip(name)
              }}>
              <option value="">Sem animação</option>
              {clips.map(clip => <option key={clip} value={clip}>{clip}</option>)}
            </select>
            <label htmlFor="art-review-pose">Pose estática</label>
            <select id="art-review-pose" value={selectedPose}
              onChange={event => {
                const pose = event.target.value
                setSelectedClip('')
                setSelectedPose(pose)
                active.current?.selectPose(pose)
              }}>
              <option value="base">Base</option>
              <option value="surf">Surf (prova)</option>
            </select>
            {!clips.length && <p>Este ficheiro não inclui animações exportadas.</p>}
          </div>}
        </section>
        <section className="art-review-stage" aria-label="Pré-visualização 3D real">
          <div className="art-review-canvas" ref={holder} />
          <div className="art-review-status" role="status">{status}</div>
        </section>
      </div>
      <footer className="art-review-footer">Prova da issue #33 · Sem substituição do modelo de produção · Sem aprovação de qualidade implícita</footer>
    </main>
  )
}
