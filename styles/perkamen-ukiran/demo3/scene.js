// 63 · PERKAMEN UKIRAN — Demo 3: Herbarium Amboinense (Rumphius di Ambon, 1654–1702).
import {
  PAL, cam, pop, pr, bg, frame, parchmentHeader,
  compassRose, ship, waves, spiceBotanical, lexiconTable, archivalCard,
} from '/styles/perkamen-ukiran/kit.js';

export const meta = { fps: 30, captions: { preset: 'serif', y: 1580 } };

let ctx;
export function setup(AM) {
  ctx = AM.layer('bg');
}

const HERBARIUM_VOLUMES = [
  { it: 'Caryophyllus', pigafetta: 'Pohon Cengkih', id: 'Obat & Rempah Utama' },
  { it: 'Myristica', pigafetta: 'Pohon Pala Banda', id: 'Minyak Atsiri & Fuli' },
  { it: 'Arbor Melaleuca', pigafetta: 'Kayu Putih Ambon', id: 'Minyak Hangat Maluku' },
  { it: 'Sagu / Metroxylon', pigafetta: 'Pohon Sagu Rumbia', id: 'Pangan Pokok Kepulauan' },
  { it: 'Anggrek Maluku', pigafetta: 'Flos Susannae', id: 'Dedikasi untuk Istrinya' },
];

export function render(t, AM) {
  const cue = (id) => AM.cue(id).start;
  bg(ctx, t);

  const cRumphius = cue('rumphius'), cButa = cue('buta'), cRaba = cue('raba');
  const cBencana = cue('bencana'), cUlang = cue('ulang'), cTenggelam = cue('tenggelam');
  const cTerbit = cue('terbit'), cAkhir = cue('akhir');

  cam(ctx, 540, 960, 1 + Math.sin(t * 0.35) * 0.008, 0, 960);
  frame(ctx, { t, folio: 'HERBARIUM AMBOINENSE • AMBON 1690' });

  // Phase 1: Rumphius in Ambon & Tactile Botany After Blindness (hook -> bencana)
  if (t < cBencana + 0.3) {
    const a1 = 1 - pr(t, cBencana - 0.3, cBencana + 0.25);
    ctx.save();
    ctx.globalAlpha = a1;

    parchmentHeader(
      ctx,
      'PLINIUS HINDIA TIMUR • AMBON (1654–1702)',
      'GEORG E. RUMPHIUS',
      'Ilmuwan Tunanetra Pencatat 1.200 Tumbuhan Maluku',
      { y: 205, a: pop(t, 0.05) }
    );

    spiceBotanical(ctx, 310, 565, 0.92, {
      t,
      kind: 'clove',
      label: 'FLORA AMBOINENSIS',
      sub: 'Rabaan Daun & Aroma Getah',
      a: pop(t, 0.2),
    });

    spiceBotanical(ctx, 765, 565, 0.92, {
      t,
      kind: 'nutmeg',
      label: 'ETNOBOTANI MALUKU',
      sub: 'Nama Lokal, Latin & Khasiat Obat',
      a: pop(t, 0.35),
    });

    archivalCard(ctx, 540, 965, 860, 150, {
      tag: 'TRAGEDI GLAUKOMA TAHUN 1670',
      titleStr: 'Buta Total pada Usia 42 Tahun di Ambon',
      subStr: 'Kehilangan penglihatan saat naskah botani baru separuh selesai',
      stat: '1670',
      statSub: 'BUTA TOTAL',
      a: pop(t, cButa + 0.1),
    });

    if (t >= cRaba) {
      archivalCard(ctx, 540, 1160, 860, 150, {
        tag: 'METODE INDRA PERABA & PENCIUMAN',
        titleStr: 'Mengenali Spesies dari Tekstur Daun & Bau Kulit Kayu',
        subStr: 'Mendiktekan ciri morfologi tanaman secara presisi kepada juru tulis',
        stat: '3 INDRA',
        statSub: 'RABA • CIUM • KECAP',
        accent: PAL.verdigris,
        a: pop(t, cRaba + 0.1),
      });
    }
    ctx.restore();
  }

  // Phase 2: Earthquake, Great Fire of 1687 & Dictating from Memory (bencana -> terbit)
  if (t >= cBencana - 0.2 && t < cTerbit + 0.3) {
    const a2 = pr(t, cBencana - 0.2, cBencana + 0.25) * (1 - pr(t, cTerbit - 0.25, cTerbit + 0.25));
    ctx.save();
    ctx.globalAlpha = a2;

    parchmentHeader(
      ctx,
      'KETANGGUHAN MELAWAN TIGA BENCANA BESAR',
      'DIKTE ULANG DARI INGATAN',
      'Gempa 1674, Kebakaran 1687, dan Kapal Tenggelam 1692',
      { y: 205, a: 1 }
    );

    const activeRow = Math.min(4, Math.floor(pr(t, cBencana, cTenggelam + 1.5) * 5));

    lexiconTable(ctx, 540, 650, 860, 520, {
      t,
      a: pop(t, cBencana + 0.1),
      titleStr: 'KATALOG SPESIES HERBARIUM AMBOINENSE',
      rows: HERBARIUM_VOLUMES,
      activeIdx: activeRow,
    });

    archivalCard(ctx, 540, 1045, 860, 150, {
      tag: 'KEBAKARAN AMBON (1687)',
      titleStr: 'Perpustakaan & Ratusan Lukisan Botani Hangus',
      subStr: 'Rumphius mendiktekan ulang naskah bersama putranya, Paulus Augustus',
      stat: '1687',
      statSub: 'DITULIS ULANG',
      a: pop(t, cUlang + 0.1),
    });

    if (t >= cTenggelam) {
      archivalCard(ctx, 540, 1230, 860, 145, {
        tag: 'PENYELAMATAN NASKAH DI BATAVIA (1692)',
        titleStr: 'Kapal Waterlandt Tenggelam, Salinan Cadangan Selamat',
        subStr: 'Gubernur Jenderal Camphuys menyalin ulang seluruh jilid sebelum dikirim',
        stat: '2× SALIN',
        statSub: 'ARSIP SELAMAT',
        accent: PAL.verdigris,
        a: pop(t, cTenggelam + 0.1),
      });
    }
    ctx.restore();
  }

  // Phase 3: 6 Volumes of Herbarium Amboinense Published (terbit -> end)
  if (t >= cTerbit - 0.2) {
    const a3 = pr(t, cTerbit - 0.2, cTerbit + 0.25);
    ctx.save();
    ctx.globalAlpha = a3;

    parchmentHeader(
      ctx,
      'MAHAKARYA ENAM JILid • DITERBITKAN 1741–1750',
      'HERBARIUM AMBOINENSE',
      'Fondasi Taksonomi Tumbuhan Tropis Nusantara Modern',
      { y: 205, a: 1 }
    );

    spiceBotanical(ctx, 310, 560, 0.92, {
      t,
      kind: 'clove',
      label: '1.200 SPESIES MALUKU',
      sub: '6 Jilid Folio Ukiran Tembaga',
      a: pop(t, cTerbit + 0.15),
    });

    compassRose(ctx, 755, 430, 82, { t, a: pop(t, cTerbit + 0.25) });
    ship(ctx, 755, 635, 0.88, {
      t,
      bob: 0.8,
      label: 'AMBON → AMSTERDAM',
    });
    waves(ctx, 745, t, { rows: 2 });

    archivalCard(ctx, 540, 965, 860, 150, {
      tag: 'ENSIKLOPEDIA BOTANI NUSANTARA',
      titleStr: '1.200 Spesies Lengkap dengan Resep Pengobatan Lokal',
      subStr: 'Menjadi rujukan utama Carl Linnaeus saat menyusun taksonomi dunia',
      stat: '1.200',
      statSub: 'SPESIES FLORA',
      a: pop(t, cTerbit + 0.25),
    });

    if (t >= cAkhir) {
      archivalCard(ctx, 540, 1160, 860, 155, {
        tag: 'DEDIKASI ILMU PENGETAHUAN',
        titleStr: 'Cahaya Ilmu dari Ilmuwan Tunanetra di Ambon',
        subStr: 'Bukti bahwa keterbatasan fisik tak mampu memadamkan ketekunan ilmiah',
        stat: '6 JILID',
        statSub: 'WARISAN DUNIA',
        accent: PAL.verdigris,
        a: pop(t, cAkhir + 0.1),
      });
    }
    ctx.restore();
  }
}
