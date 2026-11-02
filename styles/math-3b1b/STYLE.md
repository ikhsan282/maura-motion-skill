---
id: math-3b1b
name: Matematika Gelap
no: 49
source: github:dark-data-viz + math-3b1b
family: data
tech: canvas2d
music: ambient   voice: id-m   captions: clean
best_for: pembuktian matematika, rumus sekolah, fisika dasar, statistik, paradoks logika, "kenapa rumusnya begitu"
---
# Matematika Gelap

**Ciri khas (look):** latar hampir hitam #0e1116 dengan grid koordinat samar, palet ketat ala animasi matematika: biru #58c4dd, teal #5cd0b3, kuning #f9e15d, merah #fc6255. Bentuk ber-stroke tegas 4 px dengan isian transparan (≈40%), rumus bergaya LaTeX (Noto Serif, variabel miring, simbol π digambar sebagai path), label huruf kapital Inter berspasi. Banyak ruang kosong.

**Gerak (motion):** semua memakai kurva "smooth" (tanpa overshoot), bentuk **benar-benar berpindah**: lingkaran terbelah dua, membuka jadi dua sisir, lalu saling mengisi jadi hampir persegi panjang; jumlah potongan berlipat (8 → 16 → 32 → 64) dan tiap juring membelah lalu bergeser ke slotnya. Rumus **menulis dirinya** (garis luar dulu, lalu isian), kurung kurawal tumbuh dari tengah, kotak sorot menggambar diri, satu suku berubah jadi suku lain (r kedua naik jadi pangkat ²).

**Kenapa menarik:** memberi momen "aha" yang memuaskan; penonton melihat rumus lahir dari gambar, bukan dihafal. Tampilan gelap-elegan terasa cerdas dan terpercaya.

**Cerita yang cocok:**
- Luas lingkaran = πr²: "Potong pizza jadi 32 bagian... dan ia jadi persegi panjang."
- Pythagoras tanpa aljabar: "Tiga persegi, satu segitiga, dan rahasia 2.500 tahun."
- 0,999... = 1: "Dua angka ini sama persis. Matematikawan serius."
- Paradoks ulang tahun: "Cukup 23 orang untuk peluang 50%."
- Jumlah 1+2+...+100: "Anak 9 tahun menghitungnya dalam 10 detik."

**Rumus hook:** "[Aksi sederhana pada benda sehari-hari]... dan [bentuk/angka] berubah jadi [hal tak terduga]." / "Rumus [X] yang kamu hafal ternyata cuma [gambar sederhana]." / "[Pernyataan yang terdengar salah]. Dan bisa dibuktikan."

**Kit API (`styles/math-3b1b/kit.js`):**
- `PAL`, `pr`, `smooth(x)`, `ground(ctx, {grid})`: latar hampir hitam + grid; `cam(ctx, z, cx, cy)`.
- `sectorPose(N, i, s, geom)`: pose juring i dari N pada tahap s (0 lingkaran, 1 terbelah, 2 dua sisir, 3 persegi panjang); `splitPose(N, c, k, geom)`: juring induk membelah saat N berlipat; `posesAt`, `posesSplit`.
- `drawSectors(ctx, poses, {R, fillA, arcTop, arcBot, edges})`: gambar juring (busur keliling bisa disorot kuning); `rectBox(N, geom)`: kotak hasil.
- `strokeOn(ctx, p, L)`, `line(...)`, `brace(ctx, x0, y0, x1, y1, p)`: kurawal tumbuh dari tengah; `surround(...)`: kotak sorot; `dashedRect(...)`.
- `math(ctx, 'L = πr²', x, y, {size, p, colors, align})`: rumus yang menulis diri; `layoutMath`, `piGlyph`.
- `label(ctx, text, x, y)`, `dot(ctx, x, y, r, color)`.

**Demo:** "Kenapa Luas Lingkaran itu Pi r Kuadrat", 19,2 detik. Lingkaran 32 juring terbelah, membuka, dan menyusun diri jadi "≈ persegi panjang" → diulang dengan N = 8, 16, 32, 64 sampai sisinya lurus → kurawal "r" (tinggi) dan "½ × 2πr" → "πr" (lebar, busur atas menyala) → "L = πr × r" ditulis, r kedua naik jadi pangkat: "L = πr²" dikotaki → persegi panjang melipat kembali jadi lingkaran berjari-jari r.
- **Demo 2 — "Phi: K ÷ d = 3,14"** (`demo-pitagoras/`, 20 dtk): tali keliling dibuka lurus, garis diameter, tick 3,14×, rumus K/d=3,14 + 3 lingkaran. Voice el-id-m.
- **Demo 3 — "Setengah Tak Terhingga"** (`demo-setengah/`, 20 dtk): batang dibagi dua terus (½+¼+⅛=1), paradoks Zeno. Voice el-id-m.
