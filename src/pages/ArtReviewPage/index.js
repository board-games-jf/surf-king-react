import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ATHLETE_SURFER_PATH, ATHLETE_POSES, createAthleteSurferArt } from '../../map/views/Board3D/athleteSurferArt'
import { BOARD_TYPES, BOARD_COLORS, normalizeSurferStyle } from '../../map/views/Board3D/surferStyle'
import './ArtReviewPage.css'

export const ATHLETE_SAVE_KEY = 'surf-king-surfer-preview-v1'
const POSE_LABELS = { standing: 'Em pé', relaxed: 'Relaxada', surf: 'A surfar' }

// Exact source candidate inspected in GitHub Actions run 44971791188.
// It is a local preview only, not an approved production or saved player asset.
export const MALE_REVIEW_BYTES = 11354468
export const MALE_REVIEW_SHA256 = '3038f56e1225d0ef9692189ed19ff688f1424e669281148a4cc6995fed568496'
export function validateMaleReviewIdentity(bytes, sha256) {
  if (bytes !== MALE_REVIEW_BYTES || sha256 !== MALE_REVIEW_SHA256) {
    throw new Error('Seleciona a versão Rigged GLB masculina verificada.')
  }
}

async function readMaleReviewFile(file) {
  if (file.size !== MALE_REVIEW_BYTES) validateMaleReviewIdentity(file.size, '')
  const data = await file.arrayBuffer()
  if (!window.crypto?.subtle) throw new Error('Abre o criador em localhost ou HTTPS para verificar o modelo.')
  const digest = await window.crypto.subtle.digest('SHA-256', data)
  const sha256 = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
  validateMaleReviewIdentity(data.byteLength, sha256)
  return data
}

export function AthleteCandidateControls({ male, onFemale, onMaleFile }) {
  return <fieldset className="art-review-controls">
    <legend>Personagem</legend>
    <button type="button" aria-pressed={!male} onClick={onFemale}>Feminina</button>
    <p>Masculino · modelo em avaliação</p>
    <label htmlFor="male-review-file">Carregar candidato masculino GLB</label>
    <input id="male-review-file" type="file" accept=".glb,model/gltf-binary"
      onChange={event => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (file) onMaleFile(file)
      }} />
    <p><a href="https://grab3d.com/dl/man-base-character-rigged/man-base-character-rigged.glb" target="_blank" rel="noopener noreferrer">Descarregar Rigged GLB masculino</a></p>
  </fieldset>
}

export function readAthleteStyle() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(ATHLETE_SAVE_KEY) || 'null')
    return normalizeSurferStyle({ boardColor: 'turquoise', ...saved, character: 'female' })
  } catch (_) { return normalizeSurferStyle({ character: 'female', boardColor: 'turquoise' }) }
}

export function AthleteControls({ ready, pose, style, onPose, onStyle }) {
  return <div className="art-review-tools">
    <fieldset className="art-review-controls">
      <legend>Posição</legend>
      {ATHLETE_POSES.map(value => <button key={value} type="button" disabled={!ready}
        aria-pressed={pose === value} onClick={() => onPose(value)}>{POSE_LABELS[value]}</button>)}
    </fieldset>
    <fieldset className="art-review-controls">
      <legend>Formato da prancha</legend>
      {BOARD_TYPES.map(value => <button key={value} type="button" disabled={!ready}
        aria-pressed={style.boardType === value} onClick={() => onStyle('boardType', value)}>{value}</button>)}
    </fieldset>
    <fieldset className="art-review-controls">
      <legend>Cor da prancha</legend>
      {Object.entries(BOARD_COLORS).map(([value, color]) => <button key={value} type="button"
        className="art-review-swatch" aria-label={value} title={value} disabled={!ready}
        aria-pressed={style.boardColor === value} style={{ '--board-color': color }}
        onClick={() => onStyle('boardColor', value)} />)}
    </fieldset>
  </div>
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
  const [style, setStyle] = useState(readAthleteStyle)
  const [maleFile, setMaleFile] = useState(null)
  const male = Boolean(maleFile)
  const initialStyle = useRef(style)
  initialStyle.current = style
  const chooseCharacter = file => {
    if (file === maleFile) return
    active.current = null
    setReady(false)
    setSaved(false)
    setMaleFile(file)
  }
  const [saved, setSaved] = useState(false)
  const changeStyle = (key, value) => {
    const next = normalizeSurferStyle({ ...style, [key]: value, character: 'female' })
    active.current?.setBoardStyle(next.boardType, BOARD_COLORS[next.boardColor])
    setStyle(next)
    setSaved(false)
  }
  const save = () => {
    try { window.localStorage.setItem(ATHLETE_SAVE_KEY, JSON.stringify(style)); setSaved(true) }
    catch (_) { setStatus('Não foi possível guardar neste navegador.') }
  }

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
      const data = maleFile ? await readMaleReviewFile(maleFile) : null
      if (cancelled) return
      const character = data
        ? await loader.parseAsync(data, '')
        : await loader.loadAsync((process.env.PUBLIC_URL || '') + ATHLETE_SURFER_PATH)
      if (cancelled) { disposeImported(character.scene); return }
      const root = character.scene
      loadedRoots.push(root)
      art = createAthleteSurferArt(root, {
        boardType: initialStyle.current.boardType, color: BOARD_COLORS[initialStyle.current.boardColor]
      })
      scene.add(art.display)
      active.current = { setBoardStyle: art.setBoardStyle, selectPose: pose => {
        try { art.setPose(pose); setStatus(''); return true }
        catch (error) { art.setPose('base'); setStatus(error.message); return false }
      } }
      renderer.domElement.dataset.athleteCharacter = maleFile ? 'male' : 'female'
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
  }, [maleFile])

  return (
    <main className="art-review">
      <header className="art-review-header">
        <Link to="/">← Início</Link>
        <div>
          <h1>{male ? 'Surfista masculino · avaliação' : 'Cria a tua surfista'}</h1>
          <p>{male ? 'Candidato local · Poses e prancha · Câmara livre' : 'Modelo selecionado · Personalização visual · Câmara livre'}</p>
        </div>
      </header>
      <div className="art-review-grid">
        <div>
          <AthleteCandidateControls male={male} onFemale={() => chooseCharacter(null)}
            onMaleFile={chooseCharacter} />
          <AthleteControls ready={ready} pose={selectedPose} style={style}
            onPose={pose => {
              if (active.current?.selectPose(pose)) setSelectedPose(pose)
              else setSelectedPose('base')
            }} onStyle={changeStyle} />
        </div>
        <section className="art-review-stage" aria-label="Pré-visualização 3D real">
          <div className="art-review-canvas" ref={holder} />
          {status && <div className="art-review-status" role="status">{status}</div>}
        </section>
      </div>
      <footer className="art-review-footer">
        <div className="art-review-controls">
          <button type="button" disabled={!ready || male} onClick={save}>Guardar visual</button>
          {!male && <Link to="/catalog" state={{ athleteBoardType: style.boardType }}>Ver no tabuleiro</Link>}
          {male && <p>Pré-visualização masculina: ainda não substitui o personagem no tabuleiro.</p>}
          <Link to="/local">Jogo local</Link>
        </div>
        {saved && <p role="status">Visual guardado neste navegador. Ainda não está associado a um jogador.</p>}
        <p>Roupa, pele e cabelo ainda fazem parte da textura original. Arrasta para rodar; scroll ou pinça para aproximar.</p>
      </footer>
    </main>
  )
}
