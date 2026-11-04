# Maura Motion Skill

Library **77 gaya animasi** (69 gaya siap pakai + 8 gaya dalam katalog) untuk video narasi vertikal (TikTok, Reels, YouTube Shorts) — digambar full pakai kode (Canvas 2D, Three.js 3D, WebGL Shader, & Painterly Pass), bukan AI generate gambar statis. Pilih gaya, kasih topik/naskah, langsung jadi MP4 + narasi Bahasa Indonesia/Inggris + caption per kata + musik & SFX (−14 LUFS).

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

## Gaya dengan demo tambahan

Gaya No. 1 sampai 28 kini sudah memiliki paket lengkap **3 demo per gaya**, dengan naskah narasi lengkap yang berdurasi 30–90 detik (dan demo pendek ~17–48 detik) serta siap dirender:

| No | Gaya | Demo 1 | Demo 2 | Demo 3 |
|:---:|---|---|---|---|
| 1 | `anime` | "Tiket Terakhir Mudik" (`demo1/`, 17 dtk) | "Surat di Ujung Peron" (`demo2/`, 52 dtk) | "Rantang Hangat di Peron Senja" (`demo3/`, 60 dtk) |
| 2 | `kartun-3d-sinematik` | "Sangkuriang & Tangkuban Perahu" (`demo1/`, 48 dtk) | "Roro Jonggrang & Candi Sewu" (`demo2/`, 55 dtk) | "Legenda Danau Toba & Ikan Mas Ajaib" (`demo3/`, 55 dtk) |
| 3 | `lukis-pedesaan` | "Dewi Sri, Asal Mula Padi" (`demo1/`, 48 dtk) | "Musim Tanam Sawah Terasering" (`demo2/`, 55 dtk) | "Pasar Terapung & Perahu Pagi" (`demo3/`, 55 dtk) |
| 4 | `dunia-blok` | "Candi Borobudur: Megastruktur Voxel" (`demo1/`, 48 dtk) | "Letusan Krakatau 1883" (`demo2/`, 55 dtk) | "Monas: Lidah Api Emas di Puncak" (`demo3/`, 55 dtk) |
| 5 | `clay-stop-motion` | "Timun Mas & Buto Ijo" (`demo1/`, 17 dtk) | "Sangkuriang & Perahu Terbalik" (`demo2/`, 57 dtk) | "Bawang Putih & Labu Emas" (`demo3/`, 62 dtk) |
| 6 | `boneka-rajut` | "Kancil Mencuri Mentimun" (`demo1/`, 50 dtk) | "Kancil dan Barisan Buaya Sungai" (`demo2/`, 55 dtk) | "Balap Lari Kelinci Sombong & Kura-kura" (`demo3/`, 55 dtk) |
| 7 | `pixel-retro` | "Si Pitung: Level Batavia" (`demo1/`, 48 dtk) | "Kenapa Game Jadul 16-Bit Bikin Nagih?" (`demo2/`, 55 dtk) | "Tamagotchi 90-an: Jangan Sampai Mati!" (`demo3/`, 55 dtk) |
| 8 | `kertas-guntingan` | "Legenda Danau Toba" (`demo1/`, 62 dtk) | "Legenda Batu Menangis" (`demo2/`, 87 dtk) | "Asal-Usul Nama Banyuwangi" (`demo3/`, 55 dtk) |
| 9 | `sketsa-pensil` | "Faktor Habibie: Retakan Sekecil Rambut" (`demo1/`, 58 dtk) | "Kenapa Kapal Baja Mengapung? Archimedes" (`demo2/`, 58 dtk) | "Rahasia Konstruksi Candi Borobudur" (`demo3/`, 55 dtk) |
| 10 | `kartun-jadul` | "Kancil Mencuri Timun" (`demo1/`, 54 dtk) | "Kancil dan Barisan Buaya" (`demo2/`, 55 dtk) | "Si Kabayan & Nangka Hanyut" (`demo3/`, 55 dtk) |
| 11 | `wayang-kulit` | "Arjuna di Kurusetra — Bhagavad Gita" (`demo1/`, 62 dtk) | "Bima & Dewa Ruci — Tirta Pawitra" (`demo2/`, 55 dtk) | "Gugurnya Gatotkaca di Kurusetra" (`demo3/`, 56 dtk) |
| 12 | `low-poly` | "Pulau Run & Manhattan — Pulau Pala" (`demo1/`, 56 dtk) | "Kapal Phinisi Nusantara" (`demo2/`, 55 dtk) | "Cincin Api Nusantara" (`demo3/`, 78 dtk) |
| 13 | `buku-pop-up` | "Roro Jonggrang & Seribu Candi" (`demo1/`, 52 dtk) | "Timun Mas & Empat Bungkusan Ajaib" (`demo2/`, 55 dtk) | "Keajaiban Candi Borobudur" (`demo3/`, 55 dtk) |
| 14 | `batik-hidup` | "Parang Rusak: Motif Larangan" (`demo1/`, 52 dtk) | "Filosofi Batik Kawung — Buah Aren" (`demo2/`, 55 dtk) | "Batik Mega Mendung Cirebon" (`demo3/`, 55 dtk) |
| 15 | `wayang-golek` | "Hanoman Obong: Membakar Alengka" (`demo1/`, 55 dtk) | "Si Cepot & Falsafah Tawa Sunda" (`demo2/`, 55 dtk) | "Lahirnya Gatotkaca di Kawah Candradimuka" (`demo3/`, 55 dtk) |
| 16 | `wayang-beber` | "Panji & Dewi Sekartaji" (`demo1/`, 52 dtk) | "Ande-Ande Lumut & Klenting Kuning" (`demo2/`, 55 dtk) | "Jaka Tarub & Selendang Nawangwulan" (`demo3/`, 55 dtk) |
| 17 | `lukisan-gua-purba` | "Lukisan Gua Tertua di Sulawesi" (`demo1/`, 55 dtk) | "Perburuan Agung di Dinding Batu" (`demo2/`, 55 dtk) | "Rahasia Cap Tangan Merah" (`demo3/`, 55 dtk) |
| 18 | `origami` | "Seribu Bangau Kertas" (`demo1/`, 52 dtk) | "Sains Lipatan Origami ke Antariksa" (`demo2/`, 55 dtk) | "Empat Musim di Desa Kertas Washi" (`demo3/`, 55 dtk) |
| 19 | `kardus-bekas` | "Perjalanan Kardus Paketmu" (`demo1/`, 55 dtk) | "Rahasia Kekuatan Kardus Bergelombang" (`demo2/`, 55 dtk) | "Imajinasi Tanpa Batas Kardus Bekas" (`demo3/`, 55 dtk) |
| 20 | `kolase-daun-bunga` | "Rafflesia arnoldii Bunga Raksasa" (`demo1/`, 55 dtk) | "Kantong Semar Pemangsa Serangga" (`demo2/`, 55 dtk) | "Seni Herbarium & Kolase Botani" (`demo3/`, 55 dtk) |
| 21 | `kotak-cahaya-kertas` | "Legenda Malin Kundang" (`demo1/`, 52 dtk) | "Putri Mandalika & Tradisi Bau Nyale" (`demo2/`, 55 dtk) | "Seni Shadow Box & Teater Siluet" (`demo3/`, 55 dtk) |
| 22 | `lukisan-minyak` | "Lukisan Balasan Raden Saleh" (`demo1/`, 52 dtk) | "Perjalanan Raden Saleh ke Eropa" (`demo2/`, 55 dtk) | "Jalan Raya Pos Anyer–Panarukan 1808" (`demo3/`, 55 dtk) |
| 23 | `papan-tulis-kapur` | "Paradoks Ulang Tahun: 23 Orang 50%" (`demo1/`, 52 dtk) | "Paradoks Monty Hall: Pindah Pintu" (`demo2/`, 55 dtk) | "Lipat Kertas 42 Kali Sampai ke Bulan" (`demo3/`, 55 dtk) |
| 24 | `flipbook` | "Animasi Lahir dari Pojok Buku" (`demo1/`, 52 dtk) | "Rahasia 12 Prinsip Animasi" (`demo2/`, 55 dtk) | "Taruhan Kuda Berlari Muybridge 1878" (`demo3/`, 55 dtk) |
| 25 | `terminal-ascii` | "Virus Brain 1986: Alamat di Kode Virus" (`demo1/`, 52 dtk) | "Pesan Pertama Internet 1969: LO Crash" (`demo2/`, 55 dtk) | "Kepanikan Bug Y2K Tahun 2000" (`demo3/`, 55 dtk) |
| 26 | `cat-air` | "Legenda Roro Anteng & Joko Seger (Kasada)" (`demo1/`, 52 dtk) | "Fajar di Kaldera Tengger: Bromo, Batok, Semeru" (`demo2/`, 55 dtk) | "Teknik Lukis Cat Air Basah di Atas Basah" (`demo3/`, 55 dtk) |
| 27 | `gouache-dongeng` | "Bawang Merah & Bawang Putih: Dua Labu" (`demo1/`, 52 dtk) | "Keong Mas & Putri Candra Kirana" (`demo2/`, 55 dtk) | "Kancil & Siput Lomba Lari di Sungai" (`demo3/`, 55 dtk) |
| 28 | `pastel-krayon` | "Kenapa Bulan Mengikuti Kita? Paralaks" (`demo1/`, 52 dtk) | "Bagaimana Pelangi Muncul Selepas Hujan?" (`demo2/`, 55 dtk) | "Ke Mana Perginya Bayanganmu Saat Siang?" (`demo3/`, 55 dtk) |

Selain gaya 1–28, sebagian gaya lain juga memiliki variasi demo tambahan:

| Gaya | Demo |
|---|---|
| `flat-vector` | 1. "Cahaya di Wajahmu" (bawaan, 20 dtk) · 2. "Ke Mana Perginya Rp100 Ribu?" (`demo/`, 27 dtk) · 3. "Peta Isi Kepala pas Macet" (`demo-kepala-macet/`, 25 dtk) |
| `infografis-data` | 1. "Jika Dunia Hanya 100 Orang" (bawaan, 20 dtk) · 2. "Harga Bensin 10 Tahun" (`demo-bensin/`, 39 dtk, Pertalite Rp7.400→Rp10.000) · 3. "Kirim Kucing ke Mana Aja" (`demo-ongkir/`, 41 dtk, tarif paket hewan Maura Trans) |
| `kinetic-type` | 1. "Aturan Dua Menit" (bawaan, 20 dtk) · 2. "Fokus Satu Hal" (`demo-fokus-1-hal/`, 18 dtk) · 3. "Efek Hal Kecil" (`demo-efek-kecil/`, 18 dtk) |
| `partikel` | 1. "Murmurasi Burung Jalak" (bawaan) · 2. "Kunang-kunang" (`demo-kunang/`, 20 dtk) · 3. "Hujan + Petrichor" (`demo-hujan/`, 23 dtk) |
| `terminal-ascii` | 1. "Virus yang Mencantumkan Alamat" (bawaan, 20 dtk) · 2. "Password 123456" (`demo-password/`, 20 dtk, brute force + 2FA) · 3. "Backup 3-2-1" (`demo-backup/`, 19 dtk, foto skripsi Rani + cloud vs lokal) |
| `synthwave` | 1. "Suara Drum 80-an" (bawaan, 20 dtk) · 2. "Laser & Grid" (`demo-laser-grid/`, 20 dtk, matahari bergaris + chrome) |
| `math-3b1b` | 1. "Luas Lingkaran = πr²" (bawaan, 19 dtk) · 2. "Phi: K ÷ d = 3,14" (`demo-pitagoras/`, 20 dtk, tali keliling + diameter) · 3. "Setengah Tak Terhingga" (`demo-setengah/`, 20 dtk, Zeno ½+¼+⅛=1) |
| `papan-tulis-kapur` | 1. "Paradoks Ulang Tahun" (bawaan, 20 dtk) · 2. "Efek SKS" (`demo-sks/`, 20 dtk, deadline + adrenalin) · 3. "Trik 9x Jari" (`demo-rumus/`, 19 dtk, tekuk jari ke-7) |
| `blueprint` | 1. "Piramida Giza" (bawaan, 20 dtk) · 2. "Denah Rumah 36" (`demo-rumah/`, 21 dtk, 5 ruang + skala) · 3. "Jembatan Gantung" (`demo-jembatan/`, 20 dtk, kabel + menara + dek) |
| `dark-glow-ui` | 1. "Cyberpunk Login" (bawaan, 20 dtk) · 2. "Notifikasi + FOMO" (`demo-notif/`, 19 dtk, layar HP + digital detox) · 3. "Dashboard Real-time" (`demo-dashboard/`, 15 dtk, chart + metrik + alert) |
| `hud-showreel` | 1. "HP Bar" (`demo/` & `demo-hp/`, 14 dtk, damage + heal + KO) · 2. "Skill Cooldown" (`demo-skill/`, 21 dtk, ulti + combo x3 + level up) |
| `flipbook` | 1. "Lompat Katak" (bawaan, 18 dtk) · 2. "Bola Memantul" (`demo-bola/`, 12 dtk, squash + stretch + gravitasi) · 3. "Stickman Lari" (`demo-lari/`, 16 dtk, langkah + debu + garis gerak) |
| `garis-tunggal` | 1. "Wajah Satu Garis" (bawaan, 18 dtk) · 2. "Burung Satu Garis" (`demo-burung/`, 20 dtk, paruh + sayap + terbang) · 3. "Tangan Satu Garis" (`demo-tangan/`, 19 dtk, jari + genggam + lambaian) |
| `swiss-bauhaus` | 1. "Bauhaus: Sekolah 14 Tahun" (bawaan) · 2. "Grid Desain" (`demo-grid/`, 18 dtk, aturan sepertiga + margin) · 3. "3 Warna Primer" (`demo-warna/`, 24 dtk, merah-kuning-biru + psikologi warna) |
| `stickman-subuh` | 1. "Begadang vs Tidur Cukup" (`demo/`) · 2. "Begadang" (`demo-begadang/`) · 3. "Tahajud" (`demo-tahajud/`) |

## Status gaya (77 gaya: 69 siap pakai ✅, 8 belum diimplementasi ❌)

| No | Gaya | ID | Status |
|:---:|---|---|---|
| 1 | **Anime** | anime | ✅ ([demo1](styles/anime/demo1/) · [demo2](styles/anime/demo2/) · [demo3](styles/anime/demo3/)) |
| 2 | **Kartun 3D Sinematik** | kartun-3d-sinematik | ✅ ([demo1](styles/kartun-3d-sinematik/demo1/) · [demo2](styles/kartun-3d-sinematik/demo2/) · [demo3](styles/kartun-3d-sinematik/demo3/)) |
| 3 | **Lukis Pedesaan** | lukis-pedesaan | ✅ ([demo1](styles/lukis-pedesaan/demo1/) · [demo2](styles/lukis-pedesaan/demo2/) · [demo3](styles/lukis-pedesaan/demo3/)) |
| 4 | **Dunia Blok (Voxel)** | dunia-blok | ✅ ([demo1](styles/dunia-blok/demo1/) · [demo2](styles/dunia-blok/demo2/) · [demo3](styles/dunia-blok/demo3/)) |
| 5 | **Clay Stop Motion** | clay-stop-motion | ✅ ([demo1](styles/clay-stop-motion/demo1/) · [demo2](styles/clay-stop-motion/demo2/) · [demo3](styles/clay-stop-motion/demo3/)) |
| 6 | **Boneka Rajut** | boneka-rajut | ✅ ([demo1](styles/boneka-rajut/demo1/) · [demo2](styles/boneka-rajut/demo2/) · [demo3](styles/boneka-rajut/demo3/)) |
| 7 | **Pixel Retro** | pixel-retro | ✅ ([demo1](styles/pixel-retro/demo1/) · [demo2](styles/pixel-retro/demo2/) · [demo3](styles/pixel-retro/demo3/)) |
| 8 | **Kertas Guntingan** | kertas-guntingan | ✅ ([demo1](styles/kertas-guntingan/demo1/) · [demo2](styles/kertas-guntingan/demo2/) · [demo3](styles/kertas-guntingan/demo3/)) |
| 9 | **Sketsa Pensil** | sketsa-pensil | ✅ ([demo1](styles/sketsa-pensil/demo1/) · [demo2](styles/sketsa-pensil/demo2/) · [demo3](styles/sketsa-pensil/demo3/)) |
| 10 | **Kartun Jadul (Rubber Hose)** | kartun-jadul | ✅ ([demo1](styles/kartun-jadul/demo1/) · [demo2](styles/kartun-jadul/demo2/) · [demo3](styles/kartun-jadul/demo3/)) |
| 11 | **Wayang Kulit** | wayang-kulit | ✅ ([demo1](styles/wayang-kulit/demo1/) · [demo2](styles/wayang-kulit/demo2/) · [demo3](styles/wayang-kulit/demo3/)) |
| 12 | **Low Poly** | low-poly | ✅ ([demo1](styles/low-poly/demo1/) · [demo2](styles/low-poly/demo2/) · [demo3](styles/low-poly/demo3/)) |
| 13 | **Buku Pop-up** | buku-pop-up | ✅ ([demo1](styles/buku-pop-up/demo1/) · [demo2](styles/buku-pop-up/demo2/) · [demo3](styles/buku-pop-up/demo3/)) |
| 14 | **Batik Hidup** | batik-hidup | ✅ ([demo1](styles/batik-hidup/demo1/) · [demo2](styles/batik-hidup/demo2/) · [demo3](styles/batik-hidup/demo3/)) |
| 15 | **Wayang Golek** | wayang-golek | ✅ ([demo1](styles/wayang-golek/demo1/) · [demo2](styles/wayang-golek/demo2/) · [demo3](styles/wayang-golek/demo3/)) |
| 16 | **Wayang Beber** | wayang-beber | ✅ ([demo1](styles/wayang-beber/demo1/) · [demo2](styles/wayang-beber/demo2/) · [demo3](styles/wayang-beber/demo3/)) |
| 17 | **Lukisan Gua Purba** | lukisan-gua-purba | ✅ ([demo1](styles/lukisan-gua-purba/demo1/) · [demo2](styles/lukisan-gua-purba/demo2/) · [demo3](styles/lukisan-gua-purba/demo3/)) |
| 18 | **Origami** | origami | ✅ ([demo1](styles/origami/demo1/) · [demo2](styles/origami/demo2/) · [demo3](styles/origami/demo3/)) |
| 19 | **Kardus Bekas** | kardus-bekas | ✅ ([demo1](styles/kardus-bekas/demo1/) · [demo2](styles/kardus-bekas/demo2/) · [demo3](styles/kardus-bekas/demo3/)) |
| 20 | **Kolase Daun & Bunga** | kolase-daun-bunga | ✅ ([demo1](styles/kolase-daun-bunga/demo1/) · [demo2](styles/kolase-daun-bunga/demo2/) · [demo3](styles/kolase-daun-bunga/demo3/)) |
| 21 | **Kotak Cahaya Kertas** | kotak-cahaya-kertas | ✅ ([demo1](styles/kotak-cahaya-kertas/demo1/) · [demo2](styles/kotak-cahaya-kertas/demo2/) · [demo3](styles/kotak-cahaya-kertas/demo3/)) |
| 22 | **Lukisan Minyak Bergerak** | lukisan-minyak | ✅ ([demo1](styles/lukisan-minyak/demo1/) · [demo2](styles/lukisan-minyak/demo2/) · [demo3](styles/lukisan-minyak/demo3/)) |
| 23 | **Papan Tulis Kapur** | papan-tulis-kapur | ✅ ([demo1](styles/papan-tulis-kapur/demo1/) · [demo2](styles/papan-tulis-kapur/demo2/) · [demo3](styles/papan-tulis-kapur/demo3/)) |
| 24 | **Flipbook** | flipbook | ✅ ([demo1](styles/flipbook/demo1/) · [demo2](styles/flipbook/demo2/) · [demo3](styles/flipbook/demo3/)) |
| 25 | **Terminal ASCII** | terminal-ascii | ✅ ([demo1](styles/terminal-ascii/demo1/) · [demo2](styles/terminal-ascii/demo2/) · [demo3](styles/terminal-ascii/demo3/)) |
| 26 | **Cat Air (Watercolor)** | cat-air | ✅ ([demo1](styles/cat-air/demo1/) · [demo2](styles/cat-air/demo2/) · [demo3](styles/cat-air/demo3/)) |
| 27 | **Gouache Buku Dongeng** | gouache-dongeng | ✅ ([demo1](styles/gouache-dongeng/demo1/) · [demo2](styles/gouache-dongeng/demo2/) · [demo3](styles/gouache-dongeng/demo3/)) |
| 28 | **Pastel & Krayon** | pastel-krayon | ✅ ([demo1](styles/pastel-krayon/demo1/) · [demo2](styles/pastel-krayon/demo2/) · [demo3](styles/pastel-krayon/demo3/)) |
| 29 | **Tinta Novel Grafis** | tinta-novel-grafis | ❌ (belum diimplementasi) |
| 30 | **Product Film Light** | product-light | ✅ ([styles/product-light](styles/product-light/)) |
| 31 | **Dark Glow Product UI** | dark-glow-ui | ✅ ([styles/dark-glow-ui](styles/dark-glow-ui/)) |
| 32 | **One-Shape UI Morph** | ui-morph | ✅ ([styles/ui-morph](styles/ui-morph/)) |
| 33 | **Kinetic Typography** | kinetic-type | ✅ ([styles/kinetic-type](styles/kinetic-type/)) |
| 34 | **Swiss / Bauhaus Grid** | swiss-bauhaus | ✅ ([styles/swiss-bauhaus](styles/swiss-bauhaus/)) |
| 35 | **Editorial Serif** | editorial-serif | ❌ (belum diimplementasi) |
| 36 | **Chrome Y2K** | chrome-y2k | ❌ (belum diimplementasi) |
| 37 | **Noir Dokumenter** | noir-dokumenter | ✅ ([styles/noir-dokumenter](styles/noir-dokumenter/)) |
| 38 | **VHS & Arsip CRT** | vhs-arsip | ✅ ([styles/vhs-arsip](styles/vhs-arsip/)) |
| 39 | **Flat Vector Explainer** | flat-vector | ✅ ([styles/flat-vector](styles/flat-vector/)) |
| 40 | **Kartun Outline Tebal** | kartun-outline-tebal | ✅ ([styles/kartun-outline-tebal](styles/kartun-outline-tebal/)) |
| 41 | **Neo-Brutalist Bento** | neo-brutalist | ✅ ([styles/neo-brutalist](styles/neo-brutalist/)) |
| 42 | **Vas Yunani Black-Figure** | vas-yunani | ❌ (belum diimplementasi) |
| 43 | **Scrapbook Collage** | scrapbook | ✅ ([styles/scrapbook](styles/scrapbook/)) |
| 44 | **Risograph Halftone** | riso-halftone | ✅ ([styles/riso-halftone](styles/riso-halftone/)) |
| 45 | **Manga Action** | manga-action | ✅ ([styles/manga-action](styles/manga-action/)) |
| 46 | **Sumi-e Tinta Timur** | sumi-e | ✅ ([styles/sumi-e](styles/sumi-e/)) |
| 47 | **Synthwave Neon** | synthwave | ✅ ([styles/synthwave](styles/synthwave/)) |
| 48 | **Psychedelic Shader** | psychedelic-shader | ✅ ([styles/psychedelic-shader](styles/psychedelic-shader/)) |
| 49 | **Math Explainer Gelap** | math-3b1b | ✅ ([styles/math-3b1b](styles/math-3b1b/)) |
| 50 | **Infografis Data** | infografis-data | ✅ ([styles/infografis-data](styles/infografis-data/)) |
| 51 | **3D Cutaway Explainer** | cutaway-3d | ❌ (belum diimplementasi) |
| 52 | **Blueprint** | blueprint | ✅ ([styles/blueprint](styles/blueprint/)) |
| 53 | **Skala Kosmik** | skala-kosmik | ✅ ([styles/skala-kosmik](styles/skala-kosmik/)) |
| 54 | **Dunia 3D Painterly** | dunia-3d-painterly | ❌ (belum diimplementasi) |
| 55 | **Diorama Miniatur Tilt-shift** | diorama-miniatur | ✅ ([styles/diorama-miniatur](styles/diorama-miniatur/)) |
| 56 | **Kawanan Partikel** | partikel | ✅ ([styles/partikel](styles/partikel/)) |
| 57 | **Pop Art Sunburst** | pop-art | ✅ ([styles/pop-art](styles/pop-art/)) |
| 58 | **Isometrik** | isometrik | ✅ ([styles/isometrik](styles/isometrik/)) |
| 59 | **HUD Showreel** | hud-showreel | ✅ ([styles/hud-showreel](styles/hud-showreel/)) |
| 60 | **Trailer Tipografi Gelap** | trailer-gelap | ❌ (belum diimplementasi) |
| 61 | **Monoline Satu Garis** | garis-tunggal | ✅ ([styles/garis-tunggal](styles/garis-tunggal/)) |
| 62 | **Kaca Patri Mosaik** | kaca-patri | ❌ (belum diimplementasi) |
| 63 | **Perkamen Ukiran Kuno** | perkamen-ukiran | ✅ ([styles/perkamen-ukiran](styles/perkamen-ukiran/)) |
| 64 | **Toon 3D Gacha Reveal** | gacha-3d | ✅ ([styles/gacha-3d](styles/gacha-3d/)) |
| 65 | **Stickman Doodle** | stickman-doodle | ✅ ([styles/stickman-doodle](styles/stickman-doodle/)) |
| 66 | **Stickman Subuh** | stickman-subuh | ✅ ([styles/stickman-subuh](styles/stickman-subuh/)) |
| 67 | **Stickman Pelukis** | stickman-pelukis | ✅ ([styles/stickman-pelukis](styles/stickman-pelukis/)) |
| 68 | **Stickman Kisah** | stickman-kisah | ✅ ([styles/stickman-kisah](styles/stickman-kisah/)) |
| 69 | **Stickman 3D World** | stickman-3dworld | ✅ ([styles/stickman-3dworld](styles/stickman-3dworld/)) |
| 70 | **Stickman Beanie** | stickman-beanie | ✅ ([styles/stickman-beanie](styles/stickman-beanie/)) |
| 71 | **Stickman Caveman** | stickman-caveman | ✅ ([styles/stickman-caveman](styles/stickman-caveman/)) |
| 72 | **Stickman Cinematic** | stickman-cinematic | ✅ ([styles/stickman-cinematic](styles/stickman-cinematic/)) |
| 73 | **Stickman Duo** | stickman-duo | ✅ ([styles/stickman-duo](styles/stickman-duo/)) |
| 74 | **Stickman Graffiti** | stickman-graffiti | ✅ ([styles/stickman-graffiti](styles/stickman-graffiti/)) |
| 75 | **Stickman Lecture** | stickman-lecture | ✅ ([styles/stickman-lecture](styles/stickman-lecture/)) |
| 76 | **Stickman Minimal Dark** | stickman-minimal-dark | ✅ ([styles/stickman-minimal-dark](styles/stickman-minimal-dark/)) |
| 77 | **Stickman Picturebook** | stickman-picturebook | ✅ ([styles/stickman-picturebook](styles/stickman-picturebook/)) |

## Contoh hasil

- `examples/hello/` (*"Halo Maura Motion"*, 19.1 dtk, voice George `el-id-m`) — perkenalan pipeline Maura Motion dalam 5 babak dengan maskot `K.photon`, kartu gaya, kanvas otomatis, dan equalizer audio.
- `examples/clay-stop-motion-demo2/` (*"Sangkuriang & Perahu Terbalik"*, 56.9 dtk, voice George `el-id-m`) — diorama plastisin 3D 10 babak lengkap dengan gunung perahu, pasukan jin biru, kain fajar palsu, dan ayam berkokok.
- `styles/anime/demo1/`..`demo3/` (*"Tiket Terakhir Mudik"*, *"Surat di Ujung Peron"*, *"Rantang Hangat di Peron Senja"*, voice George `el-id-m`) — 3 cerita slice-of-life anime 2.5D sinematik.
- `styles/clay-stop-motion/demo1/`..`demo3/` (*"Timun Mas & Buto Ijo"*, *"Sangkuriang & Perahu Terbalik"*, *"Bawang Putih & Labu Emas"*, voice George `el-id-m`) — 3 dongeng Nusantara bergaya stop-motion tanah liat.

## Butuh

Node 22+, ffmpeg, Chrome/Chromium (via Playwright), Python 3.10+ (`numpy`, `soundfile`, `scipy`). Narasi utama menggunakan ElevenLabs (`el-id-m` George) dengan fallback otomatis ke TTS offline.

## Lisensi

MIT — bebas dipakai, ubah, dan sebar. Lihat LICENSE.
