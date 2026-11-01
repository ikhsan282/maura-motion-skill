---
id: kartun-outline-tebal
name: Kartun Outline Tebal
no: 40
source: github:thick-outline-cartoon + bold-outline-cartoon
family: 2D
tech: canvas2d
music: playful   voice: id-m   captions: comic
best_for: komedi relatable, benda yang hidup (HP, dapur, kantor), tips singkat, maskot brand, edukasi anak
---
# Kartun Outline Tebal

**Ciri khas (look):** garis tinta tebal #1a1033, warna datar jenuh (kuning #ffd23f, oranye #ff6a2a, biru #2f5bff,
hijau #2fd96b, ungu #8b5cff, pink #ff5fa2) dengan SATU bayangan cel keras di kanan-bawah, border stiker putih die-cut,
mata besar dengan dua kilau. Latar sunburst berputar + titik halftone, lantai warna solid. Teks Luckiest Guy di stiker
miring dengan bayangan.

**Gerak (motion):** semua tokoh bernapas, lompat dengan squash & stretch dan overshoot, stiker "menampar" masuk,
garis kecepatan, awan perkelahian kartun (tangan & bintang keluar), petir pengisian, flash putih di setiap potongan.

**Kenapa menarik:** lucu, mudah dibaca di layar kecil, warnanya menghentikan scroll, dan cocok untuk meme serta
maskot.

**Cerita yang cocok:**
- Perang aplikasi di baterai 1%: "Baterai HP-ku satu persen, dan aplikasiku mulai perang."
- Isi kulkas tengah malam: "Jam dua pagi, kulkasku mengadakan rapat."
- Cookie browser: "Aku sudah mengikutimu sejak Selasa."
- Alarm vs tombol tunda: "Setiap pagi, mereka berkelahi lima kali."
- Sendok dan garpu: "Siapa yang sebenarnya paling berjasa?"

**Rumus hook:** "Saat [kondisi kritis], [benda-benda]ku mulai [konflik]." / "Jam [x], [benda] di rumahku [melakukan hal
aneh]." / "[Benda] ini punya satu keluhan: [X]."

**Kit API (`styles/kartun-outline-tebal/kit.js`):**
- `char(ctx, kind, x, y, s, {t, mood, open, smile, look, blink, hop, sq, lean, face, armL, armR, walk, sweat, level, flash, badge, cape})` — kind: `baterai`, `kamera`, `chat`, `game`, `peta`, `musik`, `charger` (tambah bentuk baru di `BODIES`).
- `cel(g, path, col, {border, shade})` gaya stiker; `eyes(mood: normal|tired|angry|x|happy|star|worried)`, `mouth`, `limb`.
- Latar: `sunburst`, `dots`, `floor`.
- Teks & efek: `textSticker`, `burst('KLIK!')`, `percent`, `fightCloud`, `speed`, `zap`, `ICONS.sun/leaf`.

**Demo:** "Perang Aplikasi di Baterai 1 Persen", 19,6 dtk, 6 shot. "1%" menampar layar, Pak Baterai megap-megap,
aplikasi bermunculan lalu awan perkelahian → Kamera flash "SATU FOTO LAGI!", Chat menyerbu dengan lencana 0→300 →
Game memohon "1 RONDE LAGI..." → layar meredup, baterai pingsan → "KLIK!" Charger berjubah datang, petir, 1%→100% →
stiker tips (redupkan layar, mode hemat daya) dan Game masih berbisik "psst... 1 ronde lagi".
