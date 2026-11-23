// Exact board-geometry finish-order counterexample. No deck, UI or engine involved.
function testFinishTieGeometry(layout){
 const adj=layout.cells.map(a=>layout.cells.filter(b=>a.id!==b.id&&Math.abs(Math.hypot(a.x-b.x,a.z-b.z)-Math.sqrt(3)*layout.hexRadius)<.005).map(b=>b.id)),paths=[
[0,7,14,21,28,35,42,49],[1,8,15,22,29,36,43,50],[2,9,16,23,30,37,44,51],[3,10,17,24,31,38,45,52]],shark=new Set([28,29,30,31]),cases=[];
 for(const n of [2,4]){const status=Array.from({length:n},(_,i)=>({id:i,pos:i,e:2,down:false,moves:0,falls:0})),rounds=[];for(let j=1;j<=7;j++){let arrivals=[];for(let i=0;i<n;i++){let p=status[i];if(p.down){p.down=false;p.e=1}let dest=paths[i][j];if(!adj[p.pos].includes(dest))throw Error("invalid hex edge");if(status.some(x=>x.id!==i&&x.pos===dest))throw Error("occupied cell");p.pos=dest;p.moves++;if(shark.has(dest)){p.e=Math.max(0,p.e-2);if(p.e===0){p.down=true;p.falls++}}if(dest>=49)arrivals.push(i)}if(new Set(status.map(x=>x.pos)).size!==n)throw Error("overlap");rounds.push({round:j,arrivals})}cases.push({players:n,rounds,arrivedByRound7:status.filter(p=>p.pos>=49).map(p=>p.id),totalFalls:status.reduce((s,p)=>s+p.falls,0),unlimitedFirstArrivalWinner:0,fullRoundFinishers:rounds[6].arrivals,fullRoundTieCount:rounds[6].arrivals.length})}
 return {cases,checks:2};
}

// Reproduce with current board-layout.json.
