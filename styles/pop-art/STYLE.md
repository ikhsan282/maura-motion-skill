---
id: pop-art
name: Pop Art Sunburst
no: 57
source: github:pop-sunburst-sticker
family: 2D
tech: canvas2d
music: hype   voice: el-id-m   captions: comic (Bebas Neue)
best_for: psikologi belanja, tips & trik, listicle, fakta uang, "kenapa...?", ranking, hack harian
---
# Pop Art Sunburst

**Ciri khas (look):** Poster pop art kontras tinggi: lime `#c6ff3d`, pink panas `#ff3ea5`, kobalt `#2b3bff`, tangerine `#ff5a1f`, kuning `#ffe14d`, dan tinta `#0e0f1f`. Latar *sunburst* dua warna yang terus berputar, pola titik *Ben-Day / halftone*, stiker *die-cut* miring berpinggiran putih tebal dengan bayangan jatuh keras, tipografi *extra-condensed* (`Bebas Neue`), karakter pembelanja komik pop, serta label harga berwajah ekspresif.

**Gerak (motion):** *Sunburst* berputar kontinu, stiker menampar masuk (*slap-in overshoot + squash*), angka odometer bergulir, mata raksasa memindai harga, panah tebal melesat, serta transisi *colour flood* lingkaran penuh di setiap pergantian babak.

**Kit API (`styles/pop-art/kit.js`):**
- Latar & Transisi: `sunburst`, `benday`, `halftoneBlob`, `flood(ctx, k, col)`
- Stiker & Badge: `cut(g, path, col, {border, shadow})`, `sticker(ctx, text, x, y, opts)`, `starBadge`, `arrow`, `slap(k)`
- Tokoh & Angka: `priceTag(ctx, text, x, y, s, opts)`, `shopper(ctx, x, y, s, opts)`, `popEye`, `odometer`

**3 Demo Siap Pakai (`el-id-m`, 63–65 detik):**
1. **`demo1/` — Kenapa Harga Selalu Berakhir 99? (~63 dtk)**: Psikologi *Left-Digit Effect* (Thomas & Morwitz, 2005) mengapa Rp99.000 terasa jauh lebih murah daripada Rp100.000 dan trik membulatkannya ke atas.
2. **`demo2/` — Jebakan Ukuran Sedang / Decoy Effect (~64 dtk)**: Mengapa harga popcorn atau kopi ukuran sedang sengaja dipasang Rp65.000 agar ukuran Jumbo Rp70.000 terlihat sangat untung (eksperimen Dan Ariely).
3. **`demo3/` — Diskon Coret & Bias Jangkar / Anchoring (~65 dtk)**: Rahasia psikologi *Anchoring Bias* (Tversky & Kahneman) di balik label harga Rp500.000 yang dicoret menjadi Rp199.000.
