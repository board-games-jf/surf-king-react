import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import SurferViewer from './SurferViewer'
import RiggedBaseViewer from './RiggedBaseViewer'
import {
  DEFAULT_SURFER_STYLE, PRESET_SURFERS, normalizeSurferStyle,
  CHARACTER_TYPES, HAIRSTYLES, HAIR_COLORS, SKIN_TONES,
  SURFWEAR_COLORS, BOARD_TYPES, BOARD_COLORS
} from '../../map/views/Board3D/surferStyle'
import './SurferStudioPage.css'

const labels = {
  male: 'Masculino', female: 'Feminino',
  short: 'Curto', wavy: 'Ondulado', ponytail: 'Rabo de cavalo',
  shortboard: 'Shortboard', fish: 'Fish', longboard: 'Longboard'
}
const SAVE_KEY = 'surf-king-surfer-preview-v1'
const palettes = [
  ['hairColor', 'Cabelo', HAIR_COLORS],
  ['skinTone', 'Tom de pele', SKIN_TONES],
  ['surfwear', 'Roupa de surf', SURFWEAR_COLORS],
  ['boardColor', 'Cor da prancha', BOARD_COLORS]
]

function readSavedStyle() {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY)
    return raw ? normalizeSurferStyle(JSON.parse(raw)) : null
  } catch (_) {
    return null
  }
}

function Palette({ title, name, values, selected, onChange }) {
  return (
    <fieldset className="surfer-fieldset">
      <legend>{title}</legend>
      <div className="surfer-swatches" role="group" aria-label={title}>
        {Object.entries(values).map(([value, color]) => (
          <button type="button" key={value} title={value} aria-label={value}
            aria-pressed={selected === value}
            className="surfer-swatch"
            onClick={() => onChange(name, value)}
            style={{ '--swatch-color': color }}>
            <span className="surfer-swatch-circle" />
          </button>
        ))}
      </div>
    </fieldset>
  )
}

function Choices({ title, name, options, selected, onChange }) {
  return (
    <fieldset className="surfer-fieldset">
      <legend>{title}</legend>
      <div className="surfer-choices" role="group" aria-label={title}>
        {options.map(value => (
          <button type="button" key={value} aria-pressed={selected === value}
            onClick={() => onChange(name, value)}>
            {labels[value] || value}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

export default function SurferStudioPage() {
  const location = useLocation()
  const gallery = location.pathname === '/surfers'
  const [style, setStyle] = useState(() => normalizeSurferStyle(
    location.state?.style || readSavedStyle() || PRESET_SURFERS[0]
  ))
  const [saved, setSaved] = useState(false)
  const [showRiggedBase, setShowRiggedBase] = useState(false)
  const change = (name, value) => {
    setStyle(current => normalizeSurferStyle({ ...current, [name]: value }))
    setSaved(false)
  }
  const choosePreset = preset => {
    setShowRiggedBase(false)
    setStyle(normalizeSurferStyle(preset))
    setSaved(false)
  }
  const confirm = () => {
    try {
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(style))
      setSaved(true)
    } catch (_) {
      setSaved(false)
    }
  }

  return (
    <main className="surfer-studio">
      <div className="surfer-scene-decoration" aria-hidden="true">
        <span className="surfer-sun" />
        <span className="surfer-island" />
        <span className="surfer-sea" />
        <span className="surfer-beach" />
      </div>

      <header className="surfer-studio-header">
        <Link className="surfer-wordmark" to="/" aria-label="Surf King home">
          <span className="surfer-wordmark-crown">♛</span>
          <span className="surfer-wordmark-top">SURF</span>
          <span className="surfer-wordmark-bottom">KING</span>
          <span className="surfer-wordmark-wave">〰</span>
        </Link>
        <div className="surfer-studio-title">
          <h1>{gallery ? 'Galeria de surfistas' : 'Cria o teu surfista'}</h1>
          <p>{gallery
            ? 'Modelos Three.js reais. Escolhe um personagem e roda para veres os detalhes.'
            : 'Personaliza o personagem e a prancha. As escolhas são só visuais.'}</p>
        </div>
        <nav className="surfer-studio-nav" aria-label="Studio navigation">
          <Link to="/surfers" aria-current={gallery ? 'page' : undefined}>Galeria</Link>
          <Link to="/customize" aria-current={!gallery ? 'page' : undefined}>Personalizar</Link>
          <Link to="/catalog">Tabuleiro</Link>
        </nav>
      </header>

      <div className="surfer-studio-grid">
        <aside className="surfer-studio-panel" aria-label={gallery ? 'Surfer presets' : 'Character customization'}>
          {gallery ? (
            <>
              <h2>Escolhe um surfista</h2>
              <p>Quatro combinações iniciais para explorar. Podes personalizar qualquer uma.</p>
              <div className="surfer-presets">
                {PRESET_SURFERS.map((preset, index) => (
                  <button type="button" key={index}
                    onClick={() => choosePreset(preset)}
                    aria-pressed={JSON.stringify(style) === JSON.stringify(preset)}>
                    <span className="surfer-preset-avatar" aria-hidden="true">
                      {preset.character === 'female' ? '🏄‍♀️' : '🏄‍♂️'}
                    </span>
                    <span>Surfista {index + 1}</span>
                    <small>{labels[preset.boardType]}</small>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <h2>O teu personagem</h2>
              <Choices title="Personagem" name="character" options={CHARACTER_TYPES}
                selected={style.character} onChange={change} />
              <Choices title="Penteado" name="hairstyle" options={HAIRSTYLES}
                selected={style.hairstyle} onChange={change} />
              {palettes.slice(0,3).map(([name,title,values]) => (
                <Palette key={name} name={name} title={title} values={values}
                  selected={style[name]} onChange={change} />
              ))}
            </>
          )}
        </aside>

        <section className="surfer-studio-stage" aria-label="3D surfer visualization">
          <div className="surfer-studio-stage-label">
            <span className="surfer-studio-live">● LIVE 3D</span>
            <span>{gallery && showRiggedBase ? 'Base GLB importada · teste' : labels[style.character] + ' · ' + labels[style.boardType]}</span>
          </div>
          {gallery && (
            <div className="surfer-choices" role="group" aria-label="Modo de pré-visualização">
              <button type="button" aria-pressed={!showRiggedBase}
                onClick={() => setShowRiggedBase(false)}>Modelo atual</button>
              <button type="button" aria-pressed={showRiggedBase}
                onClick={() => setShowRiggedBase(true)}>Base 3D importada (GLB)</button>
            </div>
          )}
          {gallery && showRiggedBase ? <RiggedBaseViewer /> : <SurferViewer style={style} />}
          <p className="surfer-studio-stage-caption">
            {gallery && showRiggedBase
              ? 'Modelo-base com esqueleto real, sem roupa de surf ou animação final. Apenas para avaliar a nova abordagem; ainda não é usado nas partidas.'
              : 'Pré-visualização do modelo 3D do jogo. A arte final ainda está em desenvolvimento.'}
          </p>
        </section>

        <aside className="surfer-studio-panel surfer-studio-board" aria-label="Surfboard customization">
          <h2>Escolhe a prancha</h2>
          {gallery ? (
            <p>Abre o criador para trocar modelo, cores e aparência do surfista.</p>
          ) : (
            <>
              <Choices title="Formato" name="boardType" options={BOARD_TYPES}
                selected={style.boardType} onChange={change} />
              <Palette name="boardColor" title="Cor da prancha" values={BOARD_COLORS}
                selected={style.boardColor} onChange={change} />
            </>
          )}
          <div className="surfer-studio-note">✦ As pranchas são cosméticas: não mudam energia, velocidade nem movimentos.</div>
          {gallery ? (
            <Link className="surfer-studio-cta" to="/customize" state={{ style }}>
              Personalizar este surfista
            </Link>
          ) : (
            <>
              <button className="surfer-studio-cta" type="button" onClick={confirm}>
                Guardar visual
              </button>
              <button className="surfer-studio-reset" type="button"
                onClick={() => {setStyle(DEFAULT_SURFER_STYLE);setSaved(false)}}>
                Repor escolhas
              </button>
              {saved && <p role="status" className="surfer-studio-saved">
                Visual guardado neste navegador. A aplicação ainda não o aplica às partidas.
              </p>}
            </>
          )}
        </aside>
      </div>
      <footer className="surfer-studio-footer">
        <Link to="/">← Início</Link>
        <span>Surf King · Experimental 3D customization · No gameplay effects</span>
      </footer>
    </main>
  )
}
