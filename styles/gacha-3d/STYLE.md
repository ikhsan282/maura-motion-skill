---
id: gacha-3d
name: Toon 3D Gacha Reveal
no: 64
source: github:toon-cel-3d(mobile game reward)
family: 3D
tech: three
music: hype   voice: id-m   captions: bold
best_for: Panggung hadiah game mobile: toon shading 3D dengan outline, sunburst berputar, god rays, kapsul/kartu terbuka, tingkat kelangkaan warna (hijau, biru, ungu, emas)
---
# Toon 3D Gacha Reveal

**Ciri khas (look):** Panggung hadiah game mobile: toon shading 3D dengan outline, sunburst berputar, god rays, kapsul/kartu terbuka, tingkat kelangkaan warna (hijau, biru, ungu, emas). Isi: tarsius, anoa, cendrawasih, komodo, dan badak jawa (legendaris: hanya sekitar beberapa puluh ekor tersisa di Ujung Kulon). Setiap reveal dengan stats lucu tapi fakta benar.

**Gerak (motion):** Transisi dan animasi mengikuti irama narasi per baris (`AM.cue`, `AM.wordTime`), dengan pergerakan kamera halus dan elemen visual khas gaya `gacha-3d`.

**Kenapa menarik:** Visual Toon 3D Gacha Reveal memberikan atmosfer khas yang langsung menghentikan scroll pada detik pertama.

**Cerita yang cocok:**
- Gacha Satwa Langka Indonesia: "Kita buka lima kapsul satwa Indonesia. Yang terakhir... legendaris."

**Rumus hook:** "Kita buka lima kapsul satwa Indonesia. Yang terakhir... legendaris."

**Kit API (`styles/gacha-3d/kit.js`):**
- Exports: `PAL`, `cam`, `pop`, `pr`, `bg`, `title`, `caption`, `machine`, `capsule`, `mascot`.

**Demo:** "Gacha Satwa Langka Indonesia" — voice `id-m`, musik `hype`. Hook: "Kita buka lima kapsul satwa Indonesia. Yang terakhir... legendaris."
