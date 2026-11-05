// 77 · STICKMAN PICTUREBOOK — Demo 2: Kisah Dua Benih di Taman
import * as K from '/styles/stickman-picturebook/kit.js';
const { clamp, ease } = AM.lib;

export const meta = { fps: 30, width: 1080, height: 1920, captions: { preset: 'clean', y: 1620, size: 48 } };

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

  let segIndex = 0;
  if (t >= C.musim.start) segIndex = 3;
  else if (t >= C.akar.start) segIndex = 2;
  else if (t >= C.ragu.start) segIndex = 1;

  K.picturebookBg(ctx, W, H, t);

  K.drawPicturebookHeader(
    ctx,
    W,
    'Dongeng Psikologi • Bab II',
    'Kisah Dua Benih di Taman',
    'Mengapa membandingkan musim tumbuhmu dengan kecepatan orang lain itu tidak adil?',
    K.PAL.emerald
  );

  const stageX = 58;
  const stageY = 216;
  const stageW = W - 116;
  const stageH = 510;
  const groundY = K.drawStorybookStage(
    ctx,
    stageX,
    stageY,
    stageW,
    stageH,
    t,
    K.PAL.emerald,
    'ILUSTRASI BAB II: BUNGA CEPAT VS AKAR POHON EK'
  );

  const soilY = groundY - 24;
  ctx.save();
  ctx.fillStyle = '#5a3d28';
  ctx.beginPath();
  ctx.roundRect(stageX + 310, soilY, stageW - 330, stageY + stageH - soilY - 12, 18);
  ctx.fill();
  ctx.strokeStyle = K.PAL.ink;
  ctx.lineWidth = 3;
  ctx.stroke();

  const sunPlantX = stageX + 430;
  const sunHeight = segIndex === 0 ? 125 : 155;
  ctx.strokeStyle = K.PAL.emerald;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(sunPlantX, soilY);
  ctx.lineTo(sunPlantX, soilY - sunHeight);
  ctx.stroke();

  ctx.strokeStyle = '#d9b382';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(sunPlantX, soilY);
  ctx.lineTo(sunPlantX - 24, soilY + 26);
  ctx.moveTo(sunPlantX, soilY);
  ctx.lineTo(sunPlantX + 24, soilY + 24);
  ctx.stroke();

  ctx.fillStyle = K.PAL.gold;
  ctx.beginPath();
  ctx.arc(sunPlantX, soilY - sunHeight, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = K.PAL.ink;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#5c381e';
  ctx.beginPath();
  ctx.arc(sunPlantX, soilY - sunHeight, 13, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fffdf5';
  ctx.font = '800 14px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('MEKAR MINGGU 1', sunPlantX, soilY - sunHeight - 40, 160);

  const oakX = stageX + 740;
  const rootDepth = segIndex >= 2 ? 72 : 34;

  ctx.strokeStyle = segIndex >= 2 ? K.PAL.gold : '#d9b382';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(oakX, soilY);
  ctx.lineTo(oakX, soilY + rootDepth);
  ctx.moveTo(oakX, soilY + 22);
  ctx.lineTo(oakX - 55, soilY + rootDepth - 8);
  ctx.moveTo(oakX, soilY + 30);
  ctx.lineTo(oakX + 58, soilY + rootDepth - 4);
  ctx.moveTo(oakX, soilY + 44);
  ctx.lineTo(oakX - 35, soilY + rootDepth + 6);
  ctx.moveTo(oakX, soilY + 44);
  ctx.lineTo(oakX + 38, soilY + rootDepth + 6);
  ctx.stroke();

  const oakHeight = segIndex <= 1 ? 26 : segIndex === 2 ? 64 : 185;
  ctx.strokeStyle = '#6e472b';
  ctx.lineWidth = segIndex >= 3 ? 15 : 7;
  ctx.beginPath();
  ctx.moveTo(oakX, soilY);
  ctx.lineTo(oakX, soilY - oakHeight);
  ctx.stroke();

  if (segIndex >= 3) {
    ctx.fillStyle = K.PAL.emerald;
    ctx.beginPath();
    ctx.arc(oakX, soilY - oakHeight - 18, 62, 0, Math.PI * 2);
    ctx.arc(oakX - 45, soilY - oakHeight + 4, 42, 0, Math.PI * 2);
    ctx.arc(oakX + 45, soilY - oakHeight + 4, 42, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = K.PAL.ink;
    ctx.lineWidth = 3.5;
    ctx.stroke();
  } else {
    ctx.fillStyle = K.PAL.emerald;
    ctx.beginPath();
    ctx.ellipse(oakX - 12, soilY - oakHeight, 12, 7, -0.4, 0, Math.PI * 2);
    ctx.ellipse(oakX + 12, soilY - oakHeight, 12, 7, 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#fffdf5';
  ctx.font = '800 14px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.fillText(
    segIndex >= 3 ? 'POHON EK 100 TAHUN' : 'AKAR DALAM DI BAWAH TANAH',
    oakX,
    soilY + rootDepth + 22,
    240
  );
  ctx.restore();

  const speeches = [
    'Bunga matahari sudah tinggi, kok tunas pohon ek masih kecil?',
    'Jangan sedih tunas kecil, kamu bukan gagal bertumbuh...',
    'Lihat di bawah tanah! Akarmu sedang menembus lapisan terdalam!',
    'Pohon besar butuh waktu membangun fondasi sebelum menjulang!',
  ];

  K.picturebookStickman(ctx, stageX + 185, groundY, t, {
    scale: 0.94,
    pose: segIndex >= 3 ? 'celebrate' : 'idle',
    facing: 1,
    prop: 'watering',
    speech: speeches[segIndex],
  });

  const cardX = 58;
  const cardW = W - 116;
  const cardH = 120;
  const startY = 748;
  const gap = 136;

  const cards = [
    {
      badge: '1. JEBAKAN PERMUKAAN',
      title: 'Membandingkan Tunas Awal dengan Mekar Orang Lain',
      desc: 'Kita sering menilai kemajuan hanya dari apa yang tampak di atas tanah pada minggu pertama.',
      stat: 'Bias Visual',
      accent: K.PAL.crimson,
      startT: C.hook.start + 0.1,
    },
    {
      badge: '2. FASE AKAR',
      title: 'Pertumbuhan Tak Terlihat di Bawah Permukaan',
      desc: 'Keahlian mendalam dan karakter kuat selalu membutuhkan fase pengakaran yang sunyi.',
      stat: 'Fondasi Dalam',
      accent: K.PAL.gold,
      startT: C.ragu.start,
    },
    {
      badge: '3. ARSITEKTUR WAKTU',
      title: 'Bunga Musiman vs Pohon Ek Abadi',
      desc: 'Semakin besar kapasitas masa depan yang dibangun, semakin dalam akar yang harus disiapkan.',
      stat: 'Tahan Badai',
      accent: K.PAL.emerald,
      startT: C.akar.start,
    },
    {
      badge: '4. PESAN DONGENG',
      title: 'Rawat Benihmu Tanpa Mencabutnya',
      desc: 'Fokus menyiram proses belajar harianmu sendiri hingga tiba musim mekarmu yang sejati.',
      stat: 'Sabar & Tekun',
      accent: K.PAL.sky,
      startT: C.musim.start,
    },
  ];

  cards.forEach((c, idx) => {
    const appear = idx === 0 ? 1 : clamp(pop(t, c.startT), 0.25, 1);
    K.drawStoryCard(ctx, cardX, startY + idx * gap, cardW, cardH, {
      ...c,
      progress: appear,
      active: segIndex === idx,
    });
  });

  K.drawPicturebookFooter(
    ctx,
    W,
    H,
    'Moral Dongeng: Apa yang tampak lambat di permukaan sering kali sedang mengakar kuat di kedalaman.',
    K.PAL.emerald
  );
}
