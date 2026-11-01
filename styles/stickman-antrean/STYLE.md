---
id: stickman-antrean
name: Stickman Antrean
no: 68
source: custom:garis-hidup-antrean
family: social
tech: canvas2d
music: lofi   voice: el-id-m   captions: clean
best_for: etika antre, menegur penyerobot, empati sosial, konten moral 1 menit
---
# Stickman Antrean

**Ciri khas (look):** aula loket malam (#10171E→#1C2833), garis plafon + 2 papan gantung
(LOKET biru kiri, ⬅ ANTREAN krem tengah), loket abu + bel, strip lantai kuning nyala
(meredup saat diserobot, pulih setelah tertib), watermark GARIS HIDUP, bubble "BENTAR DOANG"/
"BURU-BURU", judul moral "Antre itu bukan soal waktu. Soal menghargai."

**Gerak (motion):** `waitQueue` (goyang santai) vs `cutQueueExcuse` (angguk + tangan menyepelekan)
vs `reprimandPoint` (tegur + tunjuk belakang) vs `walkShame` (tertunduk + garuk kepala)
vs `serveCounter` (petugas) vs `holdChildHand` (ibu gandeng anak).

**Kenapa menarik:** 7 karakter 1 frame (petugas, pelanggan, protagonis putih glow, ibu+anak,
2 penyerobot abu) — konflik kebaca tanpa dialog. Strip lantai = barometer ketertiban.

**Cerita yang cocok:**
- Menyerobot antrean: "Bentar doang" vs yang menunggu sejam.
- Berani menegur sopan.
- Menghargai waktu orang lain.

**Rumus hook:** "[X] nyerobot, [Y] berani menegur. Apa yang terjadi?" / "Antre itu bukan soal
waktu. Soal menghargai."

**Kit API (`styles/stickman-antrean/kit.js`):**
- `StickmanKit.createAntreanScene(kit, {})`: plafon, 2 papan, loket, strip, watermark,
  bubble, judul moral, 7 karakter + timeline 12,3 dtk. Header edisi Maura Motion.
- Motion antrean: `waitQueue`, `cutQueueExcuse`, `reprimandPoint`, `walkShame`,
  `serveCounter`, `holdChildHand` (+ 44 motion dasar: basic/emosi/aksi/interaksi/Fajr).
- Props: `loketCounter`, `hangingSign` (text/leftArrow), `queueFloorStrip` (activeRatio),
  `speechBubble`, `highlightedTitle` (progress).
- Style `garishidup/capsule`: torso 1,65x + kepala gradient radial + glow.
- `ponytail:` offsetY warisan 54 → 10 (8 titik sleep/wakeUp/fall/getUp/sujud); di scene
  antrean tak terpakai (semua berdiri), disamakan pola presisi kasur stickman-subuh.

**Demo:** "Antrean", 5 baris ID, voice el-id-m (ElevenLabs George), musik lofi.
