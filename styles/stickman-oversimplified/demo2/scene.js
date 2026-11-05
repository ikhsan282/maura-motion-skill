// 78 · STICKMAN OVERSIMPLIFIED — Demo 2: Serendipity Sains (Penisilin Fleming & Microwave Spencer)
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
  if (t >= C.pasteur.start) phase = 3;
  else if (t >= C.penisilin.start) phase = 2;
  else if (t >= C.fleming.start) phase = 1;

  const isLab = phase === 1 || phase === 2;
  const tags = [
    'LONDON 1928 • CAWAN KOTOR SEBELUM LIBURAN',
    'LAB ST. MARY • ANOMALI JAMUR PENICILLIUM',
    'PENISILIN & COKELAT RADAR PERCY SPENCER',
    'PRINSIP PASTEUR • PIKIRAN YANG SIAP MENGAMATI',
  ];

  K.oversimplifiedBg(ctx, t, {
    mode: isLab ? 'lab' : 'street',
    stageTag: tags[phase],
    col: K.PAL.amber,
  });

  const headers = [
    ['1928', 'LUPA CUCI CAWAN MALAH SELAMATKAN DUNIA!', 'Kisah Nyata Serendipity Penemuan Antibiotik Penisilin'],
    ['TUNGGU DULU!', 'BAKTERI MATI DI SEKELILING JAMUR BIRU', 'Alexander Fleming Memilih Mengamati Daripada Langsung Membuang'],
    ['200 JUTA+', 'PENISILIN & OVEN MICROWAVE DARI KEBETULAN', 'Dari Jamur Cawan hingga Cokelat Meleleh di Saku Percy Spencer'],
    ['SERENDIPITY', 'KEBERUNTUNGAN MILIK PIKIRAN YANG SIAP!', 'Jangan Buang Kegagalanmu Sebelum Memeriksa Anomalinya'],
  ][phase];

  K.oversimplifiedHeader(ctx, headers[0], headers[1], headers[2], { col: K.PAL.amber });

  if (!isLab) {
    const pose = phase === 0 ? 'happy' : 'excited';
    K.oversimplifiedStickman(ctx, 430, 810, pose, {
      scale: 1.05,
      t,
      coatColor: K.PAL.coatBlue,
      prop: 'petri',
      showLegs: true,
    });

    const bubbles = {
      0: 'Siapa sangka lupa nyuci cawan lab bisa menyelamatkan 200 juta nyawa?!',
      3: 'Ingat kata Pasteur: keberuntungan cuma berpihak pada mata yang jeli!',
    };
    K.oversimplifiedBubble(ctx, 540, 290, bubbles[phase], { col: K.PAL.amber });
  } else {
    K.oversimplifiedStickman(ctx, 325, 625, 'focused', {
      scale: 0.86,
      t: t + 0.8,
      coatColor: K.PAL.coatGreen,
      hairColor: K.PAL.hairGrey,
      prop: 'none',
      showLegs: false,
      glasses: true,
    });

    K.oversimplifiedStickman(ctx, 735, 625, phase === 2 ? 'excited' : 'shocked', {
      scale: 0.96,
      t,
      coatColor: K.PAL.coatBlue,
      hairColor: K.PAL.hairBrown,
      prop: 'petri',
      showLegs: false,
    });

    K.drawLabApparatus(ctx, 565, 618, t, {
      needleAngle: phase === 2 ? 0.48 : 0.15,
      label: phase === 1 ? 'ZONA BEBAS BAKTERI DI SEKITAR JAMUR' : 'EFEK ANTIBIOTIK PENICILLIUM NOTATUM',
      jarColor: '#39a878',
    });

    const bubbles = {
      1: 'Tunggu... kenapa semua bakteri di dekat jamur hijau ini mati bersih?!',
      2: 'Cawan berjamur jadi Penisilin, cokelat meleleh jadi Oven Microwave!',
    };
    K.oversimplifiedBubble(ctx, 540, 272, bubbles[phase], { col: K.PAL.amber });
  }

  if (phase === 0) {
    K.oversimplifiedCard(ctx, 540, 995, 960, 175, {
      tag: 'SEPTEMBER 1928 • RUMAH SAKIT ST. MARY LONDON',
      titleStr: 'Alexander Fleming Menumpuk Cawan Petri Sebelum Berlibur',
      subStr: 'Satu cawan biakan bakteri Staphylococcus tidak sengaja terbuka di dekat jendela',
      stat: '1 CAWAN',
      statSub: 'LUPA TERTUTUP',
      col: K.PAL.amber,
      a: pop(t, C.hook.start + 0.2),
    });
    K.oversimplifiedCard(ctx, 540, 1210, 960, 175, {
      tag: 'DAMPAK SEJARAH MEDIS MODERN',
      titleStr: 'Menyelamatkan Lebih dari 200 Juta Jiwa di Seluruh Dunia',
      subStr: 'Mengubah operasi bedah dan pengobatan infeksi manusia untuk selamanya',
      stat: '200 JUTA',
      statSub: 'NYAWA SELAMAT',
      col: K.PAL.gold,
      a: pop(t, C.hook.start + 0.6),
    });
  } else if (phase === 1) {
    K.oversimplifiedCard(ctx, 540, 995, 960, 175, {
      tag: 'KALIMAT TERKENAL FLEMING: "THAT\'S FUNNY..."',
      titleStr: 'Bukan Menggerutu, Fleming Justru Meneliti Lingkaran Jernihnya',
      subStr: 'Jamur Penicillium notatum mengeluarkan zat yang meluruhkan dinding sel bakteri',
      stat: 'ZONA BERSIH',
      statSub: 'BAKTERI MATI',
      col: K.PAL.amber,
      a: pop(t, C.fleming.start),
    });
    K.oversimplifiedCard(ctx, 540, 1210, 960, 175, {
      tag: 'KOLABORASI FLOREY & CHAIN (1940)',
      titleStr: 'Dikembangkan Menjadi Obat Massal Tepat Saat Perang Dunia II',
      subStr: 'Fleming, Florey, dan Chain dianugerahi Hadiah Nobel Kedokteran tahun 1945',
      stat: 'NOBEL 1945',
      statSub: 'KEDOKTERAN',
      col: K.PAL.gold,
      a: pop(t, C.fleming.start + 0.5),
    });
  } else if (phase === 2) {
    K.oversimplifiedCard(ctx, 540, 995, 960, 175, {
      tag: 'INSIDEN COKELAT MELELEH PERCY SPENCER (1945)',
      titleStr: 'Berdiri di Depan Magnetron Radar Membuat Cokelat di Saku Lumer',
      subStr: 'Spencer kemudian menguji biji jagung popcorn dan melahirkan oven microwave',
      stat: 'MICROWAVE',
      statSub: 'DARI COKELAT',
      col: K.PAL.amber,
      a: pop(t, C.penisilin.start),
    });
    K.oversimplifiedCard(ctx, 540, 1210, 960, 175, {
      tag: 'PENEMUAN LAIN DARI KETIDAKSengajaan',
      titleStr: 'Sinar-X Röntgen, Post-it Notes, hingga Kaca Pengaman Mobil',
      subStr: 'Banyak inovasi terbesar manusia lahir ketika eksperimen berjalan di luar rencana',
      stat: 'ANOMALI',
      statSub: 'JADI INOVASI',
      col: K.PAL.gold,
      a: pop(t, C.penisilin.start + 0.5),
    });
  } else {
    K.oversimplifiedCard(ctx, 540, 995, 960, 175, {
      tag: 'KUTIPAN KLASIK LOUIS PASTEUR (1854)',
      titleStr: '"Keberuntungan Hanya Berpihak pada Pikiran yang Siap"',
      subStr: 'Tanpa rasa ingin tahu dan ketelitian, kebetulan emas hanya akan berakhir di tong sampah',
      stat: 'PREPARED',
      statSub: 'MINDSET JELI',
      col: K.PAL.amber,
      a: pop(t, C.pasteur.start),
    });
    K.oversimplifiedCard(ctx, 540, 1210, 960, 175, {
      tag: 'PESAN UNTUK KREATOR & PENELITI',
      titleStr: 'Saat Hasil Kerjamu Melenceng, Tanyakan "Kenapa?" Sebelum Menghapusnya',
      subStr: 'Kesalahan hari ini sering kali adalah pintu rahasia menuju penemuan esok hari',
      stat: 'EUREKA!',
      statSub: 'TEMUKAN POLA',
      col: K.PAL.gold,
      a: pop(t, C.pasteur.start + 0.5),
    });
  }
}
