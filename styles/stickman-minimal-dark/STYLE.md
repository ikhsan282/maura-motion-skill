---
id: stickman-minimal-dark
name: Stickman Minimal Dark
no: 76
source: custom:stickman-doodle-kit
family: stickman
tech: canvas2d
music: lofi   voice: el-id-m   captions: hand
best_for: prokrastinasi, overthinking, kesehatan mental, self-improvement malam hari
---
# Stickman Minimal Dark

**Ciri khas (look):** hitam pekat (#000000), tinta putih, aksen merah alarm (#e0412f) + biru timer (#2f6fd6).
Panel doodle: "PEMALAS?" dicoret merah, lembar TUGAS, alarm amigdala "KABUR!", awan bersalah hujan,
timer 5 menit biru, batu TUGAS menyusut jadi kerikil. Semua boil.

**Gerak (motion):** kamera scroll vertikal 5 panel (PY 700→5700); Sketch digambar progresif mengikuti
word-timing (speed 2600–3400, seed per panel); stickman-beanie mendorong batu yang mengecil;
9 sfx (pencil, alarm, hujan, timer).

**Kenapa menarik:** hitam-putih + satu aksen warna per panel = fokus penuh ke pesan.
Narasi "kamu bukan pemalas" memvalidasi penonton sebelum memberi solusi 5 menit.

**Cerita yang cocok:**
- Kenapa Menunda: "Kamu bukan pemalas. Otakmu cuma kabur dari rasa tidak enak."
- Amigdala vs Tugas: "Amigdala teriak: kabur!"
- Trik 5 Menit: "Jangan tunggu mood. Bilang, lima menit aja."

**Rumus hook:** "Kamu bukan [label negatif]. [Organ/sistem]mu cuma [mekanisme]." / "Lawanmu cuma [waktu singkat]."

**Kit API (`styles/stickman-minimal-dark/kit.js`):**
- `Sketch`: `text()`, `line()`, `at()` — gambar progresif sinkron word-timing (`t0`, `speed`, `seed`, `gap`).
- `Pen().sketch(d)`: eksekutor sketch; `G.rect()`: geometri bantu.
- `stickDraw(ctx, pose, t, { reveal })`, `bubble(...)`, `brainGuy`, `cloud`, `sweat`.
- `cam(ctx, x, y, z)`, `viewRect(ctx, n)`, `setBoil(t, amp, freq)`, `marker`, `drawWriting`, `pointAt`, `motion`.

**Demo:** "Demo stickman-minimal-dark" — 5 baris (prokrastinasi/amigdala), voice el-id-m
(ElevenLabs George), musik lofi, 18.2s.
