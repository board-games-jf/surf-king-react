/** Surf King R0 — Iteration S: randomized starts + order-based opening-card bonus.
 * Run from repository root: SK_BONUS_SEEDS=1000 node docs/rules-review/OPENING_HAND_BONUS_AB.js
 * Design-only full-card model. Not production code, human game trials or win-odds guarantees.
 */
'use strict'
const assert=require('assert')
const {play}=require('./R0_FULL_MATCH_MODEL')
const trials=Number(process.env.SK_BONUS_SEEDS||1000)
assert(Number.isInteger(trials)&&trials>=1&&trials<=10000)
const rows=[]
for(const n of [2,4,7]){
 for(const policy of ['balanced','aggressive']){
  for(const bonus of ['none','last1','lastTwo1','lastPlus2']){
   const wins=Array(n).fill(0),winsByStart=Array(7).fill(0),appearances=Array(7).fill(0)
   let rounds=0,falls=0,opponentActions=0,stolen=0,blocked=0,integrity=0
   for(let seed=1;seed<=trials;seed++){
    // Same deterministic first actor, randomized layout and B60 seed for every bonus variant.
    const shift=(seed*13+Math.floor(seed/n))%n
    const g=play(n,seed,policy,shift,'fixed','random',bonus)
    assert(g.finished,'unfinished seeded fixture')
    assert(g.cardConservationChecks>0)
    assert.strictEqual(new Set(g.startCells).size,n)
    assert(g.startCells.every(c=>Number.isInteger(c)&&c>=0&&c<7))
    assert.strictEqual(g.openingCardCounts[(shift+n-1)%n],bonus==='lastPlus2'?4:bonus==='none'?2:3)
    if(bonus==='lastTwo1'&&n>2)assert.strictEqual(g.openingCardCounts[(shift+n-2)%n],3)
    wins[(g.winner-shift+n)%n]++
    winsByStart[g.startCells[g.winner]]++
    for(const cell of g.startCells)appearances[cell]++
    rounds+=g.rounds;falls+=g.falls;opponentActions+=g.opponentActions
    stolen+=g.stolen;blocked+=g.forcedBlocks;integrity+=g.cardConservationChecks
   }
   const average=x=>+(x/trials).toFixed(3)
   rows.push({n,policy,bonus,games:trials,
    actorWins:wins,actorWinPct:wins.map(v=>+(100*v/trials).toFixed(1)),
    winsByStart,appearancesByStart:appearances,
    meanRounds:average(rounds),meanFalls:average(falls),
    meanOpponentActions:average(opponentActions),
    meanStolen:average(stolen),meanForcedBlocks:average(blocked),
    perTurnCardAndOccupancyChecks:integrity})
  }
 }
}
console.log(JSON.stringify({designModel:'R0 randomized unique starts + opening-hand compensation',seedsPerScenario:trials,scenarios:rows.length,totalGameExecutions:rows.length*trials,results:rows},null,2))
