/** Iteration V: crossed start-hex × acting-slot validation under R0.
 *
 * Run in a repo checkout:
 *   SK_CROSS_SEEDS=14000 SK_CROSS_OFFSET=3500 node docs/rules-review/R0_START_ORDER_CROSSTAB.js
 *
 * R0 independent full-card model ONLY. No application engine, official probabilities,
 * accepted rules, or human tabletop outcome.
 */
'use strict'
const assert=require('assert')
const {play}=require('./R0_FULL_MATCH_MODEL')
const seeds=Number(process.env.SK_CROSS_SEEDS||14000)
const offset=Number(process.env.SK_CROSS_OFFSET||3500)
const populations=(process.env.SK_CROSS_PLAYERS||'7').split(',').map(Number)
const policies=(process.env.SK_CROSS_POLICIES||'balanced,aggressive').split(',')
const variants=(process.env.SK_CROSS_VARIANTS||'base,inner2,inner2Last2').split(',')
assert(Number.isInteger(seeds)&&seeds>=1&&seeds<=30000)
assert(Number.isInteger(offset)&&offset>=0)
assert(populations.every(n=>[2,4,7].includes(n)))
const scenarios={
 base:{openingBonus:'last1',positionComp:'none'},
 inner2:{openingBonus:'last1',positionComp:'inner2'},
 inner2Last2:{openingBonus:'lastPlus2',positionComp:'inner2'}
}
assert(variants.every(v=>scenarios[v]))
const pct=(a,b)=>b?+(100*a/b).toFixed(2):null
const avg=(a,b)=>b?+(a/b).toFixed(3):null
const output=[]
for(const n of populations)for(const policy of policies)for(const variant of variants){
 const options=scenarios[variant],wins=Array.from({length:n},()=>Array(7).fill(0))
 const seen=Array.from({length:n},()=>Array(7).fill(0))
 const falls=Array.from({length:n},()=>Array(7).fill(0))
 const targeted=Array.from({length:n},()=>Array(7).fill(0))
 const bySlot=Array(n).fill(0),byCell=Array(7).fill(0)
 let rounds=0,actions=0,coFinish=0,checks=0
 for(let z=1;z<=seeds;z++){
  const seed=offset+z
  const shift=(seed*13+Math.floor(seed/n))%n
  const g=play(n,seed,policy,shift,'fixed','random',options.openingBonus,'roundEnergy',options.positionComp)
  assert(g.finished,'match did not finish')
  assert.strictEqual(new Set(g.startCells).size,n)
  assert(g.cardConservationChecks>=n)
  const winnerSlot=(g.winner-shift+n)%n
  const winningCell=g.startCells[g.winner]
  bySlot[winnerSlot]++;byCell[winningCell]++;wins[winnerSlot][winningCell]++
  for(let slot=0;slot<n;slot++){
   const p=(slot+shift)%n,cell=g.startCells[p]
   seen[slot][cell]++
   falls[slot][cell]+=g.fallsBySeat[p]
   targeted[slot][cell]+=g.targeted[p]
  }
  rounds+=g.rounds;actions+=g.opponentActions
  coFinish+=Number(g.beachSameRound>=2)
  checks+=g.cardConservationChecks
 }
 assert.strictEqual(bySlot.reduce((a,b)=>a+b,0),seeds)
 assert.strictEqual(seen.flat().reduce((a,b)=>a+b,0),seeds*n)
 assert(seen.every(row=>row.every(x=>x>0)),'missing actor-by-cell coverage')
 // Rates are conditional on BOTH the action slot and starting cell being allocated.
 const cross=seen.map((row,slot)=>row.map((count,cell)=>({
   played:count,wins:wins[slot][cell],winPct:pct(wins[slot][cell],count),
   meanFalls:avg(falls[slot][cell],count),meanIncomingTactics:avg(targeted[slot][cell],count)
 })))
 const selected=cross.flatMap((row,slot)=>row.map((v,cell)=>({...v,slot:slot+1,cell})))
 const minimum=selected.reduce((a,b)=>a.winPct<b.winPct?a:b)
 const maximum=selected.reduce((a,b)=>a.winPct>b.winPct?a:b)
 output.push({n,policy,variant,openingBonus:options.openingBonus,positionComp:options.positionComp,
   seeds,offset,firstSeed:offset+1,lastSeed:offset+seeds,
   byActingSlotPct:bySlot.map(v=>pct(v,seeds)),
   byStartingCellConditionalPct:byCell.map((v,c)=>pct(v,seen.reduce((sum,row)=>sum+row[c],0))),
   minCombo:minimum,maxCombo:maximum,
   sampleCountMin:Math.min(...selected.map(v=>v.played)),
   sampleCountMax:Math.max(...selected.map(v=>v.played)),
   numberCombinationsUnder5Pct:selected.filter(v=>v.winPct<5).length,
   numberCombinationsWithZeroWins:selected.filter(v=>v.wins===0).length,
   meanRounds:avg(rounds,seeds),meanOpponentFacingActions:avg(actions,seeds),
   coFinishPct:pct(coFinish,seeds),integrityChecks:checks,
   // Rows: first-acting, second-acting, ... last-acting. Columns: cells 0..6.
   cross})
}
console.log(JSON.stringify({experiment:'R0 starting-cell × acting-slot fixed-round-order',seeds,offset,gameExecutions:output.length*seeds,results:output},null,2))
