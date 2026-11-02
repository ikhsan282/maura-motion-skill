# Maura Motion Skill

Library **77 gaya animasi** untuk video narasi vertikal (TikTok, Reels, YouTube Shorts) — digambar full pakai kode, bukan AI generate. Pilih gaya, kasih topik/naskah, jadi MP4 + narasi Indonesia/Inggris + caption + musik.

Dibangun untuk kebutuhan konten **Maura Group** (Maura Trans, Maura Printing), tapi gayanya umum — bisa dipakai untuk topik apa aja.

## Cara pakai (5 langkah)

1. **Pilih gaya** — buka `STYLES.md`, cari yang `best_for`-nya cocok (mudik → `anime`, rute → `isometrik`, promo hype → `kinetic-type`).
2. **Pelajari kit** — baca `styles/<gaya>/STYLE.md` (ciri visual, gerakan, API) + intip `demo/`.
3. **Tulis naskah** — bikin `story.json` (4–6 baris untuk 20 dtk, 8–12 baris untuk 40–60 dtk, baris 1 = hook).
4. **Bangun scene** — tulis `scene.js` pakai fungsi dari `kit.js`, satu shot per baris naskah.
5. **Render** — `node scripts/make.mjs <project>` → MP4 + narasi + musik + caption.

```bash
# setup pertama kali
node scripts/setup.mjs

# render pendek (maks 20 dtk)
node scripts/make.mjs styles/anime/demo

# render panjang (sampai 120 dtk)
AM_MAX_DURATION=120 node scripts/make.mjs styles/stickman-kisah/demo
```

Detail lengkap: baca `SKILL.md`. Standar nulis cerita & gaya baru: `AUTHORING.md`.

## Dipakai dengan AI (Bahasa Indonesia)

Skill ini dirancang untuk dijalankan **bareng AI coding agent**. Kamu cukup cerita maunya apa, AI yang menulis `story.json` + `scene.js` + render.

**Contoh prompt (copy-paste, ganti topiknya):**

> Buatkan video vertikal gaya `flat-vector` tentang "ke mana perginya Rp100 ribu".
> Naskah 5 baris Bahasa Indonesia, hook di baris pertama.
> Render MP4 + narasi + musik, lalu kirim videonya.

**Pola prompt yang works:**

| Mau apa | Bilang gini |
|---|---|
| Gaya tertentu | "pakai gaya `kinetic-type`" / "gaya 22" / "kayak lukisan minyak" |
| Topik bebas | "buatkan video tentang mudik" (AI pilihkan gaya yang cocok) |
| Video panjang | "buatkan 60 detik tentang ..." |
| Revisi visual | "di detik 7 teksnya numpuk, benerin" |
| Tambah demo | "jadikan demo resmi gaya ini" |

### Pakai Hermes

Hermes (gateway + kanban) bisa menjalankan skill ini sebagai worker. Cukup kirim prompt seperti di atas ke chat Hermes — Hermes yang akan baca `SKILL.md`, tulis naskah & scene, render, dan kirim MP4-nya ke chat.

Catatan: Hermes butuh akses ke repo ini (`~/maura-motion-skill/`), Node 22+, ffmpeg, Chrome, dan Python 3.10+. Setup sekali: `node scripts/setup.mjs`. Untuk suara manusia (ElevenLabs), taruh key di `~/.hermes/elevenlabs.env`.

### Pakai Claude Code

Clone repo ini, lalu jalankan Claude Code dari dalam folder repo:

```bash
git clone https://github.com/ikhsan282/maura-motion-skill.git
cd maura-motion-skill
node scripts/setup.mjs
claude  # atau: claude-code
```

Lalu prompt di dalam Claude Code (sama polanya):

> Baca SKILL.md. Buatkan video gaya `infografis-data` tentang "harga bensin 10 tahun".
> Naskah Bahasa Indonesia 8 baris, render MP4 + narasi ElevenLabs (George), kirim hasilnya.

Claude Code (termasuk paket Pro) tinggal mengikuti `SKILL.md` + `AUTHORING.md` — tidak perlu plugin tambahan. Pastikan `ffmpeg`, Chrome, dan Python 3.10+ tersedia di mesin yang sama.

## Struktur

| Path | Isi |
|---|---|
| `SKILL.md` | Panduan pakai skill (pintu masuk agen) |
| `AUTHORING.md` | Standar naskah & cara bikin gaya baru |
| `STYLES.md` / `catalog.json` | Katalog 77 gaya + kecocokan topik |
| `styles/<gaya>/` | `STYLE.md` + `kit.js` + `demo/` per gaya |
| `examples/` | Contoh jadi: `hello`, `flat-uang100`, `flat-kepala-macet` |
| `engine/` | Runtime + renderer (headless Chrome → MP4) |
| `audio/` | TTS (Kokoro/Piper offline + ElevenLabs), musik, SFX, mixing −14 LUFS |
| `scripts/` | `setup.mjs`, `make.mjs`, `build_index.py` |

## Narasi suara

Dua jalur, pilih sesuai kebutuhan:

| Jalur | Suara | Kapan dipakai |
|---|---|---|
| Offline (default) | Kokoro/Piper, 19 preset, tanpa API key | Draft, iterasi cepat, tanpa internet |
| ElevenLabs | George (`el-id-m`), Alice (`el-id-f`) + 2 lagi, model `eleven_multilingual_v2` | Hasil akhir — suara manusia, Bahasa Indonesia natural |

Key ElevenLabs di `~/.hermes/elevenlabs.env` (jangan commit). Semua demo multi-baru pakai George.

## Gaya dengan demo tambahan

Sebagian gaya punya lebih dari 1 demo (tema berbeda, kit sama):

| Gaya | Demo |
|---|---|
| `flat-vector` | 1. "Cahaya di Wajahmu" (bawaan, 20 dtk) · 2. "Ke Mana Perginya Rp100 Ribu?" (`demo/`, 27 dtk) · 3. "Peta Isi Kepala pas Macet" (`demo-kepala-macet/`, 25 dtk) |
| `infografis-data` | 1. "Jika Dunia Hanya 100 Orang" (bawaan, 20 dtk) · 2. "Harga Bensin 10 Tahun" (`demo-bensin/`, 39 dtk, Pertalite Rp7.400→Rp10.000) · 3. "Kirim Kucing ke Mana Aja" (`demo-ongkir/`, 41 dtk, tarif paket hewan Maura Trans) |
| `kinetic-type` | 1. "Aturan Dua Menit" (bawaan, 20 dtk) · 2. "Fokus Satu Hal" (`demo-fokus-1-hal/`, 18 dtk) · 3. "Efek Hal Kecil" (`demo-efek-kecil/`, 18 dtk) |
| `partikel` | 1. "Murmurasi Burung Jalak" (bawaan) · 2. "Kunang-kunang" (`demo-kunang/`, 20 dtk) · 3. "Hujan + Petrichor" (`demo-hujan/`, 23 dtk) |
| `terminal-ascii` | 1. "Virus yang Mencantumkan Alamat" (bawaan, 20 dtk) · 2. "Password 123456" (`demo-password/`, 20 dtk, brute force + 2FA) · 3. "Backup 3-2-1" (`demo-backup/`, 19 dtk, foto skripsi Rani + cloud vs lokal) |
| `synthwave` | 1. "Suara Drum 80-an" (bawaan, 20 dtk) · 2. "Kota Neon 80-an" (`demo-neon-kota/`, 20 dtk, VHS + arcade) · 3. "Laser & Grid" (`demo-laser-grid/`, 20 dtk, matahari bergaris + chrome) |
| `swiss-bauhaus` | 1. "Bauhaus: Sekolah 14 Tahun" (bawaan) · 2. "Grid Desain" (`demo-grid/`, 18 dtk, aturan sepertiga + margin) · 3. "3 Warna Primer" (`demo-warna/`, 24 dtk, merah-kuning-biru + psikologi warna) |
| `stickman-subuh` | 1. "Begadang vs Tidur Cukup" (`demo/`) · 2. "Begadang" (`demo-begadang/`) · 3. "Tahajud" (`demo-tahajud/`) |

## Status gaya (audit 1 Nov 2026, update stills)

- ✅ **Siap pakai (73):** anime, batik-hidup, blueprint, boneka-rajut, buku-pop-up, cat-air, clay-stop-motion, dark-glow-ui, dunia-blok, flat-vector, flipbook, garis-tunggal, infografis-data, isometrik, kartun-3d-sinematik, kartun-jadul, kartun-outline-tebal, kertas-guntingan, kinetic-type, kotak-cahaya-kertas, lukisan-minyak, lukis-pedesaan, manga-action, math-3b1b, neo-brutalist, noir-dokumenter, origami, papan-tulis-kapur, pixel-retro, pop-art, product-light, riso-halftone, stickman-doodle, stickman-beanie, stickman-cinematic, stickman-duo, stickman-lecture, stickman-graffiti, stickman-3dworld, stickman-picturebook, stickman-caveman, stickman-minimal-dark, stickman-subuh, stickman-pelukis, stickman-kisah, synthwave, terminal-ascii, ui-morph, vhs-arsip, wayang-beber, wayang-kulit, diorama-miniatur, kardus-bekas, gacha-3d, gouache-dongeng, kolase-daun-bunga, partikel, perkamen-ukiran, psychedelic-shader, scrapbook, skala-kosmik, sumi-e, swiss-bauhaus, sketsa-pensil*
- ❌ **Kosong (11):** chrome-y2k, cutaway-3d, dunia-3d-painterly, editorial-serif, hud-showreel, kaca-patri, lukisan-gua-purba, pastel-krayon, tinta-novel-grafis, trailer-gelap, vas-yunani

*sketsa-pensil: demo ada, still menyusul.

## Contoh hasil

- "Ke Mana Perginya Rp100 Ribu?" (`styles/flat-vector/demo/`, 27 dtk) — pipa uang mengalir ke 4 kotak: bensin, jajan, parkir, hilang.
- "Kirim Kucing ke Mana Aja" (`styles/infografis-data/demo-ongkir/`, 41 dtk) — bar chart tarif paket hewan Maura Trans (Bandung 230rb, Tasik 250rb, Ciamis 300rb).
- `examples/hello/` — contoh minimal 5 baris, render 23 dtk (voice George).

## Butuh

Node 22+, ffmpeg, Chrome/Chromium, Python 3.10+. Narasi offline (tidak perlu API key); ElevenLabs opsional untuk suara manusia.

## Lisensi

MIT — bebas dipakai, ubah, dan sebar. Lihat LICENSE.
