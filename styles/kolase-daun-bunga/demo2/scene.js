// Kolase Daun & Bunga demo2: "Kantong Semar Nusantara — Tumbuhan Pemangsa Serangga di Tanah Miskin Hara"
import * as K from '/styles/kolase-daun-bunga/kit.js';
const { clamp, lerp, ease, prog, env } = AM.lib;
const P = K.PAL;

export const meta = { fps: 24, hold: 2, captions: { preset: 'serif', y: 1520, size: 54, maxWords: 4 } };

let ctx;
const C = {};

export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;

  AM.sfx('paper', 0.08, { gain: 0.45 });
  AM.sfx('pop', C.hook.start + 0.3, { gain: 0.4 });
  AM.sfx('paper', C.tanah.start + 0.25, { gain: 0.4 });
  AM.sfx('magic', C.sulur.start + 0.3, { gain: 0.4 });
  AM.sfx('ding', C.nektar.start + 0.3, { gain: 0.38 });
  AM.sfx('whoosh', C.perangkap.start + 0.3, { gain: 0.4 });
  AM.sfx('pop', C.enzim.start + 0.3, { gain: 0.38 });
  AM.sfx('chime', C.simbiosis.start + 0.3, { gain: 0.4 });
  AM.sfx('bell_temple', C.moral.start + 0.35, { gain: 0.45 });
}

const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const at = (id) => C[id].start - 0.12;

// 1. Hook: Pressed leaf & pitcher plant specimen with hovering leaf fly
shot('hook', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  K.bg(ctx, t);
  K.cam(ctx, 540, 960, lerp(0.96, 1.06, p));
  K.kantongSemar(ctx, 580, 1020, 1.45, { t, lidOpen: 1 });
  K.leafCreature(ctx, 'lalat', { x: 640 + Math.sin(t * 3) * 40, y: 740 + Math.cos(t * 2.5) * 25, s: 1.15, t });
  K.herbariumLabel(ctx, 'KANTONG SEMAR NUSANTARA', 540, 260, {
    latin: 'Nepenthes · Kalimantan & Sumatera',
    sub: 'tumbuhan pemangsa serangga dengan jebakan daun unik',
    alpha: env(t, a + 0.1, b, 0.3, 0.25),
  });
});

// 2. Tanah: Nutrient-poor peat swamp roots & green leaves
shot('tanah', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  K.bg(ctx, t);
  K.cam(ctx, 540, 960, 1.02);
  K.twig(ctx, [[540, 740], [540, 1220]], { width: 14, tape: true });
  K.leaf(ctx, 540, 820, 240, 72, -0.4, P.leaf, { t });
  K.leaf(ctx, 540, 920, 240, 72, -2.7, P.leafLt, { t });
  K.kantongSemar(ctx, 640, 1060, 1.15, { t });
  K.herbariumLabel(ctx, 'ADAPTASI LAHAN GAMBUT', 540, 260, {
    latin: 'Miskin Unsur Nitrogen',
    sub: 'mencari tambahan nutrisi dari serangga yang terjebak',
    alpha: env(t, a + 0.15, b, 0.3, 0.25),
  });
});

// 3. Sulur: Leaf tip elongating into a tendril and inflating into a pitcher
shot('sulur', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutCubic);
  K.bg(ctx, t);
  K.cam(ctx, 540, 960, 1.08);
  K.kantongSemar(ctx, 580, 1020, 1.5, { t, inflate: lerp(0.25, 1.0, p), lidOpen: prog(p, 0.6, 1.0) });
  K.herbariumLabel(ctx, 'MODIFIKASI UJUNG DAUN', 540, 260, {
    latin: 'Sulur Menjadi Kantong',
    sub: 'bukan bunga, melainkan ujung daun yang menggembung',
    alpha: env(t, a + 0.15, b, 0.3, 0.25),
  });
});

// 4. Nektar: Sweet nectar droplets glowing on the peristome rim and lid
shot('nektar', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  K.bg(ctx, t);
  K.cam(ctx, 580, 920, lerp(1.1, 1.28, p));
  K.kantongSemar(ctx, 580, 1020, 1.55, { t, lidOpen: 1.1 });
  // Golden nectar droplets on the rim
  ctx.save();
  ctx.fillStyle = P.petalGold;
  for (let i = -3; i <= 3; i++) {
    ctx.beginPath();
    ctx.arc(580 + i * 24, 860 + Math.sin(t * 4 + i) * 3, 6.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  K.leafCreature(ctx, 'lalat', { x: lerp(780, 610, p), y: lerp(720, 835, p), s: 1.1, t });
  K.herbariumLabel(ctx, 'UMPAN NEKTAR MANIS', 540, 260, {
    latin: 'Peristome & Operculum',
    sub: 'aroma manis di bibir kantong yang memikat serangga',
    alpha: env(t, a + 0.15, b, 0.3, 0.25),
  });
});

// 5. Perangkap: Slipping off the wet peristome rim into the pitcher
shot('perangkap', (t, a, b) => {
  const p = prog(t, a, b, ease.inQuad);
  K.bg(ctx, t);
  K.cam(ctx, 580, 960, 1.22);
  K.kantongSemar(ctx, 580, 1020, 1.55, { t, lidOpen: 0.9 });
  K.leafCreature(ctx, 'lalat', { x: 580, y: lerp(835, 1060, clamp(p * 1.4)), s: lerp(1.1, 0.65, p), t, flap: 1 - p * 0.7 });
  K.herbariumLabel(ctx, 'JEBAKAN LICIN MIKROSKOPIS', 540, 260, {
    latin: 'Permukaan Aquaplaning',
    sub: 'lapisan air tipis membuat kaki serangga kehilangan pijakan',
    size: 44,
    alpha: env(t, a + 0.15, b, 0.3, 0.25),
  });
});

// 6. Enzim: Digestive fluid inside the pitcher converting prey into nitrogen
shot('enzim', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  K.bg(ctx, t);
  K.cam(ctx, 580, 1020, 1.25);
  K.kantongSemar(ctx, 580, 1020, 1.55, { t, lidOpen: 0.75 });
  // Rising nutrient bubbles inside the pitcher
  ctx.save();
  ctx.fillStyle = P.leafLt;
  for (let i = 0; i < 8; i++) {
    const u = (t * 0.4 + i * 0.15) % 1;
    ctx.globalAlpha = (1 - u) * 0.8;
    ctx.beginPath();
    ctx.arc(560 + (i % 3) * 20, 1140 - u * 160, 8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  K.herbariumLabel(ctx, 'CAIRAN ENZIM PENCERNA', 540, 260, {
    latin: 'Enzim Nepenthesin',
    sub: 'mengurai protein serangga menjadi hara nitrogen alami',
    alpha: env(t, a + 0.15, b, 0.3, 0.25),
  });
});

// 7. Simbiosis: Giant mountain pitcher plant & mutualism in Borneo
shot('simbiosis', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  K.bg(ctx, t);
  K.cam(ctx, 540, 960, 1.05);
  K.kantongSemar(ctx, 360, 1040, 1.25, { t, lidOpen: 1.2 });
  K.kantongSemar(ctx, 740, 1000, 1.4, { t: t + 0.5, lidOpen: 1.2 });
  K.herbariumLabel(ctx, 'SIMBIOSIS HUTAN PEGUNUNGAN', 540, 260, {
    latin: 'Nepenthes rajah & Nepenthes lowii',
    sub: 'bekerja sama dengan mamalia kecil penghuni gunung',
    size: 44,
    alpha: env(t, a + 0.15, b, 0.3, 0.25),
  });
});

// 8. Moral: Full botanical collage of Nepenthes & tropical leaves
shot('moral', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  K.bg(ctx, t);
  K.cam(ctx, 540, 960, lerp(1.06, 0.96, p));
  K.leaf(ctx, 210, 1140, 250, 75, -0.5, P.leafDk, { t, tape: true });
  K.leaf(ctx, 870, 1140, 250, 75, -2.6, P.leaf, { t, tape: true });
  K.kantongSemar(ctx, 580, 1020, 1.45, { t, lidOpen: 1.0 });
  K.leafCreature(ctx, 'kupu', { x: 310, y: 760, s: 0.85, t });
  K.herbariumLabel(ctx, 'PUSAT NEPENTHES DUNIA', 540, 260, {
    latin: 'Warisan Botani Nusantara',
    sub: 'kecerdasan evolusi tumbuhan di jantung hutan Indonesia',
    alpha: env(t, a + 0.15, b + 0.5, 0.35, 0.2),
  });
});

export function render(t, AM) {
  let s = SHOTS[0];
  for (const sh of SHOTS) if (t >= at(sh.id)) s = sh;
  const i = SHOTS.indexOf(s);
  const a = Math.max(0, at(s.id)), b = SHOTS[i + 1] ? at(SHOTS[i + 1].id) : AM.duration + 1;
  ctx.save(); s.fn(t, a, b); ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const since = t - a;
  if (i > 0 && since < 0.14) {
    ctx.fillStyle = `rgba(245,235,210,${0.25 * (1 - since / 0.14)})`;
    ctx.fillRect(0, 0, 1080, 1920);
  }
}

