// 66 · STICKMAN SUBUH — Demo 3: Keheningan Sepertiga Malam (Tahajud, Gelombang Alfa & Fokus).
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
  const cSunyi = cue('sunyi'), cAlfa = cue('alfa'), cTahajud = cue('tahajud');
  const cKortisol = cue('kortisol'), cFokus = cue('fokus'), cKontras = cue('kontras');
  const cKunci = cue('kunci'), cAkhir = cue('akhir');

  const floorY = 740;
  const dawn = pr(t, cFokus, cAkhir) * 0.65;
  bg(ctx, t, { floorY, split: true, dawn });
  cam(ctx, 540, 960, 1 + Math.sin(t * 0.35) * 0.006, 0, 960);

  // Phase 1: 03:15 AM — Silent Third of the Night & Alpha-Theta Brainwaves (hook -> kortisol)
  if (t < cKortisol + 0.25) {
    const a1 = 1 - pr(t, cKortisol - 0.25, cKortisol + 0.2);
    ctx.save();
    ctx.globalAlpha = a1;

    subuhHeader(ctx, 'SEPERTIGA MALAM TERAKHIR • PUKUL 03:15', 'SAINS KEHENINGAN TAHAJUD', 'Ketika Seluruh Kota Terlelap & Pikiran Mencapai Titik Terjernih', {
      y: 175, a: pop(t, 0.05), clockTime: '03:15', clockLabel: 'TAHAJUD HENING', dayNum: 15, accent: PAL.gold,
    });

    drawRoomHalf(ctx, 'left', floorY, {
      t, label: 'BANGUN PUKUL 03:15', subLabel: 'Wudu segar • Gelombang Otak Alfa-Teta', labelCol: PAL.gold,
    });
    drawRoomHalf(ctx, 'right', floorY, {
      t, label: 'KOTA MASIH TERLELAP', subLabel: '0% Kebisingan & 0% Distraksi Notifikasi', labelCol: PAL.blue,
    });

    subuhStickman(ctx, 390, floorY, t >= cTahajud ? 'pray-sujud' : 'pray-takbir', {
      t, role: 'peci', facing: 1, ghost: true, aura: true,
    });
    subuhStickman(ctx, 885, floorY, 'sleep', {
      t, role: 'sleepy', facing: -1, ghost: false,
    });

    subuhCard(ctx, 540, 965, 920, 150, {
      tag: 'FREKUENSI GELOMBANG OTAK ALFA–TETA (8–12 Hz)',
      titleStr: 'Kondisi Transisi Paling Tenang & Fokus Mendalam',
      subStr: 'Bebas dari polusi suara dan beban interupsi pesan sepanjang malam',
      stat: '8–12 Hz',
      statSub: 'GELOMBANG ALFA',
      col: PAL.gold,
      a: pop(t, cSunyi + 0.05),
    });

    if (t >= cAlfa) {
      subuhCard(ctx, 540, 1155, 920, 150, {
        tag: 'EFEK AIR WUDU & GERAKAN TUMA’NINAH',
        titleStr: 'Mengaktifkan Saraf Parasimpatis (Rest & Reflect)',
        subStr: 'Detak jantung melambat teratur dan ketegangan otot leher/bahu meluruh',
        stat: 'TENANG',
        statSub: 'PARASIMPATIS',
        col: PAL.emerald,
        a: pop(t, cAlfa + 0.05),
      });
    }
    ctx.restore();
  }

  // Phase 2: Psychoneuroimmunology, Deep Focus & Contrast vs Rushed Morning (kortisol -> kunci)
  if (t >= cKortisol - 0.2 && t < cKunci + 0.25) {
    const a2 = pr(t, cKortisol - 0.2, cKortisol + 0.2) * (1 - pr(t, cKunci - 0.25, cKunci + 0.2));
    ctx.save();
    ctx.globalAlpha = a2;

    subuhHeader(ctx, 'PSIKONEUROIMUNOLOGI & WAKTU EMAS • 04:00', 'STABILITAS KORTISOL & FOKUS', 'Memulai Hari dengan Kendali Penuh vs Tergesa-gesa', {
      y: 175, a: 1, clockTime: '04:10', clockLabel: 'JELANG SUBUH', dayNum: 25, accent: PAL.emerald,
    });

    drawRoomHalf(ctx, 'left', floorY, {
      t, label: 'PROAKTIF & TENANG', subLabel: 'Doa, refleksi & belajar sebelum Subuh', labelCol: PAL.emerald, dawn: 0.35,
    });
    drawRoomHalf(ctx, 'right', floorY, {
      t, label: 'REAKTIF & TERBURU-BURU', subLabel: 'Bangun kesiangan dalam kondisi panik', labelCol: PAL.red, alarmRings: t >= cKontras, dawn: 0.35,
    });

    subuhStickman(ctx, 390, floorY, 'pray-ruku', {
      t, role: 'peci', facing: 1, ghost: false, aura: true,
    });
    subuhStickman(ctx, 845, floorY, t >= cKontras ? 'wake-sit' : 'sleep', {
      t, role: 'sleepy', facing: -1, ghost: true,
    });

    subuhCard(ctx, 540, 965, 920, 150, {
      tag: 'REGULASI HORMON STRES & IMUNITAS',
      titleStr: 'Menstabilkan Kadar Kortisol & Respons Imun Tubuh',
      subStr: 'Ketenangan spiritual di malam hari meredam kecemasan kronis',
      stat: 'STABIL',
      statSub: 'HORMON & IMUN',
      col: PAL.emerald,
      a: pop(t, cKortisol + 0.1),
    });

    if (t >= cFokus) {
      subuhCard(ctx, 540, 1155, 920, 150, {
        tag: 'DEEP WORK SEBELUM FAJAR',
        titleStr: '1 Jam Sebelum Subuh Setara 3 Jam Siang Hari',
        subStr: 'Memori kerja otak masih 100% utuh sebelum terpapar hiruk-pikuk dunia',
        stat: '3× LIPAT',
        statSub: 'EFISIENSI FOKUS',
        col: PAL.gold,
        a: pop(t, cFokus + 0.05),
      });
    }
    ctx.restore();
  }

  // Phase 3: Early Sleep Preparation & Inner Peace All Day (kunci -> end)
  if (t >= cKunci - 0.2) {
    const a3 = pr(t, cKunci - 0.2, cKunci + 0.25);
    ctx.save();
    ctx.globalAlpha = a3;

    subuhHeader(ctx, 'KUNCI BANGUN SEPERTIGA MALAM • 04:40', 'BUKAN BEGADANG, TAPI TIDUR AWAL', 'Menaklukkan Selimut Malam untuk Menaklukkan Dunia Siang', {
      y: 175, a: 1, clockTime: '04:40', clockLabel: 'SUBUH BERKAH', dayNum: 40, accent: PAL.gold,
    });

    drawRoomHalf(ctx, 'left', floorY, {
      t, label: 'TIDUR AWAL + NIAT KUAT', subLabel: 'Bangun segar di sepertiga malam hingga Subuh', labelCol: PAL.emerald, dawn: 0.7,
    });
    drawRoomHalf(ctx, 'right', floorY, {
      t, label: 'KETENANGAN SEPANJANG HARI', subLabel: 'Melangkah dengan hati yang teguh & jernih', labelCol: PAL.gold, dawn: 0.7,
    });

    subuhStickman(ctx, 390, floorY, 'pray-sujud', {
      t, role: 'peci', facing: 1, ghost: false, aura: true,
    });
    subuhStickman(ctx, 680, floorY, 'pray-takbir', {
      t, role: 'peci', facing: -1, ghost: true, aura: true,
    });

    subuhCard(ctx, 540, 965, 920, 150, {
      tag: 'PERSIAPAN SEJAK MALAM HARI',
      titleStr: 'Tidur Lebih Awal (21:30–22:00) + Wudu Sebelum Tidur',
      subStr: 'Tubuh mendapat 5–6 jam tidur berkualitas sebelum bangun pukul 03:15',
      stat: '5,5 JAM',
      statSub: 'TIDUR CUKUP',
      col: PAL.emerald,
      a: pop(t, cKunci + 0.1),
    });

    if (t >= cAkhir) {
      subuhCard(ctx, 540, 1155, 920, 155, {
        tag: 'KEKUATAN DARI KEHENINGAN',
        titleStr: 'Hati yang Tenang di Malam Hari Tak Mudah Goyah di Siang Hari',
        subStr: 'Jadikan sepertiga malam sebagai ruang pengisian energi jiwa dan pikiranmu',
        stat: '03:15',
        statSub: 'WAKTU EMAS',
        col: PAL.gold,
        a: pop(t, cAkhir + 0.05),
      });
    }
    ctx.restore();
  }
}
