// Maura Motion style kit: KARTUN JADUL (1920s–30s black-and-white rubber-hose cartoon).
// Signature: noodle (rubber-hose) limbs with white gloves, pie-cut eyes, everything bouncing to the ragtime beat,
// film grain + flicker + gate weave + scratches, art-deco title cards, smear frames and the iris-out ending.
// Original characters: Kancil (mouse-deer, pointed ears, long snout), Pak Tani (round farmer with a caping hat and a
// big moustache), Belang (spotted dog), the sticky orang-orangan, cucumbers with faces.
import { clamp, lerp, ease, hrand, noise, mulberry32, TAU } from '/engine/lib/core.js';
import { makeCanvas, cached } from '/engine/lib/draw.js';

export const PAL = { ink: '#141210', paper: '#ece6d6', g1: '#d6cfbd', g2: '#a8a294', g3: '#77726a', g4: '#4a4640', g5: '#2a2724', white: '#fbf8ef' };
export const BPM = 104;
/** Beat phase 0..1 and a bounce value (0..1, peaks on the beat). */
export const beat = (t, mult = 1) => { const ph = (t * BPM / 60 * mult) % 1; return { ph, b: Math.pow(1 - ph, 3), s: Math.sin(ph * TAU) }; };
/** On-the-beat squash/stretch: [sx, sy]. */
export const squash = (t, amt = 0.06, mult = 1) => { const s = Math.sin(t * BPM / 60 * mult * TAU); return [1 + s * amt, 1 - s * amt]; };
/** Line boil: tiny per-drawing jitter (12 fps). */
export const boil = (t, seed = 0, amp = 1.2) => [(hrand(Math.floor(t * 12), seed) - 0.5) * 2 * amp, (hrand(Math.floor(t * 12), seed + 7) - 0.5) * 2 * amp];

const LW = 7;
function ink(g, path, fill, lw = LW) {
  if (fill) { g.fillStyle = fill; g.fill(path); }
  if (lw) { g.lineWidth = lw; g.strokeStyle = PAL.ink; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(path); }
}
const P = () => new Path2D();
const ell = (x, y, rx, ry, r = 0) => { const p = P(); p.ellipse(x, y, rx, ry, r, 0, TAU); return p; };

// ---------------------------------------------------------------- parts
/** Rubber-hose limb: a single thick noodle from (x0,y0) to (x1,y1), bowing by `bow` (perpendicular px). */
export function hose(g, x0, y0, x1, y1, { bow = 0, w = 15, col = PAL.ink } = {}) {
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, L = Math.hypot(x1 - x0, y1 - y0) || 1;
  const nx = -(y1 - y0) / L, ny = (x1 - x0) / L;
  g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round';
  g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(mx + nx * bow, my + ny * bow, x1, y1); g.stroke();
}
/** White cartoon glove (cuff + puffy hand + 3 back lines). ang = pointing direction. pose: 'open'|'fist'|'point'|'wave' */
export function glove(g, x, y, ang, s = 1, pose = 'open') {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
  const cuff = P(); cuff.moveTo(-6, -20); cuff.lineTo(10, -24); cuff.lineTo(10, 24); cuff.lineTo(-6, 20); cuff.closePath();
  ink(g, cuff, PAL.white, 5);
  const h = P();
  if (pose === 'fist') h.ellipse(30, 0, 26, 24, 0, 0, TAU);
  else if (pose === 'point') { h.ellipse(26, 0, 22, 22, 0, 0, TAU); h.roundRect(26, -10, 44, 18, 9); }
  else { h.ellipse(30, 0, 28, 30, 0, 0, TAU); for (let i = 0; i < 3; i++) h.roundRect(40, -24 + i * 17, 30, 15, 7.5); h.ellipse(26, -30, 9, 14, -0.5, 0, TAU); }
  g.fillStyle = PAL.white; g.fill(h); g.lineWidth = 5; g.strokeStyle = PAL.ink; g.lineJoin = 'round'; g.stroke(h); g.fill(h);
  g.lineWidth = 3; for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(14, i * 9); g.lineTo(28, i * 9); g.stroke(); }
  g.restore();
}
/** Pie-cut eye: white oval, black pupil with a wedge cut out. blink 0..1, look [-1..1, -1..1]. */
export function pieEye(g, x, y, rx, ry, { look = [0, 0], blink = 0, wide = 1, pupil = 0.55, angry = 0 } = {}) {
  const open = clamp(1 - blink);
  if (open < 0.12) { g.strokeStyle = PAL.ink; g.lineWidth = 5; g.beginPath(); g.moveTo(x - rx, y); g.quadraticCurveTo(x, y + ry * 0.4, x + rx, y); g.stroke(); return; }
  const e = ell(x, y, rx * wide, ry * open * wide); ink(g, e, PAL.white, 5);
  g.save(); g.clip(e);
  const px = x + look[0] * rx * 0.45, py = y + look[1] * ry * 0.35 + ry * 0.1;
  g.fillStyle = PAL.ink; g.beginPath(); g.ellipse(px, py, rx * pupil, ry * pupil * 1.25, 0, 0, TAU); g.fill();
  // the pie cut
  g.fillStyle = PAL.white; g.beginPath(); g.moveTo(px + rx * 0.05, py - ry * 0.1); g.lineTo(px + rx * 0.6, py - ry * 0.75); g.lineTo(px + rx * 0.05, py - ry * 0.85); g.closePath(); g.fill();
  if (angry) { g.fillStyle = PAL.ink; g.beginPath(); g.moveTo(x - rx * 1.2, y - ry * 1.2); g.lineTo(x + rx * 1.2, y - ry * (1.2 - angry * 0.9)); g.lineTo(x + rx * 1.2, y - ry * 2); g.lineTo(x - rx * 1.2, y - ry * 2); g.fill(); }
  g.restore();
}

// ---------------------------------------------------------------- characters
/**
 * Bipedal rubber-hose critter. who: 'kancil' | 'belang'. Local: feet on y=0, facing right, ~460 tall at s=1.
 * o: { t, look, blink, mouth (0..1 open), smile, armL:[x,y,pose], armR:[x,y,pose] (hand targets, local), walk (phase or -1),
 *      sq (extra squash), lean, face: 1|-1, wink, sweat, ears (0..1 droop), tongue }
 */
export function critter(ctx, who, x, y, s, o = {}) {
  const { t = 0, look = [0.3, 0], blink = 0, mouth = 0, smile = 0.6, walk = -1, sq = 0, lean = 0, face = 1, wink = 0, ears = 0, bounce = 1 } = o;
  const dog = who === 'belang';
  const bt = beat(t);
  const bob = (walk >= 0 ? Math.abs(Math.sin(walk * TAU)) * -18 : -bt.b * 10 * bounce);
  const [sx0, sy0] = squash(t, 0.035 * bounce);
  const SX = sx0 * (1 + sq), SY = sy0 * (1 - sq);
  const [jx, jy] = boil(t, who.length);
  ctx.save(); ctx.translate(x + jx, y + jy); ctx.scale(s * face, s);
  // legs
  const hip = -100 + bob;
  for (const sd of [-1, 1]) {
    const ph = walk >= 0 ? Math.sin(walk * TAU + (sd > 0 ? 0 : Math.PI)) : 0;
    const fx = sd * 30 + ph * 46, fy = walk >= 0 ? -Math.max(0, ph) * 26 : 0;
    hose(ctx, sd * 22, hip, fx, fy - 10, { bow: -sd * 10 - ph * 20, w: 13 });
    // hoof / paw shoe
    const sh = ell(fx + 14, fy - 6, dog ? 34 : 24, dog ? 18 : 14);
    ink(ctx, sh, dog ? PAL.white : PAL.ink, 5);
    if (!dog) { ctx.fillStyle = PAL.white; ctx.fillRect(fx - 4, fy - 22, 30, 6); }
  }
  ctx.save(); ctx.translate(0, hip); ctx.rotate(lean); ctx.scale(SX, SY);
  // tail
  const tw = Math.sin(t * (dog ? 16 : 6)) * (dog ? 0.5 : 0.2);
  ctx.save(); ctx.translate(-48, -40); ctx.rotate(-0.8 + tw);
  if (dog) hose(ctx, 0, 0, -10, -60, { bow: 14, w: 12 }); else ink(ctx, ell(-10, -12, 18, 26, -0.4), PAL.white, 5);
  ctx.restore();
  // body bean
  const body = P(); body.ellipse(0, -70, 58, 80, 0, 0, TAU);
  ink(ctx, body, dog ? PAL.white : PAL.ink);
  if (dog) { ctx.save(); ctx.clip(body); ctx.fillStyle = PAL.ink; ctx.beginPath(); ctx.ellipse(-30, -90, 30, 26, 0.4, 0, TAU); ctx.ellipse(28, -30, 22, 18, 0, 0, TAU); ctx.fill(); ctx.restore(); }
  else ink(ctx, ell(12, -58, 34, 52), PAL.white, 0);
  // arms (behind/front handled simply: back arm first)
  const arm = (sd, tgt) => {
    const [hx, hy, pose = 'open'] = tgt || [sd * 70, 10, 'open'];
    const shx = sd * 34, shy = -118;
    hose(ctx, shx, shy, hx, hy, { bow: sd * 18, w: 13 });
    glove(ctx, hx, hy, Math.atan2(hy - shy, hx - shx), 0.9, pose);
  };
  arm(-1, o.armL);
  // head
  ctx.save(); ctx.translate(14, -168); ctx.rotate(-lean * 0.5 + Math.sin(t * 2.2) * 0.03);
  const droop = ears;
  if (dog) {
    for (const sd of [-1, 1]) { const ear = P(); ear.ellipse(sd * 46 - 6, 0 + droop * 20, 22, 54, sd * (0.3 + Math.sin(t * 5 + sd) * 0.1), 0, TAU); ink(ctx, ear, PAL.ink); }
    const hd = P(); hd.ellipse(0, -40, 62, 58, 0, 0, TAU); ink(ctx, hd, PAL.white);
    const mz = P(); mz.ellipse(40, -14, 50, 34, 0, 0, TAU); ink(ctx, mz, PAL.white);
    ctx.fillStyle = PAL.ink; ctx.beginPath(); ctx.ellipse(-26, -62, 24, 20, 0.3, 0, TAU); ctx.fill();
    ink(ctx, ell(82, -26, 18, 14), PAL.ink, 4);
    ctx.fillStyle = PAL.white; ctx.beginPath(); ctx.ellipse(77, -31, 5, 3, 0, 0, TAU); ctx.fill();
    pieEye(ctx, 6, -62, 14, 22, { look, blink }); pieEye(ctx, 34, -60, 14, 22, { look, blink });
    // collar
    ctx.fillStyle = PAL.ink; ctx.fillRect(-40, 14, 80, 12);
    mouthShape(ctx, 54, 4, mouth, smile, o.tongue);
  } else {
    // long pointed ears
    for (const sd of [-1, 1]) {
      const ear = P(); const ex = -20 + sd * 16, a = -0.5 - sd * 0.25 + droop * 1.2 + Math.sin(t * 4 + sd) * 0.06;
      ctx.save(); ctx.translate(ex, -60); ctx.rotate(a);
      ear.moveTo(-14, 0); ear.quadraticCurveTo(-20, -60, 0, -96); ear.quadraticCurveTo(20, -60, 14, 0); ear.closePath(); ink(ctx, ear, PAL.ink);
      const inner = P(); inner.moveTo(-6, -8); inner.quadraticCurveTo(-8, -50, 0, -74); inner.quadraticCurveTo(8, -50, 6, -8); inner.closePath(); ctx.fillStyle = PAL.g2; ctx.fill(inner);
      ctx.restore();
    }
    const hd = P(); hd.moveTo(-50, -30); hd.bezierCurveTo(-56, -90, 20, -100, 44, -60); hd.bezierCurveTo(70, -44, 104, -36, 120, -22); hd.bezierCurveTo(130, -6, 110, 10, 80, 8); hd.bezierCurveTo(40, 14, -46, 30, -50, -30); hd.closePath();
    ink(ctx, hd, PAL.ink);
    // white face mask
    const mask = P(); mask.moveTo(-4, -60); mask.bezierCurveTo(20, -76, 50, -60, 60, -44); mask.bezierCurveTo(90, -34, 112, -26, 112, -14); mask.bezierCurveTo(108, 2, 60, 6, 30, 4); mask.bezierCurveTo(0, 2, -16, -30, -4, -60); mask.closePath();
    ctx.fillStyle = PAL.white; ctx.fill(mask);
    ink(ctx, ell(118, -20, 13, 11), PAL.ink, 3);
    ctx.fillStyle = PAL.white; ctx.beginPath(); ctx.ellipse(114, -24, 4, 3, 0, 0, TAU); ctx.fill();
    pieEye(ctx, 18, -46, 14, 23, { look, blink });
    if (wink > 0.5) { ctx.strokeStyle = PAL.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(36, -46); ctx.quadraticCurveTo(48, -58, 60, -46); ctx.stroke(); }
    else pieEye(ctx, 48, -44, 14, 23, { look, blink });
    mouthShape(ctx, 74, -2, mouth, smile, o.tongue);
  }
  ctx.restore();
  arm(1, o.armR);
  ctx.restore();
  if (o.sweat) { ctx.fillStyle = PAL.white; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 4; for (let i = 0; i < 2; i++) { const k = (t * 2 + i * 0.5) % 1; ctx.beginPath(); ctx.ellipse(-40 - i * 30, -330 + k * 60, 8, 12, 0, 0, TAU); ctx.fill(); ctx.stroke(); } }
  ctx.restore();
}
function mouthShape(g, x, y, open, smile, tongue) {
  g.strokeStyle = PAL.ink; g.lineWidth = 5; g.lineCap = 'round';
  if (open > 0.1) {
    const m = P(); m.moveTo(x - 26, y - 4); m.quadraticCurveTo(x, y + 4 + smile * 4, x + 22, y - 6); m.quadraticCurveTo(x + 10, y + 34 * open, x - 4, y + 30 * open); m.quadraticCurveTo(x - 22, y + 20 * open, x - 26, y - 4); m.closePath();
    ink(g, m, PAL.ink, 4);
    g.save(); g.clip(m); g.fillStyle = PAL.g3; g.beginPath(); g.ellipse(x, y + 30 * open, 14, 10, 0, 0, TAU); g.fill(); g.restore();
  } else { g.beginPath(); g.moveTo(x - 26, y - 4 - smile * 6); g.quadraticCurveTo(x - 4, y + 10 * smile + 4, x + 20, y - 8 - smile * 6); g.stroke(); }
  if (tongue) { const tp = P(); tp.ellipse(x + 4, y + 22, 10, 18, 0.2, 0, TAU); ink(g, tp, PAL.g1, 4); }
}

/** Pak Tani: round farmer, caping hat, big moustache, rubber-hose arms. ~680 tall. o like critter + { steam, angry, armL/armR } */
export function tani(ctx, x, y, s, o = {}) {
  const { t = 0, look = [0.3, 0], blink = 0, mouth = 0, angry = 0, walk = -1, face = 1, steam = 0, sq = 0, lean = 0 } = o;
  const bt = beat(t);
  const bob = walk >= 0 ? Math.abs(Math.sin(walk * TAU)) * -20 : -bt.b * 12;
  const [sx0, sy0] = squash(t, 0.03);
  const [jx, jy] = boil(t, 31);
  ctx.save(); ctx.translate(x + jx, y + jy); ctx.scale(s * face, s);
  for (const sd of [-1, 1]) {
    const ph = walk >= 0 ? Math.sin(walk * TAU + (sd > 0 ? 0 : Math.PI)) : 0;
    const fx = sd * 50 + ph * 50, fy = walk >= 0 ? -Math.max(0, ph) * 24 : 0;
    hose(ctx, sd * 50, -150 + bob, fx, fy - 14, { bow: -sd * 12, w: 18 });
    ink(ctx, ell(fx + 20, fy - 12, 46, 20), PAL.ink, 5);
  }
  ctx.save(); ctx.translate(0, -150 + bob); ctx.rotate(lean); ctx.scale(sx0 * (1 + sq), sy0 * (1 - sq));
  // pants + shirt egg
  const body = P(); body.ellipse(0, -140, 138, 160, 0, 0, TAU); ink(ctx, body, PAL.g1);
  ctx.save(); ctx.clip(body); ctx.fillStyle = PAL.ink; ctx.fillRect(-200, -60, 400, 200);
  ctx.fillStyle = PAL.g2; ctx.beginPath(); ctx.roundRect(40, -180, 50, 46, 6); ctx.fill(); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 3; ctx.setLineDash([6, 5]); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = PAL.ink; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0, -230 + i * 50, 7, 0, TAU); ctx.fill(); }
  ctx.restore(); ink(ctx, body, null);
  const arm = (sd, tgt) => {
    const [hx, hy, pose = 'open'] = tgt || [sd * 170, -30, 'open'];
    hose(ctx, sd * 110, -220, hx, hy, { bow: sd * 24, w: 17 });
    glove(ctx, hx, hy, Math.atan2(hy + 220, hx - sd * 110), 1.15, pose);
  };
  arm(-1, o.armL);
  // head
  ctx.save(); ctx.translate(0, -330); ctx.rotate(Math.sin(t * 2.4) * 0.03 + angry * Math.sin(t * 40) * 0.03);
  const hd = ell(0, -40, 92, 84); ink(ctx, hd, PAL.white);
  if (angry > 0) { ctx.save(); ctx.clip(hd); ctx.globalAlpha = 0.6 * angry; ctx.fillStyle = PAL.g3; ctx.fillRect(-100, -40 - 120 * angry + 120, 200, 200); ctx.restore(); ink(ctx, hd, null); }
  for (const sd of [-1, 1]) ink(ctx, ell(sd * 92, -36, 18, 26), PAL.white, 5);
  pieEye(ctx, -30, -60, 17, 26, { look, blink, angry }); pieEye(ctx, 26, -60, 17, 26, { look, blink, angry });
  // nose + moustache
  ink(ctx, ell(8, -20, 26, 22), PAL.g2, 5);
  const ms = P(); ms.moveTo(8, -4);
  ms.bezierCurveTo(-30, -20, -70, -2, -96, -26); ms.bezierCurveTo(-80, 12, -30, 18, 8, 4);
  ms.bezierCurveTo(46, 18, 96, 12, 112, -26); ms.bezierCurveTo(86, -2, 46, -20, 8, -4); ms.closePath();
  ink(ctx, ms, PAL.ink, 3);
  if (mouth > 0.1) { const m = ell(8, 26, 30, 22 * mouth); ink(ctx, m, PAL.ink, 4); }
  // caping (conical hat)
  ctx.save(); ctx.translate(0, -104); ctx.rotate(Math.sin(t * BPM / 60 * TAU) * 0.04);
  const hat = P(); hat.moveTo(-170, 10); hat.quadraticCurveTo(0, -150, 170, 10); hat.quadraticCurveTo(0, 30, -170, 10); hat.closePath();
  ink(ctx, hat, PAL.g1);
  ctx.save(); ctx.clip(hat); ctx.strokeStyle = PAL.g3; ctx.lineWidth = 3; for (let i = -6; i <= 6; i++) { ctx.beginPath(); ctx.moveTo(0, -80); ctx.lineTo(i * 30, 30); ctx.stroke(); } ctx.restore();
  ink(ctx, hat, null);
  ctx.restore();
  ctx.restore();
  arm(1, o.armR);
  ctx.restore();
  // steam from the ears
  if (steam > 0) for (const sd of [-1, 1]) for (let i = 0; i < 4; i++) {
    const k = (t * 1.8 + i * 0.25) % 1;
    ctx.globalAlpha = steam * (1 - k);
    ink(ctx, ell(sd * (110 + k * 60), -400 + bob - k * 160, 18 + k * 26, 14 + k * 20), PAL.white, 5);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

/** The sticky scarecrow (orang-orangan) dripping getah nangka. drip 0..1 animates the sap. */
export function scarecrow(ctx, x, y, s, { t = 0, wobble = 0, face = 1 } = {}) {
  const [jx, jy] = boil(t, 77);
  ctx.save(); ctx.translate(x + jx, y + jy); ctx.scale(s * face, s); ctx.rotate(Math.sin(t * 20) * 0.04 * wobble);
  ctx.fillStyle = PAL.g4; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 6;
  const pole = P(); pole.rect(-12, -600, 24, 600); ink(ctx, pole, PAL.g3);
  const bar = P(); bar.rect(-230, -440, 460, 22); ink(ctx, bar, PAL.g3);
  const shirt = P(); shirt.moveTo(-200, -450); shirt.lineTo(200, -450); shirt.lineTo(150, -200); shirt.lineTo(170, -170); shirt.lineTo(-170, -170); shirt.lineTo(-150, -200); shirt.closePath();
  ink(ctx, shirt, PAL.g2);
  ctx.save(); ctx.clip(shirt); ctx.strokeStyle = PAL.g4; ctx.lineWidth = 3; for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(-200 + i * 56, -450); ctx.lineTo(-180 + i * 50, -170); ctx.stroke(); } ctx.restore();
  // straw tufts at the sleeves
  for (const sd of [-1, 1]) for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(sd * 200, -440 + i * 6); ctx.lineTo(sd * (236 + i * 4), -460 + i * 14); ctx.stroke(); }
  const headP = ell(0, -540, 78, 84); ink(ctx, headP, PAL.g1);
  ctx.lineWidth = 5; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sd * 30 - 12, -572); ctx.lineTo(sd * 30 + 12, -548); ctx.moveTo(sd * 30 + 12, -572); ctx.lineTo(sd * 30 - 12, -548); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-40, -510); ctx.quadraticCurveTo(0, -484, 40, -510); ctx.stroke();
  for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * 12, -506 + Math.abs(i) * -2); ctx.lineTo(i * 12, -494 + Math.abs(i) * -2); ctx.stroke(); }
  const hat = P(); hat.moveTo(-130, -600); hat.quadraticCurveTo(0, -720, 130, -600); hat.quadraticCurveTo(0, -584, -130, -600); hat.closePath(); ink(ctx, hat, PAL.g1);
  // glossy black sap blobs with drips
  for (let i = 0; i < 7; i++) {
    const bx = -150 + hrand(i, 1) * 300, by = -430 + hrand(i, 2) * 220, r = 18 + hrand(i, 3) * 20;
    const dl = 20 + ((t * 30 + i * 17) % 60);
    const d = P(); d.ellipse(bx, by, r, r * 0.8, 0, 0, TAU); d.roundRect(bx - 6, by, 12, dl, 6); d.ellipse(bx, by + dl, 9, 11, 0, 0, TAU);
    ctx.fillStyle = PAL.ink; ctx.fill(d);
    ctx.fillStyle = PAL.white; ctx.beginPath(); ctx.ellipse(bx - r * 0.35, by - r * 0.3, r * 0.25, r * 0.15, -0.5, 0, TAU); ctx.fill();
  }
  ctx.restore();
}
/** Cucumber with a face, bouncing on the beat. */
export function timun(ctx, x, y, s, { t = 0, rot = 0, phase = 0, face = true, scared = 0 } = {}) {
  const bt = beat(t + phase / (BPM / 60));
  const hop = bt.b * 26;
  const [sx, sy] = [1 + bt.b * 0.12, 1 - bt.b * 0.12];
  const [jx, jy] = boil(t, phase * 13 + 3);
  ctx.save(); ctx.translate(x + jx, y - hop + jy); ctx.rotate(rot + Math.sin(t * 3 + phase) * 0.08); ctx.scale(s * sx, s * sy);
  const b = P(); b.ellipse(0, 0, 40, 100, 0, 0, TAU); ink(ctx, b, PAL.g3, 6);
  ctx.save(); ctx.clip(b); ctx.fillStyle = PAL.g2; ctx.fillRect(-12, -100, 14, 200); ctx.fillRect(18, -100, 8, 200);
  ctx.fillStyle = PAL.ink; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(-24 + hrand(i, 5) * 48, -80 + i * 20, 3, 0, TAU); ctx.fill(); } ctx.restore();
  ink(ctx, ell(0, -102, 10, 8), PAL.g4, 4);
  if (face) {
    pieEye(ctx, -12, -30, 9, 15, { look: [0.2, 0], wide: 1 + scared * 0.3 }); pieEye(ctx, 12, -30, 9, 15, { look: [0.2, 0], wide: 1 + scared * 0.3 });
    ctx.strokeStyle = PAL.ink; ctx.lineWidth = 4; ctx.beginPath();
    if (scared) { ctx.ellipse(0, -2, 8, 10, 0, 0, TAU); } else { ctx.moveTo(-12, -6); ctx.quadraticCurveTo(0, 6, 12, -6); }
    ctx.stroke();
  }
  ctx.restore();
}
/** Bamboo chicken cage. door 0..1 open (swings). */
export function cage(ctx, x, y, s, { t = 0, door = 0 } = {}) {
  const [jx, jy] = boil(t, 55);
  ctx.save(); ctx.translate(x + jx, y + jy); ctx.scale(s, s);
  const back = P(); back.roundRect(-230, -380, 460, 380, 20); ctx.fillStyle = PAL.g4; ctx.fill(back);
  ctx.restore();
}
export function cageFront(ctx, x, y, s, { t = 0, door = 0 } = {}) {
  const [jx, jy] = boil(t, 55);
  ctx.save(); ctx.translate(x + jx, y + jy); ctx.scale(s, s);
  for (const yy of [-380, -190, 0]) { const r = P(); r.roundRect(-250, yy - 14, 500, 28, 12); ink(ctx, r, PAL.g2, 6); }
  for (let i = 0; i < 9; i++) {
    const bx = -220 + i * 55;
    if (bx > 40 && bx < 180) continue; // door gap
    const sl = P(); sl.roundRect(bx - 10, -390, 20, 400, 10); ink(ctx, sl, PAL.g1, 5);
    ctx.strokeStyle = PAL.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx - 10, -200); ctx.lineTo(bx + 10, -200); ctx.stroke();
  }
  // door (hinged on its left at x=40)
  ctx.save(); ctx.translate(40, -190); ctx.scale(Math.cos(door * 1.4), 1);
  for (let i = 0; i < 3; i++) { const sl = P(); sl.roundRect(14 + i * 50 - 10, -170, 20, 340, 10); ink(ctx, sl, PAL.g1, 5); }
  const fr = P(); fr.rect(0, -180, 150, 360); ctx.lineWidth = 8; ctx.strokeStyle = PAL.ink; ctx.stroke(fr);
  ctx.restore();
  // latch
  ink(ctx, ell(190, -190, 14, 10), PAL.white, 5);
  ctx.restore();
}

// ---------------------------------------------------------------- places
/** Night or day sky with a big moon / sun with a face-less disc, cloud puffs. */
export function sky(ctx, t, { night = true, moonX = 800, moonY = 360 } = {}) {
  ctx.fillStyle = night ? PAL.g5 : PAL.g1; ctx.fillRect(-300, -300, 1700, 2600);
  if (night) {
    ctx.fillStyle = PAL.white; for (let i = 0; i < 40; i++) { const x = hrand(i, 1) * 1080, y = hrand(i, 2) * 900, tw = 0.5 + 0.5 * Math.sin(t * 4 + i); ctx.globalAlpha = tw; ctx.save(); ctx.translate(x, y); ctx.rotate(t + i); ctx.fillRect(-7, -1.5, 14, 3); ctx.fillRect(-1.5, -7, 3, 14); ctx.restore(); } ctx.globalAlpha = 1;
    const b = beat(t).b;
    const m = ell(moonX, moonY, 120 + b * 6, 120 - b * 6); ink(ctx, m, PAL.paper, 7);
    ctx.fillStyle = PAL.g1; for (const [dx, dy, r] of [[-30, -20, 22], [40, 30, 16], [10, 60, 12]]) { ctx.beginPath(); ctx.arc(moonX + dx, moonY + dy, r, 0, TAU); ctx.fill(); }
  }
  for (let i = 0; i < 3; i++) {
    const cx = ((i * 420 + t * 30) % 1500) - 200, cy = 220 + i * 160;
    const c = P(); for (const [dx, dy, r] of [[0, 0, 60], [60, -20, 70], [120, 0, 56], [60, 20, 60]]) c.ellipse(cx + dx, cy + dy, r, r * 0.8, 0, 0, TAU);
    ctx.fillStyle = night ? PAL.g4 : PAL.white; ctx.fill(c);
  }
}
/** Cucumber garden: ground, bamboo trellis rows with vines, fence. */
export function kebun(ctx, t, { y = 1300, night = true } = {}) {
  ctx.fillStyle = night ? PAL.g4 : PAL.g2; ctx.fillRect(-300, y, 1700, 1000);
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-300, y); ctx.lineTo(1400, y); ctx.stroke();
  // furrows
  ctx.lineWidth = 4; ctx.strokeStyle = night ? PAL.g5 : PAL.g3;
  for (let i = 1; i < 7; i++) { const yy = y + i * i * 14; ctx.beginPath(); ctx.moveTo(-300, yy); ctx.lineTo(1400, yy); ctx.stroke(); }
  // fence
  for (let i = -1; i < 12; i++) { const fx = i * 110; const f = P(); f.moveTo(fx - 16, y); f.lineTo(fx - 16, y - 170); f.lineTo(fx, y - 196); f.lineTo(fx + 16, y - 170); f.lineTo(fx + 16, y); f.closePath(); ink(ctx, f, night ? PAL.g3 : PAL.white, 5); }
  const rl = P(); rl.rect(-300, y - 140, 1700, 16); ink(ctx, rl, night ? PAL.g3 : PAL.white, 5);
  // vines with leaves on the fence
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 4;
  ctx.beginPath(); for (let x = -300; x < 1400; x += 20) ctx.lineTo(x, y - 150 + Math.sin(x * 0.03 + t * 2) * 18); ctx.stroke();
  for (let i = 0; i < 18; i++) { const lx = i * 70 - 40, ly = y - 150 + Math.sin(lx * 0.03 + t * 2) * 18; const l = P(); l.ellipse(lx, ly - 16, 22, 14, -0.5 + Math.sin(t * 3 + i) * 0.2, 0, TAU); ink(ctx, l, night ? PAL.g3 : PAL.g2, 4); }
}
/** Farmer's house (simple, warm window). */
export function rumah(ctx, x, y, s, { t = 0, night = true } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const w = P(); w.rect(-220, -260, 440, 260); ink(ctx, w, PAL.g2);
  const r = P(); r.moveTo(-280, -250); r.lineTo(0, -430); r.lineTo(280, -250); r.closePath(); ink(ctx, r, PAL.g4);
  const d = P(); d.rect(-50, -170, 100, 170); ink(ctx, d, PAL.g5);
  const win = P(); win.rect(90, -200, 90, 80); ink(ctx, win, night ? PAL.white : PAL.g1);
  ctx.restore();
}

// ---------------------------------------------------------------- film & titles
/** Old film pass: flicker, gate weave already in camera, scratches, dust, grain, heavy vignette. Call on a top layer. */
export function film(ctx, t, { amt = 1 } = {}) {
  const f = Math.floor(t * 24);
  const fl = (hrand(f, 3) - 0.5) * 0.12 * amt;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = fl > 0 ? `rgba(255,252,240,${fl})` : `rgba(10,8,6,${-fl})`; ctx.fillRect(0, 0, 1080, 1920);
  // scratches
  ctx.strokeStyle = 'rgba(250,246,235,0.55)';
  for (let i = 0; i < 2; i++) { if (hrand(f, 10 + i) < 0.45) continue; const x = hrand(f, 20 + i) * 1080; ctx.lineWidth = 1 + hrand(f, 30 + i) * 2; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + (hrand(f, 40 + i) - 0.5) * 40, 1920); ctx.stroke(); }
  if (hrand(f, 50) > 0.7) { ctx.strokeStyle = 'rgba(15,12,10,0.5)'; ctx.lineWidth = 2; const x = hrand(f, 51) * 1080; ctx.beginPath(); ctx.moveTo(x, hrand(f, 52) * 900); ctx.lineTo(x + 6, hrand(f, 53) * 900 + 900); ctx.stroke(); }
  // dust / hair specks
  for (let i = 0; i < 6; i++) {
    if (hrand(f, 60 + i) < 0.4) continue;
    const x = hrand(f, 70 + i) * 1080, y = hrand(f, 80 + i) * 1920, r = 2 + hrand(f, 90 + i) * 6;
    ctx.fillStyle = hrand(f, 100 + i) > 0.5 ? 'rgba(15,12,10,0.7)' : 'rgba(250,246,235,0.7)';
    ctx.beginPath(); ctx.ellipse(x, y, r, r * (0.4 + hrand(f, 110 + i)), hrand(f, 120 + i) * 3, 0, TAU); ctx.fill();
  }
  if (hrand(f, 130) > 0.85) { ctx.strokeStyle = 'rgba(15,12,10,0.6)'; ctx.lineWidth = 2; const x = hrand(f, 131) * 1000, y = hrand(f, 132) * 1800; ctx.beginPath(); ctx.moveTo(x, y); ctx.bezierCurveTo(x + 30, y - 20, x + 10, y + 40, x + 50, y + 30); ctx.stroke(); }
  ctx.restore();
}
/** Gate weave offset for the camera (whole-frame jitter, per film frame). */
export const weave = (t, amp = 3) => { const f = Math.floor(t * 24); return [(noise.n2(f * 0.3, 1) * amp), (noise.n2(f * 0.3, 9) * amp * 1.4)]; };

/** Art-deco title card: double frame, corner fans, sunburst, big title + subtitle. */
export function titleCard(ctx, t, title, sub, { alpha = 1, y = 960, h = 700, size = 150 } = {}) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.fillStyle = PAL.g5; ctx.fillRect(0, 0, 1080, 1920);
  // sunburst rays
  ctx.save(); ctx.translate(540, y); ctx.rotate(t * 0.15);
  ctx.fillStyle = PAL.g4; for (let i = 0; i < 24; i++) { ctx.rotate(TAU / 24); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(1400, -80); ctx.lineTo(1400, 80); ctx.fill(); }
  ctx.restore();
  const x0 = 90, y0 = y - h / 2, w = 900;
  ctx.fillStyle = PAL.paper; ctx.fillRect(x0, y0, w, h);
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 10; ctx.strokeRect(x0 + 24, y0 + 24, w - 48, h - 48);
  ctx.lineWidth = 3; ctx.strokeRect(x0 + 44, y0 + 44, w - 88, h - 88);
  // corner fans
  for (const [cx, cy, a] of [[x0 + 24, y0 + 24, 0], [x0 + w - 24, y0 + 24, Math.PI / 2], [x0 + w - 24, y0 + h - 24, Math.PI], [x0 + 24, y0 + h - 24, -Math.PI / 2]]) {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(a); ctx.fillStyle = PAL.ink;
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 110 - i * 24, i * 0.39, i * 0.39 + 0.3); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  }
  ctx.fillStyle = PAL.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `400 ${size}px 'Abril Fatface'`; ctx.letterSpacing = '6px';
  ctx.fillText(title, 540, y - 30);
  ctx.fillRect(260, y + size * 0.42, 560, 6);
  if (sub) { ctx.font = `400 ${size * 0.3}px 'Special Elite'`; ctx.letterSpacing = '8px'; ctx.fillText(sub, 540, y + size * 0.75); }
  ctx.restore();
}
/** Iris: everything outside a circle at (x,y) radius r goes black (r large = fully open). */
export function iris(ctx, x, y, r) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#0b0a09'; ctx.beginPath(); ctx.rect(0, 0, 1080, 1920); ctx.arc(x, y, Math.max(0, r), 0, TAU, true); ctx.fill('evenodd');
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, TAU); ctx.stroke();
  ctx.restore();
}
/** Cartoon burst with lettering (PLAK! / ZOOM!). */
export function burst(ctx, text, x, y, { size = 120, alpha = 1, rot = -0.1, k = 1, t = 0 } = {}) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.rotate(rot); const sc = ease.outBack(clamp(k), 2.5); ctx.scale(sc, sc);
  const b = P(); const n = 14;
  for (let i = 0; i <= n * 2; i++) { const a = i / (n * 2) * TAU, r = (i % 2 ? 0.62 : 1) * size * 1.9 * (1 + (hrand(i, Math.floor(t * 12)) - 0.5) * 0.08); i ? b.lineTo(Math.cos(a) * r * 1.25, Math.sin(a) * r) : b.moveTo(Math.cos(a) * r * 1.25, Math.sin(a) * r); }
  b.closePath(); ink(ctx, b, PAL.white, 8);
  ctx.font = `400 ${size}px 'Rye'`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = 10; ctx.strokeStyle = PAL.white; ctx.strokeText(text, 0, 6); ctx.fillStyle = PAL.ink; ctx.fillText(text, 0, 6);
  ctx.restore();
}
/** Speed/smear lines behind a running character (horizontal). */
export function smear(ctx, x, y, len, { dir = -1, n = 7, h = 300, t = 0 } = {}) {
  ctx.save(); ctx.strokeStyle = PAL.ink; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) { const yy = y - h / 2 + (i + 0.5) * h / n + (hrand(i, Math.floor(t * 12)) - 0.5) * 20, L = len * (0.5 + hrand(i, 3) * 0.5); ctx.lineWidth = 3 + hrand(i, 5) * 5; ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x - dir * L, yy); ctx.stroke(); }
  ctx.restore();
}
/** Dust cloud puffs (exit gag). k 0..1 grows and fades. */
export function dust(ctx, x, y, k, s = 1) {
  if (k <= 0 || k >= 1) return;
  ctx.save(); ctx.globalAlpha = 1 - k;
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI + Math.PI, r = (40 + k * 140) * s; ink(ctx, ell(x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.3, (50 + k * 40) * s, (36 + k * 30) * s), PAL.white, 6); }
  ctx.restore();
}
/** Thought/speech bubble (cloud style) with text. */
export function bubble(ctx, text, x, y, { w = 520, h = 220, alpha = 1, tail = [-120, 200], size = 54, font = 'Special Elite', k = 1 } = {}) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); const sc = ease.outBack(clamp(k), 2); ctx.scale(sc, sc);
  const b = P(); b.ellipse(0, 0, w / 2, h / 2, 0, 0, TAU);
  const tl = P(); tl.moveTo(tail[0] * 0.3 - 30, h * 0.3); tl.lineTo(tail[0], tail[1]); tl.lineTo(tail[0] * 0.3 + 40, h * 0.35);
  ctx.fillStyle = PAL.white; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 7; ctx.lineJoin = 'round';
  ctx.stroke(tl); ctx.stroke(b); ctx.fill(tl); ctx.fill(b);
  ctx.fillStyle = PAL.ink; ctx.font = `400 ${size}px '${font}'`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const lines = text.split('\n'); lines.forEach((l, i) => ctx.fillText(l, 0, (i - (lines.length - 1) / 2) * size * 1.15));
  ctx.restore();
}
/** Rubber-hose crocodile (buaya) floating in the river or standing. */
export function buaya(ctx, x, y, s, { t = 0, mouth = 0.25, look = [0, 0], blink = 0, face = 1, sq = 0, angry = 0, num = 0 } = {}) {
  const bt = beat(t);
  const [sx0, sy0] = squash(t, 0.04);
  const [jx, jy] = boil(t, 91);
  ctx.save(); ctx.translate(x + jx, y - bt.b * 10 + jy); ctx.scale(s * face * sx0 * (1 + sq), s * sy0 * (1 - sq));
  // lumpy back scales
  for (let i = -3; i <= 0; i++) {
    const sc = ell(i * 46 - 20, -18, 22, 16); ink(ctx, sc, PAL.g4, 5);
  }
  const body = ell(-60, 0, 120, 44); ink(ctx, body, PAL.g3, 6);
  // upper jaw + lower jaw
  ctx.save(); ctx.translate(30, -18);
  ctx.save(); ctx.rotate(-mouth * 0.45);
  const up = P(); up.moveTo(-30, -28); up.quadraticCurveTo(60, -40, 145, -18); up.quadraticCurveTo(155, 0, 130, 8); up.lineTo(-30, 8); up.closePath();
  ink(ctx, up, PAL.g2, 6);
  // teeth
  ctx.fillStyle = PAL.white; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 4;
  for (let i = 0; i < 4; i++) {
    const tx = 20 + i * 26;
    ctx.beginPath(); ctx.moveTo(tx, 6); ctx.lineTo(tx + 9, 22); ctx.lineTo(tx + 18, 6); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  ink(ctx, ell(128, -18, 12, 9), PAL.ink, 4);
  pieEye(ctx, -6, -38, 15, 22, { look, blink, angry });
  pieEye(ctx, 22, -36, 15, 22, { look, blink, angry });
  ctx.restore();
  // lower jaw
  ctx.save(); ctx.rotate(mouth * 0.35);
  const lo = P(); lo.moveTo(-25, 6); lo.lineTo(125, 6); lo.quadraticCurveTo(115, 32, -25, 28); lo.closePath();
  ink(ctx, lo, PAL.g1, 6);
  ctx.restore();
  ctx.restore();
  if (num > 0) {
    ctx.save(); ctx.scale(face, 1);
    ink(ctx, ell(0, -125, 38, 38), PAL.white, 6);
    ctx.fillStyle = PAL.ink; ctx.font = "400 50px 'Abril Fatface'"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(num), 0, -122);
    ctx.restore();
  }
  ctx.restore();
}
/** Rubber-hose river with animated wavy currents and banks. */
export function sungai(ctx, t, { y = 1320, h = 340, night = false } = {}) {
  ctx.fillStyle = night ? PAL.g4 : PAL.g2; ctx.fillRect(-300, y - 160, 1700, 900);
  ctx.fillStyle = night ? PAL.g5 : PAL.g3; ctx.fillRect(-300, y, 1700, h);
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 7;
  for (const yy of [y, y + h]) {
    ctx.beginPath();
    for (let x = -300; x <= 1400; x += 24) ctx.lineTo(x, yy + Math.sin(x * 0.025 + t * 3) * 10);
    ctx.stroke();
  }
  ctx.strokeStyle = PAL.white; ctx.lineWidth = 4;
  for (let r = 0; r < 4; r++) {
    const ry = y + 55 + r * 72;
    ctx.beginPath();
    for (let x = -260; x <= 1360; x += 30) ctx.lineTo(x, ry + Math.sin(x * 0.03 + t * 4 + r) * 12);
    ctx.stroke();
  }
}
/** Bouncy cartoon fruit tree. */
export function pohon(ctx, x, y, s, { t = 0, fruits = 3 } = {}) {
  const bt = beat(t);
  const [sx, sy] = squash(t, 0.035);
  ctx.save(); ctx.translate(x, y); ctx.scale(s * sx, s * sy);
  const tr = P(); tr.moveTo(-45, 0); tr.quadraticCurveTo(-28, -190, -35, -360); tr.lineTo(35, -360); tr.quadraticCurveTo(28, -190, 45, 0); tr.closePath();
  ink(ctx, tr, PAL.g4, 6);
  for (const [cx, cy, rx, ry] of [[-110, -400, 110, 85], [110, -400, 110, 85], [0, -470, 145, 105]]) {
    ink(ctx, ell(cx, cy - bt.b * 8, rx, ry), PAL.g2, 6);
  }
  for (let i = 0; i < fruits; i++) {
    const fx = -85 + i * 85, fy = -370 + (i % 2) * 28 - bt.b * 14;
    ink(ctx, ell(fx, fy, 24, 30, 0.2), PAL.white, 5);
  }
  ctx.restore();
}
export { clamp, lerp, ease, hrand, noise, TAU };
