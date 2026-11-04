// Demo 3 — Ke Mana Perginya Bayanganmu Saat Tengah Hari? (Cahaya & Jam Matahari)
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

  K.sky(g, { mode: 'day' });
  K.clouds(g, t, { y: 460, n: 3 });
  K.hills(g, { y: 1140, colFar: '#8ab874', colNear: '#629858' });

  if (id === 'hook') {
    const sweep = Math.sin(t * 1.5);
    K.sun(g, 540 - sweep * 280, 480 + Math.abs(sweep) * 140, 95, { t });
    K.childWithShadow(g, 540, 1180, 1.3, {
      t,
      shadowLen: Math.abs(sweep) * 280 + 40,
      shadowDir: sweep >= 0 ? 1 : -1,
    });

    K.crayonBorder(ui);
    K.title(ui, 'KE MANA PERGINYA BAYANGANMU?', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 44,
      sub: 'Raksasa di Pagi Hari, Menyusut di Tengah Hari',
    });
  } else if (id === 'cahaya') {
    K.sun(g, 200, 520, 100, { t });
    K.childWithShadow(g, 540, 1180, 1.3, { t, shadowLen: 260, shadowDir: 1 });
    K.parallaxRays(g, {
      carX: 540,
      carY: 1120,
      moonX: 200,
      moonY: 520,
      nearX: 800,
      nearY: 1260,
    });

    K.crayonBorder(ui);
    K.title(ui, 'CAHAYA MERAMBAT LURUS', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 48,
      sub: 'Tubuh Menghalangi Sinar, Menciptakan Siluet Gelap',
    });
  } else if (id === 'pagi') {
    K.sun(g, 880, 680, 95, { t });
    K.treeRow(g, { y: 1150, scroll: 0, n: 3, scale: 0.9 });
    K.childWithShadow(g, 600, 1180, 1.3, { t, shadowLen: 320, shadowDir: -1 });

    K.crayonBorder(ui);
    K.title(ui, 'PAGI HARI (UFUK TIMUR)', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 48,
      sub: 'Sudut Matahari Rendah, Bayangan Panjang ke Barat',
    });
  } else if (id === 'siang') {
    K.sun(g, 540, 390, 110, { t });
    K.childWithShadow(g, 540, 1180, 1.35, { t, shadowLen: 35, shadowDir: 1 });

    K.crayonBorder(ui);
    K.title(ui, 'TENGAH HARI (12.00 SIANG)', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 48,
      sub: 'Matahari Tepat di Atas Kepala, Bayangan di Bawah Kaki',
    });
  } else if (id === 'sore') {
    K.sun(g, 200, 680, 95, { t });
    K.treeRow(g, { y: 1150, scroll: 0, n: 3, scale: 0.9 });
    K.childWithShadow(g, 460, 1180, 1.3, { t, shadowLen: 320, shadowDir: 1 });

    K.crayonBorder(ui);
    K.title(ui, 'SORE HARI (UFUK BARAT)', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 48,
      sub: 'Matahari Merendah, Bayangan Memanjang ke Timur',
    });
  } else if (id === 'malam') {
    K.sun(g, K.lerp(860, 220, u), 440 + Math.pow(u - 0.5, 2) * 420, 85, { t });

    // Sundial disk on the hill
    g.fillStyle = '#e8d7b4';
    g.beginPath();
    g.ellipse(540, 1220, 240, 110, 0, 0, K.TAU);
    g.fill();
    g.strokeStyle = '#6e4c30';
    g.lineWidth = 8;
    g.stroke();

    // Gnomon + rotating shadow
    const ang = K.lerp(Math.PI * 1.15, Math.PI * 1.85, u);
    g.strokeStyle = '#3a3042';
    g.lineWidth = 12;
    g.beginPath();
    g.moveTo(540, 1220);
    g.lineTo(540 + Math.cos(ang) * 190, 1220 + Math.sin(ang) * 85);
    g.stroke();
    g.fillStyle = '#c45b4a';
    g.fillRect(530, 1120, 20, 100);

    K.crayonBorder(ui);
    K.title(ui, 'JAM MATAHARI (SUNDIAL)', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 48,
      sub: 'Membaca Waktu dari Arah Pergeseran Bayangan',
    });
  } else if (id === 'ukuran') {
    const sunX = K.lerp(860, 220, u);
    const sunY = 420 + Math.pow(u - 0.5, 2) * 520;
    const shLen = (u - 0.5) * 620;
    K.sun(g, sunX, sunY, 95, { t });
    K.childWithShadow(g, 540, 1180, 1.3, {
      t,
      shadowLen: Math.abs(shLen) + 35,
      shadowDir: shLen >= 0 ? 1 : -1,
    });

    K.crayonBorder(ui);
    K.title(ui, 'MENGIKUTI ROTASI BUMI', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 48,
      sub: 'Panjang Bayangan Berubah Sesuai Sudut Datang Sinar',
    });
  } else {
    K.sun(g, 240, 480, 95, { t });
    K.houseRow(g, { y: 1150, scroll: 0, n: 2 });
    K.treeRow(g, { y: 1160, scroll: 0, n: 4, scale: 0.95 });
    K.childWithShadow(g, 540, 1190, 1.3, { t, shadowLen: 220, shadowDir: 1 });

    K.crayonBorder(ui);
    K.title(ui, 'JAM ALAMI DI BAWAH KAKIMU', 540, 230, {
      a: K.pop(t, a + 0.1),
      size: 48,
      sub: 'Sains Cahaya yang Selalu Menemani Langkahmu',
    });
  }

  P.paint(Math.floor((t * 24) / 2));
}

