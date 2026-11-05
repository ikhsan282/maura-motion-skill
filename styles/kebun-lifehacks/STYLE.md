---
id: kebun-lifehacks
name: Kebun & Lifehacks Santai
no: 83
source: custom:kebun-lifehacks
family: 2D
tech: canvas2d
music: lofi
voice: el-id-m
captions: clean
best_for: berkebun di rumah, trik tanaman pekarangan, perawatan bunga & bibit, food prep & penyimpanan dapur, lifehacks hemat listrik rumah tangga, DIY perkakas sederhana
---

# Kebun & Lifehacks Santai (`styles/kebun-lifehacks`)

Gaya **Kebun & Lifehacks Santai (No. 83)** diadaptasi dari video referensi edukasi berkebun & tips rumah tangga viral. Gaya ini dirancang khusus untuk konten tips praktis *step-by-step*, berkebun perkotaan (*urban farming*), penanganan bahan dapur (*food prep*), dan trik hemat energi rumah tangga dengan nuansa alam yang hangat, ramah, dan sangat interaktif.

## Ciri Khas Visual
1. **Latar Belakang Teras Kebun Bertingkat (`terraceBg`)**:
   - Langit biru toska cerah (`#7dd3fc` $\rightarrow$ `#38bdf8`) dengan matahari terbit hangat, awan lembut berarak, dan bukit hijau bergelombang (`#4ade80`, `#22c55e`).
   - Lantai teras tanah liat terracotta berjenjang (*stepped terrace garden*) di bagian bawah (`#fb923c` $\rightarrow$ `#f97316`) dengan garis bibir tangga terang.
2. **Kartu Langkah Frosted Glass (`stepCard`)**:
   - Panel putih semi-transparan (`rgba(255, 255, 255, 0.92)`) di area fokus utama (`cx: 540, cy: 450, w: 960, h: 560`) berbayang lembut dan sudut tumpul 36px.
   - Dilengkapi *pill badge* penanda langkah (`LANGKAH 1/5`, `MASALAH KULKAS`, dll.) dengan kode warna dinamis.
3. **Kuis Interaktif Pilihan Ganda (`interactiveQuiz`)**:
   - Komponen kuis 3 pilihan (A, B, C) dengan bar hitungan mundur (*countdown timer*) kuning tebal untuk memancing retensi penonton dan komentar.
   - Animasi pengungkapan jawaban (*reveal correct*) dengan penanda hijau terang dan centang besar.
4. **Komparasi Dua Kolom (`splitComparison`)**:
   - Perbandingan berdampingan (*Do vs Don't*) dengan kartu merah kesalahan umum (`✖`) vs kartu hijau cara tepat (`✔`).
5. **Kotak Narasi Karaoke Panggung Tengah (`karaokeCard`)**:
   - Kotak gelap bernuansa zaitun tua (`#2d3627`) di `cx: 540, cy: 1100, w: 920, h: 220` dengan tipografi putih tebal dan kata kunci penting yang di-stabilo dengan *pill* kuning (`#facc15`).
6. **Maskot Benih/Jeruk Imut (`sproutMascot`)**:
   - Karakter benih bulat oranye imut dengan dua helai daun tunas hijau di kepala, pipi merona merah muda, dan ekspresi adaptif (`think` garuk kepala, `shock` kaget terbelalak, `happy` melambai ceria).
7. **Standar Full-Screen 8-Adegan**:
   - Resolusi vertikal penuh 1080x1920 (tanpa panel hitam bawah).
   - Kartu edukasi mengambang (*Floating Callout*) di `y: 1485` (`h: 165`).
   - *Safe-zone* takarir (*captions*) di `y: 1700`.

## Komponen Utama `kit.js`
- `PAL`: Palet warna terakota hangat (`terracotta: '#ea580c'`, `soilDark: '#78350f'`, `greenSuccess: '#16a34a'`, `yellowPill: '#facc15'`, `redDanger: '#dc2626'`).
- `withCamera(ctx, { zoom, fx, fy }, fn)`: Kamera sinematik dinamis untuk transisi zoom dan penekanan objek tips.
- `terraceBg(ctx, t, { horizonY })`: Pemandangan langit cerah dan teras kebun berundak.
- `stepCard(ctx, cx, cy, w, h, { stepBadge, badgeCol, fnContent })`: Wadah kartu langkah dengan header pill.
- `interactiveQuiz(ctx, cx, cy, w, h, { title, options, selected, revealAnswer, timerProgress })`: Modul kuis pilihan ganda A/B/C dan timer bar.
- `splitComparison(ctx, cx, cy, w, h, { leftTag, leftTitle, leftItems, rightTag, rightTitle, rightItems })`: Kartu komparasi *Do & Don't*.
- `karaokeCard(ctx, cx, cy, w, h, { lines, highlights })`: Kotak teks narasi karaoke dengan sorotan kata kunci.
- `sproutMascot(ctx, x, y, { scale, pose, t })`: Karakter maskot tunas ekspresif.
- `kebunCallout(ctx, cx, cy, w, h, { tag, title, desc, stat, statSub, col, a })`: Kartu data edukasi melayang di `y: 1485`.

## 3 Demo Produksi (Voice `el-id-m`, Musik `lofi`)
1. **`demo1`**: *Trik Basmi Kutu Putih Tanpa Racun Kimia — Daun Bersih Bebas Hama*
   - Serangan bercak kapas kutu putih (mealybugs) & semut, bahaya pestisida sintetis keras vs racikan dapur alami, 1 sdt sabun cuci piring (surfaktan pelarut lilin), 1 sdt minyak sayur (perekat penutup spirakel napas), kocok emulsi putih keruh, jadwal semprot balik daun pagi/sore, dan kuis simbiosis mutualisme semut & embun madu kutu.
2. **`demo2`**: *Trik Sayuran Kulkas Awet Segar Hingga 1 Bulan — Anti Kuning & Busuk*
   - Sayur lembek berlendir dalam 3 hari, pantangan mencuci basah sebelum simpan, potong pangkal 1 cm, bungkus tisu dapur kering serap embun, simpan kotak kedap udara, posisi laci crisper bawah (4-7°C), dan kuis bahaya gas etilen pisang.
3. **`demo3`**: *Trik Hemat Listrik AC Rumah Hingga 40% — Tagihan Bulanan Terjun Bebas*
   - Tagihan PLN membengkak, jebakan suhu 16°C vs ideal 24-25°C, aktifkan mode Dry saat gerah lembap, cuci saringan filter 2 minggu sekali, sinergi kipas angin kecepatan rendah, tirai gorden tebal, dan kuis inrush watt tarikan awal kompresor.

