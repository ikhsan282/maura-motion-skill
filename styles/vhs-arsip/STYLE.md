---
id: vhs-arsip
name: VHS & Arsip CRT
no: 38
source: github:analog-crt-vhs-archival
family: retro-digital
tech: canvas2d
music: ambient   voice: id-m   captions: typewriter
best_for: misteri nyata, sejarah sains & antariksa, kasus lama, rekaman yang hilang, nostalgia 70-90an, horor ringan
---
# VHS & Arsip CRT

**Ciri khas (look):** rekaman kaset video lawas yang diputar ulang. Gambar dibuat di buffer "pita" 360x640
(resolusi VHS) lalu melewati pass VHS per piksel: chroma diburamkan dan bergeser ke kanan (warna "bleed"),
luma sedikit lembut, garis horizontal bergoyang (tracking), pita noise bergulir, noise head-switching di bawah,
hitam terangkat, cast hangat, saturasi turun. Di atasnya OSD tajam VT323 (PLAY ▶, ◀◀ REW, PAUSE ❙❙, STOP ■,
penghitung waktu, tanggal), lower-third dokumenter kuning/hitam (Inter), scanline 3px dan vignette layar CRT.
Properti arsip: kertas printer fan-fold bergaris hijau dengan lubang traktor, teks dot-matrix, pena merah.

**Gerak (motion):** push-in pelan, gelombang radio datang dari langit, grafik sapuan 72 detik menggambar dirinya,
huruf di cetakan menyala satu per satu, pena merah melingkari lalu menulis "Wow!" (freeze PAUSE), **rewind**
(gambar mundur cepat + pita noise rapat), tiap cut ada sentakan tracking, akhir STOP + layar biru.

**Kenapa menarik:** terasa seperti bukti asli yang ditemukan. Tekstur analog membuat cerita misteri lebih
"nyata", dan bahasa pita (rewind, pause, stop) jadi alat bercerita.

**Cerita yang cocok:**
- Sinyal Wow! 1977: "72 detik sinyal yang tak pernah terulang."
- Hilangnya MH370: "Pesan terakhirnya cuma: Good night."
- Rekaman Voyager Golden Record: "Kita mengirim kaset ke luar tata surya."
- Gerhana 1983 di Jawa: "Pemerintah menyuruh warga bersembunyi di rumah."
- Siaran TV yang dibajak 1987 (Max Headroom): "Pelakunya tak pernah ditemukan."
- Ufo Roswell 1947: "Koran menulis piring terbang... sehari kemudian diralat."

**Rumus hook:** "Selama [durasi] di tahun [X]... [peristiwa ganjil]." / "Rekaman ini [fakta mengejutkan]." /
"Sampai hari ini, [bukti] adalah satu-satunya yang kita punya."

**Kit API (`styles/vhs-arsip/kit.js`):**
- `tape()` → konteks gambar (koordinat 1080x1920, ditulis ke buffer 360x640); `vhs(ctx, t, {mode, tracking, band, bleed, noiseAmt, sat, warm, jump})`;
  `crt(ctx)`.
- OSD: `osd(ctx, t, {mode:'play'|'rew'|'ff'|'pause'|'stop', counter, date, rec, label})`, `osdText()`, `lowerThird(ctx, judul, sub, x, y)`.
- Gambar: `nightSky(g, t)`, `bigEar(g, x, y, s)` (teleskop radio), `waves(g, t, x, y)`, `paper(g, x, y, w, h, {scroll, bar})`,
  `dotText(g, str, x, y, {size})`, `penCircle(g, cx, cy, rx, ry, p)`, `handwrite(g, str, x, y, p)`, `WOW` (nilai 6EQUJ5).

**Demo:** "Sinyal Wow! 1977", 18,9 detik: pita PLAY tanggal AUG. 15 1977, teleskop Big Ear di bawah bintang, gelombang
radio, grafik "72 DETIK" naik-turun → cetakan printer, huruf 6-E-Q-U-J-5 menyala, lower-third Jerry R. Ehman →
pena merah melingkari dan menulis "Wow!" (PAUSE) → REW ke langit yang sama: garis datar, 1977…2022 NIHIL, arah
Sagitarius → kembali ke kertas, lower-third 6EQUJ5, STOP layar biru.
