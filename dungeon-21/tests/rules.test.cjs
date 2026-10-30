'use strict';
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../game.js'),'utf8');
function game(storage=new Map(),blocked=false){
 const nodes=new Map();
 function node(){return {textContent:'',value:'',hidden:false,children:[],dataset:{},classList:{add(){},remove(){},toggle(){}},append(n){this.children.push(n)},replaceChildren(){this.children=[]},setAttribute(k,v){this[k]=v},focus(){},querySelector(){return this.children[0]},getContext(){return {fillRect(){},set fillStyle(v){}}}};}
 const effects=[],themes=[];
 const sandbox={console,Math:Object.create(Math),Date,setTimeout(){return 1},document:{body:{classList:{add(){},remove(){},toggle(){}},offsetWidth:390},activeElement:{tagName:'BODY'},addEventListener(){},getElementById(id){if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)},createElement:node,querySelector(){return null}},localStorage:{getItem(k){if(blocked)throw Error('blocked');return storage.get(k)||null},setItem(k,v){if(blocked)throw Error('blocked');storage.set(k,v)}},confirm(){return true},DungeonAudio:{effect(n){effects.push(n)},play(n){themes.push(n)},async enable(v){return v}}};
 sandbox.window=sandbox;const env=vm.createContext(sandbox);vm.runInContext(source,env);const run=s=>vm.runInContext(s,env);
 return {run,nodes,storage,effects,themes,start(){nodes.get('silentStart').onclick()},random(v){sandbox.Math.random=()=>v}};
}
const hand=(r)=>r.map(r=>({r,s:'♠'}));
function setup(g,{gold=20,hp=10,index=0,level=1,left=2,ante=2,damage=1}={}){
 g.run(`state=fresh();state.gold=${gold};state.hp=${hp};state.enemy={index:${index},level:${level},left:${left},hearts:${left},ante:${ante},damage:${damage}};state.stage='result';state.depth=1;`);
 g.random(.5);g.run("deck=()=>Array.from({length:52},()=>({r:'8',s:'♠'}));deal();");
}
let g=game();g.start();assert.equal(g.run('state.hp'),10);assert.equal(g.run('state.gold'),20);
// Stake accounting: ante charged once, guarded against duplicate dealing/settlement.
setup(g);assert.equal(g.run('state.gold'),18);g.run('deal()');assert.equal(g.run('state.gold'),18);
g.run("finish(1,'Win.');");assert.equal(g.run('state.gold'),22);assert.equal(g.run('state.enemy.left'),1);g.run("finish(1,'Again.');");assert.equal(g.run('state.gold'),22);
setup(g);g.run("finish(0,'Tie.');");assert.equal(g.run('state.gold'),20);assert.equal(g.run('state.hp'),10);
setup(g);g.run("finish(-1,'Loss.');");assert.equal(g.run('state.gold'),18);assert.equal(g.run('state.hp'),9);
setup(g,{gold:2,left:1});assert.equal(g.run('state.stage'),'play');g.run("finish(1,'Win.');");assert.equal(g.run('state.gold'),4);assert.equal(g.run('state.stage'),'explore');
// Unaffordable before the hand leaves remaining gold as score.
setup(g,{gold:1,ante:2});assert.equal(g.run('state.stage'),'dead');assert.equal(g.run('state.gold'),1);assert.match(g.nodes.get('message').textContent,/Final score: 1 gold/);
setup(g,{gold:3,ante:2});g.run("finish(-1,'Loss.');");assert.equal(g.run('state.stage'),'dead');assert.equal(g.run('state.gold'),1);assert.equal(g.run('state.hp'),9);
setup(g,{hp:1});g.run("finish(-1,'Loss.');");assert.equal(g.run('state.stage'),'dead');assert.equal(g.run('state.gold'),18);
// Exact threshold rules and the adaptive high-level rule match Identify text.
for(const [level,hold] of [[1,12],[2,15],[3,17],[4,17]]){
 setup(g,{level});g.run(`state.player=${JSON.stringify(hand(['10','2']))};state.foe=${JSON.stringify(hand(hold===12?['5','6']:['10',String(hold-11)]))};`);assert.equal(g.run('monsterHit()'),true);
 g.run(`state.foe=${JSON.stringify(hand(['10',String(hold-10)]))};`);assert.equal(g.run('monsterHit()'),false);
}
setup(g,{level:4});g.run(`state.player=${JSON.stringify(hand(['2','2']))};state.foe=${JSON.stringify(hand(['10','5']))};`);assert.equal(g.run('monsterHit()'),false);
// Unknown traits and level, potion stack consumption, same type/level memory.
setup(g,{level:2});g.run('state.identify=2;render()');assert.match(g.nodes.get('subtitle').textContent,/Not identified/);assert.doesNotMatch(g.nodes.get('subtitle').textContent,/LV 2/);
g.run('identify()');assert.equal(g.run('state.identify'),1);assert.match(g.nodes.get('subtitle').textContent,/LV 2.*15/);g.run('identify()');assert.equal(g.run('state.identify'),1);
g.run('state.enemy={...state.enemy};render()');assert.match(g.nodes.get('subtitle').textContent,/LV 2/);g.run('state.enemy.level=3;render()');assert.match(g.nodes.get('subtitle').textContent,/Not identified/);
// Save/resume retains paid stake, inventory, and known enemies without recharging.
g.run('state.enemy.level=2;save()');const remaining=g.run('state.gold');let reload=game(g.storage);reload.start();assert.equal(reload.run('state.gold'),remaining);assert.equal(reload.run('state.identify'),1);assert.equal(reload.run('identified()'),true);assert.equal(reload.run('state.pot'),2);
reload.run('restart()');assert.equal(reload.run('state.known.length'),0);assert.equal(reload.run('state.identify'),0);
// Dragons do not end the run, even after the original fifth kill.
setup(g,{index:4,level:3,left:1});g.run("state.kills=4;finish(1,'Win.');");assert.equal(g.run('state.kills'),5);assert.equal(g.run('state.stage'),'explore');
g.run('state.kills=200;state.stage="explore";state.depth=2');g.random(.9);g.run('explore()');assert.equal(g.run('state.enemy.index'),4);assert.ok(g.run('state.enemy.level')>40);assert.notEqual(g.run('state.stage'),'won');
// Random rooms, bounded healing, altar choices, and persisted pending choices.
g.run('restart();state.depth=0');g.random(.1);g.run('explore()');assert.equal(g.run('state.gold'),23);
g.run('state.hp=7');g.random(.2);g.run('explore()');assert.equal(g.run('state.hp'),10);assert.equal(g.run('state.room'),'fountain');
g.run('state.hp=8');g.random(.3);g.run('explore()');assert.equal(g.run('state.hp'),9);assert.equal(g.run('state.room'),'camp');
g.run('window.rolls=[.1,.9];Math.random=()=>rolls.shift()??.9;explore()');assert.equal(g.run('state.identify'),1);
g.run('window.rolls=[.1,.9];explore()');assert.equal(g.run('state.identify'),2);
g.random(.4);g.run('explore()');assert.equal(g.run('state.stage'),'room');assert.equal(g.run('validRun(state)'),true);
let shrineReload=game(g.storage);shrineReload.start();assert.equal(shrineReload.run('state.stage'),'room');assert.equal(shrineReload.run('state.room'),'altar');
const preGold=g.run('state.gold');g.random(.1);g.run('altar(true);altar(true)');assert.equal(g.run('state.gold'),preGold+6);assert.equal(g.run('state.stage'),'explore');
g.random(.4);g.run('explore()');const preHealth=g.run('state.hp');g.run('altar(false)');assert.equal(g.run('state.hp'),preHealth);assert.equal(g.run('state.gold'),preGold+6);
g.random(.4);g.run('explore()');g.random(.9);g.run('altar(true)');assert.equal(g.run('state.hp'),preHealth-2);
g.random(.48);g.run('explore()');assert.equal(g.run('state.room'),'quiet');assert.equal(g.run('state.hp'),preHealth-2);
g.run('state.hp=1');g.random(.45);g.run('explore()');assert.equal(g.run('state.stage'),'dead');assert.equal(g.run('state.hp'),0);assert.match(g.nodes.get('message').textContent,/Final score/);
g.run('restart();state.hp=1');g.random(.4);g.run('explore()');g.random(.9);g.run('altar(true)');assert.equal(g.run('state.stage'),'dead');assert.equal(g.run('state.hp'),0);
// Natural blackjack outranks 3-card 21; pushes return the stake.
setup(g);g.run(`state.player=${JSON.stringify(hand(['A','K']))};state.foe=${JSON.stringify(hand(['7','7','7']))};settle();`);assert.equal(g.run('state.gold'),22);
setup(g);g.run(`state.player=${JSON.stringify(hand(['A','K']))};state.foe=${JSON.stringify(hand(['A','Q']))};settle();`);assert.equal(g.run('state.gold'),20);
// Score initials are normalized and a run can be recorded once, including after reload.
setup(g,{hp:1});g.run("finish(-1,'Loss.');");g.nodes.get('initials').value='a!bc';g.run('recordScore()');assert.equal(JSON.parse(g.storage.get('dungeon21-scores-v1'))[0].initials,'ABC');g.run('recordScore()');assert.equal(JSON.parse(g.storage.get('dungeon21-scores-v1')).length,1);
reload=game(g.storage);reload.start();assert.equal(reload.run('state.recorded'),true);reload.run('recordScore()');assert.equal(JSON.parse(g.storage.get('dungeon21-scores-v1')).length,1);
for(let i=0;i<12;i++){g.run(`state=fresh();state.id='score-${i}';state.gold=${i};state.depth=${i};state.stage='dead';render()`);g.nodes.get('initials').value='XYZ';g.run('recordScore()');}
const scores=JSON.parse(g.storage.get('dungeon21-scores-v1'));assert.equal(scores.length,10);assert.ok(scores.every((r,i)=>i===0||scores[i-1].gold>=r.gold));
const blocked=game(new Map(),true);blocked.start();setup(blocked,{hp:1});blocked.run("finish(-1,'Loss.');");blocked.nodes.get('initials').value='AAA';blocked.run('recordScore()');assert.match(blocked.nodes.get('scoreFeedback').textContent,/Could not save/);assert.equal(blocked.run('state.recorded'),false);
// Seeded complete runs: no negative bankroll/health, dangling encounter or invalid save.
let seed=7;for(let trial=0;trial<100;trial++){
 const sim=game();sim.start();sim.run('window.seed=7+'+trial+';Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}');
 for(let step=0;step<1000&&sim.run('state.stage')!=='dead';step++){
  sim.run("if(state.stage==='room')altar(false);else if(state.stage==='explore')explore();else if(state.stage==='result')deal();else if(score(state.player)<16)hit();else stand();");
  assert.ok(sim.run('state.gold>=0&&state.hp>=0&&state.hp<=10'));assert.ok(sim.run('validRun(state)'));
 }
 assert.equal(sim.run('state.stage'),'dead');
}
console.log('PASS: ante/payout math, both game-over conditions, exact AI rules, Identify memory/reset, saved paid hand, endless dragons, room variety and altar save/choices, hazard death, chest loot, naturals, local top-10 scores, unavailable storage, and 100 complete seeded runs. DOM/audio are mocked.');
