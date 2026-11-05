---
id: stickman-3dworld
name: Stickman 3D World
no: 69
source: custom:stickman-3d-mannequin
family: 3d
tech: canvas2d
music: lofi   voice: el-id-m   captions: clean
best_for: simulasi ruang 3D, progres bertingkat, manajemen waktu, beban kognitif, kebiasaan 1%
---
# Stickman 3D World

**Karakter Unik ("Si Manekin Sendi Bola 3D" — `K.mannequin3DStickman`):**
- Dirancang menyerupai **manekin kayu/metalik 3D (artist poser mannequin)**:
  - **Kepala bola 3D berbayang** (*radial gradient*) dengan garis kontur ekuator/meridian 3D dan visor siber bercahaya.
  - **Sendi Bola 3D (`ball-and-socket joints`)**: bahu, siku, pinggul, lutut, dan pergelangan kaki berupa bola 3D mengilap.
  - **Tungkai Silinder 3D Bergradasi** & pelat dada berinti emas, lengkap dengan bayangan elips perspektif di lantai.

**Ciri khas (look):** Dunia perspektif 3D dengan garis cakrawala berpendar (`horizonY`), grid lantai menuju satu titik hilang (*vanishing point*), serta balok/tangga/podium 3D (`draw3dBox`) berwajah atas, depan, dan samping.

**Kit API (`styles/stickman-3dworld/kit.js`):**
- `K.world3dBg(ctx, t, { horizonY, floorY, accent })`
- `K.world3dHeader(ctx, badge, mainTitle, subTitle, { rightStat, col, a })`
- `K.draw3dBox(ctx, x, bottomY, w, h, depth, { col, label, subLabel, a })`
- `K.mannequin3DStickman(ctx, x, floorY, pose, { facing, col, t, a, label })`
- `K.world3dCard(ctx, x, y, w, h, { tag, titleStr, subStr, stat, statSub, col, a })`

**3 Demo (64–65 dtk, voice `el-id-m`):**
1. `demo1`: *Hukum Bunga Majemuk Kebiasaan — Mengapa Lebih Baik 1% Setiap Hari Mengubah Hidup 37 Kali Lipat?*
2. `demo2`: *Kotak Parkinson & Fokus — Mengapa Pekerjaan Dua Jam Bisa Molor Menjadi Seminggu?*
3. `demo3`: *Ilusi Multitasking & Biaya Pindah Fokus — Apa yang Terjadi Saat Otak Membuka Terlalu Banyak Jendela?*
