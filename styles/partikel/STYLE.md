---
id: partikel
name: Kawanan Partikel
no: 56
source: github:particle-swarm + particle-point-cloud
family: shader
tech: canvas2d
music: dreamy   voice: id-f   captions: elegant
best_for: Ribuan titik bercahaya (additive glow) pada latar gelap membentuk kawanan burung jalak (murmuration) yang mengalir, lalu berubah bentuk
---
# Kawanan Partikel

**Ciri khas (look):** Ribuan titik bercahaya (additive glow) pada latar gelap membentuk kawanan burung jalak (murmuration) yang mengalir, lalu berubah bentuk. Aturan sederhana boids: jaga jarak, samakan arah, tetap dekat; riset menunjukkan tiap burung mengikuti sekitar 7 tetangga terdekat. Partikel membentuk burung, gelombang, lalu kata.

**Gerak (motion):** Transisi dan animasi mengikuti irama narasi per baris (`AM.cue`, `AM.wordTime`), dengan pergerakan kamera halus dan elemen visual khas gaya `partikel`.

**Kenapa menarik:** Visual Kawanan Partikel memberikan atmosfer khas yang langsung menghentikan scroll pada detik pertama.

**Cerita yang cocok:**
- Ribuan Burung Terbang Tanpa Pemimpin: "Ribuan burung ini terbang bersama... tapi tidak ada satu pun yang memimpin."

**Rumus hook:** "Ribuan burung ini terbang bersama... tapi tidak ada satu pun yang memimpin."

**Kit API (`styles/partikel/kit.js`):**
- Exports: `PAL`, `cam`, `pop`, `pr`, `bg`, `title`, `caption`, `flock`, `boids`, `glowDot`.

**Demo:** "Ribuan Burung Terbang Tanpa Pemimpin" — voice `id-f`, musik `dreamy`. Hook: "Ribuan burung ini terbang bersama... tapi tidak ada satu pun yang memimpin."
