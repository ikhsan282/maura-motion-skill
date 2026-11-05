// 66 · STICKMAN SUBUH — Demo 1: Alarm yang Sama, Subuh yang Sama (Hari 1 → Hari 20 → Hari 40).
import {
  PAL, cam, pop, pr, lerp, bg,
  subuhHeader, drawRoomHalf, subuhStickman, subuhCard,
} from '/styles/stickman-subuh/kit.js';

export const meta = { fps: 30, captions: { preset: 'clean', y: 1580, size: 48 } };

let ctx;
export function setup(AM) {
  ctx = AM.layer('bg');
}

export function render(t, AM) {
  const cue = (id) => AM.cue(id).start;
  const cH1 = cue('hari1'), cSnooze = cue('snooze');
  const cH20 = cue('hari20'), cRingan = cue('ringan');
  const cH40 = cue('hari40'), cSujud = cue('sujud'), cMenular = cue('menular'), cAkhir = cue('akhir');

  const floorY = 740;
  const dawn = pr(t, cH20, cAkhir) * 0.7;
  bg(ctx, t, { floorY, split: true, dawn });
  cam(ctx, 540, 960, 1 + Math.sin(t * 0.35) * 0.006, 0, 960);

  // Phase 1: Day 1–7 Struggle vs Snooze (hook -> hari20)
  if (t < cH20 + 0.25) {
    const a1 = 1 - pr(t, cH20 - 0.25, cH20 + 0.2);
    ctx.save();
    ctx.globalAlpha = a1;

    const dayNum = Math.round(lerp(1, 7, pr(t, cH1, cH20)));
    subuhHeader(ctx, 'FASE ADAPTASI AWAL • HARI 1–7', 'ALARM YANG SAMA, DUA PILIHAN', 'Melawan Inersia Tidur di Minggu Pertama', {
      y: 175, a: pop(t, 0.05), clockTime: '04:45', clockLabel: 'ALARM BERBUNYI', dayNum, accent: PAL.gold,
    });

    drawRoomHalf(ctx, 'left', floorY, {
      t, label: 'KAMAR KIRI: BANGKIT', subLabel: 'Memaksa kaki turun dari kasur', labelCol: PAL.emerald, alarmRings: true,
    });
    drawRoomHalf(ctx, 'right', floorY, {
      t, label: 'KAMAR KANAN: SNOOZE 3×', subLabel: 'Menarik selimut & menunda alarm', labelCol: PAL.red, alarmRings: true,
    });

    subuhStickman(ctx, t >= cSnooze ? 265 : 195, floorY, t >= cSnooze ? 'walk' : 'wake-sit', {
      t, role: 'peci', facing: 1, ghost: true,
    });
    subuhStickman(ctx, 885, floorY, 'sleep', {
      t, role: 'sleepy', facing: -1, ghost: false,
    });

    subuhCard(ctx, 540, 965, 920, 150, {
      tag: 'INERSIA TIDUR (SLEEP INERTIA)',
      titleStr: '7 Hari Pertama Adalah Fase Terberat bagi Otak',
      subStr: 'Tubuh masih terbiasa dengan jadwal lama sehingga alarm terasa menyiksa',
      stat: 'HARI 1–7',
      statSub: 'FASE BERAT',
      col: PAL.gold,
      a: pop(t, cH1 + 0.1),
    });

    if (t >= cSnooze) {
      subuhCard(ctx, 540, 1155, 920, 150, {
        tag: 'KEPUTUSAN 5 DETIK PERTAMA',
        titleStr: 'Menekan Tombol Tunda Justru Memecah Siklus Tidur',
        subStr: 'Kamar kiri memilih langsung duduk & mengambil air wudu agar saraf segar',
        stat: 'WUDU',
        statSub: 'PUTUS KANTUK',
        col: PAL.emerald,
        a: pop(t, cSnooze + 0.1),
      });
    }
    ctx.restore();
  }

  // Phase 2: Day 20 Circadian Shift & Habit Loop (hari20 -> hari40)
  if (t >= cH20 - 0.2 && t < cH40 + 0.25) {
    const a2 = pr(t, cH20 - 0.2, cH20 + 0.2) * (1 - pr(t, cH40 - 0.25, cH40 + 0.2));
    ctx.save();
    ctx.globalAlpha = a2;

    const dayNum = Math.round(lerp(8, 39, pr(t, cH20, cH40)));
    subuhHeader(ctx, 'PEMBENTUKAN JALUR SARAF • HARI 8–39', 'JAM BIOLOGIS MULAI BERGESER', 'Otak Menyiapkan Hormon Bangun Lebih Awal', {
      y: 175, a: 1, clockTime: '04:42', clockLabel: 'SUBUH TENANG', dayNum, accent: PAL.emerald,
    });

    drawRoomHalf(ctx, 'left', floorY, {
      t, label: 'KAMAR KIRI: KONSISTEN', subLabel: 'Langsung menuju sajadah tanpa beban', labelCol: PAL.emerald, alarmRings: false, dawn: 0.3,
    });
    drawRoomHalf(ctx, 'right', floorY, {
      t, label: 'KAMAR KANAN: MULAI TERGUGAH', subLabel: 'Duduk di tepi kasur melihat jam', labelCol: PAL.gold, alarmRings: true, dawn: 0.3,
    });

    subuhStickman(ctx, 390, floorY, t >= cRingan ? 'pray-ruku' : 'pray-takbir', {
      t, role: 'peci', facing: 1, ghost: true, aura: true,
    });
    subuhStickman(ctx, 840, floorY, 'wake-sit', {
      t, role: 'sleepy', facing: -1, ghost: true,
    });

    subuhCard(ctx, 540, 965, 920, 150, {
      tag: 'ADAPTASI HIPOTALAMUS (SCN)',
      titleStr: 'Cortisol Awakening Response Maju Secara Alami',
      subStr: 'Suhu tubuh dan tekanan darah naik perlahan menjelang pukul 04:30 pagi',
      stat: 'HARI 20',
      statSub: 'RITME BARU',
      col: PAL.emerald,
      a: pop(t, cH20 + 0.1),
    });

    if (t >= cRingan) {
      subuhCard(ctx, 540, 1155, 920, 150, {
        tag: 'OTOMATISASI BASAL GANGLIA',
        titleStr: 'Tidak Lagi Butuh Perdebatan Batin Saat Bangun',
        subStr: 'Kebiasaan yang diulang setiap subuh menghemat energi kemauan (willpower)',
        stat: 'OTOMATIS',
        statSub: 'JALUR SARAF',
        col: PAL.gold,
        a: pop(t, cRingan + 0.1),
      });
    }
    ctx.restore();
  }

  // Phase 3: Day 40 Before the Alarm & Mutual Transformation (hari40 -> end)
  if (t >= cH40 - 0.2) {
    const a3 = pr(t, cH40 - 0.2, cH40 + 0.25);
    ctx.save();
    ctx.globalAlpha = a3;

    subuhHeader(ctx, 'PUNCAK DISIPLIN • HARI KE-40', 'BANGUN SEBELUM ALARM BERBUNYI', 'Ketika Disiplin Berubah Menjadi Kebutuhan Jiwa', {
      y: 175, a: 1, clockTime: '04:38', clockLabel: 'SEBELUM ALARM', dayNum: 40, accent: PAL.gold,
    });

    drawRoomHalf(ctx, 'left', floorY, {
      t, label: 'SEBELUM ALARM BERBUNYI', subLabel: 'Tenang bersujud dalam keheningan fajar', labelCol: PAL.emerald, alarmRings: false, dawn: 0.75,
    });
    drawRoomHalf(ctx, 'right', floorY, {
      t, label: t >= cMenular ? 'IKUT BANGKIT & SHALAT' : 'TERBANGUN TEPAT WAKTU',
      subLabel: t >= cMenular ? 'Keteladanan diam-diam menular ke sekitar' : 'Meninggalkan kebiasaan begadang',
      labelCol: PAL.gold, alarmRings: false, dawn: 0.75,
    });

    subuhStickman(ctx, 390, floorY, 'pray-sujud', {
      t, role: 'peci', facing: 1, ghost: false, aura: true,
    });
    subuhStickman(ctx, t >= cMenular ? 680 : 760, floorY, t >= cMenular ? 'pray-takbir' : 'walk', {
      t, role: 'peci', facing: -1, ghost: true, aura: t >= cMenular,
    });

    subuhCard(ctx, 540, 965, 920, 150, {
      tag: 'FISIOLOGI SUJUD & KETENANGAN',
      titleStr: 'Aliran Oksigen Optimal ke Korteks Prefrontal',
      subStr: 'Menurunkan hormon stres dan membuka pagi dengan pikiran paling jernih',
      stat: 'HARI 40',
      statSub: 'TANPA ALARM',
      col: PAL.emerald,
      a: pop(t, cSujud + 0.05),
    });

    if (t >= cMenular) {
      subuhCard(ctx, 540, 1155, 920, 155, {
        tag: t >= cAkhir ? 'PRINSIP HIDUP FAJAR' : 'EFEK KETELADANAN',
        titleStr: t >= cAkhir
          ? 'Kamu Menjaga Subuh, Subuh Menjaga Seluruh Harimu'
          : 'Satu Orang yang Berubah Menginspirasi Satu Ruangan',
        subStr: t >= cAkhir
          ? 'Kemenangan pertama di atas kasur menentukan kemenangan sepanjang hari'
          : 'Disiplin yang konsisten berbicara lebih keras daripada seribu nasihat',
        stat: t >= cAkhir ? '04:38' : '2 INSAN',
        statSub: t >= cAkhir ? 'FAJAR BERKAH' : 'BANGKIT BERSAMA',
        col: PAL.gold,
        a: pop(t, cMenular + 0.05),
      });
    }
    ctx.restore();
  }
}
