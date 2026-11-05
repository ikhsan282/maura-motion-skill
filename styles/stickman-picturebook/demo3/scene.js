// 77 · STICKMAN PICTUREBOOK — Demo 3: Lentera Seratus Langkah (Full-Screen 1080x1920 8-Beat Standard)
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
  else if (t >= C.hadiah?.start) beat = 6;
  else if (t >= C.terbuka?.start) beat = 5;
  else if (t >= C.cahaya?.start) beat = 4;
  else if (t >= C.kabut?.start) beat = 3;
  else if (t >= C.lumpuh?.start) beat = 2;
  else if (t >= C.cemas?.start) beat = 1;

  let zoom = 1.0, fx = 540, fy = 880;
  if (beat === 1 || beat === 2) {
    zoom = 1.14; fx = 520; fy = 910;
  } else if (beat >= 4) {
    zoom = 1.15; fx = 560; fy = 930;
  }

  K.picturebookBg(ctx, W, H, t);

  const stageTags = [
    'BAB III • LEMBAH SERATUS LANGKAH MALAM',
    'BAB III • LENTERA HANYA DUA LANGKAH TERANG',
    'BAB III • KELUMPUHAN ANALISIS MENUNTUT KEPASTIAN',
    'BAB III • ILUSI KABUT: JALAN DIKIRA TIDAK ADA',
    'BAB III • CAHAYA LENTERA IKUT BERPINDAH',
    'BAB III • LANGKAH KETIGA OTOMATIS TERBUKA',
    'BAB III • KEJELASAN DIBUKA BAGI YANG BERJALAN',
    'BAB III • AMBIL SATU LANGKAH TERANG HARI INI!',
  ];

  K.drawPicturebookHeader(
    ctx,
    W,
    stageTags[beat],
    'Lentera Seratus Langkah',
    'Mengapa Kamu Hanya Perlu Melihat Satu Langkah Terang di Depan Kaki?',
    beat >= 4 ? K.PAL.gold : K.PAL.crimson
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
      beat >= 4 ? K.PAL.gold : K.PAL.crimson,
      stageTags[beat]
    );

    // Night Forest Darkness inside stage
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(stageX + 6, stageY + 62, stageW - 12, stageH - 68, 18);
    ctx.clip();

    ctx.fillStyle = 'rgba(28, 34, 56, 0.65)';
    ctx.fillRect(stageX, stageY + 62, stageW, stageH - 68);

    // Stepping progress across beats
    const stepRatio = beat <= 2 ? 0.08 : beat <= 4 ? 0.35 : beat <= 5 ? 0.65 : 0.88;
    const princeX = lerp(stageX + 175, stageX + 740, stepRatio);

    // Dynamic Lantern Glow
    const lanternGlow = ctx.createRadialGradient(
      princeX + 40,
      groundY - 110,
      25,
      princeX + 40,
      groundY - 110,
      280
    );
    lanternGlow.addColorStop(0, 'rgba(255, 230, 140, 0.95)');
    lanternGlow.addColorStop(0.45, 'rgba(246, 185, 59, 0.42)');
    lanternGlow.addColorStop(1, 'rgba(246, 185, 59, 0)');
    ctx.fillStyle = lanternGlow;
    ctx.beginPath();
    ctx.arc(princeX + 40, groundY - 110, 280, 0, Math.PI * 2);
    ctx.fill();

    // Stepping stones along the path
    const stones = [
      { x: stageX + 180, label: 'Langkah 1' },
      { x: stageX + 340, label: 'Langkah 25' },
      { x: stageX + 510, label: 'Langkah 50' },
      { x: stageX + 680, label: 'Langkah 75' },
      { x: stageX + 830, label: 'Kastil 100' },
    ];

    stones.forEach((s) => {
      ctx.fillStyle = '#edd6b1';
      ctx.beginPath();
      ctx.roundRect(s.x - 48, groundY + 2, 96, 32, 10);
      ctx.fill();
      ctx.strokeStyle = K.PAL.ink;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = K.PAL.ink;
      ctx.font = '800 12px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(s.label, s.x, groundY + 22);
    });

    // Distant Castle at the End
    const castleX = stageX + 830;
    ctx.fillStyle = beat >= 6 ? K.PAL.gold : '#706052';
    ctx.beginPath();
    ctx.roundRect(castleX - 35, groundY - 180, 70, 140, 12);
    ctx.fill();
    ctx.strokeStyle = K.PAL.ink;
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Castle turrets
    ctx.beginPath();
    ctx.moveTo(castleX - 35, groundY - 180);
    ctx.lineTo(castleX, groundY - 225);
    ctx.lineTo(castleX + 35, groundY - 180);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    const speeches = [
      'Lembah malam ini seratus langkah menuju kastil impian!',
      'Tapi lenteraku cuma menerangi dua langkah di depan...',
      'Tuntutan tau semua langkah bikin kita lumpuh gak gerak!',
      'Kabut malam bikin kita ngira jalannya gak ada!',
      'Rahasia lentera: lingkar cahayanya ikut gerak bareng kaki!',
      'Maju selangkah, langkah berikutnya langsung keliatan terang!',
      'Kejelasan gak turun di awal, tapi dibuka buat yang jalan!',
      'Ambil satu langkah terang hari ini, jalanmu akan terbuka!',
    ];

    const pose = beat <= 2 ? 'wonder' : beat <= 4 ? 'walk' : 'celebrate';
    K.picturebookStickman(ctx, princeX, groundY, t, {
      scale: 0.95,
      pose,
      facing: 1,
      prop: 'lantern',
      speech: speeches[beat],
    });
  });

  const callouts = [
    { tag: 'LEMBAH MALAM', title: 'Perjalanan Seratus Langkah Menuju Kastil Impian', desc: 'Melihat keseluruhan jarak perjalanan membuat pikiran merasa kewalahan', stat: '100 LANGKAH', col: K.PAL.gold, c: C.hook },
    { tag: 'RADIUS LENTERA', title: 'Lentera Kecil Hanya Menerangi Dua Langkah Pendek', desc: 'Kita cemas karena tidak bisa melihat tikungan di langkah kelima puluh', stat: '2 LANGKAH', col: K.PAL.crimson, c: C.cemas },
    { tag: 'ANALYSIS PARALYSIS', title: 'Kelumpuhan Analisis Menuntut Kepastian Penuh', desc: 'Menolak melangkah sampai seluruh peta masa depan terjamin tanpa risiko', stat: 'LUMPUH', col: K.PAL.crimson, c: C.lumpuh },
    { tag: 'ILUSI KABUT', title: 'Otak Mengira Jalan Tidak Ada Hanya Karena Gelap', desc: 'Padahal jalan tanah tersebut kokoh berada di sana menunggu dipijak', stat: 'KABUT ILUSI', col: K.PAL.gold, c: C.kabut },
    { tag: 'LINGKAR CAHAYA', title: 'Cahaya Lentera Berpindah Mengikuti Langkahmu', desc: 'Sains aksi: Keberanian bertindak melahirkan kejelasan berpikir berikutnya', stat: 'IKUT BERPINDAH', col: K.PAL.gold, c: C.cahaya },
    { tag: 'PROGRESSIVE REVELATION', title: 'Langkah Ketiga Otomatis Terbuka Begitu Kamu Maju', desc: 'Kamu tidak butuh melihat seluruh tangga, cukup injak anak tangga pertama', stat: 'TERBUKA', col: K.PAL.emerald, c: C.terbuka },
    { tag: 'HUKUM PERJALANAN', title: 'Kejelasan Adalah Hadiah Bagi Mereka yang Berjalan', desc: 'Jawaban dan peluang baru hanya muncul saat kamu sudah berada dalam gerakan', stat: 'HADIAH AKSI', col: K.PAL.emerald, c: C.hadiah },
    { tag: 'PESAN JUARA', title: 'Fokus pada Satu Langkah Terang di Depan Kakimu', desc: 'Pegang lenteramu, ambil langkah pertamamu sekarang, dan raih kastil impianmu!', stat: 'KASTIL JUARA', col: K.PAL.gold, c: C.moral },
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
