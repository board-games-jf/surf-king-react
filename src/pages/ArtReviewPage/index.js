import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ATHLETE_ASSET_PATHS, ATHLETE_POSES, createAthleteSurferArt } from '../../map/views/Board3D/athleteSurferArt'
import { BOARD_TYPES, BOARD_COLORS, normalizeSurferStyle } from '../../map/views/Board3D/surferStyle'
import { LOCAL_PLAYER_COUNT, readLastLocalSurferPlayer, readLocalSurferProfiles, saveLocalSurferProfile } from '../../map/views/Board3D/localSurferProfiles'
import './ArtReviewPage.css'

export const ATHLETE_SAVE_KEY = 'surf-king-surfer-preview-v1'
const POSE_LABELS = { standing: 'Em pé', relaxed: 'Relaxada', surf: 'A surfar' }

export function LocalPlayerControls({ playerId, onPlayerChange }) {
  return <label className="art-review-player">
    Jogador local
    <select aria-label="Jogador local" value={playerId}
      onChange={event => onPlayerChange(event.target.value)}>
      {Array.from({ length: LOCAL_PLAYER_COUNT }, (_, id) => (
        <option key={id} value={String(id)}>Jogador {id + 1}</option>
      ))}
    </select>
  </label>
}

export function AthleteCharacterControls({ character, onCharacter }) {
  return <fieldset className="art-review-controls">
    <legend>Personagem</legend>
    <button type="button" aria-pressed={character === 'female'} onClick={() => onCharacter('female')}>Feminina</button>
    <button type="button" aria-pressed={character === 'male'} onClick={() => onCharacter('male')}>Masculino</button>
  </fieldset>
}

export function readAthleteStyle() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(ATHLETE_SAVE_KEY) || 'null')
    return normalizeSurferStyle({ boardColor: 'turquoise', ...saved })
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
  const skeletons = new Set()
  root.traverse(node => {
    if (node.isSkinnedMesh && node.skeleton) skeletons.add(node.skeleton)
    if (node.geometry) geometries.add(node.geometry)
    const mats = Array.isArray(node.material) ? node.material : node.material ? [node.material] : []
    mats.forEach(material => {
      materials.add(material)
      Object.values(material).forEach(value => {
        if (value?.isTexture) textures.add(value)
      })
    })
  })
  skeletons.forEach(skeleton => skeleton.dispose())
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
  const [playerId, setPlayerId] = useState(readLastLocalSurferPlayer)
  const characterType = style.character
  const initialStyle = useRef(style)
  initialStyle.current = style
  const chooseCharacter = character => {
    if (character === characterType) return
    active.current = null
    setReady(false)
    setSaved(false)
    setStyle(current => normalizeSurferStyle({ ...current, character }))
  }
  const choosePlayer = id => {
    setPlayerId(id)
    const profile = readLocalSurferProfiles()[id]
    if (profile) {
      const next = normalizeSurferStyle({ ...style, ...profile })
      active.current?.setBoardStyle(next.boardType, BOARD_COLORS[next.boardColor])
      setStyle(next)
    }
    setSaved(false)
  }
  const [saved, setSaved] = useState(false)
  const changeStyle = (key, value) => {
    const next = normalizeSurferStyle({ ...style, [key]: value })
    active.current?.setBoardStyle(next.boardType, BOARD_COLORS[next.boardColor])
    setStyle(next)
    setSaved(false)
  }
  const save = () => {
    try {
      window.localStorage.setItem(ATHLETE_SAVE_KEY, JSON.stringify(style))
      saveLocalSurferProfile(playerId, style, window.localStorage)
      setSaved(true)
    }
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
      const clock = new THREE.Clock()
      const reduceMotion = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      const render = () => {
        frameId = requestAnimationFrame(render)
        art?.animate(clock.getElapsedTime(), reduceMotion)
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
      const character = await loader.loadAsync((process.env.PUBLIC_URL || '') + ATHLETE_ASSET_PATHS[characterType])
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
      renderer.domElement.dataset.athleteCharacter = characterType
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
  }, [characterType])

  return (
    <main className="art-review">
      <header className="art-review-header">
        <Link to="/">← Início</Link>
        <div>
          <h1>Cria o teu surfista</h1>
          <p>Modelos selecionados · Personalização visual · Câmara livre</p>
        </div>
      </header>
      <div className="art-review-grid">
        <div>
          <LocalPlayerControls playerId={playerId} onPlayerChange={choosePlayer} />
          <AthleteCharacterControls character={characterType} onCharacter={chooseCharacter} />
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
          <button type="button" disabled={!ready} onClick={save}>Guardar visual</button>
          {ready && <Link to="/catalog" state={{ athletePlayerId: playerId }}>Ver no tabuleiro</Link>}
          <Link to="/local">Jogo local</Link>
        </div>
        {saved && <p role="status">Visual associado ao jogador {Number(playerId) + 1} neste navegador. Abre novamente o tabuleiro 3D para o veres.</p>}
        <p>No jogo, a cor da prancha continua a identificar cada jogador. O modelo e o formato são pessoais após guardar. Cabelo, pele e roupa continuam na textura original. Arrasta para rodar.</p>
      </footer>
    </main>
  )
}
