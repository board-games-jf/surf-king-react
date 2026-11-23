// Exact seat-and-start fairness enumeration for experimental Surf King R0 (not the gameplay engine).
// Run: node docs/rules-review/START_POSITION_FAIRNESS_EXACT.js
const fs=require('fs'),path=require('path')
function analyzeSetup(layout){
  const c=layout.cells,r=layout.hexRadius;
  const adj=c.map(a=>c.filter(b=>a.id!==b.id&&Math.abs(Math.hypot(a.x-b.x,a.z-b.z)-Math.sqrt(3)*r)<.005).map(b=>b.id));
  const bfs=(start,forbid)=>{const d=Array(c.length).fill(Infinity),q=[start];d[start]=0;for(let i=0;i<q.length;i++)for(const v of adj[q[i]])if(!forbid.has(v)&&!Number.isFinite(d[v])){d[v]=d[q[i]]+1;q.push(v)}return d};
  const beach=[49,50,51,52],sharks=new Set([28,29,30,31]);
  const graph=Array.from({length:c.length},(_,i)=>bfs(i,new Set()));
  const starts=Array.from({length:7},(_,i)=>i);
  const distances=starts.map(i=>({id:i,shortest:Math.min(...beach.map(b=>graph[i][b])),sharkFree:Math.min(...beach.map(b=>bfs(i,sharks)[b])),neighbors:adj[i].filter(j=>j<7),startAdjacentCount:adj[i].filter(j=>j<7).length}));
  if(!distances.every(x=>x.shortest===7)||distances.filter(x=>x.sharkFree===7).map(x=>x.id).join()!=="4,5,6")throw Error("Geometry changed");
  function permutations(pool,n,visit=[]){
    if(visit.length===n)return [visit];
    return pool.flatMap(v=>visit.includes(v)?[]:permutations(pool,n,[...visit,v]));
  }
  const dataset=[];
  for(const n of [2,4,7]){
    const setups=permutations(starts,n);
    const safest=permutations([0,1,2,3],n);
    function stats(set,label){
      let earlyWins=0,underOne=0,withinTwo=0,hasAdjacent=0,allSameSafe=0,mixed=0,firstSafe=0,safestWins=0,firstFewerSafe=0;
      const seatWins=Array(n).fill(0),safeSeatWins=0;
      for(const start of set){
        const ds=start.map(i=>distances[i].sharkFree);
        const shortest=Math.min(...ds);
        const winner=ds.indexOf(shortest);
        seatWins[winner]++;
        earlyWins+=Number(winner===0);
        firstSafe+=Number(ds[0]===7);
        mixed+=Number(new Set(ds).size>1);
        allSameSafe+=Number(new Set(ds).size===1);
        firstFewerSafe+=Number(ds[0]>shortest);
        const dd=graph[start[0]][start[1]];
        underOne+=Number(dd===1);withinTwo+=Number(dd<=2);
        hasAdjacent+=Number(start.some((v,i)=>start.some((w,j)=>i<j&&graph[v][w]===1)));
      }
      const pct=v=>+(100*v/set.length).toFixed(3);
      return {name:label,totalOrderedAssignments:set.length,firstActorWinsSafeOnlyPct:pct(earlyWins),winningActingSeatCounts:seatWins,firstActorSafePath7Pct:pct(firstSafe),mixedSafeRouteLengthsPct:pct(mixed),firstActorLongerSafeRoutePct:pct(firstFewerSafe),firstTwoAreAdjacentPct:pct(underOne),firstTwoWithinTwoPct:pct(withinTwo),anyPairAdjacentPct:pct(hasAdjacent)};
    }
    dataset.push({players:n,randomSeven:stats(setups,"random among seven distinct starts"),rowZero:n<=4?stats(safest,"random among 0..3"):null});
  }
  // Naive one-start reverse choice: last actor picks first, always chooses a Shark-free shortest route if possible.
  const reverseSelection=[2,4,7].map(n=>{
    const priority=[4,5,6,0,1,2,3];
    const positions=Array(n).fill(null);
    for(let acting=n-1,index=0;acting>=0;acting--,index++)positions[acting]=priority[index];
    const safest=positions.map(i=>distances[i].sharkFree);
    return {players:n,positionsInActingOrder:positions,firstActingWinnerUnderSafeOnly:safest.indexOf(Math.min(...safest))===0,winnerActingIndex:safest.indexOf(Math.min(...safest)),note:"illustrative greedy one-position reverse choice, not a gameplay policy or statistically balanced method"};
  });
  const nPairs=starts.flatMap((a,i)=>starts.slice(i+1).map(b=>({a,b,d:graph[a][b]})));
  return {layout:{n:c.length,radius:r,shark:[...sharks],beach},starts:distances,reverseSelection,pairCounts:{total:nPairs.length,adjacent:nPairs.filter(p=>p.d===1).length,cardRange2:nPairs.filter(p=>p.d<=2).length},samples:dataset,
    caveat:"Exact permutations under deterministic safest shortest-route, earliest arrival wins; no card tactics, no blockers, no shuffle deck, no real matches."};
}
const layout=JSON.parse(fs.readFileSync(path.join(__dirname,'../../src/map/layout/board-layout.json'),'utf8'))
console.log(JSON.stringify(analyzeSetup(layout),null,2))
