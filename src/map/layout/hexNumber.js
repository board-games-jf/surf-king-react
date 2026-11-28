// Display only. Stable engine IDs remain the sole action and snapshot identity.
// Number active cells in canonical ascending ID order, regardless of mask order.
export function hexNumber(id, activeCellIds) {
    if (!Number.isInteger(id) || id < 0 || id >= 53) return null
    if (!activeCellIds) return id + 1
    if (!activeCellIds.includes(id)) return null
    return 1 + new Set(activeCellIds.filter(other => other < id)).size
}
