// Demo 3 — Teknik Lukis Cat Air Basah di Atas Basah (Wet-on-Wet, Glazing & Dry-Brush)
// Cat Air (Watercolor) — Mendemonstrasikan tahapan visual cat air dari kertas cold-press hingga lapisan akhir

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
    const g = K.view(P, { x: 540, y: 980, z: lerp(1.0, 1.07, u) });
    K.dawnSky(g, { sun: [680, 820], glow: 1.05 });
    K.streaks(g, t, { y: 410, color: K.PAL.rose, a: 0.5, seed: 3 });
    K.semeru(g, t, 880, 960, { s: 0.58 });
    K.calderaWall(g, t, { y: 990, color: K.PAL.ridgeFar, amp: 75, seed: 5 });
    K.sandSea(g, t, { y: 1010 });
    K.batok(g, 350, 1130, { s: 0.76 });
    K.bromo(g, t, 800, 1130, { s: 0.82 });

    K.title(ui, 'RAHASIA CAHAYA CAT AIR', 540, 260, {
      size: 50,
      alpha: smooth(0.05, 0.3, u),
    });
    K.tag(ui, 'MENGAPA SAPUAN AIR TAMPAK BERNAPAS?', 540, 340, {
      size: 36,
      alpha: smooth(0.15, 0.4, u),
      sub: 'bedah teknik watercolor di atas kertas',
    });
  } else if (id === 'kertas') {
    const g = K.view(P, { x: 540, y: 980, z: 1.0 });
    // Biarkan permukaan kertas cold-press dominan untuk memperlihatkan cahaya dari kertas putih
    K.radial(g, 540, 780, 460, '#ffe8b8', 0.65 * smooth(0.08, 0.65, u));
    K.radial(g, 540, 780, 680, '#f6d0b8', 0.45 * smooth(0.18, 0.8, u));
    K.streaks(g, t, { y: 980, color: '#d9a8c0', a: 0.35, seed: 12 });

    K.title(ui, '1. KERTAS COLD-PRESS', 540, 260, {
      size: 52,
      alpha: smooth(0.05, 0.3, u),
    });
    K.tag(ui, 'CAHAYA DARI WARNA KERTAS', 540, 340, {
      size: 38,
      alpha: smooth(0.15, 0.4, u),
      sub: 'tanpa cat putih pekat, kertas menjadi sumber terang',
    });
  } else if (id === 'basah') {
    const g = K.view(P, { x: 540, y: 980, z: lerp(0.98, 1.05, u) });
    K.dawnSky(g, { sun: [540, 760], glow: lerp(0.6, 1.25, u) });
    K.streaks(g, t, { y: 480, color: K.PAL.rose, a: 0.55, seed: 22 });
    K.streaks(g, t, { y: 740, color: '#f2c898', a: 0.5, seed: 25 });

    K.title(ui, '2. TEKNIK WET-ON-WET', 540, 260, {
      size: 52,
      alpha: smooth(0.05, 0.3, u),
    });
    K.tag(ui, 'BASAH DI ATAS BASAH', 540, 340, {
      size: 38,
      alpha: smooth(0.15, 0.4, u),
      sub: 'pigmen mengalir mengikuti serat kapiler kertas',
    });
  } else if (id === 'kabut') {
    const g = K.view(P, { x: 540, y: 990, z: lerp(1.02, 1.12, u) });
    K.dawnSky(g, { sun: [680, 820], glow: 0.95 });
    K.calderaWall(g, t, { y: 990, color: K.PAL.ridgeFar, amp: 70, seed: 30 });
    K.sandSea(g, t, { y: 1010 });
    K.bromo(g, t, 540, 1140, { s: 0.95, smoke: 1.2 });
    for (let i = 0; i < 5; i++) {
      g.save();
      g.translate(((i * 380 + t * 24) % 1900) - 400, 1120 + i * 16);
      g.scale(1, 0.16);
      K.radial(g, 0, 0, 420, '#ffffff', 0.72);
      g.restore();
    }

    K.title(ui, '3. EFEK BLOOM & KABUT', 540, 260, {
      size: 52,
      alpha: smooth(0.05, 0.3, u),
    });
    K.tag(ui, 'GRADASI LEMBUT TANPA GARIS KAKU', 540, 340, {
      size: 36,
      alpha: smooth(0.15, 0.4, u),
      sub: 'asap kawah dan kabut lembah menyatu alami',
    });
  } else if (id === 'lapisan') {
    const g = K.view(P, { x: 540, y: 980, z: 1.02 });
    K.dawnSky(g, { sun: [640, 820], glow: 0.85 });
    if (u > 0.08) {
      K.semeru(g, t, 860, 950, { s: 0.58 });
      K.calderaWall(g, t, { y: 970, color: K.PAL.ridgeFar, amp: 85, seed: 40 });
    }
    if (u > 0.38) {
      K.calderaWall(g, t, { y: 1030, color: K.PAL.ridgeMid, amp: 75, seed: 41 });
      K.batok(g, 360, 1140, { s: 0.78 });
    }
    if (u > 0.65) {
      K.calderaWall(g, t, { y: 1090, color: K.PAL.ridgeNear, amp: 65, seed: 42 });
      K.sandSea(g, t, { y: 1090 });
    }

    K.title(ui, '4. GLAZING BERLAPIS', 540, 260, {
      size: 52,
      alpha: smooth(0.05, 0.3, u),
    });
    K.tag(ui, 'DARI TERANG MENUJU GELAP', 540, 340, {
      size: 38,
      alpha: smooth(0.15, 0.4, u),
      sub: 'menumpuk sapuan transparan setelah kering',
    });
  } else if (id === 'tepi') {
    const g = K.view(P, { x: 540, y: 1020, z: lerp(1.04, 1.12, u) });
    K.dawnSky(g, { sun: [620, 820], glow: 0.85 });
    K.calderaWall(g, t, { y: 980, color: K.PAL.ridgeFar, amp: 75, seed: 45 });
    K.sandSea(g, t, { y: 1000 });
    K.batok(g, 340, 1130, { s: 0.8 });
    K.bromo(g, t, 790, 1130, { s: 0.82 });
    K.gate(g, 540, 1210, 0.75);

    K.title(ui, '5. GARIS TEPI ORGANIK', 540, 260, {
      size: 52,
      alpha: smooth(0.05, 0.3, u),
    });
    K.tag(ui, 'ENDAPAN PIGMEN DI TEPI SAPUAN', 540, 340, {
      size: 36,
      alpha: smooth(0.15, 0.4, u),
      sub: 'memberi siluet tegas pada gunung dan gerbang',
    });
  } else if (id === 'kontras') {
    const g = K.view(P, { x: 540, y: 1000, z: lerp(1.04, 1.12, u) });
    K.dawnSky(g, { sun: [740, 860], night: 0.25 });
    K.calderaWall(g, t, { y: 1000, color: K.PAL.ridgeFar, amp: 70, seed: 50 });
    K.sandSea(g, t, { y: 1020 });
    K.bromo(g, t, 760, 1140, { s: 0.85 });

    g.fillStyle = K.mix(K.PAL.ash, K.PAL.sand, 0.5);
    K.poly(g, [
      [-400, 1400],
      [320, 1340],
      [820, 1350],
      [1500, 1420],
      [1500, 2400],
      [-400, 2400],
    ]);
    g.fill();
    K.figure(g, {
      x: 420,
      y: 1440,
      h: 480,
      face: 1,
      costume: 'seger',
      light: 1,
      t,
      pose: { armF: [1.4, 0.4], armB: [0.3, 0.4] },
    });
    K.torch(g, t, 490, 1020, 1.0);
    K.offering(g, 660, 1330, 0.85, 0.1);

    K.title(ui, '6. AKSEN DRY-BRUSH & OBOR', 540, 260, {
      size: 50,
      alpha: smooth(0.05, 0.3, u),
    });
    K.tag(ui, 'SAPUAN PEKAT PENegas FOKUS', 540, 340, {
      size: 38,
      alpha: smooth(0.15, 0.4, u),
      sub: 'menghidupkan sosok manusia dan nyala api',
    });
  } else {
    const g = K.view(P, { x: 540, y: 980, z: lerp(1.04, 0.96, u) });
    K.dawnSky(g, { sun: [620, 740], glow: 1.15 });
    K.streaks(g, t, { y: 400, color: '#f2c8b0', a: 0.5, seed: 60 });
    K.semeru(g, t, 880, 960, { s: 0.58 });
    K.calderaWall(g, t, { y: 990, color: K.PAL.ridgeFar, amp: 70, seed: 61 });
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
      costume: 'seger',
      light: 1,
      t,
      pose: { armF: [0.5, 0.3], armB: [0.2, 0.3] },
    });
    K.figure(g, {
      x: 540,
      y: 1490,
      h: 450,
      face: -1,
      costume: 'anteng',
      light: 1,
      t: t + 0.8,
      pose: { armF: [0.5, 0.3], armB: [0.2, 0.3] },
    });

    K.title(ui, 'SENI AIR DAN PIGMEN HIDUP', 540, 260, {
      size: 50,
      alpha: smooth(0.05, 0.3, u),
    });
    K.tag(ui, 'KENDALI KUAS · ALIRAN AIR', 540, 340, {
      size: 38,
      alpha: smooth(0.15, 0.4, u),
      sub: 'setiap sapuan tak pernah terulang sama',
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
