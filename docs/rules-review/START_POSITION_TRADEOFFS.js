/** Iteration R: exact starting-cell options and exposure study.
 * Design-only graph analysis. Run from repository root:
 * node docs/rules-review/START_POSITION_TRADEOFFS.js
 */
'use strict'
const fs=require('fs'),path=require('path'),assert=require('assert')
const layout=JSON.parse(fs.readFileSync(path.join(__dirname,'../../src/map/layout/board-layout.json'),'utf8'))
const cells=layout.cells, sharks=new Set([28,29,30,31]),beach=[49,50,51,52]
const adj=cells.map(c=>cells.filter(d=>c.id!==d.id&&Math.abs(Math.hypot(c.x-d.x,c.z-d.z)-Math.sqrt(3)*layout.hexRadius)<0.005).map(d=>d.id))
function distances(start,blocked=new Set()){
 const d=Array(cells.length).fill(Infinity),queue=[start];d[start]=0
 for(let k=0;k<queue.length;k++)for(const v of adj[queue[k]])if(!blocked.has(v)&&!Number.isFinite(d[v])){d[v]=d[queue[k]]+1;queue.push(v)}
 return d
}
function pathCountToBeach(start,blocked=new Set()){
 const d=distances(start,blocked),min=Math.min(...beach.map(b=>d[b])),order=Array.from({length:cells.length},(_,i)=>i).sort((a,b)=>d[a]-d[b]),ways=Array(cells.length).fill(0)
 ways[start]=1
 for(const u of order)if(Number.isFinite(d[u]))for(const v of adj[u])if(d[v]===d[u]+1)ways[v]+=ways[u]
 return {minMoves:min,shortestRouteCount:beach.filter(b=>d[b]===min).reduce((s,b)=>s+ways[b],0)}
}
assert.equal(cells.length,53);assert(adj.every((xs,i)=>xs.every(v=>adj[v].includes(i))))
const results=Array.from({length:7},(_,id)=>{
 const d=distances(id),safe=pathCountToBeach(id,sharks),all=pathCountToBeach(id)
 return {start:id,all,safe,edgeOptions:adj[id].length,
  otherStartsInAttackRange2:Array.from({length:7},(_,j)=>j).filter(j=>j!==id&&d[j]<=2),
  otherStartsInAttackRange3:Array.from({length:7},(_,j)=>j).filter(j=>j!==id&&d[j]<=3)}
})
assert(results.every(r=>r.all.minMoves===7))
assert.deepEqual(results.map(r=>r.safe.minMoves),[8,8,8,8,7,7,7])
assert.deepEqual(results.map(r=>r.safe.shortestRouteCount),[24,48,48,24,6,6,6])
assert.deepEqual(results.map(r=>r.all.shortestRouteCount),[1,1,1,1,14,14,14])
assert.equal(results[5].otherStartsInAttackRange3.length,6)
console.log(JSON.stringify({status:'graph assertions pass',results,note:'Shortest-path counts ignore other occupied starting cells, card effects and temporal turn order; range is mutual exposure, not actual attacks.'},null,2))
