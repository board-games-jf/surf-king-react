import React from 'react'
import { render, screen, within } from '@testing-library/react'
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
