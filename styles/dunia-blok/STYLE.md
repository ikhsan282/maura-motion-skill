---
id: dunia-blok
name: Dunia Blok (Voxel)
no: 4
source: drive:04_Dunia_Blok + github:low-poly-voxel(voxel) + github:voxel-brick
family: 3D
tech: three
music: chiptune   voice: id-m   captions: pixel
best_for: sejarah bangunan, proses konstruksi, kota dari masa ke masa, peta, timelapse, sains bumi, game-style explainer
---
# Dunia Blok (Voxel)

**Ciri khas (look):** semua benda adalah kubus bertekstur piksel 16×16 (filter nearest), tiap blok punya tepi
gelap (AO palsu) dan sorot terang di tepi atas, sehingga ribuan kubus terbaca jelas. Palet: andesit #8d8a85 /
#6e6b67 (sambungan batu tanpa semen terlihat di tekstur), rumput #5fae3e, daun #3f8f2e, sawah #6fc0c0, pasir
#e2cc8e, lava #ff7a1a. Langit gradien biru #4a8fe8→#cfe8ff dengan **matahari kotak piksel**, kabut jarak jauh,
satu cahaya matahari dengan bayangan voxel. Teks: Press Start 2P kuning/putih dengan outline cokelat tegas, panel
dialog game (latar #0b0b2a, bingkai putih), caption preset `pixel`.

**Gerak (motion):** blok **jatuh lalu mengunci** dengan pantulan kecil (squash), lapisan bangunan naik dari tanah
satu per satu, counter angka menghitung naik, partikel kubus (abu, lava, percikan emas), timelapse siang-malam,
dan blok yang **terlempar keluar** saat sesuatu terungkap. Kamera orbit isometrik yang pelan + close-up "puzzle".

**Kenapa menarik:** nostalgia game blok, proses "dibangun dari nol" yang memuaskan ditonton, dan angka besar
yang tampil seperti skor game. Ramah keluarga dan langsung terbaca di layar kecil.

**Cerita yang cocok:**
- Borobudur: "Candi Buddha terbesar di dunia ini dibangun tanpa semen."
- Batavia 1619 → Jakarta: "Batavia dulu lebih kecil dari kecamatanmu."
- Krakatau 1883: "Satu gunung meledak... dan pulau ini lenyap separuhnya."
- Monas: "Emas di puncaknya beratnya puluhan kilo — dari mana asalnya?"
- Bendungan Jatiluhur: "Satu desa ditenggelamkan untuk menerangi Jawa Barat."
- Tembok Besar: "Dibangun berabad-abad, blok demi blok."

**Rumus hook:** "[Bangunan terkenal] ini dibangun [tanpa / hanya dengan] [hal mengejutkan]." / "[Angka besar]
blok. [Durasi]. Begini cara membangunnya." / "Dulu di sini cuma [X]. Lihat jadinya."

**Kit API (`styles/dunia-blok/kit.js`):**
- `stage(AM, {pr, shadows})`, `shootCam(cam, pos, look, fov)`, `orbit(cx, cz, ang, r, y)`, `toScreen(cam, x, y, z)`.
- `blockTex(type, face)`, `mat(type)`: tekstur piksel untuk andesit, andesitDark, relief, grass, dirt, leaf, wood, sand, water, sawah, lava, ash, rock, snow, gold.
- `vbox(w, h, d, type)`: kotak murah yang terlihat seperti w×h×d blok (UV diulang per satuan).
- `new Blocks({drop, dur})` → `.add(x, y, z, type, t0, {spin, tout})`, `.build(scene)`, `.update(t)` (jatuh-mengunci, terlempar keluar setelah `tout`; mengembalikan jumlah blok yang sudah mendarat).
- `borobudurPlan()`, `borobudurSlabs(plan)`, `stupaMesh(n)`, `mainStupa()`: candi bertingkat (kaki, 5 teras, 3 teras bundar, 72 stupa, stupa induk).
- `voxTree(h, seed, {palm})`, `volcano({r, h, steps, top})`, `cubeBurst({n, type, rain, ...})` (`.userData.tick(dt)`).
- `worker({shirt, sarong, skin, band})` + `workerPose(w, {x, z, ry, walk, carry, cheer, bow})`: pekerja blok berjalan/mengangkat.
- `skyDome()`, `setSky(sky, {top, bot, sun, stars})`, `mix()`.
- 2D: `pixTitle(ctx, str, x, y, {size, color, pop})`, `pixPanel(ctx, str, x, y, {size, color})`, `pixArrow()`, `finish()`.

**Demo:** "Membangun Borobudur Blok demi Blok", 18,7 detik, 5 shot. Batu terakhir stupa induk jatuh mengunci,
karung semen dicoret "TANPA SEMEN!" → hujan blok andesit, counter 1.000.000+, pekerja mengangkut batu → close-up
tonjolan masuk ke lekukan, "KLIK!" → timelapse siang-malam: kaki, tubuh, kepala naik, counter 72 STUPA → gunung
meletus, abu turun, hutan menelan candi blok demi blok → daun berhamburan, candi utuh di bawah matahari pagi, BOROBUDUR.
