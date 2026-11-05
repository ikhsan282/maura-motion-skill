# Maura Motion Skill

Library **78 gaya animasi siap pakai** (dengan 234 demo lengkap) untuk video narasi vertikal (TikTok, Reels, YouTube Shorts) — digambar full pakai kode (Canvas 2D, Three.js 3D, WebGL Shader, & Painterly Pass), bukan AI generate gambar statis. Pilih gaya, kasih topik/naskah, langsung jadi MP4 + narasi Bahasa Indonesia/Inggris + caption per kata + musik & SFX (−14 LUFS).

Dibangun untuk kebutuhan konten **Maura Group** (Maura Trans, Maura Printing), tapi gayanya umum — bisa dipakai untuk topik apa saja.

## Cara pakai

**Sekali saja:** `node scripts/setup.mjs` (cek Node, ffmpeg, Chrome, Python venv, dan suara offline). Untuk suara manusia, isi `ELEVENLABS_API_KEY` (lihat [Narasi suara](#narasi-suara)).

Lalu untuk setiap video:

1. **Pilih gaya** — buka `STYLES.md`, lihat kolom *Paling cocok untuk* (mudik/emosional → `anime`, dongeng plastisin → `clay-stop-motion`, alur/logistik → `isometrik`, motivasi tipografi → `kinetic-type`, psikologi & kebiasaan → seri `stickman-*`).
2. **Pelajari kit** — baca `styles/<gaya>/STYLE.md` (ciri visual, karakter, API `kit.js`) dan buka salah satu `demo1/`–`demo3/` sebagai contoh.
3. **Tulis naskah** — buat folder proyek berisi `story.json`. Baris pertama = hook.
   - Video pendek (≤ 20 dtk): 4–6 baris, ±40–50 kata.
   - Video panjang (±60 dtk): 8 baris, ±140–170 kata, tambahkan `"maxDuration": 90`.
4. **Bangun scene** — tulis `scene.js` dengan fungsi dari `kit.js`; tiap shot mengikuti `id` baris naskah (`C.<id>.start`).
5. **Cek dulu, baru render** — lihat still beberapa detik untuk memastikan tata letak rapi, lalu render penuh → `out/<slug>.mp4` (narasi + caption per kata + musik + SFX, −14 LUFS).

```bash
# 1) cek visual dulu (narasi + PNG still di detik 2, 15, 40 → build/stills/sheet.png)
node scripts/make.mjs styles/anime/demo1 --stills 2,15,40

# 2) render penuh
node scripts/make.mjs styles/anime/demo1

# render ulang paksa & simpan file build (narration.wav, video.mp4, dll)
node scripts/make.mjs styles/clay-stop-motion/demo2 --force --keep

# ganti visual/musik saja tanpa memanggil ulang TTS (hemat kuota ElevenLabs)
node scripts/make.mjs examples/hello --no-tts --keep

# ganti suara / musik
node scripts/make.mjs styles/stickman-picturebook/demo1 --voice el-id-f --music lofi
```

> Video > 20 dtk wajib punya `"maxDuration"` di `story.json` (atau set env `AM_MAX_DURATION=90`). Semua demo panjang di repo ini sudah memakainya.

Detail lengkap: baca `SKILL.md`. Standar nulis cerita & gaya baru: `AUTHORING.md`.

## Dipakai dengan AI (Bahasa Indonesia)

Skill ini dirancang untuk dijalankan **bareng AI coding agent**. Kamu cukup cerita maunya apa, AI yang menulis `story.json` + `scene.js` + render.

**Contoh prompt (copy-paste, ganti topiknya):**

> Buatkan video vertikal gaya `clay-stop-motion` tentang "Sangkuriang & Perahu Terbalik".
> Naskah 10 baris Bahasa Indonesia (durasi 50–60 detik), suara George ElevenLabs (`el-id-m`), hook di baris pertama.
> Render MP4 + narasi + musik, lalu kirim videonya.

**Pola prompt yang works:**

| Mau apa | Bilang gini |
|---|---|
| Gaya tertentu | "pakai gaya `clay-stop-motion`" / "gaya `anime`" / "gaya 22" |
| Topik bebas | "buatkan video tentang mudik" (AI pilihkan gaya yang cocok) |
| Video panjang | "buatkan 30–90 detik tentang ..." |
| Revisi visual | "di detik 7 teksnya numpuk, benerin" |
| Tambah demo | "buatkan `demo2` dan `demo3` di gaya ini" |

### Rekomendasi & Ranking AI Agent

Tidak semua AI coding agent memiliki kapasitas reasoning visual dan context window yang sama untuk menyusun ratusan baris koordinat Canvas / WebGL / Three.js. Pilih agent sesuai kompleksitas gaya yang ingin kamu render:

| Peringkat / Tier | AI Agent | Level Kompleksitas | Gaya yang Direkomendasikan | Catatan Performa |
|:---:|---|---|---|---|
| **Tier 1 (Heavy / Full Power)** 🏆 | **Claude Code** / **Google Antigravity** | **Semua Gaya (1–77)**<br>*(Ringan s.d. Sangat Berat)* | • **3D & Shader**: `clay-stop-motion`, `dunia-blok`, `low-poly`, `cutaway-3d`, `psychedelic-shader`<br>• **Painterly / Seni Rupa**: `anime`, `lukisan-minyak`, `cat-air`, `wayang-kulit`<br>• **Motion Kompleks**: Seri `stickman-*`, `isometrik`, `kinetic-type` | Model reasoning besar (Claude 3.7 Sonnet / Opus, Gemini Pro). Mampu menyusun matematika 3D, rigging stickman multi-joint, koreografi kamera, dan debugging render otomatis. |
| **Tier 2 (Balanced / Mid-to-Heavy)** ⚡ | **Codex CLI** (OpenAI o3-mini / GPT-4o) | **Gaya 2D Kompleks & Semi-3D**<br>*(Menengah s.d. Berat)* | • **2D Vektor & Layout**: `flat-vector`, `neo-brutalist`, `infografis-data`, `blueprint`<br>• **Tipografi & Retro**: `kinetic-type`, `terminal-ascii`, `vhs-arsip`, `retro-pixel`<br>• **Kriya & Stickman**: `stickman-doodle`, `stickman-subuh`, `kertas-guntingan` | Sangat cepat dalam logika naskah dan scene 2D terstruktur. Untuk gaya 3D berat atau shader kompleks, disarankan cek `--stills` terlebih dahulu untuk memastikan koordinat visual pas. |
| **Tier 3 (Lightweight / Fast Bot)** ⚡ | **Hermes** (Worker Gateway / LLM Ringan) | **Gaya 2D Sederhana & Cepat**<br>*(Ringan)* | • **2D Dasar**: `flat-vector`, `swiss-bauhaus`<br>• **Tipografi Bersih**: `kinetic-type`, `trailer-gelap`<br>• **Doodle Minimalis**: `stickman-minimal-dark`, `garis-tunggal` | Cocok untuk automated pipeline / bot chat instan. Kurang ideal untuk gaya 3D Three.js atau lukisan berlapis banyak karena rawan timeout atau inkonsistensi koordinat. |

#### Panduan Khusus per Agent:

- **Hermes (Chat / Worker Otomatis)**: Fokus pada tugas cepat, eksekusi naskah pendek, bot Telegram/Discord. Gunakan gaya deklaratif sederhana (`flat-vector`, `kinetic-type`, `stickman-minimal-dark`). Berikan prompt spesifik (misal: "5 baris naskah").
- **Codex CLI (Terminal Power-User)**: Sangat cocok untuk video explainer berbasis data, infografis, dan konten edukasi harian (`infografis-data`, `blueprint`, `neo-brutalist`, `stickman-doodle`). Manfaatkan alur iteratif Codex: jalankan `--stills 2,15,40` untuk inspeksi visual sebelum render akhir MP4 (lihat panduan lengkap di [CODEX.md](CODEX.md)).
- **Claude Code / Antigravity (Studio Full-Stack Creative)**: Mampu menangani seluruh 77 gaya tanpa batasan, termasuk kalkulasi rotasi 3D Three.js, stop-motion plastisin, dan layering cat air/minyak untuk video 60–90 detik. Cukup berikan topik cerita dan target emosi, agent akan merancang naskah dan koreografi visual secara menyeluruh.

### Cara Menjalankan per Agent

#### 1. Pakai Claude Code / Antigravity

Clone repo ini, lalu jalankan agen AI dari dalam folder repo:

```bash
git clone https://github.com/ikhsan282/maura-motion-skill.git
cd maura-motion-skill
node scripts/setup.mjs
```

Lalu beri prompt:

> Baca SKILL.md. Buatkan video gaya `clay-stop-motion` tentang "Sangkuriang & Perahu Terbalik".
> Naskah Bahasa Indonesia 8 baris (~60 dtk), suara ElevenLabs (George), kirim hasilnya.

#### 2. Pakai Codex CLI

Buka Codex CLI dari dalam folder repo:

```bash
cd maura-motion-skill
codex
```

Lalu beri prompt:

> Baca SKILL.md. Buatkan video gaya `infografis-data` tentang "harga bensin 10 tahun".
> Naskah Bahasa Indonesia 8 baris, cek --stills dulu sebelum render full MP4.

*(Panduan lengkap Codex: lihat [CODEX.md](CODEX.md))*

#### 3. Pakai Hermes

Hermes (gateway + kanban) bisa menjalankan skill ini sebagai worker. Cukup kirim prompt ke chat Hermes — Hermes yang akan baca `SKILL.md`, tulis naskah & scene, render, dan kirim MP4-nya ke chat.

Catatan: Hermes butuh akses ke repo ini (`~/maura-motion-skill/`), Node 22+, ffmpeg, Chrome, dan Python 3.10+. Setup sekali: `node scripts/setup.mjs`. Untuk suara manusia (ElevenLabs), taruh key `ELEVENLABS_API_KEY` di `~/.env`, `~/.hermes/elevenlabs.env`, atau `.env` di root repo.

## Struktur

| Path | Isi |
|---|---|
| `SKILL.md` | Panduan pakai skill (pintu masuk agen) |
| `AUTHORING.md` | Standar naskah & cara bikin gaya baru |
| `STYLES.md` / `catalog.json` | Katalog 78 gaya + kecocokan topik |
| `styles/<gaya>/` | `STYLE.md` + `kit.js` + `demo1/`..`demo3/` per gaya |
| `examples/` | Contoh unggulan siap tonton: `hello` (*Halo Maura Motion*) & `clay-stop-motion-demo2` (*Sangkuriang & Perahu Terbalik*) |
| `engine/` | Runtime + renderer (headless Chrome / Playwright → MP4) |
| `audio/` | TTS (ElevenLabs default George + Kokoro/Piper/SAPI offline fallback), musik, SFX, mixing −14 LUFS |
| `scripts/` | `setup.mjs`, `make.mjs`, `build_index.py` |

## Narasi suara

Default suara untuk Bahasa Indonesia maupun Inggris adalah **ElevenLabs George** (`el-id-m`, voice ID `JBFqnCBsd6RMkjVDRZzb`):

| Jalur | Suara | Kapan dipakai |
|---|---|---|
| **ElevenLabs (default)** | **George** (`el-id-m` / `george`, pria hangat storyteller), **Alice** (`el-id-f`, wanita jelas ramah), model `eleven_multilingual_v2` | Default utama — suara manusia natural dengan word-level alignment |
| **Offline (fallback otomatis)** | Kokoro / Piper / Windows SAPI, 14 preset (`id-m`, `id-f`, dll), tanpa API key | Otomatis dipakai bila `ELEVENLABS_API_KEY` tidak ditemukan atau kuota habis |

Key `ELEVENLABS_API_KEY` dibaca otomatis dari `~/.env` (`C:\Users\<user>\.env`), `~/.hermes/elevenlabs.env`, atau `.env` di folder repo.

## Status gaya (78 gaya: 78 siap pakai ✅)

| No | Gaya | ID | Status | Demo 1 | Demo 2 | Demo 3 |
|:---:|---|---|:---:|---|---|---|
| 1 | **Anime** | `anime` | ✅ | [Tiket Terakhir Mudik](styles/anime/demo1/) (17 dtk) | [Surat di Ujung Peron](styles/anime/demo2/) (52 dtk) | [Rantang Hangat di Peron Senja](styles/anime/demo3/) (60 dtk) |
| 2 | **Kartun 3D Sinematik** | `kartun-3d-sinematik` | ✅ | [Sangkuriang & Tangkuban Perahu](styles/kartun-3d-sinematik/demo1/) (48 dtk) | [Malin Kundang & Kutukan Batu](styles/kartun-3d-sinematik/demo2/) (65 dtk) | [Roro Jonggrang & Seribu Candi](styles/kartun-3d-sinematik/demo3/) (67 dtk) |
| 3 | **Lukis Pedesaan** | `lukis-pedesaan` | ✅ | [Dewi Sri, Asal Mula Padi](styles/lukis-pedesaan/demo1/) (48 dtk) | [Fajar Seorang Petani & Sepiring Nasi](styles/lukis-pedesaan/demo2/) (65 dtk) | [Tradisi Wiwitan: Syukur Bumi](styles/lukis-pedesaan/demo3/) (65 dtk) |
| 4 | **Dunia Blok (Voxel)** | `dunia-blok` | ✅ | [Membangun Borobudur Blok demi Blok](styles/dunia-blok/demo1/) (48 dtk) | [Letusan Gunung Krakatau 1883](styles/dunia-blok/demo2/) (68 dtk) | [Monas: Lidah Api Emas di Puncak](styles/dunia-blok/demo3/) (73 dtk) |
| 5 | **Clay Stop Motion** | `clay-stop-motion` | ✅ | [Timun Mas & Buto Ijo](styles/clay-stop-motion/demo1/) (17 dtk) | [Sangkuriang & Perahu Terbalik](styles/clay-stop-motion/demo2/) (57 dtk) | [Bawang Putih & Labu Emas](styles/clay-stop-motion/demo3/) (62 dtk) |
| 6 | **Boneka Rajut** | `boneka-rajut` | ✅ | [Kura-kura dan Monyet Menanam Pisang](styles/boneka-rajut/demo1/) (46 dtk) | [Kancil dan Barisan Buaya Sungai](styles/boneka-rajut/demo2/) (69 dtk) | [Balap Lari Kelinci & Kura-kura](styles/boneka-rajut/demo3/) (67 dtk) |
| 7 | **Pixel Retro** | `pixel-retro` | ✅ | [Si Pitung: Level Batavia](styles/pixel-retro/demo1/) (48 dtk) | [Kenapa Game Jadul 16-Bit Bikin Nagih?](styles/pixel-retro/demo2/) (80 dtk) | [Tamagotchi 90-an: Jangan Sampai Mati!](styles/pixel-retro/demo3/) (68 dtk) |
| 8 | **Kertas Guntingan** | `kertas-guntingan` | ✅ | [Legenda Danau Toba](styles/kertas-guntingan/demo1/) (62 dtk) | [Legenda Batu Menangis](styles/kertas-guntingan/demo2/) (87 dtk) | [Asal-Usul Nama Banyuwangi](styles/kertas-guntingan/demo3/) (70 dtk) |
| 9 | **Sketsa Pensil** | `sketsa-pensil` | ✅ | [Faktor Habibie: Retakan Sekecil Rambut](styles/sketsa-pensil/demo1/) (58 dtk) | [Kenapa Kapal Baja Mengapung? Archimedes](styles/sketsa-pensil/demo2/) (58 dtk) | [Rahasia Konstruksi Candi Borobudur](styles/sketsa-pensil/demo3/) (60 dtk) |
| 10 | **Kartun Jadul (Rubber Hose)** | `kartun-jadul` | ✅ | [Kancil Mencuri Timun](styles/kartun-jadul/demo1/) (54 dtk) | [Kancil dan Barisan Buaya](styles/kartun-jadul/demo2/) (63 dtk) | [Si Kabayan & Nangka Hanyut](styles/kartun-jadul/demo3/) (65 dtk) |
| 11 | **Wayang Kulit** | `wayang-kulit` | ✅ | [Arjuna di Kurusetra — Bhagavad Gita](styles/wayang-kulit/demo1/) (62 dtk) | [Bima & Dewa Ruci — Tirta Pawitra](styles/wayang-kulit/demo2/) (70 dtk) | [Gugurnya Gatotkaca di Kurusetra](styles/wayang-kulit/demo3/) (56 dtk) |
| 12 | **Low Poly** | `low-poly` | ✅ | [Pulau Run & Manhattan — Pulau Pala](styles/low-poly/demo1/) (56 dtk) | [Kapal Phinisi Nusantara](styles/low-poly/demo2/) (63 dtk) | [Cincin Api Nusantara](styles/low-poly/demo3/) (78 dtk) |
| 13 | **Buku Pop-up** | `buku-pop-up` | ✅ | [Roro Jonggrang & Seribu Candi](styles/buku-pop-up/demo1/) (52 dtk) | [Timun Mas & Empat Bungkusan Ajaib](styles/buku-pop-up/demo2/) (68 dtk) | [Keajaiban Candi Borobudur](styles/buku-pop-up/demo3/) (68 dtk) |
| 14 | **Batik Hidup** | `batik-hidup` | ✅ | [Parang Rusak: Motif Larangan](styles/batik-hidup/demo1/) (52 dtk) | [Filosofi Batik Kawung — Buah Aren](styles/batik-hidup/demo2/) (70 dtk) | [Batik Mega Mendung Cirebon](styles/batik-hidup/demo3/) (68 dtk) |
| 15 | **Wayang Golek** | `wayang-golek` | ✅ | [Hanoman Obong: Membakar Alengka](styles/wayang-golek/demo1/) (77 dtk) | [Si Cepot & Falsafah Tawa Sunda](styles/wayang-golek/demo2/) (80 dtk) | [Lahirnya Gatotkaca di Candradimuka](styles/wayang-golek/demo3/) (77 dtk) |
| 16 | **Wayang Beber** | `wayang-beber` | ✅ | [Panji & Dewi Sekartaji](styles/wayang-beber/demo1/) (52 dtk) | [Ande-Ande Lumut & Klenting Kuning](styles/wayang-beber/demo2/) (61 dtk) | [Jaka Tarub & Selendang Nawangwulan](styles/wayang-beber/demo3/) (63 dtk) |
| 17 | **Lukisan Gua Purba** | `lukisan-gua-purba` | ✅ | [Lukisan Gua Tertua di Sulawesi](styles/lukisan-gua-purba/demo1/) (69 dtk) | [Perburuan Agung di Dinding Batu](styles/lukisan-gua-purba/demo2/) (63 dtk) | [Rahasia Cap Tangan Merah](styles/lukisan-gua-purba/demo3/) (62 dtk) |
| 18 | **Origami** | `origami` | ✅ | [Seribu Bangau Kertas](styles/origami/demo1/) (52 dtk) | [Sains Lipatan Origami ke Antariksa](styles/origami/demo2/) (63 dtk) | [Empat Musim di Desa Kertas Washi](styles/origami/demo3/) (63 dtk) |
| 19 | **Kardus Bekas** | `kardus-bekas` | ✅ | [Perjalanan Kardus Paketmu](styles/kardus-bekas/demo1/) (61 dtk) | [Rahasia Kekuatan Kardus Bergelombang](styles/kardus-bekas/demo2/) (62 dtk) | [Imajinasi Tanpa Batas Kardus Bekas](styles/kardus-bekas/demo3/) (63 dtk) |
| 20 | **Kolase Daun & Bunga** | `kolase-daun-bunga` | ✅ | [Rafflesia arnoldii Bunga Raksasa](styles/kolase-daun-bunga/demo1/) (57 dtk) | [Kantong Semar Pemangsa Serangga](styles/kolase-daun-bunga/demo2/) (60 dtk) | [Seni Herbarium & Kolase Botani](styles/kolase-daun-bunga/demo3/) (63 dtk) |
| 21 | **Kotak Cahaya Kertas** | `kotak-cahaya-kertas` | ✅ | [Legenda Malin Kundang](styles/kotak-cahaya-kertas/demo1/) (52 dtk) | [Putri Mandalika & Tradisi Bau Nyale](styles/kotak-cahaya-kertas/demo2/) (81 dtk) | [Seni Shadow Box & Teater Siluet](styles/kotak-cahaya-kertas/demo3/) (78 dtk) |
| 22 | **Lukisan Minyak Bergerak** | `lukisan-minyak` | ✅ | [Lukisan Balasan Raden Saleh](styles/lukisan-minyak/demo1/) (60 dtk) | [Perjalanan Raden Saleh ke Eropa](styles/lukisan-minyak/demo2/) (74 dtk) | [Jalan Raya Pos Anyer–Panarukan 1808](styles/lukisan-minyak/demo3/) (77 dtk) |
| 23 | **Papan Tulis Kapur** | `papan-tulis-kapur` | ✅ | [Paradoks Ulang Tahun: 23 Orang 50%](styles/papan-tulis-kapur/demo1/) (48 dtk) | [Paradoks Monty Hall: Pindah Pintu](styles/papan-tulis-kapur/demo2/) (73 dtk) | [Lipat Kertas 42 Kali ke Bulan](styles/papan-tulis-kapur/demo3/) (75 dtk) |
| 24 | **Flipbook** | `flipbook` | ✅ | [Animasi Lahir dari Pojok Buku](styles/flipbook/demo1/) (46 dtk) | [Rahasia 12 Prinsip Animasi](styles/flipbook/demo2/) (65 dtk) | [Taruhan Kuda Berlari Muybridge 1878](styles/flipbook/demo3/) (71 dtk) |
| 25 | **Terminal ASCII** | `terminal-ascii` | ✅ | [Virus Brain 1986: Alamat di Kode Virus](styles/terminal-ascii/demo1/) (56 dtk) | [Pesan Pertama Internet 1969: LO Crash](styles/terminal-ascii/demo2/) (81 dtk) | [Kepanikan Bug Y2K Tahun 2000](styles/terminal-ascii/demo3/) (80 dtk) |
| 26 | **Cat Air (Watercolor)** | `cat-air` | ✅ | [Legenda Roro Anteng & Joko Seger](styles/cat-air/demo1/) (53 dtk) | [Fajar di Kaldera Tengger: Bromo](styles/cat-air/demo2/) (75 dtk) | [Teknik Lukis Cat Air Basah di Atas Basah](styles/cat-air/demo3/) (79 dtk) |
| 27 | **Gouache Buku Dongeng** | `gouache-dongeng` | ✅ | [Bawang Merah & Bawang Putih: Dua Labu](styles/gouache-dongeng/demo1/) (71 dtk) | [Keong Mas & Putri Candra Kirana](styles/gouache-dongeng/demo2/) (76 dtk) | [Kancil & Siput Lomba Lari di Sungai](styles/gouache-dongeng/demo3/) (72 dtk) |
| 28 | **Pastel & Krayon** | `pastel-krayon` | ✅ | [Kenapa Bulan Mengikuti Kita? Paralaks](styles/pastel-krayon/demo1/) (78 dtk) | [Bagaimana Pelangi Muncul Selepas Hujan?](styles/pastel-krayon/demo2/) (71 dtk) | [Ke Mana Perginya Bayanganmu Saat Siang?](styles/pastel-krayon/demo3/) (72 dtk) |
| 29 | **Tinta Novel Grafis** | `tinta-novel-grafis` | ✅ | [Sumpah Palapa Gajah Mada 1336](styles/tinta-novel-grafis/demo1/) (71 dtk) | [Ekspedisi Pati Unus & 100 Kapal Jong](styles/tinta-novel-grafis/demo2/) (73 dtk) | [Strategi Sultan Agung di Sungai Ciliwung](styles/tinta-novel-grafis/demo3/) (65 dtk) |
| 30 | **Product Film Light** | `product-light` | ✅ | [Satu Detik di Balik Scan Kode QRIS](styles/product-light/demo1/) (46 dtk) | [Rahasia Kode OTP 6 Angka 30 Detik](styles/product-light/demo2/) (70 dtk) | [Tiga Algoritma Saat Memesan Ojek Online](styles/product-light/demo3/) (63 dtk) |
| 31 | **Dark Glow Product UI** | `dark-glow-ui` | ✅ | [Apa yang Terjadi Saat Menekan Kirim](styles/dark-glow-ui/demo1/) (52 dtk) | [Kenapa Server Tak Tahu Password-mu?](styles/dark-glow-ui/demo2/) (65 dtk) | [Bagaimana AI Menjawab Kata demi Kata?](styles/dark-glow-ui/demo3/) (65 dtk) |
| 32 | **One-Shape UI Morph** | `ui-morph` | ✅ | [Satu Tombol Jadi Makan Malammu](styles/ui-morph/demo1/) (52 dtk) | [Dari Tombol Bayar Sampai Struk Digital](styles/ui-morph/demo2/) (65 dtk) | [Satu Kapsul di Pagi Hari: Alarm & Fokus](styles/ui-morph/demo3/) (65 dtk) |
| 33 | **Kinetic Typography** | `kinetic-type` | ✅ | [Aturan Dua Menit James Clear](styles/kinetic-type/demo1/) (52 dtk) | [Teknik Belajar Richard Feynman](styles/kinetic-type/demo2/) (65 dtk) | [Hukum Parkinson & Efek 1% (37x Lipat)](styles/kinetic-type/demo3/) (65 dtk) |
| 34 | **Swiss / Bauhaus Grid** | `swiss-bauhaus` | ✅ | [Bauhaus: Sekolah 14 Tahun Ubah Dunia](styles/swiss-bauhaus/demo1/) (55 dtk) | [Rahasia Grid Swiss & Müller-Brockmann](styles/swiss-bauhaus/demo2/) (65 dtk) | [Eksperimen 3 Warna Primer Kandinsky](styles/swiss-bauhaus/demo3/) (65 dtk) |
| 35 | **Editorial Serif** | `editorial-serif` | ✅ | [Kain yang Ditenun Setahun di Sumba](styles/editorial-serif/demo1/) (65 dtk) | [Jejak Rempah yang Mengubah Peta Dunia](styles/editorial-serif/demo2/) (65 dtk) | [Anatomi Secangkir Kopi Nusantara](styles/editorial-serif/demo3/) (65 dtk) |
| 36 | **Chrome Y2K** | `chrome-y2k` | ✅ | [Emas di HP-mu Lahir dari Tabrakan Bintang](styles/chrome-y2k/demo1/) (65 dtk) | [Estetika Chrome Y2K Tahun 2000](styles/chrome-y2k/demo2/) (66 dtk) | [Rahasia Logam Titanium (SR-71 & HP)](styles/chrome-y2k/demo3/) (66 dtk) |
| 37 | **Noir Dokumenter** | `noir-dokumenter` | ✅ | [Krakatau 1883: Suara Paling Keras](styles/noir-dokumenter/demo1/) (54 dtk) | [Letusan Tambora 1815: Tanpa Musim Panas](styles/noir-dokumenter/demo2/) (64 dtk) | [Misteri Kapal SS Ourang Medan 1947](styles/noir-dokumenter/demo3/) (64 dtk) |
| 38 | **VHS & Arsip CRT** | `vhs-arsip` | ✅ | [Sinyal Wow! 1977 (Kode 6EQUJ5)](styles/vhs-arsip/demo1/) (54 dtk) | [Piringan Emas Voyager 1977 & Gamelan](styles/vhs-arsip/demo2/) (64 dtk) | [Gerhana Matahari Total 11 Juni 1983](styles/vhs-arsip/demo3/) (64 dtk) |
| 39 | **Flat Vector Explainer** | `flat-vector` | ✅ | [Ke Mana Perginya Rp100 Ribu?](styles/flat-vector/demo1/) (62 dtk) | [Peta Isi Kepala Pas Macet](styles/flat-vector/demo2/) (62 dtk) | [Cahaya di Wajahmu: 170.000 Tahun Foton](styles/flat-vector/demo3/) (65 dtk) |
| 40 | **Kartun Outline Tebal** | `kartun-outline-tebal` | ✅ | [Perang Aplikasi di Baterai 1 Persen](styles/kartun-outline-tebal/demo1/) (62 dtk) | [Drama Alarm Jam Enam vs Tombol Snooze](styles/kartun-outline-tebal/demo2/) (64 dtk) | [Rapat Tengah Malam Penghuni HP-mu](styles/kartun-outline-tebal/demo3/) (64 dtk) |
| 41 | **Neo-Brutalist Bento** | `neo-brutalist` | ✅ | [Ke Mana Perginya Uang Kopi Susu?](styles/neo-brutalist/demo1/) (62 dtk) | [Dari Rp1,5 Juta Tiket Konsermu](styles/neo-brutalist/demo2/) (64 dtk) | [Rahasia di Balik Label Gratis Ongkir](styles/neo-brutalist/demo3/) (65 dtk) |
| 42 | **Vas Yunani Black-Figure** | `vas-yunani` | ✅ | [Prometheus, Pencuri Api Olimpus](styles/vas-yunani/demo1/) (64 dtk) | [Sayap Lilin Icarus & Labirin Daedalus](styles/vas-yunani/demo2/) (64 dtk) | [Siasat Kuda Troya & Trojan Horse](styles/vas-yunani/demo3/) (65 dtk) |
| 43 | **Scrapbook Collage** | `scrapbook` | ✅ | [Jurnal Wallace: Garis di Nusantara](styles/scrapbook/demo1/) (64 dtk) | [Ekspedisi Junghuhn & Pohon Kina](styles/scrapbook/demo2/) (64 dtk) | [Herbarium Rumphius di Ambon](styles/scrapbook/demo3/) (65 dtk) |
| 44 | **Risograph Halftone** | `riso-halftone` | ✅ | [Band yang Dipenjara karena Lagu (1965)](styles/riso-halftone/demo1/) (62 dtk) | [Dara Puspita: Tur Rock Eropa 1968](styles/riso-halftone/demo2/) (64 dtk) | [Studio Lokananta Solo 1956](styles/riso-halftone/demo3/) (65 dtk) |
| 45 | **Manga Action** | `manga-action` | ✅ | [Smash 565 km/jam vs Mobil F1](styles/manga-action/demo1/) (62 dtk) | [Tinju Udang Mantis 80 km/jam](styles/manga-action/demo2/) (64 dtk) | [Tendangan Pisang Roberto Carlos 1997](styles/manga-action/demo3/) (65 dtk) |
| 46 | **Sumi-e Tinta Timur** | `sumi-e` | ✅ | [Laksamana Cheng Ho di Nusantara](styles/sumi-e/demo1/) (64 dtk) | [Filosofi Kintsugi & Ruang Kosong (Ma)](styles/sumi-e/demo2/) (64 dtk) | [Bambu & Angin Topan (Struktur Rongga)](styles/sumi-e/demo3/) (65 dtk) |
| 47 | **Synthwave Neon** | `synthwave` | ✅ | [Suara Drum 80-an (Gated Reverb)](styles/synthwave/demo1/) (63 dtk) | [Laser, Grid & Matahari Synthwave](styles/synthwave/demo2/) (64 dtk) | [Roland TR-808: Mesin Drum Gagal 1980](styles/synthwave/demo3/) (65 dtk) |
| 48 | **Psychedelic Shader** | `psychedelic-shader` | ✅ | [Satu Rumus, Gambar Tanpa Akhir (Mandelbrot)](styles/psychedelic-shader/demo1/) (64 dtk) | [Paradoks Garis Pantai & Dimensi Fraktal](styles/psychedelic-shader/demo2/) (64 dtk) | [Pola Turing & Gelombang Kimia Belousov](styles/psychedelic-shader/demo3/) (65 dtk) |
| 49 | **Math Explainer Gelap** | `math-3b1b` | ✅ | [Kenapa Luas Lingkaran itu Pi r Kuadrat](styles/math-3b1b/demo1/) (63 dtk) | [Rahasia Angka Pi (K ÷ d = 3,14)](styles/math-3b1b/demo2/) (63 dtk) | [Setengah Tak Terhingga (Paradoks Zeno)](styles/math-3b1b/demo3/) (63 dtk) |
| 50 | **Infografis Data** | `infografis-data` | ✅ | [Jika Dunia Hanya 100 Orang](styles/infografis-data/demo1/) (63 dtk) | [Harga Bensin 10 Tahun (2015–2025)](styles/infografis-data/demo2/) (63 dtk) | [Kirim Kucing ke Mana Aja (Tarif & Jarak)](styles/infografis-data/demo3/) (64 dtk) |
| 51 | **3D Cutaway Explainer** | `cutaway-3d` | ✅ | [Isi Jam Tangan Mekanik (28.800 Detak/Jam)](styles/cutaway-3d/demo1/) (64 dtk) | [Mesin Jet Turbofan (Hisap, Tekan, Bakar)](styles/cutaway-3d/demo2/) (64 dtk) | [Mesin Espresso 9 Bar & Crema Emas](styles/cutaway-3d/demo3/) (65 dtk) |
| 52 | **Blueprint** | `blueprint` | ✅ | [Bagaimana Piramida Giza Dibangun](styles/blueprint/demo1/) (63 dtk) | [Denah Rumah Tipe 36 (6×6 Meter)](styles/blueprint/demo2/) (63 dtk) | [Jembatan Gantung Tanpa Tiang Tengah](styles/blueprint/demo3/) (64 dtk) |
| 53 | **Skala Kosmik** | `skala-kosmik` | ✅ | [Zoom Out dari Monas ke Ujung Alam Semesta](styles/skala-kosmik/demo1/) (63 dtk) | [Zoom In ke Dalam Sehelai Daun (Kuark)](styles/skala-kosmik/demo2/) (64 dtk) | [Seberapa Cepat Cahaya Sebenarnya?](styles/skala-kosmik/demo3/) (65 dtk) |
| 54 | **Dunia 3D Painterly** | `dunia-3d-painterly` | ✅ | [Legenda Telaga Warna Puncak](styles/dunia-3d-painterly/demo1/) (64 dtk) | [Danau Kelimutu Flores (Tiga Kawah)](styles/dunia-3d-painterly/demo2/) (64 dtk) | [Lembah Harau & Tebing Dasar Laut Purba](styles/dunia-3d-painterly/demo3/) (65 dtk) |
| 55 | **Diorama Miniatur Tilt-shift** | `diorama-miniatur` | ✅ | [Pasar Terapung Lok Baintan](styles/diorama-miniatur/demo1/) (64 dtk) | [Rumah Lanting & Kayu Ulin Tepian Banjar](styles/diorama-miniatur/demo2/) (64 dtk) | [Perahu Klotok Menembus Kabut Subuh](styles/diorama-miniatur/demo3/) (65 dtk) |
| 56 | **Kawanan Partikel** | `partikel` | ✅ | [Ribuan Burung Terbang Tanpa Pemimpin](styles/partikel/demo1/) (64 dtk) | [Kunang-Kunang Hutan Bakau Serentak](styles/partikel/demo2/) (64 dtk) | [Hujan & Petrichor (Aroma Tanah Kering)](styles/partikel/demo3/) (65 dtk) |
| 57 | **Pop Art Sunburst** | `pop-art` | ✅ | [Kenapa Harga Selalu Berakhir 99?](styles/pop-art/demo1/) (63 dtk) | [Jebakan Ukuran Sedang (Decoy Effect)](styles/pop-art/demo2/) (64 dtk) | [Jebakan Diskon Coret (Anchoring Bias)](styles/pop-art/demo3/) (65 dtk) |
| 58 | **Isometrik** | `isometrik` | ✅ | [Perjalanan Paketmu dari Gudang ke Pintu](styles/isometrik/demo1/) (64 dtk) | [Perjalanan Setetes Air Keran (6 Tahap)](styles/isometrik/demo2/) (64 dtk) | [Dari Sawah ke Piringmu (Sebutir Beras)](styles/isometrik/demo3/) (65 dtk) |
| 59 | **HUD Showreel** | `hud-showreel` | ✅ | [HP Bar: Nyawa Terakhirmu (Damage Ghost)](styles/hud-showreel/demo1/) (64 dtk) | [Skill Cooldown: Harga Sebuah Kemenangan](styles/hud-showreel/demo2/) (64 dtk) | [Nama Hari Kita Ternyata Angka](styles/hud-showreel/demo3/) (65 dtk) |
| 60 | **Trailer Tipografi Gelap** | `trailer-gelap` | ✅ | [Pesan Terakhir yang Tak Sampai ke Titanic](styles/trailer-gelap/demo1/) (64 dtk) | [Letusan Tambora 1815 (Tanpa Musim Panas)](styles/trailer-gelap/demo2/) (64 dtk) | [Apollo 13: Empat Hari di Ambang Gelap](styles/trailer-gelap/demo3/) (65 dtk) |
| 61 | **Monoline Satu Garis** | `garis-tunggal` | ✅ | [Lingkaran Kebiasaan (Habit Loop)](styles/garis-tunggal/demo1/) (64 dtk) | [Burung Satu Garis (Lepas Landas)](styles/garis-tunggal/demo2/) (64 dtk) | [Tangan Satu Garis (Genggam & Lambai)](styles/garis-tunggal/demo3/) (65 dtk) |
| 62 | **Kaca Patri Mosaik** | `kaca-patri` | ✅ | [Jendela yang Bercerita (Katedral)](styles/kaca-patri/demo1/) (64 dtk) | [Alkimia Kaca Permata (Emas & Kobalt)](styles/kaca-patri/demo2/) (64 dtk) | [Geometri Jendela Mawar (Rose Window)](styles/kaca-patri/demo3/) (65 dtk) |
| 63 | **Perkamen Ukiran Kuno** | `perkamen-ukiran` | ✅ | [Kamus Melayu Pertama Ditulis Pelaut Italia](styles/perkamen-ukiran/demo1/) (64 dtk) | [Pulau Run Ditukar Manhattan (Pala Banda)](styles/perkamen-ukiran/demo2/) (64 dtk) | [Herbarium Amboinense (Rumphius di Ambon)](styles/perkamen-ukiran/demo3/) (65 dtk) |
| 64 | **Toon 3D Gacha Reveal** | `gacha-3d` | ✅ | [Gacha Satwa Langka Indonesia (Badak Jawa)](styles/gacha-3d/demo1/) (64 dtk) | [Psikologi Pity System & Rate 0,6%](styles/gacha-3d/demo2/) (64 dtk) | [Gacha Pusaka & Kuliner Nusantara](styles/gacha-3d/demo3/) (65 dtk) |
| 65 | **Stickman Doodle** | `stickman-doodle` | ✅ | [Kenapa Kita Menunda-nunda? (Si Dodi & Amigdala)](styles/stickman-doodle/demo1/) (64 dtk) | [Jebakan Dunning-Kruger (Gunung Kebodohan)](styles/stickman-doodle/demo2/) (64 dtk) | [Gaji Naik tapi Tabungan Nol (Efek Diderot)](styles/stickman-doodle/demo3/) (65 dtk) |
| 66 | **Stickman Subuh** | `stickman-subuh` | ✅ | [Alarm yang Sama, Subuh yang Sama (40 Hari)](styles/stickman-subuh/demo1/) (64 dtk) | [Begadang Scroll HP vs Tidur Tepat Waktu](styles/stickman-subuh/demo2/) (64 dtk) | [Keheningan Sepertiga Malam (Sains Tahajud)](styles/stickman-subuh/demo3/) (65 dtk) |
| 67 | **Stickman Pelukis** | `stickman-pelukis` | ✅ | [Eksperimen Keramik & Kanvas (1 vs 16 Karya)](styles/stickman-pelukis/demo1/) (64 dtk) | [Kutukan Kanvas Putih (Draf Buruk Pertama)](styles/stickman-pelukis/demo2/) (64 dtk) | [10.000 Jam vs Goresan Sadar (Deliberate Practice)](styles/stickman-pelukis/demo3/) (65 dtk) |
| 68 | **Stickman Kisah** | `stickman-kisah` | ✅ | [Kisah Utang & Amplop Cokelat (Janji vs Harga Diri)](styles/stickman-kisah/demo1/) (64 dtk) | [Satu Langkah Menyerobot Antrean (Ujian Karakter)](styles/stickman-kisah/demo2/) (64 dtk) | [Baret di Parkiran & Selembar Kertas (Jujur)](styles/stickman-kisah/demo3/) (65 dtk) |
| 69 | **Stickman 3D World** | `stickman-3dworld` | ✅ | [Hukum Bunga Majemuk Kebiasaan (1% = 37,78x)](styles/stickman-3dworld/demo1/) (64 dtk) | [Kotak Parkinson & Fokus (Timeboxing)](styles/stickman-3dworld/demo2/) (64 dtk) | [Ilusi Multitasking & Biaya Pindah Fokus](styles/stickman-3dworld/demo3/) (65 dtk) |
| 70 | **Stickman Beanie** | `stickman-beanie` | ✅ | [Kupluk Merah vs Jebakan Rebahan (Aturan 5 Detik)](styles/stickman-beanie/demo1/) (64 dtk) | [Paradoks Pilihan (Barry Schwartz)](styles/stickman-beanie/demo2/) (64 dtk) | [Efek Spotlight (Thomas Gilovich)](styles/stickman-beanie/demo3/) (65 dtk) |
| 71 | **Stickman Caveman** | `stickman-caveman` | ✅ | [Otak Purba & Batu Tugas (Kerikil 5 Menit)](styles/stickman-caveman/demo1/) (64 dtk) | [Harimau Sabertooth vs Notifikasi (Amigdala)](styles/stickman-caveman/demo2/) (64 dtk) | [Jebakan Buah Beri Digital (Dopamin Instan)](styles/stickman-caveman/demo3/) (65 dtk) |
| 72 | **Stickman Cinematic** | `stickman-cinematic` | ✅ | [Kota Tidur, Mimpimu Belum Selesai (45 Menit Malam)](styles/stickman-cinematic/demo1/) (64 dtk) | [Juara Ditempa Saat Lampu Panggung Mati](styles/stickman-cinematic/demo2/) (64 dtk) | [Surat dari Dirimu Satu Tahun Lagi](styles/stickman-cinematic/demo3/) (65 dtk) |
| 73 | **Stickman Duo** | `stickman-duo` | ✅ | [Mager Sendirian vs Gas Bareng (ASTD 95%)](styles/stickman-duo/demo1/) (64 dtk) | [Efek Body Doubling (Fokus Bersama)](styles/stickman-duo/demo2/) (64 dtk) | [Rahasia Protégé Effect (Belajar = Mengajar)](styles/stickman-duo/demo3/) (65 dtk) |
| 74 | **Stickman Graffiti** | `stickman-graffiti` | ✅ | [Tembok Ini Saksi Mimpimu (The Taste Gap)](styles/stickman-graffiti/demo1/) (64 dtk) | [Jangan Hapus Gagalmu, Timpa dengan Karya](styles/stickman-graffiti/demo2/) (64 dtk) | [Temukan Ciri Khasmu Sendiri (Signature Style)](styles/stickman-graffiti/demo3/) (65 dtk) |
| 75 | **Stickman Lecture** | `stickman-lecture` | ✅ | [Kurva Lupa Ebbinghaus (Spaced Repetition)](styles/stickman-lecture/demo1/) (64 dtk) | [Jebakan Stabilo vs Active Recall](styles/stickman-lecture/demo2/) (64 dtk) | [Efek Zeigarnik & Aturan 5 Menit](styles/stickman-lecture/demo3/) (65 dtk) |
| 76 | **Stickman Minimal Dark** | `stickman-minimal-dark` | ✅ | [Kamu Bukan Pemalas (Regulasi Emosi)](styles/stickman-minimal-dark/demo1/) (64 dtk) | [Hentikan Overthinking Jam 2 Pagi (Brain Dump)](styles/stickman-minimal-dark/demo2/) (64 dtk) | [Lingkaran Kendali Stoik (Epictetus)](styles/stickman-minimal-dark/demo3/) (65 dtk) |
| 77 | **Stickman Picturebook** | `stickman-picturebook` | ✅ | [Dongeng Batu yang Menyusut (Langkah Awal)](styles/stickman-picturebook/demo1/) (64 dtk) | [Kisah Dua Benih di Taman (Akar Pohon Ek)](styles/stickman-picturebook/demo2/) (64 dtk) | [Lentera Seratus Langkah (Cahaya Berpindah)](styles/stickman-picturebook/demo3/) (65 dtk) |
| 78 | **Stickman OverSimplified** | `stickman-oversimplified` | ✅ | [Edmond Becquerel 1839 (Listrik Surya Pertama)](styles/stickman-oversimplified/demo1/) (64 dtk) | [Serendipity Sains (Penisilin & Microwave)](styles/stickman-oversimplified/demo2/) (64 dtk) | [Ignaz Semmelweis 1847 (Cuci Tangan Medis)](styles/stickman-oversimplified/demo3/) (65 dtk) |

## Contoh hasil

- `examples/hello/` (*"Halo Maura Motion"*, 19.1 dtk, voice George `el-id-m`) — perkenalan pipeline Maura Motion dalam 5 babak dengan maskot `K.photon`, kartu gaya, kanvas otomatis, dan equalizer audio.
- `examples/clay-stop-motion-demo2/` (*"Sangkuriang & Perahu Terbalik"*, 56.9 dtk, voice George `el-id-m`) — diorama plastisin 3D 10 babak lengkap dengan gunung perahu, pasukan jin biru, kain fajar palsu, dan ayam berkokok.
- `styles/anime/demo1/`..`demo3/` (*"Tiket Terakhir Mudik"*, *"Surat di Ujung Peron"*, *"Rantang Hangat di Peron Senja"*, voice George `el-id-m`) — 3 cerita slice-of-life anime 2.5D sinematik.
- `styles/clay-stop-motion/demo1/`..`demo3/` (*"Timun Mas & Buto Ijo"*, *"Sangkuriang & Perahu Terbalik"*, *"Bawang Putih & Labu Emas"*, voice George `el-id-m`) — 3 dongeng Nusantara bergaya stop-motion tanah liat.

## Butuh

Node 22+, ffmpeg, Chrome/Chromium (via Playwright), Python 3.10+ (`numpy`, `soundfile`, `scipy`). Narasi utama menggunakan ElevenLabs (`el-id-m` George) dengan fallback otomatis ke TTS offline.

## Lisensi

MIT — bebas dipakai, ubah, dan sebar. Lihat LICENSE.
