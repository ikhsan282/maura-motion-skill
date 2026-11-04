// Demo 2 — Keong Mas & Dewi Candra Kirana (Dongeng Kerajaan Kediri)
// Gouache Buku Dongeng — Komposisi simetris buku cerita, sapuan matte hangat + gouache paint pass

import * as K from '/styles/gouache-dongeng/kit.js';

export const meta = {
  fps: 24,
  hold: 2,
  captions: { preset: 'hand', y: 1470, size: 64 },
};

let P, ui;

export async function setup(AM) {
  P = await K.painter(AM, { scale: 0.55 });
  ui = AM.layer('ui');
}

function activeLine(t, AM) {
  let cur = AM.timeline.lines[0];
  for (const l of AM.timeline.lines) {
    if (t >= l.start - 0.12) cur = l;
  }
  const dur = Math.max(0.2, cur.end - cur.start);
  const lt = Math.max(0, t - cur.start);
  const u = K.clamp(lt / dur, 0, 1);
  return { id: cur.id, u, lt, a: cur.start };
}

export function render(t, AM) {
  const { id, u, a } = activeLine(t, AM);
  const g = K.view(P, { x: 540, y: 960, z: 1.0 + 0.04 * Math.sin(u * Math.PI) });
  ui.clearRect(0, 0, 1080, 1920);

  K.bg(g, t);

  if (id === 'hook') {
    K.sunMoon(g, 540, 480, 105, { t });
    K.cloud(g, 230, 450, 0.9);
    K.cloud(g, 850, 450, 0.9);
    K.hill(g, 540, 1280, 820, 340, K.PAL.leaf);
    K.tree(g, 160, 1060, 0.95, { t });
    K.tree(g, 920, 1060, 0.95, { t: t + 1 });
    K.hut(g, 540, 960, 1.25, { t, royal: true });

    K.figure(g, 410, 1140, 1.15, K.PAL.gold, { t, crown: true, happy: true });
    K.figure(g, 670, 1140, 1.18, K.PAL.skyDeep, { t: t + 0.6, crown: true, happy: true });

    K.storybookArch(ui);
    K.title(ui, 'PUTRI CANDRA KIRANA', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 48,
      sub: 'Dongeng Klasik Kerajaan Daha & Raden Inu',
    });
  } else if (id === 'kutuk') {
    K.bg(g, t, { top: '#c5b4c8', mid: '#dfd2cf', low: '#b8a99a' });
    K.hill(g, 540, 1120, 820, 280, K.PAL.leafDark);
    K.river(g, { y0: 1080, y1: 1460, t });

    K.figure(g, 280, 960, 1.1, K.PAL.purple, { t, happy: false });
    const morph = K.clamp((u - 0.25) / 0.5, 0, 1);
    if (morph < 0.7) {
      K.figure(g, 640, 980, 1.1 * (1 - morph * 0.5), K.PAL.gold, { t, crown: true, happy: false });
    }
    K.goldenSnail(g, 660, 1230, 1.35 * K.clamp(u * 1.4, 0.3, 1), { t, glow: 1 });

    K.storybookArch(ui);
    K.title(ui, 'KUTUKAN KEONG EMAS', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 50,
      sub: 'Sang Putri Disihir dan Hanyut di Sungai Brantas',
    });
  } else if (id === 'jaring') {
    K.cloud(g, 260, 450, 0.9);
    K.cloud(g, 820, 460, 0.9);
    K.hill(g, 540, 1100, 820, 280, K.PAL.leaf);
    K.tree(g, 190, 980, 0.95, { t });
    K.tree(g, 890, 980, 0.95, { t: t + 1 });
    K.river(g, { y0: 1060, y1: 1460, t });

    K.figure(g, 340, 980, 1.12, K.PAL.wood, { t, old: true, happy: true });
    K.goldenSnail(g, 650, 1220, 1.4, { t, glow: 1 });

    // Net arc
    g.strokeStyle = '#5e3a1e';
    g.lineWidth = 5;
    g.beginPath();
    g.arc(650, 1210, 105, 0, Math.PI);
    g.stroke();

    K.storybookArch(ui);
    K.title(ui, 'JARING MBOK RONDO DADAPAN', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 46,
      sub: 'Menemukan Keong Bercangkang Emas di Sungai',
    });
  } else if (id === 'tempayan') {
    K.hill(g, 540, 1300, 820, 340, K.PAL.leaf);
    K.hut(g, 540, 920, 1.25, { t });
    K.figure(g, 330, 1140, 1.12, K.PAL.wood, { t, old: true, happy: true });

    // Earthenware jar (tempayan)
    g.fillStyle = '#9e5430';
    g.beginPath();
    g.ellipse(620, 1220, 105, 85, 0, 0, K.TAU);
    g.fill();
    g.fillStyle = '#4f8ca8';
    g.beginPath();
    g.ellipse(620, 1165, 82, 26, 0, 0, K.TAU);
    g.fill();
    K.goldenSnail(g, 620, 1145, 1.15, { t, glow: 1 });

    K.storybookArch(ui);
    K.title(ui, 'TEMPAYAN TANAH LIAT', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 50,
      sub: 'Dirawat dengan Kasih Sayang di Gubuk Desa',
    });
  } else if (id === 'masak') {
    K.hill(g, 540, 1320, 820, 340, '#c89b62');
    K.hut(g, 540, 880, 1.15, { t });

    // Wooden dining table with warm dishes
    g.fillStyle = '#7a4b26';
    g.fillRect(280, 1160, 520, 34);
    g.fillRect(330, 1194, 28, 120);
    g.fillRect(722, 1194, 28, 120);

    for (const dx of [370, 540, 710]) {
      g.fillStyle = '#fbf3df';
      g.beginPath();
      g.ellipse(dx, 1145, 58, 22, 0, 0, K.TAU);
      g.fill();
      g.fillStyle = K.PAL.gold;
      g.beginPath();
      g.arc(dx, 1135, 32, Math.PI, K.TAU);
      g.fill();
    }
    K.figure(g, 220, 1120, 1.1, K.PAL.wood, { t, old: true, happy: true });

    K.storybookArch(ui);
    K.title(ui, 'HIDANGAN AJAIB DI MEJA', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 48,
      sub: 'Makanan Hangat Tersaji Setiap Pulang dari Sungai',
    });
  } else if (id === 'intip') {
    K.bg(g, t, { top: '#f6e4b8', mid: '#f3e6c8', low: '#dfc388' });
    K.sunMoon(g, 580, 960, 220, { color: K.PAL.goldHi, rays: 14, t });
    K.hill(g, 540, 1340, 820, 320, K.PAL.leaf);
    K.figure(g, 250, 1120, 1.08, K.PAL.wood, { t, old: true, happy: true });
    K.goldenSnail(g, 480, 1240, 1.1, { t, glow: 0.8 });
    K.figure(g, 640, 1060, 1.25, K.PAL.gold, { t, crown: true, happy: true });

    K.storybookArch(ui);
    K.title(ui, 'RAHASIA DI BALIK CANGKANG', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 46,
      sub: 'Putri Candra Kirana Keluar dari Keong Emas',
    });
  } else if (id === 'inu') {
    K.sunMoon(g, 540, 500, 110, { t });
    K.hill(g, 540, 1280, 820, 340, K.PAL.leaf);
    K.hut(g, 540, 940, 1.15, { t });
    K.figure(g, 250, 1150, 1.05, K.PAL.wood, { t, old: true, happy: true });
    K.figure(g, 470, 1130, 1.18, K.PAL.gold, { t, crown: true, happy: true });
    K.figure(g, 690, 1130, 1.2, K.PAL.skyDeep, { t: t + 0.5, crown: true, happy: true });

    K.storybookArch(ui);
    K.title(ui, 'PERTEMUAN RADEN INU', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 50,
      sub: 'Cinta Sejati Mematahkan Kutukan Penyihir',
    });
  } else {
    K.sunMoon(g, 540, 460, 115, { t });
    K.cloud(g, 220, 440, 0.9);
    K.cloud(g, 860, 440, 0.9);
    K.hill(g, 540, 1280, 840, 350, K.PAL.leaf);
    K.tree(g, 160, 1060, 1.0, { t });
    K.tree(g, 920, 1060, 1.0, { t: t + 1 });
    K.hut(g, 540, 940, 1.28, { t, royal: true });

    K.figure(g, 330, 1150, 1.08, K.PAL.wood, { t, old: true, happy: true });
    K.figure(g, 540, 1140, 1.18, K.PAL.gold, { t: t + 0.4, crown: true, happy: true });
    K.figure(g, 740, 1140, 1.2, K.PAL.skyDeep, { t: t + 0.8, crown: true, happy: true });

    K.storybookArch(ui);
    K.title(ui, 'KEMBALI KE ISTANA KEDIRI', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 48,
      sub: 'Kasih Sayang Mbok Rondo Berbuah Kemuliaan',
    });
  }

  P.paint(Math.floor((t * 24) / 2));
}

