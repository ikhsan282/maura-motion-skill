// 77 · STICKMAN PICTUREBOOK — Demo 1: Dongeng Batu yang Menyusut (Full-Screen 1080x1920 8-Beat Standard)
import * as K from '/styles/stickman-picturebook/kit.js';
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
  const W = 1080;
  const H = 1920;
  ctx.clearRect(0, 0, W, H);

  let beat = 0;
  if (t >= C.moral?.start) beat = 7;
  else if (t >= C.kerikil?.start) beat = 6;
  else if (t >= C.susut?.start) beat = 5;
  else if (t >= C.sentuh?.start) beat = 4;
  else if (t >= C.kabut?.start) beat = 3;
  else if (t >= C.ilusi?.start) beat = 2;
  else if (t >= C.pangeran?.start) beat = 1;

  let zoom = 1.0, fx = 540, fy = 880;
  if (beat === 1 || beat === 2) {
    zoom = 1.14; fx = 520; fy = 910;
  } else if (beat >= 4) {
    zoom = 1.15; fx = 560; fy = 930;
  }

  K.picturebookBg(ctx, W, H, t);

  const stageTags = [
    'BAB I • BATU KECEMASAN DI TENGAH JALAN',
    'BAB I • PANGERAN KECIL & RASA TAKUT',
    'BAB I • PEMBESARAN EMOSIONAL SAAT DIAM',
    'BAB I • ILUSI KABUT PIKIRAN KITA SENDIRI',
    'BAB I • SENTUHAN PERTAMA PENA BULU EMAS',
    'BAB I • KEAJAIBAN: BATU MENYUSUT SEPARUH',
    'BAB I • 3 LANGKAH MENGUBAH JADI KERIKIL',
    'BAB I • SAKSIKAN BATU RAKSASAMU MENYUSUT!',
  ];

  K.drawPicturebookHeader(
    ctx,
    W,
    stageTags[beat],
    'Dongeng Batu yang Menyusut',
    'Mengapa Beban Raksasa Selalu Mengecil Begitu Kita Berani Melangkah?',
    beat >= 4 ? K.PAL.emerald : K.PAL.crimson
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

    let boulderScale = 1.0;
    if (beat <= 1) boulderScale = 1.0;
    else if (beat <= 3) boulderScale = 1.06 + Math.sin(t * 3) * 0.03;
    else if (beat === 4) boulderScale = 0.65;
    else if (beat === 5) boulderScale = 0.40;
    else boulderScale = 0.18;

    const princeX = beat <= 3 ? stageX + 220 : beat <= 5 ? stageX + 380 : stageX + 440;
    const boulderX = stageX + 700;
    const boulderR = 135 * boulderScale;

    // Boulder shadow & body
    ctx.save();
    ctx.fillStyle = 'rgba(45, 35, 24, 0.2)';
    ctx.beginPath();
    ctx.ellipse(boulderX, groundY + 4, boulderR * 1.3, boulderR * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.translate(boulderX, groundY - boulderR * 0.75);
    ctx.fillStyle = beat >= 6 ? '#c8b89a' : '#7f7264';
    ctx.beginPath();
    ctx.roundRect(-boulderR, -boulderR * 0.8, boulderR * 2, boulderR * 1.6, 32 * boulderScale);
    ctx.fill();
    ctx.strokeStyle = K.PAL.ink;
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#fffdf6';
    ctx.font = `800 ${Math.max(14, Math.round(22 * boulderScale))}px "Plus Jakarta Sans", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(beat >= 6 ? 'KERIKIL' : 'BEBAN TUGAS', 0, 6, boulderR * 1.75);
    ctx.restore();

    // Sparkles when shrinking
    if (beat >= 4) {
      ctx.save();
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2 + t * 2;
        const rad = boulderR + 25 + Math.sin(t * 4 + i) * 8;
        const sx = boulderX + Math.cos(ang) * rad;
        const sy = groundY - boulderR * 0.75 + Math.sin(ang) * rad * 0.7;
        ctx.fillStyle = K.PAL.gold;
        ctx.beginPath();
        ctx.arc(sx, sy, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Top Scale Badge in Stage
    ctx.save();
    ctx.fillStyle = '#fffdf5';
    ctx.beginPath();
    ctx.roundRect(stageX + stageW - 275, stageY + 18, 250, 48, 12);
    ctx.fill();
    ctx.strokeStyle = K.PAL.ink;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = beat >= 4 ? K.PAL.emerald : K.PAL.crimson;
    ctx.font = '800 15px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    const pct = Math.round(boulderScale * 100);
    ctx.fillText(`UKURAN BEBAN: ${pct}%`, stageX + stageW - 150, stageY + 48, 230);
    ctx.restore();

    const speeches = [
      'Batu masalah ini tampak setinggi gunung!',
      'Gemetar rasanya kalau cuma ditatap dari jauh...',
      'Makin ditunda, bayangan cemasnya makin raksasa!',
      'Sebagian besar ukurannya cuma kabut pikiran!',
      'Kusentuh batunya pakai pena bulu emas...',
      'Ajaib! Batunya langsung menyusut separuh!',
      'Tiga langkah konsisten, batunya jadi kerikil!',
      'Melangkahlah, maka batu raksasamu akan menyusut!',
    ];

    const pose = beat <= 2 ? 'wonder' : beat === 3 ? 'wonder' : beat <= 5 ? 'write' : 'celebrate';
    K.picturebookStickman(ctx, princeX, groundY, t, {
      scale: 0.95,
      pose,
      facing: 1,
      prop: 'quill',
      speech: speeches[beat],
    });
  });

  const callouts = [
    { tag: 'KABUT DIAM', title: 'Tugas Besar Tampak Seperti Batu Menutup Jalan', desc: 'Menatap masalah dari jauh memberi ruang bagi imajinasi cemas melipatgandakan beban', stat: 'ILUSI 100%', col: K.PAL.crimson, c: C.hook },
    { tag: 'PANGERAN KECIL', title: 'Berdiri Gemetar Menghadapi Beban Pikiran', desc: 'Perasaan takut dan tidak berdaya saat memikirkan seluruh beban tugas sekaligus', stat: 'CEMAS', col: K.PAL.crimson, c: C.pangeran },
    { tag: 'PEMBESARAN EMOSIONAL', title: 'Otak Menambahkan Bayangan Ketakutan Semu', desc: 'Saat kita pasif, amigdala mengira tugas abstrak sebagai ancaman eksistensial nyata', stat: 'BAYANGAN', col: K.PAL.gold, c: C.ilusi },
    { tag: 'KABUT KOGNITIF', title: 'Ukuran Beban Sebenarnya Hanya Ilusi Pikiran', desc: 'Bukan tugasnya yang berat, melainkan ketidakpastian yang belum didefinisikan', stat: 'KABUT', col: K.PAL.gold, c: C.kabut },
    { tag: 'SENTUHAN AWAL', title: 'Sentuh Masalah dengan Pena Bulu Emasmu', desc: 'Menulis satu kalimat pembuka langsung mengubah ancaman abstrak menjadi konkret', stat: 'SUSUT 50%', col: K.PAL.emerald, c: C.sentuh },
    { tag: 'KEAJAIBAN DONGENG', title: 'Batu Raksasa Menyusut Seketika Saat Didekati', desc: 'Aksi nyata mematahkan ilusi otak dan mengembalikan kendali ke tanganmu', stat: 'MOMENTUM', col: K.PAL.emerald, c: C.susut },
    { tag: 'MENJADI KERIKIL', title: 'Tiga Langkah Konsisten Mengikis Habis Beban', desc: 'Tugas yang tadinya menakutkan kini menjadi kerikil kecil yang mudah dilangkahi', stat: 'KERIKIL', col: K.PAL.emerald, c: C.kerikil },
    { tag: 'HIKMAH DONGENG', title: 'Tindakan Nyata Mendahului Keberanian', desc: 'Jangan tunggu rasa takut hilang; melangkahlah dulu dan saksikan bebanmu lenyap!', stat: 'MULAI KECIL', col: K.PAL.crimson, c: C.moral },
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
