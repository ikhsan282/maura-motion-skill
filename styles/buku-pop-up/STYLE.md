---
id: buku-pop-up
name: Buku Pop-up
no: 13
source: drive:13_Buku_Pop-up
family: craft
tech: canvas2d
music: playful   voice: el-id-m   captions: hand
best_for: dongeng, legenda asal-usul tempat, cerita anak, kisah dengan banyak "bangunan" atau hitungan, sejarah ringan
---
# Buku Pop-up

**Ciri khas (look):** buku pop-up sungguhan di atas meja kayu (`#7a4a2a`) di bawah lampu hangat. Buku terbuka 90°:
halaman belakang tegak (latar tercetak), halaman lantai datar. Sampul kain merah `#9e2b25`. Potongan pop-up adalah
kartu tercetak dengan tepi potong krem (ketebalan kertas), serat kertas, dan **bayangan lembut** ke lantai dan naik
ke halaman belakang. Palet cerita: malam `#1f2a52`, langit `#9fd0e6`, subuh `#f2a65a`, batu candi `#9a8f86`, emas `#e3a531`.
Label: kartu krem dengan huruf Fredoka coklat tua; pita judul merah tercetak di tiap halaman.

**Gerak (motion):** semua bidang diproyeksikan dengan kamera perspektif nyata. **Halaman dibalik ke depan**: lembar
belakang jatuh ke arah penonton, potongan lama terlipat rata (lipatan paralel) dan potongan halaman baru berdiri.
Potongan **berdiri dari posisi rata** dengan sedikit memantul seperti kartu kaku; **kecerahan mengikuti sudut**
(bayangan lipatan). Tokoh adalah kartu dengan lengan pada paku keling, **meluncur di celah** (mekanisme tab tarik),
ada **roda putar (volvelle)** yang menghitung, dan **tab TARIK** yang ditarik tangan. Kamera melayang dan mendorong
masuk per halaman; menukik ke detail penting (slot yang kosong).

**Kenapa menarik:** nostalgia buku anak, terasa nyata dan "bisa disentuh", setiap balik halaman memberi kejutan baru.
Hitungan besar (seribu candi! dua juta batu!) jadi tontonan: puluhan kartu berdiri satu per satu.

**Cerita yang cocok:**
- Roro Jonggrang: "Seribu candi dalam semalam. Kurang satu, sang putri jadi batu."
- Timun Mas: tiap bungkusan ajaib membuka halaman baru (hutan bambu, samudra garam, lautan lumpur).
- Sejarah Borobudur: "Dua juta balok batu tanpa semen, kunci ekor burung, 2.672 relief, dan 72 stupa terawang."

**Rumus hook:** "[Angka besar] dalam [waktu singkat]. Kurang satu, dan [akibat]." / "Buka halaman ini, dan [kejutan]."
/ "Ini kisah [tokoh] yang [tindakan mustahil]."

**Kit API (`styles/buku-pop-up/kit.js`):**
- `camera({pos, look, f, cx, cy})`, `project(p)`, `BOOK` (`W`, `HB`, `DF`), `LIGHT`.
- `quad(ctx, img, O, U, V, {n, shade, alpha})`: gambar bidang 3D (halaman besar memakai segitiga presisi).
- `table(ctx)`, `bookBase(ctx)`, `leafArt(key, w, h, draw)`: halaman tercetak (cached).
- `spread(ctx, S, {f, next})`: satu halaman terbuka, atau sedang dibalik ke halaman `next`. `S = {back, floor, pieces(frame)}`.
- `standee(ctx, img, x, d, w, h, a, {frame, shadow})`: kartu berdiri di kedalaman `d`, sudut lipat `a`; `rise(t, t0)` = sudut berdiri memantul.
- `card(key, w, h, draw)`: kartu potong tercetak (tepi krem, masker, bayangan); `candi(kind, w, h, tone)`.
- `figure(who, o)` / `figureIn(ctx, who, x, d, h, a, o, frame)`: tokoh kartu beranimasi (`putri`, `bandung`, `jin`, `warga`, `ayam`, `buto`, `pematung`),
  opsi `arm`, `arm2`, `bob`, `angry`, `stone` (berubah jadi batu), `pound`, `crow`, `sink`, `chisel`, `face`.
- `label(ctx, text, x, y)`, `pullTab(ctx, d, pull)`, `handSprite`, `volvelle(ctx, x, d, value, {r, label})`.

**Paket 3 Demo (`styles/buku-pop-up/`):**
- `demo1` — **Roro Jonggrang & Seribu Candi** (~52 detik, 5 spread, 4 balik halaman): seribu candi berdiri, satu slot kosong, syarat keraton, jin dan roda volvelle menghitung 999, lesung & ayam berkokok, arca ke-1000 di Prambanan.
- `demo2` — **Timun Mas & Empat Bungkusan Ajaib** (~55 detik, 5 spread, 4 balik halaman): ladang ketimun emas Mbok Srini, kejaran Buto Ijo, sulur mentimun & hutan bambu runcing, samudra garam berombak, hingga kawah lumpur mendidih.
- `demo3` — **Keajaiban Candi Borobudur — Dua Juta Balok Batu Tanpa Semen** (~55 detik, 5 spread, 4 balik halaman): bukit Kedu & teras mandala, sambungan batu kunci ekor burung & drainase makara, pematung memahat 2.672 panel relief, 72 stupa terawang Arupadhatu, hingga fajar warisan dunia.
