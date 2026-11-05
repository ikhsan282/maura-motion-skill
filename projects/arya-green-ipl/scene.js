// One-Shape UI Morph — Arya Green IPL
// Sistem Manajemen IPL & Transparansi Lingkungan Modern
import * as K from '/styles/ui-morph/kit.js';
import { clamp, lerp, ease, TAU } from '/engine/lib/core.js';
import { roundRect } from '/engine/lib/draw.js';

const P = K.PAL;

export const meta = {
  fps: 24,
  hold: 1.2,
  captions: {
    preset: 'clean',
    y: 1540,
    size: 50,
    box: { fill: 'rgba(14,14,16,0.88)', pad: 20, radius: 26 },
  },
};

let ctx;
const C = {};
const CX = 540, CY = 840;

const SH = {
  manual_book: { x: CX, y: CY, w: 760, h: 480, r: 44, elev: 1.2, color: '#161517' },
  brand_pill:  { x: CX, y: CY, w: 740, h: 260, r: 130, elev: 1.5, color: '#0E0E10' },
  tagihan:     { x: CX, y: CY, w: 780, h: 630, r: 46, elev: 1.4, color: '#0E0E10' },
  qris:        { x: CX, y: CY, w: 760, h: 650, r: 48, elev: 1.6, color: '#0E0E10' },
  kas:         { x: CX, y: CY, w: 820, h: 580, r: 42, elev: 1.4, color: '#0E0E10' },
  botwa:       { x: CX, y: CY, w: 800, h: 680, r: 50, elev: 1.5, color: '#0E0E10' },
  bendahara:   { x: CX, y: CY, w: 820, h: 580, r: 44, elev: 1.5, color: '#0E0E10' },
  kuis:        { x: CX, y: CY, w: 800, h: 640, r: 48, elev: 1.5, color: '#0E0E10' },
  jawaban:     { x: CX, y: CY, w: 780, h: 540, r: 52, elev: 1.6, color: '#0E0E10' },
};

let STATES = [], CLICKS = [], PTR = [], STEPS = [];
const TT = {};

export async function setup(AM) {
  ctx = AM.layer('stage');
  for (const l of AM.timeline.lines) C[l.id] = l;

  const T = {
    hook: C.hook.start,
    brand: C.hook.start + 4.8,
    tagihan: C.tagihan.start,
    qris: C.qris.start,
    qris_pay: C.qris.start + 4.2,
    kas: C.kas.start,
    botwa: C.botwa.start,
    botwa_click: C.botwa.start + 5.5,
    bendahara: C.bendahara.start,
    excel_click: C.bendahara.start + 5.0,
    kuis: C.kuis.start,
    jawaban: C.jawaban.start,
    ans_click: C.jawaban.start + 0.5,
  };
  Object.assign(TT, T);

  const st = (t, k) => [t, { ...SH[k] }, k];
  STATES = [
    st(0, 'manual_book'),
    st(T.brand, 'brand_pill'),
    st(T.tagihan, 'tagihan'),
    st(T.qris, 'qris'),
    st(T.kas, 'kas'),
    st(T.botwa, 'botwa'),
    st(T.bendahara, 'bendahara'),
    st(T.kuis, 'kuis'),
    st(T.jawaban, 'jawaban'),
  ];

  CLICKS = [
    T.brand + 0.1,
    T.qris_pay,
    T.botwa_click,
    T.excel_click,
    T.ans_click,
  ];

  PTR = [
    [0, 960, 1340],
    [T.brand - 0.4, CX + 180, CY + 50],
    [T.tagihan + 0.5, CX + 220, CY - 120],
    [T.qris_pay - 0.5, CX + 160, CY + 220],
    [T.qris_pay + 0.8, 860, 1100],
    [T.kas + 0.5, CX - 100, CY - 80],
    [T.botwa_click - 0.5, CX + 120, CY + 130],
    [T.botwa_click + 0.8, 880, 1150],
    [T.excel_click - 0.5, CX + 180, CY + 140],
    [T.excel_click + 0.8, 840, 1100],
    [T.kuis + 1.0, CX, CY + 170],
    [T.ans_click - 0.3, CX + 80, CY + 175],
    [T.ans_click + 0.8, 920, 1260],
  ];

  STEPS = [
    [0, 'Metode Manual RT'],
    [T.brand, 'Arya Green IPL'],
    [T.tagihan, 'Tagihan Otomatis'],
    [T.qris, 'QRIS Bebas Biaya'],
    [T.kas, 'Buku Kas Real-Time'],
    [T.botwa, 'Bot AI WhatsApp'],
    [T.bendahara, 'Portal Bendahara'],
    [T.kuis, 'Kuis Transparansi'],
    [T.jawaban, 'Solusi Modern'],
  ];

  AM.sfx('click', T.brand + 0.1, { gain: 0.5 });
  AM.sfx('click', T.qris_pay, { gain: 0.55 });
  AM.sfx('ding', T.qris_pay + 0.25, { gain: 0.5 });
  AM.sfx('pop', T.kas + 0.2, { gain: 0.4 });
  AM.sfx('click', T.botwa_click, { gain: 0.45 });
  AM.sfx('click', T.excel_click, { gain: 0.55 });
  AM.sfx('ding', T.excel_click + 0.2, { gain: 0.45 });
  AM.sfx('click', T.ans_click, { gain: 0.6 });
  AM.sfx('sparkle', T.ans_click + 0.25, { gain: 0.5 });
}

function drawQrCode(ctx, x, y, size) {
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, x - size / 2, y - size / 2, size, size, 16);
  ctx.fill();

  ctx.fillStyle = '#0E0E10';
  const drawFinder = (fx, fy, s) => {
    ctx.fillRect(fx, fy, s, s);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(fx + 6, fy + 6, s - 12, s - 12);
    ctx.fillStyle = '#0E0E10';
    ctx.fillRect(fx + 12, fy + 12, s - 24, s - 24);
  };
  const pad = 14;
  const fsize = 44;
  drawFinder(x - size / 2 + pad, y - size / 2 + pad, fsize);
  drawFinder(x + size / 2 - pad - fsize, y - size / 2 + pad, fsize);
  drawFinder(x - size / 2 + pad, y + size / 2 - pad - fsize, fsize);

  // Micro bits
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c * 3) % 4 === 1 || (r * c) % 5 === 2) {
        ctx.fillRect(x - 36 + c * 9, y - 36 + r * 9, 7, 7);
      }
    }
  }

  // Center QRIS badge
  ctx.fillStyle = '#EF4444';
  roundRect(ctx, x - 26, y - 12, 52, 24, 6);
  ctx.fill();
  K.label(ctx, 'QRIS', x, y, { size: 13, weight: 800, color: '#FFFFFF', spacing: 1 });
  ctx.restore();
}

function content(kind, s, t, t0, t1) {
  const short = t1 - t0 < 0.6;
  const E = K.swap(t, t0 + (short ? 0.04 : 0.1), t1, short ? { inDur: 0.09, outDur: 0.07, roll: 14 } : {});
  if (E.a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= E.a;
  ctx.translate(0, E.dy);
  roundRect(ctx, s.x - s.w / 2, s.y - s.h / 2 - E.dy, s.w, s.h, s.r);
  ctx.clip();
  const x = s.x, y = s.y;

  if (kind === 'manual_book') {
    // Red badge
    ctx.fillStyle = 'rgba(239, 68, 68, 0.18)';
    roundRect(ctx, x - 180, y - 190, 360, 42, 21);
    ctx.fill();
    K.label(ctx, '⚠ SISTEM IURAN LAMA', x, y - 169, { size: 22, weight: 700, color: '#F87171', font: K.FONT.mono, spacing: 1 });

    K.label(ctx, 'Buku Tulis Kusut & Catatan Fisik', x, y - 95, { size: 36, weight: 700, color: '#FFFFFF' });

    const painPoints = [
      '✗ Bukti transfer numpuk & tenggelam di chat',
      '✗ Sulit melacak siapa yang belum bayar',
      '✗ Dicurigai warga karena laporan tidak rapi',
    ];
    painPoints.forEach((txt, i) => {
      const yy = y - 20 + i * 54;
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      roundRect(ctx, x - 320, yy - 22, 640, 44, 12);
      ctx.fill();
      K.label(ctx, txt, x - 300, yy, { size: 24, weight: 500, color: 'rgba(255,255,255,0.7)', align: 'left', spacing: 0 });
    });
  } else if (kind === 'brand_pill') {
    // Brand pill transition
    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
    roundRect(ctx, x - 130, y - 80, 260, 36, 18);
    ctx.fill();
    K.label(ctx, 'SOLUSI DIGITAL RESMI', x, y - 62, { size: 20, weight: 700, color: '#10B981', font: K.FONT.mono, spacing: 1 });

    K.label(ctx, 'ARYA GREEN IPL', x, y - 10, { size: 54, weight: 800, color: '#FFFFFF', spacing: -1 });
    K.label(ctx, 'Sistem Manajemen IPL & Kas Lingkungan RT Modern', x, y + 54, { size: 25, weight: 400, color: 'rgba(255,255,255,0.75)', spacing: 0 });
  } else if (kind === 'tagihan') {
    // Tagihan otomatis: Total 200rb (Dasar 150rb + Sampah 50rb)
    ctx.fillStyle = 'rgba(16, 185, 129, 0.16)';
    roundRect(ctx, x - 170, y - 260, 340, 38, 19);
    ctx.fill();
    K.label(ctx, 'TAGIHAN IPL BULANAN', x, y - 241, { size: 22, weight: 700, font: K.FONT.mono, color: '#10B981', spacing: 1 });

    K.label(ctx, 'Rp 200.000', x, y - 170, { size: 70, weight: 800, color: '#FFFFFF' });
    K.label(ctx, 'Unit B-12 · Tipe 45/90 · Blok Sakura', x, y - 105, { size: 28, weight: 500, color: 'rgba(255,255,255,0.65)' });

    // Divider
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(x - 320, y - 65, 640, 2);

    // Component rows: Iuran Dasar Rumah 150.000, Iuran Sampah 50.000
    const rows = [
      ['Iuran Dasar Rumah', 'Rp 150.000'],
      ['Iuran Sampah', 'Rp 50.000'],
    ];
    rows.forEach(([k, v], i) => {
      const yy = y - 15 + i * 62;
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      roundRect(ctx, x - 320, yy - 24, 640, 50, 12);
      ctx.fill();
      K.label(ctx, k, x - 300, yy + 2, { size: 28, weight: 500, color: 'rgba(255,255,255,0.8)', align: 'left', spacing: 0 });
      K.label(ctx, v, x + 300, yy + 2, { size: 28, weight: 700, color: '#FFFFFF', align: 'right', spacing: 0 });
    });

    // Bottom note: Notifikasi jatuh tempo otomatis (Tanpa bahas denda sama sekali)
    ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
    roundRect(ctx, x - 320, y + 145, 640, 62, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
    ctx.lineWidth = 1.5;
    roundRect(ctx, x - 320, y + 145, 640, 62, 16);
    ctx.stroke();

    K.label(ctx, '📲 NOTIFIKASI PENGINGAT JATUH TEMPO OTOMATIS', x, y + 166, { size: 21, weight: 700, color: '#10B981', font: K.FONT.mono, spacing: 0.5 });
    K.label(ctx, 'Pengingat ramah dikirim otomatis via WhatsApp sebelum jatuh tempo', x, y + 190, { size: 20, weight: 400, color: 'rgba(255,255,255,0.7)' });
  } else if (kind === 'qris') {
    const isPaid = t >= TT.qris_pay;

    ctx.fillStyle = 'rgba(255, 90, 31, 0.16)';
    roundRect(ctx, x - 170, y - 270, 340, 38, 19);
    ctx.fill();
    K.label(ctx, 'PEMBAYARAN DIGITAL QRIS', x, y - 251, { size: 20, weight: 700, font: K.FONT.mono, color: '#FF5A1F', spacing: 1 });

    if (!isPaid) {
      drawQrCode(ctx, x - 150, y - 90, 190);

      // Amount & method info on the right: Rp 200.000
      K.label(ctx, 'Total Tagihan', x + 50, y - 145, { size: 22, weight: 400, color: 'rgba(255,255,255,0.6)', align: 'left' });
      K.label(ctx, 'Rp 200.000', x + 50, y - 105, { size: 44, weight: 800, color: '#FFFFFF', align: 'left' });
      K.label(ctx, 'QRIS Dinamis 1-Klik', x + 50, y - 60, { size: 24, weight: 600, color: '#10B981', align: 'left' });

      // Highlight Bebas Biaya Transfer
      ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
      roundRect(ctx, x - 320, y + 45, 640, 60, 16);
      ctx.fill();
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 1.5;
      roundRect(ctx, x - 320, y + 45, 640, 60, 16);
      ctx.stroke();

      K.label(ctx, '⚡ BEBAS BIAYA TRANSFER ANTAR-BANK & E-WALLET', x, y + 75, { size: 22, weight: 800, color: '#10B981', font: K.FONT.mono, spacing: 0.5 });

      // Supported channels
      K.label(ctx, 'BCA · Mandiri · BRI · BNI · GoPay · ShopeePay · OVO · Dana', x, y + 140, { size: 22, weight: 400, color: 'rgba(255,255,255,0.5)' });

      // Pay button trigger
      ctx.fillStyle = '#FF5A1F';
      roundRect(ctx, x - 160, y + 185, 320, 56, 28);
      ctx.fill();
      K.label(ctx, 'Klik Scan & Bayar', x, y + 213, { size: 26, weight: 700, color: '#FFFFFF' });
    } else {
      // Payment confirmed / Receipt state
      const p = clamp((t - TT.qris_pay) / 0.4);
      ctx.save();
      ctx.scale(0.8 + 0.2 * ease.outBack(p), 0.8 + 0.2 * ease.outBack(p));

      // Big success check
      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.arc(x, y - 110, 52, 0, Math.PI * 2);
      ctx.fill();
      K.G.check(ctx, x, y - 108, 64, p, '#FFFFFF', 10);

      K.label(ctx, 'STATUS: LUNAS SEKETIKA', x, y - 20, { size: 38, weight: 800, color: '#FFFFFF' });
      K.label(ctx, 'Kwitansi Digital Resmi Langsung Terbit', x, y + 25, { size: 26, weight: 400, color: 'rgba(255,255,255,0.7)' });

      // Receipt details pill
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      roundRect(ctx, x - 280, y + 75, 560, 95, 18);
      ctx.fill();
      K.label(ctx, 'NO. REFERENSI: AG-2026-INV8829', x, y + 105, { size: 22, weight: 700, color: '#10B981', font: K.FONT.mono });
      K.label(ctx, 'Terverifikasi Kriptografi HMAC SHA-256', x, y + 140, { size: 20, weight: 400, color: 'rgba(255,255,255,0.6)' });
      ctx.restore();
    }
  } else if (kind === 'kas') {
    // Buku Kas Digital
    ctx.fillStyle = 'rgba(59, 130, 246, 0.18)';
    roundRect(ctx, x - 180, y - 240, 360, 38, 19);
    ctx.fill();
    K.label(ctx, 'BUKU KAS DIGITAL REAL-TIME', x, y - 221, { size: 20, weight: 700, font: K.FONT.mono, color: '#60A5FA', spacing: 1 });

    K.label(ctx, 'Rp14.850.000', x, y - 150, { size: 66, weight: 800, color: '#FFFFFF' });
    K.label(ctx, 'Saldo Kas RT Terverifikasi & Selalu Sinkron', x, y - 90, { size: 26, weight: 400, color: 'rgba(255,255,255,0.65)' });

    // 3 Metrics cards
    const metrics = [
      ['Pemasukan', 'Rp15.2jt', '#10B981', 'Arus Masuk Auto'],
      ['Pengeluaran', 'Rp350rb', '#F59E0B', 'Persetujuan RT'],
      ['Selisih Kas', '0% / Rp0', '#60A5FA', 'Akurat 100%'],
    ];
    metrics.forEach(([title, val, col, sub], i) => {
      const bx = x - 270 + i * 270;
      const by = y + 20;
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      roundRect(ctx, bx - 120, by - 55, 240, 110, 18);
      ctx.fill();

      K.label(ctx, title, bx, by - 30, { size: 20, weight: 500, color: 'rgba(255,255,255,0.55)' });
      K.label(ctx, val, bx, by + 4, { size: 30, weight: 800, color: col });
      K.label(ctx, sub, bx, by + 34, { size: 17, weight: 400, color: 'rgba(255,255,255,0.65)', font: K.FONT.mono });
    });

    // Bottom note
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    roundRect(ctx, x - 330, y + 140, 660, 48, 14);
    ctx.fill();
    K.label(ctx, 'Transparan: Warga & Pengurus Melihat Angka yang Sama', x, y + 164, { size: 22, weight: 500, color: '#FFFFFF' });
  } else if (kind === 'botwa') {
    // Hermes Bot AI WhatsApp & PWA
    ctx.fillStyle = '#25D366';
    roundRect(ctx, x - 200, y - 290, 400, 38, 19);
    ctx.fill();
    K.label(ctx, 'BOT AI WHATSAPP (HERMES) & PWA', x, y - 271, { size: 20, weight: 800, color: '#0E0E10', font: K.FONT.mono, spacing: 0.5 });

    // Unit detection bubble
    ctx.fillStyle = 'rgba(37, 211, 102, 0.12)';
    roundRect(ctx, x - 330, y - 225, 660, 52, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(37, 211, 102, 0.4)';
    ctx.lineWidth = 1.2;
    roundRect(ctx, x - 330, y - 225, 660, 52, 16);
    ctx.stroke();
    K.label(ctx, '🤖 Kenali Unit Otomatis: B-12 (Suami & Istri Terdaftar)', x, y - 199, { size: 23, weight: 700, color: '#25D366' });

    // Hermes full feature list
    const features = [
      ['[1] Cek Tagihan IPL', 'Rincian Dasar Rp150rb + Sampah Rp50rb'],
      ['[2] Minta QRIS Instan', '1-klik bayar tanpa biaya transfer'],
      ['[3] Saldo Kas & Transparansi', 'Pantau arus kas terbuka'],
      ['[4] Lapor Aduan Fasilitas', 'Foto lampu mati / sampah'],
      ['[5] Info Agenda & Rapat RT', 'Jadwal kerja bakti warga'],
    ];

    const isClicked = t >= TT.botwa_click;

    features.forEach(([cmd, desc], i) => {
      const yy = y - 120 + i * 62;
      const highlight = i === 1 && isClicked;

      ctx.fillStyle = highlight ? 'rgba(37, 211, 102, 0.25)' : 'rgba(255,255,255,0.06)';
      roundRect(ctx, x - 330, yy - 24, 660, 52, 14);
      ctx.fill();
      if (highlight) {
        ctx.strokeStyle = '#25D366';
        ctx.lineWidth = 2;
        roundRect(ctx, x - 330, yy - 24, 660, 52, 14);
        ctx.stroke();
      }

      K.label(ctx, cmd, x - 305, yy + 2, { size: 24, weight: 700, color: highlight ? '#25D366' : '#FFFFFF', align: 'left' });
      K.label(ctx, desc, x + 305, yy + 2, { size: 22, weight: 400, color: 'rgba(255,255,255,0.6)', align: 'right' });
    });

    K.label(ctx, 'Cukup kirim pesan WhatsApp · Tanpa download aplikasi rumit', x, y + 230, { size: 22, weight: 400, color: 'rgba(255,255,255,0.55)' });
  } else if (kind === 'bendahara') {
    // Portal Khusus Bendahara
    ctx.fillStyle = 'rgba(16, 185, 129, 0.18)';
    roundRect(ctx, x - 170, y - 240, 340, 38, 19);
    ctx.fill();
    K.label(ctx, 'PORTAL KHUSUS BENDAHARA', x, y - 221, { size: 20, weight: 700, font: K.FONT.mono, color: '#10B981', spacing: 1 });

    K.label(ctx, 'Efisiensi Waktu Bendahara 10x Lipat', x, y - 160, { size: 38, weight: 800, color: '#FFFFFF' });
    K.label(ctx, 'Bebas Pusing Mencocokkan Mutasi Bank Berjam-jam', x, y - 110, { size: 25, weight: 400, color: 'rgba(255,255,255,0.65)' });

    // 2 Row Features
    const bRows = [
      ['⚡ Verifikasi Pembayaran 1-Klik', 'Otomatis cocok dengan mutasi QRIS'],
      ['📊 Rekap Tunggakan Multi-Periode', 'Pantau warga belum bayar per RT/Blok'],
    ];
    bRows.forEach(([title, desc], i) => {
      const yy = y - 35 + i * 62;
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      roundRect(ctx, x - 330, yy - 24, 660, 52, 14);
      ctx.fill();
      K.label(ctx, title, x - 305, yy + 2, { size: 24, weight: 700, color: '#FFFFFF', align: 'left' });
      K.label(ctx, desc, x + 305, yy + 2, { size: 22, weight: 400, color: 'rgba(255,255,255,0.6)', align: 'right' });
    });

    // Excel Export Button
    const isClicked = t >= TT.excel_click;
    const btnCol = isClicked ? '#10B981' : '#059669';
    ctx.fillStyle = btnCol;
    roundRect(ctx, x - 330, y + 105, 660, 72, 20);
    ctx.fill();

    K.label(ctx, '📥 1-KLIK EXPORT LAPORAN EXCEL (.XLSX)', x, y + 138, { size: 26, weight: 800, color: '#FFFFFF', font: K.FONT.mono, spacing: 0.5 });
    K.label(ctx, 'Format laporan kas RT siap cetak & siap LPJ warga', x, y + 205, { size: 22, weight: 400, color: 'rgba(255,255,255,0.6)' });
  } else if (kind === 'kuis') {
    // Kuis Transparansi
    ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
    roundRect(ctx, x - 170, y - 265, 340, 38, 19);
    ctx.fill();
    K.label(ctx, 'KUIS TRANSPARANSI KAS', x, y - 246, { size: 20, weight: 700, font: K.FONT.mono, color: '#F59E0B', spacing: 1 });

    K.label(ctx, 'Apa Penyebab Utama Kas RT Sering Dicurigai?', x, y - 180, { size: 34, weight: 800, color: '#FFFFFF' });

    const options = [
      ['A', 'Laporan manual tidak transparan'],
      ['B', 'Kwitansi fisik tercecer & hilang'],
      ['C', 'Semua benar (A & B)'],
    ];

    options.forEach(([opt, desc], i) => {
      const yy = y - 85 + i * 85;
      const isTarget = i === 2;

      ctx.fillStyle = isTarget ? 'rgba(16, 185, 129, 0.16)' : 'rgba(255,255,255,0.06)';
      roundRect(ctx, x - 330, yy - 32, 660, 68, 18);
      ctx.fill();
      if (isTarget) {
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 2;
        roundRect(ctx, x - 330, yy - 32, 660, 68, 18);
        ctx.stroke();
      }

      // Option badge
      ctx.fillStyle = isTarget ? '#10B981' : 'rgba(255,255,255,0.18)';
      roundRect(ctx, x - 310, yy - 20, 42, 42, 10);
      ctx.fill();
      K.label(ctx, opt, x - 289, yy + 2, { size: 24, weight: 800, color: isTarget ? '#0E0E10' : '#FFFFFF' });

      K.label(ctx, desc, x - 245, yy + 2, { size: 26, weight: isTarget ? 700 : 500, color: isTarget ? '#FFFFFF' : 'rgba(255,255,255,0.8)', align: 'left' });
    });

    K.label(ctx, 'Pilih jawaban yang paling tepat...', x, y + 215, { size: 24, weight: 400, color: 'rgba(255,255,255,0.5)' });
  } else if (kind === 'jawaban') {
    // Solusi Arya Green IPL
    const p = clamp((t - TT.ans_click) / 0.4);

    // Green Check Circle
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(x, y - 130, 56, 0, Math.PI * 2);
    ctx.fill();
    K.G.check(ctx, x, y - 128, 68, p, '#FFFFFF', 11);

    K.label(ctx, 'JAWABAN: C (SEMUA BENAR!)', x, y - 35, { size: 40, weight: 800, color: '#10B981' });
    K.label(ctx, 'Hentikan Keributan Kas Lingkungan!', x, y + 20, { size: 36, weight: 700, color: '#FFFFFF' });
    K.label(ctx, 'Beralih ke Arya Green IPL Sekarang', x, y + 70, { size: 28, weight: 500, color: 'rgba(255,255,255,0.7)' });

    // 4 Benefit pills
    const chips = ['QRIS 0 Biaya', 'Bot AI WhatsApp', 'Kas Real-Time', 'Export Excel'];
    chips.forEach((c, i) => {
      const cx = x - 270 + i * 180;
      const cy = y + 155;
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      roundRect(ctx, cx - 82, cy - 22, 164, 44, 14);
      ctx.fill();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.lineWidth = 1;
      roundRect(ctx, cx - 82, cy - 22, 164, 44, 14);
      ctx.stroke();
      K.label(ctx, c, cx, cy + 1, { size: 20, weight: 600, color: '#FFFFFF' });
    });
  }

  ctx.restore();
}

export function render(t) {
  K.stage(ctx, t);
  const idx = K.stateIndex(t, STATES);
  const s = K.shapeAt(t, STATES.map(([a, b]) => [a, b]), { z: 0.68, ts: 0.36, lag: 1.4 });

  let kick = 0;
  for (let i = 1; i < STATES.length; i++) {
    const d = t - STATES[i][0];
    if (d > 0 && d < 1.2) kick += 0.02 * Math.exp(-d * 3) * Math.sin(Math.min(d * 5, Math.PI));
  }
  const z = 1 + kick, drift = Math.sin(t * 0.35) * 5;
  ctx.setTransform(z, 0, 0, z, CX - CX * z, CY - CY * z + drift);

  const p = K.pointerAt(t, PTR, CLICKS, { z: 0.95, ts: 0.75 });
  const press = Math.max(0, ...CLICKS.map((c) => (Math.abs(t - c) < 0.12 ? 1 - Math.abs(t - c) / 0.12 : 0)));

  K.body(ctx, s, { press });
  for (let i = Math.max(0, idx - 1); i <= idx; i++) {
    content(STATES[i][2], s, t, STATES[i][0], STATES[i + 1] ? STATES[i + 1][0] : 99);
  }

  // Floating sub-indicator labels below shape (tanpa bahas denda sama sekali)
  const subs = [
    [0, TT.brand, 'Pencatatan manual sering memicu selisih & kecurigaan'],
    [TT.brand, TT.tagihan, 'Sistem modern terpusat untuk warga & pengurus RT'],
    [TT.tagihan, TT.qris, 'Iuran dasar & sampah terinci jelas · Otomatis setiap bulan'],
    [TT.qris, TT.kas, 'Scan QRIS dari bank atau e-wallet tanpa biaya transfer'],
    [TT.kas, TT.botwa, 'Semua pemasukan & pengeluaran tercatat akurat 100%'],
    [TT.botwa, TT.bendahara, 'Layanan warga mandiri cukup lewat chat WhatsApp'],
    [TT.bendahara, TT.kuis, 'Bendahara cukup 1-klik cocokkan mutasi & export Excel'],
    [TT.kuis, TT.jawaban, 'Tingkatkan kepercayaan warga dengan sistem terbuka'],
    [TT.jawaban, 99, 'Arya Green IPL · Solusi Iuran Lingkungan Cerdas'],
  ];
  for (const [a, b, str] of subs) {
    const E = K.swap(t, a + 0.12, b);
    if (E.a > 0) K.label(ctx, str, CX, CY + 420 + E.dy, { size: 30, weight: 400, color: P.ink2, alpha: E.a, spacing: 0 });
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.stepper(ctx, t, STEPS, 120, 240);
  for (const c of CLICKS) K.ring(ctx, p.x, p.y, t - c, { r: 65 });
  K.pointer(ctx, p.x, p.y, { press: p.press, scale: 1.05 });
}

