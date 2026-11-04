---
id: editorial-serif
name: Editorial Serif
no: 35
source: github:editorial-paper-serif + editorial-serif
family: typography
tech: canvas2d
music: ambient   voice: el-id-m   captions: clean
best_for: jurnal budaya, sejarah kriya & kuliner, biografi sastrawan/seniman, esai visual bergaya majalah cetak, cerita asal-usul benda berharga
---
# Editorial Serif

**Ciri khas (look):** Halaman majalah cetak / jurnal esai di atas kertas hangat bertekstur (`#F6F1E7`), tipografi judul *high-contrast serif* (`Instrument Serif` / `Playfair Display` / `Georgia`) dengan kata beraksen *italic* berwarna terakota (`#B84A32`), label *small-caps* monospasi/sans di bagian rubrik, garis rambut (*hairline rules* 1px), sorotan stabilo kuning gading (`#F3D88C`), kartu *swatch* pigmen seperti katalog museum, serta bingkai ilustrasi garis halus bernomor `FIG. 01` hingga `FIG. 08`.

**Gerak (motion):** Transisi halaman dan elemen mengikuti pegas lembut (*editorial ease*), garis pemisah memanjang dari kiri ke kanan, kata kunci *italic* disorot stabilo tepat saat diucapkan, dan ilustrasi garis halus digambar bertahap di dalam bingkai figur.

**Kenapa menarik:** Terasa seperti membuka halaman majalah *Kinfolk*, *Monocle*, atau *National Geographic* edisi khusus yang hidup di layar vertikal—memberikan kesan mendalam, berkelas, dan tepercaya.

**Cerita yang cocok:**
- Kain tenun Sumba: "Selembar kain ini... butuh hampir setahun untuk selesai."
- Rempah Nusantara: "Segenggam biji pala ini pernah ditukar dengan pulau Manhattan."
- Kopi gunung berapi: "Kenapa kopi dari lereng gunung api punya rasa yang tak bisa ditiru?"

**Kit API (`styles/editorial-serif/kit.js`):**
- `PAL`: Palet warna kertas hangat, tinta arang, terakota (`#B84A32`), nila (`#26466D`), oker emas (`#C68E3F`), dan hijau sage (`#5B6E58`).
- `drawEditorialPage(ctx, t, { issue, rubric, figNo, totalFigs })`: Menggambar kertas jurnal hangat, bingkai garis rambut ganda, kepala halaman *small-caps*, dan nomor halaman.
- `drawEditorialHeadline(ctx, kicker, lines, sub, y, p)`: Menggambar judul serif kontras tinggi dengan dukungan sintaks `*kata miring terakota*` dan stabilo halus.
- `drawFigureFrame(ctx, x, y, w, h, figTag, caption, p)`: Bingkai ilustrasi majalah dengan label `FIG.` dan keterangan miring di bawahnya.
- `drawColorSwatches(ctx, x, y, swatches, p)`: Kartu sampel pigmen/bahan dengan kode warna dan asal bahan.
- `drawSumbaHinggi`, `drawIkatProcess`, `drawSpicePlate`, `drawCoffeePlate`: Ilustrasi garis halus editorial untuk tenun ikat Sumba, botani rempah, dan anatomi kopi.

**Paket 3 Demo (`demo1`, `demo2`, `demo3` — 30–90 detik, voice `el-id-m`):**
- **`demo1` — "Kain yang Ditenun Setahun di Sumba — Rahasia Tenun Ikat Hinggi dari Akar Mengkudu dan Daun Nila"**: Mengisahkan 42 tahapan pembuatan selembar kain *Hinggi* Sumba Timur, dari pengikatan serat daun gewang, pencelupan biru tarum dan merah akar mengkudu (*kombu*), hingga filosofi motif kuda (*njara*).
- **`demo2` — "Jejak Rempah yang Mengubah Peta Dunia — Pala Banda, Cengkeh Ternate, dan Kapur Barus"**: Esai visual bergaya botani klasik tentang tiga tanaman endemik Nusantara yang memicu pelayaran samudra dan mengubah sejarah ekonomi dunia.
- **`demo3` — "Anatomi Secangkir Kopi Nusantara — Mengapa Tanah Gunung Berapi Melahirkan Rasa Terbaik?"**: Mengupas ketinggian lereng vulkanik Gayo, Toraja, dan Flores, struktur lapisan buah ceri kopi, hingga kurva penyangraian yang melahirkan aroma khas Nusantara.

