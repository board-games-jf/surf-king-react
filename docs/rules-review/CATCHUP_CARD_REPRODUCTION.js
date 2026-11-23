// Standalone Surf Current tempo experiment; not application code.
function runCatchupTrial(layout,counts,n,rule,seed){
 let z=seed>>>0;const rnd=()=>((z=(Math.imul(z,1664525)+1013904223)>>>0)/4294967296);
 const cells=layout.cells,adj=cells.map(a=>cells.filter(b=>a.id!==b.id&&Math.abs(Math.hypot(a.x-b.x,a.z-b.z)-Math.sqrt(3)*layout.hexRadius)<.005).map(b=>b.id)),sharks=new Set([28,29,30,31]);
 const d=Array(53).fill(99),q=[];for(let k=49;k<=52;k++){d[k]=0;q.push(k)}for(let i=0;i<q.length;i++)for(const v of adj[q[i]])if(d[v]>d[q[i]]+1){d[v]=d[q[i]]+1;q.push(v)}
 const cards=[];for(const [t,num] of Object.entries(counts))for(let k=0;k<num;k++)cards.push({id:cards.length,t});const deck=cards.slice();for(let i=deck.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]]}const discard=[],p=Array.from({length:n},(_,i)=>({id:i,pos:i,e:2,down:false,hand:[]})),order=Array.from({length:n},(_,i)=>(i+seed%n)%n);
 const r={finished:0,rounds:14,winner:-1,firstWins:0,speed:0,leaderUses:0,trailerUses:0,catchups:0,additionalMoves:0,rescue:0,falls:0,lostCards:0,emptyFalls:0,draws:0,blocked:0,finishWithSpeed:0,cap:0,leadFlips:0,firstActorDistAtWin:99};
 const take=a=>a.splice(Math.floor(rnd()*a.length),1)[0];
 const draw=x=>{if(x.hand.length>=5)return;if(!deck.length&&discard.length){deck.push(...discard.splice(0));for(let j=deck.length-1;j>0;j--){let k=Math.floor(rnd()*(j+1));[deck[j],deck[k]]=[deck[k],deck[j]]}}if(deck.length){x.hand.push(deck.pop());r.draws++}};
 const use=(x,t)=>{const k=x.hand.findIndex(v=>v.t===t);if(k<0)throw Error("no card");discard.push(x.hand.splice(k,1)[0])};
 const occupied=(id,except)=>p.some(q=>q.id!==except&&q.pos===id);
 const best=(x)=>adj[x.pos].filter(v=>!occupied(v,x.id)).map(v=>({v,score:d[v]+(sharks.has(v)?0.25:0)+rnd()*0.1})).sort((a,b)=>a.score-b.score)[0]?.v;
 const fall=(x)=>{if(x.down)return;x.e=0;x.down=true;r.falls++;if(x.hand.length){discard.push(take(x.hand));r.lostCards++}else r.emptyFalls++};
 p.forEach(x=>{draw(x);draw(x)});
 for(let round=1;round<=14&&!r.finished;round++)for(let seat of order){let x=p[seat],hasRescue=false,usedSpeed=false,wasAhead=false,wasBehind=false,priorDist=d[x.pos];if(x.down){x.down=false;const t=x.hand.some(c=>c.t==="LifeGuardFloat")?"LifeGuardFloat":x.hand.some(c=>c.t==="SwimmingFin")?"SwimmingFin":null;x.e=t==="LifeGuardFloat"?3:t==="SwimmingFin"?2:1;if(t){use(x,t);hasRescue=true;r.rescue++}}
 const closestOther=Math.min(...p.filter(v=>v.id!==x.id).map(v=>d[v.pos]));wasBehind=d[x.pos]>closestOther;wasAhead=d[x.pos]<=closestOther;
 if(!hasRescue&&rule!=="disabled"&&x.hand.some(c=>c.t==="SurfCurrent")&&(rule==="any"||wasBehind)){use(x,"SurfCurrent");usedSpeed=true;r.speed++;if(wasBehind)r.trailerUses++;else r.leaderUses++}
 let steps=usedSpeed?2:1,moved=0;for(let j=0;j<steps;j++){const next=best(x);if(next===undefined){r.blocked++;break}x.pos=next;moved++;if(sharks.has(next)){x.e=Math.max(0,x.e-2);if(x.e===0){fall(x);break}}if(x.pos>=49)break}if(usedSpeed&&moved===2)r.additionalMoves++;if(moved)draw(x);if(usedSpeed&&wasBehind&&d[x.pos]<=closestOther)r.catchups++;
 const nextClosest=Math.min(...p.filter(v=>v.id!==x.id).map(v=>d[v.pos]));if(wasBehind&&d[x.pos]<nextClosest)r.leadFlips++;
 if(x.pos>=49){r.finished=1;r.rounds=round;r.winner=x.id;r.firstWins=(seat===order[0]?1:0);r.finishWithSpeed=usedSpeed?1:0;r.firstActorDistAtWin=d[p[order[0]].pos];break}
 }
 const zones=[...deck,...discard,...p.flatMap(x=>x.hand)];if(zones.length!==cards.length||new Set(zones.map(x=>x.id)).size!==cards.length)throw Error("card conservation "+n+" "+rule+" "+seed);
 if(new Set(p.map(x=>x.pos)).size!==n)throw Error("overlap");
 if(r.falls!==r.lostCards+r.emptyFalls)throw Error("fall bookkeeping");
 return r;
}

function runCatchupBatch(layout,counts,seeds=400){const rows=[];for(const n of [2,4,7])for(const mode of ["disabled","any","behind"]){const runs=[];for(let j=1;j<=seeds;j++)runs.push(runCatchupTrial(layout,counts,n,mode,j*7919+n*101));let m={};for(const k of ["finished","rounds","firstWins","speed","leaderUses","trailerUses","catchups","additionalMoves","rescue","falls","lostCards","emptyFalls","draws","blocked","finishWithSpeed","leadFlips"])m[k]=Math.round(runs.reduce((a,r)=>a+r[k],0)/seeds*1000)/1000;const wins=Array(n).fill(0);for(const r of runs)if(r.winner>=0)wins[r.winner]++;rows.push({n,mode,seeds,m,wins})}return rows}

// Reproduce with 53-cell current board layout and B60 counts recorded in DECK_REBALANCE_PROPOSAL.md.
