// Independent controlled subset-card interactivity trial; main gameplay untouched.
function runCrosslaneGame(layout,counts,n,mode,seed){
 let r=seed>>>0;const rnd=()=>((r=Math.imul(r,1664525)+1013904223>>>0)/4294967296);
 const cells=layout.cells,adj=cells.map(a=>cells.filter(b=>a.id!==b.id&&Math.abs(Math.hypot(a.x-b.x,a.z-b.z)-Math.sqrt(3)*layout.hexRadius)<.005).map(b=>b.id)),shark=new Set([28,29,30,31]),beach=new Set([49,50,51,52]);
 const dist=(start,goal,blocked=new Set())=>{const queue=[start],ds=Array(53).fill(99);ds[start]=0;for(let i=0;i<queue.length;i++){let v=queue[i];if(goal==="beach"?beach.has(v):v===goal)return ds[v];for(const w of adj[v])if(!blocked.has(w)&&ds[w]===99){ds[w]=ds[v]+1;queue.push(w)}}return 99};
 const plain=Array.from({length:53},(_,i)=>dist(i,"beach"));
 const deck=[];for(const [name,num] of Object.entries(counts))for(let i=0;i<num;i++)deck.push({id:deck.length,t:name});for(let i=deck.length-1;i>0;i--){let j=Math.floor(rnd()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]]}const allN=deck.length,handDeck=deck.slice(),discard=[],placed=new Map();
 const P=Array.from({length:n},(_,i)=>({i,pos:i,e:2,down:false,hand:[],active:[],ownTurn:0,targeted:0})),order=Array.from({length:n},(_,j)=>(j+seed%n)%n);
 const s={seed,n,mode,finish:0,rounds:16,winner:-1,firstWins:0,moves:0,falls:0,sharkFalls:0,combatFalls:0,stolen:0,discarded:0,empty:0,rescue:0,attacks:0,bigWaves:0,sunburns:0,dropins:0,stone:0,blockedAhead:0,jumping:0,shields:0,shieldAvoided:0,heals:0,opponentActions:0,opponentsHit:0,targeted:new Set(),targets:Array(n).fill(0),preFirstFall:0,firstTurnAttacks:0,firstTurnFalls:0,draws:0,overflow:0,blocked:0,back:0,decisionTurns:0,activeOpportunities:0,cardActionTurns:0,leadOvertake:0};
 const take=a=>a.splice(Math.floor(rnd()*a.length),1)[0];
 const draw=p=>{if(p.hand.length>=5)return;if(!handDeck.length&&discard.length){handDeck.push(...discard.splice(0));for(let k=handDeck.length-1;k>0;k--){let j=Math.floor(rnd()*(k+1));[handDeck[k],handDeck[j]]=[handDeck[j],handDeck[k]]}}if(handDeck.length){p.hand.push(handDeck.pop());s.draws++}};
 const overflow=p=>{while(p.hand.length>5){discard.push(take(p.hand));s.overflow++}};
 const use=(p,type,destination="discard")=>{let i=p.hand.findIndex(c=>c.t===type);if(i<0)throw Error("card missing");const c=p.hand.splice(i,1)[0];if(destination==="discard")discard.push(c);return c};
 const occupied=(x,id)=>P.some(p=>p.i!==id&&p.pos===x);
 const blockedSet=()=>new Set(placed.keys());
 const legal=(p,v)=>adj[p.pos].includes(v)&&!occupied(v,p.i)&&!placed.has(v);
 const early=(p)=>p.ownTurn===1;
 const protectedBy=(p,t)=>p.active.some(a=>a.card.t===t);
 const fall=(p,cause,attacker)=>{if(p.down)return;p.down=true;p.e=0;s.falls++;if(cause==="shark")s.sharkFalls++;else s.combatFalls++;if(p.ownTurn===0)s.preFirstFall++;if(attacker&&p.ownTurn===0)s.firstTurnFalls++;let card=p.hand.length?take(p.hand):null;if(!card){s.empty++;return}if(attacker&&attacker!==p){attacker.hand.push(card);overflow(attacker);s.stolen++}else{discard.push(card);s.discarded++}};
 const hurt=(p,d,cause,attacker)=>{if(p.down||d<=0)return false;if(cause==="attack"&&protectedBy(p,"Amulet")){s.shieldAvoided++;return false}p.e=Math.max(0,p.e-d);if(p.e===0)fall(p,cause,attacker);return true};
 const dropdist=(a,b)=>dist(a,b);
 function placeStone(p,others){if(!p.hand.some(c=>c.t==="Stone"))return false;let best=null,score=0;
 const blocks=blockedSet();for(const o of others){const base=dist(o.pos,"beach",blocks);for(const v of adj[o.pos]){if(v<7||v>48||shark.has(v)||placed.has(v)||occupied(v,-1)||dropdist(p.pos,v)>2)continue;const add=new Set(blocks);add.add(v);const after=dist(o.pos,"beach",add);const immediate=plain[v]<plain[o.pos]?1:0;const value=after-base+0.18*immediate+(plain[o.pos]<=plain[p.pos]?0.15:0);if(value>score){score=value;best={o,v,after,base}}}}
 if(!best||score<0.13)return false;const c=use(p,"Stone","keep");placed.set(best.v,{card:c,owner:p.i,expires:p.ownTurn+3});s.stone++;s.opponentActions++;s.targeted.add(best.o.i);s.targets[best.o.i]++;if(best.after>best.base)s.blockedAhead++;return true
 }
 function jump(p){const cs=[...placed].filter(([v])=>adj[p.pos].includes(v));if(!p.hand.some(c=>c.t==="Jumping")||!cs.length)return false;const w=cs.sort((a,b)=>plain[a[0]]-plain[b[0]])[0][0];use(p,"Jumping");discard.push(placed.get(w).card);placed.delete(w);s.jumping++;s.opponentActions++;return true}
 function act(p,allowOffense){if(mode==="P0")return false;
 const others=P.filter(q=>q.i!==p.i&&!q.down);
 const ranged=(t)=>others.filter(q=>dropdist(p.pos,q.pos)<=(t==="BigWave"?2:3)&&!protectedBy(q,"Amulet")).sort((a,b)=>(a.e-b.e)||plain[a.pos]-plain[b.pos]);
 if(allowOffense){for(const [t,dmg,metric] of [["BigWave",2,"bigWaves"],["Sunburn",1,"sunburns"]]){const q=ranged(t).find(q=>q.e<=dmg);if(q&&p.hand.some(c=>c.t===t)){use(p,t);s.attacks++;s[metric]++;s.opponentActions++;s.targeted.add(q.i);s.targets[q.i]++;if(early(p))s.firstTurnAttacks++;hurt(q,dmg,"attack",p);return true}}}
 if(mode==="P2"||mode==="P3"){if(jump(p))return true;if(placeStone(p,others))return true;
 if(p.hand.some(c=>c.t==="Amulet")&&p.e<=2&&others.some(q=>dropdist(p.pos,q.pos)<=3)){const c=use(p,"Amulet","keep");p.active.push({card:c,expires:p.ownTurn+1});s.shields++;return true}
 if(p.hand.some(c=>c.t==="HangLoose")&&p.e<=2&&others.some(q=>adj[p.pos].includes(q.pos))){const c=use(p,"HangLoose","keep");p.active.push({card:c,expires:p.ownTurn+1});s.shields++;return true}
 }
 if(allowOffense){for(const [t,dmg,metric] of [["BigWave",2,"bigWaves"],["Sunburn",1,"sunburns"]]){const q=ranged(t)[0];if(q&&p.hand.some(c=>c.t===t)){use(p,t);s.attacks++;s[metric]++;s.opponentActions++;s.targeted.add(q.i);s.targets[q.i]++;if(early(p))s.firstTurnAttacks++;hurt(q,dmg,"attack",p);return true}}}
 const healed=[["Coconut",5],["EnergyX2",2],["EnergyX3",3],["Energy",1]];for(const [t,a] of healed){if(p.e<=2&&p.hand.some(c=>c.t===t)){use(p,t);p.e=t==="Coconut"?5:Math.min(5,p.e+a);s.heals++;return true}}
 if(allowOffense){const q=others.filter(q=>adj[p.pos].includes(q.pos)&&!protectedBy(q,"Amulet")&&!protectedBy(q,"HangLoose")).sort((a,b)=>plain[a.pos]-plain[b.pos])[0];if(q){s.dropins++;s.opponentActions++;s.targeted.add(q.i);s.targets[q.i]++;if(early(p))s.firstTurnAttacks++;const roll=e=>Math.max(...Array.from({length:e>=2?2:1},()=>1+Math.floor(rnd()*6))),A=roll(p.e),B=roll(q.e);if(A>B){s.attacks++;hurt(q,1,"attack",p)}else if(B>A){s.attacks++;hurt(p,1,"attack",q)}return true}}
 return false}
 function move(p){const opts=adj[p.pos].filter(v=>legal(p,v));if(!opts.length){s.blocked++;return}const before=plain[p.pos],sc=opts.map(v=>({v,score:plain[v]+(shark.has(v)?0.28:0)+rnd()*0.15})).sort((a,b)=>a.score-b.score);const v=sc[0].v;if(plain[v]>before)s.back++;p.pos=v;s.moves++;if(shark.has(v))hurt(p,2,"shark");draw(p)}
 P.forEach(p=>{draw(p);draw(p)});
 for(let round=1;round<=16&&!s.finish;round++)for(const i of order){const p=P[i];p.ownTurn++;for(let j=p.active.length-1;j>=0;j--)if(p.active[j].expires<=p.ownTurn){discard.push(p.active[j].card);p.active.splice(j,1)}
 for(const [v,o] of placed)if(o.owner===p.i&&o.expires<=p.ownTurn){discard.push(o.card);placed.delete(v)}
 let used=false;if(p.down){p.down=false;const type=p.hand.some(c=>c.t==="LifeGuardFloat")?"LifeGuardFloat":p.hand.some(c=>c.t==="SwimmingFin")?"SwimmingFin":null;if(type){use(p,type);used=true;s.rescue++}p.e=type==="LifeGuardFloat"?3:type==="SwimmingFin"?2:1}
 const available=p.hand.some(c=>["BigWave","Sunburn","Stone","Jumping","Energy","EnergyX2","EnergyX3","Coconut","Amulet","HangLoose"].includes(c.t));if(available)s.activeOpportunities++;s.decisionTurns++;
 const offensiveAllowed=mode!=="P3"||p.ownTurn>1;
 if(!used&&act(p,offensiveAllowed)){used=true;s.cardActionTurns++}
 if(!p.down){move(p)}if(beach.has(p.pos)){s.finish=1;s.rounds=round;s.winner=p.i;s.firstWins=order[0]===p.i?1:0;break}
 }
 const zones=[...handDeck,...discard,...P.flatMap(p=>p.hand),...P.flatMap(p=>p.active.map(x=>x.card)),...[...placed.values()].map(x=>x.card)];
 if(zones.length!==allN||new Set(zones.map(x=>x.id)).size!==allN)throw Error(`card conservation ${seed} ${mode} ${n}: ${zones.length}`);
 if(new Set(P.map(p=>p.pos)).size!==n)throw Error("overlap");
 if(s.falls!==s.stolen+s.discarded+s.empty)throw Error("fall accounting");
 s.distinctTargeted=s.targeted.size;s.maxTargetShare=s.opponentActions?Math.max(...s.targets)/s.opponentActions:0;s.targeted=undefined;s.targets=undefined;
 return s;
}

function runCrosslaneBatch(layout,counts,seeds=200){
 const rows=[];for(const n of [2,4,7])for(const mode of ["P0","P1","P2","P3"]){const games=[];for(let j=1;j<=seeds;j++){const seed=j*7919+n*101;games.push(runCrosslaneGame(layout,counts,n,mode,seed))}const fields=["finish","rounds","firstWins","moves","falls","sharkFalls","combatFalls","stolen","discarded","empty","rescue","attacks","bigWaves","sunburns","dropins","stone","blockedAhead","jumping","shields","shieldAvoided","heals","opponentActions","distinctTargeted","maxTargetShare","preFirstFall","firstTurnAttacks","firstTurnFalls","draws","overflow","blocked","back","decisionTurns","activeOpportunities","cardActionTurns"];const mean={};for(const field of fields)mean[field]=Math.round(games.reduce((a,g)=>a+(g[field]||0),0)/seeds*1000)/1000;const wins=Array(n).fill(0);for(const g of games)if(g.winner>=0)wins[g.winner]++;rows.push({n,mode,seeds,means:mean,wins})}return rows
}

// Reproduce with main's board-layout.json and the counts parsed from createDeck(); runCrosslaneBatch(layout, counts, 200).
