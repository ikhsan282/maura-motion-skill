// 78 · STICKMAN OVERSIMPLIFIED — Demo 1: Edmond Becquerel 1839 & Listrik Tenaga Surya Pertama
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
  if (t >= C.einstein.start) phase = 3;
  else if (t >= C.fotovoltaik.start) phase = 2;
  else if (t >= C.lab.start) phase = 1;

  const isLab = phase === 1 || phase === 2;
  const tags = [
    'PARIS 1839 • PENEMUAN REMAJA 19 TAHUN',
    'LABORATORIUM AYAH • EKSPERIMEN TOPLES KIMIA',
    'EFEK FOTOVOLTAIK • DISINGKIRKAN BATU BARA',
    'WARISAN EINSTEIN & PANEL SURYA MODERN',
  ];

  K.oversimplifiedBg(ctx, t, {
    mode: isLab ? 'lab' : 'street',
    stageTag: tags[phase],
    col: K.PAL.gold,
  });

  const headers = [
    ['1839', 'REMAJA 19 TAHUN PENEMU LISTRIK SURYA!', 'Edmond Becquerel Menciptakan Listrik dari Sinar Matahari Murni'],
    ['LAB PARIS', 'JARUM LISTRIK MELONJAK DI LAB AYAHNYA', 'Dua Elektroda di Dalam Toples Kimia Bereaksi Terhadap Cahaya'],
    ['DIABAIKAN!', 'DUNIA LEBIH MEMILIH MESIN UAP BATU BARA', 'Temuan Fotovoltaik Dianggap Mainan Aneh Selama Setengah Abad'],
    ['MASA DEPAN', 'DIJELASKAN EINSTEIN & MENGUBAH DUNIA!', 'Dari Toples Kecil 1839 Menjadi Energi Satelit & Surya Global'],
  ][phase];

  K.oversimplifiedHeader(ctx, headers[0], headers[1], headers[2], { col: K.PAL.gold });

  if (!isLab) {
    // Street Scene (Phase 0 & Phase 3)
    const pose = phase === 0 ? 'happy' : 'excited';
    K.oversimplifiedStickman(ctx, 430, 810, pose, {
      scale: 1.05,
      t,
      prop: 'solar_jar',
      showLegs: true,
    });

    const bubbles = {
      0: 'Tahun 1839, aku bikin listrik dari cahaya matahari di toples ini!',
      3: 'Dulu dicuekin di jalanan Paris, sekarang menghidupi satelit dunia!',
    };
    K.oversimplifiedBubble(ctx, 540, 290, bubbles[phase], { col: K.PAL.gold });
  } else {
    // Laboratory Scene (Phase 1 & Phase 2)
    // Father / Mentor with grey hair & glasses behind left counter
    K.oversimplifiedStickman(ctx, 330, 625, 'focused', {
      scale: 0.85,
      t: t + 1.2,
      coatColor: K.PAL.coatTeal,
      hairColor: K.PAL.hairGrey,
      prop: 'none',
      showLegs: false,
      glasses: true,
    });

    // Young Edmond behind right counter
    K.oversimplifiedStickman(ctx, 735, 625, phase === 2 ? 'excited' : 'focused', {
      scale: 0.96,
      t,
      coatColor: K.PAL.coatBlue,
      hairColor: K.PAL.hairBrown,
      prop: 'none',
      showLegs: false,
    });

    // Lab Galvanometer & Chemical Jar on Workbench
    const needle = phase === 1 ? -0.45 : 0.42;
    K.drawLabApparatus(ctx, 575, 618, t, {
      needleAngle: needle,
      label: phase === 1 ? 'SINAR MATAHARI -> ARUS LISTRIK!' : 'EFEK FOTOVOLTAIK PERTAMA (1839)',
    });

    const bubbles = {
      1: 'Lho?! Begitu kena sinar matahari dari jendela, jarumnya bergerak!',
      2: 'Listrik murni dari cahaya! Tapi kata orang batu bara lebih penting...',
    };
    K.oversimplifiedBubble(ctx, 540, 272, bubbles[phase], { col: K.PAL.gold });
  }

  // Lower 2 Cards per Phase
  if (phase === 0) {
    K.oversimplifiedCard(ctx, 540, 995, 960, 175, {
      tag: 'PARIS, PRANCIS • TAHUN 1839',
      titleStr: 'Alexandre-Edmond Becquerel Baru Berusia 19 Tahun',
      subStr: 'Menemukan bahwa cahaya matahari dapat memicu arus listrik secara langsung',
      stat: '19 TAHUN',
      statSub: 'USIA PENEMU',
      col: K.PAL.gold,
      a: pop(t, C.hook.start + 0.2),
    });
    K.oversimplifiedCard(ctx, 540, 1210, 960, 175, {
      tag: 'MENDAHULUI ZAMANNYA',
      titleStr: '115 Tahun Sebelum Panel Surya Modern Pertama Dibuat',
      subStr: 'Penemuan ini terjadi bahkan sebelum lampu pijar Thomas Edison ditemukan',
      stat: '1839 M',
      statSub: 'AWAL SURYA',
      col: K.PAL.amber,
      a: pop(t, C.hook.start + 0.6),
    });
  } else if (phase === 1) {
    K.oversimplifiedCard(ctx, 540, 995, 960, 175, {
      tag: 'EKSPERIMEN ELEKTRODA PERAK KLORIDA',
      titleStr: 'Dua Pelat Logam Dicelupkan ke Larutan Asam di Meja Lab',
      subStr: 'Ketika terpapar sinar matahari, muncul tegangan listrik di antara kedua elektroda',
      stat: 'CAHAYA -> V',
      statSub: 'TANPA BATERAI',
      col: K.PAL.gold,
      a: pop(t, C.lab.start),
    });
    K.oversimplifiedCard(ctx, 540, 1210, 960, 175, {
      tag: 'BUKTI PADA JARUM GALVANOMETER',
      titleStr: 'Semakin Terang Cahayanya, Semakin Kuat Jarum Menyimpang',
      subStr: 'Ayahnya, Antoine César Becquerel, turut menyaksikan keajaiban eksperimen tersebut',
      stat: 'TERUKUR',
      statSub: 'ARUS NYATA',
      col: K.PAL.amber,
      a: pop(t, C.lab.start + 0.5),
    });
  } else if (phase === 2) {
    K.oversimplifiedCard(ctx, 540, 995, 960, 175, {
      tag: 'KELAHIRAN EFEK FOTOVOLTAIK (BECQUEREL EFFECT)',
      titleStr: 'Konversi Langsung Foton Cahaya Menjadi Energi Listrik',
      subStr: 'Prinsip dasar yang menjadi fondasi seluruh teknologi sel surya abad ke-21',
      stat: 'FOTOVOLTAIK',
      statSub: 'PRINSIP DASAR',
      col: K.PAL.gold,
      a: pop(t, C.fotovoltaik.start),
    });
    K.oversimplifiedCard(ctx, 540, 1210, 960, 175, {
      tag: 'SKEPTISISME ERA REVOLUSI INDUSTRI',
      titleStr: 'Dunia Abad ke-19 Sedang Mabuk Mesin Uap & Batu Bara',
      subStr: 'Efisiensi awal yang masih 1% membuat para insinyur menganggapnya tidak praktis',
      stat: 'DIABAIKAN',
      statSub: 'DEMI BATU BARA',
      col: K.PAL.red,
      a: pop(t, C.fotovoltaik.start + 0.5),
    });
  } else {
    K.oversimplifiedCard(ctx, 540, 995, 960, 175, {
      tag: 'TEORI KUANTUM ALBERT EINSTEIN (1905)',
      titleStr: 'Einstein Menjelaskan Efek Fotolistrik & Meraih Nobel Fisika',
      subStr: 'Diikuti oleh Bell Labs (1954) yang menciptakan sel surya silikon praktis pertama',
      stat: 'NOBEL 1921',
      statSub: 'BUKTI FISIKA',
      col: K.PAL.gold,
      a: pop(t, C.einstein.start),
    });
    K.oversimplifiedCard(ctx, 540, 1210, 960, 175, {
      tag: 'PELAJARAN DARI EDMOND BECQUEREL',
      titleStr: 'Jangan Berhenti Berkarya Meski Dunia Belum Memahamimu',
      subStr: 'Eksperimen kecil di meja belajarmu hari ini bisa menjadi solusi masa depan',
      stat: 'VISIONER',
      statSub: 'LAMPAUI ZAMAN',
      col: K.PAL.amber,
      a: pop(t, C.einstein.start + 0.5),
    });
  }
}
