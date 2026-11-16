import React, { useEffect, useRef, useState } from 'react'

// Isolated review of a licensed, rigged GLB base; the procedural game renderer is unchanged.
export default function RiggedBaseViewer() {
  const holder = useRef(null)
  const [error, setError] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    let dispose = () => {}
    Promise.all([
      import('three'),
      import('three/examples/jsm/loaders/GLTFLoader.js'),
      import('three/examples/jsm/controls/OrbitControls.js')
    ]).then(([THREE, { GLTFLoader }, { OrbitControls }]) => {
      if (cancelled || !holder.current) return
      const scene = new THREE.Scene()
      scene.add(new THREE.HemisphereLight('#fffaf0', '#67a7a5', 2.2))
      const sun = new THREE.DirectionalLight('#fff1d7', 2.1)
      sun.position.set(-3, 6, 4)
      scene.add(sun)
      const rim = new THREE.DirectionalLight('#c4efff', 1.05)
      rim.position.set(4, 2, -3)
      scene.add(rim)

      const camera = new THREE.PerspectiveCamera(37, 1, .05, 40)
      camera.position.set(2.7, 2.15, 3.4)
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.1
      renderer.domElement.setAttribute('aria-label', 'Rotatable rigged GLB character base')
      renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;touch-action:none'
      holder.current.appendChild(renderer.domElement)

      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.enablePan = false
      controls.target.set(0, .88, 0)
      controls.minDistance = 1.8
      controls.maxDistance = 7
      controls.maxPolarAngle = Math.PI * .75
      controls.update()

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
      function frame() {
        raf = requestAnimationFrame(frame)
        controls.update()
        renderer.render(scene, camera)
      }
      frame()

      const disposeModel = model => {
        model.traverse(node => {
          if (node.geometry) node.geometry.dispose()
          if (node.material) {
            const materials = Array.isArray(node.material) ? node.material : [node.material]
            materials.forEach(material => material.dispose())
          }
        })
      }
      const assetPath = (process.env.PUBLIC_URL || '') + '/assets/surfers/quaternius-male-base.glb'
      new GLTFLoader().load(assetPath, loaded => {
        if (cancelled) {
          disposeModel(loaded.scene)
          return
        }
        const model = loaded.scene
        let riggedMeshes = 0
        model.traverse(node => { if (node.isSkinnedMesh && node.skeleton?.bones.length) riggedMeshes++ })
        if (!riggedMeshes) {
          disposeModel(model)
          setError('O GLB não contém uma malha com esqueleto válido.')
          return
        }
        const bounds = new THREE.Box3().setFromObject(model)
        const size = bounds.getSize(new THREE.Vector3())
        if (bounds.isEmpty() || size.y <= 0 || !Number.isFinite(size.y)) {
          disposeModel(model)
          setError('O GLB não tem dimensões válidas.')
          return
        }
        const center = bounds.getCenter(new THREE.Vector3())
        const display = new THREE.Group()
        const scale = 1.8 / size.y
        display.scale.setScalar(scale)
        display.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale)
        display.add(model)
        scene.add(display)
        setReady(true)
      }, undefined, cause => {
        if (!cancelled) setError('Não foi possível carregar o modelo GLB: ' + (cause?.message || 'Erro de carregamento'))
      })

      dispose = () => {
        cancelAnimationFrame(raf)
        if (observer) observer.disconnect()
        else window.removeEventListener('resize', resize)
        controls.dispose()
        scene.traverse(node => {
          if (node.geometry) node.geometry.dispose()
          if (node.material) {
            const materials = Array.isArray(node.material) ? node.material : [node.material]
            materials.forEach(material => material.dispose())
          }
        })
        renderer.dispose()
        renderer.domElement.remove()
      }
    }).catch(cause => {
      if (!cancelled) setError('Pré-visualização GLB indisponível: ' + (cause?.message || 'Erro WebGL'))
    })
    return () => {
      cancelled = true
      dispose()
    }
  }, [])

  return (
    <div className="surfer-viewer" ref={holder} role="img"
      aria-label="Real imported rigged GLB character base; drag to rotate and scroll to zoom">
      {error && <div className="surfer-viewer-error" role="alert">{error}</div>}
      {!error && !ready && <div className="surfer-viewer-error" role="status">A carregar o modelo GLB local...</div>}
      <span className="surfer-viewer-hint" aria-hidden="true">↻ Rodar · Scroll para zoom · Modelo-base sem roupa de surf</span>
    </div>
  )
}
