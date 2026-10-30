 'use strict';
const $ = id => document.getElementById(id);
const KEY = 'dungeon21-v2', SCORES = 'dungeon21-scores-v1';
const monsters = [
  {name:'GOBLIN',hearts:1,damage:1,ante:1},
  {name:'SKELETON',hearts:1,damage:1,ante:2},
  {name:'ORC',hearts:2,damage:2,ante:3},
  {name:'VAMPIRE',hearts:3,damage:2,ante:4},
  {name:'DRAGON',hearts:4,damage:3,ante:5}
];
const sound = window.DungeonAudio;
let state, muted = true, started = false, storageOK = true;
function fresh() {
  return {id:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2),hp:10,max:10,gold:20,kills:0,depth:0,
    stage:'explore',room:null,enemy:null,deck:[],player:[],foe:[],pot:0,identify:0,known:[],recorded:false,
    note:'10 health. 20 gold. Explore, win gold, survive. There is no final boss.'};
}
function validRun(r) {
  return r && typeof r.id==='string' && ['explore','room','play','result','dead'].includes(r.stage) &&
    ['hp','max','gold','kills','depth','pot','identify'].every(k=>Number.isSafeInteger(r[k])&&r[k]>=0) &&
    (!r.room || ['chest','fountain','camp','altar','trap','quiet'].includes(r.room)) &&
    (r.stage!=='room'||r.room==='altar'&&!r.enemy) &&
    r.max===10 && r.hp<=10 && Array.isArray(r.known) && r.known.every(k=>typeof k==='string') &&
    [r.deck,r.player,r.foe].every(h=>Array.isArray(h)&&h.every(c=>c&&['A','2','3','4','5','6','7','8','9','10','J','Q','K'].includes(c.r)&&['♠','♥','♣','♦'].includes(c.s))) &&
    (!r.enemy || (Number.isInteger(r.enemy.index)&&r.enemy.index>=0&&r.enemy.index<5&&
      ['level','left','hearts','damage','ante'].every(k=>Number.isSafeInteger(r.enemy[k])&&r.enemy[k]>0))) &&
    (!['play','result'].includes(r.stage)||!!r.enemy) &&
    (r.stage!=='play'||(r.pot===r.enemy.ante&&r.player.length>=2&&r.foe.length>=2&&r.deck.length>0));
}
try { const s=JSON.parse(localStorage.getItem(KEY)); state=s?.version===2&&validRun(s.run)?s.run:fresh(); }
catch { state=fresh(); storageOK=false; }
function save() { try { localStorage.setItem(KEY,JSON.stringify({version:2,run:state})); } catch { storageOK=false; } }
function score(hand) { let n=0,a=0; for(const c of hand){n+=c.r==='A'?11:['J','Q','K'].includes(c.r)?10:Number(c.r);if(c.r==='A')a++;}while(n>21&&a){n-=10;a--;}return n; }
function natural(h) { return h.length===2&&score(h)===21; }
function deck() { const d=[];for(const s of ['♠','♥','♣','♦'])for(const r of ['A','2','3','4','5','6','7','8','9','10','J','Q','K'])d.push({r,s});for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]];}return d; }
function fx(name) { sound?.effect(name); }
function flash(name) { document.body.classList.remove('enemy-hit','player-hurt');void document.body.offsetWidth;document.body.classList.add(name);setTimeout(()=>document.body.classList.remove(name),600); }
async function setSound(on) { const ok=await sound?.enable(on);muted=!ok;$('sound').textContent=muted?'SOUND OFF':'SOUND ON';$('sound').setAttribute('aria-pressed',String(!muted));return ok; }
function startGame() { started=true;$('titleScreen').hidden=true;$('playScreen').hidden=false;render();$('actions').querySelector('button')?.focus(); }
function titleReady() { const b=$('powerOn');b.textContent=state.depth>0?'CONTINUE RUN →':'START ADVENTURE →';b.onclick=startGame;$('titleHint').textContent=muted?'Sound is off. Tap SOUND OFF to retry audio.':'Title theme · Original pocket chiptune';b.focus(); }
$('powerOn').onclick=async()=>{await setSound(true);titleReady();};
$('silentStart').onclick=()=>{setSound(false);startGame();};
$('savedHint').textContent=state.depth>0?'YOUR SAVED RUN IS READY.':'10 HEALTH. 20 GOLD. HOW FAR CAN YOU GO?';
function enemyKey(e=state.enemy) { return e.index+':'+e.level; }
function identified() { return !!state.enemy&&state.known.includes(enemyKey()); }
function behavior(e) {
  if(e.level===1)return 'Stands on 12 or higher.';
  if(e.level===2)return 'Stands on 15 or higher.';
  if(e.level===3)return 'Stands on 17 or higher.';
  return 'Stands on 17+ if your first card is 7 or higher; otherwise stands on 15+.';
}
function encounter() {
  const unlocked=Math.min(5,1+state.kills);
  const index=Math.floor(Math.random()*unlocked), top=1+Math.floor(state.kills/4);
  const level=Math.max(1,top-(Math.random()<.3?1:0)), m=monsters[index];
  const hearts=Math.min(8,m.hearts+Math.floor((level-1)/3));
  return {index,level,hearts,left:hearts,damage:Math.min(5,m.damage+Math.floor((level-1)/4)),ante:m.ante+level-1};
}
const rooms = {
  chest: {name:'FORGOTTEN TREASURY',hint:'Something glints beneath the dust.'},
  fountain: {name:'WHISPERING FOUNTAIN',hint:'Cold water. A familiar voice.'},
  camp: {name:'ABANDONED CAMP',hint:'The coals are still warm. Nobody answers.'},
  altar: {name:'CURSED ALTAR',hint:'A gold coin floats above a cracked stone hand.'},
  trap: {name:'DART GALLERY',hint:'A quiet click. Then a sharp sting.'},
  quiet: {name:'ECHO CHAMBER',hint:'Your footsteps return one beat too late.'}
};
function explore() {
  if(state.stage!=='explore')return;
  state.depth++;state.enemy=null;state.room=null;
  const roll=Math.random();
  if(roll<.15) {
    state.room='chest';
    if(Math.random()<.5) { const gold=3+Math.floor(state.kills/4);state.gold+=gold;state.note=`You lift a rusted lid. Beneath scraps of velvet: ${gold} gold.`; }
    else { state.identify++;state.note='A stoppered glass eye rests in the chest. Identify potion +1. Its knowledge lasts for this run.'; }
    fx('treasure');
  } else if(roll<.27) {
    state.room='fountain';const healed=Math.min(3,state.max-state.hp);state.hp+=healed;
    state.note=healed?`You drink from the whispering fountain. +${healed} health.`:'The water is cold and clear. You already have full health.';fx('heal');
  } else if(roll<.35) {
    state.room='camp';const healed=Math.min(1,state.max-state.hp);state.hp+=healed;
    state.note=healed?'You rest beside the last warm embers. +1 health. Something moves beyond the firelight.':'You pause by the embers. Full health; no supplies remain. A distant door closes.';fx('heal');
  } else if(roll<.43) {
    state.room='altar';state.stage='room';
    state.note='Touch the altar? 50% chance: gain 6 gold. Otherwise: lose 2 health (can be fatal). Leaving costs nothing.';
  } else if(roll<.47) {
    state.room='trap';state.hp=Math.max(0,state.hp-1);state.note='A loose flagstone fires a hidden dart. −1 health. The trap is spent.';fx('hurt');flash('player-hurt');
    if(state.hp===0)endRun('A hidden dart claims your last health.');
  } else if(roll<.5) {
    state.room='quiet';
    const whispers=['A card lies face down on the floor. When you turn it over, both sides are blank.', 'You hear coins spilling behind the wall. The sound stops when you hold your breath.', 'Five empty chairs surround a table. A sixth scrapes backward as you approach.'];
    state.note=whispers[Math.floor(Math.random()*whispers.length)]+' Nothing gained or lost.';
  } else { state.enemy=encounter();state.player=[];state.foe=[];deal();return; }
  render();
}
function altar(touch) {
  if(state.stage!=='room'||state.room!=='altar')return;
  state.stage='explore';
  if(!touch)state.note='You leave the floating coin untouched. The stone fingers close behind you. Nothing lost.';
  else if(Math.random()<.5){state.gold+=6;state.note='The coin splits into six. +6 gold. The altar falls silent.';fx('treasure');}
  else {state.hp=Math.max(0,state.hp-2);state.note='The stone hand seizes your wrist. −2 health. You pull free.';fx('hurt');flash('player-hurt');if(state.hp===0)endRun('The cursed altar takes your last health.');}
  render();
}
function endRun(reason) { state.stage='dead';state.pot=0;state.note=reason+` GAME OVER. Final score: ${state.gold} gold.`;fx('defeat'); }
function deal() {
  if(!state.enemy||!['explore','result'].includes(state.stage))return;
  const ante=state.enemy.ante;
  if(state.gold<ante) { endRun(`You have ${state.gold} gold but need ${ante} for the next ante.`);render();return; }
  state.gold-=ante;state.pot=ante;state.deck=deck();state.player=[state.deck.pop(),state.deck.pop()];state.foe=[state.deck.pop(),state.deck.pop()];state.stage='play';fx('card');
  state.note=`${ante} gold ante paid. Win: collect ${ante*2} gold. Hit or stand?`;
  if(natural(state.player)||natural(state.foe)){settle();return;}render();
}
function hit() { if(state.stage!=='play')return;state.player.push(state.deck.pop());fx('card');if(score(state.player)>21){finish(-1,'You bust.');return;}if(score(state.player)===21){stand();return;}render(); }
function monsterHit() {
  const e=state.enemy,n=score(state.foe);
  const hold=e.level===1?12:e.level===2?15:e.level===3?17:score([state.player[0]])>=7?17:15;
  return n<hold;
}
function stand() { if(state.stage!=='play')return;while(score(state.foe)<21&&monsterHit())state.foe.push(state.deck.pop());settle(); }
function settle() {
  if(state.stage!=='play')return;
  const p=score(state.player),f=score(state.foe);
  if(natural(state.player)||natural(state.foe)){const r=natural(state.player)===natural(state.foe)?0:natural(state.player)?1:-1;finish(r,r===0?'Two blackjacks. A tie.':r===1?'Blackjack!':'Monster blackjack.');return;}
  finish(f>21?1:p>f?1:p<f?-1:0,f>21?'Monster busts.':p===f?'A tie.':p>f?'You win the hand.':'Monster wins the hand.');
}
function finish(result,msg) {
  if(state.stage!=='play'||!state.enemy)return;
  const e=state.enemy,m=monsters[e.index],ante=state.pot;state.pot=0;state.stage='result';
  if(result>0) {
    state.gold+=ante*2;e.left--;msg+=` Collected ${ante*2} gold (net +${ante}).`;fx('hit');flash('enemy-hit');
    if(e.left===0) { state.kills++;state.enemy=null;state.stage='explore';fx('victory');msg+=` ${m.name} defeated! Explore onward.`; }
  } else if(result<0) {
    state.hp=Math.max(0,state.hp-e.damage);msg+=` Lost ${ante} gold. −${e.damage} health.`;fx('hurt');flash('player-hurt');
  } else { state.gold+=ante;msg+=` ${ante} gold returned. No damage.`;fx('tie'); }
  state.note=msg;
  if(state.hp===0)endRun(msg);
  else if(state.enemy&&state.gold<state.enemy.ante)endRun(msg+` You cannot cover the next ${state.enemy.ante}-gold ante.`);
  render();
}
function identify() {
  if(!state.enemy||!['play','result'].includes(state.stage)||state.identify<1||identified())return;
  state.identify--;state.known.push(enemyKey());
  state.note=`Identified ${monsters[state.enemy.index].name}, level ${state.enemy.level}. ${behavior(state.enemy)} Known for this run.`;fx('heal');render();
}
function potion() {
  if(state.stage!=='explore'||state.gold<5||state.hp===state.max)return;
  state.gold-=5;const h=Math.min(4,state.max-state.hp);state.hp+=h;state.note=`Potion: +${h} health. Spent 5 gold from your score.`;fx('heal');render();
}
function button(label,fn,key) { const b=document.createElement('button');b.textContent=label;b.onclick=fn;if(key)b.dataset.key=key;$('actions').append(b); }
function cards(id,hand,hide) { $(id).replaceChildren();hand.forEach((c,i)=>{const el=document.createElement('span');el.className='card'+(hide&&i===1?' back':'');el.textContent=hide&&i===1?'?':c.r+c.s;el.setAttribute('aria-label',hide&&i===1?'Hidden card':c.r+' '+c.s);$(id).append(el);}); }
function readScores() {
  try { const rows=JSON.parse(localStorage.getItem(SCORES)||'[]');return Array.isArray(rows)?rows.filter(r=>r&&typeof r.id==='string'&&/^[A-Z0-9]{1,3}$/.test(r.initials)&&Number.isSafeInteger(r.gold)&&r.gold>=0&&Number.isSafeInteger(r.depth)&&r.depth>=0).sort((a,b)=>b.gold-a.gold||b.depth-a.depth).slice(0,10):[]; }
  catch { storageOK=false;return []; }
}
function renderScores() {
  const rows=readScores();$('highScores').replaceChildren();
  for(const row of rows) { const li=document.createElement('li');li.textContent=`${row.initials.padEnd(3,' ')} · ${row.gold} GOLD · ROOM ${row.depth}`;$('highScores').append(li); }
  if(!rows.length) { const li=document.createElement('li');li.textContent='No scores yet. Your next run could be first.';$('highScores').append(li); }
  $('scoreStorage').textContent=storageOK?'Top 10 on this browser / device.':'Storage unavailable. Scores may not survive closing this page.';
}
function recordScore(event) {
  event?.preventDefault();if(state.stage!=='dead'||state.recorded)return;
  const initials=$('initials').value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,3);if(!initials){$('initials').focus();return;}
  try {
    const rows=readScores().filter(r=>r.id!==state.id);
    rows.push({id:state.id,initials,gold:state.gold,depth:state.depth});
    rows.sort((a,b)=>b.gold-a.gold||b.depth-a.depth);
    localStorage.setItem(SCORES,JSON.stringify(rows.slice(0,10)));state.recorded=true;save();render();
  } catch { storageOK=false;$('scoreFeedback').textContent='Could not save on this device. Your score is still shown above.';renderScores(); }
}
$('scoreForm').onsubmit=recordScore;
$('initials').oninput=()=>{$('initials').value=$('initials').value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,3);};
function render() {
  if(!started){sound?.play('title');renderScores();return;}
  sound?.play(['play','result'].includes(state.stage)?'battle':state.stage==='dead'?'silence':'explore');
  const combat=!!state.enemy&&state.player.length>0&&['play','result','dead'].includes(state.stage),m=state.enemy?monsters[state.enemy.index]:null;
  document.body.classList.toggle('battle',combat);
  $('health').textContent=`♥ ${state.hp}/${state.max}`;$('gold').textContent=`G ${state.gold}`;
  $('depth').textContent=`ROOM ${String(state.depth).padStart(2,'0')}`;$('level').textContent=`${state.kills} SLAIN`;
  $('inventory').textContent=`IDENTIFY ×${state.identify}`;
  $('title').textContent=state.stage==='dead'?'GAME OVER':m?m.name:rooms[state.room]?.name||'THE QUIET HALL';
  $('subtitle').textContent=m?`${'♥'.repeat(state.enemy.left)} · `+(identified()?`LV ${state.enemy.level} · ${behavior(state.enemy)}`:'Not identified'):rooms[state.room]?.hint||'An endless dungeon. Every gold piece counts.';
  $('stakes').textContent=state.enemy?`ANTE ${state.enemy.ante}G / HAND · `+(state.stage==='play'?`POT ${state.pot*2}G`:'WIN RETURNS '+state.enemy.ante*2+'G'):'';
  $('table').hidden=!combat;
  if(combat){$('enemyLabel').textContent=m.name;$('enemyScore').textContent=state.stage==='play'?'?':score(state.foe);$('playerScore').textContent=score(state.player);cards('enemyCards',state.foe,state.stage==='play');cards('playerCards',state.player,false);}
  $('message').textContent=state.note;$('actions').replaceChildren();
  if(state.stage==='explore'){button('EXPLORE →',explore,'e');if(state.gold>=5&&state.hp<state.max)button('HEAL · 5G',potion);}
  if(state.stage==='room'){button('TOUCH ALTAR',()=>altar(true));button('LEAVE →',()=>altar(false),'e');}
  if(state.stage==='play'){button('HIT +',hit,'h');button('STAND ■',stand,'s');}
  if(state.stage==='result')button(`NEXT HAND · ${state.enemy.ante}G`,deal,'e');
  if(['play','result'].includes(state.stage)&&state.identify>0&&!identified())button(`IDENTIFY · ×${state.identify}`,identify,'i');
  if(state.stage==='dead')button('PLAY AGAIN',restart,'e');
  $('scoreEntry').hidden=state.stage!=='dead';$('scoreForm').hidden=state.recorded;
  $('finalScore').textContent=`${state.gold} GOLD`;
  $('scoreFeedback').textContent=state.recorded?'Score saved on this device.':state.stage==='dead'?'Enter up to 3 initials to record your score.':'';
  $('art').setAttribute('aria-label',m?m.name+' encounter':rooms[state.room]?.name||'A long dungeon hall with stone columns');
  draw(m?state.enemy.index:-1,state.room);save();renderScores();
}
function restart() {
  state=fresh();$('initials').value='';save();
  if(!started){$('savedHint').textContent='NEW RUN · 10 HEALTH · 20 GOLD';if($('powerOn').onclick===startGame)titleReady();return;}
  render();
}
$('restart').onclick=()=>{if(state.stage==='dead'||state.depth===0||confirm('Start a new run? Your current run will be replaced.'))restart();};
$('sound').onclick=async()=>{await setSound(muted);if(!started)titleReady();};
document.addEventListener('keydown',e=>{
  if(e.repeat||e.ctrlKey||e.metaKey||e.altKey||['BUTTON','SUMMARY','INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName))return;
  const b=document.querySelector(`[data-key="${e.key.toLowerCase()}"]`);if(b){e.preventDefault();b.click();}
});
function draw(index,room){const c=$('art').getContext('2d');c.fillStyle='#9bbc0f';c.fillRect(0,0,160,72);c.fillStyle='#8bac0f';for(let y=0;y<65;y+=12)for(let x=(y%24?0:8);x<160;x+=22){c.fillRect(x,y,20,1);c.fillRect(x,y,1,11);}c.fillStyle='#306230';c.fillRect(0,65,160,2);if(index<0){drawRoom(c,room||'quiet');return;}const sprites=[['0010000100','0111111110','1111111111','0010110100','0011111100','0001111000','0011111100','0111111110','0101111010','0001001000','0011001100'],['0001111000','0011111100','0010110100','0011111100','0001001000','0011111100','0101001010','0001111000','0001001000','0011001100'],['0011111100','0111111110','1111111111','1101110111','1111111111','0110000110','0011111100','0111111110','1111111111','1011111101','0001001000','0011001100'],['0001111000','0011111100','0010110100','0011111100','1001001001','1101111011','1111111111','1111111111','1111111111','1111111111','1101111011'],['100000000001','110001100011','111011110111','111111111111','011101101110','001111111100','011110011110','111111111111','110111111011','100111111001','000101101000','001100001100']];const sp=sprites[index],sz=4,w=sp[0].length,x0=(160-w*sz)/2,y0=65-sp.length*sz;c.fillStyle='#0f380f';sp.forEach((r,y)=>[...r].forEach((v,x)=>{if(v==='1')c.fillRect(x0+x*sz,y0+y*sz,sz,sz);}));}

render();

function drawRoom(c,room) {
  const ink='#0f380f',shade='#306230',moss='#8bac0f',glow='#9bbc0f';
  const r=(x,y,w,h,color=ink)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
  // A full room fills the viewport; objects sit in the space, never in a frame.
  r(0,0,160,72,shade);r(0,45,160,27,moss);
  for(let y=2;y<44;y+=11)for(let x=(y%2?0:9);x<160;x+=23){r(x,y,21,1,ink);r(x,y,1,10,ink);}
  for(let y=51;y<72;y+=8)r(0,y,160,1,shade);
  const column=x=>{r(x,0,13,48,ink);r(x+3,3,6,41,moss);r(x-3,0,19,4,ink);r(x-4,44,21,5,ink);};
  const candle=(x,y)=>{r(x,y,3,11,moss);r(x-2,y+10,7,2);r(x,y-5,3,4,glow);r(x+1,y-8,1,3,glow);};
  if(room==='fountain') {
    column(7);column(140);r(48,6,64,30,ink);r(53,10,54,24,shade);
    r(75,4,10,10,moss);r(70,12,20,6,moss);r(77,16,6,28,glow);
    for(let i=0;i<3;i++){r(65-i*8,24+i*6,4,9,glow);r(91+i*8,24+i*6,4,9,glow);}
    r(34,47,92,16);r(26,51,108,8);r(38,47,84,12,shade);r(45,50,70,6,glow);
    r(55,52,14,1,moss);r(81,54,21,1,moss);r(39,63,82,3,shade);
    for(const x of [18,128]){r(x,35,3,8,moss);r(x+3,40,5,2,moss);}
  } else if(room==='camp') {
    r(0,0,160,45,ink);for(const [x,y] of [[8,18],[31,9],[130,20],[145,7]])r(x,y,3,8,shade);
    for(let y=0;y<35;y++){const half=Math.floor(y*.75);r(49-half,13+y,half*2+2,1,y%5===0?shade:moss);}
    for(let y=0;y<23;y++){const half=Math.floor(y*.34);r(49-half,25+y,half*2+1,1,ink);}
    r(21,49,60,2,ink);r(27,50,2,6);r(70,50,2,6);
    r(99,57,30,4);r(103,61,21,3);r(106,48,16,10,shade);
    for(let y=0;y<17;y++){const half=Math.floor(y*.42);r(114-half,40+y,half*2+1,1,glow);}r(108,38,3,11,glow);r(119,44,3,9,glow);
    r(110,27,3,6,shade);r(116,20,2,5,shade);r(143,51,12,7,shade);r(84,65,10,3,ink);
  } else if(room==='chest') {
    column(8);column(139);r(30,10,12,29,ink);r(119,10,12,29,ink);candle(35,20);candle(124,20);
    r(54,36,51,27);r(58,39,43,20,moss);r(54,29,51,10,ink);r(58,31,43,5,shade);
    r(54,42,51,7,shade);r(76,40,8,13,ink);r(78,43,4,5,glow);
    for(const [x,y] of [[41,58],[32,62],[111,59],[119,63],[99,66],[48,67],[108,54]]){r(x,y,7,3,ink);r(x+1,y,4,1,glow);}
    r(31,10,3,22,moss);r(126,10,3,22,moss);
  } else if(room==='altar') {
    r(44,0,72,41,ink);r(49,0,62,36,shade);r(73,8,14,2,moss);r(68,12,24,2,moss);r(66,16,28,2,moss);r(69,20,22,2,moss);
    r(74,25,12,5,glow);r(78,26,3,2,shade);
    r(29,46,102,8);r(35,43,90,4,moss);r(41,54,10,12);r(109,54,10,12);r(25,67,110,3,shade);
    candle(38,31);candle(120,31);candle(57,33);candle(101,33);
    r(75,56,10,8,shade);r(79,56,2,8,moss);
  } else if(room==='trap') {
    // Receding walls, pressure plates, and darts crossing the entire passage.
    r(48,0,64,45,ink);r(54,0,52,45,shade);
    for(let i=0;i<4;i++){const y=10+i*11;r(7,y,8,4);r(145,y,8,4);r(22+i*8,y+2,24,1,glow);r(115-i*6,y+3,21,1,ink);}
    r(60,48,34,7,ink);r(62,48,29,5,moss);r(24,62,43,7,shade);r(29,63,33,4,moss);r(102,59,41,9,ink);r(105,60,35,6,moss);
    r(45,24,44,1,glow);r(84,22,3,5,glow);r(81,23,3,3,glow);
  } else {
    r(45,0,70,46,ink);r(64,0,32,46,shade);r(74,0,12,46,ink);
    for(const x of [9,35,112,138])column(x);
    r(54,47,52,2,shade);r(44,53,72,2,shade);r(32,62,96,2,shade);
    r(79,45,2,27,shade);r(50,67,4,2,ink);r(106,58,3,2,ink);
  }
}
