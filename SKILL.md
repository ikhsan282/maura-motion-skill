---
name: maura-motion-skill
description: Maura Motion — library 77 gaya animasi untuk video narasi vertikal (TikTok, Reels, Shorts) yang digambar full pakai kode. Pilih gaya (anime, wayang kulit, flat vector, kinetic typography, blueprint, synthwave, dll), kasih topik/naskah, jadi MP4 + narasi Indonesia/Inggris + caption + musik. Dipakai untuk "bikin video animasi", "pakai gaya X", "maura motion", "video explainer", "faceless video".
---

# Maura Motion Skill

77 gaya animasi dalam satu tempat, tiap gaya punya drawing kit + demo yang sudah jadi. Sumber: 25 gaya Drive (Anime … Terminal ASCII), paint looks Shorts Animator (oil, watercolour, gouache, pastel, ink — di `engine/sa/`), dan gaya visual dari 703 prompt *awesome-opus5-5-videos*.

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
- Default durasi: max 20 detik. Untuk video panjang (40–60 dtk): set `AM_MAX_DURATION=70` saat render (atau `"maxDuration": 70` di `story.json`).

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
| "suara cewek" / "suara lebih berat" / "English" | `voice`: `el-id-f` (Alice), `el-id-m` (George, default), offline `id-f`/`id-m`, English `en-m`/`en-f`/`en-story` (+ `lang: "en"`, tulis ulang lines) |
| "lebih cepat/lambat" | `speed` 1.15 / 0.95 (top level), atau pendekkan lines |
| "musiknya ganti" / "tanpa musik" | `music.preset` (19 preset, `python3 audio/music.py x --list`) / `"none"`; `music.db` untuk level |
| "caption lebih besar" / "tanpa caption" | `meta.captions.size` / `"captions": false` |
| "buat versi YouTube" | `"format": "16:9"` dan re-layout shots |
| "ganti adegan 4" | edit fungsi shot itu; re-run stills di waktu itu |
| "gaya lain" | story.json tetap, tulis scene.js dengan kit gaya lain |

## File

- `STYLES.md` — 77 gaya sekilas; `catalog.json` — sama, machine-readable.
- `styles/<id>/` — STYLE.md, kit.js, demo/ (story.json, scene.js, out/<slug>.mp4).
- `engine/` — runtime (AM API), renderer, caption, font, three.js, `sa/` (Shorts Animator paint pass + kit + looks).
- `audio/` — tts.py (voices: ElevenLabs cloud + Kokoro/Piper offline), music.py (19 preset), sfx.py (45 efek), mix.py (ducking, −14 LUFS).
- **Suara**: default `el-id-m` (George, ElevenLabs) untuk `lang: id` (otomatis fallback ke `id-m` offline jika `ELEVENLABS_API_KEY` tidak ditemukan). Offline gratis `id-f`/`id-m` buat produksi massal.
- `AUTHORING.md` — cara nulis story, scene, atau gaya baru; standar kualitas.

## Status gaya (77 gaya: 74 siap pakai ✅, 3 belum diimplementasi ❌)

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
| 29 | **Tinta Novel Grafis** | tinta-novel-grafis | ✅ ([demo1](styles/tinta-novel-grafis/demo1/) · [demo2](styles/tinta-novel-grafis/demo2/) · [demo3](styles/tinta-novel-grafis/demo3/)) |
| 30 | **Product Film Light** | product-light | ✅ ([demo1](styles/product-light/demo1/) · [demo2](styles/product-light/demo2/) · [demo3](styles/product-light/demo3/)) |
| 31 | **Dark Glow Product UI** | dark-glow-ui | ✅ ([demo1](styles/dark-glow-ui/demo1/) · [demo2](styles/dark-glow-ui/demo2/) · [demo3](styles/dark-glow-ui/demo3/)) |
| 32 | **One-Shape UI Morph** | ui-morph | ✅ ([demo1](styles/ui-morph/demo1/) · [demo2](styles/ui-morph/demo2/) · [demo3](styles/ui-morph/demo3/)) |
| 33 | **Kinetic Typography** | kinetic-type | ✅ ([demo1](styles/kinetic-type/demo1/) · [demo2](styles/kinetic-type/demo2/) · [demo3](styles/kinetic-type/demo3/)) |
| 34 | **Swiss / Bauhaus Grid** | swiss-bauhaus | ✅ ([demo1](styles/swiss-bauhaus/demo1/) · [demo2](styles/swiss-bauhaus/demo2/) · [demo3](styles/swiss-bauhaus/demo3/)) |
| 35 | **Editorial Serif** | editorial-serif | ✅ ([demo1](styles/editorial-serif/demo1/) · [demo2](styles/editorial-serif/demo2/) · [demo3](styles/editorial-serif/demo3/)) |
| 36 | **Chrome Y2K** | chrome-y2k | ✅ ([demo1](styles/chrome-y2k/demo1/) · [demo2](styles/chrome-y2k/demo2/) · [demo3](styles/chrome-y2k/demo3/)) |
| 37 | **Noir Dokumenter** | noir-dokumenter | ✅ ([demo1](styles/noir-dokumenter/demo1/) · [demo2](styles/noir-dokumenter/demo2/) · [demo3](styles/noir-dokumenter/demo3/)) |
| 38 | **VHS & Arsip CRT** | vhs-arsip | ✅ ([demo1](styles/vhs-arsip/demo1/) · [demo2](styles/vhs-arsip/demo2/) · [demo3](styles/vhs-arsip/demo3/)) |
| 39 | **Flat Vector Explainer** | flat-vector | ✅ ([demo1](styles/flat-vector/demo1/) · [demo2](styles/flat-vector/demo2/) · [demo3](styles/flat-vector/demo3/)) |
| 40 | **Kartun Outline Tebal** | kartun-outline-tebal | ✅ ([demo1](styles/kartun-outline-tebal/demo1/) · [demo2](styles/kartun-outline-tebal/demo2/) · [demo3](styles/kartun-outline-tebal/demo3/)) |
| 41 | **Neo-Brutalist Bento** | neo-brutalist | ✅ ([demo1](styles/neo-brutalist/demo1/) · [demo2](styles/neo-brutalist/demo2/) · [demo3](styles/neo-brutalist/demo3/)) |
| 42 | **Vas Yunani Black-Figure** | vas-yunani | ✅ ([demo1](styles/vas-yunani/demo1/) · [demo2](styles/vas-yunani/demo2/) · [demo3](styles/vas-yunani/demo3/)) |
| 43 | **Scrapbook Collage** | scrapbook | ✅ ([demo1](styles/scrapbook/demo1/) · [demo2](styles/scrapbook/demo2/) · [demo3](styles/scrapbook/demo3/)) |
| 44 | **Risograph Halftone** | riso-halftone | ✅ ([demo1](styles/riso-halftone/demo1/) · [demo2](styles/riso-halftone/demo2/) · [demo3](styles/riso-halftone/demo3/)) |
| 45 | **Manga Action** | manga-action | ✅ ([demo1](styles/manga-action/demo1/) · [demo2](styles/manga-action/demo2/) · [demo3](styles/manga-action/demo3/)) |
| 46 | **Sumi-e Tinta Timur** | sumi-e | ✅ ([demo1](styles/sumi-e/demo1/) · [demo2](styles/sumi-e/demo2/) · [demo3](styles/sumi-e/demo3/)) |
| 47 | **Synthwave Neon** | synthwave | ✅ ([demo1](styles/synthwave/demo1/) · [demo2](styles/synthwave/demo2/) · [demo3](styles/synthwave/demo3/)) |
| 48 | **Psychedelic Shader** | psychedelic-shader | ✅ ([demo1](styles/psychedelic-shader/demo1/) · [demo2](styles/psychedelic-shader/demo2/) · [demo3](styles/psychedelic-shader/demo3/)) |
| 49 | **Math Explainer Gelap** | math-3b1b | ✅ ([demo1](styles/math-3b1b/demo1/) · [demo2](styles/math-3b1b/demo2/) · [demo3](styles/math-3b1b/demo3/)) |
| 50 | **Infografis Data** | infografis-data | ✅ ([demo1](styles/infografis-data/demo1/) · [demo2](styles/infografis-data/demo2/) · [demo3](styles/infografis-data/demo3/)) |
| 51 | **3D Cutaway Explainer** | cutaway-3d | ✅ ([demo1](styles/cutaway-3d/demo1/) · [demo2](styles/cutaway-3d/demo2/) · [demo3](styles/cutaway-3d/demo3/)) |
| 52 | **Blueprint** | blueprint | ✅ ([demo1](styles/blueprint/demo1/) · [demo2](styles/blueprint/demo2/) · [demo3](styles/blueprint/demo3/)) |
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

## Troubleshooting

| gejala | solusi |
|---|---|
| `Playwright not found` / no Chrome | `node $SK/scripts/setup.mjs`; atau set `CHROME_PATH` |
| narasi gagal | `node $SK/scripts/setup.mjs` (venv + model di ~/.cache/maura-motion); `AM_PYTHON` untuk Python lain |
| kata salah diucap | tambah `"say"` dengan ejaan fonetik di line itu |
| render lambat | painterly/3D tanpa GPU: turunkan `scale` di `AM.painter`, `hold: 3`; gaya 2D ~10 fps |
| "cue not found" | scene pakai line id yang tidak ada di story.json |
| "TOO LONG" | narasi > 20 dtk: pendekkan lines, naikkan `speed`, atau `AM_MAX_DURATION=70` untuk video panjang |
