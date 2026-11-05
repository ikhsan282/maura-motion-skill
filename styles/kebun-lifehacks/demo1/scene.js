// 83 · KEBUN & LIFEHACKS SANTAI — Demo 1: Basmi Kutu Putih Tanpa Racun Kimia
// Full-Screen 1080x1920 (8 Beat Dinamis)

import * as K from '/styles/kebun-lifehacks/kit.js';

const { clamp, lerp, ease } = AM.lib;
const { PAL, withCamera, terraceBg, stepCard, interactiveQuiz, splitComparison, karaokeCard, sproutMascot, kebunCallout } = K;

export const meta = {
  fps: 30,
  width: 1080,
  height: 1920,
  captions: { preset: 'clean', y: 1700, size: 48 }
};

let ctx;
const C = {};
const pop = (t, a, d = 0.45) => ease.outBack(clamp((t - a) / d), 1.7);

export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
}

export function render(t) {
  ctx.clearRect(0, 0, 1080, 1920);

  // 1. Determine Current Beat (8 Beats)
  let beat = 0;
  if (t >= C.jawaban?.start) beat = 7;
  else if (t >= C.kuis?.start) beat = 6;
  else if (t >= C.langkah5?.start) beat = 5;
  else if (t >= C.langkah4?.start) beat = 4;
  else if (t >= C.langkah3?.start) beat = 3;
  else if (t >= C.langkah2?.start) beat = 2;
  else if (t >= C.langkah1?.start) beat = 1;

  // 2. Sunny Terrace Background
  terraceBg(ctx, t, { horizonY: 580 });

  // 3. Dynamic Camera
  let zoom = 1.0, fx = 540, fy = 880;
  if (beat === 1) {
    zoom = 1.06; fx = 540; fy = 780; // Comparison
  } else if (beat === 2) {
    zoom = 1.10; fx = 540; fy = 760; // Dish soap
  } else if (beat === 4) {
    zoom = 1.10; fx = 540; fy = 780; // Shaking bottle
  } else if (beat === 6) {
    zoom = 1.10; fx = 540; fy = 820; // Quiz
  }

  // 4. World Content with Camera
  withCamera(ctx, { zoom, fx, fy }, () => {

    // TOP EDUCATIONAL CARD (cx: 540, cy: 450, w: 960, h: 560)
    if (beat === 0) {
      // Beat 0: Mealybugs Infestation Alert
      stepCard(ctx, 540, 450, 960, 560, {
        stepBadge: 'SERANGAN HAMA DAUN',
        badgeCol: PAL.redDanger,
        fnContent: (ctx, x, y, w, h) => {
          // Warning headline
          ctx.fillStyle = PAL.redDanger;
          ctx.font = '900 64px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('DAUN DIPENUHI KUTU PUTIH?', x + w / 2, y + 155);

          ctx.fillStyle = PAL.inkMuted;
          ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
          ctx.fillText('Bercak kapas putih lengket dan semut hitam menghisap getah tunas', x + w / 2, y + 205);

          // Infested Leaf Illustration
          ctx.save();
          ctx.translate(x + w / 2, y + 360);

          // Green leaf
          ctx.beginPath();
          ctx.moveTo(0, 80);
          ctx.bezierCurveTo(-120, 20, -110, -90, 0, -120);
          ctx.bezierCurveTo(110, -90, 120, 20, 0, 80);
          ctx.fillStyle = '#22c55e';
          ctx.fill();

          // Leaf center vein
          ctx.strokeStyle = '#15803d';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(0, 80);
          ctx.lineTo(0, -110);
          ctx.stroke();

          // White fluffy Mealybugs clusters
          const bugs = [
            { x: -35, y: -40, r: 16 },
            { x: -20, y: -15, r: 20 },
            { x: -45, y: 10, r: 15 },
            { x: 30, y: -30, r: 18 },
            { x: 25, y: 5, r: 22 },
            { x: 45, y: 35, r: 14 }
          ];

          for (const b of bugs) {
            // White body
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Fluffy cotton fringe dots
            ctx.fillStyle = '#f8fafc';
            for (let a = 0; a < Math.PI * 2; a += 0.8) {
              const fx = b.x + Math.cos(a) * (b.r + 3);
              const fy = b.y + Math.sin(a) * (b.r + 3);
              ctx.beginPath();
              ctx.arc(fx, fy, 3.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // Crawling black ants
          ctx.fillStyle = '#0f172a';
          const antX = Math.sin(t * 3) * 15;
          ctx.beginPath();
          ctx.arc(-65 + antX, -60, 5, 0, Math.PI * 2);
          ctx.arc(-72 + antX, -62, 4, 0, Math.PI * 2);
          ctx.arc(-58 + antX, -58, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(65 - antX, 55, 5, 0, Math.PI * 2);
          ctx.arc(72 - antX, 57, 4, 0, Math.PI * 2);
          ctx.arc(58 - antX, 53, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = PAL.redDanger;
          ctx.font = '900 24px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('⚠️ MEALYBUGS & SEMUT PERUSAK', 0, 120);
          ctx.restore();
        }
      });
    } else if (beat === 1) {
      // Beat 1: Don't use harsh chemical pesticides
      stepCard(ctx, 540, 450, 960, 560, {
        stepBadge: 'LANGKAH 1/5',
        badgeCol: PAL.terracotta,
        fnContent: (ctx, x, y, w, h) => {
          splitComparison(ctx, x + w / 2, y + h / 2 + 10, w - 80, h - 140, {
            leftTag: 'BAHAYA RACUN KIMIA',
            leftTitle: '✖ Pestisida Sintetis Keras',
            leftItems: ['Daun gosong terbakar', 'Bahaya anak & hewan peliharaan', 'Kutu jadi kebal & resisten'],
            rightTag: 'SOLUSI AMAN DAPUR',
            rightTitle: '✔ Racikan Sabun & Minyak',
            rightItems: ['100% bahan alami dapur', 'Aman bagi tanaman & manusia', 'Melarutkan lapisan lilin kutu']
          });
        }
      });
    } else if (beat === 2) {
      // Beat 2: Add 1 tsp Dish Soap
      stepCard(ctx, 540, 450, 960, 560, {
        stepBadge: 'LANGKAH 2/5',
        badgeCol: PAL.terracotta,
        fnContent: (ctx, x, y, w, h) => {
          ctx.fillStyle = PAL.ink;
          ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('1 Sendok Teh Sabun Cuci Piring', x + w / 2, y + 160);

          ctx.fillStyle = PAL.inkMuted;
          ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
          ctx.fillText('Campurkan ke dalam botol semprot berisi 1 Liter air bersih', x + w / 2, y + 205);

          // Dish Soap Bottle & Spoon
          ctx.save();
          ctx.translate(x + w / 2, y + 360);

          // Soap Bottle
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.roundRect(-120, -75, 75, 135, 14);
          ctx.fill();
          // Cap
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.roundRect(-105, -95, 45, 20, 6);
          ctx.fill();

          // Droplets of dish soap
          ctx.fillStyle = '#4ade80';
          const dropY = (t * 120) % 70;
          ctx.beginPath();
          ctx.arc(-20, -50 + dropY, 8, 0, Math.PI * 2);
          ctx.fill();

          // Teaspoon
          ctx.fillStyle = '#94a3b8';
          ctx.beginPath();
          ctx.ellipse(30, 20, 36, 18, 0.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.rect(60, 16, 85, 10);
          ctx.fill();

          ctx.fillStyle = '#15803d';
          ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🧼 Surfaktan Melarutkan Lilin Pelindung Kutu', 0, 120);
          ctx.restore();
        }
      });
    } else if (beat === 3) {
      // Beat 3: Add 1 tsp Cooking Oil
      stepCard(ctx, 540, 450, 960, 560, {
        stepBadge: 'LANGKAH 3/5',
        badgeCol: PAL.terracotta,
        fnContent: (ctx, x, y, w, h) => {
          ctx.fillStyle = PAL.ink;
          ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('1 Sendok Teh Minyak Goreng Dapur', x + w / 2, y + 160);

          ctx.fillStyle = PAL.inkMuted;
          ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
          ctx.fillText('Berfungsi sebagai perekat alami dan menyumbat pori napas hama', x + w / 2, y + 205);

          // Cooking Oil Bottle & Spoon
          ctx.save();
          ctx.translate(x + w / 2, y + 360);

          // Golden Cooking Oil Bottle
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.roundRect(-120, -75, 75, 135, 14);
          ctx.fill();
          // Cap
          ctx.fillStyle = '#b45309';
          ctx.beginPath();
          ctx.roundRect(-105, -95, 45, 20, 6);
          ctx.fill();

          // Golden droplet
          ctx.fillStyle = '#fbbf24';
          const dropY = (t * 120) % 70;
          ctx.beginPath();
          ctx.arc(-20, -50 + dropY, 9, 0, Math.PI * 2);
          ctx.fill();

          // Teaspoon with golden oil sheen
          ctx.fillStyle = '#94a3b8';
          ctx.beginPath();
          ctx.ellipse(30, 20, 36, 18, 0.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.rect(60, 16, 85, 10);
          ctx.fill();

          ctx.fillStyle = '#b45309';
          ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🛢️ Lapisan Minyak Menyumbat Saluran Napas Hama', 0, 120);
          ctx.restore();
        }
      });
    } else if (beat === 4) {
      // Beat 4: Shake into white emulsion
      stepCard(ctx, 540, 450, 960, 560, {
        stepBadge: 'LANGKAH 4/5',
        badgeCol: PAL.terracotta,
        fnContent: (ctx, x, y, w, h) => {
          ctx.fillStyle = PAL.ink;
          ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Kocok Botol Hingga Beremulsi Putih', x + w / 2, y + 160);

          ctx.fillStyle = PAL.inkMuted;
          ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
          ctx.fillText('Campuran sabun dan minyak menyatu sempurna dengan molekul air', x + w / 2, y + 205);

          // Shaking Spray Bottle
          ctx.save();
          const shakeX = Math.sin(t * 16) * 10;
          ctx.translate(x + w / 2 + shakeX, y + 360);

          // Spray Bottle Body
          ctx.fillStyle = 'rgba(241, 245, 249, 0.9)';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.roundRect(-55, -45, 110, 125, 16);
          ctx.fill();
          ctx.stroke();

          // Milky emulsion liquid inside
          ctx.fillStyle = '#e2e8f0';
          ctx.beginPath();
          ctx.roundRect(-48, -10, 96, 84, 10);
          ctx.fill();

          // Foam bubbles
          ctx.fillStyle = '#ffffff';
          for (let i = -30; i <= 30; i += 20) {
            ctx.beginPath();
            ctx.arc(i, -12 + Math.sin(t * 10 + i) * 4, 8, 0, Math.PI * 2);
            ctx.fill();
          }

          // Trigger head
          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.roundRect(-40, -85, 80, 40, 8);
          ctx.fill();
          // Nozzle
          ctx.fillStyle = '#0369a1';
          ctx.beginPath();
          ctx.roundRect(40, -80, 26, 16, 4);
          ctx.fill();

          ctx.fillStyle = '#0284c7';
          ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('✨ Cairan Emulsi Putih Keruh Siap Pakai', 0, 120);
          ctx.restore();
        }
      });
    } else if (beat === 5) {
      // Beat 5: Spray Underside of Leaves at Dawn/Dusk
      stepCard(ctx, 540, 450, 960, 560, {
        stepBadge: 'LANGKAH 5/5',
        badgeCol: PAL.greenSuccess,
        fnContent: (ctx, x, y, w, h) => {
          ctx.fillStyle = PAL.ink;
          ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Semprot Bagian Bawah Daun (Pagi / Sore)', x + w / 2, y + 160);

          ctx.fillStyle = PAL.inkMuted;
          ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
          ctx.fillText('Hindari siang bolong agar cairan tidak menguap cepat dan daun tidak terbakar', x + w / 2, y + 205);

          // Spraying Underside of Leaf
          ctx.save();
          ctx.translate(x + w / 2, y + 360);

          // Leaf tilted
          ctx.save();
          ctx.rotate(-0.3);
          ctx.beginPath();
          ctx.moveTo(-100, 0);
          ctx.bezierCurveTo(-40, -70, 40, -70, 100, 0);
          ctx.bezierCurveTo(40, 40, -40, 40, -100, 0);
          ctx.fillStyle = '#22c55e';
          ctx.fill();
          ctx.restore();

          // Spray mist cone
          ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
          ctx.beginPath();
          ctx.moveTo(-120, 50);
          ctx.lineTo(-40, -10);
          ctx.lineTo(-20, 70);
          ctx.closePath();
          ctx.fill();

          // Spray nozzle
          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.roundRect(-155, 42, 35, 18, 4);
          ctx.fill();

          // Mist particles
          ctx.fillStyle = '#38bdf8';
          for (let m = 0; m < 8; m++) {
            const mx = -80 + (m * 12) + Math.sin(t * 8 + m) * 6;
            const my = 20 + Math.cos(t * 8 + m) * 15;
            ctx.beginPath();
            ctx.arc(mx, my, 4, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.fillStyle = '#15803d';
          ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('⏰ Pagi Jam 07:00 / Sore Jam 16:30', 0, 120);
          ctx.restore();
        }
      });
    } else if (beat === 6) {
      // Beat 6: Quiz
      interactiveQuiz(ctx, 540, 450, 960, 560, {
        title: 'Kenapa semut hitam sering mengerubungi kutu putih?',
        options: [
          { text: 'A. Menggembala Kutu Demi Embun Manis' },
          { text: 'B. Memangsa dan Memakan Kutu' },
          { text: 'C. Membersihkan Debu Kotoran Daun' }
        ],
        selected: null,
        revealAnswer: false,
        timerProgress: clamp((t - (C.kuis?.start ?? 0)) / ((C.kuis?.duration ?? 8) * 0.85))
      });
    } else if (beat === 7) {
      // Beat 7: Answer
      interactiveQuiz(ctx, 540, 450, 960, 560, {
        title: 'Kenapa semut hitam sering mengerubungi kutu putih?',
        options: [
          { text: 'A. Menggembala Kutu Demi Embun Manis' },
          { text: 'B. Memangsa dan Memakan Kutu' },
          { text: 'C. Membersihkan Debu Kotoran Daun' }
        ],
        selected: 0,
        revealAnswer: true,
        timerProgress: 1.0
      });
    }

    // CENTER NARRATIVE BOX (Karaoke Card)
    const karaokeData = [
      {
        lines: ['Daun penuh kapas putih', 'dan semut bergerombol?'],
        highlights: ['kapas putih']
      },
      {
        lines: ['Langkah 1: jangan semprot', 'racun pestisida kimia!'],
        highlights: ['jangan semprot']
      },
      {
        lines: ['Langkah 2: campurkan', '1 sendok sabun cair.'],
        highlights: ['1 sendok sabun']
      },
      {
        lines: ['Langkah 3: tambah 1 sendok', 'minyak goreng perekat.'],
        highlights: ['minyak goreng']
      },
      {
        lines: ['Langkah 4: kocok botol', 'hingga berbusa emulsi.'],
        highlights: ['berbusa emulsi']
      },
      {
        lines: ['Langkah 5: semprot balik daun', 'di pagi atau sore hari.'],
        highlights: ['balik daun']
      },
      {
        lines: ['Kuis: kenapa semut sering', 'mengerubungi kutu putih?'],
        highlights: ['kenapa semut']
      },
      {
        lines: ['Jawabannya A: semut mengisap', 'embun madu manis kutu!'],
        highlights: ['A: embun madu']
      }
    ];

    const currentKD = karaokeData[beat] || karaokeData[0];
    karaokeCard(ctx, 540, 1100, 920, 220, {
      lines: currentKD.lines,
      highlights: currentKD.highlights
    });

    // CUTE SPROUT MASCOT (Peeking at bottom right: x: 860, y: 1310)
    let mascotPose = 'think';
    if (beat === 0) mascotPose = 'shock';
    else if (beat === 7) mascotPose = 'happy';

    sproutMascot(ctx, 860, 1310, {
      scale: 1.45,
      pose: mascotPose,
      t
    });

  });

  // 5. Floating Educational Callout at y: 1485
  const callouts = [
    {
      start: C.hook?.start ?? 0,
      tag: 'HAMA MEALYBUGS',
      title: 'Kutu Putih & Semut',
      desc: 'Menghisap nutrisi floem daun hingga tanaman kerdil dan layu permanen.',
      stat: 'WASPADA',
      statSub: 'HAMA DAUN',
      col: PAL.redDanger
    },
    {
      start: C.langkah1?.start,
      tag: 'SOLUSI RAMAH LINGKUNGAN',
      title: 'Bebas Racun Sintetis',
      desc: 'Melindungi mikroba baik tanah dan aman dari residu berbahaya di rumah.',
      stat: '100% AMAN',
      statSub: 'ORGANIK',
      col: PAL.soilMid
    },
    {
      start: C.langkah2?.start,
      tag: 'SURFAKTAN ALAMI',
      title: 'Sabun Cuci Piring',
      desc: 'Merontokkan lapisan lilin kedap air yang melindungi kutu putih dari predator.',
      stat: 'SURFAKTAN',
      statSub: 'LARUT LILIN',
      col: '#0284c7'
    },
    {
      start: C.langkah3?.start,
      tag: 'PEREKAT ALAMI',
      title: 'Minyak Goreng Dapur',
      desc: 'Menutup lubang spirakel pernapasan serangga agar hama lemas dan gugur.',
      stat: 'PEREKAT',
      statSub: 'LEMAS TOTAL',
      col: PAL.terracotta
    },
    {
      start: C.langkah4?.start,
      tag: 'EMULSI HOMOGEN',
      title: 'Kocok Hingga Menyatu',
      desc: 'Molekul sabun mengikat air dan minyak menjadi suspensi semprot efektif.',
      stat: 'EMULSI',
      statSub: 'PUTIH KERUH',
      col: '#0284c7'
    },
    {
      start: C.langkah5?.start,
      tag: 'JADWAL SEMPROT OPTIMAL',
      title: 'Hindari Terik Matahari',
      desc: 'Mencegah efek lensa optik air yang dapat membuat daun gosong kepanasan.',
      stat: 'PAGI / SORE',
      statSub: 'WAKTU AMAN',
      col: PAL.greenSuccess
    },
    {
      start: C.kuis?.start,
      tag: 'KUIS BIOLOGI',
      title: 'Simbiosis di Kebun',
      desc: 'Ada hubungan kerja sama unik antara semut hitam dan kutu putih!',
      stat: 'KUIS',
      statSub: 'PILIH A, B, C',
      col: PAL.yellowPill
    },
    {
      start: C.jawaban?.start,
      tag: 'FAKTA HONEYDEW',
      title: 'Peternak Kutu Alami',
      desc: 'Semut melindungi kutu dari predator demi meminum cairan embun madu manis.',
      stat: 'HONEYDEW',
      statSub: 'SIMBIOSIS',
      col: PAL.greenSuccess
    }
  ];

  const currentCallout = callouts[beat] || callouts[0];
  const calloutAlpha = pop(t, currentCallout.start, 0.4);

  kebunCallout(ctx, 540, 1485, 960, 165, {
    tag: currentCallout.tag,
    title: currentCallout.title,
    desc: currentCallout.desc,
    stat: currentCallout.stat,
    statSub: currentCallout.statSub,
    col: currentCallout.col,
    a: calloutAlpha
  });
}
