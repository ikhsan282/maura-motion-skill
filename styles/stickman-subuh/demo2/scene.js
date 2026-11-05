// 66 · STICKMAN SUBUH — Demo 2: Begadang Scroll HP vs Tidur Tepat Waktu (Sistem Glimfatik & Melatonin).
import {
  PAL, cam, pop, pr, bg,
  subuhHeader, drawRoomHalf, subuhStickman, subuhCard,
} from '/styles/stickman-subuh/kit.js';

export const meta = { fps: 30, captions: { preset: 'clean', y: 1580, size: 48 } };

let ctx;
export function setup(AM) {
  ctx = AM.layer('bg');
}

export function render(t, AM) {
  const cue = (id) => AM.cue(id).start;
  const cMela = cue('melatonin'), cGlim = cue('glimfatik'), cSampah = cue('sampah');
  const cSubuh = cue('subuh'), cKabut = cue('kabut'), cHutang = cue('hutang');
  const cAturan = cue('aturan'), cAkhir = cue('akhir');

  const floorY = 740;
  const dawn = pr(t, cSubuh, cAkhir) * 0.7;
  bg(ctx, t, { floorY, split: true, dawn });
  cam(ctx, 540, 960, 1 + Math.sin(t * 0.35) * 0.006, 0, 960);

  // Phase 1: Midnight 00:30 — Deep Sleep vs Blue-Light Scrolling (hook -> subuh)
  if (t < cSubuh + 0.25) {
    const a1 = 1 - pr(t, cSubuh - 0.25, cSubuh + 0.2);
    ctx.save();
    ctx.globalAlpha = a1;

    subuhHeader(ctx, 'NEUROSAINS TIDUR MALAM • PUKUL 00:30', 'TIDUR CUKUP vs BEGADANG HP', 'Apa yang Terjadi pada Otak Saat Tengah Malam?', {
      y: 175, a: pop(t, 0.05), clockTime: '00:30', clockLabel: 'TENGAH MALAM', dayNum: 1, accent: PAL.blue,
    });

    drawRoomHalf(ctx, 'left', floorY, {
      t, label: 'TIDUR PUKUL 22:00', subLabel: 'Gelap total • Melatonin & Glimfatik aktif', labelCol: PAL.emerald,
    });
    drawRoomHalf(ctx, 'right', floorY, {
      t, label: 'MASIH SCROLL HP (00:30)', subLabel: 'Cahaya biru menekan hormon kantuk', labelCol: PAL.blue, phoneGlow: true,
    });

    subuhStickman(ctx, 185, floorY, 'sleep', {
      t, role: 'peci', facing: 1, ghost: false,
    });
    subuhStickman(ctx, 885, floorY, 'phone-bed', {
      t, role: 'sleepy', facing: -1, ghost: false,
    });

    subuhCard(ctx, 540, 965, 920, 150, {
      tag: 'EFEK CAHAYA BIRU (460 nm) PADA PINEAL',
      titleStr: 'Layar HP Menahan Pelepasan Hormon Melatonin',
      subStr: 'Otak mengira matahari masih bersinar sehingga fase tidur dalam tertunda',
      stat: '-55%',
      statSub: 'MELATONIN DROP',
      col: PAL.blue,
      a: pop(t, cMela + 0.05),
    });

    if (t >= cGlim) {
      subuhCard(ctx, 540, 1155, 920, 150, {
        tag: 'SISTEM GLIMFATIK OTAK (23:00–03:00)',
        titleStr: 'Pencucian Plak Beta-Amiloid Hanya Aktif Saat Tidur Dalam',
        subStr: t >= cSampah
          ? 'Saat begadang, limbah metabolisme menumpuk dan memicu kabut otak esok hari'
          : 'Cairan serebrospinal mengalir 60% lebih deras saat kita terlelap pulas',
        stat: t >= cSampah ? 'NUMPUK' : '60% CLEAR',
        statSub: t >= cSampah ? 'TOKSIN SARAF' : 'CUCI OTAK ALAMI',
        col: t >= cSampah ? PAL.red : PAL.emerald,
        a: pop(t, cGlim + 0.05),
      });
    }
    ctx.restore();
  }

  // Phase 2: 04:40 Fajr — Fresh Prayer vs Brain Fog Slump (subuh -> aturan)
  if (t >= cSubuh - 0.2 && t < cAturan + 0.25) {
    const a2 = pr(t, cSubuh - 0.2, cSubuh + 0.2) * (1 - pr(t, cAturan - 0.25, cAturan + 0.2));
    ctx.save();
    ctx.globalAlpha = a2;

    subuhHeader(ctx, 'KONTRAS WAKTU SUBUH • PUKUL 04:42', 'SEGAR BUGAR vs KABUT OTAK', 'Dampak Langsung Kualitas Tidur pada Ibadah & Fokus Pagi', {
      y: 175, a: 1, clockTime: '04:42', clockLabel: 'WAKTU SUBUH', dayNum: 2, accent: PAL.gold,
    });

    drawRoomHalf(ctx, 'left', floorY, {
      t, label: 'BANGUN SEGAR (6,5 JAM TIDUR)', subLabel: 'Khusyuk di atas sajadah dengan fokus penuh', labelCol: PAL.emerald, dawn: 0.4,
    });
    drawRoomHalf(ctx, 'right', floorY, {
      t, label: 'KELELAHAN BERAT (2 JAM TIDUR)', subLabel: 'Kepala pusing, emosi labil & kesiangan', labelCol: PAL.red, alarmRings: true, dawn: 0.4,
    });

    subuhStickman(ctx, 390, floorY, 'pray-sujud', {
      t, role: 'peci', facing: 1, ghost: false, aura: true,
    });
    subuhStickman(ctx, 885, floorY, 'wake-sit', {
      t, role: 'sleepy', facing: -1, ghost: true,
    });

    subuhCard(ctx, 540, 965, 920, 150, {
      tag: 'DAMPAK KOGNITIF KURANG TIDUR',
      titleStr: 'Reaksi Lambat, Emosi Mudah Meledak & Brain Fog',
      subStr: 'Amigdala menjadi 60% lebih reaktif saat tubuh kekurangan tidur malam',
      stat: '+60%',
      statSub: 'REAKTIF EMOSI',
      col: PAL.red,
      a: pop(t, cKabut + 0.05),
    });

    if (t >= cHutang) {
      subuhCard(ctx, 540, 1155, 920, 150, {
        tag: 'MITOS TIDUR BALAS DENDAM SIANG HARI',
        titleStr: 'Tidur Siang Tak Bisa Mengganti Deep Sleep Malam',
        subStr: 'Siklus hormon pertumbuhan dan pemulihan memori terikat pada jam sirkadian malam',
        stat: 'DEEP SLEEP',
        statSub: 'TAK TERGANTI',
        col: PAL.gold,
        a: pop(t, cHutang + 0.05),
      });
    }
    ctx.restore();
  }

  // Phase 3: Digital Curfew Rule & Winning Fajr the Night Before (aturan -> end)
  if (t >= cAturan - 0.2) {
    const a3 = pr(t, cAturan - 0.2, cAturan + 0.25);
    ctx.save();
    ctx.globalAlpha = a3;

    subuhHeader(ctx, 'SOLUSI PRAKTIS • JAM MALAM DIGITAL', 'SUBUH DIMULAI SEJAK PUKUL 21:30', 'Simpan Ponsel di Luar Jangkauan Kasur 60 Menit Sebelum Tidur', {
      y: 175, a: 1, clockTime: '04:40', clockLabel: 'FAJAR OPTIMAL', dayNum: 30, accent: PAL.emerald,
    });

    drawRoomHalf(ctx, 'left', floorY, {
      t, label: 'BEBAS LAYAR PUKUL 21:30', subLabel: 'Tidur lelap & bangun Subuh penuh energi', labelCol: PAL.emerald, dawn: 0.75,
    });
    drawRoomHalf(ctx, 'right', floorY, {
      t, label: 'IKUT DISIPLIN TIDUR AWAL', subLabel: 'HP diletakkan jauh dari tempat tidur', labelCol: PAL.gold, dawn: 0.75,
    });

    subuhStickman(ctx, 390, floorY, 'pray-takbir', {
      t, role: 'peci', facing: 1, ghost: true, aura: true,
    });
    subuhStickman(ctx, 680, floorY, 'pray-sujud', {
      t, role: 'peci', facing: -1, ghost: false, aura: true,
    });

    subuhCard(ctx, 540, 965, 920, 150, {
      tag: 'ATURAN 60 MENIT TANPA LAYAR',
      titleStr: 'Jauhkan Charger HP dari Samping Bantalmu',
      subStr: 'Memutus godaan scroll otomatis dan menaikkan kualitas tidur dalam hingga 2× lipat',
      stat: '-60 MNT',
      statSub: 'STOP LAYAR HP',
      col: PAL.emerald,
      a: pop(t, cAturan + 0.1),
    });

    if (t >= cAkhir) {
      subuhCard(ctx, 540, 1155, 920, 155, {
        tag: 'KUNCI PAGI YANG PRODUKTIF',
        titleStr: 'Pagi yang Hebat Dimulai dari Malam yang Disiplin',
        subStr: 'Tutup layar lebih awal malam ini agar Subuh esok terasa ringan dan bermakna',
        stat: '22:00 → 04:30',
        statSub: 'RITME JUARA',
        col: PAL.gold,
        a: pop(t, cAkhir + 0.05),
      });
    }
    ctx.restore();
  }
}
