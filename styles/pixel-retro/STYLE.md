---
id: pixel-retro
name: Pixel Retro 16-bit
no: 7
source: drive:07_Pixel_Retro + github:pixel-art + github:pixel-art-16bit
family: retro-digital
tech: canvas2d
music: chiptune   voice: el-id-m   captions: pixel
best_for: legenda & tokoh rakyat, sejarah sebagai "level", biografi singkat, finansial/karier ala RPG, budaya pop, tantangan
---
# Pixel Retro 16-bit

**Ciri khas (look):** layar game side-scroller asli: semua digambar di buffer 135x240 dengan fillRect
(tanpa anti-alias), lalu diperbesar 8x nearest-neighbour. Palet 32 warna (`PAL`): langit #3d6fd0 → #63a2e8 →
#9fd0f4, senja #4b2f6e/#7b3f7f/#c45f86/#f19a73, malam #0d0a1c/#232a5c, tanah #ad7748/#6e4129, emas #f0b030/#ffe46a,
merah #c3303b, garis tinta #0d0a1c. Gradasi langit pakai dithering Bayer 4x4. Sprite punya outline 1px otomatis.
Lapisan parallax: gunung jauh (Gunung Salak), gedung kolonial berkabut, rumah kebaya Betawi (gigi balang,
langkan), pohon kelapa, lampu gas, tanah berumput/batu/dermaga. HUD hati + SKOR + LEVEL. Teks: Press Start 2P
di grid 8px (di-threshold supaya tajam) + font mini 3x5 untuk tulisan kecil.

**Gerak (motion):** sprite berpose 2–4 frame (lari 12fps, jalan, lompat, tebas golok, tinju, tendang, kena tembak,
roboh, bersorak), dunia bergulir parallax, koin berputar 4 frame, popup +100, puff debu, sparkle, layar bergetar
per piksel saat kena pukul. Transisi: **mosaic SNES** di setiap potongan, iris wipe, warna luntur ke abu-abu saat
kalah, huruf GAME OVER runtuh. Signature: judul LEVEL 1 meluncur + karakter langsung berlari di detik pertama.

**Kenapa menarik:** nostalgia game langsung terbaca di HP, sejarah jadi "level" yang ada bos dan nyawanya, dan
tiap ketukan cerita punya bahasa game (skor, 1UP, WARNING, GAME OVER, CONTINUE?) yang dipahami semua orang.

**Cerita yang cocok:**
- Si Pitung: "Level 1: Batavia. Buronan nomor satu Belanda."
- Pangeran Diponegoro: "Bosnya punya 15.000 pasukan. Ia cuma punya kuda dan sorban."
- Cut Nyak Dien: "Boss fight terakhirnya... ia lakukan dalam keadaan buta."
- Sejarah internet Indonesia: "Level 1: 1994. Kecepatan: 14,4 kbps."
- Menabung sebagai RPG: "Inflasi adalah bos terakhir."
- Malin Kundang: "GAME OVER... karena satu kalimat ke ibunya."

**Rumus hook:** "Level 1: [tempat/tahun]. [tokoh] jadi [status ekstrem]." / "Bos terakhirnya adalah [lawan tak
terduga]." / "[Tokoh] punya [N] nyawa... dan semuanya habis di [tempat]."

**Kit API (`styles/pixel-retro/kit.js`):**
- `BW, BH, PX, PAL`; `makeScreen()` → `{c, g}`; `present(ctx, c, {dx, dy, lines})` upscale x8 + garis baris tipis.
- `mosaic(g, n)`, `grade(g, {gray, tint, dark})`, `iris(g, cx, cy, r)`, `dither(g, a, b, level)` (pattern Bayer).
- Primitif tajam: `R(g,x,y,w,h,c)`, `pline(g,x0,y0,x1,y1,w)`, `pcircle(g,cx,cy,r,c)`, `sprite(key, rows, map, {outline})`,
  `addOutline(c, col)`, `blit(g, spr, x, y, {ax, ay, flip, alpha})`.
- Teks: `text(g, str, x, y, {scale, color, outline, shadow, align, chars})`, `tiny(g, str, x, y, {...})`, `textW()`.
- Dunia: `skyBands(g, stops, y0, y1)`, `cloud`, `stars`, `mountain`, `betawiHouse(variant, night|'dusk')`, `dutchHall(haze)`,
  `canalHouse`, `palm(frame)`, `lamp(lit)`, `lampGlow`, `fence`, `crate`, `sack`, `moneyBag`, `ground(g, sx, y, 'grass'|'cobble'|'pier')`,
  `sea(g, y, h, t)`, `ship(variant, night)`.
- Karakter ber-rig: `drawChar(g, name, pose, x, y, {face, prop, flash, alpha})` → posisi tangan; `drawCharScaled`, `drawDown`,
  `portrait(g, name, x, y, scale)`, `cycle('run'|'walk'|'idle', t, fps, n)`. Tokoh: pitung, opas, hinne, naipin, tuan, rakyat,
  ibu, anak, kakek. Pose: idle0/1, run0-3, walk0-3, jump, fall, windup, slash, punch, kick, guard, cheer, cheerJ, point,
  raise, hurt, aim, bow, sit, tell0/1. Properti: golok, rifle, pistol, stick, cane, lantern. Tokoh baru = kepala + badan
  (grid string) di `HEADS`/`TORSOS` + entri `RIG`.
- Efek & UI: `coin`, `sparkle`, `puff`, `heart`, `popup`, `alert`, `streaks`, `hud(g, {hp, score, level, msg})`, `panel`, `bossBar`.

**Demo (30–90 detik):**
- **`demo1` — "Si Pitung: Level Batavia"** (~48 detik, 5 babak): LEVEL 1 Batavia (lari, koin, lompat, dikejar opas, BURONAN NO.1) → merampok tumpukan harta tuan tanah, kamera bergeser ke kampung yang dihujani koin → ditembak, roboh, bangkit "KEBAL! 1UP" → WARNING bos Schout Hinne lalu peluru emas slow-motion → GAME OVER 1893, huruf runtuh, CONTINUE? YA → "LEGENDA" di atap rumah Betawi, PRESS START.
- **`demo2` — "Kenapa Game Jadul 16-Bit Bikin Nagih?"** (~55 detik, 10 babak): Skor tinggi jujur di layar arcade → tantangan 3 nyawa melompati jurang paku tanpa auto-save → menghafal pola tembakan musuh & counter-attack presisi → peti harta di zona rahasia balik dinding → pertarungan Raja Terakhir dengan bar HP bos → layar GAME OVER & hitungan mundur CONTINUE → keseruan mabar giliran stik bersama teman sekampung → sindrom "1 Level Lagi!" → hujan koin kemenangan STAGE CLEAR → resep abadi game 16-bit.
- **`demo3` — "Tamagotchi 90-an: Jangan Sampai Mati!"** (~55 detik, 10 babak): Demam gantungan kunci cangkang telur 1990-an → telur piksel bergetar dan menetas di layar LCD → menekan tombol A-B-C memberi nasi kepal & permen → kotoran menumpuk & tanda sakit berkedip → menyelundupkan Tamagotchi di balik tas sekolah → panik saat alarm "Tit-Tit!" berbunyi di tengah kelas hening → tragedi lupa sehari hingga layar tinggal nisan → menusuk tombol reset belakang dengan ujung pulpen → evolusi karakter mahkota langka → hadir kembali di layar hape modern.
