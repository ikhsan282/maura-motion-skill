---
id: pop-art
name: Pop Art Sunburst
no: 57
source: github:pop-sunburst-sticker
family: 2D
tech: canvas2d
music: hype   voice: id-f   captions: comic (Bebas Neue)
best_for: psikologi belanja, tips & trik, listicle, fakta uang, "kenapa...?", ranking, hack harian
---
# Pop Art Sunburst

**Ciri khas (look):** poster pop yang keras: lime #c6ff3d, pink panas #ff3ea5, kobalt #2b3bff, tangerine #ff5a1f,
kuning #ffe14d, tinta #0e0f1f. Sunburst dua warna berputar, titik Ben-Day/halftone, stiker die-cut miring dengan
border putih dan bayangan keras, outline hitam tebal, huruf extra-condensed (Bebas Neue). Tokoh: pembelanja bergaya
komik pop (kulit bertitik Ben-Day, bibir merah) dan label harga berwajah.

**Gerak (motion):** sunburst selalu berputar, stiker "menampar" masuk dengan overshoot lalu bergoyang pelan, label harga
melayang, angka odometer berputar, stempel dengan squash, banjir warna (lingkaran penuh) di setiap pergantian adegan,
push 1,03–1,07 di setiap shot.

**Kenapa menarik:** saturasi maksimal menghentikan jempol; gaya zine/meme cocok untuk konten edukasi singkat yang
mudah dibagikan.

**Cerita yang cocok:**
- Harga 99: "Kenapa harga selalu Rp99.000, bukan seratus ribu?"
- Diskon coret: "Harga coretnya mungkin tidak pernah ada."
- Ukuran 'jumbo': "Kenapa popcorn sedang hampir semahal yang besar?"
- Paylater: "Cicilan kecil, total besar."
- Musik di supermarket: "Lagu pelan bikin kamu belanja lebih lama."

**Rumus hook:** "Kenapa [hal sehari-hari] selalu [pola aneh]?" / "[Angka] ini sengaja dibuat [efek]." / "Toko tidak
bohong. Mereka cuma tahu [cara otakmu bekerja]."

**Kit API (`styles/pop-art/kit.js`):**
- Latar: `sunburst`, `benday`, `halftoneBlob`, `flood(ctx, k, col)` (transisi banjir warna).
- Stiker: `cut(g, path, col, {border, shadow})`, `sticker(text, {size, col, sub, k})`, `starBadge`, `arrow`, `slap(k)`.
- Tokoh: `priceTag(ctx, 'Rp99.000', x, y, s, {mood: smug|shock|wink, highlight, digitAlpha, k})`, `shopper(ctx, x, y, s, {mood: shock|think|smug|happy, look})`, `popEye`.
- Angka: `odometer(ctx, from, to, x, y, {k})`.

**Demo:** "Kenapa Harga Selalu Berakhir 99?", 19,6 dtk, 6 shot. Label Rp99.000 menampar sunburst, pembelanja kaget
"Rp100.000?" → mata raksasa memindai dari kiri, digit pertama disorot "DIBACA DULUAN!" → "90-AN" lalu grafik 99.000 vs
100.000 "SELISIH CUMA Rp1.000" → stempel "EFEK DIGIT KIRI / left-digit effect" (Thomas & Morwitz, 2005) → odometer
berputar ke 100.000 "BULATKAN KE ATAS" → "BUKAN DISKON" dicoret, label mengedip, "ITU TRIK!".
