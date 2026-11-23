// Iteration P: exact deterministic counterplay window fixture for turn order.
// R0 first-own-turn preparation rule is respected: use own turns 2 and 3.
const assert=require('assert')
const {ADJ,TYPES}=require('./R0_FULL_MATCH_MODEL')
const types=Object.fromEntries(TYPES)
assert(types['Big Wave']>=2&&types.Amulet>=1)
const graphDist=(start,end)=>{const q=[[start,0]],seen=new Set([start]);for(let i=0;i<q.length;i++){const [id,d]=q[i];if(id===end)return d;for(const v of ADJ[id])if(!seen.has(v)){seen.add(v);q.push([v,d+1])}}}
const sequence=(n,snake)=>[...Array(3)].flatMap((_,round)=>{
  const a=Array.from({length:n},(_,i)=>i)
  return snake&&round%2?a.reverse():a
})
function run(snake){
 // Mid-game legal state: A cell 35 E2 with two Big Waves; B cell 36 E4 with Amulet.
 const actors=sequence(2,snake), moves=[]
 const A={pos:35,energy:2,hand:['Big Wave','Big Wave']},B={pos:36,energy:4,hand:['Amulet'],active:false,fallen:false}
 const action=(who,kind)=>moves.push({actor:who,action:kind,a:A.pos,b:B.pos,bEnergy:B.energy})
 const move=(p,to)=>{assert(ADJ[p.pos].includes(to));assert(to!==A.pos||p===A);assert(to!==B.pos||p===B);p.pos=to}
 const attack=()=>{assert(A.hand.includes('Big Wave'));assert(graphDist(A.pos,B.pos)<=2);A.hand.splice(A.hand.indexOf('Big Wave'),1);if(!B.active){B.energy=Math.max(0,B.energy-2);if(!B.energy){B.fallen=true;if(B.hand.length)A.hand.push(B.hand.pop())}}action('A',B.active?'blocked by proactive Amulet':'Big Wave dealt 2')}
 if(snake){
   assert.deepEqual(actors,[0,1,1,0,0,1])
   // B chooses to save Amulet in own turn 2, before seeing the attack.
   move(B,43);action('B','saved Amulet; mandatory move 36→43')
   attack();move(A,42);action('A','mandatory move 35→42')
   attack();move(A,46);action('A','mandatory move 42→46')
   assert.equal(B.energy,0);assert(B.fallen);assert.equal(B.hand.length,0);assert(A.hand.includes('Amulet'))
 }else{
   assert.deepEqual(actors,[0,1,0,1,0,1])
   attack();move(A,42);action('A','mandatory move 35→42')
   // B sees the damage and responds on own turn 2.
   B.hand.pop();B.active=true;move(B,43);action('B','activated Amulet; mandatory move 36→43')
   attack();move(A,46);action('A','mandatory move 42→46')
   assert.equal(B.energy,2);assert(!B.fallen)
 }
 assert.equal(graphDist(42,43),2)
 assert.equal(new Set([A.pos,B.pos]).size,2)
 return {order:snake?'snake':'fixed',seenActions:moves,defenderEnergyAfterSecondAttack:B.energy,defenderFallen:B.fallen}
}
const fixed=run(false),snake=run(true)
console.log(JSON.stringify({checks:'PASS',fixed,snake},null,2))
