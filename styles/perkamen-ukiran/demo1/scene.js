// 63 · PERKAMEN UKIRAN — Demo 1: Kamus Melayu Pertama Ditulis Pelaut Italia (Tidore 1521).
import {
  PAL, cam, pop, pr, bg, frame, parchmentHeader,
  compassRose, ship, waves, feather, spiceBotanical, lexiconTable, archivalCard,
} from '/styles/perkamen-ukiran/kit.js';

export const meta = { fps: 30, captions: { preset: 'serif', y: 1580 } };

let ctx;
export function setup(AM) {
  ctx = AM.layer('bg');
}

const LEXICON_ROWS = [
  { it: 'Occhio (Mata)', pigafetta: 'Matta', id: 'Mata' },
  { it: 'Denti (Gigi)', pigafetta: 'Gigi', id: 'Gigi' },
  { it: 'Pietra (Batu)', pigafetta: 'Batu', id: 'Batu' },
  { it: 'Riso (Beras)', pigafetta: 'Bras', id: 'Beras' },
  { it: 'Acqua (Air)', pigafetta: 'Tubir / Air', id: 'Air' },
];

export function render(t, AM) {
  const cue = (id) => AM.cue(id).start;
  bg(ctx, t);

  const cArmada = cue('armada'), cTidore = cue('tidore');
  const cPena = cue('pena'), cKata = cue('kata'), cJumlah = cue('jumlah');
  const cVictoria = cue('victoria'), cAkhir = cue('akhir');

  cam(ctx, 540, 960, 1 + Math.sin(t * 0.35) * 0.008, 0, 960);
  frame(ctx, { t, folio: 'MANUSKRIP PIGAFETTA • ANNO 1521' });

  // Phase 1: Voyage from Spain & Magellan's Fleet (hook -> tidore)
  if (t < cPena + 0.3) {
    const a1 = 1 - pr(t, cPena - 0.3, cPena + 0.25);
    ctx.save();
    ctx.globalAlpha = a1;

    parchmentHeader(
      ctx,
      'JURNAL EKSPEDISI MAGELLAN • 1519–1521',
      'ANTONIO PIGAFETTA',
      'Juru Tulis Vicenza & Pencatat Bahasa Nusantara',
      { y: 205, a: pop(t, 0.05) }
    );

    compassRose(ctx, 885, 425, 92, { t, a: pop(t, 0.25) });

    // Main Caravel ship sailing across engraved sea waves
    ship(ctx, 430 + Math.sin(t * 0.7) * 28, 635, 1.25, {
      t,
      bob: 1,
      label: t >= cTidore ? 'BERLABUH DI TIDORE (NOV 1521)' : 'NAO TRINIDAD & VICTORIA',
    });
    waves(ctx, 745, t, { rows: 4 });

    archivalCard(ctx, 540, 1020, 860, 145, {
      tag: 'PELAYARAN LINTAS SAMUDRA',
      titleStr: 'Sevilla (1519) → Pasifik → Maluku (1521)',
      subStr: 'Berangkat 5 kapal (270 awak), melewati badai & Selat Magellan',
      stat: '5 → 2',
      statSub: 'KAPAL TERSISA',
      a: pop(t, cue('pigafetta') + 0.1),
    });

    if (t >= cArmada) {
      archivalCard(ctx, 540, 1210, 860, 145, {
        tag: t >= cTidore ? 'PULAU REMPAH MALUKU' : 'TRAGEDI DI FILIPINA',
        titleStr: t >= cTidore ? 'Tidore: Pusat Cengkih Dunia' : 'Gugurnya Ferdinand Magellan',
        subStr: t >= cTidore
          ? 'Dua kapal berlabuh membeli cengkih langsung dari Sultan Tidore'
          : 'Tewas di Mactan (April 1521); ekspedisi dilanjutkan ke selatan',
        stat: t >= cTidore ? '1521' : 'MACTAN',
        statSub: t >= cTidore ? 'NOVEMBER' : 'APRIL 1521',
        accent: t >= cTidore ? PAL.verdigris : PAL.red,
        a: pop(t, cArmada + 0.1),
      });
    }
    ctx.restore();
  }

  // Phase 2: Writing the Malay Vocabulary in Tidore (pena -> victoria)
  if (t >= cPena - 0.2 && t < cVictoria + 0.3) {
    const a2 = pr(t, cPena - 0.2, cPena + 0.25) * (1 - pr(t, cVictoria - 0.25, cVictoria + 0.25));
    ctx.save();
    ctx.globalAlpha = a2;

    parchmentHeader(
      ctx,
      'LEKSIKON NUSANTARA TERTUA • 1521',
      'KAMUS ITALIA – MELAYU',
      'Dicatat langsung dari penutur lokal di Brunei & Tidore',
      { y: 205, a: 1 }
    );

    const activeRow = t < cKata
      ? 0
      : Math.min(4, Math.floor(pr(t, cKata, cJumlah + 1.5) * 5));

    lexiconTable(ctx, 540, 650, 860, 520, {
      t,
      a: pop(t, cPena + 0.1),
      titleStr: 'VOCABOLARIO DE QUESTI POPULI MORI (1521)',
      rows: LEXICON_ROWS,
      activeIdx: activeRow,
    });

    archivalCard(ctx, 540, 1045, 860, 150, {
      tag: 'METODE LAPANGAN PIGAFETTA',
      titleStr: 'Menunjuk Benda & Mencatat Bunyi',
      subStr: 'Saat awak kapal menimbang cengkih, Pigafetta menguji kosakata harian',
      stat: '426',
      statSub: 'KATA TERCATAT',
      a: pop(t, cPena + 0.35),
    });

    if (t >= cJumlah) {
      archivalCard(ctx, 540, 1230, 860, 145, {
        tag: 'BUKTI LINGUA FRANCA NUSANTARA',
        titleStr: 'Bahasa Perdagangan Antar-Pulau',
        subStr: 'Kata yang dicatat di Brunei dipahami dengan fasih di Tidore',
        stat: '100%',
        statSub: 'MASIH DIPAKAI',
        accent: PAL.verdigris,
        a: pop(t, cJumlah + 0.1),
      });
    }
    ctx.restore();
  }

  // Phase 3: Return of Nao Victoria & Eternal Legacy (victoria -> end)
  if (t >= cVictoria - 0.2) {
    const a3 = pr(t, cVictoria - 0.2, cVictoria + 0.25);
    ctx.save();
    ctx.globalAlpha = a3;

    parchmentHeader(
      ctx,
      'WARISAN ABADI PELAYARAN KELILING DUNIA',
      'NAO VICTORIA & 426 KATA',
      'Satu kapal kembali ke Eropa, membawa bukti bahasa kita',
      { y: 205, a: 1 }
    );

    // Left: Clove botanical specimen, Right: Nao Victoria & Quill
    spiceBotanical(ctx, 310, 560, 0.92, {
      t,
      kind: 'clove',
      label: 'CENGKIH TIDORE',
      sub: 'Syzygium aromaticum',
      a: pop(t, cVictoria + 0.15),
    });

    // Right panel: Victoria survivor card + ship vignette
    ship(ctx, 755, 520, 0.92, {
      t,
      bob: 0.8,
      label: 'NAO VICTORIA (1522)',
    });
    waves(ctx, 645, t, { rows: 2 });

    archivalCard(ctx, 540, 965, 860, 150, {
      tag: 'KEPULANGAN KE SPANYOL (SEPTEMBER 1522)',
      titleStr: '18 Penyintas dari 270 Awak Awal',
      subStr: 'Pigafetta selamat sambil mendekap buku harian perkamennya',
      stat: '18 / 270',
      statSub: 'AWAK SELAMAT',
      a: pop(t, cVictoria + 0.25),
    });

    if (t >= cAkhir) {
      archivalCard(ctx, 540, 1160, 860, 155, {
        tag: 'WARISAN LIMA ABAD KEMUDIAN',
        titleStr: 'Rempah Habis, Kata-Kata Abadi',
        subStr: 'Bukti tertulis bahwa Bahasa Melayu adalah bahasa global sejak 1521',
        stat: '500+',
        statSub: 'TAHUN ABADI',
        accent: PAL.verdigris,
        a: pop(t, cAkhir + 0.1),
      });
    }
    ctx.restore();
  }
}
