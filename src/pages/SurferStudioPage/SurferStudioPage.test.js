import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { AthleteControls, AthleteCandidateControls, ATHLETE_SAVE_KEY, readAthleteStyle, MALE_REVIEW_BYTES, MALE_REVIEW_SHA256, validateMaleReviewIdentity } from '../ArtReviewPage'

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

describe('verified male candidate preview', () => {
  test('accepts only the inspected GLB identity', () => {
    expect(() => validateMaleReviewIdentity(MALE_REVIEW_BYTES, MALE_REVIEW_SHA256)).not.toThrow()
    expect(() => validateMaleReviewIdentity(MALE_REVIEW_BYTES, 'bad')).toThrow(/Rigged GLB/)
    expect(() => validateMaleReviewIdentity(1, MALE_REVIEW_SHA256)).toThrow(/Rigged GLB/)
  })

  test('offers local male import and explicit return to the selected female', () => {
    const onFemale = jest.fn(), onMaleFile = jest.fn()
    const { rerender } = render(<AthleteCandidateControls male={false} onFemale={onFemale} onMaleFile={onMaleFile} />)
    expect(screen.getByRole('button', { name: 'Feminina' })).toHaveAttribute('aria-pressed', 'true')
    const file = new File(['test'], 'man-base-character-rigged.glb', { type: 'model/gltf-binary' })
    fireEvent.change(screen.getByLabelText('Carregar candidato masculino GLB'), { target: { files: [file] } })
    expect(onMaleFile).toHaveBeenCalledWith(file)
    rerender(<AthleteCandidateControls male onFemale={onFemale} onMaleFile={onMaleFile} />)
    expect(screen.getByRole('button', { name: 'Feminina' })).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(screen.getByRole('button', { name: 'Feminina' }))
    expect(onFemale).toHaveBeenCalledTimes(1)
  })
})
