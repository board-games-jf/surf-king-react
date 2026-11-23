// Independent exact opening-risk and board-geometry analysis; no application rules executed.
function openingGeometryAndHands(layout,counts){
  const deck=Object.entries(counts).flatMap(([t,n])=>Array.from({length:n},()=>t)),N=deck.length;
  const adj=layout.cells.map(a=>layout.cells.filter(b=>a.id!==b.id&&Math.abs(Math.hypot(a.x-b.x,a.z-b.z)-Math.sqrt(3)*layout.hexRadius)<.005).map(b=>b.id));
  const distance=(start,end,forbidden=[])=>{let seen=new Set([start]),q=[[start,0]];for(let i=0;i<q.length;i++){const [v,d]=q[i];if(v===end)return d;for(let w of adj[v])if(!forbidden.includes(w)&&!seen.has(w)){q.push([w,d+1]);seen.add(w)}}return Infinity};
  const toBeach=(from,forbid=[])=>Math.min(...[49,50,51,52].map(w=>distance(from,w,forbid)));
  const probAtLeastOne=(type)=>{const n=counts[type]||0;return 1-((N-n)*(N-n-1))/(N*(N-1))};
  let favorable=0, protectedBoth=0, total=0;
  for(let i=0;i<N;i++)for(let j=i+1;j<N;j++){total++;const first=[deck[i],deck[j]];if(!first.includes("BigWave"))continue;favorable++;const remaining=deck.filter((_,k)=>k!==i&&k!==j);let a=remaining.filter(t=>t==="Amulet").length,M=remaining.length;if(a){const chance=1-((M-a)*(M-a-1))/(M*(M-1));protectedBoth+=chance}}
  const paths=[[0,7,14,21,28,35,42,49],[1,8,15,22,29,36,43,50]];for(let path of paths)for(let j=1;j<path.length;j++)if(!adj[path[j-1]].includes(path[j]))throw Error("bad path");
  return {N,BigWave:counts.BigWave,Sunburn:counts.Sunburn,Amulet:counts.Amulet,Stone:counts.Stone,Jumping:counts.Jumping,Pbig:probAtLeastOne("BigWave"),PanyAttack:1-((N-(counts.BigWave+counts.Sunburn))*(N-(counts.BigWave+counts.Sunburn)-1))/(N*(N-1)),PpreexistingAmuletGivenBig:protectedBoth/favorable,initialDist:distance(0,1),parallelDists:paths[0].map((x,i)=>distance(x,paths[1][i])),stoneExample:{actor:14,rival:15,stone:22,range:distance(14,22),rivalMove:adj[15].includes(22),before:toBeach(15),after:toBeach(15,[22]),defenderJumpingAdj:adj[15].includes(22),safeBefore:toBeach(15,[28,29,30,31]),safeAfter:toBeach(15,[22,28,29,30,31])},source:"exact draws without replacement + BFS"};
}

// Invoke with source board-layout.json and physical per-type card counts.
