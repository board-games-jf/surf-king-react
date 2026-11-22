import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { inspectRiggedAsset, reviewStanceFrame, reviewKneeTarget, reviewSurfDirections } from './artReviewUtils'
import './ArtReviewPage.css'

const REVIEW_SURFER = '/assets/surfers/female-athlete-rigged-review.glb'

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
      const restorePose = bindPose => {
        bindPose.forEach(({ bone, position, quaternion }) => {
          bone.position.copy(position)
          bone.quaternion.copy(quaternion)
        })
      }
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
        reviewBoard.traverse(node => {
          node.geometry?.dispose()
          node.material?.dispose()
        })
        renderer.dispose()
        renderer.domElement.remove()
        active.current = null
      }

      const loader = new GLTFLoader()
      const character = await loader.loadAsync(REVIEW_SURFER)
      if (cancelled) { disposeImported(character.scene); return }
      const root = character.scene
      loadedRoots.push(root)
      if (!inspectRiggedAsset(character).rigged) throw new Error('O modelo não tem esqueleto.')

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
        restorePose(bindPose)
        root.position.copy(rootPosition)
        reviewBoard.visible = pose === 'surf'
        setStatus('')
        if (pose !== 'surf') { root.updateMatrixWorld(true); return true }
        root.updateMatrixWorld(true)
        const sides = ['Left', 'Right']
        const required = ['Hips', ...sides.flatMap(side =>
          ['UpLeg', 'Leg', 'Foot', 'Arm', 'ForeArm', 'Hand'].map(joint => side + joint))]
        if (!required.every(name => bones.has(name))) {
          reviewBoard.visible = false
          setStatus('Esta pose requer o esqueleto compatível da surfista de revisão.')
          return false
        }

        const point = name => bones.get(name).getWorldPosition(new THREE.Vector3())
        const toes = sides.map(side => {
          const toe = [...bones.keys()].find(name => name.startsWith(side) && /toe/i.test(name))
          return toe ? point(toe).sub(point(side + 'Foot')).setY(0) : null
        })
        const frame = reviewStanceFrame(THREE, point('LeftUpLeg'), point('RightUpLeg'), toes.filter(Boolean))
        if (!frame) { reviewBoard.visible = false; setStatus('Não foi possível orientar a pose.'); return false }
        const { lateral, forward, up } = frame
        const rotateWorld = (bone, worldDelta) => {
          const parentWorld = bone.parent.getWorldQuaternion(new THREE.Quaternion())
          const localDelta = parentWorld.clone().invert().multiply(worldDelta).multiply(parentWorld)
          bone.quaternion.premultiply(localDelta)
          root.updateMatrixWorld(true)
        }
        const turn = (bone, from, to) => {
          if (bone) rotateWorld(bone, new THREE.Quaternion().setFromUnitVectors(from, to))
        }
        const aimBone = (name, childName, target) => {
          const bone = bones.get(name)
          const start = point(name)
          const end = point(childName)
          const direction = target.clone().sub(start)
          if (direction.lengthSq() < 1e-8 || end.distanceToSquared(start) < 1e-8) return
          const worldDelta = new THREE.Quaternion().setFromUnitVectors(
            end.sub(start).normalize(), direction.normalize()
          )
          rotateWorld(bone, worldDelta)
        }

        const legs = sides.map(side => {
          const hip = point(side + 'UpLeg')
          const knee = point(side + 'Leg')
          const ankle = point(side + 'Foot')
          return { side, hip, ankle, upper: hip.distanceTo(knee), lower: knee.distanceTo(ankle),
            footRotation: bones.get(side + 'Foot').getWorldQuaternion(new THREE.Quaternion()) }
        })
        const legLength = Math.min(...legs.map(leg => leg.upper + leg.lower))
        if (legLength < 1e-6) { reviewBoard.visible = false; setStatus('Comprimento das pernas inválido.'); return false }
        const ankleCenter = legs[0].ankle.clone().add(legs[1].ankle).multiplyScalar(.5)
        const hips = bones.get('Hips')
        const lowerHips = point('Hips').addScaledVector(up, -legLength * .29)
          .addScaledVector(lateral, legLength * .055).addScaledVector(forward, -legLength * .04)
        hips.position.copy(hips.parent.worldToLocal(lowerHips))
        root.updateMatrixWorld(true)

        // Left foot leads; both ankles are on the board's long axis.
        const targets = legs.map((leg, i) => {
          const sign = i === 0 ? 1 : -1
          const ankle = ankleCenter.clone().addScaledVector(lateral, sign * legLength * .36)
          const knee = reviewKneeTarget(point(leg.side + 'UpLeg'), ankle,
            leg.upper, leg.lower, reviewSurfDirections(frame, i === 0).toe)
          return { ...leg, ankle, knee }
        })
        if (targets.some(leg => !leg.knee)) {
          restorePose(bindPose)
          root.updateMatrixWorld(true)
          reviewBoard.visible = false
          setStatus('Não foi possível ajustar os pés deste esqueleto à pose de surf.')
          return false
        }
        targets.forEach(({ side, ankle, knee, footRotation }, i) => {
          aimBone(side + 'UpLeg', side + 'Leg', knee)
          aimBone(side + 'Leg', side + 'Foot', ankle)
          const foot = bones.get(side + 'Foot')
          // Rotate the original flat shoe around the vertical axis only.
          const originalToe = toes[i]?.lengthSq() > 1e-8 ? toes[i].clone().normalize() : forward
          const toe = reviewSurfDirections(frame, i === 0).toe
          const yaw = new THREE.Quaternion().setFromUnitVectors(originalToe, toe)
          const desired = yaw.multiply(footRotation)
          foot.quaternion.copy(foot.parent.getWorldQuaternion(new THREE.Quaternion())
            .invert().multiply(desired))
          root.updateMatrixWorld(true)
        })

        // Open the chest toward the nose, then turn the head farther in that direction.
        const chestForward = forward.clone().addScaledVector(lateral, .34).normalize()
        const gaze = forward.clone().addScaledVector(lateral, 1.05).normalize()
        turn(bones.get('Spine') || bones.get('Spine01'), forward, chestForward)
        turn(bones.get('Head') || bones.get('Neck'), chestForward, gaze)

        // Keep hands on their own sides while the lead elbow bends more deeply.
        sides.forEach((side, i) => {
          const shoulder = point(side + 'Arm')
          const upper = shoulder.distanceTo(point(side + 'ForeArm'))
          const lower = point(side + 'ForeArm').distanceTo(point(side + 'Hand'))
          const { upperArm, forearm: handDirection } = reviewSurfDirections(frame, i === 0)
          aimBone(side + 'Arm', side + 'ForeArm', shoulder.addScaledVector(upperArm, upper))
          aimBone(side + 'ForeArm', side + 'Hand',
            point(side + 'ForeArm').addScaledVector(handDirection, lower))
        })
        root.updateMatrixWorld(true)
        // Fit the board to the feet, not to a hard-coded world X/Z orientation.
        reviewBoard.rotation.y = Math.atan2(-lateral.z, lateral.x)
        reviewBoard.position.set(ankleCenter.x, .12, ankleCenter.z)
        const feet = new THREE.Box3().setFromObject(root, true)
        root.position.y += .12 - feet.min.y
        root.updateMatrixWorld(true)
        return true
      }
      const bounds = new THREE.Box3().setFromObject(root)
      if (bounds.isEmpty()) throw new Error('A surfista GLB está vazia.')
      root.position.set(
        -bounds.getCenter(new THREE.Vector3()).x,
        .12 - bounds.min.y,
        -bounds.getCenter(new THREE.Vector3()).z
      )
      rootPosition.copy(root.position)
      scene.add(root)
      active.current = { selectPose: setPose }
      if (!setPose('surf')) setSelectedPose('base')
      setReady(true)

      const fitted = new THREE.Box3().setFromObject(root, true)
      fitted.union(new THREE.Box3().setFromObject(reviewBoard, true))
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
