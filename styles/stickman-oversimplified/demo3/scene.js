// 78 · STICKMAN OVERSIMPLIFIED — Demo 3: Ignaz Semmelweis 1847 & Cuci Tangan Medis
import * as K from '/styles/stickman-oversimplified/kit.js';
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

  let phase = 0;
  if (t >= C.refleks.start) phase = 3;
  else if (t >= C.klorin.start) phase = 2;
  else if (t >= C.wina.start) phase = 1;

  const isLab = phase === 1 || phase === 2;
  const tags = [
    'WINA 1847 • DOKTER YANG DITERTAWAKAN REKANNYA',
    'MISTERI 2 BANGSAL • 18% VS 2% ANGKA KEMATIAN',
    'SOLUSI KAPUR KLORIN • TURUN DRASTIS KE 1,2%',
    'SEMMELWEIS REFLEX • DATA VS GENGSI ZAMAN',
  ];

  K.oversimplifiedBg(ctx, t, {
    mode: isLab ? 'lab' : 'street',
    stageTag: tags[phase],
    col: K.PAL.gold,
  });

  const headers = [
    ['1847', 'DISURUH CUCI TANGAN MALAH TERSINGGUNG!', 'Kisah Tragis & Heroik Dokter Ignaz Semmelweis di Rumah Sakit Wina'],
    ['MISTERI!', 'KENAPA BANGSAL DOKTER 3X LEBIH BERBAHAYA?', 'Dokter Memeriksa Pasien Langsung Setelah Otopsi Tanpa Cuci Tangan'],
    ['18% -> 1%', 'CUCI TANGAN KLORIN MENYELAMATKAN IBU!', 'Angka Demam Nifas Anjlok Seketika, tapi Dokter Senior Menolak'],
    ['TERBUKTI!', 'TEORI KUMAN PASTEUR MEMBUKTIKANNYA BENAR', 'Waspadai Semmelweis Reflex: Menolak Fakta Baru Demi Gengsi'],
  ][phase];

  K.oversimplifiedHeader(ctx, headers[0], headers[1], headers[2], { col: K.PAL.gold });

  if (!isLab) {
    const pose = phase === 0 ? 'shocked' : 'happy';
    K.oversimplifiedStickman(ctx, 430, 810, pose, {
      scale: 1.05,
      t,
      coatColor: K.PAL.coatTeal,
      prop: 'wash_basin',
      showLegs: true,
    });

    const bubbles = {
      0: 'Teman-teman dokter, ayo cuci tangan dulu! Kok malah menertawakanku?!',
      3: 'Data tidak pernah bohong! Cuci tangan menyelamatkan jutaan nyawa!',
    };
    K.oversimplifiedBubble(ctx, 540, 290, bubbles[phase], { col: K.PAL.gold });
  } else {
    K.oversimplifiedStickman(ctx, 325, 625, 'focused', {
      scale: 0.86,
      t: t + 0.6,
      coatColor: K.PAL.coatGreen,
      hairColor: K.PAL.hairGrey,
      prop: 'none',
      showLegs: false,
      glasses: true,
    });

    K.oversimplifiedStickman(ctx, 735, 625, phase === 2 ? 'happy' : 'focused', {
      scale: 0.96,
      t,
      coatColor: K.PAL.coatTeal,
      hairColor: K.PAL.hairBrown,
      prop: 'wash_basin',
      showLegs: false,
    });

    K.drawLabApparatus(ctx, 565, 618, t, {
      needleAngle: phase === 1 ? 0.52 : -0.52,
      label: phase === 1 ? 'TINGKAT INFEKSI BANGSAL: 18,3% (TINGGI!)' : 'SETELAH CUCI KLORIN: 1,2% (AMAN!)',
      jarColor: '#74c0fc',
    });

    const bubbles = {
      1: 'Partikel dari ruang otopsi menempel di tangan yang belum dicuci!',
      2: 'Begitu wajib cuci tangan pakai klorin, kematian turun dari 18% ke 1%!',
    };
    K.oversimplifiedBubble(ctx, 540, 272, bubbles[phase], { col: K.PAL.gold });
  }

  if (phase === 0) {
    K.oversimplifiedCard(ctx, 540, 995, 960, 175, {
      tag: 'RUMAH SAKIT UMUM WINA • TAHUN 1847',
      titleStr: 'Belum Ada yang Tahu Tentang Keberadaan Bakteri & Kuman',
      subStr: 'Penyakit masih dianggap berasal dari "udara buruk" (miasma) di ruangan',
      stat: 'ERA 1847',
      statSub: 'SEBELUM KUMAN',
      col: K.PAL.gold,
      a: pop(t, C.hook.start + 0.2),
    });
    K.oversimplifiedCard(ctx, 540, 1210, 960, 175, {
      tag: 'PIONIR ANTISEPTIK DUNIA',
      titleStr: 'Ignaz Semmelweis Dijuluki "Penyelamat Para Ibu"',
      subStr: 'Menemukan prosedur pencegahan infeksi jauh sebelum teori kuman populer',
      stat: 'PIONIR',
      statSub: 'HIGIENIS MEDIS',
      col: K.PAL.amber,
      a: pop(t, C.hook.start + 0.6),
    });
  } else if (phase === 1) {
    K.oversimplifiedCard(ctx, 540, 995, 960, 175, {
      tag: 'PERBANDINGAN DUA KLINIK BERSALIN WINA',
      titleStr: 'Klinik Dokter 18% Kematian vs Klinik Bidan Hanya 2%',
      subStr: 'Perbedaannya: bidan tidak melakukan otopsi, sedangkan dokter melakukannya tiap pagi',
      stat: '18% vs 2%',
      statSub: 'SELISIH TAJAM',
      col: K.PAL.red,
      a: pop(t, C.wina.start),
    });
    K.oversimplifiedCard(ctx, 540, 1210, 960, 175, {
      tag: 'TEMUAN PARTIKEL KADAVER',
      titleStr: 'Tangan Dokter Membawa Kuman Tak Kasat Mata ke Pasien',
      subStr: 'Terungkap saat rekan Semmelweis, Jakob Kolletschka, wafat akibat tergores pisau otopsi',
      stat: 'BUKTI KUAT',
      statSub: 'TRANSMISI KONTAK',
      col: K.PAL.gold,
      a: pop(t, C.wina.start + 0.5),
    });
  } else if (phase === 2) {
    K.oversimplifiedCard(ctx, 540, 995, 960, 175, {
      tag: 'KEBIJAKAN CUCI TANGAN MEI 1847',
      titleStr: 'Wajib Mencuci Tangan dengan Larutan Kalsium Hipoklorit',
      subStr: 'Dalam beberapa bulan, angka kematian ibu melahirkan langsung turun drastis ke 1,2%',
      stat: 'TURUN 90%',
      statSub: 'ANGKA KEMATIAN',
      col: K.PAL.gold,
      a: pop(t, C.klorin.start),
    });
    K.oversimplifiedCard(ctx, 540, 1210, 960, 175, {
      tag: 'PENOLAKAN AKIBAT GENGSI SOSIAL',
      titleStr: '"Tangan Seorang Gentleman Tidak Mungkin Membawa Penyakit!"',
      subStr: 'Ego komunitas medis abad ke-19 menolak menerima fakta bahwa merekalah penyebabnya',
      stat: 'EGO TINGGI',
      statSub: 'TOLAK FAKTA',
      col: K.PAL.red,
      a: pop(t, C.klorin.start + 0.5),
    });
  } else {
    K.oversimplifiedCard(ctx, 540, 995, 960, 175, {
      tag: 'ISTILAH PSIKOLOGI: SEMMELWEIS REFLEX',
      titleStr: 'Kecenderungan Menolak Bukti Baru karena Bertentangan Norma Lama',
      subStr: 'Pelajaran penting bagi ilmuwan dan pemimpin agar selalu rendah hati di depan data',
      stat: 'REFLEKS EGO',
      statSub: 'BIAS KOGNITIF',
      col: K.PAL.amber,
      a: pop(t, C.refleks.start),
    });
    K.oversimplifiedCard(ctx, 540, 1210, 960, 175, {
      tag: 'PEMBUKTIAN LOUIS PASTEUR & JOSEPH LISTER',
      titleStr: 'Cuci Tangan & Sterilisasi Kini Menjadi Hukum Wajib Kedokteran',
      subStr: 'Kebenaran ilmiah mungkin bisa ditolak sementara, namun pada akhirnya selalu menang',
      stat: 'STANDAR EMAS',
      statSub: 'MEDIS DUNIA',
      col: K.PAL.gold,
      a: pop(t, C.refleks.start + 0.5),
    });
  }
}
