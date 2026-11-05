// 67 · STICKMAN PELUKIS — Demo 3: 10.000 Jam vs Deliberate Practice (Anders Ericsson)
import * as K from '/styles/stickman-pelukis/kit.js';
const { clamp, ease } = AM.lib;

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
  if (t >= C.lonjakan.start) phase = 3;
  else if (t >= C.sadar.start) phase = 2;
  else if (t >= C.riset.start) phase = 1;

  const rightTier = phase === 0 ? 1 : phase === 1 ? 2 : phase === 2 ? 2 : 3;
  const pileCount = phase === 0 ? 3 : phase === 1 ? 7 : phase === 2 ? 12 : 16;

  K.pelukisBg(ctx, t, { floorY, leftHighlight: 0.55, rightHighlight: 0.95 });

  const headers = [
    ['STAGNAN', 'NAIK LEVEL', 'MITOS 10.000 JAM LATIHAN', 'Mengapa Mengulang Hal yang Sama Tidak Membuat Ahli?'],
    ['ZONA AMAN', 'TANTANGAN', 'AUTOPILOT vs LATIHAN SADAR', 'Riset Anders Ericsson tentang Deliberate Practice'],
    ['POLA LAMA', 'TEKNIK BARU', 'SERANG TITIK TERLEMAHMU', 'Latih Perspektif, Komposisi, dan Cahaya Secara Terarah'],
    ['DATAR', 'MAESTRO!', 'KUALITAS LATIHAN > DURASI', 'Setiap Goresan Sadar Membangun Sirkuit Baru di Otak'],
  ][phase];

  K.pelukisHeader(ctx, headers[0], headers[1], headers[2], headers[3], {
    leftLabel: 'ZONA NYAMAN', rightLabel: 'LATIHAN SADAR',
  });

  K.studioStage(ctx, floorY, {
    leftTier: 1,
    leftProg: 0.6,
    leftLabel: 'POLA SAMA BERULANG',
    rightTier,
    rightProg: 0.95,
    rightLabel: phase === 3 ? 'TINGKAT MAESTRO' : 'TANTANGAN BARU',
    pileCount,
    splatter: clamp(pileCount / 16),
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
      tag: 'FENOMENA ARRESTED DEVELOPMENT',
      titleStr: '10 Tahun Melukis Hal yang Sama = 1 Tahun Diulang 10x',
      subStr: 'Banyak orang berhenti berkembang begitu mencapai level cukup bisa',
      stat: 'DATAR',
      statSub: 'PLATEAU KEAHLIAN',
      col: K.PAL.cyan,
      a: pop(t, C.hook.start + 0.2),
    });
    K.pelukisCard(ctx, 540, 1210, 960, 175, {
      tag: 'KESALAHPAHAMAN ATURAN 10.000 JAM',
      titleStr: 'Waktu Saja Tidak Cukup Tanpa Peningkatan Kesulitan',
      subStr: 'Mengulang gerakan otomatis tanpa evaluasi hanya memperkuat kebiasaan lama',
      stat: 'MITOS',
      statSub: 'DURASI SEMATA',
      col: K.PAL.gold,
      a: pop(t, C.mitos.start),
    });
  } else if (phase === 1) {
    K.pelukisCard(ctx, 540, 995, 960, 175, {
      tag: 'TEMUAN PROF. ANDERS ERICSSON (PEAK)',
      titleStr: 'Zona Nyaman Adalah Musuh Utama Pertumbuhan Skill',
      subStr: 'Saat tangan bergerak tanpa berpikir, otak berhenti membentuk koneksi baru',
      stat: '0% NAIK',
      statSub: 'MODE AUTOPILOT',
      col: K.PAL.coral,
      a: pop(t, C.riset.start),
    });
    K.pelukisCard(ctx, 540, 1210, 960, 175, {
      tag: 'JEBAKAN KOMPETENSI SEMU',
      titleStr: 'Hanya Menggambar Apa yang Sudah Dikuasai',
      subStr: 'Menghindari bagian sulit seperti tangan, bayangan, atau perspektif ruang',
      stat: 'AMAN',
      statSub: 'TAPI STAGNAN',
      col: K.PAL.cyan,
      a: pop(t, C.nyaman.start),
    });
  } else if (phase === 2) {
    K.pelukisCard(ctx, 540, 995, 960, 175, {
      tag: 'METODE DELIBERATE PRACTICE',
      titleStr: 'Latihan Terarah yang Sengaja Membidik Kelemahan',
      subStr: 'Tetapkan satu target spesifik di luar batas kemampuan saat ini pada tiap kanvas',
      stat: '+FOKUS',
      statSub: 'TARGET SPESIFIK',
      col: K.PAL.gold,
      a: pop(t, C.sadar.start),
    });
    K.pelukisCard(ctx, 540, 1210, 960, 175, {
      tag: 'SIKLUS EKSPERIMEN & KOREKSI CEPAT',
      titleStr: 'Coba Teknik Baru → Evaluasi Cacatnya → Ulangi Lebih Baik',
      subStr: 'Setiap kanvas di lantai adalah bukti satu masalah teknis yang berhasil dipecahkan',
      stat: 'ITERASI',
      statSub: 'KOREKSI AKTIF',
      col: K.PAL.emerald,
      a: pop(t, C.evaluasi.start),
    });
  } else {
    K.pelukisCard(ctx, 540, 995, 960, 175, {
      tag: 'NEUROPLASTISITAS & MIELINISASI OTAK',
      titleStr: 'Rasa Sulit Saat Belajar Adalah Tanda Otak Bertumbuh',
      subStr: '100 jam latihan sadar jauh melampaui 1.000 jam pengulangan tanpa arah',
      stat: '10x LIPAT',
      statSub: 'LEBIH EFEKTIF',
      col: K.PAL.gold,
      a: pop(t, C.lonjakan.start),
    });
    K.pelukisCard(ctx, 540, 1210, 960, 175, {
      tag: 'PRINSIP MAESTRO SEJATI',
      titleStr: 'Pastikan Setiap Kanvas Baru Membawa Tantangan Baru',
      subStr: 'Keluar sedikit dari zona nyaman setiap hari hingga keahlianmu tak tertandingi',
      stat: 'MAESTRO',
      statSub: 'LATIHAN SADAR',
      col: K.PAL.emerald,
      a: pop(t, C.mental.start),
    });
  }
}

