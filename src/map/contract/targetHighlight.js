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
    protected: { shortLabel: 'Amulet', color: '#c4b0ff', label: 'Amulet', symbol: 'shield' },
    hangloose: { shortLabel: 'Hang Loose', color: '#9bf4d4', label: 'Hang Loose · Drop In blocked', symbol: 'shield' },
    samecell: { shortLabel: 'Same hex', color: '#b0c5ce', label: 'Already in the same hex', symbol: 'cross' },
    minimum: { shortLabel: '1 energy', color: '#ffcc82', label: '1 energy · Drop In only', symbol: 'one' },
    range: { shortLabel: 'Out of range', color: '#b0c5ce', label: 'Out of range', symbol: 'cross' },
    fallen: { shortLabel: 'Fallen', color: '#b0c5ce', label: 'Fallen', symbol: 'cross' },
    finished: { shortLabel: 'Finished', color: '#b0c5ce', label: 'Finished', symbol: 'cross' },
    phase: { shortLabel: 'Attack locked', color: '#b0c5ce', label: 'Attack unavailable', symbol: 'cross' },
    unavailable: { shortLabel: 'Unavailable', color: '#b0c5ce', label: 'Unavailable', symbol: 'cross' },
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

// Two contiguous, non-overlapping halves of the same hex perimeter. Both
// renderers use the same vertex order; the final vertex closes the perimeter.
export function getMixedTargetBorderPaths(radius) {
    const vertices = Array.from({ length: 6 }, (_, i) => [
        Math.cos(i * Math.PI / 3) * radius, Math.sin(i * Math.PI / 3) * radius,
    ])
    return [vertices.slice(0, 4), [...vertices.slice(3), vertices[0]]]
}
