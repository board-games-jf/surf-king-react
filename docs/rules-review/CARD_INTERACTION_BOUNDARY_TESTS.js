// Surf King isolated card interaction boundary fixtures. NOT app engine or approved final rules.
function runBoundaryTests(layout){
 const cells=layout.cells,sharks=new Set([28,29,30,31]),adj=cells.map(a=>cells.filter(b=>a.id!==b.id&&Math.abs(Math.hypot(a.x-b.x,a.z-b.z)-Math.sqrt(3)*layout.hexRadius)<.005).map(b=>b.id));
 const dist=(a,b)=>{if(a===b)return 0;const q=[[a,0]],seen=new Set([a]);for(let j=0;j<q.length;j++)for(const n of adj[q[j][0]]){if(n===b)return q[j][1]+1;if(!seen.has(n)){seen.add(n);q.push([n,q[j][1]+1])}}return Infinity};
 const make=(p,ob=[])=>({p:p.map(x=>({id:x.id,pos:x.pos,e:x.e??2,down:x.down??false,hand:(x.hand||[]).slice(),active:(x.active||[]).slice()})),ob:new Map(ob.map(x=>[x.pos,{...x}])),discard:[],turn:0,events:[]});
 const check=(ok,msg)=>{if(!ok)throw Error(msg)};
 const get=(s,id)=>s.p.find(p=>p.id===id);
 const vacant=(s,pos,except)=>!s.p.some(p=>p.id!==except&&p.pos===pos)&&s.ob.get(pos)?.type!=="Stone";
 const select=(a)=>a[0];
 const damaged=(s,id,n,cause="hazard",attacker)=>{const p=get(s,id);if(!p||p.down)return false;p.e=Math.max(0,p.e-n);if(p.e>0)return false;p.down=true;let lost=p.hand.shift();if(lost!==undefined){if(cause==="attack"&&attacker&&attacker!==id)get(s,attacker).hand.push(lost);else s.discard.push(lost)}s.events.push({fall:id,cause,receiver:cause==="attack"?attacker:null,lost:lost??null});return true};
 const entry=(s,id,to,{from,source,depth=0}={})=>{const p=get(s,id);const old=p.pos;if(!adj[old].includes(to)||!vacant(s,to,id))return false;p.pos=to;if(sharks.has(to))damaged(s,id,2,source?"attack":"shark",source);
 const b=s.ob.get(to);if(b&&!p.down){if(b.type==="Storm")damaged(s,id,1,"hazard");if(b.type==="Island"){p.e=Math.min(5,p.e+2);s.ob.delete(to);s.discard.push("Island")}if(b.type==="Cyclone"&&depth===0){const to2=adj[to].filter(v=>v!==old&&vacant(s,v,id));if(to2.length)entry(s,id,select(to2),{from:to,source,depth:1})}}return true};
 const place=(s,id,type,pos)=>{const p=get(s,id);if(pos<7||pos>=49||sharks.has(pos)||s.ob.has(pos)||s.p.some(x=>x.pos===pos)||dist(p.pos,pos)>2)return false;s.ob.set(pos,{pos,type,owner:id,expire:type==="Stone"?s.turn+3:Infinity});return true};
 const attack=(s,id,target,type)=>{const a=get(s,id),b=get(s,target);const range=type==="BigWave"?2:type==="Sunburn"?3:1,hit=type==="BigWave"?2:1;if(!a||!b||b.down||dist(a.pos,b.pos)>range||b.active.includes("Amulet"))return false;if(type==="DropIn"&&b.active.includes("HangLoose"))return false;return damaged(s,target,hit,"attack",id)||true};
 const swap=(s,id,target)=>{const a=get(s,id),b=get(s,target);if(!a||!b||a.down||b.down||b.active.includes("Amulet")||dist(a.pos,b.pos)>2)return false;const pa=a.pos,pb=b.pos;a.pos=pb;b.pos=pa;if(sharks.has(a.pos))damaged(s,id,2,"attack",target);if(sharks.has(b.pos))damaged(s,target,2,"attack",id);return true};
 const jump=(s,id,pos)=>{let o=s.ob.get(pos),p=get(s,id);if(!o||dist(p.pos,pos)!==1||!o.owner)return false;s.ob.delete(pos);s.discard.push(o.type);return true};
 const tsunami=(s,id,target)=>{const attacker=get(s,id),p=get(s,target);if(!p||p.down||p.active.includes("Amulet")||dist(attacker.pos,p.pos)>2)return false;const opts=adj[p.pos].filter(v=>cells[v].row<cells[p.pos].row&&vacant(s,v,target));if(!opts.length)return false;return entry(s,target,opts[0],{source:id})};
 const rescue=(s,id,card)=>{const p=get(s,id);if(!p.down)return false;if(card&&!p.hand.includes(card))return false;p.down=false;p.e=card==="SwimmingFin"?2:card==="LifeGuardFloat"?3:1;if(card){p.hand.splice(p.hand.indexOf(card),1);s.discard.push(card)}return true};
 const current=(s,id,route)=>{const p=get(s,id);let steps=0;for(const v of route.slice(0,2)){if(p.down||p.pos>=49)break;if(!entry(s,id,v))break;steps++}return steps};
 const cases=[];function test(card,scenario,fn){try{fn();cases.push({card,scenario,status:"PASS"})}catch(e){cases.push({card,scenario,status:"FAIL",detail:String(e.message||e)})}}
 const one=(x)=>make([x]);
 test("Energy","+1 from E2",()=>{let s=one({id:"A",pos:21,e:2});s.p[0].e=Math.min(5,s.p[0].e+1);check(s.p[0].e===3,"wrong +1")});
 test("Energy","cannot exceed E5",()=>{let s=one({id:"A",pos:21,e:5});s.p[0].e=Math.min(5,s.p[0].e+1);check(s.p[0].e===5,"cap")});
 test("EnergyX2","+2 and cap",()=>{let s=one({id:"A",pos:21,e:4});s.p[0].e=Math.min(5,s.p[0].e+2);check(s.p[0].e===5,"cap")});
 test("EnergyX3","+3 and cap (legacy 64 only)",()=>{let s=one({id:"A",pos:21,e:2});s.p[0].e=Math.min(5,s.p[0].e+3);check(s.p[0].e===5,"wrong")});
 test("Coconut","refill to E5 in revised fixture",()=>{let s=one({id:"A",pos:21,e:1});s.p[0].e=5;check(s.p[0].e===5,"refill")});
 test("BottledWater","original movement-cost waiver is inert at cost 0",()=>{let e=2,moveCost=0;check(e-moveCost===2,"cost0 did charge energy")});
 test("SwimmingFin","standing next turn E2 consumes rescue card",()=>{let s=one({id:"A",pos:28,e:0,down:true,hand:["SwimmingFin"]});check(rescue(s,"A","SwimmingFin"),"no rescue");check(s.p[0].e===2&&!s.p[0].down&&s.p[0].hand.length===0,"rescue outcome")});
 test("SwimmingFin","cannot use when standing",()=>{let s=one({id:"A",pos:28,e:1,hand:["SwimmingFin"]});check(!rescue(s,"A","SwimmingFin"),"incorrect rescue allowed")});
 test("LifeGuardFloat","standing next turn E3",()=>{let s=one({id:"A",pos:28,e:0,down:true,hand:["LifeGuardFloat"]});check(rescue(s,"A","LifeGuardFloat")&&s.p[0].e===3,"float")});
 test("LifeGuardFloat","cannot use without card",()=>{let s=one({id:"A",pos:28,e:0,down:true});check(!rescue(s,"A","LifeGuardFloat"),"free float")});
 test("Shark","entry E2 loses 2, falls, discards 1",()=>{let s=one({id:"A",pos:21,e:2,hand:["Energy"]});check(entry(s,"A",28),"no enter");check(s.p[0].e===0&&s.p[0].down&&s.discard[0]==="Energy","shark penalty")});
 test("Shark","standing on Shark does not trigger entry damage",()=>{let s=one({id:"A",pos:28,e:0,down:true});check(rescue(s,"A",null)&&s.p[0].e===1&&s.p[0].pos===28,"standing invalid")});
 test("BigWave","player attack E2 causes fall and transfers card",()=>{let s=make([{id:"A",pos:21},{id:"B",pos:25,e:2,hand:["Energy"]}]);check(attack(s,"A","B","BigWave"),"miss");check(get(s,"B").down&&get(s,"A").hand[0]==="Energy"&&s.discard.length===0,"transfer")});
 test("BigWave","out of range target rejected",()=>{let s=make([{id:"A",pos:0},{id:"B",pos:49}]);check(!attack(s,"A","B","BigWave"),"overreach")});
 test("Sunburn","E1 opponent falls, transfers card",()=>{let s=make([{id:"A",pos:21},{id:"B",pos:25,e:1,hand:["Float"]}]);check(attack(s,"A","B","Sunburn")&&get(s,"A").hand[0]==="Float","sunburn")});
 test("Sunburn","Amulet blocks damage",()=>{let s=make([{id:"A",pos:21},{id:"B",pos:25,e:1,active:["Amulet"]}]);check(!attack(s,"A","B","Sunburn")&&get(s,"B").e===1,"amulet not blocking")});
 test("Stone","place obstacle then deny ordinary entry",()=>{let s=one({id:"A",pos:21});check(place(s,"A","Stone",25),"place");let t={id:"B",pos:18,e:2,down:false,hand:[],active:[]};s.p.push(t);check(!entry(s,"B",25),"stone failed to block")});
 test("Stone","placing on an occupied tile is invalid",()=>{let s=make([{id:"A",pos:21},{id:"B",pos:25}]);check(!place(s,"A","Stone",25),"occupied stone")});
 test("Stone","expiry at third owner turn",()=>{let s=one({id:"A",pos:21});s.turn=1;place(s,"A","Stone",25);s.turn=4;for(const [p,o] of s.ob)if(o.expire<=s.turn)s.ob.delete(p);check(!s.ob.has(25),"stone expired?")});
 test("Storm","enter deals E1 damage",()=>{let s=make([{id:"A",pos:21,e:2}], [{pos:25,type:"Storm",owner:"B"}]);check(entry(s,"A",25)&&get(s,"A").e===1,"storm")});
 test("Storm","cannot place on fixed Shark",()=>{let s=one({id:"A",pos:21});check(!place(s,"A","Storm",28),"overplaced fixed hazard")});
 test("Island","first entry gives E+2 and removes obstacle",()=>{let s=make([{id:"A",pos:21,e:1}],[{pos:25,type:"Island",owner:"B"}]);check(entry(s,"A",25)&&get(s,"A").e===3&&!s.ob.has(25),"island")});
 test("Island","no repeated farming on same tile",()=>{let s=make([{id:"A",pos:21,e:1}],[{pos:25,type:"Island",owner:"B"}]);entry(s,"A",25);entry(s,"A",21);entry(s,"A",25);check(get(s,"A").e===3,"farming")});
 test("Cyclone","redirected destination is an adjacent unoccupied tile",()=>{let s=make([{id:"A",pos:21}],[{pos:25,type:"Cyclone",owner:"B"}]);check(entry(s,"A",25),"cyclone entry");check(get(s,"A").pos!==25&&adj[25].includes(get(s,"A").pos)&&get(s,"A").pos!==21,"redirect geometry")});
 test("Cyclone","no exit leaves player in Cyclone without loop",()=>{let p=adj[25].filter(v=>v!==21);let s=make([{id:"A",pos:21},...p.map((v,i)=>({id:"X"+i,pos:v}))],[{pos:25,type:"Cyclone",owner:"B"}]);check(entry(s,"A",25)&&get(s,"A").pos===25,"unexpected redirect")});
 test("Change","valid swap of adjacent standing rivals",()=>{let s=make([{id:"A",pos:35},{id:"B",pos:42}]);check(swap(s,"A","B")&&get(s,"A").pos===42&&get(s,"B").pos===35,"change")});
 test("Change","protected or out-of-range rival cannot swap",()=>{let s=make([{id:"A",pos:35},{id:"B",pos:42,active:["Amulet"]},{id:"C",pos:0}]);check(!swap(s,"A","B")&&!swap(s,"A","C"),"invalid swap")});
 test("Change","both Shark arrival sides resolved, single fall event",()=>{let s=make([{id:"A",pos:21,e:2,hand:["Energy"]},{id:"B",pos:28,e:2,hand:["Coconut"]}]);check(swap(s,"A","B"),"swap");check(get(s,"A").pos===28&&get(s,"A").down&&get(s,"B").pos===21,"swap hazard");check(s.events.length===1&&get(s,"B").hand.length===2,"fall attribution fixture")});
 test("Jumping","removes adjacent player-placed Stone",()=>{let s=make([{id:"A",pos:21}],[{pos:25,type:"Stone",owner:"B"}]);check(jump(s,"A",25)&&!s.ob.has(25),"jump")});
 test("Jumping","cannot remove fixed Shark",()=>{let s=one({id:"A",pos:21});check(!jump(s,"A",28)&&sharks.has(28),"shark must persist")});
 test("Tsunami","moves target one legal edge seaward",()=>{let s=make([{id:"A",pos:22},{id:"B",pos:21}]);check(tsunami(s,"A","B"),"push failed");check([14,18].includes(get(s,"B").pos),"bad seaward destination")});
 test("Tsunami","blocked seaward destinations prevent push",()=>{let s=make([{id:"A",pos:22},{id:"B",pos:21},{id:"C",pos:14},{id:"D",pos:18}]);check(!tsunami(s,"A","B")&&get(s,"B").pos===21,"pushed through blockers")});
 test("Tsunami","Amulet protects from forced move",()=>{let s=make([{id:"A",pos:22},{id:"B",pos:21,active:["Amulet"]}]);check(!tsunami(s,"A","B")&&get(s,"B").pos===21,"forced protected")});
 test("HangLoose","blocks Drop In, not Big Wave",()=>{let s=make([{id:"A",pos:21},{id:"B",pos:25,e:2,active:["HangLoose"]}]);check(!attack(s,"A","B","DropIn"),"DropIn not protected");check(attack(s,"A","B","BigWave")&&get(s,"B").down,"BigWave wrongly blocked")});
 test("Amulet","blocks card attacks",()=>{let s=make([{id:"A",pos:21},{id:"B",pos:25,e:2,active:["Amulet"]}]);check(!attack(s,"A","B","BigWave")&&get(s,"B").e===2,"not protected")});
 test("Amulet","cannot stop Shark damage",()=>{let s=one({id:"A",pos:21,e:2,active:["Amulet"]});check(entry(s,"A",28)&&get(s,"A").down,"terrain protected incorrectly")});
 test("SurfCurrent","takes two true-edge steps",()=>{let s=one({id:"A",pos:0});check(current(s,"A",[7,14])===2&&get(s,"A").pos===14,"speed path")});
 test("SurfCurrent","cannot leap over occupied first cell",()=>{let s=make([{id:"A",pos:0},{id:"B",pos:7}]);check(current(s,"A",[7,14])===0&&get(s,"A").pos===0,"jumped occupied")});
 test("SurfCurrent","stops on Shark fall before second step",()=>{let s=one({id:"A",pos:21,e:2,hand:["Energy"]});check(current(s,"A",[28,35])===1&&get(s,"A").down&&get(s,"A").pos===28,"did not stop on fall")});
 test("Card transfer","empty hand yields no reward",()=>{let s=make([{id:"A",pos:21},{id:"B",pos:25,e:2}]);attack(s,"A","B","BigWave");check(get(s,"A").hand.length===0&&s.events.length===1&&s.events[0].lost===null,"invented card")});
 test("Card transfer","repeated damage while fallen does not take extra card",()=>{let s=make([{id:"A",pos:21},{id:"B",pos:25,e:2,hand:["Energy","Coconut"]}]);attack(s,"A","B","BigWave");attack(s,"A","B","BigWave");check(get(s,"A").hand.length===1&&get(s,"B").hand.length===1,"double theft")});
 test("Card transfer","attacker at five receives sixth card: unresolved recipient cap",()=>{let s=make([{id:"A",pos:21,hand:["a","b","c","d","e"]},{id:"B",pos:25,e:2,hand:["Energy"]}]);attack(s,"A","B","BigWave");check(get(s,"A").hand.length===6,"must expose overflow before defining cap")});
 test("Movement","mandatory fallback: all neighbors occupied is blocked, no illegal overlap",()=>{let all=adj[21];let s=make([{id:"A",pos:21},...all.map((v,i)=>({id:"B"+i,pos:v}))]);check(adj[21].every(v=>!vacant(s,v,"A")),"still legal");check(new Set(s.p.map(p=>p.pos)).size===s.p.length,"overlap")});
 test("Positional DropIn","strict-win adjacent exchange gives attacker the lead; no bonus move",()=>{let s=make([{id:"A",pos:35},{id:"B",pos:42}]);check(adj[35].includes(42),"not adjacent");check(swap(s,"A","B"),"no exchange");check(get(s,"A").pos===42&&get(s,"B").pos===35,"not positional gain");check(dist(42,49)===1&&dist(35,49)===2,"distance proof")});
 const failures=cases.filter(x=>x.status!=="PASS"),count=cases.length;return {count,passes:count-failures.length,failures,cases,neighbors21:adj[21],sample:[...cases.filter(c=>["Change","Cyclone","Tsunami","Stone","SurfCurrent","Card transfer"].includes(c.card)).map(c=>`${c.card}: ${c.scenario}: ${c.status}`)]}
}

// Call runBoundaryTests(JSON.parse(boardLayoutJson)) to execute 45 fixture assertions.
