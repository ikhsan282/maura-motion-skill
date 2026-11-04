# Dunia Blok (Voxel Minecraft-Style —Sejarah & Sains dalam Balok)

Dunia **3D voxel nyata (Three.js)** dengan tekstur piksel `16×16` (`THREE.NearestFilter`), bayangan blok yang tegas, dan balok-balok yang **jatuh dan terkunci satu per satu** sesuai narasi. Di atas dunia 3D terdapat HUD piksel (`Press Start 2P`) bergaya gim untuk judul, penghitung blok, dan label fakta.

Cocok untuk: **sejarah bangunan & candi Nusantara, cara kerja struktur/rekayasa, geografi/gunung berapi, eksperimen sains yang disusun bertahap**.

---

## Ciri Visual

1. **Geometri Voxel 3D Nyata (`Three.js`)**: Setiap objek adalah susunan kubus bertekstur piksel `16×16` tanpa interpolasi blur (`NearestFilter`). Sisi kubus punya garis tepi gelap tipis (*fake ambient occlusion*) sehingga sambungan antar-blok terbaca jelas.
2. **Animasi Rakit Blok demi Blok (`Blocks`)**: Elemen bangunan/pulau muncul dengan jatuh dari atas (`drop`) lalu mengunci pada koordinat grid `(x, y, z)` tepat saat kata kunci narasi diucapkan (`t0`), atau terlempar keluar saat meledak (`tout`).
3. **Pencahayaan Matahari + Bayangan Tajam**: `DirectionalLight` dengan `PCFSoftShadowMap`, langit gradien yang bisa berubah dari siang cerah ke abu vulkanik atau malam ibu kota (`setSky`).
4. **HUD Piksel (`Press Start 2P`)**: Kotak dialog bergaya gim 8-bit (`pixPanel`), teks judul piksel berbayang tebal (`pixTitle`), panah penunjuk piksel yang memantul (`pixArrow`), dan semburan partikel kubus (`cubeBurst`).

---

## Apa Saja yang Ada di `kit.js`

Import dari `../kit.js` (dari dalam `styles/dunia-blok/demoN/scene.js`):

- **3D Stage & Kamera**:
  - `stage(AM)` → membuat `scene`, `camera`, `sun`, `amb`, dan WebGL renderer.
  - `orbit(az, el, dist, target, fov)` → menghitung posisi kamera mengorbit titik `target`.
  - `shootCam(S, ctx, cam)` → me-render scene 3D ke kanvas 2D `ctx`.
  - `toScreen(camera, [x,y,z], W, H)` → memproyeksikan titik 3D ke koordinat layar 2D untuk menempelkan panah/label HUD tepat di atas objek 3D.
- **Tekstur & Material Voxel**:
  - `blockTex(type, face)` & `mat(type, face, { emissive })` — tipe bawaan: `'andesit'`, `'andesitDark'`, `'relief'`, `'grass'`, `'dirt'`, `'leaf'`, `'wood'`, `'sand'`, `'water'`, `'sawah'`, `'lava'`, `'ash'`, `'rock'`, `'snow'`, `'gold'`.
  - `vbox(w, h, d, type)` → balok `w×h×d` yang teksturnya berulang tiap 1 unit dunia.
  - `Blocks` → *instanced mesh* untuk ribuan blok yang jatuh satu per satu (`add(x,y,z,type,t0,{s,drop,spin,tout})`, `build(scene)`, `update(t)`).
- **Generator Struktur & Karakter**:
  - `borobudurPlan()`, `borobudurSlabs()`, `stupaMesh()`, `mainStupa()`
  - `voxTree(x, y, z, seed)` — pohon voxel (batang kayu + daun berundak).
  - `volcano(x, y, z, { r, h })` — gunung berapi voxel di kejauhan.
  - `voxShip(x, y, z, { s })` — kapal layar/uap voxel untuk adegan maritim Nusantara.
  - `voxFlag(x, y, z, { h, s })` — tiang bendera Merah Putih voxel.
  - `worker(seed)` & `workerPose(w, t, { walk, build })` — karakter pekerja/arsitek berkepala kotak yang berjalan dan mengayunkan pahat.
- **2D Pixel HUD**:
  - `pixTitle(ctx, str, x, y, opts)`, `pixPanel(ctx, str, x, y, opts)`, `pixArrow(ctx, x, y, t, opts)`, `cubeBurst(ctx, x, y, p, opts)`, `finish(ctx, AM, t, { flash })`.

---

## Koleksi Demo (`demo1`, `demo2`, `demo3`)

Semua demo menggunakan narator Bahasa Indonesia (`el-id-m`, George — ElevenLabs) dengan rentang durasi 30–90 detik:

1. **`demo1/` — Membangun Borobudur Blok demi Blok** (5 beat):
   - Perataan bukit Jawa Tengah, penyusunan 2 juta blok batu andesit dengan sistem kunci *dovetail* tanpa semen, ukiran 2.600 panel relief, 72 stupa berlubang mengelilingi stupa induk, hingga letusan Merapi dan pemugaran.
2. **`demo2/` — Letusan Gunung Krakatau 1883 & Lahirnya Anak Krakatau** (10 beat):
   - Pulau vulkanik Krakatau dengan 3 puncak (Perboewatan, Danan, Rakata) di Selat Sunda, kapal-kapal dagang yang melintas, erupsi Mei–Agustus 1883, ledakan dahsyat 27 Agustus pukul 10:02 yang terdengar sejauh 4.800 km, gelombang tsunami 30 meter, senja merah stratosfer, runtuhnya kaldera, hingga munculnya blok demi blok Gunung Anak Krakatau pada 1927.
3. **`demo3/` — Monas: Rahasia Lidah Api Emas di Puncak Jakarta** (10 beat):
   - Pembangunan Monumen Nasional di Medan Merdeka sejak 17 Agustus 1961, filosofi Lingga & Yoni karya Frederich Silaban dan Soedarsono, ruang Museum Sejarah Nasional, cawan setinggi 17 meter dan lebar 45 meter, tugu obelisk marmer putih 117 meter, lift menuju pelataran puncak, patung Lidah Api perunggu 14,5 ton, sumbangan 38 kg emas murni Teuku Markam & rakyat Indonesia yang ditambah menjadi 50 kg emas pada HUT RI ke-50, hingga panorama Monas menyala di malam hari.
