---
id: stickman-duo
name: Stickman Duo
no: 73
source: custom:stickman-duel-kit
family: craft
tech: canvas2d
music: lofi   voice: el-id-m   captions: hand
best_for: akuntabilitas & teman seperjuangan, lawan mager bareng
---
# Stickman Duo

**Ciri khas (look):** studio putih: DUA stickman berdampingan — A topi merah, B kacamata biru + kaos biru. Dialog A/B per panel dalam bubble, pose akur di panel akhir (gas bareng).

**Gerak (motion):** kamera geser 5 panel dialog; dua stickDraw per panel (cap + shades offset x+330), bubble bergantian A/B, pop outBack.

**Kenapa menarik:** format dialog dua orang = energi buddy-comedy; penonton ikut salah satu peran; panel akhir akur = ajakan kolaborasi.

**Cerita yang cocok:**
- akuntabilitas & teman seperjuangan, lawan mager bareng, diskusi A/B, motivasi komunitas

**Rumus hook:** "A: [keluhan]? B: [validasi]." / "A: [trik]. B: [hasil]." → "[Ajak akur]."

**Kit API (`styles/stickman-duo/kit.js`):**
- stickDraw role cap (topi) + role shades (kacamata, offset), bubble dialog A/B, cam
- Props: `PAL`, `Sketch`, `Pen`, `stick`, `stickDraw`, `bubble`, `notebook`, `viewRect`, `cam`, `mline`, `mtext`.

**Demo:** "Gas Bareng, Jangan Mager" — 5 baris, voice el-id-m (ElevenLabs George), musik lofi. Hook: "A: Mager lagi? B: Iya, parah."
