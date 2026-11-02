---
id: stickman-picturebook
name: Stickman Picturebook
no: 77
source: custom:stickman-doodle-kit
family: stickman
tech: canvas2d
music: lofi   voice: el-id-m   captions: hand
best_for: cerita anak-dewasa, dongeng motivasi, konten hangat, bedtime wisdom
---
# Stickman Picturebook

**Ciri khas (look):** kertas krem hangat (#fdf3d8), tinta cokelat (#5b4a3a), aksen merah (#e0412f) +
biru (#2f6fd6) + kuning (#f6d24a). Panel doodle sama seperti minimal-dark tapi di atas kertas:
"PEMALAS?" dicoret, lembar TUGAS, alarm "KABUR!", awan hujan, timer biru, batu menyusut. Boil halus.

**Gerak (motion):** kamera scroll vertikal 5 panel (PY 700→5700); Sketch digambar progresif mengikuti
word-timing (speed 2600–3400, seed per panel); stickman-beanie mendorong batu yang mengecil;
9 sfx (pencil, alarm, hujan, timer).

**Kenapa menarik:** rasa buku cerita yang hangat dan aman — topik berat (prokrastinasi, rasa bersalah)
jadi mudah dicerna semua umur. Kertas krem juga ramah mata di layar malam.

**Cerita yang cocok:**
- Kenapa Menunda: "Kamu bukan pemalas. Otakmu cuma kabur dari rasa tidak enak."
- Dongeng 5 Menit: "Triknya: jangan tunggu mood. Bilang, lima menit aja."
- Batu Jadi Kerikil: "Begitu mulai, beratnya mengecil."

**Rumus hook:** "Kamu bukan [label negatif]. [Alasan hangat]." / "[Beban besar] menyusut jadi [kecil] begitu mulai."

**Kit API (`styles/stickman-picturebook/kit.js`):**
- `Sketch`: `text()`, `line()`, `at()` — gambar progresif sinkron word-timing (`t0`, `speed`, `seed`, `gap`).
- `Pen().sketch(d)`: eksekutor sketch; `G.rect()`: geometri bantu.
- `stickDraw(ctx, pose, t, { reveal })`, `bubble(...)`, `brainGuy`, `cloud`, `sweat`.
- `cam(ctx, x, y, z)`, `viewRect(ctx, n)`, `setBoil(t, amp, freq)`, `marker`, `drawWriting`, `pointAt`, `motion`.

**Demo:** "Demo stickman-picturebook" — 5 baris (prokrastinasi/amigdala), voice el-id-m
(ElevenLabs George), musik lofi, 18.1s.
