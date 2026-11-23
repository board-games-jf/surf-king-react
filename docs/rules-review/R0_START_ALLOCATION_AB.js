/** Iteration W — position allocation vs initiative, exact 53-cell full B60 R0 model.
 *
 * In repository checkout:
 *   SK_ALLOC_SEEDS=14000 SK_ALLOC_OFFSET=17500 SK_ALLOC_PLAYERS=7 node docs/rules-review/R0_START_ALLOCATION_AB.js
 *
 * Experimental design ONLY. There is no human choice in reverseTier; it is a
 * seeded greedy Shark-free route choice, NOT Catan's actual placement rule.
 */
'use strict'
const assert=require('assert')
const {play}=require('./R0_FULL_MATCH_MODEL')
const seeds=Number(process.env.SK_ALLOC_SEEDS||10000)
const offset=Number(process.env.SK_ALLOC_OFFSET||17500)
const populations=(process.env.SK_ALLOC_PLAYERS||'2,4,7').split(',').map(Number)
const policies=(process.env.SK_ALLOC_POLICIES||'balanced,aggressive').split(',')
const allocations=(process.env.SK_ALLOC_MODES||'random,lateSafe1,lateSafe2,reverseTier').split(',')
assert(Number.isInteger(seeds)&&seeds>0&&seeds<=30000)
assert(Number.isInteger(offset)&&offset>=0)
assert(populations.every(n=>[2,4,7].includes(n)))
assert(policies.every(x=>['balanced','aggressive'].includes(x)))
assert(allocations.every(x=>['random','lateSafe1','lateSafe2','reverseTier'].includes(x)))
const pct=(v,denom)=>denom?+(100*v/denom).toFixed(2):null
const avg=(v,denom)=>denom?+(v/denom).toFixed(3):null
const results=[]
for(const n of populations)for(const policy of policies)for(const allocation of allocations){
 const wins=Array(n).fill(0),byCellWin=Array(7).fill(0),byCellCount=Array(7).fill(0)
 const jointWins=Array.from({length:n},()=>Array(7).fill(0))
 const jointCount=Array.from({length:n},()=>Array(7).fill(0))
 let rounds=0,falls=0,actions=0,coFinish=0,checks=0,draws=0,distinctSets=new Set(),safeStartsInLastTwo=0
 const positionComp=n===2?'none':(process.env.SK_ALLOC_COMP||'inner2')
 assert(['none','inner1','inner2'].includes(positionComp),'unsupported position compensation')
 for(let z=1;z<=seeds;z++){
   const seed=offset+z
   const shift=(seed*13+Math.floor(seed/n))%n
   const g=play(n,seed,policy,shift,'fixed',allocation,'last1','roundEnergy',positionComp)
   assert(g.finished,'uncompleted match')
   assert.strictEqual(new Set(g.startCells).size,n,'overlapping starts')
   assert(g.startCells.every(cell=>Number.isInteger(cell)&&cell>=0&&cell<7),'off-board start')
   const startForActingSlot=slot=>g.startCells[(shift+slot)%n]
   if(allocation==='lateSafe1')assert(startForActingSlot(n-1)>=4,'last actor must have a Shark-free seven-move start')
   if(allocation==='lateSafe2'||allocation==='reverseTier'){
     for(let slot=n-2;slot<n;slot++)assert(startForActingSlot(slot)>=4,'last two should receive the safer start tier')
   }
   if(allocation==='reverseTier'){
     const reserved=Math.min(3,n)
     for(let slot=n-reserved;slot<n;slot++)assert(startForActingSlot(slot)>=4,'reverse-tier draft safe picks')
     if(n===7)for(let slot=0;slot<n-reserved;slot++)assert(startForActingSlot(slot)<=3,'reverse-tier early picks')
   }
   if(n===7)assert.strictEqual(new Set(g.startCells).size,7,'all seven positions should appear')
   assert(g.cardConservationChecks>=n,'missing invariant checks')
   const lastCell=g.startCells[(shift+n-1)%n]
   const extra=([1,2].includes(lastCell)?({none:0,inner1:1,inner2:2}[positionComp]):0)
   assert.strictEqual(g.openingCardCounts[(shift+n-1)%n],3+extra,'last opening hand size')
   const winnerSlot=(g.winner-shift+n)%n
   const winningCell=g.startCells[g.winner]
   wins[winnerSlot]++;byCellWin[winningCell]++
   for(let slot=0;slot<n;slot++){
     const player=(slot+shift)%n,start=g.startCells[player]
     jointCount[slot][start]++;byCellCount[start]++
     if(slot>=n-2&&start>=4)safeStartsInLastTwo++
   }
   jointWins[winnerSlot][winningCell]++
   distinctSets.add(g.startCells.slice().sort((a,b)=>a-b).join(','))
   rounds+=g.rounds;falls+=g.falls;actions+=g.opponentActions
   coFinish+=Number(g.beachSameRound>=2);checks+=g.cardConservationChecks;draws+=g.draws
 }
 assert.strictEqual(wins.reduce((x,y)=>x+y,0),seeds)
 assert.strictEqual(byCellCount.reduce((x,y)=>x+y,0),n*seeds)
 assert(jointCount.every((row)=>row.reduce((x,y)=>x+y,0)===seeds))
 const combinations=jointCount.flatMap((row,slot)=>row.map((v,cell)=>({
   slot:slot+1,cell,seen:v,wins:jointWins[slot][cell],winPct:pct(jointWins[slot][cell],v)
 })))
 const supported=combinations.filter(item=>item.seen>=Math.min(100,Math.max(1,Math.floor(seeds/20))))
 const max=supported.reduce((x,y)=>y.winPct>x.winPct?y:x)
 const min=supported.reduce((x,y)=>y.winPct<x.winPct?y:x)
 results.push({
   n,policy,allocation,compensation:positionComp,openingBonus:'last1',
   games:seeds,seedStart:offset+1,seedEnd:offset+seeds,
   actorWinPct:wins.map(x=>pct(x,seeds)),
   cellConditionalWinPct:byCellWin.map((x,c)=>pct(x,byCellCount[c])),
   actorCellAllowedCounts:jointCount.map(row=>row.filter(x=>x>0).length),
   actorCellSampleSizes:jointCount,
   actorCellWinRates:combinations.map(x=>x.winPct),
   worstSupportedCombo:min,bestSupportedCombo:max,
   supportedCombos:supported.length,allPossibleActorCellCombos:n*7,
   averageLateTwoSafeStarts:avg(safeStartsInLastTwo,seeds),
   distinctUnorderedStartingCellSets:distinctSets.size,
   meanRounds:avg(rounds,seeds),meanFalls:avg(falls,seeds),
   meanOpponentActions:avg(actions,seeds),coFinishPct:pct(coFinish,seeds),
   meanDraws:avg(draws,seeds),cardConservationChecks:checks
 })
}
console.log(JSON.stringify({experiment:'R0 start allocation × initiative fairness',seeds,offset,totalExecutions:results.length*seeds,results},null,2))
