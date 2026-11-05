---
id: kurzgesagt-flat
name: Kurzgesagt Flat Motion
no: 79
source: custom:kurzgesagt-science
family: 2D
tech: canvas2d
music: ambient
voice: el-id-m
captions: clean
best_for: sains populer mendalam, astronomi & astrofisika, biologi sel & neurologi, evolusi manusia, paradoks psikologi, eksistensialisme positif
---

# Kurzgesagt Flat Motion (`styles/kurzgesagt-flat`)

Gaya **Kurzgesagt Flat Motion (No. 79)** menghadirkan estetika visual khas studio animasi sains dunia **Kurzgesagt – In a Nutshell**. Menggabungkan warna-warna datar (*flat vector*) kontras tinggi yang hidup, ruang angkasa kosmik pekat bergradasi radial, diagram sains presisi, serta karakter legendaris **"Si Bebek Ilmuwan Kurzgesagt (`kurzgesagtDuck`)"**.

## Ciri Khas Visual
1. **Karakter Si Bebek Ilmuwan (`kurzgesagtDuck`)**:
   - Kepala bulat kuning hangat (`#ffc837`) dengan jambul bulu belakang khas, paruh oranye melengkung ramah, dan mata ekspresif (curious bersinar putih, drowsy mengantuk, atau tidur bertopi malam).
   - Badan gemuk berbentuk buah pir dengan jas laboratorium toska ilmuwan (`#06b6d4`), kerah putih, saku pena merah, serta sayap yang dapat menunjuk (`pointing`) atau merayakan penemuan (`celebrate`).
2. **Panggung Kosmik & Laboratorium Berteknologi Tinggi**:
   - Latar belakang gradasi radial kosmik pekat (`#16123d` -> `#0c0a24` -> `#080718`), taburan bintang geometris berkedip, cincin orbit elips halus, dan platform pod laboratorium beriluminasi neon.
3. **Standar Full-Screen 8-Adegan**:
   - Resolusi vertikal penuh 1080x1920 tanpa panel kotak bawah yang terputus.
   - Header kapsul frosted kaca di bagian atas (`y: 50`, `h: 145`).
   - Kartu edukasi sains mengambang (*Floating Scientific Callout*) di `y: 1485` (`h: 165`).
   - *Safe-zone* takarir (*captions*) di bagian bawah (`y: 1700`).

## Komponen Utama `kit.js`
- `PAL`: Palet warna resmi Kurzgesagt (Cyan `#00f2fe`, Teal `#4facfe`, Yellow `#ffe600`, Orange `#ff9234`, Coral `#ff4b72`, Purple `#8b5cf6`, Backgrounds `#0c0a24` / `#16123d`).
- `withCamera(ctx, { zoom, panX, panY, fx, fy }, fn)`: Kamera sinematik dinamis untuk transisi zoom dan penekanan objek sains.
- `kurzgesagtBg(ctx, t, { col })`: Latar kosmik bintang dinamis dan cincin orbital.
- `kurzgesagtHeader(ctx, badge, title, subtitle, { col })`: Banner header atas frosted kaca bertepi neon.
- `kurzgesagtPodPlatform(ctx, x, floorY, { col, rx, ry })`: Panggung observasi laboratorium pod elips.
- `kurzgesagtDuck(ctx, x, y, { scale, facing, pose, coat, t })`: Karakter bebek ilmuwan animasi hidup dengan aneka pose.
- `kurzgesagtCallout(ctx, cx, cy, w, h, { tag, title, desc, stat, statSub, col, a })`: Kartu data sains melayang di `y: 1485`.
- `kurzgesagtBubble(ctx, x, y, text, { tailX, tailY, col })`: Balon dialog penjelasan sains.

## 3 Demo Produksi (Voice `el-id-m`, Musik `ambient`)
1. **`demo1`**: *Sistem Pembersih Sampah Otak — Mengapa Kurang Tidur Menumpuk Racun Biologis?* (Sistem Gliatik, protein beta-amiloid, penyusutan sel 60%, dan pembilasan cairan serebrospinal).
2. **`demo2`**: *Skala Waktu Kosmik — Mengapa Peradaban Manusia Hanyalah Kedipan Mata di Alam Semesta?* (Kalender Kosmik 13.8 Miliar Tahun, Big Bang 1 Januari, Dinosaurus 26 Des, dan 14 Detik Terakhir Peradaban).
3. **`demo3`**: *Paradoks Kesepian — Mengapa Otak Prasejarah Membenci Isolasi Sosial?* (Biologi evolusi savana Pleistosen, sirkuit nyeri dACC, hormon kortisol, bahaya layar ponsel modern, dan pemulihan koneksi klan).

