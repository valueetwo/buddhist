BUDDHIST DASHBOARD — PNG FUNCTION CLONE

Tujuan:
- Fungsi mengikuti Panel PNG: login/daftar, admin/owner, video, materi, FAQ, SOP, kategori, favorit, riwayat, playlist, account, log aktivitas, pencarian, Cover Flow.
- Yang berubah adalah skin/desain menjadi Buddhist cream-oranye-emas dan isi konten mantra.

Supabase:
- memakai project yang sama
- tabel Buddhist terpisah:
  buddhist_videos
  buddhist_materials
  buddhist_faq
  buddhist_sop
- media memakai bucket:
  buddhist-media
- user_roles dan activity_logs tetap memakai sistem account yang sama dengan PNG.

Upload GitHub:
1. Ekstrak ZIP.
2. Upload ISI folder buddhist ke root repository valueetwo/buddhist.
3. Pastikan index.html langsung berada di root.
4. GitHub Pages: main / (root).

Catatan:
- File config.js sudah menunjuk Supabase kamu.
- Project PNG lama tidak perlu diubah.
