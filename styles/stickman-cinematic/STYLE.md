---
id: stickman-cinematic
name: Stickman Cinematic
no: 72
source: custom:stickman-cinematic-kit
family: craft
tech: canvas2d
music: lofi   voice: el-id-m   captions: clean
best_for: motivasi sinematik malam hari, perjuangan diam-diam, disiplin vs lelah, surat dari masa depan
---
# Stickman Cinematic

**Ciri khas (look):** Panggung sinema *anamorphic widescreen* (`2.39:1` letterbox bars, `REC • 24 FPS`) dengan gradasi langit senja ke malam (`#160d2e` → `#9e2a5b` → `#ff8a3d`), matahari *lens flare* horizontal, dan siluet gedung kota yang tertidur. Karakter unik **Si Pengelana Jas Panjang (`cinematicStickman`)** tampil dalam siluet gelap berbalut **jas panjang (*trenchcoat*) berkibar**, **topi fedora sinematik**, **syal emas berkibar ditiup angin malam**, **cahaya tepi ganda (*cyan & sunset-orange dual rim light*)**, serta pantulan lantai basah di atap gedung.

**Gerak (motion):** Transisi 4 babak monolog sinematik dengan kibaran jas panjang dan syal mengikuti waktu `t`, partikel debu cahaya melayang, papan neon atap kota, dan kartu catatan sutradara di paruh bawah.

**Kenapa menarik:** Satu-satunya gaya stickman dengan tata cahaya film *neo-noir / golden hour* — memadukan siluet jas panjang, *anamorphic lens flare*, dan *dual rim light* sehingga pesan perjuangan terasa megah seperti adegan klimaks film layar lebar.

**Cerita yang cocok:**
- Motivasi malam hari & ketekunan saat orang lain tertidur
- Disiplin dalam kesunyian (membangun keahlian tanpa tepuk tangan penonton)
- Investasi waktu & rasa terima kasih dari dirimu di masa depan

**Kit API (`styles/stickman-cinematic/kit.js`):**
- `PAL` — palet langit senja sinematik, *dual rim light* (`rimCyan` & `sunsetOrange`), dan emas lensa
- `cinematicBg(ctx, t, opts)` — panggung sinema *letterbox* + siluet kota malam + matahari *anamorphic flare*
- `cinematicHeader(ctx, badgeText, title, subtitle, opts)` — header papan *cinema reel*
- `cinematicStickman(ctx, x, floorY, pose, opts)` — karakter unik Si Pengelana Jas Panjang (`'stand'`, `'walk'`, `'lookUp'`, `'focus'`, `'triumph'`)
- `cinematicProps(ctx, floorY, type, opts)` — properti atap gedung (`'rooftop'`, `'spotlight'`, `'horizon'`)
- `cinematicBubble(ctx, x, y, text, opts)` — balon dialog sinema gelap berteks emas
- `cinematicCard(ctx, cx, cy, w, h, opts)` — kartu sinematik di paruh bawah layar

**Demos:**
1. `demo1` — *Kota Tidur, Mimpimu Belum Selesai — Kekuatan Satu Jam Hening Sebelum Terlelap* (~64 dtk)
2. `demo2` — *Juara Ditempa Saat Lampu Panggung Mati — Mengapa Konsistensi di Saat Sepi Menentukan Hasil?* (~64 dtk)
3. `demo3` — *Surat dari Dirimu Satu Tahun Lagi — Mengapa Pengorbanan Kecil Malam Ini Layak Diperjuangkan?* (~65 dtk)
