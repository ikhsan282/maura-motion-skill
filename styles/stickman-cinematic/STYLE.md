---
id: stickman-cinematic
name: Stickman Cinematic
no: 72
source: custom:stickman-duel-kit
family: craft
tech: canvas2d
music: lofi   voice: el-id-m   captions: hand
best_for: motivasi malam hari, mimpi vs lelah
---
# Stickman Cinematic

**Ciri khas (look):** sunset sinematik: gradien ungu→magenta→oranye, matahari radial glow, siluet stickman jas panjang + rim light biru. Bubble gelap teks oranye. Letterbox dramatis.

**Gerak (motion):** kamera geser 5 pose; glow matahari statis, siluet reveal per panel, bubble pop; rim light menyala di sisi badan.

**Kenapa menarik:** satu-satunya stickman yang sinematik: sunset + siluet + rim light bikin motivasi terasa film, bukan kartun.

**Cerita yang cocok:**
- motivasi malam hari, mimpi vs lelah, fokus satu hal, grind culture sehat, glow-up

**Rumus hook:** "[Dunia] tidur, tapi [mimpimu] belum selesai." / "Semua orang [lelah], yang menang yang tetap [jalan]."

**Kit API (`styles/stickman-cinematic/kit.js`):**
- stickDraw (siluet jas + rim light), bubble (fill gelap), sunset gradient + radial glow, cam
- Props: `PAL`, `Sketch`, `Pen`, `stick`, `stickDraw`, `bubble`, `notebook`, `viewRect`, `cam`, `mline`, `mtext`.

**Demo:** "Kota Tidur, Mimpi Belum Selesai" — 5 baris, voice el-id-m (ElevenLabs George), musik lofi. Hook: "Kota tidur, tapi mimpimu belum selesai."
