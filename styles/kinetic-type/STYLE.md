---
id: kinetic-type
name: Tipografi Kinetik
no: 33
source: github:kinetic-type-slam + color-block-kinetic-type
family: typography
tech: canvas2d
music: hype   voice: id-m   captions: none (teksnya adalah gambarnya)
best_for: manifesto, motivasi, tips kebiasaan, mitos vs fakta, hot take, kutipan, "3 kesalahan ...", aturan/rumus singkat
---
# Tipografi Kinetik

**Ciri khas (look):** huruf condensed raksasa (Bebas Neue) dan grotesk sangat tebal (Archivo Black) yang
memenuhi lebar kolom, 1–4 kata per beat. Bidang warna penuh yang berganti tiap beat: tomat #FF4B2B,
kobalt #2B3BFF, kuning bunga matahari #F5C400, tinta #0E0E0E, kertas #F2EFE8 (tiap bidang punya warna
tinta dan aksen tetap di `ON`). Titik/tanda tanya diberi warna aksen. Di belakang: dinding gema (kata yang
sama berulang dalam garis luar, bergeser kiri-kanan). Remah HUD kecil JetBrains Mono: label, `BEAT 07/42`,
timecode, scrubber. Ikon piktogram datar tebal dalam bahasa grafis yang sama: sepatu (tali bisa diikat),
buku (tertutup berjudul / terbuka dengan halaman dibalik), stopwatch (irisan progres), kotak suara
bercentang, tangga, turus.

**Gerak (motion):** setiap kata **mendarat tepat saat diucapkan** (waktu kata asli dari `align.py`).
Efek masuk: `slam` (pegas skala + squash + misregistrasi tomat/kobalt 3 frame), `rise` (naik dari garis
masker), `fall`, `drop` (huruf jatuh satu-satu), `wipe`, `stretch`, `ghost` (garis luar lalu terisi),
`type`. Coretan (strike-through) yang ditarik kiri→kanan, kotak stabilo di belakang kata, garis bawah.
Bidang warna **potong keras** di beat; kamera push-in pelan tiap shot, guncangan + kilat 1 frame pada
kata-kata besar, whip-in dari samping. Akhir: kata terakhir "bernapas" dan stopwatch mulai menghitung mundur.

**Kenapa menarik:** tetap terbaca tanpa suara, berubah setiap ½ detik (retensi tinggi), terasa seperti
poster desainer yang bergerak; warna penuh tampil mencolok di feed.

**Cerita yang cocok:**
- Aturan dua menit: "Kamu tidak butuh motivasi. Kamu butuh dua menit."
- Teknik Feynman: "Kalau tidak bisa menjelaskannya dengan sederhana, kamu belum paham."
- 3 kebohongan soal algoritma: "Algoritma tidak membencimu." (tiap kebohongan dicoret)
- Aturan 5 detik: "Hitung mundur 5-4-3-2-1. Lalu bergerak."
- Bunga majemuk: "Satu persen lebih baik setiap hari... jadi 37 kali lipat."
- Hukum Parkinson: "Pekerjaan memuai sesuai waktu yang kamu berikan."

**Rumus hook:** "Kamu tidak butuh [X]. Kamu butuh [Y]." / "[Hal yang dipercaya semua orang]. ~~Salah.~~" /
"Satu aturan yang mengubah [hal]: [angka]."

**Alur kerja:** `tts.py` → **`python3 styles/kinetic-type/align.py <demo>`** (faster-whisper offline,
menulis `build/words.json`; tanpa ini kit memakai waktu kata perkiraan) → stills → make. Caption bawaan
dimatikan (`"captions": false`), tulis teks di layar dalam huruf kapital; jumlah kata per baris tumpukan
harus sama dengan kata yang diucapkan.

**Kit API (`styles/kinetic-type/kit.js`):**
- `PAL`, `ON[field] → {ink, acc}`, `FONT {cond, black, mono}`, `GRID` (kolom x 70, lebar 880, aman dari UI kanan & 300 px bawah).
- `useAlignedWords(AM)` (panggil di setup), `wt(AM, id, i)` waktu kata ke-i, `spring(x, {freq, damp})`, `impact(t, t0, dur)`, `shake(t, hits, amp)`.
- `capH`, `measure`, `fitSize`, `type(ctx, text, x, y, {font, size, color, track, align, outline, accent})`.
- `stack(ctx, rows, {x, w, top|cy, gap, align})` → tumpukan poster; baris `{text, fit, size, font, color, at, fx, parts:[{text, at, fx, color}], accent, ghost}`.
- `drawRow(ctx, row, t, {color, accent})`, `drawStack(ctx, rows, t, opts)`, `glyphs(...)`, `rowBox(ctx, row, partIndex)`.
- `strike(ctx, box, p)`, `boxBehind(ctx, box, p)`, `underline(ctx, box, p)`, `arrow(...)`.
- `field(ctx, c)`, `wipeField(ctx, c, p, dir)`, `fieldAt(t, flips)`, `echoWall(ctx, text, t, {...})` (strip ter-cache, murah).
- `crumbs(ctx, t, {label, beat, beats, dur})`, `beatIndex(AM, t)`, `tc(t)`, `mmss(sec)`.
- Ikon: `shoe(ctx, x, y, s, {lace, run})`, `book(ctx, x, y, s, {open, flip, title})`, `stopwatch(ctx, x, y, r, {p, hand, label})`, `ballot`, `stairs`, `tally`.
- Kamera: `punch(ctx, z, cx, cy, dx, dy)`, `smear(ctx, fn, dx)`.
- Performa: satu layer saja, tanpa grain (≈130 ms per gambar).

**Demo:** "Aturan Dua Menit", 19,7 detik, 5 baris. Kilat "02:00" → KAMU TIDAK BUTUH → MOTIVASI dicoret →
KAMU BUTUH DUA MENIT (stopwatch) → ATURAN DUA MENIT, buku *Atomic Habits*, JAMES CLEAR → MEMBACA? BACA
SATU HALAMAN (halaman dibalik) → LARI? IKAT TALI SEPATUMU (tali terikat) → "kecil?" mungil dilingkari →
JUSTRU ITU INTINYA → YANG BERAT CUMA MULAI. → SEMANGAT dicoret → PASANG DUA MENIT → MULAI SEKARANG.
dengan hitung mundur 01:59.
- **Demo 2 — "Fokus Satu Hal"** (`demo-fokus-1-hal/`, ~18 dtk): multitasking = setengah semua vs fokus = selesai satu. Voice el-id-m.
- **Demo 3 — "Efek Hal Kecil"** (`demo-efek-kecil/`, ~18 dtk): retakan kecil tenggelamkan kapal, 1% tiap hari, kecil × konsisten = besar. Voice el-id-m.
