---
id: stickman-kisah
name: Stickman Kisah
no: 68
source: custom:garis-hidup-antrean
family: social
tech: canvas2d
music: lofi   voice: el-id-m   captions: clean
best_for: konflik moral sehari-hari, utang, empati sosial, konten 1 menit
---
# Stickman Kisah

**Ciri khas (look):** format cerita moral 1 menit — papan judul gantung, props sesuai
episode (meja + amplop, mobil + marka, loket + strip), bubble dialog, judul moral
di ujung. Background gelap sinematik, 1 karakter glow sebagai suara hati.

**Gerak (motion):** rangkaian pendek 2-3 dtk bervariasi (jalan, bicara, tengok, tunjuk,
marah, lari, senang) — sekali jalan 60 dtk ngikutin naskah, anti-looping.
Karakter: `waitQueue`, `talk`, `lookAround`, `reprimandPoint`, `angry`, `point`,
`walk`, `run`, `surprised`, `sad`, `sit`, `happy`, `wave`, `clap` (+ 44 motion dasar).

**Kenapa menarik:** konflik universal (utang, senggolan, antrean) — kebaca tanpa
dialog. 1 karakter glow = pembeda protagonis. Moral muncul sebagai judul di klimaks.

**Cerita yang cocok:**
- Utang vs janji: pinjam manis, ditagih ngilang.
- Senggolan parkir: berani tanggung jawab vs kabur.
- Antrean: menegur penyerobot dengan sopan.

**Rumus hook:** "[X] manis di awal, [Y] pahit di akhir. Apa yang terjadi?" / moral
1 kalimat: "Utang bukan soal uang, soal hormat."

**Kit API (`styles/stickman-kisah/kit.js`):**
- `StickmanKit.createAntreanScene(kit, { theme })`: `utang` | `parkir` | default antrean.
  Header edisi Maura Motion.
- Builder: `_buildUtangScene` (meja + amplop + papan UTANG, 2 karakter, 60 dtk),
  `_buildParkirScene` (4 mobil + marka + papan PARKIR, 4 karakter, 62 dtk).
- Props: `mobil`, `motor`, `amplop`, `meja`, `markaParkir`, `loketCounter`,
  `hangingSign`, `queueFloorStrip`, `speechBubble`, `highlightedTitle`.
- Style `garishidup/capsule`: torso 1,65x + kepala gradient radial + glow.
- `ponytail:` offsetY warisan 54 → 10 (8 titik sleep/wakeUp/fall/getUp/sujud),
  disamakan pola presisi kasur stickman-subuh.

**Demo:** "Kisah Utang", 8 baris ID, voice el-id-m (ElevenLabs George), musik lofi, 60 dtk.
