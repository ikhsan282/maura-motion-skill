// Maura Motion style kit: NEO-BRUTALIST BENTO.
// A bento grid of saturated flat tiles (lime, coral, cobalt, yellow, lavender) with thick black outlines and hard
// offset shadows, diagonal hatching that scrolls, pill labels, chunky numbers that roll, bars that fill, and a
// cup character. Motion: tiles snap in with hard spring overshoot and reflow between layouts; punchy, a bit jittery.
import { clamp, lerp, ease, hrand, TAU } from '/engine/lib/core.js';
import { makeCanvas, cached, roundRect } from '/engine/lib/draw.js';

export const PAL = {
  bg: '#F4F1E8', ink: '#111111', white: '#FFFFFF', lime: '#C6F432', coral: '#FF5A4E', cobalt: '#3A5BFF',
  yellow: '#FFD500', lavender: '#B9A6FF', pink: '#FF9ED2', milk: '#EED9BC', coffee: '#7B4A2E', mute: '#6E6A60',
};
export const FONT = { big: 'Archivo Black', mono: 'Space Mono', sans: 'Inter' };
export const LINE = 5, OFF = 10;

// ---------------------------------------------------------------- springs
export function spring(t, { z = 0.5, ts = 0.45 } = {}) {
  if (t <= 0) return 0;
  const w = 4 / (Math.max(0.05, z) * ts);
  if (z >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z * w / wd) * Math.sin(wd * t));
}
export function springKeys(t, keys, o) {
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) v += (keys[i][1] - keys[i - 1][1]) * spring(t - keys[i][0], o);
  return v;
}
export const sp = (t, t0, ts = 0.45, z = 0.5) => spring(t - t0, { z, ts });
export const count = (t, t0, dur, a, b) => lerp(a, b, ease.outCubic(clamp((t - t0) / dur)));
export const rp = (n) => 'Rp' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
/** Rect that reflows between layouts: keys = [[t, [x,y,w,h] | null], ...]; null = hidden (scale 0 at its centre). */
export function rectAt(t, keys, o = { z: 0.55, ts: 0.5 }) {
  const fill = keys.map(([tt, r], i) => [tt, r || (keys.slice(0, i).reverse().find((k) => k[1]) || keys.find((k) => k[1]))[1]]);
  const vis = springKeys(t, keys.map(([tt, r]) => [tt, r ? 1 : 0]), { z: 0.5, ts: 0.4 });
  const c = [0, 1, 2, 3].map((k) => springKeys(t, fill.map(([tt, r]) => [tt, r[k]]), o));
  return { x: c[0], y: c[1], w: c[2], h: c[3], s: Math.max(0, vis) };
}

// ---------------------------------------------------------------- stage
export function stage(ctx, t) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = PAL.bg; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const pat = cached('nb-dots', () => { const c = makeCanvas(36, 36), g = c.getContext('2d'); g.fillStyle = 'rgba(17,17,17,0.13)'; g.beginPath(); g.arc(18, 18, 2.2, 0, TAU); g.fill(); return ctx.createPattern(c, 'repeat'); });
  ctx.fillStyle = pat; ctx.translate(-((t * 6) % 36), 0); ctx.fillRect(0, 0, ctx.canvas.width + 36, ctx.canvas.height);
  ctx.restore();
}

// ---------------------------------------------------------------- tiles
/** Diagonal hatching inside a rect (scrolls with t). */
export function hatch(ctx, x, y, w, h, { t = 0, color = 'rgba(17,17,17,0.85)', gap = 22, lw = 4, speed = 30, r = 0 } = {}) {
  ctx.save(); roundRect(ctx, x, y, w, h, r); ctx.clip();
  ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.beginPath();
  const off = (t * speed) % gap;
  for (let d = -h - gap + off; d < w + gap; d += gap) { ctx.moveTo(x + d, y + h); ctx.lineTo(x + d + h, y); }
  ctx.stroke(); ctx.restore();
}
/** Tile: hard offset shadow + flat fill + thick outline. Scale s pops it around its centre (with jitter on entry). */
export function tile(ctx, R, { fill = PAL.white, r = 26, t = 0, hatchIt = false, hatchColor, shadow = OFF } = {}) {
  const { x, y, w, h, s = 1 } = R;
  if (s <= 0.01 || w < 2 || h < 2) return false;
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(s, s); ctx.translate(-(x + w / 2), -(y + h / 2));
  roundRect(ctx, x + shadow, y + shadow, w, h, r); ctx.fillStyle = PAL.ink; ctx.fill();
  roundRect(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill();
  if (hatchIt) hatch(ctx, x, y, w, h, { t, r, color: hatchColor || 'rgba(17,17,17,0.18)' });
  roundRect(ctx, x, y, w, h, r); ctx.lineWidth = LINE; ctx.strokeStyle = PAL.ink; ctx.stroke();
  return true;
}
/** Run fn inside the tile's pop transform + clip (content moves and scales with the tile). */
export function inTile(ctx, R, fn, r = 26) {
  if (R.s <= 0.01) return;
  ctx.save(); const cx = R.x + R.w / 2, cy = R.y + R.h / 2; ctx.translate(cx, cy); ctx.scale(R.s, R.s); ctx.translate(-cx, -cy);
  roundRect(ctx, R.x, R.y, R.w, R.h, r); ctx.clip(); fn(); ctx.restore();
}
/** Text in the kit fonts. */
export function text(ctx, str, x, y, { size = 40, font = FONT.big, color = PAL.ink, align = 'left', weight = 400, alpha = 1, baseline = 'middle', spacing = 0, maxW = 0 } = {}) {
  if (alpha <= 0) return 0;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.font = `${weight} ${size}px '${font}'`; ctx.letterSpacing = spacing + 'px';
  ctx.textAlign = align; ctx.textBaseline = baseline; ctx.fillStyle = color;
  let w = ctx.measureText(str).width;
  if (maxW && w > maxW) { const k = maxW / w; ctx.translate(x, y); ctx.scale(k, k); ctx.fillText(str, 0, 0); w = maxW; } else ctx.fillText(str, x, y);
  ctx.restore(); return w;
}
/** Pill label with outline (and optional hard shadow). x,y = left-centre unless align='center'. */
export function pill(ctx, str, x, y, { fill = PAL.white, color = PAL.ink, size = 24, align = 'left', shadow = 4, alpha = 1 } = {}) {
  if (alpha <= 0) return 0;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.font = `700 ${size}px '${FONT.mono}'`; ctx.letterSpacing = '1px';
  const w = ctx.measureText(str).width + size * 1.3, h = size * 1.75, x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  roundRect(ctx, x0 + shadow, y - h / 2 + shadow, w, h, h / 2); ctx.fillStyle = PAL.ink; ctx.fill();
  roundRect(ctx, x0, y - h / 2, w, h, h / 2); ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = 3.5; ctx.strokeStyle = PAL.ink; ctx.stroke();
  ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(str, x0 + w / 2, y + 1);
  ctx.restore(); return w;
}
/** Progress bar with outline; p 0..1 fills; hatched remainder. */
export function bar(ctx, x, y, w, h, p, { fill = PAL.lime, t = 0, bg = PAL.white, hatchRest = true } = {}) {
  roundRect(ctx, x, y, w, h, h / 2); ctx.fillStyle = bg; ctx.fill();
  if (hatchRest) hatch(ctx, x, y, w, h, { t, r: h / 2, color: 'rgba(17,17,17,0.12)', gap: 16, lw: 3 });
  const fw = Math.max(0, w * clamp(p, 0, 1.08));
  if (fw > 1) { ctx.save(); roundRect(ctx, x, y, w, h, h / 2); ctx.clip(); ctx.fillStyle = fill; ctx.fillRect(x, y, fw, h); ctx.lineWidth = 3.5; ctx.strokeStyle = PAL.ink; ctx.beginPath(); ctx.moveTo(x + fw, y); ctx.lineTo(x + fw, y + h); ctx.stroke(); ctx.restore(); }
  roundRect(ctx, x, y, w, h, h / 2); ctx.lineWidth = 3.5; ctx.strokeStyle = PAL.ink; ctx.stroke();
}
/** Step badge: black circle with a number. */
export function badge(ctx, n, x, y, { r = 26, fill = PAL.ink, color = PAL.white } = {}) {
  ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  text(ctx, String(n), x, y + 2, { size: r * 1.1, font: FONT.big, color, align: 'center' });
}

// ---------------------------------------------------------------- icons (thick ink line, flat fills)
function ib(ctx, x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s / 24, s / 24); ctx.translate(-12, -12); ctx.lineWidth = 2.2; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = PAL.ink; }
export const ICON = {
  bean(ctx, x, y, s, fill = PAL.coffee) { ib(ctx, x, y, s); ctx.beginPath(); ctx.ellipse(12, 12, 7, 9.5, 0.5, 0, TAU); ctx.fillStyle = fill; ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(8, 6); ctx.bezierCurveTo(13, 10, 11, 14, 16, 18); ctx.stroke(); ctx.restore(); },
  milk(ctx, x, y, s, fill = PAL.white) { ib(ctx, x, y, s); ctx.beginPath(); ctx.moveTo(8, 3); ctx.lineTo(16, 3); ctx.lineTo(16, 6); ctx.lineTo(18, 9); ctx.lineTo(18, 21); ctx.lineTo(6, 21); ctx.lineTo(6, 9); ctx.lineTo(8, 6); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(6, 12); ctx.lineTo(18, 12); ctx.stroke(); ctx.restore(); },
  sugar(ctx, x, y, s, fill = PAL.white) { ib(ctx, x, y, s); for (const [a, b] of [[4, 11], [12, 11], [8, 4]]) { ctx.fillStyle = fill; ctx.fillRect(a, b, 8, 8); ctx.strokeRect(a, b, 8, 8); } ctx.restore(); },
  cup(ctx, x, y, s, fill = PAL.white) { ib(ctx, x, y, s); ctx.beginPath(); ctx.moveTo(5, 6); ctx.lineTo(19, 6); ctx.lineTo(17, 21); ctx.lineTo(7, 21); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(4, 6); ctx.lineTo(20, 6); ctx.moveTo(13, 6); ctx.lineTo(15, 2); ctx.stroke(); ctx.restore(); },
  home(ctx, x, y, s, fill = PAL.white) { ib(ctx, x, y, s); ctx.beginPath(); ctx.moveTo(3, 11); ctx.lineTo(12, 3.5); ctx.lineTo(21, 11); ctx.lineTo(19, 11); ctx.lineTo(19, 20); ctx.lineTo(5, 20); ctx.lineTo(5, 11); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.stroke(); ctx.strokeRect(10, 14, 4, 6); ctx.restore(); },
  person(ctx, x, y, s, fill = PAL.white) { ib(ctx, x, y, s); ctx.beginPath(); ctx.arc(12, 8, 4, 0, TAU); ctx.fillStyle = fill; ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(4, 21); ctx.bezierCurveTo(4, 13, 20, 13, 20, 21); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); },
  bolt(ctx, x, y, s, fill = PAL.yellow) { ib(ctx, x, y, s); ctx.beginPath(); ctx.moveTo(13, 2); ctx.lineTo(5, 13); ctx.lineTo(11, 13); ctx.lineTo(10, 22); ctx.lineTo(19, 10); ctx.lineTo(13, 10); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.stroke(); ctx.restore(); },
  coins(ctx, x, y, s, fill = PAL.yellow) { ib(ctx, x, y, s); for (const yy of [17, 13, 9]) { ctx.beginPath(); ctx.ellipse(12, yy, 8, 3.2, 0, 0, TAU); ctx.fillStyle = fill; ctx.fill(); ctx.stroke(); } ctx.restore(); },
  leaf(ctx, x, y, s, fill = PAL.lime) { ib(ctx, x, y, s); ctx.beginPath(); ctx.moveTo(4, 20); ctx.bezierCurveTo(4, 8, 12, 3, 21, 3); ctx.bezierCurveTo(21, 13, 15, 20, 4, 20); ctx.fillStyle = fill; ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(4, 20); ctx.lineTo(15, 9); ctx.stroke(); ctx.restore(); },
};

// ---------------------------------------------------------------- the cup character
/** Iced coffee cup with a face. mood: 'happy' | 'shock' | 'sad'. look -1..1 eyes. Bottom-centre at x,y. */
export function cupGuy(ctx, x, y, s, { t = 0, mood = 'happy', squash = 0, fill = 0.85, look = 0, wave = 0 } = {}) {
  const bob = Math.sin(t * 5) * 6, sq = 1 + squash * 0.12;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * sq, s / sq); ctx.translate(0, bob * 0.3);
  const H = 300, Wt = 200, Wb = 150;
  const cupPath = () => { ctx.beginPath(); ctx.moveTo(-Wt / 2, -H); ctx.lineTo(Wt / 2, -H); ctx.lineTo(Wb / 2, 0); ctx.lineTo(-Wb / 2, 0); ctx.closePath(); };
  // shadow
  ctx.fillStyle = PAL.ink; ctx.beginPath(); ctx.ellipse(8, 6, 92, 14, 0, 0, TAU); ctx.fill();
  // arms
  ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.strokeStyle = PAL.ink;
  ctx.beginPath(); ctx.moveTo(-88, -150); ctx.quadraticCurveTo(-140, -120, -132, -70); ctx.stroke();
  const wa = Math.sin(t * 9) * 0.5 * wave;
  ctx.beginPath(); ctx.moveTo(88, -150); ctx.quadraticCurveTo(140 + wa * 20, -190 - wave * 30, 128 + wa * 30, -230 - wave * 40); ctx.stroke();
  // body
  cupPath(); ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fill();
  ctx.save(); cupPath(); ctx.clip();
  const lvl = -H * fill;
  ctx.fillStyle = PAL.milk; ctx.fillRect(-120, lvl, 240, H);
  ctx.fillStyle = PAL.coffee; ctx.beginPath(); ctx.moveTo(-120, lvl + 60); for (let i = 0; i <= 12; i++) ctx.lineTo(-120 + i * 20, lvl + 60 + Math.sin(i * 1.3 + t * 3) * 12); ctx.lineTo(120, 0); ctx.lineTo(-120, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.75)'; for (let i = 0; i < 4; i++) { const ix = -50 + i * 32, iy = lvl + 30 + (i % 2) * 40; ctx.save(); ctx.translate(ix, iy); ctx.rotate(0.3 * i); ctx.fillRect(-16, -16, 32, 32); ctx.strokeStyle = 'rgba(17,17,17,0.35)'; ctx.lineWidth = 3; ctx.strokeRect(-16, -16, 32, 32); ctx.restore(); }
  ctx.restore();
  cupPath(); ctx.lineWidth = LINE * 1.2; ctx.strokeStyle = PAL.ink; ctx.lineJoin = 'round'; ctx.stroke();
  // lid + straw
  ctx.fillStyle = PAL.white; ctx.beginPath(); ctx.ellipse(0, -H, Wt / 2 + 10, 34, 0, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  roundRect(ctx, -Wt / 2 - 14, -H - 8, Wt + 28, 22, 10); ctx.fill(); ctx.stroke();
  ctx.save(); ctx.translate(30, -H - 20); ctx.rotate(0.25); roundRect(ctx, -11, -150, 22, 160, 8); ctx.fillStyle = PAL.coral; ctx.fill(); ctx.stroke(); ctx.restore();
  // label band + face
  roundRect(ctx, -70, -205, 140, 120, 18); ctx.fillStyle = PAL.white; ctx.fill(); ctx.lineWidth = 4; ctx.stroke();
  const blink = (Math.floor(t * 10) % 37) === 0 ? 0.15 : 1;
  ctx.fillStyle = PAL.ink;
  for (const ex of [-28, 28]) { ctx.beginPath(); ctx.ellipse(ex + look * 6, -165, 9, (mood === 'shock' ? 14 : 11) * blink, 0, 0, TAU); ctx.fill(); }
  ctx.lineWidth = 5; ctx.beginPath();
  if (mood === 'happy') ctx.arc(0, -138, 18, 0.15, Math.PI - 0.15);
  else if (mood === 'shock') { ctx.ellipse(0, -122, 11, 14, 0, 0, TAU); }
  else ctx.arc(0, -112, 16, Math.PI + 0.3, -0.3);
  ctx.stroke();
  if (mood !== 'shock') { ctx.fillStyle = 'rgba(255,90,78,0.45)'; ctx.beginPath(); ctx.arc(-48, -138, 10, 0, TAU); ctx.arc(48, -138, 10, 0, TAU); ctx.fill(); }
  ctx.restore();
}
/** Tiny jitter for "punchy" entrances (stepped, not smooth). */
export const jit = (t, t0, amp = 6) => { const d = t - t0; if (d < 0 || d > 0.25) return [0, 0]; const f = Math.floor(d * 24); return [(hrand(f, 3) - 0.5) * amp, (hrand(f, 7) - 0.5) * amp]; };
