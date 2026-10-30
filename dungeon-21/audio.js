/* Original procedural pocket-synth soundtrack and local vocoded move samples. */
'use strict';
window.DungeonAudio = (() => {
  let ctx, master, music, effects, noise, timer, next = 0, step = 0;
  let enabled = false, theme = 'title', active = '', fanfareUntil = 0;
  const voices={};let voiceSource,voiceLoad;
  function loadVoices(){
    if(voiceLoad||typeof fetch!=='function')return;
    voiceLoad=Promise.all(['hit','stand'].map(async word=>{try{const response=await fetch('audio/'+word+'.mp3?v=0.13.0');if(!response.ok)return;voices[word]=await ctx.decodeAudioData(await response.arrayBuffer());}catch{}}));
  }
  // Rate, tone cutoff, bass boost, echo delay, level. The player's sample stays untouched.
  const voiceProfiles={
    'MOSS GOBLIN':[1.19,2300,2,0,1.05],
    'CAVE BAT':[1.62,5200,-6,.065,.95],
    'THORN IMP':[1.43,3900,-3,0,1],
    'CINDER HOUND':[.83,1800,7,.045,1.12],
    'BLOOD SKELETON':[1.11,2900,-5,.09,1.05],
    'ASH ORC':[.74,1500,9,0,1.2],
    'EMBER WITCH':[1.27,3500,-1,.12,1.02],
    'FROST SPIDER':[1.53,4600,-7,.035,.98],
    'DROWNED KNIGHT':[.79,1100,6,.16,1.1],
    'GLACIER TROLL':[.64,1200,11,.085,1.25],
    'RIME WRAITH':[1.34,3200,-4,.19,1],
    'ABYSS SERPENT':[.88,2100,3,.14,1.1],
    'VOID MOTH':[1.48,4200,-8,.18,.95],
    'CRYSTAL REVENANT':[1.06,4400,-2,.11,1.08],
    'DUSK VAMPIRE':[.93,2700,4,.075,1.08],
    'STARLESS SEER':[1.02,2400,0,.21,1.05],
    'PRISM WYRM':[.69,1900,8,.13,1.28],
    'AMETHYST DRAGON':[.56,1600,12,.17,1.5],
    'THE CROWNLESS KING':[.61,2200,10,.2,1.35]
  };
  function speak(word,character,at){
    const buffer=voices[word];if(!buffer)return;
    if(voiceSource){try{voiceSource.stop();}catch{}}
    const source=ctx.createBufferSource(),profile=voiceProfiles[character];source.buffer=buffer;
    const nodes=[];
    if(profile){
      const [rate,cutoff,bass,echo,level]=profile;source.playbackRate.value=rate;
      const tone=ctx.createBiquadFilter(),body=ctx.createBiquadFilter(),gain=ctx.createGain(),limiter=ctx.createDynamicsCompressor();
      tone.type='lowpass';tone.frequency.value=cutoff;tone.Q.value=.6;
      body.type='lowshelf';body.frequency.value=280;body.gain.value=bass;gain.gain.value=level;
      limiter.threshold.value=-10;limiter.knee.value=12;limiter.ratio.value=5;limiter.attack.value=.003;limiter.release.value=.18;
      source.connect(tone).connect(body).connect(gain).connect(limiter).connect(effects);nodes.push(tone,body,gain,limiter);
      if(echo){const delay=ctx.createDelay(.3),wet=ctx.createGain();delay.delayTime.value=echo;wet.gain.value=.24;gain.connect(delay).connect(wet).connect(limiter);nodes.push(delay,wet);}
    }else source.connect(effects);
    source.onended=()=>{source.disconnect();if(voiceSource===source)voiceSource=null;setTimeout(()=>nodes.forEach(node=>node.disconnect()),350);};
    voiceSource=source;source.start(at);
  }
  const tracks = {
    title: { bpm: 104, lead: [64,0,67,71,74,0,71,67,66,0,69,72,71,0,66,0,64,0,67,71,76,0,74,71,69,67,66,62,64,0,0,0], bass: [40,40,36,36,38,38,35,35], harmony: [59,0,0,0,55,0,0,0,57,0,0,0,54,0,0,0], drums: false },
    explore: { bpm: 72, lead: [64,0,0,0,67,0,0,66,0,0,59,0,0,0,0,0,64,0,0,0,65,0,0,0,59,0,62,0,0,0,0,0], bass: [40,40,36,36,41,41,35,35], harmony: [59,0,0,0,60,0,0,0,59,0,0,0,58,0,0,0], drums: false },
    battle: { bpm: 148, lead: [64,67,71,67,64,67,74,71,62,66,69,66,62,66,72,69,60,64,67,64,60,64,71,67,59,63,66,69,71,69,66,63], bass: [40,40,38,38,36,36,35,35], harmony: [52,0,59,0,50,0,57,0,48,0,55,0,47,0,54,0], drums: true }
  };
  const frequency = midi => 440 * 2 ** ((midi - 69) / 12);
  function note(midi, at, duration, type = 'square', volume = .08, bus = music, slide) {
    if (!midi || !ctx) return;
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = type; osc.frequency.setValueAtTime(frequency(midi), at);
    if (slide) osc.frequency.exponentialRampToValueAtTime(frequency(slide), at + duration * .85);
    gain.gain.setValueAtTime(0, at); gain.gain.linearRampToValueAtTime(volume, at + .006);
    gain.gain.exponentialRampToValueAtTime(.0001, at + duration);
    osc.connect(gain).connect(bus); osc.start(at); osc.stop(at + duration + .02);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  }
  function hiss(at, duration, volume, high = 900) {
    const source = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain();
    source.buffer = noise; filter.type = 'highpass'; filter.frequency.value = high;
    gain.gain.setValueAtTime(volume, at); gain.gain.exponentialRampToValueAtTime(.0001, at + duration);
    source.connect(filter).connect(gain).connect(effects); source.start(at); source.stop(at + duration);
    source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
  }
  function tick() {
    if (!ctx || !enabled || ctx.state !== 'running' || document.hidden) return;
    if (ctx.currentTime < fanfareUntil) { next = fanfareUntil; return; }
    const track = tracks[theme]; if (!track) return;
    if (active !== theme) { active = theme; step = 0; next = ctx.currentTime + .04; }
    const beat = 60 / track.bpm / 2;
    if (next < ctx.currentTime) next = ctx.currentTime + .025;
    while (next < ctx.currentTime + .12) {
      note(track.lead[step % track.lead.length], next, beat * .8, 'square', .065);
      if (step % 2 === 0) note(track.harmony[(step / 2) % track.harmony.length], next, beat * 1.5, 'square', .025);
      if (step % 4 === 0) note(track.bass[(step / 4) % track.bass.length], next, beat * 3.4, 'triangle', .19);
      if (track.drums && step % 2 === 0) hiss(next, .035, .018, step % 4 === 0 ? 700 : 3500);
      next += beat; step++;
    }
  }
  function resetClock() {
    active = ''; next = ctx.currentTime + .03; fanfareUntil = 0;
    music.gain.cancelScheduledValues(ctx.currentTime);
    music.gain.setValueAtTime(.65, ctx.currentTime);
    tick();
  }
  function recover() {
    if (!enabled || !ctx || document.hidden || ctx.state === 'running') return;
    // Invoke resume directly inside the gesture, before any asynchronous work.
    Promise.resolve(ctx.resume()).then(() => {
      if (enabled && ctx.state === 'running') resetClock();
    }).catch(() => {});
  }
  async function enable(value) {
    enabled = value;
    if (!value) {
      if (ctx) { master.gain.setValueAtTime(0, ctx.currentTime); await ctx.suspend(); }
      return false;
    }
    try {
      // Playback sessions avoid Safari treating the soundtrack as ambient audio.
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch {}
      if (!ctx || ctx.state === 'closed') {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) throw new Error('Web Audio unavailable');
        ctx = new Audio(); master = ctx.createGain(); master.gain.value = .55;
        music = ctx.createGain(); music.gain.value = .65;
        effects = ctx.createGain(); effects.gain.value = .8;
        music.connect(master); effects.connect(master); master.connect(ctx.destination);
        noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
        const data = noise.getChannelData(0); for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        if (timer) clearInterval(timer);
        timer = setInterval(tick, 30);loadVoices();
        ctx.onstatechange = () => {
          if (enabled && ctx.state === 'running' && !document.hidden) resetClock();
        };
      }
      master.gain.setValueAtTime(.55, ctx.currentTime);
      const resumed = ctx.resume();
      // Some mobile browsers leave resume pending until another gesture.
      // Keep Power On responsive so the user can retry instead of getting stuck.
      let timeout;
      try { await Promise.race([resumed, new Promise(resolve => { timeout = setTimeout(resolve, 1200); })]); }
      finally { clearTimeout(timeout); }
      if (ctx.state !== 'running') { enabled = false; return false; }
      resetClock(); return true;
    } catch { enabled = false; return false; }
  }
  function play(name) { if (theme !== name) { theme = name; active = ''; } tick(); }
  function effect(name,character='YOU') {
    if (!enabled || !ctx || ctx.state !== 'running' || document.hidden) return;
    const at = ctx.currentTime + .01;
    if(name==='voice-hit'||name==='voice-stand'){speak(name.slice(6),character,at);return;}
    if (name === 'hit') { hiss(at, .09, .19, 600); note(76, at, .12, 'square', .15, effects, 43); }
    else if (name === 'hurt') { note(47, at, .22, 'sawtooth', .12, effects, 28); hiss(at, .15, .1, 200); }
    else if (name === 'card') note(82, at, .045, 'square', .06, effects, 75);
    else if (name === 'heal') [67,71,76].forEach((n,i)=>note(n,at+i*.09,.18,'triangle',.2,effects));
    else if (name === 'treasure') [76,83].forEach((n,i)=>note(n,at+i*.08,.15,'square',.08,effects));
    else if (name === 'tie') note(59, at, .09, 'triangle', .12, effects);
    else if (name === 'victory' || name === 'clear' || name === 'defeat') {
      const won = name !== 'defeat';
      const melody = name === 'clear' ? [64,67,71,76,74,76,79,83] : won ? [64,67,71,76,71,76] : [64,62,59,55,52];
      const pace = won ? .14 : .23;
      fanfareUntil = at + melody.length * pace + .55;
      music.gain.cancelScheduledValues(at); music.gain.setValueAtTime(.05, at);
      music.gain.setValueAtTime(.65, fanfareUntil); active = ''; next = fanfareUntil;
      melody.forEach((n,i)=>note(n,at+i*pace,i===melody.length-1?.55:.12,'square',.11,effects));
      [won?40:28,won?47:35,won?52:40].forEach(n=>note(n,at,.6,'triangle',.1,effects));
    }
  }
  document.addEventListener('visibilitychange', () => {
    if (!ctx || !enabled) return;
    if (document.hidden) ctx.suspend().catch(()=>{});
    else recover();
  });
  // Reacquire audio focus after lock-screen, phone-call and tab interruptions.
  document.addEventListener('pointerdown', recover, { passive: true });
  document.addEventListener('keydown', recover);
  window.addEventListener('pageshow', recover);
  window.addEventListener('focus', recover);
  return { enable, play, effect };
})();
