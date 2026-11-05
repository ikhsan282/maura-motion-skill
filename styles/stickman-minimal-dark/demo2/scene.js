// 76 · STICKMAN MINIMAL DARK — Demo 2: Menghentikan Overthinking Pukul Dua Pagi (Full-Screen 1080x1920 8-Beat Standard)
import * as K from '/styles/stickman-minimal-dark/kit.js';
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
  const floorY = 1240;

  let beat = 0;
  if (t >= C.moral?.start) beat = 7;
  else if (t >= C.besok?.start) beat = 6;
  else if (t >= C.simpan?.start) beat = 5;
  else if (t >= C.baylor?.start) beat = 4;
  else if (t >= C.tuang?.start) beat = 3;
  else if (t >= C.putar?.start) beat = 2;
  else if (t >= C.malam?.start) beat = 1;

  let zoom = 1.0, fx = 540, fy = 880;
  if (beat === 1 || beat === 2) {
    zoom = 1.14; fx = 520; fy = 910;
  } else if (beat >= 4) {
    zoom = 1.15; fx = 560; fy = 930;
  }

  const tags = [
    'MODE 01 • PIKIRAN RAMAI PUKUL DUA PAGI',
    'MODE 02 • PREFRONTAL LELAH, AMIGDALA TERJAGA',
    'MODE 03 • LINGKARAN RUMINASI SEPERTI KASET RUSAK',
    'MODE 04 • TEKNIK BRAIN DUMP: TUANG KE KERTAS',
    'MODE 05 • RISET BAYLOR: TIDUR LEBIH CEPAT',
    'MODE 06 • OTAK MERASA AMAN KARENA TERCATAT',
    'MODE 07 • JANJI PADA DIRI: SELESAIKAN BESOK PAGI',
    'MODE 08 • HAK ISTIRAHAT TENANG BAGI PIKIRANMU',
  ];

  const col = beat >= 4 ? K.PAL.blue : (beat === 2 || beat === 3 ? K.PAL.amber : K.PAL.red);

  K.withCamera(ctx, { zoom, fx, fy }, () => {
    K.minimalDarkBg(ctx, t, { floorY, modeTag: tags[beat], col });

    const diagrams = [
      ['02:00 AM', 'KEPALA RAMAI', 'Kekhawatiran membanjiri saat lampu padam', K.PAL.red],
      ['BIOLOGI MALAM', 'KORTEKS LELAH', 'Logika tidur, emosi membesar-besarkan', K.PAL.red],
      ['RUMINASI', 'KASET RUSAK', 'Berputar di kasur tanpa ada solusi', K.PAL.amber],
      ['BRAIN DUMP', 'TUANG KE KERTAS', 'Pindahkan memori kerja ke luar kepala', K.PAL.blue],
      ['RISET BAYLOR', 'CEPAT TERLELAP', 'Menulis to-do besok memicu tidur lelap', K.PAL.blue],
      ['OFFLOADING', 'OTAK MERASA AMAN', 'Tersimpan rapi dan tidak akan lupa', K.PAL.blue],
      ['BATAS WAKTU', 'URUS BESOK PAGI', 'Beri sinyal aman untuk istirahat total', K.PAL.blue],
      ['ZEN CLARITY', 'TIDUR NYENYAK', 'Beban terlepas, pikiran damai', K.PAL.blue],
    ][beat];
    K.minimalDarkDiagram(ctx, floorY, diagrams[0], diagrams[1], diagrams[2], { col: diagrams[3] });

    const charX = beat <= 3 ? 335 : 365;
    const state = beat <= 3 ? 'overthink' : 'clarity';
    K.minimalDarkStickman(ctx, charX, floorY, state, { facing: 1, t });

    const bubbles = [
      'Lampu udah mati, kok kepalaku malah makin rame?',
      'Korteks logikaku lelah, makanya amigdala lebay!',
      'Mikirin di atas kasur cuma kayak muter kaset rusak!',
      'Ambil buku catatan, tuang semua isi kepala ke kertas!',
      'Riset Baylor: nulis to-do besok bikin tidur jauh lebih cepat!',
      'Otak tenang karena tau semuanya udah aman tercatat!',
      'Semuanya udah rapi di kertas, besok pagi kita beresin!',
      'Lepaskan beban malam ini, selamat tidur dengan tenang!',
    ];
    K.minimalDarkBubble(ctx, charX + 25, floorY - 390, bubbles[beat], {
      tailX: charX + 5, tailY: floorY - 310, col,
    });
  });

  const headers = [
    ['02:00 AM', 'OVERTHINKING DI TENGAH MALAM', 'Mengapa Pikiran Malah Ramai Saat Ingin Terlelap?'],
    ['KORTEKS', 'KESEIMBANGAN OTAK MALAM HARI', 'Pusat Logika Melemah Sementara Pusat Cemas Menguat'],
    ['RUMINASI', 'JEBAKAN MEMUTAR KASET RUSAK', 'Memikirkan Masalah di Kasur Tidak Pernah Menghasilkan Solusi'],
    ['BRAIN DUMP', 'PINDAHKAN KE ATAS KERTAS', 'Keluarkan Seluruh Kekhawatiran dari Memori Kerja'],
    ['BAYLOR', 'RISET KUALITAS TIDUR (2018)', 'Menuliskan Tugas Esok Mempercepat Transisi Menuju Tidur Lelap'],
    ['AMAN', 'COGNITIVE OFFLOADING', 'Otak Berhenti Cemas Saat Tahu Catatan Sudah Tersimpan'],
    ['BESOK', 'BERIKAN BATASAN YANG JELAS', 'Katakan: Masalah Ini Akan Diselesaikan dengan Tenaga Penuh Besok'],
    ['TENANG', 'HAK ISTIRAHAT BAGI JIWAMU', 'Lepaskan Beban Pikiranmu & Nikmati Kedamaian Malam Ini!'],
  ][beat];

  K.minimalDarkHeader(ctx, headers[0], headers[1], headers[2], { col });

  const callouts = [
    { tag: 'NOCTURNAL ANXIETY', title: 'Lampu Padam, Volume Pikiran Melonjak Tajam', desc: 'Ketiadaan distraksi luar membuat otak memperbesar setiap kecemasan kecil', stat: '02:00 AM', col: K.PAL.red, c: C.hook },
    { tag: 'NEUROBIOLOGI', title: 'Prefrontal Melemah, Amigdala Mendominasi Malam', desc: 'Otak di malam hari bukanlah alat yang objektif untuk mengevaluasi hidupmu', stat: 'AMIGDALA', col: K.PAL.red, c: C.malam },
    { tag: 'LOOP RUMINASI', title: 'Memori Kerja Terjebak Putaran Tanpa Henti', desc: 'Ruminasi di atas tempat tidur hanya memicu insomnia dan keletihan mental', stat: 'RUMINASI', col: K.PAL.amber, c: C.putar },
    { tag: 'BRAIN DUMPING', title: 'Eksternalisasi Pikiran Mengosongkan RAM Otak', desc: 'Menulis tangan memindahkan ketegangan mental menjadi objek fisik di atas meja', stat: 'BRAIN DUMP', col: K.PAL.blue, c: C.tuang },
    { tag: 'STUDI UNIVERSITAS BAYLOR', title: 'Tidur Lebih Cepat 9 Menit dengan To-Do List', desc: 'Scullin et al: Menulis 5 menit daftar tugas spesifik meredakan dorongan cemas', stat: 'BAYLOR 2018', col: K.PAL.blue, c: C.baylor },
    { tag: 'COGNITIVE OFFLOAD', title: 'Otak Merasa Aman Karena Data Tidak Hilang', desc: 'Mekanisme biologis berhenti membunyikan alarm saat catatan sudah tersimpan', stat: 'OFFLOAD', col: K.PAL.blue, c: C.simpan },
    { tag: 'PSYCHOLOGICAL BOUNDARY', title: 'Tutup Buku Catatan Sebagai Simbol Penutupan Hari', desc: 'Beri izin pada dirimu sendiri untuk berhenti berpikir sampai fajar menyingsing', stat: 'BESOK PAGI', col: K.PAL.blue, c: C.besok },
    { tag: 'PESAN JUARA', title: 'Tidurlah dengan Ketenangan yang Utuh Malam Ini', desc: 'Pindahkan bebanmu ke kertas, istirahatkan pikiranmu, dan bangun segar esok!', stat: 'ZEN TIDUR', col: K.PAL.blue, c: C.moral },
  ][beat];

  K.minimalDarkCallout(ctx, 540, 1485, 960, 165, {
    tag: callouts.tag,
    title: callouts.title,
    desc: callouts.desc,
    stat: callouts.stat,
    col: callouts.col,
    a: pop(t, callouts.c ? callouts.c.start + 0.15 : 0),
  });
}
