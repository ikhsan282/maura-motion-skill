---
id: terminal-ascii
name: Terminal ASCII
no: 25
source: drive:25_Terminal_ASCII + github:terminal-crt + github:terminal-ascii
family: retro-digital
tech: canvas2d
music: darksynth   voice: id-m   captions: terminal
best_for: sejarah komputer & internet, kisah hacker, virus & keamanan siber, misteri digital, cara kerja teknologi, AI
---
# Terminal ASCII

**Ciri khas (look):** monitor CRT fosfor hijau. Grid karakter 36x40 (VT323) di kanvas "fosfor" 540x960 yang
ditampilkan 2x. Palet: latar #020904, hijau #46ff7e, terang #d6ffe2, redup #1f9a47, samar #0d4a22, aksen amber
#ffbf3a. Bloom murah (salinan 1/6 ukuran yang direntangkan di bawah teks tajam), lengkung barrel (48 strip
horizontal yang menyempit di atas/bawah), scanline, bezel plastik membulat dengan pantulan kaca, vignette.
Gambar semuanya dari karakter: ASCII ketikan tangan (disket 5.25", telepon, PC), gambar kanvas apa pun yang
diubah jadi karakter menurut terang-gelap (`asciiDraw`), huruf blok besar dari font bitmap 3x5 (`bigText`).

**Gerak (motion):** perintah diketik dengan kursor blok berkedip, hex dump bergulir dengan byte disorot
reverse-video, progress bar karakter, peta dunia ASCII dengan jalur infeksi merambat, gambar ASCII
beranimasi 12fps (orang berjalan, pintu terbuka), layar berkedip halus, pita refresh bergulir, sobekan
strip saat cut, dan layar **mati (power-off)** jadi garis lalu titik di akhir.

**Kenapa menarik:** terasa "masuk ke dalam mesin": autentik, misterius, kontras tinggi dan terbaca di HP.
Cocok untuk cerita teknologi yang ingin terlihat jujur dan dokumenter.

**Cerita yang cocok:**
- Virus Brain 1986: "Dua bersaudara menulis virus... berisi alamat mereka sendiri."
- Bug Y2K: "Dunia panik karena dua digit angka."
- ILOVEYOU (2000): "Email cinta yang melumpuhkan 10% komputer dunia."
- Email pertama: "Pesan pertama di internet cuma dua huruf: LO."
- Kata sandi paling populer: "Jutaan orang masih memakai 123456."
- Morris Worm 1988: "Mahasiswa ingin mengukur internet... dan malah merusaknya."

**Rumus hook:** "[Tahun], [siapa] menulis [kode] yang [hal tak masuk akal]." / "Satu baris kode ini [akibat
besar]." / "Di dalam file ini tersembunyi [rahasia]."

**Kit API (`styles/terminal-ascii/kit.js`):**
- `COLS, ROWS, CW, CH, SAFE_ROWS, PAL, RAMP`; `screen()`, `clear()` (awal frame).
- Teks grid: `put(col, row, str, {color, inv, alpha, chars})`, `lines()`, `typed(t, t0, cps)`, `cursor(col, row, t)`,
  `command(col, row, prompt, cmd, t, t0)`, `box(col, row, w, h, {title})`, `progress(col, row, w, frac)`,
  `hexDump(col, row, data, {offset, rows, start, hl, per})`, `wrap(str, w)`.
- Gambar: `asciiDraw(cols, rows, draw(g,w,h,t), {key, t, ramp})`, `asciiText(str, cols, rows)`, `bigText(str, {sx, sy, ch, gap})`,
  `art(col, row, lines, {color, reveal})`, `ART.floppy/phone/pc`, `WORLD` + `drawWorld(g, w, h)`.
- CRT: `present(ctx, t, {curve, bloom, flicker, glitch, power, band})` (power 1→0 = mati).
- Baris 0–27 aman di atas caption; baris 33+ hanya dekorasi (zona UI platform).

**Demo:** "Virus yang Mencantumkan Alamat Pembuatnya", 19,9 detik: DEBUG boot sector, hex dump menyorot
"Basit & Amjad" dan "730 NIZAM BLOCK", "1986" huruf blok → "BRAIN" masuk dengan glitch di atas disket,
progress infeksi → pesan asli "Welcome to the Dungeon" diketik, nama/alamat/telepon menyala saat diucapkan →
peta dunia ASCII, jalur infeksi dari Lahore ke UK/USA, disket bajakan berlipat → +25 tahun: sosok berjalan ke
730 Nizam Block, TOK TOK, pintu terbuka, "MASIH DI SINI." → layar mati.
