/*
 * Dhamma Journey V7.8 — Living AI Character
 * Procedural SVG puppet: no character photo is used for the animation.
 * The character has independent head/eyes/arms/mouth, idle breathing,
 * gaze tracking, blinking, gestures, and text-driven emotional reactions.
 */
(()=>{
  'use strict';

  const zone = document.querySelector('.lobby-character-zone');
  if(!zone) return;

  const NS='http://www.w3.org/2000/svg';
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const esc=(s)=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));

  // Keep the older image puppets out of the way. The new character is a true
  // vector puppet with separately animated parts.
  const oldLiving=document.getElementById('livingCharacter');
  const oldMonk=document.getElementById('lobbyMonk');
  const custom=document.getElementById('lobbyCustomCharacter');
  if(oldLiving) oldLiving.classList.add('v78-hidden-character');
  if(oldMonk) oldMonk.classList.add('v78-hidden-character');

  const host=document.createElement('div');
  host.id='livingAiCharacter';
  host.className='living-ai-character';
  host.setAttribute('role','button');
  host.setAttribute('tabindex','0');
  host.setAttribute('aria-label','Karakter AI hidup. Klik untuk menyapa.');
  host.innerHTML=`
    <div class="living-ai-stage">
      <svg class="living-ai-svg" viewBox="0 0 360 540" aria-hidden="true">
        <defs>
          <linearGradient id="laiHair" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#6f5145"/><stop offset="1" stop-color="#3f2c29"/></linearGradient>
          <linearGradient id="laiShirt" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#efe3d3"/></linearGradient>
          <linearGradient id="laiPants" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#b5aa96"/><stop offset="1" stop-color="#8f8675"/></linearGradient>
          <filter id="laiShadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="9" stdDeviation="8" flood-opacity=".18"/></filter>
        </defs>
        <ellipse class="lai-ground-shadow" cx="180" cy="513" rx="88" ry="14"/>
        <g class="lai-puppet">
          <g class="lai-body-rig">
            <g class="lai-legs">
              <path d="M119 360 C117 404 116 450 128 478 C137 497 155 497 166 483 L170 382Z" fill="url(#laiPants)"/>
              <path d="M190 382 L194 483 C205 498 223 497 232 479 C244 451 242 406 239 360Z" fill="url(#laiPants)"/>
              <g class="lai-shoe lai-shoe-left"><path d="M122 470 C138 465 159 466 171 478 C176 486 173 500 161 505 L119 505 C108 500 108 485 122 470Z" fill="#fff" stroke="#cfc4b3" stroke-width="4"/><path d="M124 484 L162 486" stroke="#c7bdb0" stroke-width="4" stroke-linecap="round"/></g>
              <g class="lai-shoe lai-shoe-right"><path d="M191 478 C204 466 225 465 238 470 C252 485 252 500 241 505 L199 505 C187 500 186 486 191 478Z" fill="#fff" stroke="#cfc4b3" stroke-width="4"/><path d="M199 486 L238 484" stroke="#c7bdb0" stroke-width="4" stroke-linecap="round"/></g>
            </g>
            <g class="lai-torso" filter="url(#laiShadow)">
              <path d="M109 243 C123 226 148 215 180 215 C212 215 237 226 251 243 L239 382 C223 399 137 399 121 382Z" fill="url(#laiShirt)" stroke="#d2c3b0" stroke-width="4"/>
              <path d="M119 246 C142 252 151 271 156 300" fill="none" stroke="#d9cbb8" stroke-width="4" opacity=".8"/>
              <path d="M241 246 C218 252 209 271 204 300" fill="none" stroke="#d9cbb8" stroke-width="4" opacity=".8"/>
            </g>
            <g class="lai-arm lai-arm-left">
              <path d="M119 248 C99 255 90 276 91 304 C92 327 101 347 117 353 C130 357 140 346 137 333 L125 300 L143 271Z" fill="#f4e7d8" stroke="#d2c3b0" stroke-width="4"/>
              <circle cx="112" cy="348" r="15" fill="#f2c7a9" stroke="#c9997e" stroke-width="3"/>
            </g>
            <g class="lai-arm lai-arm-right">
              <path d="M241 248 C261 255 270 276 269 304 C268 327 259 347 243 353 C230 357 220 346 223 333 L235 300 L217 271Z" fill="#f4e7d8" stroke="#d2c3b0" stroke-width="4"/>
              <circle cx="248" cy="348" r="15" fill="#f2c7a9" stroke="#c9997e" stroke-width="3"/>
            </g>
          </g>

          <g class="lai-head-rig">
            <ellipse class="lai-neck" cx="180" cy="231" rx="29" ry="22" fill="#efbd9e"/>
            <g class="lai-head" filter="url(#laiShadow)">
              <ellipse cx="180" cy="157" rx="103" ry="108" fill="#f5c9aa" stroke="#b8846a" stroke-width="5"/>
              <ellipse class="lai-ear lai-ear-left" cx="78" cy="165" rx="18" ry="28" fill="#efbd9e" stroke="#b8846a" stroke-width="5"/>
              <ellipse class="lai-ear lai-ear-right" cx="282" cy="165" rx="18" ry="28" fill="#efbd9e" stroke="#b8846a" stroke-width="5"/>
              <path class="lai-hair-back" d="M88 132 C76 65 120 30 180 29 C244 30 285 70 271 137 C254 113 235 101 213 91 C195 118 162 119 139 92 C124 109 106 121 88 132Z" fill="url(#laiHair)" stroke="#4d3630" stroke-width="4"/>
              <path class="lai-hair-fringe" d="M90 122 C98 58 144 39 180 45 C218 39 262 62 270 121 C245 111 230 102 214 82 C196 111 169 115 145 86 C127 106 111 114 90 122Z" fill="url(#laiHair)"/>
              <g class="lai-brow-rig">
                <path class="lai-brow-left" d="M120 145 Q143 132 160 145" fill="none" stroke="#704d42" stroke-width="8" stroke-linecap="round"/>
                <path class="lai-brow-right" d="M200 145 Q217 132 240 145" fill="none" stroke="#704d42" stroke-width="8" stroke-linecap="round"/>
              </g>
              <g class="lai-eye lai-eye-left">
                <ellipse cx="141" cy="174" rx="27" ry="31" fill="#fffdfb"/>
                <ellipse class="lai-iris" cx="145" cy="178" rx="17" ry="21" fill="#7d5749"/>
                <ellipse class="lai-pupil" cx="149" cy="180" rx="8" ry="12" fill="#2c211f"/>
                <circle cx="154" cy="170" r="5" fill="#fff"/>
                <path class="lai-lid" d="M115 174 Q141 150 167 174" fill="none" stroke="#744f44" stroke-width="5" stroke-linecap="round" opacity="0"/>
              </g>
              <g class="lai-eye lai-eye-right">
                <ellipse cx="219" cy="174" rx="27" ry="31" fill="#fffdfb"/>
                <ellipse class="lai-iris" cx="215" cy="178" rx="17" ry="21" fill="#7d5749"/>
                <ellipse class="lai-pupil" cx="211" cy="180" rx="8" ry="12" fill="#2c211f"/>
                <circle cx="206" cy="170" r="5" fill="#fff"/>
                <path class="lai-lid" d="M193 174 Q219 150 245 174" fill="none" stroke="#744f44" stroke-width="5" stroke-linecap="round" opacity="0"/>
              </g>
              <g class="lai-mouth-rig">
                <path class="lai-mouth-smile" d="M161 218 Q180 233 199 218" fill="none" stroke="#8c4f4d" stroke-width="5" stroke-linecap="round"/>
                <ellipse class="lai-mouth-open" cx="180" cy="222" rx="15" ry="10" fill="#91494b" opacity="0"/>
                <path class="lai-mouth-tongue" d="M171 226 Q180 232 189 226" fill="none" stroke="#e69b99" stroke-width="4" stroke-linecap="round" opacity="0"/>
              </g>
              <ellipse class="lai-cheek lai-cheek-left" cx="112" cy="211" rx="20" ry="9"/>
              <ellipse class="lai-cheek lai-cheek-right" cx="248" cy="211" rx="20" ry="9"/>
            </g>
          </g>
        </g>
      </svg>
      <div class="living-ai-status"><span class="living-ai-dot"></span><span id="livingAiStatusText">AI menemanimu</span></div>
    </div>
    <div class="living-ai-chip">AI Companion</div>
  `;

  // Insert before the old character so the existing layout can still calculate the zone.
  zone.insertBefore(host, oldLiving || oldMonk || zone.firstChild);

  const puppet=host.querySelector('.lai-puppet');
  const head=host.querySelector('.lai-head-rig');
  const body=host.querySelector('.lai-body-rig');
  const armR=host.querySelector('.lai-arm-right');
  const eyes=[...host.querySelectorAll('.lai-eye')];
  const lids=[...host.querySelectorAll('.lai-lid')];
  const mouth=host.querySelector('.lai-mouth-open');
  const smile=host.querySelector('.lai-mouth-smile');
  const tongue=host.querySelector('.lai-mouth-tongue');
  const brows=[...host.querySelectorAll('.lai-brow-left,.lai-brow-right')];
  const status=host.querySelector('#livingAiStatusText');

  const s={tx:0,ty:0,x:0,y:0,blink:0,blinkAt:performance.now()+2200,gesture:'idle',gestureUntil:0,emotion:'normal',speechUntil:0};
  let raf=0;
  const setStatus=(text)=>{if(status)status.textContent=text};
  const point=(x,y)=>{
    const r=host.getBoundingClientRect();
    s.tx=clamp((x-(r.left+r.width*.5))/(r.width*.6),-1,1);
    s.ty=clamp((y-(r.top+r.height*.35))/(r.height*.65),-1,1);
  };
  const resetPoint=()=>{s.tx=0;s.ty=0};

  zone.addEventListener('pointermove',e=>{if(e.pointerType!=='touch'&&!host.classList.contains('is-hidden'))point(e.clientX,e.clientY)},{passive:true});
  zone.addEventListener('pointerleave',resetPoint,{passive:true});
  host.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')point(e.clientX,e.clientY)},{passive:true});
  window.addEventListener('pointerup',e=>{if(e.pointerType==='touch')resetPoint()},{passive:true});

  function emotion(name='normal'){
    s.emotion=name;
    host.dataset.emotion=name;
    const map={
      happy:{brow:-2,smile:true},
      surprised:{brow:-7,smile:false},
      shy:{brow:2,smile:true},
      calm:{brow:1,smile:true},
      sad:{brow:5,smile:false},
      normal:{brow:0,smile:true}
    };
    const e=map[name]||map.normal;
    brows[0].style.transform=`rotate(${e.brow}deg)`; brows[1].style.transform=`rotate(${-e.brow}deg)`;
    smile.style.opacity=e.smile?'1':(name==='surprised'||name==='sad'?'0':'1');
  }

  function gesture(kind='wave',duration=1800){
    s.gesture=kind;s.gestureUntil=performance.now()+duration;
    host.classList.remove('g-wave','g-calm','g-nod','g-shy','g-talk');
    void host.offsetWidth;
    if(kind==='wave') host.classList.add('g-wave');
    if(kind==='calm') host.classList.add('g-calm');
    if(kind==='nod') host.classList.add('g-nod');
    if(kind==='shy') host.classList.add('g-shy');
    if(kind==='talk') host.classList.add('g-talk');
    if(kind==='wave'){emotion('happy');setStatus('menyapamu 👋')}
    else if(kind==='calm'){emotion('calm');setStatus('bernapas dengan tenang 🪷')}
    else if(kind==='shy'){emotion('shy');setStatus('tersenyum malu 😊')}
    else if(kind==='nod'){emotion('happy');setStatus('mengangguk')}
    else if(kind==='talk'){setStatus('sedang berbicara')}
    else setStatus('AI menemanimu');
  }

  function speakVisual(text){
    const t=String(text||'').trim(); if(!t)return;
    const low=t.toLowerCase();
    let emo='normal';
    if(/terima kasih|senang|bagus|hebat|halo|selamat|semangat/.test(low))emo='happy';
    else if(/maaf|sedih|kecewa/.test(low))emo='sad';
    else if(/tenang|napas|meditasi|damai/.test(low))emo='calm';
    else if(/wah|wow|kaget|serius/.test(low))emo='surprised';
    emotion(emo);
    s.speechUntil=performance.now()+Math.max(1800,Math.min(9000,t.length*42));
    gesture('talk',Math.max(1800,Math.min(9000,t.length*42)));
  }

  // Public API used by the app and useful for future AI/voice integrations.
  window.LivingAICharacter={
    element:host,
    greet:()=>gesture('wave',2200),
    calm:()=>gesture('calm',4200),
    nod:()=>gesture('nod',1500),
    shy:()=>gesture('shy',1800),
    talk:speakVisual,
    setEmotion:emotion,
    setVisible:(visible)=>host.classList.toggle('is-hidden',!visible)
  };

  host.addEventListener('click',()=>window.LivingAICharacter.greet());
  host.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();window.LivingAICharacter.greet()}});

  // Hook the existing lobby buttons without touching the old app logic.
  document.getElementById('monkWaveBtn')?.addEventListener('click',()=>window.LivingAICharacter.greet());
  document.getElementById('monkMeditateBtn')?.addEventListener('click',()=>window.LivingAICharacter.calm());

  // When Lotus Companion writes into the existing speech bubble, make the puppet react.
  const bubble=document.getElementById('characterSpeechBubble');
  if(bubble){
    const obs=new MutationObserver(()=>{
      if(!bubble.classList.contains('hidden')&&bubble.textContent.trim())window.LivingAICharacter.talk(bubble.textContent);
    });
    obs.observe(bubble,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});
  }

  // Also observe AI chat replies directly, so the character reacts even if the
  // speech bubble implementation changes later.
  const aiMessages=document.getElementById('lobbyAiMessages');
  if(aiMessages){
    const obs=new MutationObserver(()=>{
      const last=aiMessages.querySelector('.lobby-ai-message.assistant:last-child p');
      if(last&&last.textContent.trim())window.LivingAICharacter.talk(last.textContent);
    });
    obs.observe(aiMessages,{subtree:true,childList:true,characterData:true});
  }

  // Keep custom uploaded characters supported: show the vector AI only when no
  // custom character is active. If a custom image is active, it remains visible.
  const syncVisibility=()=>{
    const customActive=custom && !custom.classList.contains('hidden');
    window.LivingAICharacter.setVisible(!customActive);
  };
  if(custom){new MutationObserver(syncVisibility).observe(custom,{attributes:true,attributeFilter:['class']});}
  syncVisibility();

  function blink(){
    lids.forEach(x=>x.style.opacity='1');
    setTimeout(()=>lids.forEach(x=>x.style.opacity='0'),110);
    s.blinkAt=performance.now()+2400+Math.random()*4200;
  }

  function animate(now){
    const t=now/1000;
    s.x+=(s.tx-s.x)*.09;s.y+=(s.ty-s.y)*.09;
    if(now>s.blinkAt&&!host.classList.contains('is-hidden'))blink();
    const active=now<s.gestureUntil;
    if(!active){s.gesture='idle';host.classList.remove('g-wave','g-calm','g-nod','g-shy','g-talk');setStatus('AI menemanimu')}
    const talk=now<s.speechUntil||host.classList.contains('g-talk');
    const calm=s.gesture==='calm';
    const wave=s.gesture==='wave';
    const breath=Math.sin(t*(calm?1.05:1.35))*(calm?3.1:2.2);
    const sway=Math.sin(t*.7)*1.5;
    const bodyY=breath+sway;
    const bodyScale=1+Math.sin(t*(calm?1.05:1.35))*.012;
    const headX=s.x*8,headY=s.y*6-1+Math.sin(t*1.05)*1.5;
    const headR=s.x*3.8+Math.sin(t*.82)*.7;
    let arm=0;
    if(wave)arm=Math.sin(t*11)*28+34;
    else if(talk)arm=Math.sin(t*3.2)*5;
    else arm=Math.sin(t*.8)*2;
    body.setAttribute('transform',`translate(0 ${bodyY.toFixed(2)}) rotate(${(Math.sin(t*.7)*.45).toFixed(2)} 180 500) scale(1 ${bodyScale.toFixed(4)})`);
    head.setAttribute('transform',`translate(${headX.toFixed(2)} ${headY.toFixed(2)}) rotate(${headR.toFixed(2)} 180 155)`);
    armR.setAttribute('transform',`rotate(${arm.toFixed(2)} 241 248)`);
    eyes.forEach((eye,i)=>{
      const iris=eye.querySelector('.lai-iris'),p=eye.querySelector('.lai-pupil');
      const dx=s.x*(i?3.5:3.5),dy=s.y*2.6;
      iris.setAttribute('transform',`translate(${dx.toFixed(2)} ${dy.toFixed(2)})`);
      p.setAttribute('transform',`translate(${(dx*1.15).toFixed(2)} ${(dy*1.15).toFixed(2)})`);
    });
    if(talk){
      const open=(Math.sin(t*11)+1)/2;
      mouth.style.opacity=String(.25+open*.8);mouth.setAttribute('ry',(6+open*10).toFixed(2));
      tongue.style.opacity=String(open*.8);smile.style.opacity='0';
    }else{mouth.style.opacity='0';tongue.style.opacity='0';smile.style.opacity=s.emotion==='surprised'?'0':'1'}
    requestAnimationFrame(animate);
  }
  emotion('normal');
  requestAnimationFrame(animate);
})();
