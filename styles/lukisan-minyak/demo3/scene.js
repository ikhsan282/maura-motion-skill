// Jalan Raya Pos Anyer–Panarukan 1808 — 8-scene historical oil painting (lukisan-minyak)
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
  if (C.cadas) AM.sfx('thunder', C.cadas.start + 0.1, { gain: 0.45 });
  if (C.sumedang) AM.sfx('impact', C.sumedang.start + 0.2, { gain: 0.4, pitch: 0.75 });
}

const W = 1080;

function postRoadCanvas(g, t, { storm = 0.7, workers = 1, kornel = 0, carriageRun = 0 } = {}) {
  K.stormSky(g, t, {
    x0: 0, x1: 1600, y0: 0, y1: 760, horizon: 0.72,
    top: storm > 0.5 ? '#101522' : '#1e304c',
    mid: storm > 0.5 ? '#2c3d58' : '#4a6b8c',
    glow: '#e88a3e', cloud: '#1e2234', cloudLit: '#de9858',
    seed: 21, clouds: 9, light: -1, size: 0.95
  });
  K.mountains(g, { y: 650, peaks: [[320, 420, 280], [920, 480, 320], [1380, 430, 260]], color: '#2f3554', light: -1, haze: '#d99258' });
  K.hills(g, { x0: 0, x1: 1600, y: 700, amp: 48, color: '#222c1d', seed: 14 });
  K.treeClump(g, 160, 710, 1.0, { color: '#1a2416', lit: '#3f522e' });
  K.treeClump(g, 1440, 700, 0.95, { color: '#1a2416', lit: '#3f522e' });

  g.fillStyle = '#483826';
  g.fillRect(0, 680, 1600, 320);
  K.poly(g, [[580, 680], [980, 680], [1540, 1000], [60, 1000]], '#9c8666');
  K.radial(g, 800, 780, 560, '#ffd498', 0.28);

  if (carriageRun) {
    const cx = 360 + Math.sin(t * 1.2) * 80;
    K.carriage(g, cx, 820, { s: 0.82, face: 1, color: '#2e1c12' });
    K.horse(g, cx + 220, 830, { s: 0.68, face: 1, phase: t * 1.4, color: '#3b2416' });
    K.horse(g, cx + 310, 835, { s: 0.66, face: 1, phase: t * 1.4 + 0.3, color: '#523420' });
  }

  if (workers) {
    K.figure(g, { x: 360, y: 880, h: 340, face: 1, costume: 'abdi', light: -1, t, pose: { kneel: 0.7, bow: 0.4, armF: [1.2, 0.5] } });
    K.figure(g, { x: 560, y: 870, h: 360, face: 1, costume: 'abdi', light: -1, t: t + 1, mood: -0.8, pose: { bow: 0.3, armF: [1.4, 0.3] } });
    K.figure(g, { x: 1180, y: 860, h: 375, face: -1, costume: 'soldier', light: -1, t: t + 2, headScale: 1.12, pose: { armF: [1.4, 0.1] } });
  }

  if (kornel) {
    K.radial(g, 780, 620, 320, '#ffea9f', 0.28);
    K.figure(g, { x: 660, y: 860, h: 410, face: 1, costume: 'dipo', light: -1, t, mood: 0.7, pose: { head: -0.14, armF: [1.35, 0.1], armB: [0.4, 0.5], fist: 1 } });
    K.figure(g, { x: 960, y: 860, h: 405, face: -1, costume: 'dekock', light: -1, t: t + 1, headScale: 1.16, pose: { armF: [1.45, 0.05] } });
  }
}

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
    K.museumWall(g, { spot: [540, 920, 950], a: 0.55 });
    K.goldFrame(g, 70, 540, 940, 600, { b: 50 });
    K.hang(g, 70, 540, 940, 600, (pg) => postRoadCanvas(pg, t, { storm: 0.8, workers: 1, carriageRun: 1 }));
  } else if (id === 'daendels') {
    const g = K.view(P, { x: 540 + lerp(-20, 20, u), y: 960 + sy, z: lerp(1.04, 1.12, ease.inOutSine(u)) });
    K.museumWall(g, { spot: [540, 920, 950], a: 0.52 });
    K.goldFrame(g, 70, 540, 940, 600, { b: 50 });
    K.hang(g, 70, 540, 940, 600, (pg) => K.pienemanPainting(pg, t, { bowHead: 0.35 }));
  } else if (id === 'cadas') {
    const g = K.view(P, { x: 540 + sx, y: 960 + lerp(10, -20, u), z: lerp(1.05, 1.15, ease.inOutSine(u)) });
    K.museumWall(g, { spot: [540, 920, 960], a: 0.56 });
    K.goldFrame(g, 65, 540, 950, 600, { b: 50 });
    K.hang(g, 65, 540, 950, 600, (pg) => postRoadCanvas(pg, t, { storm: 0.9, workers: 1, kornel: 0 }));
  } else if (id === 'sumedang') {
    const g = K.view(P, { x: 540 + lerp(-15, 15, u), y: 960 + sy, z: lerp(1.06, 1.16, ease.inOutSine(u)) });
    K.museumWall(g, { spot: [540, 920, 960], a: 0.58 });
    K.goldFrame(g, 65, 540, 950, 600, { b: 50 });
    K.hang(g, 65, 540, 950, 600, (pg) => postRoadCanvas(pg, t, { storm: 0.85, workers: 1, kornel: 1 }));
  } else if (id === 'lukisan') {
    const g = K.view(P, { x: 540 + sx, y: 960 + sy, z: lerp(1.02, 1.08, ease.inOutSine(u)) });
    K.studio(g, t, { warm: 1, window: [730, 360, 270, 630] });
    const [cx, cy, cw, ch] = K.easel(g, 430, 1630, { w: 600, h: 390 });
    K.paintIn(P, g, clamp(u * 1.2), (pg) => {
      K.hang(pg, cx, cy, cw, ch, (cg) => postRoadCanvas(cg, t, { storm: 0.75, workers: 0, carriageRun: 1 }));
    }, { rect: [cx, cy, cw, ch], seed: 17 });
    K.figure(g, { x: 790, y: 1760, h: 660, face: -1, costume: 'saleh', light: -1, t, pose: { armF: [1.35 + Math.sin(t * 4) * 0.14, 0.2], brush: 1 } });
  } else if (id === 'pos') {
    const g = K.view(P, { x: 540 + lerp(-35, 35, u), y: 960 + sy, z: lerp(1.04, 1.12, ease.inOutSine(u)) });
    K.museumWall(g, { spot: [540, 920, 960], a: 0.56 });
    K.goldFrame(g, 65, 540, 950, 600, { b: 50 });
    K.hang(g, 65, 540, 950, 600, (pg) => postRoadCanvas(pg, t, { storm: 0.4, workers: 1, carriageRun: 1 }));
  } else if (id === 'memori') {
    const g = K.view(P, { x: 540 + sx, y: 960 + sy, z: lerp(1.08, 1.0, ease.inOutSine(u)) });
    K.drapes(g, t, { col: '#560d15', folds: 9 });
    K.museumWall(g, { y0: 420, spot: [540, 920, 960], a: 0.58 });
    K.goldFrame(g, 75, 540, 930, 590, { b: 50 });
    K.hang(g, 75, 540, 930, 590, (pg) => postRoadCanvas(pg, t, { storm: 0.85, workers: 1, kornel: 1, carriageRun: 1 }));
  } else {
    const g = K.view(P, { x: 540 + sx, y: 960 + sy, z: lerp(1.04, 1.0, ease.inOutSine(u)) });
    K.drapes(g, t, { col: '#5a0e16', folds: 9 });
    K.museumWall(g, { y0: 420, spot: [540, 920, 960], a: 0.6 });
    K.goldFrame(g, 75, 540, 930, 580, { b: 50 });
    K.hang(g, 75, 540, 930, 580, (pg) => postRoadCanvas(pg, t, { storm: 0.6, workers: 0, kornel: 1, carriageRun: 1 }));
    K.figure(g, { x: 540, y: 1850, h: 660, face: 1, costume: 'saleh', light: -1, t, pose: { armF: [1.2, 0.2], brush: 1 } });
  }

  P.paint(Math.floor(t * 24 / 3));

  const titles = {
    hook: ['JALAN RAYA POS 1808', 'ANYER – PANARUKAN · 1.000 KILOMETER'],
    daendels: ['MANDAT TANGAN BESI', 'GUBERNUR JENDERAL H.W. DAENDELS'],
    cadas: ['TEBING CADAS PANGERAN', 'MEMBELAH GUNUNG BATU DENGAN TANGAN KOSONG'],
    sumedang: ['PERLAWANAN PANGERAN KORNEL', 'TANGAN KIRI MENGGENGGAM HULU KERIS'],
    lukisan: ['LANSKAP MEGAMENDUNG', 'DIABADIKAN DALAM KANVAS RADEN SALEH'],
    pos: ['ENAM HARI MELINTASI JAWA', 'DIBAYAR KERINGAT & RIBUAN NYAWA'],
    memori: ['CHIAROSCURO SEJARAH', 'CAHAYA & BAYANGAN DI ATAS KANVAS MINYAK'],
    outro: ['MONUMEN KETANGGUHAN', 'URAT NADI ABADI PULAU JAWA'],
  };
  const [mainT, subT] = titles[id] || titles.hook;
  K.title(ui, mainT, W / 2, 265, { size: 66 });
  K.plaque(ui, mainT, W / 2, 1275, { size: 30, sub: subT, subSize: 20 });
}
