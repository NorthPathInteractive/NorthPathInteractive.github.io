 'use strict';
const $ = id => document.getElementById(id);
const KEY = 'dungeon21-quest-v1', SCORES = 'dungeon21-scores-v1';
const HALLS = [
  {name:'Emerald',key:'Red',cost:25,colors:['#102b1b','#285c39','#80b65c','#c7e98a'],names:['MOSS GOBLIN','CAVE BAT','THORN IMP'],count:3},
  {name:'Ruby',key:'Blue',cost:50,colors:['#350e1d','#82293d','#d66b60','#ffd3a0'],names:['CINDER HOUND','BLOOD SKELETON','ASH ORC','EMBER WITCH'],count:4},
  {name:'Sapphire',key:'Gold',cost:75,colors:['#091c43','#225786','#65b7d4','#d2f4ff'],names:['FROST SPIDER','DROWNED KNIGHT','GLACIER TROLL','RIME WRAITH','ABYSS SERPENT'],count:5},
  {name:'Amethyst',key:'Amethyst',cost:100,colors:['#211535','#544383','#929ce0','#f3efff'],names:['VOID MOTH','CRYSTAL REVENANT','DUSK VAMPIRE','STARLESS SEER','PRISM WYRM','AMETHYST DRAGON'],count:6}
];
const BOSS={name:'THE CROWNLESS KING',sprite:4,hearts:6,ante:8,damage:4};
function hall(){return HALLS[state.hall];}
function monster(e=state.enemy){return e?.boss?BOSS:{name:hall().names[e?.index||0],sprite:(e?.index||0)%5};}
const sound = window.DungeonAudio;
let state, muted = true, started = false, storageOK = true, inventoryOpen = false, inventoryNotice = '', statusOpen = false, moveTimer = null, monsterTimer = null, lastAttributes = null;
function newTally(){return {wins:0,losses:0,ties:0,fled:0,damage:0,healed:0};}
function fresh(hallIndex=0,admin=false) {
  return {id:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2),hp:10,max:10,gold:admin?1000:5,kills:0,depth:0,hall:hallIndex,hallKills:0,key:false,sinceShop:0,admin,storySeen:false,final:false,
    tally:newTally(),trackingSinceUpdate:false,startedAt:Date.now(),stage:'explore',outcome:null,turnLog:[],turnFrames:[],turnIndex:0,room:null,enemy:null,deck:[],player:[],foe:[],pot:0,healing:0,identify:0,known:[],recorded:false,
    note:admin?'ADMIN TEST: 1,000 starting gold. This quest is not ranked.':'The king gives you 5 gold. Find the key. Survive the Obsidian Veil.'};
}
function validRun(r) {
  return r && typeof r.id==='string' && ['explore','room','shop','stairs','checkpoint','final','play','monster','result','dead','won'].includes(r.stage) &&
    Number.isInteger(r.hall)&&r.hall>=0&&r.hall<4&&typeof r.key==='boolean'&&typeof r.admin==='boolean'&&typeof r.final==='boolean'&&typeof r.storySeen==='boolean'&&Number.isSafeInteger(r.hallKills)&&r.hallKills>=0&&Number.isSafeInteger(r.sinceShop)&&r.sinceShop>=0&&
    r.tally&&['wins','losses','ties','fled','damage','healed'].every(k=>Number.isSafeInteger(r.tally[k])&&r.tally[k]>=0)&&Number.isFinite(r.startedAt)&&typeof r.trackingSinceUpdate==='boolean'&&
    ['hp','max','gold','kills','depth','pot','identify','healing'].every(k=>Number.isSafeInteger(r[k])&&r[k]>=0) &&
    (r.turnLog===undefined||(Array.isArray(r.turnLog)&&r.turnLog.every(line=>typeof line==='string')))&&
    (r.turnFrames===undefined||(Array.isArray(r.turnFrames)&&Number.isInteger(r.turnIndex)&&r.turnIndex>=0&&(!r.turnFrames.length||r.turnIndex<r.turnFrames.length)&&r.turnFrames.every(f=>f&&['REVEAL','HIT','STAND','BUST'].includes(f.move)&&typeof f.text==='string'&&Array.isArray(f.cards)&&f.cards.length>=2&&f.cards.every(c=>c&&['A','2','3','4','5','6','7','8','9','10','J','Q','K'].includes(c.r)&&['♠','♥','♣','♦'].includes(c.s))))) &&
    (!r.outcome || (['win','loss','tie'].includes(r.outcome.kind)&&typeof r.outcome.message==='string'&&typeof r.outcome.defeated==='boolean'&&[r.outcome.player,r.outcome.foe].every(Number.isSafeInteger))) &&
    (!r.room || ['chest','fountain','camp','altar','trap','quiet','shop','stairs','final'].includes(r.room)) &&
    (r.stage!=='room'||r.room==='altar'&&!r.enemy) &&
    r.max===10 && r.hp<=10 && Array.isArray(r.known) && r.known.every(k=>typeof k==='string') &&
    [r.deck,r.player,r.foe].every(h=>Array.isArray(h)&&h.every(c=>c&&['A','2','3','4','5','6','7','8','9','10','J','Q','K'].includes(c.r)&&['♠','♥','♣','♦'].includes(c.s))) &&
    (!r.enemy || (Number.isInteger(r.enemy.index)&&r.enemy.index>=0&&r.enemy.index<HALLS[r.hall].count&&
      ['level','left','hearts','damage','ante'].every(k=>Number.isSafeInteger(r.enemy[k])&&r.enemy[k]>0))) &&
    (!['play','monster','result'].includes(r.stage)||!!r.enemy) &&
    (!['play','monster'].includes(r.stage)||(r.pot===r.enemy.ante&&r.player.length>=2&&r.foe.length>=2&&r.deck.length>0));
}
try { const s=JSON.parse(localStorage.getItem(KEY)); if(s?.version===3&&s.run){if(s.run.healing===undefined)s.run.healing=0;if(s.run.tally===undefined){s.run.tally=newTally();s.run.startedAt=Date.now();s.run.trackingSinceUpdate=true;}} state=s?.version===3&&validRun(s.run)?s.run:fresh(); }
catch { state=fresh(); storageOK=false; }
// Retire explicit route hints stored by earlier releases without changing quest progress.
if(state.stage==='stairs'&&/^(The gate needs|Your .* key fits)/.test(state.note))state.note=`A ${doorName().toLowerCase()} breaks the familiar stonework. Cold air stirs beneath it. Where does it lead?`;
if(state.stage==='explore'&&/^.* Hall\. Find the merchant, buy/.test(state.note))state.note=`${hall().name} Hall. Unfamiliar shadows gather ahead. Explore carefully.`;
if(state.stage==='shop'&&/^The merchant offers a .* key for/.test(state.note))state.note='The merchant unfolds a velvet cloth. Strange keys and bottled remedies catch the light.';
function save() { try { localStorage.setItem(KEY,JSON.stringify({version:3,run:state})); } catch { storageOK=false; } }
function score(hand) { let n=0,a=0; for(const c of hand){n+=c.r==='A'?11:['J','Q','K'].includes(c.r)?10:Number(c.r);if(c.r==='A')a++;}while(n>21&&a){n-=10;a--;}return n; }
function natural(h) { return h.length===2&&score(h)===21; }
function deck() { const d=[];for(const s of ['♠','♥','♣','♦'])for(const r of ['A','2','3','4','5','6','7','8','9','10','J','Q','K'])d.push({r,s});for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]];}return d; }
function fx(name,character) { sound?.effect(name,character); }
function flash(name) { document.body.classList.remove('enemy-hit','player-hurt');void document.body.offsetWidth;document.body.classList.add(name);setTimeout(()=>document.body.classList.remove(name),600); }
async function setSound(on) { const ok=await sound?.enable(on);muted=!ok;$('sound').textContent=muted?'SOUND OFF':'SOUND ON';$('sound').setAttribute('aria-pressed',String(!muted));return ok; }
function enterPlay() { started=true;$('menuScreen').hidden=true;$('titleScreen').hidden=true;$('playScreen').hidden=false;render();$('actions').querySelector('button')?.focus(); }
function startGame(){if(!state.storySeen){showStory();return;}enterPlay();}
function titleReady() { const b=$('powerOn');b.textContent=state.depth>0?'CONTINUE RUN →':'START ADVENTURE →';b.onclick=startGame;$('titleHint').textContent=muted?'Sound is off. Tap SOUND OFF to retry audio.':'Title theme · Original pocket chiptune';b.focus(); }
$('powerOn').onclick=async()=>{await setSound(true);titleReady();};
$('silentStart').onclick=()=>{setSound(false);startGame();};
$('savedHint').textContent=`${state.admin?'ADMIN · ':''}${HALLS[state.hall].name.toUpperCase()} · ${state.hp}♥ · ${state.gold}G`;
function enemyKey(e=state.enemy) { return state.hall+':'+(e.boss?'boss':e.index)+':'+e.level; }
function identified() { return !!state.enemy&&state.known.includes(enemyKey()); }
function behavior(e) {
  if(e.level===1)return 'Stands on 12 or higher.';
  if(e.level===2)return 'Stands on 15 or higher.';
  if(e.level===3)return 'Stands on 17 or higher.';
  return 'Stands on 17+ if your first card is 7 or higher; otherwise stands on 15+.';
}
function encounter() {
  const unlocked=Math.min(hall().count,2+Math.floor(state.hallKills/2));
  const index=Math.floor(Math.random()*unlocked),level=state.hall+1;
  const hearts=1+state.hall+Math.floor(index/3);
  return {index,level,hearts,left:hearts,damage:1+state.hall,ante:1+state.hall+Math.floor(index/2)};
}
const rooms = {
  shop:{name:'THE VEIL MERCHANT',hint:'Keys, remedies, and a price for everything.'},
  stairs:{name:'THE SEALED STAIR',hint:'Beyond the gate, the halls grow darker.'},
  final:{name:'THE GLISTENING CHAMBER',hint:'The last lock opens. A crown moves in the light.'},
  chest: {name:'FORGOTTEN TREASURY',hint:'Something glints beneath the dust.'},
  fountain: {name:'WHISPERING FOUNTAIN',hint:'Cold water. A familiar voice.'},
  camp: {name:'ABANDONED CAMP',hint:'The coals are still warm. Nobody answers.'},
  altar: {name:'CURSED ALTAR',hint:'A gold coin floats above a cracked stone hand.'},
  trap: {name:'DART GALLERY',hint:'A quiet click. Then a sharp sting.'},
  quiet: {name:'ECHO CHAMBER',hint:'Your footsteps return one beat too late.'}
};
function doorName(){return state.hall<3?HALLS[state.hall+1].name+' Door':'Amethyst Door';}
function explore() {
  if(state.stage!=='explore'||state.outcome||inventoryOpen||statusOpen)return;
  $('playContent').scrollTop=0;
  state.depth++;state.enemy=null;state.room=null;
  const roll=state.sinceShop>=7?.20:Math.random();
  state.sinceShop++;
  if(roll<.18) {
    state.room='chest';
    if(Math.random()<.5) { const gold=3+state.hall*2;state.gold+=gold;state.note=`You lift a rusted lid. Beneath scraps of velvet: +${gold} gold.`; }
    else { state.identify++;state.note='A stoppered glass eye rests in the chest. Identify potion +1. Its knowledge lasts for this run.'; }
    fx('treasure');
  } else if(roll<.30) {
    state.sinceShop=0;state.room='shop';state.stage='shop';state.note='The merchant unfolds a velvet cloth. Strange keys and bottled remedies catch the light.';
  } else if(roll<.38) {
    state.room='stairs';state.stage='stairs';state.note=`A ${doorName().toLowerCase()} breaks the familiar stonework. Cold air stirs beneath it. Where does it lead?`;
  } else if(roll<.43) {
    state.room='fountain';const healed=Math.min(3,state.max-state.hp);state.hp+=healed;state.tally.healed+=healed;
    state.note=healed?`You drink from the whispering fountain. +${healed} health.`:'The water is cold and clear. You already have full health.';fx('heal');
  } else if(roll<.46) {
    state.room='camp';const healed=Math.min(1,state.max-state.hp);state.hp+=healed;state.tally.healed+=healed;
    state.note=healed?'You rest beside the last warm embers. +1 health. Something moves beyond the firelight.':'You pause by the embers. Full health; no supplies remain. A distant door closes.';fx('heal');
  } else if(roll<.50) {
    state.room='altar';state.stage='room';
    state.note='Touch the altar? 50% chance: gain 6 gold. Otherwise: lose 2 health (can be fatal). Leaving costs nothing.';
  } else if(roll<.53) {
    state.room='trap';state.tally.damage+=Math.min(state.hp,1);state.hp=Math.max(0,state.hp-1);state.note='A loose flagstone fires a hidden dart. −1 health. The trap is spent.';fx('hurt');flash('player-hurt');
    if(state.hp===0)endRun('A hidden dart claims your last health.');
  } else if(roll<.55) {
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
  else {const damage=Math.min(state.hp,2);state.tally.damage+=damage;state.hp-=damage;state.note=`The stone hand seizes your wrist. −${damage} health. You pull free.`;fx('hurt');flash('player-hurt');if(state.hp===0)endRun(`The cursed altar takes your last health. −${damage} health.`);}
  render();
}
function endRun(reason) { state.stage='dead';state.pot=0;state.note=reason+` GAME OVER. Final score: ${state.gold} gold.`;fx('defeat'); }
function deal() {
  if(!state.enemy||!['explore','result'].includes(state.stage))return;
  const ante=state.enemy.ante;
  if(state.gold<ante) { endRun(`You have ${state.gold} gold but need ${ante} for the next ante.`);render();return; }
  $('playContent').scrollTop=0;state.outcome=null;state.turnLog=[];state.turnFrames=[];state.turnIndex=0;clearTimeout(monsterTimer);state.gold-=ante;state.pot=ante;state.deck=deck();state.player=[state.deck.pop(),state.deck.pop()];state.foe=[state.deck.pop(),state.deck.pop()];state.stage='play';fx('card');
  state.note=`${ante} gold ante paid. Win: collect ${ante*2} gold. Hit or stand?`;
  if(natural(state.player)||natural(state.foe)){
    const opening=natural(state.player)&&natural(state.foe)?'Both sides have blackjack.':natural(state.player)?'You have blackjack!':`${monster().name} has blackjack!`;
    const text=`${opening} ${monster().name} reveals ${state.foe.map(c=>c.r+c.s).join(' ')} — total ${score(state.foe)}.`;
    state.turnFrames=[{move:'REVEAL',text,cards:state.foe.map(c=>({...c}))}];state.turnLog=[text];state.stage='monster';state.note=text;
  }render();
}
function hit() { if(state.stage!=='play')return;state.player.push(state.deck.pop());flashMove('HIT','YOU');fx('card');if(score(state.player)>21){finish(-1,'You bust.');return;}if(score(state.player)===21){stand(true);return;}render(); }
function monsterHit() {
  const e=state.enemy,n=score(state.foe);
  const hold=e.level===1?12:e.level===2?15:e.level===3?17:score([state.player[0]])>=7?17:15;
  return n<hold;
}
function flashMove(move,actor){
  if(move==='HIT'||move==='STAND')fx('voice-'+move.toLowerCase(),actor);
  clearTimeout(moveTimer);$(actor==='YOU'?'playerHand':'enemyHand').append($('moveBanner'));$('moveActor').textContent=actor;$('moveText').textContent=move;
  $('moveBanner').classList.remove('attribute-flash');$('moveBanner').hidden=false;$('moveBanner').classList.remove('move-flash');void document.body.offsetWidth;$('moveBanner').classList.add('move-flash');
  moveTimer=setTimeout(()=>{$('moveBanner').hidden=true;},950);
}
function flashAttributes(changes){
  clearTimeout(moveTimer);
  const parent=inventoryOpen?'inventoryPanel':state.outcome?'resultScreen':!$('table').hidden?'playerHand':'roomFeedback';
  $(parent).append($('moveBanner'));$('moveActor').textContent='YOUR CHANGES';$('moveText').replaceChildren();
  for(const change of changes){const line=document.createElement('span');line.className='delta-'+(change.kind==='gold'?'gold':change.amount<0?'loss':'heal');line.textContent=`${change.amount>0?'+':''}${change.amount} ${change.kind==='gold'?'GOLD':'♥'}`;$('moveText').append(line);}
  $('moveBanner').hidden=false;$('moveBanner').classList.remove('move-flash');$('moveBanner').classList.add('attribute-flash');void document.body.offsetWidth;$('moveBanner').classList.add('move-flash');
  moveTimer=setTimeout(()=>{$('moveBanner').hidden=true;},1500);
}
function monsterDone(){return !state.turnFrames?.length||state.turnIndex===state.turnFrames.length-1;}
function scheduleMonster(){
  clearTimeout(monsterTimer);
  if(state.stage!=='monster'||!started||inventoryOpen||statusOpen||document.hidden)return;
  const done=monsterDone(),delay=done&&(state.turnFrames?.length||0)<=1?1800:1200;
  monsterTimer=setTimeout(done?resolveMonster:advanceMonster,delay);
}
function advanceMonster(){
  clearTimeout(monsterTimer);
  if(state.stage!=='monster'||monsterDone()||inventoryOpen||statusOpen||document.hidden)return;
  state.turnIndex++;const frame=state.turnFrames[state.turnIndex];state.foe=frame.cards.map(c=>({...c}));
  state.turnLog=state.turnFrames.slice(0,state.turnIndex+1).map(f=>f.text);state.note=frame.text;
  flashMove(frame.move,monster().name);if(frame.move==='HIT')fx('card');render();
}
function stand(fromHit=false) {
  if(state.stage!=='play')return;
  if(fromHit!==true)flashMove('STAND','YOU');
  const name=monster().name,frames=[];
  const add=(move,text)=>frames.push({move,text,cards:state.foe.map(c=>({...c}))});
  add('REVEAL',`${name} reveals ${state.foe.map(c=>c.r+c.s).join(' ')} — total ${score(state.foe)}.`);
  while(score(state.foe)<21&&monsterHit()){
    const card=state.deck.pop();state.foe.push(card);add('HIT',`${name} hits: ${card.r}${card.s} — total ${score(state.foe)}.`);
  }
  const total=score(state.foe);add(total>21?'BUST':'STAND',total>21?`${name} busts on ${total}!`:`${name} stands on ${total}.`);
  state.turnFrames=frames;state.turnIndex=0;state.foe=frames[0].cards.map(c=>({...c}));state.turnLog=[frames[0].text];
  state.stage='monster';state.note=frames[0].text;fx('card');render();
}
function resolveMonster(){
  if(state.stage!=='monster'||!monsterDone()||inventoryOpen||statusOpen||document.hidden)return;
  clearTimeout(monsterTimer);state.stage='play';settle();
}
function settle() {
  if(state.stage!=='play')return;
  const p=score(state.player),f=score(state.foe);
  if(natural(state.player)||natural(state.foe)){const r=natural(state.player)===natural(state.foe)?0:natural(state.player)?1:-1;finish(r,r===0?'Two blackjacks. A tie.':r===1?'Blackjack!':'Monster blackjack.');return;}
  finish(f>21?1:p>f?1:p<f?-1:0,f>21?'Monster busts.':p===f?'A tie.':p>f?'You win the hand.':'Monster wins the hand.');
}
function finish(result,msg) {
  if(state.stage!=='play'||!state.enemy)return;
  const e=state.enemy,m=monster(e),ante=state.pot;state.pot=0;state.stage='result';
  if(result>0) {
    state.tally.wins++;state.gold+=ante*2;e.left--;msg+=` Collected ${ante*2} gold.`;fx('hit');flash('enemy-hit');
    if(e.left===0) { state.kills++;state.hallKills++;state.enemy=null;state.stage=e.boss?'won':'explore';fx(e.boss?'clear':'victory');msg+=e.boss?' The Crownless King falls. The chamber holds stolen sunlight, sealed inside every coin. You break the crown, free the dawn, and return with the king’s long-buried truth.':` ${m.name} defeated! Explore onward.`; }
  } else if(result<0) {
    const damage=Math.min(state.hp,e.damage);state.tally.losses++;state.tally.damage+=damage;state.hp-=damage;msg+=` Ante forfeited: ${ante}G. −${damage} health.`;fx('hurt');flash('player-hurt');
  } else { state.tally.ties++;state.gold+=ante;msg+=` +${ante} gold returned. No damage.`;fx('tie'); }
  if(state.turnLog?.length)msg=state.turnLog[state.turnLog.length-1]+' '+msg;
  state.note=msg;$('playContent').scrollTop=0;
  state.outcome={kind:result>0?'win':result<0?'loss':'tie',player:score(state.player),foe:score(state.foe),message:msg,defeated:!state.enemy};
  if(state.hp===0)endRun(msg);
  else if(state.enemy&&state.gold<state.enemy.ante&&(result>=0||state.gold<2))endRun(msg+` You cannot cover the next ${state.enemy.ante}-gold ante.`);
  render();
}
function dismissOutcome() {
  if(state.stage!=='explore'||!state.outcome||state.enemy)return;
  state.outcome=null;resumeExploration();
}
function resumeExploration(){
  clearTimeout(monsterTimer);clearTimeout(moveTimer);$('moveBanner').hidden=true;
  state.player=[];state.foe=[];state.turnLog=[];state.turnFrames=[];state.turnIndex=0;state.pot=0;
  if(state.stage==='explore')explore();else render();
}
function flee() {
  if(state.stage!=='result'||state.outcome?.kind!=='loss'||!state.enemy||state.hp===0||state.gold<2)return;
  state.tally.fled++;state.gold-=2;state.enemy=null;state.outcome=null;state.room=null;state.player=[];state.foe=[];state.pot=0;state.stage=state.final?'final':'explore';
  if(state.final)state.room='final';
  state.note='The Crownless King still guards the glistening chamber.';resumeExploration();
}
function identify() {
  if(!state.enemy||!['play','result'].includes(state.stage)||state.identify<1||identified())return;
  state.identify--;state.known.push(enemyKey());
  state.note=`Identified ${monster().name}, level ${state.enemy.level}. ${behavior(state.enemy)} Known for this run.`;fx('heal');render();
}
function potion() {
  if(['dead','won','monster'].includes(state.stage)||state.healing<1||state.hp===state.max)return;
  if(!confirm('Use 1 healing potion to restore up to 4 health?'))return;
  state.healing--;const h=Math.min(4,state.max-state.hp);state.hp+=h;state.tally.healed+=h;
  state.note=`Healing potion: +${h} health. ${state.healing} remaining.`;inventoryNotice=state.note;fx('heal');render();
}
function buyHealing(){if(state.stage!=='shop'||state.gold<5)return;if(!confirm('Buy 1 healing potion for 5 gold?'))return;state.gold-=5;state.healing++;state.note='Healing potion +1. Spent 5 gold. Use it from Inventory.';fx('treasure');render();}
function toggleInventory(){if(!started)return;statusOpen=false;inventoryOpen=!inventoryOpen;inventoryNotice='';renderInventory();scheduleMonster();if(inventoryOpen)$('closeInventory').focus();else $('inventoryButton').focus();}
function renderInventory(){
  $('inventoryPanel').hidden=!inventoryOpen;
  $('statusPanel').hidden=!statusOpen;
  $('playContent').hidden=inventoryOpen||statusOpen;$('actions').hidden=inventoryOpen||statusOpen;
  $('inventorySummary').textContent=`Healing potions ×${state.healing} · Identify potions ×${state.identify}`;
  highlightChanges($('inventoryFeedback'),inventoryNotice);
  $('inventoryKey').textContent=state.key?`${hall().key} key — opens this hall’s gate.`:'No key carried.';
  $('useHealing').textContent=`USE HEALING · ×${state.healing}`;$('useHealing').disabled=state.healing<1||state.hp===state.max||['dead','won','monster'].includes(state.stage);
  $('useIdentify').textContent=`USE IDENTIFY · ×${state.identify}`;$('useIdentify').disabled=state.identify<1||!state.enemy||!['play','result'].includes(state.stage)||identified();
  $('inventoryHelp').textContent=state.healing===0&&state.identify===0?(state.key?'No potions carried. Buy potions for 5 gold each at a shop.':'Your inventory is empty. Buy potions for 5 gold each at a shop.'):'Healing restores up to 4 health. Identify reveals the current enemy’s level and behavior. Using items does not pay another ante.';
  $('inventoryButton').setAttribute('aria-expanded',String(inventoryOpen));
}
$('inventoryButton').onclick=toggleInventory;$('closeInventory').onclick=toggleInventory;
$('useHealing').onclick=potion;
$('useIdentify').onclick=()=>{identify();inventoryNotice=state.note;renderInventory();};
function compactResult(text){
  return text.replace(/(\d+)\s*gold\s*ante\s*paid/gi,'-$1G ante')
    .replace(/(?:spent|lost|paid)\s+(\d+)\s*gold/gi,'-$1G')
    .replace(/collected\s+(\d+)\s*gold/gi,'+$1G returned')
    .replace(/(?:restored|healed)\s+(\d+)\s*health/gi,'+$1♥')
    .replace(/([+−–-]?)(\d+)\s*health/gi,(_,sign,n)=>(sign==='−'||sign==='–'?'-':sign)+n+'♥')
    .replace(/([+−–-]?)(\d+)\s*gold/gi,(_,sign,n)=>(sign==='−'||sign==='–'?'-':sign)+n+'G')
    .replace(/net\s*([+−-])(\d+)(?![\dG])/gi,'net $1$2G');
}
function highlightChanges(element,text) {
  element.replaceChildren();text=compactResult(text);
  const pattern=/(?:[+−–-]\d+G|[+−–-]\d+♥|(?:healing\s+potion|identify\s+potion|(?:red|blue|gold|amethyst)\s+key)\s*[+−–-]\s*\d+)/gi;
  let previous=0;
  const append=(content,type)=>{const span=document.createElement('span');span.textContent=content;if(type)span.className='impact impact-'+type;element.append(span);};
  for(const match of text.matchAll(pattern)) {
    if(match.index>previous)append(text.slice(previous,match.index));
    const token=match[0],type=/G$/i.test(token)?'gold':token.endsWith('♥')?(/^[−–-]/.test(token)?'loss':'heal'):'item';
    append(token,type);previous=match.index+token.length;
  }
  if(previous<text.length)append(text.slice(previous));
}
function toggleStatus(){if(!started)return;inventoryOpen=false;statusOpen=!statusOpen;renderStatus();renderInventory();scheduleMonster();if(statusOpen)$('closeStatusTop').focus();else $('actions').querySelector('button')?.focus();}
function renderStatus(){
  $('statusDetails').replaceChildren();
  const rows=[['Hall',`${state.hall+1}/4 · ${hall().name}`],['Health',`${state.hp}/${state.max}♥`],['Gold',`${state.gold}G`],['Rooms explored',state.depth],['Monsters defeated',state.kills],['Defeated in this hall',state.hallKills],['Key carried',state.key?hall().key+' key':'None'],['Healing potions',state.healing],['Identify potions',state.identify],['Known enemy types/levels',state.known.length],['Hands won / lost / tied',`${state.tally.wins} / ${state.tally.losses} / ${state.tally.ties}`],['Damage taken',`${state.tally.damage}♥`],['Health restored',`${state.tally.healed}♥`],['Escapes',state.tally.fled],['Current ante',state.enemy?state.enemy.ante+'G':'No battle'],['Your committed stake',state.pot+'G'],['Explorations since shop',state.sinceShop],['Hall password',hall().name.toUpperCase()],['Run mode',state.admin?'ADMIN TEST · not ranked':'Normal · ranked locally'],['Tracked time',Math.max(0,Math.floor((Date.now()-state.startedAt)/60000))+' minutes'],['Save',storageOK?'Saved on this browser':'Storage unavailable']];
  for(const [label,value] of rows){const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=String(value);row.append(dt);row.append(dd);$('statusDetails').append(row);}
  $('statusNote').textContent=state.trackingSinceUpdate?'Room and kill counts cover your existing run. Hand results, damage, healing and tracked time start from the v0.8.0 update.':'Stats cover this quest. High scores use the gold remaining when it ends.';
}
$('closeStatus').onclick=toggleStatus;$('closeStatusTop').onclick=toggleStatus;
function button(label,fn,key) { const b=document.createElement('button');b.textContent=label;b.onclick=fn;if(key)b.dataset.key=key;$('actions').append(b); }
function cards(id,hand,hide) { $(id).replaceChildren();hand.forEach((c,i)=>{const el=document.createElement('span');el.className='card'+(hide&&i===1?' back':'');el.textContent=hide&&i===1?'?':c.r+c.s;el.setAttribute('aria-label',hide&&i===1?'Hidden card':c.r+' '+c.s);$(id).append(el);}); }
const STARTERS=[{id:'seed-jax',initials:'JAX',gold:12,depth:8,seed:true},{id:'seed-ada',initials:'ADA',gold:7,depth:5,seed:true},{id:'seed-mog',initials:'MOG',gold:3,depth:2,seed:true}];
function readScores() {
  try {const rows=JSON.parse(localStorage.getItem(SCORES)||'[]');return [...(Array.isArray(rows)?rows:[]).filter(r=>r&&!r.seed&&!r.admin&&typeof r.id==='string'&&/^[A-Z0-9]{1,3}$/.test(r.initials)&&Number.isSafeInteger(r.gold)&&r.gold>=0&&Number.isSafeInteger(r.depth)&&r.depth>=0),...STARTERS].sort((a,b)=>b.gold-a.gold||b.depth-a.depth).slice(0,10);}
  catch {storageOK=false;return STARTERS;}
}
function renderScores() {
  const rows=readScores();
  for(const id of ['endingScoreList','menuScoreList']){$(id).replaceChildren();for(const row of rows){const li=document.createElement('li');li.textContent=`${row.initials} · ${row.gold}G · ROOM ${row.depth}${row.seed?' · STARTER':''}`;$(id).append(li);}}
  $('scoreStorage').textContent=storageOK?'Local top 10. STARTER entries are fictional.':'Storage unavailable. Scores may not survive closing this page.';
}
function recordScore(event) {
  event?.preventDefault();if(!['dead','won'].includes(state.stage)||state.recorded||state.admin)return;
  const initials=$('initials').value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,3);if(!initials){$('initials').focus();return;}
  try {const rows=readScores().filter(r=>!r.seed&&r.id!==state.id);rows.push({id:state.id,initials,gold:state.gold,depth:state.depth});rows.sort((a,b)=>b.gold-a.gold||b.depth-a.depth);localStorage.setItem(SCORES,JSON.stringify(rows.slice(0,10)));state.recorded=true;save();render();}
  catch {storageOK=false;$('scoreFeedback').textContent='Could not save on this device. Your score is still shown.';renderScores();}
}
function menu(name,text){$('titleScreen').hidden=true;$('playScreen').hidden=true;$('menuScreen').hidden=false;$('menuTitle').textContent=name;$('menuText').textContent=text;$('codeForm').hidden=true;$('menuScores').hidden=true;$('menuActions').replaceChildren();}
function menuButton(label,fn){const b=document.createElement('button');b.textContent=label;b.onclick=fn;$('menuActions').append(b);}
function backTitle(){clearTimeout(monsterTimer);clearTimeout(moveTimer);$('moveBanner').hidden=true;started=false;inventoryOpen=false;statusOpen=false;$('savedHint').textContent=`${state.admin?'ADMIN · ':''}${HALLS[state.hall].name.toUpperCase()} · ${state.hp}♥ · ${state.gold}G`;$('menuScreen').hidden=true;$('playScreen').hidden=true;$('titleScreen').hidden=false;applyPalette();render();}
function showStory(){menu('THE KING’S REQUEST',`“A great hero must descend into the Halls of the Obsidian Veil,” the king tells you. “The journey will be cruel. Four halls lie below my kingdom. Find your own way through their forgotten rooms. The path downward will not reveal itself easily. Only beyond the last lock will the final chamber and our buried secret be revealed.” He gives you five gold pieces. “Spend wisely. Return with the truth.”${state.hall||state.admin?' Your password begins this quest in '+hall().name+' Hall with '+state.gold+' gold.':''}`);menuButton('BEGIN THE QUEST →',()=>{state.storySeen=true;save();enterPlay();});menuButton('BACK',backTitle);}
const CODES={emerald:[0,false],ruby:[1,false],sapphire:[2,false],amethyst:[3,false],gold:[0,true],goldruby:[1,true],goldsapphire:[2,true],goldamethyst:[3,true]};
function submitCode(event){event?.preventDefault();const code=$('codeInput').value.trim().toLowerCase();const entry=CODES[code];if(!entry){$('codeFeedback').textContent='Unknown password. Try again.';return;}if(state.depth>0&&!['dead','won'].includes(state.stage)&&!confirm('Replace your saved quest with this password start?'))return;state=fresh(...entry);save();$('codeInput').value='';applyPalette();showStory();}
$('codeForm').onsubmit=submitCode;
$('enterCode').onclick=()=>{menu('ENTER PASSWORD','Hall passwords start a new quest at that hall. Codes ignore capital letters.');$('codeForm').hidden=false;$('codeFeedback').textContent='';menuButton('BACK',backTitle);$('codeInput').focus();};
$('viewScores').onclick=()=>{menu('HIGH SCORES','The richest survivors of the Obsidian Veil. STARTER entries are fictional. Admin runs are not ranked.');renderScores();$('menuScores').hidden=false;menuButton('BACK',backTitle);};
function buyKey(){if(state.stage!=='shop'||state.key||state.gold<hall().cost)return;state.gold-=hall().cost;state.key=true;state.note=`${hall().key} key +1. Spent ${hall().cost} gold. Its teeth are cold against your palm.`;fx('treasure');render();}
function buyIdentify(){if(state.stage!=='shop'||state.gold<5)return;if(!confirm('Buy 1 Identify potion for 5 gold?'))return;state.gold-=5;state.identify++;state.note='Identify potion +1. Spent 5 gold.';fx('treasure');render();}
function leaveRoom(){if(!['shop','stairs'].includes(state.stage))return;state.stage='explore';state.note='You return to the passages.';render();}
function descend(){if(state.stage!=='stairs')return;if(!state.key){state.note=`Requires ${hall().key} Key. The lock will not turn.`;render();return;}state.key=false;state.enemy=null;state.outcome=null;state.player=[];state.foe=[];state.pot=0;if(state.hall===3){state.final=true;state.stage='final';state.room='final';state.note='The amethyst lock melts into light. Beneath a glistening crystal sky, the Crownless King guards the final secret. A battle costs 8 gold per hand.';}else{state.hall++;state.hallKills=0;state.sinceShop=0;state.stage='checkpoint';state.room='stairs';state.note=`You descend into ${hall().name} Hall. PASSWORD: ${hall().name.toUpperCase()}. Remember it to start a future quest here. Your health, gold and inventory carry onward.`;}fx('heal');render();}
function enterHall(){if(state.stage!=='checkpoint')return;state.stage='explore';state.note=`${hall().name} Hall. Unfamiliar shadows gather ahead. Explore carefully.`;render();}
function battleBoss(){if(state.stage!=='final')return;state.enemy={index:0,boss:true,level:5,hearts:6,left:6,damage:4,ante:8};state.player=[];state.foe=[];state.stage='explore';deal();}
function applyPalette(){const colors=state.final?['#201733','#65527e','#bbc1ed','#fff9e4']:hall().colors;['--dark','--mid','--light','--pale'].forEach((name,i)=>document.documentElement.style.setProperty(name,colors[i]));document.body.classList.toggle('amethyst',state.hall===3);document.body.classList.toggle('final-room',state.final);$('themeMeta').setAttribute('content',colors[3]);}
$('scoreForm').onsubmit=recordScore;
$('initials').oninput=()=>{$('initials').value=$('initials').value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,3);};
function render() {
  const changes=[];
  if(started&&lastAttributes?.run===state){if(state.gold!==lastAttributes.gold)changes.push({kind:'gold',amount:state.gold-lastAttributes.gold});if(state.hp!==lastAttributes.hp)changes.push({kind:'health',amount:state.hp-lastAttributes.hp});}
  lastAttributes={run:state,gold:state.gold,hp:state.hp};
  applyPalette();
  if(!started){sound?.play('title');renderScores();return;}
  sound?.play(['play','monster','result'].includes(state.stage)?'battle':['dead','won'].includes(state.stage)?'silence':'explore');
  const combat=!!state.enemy&&state.player.length>0&&['play','monster','result','dead'].includes(state.stage),m=state.enemy?monster():null;
  document.body.classList.toggle('battle',combat);document.body.classList.toggle('in-shop',state.stage==='shop');document.body.classList.toggle('has-key',state.key);
  $('health').textContent=`♥ ${state.hp}/${state.max}`;$('gold').textContent=`${state.gold}G`;
  $('depth').textContent=`ROOM ${String(state.depth).padStart(2,'0')}`;$('level').textContent=`${hall().name.toUpperCase()}${state.admin?' · ADMIN':''}`;
  $('inventory').textContent=state.key?hall().key.toUpperCase()+' KEY':'';$('inventory').hidden=!state.key;
  $('title').textContent=state.stage==='dead'?'GAME OVER':state.stage==='won'?'DAWN RESTORED':m?m.name:state.room==='stairs'?doorName().toUpperCase():rooms[state.room]?.name||'THE QUIET HALL';
  $('subtitle').textContent=m?`${'♥'.repeat(state.enemy.left)} · `+(identified()?`LV ${state.enemy.level} · ${behavior(state.enemy)}`:'Not identified'):rooms[state.room]?.hint||'The Obsidian Veil. Every gold piece counts.';
  $('stakes').textContent=state.enemy?`ANTE ${state.enemy.ante}G / HAND · `+(['play','monster'].includes(state.stage)?`POT ${state.pot*2}G`:'WIN RETURNS '+state.enemy.ante*2+'G'):'';
  const outcome=state.outcome&&state.stage!=='play'?state.outcome:null;
  $('resultScreen').hidden=!outcome;$('scene').hidden=!!outcome;$('message').hidden=!!outcome||state.stage==='monster';$('stakes').hidden=!!outcome;
  if(outcome){$('resultTitle').textContent=outcome.kind==='win'?'WIN!':outcome.kind==='tie'?'DRAW':'LOSE';$('resultTotals').textContent=`YOU ${outcome.player>21?'BUST ('+outcome.player+')':outcome.player} / FOE ${outcome.foe>21?'BUST ('+outcome.foe+')':outcome.foe}`;highlightChanges($('resultMessage'),state.note);$('resultHint').textContent=state.stage==='dead'?'GAME OVER':state.stage==='won'?'THE SECRET REVEALED':outcome.kind==='tie'?'STAKE RETURNED':outcome.kind==='win'?(outcome.defeated?'MONSTER DEFEATED':'ONE MONSTER HEART REMOVED'):'TRY ANOTHER HAND OR FLEE FOR 2 GOLD';}
  $('table').hidden=!combat||!!outcome;
  if(combat){$('enemyLabel').textContent=m.name;$('enemyScore').textContent=state.stage==='play'?'?':score(state.foe);$('playerScore').textContent=score(state.player);cards('enemyCards',state.foe,state.stage==='play');cards('playerCards',state.player,false);}
  highlightChanges($('message'),state.note);$('monsterTurn').hidden=state.stage!=='monster';$('monsterLog').replaceChildren();if(state.stage==='monster')for(const line of state.turnLog){const li=document.createElement('li');li.textContent=line;$('monsterLog').append(li);}
  $('actions').replaceChildren();
  if(state.stage==='explore'&&!outcome){button('EXPLORE →',explore,'e');button('STATUS',toggleStatus);}
  if(state.stage==='explore'&&outcome){button('CONTINUE →',dismissOutcome,'e');}

  if(state.stage==='shop'){if(!state.key){button(`${hall().key.toUpperCase()} KEY · ${hall().cost}G`,buyKey);const keyButton=$('actions').children[$('actions').children.length-1];keyButton.disabled=state.gold<hall().cost;if(state.hall===0)keyButton.className='red-key';}button('IDENTIFY · 5G',buyIdentify);$('actions').children[$('actions').children.length-1].disabled=state.gold<5;button('HEAL POTION · 5G',buyHealing);$('actions').children[$('actions').children.length-1].disabled=state.gold<5;button('LEAVE →',leaveRoom,'e');}
  if(state.stage==='stairs'){button(state.hall===3?'OPEN AMETHYST DOOR →':`DESCEND TO ${HALLS[state.hall+1].name.toUpperCase()} HALL →`,descend);button('LEAVE →',leaveRoom,'e');}
  if(state.stage==='checkpoint')button('ENTER HALL →',enterHall,'e');
  if(state.stage==='final')button('FACE THE KING · 8G',battleBoss,'e');
  if(state.stage==='room'){button('TOUCH ALTAR',()=>altar(true));button('LEAVE →',()=>altar(false),'e');}
  if(state.stage==='monster'){if(!monsterDone())button('NEXT MOVE →',advanceMonster,'e');else{button('RESOLVING…',()=>{});$('actions').children[0].disabled=true;}}
  if(state.stage==='play'){button('HIT +',hit,'h');button('STAND ■',stand,'s');}
  if(state.stage==='result'){button(`${outcome?.kind==='loss'?'TRY AGAIN':'NEXT HAND'} · ${state.enemy.ante}G`,deal,'e');const retry=$('actions').children[$('actions').children.length-1];retry.disabled=state.gold<state.enemy.ante;if(retry.disabled)retry.textContent=`TRY AGAIN · NEED ${state.enemy.ante}G`;if(outcome?.kind==='loss'){button('RUN · 2G',flee,'r');const run=$('actions').children[$('actions').children.length-1];run.disabled=state.gold<2;if(run.disabled)run.textContent='RUN · NEED 2G';}}

  if(['dead','won'].includes(state.stage)){button('NEW QUEST',restart,'e');button('TITLE',backTitle);}
  const ended=['dead','won'].includes(state.stage);$('scoreEntry').hidden=!ended;$('scoreForm').hidden=state.recorded||state.admin;$('endingScores').hidden=!ended;
  $('finalScore').textContent=`${state.gold}G`;
  $('scoreFeedback').textContent=state.admin?'ADMIN TEST RUN — not ranked.':state.recorded?'Score saved on this device.':ended?'Enter up to 3 initials to record your score.':'';
  $('art').setAttribute('aria-label',m?m.name+' encounter':state.room==='stairs'?doorName()+' in the '+hall().name+' Hall':rooms[state.room]?.name||'A long dungeon hall with stone columns');
  draw(m?m.sprite:-1,state.room);save();renderScores();renderStatus();renderInventory();scheduleMonster();if(changes.length)flashAttributes(changes);
}
function restart(){clearTimeout(monsterTimer);clearTimeout(moveTimer);$('moveBanner').hidden=true;inventoryOpen=false;statusOpen=false;state=fresh();$('initials').value='';save();started=false;backTitle();showStory();}
$('restart').onclick=()=>{if(['dead','won'].includes(state.stage)||state.depth===0||confirm('Start a new run? Your current run will be replaced.'))restart();};
$('sound').onclick=async()=>{await setSound(muted);if(!started)titleReady();};
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearTimeout(monsterTimer);$('moveBanner').hidden=true;}else scheduleMonster();});
document.addEventListener('keydown',e=>{
  if(statusOpen&&e.key==='Escape'){e.preventDefault();toggleStatus();return;}
  if(statusOpen)return;
  if(inventoryOpen&&e.key==='Escape'){e.preventDefault();toggleInventory();return;}
  if(inventoryOpen&&e.key==='Tab'){const controls=[$('useHealing'),$('useIdentify'),$('closeInventory')].filter(b=>!b.disabled);const i=controls.indexOf(document.activeElement);e.preventDefault();controls[(i+(e.shiftKey?-1:1)+controls.length)%controls.length].focus();return;}
  if(e.key.toLowerCase()==='i'&&!e.repeat&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();toggleInventory();return;}
  if(inventoryOpen)return;
  if(e.repeat||e.ctrlKey||e.metaKey||e.altKey||['BUTTON','SUMMARY','INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName))return;
  const b=document.querySelector(`[data-key="${e.key.toLowerCase()}"]`);if(b){e.preventDefault();b.click();}
});
function draw(index,room){const c=paletteContext($('art').getContext('2d'));c.fillStyle='#9bbc0f';c.fillRect(0,0,160,72);c.fillStyle='#8bac0f';for(let y=0;y<65;y+=12)for(let x=(y%24?0:8);x<160;x+=22){c.fillRect(x,y,20,1);c.fillRect(x,y,1,11);}c.fillStyle='#306230';c.fillRect(0,65,160,2);if(index<0){drawRoom(c,room||'quiet');return;}drawCreature(c,monster().name);}


render();

function paletteContext(context){const old=['#0f380f','#306230','#8bac0f','#9bbc0f'],colors=state.final?['#201733','#65527e','#bbc1ed','#fff9e4']:hall().colors;return new Proxy(context,{get(t,k){const v=t[k];return typeof v==='function'?v.bind(t):v;},set(t,k,v){t[k]=k==='fillStyle'&&old.includes(v)?colors[old.indexOf(v)]:v;return true;}});}
function drawRoom(c,room) {
  const ink='#0f380f',shade='#306230',moss='#8bac0f',glow='#9bbc0f';
  const r=(x,y,w,h,color=ink)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
  // A full room fills the viewport; objects sit in the space, never in a frame.
  r(0,0,160,72,shade);r(0,45,160,27,moss);
  for(let y=2;y<44;y+=11)for(let x=(y%2?0:9);x<160;x+=23){r(x,y,21,1,ink);r(x,y,1,10,ink);}
  for(let y=51;y<72;y+=8)r(0,y,160,1,shade);
  const column=x=>{r(x,0,13,48,ink);r(x+3,3,6,41,moss);r(x-3,0,19,4,ink);r(x-4,44,21,5,ink);};
  const candle=(x,y)=>{r(x,y,3,11,moss);r(x-2,y+10,7,2);r(x,y-5,3,4,glow);r(x+1,y-8,1,3,glow);};
  if(room==='stairs') {
    // Gem-coloured doors interrupt the current hall's stone palette.
    const gem=state.hall===0?['#390f20','#a5263e','#ed6370','#ffd4a4']:state.hall===1?['#0a204b','#285eab','#72c9ee','#defaff']:['#241537','#60449a','#b09be7','#f5edff'];
    column(14);column(133);r(44,5,72,57,ink);r(48,8,64,52,gem[0]);r(52,11,56,47,gem[1]);
    r(52,11,56,3,gem[2]);r(52,14,3,44,gem[2]);r(78,14,3,44,gem[0]);
    for(const x of [58,85]){r(x,19,17,15,gem[0]);r(x+2,21,13,11,gem[1]);r(x,40,17,11,gem[0]);r(x+2,42,13,7,gem[1]);}
    r(71,34,4,4,gem[3]);r(84,34,4,4,gem[3]);r(76,38,8,8,gem[0]);r(78,40,4,3,gem[3]);r(79,43,2,3,gem[3]);
    r(38,59,84,4,shade);r(30,63,100,4,ink);r(25,67,110,3,moss);return;
  }
  if(room==='shop') {for(let i=0;i<8;i++)r(15+i*16,7,16,13,i%2?ink:moss);r(20,48,120,18);r(24,47,112,4,moss);r(72,25,16,17,moss);r(74,30,4,3);r(82,30,4,3);r(65,42,30,7,shade);r(30,31,4,14,glow);r(30,31,14,4,glow);r(41,35,3,5,glow);r(114,33,9,12,moss);r(116,29,5,4,moss);return;}
  if(room==='final') {r(0,0,160,72,ink);for(let i=0;i<8;i++){const x=5+i*20;for(let y=0;y<35;y++)r(x-Math.floor(y/8),20+y,3+Math.floor(y/4),1,i%2?moss:shade);}r(45,42,70,5,moss);r(50,47,60,18,shade);r(66,32,28,18,glow);r(68,25,5,12,glow);r(78,20,5,16,glow);r(88,25,5,12,glow);for(const [x,y] of [[16,9],[40,22],[119,12],[145,29],[108,58]]){r(x,y,1,7,glow);r(x-3,y+3,7,1,glow);}return;}
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

function drawCreature(c,name){
  const shapes={
    goblin:['01000010','11111111','01111110','01011010','01111110','00111100','01111110','10111101','00100100','01100110'],
    bat:['100000000001','110000000011','111001100111','111111111111','011101101110','001111111100','000111111000','000010010000'],
    imp:['01000010','01111110','00111100','00100100','01111110','10111101','00111100','01011010','01000010'],
    hound:['100000000100','110000001100','111111111111','101111110111','111111111111','001111111100','001001001000','011001001100'],
    skeleton:['00111100','01111110','01011010','01111110','00100100','01111110','10100101','00111100','00100100','01100110'],
    orc:['0011111100','0111111110','1101110111','1111111111','0110000110','0011111100','0111111110','1111111111','1011111101','0010010000','0110011000'],
    witch:['000010000','000111000','001111100','111111111','001111100','001010100','001111100','000111000','001111100','011111110','111111111'],
    spider:['100000000001','010001100010','001111111100','111101101111','001111111100','011111111110','101000000101','100000000001'],
    knight:['00111100','01111110','01100110','01111110','00111100','11111111','10111101','10111101','00111100','00100100','01100110'],
    troll:['000111111000','001111111100','011011110110','111111111111','111001100111','011111111110','011111111110','111111111111','110111111011','000110011000','001110011100'],
    wraith:['0001111000','0011111100','0010110100','0111111110','1111111111','1111111111','1111111111','1111111111','1011011010','0001001000'],
    serpent:['000001111000','000011011100','000111111110','000111000000','000011110000','000000111100','001111001110','011000000110','001111111100'],
    moth:['1100000011','1111001111','1111111111','1101111011','0111111110','0011111100','0111111110','1100110011','1000110001'],
    revenant:['00111100','01111110','01011010','01111110','00111100','11111111','01111110','10111101','00111100','01011010','11000011'],
    vampire:['0001111000','0011111100','0010110100','0011111100','1001001001','1101111011','1111111111','1111111111','1111111111','1101111011'],
    seer:['00011000','00111100','01111110','11011011','01111110','00111100','01111110','11111111','11111111','11011011'],
    wyrm:['100000000001','110001100011','111011110111','111111111111','011101101110','001111111100','011110011110','111111111111','110111111011','000101101000','001100001100'],
    dragon:['110000000011','111001100111','111111111111','011101101110','001111111100','011111111110','111111111111','110111111011','100111111001','000110011000','001110011100'],
    king:['010101010','011111110','001111100','001010100','001111100','000111000','111111111','011111110','011111110','011111110','111111111']
  };
  const type=name==='THE CROWNLESS KING'?'king':name.includes('GOBLIN')?'goblin':name.includes('BAT')?'bat':name.includes('IMP')?'imp':name.includes('HOUND')?'hound':name.includes('SKELETON')?'skeleton':name.includes('ORC')?'orc':name.includes('WITCH')?'witch':name.includes('SPIDER')?'spider':name.includes('KNIGHT')?'knight':name.includes('TROLL')?'troll':name.includes('WRAITH')?'wraith':name.includes('SERPENT')?'serpent':name.includes('MOTH')?'moth':name.includes('REVENANT')?'revenant':name.includes('VAMPIRE')?'vampire':name.includes('SEER')?'seer':name.includes('WYRM')?'wyrm':'dragon';
  const shape=shapes[type],size=4,x=(160-shape[0].length*size)/2,y=65-shape.length*size;c.fillStyle='#0f380f';shape.forEach((row,j)=>[...row].forEach((bit,i)=>{if(bit==='1')c.fillRect(x+i*size,y+j*size,size,size);}));
}
