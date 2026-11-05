// 83 · KEBUN & LIFEHACKS SANTAI — Demo 3: Hemat Listrik AC Hingga 40%
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
    zoom = 1.10; fx = 540; fy = 760; // Dry mode
  } else if (beat === 3) {
    zoom = 1.10; fx = 540; fy = 760; // Clean filter
  } else if (beat === 6) {
    zoom = 1.10; fx = 540; fy = 820; // Quiz
  }

  // 4. World Content with Camera
  withCamera(ctx, { zoom, fx, fy }, () => {

    // TOP EDUCATIONAL CARD (cx: 540, cy: 450, w: 960, h: 560)
    if (beat === 0) {
      // Beat 0: Shocking Electricity Bill
      stepCard(ctx, 540, 450, 960, 560, {
        stepBadge: 'TAGIHAN LISTRIK BULANAN',
        badgeCol: PAL.redDanger,
        fnContent: (ctx, x, y, w, h) => {
          // Warning headline
          ctx.fillStyle = PAL.redDanger;
          ctx.font = '900 68px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('TAGIHAN AC MELEDAK?', x + w / 2, y + 160);

          ctx.fillStyle = PAL.inkMuted;
          ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
          ctx.fillText('AC nyala seharian tapi ruangan tetap gerah dan boros kwh', x + w / 2, y + 210);

          // Electric Meter & Spark Illustration
          ctx.save();
          ctx.translate(x + w / 2, y + 360);

          // Meter base
          ctx.fillStyle = '#f8fafc';
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(0, 0, 90, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Spinning gauge needle
          const needleAngle = (t * 8) % (Math.PI * 1.5) - Math.PI * 0.75;
          ctx.save();
          ctx.rotate(needleAngle);
          ctx.strokeStyle = '#dc2626';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, -70);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.fillStyle = '#dc2626';
          ctx.fill();
          ctx.restore();

          // Yellow lightning bolt
          ctx.fillStyle = PAL.yellowPill;
          ctx.strokeStyle = '#ca8a04';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(100, -60);
          ctx.lineTo(130, -10);
          ctx.lineTo(110, -5);
          ctx.lineTo(140, 45);
          ctx.lineTo(110, 0);
          ctx.lineTo(125, -5);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = PAL.redDanger;
          ctx.font = '900 26px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('⚡ KOMPRESOR BEKERJA KERAS 100%', 0, 125);
          ctx.restore();
        }
      });
    } else if (beat === 1) {
      // Beat 1: Don't set 16 degrees
      stepCard(ctx, 540, 450, 960, 560, {
        stepBadge: 'LANGKAH 1/5',
        badgeCol: PAL.terracotta,
        fnContent: (ctx, x, y, w, h) => {
          splitComparison(ctx, x + w / 2, y + h / 2 + 10, w - 80, h - 140, {
            leftTag: 'JEBAKAN BOROS',
            leftTitle: '✖ Setel 16°C Ekstrem',
            leftItems: ['Kompresor overwork nonstop', 'Ruangan tidak lebih cepat dingin', 'Tagihan listrik melonjak +40%'],
            rightTag: 'SUHU IDEAL',
            rightTitle: '✔ Setel 24°C - 25°C',
            rightItems: ['Suhu sejuk nyaman tropis', 'Kompresor istirahat otomatis', 'Hemat ratusan ribu per bulan']
          });
        }
      });
    } else if (beat === 2) {
      // Beat 2: Use Dry Mode during humid days
      stepCard(ctx, 540, 450, 960, 560, {
        stepBadge: 'LANGKAH 2/5',
        badgeCol: PAL.terracotta,
        fnContent: (ctx, x, y, w, h) => {
          ctx.fillStyle = PAL.ink;
          ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Aktifkan Mode DRY Saat Lembap', x + w / 2, y + 160);

          ctx.fillStyle = PAL.inkMuted;
          ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
          ctx.fillText('Menghisap kelembapan udara tanpa memaksa kompresor mendinginkan suhu', x + w / 2, y + 205);

          // Remote Mode Icon
          ctx.save();
          ctx.translate(x + w / 2, y + 360);

          // Water droplet with cross or shield
          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.moveTo(0, -90);
          ctx.bezierCurveTo(-70, -20, -70, 60, 0, 80);
          ctx.bezierCurveTo(70, 60, 70, -20, 0, -90);
          ctx.fill();

          // Droplet highlight
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.beginPath();
          ctx.ellipse(-25, -10, 15, 35, 0.4, 0, Math.PI * 2);
          ctx.fill();

          // Symbol inside droplet
          ctx.fillStyle = '#ffffff';
          ctx.font = '900 32px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('DRY', 0, 25);

          ctx.fillStyle = '#0284c7';
          ctx.font = '800 26px "Plus Jakarta Sans", sans-serif';
          ctx.fillText('💧 Efektif Turunkan Rasa Gerah Lengket', 0, 120);
          ctx.restore();
        }
      });
    } else if (beat === 3) {
      // Beat 3: Clean Filter Every 2 Weeks
      stepCard(ctx, 540, 450, 960, 560, {
        stepBadge: 'LANGKAH 3/5',
        badgeCol: PAL.terracotta,
        fnContent: (ctx, x, y, w, h) => {
          ctx.fillStyle = PAL.ink;
          ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Cuci Saringan Filter 2 Minggu Sekali', x + w / 2, y + 160);

          ctx.fillStyle = PAL.inkMuted;
          ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
          ctx.fillText('Debu tebal menghalangi sirkulasi udara dan menyedot listrik ekstra', x + w / 2, y + 205);

          // AC Unit & Filter Mesh
          ctx.save();
          ctx.translate(x + w / 2, y + 360);

          // AC Indoor Body
          ctx.fillStyle = '#f8fafc';
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.roundRect(-190, -75, 380, 120, 14);
          ctx.fill();
          ctx.stroke();

          // Bottom vent with cold air waves
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          for (let i = -140; i <= 140; i += 70) {
            ctx.beginPath();
            ctx.moveTo(i, 45);
            ctx.lineTo(i - 20, 85 + Math.sin(t * 5 + i) * 8);
            ctx.stroke();
          }

          // Sparkling clean badge
          ctx.fillStyle = '#16a34a';
          ctx.beginPath();
          ctx.arc(140, -45, 36, 0, Math.PI * 2);
          ctx.fill();
          ctx.font = '900 28px sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('✨', 140, -45);

          ctx.fillStyle = '#15803d';
          ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
          ctx.fillText('Angin 2x Lebih Deras & Kompresor Ringan', 0, 125);
          ctx.restore();
        }
      });
    } else if (beat === 4) {
      // Beat 4: Low speed fan synergy
      stepCard(ctx, 540, 450, 960, 560, {
        stepBadge: 'LANGKAH 4/5',
        badgeCol: PAL.terracotta,
        fnContent: (ctx, x, y, w, h) => {
          ctx.fillStyle = PAL.ink;
          ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Nyalakan Kipas Angin Low Speed', x + w / 2, y + 160);

          ctx.fillStyle = PAL.inkMuted;
          ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
          ctx.fillText('Kipas membantu meratakan dingin ke seluruh sudut kamar', x + w / 2, y + 205);

          // Fan blades spinning
          ctx.save();
          ctx.translate(x + w / 2, y + 360);

          // Center motor
          ctx.fillStyle = '#64748b';
          ctx.beginPath();
          ctx.arc(0, 0, 24, 0, Math.PI * 2);
          ctx.fill();

          // Blades
          const fanAngle = t * 10;
          ctx.save();
          ctx.rotate(fanAngle);
          ctx.fillStyle = '#38bdf8';
          for (let b = 0; b < 3; b++) {
            ctx.rotate((Math.PI * 2) / 3);
            ctx.beginPath();
            ctx.ellipse(0, -60, 20, 50, 0, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();

          // Stand
          ctx.fillStyle = '#94a3b8';
          ctx.beginPath();
          ctx.rect(-6, 24, 12, 60);
          ctx.roundRect(-40, 84, 80, 12, 6);
          ctx.fill();

          ctx.fillStyle = '#0284c7';
          ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🌀 Udara Sejuk Merata 2x Lebih Cepat', 0, 125);
          ctx.restore();
        }
      });
    } else if (beat === 5) {
      // Beat 5: Close doors and thick curtains
      stepCard(ctx, 540, 450, 960, 560, {
        stepBadge: 'LANGKAH 5/5',
        badgeCol: PAL.greenSuccess,
        fnContent: (ctx, x, y, w, h) => {
          ctx.fillStyle = PAL.ink;
          ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Tutup Rapat & Pasang Gorden Tebal', x + w / 2, y + 160);

          ctx.fillStyle = PAL.inkMuted;
          ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
          ctx.fillText('Cegah radiasi panas matahari masuk ke dalam kamar tidur', x + w / 2, y + 205);

          // Window & Curtain Illustration
          ctx.save();
          ctx.translate(x + w / 2, y + 360);

          // Window Frame
          ctx.fillStyle = '#e2e8f0';
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.roundRect(-140, -85, 280, 170, 10);
          ctx.fill();
          ctx.stroke();

          // Window panes
          ctx.fillStyle = '#bae6fd';
          ctx.fillRect(-130, -75, 120, 150);
          ctx.fillRect(10, -75, 120, 150);

          // Drapery curtains
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.moveTo(-135, -85);
          ctx.lineTo(-65, -85);
          ctx.lineTo(-90, 85);
          ctx.lineTo(-135, 85);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(135, -85);
          ctx.lineTo(65, -85);
          ctx.lineTo(90, 85);
          ctx.lineTo(135, 85);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#15803d';
          ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🛡️ Suhu Ruangan Terkunci Dingin Stabil', 0, 125);
          ctx.restore();
        }
      });
    } else if (beat === 6) {
      // Beat 6: Quiz
      interactiveQuiz(ctx, 540, 450, 960, 560, {
        title: 'Apa yang menyedot watt listrik AC paling besar?',
        options: [
          { text: 'A. Tarikan Awal Kompresor (Mati-Nyala)' },
          { text: 'B. Suhu Konstan 25°C Seharian' },
          { text: 'C. Putaran Kipas Indoor Fan Level 2' }
        ],
        selected: null,
        revealAnswer: false,
        timerProgress: clamp((t - (C.kuis?.start ?? 0)) / ((C.kuis?.duration ?? 8) * 0.85))
      });
    } else if (beat === 7) {
      // Beat 7: Answer
      interactiveQuiz(ctx, 540, 450, 960, 560, {
        title: 'Apa yang menyedot watt listrik AC paling besar?',
        options: [
          { text: 'A. Tarikan Awal Kompresor (Mati-Nyala)' },
          { text: 'B. Suhu Konstan 25°C Seharian' },
          { text: 'C. Putaran Kipas Indoor Fan Level 2' }
        ],
        selected: 0,
        revealAnswer: true,
        timerProgress: 1.0
      });
    }

    // CENTER NARRATIVE BOX (Karaoke Card)
    const karaokeData = [
      {
        lines: ['Tagihan AC meledak', 'bikin dompet menjerit?'],
        highlights: ['meledak']
      },
      {
        lines: ['Langkah 1: jangan 16°C,', 'setel langsung 24-25°C.'],
        highlights: ['24-25°C']
      },
      {
        lines: ['Langkah 2: aktifkan DRY', 'saat cuaca lembap gerah.'],
        highlights: ['mode DRY']
      },
      {
        lines: ['Langkah 3: cuci filter', 'dua minggu sekali!'],
        highlights: ['cuci filter']
      },
      {
        lines: ['Langkah 4: bantu kipas', 'angin kecepatan rendah.'],
        highlights: ['kipas angin']
      },
      {
        lines: ['Langkah 5: tutup rapat', 'kamar & gorden tebal.'],
        highlights: ['gorden tebal']
      },
      {
        lines: ['Kuis: apa penyedot', 'watt AC paling boros?'],
        highlights: ['paling boros?']
      },
      {
        lines: ['Jawabannya A: tarikan awal', 'kompresor mati-nyala!'],
        highlights: ['A: tarikan awal']
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
      tag: 'TIPS HEMAT ENERGI',
      title: 'Hemat Listrik AC 40%',
      desc: 'Pangkas tagihan listrik bulanan tanpa harus tidur kegerahan.',
      stat: 'HEMAT',
      statSub: 'HINGGA 40%',
      col: PAL.redDanger
    },
    {
      start: C.langkah1?.start,
      tag: 'TERMODINAMIKA AC',
      title: 'Setel Suhu 24°C - 25°C',
      desc: 'Suhu 16°C tidak mempercepat dingin, hanya memaksa kompresor kerja 100%.',
      stat: '24°C - 25°C',
      statSub: 'SUHU IDEAL',
      col: PAL.soilMid
    },
    {
      start: C.langkah2?.start,
      tag: 'DEHUMIDIFIKASI',
      title: 'Fitur Mode Kering (Dry)',
      desc: 'Menurunkan kelembapan 60% tanpa menguras kompresor watt tinggi.',
      stat: 'MODE DRY',
      statSub: 'HEMAT DAYA',
      col: '#0284c7'
    },
    {
      start: C.langkah3?.start,
      tag: 'PERAWATAN RUTIN',
      title: 'Bersihkan Filter Jaring',
      desc: 'Filter bersih meningkatkan efisiensi pendinginan ruangan 15-20%.',
      stat: '2 MINGGU',
      statSub: 'CUCI FILTER',
      col: PAL.terracotta
    },
    {
      start: C.langkah4?.start,
      tag: 'SIRKULASI UDARA',
      title: 'Sinergi Kipas Angin Low',
      desc: 'Mendorong udara dingin menyebar rata ke tempat tidur seketika.',
      stat: 'KIPAS LOW',
      statSub: 'SINERGI SEJUK',
      col: '#0284c7'
    },
    {
      start: C.langkah5?.start,
      tag: 'ISOLASI TERMAL',
      title: 'Blok Panas Eksterior',
      desc: 'Tirai gorden blackout memblokir radiasi sinar UV hingga 80%.',
      stat: 'GORDEN',
      statSub: 'ISOLASI',
      col: PAL.greenSuccess
    },
    {
      start: C.kuis?.start,
      tag: 'KUIS INTERAKTIF',
      title: 'Watt Tarikan Awal',
      desc: 'Tiap kompresor menyala ulang dari nol, tarikan arusnya melonjak tajam.',
      stat: 'KUIS',
      statSub: 'PILIH A, B, C',
      col: PAL.yellowPill
    },
    {
      start: C.jawaban?.start,
      tag: 'FAKTA ELEKTRIK',
      title: 'Hindari Sering Mati-Nyala',
      desc: 'Tarikan awal kompresor menyedot hingga 2-3 kali lipat watt normal!',
      stat: 'INRUSH WATT',
      statSub: 'KOMPRESOR',
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

