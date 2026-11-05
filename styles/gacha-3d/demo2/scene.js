// 64 · GACHA 3D — Demo 2: Psikologi Pity System & Rate 0,6% (Dopamin & Sunk Cost).
import {
  PAL, cam, pop, pr, bg, gachaHeader,
  machine, capsule, gachaRevealCard, gachaInfoCard,
} from '/styles/gacha-3d/kit.js';

export const meta = { fps: 30, captions: { preset: 'bold', y: 1580 } };

let ctx;
export function setup(AM) {
  ctx = AM.layer('bg');
}

export function render(t, AM) {
  const cue = (id) => AM.cue(id).start;

  const cSkinner = cue('skinner'), cAnimasi = cue('animasi');
  const cRate = cue('rate'), cPity = cue('pity'), cSunk = cue('sunk');
  const cPermata = cue('permata'), cRegulasi = cue('regulasi'), cAkhir = cue('akhir');

  const glowCol = t >= cPity ? PAL.gold : t >= cRate ? PAL.purple : PAL.blue;
  bg(ctx, t, { glowCol });
  cam(ctx, 540, 960, 1 + Math.sin(t * 0.4) * 0.008, 0, 960);

  // Phase 1: Variable Ratio Reward & Anticipation Dopamine (hook -> rate)
  if (t < cRate + 0.25) {
    const a1 = 1 - pr(t, cRate - 0.25, cRate + 0.2);
    ctx.save();
    ctx.globalAlpha = a1;

    gachaHeader(
      ctx,
      'NEUROSAINS GAME MOBILE • DOPAMIN',
      'RAHASIA KAPSUL EMAS',
      'Mengapa Efek Buka Gacha Bikin Otak Ketagihan?',
      { y: 185, a: pop(t, 0.05), accent: PAL.gold, pityText: 'DOPAMINE SPIKE • +240%' }
    );

    machine(ctx, 330, 560, 0.78, { t, label: 'RNG ENGINE' });
    capsule(ctx, 760, 540, 105, t >= cAnimasi ? PAL.gold : PAL.blue, {
      open: t >= cAnimasi ? pr(t, cAnimasi, cAnimasi + 1.2) * 0.7 : 0,
      t,
      stars: t >= cAnimasi ? 5 : 3,
      label: t >= cAnimasi ? 'FAKE-OUT EMAS!' : 'DETIK ANTISIPASI',
    });

    gachaInfoCard(ctx, 540, 925, 880, 150, {
      tag: 'VARIABLE RATIO REINFORCEMENT (SKINNER BOX)',
      titleStr: 'Hadiah Acak Memicu Dopamin Paling Tinggi',
      subStr: 'Ketidakpastian membuat otak terus penasaran menekan tombol ulang',
      stat: 'ACAK',
      statSub: 'EFEK SKINNER',
      col: PAL.blue,
      a: pop(t, cSkinner + 0.05),
    });

    if (t >= cAnimasi) {
      gachaInfoCard(ctx, 540, 1115, 880, 150, {
        tag: 'PUNCAK DOPAMIN DI DETIK TUNGGU',
        titleStr: 'Bukan Saat Kartu Muncul, Tapi Saat Kapsul Bergetar',
        subStr: 'Suara gemerincing, layar bergetar & perubahan warna biru ke emas',
        stat: 'DETIK 0–3',
        statSub: 'PUNCAK DOPAMIN',
        col: PAL.gold,
        a: pop(t, cAnimasi + 0.05),
      });
    }
    ctx.restore();
  }

  // Phase 2: 0.6% Drop Rate, Soft/Hard Pity 90 & Sunk Cost Fallacy (rate -> permata)
  if (t >= cRate - 0.2 && t < cPermata + 0.25) {
    const a2 = pr(t, cRate - 0.2, cRate + 0.2) * (1 - pr(t, cPermata - 0.25, cPermata + 0.2));
    ctx.save();
    ctx.globalAlpha = a2;

    gachaHeader(
      ctx,
      'MATEMATIKA BANNER • PITY SYSTEM',
      'RATE 0,6% & JAMINAN KE-90',
      'Bagaimana Soft Pity & Sunk Cost Fallacy Bekerja',
      { y: 185, a: 1, accent: PAL.purple, pityText: 'PITY COUNTER: 74 / 90' }
    );

    gachaRevealCard(ctx, 540, 540, 880, 380, {
      t,
      a: pop(t, cRate + 0.1),
      rarity: 'TABEL PROBABILITAS BANNER STANDAR',
      stars: 5,
      col: PAL.purple,
      name: 'ALGORITMA PITY 90',
      sub: 'Kombinasi Peluang Kecil + Jaminan Bertahap',
      kind: 'tarsius',
      stats: [
        { label: 'BASE DROP RATE SSR (PUTARAN 1–73)', val: '0,6%', pct: 0.10, col: PAL.blue },
        { label: 'SOFT PITY LONJAKAN (PUTARAN 74–89)', val: '~32,4%', pct: 0.62, col: PAL.purple },
        { label: 'HARD PITY GUARANTEED (PUTARAN KE-90)', val: '100%', pct: 1.0, col: PAL.gold },
      ],
    });

    gachaInfoCard(ctx, 540, 895, 880, 150, {
      tag: 'JARING PENGAMAN PSIKOLOGIS',
      titleStr: 'Pity System Mencegah Pemain Berhenti Total',
      subStr: 'Memberi kepastian semu bahwa setiap kegagalan mendekatkan ke hadiah',
      stat: '90 PULL',
      statSub: 'HARD PITY SSR',
      col: PAL.purple,
      a: pop(t, cPity + 0.05),
    });

    if (t >= cSunk) {
      gachaInfoCard(ctx, 540, 1085, 880, 150, {
        tag: 'JEBAKAN BIAYA TERTANAM (SUNK COST FALLACY)',
        titleStr: '"Sudah 75 Pull, Sayang Kalau Berhenti Sekarang!"',
        subStr: 'Rasa takut kehilangan progres mendorong pemain melakukan top-up',
        stat: '75 / 90',
        statSub: 'EFEK TANGGUNG',
        col: PAL.gold,
        a: pop(t, cSunk + 0.05),
      });
    }
    ctx.restore();
  }

  // Phase 3: Currency Abstraction, Transparency Laws & Mindful Gaming (permata -> end)
  if (t >= cPermata - 0.2) {
    const a3 = pr(t, cPermata - 0.2, cPermata + 0.25);
    ctx.save();
    ctx.globalAlpha = a3;

    gachaHeader(
      ctx,
      'LITERASI DIGITAL & KENDALI DIRI',
      'KENALI TRIKNYA, JAGA DOMPETMU',
      'Abstraksi Mata Uang Berlian & Regulasi Transparansi',
      { y: 185, a: 1, accent: PAL.gold, pityText: 'SMART PLAYER • 100% CONTROL' }
    );

    gachaRevealCard(ctx, 540, 540, 880, 380, {
      t,
      a: pop(t, cPermata + 0.1),
      rarity: 'SSR • MINDFUL GAMER SHIELD',
      stars: 5,
      col: PAL.gold,
      name: '3 PERISAI ANTI-BONCOS',
      sub: 'Strategi Cerdas Menghadapi Monetisasi Game',
      kind: 'keris',
      stats: [
        { label: 'SADARI KONVERSI RUPIAH KE KRISTAL', val: '100% NYATA', pct: 1.0, col: PAL.gold },
        { label: 'CEK TABEL PERSENTASE RESMI', val: 'WAJIB BACA', pct: 0.92, col: PAL.green },
        { label: 'BATAS ANGGARAN HIBURAN BULANAN', val: 'DISIPLIN', pct: 0.96, col: PAL.blue },
      ],
    });

    gachaInfoCard(ctx, 540, 895, 880, 150, {
      tag: 'ILUSI MATA UANG BERLAPIS',
      titleStr: 'Rupiah → Kristal → Tiket Summon → Kapsul',
      subStr: 'Menyamarkan nilai uang asli agar transaksi terasa seperti poin biasa',
      stat: '3 LAPIS',
      statSub: 'ABSTRAKSI UANG',
      col: PAL.gold,
      a: pop(t, cPermata + 0.2),
    });

    if (t >= cRegulasi) {
      gachaInfoCard(ctx, 540, 1085, 880, 155, {
        tag: t >= cAkhir ? 'KENDALI PENUH DI TANGANMU' : 'REGULASI TRANSPARANSI GLOBAL',
        titleStr: t >= cAkhir
          ? 'Nikmati Gamenya Tanpa Terjebak Ilusi Keberuntungan'
          : 'Kewajiban Menampilkan Tabel Peluang Gacha',
        subStr: t >= cAkhir
          ? 'Pahami matematikanya agar hiburan tetap menyenangkan dan sehat'
          : 'Aturan konsumen menuntut persentase drop rate dibuka secara jujur',
        stat: t >= cAkhir ? 'BIJAK' : '0,600%',
        statSub: t >= cAkhir ? 'MAIN SEHAT' : 'WAJIB TRANSPARAN',
        col: t >= cAkhir ? PAL.green : PAL.blue,
        a: pop(t, cRegulasi + 0.05),
      });
    }
    ctx.restore();
  }
}
