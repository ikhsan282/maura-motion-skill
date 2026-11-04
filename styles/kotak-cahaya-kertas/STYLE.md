---
id: kotak-cahaya-kertas
name: Kotak Cahaya Kertas
no: 21
source: drive:21_Kotak_Cahaya_Kertas + github:silhouette-backlit
family: craft
tech: canvas2d
music: ambient   voice: id-f   captions: elegant
best_for: Shadow box / lightbox kertas: lapisan kertas siluet bertumpuk (5-7 layer) dengan cahaya LED dari belakang, gradasi biru-ungu-jingga, depth blur, parallax antar lapisan
---
# Kotak Cahaya Kertas

**Ciri khas (look):** Shadow box / lightbox kertas: lapisan kertas siluet bertumpuk (5-7 layer) dengan cahaya LED dari belakang, gradasi biru-ungu-jingga, depth blur, parallax antar lapisan. Malin pergi merantau, kapal megah kembali, ibu memeluk, Malin menolak, doa ibu, badai, Malin jadi batu (Pantai Air Manis, Padang).

**Gerak (motion):** Transisi dan animasi mengikuti irama narasi per baris (`AM.cue`, `AM.wordTime`), dengan pergerakan kamera halus dan elemen visual khas gaya `kotak-cahaya-kertas`.

**Kenapa menarik:** Visual Kotak Cahaya Kertas memberikan atmosfer khas yang langsung menghentikan scroll pada detik pertama.

**Cerita yang cocok:**
- Malin Kundang: "Ia pulang sebagai orang kaya... dan berpura-pura tidak mengenal ibunya sendiri."

**Rumus hook:** "Ia pulang sebagai orang kaya... dan berpura-pura tidak mengenal ibunya sendiri."

**Kit API (`styles/kotak-cahaya-kertas/kit.js`):**
- Exports: `LIGHTS`, `PAL`, `backlight`, `sheetColor`, `sheet`, `drawSheet`, `haze`, `ridges`, `rumahGadang`, `palm`, `ship`, `boat`, `puppet`, `waves`, `motes`, `boxFrame`, `litTitle`.

**Demos (`styles/kotak-cahaya-kertas/demo1/`, `demo2/`, `demo3/`):**
- **`demo1/`**: *Legenda Malin Kundang — Anak Durhaka yang Membatu di Pantai Air Manis* (~52 detik, 5 babak: Hook → Merantau → Kapal Saudagar → Penolakan Ibu → Kutukan Batu di Pantai Air Manis).
- **`demo2/`**: *Putri Mandalika & Tradisi Bau Nyale — Pengorbanan Sang Putri di Tebing Pantai Seger* (~55 detik, 8 babak: Fajar Bau Nyale → Putri Mandalika → Armada Lamaran Pangeran → Semedi Tengah Malam → Tebing Pantai Seger → Terjun ke Samudra → Pendaran Nyale → Warisan Sasak).
- **`demo3/`**: *Seni Shadow Box & Teater Siluet — Rahasia Kedalaman dari Tumpukan Kertas dan Cahaya* (~55 detik, 8 babak: Pertanyaan pembuka → Sejarah teater siluet → Anatomi 6 lapisan kertas → Transmisi LED backlight → Perspektif atmosferik → Efek paralaks ruang → Pergantian 4 suhu warna cahaya → Penutup).
- Render salah satu demo: `node scripts/make.mjs styles/kotak-cahaya-kertas/demo1/story.json` (atau `demo2` / `demo3`).
