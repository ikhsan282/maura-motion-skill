// Demo 3 — Kancil & Siput Lomba Lari di Tepian Sungai
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
    K.sunMoon(g, 540, 470, 100, { t });
    K.cloud(g, 240, 450, 0.9);
    K.cloud(g, 840, 450, 0.9);
    K.hill(g, 540, 1100, 840, 300, K.PAL.leaf);
    K.tree(g, 180, 960, 1.0, { t });
    K.tree(g, 900, 960, 1.0, { t: t + 1 });
    K.river(g, { y0: 1120, y1: 1480, t });

    K.kancil(g, 540, 1040, 1.35, { t, run: 0.3, face: 1 });

    K.storybookArch(ui);
    K.title(ui, 'KANCIL & SIPUT SUNGAI', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 50,
      sub: 'Fabel Tepian Sungai Hutan Nusantara',
    });
  } else if (id === 'tantang') {
    K.hill(g, 540, 1120, 840, 300, K.PAL.leaf);
    K.tree(g, 200, 960, 0.95, { t });
    K.river(g, { y0: 1140, y1: 1480, t });

    K.kancil(g, 360, 1060, 1.3, { t, run: 0, face: 1 });
    // Mossy stone + river snail
    g.fillStyle = '#7a8274';
    g.beginPath();
    g.ellipse(730, 1130, 95, 45, 0, 0, K.TAU);
    g.fill();
    K.goldenSnail(g, 730, 1085, 0.95, { t, glow: 0 });

    K.storybookArch(ui);
    K.title(ui, 'TANTANGAN ADU LARI', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 50,
      sub: 'Kancil Meremehkan Langkah Pelan Si Siput',
    });
  } else if (id === 'siasat') {
    K.bg(g, t, { top: '#6d84a3', mid: '#a8b8c8', low: '#8a9e8c' });
    K.sunMoon(g, 540, 460, 85, { color: '#fbf3df', rays: 8, t });
    K.hill(g, 540, 1100, 840, 280, K.PAL.leafDark);
    K.river(g, { y0: 1100, y1: 1480, t });

    for (let i = 0; i < 5; i++) {
      K.goldenSnail(g, 190 + i * 175, 1090 + (i % 2) * 18, 0.82, { t: t + i, glow: 0.4 });
    }

    K.storybookArch(ui);
    K.title(ui, 'SIASAT MALAM PARA SIPUT', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 48,
      sub: 'Berbaris Kompak di Sepanjang Tepian Sungai',
    });
  } else if (id === 'mulai') {
    K.sunMoon(g, 240, 470, 95, { t });
    K.hill(g, 540, 1100, 840, 280, K.PAL.leaf);
    K.tree(g, 180, 960, 0.9, { t });
    K.tree(g, 880, 960, 0.9, { t: t + 1 });
    K.river(g, { y0: 1130, y1: 1480, t: t * 2 });

    const kx = K.lerp(220, 780, u);
    K.kancil(g, kx, 1050, 1.3, { t, run: 1, face: 1 });
    K.goldenSnail(g, 200, 1110, 0.85, { t, glow: 0 });

    K.storybookArch(ui);
    K.title(ui, 'LESATAN CEPAT SI KANCIL', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 48,
      sub: 'Berlari Kencang Meninggalkan Garis Awal',
    });
  } else if (id === 'panggil') {
    K.hill(g, 540, 1100, 840, 280, K.PAL.leaf);
    K.river(g, { y0: 1130, y1: 1480, t });

    K.kancil(g, 330, 1055, 1.28, { t, run: 0, face: 1 });
    K.goldenSnail(g, 760, 1095, 1.05, { t, glow: 0.8 });

    // Speech callout wave
    g.strokeStyle = K.PAL.red;
    g.lineWidth = 6;
    for (let r = 1; r <= 3; r++) {
      g.beginPath();
      g.arc(760, 1060, r * 35, Math.PI * 1.1, Math.PI * 1.9);
      g.stroke();
    }

    K.storybookArch(ui);
    K.title(ui, '"AKU SUDAH DI DEPANMU!"', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 48,
      sub: 'Suara Siput Selalu Menyahut dari Arah Depan',
    });
  } else if (id === 'bingung') {
    K.hill(g, 540, 1100, 840, 280, K.PAL.leafDark);
    K.tree(g, 300, 960, 0.88, { t });
    K.tree(g, 780, 960, 0.88, { t: t + 1 });
    K.river(g, { y0: 1130, y1: 1480, t: t * 2.5 });

    K.kancil(g, K.lerp(240, 620, (t * 0.9) % 1), 1050, 1.25, { t, run: 1, face: 1 });
    K.goldenSnail(g, 240, 1110, 0.8, { t, glow: 0.4 });
    K.goldenSnail(g, 540, 1110, 0.8, { t: t + 1, glow: 0.4 });
    K.goldenSnail(g, 840, 1110, 0.95, { t: t + 2, glow: 0.9 });

    K.storybookArch(ui);
    K.title(ui, 'KEBINGUNGAN SI KANCIL', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 50,
      sub: 'Secepat Apa Pun Berlari, Siput Sudah Menunggu',
    });
  } else if (id === 'menyerah') {
    K.hill(g, 540, 1120, 840, 300, K.PAL.leaf);
    K.river(g, { y0: 1140, y1: 1480, t });

    // Exhausted Kancil bowing head
    g.save();
    g.translate(360, 1090);
    g.rotate(0.12);
    K.kancil(g, 0, 0, 1.25, { t, run: 0, face: 1 });
    g.restore();

    K.goldenSnail(g, 740, 1090, 1.15, { t, glow: 1 });

    K.storybookArch(ui);
    K.title(ui, 'KANCIL MENGAKUI KALAH', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 50,
      sub: 'Kelelahan di Garis Akhir Tepian Sungai',
    });
  } else {
    K.sunMoon(g, 540, 470, 110, { t });
    K.cloud(g, 220, 450, 0.9);
    K.cloud(g, 860, 450, 0.9);
    K.hill(g, 540, 1100, 840, 300, K.PAL.leaf);
    K.tree(g, 170, 960, 1.0, { t });
    K.tree(g, 910, 960, 1.0, { t: t + 1 });
    K.river(g, { y0: 1130, y1: 1480, t });

    K.kancil(g, 360, 1055, 1.22, { t, run: 0, face: 1 });
    for (let i = 0; i < 3; i++) {
      K.goldenSnail(g, 620 + i * 115, 1095, 0.9, { t: t + i, glow: 0.7 });
    }

    K.storybookArch(ui);
    K.title(ui, 'KEKOMPAKAN MENGALAHKAN SOMBONG', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 42,
      sub: 'Kerjasama dan Kerendahan Hati Selalu Menang',
    });
  }

  P.paint(Math.floor((t * 24) / 2));
}

