---
id: gacha-3d
name: Toon 3D Gacha Reveal
no: 64
source: github:toon-cel-3d(mobile game reward)
family: 3D
tech: canvas2d
music: hype   voice: el-id-m   captions: bold
best_for: Panggung summon/reward game mobile, psikologi gacha & pity system, satwa langka bertingkat kelangkaan (R/SR/SSR), dan koleksi pusaka/kuliner ikonik
---
# Toon 3D Gacha Reveal (`gacha-3d`)

**Ciri khas (look):** Panggung summon game mobile bergaya cel-shaded 3D dengan outline gelap tebal (`#190b2e`), sinar sunburst berputar di latar belakang, partikel bintang berkilau, mesin kapsul gacha (`machine`), bola kapsul dua warna yang membuka cahaya (`capsule`), serta kartu karakter/item (`gachaRevealCard`) lengkap dengan lencana tingkat kelangkaan (`R ★3` Biru, `SR ★4` Ungu, `SSR ★5` Emas) dan bar statistik RPG.

**Gerak (motion):** Transisi cepat dan penuh antisipasi mengikuti `AM.cue`: kapsul bergetar sebelum terbuka (`open`), sunburst berputar konstan, maskot memantul halus, dan kartu statistik muncul dengan kurva `ease.outBack`.

**Kenapa menarik:** Mengubah fakta edukasi (konservasi satwa langka, matematika probabilitas gacha, dan warisan budaya) menjadi pengalaman visual *pull SSR bintang lima* yang langsung menghentikan scroll.

**Kit API (`styles/gacha-3d/kit.js`):**
- `PAL`, `cam`, `pop`, `pr`, `bg`, `title`, `caption`
- `gachaHeader(ctx, bannerTag, mainTitle, subTitle, opts)` — header summon banner dengan indikator pity di bagian atas
- `machine(ctx, x, y, s, opts)` — mesin dispenser kapsul gacha 3D dengan kaca transparan dan tuas putar
- `capsule(ctx, x, y, r, col, opts)` — bola kapsul gacha 3D dengan efek terbuka (`open`) dan pancaran cahaya
- `mascot(ctx, x, y, r, col, opts)` — medali ikon toon 3D (`'tarsius'`, `'komodo'`, `'badak'`, `'keris'`)
- `gachaRevealCard(ctx, x, y, w, h, opts)` — kartu reveal hadiah lengkap dengan bintang kelangkaan dan 3 bar statistik RPG
- `gachaInfoCard(ctx, x, y, w, h, opts)` — panel fakta & metrik cel-shaded dengan kotak angka di sisi kanan

**Demos:**
- `demo1` — *Gacha Satwa Langka Indonesia — Dari Tarsius hingga Badak Jawa Bintang Lima* (~64 dtk)
- `demo2` — *Psikologi Pity System & Rate 0,6% — Mengapa Kapsul Emas Membuat Otak Ketagihan?* (~64 dtk)
- `demo3` — *Gacha Pusaka & Kuliner Nusantara — Mengumpulkan Rendang, Keris, dan Pinisi Legendaris* (~65 dtk)
