---
id: sumi-e
name: Sumi-e Tinta Timur
no: 46
source: github:ink-wash-sumi-e + sumi-e-ink
family: painterly
tech: canvas2d
music: japanese   voice: el-id-m   captions: serif
best_for: sejarah Asia Timur & pelayaran Nusantara, filosofi Zen (Kintsugi, Wabi-Sabi, Ma), biomimikri alam (bambu, pinus, air), kisah kebijaksanaan & arsitektur tradisional
---
# Sumi-e Tinta Timur

**Ciri khas (look):** Lukisan tinta sumi-e di atas kertas beras xuan (`#f4efe3`–`#e3d9c3`) berbingkai gulungan gantung: sapuan kuas basah bergradasi (`bokashi`), efek serabut kuas kering (`kasure`), pegunungan berkabut berlapis (`shanshui`), ombak kaligrafis, ruang kosong bermakna (`Ma` / `間`), serta satu-satunya aksen warna berupa stempel segel merah vermilion (`hanko` / `chop`, `#b8322a`) dan urat emas (`#c99738`).

**Gerak (motion):** Goresan kuas merentang organik mengikuti progres narasi, kabut pegunungan bergeser perlahan, kapal/bambu berayun lembut mengikuti gelombang dan angin, serta stempel merah menghantam kertas dengan pantulan `outBack`.

**Kenapa menarik:** Kontras tinta monokrom di atas kertas beras yang hangat dengan ruang kosong yang lega dan satu aksen segel merah memberikan atmosfer puitis, tenang, dan berwibawa.

**Cerita yang cocok:**
- Armada Laksamana Cheng Ho Singgah di Nusantara: "Tiga ratus kapal kayu raksasa, dan kapal utamanya lebih panjang dari lapangan sepak bola."
- Filosofi Kintsugi & Ruang Kosong (Ma): "Mengapa mangkuk yang pecah justru direkatkan dengan bubuk emas murni?"
- Bambu dan Angin Topan: "Rahasia struktur silinder berongga dan buku bambu yang melengkung tanpa pernah patah."

**Rumus hook:** "[Benda/Armada legendaris] ini tampak tenang, tapi menyimpan [fakta/skala mengejutkan]." / "Ketika [benda] hancur/diterjang badai, rahasia ketangguhannya justru terletak pada [prinsip tak terduga]."

**Kit API (`styles/sumi-e/kit.js`):**
- Kanvas & Kuas: `ricePaper(ctx, t, {header, sub, sealText})`, `brushStroke(ctx, x0, y0, x1, y1, {w, col, dry, arch, p})`, `inkBloom(ctx, x, y, r, {col, alpha, seed, t})`, `redSeal(ctx, x, y, text, {size, p})`, `scrollBox(ctx, x, y, w, h, titleTxt, subTxt, {p, accent})`.
- Lanskap & Properti: `mistyMountains(ctx, t, {yBase, seed})`, `inkWaves(ctx, yBase, t, {rows, amp})`, `drawTreasureShip(ctx, x, y, s, {sails, redSails, t, labelText})`, `drawPagoda(ctx, x, y, s, {tiers, redPillars})`, `drawBamboo(ctx, x, yBase, h, {bend, sw, col, nodes})`.
- Kompatibilitas: `PAL`, `bg`, `title`, `label`, `blob`, `ring`, `card`.

**Daftar Demo:**
- **Demo 1 (`demo1/`):** *Laksamana Cheng Ho Singgah di Nusantara — Jejak Tujuh Pelayaran Samudra* (~64 dtk) — Kisah tujuh ekspedisi maritim Laksamana Cheng Ho (1405–1433) bersama 27.000 awak, persinggahan di Samudera Pasai, Palembang (penumpasan bajak laut Chen Zuyi), Sunda Kelapa, Semarang (Klenteng Agung Sam Poo Kong), hingga perbandingan ukuran kapal pusaka Baochuan.
- **Demo 2 (`demo2/`):** *Filosofi Kintsugi & Ruang Kosong (Ma) — Mengapa Retakan Justru Dilapisi Emas?* (~64 dtk) — Sejarah seni Kintsugi dari mangkuk teh Shogun Ashikaga Yoshimasa di Kyoto abad ke-15 yang direkatkan dengan getah pernis *urushi* dan bubuk emas murni (*maki-e*), berpadu dengan estetika *Wabi-Sabi* dan ruang hening *Ma* (`間`) dalam lukisan tinta Sumi-e.
- **Demo 3 (`demo3/`):** *Bambu dan Angin Topan — Rahasia Struktur Berongga yang Melengkung Tanpa Pernah Patah* (~65 dtk) — Bedah biomekanika bambu di tengah badai: efisiensi momen inersia silinder berongga, sekat cincin buku bambu anti-penyok (*Brazier buckling*), gradien serat mikroskopis di kulit luar, hingga inspirasinya pada struktur tahan gempa Menara Taipei 101.
