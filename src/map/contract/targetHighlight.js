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
