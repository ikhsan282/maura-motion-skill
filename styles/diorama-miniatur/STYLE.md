---
id: diorama-miniatur
name: Diorama Miniatur Tilt-shift
no: 55
source: github:procedural-diorama-3d
family: 3D
tech: three
music: folk   voice: id-f   captions: bold
best_for: Dunia miniatur tilt-shift: perahu jukung mungil, sungai Martapura, rumah panggung, kabut subuh keemasan, bayangan lembut panjang, depth of field
---
# Diorama Miniatur Tilt-shift

**Ciri khas (look):** Dunia miniatur tilt-shift: perahu jukung mungil, sungai Martapura, rumah panggung, kabut subuh keemasan, bayangan lembut panjang, depth of field. Pasar terapung Lok Baintan (Kalimantan Selatan) buka subuh, pedagang (acil) berdayung, barter tradisi, sebelum matahari tinggi pasar bubar. Kamera pelan, tilt-shift blur.

**Gerak (motion):** Transisi dan animasi mengikuti irama narasi per baris (`AM.cue`, `AM.wordTime`), dengan pergerakan kamera halus dan elemen visual khas gaya `diorama-miniatur`.

**Kenapa menarik:** Visual Diorama Miniatur Tilt-shift memberikan atmosfer khas yang langsung menghentikan scroll pada detik pertama.

**Cerita yang cocok:**
- Pasar Terapung Lok Baintan: "Di sini, pasar tidak buka di daratan. Pasarnya mengapung di atas sungai."

**Rumus hook:** "Di sini, pasar tidak buka di daratan. Pasarnya mengapung di atas sungai."

**Kit API (`styles/diorama-miniatur/kit.js`):**
- Exports: `PAL`, `part`, `bake`, `moveAll`, `MAT`, `stage`, `setClock`, `tiltShift`, `cargo`, `jukungGeo`, `cargoSlot`, `klotokGeo`, `acil`, `acilPose`, `houseParts`, `windowParts`, `palmParts`, `nipahParts`, `treeParts`, `egret`, `riverX`, `RIVER_W`, `riverWorld`, `ripples`, `mist`, `label`, `titleBlock`, `clockChip`, `oldPhoto`.

**Demo:** "Pasar Terapung Lok Baintan" — voice `id-f`, musik `folk`. Hook: "Di sini, pasar tidak buka di daratan. Pasarnya mengapung di atas sungai."
