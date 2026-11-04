---
id: synthwave
name: Synthwave Neon
no: 47
source: github:synthwave-tron
family: retro-digital
tech: canvas2d
music: synthwave   voice: el-id-m   captions: neon
best_for: sejarah musik & teknologi 80-90an, penemuan tak sengaja, budaya pop retro, game & arcade, "masa depan versi masa lalu"
---
# Synthwave Neon

**Ciri khas (look):** langit hitam-ungu (`#05010d` → `#1a0633` → `#4a0d5e` → `#a3196f`), matahari bergaris kuning-oranye-
magenta (`#ffe066` → `#ff8a3d` → `#ff2bd6`) dengan garis yang bergulir ke atas, gunung wireframe di cakrawala, lantai
grid neon cyan `#22e6ff` / magenta `#ff2bd6` yang melaju ke kamera, bintang berkelip. Semua benda adalah line art
neon (3 lapis goresan: halo lebar, glow, inti putih). Judul chrome 80-an (gradasi biru-putih-coklat-peach dengan
garis horizon logam, rim magenta), teks tanda neon `Orbitron`, scanline tipis + vignette.

**Gerak (motion):** dolly tanpa henti di atas grid, drummer neon memukul drum (stik terangkat-turun, drum
menyala, cincin kejut), meter LED VU melonjak, jarum kompresor mentok, osiloskop gelombang dengan ekor gema
yang **dipotong gate** (garis merah CUT, serpihan jatuh), mobil sport wireframe *OutRun*, step sequencer *Roland TR-808*,
serta kaset bertahun 1980-1989 terbang dari cakrawala.

**Kenapa menarik:** nostalgia 80-an instan, warna neon menonjol di feed, dan "suara" bisa dilihat: setiap
pukulan drum punya gambar (cincin, meter, gelombang), jadi cerita audio terasa visual.

**Cerita yang cocok:**
- Gated reverb: "Suara drum ikonik 80-an lahir dari kecelakaan."
- Laser & Grid: "Bagaimana estetika Synthwave melahirkan masa depan dari masa lalu."
- Roland TR-808: "Mesin drum gagal ini jadi detak jantung musik modern."
- Walkman 1979: "Insinyurnya menolak... bosnya ingin musik bisa dibawa jalan."
- Auto-Tune: "Alat untuk mencari minyak bumi... berakhir di lagu pop."

**Rumus hook:** "[Benda ikonik] lahir dari [kesalahan/kebetulan]." / "Tanpa [hal kecil], [era] akan terdengar
berbeda." / "Tahun [X], semua orang ingin suara ini... dan tak ada yang tahu asalnya."

**Kit API (`styles/synthwave/kit.js`):**
- `PAL, HZ`; `neon(g, color, w, {core, alpha, halo})` (goresan path saat ini), `glow(g, x, y, r, color, alpha)` (sprite cache).
- Dunia: `sky(g, t)`, `sun(g, t, {x, y, r, pulse})`, `mountains(g, t)`, `grid(g, t, {speed, color, color2, pulse})`.
- Tipografi: `chrome(g, str, x, y, {size, scale, alpha, rim})` / `chromeText()`, `neonText(g, str, x, y, {size, color, font, flicker})`.
- Line art: `drummer(g, x, y, s, t, {hits:{kick,snare,tom1,tom2,floor}, cymbals})`, `mic(g, x, y, s, {swing, talk})`,
  `vu(g, x, y, w, h, level, {peak})`, `needle(g, x, y, w, h, v)`, `scope(g, x, y, w, h, t, hits, {tail, gate, threshold, label})`,
  `rings(g, x, y, t, hitTime)`, `hitEnv(t, times)`, `crtOverlay(g)`.

**Daftar Demo:**
- **Demo 1 (`demo1/`):** *Suara Drum 80-an Lahir dari Kecelakaan — Rahasia Gated Reverb Phil Collins* (~63 dtk) — Kisah penemuan *gated reverb* di Townhouse Studio London 1979 saat sesi rekaman Peter Gabriel, mikrofon *talkback* konsol SSL 4000E ber-kompresor ekstrem yang dipotong *noise gate* oleh Hugh Padgham, hingga meledaknya lagu *In the Air Tonight* (1981).
- **Demo 2 (`demo2/`):** *Laser, Grid & Matahari Bergaris — Estetika Synthwave Masa Depan dari Masa Lalu* (~64 dtk) — Asal-usul elemen visual Synthwave dari keterbatasan memori komputer grafis vektor *Tron* (1982), desain sampul kaset VHS, gim balap *OutRun* (1986), hingga tipografi *airbrush* krom dan kebangkitan *Retrowave*.
- **Demo 3 (`demo3/`):** *Roland TR-808 — Mesin Drum Gagal 1980 yang Menjadi Detak Jantung Musik Modern* (~65 dtk) — Perjalanan Roland TR-808 ciptaan Ikutaro Kakehashi yang memakai transistor *noise* cacat `2SC828-R`, gagal bersaing dengan Linn LM-1 dan dihentikan tahun 1983, lalu diborong dari toko pegadaian seharga \$100 hingga melahirkan dentuman *sub-bass* *Planet Rock* dan *Sexual Healing*.
