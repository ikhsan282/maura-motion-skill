---
id: stickman-oversimplified
name: Stickman OverSimplified
no: 78
source: custom:oversimplified-pop-history
family: craft
tech: canvas2d
music: lofi
voice: el-id-m
captions: clean
best_for: sejarah penemuan sains, biografi ilmuwan muda, eksperimen laboratorium yang mengubah dunia, fakta sejarah unik bergaya komik pop
---

# Stickman OverSimplified (`styles/stickman-oversimplified`)

Gaya **Stickman OverSimplified (No. 78)** menghadirkan estetika **Kartun Sejarah Pop (OverSimplified History)** dengan karakter ikonik **"Si Ilmuwan Muda Bean-Body (`oversimplifiedStickman`)"** yang memiliki kepala bulat oval krem, rambut mangkok (*bowl-cut*) cokelat dengan garis belahan khas, badan pil/kacang berseragam jas biru tua dengan 4 kancing emas vertikal, kaki stik ramping, serta ekspresi komikal (`^ ^`, `> <`, `- -`).

## Ciri Khas Visual & Panggung Dua Babak
- **Babak Jalanan Kota Abad ke-19 (`mode: 'street'`)**: Jalanan batu bulat (*cobblestone street*) dengan barisan gedung bata oker dan merah berperspektif, jendela berdaun kayu hijau/biru, langit cerah berawan, serta pejalan kaki bangsawan bertopi tinggi (*Victorian top-hat passerby*) di latar belakang.
- **Babak Laboratorium Eksperimen (`mode: 'lab'`)**: Dinding bergaris kuning klasik, jendela besar dengan berkas sinar matahari diagonal, rak botol kimia warna-warni, meja kayu laboratorium, serta alat ukur **Galvanometer jarum bergerak** dan tabung elektroda kimia.

## Komponen Utama `kit.js`
- `oversimplifiedBg(ctx, t, { mode, stageTag, col })`
- `oversimplifiedHeader(ctx, badgeText, titleStr, subStr, { col })`
- `oversimplifiedStickman(ctx, x, y, pose, { scale, t, coatColor, hairColor, prop, showLegs, glasses })`
- `drawLabApparatus(ctx, x, y, t, { needleAngle, label, jarColor })`
- `oversimplifiedBubble(ctx, x, y, textStr, { col })`
- `oversimplifiedCard(ctx, cx, cy, w, h, { tag, titleStr, subStr, stat, statSub, col, a })`

## Demos (64–65 Detik, Voice `el-id-m`)
1. **`demo1`**: *Edmond Becquerel 1839 — Remaja 19 Tahun Penemu Listrik Tenaga Surya yang Diabaikan Dunia*
2. **`demo2`**: *Ketidaksengajaan yang Mengubah Dunia — Dari Cawan Jamur Fleming hingga Cokelat Meleleh Microwave*
3. **`demo3`**: *Ignaz Semmelweis 1847 — Dokter yang Ditertawakan Hanya Karena Menyuruh Cuci Tangan*

