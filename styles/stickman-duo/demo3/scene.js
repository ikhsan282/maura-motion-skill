// 73 · STICKMAN DUO — Demo 3: Rahasia Protégé Effect & Teknik Feynman (Full-Screen 1080x1920 8-Beat Standard)
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
  else if (t >= C.untung?.start) beat = 6;
  else if (t >= C.gantian?.start) beat = 5;
  else if (t >= C.celah?.start) beat = 4;
  else if (t >= C.feynman?.start) beat = 3;
  else if (t >= C.protege?.start) beat = 2;
  else if (t >= C.ilusi?.start) beat = 1;

  let zoom = 1.0, fx = 540, fy = 880;
  if (beat === 1 || beat === 2) {
    zoom = 1.14; fx = 540; fy = 910;
  } else if (beat >= 4) {
    zoom = 1.15; fx = 540; fy = 930;
  }

  const tags = [
    'EPISODE 01 • BACA SENDIRI BIKIN GAGAP',
    'EPISODE 02 • ILUSI KOMPETENSI MEMBACA PASIF',
    'EPISODE 03 • THE PROTÉGÉ EFFECT: MENGAJAR = INGAT 90%',
    'EPISODE 04 • TEKNIK RICHARD FEYNMAN',
    'EPISODE 05 • PERTANYAAN POLOS MENYINGKAP CELAH',
    'EPISODE 06 • RITUAL TUKAR RANGKUMAN 5 MENIT',
    'EPISODE 07 • HEMAT WAKTU & GANDAKAN MEMORI',
    'EPISODE 08 • AJARKAN ILMUMU KE SAHABAT!',
  ];

  K.withCamera(ctx, { zoom, fx, fy }, () => {
    K.duoBg(ctx, t, { floorY, episodeTag: tags[beat], col: beat >= 4 ? K.PAL.teal : (beat === 2 || beat === 3 ? K.PAL.blue : K.PAL.red) });

    const props = [
      ['BACA PASIF', 'GAGAP MENJAWAB', 'Merasa hafal tapi bingung konsep', K.PAL.red],
      ['ILUSI ILMU', '20% INGAT', 'Membaca ulang hanya kenal visual', K.PAL.red],
      ['PROTÉGÉ', '90% TERSIMPAN', 'Menjelaskan = mengunci ingatan', K.PAL.blue],
      ['FEYNMAN', 'BAHASA SIMPLE', 'Uji pemahaman tanpa istilah rumit', K.PAL.teal],
      ['UJI KRITIS', 'TEMUKAN CELAH', 'Pertanyaan teman membongkar blindspot', K.PAL.blue],
      ['TUKAR BAB', '5 MNT/BAB', 'Raka bab 1, Bima bab 2', K.PAL.teal],
      ['2x EFISIEN', 'HEMAT WAKTU', 'Dua kepala lebih cepat paham', K.PAL.teal],
      ['GAS BARENG!', 'MASTER ILMU', 'Belajar bareng sampai khatam!', K.PAL.teal],
    ][beat];
    K.duoCenterProp(ctx, floorY, props[0], props[1], props[2], { col: props[3] });

    // Left: Raka, Right: Bima
    const rakaPose = beat === 0 ? 'shock' : beat === 1 ? 'shock' : beat === 2 ? 'talk' : beat === 3 ? 'point' : beat <= 5 ? 'talk' : 'highfive';
    const bimaPose = beat === 0 ? 'talk' : beat === 1 ? 'point' : beat === 2 ? 'point' : beat === 3 ? 'talk' : beat <= 5 ? 'point' : 'highfive';

    K.duoStickman(ctx, 280, floorY, 'raka', rakaPose, { facing: 1, t });
    K.duoStickman(ctx, 800, floorY, 'bima', bimaPose, { facing: -1, t });

    const rakaBubbles = [
      'Di buku berasa ngerti, pas ditanya kok mendadak ngeblank?',
      'Bener, aku cuma hafal kata-katanya doang!',
      'Oh, ngajarin orang bikin ingatan nyangkut 90%?!',
      'Richard Feynman pakai cara ini buat uji topik rumit ya!',
      'Wah pertanyaanmu bener, bagian itu ternyata aku belum ngerti!',
      'Oke! 5 menit ini aku rangkumin Bab 1 ke kamu!',
      'Asik banget, waktu belajar hemat separuh!',
      'Kalau mau jago materi, ajarin ke teman! Tos Bim!',
    ];
    const bimaBubbles = [
      'Itu ilusi kompetensi, Rak! Otakmu cuma kenal teksnya!',
      'Membaca pasif itu jebakan ilusi paham!',
      'Yup! Namanya The Protégé Effect, belajar lewat mengajar!',
      'Jelasin pakai bahasa sederhana, hindari istilah jelimet!',
      'Pertanyaan awam justru langsung menyingkap celah logika!',
      'Habis itu gantian aku yang bedah Bab 2 buat kamu!',
      'Pemahaman kita berdua nempel permanen di kepala!',
      'Mantap Rak! Ilmu makin dibagi makin nempel!',
    ];

    K.duoBubble(ctx, 280, floorY - 390, 'RAKA', rakaBubbles[beat], {
      tailX: 280, tailY: floorY - 310, col: K.PAL.red,
    });
    K.duoBubble(ctx, 800, floorY - 390, 'BIMA', bimaBubbles[beat], {
      tailX: 800, tailY: floorY - 310, col: K.PAL.blue,
    });
  });

  const headers = [
    ['10% vs 90%', 'PAHAM DI KEPALA TAPI GAGAP MENJELASKAN?', 'Mengapa Membaca Pasif Berulang Kali Cepat Terlupakan?'],
    ['ILUSI', 'JEBAKAN ILLUSION OF COMPETENCE', 'Akrab dengan Teks Buku Bukan Berarti Menguasai Inti Konsep'],
    ['90% INGAT', 'THE PROTÉGÉ EFFECT', 'Menjelaskan Materi ke Sahabat Mengunci 90% Ingatan Jangka Panjang'],
    ['FEYNMAN', 'TEKNIK BELAJAR NOBEL PRIZE', 'Gunakan Bahasa Sederhana Seperti Menjelaskan ke Anak 10 Tahun'],
    ['CELAH', 'PERTANYAAN TEMAN MEMBONGKAR BLINDSPOT', 'Respons Spontan Sahabat Menunjukkan Titik Lemah Pemahaman'],
    ['DUET ILMU', 'RITUAL TUKAR PENJELASAN 5 MENIT', 'Kamu Terangkan Bagian Pertama, Sahabat Terangkan Bagian Kedua'],
    ['EFISIEN', 'HEMAT WAKTU & LIPAT GANDAKAN MEMORI', 'Dua Kepala Menyerap Pengetahuan Lebih Cepat dan Tahan Lama'],
    ['BAGIKAN!', 'AJARKAN ILMU KEPADA SAHABAT', 'Kunci Terkuat Penguasaan Ilmu Adalah Membagikannya Hari Ini!'],
  ][beat];

  K.duoHeader(ctx, headers[0], headers[1], headers[2], {
    col: beat >= 4 ? K.PAL.teal : (beat === 2 || beat === 3 ? K.PAL.blue : K.PAL.red),
  });

  const callouts = [
    { tag: 'PARADOKS BELAJAR', title: 'Membaca Lancar Tapi Mendadak Gagap Saat Ditanya', desc: 'Pengenalan pasif (recognition) berbeda jauh dengan pemanggilan aktif (recall)', stat: 'GAGAP', col: K.PAL.red, c: C.hook },
    { tag: 'ILUSI KOMPETENSI', title: 'Garis Stabilo Warna-Warni Menipu Perasaan Kita', desc: 'Membaca ulang berkali-kali hanya membuat mata terbiasa melihat susunan kata', stat: '20% SAJA', col: K.PAL.red, c: C.ilusi },
    { tag: 'PROTÉGÉ EFFECT', title: 'Belajar dengan Niat Mengajar Meningkatkan Retensi', desc: 'Piramida pembelajaran: Mengajar orang lain mengunci 90% daya ingat materi', stat: '90% INGAT', col: K.PAL.blue, c: C.protege },
    { tag: 'METODE FEYNMAN', title: 'Jika Tidak Bisa Menjelaskan Secara Simple, Belum Paham', desc: 'Richard Feynman: Lepaskan jargon ilmiah rumit, gunakan perumpamaan nyata', stat: 'FEYNMAN', col: K.PAL.teal, c: C.feynman },
    { tag: 'DISCOVERY GAPS', title: 'Pertanyaan Teman Memaksa Otak Menutup Celah Logika', desc: 'Menghadapi pertanyaan tak terduga memperkuat pemahaman struktural', stat: 'CELAH', col: K.PAL.blue, c: C.celah },
    { tag: 'PEER TEACHING', title: '5 Menit Tukar Rangkuman: Saling Mengisi Bagian', desc: 'Format active recall terbaik yang menyenangkan dan tidak membosankan', stat: '5 MENIT', col: K.PAL.teal, c: C.gantian },
    { tag: 'DOUBLE LEVERAGE', title: 'Menghemat Waktu Belajar Hingga 50% Lebih Cepat', desc: 'Kolaborasi belajar menghasilkan pemahaman komprehensif dalam waktu singkat', stat: '2x CEPAT', col: K.PAL.teal, c: C.untung },
    { tag: 'PESAN JUARA', title: 'Bagikan Pemahamanmu ke Sahabat Sekarang Juga', desc: 'Ajak temanmu bertukar ilmu hari ini dan jadilah pembelajar sejati!', stat: 'MASTER', col: K.PAL.teal, c: C.moral },
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
