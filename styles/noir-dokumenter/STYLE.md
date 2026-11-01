---
id: noir-dokumenter
name: Noir Dokumenter
no: 37
source: github:cinematic-noir-documentary
family: retro-digital
tech: canvas2d
music: noir   voice: id-m   captions: typewriter
best_for: sejarah yang terlupakan, bencana, misteri, true crime, kasus belum terpecahkan, arsip kolonial
---
# Noir Dokumenter

**Ciri khas (look):** berkas perkara di meja gelap: kertas tua sepia #d8c9a8 bernoda kopi dan lipatan, ketikan mesin tik (Special Elite) tinta #1d1915, **bar sensor hitam**, **stempel karet merah** #b0221c yang aus (Bebas Neue), lingkaran tinta merah tangan, klip kertas, pin merah dan benang merah. Ilustrasi bergaya **engraving**: arsiran garis untuk gunung api, ombak, bola dunia, peta antik dengan garis pantai "waterlined". Film: grain berat, gate weave, flicker, goresan, vignette kuat.

**Gerak (motion):** Ken Burns pelan pada setiap lembar, teks diketik huruf demi huruf dengan kursor, **bar sensor meluncur lepas** tepat saat angka diucapkan, stempel **menghantam** (skala turun + getar), benang merah terbentang antar-pin, gelombang tekanan berupa lingkaran yang menjalar di bola dunia, jarum barograf menggambar lonjakan. Pergantian lampiran dengan potongan keras lewat hitam (2 frame).

**Kenapa menarik:** celah rasa ingin tahu ("apa yang disensor?"), tekstur arsip yang memberi kesan kredibel, dan ritme dokumenter yang tenang tapi menegangkan. Cocok untuk sejarah Indonesia yang jarang diceritakan.

**Cerita yang cocok:**
- Krakatau 1883: "Ledakan ini terdengar sampai 4.800 kilometer."
- Tambora 1815: "Gara-gara gunung ini, Eropa tak punya musim panas."
- Kapal Van der Wijck tenggelam (fakta di balik novel).
- Hilangnya Tan Malaka: "Makamnya baru ditemukan 60 tahun kemudian."
- Batavia 1740: "Satu malam yang tidak ada di buku pelajaranmu."

**Rumus hook:** "[Kejadian] ini [dampak yang sulit dipercaya] sampai [jarak/angka]." / "Berkas nomor [tahun]. Status: [belum ditutup]." / "Koran menyebutnya [julukan]. Ini yang sebenarnya terjadi."

**Kit API (`styles/noir-dokumenter/kit.js`):**
- `PAL`, `pr`; film: `weave(t)` (gate weave), `filmLook(ctx, t, AM, {grain, flick})`: flicker + goresan + vignette + grain.
- Kertas: `paperSheet(w, h, seed)`, `paper(ctx, x, y, w, h, {rot})`, `desk(ctx)`, `clip(ctx, x, y)`.
- Berkas: `type(ctx, text, x, y, p, {size, color})`: mesin tik; `textW`; `redact(ctx, x, y, w, h, off)`: bar sensor yang meluncur lepas; `stamp(ctx, text, x, y, p, {size, rot, sub})`: stempel aus; `circleMark(...)`: lingkaran tinta merah.
- Engraving (cache): `volcanoArt('big'|'small')`, `waveArt()`, `mapArt()` + `MAP.proj(lon, lat)`: peta Samudra Hindia; `pin`, `string`: pin dan benang merah.
- `globe(ctx, cx, cy, R, rot, rings, {lon0, lat0})`: bola dunia dengan lingkaran gelombang; `barograph(ctx, x, y, w, h, p, spikes)`: pita barograf.

**Demo:** "Krakatau 1883: Suara Paling Keras dalam Sejarah", 18,9 detik. Berkas perkara dengan foto engraving letusan, bar sensor lepas: "TERDENGAR SEJAUH 4.800 km" (Pulau Rodrigues) → peta antik, pin Krakatau dan Rodrigues, benang merah "± 4.800 km", "dikira dentuman meriam" → bola dunia dengan gelombang tekanan yang menjalar, barograf "terekam 7x dalam 5 hari" → engraving tsunami, stempel TSUNAMI, sensor lepas "36.417 JIWA" (catatan resmi) → Anak Krakatau (muncul 1927), stempel "BELUM DITUTUP", "STATUS: AKTIF".
