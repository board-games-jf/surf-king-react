/** Iteration X: soft reverse-weighted initial placement, no guaranteed actor×hex locks.
 * Run from a repository checkout:
 * SK_WEIGHTED_SEEDS=4000 SK_WEIGHTED_OFFSET=50000 SK_WEIGHTED_PLAYERS=4,7 SK_WEIGHTED_MODES=random,weighted1p5,weighted2,weightedLate1p5,weightedLate2,reverseTier node docs/rules-review/R0_WEIGHTED_START_AB.js
 * Experimental independent R0 full-card simulation; not production or human game.
 */
'use strict'
const assert=require('assert')
const {play}=require('./R0_FULL_MATCH_MODEL')
const params={
 seeds:Number(process.env.SK_WEIGHTED_SEEDS||4000),
 offset:Number(process.env.SK_WEIGHTED_OFFSET||50000),
 players:(process.env.SK_WEIGHTED_PLAYERS||'4,7').split(',').map(Number),
 policies:(process.env.SK_WEIGHTED_POLICIES||'balanced,aggressive').split(','),
 modes:(process.env.SK_WEIGHTED_MODES||'random,weighted1p5,weighted2,weightedLate1p5,weightedLate2,reverseTier').split(','),
 bonuses:(process.env.SK_WEIGHTED_BONUSES||'last1').split(','),
 comps:(process.env.SK_WEIGHTED_COMPS||'none,inner1,inner2').split(',')
}
assert(Number.isInteger(params.seeds)&&params.seeds>=1&&params.seeds<=30000)
assert(Number.isInteger(params.offset)&&params.offset>=0)
assert(params.players.every(x=>Number.isInteger(x)&&x>=2&&x<=7))
assert(params.policies.every(x=>['balanced','aggressive'].includes(x)))
assert(params.modes.every(x=>['random','weighted1p5','weighted2','weightedLate1p5','weightedLate2','reverseTier','lateSafe2'].includes(x)))
assert(params.bonuses.every(x=>['none','last1'].includes(x)))
assert(params.comps.every(x=>['none','inner1','inner2'].includes(x)))
const pct=(a,b)=>b?+(100*a/b).toFixed(3):null
const mean=(a,b)=>b?+(a/b).toFixed(3):null
const results=[]
for(const n of params.players)for(const policy of params.policies)for(const bonus of params.bonuses)for(const comp of params.comps)for(const mode of params.modes){
 const slotWins=Array(n).fill(0),cellWins=Array(7).fill(0),cellSeen=Array(7).fill(0)
 const seen=Array.from({length:n},()=>Array(7).fill(0)),wins=Array.from({length:n},()=>Array(7).fill(0))
 const falls=Array.from({length:n},()=>Array(7).fill(0)),targeted=Array.from({length:n},()=>Array(7).fill(0))
 let rounds=0,actions=0,co=0,checks=0,lateSafe=0,totalCards=0,universe=new Set()
 for(let trial=1;trial<=params.seeds;trial++){
   const seed=params.offset+trial,shift=(seed*13+Math.floor(seed/n))%n
   const game=play(n,seed,policy,shift,'fixed',mode,bonus,'roundEnergy',comp)
   assert(game.finished,'full match unfinished')
   assert.strictEqual(new Set(game.startCells).size,n,'duplicate opening hex')
   assert(game.cardConservationChecks>=n,'no state checks')
   const expectedHand=p=>{
     const cell=game.startCells[p]
     return 2+Number(bonus==='last1'&&p===(shift+n-1)%n)
       +([1,2].includes(cell)?({none:0,inner1:1,inner2:2}[comp]):0)
   }
   for(let p=0;p<n;p++)assert.strictEqual(game.openingCardCounts[p],expectedHand(p),'opening hand size incorrect')
   const winnerSlot=(game.winner-shift+n)%n
   slotWins[winnerSlot]++;cellWins[game.startCells[game.winner]]++
   for(let slot=0;slot<n;slot++){
     const id=(shift+slot)%n,cell=game.startCells[id]
     seen[slot][cell]++;cellSeen[cell]++
     falls[slot][cell]+=game.fallsBySeat[id]
     targeted[slot][cell]+=game.targeted[id]
     totalCards+=game.openingCardCounts[id]
     if(slot===n-1&&cell>=4)lateSafe++
   }
   wins[winnerSlot][game.startCells[game.winner]]++
   universe.add(game.startCells.slice().sort((a,b)=>a-b).join(','))
   rounds+=game.rounds;actions+=game.opponentActions;co+=Number(game.beachSameRound>=2);checks+=game.cardConservationChecks
 }
 assert.strictEqual(slotWins.reduce((a,b)=>a+b,0),params.seeds)
 assert.strictEqual(seen.flat().reduce((a,b)=>a+b,0),n*params.seeds)
 // A soft lottery must preserve all possible actor×hex assignments; this test
 // is applied after enough samples for a meaningful coverage expectation.
 if(mode.startsWith('weighted')&&params.seeds>=1000)assert(seen.every(row=>row.every(x=>x>0)),'soft weighted lottery incorrectly locks some actor×hex pairs')
 const combos=seen.flatMap((r,slot)=>r.map((count,cell)=>({
   slot:slot+1,cell,played:count,wins:wins[slot][cell],winPct:pct(wins[slot][cell],count),
   meanFalls:mean(falls[slot][cell],count),meanTargets:mean(targeted[slot][cell],count)
 })))
 const supported=combos.filter(x=>x.played>=Math.max(1,Math.floor(params.seeds/(n*7*2))))
 assert(supported.length>0)
 const worst=supported.reduce((a,b)=>a.winPct<b.winPct?a:b)
 const best=supported.reduce((a,b)=>a.winPct>b.winPct?a:b)
 results.push({n,policy,mode,bonus,comp,seeds:params.seeds,seedStart:params.offset+1,seedEnd:params.offset+params.seeds,
   slots:slotWins.map(x=>pct(x,params.seeds)),
   cells:cellWins.map((x,i)=>pct(x,cellSeen[i])),
   lastSafePct:pct(lateSafe,params.seeds),
   activeCombos:combos.filter(x=>x.played>0).length,minSeen:Math.min(...combos.filter(x=>x.played>0).map(x=>x.played)),
   maxSeen:Math.max(...combos.map(x=>x.played)),worst,best,
   distinctUnorderedSets:universe.size,
   meanRounds:mean(rounds,params.seeds),meanOpponentActions:mean(actions,params.seeds),
   coFinishPct:pct(co,params.seeds),meanOpeningCardsPerPlayer:mean(totalCards,params.seeds*n),
   invariantChecks:checks,
   cross:seen.map((row,slot)=>row.map((count,cell)=>({played:count,wins:wins[slot][cell],winPct:pct(wins[slot][cell],count)})))
 })
}
console.log(JSON.stringify({experiment:'Iteration X: weighted actor-aware starting position A/B',parameters:params,
  games:results.length*params.seeds,results},null,2))
