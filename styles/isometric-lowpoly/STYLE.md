---
id: isometric-lowpoly
name: Isometric Low-Poly 3D
no: 81
source: custom:isometric-cube-world
family: 3D
tech: canvas2d
music: tech
voice: el-id-m
captions: clean
best_for: arsitektur sistem, miniatur mesin produktivitas, struktur bertingkat, perencanaan finansial, alur kerja pabrik otomatis, sains optimasi
---

# Isometric Low-Poly 3D (`styles/isometric-lowpoly`)

Gaya **Isometric Low-Poly 3D (No. 81)** menyajikan dunia diorama isometrik kubus 3D (*isometric voxel/low-poly cube world*) yang presisi dan memukau. Menampilkan pulau melayang (*floating island slab*), gedung modular bertingkat, ban berjalan (*conveyor belt*), mesin perakitan otomatis, serta karakter low-poly bertekstur modern.

## Ciri Khas Visual
1. **Proyeksi Isometrik Murni 2:1 (`toIso`)**:
   - Menghitung koordinat ruang 3D `(x, y, z)` menjadi proyeksi layar 2D bergradien kedalaman yang konsisten.
2. **Balok Kubus 3-Wajah Shading (`isoBlock`)**:
   - Pencahayaan real-time pada 3 sisi kubus (Top cerah, Left sedang, Right gelap) dengan garis tepi (*edge bevel*) yang tajam.
3. **Pulau Terapung Berteknologi Tinggi (`isoIsland`)**:
   - Lempengan pulau terapung di angkasa dengan tepi neon hijau/mint dan inti batuan pekat.
4. **Karakter Low-Poly 3D (`isoChar`)**:
   - Karakter humanoid kubus mini dengan tubuh geometris, kacamata visor, dan animasi berjalan (*walk*) atau mengoperasikan sistem (*operate*).
5. **Label Holografis 3D Mengambang (`isoTag`)**:
   - Penanda data melayang yang tertambat ke koordinat dunia 3D.
6. **Standar Full-Screen 8-Adegan**:
   - Resolusi vertikal 1080x1920 tanpa panel kotak hitam bawah.
   - Header kapsul frosted kaca di bagian atas (`y: 50`, `h: 145`).
   - Kartu edukasi sains mengambang (*Floating Isometric Callout*) di `y: 1485` (`h: 165`).
   - *Safe-zone* takarir (*captions*) di bagian bawah (`y: 1700`).

## Komponen Utama `kit.js`
- `PAL`: Palet warna isometrik futuristik (Mint `#10b981`, Cyan `#06b6d4`, Indigo `#6366f1`, Purple `#8b5cf6`, Amber `#f59e0b`, Coral `#f43f5e`, Slate `#1e293b`).
- `toIso(gx, gy, gz, opts)`: Transformasi proyeksi matematis isometrik 2:1.
- `withCamera(ctx, { zoom, panX, panY, fx, fy }, fn)`: Kamera pan dan zoom diorama 3D.
- `isoBackground(ctx, t, { accent })`: Latar navy gelap dengan grid isometrik tanah dan debu angkasa.
- `isoHeader(ctx, badge, title, subtitle, { col })`: Header panel kaca berbingkai neon.
- `isoBlock(ctx, gx, gy, gz, dx, dy, dz, opts)`: Blok 3D dengan pencahayaan 3 sisi.
- `isoIsland(ctx, opts)`: Fondasi pulau mengambang.
- `isoChar(ctx, gx, gy, gz, opts)`: Karakter kubus low-poly.
- `isoTag(ctx, gx, gy, gz, text, opts)`: Label teks tertambat di ruang 3D.
- `isoCallout(ctx, cx, cy, w, h, opts)`: Kartu data ringkasan melayang di `y: 1485`.

## 3 Demo Produksi (Voice `el-id-m`, Musik `tech`)
1. **`demo1`**: *Pabrik Kebiasaan Otomatis — Cara Membangun Rutinitas Tanpa Rasa Malas* (4 stasiun pabrik: Pemicu, Keinginan, Respon 2 menit, Hadiah instan).
2. **`demo2`**: *Benteng Time-Blocking — Cara Melindungi Fokus dari Tsunami Interupsi* (Menara Deep Work, Hub Reaktif email/chat, dan Zona Buffer).
3. **`demo3`**: *Piramida Keuangan Pribadi — Cara Membangun Benteng Finansial Anti-Runtuh* (Gedung bertingkat: Pondasi Arus Kas, Brankas Dana Darurat, Perisai Asuransi, Menara Investasi).

