import React from 'react'
import { render, screen, within, fireEvent, act } from '@testing-library/react'
import R1Controls from './R1Controls'
import { getR1HexFeedback } from './r1HexFeedback'
import { createR1Deck, setupR1 } from '../../game/r1/SurfKingR1'

test('shows distinct illustrations and current R1 effects, including Surf Current', () => {
    const ctx = { numPlayers: 2, currentPlayer: '0', random: { Number: () => 0, Shuffle: xs => xs.slice() } }
    const G = setupR1(ctx)
    const unique = createR1Deck().filter((card, index, cards) => cards.findIndex(c => c.Name === card.Name) === index)
    G.players[0].cards = unique
    render(<R1Controls G={G} ctx={ctx} moves={{}} selection={null} setSelection={() => {}} onTarget={() => {}} />)
    const hand = screen.getByLabelText('Player 1 hand')
    const buttons = within(hand).getAllByRole('button')
    expect(buttons).toHaveLength(14)
    const sources = buttons.map(button => button.querySelector('img').getAttribute('src'))
    expect(new Set(sources).size).toBe(14)
    expect(sources.every(src => src.endsWith('.webp'))).toBe(true)
    expect(buttons.every(button => button.hasAttribute('data-card-tone'))).toBe(true)
    const stone = within(hand).getByRole('button', { name: /Stone/ })
    expect(stone).toHaveAttribute('data-card-tone', 'obstacle')
    expect(stone.querySelector('.r1-card-effect')).toBeNull()
    expect(stone.querySelector('.r1-card-ready')).toBeNull()
    expect(stone).toHaveTextContent('the surfer who first enters normally loses 1 energy and Stone is removed')
    expect(within(hand).getByRole('button', { name: /Hang loose/i })).toHaveAttribute('data-card-tone', 'protection')
    expect(within(hand).getByRole('button', { name: /^Change\b/ })).toHaveAttribute('data-card-tone', 'jump')
    expect(within(hand).getByRole('button', { name: /Surf Current/ })).toHaveTextContent('Move up to two legal steps')
    expect(within(hand).getByRole('button', { name: /Island/ })).toHaveTextContent('every ordinary entry restores 2 energy; Island stays in place')
    expect(screen.getByLabelText('Round play order').querySelector('[aria-current="step"]')).toHaveAccessibleName(/Player 1/)
})

test('keyboard attack shortcut selects a legal opponent and explains blocked states', () => {
    const ctx = { numPlayers: 2, currentPlayer: '0', random: { Number: () => 0, Shuffle: xs => xs.slice() } }
    const G = setupR1(ctx)
    const setSelection = jest.fn()
    const onTarget = jest.fn()
    const props = { G, ctx, moves: {}, selection: null, setSelection, onTarget }
    const { rerender } = render(<R1Controls {...props} />)
    expect(screen.queryByRole('button', { name: /Attack · Drop In/ })).not.toBeInTheDocument()
    expect(screen.getByText('Attacks unlock in round 2.', { selector: '#r1-drop-status' })).toBeInTheDocument()
    G.turn = 2
    delete G.cells[1].player
    G.players[1].cellPosition = 14
    G.cells[14].player = { position: 1 }
    rerender(<R1Controls {...props} />)
    const attack = screen.getByRole('button', { name: 'Attack Player 2' })
    fireEvent.click(attack)
    expect(setSelection).toHaveBeenCalledWith({ kind: 'drop', diceCount: 1, targetCell: 14, targetPlayerId: 1 })
    rerender(<R1Controls {...props} selection={{ kind: 'drop', diceCount: 1 }} />)
    expect(screen.getByRole('button', { name: /Focus camera on Player 2/ })).toHaveAttribute('data-attack-target', 'true')
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Close attack selection' }))
    expect(setSelection).toHaveBeenLastCalledWith(null)
    fireEvent.click(screen.getByRole('button', { name: 'Attack Player 2' }))
    expect(onTarget).toHaveBeenCalledWith(14, 1)
    G.currentMove = 'maneuver'
    rerender(<R1Controls {...props} />)
    expect(screen.getByRole('button', { name: 'Attack Player 2' })).toBeEnabled()
    expect(screen.getByTitle('Card unavailable')).toBeInTheDocument()
    expect(screen.getByTitle('Drop In available')).toBeInTheDocument()
    expect(screen.getByText('Ends turn')).toBeInTheDocument()
    G.players[0].energy = 1
    rerender(<R1Controls {...props} />)
    expect(screen.queryByRole('button', { name: 'Attack Player 2' })).not.toBeInTheDocument()
    expect(screen.getByText('Drop In requires at least 2 energy.', { selector: '#r1-drop-status' })).toBeInTheDocument()
    G.players[0].energy = 2
    G.currentMove = 'current_second'
    G.moved = true
    rerender(<R1Controls {...props} />)
    expect(screen.queryByRole('button', { name: 'Attack Player 2' })).not.toBeInTheDocument()
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
    G.dropResult = { attackerId: 0, defenderId: 1, attackerLoss: 1, defenderLoss: 1 }
    rerender(<R1Controls {...props} />)
    expect(screen.getByTitle('Drop In available')).toBeInTheDocument()
    expect(within(screen.getByLabelText('Attacker, Player 1, 1 energy lost')).getByRole('meter')).toHaveAttribute('aria-valuenow', '3')
    expect(screen.getByLabelText('Attacker, Player 1, 1 energy lost').querySelectorAll('[data-lost="true"][data-filled]')).toHaveLength(1)
    expect(within(screen.getByLabelText('Defender, Player 2, 1 energy lost')).getByRole('meter')).toHaveAttribute('aria-valuenow', '2')
    expect(screen.getByLabelText('Attacker 6, defender 5, Defender −1')).toBeInTheDocument()
    expect(screen.getByLabelText('Attacker 6, defender 5, Defender −1').querySelectorAll('.r1-die:first-child .r1-die-pip[data-visible="true"]')).toHaveLength(6)
    expect(screen.getByLabelText('Attacker 6, defender 5, Defender −1').querySelectorAll('.r1-die:last-child .r1-die-pip[data-visible="true"]')).toHaveLength(5)
    expect(screen.getByLabelText('Attacker 2, defender 4, Attacker −1')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Close dice result' }))
    expect(screen.queryByLabelText('Drop In dice results')).not.toBeInTheDocument()
    rerender(<R1Controls {...props} />)
    expect(screen.queryByLabelText('Drop In dice results')).not.toBeInTheDocument()
    G.dropResult = { ...G.dropResult, id: 1, attackerLoss: 0 }
    rerender(<R1Controls {...props} />)
    expect(screen.getByLabelText('Attacker, Player 1, 0 energy lost').querySelector('.r1-dice-energy')).toBeNull()
    expect(screen.getByLabelText('Drop In dice results')).toBeInTheDocument()
})

test('a map-selected opponent remains selected when choosing dice', () => {
    const ctx = { numPlayers: 2, currentPlayer: '0', random: { Number: () => 0, Shuffle: xs => xs.slice() } }
    const G = setupR1(ctx)
    G.turn = 2
    G.players[0].energy = 3
    G.players[1].cellPosition = 4
    const setSelection = jest.fn()
    const onTarget = jest.fn()
    const selection = { kind: 'drop', diceCount: 1, targetCell: 4, targetPlayerId: 1 }
    render(<R1Controls G={G} ctx={ctx} moves={{}} selection={selection} setSelection={setSelection} onTarget={onTarget} />)
    fireEvent.click(screen.getByRole('button', { name: '2 dice' }))
    expect(setSelection).toHaveBeenCalledWith({ ...selection, diceCount: 2 })
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Drop In · Player 2' }))
    expect(onTarget).toHaveBeenCalledWith(4, 1)
})

test('floating HUD selects and confirms immediate cards, while disabled cards remain inspectable', () => {
    const ctx = { numPlayers: 2, currentPlayer: '0', random: { Number: () => 0, Shuffle: xs => xs.slice() } }
    const G = setupR1(ctx)
    G.players[0].cards = createR1Deck().filter((c, i, a) => a.findIndex(x => x.Name === c.Name) === i)
    const moves = { useCard: jest.fn(), pass: jest.fn(), quickManeuver: jest.fn() }
    const setSelection = jest.fn()
    const props = { G, ctx, moves, selection: null, setSelection, onTarget: jest.fn() }
    const { rerender } = render(<R1Controls {...props} />)
    expect(screen.getByLabelText('R1 match controls')).toHaveClass('r1-floating-hud')
    expect(screen.getByRole('button', { name: /Focus camera on Player 1, 2 of 5 energy/ })).toBeInTheDocument()
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
    expect(screen.getByText(/Opponent within 2 hexes loses up to 2 energy/, { selector: '.r1-card-detail .r1-card-description' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Hide cards' }))
    expect(screen.queryByLabelText('Player 1 hand')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Show cards' }))
    expect(screen.getByLabelText('Player 1 hand')).toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('button', { name: /Move to hex/ })[0])
    expect(moves.quickManeuver).toHaveBeenCalledTimes(1)
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
    expect(screen.queryByRole('button', { name: /Attack · Drop In/ })).not.toBeInTheDocument()
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

test('hover and keyboard focus instantly explain cards without selecting or playing them', () => {
    const ctx = { numPlayers: 2, currentPlayer: '0', random: { Number: () => 0, Shuffle: xs => xs.slice() } }
    const G = setupR1(ctx)
    G.players[0].cards = createR1Deck().filter((c, i, a) => a.findIndex(x => x.Name === c.Name) === i)
    const setSelection = jest.fn()
    const onPreviewCard = jest.fn()
    const moves = { useCard: jest.fn() }
    const props = { G, ctx, moves, selection: null, setSelection, onPreviewCard, onTarget: jest.fn() }
    render(<R1Controls {...props} />)
    const hand = screen.getByLabelText('Player 1 hand')
    const energy = within(hand).getByRole('button', { name: /Energy x2/ })
    fireEvent.mouseEnter(energy)
    expect(screen.getByRole('img', { name: 'Available' })).toBeInTheDocument()
    expect(screen.getByText('Your energy: 2 → 4 energy')).toBeInTheDocument()
    expect(screen.getByText('Select this card to continue.')).toBeInTheDocument()
    expect(onPreviewCard).toHaveBeenLastCalledWith(G.players[0].cards.find(c => c.Name === 'Energy x2').id)
    expect(setSelection).not.toHaveBeenCalled()
    expect(moves.useCard).not.toHaveBeenCalled()
    fireEvent.mouseLeave(energy)
    expect(onPreviewCard).toHaveBeenLastCalledWith(null)
    const attack = within(hand).getByRole('button', { name: /Big wave/ })
    fireEvent.focus(attack)
    expect(screen.getByRole('img', { name: 'Unavailable' })).toBeInTheDocument()
    expect(screen.getByText('Attacks unlock in round 2.', { selector: '.r1-blocked-reason' })).toBeInTheDocument()
    fireEvent.blur(attack)
    expect(onPreviewCard).toHaveBeenLastCalledWith(null)
})

test('compact hex panel exists only during inspection and pinned selection can be dismissed', () => {
    const ctx = { numPlayers: 2, currentPlayer: '0', random: { Number: () => 0, Shuffle: xs => xs.slice() } }
    const G = setupR1(ctx)
    const onClearHex = jest.fn()
    const props = { G, ctx, moves: {}, selection: null, setSelection: jest.fn(), onTarget: jest.fn(), onClearHex }
    const { rerender } = render(<R1Controls {...props}/>)
    expect(screen.queryByLabelText('Hex information')).not.toBeInTheDocument()
    const info = { id: 28, title: 'Shark', entry: 'Ordinary entry costs 2 energy.', status: 'ready', action: 'Click to move here.', risk: 'Entering will cause a fall.', occupant: null }
    rerender(<R1Controls {...props} hexFeedback={info}/>)
    const panel = screen.getByLabelText('Hex information')
    expect(within(panel).getByText('Shark')).toBeInTheDocument()
    expect(within(panel).getByText('−2 energy')).toBeInTheDocument()
    expect(within(panel).getByText('Fall risk')).toBeInTheDocument()
    expect(within(panel).getByText('Move here')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Close hex information' })).not.toBeInTheDocument()
    rerender(<R1Controls {...props} hexFeedback={info} pinnedHex/>)
    fireEvent.click(screen.getByRole('button', { name: 'Close hex information' }))
    expect(onClearHex).toHaveBeenCalledTimes(1)
    rerender(<R1Controls {...props}/>)
    expect(screen.queryByLabelText('Hex information')).not.toBeInTheDocument()
    expect(screen.queryByText('Round 1: no attacks.')).not.toBeInTheDocument()
})

test('unavailable attack inspection shows a general reason and stays pinned without selecting', () => {
    const ctx = { numPlayers: 3, currentPlayer: '0', random: { Number: () => 0, Shuffle: xs => xs.slice() } }
    const G = setupR1(ctx)
    G.turn = 2
    G.players[0].cards = createR1Deck().filter((c, i, a) => a.findIndex(x => x.Name === c.Name) === i)
    G.players[1].energy = 1
    delete G.cells[G.players[2].cellPosition].player
    G.players[2].cellPosition = 7
    G.cells[7].player = { position: 2 }
    G.players[2].activeCard = [{ Name: 'Amulet' }]
    const setSelection = jest.fn()
    const onPreviewCard = jest.fn()
    const moves = { useCard: jest.fn() }
    render(<R1Controls G={G} ctx={ctx} moves={moves} selection={null}
        setSelection={setSelection} onPreviewCard={onPreviewCard} onTarget={jest.fn()} />)
    const attack = within(screen.getByLabelText('Player 1 hand')).getByRole('button', { name: /Big wave/ })
    fireEvent.mouseEnter(attack)
    expect(screen.queryByLabelText('Blocked opponents')).not.toBeInTheDocument()
    expect(document.querySelector('.r1-blocked-reason')).toBeInTheDocument()
    fireEvent.click(attack)
    fireEvent.mouseLeave(attack)
    expect(screen.getByRole('button', { name: 'Close card information' })).toBeInTheDocument()
    expect(setSelection).not.toHaveBeenCalled()
    expect(moves.useCard).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Close card information' }))
    expect(onPreviewCard).toHaveBeenLastCalledWith(null)
})

test('two opponents sharing a hex can be selected independently; protection is individual', () => {
    const ctx = { numPlayers: 3, currentPlayer: '0', random: { Number: () => 0, Shuffle: xs => xs.slice() } }
    const G = setupR1(ctx)
    G.turn = 2
    G.players[1].cellPosition = 7
    G.players[2].cellPosition = 7
    const onTarget = jest.fn()
    const props = { G, ctx, moves: {}, selection: { kind: 'drop', diceCount: 1 }, setSelection: jest.fn(), onTarget }
    const { rerender } = render(<R1Controls {...props}/>)
    fireEvent.click(screen.getByRole('button', { name: 'Attack Player 2' }))
    fireEvent.click(screen.getByRole('button', { name: 'Attack Player 3' }))
    expect(onTarget).toHaveBeenNthCalledWith(1, 7, 1)
    expect(onTarget).toHaveBeenNthCalledWith(2, 7, 2)
    G.players[2].activeCard = [{ Name: 'Hang loose' }]
    rerender(<R1Controls {...props}/>)
    expect(screen.getByRole('button', { name: 'Attack Player 2' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Attack Player 3' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Focus camera on Player 3.*Drop In shield/ })).toBeInTheDocument()
})

test('shared hex panel shows terrain and both independent surfer details together', () => {
    const ctx = { numPlayers: 3, currentPlayer: '0', random: { Number: () => 0, Shuffle: xs => xs.slice() } }
    const G = setupR1(ctx)
    G.turn = 2
    G.players[0].cards = createR1Deck().filter(c => c.Name === 'Big wave').slice(0, 1)
    G.players[1].cellPosition = G.players[2].cellPosition = 7
    G.players[1].energy = 1
    G.players[2].energy = 4
    G.players[2].activeCard = [{ Name: 'Amulet' }]
    G.cells[7].obstacle = { Name: 'Island' }
    const selection = { kind: 'card', index: 0 }
    render(<R1Controls G={G} ctx={ctx} moves={{}} selection={selection} setSelection={jest.fn()} onTarget={jest.fn()}
        hexFeedback={getR1HexFeedback(G, ctx, 7, selection)} pinnedHex/>)
    const panel = within(screen.getByLabelText('Hex information'))
    expect(panel.getByText('Island')).toBeInTheDocument()
    expect(panel.getByText('+2 energy')).toBeInTheDocument()
    expect(panel.getByText('2/2 surfers · Full')).toBeInTheDocument()
    const p2 = within(panel.getByRole('group', { name: 'Player 2 details' }))
    const p3 = within(panel.getByRole('group', { name: 'Player 3 details' }))
    expect(p2.getByRole('meter')).toHaveAttribute('aria-valuenow', '1')
    expect(p3.getByRole('meter')).toHaveAttribute('aria-valuenow', '4')
    expect(p2.getByText('1 energy · Drop In only')).toBeInTheDocument()
    expect(p3.getByText('Amulet · Protected')).toBeInTheDocument()
    expect(p3.getByText('Amulet')).toBeInTheDocument()
})

test('shows the draw and discard piles and allows inspecting discarded cards', () => {
    const ctx = { numPlayers: 2, currentPlayer: '0', random: { Number: () => 0, Shuffle: xs => xs.slice() } }
    const G = setupR1(ctx)
    G.discardedCards.push(G.deck.pop(), G.deck.pop())
    render(<R1Controls G={G} ctx={ctx} moves={{}} selection={null} setSelection={() => {}} onTarget={() => {}} />)
    expect(screen.getByLabelText(`Draw pile: ${G.deck.length} cards`)).toBeInTheDocument()
    const discard = screen.getByRole('button', { name: /Discard 2/ })
    fireEvent.click(discard)
    expect(screen.getByLabelText('Discarded cards')).toHaveTextContent(G.discardedCards[0].Name)
    expect(screen.getByLabelText('Discarded cards')).toHaveTextContent('shuffled on the next draw')
    fireEvent.click(discard)
    expect(screen.queryByLabelText('Discarded cards')).not.toBeInTheDocument()
})

test('shows the actual terrain energy loss when a new event arrives', () => {
    const ctx = { numPlayers: 2, currentPlayer: '0', random: { Number: () => 0, Shuffle: xs => xs.slice() } }
    const G = setupR1(ctx)
    const props = { G, ctx, moves: {}, selection: null, setSelection: () => {}, onTarget: () => {} }
    const { rerender } = render(<R1Controls {...props} />)
    G.terrainEnergyEvent = { id: 1, playerId: 0, source: 'Shark', amount: 1 }
    rerender(<R1Controls {...props} />)
    expect(screen.getByRole('status', { name: 'Terrain energy loss' })).toHaveTextContent('Player 1 · Shark · −1 energy')
})

test('animates the discard returning to the deck when a draw reshuffles it', () => {
    jest.useFakeTimers()
    const ctx = { numPlayers: 2, currentPlayer: '0', random: { Number: () => 0, Shuffle: xs => xs.slice() } }
    const G = setupR1(ctx)
    G.discardedCards = G.deck.splice(0)
    const props = { G, ctx, moves: {}, selection: null, setSelection: () => {}, onTarget: () => {} }
    const { rerender } = render(<R1Controls {...props} />)
    expect(screen.getByLabelText('Card piles')).toHaveAttribute('data-reshuffling', 'false')
    G.deck = G.discardedCards.splice(0)
    rerender(<R1Controls {...props} />)
    expect(screen.getByLabelText('Card piles')).toHaveAttribute('data-reshuffling', 'true')
    act(() => { jest.runOnlyPendingTimers() })
    expect(screen.getByLabelText('Card piles')).toHaveAttribute('data-reshuffling', 'false')
    jest.useRealTimers()
})

test('Stone inspection explains the effect, available locations and next step', () => {
    const ctx = { numPlayers: 2, currentPlayer: '0', random: { Number: () => 0, Shuffle: xs => xs.slice() } }
    const G = setupR1(ctx)
    G.players[0].cards = [createR1Deck().find(card => card.Name === 'Stone')]
    const props = { G, ctx, moves: {}, selection: null, setSelection: jest.fn(), onTarget: jest.fn() }
    const { rerender } = render(<R1Controls {...props} />)
    const stone = within(screen.getByLabelText('Player 1 hand')).getByRole('button', { name: /Stone/ })
    fireEvent.mouseEnter(stone)
    expect(screen.getByText(/Place within 3 hexes; the surfer who first enters normally loses 1 energy/, { selector: '.r1-card-description' })).toBeInTheDocument()
    expect(screen.queryByText(/\d+ available hexes/)).not.toBeInTheDocument()
    expect(screen.getByText('Select this card to continue.')).toBeInTheDocument()
    rerender(<R1Controls {...props} selection={{ kind: 'card', index: 0 }} />)
    expect(screen.getByText('Choose a highlighted hex.')).toBeInTheDocument()
})


test('player indicators focus their own surfer without selecting a game action', () => {
    const ctx = { numPlayers: 2, currentPlayer: '0', random: { Number: () => 0, Shuffle: xs => xs.slice() } }
    const G = setupR1(ctx)
    const focus = jest.fn(), selection = jest.fn(), target = jest.fn()
    render(<R1Controls G={G} ctx={ctx} moves={{}} selection={null} setSelection={selection} onTarget={target} onFocusPlayer={focus} />)
    const player = screen.getByRole('button', { name: /Focus camera on Player 2/ })
    expect(player.querySelectorAll('.r1-player-energy-segments [data-filled="true"]')).toHaveLength(G.players[1].energy)
    expect(player.querySelectorAll('.r1-player-energy-segments [data-filled]')).toHaveLength(5)
    fireEvent.click(player)
    fireEvent.click(player)
    expect(focus).toHaveBeenCalledTimes(2)
    expect(focus).toHaveBeenCalledWith(1)
    expect(selection).not.toHaveBeenCalled()
    expect(target).not.toHaveBeenCalled()
})

test('Island feedback shows the real gain and explains a full energy meter', () => {
    const ctx = { numPlayers: 2, currentPlayer: '0', random: { Number: () => 0, Shuffle: xs => xs.slice() } }
    const G = setupR1(ctx)
    const props = { G, ctx, moves: {}, selection: null, setSelection: () => {}, onTarget: () => {} }
    const { rerender } = render(<R1Controls {...props} />)
    G.terrainEnergyEvent = { id: 1, playerId: 0, source: 'Island', amount: 1, direction: 'gain' }
    rerender(<R1Controls {...props} />)
    expect(screen.getByRole('status', { name: 'Terrain energy gain' })).toHaveTextContent('Island · +1 energy')
    G.terrainEnergyEvent = { id: 2, playerId: 0, source: 'Island', amount: 0, direction: 'gain' }
    rerender(<R1Controls {...props} />)
    expect(screen.getByRole('status', { name: 'Terrain energy gain' })).toHaveTextContent('Energy full (5/5)')
})


test('selected card can be deselected from its details', () => {
    const ctx = { numPlayers: 2, currentPlayer: '0', random: { Number: () => 0, Shuffle: xs => xs.slice() } }
    const G = setupR1(ctx)
    G.turn = 2
    G.players[0].cards = [createR1Deck().find(card => card.Name === 'Energy x2')]
    const setSelection = jest.fn()
    const moves = { pass: jest.fn() }
    const props = { G, ctx, moves, selection: { kind: 'card', index: 0 }, setSelection, onTarget: jest.fn() }
    const { rerender } = render(<R1Controls {...props} />)
    expect(screen.queryByRole('button', { name: 'Move' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Attack · Drop In/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Deselect card' }))
    expect(setSelection).toHaveBeenCalledWith(null)
    expect(moves.pass).not.toHaveBeenCalled()
    rerender(<R1Controls {...props} selection={null} />)
    expect(screen.getAllByRole('button', { name: /Move to hex/ }).length).toBeGreaterThan(0)
})


test('inspecting another card temporarily hides the selected card targets', () => {
    const ctx = { numPlayers: 3, currentPlayer: '0', random: { Number: () => 0, Shuffle: xs => xs.slice() } }
    const G = setupR1(ctx)
    G.turn = 2
    G.players[1].cellPosition = 7
    G.players[2].cellPosition = 7
    const deck = createR1Deck()
    G.players[0].cards = [deck.find(card => card.Name === 'Big wave'), deck.find(card => card.Name === 'Amulet')]
    const setSelection = jest.fn()
    render(<R1Controls G={G} ctx={ctx} moves={{}} selection={{ kind: 'card', index: 0 }} setSelection={setSelection} onTarget={jest.fn()} />)
    expect(screen.getByRole('button', { name: 'Attack Player 2' })).toBeInTheDocument()
    const amulet = within(screen.getByLabelText('Player 1 hand')).getByRole('button', { name: /Amulet/ })
    fireEvent.mouseEnter(amulet)
    expect(screen.getByText('Select this card to switch.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Attack Player 2' })).not.toBeInTheDocument()
    expect(setSelection).not.toHaveBeenCalled()
    fireEvent.mouseLeave(amulet)
    expect(screen.getByRole('button', { name: 'Attack Player 2' })).toBeInTheDocument()
})


test('players who have played show a check in the round order', () => {
    const ctx = { numPlayers: 2, currentPlayer: '1', random: { Number: () => 0, Shuffle: xs => xs.slice() } }
    const G = setupR1(ctx)
    G.order = [0, 1]
    G.completedInRound = 1
    render(<R1Controls G={G} ctx={ctx} moves={{}} selection={null} setSelection={() => {}} onTarget={() => {}} />)
    const played = screen.getByRole('button', { name: /Focus camera on Player 1.*played/ })
    expect(played.querySelector('.r1-player-played')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Focus camera on Player 2.*current turn/ }).querySelector('.r1-player-played')).toBeNull()
})


test('single occupant does not repeat the same blocked reason as a hex action', () => {
    const ctx = { numPlayers: 2, currentPlayer: '0', random: { Number: () => 0, Shuffle: xs => xs.slice() } }
    const G = setupR1(ctx)
    const hexFeedback = { id: 7, title: 'Water', entry: '', action: 'Only Drop In can finish this opponent.', status: 'blocked', occupants: [{ position: 1, energy: 1, blocked: '1 energy · Drop In only' }] }
    render(<R1Controls G={G} ctx={ctx} moves={{}} selection={null} setSelection={() => {}} onTarget={() => {}} hexFeedback={hexFeedback}/>)
    const panel = screen.getByLabelText('Hex information')
    expect(within(panel).queryByText('1 energy · Drop In only')).not.toBeInTheDocument()
    expect(panel.querySelector('.r1-hex-action')).toHaveTextContent('Drop In only')
})


test('single eligible occupant uses the hex action instead of repeating target status', () => {
    const ctx = { numPlayers: 2, currentPlayer: '0', random: { Number: () => 0, Shuffle: xs => xs.slice() } }
    const G = setupR1(ctx)
    const hexFeedback = { id: 7, title: 'Water', entry: '', action: 'Click to use this attack.', status: 'ready', occupants: [{ position: 1, energy: 2, eligible: true }] }
    render(<R1Controls G={G} ctx={ctx} moves={{}} selection={null} setSelection={() => {}} onTarget={() => {}} hexFeedback={hexFeedback}/>)
    const panel = screen.getByLabelText('Hex information')
    expect(within(panel).queryByText('Eligible target')).not.toBeInTheDocument()
    expect(panel.querySelector('.r1-hex-action')).toHaveTextContent('Attack here')
})


test('single protected opponent shows Amulet only once in the hex action', () => {
    const ctx = { numPlayers: 2, currentPlayer: '0', random: { Number: () => 0, Shuffle: xs => xs.slice() } }
    const G = setupR1(ctx)
    const hexFeedback = { id: 7, title: 'Water', entry: '', action: 'This opponent is protected.', status: 'blocked', occupants: [{ position: 1, energy: 2, states: ['Amulet · Protected'], blocked: 'Amulet' }] }
    render(<R1Controls G={G} ctx={ctx} moves={{}} selection={null} setSelection={() => {}} onTarget={() => {}} hexFeedback={hexFeedback}/>)
    const panel = screen.getByLabelText('Hex information')
    expect(within(panel).getAllByText('Amulet · Protected')).toHaveLength(1)
    expect(panel.querySelector('.r1-hex-action')).toHaveTextContent('Amulet · Protected')
    expect(within(panel).queryByText('Amulet', { exact: true })).not.toBeInTheDocument()
})

test('round header uses actual shuffled order and only completed turns have checks', () => {
    const ctx = { numPlayers: 3, currentPlayer: '0', random: { Number: () => 0, Shuffle: xs => xs.slice() } }
    const G = setupR1(ctx)
    G.order = [2, 0, 1]
    G.completedInRound = 1
    render(<R1Controls G={G} ctx={ctx} moves={{}} selection={null} setSelection={() => {}} onTarget={() => {}}/>)
    const header = screen.getByLabelText('Round status')
    expect(header).not.toHaveTextContent('SURF KING')
    expect(header).toHaveTextContent('2/3')
    expect(within(header).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1')
    const players = within(screen.getByLabelText('Round play order')).getAllByRole('button')
    expect(players.map(p => p.querySelector('.r1-sidebar-turn-label').textContent)).toEqual(['Turn completed','Playing now','Waiting'])
    expect(players[0].querySelector('.r1-player-played')).toBeInTheDocument()
    expect(players[1].querySelector('.r1-player-played')).toBeNull()
    expect(players[2].querySelector('.r1-player-played')).toBeNull()
})
test('card rail distinguishes availability from confirmed use; repeat Drop In is not completion', () => {
    const ctx = { numPlayers: 2, currentPlayer: '0', random: { Number: () => 0, Shuffle: xs => xs.slice() } }
    const G = setupR1(ctx)
    G.turn = 2
    G.players[1].cellPosition = 14
    G.players[0].cards = [createR1Deck().find(card => card.Name === 'Energy x2')]
    const props = { G, ctx, moves: {}, selection: null, setSelection: () => {}, onTarget: () => {} }
    const { rerender } = render(<R1Controls {...props}/>)
    expect(screen.getByTitle('Card available')).toHaveAttribute('data-state', 'available')
    expect(screen.getByTitle('Drop In available')).toHaveAttribute('data-state', 'available')
    G.currentMove = 'maneuver'
    rerender(<R1Controls {...props}/>)
    expect(screen.getByTitle('Card unavailable')).toHaveAttribute('data-state', 'unavailable')
    G.cardVisualEvent = { playerId: 0, round: 2, turnSlot: 0, name: 'Energy x2' }
    rerender(<R1Controls {...props}/>)
    expect(screen.getByTitle('Card used')).toHaveAttribute('data-state', 'used')
    expect(screen.getByTitle('Drop In available')).toHaveAttribute('data-state', 'available')
    G.turn = 3
    rerender(<R1Controls {...props}/>)
    expect(screen.getByTitle('Card unavailable')).toHaveAttribute('data-state', 'unavailable')
})

test('dice chooser shows target-specific qualitative advantage for each legal choice', () => {
    const ctx = { numPlayers: 2, currentPlayer: '0', random: { Number: () => 0, Shuffle: xs => xs.slice() } }
    const G = setupR1(ctx)
    G.turn = 2
    G.players[0].energy = 3
    G.players[1].cellPosition = 14
    G.players[1].energy = 2
    const props = { G, ctx, moves: {}, selection: { kind: 'drop', diceCount: 1, targetCell: 14, targetPlayerId: 1 }, setSelection: jest.fn(), onTarget: jest.fn() }
    const { rerender } = render(<R1Controls {...props}/>)
    expect(screen.getByRole('button', { name: '1 die' })).toHaveTextContent('Unfavorable')
    expect(screen.getByRole('button', { name: '2 dice' })).toHaveTextContent('Balanced')
    G.players[1].energy = 1
    rerender(<R1Controls {...props}/>)
    expect(screen.getByRole('button', { name: '2 dice' })).toHaveTextContent('Favorable')
    expect(screen.getByRole('button', { name: '2 dice' })).toHaveTextContent('Up to ⚡−1')
    G.players[0].energy = 2
    rerender(<R1Controls {...props}/>)
    expect(screen.queryByRole('button', { name: '2 dice' })).toBeNull()
})
