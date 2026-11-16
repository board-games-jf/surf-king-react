import React, { useEffect, useRef, useState } from 'react'

// The exact same mesh factory is used by the live Three.js map.
// This preview is not a rendered PNG, and does not create a game match.
export default function SurferViewer({ style, phase = 0 }) {
  const holder = useRef(null)
  const live = useRef(null)
  const latestStyle = useRef(style)
  const [error, setError] = useState(null)
  latestStyle.current = style

  useEffect(() => {
    let cancelled = false
    let dispose = () => {}
    Promise.all([
      import('three'),
      import('three/examples/jsm/controls/OrbitControls.js'),
      import('../../map/views/Board3D/scenePrimitives'),
      import('../../map/views/Board3D/surfModels')
    ]).then(([THREE, { OrbitControls }, { createScenePrimitives }, { createSurferModel }]) => {
      if (cancelled || !holder.current) return
      const scene = new THREE.Scene()
      const hemisphere = new THREE.HemisphereLight('#fffdf1', '#5b9c9b', 2.3)
      scene.add(hemisphere)
      const sun = new THREE.DirectionalLight('#ffe5ad', 2.2)
      sun.position.set(-3, 6, 4)
      scene.add(sun)
      const rim = new THREE.DirectionalLight('#b4f3ff', .85)
      rim.position.set(2, 3, -3)
      scene.add(rim)

      const camera = new THREE.PerspectiveCamera(38, 1, .1, 30)
      camera.position.set(2.1, 1.9, -3.15)
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.12
      renderer.domElement.setAttribute('aria-label', 'Rotatable 3D surfer and surfboard preview')
      renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;touch-action:none'
      holder.current.appendChild(renderer.domElement)

      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.enablePan = false
      controls.target.set(0, .60, 0)
      controls.minDistance = 1.7
      controls.maxDistance = 7
      controls.maxPolarAngle = Math.PI * .72
      controls.update()

      const helpers = createScenePrimitives(scene)
      const priorMaterials = new Set()
      let current = null
      let currentStyle = ''
      let currentModel = null
      const makeModel = options => {
        const fingerprint = JSON.stringify(options)
        if (fingerprint === currentStyle) return
        currentStyle = fingerprint
        if (currentModel) {
          scene.remove(currentModel.group)
          currentModel.group.traverse(node => {
            if (node.geometry) node.geometry.dispose()
            if (node.material) (Array.isArray(node.material) ? node.material : [node.material])
              .forEach(material => priorMaterials.add(material))
          })
        }
        currentModel = createSurferModel(scene, helpers, '#ffbb41', '#e5a875', '#724c35', true, options)
        currentModel.group.scale.setScalar(1.06)
        currentModel.group.rotation.y = -.22
        currentModel.group.position.y = .08
        current = currentModel
      }
      makeModel(latestStyle.current)
      live.current = { setStyle: makeModel }

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

      let raf = 0
      const clock = new THREE.Clock()
      const reducedMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      function draw() {
        raf = requestAnimationFrame(draw)
        if (current) current.animate(reducedMotion ? 0 : clock.getElapsedTime(), phase,
          reducedMotion ? 0 : Math.sin(clock.getElapsedTime() * 1.3) * .035)
        controls.update()
        renderer.render(scene, camera)
      }
      draw()
      dispose = () => {
        cancelAnimationFrame(raf)
        if (observer) observer.disconnect()
        else window.removeEventListener('resize', resize)
        controls.dispose()
        const geometrySet = new Set(), materialSet = new Set()
        scene.traverse(node => {
          if (node.geometry) geometrySet.add(node.geometry)
          if (node.material) (Array.isArray(node.material) ? node.material : [node.material])
            .forEach(material => materialSet.add(material))
        })
        geometrySet.forEach(geometry => geometry.dispose())
        priorMaterials.forEach(material => materialSet.add(material))
        materialSet.forEach(material => material.dispose())
        renderer.dispose()
        renderer.domElement.remove()
        live.current = null
      }
    }).catch(cause => {
      if (!cancelled) setError('3D preview unavailable: ' + (cause?.message || 'Unknown error'))
    })
    return () => {
      cancelled = true
      dispose()
    }
  }, [phase])

  useEffect(() => { live.current?.setStyle(style) }, [style])

  return (
    <div className="surfer-viewer" ref={holder} role="img"
      aria-label="Interactive 3D surfer model; drag to rotate and scroll to zoom">
      {error && <div className="surfer-viewer-error" role="alert">{error}</div>}
      <span className="surfer-viewer-hint" aria-hidden="true">↻ Drag to rotate · Scroll to zoom</span>
    </div>
  )
}
