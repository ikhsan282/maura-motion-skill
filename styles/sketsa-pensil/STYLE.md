---
id: sketsa-pensil
name: Sketsa Pensil
no: 9
source: drive:09_Sketsa_Pensil + github:hand-drawn-sketch
family: craft
tech: canvas2d
music: lofi   voice: el-id-m   captions: hand
best_for: sejarah sains & teknik, biografi penemu, cara kerja mesin, "kenapa X bisa terjadi", catatan belajar
---
# Sketsa Pensil

**Ciri khas (look):** grafit di kertas gambar krem hangat (#f5f1e8, serat halus tanpa sambungan tile). Garis grafit
#232428 bertekstur (gigi kertas memakan goresan), ujung tipis dan bagian tengah lebih gelap (tekanan pensil), sesekali
garis dobel. Garis konstruksi biru muda (#7fa6d6) digambar duluan. Arsiran dan arsiran silang untuk bayangan. Satu aksen:
pensil merah (#c4402b) untuk hal yang penting (retakan, angka kunci). Catatan tulisan tangan 'Caveat'. Tanda lembar
animator di pojok: "SC 09" + nomor frame dalam lingkaran, skala timing di kiri. Cahaya lampu meja hangat dari kiri atas.

**Gerak (motion):** setiap garis menggambar dirinya sendiri di bawah **pensil kuning sungguhan** yang mengikuti ujung
goresan, terangkat dan berpindah di antara goresan (bayangannya ikut menjauh). Pensil berganti merah untuk aksen.
Penggaris bening meluncur masuk untuk garis lurus; penghapus menggosok bolak-balik, meninggalkan noda grafit dan
remah. Kamera bergeser di atas satu lembar kertas panjang dari gambar ke gambar, zoom sampai ke detail sekecil rambut.
Gambar bisa bergerak setelah jadi (pesawat menukik, terbelah dua, terbang), tokoh sketsa bertingkah (on twos, hold 2).

**Kenapa menarik:** rasanya seperti menonton insinyur/guru berpikir di kertas: jujur, cerdas, "buatan tangan" di tengah
video AI yang licin. Proses menggambar itu sendiri bikin penasaran sampai gambar selesai.

**Cerita yang cocok:**
- Faktor Habibie: "Pesawat bisa jatuh karena retakan sekecil rambut."
- Jembatan Tacoma: "Jembatan ini runtuh bukan karena berat... tapi karena angin."
- Da Vinci: "Ia menggambar helikopter 400 tahun sebelum ada mesin."
- Borobudur: "Candi terbesar di dunia dibangun tanpa semen."
- Kenapa kapal baja bisa mengapung: "Besi tenggelam. Kapal dari besi tidak."
- Rumus E=mc² dalam satu halaman sketsa.

**Rumus hook:** "[Benda besar] bisa [gagal] hanya karena [hal kecil]." / "Ia menggambar [X] sebelum [X] mungkin ada." /
"Kenapa [fakta yang terasa mustahil]?"

**Kit API (`styles/sketsa-pensil/kit.js`):**
- `new Sketch({t0, speed, seed, gap, weight})`: gambar berjadwal. `.line(pts,{w,tone,col,double,dur})`, `.red(pts)`, `.blue(pts)` (konstruksi),
  `.hatch(poly,{ang,cross,gap,per})`, `.text(str,x,y,{size,align,cps,rot,col})`, `.erase(path,{w,targets})`, `.at(t)`, `.wait(s)`,
  `.draw(ctx,t,{tx,ty,rot,s,px,py,alpha})` → posisi ujung pensil, `.drawBaked(...)` (raster cache saat sudah selesai), `.end`.
- `Pen`: satu pensil untuk semua sketsa: `.sketch(d, opts)`, `.add(a,b,toolFn)`, `.at(t)`; `pencilFor(ctx, st, t, {s})` menggambar pensilnya.
- `G` (line, arc, circle, ellipse, rect, rrect, spline, bez, xf), `sketchy(pts)`, `hatchLines(poly)`, `jagged(x,y,len,ang)` (retakan), `track/pointAt/tracePart/strokeTrack`.
- `figure(pose)` / `figureDraw(ctx,pose,t,{reveal})` / `figureTip(pose,reveal)`: tokoh sketsa kartun (kepala bulat, kacamata, rambut diarsir, tangan-kaki bertabung; pose duduk/berdiri, ekspresi).
- Properti: `pencil`, `ruler`, `eraser`, `smudge`; kertas: `sheet(ctx,rect)`, `paper`, `light`, `sheetMarks`; `cam`, `viewRect`, `note`, `leadPattern`, `paperPattern`.

**Koleksi Demo (`styles/sketsa-pensil/`):**
- **`demo1` — "Faktor Habibie: Retakan Sekecil Rambut"** (~58 detik, 6 bagian): Jet digambar cepat dan menukik → zoom ke retakan merah `"sekecil rambut"` → `"1954"`, Comet terbelah dua di udara → pelat logam ditebalkan dengan arsiran silang, pesawat keberatan → `"B.J. Habibie"`, insinyur di bangku menggambar kurva rambat retak, penggaris, garis batas bahaya → penghapus menipiskan pelat dan menghapus beban, pesawat terbang, `"-10%"` dilingkari merah → `"Mr. Crack"` dengan retakan merah, tokoh bersorak.
- **`demo2` — "Kenapa Kapal Baja Raksasa Bisa Mengapung? Hukum Archimedes"** (~58 detik, 8 bagian): Perbandingan paku besi 10g tenggelam vs kapal kargo baja 100.000 ton terapung → balok baja padat tenggelam (`W >> FA`) → Archimedes di bak mandi berseru `"EUREKA!"` saat air meluap → rumus `FA = ρ · g · V` digarisbawahi dengan penggaris → penghapus menggosok bagian tengah balok baja menjadi lambung cekung berongga → diagram 5 panah merah gaya apung raksasa → simbol Garis Plimsoll dan kesimpulan `"BENTUK MENCIPTAKAN GAYA APUNG!"`.
- **`demo3` — "Rahasia Konstruksi Candi Borobudur Tanpa Semen"** (~55 detik, 7 bagian): Siluet berundak Candi Borobudur (`2.000.000 Batu Andesit — Tanpa Semen`) → simulasi tumpukan batu polos bergeser saat gempa → tokoh arsitek Gunadharma (abad ke-8) → detail penampang sambungan tanggam & kunci ekor burung (*dovetail*) merah yang mengunci geseran → pipa drainase tersembunyi & pancuran Makara (*Jaladwara*) → vektor distribusi beban piramida berundak mengikuti punggung bukit → kesimpulan `"MAHAKARYA TEKNIK NUSANTARA!"`.
