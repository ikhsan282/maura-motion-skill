---
id: psychedelic-shader
name: Psychedelic Shader
no: 48
source: github:psychedelic-glitch + shader-psychedelia
family: shader
tech: shader
music: ambient   voice: id-f   captions: neon
best_for: Seni matematis GLSL: zoom fraktal Mandelbrot dengan pewarnaan orbit, kaleidoskop, hue cycling, terowongan neon, glitch RGB
---
# Psychedelic Shader

**Ciri khas (look):** Seni matematis GLSL: zoom fraktal Mandelbrot dengan pewarnaan orbit, kaleidoskop, hue cycling, terowongan neon, glitch RGB. z = z kuadrat + c, setiap titik diuji, batas himpunan tak berujung, bentuk awal muncul lagi di kedalaman (self-similarity), Benoit Mandelbrot 1980. Zoom terus-menerus, warna berdenyut mengikuti musik.

**Gerak (motion):** Transisi dan animasi mengikuti irama narasi per baris (`AM.cue`, `AM.wordTime`), dengan pergerakan kamera halus dan elemen visual khas gaya `psychedelic-shader`.

**Kenapa menarik:** Visual Psychedelic Shader memberikan atmosfer khas yang langsung menghentikan scroll pada detik pertama.

**Cerita yang cocok:**
- Satu Rumus, Gambar Tanpa Akhir: "Rumus sependek ini... menyimpan gambar yang tidak akan pernah habis, sedalam apa pun kamu zoom."

**Rumus hook:** "Rumus sependek ini... menyimpan gambar yang tidak akan pernah habis, sedalam apa pun kamu zoom."

**Kit API (`styles/psychedelic-shader/kit.js`):**
- Exports: `PAL`, `bg`, `title`, `label`, `blob`, `ring`, `card`.

**Demo:** "Satu Rumus, Gambar Tanpa Akhir" — voice `id-f`, musik `ambient`. Hook: "Rumus sependek ini... menyimpan gambar yang tidak akan pernah habis, sedalam apa pun kamu zoom."
