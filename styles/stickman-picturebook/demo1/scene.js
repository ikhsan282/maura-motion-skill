// 77 · STICKMAN PICTUREBOOK — Demo 1: Dongeng Batu yang Menyusut
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
  if (t >= C.kerikil.start) segIndex = 3;
  else if (t >= C.sentuh.start) segIndex = 2;
  else if (t >= C.ilusi.start) segIndex = 1;

  K.picturebookBg(ctx, W, H, t);

  K.drawPicturebookHeader(
    ctx,
    W,
    'Dongeng Psikologi • Bab I',
    'Dongeng Batu yang Menyusut',
    'Mengapa beban raksasa selalu mengecil begitu kita berani melangkah mendekatinya?',
    K.PAL.crimson
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
    'ILUSTRASI BAB I: BATU ILUSI VS LANGKAH PERTAMA'
  );

  let boulderScale = 1.0;
  if (segIndex === 0) boulderScale = 1.0;
  else if (segIndex === 1) boulderScale = 1.06 + Math.sin(t * 3) * 0.03;
  else if (segIndex === 2) boulderScale = lerp(1.0, 0.52, clamp((t - C.sentuh.start) / 2.2, 0, 1));
  else boulderScale = lerp(0.52, 0.22, clamp((t - C.kerikil.start) / 2.0, 0, 1));

  const princeX =
    segIndex <= 1
      ? stageX + 220
      : segIndex === 2
      ? lerp(stageX + 220, stageX + 410, clamp((t - C.sentuh.start) / 1.8, 0, 1))
      : stageX + 440;

  const boulderX = stageX + 680;
  const boulderR = 132 * boulderScale;

  if (segIndex <= 2) {
    ctx.save();
    const shadowAlpha = segIndex <= 1 ? 0.22 : 0.1;
    ctx.fillStyle = `rgba(45, 35, 24, ${shadowAlpha})`;
    ctx.beginPath();
    ctx.arc(boulderX, groundY - boulderR * 0.85, boulderR * 1.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  ctx.translate(boulderX, groundY - boulderR * 0.78);
  ctx.fillStyle = segIndex >= 3 ? '#c8b89a' : '#7f7264';
  ctx.beginPath();
  ctx.roundRect(-boulderR, -boulderR * 0.8, boulderR * 2, boulderR * 1.6, 36 * boulderScale);
  ctx.fill();
  ctx.strokeStyle = K.PAL.ink;
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = '#fffdf6';
  ctx.font = `800 ${Math.max(14, Math.round(22 * boulderScale))}px "Plus Jakarta Sans", "Inter", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(segIndex >= 3 ? 'KERIKIL' : 'BEBAN TUGAS', 0, 6, boulderR * 1.75);
  ctx.restore();

  if (segIndex >= 2) {
    ctx.save();
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2 + t * 1.8;
      const rad = boulderR + 28 + Math.sin(t * 4 + i) * 10;
      const sx = boulderX + Math.cos(ang) * rad;
      const sy = groundY - boulderR * 0.8 + Math.sin(ang) * rad * 0.7;
      ctx.fillStyle = K.PAL.gold;
      ctx.beginPath();
      ctx.arc(sx, sy, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  ctx.save();
  ctx.fillStyle = '#fffdf5';
  ctx.beginPath();
  ctx.roundRect(stageX + stageW - 265, stageY + 18, 242, 48, 12);
  ctx.fill();
  ctx.strokeStyle = K.PAL.ink;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = K.PAL.crimson;
  ctx.font = '800 15px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.textAlign = 'center';
  const pct = Math.round(boulderScale * 100);
  ctx.fillText(`UKURAN BEBAN: ${pct}%`, stageX + stageW - 144, stageY + 48, 220);
  ctx.restore();

  const speeches = [
    'Mengapa batu tugas ini tampak setinggi gunung?!',
    'Semakin lama kutatap dari jauh, bayangannya makin besar...',
    'Eh? Begitu kusentuh dan kupecah, batunya langsung menyusut!',
    'Tiga langkah kecil mengubah batu raksasa jadi kerikil!',
  ];

  K.picturebookStickman(ctx, princeX, groundY, t, {
    scale: 0.94,
    pose: segIndex === 2 ? 'write' : segIndex >= 3 ? 'celebrate' : 'wonder',
    facing: 1,
    prop: 'quill',
    speech: speeches[segIndex],
  });

  const cardX = 58;
  const cardW = W - 116;
  const cardH = 120;
  const startY = 748;
  const gap = 136;

  const cards = [
    {
      badge: '1. KABUT DIAM',
      title: 'Pembesaran Emosional Saat Menunda',
      desc: 'Menatap tugas dari jauh memberi ruang bagi imajinasi cemas untuk melipatgandakan ukuran beban.',
      stat: 'Ilusi 300%',
      accent: K.PAL.crimson,
      startT: C.hook.start + 0.1,
    },
    {
      badge: '2. SENTUHAN AWAL',
      title: 'Langkah Pertama Memecah Bayangan Takut',
      desc: 'Menulis satu kalimat pembuka mengubah ancaman abstrak menjadi pekerjaan konkret yang terukur.',
      stat: 'Susut 50%',
      accent: K.PAL.gold,
      startT: C.ilusi.start,
    },
    {
      badge: '3. MOMENTUM KECIL',
      title: 'Tiga Langkah Konsisten Mengikis Beban',
      desc: 'Setiap aksi nyata membuktikan kepada otak bahwa tugas tersebut aman dan bisa diselesaikan.',
      stat: 'Jadi Kerikil',
      accent: K.PAL.emerald,
      startT: C.sentuh.start,
    },
    {
      badge: '4. PESAN DONGENG',
      title: 'Tindakan Mendahului Keberanian',
      desc: 'Jangan tunggu rasa takut hilang; melangkahlah dulu maka rasa takut akan menyusut sendiri.',
      stat: 'Mulai 5 Menit',
      accent: K.PAL.sky,
      startT: C.kerikil.start,
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
    'Moral Dongeng: Batu masalah hanya tampak raksasa bagi kaki yang berhenti melangkah.',
    K.PAL.crimson
  );
}
