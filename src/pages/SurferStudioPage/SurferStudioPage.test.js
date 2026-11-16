import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import SurferStudioPage from './index'

jest.mock('./SurferViewer', () => function MockSurferViewer({ style }) {
  return <div data-testid="surfer-style">{JSON.stringify(style)}</div>
})

jest.mock('./RiggedBaseViewer', () => function MockRiggedBaseViewer({ style, styled, pose }) {
  return <div data-testid="rigged-base-viewer">
    {JSON.stringify({ style, styled, pose })}
  </div>
})

function open(path = '/customize') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/surfers" element={<SurferStudioPage />} />
        <Route path="/customize" element={<SurferStudioPage />} />
      </Routes>
    </MemoryRouter>
  )
}

const rigged = () => JSON.parse(screen.getByTestId('rigged-base-viewer').textContent)

beforeEach(() => window.localStorage.clear())

describe('rigged surfer visual exploration', () => {
  test('gallery defaults to the styled GLB and preserves the existing presets', () => {
    open('/surfers')
    expect(screen.getByRole('heading', { name: 'Galeria de surfistas' })).toBeTruthy()
    expect(rigged().styled).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: /Surfista 3/i }))
    expect(rigged().style.character).toBe('male')
    expect(rigged().style.boardType).toBe('longboard')
    expect(rigged().style.boardColor).toBe('orange')
    expect(screen.getByRole('link', { name: 'Personalizar este surfista' })).toBeTruthy()
  })

  test('gallery compares styled GLB, raw GLB and procedural model', () => {
    open('/surfers')
    fireEvent.click(screen.getByRole('button', { name: 'Base GLB' }))
    expect(rigged().styled).toBe(false)
    fireEvent.click(screen.getByRole('button', { name: 'Modelo antigo' }))
    expect(screen.queryByTestId('rigged-base-viewer')).toBeNull()
    expect(screen.getByTestId('surfer-style')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Novo visual 3D' }))
    expect(rigged().styled).toBe(true)
  })

  test('creator changes appear on the real GLB without affecting gameplay', () => {
    open()
    expect(rigged().styled).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Masculino' }))
    fireEvent.click(screen.getByRole('button', { name: 'Fish' }))
    fireEvent.click(screen.getByRole('button', { name: 'auburn' }))
    const preview = rigged()
    expect(preview.style.character).toBe('male')
    expect(preview.style.boardType).toBe('fish')
    expect(preview.style.hairColor).toBe('auburn')
    expect(screen.queryByRole('button', { name: 'Base GLB' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Modelo antigo' }))
    expect(screen.getByTestId('surfer-style')).toBeTruthy()
  })

  test('creator switches genuine gender preview and standing / relaxed / surfing poses', () => {
    open()
    expect(rigged().style.character).toBe('male')
    expect(rigged().pose).toBe('relaxed')
    fireEvent.click(screen.getByRole('button', { name: 'Feminino' }))
    expect(rigged().style.character).toBe('female')
    fireEvent.click(screen.getByRole('button', { name: 'Em pé' }))
    expect(rigged().pose).toBe('standing')
    fireEvent.click(screen.getByRole('button', { name: 'A surfar' }))
    expect(rigged().pose).toBe('surfing')
    fireEvent.click(screen.getByRole('button', { name: 'Relaxado' }))
    expect(rigged().pose).toBe('relaxed')
    fireEvent.click(screen.getByRole('button', { name: 'Guardar visual' }))
    const saved = JSON.parse(window.localStorage.getItem('surf-king-surfer-preview-v1'))
    expect(saved.character).toBe('female')
    expect(saved).not.toHaveProperty('pose')
    expect(saved).not.toHaveProperty('energy')
  })

  test('saving remains cosmetic-only and local to the browser', () => {
    open()
    fireEvent.click(screen.getByRole('button', { name: 'Longboard' }))
    fireEvent.click(screen.getByRole('button', { name: 'Guardar visual' }))
    const saved = JSON.parse(window.localStorage.getItem('surf-king-surfer-preview-v1'))
    expect(saved.boardType).toBe('longboard')
    expect(saved).not.toHaveProperty('playerId')
    expect(saved).not.toHaveProperty('energy')
    expect(screen.getByRole('status').textContent).toMatch(/neste navegador/)
  })
})
