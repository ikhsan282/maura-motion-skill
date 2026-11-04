---
id: manga-action
name: Manga Action
no: 45
source: github:manga-comic-action + anime-motion-comic
family: 2D
tech: canvas2d
music: hype   voice: el-id-m   captions: comic
best_for: olahraga, rekor & fakta kecepatan, duel/rivalitas, momen hype, perbandingan "A vs B", sains aksi
---
# Manga Action

**Ciri khas (look):** halaman manga hitam-putih: kertas `#f6f4ee`, tinta `#0e0e10`, screentone titik (ringan/sedang/gelap
dan gradasi), panel bergaris tebal yang miring, garis fokus radial, garis kecepatan paralel, cipratan tinta, onomatope
raksasa miring (`Bangers`, isi putih-garis hitam), kotak narasi hitam (`Bebas Neue`). Mata close-up tajam dengan iris
bergaris dan kilau.

**Gerak (motion):** on twos (`hold: 2`); panel meluncur masuk sesuai kata, garis fokus "mendidih" tiap 2 frame,
impact frame terbalik (latar hitam, garis putih) dengan getar keras, angka menghitung naik/turun, kilat hitam di setiap
potongan, halaman memutih di akhir.

**Kenapa menarik:** energi shonen langsung terasa; impact frame dan onomatope membuat fakta angka terasa seperti klimaks.

**Cerita yang cocok:**
- Smash 565 km/jam: "Kok bulu tangkis ini lebih cepat dari mobil F1."
- Pukulan udang mantis: "Hewan sekecil jari ini memukul secepat peluru."
- Tendangan bebas pisang Roberto Carlos 1997: "Fisika Efek Magnus yang melengkung mustahil."
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

**Daftar Demo:**
- **Demo 1 (`demo1/`):** *Smash 565 km/jam — Kok Bulu Tangkis yang Lebih Cepat dari Mobil F1* (~62 dtk) — Rantai kinetik smash bulu tangkis Satwiksairaj Rankireddy (565 km/jam, Rekor Guinness 2023) melampaui top speed F1 (378 km/jam) dan Tan Boon Heong (493 km/jam), sebelum 16 helai bulu angsa menjadi parasut pengerem aerodinamis yang memangkas kecepatannya tinggal seperempat.
- **Demo 2 (`demo2/`):** *Tinju Udang Mantis — Pukulan 80 km/jam di Bawah Air yang Memecahkan Kaca Akuarium* (~64 dtk) — Mekanisme pelana pegas kitin (*saddle spring*) udang mantis merak yang melontarkan gada secepat 80 km/jam (10.000 G), menciptakan gelembung kavitasi bersuhu 4.700°C, serta perisai mineral hidroksiapatit spiral Bouligand.
- **Demo 3 (`demo3/`):** *Tendangan Pisang Roberto Carlos 1997 — Fisika Efek Magnus yang Melengkung Mustahil* (~65 dtk) — Tendangan bebas 35 meter tiga jari luar kaki kiri (137 km/jam, 10 putaran/detik) di Lyon 1997 yang melebar 1 meter dari pagar betis lalu menikung tajam akibat Efek Magnus dan transisi lapisan batas turbulen-ke-laminer.
