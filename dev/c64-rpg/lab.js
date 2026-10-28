"use strict";
const catalog = {
 velora: { file: "VELORA-FULL-PROTOTYPE-v2.prg", name: "The Vaults of Velora", notes: "Three heroes, beach exploration and Cave Goblin combat. Archived full prototype v2; unfinished adventure.", controls: "Space to begin; 1–3 to choose a hero and combat move; W/A/S/D to walk; Q to quit." },
 map: { file: "VELORA-MAP-TEST.prg", name: "Velora map test", notes: "Tile rendering and collision experiment. No complete adventure or combat.", controls: "W/A/S/D to walk; Q to quit." },
 asterra: { file: "asterra-test-slice.prg", name: "Asterra test slice", notes: "Map, wandering NPC and combat. Program extracted unchanged from the ASTERRA file on the uploaded disk image; the two supplied disks are identical.", controls: "W/A/S/D to walk; 1–3 then Return in combat; Q to quit." },
 gork: { file: "GORK1_v2.prg", name: "GORK 1", notes: "A generated maze, gold, monsters and a golden key. Maze generation can take a moment on an emulated C64.", controls: "W/A/S/D to explore; F to fight, P to parry, R to run; Q to quit." },
 visibility: { file: "asterra_visibility_test_v3.prg", name: "Asterra visibility test v3", notes: "Technical test that prints a wall render list. This is not a graphical dungeon.", controls: "W/S forward/back; A/D turn; Q to quit." }
};
const $ = id => document.getElementById(id);
const origin = "https://vc64web.github.io";
let ready = false, poll, timeout, generation = 0, pending;
function selected() { return catalog[$("build").value]; }
function describe() { const b=selected(); $("name").textContent=b.name; $("notes").textContent=b.notes; $("controls").textContent=b.controls; $("download").href="builds/"+b.file; }
function send(message) { $("emulator").contentWindow.postMessage(message, origin); }
function script(value) { if(ready) send({cmd:"script",script:value}); }
async function bytes(path) { const response=await fetch(path); if(!response.ok) throw new Error("Could not load "+path+" ("+response.status+")"); return new Uint8Array(await response.arrayBuffer()); }
$("build").addEventListener("change",describe);
$("start").addEventListener("click",async()=>{
 const current=++generation; ready=false; pending=null; clearInterval(poll);clearTimeout(timeout);
 $("status").textContent="Loading "+selected().name+"…"; $("start").disabled=true;
 try {
  const [file,basic,kernal,charset]=await Promise.all([bytes("builds/"+selected().file),bytes("roms/basic-901226-01.bin"),bytes("roms/kernal-901227-03.bin"),bytes("roms/chargen-901225-01.bin")]);
  if(current!==generation)return;
  pending={cmd:"load",file_name:selected().file,file,basic_rom:basic,kernal_rom:kernal,charset_rom:charset};
  $("player").hidden=false;
  const config={openROMS:false,dialog_on_missing_roms:false,navbar:false,wide:true,border:0.3,port1:false,port2:false};
  $("emulator").src=origin+"/#"+encodeURIComponent(JSON.stringify(config));
  poll=setInterval(()=>send("poll_state"),500);
  timeout=setTimeout(()=>{clearInterval(poll);pending=null;$("start").disabled=false;$("status").textContent="The emulator did not respond. Try Start again, or download the build for your C64 emulator.";},45000);
 }catch(e){$("status").textContent=e.message;$("start").disabled=false;}
});
window.addEventListener("message",event=>{
 if(event.origin!==origin||event.source!==$("emulator").contentWindow||event.data?.msg!=="render_run_state"||!pending)return;
 const payload=pending;pending=null;clearInterval(poll);clearTimeout(timeout);ready=true;
 send(payload);$("start").disabled=false;$("status").textContent="Build sent to the C64. The first screen may take a few seconds. Tap Space to begin.";
});
$("sound").addEventListener("click",()=>{if(ready)send("toggle_audio()");});
$("keyboard").addEventListener("click",()=>script("action('keyboard');"));
$("fullscreen").addEventListener("click",async()=>{try{await $("player").requestFullscreen();}catch{$("status").textContent="Full screen is unavailable in this browser; rotate your device for more room.";}});
document.querySelectorAll("[data-key]").forEach(button=>button.addEventListener("click",()=>script("action("+JSON.stringify(button.dataset.key)+");")));
describe();
