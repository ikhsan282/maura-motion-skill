// 64 · GACHA 3D — Demo 3: Gacha Pusaka & Kuliner Nusantara (Rendang, Keris, Pinisi).
import {
  PAL, cam, pop, pr, bg, gachaHeader,
  capsule, gachaRevealCard, gachaInfoCard,
} from '/styles/gacha-3d/kit.js';

export const meta = { fps: 30, captions: { preset: 'bold', y: 1580 } };

let ctx;
export function setup(AM) {
  ctx = AM.layer('bg');
}

export function render(t, AM) {
  const cue = (id) => AM.cue(id).start;

  const cRendang = cue('rendang'), cAwet = cue('awet');
  const cKeris = cue('keris'), cUnesco = cue('unesco');
  const cPinisi = cue('pinisi'), cPasak = cue('pasak'), cSamudra = cue('samudra'), cAkhir = cue('akhir');

  const glowCol = t >= cPinisi ? PAL.gold : t >= cKeris ? PAL.purple : PAL.green;
  bg(ctx, t, { glowCol });
  cam(ctx, 540, 960, 1 + Math.sin(t * 0.4) * 0.008, 0, 960);

  // Phase 1: Culinary Consumable Item — Rendang Minangkabau (hook -> keris)
  if (t < cKeris + 0.25) {
    const a1 = 1 - pr(t, cKeris - 0.25, cKeris + 0.2);
    ctx.save();
    ctx.globalAlpha = a1;

    gachaHeader(
      ctx,
      'BANNER WARISAN NUSANTARA • ITEM KULINER',
      'RENDANG MINANGKABAU',
      'Ransum Perjalanan Legendaris yang Tahan Berminggu-Minggu',
      { y: 185, a: pop(t, 0.05), accent: PAL.green, pityText: 'ITEM 1/3 • KULINER ★4' }
    );

    if (t < cRendang) {
      capsule(ctx, 540, 560, 125, PAL.green, {
        open: pr(t, 0.1, cRendang),
        t,
        stars: 4,
        label: 'BUKA KAPSUL NUSANTARA',
      });
      gachaInfoCard(ctx, 540, 980, 880, 155, {
        tag: 'KOLEKSI MAHAKARYA LELUHUR',
        titleStr: 'Tiga Warisan Pangan, Metalurgi & Maritim RI',
        subStr: 'Dikemas dengan statistik sains & sejarah nyata di balik setiap karya',
        stat: '3 ITEM',
        statSub: 'WARISAN DUNIA',
        col: PAL.green,
        a: pop(t, 0.2),
      });
    } else {
      gachaRevealCard(ctx, 540, 540, 880, 380, {
        t,
        a: pop(t, cRendang + 0.1),
        rarity: 'SR • CONSUMABLE BUFF KULINER DUNIA',
        stars: 4,
        col: PAL.green,
        name: 'RENDANG PADANG',
        sub: 'Teknologi Pengawetan Rempah & Santan (Marandang)',
        kind: 'tarsius',
        stats: [
          { label: 'DURASI MASAK (GULAI → KALIO → RENDANG)', val: '6–8 Jam', pct: 0.92, col: PAL.green },
          { label: 'DAYA TAHAN SUHU RUANG (PENGAWET ALAMI)', val: '30 Hari', pct: 0.96, col: PAL.gold },
          { label: 'PERINGKAT KULINER TERLEZAT DUNIA', val: '#1 GLOBAL', pct: 1.0, col: PAL.blue },
        ],
      });

      gachaInfoCard(ctx, 540, 895, 880, 150, {
        tag: 'SAINS PENGAWETAN PANGAN TRADISIONAL',
        titleStr: 'Rempah Antimikroba + Kadar Air Rendah',
        subStr: 'Lengkuas, serai, bawang putih & cabai mengunci daging tetap awet di perjalanan',
        stat: '4 MINGGU',
        statSub: 'AWET ALAMI',
        col: PAL.green,
        a: pop(t, cAwet + 0.05),
      });
    }
    ctx.restore();
  }

  // Phase 2: Epic Weapon Artifact — Keris Pamor Meteorit (keris -> pinisi)
  if (t >= cKeris - 0.2 && t < cPinisi + 0.25) {
    const a2 = pr(t, cKeris - 0.2, cKeris + 0.2) * (1 - pr(t, cPinisi - 0.25, cPinisi + 0.2));
    ctx.save();
    ctx.globalAlpha = a2;

    gachaHeader(
      ctx,
      'EPIC ARTIFACT • METALURGI NUSANTARA',
      'KERIS PAMOR METEORIT',
      'Seni Tempa Lipat Besi, Baja & Nikel Batu Angkasa',
      { y: 185, a: 1, accent: PAL.purple, pityText: 'ITEM 2/3 • PUSAKA ★5' }
    );

    gachaRevealCard(ctx, 540, 540, 880, 380, {
      t,
      a: pop(t, cKeris + 0.1),
      rarity: 'SR • MASTERPIECE METALURGI',
      stars: 5,
      col: PAL.purple,
      name: 'KERIS PUSAKA',
      sub: 'Bilah Tempa Lipat (Damascus Nusantara) • UNESCO 2005',
      kind: 'keris',
      stats: [
        { label: 'LAPISAN TEMPA LIPAT EMPU (PAMOR)', val: '64–512 Lapis', pct: 0.95, col: PAL.purple },
        { label: 'KANDUNGAN LOGam NIKEL METEORIT', val: 'PRAMBANAN', pct: 0.90, col: PAL.gold },
        { label: 'PENGAKUAN WARISAN DUNIA UNESCO', val: 'TAHUN 2005', pct: 1.0, col: PAL.blue },
      ],
    });

    gachaInfoCard(ctx, 540, 895, 880, 150, {
      tag: 'METALURGI BATU BINTANG',
      titleStr: 'Motif Pamor Putih dari Campuran Nikel & Besi',
      subStr: 'Ditempa berulang kali lalu dicuci air jeruk nipis & warangan hingga berkilau',
      stat: 'METEORIT',
      statSub: 'NIKEL PAMOR',
      col: PAL.purple,
      a: pop(t, cKeris + 0.25),
    });

    if (t >= cUnesco) {
      gachaInfoCard(ctx, 540, 1085, 880, 145, {
        tag: 'WARISAN BUDAYA TAKBENDA DUNIA',
        titleStr: 'Diakui UNESCO sejak 25 November 2005',
        subStr: 'Memadukan teknologi metalurgi, seni ukir hulu, dan simbol filosofi hidup',
        stat: 'UNESCO',
        statSub: '2005 RESMI',
        col: PAL.gold,
        a: pop(t, cUnesco + 0.05),
      });
    }
    ctx.restore();
  }

  // Phase 3: SSR Legendary Vessel — Pinisi Bulukumba (pinisi -> end)
  if (t >= cPinisi - 0.2) {
    const a3 = pr(t, cPinisi - 0.2, cPinisi + 0.25);
    ctx.save();
    ctx.globalAlpha = a3;

    gachaHeader(
      ctx,
      'SSR LEGENDARY ★5 • MARITIM SULAWESI SELATAN',
      'KAPAL LAYAR PINISI',
      '2 Tiang Utama, 7 Layar, Dirakit Tanpa Paku Besi',
      { y: 185, a: 1, accent: PAL.gold, pityText: 'ITEM 3/3 • SSR ★5' }
    );

    gachaRevealCard(ctx, 540, 540, 880, 380, {
      t,
      a: pop(t, cPinisi + 0.1),
      rarity: 'SSR • ARSITEKTUR MARITIM DUNIA',
      stars: 5,
      col: PAL.gold,
      name: 'PINISI NUSANTARA',
      sub: 'Seni Perahu Panrita Lopi • Tanah Beru, Bulukumba',
      kind: 'badak',
      stats: [
        { label: 'KONSTRUKSI PASAK KAYU BESI (TANPA PAKU)', val: '100% PRESISI', pct: 1.0, col: PAL.gold },
        { label: 'KONFIGURASI TIANG & LAYAR SAMUDRA', val: '2 Tiang / 7 Layar', pct: 0.96, col: PAL.green },
        { label: 'JELAJAH LINTAS SAMUDRA (KANADA & JEPANG)', val: 'GLOBAL', pct: 0.98, col: PAL.blue },
      ],
    });

    gachaInfoCard(ctx, 540, 895, 880, 150, {
      tag: 'TEKNIK PENYAMBUNGAN PAPAN DAHULU',
      titleStr: 'Lambung Dibentuk Terlebih Dahulu dengan Pasak Kayu',
      subStr: 'Papan kayu ulin & jati dikunci pasak kayu yang mengembang rapat saat terkena air laut',
      stat: '0 PAKU',
      statSub: 'PASAK KAYU',
      col: PAL.gold,
      a: pop(t, cPasak + 0.05),
    });

    if (t >= cSamudra) {
      gachaInfoCard(ctx, 540, 1085, 880, 155, {
        tag: t >= cAkhir ? 'TEKNOLOGI LELUHUR BINTANG LIMA' : 'PELAYARAN LINTAS BENUA',
        titleStr: t >= cAkhir
          ? 'Pangan, Metalurgi & Maritim Nusantara Kelas Dunia'
          : 'Pinisi Nusantara Berlayar ke Vancouver (1986) & Tokyo',
        subStr: t >= cAkhir
          ? 'Bukti kejayaan sains dan kriya kepulauan Indonesia lintas abad'
          : 'Ditetapkan UNESCO sebagai Warisan Budaya Takbenda pada 7 Desember 2017',
        stat: t >= cAkhir ? '★ 5 RI' : 'UNESCO',
        statSub: t >= cAkhir ? 'KEBANGGAAN' : 'TAHUN 2017',
        col: t >= cAkhir ? PAL.green : PAL.gold,
        a: pop(t, cSamudra + 0.05),
      });
    }
    ctx.restore();
  }
}
