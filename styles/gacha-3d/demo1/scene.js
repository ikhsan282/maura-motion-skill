// 64 · GACHA 3D — Demo 1: Gacha Satwa Langka Indonesia (Tarsius, Komodo, Badak Jawa).
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

  const cTarsius = cue('tarsius'), cMata = cue('mata');
  const cKomodo = cue('komodo'), cBisa = cue('bisa');
  const cBadak = cue('badak'), cPop = cue('populasi'), cAncaman = cue('ancaman'), cAkhir = cue('akhir');

  const glowCol = t >= cBadak ? PAL.gold : t >= cKomodo ? PAL.purple : PAL.blue;
  bg(ctx, t, { glowCol });
  cam(ctx, 540, 960, 1 + Math.sin(t * 0.4) * 0.008, 0, 960);

  // Phase 1: Machine & Rare Blue Reveal — Tarsius Sulawesi (hook -> komodo)
  if (t < cKomodo + 0.25) {
    const a1 = 1 - pr(t, cKomodo - 0.25, cKomodo + 0.2);
    ctx.save();
    ctx.globalAlpha = a1;

    gachaHeader(
      ctx,
      'BANNER SATWA ENDEMIK • NUSANTARA',
      'GACHA SATWA LANGKA RI',
      'Buka 3 Kapsul: Biru (Rare), Ungu (Epic), Emas (SSR)',
      { y: 185, a: pop(t, 0.05), accent: PAL.blue, pityText: 'PULL 1/3 • RARE ★3' }
    );

    if (t < cTarsius) {
      machine(ctx, 540, 620, 0.96, { t, label: 'PUTAR GACHA' });
      gachaInfoCard(ctx, 540, 1080, 880, 155, {
        tag: 'KOLEKSI BIODIVERSITAS INDONESIA',
        titleStr: 'Tiga Kapsul Satwa Endemik Kepulauan',
        subStr: 'Dari primata terkecil di Sulawesi hingga mamalia terlangka di dunia',
        stat: '3 PULL',
        statSub: 'SIAP DIBUKA',
        col: PAL.gold,
        a: pop(t, 0.2),
      });
    } else {
      capsule(ctx, 230, 445, 76, PAL.blue, {
        open: pr(t, cTarsius, cTarsius + 0.7),
        t,
        stars: 3,
        label: 'RARE ★3',
      });

      gachaRevealCard(ctx, 540, 665, 880, 380, {
        t,
        a: pop(t, cTarsius + 0.15),
        rarity: 'RARE • ENDEMIK SULAWESI',
        stars: 3,
        col: PAL.blue,
        name: 'TARSIUS SULAWESI',
        sub: 'Tarsius tarsier • Primata Nokturnal Mungil',
        kind: 'tarsius',
        stats: [
          { label: 'PENGLIHATAN MALAM (BOLA MATA > OTAK)', val: '99 / 100', pct: 0.99, col: PAL.blue },
          { label: 'ROTASI LEHER (TANPA PINDAH BADAN)', val: '180°', pct: 0.90, col: PAL.green },
          { label: 'PANJANG TUBUH DEWASA', val: '10–15 cm', pct: 0.25, col: PAL.gold },
        ],
      });

      gachaInfoCard(ctx, 540, 1015, 880, 150, {
        tag: 'ANATOMI EKSTREM PRIMATA NOKTURNAL',
        titleStr: 'Satu Bola Mata Lebih Besar dari Otaknya',
        subStr: 'Mata tidak bisa melirik, sehingga leher berputar 180° seperti burung hantu',
        stat: '180°',
        statSub: 'PUTARAN KEPALA',
        col: PAL.blue,
        a: pop(t, cMata + 0.05),
      });
    }
    ctx.restore();
  }

  // Phase 2: Epic Purple Reveal — Komodo Dragon (komodo -> badak)
  if (t >= cKomodo - 0.2 && t < cBadak + 0.25) {
    const a2 = pr(t, cKomodo - 0.2, cKomodo + 0.2) * (1 - pr(t, cBadak - 0.25, cBadak + 0.2));
    ctx.save();
    ctx.globalAlpha = a2;

    gachaHeader(
      ctx,
      'EPIC SUMMON • NUSA TENGGARA TIMUR',
      'KOMODO: SANG NAGA PURBA',
      'Kadal Terbesar di Bumi dengan Kelenjar Bisa Antikoagulan',
      { y: 185, a: 1, accent: PAL.purple, pityText: 'PULL 2/3 • EPIC ★4' }
    );

    gachaRevealCard(ctx, 540, 540, 880, 380, {
      t,
      a: pop(t, cKomodo + 0.1),
      rarity: 'SR • EPIC APEX PREDATOR',
      stars: 4,
      col: PAL.purple,
      name: 'KOMODO (ORA)',
      sub: 'Varanus komodoensis • Taman Nasional Komodo',
      kind: 'komodo',
      stats: [
        { label: 'PANJANG & BOBOT MAKSIMUM', val: '3,0 m / 90 kg', pct: 0.94, col: PAL.purple },
        { label: 'TOKSIN ANTIKOAGULAN RAHANG BAWAH', val: 'MEMATIKAN', pct: 0.96, col: PAL.ball },
        { label: 'POPULASI ALAM LIAR SAAT INI', val: '~3.300 Ekor', pct: 0.42, col: PAL.gold },
      ],
    });

    gachaInfoCard(ctx, 540, 895, 880, 150, {
      tag: 'SENJATA BIOLOGIS RAHANG BAWAH',
      titleStr: 'Gigi Bergerigi + Kelenjar Racun Hemotoksin',
      subStr: 'Mencegah pembekuan darah mangsa hingga mengalami syok hipovolemik',
      stat: '60 GIGI',
      statSub: 'TAJAM BERGERIGI',
      col: PAL.purple,
      a: pop(t, cBisa + 0.05),
    });

    gachaInfoCard(ctx, 540, 1085, 880, 145, {
      tag: 'HABITAT KEPULAUAN VULKANIK',
      titleStr: 'Hanya Ada di Komodo, Rinca, Flores & Gili Motang',
      subStr: 'Predator puncak purba yang bertahan jutaan tahun di sabana NTT',
      stat: 'NTT',
      statSub: 'ENDEMIK RI',
      col: PAL.gold,
      a: pop(t, cBisa + 0.25),
    });
    ctx.restore();
  }

  // Phase 3: SSR Golden Reveal — Javan Rhino (badak -> end)
  if (t >= cBadak - 0.2) {
    const a3 = pr(t, cBadak - 0.2, cBadak + 0.25);
    ctx.save();
    ctx.globalAlpha = a3;

    gachaHeader(
      ctx,
      'SSR LEGENDARY ★5 • UJUNG KULON',
      'BADAK JAWA BERCULA SATU',
      'Mamalia Besar Paling Langka di Seluruh Planet Bumi',
      { y: 185, a: 1, accent: PAL.gold, pityText: 'PULL 3/3 • SSR ★5' }
    );

    gachaRevealCard(ctx, 540, 540, 880, 380, {
      t,
      a: pop(t, cBadak + 0.1),
      rarity: 'SSR • CRITICALLY ENDANGERED',
      stars: 5,
      col: PAL.gold,
      name: 'BADAK JAWA',
      sub: 'Rhinoceros sondaicus • Hanya di Ujung Kulon',
      kind: 'badak',
      stats: [
        { label: 'TINGKAT KELANGKAAN GLOBAL', val: '99,9% LANGKA', pct: 1.0, col: PAL.gold },
        { label: 'KETahanan KULIT BERLIPAT (ARMOR)', val: '95 / 100', pct: 0.95, col: PAL.green },
        { label: 'SISA POPULASI DI BUMI', val: '~80 EKOR', pct: 0.12, col: PAL.ball },
      ],
    });

    gachaInfoCard(ctx, 540, 895, 880, 150, {
      tag: 'FAKTA KONSERVASI DARURAT',
      titleStr: 'Hanya Tersisa di Satu Titik di Seluruh Dunia',
      subStr: 'Seluruh populasi hidup di Semenanjung Ujung Kulon, Banten (~80 ekor)',
      stat: '~80',
      statSub: 'EKOR TERSISA',
      col: PAL.gold,
      a: pop(t, cPop + 0.05),
    });

    if (t >= cAncaman) {
      gachaInfoCard(ctx, 540, 1085, 880, 155, {
        tag: t >= cAkhir ? 'PESAN DARI PANGGUNG GACHA' : 'RISIKO HABITAT TUNGGAL',
        titleStr: t >= cAkhir
          ? 'Di Game Langka Itu Keren, Di Dunia Nyata Hampir Punah'
          : 'Rawan Bencana Krakatau & Penyakit Menular',
        subStr: t >= cAkhir
          ? 'Mari jaga hutan Indonesia agar satwa bintang lima kita tetap hidup'
          : 'Tanpa habitat kedua, satu bencana alam bisa menghapus seluruh spesies',
        stat: t >= cAkhir ? 'JAGA RI' : '1 LOKASI',
        statSub: t >= cAkhir ? 'CEGAH PUNAH' : 'UJUNG KULON',
        col: t >= cAkhir ? PAL.green : PAL.ball,
        a: pop(t, cAncaman + 0.05),
      });
    }
    ctx.restore();
  }
}
