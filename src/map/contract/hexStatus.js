// Presentation-only terrain and status vocabulary shared by both views and inspection.
export const HEX_STATUS_COLORS = { danger: '#ff6868', occupied: '#a5eee0', full: '#ffd080', blocked: '#a6bdc1' }
// Shared normalized line art for both 2D and 3D marine medallions.
export const HEX_HAZARD_GLYPHS = {
    Shark: [[[.23,.57],[.32,.42],[.47,.28],[.68,.22],[.59,.40],[.64,.57],[.23,.57]],[[.22,.69],[.34,.64],[.46,.70],[.58,.64],[.70,.69],[.78,.66]]],
    Stone: [[[.22,.70],[.37,.39],[.47,.48],[.59,.28],[.78,.70],[.22,.70]],[[.37,.39],[.49,.62],[.59,.28]]],
    Storm: [[[.25,.49],[.23,.40],[.32,.33],[.42,.33],[.48,.24],[.60,.25],[.68,.34],[.76,.37],[.78,.47],[.70,.51],[.25,.49]],[[.51,.53],[.39,.66],[.52,.66],[.43,.80],[.64,.60],[.51,.60]]],
    Cyclone: [[[.24,.40],[.36,.28],[.56,.24],[.72,.33],[.78,.48],[.68,.65],[.51,.72],[.35,.65],[.32,.50],[.42,.40],[.57,.40],[.63,.49],[.55,.57],[.47,.53]]],
}
export const HEX_TERRAIN = {
    Shark: { text: 'Ordinary entry costs 2 energy.', damage: 2, hazard: true },
    Stone: { text: 'Ordinary entry costs 1 energy; Stone disappears.', damage: 1, hazard: true },
    Storm: { text: 'Ordinary entry costs 1 energy; Storm remains.', damage: 1, hazard: true },
    Cyclone: { text: 'Ordinary entry redirects to a random free neighbor, excluding the origin.', hazard: true },
    Island: { text: 'Ordinary entry restores 2 energy (max 5); Island remains.' },
}

// Legality is supplied by the engine-derived highlight. A full cell blocks
// ordinary entry, not attacks; a per-player rejection never hides a legal option.
export function getHexStatus({ id, terrain, count, capacity, energy, highlight }) {
    const primary = !!highlight?.cellIds?.includes(id)
    const attack = !!highlight?.attackCellIds?.includes(id)
    const move = primary && highlight.kind === 'move'
    const safeJump = primary && highlight.kind === 'jump'
    const effect = HEX_TERRAIN[terrain]
    const danger = !!effect?.hazard && !safeJump
    const full = count >= capacity
    const rejected = (highlight?.blocked || []).some(item => item.id === id && item.playerId == null)
    return { id, terrain, count, capacity, full, danger, activeDanger: danger && move,
        lethal: danger && move && effect.damage >= energy,
        blocked: !primary && !attack && rejected,
        entryDamage: danger && move ? effect.damage || 0 : 0 }
}

// A shared smooth 1.8 s pulse and expanding local water ripple.
export function sampleHexDanger(elapsed, reduced) {
    if (reduced) return { opacity: .75, scale: .69, rippleOpacity: .16 }
    const phase = ((elapsed % 1.8) + 1.8) % 1.8 / 1.8
    return { opacity: .55 + .4 * (.5 - .5 * Math.cos(phase * Math.PI * 2)),
        scale: .48 + .34 * phase, rippleOpacity: .3 * (1 - phase) }
}
