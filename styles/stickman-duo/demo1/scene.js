// 73 · STICKMAN DUO — Demo 1: Mager Sendirian vs Gas Bareng (Full-Screen 1080x1920 8-Beat Standard)
import * as K from '/styles/stickman-duo/kit.js';
const { clamp, ease } = AM.lib;

export const meta = { fps: 30, width: 1080, height: 1920, captions: { preset: 'clean', y: 1700, size: 48 } };

let ctx;
const C = {};
const pop = (t, a, d = 0.45) => ease.outBack(clamp((t - a) / d), 1.7);

export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
}

export function render(t) {
  ctx.clearRect(0, 0, 1080, 1920);
  const floorY = 1230;

  let beat = 0;
  if (t >= C.moral?.start) beat = 7;
  else if (t >= C.ringan?.start) beat = 6;
  else if (t >= C.aturan?.start) beat = 5;
  else if (t >= C.sosial?.start) beat = 4;
  else if (t >= C.janji?.start) beat = 3;
  else if (t >= C.astd?.start) beat = 2;
  else if (t >= C.batal?.start) beat = 1;

  let zoom = 1.0, fx = 540, fy = 880;
  if (beat === 2 || beat === 3) {
    zoom = 1.14; fx = 540; fy = 910;
  } else if (beat >= 4) {
    zoom = 1.15; fx = 540; fy = 930;
  }

  const tags = [
    'EPISODE 01 • JANJI SENDIRIAN MUDAH BATAL',
    'EPISODE 02 • TANPA SAKSI, RENCANA HILANG',
    'EPISODE 03 • RISET ASTD: CUMA 10% JIKA NIAT SAJA',
    'EPISODE 04 • LONJAKAN 95% DENGAN PARTNER RUTIN',
    'EPISODE 05 • OTAK MENJAGA REPUTASI SOSIAL',
    'EPISODE 06 • PROTOKOL 3 TARGET PAGI & LAPOR MALAM',
    'EPISODE 07 • SALING MENOPANG SAAT SEMANGAT TURUN',
    'EPISODE 08 • GAS BARENG, SUKSES BERSAMA!',
  ];

  K.withCamera(ctx, { zoom, fx, fy }, () => {
    K.duoBg(ctx, t, { floorY, episodeTag: tags[beat], col: beat >= 4 ? K.PAL.teal : (beat === 2 || beat === 3 ? K.PAL.blue : K.PAL.red) });

    const props = [
      ['SOLO', 'RAWAN BATAL', 'Tanpa saksi mudah mundur', K.PAL.red],
      ['SENDIRI', 'BATAL DIAM-DIAM', 'Negosiasi rasa malas', K.PAL.red],
      ['ASTD STUDI', 'CUMA 10%', 'Niat saja sangat rapuh', K.PAL.blue],
      ['DUO GOAL', '95% SUKSES', 'Jadwal lapor = tuntas!', K.PAL.teal],
      ['SOSIAL', 'REPUTASI AMAN', 'Segan bikin sahabat kecewa', K.PAL.teal],
      ['PROTOKOL', '3 TARGET/HARI', 'Pagi setor, malam cek', K.PAL.blue],
      ['SINERGI', '2x LEBIH KUAT', 'Tarik saat teman lelah', K.PAL.teal],
      ['GAS BARENG!', '100% TUNTAS', 'Raka & Bima tembus target!', K.PAL.teal],
    ][beat];
    K.duoCenterProp(ctx, floorY, props[0], props[1], props[2], { col: props[3] });

    // Left: Raka (Red Cap), Right: Bima (Blue Shades)
    const rakaPose = beat === 0 ? 'shock' : beat === 1 ? 'shock' : beat === 2 ? 'talk' : beat === 3 ? 'point' : beat <= 5 ? 'talk' : 'highfive';
    const bimaPose = beat === 0 ? 'talk' : beat === 1 ? 'point' : beat === 2 ? 'point' : beat === 3 ? 'talk' : beat <= 5 ? 'point' : 'highfive';

    K.duoStickman(ctx, 280, floorY, 'raka', rakaPose, { facing: 1, t });
    K.duoStickman(ctx, 800, floorY, 'bima', bimaPose, { facing: -1, t });

    const rakaBubbles = [
      'Alarm bunyi langsung kumatiin, mager!',
      'Iya sih, ga ada yang tahu kalau batal...',
      'Hah?! Cuma 10% kalau niat sendirian?!',
      'Seriusan bisa lonjak sampai 95%?!',
      'Bener juga, malu dong kalau Bima nunggu!',
      'Oke! Pagi kirim 3 target, malam lapor!',
      'Pas lagi lelah, Bima narik semangatku!',
      'Gak ada lagi mager, kita gas bareng!',
    ];
    const bimaBubbles = [
      'Soalnya kamu janji sendirian di kamar!',
      'Tanpa saksi, rasa malas gampang menang!',
      'Betul! Riset ASTD buktiin niat doang rapuh!',
      'Jadwalin lapor bareng, langsung 95%!',
      'Otak manusia jaga komitmen ke sahabat!',
      'Siap Rak! Aku pantau targetmu tiap hari!',
      'Sahabat sejati gak biarin kamu menyerah!',
      'Tos dulu Rak! Kita tuntaskan bersama!',
    ];

    const activeSpeaker = beat % 2 === 0 ? 'bima' : 'raka';
    K.duoBubble(ctx, 280, floorY - 390, 'RAKA', rakaBubbles[beat], {
      tailX: 280, tailY: floorY - 310, col: K.PAL.red,
    });
    K.duoBubble(ctx, 800, floorY - 390, 'BIMA', bimaBubbles[beat], {
      tailX: 800, tailY: floorY - 310, col: K.PAL.blue,
    });
  });

  const headers = [
    ['10% vs 95%', 'MAGER SENDIRIAN vs GAS BARENG', 'Mengapa Janji di Dalam Kepala Sangat Mudah Dilanggar?'],
    ['TANPA SAKSI', 'ILUSI JANJI SENDIRIAN', 'Tidak Ada Konsekuensi Sosial Saat Membatalkan Rencana'],
    ['STUDI ASTD', 'NIAT SAJA CUMA 10% SUKSES', 'Kemauan Pikiran Terlalu Lemah Melawan Godaan Malas'],
    ['95% SUKSES', 'PARTNER AKUNTABILITAS RUTIN', 'Punya Jadwal Lapor Spesifik Melejitkan Peluang Sukses'],
    ['KOMITMEN', 'PSIKOLOGI REPUTASI SOSIAL', 'Kita Segan Mengecewakan Sahabat yang Sudah Menunggu'],
    ['3 TARGET', 'PROTOKOL PAGI & MALAM', 'Kirim 3 Sasaran Tiap Pagi, Laporkan Buktinya Tiap Malam'],
    ['SINERGI', 'SALING MENARIK SAAT LELAH', 'Beban Terasa Jauh Lebih Ringan Saat Berlari Berdua'],
    ['GAS BARENG!', 'JANGAN BERJUANG SENDIRIAN', 'Gandeng Sahabat Akuntabilitasmu & Raih Impian Bersama!'],
  ][beat];

  K.duoHeader(ctx, headers[0], headers[1], headers[2], {
    col: beat >= 4 ? K.PAL.teal : (beat === 2 || beat === 3 ? K.PAL.blue : K.PAL.red),
  });

  const callouts = [
    { tag: 'SILENT PROMISE', title: 'Janji Rahasia ke Diri Sendiri Mudah Dinegosiasi', desc: 'Saat tidak ada saksi, otak mencari alasan termudah untuk rebahan', stat: 'RAWAN', col: K.PAL.red, c: C.hook },
    { tag: 'ISOLASI AKSI', title: 'Tanpa Akuntabilitas, Rencana Besar Cepat Menguap', desc: 'Batal di dalam pikiran terasa aman karena tidak ada rasa malu', stat: 'BATAL', col: K.PAL.red, c: C.batal },
    { tag: 'TEMUAN ASTD', title: 'Riset: Sekadar Punya Ide Cuma 10% Peluang Berhasil', desc: 'Rencana tertulis pun hanya mencapai tingkat keberhasilan 40-50%', stat: '10% SAJA', col: K.PAL.blue, c: C.astd },
    { tag: 'LONJAKAN DRASTIS', title: 'Punya Janji Lapor Rutin ke Partner = 95% Sukses!', desc: 'Komitmen waktu yang pasti mengubah angan-angan menjadi aksi konkret', stat: '95% GOAL', col: K.PAL.teal, c: C.janji },
    { tag: 'SOCIAL BRAIN', title: 'Naluri Menjaga Kepercayaan Mengalahkan Rasa Malas', desc: 'Otak manusia secara biologis menghindari rasa bersalah kepada teman', stat: 'SOSIAL', col: K.PAL.teal, c: C.sosial },
    { tag: 'RUTINITAS MIKRO', title: 'Kirim 3 Sasaran Pagi, Lapor Hasil Singkat di Malam Hari', desc: 'Hanya butuh 2 menit per hari untuk menjaga akuntabilitas tetap aktif', stat: '3 TARGET', col: K.PAL.blue, c: C.aturan },
    { tag: 'EFEK PENGUNGKIT', title: 'Ketika Satu Sedang Drop, Sahabat Menarik Kembali', desc: 'Tidak ada hari yang terbuang sia-sia jika saling menyemangati', stat: 'SINERGI', col: K.PAL.teal, c: C.ringan },
    { tag: 'PESAN JUARA', title: 'Temukan Partner Perjuanganmu Sekarang Juga', desc: 'Gandeng sahabatmu hari ini dan buktikan kekuatan 95% keberhasilan!', stat: 'JUARA', col: K.PAL.teal, c: C.moral },
  ][beat];

  K.duoCallout(ctx, 540, 1485, 960, 165, {
    tag: callouts.tag,
    title: callouts.title,
    desc: callouts.desc,
    stat: callouts.stat,
    col: callouts.col,
    a: pop(t, callouts.c ? callouts.c.start + 0.15 : 0),
  });
}
