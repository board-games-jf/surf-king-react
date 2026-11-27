// Exact fair-d6 enumeration of the current sorted pairwise R1 duel.
import { DROP_IN_MAX_DICE, r1MaxAttackDice } from '../../game/r1/SurfKingR1'
const rolls = n => n === 1 ? Array.from({ length: 6 }, (_, i) => [i + 1]) :
    Array.from({ length: 36 }, (_, i) => [Math.floor(i / 6) + 1, i % 6 + 1].sort((a, b) => b - a))
function enumerate(a, d) {
    const outcomes = { favorable: 0, balanced: 0, unfavorable: 0, mutual: 0, noDamage: 0, total: 0 }
    for (const attack of rolls(a)) for (const defense of rolls(d)) {
        let own = 0, opponent = 0
        for (let i = 0; i < Math.min(a, d); i++) {
            if (attack[i] > defense[i]) opponent++
            else if (attack[i] < defense[i]) own++
        }
        outcomes.total++
        if (own && opponent) outcomes.mutual++
        if (!own && !opponent) outcomes.noDamage++
        outcomes[opponent > own ? 'favorable' : own > opponent ? 'unfavorable' : 'balanced']++
    }
    return outcomes
}
const table = Object.fromEntries([1, 2].flatMap(a => [1, 2].map(d => [a + ':' + d, enumerate(a, d)])))
// Share of favorable among unequal net-energy outcomes, not a win probability.
export function getDropInAdvantage(attackerEnergy, defenderEnergy, count) {
    const defense = Math.min(DROP_IN_MAX_DICE, defenderEnergy)
    if (!Number.isInteger(count) || count < 1 || count > r1MaxAttackDice(attackerEnergy) || !Number.isInteger(defense) || defense < 1) return null
    const outcomes = table[count + ':' + defense]
    const decisive = outcomes.favorable + outcomes.unfavorable
    const position = decisive ? outcomes.favorable / decisive : .5
    const tone = outcomes.favorable === outcomes.unfavorable ? 'balanced' : outcomes.favorable > outcomes.unfavorable ? 'favorable' : 'unfavorable'
    return { ...outcomes, position, tone, maxLoss: Math.min(count, defense), dice: count, defenseDice: defense }
}
