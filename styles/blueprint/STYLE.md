---
id: blueprint
name: Cetak Biru
no: 52
source: github:wireframe-blueprint + blueprint-technical-draft
family: data
tech: canvas2d
music: cinematic   voice: el-id-m   captions: clean (kotak biru tua, garis cyan)
best_for: cara membangun sesuatu, teknik kuno, penemuan, arsitektur, mesin, proses produksi, "bagaimana dibuat"
---
# Cetak Biru

**Ciri khas (look):** tiga tinta. **Pensil**: grafit #3a3934 di kertas krem #ece5d3 bergrid biru (garis tiap 30 px, tebal tiap 150 px), goresan dua lapis yang sedikit goyang. **Cetak biru**: biru Prusia #0f3d73 dengan garis putih #eef5ff, garis ukur cyan #9fe3ff, arsiran 45°, aksen kuning #ffd36b. **Hologram**: hitam #03080d dengan garis cyan #45f0dd berinti putih dan scanline. Selalu ada bingkai gambar bertanda skala, label "FIG. 0X — JUDUL", nomor lembar, anotasi mono (JetBrains Mono), garis dimensi dengan panah, dan stempel merah "TEORI" / "SKALA".

**Gerak (motion):** **garis menggambar dirinya** dengan ujung pena terlihat, arsiran terisi bertahap, garis dimensi tumbuh dari tengah lalu angkanya muncul, catatan diketik huruf demi huruf, figur teknis berjalan menarik tali. Pergantian adegan memakai **scan line**: satu garis horizontal menyapu layar dan mengubah tinta pensil → cetak biru → hologram. Kamera tetap tenang seperti meja gambar (hanya dorongan pelan).

**Kenapa menarik:** rasa "rahasia teknik terbongkar" dan kepuasan melihat sesuatu dibangun garis demi garis; palet biru-putih langsung dikenali dan berbeda dari feed lain.

**Cerita yang cocok:**
- Piramida Giza: "2 juta lebih blok batu. Tanpa roda, tanpa besi."
- Denah Rumah Tipe 36: "6×6 meter yang memuat 5 ruang fungsional tanpa ruang terbuang."
- Jembatan Gantung: "Bagaimana kabel melengkung menahan ribuan kendaraan tanpa tiang tengah?"
- Candi Borobudur tanpa semen: "Dua juta batu yang dikunci seperti puzzle."
- Rumah gadang tahan gempa: "Tanpa paku, dan gempa tak bisa merobohkannya."

**Rumus hook:** "[Angka raksasa] [bahan]. Tanpa [teknologi modern]." / "Bagaimana [orang zaman dulu] membangun [hal mustahil]?" / "[Struktur] ini berdiri [X] tahun tanpa [hal yang kita kira wajib]."

**Kit API (`styles/blueprint/kit.js`):**
- `PAL`, `INK[mode]`, `pr`; mode = `'pencil' | 'blue' | 'holo'`.
- `sheet(ctx, mode)`: kertas/latar + grid + bingkai bertanda (cache); `scanTransition(ctx, u, from, to, drawFn)`: transisi scan line antar-tinta.
- `path(ctx, pts, p, mode, {w, closed, dash, color})`: garis yang menggambar diri (pensil dua lapis, hologram bercahaya); `line`, `rect`.
- `hatch(ctx, poly, p, mode, {gap, angle})`, `dim(ctx, x0, y0, x1, y1, text, p, mode, {off})`, `note(ctx, text, x, y, p, mode, {leader})`, `figLabel(ctx, fig, title, mode, p, sheetNo)`, `stamp(ctx, text, x, y, p)`.
- Subjek: `pyramid(ctx, cx, by, w, h, p, mode, {courses})`, `block`, `sledge`, `worker(ctx, x, y, s, phase, mode, {dir, pour})`: figur penarik/penuang air, `wheel`, `crossOut`, `wirePyramid(ctx, cx, cy, size, yaw, p, mode, {pitch})`: piramida kawat 3D.

**Demo (3 variasi, 63–64 detik, voice `el-id-m`):**
- **Demo 1 — "Bagaimana Piramida Giza Dibangun — 2,3 Juta Blok Batu Tanpa Roda dan Besi"** (`demo1/`, ~63 dtk): Sketsa pensil piramida menggambar diri, "2.300.000 blok", roda dan besi dicoret → scan line ke cetak biru: kereta luncur kayu ditarik tim di pasir basah ("≈ 2,5 t") → perbandingan pasir kering (8 penarik) vs basah (4 penarik, uji lab Univ. Amsterdam 2014) → tiga teori landai (lurus, zigzag, melingkar) dengan stempel TEORI → scan line ke hologram: piramida kawat berputar mengunci ke utara sejati ("146 m", selisih ±0,06°).
- **Demo 2 — "Denah Rumah Tipe 36 — Rahasia Tata Ruang 6×6 Meter yang Muat 5 Ruangan"** (`demo2/`, ~63 dtk): Sketsa pensil denah 6×6 m (36 m²) → cetak biru zona hidup (ruang tamu + 2 kamar tidur 3×3 m), zona servis (dapur + KM dengan 1 jalur pipa lurus), skala 1:200 (1 cm = 0,5 m) dengan stempel SKALA → hologram denah akhir 5 ruang.
- **Demo 3 — "Jembatan Gantung — Rahasia Kabel Lengkung yang Menahan Beban Tanpa Tiang Tengah"** (`demo3/`, ~64 dtk): Sketsa pensil bentang jembatan → cetak biru distribusi beban kabel utama ke dua menara kembar & tanah, dek jalan raya pada 12 kabel penggantung vertikal, kurva parabola akibat gravitasi (stempel GRAVITASI) → hologram bentang panjang tanpa tiang tengah.
