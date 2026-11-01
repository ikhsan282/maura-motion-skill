// Maura Motion style kit: WAYANG BEBER (painted scroll storytelling, Java, 16th–17th c. tradition).
// A long scroll of daluwang (bark paper) is unrolled between two wooden rollers, one scene (jagong) at a time,
// lit by a hanging oil lamp (blencong) while the dalang points at the figures with a stick (tuding).
// The paintings: flat profile figures in classical Javanese wayang proportions (long pointed noses, almond eyes,
// crowns and hair buns, bare ochre torsos, patterned kain, flying sashes), earthy mineral pigments outlined in
// black ink, plant ornaments (spiral vines, flowers) filling every gap, borders of tumpal triangles.
// Signature moves: the scroll unrolls / rolls from right to left between scenes, the lamp flickers, the tuding
// moves, and the painted figures quietly come alive (walk, gesture, turn, dance).
import { clamp, lerp, ease, hrand, noise, mulberry32, TAU } from '/engine/lib/core.js';
import { makeCanvas, cached, paperTexture, alphaTexture } from '/engine/lib/draw.js';

export const PAL = {
  daluwang: '#d9c49a', dalDk: '#b9a070', ochre: '#c99a3b', ochreLt: '#e2bf6a', red: '#a03a22', redDk: '#6e2416',
  ink: '#1f1a17', white: '#efe5c9', green: '#6f7f4c', greenDk: '#4b5a34', blue: '#3e5a7a', skin: '#e0b062', skinW: '#efe1bd',
  wood: '#5a3720', woodDk: '#321c0e', woodHi: '#8a5a32', brass: '#b8862f', night: '#120b07', flame: '#ffd27a',
};
export const SCROLL = { H: 820, SCENE: 1000 };

// ---------------- painting primitives ----------------
const INK = 3.2;
export function shape(g, path, fill, lw = INK) {
  g.beginPath(); path(g); g.closePath();
  if (fill) { g.fillStyle = fill; g.fill(); }
  g.lineJoin = 'round'; g.lineCap = 'round'; g.lineWidth = lw; g.strokeStyle = PAL.ink; g.stroke();
}
const dotsRow = (g, x0, x1, y, step, r, col) => { g.fillStyle = col; for (let x = x0; x <= x1; x += step) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); } };
/** Spiral vine ornament (sulur) with leaves and small flowers. */
export function vine(g, x, y, s = 1, seed = 1) {
  const r = mulberry32(seed);
  g.save(); g.translate(x, y); g.scale(s, s);
  g.strokeStyle = PAL.ink; g.lineWidth = 2.6;
  for (let k = 0; k < 3; k++) {
    const a0 = r() * TAU, dir = r() < 0.5 ? 1 : -1;
    g.beginPath();
    for (let i = 0; i <= 40; i++) { const u = i / 40, a = a0 + dir * u * 7, rr = 70 * (1 - u) + 6; const px = Math.cos(a) * rr + k * 40 - 40, py = Math.sin(a) * rr * 0.8; i ? g.lineTo(px, py) : g.moveTo(px, py); }
    g.stroke();
  }
  for (let i = 0; i < 6; i++) {
    const a = r() * TAU, d = 30 + r() * 60, lx = Math.cos(a) * d, ly = Math.sin(a) * d * 0.8;
    shape(g, (q) => { q.ellipse(lx, ly, 16, 7, a, 0, TAU); }, i % 3 ? PAL.green : PAL.greenDk, 2);
  }
  for (let i = 0; i < 2; i++) { const fx = (r() - 0.5) * 120, fy = (r() - 0.5) * 80; for (let p = 0; p < 5; p++) shape(g, (q) => q.ellipse(fx + Math.cos((p / 5) * TAU) * 9, fy + Math.sin((p / 5) * TAU) * 9, 7, 5, (p / 5) * TAU, 0, TAU), PAL.red, 1.6); g.fillStyle = PAL.ochreLt; g.beginPath(); g.arc(fx, fy, 5, 0, TAU); g.fill(); }
  g.restore();
}
/** Stylised tree (kayon-like) with flower clusters. */
export function tree(g, x, y, s = 1, seed = 2) {
  g.save(); g.translate(x, y); g.scale(s, s);
  shape(g, (q) => { q.moveTo(-14, 0); q.quadraticCurveTo(-8, -150, -4, -260); q.lineTo(6, -260); q.quadraticCurveTo(10, -150, 16, 0); }, PAL.redDk);
  const r = mulberry32(seed);
  for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.45, d = 90 + r() * 40; shape(g, (q) => q.ellipse(Math.cos(a) * d * 0.9, -280 + Math.sin(a) * d * 0.7 + 40, 58, 38, a, 0, TAU), i % 2 ? PAL.green : PAL.greenDk); }
  for (let i = 0; i < 8; i++) { const fx = (r() - 0.5) * 220, fy = -300 + (r() - 0.5) * 140; g.fillStyle = PAL.red; g.beginPath(); g.arc(fx, fy, 7, 0, TAU); g.fill(); g.fillStyle = PAL.white; g.beginPath(); g.arc(fx, fy, 2.5, 0, TAU); g.fill(); }
  g.restore();
}
/** Pavilion (pendopo) with red pillars and a tiered roof. */
export function pendopo(g, x, y, w = 420, h = 420) {
  g.save(); g.translate(x, y);
  shape(g, (q) => q.rect(-w / 2 - 20, -24, w + 40, 24), PAL.dalDk);
  for (const px of [-w / 2 + 20, -w / 6, w / 6, w / 2 - 20]) shape(g, (q) => q.rect(px - 9, -h * 0.62, 18, h * 0.62 - 24), PAL.red);
  shape(g, (q) => { q.moveTo(-w / 2 - 50, -h * 0.6); q.lineTo(-w / 4, -h * 0.85); q.lineTo(w / 4, -h * 0.85); q.lineTo(w / 2 + 50, -h * 0.6); }, PAL.redDk);
  shape(g, (q) => { q.moveTo(-w / 4, -h * 0.85); q.lineTo(-w / 10, -h); q.lineTo(w / 10, -h); q.lineTo(w / 4, -h * 0.85); }, PAL.ochre);
  dotsRow(g, -w / 2 - 30, w / 2 + 30, -h * 0.63, 22, 3, PAL.white);
  g.restore();
}
/** Split gate (candi bentar). */
export function gate(g, x, y, s = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  for (const sd of [-1, 1]) shape(g, (q) => { const b = sd * 70; q.moveTo(b, 0); q.lineTo(b + sd * 120, 0); q.lineTo(b + sd * 100, -260); q.lineTo(b + sd * 60, -420); q.lineTo(b + sd * 30, -260); }, PAL.red);
  for (const sd of [-1, 1]) for (let y = -60; y > -380; y -= 50) { g.fillStyle = PAL.white; g.fillRect(sd * 70 + sd * 40 - 6, y, 12, 12); }
  g.restore();
}
/** Scroll border: red band with white tumpal triangles and black rules. */
function border(g, w, y, h, flip) {
  g.fillStyle = PAL.red; g.fillRect(0, y, w, h);
  g.fillStyle = PAL.ink; g.fillRect(0, y, w, 4); g.fillRect(0, y + h - 4, w, 4);
  g.fillStyle = PAL.white;
  for (let x = 0; x < w; x += 34) { g.beginPath(); if (flip) { g.moveTo(x, y + 6); g.lineTo(x + 17, y + h - 8); g.lineTo(x + 34, y + 6); } else { g.moveTo(x, y + h - 6); g.lineTo(x + 17, y + 8); g.lineTo(x + 34, y + h - 6); } g.fill(); }
}
/**
 * Build (cached) the painted scroll: a background per scene (function(g, x0, w, h) painting scene i).
 * Returns a canvas of width scenes.length * SCENE.
 */
export function scrollCanvas(key, scenes) {
  return cached('wb-scroll:' + key, () => {
    const W = scenes.length * SCROLL.SCENE, H = SCROLL.H, c = makeCanvas(W, H), g = c.getContext('2d');
    g.fillStyle = PAL.daluwang; g.fillRect(0, 0, W, H);
    scenes.forEach((fn, i) => { g.save(); g.beginPath(); g.rect(i * SCROLL.SCENE, 0, SCROLL.SCENE, H); g.clip(); fn(g, i * SCROLL.SCENE, SCROLL.SCENE, H); g.restore(); });
    border(g, W, 0, 46, false); border(g, W, H - 46, 46, true);
    // jagong dividers: vertical ornamental bands between scenes
    for (let i = 1; i < scenes.length; i++) { const x = i * SCROLL.SCENE; g.fillStyle = PAL.redDk; g.fillRect(x - 6, 46, 12, H - 92); dotsRow(g, x, x, 0, 1, 0, PAL.white); for (let y = 70; y < H - 60; y += 28) { g.fillStyle = PAL.white; g.beginPath(); g.arc(x, y, 3, 0, TAU); g.fill(); } }
    // bark-paper fibre + mottling
    g.globalAlpha = 0.55;
    const tex = alphaTexture(paperTexture(512, 512, { base: '#808080', fiber: 0.2, blotch: 0.16, seed: 41, grainAmt: 34 }), 1);
    for (let x = 0; x < W; x += 512) for (let y = 0; y < H; y += 512) g.drawImage(tex, x, y);
    g.globalAlpha = 1;
    // age: darker edges top and bottom
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(90,55,20,.25)'); gr.addColorStop(0.12, 'rgba(90,55,20,0)'); gr.addColorStop(0.88, 'rgba(90,55,20,0)'); gr.addColorStop(1, 'rgba(90,55,20,.3)');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    return c;
  });
}

// ---------------- painted figures (live) ----------------
// Local coords: feet at (0,0), facing right (+x), height ~460. Drawn straight into the scroll's coordinate frame.
function headWB(g, { crown = null, bun = false, white = false, beard = false, look = 0, mouth = 0, plump = false } = {}) {
  const skin = white ? PAL.skinW : PAL.skin;
  if (plump) { // punakawan-like round face
    shape(g, (q) => { q.ellipse(0, 0, 38, 40, 0, 0, TAU); }, skin);
    shape(g, (q) => { q.moveTo(30, -6); q.quadraticCurveTo(58, 4, 34, 16); }, skin, 2.5);
    g.fillStyle = PAL.ink; g.beginPath(); g.arc(16 + look, -8, 4.5, 0, TAU); g.fill();
    g.beginPath(); g.arc(-6, -38, 12, 0, TAU); g.fill();
    g.lineWidth = 2.5; g.beginPath(); g.arc(20, 18, 10, 0.2, Math.PI - 0.6); g.stroke();
    return;
  }
  // classic alus profile: forehead and long nose in one line, small chin
  shape(g, (q) => { q.moveTo(-26, 34); q.quadraticCurveTo(-36, -10, -16, -40); q.quadraticCurveTo(10, -50, 22, -30); q.lineTo(58, 6); q.lineTo(30, 4); q.lineTo(30, 14); q.quadraticCurveTo(26, 30, 8, 36); }, skin);
  // almond eye, brow, moustache
  g.fillStyle = PAL.white; g.beginPath(); g.ellipse(14 + look, -14, 10, 4, -0.35, 0, TAU); g.fill();
  g.strokeStyle = PAL.ink; g.lineWidth = 2; g.stroke();
  g.fillStyle = PAL.ink; g.beginPath(); g.arc(17 + look, -14, 2.6, 0, TAU); g.fill();
  g.lineWidth = 2.4; g.beginPath(); g.moveTo(2, -24); g.quadraticCurveTo(16, -30, 30, -20); g.stroke();
  if (beard) { g.lineWidth = 2.5; g.beginPath(); g.moveTo(22, 12); g.quadraticCurveTo(32, 18, 40, 10); g.stroke(); }
  if (mouth) { g.fillStyle = PAL.redDk; g.beginPath(); g.ellipse(28, 18, 5, 3 + mouth * 3, 0, 0, TAU); g.fill(); }
  // hair / headdress
  if (bun) { shape(g, (q) => { q.moveTo(-28, 30); q.quadraticCurveTo(-40, -20, -14, -42); q.quadraticCurveTo(14, -52, 22, -34); q.lineTo(-6, -26); q.quadraticCurveTo(-18, 0, -20, 34); }, PAL.ink); shape(g, (q) => q.ellipse(-40, -34, 22, 18, -0.4, 0, TAU), PAL.ink); g.fillStyle = PAL.ochreLt; g.fillRect(-30, -46, 24, 6); shape(g, (q) => { q.ellipse(-46, -50, 8, 5, -0.4, 0, TAU); }, PAL.red, 1.5); }
  if (crown === 'makutha') {
    shape(g, (q) => { q.moveTo(-26, -40); q.lineTo(-78, -86); q.lineTo(-66, -50); q.lineTo(-84, -30); q.lineTo(-30, -20); }, PAL.red); // garuda flap at the back
    shape(g, (q) => { q.moveTo(-30, -18); q.lineTo(-34, -60); q.lineTo(-22, -66); q.lineTo(-26, -96); q.lineTo(-8, -104); q.lineTo(2, -146); q.lineTo(12, -104); q.lineTo(26, -94); q.lineTo(22, -62); q.lineTo(28, -34); q.lineTo(-10, -30); }, PAL.ochre);
    g.fillStyle = PAL.red; for (const [a, b] of [[-8, -50], [6, -78], [-14, -84], [12, -52]]) { g.beginPath(); g.arc(a, b, 4, 0, TAU); g.fill(); }
    g.strokeStyle = PAL.ink; g.lineWidth = 2; g.beginPath(); g.moveTo(-32, -60); g.lineTo(24, -62); g.moveTo(-24, -94); g.lineTo(24, -94); g.stroke();
  }
  if (crown === 'gelung') { shape(g, (q) => { q.moveTo(-26, -30); q.quadraticCurveTo(-40, -70, -6, -78); q.quadraticCurveTo(26, -76, 22, -36); }, PAL.ink); shape(g, (q) => { q.moveTo(-24, -36); q.lineTo(22, -38); q.lineTo(22, -30); q.lineTo(-24, -28); }, PAL.ochre, 2); }
  if (crown || bun) { shape(g, (q) => q.ellipse(-6, 4, 7, 12, 0, 0, TAU), PAL.ochreLt, 2); } // ear ornament (sumping)
}
function arm(g, x, y, a1, a2, len = 120, skin = PAL.skin, bangle = true) {
  g.save(); g.translate(x, y); g.rotate(-a1);
  shape(g, (q) => { q.moveTo(-9, 0); q.lineTo(9, 0); q.lineTo(7, len); q.lineTo(-7, len); }, skin, 2.6);
  if (bangle) { g.fillStyle = PAL.ochre; g.fillRect(-10, 18, 20, 7); }
  g.translate(0, len); g.rotate(-a2);
  shape(g, (q) => { q.moveTo(-7, 0); q.lineTo(7, 0); q.lineTo(5, len * 0.9); q.lineTo(16, len * 0.9 + 18); q.lineTo(-6, len * 0.95 + 10); }, skin, 2.6);
  g.restore();
}
function kain(g, w, top, bot, sway, col = PAL.red, motif = PAL.ochreLt, long = true) {
  shape(g, (q) => { q.moveTo(-w / 2, top); q.lineTo(w / 2, top); q.lineTo(w / 2 + 10 + sway, bot); q.lineTo(-w / 2 - 14 + sway, bot); }, col);
  g.save(); g.beginPath(); g.moveTo(-w / 2, top); g.lineTo(w / 2, top); g.lineTo(w / 2 + 10 + sway, bot); g.lineTo(-w / 2 - 14 + sway, bot); g.closePath(); g.clip();
  g.strokeStyle = motif; g.lineWidth = 3; for (let k = -200; k < 200; k += 22) { g.beginPath(); g.moveTo(k, top); g.lineTo(k - (bot - top), bot); g.stroke(); }
  g.fillStyle = PAL.white; for (let k = -200; k < 200; k += 22) for (let y = top + 12; y < bot; y += 26) { g.beginPath(); g.arc(k - (y - top) + 11, y, 2.2, 0, TAU); g.fill(); }
  g.restore();
}
function sash(g, x, y, t, len = 160, col = PAL.green) {
  shape(g, (q) => { q.moveTo(x, y); q.quadraticCurveTo(x - 40, y + len * 0.5, x - 30 + Math.sin(t * 2.4) * 18, y + len); q.lineTo(x - 14 + Math.sin(t * 2.4) * 18, y + len - 6); q.quadraticCurveTo(x - 20, y + len * 0.5, x + 10, y + 4); }, col, 2.4);
}
/**
 * Draw a painted figure. kind: 'putri' | 'emban' | 'raja' (seated) | 'patih' | 'jaka' | 'abdi' (plump servant) | 'warga'.
 * o: { x, y, s, face, t, walk (phase or null), armF:[a1,a2], armB:[a1,a2], look, mouth, mask (0..1 lifted barong), drum }
 */
export function figure(g, kind, o = {}) {
  const { x, y, s = 1, face = 1, t = 0 } = o;
  const walking = o.walk != null, ph = o.walk || 0, sw = walking ? Math.sin(ph * TAU) : 0, bob = walking ? -Math.abs(Math.cos(ph * TAU)) * 6 : 0;
  g.save(); g.translate(x, y + bob); g.scale(s * face, s);
  const breath = Math.sin(t * 1.7 + x * 0.01) * 2;
  const aF = o.armF || [0.25, 0.4], aB = o.armB || [-0.15, 0.3];
  if (kind === 'putri' || kind === 'emban') {
    const putri = kind === 'putri';
    arm(g, -6, -330, aB[0], aB[1], 105, putri ? PAL.skinW : PAL.skin);
    // long kain to the ankles, slight walking sway
    kain(g, 70, -250, -6, sw * 10, putri ? PAL.red : PAL.blue, putri ? PAL.ochreLt : PAL.white);
    // feet
    shape(g, (q) => { q.ellipse(14 + sw * 18, -4, 22, 7, 0, 0, TAU); }, putri ? PAL.skinW : PAL.skin, 2);
    // torso (kemben)
    shape(g, (q) => { q.moveTo(-28, -250); q.lineTo(-30, -340 - breath); q.quadraticCurveTo(0, -356 - breath, 28, -342 - breath); q.lineTo(32, -250); }, putri ? PAL.skinW : PAL.skin);
    shape(g, (q) => { q.moveTo(-31, -250); q.lineTo(-30, -300); q.lineTo(31, -304); q.lineTo(32, -250); }, putri ? PAL.green : PAL.redDk);
    sash(g, 20, -300, t, 200, putri ? PAL.ochre : PAL.green);
    g.save(); g.translate(4, -390 - breath); g.rotate(o.look || 0); headWB(g, { bun: true, white: putri, mouth: o.mouth }); g.restore();
    arm(g, 12, -330, aF[0], aF[1], 105, putri ? PAL.skinW : PAL.skin);
  } else if (kind === 'raja') { // seated on a throne (dampar)
    shape(g, (q) => q.rect(-90, -160, 180, 160), PAL.redDk);
    dotsRow(g, -80, 80, -140, 20, 3.5, PAL.ochreLt);
    shape(g, (q) => { q.moveTo(-60, -160); q.lineTo(80, -170); q.lineTo(90, -130); q.lineTo(-50, -120); }, PAL.red); // lap / kain
    arm(g, -6, -330, aB[0], aB[1], 110);
    shape(g, (q) => { q.moveTo(-34, -160); q.lineTo(-36, -340 - breath); q.quadraticCurveTo(0, -360 - breath, 32, -342 - breath); q.lineTo(38, -160); }, PAL.skin);
    shape(g, (q) => { q.moveTo(-30, -310); q.quadraticCurveTo(0, -270, 30, -312); }, null, 5); // necklace
    g.save(); g.translate(4, -394 - breath); headWB(g, { crown: 'makutha', beard: true, mouth: o.mouth }); g.restore();
    sash(g, 26, -300, t, 160, PAL.green);
    arm(g, 14, -330, aF[0], aF[1], 110);
  } else if (kind === 'patih' || kind === 'jaka' || kind === 'warga') {
    const jaka = kind === 'jaka';
    const stance = kind === 'patih' ? 0.25 : jaka ? 0.35 + (o.dance || 0) * 0.15 : 0.15;
    for (const [sd, k] of [[-1, 1], [1, 1]]) { // legs in the wide wayang stance
      g.save(); g.translate(0, -200); g.rotate(sd * (stance + sw * 0.3));
      shape(g, (q) => { q.moveTo(-10, 0); q.lineTo(10, 0); q.lineTo(8, 196); q.lineTo(34, 200); q.lineTo(-10, 202); }, PAL.skin, 2.6);
      g.restore();
    }
    kain(g, 90, -260, -150, sw * 6, jaka ? PAL.ochre : kind === 'patih' ? PAL.red : PAL.green, jaka ? PAL.redDk : PAL.white);
    arm(g, -6, -360, aB[0], aB[1], 110);
    shape(g, (q) => { q.moveTo(-34, -258); q.lineTo(-38, -372 - breath); q.quadraticCurveTo(0, -392 - breath, 34, -374 - breath); q.lineTo(36, -258); }, PAL.skin);
    shape(g, (q) => { q.moveTo(-32, -340); q.quadraticCurveTo(0, -300, 32, -342); }, null, 4);
    sash(g, 28, -270, t, 150, jaka ? PAL.green : PAL.ochre);
    g.save(); g.translate(4, -424 - breath); g.rotate(o.look || 0); headWB(g, { crown: jaka ? 'gelung' : kind === 'patih' ? 'makutha' : null, beard: kind === 'patih', mouth: o.mouth }); g.restore();
    arm(g, 14, -360, aF[0], aF[1], 110);
    if (o.mask != null) { // Barong mask held up in the dance (barong terbang)
      const mx = 120, my = -440 - o.mask * 60;
      shape(g, (q) => { q.ellipse(mx, my, 56, 48, 0, 0, TAU); }, PAL.red);
      shape(g, (q) => { q.ellipse(mx + 22, my - 8, 10, 8, 0, 0, TAU); }, PAL.white, 2); g.fillStyle = PAL.ink; g.beginPath(); g.arc(mx + 24, my - 8, 4, 0, TAU); g.fill();
      shape(g, (q) => { q.moveTo(mx + 20, my + 16); q.lineTo(mx + 56, my + 22); q.lineTo(mx + 20, my + 32); }, PAL.white, 2);
      for (let k = 0; k < 7; k++) shape(g, (q) => { const a = -2.2 + k * 0.35; q.moveTo(mx + Math.cos(a) * 50, my + Math.sin(a) * 44); q.lineTo(mx + Math.cos(a) * 82, my + Math.sin(a) * 74 + Math.sin(t * 8 + k) * 5); q.lineTo(mx + Math.cos(a + 0.15) * 50, my + Math.sin(a + 0.15) * 44); }, PAL.ochre, 2);
    }
  } else if (kind === 'abdi') { // plump servant beating a kendang
    shape(g, (q) => { q.ellipse(0, -120, 70, 90, 0, 0, TAU); }, PAL.skin);
    kain(g, 130, -90, -20, 0, PAL.greenDk, PAL.white);
    shape(g, (q) => { q.moveTo(-40, -30); q.lineTo(-30, 0); q.lineTo(-60, 0); }, PAL.skin, 2.4);
    shape(g, (q) => { q.moveTo(30, -30); q.lineTo(40, 0); q.lineTo(10, 0); }, PAL.skin, 2.4);
    g.save(); g.translate(10, -230); headWB(g, { plump: true, look: o.look || 0 }); g.restore();
    if (o.drum != null) { // kendang
      shape(g, (q) => { q.moveTo(50, -120); q.lineTo(150, -110); q.lineTo(150, -60); q.lineTo(50, -50); }, PAL.woodHi);
      shape(g, (q) => q.ellipse(150, -85, 10, 26, 0, 0, TAU), PAL.white, 2);
      arm(g, 30, -170, 1.2 + Math.abs(Math.sin(o.drum * Math.PI * 2)) * 0.5, 0.6, 70);
    }
  }
  g.restore();
}

// ---------------- the stage: scroll, rollers, lamp, pointer ----------------
/** Draw the scroll window: content u0..u0+w of the scroll canvas, at screen rect (x, y, w). */
export function scrollWindow(ctx, S, u0, x, y, w, { warp = 1 } = {}) {
  const H = SCROLL.H;
  const sx = clamp(u0, 0, S.width - 2), sw = Math.min(w, S.width - sx);
  ctx.drawImage(S, sx, 0, sw, H, x + (sx - u0), y, sw, H);
  // curvature shading near the rollers
  const g1 = ctx.createLinearGradient(x, 0, x + 80, 0); g1.addColorStop(0, 'rgba(40,20,5,.45)'); g1.addColorStop(1, 'rgba(40,20,5,0)');
  ctx.fillStyle = g1; ctx.fillRect(x, y, 80, H);
  const g2 = ctx.createLinearGradient(x + w - 80, 0, x + w, 0); g2.addColorStop(0, 'rgba(40,20,5,0)'); g2.addColorStop(1, 'rgba(40,20,5,.45)');
  ctx.fillStyle = g2; ctx.fillRect(x + w - 80, y, 80, H);
}
/** Wooden roller with the rolled paper around it; turn = rotation phase (grain lines move). radius grows with the paper left on it. */
export function roller(ctx, x, y, h, turn = 0, r = 26, { tied = false } = {}) {
  ctx.save();
  // pole
  const gp = ctx.createLinearGradient(x - 12, 0, x + 12, 0); gp.addColorStop(0, PAL.woodDk); gp.addColorStop(0.5, PAL.woodHi); gp.addColorStop(1, PAL.woodDk);
  ctx.fillStyle = gp; ctx.fillRect(x - 11, y - 120, 22, h + 300);
  // carved finials
  for (const yy of [y - 120, y + h + 180]) { ctx.fillStyle = PAL.wood; ctx.beginPath(); ctx.ellipse(x, yy, 22, 14, 0, 0, TAU); ctx.fill(); ctx.fillStyle = PAL.brass; ctx.beginPath(); ctx.arc(x, yy - 14, 9, 0, TAU); ctx.fill(); }
  // rolled paper cylinder
  const g = ctx.createLinearGradient(x - r, 0, x + r, 0); g.addColorStop(0, '#8a7350'); g.addColorStop(0.45, PAL.daluwang); g.addColorStop(1, '#7a6440');
  ctx.fillStyle = g; ctx.fillRect(x - r, y, r * 2, h);
  ctx.fillStyle = 'rgba(160,58,34,.85)'; ctx.fillRect(x - r, y, r * 2, 46); ctx.fillRect(x - r, y + h - 46, r * 2, 46);
  ctx.strokeStyle = 'rgba(60,40,20,.35)'; ctx.lineWidth = 1.5;
  for (let k = 0; k < 6; k++) { const ph = ((turn * 3 + k / 6) % 1) * 2 - 1; const xx = x + Math.sin(ph * Math.PI / 2) * r; ctx.beginPath(); ctx.moveTo(xx, y); ctx.lineTo(xx, y + h); ctx.stroke(); }
  if (tied) { // red cord binding the closed scroll
    ctx.strokeStyle = '#b3201a'; ctx.lineWidth = 7;
    for (const yy of [y + h * 0.35, y + h * 0.65]) { ctx.beginPath(); ctx.moveTo(x - r - 2, yy); ctx.lineTo(x + r + 2, yy + 6); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(x + r, y + h * 0.5); ctx.quadraticCurveTo(x + r + 40, y + h * 0.55, x + r + 30, y + h * 0.7); ctx.stroke();
  }
  ctx.restore();
}
/** Lamp flicker 0..1 around 0.9. */
export function flicker(t) { return 0.9 + noise.n2(t * 3.1, 2) * 0.07 + noise.n2(t * 9, 5) * 0.04; }
/** Hanging bronze oil lamp (blencong) with a live flame; returns flicker. */
export function lamp(ctx, x, y, t, s = 1) {
  const f = flicker(t);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = PAL.brass; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -400); ctx.lineTo(0, -60); ctx.stroke();
  // garuda-bird shaped lamp body
  ctx.fillStyle = PAL.brass; ctx.strokeStyle = '#5a3c10'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-90, -20); ctx.quadraticCurveTo(-60, -70, 0, -60); ctx.quadraticCurveTo(70, -60, 90, -30); ctx.quadraticCurveTo(60, 10, 0, 10); ctx.quadraticCurveTo(-60, 10, -90, -20); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-90, -20); ctx.lineTo(-150, -70); ctx.lineTo(-130, -20); ctx.lineTo(-160, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(80, -40); ctx.quadraticCurveTo(110, -80, 130, -60); ctx.lineTo(120, -40); ctx.closePath(); ctx.fill(); ctx.stroke();
  // flame
  const fl = cached('wb-flame', () => { const c = makeCanvas(160, 220), g = c.getContext('2d'); const gr = g.createRadialGradient(80, 140, 4, 80, 120, 90); gr.addColorStop(0, 'rgba(255,250,220,1)'); gr.addColorStop(0.3, 'rgba(255,200,90,.9)'); gr.addColorStop(1, 'rgba(255,120,30,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(80, 10); g.quadraticCurveTo(140, 140, 80, 200); g.quadraticCurveTo(20, 140, 80, 10); g.fill(); return c; });
  ctx.save(); ctx.translate(130, -66); ctx.scale(0.5 * (0.9 + (f - 0.9) * 3), 0.55 + (f - 0.9) * 2); ctx.rotate(noise.n2(t * 4, 1) * 0.15); ctx.drawImage(fl, -80, -200); ctx.restore();
  ctx.restore();
  return f;
}
/** Warm glow sprite around the flame (pre-baked) + room darkness modulated by the flicker. */
export function lampLight(ctx, x, y, f, r = 900) {
  const G = cached('wb-glow', () => { const c = makeCanvas(256, 256), g = c.getContext('2d'); const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, 'rgba(255,214,140,.55)'); gr.addColorStop(0.4, 'rgba(255,170,80,.18)'); gr.addColorStop(1, 'rgba(255,150,60,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); return c; });
  ctx.save(); ctx.globalAlpha = clamp((f - 0.78) * 4); ctx.drawImage(G, x - r * f, y - r * f, 2 * r * f, 2 * r * f); ctx.restore();
}
/** The dalang's pointer (tuding): a thin carved stick from (bx,by) to the tip (x,y). */
export function tuding(ctx, x, y, bx = 1250, by = 2100) {
  ctx.save(); ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(bx + 10, by + 14); ctx.lineTo(x + 10, y + 14); ctx.stroke();
  ctx.strokeStyle = PAL.woodDk; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(x, y); ctx.stroke();
  ctx.strokeStyle = PAL.woodHi; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx - 3, by - 3); ctx.lineTo(x - 2, y - 2); ctx.stroke();
  ctx.fillStyle = PAL.brass; ctx.beginPath(); ctx.arc(x, y, 7, 0, TAU); ctx.fill();
  ctx.restore();
}
/** Name cartouche in the scroll's own language: daluwang label with red border and ink serif. */
export function cartouche(ctx, text, x, y, { size = 46, alpha = 1, sub = null } = {}) {
  if (alpha <= 0.01) return;
  ctx.save(); ctx.globalAlpha *= clamp(alpha);
  ctx.font = `700 ${size}px 'Cinzel'`; let w = ctx.measureText(text).width + size * 1.4;
  if (sub) { ctx.font = `italic 400 ${size * 0.6}px 'EB Garamond'`; w = Math.max(w, ctx.measureText(sub).width + size); }
  const h = size * (sub ? 2.1 : 1.5), e = ease.outBack(clamp(alpha), 1.6);
  ctx.translate(x, y); ctx.scale(e, e);
  ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fillRect(-w / 2 + 6, -h / 2 + 8, w, h);
  ctx.fillStyle = PAL.daluwang; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.strokeStyle = PAL.red; ctx.lineWidth = 6; ctx.strokeRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10);
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 1.5; ctx.strokeRect(-w / 2 + 11, -h / 2 + 11, w - 22, h - 22);
  ctx.fillStyle = PAL.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `700 ${size}px 'Cinzel'`; ctx.fillText(text, 0, sub ? -size * 0.36 : size * 0.04);
  if (sub) { ctx.fillStyle = PAL.redDk; ctx.font = `italic 400 ${size * 0.6}px 'EB Garamond'`; ctx.fillText(sub, 0, size * 0.52); }
  ctx.restore();
}

export { ease, clamp, lerp, hrand };
