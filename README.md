# Buddhist App V6 — Pertemanan + Owner Player Logs

Tambahan:
1. Menu Pertemanan:
   - setiap akun punya Friend ID unik, contoh DJ-AB12CD34
   - cari teman berdasarkan Friend ID
   - kirim / terima / tolak permintaan pertemanan
   - lihat teman online
   - lihat semua teman
   - hapus teman
   - status online berdasarkan heartbeat akun

2. Log Owner:
   - halaman utama log hanya menampilkan Nama Pemain + Email
   - klik pemain untuk membuka detail log milik pemain tersebut
   - login, logout, aktivitas pertemanan, complain, dan aktivitas lama dapat muncul di detail

Supabase tambahan:
- buddhist_profiles.friend_code
- buddhist_friendships
- RPC pencarian / tambah / terima / hapus teman
- online presence menggunakan buddhist_profiles.last_seen_at

Upload isi ZIP langsung ke ROOT repository `buddhist`.


V6.1:
- Modal login dibuat benar-benar di tengah layar.
- Nama aplikasi diganti menjadi Dhamma Journey pada title dan teks utama.


## V6.2 Auth
Pilihan akun:
- Instagram — Custom OAuth provider `custom:instagram`
- Facebook — Supabase built-in Facebook OAuth
- LINE — Custom OIDC/OAuth provider `custom:line`
- Email — email/password + verifikasi
- WhatsApp — OTP WhatsApp

Untuk Instagram dan LINE, buat Custom OAuth/OIDC Provider di Supabase dengan identifier yang sama.
Untuk WhatsApp OTP, Supabase memerlukan Phone Auth dengan Twilio atau Twilio Verify.
Manual identity linking perlu diaktifkan di Supabase Authentication settings agar tombol Hubungkan Instagram/Facebook/LINE bekerja.


## V6.2.1 Connection Fix
- Memperbaiki syntax `config.js` yang sebelumnya membuat Supabase tidak terbaca.
- Core Supabase (email auth, database, friends, games, complaints, logs) sekarang dapat diinisialisasi.
- Facebook / Instagram / LINE / WhatsApp tetap memerlukan provider credential masing-masing di Supabase Authentication.


## V6.2.2 Email verification redirect fix
Auth redirect dipaksa ke:
https://valueetwo.github.io/buddhist/

Di Supabase Dashboard -> Authentication -> URL Configuration:
- Site URL: https://valueetwo.github.io/buddhist/
- Redirect URLs: https://valueetwo.github.io/buddhist/
  (boleh juga tambahkan https://valueetwo.github.io/buddhist/** bila Supabase menerima wildcard)
Lalu kirim ulang email verifikasi.


## V6.3 - Separate Supabase Project
Dhamma Journey sekarang menggunakan project Supabase sendiri:
- Project: Dhamma Journey
- Project ref: chworywxohcxvuhgwhpj
- Region: ap-southeast-1
- GitHub Pages redirect: https://valueetwo.github.io/buddhist/

Database inti, RLS, friendship RPC, complaint, games, materials, FAQ, activity log, role system,
storage bucket, dan seed content sudah dibuat pada project baru.

Owner email `clarita082523@gmail.com` akan otomatis mendapat role Owner setelah akun tersebut
terdaftar di project Supabase baru.

Catatan: Authentication URL Configuration pada project baru tetap perlu diisi di Dashboard Supabase:
Site URL dan Redirect URL = https://valueetwo.github.io/buddhist/


## V6.4 Full Repair
- Logo sekarang hanya Dewi Kwan Im.
- Gambar thumbnail/side art memakai object-fit contain agar tidak terpotong.
- Complain Owner tidak bocor ke halaman Home.
- Notification bell menjadi notification center.
- Profil/avatar + username dapat diubah.
- Ganti password + lupa password.
- Settings: tema, akun, keamanan, notifikasi, tampilan.
- Komentar per video.
- Search mencakup video, materi, FAQ, game, kategori, deskripsi dan isi.
- Cover-flow Video Populer dipulihkan.
- Responsive desktop/tablet/mobile diperkuat.
- Guardian helper pada tombol complain.


## V6.5
Tambahan:
- Tambah Materi sekarang selalu memilih video induk terlebih dahulu.
- Global Chat untuk semua player.
- Private Chat untuk teman yang sudah diterima.
- Profil dua kolom: Karakter + Data Akun.
- Karakter custom berbayar menggunakan saldo Caishen.
- Top Up Caishen dengan metode Bank atau E-Wallet yang diatur Owner.
- Bukti pembayaran dan foto referensi karakter disimpan di bucket private.
- Owner dapat menyetujui/menolak top up, mengatur harga/rate, dan menyelesaikan request karakter.
- Request karakter yang ditolak otomatis mengembalikan saldo Caishen.


## V6.6 Lobby + AI + Market
- Home diubah menjadi Lobby.
- Tampilan video lama dipindahkan ke menu Video.
- Informasi Bacaan sekarang menampilkan materi tertulis lengkap per video.
- Biksu awal dibuat sebagai karakter CSS animasi: kedip, melihat kiri/kanan/atas/bawah, mengangguk, melambaikan tangan, dan meditasi.
- Market kostum Caishen + inventory + equip.
- Biksu Pendamping AI dengan riwayat percakapan privat.
- Edge Function `dhamma-ai-companion` aktif. Tanpa provider AI eksternal, fungsi tetap menjawab dari pengetahuan Dhamma Journey/fallback.
- Manual linking UI diperluas: Instagram, Facebook, LINE, Email, WhatsApp/Telepon, plus unlink identitas bila aman.


## V67 tambahan
- Gambar Dewa Bumi sidebar diganti ke versi penuh yang lebih rapi.
- Tombol/helper complain kini bertema Guanyu di sisi kanan dan bisa disembunyikan dari Pengaturan > Tampilan.
- Pengaturan notifikasi ditambah pilihan jenis suara + tombol preview.
- Istilah saldo/market di UI diganti dari Caishen menjadi Coin.
- Padding dan jarak antarkolom diperlonggar agar tampilan tidak terlalu rapat.


## V6.8 — Owner Coin & Finance
- Owner menentukan jumlah Coin saat menyetujui top up setelah memastikan uang benar-benar masuk.
- Approval top up otomatis mencatat pemasukan Rupiah ke cash ledger.
- Owner dapat memberikan Coin manual untuk akun test/bonus tanpa mencatatnya sebagai uang masuk.
- Owner dapat mencatat pemasukan/pengeluaran kas lain secara manual.
- Dashboard ringkasan: uang masuk, uang keluar, saldo kas, Coin top up, Coin gratis Owner, saldo Coin player.
- Rekonsiliasi uang ↔ Coin membedakan Coin berbayar dan Coin gratis.
- Rincian terpisah untuk transaksi Rupiah dan transaksi Coin.


## V7.1 — Stable Repair
Perbaikan berdasarkan laporan tampilan:
- Struktur HTML rusak diperbaiki; halaman lain tidak lagi ikut menampilkan blok Pengaturan Akun.
- Blur global dihapus dan header memakai versi yang lebih tajam.
- Informasi Bacaan/Materi tetap berada di sisi kanan video pada desktop.
- Jarak antar kolom/panel diperbesar.
- Karakter starter kini berupa karakter 2D vector berlapis, bukan foto.
- Karakter berkedip, bernapas, melihat kiri/kanan/atas/bawah, mengangguk, melambai, dan mulut bergerak saat AI menjawab.
- Jika karakter custom gagal dimuat, aplikasi otomatis kembali ke starter character.
- Edit/Hapus Materi dan Edit/Hapus Audio tetap tersedia tanpa merombak layout.
- Complaint tidak lagi masuk bell notification; perubahan status masuk Activity Log.
- Request top-up/Coin baru memberi notifikasi ke Owner.


## V7.2 — Safe Feature Patch
Basis tetap V7.1 Stable Repair. Perubahan dibuat sebagai patch terisolasi.

### Tampilan & aset
- Popup Complaint menggunakan Guanyu hijau sesuai referensi user, textarea 500 karakter, Submit/Close.
- Header tanpa blur; logo kiri diganti ke logo baru user.
- Ikon Coin diganti ke aset Coin baru; saldo Coin menggunakan ilustrasi uang/ingot.
- Dewa Bumi user dipasang utuh di bawah sidebar.
- Gambar sisi Game diganti Buddha Maitreya user.
- Thumbnail video memakai komposisi proporsional agar tidak terpotong berlebihan.

### Karakter & Lotus Companion
- Starter character: pilihan Cowo / Cewe menggunakan aset user.
- Karakter memiliki idle movement dan mouth animation saat Lotus Companion menjawab.
- Nama AI menjadi Lotus Companion — “A calm friend in Dhamma Journey”.
- Admin/Owner CRUD Data Jawaban Lotus Companion: tambah, edit, hapus, aktif/nonaktif, kategori, keyword, urutan.
- Jawaban knowledge Owner diprioritaskan sebelum fallback Edge Function.

### Materi + Audio
- Halaman library hanya cover + judul.
- Klik materi membuka tampilan detail ala music/Spotify: cover besar, audio, lyrics/materi lengkap.
- Admin/Owner dapat Edit/Hapus Materi, Edit/Ganti/Hapus Audio.
- Cover materi dapat URL atau upload.
- “Tambah Materi” membuka wizard Video dulu, lalu lanjut Materi setelah video tersimpan.
- Like/Unlike dan Playlist untuk Materi serta Audio dengan status aktif yang jelas.

### Video
- Like/Unlike dan Playlist tersimpan per akun.
- Kontrol Play/Pause, volume/mute, seek, fullscreen, playback speed, dan kualitas (jika provider mendukung).
- Spacing bawah player diperbesar.
- Favorite/Playlist pages menampilkan Video, Materi, dan Audio.

### Game
- Admin/Owner dapat Tambah/Edit/Hapus Game.
- Gambar thumbnail dapat URL atau upload.
- Edit/Hapus hanya terlihat untuk Admin/Owner.

### Pertemanan & Chat
- Panel Semua Teman memenuhi lebar area.
- Private chat menampilkan avatar + username + status.
- Bubble Global/Private tetap menampilkan avatar + username.
- Emoji picker ditambahkan ke kolom chat.

### Market Kostum
- Tombol Refresh diganti More.
- More membuka browser semua produk dengan search/filter.
- Beli/Pakai tetap menggunakan Coin dan inventory.
- Admin/Owner CRUD Market: tambah, edit, hapus, aktif/nonaktif, harga, gender, gambar, urutan.
- Kostum aktif memberi penanda visual pada karakter aktif.

### Owner Coin & Finance
- Struktur V6.8/V7.1 dipertahankan.
- Form Bank/E-Wallet diberi spacing lebih lega.
- Complaint status tidak masuk bell notification; perubahan status masuk Activity Log.
- Request Coin/top-up baru tetap memberi notifikasi Owner.

### Supabase V7.2
- `buddhist_materials.cover_url`
- `buddhist_market_items.image_url`, `gender`, `sort_order`
- `buddhist_ai_knowledge`
- `buddhist_content_marks`
- Market Admin/Owner RLS


## V7.3 — Living Character (patch aman dari V7.2)
- Ilustrasi karakter starter laki-laki dan perempuan tetap sama seperti yang dipilih pemain.
- Sprite karakter dipecah menjadi dua lapisan transparan: `starter-*-body.png` dan `starter-*-head.png`, agar kepala bergerak relatif terhadap tubuh.
- Reaksi karakter: napas halus, kepala mengikuti pointer desktop, kedip acak, kepala mengangguk saat disapa, tenang/meditasi, dan animasi mulut saat teks Lotus Companion tampil.
- Interaksi sentuh/klik dan tombol keyboard Enter/Spasi tersedia. Animasi otomatis menghormati pengaturan `prefers-reduced-motion`.
- Tampilan seluler mendapat penyesuaian ukuran dan reaksi melalui ketukan.
- **Preview tanpa login:** buka `preview-karakter.html` untuk mencoba karakter, mode perempuan/laki-laki, Sapa, Tenang, Bicara.
- Situs utama tetap dibuka dari `index.html`; tidak perlu perubahan Supabase / SQL untuk patch ini.
- File original `starter-male-user.png` dan `starter-female-user.png` tetap disimpan.

### Batasan ilustrasi sumber
- Kedipan dan ekspresi berbicara merupakan lapisan ekspresi bergaya 2D di atas PNG, bukan rekaman Live2D/3D.
- Tombol Sapa menggerakkan kepala/tubuh dan efek sapaan; karena kedua tangan ada pada pose gambar asli, tangan belum melambai secara terpisah. Untuk lambaian tangan sungguhan perlu aset tangan terpisah atau rig baru.
- Karakter kustom unggahan pemain tetap memakai animasi dasar yang sudah ada; pemisahan sprite baru disediakan untuk dua karakter starter bawaan.

## V7.4 Living Chibi Character + Voice
- Starter laki-laki memakai desain chibi baru dengan kepala besar dan proporsi mungil.
- Karakter bernapas, bergoyang halus, menoleh, berkedip, merespons klik/touch, dan melakukan gesture Sapa/Tenang.
- Lotus Companion dapat dibacakan oleh suara browser melalui Web Speech API.
- V7.7: audio/voice karakter dihapus; interaksi tetap visual dan responsif.
- Preview mandiri: `preview-karakter.html`.
- Referensi gaya chibi: `assets/chibi-character-style-reference.png`.

### V7.6 — Complaint helper baru
- Floating Complaint menggunakan aset PNG transparan baru (`assets/complain-helper.png`).
- Tombol X dapat menutup helper besar agar tidak menutupi konten.
- Setelah ditutup, tersedia tombol kecil untuk menampilkan helper kembali.
- Form Complaint dan tombol Submit/Close tetap menggunakan alur Supabase yang sama.


## V80 patch — Complaint popup close
- Tombol silang (×) pada popup Complaint sekarang menutup popup secara langsung.
- Tombol Close memakai fungsi penutup yang sama.
- Klik area backdrop di luar panel menutup popup.
- Tombol Escape pada keyboard juga menutup popup.
- Artwork Guanyu tidak menangkap klik sehingga tidak menghalangi tombol silang.
