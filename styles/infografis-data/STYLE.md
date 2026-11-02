---
id: infografis-data
name: Infografis Data
no: 50
source: github:data-viz-infographic
family: data
tech: canvas2d
music: tech   voice: id-f   captions: clean (kotak gelap, garis cyan)
best_for: statistik penduduk, ekonomi, perbandingan negara, survei, "jika dunia 100 orang", data yang bisa dibagikan
---
# Infografis Data

**Ciri khas (look):** dasbor gelap #0a0e19 dengan grid 60 px samar, sudut HUD, glow cyan #28e0ff tipis di atas. Kicker mono (JetBrains Mono) + judul Inter 800, angka tabular besar, garis sumber mono di bawah ("Sumber: PBB, WPP 2024 · dibulatkan") dan timecode. Warna kategori tegas: oranye #ff8a3d, kuning #ffd23f, biru #4da3ff, hijau #3ddc97, ungu #b47cff; sorotan merah #ff3b4e. Ikon orang (kepala + bahu) sebagai satuan data.

**Gerak (motion):** ikon muncul bertahap, **menyala sesuai kategori lalu berpindah fisik** ke waffle chart yang tersusun rapi (stagger per ikon), angka label menghitung naik, bar 100% terisi segmen demi segmen, kamera **menyelam** ke satu kelompok lalu keluar lagi, panel peringkat meluncur masuk dengan bar yang tumbuh. Tidak ada overshoot kecuali pop kecil.

**Kenapa menarik:** data nyata memberi otoritas dan gampang dibagikan; penonton "menemukan dirinya" di dalam grafik (Indonesia di antara 100 orang). Ikon manusia membuat angka terasa personal.

**Cerita yang cocok:**
- "Kalau dunia hanya 100 orang... beginilah wajahnya."
- Ke mana gaji rata-rata orang Indonesia habis dalam sebulan (100 koin).
- Berapa banyak air di bumi yang bisa diminum (1 toples kelereng).
- Bahasa paling banyak dipakai di dunia (balapan bar).
- Dari 100 anak SD, berapa yang sampai kuliah.

**Rumus hook:** "Kalau [populasi besar] diperkecil jadi 100..." / "Dari setiap [N] [orang/rupiah], hanya [k] yang..." / "[Angka mengejutkan], dan [kelompok kita] ada di sini."

**Kit API (`styles/infografis-data/kit.js`):**
- `PAL`, `pr`, `pop`, `num(v, dec)`: format angka Indonesia (3,5 / 8.160).
- `dashboard(ctx, t)`: latar dasbor (cache); `title(ctx, kicker, text, {p})`; `source(ctx, text, t)`: garis sumber + timecode.
- `counter(ctx, text, x, y, {size, color})`, `label(...)`, `chip(ctx, text, x, y, color, {p})`, `panel(ctx, x, y, w, h, {p})`.
- `person(ctx, x, y, s, color, {alpha, frac, glow})`: ikon orang (frac = sebagian, mis. "setengah orang"); `gridPos`, `perm(n, seed)`.
- `hbar(ctx, x, y, w, h, p, color, {name, value, hi})`: bar peringkat; `stackBar(ctx, x, y, w, h, segs)`: bar 100%; `axis(...)`; `jar(ctx, x, y, w, h, n, color, {p})`: toples kelereng yang terisi.

**Demo:** "Jika Dunia Hanya 100 Orang", 19,6 detik. 100 ikon muncul (counter 0 → 100, "1 orang ≈ 82 juta jiwa") → ikon menyala dan pindah ke waffle: Asia 59, Afrika 18, Eropa 9, Amerika 13, Oseania 1 (data PBB WPP 2024, dibulatkan) → kamera menyelam ke Asia, 3½ ikon merah "INDONESIA ≈ 3,5" → panel peringkat India 17,8 · Tiongkok 17,4 · AS 4,2 · Indonesia 3,5 → 29 ikon, satu merah: "1 : 29".
- **Demo 2 — "Harga Bensin 10 Tahun"** (`demo-bensin/`, ~39 dtk): line chart Pertalite 2015–2025 Rp7.400 → Rp10.000 (+35%), counter besar, panel delta +35% stack vertikal. Data BPH Migas/Pertamina.
- **Demo 3 — "Kirim Kucing ke Mana Aja"** (`demo-ongkir/`, ~41 dtk): bar chart tarif paket hewan Maura Trans — Bandung 230rb, Tasikmalaya 250rb, Ciamis 300rb. Data mauratransmandiri.com/layanan.
