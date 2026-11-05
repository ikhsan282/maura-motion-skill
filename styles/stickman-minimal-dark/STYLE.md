---
id: stickman-minimal-dark
name: Stickman Minimal Dark
no: 76
source: custom:stickman-minimal-dark-kit
family: stickman
tech: canvas2d
music: lofi   voice: el-id-m   captions: clean
best_for: overthinking malam hari, regulasi emosi, kesehatan mental, lingkar kendali stoik, brain dump
---
# Stickman Minimal Dark

**Ciri khas (look):** Kanvas hitam pekat OLED (`#040407`) dengan garis putih kontras tinggi (`#ffffff`) dan satu warna aksen tajam per fase (**Merah Alarm `#ff3b30`** saat pikiran kusut vs **Biru Kejernihan `#38bdf8`** saat pikiran tenang). Karakter unik **Si Hening Jubah Geometri & Lentera Pikiran (`minimalDarkStickman`)** tampil mengenakan **jubah ponco geometris hitam-putih** dengan **inti berlian bercahaya di dada**, membawa **bola lentera melayang** di tangan kanan, serta mahkota visual di atas kepala yang berubah dari **benang kusut merah (*overthinking*)** menjadi **cincin orbit biru jernih (*clarity*)**.

**Gerak (motion):** Transisi 4 babak detoks pikiran dari benang kusut merah menuju orbit biru yang tenang, ditemani diagram kontras tinggi (`minimalDarkDiagram`) dan kartu OLED di paruh bawah layar.

**Kenapa menarik:** Kontras ekstrem hitam-putih dengan satu warna aksen langsung memusatkan perhatian mata tanpa gangguan visual — sangat cocok untuk renungan psikologi dan kejernihan mental di malam hari.

**Cerita yang cocok:**
- Prokrastinasi adalah masalah regulasi emosi, bukan kemalasan (riset Prof. Tim Pychyl)
- Menghentikan *Overthinking* pukul 2 pagi dengan teknik *Brain Dump* (menuang isi kepala ke kertas)
- Dikotomi Kendali Stoik (*Circle of Control* vs *Circle of Worry*)

**Kit API (`styles/stickman-minimal-dark/kit.js`):**
- `PAL` — palet OLED hitam pekat (`black`), garis putih tajam (`white`), merah alarm (`red`), dan biru jernih (`blue`)
- `minimalDarkBg(ctx, t, opts)` — latar hitam pekat dengan *crosshair* arsitektural & bingkai monoline
- `minimalDarkHeader(ctx, badgeText, title, subtitle, opts)` — header minimalis kontras tinggi
- `minimalDarkStickman(ctx, x, floorY, state, opts)` — karakter unik Si Hening Lentera (`'overthink'` vs `'clarity'`)
- `minimalDarkDiagram(ctx, floorY, badge, mainText, subText, opts)` — kotak diagram sudut siku di sisi kanan
- `minimalDarkBubble(ctx, x, y, text, opts)` — balon ucapan monoline hitam-putih
- `minimalDarkCard(ctx, cx, cy, w, h, opts)` — kartu OLED kontras tinggi

**Demos:**
1. `demo1` — *Kamu Bukan Pemalas, Kamu Sedang Menghindari Rasa Cemas — Sains Regulasi Emosi* (~64 dtk)
2. `demo2` — *Menghentikan Overthinking Pukul Dua Pagi — Teknik Brain Dump & Jarak Kognitif* (~64 dtk)
3. `demo3` — *Lingkaran Kendali Stoik — Mengapa Melepaskan Hal di Luar Kendalimu Mengembalikan Kedamaian?* (~65 dtk)
