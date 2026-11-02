---
id: stickman-graffiti
name: Stickman Graffiti
no: 74
source: custom:stickman-doodle-kit
family: stickman
tech: canvas2d
music: lofi   voice: el-id-m   captions: hand
best_for: motivasi kreator, keberanian mulai, gagal vs karya, personal branding jalanan
---
# Stickman Graffiti

**Ciri khas (look):** tembok gelap (#101014) + coretan neon graffiti pink (#ff2fb3) dan cyan (#22e6ff).
Stickman putih ber-beanie pink, bubble kata "FOKUS! / MULAI! / GAS! / BISA! / MENANG!" font Permanent Marker,
boil 1.7 + vignette.

**Gerak (motion):** kamera scroll vertikal 5 panel (PY 700→5700), ease inOutCubic 0.55s per pindah;
stickman ganti pose + ekspresi per baris (shock → worried → happy → grin), bubble pop outBack.

**Kenapa menarik:** energi jalanan yang berani — neon di tembok gelap langsung kebaca di feed.
Kata bubble satu kata per panel bikin ritme cepat.

**Cerita yang cocok:**
- Coretan Pertama: "Tembok ini saksi mimpimu!"
- Gagal vs Karya: "Jangan hapus gagalmu, timpa dengan karya."
- Konsistensi kreator: "Gas terus sampai kota hafal namamu."

**Rumus hook:** "Tembok ini saksi [mimpimu]!" / "Jangan hapus [gagalmu], timpa dengan [karya]."

**Kit API (`styles/stickman-graffiti/kit.js`):**
- `stickDraw(ctx, pose, t, { reveal })`: stickman boil (pose: x, y, s, face, look, arms, legs, blink).
- `bubble(ctx, x, y, w, h, tx, ty, text, { a, size, font, textCol, fill, col })`: bubble kata pop.
- `notebook(ctx)`, `mline(ctx, pts, { w, col, seed, alpha })`: bg + coretan neon.
- `cam(ctx, x, y, z)`, `viewRect(ctx, n)`, `setBoil(t, amp, freq)`.
- Props: `brainGuy`, `cloud`, `sweat`, `marker`/`markerFor`, `drawWriting`, `drawErase`, `pointAt`, `motion`, `mtext`.

**Demo:** "Demo stickman-graffiti" — 5 baris, voice el-id-m (ElevenLabs George), musik lofi, 11.9s.
