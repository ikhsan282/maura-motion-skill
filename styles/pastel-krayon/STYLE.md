---
id: pastel-krayon
name: Pastel & Krayon
no: 28
source: shorts-animator:pastel + github:crayon-storybook
family: painterly
tech: paint
music: dreamy   voice: el-id-m   captions: kids
best_for: sains sehari-hari untuk anak & umum, nostalgia masa kecil, fenomena langit & cuaca, cerita pengantar tidur yang hangat
---
# Pastel & Krayon

**Ciri khas (look):** Arsiran kapur pastel dan krayon lilin di atas kertas gambar bertekstur kasar (*paper tooth* tinggi, `base: 'pastel'`). Warna lembut namun hangat, garis tepi krayon agak bergetar hidup (*boil*), sapuan kapur berbutir (*bristle: 1*), dan ruang kertas hangat yang menembus di sela-sela goresan warna.

**Gerak (motion):** Kamera menggeser lembut mengikuti perjalanan atau arah pandang anak, elemen dekat melintas cepat sedangkan objek jauh bergeming (efek paralaks), diagram garis pandang putus-putus krayon muncul bertahap, dan setiap beberapa frame tekstur arsir krayon bergetar halus (*boil*) seperti buku gambar hidup.

**Kenapa menarik:** Membangkitkan rasa hangat, penasaran, dan nostalgia masa kecil sejak detik pertama, membuat penjelasan sains sehari-hari terasa akrab dan mudah dipahami.

**Cerita yang cocok:**
- Kenapa Bulan Mengikuti Kita?: "Waktu kecil, aku yakin bulan selalu mengikutiku pulang."
- Bagaimana Pelangi Muncul Selepas Hujan?: "Setiap tetes air hujan sebenarnya adalah cermin dan prisma kecil."
- Ke Mana Perginya Bayanganmu Saat Tengah Hari?: "Pagi hari bayanganmu raksasa, tapi siang hari ia sembunyi di bawah telapak kakimu."

**Rumus hook:** "Waktu kecil, kamu pasti pernah bertanya kenapa [fenomena akrab sehari-hari]..."

**Kit API (`styles/pastel-krayon/kit.js`):**
- `LOOK`, `PAL`, `painter(AM, { scale, overrides })`, `view(P, { x, y, z, rot })`, `pop`, `clamp`, `lerp`, `ease`, `TAU`.
- Langit & Cuaca: `sky(g, { mode, t })`, `stars(g, t, n)`, `moon(g, x, y, r, { phase, glow })`, `sun(g, x, y, r, { t })`, `clouds(g, t, { y, n, dark })`, `rain(g, t, { n })`, `rainbow(g, x, y, r, { prog })`, `prismDrop(g, x, y, r, { prog })`.
- Lanskap & Karakter: `hills(g, { y, col1, col2 })`, `road(g, { y, scroll })`, `treeRow(g, { y, scroll, n, scale })`, `houseRow(g, { y, scroll, n })`, `familyCar(g, x, y, s, { t })`, `childFigure(g, x, y, s, { t, shadowLen, shadowDir })`, `parallaxRays(g, { carX, carY, moonX, moonY, treeX, treeY })`.
- UI Buku Gambar: `crayonBorder(ctx)`, `title(ctx, str, x, y, { a, size, sub, dark })`.

**Paket Demo (30–90 Detik):**
1. **`demo1`** — *Kenapa Bulan Selalu Mengikuti Kita di Jalan Malam? — Rahasia Ilusi Paralaks* (~52 detik): Dari kursi belakang mobil malam hari, menjelaskan mengapa pohon dan rumah melintas cepat sementara Bulan yang berjarak 384.400 km tampak selalu mengikuti kita.
2. **`demo2`** — *Bagaimana Pelangi Muncul Selepas Hujan? — Ketika Tetes Air Menjadi Prisma Cahaya* (~55 detik): Bagaimana cahaya putih matahari dibiaskan, diuraikan menjadi tujuh spektrum warna, dan dipantulkan di dalam jutaan tetes air hujan.
3. **`demo3`** — *Ke Mana Perginya Bayanganmu Saat Tengah Hari? — Sains Cahaya dan Arah Matahari* (~55 detik): Mengikuti perubahan panjang dan arah bayangan tubuh dari pagi, tengah hari saat matahari tepat di zenith, hingga senja.

