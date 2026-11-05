// 70 · STICKMAN BEANIE — Demo 3: Efek Spotlight & Rasa Malu Sosial (Full-Screen 1080x1920 8-Beat Standard)
import * as K from '/styles/stickman-beanie/kit.js';
const { clamp, lerp, ease } = AM.lib;

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
  if (t >= C.moral?.start) beat = 9;
  else if (t >= C.bebas?.start) beat = 8;
  else if (t >= C.lupa?.start) beat = 7;
  else if (t >= C.pusat?.start) beat = 6;
  else if (t >= C.fakta?.start) beat = 5;
  else if (t >= C.tebak?.start) beat = 4;
  else if (t >= C.kaos?.start) beat = 3;
  else if (t >= C.gilovich?.start) beat = 2;
  else if (t >= C.sorot?.start) beat = 1;

  let zoom = 1.0, fx = 540, fy = 880;
  if (beat >= 1 && beat <= 4) {
    zoom = 1.15; fx = 500; fy = 920;
  } else if (beat >= 6) {
    zoom = 1.14; fx = 580; fy = 940;
  }

  const tags = [
    'PANEL 01 • SALAH UCAP SAAT PRESENTASI',
    'PANEL 02 • LAMPU SOROT IMAJINER',
    'PANEL 03 • THE SPOTLIGHT EFFECT (GILOVICH)',
    'PANEL 04 • EKSPERIMEN KAOS MEMALUKAN',
    'PANEL 05 • EKSPEKTASI: 50% MELIHAT!',
    'PANEL 06 • REALITA: KURANG DARI 20% SADAR!',
    'PANEL 07 • SETIAP ORANG TOKOH UTAMA DIRINYA',
    'PANEL 08 • KAMU CEMAS 3 HARI, MEREKA LUPA 3 MENIT',
    'PANEL 09 • KABAR PALING MEMBEBASKAN HIDUP',
    'PANEL 10 • MATIKAN LAMPU SOROT, TERUS MAJU!',
  ];

  K.withCamera(ctx, { zoom, fx, fy }, () => {
    K.beanieBg(ctx, t, { floorY, stageTag: tags[beat], col: beat >= 6 ? K.PAL.teal : K.PAL.beanie });
    K.beanieProps(ctx, floorY, 'spotlight', { phase: beat >= 6 ? 2 : 0, t });

    const charX = beat <= 4 ? 380 : 480;
    const pose = beat === 0 ? 'shock' : beat <= 4 ? 'think' : beat <= 6 ? 'action' : 'confident';
    K.beanieStickman(ctx, charX, floorY, pose, { facing: 1, t });

    const bubbles = [
      'Aduh, salah ngomong! Pasti dilihat semua orang...',
      'Rasanya kayak disorot lampu raksasa!',
      'Riset Gilovich: itu cuma ilusi kita sendiri!',
      'Pakai kaos memalukan masuk ke kelas...',
      'Kira-kira 50% orang bakal ngetawain!',
      'Faktanya: kurang dari 20% yang sadar!',
      'Orang lain sibuk mikirin urusan masing-masing!',
      'Kita kepikiran 3 hari, mereka lupa dalam 3 menit!',
      'Ini kabar paling membebaskan!',
      'Matikan lampu sorot imajiner, gas terus!',
    ];
    K.beanieBubble(ctx, charX + 50, floorY - 380, bubbles[beat], {
      tailX: charX + 15, tailY: floorY - 300, col: beat >= 6 ? K.PAL.teal : K.PAL.beanie,
    });
  });

  const headers = [
    ['MALU?', 'ILUSI EFEK SPOTLIGHT', 'Mengapa Kita Merasa Semua Orang Menghakimi Kita?'],
    ['SOROT', 'LAMPU SOROT DI DALAM KEPALA', 'Merasa Kesalahan Kecil Terlihat Jelas oleh Dunia'],
    ['GILOVICH', 'TEMUAN UNIVERSITAS CORNELL', 'Eksperimen Psikologi Sosial Thomas Gilovich'],
    ['KAOS', 'UJI COBA KAOS MEMALUKAN', 'Masuk Ruangan dengan Baju Paling Mencolok'],
    ['50%', 'DUGAAN KITA: SEMUA MELIHAT!', 'Otak Melebih-lebihkan Perhatian Orang Lain'],
    ['<20%', 'FAKTANYA: HAMPIR SEMUA CUEK!', 'Mayoritas Orang Tidak Sadar & Tidak Peduli'],
    ['SIBUK', 'MEREKA SIBUK DENGAN DIRINYA', 'Setiap Manusia Fokus pada Rasa Cemas Sendiri'],
    ['3 MENIT', 'MEREKA LUPA DALAM 3 MENIT', 'Jangan Menghabiskan 3 Malam Meratapi Hal Sepele'],
    ['BEBAS!', 'KABAR PALING MELEGAKAN', 'Tidak Ada yang Memperhatikanmu Seketat Dugaanmu'],
    ['BERANI', 'MATIKAN SOROTNYA, TERUS BERKARYA', 'Beranilah Melangkah Tanpa Takut Dinilai Orang!'],
  ][beat];

  K.beanieHeader(ctx, headers[0], headers[1], headers[2], {
    col: beat >= 6 ? K.PAL.teal : K.PAL.beanie,
  });

  const callouts = [
    { tag: 'KECEMASAN SOSIAL', title: 'Tersandung Sedikit Terasa Malu Seharian', desc: 'Merasa semua pasang mata sedang mengamati dan menilai kita', stat: 'CEMAS', col: K.PAL.beanie, c: C.hook },
    { tag: 'LAMPU SOROT', title: 'Melebih-lebihkan Tingkat Perhatian Orang Lain', desc: 'Otak memproyeksikan rasa cemas kita keluar seolah orang lain melihatnya', stat: 'SOROT', col: K.PAL.purple, c: C.sorot },
    { tag: 'RISET CORNELL', title: 'Thomas Gilovich & Kenneth Savitsky (2000)', desc: 'Meneliti perbedaan antara apa yang kita bayangkan vs apa yang orang lain lihat', stat: 'RISET', col: K.PAL.blue, c: C.gilovich },
    { tag: 'EKSPERIMEN KAOS', title: 'Memakai Kaos Barry Manilow yang Kuno', desc: 'Mahasiswa diminta masuk ke keramaian dengan atribut yang dianggap memalukan', stat: 'KAOS', col: K.PAL.purple, c: C.kaos },
    { tag: 'DUGAAN 50%', title: 'Yakin Setengah Isi Ruangan Menyadari Kejanggalan', desc: 'Kita mengira orang lain memiliki radar super untuk kesalahan kita', stat: '50%', col: K.PAL.beanie, c: C.tebak },
    { tag: 'FAKTA <20%', title: 'Sebagian Besar Orang Benar-Benar Tidak Tahu', desc: 'Rasa malu kita ternyata 2,5 kali lipat lebih besar dari kenyataan', stat: '<20%', col: K.PAL.teal, c: C.fakta },
    { tag: 'EGOSENTRIS', title: 'Semua Orang Sibuk Menjadi Tokoh Utama Hidupnya', desc: 'Orang lain terlalu sibuk memikirkan penampilan dan masalahnya sendiri', stat: 'SIBUK', col: K.PAL.gold, c: C.pusat },
    { tag: 'WAKTU LUPA', title: 'Kesalahanmu Cuma Lewat Sekilas di Memori Mereka', desc: 'Tidak ada yang mencatat kesalahan kecilmu di dalam buku harian mereka', stat: '3 MENIT', col: K.PAL.teal, c: C.lupa },
    { tag: 'KEBEBASAN', title: 'Lepaskan Diri dari Beban Ekspektasi Semu', desc: 'Saat tahu orang lain tidak peduli, kamu bebas menjadi dirimu sendiri', stat: 'BEBAS', col: K.PAL.teal, c: C.bebas },
    { tag: 'PESAN JUARA', title: 'Matikan Lampu Sorot Imajiner & Maju Terus', desc: 'Karyamu terlalu berharga untuk dihentikan oleh rasa takut yang tak nyata!', stat: 'MAJU!', col: K.PAL.beanie, c: C.moral },
  ][beat];

  K.beanieCallout(ctx, 540, 1485, 960, 165, {
    tag: callouts.tag,
    title: callouts.title,
    desc: callouts.desc,
    stat: callouts.stat,
    col: callouts.col,
    a: pop(t, callouts.c ? callouts.c.start + 0.15 : 0),
  });
}
