---
id: flat-vector
name: Ilustrasi Vektor Datar
no: 39
source: github:flat-vector-explainer + flat-vector-kurzgesagt
family: 2D
tech: canvas2d
music: ambient   voice: id-f   captions: bold (anim rise)
best_for: sains populer, astronomi, biologi, "bagaimana cara kerja", perbandingan skala dan waktu, eksplainer anak muda
---
# Ilustrasi Vektor Datar

**Ciri khas (look):** ilustrasi datar tanpa outline, isian gradien dua titik (terang di kiri atas), glow lembut dari sprite yang di-cache. Latar luar angkasa navy pekat #060b22 → #1c2a66 dengan bintang berkelip; aksen hangat matahari #fff7d1 / #ffd65e / #ffa63f / #f46a3a, ungu sinar gamma #8f7bff, teal #3fd6c6. Tokoh bulat bermata titik dengan pipi merah muda (foton, orang berponi). Label berupa "pill" semi-transparan, angka besar Poppins 800, ikon datar (piramida, gandum, lukisan gua).

**Gerak (motion):** semua bergerak halus dengan ease in/out; tokoh squash & stretch searah kecepatan, berkedip, mengangguk pelan. Gerak khas: **potongan irisan** (wedge) yang membuka isi planet/bintang, **zoom-through** (kamera menembus objek lalu adegan berikutnya ada di dalamnya), pop-in dengan overshoot, counter yang bergulir, dan **simulasi sungguhan** (random walk deterministik yang jejaknya makin kusut sementara kamera mundur).

**Kenapa menarik:** gaya penjelas sains yang paling dikenal di YouTube: ramah, jelas di layar HP, dan terasa "pintar". Karakter imut membuat konsep abstrak (foton, sel, atom) punya wajah dan perasaan.

**Cerita yang cocok:**
- Foton dari inti Matahari: "Cahaya di wajahmu lebih tua dari peradaban."
- Perjalanan sebutir oksigen: "Napasmu barusan pernah lewat paru-paru dinosaurus?"
- Kenapa langit biru: "Langit sebenarnya ungu. Matamu yang curang."
- Titik Nemo: "Di titik ini, manusia terdekat sedang melayang di luar angkasa."
- Satu hari di Venus lebih lama dari setahunnya.

**Rumus hook:** "[Benda sehari-hari] ini ternyata [lebih tua/besar/aneh] dari [pembanding]." / "Kalau kamu [ukuran mustahil], [hal biasa] jadi [mengejutkan]." / "[Angka] tahun... hanya untuk [perjalanan pendek]."

**Kit API (`styles/flat-vector/kit.js`):**
- `PAL`, `cam(ctx, z, cx, cy, rot)`, `pop(t, t0, dur)`, `pr(t, a, b)`, `fmt(n)` (format 170.000).
- `glowSprite(color)`, `glow(ctx, x, y, r, color, a, add)`: glow dari sprite cache; `ball(ctx, x, y, r, c0, c1)`: bola bergradien dua titik.
- `space(ctx, t, {top, bottom, px, py})`, `starfield(...)`: latar angkasa + bintang paralaks.
- `photon(ctx, x, y, {r, vx, vy, heat, mood, squash, look})`: tokoh foton (heat 0 = ungu gamma, 1 = kuning), mood happy/joy/wow/dizzy/calm/sleep.
- `face(ctx, x, y, r, {mood, look})`: wajah mata-titik untuk tokoh baru; `person(ctx, x, y, {s, mood, lit, look})`: manusia setengah badan.
- `sun(ctx, x, y, R, t, {cut, a0, open})`: Matahari dengan irisan lapisan (inti, radiasi, konveksi); `sunInterior`.
- `earth(ctx, x, y, r, t, {spin, sunDir})`: bumi datar dengan daratan dan sisi malam.
- `plasma(ctx, t, {...})`: partikel melayang (satu path per warna).
- `randomWalk`, `boundedWalk(seed, n, step, inside)`, `along(P, u)`, `trail(ctx, P, u)`: simulasi jalan acak dan jejaknya.
- `ring`, `burst`, `speedLines`: efek tumbukan dan kecepatan.
- `badge`, `headline`, `callout`, `counter`: label pill, judul, garis penunjuk yang menggambar diri, angka bergulir.
- `icon(ctx, 'pyramid'|'wheat'|'cave'|'clock'|'face', x, y, s)`, `beam(...)`: berkas cahaya; `iris(...)`: transisi lingkaran.

**Demo:** "Cahaya di Wajahmu Lebih Tua dari Peradaban", 19,6 detik, 8 beat. Foton meluncur di berkas cahaya pagi dan mendarat di pipi (piramida "±4.500 tahun lalu") → zoom-through ke Matahari yang terbelah, "INTI 15 juta °C" → lahir dari kilatan fusi lalu menabrak partikel → diserap dan dilepas ke arah acak, jejaknya makin kusut → kamera mundur, penghitung tahun 10.000 → 170.000 (perkiraan) → foton lolos dari permukaan → 08:20 menuju Bumi → kembali ke pipi, judul "LEBIH TUA DARI PERADABAN".
