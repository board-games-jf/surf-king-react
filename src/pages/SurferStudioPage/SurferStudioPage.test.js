import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import SurferStudioPage from './index'

jest.mock('./SurferViewer', () => function MockSurferViewer({ style }) {
  return <div data-testid="surfer-style">{JSON.stringify(style)}</div>
})

jest.mock('./RiggedBaseViewer', () => function MockRiggedBaseViewer() {
  return <div data-testid="rigged-base-viewer">Imported GLB candidate</div>
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
  test('gallery can inspect a GLB candidate without changing the game or creator', () => {
    open('/surfers')
    expect(screen.queryByTestId('rigged-base-viewer')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Base 3D importada (GLB)' }))
    expect(screen.getByTestId('rigged-base-viewer')).toBeTruthy()
    expect(screen.getByText(/sem roupa de surf ou animação final/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Modelo atual' }))
    expect(screen.queryByTestId('rigged-base-viewer')).toBeNull()
    expect(screen.getByTestId('surfer-style')).toBeTruthy()
  })

  test('character creator does not expose an unapproved GLB replacement', () => {
    open('/customize')
    expect(screen.queryByRole('button', { name: 'Base 3D importada (GLB)' })).toBeNull()
    expect(screen.getByTestId('surfer-style')).toBeTruthy()
  })

})
