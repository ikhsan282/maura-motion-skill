// Demo 2 — Rahasia Kode OTP Enam Angka (Time-Based One-Time Password)
// Product Film Light — Kanvas putih hangat + blob pastel, kartu UI mengapung, kamera Screen Studio

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
  let idx = 0;
  for (let i = 0; i < AM.timeline.lines.length; i++) {
    const l = AM.timeline.lines[i];
    if (t >= l.start - 0.12) {
      cur = l;
      idx = i;
    }
  }
  const dur = Math.max(0.2, cur.end - cur.start);
  const lt = Math.max(0, t - cur.start);
  const u = clamp(lt / dur, 0, 1);
  return { id: cur.id, u, lt, a: cur.start, idx };
}

function drawOtpBoxes(ctx, x, y, digits, { activeIdx = -1, ok = false } = {}) {
  const bw = 96,
    bh = 118,
    gap = 18;
  const totalW = 6 * bw + 5 * gap;
  const startX = x - totalW / 2;

  for (let i = 0; i < 6; i++) {
    const bx = startX + i * (bw + gap);
    const isAct = i === activeIdx;
    K.card(ctx, bx, y, bw, bh, {
      r: 24,
      elev: isAct ? 1.2 : 0.6,
      border: ok ? P.ok : isAct ? P.accent : P.line,
      fill: ok ? P.okSoft : '#FFFFFF',
    });
    if (digits[i] != null && digits[i] !== '') {
      K.label(ctx, String(digits[i]), bx + bw / 2, y + bh / 2 + 2, {
        size: 52,
        weight: 700,
        align: 'center',
        color: ok ? P.ok : P.ink,
      });
    }
  }
}

export function render(t, AM) {
  const { id, u, a } = activeLine(t, AM);

  K.stage(bg, t);
  world.setTransform(1, 0, 0, 1, 0, 0);
  ui.setTransform(1, 0, 0, 1, 0, 0);
  K.dotGrid(world, { color: 'rgba(17,17,20,0.06)' });

  if (id === 'hook') {
    K.eyebrow(ui, 'KEAMANAN DIGITAL · 2FA', 540, 155);
    K.headline(ui, t, a + 0.05, ['Kode *enam* angka', 'yang berumur 30 detik.'], 540, 240, {
      size: 74,
    });

    const p = K.sp(t, a + 0.1, 0.6, 0.7);
    world.save();
    K.popIn(world, 540, 880, p);
    K.card(world, 90, 560, 900, 560, { r: 42, elev: 1.3 });
    K.ICON.shield(world, 175, 650, 64, P.accent);
    K.label(world, 'Kode Verifikasi OTP', 235, 636, { size: 36, weight: 700 });
    K.label(world, 'Jangan berikan kode ini kepada siapa pun', 235, 682, {
      size: 24,
      color: P.ink2,
    });

    drawOtpBoxes(world, 540, 770, ['4', '8', '2', '9', '1', '6'], { activeIdx: 5 });

    const rem = Math.max(1, Math.ceil(30 - u * 25));
    K.chip(world, 540, 1015, `Kedaluwarsa dalam 00:${String(rem).padStart(2, '0')}`, {
      size: 28,
      fill: P.accentSoft,
      color: P.accent,
      elev: 0.5,
    });
    world.restore();
  } else if (id === 'login') {
    K.eyebrow(ui, 'MENGAPA KATA SANDI TIDAK CUKUP?', 540, 155);
    K.headline(ui, t, a + 0.05, ['Sandi tetap bisa *bocor*,', 'OTP selalu berubah.'], 540, 240, {
      size: 70,
    });

    K.phone(
      world,
      540,
      930,
      1.05,
      (g) => {
        K.label(g, 'Masuk ke Akun', 195, 130, { size: 28, weight: 700, align: 'center' });
        K.card(g, 32, 200, 326, 74, { r: 18, elev: 0.4 });
        K.label(g, 'budi@email.id', 56, 237, { size: 19, color: P.ink2 });

        K.card(g, 32, 296, 326, 74, { r: 18, elev: 0.4 });
        K.label(g, '••••••••••••', 56, 335, { size: 24, weight: 700 });

        K.card(g, 32, 415, 326, 155, { r: 24, fill: P.accentSoft, border: P.accent, elev: 0.8 });
        K.ICON.lock(g, 76, 470, 36, P.accent);
        K.label(g, 'Verifikasi 2 Langkah', 112, 456, { size: 19, weight: 700, color: P.accent });
        K.label(g, 'Menunggu 6 digit OTP...', 112, 492, { size: 16, color: P.ink2 });
      },
      { elev: 1.3 }
    );
  } else if (id === 'server') {
    K.eyebrow(ui, 'ALGORITMA TOTP (RFC 6238)', 540, 155);
    K.headline(ui, t, a + 0.05, ['Kunci rahasia + *waktu*', 'detik ini juga.'], 540, 240, {
      size: 74,
    });

    K.card(world, 110, 520, 860, 220, { r: 36, elev: 1.1 });
    K.ICON.lock(world, 195, 630, 56, P.accent);
    K.label(world, '1. Kunci Rahasia Unik (Secret Key)', 260, 602, { size: 32, weight: 700 });
    K.label(world, 'JBSWY3DPEHPK3PXP · Hanya diketahui server & HP-mu', 260, 652, {
      size: 24,
      color: P.ink2,
    });

    K.card(world, 110, 800, 860, 220, { r: 36, elev: 1.1 });
    K.ICON.calendar(world, 195, 910, 56, P.ok);
    K.label(world, '2. Stempel Waktu (Unix Timestamp ÷ 30)', 260, 882, { size: 32, weight: 700 });
    const counter = 59793472 + Math.floor(t);
    K.label(world, `Blok Waktu #${counter}`, 260, 932, {
      size: 30,
      weight: 700,
      color: P.accent,
    });
  } else if (id === 'waktu') {
    K.eyebrow(ui, 'FUNGSI HASH KRIPTOGRAFI', 540, 155);
    K.headline(ui, t, a + 0.05, ['Diperas menjadi', '*enam* digit acak.'], 540, 240, {
      size: 76,
    });

    K.card(world, 90, 540, 900, 540, { r: 42, elev: 1.25 });
    K.chip(world, 540, 640, 'HMAC-SHA1 (Kunci + Waktu)', {
      size: 28,
      fill: P.accentSoft,
      color: P.accent,
      elev: 0.6,
    });
    K.label(world, 'a94a8fe5ccb19ba61c4c0873d391e987982fbbd3', 540, 740, {
      size: 26,
      color: P.ink3,
      align: 'center',
    });

    drawOtpBoxes(world, 540, 830, ['7', '3', '9', '2', '0', '4'], { activeIdx: 5 });
    K.label(world, 'Dynamic Truncation → 6 Angka Unik', 540, 1015, {
      size: 26,
      weight: 700,
      color: P.ok,
      align: 'center',
    });
  } else if (id === 'kirim') {
    K.eyebrow(ui, 'PENGIRIMAN INSTAN', 540, 155);
    K.headline(ui, t, a + 0.05, ['Masuk ke ponsel', 'di *genggamanmu*.'], 540, 240, {
      size: 76,
    });

    K.phone(
      world,
      540,
      940,
      1.05,
      (g) => {
        K.label(g, 'Verifikasi Masuk', 195, 220, { size: 26, weight: 700, align: 'center' });
        K.label(g, 'Masukkan 6 digit kode yang baru dikirim', 195, 260, {
          size: 16,
          color: P.ink2,
          align: 'center',
        });
      },
      { elev: 1.25 }
    );

    const tp = K.sp(t, a + 0.15, 0.55, 0.65);
    world.save();
    K.popIn(world, 540, 620, tp);
    K.toast(world, 150, 545, 780, {
      title: 'Pesan Keamanan · Sekarang',
      body: 'Kode OTP Anda: 739 204 (Berlaku 30 dtk)',
      icon: K.ICON.bell,
      iconFill: P.accent,
      elev: 1.5,
    });
    world.restore();
  } else if (id === 'ketik') {
    K.eyebrow(ui, ' SINKRONISASI SERVER', 540, 155);
    K.headline(ui, t, a + 0.05, ['Dicocokkan pada', '*detik* yang sama.'], 540, 240, {
      size: 76,
    });

    const typedCount = Math.min(6, Math.floor(u * 8));
    const full = ['7', '3', '9', '2', '0', '4'];
    const shown = full.map((d, i) => (i < typedCount ? d : ''));

    K.card(world, 90, 550, 900, 520, { r: 42, elev: 1.25 });
    K.label(world, 'Masukkan Kode OTP', 540, 645, {
      size: 36,
      weight: 700,
      align: 'center',
    });
    drawOtpBoxes(world, 540, 725, shown, {
      activeIdx: Math.min(5, typedCount),
      ok: typedCount === 6,
    });

    if (typedCount >= 6) {
      K.chip(world, 540, 955, 'Kode Cocok · Identitas Terverifikasi', {
        size: 28,
        fill: P.okSoft,
        color: P.ok,
        icon: (c, x, y, s, col) => K.ICON.check(c, x, y, s, col, 1, 3),
      });
    }
  } else if (id === 'hangus') {
    K.eyebrow(ui, 'ROTASI OTOMATIS 30 DETIK', 540, 155);
    K.headline(ui, t, a + 0.05, ['Waktu habis,', 'kode *berganti* baru.'], 540, 240, {
      size: 76,
    });

    const rolled = u > 0.45;
    K.card(world, 90, 540, 900, 540, { r: 42, elev: 1.25 });
    K.label(
      world,
      rolled ? 'Jendela Waktu Baru (00:30)' : 'Jendela Waktu Habis (00:00)',
      540,
      645,
      {
        size: 34,
        weight: 700,
        color: rolled ? P.ok : P.warn,
        align: 'center',
      }
    );

    drawOtpBoxes(
      world,
      540,
      735,
      rolled ? ['5', '1', '8', '4', '9', '2'] : ['7', '3', '9', '2', '0', '4'],
      { ok: rolled }
    );
    K.label(
      world,
      rolled
        ? 'Kode lama (739204) otomatis hangus & tidak bisa dipakai lagi'
        : 'Meretas kode lama percuma karena masa berlakunya habis',
      540,
      965,
      { size: 25, color: P.ink2, align: 'center' }
    );
  } else {
    K.eyebrow(ui, 'PERLINDUNGAN DUA LAPIS', 540, 155);
    K.headline(ui, t, a + 0.05, ['Enam angka singkat,', 'akunmu *aman*.'], 540, 240, {
      size: 78,
      accent: P.ok,
    });

    K.card(world, 140, 560, 800, 500, { r: 44, elev: 1.3 });
    world.fillStyle = P.okSoft;
    world.beginPath();
    world.arc(540, 735, 86, 0, Math.PI * 2);
    world.fill();
    K.ICON.shield(world, 540, 735, 96, P.ok);
    K.label(world, 'Akses Terlindungi', 540, 895, { size: 42, weight: 700, align: 'center' });
    K.label(world, 'Kunci Rahasia · Sinkronisasi Waktu · Sekali Pakai', 540, 955, {
      size: 26,
      color: P.ink2,
      align: 'center',
    });
  }
}

