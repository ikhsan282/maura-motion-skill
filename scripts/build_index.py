#!/usr/bin/env python3
"""Regenerate STYLES.md (the at-a-glance index of every style) from catalog.json + styles/<id>/STYLE.md."""
import glob, json, os, re, subprocess

SK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cat = json.load(open(os.path.join(SK, 'catalog.json'), encoding='utf-8'))

# Read existing durations from STYLES.md so gitignored out/*.mp4 don't erase known durations
existing_dur = {}
styles_md_path = os.path.join(SK, 'STYLES.md')
if os.path.exists(styles_md_path):
    for line in open(styles_md_path, encoding='utf-8'):
        m = re.search(r'\|\s*`([^`]+)`\s*\|.*\|\s*[^|]*\((\d+)\s*dtk\)\s*\|', line)
        if m:
            existing_dur[m.group(1)] = int(m.group(2))

def front(id_):
    p = os.path.join(SK, 'styles', id_, 'STYLE.md')
    if not os.path.exists(p): return {}
    s = open(p, encoding='utf-8').read()
    m = re.match(r'---\r?\n(.*?)\r?\n---', s, re.S)
    out = {}
    if m:
        for line in m.group(1).splitlines():
            if ':' in line:
                k, v = line.split(':', 1); out[k.strip()] = v.strip()
    return out

def demo_dir(id_):
    d = os.path.join(SK, 'styles', id_, 'demo')
    if os.path.exists(os.path.join(d, 'scene.js')):
        return d
    d1 = os.path.join(SK, 'styles', id_, 'demo1')
    if os.path.exists(os.path.join(d1, 'scene.js')):
        return d1
    return d

def dur(id_, no):
    dd = demo_dir(id_)
    out_dir = os.path.join(dd, 'out')
    cand = os.path.join(out_dir, f'{no:02d}_{id_}.mp4')
    if not os.path.exists(cand) and os.path.isdir(out_dir):
        mp4s = sorted(glob.glob(os.path.join(out_dir, '*.mp4')))
        if mp4s: cand = mp4s[0]
    if os.path.exists(cand):
        try:
            r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', cand], capture_output=True, text=True)
            return float(r.stdout)
        except Exception:
            pass
    tl = os.path.join(dd, 'build', 'timeline.json')
    if os.path.exists(tl):
        try: return float(json.load(open(tl, encoding='utf-8')).get('duration'))
        except Exception: pass
    return existing_dur.get(id_)

FAM = {'2D': '2D', '3D': '3D', 'craft': 'Kriya', 'painterly': 'Lukis', 'retro-digital': 'Retro digital', 'typography': 'Tipografi', 'data': 'Data/explainer', 'shader': 'Shader', 'social': 'Sosial/Cerita', 'stickman': 'Stickman'}
lines = ['# Maura Motion: daftar gaya', '',
         f'{len(cat)} gaya. Sebut gaya dengan nama atau nomornya ("gaya 11", "wayang kulit"). Setiap gaya punya `styles/<id>/STYLE.md` (ciri khas, gerak, rumus hook, API kit) dan contoh video di `styles/<id>/demo/out/`.', '',
         'Sumber: **D** = 25 gaya di Drive, **SA** = Shorts Animator (oil/watercolour/gouache/pastel/ink), **GH** = gaya visual dari 703 prompt *awesome-opus5-5-videos*, **C** = Custom Maura Motion kit.', '',
         '| No | Gaya | id | Sumber | Jenis | Paling cocok untuk | Contoh demo | Musik · Suara |', '|---|---|---|---|---|---|---|---|']
for c in cat:
    f = front(c['id'])
    src = ' + '.join(sorted({'D' if 'drive:' in c['source'] else '', 'SA' if 'shorts-animator' in c['source'] else '', 'GH' if 'github:' in c['source'] else '', 'C' if 'custom:' in c['source'] else ''} - {''}))
    best = f.get('best_for') or (c['concept'].split('.')[0][:90] if c.get('concept') else c['name'])
    d = dur(c['id'], c['no'])
    has_demo = os.path.exists(os.path.join(demo_dir(c['id']), 'scene.js'))
    status = f" ({d:.0f} dtk)" if d else (' (siap render)' if has_demo else ' (belum dirender)')
    demo = f"{c['story']}{status}"
    lines.append(f"| {c['no']} | **{c['name']}** | `{c['id']}` | {src} | {FAM.get(c['family'], c['family'])} | {best} | {demo} | {c['music']} · {c['voice']} |")
lines += ['', '## Memilih gaya cepat', '',
          '- **Legenda & budaya Nusantara:** wayang-kulit, wayang-golek, wayang-beber, batik-hidup, kertas-guntingan, buku-pop-up, kotak-cahaya-kertas, lukis-pedesaan, cat-air',
          '- **Dongeng anak:** boneka-rajut, clay-stop-motion, gouache-dongeng, pastel-krayon, kartun-jadul, origami, stickman-picturebook',
          '- **Sejarah & dokumenter:** noir-dokumenter, perkamen-ukiran, lukisan-minyak, trailer-gelap, vhs-arsip, scrapbook, sumi-e, lukisan-gua-purba, vas-yunani',
          '- **Sains & cara kerja:** flat-vector, blueprint, cutaway-3d, math-3b1b, skala-kosmik, partikel, papan-tulis-kapur, sketsa-pensil',
          '- **Teknologi & produk:** product-light, dark-glow-ui, ui-morph, terminal-ascii, isometrik, chrome-y2k',
          '- **Uang, psikologi, kebiasaan & cerita sosial:** stickman-doodle, stickman-subuh, stickman-pelukis, stickman-kisah, stickman-beanie, stickman-duo, stickman-lecture, stickman-minimal-dark, neo-brutalist, pop-art, kinetic-type, garis-tunggal, infografis-data',
          '- **Hype & aksi:** manga-action, gacha-3d, kartun-outline-tebal, synthwave, pixel-retro, hud-showreel, stickman-graffiti',
          '- **Emosional & sinematik:** anime, kartun-3d-sinematik, dunia-3d-painterly, diorama-miniatur, tinta-novel-grafis, editorial-serif, stickman-cinematic']
open(os.path.join(SK, 'STYLES.md'), 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
print('STYLES.md:', len(cat), 'styles')
