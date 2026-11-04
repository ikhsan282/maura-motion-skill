# Gaya: Lukisan Gua Purba

Dinding batu gamping (*karst*) di kedalaman gua prasejarah yang diterangi **cahaya obor api yang berkerlip hangat**, menyingkap **cap tangan sembur oker merah (*hand stencil*)**, lukisan **babi rusa, banteng liar, rusa, dan pemburu setengah-hewan (*therianthrope*)** berusia lebih dari **51.200 tahun** seperti yang ditemukan di kawasan karst **Maros-Pangkep (Sulawesi Selatan)** dan **Sangkulirang-Mangkalihat (Kalimantan Timur)**. Ketika api unggun dan obor bergerak, goresan pigmen hematit merah dan arang di dinding batu seolah hidup dan berlari dalam ritme *stop-motion* 8 fps.

## Ciri Visual
- **Tekstur Dinding Batu Gamping (`caveWall`)**: Permukaan batu kapur berlapis-lapis dengan retakan alami, endapan mineral kalsit, bintik-bintik batu, serta siluet stalaktit dan stalagmit yang membingkai layar.
- **Pigmen Mineral Bumi (`PAL`)**: Merah hematit (`#a8321e`), merah bata menyala (`#cb4827`), kuning oker (`#d48b35`), arang kayu hitam (`#14100d`), dan putih kalsit tulang (`#ebd9bc`).
- **Cap Tangan Negatif Sembur (`handStencil`)**: Kabut semburan pigmen oker merah dan ribuan titik percikan di sekeliling siluet telapak tangan dan lima jari yang ditempelkan ke batu.
- **Cahaya Obor Hidup (`torchLight`)**: Kolam cahaya api hangat yang bergerak mengikuti perhatian kamera, lengkap dengan obor kayu berapi di sudut bawah dan percikan bara (*embers*) yang melayang naik.

## Kit (`styles/lukisan-gua-purba/kit.js`)
- `PAL`, `stepT(t, 8)`, `torchFlicker(t)` — palet mineral purba, kuantisasi waktu *stop-motion* 8 fps, dan fungsi kerlip api obor.
- `caveWall(key, W, H, seed)` — membuat dan menyimpan kanvas dinding batu gamping sepanjang `W` piksel lengkap dengan retakan dan tekstur mineral.
- `handStencil(g, x, y, opts)` — menggambar cap tangan negatif dengan efek semburan oker dan titik-titik pigmen (`reveal` 0→1).
- `caveBeast(g, kind, opts)` — menggambar hewan gua prasejarah (`'babi-rusa'`, `'banteng'`, `'rusa'`, `'perahu'`) dengan arsiran garis-garis oker di dalam tubuh dan animasi lari.
- `caveHunter(g, opts)` — menggambar figur pemburu purba dan makhluk *therianthrope* yang berlari, memegang tombak (`spear`), memanah (`bow`), atau menari (`dance`).
- `chalkStroke(g, pts, opts)` — goresan kapur/arang kasar berlapis.
- `stalactites(ctx, t, opts)`, `torchLight(ctx, x, y, t, opts)`, `stonePlaque(ctx, title, x, y, opts)` — bingkai stalaktit gua, pencahayaan obor dinamis, dan plakat batu bertulis.

## Paket Demo (30–90 Detik)
1. **`demo1` — *Lukisan Gua Tertua di Dunia Ada di Sulawesi — Jejak 51.200 Tahun di Karst Maros-Pangkep*** (`~55s`): Penemuan lukisan cadas figuratif tertua di dunia di Leang Tedongnge dan Leang Karampuang (Maros-Pangkep), cap tangan sembur oker merah, babi rusa Sulawesi, hingga *therianthrope* yang bergerak di bawah sinar obor.
2. **`demo2` — *Perburuan Agung di Dinding Batu — Ketika Api Unggun Menghidupkan Lukisan Purba*** (`~55s`): Kisah keluarga manusia purba di sekitar api unggun gua yang melukiskan jejak banteng liar dan rusa, adegan penyergapan dengan tombak dan busur, tarian syukur, serta cap tangan bersama di dinding batu.
3. **`demo3` — *Rahasia Cap Tangan Merah — Pesan Manusia Purba yang Melintasi Zaman*** (`~55s`): Teknik menyemburkan oker merah lewat pipa tulang untuk mencetak cap tangan negatif di Sulawesi, Kalimantan, dan Raja Ampat, jejak tangan anak-anak purba, hingga perahu arwah leluhur Nusantara.

