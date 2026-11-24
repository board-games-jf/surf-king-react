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
