// 67 · STICKMAN PELUKIS — Demo 1: Eksperimen Keramik & Kanvas (Kuantitas Melahirkan Kualitas)
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
  if (t >= C.hasil.start) phase = 3;
  else if (t >= C.tumpuk.start) phase = 2;
  else if (t >= C.kiri.start) phase = 1;

  const rightCount = phase === 0 ? 1 : phase === 1 ? 4 : phase === 2 ? 12 : 16;
  const rightTier = phase === 0 ? 1 : phase === 1 ? 1 : phase === 2 ? 2 : 3;
  const leftTier = phase >= 3 ? 1 : 0;

  K.pelukisBg(ctx, t, { floorY, leftHighlight: 0.55, rightHighlight: 0.95 });

  const headers = [
    ['#1', '#1', 'SATU KANVAS vs 16 KANVAS', 'Eksperimen Kelas Seni dalam Buku Art & Fear'],
    ['#1', '#4', 'KUALITAS vs KUANTITAS', 'Kiri: 1 Karya Sempurna • Kanan: Jumlah Terbanyak'],
    ['#1', '#12', 'BELAJAR DARI SETIAP GORESAN', 'Tumpukan Kanvas Menjadi Guru Terbaik bagi Tangan'],
    ['#1', '#16', 'MAHAKARYA LAHIR DARI KUANTITAS', 'Karya Terbaik Justru Muncul di Kanvas Ke-16!'],
  ][phase];

  K.pelukisHeader(ctx, headers[0], headers[1], headers[2], headers[3]);

  K.studioStage(ctx, floorY, {
    leftTier,
    leftProg: clamp(0.2 + prog(t, 0, C.moral.end) * 0.6),
    leftLabel: 'SI PERFEKSIONIS (#1)',
    rightTier,
    rightProg: 0.95,
    rightLabel: `SI MAESTRO BERBARET (#${rightCount})`,
    pileCount: rightCount - 1,
    splatter: clamp(rightCount / 16),
    t,
  });

  // Left Stickman: Si Perfeksionis Loupe (hesitant, monocle, bow-tie)
  K.pelukisStickman(ctx, 285, floorY, phase >= 3 ? 'inspect' : 'paint-careful', {
    role: 'perfectionist', facing: -1, t,
  });

  // Right Stickman: Si Maestro Berbaret (beret, scarf, palette, energetic brush or holding masterpiece)
  K.pelukisStickman(ctx, 785, floorY, phase === 3 ? 'hold-proud' : 'paint-fast', {
    role: 'prolific', facing: 1, t, holdTier: 3,
  });

  // Lower Section Cards (2 per phase)
  if (phase === 0) {
    K.pelukisCard(ctx, 540, 995, 960, 175, {
      tag: 'PARADOKS KREATIVITAS • ART & FEAR (BAYLES & ORLAND)',
      titleStr: 'Takut Gagal Membuat Kita Berhenti Sebelum Berkarya',
      subStr: 'Perfeksionisme sering menyamar sebagai standar tinggi padahal rasa takut',
      stat: '1 vs 16',
      statSub: 'DUA PENDEKATAN',
      col: K.PAL.gold,
      a: pop(t, C.hook.start + 0.2),
    });
    K.pelukisCard(ctx, 540, 1210, 960, 175, {
      tag: 'DESAIN EKSPERIMEN KELAS SENI',
      titleStr: 'Kelompok Kiri: 1 Karya • Kelompok Kanan: Volume Karya',
      subStr: 'Menguji apakah perenungan panjang lebih unggul daripada praktik berulang',
      stat: '2 MINGGU',
      statSub: 'WAKTU SAMA',
      col: K.PAL.cyan,
      a: pop(t, C.studi.start),
    });
  } else if (phase === 1) {
    K.pelukisCard(ctx, 540, 995, 960, 175, {
      tag: 'JEBAKAN KELOMPOK KUALITAS (KIRI)',
      titleStr: 'Terlalu Banyak Mengukur, Terlalu Sedikit Menggores',
      subStr: 'Setiap sapuan kuas terasa berisiko tinggi karena hanya punya satu kanvas',
      stat: 'RAGU',
      statSub: 'LUMPUH ANALISIS',
      col: K.PAL.cyan,
      a: pop(t, C.kiri.start),
    });
    K.pelukisCard(ctx, 540, 1210, 960, 175, {
      tag: 'KEBEBASAN KELOMPOK KUANTITAS (KANAN)',
      titleStr: 'Bebas Bereksperimen Tanpa Beban Harus Langsung Bagus',
      subStr: 'Ketika targetnya jumlah, tangan bergerak luwes dan cepat menyelesaikan draf',
      stat: ' AKSI',
      statSub: 'TANPA BEBAN',
      col: K.PAL.gold,
      a: pop(t, C.kanan.start),
    });
  } else if (phase === 2) {
    K.pelukisCard(ctx, 540, 995, 960, 175, {
      tag: 'UMPAN BALIK VISUAL LANGSUNG (ITERASI)',
      titleStr: 'Kanvas #1 Miring → Kanvas #5 Rapi → Kanvas #12 Hidup',
      subStr: 'Kesalahan di kanvas sebelumnya langsung dikoreksi pada kanvas berikutnya',
      stat: '12 KARYA',
      statSub: ' KURVA BELAJAR',
      col: K.PAL.emerald,
      a: pop(t, C.tumpuk.start),
    });
    K.pelukisCard(ctx, 540, 1210, 960, 175, {
      tag: 'MEMORI OTOT & INTUISI WARNA',
      titleStr: 'Tangan Belajar Jauh Lebih Cepat Lewat Praktik Nyata',
      subStr: 'Komposisi dan pencampuran cat terasah otomatis lewat pengulangan aktif',
      stat: '+300%',
      statSub: 'JAM TERBANG',
      col: K.PAL.gold,
      a: pop(t, C.evaluasi.start),
    });
  } else {
    K.pelukisCard(ctx, 540, 995, 960, 175, {
      tag: 'HASIL AKHIR PENILAIAN STUDIO',
      titleStr: 'Seluruh Mahakarya Terbaik Lahir dari Kelompok Kuantitas',
      subStr: 'Kanvas ke-16 melampaui ekspektasi karena dibangun di atas 15 latihan nyata',
      stat: 'JUARA!',
      statSub: 'KANVAS KE-16',
      col: K.PAL.gold,
      a: pop(t, C.hasil.start),
    });
    K.pelukisCard(ctx, 540, 1210, 960, 175, {
      tag: 'PRINSIP KREATOR & PRODUKTIVITAS',
      titleStr: 'Kuantitas Adalah Jalan Paling Pasti Menuju Kualitas',
      subStr: 'Mulai dulu, selesaikan banyak karya, dan biarkan kualitas tumbuh alami',
      stat: 'MULAI!',
      statSub: 'JANGAN TUNDA',
      col: K.PAL.emerald,
      a: pop(t, C.mengapa.start),
    });
  }
}
