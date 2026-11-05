---
id: stickman-graffiti
name: Stickman Graffiti
no: 74
source: custom:stickman-graffiti-kit
family: stickman
tech: canvas2d
music: lofi   voice: el-id-m   captions: clean
best_for: motivasi kreator, keberanian mulai, gagal vs karya, personal branding jalanan
---
# Stickman Graffiti

**Ciri khas (look):** Panggung tembok bata jalanan malam (`#0b0b12` → `#12121d`) dengan mural neon *pink* (`#ff2fb3`), *cyan* (`#00f0ff`), dan kuning (`#ffe14a`) beserta lelehan cat semprot. Karakter unik **Si Zaki Street-Art Bomber (`graffitiStickman`)** tampil mengenakan **masker respirator separuh wajah dengan tabung filter neon di pipi**, **kacamata *street goggles* bulat di dahi**, rambut runcing bertepi neon, **rompi *bomber* berpercik cat**, serta **kaleng pilox semprot (*aerosol spray can*)** yang menyemburkan kabut warna hidup.

**Gerak (motion):** Transisi 4 babak proses kreatif di depan tembok bata dengan semburan pilox aktif, mural dinding yang berubah setiap babak (`graffitiWallArt`), dan kartu manifesto jalanan di paruh bawah layar.

**Kenapa menarik:** Mengangkat dunia seni jalanan (*street art*) untuk memvisualisasikan keberanian berkarya, mengubah kesalahan menjadi lapisan seni baru, dan membangun ciri khas (*signature style*) yang otentik.

**Cerita yang cocok:**
- Keberanian membuat coretan pertama (*The Blank Wall Paradox* — mulai sebelum merasa sempurna)
- Jangan hapus gagalmu, timpa dengan karya baru (*Creative Iteration & Kintsugi Jalanan*)
- Menemukan suara dan ciri khas sendiri (*Authentic Signature vs Meniru Tren*)

**Kit API (`styles/stickman-graffiti/kit.js`):**
- `PAL` — palet tembok bata gelap dan cat semprot neon (`pink`, `cyan`, `yellow`, `lime`)
- `graffitiBg(ctx, t, opts)` — latar tembok bata jalanan + mahkota grafiti + halo neon
- `graffitiHeader(ctx, badgeText, title, subtitle, opts)` — header stensil jalanan
- `graffitiStickman(ctx, x, floorY, pose, opts)` — karakter unik Si Zaki Street-Art Bomber (`'hesitate'`, `'spray'`, `'victory'`)
- `graffitiWallArt(ctx, floorY, badge, mainText, subText, opts)` — mural neon berlelehan cat di tembok kanan
- `graffitiBubble(ctx, x, y, text, opts)` — balon ucapan stiker jalanan
- `graffitiCard(ctx, cx, cy, w, h, opts)` — kartu manifesto kreator

**Demos:**
1. `demo1` — *Tembok Ini Saksi Mimpimu — Mengapa Coretan Pertama Tidak Perlu Menunggu Sempurna?* (~64 dtk)
2. `demo2` — *Jangan Hapus Gagalmu, Timpa dengan Karya — Seni Mengubah Kesalahan Menjadi Mahakarya* (~64 dtk)
3. `demo3` — *Temukan Ciri Khasmu Sendiri — Mengapa Keaslian Lebih Kuat daripada Meniru Tren?* (~65 dtk)
