/** R0 minimal-rules tournament (Issue #11). No production code changes.
 * Run from the repo root:
 * SK_MIN_SEEDS=2500 SK_MIN_OFFSET=91000 SK_MIN_PLAYERS=2,4,7 node docs/rules-review/R0_MINIMAL_RULES_AB.js
 * All model policy outputs are simulated, not measured human enjoyment.
 */
'use strict'
const assert=require('assert')
const {play,TYPES}=require('./R0_FULL_MATCH_MODEL')
const definitions={
  coreFirst:{start:'random',last:'none',inner:'none',finish:'first',opening:'open',swap:'off'},
  coreRound:{start:'random',last:'none',inner:'none',finish:'roundEnergy',opening:'open',swap:'off'},
  coreRoundLottery:{start:'random',last:'none',inner:'none',finish:'roundRandom',opening:'open',swap:'off'},
  coreRoundProtected:{start:'random',last:'none',inner:'none',finish:'roundEnergy',opening:'restricted',swap:'off'},
  coreRoundLastCard:{start:'random',last:'last1',inner:'none',finish:'roundEnergy',opening:'open',swap:'off'},
  coreRoundLastProtected:{start:'random',last:'last1',inner:'none',finish:'roundEnergy',opening:'restricted',swap:'off'},
  coreRoundSwap:{start:'random',last:'none',inner:'none',finish:'roundEnergy',opening:'open',swap:'on'},
  referenceComplex:{start:'weighted2',last:'last1',inner:'inner1',finish:'roundEnergy',opening:'restricted',swap:'on'}
}
const parseList=(name,fallback)=>String(process.env[name]||fallback).split(',').filter(Boolean)
const seeds=+(process.env.SK_MIN_SEEDS||2500),offset=+(process.env.SK_MIN_OFFSET||91000)
const players=parseList('SK_MIN_PLAYERS','2,4,7').map(Number)
const policies=parseList('SK_MIN_POLICIES','balanced,aggressive')
const variants=parseList('SK_MIN_VARIANTS',Object.keys(definitions).join(','))
assert(Number.isInteger(seeds)&&seeds>0&&seeds<=30000)
assert(Number.isInteger(offset)&&offset>=0)
assert(players.every(n=>Number.isInteger(n)&&n>=2&&n<=7))
assert(policies.every(p=>['balanced','aggressive'].includes(p)))
assert(variants.every(v=>definitions[v]),'Unknown variant')
const pct=(v,n)=>n?+(v*100/n).toFixed(2):null
const avg=(v,n)=>n?+(v/n).toFixed(3):null
const results=[]
for(const n of players)for(const policy of policies)for(const variant of variants){
 const cfg=definitions[variant]
 const slotWins=Array(n).fill(0),cellWins=Array(7).fill(0),cellSeen=Array(7).fill(0)
 const comboSeen=Array.from({length:n},()=>Array(7).fill(0))
 const comboWin=Array.from({length:n},()=>Array(7).fill(0))
 let rounds=0,turns=0,falls=0,attacks=0,playerFalls=0,stolen=0,forcedBlocks=0,draws=0
 let recoveries=0,preFirstFalls=0,openingAttacks=0,swaps=0,cofinishes=0,opponentActions=0,checks=0,finished=0
 const cardUses=Object.fromEntries(TYPES.map(([t])=>[t,0]))
 for(let i=1;i<=seeds;i++){
   const seed=offset+i,shift=(seed*13+Math.floor(seed/n))%n
   const g=play(n,seed,policy,shift,'fixed',cfg.start,cfg.last,cfg.finish,cfg.inner,'none',cfg.opening,cfg.swap)
   assert(g.finished,'Unfinished game')
   assert.strictEqual(new Set(g.startCells).size,n,'Overlapping start')
   assert(g.cardConservationChecks>=n,'No conservation assertions')
   finished++
   slotWins[(g.winner-shift+n)%n]++
   cellWins[g.startCells[g.winner]]++
   for(let actor=0;actor<n;actor++){
     const player=(actor+shift)%n,cell=g.startCells[player]
     comboSeen[actor][cell]++;cellSeen[cell]++
   }
   comboWin[(g.winner-shift+n)%n][g.startCells[g.winner]]++
   rounds+=g.rounds;turns+=g.totalTurns;falls+=g.falls;attacks+=g.attackActions
   playerFalls+=g.playerFalls;stolen+=g.stolen;forcedBlocks+=g.forcedBlocks
   draws+=g.draws;recoveries+=g.rescue;preFirstFalls+=g.preFirstFalls
   openingAttacks+=g.openingAttacks;swaps+=g.swaps;opponentActions+=g.opponentActions
   cofinishes+=Number(g.beachSameRound>=2);checks+=g.cardConservationChecks
   for(const [type,count] of Object.entries(g.uses))cardUses[type]+=count
 }
 assert.strictEqual(slotWins.reduce((a,b)=>a+b,0),seeds)
 assert.strictEqual(comboSeen.flat().reduce((a,b)=>a+b,0),n*seeds)
 if(cfg.start==='random'&&seeds>=200)assert(comboSeen.every(row=>row.every(c=>c>0)),'All actor×cell assignments should occur')
 const combos=comboSeen.flatMap((row,actor)=>row.map((count,cell)=>({
    actor:actor+1,cell,seen:count,wins:comboWin[actor][cell],winPct:pct(comboWin[actor][cell],count)
 }))
 const eligible=combos.filter(x=>x.seen>=Math.max(1,Math.floor(seeds/(n*7*2))))
 const worst=eligible.reduce((a,b)=>a.winPct<b.winPct?a:b)
 const best=eligible.reduce((a,b)=>a.winPct>b.winPct?a:b)
 results.push({n,policy,variant,config:cfg,seedStart:offset+1,seedEnd:offset+seeds,games:seeds,finished,
   byActingSlotWinPct:slotWins.map(x=>pct(x,seeds)),
   byStartingCellWinPct:cellWins.map((x,i)=>pct(x,cellSeen[i])),
   worstSupportedActorCell:worst,bestSupportedActorCell:best,
   assignedActorCellPairs:combos.filter(x=>x.seen>0).length,
   meanRounds:avg(rounds,seeds),meanPlayerTurns:avg(turns,seeds),
   meanFalls:avg(falls,seeds),meanPlayerFalls:avg(playerFalls,seeds),
   meanAttacks:avg(attacks,seeds),meanOpponentActions:avg(opponentActions,seeds),
   meanSteals:avg(stolen,seeds),meanRecoveries:avg(recoveries,seeds),
   meanForcedBlocks:avg(forcedBlocks,seeds),meanCardDraws:avg(draws,seeds),
   preFirstFalls,openingAttacks,meanPositionSwaps:avg(swaps,seeds),
   multipleSameRoundFinishPct:pct(cofinishes,seeds),
   cardUses,invariantChecks:checks,
   actorCellCounts:comboSeen,actorCellWins:comboWin
 })
}
console.log(JSON.stringify({study:'Iteration Z minimal player-facing Surf King rules',seeds,offset,
   definitions,executions:results.length*seeds,results},null,2))
