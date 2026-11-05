---
id: diorama-miniatur
name: Diorama Miniatur Tilt-shift
no: 55
source: github:procedural-diorama-3d
family: 3D
tech: three
music: folk   voice: el-id-m   captions: bold
best_for: Dunia miniatur tilt-shift: perahu jukung mungil, sungai Martapura, rumah panggung kayu ulin, perahu klotok, kabut subuh keemasan, depth of field
---
# Diorama Miniatur Tilt-shift

**Ciri khas (look):** Dunia miniatur *tilt-shift* skala mainan (Three.js) yang disinari matahari pagi keemasan berbayangan lembut panjang, kabut sungai yang mengambang di atas air beriak, rumah panggung kayu ulin, pohon kelapa dan nipah yang bergoyang tertiup angin, serta efek *depth-of-field tilt-shift* di bagian atas dan bawah layar.

**Gerak (motion):** Kamera drone sinematik yang bergerak perlahan (push-in, crane, top-down spin), *time-lapse* pergerakan matahari dari subuh berbintang (`04.45 WITA`) hingga pagi cerah (`09.00 WITA`), karakter miniatur *acil* yang mendayung dan menoleh, serta label *pill* krem dengan garis penunjuk (*leader line*).

**Kit API (`styles/diorama-miniatur/kit.js`):**
- `stage(AM, opts)`, `setClock(S, h, opts)`, `tiltShift(ctx, S, opts)`
- `riverWorld(S, opts)`, `ripples(S, n)`, `mist(S, opts)`
- `jukungGeo`, `klotokGeo`, `cargo`, `cargoSlot`, `acil`, `acilPose`, `egret`
- `houseParts`, `windowParts`, `palmParts`, `nipahParts`, `treeParts`
- `label`, `titleBlock`, `clockChip`, `oldPhoto`

**3 Demo Siap Pakai (`el-id-m`, 63–65 detik):**
1. **`demo1/` — Pasar Terapung Lok Baintan (~64 dtk)**: Tradisi pasar terapung subuh di Sungai Martapura, *acil* bertopi *tanggui*, transaksi barter (*bapanduk*), hingga pasar bubar pukul sembilan pagi.
2. **`demo2/` — Rumah Lanting & Tepian Sungai Banjar (~64 dtk)**: Arsitektur rumah panggung tepian sungai bertiang kayu ulin (kayu besi), rakit *batang* apung yang mengikuti pasang surut, dan pantulan lampu senja.
3. **`demo3/` — Perjalanan Perahu Klotok Menembus Kabut Subuh (~65 dtk)**: Nadi transportasi sungai Kalimantan dari subuh berbintang menembus kabut pagi, berpapasan dengan jukung dan burung kuntul.
