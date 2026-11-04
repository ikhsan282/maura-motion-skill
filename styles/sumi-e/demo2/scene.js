// Sumi-e Tinta Timur — Demo 2: "Filosofi Kintsugi & Ruang Kosong (Ma)"
import * as K from '/styles/sumi-e/kit.js';
const { clamp, lerp, ease, TAU } = AM.lib;

export const meta = {
  fps: 30,
  captions: {
    preset: 'serif',
    y: 1500,
    size: 56,
    color: '#2c2926',
    active: '#b8322a',
    box: { fill: 'rgba(244,239,227,0.92)', pad: 18, radius: 10 },
  },
};

let ctx, fx;
const C = {};

export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;
  AM.sfx('impact', 0.25, { gain: 0.45 });
  AM.sfx('whoosh', C.shogun.start + 0.15, { gain: 0.35 });
  AM.sfx('pop', C.urushi.start + 0.2, { gain: 0.35 });
  AM.sfx('chime', C.emas.start + 0.2, { gain: 0.5 });
  AM.sfx('wind', C.wabisabi.start + 0.15, { gain: 0.35 });
  AM.sfx('swoosh_up', C.sumie.start + 0.15, { gain: 0.35 });
  AM.sfx('chime', C.ma.start + 0.2, { gain: 0.4 });
  AM.sfx('stamp', C.akhir.start + 0.25, { gain: 0.45 });
}

const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => {
  const L = SHOTS.filter((x) => C[x.id]);
  const i = L.findIndex((x) => x.id === id);
  return [C[id].start, L[i + 1] ? C[L[i + 1].id].start : AM.duration];
};

// Draw Sumi-e Chawan (Ceramic Tea Bowl) with optional shard separation, staples, or Kintsugi gold seams
function drawChawan(g, x, y, s = 1, { split = 0, staples = false, goldProg = 0, resinProg = 0 } = {}) {
  g.save();
  g.translate(x, y);
  g.scale(s, s);

  // Foot ring (kodai)
  g.fillStyle = K.PAL.ink;
  g.fillRect(-105, 130 + split * 12, 210, 32);

  // Left shard of the bowl
  g.save();
  g.translate(-split * 28, -split * 10);
  g.rotate(-split * 0.08);
  g.beginPath();
  g.moveTo(-270, -130);
  g.quadraticCurveTo(-265, 95, -105, 135);
  g.lineTo(15, 135);
  g.lineTo(-25, 35);
  g.lineTo(28, -45);
  g.lineTo(-10, -130);
  g.closePath();
  g.fillStyle = K.PAL.dark; g.fill();
  g.strokeStyle = K.PAL.ink; g.lineWidth = 8; g.stroke();
  g.restore();

  // Right shard of the bowl
  g.save();
  g.translate(split * 32, split * 8);
  g.rotate(split * 0.09);
  g.beginPath();
  g.moveTo(-10, -130);
  g.lineTo(28, -45);
  g.lineTo(-25, 35);
  g.lineTo(15, 135);
  g.lineTo(105, 135);
  g.quadraticCurveTo(265, 95, 270, -130);
  g.closePath();
  g.fillStyle = K.PAL.ink; g.fill();
  g.strokeStyle = K.PAL.ink; g.lineWidth = 8; g.stroke();
  g.restore();

  // Rim ellipse when joined
  if (split < 0.25) {
    g.beginPath();
    g.ellipse(0, -130, 270, 34, 0, 0, TAU);
    g.fillStyle = K.PAL.paperDark; g.fill();
    g.strokeStyle = K.PAL.ink; g.lineWidth = 8; g.stroke();
  }

  // Ugly iron staples (Juci)
  if (staples) {
    g.strokeStyle = '#7a7570'; g.lineWidth = 10; g.lineCap = 'square';
    for (const [sx, sy] of [[2, -85], [6, -15], [-4, 65]]) {
      g.beginPath();
      g.moveTo(sx - 38, sy - 10); g.lineTo(sx + 38, sy + 6);
      g.stroke();
      g.fillStyle = K.PAL.red;
      g.beginPath(); g.arc(sx - 38, sy - 10, 8, 0, TAU); g.arc(sx + 38, sy + 6, 8, 0, TAU); g.fill();
    }
  }

  // Urushi resin seam or Kintsugi golden vein networks
  const seamProg = Math.max(resinProg, goldProg);
  if (seamProg > 0) {
    const col = goldProg > 0 ? K.PAL.gold : K.PAL.red;
    g.save();
    if (goldProg > 0) {
      g.shadowColor = 'rgba(201,151,56,0.65)';
      g.shadowBlur = 18;
    }
    g.strokeStyle = col;
    g.lineWidth = goldProg > 0 ? 11 : 8;
    g.lineCap = 'round'; g.lineJoin = 'round';
    // Main central fracture vein
    g.beginPath();
    g.moveTo(-10, -98);
    g.lineTo(28, -45);
    g.lineTo(-25, 35);
    g.lineTo(15, 132);
    g.stroke();
    // Secondary branching veins
    if (seamProg > 0.4) {
      g.lineWidth = goldProg > 0 ? 7 : 5;
      g.beginPath();
      g.moveTo(28, -45); g.lineTo(135, -10); g.lineTo(215, -75);
      g.moveTo(-25, 35); g.lineTo(-145, 65); g.lineTo(-210, 15);
      g.stroke();
    }
    g.restore();
  }
  g.restore();
}

// 1. Hook: A prized ceramic tea bowl shatters apart
shot('hook', (t, a, b) => {
  const lt = t - a;
  K.ricePaper(ctx, t, { header: 'KETIKA KERAMIK BERHARGA RETAK', sub: 'MEMBUANG ATAU MENYEMBUNYIKAN LUKA?', sealText: '破' });
  K.inkBloom(ctx, 540, 680, 290, { col: K.PAL.mist, alpha: 0.55, seed: 2, t });

  const split = ease.outBack(clamp((lt - 0.15) / 0.6), 1.8);
  drawChawan(ctx, 540, 690, 1.15, { split });

  K.scrollBox(ctx, 540, 1185, 860, 140, 'MANGKUK TEH YANG PECAH', 'Sebagian Besar Dunia Menyembunyikan Bekas Retakannya', {
    p: clamp((lt - 0.25) / 0.4),
  });
});

// 2. Kyoto 15th Century — Shogun Ashikaga Yoshimasa's stapled celadon bowl
shot('shogun', (t, a, b) => {
  const lt = t - a;
  K.ricePaper(ctx, t, { header: 'KYOTO · ABAD KE-15 (ERA MUROMACHI)', sub: 'MANGKUK TEH SHOGUN ASHIKAGA YOSHIMASA', sealText: '義政' });
  K.mistyMountains(ctx, t, { yBase: 760, seed: 19 });
  drawChawan(ctx, 540, 680, 1.1, { split: 0.04, staples: true });

  K.redSeal(ctx, 830, 490, '京都', { size: 92, p: clamp((lt - 0.25) / 0.35) });
  K.scrollBox(ctx, 540, 1185, 860, 145, 'AWALNYA DIPERBAIKI DENGAN KAWAT BESI', 'Shogun Meminta Perajin Jepang Mencari Cara yang Lebih Mulia', {
    p: clamp((lt - 0.2) / 0.4),
    accent: K.PAL.red,
  });
});

// 3. Natural Urushi Lacquer Resin joining the shards stronger than stone
shot('urushi', (t, a, b) => {
  const lt = t - a;
  K.ricePaper(ctx, t, { header: 'GETAH PERNIS POHON URUSHI (漆)', sub: 'PEREKAT ALAMI YANG MENGERAS SEKUAT BATU', sealText: '漆' });
  const join = ease.inOutCubic(clamp(lt / 0.9));
  drawChawan(ctx, 540, 680, 1.15, { split: 1 - join, resinProg: clamp((lt - 0.5) / 0.6) });

  K.scrollBox(ctx, 540, 1185, 860, 140, 'DIREKATKAN DENGAN GETAH URUSHI', 'Menyatukan Kepingan Keramik dengan Kesabaran Berminggu-minggu', {
    p: clamp((lt - 0.25) / 0.4),
  });
});

// 4. Kintsugi (金継ぎ) — Dusting the wet lacquer seams with pure powdered gold!
shot('emas', (t, a, b) => {
  const lt = t - a;
  K.ricePaper(ctx, t, { header: 'KINTSUGI (金継ぎ) · SAMBUNGAN EMAS', sub: 'LUKA YANG DITERANGI BUBUK EMAS MURNI (MAKI-E)', sealText: '金継' });
  K.inkBloom(ctx, 540, 670, 320, { col: K.PAL.gold, alpha: 0.16, seed: 9, t });

  const gp = clamp(lt / 0.8);
  drawChawan(ctx, 540, 680, 1.22, { split: 0, goldProg: gp });

  // Floating gold dust particles around the bowl
  ctx.save();
  ctx.fillStyle = K.PAL.gold;
  for (let i = 0; i < 28; i++) {
    const a0 = i * 1.37 + t * 0.6, r = 160 + (i % 5) * 42;
    const px = 540 + Math.cos(a0) * r, py = 650 + Math.sin(a0 * 1.3) * (r * 0.55);
    ctx.beginPath(); ctx.arc(px, py, 3 + (i % 3) * 2, 0, TAU); ctx.fill();
  }
  ctx.restore();

  K.scrollBox(ctx, 540, 1185, 860, 145, 'RETAKAN TIDAK DISEMBUNYIKAN', 'Justru Ditaburi Bubuk Emas agar Bersinar Lebih Indah', {
    p: clamp((lt - 0.25) / 0.4),
    accent: K.PAL.gold,
  });
});

// 5. Wabi-Sabi philosophy: scars as unique history of resilience
shot('wabisabi', (t, a, b) => {
  const lt = t - a;
  K.ricePaper(ctx, t, { header: 'FILOSOFI WABI-SABI (侘寂)', sub: 'KEINDAHAN DALAM KETIDAKSEMPURNAAN & WAKTU', sealText: '侘寂' });

  // Enso Zen brush circle framing the Kintsugi bowl
  ctx.save();
  ctx.translate(540, 660);
  ctx.strokeStyle = K.PAL.ink;
  ctx.lineWidth = 28;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, 0, 295, -0.4, Math.PI * 1.72 * ease.outCubic(clamp(lt / 0.8)));
  ctx.stroke();
  ctx.restore();

  drawChawan(ctx, 540, 690, 0.92, { split: 0, goldProg: 1 });
  K.scrollBox(ctx, 540, 1185, 860, 145, 'JEJAK SEJARAH & KETANGGUHAN', 'Bukan Cacat, Melainkan Bukti Pernah Bertahan dari Benturan', {
    p: clamp((lt - 0.25) / 0.4),
  });
});

// 6. Sumi-e connection: One irreversible brush stroke on absorbent rice paper
shot('sumie', (t, a, b) => {
  const lt = t - a;
  K.ricePaper(ctx, t, { header: 'PRINSIP KUAS SUMI-E (墨絵)', sub: 'SATU GORESAN JUJUR TANPA BISA DIHAPUS', sealText: '一筆' });

  const k = ease.outCubic(clamp(lt / 0.9));
  K.brushStroke(ctx, 160, 740, 920, 520, { w: 46, col: K.PAL.ink, dry: true, arch: 95, p: k });
  K.brushStroke(ctx, 240, 860, 840, 760, { w: 24, col: K.PAL.dark, dry: true, arch: -55, p: clamp((lt - 0.3) / 0.7) });
  K.redSeal(ctx, 860, 860, '真', { size: 86, p: clamp((lt - 0.5) / 0.35) });

  K.scrollBox(ctx, 540, 1185, 860, 145, 'TIADA TOMBOL HAPUS DI KERTAS BERAS', 'Setiap Goresan Tinta Mencatat Kejujuran Momen Saat Itu', {
    p: clamp((lt - 0.25) / 0.4),
  });
});

// 7. Ma (間) — The Zen Art of Meaningful Empty Space
shot('ma', (t, a, b) => {
  const lt = t - a;
  K.ricePaper(ctx, t, { header: 'FILOSOFI MA (間) · RUANG KOSONG', sub: 'KEHENINGAN YANG MEMBERI NAPAS PADA KARYA', sealText: '間' });

  // Vast serene empty Xuan paper space with a single delicate bamboo branch & solitary bird
  K.drawBamboo(ctx, 880, 1020, 520, { bend: -85 + Math.sin(t * 1.5) * 10, sw: 14, nodes: 4 });
  // Minimalist 2-stroke perched bird on the upper left space
  ctx.save(); ctx.translate(310, 520 + Math.sin(t * 2) * 6);
  K.brushStroke(ctx, -45, 10, 35, -18, { w: 12, col: K.PAL.ink, dry: true, arch: 18 });
  K.brushStroke(ctx, -10, 0, -55, 28, { w: 7, col: K.PAL.dark, dry: true });
  ctx.restore();

  // Subtle callout pointing to the intentional blank paper ("RUANG HENING MA")
  ctx.save();
  ctx.fillStyle = K.PAL.mid;
  ctx.font = "700 42px 'Noto Serif', Georgia, serif";
  ctx.textAlign = 'center';
  ctx.fillText('「 間 · RUANG HENING 」', 450, 740);
  ctx.restore();

  K.scrollBox(ctx, 540, 1185, 860, 145, 'KERTAS PUTIH BUKANLAH KEKOSONGAN SIA-SIA', 'Ruang Kosong (Ma) Membuat Satu Goresan Tinta Tampak Hidup', {
    p: clamp((lt - 0.25) / 0.4),
    accent: K.PAL.red,
  });
});

// 8. Finale: Kintsugi Gold + Sumi-e Silence
shot('akhir', (t, a, b) => {
  const lt = t - a;
  K.ricePaper(ctx, t, { header: 'MERANGKUL KETIDAKSEMPURNAAN', sub: 'WARISAN KINTSUGI & TINTA SUMI-E', sealText: '美' });
  K.mistyMountains(ctx, t, { yBase: 860, seed: 77 });
  drawChawan(ctx, 540, 700, 1.15, { split: 0, goldProg: 1 });
  K.redSeal(ctx, 830, 490, '金継', { size: 100, p: clamp((lt - 0.25) / 0.35) });

  K.scrollBox(ctx, 540, 1185, 860, 150, 'KEINDAHAN DARI LUKA & KEHENINGAN', 'Urat Emas Kintsugi & Ruang Kosong Ma yang Memuliakan Hidup', {
    p: clamp((lt - 0.25) / 0.4),
    accent: K.PAL.gold,
  });
});

export function render(t, AM) {
  fx.clearRect(0, 0, AM.W, AM.H);
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start) s = sh;
  const [a, b] = span(s.id);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  s.fn(t, Math.max(0, a), b);
  ctx.restore();
  AM.lib.vignette(fx, 0.22);
  AM.lib.grain(fx, t, { amount: 0.025, fps: 12 });
}

