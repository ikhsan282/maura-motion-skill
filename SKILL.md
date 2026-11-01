---
name: maura-motion-skill
description: Maura Motion — library 65 gaya animasi untuk video narasi vertikal (TikTok, Reels, Shorts) yang digambar full pakai kode. Pilih gaya (anime, wayang kulit, flat vector, kinetic typography, blueprint, synthwave, dll), kasih topik/naskah, jadi MP4 + narasi Indonesia/Inggris + caption + musik. Dipakai untuk "bikin video animasi", "pakai gaya X", "maura motion", "video explainer", "faceless video".
---

# Maura Motion Skill

65 gaya animasi dalam satu tempat, tiap gaya punya drawing kit + demo yang sudah jadi. Sumber: 25 gaya Drive (Anime … Terminal ASCII), paint looks Shorts Animator (oil, watercolour, gouache, pastel, ink — di `engine/sa/`), dan gaya visual dari 703 prompt *awesome-opus5-5-videos*.

```
topik / naskah + gaya ─► story.json (naskah hook-first, suara, musik) + scene.js (adegan pakai styles/<id>/kit.js)
                     ─► narasi (Kokoro/Piper, offline) ─► stills buat cek ─► render (headless Chrome) ─► musik + SFX ─► mix −14 LUFS ─► MP4
```

`SK` = folder skill ini. Butuh Node 22+, ffmpeg, Chrome, Python 3.10+.
Pertama kali: `node $SK/scripts/setup.mjs` (install voice model + cek semua).

## 1. Pilih gaya

- User nyebut nama ("gaya wayang", "style 22", "kayak lukisan minyak") → cocokkan di `STYLES.md`. Kalau deskripsi verbal, pilih yang paling dekat dan sebutkan.
- User cuma kasih topik → pilih yang **best_for**-nya pas (dongeng → wayang/kertas guntingan/pop-up; sains → flat vector/blueprint/cutaway; uang/psikologi → stickman/neo-brutalist/pop art; sejarah → noir/perkamen/lukisan minyak; teknologi → terminal/dark glow UI/product film; anak → clay/boneka rajut/pastel).
- Baca `styles/<id>/STYLE.md` (ciri visual, gerakan, rumus hook, API kit) dan intip demonya di `styles/<id>/demo/`.
- Default durasi: max 20 detik. Untuk video panjang (40–60 dtk): set `AM_MAX_DURATION=70` saat render.

## 2. Tulis naskah (story.json)

Ikuti `AUTHORING.md §2`: Bahasa Indonesia default (English kalau diminta → voice `en-*`), 4–6 baris untuk 20 detik, 8–12 baris untuk 40–60 detik. **Baris 1 adalah hook**, ada twist di dua pertiga, kalimat terakhir yang nancep. Sesuaikan kekuatan gaya (wayang → Mahabharata/Ramayana/Panji; blueprint → cara dibangun; kinetic type → manifesto punchy). Verifikasi fakta via web search; jangan bikin kutipan palsu. Kalau user kasih naskah jadi, pakai kata per kata.

## 3. Bangun scene

```bash
P=./<slug>-short && mkdir -p "$P" && cp $SK/styles/<id>/demo/scene.js "$P/" && $EDITOR "$P/story.json"
```

Tulis ulang scene.js untuk cerita baru pakai kit gaya tersebut (`import * as K from '/styles/<id>/kit.js'`): satu shot per baris (atau lebih), timed ke cue (`AM.cue(id)`, `AM.wordTime(id,'kata')`). Scene demo adalah pola yang ditiru; `AUTHORING.md §3` adalah API. Kalau kit kurang (perahu, candi), gambar sendiri dengan bahasa visual yang sama di scene.js — atau tambahkan ke kit kalau reusable.

## 4. Cek, render, antar

```bash
python3 $SK/audio/tts.py "$P"                               # narasi + cue timing
node $SK/engine/render.mjs "$P" --stills 0.5,4,9,15,22,30   # lihat build/stills/sheet.png, perbaiki, ulangi
node $SK/scripts/make.mjs "$P"                              # → $P/out/<slug>.mp4 (+ build/qa_sheet.jpg)
```

Untuk video panjang: `AM_MAX_DURATION=70 node $SK/scripts/make.mjs "$P"`.
Buka QA sheet, lalu lapor dua baris: gaya, durasi, isinya apa. "Mau diubah apa? Satu kalimat cukup."

## 5. Perubahan satu kalimat

| user bilang | lakukan |
|---|---|
| "suara cewek" / "suara lebih berat" / "English" | `voice`: `id-f`, `id-m2`, `en-m`/`en-f`/`en-story` (+ `lang: "en"`, tulis ulang lines) |
| "lebih cepat/lambat" | `speed` 1.15 / 0.95 (top level), atau pendekkan lines |
| "musiknya ganti" / "tanpa musik" | `music.preset` (19 preset, `python3 audio/music.py x --list`) / `"none"`; `music.db` untuk level |
| "caption lebih besar" / "tanpa caption" | `meta.captions.size` / `"captions": false` |
| "buat versi YouTube" | `"format": "16:9"` dan re-layout shots |
| "ganti adegan 4" | edit fungsi shot itu; re-run stills di waktu itu |
| "gaya lain" | story.json tetap, tulis scene.js dengan kit gaya lain |

## File

- `STYLES.md` — 65 gaya sekilas; `catalog.json` — sama, machine-readable.
- `styles/<id>/` — STYLE.md, kit.js, demo/ (story.json, scene.js, out/<slug>.mp4).
- `engine/` — runtime (AM API), renderer, caption, font, three.js, `sa/` (Shorts Animator paint pass + kit + looks).
- `audio/` — tts.py (voices), music.py (19 preset), sfx.py (45 efek), mix.py (ducking, −14 LUFS).
- `AUTHORING.md` — cara nulis story, scene, atau gaya baru; standar kualitas.

## Status gaya (audit 1 Nov 2026)

- ✅ Lengkap siap pakai (26): anime, batik-hidup, blueprint, boneka-rajut, buku-pop-up, dark-glow-ui, flat-vector, garis-tunggal, isometrik, kartun-3d-sinematik, kartun-outline-tebal, kinetic-type, manga-action, noir-dokumenter, origami, pixel-retro, pop-art, riso-halftone, stickman-doodle, synthwave, terminal-ascii, vhs-arsip, wayang-kulit, cat-air, clay-stop-motion, sketsa-pensil.
- ⚠️ Demo ada, belum ada still (14): dunia-blok, flipbook, infografis-data, kartun-jadul, kertas-guntingan, kotak-cahaya-kertas, lukisan-minyak, lukis-pedesaan, math-3b1b, neo-brutalist, papan-tulis-kapur, product-light, ui-morph, wayang-beber.
- 🔧 Kit/sebagian (14): diorama-miniatur, kardus-bekas, gacha-3d, gouache-dongeng, kolase-daun-bunga, partikel, perkamen-ukiran, psychedelic-shader, scrapbook, skala-kosmik, sumi-e, swiss-bauhaus + 2 lainnya.
- ❌ Kosong (11): chrome-y2k, cutaway-3d, dunia-3d-painterly, editorial-serif, hud-showreel, kaca-patri, lukisan-gua-purba, pastel-krayon, tinta-novel-grafis, trailer-gelap, vas-yunani.

## Troubleshooting

| gejala | solusi |
|---|---|
| `Playwright not found` / no Chrome | `node $SK/scripts/setup.mjs`; atau set `CHROME_PATH` |
| narasi gagal | `node $SK/scripts/setup.mjs` (venv + model di ~/.cache/animasters); `AM_PYTHON` untuk Python lain |
| kata salah diucap | tambah `"say"` dengan ejaan fonetik di line itu |
| render lambat | painterly/3D tanpa GPU: turunkan `scale` di `AM.painter`, `hold: 3`; gaya 2D ~10 fps |
| "cue not found" | scene pakai line id yang tidak ada di story.json |
| "TOO LONG" | narasi > 20 dtk: pendekkan lines, naikkan `speed`, atau `AM_MAX_DURATION=70` untuk video panjang |
