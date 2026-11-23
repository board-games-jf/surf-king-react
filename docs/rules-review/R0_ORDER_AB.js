// Iteration O: one-variable fixed vs snake turn ordering R0 comparison.
// Run: node docs/rules-review/R0_ORDER_AB.js
const assert = require('assert')
const {play} = require('./R0_FULL_MATCH_MODEL')
const nSeeds = +(process.env.SK_ORDER_SEEDS || 1500)
assert(nSeeds > 0 && nSeeds <= 10000)
for (const n of [2,4,7]) {
 for (const policy of ['balanced','aggressive']) {
  for (const firstSeat of [0,n-1]) {
   const outcomes = {}
   for (const order of ['fixed','snake']) {
    const stats = {finished:0,firstWins:0,rounds:0,falls:0,opponentActions:0,cofinishes:0,blocked:0}
    for (let seed=1;seed<=nSeeds;seed++) {
     const g=play(n,seed,policy,firstSeat,order)
     assert(g.cardConservationChecks>=1)
     stats.finished+=Number(g.finished)
     stats.firstWins+=Number(g.winner===g.first)
     stats.rounds+=g.rounds
     stats.falls+=g.falls
     stats.opponentActions+=g.opponentActions
     stats.cofinishes+=Number(g.beachSameRound>=2)
     stats.blocked+=g.forcedBlocks
    }
    assert.equal(stats.finished,nSeeds)
    outcomes[order]={firstWinPct:+(100*stats.firstWins/nSeeds).toFixed(2),
      meanRounds:+(stats.rounds/nSeeds).toFixed(3),meanFalls:+(stats.falls/nSeeds).toFixed(3),
      meanOpponentActions:+(stats.opponentActions/nSeeds).toFixed(3),
      cofinishPct:+(100*stats.cofinishes/nSeeds).toFixed(2),
      meanForcedBlocks:+(stats.blocked/nSeeds).toFixed(3)}
   }
   console.log(JSON.stringify({players:n,policy,firstSeat,runsPerRule:nSeeds,results:outcomes}))
  }
 }
}
