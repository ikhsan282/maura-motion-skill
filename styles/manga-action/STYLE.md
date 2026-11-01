---
id: manga-action
name: Manga Action
no: 45
source: github:manga-comic-action + anime-motion-comic
family: 2D
tech: canvas2d
music: hype   voice: id-m   captions: comic
best_for: olahraga, rekor & fakta kecepatan, duel/rivalitas, momen hype, perbandingan "A vs B", sains aksi
---
# Manga Action

**Ciri khas (look):** halaman manga hitam-putih: kertas #f6f4ee, tinta #0e0e10, screentone titik (ringan/sedang/gelap
dan gradasi), panel bergaris tebal yang miring, garis fokus radial, garis kecepatan paralel, cipratan tinta, onomatope
raksasa miring (Bangers, isi putih-garis hitam), kotak narasi hitam (Bebas Neue). Mata close-up tajam dengan iris
bergaris dan kilau.

**Gerak (motion):** on twos (`hold: 2`); panel meluncur masuk sesuai kata, garis fokus "mendidih" tiap 2 frame,
impact frame terbalik (latar hitam, garis putih) dengan getar keras, angka menghitung naik/turun, kilat hitam di setiap
potongan, halaman memutih di akhir.

**Kenapa menarik:** energi shonen langsung terasa; impact frame dan onomatope membuat fakta angka terasa seperti klimaks.

**Cerita yang cocok:**
- Smash 565 km/jam: "Kok bulu tangkis ini lebih cepat dari mobil F1."
- Tendangan bebas terkencang: "Bola ini bergerak lebih cepat dari keputusan kiper."
- Pukulan udang mantis: "Hewan sekecil jari ini memukul secepat peluru."
- Kamera HP vs kamera bioskop: "Cuma satu yang selamat di shot malam."
- Lari 100 meter: "Sembilan koma lima delapan detik."

**Rumus hook:** "[Benda kecil] ini lebih cepat/kuat dari [benda besar]." / "[Angka mengejutkan]. Dan itu dilakukan
manusia." / "Hanya satu yang [menang]. Begini caranya."

**Kit API (`styles/manga-action/kit.js`):**
- Panel: `page`, `panel(ctx, pts, fn, {k, from})`, `shatter`.
- Nada & garis: `tone(ctx, density)`, `toneFill`, `gradTone`, `focusLines`, `speedLines`, `splat`.
- Huruf: `sfxText(ctx, 'DUAR!', x, y, {size, k, invert})`, `capBox`.
- Tokoh: `player(ctx, 'raka'|'dimas', x, y, s, POSES.crouch|jump|cock|smash|ready, {sil})`, `eyeStrip(ctx, who, x, y, s, {mood: fierce|calm|shock, look, reflect, sweat})`.
- Properti: `shuttle({ang, flare, trail})`, `racket`, `raceCar` (mobil formula generik tanpa merek).

**Demo:** "Smash 565 km/jam", 19,2 dtk, 5 shot. Mobil F1 melaju lalu kok menyalipnya "WHUSH!" → tiga panel: lompat,
tarik raket, mata tajam → impact frame "DUAR!", smash, 0→565 KM/JAM, stempel "Rekor Dunia Guinness · 2023" dan grafik
kok 565 vs F1 ±378 → bulu kok jadi rem udara, angka turun 565→141, "¼" → dua mata pemain: "Yang menang: yang membaca".
Fakta: rekor Satwiksairaj Rankireddy, 565 km/jam (Guinness, 14 April 2023, Soka, Jepang); rekor top speed F1 ±378 km/jam
(Bottas, Baku 2016); kecepatan kok kira-kira separuh tiap ±3,35 m (arXiv 2601.01412).
