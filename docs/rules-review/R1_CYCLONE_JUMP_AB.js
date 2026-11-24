/** Surf King Iteration AB — Cyclone/Jumping thematic A/B, never production gameplay.
 * From repo root:
 * SK_THEME_SEEDS=2000 SK_THEME_OFFSET=210000 SK_THEME_PLAYERS=2,4,7 node docs/rules-review/R1_CYCLONE_JUMP_AB.js
 */
'use strict'
const assert=require('assert')
const {play,deckTypes}=require('./R0_FULL_MATCH_MODEL')
const seeds=Number(process.env.SK_THEME_SEEDS||2000)
const offset=Number(process.env.SK_THEME_OFFSET||210000)
const players=(process.env.SK_THEME_PLAYERS||'2,4,7').split(',').map(Number)
const modes=(process.env.SK_THEME_MODES||'balanced,aggressive').split(',')
const variants=(process.env.SK_THEME_VARIANTS||'lite10Active:remove,lite10Active:leap,lite11Cyclone:leap,lite10CycloneNoStone:leap').split(',')
assert(Number.isInteger(seeds)&&seeds>0&&seeds<=30000)
assert(Number.isInteger(offset)&&offset>=0)
assert(players.every(n=>Number.isInteger(n)&&n>=2&&n<=7))
assert(modes.every(m=>['balanced','aggressive'].includes(m)))
assert(variants.every(v=>['lite10Active:remove','lite10Active:leap','lite11Cyclone:leap','lite10CycloneNoStone:leap'].includes(v)))
const percent=(a,b)=>b?+(a*100/b).toFixed(2):null
const mean=(a,b)=>b?+(a/b).toFixed(3):null
const results=[]
for(const n of players)for(const policy of modes)for(const variant of variants){
 const [profile,jumpStyle]=variant.split(':')
 const expected=deckTypes(profile)
 assert.strictEqual(Object.values(expected).reduce((a,b)=>a+b,0),60)
 const expectedTypes=profile==='lite11Cyclone'?11:10
 assert.strictEqual(Object.keys(expected).length,expectedTypes)
 const seatWins=Array(n).fill(0),pairSeen=Array.from({length:n},()=>Array(7).fill(0)),
   pairWin=Array.from({length:n},()=>Array(7).fill(0))
 const aggregate={rounds:0,opponentActions:0,falls:0,playerFalls:0,sharkFalls:0,steals:0,rescues:0,
   openingAttacks:0,preFirstFalls:0,cycloneRedirects:0,leaps:0,sharkLeaps:0,leapsOverPlaced:0,
   jumpCardsPlayed:0,cycloneCardsPlayed:0,forcedBlocks:0,checked:0,cofinishes:0}
 let complete=0
 for(let step=1;step<=seeds;step++){
   const seed=offset+step,shift=(seed*13+Math.floor(seed/n))%n
   const g=play(n,seed,policy,shift,'rotate','random','none','roundEnergy','none','none','restricted','off',profile,jumpStyle)
   assert(g.finished,'unfinished modeled match')
   assert.strictEqual(new Set(g.startCells).size,n,'two surfers share a start')
   assert.deepEqual(g.deckCounts,expected,'deck proportions changed')
   assert.strictEqual(g.preFirstFalls,0,'surfer fell before first own turn')
   assert.strictEqual(g.openingAttacks,0,'first-turn direct attacks')
   assert(g.cardConservationChecks>0,'missing state checks')
   assert.strictEqual(g.leaps||0,(g.sharkLeaps||0)+(g.leapsOverPlaced||0),'leap by hazard classification')
   assert.strictEqual(g.leaps||0,jumpStyle==='leap'?(g.uses.Jumping||0):0,'leap must use Jumping card')
   assert(!g.uses.Stone||Object.hasOwn(expected,'Stone'))
   assert(!g.uses.Cyclone||Object.hasOwn(expected,'Cyclone'))
   complete++
   const slot=(g.winner-shift+n)%n
   seatWins[slot]++
   pairWin[slot][g.startCells[g.winner]]++
   for(let slot=0;slot<n;slot++)pairSeen[slot][g.startCells[(slot+shift)%n]]++
   const values={rounds:g.rounds,opponentActions:g.opponentActions,falls:g.falls,playerFalls:g.playerFalls,
     sharkFalls:g.sharkFalls,steals:g.stolen,rescues:g.rescue,
     openingAttacks:g.openingAttacks,preFirstFalls:g.preFirstFalls,cycloneRedirects:g.cycloneRedirects||0,
     leaps:g.leaps||0,sharkLeaps:g.sharkLeaps||0,leapsOverPlaced:g.leapsOverPlaced||0,
     jumpCardsPlayed:g.uses.Jumping||0,cycloneCardsPlayed:g.uses.Cyclone||0,forcedBlocks:g.forcedBlocks,
     checked:g.cardConservationChecks,cofinishes:Number(g.beachSameRound>1)}
   for(const key in values)aggregate[key]+=values[key]
 }
 assert.strictEqual(seatWins.reduce((a,b)=>a+b,0),seeds)
 assert.strictEqual(pairSeen.flat().reduce((a,b)=>a+b,0),seeds*n)
 if(seeds>=1000)assert(pairSeen.every(x=>x.every(count=>count>0)),'missing starting actor×hex combination')
 const conditional=pairSeen.flatMap((row,seat)=>row.map((seen,cell)=>({seat:seat+1,cell,seen,winPct:percent(pairWin[seat][cell],seen)})))
 const available=conditional.filter(x=>x.seen>=Math.max(20,Math.floor(seeds/(n*14))))
 const worst=available.reduce((a,b)=>a.winPct<b.winPct?a:b)
 const best=available.reduce((a,b)=>a.winPct>b.winPct?a:b)
 results.push({n,policy,variant,profile,jumpStyle,cards:60,types:expectedTypes,distribution:expected,
   matches:complete,slotWinPct:seatWins.map(v=>percent(v,seeds)),worst,best,activeStartPairs:conditional.filter(x=>x.seen).length,
   mean:Object.fromEntries(Object.entries(aggregate).filter(([k])=>k!=='checked').map(([k,v])=>[k,mean(v,seeds)])),
   totalJumpCardsPlayed:aggregate.jumpCardsPlayed,totalSharkLeaps:aggregate.sharkLeaps,totalCycloneRedirects:aggregate.cycloneRedirects,
   integrityChecks:aggregate.checked})
}
console.log(JSON.stringify({experiment:'Iteration AB: retain cyclone, leap past Shark/obstacle',parameters:{seeds,offset,players,modes,variants},games:results.length*seeds,results},null,2))
