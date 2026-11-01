---
id: wayang-kulit
name: Wayang Kulit
no: 11
source: drive:11_Wayang_Kulit + github:silhouette-shadow-play
family: craft
tech: canvas2d
music: gamelan   voice: id-m   captions: serif
best_for: Mahabharata, Ramayana, Panji, legenda Nusantara, kisah kepahlawanan, filosofi Jawa, cerita moral
---
# Wayang Kulit

**Ciri khas (look):** bayangan wayang kulit di kelir (layar katun) yang diterangi blencong. Kelir bergradasi
hangat: inti #fff1c9 → #f6c46f → #d9822f → tepi #7a3612 → gelap #1d0b04, tekstur katun tipis. Bayangan
#120703 dengan tepi sedikit lembut, **tatahan** (lubang ukiran) yang menembuskan cahaya: mata almond, kalung,
sabuk, pola belah ketupat/kawung di kain. Tokoh alus (Arjuna, Kresna) ramping dengan hidung runcing dan
kepala tertunduk; gagah (prajurit) lebih lebar. Gunungan (kayon) bermotif pohon hayat dan gapura. Teks:
Cinzel, huruf gelap berbingkai emas dengan halo hangat (terbaca di layar terang).

**Gerak (motion):** lampu berkedip (cahaya dan titik panas sedikit bergeser), wayang meluncur di atas
gedebog dengan sedikit naik-turun dan goyang (tangan dalang), lengan bergerak pada tuding, wayang **berbalik
arah dalam satu kibasan**, gunungan **membuka dan menutup** adegan serta **bergetar** saat perang (gara-gara).
Gerak khas: bayangan **membesar dan mengabur** saat wayang ditarik mendekati lampu (dipakai untuk wujud
semesta Kresna). Setiap potongan adegan diberi kilatan lampu singkat.

**Kenapa menarik:** budaya yang langsung dikenali, kontras siluet di layar keemasan terbaca jelas di HP,
lubang ukiran yang berkilau terlihat mewah, dan gerak bayangan terasa magis. Suara gamelan, gong, dan keprak
menambah suasana "pertunjukan malam".

**Cerita yang cocok:**
- Arjuna di Kurusetra (Bhagavad Gita): "Kesatria terhebat di dunia... menjatuhkan busurnya."
- Bima mencari air suci (Dewa Ruci): "Ia disuruh gurunya mencari air di dasar samudra. Itu jebakan."
- Gatotkaca gugur: "Ia sengaja terbang ke arah senjata yang paling ditakuti."
- Semar, dewa yang menyamar jadi abdi: "Pelayan paling sederhana ini... ternyata dewa."
- Karna, kakak yang tak diakui: "Ia baru tahu siapa ibunya sehari sebelum perang."
- Ramayana: Rahwana menculik Sinta (siluet terbang, kereta).

**Rumus hook:** "[Tokoh terhebat] ... [melakukan hal yang tak terduga]." / "[Benda/tempat] ini ternyata
[asal-usul mengejutkan]." / "Ini kisah [hubungan keluarga] yang [konflik] di [tempat legendaris]."

**Kit API (`styles/wayang-kulit/kit.js`):**
- `kelir(ctx, t, {glow, flick, hx, hy})`: layar yang menyala dan berkedip (hanya menggambar area yang terlihat kamera).
- `gedebog(ctx, y)`: batang pisang di bawah, tempat wayang ditancapkan.
- `puppet(ctx, name, {x, y, s, face, armF:[a1,a2], armB, depth, alpha, t, wobble, fill, rods})`: tokohnya
  `arjuna`, `kresna`, `bisma`, `durna`, `prajurit`. `face` bernilai 1 atau -1 (nilai di antaranya = sedang berbalik),
  `depth` 0..1 membuat bayangan membesar dan mengabur, `fill` mengisi bagian dalam siluet (misalnya `cosmosFill(t)`).
- `hand(name, o, 'F'|'B')` → `[x, y, scale]`: posisi ujung tangan, untuk memegang properti.
- `gunungan(ctx, x, y, {s, rot, depth, alpha, flip})`, `bow(ctx, x, y, {s, rot, drawn})`, `arrow(ctx, x, y, ang)`,
  `horse(ctx, x, y, {s, phase})`, `chariot(ctx, x, y, {s, wheel, flag})`.
- `nameplate(ctx, text, x, y, {alpha, size})`, `goldTitle(ctx, text, x, y, {size, alpha})`, `cosmosFill(t)`, `flicker(t)`, `viewRect(ctx)`, `spline(ctx, pts)`.
- Menambah tokoh: tambahkan entri di `CHARACTERS` (tubuh `alus`/`gagah`, `HEADGEAR`, `BEARD`), lalu lubang-lubangnya di `puppetBody`.

**Demo:** "Arjuna di Kurusetra", sekitar 61 detik, 14 shot. Gunungan membuka adegan → Arjuna dan busurnya →
kereta perang → 100 Kurawa → Bisma dan Durna → ragu (bayangan ganda) → busur jatuh → kusir berbalik, ternyata
Kresna → nasihat → wujud semesta → Arjuna bangkit → perang Bharatayudha → judul Bhagavad Gita → Arjuna
membidik, gunungan menutup.
