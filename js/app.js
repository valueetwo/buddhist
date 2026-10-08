

(()=>{
"use strict";
const $=id=>document.getElementById(id);
const $$=sel=>Array.from(document.querySelectorAll(sel));
const baseVideos=[
  ["淨口業真言","12:34","12 menit 34 detik","Mantra Harian"],
  ["淨身真言","11:28","11 menit 28 detik","Pemurnian"],
  ["淨三業真言","14:20","14 menit 20 detik","Pemurnian"],
  ["安土地真言","09:18","9 menit 18 detik","Perlindungan"],
  ["普供養真言","16:05","16 menit 5 detik","Persembahan"],
  ["普回向真言","13:17","13 menit 17 detik","Pelimpahan Jasa"],
  ["金剛讚","10:42","10 menit 42 detik","Pujian"],
  ["請八金剛","08:56","8 menit 56 detik","Permohonan"],
  ["補闕真言","07:48","7 menit 48 detik","Pelengkap"],
  ["圓滿真言","06:36","6 menit 36 detik","Penutup"]
];
const MANTRA_PINYIN=[
  "Jing Kou Ye Zhen Yan","Jing Shen Zhen Yan","Jing San Ye Zhen Yan","An Tu Di Zhen Yan",
  "Pu Gong Yang Zhen Yan","Pu Hui Xiang Zhen Yan","Jin Gang Zan","Qing Ba Jin Gang",
  "Bu Que Zhen Yan","Yuan Man Zhen Yan"
];
const MANTRA_DESC=[
  "Mantra suci untuk membersihkan karma ucapan, menjernihkan pikiran, dan menjaga kesucian kata-kata.",
  "Mantra pemurnian tubuh dan perilaku agar lebih tenang dan penuh kesadaran.",
  "Mantra pemurnian tiga karma: tubuh, ucapan, dan pikiran.",
  "Bacaan untuk memohon ketenteraman dan keberkahan bagi tempat.",
  "Mantra persembahan universal sebagai ungkapan penghormatan dan ketulusan.",
  "Mantra pelimpahan jasa kebajikan bagi semua makhluk.",
  "Pujian Vajra yang dibaca sebagai bagian dari rangkaian puja.",
  "Permohonan kepada Delapan Vajra sebagai pelindung Dharma.",
  "Mantra pelengkap untuk menyempurnakan kekurangan dalam pelafalan atau ritual.",
  "Mantra penutup untuk menyempurnakan rangkaian bacaan."
];
const MANTRA_THUMB=[
  "assets/thumb-target-1.jpg","assets/thumb-target-2.jpg","assets/thumb-target-3.jpg","assets/thumb-target-3.jpg","assets/thumb-target-4.jpg",
  "assets/thumb-target-5.jpg","assets/thumb-target-2.jpg","assets/thumb-target-4.jpg","assets/thumb-target-1.jpg","assets/thumb-target-5.jpg"
];
const MANTRA_AUDIO=[
  "audio/01-j-ng-k-u-y-zh-n-y-n.mp3","audio/02-j-ng-sh-n-zh-n-y-n.mp3","audio/03-j-ng-s-n-y-zh-n-y-n.mp3",
  "audio/04-n-t-d-zh-n-y-n.mp3","audio/05-p-g-ng-y-ng-zh-n-y-n.mp3","audio/06-p-hu-xi-ng-zh-n-y-n.mp3",
  "audio/07-j-n-g-ng-z-n.mp3","audio/08-q-ng-b-j-n-g-ng.mp3","audio/09-b-qu-zh-n-y-n.mp3","audio/10-yu-n-m-n-zh-n-y-n.mp3"
];
const GAME_CATEGORIES=["Hospital","Temple","Monastery","Meditation Garden","Education","Other"];
const CATEGORIES=["Mantra Harian","Pemurnian","Perlindungan","Persembahan","Pelimpahan Jasa","Pujian","Permohonan","Pelengkap","Penutup"];

const DEFAULT_FAQ=[
  {question:"Bagaimana cara membaca mantra?",answer:"Pilih video/mantra, ikuti teks dan audio secara perlahan.",important_note:"Pelafalan dapat berbeda menurut tradisi vihara."},
  {question:"Apakah bacaan harus cepat?",answer:"Tidak. Utamakan pelafalan yang jelas, tenang, dan konsisten."}
];
const DEFAULT_Notes=[
  {title:"Panduan Pelafalan",content:"Baca dengan tenang, jelas, dan konsisten. Gunakan audio sebagai panduan."},
  {title:"Urutan Bacaan",content:"Pilih mantra dari dashboard, baca teks dan pinyin, lalu buka materi pendamping bila tersedia."}
];
const KEY="buddhist-dashboard-ui-v3";
let saved={}; try{saved=JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){}
function makeBaseVideo(v,i){const a=[...v];a._baseKey=`base-${i}`;a._isBase=true;a._description=MANTRA_DESC[i]||"";a._thumb=MANTRA_THUMB[i]||"";a._videoUrl="";a._language="Indonesia";a._tags=["mantra",MANTRA_PINYIN[i]||""];a._pinyin=MANTRA_PINYIN[i]||"";a._audioUrl=MANTRA_AUDIO[i]||"";return a}
function videoFromRow(r){const a=[r.title,r.duration||"5:00",r.duration_label||r.duration||"5:00",r.category||"Mantra"];a._id=r.id;a._baseKey=r.base_key||"";a._remote=true;a._description=r.description||"";a._thumb=r.thumbnail_url||"";a._videoUrl=r.video_url||"";a._language=r.language||"Indonesia";a._tags=Array.isArray(r.tags)?r.tags:[];a._pinyin=a._tags.find(x=>x!=="mantra")||"";a._audioUrl="";return a}
let videos=Array.isArray(saved.videos)&&saved.videos.length?saved.videos:baseVideos.map(makeBaseVideo);
let materials=Array.isArray(saved.materials)?saved.materials:[];
let faqs=Array.isArray(saved.faqs)?saved.faqs:[...DEFAULT_FAQ];
let Notes=[];
let games=[];
let favorites=new Set(saved.favorites||[]), playlist=new Set(saved.playlist||[]), history=saved.history||[];
let active=Math.min(Number.isInteger(saved.active)?saved.active:0,videos.length-1);
let playing=false, elapsed=0, timer=null, muted=false, subtitle=false, dragMoved=false;
let isAdmin=false, isOwner=false, currentSession=null, currentRole="viewer", authMode="login", sb=null, editingVideoIndex=null, editingMaterialIndex=null, editingFaqIndex=null, editingNotesIndex=null, editingGameId=null, selectedGameCategory="";
let friendRows=[], presenceTimer=null, activityLogRows=[], activityProfileMap=new Map(), activityLoggedUser="";
let chatMode="global", chatRecipientId=null, chatRecipientProfile=null, chatTimer=null, chatContactRows=[];
let caishenBalance=0, economyConfig={character_cost:100,min_topup_idr:10000}, paymentMethods=[], editingPaymentMethodId=null;
let ownerWalletAccounts=[], ownerFinanceSummary=null;
let currentMaterialDetailIndex=null, characterSpeechTimer=null, customCharacterLoadToken=0;
let contentMarks=new Map(), aiKnowledgeRows=[], marketAdminRows=[];
let lobbyAiRows=[], lobbyMarketRows=[], monkIdleTimer=null, monkGestureTimer=null;
let characterVoiceEnabled=false, characterVoiceReady=false, characterVoiceTimer=null, characterVoiceActive=false;
function persist(){try{localStorage.setItem(KEY,JSON.stringify({videos,materials,faqs,Notes,favorites:[...favorites],playlist:[...playlist],history,active}))}catch(e){/* private/blocked storage: UI tetap jalan */}}
function say(msg){const t=$("toast"); if(!t)return; t.textContent=msg;t.classList.add("show");clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.remove("show"),1800)}
function secs(t){const a=String(t||"0:00").split(":").map(Number);return (a[0]||0)*60+(a[1]||0)}
function clock(s){s=Math.max(0,Math.floor(s));return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")}
function showPage(id){
  
  $$(".nav button[data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===id));
  $$(".page-view").forEach(p=>p.classList.toggle("active",p.id===id));
  const info=document.querySelector(".info"); if(info)info.style.display=id==="tutorial"?"block":"none";
  const layout=document.querySelector(".layout"); if(layout)layout.classList.toggle("content-mode",id!=="tutorial");
  if(id==="dashboard")renderLobbyPage(); if(id==="market-more")renderMarketMorePage(); if(id==="tutorial")renderTutorial(); if(id==="materials-library")renderMaterialLibrary(); if(id==="material-video-picker")renderMaterialVideoPicker(); if(id==="faq")renderFAQ(); if(id==="game")renderGames(); if(id==="kategori")renderCategories(); if(id==="friends")renderFriends(); if(id==="chat")renderChatPage(); if(id==="caishen")renderCaishenPage(); if(id==="favorit")renderListPage("favorit"); if(id==="playlist")renderListPage("playlist"); if(id==="riwayat")renderListPage("riwayat"); if(id==="settings")renderSettingsPage(); if(id==="pengguna")renderUserManagement(); if(id==="activity-log")renderActivityLogs(); if(id==="complaints")renderComplaints();
  if(id==="tambah-konten")selectTab("video");
  if(id==="tutorial")requestAnimationFrame(()=>{centerCard(active,false);updateCoverFlow()});
}
window.showPage=showPage;
$$(".nav button[data-page]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));
function parseVideoSource(url){
  const raw=String(url||"").trim(); if(!raw)return null;
  try{
    const u=new URL(raw,location.href); const host=u.hostname.replace(/^www\./,"").toLowerCase();
    if(host==="youtu.be"){const id=u.pathname.split("/").filter(Boolean)[0];if(id)return {type:"youtube",src:`https://www.youtube.com/embed/${encodeURIComponent(id)}?rel=0&enablejsapi=1&playsinline=1`}}
    if(host.endsWith("youtube.com")){
      let id=u.searchParams.get("v");
      if(!id){const parts=u.pathname.split("/").filter(Boolean);if(["embed","shorts","live"].includes(parts[0]))id=parts[1]}
      if(id)return {type:"youtube",src:`https://www.youtube.com/embed/${encodeURIComponent(id)}?rel=0&enablejsapi=1&playsinline=1`};
    }
    if(host.endsWith("vimeo.com")){const id=u.pathname.split("/").filter(Boolean).find(x=>/^\d+$/.test(x));if(id)return {type:"vimeo",src:`https://player.vimeo.com/video/${id}`}}
    if(/\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(u.pathname+u.search+u.hash))return {type:"file",src:u.href};
    return {type:"file",src:u.href};
  }catch(_){return null}
}
function youtubeThumbnailFromUrl(url){
  const raw=String(url||"").trim(); if(!raw)return "";
  try{
    const u=new URL(raw,location.href); const host=u.hostname.replace(/^www\./,"").toLowerCase();
    let id="";
    if(host==="youtu.be")id=u.pathname.split("/").filter(Boolean)[0]||"";
    else if(host.endsWith("youtube.com")){
      id=u.searchParams.get("v")||"";
      if(!id){const parts=u.pathname.split("/").filter(Boolean);if(["embed","shorts","live"].includes(parts[0]))id=parts[1]||""}
    }
    return id?`https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`:"";
  }catch(_){return ""}
}
function effectiveVideoThumb(v){return String(v?._thumb||"").trim()||youtubeThumbnailFromUrl(v?._videoUrl||"")}

function renderRealVideo(v){
  const player=$("mainPlayer")||document.querySelector(".player"), layer=$("mediaLayer"); if(!player||!layer)return;
  const src=parseVideoSource(v?._videoUrl||""); layer.innerHTML=""; player.classList.toggle("has-real-media",!!src);
  if(!src)return;
  if(src.type==="youtube"||src.type==="vimeo"){
    const f=document.createElement("iframe");f.src=src.src;f.title=v?.[0]||"Video";f.allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";f.allowFullscreen=true;layer.appendChild(f);
  }else{
    const vid=document.createElement("video");vid.src=src.src;vid.controls=true;vid.playsInline=true;vid.preload="metadata";layer.appendChild(vid);
  }
}
function setActive(i,center=true,recordHistory=true){
  if(!videos.length)return; active=Math.max(0,Math.min(i,videos.length-1)); elapsed=0; playing=false; clearInterval(timer);
  const v=videos[active]; const playerEl=$("mainPlayer"); if(playerEl)playerEl.classList.toggle("reference-first",active===0&&!String(v?._videoUrl||"").trim()); if($("heroTitle"))$("heroTitle").textContent=v[0]; if($("infoTitle"))$("infoTitle").textContent=v[0]; if($("infoPinyin"))$("infoPinyin").textContent=v._pinyin||v._tags?.find(x=>x!=="mantra")||""; if($("infoThumb"))$("infoThumb").src=effectiveVideoThumb(v)||MANTRA_THUMB[active%MANTRA_THUMB.length]||"assets/thumb-1.png"; if($("duration"))$("duration").textContent=v[1]||v[2]; if($("category"))$("category").textContent=v[3]||"Mantra";
  if($("infoDesc"))$("infoDesc").textContent=v._description||("Panduan "+String(v[0]).toLowerCase()+" pada Buddhist Dashboard.");
  if($("materialTargetVideo"))$("materialTargetVideo").textContent=v[0]; if($("playBtn"))$("playBtn").textContent="▶"; renderRealVideo(v);
  if(recordHistory) history=[active,...history.filter(x=>x!==active)].slice(0,20); persist(); updatePlayer(); renderMaterialsMini(); refreshFavButtons();
  if(center)centerCard(active,true);
}
function esc(x){return String(x??"").replace(/[&<>\"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]))}

const loopCopies=3;
let realCount=videos.length;
let carouselCopies=1;
let carouselMiddleCopy=0;
let carouselRaf=0;

function renderCarousel(){
  const scroller=$("scroller");
  if(!scroller)return;
  realCount=videos.length;
  // 1–3 video tampil sesuai jumlah aslinya. Loop 3-copy baru aktif saat koleksi sudah cukup banyak.
  carouselCopies=1;
  carouselMiddleCopy=0;
  scroller.classList.toggle("single-video",realCount===1);
  scroller.closest(".related")?.classList.toggle("single-related",realCount===1);
  scroller.innerHTML="";
  for(let copy=0;copy<carouselCopies;copy++){
    videos.forEach((v,i)=>{
      const card=document.createElement("article");
      card.className="card";
      card.dataset.real=i;
      const thumb=effectiveVideoThumb(v);
      card.innerHTML=`<div class="thumb${thumb?" has-image":""}">${thumb?`<img src="${esc(thumb)}" alt="${esc(v[0])}" loading="eager">`:""}<span class="duration">${esc(v[1])}</span></div><h4>${esc(v[0])}</h4><p>${esc(v._pinyin||v[3]||"Mantra")}</p><div class="card-actions"><button class="mini-btn fav-btn" type="button">☆ Favorit</button><button class="mini-btn list-btn" type="button">＋ Playlist</button></div><div class="card-admin-actions"><button class="mini-btn edit-btn admin-card-btn" type="button">✏ Edit</button><button class="mini-btn delete-btn admin-card-btn" type="button">🗑 Hapus</button></div>`;
      
      card.addEventListener("click",e=>{
        if(e.target.closest("button"))return;
        if(!carouselHasMoved){
          setActive(i,false,true);
          if(window.innerWidth>760){
            rebalanceCarouselAround(i);
          }else{
            centerRealCard(i,true);
          }
        }
      });
      scroller.appendChild(card);
    });
  }
  refreshFavButtons();
  requestAnimationFrame(()=>{updateCoverFlow(); if(active===0)scroller.scrollLeft=0;});
}

function cardStep(){
  const scroller=$("scroller");
  const cards=[...scroller.children];
  if(cards.length<2)return 196;
  return cards[1].offsetLeft-cards[0].offsetLeft;
}
function getRealCard(realIndex){
  const scroller=$("scroller");
  return scroller?.querySelector(`.card[data-real="${realIndex}"]`)||null;
}
function jumpToMiddleCopy(realIndex){
  const scroller=$("scroller");
  if(!scroller||!realCount)return;
  const card=getRealCard(realIndex);
  if(!card)return;
  scroller.scrollLeft=card.offsetLeft-(scroller.clientWidth-card.offsetWidth)/2;
}
function centerRealCard(realIndex,smooth=false){
  const scroller=$("scroller");
  if(!scroller||!realCount)return;
  const card=getRealCard(realIndex);
  if(!card)return;
  const left=card.offsetLeft-(scroller.clientWidth-card.offsetWidth)/2;
  scroller.scrollTo({left,behavior:smooth?"smooth":"auto"});
}
function centerCard(i,smooth=true){centerRealCard(i,smooth)}
function rebalanceCarouselAround(realIndex){
  const scroller=$("scroller");
  if(scroller&&active===0)scroller.scrollLeft=0;
  updateCoverFlow();
}
function normalizeLoop(){
  const scroller=$("scroller");
  if(!scroller||!realCount||carouselCopies===1)return;
  const step=cardStep();
  const oneSet=step*realCount;
  if(!oneSet)return;
  if(scroller.scrollLeft<oneSet*.45)scroller.scrollLeft+=oneSet;
  else if(scroller.scrollLeft>oneSet*1.55)scroller.scrollLeft-=oneSet;
}
function updateCoverFlow(){
  const scroller=$("scroller");
  if(!scroller)return;
  const center=scroller.scrollLeft+scroller.clientWidth/2;
  [...scroller.children].forEach(card=>{
    const cardCenter=card.offsetLeft+card.offsetWidth/2;
    const distance=Math.abs(cardCenter-center);
    const norm=Math.min(1,distance/Math.max(1,scroller.clientWidth*.52));
    const scale=1-(norm*.14);
    const lift=(1-norm)*9;
    card.style.transform=`translateY(${-lift}px) scale(${scale})`;
    card.style.opacity=String(.72+(1-norm)*.28);
    card.style.filter=`saturate(${.86+(1-norm)*.14}) brightness(${.92+(1-norm)*.08})`;
    card.style.zIndex=String(Math.round((1-norm)*10)+1);
  });
}
let carouselDrag=false,carouselTouchDragging=false,carouselStartX=0,carouselStartScroll=0,carouselPointer=null,carouselHasMoved=false;
function setupDrag(){
  const scroller=$("scroller");
  if(!scroller||scroller.dataset.dragReady==="1")return;
  scroller.dataset.dragReady="1";
  scroller.addEventListener("dragstart",e=>e.preventDefault());
  scroller.addEventListener("scroll",()=>{
    updateCoverFlow();
    const step=cardStep(),oneSet=step*realCount;
    if(!carouselDrag&&!carouselTouchDragging&&oneSet&&(scroller.scrollLeft<oneSet*.18||scroller.scrollLeft>oneSet*1.82))normalizeLoop();
  },{passive:true});
  scroller.addEventListener("wheel",e=>{
    if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){
      scroller.scrollLeft+=e.deltaY*2.0;
      e.preventDefault();
      updateCoverFlow();
    }
  },{passive:false});
  scroller.addEventListener("pointerdown",e=>{
    if(e.target.closest("button,a,input,select,textarea"))return;
    if(e.button!==undefined&&e.button!==0)return;
    carouselDrag=true;carouselHasMoved=false;dragMoved=false;
    carouselPointer=e.pointerId;carouselStartX=e.clientX;carouselStartScroll=scroller.scrollLeft;
    scroller.style.cursor="grabbing";
    [...scroller.children].forEach(c=>c.style.cursor="grabbing");
    try{scroller.setPointerCapture(e.pointerId)}catch(_e){}
  });
  scroller.addEventListener("pointermove",e=>{
    if(!carouselDrag||(carouselPointer!==null&&e.pointerId!==carouselPointer))return;
    const dx=e.clientX-carouselStartX;
    if(Math.abs(dx)>2){carouselHasMoved=true;dragMoved=true}
    scroller.scrollLeft=carouselStartScroll-dx*1.7;
    updateCoverFlow();
    if(carouselHasMoved&&e.cancelable)e.preventDefault();
  });

  // iPhone/iPad Safari: touch fallback supaya carousel benar-benar bisa diswipe.
  let touchDrag=false,touchStartX=0,touchStartY=0,touchStartScroll=0,touchMoved=false;
  scroller.addEventListener("touchstart",e=>{
    if(e.touches.length!==1||e.target.closest("button,a,input,select,textarea"))return;
    const t=e.touches[0];touchDrag=true;carouselTouchDragging=true;touchMoved=false;
    touchStartX=t.clientX;touchStartY=t.clientY;touchStartScroll=scroller.scrollLeft;
  },{passive:true});
  scroller.addEventListener("touchmove",e=>{
    if(!touchDrag||e.touches.length!==1)return;
    const t=e.touches[0],dx=t.clientX-touchStartX,dy=t.clientY-touchStartY;
    if(Math.abs(dx)<=Math.abs(dy))return;
    if(Math.abs(dx)>3){touchMoved=true;carouselHasMoved=true;dragMoved=true}
    scroller.scrollLeft=touchStartScroll-dx;
    updateCoverFlow();
    if(e.cancelable)e.preventDefault();
  },{passive:false});
  const finishTouch=()=>{
    if(!touchDrag)return;touchDrag=false;carouselTouchDragging=false;
    if(touchMoved){updateCoverFlow();rebalanceCarouselAround(active);history=[active,...history.filter(x=>x!==active)].slice(0,20);persist();}
    setTimeout(()=>{touchMoved=false;carouselHasMoved=false;dragMoved=false},100);
  };
  scroller.addEventListener("touchend",finishTouch,{passive:true});
  scroller.addEventListener("touchcancel",finishTouch,{passive:true});

  function finishDrag(e){
    if(!carouselDrag)return;
    carouselDrag=false;
    if(carouselPointer!==null){try{scroller.releasePointerCapture(carouselPointer)}catch(_e){}}
    carouselPointer=null;
    scroller.style.cursor="grab";
    [...scroller.children].forEach(c=>c.style.cursor="grab");
    updateCoverFlow();
    if(carouselHasMoved){rebalanceCarouselAround(active);
      history=[active,...history.filter(x=>x!==active)].slice(0,20);persist();
      setTimeout(()=>{carouselHasMoved=false;dragMoved=false},80);
    }
  }
  scroller.addEventListener("pointerup",finishDrag);
  scroller.addEventListener("pointercancel",finishDrag);
  scroller.addEventListener("lostpointercapture",finishDrag);
  scroller.addEventListener("click",e=>{
    if(carouselHasMoved){e.preventDefault();e.stopPropagation();carouselHasMoved=false;dragMoved=false}
  },true);
}

function updatePlayer(){const v=videos[active];if(!v)return;if($("playerTime"))$("playerTime").textContent=clock(elapsed)+" / "+v[1];if($("playerProgress"))$("playerProgress").style.width=(elapsed/Math.max(1,secs(v[1]))*100)+"%"}
$("playBtn")?.addEventListener("click",()=>{playing=!playing;$("playBtn").textContent=playing?"❚❚":"▶";clearInterval(timer);if(playing)timer=setInterval(()=>{elapsed++;if(elapsed>=secs(videos[active][1])){elapsed=0;playing=false;clearInterval(timer);$("playBtn").textContent="▶"}updatePlayer()},1000)});
$("playerTrack")?.addEventListener("click",e=>{const r=$("playerTrack").getBoundingClientRect();elapsed=Math.round(Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))*secs(videos[active][1]));updatePlayer()});
$("volumeBtn")?.addEventListener("click",()=>{muted=!muted;$("volumeBtn").textContent=muted?"🔇":"🔊";say(muted?"Suara dimatikan":"Suara diaktifkan")});
$("settingsBtn")?.addEventListener("click",e=>{e.stopPropagation();$("settingsMenu")?.classList.toggle("show")});document.addEventListener("click",e=>{if(!e.target.closest(".settings-wrap"))$("settingsMenu")?.classList.remove("show")});
$("resolutionSelect")?.addEventListener("change",e=>say("Resolusi: "+e.target.value));
$("subtitleBtn")?.addEventListener("click",()=>{subtitle=!subtitle;$("subtitleStatus").textContent=subtitle?"Aktif":"Mati";$("subtitleOverlay")?.classList.toggle("on",subtitle)});
$("fullscreenBtn")?.addEventListener("click",async()=>{const p=document.querySelector(".player");try{if(!document.fullscreenElement)await p.requestFullscreen();else await document.exitFullscreen()}catch(e){say("Fullscreen tidak didukung browser ini")}});
function toggleFav(i){
  if(!currentSession){setAuthMode("login");openAuth("Login atau daftar akun untuk menambahkan video ke Favorit.");return;}
  favorites.has(i)?favorites.delete(i):favorites.add(i);
  persist();refreshFavButtons();renderListPageIfOpen();
  say(favorites.has(i)?"Ditambahkan ke Favorit":"Dihapus dari Favorit");
}
function togglePlaylist(i){
  if(!currentSession){setAuthMode("login");openAuth("Login atau daftar akun untuk menambahkan video ke Playlist.");return;}
  playlist.has(i)?playlist.delete(i):playlist.add(i);
  persist();refreshFavButtons();renderListPageIfOpen();
  say(playlist.has(i)?"Ditambahkan ke Playlist":"Dihapus dari Playlist");
}
function refreshFavButtons(){
 $$("#scroller .card").forEach(c=>{const i=+c.dataset.real;const f=c.querySelector(".fav-btn"),p=c.querySelector(".list-btn");if(f)f.textContent=favorites.has(i)?"★ Favorit":"☆ Favorit";if(p)p.textContent=playlist.has(i)?"✓ Playlist":"＋ Playlist"});
 if($("playerFavStatus"))$("playerFavStatus").textContent=favorites.has(active)?"★":"☆";if($("playerPlaylistStatus"))$("playerPlaylistStatus").textContent=playlist.has(active)?"✓":"＋";if($("infoHeart"))$("infoHeart").textContent=favorites.has(active)?"♥":"♡";
}
$("playerFavBtn")?.addEventListener("click",()=>toggleFav(active));$("playerPlaylistBtn")?.addEventListener("click",()=>togglePlaylist(active));$("infoHeart")?.addEventListener("click",()=>toggleFav(active));
function renderListPageIfOpen(){const p=document.querySelector(".page-view.active");if(p&&["favorit","playlist","riwayat"].includes(p.id))renderListPage(p.id)}
function videoRows(indices,includeMaterials=false){
  if(!indices.length)return `<div class="page-empty">Belum ada data.</div>`;
  return `<div class="doc-list">${indices.map(i=>{
    const v=videos[i];if(!v)return "";
    const subs=materials.filter(m=>(m.videoTitle||m.video_title)===v[0]);
    const thumb=effectiveVideoThumb(v);
    const visual=thumb?`<div class="video-list-thumb"><img src="${esc(thumb)}" alt="${esc(v[0])}" loading="lazy"></div>`:`<div class="video-list-thumb">🪷</div>`;
    return `<div class="doc-item video-row" data-video-index="${i}">
      <div class="video-row-main">
        ${visual}
        <div class="video-row-copy">
          <h3>${esc(v[0])}</h3>
          <p>${esc(v[3])} · ${esc(v[2]||v[1])}</p>
          <div class="video-row-actions"><button class="ghost-btn open-video" type="button" data-i="${i}">Buka</button><button class="ghost-btn fav-video" type="button" data-i="${i}">${favorites.has(i)?"★ Favorit":"☆ Favorit"}</button><button class="ghost-btn list-video" type="button" data-i="${i}">${playlist.has(i)?"✓ Playlist":"＋ Playlist"}</button><button class="ghost-btn edit-video admin-only" type="button" data-i="${i}">✏ Edit</button><button class="ghost-btn delete-video admin-only" type="button" data-i="${i}">🗑 Hapus</button></div>
        </div>
      </div>
      ${includeMaterials?`<div class="video-materials"><div class="video-materials-title">Sub Materi (${subs.length})</div>${subs.length?subs.map(m=>{const mi=materials.indexOf(m);return `<div class="video-submaterial"><div><strong>${esc(m.title)}</strong><small>${esc(m.category||"Materi")}</small></div><div class="video-row-actions" style="margin-top:0"><button class="ghost-btn open-material" type="button" data-i="${mi}">Buka</button><button class="ghost-btn edit-material admin-only" type="button" data-i="${mi}">✏ Edit</button><button class="ghost-btn delete-material admin-only" type="button" data-i="${mi}">🗑 Hapus</button></div></div>`}).join(""):`<small style="color:#7f8892">Belum ada sub materi.</small>`}</div>`:""}
    </div>`
  }).join("")}</div>`
}
function wireRows(root){/* click ditangani oleh event delegation global agar tetap aktif setelah render ulang */}
function renderTutorial(){
  renderCarousel();
  renderMaterialsMini();
  if(videos[active])setActive(active,false,false);
}
function renderListPage(id){const root=$(id);if(!root)return;let arr=[],title="";if(id==="favorit"){arr=[...favorites];title="Favorit"}if(id==="playlist"){arr=[...playlist];title="Playlist Saya"}if(id==="riwayat"){arr=history.filter(i=>videos[i]);title="Riwayat"}root.innerHTML=`<h2>${title}</h2><p class="lead">${id==="riwayat"?"Tutorial yang terakhir dibuka.":"Koleksi video pilihanmu."}</p>${videoRows(arr)}`;wireRows(root)}
function populateCategorySelects(){
  [$("materialPageCategory"),$("newVideoCategory")].forEach(sel=>{
    if(!sel)return;
    const current=sel.value;
    sel.innerHTML='<option value="">Pilih kategori</option>'+CATEGORIES.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join("");
    if(CATEGORIES.includes(current))sel.value=current;
  });
}
let selectedCategory="";
function renderCategories(){
  const grid=$("gameCategoryGrid"), results=$("gameCategoryResults");
  if(!grid||!results)return;
  grid.innerHTML=GAME_CATEGORIES.map(cat=>{
    const count=games.filter(g=>g.category===cat&&g.status!=="hidden").length;
    return `<button class="game-category-card${selectedGameCategory===cat?" active":""}" data-game-cat="${esc(cat)}" type="button"><b>${esc(cat)}</b><small>${count} game</small></button>`;
  }).join("");
  grid.querySelectorAll("[data-game-cat]").forEach(b=>b.onclick=()=>{
    selectedGameCategory=b.dataset.gameCat;
    renderCategories();
  });
  const filtered=selectedGameCategory?games.filter(g=>g.category===selectedGameCategory&&g.status!=="hidden"):games.filter(g=>g.status!=="hidden");
  results.innerHTML=filtered.length?filtered.map(gameCardHTML).join(""):`<div class="page-empty">Belum ada game pada kategori ini.</div>`;
  bindGameActions(results);
}
function renderMaterialsMini(){
  const list=$("activeMaterialList");if(!list||!videos[active])return;
  const v=videos[active];
  const arr=materials.filter(m=>(m.videoTitle||m.video_title)===v[0]);
  if(!arr.length){
    list.innerHTML='<div class="info-material-empty">Materi tertulis untuk video ini belum ditambahkan.</div>';
    return;
  }
  list.innerHTML=`<div class="info-material-full-list">${arr.map((m)=>{
    const idx=materials.indexOf(m);
    const audio=materialAudioFor(m);
    return `<article class="info-material-full">
      <div class="info-material-full-head"><div><b>${esc(m.title||"Materi")}</b><small>${esc(m.category||"Materi")}</small></div>${isAdmin?`<div class="material-mini-admin"><button class="mini-btn edit-material" data-i="${idx}" type="button">✏</button><button class="mini-btn edit-material-audio" data-i="${idx}" type="button">♫</button><button class="mini-btn delete-material danger" data-i="${idx}" type="button">🗑</button></div>`:""}</div>
      ${m.summary?`<p class="info-material-summary">${esc(m.summary)}</p>`:""}
      <div class="info-material-body">${esc(m.content||"").replace(/\n/g,"<br>")}</div>
      ${audio?`<audio controls preload="none" src="${esc(audio)}"></audio>`:""}
    </article>`;
  }).join("")}</div>`;
}
function materialAudioFor(m){
  if(m?.audio_url)return m.audio_url;
  const title=m?.videoTitle||m?.video_title||"";
  const vi=videos.findIndex(v=>v[0]===title);
  return vi>=0?(videos[vi]._audioUrl||""):"";
}
function openMaterial(i){
  const m=materials[i];if(!m)return;
  currentMaterialDetailIndex=i;
  $("materialDetailVideo").textContent=m.videoTitle||m.video_title||"Materi video";
  $("materialDetailCategory").textContent=m.category||"Materi";
  $("materialDetailTitle").textContent=m.title;
  $("materialDetailSummary").textContent=m.summary||"";
  $("materialDetailBody").textContent=m.content||"";
  const audio=$("materialAudioPlayer"),box=$("materialAudioBox"),src=materialAudioFor(m);
  if(audio){audio.pause();audio.removeAttribute("src");if(src){audio.src=src;audio.load();box?.classList.remove("no-audio")}else box?.classList.add("no-audio")}
  showPage("materi-detail");
}
$("openMaterialDetail")?.addEventListener("click",()=>{
  const i=materials.findIndex(m=>(m.videoTitle||m.video_title)===videos[active][0]);
  if(i>=0){openMaterial(i);return;}
  currentMaterialDetailIndex=null;
  const v=videos[active];
  $("materialDetailVideo").textContent=v[0];
  $("materialDetailCategory").textContent=v[3]||"Tutorial";
  $("materialDetailTitle").textContent="Materi: "+v[0];
  $("materialDetailSummary").textContent="Materi tertulis untuk video ini belum ditambahkan oleh admin.";
  $("materialDetailBody").textContent="Video ini tetap dapat dipelajari dari Dashboard. Setelah admin menambahkan materi tertulis, isi lengkapnya akan tampil di halaman ini.";
  showPage("materi-detail");
});
$("materialDetailBack")?.addEventListener("click",()=>showPage("tutorial"));
$("detailEditMaterialBtn")?.addEventListener("click",()=>currentMaterialDetailIndex!==null&&openMaterialEditor(currentMaterialDetailIndex));
$("detailEditAudioBtn")?.addEventListener("click",()=>currentMaterialDetailIndex!==null&&openMaterialAudioEditor(currentMaterialDetailIndex));
$("detailDeleteMaterialBtn")?.addEventListener("click",()=>currentMaterialDetailIndex!==null&&deleteMaterial(currentMaterialDetailIndex));

function renderMaterialLibrary(){
  const root=$("materialLibraryGrid");if(!root)return;
  if(!materials.length){root.innerHTML='<div class="page-empty">Belum ada materi.</div>';return}
  root.innerHTML=materials.map((m,i)=>{
    const audio=materialAudioFor(m);
    return `<article class="material-library-card">
      <span class="preview-category">${esc(m.category||"Materi")}</span>
      <h3>${esc(m.title||"Materi")}</h3>
      <p>${esc(m.summary||m.content||"Materi tertulis Buddhist.")}</p>
      ${audio?`<audio class="material-audio-inline" controls preload="none" src="${esc(audio)}"></audio>`:`<div class="page-empty" style="padding:8px 0">Audio belum ditambahkan.</div>`}
      <div class="card-actions material-admin-actions" style="display:flex">
        <button class="mini-btn open-material" data-i="${i}" type="button">Buka Materi</button>
        ${isAdmin?`<button class="mini-btn edit-material" data-i="${i}" type="button">✏ Edit</button><button class="mini-btn edit-material-audio" data-i="${i}" type="button">♫ Audio</button>${m.audio_url?`<button class="mini-btn delete-material-audio danger" data-i="${i}" type="button">Hapus Audio</button>`:""}<button class="mini-btn delete-material danger" data-i="${i}" type="button">🗑 Hapus</button>`:""}
      </div>
    </article>`;
  }).join("");
}
function renderFAQ(){const l=$("faqList");if(!l)return;l.innerHTML=faqs.length?faqs.map((x,i)=>`<article class="doc-item clickable-doc faq-doc" tabindex="0" data-doc-index="${i}"><h3>${esc(x.question||x.q)}</h3><span class="doc-hint">Klik untuk buka jawaban</span><div class="doc-answer"><p class="faq-answer-text">${esc(x.answer||x.a)}</p>${x.important_note?`<div class="faq-important"><b>💡 Catatan penting</b><div class="faq-important-text">${esc(x.important_note)}</div></div>`:""}</div><div class="doc-admin-row"><button class="ghost-btn doc-edit-btn edit-faq admin-only" type="button" data-i="${i}">✏ Edit FAQ</button><button class="ghost-btn doc-delete-btn delete-faq admin-only" type="button" data-i="${i}">🗑 Hapus FAQ</button></div></article>`).join(""):`<div class="page-empty">Belum ada FAQ.</div>`}
function renderNotes(){const l=$("NotesList");if(!l)return;l.innerHTML=Notes.map((x,i)=>`<article class="doc-item clickable-doc Notes-doc" tabindex="0" data-doc-index="${i}"><h3>${esc(x.title)}</h3><span class="doc-hint">Klik untuk buka SOP</span><div class="doc-answer"><p class="notes-content">${esc(x.content)}</p></div><div class="doc-admin-row"><button class="ghost-btn doc-edit-btn edit-Notes admin-only" type="button" data-i="${i}">✏ Edit SOP</button><button class="ghost-btn doc-delete-btn delete-Notes admin-only" type="button" data-i="${i}">🗑 Hapus SOP</button></div></article>`).join("")}

function gameCardHTML(g){
  const cover=g.thumbnail_url||"assets/thumb-target-3.jpg";
  const status=g.status||"coming_soon";
  const label=status==="active"?"Active":status==="hidden"?"Hidden":"Coming Soon";
  return `<article class="game-card" data-game-id="${g.id||""}">
    <div class="game-cover"><img src="${esc(cover)}" alt="${esc(g.title||"Game")}"></div>
    <div class="game-copy">
      <h3>${esc(g.title||"Game")}</h3>
      <span class="game-badge ${esc(status)}">${esc(g.category||"Other")} · ${label}</span>
      <p>${esc(g.description||"Game Buddhist.")}</p>
      <div class="game-meta">
        ${g.game_url&&status==="active"?`<a class="mini-btn" href="${esc(g.game_url)}" target="_blank" rel="noopener">Mainkan</a>`:`<span class="game-badge">${status==="coming_soon"?"Segera hadir":"Belum tersedia"}</span>`}
      </div>
      <div class="game-actions">
        <button class="mini-btn edit-game" data-id="${g.id}" type="button">✏ Edit</button>
        <button class="mini-btn delete-game" data-id="${g.id}" type="button">🗑 Hapus</button>
      </div>
    </div>
  </article>`;
}
function bindGameActions(root){
  root?.querySelectorAll(".edit-game").forEach(b=>b.onclick=()=>openGameEditor(Number(b.dataset.id)));
  root?.querySelectorAll(".delete-game").forEach(b=>b.onclick=()=>deleteGame(Number(b.dataset.id)));
}
function renderGames(){
  const root=$("gameList");if(!root)return;
  const visible=isAdmin?games:games.filter(g=>g.status!=="hidden");
  root.innerHTML=visible.length?visible.map(gameCardHTML).join(""):'<div class="page-empty">Belum ada game. Admin dapat menambahkan game pertama.</div>';
  bindGameActions(root);
}
function resetGameForm(){
  editingGameId=null;
  if($("gameTitle"))$("gameTitle").value="";
  if($("gameCategory"))$("gameCategory").value="Hospital";
  if($("gameDescription"))$("gameDescription").value="";
  if($("gameThumbnailUrl"))$("gameThumbnailUrl").value="";
  if($("gameUrl"))$("gameUrl").value="";
  if($("gameStatus"))$("gameStatus").value="coming_soon";if($("gameThumbnailFile"))$("gameThumbnailFile").value="";
  if($("saveGame"))$("saveGame").textContent="Simpan";
}
function openGameEditor(id){
  if(!isAdmin)return openAuth("Login Admin diperlukan.");
  const g=games.find(x=>Number(x.id)===Number(id));if(!g)return;
  editingGameId=g.id;
  $("gameTitle").value=g.title||"";
  $("gameCategory").value=g.category||"Other";
  $("gameDescription").value=g.description||"";
  $("gameThumbnailUrl").value=g.thumbnail_url||"";
  $("gameUrl").value=g.game_url||"";
  $("gameStatus").value=g.status||"coming_soon";
  $("gameForm")?.classList.add("open");
  if($("saveGame"))$("saveGame").textContent="✓ Simpan Perubahan";
}
$("openGameForm")?.addEventListener("click",()=>requireAdmin(()=>{resetGameForm();$("gameForm")?.classList.add("open")}));
$("cancelGame")?.addEventListener("click",()=>{resetGameForm();$("gameForm")?.classList.remove("open")});
$("saveGame")?.addEventListener("click",async()=>{
  if(!isAdmin||!sb)return openAuth();
  const uploadedGameThumb=await uploadMedia($("gameThumbnailFile")?.files?.[0],"game-thumbnails");
  const row={
    title:$("gameTitle").value.trim(),
    category:$("gameCategory").value,
    description:$("gameDescription").value.trim(),
    thumbnail_url:uploadedGameThumb||$("gameThumbnailUrl").value.trim()||null,
    game_url:$("gameUrl").value.trim()||null,
    status:$("gameStatus").value
  };
  if(!row.title)return say("Nama game wajib diisi");
  let error;
  if(editingGameId)({error}=await sb.from("buddhist_games").update(row).eq("id",editingGameId));
  else({error}=await sb.from("buddhist_games").insert(row));
  if(error)return say("Gagal menyimpan game: "+error.message);
  await logPlayerActivity(editingGameId?"game_edit":"game_add","game",row.title,`${row.category} · ${row.status}`);
  if(!editingGameId)await broadcastContentNotification("Game baru",row.title,"game");
  resetGameForm();$("gameForm")?.classList.remove("open");await loadRemote();renderGames();say("Game tersimpan");
});
async function deleteGame(id){
  if(!isAdmin||!sb)return;
  const g=games.find(x=>Number(x.id)===Number(id));if(!g||!confirm(`Hapus game “${g.title}”?`))return;
  const {error}=await sb.from("buddhist_games").delete().eq("id",id);
  if(error)return say("Gagal menghapus game");
  await loadRemote();renderGames();say("Game dihapus");
}
function requireAdmin(action){if(isAdmin){action();return true}if(currentSession){say("Akun Viewer tidak punya izin Admin");return false}openAuth("Login diperlukan. Akun Viewer hanya dapat melihat konten.");return false}
async function deleteFaq(i){
  if(!isAdmin)return openAuth();
  const x=faqs[i];if(!x)return;
  if(!confirm(`Hapus FAQ “${x.question||x.q||"ini"}”?`))return;
  if(sb&&x.id){
    try{
      const {data,error}=await sb.from("buddhist_faq").delete().eq("id",x.id).select("id");
      if(error)throw error;
      if(!data?.length){say("FAQ belum terhapus — cek policy DELETE Supabase");return}
      faqs.splice(i,1);persist();renderFAQ();
      await loadRemote();
      say("FAQ dihapus");
      return;
    }catch(e){console.error(e);say("Gagal menghapus FAQ: "+(e.message||"izin ditolak"));return}
  }
  faqs.splice(i,1);persist();renderFAQ();say("FAQ dihapus");
}

function openMaterialAudioEditor(i){
  openMaterialEditor(i);
  setTimeout(()=>{
    $("materialAudioUrl")?.focus();
    $("materialAudioUrl")?.scrollIntoView({behavior:"smooth",block:"center"});
    say("Ubah URL audio atau upload audio baru, lalu Simpan Perubahan Materi.");
  },120);
}
async function deleteMaterialAudio(i){
  if(!isAdmin)return openAuth();
  const m=materials[i];if(!m)return;
  if(!m.audio_url)return say("Materi ini tidak punya audio khusus.");
  if(!confirm(`Hapus audio dari materi “${m.title||"ini"}”? Tulisan materi tetap aman.`))return;

  if(sb&&m.id){
    const {error}=await sb.from("buddhist_materials").update({audio_url:null}).eq("id",m.id);
    if(error)return say("Gagal menghapus audio: "+error.message);
    await loadRemote();
  }else{
    materials[i]={...m,audio_url:""};
    persist();
  }

  renderTutorial();renderMaterialsMini();renderMaterialLibrary();
  if(currentMaterialDetailIndex===i)openMaterial(i);
  say("Audio dihapus. Materi tertulis tetap disimpan.");
}

async function deleteMaterial(i){
  if(!isAdmin)return openAuth();
  const m=materials[i];if(!m)return;
  if(!confirm(`Hapus materi “${m.title||"ini"}”?`))return;
  if(sb&&m.id){
    try{
      const {error}=await sb.from("buddhist_materials").delete().eq("id",m.id);
      if(error)throw error;
      await loadRemote();
    }catch(e){console.error(e);say("Gagal menghapus materi");return}
  }else{
    materials.splice(i,1);persist();
  }
  if(currentMaterialDetailIndex===i){currentMaterialDetailIndex=null;showPage("materials-library")}else if(currentMaterialDetailIndex!==null&&currentMaterialDetailIndex>i){currentMaterialDetailIndex--}
  renderTutorial();renderMaterialsMini();renderMaterialLibrary();
  say("Materi berhasil dihapus");
}
async function deleteNotes(i){
  if(!isAdmin)return openAuth();
  const x=Notes[i];if(!x)return;
  if(!confirm(`Hapus SOP “${x.title||"ini"}”?`))return;
  if(sb&&x.id){try{const {error}=await sb.from("buddhist_sop").delete().eq("id",x.id);if(error)throw error;await loadRemote();say("SOP dihapus");return}catch(e){console.error(e);say("Gagal menghapus Notes");return}}
  Notes.splice(i,1);persist();renderNotes();say("SOP dihapus");
}
function resetFaqForm(){
  editingFaqIndex=null;
  if($("faqQuestion"))$("faqQuestion").value="";
  if($("faqAnswer"))$("faqAnswer").value="";
  if($("faqImportantNote"))$("faqImportantNote").value="";
  if($("saveFaq"))$("saveFaq").textContent="Simpan";
}
function openFaqEditor(i){
  if(!isAdmin)return openAuth();
  const x=faqs[i];
  if(!x)return;
  editingFaqIndex=i;
  $("faqQuestion").value=x.question||x.q||"";
  $("faqAnswer").value=x.answer||x.a||"";
  if($("faqImportantNote"))$("faqImportantNote").value=x.important_note||"";
  if($("saveFaq"))$("saveFaq").textContent="✓ Simpan Perubahan";
  $("faqForm")?.classList.add("open");
  $("faqQuestion")?.focus();
  $("faqForm")?.scrollIntoView({behavior:"smooth",block:"center"});
}
$("openFaqForm")?.addEventListener("click",()=>requireAdmin(()=>{
  resetFaqForm();
  $("faqForm").classList.add("open");
}));
$("cancelFaq")?.addEventListener("click",()=>{
  resetFaqForm();
  $("faqForm")?.classList.remove("open");
});
$("saveFaq")?.addEventListener("click",async()=>{
  if(!isAdmin)return openAuth();
  const q=$("faqQuestion").value.trim();
  const a=$("faqAnswer").value.trim();
  const note=$("faqImportantNote")?.value.trim()||"";
  if(!q||!a)return say("Isi pertanyaan dan jawaban");
  const obj={question:q,answer:a,important_note:note};

  if(editingFaqIndex!==null){
    const i=editingFaqIndex;
    const old=faqs[i];
    if(!old)return resetFaqForm();

    if(sb&&old.id){
      try{
        const {error}=await sb.from("buddhist_faq").update(obj).eq("id",old.id);
        if(error)throw error;
        await loadRemote();
      }catch(e){
        console.error(e);
        say("Gagal mengedit FAQ");
        return;
      }
    }else{
      faqs[i]={...old,...obj};
      persist();
    }

    resetFaqForm();
    $("faqForm")?.classList.remove("open");
    renderFAQ();
    say("FAQ berhasil diperbarui");
    return;
  }

  const rr=await remoteInsert("buddhist_faq",obj);
  if(rr===false)return;
  if(rr===null){
    faqs.unshift(obj);
    persist();
  }
  resetFaqForm();
  $("faqForm").classList.remove("open");
  renderFAQ();
  say("FAQ disimpan");
});
function resetNotesForm(){
  editingNotesIndex=null;
  if($("NotesTitle"))$("NotesTitle").value="";
  if($("NotesContent"))$("NotesContent").value="";
  if($("saveNotes"))$("saveNotes").textContent="Simpan";
}
function openNotesEditor(i){
  if(!isAdmin)return openAuth();
  const x=Notes[i];
  if(!x)return;
  editingNotesIndex=i;
  $("NotesTitle").value=x.title||"";
  $("NotesContent").value=x.content||"";
  if($("saveNotes"))$("saveNotes").textContent="✓ Simpan Perubahan";
  $("NotesForm")?.classList.add("open");
  $("NotesTitle")?.focus();
  $("NotesForm")?.scrollIntoView({behavior:"smooth",block:"center"});
}
$("openNotesForm")?.addEventListener("click",()=>requireAdmin(()=>{
  resetNotesForm();
  $("NotesForm").classList.add("open");
}));
$("cancelNotes")?.addEventListener("click",()=>{
  resetNotesForm();
  $("NotesForm")?.classList.remove("open");
});
$("saveNotes")?.addEventListener("click",async()=>{
  if(!isAdmin)return openAuth();

  const title=$("NotesTitle").value.trim();
  const content=$("NotesContent").value.trim();
  if(!title||!content)return say("Isi judul dan SOP");

  const obj={title,content};

  if(editingNotesIndex!==null){
    const i=editingNotesIndex;
    const old=Notes[i];
    if(!old)return resetNotesForm();

    if(sb&&old.id){
      try{
        const {error}=await sb.from("buddhist_sop").update(obj).eq("id",old.id);
        if(error)throw error;
        await loadRemote();
      }catch(e){
        console.error(e);
        say("Gagal mengedit SOP");
        return;
      }
    }else{
      Notes[i]={...old,...obj};
      persist();
    }

    resetNotesForm();
    $("NotesForm")?.classList.remove("open");
    renderNotes();
    say("SOP berhasil diperbarui");
    return;
  }

  const rr=await remoteInsert("buddhist_sop",obj);
  if(rr===false)return;
  if(rr===null){
    Notes.unshift(obj);
    persist();
  }

  resetNotesForm();
  $("NotesForm")?.classList.remove("open");
  renderNotes();
  say("SOP disimpan");
});
function populateMaterialParentSelect(selected=""){
  const sel=$("materialParentVideo");if(!sel)return;
  sel.innerHTML='<option value="">Pilih video untuk sub materi</option>'+videos.map((v,i)=>`<option value="${i}">${esc(v[0])}</option>`).join("");
  if(selected!==""&&selected!==null&&selected!==undefined)sel.value=String(selected);
}
function resetMaterialForm(){
  editingMaterialIndex=null;
  if($("materialParentVideo"))$("materialParentVideo").disabled=false;
  populateMaterialParentSelect("");
  ["materialPageTitle","materialSummary","materialContent","materialCoverUrl"].forEach(id=>{if($(id))$(id).value=""});
  if($("materialPageCategory"))$("materialPageCategory").value="";
  if($("materialAttachment"))$("materialAttachment").value="";if($("materialAudioUrl"))$("materialAudioUrl").value="";if($("materialAudioFile"))$("materialAudioFile").value="";if($("materialCoverFile"))$("materialCoverFile").value="";
  if($("saveMaterial"))$("saveMaterial").innerHTML="▣ &nbsp; Simpan Materi Baru";
  $("materialEditNote")?.classList.remove("show");
  syncMaterialPreview();
}
function openMaterialEditor(i){
  if(!isAdmin)return openAuth("Login admin dulu untuk mengedit materi.");
  const m=materials[i];if(!m)return;
  editingMaterialIndex=i;
  showPage("tambah-konten");selectTab("materi");
  const parentTitle=m.videoTitle||m.video_title||"";
  const parentIndex=videos.findIndex(v=>v[0]===parentTitle);
  populateMaterialParentSelect(parentIndex>=0?parentIndex:"");
  $("materialPageTitle").value=m.title||"";
  if($("materialCoverUrl"))$("materialCoverUrl").value=m.cover_url||"";
  $("materialPageCategory").value=m.category||"";
  $("materialSummary").value=m.summary||"";
  $("materialContent").value=m.content||"";if($("materialAudioUrl"))$("materialAudioUrl").value=m.audio_url||"";
  if($("saveMaterial"))$("saveMaterial").textContent="✓ Simpan Perubahan Materi";
  $("materialEditNote")?.classList.add("show");
  syncMaterialPreview();
}
function resetVideoForm(){editingVideoIndex=null;["newVideoTitle","newVideoDescription","newVideoDuration","newVideoUrl","newVideoTags","newVideoThumbnailUrl"].forEach(id=>{if($(id))$(id).value=""});if($("newVideoCategory"))$("newVideoCategory").value="";if($("newVideoLanguage"))$("newVideoLanguage").value="Indonesia";if($("newVideoThumbnail"))$("newVideoThumbnail").value="";if($("newVideoFile"))$("newVideoFile").value="";if($("saveVideo"))$("saveVideo").innerHTML="▣ &nbsp; Simpan Video";$("videoEditNote")?.classList.remove("show");const box=$("videoThumbPreview");if(box){box.style.backgroundImage="";const sm=box.querySelector("small");if(sm)sm.textContent="Thumbnail video akan muncul di sini"}syncVideoPreview()}
function openVideoEditor(i){if(!isAdmin)return openAuth("Login admin dulu untuk mengedit video.");const v=videos[i];if(!v)return;editingVideoIndex=i;showPage("tambah-konten");selectTab("video");$("newVideoTitle").value=v[0]||"";$("newVideoCategory").value=v[3]||"";$("newVideoDescription").value=v._description||"";$("newVideoDuration").value=v[1]||"";$("newVideoLanguage").value=v._language||"Indonesia";$("newVideoUrl").value=v._videoUrl||"";$("newVideoTags").value=(v._tags||[]).join(", ");$("newVideoThumbnailUrl").value=v._thumb||"";if($("saveVideo"))$("saveVideo").textContent="✓ Simpan Perubahan";$("videoEditNote")?.classList.add("show");const box=$("videoThumbPreview");if(box&&v._thumb){box.style.backgroundImage=`linear-gradient(#0005,#0005),url("${v._thumb}")`;const sm=box.querySelector("small");if(sm)sm.textContent="Thumbnail saat ini"}syncVideoPreview()}
function openTambah(tab="video"){if(!isAdmin)return openAuth("Login admin dulu untuk menambah konten.");if(tab==="video")resetVideoForm();if(tab==="materi")resetMaterialForm();showPage("tambah-konten");selectTab(tab)}
$("addMaterialBtn")?.addEventListener("click",()=>openTambah("video"));$("libraryAddMaterial")?.addEventListener("click",()=>openTambah("video"));$("materialPickerBack")?.addEventListener("click",()=>showPage("materials-library"));$("contentBack")?.addEventListener("click",()=>showPage("tutorial"));$("cancelMaterial")?.addEventListener("click",()=>showPage("tutorial"));$("cancelVideo")?.addEventListener("click",()=>showPage("tutorial"));
$$("[data-content-tab]").forEach(b=>b.addEventListener("click",()=>selectTab(b.dataset.contentTab)));function selectTab(tab){$$("[data-content-tab]").forEach(b=>b.classList.toggle("active",b.dataset.contentTab===tab));$("tab-materi")?.classList.toggle("active",tab==="materi");$("tab-video")?.classList.toggle("active",tab==="video")}
function syncMaterialPreview(){if($("previewMaterialTitle"))$("previewMaterialTitle").textContent=$("materialPageTitle")?.value||"Judul Materi";if($("previewMaterialCategory"))$("previewMaterialCategory").textContent=$("materialPageCategory")?.value||"Kategori";if($("previewMaterialSummary"))$("previewMaterialSummary").textContent=$("materialSummary")?.value||"Ringkasan materi akan tampil di sini.";if($("previewMaterialContent"))$("previewMaterialContent").textContent=$("materialContent")?.value||"Isi materi akan tampil di sini."}
["materialPageTitle","materialPageCategory","materialSummary","materialContent"].forEach(id=>$(id)?.addEventListener("input",syncMaterialPreview));
$("saveMaterial")?.addEventListener("click",async()=>{
  if(!isAdmin)return openAuth();
  const parentRaw=$("materialParentVideo")?.value ?? "";
  if(parentRaw==="")return say("Pilih video induk untuk sub materi");
  const parentIndex=Number(parentRaw);
  if(!Number.isInteger(parentIndex)||!videos[parentIndex])return say("Pilih video induk untuk sub materi");
  const targetTitle=videos[parentIndex][0];
  const obj={videoTitle:targetTitle,title:$("materialPageTitle").value.trim(),category:$("materialPageCategory").value,summary:$("materialSummary").value.trim(),content:$("materialContent").value.trim()};
  if(!obj.title||!obj.category||!obj.content)return say("Judul, kategori, dan isi materi wajib diisi");
  const existing=editingMaterialIndex!==null?materials[editingMaterialIndex]:null;
  const attachment=await uploadMedia($("materialAttachment")?.files?.[0],"materials");
  const coverUpload=await uploadMedia($("materialCoverFile")?.files?.[0],"material-covers");
  const coverUrl=coverUpload||$("materialCoverUrl")?.value.trim()||existing?.cover_url||"";
  const audioUpload=await uploadMedia($("materialAudioFile")?.files?.[0],"material-audio");
  const audioUrl=audioUpload||$("materialAudioUrl")?.value.trim()||existing?.audio_url||"";
  const remote={video_title:obj.videoTitle,title:obj.title,category:obj.category,summary:obj.summary,content:obj.content,audio_url:audioUrl||null,cover_url:coverUrl||null};
  if(attachment)remote.attachment_url=attachment;
  else if(existing?.attachment_url)remote.attachment_url=existing.attachment_url;

  if(editingMaterialIndex!==null){
    if(sb&&existing?.id){
      try{const {error}=await sb.from("buddhist_materials").update(remote).eq("id",existing.id);if(error)throw error;await loadRemote()}catch(e){console.error(e);say("Gagal mengubah materi");return}
    }else{
      materials[editingMaterialIndex]={...existing,...obj,attachment_url:remote.attachment_url||"",audio_url:remote.audio_url||"",cover_url:remote.cover_url||""};persist();
    }
    active=parentIndex;
    resetMaterialForm();
    showPage("tutorial");renderTutorial();
    say("Materi berhasil diperbarui");
    return;
  }

  const savedRemote=await remoteInsert("buddhist_materials",remote);
  if(savedRemote===false)return;
  if(savedRemote===null){materials.push({...obj,attachment_url:attachment,audio_url:remote.audio_url||"",cover_url:remote.cover_url||""});persist()}
  active=parentIndex;
  pendingTutorialVideoTitle="";
  if($("materialParentVideo"))$("materialParentVideo").disabled=false;
  resetMaterialForm();
  showPage("tutorial");renderTutorial();
  say("Video dan materi berhasil disimpan dan sudah terhubung");
});
function formatVideoDuration(seconds){
  seconds=Math.max(0,Math.round(Number(seconds)||0));
  const h=Math.floor(seconds/3600),m=Math.floor((seconds%3600)/60),sec=seconds%60;
  return h?`${h}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`:`${m}:${String(sec).padStart(2,"0")}`;
}
function setAutoVideoDuration(seconds){
  const text=formatVideoDuration(seconds);if(!seconds||!text)return;
  if($("newVideoDuration"))$("newVideoDuration").value=text;syncVideoPreview();
}
function durationFromMediaUrl(url){
  return new Promise(resolve=>{const v=document.createElement("video");v.preload="metadata";v.muted=true;v.playsInline=true;
    const done=x=>{try{v.removeAttribute("src");v.load()}catch(_){}resolve(x||0)};
    v.onloadedmetadata=()=>done(Number.isFinite(v.duration)?v.duration:0);v.onerror=()=>done(0);v.src=url;
  });
}
let ytApiPromise=null;
function ensureYouTubeApi(){
  if(window.YT?.Player)return Promise.resolve();
  if(ytApiPromise)return ytApiPromise;
  ytApiPromise=new Promise(resolve=>{const prev=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=()=>{try{prev?.()}catch(_){}resolve()};const sc=document.createElement("script");sc.src="https://www.youtube.com/iframe_api";document.head.appendChild(sc);setTimeout(resolve,7000)});return ytApiPromise;
}
async function durationFromVideoUrl(url){
  const src=parseVideoSource(url);if(!src)return 0;
  if(src.type==="youtube"){
    const id=(src.src.match(/\/embed\/([^?]+)/)||[])[1];if(!id)return 0;
    await ensureYouTubeApi();if(!window.YT?.Player)return 0;
    return await new Promise(resolve=>{const holder=document.createElement("div");holder.style.cssText="position:fixed;left:-9999px;top:-9999px;width:1px;height:1px";document.body.appendChild(holder);let p,t=setTimeout(()=>{try{p?.destroy()}catch(_){}holder.remove();resolve(0)},8000);try{p=new YT.Player(holder,{videoId:decodeURIComponent(id),events:{onReady:e=>{clearTimeout(t);const d=e.target.getDuration()||0;try{e.target.destroy()}catch(_){}holder.remove();resolve(d)},onError:()=>{clearTimeout(t);try{p?.destroy()}catch(_){}holder.remove();resolve(0)}}})}catch(_){clearTimeout(t);holder.remove();resolve(0)}});
  }
  if(src.type==="file")return await durationFromMediaUrl(src.src);
  return 0;
}
let pendingTutorialVideoTitle="";
function syncVideoPreview(){if($("previewVideoTitle"))$("previewVideoTitle").textContent=$("newVideoTitle")?.value||"Judul Video";if($("previewVideoCategory"))$("previewVideoCategory").textContent=$("newVideoCategory")?.value||"Kategori";if($("previewVideoDuration"))$("previewVideoDuration").textContent=$("newVideoDuration")?.value||"0:00"}
function syncVideoLinkPreview(){
  const videoUrl=$("newVideoUrl")?.value||"";
  const box=document.querySelector(".video-fake-player");
  const src=parseVideoSource(videoUrl);
  if(box){
    if(!src)box.innerHTML='<div class="wave"></div><div class="wave2"></div><button type="button">▶</button>';
    else if(src.type==="youtube"||src.type==="vimeo")box.innerHTML=`<iframe src="${esc(src.src)}" title="Preview video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width:100%;height:100%;border:0"></iframe>`;
    else box.innerHTML=`<video src="${esc(src.src)}" controls playsinline style="width:100%;height:100%;object-fit:contain;background:#000"></video>`;
  }
  // Kalau link YouTube dipakai tanpa thumbnail manual, otomatis pakai cover video YouTube.
  if(!$("newVideoThumbnailUrl")?.value.trim()&&!$("newVideoThumbnail")?.files?.length){
    const autoThumb=youtubeThumbnailFromUrl(videoUrl),preview=$("videoThumbPreview");
    if(preview){
      preview.style.backgroundImage=autoThumb?`linear-gradient(#0005,#0005),url(${JSON.stringify(autoThumb)})`:"";
      const sm=preview.querySelector("small");if(sm)sm.textContent=autoThumb?"Cover otomatis dari video YouTube":"Thumbnail video akan muncul di sini";
    }
  }
}
["newVideoTitle","newVideoCategory","newVideoDuration"].forEach(id=>$(id)?.addEventListener("input",syncVideoPreview));
let durationUrlTimer=null;
$("newVideoUrl")?.addEventListener("input",()=>{syncVideoLinkPreview();clearTimeout(durationUrlTimer);durationUrlTimer=setTimeout(async()=>{const u=$("newVideoUrl")?.value.trim();if(!u)return;const d=await durationFromVideoUrl(u);if(d)setAutoVideoDuration(d)},650)});
$("newVideoThumbnail")?.addEventListener("change",e=>{const f=e.target.files?.[0];if(!f)return;const u=URL.createObjectURL(f);const box=$("videoThumbPreview");if(box){box.style.backgroundImage=`linear-gradient(#0005,#0005),url("${u}")`;box.querySelector("small").textContent=f.name}});
$("newVideoThumbnailUrl")?.addEventListener("input",e=>{const u=e.target.value.trim();const box=$("videoThumbPreview");if(box){box.style.backgroundImage=u?`linear-gradient(#0005,#0005),url("${u}")`:"";const sm=box.querySelector("small");if(sm)sm.textContent=u?"Preview dari URL":"Thumbnail video akan muncul di sini"}});
$("newVideoFile")?.addEventListener("change",e=>{const f=e.target.files?.[0];if(!f)return;say("Video dipilih: "+f.name);const u=URL.createObjectURL(f),v=document.createElement("video");v.preload="metadata";v.onloadedmetadata=()=>{setAutoVideoDuration(v.duration);URL.revokeObjectURL(u)};v.onerror=()=>URL.revokeObjectURL(u);v.src=u});
$("saveVideo")?.addEventListener("click",async()=>{
  if(!isAdmin)return openAuth();
  const title=$("newVideoTitle").value.trim(),cat=$("newVideoCategory").value,dur=$("newVideoDuration").value.trim()||"0:00",desc=$("newVideoDescription").value.trim();
  if(!title||!cat)return say("Judul dan kategori video wajib diisi");
  const old=editingVideoIndex!==null?videos[editingVideoIndex]:null;
  const oldTitle=old?.[0]||"";
  let thumbUrl=$("newVideoThumbnailUrl")?.value.trim()||old?._thumb||"",videoUrl=$("newVideoUrl")?.value.trim()||old?._videoUrl||"";
  if(!thumbUrl)thumbUrl=youtubeThumbnailFromUrl(videoUrl);
  if(sb&&isAdmin){
    const uploadedThumb=await uploadMedia($("newVideoThumbnail")?.files?.[0],"thumbnails");if(uploadedThumb)thumbUrl=uploadedThumb;
    const uploadedVideo=await uploadMedia($("newVideoFile")?.files?.[0],"videos");if(uploadedVideo)videoUrl=uploadedVideo;
  }
  const remote={title,category:cat,description:desc,duration:dur,duration_label:dur,language:$("newVideoLanguage")?.value||"Indonesia",thumbnail_url:thumbUrl,video_url:videoUrl,tags:($("newVideoTags")?.value||"").split(",").map(x=>x.trim()).filter(Boolean),is_deleted:false};
  if(editingVideoIndex!==null){
    if(old?._baseKey)remote.base_key=old._baseKey;
    if(sb&&isAdmin){
      let error=null;
      if(old?._id){({error}=await sb.from("buddhist_videos").update(remote).eq("id",old._id));}
      else if(old?._baseKey){({error}=await sb.from("buddhist_videos").upsert(remote,{onConflict:"base_key"}));}
      else{({error}=await sb.from("buddhist_videos").insert(remote));}
      if(error){console.error(error);say("Gagal menyimpan perubahan video");return}
      if(oldTitle&&oldTitle!==title){const {error:me}=await sb.from("buddhist_materials").update({video_title:title}).eq("video_title",oldTitle);if(me)console.warn(me)}
      await loadRemote();
    }else{const v=videos[editingVideoIndex];v[0]=title;v[1]=dur;v[2]=dur;v[3]=cat;v._description=desc;v._thumb=thumbUrl;v._videoUrl=videoUrl;persist();renderCarousel()}
    active=Math.max(0,Math.min(editingVideoIndex,videos.length-1));resetVideoForm();setActive(active,false,true);showPage("tutorial");say("Perubahan video disimpan");return;
  }
  if(sb&&isAdmin){const {error}=await sb.from("buddhist_videos").insert(remote);if(error){console.error(error);say("Gagal menyimpan video");return}await loadRemote();active=videos.length-1}else{const a=[title,dur,dur,cat];a._description=desc;a._thumb=thumbUrl;a._videoUrl=videoUrl;a._language=remote.language;a._tags=remote.tags;videos.push(a);persist();active=videos.length-1;renderCarousel()}
  pendingTutorialVideoTitle=title;
  const exactIndex=videos.findIndex(v=>v[0]===title);
  if(exactIndex>=0)active=exactIndex;
  resetVideoForm();resetMaterialForm();showPage("tambah-konten");selectTab("materi");
  populateMaterialParentSelect(exactIndex>=0?exactIndex:active);
  if($("materialParentVideo")){ $("materialParentVideo").disabled=true; }
  if($("saveMaterial"))$("saveMaterial").innerHTML="▣ &nbsp; Simpan Video + Materi";
  say("Video sudah siap. Sekarang isi materinya lalu simpan.");
});
async function deleteVideo(i){
  if(!isAdmin)return openAuth("Login admin dulu untuk menghapus video.");
  const v=videos[i];if(!v)return;
  if(!confirm(`Hapus video “${v[0]}” beserta materi tertulisnya?`))return;
  if(sb&&isAdmin){
    let error=null;
    if(v._baseKey){const payload={base_key:v._baseKey,title:v[0],category:v[3]||"Tutorial",duration:v[1]||"5:00",duration_label:v[2]||v[1]||"5:00",is_deleted:true};if(v._id)({error}=await sb.from("buddhist_videos").update(payload).eq("id",v._id));else({error}=await sb.from("buddhist_videos").upsert(payload,{onConflict:"base_key"}));}
    else if(v._id){({error}=await sb.from("buddhist_videos").delete().eq("id",v._id));}
    if(error){console.error(error);say("Gagal menghapus video");return}
    const {error:me}=await sb.from("buddhist_materials").delete().eq("video_title",v[0]);if(me)console.warn(me);
    await loadRemote();
  }else{videos.splice(i,1);materials=materials.filter(m=>(m.videoTitle||m.video_title)!==v[0]);persist();renderCarousel()}
  active=Math.max(0,Math.min(active,videos.length-1));if(videos.length)setActive(active,false,false);say("Video dihapus");
}

const search=$("globalSearch"),results=$("searchResults");
if(search&&results){
  search.addEventListener("input",()=>{
    const q=search.value.trim().toLowerCase();
    if(!q){
      results.innerHTML="";
      results.classList.remove("show");
      return;
    }

    const found=[];

    videos.forEach((v,i)=>{
      const hay=[v?.[0],v?.[3],v?._description,...(Array.isArray(v?._tags)?v._tags:[])]
        .filter(Boolean).join(" ").toLowerCase();
      if(hay.includes(q)){
        found.push({type:"video",i,title:v?.[0]||"Video",meta:`VIDEO · ${v?.[3]||"Tutorial"}`});
      }
    });

    faqs.forEach((x,i)=>{
      const title=x?.question||x?.q||"FAQ";
      const hay=[title,x?.answer||x?.a,x?.important_note]
        .filter(Boolean).join(" ").toLowerCase();
      if(hay.includes(q)){
        found.push({type:"faq",i,title,meta:"FAQ"});
      }
    });

    materials.forEach((x,i)=>{
      const title=x?.title||"Materi";
      const hay=[title,x?.videoTitle||x?.video_title,x?.category,x?.summary,x?.content].filter(Boolean).join(" ").toLowerCase();
      if(hay.includes(q))found.push({type:"material",i,title,meta:`MATERI · ${x?.category||"Dhamma"}`});
    });

    games.forEach((x,i)=>{
      if(!isAdmin&&x?.status==="hidden")return;
      const title=x?.title||"Game";
      const hay=[title,x?.category,x?.description,x?.status].filter(Boolean).join(" ").toLowerCase();
      if(hay.includes(q))found.push({type:"game",i,title,meta:`GAME · ${x.category||"Other"}`});
    });

    const shown=found.slice(0,12);
    results.innerHTML=shown.length
      ? shown.map(x=>`<div class="search-item" data-type="${esc(x.type)}" data-i="${x.i}"><b>${esc(x.title)}</b><small>${esc(x.meta)}</small></div>`).join("")
      : `<div class="search-empty">Tidak ditemukan</div>`;
    results.classList.add("show");

    results.querySelectorAll(".search-item").forEach(item=>{
      item.onclick=()=>{
        const type=item.dataset.type;
        const i=Number(item.dataset.i);

        if(type==="video"&&videos[i]){
          setActive(i,false);
          showPage("tutorial");
        }else if(type==="faq"&&faqs[i]){
          showPage("faq");
          requestAnimationFrame(()=>{
            const card=document.querySelector(`#faqList .faq-doc[data-doc-index="${i}"]`);
            if(card){
              card.classList.add("open");
              const hint=card.querySelector(".doc-hint");
              if(hint)hint.textContent="Klik untuk tutup";
              card.scrollIntoView({behavior:"smooth",block:"center"});
            }
          });
        }else if(type==="material"&&materials[i]){
          openMaterial(i);
        }else if(type==="game"&&games[i]){
          showPage("game");
          requestAnimationFrame(()=>{
            const card=document.querySelector(`#gameList .game-card[data-game-id="${games[i].id}"]`);
            if(card){
              card.classList.add("open");
              const hint=card.querySelector(".doc-hint");
              if(hint)hint.textContent="Klik untuk tutup";
              card.scrollIntoView({behavior:"smooth",block:"center"});
            }
          });
        }

        search.value="";
        results.innerHTML="";
        results.classList.remove("show");
      };
    });
  });

  document.addEventListener("click",e=>{
    if(!e.target.closest(".search-wrap"))results.classList.remove("show");
  });
}

function authRedirectUrl(){
  return window.BUDDHIST_CONFIG?.authRedirectUrl || (location.origin + location.pathname);
}
function supabaseReady(){const c=window.BUDDHIST_CONFIG||{};return !!(window.supabase&&c.supabaseUrl&&c.supabaseAnonKey&&!c.supabaseUrl.includes("YOUR_")&&!c.supabaseAnonKey.includes("YOUR_"))}
async function initSupabase(){
  if(!supabaseReady()){document.body.classList.add("auth-required");openAuth("Supabase belum tersambung. Periksa config.js.");return}
  try{
    sb=window.supabase.createClient(window.BUDDHIST_CONFIG.supabaseUrl,window.BUDDHIST_CONFIG.supabaseAnonKey);
    const {data}=await sb.auth.getSession();
    await applySession(data.session);
    sb.auth.onAuthStateChange(async(_e,s)=>{
      await applySession(s);
      if(s)await loadRemote();
      if(_e==="PASSWORD_RECOVERY"){
        showPage("settings");
        selectSettingsTab("security");
        say("Masukkan password baru pada menu Keamanan.");
      }
    });
    if(data.session)await loadRemote();
    if($("syncBadge"))$("syncBadge").textContent="Supabase Online";
  }catch(e){console.error(e);document.body.classList.add("auth-required");openAuth("Supabase gagal tersambung.");}
}

function stopPresenceHeartbeat(){
  if(presenceTimer){clearInterval(presenceTimer);presenceTimer=null}
}
async function touchPresence(){
  if(!currentSession||!sb)return;
  try{
    await sb.from("buddhist_profiles").update({last_seen_at:new Date().toISOString()}).eq("user_id",currentSession.user.id);
  }catch(e){console.warn("Presence gagal diperbarui",e)}
}
function startPresenceHeartbeat(){
  stopPresenceHeartbeat();
  touchPresence();
  presenceTimer=setInterval(()=>{touchPresence(); if(document.querySelector("#friends.active"))renderFriends(false)},45000);
}
async function logPlayerActivity(action,targetType="",targetName="",detail=""){
  if(!currentSession||!sb)return;
  try{await sb.rpc("log_activity",{p_action:action,p_target_type:targetType,p_target_name:targetName,p_detail:detail})}
  catch(e){console.warn("Log activity gagal",e)}
}
async function applySession(session){
  currentSession=session||null;currentRole="viewer";isAdmin=false;isOwner=false;
  if(session&&sb){
    try{
      await sb.from("buddhist_profiles").upsert({
        user_id:session.user.id,
        email:session.user.email||null,
        display_name:session.user.user_metadata?.full_name||session.user.user_metadata?.name||session.user.email?.split("@")[0]||"Player",
        provider:session.user.app_metadata?.provider||"email",
        last_seen_at:new Date().toISOString()
      },{onConflict:"user_id"});
    }catch(e){console.warn("Profile Buddhist belum tersimpan",e)}
    try{
      const {data,error}=await sb.from("user_roles").select("role,is_owner,email,approved").eq("user_id",session.user.id).maybeSingle();
      if(error)throw error;
      if(data){
        currentRole=data.role||"viewer";
        isOwner=!!data.is_owner;
        isAdmin=!!(isOwner||(data.approved&&currentRole==="admin"));
      }
    }catch(e){console.warn("Role admin/owner tidak tersedia",e)}
  }
  document.body.classList.toggle("is-admin",isAdmin);
  document.body.classList.toggle("is-owner",isOwner);
  document.body.classList.toggle("has-session",!!session);
  document.body.classList.toggle("auth-required",!session);
  if($("loginMainText"))$("loginMainText").textContent=session?(session.user.user_metadata?.full_name||session.user.email?.split("@")[0]||"User"):"Login / Daftar";
  if($("loginSubText"))$("loginSubText").textContent=session?(isOwner?"Owner":isAdmin?"Administrator":"Viewer"):"Wajib Login";
  if($("adminUserLabel"))$("adminUserLabel").textContent="";
  if(session){
    closeAuth(true);
    startPresenceHeartbeat();
    if(activityLoggedUser!==session.user.id){
      activityLoggedUser=session.user.id;
      logPlayerActivity("login","account",session.user.email||"player","player login");
    }
  } else {
    stopPresenceHeartbeat();
    activityLoggedUser="";
    setAuthMode("login");openAuth("Wajib login untuk mengakses aplikasi Dhamma Journey.");
  }
  const activePage=document.querySelector(".page-view.active");
  if(["pengguna","activity-log","complaints"].includes(activePage?.id)&&!isOwner)showPage("dashboard");
}
function setAuthStatus(message,type="pending"){const el=$("authStatus");if(!el)return;el.textContent=message||"";el.className="auth-status"+(message?` show ${type}`:"")}
function friendlyAuthError(error,mode="login"){
  const raw=String(error?.message||error||"").toLowerCase();
  if(raw.includes("email not confirmed"))return "Email belum diverifikasi. Buka inbox email dan klik link verifikasi, lalu login kembali.";
  if(raw.includes("invalid login credentials"))return "Email atau password salah. Periksa kembali data login, atau pastikan akun sudah terdaftar.";
  if(raw.includes("user already registered")||raw.includes("already registered"))return "Email ini sudah terdaftar. Silakan gunakan tab Login.";
  if(raw.includes("password")&&raw.includes("6"))return "Password terlalu pendek. Gunakan minimal 6 karakter.";
  if(raw.includes("invalid email"))return "Format email tidak valid. Periksa kembali alamat email.";
  if(raw.includes("rate limit")||raw.includes("too many"))return "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.";
  return (mode==="register"?"Pendaftaran gagal: ":"Login gagal: ")+(error?.message||"Terjadi kesalahan. Silakan coba lagi.");
}
function setAuthMode(mode){
  authMode=mode==="register"?"register":"login";setAuthStatus("");
  $("authLoginTab")?.classList.toggle("active",authMode==="login");
  $("authRegisterTab")?.classList.toggle("active",authMode==="register");
  if($("doLogin"))$("doLogin").textContent=authMode==="login"?"Login":"Daftar & Verifikasi";
  if($("authTitle"))$("authTitle").textContent=authMode==="login"?"Masuk ke Dhamma Journey":"Daftar Akun Dhamma Journey";
  if($("authHelp"))$("authHelp").textContent=authMode==="login"
    ?"Login wajib sebelum masuk ke aplikasi."
    :"Daftar dengan email. Jika verifikasi email aktif, buka inbox lalu klik link verifikasi. Tidak perlu persetujuan Admin/Owner.";
}
function openAuth(help){setAuthStatus("");if(help&&$("authHelp"))$("authHelp").textContent=help;$("authModal")?.classList.add("show");$("authModal")?.setAttribute("aria-hidden","false")}
function closeAuth(force=false){if(!force&&!currentSession)return;setAuthStatus("");$("authModal")?.classList.remove("show");$("authModal")?.setAttribute("aria-hidden","true")}
$("authLoginTab")?.addEventListener("click",()=>setAuthMode("login"));$("authRegisterTab")?.addEventListener("click",()=>setAuthMode("register"));
$("adminAuthBtn")?.addEventListener("click",async()=>{
  if(currentSession&&sb){await openAccountConnect();return}
  setAuthMode("login");openAuth("Wajib login untuk mengakses aplikasi Dhamma Journey.");
});$("closeAuth")?.addEventListener("click",closeAuth);$("authModal")?.addEventListener("click",e=>{if(e.target.id==="authModal")closeAuth()});
$("doLogin")?.addEventListener("click",async()=>{
  if(!supabaseReady()){setAuthStatus("Supabase belum terhubung. Periksa config.js.","error");return}
  if(!sb)await initSupabase();
  const email=$("adminEmail").value.trim(),password=$("adminPassword").value;
  if(!email||!password){setAuthStatus("Email dan password wajib diisi.","error");return}
  if(authMode==="register"){
    setAuthStatus("Mendaftarkan akun...","pending");
    const {data,error}=await sb.auth.signUp({
      email,password,
      options:{emailRedirectTo:authRedirectUrl()}
    });
    if(error){setAuthStatus(friendlyAuthError(error,"register"),"error");return}
    if(data?.session){
      await applySession(data.session);
      await loadRemote();
      say("Pendaftaran berhasil");
      return;
    }
    setAuthStatus("✓ Akun dibuat. Periksa email untuk verifikasi, lalu kembali dan Login. Tidak perlu persetujuan Admin atau Owner.","success");
    if($("adminPassword"))$("adminPassword").value="";
    return;
  }
  setAuthStatus("Memeriksa akun...","pending");
  const {data,error}=await sb.auth.signInWithPassword({email,password});
  if(error){setAuthStatus(friendlyAuthError(error,"login"),"error");return}
  await applySession(data.session);
  await loadRemote();
  say(isOwner?"Login berhasil sebagai Owner":isAdmin?"Login berhasil sebagai Admin":"Login berhasil");
});


$$(".social-login[data-provider]").forEach(btn=>btn.addEventListener("click",async()=>{
  if(!sb&&supabaseReady())sb=window.supabase.createClient(window.BUDDHIST_CONFIG.supabaseUrl,window.BUDDHIST_CONFIG.supabaseAnonKey);
  if(!sb)return setAuthStatus("Supabase belum tersambung.","error");
  const provider=btn.dataset.provider;
  const label=btn.dataset.providerLabel||provider;
  setAuthStatus("Membuka login "+label+"...","pending");
  const {error}=await sb.auth.signInWithOAuth({
    provider,
    options:{redirectTo:authRedirectUrl()}
  });
  if(error)setAuthStatus(label+" belum aktif / belum dikonfigurasi: "+error.message,"error");
}));
$("whatsappLoginPanel")?.classList.remove("show");
$(".social-login[data-auth-method=\"whatsapp\"]")?.addEventListener("click",()=>{
  $("whatsappLoginPanel")?.classList.toggle("show");
  setAuthStatus("Masukkan nomor WhatsApp dengan kode negara, contoh +62...","pending");
});
$("sendWhatsappOtp")?.addEventListener("click",async()=>{
  if(!sb&&supabaseReady())sb=window.supabase.createClient(window.BUDDHIST_CONFIG.supabaseUrl,window.BUDDHIST_CONFIG.supabaseAnonKey);
  if(!sb)return setAuthStatus("Supabase belum tersambung.","error");
  const phone=$("whatsappPhone")?.value.trim();
  if(!phone||!phone.startsWith("+"))return setAuthStatus("Gunakan nomor lengkap dengan kode negara, contoh +62...","error");
  setAuthStatus("Mengirim OTP melalui WhatsApp...","pending");
  const {error}=await sb.auth.signInWithOtp({
    phone,
    options:{channel:"whatsapp",shouldCreateUser:true}
  });
  if(error)return setAuthStatus("WhatsApp OTP belum tersedia: "+error.message,"error");
  $("whatsappOtpStep")?.classList.remove("hidden");
  setAuthStatus("Kode OTP sudah dikirim ke WhatsApp.","success");
});
$("verifyWhatsappOtp")?.addEventListener("click",async()=>{
  const phone=$("whatsappPhone")?.value.trim();
  const token=$("whatsappOtp")?.value.trim();
  if(!phone||!token)return setAuthStatus("Nomor dan OTP wajib diisi.","error");
  setAuthStatus("Memverifikasi OTP...","pending");
  const {data,error}=await sb.auth.verifyOtp({phone,token,type:"sms"});
  if(error)return setAuthStatus("OTP tidak valid: "+error.message,"error");
  if(data?.session){
    await applySession(data.session);
    await loadRemote();
    say("Login WhatsApp berhasil");
  }
});



async function openAccountConnect(){
  if(!currentSession||!sb)return;
  $("accountConnectEmail").textContent=currentSession.user.email||currentSession.user.phone||"Akun aktif";
  if($("linkEmailInput"))$("linkEmailInput").value=currentSession.user.email||"";
  await Promise.all([renderLinkedIdentities(),loadWalletEconomy(false)]);
  applyProfileUI();
  if($("profileCaishenBalance"))$("profileCaishenBalance").textContent=String(caishenBalance);
  if($("profileCharacterCost"))$("profileCharacterCost").textContent=`${economyConfig.character_cost||100} Coin`;
  $("accountConnectModal")?.classList.add("show");
  $("accountConnectModal")?.setAttribute("aria-hidden","false");
}
function closeAccountConnect(){
  $("accountConnectModal")?.classList.remove("show");
  $("accountConnectModal")?.setAttribute("aria-hidden","true");
  const st=$("accountConnectStatus");if(st){st.textContent="";st.className="auth-status"}
}
async function renderLinkedIdentities(){
  const root=$("linkedIdentityList");if(!root||!sb)return;
  root.innerHTML='<div class="page-empty">Memuat identitas...</div>';
  const {data,error}=await sb.auth.getUserIdentities();
  if(error){root.innerHTML='<div class="page-empty">Gagal memuat identitas.</div>';return}
  const identities=data?.identities||[];
  const labels={
    email:"Email",phone:"WhatsApp / Telepon",facebook:"Facebook",
    "custom:instagram":"Instagram","custom:line":"LINE"
  };
  root.innerHTML=identities.length?identities.map((i,idx)=>`<div class="linked-identity">
    <b>${labels[i.provider]||i.provider}</b>
    <div class="linked-identity-actions">
      <span class="identity-linked-badge">Terhubung</span>
      ${identities.length>1&&i.provider!=="email"?`<button class="unlink-identity" data-identity-index="${idx}" type="button">Lepas</button>`:""}
    </div>
  </div>`).join(""):'<div class="page-empty">Belum ada identitas tambahan.</div>';
  root.querySelectorAll(".unlink-identity").forEach(btn=>btn.addEventListener("click",async()=>{
    const identity=identities[Number(btn.dataset.identityIndex)];
    if(!identity)return;
    const status=$("accountConnectStatus");
    if(!confirm(`Lepas ${labels[identity.provider]||identity.provider} dari akun ini?`))return;
    const {error}=await sb.auth.unlinkIdentity(identity);
    if(error){
      if(status){status.textContent="Gagal melepas identitas: "+error.message;status.className="auth-status show error"}
      return;
    }
    if(status){status.textContent="Identitas berhasil dilepas.";status.className="auth-status show success"}
    await renderLinkedIdentities();
  }));
}
$("closeAccountConnect")?.addEventListener("click",closeAccountConnect);
$("accountConnectModal")?.addEventListener("click",e=>{if(e.target.id==="accountConnectModal")closeAccountConnect()});
$("accountLogoutBtn")?.addEventListener("click",async()=>{
  if(!currentSession||!sb)return;
  await logPlayerActivity("logout","account",currentSession.user.email||currentSession.user.phone||"player","player logout");
  await sb.auth.signOut();closeAccountConnect();say("Logout berhasil");
});
$$("[data-link-provider]").forEach(btn=>btn.addEventListener("click",async()=>{
  if(!currentSession||!sb)return;
  const provider=btn.dataset.linkProvider;
  const label=btn.dataset.providerLabel||provider;
  const status=$("accountConnectStatus");
  if(status){status.textContent="Membuka "+label+"...";status.className="auth-status show pending"}
  const {error}=await sb.auth.linkIdentity({
    provider,
    options:{redirectTo:authRedirectUrl()}
  });
  if(error&&status){status.textContent=label+" belum dapat dihubungkan: "+error.message;status.className="auth-status show error"}
}));
$("linkEmailBtn")?.addEventListener("click",async()=>{
  if(!currentSession||!sb)return;
  const email=$("linkEmailInput")?.value.trim(),status=$("accountConnectStatus");
  if(!email)return;
  if(status){status.textContent="Mengirim verifikasi email...";status.className="auth-status show pending"}
  const {error}=await sb.auth.updateUser({email},{emailRedirectTo:authRedirectUrl()});
  if(error){if(status){status.textContent=error.message;status.className="auth-status show error"};return}
  if(status){status.textContent="Periksa email untuk menyelesaikan verifikasi.";status.className="auth-status show success"}
});

$("linkPhoneBtn")?.addEventListener("click",async()=>{
  if(!currentSession||!sb)return;
  const phone=$("linkPhoneInput")?.value.trim(),status=$("accountConnectStatus");
  if(!phone||!phone.startsWith("+")){
    if(status){status.textContent="Gunakan nomor lengkap dengan kode negara, contoh +62...";status.className="auth-status show error"}
    return;
  }
  if(status){status.textContent="Mengirim OTP ke nomor...";status.className="auth-status show pending"}
  const {error}=await sb.auth.updateUser({phone});
  if(error){
    if(status){status.textContent="Nomor belum dapat dihubungkan: "+error.message;status.className="auth-status show error"}
    return;
  }
  $("linkPhoneOtpStep")?.classList.remove("hidden");
  if(status){status.textContent="OTP dikirim. Masukkan kode untuk menyelesaikan linking.";status.className="auth-status show success"}
});
$("verifyLinkPhoneBtn")?.addEventListener("click",async()=>{
  if(!currentSession||!sb)return;
  const phone=$("linkPhoneInput")?.value.trim(),token=$("linkPhoneOtp")?.value.trim(),status=$("accountConnectStatus");
  if(!phone||!token)return;
  if(status){status.textContent="Memverifikasi nomor...";status.className="auth-status show pending"}
  const {error}=await sb.auth.verifyOtp({phone,token,type:"phone_change"});
  if(error){
    if(status){status.textContent="OTP tidak valid: "+error.message;status.className="auth-status show error"}
    return;
  }
  if(status){status.textContent="Nomor telepon berhasil dihubungkan.";status.className="auth-status show success"}
  $("linkPhoneOtpStep")?.classList.add("hidden");
  if($("linkPhoneOtp"))$("linkPhoneOtp").value="";
  await renderLinkedIdentities();
});


async function renderFriends(showLoading=true){
  const requestRoot=$("friendRequestList"),onlineRoot=$("onlineFriendList"),allRoot=$("allFriendList");
  if(!requestRoot||!onlineRoot||!allRoot)return;
  if(!currentSession||!sb){
    requestRoot.innerHTML=onlineRoot.innerHTML=allRoot.innerHTML='<div class="friend-empty">Login diperlukan.</div>';
    return;
  }
  if(showLoading){
    requestRoot.innerHTML='<div class="friend-empty">Memuat...</div>';
    onlineRoot.innerHTML='<div class="friend-empty">Memuat...</div>';
    allRoot.innerHTML='<div class="friend-empty">Memuat...</div>';
  }
  try{
    const [{data:profile,error:pe},{data:rows,error:fe}]=await Promise.all([
      sb.from("buddhist_profiles").select("friend_code").eq("user_id",currentSession.user.id).maybeSingle(),
      sb.rpc("buddhist_friend_dashboard")
    ]);
    if(pe)throw pe;if(fe)throw fe;
    if($("myFriendCode"))$("myFriendCode").textContent=profile?.friend_code||"Belum tersedia";
    friendRows=rows||[];
    const incoming=friendRows.filter(r=>r.status==="pending"&&r.direction==="incoming");
    const friends=friendRows.filter(r=>r.status==="accepted");
    const online=friends.filter(r=>r.is_online);
    if($("incomingFriendCount"))$("incomingFriendCount").textContent=incoming.length;
    if($("onlineFriendCount"))$("onlineFriendCount").textContent=online.length;
    if($("allFriendCount"))$("allFriendCount").textContent=friends.length;
    document.querySelector(".header-bell")?.classList.toggle("has-friend-request",incoming.length>0);

    requestRoot.innerHTML=incoming.length?incoming.map(r=>friendRowHTML(r,true)).join(""):'<div class="friend-empty">Tidak ada permintaan baru.</div>';
    onlineRoot.innerHTML=online.length?online.map(r=>friendRowHTML(r,false)).join(""):'<div class="friend-empty">Belum ada teman yang online.</div>';
    allRoot.innerHTML=friends.length?friends.map(friendCardHTML).join(""):'<div class="friend-empty">Belum ada teman. Cari ID teman untuk mulai terhubung.</div>';
  }catch(e){
    console.error(e);
    requestRoot.innerHTML=onlineRoot.innerHTML=allRoot.innerHTML='<div class="friend-empty">Data pertemanan gagal dimuat.</div>';
  }
}
function friendAvatar(name){
  return `<span class="friend-avatar">👤</span>`;
}
function friendRowHTML(r,incoming=false){
  return `<div class="friend-row">
    <div class="friend-person">${friendAvatar(r.display_name)}<div class="friend-person-copy"><strong>${esc(r.display_name||"Player")}</strong><small><span class="online-dot ${r.is_online?"on":""}"></span>${esc(r.friend_code||"")} · ${r.is_online?"Online":"Offline"}</small></div></div>
    <div class="friend-actions">
      ${incoming?`<button class="mini-btn friend-response" data-id="${r.relationship_id}" data-accept="1">Terima</button><button class="mini-btn friend-response" data-id="${r.relationship_id}" data-accept="0">Tolak</button>`:`<span class="friend-status ${r.is_online?"online":""}">${r.is_online?"Online":"Offline"}</span>`}
    </div>
  </div>`;
}
function friendCardHTML(r){
  return `<div class="friend-card">
    <div class="friend-person">${friendAvatar(r.display_name)}<div class="friend-person-copy"><strong>${esc(r.display_name||"Player")}</strong><small><span class="online-dot ${r.is_online?"on":""}"></span>${esc(r.friend_code||"")} · ${r.is_online?"Online":"Offline"}</small></div></div>
    <div class="friend-actions"><button class="mini-btn remove-friend" data-id="${r.relationship_id}">Hapus Teman</button></div>
  </div>`;
}
$("copyFriendCode")?.addEventListener("click",async()=>{
  const code=$("myFriendCode")?.textContent||"";
  if(!code||code==="Memuat..."||code==="Belum tersedia")return;
  try{await navigator.clipboard.writeText(code);say("ID teman disalin")}
  catch{say("Salin ID secara manual: "+code)}
});
$("searchFriendBtn")?.addEventListener("click",async()=>{
  const root=$("friendSearchResult"),code=$("friendCodeSearch")?.value.trim().toUpperCase();
  if(!root)return;
  if(!code){root.innerHTML='<div class="friend-empty">Masukkan ID teman.</div>';return}
  root.innerHTML='<div class="friend-empty">Mencari...</div>';
  const {data,error}=await sb.rpc("buddhist_find_friend_by_code",{p_code:code});
  if(error){root.innerHTML=`<div class="friend-empty">${esc(error.message)}</div>`;return}
  const r=(data||[])[0];
  if(!r){root.innerHTML='<div class="friend-empty">ID teman tidak ditemukan.</div>';return}
  let action="";
  if(r.relationship_status==="accepted") action='<span class="friend-status online">Sudah Berteman</span>';
  else if(r.direction==="outgoing") action='<span class="friend-status pending">Permintaan Terkirim</span>';
  else if(r.direction==="incoming") action=`<button class="mini-btn friend-response" data-id="${r.relationship_id}" data-accept="1">Terima Permintaan</button>`;
  else action=`<button class="red-btn add-friend" data-code="${esc(r.friend_code)}" type="button">Tambah Teman</button>`;
  root.innerHTML=`<div class="friend-found-card"><div class="friend-person">${friendAvatar(r.display_name)}<div class="friend-person-copy"><strong>${esc(r.display_name||"Player")}</strong><small><span class="online-dot ${r.is_online?"on":""}"></span>${esc(r.friend_code)} · ${r.is_online?"Online":"Offline"}</small></div></div><div class="friend-actions">${action}</div></div>`;
});
$("refreshFriends")?.addEventListener("click",()=>renderFriends());
document.addEventListener("click",async e=>{
  const add=e.target.closest(".add-friend");
  if(add){
    const {error}=await sb.rpc("buddhist_send_friend_request",{p_friend_code:add.dataset.code});
    if(error)return say(error.message);
    say("Permintaan pertemanan dikirim");$("friendSearchResult").innerHTML="";await renderFriends();return;
  }
  const response=e.target.closest(".friend-response");
  if(response){
    const accept=response.dataset.accept==="1";
    const {error}=await sb.rpc("buddhist_respond_friend_request",{p_relationship_id:Number(response.dataset.id),p_accept:accept});
    if(error)return say(error.message);
    say(accept?"Pertemanan diterima":"Permintaan ditolak");$("friendSearchResult").innerHTML="";await renderFriends();return;
  }
  const remove=e.target.closest(".remove-friend");
  if(remove){
    if(!confirm("Hapus teman ini?"))return;
    const {error}=await sb.rpc("buddhist_remove_friend",{p_relationship_id:Number(remove.dataset.id)});
    if(error)return say(error.message);
    say("Teman dihapus");await renderFriends();return;
  }
});

async function renderActivityLogs(){
  const root=$("activityLogList");
  if(!root)return;
  if(!isOwner||!sb){
    root.innerHTML='<div class="page-empty">Hanya Owner yang dapat melihat log aktivitas.</div>';
    return;
  }
  root.innerHTML='<div class="page-empty">Memuat log pemain...</div>';
  try{
    const [{data:logs,error:le},{data:profiles,error:pe}]=await Promise.all([
      sb.from("activity_logs").select("id,created_at,actor_user_id,actor_email,actor_role,action,target_type,target_name,detail").order("created_at",{ascending:false}).limit(500),
      sb.from("buddhist_profiles").select("user_id,email,display_name")
    ]);
    if(le)throw le;if(pe)throw pe;
    activityLogRows=logs||[];
    activityProfileMap=new Map((profiles||[]).map(p=>[p.user_id,p]));
    const grouped=new Map();
    activityLogRows.forEach(r=>{
      const key=r.actor_user_id||r.actor_email||"unknown";
      if(!grouped.has(key))grouped.set(key,[]);
      grouped.get(key).push(r);
    });
    root.innerHTML=grouped.size?`<div class="player-log-list">${[...grouped.entries()].map(([key,rows])=>{
      const p=rows[0].actor_user_id?activityProfileMap.get(rows[0].actor_user_id):null;
      const name=p?.display_name||rows[0].actor_email?.split("@")[0]||"Pemain";
      const email=p?.email||rows[0].actor_email||"-";
      return `<button class="player-log-summary" data-log-key="${esc(key)}" type="button"><div><strong>${esc(name)}</strong><span>${esc(email)}</span></div><b class="log-chevron">›</b></button>`;
    }).join("")}</div>`:'<div class="page-empty">Belum ada log aktivitas.</div>';
  }catch(e){
    console.error(e);
    root.innerHTML='<div class="page-empty">Log belum dapat dimuat.</div>';
  }
}
$("refreshActivityLog")?.addEventListener("click",renderActivityLogs);
document.addEventListener("click",e=>{
  const row=e.target.closest(".player-log-summary");if(!row)return;
  const key=row.dataset.logKey;
  const logs=activityLogRows.filter(r=>String(r.actor_user_id||r.actor_email||"unknown")===String(key));
  if(!logs.length)return;
  const p=logs[0].actor_user_id?activityProfileMap.get(logs[0].actor_user_id):null;
  const name=p?.display_name||logs[0].actor_email?.split("@")[0]||"Pemain";
  const email=p?.email||logs[0].actor_email||"-";
  $("activityPlayerName").textContent=name;
  $("activityPlayerEmail").textContent=email;
  $("activityPlayerDetailList").innerHTML=logs.map(r=>`<article class="activity-detail-item"><h4>${esc(r.action||"Aktivitas")}${r.target_name?` · ${esc(r.target_name)}`:""}</h4><p>${esc(r.detail||r.target_type||"-")}</p><small>${esc(new Date(r.created_at).toLocaleString("id-ID"))} · ${esc((r.actor_role||"viewer").toUpperCase())}</small></article>`).join("");
  $("activityPlayerModal")?.classList.add("show");
  $("activityPlayerModal")?.setAttribute("aria-hidden","false");
});
$("closeActivityPlayer")?.addEventListener("click",()=>{$("activityPlayerModal")?.classList.remove("show");$("activityPlayerModal")?.setAttribute("aria-hidden","true")});
$("activityPlayerModal")?.addEventListener("click",e=>{if(e.target.id==="activityPlayerModal")$("closeActivityPlayer")?.click()});


async function renderUserManagement(){
  const root=$("userAdminList");if(!root)return;
  if(!isOwner||!sb){root.innerHTML='<div class="page-empty">Hanya Owner yang dapat mengelola pengguna.</div>';return}
  root.innerHTML='<div class="page-empty">Memuat pengguna...</div>';
  try{
    const [{data:profiles,error:pe},{data:roles,error:re}]=await Promise.all([
      sb.from("buddhist_profiles").select("*").order("created_at",{ascending:true}),
      sb.from("user_roles").select("user_id,email,role,is_owner,approved")
    ]);
    if(pe)throw pe;if(re)throw re;
    const roleMap=new Map((roles||[]).map(r=>[r.user_id,r]));
    root.innerHTML=(profiles||[]).map(p=>{
      const r=roleMap.get(p.user_id);
      const owner=!!r?.is_owner,admin=!!(r?.approved&&r?.role==="admin");
      const badge=owner?'<span class="role-badge owner">OWNER</span>':admin?'<span class="role-badge admin">ADMIN</span>':'<span class="role-badge viewer">VIEWER</span>';
      const controls=owner?"":`<button class="promote" data-user="${p.user_id}" data-role="${admin?"viewer":"admin"}">${admin?"Jadikan Viewer":"Jadikan Admin"}</button><button class="delete-user" data-delete-user="${p.user_id}" data-email="${esc(p.email||"")}">🗑 Hapus Akun</button>`;
      return `<div class="user-admin-row"><div><strong>${esc(p.display_name||p.email||p.user_id)}</strong><br><small>${esc(p.email||"")} · ${esc(p.provider||"email")} · akun terverifikasi/login</small></div><div class="user-admin-actions">${badge}${controls}</div></div>`;
    }).join("")||'<div class="page-empty">Belum ada pengguna Buddhist.</div>';
    root.querySelectorAll("button[data-role][data-user]").forEach(b=>b.onclick=async()=>{
      const {error}=await sb.rpc("buddhist_owner_set_role",{target_user_id:b.dataset.user,target_role:b.dataset.role});
      if(error)return say("Gagal mengubah role: "+error.message);
      say(b.dataset.role==="admin"?"Akun dijadikan Admin":"Akun dijadikan Viewer");await renderUserManagement();
    });
    root.querySelectorAll("button[data-delete-user]").forEach(b=>b.onclick=async()=>{
      const email=b.dataset.email||"akun ini";if(!confirm(`Hapus ${email} secara permanen?`))return;
      const {error}=await sb.rpc("owner_delete_user",{target_user_id:b.dataset.deleteUser});
      if(error)return say("Gagal menghapus akun: "+error.message);
      say("Akun dihapus");await renderUserManagement();
    });
  }catch(e){console.error(e);root.innerHTML='<div class="page-empty">Gagal memuat daftar pengguna.</div>'}
}

$("complaintFab")?.addEventListener("click",()=>{if(!currentSession)return openAuth();openComplaintModal()});
$("sendComplaint")?.addEventListener("click",async()=>{
  if(!currentSession||!sb)return openAuth();
  const subject=$("complaintSubject")?.value.trim()||"Complaint dari player",message=$("complaintMessage").value.trim();
  const status=$("complaintStatus");
  if(!message){if(status){status.textContent="Isi complain wajib diisi.";status.className="auth-status show error"}return}
  const {error}=await sb.from("buddhist_complaints").insert({
    user_id:currentSession.user.id,
    user_email:currentSession.user.email||null,
    subject,message
  });
  if(error){if(status){status.textContent=error.message;status.className="auth-status show error"}return}
  if($("complaintSubject"))$("complaintSubject").value="Complaint dari player";$("complaintMessage").value="";if($("complaintCharCount"))$("complaintCharCount").textContent="0";
  await logPlayerActivity("complaint_submit","complaint",subject,"user submitted complaint");if(status){status.textContent="✓ Complain terkirim ke Owner.";status.className="auth-status show success"}
  setTimeout(()=>{$("complaintModal")?.classList.remove("show")},700);
});
async function renderComplaints(){
  const root=$("complaintList");if(!root)return;
  if(!isOwner||!sb){root.innerHTML='<div class="page-empty">Hanya Owner yang dapat melihat complain.</div>';return}
  root.innerHTML='<div class="page-empty">Memuat complain...</div>';
  const {data,error}=await sb.from("buddhist_complaints").select("*").order("created_at",{ascending:false});
  if(error){root.innerHTML='<div class="page-empty">Gagal memuat complain.</div>';return}
  root.innerHTML=(data||[]).map(c=>`<article class="doc-item complaint-row">
    <h3>${esc(c.subject)}</h3>
    <p>${esc(c.message)}</p>
    <div class="doc-meta">${esc(c.user_email||"User")} · ${esc(new Date(c.created_at).toLocaleString("id-ID"))}</div>
    <span class="complaint-status-pill">${esc(c.status)}</span>
    <div class="complaint-owner-actions">
      <button class="mini-btn complaint-state" data-id="${c.id}" data-status="reviewing">Review</button>
      <button class="mini-btn complaint-state" data-id="${c.id}" data-status="resolved">Selesai</button>
    </div>
  </article>`).join("")||'<div class="page-empty">Belum ada complain.</div>';
  root.querySelectorAll(".complaint-state").forEach(b=>b.onclick=async()=>{
    const row=(data||[]).find(x=>Number(x.id)===Number(b.dataset.id));
    const {error}=await sb.from("buddhist_complaints").update({status:b.dataset.status,updated_at:new Date().toISOString()}).eq("id",Number(b.dataset.id));
    if(error)return say("Gagal mengubah status");
    await logPlayerActivity("complaint_status_update","complaint",row?.subject||`Complain #${b.dataset.id}`,`Status diubah menjadi ${b.dataset.status}`);
    renderComplaints();
  });
}
$("refreshComplaints")?.addEventListener("click",renderComplaints);

async function uploadMedia(file,folder){
  if(!file)return "";
  if(!sb||!isAdmin)return "";
  try{
    const safe=(file.name||"file").replace(/[^a-zA-Z0-9._-]+/g,"-");
    const path=`${folder}/${Date.now()}-${Math.random().toString(36).slice(2,8)}-${safe}`;
    const {error}=await sb.storage.from("buddhist-media").upload(path,file,{upsert:false});
    if(error)throw error;
    const {data}=sb.storage.from("buddhist-media").getPublicUrl(path);
    return data?.publicUrl||"";
  }catch(e){console.error(e);say("Upload file gagal");return ""}
}
async function remoteInsert(table,obj){
  if(!sb||!isAdmin)return null;
  try{
    const {error}=await sb.from(table).insert(obj);if(error)throw error;
    if(table==="buddhist_videos")await broadcastContentNotification("Video baru",obj.title||"Video Dhamma baru","tutorial");
    if(table==="buddhist_materials")await broadcastContentNotification("Materi baru",obj.title||"Materi Dhamma baru","materials-library");
    await loadRemote();return true
  }catch(e){console.error(e);say("Gagal simpan online");return false}
}
async function loadRemote(){
  if(!sb||!currentSession)return;
  try{
    const [v,m,f,g]=await Promise.all([
      sb.from("buddhist_videos").select("*").order("created_at"),
      sb.from("buddhist_materials").select("*").order("created_at"),
      sb.from("buddhist_faq").select("*").order("created_at"),
      sb.from("buddhist_games").select("*").order("created_at")
    ]);
    const rows=v.data||[],overrides=new Map(rows.filter(r=>r.base_key).map(r=>[r.base_key,r])),merged=[];
    baseVideos.forEach((bv,i)=>{
      const key=`base-${i}`,r=overrides.get(key);
      if(r?.is_deleted)return;
      if(r){const a=videoFromRow(r);a._isBase=true;a._audioUrl=MANTRA_AUDIO[i]||"";merged.push(a)}
      else merged.push(makeBaseVideo(bv,i));
    });
    rows.filter(r=>!r.base_key&&!r.is_deleted).forEach(r=>merged.push(videoFromRow(r)));
    videos=merged;
    if(m.data)materials=m.data.map(x=>({...x,videoTitle:x.video_title}));
    if(f.data)faqs=f.data;
    games=g.data||[];
    active=Math.min(active,Math.max(0,videos.length-1));
    renderCarousel();if(videos.length)setActive(active,false,false);
    renderFAQ();renderGames();renderCategories();renderMaterialLibrary();renderMaterialsMini();
  }catch(e){console.error(e);say("Data Supabase gagal dimuat")}
}
// Event delegation tunggal: tombol yang dirender ulang tetap selalu aktif.
document.addEventListener("click",e=>{
  const nav=e.target.closest(".nav button[data-page]");
  if(nav){e.preventDefault();showPage(nav.dataset.page);return;}

  const scFav=e.target.closest("#scroller .fav-btn");
  if(scFav){e.preventDefault();e.stopPropagation();const c=scFav.closest(".card");if(c)toggleFav(+c.dataset.real);return;}
  const scList=e.target.closest("#scroller .list-btn");
  if(scList){e.preventDefault();e.stopPropagation();const c=scList.closest(".card");if(c)togglePlaylist(+c.dataset.real);return;}
  const scEdit=e.target.closest("#scroller .edit-btn");
  if(scEdit){e.preventDefault();e.stopPropagation();const c=scEdit.closest(".card");if(c)openVideoEditor(+c.dataset.real);return;}
  const scDelete=e.target.closest("#scroller .delete-btn");
  if(scDelete){e.preventDefault();e.stopPropagation();const c=scDelete.closest(".card");if(c)deleteVideo(+c.dataset.real);return;}

  const open=e.target.closest(".open-video");
  if(open){e.preventDefault();e.stopPropagation();const i=+open.dataset.i;if(videos[i]){setActive(i,false);showPage("tutorial")}return;}
  const fav=e.target.closest(".fav-video");
  if(fav){e.preventDefault();e.stopPropagation();toggleFav(+fav.dataset.i);return;}
  const list=e.target.closest(".list-video");
  if(list){e.preventDefault();e.stopPropagation();togglePlaylist(+list.dataset.i);return;}
  const edit=e.target.closest(".edit-video");
  if(edit){e.preventDefault();e.stopPropagation();openVideoEditor(+edit.dataset.i);return;}
  const del=e.target.closest(".delete-video");
  if(del){e.preventDefault();e.stopPropagation();deleteVideo(+del.dataset.i);return;}
  const material=e.target.closest(".open-material");
  if(material){e.preventDefault();e.stopPropagation();openMaterial(+material.dataset.i);return;}
  const editMaterial=e.target.closest(".edit-material");
  if(editMaterial){e.preventDefault();e.stopPropagation();openMaterialEditor(+editMaterial.dataset.i);return;}
  const editMaterialAudio=e.target.closest(".edit-material-audio");
  if(editMaterialAudio){e.preventDefault();e.stopPropagation();openMaterialAudioEditor(+editMaterialAudio.dataset.i);return;}
  const deleteMaterialAudioBtn=e.target.closest(".delete-material-audio");
  if(deleteMaterialAudioBtn){e.preventDefault();e.stopPropagation();deleteMaterialAudio(+deleteMaterialAudioBtn.dataset.i);return;}
  const deleteMaterialBtn=e.target.closest(".delete-material");
  if(deleteMaterialBtn){e.preventDefault();e.stopPropagation();deleteMaterial(+deleteMaterialBtn.dataset.i);return;}

  const editFaqBtn=e.target.closest(".edit-faq");
  if(editFaqBtn){e.preventDefault();e.stopPropagation();openFaqEditor(+editFaqBtn.dataset.i);return;}
  const deleteFaqBtn=e.target.closest(".delete-faq");
  if(deleteFaqBtn){e.preventDefault();e.stopPropagation();deleteFaq(+deleteFaqBtn.dataset.i);return;}
  const editNotesBtn=e.target.closest(".edit-Notes");
  if(editNotesBtn){e.preventDefault();e.stopPropagation();openNotesEditor(+editNotesBtn.dataset.i);return;}
  const deleteNotesBtn=e.target.closest(".delete-Notes");
  if(deleteNotesBtn){e.preventDefault();e.stopPropagation();deleteNotes(+deleteNotesBtn.dataset.i);return;}

  const faq=e.target.closest(".faq-doc");
  if(faq){faq.classList.toggle("open");const hint=faq.querySelector(".doc-hint");if(hint)hint.textContent=faq.classList.contains("open")?"Klik untuk tutup":"Klik untuk buka jawaban";return;}
  const Notes=e.target.closest(".Notes-doc");
  if(Notes){Notes.classList.toggle("open");const hint=Notes.querySelector(".doc-hint");if(hint)hint.textContent=Notes.classList.contains("open")?"Klik untuk tutup":"Klik untuk buka SOP";return;}

  const row=e.target.closest(".video-row");
  if(row && !e.target.closest("button")){const i=+row.dataset.videoIndex;if(videos[i]){setActive(i,false);showPage("tutorial")}return;}
});
document.addEventListener("keydown",e=>{
  if(e.key!=="Enter"&&e.key!==" ")return;
  const doc=e.target.closest?.(".clickable-doc");
  if(doc){e.preventDefault();doc.click();}
});

// Mobile drawer navigation — terpisah dari mesin carousel.
const mobileMenuBtn=$("mobileMenuBtn"), mobileMenuBackdrop=$("mobileMenuBackdrop");
function setMobileMenu(open){
  document.body.classList.toggle("mobile-menu-open",!!open);
  if(mobileMenuBtn){mobileMenuBtn.setAttribute("aria-expanded",open?"true":"false");mobileMenuBtn.textContent=open?"✕":"☰";}
}
mobileMenuBtn?.addEventListener("click",()=>setMobileMenu(!document.body.classList.contains("mobile-menu-open")));
mobileMenuBackdrop?.addEventListener("click",()=>setMobileMenu(false));
document.addEventListener("click",e=>{
  if(window.innerWidth<=760 && e.target.closest(".nav button[data-page]"))setMobileMenu(false);
});
document.addEventListener("keydown",e=>{if(e.key==="Escape")setMobileMenu(false)});
window.addEventListener("resize",()=>{if(window.innerWidth>760)setMobileMenu(false)});


/* =========================================================
   V6.4 — SETTINGS, PROFILE, SECURITY, NOTIFICATIONS, COMMENTS
   ========================================================= */
let currentProfile=null;
let userSettings={
  theme:"gold",
  notifications_enabled:true,
  friend_notifications:true,
  content_notifications:true,
  complaint_notifications:true,
  sound_enabled:true,
  compact_mode:false,
  font_scale:"normal"
};
let notificationRows=[];
let settingsSaveTimer=null;
let notificationState={ready:false,lastUnread:0};
let uiLocalSettings={notifSoundType:"bell",hideComplaintHelper:false};

function videoKey(v){
  if(!v)return "";
  return v._id?`id:${v._id}`:(v._baseKey||`title:${v[0]||"video"}`);
}
function setStatus(elId,message,type="pending"){
  const el=$(elId); if(!el)return;
  el.textContent=message||"";
  el.className="auth-status"+(message?` show ${type}`:"");
}
function applyUserSettings(){
  document.body.dataset.theme=userSettings.theme||"gold";
  document.body.classList.toggle("compact-ui",!!userSettings.compact_mode);
  document.body.dataset.fontScale=userSettings.font_scale||"normal";
  $$(".theme-card").forEach(b=>b.classList.toggle("active",b.dataset.themeChoice===(userSettings.theme||"gold")));
  const map={
    notifMaster:"notifications_enabled",
    notifFriends:"friend_notifications",
    notifContent:"content_notifications",
    notifComplaints:"complaint_notifications",
    notifSound:"sound_enabled",
    compactMode:"compact_mode"
  };
  Object.entries(map).forEach(([id,key])=>{if($(id))$(id).checked=!!userSettings[key]});
  if($("fontScale"))$("fontScale").value=userSettings.font_scale||"normal";
}
function userPrefStorageKey(){
  const uid=currentSession?.user?.id||"guest";
  return `dhamma_ui_prefs_${uid}`;
}
function loadLocalUiSettings(){
  try{
    const raw=localStorage.getItem(userPrefStorageKey());
    if(raw)uiLocalSettings={...uiLocalSettings,...JSON.parse(raw)};
  }catch(e){console.warn("UI prefs gagal dibaca",e)}
  applyLocalUiSettings();
}
function saveLocalUiSettings(patch={}){
  uiLocalSettings={...uiLocalSettings,...patch};
  try{localStorage.setItem(userPrefStorageKey(),JSON.stringify(uiLocalSettings))}catch(e){}
  applyLocalUiSettings();
  const badge=$("settingsSavedBadge");
  if(badge){badge.textContent="✓ Tersimpan";setTimeout(()=>badge.textContent="Tersimpan otomatis",1400)}
}
function applyLocalUiSettings(){
  if($("notifSoundType"))$("notifSoundType").value=uiLocalSettings.notifSoundType||"bell";
  if($("hideComplaintHelper"))$("hideComplaintHelper").checked=!!uiLocalSettings.hideComplaintHelper;
  document.body.classList.toggle("complaint-helper-hidden",!!uiLocalSettings.hideComplaintHelper);
}
function playNotificationSound(kind=uiLocalSettings.notifSoundType||"bell"){
  if(!userSettings.sound_enabled||kind==="mute")return;
  const AC=window.AudioContext||window.webkitAudioContext;
  if(!AC)return;
  const ctx=playNotificationSound.ctx||(playNotificationSound.ctx=new AC());
  if(ctx.state==="suspended")ctx.resume();
  const now=ctx.currentTime;
  const notes={
    bell:[[880,0.09,0],[1175,0.12,0.11]],
    chime:[[784,0.08,0],[1047,0.08,0.1],[1319,0.12,0.2]],
    wood:[[392,0.05,0],[330,0.05,0.08]],
    lotus:[[659,0.06,0],[784,0.08,0.08],[988,0.1,0.18]],
    soft:[[523,0.07,0],[659,0.1,0.11]]
  }[kind]||[[880,0.08,0],[1175,0.1,0.1]];
  notes.forEach(([freq,duration,delay])=>{
    const osc=ctx.createOscillator();
    const gain=ctx.createGain();
    osc.type=kind==='wood'?'triangle':'sine';
    osc.frequency.value=freq;
    gain.gain.setValueAtTime(0.0001,now+delay);
    gain.gain.exponentialRampToValueAtTime(0.08,now+delay+0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001,now+delay+duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now+delay); osc.stop(now+delay+duration+0.02);
  });
}

async function loadProfileAndSettings(){
  if(!currentSession||!sb)return;
  try{
    const [{data:profile},{data:settings}]=await Promise.all([
      sb.from("buddhist_profiles").select("user_id,email,display_name,avatar_url,character_url,friend_code,equipped_costume_id,starter_gender").eq("user_id",currentSession.user.id).maybeSingle(),
      sb.from("buddhist_user_settings").select("*").eq("user_id",currentSession.user.id).maybeSingle()
    ]);
    currentProfile=profile||null;
    if(!settings){
      await sb.from("buddhist_user_settings").upsert({user_id:currentSession.user.id},{onConflict:"user_id"});
    }else{
      userSettings={...userSettings,...settings};
    }
    applyProfileUI();
    applyUserSettings();
    loadLocalUiSettings();
  }catch(e){console.warn("Profile/settings gagal dimuat",e)}
}
function applyProfileUI(){
  const username=currentProfile?.display_name||currentSession?.user?.user_metadata?.full_name||currentSession?.user?.email?.split("@")[0]||"User";
  if($("loginMainText"))$("loginMainText").textContent=username;
  if($("settingsUsername"))$("settingsUsername").value=username;
  if($("settingsEmail"))$("settingsEmail").value=currentSession?.user?.email||"";
  if($("recoveryEmail"))$("recoveryEmail").value=currentSession?.user?.email||"";
  const avatar=currentProfile?.avatar_url||"";
  const renderAvatar=el=>{
    if(!el)return;
    if(avatar)el.innerHTML=`<img src="${esc(avatar)}" alt="${esc(username)}">`;
    else el.textContent="👤";
  };
  renderAvatar($("headerAvatar"));
  renderAvatar($("profileAvatarPreview"));
  if($("accountDataUsername"))$("accountDataUsername").textContent=username;
  if($("accountDataEmail"))$("accountDataEmail").textContent=currentSession?.user?.email||"-";
  if($("accountDataFriendCode"))$("accountDataFriendCode").textContent=currentProfile?.friend_code||"-";
  if($("accountDataRole"))$("accountDataRole").textContent=isOwner?"Owner":isAdmin?"Admin":"Player";
  const character=currentProfile?.character_url||"";
  const charBox=$("profileCharacterPreview");
  if(charBox){
    if(character)charBox.innerHTML=`<img src="${esc(character)}" alt="Karakter ${esc(username)}">`;
    else charBox.textContent="👤";
  }
}
async function saveUserSettings(patch={}){
  userSettings={...userSettings,...patch};
  applyUserSettings();
  if(!currentSession||!sb)return;
  clearTimeout(settingsSaveTimer);
  settingsSaveTimer=setTimeout(async()=>{
    const row={
      user_id:currentSession.user.id,
      theme:userSettings.theme,
      notifications_enabled:!!userSettings.notifications_enabled,
      friend_notifications:!!userSettings.friend_notifications,
      content_notifications:!!userSettings.content_notifications,
      complaint_notifications:!!userSettings.complaint_notifications,
      sound_enabled:!!userSettings.sound_enabled,
      compact_mode:!!userSettings.compact_mode,
      font_scale:userSettings.font_scale||"normal",
      updated_at:new Date().toISOString()
    };
    const {error}=await sb.from("buddhist_user_settings").upsert(row,{onConflict:"user_id"});
    if(error){console.warn(error);say("Pengaturan gagal disimpan");return}
    const badge=$("settingsSavedBadge");
    if(badge){badge.textContent="✓ Tersimpan";setTimeout(()=>badge.textContent="Tersimpan otomatis",1400)}
  },250);
}
function selectSettingsTab(tab){
  $$(".settings-nav [data-settings-tab]").forEach(b=>b.classList.toggle("active",b.dataset.settingsTab===tab));
  $$(".settings-tab-panel").forEach(p=>p.classList.toggle("active",p.id===`settings-${tab}`));
}
function renderSettingsPage(){
  if(!currentSession)return;
  applyProfileUI();applyUserSettings();applyLocalUiSettings();
  $(".owner-setting")?.classList.toggle("hidden",!isOwner);
}
$$(".settings-nav [data-settings-tab]").forEach(b=>b.addEventListener("click",()=>selectSettingsTab(b.dataset.settingsTab)));
$$("[data-theme-choice]").forEach(b=>b.addEventListener("click",()=>saveUserSettings({theme:b.dataset.themeChoice})));
[
  ["notifMaster","notifications_enabled"],
  ["notifFriends","friend_notifications"],
  ["notifContent","content_notifications"],
  ["notifComplaints","complaint_notifications"],
  ["notifSound","sound_enabled"],
  ["compactMode","compact_mode"]
].forEach(([id,key])=>$(id)?.addEventListener("change",e=>saveUserSettings({[key]:e.target.checked})));
$("fontScale")?.addEventListener("change",e=>saveUserSettings({font_scale:e.target.value}));
$("notifSoundType")?.addEventListener("change",e=>{saveLocalUiSettings({notifSoundType:e.target.value});playNotificationSound(e.target.value)});
$("previewNotifSound")?.addEventListener("click",()=>playNotificationSound(uiLocalSettings.notifSoundType||"bell"));
$("hideComplaintHelper")?.addEventListener("change",e=>saveLocalUiSettings({hideComplaintHelper:e.target.checked}));

$("profileAvatarFile")?.addEventListener("change",async e=>{
  const file=e.target.files?.[0]; if(!file||!currentSession||!sb)return;
  if(file.size>5*1024*1024){setStatus("profileSettingsStatus","Ukuran gambar maksimal 5 MB.","error");return}
  setStatus("profileSettingsStatus","Mengunggah foto profil...","pending");
  try{
    const ext=(file.name.split(".").pop()||"jpg").replace(/[^a-z0-9]/gi,"").toLowerCase();
    const path=`${currentSession.user.id}/avatars/profile-${Date.now()}.${ext}`;
    const {error}=await sb.storage.from("buddhist-media").upload(path,file,{upsert:false,contentType:file.type||undefined});
    if(error)throw error;
    const {data}=sb.storage.from("buddhist-media").getPublicUrl(path);
    const avatar_url=data?.publicUrl||"";
    const {error:pe}=await sb.from("buddhist_profiles").update({avatar_url}).eq("user_id",currentSession.user.id);
    if(pe)throw pe;
    currentProfile={...(currentProfile||{}),avatar_url};
    applyProfileUI();
    setStatus("profileSettingsStatus","✓ Foto profil diperbarui.","success");
  }catch(err){setStatus("profileSettingsStatus","Gagal mengunggah foto: "+err.message,"error")}
});
$("saveProfileSettings")?.addEventListener("click",async()=>{
  if(!currentSession||!sb)return;
  const display_name=$("settingsUsername")?.value.trim();
  if(!display_name)return setStatus("profileSettingsStatus","Username tidak boleh kosong.","error");
  setStatus("profileSettingsStatus","Menyimpan profil...","pending");
  const {error}=await sb.from("buddhist_profiles").update({display_name}).eq("user_id",currentSession.user.id);
  if(error)return setStatus("profileSettingsStatus","Gagal menyimpan: "+error.message,"error");
  currentProfile={...(currentProfile||{}),display_name};
  try{await sb.auth.updateUser({data:{full_name:display_name}})}catch(_){}
  applyProfileUI();
  setStatus("profileSettingsStatus","✓ Profil tersimpan.","success");
  await logPlayerActivity("profile_update","account",display_name,"updated username/profile");
});
$("openLinkedAccounts")?.addEventListener("click",openAccountConnect);

$("changePasswordBtn")?.addEventListener("click",async()=>{
  if(!currentSession||!sb)return;
  const p=$("newPassword")?.value||"",c=$("confirmNewPassword")?.value||"";
  if(p.length<6)return setStatus("securitySettingsStatus","Password minimal 6 karakter.","error");
  if(p!==c)return setStatus("securitySettingsStatus","Konfirmasi password tidak sama.","error");
  setStatus("securitySettingsStatus","Mengubah password...","pending");
  const {error}=await sb.auth.updateUser({password:p});
  if(error)return setStatus("securitySettingsStatus","Gagal: "+error.message,"error");
  $("newPassword").value="";$("confirmNewPassword").value="";
  setStatus("securitySettingsStatus","✓ Password berhasil diubah.","success");
  await logPlayerActivity("password_change","account","security","password updated");
});
async function sendPasswordRecovery(email){
  if(!sb&&supabaseReady())sb=window.supabase.createClient(window.BUDDHIST_CONFIG.supabaseUrl,window.BUDDHIST_CONFIG.supabaseAnonKey);
  if(!sb)return {error:{message:"Supabase belum terhubung"}};
  return sb.auth.resetPasswordForEmail(email,{redirectTo:authRedirectUrl()});
}
$("sendRecoveryBtn")?.addEventListener("click",async()=>{
  const email=$("recoveryEmail")?.value.trim();
  if(!email)return setStatus("securitySettingsStatus","Masukkan email akun.","error");
  setStatus("securitySettingsStatus","Mengirim email pemulihan...","pending");
  const {error}=await sendPasswordRecovery(email);
  if(error)return setStatus("securitySettingsStatus","Gagal: "+error.message,"error");
  setStatus("securitySettingsStatus","✓ Email reset password sudah dikirim.","success");
});
$("forgotPasswordBtn")?.addEventListener("click",async()=>{
  const email=$("adminEmail")?.value.trim();
  if(!email)return setAuthStatus("Isi email terlebih dahulu, lalu tekan Lupa sandi.","error");
  setAuthStatus("Mengirim tautan reset password...","pending");
  const {error}=await sendPasswordRecovery(email);
  if(error)return setAuthStatus("Gagal mengirim reset: "+error.message,"error");
  setAuthStatus("✓ Link reset password sudah dikirim ke email.","success");
});

/* Notification center */
function notificationAllowed(row){
  if(!userSettings.notifications_enabled)return false;
  if(row?.type==="complaint"||row?.type==="complaint_status")return false;
  if(row?.type==="friend"&&!userSettings.friend_notifications)return false;
  if(row?.type==="content"&&!userSettings.content_notifications)return false;
  return true;
}
async function loadNotifications(){
  if(!currentSession||!sb)return;
  const {data,error}=await sb.from("buddhist_notifications").select("*").order("created_at",{ascending:false}).limit(50);
  if(error){console.warn(error);return}
  notificationRows=(data||[]).filter(notificationAllowed);
  renderNotifications();
}
function renderNotifications(){
  const root=$("notificationList"),countEl=$("notificationCount"),bell=document.querySelector(".header-bell");
  if(!root)return;
  const unread=notificationRows.filter(n=>!n.is_read).length;
  if(notificationState.ready && unread>notificationState.lastUnread && userSettings.sound_enabled){
    playNotificationSound(uiLocalSettings.notifSoundType||"bell");
  }
  notificationState.lastUnread=unread;
  notificationState.ready=true;
  if(countEl){countEl.textContent=unread>99?"99+":String(unread);countEl.classList.toggle("show",unread>0)}
  bell?.classList.toggle("has-friend-request",unread>0);
  root.innerHTML=notificationRows.length?notificationRows.map(n=>`
    <button class="notification-item${n.is_read?"":" unread"}" type="button" data-notif-id="${n.id}" data-page="${esc(n.target_page||"")}">
      <span class="notification-icon">${n.type==="friend"?"👥":n.type==="coin_request"||n.type==="wallet"?"🪙":n.type==="chat"?"💬":n.type==="content"?"✨":"🔔"}</span>
      <span><b>${esc(n.title)}</b><small>${esc(n.message||"")}</small><time>${new Date(n.created_at).toLocaleString("id-ID")}</time></span>
    </button>`).join(""):'<div class="notification-empty">Belum ada notifikasi.</div>';
}
$("notificationBell")?.addEventListener("click",async e=>{
  e.stopPropagation();
  const p=$("notificationPanel");if(!p)return;
  const open=!p.classList.contains("show");
  p.classList.toggle("show",open);p.setAttribute("aria-hidden",open?"false":"true");
  $("notificationBell").setAttribute("aria-expanded",open?"true":"false");
  if(open)await loadNotifications();
});
document.addEventListener("click",e=>{
  if(!e.target.closest("#notificationPanel")&&!e.target.closest("#notificationBell"))$("notificationPanel")?.classList.remove("show");
});
$("notificationList")?.addEventListener("click",async e=>{
  const item=e.target.closest(".notification-item");if(!item||!sb)return;
  const id=Number(item.dataset.notifId);
  await sb.from("buddhist_notifications").update({is_read:true}).eq("id",id);
  const page=item.dataset.page;
  const row=notificationRows.find(x=>String(x.id)===String(id));
  if(page)showPage(page);
  if(page==="chat"&&row?.target_id)await openPrivateChat(row.target_id);
  $("notificationPanel")?.classList.remove("show");
  await loadNotifications();
});
$("markAllNotifications")?.addEventListener("click",async()=>{
  if(!currentSession||!sb)return;
  await sb.from("buddhist_notifications").update({is_read:true}).eq("user_id",currentSession.user.id).eq("is_read",false);
  await loadNotifications();
});
async function broadcastContentNotification(title,message,targetPage="dashboard",targetId=null){
  if(!sb||!isAdmin)return;
  try{
    await sb.rpc("buddhist_broadcast_notification",{
      p_type:"content",p_title:title,p_message:message,p_target_page:targetPage,p_target_id:targetId?String(targetId):null
    });
  }catch(e){console.warn("Broadcast notifikasi gagal",e)}
}

/* Video comments */
async function renderVideoComments(){
  const root=$("commentList"),label=$("commentVideoLabel"),count=$("commentCount");
  if(!root||!currentSession||!sb||!videos[active])return;
  const v=videos[active],key=videoKey(v);
  if(label)label.textContent=`Diskusi untuk ${v[0]}.`;
  root.innerHTML='<div class="comment-empty">Memuat komentar...</div>';
  let query=sb.from("buddhist_video_comments").select("id,video_id,video_key,user_id,body,created_at").eq("video_key",key).order("created_at",{ascending:false}).limit(100);
  const {data,error}=await query;
  if(error){root.innerHTML='<div class="comment-empty">Komentar belum dapat dimuat.</div>';return}
  const userIds=[...new Set((data||[]).map(x=>x.user_id))];
  let profiles=[];
  if(userIds.length){
    const r=await sb.rpc("buddhist_comment_profiles",{p_user_ids:userIds});
    profiles=r.data||[];
  }
  const map=new Map(profiles.map(p=>[p.user_id,p]));
  if(count)count.textContent=String((data||[]).length);
  root.innerHTML=(data||[]).length?(data||[]).map(c=>{
    const p=map.get(c.user_id)||{},name=p.display_name||"Pemain";
    const avatar=p.avatar_url?`<img src="${esc(p.avatar_url)}" alt="${esc(name)}">`:"👤";
    const canDelete=isOwner||c.user_id===currentSession.user.id;
    return `<article class="comment-item">
      <div class="comment-avatar">${avatar}</div>
      <div class="comment-body"><div class="comment-meta"><b>${esc(name)}</b><time>${new Date(c.created_at).toLocaleString("id-ID")}</time></div><p>${esc(c.body)}</p>${canDelete?`<button class="delete-comment" data-id="${c.id}" type="button">Hapus</button>`:""}</div>
    </article>`;
  }).join(""):'<div class="comment-empty">Belum ada komentar. Jadilah yang pertama.</div>';
}
$("sendCommentBtn")?.addEventListener("click",async()=>{
  if(!currentSession||!sb||!videos[active])return;
  const input=$("commentInput"),body=input?.value.trim();
  if(!body)return say("Tulis komentar terlebih dahulu");
  const v=videos[active],key=videoKey(v);
  const row={video_id:v._id||null,video_key:key,user_id:currentSession.user.id,body};
  const {error}=await sb.from("buddhist_video_comments").insert(row);
  if(error)return say("Komentar gagal dikirim: "+error.message);
  input.value="";
  await renderVideoComments();
  await logPlayerActivity("comment_add","video",v[0],"added comment");
});
$("commentList")?.addEventListener("click",async e=>{
  const b=e.target.closest(".delete-comment");if(!b||!sb)return;
  if(!confirm("Hapus komentar ini?"))return;
  const {error}=await sb.from("buddhist_video_comments").delete().eq("id",Number(b.dataset.id));
  if(error)return say("Komentar gagal dihapus");
  await renderVideoComments();
});

/* Improve session UI without changing existing role logic */
const _applySessionV64=applySession;
applySession=async function(session){
  await _applySessionV64(session);
  if(session&&sb){
    await loadProfileAndSettings();
    await loadWalletEconomy(false);
    await loadLobbyMarket();
    await loadNotifications();
    await renderVideoComments();
    if(document.querySelector("#dashboard.active"))await renderLobbyPage();
  }else{
    currentProfile=null;notificationRows=[];
    if($("notificationCount"))$("notificationCount").classList.remove("show");
  }
};
const _setActiveV64=setActive;
setActive=function(i,center=true,recordHistory=true){
  _setActiveV64(i,center,recordHistory);
  if(currentSession&&sb)renderVideoComments();
};

/* Ensure owner-only page stays hidden unless selected */
function enforceOwnerPageVisibility(){
  $$(".page-view.owner-only").forEach(p=>p.style.display=p.classList.contains("active")&&isOwner?"block":"none");
}
const _showPageV64=showPage;
showPage=function(id){
  _showPageV64(id);
  enforceOwnerPageVisibility();
  if(id==="settings")renderSettingsPage();
};
window.showPage=showPage;

/* Keep file-video controls synchronized with our buttons when possible */
$("playBtn")?.addEventListener("click",()=>{
  const media=$("mediaLayer")?.querySelector("video,audio");
  if(media){media.paused?media.play().catch(()=>{}):media.pause()}
});
$("volumeBtn")?.addEventListener("click",()=>{
  const media=$("mediaLayer")?.querySelector("video,audio");
  if(media)media.muted=muted;
});


/* =========================================================
   V6.5 — MATERIAL VIDEO PICKER, CHAT, CHARACTER & CAISHEN
   ========================================================= */

/* --- Material: pilih video dahulu --- */
function openMaterialVideoPicker(){
  if(!isAdmin)return openAuth("Login admin dulu untuk menambah materi.");
  showPage("material-video-picker");
  renderMaterialVideoPicker();
}
function renderMaterialVideoPicker(filter=""){
  const root=$("materialVideoPickerGrid");if(!root)return;
  const q=String(filter||$("materialPickerSearch")?.value||"").trim().toLowerCase();
  const rows=videos.map((v,i)=>({v,i})).filter(({v})=>!q||[v[0],v[3],v._pinyin,v._description].filter(Boolean).join(" ").toLowerCase().includes(q));
  root.innerHTML=rows.length?rows.map(({v,i})=>{
    const thumb=effectiveVideoThumb(v)||MANTRA_THUMB[i%MANTRA_THUMB.length];
    return `<button class="material-video-choice" type="button" data-video-index="${i}">
      <span class="material-video-choice-thumb">${thumb?`<img src="${esc(thumb)}" alt="${esc(v[0])}">`:"🎬"}</span>
      <span class="material-video-choice-copy"><b>${esc(v[0])}</b><small>${esc(v._pinyin||v[3]||"Video")}</small><em>${esc(v[3]||"Dhamma")}</em></span>
      <span class="material-video-choice-arrow">→</span>
    </button>`;
  }).join(""):'<div class="page-empty">Video tidak ditemukan.</div>';
}
$("materialPickerSearch")?.addEventListener("input",e=>renderMaterialVideoPicker(e.target.value));
$("materialVideoPickerGrid")?.addEventListener("click",e=>{
  const b=e.target.closest("[data-video-index]");if(!b)return;
  const i=Number(b.dataset.videoIndex);if(!videos[i])return;
  resetMaterialForm();
  showPage("tambah-konten");
  selectTab("materi");
  if($("materialParentVideo")){
    $("materialParentVideo").value=String(i);
    $("materialParentVideo").disabled=true;
  }
  if($("materialPageCategory"))$("materialPageCategory").value=videos[i][3]||"";
  syncMaterialPreview();
});

/* --- Secure user uploads for payment proof / reference photos --- */
async function uploadPrivateUserFile(file,folder){
  if(!file||!sb||!currentSession)return "";
  try{
    if(file.size>8*1024*1024)throw new Error("Maksimal 8 MB");
    const safe=(file.name||"file").replace(/[^a-zA-Z0-9._-]+/g,"-");
    const path=`${currentSession.user.id}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2,8)}-${safe}`;
    const {error}=await sb.storage.from("dhamma-private").upload(path,file,{upsert:false,contentType:file.type||undefined});
    if(error)throw error;
    return path;
  }catch(e){console.error(e);say("Upload file gagal: "+e.message);return ""}
}
async function getPrivateSignedUrl(path,seconds=900){
  if(!path||!sb)return "";
  try{
    const {data,error}=await sb.storage.from("dhamma-private").createSignedUrl(path,seconds);
    if(error)throw error;
    return data?.signedUrl||"";
  }catch(e){console.warn(e);return ""}
}

/* --- Chat --- */
async function renderChatPage(){
  if(!currentSession||!sb)return;
  await loadChatContacts();
  await loadChatMessages();
  clearInterval(chatTimer);
  chatTimer=setInterval(()=>{
    if(document.querySelector("#chat.active"))loadChatMessages(false);
  },8000);
}
async function loadChatContacts(){
  const root=$("privateChatFriendList");if(!root||!sb)return;
  try{
    const {data,error}=await sb.rpc("buddhist_friend_dashboard");
    if(error)throw error;
    chatContactRows=(data||[]).filter(x=>x.status==="accepted");
    root.innerHTML=chatContactRows.length?chatContactRows.map(x=>`
      <button class="private-chat-contact${chatRecipientId===x.friend_user_id?" active":""}" type="button" data-user-id="${x.friend_user_id}">
        <span class="chat-contact-avatar">👤</span>
        <span><b>${esc(x.display_name||"Pemain")}</b><small>${x.is_online?"● Online":"Offline"} · ${esc(x.friend_code||"")}</small></span>
      </button>`).join(""):'<div class="chat-empty">Belum ada teman untuk private chat.</div>';
  }catch(e){root.innerHTML='<div class="chat-empty">Gagal memuat teman.</div>'}
}
async function openPrivateChat(userId){
  if(!currentSession||!sb)return;
  const contact=chatContactRows.find(x=>String(x.friend_user_id)===String(userId));
  if(!contact){
    await loadChatContacts();
  }
  const c=chatContactRows.find(x=>String(x.friend_user_id)===String(userId));
  if(!c)return;
  chatMode="private";chatRecipientId=c.friend_user_id;chatRecipientProfile=c;
  $("openGlobalChat")?.classList.remove("active");
  if($("chatModeBadge"))$("chatModeBadge").textContent="Private";
  if($("chatRoomAvatar"))$("chatRoomAvatar").textContent="👤";
  if($("chatRoomTitle"))$("chatRoomTitle").textContent=c.display_name||"Private Chat";
  if($("chatRoomSubtitle"))$("chatRoomSubtitle").textContent=`${c.is_online?"Online":"Offline"} · ${c.friend_code||""}`;
  await loadChatContacts();
  await loadChatMessages();
}
async function openGlobalChatRoom(){
  chatMode="global";chatRecipientId=null;chatRecipientProfile=null;
  $("openGlobalChat")?.classList.add("active");
  if($("chatModeBadge"))$("chatModeBadge").textContent="Global";
  if($("chatRoomAvatar"))$("chatRoomAvatar").textContent="🌏";
  if($("chatRoomTitle"))$("chatRoomTitle").textContent="Global Chat";
  if($("chatRoomSubtitle"))$("chatRoomSubtitle").textContent="Semua player Dhamma Journey";
  await loadChatContacts();
  await loadChatMessages();
}
$("openGlobalChat")?.addEventListener("click",openGlobalChatRoom);
$("privateChatFriendList")?.addEventListener("click",e=>{
  const b=e.target.closest("[data-user-id]");if(b)openPrivateChat(b.dataset.userId);
});
async function loadChatMessages(scrollBottom=true){
  const root=$("chatMessageList");if(!root||!sb||!currentSession)return;
  try{
    let query=sb.from("buddhist_chat_messages")
      .select("id,sender_id,room_type,recipient_id,body,created_at")
      .order("created_at",{ascending:false})
      .limit(100);
    if(chatMode==="global"){
      query=query.eq("room_type","global");
    }else{
      const me=currentSession.user.id,target=chatRecipientId;
      if(!target)return;
      query=query.eq("room_type","private")
        .or(`and(sender_id.eq.${me},recipient_id.eq.${target}),and(sender_id.eq.${target},recipient_id.eq.${me})`);
    }
    const {data,error}=await query;if(error)throw error;
    const rows=(data||[]).reverse();
    const ids=[...new Set(rows.map(x=>x.sender_id))];
    let profiles=[];
    if(ids.length){
      const p=await sb.rpc("buddhist_chat_profiles",{p_user_ids:ids});
      profiles=p.data||[];
    }
    const map=new Map(profiles.map(p=>[p.user_id,p]));
    root.innerHTML=rows.length?rows.map(m=>{
      const mine=m.sender_id===currentSession.user.id,p=map.get(m.sender_id)||{};
      const name=mine?"Kamu":(p.display_name||"Pemain");
      const avatar=p.avatar_url?`<img src="${esc(p.avatar_url)}" alt="${esc(name)}">`:"👤";
      return `<article class="chat-message ${mine?"mine":"theirs"}">
        <div class="chat-message-avatar">${avatar}</div>
        <div class="chat-bubble">
          <div class="chat-message-meta"><b>${esc(name)}</b><time>${new Date(m.created_at).toLocaleString("id-ID")}</time></div>
          <p>${esc(m.body)}</p>
          ${mine?`<button class="chat-delete-message" data-message-id="${m.id}" type="button">Hapus</button>`:""}
        </div>
      </article>`;
    }).join(""):'<div class="chat-empty">Belum ada pesan.</div>';
    if(scrollBottom)root.scrollTop=root.scrollHeight;
  }catch(e){console.error(e);root.innerHTML='<div class="chat-empty">Chat gagal dimuat.</div>'}
}
async function sendCurrentChatMessage(){
  const input=$("chatMessageInput");if(!input||!sb||!currentSession)return;
  const body=input.value.trim();if(!body)return;
  const row={sender_id:currentSession.user.id,room_type:chatMode,recipient_id:chatMode==="private"?chatRecipientId:null,body};
  if(chatMode==="private"&&!chatRecipientId)return say("Pilih teman untuk private chat");
  const {error}=await sb.from("buddhist_chat_messages").insert(row);
  if(error)return say("Pesan gagal dikirim: "+error.message);
  input.value="";
  await loadChatMessages(true);
}
$("sendChatMessage")?.addEventListener("click",sendCurrentChatMessage);
$("chatMessageInput")?.addEventListener("keydown",e=>{
  if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendCurrentChatMessage()}
});
$("chatMessageList")?.addEventListener("click",async e=>{
  const b=e.target.closest(".chat-delete-message");if(!b||!sb)return;
  const {error}=await sb.from("buddhist_chat_messages").delete().eq("id",Number(b.dataset.messageId));
  if(error)return say("Pesan gagal dihapus");
  await loadChatMessages(false);
});

/* --- Caishen economy --- */
async function loadWalletEconomy(render=true){
  if(!currentSession||!sb)return;
  try{
    await sb.rpc("buddhist_ensure_wallet");
    const [wallet,config,methods]=await Promise.all([
      sb.from("buddhist_wallets").select("balance").eq("user_id",currentSession.user.id).maybeSingle(),
      sb.from("buddhist_economy_config").select("*").eq("id",1).maybeSingle(),
      sb.from("buddhist_payment_methods").select("*").order("created_at")
    ]);
    caishenBalance=Number(wallet.data?.balance||0);
    economyConfig={...economyConfig,...(config.data||{})};
    paymentMethods=methods.data||[];
    if(render)applyCaishenUI();
  }catch(e){console.warn("Economy load failed",e)}
}
function applyCaishenUI(){
  if($("caishenBalance"))$("caishenBalance").textContent=String(caishenBalance);
  if($("profileCaishenBalance"))$("profileCaishenBalance").textContent=String(caishenBalance);
  if($("caishenCharacterCost"))$("caishenCharacterCost").textContent=`${economyConfig.character_cost||100} Coin`;
  if($("profileCharacterCost"))$("profileCharacterCost").textContent=`${economyConfig.character_cost||100} Coin`;
  if($("ownerCharacterCost"))$("ownerCharacterCost").value=economyConfig.character_cost||100;
  if($("ownerMinTopup"))$("ownerMinTopup").value=economyConfig.min_topup_idr||10000;
  renderPaymentMethodSelect();
  updateTopupEstimate();
}
function renderPaymentMethodSelect(){
  const sel=$("topupPaymentMethod");if(!sel)return;
  const active=paymentMethods.filter(x=>x.is_active);
  const current=sel.value;
  sel.innerHTML='<option value="">Pilih e-wallet / bank</option>'+active.map(x=>`<option value="${x.id}">${esc(x.provider_name)} · ${x.method_type==="bank"?"Bank":"E-Wallet"}</option>`).join("");
  if(active.some(x=>String(x.id)===String(current)))sel.value=current;
  updatePaymentDestination();
}
function updatePaymentDestination(){
  const box=$("topupPaymentDestination"),id=Number($("topupPaymentMethod")?.value||0);
  const m=paymentMethods.find(x=>Number(x.id)===id);
  if(!box)return;
  box.innerHTML=m?`<b>${esc(m.provider_name)}</b><span>${esc(m.account_number)}</span><small>a.n. ${esc(m.account_name)} · Rp${Number(m.idr_per_coin).toLocaleString("id-ID")} / 1 Coin</small>`:"Owner belum menambahkan metode pembayaran.";
  updateTopupEstimate();
}
function updateTopupEstimate(){
  const id=Number($("topupPaymentMethod")?.value||0),amount=Number($("topupAmountIdr")?.value||0);
  const m=paymentMethods.find(x=>Number(x.id)===id);
  const coins=m?Math.floor(amount/Number(m.idr_per_coin||1)):0;
  if($("topupCoinEstimate"))$("topupCoinEstimate").textContent=`${Math.max(0,coins)} Coin`;
}
$("topupPaymentMethod")?.addEventListener("change",updatePaymentDestination);
$("topupAmountIdr")?.addEventListener("input",updateTopupEstimate);

async function renderCaishenPage(){
  if(!currentSession||!sb)return;
  await loadWalletEconomy(true);
  await Promise.all([renderWalletTransactions(),renderMyEconomyRequests()]);
  if(isOwner)await renderCaishenOwnerAdmin();
}
async function renderWalletTransactions(){
  const root=$("walletTransactionList");if(!root||!sb)return;
  const {data,error}=await sb.from("buddhist_wallet_transactions").select("*").eq("user_id",currentSession.user.id).order("created_at",{ascending:false}).limit(50);
  if(error){root.innerHTML='<div class="page-empty">Riwayat gagal dimuat.</div>';return}
  root.innerHTML=(data||[]).length?(data||[]).map(x=>`<div class="economy-row">
    <div><b>${x.kind==="topup"?"Top Up":x.kind==="character"?"Request Karakter":x.kind==="refund"?"Refund":x.kind==="owner_grant"?"Coin dari Owner":x.kind==="market"?"Market":"Penyesuaian"}</b><small>${esc(x.note||"")} · ${new Date(x.created_at).toLocaleString("id-ID")}</small></div>
    <strong class="${Number(x.delta)>=0?"positive":"negative"}">${Number(x.delta)>=0?"+":""}${x.delta}</strong>
  </div>`).join(""):'<div class="page-empty">Belum ada transaksi.</div>';
}
async function renderMyEconomyRequests(){
  const root=$("myEconomyRequestList");if(!root||!sb)return;
  const [t,c]=await Promise.all([
    sb.from("buddhist_topup_requests").select("*").eq("user_id",currentSession.user.id).order("created_at",{ascending:false}).limit(20),
    sb.from("buddhist_character_requests").select("*").eq("user_id",currentSession.user.id).order("created_at",{ascending:false}).limit(20)
  ]);
  const rows=[
    ...(t.data||[]).map(x=>({kind:"Top Up",status:x.status,detail:`Rp${Number(x.amount_idr).toLocaleString("id-ID")} → ${x.coins} Coin`,created_at:x.created_at})),
    ...(c.data||[]).map(x=>({kind:"Karakter",status:x.status,detail:`${x.cost_coins} Coin`,created_at:x.created_at}))
  ].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
  root.innerHTML=rows.length?rows.map(x=>`<div class="economy-row"><div><b>${esc(x.kind)}</b><small>${esc(x.detail)} · ${new Date(x.created_at).toLocaleString("id-ID")}</small></div><span class="economy-status ${esc(x.status)}">${esc(x.status)}</span></div>`).join(""):'<div class="page-empty">Belum ada request.</div>';
}
$("submitTopupBtn")?.addEventListener("click",async()=>{
  if(!currentSession||!sb)return;
  const methodId=Number($("topupPaymentMethod")?.value||0),amount=Number($("topupAmountIdr")?.value||0),file=$("topupProofFile")?.files?.[0];
  if(!methodId)return setStatus("topupStatus","Pilih metode pembayaran.","error");
  if(amount<Number(economyConfig.min_topup_idr||10000))return setStatus("topupStatus",`Minimum top up Rp${Number(economyConfig.min_topup_idr||10000).toLocaleString("id-ID")}.`,"error");
  if(!file)return setStatus("topupStatus","Upload bukti pembayaran terlebih dahulu.","error");
  setStatus("topupStatus","Mengupload bukti pembayaran...","pending");
  const path=await uploadPrivateUserFile(file,"topups");if(!path)return setStatus("topupStatus","Upload bukti gagal.","error");
  const {error}=await sb.rpc("buddhist_submit_topup",{p_payment_method_id:methodId,p_amount_idr:amount,p_proof_url:path});
  if(error)return setStatus("topupStatus","Gagal: "+error.message,"error");
  $("topupAmountIdr").value="";$("topupProofFile").value="";updateTopupEstimate();
  setStatus("topupStatus","✓ Request top up dikirim. Menunggu persetujuan Owner.","success");
  await renderMyEconomyRequests();
});
async function submitCharacterRequest(referenceFile,notes,statusId){
  if(!currentSession||!sb)return false;
  if(!referenceFile){setStatus(statusId,"Upload foto referensi terlebih dahulu.","error");return false}
  if(caishenBalance<Number(economyConfig.character_cost||100)){setStatus(statusId,"Saldo Coin tidak cukup. Silakan top up.","error");return false}
  setStatus(statusId,"Mengupload foto referensi...","pending");
  const path=await uploadPrivateUserFile(referenceFile,"characters");if(!path){setStatus(statusId,"Upload foto gagal.","error");return false}
  const {error}=await sb.rpc("buddhist_submit_character_request",{p_reference_url:path,p_notes:notes||""});
  if(error){setStatus(statusId,"Gagal: "+error.message,"error");return false}
  setStatus(statusId,"✓ Request karakter dikirim ke Owner.","success");
  await loadWalletEconomy(true);await renderWalletTransactions();await renderMyEconomyRequests();
  return true;
}
$("submitCharacterRequestBtn")?.addEventListener("click",async()=>{
  const ok=await submitCharacterRequest($("characterReferenceFile")?.files?.[0],$("characterRequestNotes")?.value.trim(),"characterRequestStatus");
  if(ok){$("characterReferenceFile").value="";$("characterRequestNotes").value=""}
});
$("profileRequestCharacterBtn")?.addEventListener("click",()=>$("profileCharacterRequestBox")?.classList.toggle("hidden"));
$("profileTopupBtn")?.addEventListener("click",()=>{closeAccountConnect();showPage("caishen")});
$("profileSubmitCharacterRequest")?.addEventListener("click",async()=>{
  const ok=await submitCharacterRequest($("profileCharacterReference")?.files?.[0],$("profileCharacterNotes")?.value.trim(),"profileCharacterStatus");
  if(ok){$("profileCharacterReference").value="";$("profileCharacterNotes").value="";$("profileCharacterRequestBox")?.classList.add("hidden")}
});

/* Owner economy controls */
async function renderCaishenOwnerAdmin(){
  if(!isOwner||!sb)return;
  await loadWalletEconomy(true);
  const [topups,characters]=await Promise.all([
    sb.from("buddhist_topup_requests").select("*").order("created_at",{ascending:false}).limit(100),
    sb.from("buddhist_character_requests").select("*").order("created_at",{ascending:false}).limit(100)
  ]);
  renderOwnerPaymentMethods();
  await Promise.all([
    loadOwnerWalletAccounts(),
    renderOwnerFinanceSummary(),
    renderOwnerCashLedger(),
    renderOwnerCoinLedger()
  ]);
  await renderOwnerTopups(topups.data||[]);
  await renderOwnerCharacters(characters.data||[]);
}
function renderOwnerPaymentMethods(){
  const root=$("ownerPaymentMethodList");if(!root)return;
  root.innerHTML=paymentMethods.length?paymentMethods.map(x=>`<div class="economy-row owner-payment-row">
    <div><b>${esc(x.provider_name)} · ${x.method_type==="bank"?"Bank":"E-Wallet"}</b><small>${esc(x.account_number)} · a.n. ${esc(x.account_name)} · Rp${Number(x.idr_per_coin).toLocaleString("id-ID")}/Coin</small></div>
    <div class="economy-actions"><button class="mini-btn toggle-payment" data-id="${x.id}" data-active="${x.is_active?"1":"0"}" type="button">${x.is_active?"Nonaktifkan":"Aktifkan"}</button><button class="mini-btn delete-payment" data-id="${x.id}" type="button">Hapus</button></div>
  </div>`).join(""):'<div class="page-empty">Belum ada metode pembayaran.</div>';
}
$("saveEconomyConfig")?.addEventListener("click",async()=>{
  if(!isOwner||!sb)return;
  const character_cost=Number($("ownerCharacterCost")?.value||100),min_topup_idr=Number($("ownerMinTopup")?.value||10000);
  const {error}=await sb.from("buddhist_economy_config").update({character_cost,min_topup_idr,updated_at:new Date().toISOString()}).eq("id",1);
  if(error)return say("Gagal menyimpan pengaturan");
  say("Pengaturan Coin disimpan");await loadWalletEconomy(true);
});
$("savePaymentMethod")?.addEventListener("click",async()=>{
  if(!isOwner||!sb)return;
  const row={
    method_type:$("paymentMethodType")?.value||"ewallet",
    provider_name:$("paymentProviderName")?.value.trim(),
    account_name:$("paymentAccountName")?.value.trim(),
    account_number:$("paymentAccountNumber")?.value.trim(),
    idr_per_coin:Number($("paymentIdrPerCoin")?.value||1000),
    is_active:true,
    updated_at:new Date().toISOString()
  };
  if(!row.provider_name||!row.account_name||!row.account_number||row.idr_per_coin<1)return say("Lengkapi metode pembayaran");
  const {error}=await sb.from("buddhist_payment_methods").insert(row);
  if(error)return say("Gagal menambah metode: "+error.message);
  ["paymentProviderName","paymentAccountName","paymentAccountNumber"].forEach(id=>{if($(id))$(id).value=""});
  say("Metode pembayaran ditambahkan");await loadWalletEconomy(true);renderOwnerPaymentMethods();
});
$("ownerPaymentMethodList")?.addEventListener("click",async e=>{
  if(!isOwner||!sb)return;
  const toggle=e.target.closest(".toggle-payment"),del=e.target.closest(".delete-payment");
  if(toggle){
    const id=Number(toggle.dataset.id),next=toggle.dataset.active!=="1";
    const {error}=await sb.from("buddhist_payment_methods").update({is_active:next,updated_at:new Date().toISOString()}).eq("id",id);
    if(!error){await loadWalletEconomy(true);renderOwnerPaymentMethods()}
  }else if(del){
    const id=Number(del.dataset.id);
    if(!confirm("Hapus metode pembayaran ini?"))return;
    const {error}=await sb.from("buddhist_payment_methods").delete().eq("id",id);
    if(error)return say("Metode tidak dapat dihapus bila sudah dipakai request.");
    await loadWalletEconomy(true);renderOwnerPaymentMethods();
  }
});
async function renderOwnerTopups(rows){
  const root=$("ownerTopupList");if(!root)return;
  root.innerHTML=rows.length?rows.map(x=>{
    const method=paymentMethods.find(m=>Number(m.id)===Number(x.payment_method_id));
    return `<div class="economy-owner-request topup-review-row">
      <div class="economy-owner-main">
        <b>Top Up #${x.id}</b>
        <small>Uang dikirim: Rp${Number(x.amount_idr).toLocaleString("id-ID")} · ${esc(method?.provider_name||"Metode")}</small>
        <small>${x.status==="pending"?"Estimasi sistem": "Coin diberikan"}: ${Number(x.coins||0).toLocaleString("id-ID")} Coin</small>
        <span class="economy-status ${esc(x.status)}">${esc(x.status)}</span>
      </div>
      <div class="economy-actions topup-review-actions">
        <button class="mini-btn view-topup-proof" data-path="${esc(x.proof_url)}" type="button">Lihat Bukti</button>
        ${x.status==="pending"?`
          <label class="approve-coin-field">Coin yang diberikan
            <input class="approve-topup-coins" data-id="${x.id}" type="number" min="1" step="1" value="${Number(x.coins||0)}">
          </label>
          <button class="mini-btn approve-topup" data-id="${x.id}" type="button">Uang Sudah Masuk → Beri Coin</button>
          <button class="mini-btn reject-topup" data-id="${x.id}" type="button">Tolak</button>
        `:""}
      </div>
    </div>`;
  }).join(""):'<div class="page-empty">Belum ada request top up.</div>';
}
$("ownerTopupList")?.addEventListener("click",async e=>{
  if(!isOwner||!sb)return;
  const view=e.target.closest(".view-topup-proof");
  if(view){const url=await getPrivateSignedUrl(view.dataset.path);if(url)window.open(url,"_blank","noopener");return}
  const app=e.target.closest(".approve-topup"),rej=e.target.closest(".reject-topup");
  if(app||rej){
    const id=Number((app||rej).dataset.id),approve=!!app;
    let coins=null;
    let note="";
    if(approve){
      const input=$$(".approve-topup-coins").find(x=>Number(x.dataset.id)===id);
      coins=Number(input?.value||0);
      if(!coins||coins<1)return say("Isi jumlah Coin yang akan diberikan.");
      if(!confirm(`Konfirmasi uang sudah benar-benar masuk dan berikan ${coins.toLocaleString("id-ID")} Coin?`))return;
      note=prompt("Catatan approval (opsional):")||"";
    }else{
      note=prompt("Alasan penolakan (opsional):")||"";
    }
    const {error}=await sb.rpc("buddhist_owner_review_topup",{
      p_request_id:id,p_approve:approve,p_note:note,p_coins:approve?coins:null
    });
    if(error)return say("Gagal memproses top up: "+error.message);
    say(approve?`${coins} Coin sudah diberikan setelah uang dikonfirmasi masuk`:"Top up ditolak");
    await renderCaishenPage();
  }
});

function formatRupiah(value){
  return "Rp"+Number(value||0).toLocaleString("id-ID");
}
async function loadOwnerWalletAccounts(){
  if(!isOwner||!sb)return;
  const {data,error}=await sb.rpc("buddhist_owner_wallet_accounts");
  if(error){console.warn(error);return}
  ownerWalletAccounts=data||[];
  const sel=$("ownerGrantAccount");
  if(sel){
    const current=sel.value;
    sel.innerHTML='<option value="">Pilih akun player</option>'+ownerWalletAccounts.map(x=>`<option value="${x.user_id}">${esc(x.display_name||"Player")} · ${esc(x.email||"")} · ${Number(x.balance||0)} Coin</option>`).join("");
    if(ownerWalletAccounts.some(x=>x.user_id===current))sel.value=current;
  }
  updateOwnerGrantAccountInfo();
}
function updateOwnerGrantAccountInfo(){
  const box=$("ownerGrantAccountInfo"),id=$("ownerGrantAccount")?.value;
  if(!box)return;
  const row=ownerWalletAccounts.find(x=>x.user_id===id);
  box.innerHTML=row?`<b>${esc(row.display_name||"Player")}</b><span>${esc(row.email||"")}</span><small>Friend ID ${esc(row.friend_code||"-")} · Saldo ${Number(row.balance||0).toLocaleString("id-ID")} Coin · ${row.is_owner?"Owner":row.role||"viewer"}</small>`:"Pilih akun untuk melihat saldo saat ini.";
}
$("ownerGrantAccount")?.addEventListener("change",updateOwnerGrantAccountInfo);

$("ownerGrantCoinsBtn")?.addEventListener("click",async()=>{
  if(!isOwner||!sb)return;
  const userId=$("ownerGrantAccount")?.value;
  const coins=Number($("ownerGrantCoins")?.value||0);
  const note=$("ownerGrantNote")?.value.trim()||"";
  if(!userId)return setStatus("ownerGrantStatus","Pilih akun terlebih dahulu.","error");
  if(!coins||coins<1)return setStatus("ownerGrantStatus","Jumlah Coin minimal 1.","error");
  const account=ownerWalletAccounts.find(x=>x.user_id===userId);
  if(!confirm(`Tambahkan ${coins.toLocaleString("id-ID")} Coin ke ${account?.display_name||account?.email||"akun ini"}?`))return;
  setStatus("ownerGrantStatus","Menambahkan Coin...","pending");
  const {data,error}=await sb.rpc("buddhist_owner_grant_coins",{p_target_user_id:userId,p_coins:coins,p_note:note});
  if(error)return setStatus("ownerGrantStatus","Gagal: "+error.message,"error");
  setStatus("ownerGrantStatus",`✓ Coin berhasil ditambahkan. Saldo baru ${Number(data||0).toLocaleString("id-ID")} Coin.`,"success");
  if($("ownerGrantCoins"))$("ownerGrantCoins").value="";
  if($("ownerGrantNote"))$("ownerGrantNote").value="";
  await Promise.all([loadOwnerWalletAccounts(),renderOwnerFinanceSummary(),renderOwnerCoinLedger()]);
});

$("ownerAddCashEntryBtn")?.addEventListener("click",async()=>{
  if(!isOwner||!sb)return;
  const direction=$("ownerCashDirection")?.value||"income";
  const amount=Number($("ownerCashAmount")?.value||0);
  const category=$("ownerCashCategory")?.value||"other";
  const note=$("ownerCashNote")?.value.trim()||"";
  if(!amount||amount<1)return setStatus("ownerCashStatus","Nominal Rupiah harus lebih dari 0.","error");
  setStatus("ownerCashStatus","Menyimpan transaksi...","pending");
  const {error}=await sb.rpc("buddhist_owner_add_cash_entry",{
    p_direction:direction,p_amount_idr:amount,p_category:category,p_note:note
  });
  if(error)return setStatus("ownerCashStatus","Gagal: "+error.message,"error");
  setStatus("ownerCashStatus","✓ Transaksi kas tersimpan.","success");
  if($("ownerCashAmount"))$("ownerCashAmount").value="";
  if($("ownerCashNote"))$("ownerCashNote").value="";
  await Promise.all([renderOwnerFinanceSummary(),renderOwnerCashLedger()]);
});

async function renderOwnerFinanceSummary(){
  if(!isOwner||!sb)return;
  const {data,error}=await sb.rpc("buddhist_owner_finance_summary");
  if(error){console.warn(error);return}
  const s=Array.isArray(data)?data[0]:data;
  ownerFinanceSummary=s||{};
  const set=(id,val)=>{if($(id))$(id).textContent=val};
  set("financeCashIncome",formatRupiah(s?.cash_income_idr));
  set("financeCashExpense",formatRupiah(s?.cash_expense_idr));
  set("financeCashBalance",formatRupiah(s?.cash_balance_idr));
  set("financePaidCoins",Number(s?.approved_topup_coins||0).toLocaleString("id-ID"));
  set("financeGrantedCoins",Number(s?.owner_grant_coins||0).toLocaleString("id-ID"));
  set("financeWalletCoins",Number(s?.wallet_balance_coins||0).toLocaleString("id-ID"));
  set("financeApprovedTopupMoney",formatRupiah(s?.approved_topup_idr));
  set("financeApprovedTopupCoins",Number(s?.approved_topup_coins||0).toLocaleString("id-ID"));
  set("financeSpentCoins",Number(s?.spent_coins||0).toLocaleString("id-ID"));
  set("financeRefundedCoins",Number(s?.refunded_coins||0).toLocaleString("id-ID"));
  const paidCoins=Number(s?.approved_topup_coins||0),money=Number(s?.approved_topup_idr||0);
  const rate=paidCoins>0?Math.round(money/paidCoins):0;
  set("financeEffectiveRate",`${formatRupiah(rate)} / Coin`);
}

async function renderOwnerCashLedger(){
  const root=$("ownerCashLedgerList");if(!root||!isOwner||!sb)return;
  const {data,error}=await sb.from("buddhist_cash_ledger").select("*").order("created_at",{ascending:false}).limit(100);
  if(error){root.innerHTML='<div class="page-empty">Rincian uang gagal dimuat.</div>';return}
  root.innerHTML=(data||[]).length?(data||[]).map(x=>`<div class="finance-ledger-row">
    <div class="finance-ledger-main">
      <b>${x.direction==="income"?"Pemasukan":"Pengeluaran"} · ${esc(x.category||"other")}</b>
      <small>${esc(x.note||"")} · ${new Date(x.created_at).toLocaleString("id-ID")}</small>
    </div>
    <strong class="${x.direction==="income"?"positive":"negative"}">${x.direction==="income"?"+":"-"}${formatRupiah(x.amount_idr)}</strong>
  </div>`).join(""):'<div class="page-empty">Belum ada transaksi uang.</div>';
}

async function renderOwnerCoinLedger(){
  const root=$("ownerCoinLedgerList");if(!root||!isOwner||!sb)return;
  const [{data,error},{data:accounts}]=await Promise.all([
    sb.from("buddhist_wallet_transactions").select("*").order("created_at",{ascending:false}).limit(100),
    sb.rpc("buddhist_owner_wallet_accounts")
  ]);
  if(error){root.innerHTML='<div class="page-empty">Rincian Coin gagal dimuat.</div>';return}
  const map=new Map((accounts||[]).map(x=>[x.user_id,x]));
  root.innerHTML=(data||[]).length?(data||[]).map(x=>{
    const a=map.get(x.user_id)||{};
    const label=x.kind==="topup"?"Top Up":x.kind==="owner_grant"?"Grant Owner":x.kind==="refund"?"Refund":x.kind==="character"?"Karakter / Market":x.kind;
    return `<div class="finance-ledger-row">
      <div class="finance-ledger-main"><b>${esc(label)} · ${esc(a.display_name||a.email||"Player")}</b><small>${esc(x.note||"")} · ${new Date(x.created_at).toLocaleString("id-ID")}</small></div>
      <strong class="${Number(x.delta)>=0?"positive":"negative"}">${Number(x.delta)>=0?"+":""}${Number(x.delta).toLocaleString("id-ID")} Coin</strong>
    </div>`;
  }).join(""):'<div class="page-empty">Belum ada transaksi Coin.</div>';
}
$("refreshCashLedger")?.addEventListener("click",async()=>{await Promise.all([renderOwnerCashLedger(),renderOwnerFinanceSummary()])});
$("refreshCoinLedger")?.addEventListener("click",async()=>{await Promise.all([renderOwnerCoinLedger(),renderOwnerFinanceSummary(),loadOwnerWalletAccounts()])});

async function renderOwnerCharacters(rows){
  const root=$("ownerCharacterRequestList");if(!root)return;
  root.innerHTML=rows.length?rows.map(x=>`<div class="economy-owner-request character-owner-request">
    <div class="economy-owner-main"><b>Karakter #${x.id} · ${x.cost_coins} Coin</b><small>${esc(x.notes||"Tanpa catatan")}</small><span class="economy-status ${esc(x.status)}">${esc(x.status)}</span></div>
    <div class="economy-actions">
      <button class="mini-btn view-character-reference" data-path="${esc(x.reference_url)}" type="button">Foto Referensi</button>
      ${["pending","in_progress"].includes(x.status)?`<button class="mini-btn progress-character" data-id="${x.id}" type="button">Kerjakan</button><label class="mini-file-btn">Hasil<input class="character-result-file" data-id="${x.id}" type="file" accept="image/png,image/jpeg,image/webp" hidden></label><button class="mini-btn complete-character" data-id="${x.id}" type="button">Selesai</button><button class="mini-btn reject-character" data-id="${x.id}" type="button">Tolak + Refund</button>`:""}
      ${x.result_url?`<a class="mini-btn" href="${esc(x.result_url)}" target="_blank" rel="noopener">Lihat Hasil</a>`:""}
    </div>
  </div>`).join(""):'<div class="page-empty">Belum ada request karakter.</div>';
}
$("ownerCharacterRequestList")?.addEventListener("click",async e=>{
  if(!isOwner||!sb)return;
  const ref=e.target.closest(".view-character-reference");
  if(ref){const url=await getPrivateSignedUrl(ref.dataset.path);if(url)window.open(url,"_blank","noopener");return}
  const progress=e.target.closest(".progress-character"),complete=e.target.closest(".complete-character"),reject=e.target.closest(".reject-character");
  if(progress){
    const {error}=await sb.rpc("buddhist_owner_update_character_request",{p_request_id:Number(progress.dataset.id),p_status:"in_progress",p_result_url:null,p_note:""});
    if(error)return say("Gagal mengubah status");
    await renderCaishenPage();return;
  }
  if(reject){
    const note=prompt("Catatan penolakan (opsional):")||"";
    const {error}=await sb.rpc("buddhist_owner_update_character_request",{p_request_id:Number(reject.dataset.id),p_status:"rejected",p_result_url:null,p_note:note});
    if(error)return say("Gagal menolak request");
    await renderCaishenPage();return;
  }
  if(complete){
    const id=Number(complete.dataset.id);
    const file=$$(".character-result-file").find(x=>Number(x.dataset.id)===id)?.files?.[0];
    if(!file)return say("Pilih file hasil karakter terlebih dahulu");
    const url=await uploadMedia(file,"character-results");
    if(!url)return;
    const {error}=await sb.rpc("buddhist_owner_update_character_request",{p_request_id:id,p_status:"completed",p_result_url:url,p_note:""});
    if(error)return say("Gagal menyelesaikan request: "+error.message);
    say("Karakter selesai dan dipasang ke profil player");
    await renderCaishenPage();
  }
});
$("refreshCaishenAdmin")?.addEventListener("click",renderCaishenOwnerAdmin);


/* =========================================================
   V6.6 — LOBBY, ANIMATED MONK, MARKET, AI COMPANION
   ========================================================= */
function getEquippedStyleKey(){
  const equipped=lobbyMarketRows.find(x=>x.equipped);
  return equipped?.style_key||"starter";
}
function applyLobbyCharacter(){
  const name=currentProfile?.display_name||currentSession?.user?.email?.split("@")[0]||"Player";
  if($("lobbyPlayerName"))$("lobbyPlayerName").textContent=name;
  if($("lobbyCaishenBalance"))$("lobbyCaishenBalance").textContent=String(caishenBalance);

  const living=$("livingCharacter"),customWrap=$("lobbyCustomCharacter"),customImg=$("lobbyCustomCharacterImg"),fallback=$("lobbyMonk");
  const gender=currentProfile?.starter_gender||"male";

  if(living){
    living.dataset.gender=gender;
    living.classList.toggle("gender-female",gender==="female");
    living.classList.remove("hidden");
  }
  if($("livingGenderChip"))$("livingGenderChip").textContent=gender==="female"?"Perempuan":"Laki-laki";
  if($("lobbyCharacterTitle"))$("lobbyCharacterTitle").textContent="Karakter Pendamping";

  customWrap?.classList.add("hidden");
  fallback?.classList.add("hidden");

  const custom=currentProfile?.character_url||"";
  if(custom&&customWrap&&customImg){
    const token=++customCharacterLoadToken;
    customImg.onload=()=>{
      if(token!==customCharacterLoadToken)return;
      living?.classList.add("hidden");
      customWrap.classList.remove("hidden");
      if($("lobbyCharacterTitle"))$("lobbyCharacterTitle").textContent="Karakter Custom";
    };
    customImg.onerror=()=>{
      if(token!==customCharacterLoadToken)return;
      customWrap.classList.add("hidden");
      living?.classList.remove("hidden");
      if($("lobbyCharacterTitle"))$("lobbyCharacterTitle").textContent="Karakter Pendamping";
    };
    customImg.src=custom;
  }

  if(currentSession&&!currentProfile?.starter_gender&&!custom){
    setTimeout(()=>openStarterCharacterPicker(true),500);
  }
}
function setMonkMood(text){if($("lobbyCharacterMood"))$("lobbyCharacterMood").textContent=text}
function updateCharacterVoiceButton(){
  const b=$("characterVoiceBtn");
  if(b)b.remove();
}
function chooseCharacterVoice(){return null}
function stopCharacterVoice(){
  clearTimeout(characterVoiceTimer);characterVoiceTimer=null;
  characterVoiceActive=false;
}
function speakCharacterVoice(){
  // V7.7: character voice intentionally removed. Visual mouth/head animation remains.
  characterVoiceActive=false;
}
function activeLobbyCharacter(){
  if(!$('lobbyCustomCharacter')?.classList.contains('hidden'))return $('lobbyCustomCharacter');
  if(!$('livingCharacter')?.classList.contains('hidden'))return $('livingCharacter');
  if(!$('lobbyMonk')?.classList.contains('hidden'))return $('lobbyMonk');
  return $('livingCharacter')||$('lobbyMonk');
}
function monkGesture(kind){
  const target=activeLobbyCharacter();if(!target)return;
  const classes=["look-left","look-right","look-up","look-down","gesture-wave","gesture-meditate","gesture-nod"];
  classes.forEach(c=>target.classList.remove(c));
  void target.offsetWidth;
  target.classList.add(kind);

  const mood={
    "look-left":"melihat ke kiri",
    "look-right":"melihat ke kanan",
    "look-up":"melihat ke atas",
    "look-down":"memperhatikan sekitar",
    "gesture-wave":"menyapamu",
    "gesture-meditate":"sedang tenang",
    "gesture-nod":"mengangguk"
  };
  setMonkMood(mood[kind]||"menemanimu");
  if(kind==="gesture-wave"){
    const hello="Halo! Senang bertemu denganmu. Yuk, kita jalani perjalanan ini bersama. 👋";
    showLobbyReaction(hello,2600);
    speakCharacterVoice(hello);
  }
  if(kind==="gesture-meditate"){
    const calm="Tarik napas perlahan... lalu lepaskan dengan tenang. 🪷";
    showLobbyReaction(calm,3000);
    speakCharacterVoice(calm);
  }

  setTimeout(()=>{
    target.classList.remove(kind);
    if(!target.classList.contains("is-speaking"))setMonkMood("sedang memperhatikan sekeliling");
  },kind==="gesture-meditate"?3200:1500);
}
function startMonkIdle(){
  clearInterval(monkIdleTimer);
  const seq=["look-left","look-right","look-up","look-down","gesture-nod"];
  let i=0;
  const tick=()=>{
    const target=activeLobbyCharacter();
    if(document.querySelector("#dashboard.active")&&target&&!target.classList.contains("is-speaking")){
      monkGesture(seq[i++%seq.length]);
    }
    monkIdleTimer=setTimeout(tick,4200+Math.random()*2200);
  };
  clearTimeout(monkIdleTimer);
  monkIdleTimer=setTimeout(tick,4200);
}
function stopCharacterSpeech(){
  clearInterval(characterSpeechTimer);
  characterSpeechTimer=null;
  stopCharacterVoice();

  const target=activeLobbyCharacter();
  target?.classList.remove("is-speaking","gesture-nod");

  const bubble=$("characterSpeechBubble");
  bubble?.classList.add("hidden");
  if(bubble)bubble.textContent="";

  setMonkMood("sedang memperhatikan sekeliling");
}
function speakLobbyCharacter(text){
  stopCharacterSpeech();

  const target=activeLobbyCharacter(),bubble=$("characterSpeechBubble");
  if(!target||!text)return;

  target.classList.add("is-speaking");
  setMonkMood("sedang menjawabmu");

  const clean=String(text).replace(/\s+/g," ").trim();
  if(bubble){
    bubble.textContent="";
    bubble.classList.remove("hidden");
  }

  speakCharacterVoice(clean);

  let i=0;
  const interval=Math.max(20,Math.min(40,Math.round(3000/Math.max(clean.length,1))));
  characterSpeechTimer=setInterval(()=>{
    i=Math.min(clean.length,i+2);
    if(bubble)bubble.textContent=clean.slice(0,i)+(i<clean.length?"▌":"");

    if(i>=clean.length){
      clearInterval(characterSpeechTimer);
      characterSpeechTimer=null;
      setTimeout(()=>{
        if(!characterVoiceActive){
          target.classList.remove("is-speaking");
          const b=$("characterSpeechBubble");
          b?.classList.add("hidden");
          if(b)b.textContent="";
          if(!target.classList.contains("gesture-meditate"))setMonkMood("sedang memperhatikan sekeliling");
        }
      },900);
    }
  },interval);
}
function openStarterCharacterPicker(auto=false){
  if(!currentSession){
    if(!auto)openAuth("Login dulu untuk memilih karakter.");
    return;
  }

  const modal=$("starterCharacterModal");
  if(!modal)return;

  modal.classList.add("show");
  modal.setAttribute("aria-hidden","false");
  setStatus("starterCharacterStatus","","pending");
}
function closeStarterCharacterPicker(){
  $("starterCharacterModal")?.classList.remove("show");
  $("starterCharacterModal")?.setAttribute("aria-hidden","true");
}
async function chooseStarterGender(gender){
  if(!currentSession||!sb||!["male","female"].includes(gender))return;

  setStatus("starterCharacterStatus","Menyimpan karakter...","pending");
  const {error}=await sb.from("buddhist_profiles").update({starter_gender:gender}).eq("user_id",currentSession.user.id);
  if(error)return setStatus("starterCharacterStatus","Gagal menyimpan pilihan: "+error.message,"error");

  currentProfile={...(currentProfile||{}),starter_gender:gender};
  applyLobbyCharacter();
  setStatus("starterCharacterStatus","✓ Karakter dipilih.","success");
  setTimeout(closeStarterCharacterPicker,350);
}
$("changeStarterCharacterBtn")?.addEventListener("click",()=>openStarterCharacterPicker(false));
$("closeStarterCharacterModal")?.addEventListener("click",closeStarterCharacterPicker);
$("starterCharacterModal")?.addEventListener("click",e=>{if(e.target===$("starterCharacterModal"))closeStarterCharacterPicker()});
$$("[data-starter-gender]").forEach(b=>b.addEventListener("click",()=>chooseStarterGender(b.dataset.starterGender)));
$("monkWaveBtn")?.addEventListener("click",()=>monkGesture("gesture-wave"));
$("monkMeditateBtn")?.addEventListener("click",()=>monkGesture("gesture-meditate"));
$("openLobbyMarketBtn")?.addEventListener("click",()=>$("lobbyMarketPanel")?.scrollIntoView({behavior:"smooth",block:"start"}));
$("moreLobbyMarket")?.addEventListener("click",()=>showPage("market-more"));$("openMarketAdmin")?.addEventListener("click",()=>{showPage("market-more");setTimeout(()=>openMarketEditor(),80)});

async function loadLobbyMarket(){
  if(!currentSession||!sb)return;
  try{
    await sb.rpc("buddhist_ensure_starter_costume");
    const {data,error}=await sb.rpc("buddhist_market_dashboard");
    if(error)throw error;
    lobbyMarketRows=data||[];
    renderLobbyMarket();
  }catch(e){console.warn("Market gagal dimuat",e)}
}
function renderLobbyMarket(){
  const root=$("lobbyMarketGrid");if(!root)return;
  root.innerHTML=lobbyMarketRows.length?lobbyMarketRows.map(x=>`
    <article class="lobby-market-card ${x.equipped?"equipped":""}">
      <div class="market-preview market-style-${esc(x.style_key)}"><span>${esc(x.preview_emoji||"🧘")}</span></div>
      <div class="market-copy"><h4>${esc(x.name)}</h4><p>${esc(x.description||"")}</p>
      <div class="market-price">${Number(x.price_coins)===0?"Gratis":`🪙 ${x.price_coins} Coin`}</div></div>
      <button class="${x.equipped?"equipped":x.owned?"equip":"buy"}" data-market-id="${x.item_id}" data-market-owned="${x.owned?"1":"0"}" ${x.equipped?"disabled":""} type="button">${x.equipped?"Dipakai":x.owned?"Pakai":"Beli"}</button>
    </article>`).join(""):'<div class="page-empty">Market belum tersedia.</div>';
}
$("lobbyMarketGrid")?.addEventListener("click",async e=>{
  const b=e.target.closest("[data-market-id]");if(!b)return;
  await handleMarketActionButton(b);
});

/* AI companion */
async function loadLobbyAiHistory(){
  const root=$("lobbyAiMessages");if(!root||!sb||!currentSession)return;
  const {data,error}=await sb.from("buddhist_ai_messages").select("*").eq("user_id",currentSession.user.id).order("created_at",{ascending:true}).limit(60);
  if(error){root.innerHTML='<div class="lobby-ai-empty">Riwayat belum dapat dimuat.</div>';return}
  lobbyAiRows=data||[];
  renderLobbyAiMessages();
}
function renderLobbyAiMessages(){
  const root=$("lobbyAiMessages");if(!root)return;
  root.innerHTML=lobbyAiRows.length?lobbyAiRows.map(x=>`
    <article class="lobby-ai-message ${x.role==="user"?"user":"assistant"}">
      <div class="lobby-ai-avatar">${x.role==="user"?"👤":"🪷"}</div>
      <div><b>${x.role==="user"?"Kamu":"Lotus Companion"}</b><p>${esc(x.body).replace(/\n/g,"<br>")}</p></div>
    </article>`).join(""):'<div class="lobby-ai-empty">Halo. Kamu bisa bertanya atau bercerita di sini.</div>';
  root.scrollTop=root.scrollHeight;
}
async function saveLobbyAiMessage(role,body){
  if(!sb||!currentSession||!body)return;
  const {data,error}=await sb.from("buddhist_ai_messages").insert({user_id:currentSession.user.id,role,body}).select("*").single();
  if(!error&&data){lobbyAiRows.push(data);renderLobbyAiMessages()}
}
async function sendLobbyAiMessage(){
  const input=$("lobbyAiInput");if(!input||!sb||!currentSession)return;
  const message=input.value.trim();if(!message)return;
  input.value="";
  await saveLobbyAiMessage("user",message);
  if($("lobbyAiMode"))$("lobbyAiMode").textContent="sedang berpikir...";
  monkGesture("gesture-nod");
  const history=lobbyAiRows.slice(-10).map(x=>({role:x.role,body:x.body}));
  try{
    const {data,error}=await sb.functions.invoke("dhamma-ai-companion",{body:{message,history}});
    if(error)throw error;
    const answer=data?.answer||"Maaf, aku belum bisa menjawab sekarang.";
    await saveLobbyAiMessage("assistant",answer);
    speakLobbyCharacter(answer);
    if($("lobbyAiMode"))$("lobbyAiMode").textContent=data?.mode==="ai"?"AI aktif":"Mode pengetahuan Dhamma Journey";
  }catch(e){
    console.error(e);
    const fallbackAnswer="Maaf, Lotus Companion sedang tidak dapat terhubung. Coba lagi sebentar.";
    await saveLobbyAiMessage("assistant",fallbackAnswer);
    speakLobbyCharacter(fallbackAnswer);
    if($("lobbyAiMode"))$("lobbyAiMode").textContent="koneksi AI bermasalah";
  }
}
$("sendLobbyAi")?.addEventListener("click",()=>sendLobbyAiMessage());
$("lobbyAiInput")?.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendLobbyAiMessage()}});
$("clearLobbyAi")?.addEventListener("click",async()=>{
  if(!sb||!currentSession)return;
  if(!confirm("Hapus riwayat percakapan Lotus Companion?"))return;
  const {error}=await sb.from("buddhist_ai_messages").delete().eq("user_id",currentSession.user.id);
  if(error)return say("Riwayat gagal dihapus");
  lobbyAiRows=[];renderLobbyAiMessages();
});

async function renderLobbyPage(){
  if(!currentSession||!sb)return;
  await Promise.all([loadProfileAndSettings(),loadWalletEconomy(false),loadLobbyMarket(),loadLobbyAiHistory(),loadContentMarks(),loadAiKnowledge()]);
  applyLobbyCharacter();
  startMonkIdle();
}

window.addEventListener("resize",updateCoverFlow);
window.addEventListener("buddhist-supabase-ready",initSupabase);
renderCarousel();setupDrag();renderFAQ();renderGames();renderCategories();renderMaterialLibrary();renderMaterialsMini();setActive(active,false);syncMaterialPreview();syncVideoPreview();initSupabase();
populateCategorySelects();

/* =========================================================
   V7.2 — SAFE FEATURE PATCH
   ========================================================= */

/* ---------- Generic content marks: like + playlist ---------- */
function videoContentKey(i){
  const v=videos[i]; if(!v)return "";
  return v._id?`id:${v._id}`:v._baseKey?`base:${v._baseKey}`:`title:${v[0]}`;
}
function materialContentKey(m){
  if(!m)return "";
  return m.id?`id:${m.id}`:`title:${m.videoTitle||m.video_title||""}|${m.title||""}`;
}
function markMapKey(type,key){return `${type}|${key}`}
function getMark(type,key){return contentMarks.get(markMapKey(type,key))||{liked:false,playlist:false}}
async function loadContentMarks(){
  if(!sb||!currentSession){contentMarks=new Map();return}
  const {data,error}=await sb.from("buddhist_content_marks").select("*").eq("user_id",currentSession.user.id);
  if(error){console.warn("Marks gagal dimuat",error);return}
  contentMarks=new Map((data||[]).map(x=>[markMapKey(x.content_type,x.content_key),x]));
  favorites=new Set();
  playlist=new Set();
  videos.forEach((v,i)=>{
    const m=getMark("video",videoContentKey(i));
    if(m.liked)favorites.add(i);
    if(m.playlist)playlist.add(i);
  });
  refreshFavButtons();
  refreshMaterialMarkButtons();
}
async function setContentMark(type,key,field){
  if(!currentSession||!sb){setAuthMode("login");openAuth("Login diperlukan untuk menyimpan Favorit dan Playlist.");return false}
  const current=getMark(type,key);
  const next={...current,[field]:!current[field]};
  const payload={
    user_id:currentSession.user.id,
    content_type:type,
    content_key:key,
    liked:!!next.liked,
    playlist:!!next.playlist,
    updated_at:new Date().toISOString()
  };
  const {data,error}=await sb.from("buddhist_content_marks").upsert(payload,{onConflict:"user_id,content_type,content_key"}).select("*").single();
  if(error){say("Gagal menyimpan pilihan: "+error.message);return false}
  contentMarks.set(markMapKey(type,key),data||payload);
  if(type==="video"){
    videos.forEach((v,i)=>{
      if(videoContentKey(i)===key){
        if(payload.liked)favorites.add(i);else favorites.delete(i);
        if(payload.playlist)playlist.add(i);else playlist.delete(i);
      }
    });
    persist();
  }
  refreshFavButtons();refreshMaterialMarkButtons();renderListPageIfOpen();
  return true;
}
toggleFav=async function(i){
  const key=videoContentKey(i);if(!key)return;
  const before=getMark("video",key).liked;
  if(await setContentMark("video",key,"liked"))say(before?"Dihapus dari Favorit":"Disukai");
};
togglePlaylist=async function(i){
  const key=videoContentKey(i);if(!key)return;
  const before=getMark("video",key).playlist;
  if(await setContentMark("video",key,"playlist"))say(before?"Dihapus dari Playlist":"Ditambahkan ke Playlist");
};
refreshFavButtons=function(){
  $$("#scroller .card").forEach(c=>{
    const i=+c.dataset.real,key=videoContentKey(i),m=getMark("video",key);
    const f=c.querySelector(".fav-btn"),p=c.querySelector(".list-btn");
    if(f){f.textContent=m.liked?"♥ Disukai":"♡ Suka";f.classList.toggle("active",m.liked)}
    if(p){p.textContent=m.playlist?"✓ Playlist":"＋ Playlist";p.classList.toggle("active",m.playlist)}
  });
  const vm=getMark("video",videoContentKey(active));
  if($("playerFavStatus"))$("playerFavStatus").textContent=vm.liked?"♥":"♡";
  if($("playerPlaylistStatus"))$("playerPlaylistStatus").textContent=vm.playlist?"✓":"＋";
  if($("infoHeart"))$("infoHeart").textContent=vm.liked?"♥":"♡";
  const lb=$("videoLikeBtn"),pb=$("videoPlaylistBtn");
  if(lb){lb.textContent=vm.liked?"♥":"♡";lb.classList.toggle("active",vm.liked);lb.setAttribute("aria-pressed",String(vm.liked))}
  if(pb){pb.textContent=vm.playlist?"✓":"＋";pb.classList.toggle("active",vm.playlist);pb.setAttribute("aria-pressed",String(vm.playlist))}
};
$("videoLikeBtn")?.addEventListener("click",()=>toggleFav(active));
$("videoPlaylistBtn")?.addEventListener("click",()=>togglePlaylist(active));

function refreshMaterialMarkButtons(){
  const m=currentMaterialDetailIndex!==null?materials[currentMaterialDetailIndex]:null;if(!m)return;
  const mk=materialContentKey(m);
  const mat=getMark("material",mk),aud=getMark("audio",mk);
  const apply=(id,on,onText,offText)=>{
    const b=$(id);if(!b)return;b.classList.toggle("active",on);b.setAttribute("aria-pressed",String(on));b.textContent=on?onText:offText;
  };
  apply("materialLikeBtn",mat.liked,"♥ Disukai","♡ Suka");
  apply("materialPlaylistBtn",mat.playlist,"✓ Di Playlist","＋ Playlist");
  apply("audioLikeBtn",aud.liked,"♥ Audio Disukai","♡ Suka Audio");
  apply("audioPlaylistBtn",aud.playlist,"✓ Audio di Playlist","＋ Playlist Audio");
}
$("materialLikeBtn")?.addEventListener("click",()=>{const m=materials[currentMaterialDetailIndex];if(m)setContentMark("material",materialContentKey(m),"liked")});
$("materialPlaylistBtn")?.addEventListener("click",()=>{const m=materials[currentMaterialDetailIndex];if(m)setContentMark("material",materialContentKey(m),"playlist")});
$("audioLikeBtn")?.addEventListener("click",()=>{const m=materials[currentMaterialDetailIndex];if(m)setContentMark("audio",materialContentKey(m),"liked")});
$("audioPlaylistBtn")?.addEventListener("click",()=>{const m=materials[currentMaterialDetailIndex];if(m)setContentMark("audio",materialContentKey(m),"playlist")});

/* Favorite / Playlist pages can show video + material/audio marks */
renderListPage=function(id){
  const root=$(id);if(!root)return;
  if(id==="riwayat"){
    root.innerHTML=`<h2>Riwayat</h2><p class="lead">Video yang terakhir dibuka.</p>${videoRows(history.filter(i=>videos[i]))}`;
    return;
  }
  const field=id==="favorit"?"liked":"playlist";
  const title=id==="favorit"?"Favorit":"Playlist Saya";
  const rows=[];
  videos.forEach((v,i)=>{const m=getMark("video",videoContentKey(i));if(m[field])rows.push({kind:"video",i,title:v[0],meta:v[3],cover:effectiveVideoThumb(v)})});
  materials.forEach((m,i)=>{
    const key=materialContentKey(m),mm=getMark("material",key),am=getMark("audio",key);
    if(mm[field])rows.push({kind:"material",i,title:m.title,meta:`Materi · ${m.category||""}`,cover:materialCoverFor(m)});
    if(am[field])rows.push({kind:"audio",i,title:m.title,meta:`Audio · ${m.category||""}`,cover:materialCoverFor(m)});
  });
  root.innerHTML=`<h2>${title}</h2><p class="lead">Video, materi, dan audio pilihanmu.</p><div class="collection-grid">${rows.length?rows.map(r=>`
    <button class="collection-card" type="button" data-kind="${r.kind}" data-i="${r.i}">
      <img src="${esc(r.cover||"assets/lotus-heading-target.jpg")}" alt="${esc(r.title)}"><span><b>${esc(r.title)}</b><small>${esc(r.meta||"")}</small></span>
    </button>`).join(""):'<div class="page-empty">Belum ada data.</div>'}</div>`;
};
document.addEventListener("click",e=>{
  const c=e.target.closest(".collection-card");if(!c)return;
  if(c.dataset.kind==="video"){active=Number(c.dataset.i);showPage("tutorial");setActive(active,true,true)}
  else openMaterial(Number(c.dataset.i));
});

/* ---------- Material library: cover + title only ---------- */
function materialCoverFor(m){
  if(m?.cover_url)return m.cover_url;
  const title=m?.videoTitle||m?.video_title||"";
  const vi=videos.findIndex(v=>v[0]===title);
  return vi>=0?(effectiveVideoThumb(videos[vi])||"assets/lotus-heading-target.jpg"):"assets/lotus-heading-target.jpg";
}
renderMaterialLibrary=function(){
  const root=$("materialLibraryGrid");if(!root)return;
  if(!materials.length){root.innerHTML='<div class="page-empty">Belum ada materi.</div>';return}
  root.innerHTML=materials.map((m,i)=>`<article class="material-cover-card" data-material-index="${i}">
    <button class="material-cover-open open-material" data-i="${i}" type="button">
      <img src="${esc(materialCoverFor(m))}" alt="${esc(m.title||"Materi")}" loading="lazy">
      <span>${esc(m.title||"Materi")}</span>
    </button>
    ${isAdmin?`<div class="material-cover-admin"><button class="mini-btn edit-material" data-i="${i}" type="button">✏ Edit</button><button class="mini-btn edit-material-audio" data-i="${i}" type="button">♫ Audio</button>${m.audio_url?`<button class="mini-btn delete-material-audio danger" data-i="${i}" type="button">Hapus Audio</button>`:""}<button class="mini-btn delete-material danger" data-i="${i}" type="button">🗑 Hapus</button></div>`:""}
  </article>`).join("");
};
openMaterial=function(i){
  const m=materials[i];if(!m)return;
  currentMaterialDetailIndex=i;
  if($("materialDetailVideo"))$("materialDetailVideo").textContent=m.videoTitle||m.video_title||"Materi";
  if($("materialDetailCategory"))$("materialDetailCategory").textContent=m.category||"Materi";
  if($("materialDetailTitle"))$("materialDetailTitle").textContent=m.title||"Materi";
  if($("materialDetailSummary"))$("materialDetailSummary").textContent=m.summary||"";
  if($("materialDetailBody"))$("materialDetailBody").innerHTML=esc(m.content||"").replace(/\n/g,"<br>");
  if($("materialDetailCover"))$("materialDetailCover").src=materialCoverFor(m);
  const audio=$("materialAudioPlayer"),box=$("materialAudioBox"),src=materialAudioFor(m);
  if(audio){
    audio.pause();audio.removeAttribute("src");
    if(src){audio.src=src;audio.load();box?.classList.remove("no-audio")}
    else box?.classList.add("no-audio");
  }
  refreshMaterialMarkButtons();
  showPage("materi-detail");
};
renderMaterialsMini=function(){
  const list=$("activeMaterialList");if(!list||!videos[active])return;
  const v=videos[active],arr=materials.filter(m=>(m.videoTitle||m.video_title)===v[0]);
  if(!arr.length){list.innerHTML='<div class="info-material-empty">Materi tertulis untuk video ini belum ditambahkan.</div>';return}
  list.innerHTML=`<div class="info-material-full-list">${arr.map(m=>{
    const idx=materials.indexOf(m),key=materialContentKey(m),mm=getMark("material",key),am=getMark("audio",key),audio=materialAudioFor(m);
    return `<article class="info-material-full">
      <div class="info-material-full-head"><div><b>${esc(m.title||"Materi")}</b><small>${esc(m.category||"Materi")}</small></div>${isAdmin?`<div class="material-mini-admin"><button class="mini-btn edit-material" data-i="${idx}">✏</button><button class="mini-btn edit-material-audio" data-i="${idx}">♫</button><button class="mini-btn delete-material danger" data-i="${idx}">🗑</button></div>`:""}</div>
      ${m.summary?`<p class="info-material-summary">${esc(m.summary)}</p>`:""}
      <div class="info-material-body">${esc(m.content||"").replace(/\n/g,"<br>")}</div>
      <div class="material-mini-actions">
        <button class="mini-material-like ${mm.liked?"active":""}" data-material-mark="${idx}" data-mark-field="liked">${mm.liked?"♥":"♡"} Materi</button>
        <button class="mini-material-playlist ${mm.playlist?"active":""}" data-material-mark="${idx}" data-mark-field="playlist">${mm.playlist?"✓":"＋"} Playlist</button>
        ${audio?`<button class="mini-audio-like ${am.liked?"active":""}" data-audio-mark="${idx}" data-mark-field="liked">${am.liked?"♥":"♡"} Audio</button><button class="mini-audio-playlist ${am.playlist?"active":""}" data-audio-mark="${idx}" data-mark-field="playlist">${am.playlist?"✓":"＋"} Audio Playlist</button><audio controls preload="none" src="${esc(audio)}"></audio>`:""}
      </div>
    </article>`;
  }).join("")}</div>`;
};
document.addEventListener("click",e=>{
  const mb=e.target.closest("[data-material-mark]");if(mb){const m=materials[Number(mb.dataset.materialMark)];if(m)setContentMark("material",materialContentKey(m),mb.dataset.markField);return}
  const ab=e.target.closest("[data-audio-mark]");if(ab){const m=materials[Number(ab.dataset.audioMark)];if(m)setContentMark("audio",materialContentKey(m),ab.dataset.markField);return}
});

/* ---------- V7.3: layered eyes/mouth synced to the portrait ---------- */
function characterFaceMarkup(gender){
  // Coordinate space is the original illustration size, so overlays scale with the PNG.
  const female=gender==="female";
  const left=female?[251,315,47,27]:[252,309,46,28];
  const right=female?[393,278,43,26]:[392,268,43,26];
  const mouth=female?[333,360]:[332,360];
  const skin=female?"#ffe7d8":"#ffeae1";
  const lid=([x,y,rx,ry])=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${skin}"/><path d="M${x-rx+3} ${y+3} Q${x} ${y+21} ${x+rx-3} ${y-1}" fill="none" stroke="#855b4a" stroke-width="3.5" stroke-linecap="round"/>`;
  return `<g class="dj-blink-lids">${lid(left)}${lid(right)}</g>
    <g class="dj-speaking-mouth"><ellipse cx="${mouth[0]}" cy="${mouth[1]}" rx="13" ry="10" fill="#8b4446" stroke="#b36a64" stroke-width="1.8"/><ellipse cx="${mouth[0]}" cy="${mouth[1]+5}" rx="7.2" ry="2.7" fill="#e99896"/></g>`;
}

function characterChibiFaceMarkup(){
  const skin="#ffe5d9";
  const lid=(x,y,rx,ry)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${skin}"/><path d="M${x-rx+3} ${y+2} Q${x} ${y+16} ${x+rx-3} ${y-1}" fill="none" stroke="#7b5144" stroke-width="3" stroke-linecap="round"/>`;
  return `<g class="dj-blink-lids">${lid(154,223,38,22)}${lid(282,214,38,22)}</g>
    <g class="dj-speaking-mouth"><ellipse cx="231" cy="281" rx="15" ry="11" fill="#8f474a"/><ellipse cx="231" cy="287" rx="8" ry="3.2" fill="#e99b98"/></g>`;
}

/* ---------- Character: use the user-selected male/female art ---------- */
applyLobbyCharacter=function(){
  const name=currentProfile?.display_name||currentSession?.user?.email?.split("@")[0]||"Player";
  if($("lobbyPlayerName"))$("lobbyPlayerName").textContent=name;
  if($("lobbyCaishenBalance"))$("lobbyCaishenBalance").textContent=String(caishenBalance);

  const living=$("livingCharacter"),customWrap=$("lobbyCustomCharacter"),customImg=$("lobbyCustomCharacterImg"),fallback=$("lobbyMonk");
  const gender=currentProfile?.starter_gender==="female"?"female":"male";
  const custom=currentProfile?.character_url||"";

  // Exactly one character is visible at a time: custom > selected starter > living monk fallback.
  living?.classList.add("hidden");
  fallback?.classList.add("hidden");
  customWrap?.classList.add("hidden");

  if($("livingGenderChip"))$("livingGenderChip").textContent=gender==="female"?"Perempuan":"Laki-laki";
  if($("lobbyCharacterTitle"))$("lobbyCharacterTitle").textContent="Karakter Pendamping";

  if(custom&&customWrap&&customImg){
    const token=++customCharacterLoadToken;
    customImg.onload=()=>{
      if(token!==customCharacterLoadToken)return;
      customWrap.classList.remove("hidden");
      if($("lobbyCharacterTitle"))$("lobbyCharacterTitle").textContent="Karakter Custom";
      setMonkMood("menemanimu");
    };
    customImg.onerror=()=>{
      if(token!==customCharacterLoadToken)return;
      customWrap.classList.add("hidden");
      if(currentProfile?.starter_gender){
        living?.classList.remove("hidden");
      }else{
        fallback?.classList.remove("hidden");
      }
      if($("lobbyCharacterTitle"))$("lobbyCharacterTitle").textContent="Karakter Pendamping";
    };
    customImg.src=custom;
  }else if(currentProfile?.starter_gender){
    living?.classList.remove("hidden");
  }else{
    // Before the player chooses a starter, show the built-in vector monk.
    fallback?.classList.remove("hidden");
  }

  if(currentSession&&!currentProfile?.starter_gender&&!custom)setTimeout(()=>openStarterCharacterPicker(true),400);
};

/* ---------- Lotus Companion knowledge CRUD + knowledge-first answer ---------- */
async function loadAiKnowledge(){
  if(!sb||!currentSession)return [];
  let q=sb.from("buddhist_ai_knowledge").select("*").order("sort_order").order("id");
  const {data,error}=await q;
  if(error){console.warn(error);return []}
  aiKnowledgeRows=data||[];
  renderAiKnowledgeAdmin();
  return aiKnowledgeRows;
}
function renderAiKnowledgeAdmin(){
  const root=$("aiKnowledgeList");if(!root||!isAdmin)return;
  root.innerHTML=aiKnowledgeRows.length?aiKnowledgeRows.map(x=>`<article class="ai-knowledge-row ${x.is_active?"":"inactive"}">
    <div><b>${esc(x.question||x.category||"Jawaban")}</b><small>${esc((x.keywords||[]).join(", "))}</small><p>${esc(x.answer||"")}</p></div>
    <div class="ai-knowledge-actions"><span>${x.is_active?"Aktif":"Nonaktif"}</span><button class="mini-btn edit-ai-knowledge" data-id="${x.id}">Edit</button><button class="mini-btn delete-ai-knowledge danger" data-id="${x.id}">Hapus</button></div>
  </article>`).join(""):'<div class="page-empty">Belum ada data jawaban.</div>';
}
function openAiKnowledgeEditor(row=null){
  $("aiKnowledgeEditor")?.classList.remove("hidden");
  if($("aiKnowledgeId"))$("aiKnowledgeId").value=row?.id||"";
  if($("aiKnowledgeCategory"))$("aiKnowledgeCategory").value=row?.category||"Umum";
  if($("aiKnowledgeQuestion"))$("aiKnowledgeQuestion").value=row?.question||"";
  if($("aiKnowledgeKeywords"))$("aiKnowledgeKeywords").value=(row?.keywords||[]).join(", ");
  if($("aiKnowledgeAnswer"))$("aiKnowledgeAnswer").value=row?.answer||"";
  if($("aiKnowledgeActive"))$("aiKnowledgeActive").value=String(row?.is_active??true);
  if($("aiKnowledgeOrder"))$("aiKnowledgeOrder").value=row?.sort_order||0;
}
function closeAiKnowledgeEditor(){$("aiKnowledgeEditor")?.classList.add("hidden")}
$("newAiKnowledgeBtn")?.addEventListener("click",()=>openAiKnowledgeEditor());
$("cancelAiKnowledge")?.addEventListener("click",closeAiKnowledgeEditor);
$("saveAiKnowledge")?.addEventListener("click",async()=>{
  if(!isAdmin||!sb)return;
  const id=Number($("aiKnowledgeId")?.value||0);
  const row={
    category:$("aiKnowledgeCategory")?.value.trim()||"Umum",
    question:$("aiKnowledgeQuestion")?.value.trim()||"",
    keywords:($("aiKnowledgeKeywords")?.value||"").split(",").map(x=>x.trim().toLowerCase()).filter(Boolean),
    answer:$("aiKnowledgeAnswer")?.value.trim()||"",
    is_active:$("aiKnowledgeActive")?.value==="true",
    sort_order:Number($("aiKnowledgeOrder")?.value||0),
    created_by:currentSession?.user?.id||null,
    updated_at:new Date().toISOString()
  };
  if(!row.answer)return say("Jawaban wajib diisi");
  const {error}=id?await sb.from("buddhist_ai_knowledge").update(row).eq("id",id):await sb.from("buddhist_ai_knowledge").insert(row);
  if(error)return say("Gagal menyimpan jawaban: "+error.message);
  await logPlayerActivity(id?"ai_knowledge_edit":"ai_knowledge_add","ai_knowledge",row.question||row.category,"Lotus Companion knowledge");
  closeAiKnowledgeEditor();await loadAiKnowledge();say("Data jawaban disimpan");
});
document.addEventListener("click",async e=>{
  const eb=e.target.closest(".edit-ai-knowledge");if(eb){const row=aiKnowledgeRows.find(x=>Number(x.id)===Number(eb.dataset.id));if(row)openAiKnowledgeEditor(row);return}
  const db=e.target.closest(".delete-ai-knowledge");if(db){const row=aiKnowledgeRows.find(x=>Number(x.id)===Number(db.dataset.id));if(!row||!confirm("Hapus data jawaban ini?"))return;const {error}=await sb.from("buddhist_ai_knowledge").delete().eq("id",row.id);if(error)return say("Gagal menghapus");await logPlayerActivity("ai_knowledge_delete","ai_knowledge",row.question||row.category,"deleted");await loadAiKnowledge();return}
});
async function knowledgeAnswerFor(message){
  const rows=aiKnowledgeRows.length?aiKnowledgeRows:await loadAiKnowledge();
  const q=String(message||"").toLowerCase();
  let best=null,bestScore=0;
  for(const row of rows.filter(x=>x.is_active)){
    let score=0;
    for(const k of row.keywords||[])if(k&&q.includes(String(k).toLowerCase()))score+=3;
    const words=String(row.question||"").toLowerCase().split(/\s+/).filter(x=>x.length>3);
    for(const w of words)if(q.includes(w))score++;
    if(score>bestScore){bestScore=score;best=row}
  }
  return bestScore>0?best?.answer||"": "";
}
sendLobbyAiMessage=async function(){
  const input=$("lobbyAiInput");if(!input||!sb||!currentSession)return;
  const message=input.value.trim();if(!message)return;
  input.value="";await saveLobbyAiMessage("user",message);
  if($("lobbyAiMode"))$("lobbyAiMode").textContent="sedang berpikir...";
  monkGesture("gesture-nod");
  try{
    let answer=await knowledgeAnswerFor(message),mode="knowledge";
    if(!answer){
      const history=lobbyAiRows.slice(-10).map(x=>({role:x.role,body:x.body}));
      const {data,error}=await sb.functions.invoke("dhamma-ai-companion",{body:{message,history}});
      if(error)throw error;answer=data?.answer||"Maaf, aku belum bisa menjawab sekarang.";mode=data?.mode||"ai";
    }
    await saveLobbyAiMessage("assistant",answer);speakLobbyCharacter(answer);
    if($("lobbyAiMode"))$("lobbyAiMode").textContent=mode==="knowledge"?"Knowledge Owner aktif":"A calm friend in Dhamma Journey";
  }catch(e){
    console.error(e);const answer="Maaf, Lotus Companion sedang tidak dapat terhubung. Coba lagi sebentar.";
    await saveLobbyAiMessage("assistant",answer);speakLobbyCharacter(answer);
    if($("lobbyAiMode"))$("lobbyAiMode").textContent="koneksi bermasalah";
  }
};
renderLobbyAiMessages=function(){
  const root=$("lobbyAiMessages");if(!root)return;
  root.innerHTML=lobbyAiRows.length?lobbyAiRows.map(x=>`<article class="lobby-ai-message ${x.role==="user"?"user":"assistant"}">
    <div class="lobby-ai-avatar">${x.role==="user"?"👤":"🪷"}</div>
    <div><b>${x.role==="user"?"Kamu":"Lotus Companion"}</b><p>${esc(x.body).replace(/\n/g,"<br>")}</p></div>
  </article>`).join(""):'<div class="lobby-ai-empty">Halo. Kamu bisa bertanya atau bercerita di sini.</div>';
  root.scrollTop=root.scrollHeight;
};

/* ---------- Market full browser + admin CRUD ---------- */
function marketCardHTML(x,admin=false){
  const image=x.image_url?`<img src="${esc(x.image_url)}" alt="${esc(x.name)}">`:`<span>${esc(x.preview_emoji||"🪷")}</span>`;
  return `<article class="lobby-market-card ${x.equipped?"equipped":""}">
    <div class="market-preview market-style-${esc(x.style_key||"starter")}">${image}</div>
    <div class="market-copy"><h4>${esc(x.name)}</h4><p>${esc(x.description||"")}</p><small>${x.gender==="male"?"Cowo":x.gender==="female"?"Cewe":"Semua karakter"}</small>
      <div class="market-price">${Number(x.price_coins)===0?"Gratis":`<img class="coin-inline-icon" src="assets/coin-icon-user.png" alt=""> ${x.price_coins} Coin`}</div></div>
    <button class="${x.equipped?"equipped":x.owned?"equip":"buy"}" data-market-id="${x.item_id}" data-market-owned="${x.owned?"1":"0"}" ${x.equipped?"disabled":""} type="button">${x.equipped?"Dipakai":x.owned?"Pakai":"Beli"}</button>
  </article>`;
}
renderLobbyMarket=function(){
  const root=$("lobbyMarketGrid");if(!root)return;
  const gender=currentProfile?.starter_gender||"male";
  const rows=lobbyMarketRows.filter(x=>x.gender==="all"||x.gender===gender).slice(0,5);
  root.innerHTML=rows.length?rows.map(x=>marketCardHTML(x)).join(""):'<div class="page-empty">Market belum tersedia.</div>';
};
async function renderMarketMorePage(){
  await loadLobbyMarket();await loadMarketAdminRows();renderMarketMoreGrid();
}
function renderMarketMoreGrid(){
  const root=$("marketMoreGrid");if(!root)return;
  const q=($("marketSearch")?.value||"").trim().toLowerCase(),gender=$("marketGenderFilter")?.value||"all",ownership=$("marketOwnershipFilter")?.value||"all";
  const rows=lobbyMarketRows.filter(x=>{
    if(q&&!`${x.name} ${x.description} ${x.category}`.toLowerCase().includes(q))return false;
    if(gender!=="all"&&x.gender!=="all"&&x.gender!==gender)return false;
    if(ownership==="owned"&&!x.owned)return false;if(ownership==="not-owned"&&x.owned)return false;
    return true;
  });
  root.innerHTML=rows.length?rows.map(x=>marketCardHTML(x)).join(""):'<div class="page-empty">Produk tidak ditemukan.</div>';
}
["marketSearch","marketGenderFilter","marketOwnershipFilter"].forEach(id=>$(id)?.addEventListener(id==="marketSearch"?"input":"change",renderMarketMoreGrid));
$("marketBackHome")?.addEventListener("click",()=>showPage("dashboard"));
async function loadMarketAdminRows(){
  if(!isAdmin||!sb)return;
  const {data,error}=await sb.from("buddhist_market_items").select("*").order("sort_order").order("id");
  if(error){console.warn(error);return}marketAdminRows=data||[];renderMarketAdminList();
}
function renderMarketAdminList(){
  const root=$("marketAdminList");if(!root||!isAdmin)return;
  root.innerHTML=marketAdminRows.map(x=>`<div class="market-admin-row"><div><b>${esc(x.name)}</b><small>${x.is_active?"Aktif":"Nonaktif"} · ${x.price_coins} Coin · ${x.gender}</small></div><div><button class="mini-btn edit-market-item" data-id="${x.id}">Edit</button><button class="mini-btn delete-market-item danger" data-id="${x.id}">Hapus</button></div></div>`).join("");
}
function openMarketEditor(row=null){
  $("marketAdminForm")?.classList.remove("hidden");
  const set=(id,v)=>{if($(id))$(id).value=v??""};
  set("marketItemId",row?.id||"");set("marketItemName",row?.name||"");set("marketItemSku",row?.sku||"");
  set("marketItemCategory",row?.category||"costume");set("marketItemPrice",row?.price_coins||0);set("marketItemStyleKey",row?.style_key||"starter");
  set("marketItemGender",row?.gender||"all");set("marketItemEmoji",row?.preview_emoji||"");set("marketItemOrder",row?.sort_order||0);set("marketItemImageUrl",row?.image_url||"");
  set("marketItemDescription",row?.description||"");set("marketItemActive",String(row?.is_active??true));
}
$("newMarketItem")?.addEventListener("click",()=>openMarketEditor());
$("cancelMarketItem")?.addEventListener("click",()=>$("marketAdminForm")?.classList.add("hidden"));
$("saveMarketItem")?.addEventListener("click",async()=>{
  if(!isAdmin||!sb)return;
  const id=Number($("marketItemId")?.value||0),row={
    name:$("marketItemName")?.value.trim(),sku:$("marketItemSku")?.value.trim()||`item-${Date.now()}`,category:$("marketItemCategory")?.value.trim()||"costume",
    price_coins:Number($("marketItemPrice")?.value||0),style_key:$("marketItemStyleKey")?.value.trim()||"starter",gender:$("marketItemGender")?.value||"all",
    preview_emoji:$("marketItemEmoji")?.value.trim()||"🪷",sort_order:Number($("marketItemOrder")?.value||0),image_url:$("marketItemImageUrl")?.value.trim()||null,
    description:$("marketItemDescription")?.value.trim()||"",is_active:$("marketItemActive")?.value==="true"
  };
  if(!row.name)return say("Nama produk wajib diisi");
  const {error}=id?await sb.from("buddhist_market_items").update(row).eq("id",id):await sb.from("buddhist_market_items").insert(row);
  if(error)return say("Gagal menyimpan produk: "+error.message);
  await logPlayerActivity(id?"market_edit":"market_add","market",row.name,`${row.price_coins} Coin`);
  $("marketAdminForm")?.classList.add("hidden");await Promise.all([loadLobbyMarket(),loadMarketAdminRows()]);renderMarketMoreGrid();say("Produk market disimpan");
});
document.addEventListener("click",async e=>{
  const edit=e.target.closest(".edit-market-item");if(edit){const row=marketAdminRows.find(x=>Number(x.id)===Number(edit.dataset.id));if(row)openMarketEditor(row);return}
  const del=e.target.closest(".delete-market-item");if(del){const row=marketAdminRows.find(x=>Number(x.id)===Number(del.dataset.id));if(!row||!confirm(`Hapus produk “${row.name}”?`))return;const {error}=await sb.from("buddhist_market_items").delete().eq("id",row.id);if(error)return say("Produk tidak dapat dihapus: "+error.message);await logPlayerActivity("market_delete","market",row.name,"deleted");await Promise.all([loadLobbyMarket(),loadMarketAdminRows()]);renderMarketMoreGrid();return}
});
$("marketMoreGrid")?.addEventListener("click",async e=>{
  const b=e.target.closest("[data-market-id]");if(!b)return;await handleMarketActionButton(b);renderMarketMoreGrid();
});
async function handleMarketActionButton(b){
  if(!b||!sb||!currentSession)return;
  const id=Number(b.dataset.marketId),owned=b.dataset.marketOwned==="1";
  const item=lobbyMarketRows.find(x=>Number(x.item_id)===id);
  const gender=currentProfile?.starter_gender||"male";
  if(item&&item.gender&&item.gender!=="all"&&item.gender!==gender)return say(`Kostum ini untuk karakter ${item.gender==="female"?"cewe":"cowo"}.`);
  if(!owned){const {error}=await sb.rpc("buddhist_buy_market_item",{p_item_id:id});if(error)return say("Pembelian gagal: "+error.message);await loadWalletEconomy(false)}
  const {error}=await sb.rpc("buddhist_equip_market_item",{p_item_id:id});if(error)return say("Gagal memakai kostum: "+error.message);
  await Promise.all([loadLobbyMarket(),loadProfileAndSettings(),loadWalletEconomy(false)]);applyLobbyCharacter();say("Kostum dipasang");
}

/* ---------- Game: edit/delete only visible to Admin/Owner + logs ---------- */
gameCardHTML=function(g){
  const cover=g.thumbnail_url||"assets/maitreya-game-user.png",status=g.status||"coming_soon",label=status==="active"?"Active":status==="hidden"?"Hidden":"Coming Soon";
  return `<article class="game-card" data-game-id="${g.id||""}">
    <div class="game-cover"><img src="${esc(cover)}" alt="${esc(g.title||"Game")}"></div>
    <div class="game-copy"><h3>${esc(g.title||"Game")}</h3><span class="game-badge ${esc(status)}">${esc(g.category||"Other")} · ${label}</span><p>${esc(g.description||"Game Buddhist.")}</p>
    <div class="game-meta">${g.game_url&&status==="active"?`<a class="mini-btn" href="${esc(g.game_url)}" target="_blank" rel="noopener">Mainkan</a>`:`<span class="game-badge">${status==="coming_soon"?"Segera hadir":"Belum tersedia"}</span>`}</div>
    ${isAdmin?`<div class="game-actions"><button class="mini-btn edit-game" data-id="${g.id}" type="button">✏ Edit</button><button class="mini-btn delete-game danger" data-id="${g.id}" type="button">🗑 Hapus</button></div>`:""}</div>
  </article>`;
};
const _deleteGameV72=deleteGame;
deleteGame=async function(id){const g=games.find(x=>Number(x.id)===Number(id));const title=g?.title||"Game";await _deleteGameV72(id);if(g)await logPlayerActivity("game_delete","game",title,"deleted")};

/* ---------- Friend list full width is CSS; Chat profile + emoji ---------- */
loadChatContacts=async function(){
  const root=$("privateChatFriendList");if(!root||!sb)return;
  try{
    const {data,error}=await sb.rpc("buddhist_friend_dashboard");if(error)throw error;
    chatContactRows=(data||[]).filter(x=>x.status==="accepted");
    const ids=chatContactRows.map(x=>x.friend_user_id);
    let prof=[];
    if(ids.length){const p=await sb.rpc("buddhist_chat_profiles",{p_user_ids:ids});prof=p.data||[]}
    const map=new Map(prof.map(x=>[x.user_id,x]));
    chatContactRows=chatContactRows.map(x=>({...x,...(map.get(x.friend_user_id)||{})}));
    root.innerHTML=chatContactRows.length?chatContactRows.map(x=>`<button class="private-chat-contact${chatRecipientId===x.friend_user_id?" active":""}" type="button" data-user-id="${x.friend_user_id}">
      <span class="chat-contact-avatar">${x.avatar_url?`<img src="${esc(x.avatar_url)}" alt="${esc(x.display_name||"Player")}">`:"👤"}</span>
      <span><b>${esc(x.display_name||"Pemain")}</b><small>${x.is_online?"● Online":"Offline"} · ${esc(x.friend_code||"")}</small></span>
    </button>`).join(""):'<div class="chat-empty">Belum ada teman untuk private chat.</div>';
  }catch(e){root.innerHTML='<div class="chat-empty">Gagal memuat teman.</div>'}
};
const _openPrivateChatV72=openPrivateChat;
openPrivateChat=async function(userId){
  await _openPrivateChatV72(userId);
  const c=chatContactRows.find(x=>String(x.friend_user_id)===String(userId));
  const a=$("chatRoomAvatar");if(a&&c){a.innerHTML=c.avatar_url?`<img src="${esc(c.avatar_url)}" alt="${esc(c.display_name||"Player")}">`:"👤"}
};
const EMOJIS=["😀","😄","😊","🥰","🙏","🪷","🌸","🌿","✨","❤️","👍","👏","😂","😇","☀️","🌙","🎉","🤍","💛","🧘"];
function renderEmojiPicker(){
  const root=$("emojiPicker");if(!root)return;root.innerHTML=EMOJIS.map(x=>`<button type="button" data-emoji="${x}">${x}</button>`).join("");
}
renderEmojiPicker();
$("emojiPickerBtn")?.addEventListener("click",e=>{e.stopPropagation();const p=$("emojiPicker");p?.classList.toggle("hidden");p?.setAttribute("aria-hidden",String(p?.classList.contains("hidden")))});
$("emojiPicker")?.addEventListener("click",e=>{const b=e.target.closest("[data-emoji]");if(!b)return;const input=$("chatMessageInput");if(input){input.value+=b.dataset.emoji;input.focus()}});
document.addEventListener("click",e=>{if(!e.target.closest(".chat-compose-input"))$("emojiPicker")?.classList.add("hidden")});

/* ---------- Complaint counter and close behavior ---------- */
function closeComplaintModal(){
  const modal=$("complaintModal");
  if(!modal)return;
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden","true");
  document.body.classList.remove("complaint-modal-open");
}
function openComplaintModal(){
  const modal=$("complaintModal");
  if(!modal)return;
  modal.classList.add("show");
  modal.setAttribute("aria-hidden","false");
  document.body.classList.add("complaint-modal-open");
}
$("closeComplaintX")?.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();closeComplaintModal()});
$("closeComplaint")?.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();closeComplaintModal()});
$("complaintModal")?.addEventListener("click",e=>{
  if(e.target===$("complaintModal"))closeComplaintModal();
});
document.addEventListener("keydown",e=>{
  if(e.key==="Escape" && $("complaintModal")?.classList.contains("show"))closeComplaintModal();
});
$("complaintMessage")?.addEventListener("input",e=>{if($("complaintCharCount"))$("complaintCharCount").textContent=String(e.target.value.length)});
$("complaintFab")?.addEventListener("click",()=>{if($("complaintCharCount"))$("complaintCharCount").textContent=String($("complaintMessage")?.value.length||0)});

/* ---------- Video controls: real HTML5 + YouTube postMessage ---------- */
function activeMedia(){return $("mediaLayer")?.querySelector("video,audio")}
function activeEmbed(){return $("mediaLayer")?.querySelector("iframe")}
function youtubeCommand(func,args=[]){
  const f=activeEmbed();if(!f||!String(f.src).includes("youtube"))return;
  try{f.contentWindow.postMessage(JSON.stringify({event:"command",func,args}),"*")}catch(_){}
}
$("heroCenterPlay")?.addEventListener("click",()=> $("playBtn")?.click());
$("playBtn")?.addEventListener("click",()=>{const m=activeMedia();if(!m)youtubeCommand(playing?"playVideo":"pauseVideo")});
$("volumeBtn")?.addEventListener("click",()=>{const m=activeMedia();if(m)m.muted=muted;else youtubeCommand(muted?"mute":"unMute")});
$("playerTrack")?.addEventListener("click",()=>{const m=activeMedia();if(m&&Number.isFinite(m.duration))m.currentTime=elapsed;else youtubeCommand("seekTo",[elapsed,true])});
$("volumeRange")?.addEventListener("input",e=>{const v=Number(e.target.value)/100,m=activeMedia();if(m){m.volume=v;m.muted=v===0}else youtubeCommand("setVolume",[Math.round(v*100)])});
$("playbackRateSelect")?.addEventListener("change",e=>{const r=Number(e.target.value||1),m=activeMedia();if(m)m.playbackRate=r;else youtubeCommand("setPlaybackRate",[r])});
$("resolutionSelect")?.addEventListener("change",e=>{
  const map={"1080p":"hd1080","720p":"hd720","480p":"large","360p":"medium","Auto":"default"};youtubeCommand("setPlaybackQuality",[map[e.target.value]||"default"])
});
function bindMediaSync(){
  const m=activeMedia();if(!m)return;
  m.addEventListener("timeupdate",()=>{elapsed=Math.floor(m.currentTime||0);if($("playerTime"))$("playerTime").textContent=clock(elapsed)+" / "+clock(m.duration||secs(videos[active]?.[1]));if($("playerProgress"))$("playerProgress").style.width=`${(m.currentTime/Math.max(1,m.duration))*100}%`});
  m.addEventListener("play",()=>{playing=true;if($("playBtn"))$("playBtn").textContent="❚❚"});
  m.addEventListener("pause",()=>{playing=false;if($("playBtn"))$("playBtn").textContent="▶"});
}
const _renderRealVideoV72=renderRealVideo;
renderRealVideo=function(v){_renderRealVideoV72(v);setTimeout(bindMediaSync,0)};

/* ---------- Market/AI/marks load whenever session is ready ---------- */
const _applySessionV72=applySession;
applySession=async function(session){
  await _applySessionV72(session);
  if(session&&sb){
    await Promise.all([loadContentMarks(),loadAiKnowledge()]);
    if(isAdmin)await loadMarketAdminRows();
  }else{contentMarks=new Map();aiKnowledgeRows=[]}
};

/* Keep marks synchronized after remote content refresh */
const _loadRemoteV72=loadRemote;
loadRemote=async function(){
  await _loadRemoteV72();
  if(currentSession&&sb)await loadContentMarks();
};

/* ---------- V7.3: interactive, accessible character behavior ---------- */
let livingReactionTimer=null;
function showLobbyReaction(text,duration=1800){
  // Never replace a message while Lotus Companion is speaking.
  const current=activeLobbyCharacter();
  if(current?.classList.contains("is-speaking"))return;
  const bubble=$("characterSpeechBubble");
  if(!bubble)return;
  clearTimeout(livingReactionTimer);
  bubble.textContent=text;
  bubble.classList.remove("hidden");
  livingReactionTimer=setTimeout(()=>{
    if(!activeLobbyCharacter()?.classList.contains("is-speaking")){
      bubble.classList.add("hidden");bubble.textContent="";
    }
  },duration);
}
(function setupLivingCharacter(){
  const puppet=$("livingCharacterPuppet"),root=$("livingCharacter"),world=document.querySelector(".lobby-world");
  const bodyRig=puppet?.querySelector(".dj-puppet-body-rig"),headRig=puppet?.querySelector(".user-character-head-rig");
  if(!puppet||!root||!world||!bodyRig||!headRig)return;
  const reduce=window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches||false;
  const state={tx:0,ty:0,tr:0,x:0,y:0,r:0,touch:false};
  let raf=0,blinkTimeout=0,blinkFinish=0,idleTimeout=0;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const setTargetFromPoint=(clientX,clientY)=>{
    const b=puppet.getBoundingClientRect();
    const x=clamp((clientX-(b.left+b.width*.5))/(b.width*.62),-1,1);
    const y=clamp((clientY-(b.top+b.height*.27))/(b.height*.58),-1,1);
    state.tx=x*10; state.ty=y*7; state.tr=x*5.5;
  };
  world.addEventListener("pointermove",e=>{
    if(e.pointerType==="touch"||root.classList.contains("hidden")||!$("dashboard")?.classList.contains("active"))return;
    setTargetFromPoint(e.clientX,e.clientY);
  },{passive:true});
  world.addEventListener("pointerleave",()=>{state.tx=0;state.ty=0;state.tr=0});
  puppet.addEventListener("pointerdown",e=>{
    if(e.pointerType!=="touch")return;
    state.touch=true;setTargetFromPoint(e.clientX,e.clientY);
  },{passive:true});
  window.addEventListener("pointerup",e=>{if(e.pointerType==="touch"){state.touch=false;state.tx=0;state.ty=0;state.tr=0}}, {passive:true});
  const greet=()=>{if(!root.classList.contains("hidden"))monkGesture("gesture-wave")};
  puppet.addEventListener("click",greet);
  puppet.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();greet()}});

  const scheduleBlink=()=>{
    clearTimeout(blinkTimeout);
    blinkTimeout=setTimeout(()=>{
      if(!reduce&&!document.hidden&&!root.classList.contains("hidden")&&!root.classList.contains("gesture-meditate")){
        root.classList.add("is-blinking");
        clearTimeout(blinkFinish);blinkFinish=setTimeout(()=>root.classList.remove("is-blinking"),145);
      }
      scheduleBlink();
    },2300+Math.random()*4300);
  };
  const scheduleIdleLook=()=>{
    clearTimeout(idleTimeout);
    idleTimeout=setTimeout(()=>{
      if(!state.touch&&!root.classList.contains("gesture-wave")&&!root.classList.contains("gesture-meditate")&&!root.classList.contains("is-speaking")){
        const dir=(Math.random()*2-1);state.tx=dir*5.5;state.ty=(Math.random()-.5)*3;state.tr=dir*3;
        setTimeout(()=>{if(!state.touch){state.tx=0;state.ty=0;state.tr=0}},1200+Math.random()*900);
      }
      scheduleIdleLook();
    },3600+Math.random()*3200);
  };
  const animate=now=>{
    const t=now/1000;
    const follow=.085;
    state.x+=(state.tx-state.x)*follow;state.y+=(state.ty-state.y)*follow;state.r+=(state.tr-state.r)*follow;
    const speaking=root.classList.contains("is-speaking");
    const meditate=root.classList.contains("gesture-meditate");
    const wave=root.classList.contains("gesture-wave");
    const talkBreath=speaking?1.8:1.0;
    const breath=Math.sin(t*1.35*talkBreath)*(.9+(speaking?1.1:0));
    const bob=Math.sin(t*.72)*.8;
    let bodyY=breath+bob, bodyScaleY=1+Math.sin(t*1.35*talkBreath)*.008, bodyRot=Math.sin(t*.72)*.35;
    let headY=-1+Math.sin(t*1.05)*1.15, headRot=Math.sin(t*.82)*.8;
    if(wave){const w=Math.sin(t*12);headRot+=w*3.2;headY-=Math.abs(w)*2.5;bodyY-=Math.abs(w)*2.2;bodyRot+=w*1.15}
    if(meditate){headY+=Math.sin(t*1.15)*1.5;headRot*=.25;bodyScaleY=1+Math.sin(t*1.15)*.012}
    if(speaking){headY+=Math.sin(t*5.4)*.8;headRot+=Math.sin(t*4.8)*.7}
    puppet.style.setProperty("--body-y",`${bodyY.toFixed(2)}px`);
    puppet.style.setProperty("--body-sy",bodyScaleY.toFixed(4));
    puppet.style.setProperty("--body-rot",`${bodyRot.toFixed(2)}deg`);
    puppet.style.setProperty("--head-x",`${state.x.toFixed(2)}px`);
    puppet.style.setProperty("--head-y",`${(state.y+headY).toFixed(2)}px`);
    puppet.style.setProperty("--head-rx",`${(-state.y*.65).toFixed(2)}deg`);
    puppet.style.setProperty("--head-ry",`${(state.x*.75).toFixed(2)}deg`);
    puppet.style.setProperty("--head-rot",`${(state.r+headRot).toFixed(2)}deg`);
    puppet.style.setProperty("--body-x",`${(state.x*.22).toFixed(2)}px`);
    if(!reduce)raf=requestAnimationFrame(animate);
  };
  if(reduce){puppet.style.setProperty("--body-y","0px");puppet.style.setProperty("--body-sy","1");puppet.style.setProperty("--body-rot","0deg")}
  else raf=requestAnimationFrame(animate);
  scheduleBlink();scheduleIdleLook();
  document.addEventListener("visibilitychange",()=>{if(document.hidden){root.classList.remove("is-blinking");state.tx=0;state.ty=0;state.tr=0}});
  window.addEventListener("beforeunload",()=>{cancelAnimationFrame(raf);clearTimeout(blinkTimeout);clearTimeout(idleTimeout)});
})();

/* V7.7 — true living monk: smooth gaze, breathing, touch response, no audio */
(function setupTrueLivingMonk(){
  const root=$("lobbyMonk"),world=document.querySelector(".lobby-world");
  if(!root||!world)return;
  const head=root.querySelector(".monk-head"),eyes=[...root.querySelectorAll(".monk-eye")],arm=root.querySelector(".monk-arm-right");
  const state={tx:0,ty:0,x:0,y:0};
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const point=(clientX,clientY)=>{
    const b=root.getBoundingClientRect();
    state.tx=clamp((clientX-(b.left+b.width*.5))/(b.width*.62),-1,1);
    state.ty=clamp((clientY-(b.top+b.height*.35))/(b.height*.62),-1,1);
  };
  world.addEventListener("pointermove",e=>{
    if(e.pointerType==="touch"||root.classList.contains("hidden"))return;
    point(e.clientX,e.clientY);
  },{passive:true});
  world.addEventListener("pointerleave",()=>{state.tx=0;state.ty=0},{passive:true});
  root.addEventListener("pointerdown",e=>{if(e.pointerType==="touch")point(e.clientX,e.clientY)},{passive:true});
  window.addEventListener("pointerup",e=>{if(e.pointerType==="touch"){state.tx=0;state.ty=0}},{passive:true});
  const animate=now=>{
    state.x+=(state.tx-state.x)*.085;
    state.y+=(state.ty-state.y)*.085;
    if(!root.classList.contains("hidden")){
      root.style.setProperty("--monk-head-x",`${(state.x*7).toFixed(2)}px`);
      root.style.setProperty("--monk-head-y",`${(state.y*5).toFixed(2)}px`);
      root.style.setProperty("--monk-head-r",`${(state.x*4.5).toFixed(2)}deg`);
      root.style.setProperty("--monk-eye-x",`${(state.x*3.2).toFixed(2)}px`);
      root.style.setProperty("--monk-eye-y",`${(state.y*2.2).toFixed(2)}px`);
    }
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
})();

/* V7.7 — custom uploaded characters also get a gentle interactive idle/parallax treatment. */
(function setupCustomCharacterLife(){
  const root=$("lobbyCustomCharacter"),world=document.querySelector(".lobby-world");
  if(!root||!world)return;
  const state={tx:0,ty:0,x:0,y:0};
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const point=(clientX,clientY)=>{
    const b=root.getBoundingClientRect();
    state.tx=clamp((clientX-(b.left+b.width*.5))/(b.width*.7),-1,1)*8;
    state.ty=clamp((clientY-(b.top+b.height*.38))/(b.height*.7),-1,1)*5;
  };
  world.addEventListener("pointermove",e=>{if(e.pointerType!=="touch"&&!root.classList.contains("hidden"))point(e.clientX,e.clientY)},{passive:true});
  world.addEventListener("pointerleave",()=>{state.tx=0;state.ty=0},{passive:true});
  root.addEventListener("pointerdown",e=>{if(e.pointerType==="touch")point(e.clientX,e.clientY)},{passive:true});
  window.addEventListener("pointerup",e=>{if(e.pointerType==="touch"){state.tx=0;state.ty=0}},{passive:true});
  const animate=()=>{
    state.x+=(state.tx-state.x)*.08;state.y+=(state.ty-state.y)*.08;
    if(!root.classList.contains("hidden")){
      root.style.setProperty("--custom-x",`${state.x.toFixed(2)}px`);
      root.style.setProperty("--custom-y",`${state.y.toFixed(2)}px`);
      root.style.setProperty("--custom-r",`${(state.x*.55).toFixed(2)}deg`);
    }
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
})();

/* V7.7 — voice removed; character stays visually alive without audio. */
characterVoiceReady=false;
characterVoiceActive=false;

/* Dewa / logo / coin visuals are supplied by the user's requested assets. */

})();


/* ---------- V7.6: replace floating complaint artwork + close/reopen ---------- */
(function initComplaintHelperV76(){
  const helper=$("complaintHelper");
  const closeBtn=$("closeComplaintHelper");
  const reopenBtn=$("reopenComplaintHelper");
  if(!helper||!closeBtn||!reopenBtn)return;
  const KEY="dj_complaint_helper_closed_v76";
  const setClosed=(closed,remember=true)=>{
    helper.classList.toggle("is-closed",closed);
    helper.setAttribute("aria-hidden",String(closed));
    if(remember){try{localStorage.setItem(KEY,closed?"1":"0")}catch(_){} }
  };
  let initiallyClosed=false;
  try{initiallyClosed=localStorage.getItem(KEY)==="1"}catch(_){ }
  setClosed(initiallyClosed,false);
  closeBtn.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();setClosed(true,true)});
  reopenBtn.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();setClosed(false,true)});
})();
