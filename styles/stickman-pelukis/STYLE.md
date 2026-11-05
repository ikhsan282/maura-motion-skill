---
id: stickman-pelukis
name: Stickman Pelukis
no: 67
source: custom:perfectionist-vs-action-taker
family: craft
tech: canvas2d
music: lofi   voice: el-id-m   captions: clean
best_for: perfeksionisme vs aksi, produktivitas kreator, eksperimen kuantitas vs kualitas, latihan terarah
---
# Stickman Pelukis

**Karakter Unik:**
- **Si Maestro Berbaret (`role: 'prolific'`)**: Mengenakan **topi baret pelukis miring bertangkai** (*crimson artist beret*), syal leher merah koral yang berkibar, celemek lukis penuh bercak cat warna-warni, **palet kayu berbentuk kacang** dengan 4 warna cat di tangan kiri, dan kuas lukis besar di tangan kanan.
- **Si Perfeksionis Loupe (`role: 'perfectionist'`)**: Mengenakan **kacamata loupe/monokel pembesar**, dasi kupu-kupu kaku, baret biru rapi, kuas detail tipis, serta tetesan keringat ragu-ragu.

**Ciri khas (look):** Studio lukis *atelier* gelap (`#100f14`), dua lampu gantung sorot hangat, kabinet kuas & cat di tengah, dua easel kayu di kiri dan kanan, tumpukan kanvas selesai (`#1–#16`) di lantai kanan, serta lukisan lanskap 4 tingkat (`tier 0` garis bantu → `tier 1` sketsa → `tier 2` gunung salju → `tier 3` mahakarya senja keemasan dengan kilau *sparkle*).

**Kit API (`styles/stickman-pelukis/kit.js`):**
- `K.pelukisBg(ctx, t, { floorY, leftHighlight, rightHighlight })`
- `K.pelukisHeader(ctx, leftScore, rightScore, mainTitle, subTitle, opts)`
- `K.studioStage(ctx, floorY, { leftTier, leftProg, leftLabel, rightTier, rightProg, rightLabel, pileCount, splatter, t })`
- `K.pelukisStickman(ctx, x, floorY, pose, { role: 'prolific'|'perfectionist', facing, t, a, holdTier })`
- `K.pelukisCard(ctx, x, y, w, h, { tag, titleStr, subStr, stat, statSub, col, a })`

**3 Demo (64–65 dtk, voice `el-id-m`):**
1. `demo1`: *Eksperimen Keramik & Kanvas — Mengapa Kuantitas Melahirkan Kualitas?*
2. `demo2`: *Kutukan Kanvas Putih — Mengalahkan Perfeksionisme dengan Draf Buruk Pertama*
3. `demo3`: *10.000 Jam vs 10.000 Goresan Sadar — Rahasia Deliberate Practice Para Maestro*
