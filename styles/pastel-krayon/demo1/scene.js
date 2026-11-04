// Demo 1 — Kenapa Bulan Selalu Mengikuti Kita di Jalan Malam? (Ilusi Paralaks)
// Pastel & Krayon — Arsiran pastel kapur dan krayon di kertas gambar bertekstur ('pastel' paint pass)

import * as K from '/styles/pastel-krayon/kit.js';

export const meta = {
  fps: 24,
  hold: 2,
  captions: { preset: 'kids', y: 1470, size: 64 },
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
  const g = K.view(P, { x: 540, y: 960, z: 1.0 + 0.03 * Math.sin(u * Math.PI) });
  ui.clearRect(0, 0, 1080, 1920);

  K.sky(g, { mode: 'night' });
  K.stars(g, t, 30);

  if (id === 'hook') {
    K.moon(g, 760, 460, 105, { glow: 1 });
    K.hills(g, { y: 1120 });
    K.treeRow(g, { y: 1210, scroll: t * 240, n: 5 });
    K.road(g, { y: 1240, scroll: t * 420 });
    K.familyCar(g, 420, 1290, 1.15, { t });

    K.crayonBorder(ui);
    K.title(ui, 'KENAPA BULAN MENGIKUTI KITA?', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 46,
      sub: 'Pertanyaan Masa Kecil dari Jendela Mobil Malam',
    });
  } else if (id === 'mobil') {
    K.moon(g, 740, 450, 110, { glow: 1.1 });
    K.hills(g, { y: 1120 });
    K.houseRow(g, { y: 1200, scroll: t * 320, n: 3 });
    K.road(g, { y: 1240, scroll: t * 520 });
    K.familyCar(g, 480 + Math.sin(t * 1.5) * 45, 1290, 1.18, { t });

    K.crayonBorder(ui);
    K.title(ui, 'SETIA DI ATAS ATAP MOBIL', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 48,
      sub: 'Mobil Melaju Kencang, Bulan Tak Pernah Tertinggal',
    });
  } else if (id === 'cepat') {
    K.moon(g, 760, 440, 95, { glow: 0.9 });
    K.hills(g, { y: 1120 });
    K.houseRow(g, { y: 1190, scroll: t * 620, n: 4 });
    K.treeRow(g, { y: 1230, scroll: t * 880, n: 6, scale: 1.15 });
    K.road(g, { y: 1250, scroll: t * 960 });
    K.familyCar(g, 440, 1300, 1.1, { t });

    K.crayonBorder(ui);
    K.title(ui, 'POHON & RUMAH LEWAT CEPAT', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 46,
      sub: 'Benda di Pinggir Jalan Berkelebatan ke Belakang',
    });
  } else if (id === 'bulan') {
    K.moon(g, 540, 560, 135, { glow: 1.2 });
    K.hills(g, { y: 1160 });
    K.road(g, { y: 1260, scroll: t * 360 });
    K.familyCar(g, 540, 1300, 1.12, { t });
    K.parallaxRays(g, { carX: 540, carY: 1300, moonX: 540, moonY: 560 });

    K.crayonBorder(ui);
    K.title(ui, 'RAHASIA EFEK PARALAKS', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 50,
      sub: 'Trik Penglihatan dari Sudut Pandang yang Bergerak',
    });
  } else if (id === 'paralaks') {
    const carX = K.lerp(240, 820, u);
    K.moon(g, 540, 440, 95, { glow: 1 });
    K.hills(g, { y: 1140 });
    K.treeRow(g, { y: 1180, scroll: 0, n: 3, scale: 1.2 });
    K.road(g, { y: 1250, scroll: 0 });
    K.familyCar(g, carX, 1300, 1.05, { t });
    K.parallaxRays(g, {
      carX,
      carY: 1300,
      moonX: 540,
      moonY: 440,
      nearX: 540,
      nearY: 1040,
    });

    K.crayonBorder(ui);
    K.title(ui, 'DEKAT VS JAUH DARI MATA', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 48,
      sub: 'Semakin Dekat Benda, Semakin Cepat Sudutnya Berubah',
    });
  } else if (id === 'jarak') {
    K.moon(g, 540, 460, 125, { glow: 1.15 });
    K.hills(g, { y: 1180 });
    K.road(g, { y: 1270, scroll: t * 300 });
    K.familyCar(g, 540, 1310, 1.0, { t });
    K.parallaxRays(g, { carX: 540, carY: 1310, moonX: 540, moonY: 460 });

    K.crayonBorder(ui);
    K.title(ui, 'JARAK 384.400 KILOMETER', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 48,
      sub: 'Pohon Hanya Beberapa Meter, Bulan di Luar Angkasa',
    });
  } else if (id === 'sudut') {
    K.moon(g, 540, 430, 105, { glow: 1.0 });
    K.hills(g, { y: 1150 });
    K.road(g, { y: 1250, scroll: 0 });

    // Two car positions showing nearly parallel sightlines to the Moon
    K.familyCar(g, 260, 1295, 0.9, { t });
    K.familyCar(g, 820, 1295, 0.9, { t });
    K.parallaxRays(g, { carX: 260, carY: 1295, moonX: 540, moonY: 430 });
    K.parallaxRays(g, { carX: 820, carY: 1295, moonX: 540, moonY: 430 });

    K.crayonBorder(ui);
    K.title(ui, 'SUDUT PANDANG HAMPIR TETAP', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 46,
      sub: 'Garis Pandang ke Bulan Nyaris Tidak Berubah',
    });
  } else {
    K.moon(g, 750, 450, 115, { glow: 1.15 });
    K.hills(g, { y: 1120 });
    K.houseRow(g, { y: 1190, scroll: t * 220, n: 3 });
    K.treeRow(g, { y: 1210, scroll: t * 320, n: 5 });
    K.road(g, { y: 1240, scroll: t * 400 });
    K.familyCar(g, 460, 1290, 1.18, { t });

    K.crayonBorder(ui);
    K.title(ui, 'TEMAN PERJALANAN PULANG', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 48,
      sub: 'Ilusi Sains yang Menemani Kenangan Masa Kecil',
    });
  }

  P.paint(Math.floor((t * 24) / 2));
}

