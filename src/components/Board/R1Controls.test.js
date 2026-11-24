import React from 'react'
import { render, screen, within, fireEvent } from '@testing-library/react'
import R1Controls from './R1Controls'
import { createR1Deck, setupR1 } from '../../game/r1/SurfKingR1'

test('shows distinct illustrations and current R1 effects, including Surf Current', () => {
    const ctx = { numPlayers: 2, currentPlayer: '0', random: { Number: () => 0, Shuffle: xs => xs.slice() } }
    const G = setupR1(ctx)
    const unique = createR1Deck().filter((card, index, cards) => cards.findIndex(c => c.Name === card.Name) === index)
    G.players[0].cards = unique
    render(<R1Controls G={G} ctx={ctx} moves={{}} selection={null} setSelection={() => {}} onTarget={() => {}} />)
    const hand = screen.getByLabelText('Player 1 hand')
    const buttons = within(hand).getAllByRole('button')
    expect(buttons).toHaveLength(10)
    const sources = buttons.map(button => button.querySelector('img').getAttribute('src'))
    expect(new Set(sources).size).toBe(10)
    expect(within(hand).getByRole('button', { name: /Surf Current/ })).toHaveTextContent('Move up to two legal steps')
    expect(within(hand).getByRole('button', { name: /Island/ })).toHaveTextContent('every ordinary entry restores 2 energy; Island stays in place')
    expect(screen.getByLabelText('Round play order').querySelector('[aria-current="step"]')).toHaveTextContent('Player 1')
})

test('attack stays visible, explains blocked states and selects a named two-edge target', () => {
    const ctx = { numPlayers: 2, currentPlayer: '0', random: { Number: () => 0, Shuffle: xs => xs.slice() } }
    const G = setupR1(ctx)
    const setSelection = jest.fn()
    const onTarget = jest.fn()
    const props = { G, ctx, moves: {}, selection: null, setSelection, onTarget }
    const { rerender } = render(<R1Controls {...props} />)
    expect(screen.getByRole('button', { name: /Attack · Drop In/ })).toBeDisabled()
    expect(screen.getByText('Attacks unlock in round 2.', { selector: '#r1-drop-status' })).toBeInTheDocument()
    G.turn = 2
    delete G.cells[1].player
    G.players[1].cellPosition = 14
    G.cells[14].player = { position: 1 }
    rerender(<R1Controls {...props} />)
    const attack = screen.getByRole('button', { name: /Attack · Drop In/ })
    expect(attack).toBeEnabled()
    fireEvent.click(attack)
    expect(setSelection).toHaveBeenCalledWith({ kind: 'drop' })
    rerender(<R1Controls {...props} selection={{ kind: 'drop' }} />)
    expect(screen.getByText('2. Player 2').closest('.surf-hand')).toHaveAttribute('data-attack-target', 'true')
    fireEvent.click(screen.getByRole('button', { name: 'Attack Player 2' }))
    expect(onTarget).toHaveBeenCalledWith(14)
    G.currentMove = 'maneuver'
    rerender(<R1Controls {...props} />)
    expect(screen.getByRole('button', { name: /Attack · Drop In/ })).toBeDisabled()
    expect(screen.getByText('Attack before moving, instead of another tactic.', { selector: '#r1-drop-status' })).toBeInTheDocument()
})
