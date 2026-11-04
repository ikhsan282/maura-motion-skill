// Perjalanan Raden Saleh — 8-scene Romantic oil-painting biography (lukisan-minyak)
import * as K from '/styles/lukisan-minyak/kit.js';
const { clamp, lerp, ease } = AM.lib;

export const meta = { fps: 24, hold: 3, captions: { preset: 'elegant', y: 1490, size: 62 } };

let P, ui;
const C = {};
export async function setup(AM) {
  P = await K.painter(AM, { scale: 0.55 });
  ui = AM.layer('ui');
  for (const l of AM.timeline.lines) C[l.id] = l;
  AM.sfx('riser', 0.0, { gain: 0.3 });
  AM.sfx('boom', 0.35, { gain: 0.35, pitch: 0.8 });
  if (C.berburu) AM.sfx('thunder', C.berburu.start + 0.1, { gain: 0.4 });
  if (C.magelang) AM.sfx('impact', C.magelang.start + 0.2, { gain: 0.4, pitch: 0.75 });
}

const W = 1080;

export function render(t, AM) {
  const lines = AM.timeline.lines;
  let active = lines[0];
  for (const ln of lines) {
    if (t >= ln.start && t <= ln.end + 0.35) { active = ln; break; }
    if (t > ln.end) active = ln;
  }
  const dur = Math.max(0.1, active.end - active.start);
  const u = clamp((t - active.start) / dur, 0, 1);
  const id = active.id;

  P.clear('#140c08');
  const sx = Math.sin(t * 0.45) * 6;
  const sy = Math.cos(t * 0.35) * 5;

  if (id === 'hook') {
    const g = K.view(P, { x: 540 + sx, y: 960 + sy, z: lerp(1.0, 1.08, ease.inOutSine(u)) });
    K.drapes(g, t, { col: '#5a0e16', folds: 9 });
    K.museumWall(g, { y0: 420, spot: [540, 920, 920], a: 0.55 });
    K.goldFrame(g, 80, 560, 920, 580, { b: 48 });
    K.hang(g, 80, 560, 920, 580, (pg) => K.salehPainting(pg, t, { headBig: 1.15 }));
    K.figure(g, { x: 540, y: 1840, h: 680, face: 1, costume: 'saleh', light: -1, t, pose: { armF: [1.1, 0.25], head: -0.08 } });
  } else if (id === 'bakat') {
    const g = K.view(P, { x: 540 + sx, y: 960 + sy, z: lerp(1.02, 1.08, ease.inOutSine(u)) });
    K.studio(g, t, { warm: 1, window: [720, 360, 290, 640] });
    const [cx, cy, cw, ch] = K.easel(g, 420, 1620, { w: 580, h: 380 });
    K.paintIn(P, g, clamp(u * 1.15), (pg) => {
      K.hang(pg, cx, cy, cw, ch, (cg) => {
        K.stormSky(cg, t, { x0: 0, x1: 1600, y0: 0, y1: 720, top: '#1e2c46', mid: '#4e6e8e', glow: '#f0a65a', seed: 4 });
        K.mountains(cg, { y: 650, peaks: [[450, 420, 260], [1150, 480, 280]], color: '#384664', haze: '#e8b070' });
        K.hills(cg, { x0: 0, x1: 1600, y: 700, amp: 45, color: '#2b3d24', seed: 3 });
        K.treeClump(cg, 320, 720, 1.1, { color: '#1c2a18', lit: '#486034' });
      });
    }, { rect: [cx, cy, cw, ch], seed: 9 });
    K.figure(g, { x: 780, y: 1750, h: 650, face: -1, costume: 'saleh', light: -1, t, pose: { armF: [1.35 + Math.sin(t * 4) * 0.14, 0.2], brush: 1 } });
  } else if (id === 'pelayaran') {
    const g = K.view(P, { x: 540 + lerp(-20, 20, u), y: 960 + sy, z: lerp(1.0, 1.07, u) });
    K.stormSky(g, t, { x0: -200, x1: 1280, y0: 0, y1: 1180, horizon: 0.74, top: '#101828', mid: '#263e5c', glow: '#e89044', cloud: '#1e2438', cloudLit: '#e2a062', seed: 12, clouds: 9 });
    g.fillStyle = '#142234'; g.fillRect(-200, 1140, 1480, 780);
    K.radial(g, 540, 1140, 560, '#ffb86c', 0.35);
    K.figure(g, { x: 540, y: 1780, h: 720, face: 1, costume: 'saleh', light: -1, t, pose: { head: -0.1, armF: [0.35, 0.2] } });
  } else if (id === 'dresden') {
    const g = K.view(P, { x: 540 + sx, y: 960 + sy, z: lerp(1.08, 1.0, ease.inOutSine(u)) });
    K.drapes(g, t, { col: '#5c121a', folds: 10 });
    K.studio(g, t, { warm: 1, window: [740, 360, 260, 620] });
    K.goldFrame(g, 110, 540, 520, 340, { b: 34 });
    K.hang(g, 110, 540, 520, 340, (pg) => K.salehPainting(pg, t, { headBig: 1.12 }));
    K.figure(g, { x: 480, y: 1780, h: 700, face: 1, costume: 'saleh', light: -1, t, pose: { armF: [1.2, 0.2], brush: 1 } });
    K.figure(g, { x: 840, y: 1790, h: 680, face: -1, costume: 'officer', light: -1, t: t + 1, pose: { armF: [0.3, 0.2] } });
  } else if (id === 'berburu') {
    const g = K.view(P, { x: 540 + lerp(-25, 25, u), y: 960 + sy, z: lerp(1.02, 1.12, ease.inOutSine(u)) });
    K.museumWall(g, { spot: [540, 960, 960], a: 0.55 });
    K.goldFrame(g, 70, 540, 940, 600, { b: 50 });
    K.hang(g, 70, 540, 940, 600, (pg) => {
      K.stormSky(pg, t, { x0: 0, x1: 1600, y0: 0, y1: 760, top: '#181010', mid: '#4a2418', glow: '#f08234', cloud: '#281814', cloudLit: '#e88842', seed: 19, clouds: 10 });
      K.hills(pg, { x0: 0, x1: 1600, y: 720, amp: 50, color: '#3a2616', seed: 6 });
      pg.fillStyle = '#4a301c'; pg.fillRect(0, 720, 1600, 280);
      K.radial(pg, 800, 720, 580, '#ffae58', 0.36);
      K.horse(pg, 520, 820, { s: 1.05, face: 1, phase: t * 0.8, headDown: -0.2, color: '#2a180e' });
      K.horse(pg, 1080, 840, { s: 0.98, face: -1, phase: t * 0.8 + 0.4, headDown: 0.1, color: '#5c381e' });
      K.figure(pg, { x: 540, y: 780, h: 360, face: 1, costume: 'jubah', light: -1, t, pose: { armF: [1.8, -0.2] } });
      K.figure(pg, { x: 1060, y: 790, h: 350, face: -1, costume: 'abdi', light: -1, t: t + 1, pose: { armF: [1.6, 0.1] } });
    });
  } else if (id === 'pulang') {
    const g = K.view(P, { x: 540 + sx, y: 960 + sy, z: lerp(1.0, 1.07, ease.inOutSine(u)) });
    K.stormSky(g, t, { x0: -200, x1: 1280, y0: 0, y1: 980, top: '#162238', mid: '#385478', glow: '#f2a454', seed: 15 });
    K.mountains(g, { y: 920, peaks: [[320, 380, 280], [820, 460, 320]], color: '#2e3856', haze: '#e89e5c' });
    K.hills(g, { x0: -200, x1: 1280, y: 960, amp: 45, color: '#24341e', seed: 8 });
    K.residence(g, 200, 950, { w: 680, h: 400, wall: '#dfd4be', roof: '#5a3222' });
    g.fillStyle = '#5c4a34'; g.fillRect(-200, 950, 1480, 970);
    K.figure(g, { x: 540, y: 1740, h: 680, face: 1, costume: 'saleh', light: -1, t, pose: { head: -0.06, armF: [0.5, 0.2] } });
  } else if (id === 'magelang') {
    const g = K.view(P, { x: 540 + lerp(-20, 20, u), y: 960 + sy, z: lerp(1.02, 1.1, ease.inOutSine(u)) });
    K.museumWall(g, { spot: [540, 920, 960], a: 0.58 });
    K.goldFrame(g, 60, 540, 960, 600, { b: 50 });
    K.hang(g, 60, 540, 960, 600, (pg) => K.salehPainting(pg, t, { headBig: 1.18, chin: -0.2, react: 0.85, highlightSelf: clamp((u - 0.35) * 2) }));
  } else {
    const g = K.view(P, { x: 540 + sx, y: 960 + sy, z: lerp(1.06, 1.0, ease.inOutSine(u)) });
    K.drapes(g, t, { col: '#5a0e16', folds: 9 });
    K.museumWall(g, { y0: 420, spot: [540, 920, 960], a: 0.6 });
    K.goldFrame(g, 80, 540, 920, 580, { b: 50 });
    K.hang(g, 80, 540, 920, 580, (pg) => K.salehPainting(pg, t, { headBig: 1.16, chin: -0.18, react: 0.7 }));
    K.figure(g, { x: 540, y: 1850, h: 660, face: 1, costume: 'saleh', light: -1, t, pose: { armF: [1.25, 0.2], brush: 1 } });
  }

  P.paint(Math.floor(t * 24 / 3));

  const titles = {
    hook: ['PELUKIS SANG RAJA', 'RADEN SALEH SJARIF BOESTAMAN (1811–1880)'],
    bakat: ['AWAL MULA DI JAWA', 'BELAJAR TEKNIK CAT MINYAK & PERSPEKTIF'],
    pelayaran: ['MENUJU EROPA 1829', 'MENEMBUS AKADEMI SENI BELANDA'],
    dresden: ['MAESTRO ROMANTISISME', 'DRESDEN · PARIS · ISTANA EROPA'],
    berburu: ['DRAMA HIDUP & MATI', 'LUKISAN PERBURUAN SINGA & BANTENG'],
    pulang: ['KEMBALI KE TANAH AIR', 'HINDIA BELANDA · 1852'],
    magelang: ['MAHAKARYA PERLAWANAN', 'PENANGKAPAN PANGERAN DIPONEGORO (1857)'],
    outro: ['BAPAK SENI LUKIS MODERN', 'WARISAN ABADI MAESTRO NUSANTARA'],
  };
  const [mainT, subT] = titles[id] || titles.hook;
  K.title(ui, mainT, W / 2, 265, { size: 68 });
  K.plaque(ui, mainT, W / 2, 1275, { size: 30, sub: subT, subSize: 20 });
}
