---
id: clay-stop-motion
name: Clay Stop Motion
no: 5
source: drive:05_Clay_Stop_Motion + github:clay-toy-diorama + github:claymation-soft-3d
family: 3D
tech: three
music: playful   voice: el-id-m   captions: kids
best_for: Claymation (plastisin) dengan gerak on-twos, sidik jari dan permukaan lumpy, diorama mungil tilt-shift: Timun Mas & Buto Ijo, Sangkuriang & Perahu Terbalik, Bawang Putih & Labu Emas
---
# Clay Stop Motion

**Ciri khas (look):** Claymation (plastisin) dengan gerak on-twos, sidik jari dan permukaan lumpy, diorama mungil tilt-shift di atas meja kayu: karakter dari gulungan plastisin, latar kertas bergambar, squash-and-stretch, dan sedikit jitter seperti stop motion.

**Gerak (motion):** Transisi dan animasi mengikuti irama narasi per baris (`AM.cue`, `AM.wordTime`), dengan pergerakan kamera halus dan elemen visual khas gaya `clay-stop-motion` (`meta = { fps: 24, hold: 2 }`).

**Kenapa menarik:** Visual Clay Stop Motion memberikan atmosfer taktil dan hangat yang langsung menghentikan scroll pada detik pertama.

**Cerita yang cocok:**
- Timun Mas & Buto Ijo (`demo1/`): "Raksasa hijau ini menagih janji: Timun Mas harus diserahkan!"
- Sangkuriang & Perahu Terbalik (`demo2/`): "Pernahkah kamu melihat gunung yang bentuknya persis seperti perahu kayu yang terbalik?"
- Bawang Putih & Labu Emas (`demo3/`): "Di sebuah desa tanah liat yang tenang, sebutir labu kecil tiba-tiba memancarkan kilau emas saat dibelah!"

**Rumus hook:** "Seorang raksasa hijau menagih janji: anak gadis itu harus diserahkan padanya."

**Kit API (`styles/clay-stop-motion/kit.js`):**
- Exports: `PAL`, `stage`, `shootCam`, `drift`, `toScreen`, `setRim`, `fingerprintTex`, `toon`, `clay`, `basic`, `outline`, `outlineMat`, `canvasTex`, `radialTex`, `batikTex`, `plankTex`, `bilikTex`, `skyDome`, `setSky`, `mix`, `lights`, `terrain`, `tree`, `sway`, `blobShadow`, `water`, `character`, `pose`, `walk`, `blinkAt`, `idle`, `talk`, `jin`, `jinTick`, `rooster`, `roosterPose`, `boat`, `house`, `centong`, `heart`, `rock`, `cloth`, `burst`, `glow`, `title`, `nameplate`, `pointer`, `finish`, `dizzy`, `rings`, `use`, `lumpify`, `jit`, `backdrop`, `tiltShift`, `studio`, `giant`.

**Demo:**
- `demo1/` — "Timun Mas & Buto Ijo" (6 shots, ~15s) — voice `el-id-m` (George, ElevenLabs), musik `playful`.
- `demo2/` — "Sangkuriang & Perahu Terbalik" (10 shots, ~50–60s) — voice `el-id-m` (George, ElevenLabs), musik `playful`.
- `demo3/` — "Bawang Putih & Labu Emas" (10 shots, ~50–60s) — voice `el-id-m` (George, ElevenLabs), musik `playful`.
