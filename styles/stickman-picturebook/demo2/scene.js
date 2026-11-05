// 77 · STICKMAN PICTUREBOOK — Demo 2: Kisah Dua Benih di Taman (Full-Screen 1080x1920 8-Beat Standard)
import * as K from '/styles/stickman-picturebook/kit.js';
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
  const W = 1080;
  const H = 1920;
  ctx.clearRect(0, 0, W, H);

  let beat = 0;
  if (t >= C.moral?.start) beat = 7;
  else if (t >= C.musim?.start) beat = 6;
  else if (t >= C.fondasi?.start) beat = 5;
  else if (t >= C.akar?.start) beat = 4;
  else if (t >= C.manusia?.start) beat = 3;
  else if (t >= C.ragu?.start) beat = 2;
  else if (t >= C.permukaan?.start) beat = 1;

  let zoom = 1.0, fx = 540, fy = 880;
  if (beat === 1 || beat === 2) {
    zoom = 1.14; fx = 520; fy = 910;
  } else if (beat >= 4) {
    zoom = 1.15; fx = 560; fy = 930;
  }

  K.picturebookBg(ctx, W, H, t);

  const stageTags = [
    'BAB II • DUA BENIH DI HARI YANG SAMA',
    'BAB II • BUNGA MATAHARI MEKAR CEPAT',
    'BAB II • BENIH POHON EK TAMPAK TERTINGGAL',
    'BAB II • JEBAKAN MEMBANDINGKAN PERMUKAAN',
    'BAB II • RAHASIA JARINGAN AKAR DI BAWAH TANAH',
    'BAB II • FONDASI KOKOH PENAHAN BADAI',
    'BAB II • APA YANG LAMBAT SEDANG MEMBANGUN AKAR',
    'BAB II • SIRAMI AKARMU, SAMBUT MUSIM TUMBUHMU!',
  ];

  K.drawPicturebookHeader(
    ctx,
    W,
    stageTags[beat],
    'Kisah Dua Benih di Taman',
    'Mengapa Membandingkan Musim Tumbuhmu dengan Orang Lain Itu Tidak Adil?',
    beat >= 4 ? K.PAL.emerald : K.PAL.gold
  );

  const stageX = 58;
  const stageY = 216;
  const stageW = W - 116;
  const stageH = 1180;

  K.withCamera(ctx, { zoom, fx, fy }, () => {
    const groundY = K.drawStorybookStage(
      ctx,
      stageX,
      stageY,
      stageW,
      stageH,
      t,
      beat >= 4 ? K.PAL.emerald : K.PAL.gold,
      stageTags[beat]
    );

    const soilY = groundY - 20;

    // Underground Cross-Section Layer
    ctx.save();
    ctx.fillStyle = '#5a3d28';
    ctx.beginPath();
    ctx.roundRect(stageX + 330, soilY, stageW - 350, stageY + stageH - soilY - 14, 20);
    ctx.fill();
    ctx.strokeStyle = K.PAL.ink;
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // 1. Sunflower on Left
    const sunX = stageX + 460;
    const sunH = 160;
    ctx.strokeStyle = K.PAL.emerald;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(sunX, soilY);
    ctx.lineTo(sunX, soilY - sunH);
    ctx.stroke();

    // Sunflower roots (shallow)
    ctx.strokeStyle = '#d9b382';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(sunX, soilY); ctx.lineTo(sunX - 25, soilY + 30);
    ctx.moveTo(sunX, soilY); ctx.lineTo(sunX + 25, soilY + 28);
    ctx.stroke();

    // Flower blossom
    ctx.fillStyle = K.PAL.gold;
    ctx.beginPath();
    ctx.arc(sunX, soilY - sunH, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = K.PAL.ink;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#5c381e';
    ctx.beginPath();
    ctx.arc(sunX, soilY - sunH, 14, 0, Math.PI * 2);
    ctx.fill();

    // Sunflower Label
    ctx.fillStyle = '#fffdf6';
    ctx.font = '800 13px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BUNGA (CEPAT)', sunX, soilY - sunH - 42);

    // 2. Oak Tree on Right
    const oakX = stageX + 760;
    const oakH = beat <= 3 ? 35 : beat <= 5 ? 120 : 210;

    // Oak roots (very deep network)
    const rootDepth = beat <= 2 ? 80 : 230;
    ctx.strokeStyle = '#d9b382';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(oakX, soilY);
    ctx.lineTo(oakX, soilY + rootDepth);
    ctx.moveTo(oakX, soilY + 40); ctx.lineTo(oakX - 45, soilY + 110);
    ctx.moveTo(oakX, soilY + 80); ctx.lineTo(oakX + 50, soilY + 160);
    if (beat >= 4) {
      ctx.moveTo(oakX - 45, soilY + 110); ctx.lineTo(oakX - 70, soilY + 190);
      ctx.moveTo(oakX + 50, soilY + 160); ctx.lineTo(oakX + 80, soilY + 225);
    }
    ctx.stroke();

    // Oak trunk & canopy
    if (beat <= 2) {
      // Small sprout
      ctx.strokeStyle = K.PAL.emerald;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(oakX, soilY);
      ctx.lineTo(oakX, soilY - oakH);
      ctx.stroke();
    } else {
      // Growing Oak Tree
      ctx.fillStyle = '#6b4f38';
      ctx.strokeStyle = K.PAL.ink;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(oakX - 16, soilY - oakH, 32, oakH, 10);
      ctx.fill();
      ctx.stroke();

      // Lush green canopy
      ctx.fillStyle = K.PAL.emerald;
      ctx.beginPath();
      ctx.arc(oakX, soilY - oakH - 30, beat >= 6 ? 68 : 45, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = K.PAL.ink;
      ctx.lineWidth = 3.5;
      ctx.stroke();
    }

    // Oak Tree Label
    ctx.fillStyle = '#fffdf6';
    ctx.font = '800 13px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('POHON EK (AKAR DALAM)', oakX, soilY - oakH - (beat >= 6 ? 108 : 65));

    ctx.restore();

    const speeches = [
      'Kutanam dua benih di hari yang sama di kebun ini...',
      'Bunga matahari mekar cepat, pohon ek masih nyaris kosong!',
      'Kalau pohon ek bandingkan diri, ia pasti merasa gagal...',
      'Manusia juga sering iri liat teman melesat di permukaan!',
      'Tapi lihat ke bawah tanah: pohon ek bangun akar raksasa!',
      'Akar dalam ini yang bakal menopang dahan ratusan tahun!',
      'Yang tampak lambat, seringnya sedang persiapkan fondasi!',
      'Jangan cabut benihmu, sirami terus sampai musimmu tiba!',
    ];

    const princeX = stageX + 200;
    const pose = beat <= 2 ? 'wonder' : beat <= 5 ? 'write' : 'celebrate';
    K.picturebookStickman(ctx, princeX, groundY, t, {
      scale: 0.95,
      pose,
      facing: 1,
      prop: 'watering',
      speech: speeches[beat],
    });
  });

  const callouts = [
    { tag: 'DUA BENIH', title: 'Dua Benih Ditanam di Hari yang Sama', desc: 'Bunga matahari dan pohon ek memulai perjalanan hidup pada detik yang sama', stat: 'BENIH SAMA', col: K.PAL.emerald, c: C.hook },
    { tag: 'PERMUKAAN TANAH', title: 'Tunas Bunga Melompat Tinggi dalam Seminggu', desc: 'Pertumbuhan instan di permukaan memberi kesan keberhasilan yang spektakuler', stat: '7 HARI MEKAR', col: K.PAL.gold, c: C.permukaan },
    { tag: 'ILUSI PERBANDINGAN', title: 'Benih Pohon Ek Merasa Tertinggal & Gagal', desc: 'Membandingkan progres awal kita dengan garis akhir orang lain adalah racun pikiran', stat: 'ILUSI KALAH', col: K.PAL.crimson, c: C.ragu },
    { tag: 'DINAMIKA SOSIAL', title: 'Melihat Teman Sebaya Cepat Berhasil di Medsos', desc: 'Kita hanya melihat etalase hasil orang lain tanpa tahu kedalaman fondasinya', stat: 'MEDSOS BIAS', col: K.PAL.crimson, c: C.manusia },
    { tag: 'AKAR VERTIKAL', title: 'Pohon Ek Membangun Jaringan Akar Sangat Dalam', desc: 'Di balik kesunyian, terjadi akumulasi kekuatan yang tidak terlihat oleh mata awam', stat: 'AKAR DALAM', col: K.PAL.emerald, c: C.akar },
    { tag: 'FONDASI BADAI', title: 'Akar Kokoh Menopang Dahan Melintasi Ratusan Tahun', desc: 'Keahlian langka membutuhkan waktu matang yang panjang agar tahan menghadapi krisis', stat: '100 TAHUN', col: K.PAL.emerald, c: C.fondasi },
    { tag: 'HUKUM INKUBASI', title: 'Yang Lambat Sering Kali Merupakan Fondasi Terkuat', desc: 'Jangan terburu-buru menginginkan buah sebelum akarmu mencengkeram bumi', stat: 'FONDASI', col: K.PAL.gold, c: C.musim },
    { tag: 'PESAN JUARA', title: 'Sirami Akarmu & Percayai Waktu Tumbuhmu', desc: 'Setia pada proses harianmu, musim mekar terbaikmu pasti akan tiba!', stat: 'SABAR MEKAR', col: K.PAL.emerald, c: C.moral },
  ][beat];

  K.picturebookCallout(ctx, 540, 1485, 960, 165, {
    tag: callouts.tag,
    title: callouts.title,
    desc: callouts.desc,
    stat: callouts.stat,
    col: callouts.col,
    a: pop(t, callouts.c ? callouts.c.start + 0.15 : 0),
  });
}
