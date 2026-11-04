// Demo 1 — Bawang Merah & Bawang Putih (Kisah Dua Labu Ajaib)
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
    K.sunMoon(g, 540, 480, 95, { t });
    K.cloud(g, 240 + Math.sin(t * 0.4) * 20, 460, 0.9);
    K.cloud(g, 840 - Math.sin(t * 0.4) * 20, 460, 0.9);
    K.hill(g, 320, 1280, 560, 320, K.PAL.leaf);
    K.hill(g, 760, 1280, 560, 320, K.PAL.leafDark);
    K.hill(g, 540, 1450, 760, 340, '#729e58');
    K.tree(g, 190, 1080, 0.95, { t });
    K.tree(g, 890, 1080, 0.95, { t: t + 1 });

    K.figure(g, 360, 1120, 1.15, '#fbf3df', { t, happy: true });
    K.figure(g, 720, 1120, 1.15, K.PAL.red, { t: t + 0.8, happy: false });
    K.pumpkin(g, 360, 1310, 85, K.PAL.gold, { t });
    K.pumpkin(g, 720, 1310, 115, '#8f5a2b', { t });

    K.storybookArch(ui);
    K.title(ui, 'BAWANG MERAH & BAWANG PUTIH', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 46,
      sub: 'Kisah Dua Labu Ajaib dari Tepian Sungai',
    });
  } else if (id === 'hanyut') {
    K.cloud(g, 300, 440, 0.95);
    K.cloud(g, 780, 470, 0.85);
    K.hill(g, 540, 1120, 780, 290, K.PAL.leaf);
    K.tree(g, 220, 980, 0.9, { t });
    K.tree(g, 860, 980, 0.9, { t: t + 1.2 });
    K.river(g, { y0: 1050, y1: 1450, t });

    // Bawang Putih mengejar selendang merah yang hanyut
    const clothX = K.lerp(360, 860, u);
    const clothY = 1220 + Math.sin(t * 4) * 18;
    g.fillStyle = K.PAL.red;
    g.beginPath();
    g.ellipse(clothX, clothY, 55, 22, 0.25, 0, K.TAU);
    g.fill();

    K.figure(g, K.lerp(240, 480, u), 980, 1.1, '#fbf3df', { t, happy: false });

    K.storybookArch(ui);
    K.title(ui, 'SELENDANG YANG HANYUT', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 50,
      sub: 'Menyusuri Arus Sungai Menuju Hilir',
    });
  } else if (id === 'putih') {
    K.hill(g, 540, 1260, 820, 360, K.PAL.leaf);
    K.tree(g, 170, 1060, 0.95, { t });
    K.tree(g, 910, 1060, 0.95, { t: t + 1 });
    K.hut(g, 540, 950, 1.25, { t });

    K.figure(g, 340, 1140, 1.12, '#fbf3df', { t, happy: true });
    K.figure(g, 740, 1150, 1.05, K.PAL.woodDark, { t: t + 0.6, old: true, happy: true });
    K.pumpkin(g, 480, 1250, 85, K.PAL.gold, { t });
    K.pumpkin(g, 640, 1240, 130, '#8f5a2b', { t });

    K.storybookArch(ui);
    K.title(ui, 'GUBUK NENEK DI HILIR', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 50,
      sub: 'Bawang Putih Memilih Labu yang Kecil',
    });
  } else if (id === 'emas') {
    K.bg(g, t, { top: '#f6e4b8', mid: '#f3e6c8', low: '#e2c588' });
    K.sunMoon(g, 540, 960, 240, { color: K.PAL.goldHi, rays: 16, t });
    K.hill(g, 540, 1380, 800, 320, '#8c6239');
    K.figure(g, 540, 920, 1.25, '#fbf3df', { t, happy: true });
    K.pumpkin(g, 540, 1180, 135, K.PAL.gold, { t, open: K.clamp(u * 1.5, 0, 1) });
    K.treasure(g, 540, 1140, 1.15 * K.clamp(u * 1.4, 0, 1), { t });

    K.storybookArch(ui);
    K.title(ui, 'BERKAH LABU KECIL', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 52,
      sub: 'Kilau Emas dan Permata dari Ketulusan Hati',
    });
  } else if (id === 'merah') {
    K.hill(g, 540, 1260, 820, 360, K.PAL.leafDark);
    K.hut(g, 540, 940, 1.2, { t });
    K.figure(g, 730, 1140, 1.02, K.PAL.woodDark, { t, old: true, happy: false });
    K.figure(g, 390, 1130, 1.2, K.PAL.red, { t: t + 0.4, happy: false });
    K.pumpkin(g, 490, 1230, 155, '#7a4b22', { t });

    K.storybookArch(ui);
    K.title(ui, 'KESERAKAHAN BAWANG MERAH', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 46,
      sub: 'Enggan Membantu, Langsung Merebut Labu Besar',
    });
  } else if (id === 'ular') {
    K.bg(g, t, { top: '#c9b49a', mid: '#dfd0b8', low: '#b89f82' });
    K.hill(g, 540, 1380, 820, 320, '#6e4c30');
    K.figure(g, 290, 1080, 1.15, K.PAL.red, { t, happy: false });
    K.figure(g, 790, 1080, 1.12, K.PAL.purple, { t: t + 0.5, happy: false });
    K.pumpkin(g, 540, 1200, 165, '#5e3a1e', { t, open: 1 });
    K.snakes(g, 540, 1120, 1.2, { t });

    K.storybookArch(ui);
    K.title(ui, 'ISI LABU RAKSASA', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 52,
      sub: 'Bukan Emas, Melainkan Ular dan Kalajengking',
    });
  } else {
    K.sunMoon(g, 540, 520, 110, { t });
    K.cloud(g, 230, 480, 0.9);
    K.cloud(g, 850, 480, 0.9);
    K.hill(g, 340, 1280, 580, 330, K.PAL.leaf);
    K.hill(g, 740, 1280, 580, 330, K.PAL.leafDark);
    K.hill(g, 540, 1420, 820, 340, '#729e58');
    K.tree(g, 190, 1080, 1.0, { t });
    K.tree(g, 890, 1080, 1.0, { t: t + 1 });
    K.hut(g, 540, 980, 1.1, { t });
    K.figure(g, 540, 1160, 1.2, '#fbf3df', { t, happy: true });
    K.pumpkin(g, 360, 1260, 90, K.PAL.gold, { t });
    K.treasure(g, 720, 1260, 0.85, { t });

    K.storybookArch(ui);
    K.title(ui, 'KEBAIKAN TAK BISA DIPALSUKAN', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 46,
      sub: 'Ketulusan Hati Selalu Berbuah Berkah',
    });
  }

  P.paint(Math.floor((t * 24) / 2));
}
