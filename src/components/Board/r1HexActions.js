import { r1MoveTargets, r1DropPlayerTargets, r1AttackTargetBlocks, r1MaxAttackDice, DROP_IN_RANGE } from '../../game/r1/SurfKingR1'
import { getDropInAdvantage } from './r1DropInOdds'
import { HEX_TERRAIN } from '../../map/contract/hexStatus'
import { getTargetBlockStyle } from '../../map/contract/targetHighlight'

// All availability is queried from the engine, including at confirmation time.
export function getR1HexActions(G, ctx, id) {
    if (!G.cells[id] || G.winner != null) return []
    const actor = G.players[ctx.currentPlayer]
    if (!actor) return []
    const moveState = G.currentMove === 'use_card' ? { ...G, currentMove: 'maneuver' } : G
    const options = []
    if (r1MoveTargets(moveState, ctx).includes(id)) {
        const terrain = G.cells[id].obstacle?.Name
        const effect = HEX_TERRAIN[terrain]
        const damage = effect?.damage || 0
        const risk = damage >= actor.energy && damage > 0 ? 'Entering will cause a fall.' : effect?.hazard ? effect.text : null
        options.push({ key: 'move', kind: 'move', label: 'Move',
            cost: damage ? '−' + damage + ' energy' : terrain === 'Island' ? (actor.energy === 5 ? 'Energy full' : '+' + Math.min(2, 5 - actor.energy) + ' energy') : 'Free',
            detail: risk || (G.currentMove === 'current_first' ? 'First Surf Current step · second step if available' : 'End turn after movement'),
            risky: !!effect?.hazard, lethal: damage >= actor.energy && damage > 0 })
    }
    const targets = r1DropPlayerTargets(G, ctx)
    const maxDice = r1MaxAttackDice(actor.energy)
    for (const playerId of targets.filter(pid => G.players[pid].cellPosition === id)) {
        options.push({ key: 'drop-' + playerId, kind: 'drop', playerId,
            label: 'Drop In · Player ' + (playerId + 1),
            odds: getDropInAdvantage(actor.energy, G.players[playerId].energy, maxDice),
            detail: 'Choose dice next', risky: false })
    }
    return options
}

export function getR1HexDropBlocks(G, ctx, id) {
    const targets = r1DropPlayerTargets(G, ctx)
    return r1AttackTargetBlocks(G, ctx, DROP_IN_RANGE, [], 'drop', targets)
        .filter(item => item.id === id)
        .map(item => ({ playerId: item.playerId, reason: item.reason || getTargetBlockStyle(item.code).label }))
}

// Placement uses the map viewport, never the page coordinates. On compact
// screens prefer the larger vertical gap; a bounded bottom sheet is fallback.
export function placeHexInspector(width, height, x, y, polygon) {
    const margin = 8, gap = 72
    const panelWidth = Math.max(0, Math.min(326, width - 2 * margin))
    const maxHeight = Math.max(0, Math.min(460, height - 2 * margin))
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v))
    x = clamp(x, 0, width); y = clamp(y, 0, height)
    const anchor = (left, top, side) => {
        if (!polygon?.length) return { anchorX: x, anchorY: y }
        const target = { x: side === 'right' ? left : side === 'left' ? left + panelWidth : clamp(x, left, left + panelWidth), y: side === 'below' ? top : side === 'above' ? top + 36 : top + 36 }
        let closest = null, best = Infinity
        polygon.forEach((a, i) => {
            const b = polygon[(i + 1) % polygon.length], dx = b.x - a.x, dy = b.y - a.y
            const t = clamp(((target.x - a.x) * dx + (target.y - a.y) * dy) / (dx * dx + dy * dy || 1), 0, 1)
            const p = { x: a.x + t * dx, y: a.y + t * dy }
            const distance = (p.x - target.x) ** 2 + (p.y - target.y) ** 2
            if (distance < best) { best = distance; closest = p }
        })
        return { anchorX: closest.x, anchorY: closest.y }
    }
    if (width - x - gap - margin >= panelWidth || x - gap - margin >= panelWidth) {
        const right = width - x - gap - margin >= panelWidth
        const left = right ? x + gap : x - gap - panelWidth, top = clamp(y - 76, margin, height - maxHeight - margin), side = right ? 'right' : 'left'
        return { left, top, width: panelWidth, maxHeight, side, ...anchor(left, top, side) }
    }
    const above = y - gap - margin, below = height - y - gap - margin
    const available = Math.max(above, below)
    const left = clamp(x - panelWidth / 2, margin, width - panelWidth - margin)
    if (available >= 132) {
        const h = Math.min(maxHeight, available)
        const top = below >= above ? y + gap : y - gap - h, side = below >= above ? 'below' : 'above'
        return { left, top, width: panelWidth, maxHeight: h, side, ...anchor(left, top, side) }
    }
    const h = Math.min(maxHeight, Math.max(0, height * .62))
    return { left, top: Math.max(margin, height - h - margin), width: panelWidth, maxHeight: h, side: 'sheet' }
}
