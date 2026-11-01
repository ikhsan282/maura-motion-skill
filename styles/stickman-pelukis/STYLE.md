---
id: stickman-pelukis
name: Stickman Pelukis
no: 67
source: custom:perfectionist-vs-action-taker
family: craft
tech: canvas2d
music: lofi   voice: el-id-m   captions: clean
best_for: perfeksionisme vs aksi, produktivitas kreator, mulai dulu perbaiki belakangan, motivasi kerja
---
# Stickman Pelukis

**Ciri khas (look):** studio lukis gelap (#100F12), dua lampu gantung sorot hangat, kabinet kerja tengah
(kiri rapi: cangkir kuas + palet; kanan berantakan: cipratan cat), 2 easel kayu, tumpukan kanvas lantai
(#1–#16), lukisan pemandangan 3 tier (sketsa → gunung salju → sunset ungu). Karakter stickman putih
outline tebal + glow, kuas di tangan kanan, bisa angkat lukisan ke atas kepala + sparkle.

**Gerak (motion):** kiri `paintCareful` (bungkuk, tangan kiri di dahi, dab halus) vs kanan `paintFast`
(sapuan lebar + lutut mantul). `tossCanvas` lempar kanvas ke tumpukan, `inspectArt` mundur menilai,
`holdPaintingUp` / `showPaintingProud` angkat karya. Counter kabinet #1→#16, cipratan nambah.

**Kenapa menarik:** kontras langsung kebaca: satu teliti satu karya vs satu cepat enam belas karya.
Tumpukan kanvas yang tumbuh = progres visual yang memuaskan.

**Cerita yang cocok:**
- Perfeksionis vs action taker: "Satu kanvas dua minggu, atau enam belas kanvas dua minggu?"
- Mulai dulu, bagus belakangan.
- Kreator: upload dulu, algoritma belakangan.

**Rumus hook:** "[X] dalam [waktu], atau [10X] dalam [waktu yang sama]?" / "Sempurna itu hasil dari
banyak percobaan."

**Kit API (`styles/stickman-pelukis/kit.js`):**
- `StickmanKit.createPerfectionistScene(kit, {})`: lampu, header ID, kabinet, 2 easel, tumpukan
  kanvas, 2 karakter + timeline 14,7 dtk. Header/watermark sudah Bahasa Indonesia.
- Motion artist: `paintCareful`, `paintFast`, `tossCanvas`, `inspectArt`, `holdPaintingUp`,
  `showPaintingProud` (+ 44 motion dasar: basic/emosi/aksi/interaksi/Fajr).
- Props: `hangingLamp`, `artCabinet` (leftCountText/rightCountText/splatterLevel), `easel`
  (tier/progress/hasCanvas), `canvasPile` (count/flyingCanvas), `sparkle`, `drawLandscapeArtwork`.
- Style karakter `neuron`: outline tebal + glow + `handProps` (kuas kanan, `overheadCanvas`).

**Demo:** "Sempurna vs Gerak Cepat", 5 baris ID, voice el-id-m (ElevenLabs George), musik lofi.
