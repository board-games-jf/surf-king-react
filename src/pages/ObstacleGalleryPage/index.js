import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './ObstacleGalleryPage.css'

const types = ['Shark', 'Stone', 'Island', 'Storm', 'Cyclone']

// This review page displays the same model factory used by the live game map.
// It never creates or modifies a game match.
export default function ObstacleGalleryPage() {
  const canvasHolder = useRef(null)
  const sceneRef = useRef(null)
  const selectedRef = useRef('Shark')
  const [selected, setSelected] = useState('Shark')
  const [error, setError] = useState(null)
  selectedRef.current = selected

  useEffect(() => {
    let cancelled = false
    let dispose = () => {}
    Promise.all([
      import('three'),
      import('three/examples/jsm/controls/OrbitControls.js'),
      import('../../map/views/Board3D/scenePrimitives'),
      import('../../map/views/Board3D/obstacleModels')
    ]).then(([THREE, { OrbitControls }, { createScenePrimitives }, { createObstacleModel }]) => {
      if (cancelled || !canvasHolder.current) return

      const scene = new THREE.Scene()
      scene.background = new THREE.Color('#e2f0ed')
      scene.add(new THREE.HemisphereLight('#f4ffff', '#aab6b2', 2.4))
      const sun = new THREE.DirectionalLight('#fff6d9', 2.3)
      sun.position.set(-3, 6, 5)
      scene.add(sun)

      const camera = new THREE.PerspectiveCamera(42, 1, .1, 40)
      camera.position.set(2.1, 1.8, 3.3)
      const renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.domElement.setAttribute('aria-label', 'Interactive 3D obstacle model')
      renderer.domElement.style.width = '100%'
      renderer.domElement.style.height = '100%'
      renderer.domElement.style.display = 'block'
      canvasHolder.current.appendChild(renderer.domElement)

      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.enablePan = false
      controls.target.set(0, .47, 0)
      controls.minDistance = 1.5
      controls.maxDistance = 7
      controls.update()

      const helpers = createScenePrimitives(scene)
      const models = new Map(types.map(type => {
        const model = createObstacleModel(type, helpers)
        scene.add(model.object)
        return [type, model]
      }))
      let currentType = selectedRef.current
      function show(type) {
        currentType = type
        models.forEach((model, key) => { model.object.visible = key === type })
      }
      show(currentType)
      sceneRef.current = { show }

      const resize = () => {
        if (!canvasHolder.current) return
        const width = Math.max(canvasHolder.current.clientWidth, 1)
        const height = Math.max(canvasHolder.current.clientHeight, 1)
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height, false)
      }
      resize()
      const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null
      if (observer) observer.observe(canvasHolder.current)
      else window.addEventListener('resize', resize)

      const clock = new THREE.Clock()
      let raf = 0
      function draw() {
        raf = requestAnimationFrame(draw)
        models.get(currentType).update(clock.getElapsedTime(), 0)
        controls.update()
        renderer.render(scene, camera)
      }
      draw()

      dispose = () => {
        cancelAnimationFrame(raf)
        if (observer) observer.disconnect()
        else window.removeEventListener('resize', resize)
        controls.dispose()
        const geometries = new Set()
        const materials = new Set()
        scene.traverse(node => {
          if (node.geometry) geometries.add(node.geometry)
          if (node.material) (Array.isArray(node.material) ? node.material : [node.material])
            .forEach(material => materials.add(material))
        })
        geometries.forEach(geometry => geometry.dispose())
        materials.forEach(material => material.dispose())
        renderer.dispose()
        renderer.domElement.remove()
        sceneRef.current = null
      }
    }).catch(cause => {
      if (!cancelled) setError('3D preview unavailable: ' + (cause?.message || 'Unknown error'))
    })
    return () => {
      cancelled = true
      dispose()
    }
  }, [])

  useEffect(() => {
    sceneRef.current?.show(selected)
  }, [selected])

  return (
    <main className="obstacle-gallery">
      <header className="obstacle-gallery-header">
        <Link to="/">← Home</Link>
        <h1>Surf King · 3D obstacles</h1>
        <p>Live Three.js models — select an obstacle, then drag to rotate or scroll to zoom.</p>
      </header>
      <nav className="obstacle-gallery-tabs" aria-label="Obstacle models">
        {types.map(type => (
          <button key={type} type="button" aria-pressed={selected === type}
            onClick={() => setSelected(type)}>{type}</button>
        ))}
      </nav>
      <div className="obstacle-gallery-viewport" ref={canvasHolder} />
      <p className="obstacle-gallery-label">{selected} · Real 3D geometry, not a generated image</p>
      {error && <p role="alert" className="obstacle-gallery-error">{error}</p>}
    </main>
  )
}
