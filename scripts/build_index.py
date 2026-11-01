#!/usr/bin/env python3
"""Regenerate STYLES.md (the at-a-glance index of every style) from catalog.json + styles/<id>/STYLE.md."""
import json, os, re, subprocess

SK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cat = json.load(open(os.path.join(SK, 'catalog.json'), encoding='utf-8'))

def front(id_):
    p = os.path.join(SK, 'styles', id_, 'STYLE.md')
    if not os.path.exists(p): return {}
    s = open(p, encoding='utf-8').read()
    m = re.match(r'---\n(.*?)\n---', s, re.S)
    out = {}
    if m:
        for line in m.group(1).splitlines():
            if ':' in line:
                k, v = line.split(':', 1); out[k.strip()] = v.strip()
    return out

def dur(id_, no):
    p = os.path.join(SK, 'styles', id_, 'demo', 'out', f'{no:02d}_{id_}.mp4')
    if not os.path.exists(p): return None
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True)
    try: return float(r.stdout)
    except ValueError: return None

FAM = {'2D': '2D', '3D': '3D', 'craft': 'Kriya', 'painterly': 'Lukis', 'retro-digital': 'Retro digital', 'typography': 'Tipografi', 'data': 'Data/explainer', 'shader': 'Shader'}
lines = ['# AniMasters: daftar gaya', '',
         f'{len(cat)} gaya. Sebut gaya dengan nama atau nomornya ("gaya 11", "wayang kulit"). Setiap gaya punya `styles/<id>/STYLE.md` (ciri khas, gerak, rumus hook, API kit) dan contoh video di `styles/<id>/demo/out/`.', '',
         'Sumber: **D** = 25 gaya di Drive, **SA** = Shorts Animator (oil/watercolour/gouache/pastel/ink), **GH** = gaya visual dari 703 prompt *awesome-opus5-5-videos*.', '',
         '| No | Gaya | id | Sumber | Jenis | Paling cocok untuk | Contoh demo | Musik · Suara |', '|---|---|---|---|---|---|---|---|']
for c in cat:
    f = front(c['id'])
    src = ' + '.join(sorted({'D' if 'drive:' in c['source'] else '', 'SA' if 'shorts-animator' in c['source'] else '', 'GH' if 'github:' in c['source'] else ''} - {''}))
    best = f.get('best_for') or c['concept'].split('.')[0][:90]
    d = dur(c['id'], c['no'])
    demo = f"{c['story']}" + (f" ({d:.0f} dtk)" if d else ' (belum dirender)')
    lines.append(f"| {c['no']} | **{c['name']}** | `{c['id']}` | {src} | {FAM.get(c['family'], c['family'])} | {best} | {demo} | {c['music']} · {c['voice']} |")
lines += ['', '## Memilih gaya cepat', '',
          '- **Legenda & budaya Nusantara:** wayang-kulit, wayang-golek, wayang-beber, batik-hidup, kertas-guntingan, buku-pop-up, kotak-cahaya-kertas, lukis-pedesaan, cat-air',
          '- **Dongeng anak:** boneka-rajut, clay-stop-motion, gouache-dongeng, pastel-krayon, kartun-jadul, origami',
          '- **Sejarah & dokumenter:** noir-dokumenter, perkamen-ukiran, lukisan-minyak, trailer-gelap, vhs-arsip, scrapbook, sumi-e, lukisan-gua-purba, vas-yunani',
          '- **Sains & cara kerja:** flat-vector, blueprint, cutaway-3d, math-3b1b, skala-kosmik, partikel, papan-tulis-kapur, sketsa-pensil',
          '- **Teknologi & produk:** product-light, dark-glow-ui, ui-morph, terminal-ascii, isometrik, chrome-y2k',
          '- **Uang, psikologi, tips:** stickman-doodle, neo-brutalist, pop-art, kinetic-type, garis-tunggal, infografis-data',
          '- **Hype & aksi:** manga-action, gacha-3d, kartun-outline-tebal, synthwave, pixel-retro, hud-showreel',
          '- **Emosional & sinematik:** anime, kartun-3d-sinematik, dunia-3d-painterly, diorama-miniatur, tinta-novel-grafis, editorial-serif']
open(os.path.join(SK, 'STYLES.md'), 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
print('STYLES.md:', len(cat), 'styles')
