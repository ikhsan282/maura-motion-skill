// Demo 1 — Sumpah Palapa Gajah Mada 1336 (Ikrar Sang Mahapatih Menyatukan Nusantara)
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
    K.inkSun(g, 540, 760, 240, { col: K.PAL.crimson });
    K.candiBentar(g, 540, 1280, 1.35);
    K.warrior(g, 540, 1180, 1.45, { t, weapon: 'keris', pose: 'oath' });

    K.comicBorder(ui);
    K.captionBox(
      ui,
      'SUMPAH PALAPA 1336',
      'Ikrar Gajah Mada di Balairung Agung Majapahit',
      540,
      240,
      { a: K.pop(t, a + 0.1), tag: 'MAJAPAHIT · 1336 M' }
    );
  } else if (id === 'lantik') {
    K.parchmentBg(g, { mood: 'warm' });
    K.pendopo(g, 540, 1080, 1.15);
    K.warrior(g, 360, 1190, 1.15, { t, capeCol: K.PAL.gold, weapon: 'none', pose: 'stand' });
    K.warrior(g, 680, 1190, 1.25, { t: t + 0.5, capeCol: K.PAL.crimson, weapon: 'keris', pose: 'oath' });

    K.comicBorder(ui);
    K.captionBox(
      ui,
      'MAHAPATIH AMANGKUBHUMI',
      'Dilantik oleh Ratu Tribhuwana Tunggadewi',
      540,
      240,
      { a: K.pop(t, a + 0.1), tag: 'PELANTIKAN AGUNG' }
    );
  } else if (id === 'sumpah') {
    K.parchmentBg(g, { mood: 'crimson' });
    K.speedLines(g, 540, 960, { n: 36, r0: 210, r1: 980, t });
    K.inkSun(g, 540, 960, 230, { col: K.PAL.gold });
    K.warrior(g, 540, 1160, 1.65, { t, weapon: 'keris', pose: 'oath' });

    K.comicBorder(ui);
    K.captionBox(
      ui,
      '"AMUKTI PALAPA!"',
      'Pantang Menikmati Istirahat Sebelum Nusantara Bersatu',
      540,
      240,
      { a: K.pop(t, a + 0.1), tag: 'KITAB PARARATON' }
    );
  } else if (id === 'pulau') {
    K.parchmentBg(g, { mood: 'warm' });
    K.panelFrame(g, 90, 440, 900, 820, { fill: '#e8d9bd', thick: 10 });
    K.archipelagoMap(g, 540, 860, 1.15, { prog: K.clamp(u * 1.3, 0.2, 1), t });

    K.comicBorder(ui);
    K.captionBox(
      ui,
      'SEPULUH WILAYAH NUSANTARA',
      'Gurun · Seran · Tanjungpura · Haru · Pahang · Dompo · Bali · Sunda · Palembang · Tumasik',
      540,
      240,
      { a: K.pop(t, a + 0.1), tag: 'PETA SUMPAH PALAPA' }
    );
  } else if (id === 'ejek') {
    K.parchmentBg(g, { mood: 'night' });
    // Two graphic-novel split panels
    K.panelFrame(g, 90, 430, 900, 390, { fill: '#c8b89e', thick: 10 });
    for (let i = 0; i < 3; i++) {
      K.warrior(g, 280 + i * 260, 760, 0.9, {
        t: t + i,
        pose: 'stand',
        silhouette: true,
      });
    }
    K.panelFrame(g, 90, 860, 900, 440, { fill: '#e6c5a3', thick: 10 });
    K.warrior(g, 540, 1210, 1.25, { t, weapon: 'keris', pose: 'oath' });

    K.comicBorder(ui);
    K.captionBox(
      ui,
      'DITERTAWAKAN DI BALAIRUNG',
      'Cibiran Para Bangsawan Justru Membakar Tekad Sang Patih',
      540,
      240,
      { a: K.pop(t, a + 0.1), tag: 'UJIAN TEKAD' }
    );
  } else if (id === 'keris') {
    K.parchmentBg(g, { mood: 'crimson' });
    K.speedLines(g, 540, 920, { n: 28, r0: 190, r1: 950, t });
    K.candiBentar(g, 540, 1260, 1.3);
    K.warrior(g, 540, 1180, 1.5, { t, weapon: 'spear', pose: 'oath' });

    K.comicBorder(ui);
    K.captionBox(
      ui,
      'PANJI GULA KELAPA',
      'Membangun Kekuatan Maritim & Diplomasi Nusantara',
      540,
      240,
      { a: K.pop(t, a + 0.1), tag: 'KEBANGKITAN ARMADA' }
    );
  } else if (id === 'armada') {
    K.parchmentBg(g, { mood: 'warm' });
    K.inkSun(g, 760, 560, 150, { col: K.PAL.crimson });
    K.waves(g, { y0: 1060, y1: 1480, t });
    K.jongShip(g, 330, 1060, 0.85, { t });
    K.jongShip(g, 680, 1120, 1.15, { t: t + 0.7 });

    K.comicBorder(ui);
    K.captionBox(
      ui,
      'ARMADA JONG MAJAPAHIT',
      'Menghubungkan Jalur Laut dari Sumatra hingga Maluku',
      540,
      240,
      { a: K.pop(t, a + 0.1), tag: 'KEJAYAAN BAHARI' }
    );
  } else {
    K.parchmentBg(g, { mood: 'warm' });
    K.inkSun(g, 540, 680, 210, { col: K.PAL.gold });
    K.archipelagoMap(g, 540, 680, 1.0, { prog: 1, t });
    K.candiBentar(g, 540, 1300, 1.25);
    K.warrior(g, 540, 1220, 1.35, { t, weapon: 'keris', pose: 'oath' });

    K.comicBorder(ui);
    K.captionBox(
      ui,
      'WARISAN CITA-CITA NUSANTARA',
      'Satu Ikrar yang Menginspirasi Persatuan Bangsa',
      540,
      240,
      { a: K.pop(t, a + 0.1), tag: 'EPILOG SEJARAH' }
    );
  }

  P.paint(Math.floor((t * 24) / 2));
}

