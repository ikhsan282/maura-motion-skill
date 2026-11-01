---
id: buku-pop-up
name: Buku Pop-up
no: 13
source: drive:13_Buku_Pop-up
family: craft
tech: canvas2d
music: musicbox   voice: id-f   captions: hand
best_for: dongeng, legenda asal-usul tempat, cerita anak, kisah dengan banyak "bangunan" atau hitungan, sejarah ringan
---
# Buku Pop-up

**Ciri khas (look):** buku pop-up sungguhan di atas meja kayu (#7a4a2a) di bawah lampu hangat. Buku terbuka 90°:
halaman belakang tegak (latar tercetak), halaman lantai datar. Sampul kain merah #9e2b25. Potongan pop-up adalah
kartu tercetak dengan tepi potong krem (ketebalan kertas), serat kertas, dan **bayangan lembut** ke lantai dan naik
ke halaman belakang. Palet cerita: malam #1f2a52, langit #9fd0e6, subuh #f2a65a, batu candi #9a8f86, emas #e3a531.
Label: kartu krem dengan huruf Fredoka coklat tua; pita judul merah tercetak di tiap halaman.

**Gerak (motion):** semua bidang diproyeksikan dengan kamera perspektif nyata. **Halaman dibalik ke depan**: lembar
belakang jatuh ke arah penonton, potongan lama terlipat rata (lipatan paralel) dan potongan halaman baru berdiri.
Potongan **berdiri dari posisi rata** dengan sedikit memantul seperti kartu kaku; **kecerahan mengikuti sudut**
(bayangan lipatan). Tokoh adalah kartu dengan lengan pada paku keling, **meluncur di celah** (mekanisme tab tarik),
ada **roda putar (volvelle)** yang menghitung, dan **tab TARIK** yang ditarik tangan. Kamera melayang dan mendorong
masuk per halaman; menukik ke detail penting (slot yang kosong).

**Kenapa menarik:** nostalgia buku anak, terasa nyata dan "bisa disentuh", setiap balik halaman memberi kejutan baru.
Hitungan besar (seribu candi!) jadi tontonan: puluhan kartu berdiri satu per satu.

**Cerita yang cocok:**
- Roro Jonggrang: "Seribu candi dalam semalam. Kurang satu, sang putri jadi batu."
- Asal-usul Danau Toba / Tangkuban Perahu (halaman demi halaman alam berubah).
- Si Kancil & buaya: "Ia menghitung buaya... untuk menyeberang sungai."
- Sejarah Borobudur: "Dua juta balok batu, tanpa semen."
- Timun Mas: tiap bungkusan ajaib membuka halaman baru.

**Rumus hook:** "[Angka besar] dalam [waktu singkat]. Kurang satu, dan [akibat]." / "Buka halaman ini, dan [kejutan]."
/ "Ini kisah [tokoh] yang [tindakan mustahil]."

**Kit API (`styles/buku-pop-up/kit.js`):**
- `camera({pos, look, f, cx, cy})`, `project(p)`, `BOOK` (W, HB, DF), `LIGHT`.
- `quad(ctx, img, O, U, V, {n, shade, alpha})`: gambar bidang 3D (halaman besar memakai segitiga presisi).
- `table(ctx)`, `bookBase(ctx)`, `leafArt(key, w, h, draw)`: halaman tercetak (cached).
- `spread(ctx, S, {f, next})`: satu halaman terbuka, atau sedang dibalik ke halaman `next`. S = {back, floor, pieces(frame)}.
- `standee(ctx, img, x, d, w, h, a, {frame, shadow})`: kartu berdiri di kedalaman d, sudut lipat a; `rise(t, t0)` = sudut berdiri memantul.
- `card(key, w, h, draw)`: kartu potong tercetak (tepi krem, masker, bayangan); `candi(kind, w, h, tone)`.
- `figure(who, o)` / `figureIn(ctx, who, x, d, h, a, o, frame)`: tokoh kartu beranimasi (`putri`, `bandung`, `jin`, `warga`, `ayam`),
  opsi `arm`, `arm2`, `bob`, `angry`, `stone` (berubah jadi batu), `pound`, `crow`, `face`.
- `label(ctx, text, x, y)`, `pullTab(ctx, d, pull)`, `handSprite`, `volvelle(ctx, x, d, value)`.

**Demo:** "Roro Jonggrang & Seribu Candi", 19,6 detik, 5 halaman dan 4 balik halaman. Puluhan candi berdiri, satu slot
kosong, sang putri muncul lalu membatu → halaman keraton: Bandung meluncur mendekat, Roro menolak, gulungan "1000 CANDI
dalam 1 malam" berdiri → malam: jin membawa batu, roda menghitung sampai 999 → subuh palsu: warga menumbuk padi, api,
tab ditarik, ayam berkokok, jin kabur → Prambanan: Bandung murka, sang putri jadi "ARCA KE-1000".
