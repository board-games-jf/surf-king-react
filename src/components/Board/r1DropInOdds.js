// Exact fair-d6 enumeration of the current sorted pairwise R1 duel.
import { DROP_IN_MAX_DICE, r1MaxAttackDice } from '../../game/r1/SurfKingR1'
const rolls = n => n === 1 ? Array.from({ length: 6 }, (_, i) => [i + 1]) :
    Array.from({ length: 36 }, (_, i) => [Math.floor(i / 6) + 1, i % 6 + 1].sort((a, b) => b - a))
function enumerate(a, d) {
    const outcomes = { favorable: 0, balanced: 0, unfavorable: 0, mutual: 0, noDamage: 0, total: 0 }
    const transitions = new Map()
    for (const attack of rolls(a)) for (const defense of rolls(d)) {
        let own = 0, opponent = 0
        for (let i = 0; i < Math.min(a, d); i++) {
            if (attack[i] > defense[i]) opponent++
            else if (attack[i] < defense[i]) own++
        }
        outcomes.total++
        const key = own + ':' + opponent
        transitions.set(key, (transitions.get(key) || 0) + 1)
        if (own && opponent) outcomes.mutual++
        if (!own && !opponent) outcomes.noDamage++
        outcomes[opponent > own ? 'favorable' : own > opponent ? 'unfavorable' : 'balanced']++
    }
    return { ...outcomes, transitions }
}
const table = Object.fromEntries([1, 2].flatMap(a => [1, 2].map(d => [a + ':' + d, enumerate(a, d)])))
const memo = new Map()
// Probability of a knockdown before the attacker reaches one energy, assuming
// uninterrupted repeated attacks with the maximum legal dice on later rolls.
function repeatedChance(attacker, defender) {
    if (defender <= 0) return 1
    if (attacker < 2) return 0
    const key = attacker + ':' + defender
    if (memo.has(key)) return memo.get(key)
    const dice = r1MaxAttackDice(attacker), defense = Math.min(DROP_IN_MAX_DICE, defender)
    const outcomes = table[dice + ':' + defense]
    let sum = 0
    for (const [losses, frequency] of outcomes.transitions) {
        const [own, opponent] = losses.split(':').map(Number)
        if (own || opponent) sum += frequency * repeatedChance(attacker - own, defender - opponent)
    }
    const chance = sum / (outcomes.total - outcomes.noDamage)
    memo.set(key, chance)
    return chance
}

// The chosen count applies to the first roll; subsequent attempts use max dice.
export function getDropInAdvantage(attackerEnergy, defenderEnergy, count) {
    const defense = Math.min(DROP_IN_MAX_DICE, defenderEnergy)
    if (!Number.isInteger(attackerEnergy) || !Number.isInteger(defenderEnergy) || !Number.isInteger(count) || count < 1 || count > r1MaxAttackDice(attackerEnergy) || !Number.isInteger(defense) || defense < 1) return null
    const outcomes = table[count + ':' + defense]
    let sum = 0
    for (const [losses, frequency] of outcomes.transitions) {
        const [own, opponent] = losses.split(':').map(Number)
        sum += frequency * repeatedChance(attackerEnergy - own, defenderEnergy - opponent)
    }
    const position = sum / outcomes.total
    const tone = Math.abs(position - .5) < 1e-10 ? 'balanced' : position > .5 ? 'favorable' : 'unfavorable'
    return { ...outcomes, position, tone, maxLoss: Math.min(count, defense), dice: count, defenseDice: defense }
}
