---
id: synthwave
name: Synthwave Neon
no: 47
source: github:synthwave-tron
family: retro-digital
tech: canvas2d
music: synthwave   voice: id-m   captions: neon
best_for: sejarah musik & teknologi 80-90an, penemuan tak sengaja, budaya pop retro, game & arcade, "masa depan versi masa lalu"
---
# Synthwave Neon

**Ciri khas (look):** langit hitam-ungu (#05010d → #1a0633 → #4a0d5e → #a3196f), matahari bergaris kuning-oranye-
magenta (#ffe066 → #ff8a3d → #ff2bd6) dengan garis yang bergulir ke atas, gunung wireframe di cakrawala, lantai
grid neon cyan #22e6ff / magenta #ff2bd6 yang melaju ke kamera, bintang berkelip. Semua benda adalah line art
neon (3 lapis goresan: halo lebar, glow, inti putih). Judul chrome 80-an (gradasi biru-putih-coklat-peach dengan
garis horizon logam, rim magenta), teks tanda neon Orbitron, scanline tipis + vignette.

**Gerak (motion):** dolly tanpa henti di atas grid, drummer neon memukul drum (stik terangkat-turun, drum
menyala, cincin kejut), meter LED VU melonjak, jarum kompresor mentok, osiloskop gelombang dengan ekor gema
yang **dipotong gate** (garis merah CUT, serpihan jatuh), kaset bertahun 1980-1989 terbang dari cakrawala,
layar bergetar pada dentuman, sobekan tracking + kilat magenta di tiap cut. Judul chrome muncul dengan pantulan.

**Kenapa menarik:** nostalgia 80-an instan, warna neon menonjol di feed, dan "suara" bisa dilihat: setiap
pukulan drum punya gambar (cincin, meter, gelombang), jadi cerita audio terasa visual.

**Cerita yang cocok:**
- Gated reverb: "Suara drum ikonik 80-an lahir dari kecelakaan."
- Walkman 1979: "Insinyurnya menolak... bosnya ingin musik bisa dibawa jalan."
- Roland TR-808: "Mesin drum gagal ini jadi detak jantung hip-hop."
- Auto-Tune: "Alat untuk mencari minyak bumi... berakhir di lagu pop."
- Pac-Man: "Bentuknya terinspirasi pizza yang kurang satu potong."
- Kaset vs CD: "Pita 60 menit yang mengubah cara kita patah hati."

**Rumus hook:** "[Benda ikonik] lahir dari [kesalahan/kebetulan]." / "Tanpa [hal kecil], [era] akan terdengar
berbeda." / "Tahun [X], semua orang ingin suara ini... dan tak ada yang tahu asalnya."

**Kit API (`styles/synthwave/kit.js`):**
- `PAL, HZ`; `neon(g, color, w, {core, alpha, halo})` (goresan path saat ini), `glow(g, x, y, r, color, alpha)` (sprite cache).
- Dunia: `sky(g, t)`, `sun(g, t, {x, y, r, pulse})`, `mountains(g, t)`, `grid(g, t, {speed, color, color2, pulse})`.
- Tipografi: `chrome(g, str, x, y, {size, scale, alpha, rim})` / `chromeText()`, `neonText(g, str, x, y, {size, color, font, flicker})`.
- Line art: `drummer(g, x, y, s, t, {hits:{kick,snare,tom1,tom2,floor}, cymbals})`, `mic(g, x, y, s, {swing, talk})`,
  `vu(g, x, y, w, h, level, {peak})`, `needle(g, x, y, w, h, v)`, `scope(g, x, y, w, h, t, hits, {tail, gate, threshold, label})`,
  `rings(g, x, y, t, hitTime)`, `hitEnv(t, times)`, `crtOverlay(g)`.

**Demo:** "Suara Drum 80-an Lahir dari Kecelakaan", 19,5 detik: drummer neon di grid, cincin kejut, "80-AN" chrome →
ruang studio wireframe "LONDON 1979", mikrofon talkback turun dan "cek... cek..." di atas Phil Collins →
KOMPRESOR, jarum mentok, BOOM! (layar bergetar, meter merah) → NOISE GATE: dua osiloskop, garis merah CUT
memotong ekor gema (engineer Hugh Padgham) → "GATED REVERB" chrome, kaset 1980-1989 terbang, "lahir dari
mikrofon untuk ngobrol".
