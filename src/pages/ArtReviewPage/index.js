import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ATHLETE_SURFER_PATH, createAthleteSurferArt } from '../../map/views/Board3D/athleteSurferArt'
import './ArtReviewPage.css'

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
  const [status, setStatus] = useState('A carregar a surfista...')
  const [ready, setReady] = useState(false)
  const [selectedPose, setSelectedPose] = useState('surf')

  useEffect(() => {
    let cancelled = false
    let dispose = () => {}
    active.current = null
    setReady(false)
    setSelectedPose('surf')

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
      let art = null
      let frameId = 0
      const render = () => {
        frameId = requestAnimationFrame(render)
        controls.update()
        renderer.render(scene, camera)
      }
      render()

      dispose = () => {
        cancelAnimationFrame(frameId)
        if (observer) observer.disconnect()
        else window.removeEventListener('resize', resize)
        controls.dispose()
        loadedRoots.forEach(root => {
          root.removeFromParent()
          disposeImported(root)
        })
        ground.geometry.dispose()
        ground.material.dispose()
        art?.dispose()
        renderer.dispose()
        renderer.domElement.remove()
        active.current = null
      }

      const loader = new GLTFLoader()
      const character = await loader.loadAsync((process.env.PUBLIC_URL || '') + ATHLETE_SURFER_PATH)
      if (cancelled) { disposeImported(character.scene); return }
      const root = character.scene
      loadedRoots.push(root)
      art = createAthleteSurferArt(root)
      scene.add(art.display)
      active.current = { selectPose: pose => {
        try { art.setPose(pose); setStatus(''); return true }
        catch (error) { art.setPose('base'); setStatus(error.message); return false }
      } }
      setStatus('')
      setReady(true)
      const fitted = new THREE.Box3().setFromObject(art.display, true)
      const center = fitted.getCenter(new THREE.Vector3())
      const height = Math.max(fitted.getSize(new THREE.Vector3()).y, 1.4)
      const distance = Math.max(height * 2.5, 3.8)
      controls.target.set(0, center.y, 0)
      camera.position.set(distance * .58, center.y + distance * .28, distance * .85)
      controls.update()
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
  }, [])

  return (
    <main className="art-review">
      <header className="art-review-header">
        <Link to="/customize">← Criador de surfistas</Link>
        <div>
          <h1>Surfista 3D</h1>
          <p>Roda para veres a postura de todos os ângulos.</p>
        </div>
      </header>
      <div className="art-review-grid">
        <div className="art-review-controls" role="group" aria-label="Pose da surfista">
          {[['surf', 'Surf'], ['base', 'Base']].map(([pose, label]) => (
            <button key={pose} type="button" disabled={!ready} aria-pressed={selectedPose === pose}
              onClick={() => {
                if (active.current?.selectPose(pose)) setSelectedPose(pose)
                else setSelectedPose('base')
              }}>{label}</button>
          ))}
        </div>
        <section className="art-review-stage" aria-label="Pré-visualização 3D real">
          <div className="art-review-canvas" ref={holder} />
          {status && <div className="art-review-status" role="status">{status}</div>}
        </section>
      </div>
      <footer className="art-review-footer">Pré-visualização · Arrasta para rodar · Scroll ou pinça para aproximar</footer>
    </main>
  )
}
