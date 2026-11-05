// 83 · KEBUN & LIFEHACKS SANTAI — Demo 2: Sayuran Kulkas Awet Segar Hingga 1 Bulan
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
    zoom = 1.07; fx = 540; fy = 780; // Step 1
  } else if (beat === 2) {
    zoom = 1.10; fx = 540; fy = 760; // Trimming
  } else if (beat === 4) {
    zoom = 1.08; fx = 540; fy = 800; // Airtight container
  } else if (beat === 6) {
    zoom = 1.10; fx = 540; fy = 820; // Quiz
  }

  // 4. World Content with Camera
  withCamera(ctx, { zoom, fx, fy }, () => {

    // TOP EDUCATIONAL CARD (cx: 540, cy: 450, w: 960, h: 560)
    if (beat === 0) {
      // Beat 0: Rotten/Slimy Veggies Alert
      stepCard(ctx, 540, 450, 960, 560, {
        stepBadge: 'MASALAH KULKAS',
        badgeCol: PAL.redDanger,
        fnContent: (ctx, x, y, w, h) => {
          // Warning headline
          ctx.fillStyle = PAL.redDanger;
          ctx.font = '900 64px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('BARU 3 HARI SUDAH BUSUK?', x + w / 2, y + 155);

          ctx.fillStyle = PAL.inkMuted;
          ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
          ctx.fillText('Sayuran lembek, menguning, dan berlendir di laci kulkas', x + w / 2, y + 205);

          // Rotten leaf illustration
          ctx.save();
          ctx.translate(x + w / 2, y + 360);
          const wob = Math.sin(t * 3) * 6;
          ctx.rotate(wob * Math.PI / 180);

          // Decayed yellowish leaf
          ctx.beginPath();
          ctx.moveTo(0, 80);
          ctx.bezierCurveTo(-120, 20, -110, -90, 0, -120);
          ctx.bezierCurveTo(110, -90, 120, 20, 0, 80);
          ctx.fillStyle = '#84cc16';
          ctx.fill();

          // Mold patches
          ctx.beginPath();
          ctx.arc(-35, -20, 32, 0, Math.PI * 2);
          ctx.arc(40, 15, 36, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(120, 53, 15, 0.45)';
          ctx.fill();

          // Water drops (moisture)
          ctx.beginPath();
          ctx.arc(-10, 85, 12, 0, Math.PI * 2);
          ctx.arc(45, 65, 10, 0, Math.PI * 2);
          ctx.fillStyle = '#0284c7';
          ctx.fill();

          // Sad eyes
          ctx.beginPath();
          ctx.arc(-26, -35, 5, 0, Math.PI * 2);
          ctx.arc(26, -35, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#451a03';
          ctx.fill();

          // Sad frown
          ctx.beginPath();
          ctx.arc(0, -5, 22, Math.PI * 1.15, Math.PI * 1.85);
          ctx.lineWidth = 5;
          ctx.strokeStyle = '#451a03';
          ctx.stroke();

          ctx.restore();
        }
      });
    } else if (beat === 1) {
      // Beat 1: Don't wash before storing
      stepCard(ctx, 540, 450, 960, 560, {
        stepBadge: 'LANGKAH 1/5',
        badgeCol: PAL.terracotta,
        fnContent: (ctx, x, y, w, h) => {
          splitComparison(ctx, x + w / 2, y + h / 2 + 10, w - 80, h - 140, {
            leftTag: 'BAHAYA BASAH',
            leftTitle: '✖ Cuci Air Terlebih Dulu',
            leftItems: ['Kelembapan tinggi', 'Bakteri busuk cepat biak', 'Daun lembek dalam 3 hari'],
            rightTag: 'CARA BENAR',
            rightTitle: '✔ Simpan Kering Total',
            rightItems: ['Jangan sentuh air', 'Cuci pas mau dimasak', 'Sayur segar 30 hari utuh']
          });
        }
      });
    } else if (beat === 2) {
      // Beat 2: Trim stems & remove yellow leaves
      stepCard(ctx, 540, 450, 960, 560, {
        stepBadge: 'LANGKAH 2/5',
        badgeCol: PAL.terracotta,
        fnContent: (ctx, x, y, w, h) => {
          ctx.fillStyle = PAL.ink;
          ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Potong Pangkal Batang 1 CM', x + w / 2, y + 160);

          ctx.fillStyle = PAL.inkMuted;
          ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
          ctx.fillText('Buang daun yang layu agar bakteri pembusuk tidak menular', x + w / 2, y + 205);

          // Celery/Veggie stems
          ctx.save();
          ctx.translate(x + w / 2, y + 360);

          ctx.fillStyle = '#4ade80';
          for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.roundRect(i * 35 - 12, -90, 24, 160, 10);
            ctx.fill();
            // Leaf crest
            ctx.beginPath();
            ctx.arc(i * 35, -105, 30, 0, Math.PI * 2);
            ctx.fillStyle = '#22c55e';
            ctx.fill();
            ctx.fillStyle = '#4ade80';
          }

          // Dotted cut line
          ctx.strokeStyle = PAL.redDanger;
          ctx.lineWidth = 4;
          ctx.setLineDash([10, 8]);
          ctx.beginPath();
          ctx.moveTo(-130, 35);
          ctx.lineTo(130, 35);
          ctx.stroke();
          ctx.setLineDash([]);

          // Scissors symbol
          ctx.font = '64px sans-serif';
          ctx.fillStyle = PAL.ink;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('✂', 165, 35);

          ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
          ctx.fillStyle = PAL.redDanger;
          ctx.fillText('POTONG 1 CM PANGKAL', 0, 95);
          ctx.restore();
        }
      });
    } else if (beat === 3) {
      // Beat 3: Wrap in dry paper towel
      stepCard(ctx, 540, 450, 960, 560, {
        stepBadge: 'LANGKAH 3/5',
        badgeCol: PAL.terracotta,
        fnContent: (ctx, x, y, w, h) => {
          ctx.fillStyle = PAL.ink;
          ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Bungkus Tisu Dapur Kering', x + w / 2, y + 160);

          ctx.fillStyle = PAL.inkMuted;
          ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
          ctx.fillText('Tisu menyerap tetesan uap embun dingin dari pendingin', x + w / 2, y + 205);

          // Paper towel wrap roll
          ctx.save();
          ctx.translate(x + w / 2, y + 360);

          ctx.fillStyle = '#f8fafc';
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.roundRect(-180, -75, 360, 150, 24);
          ctx.fill();
          ctx.stroke();

          // Dots pattern on paper towel
          ctx.fillStyle = '#e2e8f0';
          for (let px = -150; px <= 150; px += 35) {
            for (let py = -50; py <= 50; py += 35) {
              ctx.beginPath();
              ctx.arc(px, py, 3.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // Green leaf crown peeking top
          ctx.fillStyle = PAL.greenSuccess;
          ctx.beginPath();
          ctx.arc(-80, -85, 34, 0, Math.PI * 2);
          ctx.arc(0, -100, 40, 0, Math.PI * 2);
          ctx.arc(80, -85, 34, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#0284c7';
          ctx.font = '800 26px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('💧 Daya Serap Embun 100%', 0, 115);
          ctx.restore();
        }
      });
    } else if (beat === 4) {
      // Beat 4: Airtight container / ziplock
      stepCard(ctx, 540, 450, 960, 560, {
        stepBadge: 'LANGKAH 4/5',
        badgeCol: PAL.terracotta,
        fnContent: (ctx, x, y, w, h) => {
          ctx.fillStyle = PAL.ink;
          ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Wadah Kedap Udara / Ziplock', x + w / 2, y + 160);

          ctx.fillStyle = PAL.inkMuted;
          ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
          ctx.fillText('Menjaga sayur tetap terhidrasi tanpa terpapar udara kering', x + w / 2, y + 205);

          // Food prep box
          ctx.save();
          ctx.translate(x + w / 2, y + 360);

          // Container base
          ctx.fillStyle = 'rgba(224, 242, 254, 0.75)';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.roundRect(-190, -65, 380, 140, 20);
          ctx.fill();
          ctx.stroke();

          // Container blue lid with clips
          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.roundRect(-205, -85, 410, 24, 8);
          ctx.fill();
          // Clips
          ctx.fillStyle = '#0369a1';
          ctx.beginPath();
          ctx.roundRect(-212, -75, 16, 34, 6);
          ctx.roundRect(196, -75, 16, 34, 6);
          ctx.fill();

          // Green veggies inside
          ctx.fillStyle = PAL.greenSuccess;
          ctx.beginPath();
          ctx.arc(-90, 5, 32, 0, Math.PI * 2);
          ctx.arc(0, -5, 38, 0, Math.PI * 2);
          ctx.arc(90, 5, 32, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#047857';
          ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🛡️ Terisolasi Rapat Dari Bau Kulkas', 0, 115);
          ctx.restore();
        }
      });
    } else if (beat === 5) {
      // Beat 5: Crisper Drawer Bottom Shelf
      stepCard(ctx, 540, 450, 960, 560, {
        stepBadge: 'LANGKAH 5/5',
        badgeCol: PAL.greenSuccess,
        fnContent: (ctx, x, y, w, h) => {
          ctx.fillStyle = PAL.ink;
          ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Simpan di Crisper Drawer (Laci Sayur)', x + w / 2, y + 160);

          ctx.fillStyle = PAL.inkMuted;
          ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
          ctx.fillText('Hindari rak paling atas dekat hembusan angin beku kulkas', x + w / 2, y + 205);

          // Fridge schematic
          ctx.save();
          ctx.translate(x + w / 2, y + 360);

          // Fridge casing
          ctx.fillStyle = '#f8fafc';
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.roundRect(-160, -110, 320, 215, 18);
          ctx.fill();
          ctx.stroke();

          // Upper shelf (too cold)
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-150, -35);
          ctx.lineTo(150, -35);
          ctx.stroke();
          ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
          ctx.fillStyle = '#64748b';
          ctx.textAlign = 'left';
          ctx.fillText('Rak Atas (Angin Beku 0-2°C)', -135, -65);

          // Middle shelf
          ctx.beginPath();
          ctx.moveTo(-150, 30);
          ctx.lineTo(150, 30);
          ctx.stroke();
          ctx.fillText('Rak Tengah (Makanan Matang)', -135, 0);

          // Bottom Crisper Drawer — HIGHLIGHTED IN GREEN
          ctx.fillStyle = 'rgba(74, 222, 128, 0.4)';
          ctx.strokeStyle = '#16a34a';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.roundRect(-150, 42, 300, 54, 12);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#15803d';
          ctx.font = '900 24px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('⭐ CRISPER DRAWER (IDEAL 4-7°C)', 0, 78);
          ctx.restore();
        }
      });
    } else if (beat === 6) {
      // Beat 6: Quiz
      interactiveQuiz(ctx, 540, 450, 960, 560, {
        title: 'Buah apa yang jika disimpan bareng sayur bikin cepat busuk?',
        options: [
          { text: 'A. Pisang (Gas Etilen Tinggi)' },
          { text: 'B. Jeruk Manis Berkulit Tebal' },
          { text: 'C. Semangka Utuh Segar' }
        ],
        selected: null,
        revealAnswer: false,
        timerProgress: clamp((t - (C.kuis?.start ?? 0)) / ((C.kuis?.duration ?? 8) * 0.85))
      });
    } else if (beat === 7) {
      // Beat 7: Answer
      interactiveQuiz(ctx, 540, 450, 960, 560, {
        title: 'Buah apa yang jika disimpan bareng sayur bikin cepat busuk?',
        options: [
          { text: 'A. Pisang (Gas Etilen Tinggi)' },
          { text: 'B. Jeruk Manis Berkulit Tebal' },
          { text: 'C. Semangka Utuh Segar' }
        ],
        selected: 0,
        revealAnswer: true,
        timerProgress: 1.0
      });
    }

    // CENTER NARRATIVE BOX (Karaoke Card)
    const karaokeData = [
      {
        lines: ['Baru 3 hari di kulkas', 'sayur sudah berlendir?'],
        highlights: ['berlendir?']
      },
      {
        lines: ['Langkah 1: jangan cuci!', 'Air basah memicu bakteri.'],
        highlights: ['jangan cuci!']
      },
      {
        lines: ['Langkah 2: potong pangkal,', 'buang daun yang layu.'],
        highlights: ['potong pangkal']
      },
      {
        lines: ['Langkah 3: bungkus tisu,', 'serap embun pendingin.'],
        highlights: ['bungkus tisu']
      },
      {
        lines: ['Langkah 4: simpan dalam', 'wadah kotak kedap udara.'],
        highlights: ['kedap udara']
      },
      {
        lines: ['Langkah 5: taruh di laci', 'crisper bawah kulkas.'],
        highlights: ['crisper bawah']
      },
      {
        lines: ['Kuis: buah apa yang', 'bikin sayur cepat busuk?'],
        highlights: ['buah apa']
      },
      {
        lines: ['Jawabannya A: Pisang!', 'Pisang melepas gas etilen.'],
        highlights: ['A: Pisang!']
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
      tag: 'TRIK FOOD PREP',
      title: 'Sayuran Awet 30 Hari',
      desc: 'Bebas sayuran terbuang sia-sia dan hemat uang belanja bulanan.',
      stat: 'AWET',
      statSub: '1 BULAN',
      col: PAL.redDanger
    },
    {
      start: C.langkah1?.start,
      tag: 'FAKTA MIKROBIOLOGI',
      title: 'Kelembapan Air Bebas',
      desc: 'Air basah memicu koloni bakteri dan spora jamur membusuk 2x lebih cepat.',
      stat: 'JANGAN CUCI',
      statSub: 'SIMPAN KERING',
      col: PAL.soilMid
    },
    {
      start: C.langkah2?.start,
      tag: 'TRIK PANGKAL SEGAR',
      title: 'Potong 1 CM Batang Bawah',
      desc: 'Membuang sel luka mati yang mulai membusuk agar tidak menular.',
      stat: 'POTONG 1 CM',
      statSub: 'PANGKAL',
      col: PAL.terracotta
    },
    {
      start: C.langkah3?.start,
      tag: 'ABSORBEN ALAMI',
      title: 'Kertas Tisu Dapur Kering',
      desc: 'Menyerap embun kondensasi kulkas agar daun tidak basah berlendir.',
      stat: 'TISU DAPUR',
      statSub: 'SERAP EMBUN',
      col: '#0284c7'
    },
    {
      start: C.langkah4?.start,
      tag: 'KEDAP UDARA',
      title: 'Wadah Tertutup Rapat',
      desc: 'Melindungi daun sayur dari dehidrasi udara kering kulkas.',
      stat: 'KEDAP',
      statSub: 'KOTAK MAKAN',
      col: PAL.greenSuccess
    },
    {
      start: C.langkah5?.start,
      tag: 'POSISI RAK IDEAL',
      title: 'Laci Crisper Bawah',
      desc: 'Menjaga kelembapan 85-90% pada suhu ideal 4 hingga 7 derajat Celcius.',
      stat: '4-7°C',
      statSub: 'CRISPER',
      col: PAL.greenSuccess
    },
    {
      start: C.kuis?.start,
      tag: 'KUIS INTERAKTIF',
      title: 'Gas Pemicu Pematangan',
      desc: 'Ada gas alami buah yang memicu sayur hijau cepat layu dan menguning.',
      stat: 'KUIS',
      statSub: 'PILIH A, B, C',
      col: PAL.yellowPill
    },
    {
      start: C.jawaban?.start,
      tag: 'FAKTA GAS ETILEN',
      title: 'Jauhkan Pisang Dari Sayur',
      desc: 'Pisang menghasilkan gas etilen tinggi yang mempercepat pembusukan sayur.',
      stat: 'GAS ETILEN',
      statSub: 'PISANG',
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
