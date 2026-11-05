// 78 · STICKMAN OVERSIMPLIFIED — Demo 1: Edmond Becquerel 1839 (8 Full-Screen Educational Scenes!)
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

  // Determine which of the 8 educational story beats is active
  let beat = 0;
  if (t >= C.moral.start) beat = 7;
  else if (t >= C.satelit.start) beat = 6;
  else if (t >= C.einstein.start) beat = 5;
  else if (t >= C.abaikan.start) beat = 4;
  else if (t >= C.fotovoltaik.start) beat = 3;
  else if (t >= C.cahaya.start) beat = 2;
  else if (t >= C.lab.start) beat = 1;

  if (beat === 0) {
    // BEAT 1 (hook): Paris Street 1839 — Camera zooms out as 19yo Edmond holds solar jar & top-hat citizens walk past ignoring him
    const u = clamp((t - C.hook.start) / Math.max(1, C.hook.dur));
    const zoom = lerp(1.32, 1.0, ease.outCubic(u));

    K.withCamera(ctx, { zoom, fx: 460, fy: 1020 }, () => {
      K.drawStreetWorld(ctx, t);
      // Background passersby ignoring Edmond
      K.drawStickman(ctx, 790 - u * 260, 1180, {
        pose: 'skeptical',
        hairStyle: 'tophat',
        coatColor: K.PAL.coatGreen,
        scale: 0.65,
        t,
        walkSpeed: 6,
      });
      K.drawStickman(ctx, 920 - u * 220, 1220, {
        pose: 'focused',
        hairStyle: 'tophat',
        coatColor: K.PAL.coatBrown,
        scale: 0.62,
        t: t + 1,
        walkSpeed: 5.5,
      });
      // Young Edmond in foreground holding the glowing chemical jar
      K.drawStickman(ctx, 390, 1460, {
        pose: 'happy',
        hairStyle: 'bowl',
        coatColor: K.PAL.coatBlue,
        prop: 'solar_jar',
        scale: 1.18,
        t,
      });
    });

    K.drawEduBanner(ctx, '1839', 'REMAJA 19 TAHUN PENEMU LISTRIK SURYA', 'Edmond Becquerel Menciptakan Listrik dari Cahaya di Paris');
    K.drawEduCallout(ctx, 540, 1525, 960, 155, {
      tag: 'FAKTA SEJARAH • PARIS 1839',
      title: '115 Tahun Sebelum Panel Surya Silikon Modern Dibuat!',
      desc: 'Edmond baru berusia 19 tahun saat menemukan efek listrik dari cahaya matahari',
      stat: '19 THN',
      a: pop(t, C.hook.start + 0.3),
    });
  } else if (beat === 1) {
    // BEAT 2 (lab): Inside Father's Lab — Medium shot of Antoine César Becquerel (Father) & Young Edmond at workbench
    const u = clamp((t - C.lab.start) / Math.max(1, C.lab.dur));
    const zoom = lerp(1.0, 1.12, u);

    K.withCamera(ctx, { zoom, fx: 540, fy: 920 }, () => {
      K.drawLabWorld(ctx, t);
      // Father / Mentor on left with spectacles & newspaper
      K.drawStickman(ctx, 290, 1055, {
        pose: 'focused',
        hairStyle: 'bowl',
        hairColor: K.PAL.hairGrey,
        coatColor: K.PAL.coatTeal,
        showLegs: false,
        glasses: true,
        scale: 0.96,
        t,
      });
      // Edmond on right
      K.drawStickman(ctx, 760, 1055, {
        pose: 'happy',
        hairStyle: 'bowl',
        hairColor: K.PAL.hairBrown,
        coatColor: K.PAL.coatBlue,
        showLegs: false,
        scale: 1.08,
        t,
      });
      // Galvanometer rig on counter
      K.drawGalvanometerRig(ctx, 540, 1050, t, { needleAngle: -0.52, scale: 1.0 });
    });

    K.drawEduBanner(ctx, 'LAB 1839', 'EKSPERIMEN DUA PELAT ELEKTRODA LOGAM', 'Mencelupkan Pelat Perak Klorida ke Dalam Toples Larutan Asam');
    K.drawEduCallout(ctx, 540, 1440, 960, 160, {
      tag: 'CARA KERJA EKSPERIMEN BECQUEREL',
      title: '2 Pelat Logam + Larutan Elektrolit + Sinar Matahari',
      desc: 'Dalam gelap jarum diam di nol; begitu terkena cahaya muncul beda potensial listrik',
      stat: '2 PELAT',
      a: pop(t, C.lab.start + 0.2),
    });
  } else if (beat === 2) {
    // BEAT 3 (cahaya): TIGHT CAMERA ZOOM-IN onto Galvanometer Needle swinging wildly when sunbeam hits the jar!
    const u = clamp((t - C.cahaya.start) / Math.max(1, C.cahaya.dur));
    const zoom = lerp(1.25, 1.62, ease.outCubic(u));
    const needleSwing = lerp(-0.55, 0.58, ease.outBack(clamp(u * 1.6, 0, 1), 2.1));

    K.withCamera(ctx, { zoom, fx: 560, fy: 960 }, () => {
      K.drawLabWorld(ctx, t);
      K.drawStickman(ctx, 730, 1055, {
        pose: u > 0.45 ? 'shocked' : 'excited',
        hairStyle: 'bowl',
        coatColor: K.PAL.coatBlue,
        prop: 'wire_up',
        showLegs: false,
        scale: 1.12,
        t,
      });
      K.drawGalvanometerRig(ctx, 510, 1050, t, { needleAngle: needleSwing, scale: 1.15 });
    });

    K.drawEduBanner(ctx, 'LONJAKAN!', 'JARUM GALVANOMETER BERGERAK SENDIRI!', 'Sinar Matahari Memicu Arus Listrik Murni Tanpa Baterai');
    K.drawEduCallout(ctx, 540, 1460, 960, 160, {
      tag: 'BUKTI FISIKA • ARUS LISTRIK CAHAYA',
      title: 'Cahaya Matahari -> Reaksi Elektrokimia -> Arus Listrik',
      desc: 'Semakin kuat intensitas cahaya dari jendela, semakin besar simpangan jarum merah',
      stat: 'CAHAYA->V',
      col: K.PAL.amber,
      a: pop(t, C.cahaya.start + 0.2),
    });
  } else if (beat === 3) {
    // BEAT 4 (fotovoltaik): MICROSCOPIC ATOMIC LATTICE ZOOM — How Photovoltaic Effect actually works!
    const u = clamp((t - C.fotovoltaik.start) / Math.max(1, C.fotovoltaik.dur));
    const zoom = lerp(1.18, 1.0, ease.outCubic(u));

    K.withCamera(ctx, { zoom, fx: 540, fy: 880 }, () => {
      K.drawAtomLatticeWorld(ctx, t);
    });

    K.drawEduBanner(ctx, 'SAINS INTI', 'BAGAIMANA EFEK FOTOVOLTAIK BEKERJA?', 'Zoom Mikroskopis: Foton Cahaya Menabrak Elektron hingga Mengalir');
    K.drawEduCallout(ctx, 540, 1450, 960, 165, {
      tag: 'MEKANISME FISIKA FOTOVOLTAIK',
      title: '1. Foton Menabrak Atom -> 2. Elektron Terlepas -> 3. Mengalir di Kabel',
      desc: 'Aliran elektron yang bergerak searah melalui kawat tembaga inilah yang menjadi arus listrik!',
      stat: 'ELEKTRON',
      col: '#38bdf8',
      a: pop(t, C.fotovoltaik.start + 0.2),
    });
  } else if (beat === 4) {
    // BEAT 5 (abaikan): 1884 Rooftop Coal Era — 3 Skeptical Industrial Barons in Top Hats vs Early Solar Panels
    const u = clamp((t - C.abaikan.start) / Math.max(1, C.abaikan.dur));

    K.withCamera(ctx, { zoom: lerp(1.0, 1.1, u), fx: 540, fy: 1020 }, () => {
      K.drawRooftopWorld(ctx, t);
      // 3 Skeptical Coal Barons in tall top hats frowning
      K.drawStickman(ctx, 320, 1340, {
        pose: 'skeptical',
        hairStyle: 'tophat',
        coatColor: '#1e293b',
        scale: 0.92,
        t,
      });
      K.drawStickman(ctx, 560, 1360, {
        pose: 'skeptical',
        hairStyle: 'tophat',
        coatColor: K.PAL.coatBrown,
        scale: 0.88,
        t: t + 1,
      });
      K.drawStickman(ctx, 810, 1340, {
        pose: 'skeptical',
        hairStyle: 'tophat',
        coatColor: K.PAL.coatGreen,
        scale: 0.94,
        t: t + 2,
      });
    });

    K.drawEduBanner(ctx, 'ABAD KE-19', 'DIABAIKAN KARENA DEMAM BATU BARA!', 'Para Raja Industri Menganggap Panel Surya Hanya Mainan Mahal');
    K.drawEduCallout(ctx, 540, 1480, 960, 160, {
      tag: 'MENGAPA SEMPAT DIABAIKAN DUNIA?',
      title: 'Efisiensi Awal Hanya 1% vs Batu Bara yang Murah & Melimpah',
      desc: 'Dunia abad ke-19 belum memahami cara kerja kuantum untuk meningkatkan efisiensinya',
      stat: 'EFISIENSI 1%',
      col: K.PAL.red,
      a: pop(t, C.abaikan.start + 0.2),
    });
  } else if (beat === 5) {
    // BEAT 6 (einstein): Albert Einstein at the Chalkboard (1905/1921) holding up Golden Nobel Prize Medal!
    const u = clamp((t - C.einstein.start) / Math.max(1, C.einstein.dur));

    K.withCamera(ctx, { zoom: lerp(1.12, 1.0, u), fx: 540, fy: 960 }, () => {
      K.drawChalkboardWorld(ctx, t);
      K.drawStickman(ctx, 540, 1380, {
        pose: 'happy',
        hairStyle: 'einstein',
        coatColor: '#6b634b',
        prop: 'medal',
        mustache: true,
        scale: 1.22,
        t,
      });
    });

    K.drawEduBanner(ctx, '1905 / 1921', 'ALBERT EINSTEIN MEMECAHKAN MISTERINYA!', 'Meraih Hadiah Nobel Fisika Berkat Teori Efek Fotolistrik');
    K.drawEduCallout(ctx, 540, 1475, 960, 160, {
      tag: 'TEROBOSAN KUANTUM EINSTEIN (1905)',
      title: 'Bukan Relativitas, Nobel Einstein Justru dari Efek Fotolistrik!',
      desc: 'Membuktikan cahaya terdiri dari paket energi (foton) yang mampu menendang elektron keluar',
      stat: 'NOBEL 1921',
      col: K.PAL.gold,
      a: pop(t, C.einstein.start + 0.2),
    });
  } else if (beat === 6) {
    // BEAT 7 (satelit): Bell Labs 1954 & Vanguard 1 Space Satellite (1958)
    const u = clamp((t - C.satelit.start) / Math.max(1, C.satelit.dur));
    if (u < 0.48) {
      K.drawBellLabsWorld(ctx, t);
      K.drawEduBanner(ctx, 'BELL LABS', '1954: SEL SURYA SILIKON PRAKTIS PERTAMA', 'Mampu Memutar Bianglala Mainan dengan Efisiensi 6%');
    } else {
      K.drawSpaceAndSolarWorld(ctx, t, { mode: 'space' });
      K.drawEduBanner(ctx, 'ANGKASA', '1958: SATELIT VANGUARD 1 MENGORBIT BUMI!', 'Baterai Kimia Habis 20 Hari, Panel Surya Bertahan 6 Tahun!');
    }

    K.drawEduCallout(ctx, 540, 1475, 960, 160, {
      tag: 'PENYELAMAT EKSPLORASI ANTARIKSA',
      title: 'Dari Kincir Mainan 1954 ke Satelit Luar Angkasa 1958',
      desc: 'Tanpa temuan Edmond Becquerel 1839, satelit komunikasi & GPS tidak akan punya daya abadi',
      stat: 'SATELIT',
      col: '#38bdf8',
      a: pop(t, C.satelit.start + 0.2),
    });
  } else {
    // BEAT 8 (moral): Vast Modern Solar Farm at Sunrise + Proud Edmond
    K.drawSpaceAndSolarWorld(ctx, t, { mode: 'farm' });
    K.drawStickman(ctx, 310, 1380, {
      pose: 'excited',
      hairStyle: 'bowl',
      coatColor: K.PAL.coatBlue,
      prop: 'solar_jar',
      scale: 1.08,
      t,
    });

    K.drawEduBanner(ctx, 'MASA KINI', 'SUMBER LISTRIK TERBERSIH & TERMURAH DUNIA', 'Toples Kimia Remaja 19 Tahun Kini Menerangi Seluruh Bumi');
    K.drawEduCallout(ctx, 540, 1480, 960, 160, {
      tag: 'PESAN INSPIRATIF EDMOND BECQUEREL',
      title: 'Jangan Kecil Hati Jika Karya Mudamu Belum Dipahami Hari Ini',
      desc: 'Terkadang idemu bukan salah atau aneh — melainkan mendahului zamannya!',
      stat: 'VISIONER',
      col: K.PAL.gold,
      a: pop(t, C.moral.start + 0.2),
    });
  }
}
