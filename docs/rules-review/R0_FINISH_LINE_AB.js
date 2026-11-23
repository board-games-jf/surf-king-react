/** Iteration T — matched, randomized-start R0 finish-line arbitration A/B.
 * Run from repository root:
 * SK_FINISH_SEEDS=1000 node docs/rules-review/R0_FINISH_LINE_AB.js
 * This is experimental independent game design modeling, not app gameplay code.
 */
'use strict'
const assert=require('assert')
const {play}=require('./R0_FULL_MATCH_MODEL')
const samples=Number(process.env.SK_FINISH_SEEDS||1000)
assert(Number.isInteger(samples)&&samples>0&&samples<=20000)
const all=[]
for(const n of [2,4,7])for(const policy of ['balanced','aggressive'])for(const bonus of ['none','last1'])for(const finish of ['first','roundRandom','roundReverse','roundEnergy']){
 const slots=Array(n).fill(0),starts=Array(7).fill(0),positions=Array(7).fill(0)
 let finishes=0,rounds=0,falls=0,opponentActions=0,cofinish=0,firstFinishers=0,finalCount=0,integrity=0
 for(let seed=1;seed<=samples;seed++){
   const shift=(seed*13+Math.floor(seed/n))%n
   const g=play(n,seed,policy,shift,'fixed','random',bonus,finish)
   assert(g.finished)
   const orderIndex=(g.winner-shift+n)%n
   assert(orderIndex>=0&&orderIndex<n)
   slots[orderIndex]++;starts[g.startCells[g.winner]]++
   for(const id of g.startCells)positions[id]++
   rounds+=g.rounds;falls+=g.falls;opponentActions+=g.opponentActions
   cofinish+=Number(g.beachSameRound>=2);finalCount+=g.beachSameRound
   firstFinishers+=Number(g.winner===g.nominalFinishActor)
   integrity+=g.cardConservationChecks;finishes++
 }
 assert.strictEqual(finishes,samples)
 assert.strictEqual(slots.reduce((a,b)=>a+b,0),samples)
 all.push({n,policy,bonus,finish,games:samples,winPctByActingSlot:slots.map(c=>+(100*c/samples).toFixed(2)),
  winPctByStartingCell:starts.map((count,i)=>+(100*count/(positions[i]||1)).toFixed(2)),
  meanFinishingRound:+(rounds/samples).toFixed(3),
  pctSameRoundMultipleFinishers:+(100*cofinish/samples).toFixed(2),
  meanSameRoundFinishers:+(finalCount/samples).toFixed(3),
  pctWinnerWasFirstToArrive:+(100*firstFinishers/samples).toFixed(2),
  meanFalls:+(falls/samples).toFixed(3),
  meanOpponentActions:+(opponentActions/samples).toFixed(3),integrityChecks:integrity})
}
console.log(JSON.stringify({model:'R0 experimental first-vs-end-round finish',seeds:samples,games:all.reduce((s,r)=>s+r.games,0),results:all},null,2))
