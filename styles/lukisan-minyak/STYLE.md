---
id: lukisan-minyak
name: Lukisan Minyak Bergerak
no: 22
source: drive:22_Lukisan_Minyak_Bergerak + shorts-animator:oil
family: painterly
tech: paint
music: cinematic   voice: id-m   captions: elegant
best_for: Lukisan minyak bergerak (paint pass oil: sapuan berputar, impasto, warna dalam)
---
# Lukisan Minyak Bergerak

**Ciri khas (look):** Lukisan minyak bergerak (paint pass oil: sapuan berputar, impasto, warna dalam). Penangkapan Pangeran Diponegoro 1830 di Magelang, versi Pieneman (Diponegoro tunduk), Raden Saleh melukis versinya 1857: Diponegoro tegak menantang, tokoh Belanda berkepala besar, dan ia melukis dirinya sendiri di dalam lukisan. Adegan dibangun seperti kanvas yang hidup.

**Gerak (motion):** Transisi dan animasi mengikuti irama narasi per baris (`AM.cue`, `AM.wordTime`), dengan pergerakan kamera halus dan elemen visual khas gaya `lukisan-minyak`.

**Kenapa menarik:** Visual Lukisan Minyak Bergerak memberikan atmosfer khas yang langsung menghentikan scroll pada detik pertama.

**Cerita yang cocok:**
- Lukisan Balasan Raden Saleh: "Lukisan ini... adalah jawaban seorang pelukis Jawa untuk Belanda."

**Rumus hook:** "Lukisan ini... adalah jawaban seorang pelukis Jawa untuk Belanda."

**Kit API (`styles/lukisan-minyak/kit.js`):**
- Exports: `LOOK`, `PAL`, `view`, `drift`, `mix`, `radial`, `rgbaHex`, `poly`, `smooth`, `cloudMass`, `stormSky`, `mountains`, `hills`, `treeClump`, `residence`, `stairs`, `horse`, `carriage`, `COSTUMES`, `RIG`, `figure`, `handPos`, `headPos`, `CANVAS`, `SALEH_CAST`, `castFig`, `salehPainting`, `PIENEMAN_CAST`, `pienemanPainting`, `museumWall`, `goldFrame`, `hang`, `easel`, `paintIn`, `studio`, `drapes`, `plaque`, `title`.

**Demos (`styles/lukisan-minyak/demo1/`, `demo2/`, `demo3/`):**
- **`demo1/`**: *Lukisan Balasan Raden Saleh — Ketika Kuas Pelukis Jawa Melawan Sejarah Kolonial* (~52 detik, 6 babak: Hook → Versi Pieneman yang Tertunduk → Versi Raden Saleh yang Tegak → Sindiran Kepala Besar Perwira → Potret Diri Raden Saleh → Moral Kuas Melawan Sejarah).
- **`demo2/`**: *Perjalanan Raden Saleh — Dari Bangsawan Semarang Menjadi Pelukis Istana Eropa* (~55 detik, 8 babak: Pelukis Sang Raja → Belajar pada Antoine Payen → Pelayaran ke Eropa 1829 → Romantisisme Dresden & Paris → Lukisan Perburuan Singa → Pulang ke Hindia Belanda 1852 → Mahakarya Magelang → Bapak Seni Lukis Modern).
- **`demo3/`**: *Jalan Raya Pos Anyer–Panarukan 1808 — Tragedi Seribu Kilometer di Atas Kanvas Sejarah* (~55 detik, 8 babak: Seribu Kilometer Satu Tahun → Mandat Tangan Besi Daendels → Tebing Batu Cadas Pangeran → Perlawanan Pangeran Kornel Sumedang → Lanskap Megamendung Raden Saleh → Kereta Pos Kolonial → Chiaroscuro Kemanusiaan → Monumen Ketangguhan Nusantara).
- Render salah satu demo: `node scripts/make.mjs styles/lukisan-minyak/demo1/story.json` (atau `demo2` / `demo3`).
