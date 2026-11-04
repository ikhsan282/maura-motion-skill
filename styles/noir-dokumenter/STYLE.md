---
id: noir-dokumenter
name: Noir Dokumenter
no: 37
source: github:cinematic-noir-documentary
family: retro-digital
tech: canvas2d
music: noir   voice: el-id-m   captions: typewriter
best_for: sejarah yang terlupakan, bencana, misteri, true crime, kasus belum terpecahkan, arsip kolonial
---
# Noir Dokumenter

**Ciri khas (look):** berkas perkara di meja gelap: kertas tua sepia #d8c9a8 bernoda kopi dan lipatan, ketikan mesin tik (Special Elite) tinta #1d1915, **bar sensor hitam**, **stempel karet merah** #b0221c yang aus (Bebas Neue), lingkaran tinta merah tangan, klip kertas, pin merah dan benang merah. Ilustrasi bergaya **engraving**: arsiran garis untuk gunung api, ombak, bola dunia, peta antik dengan garis pantai "waterlined". Film: grain berat, gate weave, flicker, goresan, vignette kuat.

**Gerak (motion):** Ken Burns pelan pada setiap lembar, teks diketik huruf demi huruf dengan kursor, **bar sensor lepas** tepat saat angka diucapkan, stempel **menghantam** (skala turun + getar), benang merah terbentang antar-pin, gelombang tekanan berupa lingkaran yang menjalar di bola dunia, jarum barograf menggambar lonjakan. Pergantian lampiran dengan potongan keras lewat hitam (2 frame).

**Kit API (`styles/noir-dokumenter/kit.js`):**
- `PAL`, `pr`; film: `weave(t)` (gate weave), `filmLook(ctx, t, AM, {grain, flick})`: flicker + goresan + vignette + grain.
- Kertas: `paperSheet(w, h, seed)`, `paper(ctx, x, y, w, h, {rot})`, `desk(ctx)`, `clip(ctx, x, y)`.
- Berkas: `type(ctx, text, x, y, p, {size, color})`: mesin tik; `textW`; `redact(ctx, x, y, w, h, off)`: bar sensor yang meluncur lepas; `stamp(ctx, text, x, y, p, {size, rot, sub})`: stempel aus; `circleMark(...)`: lingkaran tinta merah.
- Engraving (cache): `volcanoArt('big'|'small')`, `waveArt()`, `mapArt()` + `MAP.proj(lon, lat)`: peta Samudra Hindia; `pin`, `string`: pin dan benang merah.
- `globe(ctx, cx, cy, R, rot, rings, {lon0, lat0})`: bola dunia dengan lingkaran gelombang; `barograph(ctx, x, y, w, h, p, spikes)`: pita barograf.

## Paket Demo (30–90 Detik)
1. **`demo1/` — *Krakatau 1883: Suara Paling Keras dalam Sejarah — Berkas Bencana yang Mengguncang Dunia*** (~54 dtk): Berkas perkara letusan 27 Agustus 1883, bar sensor lepas `4.800 km` ke Pulau Rodrigues, gelombang kejut mengitari bumi 7 kali di barograf, tsunami 36.417 jiwa, hingga kemunculan Anak Krakatau (`STATUS: AKTIF`).
2. **`demo2/` — *Letusan Tambora 1815 — Tahun Ketika Dunia Kehilangan Musim Panas*** (~64 dtk): Misteri salju bulan Juni 1816 di Eropa & Amerika, terpangkasnya puncak Gunung Tambora di Sumbawa dari 4.300m menjadi 2.850m (`150 KM³ BATUAN`), tirai aerosol belerang stratosfer, lahirnya novel *Frankenstein*, hingga 71.000+ korban jiwa.
3. **`demo3/` — *Misteri Kapal SS Ourang Medan 1947 — Pesan SOS Terakhir dari Selat Malaka*** (~64 dtk): Arsip sinyal Morse darurat dari perairan Selat Malaka, pesan terakhir `"AKU MATI"`, pelacakan koordinat oleh kapal *Silver Star*, ledakan palka nomor 4, hingga perdebatan kargo kimia rahasia.
