// 73 · STICKMAN DUO — Demo 2: Efek Body Doubling (Neuron Cermin & Fokus Bersama)
import * as K from '/styles/stickman-duo/kit.js';
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
  if (t >= C.virtual.start) phase = 3;
  else if (t >= C.aturan.start) phase = 2;
  else if (t >= C.cermin.start) phase = 1;

  const tags = [
    'EPISODE 01 • FENOMENA BODY DOUBLING',
    'EPISODE 02 • NEURON CERMIN & JANGKAR PERHATIAN',
    'EPISODE 03 • PROTOKOL 50 MENIT HENING / 10 MENIT NGOBROL',
    'EPISODE 04 • BISA TATAP MUKA MAUPUN VIRTUAL',
  ];

  K.duoBg(ctx, t, { floorY, episodeTag: tags[phase], col: phase >= 2 ? K.PAL.teal : K.PAL.red });

  const headers = [
    ['2x FOKUS', 'APA ITU EFEK BODY DOUBLING?', 'Mengapa Duduk Kerja Sebelahan Bikin Tugas Cepat Selesai?'],
    ['CERMIN', 'AKTIVASI MIRROR NEURONS DI OTAK', 'Melihat Teman Serius Bekerja Menularkan Mode Fokus Instan'],
    ['50 / 10', 'ATURAN KERJA BARENG TANPA DISTRAKSI', '50 Menit Fokus Hening Bersama • 10 Menit Istirahat Ngobrol'],
    ['DIMANA SAJA', 'EFEKTIF DI PERPUSTAKAAN ATAU VIDEO CALL', 'Jangkar Kehadiran Fisik Maupun Virtual Mengusir Rasa Mager'],
  ][phase];

  K.duoHeader(ctx, headers[0], headers[1], headers[2], {
    col: phase >= 2 ? K.PAL.teal : K.PAL.red,
  });

  const props = [
    ['BODY DOUBLE', 'JANGKAR FOKUS', 'Hadir berdua tanpa perlu ngobrol', K.PAL.blue],
    ['NEURON CERMIN', 'MENULAR!', 'Fokus teman menular ke otakmu', K.PAL.red],
    ['TIMER DUO', '50m : 10m', '50 mnt hening • 10 mnt rehat', K.PAL.teal],
    ['CO-WORKING', '2x PRODUKTIF', 'Tatap muka atau panggilan video', K.PAL.teal],
  ][phase];
  K.duoCenterProp(ctx, floorY, props[0], props[1], props[2], { col: props[3] });

  const rakaPose = phase === 0 ? 'talk' : phase === 1 ? 'point' : phase === 2 ? 'talk' : 'highfive';
  const bimaPose = phase === 0 ? 'point' : phase === 1 ? 'talk' : phase === 2 ? 'point' : 'highfive';

  K.duoStickman(ctx, 275, floorY, 'raka', rakaPose, { facing: 1, t });
  K.duoStickman(ctx, 805, floorY, 'bima', bimaPose, { facing: -1, t });

  const rakaLines = [
    'Aneh ya, duduk sebelahan kamu bikin aku langsung fokus!',
    'Lihat kamu ngetik serius, aku jadi segan buka HP!',
    'Oke, 50 menit jangan ngobrol dulu ya Bim!',
    'Dua bab selesai dalam sejam! Keren banget!',
  ];
  const bimaLines = [
    'Itu namanya efek Body Doubling, Rak!',
    'Neuron cermin di otak kita saling menularkan fokus!',
    'Siap! Nanti 10 menit terakhir baru kita ngopi!',
    'Besok kita co-working lagi jam 9 pagi ya!',
  ];

  K.duoBubble(ctx, 285, 345, 'RAKA', rakaLines[phase], { tailX: 275, tailY: 420, col: K.PAL.red });
  K.duoBubble(ctx, 795, 345, 'BIMA', bimaLines[phase], { tailX: 805, tailY: 420, col: K.PAL.blue });

  if (phase === 0) {
    K.duoCard(ctx, 540, 995, 960, 175, {
      tag: 'PSIKOLOGI PENDAMPINGAN FISIK (BODY DOUBLING)',
      titleStr: 'Mengerjakan Tugas Mandiri dengan Ditemani Orang Lain',
      subStr: 'Mesin fokus menyala lebih cepat saat kita berada di ruang kerja yang sama',
      stat: 'PENDAMPING',
      statSub: 'EFEK KEHADIRAN',
      col: K.PAL.red,
      a: pop(t, C.hook.start + 0.2),
    });
    K.duoCard(ctx, 540, 1210, 960, 175, {
      tag: 'MENGATASI KELUMPUHAN MEMULAI TUGAS',
      titleStr: 'Menurunkan Hambatan Emosional Saat Menghadapi Tugas Berat',
      subStr: 'Suasana tenang namun aktif membantu otak masuk ke mode kerja tanpa paksaan',
      stat: 'LANCAR',
      statSub: 'MUDAH MULAI',
      col: K.PAL.blue,
      a: pop(t, C.hook.start + 0.6),
    });
  } else if (phase === 1) {
    K.duoCard(ctx, 540, 995, 960, 175, {
      tag: 'CARA KERJA MIRROR NEURONS (NEURON CERMIN)',
      titleStr: 'Otak Secara Alami Meniru Postur & Keseriusan Sekitar',
      subStr: 'Itulah sebabnya belajar di perpustakaan atau bersama teman terasa lebih khusyuk',
      stat: 'MENIRU',
      statSub: 'SINYAL FOKUS',
      col: K.PAL.blue,
      a: pop(t, C.cermin.start),
    });
    K.duoCard(ctx, 540, 1210, 960, 175, {
      tag: 'EFEK SOCIAL FACILITATION (NORMAN TRIPLETT)',
      titleStr: 'Kehadiran Rekan Menahan Impuls Membuka Media Sosial',
      subStr: 'Rasa sungkan terlihat bermalas-malasan menjaga tangan tetap di atas papan ketik',
      stat: 'ANTI-SCROLL',
      statSub: 'REM ALAMI',
      col: K.PAL.red,
      a: pop(t, C.cermin.start + 0.5),
    });
  } else if (phase === 2) {
    K.duoCard(ctx, 540, 995, 960, 175, {
      tag: 'ATURAN EMAS BODY DOUBLING AGAR TIDAK BOCOR',
      titleStr: '50 Menit Hening Total • 10 Menit Istirahat & Ngobrol',
      subStr: 'Pisahkan dengan tegas antara blok waktu kerja hening dan blok waktu bersosialisasi',
      stat: '50 : 10',
      statSub: 'BLOK DISIPLIN',
      col: K.PAL.teal,
      a: pop(t, C.aturan.start),
    });
    K.duoCard(ctx, 540, 1210, 960, 175, {
      tag: 'DEKLARASI TARGET DI AWAL SESI',
      titleStr: 'Sebutkan 1 Output Spesifik Sebelum Timer Dinyalakan',
      subStr: 'Contoh: "Dalam 50 menit ini aku menyelesaikan 3 halaman draf laporan"',
      stat: '1 OUTPUT',
      statSub: 'JELAS & TERUKUR',
      col: K.PAL.blue,
      a: pop(t, C.aturan.start + 0.5),
    });
  } else {
    K.duoCard(ctx, 540, 995, 960, 175, {
      tag: 'VIRTUAL BODY DOUBLING (JARAK JAUH)',
      titleStr: 'Nyalakan Kamera dengan Mikrofon Mute Saat Bekerja',
      subStr: 'Melihat sahabat tetap duduk di mejanya sudah cukup memicu efek fokus yang sama',
      stat: 'VIRTUAL OK',
      statSub: 'TANPA BATAS JARAK',
      col: K.PAL.teal,
      a: pop(t, C.virtual.start),
    });
    K.duoCard(ctx, 540, 1210, 960, 175, {
      tag: 'PESAN DUO RAKA & BIMA',
      titleStr: 'Jadwalkan Sesi Fokus Berdua Saat Tugasmu Sedang Menumpuk!',
      subStr: 'Ubah waktu nongkrong menjadi waktu produktif yang menyenangkan',
      stat: 'TUNTAS 2x',
      statSub: 'FOKUS BERSAMA',
      col: K.PAL.red,
      a: pop(t, C.virtual.start + 0.5),
    });
  }
}

