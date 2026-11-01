// Maura Motion style kit: KARDUS BEKAS (cardboard craft).
// Science-explainer illustration: no outlines, flat fills with soft two-stop gradients, cached glows,
// deep navy space, warm light accents, round dot-eyed characters that squash and stretch.
// Signature moves: the cutaway that opens (a wedge cut out of a planet / star), the zoom-through
// (camera pushes into an object and the next scene is inside it), pop-ins with overshoot, pill badges,
// counters that roll, and real deterministic simulations (random walks).
import { clamp, lerp, ease, hrand, noise, mulberry32, TAU, mixHex, rgba, hexToRgb } from '/engine/lib/core.js';
import { makeCanvas, cached, roundRect } from '/engine/lib/draw.js';

export const PAL = {
  space0: '#2a1c10', space1: '#4a2f18', space2: '#6b4a26', dusk: '#8a5f30',
  sunCore: '#fff7d1', sun1: '#ffd65e', sun2: '#ffa63f', sun3: '#f46a3a', sun4: '#c8403c',
  gamma: '#8f7bff', photon: '#ffe86b', white: '#ffffff', ink: '#0b1230',
  teal: '#3fd6c6', pink: '#ff6f91', mint: '#7af0b0', sky: '#6cc8ff',
  skin: '#f6b88f', skinLit: '#ffd3ad', skinShade: '#d98b68', hair: '#2a1c3f', shirt: '#F28C18',
  sea: '#7a5a3a', sea2: '#5a4028', land: '#5ccf86', land2: '#3aa868', ochre: '#c9622f', rock: '#e7c9a3',
};
export { clamp, lerp, ease, hrand, TAU, mixHex, rgba };

// ------------------------------------------------------------------ camera / helpers
/** Set a 2D camera: zoom z about world point (cx, cy), optional rotation. */
export function cam(ctx, z = 1, cx = 540, cy = 960, rot = 0) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(540, 960); ctx.rotate(rot); ctx.scale(z, z); ctx.translate(-cx, -cy);
}
/** Overshoot pop 0..~1.1..1 (t0 = start time). */
export const pop = (t, t0, dur = 0.45, s = 2.2) => (t < t0 ? 0 : ease.outBack(clamp((t - t0) / dur), s));
/** Smooth 0..1 between a and b with ease. */
export const pr = (t, a, b, fn = ease.inOutCubic) => fn(clamp((t - a) / Math.max(1e-6, b - a)));
/** Indonesian thousands format: 170000 -> "170.000". */
export const fmt = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

// ------------------------------------------------------------------ glows (cached sprites)
/** Soft radial sprite for a colour (built once). */
export function glowSprite(color, soft = 0.5) {
  return cached('fv-glow:' + color + ':' + soft, () => {
    const c = makeCanvas(128, 128), g = c.getContext('2d');
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, rgba(color, 1)); gr.addColorStop(soft * 0.4, rgba(color, 0.55)); gr.addColorStop(soft, rgba(color, 0.18)); gr.addColorStop(1, rgba(color, 0));
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return c;
  });
}
/** Stamp a glow of radius r. `add` uses additive blending (fine for small areas). */
export function glow(ctx, x, y, r, color, a = 1, add = false, soft = 0.5) {
  if (a <= 0 || r <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; if (add) ctx.globalCompositeOperation = 'lighter';
  ctx.drawImage(glowSprite(color, soft), x - r, y - r, r * 2, r * 2); ctx.restore();
}
/** Two-stop radial fill (lit top-left), the house shading for every round thing. */
export function ball(ctx, x, y, r, c0, c1, { lx = -0.35, ly = -0.4 } = {}) {
  const g = ctx.createRadialGradient(x + lx * r, y + ly * r, r * 0.1, x, y, r * 1.05);
  g.addColorStop(0, c0); g.addColorStop(1, c1);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
}

// ------------------------------------------------------------------ backgrounds
/** Deep space: vertical 2-stop gradient (cached) + twinkling parallax stars. cx/cy = camera centre for parallax. */
export function space(ctx, t, { top = PAL.space0, bottom = PAL.space2, stars = 1, px = 0, py = 0, seed = 3 } = {}) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const bg = cached('fv-space:' + top + bottom, () => {
    const c = makeCanvas(54, 96), g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 96); gr.addColorStop(0, top); gr.addColorStop(1, bottom);
    g.fillStyle = gr; g.fillRect(0, 0, 54, 96); return c;
  });
  ctx.imageSmoothingQuality = 'high'; ctx.drawImage(bg, 0, 0, 1080, 1920);
  if (stars > 0) starfield(ctx, t, { alpha: stars, px, py, seed });
  ctx.restore();
}
const STARS = {};
function starList(seed) {
  if (STARS[seed]) return STARS[seed];
  const r = mulberry32(seed), L = [];
  for (let i = 0; i < 260; i++) L.push({ x: r() * 1300 - 110, y: r() * 2140 - 110, s: 0.8 + r() * r() * 3.2, d: 0.2 + r() * 0.8, ph: r() * TAU, k: (r() * 3) | 0 });
  return (STARS[seed] = L);
}
/** Stars in 3 brightness groups, one path each (cheap). */
export function starfield(ctx, t, { alpha = 1, px = 0, py = 0, seed = 3 } = {}) {
  const L = starList(seed);
  const groups = [[], [], []];
  for (const s of L) {
    const x = ((s.x - px * s.d) % 1300 + 1300) % 1300 - 110, y = ((s.y - py * s.d) % 2140 + 2140) % 2140 - 110;
    const tw = 0.5 + 0.5 * Math.sin(t * (1 + s.d * 2) + s.ph);
    groups[Math.min(2, (tw * 3) | 0)].push([x, y, s.s]);
  }
  groups.forEach((G, i) => {
    ctx.fillStyle = `rgba(235,240,255,${alpha * (0.3 + i * 0.3)})`;
    ctx.beginPath(); for (const [x, y, s] of G) { ctx.moveTo(x + s, y); ctx.arc(x, y, s, 0, TAU); } ctx.fill();
  });
}

// ------------------------------------------------------------------ characters
/**
 * The photon: a small glowing ball with dot eyes. Squash & stretch along its velocity.
 * o: { r, t, vx, vy (px/s, for stretch), heat 0 (gamma violet) .. 1 (warm yellow), mood: happy|dizzy|wow|calm|sleep,
 *      look:[dx,dy] (-1..1), squash (0..1 impact squash), wave (0..1 hand wave), alpha, seed }
 */
export function photon(ctx, x, y, o = {}) {
  const { r = 40, t = 0, vx = 0, vy = 0, heat = 1, mood = 'happy', look = [0, 0], squash = 0, alpha = 1, seed = 1, glowA = 1, trailCol = null } = o;
  const col = mixHex(PAL.gamma, PAL.photon, heat), deep = mixHex('#5b44d6', '#ffb01f', heat), hi = mixHex('#d9d0ff', '#fffbe3', heat);
  ctx.save(); ctx.globalAlpha *= alpha;
  glow(ctx, x, y, r * 4.2, col, 0.55 * glowA, true, 0.45);
  glow(ctx, x, y, r * 2.0, hi, 0.5 * glowA, true, 0.6);
  const sp = Math.hypot(vx, vy), ang = Math.atan2(vy, vx);
  const st = clamp(sp / 3000, 0, 0.38);
  const idle = Math.sin(t * 5 + seed) * 0.035;
  ctx.translate(x, y); ctx.rotate(ang);
  const sx = (1 + st - squash * 0.35 + idle), sy = (1 / (1 + st) + squash * 0.3 - idle);
  ctx.scale(sx, sy); ctx.rotate(-ang);
  // body
  ball(ctx, 0, 0, r, hi, col);
  ctx.fillStyle = rgba(deep, 0.35); ctx.beginPath(); ctx.arc(0, 0, r, 0.15 * Math.PI, 0.85 * Math.PI); ctx.arc(0, -r * 0.25, r * 0.9, 0.85 * Math.PI, 0.15 * Math.PI, true); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.ellipse(-r * 0.38, -r * 0.45, r * 0.2, r * 0.12, -0.6, 0, TAU); ctx.fill();
  face(ctx, 0, 0, r, { t, mood, look, seed, ink: mixHex('#1d1450', '#3a2208', heat) });
  ctx.restore();
}
/** Dot-eye face used by every character (eyes ~ r*0.13). */
export function face(ctx, x, y, r, { t = 0, mood = 'happy', look = [0, 0], seed = 1, ink = '#1b1430', blush = true } = {}) {
  const ex = r * 0.34, ey = -r * 0.08 + look[1] * r * 0.08, lx = look[0] * r * 0.12, es = r * 0.13;
  const blink = (t + seed * 1.7) % 3.4 < 0.13;
  ctx.fillStyle = ink; ctx.strokeStyle = ink; ctx.lineCap = 'round'; ctx.lineWidth = Math.max(2, r * 0.07);
  for (const sd of [-1, 1]) {
    const X = x + sd * ex + lx, Y = y + ey;
    if (mood === 'dizzy') { ctx.beginPath(); ctx.moveTo(X - es, Y - es); ctx.lineTo(X + es, Y + es); ctx.moveTo(X + es, Y - es); ctx.lineTo(X - es, Y + es); ctx.stroke(); }
    else if (mood === 'sleep' || mood === 'joy' || blink) { ctx.beginPath(); if (mood === 'joy') ctx.arc(X, Y + es * 0.5, es * 1.05, Math.PI * 1.1, Math.PI * 1.9); else ctx.arc(X, Y - es * 0.4, es * 1.05, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke(); }
    else { const k = mood === 'wow' ? 1.35 : 1; ctx.beginPath(); ctx.ellipse(X, Y, es * k, es * 1.18 * k, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.beginPath(); ctx.arc(X - es * 0.3, Y - es * 0.4, es * 0.33, 0, TAU); ctx.fill(); ctx.fillStyle = ink; }
  }
  if (blush && mood !== 'dizzy') { ctx.fillStyle = 'rgba(255,110,140,.45)'; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.ellipse(x + sd * r * 0.55 + lx, y + r * 0.18, r * 0.13, r * 0.08, 0, 0, TAU); ctx.fill(); } }
  ctx.beginPath();
  if (mood === 'wow') { ctx.ellipse(x + lx, y + r * 0.3, r * 0.09, r * 0.12, 0, 0, TAU); ctx.fill(); }
  else if (mood === 'dizzy') { ctx.moveTo(x - r * 0.15 + lx, y + r * 0.32); ctx.quadraticCurveTo(x + lx, y + r * 0.22, x + r * 0.15 + lx, y + r * 0.34); ctx.stroke(); }
  else if (mood !== 'calm') { ctx.arc(x + lx, y + r * 0.17, r * 0.14, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke(); }
}

/**
 * A person, front view, chest up (original design: round head, bob hair, dot eyes, teal shirt).
 * o: { s, t, mood: calm|joy|sleep|wow, lit (0..1 warm light from the right), look, tilt, breathe }
 */
export function person(ctx, x, y, o = {}) {
  const { s = 1, t = 0, mood = 'calm', lit = 0, look = [0, 0], tilt = 0, seed = 2 } = o;
  const breathe = Math.sin(t * 1.8) * 4;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // shoulders / shirt
  ctx.save(); ctx.translate(0, breathe * 0.5);
  const sh = ctx.createLinearGradient(-260, 260, 260, 520); sh.addColorStop(0, '#36c9b8'); sh.addColorStop(1, '#1f8f86');
  ctx.fillStyle = sh; ctx.beginPath(); ctx.moveTo(-300, 620); ctx.bezierCurveTo(-300, 380, -200, 300, 0, 300); ctx.bezierCurveTo(200, 300, 300, 380, 300, 620); ctx.closePath(); ctx.fill();
  ctx.fillStyle = PAL.skinShade; roundRect(ctx, -62, 170, 124, 160, 50); ctx.fill(); // neck
  ctx.fillStyle = '#29a597'; ctx.beginPath(); ctx.ellipse(0, 312, 92, 30, 0, 0, Math.PI); ctx.fill();
  ctx.restore();
  ctx.rotate(tilt + Math.sin(t * 0.9 + seed) * 0.02);
  const R = 210;
  // hair back
  ctx.fillStyle = PAL.hair; ctx.beginPath(); ctx.ellipse(0, -20, R * 1.12, R * 1.13, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); roundRect(ctx, -R * 1.12, -20, R * 2.24, R * 1.05, 60); ctx.fill();
  // ears
  ball(ctx, -R * 0.98, 30, 42, PAL.skinLit, PAL.skin); ball(ctx, R * 0.98, 30, 42, PAL.skinLit, PAL.skin);
  // head
  ball(ctx, 0, 0, R, PAL.skinLit, PAL.skin, { lx: 0.2, ly: -0.35 });
  if (lit > 0) { // warm side light: clip to head, gradient from the right
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.clip();
    const g = ctx.createLinearGradient(R * 1.1, -R, -R * 0.2, R * 0.4);
    g.addColorStop(0, `rgba(255,236,170,${0.85 * lit})`); g.addColorStop(0.55, `rgba(255,190,110,${0.25 * lit})`); g.addColorStop(1, 'rgba(255,190,110,0)');
    ctx.fillStyle = g; ctx.fillRect(-R, -R, R * 2, R * 2); ctx.restore();
  }
  // fringe
  ctx.fillStyle = PAL.hair; ctx.beginPath();
  ctx.moveTo(-R * 1.05, -10); ctx.bezierCurveTo(-R * 1.05, -R * 1.25, R * 1.05, -R * 1.25, R * 1.05, -10);
  ctx.bezierCurveTo(R * 0.8, -R * 0.55, R * 0.3, -R * 0.62, R * 0.05, -R * 0.42);
  ctx.bezierCurveTo(-R * 0.2, -R * 0.65, -R * 0.75, -R * 0.55, -R * 1.05, -10); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.beginPath(); ctx.ellipse(-R * 0.45, -R * 0.82, R * 0.32, R * 0.08, -0.35, 0, TAU); ctx.fill();
  face(ctx, 0, R * 0.18, R * 0.95, { t, mood, look, seed, ink: '#2a1830' });
  ctx.restore();
}

// ------------------------------------------------------------------ the sun (with cutaway)
/**
 * Sun disc with a cutaway wedge showing its layers. Layer radii (fractions of R): core 0.25, radiative 0.7, convective 1.
 * o: { cut 0..1 (wedge opening), a0 (wedge centre angle), t, glowA, labels: false }
 * Returns layer geometry so scenes can place things inside.
 */
export function sun(ctx, x, y, R, t, o = {}) {
  const { cut = 0, a0 = -Math.PI * 0.5, open = Math.PI * 0.5, glowA = 1, spin = 0.02 } = o;
  glow(ctx, x, y, R * 2.3, '#ff9d3c', 0.55 * glowA, false, 0.5);
  glow(ctx, x, y, R * 1.45, '#ffd36a', 0.6 * glowA, false, 0.6);
  // surface (cached granulation texture, rotated slowly)
  const tex = cached('fv-sunsurf', () => {
    const N = 640, c = makeCanvas(N, N), g = c.getContext('2d'), h = N / 2;
    const gr = g.createRadialGradient(h * 0.82, h * 0.78, h * 0.1, h, h, h);
    gr.addColorStop(0, '#fff0a8'); gr.addColorStop(0.55, '#ffc24a'); gr.addColorStop(0.9, '#ff8f37'); gr.addColorStop(1, '#f2672f');
    g.fillStyle = gr; g.beginPath(); g.arc(h, h, h, 0, TAU); g.fill();
    g.save(); g.beginPath(); g.arc(h, h, h, 0, TAU); g.clip();
    const r = mulberry32(4);
    for (let i = 0; i < 220; i++) { const a = r() * TAU, d = Math.sqrt(r()) * h, cx = h + Math.cos(a) * d, cy = h + Math.sin(a) * d, rr = 10 + r() * 22; g.fillStyle = r() < 0.6 ? 'rgba(255,250,215,.07)' : 'rgba(220,100,40,.05)'; g.beginPath(); g.arc(cx, cy, rr, 0, TAU); g.fill(); }
    const limb = g.createRadialGradient(h, h, h * 0.7, h, h, h); limb.addColorStop(0, 'rgba(230,80,40,0)'); limb.addColorStop(1, 'rgba(230,80,40,.35)');
    g.fillStyle = limb; g.fillRect(0, 0, N, N);
    g.restore(); return c;
  });
  ctx.save(); ctx.translate(x, y); ctx.rotate(t * spin);
  ctx.drawImage(tex, -R, -R, R * 2, R * 2); ctx.restore();
  if (cut > 0.001) {
    const half = cut * open * 0.5;
    ctx.save(); ctx.translate(x, y);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R * 1.002, a0 - half, a0 + half); ctx.closePath(); ctx.clip();
    sunInterior(ctx, R, t);
    ctx.restore();
    // wedge edge shading
    ctx.save(); ctx.translate(x, y); ctx.strokeStyle = 'rgba(120,30,20,.35)'; ctx.lineWidth = Math.max(2, R * 0.012);
    ctx.beginPath(); ctx.moveTo(Math.cos(a0 - half) * R, Math.sin(a0 - half) * R); ctx.lineTo(0, 0); ctx.lineTo(Math.cos(a0 + half) * R, Math.sin(a0 + half) * R); ctx.stroke(); ctx.restore();
  }
  return { core: R * 0.25, rad: R * 0.7, R };
}
/** Interior layers, drawn centred at 0,0 (call inside a clip). */
export function sunInterior(ctx, R, t) {
  // convective zone
  ball(ctx, 0, 0, R, '#e8573a', '#b8333a', { lx: 0, ly: 0 });
  // rolling convection cells
  ctx.save();
  const n = 16;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU, cx = Math.cos(a) * R * 0.85, cy = Math.sin(a) * R * 0.85, rr = R * 0.12;
    ctx.strokeStyle = 'rgba(255,190,120,.55)'; ctx.lineWidth = R * 0.02; ctx.lineCap = 'round';
    const sp = (i % 2 ? 1 : -1) * t * 1.6;
    ctx.beginPath(); ctx.arc(cx, cy, rr, sp, sp + Math.PI * 1.3); ctx.stroke();
  }
  ctx.restore();
  // radiative zone
  ball(ctx, 0, 0, R * 0.7, '#ffb54a', '#ff8c37', { lx: 0, ly: 0 });
  ctx.strokeStyle = 'rgba(255,240,200,.28)'; ctx.lineWidth = R * 0.006;
  for (let k = 1; k < 7; k++) { ctx.beginPath(); ctx.arc(0, 0, R * (0.28 + k * 0.06), 0, TAU); ctx.stroke(); }
  // core
  glow(ctx, 0, 0, R * 0.5, '#ffffff', 1, false, 0.7);
  ball(ctx, 0, 0, R * 0.25, '#ffffff', '#ffe066', { lx: 0, ly: 0 });
  ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.beginPath(); ctx.arc(0, 0, R * 0.12, 0, TAU); ctx.fill();
}

// ------------------------------------------------------------------ planets
const LAND = (() => { const r = mulberry32(11), L = []; for (let i = 0; i < 9; i++) L.push({ lon: r() * TAU, lat: (r() - 0.5) * 2.2, rad: 0.22 + r() * 0.35, seed: r() * 50 }); return L; })();
/** Flat globe: ocean ball, land blobs on a sphere (orthographic), night side, atmosphere glow. */
export function earth(ctx, x, y, r, t, { spin = 0.25, night = 0.5, glowA = 1, sunDir = -0.8 } = {}) {
  glow(ctx, x, y, r * 1.5, '#5fb6ff', 0.45 * glowA, false, 0.55);
  ball(ctx, x, y, r, '#4aa0ff', PAL.sea2);
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
  ctx.fillStyle = PAL.land;
  const rot = t * spin;
  for (const b of LAND) {
    ctx.beginPath(); let started = false;
    for (let k = 0; k <= 28; k++) {
      const a = (k / 28) * TAU, w = b.rad * (1 + 0.35 * noise.n2(Math.cos(a) + b.seed, Math.sin(a) + b.seed));
      const lon = b.lon + Math.cos(a) * w + rot, lat = clamp(b.lat + Math.sin(a) * w * 0.8, -1.5, 1.5);
      const cz = Math.cos(lat) * Math.cos(lon), px = Math.cos(lat) * Math.sin(lon), py = -Math.sin(lat);
      const X = x + px * r * (cz < 0 ? 1.02 : 1), Y = y + py * r;
      if (cz < -0.05 && !started) continue;
      if (!started) { ctx.moveTo(X, Y); started = true; } else ctx.lineTo(X, Y);
    }
    ctx.fill();
  }
  // night side
  const g = ctx.createLinearGradient(x + Math.cos(sunDir) * r, y + Math.sin(sunDir) * r, x - Math.cos(sunDir) * r, y - Math.sin(sunDir) * r);
  g.addColorStop(0, 'rgba(10,15,50,0)'); g.addColorStop(0.55, 'rgba(10,15,50,0)'); g.addColorStop(1, `rgba(8,12,40,${night})`);
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(x - r * 0.45, y - r * 0.5, r * 0.2, r * 0.1, -0.7, 0, TAU); ctx.fill();
}

// ------------------------------------------------------------------ plasma particles
/** Drifting plasma particles (flat balls) inside a rect; one path per colour. Returns nothing. */
export function plasma(ctx, t, { x = 0, y = 0, w = 1080, h = 1920, n = 70, seed = 5, speed = 1, cols = ['#ff7d5a', '#ffb347', '#ffe1a0'], rmin = 10, rmax = 26, alpha = 1, avoid = null } = {}) {
  const r = mulberry32(seed);
  const groups = cols.map(() => []);
  for (let i = 0; i < n; i++) {
    const bx = r() * w, by = r() * h, k = (r() * cols.length) | 0, rr = rmin + r() * (rmax - rmin), ph = r() * TAU, sp = (0.4 + r()) * speed;
    let px = x + ((bx + noise.n2(i * 3.1, t * 0.25 * sp) * 120 + t * 14 * sp) % w + w) % w;
    let py = y + ((by + noise.n2(i * 7.7, t * 0.25 * sp + 9) * 120) % h + h) % h;
    if (avoid) { const dx = px - avoid[0], dy = py - avoid[1], d = Math.hypot(dx, dy); if (d < avoid[2]) { px = avoid[0] + dx / (d || 1) * avoid[2]; py = avoid[1] + dy / (d || 1) * avoid[2]; } }
    groups[k].push([px, py, rr * (1 + 0.06 * Math.sin(t * 3 + ph))]);
  }
  ctx.save(); ctx.globalAlpha *= alpha;
  groups.forEach((G, k) => {
    ctx.fillStyle = cols[k]; ctx.beginPath(); for (const [px, py, rr] of G) { ctx.moveTo(px + rr, py); ctx.arc(px, py, rr, 0, TAU); } ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); for (const [px, py, rr] of G) { ctx.moveTo(px - rr * 0.25, py - rr * 0.35); ctx.arc(px - rr * 0.35, py - rr * 0.35, rr * 0.28, 0, TAU); } ctx.fill();
  });
  ctx.restore();
}

// ------------------------------------------------------------------ random walk (real simulation)
/** Deterministic 2D random walk: n steps of length ~step (varies), returns [[x,y],...]. */
export function randomWalk(seed, n, step, x0 = 0, y0 = 0, bias = [0, 0]) {
  return cached(`fv-rw:${seed}:${n}:${step}:${x0}:${y0}:${bias}`, () => {
    const r = mulberry32(seed), P = [[x0, y0]];
    let x = x0, y = y0;
    for (let i = 0; i < n; i++) { const a = r() * TAU, L = step * (0.45 + r() * 1.1); x += Math.cos(a) * L + bias[0]; y += Math.sin(a) * L + bias[1]; P.push([x, y]); }
    return P;
  });
}
/** Random walk that stays inside a region: inside(x,y) -> bool; a step that would leave is re-rolled. */
export function boundedWalk(seed, n, step, inside, x0 = 0, y0 = 0, bias = [0, 0]) {
  return cached(`fv-bw:${seed}:${n}:${step}:${x0}:${y0}:${bias}`, () => {
    const r = mulberry32(seed), P = [[x0, y0]];
    let x = x0, y = y0;
    for (let i = 0; i < n; i++) {
      for (let k = 0; k < 12; k++) { const a = r() * TAU, L = step * (0.45 + r() * 1.1), nx = x + Math.cos(a) * L + bias[0], ny = y + Math.sin(a) * L + bias[1]; if (inside(nx, ny) || k === 11) { if (inside(nx, ny)) { x = nx; y = ny; } break; } }
      P.push([x, y]);
    }
    return P;
  });
}
/** Position along a polyline at fractional vertex index u (0..n). Also returns segment velocity direction. */
export function along(P, u) {
  const i = clamp(Math.floor(u), 0, P.length - 2), f = clamp(u - i, 0, 1);
  const a = P[i], b = P[i + 1];
  return { x: lerp(a[0], b[0], f), y: lerp(a[1], b[1], f), dx: b[0] - a[0], dy: b[1] - a[1], i, f };
}
/** Fading trail of the first u vertices (newest bright). */
export function trail(ctx, P, u, { color = '#ffe86b', width = 6, fade = 60, alpha = 1, old = 0.18 } = {}) {
  const n = Math.floor(u); if (n < 1 && u <= 0) return;
  const cur = along(P, u);
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = color;
  const bands = 6;
  for (let b = 0; b < bands; b++) {
    const lo = Math.max(0, n - fade * (b + 1) / bands), hi = Math.max(0, n - fade * b / bands);
    if (hi <= lo && b > 0) continue;
    ctx.globalAlpha = alpha * (0.9 - b * 0.13); ctx.lineWidth = width * (1 - b * 0.1);
    ctx.beginPath(); ctx.moveTo(P[Math.floor(lo)][0], P[Math.floor(lo)][1]);
    for (let i = Math.floor(lo) + 1; i <= hi; i++) ctx.lineTo(P[i][0], P[i][1]);
    if (b === 0) ctx.lineTo(cur.x, cur.y);
    ctx.stroke();
  }
  // the old path stays faintly
  if (n - fade > 1) { ctx.globalAlpha = alpha * old; ctx.lineWidth = width * 0.6; ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]); for (let i = 1; i <= n - fade; i++) ctx.lineTo(P[i][0], P[i][1]); ctx.stroke(); }
  ctx.restore();
}
/** Expanding impact ring (age in seconds). */
export function ring(ctx, x, y, age, { r = 60, color = '#ffffff', life = 0.35, w = 6 } = {}) {
  if (age < 0 || age > life) return;
  const p = age / life;
  ctx.save(); ctx.globalAlpha *= (1 - p); ctx.strokeStyle = color; ctx.lineWidth = w * (1 - p * 0.6);
  ctx.beginPath(); ctx.arc(x, y, r * ease.outCubic(p), 0, TAU); ctx.stroke(); ctx.restore();
}
/** Burst of short sparkle rays. */
export function burst(ctx, x, y, age, { n = 10, r0 = 30, r1 = 140, color = '#fff3b0', life = 0.5, w = 7, seed = 1 } = {}) {
  if (age < 0 || age > life) return;
  const p = ease.outCubic(age / life);
  ctx.save(); ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.globalAlpha *= 1 - age / life; ctx.lineWidth = w;
  ctx.beginPath();
  for (let i = 0; i < n; i++) { const a = (i / n) * TAU + hrand(seed, i) * 0.4, ra = lerp(r0, r1, p * 0.6), rb = lerp(r0, r1, p); ctx.moveTo(x + Math.cos(a) * ra, y + Math.sin(a) * ra); ctx.lineTo(x + Math.cos(a) * rb, y + Math.sin(a) * rb); }
  ctx.stroke(); ctx.restore();
}
/** Speed lines behind a moving object (direction ang, pointing backwards). */
export function speedLines(ctx, x, y, ang, t, { n = 7, len = 240, spread = 60, color = 'rgba(255,240,190,.7)', w = 5 } = {}) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.lineWidth = w; ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const off = (i / (n - 1) - 0.5) * spread * 2, ph = (t * 6 + hrand(i, 3)) % 1, L = len * (0.5 + hrand(i, 4) * 0.5);
    const bx = x - Math.cos(ang) * (60 + ph * 80) - Math.sin(ang) * off, by = y - Math.sin(ang) * (60 + ph * 80) + Math.cos(ang) * off;
    ctx.moveTo(bx, by); ctx.lineTo(bx - Math.cos(ang) * L * (1 - ph * 0.5), by - Math.sin(ang) * L * (1 - ph * 0.5));
  }
  ctx.stroke(); ctx.restore();
}

// ------------------------------------------------------------------ labels
/** Pill badge (pop progress p 0..1+). align: 'center' | 'left'. */
export function badge(ctx, text, x, y, { p = 1, size = 44, bg = 'rgba(255,255,255,.14)', fg = '#ffffff', weight = 700, font = 'Poppins', accent = null, align = 'center', sub = null, subSize = 0.62, padX = 0.7 } = {}) {
  if (p <= 0.001) return;
  ctx.save();
  ctx.font = `${weight} ${size}px '${font}'`;
  const w = ctx.measureText(text).width; let sw = 0;
  if (sub) { ctx.font = `600 ${size * subSize}px '${font}'`; sw = ctx.measureText(sub).width; }
  const W = Math.max(w, sw) + size * padX * 2 + (accent ? size * 0.9 : 0), H = size * (sub ? 2.05 : 1.45);
  const cx = align === 'left' ? x + W / 2 : x;
  ctx.translate(cx, y); ctx.scale(p, p); ctx.globalAlpha *= clamp(p * 1.4);
  ctx.fillStyle = 'rgba(4,8,30,.35)'; roundRect(ctx, -W / 2 + 4, -H / 2 + 8, W, H, H / 2); ctx.fill();
  ctx.fillStyle = bg; roundRect(ctx, -W / 2, -H / 2, W, H, H / 2); ctx.fill();
  let tx = 0;
  if (accent) { ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(-W / 2 + size * 0.75, 0, size * 0.22, 0, TAU); ctx.fill(); tx = size * 0.45; }
  ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `${weight} ${size}px '${font}'`;
  ctx.fillText(text, tx, sub ? -size * 0.36 : size * 0.04);
  if (sub) { ctx.globalAlpha *= 0.75; ctx.font = `600 ${size * subSize}px '${font}'`; ctx.fillText(sub, tx, size * 0.52); }
  ctx.restore();
}
/** Big rounded headline with soft drop shadow. */
export function headline(ctx, text, x, y, { size = 84, color = '#ffffff', p = 1, font = 'Poppins', weight = 800, accent = null, spacing = 0 } = {}) {
  if (p <= 0.001) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(lerp(0.85, 1, clamp(p)), lerp(0.85, 1, clamp(p))); ctx.globalAlpha *= clamp(p * 1.3);
  ctx.font = `${weight} ${size}px '${font}'`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; if (spacing) ctx.letterSpacing = spacing + 'px';
  ctx.fillStyle = 'rgba(4,8,30,.45)'; ctx.fillText(text, 3, 7);
  ctx.fillStyle = accent || color; ctx.fillText(text, 0, 0);
  ctx.restore();
}
/** Callout: dot on target, line drawing on to a label anchor. p 0..1. */
export function callout(ctx, tx, ty, lx, ly, p, { color = '#ffffff', w = 4 } = {}) {
  if (p <= 0) return;
  const q = clamp(p * 1.6), q2 = clamp(p * 1.6 - 0.3);
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(tx, ty, 9 * ease.outBack(q), 0, TAU); ctx.fill();
  const mx = lerp(tx, lx, ease.inOutCubic(q2)), my = lerp(ty, ly, ease.inOutCubic(q2));
  if (q2 > 0) { ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(mx, my); ctx.stroke(); }
  ctx.restore();
}
/** Rolling counter text (tabular digits). */
export function counter(ctx, value, x, y, { size = 120, color = '#ffffff', prefix = '', suffix = '', p = 1, font = 'Poppins', weight = 800, align = 'center' } = {}) {
  if (p <= 0.001) return;
  ctx.save(); ctx.globalAlpha *= clamp(p * 1.4); ctx.font = `${weight} ${size}px '${font}'`; ctx.textAlign = align; ctx.textBaseline = 'middle';
  ctx.fontVariantNumeric = 'tabular-nums';
  const s = prefix + (typeof value === 'number' ? fmt(value) : value) + suffix;
  ctx.fillStyle = 'rgba(4,8,30,.45)'; ctx.fillText(s, x + 3, y + 8);
  ctx.fillStyle = color; ctx.fillText(s, x, y); ctx.restore();
}

// ------------------------------------------------------------------ icons (flat, no outline)
/** Flat icons: 'pyramid', 'wheat', 'cave', 'clock', 'sun', 'earth', 'home'. Size ~ s*100 px. */
export function icon(ctx, name, x, y, s = 1, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (name === 'pyramid') {
    ctx.fillStyle = '#f6c26b'; ctx.beginPath(); ctx.moveTo(0, -52); ctx.lineTo(-62, 40); ctx.lineTo(10, 40); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d68a3c'; ctx.beginPath(); ctx.moveTo(0, -52); ctx.lineTo(10, 40); ctx.lineTo(62, 28); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e3a44f'; ctx.fillRect(-80, 40, 160, 8);
  } else if (name === 'wheat') {
    ctx.strokeStyle = '#e9b949'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    for (const [dx, a] of [[-18, -0.2], [0, 0], [18, 0.2]]) {
      ctx.save(); ctx.translate(dx, 45); ctx.rotate(a);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -80); ctx.stroke();
      ctx.fillStyle = '#ffd36a';
      for (let k = 0; k < 4; k++) for (const sd of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sd * 8, -50 - k * 13, 6, 11, sd * 0.5, 0, TAU); ctx.fill(); }
      ctx.beginPath(); ctx.ellipse(0, -104, 5, 11, 0, 0, TAU); ctx.fill(); ctx.restore();
    }
  } else if (name === 'cave') {
    ball(ctx, 0, 0, 60, '#f0d3ab', '#d6ae80');
    ctx.fillStyle = PAL.ochre; // little pig in red ochre
    ctx.beginPath(); ctx.ellipse(-4, 6, 30, 17, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(26, 0, 12, 10, 0.3, 0, TAU); ctx.fill();
    ctx.lineWidth = 5; ctx.strokeStyle = PAL.ochre; ctx.lineCap = 'round';
    for (const lx of [-22, -10, 6, 16]) { ctx.beginPath(); ctx.moveTo(lx, 18); ctx.lineTo(lx, 34); ctx.stroke(); }
    ctx.globalAlpha = 0.55; ctx.beginPath(); ctx.arc(-30, -30, 13, 0, TAU); ctx.fill(); // hand stencil-ish spray
  } else if (name === 'clock') {
    ball(ctx, 0, 0, 50, '#ffffff', '#cfd8ff');
    ctx.strokeStyle = PAL.ink; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(t * 6) * 30, Math.sin(t * 6) * 30); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(t * 0.5) * 20, Math.sin(t * 0.5) * 20); ctx.stroke();
  } else if (name === 'face') {
    ball(ctx, 0, 0, 50, PAL.skinLit, PAL.skin); ctx.fillStyle = PAL.hair; ctx.beginPath(); ctx.arc(0, -6, 52, Math.PI * 1.02, Math.PI * 1.98); ctx.fill();
    face(ctx, 0, 10, 46, { t, mood: 'joy' });
  }
  ctx.restore();
}

// ------------------------------------------------------------------ light beam + transitions
/** Soft light beam polygon from (x0,y0) widening to (x1,y1). */
export function beam(ctx, x0, y0, x1, y1, w0, w1, a = 1, color = '#ffd77a') {
  const ang = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(ang), ny = Math.cos(ang);
  const g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, rgba(color, 0.55 * a)); g.addColorStop(1, rgba(color, 0.0));
  ctx.save(); ctx.fillStyle = g; ctx.beginPath();
  ctx.moveTo(x0 + nx * w0, y0 + ny * w0); ctx.lineTo(x1 + nx * w1, y1 + ny * w1); ctx.lineTo(x1 - nx * w1, y1 - ny * w1); ctx.lineTo(x0 - nx * w0, y0 - ny * w0); ctx.closePath(); ctx.fill(); ctx.restore();
}
/** Circle iris transition in screen space: covers everything outside a circle of radius r (navy). */
export function iris(ctx, cx, cy, r, color = PAL.space0) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = color; ctx.beginPath(); ctx.rect(0, 0, 1080, 1920); ctx.arc(cx, cy, Math.max(0, r), 0, TAU, true); ctx.fill('evenodd'); ctx.restore();
}
