import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { AthleteControls, ATHLETE_SAVE_KEY, readAthleteStyle } from '../ArtReviewPage'

beforeEach(() => window.localStorage.clear())

describe('unified athlete creator controls', () => {
  test('uses the selected female asset and restores valid saved board choices', () => {
    expect(readAthleteStyle().character).toBe('female')
    expect(readAthleteStyle().boardColor).toBe('turquoise')
    window.localStorage.setItem(ATHLETE_SAVE_KEY, JSON.stringify({ character: 'male', boardType: 'fish', boardColor: 'blue' }))
    expect(readAthleteStyle()).toMatchObject({ character: 'female', boardType: 'fish', boardColor: 'blue' })
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
