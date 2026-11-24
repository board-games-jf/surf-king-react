import React, { useCallback, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BOARD_TYPES } from '../../map/views/Board3D/surferStyle'
import { normalizeLocalPlayerId } from '../../map/views/Board3D/localSurferProfiles'
import Board3D from '../../map/views/Board3D/Board3D'
import {
  CATALOG_TOOLS,
  OBSTACLE_TYPES,
  createBoardCatalog,
  createEmptyBoardCatalog,
  createCatalogSnapshot,
  placeCatalogAsset,
  setCatalogSurferFallen,
  nearbyCatalogCell,
} from './catalogState'
import { cardArt, cardTone } from '../../components/Board/r1CardArt'
import '../../components/Board/R1Hud.css'
import './BoardCatalogPage.css'

const SURFER_COLORS = ['Orange', 'Coral', 'Teal', 'Blue', 'Yellow', 'Purple', 'Green']

export default function BoardCatalogPage({ animationStudio = false }) {
  const [selectedCard, setSelectedCard] = useState('Sunburn')
  const [sunburnPreview, setSunburnPreview] = useState(null)
  const [bigWavePreview, setBigWavePreview] = useState(null)
  const [amuletPreview, setAmuletPreview] = useState(null)
  const [stonePreview, setStonePreview] = useState(null)
  const [stormPreview, setStormPreview] = useState(null)
  const [cyclonePreview, setCyclonePreview] = useState(null)
  const [islandPreview, setIslandPreview] = useState(null)
  const [energyPreview, setEnergyPreview] = useState(null)
  const location = useLocation()
  const selectedProfilePlayer = normalizeLocalPlayerId(location.state?.athletePlayerId)
  const requestedType = location.state?.athleteBoardType
  const athleteBoardType = BOARD_TYPES.includes(requestedType) ? requestedType : null
  const [catalog, setCatalog] = useState(createBoardCatalog)
  const [tool, setTool] = useState('Inspect')
  const [surferId, setSurferId] = useState(selectedProfilePlayer ?? (location.state?.athleteCharacter === 'female' ? '1' : '0'))
  const requestedCharacter = location.state?.athleteCharacter
  const [selectedCellId, setSelectedCellId] = useState(() =>
    selectedProfilePlayer !== null
      ? catalog.surfers[selectedProfilePlayer] ?? null
      : ['male', 'female'].includes(requestedCharacter)
      ? catalog.surfers[requestedCharacter === 'male' ? '0' : '1'] ?? null
      : null)
  const [error, setError] = useState(null)

  const snapshot = useMemo(
    () => createCatalogSnapshot(catalog, selectedCellId),
    [catalog, selectedCellId]
  )
  const onCellSelect = useCallback((id) => {
    setSelectedCellId(id)
    setCatalog(current => placeCatalogAsset(current, id, tool, surferId))
  }, [tool, surferId])

  const focusCell = (id) => {
    setTool('Inspect')
    setSelectedCellId(id)
  }
  const reset = () => {
    setCatalog(createBoardCatalog())
    setTool('Inspect')
    setSelectedCellId(null)
    setError(null)
  }
  const clear = () => {
    setCatalog(createEmptyBoardCatalog())
    setTool('Inspect')
    setSelectedCellId(null)
  }

  const stoneCell = Object.keys(catalog.obstacles).find(id => catalog.obstacles[id] === 'Stone')
  const stormCell = Object.keys(catalog.obstacles).find(id => catalog.obstacles[id] === 'Storm')
  const cycloneCell = Object.keys(catalog.obstacles).find(id => catalog.obstacles[id] === 'Cyclone')
  const islandCell = Object.keys(catalog.obstacles).find(id => catalog.obstacles[id] === 'Island')
  const nearby = nearbyCatalogCell(catalog, surferId)
  const previewGlide = () => {
    if (nearby === null) return
    focusCell(nearby)
    setCatalog(current => placeCatalogAsset(current, nearby, 'Surfer', surferId))
  }
  const previewMotion = fallen => {
    focusCell(catalog.surfers[surferId])
    setCatalog(current => setCatalogSurferFallen(current, surferId, fallen))
  }

  const selectedObject = selectedCellId === null ? null
    : snapshot.players.find(player => player.cellId === selectedCellId)
      ? 'Surfer ' + (Number(snapshot.players.find(player => player.cellId === selectedCellId).id) + 1)
      : catalog.obstacles[selectedCellId] || 'Empty'

  return (
    <main className="board-catalog">
      <header className="board-catalog-header">
        <div>
          <Link to="/">← Home</Link>
          <h1>{animationStudio ? 'Surf King · Animation studio' : 'Surf King · 3D board catalog'}</h1>
          <p>Preview the actual game board and models. This is a design sandbox, not a match.</p>
        </div>
        <div className="board-catalog-header-links">
          <Link to="/obstacles">Individual models</Link>
          <Link to="/customize">Customize surfer</Link>
          <Link to="/local">Local game</Link>
        </div>
      </header>

      <div className="board-catalog-layout">
        <section className="board-catalog-stage" aria-label="Interactive 3D board catalog">
          <Board3D
            previewFemaleAthlete
            athleteBoardType={athleteBoardType}
            snapshot={snapshot}
            sunburnPreview={sunburnPreview}
            bigWavePreview={bigWavePreview}
            amuletPreview={amuletPreview}
            stonePreview={stonePreview}
            stormPreview={stormPreview}
            cyclonePreview={cyclonePreview}
            islandPreview={islandPreview}
            energyPreview={energyPreview}
            onCellSelect={onCellSelect}
            onUnavailable={setError}
            focusCellId={tool === 'Inspect' ? selectedCellId : null}
          />
          {error && <div className="board-catalog-error" role="alert">{error}</div>}
        </section>

        <aside className="board-catalog-panel" aria-label="Catalog controls">
          {animationStudio && <section>
            <h2>Card interaction preview</h2>
            <p>Hover, focus or select each card to replay the existing hand transition. Select a card and a surfer below, then press Play. Other card effects are not implemented yet.</p>
            <div className="r1-floating-hud animation-studio-cards"><div className="r1-hand">
              {Object.keys(cardArt).map(name => <button key={name} type="button"
                data-card-tone={cardTone[name]} aria-pressed={selectedCard === name}
                style={{ '--r1-fan-angle': '0deg' }}
                onClick={() => setSelectedCard(name)}>
                <img className="r1-card-art" src={cardArt[name]} alt="" /><strong>{name}</strong>
              </button>)}
            </div></div>
            <button type="button" disabled={!['Sunburn', 'Big wave', 'Tsunami', 'Amulet', 'Stone', 'Storm', 'Cyclone', 'Island', 'Energy x2'].includes(selectedCard) || (selectedCard === 'Stone' ? stoneCell === undefined : selectedCard === 'Storm' ? stormCell === undefined : selectedCard === 'Cyclone' ? cycloneCell === undefined : selectedCard === 'Island' ? islandCell === undefined : !Number.isInteger(catalog.surfers[surferId]))}
              onClick={() => { if (selectedCard === 'Stone') { focusCell(Number(stoneCell)); setStonePreview({ cellId: Number(stoneCell) }) } else if (selectedCard === 'Storm') { focusCell(Number(stormCell)); setStormPreview({ cellId: Number(stormCell) }) } else if (selectedCard === 'Cyclone') { focusCell(Number(cycloneCell)); setCyclonePreview({ cellId: Number(cycloneCell) }) } else if (selectedCard === 'Island') { focusCell(Number(islandCell)); setIslandPreview({ cellId: Number(islandCell) }) } else { focusCell(catalog.surfers[surferId]); (selectedCard === 'Sunburn' ? setSunburnPreview : selectedCard === 'Amulet' ? setAmuletPreview : selectedCard === 'Energy x2' ? setEnergyPreview : setBigWavePreview)({ playerId: surferId, tsunami: selectedCard === 'Tsunami' }) } }}>
              ▶ Play
            </button>
            <p aria-live="polite">{selectedCard === 'Sunburn' ? 'Sunburn: −1 energy. The displayed amount is a preview example.' : selectedCard === 'Big wave' ? 'Big wave: up to −2 energy. The displayed amount is a preview example.' : selectedCard === 'Tsunami' ? 'Tsunami: up to −3 energy. The displayed amount is a preview example.' : selectedCard === 'Amulet' ? 'Amulet: protection against attacks and Change until your next turn. Visual activation preview.' : selectedCard === 'Stone' ? (stoneCell === undefined ? 'Place a Stone on the board to preview its arrival.' : 'Stone: placement preview. Entry costs 1 energy and removes the stone.') : selectedCard === 'Storm' ? (stormCell === undefined ? 'Place a Storm on the board to preview its arrival.' : 'Storm: placement preview. Entering costs 1 energy.') : selectedCard === 'Cyclone' ? (cycloneCell === undefined ? 'Place a Cyclone on the board to preview its arrival.' : 'Cyclone: formation preview. Entry redirects to a random free neighboring hex.') : selectedCard === 'Island' ? (islandCell === undefined ? 'Place an Island on the board to preview its arrival.' : 'Island: sand emerges and palms grow. Entry restores 2 energy.') : selectedCard === 'Energy x2' ? 'Energy x2: gain up to 2 energy (maximum 5). The displayed amount is a preview example.' : selectedCard + ': animation not available yet.'}</p>
            <div className="board-catalog-divider" />
          </section>}
          <div className="board-catalog-panel-top">
            <h2>Place &amp; inspect</h2>
            <p>Choose a tool, then tap a hex. Inspect mode zooms to its contents.</p>
            <button type="button" onClick={() => { setSurferId('1'); focusCell(catalog.surfers['1']) }}
              disabled={!Number.isInteger(catalog.surfers['1'])}>
              Focus on the selected female surfer
            </button>
            <button type="button" onClick={() => { setSurferId('0'); focusCell(catalog.surfers['0']) }}
              disabled={!Number.isInteger(catalog.surfers['0'])}>
              Focus on the selected male surfer
            </button>
            <p>Both selected models on the actual board. Player board colors stay unique.</p>
          </div>
          <div className="board-catalog-tools" role="group" aria-label="Catalog tool">
            {CATALOG_TOOLS.map(id => (
              <button key={id} type="button" aria-pressed={tool === id}
                onClick={() => setTool(id)}>{id}</button>
            ))}
          </div>
          <fieldset className="board-catalog-actions">
            <legend>Surfer animation preview</legend>
            <p>Idle carving runs continuously. Select a surfer below, then replay movement, fall and recovery.</p>
            <button type="button" disabled={!Number.isInteger(catalog.surfers[surferId]) || !!catalog.fallen?.[surferId]} onClick={() => previewMotion(true)}>Fall off board</button>
            <button type="button" disabled={!catalog.fallen?.[surferId]} onClick={() => previewMotion(false)}>Get back on board</button>
            <button type="button" disabled={nearby === null} onClick={previewGlide}>Glide to nearby hex</button>
            <button type="button" onClick={() => setTool('Surfer')}>Move surfer</button>
          </fieldset>
          <div>
            <label className="board-catalog-surfer">
              Surfer variant
              <select value={surferId} onChange={event => setSurferId(event.target.value)}>
                {SURFER_COLORS.map((label, id) => (
                  <option key={label} value={String(id)}>{id + 1} · {label}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="board-catalog-selected" aria-live="polite">
            {selectedCellId === null
              ? 'No hex selected'
              : 'Hex ' + (selectedCellId + 1) + ' · ' + selectedObject}
          </div>
          <div className="board-catalog-actions">
            <button type="button" onClick={reset}>Reset showcase</button>
            <button type="button" onClick={clear}>Clear board</button>
          </div>
          <div className="board-catalog-divider" />
          <h3>Find on the board</h3>
          <p className="board-catalog-help">Select a model to center the camera on its current hex.</p>
          <div className="board-catalog-locations">
            {OBSTACLE_TYPES.map(type => {
              const cells = Object.entries(catalog.obstacles).filter(([, value]) => value === type)
              return (
                <div className="board-catalog-location" key={type}>
                  <span>{type}</span>
                  {cells.length ? (
                    <button type="button" onClick={() => focusCell(Number(cells[0][0]))}>
                      Hex {Number(cells[0][0]) + 1}{cells.length > 1 ? ' (+' + (cells.length - 1) + ')' : ''}
                    </button>
                  ) : <span className="board-catalog-muted">Not placed</span>}
                </div>
              )
            })}
            {Object.entries(catalog.surfers).map(([id, cellId]) => (
              <div className="board-catalog-location" key={'surfer-' + id}>
                <span>Surfer {Number(id) + 1}</span>
                <button type="button" onClick={() => focusCell(cellId)}>Hex {cellId + 1}</button>
              </div>
            ))}
          </div>
          <p className="board-catalog-disclaimer">
            Initial placements are illustrative. No turns, card effects or game rules are executed here.
          </p>
        </aside>
      </div>
    </main>
  )
}
