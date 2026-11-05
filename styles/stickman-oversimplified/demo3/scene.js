// 78 · STICKMAN OVERSIMPLIFIED — Demo 3: Ignaz Semmelweis 1847 (8 Full-Screen Educational Scenes!)
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
  else if (t >= C.kuman.start) beat = 6;
  else if (t >= C.refleks.start) beat = 5;
  else if (t >= C.ego.start) beat = 4;
  else if (t >= C.klorin.start) beat = 3;
  else if (t >= C.investigasi.start) beat = 2;
  else if (t >= C.wina.start) beat = 1;

  if (beat === 0) {
    // BEAT 1 (hook): Vienna Street 1847 — Semmelweis holding wash basin while arrogant top-hat doctors laugh/walk away
    const u = clamp((t - C.hook.start) / Math.max(1, C.hook.dur));
    const zoom = lerp(1.28, 1.0, ease.outCubic(u));

    K.withCamera(ctx, { zoom, fx: 460, fy: 1040 }, () => {
      K.drawStreetWorld(ctx, t);
      K.drawStickman(ctx, 820 - u * 240, 1200, {
        pose: 'skeptical',
        hairStyle: 'tophat',
        coatColor: K.PAL.coatGreen,
        scale: 0.72,
        t,
        walkSpeed: 5.5,
      });
      K.drawStickman(ctx, 390, 1460, {
        pose: 'shocked',
        hairStyle: 'bowl',
        coatColor: K.PAL.coatTeal,
        prop: 'wash_basin',
        scale: 1.18,
        t,
      });
    });

    K.drawEduBanner(ctx, 'WINA 1847', 'DISURUH CUCI TANGAN MALAH TERSINGGUNG!', 'Kisah Nyata Dokter Ignaz Semmelweis di Rumah Sakit Wina');
    K.drawEduCallout(ctx, 540, 1510, 960, 155, {
      tag: 'FAKTA MEDIS ABAD KE-19',
      title: 'Tahun 1847: Belum Ada yang Tahu Tentang Bakteri & Kuman!',
      desc: 'Dokter zaman dulu mengira penyakit berasal dari "udara buruk" (miasma), bukan tangan kotor',
      stat: '1847 M',
      a: pop(t, C.hook.start + 0.25),
    });
  } else if (beat === 1) {
    // BEAT 2 (wina): Visual Data Comparison in Hospital Lab — Ward 1 (Doctors 18% Death) vs Ward 2 (Midwives 2% Death)
    const u = clamp((t - C.wina.start) / Math.max(1, C.wina.dur));
    K.withCamera(ctx, { zoom: lerp(1.0, 1.15, u), fx: 540, fy: 960 }, () => {
      K.drawLabWorld(ctx, t);
      // Doctor in Top Hat on Left (18% Danger)
      K.drawStickman(ctx, 290, 1055, {
        pose: 'skeptical',
        hairStyle: 'tophat',
        coatColor: K.PAL.coatBrown,
        showLegs: false,
        scale: 0.96,
        t,
      });
      // Semmelweis on Right analyzing mortality gauge
      K.drawStickman(ctx, 760, 1055, {
        pose: 'focused',
        hairStyle: 'bowl',
        coatColor: K.PAL.coatTeal,
        glasses: true,
        showLegs: false,
        scale: 1.05,
        t,
      });
      K.drawGalvanometerRig(ctx, 535, 1050, t, { needleAngle: 0.56, jarColor: K.PAL.red, scale: 1.05 });
    });

    K.drawEduBanner(ctx, '18% VS 2%', 'MISTERI DUA BANGSAL BERSALIN DI WINA', 'Mengapa Bangsal Dokter 3x Lebih Mematikan Daripada Bangsal Bidan?');
    K.drawEduCallout(ctx, 540, 1455, 960, 165, {
      tag: 'DATA OBSERVASI SEMMELWEIS',
      title: 'Klinik 1 (Dokter): 18% Meninggal vs Klinik 2 (Bidan): Hanya 2%',
      desc: 'Ibu-ibu yang hendak melahirkan sampai menangis memohon agar tidak masuk ke bangsal dokter!',
      stat: '18% vs 2%',
      col: K.PAL.red,
      a: pop(t, C.wina.start + 0.2),
    });
  } else if (beat === 2) {
    // BEAT 3 (investigasi): MICROSCOPIC GERM ZOOM ON HAND — Invisible Cadaverous Particles from Autopsy Room!
    const u = clamp((t - C.investigasi.start) / Math.max(1, C.investigasi.dur));
    const zoom = lerp(1.22, 1.0, ease.outCubic(u));

    K.withCamera(ctx, { zoom, fx: 540, fy: 820 }, () => {
      K.drawMicrobeZoomWorld(ctx, t, { cleansed: false });
    });

    K.drawEduBanner(ctx, 'PENYEBAB!', 'TANGAN DOKTER MEMBAWA PARTIKEL OTOPSI!', 'Memeriksa Pasien Langsung Setelah Membedah Jenazah Tanpa Cuci Tangan');
    K.drawEduCallout(ctx, 540, 1465, 960, 165, {
      tag: 'RANTAI PENULARAN INFEKSI (DEMAM NIFAS)',
      title: 'Ruang Otopsi Pagi Hari -> Tangan Tak Dicuci -> Pasien Bersalin',
      desc: 'Bidan tidak melakukan otopsi jenazah, itulah sebabnya bangsal bidan jauh lebih aman!',
      stat: 'KUMAN!',
      col: K.PAL.red,
      a: pop(t, C.investigasi.start + 0.2),
    });
  } else if (beat === 3) {
    // BEAT 4 (klorin): CHLORINE HANDWASHING BREAKTHROUGH — Sparkling Clean Hand + Mortality Plunges to 1.2%!
    const u = clamp((t - C.klorin.start) / Math.max(1, C.klorin.dur));
    if (u < 0.5) {
      K.drawMicrobeZoomWorld(ctx, t, { cleansed: true });
    } else {
      K.withCamera(ctx, { zoom: 1.35, fx: 540, fy: 960 }, () => {
        K.drawLabWorld(ctx, t);
        K.drawStickman(ctx, 750, 1055, {
          pose: 'excited',
          hairStyle: 'bowl',
          coatColor: K.PAL.coatTeal,
          prop: 'wash_basin',
          showLegs: false,
          scale: 1.08,
          t,
        });
        K.drawGalvanometerRig(ctx, 510, 1050, t, { needleAngle: -0.58, jarColor: '#38bdf8', scale: 1.1 });
      });
    }

    K.drawEduBanner(ctx, 'SOLUSI!', 'CUCI TANGAN DENGAN LARUTAN KAPUR KLORIN', 'Kematian Ibu Melahirkan Langsung Anjlok Drastis dari 18% ke 1,2%!');
    K.drawEduCallout(ctx, 540, 1465, 960, 165, {
      tag: 'EKSPERIMEN ANTISEPTIK MEI 1847',
      title: 'Kalsium Hipoklorit Membunuh Partikel Kuman di Tangan Dokter',
      desc: 'Hanya dengan mencuci tangan sebelum memeriksa pasien, 90% kematian berhasil dicegah!',
      stat: 'TURUN 90%',
      col: '#38bdf8',
      a: pop(t, C.klorin.start + 0.2),
    });
  } else if (beat === 4) {
    // BEAT 5 (ego): 3 Offended Senior Doctors in Tall Top Hats rejecting the data out of arrogance
    const u = clamp((t - C.ego.start) / Math.max(1, C.ego.dur));
    K.withCamera(ctx, { zoom: lerp(1.0, 1.12, u), fx: 540, fy: 1020 }, () => {
      K.drawStreetWorld(ctx, t);
      K.drawStickman(ctx, 280, 1410, { pose: 'skeptical', hairStyle: 'tophat', coatColor: '#1e293b', scale: 0.94, t });
      K.drawStickman(ctx, 540, 1430, { pose: 'skeptical', hairStyle: 'tophat', coatColor: K.PAL.coatBrown, scale: 0.98, t: t + 1 });
      K.drawStickman(ctx, 800, 1410, { pose: 'skeptical', hairStyle: 'tophat', coatColor: K.PAL.coatGreen, scale: 0.94, t: t + 2 });
    });

    K.drawEduBanner(ctx, 'EGO TINGGI', 'DOKTER SENIOR TERSINGGUNG & MENOLAK DATA!', '"Tangan Seorang Gentleman Terhormat Tidak Mungkin Kotor!"');
    K.drawEduCallout(ctx, 540, 1475, 960, 160, {
      tag: 'KONFLIK DATA ILMIAH VS GENGSI SOSIAL',
      title: 'Mengakui Cuci Tangan = Mengakui Selama Ini Mereka Penyebabnya',
      desc: 'Alih-alih berterima kasih, komunitas medis Wina justru memecat Ignaz Semmelweis!',
      stat: 'DIPECAT!',
      col: K.PAL.red,
      a: pop(t, C.ego.start + 0.2),
    });
  } else if (beat === 5) {
    // BEAT 6 (refleks): Chalkboard Psychology Explanation — What is the "Semmelweis Reflex"?
    K.drawChalkboardWorld(ctx, t, { formula: '18,3% -> 1,2% (KLORIN)' });
    K.drawStickman(ctx, 540, 1380, {
      pose: 'focused',
      hairStyle: 'bowl',
      coatColor: K.PAL.coatTeal,
      glasses: true,
      scale: 1.18,
      t,
    });

    K.drawEduBanner(ctx, 'PSIKOLOGI', 'APA ITU "EFEK REFLEKS SEMMELWEIS"?', 'Bias Kognitif Menolak Fakta Baru karena Bertentangan Norma Lama');
    K.drawEduCallout(ctx, 540, 1475, 960, 165, {
      tag: 'ISTILAH ILMIAH: SEMMELWEIS REFLEX',
      title: 'Penolakan Refleks terhadap Bukti Nyata Demi Melindungi Ego',
      desc: 'Terjadi ketika pakar menolak inovasi baru hanya karena merusak kebiasaan lama mereka',
      stat: 'BIAS EGO',
      col: K.PAL.amber,
      a: pop(t, C.refleks.start + 0.2),
    });
  } else if (beat === 6) {
    // BEAT 7 (kuman): Louis Pasteur & Joseph Lister (20 Years Later) proving Germ Theory!
    K.drawBellLabsWorld(ctx, t, { propMode: 'medical' });
    K.drawEduBanner(ctx, 'TERBUKTI!', 'LOUIS PASTEUR MEMBUKTIKAN TEORI KUMAN!', '20 Tahun Kemudian, Mikroskop Membuktikan Semmelweis 100% Benar');
    K.drawEduCallout(ctx, 540, 1475, 960, 160, {
      tag: 'REVOLUSI ANTISEPTIK MODERN',
      title: 'Louis Pasteur & Joseph Lister Mengubah Standar Operasi Dunia',
      desc: 'Sterilisasi alat bedah dan cuci tangan kini menjadi hukum wajib di setiap rumah sakit',
      stat: '100% BENAR',
      col: K.PAL.gold,
      a: pop(t, C.kuman.start + 0.2),
    });
  } else {
    // BEAT 8 (moral): Lab Triumph — Semmelweis remembered as "Savior of Mothers"
    K.drawLabWorld(ctx, t);
    K.drawStickman(ctx, 540, 1360, {
      pose: 'happy',
      hairStyle: 'bowl',
      coatColor: K.PAL.coatTeal,
      prop: 'wash_basin',
      scale: 1.18,
      t,
    });

    K.drawEduBanner(ctx, 'PAHLAWAN', 'DIJULUKI "SANG PENYELAMAT PARA IBU"', 'Keberaniannya Memegang Teguh Data Menyelamatkan Jutaan Nyawa');
    K.drawEduCallout(ctx, 540, 1480, 960, 160, {
      tag: 'PELAJARAN PENTING SEMMELWEIS',
      title: 'Jangan Biarkan Gengsi Menutup Matamu dari Kebenaran Data',
      desc: 'Solusi paling menyelamatkan nyawa terkadang berawal dari hal sesederhana mencuci tangan!',
      stat: 'RENDAH HATI',
      col: K.PAL.gold,
      a: pop(t, C.moral.start + 0.2),
    });
  }
}
