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
    expect(buttons).toHaveLength(12)
    const sources = buttons.map(button => button.querySelector('img').getAttribute('src'))
    expect(new Set(sources).size).toBe(12)
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
    expect(setSelection).toHaveBeenCalledWith({ kind: 'drop', diceCount: 1 })
    rerender(<R1Controls {...props} selection={{ kind: 'drop', diceCount: 1 }} />)
    expect(screen.getByText('2. Player 2').closest('.surf-hand')).toHaveAttribute('data-attack-target', 'true')
    fireEvent.click(screen.getByRole('button', { name: 'Attack Player 2' }))
    expect(onTarget).toHaveBeenCalledWith(14)
    G.currentMove = 'maneuver'
    rerender(<R1Controls {...props} />)
    expect(screen.getByRole('button', { name: /Attack · Drop In/ })).toBeEnabled()
    G.players[0].energy = 1
    rerender(<R1Controls {...props} />)
    expect(screen.getByRole('button', { name: /Attack · Drop In/ })).toBeDisabled()
    expect(screen.getByText('Drop In requires at least 2 energy.', { selector: '#r1-drop-status' })).toBeInTheDocument()
    G.players[0].energy = 2
    G.currentMove = 'current_second'
    G.moved = true
    rerender(<R1Controls {...props} />)
    expect(screen.getByRole('button', { name: /Attack · Drop In/ })).toBeDisabled()
    expect(screen.getByText('Attack before moving.', { selector: '#r1-drop-status' })).toBeInTheDocument()
})

test('dice chooser limits risk to energy minus one and shows each pair result', () => {
    const ctx = { numPlayers: 2, currentPlayer: '0', random: { Number: () => 0, Shuffle: xs => xs.slice() } }
    const G = setupR1(ctx)
    G.turn = 2
    delete G.cells[1].player
    G.players[1].cellPosition = 14
    G.cells[14].player = { position: 1 }
    const setSelection = jest.fn()
    const props = { G, ctx, moves: {}, setSelection, onTarget: jest.fn(), selection: { kind: 'drop', diceCount: 1 } }
    const { rerender } = render(<R1Controls {...props} />)
    expect(screen.getByRole('button', { name: '1 die' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '2 dice' })).not.toBeInTheDocument()
    G.players[0].energy = 3
    rerender(<R1Controls {...props} />)
    fireEvent.click(screen.getByRole('button', { name: '2 dice' }))
    expect(setSelection).toHaveBeenCalledWith({ kind: 'drop', diceCount: 2 })
    G.atkDices = [6, 2]
    G.defDices = [5, 4]
    rerender(<R1Controls {...props} />)
    expect(screen.getByText('6 vs 5 — Defender −1')).toBeInTheDocument()
    expect(screen.getByText('2 vs 4 — Attacker −1')).toBeInTheDocument()
})

test('floating HUD selects and confirms immediate cards, while disabled cards remain inspectable', () => {
    const ctx = { numPlayers: 2, currentPlayer: '0', random: { Number: () => 0, Shuffle: xs => xs.slice() } }
    const G = setupR1(ctx)
    G.players[0].cards = createR1Deck().filter((c, i, a) => a.findIndex(x => x.Name === c.Name) === i)
    const moves = { useCard: jest.fn(), pass: jest.fn() }
    const setSelection = jest.fn()
    const props = { G, ctx, moves, selection: null, setSelection, onTarget: jest.fn() }
    const { rerender } = render(<R1Controls {...props} />)
    expect(screen.getByLabelText('R1 match controls')).toHaveClass('r1-floating-hud')
    expect(screen.getAllByRole('meter')[0]).toHaveAttribute('aria-valuenow', '2')
    const hand = screen.getByLabelText('Player 1 hand')
    const energyCard = within(hand).getByRole('button', { name: /Energy x2/ })
    fireEvent.click(energyCard)
    const index = G.players[0].cards.findIndex(c => c.Name === 'Energy x2')
    expect(setSelection).toHaveBeenCalledWith({ kind: 'card', index })
    expect(moves.useCard).not.toHaveBeenCalled()
    rerender(<R1Controls {...props} selection={{ kind: 'card', index }} />)
    fireEvent.click(screen.getByRole('button', { name: 'Use card' }))
    expect(moves.useCard).toHaveBeenCalledWith(index)
    expect(setSelection).toHaveBeenLastCalledWith(null)
    rerender(<R1Controls {...props} />)
    const attackCard = within(hand).getByRole('button', { name: /Big wave/ })
    expect(attackCard).toHaveAttribute('aria-disabled', 'true')
    setSelection.mockClear()
    fireEvent.click(attackCard)
    expect(setSelection).not.toHaveBeenCalled()
    expect(screen.queryByRole('button', { name: 'Use card' })).not.toBeInTheDocument()
    expect(screen.getByText('Opponent within 2 edges loses up to 2 energy (minimum 1 remaining).', { selector: '.r1-card-detail > span' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Hide cards' }))
    expect(screen.queryByLabelText('Player 1 hand')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Show cards' }))
    expect(screen.getByLabelText('Player 1 hand')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Move' }))
    expect(moves.pass).toHaveBeenCalledTimes(1)
})

test('a fallen opponent exposes a mandatory swap or keep decision, not movement', () => {
    const ctx = { numPlayers: 2, currentPlayer: '0', random: { Number: () => 0, Shuffle: xs => xs.slice() } }
    const G = setupR1(ctx)
    G.turn = 2
    G.players[1].energy = 0
    G.currentMove = 'swap_choice'
    G.pendingSwap = { targetPlayerId: 1, resumeMove: 'use_card' }
    const moves = { resolveSwap: jest.fn() }
    const props = { G, ctx, moves, selection: null, setSelection: jest.fn(), onTarget: jest.fn() }
    const { rerender } = render(<R1Controls {...props} />)
    const choice = screen.getByRole('group', { name: 'Position conquest' })
    expect(within(choice).getByText('Player 2 fell!')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Move', exact: true })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Attack · Drop In/ })).toBeDisabled()
    fireEvent.click(within(choice).getByRole('button', { name: 'Swap positions' }))
    fireEvent.click(within(choice).getByRole('button', { name: 'Keep position' }))
    expect(moves.resolveSwap.mock.calls).toEqual([[true], [false]])
    G.currentMove = 'swap_card'
    G.pendingSwap = null
    rerender(<R1Controls {...props} />)
    expect(screen.queryByRole('group', { name: 'Position conquest' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'End turn' })).toBeEnabled()
    expect(screen.getByText('Position conquered. Use one remaining non-movement card or end turn.')).toBeInTheDocument()
})
