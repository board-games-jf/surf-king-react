// Shared presentation palette; renderers consume IDs, never game rules.
export const TARGET_HIGHLIGHT_STYLES = {
    move: { color: '#9bf4d4', label: 'Move' },
    placement: { color: '#ffd27c', label: 'Place obstacle' },
    attack: { color: '#ff9882', label: 'Attack' },
    jump: { color: '#d4baff', label: 'Jumping' },
}
export function getTargetHighlightStyle(kind) {
    return TARGET_HIGHLIGHT_STYLES[kind] || null
}

export const TARGET_BLOCK_STYLES = {
    protected: { color: '#c4b0ff', label: 'Amulet', symbol: 'shield' },
    hangloose: { color: '#9bf4d4', label: 'Hang Loose · Drop In blocked', symbol: 'shield' },
    samecell: { color: '#b0c5ce', label: 'Already in the same hex', symbol: 'cross' },
    minimum: { color: '#ffcc82', label: '1 energy · Drop In only', symbol: 'one' },
    range: { color: '#b0c5ce', label: 'Out of range', symbol: 'cross' },
    fallen: { color: '#b0c5ce', label: 'Fallen', symbol: 'cross' },
    finished: { color: '#b0c5ce', label: 'Finished', symbol: 'cross' },
    phase: { color: '#b0c5ce', label: 'Attack unavailable', symbol: 'cross' },
    unavailable: { color: '#b0c5ce', label: 'Unavailable', symbol: 'cross' },
}
export function getTargetBlockStyle(code) {
    return TARGET_BLOCK_STYLES[code] || TARGET_BLOCK_STYLES.unavailable
}

// Normalized icon strokes shared by SVG and WebGL.
export const TARGET_BLOCK_SYMBOL_PATHS = {
    shield: [[[.5,.16],[.79,.27],[.75,.58],[.64,.75],[.5,.85],[.36,.75],[.25,.58],[.21,.27],[.5,.16]]],
    one: [[[.35,.35],[.5,.21],[.5,.78]],[[.32,.78],[.68,.78]]],
    cross: [[[.28,.28],[.72,.72]],[[.72,.28],[.28,.72]]],
}
