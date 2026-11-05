# kaca-patri — Kaca Patri Mosaik (Stained Glass Mosaic)

Gaya visual **Kaca Patri Mosaik** menghadirkan kemegahan jendela katedral abad pertengahan dan seni mosaik kaca permata: kepingan kaca warna rubi merah (`#e0243c`), biru kobalt (`#1e5ce6`), zamrud (`#18a866`), dan emas ambar (`#f7bc30`) yang diikat garis timah hitam tebal (*lead came*), ditembus berkas cahaya matahari berwarna (*volumetric sunbeams*) dengan butiran debu keemasan yang melayang.

## Kit (`styles/kaca-patri/kit.js`)
- `cathedralStage(g, t, { rayColors })`: Interior batu katedral dengan sorot cahaya warna-warni yang menembus jendela, partikel debu bercahaya, dan bingkai kaca patri di sisi layar.
- `glassTile(g, pts, col, opts)`: Menggambar satu keping poligon kaca patri lengkap dengan gradien cahaya permata dan sambungan timah hitam (`lead came`).
- `roseWindow(g, cx, cy, r, t, opts)`: Jendela Mawar Gotik (*Rose Window*) melingkar dengan kelopak mosaik berputar halus dan medali emas di pusatnya.
- `lancetWindow(g, x, y, w, h, t, opts)`: Jendela lengkung runcing (*lancet arch*) dengan adegan mosaik (`'story'`, `'alchemy'`).
- `stainedBanner(g, x, y, w, h, opts)` & `mosaicInfoCard(g, x, y, w, h, opts)`: Panel tajuk dan kartu informasi berbingkai timah & permata kaca.

## Demo (30–90 Detik)
- **Demo 1 — "Jendela yang Bercerita — Bagaimana Kaca Patri Menjadi Buku Bergambar Abad Pertengahan"** (`demo1/`, ~64 dtk): Mengapa katedral Eropa membangun jendela kaca raksasa sebagai *Biblia Pauperum* (buku bergambar bagi rakyat yang belum bisa membaca), dibaca dari bawah ke atas mengikuti cahaya matahari. Voice `el-id-m`.
- **Demo 2 — "Alkimia Kaca Permata — Rahasia Emas dan Kobalt yang Tidak Pudar Seribu Tahun"** (`demo2/`, ~64 dtk): Sains di balik kaca patri yang tetap menyala selama 800 tahun: bukan dicat di permukaan, melainkan dilebur bersama oksida logam (emas menjadi merah rubi, kobalt menjadi biru safir, tembaga menjadi zamrud, perak menjadi emas). Voice `el-id-m`.
- **Demo 3 — "Geometri Jendela Mawar — Matematika Simetri dan Cahaya di Katedral Gotik"** (`demo3/`, ~65 dtk): Bagaimana arsitek Gotik menggunakan iga penyangga terbang (*flying buttress*) untuk melubangi dinding batu dan menyusun ribuan keping kaca simetri radial 12 kelopak pada *Rose Window*. Voice `el-id-m`.

