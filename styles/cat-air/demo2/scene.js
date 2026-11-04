// Demo 2 — Fajar di Kaldera Tengger (Bromo, Batok, Semeru & Lautan Pasir)
// Cat Air (Watercolor) — K.painter + K.view + sapuan basah cold-press

import * as K from '/styles/cat-air/kit.js';

const { clamp, lerp, ease } = AM.lib;

export const meta = {
  fps: 24,
  hold: 3,
  captions: {
    preset: 'elegant',
    y: 1470,
    size: 62,
    color: '#fffaf0',
    strokeColor: 'rgba(40,34,60,.85)',
    active: '#ffd0b0',
  },
};

let P, ui;

const smooth = (a, b, t) => {
  const x = clamp((t - a) / Math.max(0.001, b - a), 0, 1);
  return x * x * (3 - 2 * x);
};

export async function setup(AM) {
  P = await K.painter(AM, { scale: 0.55 });
  ui = AM.layer('ui');
}

function activeLine(t, AM) {
  let cur = AM.timeline.lines[0];
  let idx = 0;
  for (let i = 0; i < AM.timeline.lines.length; i++) {
    const l = AM.timeline.lines[i];
    if (t >= l.start - 0.12) {
      cur = l;
      idx = i;
    }
  }
  const dur = Math.max(0.2, cur.end - cur.start);
  const lt = Math.max(0, t - cur.start);
  const u = clamp(lt / dur, 0, 1);
  return { id: cur.id, u, lt, a: cur.start, idx };
}

export function render(t, AM) {
  const { id, u, a, idx } = activeLine(t, AM);

  P.clear(K.PAL.paper);
  ui.clearRect(0, 0, 1080, 1920);

  if (id === 'hook') {
    const g = K.view(P, { x: lerp(560, 510, ease.inOutSine(u)), y: 980, z: lerp(1.0, 1.08, u) });
    K.dawnSky(g, { sun: [760, 860], glow: 0.9 });
    K.streaks(g, t, { y: 400, color: '#d9a8c0', a: 0.5, seed: 3 });
    K.semeru(g, t, 880, 960, { s: 0.58 });
    K.calderaWall(g, t, { y: 990, amp: 75, color: K.PAL.ridgeFar, seed: 2 });
    K.sandSea(g, t, { y: 1010 });
    K.batok(g, 350, 1130, { s: 0.78 });
    K.bromo(g, t, 800, 1130, { s: 0.82 });
    for (let i = 0; i < 4; i++) {
      g.save();
      g.translate(((i * 420 + t * 22) % 1900) - 400, 1120 + i * 14);
      g.scale(1, 0.16);
      K.radial(g, 0, 0, 380, '#ffffff', 0.65);
      g.restore();
    }

    K.title(ui, 'FAJAR DI KALDERA TENGGER', 540, 260, {
      size: 48,
      alpha: smooth(0.05, 0.3, u),
    });
    K.tag(ui, 'Lukisan Alam di Atas Lautan Kabut', 540, 340, {
      size: 36,
      alpha: smooth(0.15, 0.4, u),
      sub: 'Pegunungan Jawa Timur',
    });
  } else if (id === 'kaldera') {
    const g = K.view(P, { x: 540, y: lerp(960, 1010, u), z: lerp(0.96, 1.05, u) });
    K.dawnSky(g, { sun: [640, 820], glow: 0.95 });
    K.streaks(g, t, { y: 420, color: K.PAL.rose, a: 0.45, seed: 7 });
    K.calderaWall(g, t, { y: 950, color: K.PAL.ridgeFar, amp: 105, seed: 4 });
    K.calderaWall(g, t, { y: 1030, color: K.PAL.ridgeMid, amp: 80, seed: 8 });
    K.sandSea(g, t, { y: 1050 });

    K.title(ui, 'KALDERA PURBA 16 KM', 540, 260, {
      size: 52,
      alpha: smooth(0.05, 0.3, u),
    });
    K.tag(ui, 'LAUTAN PASIR BERBISIK', 540, 340, {
      size: 38,
      alpha: smooth(0.15, 0.4, u),
      sub: 'sisa kawah gunung purba Tengger',
    });
  } else if (id === 'batok') {
    const g = K.view(P, { x: lerp(420, 380, u), y: 1040, z: lerp(1.08, 1.22, u) });
    K.dawnSky(g, { sun: [720, 800], glow: 0.95 });
    K.calderaWall(g, t, { y: 980, color: K.PAL.ridgeFar, amp: 70, seed: 3 });
    K.sandSea(g, t, { y: 1000 });
    K.bromo(g, t, 830, 1120, { s: 0.72 });
    K.batok(g, 380, 1150, { s: 1.05, light: 1 });

    K.tag(ui, 'GUNUNG BATOK', 540, 280, {
      size: 46,
      alpha: smooth(0.08, 0.35, u),
      sub: 'lereng beralur bagai tempurung kelapa',
    });
  } else if (id === 'bromo') {
    const g = K.view(P, { x: lerp(680, 740, u), y: 1040, z: lerp(1.08, 1.22, u) });
    K.dawnSky(g, { sun: [540, 780], glow: 1.0 });
    K.calderaWall(g, t, { y: 980, color: K.PAL.ridgeFar, amp: 75, seed: 5 });
    K.sandSea(g, t, { y: 1000 });
    K.batok(g, 310, 1140, { s: 0.72 });
    K.bromo(g, t, 760, 1150, { s: 1.05, smoke: 1.15 });

    K.tag(ui, 'KAWAH GUNUNG BROMO', 540, 280, {
      size: 46,
      alpha: smooth(0.08, 0.35, u),
      sub: 'pusat spiritual masyarakat adat Tengger',
    });
  } else if (id === 'semeru') {
    const g = K.view(P, { x: lerp(680, 760, u), y: lerp(960, 910, u), z: lerp(1.05, 1.18, u) });
    K.dawnSky(g, { sun: [580, 760], glow: 1.0 });
    K.streaks(g, t, { y: 390, color: '#f2c8b0', a: 0.5, seed: 11 });
    K.semeru(g, t, 780, 980, { s: 0.85, smoke: 1.0 });
    K.calderaWall(g, t, { y: 1020, color: K.PAL.ridgeMid, amp: 70, seed: 9 });
    K.sandSea(g, t, { y: 1040 });
    K.batok(g, 340, 1160, { s: 0.68 });
    K.bromo(g, t, 660, 1160, { s: 0.72 });

    K.title(ui, 'PUNCAK MAHAMERU', 540, 260, {
      size: 52,
      alpha: smooth(0.05, 0.3, u),
    });
    K.tag(ui, '3.676 METER DI ATAS LAUT', 540, 340, {
      size: 38,
      alpha: smooth(0.15, 0.4, u),
      sub: 'atap tertinggi Pulau Jawa',
    });
  } else if (id === 'pura') {
    const g = K.view(P, { x: 540, y: 1060, z: lerp(1.05, 1.15, u) });
    K.dawnSky(g, { sun: [660, 820], glow: 0.85 });
    K.calderaWall(g, t, { y: 980, color: K.PAL.ridgeFar, amp: 65, seed: 6 });
    K.sandSea(g, t, { y: 1000 });
    K.bromo(g, t, 780, 1110, { s: 0.75 });
    K.gate(g, 540, 1220, 0.85);
    for (let i = 0; i < 3; i++) {
      g.save();
      g.translate(((i * 450 + t * 18) % 1800) - 350, 1210 + i * 15);
      g.scale(1, 0.14);
      K.radial(g, 0, 0, 360, '#ffffff', 0.55);
      g.restore();
    }

    K.tag(ui, 'PURA LUHUR POTEN', 540, 280, {
      size: 46,
      alpha: smooth(0.08, 0.35, u),
      sub: 'candi bentar di kaki kawah Bromo',
    });
  } else if (id === 'fajar') {
    const g = K.view(P, { x: 540, y: 980, z: lerp(1.06, 0.98, u) });
    K.dawnSky(g, { sun: [620, lerp(860, 680, u)], glow: 1.25 });
    K.streaks(g, t, { y: 420, color: '#f6d0a8', a: 0.55, seed: 15 });
    K.semeru(g, t, 880, 960, { s: 0.6 });
    K.calderaWall(g, t, { y: 990, color: K.PAL.ridgeFar, amp: 75, seed: 12 });
    K.sandSea(g, t, { y: 1010 });
    K.batok(g, 350, 1130, { s: 0.78, light: 1 });
    K.bromo(g, t, 800, 1130, { s: 0.82 });

    K.title(ui, 'SEMBURAT FAJAR EMAS', 540, 260, {
      size: 50,
      alpha: smooth(0.05, 0.3, u),
    });
    K.tag(ui, 'TIGA GUNUNG DALAM SATU KANVAS', 540, 340, {
      size: 36,
      alpha: smooth(0.15, 0.4, u),
      sub: 'Batok · Bromo · Semeru',
    });
  } else {
    const g = K.view(P, { x: 540, y: 990, z: lerp(1.02, 0.96, u) });
    K.dawnSky(g, { sun: [620, 700], glow: 1.15 });
    K.streaks(g, t, { y: 400, color: '#f2c8b0', a: 0.5, seed: 19 });
    K.semeru(g, t, 880, 960, { s: 0.58 });
    K.calderaWall(g, t, { y: 990, color: K.PAL.ridgeFar, amp: 70, seed: 14 });
    K.sandSea(g, t, { y: 1010 });
    K.batok(g, 340, 1130, { s: 0.76 });
    K.bromo(g, t, 800, 1130, { s: 0.8 });
    K.gate(g, 560, 1125, 0.38);

    g.fillStyle = K.mix(K.PAL.green, K.PAL.sand, 0.3);
    K.poly(g, [
      [-400, 1430],
      [320, 1370],
      [900, 1410],
      [1500, 1470],
      [1500, 2400],
      [-400, 2400],
    ]);
    g.fill();
    K.figure(g, {
      x: 340,
      y: 1480,
      h: 480,
      face: 1,
      costume: 'tengger',
      light: 1,
      t,
      pose: { armF: [0.4, 0.3], armB: [0.2, 0.3] },
    });
    K.figure(g, {
      x: 540,
      y: 1490,
      h: 450,
      face: -1,
      costume: 'tenggerW',
      light: 1,
      t: t + 0.8,
      pose: { armF: [0.4, 0.3], armB: [0.2, 0.3] },
    });

    K.title(ui, 'HARMONI KALDERA TENGGER', 540, 260, {
      size: 48,
      alpha: smooth(0.05, 0.3, u),
    });
    K.tag(ui, 'LANSKAP ABADI NUSANTARA', 540, 340, {
      size: 38,
      alpha: smooth(0.15, 0.4, u),
      sub: 'alam, kabut, dan tradisi yang terjaga',
    });
  }

  const since = t - a;
  if (since < 0.35 && idx > 0) {
    const k = 1 - since / 0.35;
    const g = P.g;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = `rgba(247,242,231,${0.55 * k})`;
    g.fillRect(0, 0, P.W, P.H);
  }
  P.paint(Math.floor((t * 24) / 3));
}
