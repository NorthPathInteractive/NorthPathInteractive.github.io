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
    stage:'explore',enemy:null,deck:[],player:[],foe:[],pot:0,identify:0,known:[],recorded:false,
    note:'10 health. 20 gold. Explore, win gold, survive. There is no final boss.'};
}
function validRun(r) {
  return r && typeof r.id==='string' && ['explore','play','result','dead'].includes(r.stage) &&
    ['hp','max','gold','kills','depth','pot','identify'].every(k=>Number.isSafeInteger(r[k])&&r[k]>=0) &&
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
function explore() {
  if(state.stage!=='explore')return;
  state.depth++;
  if(state.depth%3===2) {
    const healed=Math.min(3,state.max-state.hp);state.hp+=healed;state.note=`A quiet fountain. Restored ${healed} health.`;fx('heal');
  } else if(Math.random()<.16) {
    if(Math.random()<.5) { const gold=3+Math.floor(state.kills/4);state.gold+=gold;state.note=`A forgotten chest. Found ${gold} gold.`; }
    else { state.identify++;state.note='A forgotten chest. Found an Identify potion! Use it in battle to learn an enemy’s level and behavior.'; }
    fx('treasure');
  } else { state.enemy=encounter();state.player=[];state.foe=[];deal();return; }
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
  $('title').textContent=state.stage==='dead'?'GAME OVER':m?m.name:'THE QUIET HALL';
  $('subtitle').textContent=m?`${'♥'.repeat(state.enemy.left)} · `+(identified()?`LV ${state.enemy.level} · ${behavior(state.enemy)}`:'Not identified'):'An endless dungeon. Every gold piece counts.';
  $('stakes').textContent=state.enemy?`ANTE ${state.enemy.ante}G / HAND · `+(state.stage==='play'?`POT ${state.pot*2}G`:'WIN RETURNS '+state.enemy.ante*2+'G'):'';
  $('table').hidden=!combat;
  if(combat){$('enemyLabel').textContent=m.name;$('enemyScore').textContent=state.stage==='play'?'?':score(state.foe);$('playerScore').textContent=score(state.player);cards('enemyCards',state.foe,state.stage==='play');cards('playerCards',state.player,false);}
  $('message').textContent=state.note;$('actions').replaceChildren();
  if(state.stage==='explore'){button('EXPLORE →',explore,'e');if(state.gold>=5&&state.hp<state.max)button('HEAL · 5G',potion);}
  if(state.stage==='play'){button('HIT +',hit,'h');button('STAND ■',stand,'s');}
  if(state.stage==='result')button(`NEXT HAND · ${state.enemy.ante}G`,deal,'e');
  if(['play','result'].includes(state.stage)&&state.identify>0&&!identified())button(`IDENTIFY · ×${state.identify}`,identify,'i');
  if(state.stage==='dead')button('PLAY AGAIN',restart,'e');
  $('scoreEntry').hidden=state.stage!=='dead';$('scoreForm').hidden=state.recorded;
  $('finalScore').textContent=`${state.gold} GOLD`;
  $('scoreFeedback').textContent=state.recorded?'Score saved on this device.':state.stage==='dead'?'Enter up to 3 initials to record your score.':'';
  draw(m?state.enemy.index:-1);save();renderScores();
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
function draw(index){const c=$('art').getContext('2d');c.fillStyle='#9bbc0f';c.fillRect(0,0,160,72);c.fillStyle='#8bac0f';for(let y=0;y<65;y+=12)for(let x=(y%24?0:8);x<160;x+=22){c.fillRect(x,y,20,1);c.fillRect(x,y,1,11);}c.fillStyle='#306230';c.fillRect(0,65,160,2);if(index<0){c.fillStyle='#306230';c.fillRect(58,8,44,57);c.fillStyle='#0f380f';c.fillRect(64,14,32,51);c.fillStyle='#8bac0f';c.fillRect(78,47,4,18);c.fillRect(74,53,12,4);return;}const sprites=[['0010000100','0111111110','1111111111','0010110100','0011111100','0001111000','0011111100','0111111110','0101111010','0001001000','0011001100'],['0001111000','0011111100','0010110100','0011111100','0001001000','0011111100','0101001010','0001111000','0001001000','0011001100'],['0011111100','0111111110','1111111111','1101110111','1111111111','0110000110','0011111100','0111111110','1111111111','1011111101','0001001000','0011001100'],['0001111000','0011111100','0010110100','0011111100','1001001001','1101111011','1111111111','1111111111','1111111111','1111111111','1101111011'],['100000000001','110001100011','111011110111','111111111111','011101101110','001111111100','011110011110','111111111111','110111111011','100111111001','000101101000','001100001100']];const sp=sprites[index],sz=4,w=sp[0].length,x0=(160-w*sz)/2,y0=65-sp.length*sz;c.fillStyle='#0f380f';sp.forEach((r,y)=>[...r].forEach((v,x)=>{if(v==='1')c.fillRect(x0+x*sz,y0+y*sz,sz,sz);}));}

render();
