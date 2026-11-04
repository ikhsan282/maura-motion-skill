// Demo 2 — Ekspedisi Pati Unus ke Malaka 1513 (Pangeran Sabrang Lor & Armada Jong)
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
    K.inkSun(g, 540, 660, 210, { col: K.PAL.crimson });
    K.waves(g, { y0: 1040, y1: 1500, t });
    K.jongShip(g, 260, 1040, 0.78, { t });
    K.jongShip(g, 820, 1040, 0.78, { t: t + 1 });
    K.jongShip(g, 540, 1120, 1.25, { t: t + 0.4 });

    K.comicBorder(ui);
    K.captionBox(
      ui,
      'ARMADA 100 KAPAL JONG',
      'Ekspedisi Bahari Pati Unus Menembus Kabut Selat Malaka',
      540,
      240,
      { a: K.pop(t, a + 0.1), tag: 'SELAT MALAKA · 1513 M' }
    );
  } else if (id === 'malaka') {
    K.parchmentBg(g, { mood: 'warm' });
    K.panelFrame(g, 90, 440, 900, 820, { fill: '#e4d4b6', thick: 10 });
    K.archipelagoMap(g, 540, 860, 1.15, { prog: 0.6, t });

    K.comicBorder(ui);
    K.captionBox(
      ui,
      'JATUHNYA BANDAR MALAKA 1511',
      'Jalur Perdagangan Rempah Nusantara Terancam Monopoli',
      540,
      240,
      { a: K.pop(t, a + 0.1), tag: 'KRISIS JALUR REMPAH' }
    );
  } else if (id === 'jong') {
    K.parchmentBg(g, { mood: 'warm' });
    K.pendopo(g, 540, 1060, 1.15);
    K.warrior(g, 540, 1180, 1.5, { t, weapon: 'keris', capeCol: K.PAL.indigo, pose: 'oath' });

    K.comicBorder(ui);
    K.captionBox(
      ui,
      'ADIPATI UNUS DARI JEPARA',
      'Panglima Muda 25 Tahun Menyiapkan Armada Demak',
      540,
      240,
      { a: K.pop(t, a + 0.1), tag: 'BANDAR JEPARA & DEMAK' }
    );
  } else if (id === 'lapis') {
    K.parchmentBg(g, { mood: 'warm' });
    K.panelFrame(g, 90, 440, 900, 820, { fill: '#dfd0b4', thick: 10 });
    K.jongShip(g, 540, 1020, 1.55, { t });

    K.comicBorder(ui);
    K.captionBox(
      ui,
      'LAMBUNG LAPIS KAYU JATI',
      'Benteng Terapung Raksasa yang Tahan Hantaman Meriam',
      540,
      240,
      { a: K.pop(t, a + 0.1), tag: 'TEKNOLOGI JONG JAWA' }
    );
  } else if (id === 'berangkat') {
    K.parchmentBg(g, { mood: 'crimson' });
    K.inkSun(g, 800, 560, 160, { col: K.PAL.gold });
    K.waves(g, { y0: 1050, y1: 1500, t: t * 1.5 });
    for (let i = 0; i < 3; i++) {
      K.jongShip(g, 240 + i * 290, 1080 + (i % 2) * 55, 0.9 + (i === 1 ? 0.3 : 0), {
        t: t + i * 0.6,
      });
    }

    K.comicBorder(ui);
    K.captionBox(
      ui,
      '5.000 PRAJURIT NUSANTARA',
      'Berlayar Menyeberangi Selat Menuju Benteng Malaka',
      540,
      240,
      { a: K.pop(t, a + 0.1), tag: 'PELAYARAN AKBAR' }
    );
  } else if (id === 'meriam') {
    K.parchmentBg(g, { mood: 'crimson' });
    K.speedLines(g, 540, 960, { n: 34, r0: 220, r1: 980, t });
    K.waves(g, { y0: 1080, y1: 1500, t: t * 2 });
    K.jongShip(g, 540, 1080, 1.35, { t });

    K.comicBorder(ui);
    K.captionBox(
      ui,
      'PERTEMPURAN LAUT MALAKA',
      'Ketangguhan Jong Jawa Dicatat dalam Kronik Sejarah',
      540,
      240,
      { a: K.pop(t, a + 0.1), tag: 'KONTAK SENJATA 1513' }
    );
  } else if (id === 'gelar') {
    K.parchmentBg(g, { mood: 'warm' });
    K.inkSun(g, 540, 740, 220, { col: K.PAL.gold });
    K.candiBentar(g, 540, 1280, 1.3);
    K.warrior(g, 540, 1180, 1.55, { t, weapon: 'spear', capeCol: K.PAL.crimson, pose: 'oath' });

    K.comicBorder(ui);
    K.captionBox(
      ui,
      'PANGERAN SABRANG LOR',
      'Sang Pangeran Pemberani yang Menyeberangi Laut Utara',
      540,
      240,
      { a: K.pop(t, a + 0.1), tag: 'GELAR KEHORMATAN' }
    );
  } else {
    K.parchmentBg(g, { mood: 'warm' });
    K.inkSun(g, 540, 620, 180, { col: K.PAL.crimson });
    K.waves(g, { y0: 1060, y1: 1500, t });
    K.jongShip(g, 540, 1080, 1.4, { t });

    K.comicBorder(ui);
    K.captionBox(
      ui,
      'KEJAYAAN BAHARI NUSANTARA',
      'Warisan Keberanian dan Teknologi Perkapalan Samudra',
      540,
      240,
      { a: K.pop(t, a + 0.1), tag: 'EPILOG BAHARI' }
    );
  }

  P.paint(Math.floor((t * 24) / 2));
}

