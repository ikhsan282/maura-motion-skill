# Boneka Rajut (Amigurumi Stop-Motion & Diorama Kain Flanel — Fabel Anak)

Gaya **boneka rajut *amigurumi* dan diorama kain flanel (*felt craft*)** dengan tekstur simpul benang berbentuk huruf **V** yang diproyeksikan secara 3D ke bola/tabung (`knitEllipsoid`, `knitTube`), mata kancing baju mengilap dengan 4 lubang benang (`buttonSprite`), dan lanskap bukit kain flanel berjahit jelujur di tepinya (`feltSprite`, `runStitch`).

Cocok untuk: **dongeng fabel hewan Nusantara, cerita anak dengan pesan moral, edukasi PAUD/SD yang hangat dan taktil**.

---

## Ciri Visual

1. **Rajutan Benang 3D Prosedural (`knitEllipsoid`, `knitTube`)**: Bukan sekadar lingkaran datar — setiap kepala, badan, tempurung, dan lengan boneka dirajut dari ratusan simpul V benang wol mengikuti lengkungan permukaan elipsoid dengan pencahayaan lembut dan serabut wol tipis di tepi siluetnya (*halo fuzz*).
2. **Diorama Kain Flanel Berlapis (`hillLayer`, `feltSprite`, `river`)**: Langit, awan, matahari, sungai, dan bukit-bukit dibuat dari potongan kain flanel bertekstur serat wol dengan jahitan benang putus-putus (*running stitch*) di sekeliling tepinya dan bayangan lipatan kain di bawahnya.
3. **Mata Kancing & Ekspresi Sulaman Benang (`buttonSprite`, `thread`)**: Mata karakter adalah kancing bulat berbingkai dengan lubang benang silang; alis dan mulut disulam dengan benang tebal yang berubah sesuai emosi (`smile`, `grin`, `ouch`, `frown`, `sly`, `chew`) serta sinkron dengan suara (`talk`).
4. **Label & Papan Kain Flanel (`patch`, `signpost`, `banner`, `tag`)**: Semua teks di layar ditulis dengan font bulat (`Fredoka`) di atas potongan kain flanel berjahit tepi, baik ditancapkan di tanah (`signpost`), digantung dengan tali benang dari atas layar (`banner`), maupun muncul di dekat karakter (`patch`).

---

## Apa Saja yang Ada di `kit.js`

Import `* as K from '../kit.js'` (dari dalam `styles/boneka-rajut/demoN/scene.js`):

- **Karakter Boneka Rajut (*Amigurumi Cast*)**:
  - `K.monkey(ctx, o)` — Monyet rajut cokelat lengkap dengan ekor melengkung, tangan/kaki artikulasi (`armL`, `armR`, `legL`, `legR`), perut yang bisa menggembung (`belly`), dan plester luka (`bandage`).
  - `K.turtle(ctx, o)` — Kura-kura rajut hijau dengan tempurung bermotif heksagonal benang gelap, leher yang bisa menjulur (`neck`), langkah kaki (`walk`), dan pose terbalik (`flip`).
  - `K.kancil(ctx, o)` — Si Kancil rajut cokelat kayu manis dengan dada krem, telinga panjang tegak, kuku mungil, serta mahkota kain flanel opsional (`crown`).
  - `K.crocodile(ctx, o)` — Buaya rajut hijau zamrud dengan sisik punggung kain flanel, rahang atas-bawah yang bisa menganga (`open`, `talk`) memperlihatkan gigi flanel putih, serta lencana nomor (`badge`).
  - `K.rabbit(ctx, o)` — Kelinci rajut putih-merah muda dengan telinga panjang (`earDroop`), ekor pom-pom benang, dan pose berlari atau tertidur (`eyes: 'closed'`).
- **Properti & Tanaman Rajut/Flanel**:
  - `K.bananaTree(ctx, x, y, opts)`, `K.plantPiece(ctx, which, opts)`, `K.bananaBunch(ctx, x, y, opts)`, `K.banana(ctx, x, y, opts)`, `K.peel(ctx, x, y, opts)`
  - `K.appleTree(ctx, x, y, { s, t, apples })` — Pohon apel flanel & rajut dengan buah apel merah rajut.
  - `K.carrot(ctx, x, y, { rot, s })` — Wortel rajut oranye dengan daun benang hijau.
  - `K.thorns(ctx, x, y, opts)`, `K.mound(ctx, x, y, opts)`, `K.scissors(ctx, x, y, opts)`
  - `K.heart(ctx, x, y, opts)`, `K.star(ctx, x, y, opts)`, `K.drop(ctx, x, y, opts)`, `K.plaster(ctx, x, y, a)`
- **Dunia Diorama, Kamera & Tipografi Kain**:
  - `K.cam(ctx, c, depth)`, `K.sky(ctx, { sunset })`, `K.sun(ctx, x, y, opts)`, `K.cloud(ctx, x, y, opts)`
  - `K.hillLayer(key, opts)`, `K.drawLayer(ctx, L, y)`, `K.river(ctx, y, h, t, opts)`
  - `K.patch(ctx, text, x, y, opts)`, `K.tag(ctx, text, x, y, opts)`, `K.signpost(ctx, text, x, y, opts)`, `K.banner(ctx, text, x, y, opts)`, `K.finish(ctx, t, { flash })`.

---

## Koleksi Demo (`demo1`, `demo2`, `demo3`)

Semua demo menggunakan narator Bahasa Indonesia (`el-id-m`, George — ElevenLabs) dengan rentang durasi 30–90 detik:

1. **`demo1/` — Kura-kura dan Monyet Menanam Pisang** (6 beat):
   - Kura-kura dan Monyet membagi batang pohon pisang yang hanyut; Monyet serakah mengambil pucuk daun yang akhirnya layu, sedangkan Kura-kura merawat bonggol berakar hingga berbuah lebat dan memberi pelajaran pada Monyet yang menghabiskan pisangnya di atas pohon.
2. **`demo2/` — Kancil dan Barisan Buaya Sungai** (10 beat):
   - Si Kancil yang lapar ingin menyeberangi sungai deras menuju pohon apel merah; dengan akal cerdiknya ia mengumumkan undangan pesta Raja Hutan sehingga kawanan Buaya berbaris membentuk jembatan hidup untuk dihitung satu sampai enam hingga Kancil tiba di seberang.
3. **`demo3/` — Balap Lari Kelinci Sombong dan Kura-kura** (10 beat):
   - Kelinci putih yang sombong menertawakan langkah lambat Kura-kura lalu beradu lari dengan Monyet sebagai wasit; karena merasa unggul jauh, Kelinci berhenti makan wortel dan tertidur pulas di bawah pohon rindang hingga Kura-kura yang tekun berhasil menyusul dan memenangkan lomba.
