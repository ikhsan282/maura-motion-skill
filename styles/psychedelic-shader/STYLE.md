---
id: psychedelic-shader
name: Psychedelic Shader
no: 48
source: github:psychedelic-glitch + shader-psychedelia
family: shader
tech: canvas2d
music: ambient   voice: el-id-m   captions: neon
best_for: seni matematis GLSL, fraktal Mandelbrot & Julia, paradoks geometri & dimensi pecahan, pola morfogenesis Turing & gelombang kimia Belousov-Zhabotinsky
---
# Psychedelic Shader

**Ciri khas (look):** Seni matematis bergaya *fragment shader* GLSL: fraktal Mandelbrot dan Julia *real-time* dengan pewarnaan *smooth escape-time* dan *orbit trap*, palet kosinus psikedelik (Inigo Quilez cosine palette), mandala kaleidoskop simetri lipat-$N$, kurva rekursif *Koch Snowflake*, simulasi gelombang reaksi-difusi Turing & spiral *Belousov-Zhabotinsky*, serta bingkai HUD neon bertag `GLSL // *.FRAG`.

**Gerak (motion):** *Deep zoom* kontinu ke lembah fraktal (*Seahorse Valley* & *Minibrot*), pergeseran fasa warna *hue cycling* mengikuti waktu $t$, rotasi mandala berlawanan arah, serta perambatan gelombang spiral kimia.

**Kenapa menarik:** Mengubah rumus matematika abstrak ($z = z^2 + c$, dimensi Hausdorff $D = 1{,}25$, PDE reaksi-difusi) menjadi visual hipnotis yang langsung menghentikan *scroll* sejak detik pertama.

**Cerita yang cocok:**
- Satu Rumus, Gambar Tanpa Akhir: "Rumus sependek ini menyimpan gambar yang tak pernah habis sedalam apa pun di-zoom."
- Paradoks Garis Pantai & Dimensi Fraktal: "Mengapa panjang garis pantai menuju tak terhingga jika diukur dengan penggaris makin kecil?"
- Pola Turing & Reaksi Belousov-Zhabotinsky: "Bagaimana sel kulit zebra tahu di mana harus menggambar belang tanpa penggaris?"

**Rumus hook:** "Rumus sependek ini menyimpan [fenomena tak terbatas]." / "Pertanyaan sepele tentang [objek alam] ini ternyata menjebak ilmuwan dalam paradoks matematika."

**Kit API (`styles/psychedelic-shader/kit.js`):**
- Shader & Fraktal: `shaderStage(ctx, t, {titleTxt, subTxt, tag, tunnel})`, `drawFractalViewport(ctx, x, y, r, t, {mode, cx, cy, zoom, juliaRe, juliaIm, maxIter, hueShift})`, `drawKaleidoscope(ctx, x, y, r, t, {folds, layers})`, `drawKochSnowflake(ctx, x, y, r, depth, t, {col})`, `iqColor(t, shift)`, `hudCard(ctx, x, y, w, h, titleStr, subStr, {col, p})`.
- Kompatibilitas: `PAL`, `bg`, `title`, `label`, `blob`, `ring`, `card`.

**Daftar Demo:**
- **Demo 1 (`demo1/`):** *Satu Rumus, Gambar Tanpa Akhir — Himpunan Mandelbrot & Keajaiban Fraktal* (~64 dtk) — Iterasi bilangan kompleks $z_{n+1} = z_n^2 + c$, cetakan komputer pertama Benoit Mandelbrot di laboratorium IBM (1 Maret 1980), pewarnaan *escape-time* di *Seahorse Valley*, hingga kemunculan pulau *Minibrot* (*self-similarity*) di kedalaman zoom.
- **Demo 2 (`demo2/`):** *Pantai yang Panjangnya Tak Terhingga — Paradoks Garis Pantai & Dimensi Fraktal Alam* (~64 dtk) — Efek penggaris Richardson, kurva Kepingan Salju Koch (*keliling tak terhingga di dalam luas terbatas*), dimensi pecahan Hausdorff ($D = 1{,}25$ pada pantai Inggris), hingga 23 generasi percabangan fraktal bronkus paru-paru manusia yang memuat luas $70\text{ m}^2$ setara lapangan tenis.
- **Demo 3 (`demo3/`):** *Rumus di Balik Belang Zebra & Gelombang Kimia — Pola Turing & Reaksi Belousov* (~65 dtk) — Makalah morfogenesis Alan Turing (1952) tentang tarian aktivator-inhibitor, osilator spiral kimia Boris Belousov dan Anatol Zhabotinsky, simulasi shader *Gray-Scott*, hingga bukti biologi molekuler pada belang ikan zebra.
