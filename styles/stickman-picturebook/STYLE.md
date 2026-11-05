# Stickman Picturebook (`styles/stickman-picturebook`)

Gaya **Stickman Picturebook (No. 77)** menghadirkan estetika **Buku Dongeng Ilustrasi Klasik Berbingkai Jahitan Emas** dengan karakter ikonik **"Si Pangeran Kecil Buku Cerita (`picturebookStickman`)"** yang mengenakan mahkota kertas emas tiga puncak, jubah merah tua yang berkibar lembut, syal emas, tunik zamrud berkancing bintang, pipi merona hangat, serta membawa pena bulu emas atau lentera dongeng.

## Karakteristik Visual & Anatomi Unik
- **Kanvas Halaman Buku Dongeng (`picturebookBg`)**: Kertas krem hangat (`#fff9ea`) dengan tepi jahitan buku cerita, pita pembatas buku merah (`crimson bookmark ribbon`) di sudut kanan atas, dan taburan bintang emas lembut.
- **Karakter Ikonik (`picturebookStickman`)**:
  - **Mahkota Kertas Emas 3 Puncak** dengan permata merah di tengah.
  - **Wajah Hangat Pipi Merona** dengan mata ramah dan senyum dongeng.
  - **Jubah Merah Berkibar & Tunik Zamrud** dengan sabuk kulit dan lencana emas di dada.
  - **Properti Interaktif**: Pena bulu emas (`prop: 'quill'`), lentera berpendar (`prop: 'lantern'`), atau penyiram tanaman (`prop: 'watering'`).

## Komponen Utama `kit.js`
- `picturebookBg(ctx, W, H, t)`
- `drawPicturebookHeader(ctx, W, chapterTag, title, subtitle, accent)`
- `drawStorybookStage(ctx, x, y, w, h, t, accent, meadowLabel)`
- `picturebookStickman(ctx, x, y, t, opts)`
- `drawStoryCard(ctx, x, y, w, h, opts)`
- `drawPicturebookFooter(ctx, W, H, moralText, accent)`

## Daftar Demo (64–65 Detik, Voice `el-id-m`)
1. **`demo1`**: *Dongeng Batu yang Menyusut — Mengapa Beban Besar Mengecil Saat Kita Mulai Melangkah?*
2. **`demo2`**: *Kisah Dua Benih di Taman — Mengapa Membandingkan Musim Tumbuhmu dengan Orang Lain Itu Tidak Adil?*
3. **`demo3`**: *Lentera Seratus Langkah — Mengapa Kamu Hanya Perlu Melihat Satu Langkah di Depan Kaki?*
