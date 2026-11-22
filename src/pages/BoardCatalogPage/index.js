import React, { useCallback, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BOARD_TYPES } from '../../map/views/Board3D/surferStyle'
import Board3D from '../../map/views/Board3D/Board3D'
import {
  CATALOG_TOOLS,
  OBSTACLE_TYPES,
  createBoardCatalog,
  createEmptyBoardCatalog,
  createCatalogSnapshot,
  placeCatalogAsset,
} from './catalogState'
import './BoardCatalogPage.css'

const SURFER_COLORS = ['Orange', 'Coral', 'Teal', 'Blue', 'Yellow', 'Purple', 'Green']

export default function BoardCatalogPage() {
  const location = useLocation()
  const requestedType = location.state?.athleteBoardType
  const athleteBoardType = BOARD_TYPES.includes(requestedType) ? requestedType : null
  const [catalog, setCatalog] = useState(createBoardCatalog)
  const [tool, setTool] = useState('Inspect')
  const [surferId, setSurferId] = useState('0')
  const requestedCharacter = location.state?.athleteCharacter
  const [selectedCellId, setSelectedCellId] = useState(() =>
    ['male', 'female'].includes(requestedCharacter)
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

  const selectedObject = selectedCellId === null ? null
    : snapshot.players.find(player => player.cellId === selectedCellId)
      ? 'Surfer ' + (Number(snapshot.players.find(player => player.cellId === selectedCellId).id) + 1)
      : catalog.obstacles[selectedCellId] || 'Empty'

  return (
    <main className="board-catalog">
      <header className="board-catalog-header">
        <div>
          <Link to="/">← Home</Link>
          <h1>Surf King · 3D board catalog</h1>
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
            onCellSelect={onCellSelect}
            onUnavailable={setError}
            focusCellId={tool === 'Inspect' ? selectedCellId : null}
          />
          {error && <div className="board-catalog-error" role="alert">{error}</div>}
        </section>

        <aside className="board-catalog-panel" aria-label="Catalog controls">
          <div className="board-catalog-panel-top">
            <h2>Place &amp; inspect</h2>
            <p>Choose a tool, then tap a hex. Inspect mode zooms to its contents.</p>
            <button type="button" onClick={() => focusCell(catalog.surfers['1'])}
              disabled={!Number.isInteger(catalog.surfers['1'])}>
              Focus on the selected female surfer
            </button>
            <button type="button" onClick={() => focusCell(catalog.surfers['0'])}
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
          {tool === 'Surfer' && (
            <label className="board-catalog-surfer">
              Surfer variant
              <select value={surferId} onChange={event => setSurferId(event.target.value)}>
                {SURFER_COLORS.map((label, id) => (
                  <option key={label} value={String(id)}>{id + 1} · {label}</option>
                ))}
              </select>
            </label>
          )}
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
