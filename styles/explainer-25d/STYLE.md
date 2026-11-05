---
id: explainer-25d
name: Modern Explainer 2.5D
no: 84
source: custom:explainer-25d
family: 2.5D
tech: canvas2d
music: tech
voice: el-id-m
captions: clean
best_for: konsep bisnis & ekonomi, video essay sains & teknologi, psikologi kognitif & neurosains, arsitektur sistem, analisis data berlapis, struktur piramida & hierarki strategi
---

# Modern Explainer 2.5D (`styles/explainer-25d`)

Gaya **Modern Explainer 2.5D (No. 84)** menghadirkan estetika video essay edukasi premium kelas dunia (terinspirasi oleh kanal eksplainer ternama seperti *Vox*, *Polymatter*, dan presentasi *Apple Keynote*). Ditenagai oleh **mesin proyeksi perspektif 3D Canvas2D murni** tanpa pustaka eksternal (*zero external dependencies*), gaya ini mengubah konsep abstrak, hierarki piramida, dan data berlapis menjadi panggung visual interaktif berkedalaman nyata.

## Ciri Khas Visual
1. **Mesin Proyeksi 3D Perspektif Nyata (*True 3D Camera Projection*)**:
   - Kamera memiliki posisi koordinat $(X, Y, Z)$, sudut kemiringan (*pitch* vertikal dan *yaw* horizontal), serta nilai *Field of View* (FOV) yang dinamis.
   - Parallaks nyata: elemen yang berada lebih dekat dengan kamera bergerak lebih cepat daripada elemen di latar belakang saat kamera bergerak.
2. **Lantai Kisi-Kisi Perspektif (*Perspective Grid Plane*)**:
   - Kisi-kisi garis perspektif halus (`rgba(56, 189, 248, 0.14)`) membentang menuju titik lenyap (*vanishing horizon*) dengan pendaran kabut radial sian lembut.
3. **Balok Ekstrusi 3 Sisi & Bayangan Jatuh (*Extruded Slabs & Cast Shadows*)**:
   - Setiap objek memiliki 3 wajah pencahayaan realistis: *Top Face* (terang/aksen), *Front Face* (mid-tone), dan *Side Face* (gelap/arsiran sudut pandang), lengkap dengan bayangan jatuh lembut di lantai kisi-kisi.
4. **Struktur Bertingkat Mekar (*2.5D Exploded Stack*)**:
   - Fitur unggulan untuk edukasi: piramida atau tumpukan lapisan konsep dapat meregang (*explode*) ke atas pada sumbu elevasi sambil tetap terhubung dengan garis laser neon (*laser connectors*).
5. **Kuis Interaktif Pilihan Ganda 2.5D (`interactiveQuiz25D`)**:
   - Kartu kuis melayang dengan 3 opsi balok bertingkat dan bilah hitungan mundur (*countdown timer*) amber menyala.
6. **Kotak Narasi Karaoke Panggung Tengah (`karaokeCard25D`)**:
   - Panel kaca gelap studio (`#0f172a`) di `cx: 540, cy: 1100, w: 920, h: 220` dengan tipografi tebal dan kata kunci penting yang disorot dengan *pill* bercahaya sian (`#06b6d4`).
7. **Standar Full-Screen 8-Adegan**:
   - Resolusi vertikal penuh 1080x1920 (tanpa panel hitam bawah).
   - Header kapsul studio di bagian atas (`y: 80`).
   - Kartu data edukasi melayang (*Floating Callout*) di `y: 1485` (`h: 165`).
   - *Safe-zone* takarir (*captions*) di `y: 1700`.

## Komponen Utama `kit.js`
- `PAL`: Palet studio teknologi modern (`cyan: '#06b6d4'`, `blue: '#3b82f6'`, `indigo: '#6366f1'`, `purple: '#8b5cf6'`, `amber: '#f59e0b'`, `emerald: '#10b981'`, `rose: '#f43f5e'`, `bgStudio: '#0f172a'`).
- `createCamera(opts)`: Pengaturan kamera 3D portrait (`pitch`, `yaw`, `y`, `z`, `fov`, `cx`, `cy`).
- `project3D(wx, wy, wz, cam)`: Fungsi inti transformasi koordinat ruang 3D ke layar 2D (`x`, `y`, `scale`, `pz`, `visible`).
- `studioBg(ctx, { width, height, t })`: Latar studio abu-abu gelap dengan partikel debu melayang.
- `perspectiveGrid(ctx, cam, opts)`: Kisi lantai 3D berkedalaman dengan horizon glow.
- `extrudedSlab25D(ctx, cam, opts)`: Balok prisma 3D dengan shading pencahayaan 3 sisi dan bayangan lantai.
- `explodedStack25D(ctx, cam, opts)`: Tumpukan piramida hierarkis mekar dengan relasi laser konektor.
- `laserConnector3D(ctx, cam, p1, p2, opts)`: Garis laser konektor bercahaya berkedip antar titik 3D.
- `stepCard25D(ctx, cam, opts)`: Kartu frosted glass melayang di ruang perspektif.
- `interactiveQuiz25D(ctx, cam, opts)`: Modul kuis pilihan ganda 2.5D dengan timer bar.
- `karaokeCard25D(ctx, cx, cy, w, h, opts)`: Kotak narasi panggung tengah berpenyorot kata kunci.
- `explainerCallout(ctx, cx, cy, w, h, opts)`: Kartu data edukasi mengambang di `y: 1485`.
- `topHeader25D(ctx, badge, title, opts)`: Header status di bagian atas layar.

## 3 Demo Produksi (Voice `el-id-m`, Musik `tech`)
1. **`demo1`**: *Piramida Keuangan Pribadi — Mengapa 80% Orang Terjebak Runtuh Finansial?*
   - Jebakan piramida terbalik (spekulasi tanpa pondasi kas), 5 tingkatan piramida finansial mekar (Cashflow positif bebas utang, Dana darurat 3-6 bulan cair, Proteksi asuransi kesehatan, Investasi pasif indeks/SBN, Aset spekulatif puncak), dan kuis formula anggaran 50-30-20.
2. **`demo2`**: *Tiga Lapisan Otak Manusia — Mengapa Emosi & Malas Sering Mengalahkan Logika?*
   - Perang di dalam kepala (produktivitas vs rebahan), model Triune Brain 2.5D terangkat (Batang Otak Reptil 500 juta tahun, Sistem Limbik Mamalia pencari dopamin, Neokorteks manusia prefrontal cortex), fenomena Amygdala Hijack dalam 0.1 detik, aturan jeda 5 detik Mel Robbins, dan kuis konsumsi 20% energi kalori tubuh oleh otak.
3. **`demo3`**: *Cara Kerja Algoritma Rekomendasi — Mengapa AI Tahu Isi Pikiranmu?*
   - Misteri feed beranda medsos, 4 layer arsitektur deep learning AI (Layer 1: Behavioral Signals watch time & detik skip, Layer 2: 3D Vector Embedding space, Layer 3: Collaborative Filtering jutaan kluster pengguna, Layer 4: Neural Ranking Model skor probabilitas klik), pengiriman super cepat kurang dari 50 milidetik, dan kuis metrik prioritas utama algoritma (Completion Rate & Replay Loop).

