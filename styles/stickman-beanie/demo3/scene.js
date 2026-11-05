// 70 · STICKMAN BEANIE — Demo 3: Efek Spotlight (Thomas Gilovich & Kebebasan Percaya Diri)
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
  if (t >= C.lupa.start) phase = 3;
  else if (t >= C.fakta.start) phase = 2;
  else if (t >= C.gilovich.start) phase = 1;

  const tags = [
    'PANEL 01 • ILUSI LAMPU SOROT DI KEPALA',
    'PANEL 02 • EKSPERIMEN KAOS MENCOLOK CORNELL',
    'PANEL 03 • FAKTA: ORANG LAIN SIBUK SENDIRI!',
    'PANEL 04 • BEBAS BERKARYA TANPA TAKUT MALU',
  ];

  K.beanieBg(ctx, t, { floorY, stageTag: tags[phase], col: phase >= 2 ? K.PAL.teal : K.PAL.beanie });

  const headers = [
    ['MALU?!', 'THE SPOTLIGHT EFFECT', 'Mengapa Kita Merasa Semua Mata Menyorot Kesalahan Kita?'],
    ['50% vs 20%', 'EKSPERIMEN PROF. THOMAS GILOVICH', 'Kita Menaksir Perhatian Orang Lain 2,5x Lipat Terlalu Tinggi!'],
    ['CUEK!', 'SEMUA ORANG SIBUK DENGAN DIRINYA', 'Apa yang Kamu Pikirkan 3 Hari Dilupakan Orang Dalam 3 Menit'],
    ['BEBAS!', 'MATIKAN LAMPU SOROT IMAJINERMU', 'Berani Tampil, Bertanya, dan Berkarya Tanpa Takut Dihakimi!'],
  ][phase];

  K.beanieHeader(ctx, headers[0], headers[1], headers[2], {
    col: phase >= 2 ? K.PAL.teal : K.PAL.beanie,
  });

  K.beanieProps(ctx, floorY, 'spotlight', { phase, t });

  const pose = phase === 0 ? 'shock' : phase === 1 ? 'think' : phase === 2 ? 'confident' : 'action';
  K.beanieStickman(ctx, 390, floorY, pose, { facing: 1, t });

  const bubbles = [
    'Aduh salah ngomong! Semua pasti ngetawain!',
    'Perasaan 50% orang ngelihatin aku...',
    'Eh ternyata nggak ada yang peduli?!',
    'Kalau gitu, ngapain takut mencoba?!',
  ];
  K.beanieBubble(ctx, 390, 365, bubbles[phase], {
    tailX: 390, tailY: 445, col: phase >= 2 ? K.PAL.teal : K.PAL.beanie,
  });

  if (phase === 0) {
    K.beanieCard(ctx, 540, 995, 960, 175, {
      tag: 'BIAS EGOSENTRISME ALAMI',
      titleStr: 'Merasa Menjadi Pusat Perhatian Seluruh Ruangan',
      subStr: 'Saat kupluk miring atau lidah keseleo, kita mengira semua orang langsung menghakimi',
      stat: 'SOROT!',
      statSub: 'ILUSI CEMAS',
      col: K.PAL.beanie,
      a: pop(t, C.hook.start + 0.2),
    });
    K.beanieCard(ctx, 540, 1210, 960, 175, {
      tag: 'DAMPAK PADA KEBERANIAN ANAK MUDA',
      titleStr: 'Takut Bertanya, Takut Upload Karya, Takut Memulai',
      subStr: 'Banyak potensi terkubur hanya karena takut terlihat canggung di awal',
      stat: 'RAGU',
      statSub: 'TAKUT DIHAKIMI',
      col: K.PAL.blue,
      a: pop(t, C.hook.start + 0.6),
    });
  } else if (phase === 1) {
    K.beanieCard(ctx, 540, 995, 960, 175, {
      tag: 'RISET CORNELL UNIVERSITY (GILOVICH, 2000)',
      titleStr: 'Uji Kaos Mencolok di Dalam Ruang Kelas Mahasiswa',
      subStr: 'Peserta diminta menebak berapa banyak teman sekelas yang menyadari kaos mereka',
      stat: '50%',
      statSub: 'TEBAKAN PESERTA',
      col: K.PAL.purple,
      a: pop(t, C.gilovich.start),
    });
    K.beanieCard(ctx, 540, 1210, 960, 175, {
      tag: 'DISTORSI PERSEPSI SOSIAL',
      titleStr: 'Karena Kita Sadar 100%, Kita Mengira Orang Lain Juga Sadar',
      subStr: 'Otak kita kesulitan memisahkan apa yang kita rasakan dengan apa yang dilihat orang',
      stat: 'BIAS',
      statSub: 'LEBIH-LEBIHKAN',
      col: K.PAL.beanie,
      a: pop(t, C.gilovich.start + 0.5),
    });
  } else if (phase === 2) {
    K.beanieCard(ctx, 540, 995, 960, 175, {
      tag: 'HASIL NYATA PENGAMATAN RUANGAN',
      titleStr: 'Lebih dari 80% Orang Sama Sekali Tidak Menyadarinya!',
      subStr: 'Setiap orang terlalu sibuk memikirkan penampilan dan masalahnya sendiri',
      stat: '>80%',
      statSub: 'TIDAK SADAR',
      col: K.PAL.teal,
      a: pop(t, C.fakta.start),
    });
    K.beanieCard(ctx, 540, 1210, 960, 175, {
      tag: 'ATURAN 3 HARI vs 3 MENIT',
      titleStr: 'Yang Kamu Sesali 3 Malam Sudah Dilupakan Dalam 3 Menit',
      subStr: 'Berhentilah memutar ulang adegan memalukan yang hanya hidup di ingatanmu',
      stat: '3 MENIT',
      statSub: 'LANGSUNG LUPA',
      col: K.PAL.blue,
      a: pop(t, C.fakta.start + 0.5),
    });
  } else {
    K.beanieCard(ctx, 540, 995, 960, 175, {
      tag: 'KEBEBASAN PSIKOLOGIS (LIBERATION)',
      titleStr: 'Jika Tidak Ada yang Menghakimi, Kamu Bebas Mencoba!',
      subStr: 'Angkat tangan di kelas, publikasikan karyamu, dan berlatihlah di depan umum',
      stat: 'BERANI!',
      statSub: 'TANPA BEBAN',
      col: K.PAL.teal,
      a: pop(t, C.lupa.start),
    });
    K.beanieCard(ctx, 540, 1210, 960, 175, {
      tag: 'CATATAN SI KUPLUK MERAH',
      titleStr: 'Jadilah Dirimu Sendiri & Matikan Lampu Sorot Palsu Itu',
      subStr: 'Dunia jauh lebih ramah pada orang yang berani mencoba daripada yang bersembunyi',
      stat: 'PD 100%',
      statSub: 'MELANGKAH MAJU',
      col: K.PAL.beanie,
      a: pop(t, C.lupa.start + 0.5),
    });
  }
}
