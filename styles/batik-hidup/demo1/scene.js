// Batik Hidup demo: "Parang Rusak: Motif Larangan" — wax, dye and living motifs, 5 pictures (18.6 s).
import * as K from '/styles/batik-hidup/kit.js';
const { clamp, lerp, ease, prog, env, noise, hrand } = AM.lib;
const P = K.PAL, TAU = Math.PI * 2;

export const meta = { fps: 24, hold: 2, captions: { preset: 'elegant', y: 1500, size: 60, maxWords: 4, stroke: 0, box: { fill: 'rgba(36,20,10,.82)', pad: 16, radius: 6, border: '#d9a441', borderW: 2 } } };

let ctx;
const C = {};
const W = (id, w) => AM.wordTime(id, w);
export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
  K.parangTile('wax'); K.parangTile('dyed'); K.parangTile('dyed', P.indigo); K.parangTile('wax', P.indigo); K.crackle(); K.weave();
  AM.sfx('pencil', 0.05, { gain: 0.35 });
  AM.sfx('bubble', W('hook', 'terlarang') - 0.05, { gain: 0.4, pitch: 0.7 });
  AM.sfx('gong', W('hook', 'raja'), { gain: 0.5 });
  AM.sfx('whoosh', W('asal', 'menghantam'), { gain: 0.45, pitch: 0.7 });
  AM.sfx('pencil', C.makna.start, { gain: 0.3 });
  AM.sfx('bubble', W('makna', 'menyerah') - 0.1, { gain: 0.35, pitch: 0.6 });
  AM.sfx('gong', W('larang', 'Parang') - 0.05, { gain: 0.45, pitch: 1.1 });
  AM.sfx('chime', W('kini', 'memakainya'), { gain: 0.3 });
}

const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const at = (id) => C[id].start - 0.12;

// 1. Hook: the canting sweeps hot wax across white cloth; the dye floods in and PARANG appears — forbidden.
shot('hook', (t, a, b) => {
  const z = 1.25 - 0.12 * ease.inOutSine(clamp(t / 3.4));
  ctx.setTransform(z, 0, 0, z, 540 - 540 * z, 960 - 960 * z);
  const wax = 0.55 + 0.45 * ease.inOutSine(clamp(t / 1.4));
  const dye = ease.inOutCubic(clamp((t - W('hook', 'terlarang') + 0.15) / 0.9));
  const tip = K.cloth(ctx, t, { wax, dye, ox: t * 6, oy: 0 });
  ctx.setTransform(z, 0, 0, z, 540 - 540 * z, 960 - 960 * z);
  K.overlay(ctx, K.crackle(), 0.5 * clamp((t - W('hook', 'terlarang') - 0.6) / 0.6));
  if (wax < 1 || dye < 0.2) K.canting(ctx, tip[0] + Math.sin(t * 9) * 4, tip[1], t, { s: 1.4, rot: -0.35, glow: 1 - dye });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.overlay(ctx, K.weave(), 0.8);
  K.waxText(ctx, 'Parang Rusak', 540, 360, clamp((t - W('hook', 'motif')) / 0.7), { size: 110 });
  K.plaque(ctx, 'MOTIF LARANGAN', 540, 520, { size: 52, alpha: prog(t, W('hook', 'terlarang'), W('hook', 'terlarang') + 0.3) });
  if (t > W('hook', 'raja') - 0.1) { K.plaque(ctx, 'hanya untuk raja', 540, 640, { size: 42, alpha: prog(t, W('hook', 'raja') - 0.1, W('hook', 'raja') + 0.25) }); crown(540, 790, ease.outBack(clamp((t - W('hook', 'raja')) / 0.4), 2)); }
});
function crown(x, y, s) {
  if (s <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-90, 40); ctx.lineTo(-100, -40); ctx.lineTo(-50, 0); ctx.lineTo(0, -60); ctx.lineTo(50, 0); ctx.lineTo(100, -40); ctx.lineTo(90, 40); ctx.closePath();
  ctx.fillStyle = P.gold; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = P.cream; ctx.stroke();
  ctx.fillStyle = P.red; for (const xx of [-50, 0, 50]) { ctx.beginPath(); ctx.arc(xx, 18, 9, 0, TAU); ctx.fill(); }
  ctx.restore();
}

// 2. Origin: Senopati meditates on the south-coast rocks; waves strike the karang again and again... and turn into parang.
shot('asal', (t, a, b) => {
  const p = (t - a) / (b - a);
  const z = 1.05 + 0.08 * p;
  ctx.setTransform(z, 0, 0, z, 540 - 540 * z - 30 * p, 960 - 960 * z);
  // dusk sky: soga gradient with cream cecek stars
  const g = ctx.createLinearGradient(0, -200, 0, 900); g.addColorStop(0, P.sogaDk); g.addColorStop(1, P.sogaLt);
  ctx.fillStyle = g; ctx.fillRect(-200, -200, 1500, 1200);
  ctx.fillStyle = P.cream; for (let i = 0; i < 60; i++) { ctx.globalAlpha = 0.4 + 0.5 * Math.abs(Math.sin(t * 2 + i)); ctx.beginPath(); ctx.arc(hrand(i, 1) * 1100, hrand(i, 2) * 650, 2.5, 0, TAU); ctx.fill(); } ctx.globalAlpha = 1;
  ctx.beginPath(); ctx.arc(820, 380, 90, 0, TAU); ctx.fillStyle = '#f0d9a2'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = P.cream; ctx.stroke();
  K.sea(ctx, t, { y: 860, h: 1200, speed: 1.3 });
  // waves strike the rock in a rhythm; the big one on the word
  const big = W('asal', 'menghantam');
  const hits = [a + 0.4, a + 1.5, big, big + 1.0];
  let hit = 0; for (const h of hits) { const u = (t - h) / 0.9; if (u > 0 && u < 1) hit = Math.max(hit, u); }
  K.karang(ctx, 760, 1180, 1.2, hit, t);
  // the incoming crest
  for (const h of hits) { const u = (t - h + 0.5) / 0.5; if (u > 0 && u < 1) { ctx.save(); ctx.translate(lerp(1200, 900, u), 1080 - Math.sin(u * Math.PI) * 60); ctx.scale(1.6, 1.6); ctx.beginPath(); ctx.moveTo(-120, 40); ctx.quadraticCurveTo(-60, -80, 20, -60); ctx.arc(0, -40, 26, -0.6, Math.PI * 1.2); ctx.quadraticCurveTo(40, 0, 80, 40); ctx.closePath(); ctx.fillStyle = P.indigoLt; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = P.cream; ctx.stroke(); ctx.restore(); } }
  // Senopati on a flat rock at the left; opens his eyes and raises a hand when the wave strikes
  K.karang(ctx, 230, 1290, 0.9, 0, t);
  const wake = clamp((t - W('asal', 'terilhami') + 0.2) / 0.5);
  K.figure(ctx, 'senopati', { x: 230, y: 1180, s: 1.15, t, closed: wake < 0.5, arm: wake * 0.8, look: wake * 0.05 });
  // the waves become parang: a diagonal band of the motif grows from the rock
  const morph = clamp((t - (C.asal.end - 0.4)) / 0.6);
  if (morph > 0) {
    ctx.save(); ctx.beginPath(); ctx.moveTo(1300, 2000); ctx.lineTo(1300 - morph * 2200, 2000); ctx.lineTo(1300, 2000 - morph * 2200); ctx.closePath(); ctx.clip();
    K.motifFill(ctx, K.parangTile('dyed', P.indigo)); ctx.fillRect(-200, -200, 1500, 2400); ctx.restore();
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.plaque(ctx, 'Panembahan Senopati', 540, 250, { size: 50, sub: 'pendiri Mataram', alpha: prog(t, W('asal', 'Panembahan') - 0.1, W('asal', 'Panembahan') + 0.3) });
  K.overlay(ctx, K.weave(), 0.7);
});

// 3. Meaning: one unbroken line — the canting never lifts; then the cloth is dipped in indigo and the wax cracks.
shot('makna', (t, a, b) => {
  const lt = t - a, p = lt / (b - a);
  const z = 1.75 - 0.3 * ease.inOutSine(p);
  const sweep = clamp(0.1 + lt / 2.3);
  const dyeT = W('makna', 'menyerah') - 0.6;
  const dye = ease.inOutCubic(clamp((t - dyeT) / 0.8));
  // camera follows the canting tip along the diagonal
  const R = { x: -700, y: -700, w: 2480, h: 3320 };
  const D = R.w + R.h, f = (0.3 + sweep * 0.32) * D, fx = R.x + clamp(f - R.h * 0.5, 0, R.w), fy = R.y + Math.min(R.h, f - (fx - R.x));
  const cx = fx + 60, cy = fy - 140;
  ctx.setTransform(z, 0, 0, z, 540 - cx * z, 960 - cy * z);
  const tip = K.cloth(ctx, t, { ...R, wax: 0.3 + sweep * 0.32, dye, ground: P.indigo, tiles: { wax: K.parangTile('wax', P.indigo), dyed: K.parangTile('dyed', P.indigo) } });
  ctx.setTransform(z, 0, 0, z, 540 - cx * z, 960 - cy * z);
  if (dye < 0.5) K.canting(ctx, tip[0], tip[1], t, { s: 1.1, rot: -0.4, glow: 1 });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.overlay(ctx, K.crackle(P.indigoDk), 0.55 * clamp((t - dyeT - 0.6) / 0.5));
  K.overlay(ctx, K.weave(), 0.7);
  K.plaque(ctx, 'tak pernah putus', 540, 260, { size: 54, alpha: prog(t, W('makna', 'putus') - 0.15, W('makna', 'putus') + 0.2) });
});

// 4. The decree: the Sultan in Parang Rusak under the royal parasol; a servant bows.
shot('larang', (t, a, b) => {
  const p = (t - a) / (b - a);
  const z = 1.0 + 0.1 * ease.inOutSine(p);
  ctx.setTransform(z, 0, 0, z, 540 - 560 * z, 960 - 1000 * z);
  ctx.fillStyle = P.soga; ctx.fillRect(-300, -300, 1700, 2600);
  K.motifFill(ctx, K.kawungTile(P.sogaDk, P.cream, P.soga, 110), { ox: 0, oy: 0 }); ctx.globalAlpha = 0.35; ctx.fillRect(-300, -300, 1700, 2600); ctx.globalAlpha = 1;
  K.regol(ctx, 560, 1000, 1.25);
  ctx.save(); ctx.beginPath(); ctx.rect(-300, 1000, 1700, 1000); K.motifFill(ctx, K.parangTile('dyed', P.sogaDk, 0.6)); ctx.fill(); ctx.restore();
  K.payung(ctx, 400, 470, 1.0, t);
  const dec = clamp((t - W('larang', 'menetapkan') + 0.1) / 0.5);
  // glow of the forbidden kain on the word
  const gl = env(t, W('larang', 'Parang') - 0.1, b, 0.3, 0.3);
  if (gl > 0) { const gg = ctx.createRadialGradient(410, 1200, 20, 410, 1200, 260); gg.addColorStop(0, `rgba(255,214,120,${0.55 * gl})`); gg.addColorStop(1, 'rgba(255,214,120,0)'); ctx.fillStyle = gg; ctx.fillRect(150, 940, 520, 520); }
  K.figure(ctx, 'sultan', { x: 410, y: 1420, s: 1.0, t, arm: dec * 1.9 + Math.sin(t * 2) * 0.03, cloth: K.parangTile('dyed', P.soga, 0.45) });
  K.figure(ctx, 'abdi', { x: 800, y: 1420, s: 1.0, face: -1, t, bow: clamp((t - W('larang', 'raja') + 0.3) / 0.4) });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.plaque(ctx, 'Sultan Hamengku Buwono I', 540, 230, { size: 46, sub: 'Yogyakarta, 1785', alpha: prog(t, a + 0.1, a + 0.4) });
  K.plaque(ctx, 'PARANG RUSAK', 540, 400, { size: 54, sub: 'hanya untuk raja', alpha: prog(t, W('larang', 'Parang') - 0.1, W('larang', 'Parang') + 0.25) });
  K.overlay(ctx, K.weave(), 0.7);
});

// 5. Today: outside the palace, anyone wears it — three people walk across a cloth framed by parang bands.
shot('kini', (t, a, b) => {
  const lt = t - a, end = C.kini.end;
  const z = 1.0 + 0.05 * clamp(lt / 3);
  ctx.setTransform(z, 0, 0, z, 540 - 540 * z, 960 - 960 * z);
  ctx.fillStyle = P.mori; ctx.fillRect(-100, -100, 1300, 2200);
  for (const [y0, h] of [[-100, 520], [1460, 700]]) { ctx.save(); ctx.beginPath(); ctx.rect(-100, y0, 1300, h); K.motifFill(ctx, K.parangTile('dyed', P.soga), { ox: -lt * 40 }); ctx.fill(); ctx.restore(); }
  K.megaMendung(ctx, 860, 640, 0.8, t); K.megaMendung(ctx, 200, 760, 0.55, t + 2);
  const stop = end + 0.2;
  const walkT = Math.min(t, stop) - a;
  const people = [
    { x: -60, top: K.parangTile('dyed', P.indigo, 0.35), kain: null, cap: 'hair', bun: true, legs: P.indigoDk, s: 0.9 },
    { x: -330, top: K.parangTile('dyed', P.soga, 0.35), kain: null, cap: 'hair', legs: P.sogaDk, s: 1.0 },
    { x: -560, top: P.red, kain: K.parangTile('dyed', P.soga, 0.4), cap: 'blangkon', legs: P.skin, s: 0.92 },
  ];
  people.forEach((q, i) => {
    const x = q.x * 1.2 + walkT * 260;
    const walking = t < stop;
    K.figure(ctx, 'walker', { x, y: 1450, s: q.s * 1.3, t, phase: walking ? walkT * 1.6 + i * 0.3 : 0, top: q.top, kain: q.kain, cloth: q.kain || undefined, cap: q.cap, bun: q.bun, legs: q.legs, arm: walking ? 0 : 0.2 });
  });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.plaque(ctx, 'di luar keraton', 540, 300, { size: 50, alpha: prog(t, W('kini', 'luar') - 0.1, W('kini', 'luar') + 0.25) });
  K.waxText(ctx, 'siapa pun', 540, 440, clamp((t - W('kini', 'siapa') + 0.05) / 0.5), { size: 100 });
  K.overlay(ctx, K.weave(), 0.7);
  const close = clamp((t - (end + 0.7)) / 0.45);
  if (close > 0) { ctx.fillStyle = `rgba(30,15,6,${close * 0.5})`; ctx.fillRect(0, 0, 1080, 1920); }
});

export function render(t, AM) {
  let s = SHOTS[0];
  for (const sh of SHOTS) if (t >= at(sh.id)) s = sh;
  const i = SHOTS.indexOf(s);
  const a = Math.max(0, at(s.id)), b = SHOTS[i + 1] ? at(SHOTS[i + 1].id) : AM.duration + 1;
  ctx.save(); s.fn(t, a, b); ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  // a warm wax flash on every cut
  const since = t - a;
  if (i > 0 && since < 0.16) { ctx.fillStyle = `rgba(255,236,190,${0.35 * (1 - since / 0.16)})`; ctx.fillRect(0, 0, 1080, 1920); }
  AM.lib.vignette(ctx, { strength: 0.45, inner: 0.5 });
}
