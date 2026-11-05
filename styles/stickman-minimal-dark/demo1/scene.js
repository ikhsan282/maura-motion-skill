// 76 · STICKMAN MINIMAL DARK — Demo 1: Sains Regulasi Emosi (Full-Screen 1080x1920 8-Beat Standard)
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
  else if (t >= C.urai?.start) beat = 6;
  else if (t >= C.tanya?.start) beat = 5;
  else if (t >= C.maaf?.start) beat = 4;
  else if (t >= C.rasa?.start) beat = 3;
  else if (t >= C.emosi?.start) beat = 2;
  else if (t >= C.pychyl?.start) beat = 1;

  let zoom = 1.0, fx = 540, fy = 880;
  if (beat === 1 || beat === 2) {
    zoom = 1.14; fx = 520; fy = 910;
  } else if (beat >= 4) {
    zoom = 1.15; fx = 560; fy = 930;
  }

  const tags = [
    'MODE 01 • BERHENTI MENCACI DIRI SENDIRI',
    'MODE 02 • RISET TIM PYCHYL: REGULASI EMOSI',
    'MODE 03 • MENGHINDARI RASA CEMAS & BINGUNG',
    'MODE 04 • HUKUMAN DIRI MEMBESARKAN KETAKUTAN',
    'MODE 05 • KEKUATAN MEMAAFKAN (SELF-COMPASSION)',
    'MODE 06 • DIALOG BATIN: APA YANG MEMBUAT CEMAS?',
    'MODE 07 • URAI BENANG KUSUT JADI LANGKAH TEKNIS',
    'MODE 08 • LANGKAH TENANG DENGAN PIKIRAN JERNIH',
  ];

  const col = beat >= 4 ? K.PAL.blue : (beat === 2 || beat === 3 ? K.PAL.amber : K.PAL.red);

  K.withCamera(ctx, { zoom, fx, fy }, () => {
    K.minimalDarkBg(ctx, t, { floorY, modeTag: tags[beat], col });

    const diagrams = [
      ['BUKAN MALAS', 'LABEL SALAH', 'Mencaci diri tidak menyelesaikan masalah', K.PAL.red],
      ['TIM PYCHYL', 'REGULASI EMOSI', 'Prokrastinasi adalah respon emosional', K.PAL.red],
      ['RASA CEMAS', 'TAKUT GAGAL', 'Menunda demi meredakan rasa tidak nyaman', K.PAL.amber],
      ['LINGKARAN SETAN', 'MAKIN CEMAS!', 'Kata kasar memicu otak kabur lebih jauh', K.PAL.red],
      ['SELF-COMPASSION', 'MAAFKAN DIRI', 'Berdamai dengan penundaan masa lalu', K.PAL.blue],
      ['DIALOG LEMBUT', 'CARI AKAR TAKUT', 'Tanyakan bagian mana yang membingungkan', K.PAL.blue],
      ['BENANG TERURAI', '1 AKSI TEKNIS', 'Kabut ketakutan hilang seketika', K.PAL.blue],
      ['ZEN CLARITY', 'PIKIRAN JERNIH', 'Melangkah damai tanpa beban batin', K.PAL.blue],
    ][beat];
    K.minimalDarkDiagram(ctx, floorY, diagrams[0], diagrams[1], diagrams[2], { col: diagrams[3] });

    const charX = beat <= 3 ? 335 : 365;
    const state = beat <= 3 ? 'overthink' : 'clarity';
    K.minimalDarkStickman(ctx, charX, floorY, state, { facing: 1, t });

    const bubbles = [
      'Kenapa kutunda terus ya? Apa aku pemalas?',
      'Riset Prof Tim Pychyl: ini bukan masalah waktu!',
      'Ternyata aku menunda karena takut gagal dan bingung!',
      'Makin kucaci diri sendiri, makin takut aku mulai!',
      'Memaafkan diri kemarin bikin aku lebih cepat melangkah!',
      'Bagian mana dari tugas ini yang bikin aku cemas?',
      'Begitu langkah teknisnya jelas, benang kusutnya hilang!',
      'Peluk kecemasanmu, maafkan diri, dan melangkah jernih!',
    ];
    K.minimalDarkBubble(ctx, charX + 25, floorY - 390, bubbles[beat], {
      tailX: charX + 5, tailY: floorY - 310, col,
    });
  });

  const headers = [
    ['BUKAN MALAS', 'KAMU SEDANG MENGHINDARI CEMAS', 'Berhentilah Mencaci Dirimu Sebagai Orang Pemalas'],
    ['PYCHYL', 'RISET SAINS REGULASI EMOSI', 'Prokrastinasi Bukan Masalah Waktu, Tapi Pengelolaan Emosi'],
    ['CEMAS', 'MENGHINDARI RASA TIDAK NYAMAN', 'Tugas Berat Memicu Perasaan Takut Gagal dan Bingung'],
    ['HUKUMAN', 'BAHAYA SELF-CRITICISM KASAR', 'Menghukum Diri Sendiri Membuat Otak Semakin Ingin Kabur'],
    ['MAAFKAN', 'KEKUATAN SELF-COMPASSION', 'Memaafkan Penundaan Kemarin Mempercepat Aksi Hari Ini'],
    ['DIALOG', 'TANYAKAN DENGAN LEMBUT PADA DIRI', 'Identifikasi Bagian Mana yang Terasa Membebani Pikiran'],
    ['URAIKAN', 'SATU LANGKAH TEKNIS KONKRET', 'Ketika Tugas Menjadi Jelas, Kabut Ketakutan Menghilang'],
    ['JERNIH', 'KEDAMAIAN BATIN MEMBAWA FOKUS', 'Peluk Rasa Cemasmu & Melangkahlah Tanpa Beban Moral!'],
  ][beat];

  K.minimalDarkHeader(ctx, headers[0], headers[1], headers[2], { col });

  const callouts = [
    { tag: 'LABEL IDENTITAS', title: 'Berhenti Menghakimi Diri Sendiri Sebagai Pemalas', desc: 'Label negatif menanamkan keyakinan palsu yang memperparah prokrastinasi', stat: 'BUKAN MALAS', col: K.PAL.red, c: C.hook },
    { tag: 'RISET TIM PYCHYL', title: 'Prokrastinasi Adalah Masalah Regulasi Emosi', desc: 'Carleton University: Upaya bawah sadar menghindari emosi negatif pada tugas', stat: 'REGULASI', col: K.PAL.red, c: C.pychyl },
    { tag: 'EMOTIONAL AVOIDANCE', title: 'Takut Gagal & Rasa Kurang Mampu Memicu Pelarian', desc: 'Otak memilih kenyamanan sesaat untuk meredakan ketegangan amigdala', stat: 'TAKUT GAGAL', col: K.PAL.amber, c: C.emosi },
    { tag: 'SELF-CRITICISM LOOP', title: 'Kata Kasar Membebani Prefrontal Cortex', desc: 'Rasa bersalah berlebihan menguras energi kognitif yang dibutuhkan untuk aksi', stat: 'MAKIN CEMAS', col: K.PAL.red, c: C.rasa },
    { tag: 'SELF-COMPASSION', title: 'Memaafkan Diri Memutus Siklus Penyesalan', desc: 'Studi Wohl: Siswa yang memaafkan diri sendiri jauh lebih produktif esok hari', stat: 'MAAFKAN', col: K.PAL.blue, c: C.maaf },
    { tag: 'CURIOUS DIALOGUE', title: 'Tanyakan: Bagian Mana yang Membuatku Bingung?', desc: 'Mengganti suara menghakimi dengan rasa ingin tahu yang menenangkan saraf', stat: 'DIALOG', col: K.PAL.blue, c: C.tanya },
    { tag: 'ACTION CLARITY', title: 'Urai Benang Kusut Menjadi 1 Aksi Sederhana', desc: 'Rasa takut langsung menguap begitu langkah pertama didefinisikan secara mikro', stat: '1 LANGKAH', col: K.PAL.blue, c: C.urai },
    { tag: 'PESAN JUARA', title: 'Melangkah Tenang dengan Hati yang Damai', desc: 'Ketenangan batin adalah fondasi terkuat bagi produktivitas yang hakiki!', stat: 'ZEN DAMAI', col: K.PAL.blue, c: C.moral },
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
