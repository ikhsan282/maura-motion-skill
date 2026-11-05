# hud-showreel — HUD Game & Telemetry Showreel

Gaya visual **HUD Showreel** menampilkan antarmuka taktis bergaya game kompetitif dan telemetri sci-fi: latar grid gelap `#070b14` dengan scanline halus, kurung siku sudut (*corner brackets*), indikator waktu (`TC 00:SS:FF`), bar indikator berlapis (*HP ghost bar*, *shield bar*, *radial cooldown*), serta kartu berkas (*dossier slam*) bertipografi tegas (`Orbitron` & `JetBrains Mono`).

## Kit (`styles/hud-showreel/kit.js`)
- `frame(g, t, { accent, beat })`: Latar grid taktis, crosshair, vignette radial, scanlines, dan bracket viewport.
- `brackets(g, x, y, w, h, opts)`: Kurung siku sudut presisi di sekeliling panel atau target.
- `panel(g, x, y, w, h, opts)`: Panel kaca gelap dengan opsi pendar neon (`glow`) dan bracket sudut.
- `headlineHud(g, title, sub, opts)`: Tajuk telemetri bagian atas layar.
- `hpBarHud(g, x, y, w, h, hp, ghostHp, shieldHp, opts)`: Bar nyawa lengkap dengan *damage ghost trail* merah, *shield bar* sian, garis segmen 10%, dan angka digital.
- `cooldown(g, x, y, r, p, opts)`, `chargeBar(...)`, `combo(...)`, `levelUp(...)`, `xpBar(...)`: Komponen HUD aksi game.
- `dossierCard(g, x, y, w, h, opts)`: Kartu arsip HUD dengan nomor indeks raksasa, kata utama, akar kata, dan arti.

## Demo (30–90 Detik)
- **Demo 1 — "HP Bar: Nyawa Terakhirmu — Rahasia Psikologi Bar Hijau, Damage Ghost & Detik Kritis"** (`demo1/`, ~64 dtk): Bagaimana desainer game merancang HP bar, *damage ghost trail*, perisai biru, hingga ilusi "1 HP terakhir" agar pemain merasakan ketegangan maksimal. Voice `el-id-m`.
- **Demo 2 — "Skill Cooldown & Ekonomi Aksi — Mengapa Ultimate Terkuat Harus Dikunci Waktu?"** (`demo2/`, ~64 dtk): Mengapa jurus *ultimate* punya *cooldown*, cara kerja *resource charging*, *chain combo multiplier*, dan pemotongan waktu tunggu saat *level up*. Voice `el-id-m`.
- **Demo 3 — "Nama Hari Kita Ternyata Angka — Kode Bahasa Arab & Portugis di Balik Kalender"** (`demo3/`, ~65 dtk): Bedah etimologi Senin sampai Minggu lewat antarmuka berkas HUD (`FILE 01/07` hingga `07/07`) yang membuktikan bahwa nama hari kita adalah deretan angka. Voice `el-id-m`.
