---
id: stickman-lecture
name: Stickman Lecture
no: 75
source: custom:stickman-doodle-kit
family: stickman
tech: canvas2d
music: lofi   voice: el-id-m   captions: hand
best_for: edukasi ringan, penjelasan konsep, tips produktivitas, konten guru/mentor
---
# Stickman Lecture

**Ciri khas (look):** papan tulis hijau (#1e4d3b) bingkai kuning kapur (#f6d24a), garis kapur putih transparan.
Stickman putih ber-beanie kuning, bubble kata "FOKUS! / MULAI! / GAS! / BISA! / MENANG!" font Permanent Marker,
boil 1.7 + vignette.

**Gerak (motion):** kamera scroll vertikal 5 panel (PY 700→5700), ease inOutCubic 0.55s per pindah;
stickman ganti pose + ekspresi per baris (shock → worried → happy → grin), bubble pop outBack.

**Kenapa menarik:** nuansa kelas yang akrab — papan tulis hijau langsung memberi otoritas guru
tanpa terasa menggurui. Ritme satu kata per panel cocok untuk tips singkat.

**Cerita yang cocok:**
- Atensi Kelas: "Anak-anak, perhatian ke papan tulis!"
- Avoidance: "Otak kabur itu wajar, namanya avoidance."
- Mulai 5 Menit: "Solusinya: mulai lima menit saja."

**Rumus hook:** "[Sapaan kelas], perhatian ke [topik]!" / "[Gejala] itu wajar, namanya [istilah]."

**Kit API (`styles/stickman-lecture/kit.js`):**
- `stickDraw(ctx, pose, t, { reveal })`: stickman boil (pose: x, y, s, face, look, arms, legs, blink).
- `bubble(ctx, x, y, w, h, tx, ty, text, { a, size, font, textCol, fill, col })`: bubble kata pop.
- `notebook(ctx)`, `mline(ctx, pts, { w, col, seed, alpha })`: bg papan + garis kapur.
- `cam(ctx, x, y, z)`, `viewRect(ctx, n)`, `setBoil(t, amp, freq)`.
- Props: `brainGuy`, `cloud`, `sweat`, `marker`/`markerFor`, `drawWriting`, `drawErase`, `pointAt`, `motion`, `mtext`.

**Demo:** "Demo stickman-lecture" — 5 baris, voice el-id-m (ElevenLabs George), musik lofi, 13.4s.
