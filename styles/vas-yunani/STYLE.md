---
id: vas-yunani
name: Vas Yunani Black-Figure
no: 42
source: github:silhouette-shadow-play(greek vase) + silhouette-backlit
family: Kriya
tech: canvas2d
music: tribal   voice: el-id-m   captions: serif
best_for: mitologi Yunani & dunia kuno, kisah filosofis, tragedi kesombongan (hubris), strategi perang kuno, asal-usul peradaban
---
# Vas Yunani Black-Figure

**Ciri khas (look):** Lukisan keramik amfora Athena abad ke-6 SM gaya *Attic Black-Figure* — latar tanah liat terakota hangat (`#D86E39` – `#B84F22`) dengan pencahayaan silindris melengkung, tekstur retak halus (*crackle glaze*), serta sabuk ornamen *Meander* (Greek Key), kuncup teratai (*palmette*), dan motif lidah di bagian leher serta kaki vas. Seluruh karakter, dewa, monster, dan bangunan digambar sebagai siluet slip hitam legam (`#14100E`) beraksen merah marun (`#7A2021`) dan putih kapur (`#F2E6D0`), dilengkapi **garis gores (*incised lines*)** berwarna terakota terang (`#E68A52`) untuk detail otot, lipatan jubah *chiton*, bulu sayap, dan mata profil arkais.

**Gerak (motion):** Efek *cylindrical frieze scroll* — sabuk meander dan latar arsitektur bergeser mulus seolah penonton sedang memutar vas keramik di museum untuk membaca adegan demi adegan; figur hitam bergerak dengan artikulasi sendi profil klasik, kobaran api dan petir berkedip ritmis.

**Kenapa menarik:** Kontras siluet hitam di atas terakota jingga sangat ikonik di layar ponsel, menghadirkan aura epik bersejarah sekaligus kejelasan visual tingkat tinggi.

**Cerita yang cocok:**
- Prometheus: Pencuri api Olimpus di batang adas (*narthex*) demi peradaban manusia, hukuman rantai di Kaukasus, dan pembebasan oleh Herakles.
- Icarus & Daedalus: Labirin Kreta, sayap bulu berlilin, dan bahaya terbang terlalu dekat dengan matahari (*hubris*).
- Kuda Troya: Pengepungan sepuluh tahun, siasat Odiseus meninggalkan kuda kayu raksasa, dan runtuhnya tembok Troya.
- Kotak Pandora, Sisifus, atau Alegori Gua Plato.

**Rumus hook:** "Dulu, hanya [pihak berkuasa] yang memiliki [kekuatan]... sampai seseorang berani mencurinya." / "Kisah ini terukir di atas tanah liat ribuan tahun lalu — dan peringatannya masih berlaku hari ini."

**Kit API (`styles/vas-yunani/kit.js`):**
- `PAL`, `FONT`: Palet terakota, slip hitam, oker goresan, marun, dan putih kapur; tipografi serif klasik.
- `stage(ctx, t, { scroll, title, subtitle, chapter, glow })`: Menggambar silinder amfora terakota, tekstur retak keramik, sabuk meander & palmette yang berputar mengikuti `scroll`, dan plakat inskripsi atas.
- `meander(ctx, x, y, w, size, scroll)`, `palmettes(ctx, x, y, w, size, scroll)`, `waves(ctx, y, w, t, scroll)`: Ornamen batas keramik Yunani.
- `figure(ctx, x, y, s, opts)`: Figur manusia/dewa gaya black-figure dalam profil samping dengan detail garis gores (`incised`) terakota, mendukung jubah, helm Korintus, janggut, mahkota daun salam, pose jalan, berlutut, terbelenggu, memegang obor/petir/busur/perisai.
- `torch(ctx, x, y, s, t)`, `thunderbolt(ctx, x, y, s, t)`, `eagle(ctx, x, y, s, t, opts)`, `wings(ctx, x, y, s, t, opts)`, `trojanHorse(ctx, x, y, s, t, opts)`, `columns(ctx, x, y, w, h, opts)`, `plaque(ctx, x, y, w, h, opts)`.

**Demo (3 Skenario Lengkap, ~63–65 dtk, voice `el-id-m`):**
1. **`demo1` — Prometheus, Pencuri Api Olimpus (~64 dtk):** Kisah Titan Prometheus yang menyembunyikan bara api di dalam batang tanaman adas untuk membangkitkan peradaban manusia, murka Zeus yang merantainya di tebing Kaukasus, hingga pembebasannya oleh panah Herakles.
2. **`demo2` — Sayap Lilin Icarus & Labirin Daedalus (~64 dtk):** Kisah arsitek legendaris Daedalus dan putranya Icarus yang meloloskan diri dari menara Raja Minos di Pulau Kreta menggunakan sayap bulu berlilin lebah, serta pelajaran abadi tentang batas antara keberanian dan kesombongan (*hubris*).
3. **`demo3` — Siasat Kuda Troya: Ketika Hadiah Menjadi Kehancuran (~65 dtk):** Kisah pengepungan sepuluh tahun di pantai Troya yang diakhiri bukan dengan tombak, melainkan kecerdikan Odiseus lewat kuda kayu raksasa berisi prajurit pilihan—asal-usul istilah *Trojan Horse* di dunia siber modern.

