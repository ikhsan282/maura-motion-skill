---
id: low-poly
name: Low Poly
no: 12
source: drive:12_Low_Poly + github:faceted-low-poly-3d
family: 3D
tech: threejs
music: cinematic   voice: el-id-m   captions: pop
best_for: sejarah maritim Nusantara, jalur rempah, geografi kepulauan, ekspedisi kapal Phinisi, gunung berapi & cincin api, perbandingan pulau/kota dunia
---
# Low Poly

**Ciri khas (look):** dunia 3D *low-poly faceted* dengan *flat shading* (`flatShading: true`) di mana setiap bidang segitiga menangkap pantulan cahaya matahari dan bayangan secara tegas. Lautan poligonal biru safir yang bergelombang kristal, pulau karang berundak dengan pantai pasir emas, gunung api *faceted*, pohon pala dan kelapa poligonal, kapal layar (Galleon abad ke-17 & Phinisi Nusantara), benteng bintang kolonial, hingga *skyline* gedung pencakar langit berbentuk prisma. Dilengkapi lencana HUD heksagonal di lapisan 2D.

**Gerak (motion):** permukaan laut memantul per-verteks membentuk riak segitiga hidup (`sea.tick(t)`), kapal mengangguk mengikuti ombak (`ship.bob(t)`), kamera sinematik mengorbit pulau dan meluncur di atas samudra (`orbit`, `camLerp`), buah pala raksasa membelah di udara memperlihatkan fuli merah menyala, serta gunung berapi menyemburkan batu bara dan asap ikosahedral (`volcano.tick(t, erupt)`).

**Kenapa menarik:** estetika diorama *low-poly* ala game indie modern (seperti *Monument Valley* / *Polytopia*) langsung memikat mata di layar vertikal, punya kedalaman ruang 3D yang nyata, dan sangat cocok untuk bercerita tentang peta, pulau, laut, dan sejarah Nusantara.

**Cerita yang cocok:**
- Pulau Run di Kepulauan Banda: "Pulau sekecil ini pernah ditukar dengan Manhattan, New York!"
- Kapal Phinisi Nusantara: "Dibangun tanpa satu paku besi pun, namun sanggup menyeberangi samudra."
- Cincin Api Nusantara: "Kenapa Indonesia punya gunung berapi aktif paling banyak di dunia?"
- Selat Malaka: "Jalur laut sempit yang diperebutkan kerajaan dunia selama seribu tahun."

**Rumus hook:** "Pulau sekecil [X] ini ternyata pernah ditukar dengan [kota raksasa]!" / "Tanpa [teknologi modern], bagaimana leluhur kita menaklukkan [samudra/alam]?" / "Di bawah laut biru ini, tersembunyi [fakta geologi/sejarah mengejutkan]."

**Kit API (`styles/low-poly/kit.js`):**
- Stage & Kamera: `createStage(AM, {fov, bg, fog})`, `lightRig(scene)` (`aim()`, `mood()`), `look(cam, pos, target)`, `camLerp(cam, A, B, u, t)`, `orbit(cam, center, ang, rad, h, t)`.
- Geometri & Material: `polyMat(color, opts)`, `jitterGeo(geo, amp, seed)` (membuat permukaan *faceted* kedap air).
- Laut & Pulau: `polySea({size, segs, color})` (`sea.tick(t, amp, speed)`), `polyIsland({r, h, seed})`, `polyVolcano({r, h, lava})` (`volcano.tick(t, erupt)`).
- Pohon & Properti: `polyTree('palm'|'nutmeg'|'pine', {s, seed})`, `polyNutmegProp({s})` (`setOpen(u)`), `polyFort({s})`, `polyCitySkyline({count, radius})`, `polyCloud({s, seed})`.
- Kapal: `polyShip('phinisi'|'galleon', {s, flagColor})` (`ship.bob(t, phase, amp)`).
- HUD 2D: `polyBadge(ctx, title, sub, x, y, {alpha, accent})`, `polyVignette(ctx, alpha)`.

**Koleksi Demo (`demo1`, `demo2`, `demo3` — 30–90 detik):**
- **`demo1`** — *Pulau Run & Manhattan — Pulau Pala Kecil yang Ditukar dengan New York* (9 shot, ~56 dtk): Pulau Run di Kepulauan Banda → hutan pohon pala & buah pala terbelah memperlihatkan fuli merah seharga emas → armada kapal Galleon Belanda & Inggris memperebutkan Pulau Run + Benteng Belgica → Perjanjian Breda 1667 → perbandingan langsung Pulau Run vs pulau Manhattan berlatar gedung pencakar langit → pesan sejarah jalur rempah Nusantara.
- **`demo2`** — *Kapal Phinisi Nusantara — Mahakarya Penakluk Samudra Tanpa Paku Besi* (9 shot, ~55 dtk): Phinisi membelah ombak biru *low-poly* di matahari terbit → struktur lambung kayu ulin & pasak kayu di tepi pantai Bulukumba → filosofi dua tiang utama dan tujuh layar → menembus badai gelombang samudra → berlayar hingga Madagaskar dan Vancouver → warisan budaya dunia UNESCO.
- **`demo3`** — *Cincin Api Nusantara — Bagaimana Gunung Berapi Membentuk Kepulauan Indonesia* (9 shot, ~55 dtk): Deretan pulau vulkanik Nusantara dari udara → tumbukan lempeng tektonik di dasar samudra → gunung api *low-poly* meletus dahsyat menyemburkan lava pijar → abu vulkanik menyuburkan tanah hijau & hutan tropis → kawah danau kaldera yang tenang → hidup berdampingan secara bijak di atas Cincin Api Pasifik.

