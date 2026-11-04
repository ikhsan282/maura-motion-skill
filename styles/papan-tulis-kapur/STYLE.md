---
id: papan-tulis-kapur
name: Papan Tulis Kapur
no: 23
source: drive:23_Papan_Tulis_Kapur
family: craft
tech: canvas2d
music: lofi   voice: el-id-m   captions: chalk
best_for: matematika & peluang, paradoks, sains sekolah, "guru seru", trik hitung, ekonomi sederhana
---
# Papan Tulis Kapur

**Ciri khas (look):** papan tulis hijau slate (#2c5643) dengan bekas hapusan lama yang berawan, bingkai kayu, rak kapur berisi kapur putih/kuning/merah muda/biru dan penghapus, dinding krem di luar papan. Kapur putih (#f3f2ea) bertekstur kering dan putus-putus dengan halo debu tipis; aksen kapur kuning (#f5da62) untuk angka kunci, merah muda dan biru untuk penanda kedua. Tulisan tangan 'Kalam'. Murid dan guru adalah stick figure dari kapur.

**Gerak (motion):** tulisan dan diagram ditulis live oleh **sebatang kapur** yang mengikuti goresan dan menjatuhkan debu. Penghapus flanel menyapu bolak-balik dan meninggalkan jejak awan kapur (hantu tulisan lama). Guru stickman menunjuk dengan tongkat, bicara (mulut bergerak), menaruh tangan di pinggang; murid bereaksi: kaget "?!", ragu, "WOW!", bersorak dan melompat. Papan lebih lebar dari layar: kamera bergeser ke sisi kanan papan lalu mundur memperlihatkan seluruh papan. Garis sedikit "boil" (hidup) on twos.

**Kenapa menarik:** energi kelas dengan guru yang asyik: penonton jadi murid. Angka besar kuning yang dilingkari dan reaksi murid membuat paradoks terasa dramatis.

**Cerita yang cocok:**
- Paradoks ulang tahun: "23 orang di kelas? Peluang kembar ulang tahun: 50 persen."
- Masalah Monty Hall: "Pindah pintu menggandakan peluang menangmu."
- Lipat kertas 42 kali sampai ke bulan.

**Rumus hook:** "[Angka kecil]... dan hasilnya [angka besar yang tak masuk akal]." / "Intuisimu bilang A. Matematika bilang B."

**Kit API (`styles/papan-tulis-kapur/kit.js`):**
- `Sketch`: `.line`, `.red` (= kapur kuning), `.hatch`, `.text`, `.erase(path,{w,targets})` = sapuan penghapus, `.draw(ctx,t)`.
- `Pen` + `handFor(ctx, st, t, {s})`: kapur (atau penghapus saat menghapus) mengikuti goresan; `dust(ctx, pen, t)`: debu kapur jatuh.
- `stick(pose)`, `stickDraw(ctx,pose,t,{reveal})`, `stickTip(pose,reveal)`: stick figure (wajah smile/grin/open/shock/worried/skeptic/happy, rambut tuft/spiky/pony/cap/bun, kacamata, tongkat penunjuk).
- `board(ctx,rect)` (dinding, bingkai, slate, rak kapur), `chalkStick`, `duster`, `chalkText`, `chalkLine`, `chalkPattern`, `boardPattern`, `cam`, `viewRect`, `G`, `jagged`.

**Demos (`styles/papan-tulis-kapur/demo1/`, `demo2/`, `demo3/` + variasi pendek):**
- **`demo1/`**: *Paradoks Ulang Tahun — Kenapa 23 Orang di Kelas Punya Peluang 50% Kembar?* (~52 detik, 5 babak: Judul & 23 orang → Kalender 365 hari "Mustahil!" → Jaring 253 pasangan → Termometer peluang 50% → Kurva peluang 70 orang = 99,9%).
- **`demo2/`**: *Paradoks Monty Hall — Kenapa Pindah Pintu Menggandakan Peluang Menangmu?* (~55 detik, 8 babak: 3 pintu tertutup → Pilih Pintu 1 (1/3) → Pintu 3 dibuka kambing → Jebakan intuisi 50:50 → Peta peluang gabungan 2/3 → Konsentrasi 2/3 ke Pintu 2 → Perbandingan 33,3% vs 66,7% → Penutup kelas).
- **`demo3/`**: *Keajaiban Lipatan Kertas — Lipat 42 Kali Bisa Sampai ke Bulan!* (~55 detik, 8 babak: Kertas 0,1 mm ke Bulan → Batas 7–8 lipatan & rekor 12x → Deret eksponensial $2^n$ → 10x = 10 cm → 20x = Monas & 27x = Everest → 30x = Tembus atmosfer 107 km → 42x = 439.804 km melewati Bulan → Penutup).
- **Variasi pendek tambahan**: `demo-sks/` (*Efek SKS*, 18 dtk), `demo-rumus/` (*Trik 9x Jari*, 16 dtk), `demo-100rb/`, `demo-cahaya/`.
- Render salah satu demo: `node scripts/make.mjs styles/papan-tulis-kapur/demo1/story.json` (atau `demo2` / `demo3`).
