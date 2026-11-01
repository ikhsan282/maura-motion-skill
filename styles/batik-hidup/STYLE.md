---
id: batik-hidup
name: Batik Hidup
no: 14
source: drive:14_Batik_Hidup
family: craft
tech: canvas2d
music: gamelan-pelog   voice: id-f   captions: elegant
best_for: sejarah budaya, filosofi motif, kisah keraton, asal-usul tradisi, tokoh sejarah Jawa, konten Hari Batik
---
# Batik Hidup

**Ciri khas (look):** semuanya kain. Mori putih #f3ead6 dengan tenunan halus; garis **malam (lilin) panas**
berwarna amber #efc56c yang bercahaya; setelah dicelup, latar menjadi **soga** #7a4a24 / **indigo** #1f2c58 dan
garis lilin tetap krem #f3e6c6; malam yang retak meninggalkan **remukan** (urat-urat halus). Motif digambar dengan
geometri aslinya: **Parang** (pita 45°, bilah-bilah lengkung yang saling mengait, deretan **mlinjon** belah ketupat
di batas pita, isen-isen cecek dan sawut), **Kawung** (empat buah aren mengelilingi titik), **Mega Mendung** (awan
Cirebon bergradasi tujuh biru). Tokoh adalah gambar batik: garis krem di atas warna celup, pakaian berisi motif.
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
- Kawung: "Motif tertua ini ternyata buah aren yang dibelah."
- Mega Mendung: "Awan di batik Cirebon ini dibawa pedagang dari Tiongkok."
- Truntum: "Motif ini diciptakan seorang permaisuri yang cintanya kembali bersemi."
- Hari Batik Nasional: "Kenapa kita memakai batik setiap 2 Oktober?"

**Rumus hook:** "Dulu, [motif/benda] ini [terlarang/rahasia]..." / "[Motif] ini sebenarnya [benda sehari-hari yang
mengejutkan]." / "Satu garis lilin... [makna besar]."

**Kit API (`styles/batik-hidup/kit.js`):**
- Motif: `parangTile(mode 'wax'|'dyed'|'ink', ground, scale)`, `kawungTile(ground, line, fill, S)`, `megaMendung(ctx, x, y, s, t)`,
  `motifFill(ctx, tile, {ox, oy, s, rot})` (isi path dengan motif).
- Proses: `cloth(ctx, t, {x, y, w, h, wax, dye, ground, tiles})` → titik ujung canting; `canting(ctx, x, y, t, {s, rot, glow})`;
  `crackle(col)`, `weave()`, `overlay(ctx, tile, alpha)`.
- Tokoh: `figure(ctx, 'senopati'|'sultan'|'abdi'|'walker', {x, y, s, face, t, arm, closed, look, phase, cloth, top, kain, cap, bun, legs, bow})`.
- Latar: `sea(ctx, t, {y, h})`, `karang(ctx, x, y, s, hit)`, `payung(ctx, x, y, s, t)`, `regol(ctx, x, y, s)`.
- Teks: `plaque(ctx, text, x, y, {size, sub, alpha})`, `waxText(ctx, text, x, y, p, {size})`.

**Demo:** "Parang Rusak: Motif Larangan", 18,6 detik, 5 gambar. Canting menyapu lilin, celupan soga membanjir dan
Parang Rusak muncul, "MOTIF LARANGAN", mahkota → Panembahan Senopati bertapa di karang, ombak menghantam, ombak
berubah jadi Parang → canting menarik garis tak putus, celup indigo, retakan → Sultan HB I (1785) di bawah payung,
abdi menyembah, "PARANG RUSAK hanya untuk raja" → kini tiga orang berjalan memakai Parang: "siapa pun".
