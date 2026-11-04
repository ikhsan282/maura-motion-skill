// Demo 2 — Bagaimana Pelangi Muncul Selepas Hujan? (Tetes Air sebagai Prisma)
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

  if (id === 'hook') {
    K.sky(g, { mode: 'day' });
    K.rainbow(g, 540, 1180, 460, { prog: K.clamp(u * 1.35, 0.25, 1) });
    K.sun(g, 200, 440, 80, { t });
    K.clouds(g, t, { y: 460, n: 3 });
    K.hills(g, { y: 1160, colFar: '#88b878', colNear: '#5e9658' });
    K.childWithShadow(g, 540, 1210, 1.2, { t, shadowLen: 140, shadowDir: 1 });

    K.crayonBorder(ui);
    K.title(ui, 'BAGAIMANA PELANGI MUNCUL?', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 48,
      sub: 'Lukisan Tujuh Warna Selepas Hujan Sore',
    });
  } else if (id === 'putih') {
    K.sky(g, { mode: 'day' });
    K.sun(g, 240, 560, 115, { t });
    K.prismDrop(g, 640, 860, 175, { prog: u });
    K.hills(g, { y: 1240, colFar: '#88b878', colNear: '#5e9658' });

    K.crayonBorder(ui);
    K.title(ui, 'RAHASIA CAHAYA PUTIH', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 50,
      sub: 'Sinar Matahari Menyimpan Seluruh Spektrum Warna',
    });
  } else if (id === 'tetes') {
    K.sky(g, { mode: 'rain' });
    K.clouds(g, t, { y: 420, n: 4, dark: true });
    K.rain(g, t, { n: 40 });
    K.sun(g, 200, 450, 85, { t });
    K.hills(g, { y: 1180, colFar: '#7a9e7e', colNear: '#527a58' });

    K.crayonBorder(ui);
    K.title(ui, 'JUTAAN PRISMA AIR HUJAN', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 48,
      sub: 'Butiran Air Melayang di Udara Selepas Hujan',
    });
  } else if (id === 'bias') {
    K.sky(g, { mode: 'rain' });
    K.prismDrop(g, 580, 880, 210, { prog: K.lerp(0.15, 0.55, u) });
    K.hills(g, { y: 1260, colFar: '#7a9e7e', colNear: '#527a58' });

    K.crayonBorder(ui);
    K.title(ui, '1. PEMBIASAN (REFRAKSI)', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 50,
      sub: 'Cahaya Melambat dan Berbelok Saat Masuk ke Air',
    });
  } else if (id === 'pantul') {
    K.sky(g, { mode: 'rain' });
    K.prismDrop(g, 580, 880, 215, { prog: K.lerp(0.5, 1.0, u) });
    K.hills(g, { y: 1260, colFar: '#7a9e7e', colNear: '#527a58' });

    K.crayonBorder(ui);
    K.title(ui, '2. PANTULAN SUDUT 42 DERAJAT', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 46,
      sub: 'Memantul di Dinding Belakang Tetesan Menuju Mata',
    });
  } else if (id === 'spektrum') {
    K.sky(g, { mode: 'day' });
    K.rainbow(g, 540, 1220, 480, { prog: 1 });
    K.hills(g, { y: 1220, colFar: '#88b878', colNear: '#5e9658' });

    K.crayonBorder(ui);
    K.title(ui, 'ME-JI-KU-HI-BI-NI-U', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 50,
      sub: 'Merah di Paling Atas, Ungu Dibelokkan Paling Bawah',
    });
  } else if (id === 'busur') {
    K.sky(g, { mode: 'day' });
    K.rainbow(g, 540, 1180, 460, { prog: u });
    K.hills(g, { y: 1180, colFar: '#88b878', colNear: '#5e9658' });
    K.childWithShadow(g, 540, 1220, 1.15, { t, shadowLen: 120, shadowDir: 1 });

    K.crayonBorder(ui);
    K.title(ui, 'KENAPA BENTUKNYA MELENGKUNG?', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 44,
      sub: 'Kerucut Sudut Pandang 42 Derajat dari Mata Kita',
    });
  } else {
    K.sky(g, { mode: 'day' });
    K.sun(g, 190, 450, 90, { t });
    K.rainbow(g, 560, 1180, 450, { prog: 1 });
    K.clouds(g, t, { y: 440, n: 3 });
    K.hills(g, { y: 1160, colFar: '#88b878', colNear: '#5e9658' });
    K.houseRow(g, { y: 1190, scroll: 0, n: 2 });
    K.childWithShadow(g, 420, 1215, 1.2, { t, shadowLen: 160, shadowDir: 1 });

    K.crayonBorder(ui);
    K.title(ui, 'BERDIRI MEMBELAKANGI MATAHARI', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 44,
      sub: 'Cahaya di Belakangmu, Tirai Hujan di Depanmu',
    });
  }

  P.paint(Math.floor((t * 24) / 2));
}

