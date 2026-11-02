---
id: blueprint
name: Cetak Biru
no: 52
source: github:wireframe-blueprint + blueprint-technical-draft
family: data
tech: canvas2d
music: cinematic   voice: id-m   captions: clean (kotak biru tua, garis cyan)
best_for: cara membangun sesuatu, teknik kuno, penemuan, arsitektur, mesin, proses produksi, "bagaimana dibuat"
---
# Cetak Biru

**Ciri khas (look):** tiga tinta. **Pensil**: grafit #3a3934 di kertas krem #ece5d3 bergrid biru (garis tiap 30 px, tebal tiap 150 px), goresan dua lapis yang sedikit goyang. **Cetak biru**: biru Prusia #0f3d73 dengan garis putih #eef5ff, garis ukur cyan #9fe3ff, arsiran 45°, aksen kuning #ffd36b. **Hologram**: hitam #03080d dengan garis cyan #45f0dd berinti putih dan scanline. Selalu ada bingkai gambar bertanda skala, label "FIG. 0X — JUDUL", nomor lembar, anotasi mono (JetBrains Mono), garis dimensi dengan panah, dan stempel merah "TEORI".

**Gerak (motion):** **garis menggambar dirinya** dengan ujung pena terlihat, arsiran terisi bertahap, garis dimensi tumbuh dari tengah lalu angkanya muncul, catatan diketik huruf demi huruf, figur teknis berjalan menarik tali. Pergantian adegan memakai **scan line**: satu garis horizontal menyapu layar dan mengubah tinta pensil → cetak biru → hologram. Kamera tetap tenang seperti meja gambar (hanya dorongan pelan).

**Kenapa menarik:** rasa "rahasia teknik terbongkar" dan kepuasan melihat sesuatu dibangun garis demi garis; palet biru-putih langsung dikenali dan berbeda dari feed lain.

**Cerita yang cocok:**
- Piramida Giza: "2 juta lebih blok batu. Tanpa roda, tanpa besi."
- Candi Borobudur tanpa semen: "Dua juta batu yang dikunci seperti puzzle."
- Rumah gadang tahan gempa: "Tanpa paku, dan gempa tak bisa merobohkannya."
- Kapal pinisi: "Dibangun tanpa gambar kerja. Semua di kepala."
- Mesin uap pertama, jembatan gantung, sumur bor kuno.

**Rumus hook:** "[Angka raksasa] [bahan]. Tanpa [teknologi modern]." / "Bagaimana [orang zaman dulu] membangun [hal mustahil]?" / "[Struktur] ini berdiri [X] tahun tanpa [hal yang kita kira wajib]."

**Kit API (`styles/blueprint/kit.js`):**
- `PAL`, `INK[mode]`, `pr`; mode = `'pencil' | 'blue' | 'holo'`.
- `sheet(ctx, mode)`: kertas/latar + grid + bingkai bertanda (cache); `scanTransition(ctx, u, from, to, drawFn)`: transisi scan line antar-tinta.
- `path(ctx, pts, p, mode, {w, closed, dash, color})`: garis yang menggambar diri (pensil dua lapis, hologram bercahaya); `line`, `rect`.
- `hatch(ctx, poly, p, mode, {gap, angle})`, `dim(ctx, x0, y0, x1, y1, text, p, mode, {off})`, `note(ctx, text, x, y, p, mode, {leader})`, `figLabel(ctx, fig, title, mode, p, sheetNo)`, `stamp(ctx, text, x, y, p)`.
- Subjek: `pyramid(ctx, cx, by, w, h, p, mode, {courses})`, `block`, `sledge`, `worker(ctx, x, y, s, phase, mode, {dir, pour})`: figur penarik/penuang air, `wheel`, `crossOut`, `wirePyramid(ctx, cx, cy, size, yaw, p, mode, {pitch})`: piramida kawat 3D.

**Demo:** "Bagaimana Piramida Giza Dibangun", 19,8 detik. Sketsa pensil piramida menggambar diri, "2.300.000 blok (perkiraan)", roda dan besi dicoret → scan line ke cetak biru: kereta luncur kayu ditarik tim, penuang air membasahi pasir, "≈ 2,5 t" → perbandingan pasir kering (8 penarik) vs basah (4 penarik, uji lab Univ. Amsterdam 2014) → tiga teori landai (lurus, zigzag, melingkar) dengan stempel TEORI → scan line ke hologram: piramida kawat berputar dan berhenti, "146 m", kompas U, "selisih ±0,06° dari utara sejati".
- **Demo 2 — "Denah Rumah Tipe 36"** (`demo-rumah/`, 21 dtk): 6×6 m, ruang tamu + 2 kamar + dapur + KM, skala 1:200. Voice el-id-m.
- **Demo 3 — "Jembatan Gantung"** (`demo-jembatan/`, 20 dtk): kabel utama, menara, dek, kabel catenary + 12 hanger. Voice el-id-m.
