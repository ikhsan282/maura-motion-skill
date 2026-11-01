// Maura Motion style kit: POP ART SUNBURST (loud pop poster).
// Acid palette, continuously rotating sunbursts, Ben-Day/halftone dots, tilted die-cut stickers with white borders and
// hard drop shadows, thick black outlines, extra-condensed type. Characters: an original pop-comic shopper and price
// tags with faces. Signature moves: sticker slap (overshoot + squash), colour flood between scenes, slow 1.03–1.07 push.
import { clamp, lerp, ease, hrand, mulberry32, TAU } from '/engine/lib/core.js';
import { makeCanvas, cached } from '/engine/lib/draw.js';

export const PAL = { lime: '#c6ff3d', pink: '#ff3ea5', cobalt: '#2b3bff', orange: '#ff5a1f', cream: '#f6e4c6', ink: '#0e0f1f', white: '#ffffff', yellow: '#ffe14d', red: '#ff2d3d', sky: '#55d6ff' };
const P = () => new Path2D();
const LW = 10;

/** Outline + fill + optional white die-cut border + hard drop shadow. */
export function cut(g, path, col, { border = 0, shadow = 0, lw = LW, rule = 'nonzero' } = {}) {
  g.lineJoin = 'round'; g.lineCap = 'round';
  if (shadow) { g.save(); g.translate(shadow, shadow); g.fillStyle = PAL.ink; if (border) { g.lineWidth = lw * 2 + border * 2; g.strokeStyle = PAL.ink; g.stroke(path); } g.fill(path, rule); g.restore(); }
  if (border) { g.lineWidth = lw * 2 + border * 2; g.strokeStyle = PAL.white; g.stroke(path); }
  if (lw) { g.lineWidth = lw * 2; g.strokeStyle = PAL.ink; g.stroke(path); }
  g.fillStyle = col; g.fill(path, rule);
}
/** Rotating two-colour sunburst covering everything. */
export function sunburst(ctx, t, { c1 = PAL.yellow, c2 = PAL.orange, x = 540, y = 900, n = 22, speed = 0.18 } = {}) {
  ctx.save(); ctx.fillStyle = c1; ctx.fillRect(-500, -500, 2100, 2900);
  ctx.translate(x, y); ctx.rotate(t * speed); ctx.fillStyle = c2; ctx.beginPath();
  for (let i = 0; i < n; i++) { const a0 = i / n * TAU, a1 = a0 + TAU / n / 2; ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a0) * 2600, Math.sin(a0) * 2600); ctx.lineTo(Math.cos(a1) * 2600, Math.sin(a1) * 2600); ctx.closePath(); }
  ctx.fill(); ctx.restore();
}
/** Ben-Day dot field (cached tile). */
export function benday(ctx, { col = 'rgba(14,15,31,0.18)', step = 26, r = 6, x = -400, y = -400, w = 1900, h = 2800 } = {}) {
  const tile = cached('pa-dots:' + col + step + r, () => { const c = makeCanvas(step * 2, step * 2), g = c.getContext('2d'); g.fillStyle = col; for (const [px, py] of [[0, 0], [step, step], [step * 2, 0], [0, step * 2], [step * 2, step * 2]]) { g.beginPath(); g.arc(px, py, r, 0, TAU); g.fill(); } return c; });
  ctx.save(); ctx.fillStyle = ctx.createPattern(tile, 'repeat'); ctx.fillRect(x, y, w, h); ctx.restore();
}
/** Halftone gradient blob (dots shrink toward the edge) — pop "glow". Cached per colour+radius. */
export function halftoneBlob(ctx, x, y, R, col = PAL.pink) {
  const c = cached(`pa-hb:${col}:${R}`, () => { const cv = makeCanvas(R * 2, R * 2), g = cv.getContext('2d'); g.fillStyle = col; const st = 24; for (let yy = 0; yy < R * 2; yy += st) for (let xx = (yy / st % 2) * st / 2; xx < R * 2; xx += st) { const d = Math.hypot(xx - R, yy - R) / R; const r = (1 - d) * st * 0.5; if (r > 0.6) { g.beginPath(); g.arc(xx, yy, r, 0, TAU); g.fill(); } } return cv; });
  ctx.drawImage(c, x - R, y - R);
}
/** Slap-in scale with overshoot + squash (k 0..1). */
export const slap = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : ease.outBack(k, 3.2) * (1 + (1 - k) * 0.5));

/** Die-cut text sticker in extra-condensed type. */
export function sticker(ctx, text, x, y, { size = 120, col = PAL.lime, txt = PAL.ink, rot = -0.05, k = 1, t = 0, sway = 1, pad = 30, font = 'Bebas Neue', sub = null, subCol = null } = {}) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot + Math.sin(t * 1.7 + x * 0.01) * 0.025 * sway); const s = slap(k); ctx.scale(s, s);
  ctx.font = `400 ${size}px '${font}'`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.letterSpacing = '2px';
  const w = ctx.measureText(text).width + pad * 2, h = size * 1.0 + pad + (sub ? size * 0.42 : 0);
  const p = P(); p.roundRect(-w / 2, -h / 2, w, h, 18);
  cut(ctx, p, col, { border: 14, shadow: 18, lw: 6 });
  ctx.fillStyle = txt; ctx.fillText(text, 0, (sub ? -size * 0.2 : 0) + size * 0.06);
  if (sub) { ctx.font = `400 ${size * 0.36}px '${font}'`; ctx.letterSpacing = '6px'; ctx.fillStyle = subCol || txt; ctx.fillText(sub, 0, size * 0.48); }
  ctx.restore();
}
/** Starburst badge with text. */
export function starBadge(ctx, text, x, y, { r = 170, col = PAL.yellow, txt = PAL.ink, k = 1, t = 0, size = 70, rot = 0.1 } = {}) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot + t * 0.4); const s = slap(k); ctx.scale(s, s);
  const p = P(); const n = 16; for (let i = 0; i <= n * 2; i++) { const a = i / (n * 2) * TAU, rr = i % 2 ? r * 0.76 : r; i ? p.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : p.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  cut(ctx, p, col, { border: 12, shadow: 14, lw: 6 });
  ctx.rotate(-t * 0.4 - 0.05); ctx.font = `400 ${size}px 'Bebas Neue'`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = txt;
  text.split('\n').forEach((l, i, A) => ctx.fillText(l, 0, (i - (A.length - 1) / 2) * size * 0.95 + size * 0.06));
  ctx.restore();
}

// ---------------------------------------------------------------- characters
/**
 * Price tag with a face. text e.g. 'Rp99.000'. o: { k (slap), rot, mood: 'smug'|'shock'|'wink'|'happy', col, t, highlight: index of digit to circle, digitCols }
 */
export function priceTag(ctx, text, x, y, s = 1, o = {}) {
  const { k = 1, rot = -0.06, mood = 'smug', col = PAL.pink, t = 0, face = true, size = 170, txt = PAL.ink } = o;
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y + Math.sin(t * 2.4) * 8); ctx.rotate(rot + Math.sin(t * 1.6) * 0.03); const sc = slap(k) * s; ctx.scale(sc, sc);
  ctx.font = `400 ${size}px 'Bebas Neue'`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.letterSpacing = '2px';
  const tw = ctx.measureText(text).width, w = tw + 200, h = size * 1.55 + (face ? 120 : 0);
  // string
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-w / 2 + 30, -h / 2 + h * 0.18); ctx.bezierCurveTo(-w / 2 - 80, -h / 2 - 60, -w / 2 - 60, -h / 2 - 160 + Math.sin(t * 3) * 20, -w / 2 - 140, -h / 2 - 200); ctx.stroke();
  const p = P(); p.moveTo(-w / 2 + 90, -h / 2); p.lineTo(w / 2, -h / 2); p.lineTo(w / 2, h / 2); p.lineTo(-w / 2 + 90, h / 2); p.lineTo(-w / 2, 0); p.closePath();
  p.moveTo(-w / 2 + 70, 0); p.arc(-w / 2 + 50, 0, 20, 0, TAU, true);
  cut(ctx, p, col, { border: 14, shadow: 20, lw: 7 });
  benday(ctx, { col: 'rgba(14,15,31,0.1)', step: 22, r: 4, x: -w / 2, y: -h / 2, w: 0, h: 0 });
  const tx = -w / 2 + 110, ty = face ? -h / 2 + size * 0.72 : 6;
  if (o.highlight != null) {
    // circle one digit (left-digit spotlight)
    let x0 = tx; for (let i = 0; i < o.highlight; i++) x0 += ctx.measureText(text[i]).width + 2;
    const dw = ctx.measureText(text[o.highlight]).width;
    ctx.fillStyle = PAL.yellow; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 7; ctx.beginPath(); ctx.ellipse(x0 + dw / 2, ty, dw * 0.85, size * 0.62, -0.1, 0, TAU); ctx.fill(); ctx.stroke();
  }
  ctx.fillStyle = txt;
  if (o.digitAlpha) { let xx = tx; for (let i = 0; i < text.length; i++) { ctx.globalAlpha = o.digitAlpha(i); ctx.fillText(text[i], xx, ty); xx += ctx.measureText(text[i]).width + 2; } ctx.globalAlpha = 1; }
  else ctx.fillText(text, tx, ty);
  if (face) {
    const fx = 30, fy = h / 2 - 72;
    for (const sd of [-1, 1]) {
      const ex = fx + sd * 60;
      if (mood === 'wink' && sd > 0) { ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(ex - 22, fy); ctx.quadraticCurveTo(ex, fy - 16, ex + 22, fy); ctx.stroke(); continue; }
      ctx.fillStyle = PAL.white; ctx.lineWidth = 7; ctx.beginPath(); ctx.ellipse(ex, fy, 24, mood === 'shock' ? 30 : 24, 0, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = PAL.ink; ctx.beginPath(); ctx.arc(ex + 5, fy + 2, mood === 'shock' ? 8 : 12, 0, TAU); ctx.fill();
      if (mood === 'smug' || mood === 'wink') { ctx.fillStyle = col; ctx.fillRect(ex - 30, fy - 34, 60, 26); ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(ex - 26, fy - 8); ctx.lineTo(ex + 26, fy - 8); ctx.stroke(); }
    }
    ctx.lineWidth = 8; ctx.beginPath();
    if (mood === 'shock') { ctx.fillStyle = PAL.ink; ctx.ellipse(fx, fy + 52, 18, 22, 0, 0, TAU); ctx.fill(); }
    else { ctx.moveTo(fx - 50, fy + 44); ctx.quadraticCurveTo(fx + 10, fy + 80, fx + 60, fy + 34); ctx.stroke(); }
  }
  ctx.restore();
}
/**
 * Pop-comic shopper (head & shoulders): Ben-Day skin, bold hair, big lashes, red lips. mood: 'shock'|'think'|'smug'|'happy'.
 */
export function shopper(ctx, x, y, s = 1, { mood = 'shock', t = 0, look = [0, 0], k = 1 } = {}) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); const sc = slap(k) * s; ctx.scale(sc, sc); ctx.rotate(Math.sin(t * 1.5) * 0.03);
  // shoulders / top
  const sh = P(); sh.moveTo(-300, 520); sh.quadraticCurveTo(-280, 300, -110, 260); sh.lineTo(110, 260); sh.quadraticCurveTo(280, 300, 300, 520); sh.closePath();
  cut(ctx, sh, PAL.cobalt, { border: 14, shadow: 18 });
  ctx.save(); ctx.clip(sh); benday(ctx, { col: 'rgba(255,255,255,0.22)', step: 24, r: 5 }); ctx.restore();
  // back hair
  const hb = P(); hb.ellipse(0, -20, 230, 260, 0, 0, TAU);
  cut(ctx, hb, PAL.yellow, { border: 14, shadow: 18 });
  // neck + face
  const nk = P(); nk.rect(-60, 120, 120, 160); cut(ctx, nk, '#ffc6a8');
  const fc = P(); fc.moveTo(-150, -60); fc.bezierCurveTo(-160, 90, -90, 210, 0, 220); fc.bezierCurveTo(90, 210, 160, 90, 150, -60); fc.bezierCurveTo(140, -200, -140, -200, -150, -60); fc.closePath();
  cut(ctx, fc, '#ffd2b8');
  ctx.save(); ctx.clip(fc); benday(ctx, { col: 'rgba(255,62,165,0.35)', step: 22, r: 5 }); ctx.restore();
  // fringe
  const fr = P(); fr.moveTo(-180, 10); fr.bezierCurveTo(-190, -230, 190, -260, 175, 0); fr.bezierCurveTo(120, -120, 30, -90, -20, -150); fr.bezierCurveTo(-60, -80, -140, -90, -180, 10); fr.closePath();
  cut(ctx, fr, PAL.yellow);
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 6; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-120 + i * 70, -170 + Math.abs(i - 1.5) * 10); ctx.quadraticCurveTo(-100 + i * 70, -110, -140 + i * 80, -50); ctx.stroke(); }
  // eyes
  for (const sd of [-1, 1]) {
    const ex = sd * 62, ey = 20;
    if (mood === 'smug' && sd > 0) { ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(ex - 36, ey); ctx.quadraticCurveTo(ex, ey - 22, ex + 36, ey); ctx.stroke(); continue; }
    if (mood === 'happy') { ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(ex - 36, ey + 6); ctx.quadraticCurveTo(ex, ey - 30, ex + 36, ey + 6); ctx.stroke(); continue; }
    const open = mood === 'shock' ? 1.25 : mood === 'think' ? 0.8 : 1;
    ctx.fillStyle = PAL.white; ctx.lineWidth = 8; ctx.beginPath(); ctx.ellipse(ex, ey, 40, 28 * open, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = PAL.cobalt; ctx.beginPath(); ctx.arc(ex + look[0] * 12, ey + look[1] * 8, 19, 0, TAU); ctx.fill();
    ctx.fillStyle = PAL.ink; ctx.beginPath(); ctx.arc(ex + look[0] * 12, ey + look[1] * 8, 9, 0, TAU); ctx.fill();
    ctx.fillStyle = PAL.white; ctx.beginPath(); ctx.arc(ex + look[0] * 12 - 6, ey + look[1] * 8 - 7, 5, 0, TAU); ctx.fill();
    ctx.lineWidth = 6; for (let i = 0; i < 4; i++) { const a = -Math.PI * (0.25 + i * 0.17); ctx.beginPath(); ctx.moveTo(ex + Math.cos(a) * 40, ey + Math.sin(a) * 28 * open); ctx.lineTo(ex + Math.cos(a) * 58, ey + Math.sin(a) * 28 * open - 14); ctx.stroke(); }
    ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(ex - 40, ey - 58 - (mood === 'shock' ? 16 : mood === 'think' ? sd * 10 : 0)); ctx.quadraticCurveTo(ex, ey - 78 - (mood === 'shock' ? 16 : 0), ex + 40, ey - 58); ctx.stroke();
  }
  ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(4, 70); ctx.lineTo(-8, 110); ctx.lineTo(10, 112); ctx.stroke();
  // lips
  const lp = P();
  if (mood === 'shock') lp.ellipse(0, 160, 34, 38, 0, 0, TAU);
  else if (mood === 'think') { lp.moveTo(-30, 160); lp.quadraticCurveTo(0, 145, 34, 156); lp.quadraticCurveTo(0, 176, -30, 160); }
  else { lp.moveTo(-56, 148); lp.quadraticCurveTo(0, 210, 56, 140); lp.quadraticCurveTo(0, 170, -56, 148); }
  cut(ctx, lp, PAL.red, { lw: 6 });
  if (mood === 'shock') { ctx.fillStyle = '#6a0c1c'; ctx.beginPath(); ctx.ellipse(0, 164, 18, 22, 0, 0, TAU); ctx.fill(); }
  ctx.restore();
}
/** Giant pop eye (scanning). look x -1..1. */
export function popEye(ctx, x, y, s = 1, { look = 0, t = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const e = P(); e.moveTo(-300, 0); e.quadraticCurveTo(0, -230, 300, 0); e.quadraticCurveTo(0, 230, -300, 0); e.closePath();
  cut(ctx, e, PAL.white, { border: 14, shadow: 18 });
  ctx.save(); ctx.clip(e);
  ctx.fillStyle = PAL.cobalt; ctx.beginPath(); ctx.arc(look * 150, 0, 110, 0, TAU); ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = PAL.ink; ctx.stroke();
  benday(ctx, { col: 'rgba(14,15,31,0.25)', step: 18, r: 4 });
  ctx.fillStyle = PAL.ink; ctx.beginPath(); ctx.arc(look * 150, 0, 48, 0, TAU); ctx.fill();
  ctx.fillStyle = PAL.white; ctx.beginPath(); ctx.arc(look * 150 - 30, -34, 22, 0, TAU); ctx.fill();
  ctx.restore();
  ctx.lineWidth = 12; ctx.strokeStyle = PAL.ink; for (let i = 0; i < 7; i++) { const u = i / 6, a = -Math.PI + 0.35 + u * (Math.PI - 0.7); ctx.beginPath(); ctx.moveTo(Math.cos(a) * 300 * 0.95, -Math.abs(Math.sin(a)) * 160 - 20); ctx.lineTo(Math.cos(a) * 340, -Math.abs(Math.sin(a)) * 160 - 90); ctx.stroke(); }
  ctx.restore();
}
/** Chunky arrow (pop style). */
export function arrow(ctx, x0, y0, x1, y1, { col = PAL.lime, w = 50, k = 1 } = {}) {
  if (k <= 0) return;
  const ex = lerp(x0, x1, ease.outCubic(k)), ey = lerp(y0, y1, ease.outCubic(k));
  const a = Math.atan2(ey - y0, ex - x0), L = Math.hypot(ex - x0, ey - y0);
  ctx.save(); ctx.translate(x0, y0); ctx.rotate(a);
  const p = P(); p.moveTo(0, -w / 2); p.lineTo(L - w, -w / 2); p.lineTo(L - w, -w * 1.1); p.lineTo(L, 0); p.lineTo(L - w, w * 1.1); p.lineTo(L - w, w / 2); p.lineTo(0, w / 2); p.closePath();
  cut(ctx, p, col, { border: 10, shadow: 12, lw: 6 });
  ctx.restore();
}
/** Colour flood wipe (circle from a point) — the pop transition. */
export function flood(ctx, k, col = PAL.pink, x = 540, y = 960) {
  if (k <= 0 || k >= 1) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, ease.inOutCubic(k < 0.5 ? k * 2 : 2 - k * 2) * 2300, 0, TAU); ctx.fill(); ctx.restore();
}
/** Odometer number: each digit rolls from `from` to `to` (strings of equal length), k 0..1. */
export function odometer(ctx, from, to, x, y, { size = 230, k = 0, col = PAL.ink, bg = PAL.white } = {}) {
  ctx.save(); ctx.font = `400 ${size}px 'Bebas Neue'`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const cw = size * 0.52, n = Math.max(from.length, to.length), x0 = x - (n - 1) * cw / 2;
  const box = P(); box.roundRect(x0 - cw * 0.7, y - size * 0.62, cw * (n + 0.4), size * 1.24, 20);
  cut(ctx, box, bg, { border: 14, shadow: 18, lw: 7 });
  ctx.save(); ctx.clip(box);
  for (let i = 0; i < n; i++) {
    const a = from[i] || ' ', b = to[i] || ' ', cx = x0 + i * cw;
    const kk = a === b ? 0 : ease.inOutCubic(clamp(k * 1.4 - (n - 1 - i) * 0.06));
    ctx.fillStyle = col; ctx.fillText(a, cx, y - kk * size * 1.1 + size * 0.05); ctx.fillText(b, cx, y + (1 - kk) * size * 1.1 + size * 0.05);
  }
  ctx.restore(); ctx.restore();
}
export { clamp, lerp, ease, hrand, TAU };
