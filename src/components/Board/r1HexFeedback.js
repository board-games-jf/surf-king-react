import { isBeach, r1DropTargets, r1MoveTargets, R1_ATTACK_RANGE, R1_PLACEMENT_RANGE } from '../../game/r1/SurfKingR1'
import { getTargetBlockStyle } from '../../map/contract/targetHighlight'
import { r1SelectionTargets } from './r1TargetHighlight'

const terrain = {
    Shark: { text: 'Ordinary entry costs 2 energy.', damage: 2 },
    Stone: { text: 'Ordinary entry costs 1 energy; Stone disappears.', damage: 1 },
    Storm: { text: 'Ordinary entry costs 1 energy; Storm remains.', damage: 1 },
    Cyclone: { text: 'Ordinary entry redirects to a random free neighbor, excluding the origin.' },
    Island: { text: 'Ordinary entry restores 2 energy (max 5); Island remains.' },
}

// Read-only presentation. All executable target decisions come from the engine.
export function getR1HexFeedback(G, ctx, id, selection, highlight = null) {
    if (!Number.isInteger(id) || !G.cells[id]) return null
    const cell = G.cells[id]
    const player = G.players[ctx.currentPlayer]
    const occupant = cell.player ? G.players[cell.player.position] : null
    const own = occupant?.position === player.position
    const name = cell.obstacle?.Name
    const effect = terrain[name]
    const title = name || (isBeach(id) ? 'Beach' : id < 7 ? 'Starting hex' : 'Open water')
    const occupantText = occupant ? (own ? 'Your surfer' : 'Player ' + (occupant.position + 1)) +
        ' · ' + occupant.energy + '/5 energy' +
        (isBeach(id) ? ' · Finished' : occupant.energy === 0 ? ' · Fallen' :
            occupant.activeCard.length ? ' · Protected' : '') : null
    let entry = effect?.text || (isBeach(id) ? 'Reach the beach to finish the race.' : 'No terrain penalty.')
    const card = selection?.kind === 'card' ? player.cards[selection.index]?.Name : null
    const legal = r1SelectionTargets(G, ctx, selection).includes(id)
    let action
    let status = 'blocked'
    if (G.winner != null) action = 'Match finished.'
    else if (legal) {
        status = 'ready'
        if (selection?.kind === 'drop') action = 'Click to attempt Drop In against Player ' + (occupant.position + 1) + '.'
        else if (R1_ATTACK_RANGE[card]) action = 'Click to use ' + card + ' on Player ' + (occupant.position + 1) + '.'
        else if (R1_PLACEMENT_RANGE[card]) action = 'Click to place ' + card + ' here.'
        else if (card === 'Jumping') {
            action = 'Click to jump here.'
            entry = 'Safe landing: ignore this terrain effect.'
        } else action = 'Click to move here.'
    } else if (G.currentMove === 'swap_choice') action = 'Choose whether to swap positions first.'
    else if (G.currentMove === 'recover') action = 'Recover before moving or attacking.'
    else if (own) action = 'You are here.'
    else if (selection?.kind === 'drop' || R1_ATTACK_RANGE[card]) {
        action = !occupant ? 'Choose a highlighted opponent.' :
            occupant.energy === 0 ? 'This opponent is fallen.' :
            isBeach(id) ? 'This opponent has finished.' :
            occupant.activeCard.length ? 'This opponent is protected.' :
            R1_ATTACK_RANGE[card] && occupant.energy === 1 ? 'Only Drop In can finish this opponent.' :
            'Not a valid target for this attack.'
    } else if (R1_PLACEMENT_RANGE[card]) action = occupant ? 'Occupied hex.' :
        name ? 'An obstacle is already here.' : id < 7 || isBeach(id) ? 'Place on a course hex only.' : 'Outside placement range.'
    else if (card === 'Jumping') action = occupant ? 'Occupied hex.' : !name ? 'Jumping requires a hazard.' : 'Choose an adjacent hazard.'
    else if (selection?.kind === 'card') action = 'Confirm the selected card first.'
    else if (occupant) {
        if (r1DropTargets(G, ctx).includes(id)) {
            status = 'preview'
            action = 'Select Drop In to attack this opponent.'
        } else action = 'Occupied hex.'
    } else if (G.currentMove === 'use_card' && r1MoveTargets({ ...G, currentMove: 'maneuver' }, ctx).includes(id)) {
        status = 'preview'
        action = 'Select Move first to enter this hex.'
    } else if (G.currentMove === 'swap_card') action = 'Movement already used; play a card or end turn.'
    else action = 'This hex is not available for movement now.'
    const block = highlight?.blocked?.find(item => item.id === id)
    if (block && !legal) {
        action = block.reason || getTargetBlockStyle(block.code).label
        status = 'blocked'
    } else if (!selection && highlight?.preview && highlight.kind !== 'move' && highlight.cellIds.includes(id)) {
        action = 'Select the card first.'
        status = 'preview'
    }
    const ordinaryMove = !selection && (legal || status === 'preview') && !occupant
    const risk = ordinaryMove && effect?.damage >= player.energy ? 'Entering will cause a fall.' : null
    return { id, title, entry, occupantText, action, status, risk, occupant: occupant ? { position: occupant.position, energy: occupant.energy } : null }
}
