# Maura Motion Skill

Library **77 gaya animasi** (70 gaya siap pakai + 7 gaya dalam katalog) untuk video narasi vertikal (TikTok, Reels, YouTube Shorts) — digambar full pakai kode (Canvas 2D, Three.js 3D, WebGL Shader, & Painterly Pass), bukan AI generate gambar statis. Pilih gaya, kasih topik/naskah, langsung jadi MP4 + narasi Bahasa Indonesia/Inggris + caption per kata + musik & SFX (−14 LUFS).

Dibangun untuk kebutuhan konten **Maura Group** (Maura Trans, Maura Printing), tapi gayanya umum — bisa dipakai untuk topik apa saja.

## Cara pakai (5 langkah)

1. **Pilih gaya** — buka `STYLES.md`, cari yang `best_for`-nya cocok (mudik/emosional → `anime`, dongeng plastisin 3D → `clay-stop-motion`, rute → `isometrik`, promo hype → `kinetic-type`).
2. **Pelajari kit** — baca `styles/<gaya>/STYLE.md` (ciri visual, gerakan, API) + intip `demo1/` (atau `demo/`).
3. **Tulis naskah** — bikin `story.json` (4–6 baris untuk 20 dtk, 8–12 baris untuk 40–90 dtk, baris 1 = hook).
4. **Bangun scene** — tulis `scene.js` pakai fungsi dari `kit.js`, satu shot per baris naskah.
5. **Render** — `node scripts/make.mjs <project>` → MP4 + narasi + musik + caption + QA sheet.

```bash
# setup pertama kali (cek Chrome, ffmpeg, Python venv, & dependensi audio)
node scripts/setup.mjs

# render demo pendek (~17 dtk)
node scripts/make.mjs styles/anime/demo1

# render ulang paksa & simpan file build sementara (narration.wav, video.mp4, dll)
node scripts/make.mjs styles/clay-stop-motion/demo2 --force --keep

# render ulang visual/musik saja tanpa memanggil ulang TTS (hemat kuota ElevenLabs)
node scripts/make.mjs examples/hello --no-tts --keep

# render video panjang (atau set "maxDuration": 90 di story.json)
AM_MAX_DURATION=90 node scripts/make.mjs styles/stickman-kisah/demo
```

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

### Pakai Hermes

Hermes (gateway + kanban) bisa menjalankan skill ini sebagai worker. Cukup kirim prompt seperti di atas ke chat Hermes — Hermes yang akan baca `SKILL.md`, tulis naskah & scene, render, dan kirim MP4-nya ke chat.

Catatan: Hermes butuh akses ke repo ini (`~/maura-motion-skill/`), Node 22+, ffmpeg, Chrome, dan Python 3.10+. Setup sekali: `node scripts/setup.mjs`. Untuk suara manusia (ElevenLabs), taruh key `ELEVENLABS_API_KEY` di `~/.env`, `~/.hermes/elevenlabs.env`, atau `.env` di root repo.

### Pakai Claude Code / Antigravity

Clone repo ini, lalu jalankan agen AI dari dalam folder repo:

```bash
git clone https://github.com/ikhsan282/maura-motion-skill.git
cd maura-motion-skill
node scripts/setup.mjs
```

Lalu beri prompt:

> Baca SKILL.md. Buatkan video gaya `infografis-data` tentang "harga bensin 10 tahun".
> Naskah Bahasa Indonesia 8 baris, render MP4 + narasi ElevenLabs (George), kirim hasilnya.

## Struktur

| Path | Isi |
|---|---|
| `SKILL.md` | Panduan pakai skill (pintu masuk agen) |
| `AUTHORING.md` | Standar naskah & cara bikin gaya baru |
| `STYLES.md` / `catalog.json` | Katalog 77 gaya + kecocokan topik |
| `styles/<gaya>/` | `STYLE.md` + `kit.js` + `demo1/`..`demo3/` (atau `demo/`) per gaya |
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

## Status gaya (77 gaya: 70 siap pakai ✅, 7 belum diimplementasi ❌)

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
| 35 | **Editorial Serif** | `editorial-serif` | ❌ | — | — | — |
| 36 | **Chrome Y2K** | `chrome-y2k` | ❌ | — | — | — |
| 37 | **Noir Dokumenter** | `noir-dokumenter` | ✅ | [Krakatau 1883: Suara Paling Keras dalam Sejarah](styles/noir-dokumenter/demo/) (15 dtk) | — | — |
| 38 | **VHS & Arsip CRT** | `vhs-arsip` | ✅ | [Sinyal Wow! 1977](styles/vhs-arsip/demo/) (15 dtk) | — | — |
| 39 | **Flat Vector Explainer** | `flat-vector` | ✅ | [Ke Mana Perginya Rp100 Ribu?](styles/flat-vector/demo/) (27 dtk) | [Peta Isi Kepala Pas Macet](styles/flat-vector/demo-kepala-macet/) (25 dtk) | — |
| 40 | **Kartun Outline Tebal** | `kartun-outline-tebal` | ✅ | [Perang Aplikasi di Baterai 1 Persen](styles/kartun-outline-tebal/demo/) (15 dtk) | — | — |
| 41 | **Neo-Brutalist Bento** | `neo-brutalist` | ✅ | [Ke Mana Perginya Uang Kopi Susu Kekinianmu?](styles/neo-brutalist/demo/) (15 dtk) | — | — |
| 42 | **Vas Yunani Black-Figure** | `vas-yunani` | ❌ | — | — | — |
| 43 | **Scrapbook Collage** | `scrapbook` | ✅ | [Jurnal Wallace: Garis Tak Terlihat di Nusantara](styles/scrapbook/demo/) (42 dtk) | — | — |
| 44 | **Risograph Halftone** | `riso-halftone` | ✅ | [Band yang Dipenjara karena Lagu](styles/riso-halftone/demo/) (15 dtk) | — | — |
| 45 | **Manga Action** | `manga-action` | ✅ | [Smash 565 km/jam](styles/manga-action/demo/) (15 dtk) | — | — |
| 46 | **Sumi-e Tinta Timur** | `sumi-e` | ✅ | [Laksamana Cheng Ho Singgah di Nusantara](styles/sumi-e/demo/) (42 dtk) | — | — |
| 47 | **Synthwave Neon** | `synthwave` | ✅ | [Suara Drum 80-an Lahir dari Kecelakaan](styles/synthwave/demo/) (20 dtk) | [Laser dan Grid: Estetika Synthwave](styles/synthwave/demo-laser-grid/) (20 dtk) | — |
| 48 | **Psychedelic Shader** | `psychedelic-shader` | ✅ | [Satu Rumus, Gambar Tanpa Akhir](styles/psychedelic-shader/demo/) (18 dtk) | — | — |
| 49 | **Math Explainer Gelap** | `math-3b1b` | ✅ | [Kenapa Luas Lingkaran itu Pi r Kuadrat](styles/math-3b1b/demo/) (19 dtk) | [Phi: Keliling Dibagi Diameter Selalu 3,14](styles/math-3b1b/demo-pitagoras/) (20 dtk) | [Setengah Tak Terhingga](styles/math-3b1b/demo-setengah/) (20 dtk) |
| 50 | **Infografis Data** | `infografis-data` | ✅ | [Jika Dunia Hanya 100 Orang](styles/infografis-data/demo/) (20 dtk) | [Harga Bensin 10 Tahun](styles/infografis-data/demo-bensin/) (39 dtk) | [Kirim Kucing ke Mana Aja](styles/infografis-data/demo-ongkir/) (41 dtk) |
| 51 | **3D Cutaway Explainer** | `cutaway-3d` | ❌ | — | — | — |
| 52 | **Blueprint** | `blueprint` | ✅ | [Bagaimana Piramida Giza Dibangun](styles/blueprint/demo/) (20 dtk) | [Denah Rumah Tipe 36](styles/blueprint/demo-rumah/) (21 dtk) | [Jembatan Gantung](styles/blueprint/demo-jembatan/) (20 dtk) |
| 53 | **Skala Kosmik** | `skala-kosmik` | ✅ | [Zoom Out dari Monas ke Ujung Alam Semesta](styles/skala-kosmik/demo/) (16 dtk) | — | — |
| 54 | **Dunia 3D Painterly** | `dunia-3d-painterly` | ❌ | — | — | — |
| 55 | **Diorama Miniatur Tilt-shift** | `diorama-miniatur` | ✅ | [Pasar Terapung Lok Baintan](styles/diorama-miniatur/demo/) (38 dtk) | — | — |
| 56 | **Kawanan Partikel** | `partikel` | ✅ | [Ribuan Burung Terbang Tanpa Pemimpin](styles/partikel/demo/) (17 dtk) | [Kunang-Kunang: Cahaya yang Bernyanyi](styles/partikel/demo-kunang/) (20 dtk) | [Hujan: Satu Tetes, Ribuan Kehidupan](styles/partikel/demo-hujan/) (23 dtk) |
| 57 | **Pop Art Sunburst** | `pop-art` | ✅ | [Kenapa Harga Selalu Berakhir 99?](styles/pop-art/demo/) (15 dtk) | — | — |
| 58 | **Isometrik** | `isometrik` | ✅ | [Perjalanan Paketmu dari Gudang ke Pintu](styles/isometrik/demo/) (15 dtk) | — | — |
| 59 | **HUD Showreel** | `hud-showreel` | ✅ | [HP Bar: Nyawa Terakhirmu](styles/hud-showreel/demo/) (14 dtk) | [Skill Cooldown: Harga Sebuah Kemenangan](styles/hud-showreel/demo-skill/) (21 dtk) | — |
| 60 | **Trailer Tipografi Gelap** | `trailer-gelap` | ❌ | — | — | — |
| 61 | **Monoline Satu Garis** | `garis-tunggal` | ✅ | [Lingkaran Kebiasaan](styles/garis-tunggal/demo/) (18 dtk) | [Burung Satu Garis](styles/garis-tunggal/demo-burung/) (20 dtk) | [Tangan Satu Garis](styles/garis-tunggal/demo-tangan/) (19 dtk) |
| 62 | **Kaca Patri Mosaik** | `kaca-patri` | ❌ | — | — | — |
| 63 | **Perkamen Ukiran Kuno** | `perkamen-ukiran` | ✅ | [Kamus Melayu Pertama Ditulis Pelaut Italia](styles/perkamen-ukiran/demo/) (45 dtk) | — | — |
| 64 | **Toon 3D Gacha Reveal** | `gacha-3d` | ✅ | [Gacha Satwa Langka Indonesia](styles/gacha-3d/demo/) (19 dtk) | — | — |
| 65 | **Stickman Doodle** | `stickman-doodle` | ✅ | [Kenapa Kita Menunda-nunda?](styles/stickman-doodle/demo/) (15 dtk) | — | — |
| 66 | **Stickman Subuh** | `stickman-subuh` | ✅ | [Stickman Subuh](styles/stickman-subuh/demo/) (18 dtk) | [Begadang vs Tidur Cukup](styles/stickman-subuh/demo-begadang/) (22 dtk) | [Stickman Subuh Tahajud](styles/stickman-subuh/demo-tahajud/) (21 dtk) |
| 67 | **Stickman Pelukis** | `stickman-pelukis` | ✅ | [Sempurna vs Gerak Cepat](styles/stickman-pelukis/demo/) (25 dtk) | — | — |
| 68 | **Stickman Kisah** | `stickman-kisah` | ✅ | [Kisah Utang](styles/stickman-kisah/demo/) (54 dtk) | — | — |
| 69 | **Stickman 3D World** | `stickman-3dworld` | ✅ | [Kamu Bukan Pemalas (3D World)](styles/stickman-3dworld/demo/) (15 dtk) | — | — |
| 70 | **Stickman Beanie** | `stickman-beanie` | ✅ | [Kamu Bukan Pemalas (Kupluk)](styles/stickman-beanie/demo/) (15 dtk) | — | — |
| 71 | **Stickman Caveman** | `stickman-caveman` | ✅ | [Otak Purba & Rasa Malas](styles/stickman-caveman/demo/) (15 dtk) | — | — |
| 72 | **Stickman Cinematic** | `stickman-cinematic` | ✅ | [Kota Tidur, Mimpimu Belum Selesai](styles/stickman-cinematic/demo/) (15 dtk) | — | — |
| 73 | **Stickman Duo** | `stickman-duo` | ✅ | [Mager Lagi? Obrolan Dua Sahabat](styles/stickman-duo/demo/) (15 dtk) | — | — |
| 74 | **Stickman Graffiti** | `stickman-graffiti` | ✅ | [Tembok Ini Saksi Mimpimu](styles/stickman-graffiti/demo/) (15 dtk) | — | — |
| 75 | **Stickman Lecture** | `stickman-lecture` | ✅ | [Perhatian ke Papan Tulis!](styles/stickman-lecture/demo/) (15 dtk) | — | — |
| 76 | **Stickman Minimal Dark** | `stickman-minimal-dark` | ✅ | [Kamu Bukan Pemalas (Minimal Dark)](styles/stickman-minimal-dark/demo/) (15 dtk) | — | — |
| 77 | **Stickman Picturebook** | `stickman-picturebook` | ✅ | [Kamu Bukan Pemalas (Buku Cerita)](styles/stickman-picturebook/demo/) (15 dtk) | — | — |

## Contoh hasil

- `examples/hello/` (*"Halo Maura Motion"*, 19.1 dtk, voice George `el-id-m`) — perkenalan pipeline Maura Motion dalam 5 babak dengan maskot `K.photon`, kartu gaya, kanvas otomatis, dan equalizer audio.
- `examples/clay-stop-motion-demo2/` (*"Sangkuriang & Perahu Terbalik"*, 56.9 dtk, voice George `el-id-m`) — diorama plastisin 3D 10 babak lengkap dengan gunung perahu, pasukan jin biru, kain fajar palsu, dan ayam berkokok.
- `styles/anime/demo1/`..`demo3/` (*"Tiket Terakhir Mudik"*, *"Surat di Ujung Peron"*, *"Rantang Hangat di Peron Senja"*, voice George `el-id-m`) — 3 cerita slice-of-life anime 2.5D sinematik.
- `styles/clay-stop-motion/demo1/`..`demo3/` (*"Timun Mas & Buto Ijo"*, *"Sangkuriang & Perahu Terbalik"*, *"Bawang Putih & Labu Emas"*, voice George `el-id-m`) — 3 dongeng Nusantara bergaya stop-motion tanah liat.

## Butuh

Node 22+, ffmpeg, Chrome/Chromium (via Playwright), Python 3.10+ (`numpy`, `soundfile`, `scipy`). Narasi utama menggunakan ElevenLabs (`el-id-m` George) dengan fallback otomatis ke TTS offline.

## Lisensi

MIT — bebas dipakai, ubah, dan sebar. Lihat LICENSE.
