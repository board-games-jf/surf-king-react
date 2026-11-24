import {
    MAX_ENERGY, R1_ATTACK_RANGE, R1_PLACEMENT_RANGE, isBeach,
    r1CardPlayable, r1CardTargets, r1MoveTargets, r1AttackUnavailableReason, r1AttackTargetBlocks, r1CardPlayerTargets, CHANGE_RANGE,
} from '../../game/r1/SurfKingR1'

// Presentation only: never change the game or infer a legal target independently.
export function getR1CardFeedback(G, ctx, index) {
    const player = G.players[ctx.currentPlayer]
    const card = player?.cards[index]
    if (!card) return null
    const name = card.Name
    const change = name === 'Change'
    const attack = change ? CHANGE_RANGE : R1_ATTACK_RANGE[name]
    const targetKind = change ? 'change' : 'card'
    const placement = R1_PLACEMENT_RANGE[name]
    const kind = attack ? 'attack' : placement ? 'placement' : name === 'Jumping' ? 'jump' : 'move'
    const playable = G.winner == null && r1CardPlayable(G, ctx, index)
    const targets = playable ? r1CardTargets(G, ctx, index) : []
    const playerIds = playable ? r1CardPlayerTargets(G, ctx, index) : []
    const previewIds = playable && name === 'Surf Current' ?
        r1MoveTargets({ ...G, currentMove: 'current_first' }, ctx) :
        playable && ['Energy x2', 'Lifeguard float', 'Amulet', 'Hang loose'].includes(name) ? [player.cellPosition] : targets
    let reason = null
    if (!playable) {
        if (G.winner != null) reason = 'Match finished.'
        else if (G.currentMove === 'swap_choice') reason = 'Choose whether to swap positions first.'
        else if (isBeach(player.cellPosition)) reason = 'You have reached the beach.'
        else if (name === 'Lifeguard float' && player.energy > 0) reason = 'Only usable after falling.'
        else if (G.currentMove === 'recover' || player.energy === 0) reason = 'Recover before playing this card.'
        else if (G.currentMove === 'swap_card' && ['Jumping', 'Surf Current', 'Change'].includes(name)) reason = 'Your swap already used your movement.'
        else if (!['use_card', 'swap_card'].includes(G.currentMove)) reason = 'Card phase is over.'
        else if (attack) reason = r1AttackUnavailableReason(G, ctx, attack, targets, targetKind)
        else if (name === 'Energy x2' && player.energy >= MAX_ENERGY) reason = 'Energy already full (5/5).'
        else if (['Amulet', 'Hang loose'].includes(name)) reason = 'You are already protected.'
        else if (placement) reason = 'No free obstacle-free course hex within ' + placement + ' edges.'
        else if (name === 'Jumping') reason = 'No unoccupied adjacent hazard.'
        else if (name === 'Surf Current') reason = 'No free neighboring hex.'
        else reason = 'Card unavailable in this phase.'
    }
    let action = null
    if (playable) {
        if (attack) action = playerIds.map(id => 'Player ' + (id + 1)).join(', ')
        else if (placement || name === 'Jumping') action = targets.length + ' valid ' + (targets.length === 1 ? 'hex' : 'hexes')
        else if (name === 'Surf Current') action = previewIds.length + ' possible first ' + (previewIds.length === 1 ? 'step' : 'steps')
        else if (name === 'Energy x2') action = player.energy + ' → ' + Math.min(MAX_ENERGY, player.energy + 2) + ' energy'
        else if (name === 'Lifeguard float') action = '0 → 3 energy'
        else if (name === 'Amulet') action = 'Protected until your next turn'
        else if (name === 'Hang loose') action = 'No Drop In until your next turn'
    }
    const blocked = attack ? r1AttackTargetBlocks(G, ctx, attack, targets, targetKind, playerIds) : []
    return { playable, reason, kind, targets, playerIds, previewIds, action, blocked }
}
