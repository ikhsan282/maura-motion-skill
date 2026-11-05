// 63 · PERKAMEN UKIRAN — Demo 2: Pulau Run Ditukar Manhattan (Perjanjian Breda 1667).
import {
  PAL, cam, pop, pr, bg, frame, parchmentHeader,
  compassRose, ship, waves, spiceBotanical, lexiconTable, archivalCard,
} from '/styles/perkamen-ukiran/kit.js';

export const meta = { fps: 30, captions: { preset: 'serif', y: 1580 } };

let ctx;
export function setup(AM) {
  ctx = AM.layer('bg');
}

const BREDA_LEDGER = [
  { it: 'Objek Tukar I', pigafetta: 'Pulau Run (Banda)', id: 'Diserahkan ke VOC' },
  { it: 'Luas Wilayah', pigafetta: '3,3 km × 1 km', id: 'Kebun Pala Murni' },
  { it: 'Objek Tukar II', pigafetta: 'Nieuw Amsterdam', id: 'Diserahkan ke Inggris' },
  { it: 'Nama Baru (1667)', pigafetta: 'New York (Manhattan)', id: 'Pusat Finansial Dunia' },
  { it: 'Nilai Rempah', pigafetta: '3.000% Profit', id: 'Setara Emas Eropa' },
];

export function render(t, AM) {
  const cue = (id) => AM.cue(id).start;
  bg(ctx, t);

  const cPala = cue('pala'), cRun = cue('run'), cPerang = cue('perang');
  const cBreda = cue('breda'), cTukar = cue('tukar'), cManhattan = cue('manhattan');
  const cPierre = cue('pierre'), cAkhir = cue('akhir');

  cam(ctx, 540, 960, 1 + Math.sin(t * 0.35) * 0.008, 0, 960);
  frame(ctx, { t, folio: 'TRACTATUS BREDA • ANNO 1667' });

  // Phase 1: Nutmeg of Banda & Siege of Run Island (hook -> breda)
  if (t < cBreda + 0.3) {
    const a1 = 1 - pr(t, cBreda - 0.3, cBreda + 0.25);
    ctx.save();
    ctx.globalAlpha = a1;

    parchmentHeader(
      ctx,
      'PETA RAHASIA KEPULAUAN BANDA • ABAD XVII',
      'PULAU RUN vs MANHATTAN',
      'Ketika Biji Pala Maluku Lebih Berharga dari Pulau New York',
      { y: 205, a: pop(t, 0.05) }
    );

    // Left: Nutmeg & Mace Botanical Plate
    spiceBotanical(ctx, 310, 565, 0.92, {
      t,
      kind: 'nutmeg',
      label: 'MYRISTICA • PALA BANDA',
      sub: 'Biji Pala & Bunga Fuli Merah',
      a: pop(t, 0.2),
    });

    // Right: Compass Rose + Naval blockade ship
    compassRose(ctx, 760, 415, 78, { t, a: pop(t, 0.3) });
    ship(ctx, 760, 625, 0.88, {
      t,
      bob: 1,
      label: t >= cPerang ? 'BLOKADE LAUT BANDA' : 'EIC vs VOC (PULAU RUN)',
    });
    waves(ctx, 740, t, { rows: 2 });

    archivalCard(ctx, 540, 965, 860, 150, {
      tag: 'EMAS HARUM DARI TIMUR',
      titleStr: 'Pala & Fuli Hanya Tumbuh di Kepulauan Banda',
      subStr: 'Segenggam biji pala di Banda terjual hingga 30 kali lipat di Eropa',
      stat: '3.000%',
      statSub: 'MARGIN EROPA',
      a: pop(t, cPala + 0.1),
    });

    if (t >= cRun) {
      archivalCard(ctx, 540, 1160, 860, 150, {
        tag: 'TITIK TERAKHIR DI LUAR KENDALI VOC',
        titleStr: 'Pulau Run (Panjang 3 km, Lebar 1 km)',
        subStr: 'Pos dagang pertama Inggris di Nusantara yang menggagalkan monopoli penuh',
        stat: '3 × 1 km',
        statSub: 'PULAU KARANG',
        accent: PAL.verdigris,
        a: pop(t, cRun + 0.1),
      });
    }
    ctx.restore();
  }

  // Phase 2: Treaty of Breda 1667 Ledger (breda -> pierre)
  if (t >= cBreda - 0.2 && t < cPierre + 0.3) {
    const a2 = pr(t, cBreda - 0.2, cBreda + 0.25) * (1 - pr(t, cPierre - 0.25, cPierre + 0.25));
    ctx.save();
    ctx.globalAlpha = a2;

    parchmentHeader(
      ctx,
      'DOKUMEN DIPLOMASI • 31 JULI 1667',
      'PERJANJIAN BREDA 1667',
      'Barter Geopolitik Paling Terkenal dalam Sejarah Rempah',
      { y: 205, a: 1 }
    );

    const activeRow = Math.min(4, Math.floor(pr(t, cBreda, cManhattan + 1.5) * 5));

    lexiconTable(ctx, 540, 650, 860, 520, {
      t,
      a: pop(t, cBreda + 0.1),
      titleStr: 'KLAUSUL PERTUKARAN WILAYAH (BREDA, 1667)',
      rows: BREDA_LEDGER,
      activeIdx: activeRow,
    });

    archivalCard(ctx, 540, 1045, 860, 150, {
      tag: 'PERTUKARAN DUA PULAU KECIL',
      titleStr: 'Pulau Run (Maluku) ↔ Pulau Manhattan (Amerika)',
      subStr: 'Belanda memilih monopoli 100% pala; Inggris mendapat Nieuw Amsterdam',
      stat: '1667',
      statSub: 'TRAKTAT BREDA',
      a: pop(t, cTukar + 0.1),
    });

    if (t >= cManhattan) {
      archivalCard(ctx, 540, 1230, 860, 145, {
        tag: 'LAHIRNYA KOTA METROPOLITAN',
        titleStr: 'Nieuw Amsterdam Menjadi New York',
        subStr: 'Sementara VOC menguasai seluruh pohon pala di Kepulauan Banda',
        stat: '100%',
        statSub: 'MONOPOLI PALA',
        accent: PAL.verdigris,
        a: pop(t, cManhattan + 0.1),
      });
    }
    ctx.restore();
  }

  // Phase 3: Smuggled Nutmeg Seedlings & Modern Legacy (pierre -> end)
  if (t >= cPierre - 0.2) {
    const a3 = pr(t, cPierre - 0.2, cPierre + 0.25);
    ctx.save();
    ctx.globalAlpha = a3;

    parchmentHeader(
      ctx,
      'RUNTUHNYA MONOPOLI & JEJAK SEJARAH',
      'BIBIT PALA YANG MENYEBAR',
      'Dari Penyelundupan 1770 hingga Warisan Abadi Pulau Run',
      { y: 205, a: 1 }
    );

    spiceBotanical(ctx, 310, 560, 0.92, {
      t,
      kind: 'nutmeg',
      label: 'BIBIT PALA 1770',
      sub: 'Pierre Poivre (Mauritius)',
      a: pop(t, cPierre + 0.15),
    });

    ship(ctx, 755, 520, 0.92, {
      t,
      bob: 0.85,
      label: 'MISI BOTANI PRANCIS',
    });
    waves(ctx, 645, t, { rows: 2 });

    archivalCard(ctx, 540, 965, 860, 150, {
      tag: 'PENYELUNDUPAN BIBIT (1770)',
      titleStr: 'Pierre Poivre Membawa Bibit Pala Keluar Maluku',
      subStr: 'Pala ditanam di Mauritius, Zanzibar, & Grenada—monopoli VOC berakhir',
      stat: '1770',
      statSub: 'MONOPOLI PECAH',
      a: pop(t, cPierre + 0.25),
    });

    if (t >= cAkhir) {
      archivalCard(ctx, 540, 1160, 860, 155, {
        tag: 'PARADOKS SEJARAH DUNIA',
        titleStr: 'Pulau Sunyi yang Pernah Setara Manhattan',
        subStr: 'Bukti betapa sentralnya Kepulauan Maluku dalam membentuk peta modern',
        stat: 'RUN ↔ NY',
        statSub: 'SEJARAH ABADI',
        accent: PAL.verdigris,
        a: pop(t, cAkhir + 0.1),
      });
    }
    ctx.restore();
  }
}
