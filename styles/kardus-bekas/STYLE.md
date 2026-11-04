# Gaya: Kardus Bekas

Dunia kriya (*craft*) dan diorama *stop-motion* yang **seluruhnya dirakit dari potongan kardus bergelombang (*corrugated cardboard*) bekas** di atas alas potong (*cutting mat*) hijau: kotak paket dengan penutup lipat, tepi potongan yang memperlihatkan **lapisan gelombang *flute* di bagian tengah**, sambungan **selotip kertas (*masking tape*)**, engsel **paku klip kuningan (*brass brads*)**, stempel merah `"FRAGILE"`, dan coretan spidol hitam tebal.

## Ciri Visual
- **Tekstur Kertas Kraft & Lapisan Gelombang (*Flute*)**: Setiap kepingan kardus memiliki serat cokelat kraft, sudut robekan yang menyingkap alur bergelombang di bagian dalam, serta tepi ketebalan bergelombang (`fluteStrip`).
- **Sambungan Kriya Tangan**: Potongan-potongan kardus ditempel dengan selotip kertas berujung gerigi (`maskingTape`) dan digerakkan menggunakan engsel paku payung/klip kuningan (`bradPin`) dalam ritme *stop-motion* 10 fps (`stepT`).
- **Meja Kerja Cutting Mat (`cuttingMat`)**: Latar alas potong hijau tua bergaris kisi sentimeter yang membuat warna cokelat kardus dan aksen spidol tampak kontras dan hidup.

## Kit (`styles/kardus-bekas/kit.js`)
- `PAL`, `stepT(t, 10)`, `cam(ctx, z, cx, cy, rot)` — palet kardus kraft, kuantisasi waktu *stop-motion*, dan kamera 2D.
- `cuttingMat(ctx, t)` — latar alas potong hijau bergaris grid.
- `cardPanel(ctx, x, y, w, h, opts)` — potongan lembaran kardus dengan bayangan jatuh, tepi gelombang *flute*, robekan sudut (`tornCorner`), dan selotip atas (`tapeTop`).
- `shippingBox(ctx, x, y, s, opts)` — kardus paket 2.5D dengan katup atas yang bisa membuka/menutup (`open`), label *barcode*, stempel merah, atau angka daur ulang (`recycleNum`), serta ekspresi wajah spidol.
- `fluteCrossSection(ctx, x, y, w, h, opts)` — penampang melintang 3 lapis kardus (*linerboard* atas, lengkungan *flute* bergelombang, *linerboard* bawah) dengan panah beban tekan.
- `cardPuppet(ctx, kind, opts)` — tokoh dan rakitan kardus berengsel paku klip (`'robot'`, `'roket'`, `'kastil'`, `'pabrik'`, `'anak'`).
- `maskingTape`, `bradPin`, `fluteStrip`, `cardLabel` — ornamen selotip, paku klip, dan plakat judul kardus robek.

## Paket Demo (30–90 Detik)
1. **`demo1` — *Perjalanan Kardus Paketmu — Bisa Lahir Kembali Sampai Tujuh Kali*** (`~55s`): Siklus hidup kardus paket belanja daring dari serat selulosa pohon pinus, struktur gelombang *flute*, proses peleburan di pabrik daur ulang (*pulper*), hingga alasan ilmiah mengapa serat kertas hanya sanggup didaur ulang maksimal 7 kali.
2. **`demo2` — *Rahasia Kekuatan Kardus Bergelombang — Kenapa Kertas Tipis Sanggup Menahan Beban Berat?*** (`~55s`): Sains rekayasa struktur *sandwich* tiga lapis kardus bergelombang (1871), prinsip lengkungan jembatan Romawi pada alur *flute*, bantalan udara peredam benturan, hingga arsitektur kubah dan hunian darurat karya Shigeru Ban.
3. **`demo3` — *Imajinasi Tanpa Batas dari Kardus Bekas — Dari Kotak Sepatu Menjadi Roket Antariksa*** (`~55s`): Bagaimana kotak kardus kosong memicu kreativitas ruang tiga dimensi pada anak-anak, dirakit dengan gunting, selotip kertas, dan paku klip menjadi robot kardus, benteng kastil, hingga roket antariksa.
