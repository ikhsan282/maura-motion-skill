---
id: tinta-novel-grafis
name: Tinta Novel Grafis
no: 29
source: shorts-animator:ink + github:manga-comic-action(ink)
family: painterly
tech: paint
music: cinematic   voice: el-id-m   captions: comic
best_for: sejarah heroik Nusantara, biografi tokoh besar, pertempuran epik, misteri sejarah, kisah berpanel dramatis
---
# Tinta Novel Grafis

**Ciri khas (look):** Goresan tinta kuas & pena di atas kertas perkamen hangat (`#f4efe3`) dengan sapuan *wash* cat air datar (`base: 'ink'`). Garis kontur tinta hitam pekat (`#1b1712`) sedikit bergetar hidup (*boil*), berpadu dengan aksen merah sinabar (`#b83228`), emas tua (`#c9963b`), dan biru nila (`#2d4a68`). Komposisi menggunakan bingkai panel novel grafis, *speed lines* radial/diagonal, siluet kontras tinggi, dan kotak narasi komik klasik.

**Gerak (motion):** Transisi antarpanel komik, kamera menukik ke panel *close-up* dramatis saat klimaks (seperti pengucapan Sumpah Palapa atau serbuan kapal Jong), garis kecepatan (*action lines*) bergetar, dan tekstur garis tinta berdenyut halus pada 12fps.

**Kenapa menarik:** Memberikan bobot dramatis, heroik, dan sinematik layaknya membaca lembaran novel grafis sejarah premium yang hidup.

**Cerita yang cocok:**
- Sumpah Palapa Gajah Mada (1336): "Ia bersumpah tidak akan menikmati hidup... sebelum Nusantara bersatu."
- Ekspedisi Pati Unus ke Malaka (1513): "Seratus kapal Jong raksasa berlapis kayu jati berlayar menantang meriam Portugis."
- Strategi Sultan Agung di Batavia (1628): "Pasukan Mataram membendung Sungai Ciliwung di tengah malam."

**Rumus hook:** "Di hadapan seluruh pembesar istana, satu orang berdiri dan mengucapkan sumpah yang mengubah sejarah..."

**Kit API (`styles/tinta-novel-grafis/kit.js`):**
- `LOOK`, `PAL`, `painter(AM, { scale, overrides })`, `view(P, { x, y, z, rot })`, `pop`, `clamp`, `lerp`, `ease`, `TAU`.
- Panel & Atmosfer Tinta: `parchmentBg(g, { mood })`, `panelFrame(g, x, y, w, h, { fill, thick })`, `speedLines(g, cx, cy, { n, r0, r1, t, col })`, `inkSun(g, x, y, r, { col })`, `waves(g, { y0, y1, t })`.
- Arsitektur, Kapal & Tokoh: `candiBentar(g, x, y, s)`, `pendopo(g, x, y, s)`, `warrior(g, x, y, s, { t, weapon, capeCol, pose, silhouette })`, `jongShip(g, x, y, s, { t })`, `archipelagoMap(g, x, y, s, { prog, t })`, `cannonFire(g, x, y, s, { t })`.
- Tipografi Komik: `comicBorder(ctx)`, `captionBox(ctx, title, sub, x, y, { a, tag })`, `sfxText(ctx, str, x, y, { a, size, rot })`.

**Paket Demo (30–90 Detik):**
1. **`demo1`** — *Sumpah Palapa Gajah Mada 1336 — Ikrar Sang Mahapatih Menyatukan Nusantara* (~52 detik): Pelantikan Gajah Mada oleh Ratu Tribhuwana Tunggadewi, ikrar Amukti Palapa menyebutkan sepuluh wilayah Nusantara, ejekan para bangsawan, hingga kejayaan armada Majapahit.
2. **`demo2`** — *Ekspedisi Pati Unus ke Malaka 1513 — Sang Pangeran Sabrang Lor dan Ratusan Kapal Jong* (~55 detik): Keberanian Adipati Unus dari Jepara dan Demak memimpin armada kapal Jong berlapis papan jati tebal menyeberangi selat menuju Malaka.
3. **`demo3`** — *Pertahanan Sultan Agung & Benteng Batavia — Strategi Membendung Sungai Ciliwung 1628* (~55 detik): Perjalanan darat ribuan prajurit Mataram dari Karta ke Batavia dan taktik rekayasa membendung aliran Sungai Ciliwung.

