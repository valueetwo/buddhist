
(()=>{
  const $ = (id)=>document.getElementById(id);
  const $$ = (sel)=>Array.from(document.querySelectorAll(sel));
  const fallback = (window.BUDDHIST_FALLBACK || []).map((x,i)=>({...x,n:i+1}));
  let records = fallback.slice();
  let active = 0;
  let sb = null, session = null, isAdmin = false, editingId = null;
  const favorites = new Set(JSON.parse(localStorage.getItem("buddhist-favorites") || "[]"));
  const playlist = new Set(JSON.parse(localStorage.getItem("buddhist-playlist") || "[]"));
  let history = JSON.parse(localStorage.getItem("buddhist-history") || "[]");

  const fmt = (s)=> {
    if(!isFinite(s)) return "00:00";
    const m = Math.floor(s/60);
    const sec = Math.floor(s%60);
    return String(m).padStart(2,"0") + ":" + String(sec).padStart(2,"0");
  };
  const saveLocal = ()=>{
    localStorage.setItem("buddhist-favorites", JSON.stringify([...favorites]));
    localStorage.setItem("buddhist-playlist", JSON.stringify([...playlist]));
    localStorage.setItem("buddhist-history", JSON.stringify(history));
  };
  const toast = (msg)=>{
    const t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._timer);
    t._timer = setTimeout(()=>t.classList.remove("show"), 1800);
  };
  function showPage(pageId){
    $$(".page-view").forEach(el=>el.classList.toggle("active", el.id === pageId));
    $$(".nav-item").forEach(btn=>btn.classList.toggle("active", btn.dataset.page === pageId));
    if(window.innerWidth <= 820){ $("sidebar").classList.remove("open"); }
    if(pageId === "favorit") renderCollection("favoriteGrid", [...favorites]);
    if(pageId === "playlist") renderCollection("playlistGrid", [...playlist]);
    if(pageId === "riwayat") renderCollection("historyGrid", history);
  }

  function renderVideoCard(item, index, large = false){
    const key = String(item.id ?? item.n);
    const fav = favorites.has(key) || favorites.has(Number(key));
    const list = playlist.has(key) || playlist.has(Number(key));
    return `
      <article class="${large ? 'mantra-card' : 'video-card'}${index===active && !large ? ' active' : ''}" data-index="${index}">
        <div class="video-thumb">
          <img src="${item.thumb || 'assets/thumb-1.png'}" alt="${item.title}">
          <span class="duration-badge">${item.duration || '00:00'}</span>
        </div>
        <div class="video-body">
          <h4 class="video-title">${item.title}</h4>
          <div class="video-sub">
            <span>${item.pinyin || item.category || ''}</span>
            ${large ? '' : '<span class="dots">⋮</span>'}
          </div>
          ${large ? `
            <div class="card-actions">
              <button class="small-btn" data-fav="${key}">${fav ? '♥ Favorit' : '♡ Favorit'}</button>
              <button class="small-btn" data-list="${key}">${list ? '✓ Playlist' : '＋ Playlist'}</button>
              ${isAdmin ? `<button class="small-btn" data-edit="${index}">✎ Edit</button>` : ''}
            </div>` : ''}
        </div>
      </article>
    `;
  }
  function bindCardEvents(scope = document){
    scope.querySelectorAll("[data-index]").forEach(el=>{
      el.onclick = (ev)=>{
        if(ev.target.closest("button")) return;
        const idx = Number(el.dataset.index);
        selectRecord(idx);
        if(el.closest("#mantraGrid")) showPage("dashboard");
      };
    });
    scope.querySelectorAll("[data-fav]").forEach(btn=>{
      btn.onclick = (ev)=>{ ev.stopPropagation(); toggleFavorite(btn.dataset.fav); };
    });
    scope.querySelectorAll("[data-list]").forEach(btn=>{
      btn.onclick = (ev)=>{ ev.stopPropagation(); togglePlaylist(btn.dataset.list); };
    });
    scope.querySelectorAll("[data-edit]").forEach(btn=>{
      btn.onclick = (ev)=>{ ev.stopPropagation(); openEditor(Number(btn.dataset.edit)); };
    });
  }
  function renderDashboardCards(source = records){
    $("carousel").innerHTML = source.slice(0,5).map((item,index)=>{
      const idx = records.indexOf(item);
      return renderVideoCard(item, idx, false);
    }).join("");
    bindCardEvents($("carousel"));
  }
  function renderMantraGrid(source = records){
    $("mantraGrid").innerHTML = source.map((item,index)=>renderVideoCard(item,index,true)).join("");
    bindCardEvents($("mantraGrid"));
  }
  function renderCollection(targetId, keys){
    const indexList = keys
      .map(k => records.findIndex(v => String(v.id ?? v.n) === String(k)))
      .filter(i => i >= 0);
    const target = $(targetId);
    if(!indexList.length){
      target.innerHTML = '<article class="doc-card"><p>Belum ada data.</p></article>';
      return;
    }
    target.innerHTML = indexList.map(i=>renderVideoCard(records[i], i, true)).join("");
    bindCardEvents(target);
  }
  function renderDocs(faq = [], sop = []){
    $("faqList").innerHTML = (faq.length ? faq : [
      {question:"Bagaimana cara membaca mantra?",answer:"Pilih mantra, lalu ikuti teks dan audio secara perlahan."},
      {question:"Apakah bisa diputar di HP?",answer:"Bisa, tampilan sudah responsif untuk perangkat mobile."}
    ]).map(item=>`<article class="doc-card"><h3>${item.question}</h3><p>${item.answer}</p>${item.important_note ? `<p style="margin-top:8px"><b>Catatan:</b> ${item.important_note}</p>` : ""}</article>`).join("");
    $("sopList").innerHTML = (sop.length ? sop : [
      {title:"Panduan Pelafalan", content:"Baca dengan tenang dan jelas. Gunakan audio sebagai panduan."},
      {title:"Urutan Bacaan", content:"Pilih mantra yang ingin dipelajari lalu putar audio dan buka materi."}
    ]).map(item=>`<article class="doc-card"><h3>${item.title}</h3><p>${item.content}</p></article>`).join("");
  }
  function renderCategories(){
    const groups = {};
    records.forEach(v => { groups[v.category || "Lainnya"] = (groups[v.category || "Lainnya"] || 0) + 1; });
    $("categoryList").innerHTML = Object.entries(groups).map(([name,count]) =>
      `<article class="category-card">${name}<small>${count} bacaan</small></article>`
    ).join("");
  }
  function renderMaterials(item){
    const materials = item.materials && item.materials.length ? item.materials : [
      {title:`Makna dan manfaat${item.title}`},
      {title:"Cara melafalkan yang benar"},
      {title:"Waktu terbaik untuk melantunkan"},
      {title:"Hikmah dalam kehidupan sehari-hari"}
    ];
    $("materials").innerHTML = materials.slice(0,4).map((mat, idx)=>`
      <div class="material-item">
        <span class="material-num">${idx+1}</span>
        <span>${mat.title || mat}</span>
      </div>`).join("");
  }
  function selectRecord(index, pushHistory = true){
    active = Math.max(0, Math.min(index, records.length - 1));
    const item = records[active];
    $("heroTitle").textContent = item.title;
    $("heroSub").textContent = "Buddhist Dashboard";
    $("infoTitle").textContent = item.title;
    $("infoPinyin").textContent = item.pinyin || "";
    $("infoDesc").textContent = item.description || "";
    $("infoDuration").textContent = item.duration_label || item.duration || "-";
    $("infoCategory").textContent = item.category || "Mantra";
    $("infoThumb").src = item.thumb || "assets/thumb-1.png";
    const key = String(item.id ?? item.n);
    $("favBtn").textContent = (favorites.has(key) || favorites.has(Number(key))) ? "♥" : "♡";
    renderMaterials(item);
    if(item.audio){
      if($("audio").getAttribute("src") !== item.audio){
        $("audio").src = item.audio;
        $("audio").load();
      }
    }
    if(pushHistory){
      history = [key, ...history.filter(v => String(v) !== key)].slice(0,20);
      saveLocal();
    }
    renderDashboardCards();
    renderMantraGrid();
  }
  function toggleFavorite(key){
    if(favorites.has(key) || favorites.has(Number(key))){
      favorites.delete(key); favorites.delete(Number(key));
    } else favorites.add(key);
    saveLocal();
    selectRecord(active, false);
    toast("Favorit diperbarui");
  }
  function togglePlaylist(key){
    if(playlist.has(key) || playlist.has(Number(key))){
      playlist.delete(key); playlist.delete(Number(key));
    } else playlist.add(key);
    saveLocal();
    renderMantraGrid();
    toast("Playlist diperbarui");
  }

  // navigation
  $$(".nav-item").forEach(btn => btn.onclick = ()=> showPage(btn.dataset.page));
  $("seeAllBtn").onclick = ()=> showPage("mantra");
  $("mobileBtn").onclick = ()=> $("sidebar").classList.toggle("open");
  $("favBtn").onclick = ()=> toggleFavorite(String(records[active].id ?? records[active].n));

  // material modal
  $("materials").onclick = ()=> {
    const item = records[active];
    $("modalCategory").textContent = item.category || "Mantra";
    $("modalTitle").textContent = item.title + " — " + (item.pinyin || "");
    const mats = item.materials && item.materials.length ? item.materials : [
      {title:"Teks Hanzi", content:item.hanzi || ""},
      {title:"Pinyin", content:item.reading || ""}
    ];
    $("modalBody").textContent = mats.map(mat => [mat.title, mat.summary || "", mat.content || ""].filter(Boolean).join("\n")).join("\n\n");
    $("materialModal").classList.add("show");
  };

  // audio
  const audio = $("audio");
  const togglePlay = ()=>{
    if(!audio.getAttribute("src")){
      toast("Audio belum tersedia.");
      return;
    }
    if(audio.paused) audio.play();
    else audio.pause();
  };
  $("heroPlay").onclick = togglePlay;
  $("miniPlay").onclick = togglePlay;
  audio.onplay = ()=>{$("heroPlay").textContent="❚❚";$("miniPlay").textContent="❚❚";};
  audio.onpause = ()=>{$("heroPlay").textContent="▶";$("miniPlay").textContent="▶";};
  audio.ontimeupdate = ()=>{
    $("currentTime").textContent = fmt(audio.currentTime);
    $("progress").style.width = (audio.duration ? audio.currentTime / audio.duration * 100 : 0) + "%";
  };
  audio.onloadedmetadata = ()=>{$("totalTime").textContent = fmt(audio.duration);};
  $("track").onclick = (e)=>{
    if(!audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audio.currentTime = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * audio.duration;
  };
  $("volumeBtn").onclick = ()=> {
    audio.muted = !audio.muted;
    $("volumeBtn").textContent = audio.muted ? "🔇" : "🔊";
  };

  // search
  $("searchInput").oninput = (e)=>{
    const q = e.target.value.trim().toLowerCase();
    if(!q){
      renderDashboardCards();
      renderMantraGrid();
      return;
    }
    const filtered = records.filter(item =>
      [item.title, item.pinyin, item.category, item.description, item.hanzi, item.reading].join(" ").toLowerCase().includes(q)
    );
    $("carousel").innerHTML = filtered.map(item => renderVideoCard(item, records.indexOf(item), false)).join("") || '<article class="doc-card"><p>Tidak ditemukan.</p></article>';
    bindCardEvents($("carousel"));
    $("mantraGrid").innerHTML = filtered.map(item => renderVideoCard(item, records.indexOf(item), true)).join("") || '<article class="doc-card"><p>Tidak ditemukan.</p></article>';
    bindCardEvents($("mantraGrid"));
  };

  // modals
  $$("[data-close]").forEach(btn => btn.onclick = ()=> btn.closest(".modal").classList.remove("show"));
  $$(".modal").forEach(modal => modal.onclick = (e)=> { if(e.target === modal) modal.classList.remove("show"); });

  // auth & supabase
  async function initSupabase(){
    const config = window.BUDDHIST_CONFIG || {};
    if(!window.supabase || !config.supabaseUrl || !config.supabaseAnonKey) return;
    sb = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
    try{
      const { data: rows } = await sb.from("buddhist_videos").select("*").eq("is_deleted", false).order("id");
      const { data: materials } = await sb.from("buddhist_materials").select("*").order("id");
      if(rows && rows.length){
        records = rows.map((row, i)=>{
          const fallbackMatch = fallback.find(v => v.title === row.title) || fallback[i] || {};
          const pinyinFromTags = (row.tags || []).find(v => v !== "mantra");
          return {
            ...fallbackMatch,
            ...row,
            id: row.id,
            n: i+1,
            pinyin: pinyinFromTags || fallbackMatch.pinyin || "",
            thumb: fallbackMatch.thumb || "assets/thumb-1.png",
            audio: fallbackMatch.audio || row.video_url || "",
            hanzi: fallbackMatch.hanzi || "",
            reading: fallbackMatch.reading || "",
            materials: (materials || []).filter(m => m.video_title === row.title)
          };
        });
      }
      const { data: faqRows } = await sb.from("buddhist_faq").select("*").order("id");
      const { data: sopRows } = await sb.from("buddhist_sop").select("*").order("id");
      renderDocs((faqRows || []).map(v=>({question:v.question, answer:v.answer, important_note:v.important_note})),
                 (sopRows || []).map(v=>({title:v.title, content:v.content})));
      renderCategories();
      renderDashboardCards();
      renderMantraGrid();
      selectRecord(0, false);
      const { data: { session: currentSession } } = await sb.auth.getSession();
      if(currentSession) applySession(currentSession);
      sb.auth.onAuthStateChange((_event, sess)=> {
        if(sess) applySession(sess);
        else clearSession();
      });
    }catch(err){
      console.warn(err);
      renderDocs();
      renderCategories();
      renderDashboardCards();
      renderMantraGrid();
      selectRecord(0, false);
    }
  }
  async function applySession(sess){
    session = sess;
    $("profileName").textContent = (sess.user.email || "Admin").split("@")[0];
    $("profileRole").textContent = "Administrator";
    if(sb){
      const { data } = await sb.from("user_roles").select("role,is_owner,approved").eq("user_id", sess.user.id).maybeSingle();
      isAdmin = !!(data && data.approved && (data.role === "admin" || data.is_owner));
    }
    $("addMantraBtn").classList.toggle("hidden", !isAdmin);
    renderMantraGrid();
  }
  function clearSession(){
    session = null;
    isAdmin = false;
    $("profileName").textContent = "Admin";
    $("profileRole").textContent = "Administrator";
    $("addMantraBtn").classList.add("hidden");
    renderMantraGrid();
  }
  $("authBtn").onclick = async()=>{
    if(session && sb){
      await sb.auth.signOut();
      toast("Logout berhasil");
      return;
    }
    $("authModal").classList.add("show");
  };
  $("loginBtn").onclick = async()=>{
    if(!sb){
      $("authStatus").textContent = "Supabase belum tersambung.";
      return;
    }
    $("authStatus").textContent = "Memproses...";
    const email = $("emailInput").value.trim();
    const password = $("passwordInput").value;
    const { error } = await sb.auth.signInWithPassword({ email, password });
    $("authStatus").textContent = error ? error.message : "Berhasil login";
    if(!error) setTimeout(()=> $("authModal").classList.remove("show"), 500);
  };

  function openEditor(index = null){
    if(!isAdmin){
      toast("Khusus admin.");
      return;
    }
    editingId = index == null ? null : records[index].id;
    const item = index == null ? {} : records[index];
    $("editorTitle").textContent = index == null ? "Tambah Mantra" : "Edit Mantra";
    $("editTitle").value = item.title || "";
    $("editPinyin").value = item.pinyin || "";
    $("editCategory").value = item.category || "";
    $("editDuration").value = item.duration || "";
    $("editAudio").value = item.video_url || item.audio || "";
    $("editDescription").value = item.description || "";
    $("editorStatus").textContent = "";
    $("editorModal").classList.add("show");
  }
  $("addMantraBtn").onclick = ()=> openEditor(null);
  $("saveBtn").onclick = async()=>{
    if(!sb || !isAdmin) return;
    const payload = {
      title: $("editTitle").value.trim(),
      category: $("editCategory").value.trim(),
      description: $("editDescription").value.trim(),
      duration: $("editDuration").value.trim(),
      duration_label: $("editDuration").value.trim(),
      language: "Indonesia",
      video_url: $("editAudio").value.trim() || null,
      tags: ["mantra", $("editPinyin").value.trim()],
    };
    if(!payload.title){
      $("editorStatus").textContent = "Judul wajib diisi.";
      return;
    }
    $("editorStatus").textContent = "Menyimpan...";
    let error = null;
    if(editingId){
      ({ error } = await sb.from("buddhist_videos").update(payload).eq("id", editingId));
    }else{
      payload.base_key = "user-" + Date.now();
      payload.is_deleted = false;
      ({ error } = await sb.from("buddhist_videos").insert(payload));
    }
    $("editorStatus").textContent = error ? error.message : "Tersimpan";
    if(!error) setTimeout(()=> location.reload(), 600);
  };

  // initial render
  renderDocs();
  renderCategories();
  renderDashboardCards();
  renderMantraGrid();
  selectRecord(0, false);
  initSupabase();
})();
