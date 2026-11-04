---
id: scrapbook
name: Scrapbook Collage
no: 43
source: github:scrapbook-collage
family: Kriya
tech: canvas2d
music: folk   voice: el-id-m   captions: typewriter
best_for: jurnal ekspedisi sejarah & alam, biografi penjelajah/ilmuwan, peta perjalanan, herbarium & koleksi spesimen, cerita arsip yang hangat
---
# Scrapbook Collage

**Ciri khas (look):** Buku jurnal ekspedisi terbuka di atas meja kayu: kertas krem bertekstur grid halus dengan noda cincin kopi, lubang jilid spiral di sisi kiri, pita selotip/washi tape robek (`tape`), bingkai foto polaroid/arsip (`photoCard`), kartu catatan berpin merah (`noteCard`), stiker *die-cut* berbingkai putih tebal (`sticker`), perangko pos berlubang perforasi (`postStamp`), dan cap karet miring (`rubberStamp`).

**Gerak (motion):** Setiap stiker, polaroid, perangko, dan kartu catatan menempel ke halaman dengan pantulan pegas (`ease.outBack`), garis rute ekspedisi dan batas peta menggambar diri secara bertahap, serta cap karet menghantam halaman pada akhir kalimat kunci.

**Kenapa menarik:** Terasa sangat taktil, hangat, dan penuh detail kurasi tangan — ideal untuk mendongengkan sejarah sains, penjelajahan Nusantara, dan biografi tokoh.

**Cerita yang cocok:**
- Jurnal Wallace: Garis tak terlihat di Selat Lombok yang memisahkan fauna Asia dan Australia.
- Ekspedisi Franz Wilhelm Junghuhn: Peta 4 zona iklim gunung Jawa dan kebun kina Bandung yang menyelamatkan dunia dari malaria.
- Herbarium Rumphius di Ambon: Ensiklopedia 1.200 tanaman Maluku yang didiktekan dalam kebutaan.

**Rumus hook:** "Ada garis tak terlihat yang membelah Indonesia... dan hewan-hewan tidak berani menyeberanginya." / "Di dalam buku jurnal tua ini, tersimpan catatan yang mengubah peta sains dunia."

**Kit API (`styles/scrapbook/kit.js`):**
- `PAL`, `FONT`: Palet kertas jurnal, tinta sepia, merah segel, hijau zamrud, emas, dan selotip washi; tipografi mesin tik (`Special Elite`) & serif klasik (`Playfair Display`).
- `stage(ctx, t, { journalTitle, refCode, page })`: Menggambar meja kayu, lembaran jurnal bergrid, lubang spiral, noda kopi, dan label pita atas.
- `photoCard(ctx, x, y, w, h, rot, drawFn, opts)`: Bingkai foto arsip/polaroid dengan selotip atas dan teks keterangan.
- `noteCard(ctx, x, y, w, h, rot, opts)`: Kartu catatan lapangan dengan pin merah dan daftar poin.
- `sticker(ctx, x, y, r, rot, drawFn, opts)`: Stiker bundar berbingkai putih tebal dengan label pita.
- `postStamp(ctx, x, y, s, rot, opts)`, `rubberStamp(ctx, x, y, str, opts)`, `tape(ctx, x, y, w, h, rot, opts)`, `drawArchipelagoMap(ctx, x, y, w, h, opts)`.

**Demo (3 Skenario Lengkap, ~64–65 dtk, voice `el-id-m`):**
1. **`demo1` — Jurnal Wallace: Garis Tak Terlihat di Nusantara (~64 dtk):** Perjalanan 8 tahun Alfred Russel Wallace (1854–1862) mengoleksi 125.660 spesimen dan menemukan perbedaan mencolok antara fauna Asia di Bali dan fauna Australia di Lombok akibat palung laut dalam Zaman Es.
2. **`demo2` — Ekspedisi Franz Wilhelm Junghuhn: Sang Humboldt dari Jawa (~64 dtk):** Kisah naturalis Junghuhn memetakan gunung berapi Jawa, merumuskan 4 zona iklim vertikal tanaman, dan membudidayakan pohon Kina di Lembang & Pengalengan hingga menyuplai 90% kuinin anti-malaria dunia.
3. **`demo3` — Herbarium Rumphius di Ambon: Buku Botani Raksasa yang Ditulis dalam Kebutaan (~65 dtk):** Kisah ketabahan Georg Eberhard Rumphius menyusun 6 jilid *Herbarium Amboinense* (1.200 spesies tanaman Maluku) meski buta total akibat glaukoma serta dilanda gempa dan kebakaran besar.
