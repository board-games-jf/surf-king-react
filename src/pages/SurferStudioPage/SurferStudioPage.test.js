import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { AthleteControls, AthleteCharacterControls, LocalPlayerControls, ATHLETE_SAVE_KEY, readAthleteStyle } from '../ArtReviewPage'

beforeEach(() => window.localStorage.clear())

describe('unified athlete creator controls', () => {
  test('defaults to the female asset and restores either selected character and board choices', () => {
    expect(readAthleteStyle().character).toBe('female')
    expect(readAthleteStyle().boardColor).toBe('turquoise')
    window.localStorage.setItem(ATHLETE_SAVE_KEY, JSON.stringify({ character: 'male', boardType: 'fish', boardColor: 'blue' }))
    expect(readAthleteStyle()).toMatchObject({ character: 'male', boardType: 'fish', boardColor: 'blue' })
  })

  test('only exposes real pose and board options; changes reach the viewer callbacks', () => {
    const onPose = jest.fn(), onStyle = jest.fn()
    render(<AthleteControls ready pose="surf" style={readAthleteStyle()} onPose={onPose} onStyle={onStyle} />)
    expect(screen.getByRole('button', { name: 'A surfar' })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByRole('button', { name: 'Em pé' }))
    fireEvent.click(screen.getByRole('button', { name: 'Relaxada' }))
    fireEvent.click(screen.getByRole('button', { name: 'fish' }))
    fireEvent.click(screen.getByRole('button', { name: 'blue' }))
    expect(onPose.mock.calls).toEqual([['standing'], ['relaxed']])
    expect(onStyle.mock.calls).toEqual([['boardType', 'fish'], ['boardColor', 'blue']])
    expect(screen.queryByRole('button', { name: /Modelo antigo|Base GLB|Masculino/i })).toBeNull()
  })

  test('disables changes while the asset is loading', () => {
    const onPose = jest.fn(), onStyle = jest.fn()
    render(<AthleteControls ready={false} pose="surf" style={readAthleteStyle()} onPose={onPose} onStyle={onStyle} />)
    fireEvent.click(screen.getByRole('button', { name: 'Em pé' }))
    expect(onPose).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'blue' })).toBeDisabled()
  })
})

describe('approved character selection', () => {
  test('selects both approved characters without a local file upload', () => {
    const onCharacter = jest.fn()
    const { rerender } = render(<AthleteCharacterControls character="female" onCharacter={onCharacter} />)
    expect(screen.getByRole('button', { name: 'Feminina' })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByRole('button', { name: 'Masculino' }))
    expect(onCharacter).toHaveBeenCalledWith('male')
    rerender(<AthleteCharacterControls character="male" onCharacter={onCharacter} />)
    expect(screen.getByRole('button', { name: 'Masculino' })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByRole('button', { name: 'Feminina' }))
    expect(onCharacter).toHaveBeenCalledWith('female')
  })
})


describe('local player selection', () => {
  test('selects one of the seven slots without modifying the athlete appearance', () => {
    const change = jest.fn()
    render(<LocalPlayerControls playerId="0" onPlayerChange={change} />)
    const picker = screen.getByRole('combobox', { name: 'Jogador local' })
    expect(picker.options).toHaveLength(7)
    fireEvent.change(picker, { target: { value: '4' } })
    expect(change).toHaveBeenCalledWith('4')
  })
})
