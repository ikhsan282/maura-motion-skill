// Demo 3 — Apa yang Terjadi Saat Kamu Memesan Ojek Online? (Tiga Algoritma dalam Dua Detik)
// Product Film Light — Kanvas putih hangat + blob pastel, kartu UI mengapung, rute & paket data

import * as K from '/styles/product-light/kit.js';

const { clamp, lerp } = AM.lib;
const P = K.PAL;

export const meta = {
  fps: 24,
  hold: 1,
  captions: {
    preset: 'clean',
    y: 1478,
    size: 56,
    box: { fill: 'rgba(17,17,20,0.80)', pad: 20, radius: 28 },
  },
};

let bg, world, ui;

export async function setup(AM) {
  bg = AM.layer('bg');
  world = AM.layer('world');
  ui = AM.layer('ui');
}

function activeLine(t, AM) {
  let cur = AM.timeline.lines[0];
  for (let i = 0; i < AM.timeline.lines.length; i++) {
    const l = AM.timeline.lines[i];
    if (t >= l.start - 0.12) cur = l;
  }
  const dur = Math.max(0.2, cur.end - cur.start);
  const lt = Math.max(0, t - cur.start);
  const u = clamp(lt / dur, 0, 1);
  return { id: cur.id, u, lt, a: cur.start };
}

export function render(t, AM) {
  const { id, u, a } = activeLine(t, AM);

  K.stage(bg, t);
  world.setTransform(1, 0, 0, 1, 0, 0);
  ui.setTransform(1, 0, 0, 1, 0, 0);
  K.dotGrid(world, { color: 'rgba(17,17,20,0.06)' });

  if (id === 'hook') {
    K.eyebrow(ui, 'DI BALik SATU KETUKAN', 540, 155);
    K.headline(ui, t, a + 0.05, ['Satu tombol pesan,', '*tiga* algoritma bekerja.'], 540, 240, {
      size: 70,
    });

    K.card(world, 90, 540, 900, 560, { r: 42, elev: 1.25 });
    K.label(world, 'Lokasi Penjemputan', 160, 625, { size: 24, color: P.ink3 });
    K.label(world, 'Stasiun MRT Blok M', 160, 668, { size: 34, weight: 700 });
    K.label(world, 'Tujuan Perjalanan', 160, 755, { size: 24, color: P.ink3 });
    K.label(world, 'Menara Sudirman · 6,4 km', 160, 798, { size: 34, weight: 700 });

    K.chip(world, 540, 955, 'Pesan Sekarang · Rp18.000', {
      size: 32,
      fill: P.accent,
      color: '#FFFFFF',
      elev: 1.1,
    });
    const ptr = K.pointerAt(
      t,
      [
        [a, 760, 1080],
        [a + 0.45, 580, 965],
      ],
      [a + 0.55]
    );
    K.ripple(world, 580, 965, t - (a + 0.55), { color: P.accent, r: 90, ring: true });
    K.cursor(world, ptr.x, ptr.y, { press: ptr.press });
  } else if (id === 'titik') {
    K.eyebrow(ui, 'ALGORITMA 01 · GEOSPASIAL', 540, 155);
    K.headline(ui, t, a + 0.05, ['Peta dibagi menjadi', 'petak *heksagonal*.'], 540, 240, {
      size: 72,
    });

    K.card(world, 90, 530, 900, 580, { r: 42, elev: 1.2 });
    // Grid of circles/cells representing spatial indexing
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        const cx = 240 + c * 200 + (r % 2) * 45;
        const cy = 670 + r * 145;
        const isCenter = r === 1 && c === 1;
        world.fillStyle = isCenter ? P.accentSoft : '#F7F5F0';
        world.strokeStyle = isCenter ? P.accent : P.line;
        world.lineWidth = isCenter ? 4 : 2;
        world.beginPath();
        world.arc(cx, cy, 58, 0, Math.PI * 2);
        world.fill();
        world.stroke();
        if (isCenter) {
          K.ICON.user(world, cx, cy, 42, P.accent);
        }
      }
    }
    K.chip(world, 540, 1035, 'Indeks Geospasial H3 · Radius 1,5 km', {
      size: 26,
      fill: P.ink,
      color: '#fff',
    });
  } else if (id === 'harga') {
    K.eyebrow(ui, 'ALGORITMA 02 · TARIF DINAMIS', 540, 155);
    K.headline(ui, t, a + 0.05, ['Menghitung jarak,', 'cuaca, dan *permintaan*.'], 540, 240, {
      size: 70,
    });

    K.card(world, 90, 530, 900, 560, { r: 42, elev: 1.25 });
    K.label(world, 'Estimasi Tarif Perjalanan', 160, 625, { size: 26, color: P.ink3 });
    const price = K.count(t, a + 0.1, 0.9, 12000, 18000);
    K.label(world, K.fmtRp(price), 160, 695, { size: 64, weight: 700, color: P.ink });

    K.chip(world, 310, 830, 'Jarak: 6,4 km', { size: 26, fill: P.accentSoft, color: P.accent });
    K.chip(world, 730, 830, 'Waktu: 16 menit', { size: 26, fill: P.okSoft, color: P.ok });
    K.chip(world, 540, 955, 'Supply & Demand Seimbang (1,0x)', {
      size: 26,
      fill: '#F7F5F0',
      color: P.ink2,
    });
  } else if (id === 'radar') {
    K.eyebrow(ui, 'ALGORITMA 03 · MATCHMAKING', 540, 155);
    K.headline(ui, t, a + 0.05, ['Bukan sekadar', 'jarak *garis lurus*.'], 540, 240, {
      size: 74,
    });

    K.card(world, 90, 530, 900, 560, { r: 42, elev: 1.25 });
    K.ripple(world, 540, 810, (t * 0.8) % 0.6, { color: P.accent, r: 280, ring: true });
    K.chip(world, 540, 810, 'Titik Jemput', {
      size: 26,
      fill: P.accent,
      color: '#fff',
      icon: K.ICON.user,
      iconColor: '#fff',
    });

    K.chip(world, 280, 660, 'Mitra A · Terhalang Putar Balik', { size: 22, fill: '#fff' });
    K.chip(world, 760, 940, 'Mitra B · Searah Jalur Jalan', {
      size: 22,
      fill: P.okSoft,
      color: P.ok,
    });
  } else if (id === 'skor') {
    K.eyebrow(ui, 'PERHITUNGAN WAKTU TEMPUH NYATA', 540, 155);
    K.headline(ui, t, a + 0.05, ['Memilih waktu tiba', 'paling *cepat*.'], 540, 240, {
      size: 74,
    });

    const rows = [
      ['Mitra B · Searah Jalan Utama', 'ETA 2 mnt', 'Skor 98%', true],
      ['Mitra A · Harus Putar Balik', 'ETA 7 mnt', 'Skor 71%', false],
      ['Mitra C · Sedang Menepi', 'ETA 5 mnt', 'Skor 82%', false],
    ];
    rows.forEach(([name, eta, score, win], i) => {
      const ry = 530 + i * 190;
      K.card(world, 90, ry, 900, 165, {
        r: 34,
        elev: win ? 1.3 : 0.7,
        border: win ? P.ok : P.line,
        fill: win ? P.okSoft : '#fff',
      });
      K.label(world, name, 150, ry + 62, { size: 30, weight: 700 });
      K.label(world, eta, 150, ry + 112, { size: 26, color: win ? P.ok : P.ink2, weight: 700 });
      K.chip(world, 820, ry + 82, score, {
        size: 24,
        fill: win ? P.ok : P.ink,
        color: '#fff',
      });
    });
  } else if (id === 'terima') {
    K.eyebrow(ui, 'KONFIRMASI MITRA PENGEMUDI', 540, 155);
    K.headline(ui, t, a + 0.05, ['Pesanan diterima', 'dalam *dua* detik.'], 540, 240, {
      size: 74,
    });

    K.toast(world, 110, 560, 860, {
      title: 'Pengemudi Ditemukan · Menuju Lokasimu',
      body: 'Pak Rahmat · Honda Vario · B 4821 KXZ (★ 4.98)',
      icon: (c, x, y, s, col) => K.ICON.check(c, x, y, s, col, 1, 3),
      iconFill: P.ok,
      elev: 1.4,
    });

    K.card(world, 110, 760, 860, 320, { r: 38, elev: 1.1 });
    K.label(world, 'Tiba dalam 2 menit', 170, 845, { size: 38, weight: 700, color: P.ok });
    K.label(world, 'Pengemudi sedang melaju di Jl. Sultan Hasanuddin', 170, 905, {
      size: 25,
      color: P.ink2,
    });
    K.chip(world, 310, 995, 'Chat Pengemudi', { size: 24, fill: P.accentSoft, color: P.accent });
  } else if (id === 'rute') {
    K.eyebrow(ui, 'NAVIGASI & TELEMETRI REAL-TIME', 540, 155);
    K.headline(ui, t, a + 0.05, ['Dipandu rute', 'paling *efisien*.'], 540, 240, {
      size: 74,
    });

    K.card(world, 90, 530, 900, 560, { r: 42, elev: 1.25 });
    const R = [
      [200, 960],
      [420, 620],
      [660, 980],
      [880, 640],
    ];
    K.route(world, R, { p: 1, t, width: 6, color: 'rgba(79,70,229,0.35)' });
    K.trail(world, R, u, { len: 0.35, width: 14 });
    const [px, py] = K.bez(R, u);
    K.glow(world, px, py, 85, { a: 0.6 });
    K.chip(world, px, py, 'GPS · Aktif', {
      size: 24,
      fill: P.accent,
      color: '#fff',
      elev: 1.1,
    });
  } else {
    K.eyebrow(ui, 'ORKESTRASI TEKNOLOGI SEHARI-HARI', 540, 155);
    K.headline(ui, t, a + 0.05, ['Satu ketukan.', 'Tiga algoritma. *Sampai*.'], 540, 240, {
      size: 72,
      accent: P.ok,
    });

    K.card(world, 110, 550, 860, 520, { r: 42, elev: 1.3 });
    K.chip(world, 540, 670, '1 · Pemetaan Geospasial Heksagonal', {
      size: 28,
      fill: P.accentSoft,
      color: P.accent,
    });
    K.chip(world, 540, 800, '2 · Kalkulasi Tarif & Permintaan Real-Time', {
      size: 28,
      fill: P.accentSoft,
      color: P.accent,
    });
    K.chip(world, 540, 930, '3 · Pencocokan Waktu Tempuh Tercepat', {
      size: 28,
      fill: P.okSoft,
      color: P.ok,
    });
  }
}

