---
id: perkamen-ukiran
name: Perkamen Ukiran Kuno
no: 63
source: github:vintage-engraved-parchment
family: painterly
tech: canvas2d
music: folk   voice: el-id-m   captions: serif
best_for: Sejarah maritim, manuskrip kuno, jalur rempah Nusantara, kamus & leksikon awal, kartografi abad ke-16/17, dan catatan naturalis Renaisans
---
# Perkamen Ukiran Kuno (`perkamen-ukiran`)

**Ciri khas (look):** Kertas perkamen tua bernoda sepia (`#efe1ba` → `#bfa068`) dengan garis laid-paper halus, garis rhumb peta kuno, bingkai ukiran tembaga (copperplate cross-hatching) berornamen roset di keempat sudut, mawar angin (`compassRose`), ilustrasi kapal karavel berlayar silang merah (`ship`), spesimen botani cengkih & pala (`spiceBotanical`), serta tabel leksikon yang ditulis pena bulu (`lexiconTable` & `feather`).

**Gerak (motion):** Transisi per adegan mengikuti `AM.cue` dan `AM.wordTime`, kamera mengayun lembut mengikuti irama gelombang laut, pena bulu bergerak menggoreskan kata pada tabel manuskrip, dan kartu arsip (`archivalCard`) muncul bertahap dengan kurva `pop()`.

**Kenapa menarik:** Menggabungkan estetika jurnal penjelajahan abad ke-16 dan ukiran botani Nusantara yang langsung memberi kesan dokumenter sejarah autentik di detik pertama.

**Kit API (`styles/perkamen-ukiran/kit.js`):**
- `PAL`, `cam`, `pop`, `pr`, `bg`, `frame`, `title`, `caption`
- `parchmentHeader(ctx, tag, mainTitle, subTitle, opts)` — banner kepala jurnal perkamen dengan segel rubrikasi merah
- `compassRose(ctx, x, y, r, opts)` — mawar kompas kartografi 8 mata angin dengan cincin derajat
- `ship(ctx, x, y, s, opts)` — kapal karavel tiga tiang dengan layar cross-hatching dan panji merah
- `waves(ctx, y, t, opts)` — gelombang laut bergaya garis ukiran sejajar
- `feather(ctx, x, y, s, opts)` — pena bulu angsa berujung tinta merah
- `spiceBotanical(ctx, x, y, s, opts)` — pelat ilustrasi botani cengkih (`'clove'`) atau pala (`'nutmeg'`)
- `lexiconTable(ctx, x, y, w, h, opts)` — lembar manuskrip kamus Italia–Melayu dengan animasi pena bulu
- `archivalCard(ctx, x, y, w, h, opts)` — kartu catatan arsip berbingkai ganda dengan lencana angka di sisi kanan

**Demos:**
- `demo1` — *Kamus Melayu Pertama Ditulis Pelaut Italia — Catatan Antonio Pigafetta di Tidore 1521* (~64 dtk)
- `demo2` — *Pulau Run Ditukar Manhattan — Peta Rahasia Pala Banda yang Mengubah Peta Dunia 1667* (~64 dtk)
- `demo3` — *Herbarium Amboinense — Rumphius, Naturalis Buta yang Mencatat Seribu Tumbuhan Maluku* (~65 dtk)
