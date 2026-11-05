// 76 · STICKMAN MINIMAL DARK — Demo 1: Sains Regulasi Emosi (Prof. Tim Pychyl & Self-Compassion)
import * as K from '/styles/stickman-minimal-dark/kit.js';
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
  if (t >= C.urai.start) phase = 3;
  else if (t >= C.maaf.start) phase = 2;
  else if (t >= C.emosi.start) phase = 1;

  const tags = [
    'MODE 01 • BUKAN MASALAH WAKTU, TAPI EMOSI',
    'MODE 02 • LINGKARAN SETAN MENYALAHKAN DIRI',
    'MODE 03 • KEKUATAN SELF-COMPASSION (MEMAAFKAN)',
    'MODE 04 • URAI BENANG KUSUT MENJADI 1 LANGKAH',
  ];

  const col = phase >= 2 ? K.PAL.blue : K.PAL.red;
  K.minimalDarkBg(ctx, t, { floorY, modeTag: tags[phase], col });

  const headers = [
    ['BUKAN MALAS', 'KAMU SEDANG MENGHINDARI RASA CEMAS', 'Riset Prof. Tim Pychyl: Prokrastinasi Adalah Regulasi Emosi'],
    ['EMOSI', 'TAKUT GAGAL & BINGUNG MEMICU PENUNDAAN', 'Menghukum Diri Sendiri Justru Memperbesar Rasa Takut'],
    ['MAAFKAN', 'SELF-COMPASSION MEMUTUS RASA BERSALAH', 'Memaafkan Penundaan Kemarin Mempercepat Langkah Hari Ini'],
    ['JERNIH!', 'KENALI EMOSINYA, KECILKAN LANGKAHNYA', 'Ubah Benang Kusut di Kepala Menjadi Satu Tindakan Tenang'],
  ][phase];

  K.minimalDarkHeader(ctx, headers[0], headers[1], headers[2], { col });

  const diagrams = [
    ['AKAR MASALAH', 'REGULASI EMOSI', 'Bukan karena kurang jadwal waktu', K.PAL.red],
    ['SELF-BLAME LOOP', 'MAKIN CEMAS!', 'Mencaci diri = makin ingin kabur', K.PAL.red],
    ['SELF-COMPASSION', 'TURUNKAN BEBAN', 'Tenangkan batin agar siap mulai', K.PAL.blue],
    ['1 GARIS LURUS', 'PIKIRAN JERNIH', 'Satu langkah konkret tanpa beban', K.PAL.blue],
  ][phase];
  K.minimalDarkDiagram(ctx, floorY, diagrams[0], diagrams[1], diagrams[2], { col: diagrams[3] });

  const charX = 335;
  const state = phase <= 1 ? 'overthink' : 'clarity';
  K.minimalDarkStickman(ctx, charX, floorY, state, { facing: 1, t });

  const bubbles = [
    'Kenapa aku tunda terus ya... apa aku pemalas?',
    'Ternyata aku bukan malas, aku cuma takut hasilnya jelek!',
    'Aku maafkan diriku kemarin, sekarang kita mulai pelan-pelan.',
    'Benang kusutnya hilang begitu aku tahu langkah pertamanya!',
  ];
  K.minimalDarkBubble(ctx, charX + 20, 350, bubbles[phase], { tailX: charX, tailY: 425, col });

  if (phase === 0) {
    K.minimalDarkCard(ctx, 540, 995, 960, 175, {
      tag: 'PARADIGMA BARU PSIKOLOGI MODERN (PYCHYL & SIROIS)',
      titleStr: 'Prokrastinasi Bukanlah Kegagalan Manajemen Waktu',
      subStr: 'Melainkan upaya bawah sadar menghindari emosi negatif yang menempel pada tugas',
      stat: 'EMOSI',
      statSub: 'BUKAN WAKTU',
      col: K.PAL.red,
      a: pop(t, C.hook.start + 0.2),
    });
    K.minimalDarkCard(ctx, 540, 1210, 960, 175, {
      tag: 'PERBAIKAN MOOD JANGKA PENDEK (MOOD REPAIR)',
      titleStr: 'Otak Memilih Kenyamanan Sesaat untuk Meredakan Cemas',
      subStr: 'Memahami mekanisme ini menghentikan kebiasaan mencap diri sendiri pemalas',
      stat: 'PAHAMI',
      statSub: 'TANPA HAKIMI',
      col: K.PAL.white,
      a: pop(t, C.hook.start + 0.6),
    });
  } else if (phase === 1) {
    K.minimalDarkCard(ctx, 540, 995, 960, 175, {
      tag: 'PEMICU UTAMA DI BALIK TUGAS BERAT',
      titleStr: 'Takut Dinilai Buruk, Perfeksionisme, dan Instruksi Kabur',
      subStr: 'Semakin tinggi tuntutan kesempurnaan, semakin berat langkah untuk memulai',
      stat: 'CEMASKAN',
      statSub: 'TAKUT GAGAL',
      col: K.PAL.red,
      a: pop(t, C.emosi.start),
    });
    K.minimalDarkCard(ctx, 540, 1210, 960, 175, {
      tag: 'BAHAYA SELF-CRITICISM (MENGHUKUM DIRI)',
      titleStr: 'Memarahi Diri Sendiri Menambah Stres di Amigdala',
      subStr: 'Rasa bersalah yang berlebihan justru menguras energi yang dibutuhkan untuk bekerja',
      stat: 'KURAS',
      statSub: 'ENERGI MENTAL',
      col: K.PAL.red,
      a: pop(t, C.emosi.start + 0.5),
    });
  } else if (phase === 2) {
    K.minimalDarkCard(ctx, 540, 995, 960, 175, {
      tag: 'STUDI CARLETON UNIVERSITY (WOHL, PYCHYL & BENNETT)',
      titleStr: 'Mahasiswa yang Memaafkan Diri Lebih Sedikit Menunda Berikutnya',
      subStr: 'Belas kasih pada diri sendiri menghapus beban malu sehingga siap melangkah lagi',
      stat: 'MAAFKAN',
      statSub: 'BANGKIT CEPAT',
      col: K.PAL.blue,
      a: pop(t, C.maaf.start),
    });
    K.minimalDarkCard(ctx, 540, 1210, 960, 175, {
      tag: 'DIALOG BATIN YANG KONSTRUKTIF',
      titleStr: '"Bagian Mana yang Bikin Aku Bingung, dan Apa Solusinya?"',
      subStr: 'Ganti kalimat menghakimi dengan pertanyaan ingin tahu yang menenangkan saraf',
      stat: 'SOLUTIF',
      statSub: 'DIALOG TENANG',
      col: K.PAL.white,
      a: pop(t, C.maaf.start + 0.5),
    });
  } else {
    K.minimalDarkCard(ctx, 540, 995, 960, 175, {
      tag: 'MENGURAI KABUT MENJADI LANGKAH TEKNIS',
      titleStr: 'Ubah Kekhawatiran Abstrak Menjadi 1 Tindakan Konkret',
      subStr: 'Saat tugas diperjelas ukurannya, rasa cemas kehilangan kekuatannya',
      stat: '1 LANGKAH',
      statSub: 'TERUKUR JELAS',
      col: K.PAL.blue,
      a: pop(t, C.urai.start),
    });
    K.minimalDarkCard(ctx, 540, 1210, 960, 175, {
      tag: 'CATATAN HENING MALAM INI',
      titleStr: 'Berlemahlembutlah pada Dirimu & Nyalakan Lentera Fokusmu',
      subStr: 'Ketenangan batin adalah fondasi terkuat bagi produktivitas yang sehat',
      stat: 'DAMAI',
      statSub: 'FOKUS SEHAT',
      col: K.PAL.blue,
      a: pop(t, C.urai.start + 0.5),
    });
  }
}
