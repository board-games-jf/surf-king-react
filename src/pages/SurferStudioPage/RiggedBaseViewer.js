import React, { useEffect, useRef, useState } from 'react'
import { normalizeSurferStyle } from '../../map/views/Board3D/surferStyle'

// Uses the real local, rigged Quaternius GLB. Neither this component nor its
// experimental artwork is used in a live match.
export default function RiggedBaseViewer({ style, styled = false, pose = 'relaxed' }) {
  const holder = useRef(null)
  const live = useRef(null)
  const latest = useRef({ style, styled, pose })
  const [error, setError] = useState(null)
  const [ready, setReady] = useState(false)
  latest.current = { style, styled, pose }

  useEffect(() => {
    let cancelled = false
    let dispose = () => {}
    Promise.all([
      import('three'),
      import('three/examples/jsm/loaders/GLTFLoader.js'),
      import('three/examples/jsm/controls/OrbitControls.js'),
      import('../../map/views/Board3D/riggedSurferArt')
    ]).then(([THREE, { GLTFLoader }, { OrbitControls }, { decorateRiggedSurfer }]) => {
      if (cancelled || !holder.current) return
      const scene = new THREE.Scene()
      scene.add(new THREE.HemisphereLight('#fffdf2', '#4f9d9b', 2.1))
      const sun = new THREE.DirectionalLight('#fff0d0', 2.3)
      sun.position.set(-3.5, 6, 4.5)
      scene.add(sun)
      const rim = new THREE.DirectionalLight('#a8e5f3', 1.15)
      rim.position.set(4, 3, -3)
      scene.add(rim)

      const camera = new THREE.PerspectiveCamera(35, 1, .05, 40)
      camera.position.set(2.35, 1.75, 3.55)
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.08
      renderer.domElement.setAttribute('aria-label', 'Real rigged 3D surfer and surfboard; drag to rotate')
      renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;touch-action:none'
      holder.current.appendChild(renderer.domElement)

      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.enablePan = false
      controls.target.set(.16, .91, 0)
      controls.minDistance = 2.15
      controls.maxDistance = 7
      controls.maxPolarAngle = Math.PI * .76
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

      let loadedScene = null
      let currentGroup = null
      let currentArt = null
      let fingerprint = ''
      const updateLook = (options, renderStyled, selectedPose) => {
        if (!loadedScene) return
        const next = JSON.stringify({ renderStyled, pose: renderStyled ? selectedPose : null, style: renderStyled ? normalizeSurferStyle(options) : null })
        if (next === fingerprint) return
        fingerprint = next
        if (currentArt) {
          currentArt.dispose()
          currentArt = null
        }
        if (currentGroup) scene.remove(currentGroup)
        loadedScene.removeFromParent()

        currentGroup = new THREE.Group()
        if (renderStyled) {
          currentArt = decorateRiggedSurfer(loadedScene, options, { pose: selectedPose })
          currentGroup.add(currentArt.display)
        } else {
          currentGroup.add(loadedScene)
        }
        // The imported base is 1.81m tall; accessories stay in the same units.
        currentGroup.name = renderStyled ? 'styled-surfer-review' : 'rigged-base-review'
        scene.add(currentGroup)
      }
      // Parent uses a gender key to remount when anatomy changes; a stale
      // in-flight loader is ignored by the existing cancellation guard.
      const gender = style.character === 'female' ? 'female' : 'male'
      const assetPath = (process.env.PUBLIC_URL || '') +
        '/assets/surfers/quaternius-' + gender + '-base.glb'
      new GLTFLoader().load(assetPath, loaded => {
        if (cancelled) {
          loaded.scene.traverse(node => {
            if (node.geometry) node.geometry.dispose()
            if (node.material) {
              const mats = Array.isArray(node.material) ? node.material : [node.material]
              mats.forEach(material => material.dispose())
            }
          })
          return
        }
        let hasSkin = false
        loaded.scene.traverse(node => {
          if (node.isSkinnedMesh && node.skeleton?.bones.length) hasSkin = true
        })
        const bounds = new THREE.Box3().setFromObject(loaded.scene)
        if (!hasSkin || bounds.isEmpty() || !Number.isFinite(bounds.max.y)) {
          setError('O GLB não tem malha articulada e dimensões válidas.')
          return
        }
        loadedScene = loaded.scene
        updateLook(latest.current.style, latest.current.styled, latest.current.pose)
        live.current = { updateLook }
        setReady(true)
      }, undefined, cause => {
        if (!cancelled) setError('Não foi possível carregar o modelo GLB: ' + (cause?.message || 'Erro de carregamento'))
      })

      let raf = 0
      const clock = new THREE.Clock()
      const reduceMotion = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      function frame() {
        raf = requestAnimationFrame(frame)
        if (currentArt) currentArt.animate(clock.getElapsedTime(), reduceMotion)
        controls.update()
        renderer.render(scene, camera)
      }
      frame()

      dispose = () => {
        cancelAnimationFrame(raf)
        if (observer) observer.disconnect()
        else window.removeEventListener('resize', resize)
        controls.dispose()
        if (currentArt) currentArt.dispose()
        if (loadedScene) {
          loadedScene.traverse(node => {
            if (node.geometry) node.geometry.dispose()
            if (node.material) {
              const mats = Array.isArray(node.material) ? node.material : [node.material]
              mats.forEach(material => material.dispose())
            }
          })
        }
        live.current = null
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

  useEffect(() => { live.current?.updateLook(style, styled, pose) }, [style, styled, pose])

  return (
    <div className="surfer-viewer" ref={holder} role="img"
      aria-label="Imported 3D surfer model; drag to rotate and scroll to zoom">
      {error && <div className="surfer-viewer-error" role="alert">{error}</div>}
      {!error && !ready && <div className="surfer-viewer-error" role="status">A carregar o surfista 3D...</div>}
      <span className="surfer-viewer-hint" aria-hidden="true">
        ↻ Rodar · Scroll para zoom · {styled ? 'Visual Surf King · ' + pose : 'Base GLB original'}
      </span>
    </div>
  )
}
