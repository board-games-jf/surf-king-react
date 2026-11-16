import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import SurferStudioPage from './index'

jest.mock('./SurferViewer', () => function MockSurferViewer({ style }) {
  return <div data-testid="surfer-style">{JSON.stringify(style)}</div>
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

beforeEach(() => window.localStorage.clear())

describe('surfer gallery and cosmetic creator', () => {
  test('gallery uses the actual shared preview component with selectable presets', () => {
    open('/surfers')
    expect(screen.getByRole('heading', { name: 'Galeria de surfistas' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Surfista 3/i }))
    const preview = JSON.parse(screen.getByTestId('surfer-style').textContent)
    expect(preview.character).toBe('male')
    expect(preview.boardType).toBe('longboard')
    expect(preview.boardColor).toBe('orange')
    expect(screen.getByRole('link', { name: 'Personalizar este surfista' })).toBeTruthy()
  })

  test('customization updates character and board independently', () => {
    open()
    fireEvent.click(screen.getByRole('button', { name: 'Masculino' }))
    fireEvent.click(screen.getByRole('button', { name: 'Fish' }))
    fireEvent.click(screen.getByRole('button', { name: 'auburn' }))
    const preview = JSON.parse(screen.getByTestId('surfer-style').textContent)
    expect(preview.character).toBe('male')
    expect(preview.boardType).toBe('fish')
    expect(preview.hairColor).toBe('auburn')
  })

  test('saving is local only and does not create any game state', () => {
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
