---
id: flipbook
name: Flipbook
no: 24
source: drive:24_Flipbook
family: craft
tech: canvas2d
music: musicbox   voice: el-id-m   captions: hand
best_for: sejarah animasi & film, proses kreatif, cerita mini bergerak, tutorial "cara membuat", nostalgia masa sekolah
---
# Flipbook

**Ciri khas (look):** tampak atas meja kayu hangat (#9a6a40, serat kayu). Buku spiral kecil (halaman krem #fbf8ef, tumpukan tepi halaman terlihat, sampul biru di belakang) dipegang dua tangan kartun datar berwarna kulit (#f1c29a) dengan garis luar coklat. Gambar di halaman memakai pulpen biru (#2647a3): garis sedikit transparan dengan inti lebih gelap, nomor halaman di pojok. Properti meja: penghapus, pulpen, kartu paten sepia, pita film, kertas tempel kuning.

**Gerak (motion):** ibu jari kanan mengangkat pojok bawah dan halaman membalik ke atas menuju spiral: **satu halaman per gambar, 12 per detik** (gerak tersendat khas flipbook). Setiap halaman digambar ulang dengan tangan, jadi garisnya bergoyang sedikit berbeda tiap halaman. Saat menggambar, pulpen mengikuti goresan dan halaman sebelumnya tembus pandang (onion skin); halaman dibalik pelan dengan lengkungan dan bayangan. Objek baru meluncur ke meja (kartu paten dengan stempel yang menghentak, pita film yang bergulir, catatan "24" yang menghitung). Halaman terakhir: TAMAT.

**Kenapa menarik:** semua orang pernah mencoret pojok buku. Menonton gerakan lahir dari kertas diam terasa ajaib dan nostalgik; ritme 12 fps-nya langsung dikenali sebagai "buatan tangan".

**Cerita yang cocok:**
- Animasi lahir dari pojok buku: "Semua film kartun memakai trik dari pojok buku ini."
- Rahasia 12 prinsip dasar animasi: squash, stretch, antisipasi, dan onion skin.
- Muybridge dan kuda yang berlari (1878): "Apakah keempat kaki kuda pernah melayang bersamaan?"

**Rumus hook:** "Semua [hal besar] berawal dari [benda kecil sehari-hari] ini." / "Gambar diam + [trik] = hidup."

**Kit API (`styles/flipbook/kit.js`):**
- `book(ctx, {x, y, s, page(g,i), top, flip:{page,f}, live(g), stack})`: buku spiral; `page` menggambar isi halaman i (di-cache per halaman), `flip` = halaman yang sedang terangkat (0..1), `live` = halaman yang sedang digambar.
- `leftHand`, `rightThumb(ctx,x,y,{lift})`, `pen(ctx,x,y,{lift})`: tangan dan pulpen.
- `stick(pose)`, `inkStick(ctx,pose,{seed,reveal})` (stickman pulpen; `seed` = goyangan unik per halaman), `inkPath`, `inkStroke`, `inkText` (tulisan tangan dengan reveal).
- `filmStrip(ctx,x,y,{frame(g,k,w,h), offset})`, `patentCard(ctx,x,y,{title,sub,year,stamp})`, `desk`, `deskTile`, `cam`, `viewRect`, `PAGE`.

**Demos (`styles/flipbook/demo1/`, `demo2/`, `demo3/` + variasi pendek):**
- **`demo1/`**: *Animasi Lahir dari Pojok Buku — Sejarah Kineograf hingga 24 Bingkai per Detik* (~52 detik, 5 babak: Pojok buku tulis → Menggambar stickman & onion skin → Ilusi hidup → Kartu paten Kineograf 1868 → Pita film 24 bingkai/detik & TAMAT).
- **`demo2/`**: *Rahasia 12 Prinsip Animasi — Squash, Stretch, dan Antisipasi di Pojok Buku* (~55 detik, 8 babak: Bobot & kelenturan → Squash & Stretch → Antisipasi merunduk → Onion skin halaman → Spacing kecepatan → Jalur busur parabolik → Warisan 1930-an → TAMAT).
- **`demo3/`**: *Taruhan Kuda Berlari Eadweard Muybridge 1878 — Ketika Foto Diam Melahirkan Bioskop* (~55 detik, 8 babak: Debat kuda melayang → Lukisan klasik → 12 kamera benang pemicu di Palo Alto → Sallie Gardner memutus benang → Bukti keempat kaki melayang di udara → Zoopraxiscope 1878 → Jembatan menuju bioskop 24 fps → TAMAT).
- **Variasi pendek tambahan**: `demo-bola/` (*Bola Memantul*, 12 dtk), `demo-lari/` (*Stickman Lari*, 16 dtk).
- Render salah satu demo: `node scripts/make.mjs styles/flipbook/demo1/story.json` (atau `demo2` / `demo3`).
