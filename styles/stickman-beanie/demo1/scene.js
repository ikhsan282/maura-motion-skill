// 70 · STICKMAN BEANIE — Demo 1: Kupluk Merah vs Jebakan Rebahan (Aturan 5 Detik)
import * as K from '/styles/stickman-beanie/kit.js';
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
  const floorY = 755;

  let phase = 0;
  if (t >= C.sepatu.start) phase = 3;
  else if (t >= C.roket.start) phase = 2;
  else if (t >= C.jeda.start) phase = 1;

  const tags = [
    'PANEL 01 • JEBAKAN "LIMA MENIT LAGI"',
    'PANEL 02 • REM DARURAT 5 DETIK DI OTAK',
    'PANEL 03 • HITUNG MUNDUR 5-4-3-2-1!',
    'PANEL 04 • SINYAL FISIK & MOMENTUM KERJA',
  ];

  K.beanieBg(ctx, t, { floorY, stageTag: tags[phase], col: phase >= 2 ? K.PAL.teal : K.PAL.beanie });

  const headers = [
    ['MAGER?', 'KUPLUK MERAH vs REBAHAN', 'Mengapa Istirahat 5 Menit Selalu Molor Jadi 2 Jam?'],
    ['5 DETIK', 'JANGAN BERI WAKTU OTAK BERALASAN', 'Jeda Lebih dari 5 Detik Memicu Rem Kenyamanan'],
    ['3-2-1!', 'ATURAN HITUNG MUNDUR MEL ROBBINS', 'Putus Kebiasaan Menunda dengan Gerakan Fisik Instan'],
    ['GAS!', 'PAKAI ATRIBUT KERJA & MULAI DUDUK', 'Begitu Duduk di Meja, 80% Rasa Malas Langsung Hilang!'],
  ][phase];

  K.beanieHeader(ctx, headers[0], headers[1], headers[2], {
    col: phase >= 2 ? K.PAL.teal : K.PAL.beanie,
  });

  K.beanieProps(ctx, floorY, 'desk', { phase, t });

  const charX = phase <= 1 ? 350 : 480;
  const pose = phase === 0 ? 'shock' : phase === 1 ? 'think' : phase === 2 ? 'action' : 'confident';
  K.beanieStickman(ctx, charX, floorY, pose, { facing: 1, t });

  const bubbles = [
    'Cuma 5 menit kok... eh udah 2 jam?!',
    'Tanggung, satu video lagi deh...',
    '5... 4... 3... 2... 1... BANGKIT!',
    'Kupluk siap, kopi siap, fokus jalan!',
  ];
  K.beanieBubble(ctx, charX + 40, 365, bubbles[phase], {
    tailX: charX + 10, tailY: 445, col: phase >= 2 ? K.PAL.teal : K.PAL.beanie,
  });

  if (phase === 0) {
    K.beanieCard(ctx, 540, 995, 960, 175, {
      tag: 'ILUSI "SATU VIDEO LAGI"',
      titleStr: 'Negosiasi Kecil di Kepala Adalah Pintu Masuk Prokrastinasi',
      subStr: 'Algoritma layar dirancang tanpa ujung sehingga lima menit tidak pernah terasa cukup',
      stat: '2 JAM',
      statSub: 'WAKTU HILANG',
      col: K.PAL.beanie,
      a: pop(t, C.hook.start + 0.2),
    });
    K.beanieCard(ctx, 540, 1210, 960, 175, {
      tag: 'KONFLIK NIAT vs KENYAMANAN',
      titleStr: 'Kita Tahu Apa yang Harus Dikerjakan, Tapi Tubuh Enggan Gerak',
      subStr: 'Masalahnya bukan kurang pintar, melainkan kalah cepat melawan dorongan nyaman',
      stat: 'MACET',
      statSub: 'GAGAL START',
      col: K.PAL.blue,
      a: pop(t, C.hook.start + 0.6),
    });
  } else if (phase === 1) {
    K.beanieCard(ctx, 540, 995, 960, 175, {
      tag: 'JENDELA KRITIS 5 DETIK',
      titleStr: 'Lebih dari 5 Detik Melamun = Otak Langsung Mencari Alasan',
      subStr: 'Begitu muncul niat produktif, keraguan akan menyerbu jika tubuh tetap diam',
      stat: '>5 DTK',
      statSub: 'RAWAN BATAL',
      col: K.PAL.beanie,
      a: pop(t, C.jeda.start),
    });
    K.beanieCard(ctx, 540, 1210, 960, 175, {
      tag: 'MEKANISME PERTAHANAN KENYAMANAN',
      titleStr: 'Otak Selalu Memilih Jalur Paling Hemat Energi (Rebahan)',
      subStr: 'Menunggu rasa semangat muncul di atas kasur adalah penantian yang sia-sia',
      stat: 'REM!',
      statSub: 'ZONA NYAMAN',
      col: K.PAL.purple,
      a: pop(t, C.jeda.start + 0.5),
    });
  } else if (phase === 2) {
    K.beanieCard(ctx, 540, 995, 960, 175, {
      tag: 'THE 5 SECOND RULE (MEL ROBBINS)',
      titleStr: 'Hitung Mundur 5-4-3-2-1 Lalu Gerakkan Tubuhmu Seketika!',
      subStr: 'Seperti peluncuran roket, hitungan mundur tidak menyisakan ruang untuk menawar',
      stat: '5-4-3-2-1',
      statSub: 'PELUNCUR AKSI',
      col: K.PAL.teal,
      a: pop(t, C.roket.start),
    });
    K.beanieCard(ctx, 540, 1210, 960, 175, {
      tag: 'AKTIVASI KORTEKS PREFRONTAL',
      titleStr: 'Menghitung Mundur Memutus Loop Kebiasaan di Basal Ganglia',
      subStr: 'Mengalihkan fokus otak dari perasaan malas menuju tindakan terarah',
      stat: 'AKTIF!',
      statSub: 'MODE KENDALI',
      col: K.PAL.blue,
      a: pop(t, C.roket.start + 0.5),
    });
  } else {
    K.beanieCard(ctx, 540, 995, 960, 175, {
      tag: 'ENCLOTHED COGNITION & DESAIN RUANG',
      titleStr: 'Pisahkan Kasur dari Meja Kerja & Pakai Atribut Fokusmu',
      subStr: 'Pakaian dan posisi duduk memberi sinyal kuat pada saraf untuk siap berkarya',
      stat: 'SINYAL',
      statSub: 'MODE FOKUS',
      col: K.PAL.teal,
      a: pop(t, C.sepatu.start),
    });
    K.beanieCard(ctx, 540, 1210, 960, 175, {
      tag: 'CATATAN SI KUPLUK MERAH',
      titleStr: 'Jangan Bernegosiasi dengan Rasa Malas, Langsung Berdiri!',
      subStr: 'Motivasi selalu datang menyusul setelah kita mulai bergerak',
      stat: 'MENANG!',
      statSub: 'GERAK DULU',
      col: K.PAL.beanie,
      a: pop(t, C.sepatu.start + 0.5),
    });
  }
}
