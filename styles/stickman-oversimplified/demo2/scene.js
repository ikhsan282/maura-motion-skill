// 78 · STICKMAN OVERSIMPLIFIED — Demo 2: Serendipity Sains: Penisilin Fleming & Microwave (8 Full-Screen Scenes!)
import * as K from '/styles/stickman-oversimplified/kit.js';
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

  let beat = 0;
  if (t >= C.moral.start) beat = 7;
  else if (t >= C.pelajaran.start) beat = 6;
  else if (t >= C.pasteur.start) beat = 5;
  else if (t >= C.microwave.start) beat = 4;
  else if (t >= C.penisilin.start) beat = 3;
  else if (t >= C.zona.start) beat = 2;
  else if (t >= C.fleming.start) beat = 1;

  if (beat === 0) {
    // BEAT 1 (hook): London Street 1928 — Alexander Fleming holding Petri dish
    const u = clamp((t - C.hook.start) / Math.max(1, C.hook.dur));
    K.withCamera(ctx, { zoom: lerp(1.26, 1.0, ease.outCubic(u)), fx: 460, fy: 1040 }, () => {
      K.drawStreetWorld(ctx, t);
      K.drawStickman(ctx, 410, 1460, {
        pose: 'excited',
        hairStyle: 'bowl',
        coatColor: K.PAL.coatBlue,
        prop: 'petri',
        scale: 1.18,
        t,
      });
    });

    K.drawEduBanner(ctx, '1928', 'LUPA CUCI CAWAN MALAH SELAMATKAN DUNIA!', 'Bagaimana Ketidaksengajaan di Lab Melahirkan Obat Penisilin');
    K.drawEduCallout(ctx, 540, 1510, 960, 155, {
      tag: 'PENEMUAN TAK SENGAJA (SERENDIPITY)',
      title: '200 Juta Nyawa Diselamatkan Berkat Cawan yang Lupa Dicuci!',
      desc: 'Alexander Fleming meninggalkan tumpukan cawan bakteri saat pergi berlibur musim panas',
      stat: '200 JUTA',
      a: pop(t, C.hook.start + 0.25),
    });
  } else if (beat === 1) {
    // BEAT 2 (fleming): Inside London Lab — Mold spore lands on Petri Dish
    K.drawLabWorld(ctx, t);
    K.drawStickman(ctx, 730, 1055, {
      pose: 'shocked',
      hairStyle: 'bowl',
      coatColor: K.PAL.coatWhite,
      prop: 'petri',
      glasses: true,
      showLegs: false,
      scale: 1.08,
      t,
    });
    K.drawGalvanometerRig(ctx, 480, 1050, t, { needleAngle: -0.35, jarColor: '#2d6a4f', scale: 1.0 });

    K.drawEduBanner(ctx, 'LAB LONDON', 'CAWAN BAKTERI DITUMBUHI JAMUR HIJAU!', 'Spora Jamur Penicillium Notatum Masuk Lewat Jendela Lab');
    K.drawEduCallout(ctx, 540, 1465, 960, 160, {
      tag: 'SEPTEMBER 1928 • ST. MARY HOSPITAL',
      title: '"Lucu Sekali..." — Kalimat Terkenal Fleming Saat Melihat Jamur',
      desc: 'Alih-alih langsung mencuci cawan yang terkontaminasi, Fleming mengamatinya dengan teliti',
      stat: 'JAMUR UNIK',
      a: pop(t, C.fleming.start + 0.2),
    });
  } else if (beat === 2) {
    // BEAT 3 (zona): Microscopic Zoom — Mold killing surrounding bacteria (Inhibition Zone!)
    K.drawMicrobeZoomWorld(ctx, t, { cleansed: true });
    K.drawEduBanner(ctx, 'MIKROSKOP', 'ZONA BENING: BAKTERI MATI DI SEKITAR JAMUR!', 'Jamur Mengeluarkan Zat Pembunuh Bakteri Staphylococcus');
    K.drawEduCallout(ctx, 540, 1465, 960, 165, {
      tag: 'CARA KERJA ANTIBIOTIK PENISILIN',
      title: 'Zat Sekresi Jamur Menghancurkan Dinding Sel Bakteri Jahat',
      desc: 'Di sekeliling koloni jamur terbentuk lingkaran jernih bebas kuman sama sekali!',
      stat: 'ZONA BERSIH',
      col: '#38bdf8',
      a: pop(t, C.zona.start + 0.2),
    });
  } else if (beat === 3) {
    // BEAT 4 (penisilin): Nobel Prize & Mass Production of Penicillin
    K.drawChalkboardWorld(ctx, t, { formula: 'PENICILLIUM -> ANTIBIOTIK' });
    K.drawStickman(ctx, 540, 1380, {
      pose: 'happy',
      hairStyle: 'bowl',
      coatColor: K.PAL.coatBlue,
      prop: 'medal',
      glasses: true,
      scale: 1.2,
      t,
    });
    K.drawEduBanner(ctx, 'PENISILIN', 'ANTIBIOTIK PERTAMA PENYELAMAT MANUSIA', 'Mengubah Infeksi Luka Ringan dari Vonis Mati Jadi Mudah Sembuh');
    K.drawEduCallout(ctx, 540, 1475, 960, 160, {
      tag: 'HADIAH NOBEL KEDOKTERAN 1945',
      title: 'Fleming, Florey, dan Chain Meraih Nobel Berkat Penisilin',
      desc: 'Menjadi senjata medis paling berharga sepanjang abad ke-20 hingga hari ini',
      stat: 'NOBEL 1945',
      col: K.PAL.gold,
      a: pop(t, C.penisilin.start + 0.2),
    });
  } else if (beat === 4) {
    // BEAT 5 (microwave): 1945 Percy Spencer Radar Wave & Melting Chocolate Bar
    K.drawAtomLatticeWorld(ctx, t);
    K.drawEduBanner(ctx, '1945 RADAR', 'COKELAT MELELEH DI SAKU PERCY SPENCER!', 'Gelombang Mikro Magnetron Menggetarkan Molekul Air & Gula');
    K.drawEduCallout(ctx, 540, 1465, 960, 165, {
      tag: 'FISIKA OVEN MICROWAVE (1945)',
      title: 'Gelombang Elektromagnetik -> Gesekan Molekul -> Panas Cepat!',
      desc: 'Spencer mengetesnya dengan biji jagung popcorn sebelum menciptakan oven microwave pertama',
      stat: 'MICROWAVE',
      col: K.PAL.amber,
      a: pop(t, C.microwave.start + 0.2),
    });
  } else if (beat === 5) {
    // BEAT 6 (pasteur): Louis Pasteur Quote on Prepared Mind
    K.drawBellLabsWorld(ctx, t, { propMode: 'medical' });
    K.drawEduBanner(ctx, 'SERENDIPITY', '"KEBERUNTUNGAN BERPIHAK PADA PIKIRAN SIAP"', 'Prinsip Emas Louis Pasteur tentang Penemuan Tak Sengaja');
    K.drawEduCallout(ctx, 540, 1475, 960, 160, {
      tag: 'RAHASIA SERENDIPITY ILMIAH',
      title: 'Ketidaksengajaan + Ketelitian Mengamati = Terobosan Besar',
      desc: 'Tanpa rasa ingin tahu, kejadian aneh hanya akan lewat begitu saja tanpa arti',
      stat: 'OBSERVASI',
      col: K.PAL.gold,
      a: pop(t, C.pasteur.start + 0.2),
    });
  } else if (beat === 6) {
    // BEAT 7 (pelajaran): Scientist asking "Why?" instead of throwing away anomaly
    K.withCamera(ctx, { zoom: 1.2, fx: 540, fy: 960 }, () => {
      K.drawLabWorld(ctx, t);
      K.drawStickman(ctx, 540, 1055, {
        pose: 'excited',
        hairStyle: 'bowl',
        coatColor: K.PAL.coatBlue,
        prop: 'petri',
        showLegs: false,
        scale: 1.15,
        t,
      });
    });
    K.drawEduBanner(ctx, 'POLA PIKIR', 'JANGAN LANGSUNG MEMBUANG ANOMALI!', 'Ilmuwan Sejati Selalu Bertanya: "Mengapa Hal Aneh Ini Terjadi?"');
    K.drawEduCallout(ctx, 540, 1475, 960, 160, {
      tag: 'BEDANYA ORANG BIASA VS PENEMU',
      title: 'Orang Biasa Mengeluh Gagal, Penemu Menyelidiki Penyebabnya',
      desc: 'X-Ray, Velcro, Teflon, hingga Post-it Notes semuanya lahir dari kejelian melihat anomali',
      stat: 'KEINGINTAHUAN',
      col: '#38bdf8',
      a: pop(t, C.pelajaran.start + 0.2),
    });
  } else {
    // BEAT 8 (moral): Sunrise Horizon
    K.drawSpaceAndSolarWorld(ctx, t, { mode: 'farm' });
    K.drawStickman(ctx, 540, 1360, {
      pose: 'happy',
      hairStyle: 'bowl',
      coatColor: K.PAL.coatBlue,
      prop: 'medal',
      scale: 1.18,
      t,
    });
    K.drawEduBanner(ctx, 'INSPIRASI', 'KEGAGALAN HARI INI BISA JADI PENEMUAN BESOK', 'Perhatikan Setiap Detail Kecil dalam Eksperimen & Karyamu');
    K.drawEduCallout(ctx, 540, 1480, 960, 160, {
      tag: 'PESAN PENUTUP',
      title: 'Jangan Buru-Buru Membuang Hasil yang Terlihat Gagal',
      desc: 'Bisa jadi di balik anomali kecil itulah tersembunyi terobosan terbesarmu!',
      stat: 'TEROBOSAN',
      col: K.PAL.gold,
      a: pop(t, C.moral.start + 0.2),
    });
  }
}
