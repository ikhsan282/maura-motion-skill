// 67 · STICKMAN PELUKIS — Demo 2: Kutukan Kanvas Putih & Draf Buruk Pertama
import * as K from '/styles/stickman-pelukis/kit.js';
const { clamp, ease, prog } = AM.lib;

export const meta = { fps: 30, width: 1080, height: 1920, captions: { preset: 'clean', y: 1620, size: 48 } };

let ctx;
const C = {};
const pop = (t, a, d = 0.4) => ease.outBack(clamp((t - a) / d), 1.8);

export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
}

export function render(t) {
  ctx.clearRect(0, 0, 1080, 1920);
  const floorY = 760;

  let phase = 0;
  if (t >= C.lapisan.start) phase = 3;
  else if (t >= C.rahasia.start) phase = 2;
  else if (t >= C.takut.start) phase = 1;

  const rightTier = phase === 0 ? 1 : phase === 1 ? 1 : phase === 2 ? 2 : 3;
  const pileCount = phase === 0 ? 2 : phase === 1 ? 4 : phase === 2 ? 8 : 14;

  K.pelukisBg(ctx, t, { floorY, leftHighlight: 0.5, rightHighlight: 0.95 });

  const headers = [
    ['0%', 'DRAF 1', 'KUTUKAN KANVAS PUTIH', 'Mengapa Memulai Goresan Pertama Terasa Paling Berat?'],
    ['HAPUS', 'SKETSA', ' EKSPEKTASI vs REALITAS', 'Ide di Kepala Sempurna, Goresan Pertama Terasa Kaku'],
    ['KOSONG', 'LAPIS 2', 'PRINSIP DRAF BURUK PERTAMA', 'Segera Kotori Kanvas agar Rasa Takut Langsung Hilang'],
    ['DIAM', 'SELESAI!', 'KEKUATAN LAPISAN & REVISI', 'Kamu Tidak Bisa Mengedit Kanvas yang Masih Kosong!'],
  ][phase];

  K.pelukisHeader(ctx, headers[0], headers[1], headers[2], headers[3], {
    leftLabel: 'TAKUT SALAH', rightLabel: 'BERANI SKETSA',
  });

  K.studioStage(ctx, floorY, {
    leftTier: 0,
    leftProg: phase === 1 ? 0.05 : 0.18,
    leftLabel: 'KANVAS PUTIH KOSONG',
    rightTier,
    rightProg: 0.95,
    rightLabel: phase === 3 ? 'MAHAKARYA BERLAPIS' : 'SKETSA KASAR DULU',
    pileCount,
    splatter: clamp(pileCount / 14),
    t,
  });

  K.pelukisStickman(ctx, 285, floorY, 'paint-careful', {
    role: 'perfectionist', facing: -1, t,
  });

  K.pelukisStickman(ctx, 785, floorY, phase === 3 ? 'hold-proud' : 'paint-fast', {
    role: 'prolific', facing: 1, t, holdTier: 3,
  });

  if (phase === 0) {
    K.pelukisCard(ctx, 540, 995, 960, 175, {
      tag: 'PSIKOLOGI BLANK CANVAS PARALYSIS',
      titleStr: 'Kanvas Bersih Memicu Ketakutan Merusak Kesempurnaan',
      subStr: 'Selama belum disentuh, karya di imajinasi kita masih terasa tanpa cela',
      stat: 'BEKU',
      statSub: 'TAKUT MULAI',
      col: K.PAL.cyan,
      a: pop(t, C.hook.start + 0.2),
    });
    K.pelukisCard(ctx, 540, 1210, 960, 175, {
      tag: 'KESENJANGAN IMAJINASI & TANGAN',
      titleStr: 'Selera Visual Kita Sering Melampaui Kemampuan Awal',
      subStr: 'Wajar jika goresan pertama belum seindah bayangan di dalam pikiran',
      stat: 'GAP',
      statSub: 'IDE vs REALITA',
      col: K.PAL.gold,
      a: pop(t, C.ideal.start),
    });
  } else if (phase === 1) {
    K.pelukisCard(ctx, 540, 995, 960, 175, {
      tag: 'SIKLUS MENGHAPUS TANPA HENTI',
      titleStr: 'Menuntut Goresan Pertama Langsung Sempurna = Macet',
      subStr: 'Baru menarik satu garis langsung dihapus karena merasa kurang rapi',
      stat: '0 KARYA',
      statSub: 'HABIS WAKTU',
      col: K.PAL.coral,
      a: pop(t, C.takut.start),
    });
    K.pelukisCard(ctx, 540, 1210, 960, 175, {
      tag: 'KELELAHAN MENTAL PERFEKSIONIS',
      titleStr: 'Berjam-jam Menatap Kanvas Tanpa Satu Pun Progres',
      subStr: 'Energi habis dipakai mengkritik diri sendiri sebelum karya terbentuk',
      stat: 'LELAH',
      statSub: 'OVERTHINKING',
      col: K.PAL.cyan,
      a: pop(t, C.hapus.start),
    });
  } else if (phase === 2) {
    K.pelukisCard(ctx, 540, 995, 960, 175, {
      tag: 'TRIK PARA PELUKIS PROFESIONAL',
      titleStr: 'Beri Izin Membuat Sketsa Pertama yang Berantakan',
      subStr: 'Sapukan warna dasar cepat-cepat untuk memecahkan ketegangan kanvas putih',
      stat: 'DRAF #1',
      statSub: 'BOLEH KASAR',
      col: K.PAL.gold,
      a: pop(t, C.rahasia.start),
    });
    K.pelukisCard(ctx, 540, 1210, 960, 175, {
      tag: 'CARA KERJA OTAK KREATIF',
      titleStr: 'Jauh Lebih Mudah Memperbaiki Sketsa daripada Melamun',
      subStr: 'Begitu bentuk dasar terlihat di kanvas, otak langsung tahu apa yang harus dipoles',
      stat: 'REVISI',
      statSub: 'LEBIH MUDAH',
      col: K.PAL.emerald,
      a: pop(t, C.revisi.start),
    });
  } else {
    K.pelukisCard(ctx, 540, 995, 960, 175, {
      tag: 'TEKNIK UNDERPAINTING & GLAZING',
      titleStr: 'Setiap Mahakarya Adalah Tumpukan Lapisan yang Dipoles',
      subStr: 'Di balik lukisan senja yang memukau, ada sketsa kasar yang tertutupi cat baru',
      stat: '4 LAPIS',
      statSub: 'PROSES BERTAHAP',
      col: K.PAL.gold,
      a: pop(t, C.lapisan.start),
    });
    K.pelukisCard(ctx, 540, 1210, 960, 175, {
      tag: 'HUKUM EMAS KREATOR',
      titleStr: 'Kamu Tidak Bisa Memoles Kanvas yang Belum Disentuh',
      subStr: 'Tarik garis pertamamu sekarang, lalu perbaiki sambil berjalan',
      stat: 'GORES!',
      statSub: 'SEKARANG JUGA',
      col: K.PAL.emerald,
      a: pop(t, C.aturan.start),
    });
  }
}

