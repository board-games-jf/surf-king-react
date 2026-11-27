import { isBeach, r1DropTargets, r1MoveTargets, R1_ATTACK_RANGE, R1_PLACEMENT_RANGE, r1Occupants, HEX_CAPACITY, r1PlayerCard, r1DropPlayerTargets, r1CardPlayerTargets } from '../../game/r1/SurfKingR1'
import { getTargetBlockStyle } from '../../map/contract/targetHighlight'
import { getR1TargetHighlight, r1SelectionTargets } from './r1TargetHighlight'

import { HEX_TERRAIN as terrain } from '../../map/contract/hexStatus'

// Read-only presentation. All executable target decisions come from the engine.
export function getR1HexFeedback(G, ctx, id, selection, highlight = null) {
    if (!Number.isInteger(id) || !G.cells[id]) return null
    highlight = highlight || getR1TargetHighlight(G, ctx, selection)
    const cell = G.cells[id]
    const player = G.players[ctx.currentPlayer]
    const occupants = r1Occupants(G, id)
    const full = occupants.length >= HEX_CAPACITY
    const playerIds = selection?.kind === 'drop' ? r1DropPlayerTargets(G, ctx) : selection?.kind === 'card' ? r1CardPlayerTargets(G, ctx, selection.index) : []
    const legalOccupants = occupants.filter(p => playerIds.includes(p.position))
    const occupant = legalOccupants[0] || occupants.find(p => p.position !== player.position) || occupants[0] || null
    const own = occupant?.position === player.position
    const name = cell.obstacle?.Name
    const effect = terrain[name]
    const title = name || (isBeach(id) ? 'Beach' : id < 7 ? 'Starting hex' : 'Open water')
    const occupantText = occupant ? (own ? 'Your surfer' : 'Player ' + (occupant.position + 1)) +
        ' · ' + occupant.energy + '/5 energy' +
        (isBeach(id) ? ' · Finished' : occupant.energy === 0 ? ' · Fallen' :
            occupant.activeCard.some(c => c.Name === 'Amulet') ? ' · Protected' : occupant.activeCard.some(c => c.Name === 'Hang loose') ? ' · Drop In shield' : '') : null
    let entry = effect?.text || (isBeach(id) ? 'First to reach the beach wins immediately.' : 'No terrain penalty.')
    const card = selection?.kind === 'card' ? player.cards[selection.index]?.Name : null
    const legal = r1SelectionTargets(G, ctx, selection).includes(id)
    let action
    let status = 'blocked'
    if (G.winner != null) action = 'Match finished.'
    else if (legal) {
        status = 'ready'
        if (legalOccupants.length > 1) action = 'Choose a player.'
        else if (selection?.kind === 'drop') action = 'Click to attempt Drop In against Player ' + (occupant.position + 1) + '.'
        else if (r1PlayerCard(card)) action = 'Click to use ' + card + ' on Player ' + (occupant.position + 1) + '.'
        else if (R1_PLACEMENT_RANGE[card]) action = 'Click to place ' + card + ' here.'
        else if (card === 'Jumping') {
            action = 'Click to jump here.'
            entry = 'Safe landing: ignore this terrain effect.'
        } else action = 'Click to move here.'
    } else if (G.currentMove === 'swap_choice') action = 'Choose whether to swap positions first.'
    else if (G.currentMove === 'recover') action = 'Recover before moving or attacking.'
    else if (own) action = 'You are here.'
    else if (selection?.kind === 'drop' || r1PlayerCard(card)) {
        action = !occupant ? 'Choose a highlighted opponent.' :
            occupant.energy === 0 ? 'This opponent is fallen.' :
            isBeach(id) ? 'This opponent has finished.' :
            occupant.activeCard.some(c => c.Name === 'Amulet') ? 'This opponent is protected.' :
            selection?.kind === 'drop' && occupant.activeCard.some(c => c.Name === 'Hang loose') ? 'Hang Loose blocks Drop In.' :
            card === 'Change' && occupant.cellPosition === player.cellPosition ? 'Already in the same hex.' :
            R1_ATTACK_RANGE[card] && occupant.energy === 1 ? 'Only Drop In can finish this opponent.' :
            'Not a valid target for this attack.'
    } else if (R1_PLACEMENT_RANGE[card]) action = occupant ? 'Occupied hex.' :
        name ? 'An obstacle is already here.' : id < 7 || isBeach(id) ? 'Place on a course hex only.' : 'Outside placement range.'
    else if (card === 'Jumping') action = full ? 'Hex full.' : !name ? 'Jumping requires a hazard.' : 'Choose an adjacent hazard.'
    else if (selection?.kind === 'card') action = 'Confirm the selected card first.'
    else if (occupant && r1DropTargets(G, ctx).includes(id)) {
        status = 'preview'
        action = 'Select Drop In to attack this opponent.'
    } else if (full) action = 'Hex full.'
    else if (G.currentMove === 'use_card' && r1MoveTargets({ ...G, currentMove: 'maneuver' }, ctx).includes(id)) {
        status = 'preview'
        action = 'Select this hex to move.'
    } else if (G.currentMove === 'swap_card') action = 'Movement already used; play a card or end turn.'
    else action = 'This hex is not available for movement now.'
    const blocks = highlight?.blocked?.filter(item => item.id === id) || []
    const block = blocks.length === 1 ? blocks[0] : null
    if (blocks.length > 1 && !legal && !highlight?.cellIds.includes(id)) {
        action = 'No eligible opponents here.'
        status = 'blocked'
    } else if (block && !legal && !highlight?.cellIds.includes(id) && (occupants.length > 1 || !selection || block.reason)) {
        action = block.reason || getTargetBlockStyle(block.code).label
        status = 'blocked'
    } else if (!selection && highlight?.preview && highlight.kind !== 'move' && highlight.cellIds.includes(id)) {
        action = 'Select the card first.'
        if (highlight.kind === 'jump') entry = 'Safe landing: ignore this terrain effect.'
        status = 'preview'
    }
    const ordinaryMove = !selection && (legal || status === 'preview') && !full && !own && (!highlight || highlight.kind === 'move')
    const risk = ordinaryMove && effect?.damage >= player.energy ? 'Entering will cause a fall.' : null
    return { id, title, entry, occupantText, action, status, risk, full, occupants: occupants.map(p => {
        const rejected = highlight?.blocked?.find(b => b.playerId === p.position)
        const states = [
            G.winner === p.position ? 'Winner' : isBeach(id) ? 'Finished' : p.energy === 0 ? 'Fallen' : null,
            p.activeCard.some(c => c.Name === 'Amulet') ? 'Amulet · Protected' : null,
            p.activeCard.some(c => c.Name === 'Hang loose') ? 'Hang Loose · Drop In shield' : null,
        ].filter(Boolean)
        return {
            position: p.position, energy: p.energy, text: p.position === player.position ? 'Your surfer' : 'Player ' + (p.position + 1),
            states,
            eligible: p.position !== player.position && (playerIds.includes(p.position) || !!highlight?.playerIds?.includes(p.position)),
            blocked: rejected ? rejected.reason || getTargetBlockStyle(rejected.code).label : null,
        }
    }), occupant: occupant ? { position: occupant.position, energy: occupant.energy } : null }
}
