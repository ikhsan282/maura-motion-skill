# trailer-gelap — Trailer Tipografi Gelap (Cinematic Dark Trailer)

Gaya visual **Trailer Tipografi Gelap** menghadirkan atmosfer dokumenter sejarah dan *movie trailer* kelas layar lebar: kanvas hitam obsidian `#050609`, sorot kerucut cahaya (*volumetric spotlight cone*), partikel abu/bara dan kristal es yang melayang, tipografi serif/condensed kontras tinggi (`Cinzel` & `Oswald`), angka waktu raksasa bergradasi emas-bara (*fire-gold gradient*), serta kartu arsip telegram dan siluet dramatis.

## Kit (`styles/trailer-gelap/kit.js`)
- `stage(g, t, { theme, spotlight })`: Kanvas obsidian lengkap dengan sorot kerucut cahaya, partikel bara/es melayang, *letterbox* sinema, dan *vignette* pekat.
- `topHeader(g, t, { archive, reel, theme })`: Penanda rol arsip (`REEL`), *timecode*, dan garis pembatas berlian.
- `trailerTitle(g, x, y, lines, opts)`: Kartu judul trailer dengan tipografi serif kontras tinggi, kilau *anamorphic lens flare*, dan subjudul *small-caps* berjarak lebar.
- `heroClock(g, x, y, bigStr, opts)`: Angka jam atau statistik hero raksasa dengan gradasi api-emas atau perak-es.
- `telegramCard(g, x, y, w, h, opts)`: Kartu dokumen/telegram arsip dengan cap peringatan.
- `silhouetteScene(g, x, y, w, h, type, t)`: Adegan siluet sinematik (`'ship-iceberg'`, `'tambora'`, `'apollo'`).

## Demo (30–90 Detik)
- **Demo 1 — "Pesan Terakhir yang Tak Pernah Sampai ke Titanic — Tragedi Telegram Es Pukul 21:40"** (`demo1/`, ~64 dtk): Kronologi malam 14 April 1912 saat peringatan gunung es dari kapal SS Mesaba tertumpuk di meja radio Titanic tepat dua jam sebelum tabrakan pukul 23:40. Voice `el-id-m`.
- **Demo 2 — "Letusan Tambora 1815 — Tahun Ketika Dunia Kehilangan Musim Panas"** (`demo2/`, ~64 dtk): Bagaimana letusan Gunung Tambora skala VEI-7 di Sumbawa menyemburkan 150 kilometer kubik abu ke stratosfer dan menurunkan suhu global pada 1816. Voice `el-id-m`.
- **Demo 3 — "Apollo 13: Empat Hari di Ambang Gelap — Penyelamatan Paling Mustahil di Antariksa"** (`demo3/`, ~65 dtk): Detik-detik ledakan tangki oksigen sejauh 320.000 km dari Bumi, penghematan daya hingga 12 ampere, dan filter karbon dioksida darurat dari kotak kardus. Voice `el-id-m`.

