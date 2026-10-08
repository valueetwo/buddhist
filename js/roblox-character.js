/*
 * Dhamma Journey V7.9 — Blocky 3D-style AI Companion
 * Roblox-inspired (not Roblox engine): a DOM/CSS 3D puppet with independent
 * head, torso, arms, hands, legs, feet, face and animation state machine.
 * No voice. Built to replace the fragile SVG/PNG animation layers.
 */
(() => {
  'use strict';
  const zone = document.querySelector('.lobby-character-zone');
  if (!zone) return;

  const oldIds = ['livingCharacter','lobbyMonk','lobbyCustomCharacter','livingAiCharacter'];
  oldIds.forEach(id => document.getElementById(id)?.classList.add('rbc-legacy-hidden'));

  const host = document.createElement('div');
  host.id = 'robloxLivingCharacter';
  host.className = 'rbc-character';
  host.setAttribute('role','button');
  host.setAttribute('tabindex','0');
  host.setAttribute('aria-label','Karakter AI 3D hidup. Klik untuk menyapa.');
  host.innerHTML = `
    <div class="rbc-stage">
      <div class="rbc-shadow"></div>
      <div class="rbc-avatar">
        <div class="rbc-leg rbc-leg-left"><div class="rbc-limb rbc-pants"></div><div class="rbc-foot"></div></div>
        <div class="rbc-leg rbc-leg-right"><div class="rbc-limb rbc-pants"></div><div class="rbc-foot"></div></div>
        <div class="rbc-torso">
          <div class="rbc-shirt-front"></div>
          <div class="rbc-shirt-collar"></div>
        </div>
        <div class="rbc-arm rbc-arm-left"><div class="rbc-limb rbc-sleeve"></div><div class="rbc-hand"></div></div>
        <div class="rbc-arm rbc-arm-right"><div class="rbc-limb rbc-sleeve"></div><div class="rbc-hand"></div></div>
        <div class="rbc-neck"></div>
        <div class="rbc-head">
          <div class="rbc-face">
            <span class="rbc-eye rbc-eye-left"><i></i></span>
            <span class="rbc-eye rbc-eye-right"><i></i></span>
            <span class="rbc-mouth"></span>
            <span class="rbc-cheek rbc-cheek-left"></span><span class="rbc-cheek rbc-cheek-right"></span>
          </div>
          <div class="rbc-hair-cap"></div>
          <div class="rbc-hair-fringe"></div>
        </div>
      </div>
      <div class="rbc-badge"><span class="rbc-dot"></span><span id="rbcStatus">AI menemanimu</span></div>
    </div>
    <div class="rbc-nameplate">Karakter 3D</div>
  `;
  zone.insertBefore(host, zone.firstChild);

  const avatar = host.querySelector('.rbc-avatar');
  const head = host.querySelector('.rbc-head');
  const torso = host.querySelector('.rbc-torso');
  const armL = host.querySelector('.rbc-arm-left');
  const armR = host.querySelector('.rbc-arm-right');
  const legL = host.querySelector('.rbc-leg-left');
  const legR = host.querySelector('.rbc-leg-right');
  const eyeL = host.querySelector('.rbc-eye-left i');
  const eyeR = host.querySelector('.rbc-eye-right i');
  const mouth = host.querySelector('.rbc-mouth');
  const status = host.querySelector('#rbcStatus');

  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const state={mode:'idle', modeUntil:0, tx:0,ty:0,x:0,y:0,blinkUntil:0,nextBlink:performance.now()+2200, talkUntil:0, walkPhase:0};
  let raf=0;
  let idleTimer=0;

  const setStatus = t => { if(status) status.textContent=t; };
  const setMode=(mode,duration=0)=>{
    state.mode=mode;
    state.modeUntil=duration ? performance.now()+duration : 0;
    host.dataset.mode=mode;
  };

  const point=(cx,cy)=>{
    const r=host.getBoundingClientRect();
    state.tx=clamp((cx-(r.left+r.width*.5))/(r.width*.55),-1,1);
    state.ty=clamp((cy-(r.top+r.height*.30))/(r.height*.62),-1,1);
  };
  zone.addEventListener('pointermove',e=>{
    if(e.pointerType==='touch'||host.classList.contains('rbc-hidden')) return;
    point(e.clientX,e.clientY);
  },{passive:true});
  zone.addEventListener('pointerleave',()=>{state.tx=0;state.ty=0},{passive:true});
  host.addEventListener('pointerdown',e=>{ if(e.pointerType==='touch') point(e.clientX,e.clientY); },{passive:true});
  window.addEventListener('pointerup',e=>{ if(e.pointerType==='touch'){state.tx=0;state.ty=0;} },{passive:true});

  const wave=()=>{ setMode('wave',1900); setStatus('menyapamu 👋'); };
  const calm=()=>{ setMode('calm',4200); setStatus('sedang tenang 🪷'); };
  const nod=()=>{ setMode('nod',1000); setStatus('mengangguk'); };
  const walk=()=>{ setMode('walk',3600); setStatus('berjalan kecil'); };
  const jump=()=>{ setMode('jump',1150); setStatus('melompat!'); };
  const talk=(ms=2600)=>{ state.talkUntil=performance.now()+ms; setMode('talk',ms); setStatus('sedang menjawabmu'); };

  host.addEventListener('click',wave);
  host.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();wave();}});

  // Add extra actions next to the existing buttons, without changing the app layout.
  const actions=zone.querySelector('.lobby-character-actions');
  if(actions){
    const make=(id,label,fn)=>{
      if(document.getElementById(id)) return;
      const b=document.createElement('button'); b.id=id; b.type='button'; b.textContent=label; b.addEventListener('click',fn); actions.appendChild(b);
    };
    make('rbcWalkBtn','🚶 Jalan',walk);
    make('rbcJumpBtn','⬆ Lompat',jump);
  }
  document.getElementById('monkWaveBtn')?.addEventListener('click',wave);
  document.getElementById('monkMeditateBtn')?.addEventListener('click',calm);

  // Replace the legacy character API used by app.js.
  window.monkGesture = function(kind){
    if(kind==='gesture-wave') return wave();
    if(kind==='gesture-meditate') return calm();
    if(kind==='gesture-nod') return nod();
    if(kind==='look-left'){state.tx=-.8; setStatus('melihat ke kiri'); return;}
    if(kind==='look-right'){state.tx=.8; setStatus('melihat ke kanan'); return;}
    if(kind==='look-up'){state.ty=-.8; setStatus('melihat ke atas'); return;}
    if(kind==='look-down'){state.ty=.8; setStatus('memperhatikan sekitar'); return;}
    setMode('idle',0);
  };

  window.activeLobbyCharacter = () => host;

  // Keep the new avatar as the single active character when profile/market updates run.
  window.applyLobbyCharacter = function(){
    oldIds.forEach(id=>document.getElementById(id)?.classList.add('rbc-legacy-hidden'));
    host.classList.remove('rbc-hidden');
    const gender=currentProfile?.starter_gender==='female'?'Perempuan':'Laki-laki';
    const chip=document.getElementById('livingGenderChip'); if(chip) chip.textContent=gender;
    const title=document.getElementById('lobbyCharacterTitle'); if(title) title.textContent='Karakter 3D Pendamping';
    setStatus('AI menemanimu');
  };

  window.showLobbyReaction = function(text,duration=2200){
    const bubble=document.getElementById('characterSpeechBubble');
    if(!bubble) return;
    bubble.textContent=text;
    bubble.classList.remove('hidden');
    clearTimeout(window.__rbcReactionTimer);
    window.__rbcReactionTimer=setTimeout(()=>{bubble.classList.add('hidden');bubble.textContent='';},duration);
  };

  window.stopCharacterSpeech = function(){
    state.talkUntil=0; if(state.mode==='talk')setMode('idle',0); setStatus('AI menemanimu');
    const bubble=document.getElementById('characterSpeechBubble'); bubble?.classList.add('hidden'); if(bubble)bubble.textContent='';
  };
  window.speakLobbyCharacter = function(text){
    const clean=String(text||'').replace(/\s+/g,' ').trim();
    if(!clean)return;
    talk(Math.max(1800,Math.min(6500,clean.length*32)));
    const bubble=document.getElementById('characterSpeechBubble');
    if(bubble){
      bubble.textContent=''; bubble.classList.remove('hidden');
      let i=0; clearInterval(window.__rbcSpeechTimer);
      window.__rbcSpeechTimer=setInterval(()=>{
        i=Math.min(clean.length,i+2); bubble.textContent=clean.slice(0,i)+(i<clean.length?'▌':'');
        if(i>=clean.length){clearInterval(window.__rbcSpeechTimer);setTimeout(()=>{if(performance.now()>state.talkUntil){bubble.classList.add('hidden');bubble.textContent='';setStatus('AI menemanimu');}},900);}
      },Math.max(20,Math.min(42,Math.round(3000/Math.max(clean.length,1)))));
    }
  };

  // Automatic idle behavior: small gaze changes, a step, and an occasional wave.
  const scheduleIdle=()=>{
    clearTimeout(idleTimer);
    idleTimer=setTimeout(()=>{
      if(document.hidden||host.classList.contains('rbc-hidden')) return scheduleIdle();
      const n=Math.random();
      if(n<.24) walk(); else if(n<.36) wave(); else if(n<.55) nod();
      scheduleIdle();
    },4200+Math.random()*3600);
  };
  scheduleIdle();

  function blink(now){
    if(now<state.nextBlink)return;
    state.blinkUntil=now+135; state.nextBlink=now+2300+Math.random()*4300;
  }

  const animate=now=>{
    const t=now/1000;
    if(state.modeUntil && now>state.modeUntil){state.mode='idle';state.modeUntil=0;setStatus('AI menemanimu');}
    state.x+=(state.tx-state.x)*.095; state.y+=(state.ty-state.y)*.095;
    blink(now);
    const mode=state.mode;
    let bob=Math.sin(t*1.5)*1.7;
    let bodyR=Math.sin(t*.75)*1.2;
    let headR=Math.sin(t*.82)*1.1;
    let headY=Math.sin(t*1.08)*1.6;
    let aL=0,aR=0,lL=0,lR=0,jumpY=0;
    if(mode==='wave'){
      aR=-38 + Math.sin(t*14)*34; aL=Math.sin(t*2)*3; headR+=Math.sin(t*8)*2.2; bodyR+=Math.sin(t*8)*1.1;
    } else if(mode==='calm'){
      bob=Math.sin(t*1.0)*3.0; headY=Math.sin(t*1.0)*2.4; bodyR*=.25;
    } else if(mode==='nod'){
      headY+=Math.sin(t*10)*6; headR+=Math.sin(t*10)*1.8;
    } else if(mode==='walk'){
      state.walkPhase=t*7.2; lL=Math.sin(state.walkPhase)*24; lR=-Math.sin(state.walkPhase)*24; aL=-Math.sin(state.walkPhase)*18; aR=Math.sin(state.walkPhase)*18; bodyR=Math.sin(state.walkPhase*2)*1.5; bob=Math.abs(Math.sin(state.walkPhase))*-2.4;
    } else if(mode==='jump'){
      const p=Math.min(1,Math.max(0,(now-(state.modeUntil-1150))/1150)); jumpY=-Math.sin(p*Math.PI)*62; aL=-18; aR=18; lL=8; lR=-8; bodyR=Math.sin(p*Math.PI)*3;
    } else if(mode==='talk'){
      headY+=Math.sin(t*7)*1.6; bodyR+=Math.sin(t*5)*.8; aL=Math.sin(t*3)*4; aR=-Math.sin(t*3)*4;
    }

    const gazeX=state.x*10, gazeY=state.y*7;
    avatar.style.transform=`translate3d(0,${(bob+jumpY).toFixed(2)}px,0) rotateZ(${bodyR.toFixed(2)}deg)`;
    head.style.transform=`translate3d(${gazeX.toFixed(2)}px,${(headY+gazeY).toFixed(2)}px,18px) rotateX(${(-state.y*5).toFixed(2)}deg) rotateY(${(state.x*7).toFixed(2)}deg) rotateZ(${headR.toFixed(2)}deg)`;
    torso.style.transform=`translateZ(5px) scaleY(${(1+Math.sin(t*1.5)*.012).toFixed(4)})`;
    armL.style.transform=`rotateZ(${aL.toFixed(2)}deg)`; armR.style.transform=`rotateZ(${aR.toFixed(2)}deg)`;
    legL.style.transform=`rotateZ(${lL.toFixed(2)}deg)`; legR.style.transform=`rotateZ(${lR.toFixed(2)}deg)`;

    const blinkOn=now<state.blinkUntil;
    const ex=state.mode==='surprised';
    [eyeL,eyeR].forEach(e=>{if(e)e.style.transform=`translate3d(${(state.x*4).toFixed(2)}px,${(state.y*3).toFixed(2)}px,0) scaleY(${blinkOn?.12:1})`;});
    if(mouth){
      const talking=now<state.talkUntil || mode==='talk';
      const open=talking?(0.35+((Math.sin(t*13)+1)/2)*1.1):1;
      mouth.style.transform=`translate(-50%,-50%) scaleY(${open.toFixed(2)})`;
    }
    host.style.setProperty('--gazeX',`${gazeX.toFixed(2)}px`);
    raf=requestAnimationFrame(animate);
  };
  raf=requestAnimationFrame(animate);

  // Run once now and again whenever app.js refreshes the profile/market.
  window.applyLobbyCharacter();
  window.addEventListener('beforeunload',()=>{cancelAnimationFrame(raf);clearTimeout(idleTimer);});
})();
