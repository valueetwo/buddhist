

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
function persist(){try{localStorage.setItem(KEY,JSON.stringify({videos,materials,faqs,Notes,favorites:[...favorites],playlist:[...playlist],history,active}))}catch(e){/* private/blocked storage: UI tetap jalan */}}
function say(msg){const t=$("toast"); if(!t)return; t.textContent=msg;t.classList.add("show");clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.remove("show"),1800)}
function secs(t){const a=String(t||"0:00").split(":").map(Number);return (a[0]||0)*60+(a[1]||0)}
function clock(s){s=Math.max(0,Math.floor(s));return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")}
function showPage(id){
  
  $$(".nav button[data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===id));
  $$(".page-view").forEach(p=>p.classList.toggle("active",p.id===id));
  const info=document.querySelector(".info"); if(info)info.style.display=id==="dashboard"?"block":"none";
  const layout=document.querySelector(".layout"); if(layout)layout.classList.toggle("content-mode",id!=="dashboard");
  if(id==="tutorial")renderTutorial(); if(id==="materials-library")renderMaterialLibrary(); if(id==="faq")renderFAQ(); if(id==="game")renderGames(); if(id==="kategori")renderCategories(); if(id==="friends")renderFriends(); if(id==="favorit")renderListPage("favorit"); if(id==="playlist")renderListPage("playlist"); if(id==="riwayat")renderListPage("riwayat"); if(id==="pengguna")renderUserManagement(); if(id==="activity-log")renderActivityLogs(); if(id==="complaints")renderComplaints();
  if(id==="tambah-konten")selectTab("video");
  if(id==="dashboard")requestAnimationFrame(()=>{centerCard(active,false);updateCoverFlow()});
}
window.showPage=showPage;
$$(".nav button[data-page]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));
function parseVideoSource(url){
  const raw=String(url||"").trim(); if(!raw)return null;
  try{
    const u=new URL(raw,location.href); const host=u.hostname.replace(/^www\./,"").toLowerCase();
    if(host==="youtu.be"){const id=u.pathname.split("/").filter(Boolean)[0];if(id)return {type:"youtube",src:`https://www.youtube.com/embed/${encodeURIComponent(id)}?rel=0`}}
    if(host.endsWith("youtube.com")){
      let id=u.searchParams.get("v");
      if(!id){const parts=u.pathname.split("/").filter(Boolean);if(["embed","shorts","live"].includes(parts[0]))id=parts[1]}
      if(id)return {type:"youtube",src:`https://www.youtube.com/embed/${encodeURIComponent(id)}?rel=0`};
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
  [...scroller.children].forEach(card=>{
    card.style.transform="none";
    card.style.opacity="1";
    card.style.filter="none";
    card.style.zIndex="1";
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
function renderTutorial(){const root=$("tutorial");if(!root)return;root.innerHTML=`<div class="page-toolbar"><div><h2>Tutorial Video / Mantra</h2><p class="lead" style="margin:4px 0 0">Daftar video/mantra beserta sub materi masing-masing.</p></div><button class="admin-add admin-only" id="openAddVideo" type="button">＋ Tambah Video + Materi</button></div>${videoRows(videos.map((_,i)=>i),true)}`;root.querySelector("#openAddVideo")?.addEventListener("click",()=>openTambah("video"));root.querySelectorAll(".open-material").forEach(b=>b.onclick=()=>openMaterial(+b.dataset.i))}
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
  const list=$("activeMaterialList");if(!list)return;
  const v=videos[active];
  const arr=materials.filter(m=>(m.videoTitle||m.video_title)===v[0]);
  const fallback=[
    {title:"Makna dan manfaat"+v[0],category:"Materi"},
    {title:"Cara melafalkan yang benar",category:"Materi"},
    {title:"Waktu terbaik untuk melantunkan",category:"Materi"},
    {title:"Hikmah dalam kehidupan sehari-hari",category:"Materi"}
  ];
  const shown=arr.length?arr:fallback;
  list.innerHTML=`<div class="material-list-mini">${shown.slice(0,4).map((m)=>{
    const idx=materials.indexOf(m);
    return `<div class="material-chip"${idx>=0?` data-mi="${idx}"`:""}><strong>${esc(m.title)}</strong><small>${esc(m.category||"Materi")}</small></div>`
  }).join("")}</div>`;
  list.querySelectorAll(".material-chip[data-mi]").forEach(x=>x.onclick=()=>openMaterial(+x.dataset.mi));
}
function materialAudioFor(m){
  if(m?.audio_url)return m.audio_url;
  const title=m?.videoTitle||m?.video_title||"";
  const vi=videos.findIndex(v=>v[0]===title);
  return vi>=0?(videos[vi]._audioUrl||""):"";
}
function openMaterial(i){
  const m=materials[i];if(!m)return;
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
  const v=videos[active];
  $("materialDetailVideo").textContent=v[0];
  $("materialDetailCategory").textContent=v[3]||"Tutorial";
  $("materialDetailTitle").textContent="Materi: "+v[0];
  $("materialDetailSummary").textContent="Materi tertulis untuk video ini belum ditambahkan oleh admin.";
  $("materialDetailBody").textContent="Video ini tetap dapat dipelajari dari Dashboard. Setelah admin menambahkan materi tertulis, isi lengkapnya akan tampil di halaman ini.";
  showPage("materi-detail");
});
$("materialDetailBack")?.addEventListener("click",()=>showPage("dashboard"));

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
      <div class="card-actions" style="display:flex"><button class="mini-btn open-material" data-i="${i}" type="button">Buka Materi</button>${isAdmin?`<button class="mini-btn edit-material" data-i="${i}" type="button">Edit</button>`:""}</div>
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
  if($("gameStatus"))$("gameStatus").value="coming_soon";
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
  const row={
    title:$("gameTitle").value.trim(),
    category:$("gameCategory").value,
    description:$("gameDescription").value.trim(),
    thumbnail_url:$("gameThumbnailUrl").value.trim()||null,
    game_url:$("gameUrl").value.trim()||null,
    status:$("gameStatus").value
  };
  if(!row.title)return say("Nama game wajib diisi");
  let error;
  if(editingGameId)({error}=await sb.from("buddhist_games").update(row).eq("id",editingGameId));
  else({error}=await sb.from("buddhist_games").insert(row));
  if(error)return say("Gagal menyimpan game: "+error.message);
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
  renderTutorial();renderMaterialsMini();
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
  ["materialPageTitle","materialSummary","materialContent"].forEach(id=>{if($(id))$(id).value=""});
  if($("materialPageCategory"))$("materialPageCategory").value="";
  if($("materialAttachment"))$("materialAttachment").value="";if($("materialAudioUrl"))$("materialAudioUrl").value="";if($("materialAudioFile"))$("materialAudioFile").value="";
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
$("addMaterialBtn")?.addEventListener("click",()=>openTambah("materi"));$("libraryAddMaterial")?.addEventListener("click",()=>openTambah("materi"));$("contentBack")?.addEventListener("click",()=>showPage("dashboard"));$("cancelMaterial")?.addEventListener("click",()=>showPage("dashboard"));$("cancelVideo")?.addEventListener("click",()=>showPage("dashboard"));
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
  const audioUpload=await uploadMedia($("materialAudioFile")?.files?.[0],"material-audio");const audioUrl=audioUpload||$("materialAudioUrl")?.value.trim()||existing?.audio_url||"";const remote={video_title:obj.videoTitle,title:obj.title,category:obj.category,summary:obj.summary,content:obj.content,audio_url:audioUrl||null};
  if(attachment)remote.attachment_url=attachment;
  else if(existing?.attachment_url)remote.attachment_url=existing.attachment_url;

  if(editingMaterialIndex!==null){
    if(sb&&existing?.id){
      try{const {error}=await sb.from("buddhist_materials").update(remote).eq("id",existing.id);if(error)throw error;await loadRemote()}catch(e){console.error(e);say("Gagal mengubah materi");return}
    }else{
      materials[editingMaterialIndex]={...existing,...obj,attachment_url:remote.attachment_url||"",audio_url:remote.audio_url||""};persist();
    }
    active=parentIndex;
    resetMaterialForm();
    showPage("tutorial");renderTutorial();
    say("Materi berhasil diperbarui");
    return;
  }

  const savedRemote=await remoteInsert("buddhist_materials",remote);
  if(savedRemote===false)return;
  if(savedRemote===null){materials.push({...obj,attachment_url:attachment,audio_url:remote.audio_url||""});persist()}
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
    active=Math.max(0,Math.min(editingVideoIndex,videos.length-1));resetVideoForm();setActive(active,false,true);showPage("dashboard");say("Perubahan video disimpan");return;
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

    if(isAdmin){
      games.forEach((x,i)=>{
        const title=x?.title||"Game";
        const hay=[title,x?.content].filter(Boolean).join(" ").toLowerCase();
        if(hay.includes(q)){
          found.push({type:"Game",i,title,meta:x.category||"Game"});
        }
      });
    }

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
          showPage("dashboard");
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
        }else if(type==="Game"&&games[i]){
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
  await renderLinkedIdentities();
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
  root.innerHTML=identities.length?identities.map(i=>`<div class="linked-identity"><b>${labels[i.provider]||i.provider}</b><span class="identity-linked-badge">Terhubung</span></div>`).join(""):'<div class="page-empty">Belum ada identitas tambahan.</div>';
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

$("complaintFab")?.addEventListener("click",()=>{if(!currentSession)return openAuth();$("complaintModal")?.classList.add("show");$("complaintModal")?.setAttribute("aria-hidden","false")});
$("closeComplaint")?.addEventListener("click",()=>{$("complaintModal")?.classList.remove("show");$("complaintModal")?.setAttribute("aria-hidden","true")});
$("sendComplaint")?.addEventListener("click",async()=>{
  if(!currentSession||!sb)return openAuth();
  const subject=$("complaintSubject").value.trim(),message=$("complaintMessage").value.trim();
  const status=$("complaintStatus");
  if(!subject||!message){if(status){status.textContent="Judul dan pesan wajib diisi.";status.className="auth-status show error"}return}
  const {error}=await sb.from("buddhist_complaints").insert({
    user_id:currentSession.user.id,
    user_email:currentSession.user.email||null,
    subject,message
  });
  if(error){if(status){status.textContent=error.message;status.className="auth-status show error"}return}
  $("complaintSubject").value="";$("complaintMessage").value="";
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
    const {error}=await sb.from("buddhist_complaints").update({status:b.dataset.status,updated_at:new Date().toISOString()}).eq("id",Number(b.dataset.id));
    if(error)return say("Gagal mengubah status");
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
async function remoteInsert(table,obj){if(!sb||!isAdmin)return null;try{const {error}=await sb.from(table).insert(obj);if(error)throw error;await loadRemote();return true}catch(e){console.error(e);say("Gagal simpan online — jalankan SUPABASE-UPGRADE.sql");return false}}
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
    renderFAQ();renderGames();renderCategories();renderMaterialLibrary();
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
  if(open){e.preventDefault();e.stopPropagation();const i=+open.dataset.i;if(videos[i]){setActive(i,false);showPage("dashboard")}return;}
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
  if(row && !e.target.closest("button")){const i=+row.dataset.videoIndex;if(videos[i]){setActive(i,false);showPage("dashboard")}return;}
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

window.addEventListener("resize",updateCoverFlow);
window.addEventListener("buddhist-supabase-ready",initSupabase);
renderCarousel();setupDrag();renderFAQ();renderGames();renderCategories();renderMaterialLibrary();setActive(active,false);syncMaterialPreview();syncVideoPreview();initSupabase();
populateCategorySelects();
})();