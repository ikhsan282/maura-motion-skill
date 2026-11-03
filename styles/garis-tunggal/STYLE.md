---
id: garis-tunggal
name: Monoline Satu Garis
no: 61
source: github:monoline-line-art
family: craft
tech: canvas2d
music: lofi   voice: id-f   captions: clean
best_for: psikologi & kebiasaan, refleksi, konsep sederhana yang saling terhubung, produktivitas, filosofi hidup
---
# Monoline Satu Garis

**Ciri khas (look):** kertas putih hangat (#f7f4ee) dengan butiran halus dan banyak ruang kosong. Satu garis hitam tipis
(#1c1c1e, tebal seragam ~5 px) yang tidak pernah terangkat menggambar semua objek. Satu aksen merah (#d93a2b): titik awal,
notifikasi, hati, dan belokan terakhir. Label kecil huruf kapital berjarak lebar (Inter 600, abu-abu #8b877f).

**Gerak (motion):** sebuah fine-liner hitam memimpin ujung garis; garis berkelana, membuat simpul, lalu masuk ke gambar
berikutnya tanpa putus (ponsel → jari → wajah tersenyum → hati → panah kembali ke ponsel = lingkaran). Bagian garis bisa
bergerak (jari menggulir layar). Bagian lama bisa memudar saat diganti (jari pudar, buku muncul). Kamera mengikuti ujung
pena dengan halus, lalu mundur untuk memperlihatkan seluruh lingkaran. Render penuh 24 fps (hold 1) supaya garisnya mulus.

**Kenapa menarik:** sangat tenang dan memuaskan untuk ditonton: mata mengikuti satu garis sampai akhir. Garis yang tak
terputus sendiri menjadi metafora (kebiasaan, hubungan, perjalanan).

**Cerita yang cocok:**
- Lingkaran kebiasaan: "Setiap kebiasaan dimulai dari satu garis kecil."
- Efek kupu-kupu: "Satu kepakan kecil bisa jadi badai."
- Siklus air dalam satu garis.
- Perjalanan karier yang berbelok: "Rencanamu tidak harus lurus."
- Ikigai: empat lingkaran, satu garis.

**Rumus hook:** "Setiap [hal besar] dimulai dari satu [hal kecil]." / "[A] terhubung ke [B] dengan satu garis." /
"Kamu tidak perlu memutus [X]. Cukup belokkan."

**Kit API (`styles/garis-tunggal/kit.js`):**
- `new Line()`: `.add(pts | (t)=>pts, a, b, {col, fade})` segmen berurutan (satu garis), `.draw(ctx,t)` → ujung garis, `.tip(t)`.
- Ikon satu garis: `phone`, `finger(bx,by,tx,ty)`, `face` + `faceEyes`, `heart`, `book`, `arrowTip`; geometri `spline`, `arc`, `rrect`, `join`, `partial`, `lengths`.
- `paper`, `paperTile`, `fineliner(ctx,x,y)`, `label(ctx,str,x,y,{a})`, `cam`.

**Demo:** "Lingkaran Kebiasaan", 17,6 detik, 5 shot. Titik merah, garis berkelana dan membuat simpul → ponsel dengan
notifikasi merah "PEMICU" → jari meraih dan menggulir "RUTINITAS", wajah tersenyum dan hati merah "HADIAH", panah kembali
ke ponsel → jari memudar, garis yang sama menggambar buku terbuka "BACA BUKU" → garis berbelok merah ke atas, kamera
mundur memperlihatkan seluruh gambar.
- **Demo 2 — "Burung Satu Garis"** (`demo-burung/`, 20 dtk): paruh + sayap flap + jalur terbang merah. Voice el-id-m.
- **Demo 3 — "Tangan Satu Garis"** (`demo-tangan/`, 19 dtk): 5 jari + kepalan + lambaian. Voice el-id-m.
