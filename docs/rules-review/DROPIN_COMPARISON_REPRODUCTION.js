// Standalone Drop In damage-only vs optional-position-exchange experiment; NOT production gameplay code.
function simulateDropInComparison(layout,counts,n,withSwap,seed){
 let x=seed>>>0;const rand=()=>((x=(Math.imul(x,1664525)+1013904223)>>>0)/4294967296);
 const cells=layout.cells,sharks=new Set([28,29,30,31]),adj=cells.map(p=>cells.filter(q=>p.id!==q.id&&Math.abs(Math.hypot(p.x-q.x,p.z-q.z)-Math.sqrt(3)*layout.hexRadius)<.005).map(q=>q.id));
 const distance=Array(53).fill(99),queue=[];for(let i=49;i<=52;i++){distance[i]=0;queue.push(i)}for(let k=0;k<queue.length;k++)for(const v of adj[queue[k]])if(distance[v]>distance[queue[k]]+1){distance[v]=distance[queue[k]]+1;queue.push(v)}
 let cards=[];for(const [t,v] of Object.entries(counts))for(let k=0;k<v;k++)cards.push({id:cards.length,t});
 for(let i=cards.length-1;i>0;i--){let j=Math.floor(rand()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]]}
 const pile=cards.slice(),discard=[],players=Array.from({length:n},(_,i)=>({seat:i,pos:i,e:2,down:false,hand:[]})),order=Array.from({length:n},(_,i)=>(i+seed%n)%n),s={turns:0,rounds:12,finished:0,firstWin:0,attacks:0,strictWins:0,strictLosses:0,ties:0,swapOffers:0,swaps:0,attacksOnLeader:0,sharkFalls:0,combatFalls:0,fallTransfers:0,fallDiscards:0,emptyFalls:0,rescues:0,blocked:0,normalMoves:0,backMoves:0,draws:0,overflow:0,stalledAttack:0,winner:-1};
 const take=a=>a.splice(Math.floor(rand()*a.length),1)[0];
 const draw=p=>{if(p.hand.length>=5)return;if(!pile.length){if(discard.length)pile.push(...discard.splice(0));else return}const card=take(pile);p.hand.push(card);s.draws++};
 const overflow=p=>{while(p.hand.length>5){discard.push(take(p.hand));s.overflow++}};
 const fall=(p,cause,opponent)=>{if(p.down)return;p.e=0;p.down=true;if(cause==="shark")s.sharkFalls++;else s.combatFalls++;let card=p.hand.length?take(p.hand):null;if(!card){s.emptyFalls++;return}if(opponent){opponent.hand.push(card);overflow(opponent);s.fallTransfers++}else{discard.push(card);s.fallDiscards++}};
 const damage=(p,points,cause,attacker)=>{if(p.down)return;p.e=Math.max(0,p.e-points);if(p.e===0)fall(p,cause,attacker)};
 const occupied=(pos,id)=>players.some(p=>p.seat!==id&&p.pos===pos);
 const legal=(p,v)=>adj[p.pos].includes(v)&&!occupied(v,p.seat);
 function step(p){const opts=adj[p.pos].filter(v=>!occupied(v,p.seat));if(!opts.length){s.blocked++;return false}const scored=opts.map(v=>({v,score:distance[v]+(sharks.has(v)?.25:0)+rand()*.2})).sort((a,b)=>a.score-b.score);const v=scored[0].v;if(distance[v]>distance[p.pos])s.backMoves++;p.pos=v;s.normalMoves++;if(sharks.has(v))damage(p,2,"shark");draw(p);return true}
 const roll=e=>Math.max(...Array.from({length:e>=2?2:1},()=>1+Math.floor(rand()*6)));
 for(const p of players){draw(p);draw(p)}
 for(let round=1;round<=12&&!s.finished;round++)for(const seat of order){let p=players[seat];s.turns++;let recoveredWithCard=false;
 if(p.down){p.down=false;let i=p.hand.findIndex(c=>c.t==="LifeGuardFloat");if(i<0)i=p.hand.findIndex(c=>c.t==="SwimmingFin");let c=i>=0?p.hand.splice(i,1)[0]:null;if(c){discard.push(c);s.rescues++;recoveredWithCard=true}p.e=c?.t==="LifeGuardFloat"?3:c?.t==="SwimmingFin"?2:1}
 let consumedMove=false;if(!recoveredWithCard){const opp=players.filter(o=>o.seat!==p.seat&&!o.down&&adj[p.pos].includes(o.pos)&&distance[o.pos]<=distance[p.pos]).sort((a,b)=>distance[a.pos]-distance[b.pos]);if(opp.length){let q=opp[0];s.attacks++;if(distance[q.pos]<distance[p.pos])s.attacksOnLeader++;let A=roll(p.e),B=roll(q.e);if(A>B){s.strictWins++;damage(q,1,"combat",p);if(withSwap&&!q.down&&distance[q.pos]<distance[p.pos]){s.swapOffers++;if(!sharks.has(p.pos)&&!sharks.has(q.pos)){let pos=p.pos;p.pos=q.pos;q.pos=pos;s.swaps++;consumedMove=true}}}else if(B>A){s.strictLosses++;damage(p,1,"combat",q)}else s.ties++}}
 if(p.down){s.stalledAttack++;continue}
 if(consumedMove){draw(p)}else step(p);
 if(p.pos>=49){s.finished=1;s.winner=p.seat;s.firstWin=p.seat===order[0]?1:0;s.rounds=round;break}
 }
 const zones=[...pile,...discard,...players.flatMap(p=>p.hand)];if(zones.length!==cards.length||new Set(zones.map(c=>c.id)).size!==cards.length)throw Error("Card conservation "+seed);
 if(new Set(players.map(p=>p.pos)).size!==n)throw Error("Overlapping surfers");
 if(s.sharkFalls+s.combatFalls!==s.fallTransfers+s.fallDiscards+s.emptyFalls)throw Error("Fall bookkeeping");
 return s;
}

function runDropInBatch(layout,counts,seeds=200){
 const out=[];for(const n of [2,4,7])for(const mode of [false,true]){const data=[];for(let i=1;i<=seeds;i++)data.push(simulateDropInComparison(layout,counts,n,mode,7919*i+101*n));let fields=["finished","firstWin","rounds","turns","attacks","strictWins","strictLosses","ties","swapOffers","swaps","attacksOnLeader","sharkFalls","combatFalls","fallTransfers","fallDiscards","emptyFalls","rescues","blocked","normalMoves","backMoves","draws","overflow","stalledAttack"];let m={};for(let f of fields)m[f]=Math.round(data.reduce((t,s)=>t+s[f],0)/seeds*100)/100;let winners=Array(n).fill(0);for(const d of data)if(d.winner>=0)winners[d.winner]++;out.push({n,mode:mode?"swap":"damage-only",runs:seeds,mean:m,winners})}return out
}

// Reproduce using current board-layout.json, expanded createDeck() counts, and runDropInBatch(layout,counts,200).
