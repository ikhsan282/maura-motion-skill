// 71 · STICKMAN CAVEMAN — Demo 3: Jebakan Buah Beri Digital (Full-Screen 1080x1920 8-Beat Standard)
import * as K from '/styles/stickman-caveman/kit.js';
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
  else if (t >= C.jarak?.start) beat = 6;
  else if (t >= C.usaha?.start) beat = 5;
  else if (t >= C.pagi?.start) beat = 4;
  else if (t >= C.tumpul?.start) beat = 3;
  else if (t >= C.algoritma?.start) beat = 2;
  else if (t >= C.beri?.start) beat = 1;

  let zoom = 1.0, fx = 540, fy = 880;
  if (beat === 1 || beat === 2) {
    zoom = 1.15; fx = 580; fy = 920;
  } else if (beat >= 4) {
    zoom = 1.16; fx = 520; fy = 940;
  }

  const tags = [
    'GUA 01 • KETAGIHAN SCROLL BERJAM-JAM',
    'GUA 02 • BUAH BERI PURBA & HADIAH DOPAMIN',
    'GUA 03 • ALGORITMA DIGITAL: MESIN JACKPOT',
    'GUA 04 • RESEPTOR TUMPUL & KEHILANGAN FOKUS',
    'GUA 05 • ATURAN PURBA: BERBURU DULU, PESTA NANTI',
    'GUA 06 • DOPAMIN ALAMI DARI TUGAS BESAR',
    'GUA 07 • HAMBATAN FISIK: JAUHKAN PONSEL',
    'GUA 08 • UTAMAKAN BURUAN BESAR MASA DEPAN!',
  ];

  K.withCamera(ctx, { zoom, fx, fy }, () => {
    K.cavemanBg(ctx, t, { floorY, stageTag: tags[beat], col: beat >= 4 ? K.PAL.teal : (beat === 2 || beat === 3 ? K.PAL.fire : K.PAL.ochre) });
    K.cavemanProps(ctx, floorY, beat >= 4 ? 'fire' : 'pebbles', { phase: beat >= 4 ? 2 : 0, t });

    const charX = beat <= 3 ? 380 : 470;
    const pose = beat === 0 ? 'scratch' : beat <= 2 ? 'push' : beat === 3 ? 'scratch' : beat <= 5 ? 'strike' : 'triumph';
    K.cavemanStickman(ctx, charX, floorY, pose, { facing: 1, t });

    const bubbles = [
      'Scroll feed 2 jam cepet banget, belajar 5 menit ngantuk!',
      'Buah beri manis itu hadiah langka zaman purba!',
      'Sosmed jadi mesin slot: dopamin instan tanpa henti!',
      'Reseptor tumpul, baca buku mendadak hambar!',
      'Berburu dulu baru pesta! 1 jam pagi tanpa gadget!',
      'Selesaikan buruan besar, dopamin alami bertahan lama!',
      'Jauhkan ponsel ke kamar lain saat bekerja!',
      'Kejar buruan besar, rayakan saat tugas tuntas!',
    ];
    K.cavemanBubble(ctx, charX + 50, floorY - 380, bubbles[beat], {
      tailX: charX + 15, tailY: floorY - 300, col: beat >= 4 ? K.PAL.teal : (beat === 2 || beat === 3 ? K.PAL.fire : K.PAL.ochre),
    });
  });

  const headers = [
    ['SCROLLING', 'JEBAKAN BUAH BERI DIGITAL', 'Mengapa Kita Sangat Mudah Kecanduan Menatap Layar?'],
    ['BERI MANIS', 'EVOLUSI DOPAMIN PURBA', 'Dopamin Dirancang Menghadiahi Penemuan Nutrisi & Hal Baru'],
    ['JACKPOT!', 'SLOT MACHINE DI KANTONGMU', 'Algoritma Membanjiri Otak dengan Ribuan Stimulus Instan'],
    ['TUMPUL!', 'DESENSITISASI RESEPTOR DOPAMIN', 'Saat Ambang Rangsangan Naik, Pekerjaan Nyata Terasa Membosankan'],
    ['1 JAM PAGI', 'ATURAN BERBURU DULU BARU PESTA', 'Jangan Sentuh Hiburan Instan di Jam Pertama Setelah Bangun'],
    ['DOPAMIN NYATA', 'BURUAN BESAR MEMBAWA BANGGA', 'Menuntaskan Tugas Berat Memproduksi Kepuasan Berkelanjutan'],
    ['JAUHKAN', 'PASANG HAMBATAN JARAK FISIK', 'Letakkan Ponsel di Ruangan Lain Agar Si Uga Tak Tergoda'],
    ['BURUAN BESAR', 'FOKUS PADA MASA DEPANMU', 'Jadikan Kesenangan Sebagai Hadiah Setelah Berburu Selesai!'],
  ][beat];

  K.cavemanHeader(ctx, headers[0], headers[1], headers[2], {
    col: beat >= 4 ? K.PAL.teal : (beat === 2 || beat === 3 ? K.PAL.fire : K.PAL.ochre),
  });

  const callouts = [
    { tag: 'PARADOKS FOKUS', title: 'Mudah Menatap Layar Berjam-jam Tapi Susah Belajar', desc: 'Otak kita mencari jalur termudah untuk mendapatkan rasa puas', stat: 'SCROLL', col: K.PAL.amber, c: C.hook },
    { tag: 'SISTEM REWARD', title: 'Buah Manis & Informasi Baru Langka di Alam Liar', desc: 'Dopamin adalah zat pemandu yang memotivasi manusia gua menjelajah', stat: 'REWARD', col: K.PAL.ochre, c: C.beri },
    { tag: 'VARIABLE REWARD', title: 'Algoritma Didesain Mirip Mesin Judi Kasino', desc: 'Ketidakpastian konten baru memicu lonjakan dopamin tak wajar', stat: 'JACKPOT', col: K.PAL.fire, c: C.algoritma },
    { tag: 'DOWNREGULATION', title: 'Reseptor D2 Berkurang Akibat Stimulasi Terus-Menerus', desc: 'Otak menurunkan sensitivitas, membuat dunia nyata serba hambar', stat: 'TUMPUL', col: K.PAL.fire, c: C.tumpul },
    { tag: 'PROTOKOL PAGI', title: 'Pertahankan Kadar Dopamin Rendah di Pagi Hari', desc: 'Satu jam pertama tanpa layar melindungi kejernihan mentalmu', stat: 'NO SCREEN', col: K.PAL.teal, c: C.pagi },
    { tag: 'DEEP WORK', title: 'Kemenangan Nyata Mengalirkan Kepuasan Hakiki', desc: 'Dopamin dari hasil kerja keras tidak memicu kejatuhan mental (crash)', stat: 'BURUAN', col: K.PAL.teal, c: C.usaha },
    { tag: 'FRICTION BIAS', title: 'Jarak 10 Meter Menurunkan Godaan Membuka Ponsel', desc: 'Hambatan sekecil apapun membuat otak enggan bersikap impulsif', stat: 'JARAK', col: K.PAL.amber, c: C.jarak },
    { tag: 'PESAN JUARA', title: 'Jadilah Pemburu yang Disiplin, Bukan Korban Jebakan', desc: 'Selesaikan buruan besar harimu dan nikmati hasilnya dengan tenang!', stat: 'JUARA', col: K.PAL.ochre, c: C.moral },
  ][beat];

  K.cavemanCallout(ctx, 540, 1485, 960, 165, {
    tag: callouts.tag,
    title: callouts.title,
    desc: callouts.desc,
    stat: callouts.stat,
    col: callouts.col,
    a: pop(t, callouts.c ? callouts.c.start + 0.15 : 0),
  });
}
