---
id: stickman-doodle
name: Stickman Doodle
no: 65
source: github:hand-drawn-doodle
family: craft
tech: canvas2d
music: lofi   voice: id-m   captions: hand
best_for: psikologi sehari-hari, kebiasaan & produktivitas, uang, hubungan, relatable/lucu, "kenapa kita begini"
---
# Stickman Doodle

**Ciri khas (look):** halaman buku tulis bergaris (krem #f7f1e3, garis biru, margin merah dobel). Spidol hitam (#1f1f22)
tebal dan tegas; dua aksen spidol: merah (#e0412f) dan biru (#2f6fd6), sedikit isi warna (otak merah muda, alarm merah,
awan abu). Tulisan tangan 'Patrick Hand', judul/teriakan 'Permanent Marker'. Stickman dengan kepala bulat dan wajah
ekspresif (kaget, cemas, ragu, nyengir, bahagia).

**Gerak (motion):** **semua garis "boil"** (bergetar 12 kali per detik) sehingga gambar terasa hidup walau diam. Spidol
sungguhan menulis judul, coretan merah, dan gambar secara live. Tokoh berakting: tangan ke kepala, melompat, mendorong;
keringat terbang, garis gerak, gelembung bicara yang meletup (teriakan bergerigi), awan hujan yang mengikuti, angka timer
yang berjalan. Kamera menggulir turun halaman buku, satu panel per kalimat, goyang saat teriakan.

**Kenapa menarik:** lucu, jujur, sangat mudah dibaca di HP. Penonton melihat dirinya sendiri di stickman itu, jadi
pesannya kena tanpa terasa menggurui.

**Cerita yang cocok:**
- Menunda-nunda: "Kamu bukan pemalas. Otakmu cuma kabur dari rasa tidak enak."
- Jebakan diskon: "Harga coret itu dibuat untuk menipu otakmu."
- Kenapa susah tidur setelah main HP.
- Efek Dunning-Kruger: "Makin sedikit tahu, makin yakin."
- Kenapa gaji naik tapi tabungan tetap.

**Rumus hook:** "Kamu bukan [label negatif]. [Bagian otak/sistem] cuma sedang [melakukan hal lucu]." /
"Kenapa kita selalu [kebiasaan]?" / "Triknya bukan [jawaban umum]. Tapi [hal kecil]."

**Kit API (`styles/stickman-doodle/kit.js`):**
- `setBoil(t)` sekali per frame; `Sketch` (`.line`, `.text`, `.hatch`, `.at`, `.draw`), `Pen` + `markerFor(ctx, st, {s})`: spidol mengikuti goresan.
- `stick(pose)` / `stickDraw(ctx,pose,t,{reveal})` / `stickTip`: stickman spidol (wajah, rambut, pose).
- `mline(ctx,pts,{w,col,seed})`, `mtext(ctx,str,x,y,{size,font,col})`: garis/tulisan spidol langsung dengan boil.
- Doodle: `sweat`, `motion`, `bubble(ctx,x,y,w,h,tx,ty,str,{a,shout})`, `cloud(ctx,x,y,t,{label,rain})`, `brainGuy(ctx,x,y,t,{run})`, `marker`.
- `notebook(ctx)`, `notebookTile`, `cam`, `viewRect`, `G`.

**Demo:** "Kenapa Kita Menunda-nunda?", 19,6 detik, 5 panel. "PEMALAS?" dicoret merah, otak merah muda kabur dari awan
"nggak enak" → kertas TUGAS "besok!", alarm amigdala berteriak "KABUR!!", stickman panik berkeringat → main HP "ahh~",
awan "bersalah" menghujani, tumpukan tugas membesar → "mood?" dicoret, timer biru 5:00 berjalan, "5 menit aja!" →
mendorong batu TUGAS yang mengecil jadi kerikil, "cuma 5 menit!" dan centang merah, stickman bersorak.
