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
