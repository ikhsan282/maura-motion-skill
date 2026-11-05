---
id: garis-tunggal
name: Monoline Satu Garis
no: 61
source: github:monoline-line-art
family: craft
tech: canvas2d
music: lofi   voice: el-id-m   captions: clean
best_for: psikologi & kebiasaan, refleksi, konsep sederhana yang saling terhubung, produktivitas, filosofi hidup
---
# Monoline Satu Garis (`garis-tunggal`)

**Ciri khas (look):** kertas putih hangat (`#f7f4ee`) dengan butiran halus dan ruang kosong yang lega. Satu garis hitam tipis (`#1c1c1e`, tebal seragam ~5 px) yang tidak pernah terangkat menggambar seluruh objek secara berkesinambungan. Satu aksen merah (`#d93a2b`) menandai titik awal, notifikasi pemicu, inti aksi, dan belokan keputusan terakhir.

**Gerak (motion):** pena *fine-liner* hitam memimpin ujung garis; garis berkelana, membuat simpul, lalu masuk ke gambar berikutnya tanpa terputus. Bagian garis dapat bergerak hidup (ibu jari menggulir layar, sayap burung mengepak, jari tangan melambai). Kamera mengikuti ujung pena dengan halus lalu mundur untuk memperlihatkan keseluruhan gambar.

## Kit API (`styles/garis-tunggal/kit.js`)
- `new Line()`: `.add(pts | (t)=>pts, a, b, {col, fade})` merangkai segmen satu garis kontinu, `.draw(ctx,t)` menggambar dan mengembalikan posisi ujung pena, `.tip(t)`.
- Ikon satu garis: `phone`, `finger(bx,by,tx,ty)`, `face` + `faceEyes`, `heart`, `book`, `arrowTip`; geometri `spline`, `arc`, `rrect`, `join`, `partial`, `lengths`.
- `paper`, `paperTile`, `fineliner(ctx,x,y)`, `label(ctx,str,x,y,{a})`, `headerCard(ctx,stepStr,titleStr,subStr)`, `cam`.

## Demo (30–90 Detik)
- **Demo 1 — "Lingkaran Kebiasaan — Mengapa Otak Sulit Memutus Rutinitas tapi Mudah Membelokkannya"** (`demo1/`, ~64 dtk): Anatomi *Habit Loop* (Pemicu → Rutinitas → Hadiah) lewat satu garis tanpa putus dari notifikasi ponsel ke guliran jari, dopamin, hingga belokan menuju buku terbuka. Voice `el-id-m`.
- **Demo 2 — "Burung Satu Garis — Bagaimana Satu Tarikan Kecil Melahirkan Kepakan Terbang Tinggi"** (`demo2/`, ~64 dtk): Filosofi memulai dari titik terkecil: satu garis membentuk paruh, kepala, tubuh, sayap yang mengepak di arus udara hangat, hingga melesat naik ke angkasa. Voice `el-id-m`.
- **Demo 3 — "Tangan Satu Garis — Rahasia Lima Jari, Genggaman Kuat & Kelenturan Manusia"** (`demo3/`, ~65 dtk): Perjalanan satu garis menggambar telapak dan lima jari manusia, mengepal menjadi genggaman erat berwarna merah, lalu membuka menjadi lambaian hangat. Voice `el-id-m`.
