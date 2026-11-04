---
id: vhs-arsip
name: VHS & Arsip CRT
no: 38
source: github:analog-crt-vhs-archival
family: retro-digital
tech: canvas2d
music: ambient   voice: el-id-m   captions: typewriter
best_for: misteri nyata, sejarah sains & antariksa, kasus lama, rekaman yang hilang, nostalgia 70-90an, horor ringan
---
# VHS & Arsip CRT

**Ciri khas (look):** rekaman kaset video lawas yang diputar ulang. Gambar dibuat di buffer "pita" 360x640 (resolusi VHS) lalu melewati pass VHS per piksel: chroma diburamkan dan bergeser ke kanan (warna "bleed"), luma sedikit lembut, garis horizontal bergoyang (tracking), pita noise bergulir, noise head-switching di bawah, hitam terangkat, cast hangat, saturasi turun. Di atasnya OSD tajam VT323 (PLAY ▶, ◀◀ REW, PAUSE ❙❙, STOP ■, penghitung waktu, tanggal), lower-third dokumenter kuning/hitam (Inter), scanline 3px dan vignette layar CRT. Properti arsip: kertas printer fan-fold bergaris hijau dengan lubang traktor, teks dot-matrix, pena merah.

**Gerak (motion):** push-in pelan, gelombang radio datang dari langit, grafik sapuan menggambar dirinya, huruf di cetakan menyala satu per satu, pena merah melingkari lalu menulis catatan (freeze PAUSE), **rewind** (gambar mundur cepat + pita noise rapat), tiap cut ada sentakan tracking, akhir STOP + layar biru.

**Kit API (`styles/vhs-arsip/kit.js`):**
- `tape()` → konteks gambar (koordinat 1080x1920, ditulis ke buffer 360x640); `vhs(ctx, t, {mode, tracking, band, bleed, noiseAmt, sat, warm, jump})`; `crt(ctx)`.
- OSD: `osd(ctx, t, {mode:'play'|'rew'|'ff'|'pause'|'stop', counter, date, rec, label})`, `osdText()`, `lowerThird(ctx, judul, sub, x, y)`.
- Gambar: `nightSky(g, t)`, `bigEar(g, x, y, s)` (teleskop radio), `waves(g, t, x, y)`, `paper(g, x, y, w, h, {scroll, bar})`, `dotText(g, str, x, y, {size})`, `penCircle(g, cx, cy, rx, ry, p)`, `handwrite(g, str, x, y, p)`, `WOW` (nilai 6EQUJ5).

## Paket Demo (30–90 Detik)
1. **`demo1/` — *Sinyal Wow! 1977 — 72 Detik Misteri Radio dari Rasi Sagitarius*** (~54 dtk): Rekaman 15 Agustus 1977 di teleskop radio Big Ear Ohio, grafik sapuan 72 detik, cetakan printer dot-matrix `6EQUJ5`, lingkaran pena merah Jerry R. Ehman (`Wow!`), hingga pencarian ulang yang nihil.
2. **`demo2/` — *Piringan Emas Voyager 1977 — Kaset Pesan Bumi yang Mengembara di Luar Tata Surya*** (~64 dtk): Peluncuran Voyager 1 & 2 bersama *Golden Record* berlapis emas, komite Carl Sagan, diagram 14 bintang pulsar di sampulnya, rekaman sapaan *"Selamat Malam"* & gamelan Jawa *Ketawang Puspawarna*, hingga perjalanan >24 miliar kilometer di ruang antarbintang.
3. **`demo3/` — *Gerhana Matahari Total 11 Juni 1983 — Hari Ketika Langit Siang Pulau Jawa Menjadi Malam*** (~64 dtk): Arsip pita video 11 Juni 1983 pukul 11:29 WIB saat totalitas 5 menit 10 detik melintasi Jawa, imbauan menonton lewat televisi, suasana kota yang sunyi senyap, hingga ekspedisi astronom internasional di Borobudur & Tanjung Kodok.
