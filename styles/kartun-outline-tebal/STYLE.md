---
id: kartun-outline-tebal
name: Kartun Outline Tebal
no: 40
source: github:thick-outline-cartoon + bold-outline-cartoon
family: 2D
tech: canvas2d
music: playful   voice: el-id-m   captions: comic
best_for: komedi relatable, benda yang hidup (HP, dapur, kantor), tips singkat, maskot brand, edukasi anak
---
# Kartun Outline Tebal

**Ciri khas (look):** garis tinta tebal #1a1033, warna datar jenuh (kuning #ffd23f, oranye #ff6a2a, biru #2f5bff, hijau #2fd96b, ungu #8b5cff, pink #ff5fa2) dengan SATU bayangan cel keras di kanan-bawah, border stiker putih die-cut, mata besar dengan dua kilau. Latar sunburst berputar + titik halftone, lantai warna solid. Teks Luckiest Guy di stiker miring dengan bayangan.

**Gerak (motion):** semua tokoh bernapas, lompat dengan squash & stretch dan overshoot, stiker "menampar" masuk, garis kecepatan, awan perkelahian kartun (tangan & bintang keluar), petir pengisian, flash putih di setiap potongan.

**Kit API (`styles/kartun-outline-tebal/kit.js`):**
- `char(ctx, kind, x, y, s, {t, mood, open, smile, look, blink, hop, sq, lean, face, armL, armR, walk, sweat, level, flash, badge, cape})` — kind: `baterai`, `kamera`, `chat`, `game`, `peta`, `musik`, `charger`.
- `cel(g, path, col, {border, shade})` gaya stiker; `eyes(mood: normal|tired|angry|x|happy|star|worried)`, `mouth`, `limb`.
- Latar: `sunburst`, `dots`, `floor`.
- Teks & efek: `textSticker`, `burst('KLIK!')`, `percent`, `fightCloud`, `speed`, `zap`, `ICONS.sun/leaf`.

## Paket Demo (30–90 Detik)
1. **`demo1/` — *Perang Aplikasi di Baterai 1 Persen — Drama di Dalam Layar Ponselmu*** (~62 dtk, 6 babak): Pertarungan Kamera, Chat (300 pesan), dan Game saat baterai tersisa 1%, layar meredup pingsan, hingga penyelamatan pahlawan Charger (`1% → 100%`).
2. **`demo2/` — *Drama Alarm Jam Enam Pagi vs Tombol Snooze — Kenapa Tidur Lima Menit Lagi Justru Bikin Pusing?*** (~64 dtk, 6 babak): Pertarungan alarm pukul 06:00 melawan tombol *Snooze* ("5 menit lagi"), jebakan siklus tidur baru yang memicu *sleep inertia* (inersia tidur), hingga panik kesiangan pukul 07:15.
3. **`demo3/` — *Rapat Tengah Malam Penghuni HP-mu — Siapa yang Paling Boros Kuota dan Memori?*** (~64 dtk, 6 babak): Rapat darurat jam 2 pagi saat memori penuh 99% — Kamera menimbun 4.000 foto buram, Chat mengunduh video grup otomatis, Game & Peta mengunduh update 5 GB, serta solusi membersihkan *cache*.
