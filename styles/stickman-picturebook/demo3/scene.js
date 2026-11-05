// 77 · STICKMAN PICTUREBOOK — Demo 3: Lentera Seratus Langkah
import * as K from '/styles/stickman-picturebook/kit.js';
const { clamp, lerp, ease } = AM.lib;

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
  if (t >= C.hadiah.start) segIndex = 3;
  else if (t >= C.cahaya.start) segIndex = 2;
  else if (t >= C.lumpuh.start) segIndex = 1;

  K.picturebookBg(ctx, W, H, t);

  K.drawPicturebookHeader(
    ctx,
    W,
    'Dongeng Psikologi • Bab III',
    'Lentera Seratus Langkah',
    'Mengapa kamu hanya perlu melihat satu langkah terang di depan kakimu saat ini?',
    K.PAL.gold
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
    K.PAL.gold,
    'ILUSTRASI BAB III: CAHAYA LENTERA YANG IKUT MELANGKAH'
  );

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(stageX + 6, stageY + 62, stageW - 12, stageH - 68, 18);
  ctx.clip();

  ctx.fillStyle = 'rgba(28, 34, 56, 0.58)';
  ctx.fillRect(stageX, stageY + 62, stageW, stageH - 68);

  const stepProgress =
    segIndex === 0
      ? 0
      : segIndex === 1
      ? 0.1
      : segIndex === 2
      ? lerp(0.1, 0.58, clamp((t - C.cahaya.start) / 2.2, 0, 1))
      : lerp(0.58, 0.9, clamp((t - C.hadiah.start) / 2.0, 0, 1));

  const princeX = lerp(stageX + 165, stageX + 715, stepProgress);

  const lanternGlow = ctx.createRadialGradient(
    princeX + 45,
    groundY - 95,
    20,
    princeX + 45,
    groundY - 95,
    240
  );
  lanternGlow.addColorStop(0, 'rgba(255, 224, 130, 0.92)');
  lanternGlow.addColorStop(0.55, 'rgba(246, 185, 59, 0.38)');
  lanternGlow.addColorStop(1, 'rgba(246, 185, 59, 0)');
  ctx.fillStyle = lanternGlow;
  ctx.beginPath();
  ctx.arc(princeX + 45, groundY - 95, 240, 0, Math.PI * 2);
  ctx.fill();

  const stones = [
    { x: stageX + 170, label: 'Langkah 1' },
    { x: stageX + 310, label: 'Langkah 25' },
    { x: stageX + 450, label: 'Langkah 50' },
    { x: stageX + 590, label: 'Langkah 75' },
    { x: stageX + 735, label: 'Langkah 100 ★' },
  ];

  stones.forEach((st) => {
    const dist = Math.abs(st.x - (princeX + 30));
    const lit = dist < 195 || segIndex === 3;
    ctx.fillStyle = lit ? K.PAL.gold : 'rgba(255,255,255,0.22)';
    ctx.beginPath();
    ctx.roundRect(st.x - 52, groundY - 8, 104, 28, 10);
    ctx.fill();
    ctx.strokeStyle = K.PAL.ink;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = lit ? K.PAL.ink : 'rgba(255,255,255,0.65)';
    ctx.font = '800 13px "Plus Jakarta Sans", "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(st.label, st.x, groundY + 11, 94);
  });

  ctx.restore();

  const speeches = [
    'Jalannya 100 langkah, tapi lenteraku cuma menerangi 2 langkah!',
    'Kalau menunggu seluruh lembah terang, aku takkan pernah berangkat...',
    'Aha! Saat aku maju selangkah, cahayanya ikut membuka jalan di depan!',
    'Cukup terangi langkah hari ini, langkah esok akan terbuka!',
  ];

  K.picturebookStickman(ctx, princeX, groundY - 6, t, {
    scale: 0.94,
    pose: segIndex === 2 ? 'walk' : segIndex === 3 ? 'celebrate' : 'idle',
    facing: 1,
    prop: 'lantern',
    speech: speeches[segIndex],
  });

  const cardX = 58;
  const cardW = W - 116;
  const cardH = 120;
  const startY = 748;
  const gap = 136;

  const cards = [
    {
      badge: '1. KABUT MASA DEPAN',
      title: 'Kelumpuhan Analisis Menuntut Kepastian 100%',
      desc: 'Menolak melangkah sebelum melihat ujung jalan membuat kita terjebak di titik awal selamanya.',
      stat: 'Overthinking',
      accent: K.PAL.crimson,
      startT: C.hook.start + 0.1,
    },
    {
      badge: '2. PRINSIP LENTERA',
      title: 'Cahaya Hanya Perlu Menerangi Pijakan Saat Ini',
      desc: 'Otak kita bekerja paling tenang ketika fokus pada satu tindakan konkret yang ada di depan mata.',
      stat: 'Fokus 1 Langkah',
      accent: K.PAL.gold,
      startT: C.lumpuh.start,
    },
    {
      badge: '3. CAHAYA BERGERAK',
      title: 'Kejelasan Muncul Sebagai Hasil dari Melangkah',
      desc: 'Informasi dan peluang baru hanya terlihat setelah kita berpindah dari posisi lama kita.',
      stat: 'Jalan Terbuka',
      accent: K.PAL.emerald,
      startT: C.cahaya.start,
    },
    {
      badge: '4. PESAN DONGENG',
      title: 'Seratus Langkah Ditaklukkan Satu Pijakan Demi Satu',
      desc: 'Percayalah pada lentera kecilmu hari ini; konsistensi akan mengantarmu menembus kabut.',
      stat: 'Terus Jalan',
      accent: K.PAL.sky,
      startT: C.hadiah.start,
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
    'Moral Dongeng: Kamu tidak perlu melihat ujung jalan untuk mengambil satu langkah yang terang hari ini.',
    K.PAL.gold
  );
}
