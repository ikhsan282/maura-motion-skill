---
id: papan-tulis-kapur
name: Papan Tulis Kapur
no: 23
source: drive:23_Papan_Tulis_Kapur
family: craft
tech: canvas2d
music: lofi   voice: id-m   captions: chalk
best_for: matematika & peluang, paradoks, sains sekolah, "guru seru", trik hitung, ekonomi sederhana
---
# Papan Tulis Kapur

**Ciri khas (look):** papan tulis hijau slate (#2c5643) dengan bekas hapusan lama yang berawan, bingkai kayu, rak kapur
berisi kapur putih/kuning/merah muda/biru dan penghapus, dinding krem di luar papan. Kapur putih (#f3f2ea) bertekstur
kering dan putus-putus dengan halo debu tipis; aksen kapur kuning (#f5da62) untuk angka kunci, merah muda dan biru untuk
penanda kedua. Tulisan tangan 'Kalam'. Murid dan guru adalah stick figure dari kapur.

**Gerak (motion):** tulisan dan diagram ditulis live oleh **sebatang kapur** yang mengikuti goresan dan menjatuhkan debu.
Penghapus flanel menyapu bolak-balik dan meninggalkan jejak awan kapur (hantu tulisan lama). Guru stickman menunjuk
dengan tongkat, bicara (mulut bergerak), menaruh tangan di pinggang; murid bereaksi: kaget "?!", ragu, "WOW!", bersorak
dan melompat. Papan lebih lebar dari layar: kamera bergeser ke sisi kanan papan lalu mundur memperlihatkan seluruh papan.
Garis sedikit "boil" (hidup) on twos.

**Kenapa menarik:** energi kelas dengan guru yang asyik: penonton jadi murid. Angka besar kuning yang dilingkari dan
reaksi murid membuat paradoks terasa dramatis.

**Cerita yang cocok:**
- Paradoks ulang tahun: "23 orang di kelas? Peluang kembar ulang tahun: 50 persen."
- Masalah Monty Hall: "Pindah pintu menggandakan peluang menangmu."
- Bunga majemuk: "Uang 1 juta bisa jadi 17 juta tanpa kamu tambah."
- Kenapa 0,999... sama dengan 1.
- Lipat kertas 42 kali sampai ke bulan.

**Rumus hook:** "[Angka kecil]... dan hasilnya [angka besar yang tak masuk akal]." / "Intuisimu bilang A. Matematika bilang B." /
"Coba hitung ini di kelasmu besok."

**Kit API (`styles/papan-tulis-kapur/kit.js`):**
- `Sketch` (sama seperti kit hand-drawn lain, dirender sebagai kapur): `.line`, `.red` (= kapur kuning), `.hatch`, `.text`, `.erase(path,{w,targets})` = sapuan penghapus, `.draw(ctx,t)`.
- `Pen` + `handFor(ctx, st, t, {s})`: kapur (atau penghapus saat menghapus) mengikuti goresan; `dust(ctx, pen, t)`: debu kapur jatuh.
- `stick(pose)`, `stickDraw(ctx,pose,t,{reveal})`, `stickTip(pose,reveal)`: stick figure (wajah smile/grin/open/shock/worried/skeptic/happy, rambut tuft/spiky/pony/cap/bun, kacamata, tongkat penunjuk).
- `board(ctx,rect)` (dinding, bingkai, slate, rak kapur), `chalkStick`, `duster`, `chalkText`, `chalkLine`, `chalkPattern`, `boardPattern`, `cam`, `viewRect`, `G`, `jagged`.

**Demo:** "Paradoks Ulang Tahun", 19,5 detik, 5 shot. Judul kuning, "23 orang", lima murid digambar, dua kue ulang tahun,
"50%" dilingkari, murid kaget → hapus, kalender, "365 hari", murid: "Mustahil!" → penghapus menyapu papan, 23 titik
melingkar dan 253 garis pasangan tergambar dengan penghitung → pasangan berkedip kuning, termometer naik ke 50% →
kamera bergeser ke kurva peluang, 23→50%, 70→"99,9%" dilingkari → mundur ke seluruh papan, semua bersorak.
