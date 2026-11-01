// Maura Motion style kit: MANGA ACTION (black-and-white shonen manga page brought to life).
// Signature: panels that slide in / shatter, screentone dot shading, radial focus lines, ink splatter, huge
// onomatopoeia, impact frames (black/white inversion), intense eye close-ups. Original characters only.
import { clamp, lerp, ease, hrand, noise, mulberry32, TAU } from '/engine/lib/core.js';
import { makeCanvas, cached } from '/engine/lib/draw.js';

export const PAL = { ink: '#0e0e10', paper: '#f6f4ee', tone: '#bdbab2', mid: '#7d7a74', red: '#d7263d' };
const P = () => new Path2D();

// ---------------------------------------------------------------- tones & lines
/** Screentone pattern (dots). density: 'light'|'mid'|'dark'. Returns a CanvasPattern. */
export function tone(ctx, density = 'mid', scale = 1) {
  const cfg = { light: [14, 2.2], mid: [12, 3.4], dark: [10, 4.2], grad: [12, 3] }[density];
  const tile = cached(`mg-tone:${density}:${scale}`, () => {
    const [st, r] = cfg.map((v) => v * scale);
    const c = makeCanvas(Math.round(st * 2), Math.round(st * 2)), g = c.getContext('2d');
    g.fillStyle = PAL.ink;
    for (const [x, y] of [[0, 0], [st, st], [st * 2, 0], [0, st * 2], [st * 2, st * 2]]) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
    return c;
  });
  return ctx.createPattern(tile, 'repeat');
}
/** Fill a path with screentone. */
export function toneFill(ctx, path, density = 'mid', alpha = 1) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = tone(ctx, density); ctx.fill(path); ctx.restore();
}
/** Vertical gradient tone (dots growing toward the bottom), cached sprite of size w×h. */
export function gradTone(ctx, x, y, w, h, { invert = false, step = 14 } = {}) {
  const c = cached(`mg-gt:${w}:${h}:${invert}:${step}`, () => {
    const cv = makeCanvas(w, h), g = cv.getContext('2d'); g.fillStyle = PAL.ink;
    for (let yy = 0; yy < h; yy += step) for (let xx = (yy / step % 2) * step / 2; xx < w; xx += step) {
      const u = yy / h, r = (invert ? 1 - u : u) * step * 0.55;
      if (r > 0.4) { g.beginPath(); g.arc(xx, yy, r, 0, TAU); g.fill(); }
    }
    return cv;
  });
  ctx.drawImage(c, x, y);
}
/** Radial focus lines toward (cx,cy). Changes every 2 frames (boil). */
export function focusLines(ctx, cx, cy, t, { n = 110, inner = 260, outer = 1500, col = PAL.ink, w = 9, seed = 1, x0 = 0, y0 = 0, x1 = 1080, y1 = 1920 } = {}) {
  const f = Math.floor(t * 12);
  ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip(); ctx.fillStyle = col; ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + (hrand(i, seed, f) - 0.5) * 0.05, r0 = inner * (0.75 + hrand(i, seed + 1, f) * 0.7), ww = w * (0.3 + hrand(i, seed + 2, f));
    const ca = Math.cos(a), sa = Math.sin(a), px = -sa, py = ca;
    ctx.moveTo(cx + ca * r0, cy + sa * r0);
    ctx.lineTo(cx + ca * outer + px * ww, cy + sa * outer + py * ww); ctx.lineTo(cx + ca * outer - px * ww, cy + sa * outer - py * ww); ctx.closePath();
  }
  ctx.fill(); ctx.restore();
}
/** Parallel speed lines along angle ang inside a rect. */
export function speedLines(ctx, t, { ang = 0, x0 = 0, y0 = 0, x1 = 1080, y1 = 1920, n = 60, col = PAL.ink, w = 5, seed = 3, flow = 1 } = {}) {
  const f = Math.floor(t * 12);
  ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip();
  ctx.translate((x0 + x1) / 2, (y0 + y1) / 2); ctx.rotate(ang); ctx.fillStyle = col;
  const R = Math.hypot(x1 - x0, y1 - y0) / 2 + 50;
  for (let i = 0; i < n; i++) {
    const y = -R + hrand(i, seed) * 2 * R, L = 200 + hrand(i, seed + 1, f) * 700, x = -R + ((hrand(i, seed + 2, f) * 2 * R + t * 3000 * flow) % (2 * R));
    const ww = w * (0.4 + hrand(i, seed + 3));
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + L, y - ww / 2); ctx.lineTo(x + L, y + ww / 2); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
/** Ink splatter (cached per seed). */
export function splat(ctx, x, y, s = 1, seed = 1, col = PAL.ink, rot = 0) {
  const c = cached(`mg-splat:${seed}:${col}`, () => {
    const cv = makeCanvas(400, 400), g = cv.getContext('2d'), r = mulberry32(seed * 31 + 5); g.fillStyle = col;
    g.beginPath(); for (let i = 0; i <= 40; i++) { const a = i / 40 * TAU, rr = 70 + r() * 40 + (r() < 0.2 ? 40 : 0); i ? g.lineTo(200 + Math.cos(a) * rr, 200 + Math.sin(a) * rr) : g.moveTo(200 + Math.cos(a) * rr, 200 + Math.sin(a) * rr); } g.fill();
    for (let i = 0; i < 26; i++) { const a = r() * TAU, d = 110 + r() * 80, rr = 3 + r() * 14; g.beginPath(); g.arc(200 + Math.cos(a) * d, 200 + Math.sin(a) * d, rr, 0, TAU); g.fill(); }
    for (let i = 0; i < 8; i++) { const a = r() * TAU; g.lineWidth = 4 + r() * 6; g.strokeStyle = col; g.beginPath(); g.moveTo(200 + Math.cos(a) * 90, 200 + Math.sin(a) * 90); g.lineTo(200 + Math.cos(a) * (150 + r() * 50), 200 + Math.sin(a) * (150 + r() * 50)); g.stroke(); }
    return cv;
  });
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.drawImage(c, -200, -200); ctx.restore();
}

// ---------------------------------------------------------------- panels
/** Panel: clip region with a thick border. Call fn(ctx) to draw inside. k = slide-in progress, from = 'left'|'right'|'top'|'bottom'. */
export function panel(ctx, pts, fn, { k = 1, from = 'right', border = 10, bg = PAL.paper, shake = 0 } = {}) {
  if (k <= 0) return;
  const e = ease.outCubic(clamp(k));
  const off = (1 - e) * 1200, dx = from === 'left' ? -off : from === 'right' ? off : 0, dy = from === 'top' ? -off : from === 'bottom' ? off : 0;
  const p = P(); pts.forEach(([x, y], i) => (i ? p.lineTo(x + dx, y + dy) : p.moveTo(x + dx, y + dy))); p.closePath();
  ctx.save(); ctx.clip(p); ctx.fillStyle = bg; ctx.fillRect(-100, -100, 1300, 2200);
  ctx.translate(dx + shake, dy); fn(ctx);
  ctx.restore();
  ctx.save(); ctx.lineWidth = border; ctx.strokeStyle = PAL.ink; ctx.lineJoin = 'miter'; ctx.stroke(p); ctx.restore();
}
/** Paper background with a faint page texture. */
export function page(ctx) { ctx.fillStyle = PAL.paper; ctx.fillRect(-200, -200, 1500, 2400); }
/** Shattered panel shards flying apart (k 0..1) — the break transition. */
export function shatter(ctx, k, { cx = 540, cy = 900, seed = 2, col = PAL.ink } = {}) {
  if (k <= 0 || k >= 1) return;
  const r = mulberry32(seed);
  ctx.save(); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 6;
  for (let i = 0; i < 14; i++) {
    const a = r() * TAU, d = ease.outCubic(k) * (300 + r() * 900), sz = 80 + r() * 160;
    ctx.save(); ctx.translate(cx + Math.cos(a) * d, cy + Math.sin(a) * d); ctx.rotate(k * (r() - 0.5) * 6);
    ctx.globalAlpha = 1 - k; ctx.fillStyle = i % 3 ? PAL.paper : col;
    ctx.beginPath(); ctx.moveTo(0, -sz); ctx.lineTo(sz * 0.8, sz * 0.4); ctx.lineTo(-sz * 0.6, sz * 0.7); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

// ---------------------------------------------------------------- lettering
/** Big onomatopoeia: heavy slanted letters, white fill + black outline (or inverse), shaking, scaling in. */
export function sfxText(ctx, text, x, y, { size = 220, k = 1, rot = -0.12, t = 0, invert = false, shake = 6, skew = -0.25, font = 'Bangers' } = {}) {
  if (k <= 0) return;
  const f = Math.floor(t * 24);
  ctx.save(); ctx.translate(x + (hrand(f, 1) - 0.5) * shake, y + (hrand(f, 2) - 0.5) * shake); ctx.rotate(rot); ctx.transform(1, 0, skew, 1, 0, 0);
  const sc = ease.outBack(clamp(k), 3) * (1 + (1 - clamp(k)) * 1.2); ctx.scale(sc, sc);
  ctx.font = `400 ${size}px '${font}'`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.letterSpacing = '4px'; ctx.lineJoin = 'round';
  ctx.lineWidth = size * 0.22; ctx.strokeStyle = invert ? PAL.paper : PAL.ink; ctx.strokeText(text, 0, 0);
  ctx.lineWidth = size * 0.09; ctx.strokeStyle = invert ? PAL.ink : PAL.paper; ctx.strokeText(text, 0, 0);
  ctx.fillStyle = invert ? PAL.paper : PAL.ink; ctx.fillText(text, 0, 0);
  ctx.restore();
}
/** Caption box (narration box in a manga): black box, white text. */
export function capBox(ctx, text, x, y, { size = 44, alpha = 1, w = null, invert = false, font = 'Bebas Neue' } = {}) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.font = `400 ${size}px '${font}'`; ctx.letterSpacing = '3px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const tw = w || ctx.measureText(text).width + size;
  ctx.fillStyle = invert ? PAL.paper : PAL.ink; ctx.fillRect(x - tw / 2, y - size * 0.75, tw, size * 1.5);
  ctx.strokeStyle = invert ? PAL.ink : PAL.paper; ctx.lineWidth = 3; ctx.strokeRect(x - tw / 2 + 6, y - size * 0.75 + 6, tw - 12, size * 1.5 - 12);
  ctx.fillStyle = invert ? PAL.ink : PAL.paper; ctx.fillText(text, x, y + 2);
  ctx.restore();
}

// ---------------------------------------------------------------- props
/** Shuttlecock (cork + 16-feather skirt). Local: cork at origin, skirt opening along +x... ang = flight direction. */
export function shuttle(ctx, x, y, s = 1, { ang = 0, flare = 0, trail = 0, t = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
  if (trail > 0) { // motion trail behind (feathers trail behind the cork)
    const g = ctx.createLinearGradient(-60, 0, -60 - 900 * trail, 0); g.addColorStop(0, 'rgba(14,14,16,0.55)'); g.addColorStop(1, 'rgba(14,14,16,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-40, -70 - flare * 20); ctx.lineTo(-60 - 900 * trail, -20); ctx.lineTo(-60 - 900 * trail, 20); ctx.lineTo(-40, 70 + flare * 20); ctx.fill();
  }
  // feather skirt (behind the cork, opening backwards)
  const sk = P(); const R = 110 + flare * 30;
  sk.moveTo(-30, -36); sk.lineTo(-250, -R); sk.quadraticCurveTo(-268, 0, -250, R); sk.lineTo(-30, 36); sk.closePath();
  ctx.fillStyle = PAL.paper; ctx.fill(sk);
  ctx.save(); ctx.clip(sk); ctx.fillStyle = tone(ctx, 'light'); ctx.fillRect(-260, 0, 240, R + 10); ctx.restore();
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke(sk);
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 16; i++) { const u = i / 15 - 0.5; ctx.beginPath(); ctx.moveTo(-34, u * 66); ctx.lineTo(-252 + Math.abs(u) * 10, u * 2 * R * 0.98); ctx.stroke(); }
  // feather tips scallops
  ctx.lineWidth = 4; ctx.beginPath(); for (let i = 0; i <= 8; i++) { const u = i / 8 - 0.5; ctx.lineTo(-262 + Math.abs(u) * 26, u * 2 * R); } ctx.stroke();
  // thread bands
  ctx.lineWidth = 4; for (const xx of [-90, -140]) { const hh = 36 + (-(xx + 30)) / 220 * (R - 36); ctx.beginPath(); ctx.moveTo(xx, -hh); ctx.lineTo(xx, hh); ctx.stroke(); }
  // cork
  const ck = P(); ck.moveTo(-34, -40); ck.lineTo(10, -40); ck.arc(10, 0, 40, -Math.PI / 2, Math.PI / 2); ck.lineTo(-34, 40); ck.closePath();
  ctx.fillStyle = PAL.paper; ctx.fill(ck); ctx.save(); ctx.clip(ck); ctx.fillStyle = PAL.ink; ctx.fillRect(-36, 16, 90, 30); ctx.fillStyle = tone(ctx, 'mid'); ctx.fillRect(-36, -40, 30, 60); ctx.restore();
  ctx.lineWidth = 5; ctx.stroke(ck);
  ctx.restore();
}
/** Badminton racket. Local: grip end at origin, head along -y. */
export function racket(ctx, x, y, s = 1, rot = 0, { blur = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.lineCap = 'round';
  if (blur > 0) { ctx.fillStyle = 'rgba(14,14,16,0.25)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 620, -Math.PI / 2 - blur, -Math.PI / 2); ctx.closePath(); ctx.fill(); }
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 34; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -150); ctx.stroke();
  ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(0, -150); ctx.lineTo(0, -380); ctx.stroke();
  const head = P(); head.ellipse(0, -500, 95, 130, 0, 0, TAU);
  ctx.save(); ctx.clip(head); ctx.strokeStyle = PAL.mid; ctx.lineWidth = 2; for (let i = -6; i <= 6; i++) { ctx.beginPath(); ctx.moveTo(i * 15, -640); ctx.lineTo(i * 15, -360); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-100, -500 + i * 20); ctx.lineTo(100, -500 + i * 20); ctx.stroke(); } ctx.restore();
  ctx.lineWidth = 14; ctx.strokeStyle = PAL.ink; ctx.stroke(head);
  ctx.restore();
}
/** Generic open-wheel race car silhouette in ink (no branding). Local: ground at y=0, nose to +x. */
export function raceCar(ctx, x, y, s = 1, { t = 0, spin = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const body = P();
  body.moveTo(-420, -60); body.lineTo(-380, -120); body.lineTo(-120, -110); body.lineTo(-60, -170); body.lineTo(40, -170); body.lineTo(80, -110); body.lineTo(400, -80); body.lineTo(470, -50); body.lineTo(470, -30); body.lineTo(-420, -30); body.closePath();
  ctx.fillStyle = PAL.paper; ctx.fill(body); ctx.save(); ctx.clip(body); ctx.fillStyle = tone(ctx, 'mid'); ctx.fillRect(-430, -80, 920, 60); ctx.restore();
  ctx.lineWidth = 7; ctx.strokeStyle = PAL.ink; ctx.lineJoin = 'round'; ctx.stroke(body);
  ctx.fillStyle = PAL.ink; ctx.fillRect(-470, -210, 30, 160); ctx.fillRect(-500, -220, 150, 30); ctx.fillRect(420, -60, 120, 18);
  ctx.beginPath(); ctx.ellipse(-20, -170, 46, 30, 0, Math.PI, 0); ctx.fill();
  for (const wx of [-300, 300]) {
    ctx.save(); ctx.translate(wx, -60); ctx.rotate(spin);
    ctx.fillStyle = PAL.ink; ctx.beginPath(); ctx.arc(0, 0, 75, 0, TAU); ctx.fill();
    ctx.fillStyle = PAL.paper; ctx.beginPath(); ctx.arc(0, 0, 32, 0, TAU); ctx.fill();
    ctx.strokeStyle = PAL.ink; ctx.lineWidth = 5; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(i * 1.26) * 30, Math.sin(i * 1.26) * 30); ctx.stroke(); }
    ctx.restore();
  }
  ctx.restore();
}

// ---------------------------------------------------------------- characters
// Two original players. 'raka' (the smasher: spiky hair, headband) and 'dimas' (the reader: neat fringe, calm).
export const PLAYERS = { raka: { band: true, hair: 'spiky' }, dimas: { band: false, hair: 'fringe' } };

/** Intense manga eye strip (both eyes), centred at x,y, width ~ 900*s. mood: 'fierce'|'calm'|'shock'. look [-1..1]. */
export function eyeStrip(ctx, who, x, y, s = 1, { mood = 'fierce', look = [0, 0], t = 0, reflect = null, sweat = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // skin tone shading under the brows
  ctx.fillStyle = tone(ctx, 'light'); ctx.fillRect(-520, -200, 1040, 110);
  for (const sd of [-1, 1]) {
    const ex = sd * 220;
    const open = mood === 'fierce' ? 0.62 : mood === 'shock' ? 1.1 : 0.9;
    const eye = P();
    eye.moveTo(ex - sd * 150, 10); eye.quadraticCurveTo(ex - sd * 40, -90 * open, ex + sd * 160, -20 * open - 10);
    eye.quadraticCurveTo(ex + sd * 60, 70 * open, ex - sd * 150, 10); eye.closePath();
    ctx.fillStyle = PAL.paper; ctx.fill(eye);
    ctx.save(); ctx.clip(eye);
    const ix = ex + look[0] * 40 + sd * 6, iy = look[1] * 20, ir = mood === 'shock' ? 46 : 72;
    ctx.fillStyle = PAL.ink; ctx.beginPath(); ctx.arc(ix, iy, ir, 0, TAU); ctx.fill();
    ctx.fillStyle = tone(ctx, 'dark'); ctx.beginPath(); ctx.arc(ix, iy, ir * 0.82, 0, TAU); ctx.fillStyle = PAL.paper; ctx.fill(); ctx.fillStyle = tone(ctx, 'mid'); ctx.fill();
    // iris rays
    ctx.strokeStyle = PAL.ink; ctx.lineWidth = 3; for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; ctx.beginPath(); ctx.moveTo(ix + Math.cos(a) * ir * 0.35, iy + Math.sin(a) * ir * 0.35); ctx.lineTo(ix + Math.cos(a) * ir * 0.8, iy + Math.sin(a) * ir * 0.8); ctx.stroke(); }
    ctx.fillStyle = PAL.ink; ctx.beginPath(); ctx.arc(ix, iy, mood === 'fierce' ? ir * 0.18 : ir * 0.3, 0, TAU); ctx.fill();
    if (reflect) { ctx.save(); ctx.beginPath(); ctx.arc(ix, iy, ir * 0.75, 0, TAU); ctx.clip(); reflect(ctx, ix, iy, ir); ctx.restore(); }
    ctx.fillStyle = PAL.paper; ctx.beginPath(); ctx.ellipse(ix - 22, iy - 26, 16, 12, -0.4, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(ix + 20, iy + 22, 7, 0, TAU); ctx.fill();
    // upper lid shadow
    ctx.fillStyle = tone(ctx, 'dark'); ctx.fillRect(ex - 170, -120, 340, 30 + 40 * (1 - open));
    ctx.restore();
    ctx.lineWidth = 16; ctx.strokeStyle = PAL.ink; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(ex - sd * 150, 10); ctx.quadraticCurveTo(ex - sd * 40, -90 * open, ex + sd * 160, -20 * open - 10); ctx.stroke();
    ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(ex + sd * 140, 0); ctx.quadraticCurveTo(ex + sd * 40, 60 * open, ex - sd * 100, 30); ctx.stroke();
    // brow
    const bAng = mood === 'fierce' ? 0.28 : mood === 'shock' ? -0.15 : 0.05;
    ctx.save(); ctx.translate(ex, -150); ctx.rotate(sd * bAng); ctx.fillStyle = PAL.ink; ctx.beginPath(); ctx.moveTo(-170, 10); ctx.quadraticCurveTo(0, -30, 170, 0); ctx.lineTo(170, 22); ctx.quadraticCurveTo(0, -4, -170, 34); ctx.fill(); ctx.restore();
  }
  // nose bridge line
  ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(40, -40); ctx.lineTo(30, 140); ctx.stroke();
  // hair strands / headband crossing the top
  const C = PLAYERS[who];
  if (C.band) { ctx.fillStyle = PAL.ink; ctx.beginPath(); ctx.moveTo(-560, -330); ctx.lineTo(560, -300); ctx.lineTo(560, -230); ctx.lineTo(-560, -255); ctx.fill(); ctx.fillStyle = PAL.paper; ctx.fillRect(-60, -300, 120, 10); }
  ctx.fillStyle = PAL.ink;
  for (let i = 0; i < 9; i++) { const hx = -500 + i * 125 + Math.sin(t * 3 + i) * 6; ctx.beginPath(); ctx.moveTo(hx - 30, -400); ctx.lineTo(hx + 50, -400); ctx.lineTo(hx + 16 + (C.hair === 'spiky' ? 30 : 0), C.hair === 'spiky' ? -180 - (i % 3) * 30 : -205 - (i % 2) * 25); ctx.closePath(); ctx.fill(); }
  if (sweat > 0) { const k = (t * 1.2) % 1; ctx.fillStyle = PAL.paper; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 5; const d = P(); const sx = 470, sy = -120 + k * 120; d.moveTo(sx, sy - 40); d.quadraticCurveTo(sx + 24, sy + 6, sx, sy + 16); d.quadraticCurveTo(sx - 24, sy + 6, sx, sy - 40); ctx.fill(d); ctx.stroke(d); }
  ctx.restore();
}

/**
 * Player figure in ink (white fill, bold outline, tone shading, black hair). pose angles in radians:
 * { lean, legs:[[thigh,knee],[thigh,knee]], arms:[[shoulder,elbow],[shoulder,elbow]], racketAng } ; sil = solid black silhouette.
 */
export function player(ctx, who, x, y, s, pose, { sil = false, t = 0, face = 1, rim = true } = {}) {
  const C = PLAYERS[who];
  const { lean = 0, legs = [[0.1, 0.1], [-0.1, 0.1]], arms = [[0.2, 0.3], [-0.2, 0.3]], racketAng = 0, racketBlur = 0 } = pose;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * face, s);
  const H = [0, -980];
  const rot = (a, [px, py]) => [px * Math.cos(a) - py * Math.sin(a), px * Math.sin(a) + py * Math.cos(a)];
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const S = add(H, rot(lean, [0, -560]));
  const fillC = sil ? PAL.ink : PAL.paper;
  const lw = sil ? 0 : 9;
  const seg = (a, b, w0, w1, shade = false) => {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    const p = P(); p.moveTo(a[0] + nx * w0, a[1] + ny * w0); p.lineTo(b[0] + nx * w1, b[1] + ny * w1); p.arc(b[0], b[1], w1, Math.atan2(ny, nx), Math.atan2(-ny, -nx)); p.lineTo(a[0] - nx * w0, a[1] - ny * w0); p.arc(a[0], a[1], w0, Math.atan2(-ny, -nx), Math.atan2(ny, nx)); p.closePath();
    if (lw) { ctx.lineWidth = lw * 2; ctx.strokeStyle = PAL.ink; ctx.lineJoin = 'round'; ctx.stroke(p); }
    ctx.fillStyle = fillC; ctx.fill(p);
    if (!sil && shade) { ctx.save(); ctx.clip(p); ctx.translate(-14, 0); ctx.fillStyle = tone(ctx, 'mid'); ctx.fillRect(Math.min(a[0], b[0]) - 200, Math.min(a[1], b[1]) - 200, 400 + Math.abs(dx), 400 + Math.abs(dy)); ctx.restore(); ctx.save(); ctx.clip(p); ctx.translate(-20, 0); ctx.fillStyle = fillC; ctx.fill(p); ctx.restore(); }
    return p;
  };
  const limbPts = (base, a1, a2, l1, l2) => { const k = add(base, [Math.sin(a1) * l1, Math.cos(a1) * l1]); const e = add(k, [Math.sin(a1 - a2) * l2, Math.cos(a1 - a2) * l2]); return [k, e]; };
  const armPts = (base, a1, a2) => { const el = add(base, [Math.sin(a1 + lean) * 300, Math.cos(a1 + lean) * 300]); const hd = add(el, [Math.sin(a1 + a2 + lean) * 280, Math.cos(a1 + a2 + lean) * 280]); return [el, hd]; };
  // far arm, far leg
  const shB = add(S, rot(lean, [-40, 40])), shF = add(S, rot(lean, [40, 40]));
  const [elB, hdB] = armPts(shB, ...arms[1]);
  seg(shB, elB, 40, 34, true); seg(elB, hdB, 34, 30, true);
  const hipB = add(H, [-30, 0]), hipF = add(H, [30, 0]);
  const [knB, anB] = limbPts(hipB, ...legs[1], 480, 470);
  seg(hipB, knB, 56, 44, true); seg(knB, anB, 44, 32, true);
  const shoe = (an, a) => { ctx.save(); ctx.translate(an[0], an[1]); ctx.rotate(a * 0.5); const p = P(); p.roundRect(-40, -20, 150, 56, 24); if (lw) { ctx.lineWidth = lw * 2; ctx.strokeStyle = PAL.ink; ctx.stroke(p); } ctx.fillStyle = sil ? PAL.ink : PAL.paper; ctx.fill(p); if (!sil) { ctx.fillStyle = PAL.ink; ctx.fillRect(-40, 22, 150, 14); } ctx.restore(); };
  shoe(anB, legs[1][0] - legs[1][1]);
  // torso (jersey) + shorts
  ctx.save(); ctx.translate(H[0], H[1]); ctx.rotate(lean);
  const tor = P(); tor.moveTo(-60, -600); tor.quadraticCurveTo(-170, -590, -165, -500); tor.quadraticCurveTo(-120, -260, -95, 0); tor.lineTo(95, 0); tor.quadraticCurveTo(120, -260, 165, -500); tor.quadraticCurveTo(170, -590, 60, -600); tor.closePath();
  if (lw) { ctx.lineWidth = lw * 2; ctx.strokeStyle = PAL.ink; ctx.stroke(tor); }
  ctx.fillStyle = fillC; ctx.fill(tor);
  if (!sil) { ctx.save(); ctx.clip(tor); ctx.fillStyle = PAL.ink; ctx.beginPath(); ctx.moveTo(-180, -330); ctx.lineTo(180, -450); ctx.lineTo(180, -410); ctx.lineTo(-180, -290); ctx.fill(); ctx.fillStyle = tone(ctx, 'mid'); ctx.beginPath(); ctx.moveTo(60, -600); ctx.quadraticCurveTo(170, -590, 165, -500); ctx.quadraticCurveTo(120, -260, 95, 0); ctx.lineTo(30, 0); ctx.quadraticCurveTo(70, -300, 60, -600); ctx.fill(); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-50, -600); ctx.lineTo(0, -520); ctx.lineTo(50, -600); ctx.stroke(); ctx.restore(); }
  const sh = P(); sh.moveTo(-118, -20); sh.lineTo(-140, 200); sh.lineTo(-10, 210); sh.lineTo(0, 120); sh.lineTo(10, 210); sh.lineTo(140, 200); sh.lineTo(118, -20); sh.closePath();
  ctx.fillStyle = PAL.ink; ctx.fill(sh);
  ctx.restore();
  // near leg
  const [knF, anF] = limbPts(add(hipF, [0, 120]), ...legs[0], 400, 470);
  seg(add(hipF, [0, 120]), knF, 52, 44); seg(knF, anF, 44, 32); shoe(anF, legs[0][0] - legs[0][1]);
  // head
  const N = add(S, rot(lean, [0, -40]));
  const hc = add(N, rot(lean, [10, -150]));
  ctx.save(); ctx.translate(hc[0], hc[1]); ctx.rotate(lean * 0.6);
  ctx.scale(1.25, 1.25); const hd = P(); hd.ellipse(0, 0, 100, 120, 0, 0, TAU);
  if (lw) { ctx.lineWidth = lw * 2; ctx.strokeStyle = PAL.ink; ctx.stroke(hd); }
  ctx.fillStyle = fillC; ctx.fill(hd);
  ctx.fillStyle = PAL.ink;
  // hair
  ctx.beginPath(); ctx.moveTo(-110, 20);
  const spikes = C.hair === 'spiky' ? 7 : 5;
  for (let i = 0; i <= spikes; i++) { const a = Math.PI * (1.0 + i / spikes), r = C.hair === 'spiky' ? 170 + (i % 2) * 40 : 140; ctx.lineTo(Math.cos(a) * r * (i % 2 ? 1 : 0.75) - 20, Math.sin(a) * r * (i % 2 ? 1 : 0.75) - 10 + Math.sin(t * 6 + i) * 6); }
  ctx.lineTo(110, -10); ctx.quadraticCurveTo(40, -70, -40, -40); ctx.lineTo(-110, 20); ctx.fill();
  if (C.band && !sil) { ctx.fillStyle = PAL.ink; ctx.save(); ctx.rotate(-0.1); ctx.fillRect(-104, -60, 208, 30); ctx.restore(); ctx.beginPath(); ctx.moveTo(-100, -50); ctx.quadraticCurveTo(-200, -60 + Math.sin(t * 14) * 20, -260, -20 + Math.sin(t * 14 + 1) * 30); ctx.lineTo(-250, 0); ctx.quadraticCurveTo(-190, -30, -100, -30); ctx.fill(); }
  if (!sil) { ctx.fillStyle = PAL.ink; ctx.beginPath(); ctx.moveTo(30, -10); ctx.lineTo(90, -20); ctx.lineTo(85, 4); ctx.closePath(); ctx.fill(); ctx.fillRect(40, 60, 40, 6); }
  ctx.restore();
  // near arm + racket
  const [elF, hdF] = armPts(shF, ...arms[0]);
  seg(shF, elF, 40, 34); seg(elF, hdF, 34, 30);
  racket(ctx, hdF[0], hdF[1], 0.75, racketAng, { blur: racketBlur });
  const hand = P(); hand.arc(hdF[0], hdF[1], 36, 0, TAU); if (lw) { ctx.lineWidth = lw * 2; ctx.stroke(hand); } ctx.fillStyle = fillC; ctx.fill(hand);
  ctx.restore();
}
export const POSES = {
  crouch: { lean: 0.35, legs: [[1.1, 1.9], [0.5, 1.5]], arms: [[0.7, 1.2], [-0.4, 0.9]], racketAng: -0.4 },
  jump: { lean: -0.1, legs: [[1.3, 1.9], [-0.45, 0.7]], arms: [[-2.64, 2.0], [2.6, 0.1]], racketAng: -2.62 },
  cock: { lean: -0.3, legs: [[1.2, 1.8], [-0.5, 0.8]], arms: [[-2.7, 2.2], [2.5, 0.2]], racketAng: -2.9 },
  smash: { lean: 0.2, legs: [[0.7, 1.0], [-0.6, 0.7]], arms: [[2.7, 0.0], [0.9, 0.9]], racketAng: 0.45, racketBlur: 1.4 },
  ready: { lean: 0.25, legs: [[0.6, 1.1], [-0.5, 0.9]], arms: [[1.1, 0.9], [-0.5, 0.8]], racketAng: -0.3 },
};
export { clamp, lerp, ease, hrand, TAU };
