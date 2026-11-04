---
id: flat-vector
name: Ilustrasi Vektor Datar
no: 39
source: github:flat-vector-explainer + flat-vector-kurzgesagt
family: 2D
tech: canvas2d
music: ambient   voice: el-id-m   captions: bold (anim rise)
best_for: sains populer, astronomi, biologi, keuangan populer, "bagaimana cara kerja", perbandingan skala dan waktu
---
# Ilustrasi Vektor Datar

**Ciri khas (look):** ilustrasi datar tanpa outline, isian gradien dua titik (terang di kiri atas), glow lembut dari sprite yang di-cache. Latar luar angkasa navy pekat #060b22 → #1c2a66 dengan bintang berkelip; aksen hangat matahari #fff7d1 / #ffd65e / #ffa63f / #f46a3a, ungu sinar gamma #8f7bff, teal #3fd6c6. Tokoh bulat bermata titik dengan pipi merah muda (foton, orang berponi). Label berupa "pill" semi-transparan, angka besar Poppins 800, ikon datar (piramida, gandum, lukisan gua).

**Gerak (motion):** semua bergerak halus dengan ease in/out; tokoh squash & stretch searah kecepatan, berkedip, mengangguk pelan. Gerak khas: **potongan irisan** (wedge) yang membuka isi planet/bintang, **zoom-through**, pop-in dengan overshoot, counter yang bergulir, dan **simulasi sungguhan** (random walk deterministik).

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

## Paket Demo (30–90 Detik)
1. **`demo1/` — *Ke Mana Perginya Rp100 Ribu? — Misteri Bocor Halus di Dompet Kita*** (~62 dtk, 6 babak): Pipa aliran uang seratus ribu rupiah ke bensin (-30rb), jajan kopi & gorengan (-25rb), parkir & tol (-15rb), serta fenomena *bocor halus* (-30rb).
2. **`demo2/` — *Peta Isi Kepala Pas Macet — Anatomi Pikiran Saat Terjebak di Jalanan Sore*** (~62 dtk, 6 babak): Diagram pai isi kepala pejuang komuter saat macet pukul 17:30 — mengeluh 40%, lapar 30%, mengantuk 20%, dan memikirkan tenggat kerjaan 10%.
3. **`demo3/` — *Cahaya di Wajahmu Lebih Tua dari Peradaban — Perjalanan 170.000 Tahun Sebutir Foton*** (~65 dtk, 7 babak): Lahirnya foton dari fusi hidrogen di inti Matahari (15 juta °C), terjebak *random walk* menabrak plasma di zona radiasi selama 170.000 tahun, lalu melesat 8 menit 20 detik menuju Bumi.
