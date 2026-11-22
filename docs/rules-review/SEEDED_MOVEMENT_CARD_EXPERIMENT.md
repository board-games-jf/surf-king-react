# Seeded movement and card economy experiment — 2026-11-22

**Status:** Independent design model; no game-engine execution, no adopted new decision, no implementation authorization. [Issue #11](https://github.com/board-games-jf/surf-king-react/issues/11), [draft PR #12](https://github.com/board-games-jf/surf-king-react/pull/12).

## Evidence and scope

Current main `c6fd08e2da82ca223740e3aa944c47f87aa84f16`. The 53-cell manifest blob `de7a795261a4ad2a1ab6e81e8ca8f1189df708f5` and gameplay source blob `1a6b19eb0adcdf0ac4940e8a74096e8990efc0a4` are unchanged from earlier studies. Parsed actual 64-copy deck from createDeck and true geometric neighbors, actual starts 0..n−1, Sharks 28–31, beach 49–52. Main now contains **conflicting SK-DEC-019–024 numbers for visual decisions**; references here mean **draft PR #12 gameplay decisions only**. Reconcile IDs/branches before merging documentation; do not overwrite visual decisions.

**2400 seeded races**: 200 seeds per combination of 2/4/7 players × direct/cautious route policy × 1/0 ordinary energy cost. Each cost comparison starts with identical seed/deal; divergence means later draws need not match. These are model trials, not independent human playtests or an exact simulation of the legacy engine. Both arms use starting 2, Shark −2, universal 1/2/3 recovery, Fin/Float tactical slot and one uniform random hand-card loss for a new fall; attack-caused loss transfers to the opponent. The only toggled parameter within a paired policy is ordinary movement cost (Bottled Water can waive 1 in cost-1 arm). No changes to actual cards.

**Explicit provisional conventions (NOT approved):** cap 5 energy, two opening cards, one draw after every completed maneuver including a fall, random hand cap 5 applied immediately after theft/draw, recycle discards if deck empty. One optional tactic before mandatory move from round 1 (legacy phase A omitted); play lethal Big Wave/Sunburn first, else heal at energy ≤2, else use Bottled Water at cost 1 and energy ≤2, else adjacent Drop In if at least as strong, otherwise offensive card against nearest-to-beach standing rival. No active/deployed effects. Supported cards use legacy damage/healing (Big Wave 2, Sunburn 1, Energy +1/+2/+3, Coconut refill); Fin/Float used only at recovery. Other cards remain inert hand inventory; **Stone, Storm, Cyclone, Island, Change, Tsunami, Amulet, Jumping, Hang Loose not modeled**, so no placement, immunity or forced swap. Drop In max of up to 2d6, tie no damage, strict loser −1, defender receives card if initiating attacker falls (provisional symmetric attribution). If initiating attacker falls before movement, no movement that turn; recover next own turn; all fallen players cannot be targeted (trial). No free blocked reward. Combined move+Shark damage produces one fall tagged Shark. Immediate first beach wins; 20-round cutoff is a censoring limit, not approved endgame. Direct policy minimizes remaining moves; cautious adds two path-cost points per Shark entry; random tie choice, occupied neighbors excluded. All agents share same policy per match, start order fixed. No prediction of optimal strategy.

## Results

Means per started race; round count uses 20 for unfinished races; wins listed by starting cell/order, not person. “safe” means fall solely due to ordinary movement tax. Theft/discard are fall penalties only, not ordinary card usage or hand-cap drops. Card + combat combined as opponent falls.

| Players | Policy | Move cost | Finished | Rounds | Safe falls | Shark falls | Opponent falls | Cards stolen | Cards discarded | Empty-hand falls | Wins by start |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 2 | direct | 1 | 200/200 | 7.00 | 3.27 | 1.66 | 0.84 | 0.84 | 4.76 | 0.17 | 200/0 |
| 2 | direct | 0 | 200/200 | 7.00 | 0.00 | 0.59 | 0.67 | 0.67 | 0.57 | 0.01 | 200/0 |
| 2 | cautious | 1 | 200/200 | 8.02 | 4.26 | 0.02 | 1.45 | 1.45 | 4.09 | 0.19 | 192/8 |
| 2 | cautious | 0 | 200/200 | 8.01 | 0.00 | 0.01 | 0.75 | 0.75 | 0.01 | 0.00 | 199/1 |
| 4 | direct | 1 | 200/200 | 7.00 | 5.76 | 3.25 | 2.68 | 2.68 | 8.57 | 0.44 | 200/0/0/0 |
| 4 | direct | 0 | 200/200 | 7.00 | 0.00 | 1.02 | 2.17 | 2.17 | 1.02 | 0.01 | 200/0/0/0 |
| 4 | cautious | 1 | 200/200 | 7.77 | 7.48 | 0.21 | 4.12 | 4.11 | 7.26 | 0.44 | 150/2/1/47 |
| 4 | cautious | 0 | 200/200 | 7.72 | 0.00 | 0.11 | 3.10 | 3.09 | 0.11 | 0.01 | 143/0/1/56 |
| 7 | direct | 1 | 200/200 | 7.00 | 10.97 | 3.72 | 8.96 | 8.89 | 13.61 | 1.15 | 184/11/3/2/0/0/0 |
| 7 | direct | 0 | 200/200 | 7.00 | 0.00 | 1.59 | 8.85 | 8.84 | 1.56 | 0.03 | 191/9/0/0/0/0/0 |
| 7 | cautious | 1 | 200/200 | 7.00 | 11.85 | 1.49 | 9.08 | 9.03 | 12.40 | 0.99 | 93/39/21/30/15/2/0 |
| 7 | cautious | 0 | 200/200 | 7.00 | 0.00 | 0.73 | 8.36 | 8.36 | 0.72 | 0.01 | 92/49/26/30/3/0/0 |

| Players | Policy | Cost | Duels | Offensive cards | Fin/Float used | Rescue cards lost | Bottled Water used | Blocked turns | Backward moves | Own-turn attack falls preventing move | Hand-cap drops |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 2 | direct | 1 | 0 | 1.35 | 1.16 | 0.55 | 0.75 | 0 | 0 | 0 | 0.03 |
| 2 | direct | 0 | 0 | 1.78 | 0.46 | 0.18 | 0 | 0 | 0 | 0 | 1.81 |
| 2 | cautious | 1 | 0.8 | 1.8 | 1.12 | 0.54 | 0.93 | 0 | 0.01 | 0.12 | 0.34 |
| 2 | cautious | 0 | 1.41 | 2.06 | 0.22 | 0.1 | 0 | 0 | 0 | 0.02 | 4.29 |
| 4 | direct | 1 | 0 | 3.39 | 2.41 | 1.13 | 1.53 | 0 | 0 | 0 | 0.03 |
| 4 | direct | 0 | 0 | 3.52 | 1.08 | 0.39 | 0 | 0 | 0 | 0 | 3.38 |
| 4 | cautious | 1 | 2.59 | 3.79 | 2.48 | 1.1 | 1.67 | 0 | 0.22 | 0.24 | 0.72 |
| 4 | cautious | 0 | 5.39 | 3.79 | 0.89 | 0.33 | 0 | 0 | 0.2 | 0.07 | 7.81 |
| 7 | direct | 1 | 8.71 | 5.78 | 4.28 | 2.2 | 2.35 | 0 | 0 | 1.18 | 0.55 |
| 7 | direct | 0 | 16.64 | 5.96 | 2.55 | 1.12 | 0 | 0 | 0 | 0.42 | 7.35 |
| 7 | cautious | 1 | 8.76 | 5.96 | 4.13 | 2.16 | 2.44 | 0 | 1.67 | 1.05 | 0.84 |
| 7 | cautious | 0 | 15.62 | 6.06 | 2.05 | 0.95 | 0 | 0 | 1.91 | 0.4 | 8.91 |

## Validation boundaries

All 2400 races executed in a standalone JavaScript design model; assert exact total and per-name card conservation (64 copies), no overlapping occupied cells after moves, and fall counts equal theft + discard + empty-hand falls. Legal choices constructed from source geometry. No runtime engine, UI, Jest or build run. A fixed-order winner distribution conflates start geometry and initiative; do not infer statistical causal effect of either separately. Play policy is heuristic; no real player incentives or all cards. A capped simulation is not a completed match if no winner. No new rule approval.

**Next gate:** inspect this evidence first, then isolate turn-order rotation independent of starting cells, alternate attack/route policies, blocked/forced-hazard scenarios and complete card effects (especially displacement attribution, full recipient hand and Bottled Water). Do not claim entire game is validated until unresolved mechanics and actual human/tabletop play have been checked. No source changes/merge/deploy.

## Reproduction

The following standalone function was executed against the two source inputs referenced above. Extract the deck using the uncommented `addCards(Card<Name>, N)` entries of `createDeck`, expanding each by N; call `study(JSON.parse(layoutFile), deck)`. It does not import or run the app.

```js
function study(layout,deck){
 const cells=layout.cells,sharks=new Set([28,29,30,31]),adj=cells.map(a=>cells.filter(b=>a.id!==b.id&&Math.abs(Math.hypot(a.x-b.x,a.z-b.z)-Math.sqrt(3)*layout.hexRadius)<.005).map(b=>b.id));
 if(adj[21].join(",")!=="14,18,25,28")throw Error("bad geometry");
 const dist=pen=>{let d=cells.map(c=>c.id>=49?0:Infinity);for(let j=0;j<53;j++)for(let u=0;u<53;u++)for(const v of adj[u])d[u]=Math.min(d[u],1+(sharks.has(v)?pen:0)+d[v]);return d};const ds=[dist(0),dist(2)];
 function rng(seed){let a=seed>>>0;return ()=>{a=(Math.imul(1664525,a)+1013904223)>>>0;return a/4294967296}}
 function match(n,cost,cautious,seed){
  let rnd=rng(seed),pile=deck.slice(),discard=[],p=Array.from({length:n},(_,i)=>({pos:i,e:2,h:[],down:false})),m={turns:0,moves:0,safe:0,shark:0,combat:0,card:0,steal:0,discard:0,empty:0,rescue:0,rescueLost:0,blocked:0,back:0,duels:0,attackCards:0,heal:0,bottle:0,cap:0,draw:0,winner:-1,round:20,miss:0};
  const take=a=>a.splice(Math.floor(rnd()*a.length),1)[0];const draw=x=>{if(!pile.length){pile=discard;discard=[]}if(pile.length){x.h.push(take(pile));m.draw++}};const cap=x=>{while(x.h.length>5){discard.push(take(x.h));m.cap++}};const use=(x,c)=>{let i=x.h.indexOf(c);if(i<0)throw Error("absent card");discard.push(x.h.splice(i,1)[0])};const damage=(x,d,kind,other)=>{if(x.down)return;x.e=Math.max(0,x.e-d);if(x.e>0)return;x.down=true;m[kind]++;if(!x.h.length){m.empty++;return}let q=take(x.h);if(q==="SwimmingFin"||q==="LifeGuardFloat")m.rescueLost++;if(other){other.h.push(q);m.steal++;cap(other)}else{discard.push(q);m.discard++}};
  for(const x of p){draw(x);draw(x)}
  const roll=x=>Math.max(...Array.from({length:Math.min(2,x.e)},()=>1+Math.floor(rnd()*6)));
  const healGain={Energy:1,EnergyX2:2,EnergyX3:3,Coconut:5};
  for(let r=1;r<=20&&m.winner<0;r++)for(let i=0;i<n;i++){let x=p[i],spent=false,shield=false;m.turns++;
   if(x.down){x.down=false;let c=x.h.includes("LifeGuardFloat")?"LifeGuardFloat":x.h.includes("SwimmingFin")?"SwimmingFin":null;x.e=c==="LifeGuardFloat"?3:c==="SwimmingFin"?2:1;if(c){use(x,c);spent=true;m.rescue++}}
   let others=p.filter(y=>y!==x&&!y.down).sort((a,b)=>ds[0][a.pos]-ds[0][b.pos]||a.e-b.e);
   if(!spent){
    let lethal=others.find(y=>y.e<=2&&x.h.includes("BigWave")||y.e===1&&x.h.includes("Sunburn"));let c=lethal?(lethal.e===1&&x.h.includes("Sunburn")?"Sunburn":"BigWave"):null;
    let h=x.h.filter(c=>healGain[c]).sort((a,b)=>Math.min(5-x.e,healGain[b])-Math.min(5-x.e,healGain[a]))[0];
    if(c){use(x,c);damage(lethal,c==="BigWave"?2:1,"card",x);m.attackCards++}
    else if(h&&x.e<=2){use(x,h);x.e=Math.min(5,x.e+healGain[h]);m.heal++}
    else if(cost===1&&x.e<=2&&x.h.includes("BottledWater")){use(x,"BottledWater");shield=true;m.bottle++}
    else {let y=others.find(y=>adj[x.pos].includes(y.pos)&&x.e>=y.e);if(y){m.duels++;let a=roll(x),b=roll(y);if(a>b)damage(y,1,"combat",x);else if(b>a)damage(x,1,"combat",y)}else if(others.length&&(x.h.includes("BigWave")||x.h.includes("Sunburn"))){let c=x.h.includes("BigWave")?"BigWave":"Sunburn";use(x,c);damage(others[0],c==="BigWave"?2:1,"card",x);m.attackCards++}}
   }
   if(x.down){m.miss++;continue}
   let legal=adj[x.pos].filter(v=>!p.some(y=>y!==x&&y.pos===v));if(!legal.length){m.blocked++;continue}let d=ds[cautious?1:0],pen=cautious?2:0;let scores=legal.map(v=>d[v]+(sharks.has(v)?pen:0));let best=Math.min(...scores);let choices=legal.filter((v,j)=>scores[j]===best);let to=choices[Math.floor(rnd()*choices.length)];if(ds[0][to]>ds[0][x.pos])m.back++;x.pos=to;m.moves++;let paid=shield?0:cost,terrain=sharks.has(to)?2:0;if(paid+terrain)damage(x,paid+terrain,terrain?"shark":"safe",null);draw(x);cap(x);
   if(new Set(p.map(y=>y.pos)).size!==n)throw Error("overlap");if(to>=49){m.winner=i;m.round=r;break}
  }
  const all=[...pile,...discard,...p.flatMap(x=>x.h)];if(all.length!==deck.length||deck.some(c=>all.filter(y=>y===c).length!==deck.filter(y=>y===c).length))throw Error("card conservation");if(m.safe+m.shark+m.combat+m.card!==m.steal+m.discard+m.empty)throw Error("fall bookkeeping");return m
 }
 let results=[];for(const n of [2,4,7])for(const cautious of [false,true])for(const cost of [1,0]){let sums={},wins=Array(n).fill(0),runs=200;for(let s=1;s<=runs;s++){let a=match(n,cost,cautious,s*7919+n*101);for(let [k,v] of Object.entries(a))if(k!=="winner")sums[k]=(sums[k]||0)+v;if(a.winner>=0)wins[a.winner]++}results.push({n,policy:cautious?"cautious":"direct",cost,runs,finished:wins.reduce((a,b)=>a+b,0),wins,totals:sums,means:Object.fromEntries(Object.entries(sums).map(([k,v])=>[k,Math.round(v/runs*100)/100]))})}return results
}
```
