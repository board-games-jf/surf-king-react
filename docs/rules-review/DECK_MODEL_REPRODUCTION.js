// Reproducible, standalone experimental model (NOT application gameplay code).
// See experiment reports A-D for source hashes and unapproved assumptions.
function simulateDeckStudy(layout, counts, effects, drawPolicy, n, policyMode, seed){
 const RNG=()=>{let v=seed>>>0;return()=>{v=(Math.imul(v,1664525)+1013904223)>>>0;return v/4294967296}};const rnd=RNG();
 const pick=a=>a[Math.floor(rnd()*a.length)];const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
 const cells=layout.cells;const r=layout.hexRadius;const adj=cells.map(c=>cells.filter(d=>c.id!==d.id&&Math.abs(Math.hypot(c.x-d.x,c.z-d.z)-Math.sqrt(3)*r)<.005).map(d=>d.id));if(adj[21].slice().sort((a,b)=>a-b).join(",")!=="14,18,25,28")throw Error("geometry drift");
 const D=Array(53).fill(99);const queue=[];for(let i=49;i<53;i++){D[i]=0;queue.push(i)}for(let q=0;q<queue.length;q++){const u=queue[q];for(const v of adj[u])if(D[v]>D[u]+1){D[v]=D[u]+1;queue.push(v)}}
 const initialQty={...counts},cards=[];for(const [name,num] of Object.entries(counts)){for(let i=0;i<num;i++)cards.push({id:cards.length,t:name})}
 shuffle(cards);const deck=cards.slice(),discard=[],players=Array.from({length:n},(_,i)=>({seat:i,pos:i,e:2,down:false,hand:[],active:[],route:policyMode==="direct"?"direct":(["direct","cautious","aggressive"][(i+seed)%3]),history:[]})),sharks=new Set([28,29,30,31]),board=new Map(),allTypes=Object.keys(counts);const order=Array.from({length:n},(_,i)=>(i+seed%n)%n);
 const m={round:16,finished:0,firstMoverWin:0,winner:-1,maneuvers:0,blocked:0,falls:0,sharkFalls:0,terrainFalls:0,attackFalls:0,stolen:0,discardedByFall:0,emptyFall:0,overflow:0,draws:0,deadDraw:0,uses:0,duels:0,attackCards:0,protection:0,place:0,swap:0,push:0,jump:0,speedUsed:0,extraSteps:0,rescues:0,rescueLost:0,backward:0,energyAtWin:0,handAtWin:0,usesByType:{},drawnByType:{},winsBySeat:Array(n).fill(0)};
 function note(a){m[a]=(m[a]||0)+1}
 function bump(t){m.usesByType[t]=(m.usesByType[t]||0)+1;m.uses++}
 function zoneTake(a){return a.splice(Math.floor(rnd()*a.length),1)[0]}
 function lowCardScore(c){const t=c.t;return t==="BottledWater"?0:t==="Energy"?1:t==="EnergyX3"?2:t==="SurfCurrent"?3:t==="LifeGuardFloat"?5:t==="SwimmingFin"?4:t==="BigWave"?4:2}
 function cap(p){while(p.hand.length>5){let idx=drawPolicy==="choice" ? p.hand.map(lowCardScore).indexOf(Math.min(...p.hand.map(lowCardScore))):Math.floor(rnd()*p.hand.length);discard.push(p.hand.splice(idx,1)[0]);note("overflow")}}
 function give(p,c){p.hand.push(c);cap(p)}
 function draw(p){if(drawPolicy==="skip"&&p.hand.length>=5)return;if(deck.length===0){if(discard.length){deck.push(...discard.splice(0));shuffle(deck)}else return}const c=deck.pop();give(p,c);note("draws");m.drawnByType[c.t]=(m.drawnByType[c.t]||0)+1}
 function use(p,t,location){const i=p.hand.findIndex(c=>c.t===t);if(i<0)throw Error("Card absent "+t);const c=p.hand.splice(i,1)[0];if(location==="active")p.active.push({card:c,until:currentRound+1});else if(location==="board"){if(!candidateCell)throw Error("No placement");board.set(candidateCell,{card:c,owner:p.seat,type:t,expire:t==="Stone"?currentRound+3:99})}else discard.push(c);bump(t);return c}
 let currentRound=0,candidateCell=null;
 function validMove(p,to){return adj[p.pos].includes(to)&&!sharks.has(-1)&&!(board.get(to)?.type==="Stone")&&!players.some(o=>o!==p&&o.pos===to)}
 function transferFallCard(target,attacker){if(target.hand.length===0){note("emptyFall");return}const c=zoneTake(target.hand);if(c.t==="SwimmingFin"||c.t==="LifeGuardFloat")note("rescueLost");if(attacker&&attacker!==target){give(attacker,c);note("stolen")}else{discard.push(c);note("discardedByFall")}}
 function damage(p,amount,cause,attacker){if(p.down||amount<=0)return;let shield=p.active.find(z=>z.card.t==="BottledWater");if(shield&&cause!=="attack"){amount=Math.max(0,amount-1);discard.push(shield.card);p.active.splice(p.active.indexOf(shield),1)}
 if(p.active.some(z=>z.card.t==="Amulet")&&cause==="attack")return;
 p.e=Math.max(0,p.e-amount);if(p.e===0){p.down=true;note("falls");if(cause==="shark")note("sharkFalls");else if(cause==="attack")note("attackFalls");else note("terrainFalls");transferFallCard(p,attacker)}}
 function enter(p,to,forcing,from,depth){if(!validMove(p,to)&&!(forcing&&adj[p.pos].includes(to)&&!players.some(o=>o!==p&&o.pos===to)&&board.get(to)?.type!=="Stone"))return false;
 const prior=p.pos;p.pos=to;if(D[to]>D[prior])note("backward");p.history.push(to);note("maneuvers");
 if(sharks.has(to))damage(p,2,"shark",forcing&&effects==="revised"?forcing:null);
 const tile=board.get(to);
 if(tile&&!p.down){if(tile.type==="Storm")damage(p,1,"terrain",null);
 if(tile.type==="Island"){p.e=Math.min(5,p.e+2);if(effects==="revised"){discard.push(tile.card);board.delete(to)}}
 if(tile.type==="Cyclone"&&depth<1){const neigh=adj[to].filter(v=>v!==prior&&validMove(p,v));if(neigh.length){let dest=pick(neigh);enter(p,dest,forcing,to,depth+1)}}}
 return true}
 function expirations(p){for(let j=p.active.length-1;j>=0;j--)if(p.active[j].until<=currentRound){discard.push(p.active[j].card);p.active.splice(j,1)}
 for(const [cell,b] of board)if(b.owner===p.seat&&b.expire<=currentRound){discard.push(b.card);board.delete(cell)}}
 function beach(){return players.find(p=>p.pos>=49)}
 function byProximity(p){return players.filter(o=>o!==p&&!o.down).sort((a,b)=>D[a.pos]-D[b.pos]||rnd()-.5)}
 function targetRange(p,q){if(effects==="legacy")return true;return Dgraph(p.pos,q.pos)}
 function Dgraph(a,b){if(a===b)return 0;const visit=new Set([a]);let Q=[[a,0]];for(let k=0;k<Q.length;k++){let [u,d]=Q[k];for(let v of adj[u])if(!visit.has(v)){if(v===b)return d+1;visit.add(v);Q.push([v,d+1])}}return 99}
 function nearCardTargets(p,type){const max=(type==="BigWave"?2:3);return byProximity(p).filter(o=>effects==="legacy"||Dgraph(p.pos,o.pos)<=max).filter(o=>!o.active.some(z=>z.card.t==="Amulet")).sort((a,b)=>a.e-b.e||D[a.pos]-D[b.pos])}
 function findPlacement(p,type){let targets=[];for(let v=7;v<49;v++){if(sharks.has(v)||board.has(v)||players.some(o=>o.pos===v))continue;if(effects==="revised"&&Dgraph(p.pos,v)>2)continue;if(type==="Island"){if(adj[p.pos].includes(v))targets.push({v,score:4-D[v]*.03})}else{for(const o of players)if(o!==p){const w=adj[o.pos].includes(v)?3:0;const score=w+(D[v]<D[o.pos]?1:0)-(Dgraph(p.pos,v)>.99?0.1:0);if(score>=2.5)targets.push({v,score})}}}return targets.sort((a,b)=>b.score-a.score)[0]?.v??null}
 function useOne(p){let avail=[...new Set(p.hand.map(c=>c.t))],options=[],others=byProximity(p),leadDist=others.length?D[others[0].pos]-D[p.pos]:0;const add=(t,score,payload)=>options.push({t,score:score+rnd()*.7,payload});
 for(const t of avail){if(["Energy","EnergyX2","EnergyX3","Coconut"].includes(t)){let plus=t==="Coconut"?5:t==="Energy"?1:t==="EnergyX2"?2:3;if(p.e<5)add(t,1.2+Math.min(5-p.e,plus)*.7+(p.e<=2?1:0))}
 else if(t==="BottledWater"){if(effects==="revised"&&p.e<=2)add(t,2.5);else note("deadDraw")}
 else if(t==="BigWave"||t==="Sunburn"){const q=nearCardTargets(p,t)[0];if(q)add(t,3.2+(q.e<=(t==="BigWave"?2:1)?2:0)+(D[q.pos]<D[p.pos]?0.6:0),q)}
 else if(t==="Change"){let q=others.find(o=>D[o.pos]+1<D[p.pos]&&(effects==="legacy"||Dgraph(p.pos,o.pos)<=2));if(q)add(t,4+(D[p.pos]-D[q.pos])*.3,q)}
 else if(t==="HangLoose"||t==="Amulet"){if(others.some(o=>Dgraph(p.pos,o.pos)<=2)||p.e<=1)add(t,2.3+(p.e<=1?1:0))}
 else if(t==="Jumping"){let cells=[...board.keys()].filter(c=>effects==="legacy"||Dgraph(p.pos,c)===1).filter(c=>board.get(c)?.owner!==p.seat);if(effects==="legacy")cells=[...cells,...sharks];if(cells.length)add(t,2.5, cells.sort((a,b)=>D[a]-D[b])[0])}
 else if(["Stone","Storm","Island","Cyclone"].includes(t)){let c=findPlacement(p,t);if(c!==null)add(t,t==="Island"?(p.e<4?3:1.9):3.1,c)}
 else if(t==="Tsunami"){let targets=others.filter(o=>effects==="legacy"||Dgraph(p.pos,o.pos)<=2);if(targets.length)add(t,3.5,targets[0].pos)}
 else if(t==="SurfCurrent"){if(D[p.pos]>=2&&adj[p.pos].some(v=>validMove(p,v)))add(t,4+(leadDist<0?1:0))}
 }
 const duelTargets=others.filter(o=>adj[p.pos].includes(o.pos)&&!o.active.some(z=>["HangLoose","Amulet"].includes(z.card.t)));if(duelTargets.length&&p.e>0){let q=duelTargets[0];add("DROPIN",2.5+(q.e<=p.e?1.4:0)+(D[q.pos]<D[p.pos]?0.5:0),q)}
 options.sort((a,b)=>b.score-a.score);if(!options.length||options[0].score<2.5||rnd()<.14)return {spent:false,replaces:false,speed:false};const o=options[0],t=o.t;
 if(t==="DROPIN"){let q=o.payload;note("duels");const roll=x=>Math.max(...Array.from({length:x.e>=2?2:1},()=>1+Math.floor(rnd()*6)));const A=roll(p),B=roll(q);if(A>B)damage(q,1,"attack",p);else if(B>A)damage(p,1,"attack",q);return {spent:true,replaces:false,speed:false}}
 if(t==="BigWave"||t==="Sunburn"){use(p,t);note("attackCards");damage(o.payload,t==="BigWave"?2:1,"attack",p)}
 else if(["Energy","EnergyX2","EnergyX3","Coconut"].includes(t)){use(p,t);const gain=t==="Coconut"?5:t==="Energy"?1:t==="EnergyX2"?2:3;p.e=t==="Coconut"?5:Math.min(5,p.e+gain)}
 else if(t==="BottledWater"){use(p,t,"active")}
 else if(t==="Amulet"||t==="HangLoose"){use(p,t,"active");note("protection")}
 else if(t==="Jumping"){use(p,t);const v=o.payload;if(sharks.has(v)){sharks.delete(v)}else{const b=board.get(v);if(b){discard.push(b.card);board.delete(v)}}note("jump")}
 else if(["Stone","Storm","Island","Cyclone"].includes(t)){candidateCell=o.payload;use(p,t,"board");note("place");candidateCell=null}
 else if(t==="Tsunami"){use(p,t);let row=cells[o.payload].row;let targets=players.filter(q=>q!==p&&!q.down&&cells[q.pos].row===row).sort((a,b)=>a.pos-b.pos);for(const q of targets){if(q.active.some(z=>z.card.t==="Amulet"))continue;let choices=adj[q.pos].filter(v=>cells[v].row<cells[q.pos].row&&validMove(q,v));if(choices.length){let to=pick(choices);enter(q,to,effects==="revised"?p:null,q.pos,0);note("push")}}}
 else if(t==="Change"){const q=o.payload;use(p,t);const prev=p.pos;p.pos=q.pos;q.pos=prev;note("swap");note("maneuvers");if(sharks.has(p.pos))damage(p,2,"shark",effects==="revised"?q:null);if(sharks.has(q.pos))damage(q,2,"shark",effects==="revised"?p:null);return {spent:true,replaces:effects==="revised",speed:false}}
 else if(t==="SurfCurrent"){use(p,t);note("speedUsed");return {spent:true,replaces:false,speed:true}}
 return {spent:true,replaces:false,speed:false}
 }
 function chooseStep(p){const opts=adj[p.pos].filter(v=>validMove(p,v));if(!opts.length)return null;const score=v=>D[v]+(p.route==="cautious"&&sharks.has(v)?2.2:0)+(p.route==="aggressive"&&sharks.has(v)?-.15:0)+(board.get(v)?.type==="Storm"?1.1:0)+(board.get(v)?.type==="Cyclone"?.5:0)+rnd()*.9;const arr=opts.map(v=>({v,s:score(v)})).sort((a,b)=>a.s-b.s);return arr[0].v}
 players.forEach(p=>{draw(p);draw(p)});
 const maxRounds=16;
 for(let round=1;round<=maxRounds;round++){currentRound=round;for(const seat of order){const p=players[seat];expirations(p);let tactic={spent:false,replaces:false,speed:false};if(p.down){p.down=false;let t=p.hand.some(c=>c.t==="LifeGuardFloat")?"LifeGuardFloat":p.hand.some(c=>c.t==="SwimmingFin")?"SwimmingFin":null;p.e=t==="LifeGuardFloat"?3:t==="SwimmingFin"?2:1;if(t){use(p,t);note("rescues");tactic.spent=true}}if(!tactic.spent)tactic=useOne(p);if(beach()){m.finished=1;m.winner=beach().seat;m.round=round;break}if(!p.down&&!tactic.replaces){let steps=tactic.speed?2:1,ok=false;for(let k=0;k<steps;k++){const next=chooseStep(p);if(next===null){if(!ok)note("blocked");break}let old=p.pos;if(!enter(p,next,null,old,0))throw Error("illegal movement");ok=true;if(k===1)note("extraSteps");if(p.down||p.pos>=49)break}if(ok)draw(p)}
 if(beach()){m.finished=1;m.winner=beach().seat;m.round=round;break}
 }if(m.finished)break}
 if(m.finished){m.firstMoverWin=order[0]===m.winner?1:0;m.winsBySeat[m.winner]=1;m.energyAtWin=players[m.winner].e;m.handAtWin=players[m.winner].hand.length}
 // Conservation and occupancy assertions (fixed sharks are not physical cards).
 const buckets=[...deck,...discard,...players.flatMap(p=>p.hand),...players.flatMap(p=>p.active.map(x=>x.card)),...[...board.values()].map(b=>b.card)];
 if(buckets.length!==cards.length)throw Error("Card count lost "+buckets.length+"/"+cards.length+" seed "+seed);
 const ids=buckets.map(c=>c.id);if(new Set(ids).size!==ids.length||ids.some(id=>id<0||id>=cards.length))throw Error("Card duplicate/missing "+seed);
 const positions=players.map(p=>p.pos);if(new Set(positions).size!==positions.length)throw Error("Surfer overlap "+seed);
 if(m.falls!==m.stolen+m.discardedByFall+m.emptyFall)throw Error("Fall not conserved");
 return m
}

function runBatch(layout,counts,effects,drawPolicy,seeds=100){
 const out=[];for(const n of [2,4,7])for(const policy of ["direct","mixed"]){const m=[];for(let k=1;k<=seeds;k++){const seed=(k*7919+n*101+ (policy==="mixed"?997:0))>>>0;m.push(simulateDeckStudy(layout,counts,effects,drawPolicy,n,policy,seed))}
 const keys=["finished","firstMoverWin","round","maneuvers","blocked","falls","sharkFalls","terrainFalls","attackFalls","stolen","discardedByFall","emptyFall","overflow","draws","deadDraw","uses","duels","attackCards","protection","place","swap","push","jump","speedUsed","extraSteps","rescues","rescueLost","backward","energyAtWin","handAtWin"];let mean={};for(let key of keys)mean[key]=Math.round(m.reduce((s,o)=>s+o[key],0)/seeds*100)/100;let used={},drawn={},wins=Array(n).fill(0);for(let item of m){for(const [k,v] of Object.entries(item.usesByType))used[k]=(used[k]||0)+v;for(const [k,v] of Object.entries(item.drawnByType))drawn[k]=(drawn[k]||0)+v;for(let i=0;i<n;i++)wins[i]+=item.winsBySeat[i]}out.push({n,policy,runs:seeds,mean,wins,uses:used,drawn})}return out
}

// Counts must be read from SurfKingGame.createDeck() and DECK_REBALANCE_PROPOSAL.md.
// Build a layout object from src/map/layout/board-layout.json and run runBatch(layout,counts,mode,drawPolicy,100).
