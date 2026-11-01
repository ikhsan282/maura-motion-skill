# Maura Motion Skill

Library 65 gaya animasi untuk video narasi vertikal (TikTok, Reels, YouTube Shorts) — digambar full pakai kode, bukan AI generate. Pilih gaya, kasih topik/naskah, jadi MP4 + narasi Indonesia/Inggris + caption + musik.

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

# render (video panjang sampai 60 dtk)
AM_MAX_DURATION=70 node scripts/make.mjs ./my-short
```

Detail lengkap: baca `SKILL.md`. Standar nulis cerita & gaya baru: `AUTHORING.md`.

## Struktur

| Path | Isi |
|---|---|
| `SKILL.md` | Panduan pakai skill (pintu masuk agen) |
| `STYLES.md` / `catalog.json` | Katalog 65 gaya + kecocokan topik |
| `styles/<gaya>/` | `STYLE.md` + `kit.js` + `demo/` per gaya |
| `engine/` | Runtime + renderer (headless Chrome → MP4) |
| `audio/` | TTS (Kokoro/Piper, offline), 19 preset musik, 45 SFX, mixing −14 LUFS |
| `scripts/` | `setup.mjs`, `make.mjs`, `build_index.py` |

## Status gaya (audit 1 Nov 2026)

- ✅ **Lengkap siap pakai (26):** anime, batik-hidup, blueprint, boneka-rajut, buku-pop-up, dark-glow-ui, flat-vector, garis-tunggal, isometrik, kartun-3d-sinematik, kartun-outline-tebal, kinetic-type, manga-action, noir-dokumenter, origami, pixel-retro, pop-art, riso-halftone, stickman-doodle, synthwave, terminal-ascii, vhs-arsip, wayang-kulit, cat-air, clay-stop-motion, sketsa-pensil
- ⚠️ **Demo ada, belum ada still (14):** dunia-blok, flipbook, infografis-data, kartun-jadul, kertas-guntingan, kotak-cahaya-kertas, lukisan-minyak, lukis-pedesaan, math-3b1b, neo-brutalist, papan-tulis-kapur, product-light, ui-morph, wayang-beber
- 🔧 **Kit/sebagian (14):** butuh develop lanjut sebelum dipakai produksi
- ❌ **Kosong (11):** chrome-y2k, cutaway-3d, dunia-3d-painterly, editorial-serif, hud-showreel, kaca-patri, lukisan-gua-purba, pastel-krayon, tinta-novel-grafis, trailer-gelap, vas-yunani

## Contoh hasil

Video "Mudik Nyaman Maura Trans" (flat-vector, full custom, 44 dtk) — bus MAURA TRANS, kursi empuk, rute Jakarta→Jawa, rating 4.9, CTA pesan kursi. Dibuat dengan skill ini: `story.json` 10 baris + `scene.js` 10 adegan.

## Butuh

Node 22+, ffmpeg, Chrome/Chromium, Python 3.10+. Narasi offline (tidak perlu API key).

## Lisensi

MIT — bebas dipakai, ubah, dan sebar. Lihat LICENSE.
