/**
 * Surf King R0 — Iteration M. Independent partial opening-attack opportunity model.
 * Run: node docs/rules-review/OPENING_FOCUS_PRESSURE_REPRODUCTION.js
 * Source geometry: src/map/layout/board-layout.json (53 provisional cells).
 * Not the app engine, not a full game, and no attacks are actually executed.
 */
const fs = require('fs')
const path = require('path')
const assert = require('assert')
const layout = JSON.parse(fs.readFileSync(path.join(__dirname, '../../src/map/layout/board-layout.json'), 'utf8'))
const cells = layout.cells
assert.strictEqual(cells.length, 53)
const near = cells.map(a => cells.filter(b => a.id !== b.id &&
  Math.abs(Math.hypot(a.x - b.x, a.z - b.z) - Math.sqrt(3) * layout.hexRadius) < .005).map(b => b.id))
assert(near.every((xs, i) => xs.every(j => near[j].includes(i))))
const reach = cells.map(a => {
  const ds = Array(cells.length).fill(Infinity), q = [a.id]
  ds[a.id] = 0
  for (let k = 0; k < q.length; k++) for (const v of near[q[k]]) {
    if (ds[v] === Infinity) { ds[v] = ds[q[k]] + 1; q.push(v) }
  }
  assert(ds.every(Number.isFinite))
  return ds
})
assert.strictEqual(reach[0][1], 2)
assert(reach[17][14] > 1) // displayed 18 -> 15 is forbidden
const beach = [49, 50, 51, 52]
const counts = [
  ['Energy',6],['Energy x2',4],['Coconut',2],['Swimming Fin',5],
  ['Lifeguard Float',4],['Big Wave',3],['Sunburn',4],['Stone',4],
  ['Storm',4],['Island',3],['Cyclone',3],['Change',2],
  ['Jumping',4],['Tsunami',3],['Hang Loose',3],['Amulet',2],
  ['Surf Current',4]
]
const original = counts.flatMap(([kind,n]) => Array(n).fill(kind))
assert.strictEqual(original.length, 60)
assert.strictEqual(counts.length, 17)
const rng = seed => () => {
  seed |= 0; seed = seed + 0x6D2B79F5 | 0
  let t = Math.imul(seed ^ seed >>> 15, 1 | seed)
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
  return ((t ^ t >>> 14) >>> 0) / 4294967296
}
function shuffle(seed) {
  const a = [...original], random = rng(seed)
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i+1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
function firstRoundPositions(n, order) {
  const pos = Array.from({length:n}, (_,i)=>i), occupied = new Set(pos)
  const moved = Array(n).fill(false)
  for (const seat of order) {
    const from = pos[seat]
    const options = near[from].filter(to => !occupied.has(to))
      .sort((a,b) => {
        const distance = id => Math.min(...beach.map(z => reach[id][z]))
        return distance(a)-distance(b) || a-b
      })
    if (!options.length) continue // forced blocked; no new card draw
    occupied.delete(from)
    pos[seat] = options[0]
    occupied.add(pos[seat])
    moved[seat] = true
  }
  assert.strictEqual(new Set(pos).size, n)
  assert(pos.every((id,seat) => reach[seat][id] === (moved[seat]?1:0)))
  return {pos,moved}
}
function analyze(n, reverse=false, trials=20000) {
  const order = Array.from({length:n},(_,i)=>i)
  if(reverse) order.reverse()
  const {pos,moved} = firstRoundPositions(n,order)
  const pairs = pos.map((v,target) => order.slice(0,order.indexOf(target))
    .filter(attacker=>reach[pos[attacker]][v]<=3).length)
  const stats=Array.from({length:n},()=>({attacks:0,big:0,double:0,protection:0,incoming:0}))
  for(let k=0;k<trials;k++) {
    const deck=shuffle(0x9E3779B9 ^ (k+1)*2654435761 ^ n*911 ^ Number(reverse)*107)
    let cursor=0
    const hands=Array.from({length:n},()=>[deck[cursor++],deck[cursor++]])
    const amulet=Array(n).fill(false)
    for(const seat of order) {
      const i=hands[seat].indexOf('Amulet')
      if(i>=0) {hands[seat].splice(i,1);amulet[seat]=true}
      if(moved[seat]) hands[seat].push(deck[cursor++])
    }
    const conserved=hands.flat().concat(amulet.filter(Boolean).map(()=>'Amulet'),deck.slice(cursor))
    assert.strictEqual(conserved.length,60)
    for(const [type,count] of counts) assert.strictEqual(conserved.filter(x=>x===type).length,count)
    for(const victim of order) {
      let possible=0,big=0
      for(const actor of order.slice(0,order.indexOf(victim))) {
        const dd=reach[pos[actor]][pos[victim]]
        const canBig=dd<=2 && hands[actor].includes('Big Wave')
        const canSun=dd<=3 && hands[actor].includes('Sunburn')
        if(canBig||canSun) possible++
        if(canBig) big++
      }
      const s=stats[victim]
      s.protection+=Number(amulet[victim])
      s.incoming+=amulet[victim]?0:possible
      s.attacks+=Number(possible>0&&!amulet[victim])
      s.big+=Number(big>0&&!amulet[victim])
      s.double+=Number(possible>=2&&!amulet[victim])
    }
  }
  return {type:'incoming-opportunity', players:n, initiative:reverse?'descending':'ascending',
    firstRoundPositions:pos,snapshotPriorRange3:pairs,
    firstRoundBlockedSeats:moved.map((ok,i)=>ok?null:i).filter(i=>i!==null),
    bySeat:stats.map((s,i)=>({seat:i,priorRange3:pairs[i],
      anyIncomingChancePct:+(100*s.attacks/trials).toFixed(2),
      anyBigWaveChancePct:+(100*s.big/trials).toFixed(2),
      twoOrMoreIncomingChancePct:+(100*s.double/trials).toFixed(2),
      proactiveAmuletPct:+(100*s.protection/trials).toFixed(2),
      meanUnblockedPotentialAttackers:+(s.incoming/trials).toFixed(3)}))}
}
function stressTiedShortestChoices(n,reverse,trials=20000) {
  const order=Array.from({length:n},(_,i)=>i)
  if(reverse) order.reverse()
  const blocked=Array(n).fill(0)
  let anyBlocked=0
  for(let trial=0;trial<trials;trial++) {
    const random=rng(0x1234567 ^ Math.imul(trial+1,0x9e3779b9) ^ n*991 ^ (reverse?123:0))
    const pos=Array.from({length:n},(_,i)=>i), occupied=new Set(pos)
    let blockedThis=false
    for(const seat of order) {
      const options=near[pos[seat]].filter(to=>!occupied.has(to))
      if(!options.length) {blocked[seat]++;blockedThis=true;continue}
      const beachDistance=id=>Math.min(...beach.map(b=>reach[id][b]))
      const min=Math.min(...options.map(beachDistance))
      const tied=options.filter(id=>beachDistance(id)===min)
      const next=tied[Math.floor(random()*tied.length)]
      occupied.delete(pos[seat]);occupied.add(next);pos[seat]=next
    }
    if(blockedThis)anyBlocked++
    assert.strictEqual(occupied.size,n)
  }
  return {type:'route-tie-congestion',players:n,initiative:reverse?'descending':'ascending',
    trials,firstRoundAnyBlockedPct:+(100*anyBlocked/trials).toFixed(2),blockedSeatCounts:blocked}
}
for(const n of [2,4,7]) for(const reverse of [false,true]) {
  console.log(JSON.stringify(analyze(n,reverse)))
  console.log(JSON.stringify(stressTiedShortestChoices(n,reverse)))
}
