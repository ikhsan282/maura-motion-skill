// 71 · STICKMAN CAVEMAN — Demo 2: Harimau Sabertooth vs Notifikasi (Pembajakan Amigdala)
import * as K from '/styles/stickman-caveman/kit.js';
const { clamp, ease } = AM.lib;

export const meta = { fps: 30, width: 1080, height: 1920, captions: { preset: 'clean', y: 1620, size: 48 } };

let ctx;
const C = {};
const pop = (t, a, d = 0.4) => ease.outBack(clamp((t - a) / d), 1.8);

export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
}

export function render(t) {
  ctx.clearRect(0, 0, 1080, 1920);
  const floorY = 760;

  let phase = 0;
  if (t >= C.label.start) phase = 3;
  else if (t >= C.napas.start) phase = 2;
  else if (t >= C.buta.start) phase = 1;

  const tags = [
    'GUA 01 • DEBAR JANTUNG SAAT NOTIFIKASI BUNYI',
    'GUA 02 • AMIGDALA HIJACK (PIKIRAN MENDADAK BUNTU)',
    'GUA 03 • NAPAS PANJANG & AKTIVASI SARAF VAGUS',
    'GUA 04 • AFFECT LABELING & LOGIKA KEMBALI PULIH',
  ];

  K.cavemanBg(ctx, t, { floorY, stageTag: tags[phase], col: phase >= 2 ? K.PAL.teal : K.PAL.fire });

  const headers = [
    ['BAHAYA?!', 'HARIMAU SABERTOOTH vs EMAIL KERJA', 'Mengapa Pesan Revisi Terasa Seperti Serangan Predator?'],
    ['BUNTU!', 'PEMBAJAKAN AMIGDALA (FIGHT OR FLIGHT)', 'Saat Panik, Darah Ditarik dari Otak Logis Menuju Otot'],
    ['4-7-8', 'AKTIFKAN REM SARAF VAGUS', 'Embusan Napas Panjang Mematikan Alarm Darurat Purba'],
    ['JERNIH!', 'BERI NAMA EMOSIMU & HADAPI TENANG', 'Tenangkan Penjaga Gua, Kembalikan Kendali Korteks Prefrontal'],
  ][phase];

  K.cavemanHeader(ctx, headers[0], headers[1], headers[2], {
    col: phase >= 2 ? K.PAL.teal : K.PAL.fire,
  });

  K.cavemanProps(ctx, floorY, 'tiger', { phase, t });

  const charX = 420;
  const pose = phase <= 1 ? 'panic' : phase === 2 ? 'think' : 'victory';
  K.cavemanStickman(ctx, charX, floorY, pose, { facing: 1, t });

  const bubbles = [
    'Suara chat bunyi! Ada harimau di semak-semak?!',
    'Jantung ngebut, kepala malah kosong melompong!',
    'Tarik napas... buang pelan... aman kok, bukan harimau!',
    'Otak jernih lagi, siap balas pesan dengan tenang!',
  ];
  K.cavemanBubble(ctx, charX, 360, bubbles[phase], {
    tailX: charX, tailY: 445, col: phase >= 2 ? K.PAL.teal : K.PAL.fire,
  });

  if (phase === 0) {
    K.cavemanCard(ctx, 540, 995, 960, 175, {
      tag: 'DETEKTOR ANCAMAN PURBA (AMIGDALA)',
      titleStr: 'Dirancang Bereaksi Dalam Hitungan Milidetik',
      subStr: 'Di padang savana, lebih baik salah mengira ranting sebagai harimau daripada terlambat lari',
      stat: 'ALARM!',
      statSub: 'REAKSI INSTAN',
      col: K.PAL.fire,
      a: pop(t, C.hook.start + 0.2),
    });
    K.cavemanCard(ctx, 540, 1210, 960, 175, {
      tag: 'POSITIF PALSU DI ERA DIGITAL',
      titleStr: 'Notifikasi Merah & Pesan Singkat Memicu Respons Serupa',
      subStr: 'Tubuh memompa kortisol dan adrenalin meski kita hanya duduk di kursi kerja',
      stat: 'KORTISOL',
      statSub: 'STRES FISIK',
      col: K.PAL.ochre,
      a: pop(t, C.hook.start + 0.6),
    });
  } else if (phase === 1) {
    K.cavemanCard(ctx, 540, 995, 960, 175, {
      tag: 'FENOMENA AMYGDALA HIJACK (DANIEL GOLEMAN)',
      titleStr: 'Korteks Prefrontal (Pusat Logika) Dimatikan Sementara',
      subStr: 'Itulah sebabnya saat panik atau gugup, kita sulit menyusun kalimat dan berpikir jernih',
      stat: 'LOGIKA OFF',
      statSub: 'MODE DARURAT',
      col: K.PAL.fire,
      a: pop(t, C.buta.start),
    });
    K.cavemanCard(ctx, 540, 1210, 960, 175, {
      tag: 'RESPON FIGHT, FLIGHT, OR FREEZE',
      titleStr: 'Membalas Emosional, Kabur Menunda, atau Membeku Diam',
      subStr: 'Jangan mengambil keputusan penting saat tubuh masih dikuasai alarm gua',
      stat: 'FREEZE',
      statSub: 'BEKU CEMAS',
      col: K.PAL.amber,
      a: pop(t, C.buta.start + 0.5),
    });
  } else if (phase === 2) {
    K.cavemanCard(ctx, 540, 995, 960, 175, {
      tag: 'REM BIOLOGIS: SARAF VAGUS & PARASIMPATIS',
      titleStr: 'Embusan Napas Lebih Panjang dari Tarikan Napas (4–8 Detik)',
      subStr: 'Saat kita mengembuskan napas perlahan, detak jantung otomatis melambat',
      stat: '4s / 8s',
      statSub: 'NAPAS TENANG',
      col: K.PAL.teal,
      a: pop(t, C.napas.start),
    });
    K.cavemanCard(ctx, 540, 1210, 960, 175, {
      tag: 'SINYAL FISIK KE BAWAH SADAR',
      titleStr: 'Tidak Mungkin Bernapas Lambat Saat Dikejar Harimau',
      subStr: 'Oleh karena itu, napas lambat meyakinkan amigdala bahwa situasi 100% aman',
      stat: 'AMAN!',
      statSub: 'SIRENE MATI',
      col: K.PAL.amber,
      a: pop(t, C.napas.start + 0.5),
    });
  } else {
    K.cavemanCard(ctx, 540, 995, 960, 175, {
      tag: 'TEKNIK AFFECT LABELING (MATTHEW LIEBERMAN)',
      titleStr: '"Name It to Tame It" — Tuliskan Kekhawatiranmu di Kertas',
      subStr: 'Mengubah emosi abstrak menjadi kata-kata mengaktifkan kembali pusat logika otak',
      stat: 'TULISKAN',
      statSub: 'PULIHKAN LOGIKA',
      col: K.PAL.teal,
      a: pop(t, C.label.start),
    });
    K.cavemanCard(ctx, 540, 1210, 960, 175, {
      tag: 'PESAN SI UGA MANUSIA GUA',
      titleStr: 'Tarik Napas Dulu Sebelum Membuka atau Membalas Pesan',
      subStr: 'Jeda 30 detik menyelamatkanmu dari kepanikan yang tidak perlu',
      stat: 'TENANG!',
      statSub: 'KENDALI PENUH',
      col: K.PAL.ochre,
      a: pop(t, C.label.start + 0.5),
    });
  }
}

