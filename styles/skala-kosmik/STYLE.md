---
id: skala-kosmik
name: Skala Kosmik
no: 53
source: github:cosmic-space + cinematic-science-scale
family: 3D
tech: canvas2d
music: ambient   voice: el-id-m   captions: clean
best_for: powers of ten, skala alam semesta (Monas ke jaring kosmik), skala mikroskopis/kuantum (sel ke kuark), kecepatan cahaya & jarak astronomi
---
# Skala Kosmik

**Ciri khas (look):** ruang angkasa gelap berlapis (`#030612` → `#0d1b3e`) dengan ratusan bintang multi-magnitudo, kabut nebula volumetrik cyan-ungu, serta bingkai kotak logaritmik *Powers of Ten* ($10^n\text{ m}$) yang menyusut kontinu ke titik tengah layar. Judul memakai serif elegan (`Noto Serif`) dipadukan telemetri *monospace* (`JetBrains Mono`) dan mistar logaritmik semesta ($10^{-15}\text{ m}$ hingga $10^{26}\text{ m}$).

**Gerak (motion):** *zoom out* atau *zoom in* logaritmik tanpa putus (*continuous logarithmic zoom*): setiap kali pangkat $10^n$ bertambah, kotak skala sebelumnya mengecil menjadi titik di pusat objek berikutnya (Monas → Bumi & Orbit Bulan → Tata Surya → Bima Sakti → Jaring Kosmik Laniakea, atau sebaliknya dari Daun → Sel → Heliks DNA → Atom Karbon → Kuark).

**Kenapa menarik:** memberikan sensasi *cosmic awe* (kekaguman kosmik) yang membuat penonton terpaku mengikuti seberapa jauh atau seberapa dalam kamera akan melaju.

**Cerita yang cocok:**
- Zoom Out dari Monas ke Ujung Alam Semesta ($10^2\text{ m} \to 10^{26}\text{ m}$).
- Zoom In ke Dalam Sehelai Daun: Dari Sel, Heliks DNA, Atom Karbon, hingga Kuark ($10^{-1}\text{ m} \to 10^{-15}\text{ m}$).
- Seberapa Cepat Cahaya Sebenarnya? Dari 7,5 Kali Keliling Bumi hingga 4 Tahun Menuju Bintang Terdekat.

**Rumus hook:** "Ini kamu, berdiri di [tempat akrab]. Sekarang lihat dirimu menghilang saat kita mundur 10 kali lipat setiap detik." / "Apa yang terlihat jika kita memperbesar [benda sehari-hari] satu triliun kali?"

**Kit API (`styles/skala-kosmik/kit.js`):**
- `PAL`, `pr(t, a, b)`, `drawDeepSpace(ctx, t, logM)`: latar bintang + nebula + kotak bersarang $10^k\text{ m}$.
- Panggung makro kosmik: `drawMonasStage`, `drawEarthStage`, `drawSolarSystemStage`, `drawGalaxyStage`, `drawCosmicWebStage`.
- Panggung mikro kuantum: `drawMicroStage(ctx, t, stageIdx, subP)` (Daun, Sel, Heliks DNA, Atom Karbon-12, Trio Kuark).
- HUD telemetri & mistar logaritmik: `drawScaleHUD(ctx, t, {exp, unitLabel, title, subtitle, stageTag})`.

**Demo (3 variasi, 63–65 detik, voice `el-id-m`):**
- **Demo 1 — "Zoom Out dari Monas ke Ujung Alam Semesta — Perjalanan 10 Pangkat 26 Meter"** (`demo1/`, ~63 dtk): Zoom out logaritmik dari puncak Monas ($10^2\text{ m}$) → Nusantara & Bumi ($10^7\text{ m}$) → Orbit Bulan & Tata Surya ($10^{13}\text{ m}$) → Galaksi Bima Sakti ($10^{21}\text{ m}$) → Jaring Kosmik Laniakea ($10^{26}\text{ m}$).
- **Demo 2 — "Zoom In ke Dalam Sehelai Daun — Dari Sel, Heliks DNA, hingga Kuark"** (`demo2/`, ~64 dtk): Zoom in dari permukaan daun hijau ($10^{-1}\text{ m}$) → dinding sel & kloroplas ($10^{-5}\text{ m}$) → tangga ganda DNA ($10^{-9}\text{ m}$) → kabut elektron atom karbon ($10^{-10}\text{ m}$) → inti proton & tiga kuark ($10^{-15}\text{ m}$).
- **Demo 3 — "Seberapa Cepat Cahaya Sebenarnya? — Dari 7,5 Kali Keliling Bumi hingga Ujung Bima Sakti"** (`demo3/`, ~65 dtk): Perbandingan skala waktu tempuh foton cahaya ($300.000\text{ km/detik}$): $0{,}13$ detik mengelilingi Bumi, $1{,}3$ detik ke Bulan, $8$ menit $20$ detik dari Matahari, $4{,}2$ tahun ke Proxima Centauri, dan $100.000$ tahun melintasi Bima Sakti.
