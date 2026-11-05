// 70 · STICKMAN BEANIE — Demo 2: Paradoks Pilihan di Era Digital (Full-Screen 1080x1920 8-Beat Standard)
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
  else if (t >= C.hemat?.start) beat = 8;
  else if (t >= C.cukup?.start) beat = 7;
  else if (t >= C.tiga?.start) beat = 6;
  else if (t >= C.menyesal?.start) beat = 5;
  else if (t >= C.lumpuh?.start) beat = 4;
  else if (t >= C.selai?.start) beat = 3;
  else if (t >= C.schwartz?.start) beat = 2;
  else if (t >= C.banyak?.start) beat = 1;

  let zoom = 1.0, fx = 540, fy = 880;
  if (beat >= 1 && beat <= 4) {
    zoom = 1.15; fx = 580; fy = 920;
  } else if (beat >= 6) {
    zoom = 1.14; fx = 520; fy = 940;
  }

  const tags = [
    'PANEL 01 • SCROLL 30 MENIT MAKANAN DINGIN',
    'PANEL 02 • ERA PILIHAN TANPA BATAS',
    'PANEL 03 • THE PARADOX OF CHOICE',
    'PANEL 04 • EKSPERIMEN TOKO SELAI (24 vs 6)',
    'PANEL 05 • KELUMPUHAN KEPUTUSAN (DECISION FATIGUE)',
    'PANEL 06 • FOMO & PENYESALAN OPSI LAIN',
    'PANEL 07 • ATURAN TIGA PILIHAN (RULE OF THREE)',
    'PANEL 08 • SATISFICER vs MAXIMIZER',
    'PANEL 09 • HEMAT ENERGI MENTAL UNTUK HAL BESAR',
    'PANEL 10 • KETENANGAN MEMILIH SATU HAL!',
  ];

  K.withCamera(ctx, { zoom, fx, fy }, () => {
    K.beanieBg(ctx, t, { floorY, stageTag: tags[beat], col: beat >= 6 ? K.PAL.teal : K.PAL.beanie });
    K.beanieProps(ctx, floorY, 'choices', { phase: beat >= 6 ? 2 : 0, t });

    const charX = beat <= 4 ? 360 : 480;
    const pose = beat === 0 ? 'shock' : beat <= 4 ? 'think' : beat <= 6 ? 'action' : 'confident';
    K.beanieStickman(ctx, charX, floorY, pose, { facing: 1, t });

    const bubbles = [
      'Milih film 30 menit, makanan keburu dingin!',
      'Terlalu banyak pilihan malah bikin pusing!',
      'Barry Schwartz: "Makin banyak, makin macet!"',
      'Meja 6 selai laku 10x lipat dari meja 24 selai!',
      'Otak lelah menimbang kemungkinan...',
      'Takut pilihan yang lain ternyata lebih enak!',
      'Batasi cuma 3 opsi terbaik, lalu putuskan!',
      'Pilih yang "cukup baik", lalu nikmati!',
      'Simpan energimu untuk mimpi-mimpi besar!',
      'Fokus satu hal, nikmati sepenuh hati!',
    ];
    K.beanieBubble(ctx, charX + 50, floorY - 380, bubbles[beat], {
      tailX: charX + 15, tailY: floorY - 300, col: beat >= 6 ? K.PAL.teal : K.PAL.beanie,
    });
  });

  const headers = [
    ['DINGIN!', 'PARADOKS PILIHAN DIGITAL', 'Mengapa Banyak Pilihan Justru Bikin Batal Memilih?'],
    ['BANJIR', 'ERA KELIMPAHAN INFORMASI', 'Ribuan Film & Ratusan Menu yang Melelahkan Pikiran'],
    ['PARADOKS', 'TEMUAN PSIKOLOG BARRY SCHWARTZ', 'Kebebasan Berlebihan Menghasilkan Beban Mental'],
    ['10x LIPAT', 'EKSPERIMEN TOKO SELAI (1995)', '24 Pilihan Menarik Perhatian, 6 Pilihan Menghasilkan Aksi'],
    ['LELAH', 'DECISION FATIGUE DI KEPALA', 'Kapasitas Mengambil Keputusan Cepat Habis'],
    ['FOMO', 'HANTU PENYESALAN SETELAH MEMILIH', 'Terjebak Membandingkan dengan Opsi yang Ditinggalkan'],
    ['ATURAN 3', 'BATASI HANYA TIGA PILIHAN', 'Saring Opsi Terbaik Sebelum Otak Kelelahan'],
    ['SATISFICE', 'JADILAH SEORANG SATISFICER', 'Cukup Baik & Langsung Jalan Mengalahkan Kesempurnaan'],
    ['HEMAT', 'SIMPAN ENERGI UNTUK HAL PENTING', 'Jangan Habiskan Waktu Memikirkan Hal Sepele'],
    ['TENANG!', 'NIKMATI PILIHANMU SEPENUHNYA', 'Kunci Bahagia Bukan Seribu Pilihan, Tapi Rasa Syukur'],
  ][beat];

  K.beanieHeader(ctx, headers[0], headers[1], headers[2], {
    col: beat >= 6 ? K.PAL.teal : K.PAL.beanie,
  });

  const callouts = [
    { tag: 'REALITA HARIAN', title: 'Scroll Setengah Jam Tanpa Hasil yang Nyata', desc: 'Sering terjadi saat memilih film, baju, atau makanan online', stat: '30 MNT', col: K.PAL.beanie, c: C.hook },
    { tag: 'KELIMPAHAN OPSI', title: 'Ratusan Pilihan Tidak Menjamin Kebahagiaan', desc: 'Terlalu banyak alternatif menimbulkan rasa ragu yang melumpuhkan', stat: 'BANJIR', col: K.PAL.blue, c: C.banyak },
    { tag: 'THE PARADOX', title: 'Buku The Paradox of Choice (Barry Schwartz)', desc: 'Membuktikan bahwa pilihan berlebihan menurunkan tingkat kepuasan', stat: 'RISET', col: K.PAL.purple, c: C.schwartz },
    { tag: 'TOKO SELAI', title: 'Meja 24 Rasa vs Meja 6 Rasa (Iyengar & Lepper)', desc: 'Meja 6 rasa berhasil menjual selai 10 kali lipat lebih banyak', stat: '10x LIPAT', col: K.PAL.teal, c: C.selai },
    { tag: 'DECISION FATIGUE', title: 'Kelelahan Mental Akibat Menimbang Opsi', desc: 'Kekuatan tekad manusia memiliki kuota harian yang bisa terkuras', stat: 'FATIGUE', col: K.PAL.beanie, c: C.lumpuh },
    { tag: 'OPPORTUNITY COST', title: 'Takut Melewatkan Sesuatu yang Lebih Sempurna', desc: 'Pikiran terus bertanya-tanya "bagaimana jika memilih yang lain"', stat: 'FOMO', col: K.PAL.purple, c: C.menyesal },
    { tag: 'RULE OF THREE', title: 'Pilih Maksimal 3 Opsi Teratas Saja', desc: 'Membatasi opsi langsung mengembalikan kendali dan kecepatan bertindak', stat: '3 OPSI', col: K.PAL.teal, c: C.tiga },
    { tag: 'MAXIMIZER VS SATISFICER', title: 'Prinsip "Cukup Baik" Membebaskan Pikiran', desc: 'Maximizer menderita mencari yang sempurna, Satisficer bahagia mengeksekusi', stat: 'SATISFICE', col: K.PAL.teal, c: C.cukup },
    { tag: 'HEMAT ENERGI', title: 'Sederhanakan Rutinitas Kecil Setiap Pagi', desc: 'Seperti Steve Jobs yang memakai baju serupa untuk menjaga fokus', stat: 'EFISIEN', col: K.PAL.blue, c: C.hemat },
    { tag: 'PESAN JUARA', title: 'Ketenangan Lahir dari Komitmen pada Satu Pilihan', desc: 'Pilihlah satu, jalani dengan sungguh-sungguh, dan nikmati hasilnya!', stat: 'TENANG', col: K.PAL.beanie, c: C.moral },
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
