---
id: batik-hidup
name: Batik Hidup
no: 14
source: drive:14_Batik_Hidup
family: craft
tech: canvas2d
music: reflective   voice: el-id-m   captions: elegant
best_for: sejarah budaya, filosofi motif, kisah keraton, asal-usul tradisi, tokoh sejarah Jawa, konten Hari Batik
---
# Batik Hidup

**Ciri khas (look):** semuanya kain. Mori putih `#f3ead6` dengan tenunan halus; garis **malam (lilin) panas**
berwarna amber `#efc56c` yang bercahaya; setelah dicelup, latar menjadi **soga** `#7a4a24` / **indigo** `#1f2c58` / **merah Cirebon** `#8c1f19` dan
garis lilin tetap krem `#f3e6c6`; malam yang retak meninggalkan **remukan** (urat-urat halus). Motif digambar dengan
geometri aslinya: **Parang** (pita 45°, bilah-bilah lengkung yang saling mengait, deretan **mlinjon** belah ketupat
di batas pita, isen-isen cecek dan sawut), **Kawung** (empat buah aren mengelilingi titik pusat pancer), **Mega Mendung** (awan
Cirebon bergradasi tujuh biru dengan ujung meruncing). Tokoh adalah gambar batik: garis krem di atas warna celup, pakaian berisi motif.
Teks: papan keraton (Playfair Display krem, garis emas) dan tulisan "malam" bercahaya.

**Gerak (motion):** **canting** (mangkuk tembaga, gagang bambu, asap lilin) menyapu kain dan motif muncul di
belakangnya; **celupan** naik dari bawah dengan tepi bergelombang dan mengubah warna; retakan muncul; kamera
mengikuti ujung canting sepanjang garis yang tak putus. Ombak batik pesisir bergulung dan **menghantam karang**,
lalu ombak itu **berubah menjadi Parang**. Tokoh bernapas, membuka mata, mengangkat tangan, menyembah, berjalan.
Kilatan lilin hangat di tiap potongan adegan.

**Kenapa menarik:** proses membatik yang memuaskan dilihat (ASMR visual), motif asli yang dikenali semua orang
Indonesia, dan kontras krem-di-atas-gelap yang kuat di layar HP.

**Cerita yang cocok:**
- Parang Rusak: "Dulu, motif batik ini terlarang, kecuali untuk raja."
- Kawung: "Motif tertua ini ternyata buah aren yang dibelah empat."
- Mega Mendung: "Awan berlapis tujuh di batik Cirebon ini lahir dari akulturasi dua budaya."

**Rumus hook:** "Dulu, [motif/benda] ini [terlarang/rahasia]..." / "[Motif] ini sebenarnya [benda sehari-hari yang
mengejutkan]." / "Satu garis lilin... [makna besar]."

**Kit API (`styles/batik-hidup/kit.js`):**
- Motif: `parangTile(mode 'wax'|'dyed'|'ink', ground, scale)`, `kawungTile(ground, line, fill, S)`, `megaMendung(ctx, x, y, s, t)`, `megaTile(mode 'wax'|'dyed', ground, S)`,
  `motifFill(ctx, tile, {ox, oy, s, rot})` (isi path dengan motif).
- Proses: `cloth(ctx, t, {x, y, w, h, wax, dye, ground, tiles})` → titik ujung canting; `canting(ctx, x, y, t, {s, rot, glow})`;
  `crackle(col)`, `weave()`, `overlay(ctx, tile, alpha)`.
- Tokoh: `figure(ctx, 'senopati'|'sultan'|'abdi'|'walker', {x, y, s, face, t, arm, closed, look, phase, cloth, top, kain, cap, bun, legs, bow})`.
- Latar: `sea(ctx, t, {y, h})`, `karang(ctx, x, y, s, hit)`, `payung(ctx, x, y, s, t)`, `regol(ctx, x, y, s)`.
- Teks: `plaque(ctx, text, x, y, {size, sub, alpha})`, `waxText(ctx, text, x, y, p, {size})`.

**Paket 3 Demo (`styles/batik-hidup/`):**
- `demo1` — **Parang Rusak: Motif Larangan** (~52 detik, 5 adegan): canting menyapu malam & celupan soga, semedi Panembahan Senopati di pantai selatan saat ombak menghantam karang, garis canting tak putus & celupan indigo, maklumat Sultan HB I (1785), hingga masyarakat modern di luar keraton.
- `demo2` — **Filosofi Batik Kawung — Dari Empat Belahan Buah Aren hingga Simbol Kesucian Hati** (~55 detik, 8 adegan): geometri Kawung di kain mori, arca candi abad ke-13, kolang-kaling buah aren dibelah empat, pohon aren yang bermanfaat penuh, falsafah Papat Kiblat Lima Pancer, pengabdian abdi dalem keraton, hingga pesan *Urip Iku Urup*.
- `demo3` — **Batik Mega Mendung Cirebon — Tujuh Lapisan Awan Penyejuk Hati** (~55 detik, 8 adegan): canting di atas latar merah Cirebon, pelabuhan Muara Jati abad ke-16, akulturasi Sunan Gunung Jati & Putri Ong Tien, garis awan meruncing khas Trusmi, 7 lapisan gradasi biru langit & bumi, awan peneduh hujan, pencelupan bertahap, hingga Mega Mendung mendunia.
