---
id: boneka-rajut
name: Boneka Rajut
no: 6
source: drive:06_Boneka_Rajut (tidak bisa diunduh; dibuat dari nama + referensi amigurumi)
family: craft
tech: canvas2d
music: musicbox   voice: id-f   captions: kids (anim 'rise')
best_for: dongeng anak, fabel, cerita moral, lagu anak, edukasi balita, kisah persahabatan, konten parenting
---
# Boneka Rajut

**Ciri khas (look):** dunia boneka amigurumi di atas diorama kain flanel. Setiap bagian tubuh adalah rajutan
"V" (stockinette) yang ditata di atas elipsoid/tabung, disinari dari kiri atas, dengan bulu benang halus di tepi.
Mata kancing hitam mengilap dengan benang silang, mulut dan alis berupa sulaman (backstitch), pipi merah muda.
Latar: langit flanel #bfe4ef→#e9f5ee, bukit #b9dc8e / #8fc767, padang #7cb957 dengan jahitan jelujur krem,
bunga sulam, pohon lolipop flanel. Monyet #8d5a3a + krem #f2cc9c, kura-kura #93cf63 dengan cangkang #3f9150
bermotif petak rajutan. Teks: Fredoka di tempelan flanel dengan huruf "satin stitch" dan tepi jelujur.

**Gerak (motion):** boneka bergoyang seperti dipegang tangan (rock + bob), melompat dengan squash, lengan
berputar di bahu, kepala menoleh (fitur wajah bergeser di atas kepala), ekspresi berganti lewat mulut/alis
sulaman (senyum, O, cemberut, licik, "aduh", mata X). Benda flanel muncul dengan pop (outBack) seakan baru
ditempel. Animasi on twos (hold 2) = rasa stop-motion. Tiap potongan adegan: kilasan krem lembut.

**Kenapa menarik:** material terasa bisa diraba (benang, kancing, flanel), lucu dan aman untuk anak,
ekspresi kancing+sulaman langsung terbaca di HP, palet cerah tapi lembut.

**Cerita yang cocok:**
- Kura-kura dan Monyet: "Monyet memilih bagian atas pohon pisang. Pilihan yang ia sesali."
- Kancil dan Buaya: "Seekor kancil menghitung buaya... untuk menyeberang sungai."
- Semut dan Belalang: "Belalang bernyanyi sepanjang musim panas. Musim hujan datang."
- Bawang Merah Bawang Putih: "Labu kecil itu berisi emas. Labu besar berisi ular."
- Timun Mas: "Ia hanya punya empat bungkusan kecil untuk melawan raksasa."
- Edukasi: kenapa gigi harus disikat, dari mana datangnya hujan.

**Rumus hook:** "[Tokoh] memilih [X]. Pilihan yang ia sesali." / "[Tokoh kecil] punya rencana. [Tokoh besar] tidak
tahu." / "Ini kisah [hewan] yang [kebiasaan buruk]... sampai suatu hari."

**Kit API (`styles/boneka-rajut/kit.js`):**
- `knitEllipsoid(key, {rx, ry, color, sw, colorAt, flat, clip, fuzz})`, `knitTube(key, {pts, r0, r1, color, sw, colorAt, caps})` → sprite rajutan (cached); `smooth(pts)` menghaluskan jalur.
- `stamp(ctx, spr, x, y, {rot, sx, sy, alpha})` menempel sprite.
- `feltTile()`, `feltFill(g, pathFn, color)`, `feltSprite(key, {w, h, path, color, stitch, inset, extra})`: flanel + bayangan + jelujur.
- `runStitch(g, pathFn, {color, len, gap, w, offset})`, `thread(ctx, pts|pathFn, {color, w})`, `yarn(g, pts, {w, color})`.
- `buttonSprite(r, color, holes)`, `contactShadow(ctx, x, y, w, a)`, `heart`, `star`, `drop`, `plaster`.
- `patch(ctx, text, x, y, {size, fill, ink, shape:'round'|'burst', s, rot})`, `tag`, `signpost`, `banner` (judul tergantung benang).
- `monkey(ctx, o)`, `turtle(ctx, o)`: o = {x, y, s, t, look, tilt, hop, squash, mood, eyes, brows, talk, armL/armR, legL/legR, sit, belly, bandage, walk, neck, face} → posisi tangan/kepala.
- Properti: `banana`, `peel`, `plantPiece(ctx, 'top'|'bottom'|'full', {...wilt, seam})`, `bananaTree(ctx, x, y, {grow, bunch, wilt})`, `bananaBunch`, `thorns`, `mound`, `scissors`.
- Dunia: `cam(ctx, c, depth)` (paralaks), `sky(ctx, {sunset})`, `sun`, `cloud`, `hillLayer(key, {amp, color, flowers, trees})` + `drawLayer`, `river(ctx, y, h, t)`.
- Tokoh baru: rakit dari `knitEllipsoid`/`knitTube` + `buttonSprite` + `face()` (lihat `MK`/`TK`).

**Demo:** "Kura-kura dan Monyet Menanam Pisang", 19,5 detik, 6 shot. Monyet mengangkat pucuk pisang yang
langsung layu → kura-kura dapat batang dan akar → pucuk monyet layu, batang kura-kura tumbuh dan berbuah →
monyet memanjat dan makan semua, kulit pisang menimpa kura-kura → kura-kura diam-diam menaruh duri →
monyet melompat turun: "ADUH!" dengan bintang berputar.
