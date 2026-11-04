# Maura Motion Skill

Library **77 gaya animasi** (66 gaya siap pakai + 11 gaya dalam katalog) untuk video narasi vertikal (TikTok, Reels, YouTube Shorts) — digambar full pakai kode (Canvas 2D, Three.js 3D, WebGL Shader, & Painterly Pass), bukan AI generate gambar statis. Pilih gaya, kasih topik/naskah, langsung jadi MP4 + narasi Bahasa Indonesia/Inggris + caption per kata + musik & SFX (−14 LUFS).

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

Gaya No. 1 sampai 12 kini sudah memiliki paket lengkap **3 demo per gaya**, dengan naskah narasi lengkap yang berdurasi 30–90 detik (dan demo pendek ~17–48 detik) serta siap dirender:

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
| 12 | `low-poly` | "Pulau Run & Manhattan — Pulau Pala" (`demo1/`, 56 dtk) | "Kapal Phinisi Nusantara" (`demo2/`, 55 dtk) | "Cincin Api Nusantara" (`demo3/`, 55 dtk) |

Selain gaya 1–12, sebagian gaya lain juga memiliki variasi demo tambahan:

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

## Status gaya (77 gaya: 66 siap pakai ✅, 11 belum diimplementasi ❌)

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
| 13 | **Buku Pop-up** | buku-pop-up | ✅ ([styles/buku-pop-up](styles/buku-pop-up/)) |
| 14 | **Batik Hidup** | batik-hidup | ✅ ([styles/batik-hidup](styles/batik-hidup/)) |
| 15 | **Wayang Golek** | wayang-golek | ❌ (belum diimplementasi) |
| 16 | **Wayang Beber** | wayang-beber | ✅ ([styles/wayang-beber](styles/wayang-beber/)) |
| 17 | **Lukisan Gua Purba** | lukisan-gua-purba | ❌ (belum diimplementasi) |
| 18 | **Origami** | origami | ✅ ([styles/origami](styles/origami/)) |
| 19 | **Kardus Bekas** | kardus-bekas | ✅ ([styles/kardus-bekas](styles/kardus-bekas/)) |
| 20 | **Kolase Daun & Bunga** | kolase-daun-bunga | ✅ ([styles/kolase-daun-bunga](styles/kolase-daun-bunga/)) |
| 21 | **Kotak Cahaya Kertas** | kotak-cahaya-kertas | ✅ ([styles/kotak-cahaya-kertas](styles/kotak-cahaya-kertas/)) |
| 22 | **Lukisan Minyak Bergerak** | lukisan-minyak | ✅ ([styles/lukisan-minyak](styles/lukisan-minyak/)) |
| 23 | **Papan Tulis Kapur** | papan-tulis-kapur | ✅ ([styles/papan-tulis-kapur](styles/papan-tulis-kapur/)) |
| 24 | **Flipbook** | flipbook | ✅ ([styles/flipbook](styles/flipbook/)) |
| 25 | **Terminal ASCII** | terminal-ascii | ✅ ([styles/terminal-ascii](styles/terminal-ascii/)) |
| 26 | **Cat Air (Watercolor)** | cat-air | ✅ ([styles/cat-air](styles/cat-air/)) |
| 27 | **Gouache Buku Dongeng** | gouache-dongeng | ✅ ([styles/gouache-dongeng](styles/gouache-dongeng/)) |
| 28 | **Pastel & Krayon** | pastel-krayon | ❌ (belum diimplementasi) |
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
