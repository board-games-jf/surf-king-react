/** Iteration U: controlled 2/4/7-player position-specific opening compensation A/B.
 * Run: SK_POSITION_SEEDS=2000 SK_POSITION_OFFSET=1500 node docs/rules-review/START_POSITION_COMPENSATION_AB.js
 * Independent full-card R0 experimental design simulation, not app engine or human games.
 */
'use strict'
const assert=require('assert')
const {play}=require('./R0_FULL_MATCH_MODEL')
const N=Number(process.env.SK_POSITION_SEEDS||2000)
const offset=Number(process.env.SK_POSITION_OFFSET||1500)
assert(Number.isInteger(N)&&N>0&&N<=20000)
assert(Number.isInteger(offset)&&offset>=0)
const variants=['none','inner1','inner2','riskTier1','innerDraft','innerEnergy1']
const rows=[]
for(const n of [2,4,7]){
 for(const policy of ['balanced','aggressive']){
  for(const variant of variants){
   const wins=Array(7).fill(0),appearances=Array(7).fill(0),slotWins=Array(n).fill(0)
   const falls=Array(7).fill(0),hits=Array(7).fill(0),sharkFalls=Array(7).fill(0),attackFalls=Array(7).fill(0),targeted=Array(7).fill(0)
   let rounds=0,actions=0,cofinishes=0,integrity=0
   for(let i=1;i<=N;i++){
    const seed=i+offset
    const shift=(seed*13+Math.floor(seed/n))%n
    const g=play(n,seed,policy,shift,'fixed','random','last1','roundEnergy',variant)
    assert(g.finished,'incomplete modeled match')
    assert.strictEqual(new Set(g.startCells).size,n)
    assert(g.startCells.every(c=>Number.isInteger(c)&&c>=0&&c<=6))
    assert(g.cardConservationChecks>=n)
    wins[g.startCells[g.winner]]++
    slotWins[(g.winner-shift+n)%n]++
    for(let p=0;p<n;p++){
      const start=g.startCells[p]
      appearances[start]++
      falls[start]+=g.fallsBySeat[p]
      hits[start]+=g.hitsBySeat[p]
      sharkFalls[start]+=g.sharkFallsBySeat[p]
      attackFalls[start]+=g.attackFallsBySeat[p]
      targeted[start]+=g.targeted[p]
      const expected=2+Number(p===(shift+n-1)%n)
        +(variant==='inner1'&&(start===1||start===2)?1:0)
        +(variant==='inner2'&&(start===1||start===2)?2:0)
        +(variant==='riskTier1'&&start<=3?1:0)
      if(variant!=='innerDraft'&&variant!=='innerEnergy1')assert.strictEqual(g.openingCardCounts[p],Math.min(5,expected),'opening cards')
      if(variant==='innerDraft'||variant==='innerEnergy1')assert.strictEqual(g.openingCardCounts[p],2+Number(p===(shift+n-1)%n),'opening cards unchanged')
    }
    rounds+=g.rounds;actions+=g.opponentActions
    cofinishes+=Number(g.beachSameRound>=2)
    integrity+=g.cardConservationChecks
   }
   assert.strictEqual(wins.reduce((a,b)=>a+b,0),N)
   assert.strictEqual(appearances.reduce((a,b)=>a+b,0),n*N)
   const rate=(a,b)=>b?+(100*a/b).toFixed(2):null
   const avg=(a,b)=>b?+(a/b).toFixed(3):null
   rows.push({
    n,policy,variant,games:N,seedStart:offset+1,seedEnd:offset+N,
    actorWinPct:slotWins.map(x=>rate(x,N)),
    byStart:appearances.map((exposure,c)=>({cell:c,appearances:exposure,winPctWhenPresent:rate(wins[c],exposure),meanFalls:avg(falls[c],exposure),meanHits:avg(hits[c],exposure),meanIncomingTactics:avg(targeted[c],exposure),meanSharkFalls:avg(sharkFalls[c],exposure),meanAttackerFalls:avg(attackFalls[c],exposure)})),
    meanFinishRound:avg(rounds,N),meanOpponentFacingActions:avg(actions,N),
    coFinishPct:rate(cofinishes,N),integrityChecks:integrity
   })
  }
 }
}
console.log(JSON.stringify({designModel:'R0 randomized starting cells 1/2 tactical compensation',seedsPerRow:N,offset,
  totalGameExecutions:rows.length*N,results:rows},null,2))
