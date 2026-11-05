---
id: synthwave-neon
name: Cyberpunk Retro Synthwave
no: 82
source: custom:synthwave-cyberpunk
family: Retro Digital
tech: canvas2d
music: synthwave
voice: el-id-m
captions: neon
best_for: keamanan siber, sains komputer & AI, psikologi algoritma layar kaca, teknologi masa depan, sejarah revolusi digital
---

# Cyberpunk Retro Synthwave (`styles/synthwave-neon`)

Gaya **Cyberpunk Retro Synthwave (No. 82)** menghadirkan estetika siber futuristik bernuansa retro 80-an (*outrun / cyberpunk synthwave*). Menggabungkan grid lantai neon 3D berkecepatan tinggi, matahari bergaris retro di cakrawala, pegunungan kawat *wireframe*, diagram hologram HUD interaktif, serta karakter siber berhelm visor bercahaya.

## Ciri Khas Visual
1. **Lantai Grid Perspektif Neon Berkecepatan Tinggi (`synthwaveBg`)**:
   - Kisi-kisi neon cyan melaju cepat ke arah kamera dengan kompresi perspektif eksponensial di atas cakrawala ungu-magenta gelap.
2. **Matahari Bergaris 80-an & Pegunungan Wireframe**:
   - Matahari gradasi kuning-oranye-magenta bergaris potong horizontal yang bergerak naik (*animated blind slats*), diapit siluet pegunungan digital bergaris kawat.
3. **Reticle & HUD Holografis Interaktif (`cyberReticle`)**:
   - Lingkaran bidik sains siber dengan cincin berputar ganda, garis bidik (*crosshairs*), dan label status sistem.
4. **Karakter Avatar Siber (`cyberStickman`)**:
   - Figur stik berzirah siber dengan reaktor dada neon menyala, helm visor bergaris pulsa cahaya, serta aneka pose (*ready*, *hack*, *victory*).
5. **Standar Full-Screen 8-Adegan**:
   - Resolusi vertikal 1080x1920 tanpa panel kotak hitam bawah.
   - Header kapsul sudut miring bergaya HUD siber di bagian atas (`y: 50`, `h: 145`).
   - Kartu edukasi sains mengambang (*Floating Hologram Callout*) di `y: 1485` (`h: 165`).
   - *Safe-zone* takarir (*captions*) di bagian bawah (`y: 1700`).

## Komponen Utama `kit.js`
- `PAL`: Palet warna siber neon kontras tinggi (Cyan `#00f2fe`, Magenta `#ff007f`, Hot Pink `#ff2bd6`, Violet `#8b5cf6`, Yellow `#ffe600`, Slate Dark `#05010d`).
- `withCamera(ctx, { zoom, panX, panY, fx, fy }, fn)`: Kamera pan dan zoom sinematik siber.
- `synthwaveBg(ctx, t, { horizonY, gridSpeed, sunScale })`: Latar grid neon bergerak, matahari 80-an, pegunungan wireframe, dan overlay scanlines CRT.
- `synthwaveHeader(ctx, badge, title, subtitle, { col })`: Header HUD bersudut miring dengan kurung neon.
- `cyberReticle(ctx, cx, cy, r, { col, angle, label, t })`: Cincin hologram berputar dan bidik target.
- `cyberStickman(ctx, x, y, { pose, scale, facing, color, t })`: Avatar pejuang siber dengan helm visor bercahaya.
- `synthwaveCallout(ctx, cx, cy, w, h, { tag, title, desc, stat, statSub, col, a })`: Kartu data hologram melayang di `y: 1485`.

## 3 Demo Produksi (Voice `el-id-m`, Musik `synthwave`)
1. **`demo1`**: *Dopamin & Jebakan Algoritma — Cara Layar Kaca Membajak Otakmu* (Mekanisme mesin kasino, lonceng notifikasi Pavlov, lingkaran adiksi, dan detoks kognitif).
2. **`demo2`**: *Hukum Moore & Ledakan Komputasi — Dari Tabung Hampa ke Lompatan AI Super* (Kurva eksponensial silikon, miniaturisasi nano, batas atom 2nm, dan era kuantum).
3. **`demo3`**: *Revolusi Kriptografi & Privasi Digital — Perisai Matematika Penjaga Dunia Modern* (Kriptografi kunci publik RSA, analogi gembok terbuka, faktorisasi bilangan prima 2048-bit, dan benteng perbankan web).

