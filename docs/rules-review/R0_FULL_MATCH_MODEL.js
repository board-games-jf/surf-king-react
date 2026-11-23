// Surf King R0 — Iteration N independent full-match design-model reproduction.
// Run in repository root: node docs/rules-review/R0_FULL_MATCH_MODEL.js
// Not production game engine, and not proof of human enjoyment.
'use strict'
const fs = require('fs')
const path = require('path')
const assert = require('assert')
const localLayout = path.join(__dirname, '../../src/map/layout/board-layout.json')
const layout = JSON.parse(fs.readFileSync(fs.existsSync(localLayout) ? localLayout : path.join(__dirname,'board-layout.json'), 'utf8'))
const TYPES = [
  ['Energy',6], ['Energy x2',4], ['Coconut',2], ['Swimming Fin',5], ['Lifeguard Float',4],
  ['Big Wave',3], ['Sunburn',4], ['Stone',4], ['Storm',4], ['Island',3], ['Cyclone',3],
  ['Change',2], ['Jumping',4], ['Tsunami',3], ['Hang Loose',3], ['Amulet',2], ['Surf Current',4]
]
const ALL_CARDS = TYPES.flatMap(([name,n])=>Array.from({length:n},(_,i)=>({id:0,t:name})))
ALL_CARDS.forEach((c,i)=>c.id=i)
const R = layout.hexRadius, N = layout.cells.length
const ADJ = layout.cells.map(c=>layout.cells.filter(d=>d.id!==c.id&&Math.abs(Math.hypot(c.x-d.x,c.z-d.z)-Math.sqrt(3)*R)<.005).map(d=>d.id))
const ROW = layout.cells.map(c=>c.row)
const BEACH = new Set([49,50,51,52]), SHARK = new Set([28,29,30,31])
const DIST = layout.cells.map(c=>{
  const d=Array(N).fill(99), queue=[c.id];d[c.id]=0
  for(let k=0;k<queue.length;k++)for(const v of ADJ[queue[k]])if(d[v]===99){d[v]=d[queue[k]]+1;queue.push(v)}
  return d
})
const D = DIST.map(d=>Math.min(...[49,50,51,52].map(id=>d[id])))
assert.equal(N,53);assert.equal(ALL_CARDS.length,60);assert.equal(TYPES.length,17)
assert(ADJ.every((xs,i)=>xs.every(v=>ADJ[v].includes(i))))
assert.deepEqual(ADJ[21].slice().sort((a,b)=>a-b),[14,18,25,28])
assert(!ADJ[17].includes(14));assert.equal(D[0],7)
const randomGenerator = seed => {
 let s=seed>>>0
 return ()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}
}
function play(n,seed,mode='balanced',shift=0,roundOrder='fixed',startMode='fixed',openingBonus='none',finishRule='first',positionComp='none',orderComp='none',firstTurnAttacks='restricted',dropSwap='on'){
 if(!['restricted','open'].includes(firstTurnAttacks))throw Error('Unknown first-turn attack setting '+firstTurnAttacks)
 if(!['on','off'].includes(dropSwap))throw Error('Unknown Drop In swap setting '+dropSwap)
 const rnd=randomGenerator((seed*7919+n*101+5)>>>0)
 const shuffle=a=>{for(let i=a.length-1;i>0;i--){let j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
 const choice=a=>a[Math.floor(rnd()*a.length)]
 const deck=shuffle(ALL_CARDS.slice()),discard=[],board=new Map()
 const startRng=randomGenerator((Math.imul(seed,9719)+n*1823+91)>>>0)
 const startChoices=Array.from({length:7},(_,i)=>i)
 if(startMode!=='fixed')for(let i=6;i>0;i--){const j=Math.floor(startRng()*(i+1));[startChoices[i],startChoices[j]]=[startChoices[j],startChoices[i]]}
 const order=Array.from({length:n},(_,k)=>(k+shift)%n)
 const initialStarts=Array(n).fill(-1)
 if(startMode==='fixed')for(let p=0;p<n;p++)initialStarts[p]=p
 else if(startMode==='random')for(let p=0;p<n;p++)initialStarts[p]=startChoices[p]
 else if(['lateSafe1','lateSafe2','reverseTier'].includes(startMode)){
   const pool=startChoices.slice()
   const takePreferred=()=>{
     const i=pool.findIndex(cell=>cell>=4&&cell<=6)
     return pool.splice(i>=0?i:0,1)[0]
   }
   const reserved=startMode==='lateSafe1'?1:startMode==='lateSafe2'?Math.min(2,n):n
   for(let slot=n-1;slot>=n-reserved;slot--)initialStarts[order[slot]]=takePreferred()
   for(let slot=0;slot<n-reserved;slot++)initialStarts[order[slot]]=pool.shift()
 }else if(['weighted1p5','weighted2','weightedLate1p5','weightedLate2'].includes(startMode)){
   // Reverse weighted lottery: positive weights preserve EVERY start option for
   // EVERY actor slot. Bias favors the Shark-free 7-step cells 4/5/6.
   // This uses a separate seeded RNG; no card/tactic random stream is consumed.
   const pool=startChoices.slice()
   const maximum=startMode.endsWith('1p5')?1.5:2
   const lateOnly=startMode.includes('Late')
   for(let slot=n-1;slot>=0;slot--){
     const bias=lateOnly?(slot===n-1?maximum:slot===n-2?1+(maximum-1)/2:1)
       :1+(maximum-1)*(n===1?0:slot/(n-1))
     const weights=pool.map(cell=>cell>=4?bias:1)
     const total=weights.reduce((a,b)=>a+b,0)
     let ticket=startRng()*total,at=pool.length-1
     for(let k=0;k<pool.length;k++){
       ticket-=weights[k]
       if(ticket<0){at=k;break}
     }
     initialStarts[order[slot]]=pool.splice(at,1)[0]
   }
 }else throw Error('Unknown starting allocation '+startMode)
 assert.equal(new Set(initialStarts).size,n,'duplicate starting cell')
 assert(initialStarts.every(c=>c>=0&&c<7),'invalid starting cell')
 const players=Array.from({length:n},(_,i)=>({id:i,pos:initialStarts[i],e:2,down:false,hand:[],active:[],own:0,wasHit:0,targeted:0,act:0,wasDownAtStart:0}))
 const first=order[0], initialCount=ALL_CARDS.length
 const eligible=q=>finishRule==='first'||!BEACH.has(q.pos)
 const st={n,seed,shift,mode,first,winner:-1,winActorIndex:-1,rounds:16,finished:false,
   beachSameRound:0,totalTurns:0,moves:0,forcedBlocks:0,falls:0,sharkFalls:0,terrainFalls:0,
   playerFalls:0,stolen:0,hazardDiscard:0,emptyFall:0,attackActions:0,damageHits:0,
   defendedHits:0,dropIns:0,swaps:0,forcedDisplacements:0,opponentActions:0,
   targeted:Array(n).fill(0),attackedDistinct:0,fallsBySeat:Array(n).fill(0),hitsBySeat:Array(n).fill(0),sharkFallsBySeat:Array(n).fill(0),attackFallsBySeat:Array(n).fill(0),
   positions:Array(n).fill(0),draws:0,rescue:0,rescueChoices:{free:0,fin:0,float:0},
   noTactic:0,overflow:0,uses:{},byTypeDraw:{},openingAttacks:0,leadChanges:0,
   nominalFinishActor:0,blockedByRound:Array(16).fill(0),cardConservationChecks:0,preFirstFalls:0}
 function verify(){
   const zones=[...deck,...discard,...players.flatMap(p=>p.hand),...players.flatMap(p=>p.active.map(x=>x.card)),...[...board.values()].map(x=>x.card)]
   assert.equal(zones.length,60,'missing card');assert.equal(new Set(zones.map(c=>c.id)).size,60,'duplicate card')
   assert.equal(new Set(players.map(p=>p.pos)).size,n,'occupied cell overlap')
   assert(players.every(p=>p.e>=0&&p.e<=5&&p.down===(p.e===0)),'energy/down mismatch')
   assert.equal(st.falls,st.stolen+st.hazardDiscard+st.emptyFall,'fall-card accounting')
   st.cardConservationChecks++
 }
 function draw(p){
   if(p.hand.length>=5)return
   if(!deck.length && discard.length){deck.push(...discard.splice(0));shuffle(deck)}
   if(!deck.length)return
   const card=deck.pop();p.hand.push(card);st.draws++
   st.byTypeDraw[card.t]=(st.byTypeDraw[card.t]||0)+1
 }
 for(const p of players){draw(p);draw(p)}
 if(openingBonus==='last1'||openingBonus==='lastTwo1'||openingBonus==='lastPlus2')draw(players[order[n-1]])
 if(openingBonus==='lastTwo1'&&n>2)draw(players[order[n-2]])
 if(openingBonus==='lastPlus2')draw(players[order[n-1]])
 if(!['none','inner1','inner2','riskTier1','innerDraft','innerEnergy1'].includes(positionComp))throw Error('Unknown position compensation '+positionComp)
 for(const p of players){
   const inner=p.pos===1||p.pos===2
   if(positionComp==='inner1'&&inner)draw(p)
   if(positionComp==='inner2'&&inner){draw(p);draw(p)}
   if(positionComp==='riskTier1'&&p.pos<=3)draw(p)
   if(positionComp==='innerDraft'&&inner){
     if(p.hand.length<5)draw(p)
     const weak={'Energy':1,'Hang Loose':2,'Storm':2,'Cyclone':2,'Island':2,'Sunburn':4,'Energy x2':4,'Swimming Fin':3,'Lifeguard Float':4,'Stone':3,'Tsunami':4,'Jumping':3,'Amulet':6,'Change':6,'Big Wave':7,'Coconut':6,'Surf Current':8}
     const worst=p.hand.reduce((idx,card,i)=>((weak[card.t]??3)<(weak[p.hand[idx].t]??3)?i:idx),0)
     discard.push(p.hand.splice(worst,1)[0])
   }
   if(positionComp==='innerEnergy1'&&inner)p.e=3
 }
 if(!['none','lateInnerEnergy1','lateAllEnergy1','lastEnergy1'].includes(orderComp))throw Error('Unknown order compensation '+orderComp)
 if(orderComp!=='none'){
   for(let slot=0;slot<n;slot++){
     const p=players[order[slot]]
     const isLate=slot>=n-2
     const isLast=slot===n-1
     if((orderComp==='lateInnerEnergy1'&&isLate&&(p.pos===1||p.pos===2))
       ||(orderComp==='lateAllEnergy1'&&isLate)
       ||(orderComp==='lastEnergy1'&&isLast))p.e=Math.min(5,p.e+1)
   }
 }
 st.startCells=initialStarts.slice();st.openingCardCounts=players.map(p=>p.hand.length);st.openingEnergy=players.map(p=>p.e);st.bonus=openingBonus;st.startMode=startMode;st.positionComp=positionComp;st.orderComp=orderComp
 function use(p,t,location='discard'){
   const index=p.hand.findIndex(c=>c.t===t);if(index===-1)throw Error('missing '+t)
   const c=p.hand.splice(index,1)[0];st.uses[t]=(st.uses[t]||0)+1
   if(location==='discard')discard.push(c)
   return c
 }
 function contains(p,t){return p.hand.some(c=>c.t===t)}
 function amulet(p){return p.active.some(x=>x.card.t==='Amulet')}
 function loose(p){return p.active.some(x=>x.card.t==='Hang Loose')}
 function occupied(to,ignore=-1){return players.some(p=>p.id!==ignore&&p.pos===to)}
 function legalFrom(p,from){return ADJ[from].filter(to=>!occupied(to,p.id)&&board.get(to)?.card.t!=='Stone')}
 function available(p){return legalFrom(p,p.pos)}
 function missingFallCard(p,credit){
   if(!p.hand.length){st.emptyFall++;return}
   const i=Math.floor(rnd()*p.hand.length),card=p.hand.splice(i,1)[0]
   if(credit && credit!==p){credit.hand.push(card);st.stolen++
     if(credit.hand.length>5){const discardIx=mode==='aggressive'?Math.floor(rnd()*credit.hand.length):credit.hand.findIndex(c=>['Energy','Energy x2','Hang Loose'].includes(c.t))
       discard.push(credit.hand.splice(discardIx<0?credit.hand.length-1:discardIx,1)[0]);st.overflow++}
   }else{discard.push(card);st.hazardDiscard++}
 }
 function hurt(p,damage,kind,attacker=null){
   if(p.down||damage<=0)return false
   if(kind==='attack' && amulet(p)){st.defendedHits++;return false}
   p.e=Math.max(0,p.e-damage);st.damageHits++;st.hitsBySeat[p.id]++
   if(!p.e){p.down=true;st.falls++;st.fallsBySeat[p.id]++;if(p.own===0)st.preFirstFalls++
     if(kind==='shark'){st.sharkFalls++;st.sharkFallsBySeat[p.id]++}
     else if(kind==='terrain')st.terrainFalls++
     else {st.playerFalls++;st.attackFallsBySeat[p.id]++}
     missingFallCard(p,attacker)
   }
   return true
 }
 function arrival(p,from,to,credit=null,redirected=false){
   if(SHARK.has(to))hurt(p,2,credit?'attack':'shark',credit)
   if(!p.down){
    const tile=board.get(to)
    if(tile){
     if(tile.card.t==='Storm')hurt(p,1,credit?'attack':'terrain',credit)
     if(tile.card.t==='Island'){p.e=Math.min(5,p.e+2);board.delete(to);discard.push(tile.card)}
     if(tile.card.t==='Cyclone'&&!redirected){
      const exits=legalFrom(p,to).filter(w=>w!==from)
      if(exits.length){const dest=choice(exits);p.pos=dest;arrival(p,to,dest,credit,true)}
     }
    }
   }
 }
 function enter(p,to,credit=null,redirected=false){
   const from=p.pos
   if(p.down||!ADJ[from].includes(to)||occupied(to,p.id)||board.get(to)?.card.t==='Stone')return false
   p.pos=to;st.moves++;arrival(p,from,to,credit,redirected)
   return true
 }
 function relocateSwap(p,q,initiator){
   const from=p.pos, to=q.pos
   if(p.down||q.down || from===to)return false
   p.pos=to;q.pos=from;st.forcedDisplacements++
   arrival(p,from,to,p===initiator?null:initiator)
   arrival(q,to,from,q===initiator?null:initiator)
   return true
 }
 function exposed(p){return players.filter(q=>q!==p&&!q.down&&eligible(q)&&DIST[p.pos][q.pos]<=3)}
 function expire(p){
   for(let i=p.active.length-1;i>=0;i--)if(p.active[i].expires<=p.own){discard.push(p.active.splice(i,1)[0].card)}
   for(const [v,placed] of board)if(placed.owner===p.id&&placed.expires<=p.own){board.delete(v);discard.push(placed.card)}
 }
 function recover(p){
   if(!p.down)return false
   st.rescue++
   const hasFloat=contains(p,'Lifeguard Float'),hasFin=contains(p,'Swimming Fin')
   const spend=mode==='aggressive'?(hasFloat&&rnd()<.25?'Lifeguard Float':hasFin&&rnd()<.20?'Swimming Fin':null):hasFloat&&rnd()<.7?'Lifeguard Float':hasFin&&rnd()<.65?'Swimming Fin':null
   if(spend){use(p,spend);p.e=spend==='Lifeguard Float'?3:2;st.rescueChoices[spend==='Lifeguard Float'?'float':'fin']++}
   else{p.e=1;st.rescueChoices.free++}
   p.down=false
   return !!spend
 }
 function placement(p,t){
  if(t==='Stone'&&[...board.values()].some(b=>b.owner===p.id&&b.card.t==='Stone'))return false
  const cells=[]
  for(let to=7;to<49;to++){
   if(SHARK.has(to)||occupied(to)||board.has(to)||to===p.pos||DIST[p.pos][to]>2)continue
   let score=-1
   const others=players.filter(q=>q!==p&&!q.down&&eligible(q))
   if(t==='Stone'){score=Math.max(...others.map(q=>(D[to]<D[q.pos]&&ADJ[q.pos].includes(to)?5:0))) -Math.abs(D[p.pos]-D[to])*.1}
   if(t==='Storm'){score=Math.max(...others.map(q=>ADJ[q.pos].includes(to)?3:0))}
   if(t==='Island'){score=ADJ[p.pos].includes(to)&&D[to]<D[p.pos]?4:0}
   if(t==='Cyclone'){score=Math.max(...others.map(q=>ADJ[q.pos].includes(to)?3:0))}
   if(score>0)cells.push({to,score})
  }
  if(!cells.length)return false
  cells.sort((a,b)=>b.score-a.score||a.to-b.to)
  const bestScore=cells[0].score
  const to=choice(cells.filter(c=>c.score===bestScore)).to,card=use(p,t,'keep')
  board.set(to,{card,owner:p.id,expires:t==='Stone'?p.own+3:Infinity})
  return true
 }
 function jump(p){
   const options=[...board].filter(([to])=>ADJ[p.pos].includes(to))
   if(!options.length)return false
   const [to,v]=options.sort((a,b)=>D[a[0]]-D[b[0]])[0]
   use(p,'Jumping');board.delete(to);discard.push(v.card);return true
 }
 function direct(p,type){
   const dmg=type==='Big Wave'?2:1,range=type==='Big Wave'?2:3
   const qs=players.filter(q=>q!==p&&!q.down&&eligible(q)&&!amulet(q)&&DIST[p.pos][q.pos]<=range)
   if(!qs.length)return false
   qs.sort((a,b)=>(a.e<=dmg?0:1)-(b.e<=dmg?0:1)||D[a.pos]-D[b.pos]||a.id-b.id)
   const q= mode==='aggressive' ? qs[0] : (rnd()<.20 ? choice(qs) : qs[0])
   use(p,type);st.attackActions++;st.opponentActions++;st.targeted[q.id]++;q.targeted++
   if(p.own===1)st.openingAttacks++
   hurt(q,dmg,'attack',p);return true
 }
 function change(p){
   const qs=players.filter(q=>q!==p&&!q.down&&eligible(q)&&!amulet(q)&&DIST[p.pos][q.pos]<=2&&D[q.pos]<D[p.pos])
   if(!qs.length)return false
   qs.sort((a,b)=>D[a.pos]-D[b.pos]);const q=qs[0]
   use(p,'Change');st.opponentActions++;st.targeted[q.id]++;q.targeted++
   relocateSwap(p,q,p);return true
 }
 function tsunami(p){
  const candidate=[]
  for(let row=1;row<14;row++){
   if(!layout.cells.some(c=>c.row===row&&DIST[p.pos][c.id]<=2))continue
   const opponents=players.filter(q=>q!==p&&!q.down&&eligible(q)&&!amulet(q)&&ROW[q.pos]===row)
   const movable=opponents.filter(q=>ADJ[q.pos].some(to=>ROW[to]<ROW[q.pos]&&!occupied(to,q.id)&&board.get(to)?.card.t!=='Stone'))
   if(movable.length)candidate.push({row,movable})
  }
  if(!candidate.length)return false
  candidate.sort((a,b)=>b.movable.length-a.movable.length)
  const row=candidate[0].row;use(p,'Tsunami')
  const targets=players.filter(q=>q!==p&&!q.down&&eligible(q)&&!amulet(q)&&ROW[q.pos]===row).sort((a,b)=>a.pos-b.pos)
  let pushed=0
  for(const q of targets){
    const opts=ADJ[q.pos].filter(to=>ROW[to]<ROW[q.pos]&&!occupied(to,q.id)&&board.get(to)?.card.t!=='Stone')
    if(!opts.length)continue
    opts.sort((a,b)=>D[b]-D[a])
    if(enter(q,opts[0],p)){pushed++;st.targeted[q.id]++;q.targeted++}
  }
  st.opponentActions+=pushed;st.forcedDisplacements+=pushed
  return true
 }
 function drop(p){
   const qs=players.filter(q=>q!==p&&!q.down&&eligible(q)&&!amulet(q)&&!loose(q)&&ADJ[p.pos].includes(q.pos))
   if(!qs.length)return false
   qs.sort((a,b)=>D[a.pos]-D[b.pos]);const q=qs[0]
   const roll=e=>Math.max(...Array.from({length:e===1?1:2},()=>1+Math.floor(rnd()*6)))
   st.dropIns++;st.attackActions++;st.opponentActions++;st.targeted[q.id]++;q.targeted++
   const atk=roll(p.e),def=roll(q.e)
   if(atk>def){hurt(q,1,'attack',p)
     if(dropSwap==='on'&&!p.down&&!q.down&&D[q.pos]<D[p.pos]&&(mode==='aggressive'||rnd()<.80)){
       relocateSwap(p,q,p);st.swaps++;return 'moveSpent'
     }
   }else if(def>atk)hurt(p,1,'attack',q)
   return true
 }
 function navigation(p){
   const moves=available(p)
   if(!moves.length){st.forcedBlocks++;st.blockedByRound[Math.min(15,p.own-1)]++;return false}
   const candidates=moves.map(to=>({to,score:D[to]*4 +(SHARK.has(to)?(p.e<=2?1.0:.6):0)+(board.get(to)?.card.t==='Storm'&&p.e===1?2:0)+(D[to]>D[p.pos]?3:0)}))
   const min=Math.min(...candidates.map(x=>x.score)),best=candidates.filter(x=>x.score===min)
   const to=choice(best).to
   return enter(p,to)
 }
 function tactical(p,allowAttacks){
   let actions=[]
   // Full candidate card palette; chosen according to fixed transparent scripted priorities.
   if(allowAttacks){
    for(const t of ['Big Wave','Sunburn'])if(contains(p,t)){const range=t==='Big Wave'?2:3,dmg=t==='Big Wave'?2:1
      if(players.some(q=>q!==p&&!q.down&&eligible(q)&&!amulet(q)&&DIST[p.pos][q.pos]<=range))actions.push({key:t,score:mode==='aggressive'?8:5+(players.some(q=>q!==p&&!q.down&&eligible(q)&&!amulet(q)&&DIST[p.pos][q.pos]<=range&&q.e<=dmg)?3:0)})}
    if(contains(p,'Change')&&players.some(q=>q!==p&&!q.down&&eligible(q)&&!amulet(q)&&DIST[p.pos][q.pos]<=2&&D[q.pos]<D[p.pos]))actions.push({key:'Change',score:9})
    if(contains(p,'Tsunami')&&players.some(q=>q!==p&&!q.down&&eligible(q)&&!amulet(q)&&ROW[q.pos]>0&&ROW[q.pos]<14&&DIST[p.pos][q.pos]<=2))actions.push({key:'Tsunami',score:3})
    if(players.some(q=>q!==p&&!q.down&&eligible(q)&&!amulet(q)&&ADJ[p.pos].includes(q.pos)&&!loose(q)&&!amulet(q)))actions.push({key:'Drop In',score:mode==='aggressive'?7:3})
   }
   if(contains(p,'Surf Current')&&D[p.pos]>=2)actions.push({key:'Surf Current',score:mode==='aggressive'?8:7})
   for(const [key,amount] of [['Coconut',5],['Energy x2',2],['Energy',1]])if(contains(p,key)&&p.e<=(key==='Coconut'?3:key==='Energy x2'?3:2))actions.push({key,score:p.e<=1?8:4})
   if(contains(p,'Amulet')&&!amulet(p)&&exposed(p).length)actions.push({key:'Amulet',score:mode==='aggressive'?3:9})
   if(contains(p,'Hang Loose')&&!loose(p)&&players.some(q=>q!==p&&ADJ[p.pos].includes(q.pos)))actions.push({key:'Hang Loose',score:3})
   if(contains(p,'Jumping')&&[...board].some(([to])=>ADJ[p.pos].includes(to)))actions.push({key:'Jumping',score:6})
   for(const type of ['Stone','Storm','Island','Cyclone'])if(contains(p,type))actions.push({key:type,score:type==='Stone'?5:type==='Island'&&p.e<=3?6:mode==='aggressive'?2:4})
   if(!actions.length){st.noTactic++;return false}
   // Controlled soft randomness makes full deck accessible while preserving a coherent policy.
   const sorted=actions.map(a=>({...a,noise:rnd()*(mode==='aggressive'?2:3)})).sort((a,b)=>(b.score+b.noise)-(a.score+a.noise))
   for(const {key} of sorted){
     if(key==='Drop In'){const r=drop(p);if(r)return r}
     else if(key==='Surf Current'){
       if(!available(p).length)continue
       use(p,key);const before=st.moves
       if(navigation(p)&&!p.down&&!BEACH.has(p.pos)&&available(p).length)navigation(p)
       return st.moves>before?'moveSpent':true
     }
     else if(key==='Big Wave'||key==='Sunburn'){if(direct(p,key))return true}
     else if(key==='Change'){if(change(p))return 'moveSpent'}
     else if(key==='Tsunami'){if(tsunami(p))return true}
     else if(key==='Jumping'){if(jump(p))return true}
     else if(['Stone','Storm','Island','Cyclone'].includes(key)){if(placement(p,key))return true}
     else if(key==='Amulet'||key==='Hang Loose'){
       const card=use(p,key,'active');p.active.push({card,expires:p.own+1});return true
     }else if(['Coconut','Energy x2','Energy'].includes(key)){
       use(p,key);p.e=key==='Coconut'?5:Math.min(5,p.e+(key==='Energy'?1:2));return true
     }
   }
   st.noTactic++;return false
 }
 let observedFinishers=new Set()
 let firstRoundWinner=null
 for(let round=1;round<=16;round++){
   const beforeLead=[...players].sort((a,b)=>D[a.pos]-D[b.pos])[0]?.id
   // Round-robin first-player token is a simpler alternative to reverse-turn
     // ("snake") order: 2,3,...,N,1 follows 1,2,...,N, without a double turn.
     const activeOrder=roundOrder==='rotate'
       ?order.slice((round-1)%n).concat(order.slice(0,(round-1)%n))
       :roundOrder==='snake'&&round%2===0?[...order].reverse():order
   for(let actorIndex=0;actorIndex<n;actorIndex++){
     const p=players[activeOrder[actorIndex]]
     if(BEACH.has(p.pos))continue
     st.totalTurns++
     p.own++;expire(p)
     const tail=st.finished&&finishRule==='first'
     const rescued=recover(p)
     const moveBefore=st.moves
     let tactic=false
     if(!tail&&!rescued&&!p.down){tactic=tactical(p,firstTurnAttacks==='open'||p.own>1)}
     if(!p.down&&!BEACH.has(p.pos)&&tactic!=='moveSpent')navigation(p)
     if(!tail&&!p.down&&st.moves>moveBefore)draw(p)
     if(BEACH.has(p.pos)){
       observedFinishers.add(p.id)
       if(!st.finished){st.finished=true;st.winner=p.id;st.rounds=round;st.winActorIndex=actorIndex;st.nominalFinishActor=p.id}
     }
     verify()
   }
   verify()
   if(st.finished){
     st.beachSameRound=observedFinishers.size
     st.finishers=[...observedFinishers]
     if(finishRule!=='first'){
       const entrants=st.finishers.slice()
       const lottery=randomGenerator((Math.imul(seed,33331)+n*991+shift*37+8277)>>>0)
       if(finishRule==='roundRandom')st.winner=entrants[Math.floor(lottery()*entrants.length)]
       else if(finishRule==='roundReverse')st.winner=entrants.reduce((v,u)=>order.indexOf(u)>order.indexOf(v)?u:v)
       else if(finishRule==='roundEnergy'){
         const maxEnergy=Math.max(...entrants.map(id=>players[id].e))
         const tied=entrants.filter(id=>players[id].e===maxEnergy)
         st.winner=tied[Math.floor(lottery()*tied.length)]
       }else throw Error('Unknown finish rule '+finishRule)
       st.winActorIndex=activeOrder.indexOf(st.winner)
     }
     break
   }
   const afterLead=[...players].sort((a,b)=>D[a.pos]-D[b.pos])[0]?.id
   if(beforeLead!==afterLead)st.leadChanges++
 }
 if(!st.finished)st.beachSameRound=0
 st.finishRule=finishRule
 st.positions=players.map(p=>p.pos)
 st.attackedDistinct=st.targeted.filter(v=>v>0).length
 st.maxTargetShare=st.opponentActions?Math.max(...st.targeted)/st.opponentActions:0
 verify()
 return st
}
function aggregate(games){
 const n=games[0].n,keys=['rounds','totalTurns','moves','falls','sharkFalls','terrainFalls','playerFalls','stolen','hazardDiscard','emptyFall','attackActions','dropIns','swaps','forcedDisplacements','opponentActions','attackedDistinct','maxTargetShare','forcedBlocks','draws','rescue','overflow','leadChanges','beachSameRound']
 const means=Object.fromEntries(keys.map(k=>[k,Math.round(games.reduce((s,g)=>s+g[k],0)/games.length*1000)/1000]))
 const uses=Object.fromEntries(TYPES.map(([k])=>[k,games.reduce((s,g)=>s+(g.uses[k]||0),0)]))
 const wins=Array(n).fill(0),finish=games.filter(g=>g.finished).length
 for(const g of games)if(g.winner>=0)wins[g.winner]++
 const earliest=games.filter(g=>g.finished&&g.winner===g.first).length
 const multipleFinish=games.filter(g=>g.beachSameRound>=2).length
 return {games:games.length,n,finished:finish,firstActorPct:Math.round(earliest/games.length*1000)/10,cofinishPct:Math.round(multipleFinish/games.length*1000)/10,
  wins,means,uses,unplayedTypes:Object.keys(uses).filter(x=>uses[x]===0),maxCardIntegrityChecks:Math.min(...games.map(x=>x.cardConservationChecks))}
}
function main(){
 const samples=+(process.env.SK_SEEDS||200),results=[]
 assert(samples>0&&samples<=10000)
 for(const n of [2,4,7])for(const mode of ['balanced','aggressive']){
  let forward=[],reverse=[]
  for(let i=1;i<=samples;i++){
    const a=play(n,i,mode,0),b=play(n,i,mode,n-1)
    forward.push(a);reverse.push(b)
  }
  results.push({n,policy:mode,normal:aggregate(forward),rotated:aggregate(reverse)})
 }
 console.log(JSON.stringify({simulation:'R0 full active 17-type fixture (independent model)',seeds:samples,
  layouts:{cells:N,edgeLinks:ADJ.reduce((v,a)=>v+a.length,0)/2,source:'src/map/layout/board-layout.json'},
  results},null,2))
}
if(require.main===module)main()
module.exports={play,aggregate,D,ADJ,TYPES}
