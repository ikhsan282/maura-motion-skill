// Vas Yunani Black-Figure demo2 (~64 s): "Sayap Lilin Icarus & Labirin Daedalus"
// Cylindrical Attic black-figure amphora telling the myth of Daedalus, the Cretan Labyrinth, and Icarus's wax wings.
import * as K from '/styles/vas-yunani/kit.js';
const { clamp, lerp, ease, TAU } = AM.lib;
const P = K.PAL;

export const meta = { fps: 24, hold: 1, captions: { preset: 'serif', y: 1515, size: 68 } };

let ctx;
const C = {};
const seg = (id, t) => clamp((t - C[id].start) / Math.max(0.01, C[id].end - C[id].start));
const fade = (id, t, fi = 0.35, fo = 0.35) => {
  const s = C[id].start, e = C[id].end;
  if (t < s - fi || t > e + fo) return 0;
  if (t < s) return clamp((t - (s - fi)) / fi);
  if (t > e) return clamp(1 - (t - e) / fo);
  return 1;
};

export async function setup(AM) {
  ctx = AM.layer('vase');
  for (const l of AM.timeline.lines) C[l.id] = l;
  AM.sfx('whoosh', C.labirin.start + 0.2, { gain: 0.35 });
  AM.sfx('chime', C.sayap.start + 0.25, { gain: 0.4 });
  AM.sfx('pop', C.pesan.start + 0.2, { gain: 0.35 });
  AM.sfx('whoosh', C.matahari.start + 0.3, { gain: 0.45 });
  AM.sfx('thud', C.makna.start + 0.25, { gain: 0.4 });
}

function drawSunHelios(x, y, r, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(t * 0.25);
  // Ray triangles
  for (let i = 0; i < 16; i++) {
    ctx.save();
    ctx.rotate((i * TAU) / 16);
    ctx.fillStyle = (i % 2 === 0) ? P.gold : P.crimson;
    ctx.beginPath();
    ctx.moveTo(-12, -r);
    ctx.lineTo(0, -r - 48);
    ctx.lineTo(12, -r);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = P.slip;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
  ctx.strokeStyle = P.gold; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = P.gold;
  ctx.beginPath(); ctx.arc(0, 0, r * 0.62, 0, TAU); ctx.fill();
  ctx.restore();
}

function drawLabyrinthEmblem(x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = P.slip;
  ctx.fillRect(-r, -r, r * 2, r * 2);
  ctx.strokeStyle = P.incise;
  ctx.lineWidth = 6;
  for (let s = r - 18; s >= 24; s -= 26) {
    ctx.strokeRect(-s, -s, s * 2, s * 2);
    // Maze doorway gaps
    ctx.fillStyle = P.slip;
    ctx.fillRect(-14, -s - 4, 28, 10);
    ctx.fillRect(s - 4, -14, 10, 28);
  }
  ctx.restore();
}

export function render(t) {
  const scroll = t * 50;
  const chIdx = ['hook', 'labirin', 'sayap', 'pesan', 'matahari', 'makna'].findIndex((id) => t <= C[id].end + 0.1);
  const rom = ['ADEGAN I', 'ADEGAN II', 'ADEGAN III', 'ADEGAN IV', 'ADEGAN V', 'ADEGAN VI'][Math.max(0, chIdx)];

  K.stage(ctx, t, {
    scroll,
    title: 'ICARUS & DAEDALUS · SAYAP LILIN KRETA',
    subtitle: 'AMFORA ATTIC BLACK-FIGURE · ~520 SM',
    chapter: rom,
    glow: 0.32,
  });

  // Scene 1: Hook — Winged Icarus poised between sun and sea
  const a1 = fade('hook', t, 0.2, 0.3);
  if (a1 > 0) {
    ctx.save(); ctx.globalAlpha = a1;
    drawSunHelios(840, 520, 78, t);
    K.waves(ctx, 1235, 1080, t, scroll);
    const fy = 960 + Math.sin(t * 3) * 18;
    K.wings(ctx, 480, fy - 210, 1.35, t, { melt: 0 });
    K.figure(ctx, 480, fy, 1.15, { t, dir: 1, beard: false, laurel: true, robe: 'tunic', armR: 1.1, armL: -1.1 });
    K.plaque(ctx, 80, 255, 620, 170, {
      tag: 'MITOLOGI PULAU KRETA',
      title: 'KEJENIUSAN VS HUBRIS',
      sub: 'Kisah sayap bulu dan lilin lebah di langit Aegea',
      alpha: ease.outCubic(clamp(seg('hook', t) * 2)),
    });
    ctx.restore();
  }

  // Scene 2: Labirin — Daedalus & Icarus imprisoned above the Labyrinth of Crete
  const a2 = fade('labirin', t, 0.3, 0.3);
  if (a2 > 0) {
    ctx.save(); ctx.globalAlpha = a2;
    const p = seg('labirin', t);
    drawLabyrinthEmblem(310, 960, 175);
    K.columns(ctx, 590, 1285, 380, 560, { count: 4 });
    K.figure(ctx, 690, 1285, 1.2, { t, dir: -1, beard: true, robe: 'chiton', armR: 0.6 });
    K.figure(ctx, 860, 1285, 1.02, { t, dir: -1, beard: false, robe: 'tunic', armR: 0.4 });
    K.plaque(ctx, 80, 260, 920, 175, {
      tag: 'MENARA RAJA MINOS · KNOSSOS',
      title: 'ARSITEK LABIRIN YANG TERKURUNG',
      sub: 'Daedalus dan putranya Icarus mencari jalan keluar lewat angkasa',
      alpha: clamp(p * 2.5),
    });
    ctx.restore();
  }

  // Scene 3: Sayap — Crafting wings from feathers, linen thread, and beeswax
  const a3 = fade('sayap', t, 0.3, 0.3);
  if (a3 > 0) {
    ctx.save(); ctx.globalAlpha = a3;
    const p = seg('sayap', t);
    // Large workbench displaying the giant crafted wing pair
    K.wings(ctx, 540, 740, 1.95, t, { melt: 0 });
    // Daedalus on left, young Icarus on right admiring the wings
    K.figure(ctx, 250, 1285, 1.25, { t, dir: 1, beard: true, armR: 0.9 });
    K.figure(ctx, 830, 1285, 1.12, { t, dir: -1, beard: false, robe: 'tunic', armR: 0.85 });
    K.plaque(ctx, 80, 260, 920, 175, {
      tag: 'REKAYASA DAEDALUS',
      title: 'BULU BURUNG · BENANG LINEN · LILIN LEBAH',
      sub: 'Ratusan bulu disusun menyerupai lengkung sayap elang',
      alpha: clamp(p * 2.5),
    });
    ctx.restore();
  }

  // Scene 4: Pesan — The Golden Mean (Jalur Tengah) flight corridor diagram
  const a4 = fade('pesan', t, 0.3, 0.3);
  if (a4 > 0) {
    ctx.save(); ctx.globalAlpha = a4;
    const p = seg('pesan', t);
    drawSunHelios(880, 520, 68, t);
    K.waves(ctx, 1235, 1080, t, scroll);

    // Safe middle corridor dashed band
    ctx.strokeStyle = P.chalk; ctx.lineWidth = 3.5;
    ctx.setLineDash([14, 10]);
    ctx.beginPath();
    ctx.moveTo(80, 760); ctx.lineTo(1000, 760);
    ctx.moveTo(80, 1040); ctx.lineTo(1000, 1040);
    ctx.stroke();
    ctx.setLineDash([]);

    // Daedalus flying steadily in the safe middle lane
    const dx = lerp(240, 560, p);
    K.wings(ctx, dx, 900 - 200, 1.2, t, { melt: 0 });
    K.figure(ctx, dx, 900, 1.0, { t, dir: 1, beard: true, armR: 0.8 });

    K.plaque(ctx, 80, 260, 920, 175, {
      tag: 'NASIHAT SANG AYAH · VIA MEDIA',
      title: 'TERBANGLAH DI JALUR TENGAH',
      sub: 'Terlalu rendah basah oleh ombak · Terlalu tinggi leleh oleh surya',
      alpha: clamp(p * 2.5),
    });
    ctx.restore();
  }

  // Scene 5: Matahari — Icarus soaring too close to Helios's blazing sun
  const a5 = fade('matahari', t, 0.3, 0.3);
  if (a5 > 0) {
    ctx.save(); ctx.globalAlpha = a5;
    const p = seg('matahari', t);
    drawSunHelios(790, 560, 105, t);
    // Icarus climbing dangerously toward the sun as wax melts
    const ix = lerp(300, 620, ease.outCubic(p));
    const iy = lerp(1060, 760, ease.outCubic(p));
    K.wings(ctx, ix, iy - 210, 1.35, t, { melt: clamp((p - 0.35) * 1.6) });
    K.figure(ctx, ix, iy, 1.12, { t, dir: 1, beard: false, robe: 'tunic', armR: 1.35, armL: -1.2 });

    // Melting wax droplets & loose feathers
    for (let i = 0; i < 6; i++) {
      const wy = iy - 140 + ((t * 140 + i * 55) % 280);
      const wx = ix - 60 + i * 24;
      ctx.fillStyle = (i % 2 === 0) ? P.gold : P.slip;
      ctx.beginPath(); ctx.ellipse(wx, wy, 6, 14, 0.3, 0, TAU); ctx.fill();
    }

    K.plaque(ctx, 80, 260, 920, 175, {
      tag: 'TRAGEDI HUBRIS DI ANGKASA',
      title: 'LILIN LEBAH MELELEH DI BAWAH HELIOS',
      sub: 'Euforia membuat Icarus melupakan batas kemampuan sayapnya',
      alpha: clamp(p * 2.5),
    });
    ctx.restore();
  }

  // Scene 6: Makna — Daedalus looking back over the Icarian Sea & timeless lesson
  const a6 = fade('makna', t, 0.3, 0.2);
  if (a6 > 0) {
    ctx.save(); ctx.globalAlpha = a6;
    const p = seg('makna', t);
    K.waves(ctx, 1190, 1080, t, scroll, { h: 85 });
    // Floating feathers above the waves
    for (let i = 0; i < 7; i++) {
      const fx = 180 + i * 115 + Math.sin(t * 2 + i) * 18;
      const fy = 1040 + Math.cos(t * 2.3 + i) * 35;
      ctx.save();
      ctx.translate(fx, fy); ctx.rotate(0.6 + Math.sin(t + i) * 0.3);
      ctx.fillStyle = P.slip;
      ctx.beginPath(); ctx.ellipse(0, 0, 9, 34, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = P.incise; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, -28); ctx.lineTo(0, 28); ctx.stroke();
      ctx.restore();
    }
    // Daedalus hovering above looking down in grief
    K.wings(ctx, 320, 680, 1.25, t, { melt: 0 });
    K.figure(ctx, 320, 880, 1.1, { t, dir: 1, beard: true, armR: 0.4 });

    K.plaque(ctx, 80, 260, 920, 175, {
      tag: 'PESAN FILOSOFIS LAUT IKARIA',
      title: 'TEKNOLOGI BUTUH KENDALI DIRI',
      sub: 'Kehebatan inovasi selalu menuntut kerendahan hati penggunanya',
      alpha: clamp(p * 2.5),
    });
    ctx.restore();
  }
}

