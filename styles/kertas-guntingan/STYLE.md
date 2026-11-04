---
id: kertas-guntingan
name: Kertas Guntingan
no: 8
source: drive:08_Kertas_Guntingan + github:papercraft-cutout + github:cut-paper-collage
family: craft
tech: canvas2d
music: folk   voice: el-id-m   captions: hand
best_for: legenda Nusantara, dongeng anak, asal-usul tempat, cerita rakyat, kisah moral, sejarah lokal yang hangat
---
# Kertas Guntingan

**Ciri khas (look):** diorama kertas berlapis. Setiap bentuk adalah lembar kertas berwarna dengan serat
(fibre) dan bercak pulp; tepinya **digunting** (bersih) atau **disobek** (bergerigi dengan inti putih berserat).
Tiap lapis punya **bayangan jatuh lembut** ke lapis di bawahnya (cahaya dari kiri atas). Palet kertas kerajinan:
langit #a9d0dc→#d7ebe8, bukit #c7d3a4 / #9fb77d / #7d9c5c, pinus #2f5236, air #8fc4d8 / #4d8fb3 / #2e638a,
tanah #c69a63, aksen Batak merah #b9322b, hitam #2b2523, putih #fbf6ea, emas #e9ad2c. Tokoh adalah **boneka kertas
bersendi** dengan **paku keling kuningan** di bahu, siku, pinggul, lutut. Teks: huruf potong (Luckiest Guy) di
atas kertas krem, label sobekan kertas bertulisan tangan (Patrick Hand) ditempel **selotip washi**.

**Gerak (motion):** stop-motion (hold 2 = 12 gambar/detik). Lapisan **meluncur masuk** dari tepi dan mengendap
dengan sedikit pantulan; parallax multi-plane (langit lambat, latar depan cepat). Boneka berjalan, mencangkul,
menunjuk, mengangguk, berteriak (ekspresi diganti per potongan: alis, mulut). Air = strip kertas yang
bergoyang berlawanan fase; hujan = serpihan kertas tipis; huruf judul **jatuh satu per satu** dan miring sedikit;
gelembung teriakan sobek bergetar.

**Kenapa menarik:** terasa buatan tangan (bukan "AI"), hangat dan nostalgik, kontras warna terbaca di HP,
bayangan antarlapis memberi kedalaman nyata. Cocok untuk penonton keluarga dan konten budaya.

**Cerita yang cocok:**
- Legenda Danau Toba: "Satu kalimat terlarang menenggelamkan lembah jadi danau raksasa."
- Tangkuban Perahu: "Gunung ini sebenarnya perahu yang ditendang hingga terbalik."
- Batu Menangis: "Gadis tercantik di desa ini... menangis sampai jadi batu."
- Timun Mas: "Ia lolos dari raksasa hanya dengan empat bungkusan kecil."
- Asal-usul Banyuwangi: "Nama kota ini lahir dari air yang tiba-tiba berbau harum."

**Rumus hook:** "[Satu hal kecil] ... [mengubah alam selamanya]." / "[Tempat terkenal] ini dulunya [sesuatu yang
mengejutkan]." / "Ia hanya melanggar satu janji, dan [akibat besar]."

**Kit API (`styles/kertas-guntingan/kit.js`):**
- `view(ctx, C, k)`: kamera multi-plane (C = {x,y,z,rot,sx,sy}, k = faktor parallax lapis); `viewRect(ctx)`.
- `piece(key, sheets | () => sheets, {res})`: rakit lembar kertas (cached): tiap sheet `{pts, fill, edge:'cut'|'torn', rim, amp, lift, detail(g)}`.
- `draw(ctx, P, x, y, {s, sx, sy, rot, lift, alpha, flip})`: gambar potongan + bayangan jatuh (bayangan dipanggang untuk lembar besar).
- `prop(ctx, handMatrix, P, {rot, x, y})`: properti di tangan boneka; `pt(m, x, y, ctx)`: titik dunia dari matriks sendi.
- `puppet(ctx, 'toba'|'putri'|'samosir'|'darmi'|'ibu'|'sidapaksa'|'sritanjung'|'raja', {x, y, s, flip, rot, P})` → `{headM, handF, handB}`; `pose({...})`, `walk(phase, amt)`.
- Pemandangan: `sky`, `sunPiece`, `cloudPiece`, `stormCloud`, `hillPiece`, `ridgePts`, `pineTree`, `roundTree`, `palmTree`,
  `fern`, `rumahBolon`, `fieldPiece`, `water(ctx, t, x, y, {n})`, `rain(ctx, t, {amt})`, `bolt`.
- `fish(ctx, x, y, {s, rot, flap})`: ikan emas; `PROPS.hoe/rod/bekal/rice/mirror/basket/keris/lotus`.
- Teks: `cutTitle(ctx, text, x, y, t, t0, {size, cols})`, `tag(ctx, text, x, y, {size, rot, tape})`, `shoutBubble(...)`.
- Penutup: `finish(ctx)` (serat + vinyet, satu drawImage), `tornWipe(ctx, p)`, `slideIn(t, a)`, `jig(t, seed)`.
- Tokoh baru: tambah entri di `RIGS` (warna kulit, rambut, kain, `woman`/`child`).

**Koleksi Demo (`styles/kertas-guntingan/`):**
- **`demo1` — "Legenda Danau Toba"** (~62 detik, 6 bagian): Lembah hijau dibanjiri air kertas dan judul `DANAU TOBA` jatuh huruf per huruf → Toba memancing, ikan emas melompat → ikan berbalik jadi putri jelita → catatan sobek `"Jangan ungkit asal-usulku!"` → Toba berteriak `"DASAR ANAK IKAN!"` pada Samosir → badai, petir, air menyembur menenggelamkan lembah menyisakan Pulau Samosir → pesan `"JAGA JANJIMU"`.
- **`demo2` — "Legenda Batu Menangis dari Kalimantan"** (~55 detik, 9 bagian): Monumen batu menangis di puncak bukit Kalimantan → Ibu janda yang rajin mencangkul vs Darmi yang sibuk bercermin → berjalan ke pasar desa (Ibu di belakang memikul keranjang) → Darmi membantah `"BUKAN IBUKU! CUMA PEMBANTU!"` → doa Ibu di tanah berdebu → petir menyambar dan kaki Darmi membatu lapis demi lapis kertas abu-abu → pesan `"HORMATI IBUMU"`.
- **`demo3` — "Asal-Usul Nama Banyuwangi"** (~55 detik, 9 bagian): Sungai harum bertabur bunga teratai kertas → Patih Sidapaksa & Sri Tanjung di Kerajaan Sindurejo → Raja mengutus Sidapaksa ke puncak gunung lalu meniupkan fitnah keji → di tepi tebing sungai curam, Sri Tanjung bersumpah `"AKU SUCI!"` → air sungai berkilau keemasan dan menebarkan aroma `"HARUM SEMERBAK!"` → penyesalan Sidapaksa `"BANYU WANGI!"` → pesan `"PERIKSA KEBENARAN"`.
