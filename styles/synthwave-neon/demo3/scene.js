// 82 · CYBERPUNK RETRO SYNTHWAVE — Demo 3: Revolusi Kriptografi
// Full-Screen 1080x1920 (8 Beat Dinamis)

import * as K from '/styles/synthwave-neon/kit.js';

const { clamp, lerp, ease } = AM.lib;
const { PAL, withCamera, synthwaveBg, synthwaveHeader, cyberReticle, cyberStickman, synthwaveCallout } = K;

export const meta = {
  fps: 30,
  width: 1080,
  height: 1920,
  captions: { preset: 'neon', y: 1700, size: 48 }
};

let ctx;
const C = {};
const pop = (t, a, d = 0.45) => ease.outBack(clamp((t - a) / d), 1.7);

export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
}

export function render(t) {
  ctx.clearRect(0, 0, 1080, 1920);

  // 1. Determine Current Beat (8 Beats)
  let beat = 0;
  if (t >= C.moral?.start) beat = 7;
  else if (t >= C.fondasi?.start) beat = 6;
  else if (t >= C.matematika?.start) beat = 5;
  else if (t >= C.enkripsi?.start) beat = 4;
  else if (t >= C.gembok?.start) beat = 3;
  else if (t >= C.revolusi?.start) beat = 2;
  else if (t >= C.masalah?.start) beat = 1;

  // 2. High-Speed Moving Neon Grid
  const speed = beat >= 4 ? 3.4 : 2.4;
  synthwaveBg(ctx, t, { horizonY: 960, gridSpeed: speed });

  // 3. Dynamic Camera Zoom
  let zoom = 1.0, fx = 540, fy = 880;
  if (beat === 1) {
    zoom = 1.15; fx = 520; fy = 840; // Open fiber optic
  } else if (beat === 2) {
    zoom = 1.18; fx = 540; fy = 800; // RSA math formula
  } else if (beat === 3 || beat === 4) {
    zoom = 1.20; fx = 540; fy = 780; // Public lock / private key
  } else if (beat === 5) {
    zoom = 1.18; fx = 540; fy = 820; // 2048-bit prime numbers
  } else if (beat === 7) {
    zoom = 1.12; fx = 540; fy = 840; // Fortress shield
  }

  // 4. World Content with Camera
  withCamera(ctx, { zoom, fx, fy }, () => {
    const floorY = 1240;

    // Cyber Pedestal Base
    ctx.save();
    ctx.fillStyle = 'rgba(13, 2, 33, 0.85)';
    ctx.strokeStyle = beat >= 6 ? PAL.cyan : PAL.hotPink;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(540, floorY, 380, 78, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.restore();

    if (beat === 0) {
      // Beat 0: Avatar with Glowing Cryptographic Shield
      cyberStickman(ctx, 320, floorY, { pose: 'ready', color: PAL.cyan, t });

      // Hologram of Secure Digital Vault / Credit Card
      const cx = 680, cy = 740;
      ctx.save();
      ctx.fillStyle = 'rgba(8, 2, 22, 0.95)';
      ctx.strokeStyle = PAL.cyan;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(cx - 160, cy - 110, 320, 220, 18);
      ctx.fill(); ctx.stroke();

      // Digital Gold Chip
      ctx.fillStyle = PAL.yellow;
      ctx.beginPath();
      ctx.roundRect(cx - 120, cy - 70, 60, 48, 8);
      ctx.fill();

      ctx.fillStyle = PAL.white;
      ctx.font = '900 24px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('•••• •••• •••• 8842', cx - 120, cy + 25);

      ctx.fillStyle = PAL.hotPink;
      ctx.font = '800 14px "JetBrains Mono", monospace';
      ctx.fillText('ENCRYPTED: AES-256 / RSA', cx - 120, cy + 65);
      ctx.restore();

      cyberReticle(ctx, cx + 110, cy - 60, 30, { col: PAL.cyan, angle: t * 3, label: 'SAFE', t });

    } else if (beat === 1) {
      // Beat 1: Open Vulnerable Fiber Optic Cables
      cyberStickman(ctx, 230, floorY, { pose: 'ready', color: PAL.coral, t });

      // Hacker / Sniffer Interception Warning
      const hx = 650, hy = 730;
      ctx.save();
      ctx.fillStyle = 'rgba(15, 2, 20, 0.95)';
      ctx.strokeStyle = PAL.coral;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(hx - 210, hy - 140, 420, 270, 18);
      ctx.fill(); ctx.stroke();

      // Top Alert
      ctx.fillStyle = PAL.coral;
      ctx.beginPath();
      ctx.roundRect(hx - 180, hy - 120, 360, 36, 8);
      ctx.fill();

      ctx.fillStyle = PAL.bg0;
      ctx.font = '900 15px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('JARINGAN PUBLIK: RAWAN SADAP', hx, hy - 97);

      // Leaking fiber optic lines
      ctx.strokeStyle = PAL.coral;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(hx - 160, hy - 20); ctx.lineTo(hx + 160, hy - 20);
      ctx.stroke();

      // Data packets leaking
      for (let p = 0; p < 4; p++) {
        const px = hx - 120 + p * 80;
        ctx.fillStyle = PAL.yellow;
        ctx.beginPath();
        ctx.arc(px, hy - 20, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = PAL.coral;
        ctx.font = '700 12px "JetBrains Mono", monospace';
        ctx.fillText('PACKET_LEAK', px, hy + 15);
      }

      ctx.fillStyle = PAL.white;
      ctx.font = '800 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Semua data bebas dibaca siapa saja!', hx, hy + 65);
      ctx.restore();

      cyberReticle(ctx, hx + 140, hy + 80, 30, { col: PAL.coral, angle: t * 5, label: 'LEAK', t });

    } else if (beat === 2) {
      // Beat 2: Public Key Cryptography 1970s (RSA Invention)
      cyberStickman(ctx, 230, floorY, { pose: 'hack', color: PAL.cyan, t });

      // Holographic RSA Formula Box
      const rx = 650, ry = 740;
      ctx.save();
      ctx.fillStyle = 'rgba(8, 2, 22, 0.95)';
      ctx.strokeStyle = PAL.cyan;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(rx - 210, ry - 140, 420, 280, 20);
      ctx.fill(); ctx.stroke();

      // Header
      ctx.fillStyle = PAL.cyan;
      ctx.beginPath();
      ctx.roundRect(rx - 180, ry - 120, 360, 38, 8);
      ctx.fill();

      ctx.fillStyle = PAL.bg0;
      ctx.font = '900 16px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('KRIPTOGRAFI ASIMETRIS (RSA 1977)', rx, ry - 95);

      // Key Pairs
      ctx.fillStyle = PAL.cyan;
      ctx.font = '900 24px "JetBrains Mono", monospace';
      ctx.fillText('🔓 KUNCI PUBLIK (SEBARKAN)', rx, ry - 35);

      ctx.fillStyle = PAL.magenta;
      ctx.fillText('🔑 KUNCI PRIBADI (RAHASIA)', rx, ry + 15);

      ctx.fillStyle = PAL.white;
      ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Dua kunci berbeda secara matematis,', rx, ry + 60);
      ctx.fillText('namun saling terikat sempurna!', rx, ry + 88);
      ctx.restore();

      cyberReticle(ctx, rx + 140, ry + 80, 30, { col: PAL.cyan, angle: -t * 3, label: 'ASYMM', t });

    } else if (beat === 3) {
      // Beat 3: The Open Public Lock Metaphor
      cyberStickman(ctx, 230, floorY, { pose: 'ready', color: PAL.cyan, t });

      // Giant Open Padlock Hologram
      const lx = 660, ly = 730;
      ctx.save();
      ctx.fillStyle = 'rgba(8, 2, 22, 0.95)';
      ctx.strokeStyle = PAL.yellow;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(lx - 190, ly - 130, 380, 260, 20);
      ctx.fill(); ctx.stroke();

      // Open Padlock Shackle
      ctx.strokeStyle = PAL.yellow;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(lx, ly - 60, 45, Math.PI, 0);
      ctx.lineTo(lx + 45, ly - 10);
      ctx.moveTo(lx - 45, ly - 60);
      ctx.lineTo(lx - 45, ly - 35); // open gap
      ctx.stroke();

      // Lock Body
      ctx.fillStyle = PAL.yellow;
      ctx.beginPath();
      ctx.roundRect(lx - 60, ly - 20, 120, 80, 12);
      ctx.fill();

      ctx.fillStyle = PAL.bg0;
      ctx.font = '900 16px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PUBLIC', lx, ly + 25);

      ctx.fillStyle = PAL.white;
      ctx.font = '800 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Bebas diambil seluruh dunia!', lx, ly + 95);
      ctx.restore();

      cyberReticle(ctx, lx + 120, ly - 80, 30, { col: PAL.yellow, angle: t * 4, label: 'OPEN', t });

    } else if (beat === 4) {
      // Beat 4: Encryption Flow (Plaintext -> Ciphertext)
      cyberStickman(ctx, 230, floorY, { pose: 'hack', color: PAL.cyan, t });

      // Encryption Pipeline Hologram
      const ex = 660, ey = 740;
      ctx.save();
      ctx.fillStyle = 'rgba(8, 2, 22, 0.95)';
      ctx.strokeStyle = PAL.hotPink;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(ex - 210, ey - 130, 420, 270, 18);
      ctx.fill(); ctx.stroke();

      // Top Tag
      ctx.fillStyle = PAL.hotPink;
      ctx.beginPath();
      ctx.roundRect(ex - 180, ey - 110, 360, 36, 8);
      ctx.fill();

      ctx.fillStyle = PAL.bg0;
      ctx.font = '900 15px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PROSES ENKRIPSI DATA', ex, ey - 87);

      // Flow
      ctx.fillStyle = PAL.white;
      ctx.font = '800 18px "JetBrains Mono", monospace';
      ctx.fillText('"KIRIM RP 50.000.000"', ex, ey - 35);

      ctx.fillStyle = PAL.yellow;
      ctx.font = '900 24px "JetBrains Mono", monospace';
      ctx.fillText('⬇ [DIKUNCI PUBLIK] ⬇', ex, ey);

      ctx.fillStyle = PAL.cyan;
      ctx.font = '800 15px "JetBrains Mono", monospace';
      ctx.fillText('e4b8a9c0... (ACAK & RAHASIA)', ex, ey + 35);

      ctx.fillStyle = PAL.hotPink;
      ctx.font = '700 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Hanya Kunci Pribadimu yang Bisa Buka!', ex, ey + 80);
      ctx.restore();

      cyberReticle(ctx, ex + 140, ey + 75, 30, { col: PAL.hotPink, angle: -t * 3, label: 'ENCRYPT', t });

    } else if (beat === 5) {
      // Beat 5: Giant Prime Numbers Mathematics
      cyberStickman(ctx, 240, floorY, { pose: 'ready', color: PAL.cyan, t });

      // Prime Multiplication Trapdoor Hologram
      const px = 660, py = 730;
      ctx.save();
      ctx.fillStyle = 'rgba(8, 2, 22, 0.95)';
      ctx.strokeStyle = PAL.yellow;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(px - 210, py - 140, 420, 275, 18);
      ctx.fill(); ctx.stroke();

      // Top Tag
      ctx.fillStyle = PAL.yellow;
      ctx.beginPath();
      ctx.roundRect(px - 180, py - 120, 360, 36, 8);
      ctx.fill();

      ctx.fillStyle = PAL.bg0;
      ctx.font = '900 15px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('MATEMATIKA BILANGAN PRIMA', px, py - 97);

      ctx.fillStyle = PAL.white;
      ctx.font = '800 20px "JetBrains Mono", monospace';
      ctx.fillText('P x Q = N (Kunci 2048-Bit)', px, py - 40);

      ctx.fillStyle = PAL.cyan;
      ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Mengalikan angka = 0.001 detik', px, py);

      ctx.fillStyle = PAL.coral;
      ctx.font = '900 18px "JetBrains Mono", monospace';
      ctx.fillText('Memfaktorkan balik = 1.000.000 Tahun!', px, py + 40);

      ctx.fillStyle = PAL.hotPink;
      ctx.font = '700 14px "JetBrains Mono", monospace';
      ctx.fillText('// SUPERKOMPUTER TAK SANGGUP HACK', px, py + 85);
      ctx.restore();

      cyberReticle(ctx, px + 140, py + 80, 30, { col: PAL.yellow, angle: t * 4, label: 'PRIME', t });

    } else if (beat === 6) {
      // Beat 6: Global Banking Foundation
      cyberStickman(ctx, 230, floorY, { pose: 'hack', color: PAL.cyan, t });

      // Global Infrastructure Shield
      const bx = 650, by = 740;
      ctx.save();
      ctx.fillStyle = 'rgba(8, 2, 22, 0.95)';
      ctx.strokeStyle = PAL.cyan;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(bx - 210, by - 130, 420, 260, 18);
      ctx.fill(); ctx.stroke();

      // Header
      ctx.fillStyle = PAL.cyan;
      ctx.beginPath();
      ctx.roundRect(bx - 180, by - 110, 360, 38, 8);
      ctx.fill();

      ctx.fillStyle = PAL.bg0;
      ctx.font = '900 16px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('FONDASI PERADABAN DIGITAL', bx, by - 85);

      // 3 Protected Pillars
      ctx.textAlign = 'left';
      ctx.fillStyle = PAL.white;
      ctx.font = '800 16px "JetBrains Mono", monospace';
      ctx.fillText('✓ SISTEM PERBANKAN & SWIFT', bx - 170, by - 30);
      ctx.fillText('✓ PROTOKOL WEB HTTPS / SSL', bx - 170, by + 10);
      ctx.fillText('✓ CHAT RAHASIA END-TO-END', bx - 170, by + 50);

      ctx.fillStyle = PAL.hotPink;
      ctx.font = '900 16px "JetBrains Mono", monospace';
      ctx.fillText('// TANPA INI, INTERNET RUNTUH!', bx - 170, by + 95);
      ctx.restore();

      cyberReticle(ctx, bx + 140, by + 75, 30, { col: PAL.cyan, angle: -t * 3, label: 'PILLAR', t });

    } else if (beat === 7) {
      // Beat 7: Digital Freedom & Privacy Fortress
      cyberStickman(ctx, 360, floorY, { pose: 'victory', color: PAL.cyan, t });

      // Big Cryptographic Fortress Shield
      const mx = 720, my = 750;
      ctx.save();
      ctx.strokeStyle = PAL.cyan;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(mx, my, 120, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = PAL.hotPink;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(mx, my, 105, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = PAL.cyan;
      ctx.font = '900 24px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('BENTENG', mx, my - 25);
      ctx.fillText('PRIVASI', mx, my + 15);

      ctx.fillStyle = PAL.white;
      ctx.font = '800 15px "JetBrains Mono", monospace';
      ctx.fillText('KEBEBASAN DIGITAL', mx, my + 55);
      ctx.restore();

      for (let s = 0; s < 6; s++) {
        const ang = (s / 6) * Math.PI * 2 + t * 2;
        const sx = mx + Math.cos(ang) * 145;
        const sy = my + Math.sin(ang) * 145;
        ctx.fillStyle = s % 2 === 0 ? PAL.hotPink : PAL.cyan;
        ctx.beginPath();
        ctx.arc(sx, sy, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });

  // 5. Header (Standard Cyberpunk Top Banner)
  synthwaveHeader(
    ctx,
    'KEAMANAN SIBER',
    'REVOLUSI KRIPTOGRAFI',
    'Perisai Matematika Penjaga Privasi & Dunia Modern'
  );

  // 6. Floating Educational Callout at y: 1485
  const callouts = [
    {
      start: C.hook?.start ?? 0,
      tag: 'KEAMANAN DIGITAL',
      title: 'Belanja Online Tanpa Sadap',
      desc: 'Miliaran transaksi publik aman setiap detik berkat matematika enkripsi.',
      stat: 'AMAN',
      statSub: 'TRANSAKSI PUBLIK',
      col: PAL.cyan
    },
    {
      start: C.masalah?.start,
      tag: 'ANCAMAN SIBER',
      title: 'Kabel Terbuka Bebas Intip',
      desc: 'Tanpa enkripsi, seluruh peretas dan mata-mata bisa membaca setiap ketukanmu.',
      stat: 'RAWAN',
      statSub: 'JARINGAN TERBUKA',
      col: PAL.coral
    },
    {
      start: C.revolusi?.start,
      tag: 'PENEMUAN 1977',
      title: 'Kriptografi Kunci Asimetris',
      desc: 'Terobosan brilian memisahkan kunci pengunci dan kunci pembuka rahasia.',
      stat: 'RSA 1977',
      statSub: 'KUNCI PUBLIK',
      col: PAL.hotPink
    },
    {
      start: C.gembok?.start,
      tag: 'ANALOGI GEMBOK',
      title: 'Gembok Terbuka ke Dunia',
      desc: 'Semua orang bisa mengunci data, tapi hanya pemilik kunci yang bisa membuka.',
      stat: 'GEMBOK',
      statSub: 'LOGIKA ELEGAN',
      col: PAL.yellow
    },
    {
      start: C.enkripsi?.start,
      tag: 'ALUR DATA ENKRIPSI',
      title: 'Teks Biasa Jadi Kode Acak',
      desc: 'Pesan rahasia diubah menjadi untaian acak yang mustahil dibaca di jalanan.',
      stat: 'CIPHER',
      statSub: 'ACAK MUTLAK',
      col: PAL.hotPink
    },
    {
      start: C.matematika?.start,
      tag: 'KEKUATAN MATEMATIKA',
      title: 'Bilangan Prima 2048-Bit',
      desc: 'Superkomputer tercepat butuh waktu jutaan tahun untuk memecahkan sandi ini.',
      stat: '1 JUTA THN',
      statSub: 'WAKTU BOBOL',
      col: PAL.yellow
    },
    {
      start: C.fondasi?.start,
      tag: 'INFRASTRUKTUR DUNIA',
      title: 'Fondasi Perbankan & Web',
      desc: 'HTTPS, perbankan, dan pesan pribadi bergantung total pada perisai ini.',
      stat: 'FONDASI',
      statSub: 'PERADABAN WEB',
      col: PAL.cyan
    },
    {
      start: C.moral?.start,
      tag: 'HAK PRIVASI ASASI',
      title: 'Benteng Kebebasan Terakhir',
      desc: 'Kriptografi adalah senjata matematika rakyat untuk melindungi privasi.',
      stat: '100%',
      statSub: 'PRIVASI TERJAGA',
      col: PAL.cyan
    }
  ];

  const currentCallout = callouts[beat] || callouts[0];
  const calloutAlpha = pop(t, currentCallout.start, 0.4);

  synthwaveCallout(ctx, 540, 1485, 960, 165, {
    tag: currentCallout.tag,
    title: currentCallout.title,
    desc: currentCallout.desc,
    stat: currentCallout.stat,
    statSub: currentCallout.statSub,
    col: currentCallout.col,
    a: calloutAlpha
  });
}

