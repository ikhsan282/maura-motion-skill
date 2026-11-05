// 73 · STICKMAN DUO — Demo 1: Mager Sendirian vs Gas Bareng (Studi ASTD 95% Partner Akuntabilitas)
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
  if (t >= C.ringan.start) phase = 3;
  else if (t >= C.sosial.start) phase = 2;
  else if (t >= C.astd.start) phase = 1;

  const tags = [
    'EPISODE 01 • JANJI SENDIRIAN MUDAH BATAL',
    'EPISODE 02 • RISET ASTD: 10% vs 95% SUKSES',
    'EPISODE 03 • KEKUATAN KOMITMEN SOSIAL DUA SAHABAT',
    'EPISODE 04 • SISTEM LAPORAN PAGI & MALAM',
  ];

  K.duoBg(ctx, t, { floorY, episodeTag: tags[phase], col: phase >= 2 ? K.PAL.teal : K.PAL.blue });

  const headers = [
    ['10% vs 95%', 'MAGER SENDIRIAN vs GAS BARENG', 'Mengapa Janji di Dalam Kepala Sendiri Sangat Mudah Dilanggar?'],
    ['95% GOAL', 'EFEK PARTNER AKUNTABILITAS (ASTD)', 'Laporan Rutin ke Sahabat Menaikkan Peluang Sukses 9,5x Lipat'],
    ['KOMITMEN', 'SEGAN MENGECEWAKAN TEMAN SEPERJUANGAN', 'Gunakan Naluri Sosial Otak untuk Mengunci Konsistensi Harian'],
    ['KOMPAK!', 'KIRIM 3 TARGET PAGI, LAPOR MALAM HARI', 'Saat Satu Lelah, Sahabat Menarik Kembali ke Jalur Juara!'],
  ][phase];

  K.duoHeader(ctx, headers[0], headers[1], headers[2], {
    col: phase >= 2 ? K.PAL.teal : K.PAL.blue,
  });

  // Center Scoreboard Prop
  const props = [
    ['SOLO vs DUO', 'RAWAN BATAL', 'Tanpa saksi = mudah menunda', K.PAL.red],
    ['STUDI ASTD', '10% → 95%', 'Naik drastis dengan jadwal lapor', K.PAL.blue],
    ['CHECK-IN', '3 TARGET/HARI', 'Saling pantau progres harian', K.PAL.teal],
    ['GAS BARENG!', '100% TUNTAS', 'Maju bersama sampai garis akhir', K.PAL.teal],
  ][phase];
  K.duoCenterProp(ctx, floorY, props[0], props[1], props[2], { col: props[3] });

  // Left: Raka (Red Cap + Vest 01), Right: Bima (Blue Shades + Zip Jacket)
  const rakaPose = phase === 0 ? 'shock' : phase === 1 ? 'talk' : phase === 2 ? 'point' : 'highfive';
  const bimaPose = phase === 0 ? 'talk' : phase === 1 ? 'point' : phase === 2 ? 'talk' : 'highfive';

  K.duoStickman(ctx, 275, floorY, 'raka', rakaPose, { facing: 1, t });
  K.duoStickman(ctx, 805, floorY, 'bima', bimaPose, { facing: -1, t });

  const rakaLines = [
    'Bim, aku matiin alarm lagi tadi pagi!',
    'Cuma 10% kalau niat sendirian?!',
    'Iya juga, malu dong kalau belum ngerjain!',
    'Target hari ini beres semua, tos dulu!',
  ];
  const bimaLines = [
    'Soalnya nggak ada yang nagih janji kamu!',
    'Makanya kita jadwalin lapor bareng: 95%!',
    'Besok jam 8 pagi kirim 3 targetmu ya!',
    'Mantap Rak! Besok kita gas lagi bareng!',
  ];

  K.duoBubble(ctx, 285, 345, 'RAKA', rakaLines[phase], { tailX: 275, tailY: 420, col: K.PAL.red });
  K.duoBubble(ctx, 795, 345, 'BIMA', bimaLines[phase], { tailX: 805, tailY: 420, col: K.PAL.blue });

  if (phase === 0) {
    K.duoCard(ctx, 540, 995, 960, 175, {
      tag: 'KELEMAHAN JANJI RAHASIA (SILENT PROMISE)',
      titleStr: 'Janji yang Hanya Diketahui Diri Sendiri Mudah Dinegosiasi',
      subStr: 'Tidak ada konsekuensi sosial saat kita membatalkan rencana di dalam pikiran',
      stat: 'MUDAH BATAL',
      statSub: 'TANPA SAKSI',
      col: K.PAL.red,
      a: pop(t, C.hook.start + 0.2),
    });
    K.duoCard(ctx, 540, 1210, 960, 175, {
      tag: 'JEBAKAN ISOLASI PRODUKTIVITAS',
      titleStr: 'Berjuang Sendirian Membuat Rasa Malas Terasa Lebih Berat',
      subStr: 'Saat motivasi turun, tidak ada rekan yang mengingatkan alasan kita memulai',
      stat: 'SENDIRI',
      statSub: 'RAWAN MENYERAH',
      col: K.PAL.blue,
      a: pop(t, C.hook.start + 0.6),
    });
  } else if (phase === 1) {
    K.duoCard(ctx, 540, 995, 960, 175, {
      tag: 'TEMUAN RISET ASTD TENTANG PENCAPAIAN TARGET',
      titleStr: 'Punya Ide/Niat Saja Hanya Memiliki Peluang 10% Tercapai',
      subStr: 'Bahkan setelah membuat rencana tertulis, peluangnya baru naik ke kisaran 40–50%',
      stat: '10% SAJA',
      statSub: 'SEKADAR NIAT',
      col: K.PAL.red,
      a: pop(t, C.astd.start),
    });
    K.duoCard(ctx, 540, 1210, 960, 175, {
      tag: 'LONJAKAN 95% DENGAN JADWAL AKUNTABILITAS',
      titleStr: 'Punya Janji Lapor Spesifik ke Partner = 95% Berhasil!',
      subStr: 'Bukan sekadar cerita target, melainkan menjadwalkan waktu evaluasi rutin berdua',
      stat: '95% SUKSES',
      statSub: 'PARTNER RUTIN',
      col: K.PAL.blue,
      a: pop(t, C.astd.start + 0.5),
    });
  } else if (phase === 2) {
    K.duoCard(ctx, 540, 995, 960, 175, {
      tag: 'PSIKOLOGI SOCIAL COMMITMENT',
      titleStr: 'Kita Jauh Lebih Disiplin Saat Ada Sahabat yang Menunggu',
      subStr: 'Keinginan menjaga kepercayaan teman mengalahkan rasa malas di pagi hari',
      stat: 'TERJAGA',
      statSub: 'EFEK SOSIAL',
      col: K.PAL.teal,
      a: pop(t, C.sosial.start),
    });
    K.duoCard(ctx, 540, 1210, 960, 175, {
      tag: 'PROTOKOL PAGI & MALAM RAKA-BIMA',
      titleStr: 'Pagi Kirim 3 Prioritas • Malam Kirim Bukti Selesai',
      subStr: 'Cukup pesan singkat 1 menit setiap hari untuk menjaga api konsistensi menyala',
      stat: '2x CHECK-IN',
      statSub: 'PAGI & MALAM',
      col: K.PAL.blue,
      a: pop(t, C.sosial.start + 0.5),
    });
  } else {
    K.duoCard(ctx, 540, 995, 960, 175, {
      tag: 'SALING MENOPANG SAAT ENERGI TURUN',
      titleStr: 'Ketika Satu Sedang Lelah, Sahabat Menjadi Pengingat',
      subStr: 'Perjalanan panjang terasa dua kali lebih ringan saat ditempuh bersama sahabat',
      stat: '2x RINGAN',
      statSub: 'ENERGI BERSAMA',
      col: K.PAL.teal,
      a: pop(t, C.ringan.start),
    });
    K.duoCard(ctx, 540, 1210, 960, 175, {
      tag: 'PESAN DUO RAKA & BIMA',
      titleStr: 'Hubungi Satu Sahabatmu Hari Ini & Buat Kesepakatan Maju!',
      subStr: 'Ingin cepat jalan sendiri, ingin jauh dan konsisten jalanlah berdua',
      stat: 'GAS BARENG!',
      statSub: '95% TERCAPAI',
      col: K.PAL.red,
      a: pop(t, C.ringan.start + 0.5),
    });
  }
}
