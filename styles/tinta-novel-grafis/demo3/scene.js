// Demo 3 — Pertahanan Sultan Agung & Benteng Batavia 1628 (Membendung Sungai Ciliwung)
// Tinta Novel Grafis — Garis tinta kuas bergetar + wash warna datar di atas kertas perkamen ('ink' paint pass)

import * as K from '/styles/tinta-novel-grafis/kit.js';

export const meta = {
  fps: 24,
  hold: 2,
  captions: { preset: 'comic', y: 1470, size: 64 },
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
  const g = K.view(P, { x: 540, y: 960, z: 1.0 + 0.04 * u });
  ui.clearRect(0, 0, 1080, 1920);

  if (id === 'hook') {
    K.parchmentBg(g, { mood: 'crimson' });
    K.inkSun(g, 540, 740, 230, { col: K.PAL.gold });
    K.pendopo(g, 540, 1100, 1.2);
    K.warrior(g, 540, 1200, 1.55, { t, weapon: 'keris', capeCol: K.PAL.crimson, pose: 'oath' });

    K.comicBorder(ui);
    K.captionBox(
      ui,
      'SULTAN AGUNG MATARAM 1628',
      'Keputusan Agung Menghadang Ekspansi VOC di Batavia',
      540,
      240,
      { a: K.pop(t, a + 0.1), tag: 'KERATON MATARAM · 1628' }
    );
  } else if (id === 'jalan') {
    K.parchmentBg(g, { mood: 'warm' });
    K.inkSun(g, 800, 560, 140, { col: K.PAL.crimson });
    K.panelFrame(g, 90, 440, 900, 820, { fill: '#e3d3b3', thick: 10 });
    for (let i = 0; i < 4; i++) {
      K.warrior(g, 220 + i * 210, 1120, 1.05, {
        t: t + i * 0.4,
        weapon: 'spear',
        pose: 'oath',
        silhouette: true,
      });
    }

    K.comicBorder(ui);
    K.captionBox(
      ui,
      'MARS RATUSAN KILOMETER',
      'Pasukan Tumenggung Baureksa Menembus Pedalaman Jawa',
      540,
      240,
      { a: K.pop(t, a + 0.1), tag: 'EKSPEDISI DARAT' }
    );
  } else if (id === 'lumbung') {
    K.parchmentBg(g, { mood: 'warm' });
    K.pendopo(g, 330, 1100, 0.75);
    K.pendopo(g, 750, 1100, 0.75);
    K.archipelagoMap(g, 540, 660, 0.95, { prog: 0.4, t });

    K.comicBorder(ui);
    K.captionBox(
      ui,
      'STRATEGI LUMBUNG LOGISTIK',
      'Cadangan Beras di Sepanjang Jalur Tegal, Cirebon & Karawang',
      540,
      240,
      { a: K.pop(t, a + 0.1), tag: 'TAKTIK LOGISTIK 1629' }
    );
  } else if (id === 'malam') {
    K.parchmentBg(g, { mood: 'night' });
    K.inkSun(g, 820, 540, 110, { col: '#f4efe3' });
    // Fortress wall silhouette
    K.panelFrame(g, 160, 760, 760, 320, { fill: '#52493f', thick: 10 });
    K.waves(g, { y0: 1080, y1: 1460, t });

    K.comicBorder(ui);
    K.captionBox(
      ui,
      'DI HADAPAN BENTENG BATAVIA',
      'Merancang Siasat Teknik Sipil di Tengah Malam',
      540,
      240,
      { a: K.pop(t, a + 0.1), tag: 'SIASAT MALAM' }
    );
  } else if (id === 'bendung') {
    K.parchmentBg(g, { mood: 'night' });
    K.waves(g, { y0: 980, y1: 1460, t });
    // Timber dam stakes across the Ciliwung river
    g.fillStyle = '#6e4427';
    g.strokeStyle = K.PAL.ink;
    g.lineWidth = 7;
    for (let i = 0; i < 9; i++) {
      const sx = 170 + i * 92;
      g.fillRect(sx, 860, 44, 310);
      g.strokeRect(sx, 860, 44, 310);
    }

    K.comicBorder(ui);
    K.captionBox(
      ui,
      'MEMBENDUNG SUNGAI CILIWUNG',
      'Ribuan Batang Pohon Kelapa Ditanam untuk Membelokkan Arus Air',
      540,
      240,
      { a: K.pop(t, a + 0.1), tag: 'REKAYASA SUNGAI' }
    );
  } else if (id === 'tanggul') {
    K.parchmentBg(g, { mood: 'crimson' });
    K.speedLines(g, 540, 960, { n: 30, r0: 200, r1: 960, t });
    K.warrior(g, 360, 1180, 1.35, { t, weapon: 'spear', pose: 'oath' });
    K.warrior(g, 720, 1180, 1.35, { t: t + 0.5, weapon: 'keris', pose: 'oath' });

    K.comicBorder(ui);
    K.captionBox(
      ui,
      'PARIT & TANGGUL BERGERAK',
      'Perlindungan Tanah Maju Mendekati Dinding Pertahanan',
      540,
      240,
      { a: K.pop(t, a + 0.1), tag: 'GARIS DEPAN' }
    );
  } else if (id === 'warisan') {
    K.parchmentBg(g, { mood: 'warm' });
    K.candiBentar(g, 540, 1280, 1.3);
    K.warrior(g, 540, 1180, 1.45, { t, weapon: 'spear', pose: 'oath' });

    K.comicBorder(ui);
    K.captionBox(
      ui,
      'MENGGUNCANG BENTENG VOC',
      'Keberanian Strategi yang Dikenang Sepanjang Sejarah',
      540,
      240,
      { a: K.pop(t, a + 0.1), tag: 'JEJAK PERJUANGAN' }
    );
  } else {
    K.parchmentBg(g, { mood: 'warm' });
    K.inkSun(g, 540, 680, 220, { col: K.PAL.gold });
    K.pendopo(g, 540, 1120, 1.2);
    K.warrior(g, 540, 1220, 1.5, { t, weapon: 'keris', capeCol: K.PAL.crimson, pose: 'oath' });

    K.comicBorder(ui);
    K.captionBox(
      ui,
      'PAHLAWAN KEDAULATAN NUSANTARA',
      'Warisan Keteguhan Sultan Agung Hanyakrakusuma',
      540,
      240,
      { a: K.pop(t, a + 0.1), tag: 'EPILOG SEJARAH' }
    );
  }

  P.paint(Math.floor((t * 24) / 2));
}

