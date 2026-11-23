/** Surf King R1 — isolated 17/12/10-type deck comparison with full 60-card identities.
 *
 * Reproduce from repo root:
 * SK_DECK_SEEDS=2500 SK_DECK_OFFSET=155000 SK_DECK_PLAYERS=2,4,7 node docs/rules-review/R0_MINIMAL_DECK_AB.js
 *
 * All card semantics and scripted tactics live in R0_FULL_MATCH_MODEL.js;
 * no app code, production rules, or human behavior are represented.
 */
'use strict'
const assert=require('assert')
const {play,deckTypes}=require('./R0_FULL_MATCH_MODEL')
const profiles=(process.env.SK_DECK_PROFILES||'b60,lite12,lite10').split(',')
const players=(process.env.SK_DECK_PLAYERS||'2,4,7').split(',').map(Number)
const policies=(process.env.SK_DECK_POLICIES||'balanced,aggressive').split(',')
const seeds=+(process.env.SK_DECK_SEEDS||2500)
const offset=+(process.env.SK_DECK_OFFSET||155000)
assert(Number.isInteger(seeds)&&seeds>0&&seeds<=30000)
assert(Number.isInteger(offset)&&offset>=0)
assert(profiles.every(x=>['b60','lite12','lite10','lite10Guard','lite10Active'].includes(x)))
assert(players.every(n=>Number.isInteger(n)&&n>=2&&n<=7))
assert(policies.every(x=>['balanced','aggressive'].includes(x)))
const avg=(v,n)=>+(v/n).toFixed(3),pct=(v,n)=>+(100*v/n).toFixed(2)
const results=[]
for(const n of players)for(const policy of policies)for(const profile of profiles){
 const counts=deckTypes(profile)
 assert.strictEqual(Object.values(counts).reduce((a,b)=>a+b,0),60)
 assert.strictEqual(Object.keys(counts).length,{b60:17,lite12:12,lite10:10,lite10Guard:10,lite10Active:10}[profile])
 const slotWins=Array(n).fill(0),byCell=Array(7).fill(0),cellSeen=Array(7).fill(0)
 const joint=Array.from({length:n},()=>Array(7).fill(0))
 const jointWins=Array.from({length:n},()=>Array(7).fill(0))
 const totals={rounds:0,turns:0,falls:0,playerFalls:0,sharkFalls:0,steals:0,draws:0,
   attackActions:0,opponentActions:0,rescue:0,forcedBlocks:0,noTactic:0,
   twoOrMoreOnBeach:0,preFirstFalls:0,openingAttacks:0,
   usedCardEffects:0, cardEffectsPlayed:0, checks:0, dropIns:0,
   rescueFree:0,rescueFin:0,rescueFloat:0}
 const used=Object.fromEntries(Object.keys(counts).map(t=>[t,0]))
 for(let k=1;k<=seeds;k++){
   const seed=offset+k,shift=(seed*13+Math.floor(seed/n))%n
   const g=play(n,seed,policy,shift,'rotate','random','none','roundEnergy','none','none','restricted','off',profile)
   assert(g.finished,'match incomplete')
   assert.strictEqual(new Set(g.startCells).size,n,'duplicate starts')
   assert.strictEqual(g.preFirstFalls,0,'pre-turn fall despite protected first round')
   assert.strictEqual(g.openingAttacks,0,'round-one attack despite protected first round')
   assert.strictEqual(g.deckProfile,profile)
   assert.deepEqual(g.deckCounts,counts,'mismatched physical deck')
   assert(g.cardConservationChecks>=n,'integrity checks missing')
   slotWins[(g.winner-shift+n)%n]++
   for(let slot=0;slot<n;slot++){
     const cell=g.startCells[(slot+shift)%n]
     joint[slot][cell]++
     cellSeen[cell]++
   }
   jointWins[(g.winner-shift+n)%n][g.startCells[g.winner]]++
   byCell[g.startCells[g.winner]]++
   const fields={rounds:g.rounds,turns:g.totalTurns,falls:g.falls,playerFalls:g.playerFalls,
     sharkFalls:g.sharkFalls,steals:g.stolen,draws:g.draws,attackActions:g.attackActions,
     opponentActions:g.opponentActions,rescue:g.rescue,forcedBlocks:g.forcedBlocks,noTactic:g.noTactic,
     twoOrMoreOnBeach:Number(g.beachSameRound>=2),preFirstFalls:g.preFirstFalls,
     openingAttacks:g.openingAttacks,checks:g.cardConservationChecks,dropIns:g.dropIns,
     rescueFree:g.rescueChoices.free,rescueFin:g.rescueChoices.fin,rescueFloat:g.rescueChoices.float}
   for(const [field,value] of Object.entries(fields))totals[field]+=value
   const effectTypes=Object.keys(g.uses).filter(t=>g.uses[t]>0)
   totals.usedCardEffects+=effectTypes.length
   for(const [t,count] of Object.entries(g.uses)){
     assert(Object.hasOwn(counts,t),'obsolete card played '+t)
     used[t]+=count;totals.cardEffectsPlayed+=count
   }
 }
 assert.strictEqual(slotWins.reduce((a,b)=>a+b,0),seeds)
 assert.strictEqual(joint.flat().reduce((a,b)=>a+b,0),seeds*n)
 if(seeds>=300)assert(joint.every(row=>row.every(x=>x>0)),'uncovered actor × starting cell pair')
 const combos=joint.flatMap((row,slot)=>row.map((seen,cell)=>({
   slot:slot+1,cell,seen,wins:jointWins[slot][cell],winPct:seen?pct(jointWins[slot][cell],seen):null
 })))
 const valid=combos.filter(x=>x.seen>=Math.max(1,Math.floor(seeds/(n*7*2))))
 const worst=valid.reduce((a,b)=>a.winPct<b.winPct?a:b)
 const best=valid.reduce((a,b)=>a.winPct>b.winPct?a:b)
 results.push({n,policy,profile,seeds,seedStart:offset+1,seedEnd:offset+seeds,
   deckCounts:counts,slotWinPct:slotWins.map(x=>pct(x,seeds)),
   conditionalCellWins:byCell.map((x,cell)=>cellSeen[cell]?pct(x,cellSeen[cell]):null),
   worst,best,observedActorCellPairs:combos.filter(x=>x.seen>0).length,
   mean:Object.fromEntries(Object.entries(totals).filter(([key])=>key!=='checks'&&key!=='preFirstFalls'&&key!=='openingAttacks').map(([key,val])=>[key,avg(val,seeds)])),
   zeroPreFirstFalls:totals.preFirstFalls===0,zeroOpeningAttacks:totals.openingAttacks===0,
   mostPlayedEffects:Object.entries(used).sort((a,b)=>b[1]-a[1]).slice(0,5),
   unusedEffects:Object.entries(used).filter(([k,v])=>v===0).map(([k])=>k),
   usesByType:used,checks:totals.checks
 })
}
console.log(JSON.stringify({study:'R1 B60/12/10-type deck comparison; 60 physical copies each',
  source:'R0 full independent model, main 53-hex layout',seeds,offset,
  totalMatches:results.length*seeds,results},null,2))
