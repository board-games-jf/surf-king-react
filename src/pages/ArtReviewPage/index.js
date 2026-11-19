import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { inspectRiggedAsset, validateReviewFile } from './artReviewUtils'
import './ArtReviewPage.css'

const CANDIDATE = 'https://grab3d.com/models/characters/female-athlete/'

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
  const [status, setStatus] = useState('Seleciona uma surfista GLB para começar.')
  const [report, setReport] = useState(null)
  const [clips, setClips] = useState([])
  const [selectedClip, setSelectedClip] = useState('')

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

    if (!surferFile && !boardFile) {
      setStatus('Seleciona uma surfista GLB para começar.')
      return () => { cancelled = true }
    }

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
      const playClip = name => {
        if (!mixer) return
        mixer.stopAllAction()
        const clip = animationClips.find(item => item.name === name)
        if (clip) mixer.clipAction(clip).reset().play()
      }
      active.current = { playClip }
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
        renderer.dispose()
        renderer.domElement.remove()
        active.current = null
      }

      const loader = new GLTFLoader()
      const loadFile = async file => {
        const buffer = await file.arrayBuffer()
        if (cancelled) return null
        return new Promise((resolve, reject) => {
          loader.parse(buffer, '', resolve, reject)
        })
      }

      let character = null
      if (surferFile) {
        character = await loadFile(surferFile)
        if (cancelled || !character) return
        const stats = inspectRiggedAsset(character)
        const root = character.scene
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

  useEffect(() => { active.current?.playClip(selectedClip) }, [selectedClip])

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
          <p>A candidata é a <a href={CANDIDATE} target="_blank" rel="noopener noreferrer">Female Athlete do Grab3D</a>. Descarrega a versão <strong>Rigged GLB</strong> e seleciona-a abaixo.</p>
          <label htmlFor="art-review-surfer">Surfista GLB</label>
          <input id="art-review-surfer" type="file" accept=".glb,model/gltf-binary"
            onChange={event => changeFile(event, setSurferFile)} />
          <label htmlFor="art-review-board">Prancha GLB (opcional)</label>
          <input id="art-review-board" type="file" accept=".glb,model/gltf-binary"
            onChange={event => changeFile(event, setBoardFile)} />
          <p className="art-review-note">Os ficheiros ficam no navegador. Não são enviados para servidores. A pose da candidata ainda é de atleta, não de surf.</p>
          {report && <div className="art-review-report">
            <h2>Inspeção do ficheiro</h2>
            <p><strong>{report.rigged ? 'Articulada' : 'Sem articulação detetada'}</strong> · {report.skinnedMeshes} malhas com rig · {report.bones} ossos · {report.triangles.toLocaleString()} triângulos</p>
            <label htmlFor="art-review-animation">Animação do GLB</label>
            <select id="art-review-animation" value={selectedClip}
              onChange={event => setSelectedClip(event.target.value)}>
              <option value="">Sem animação</option>
              {clips.map(clip => <option key={clip} value={clip}>{clip}</option>)}
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
