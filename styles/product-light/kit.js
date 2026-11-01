// AniMasters style kit: PRODUCT FILM LIGHT (Apple-style launch film).
// Warm white stage washed with soft pastel blobs, floating white UI cards and a phone mockup with layered soft
// shadows, an oversized pointer that taps, a "Screen Studio" camera that zooms into the UI, counting numbers and
// one italic serif accent word per headline. Everything moves on closed-form springs (pure functions of time).
import { clamp, lerp, ease, hrand, noise, TAU } from '/engine/lib/core.js';
import { makeCanvas, cached, roundRect } from '/engine/lib/draw.js';

export const PAL = {
  bg: '#F7F5F0', bg2: '#EFECE5', ink: '#111114', ink2: '#55555F', ink3: '#9B9AA2', line: '#E7E4DE',
  card: '#FFFFFF', accent: '#4F46E5', accentSoft: '#ECEBFF', ok: '#12B76A', okSoft: '#DDF7EA',
  peach: '#FFD3BA', lilac: '#DCD3FF', mint: '#C9F2E2', sky: '#D3E6FF', warn: '#F59E0B', bezel: '#0E0E11',
};
export const FONT = { sans: 'Inter', serif: 'Playfair Display', mono: 'JetBrains Mono' };

// ---------------------------------------------------------------- springs & timing
/** Closed-form step response of a damped spring, 0 before t=0, settles to 1 (overshoot when z < 1).
 *  z = damping ratio (0.72 = tiny overshoot, 0.5 = lively, 1 = critically damped), ts = settle time (s). */
export function spring(t, { z = 0.72, ts = 0.5 } = {}) {
  if (t <= 0) return 0;
  const w = 4 / (Math.max(0.05, z) * ts);
  if (z >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z * w / wd) * Math.sin(wd * t));
}
/** A value that springs between targets: keys = [[time, value], ...] (sum of step responses, no state). */
export function springKeys(t, keys, o) {
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) v += (keys[i][1] - keys[i - 1][1]) * spring(t - keys[i][0], o);
  return v;
}
/** Spring from 0 to 1 starting at t0 (shorthand). */
export const sp = (t, t0, ts = 0.5, z = 0.72) => spring(t - t0, { z, ts });
/** Count from a to b starting at t0 over dur with expo-out (numbers that roll). */
export const count = (t, t0, dur, a, b) => lerp(a, b, ease.outExpo(clamp((t - t0) / dur)));
/** Indonesian thousands: 25000 -> "25.000"; fmtRp -> "Rp25.000". */
export const fmt = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
export const fmtRp = (n) => 'Rp' + fmt(n);

// ---------------------------------------------------------------- camera
/** Camera keys [[t, x, y, zoom]]: springs per component, zoom interpolated in log space (constant-feel zooms). */
export function camAt(t, keys, o = { z: 1, ts: 0.9 }) {
  const x = springKeys(t, keys.map((k) => [k[0], k[1]]), o);
  const y = springKeys(t, keys.map((k) => [k[0], k[2]]), o);
  const lz = springKeys(t, keys.map((k) => [k[0], Math.log(k[3])]), o);
  return { x, y, z: Math.exp(lz) };
}
export function applyCam(ctx, c, W = 1080, H = 1920) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(W / 2, H / 2); if (c.rot) ctx.rotate(c.rot); ctx.scale(c.z, c.z); ctx.translate(-c.x, -c.y);
}
/** World-space rectangle visible through the current transform [x, y, w, h]. */
export function viewRect(ctx, pad = 40) {
  const m = ctx.getTransform().inverse(), W = ctx.canvas.width, H = ctx.canvas.height;
  const P = [[0, 0], [W, 0], [0, H], [W, H]].map(([x, y]) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]);
  const xs = P.map((p) => p[0]), ys = P.map((p) => p[1]);
  return [Math.min(...xs) - pad, Math.min(...ys) - pad, Math.max(...xs) - Math.min(...xs) + 2 * pad, Math.max(...ys) - Math.min(...ys) + 2 * pad];
}

// ---------------------------------------------------------------- stage
function blobSprite(col) {
  return cached('pl-blob:' + col, () => {
    const c = makeCanvas(128, 128), g = c.getContext('2d');
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, col); gr.addColorStop(0.45, col + 'aa'); gr.addColorStop(1, col + '00');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return c;
  });
}
/** Warm white stage with drifting pastel blobs. `px/py` = parallax offset (pass camera x/y * small factor). */
export function stage(ctx, t, { px = 0, py = 0, blobs = null, alpha = 0.85, base = PAL.bg } = {}) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = base; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const B = blobs || [
    { c: PAL.lilac, x: 180, y: 380, r: 640, s: 0.11 },
    { c: PAL.peach, x: 960, y: 900, r: 700, s: 0.09 },
    { c: PAL.mint, x: 260, y: 1500, r: 620, s: 0.13 },
    { c: PAL.sky, x: 880, y: 160, r: 520, s: 0.1 },
  ];
  ctx.globalAlpha = alpha;
  B.forEach((b, i) => {
    const x = b.x + Math.sin(t * b.s * 2 + i * 1.7) * 90 - px * (0.4 + i * 0.15);
    const y = b.y + Math.cos(t * b.s * 1.6 + i) * 70 - py * (0.4 + i * 0.15);
    const r = b.r * (1 + 0.06 * Math.sin(t * 0.5 + i));
    ctx.drawImage(blobSprite(b.c), x - r, y - r, r * 2, r * 2);
  });
  ctx.restore();
}
/** Faint dot grid (product-page texture). Drawn in world space within the visible rect. */
export function dotGrid(ctx, { step = 44, r = 2, color = 'rgba(17,17,20,0.07)' } = {}) {
  const [vx, vy, vw, vh] = viewRect(ctx, 0);
  const tile = cached('pl-dot:' + step + r + color, () => {
    const c = makeCanvas(step, step), g = c.getContext('2d'); g.fillStyle = color;
    g.beginPath(); g.arc(step / 2, step / 2, r, 0, TAU); g.fill(); return c;
  });
  const pat = cached('pl-dotpat:' + step + r + color, () => ctx.createPattern(tile, 'repeat'));
  ctx.save(); ctx.fillStyle = pat; ctx.fillRect(Math.floor(vx / step) * step, Math.floor(vy / step) * step, vw + step * 2, vh + step * 2); ctx.restore();
}

// ---------------------------------------------------------------- soft shadows (9-slice sprites)
function shadowSprite(r, blur, color) {
  return cached(`pl-sh:${r}:${blur}:${color}`, () => {
    const pad = Math.ceil(blur * 1.6) + 2, inner = 2 * r + 2, S = inner + 2 * pad;
    const c = makeCanvas(S, S), g = c.getContext('2d');
    g.shadowColor = color; g.shadowBlur = blur; g.shadowOffsetX = 4000;
    g.fillStyle = '#000'; roundRect(g, pad - 4000, pad, inner, inner, r); g.fill();
    c.pad = pad; c.r = r; c.inner = inner;
    return c;
  });
}
function nine(ctx, sp, x, y, w, h) {
  const c = sp.r + sp.pad, S = sp.width, mid = S - 2 * c;
  const X = [x - sp.pad, x - sp.pad + c, x + w + sp.pad - c], Y = [y - sp.pad, y - sp.pad + c, y + h + sp.pad - c];
  const WW = [c, Math.max(0, w + 2 * sp.pad - 2 * c), c], HH = [c, Math.max(0, h + 2 * sp.pad - 2 * c), c];
  const SX = [0, c, c + mid], SW = [c, mid, c];
  for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) {
    if (WW[i] <= 0 || HH[j] <= 0) continue;
    ctx.drawImage(sp, SX[i], SX[j], SW[i], SW[j], X[i], Y[j], WW[i] + (i < 2 ? 0.5 : 0), HH[j] + (j < 2 ? 0.5 : 0));
  }
}
const qr = (r) => [6, 10, 16, 24, 32, 44, 56, 72, 96, 128].reduce((a, b) => (Math.abs(b - r) < Math.abs(a - r) ? b : a));
/** Layered soft shadow under a rounded rect. elev 0..1.5 lifts it (bigger, softer, further). */
export function softShadow(ctx, x, y, w, h, r, { elev = 1, alpha = 1, tint = '17,17,30' } = {}) {
  const R = qr(Math.min(r, w / 2, h / 2));
  const a1 = shadowSprite(R, 8, `rgba(${tint},0.10)`), a2 = shadowSprite(R, 44, `rgba(${tint},0.13)`);
  ctx.save(); ctx.globalAlpha *= alpha;
  nine(ctx, a1, x, y + 2 + 3 * elev, w, h);
  ctx.globalAlpha *= clamp(0.35 + elev * 0.6, 0, 1.2);
  const g = 6 + 22 * elev;
  nine(ctx, a2, x + 4, y + g, w - 8, h);
  ctx.restore();
}
/** Floating white card: shadow + body + hairline. */
export function card(ctx, x, y, w, h, { r = 30, fill = PAL.card, border = PAL.line, elev = 1, alpha = 1, shadow = true } = {}) {
  if (alpha <= 0) return;
  if (shadow) softShadow(ctx, x, y, w, h, r, { elev, alpha });
  ctx.save(); ctx.globalAlpha *= alpha;
  roundRect(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill();
  if (border) { ctx.lineWidth = 1.5; ctx.strokeStyle = border; ctx.stroke(); }
  ctx.restore();
}
/** Scale/alpha "pop" transform around a centre for an entrance spring p (0..1+). Call inside save/restore. */
export function popIn(ctx, cx, cy, p, { from = 0.86, rise = 40 } = {}) {
  const s = lerp(from, 1, p);
  ctx.globalAlpha *= clamp(p * 1.6);
  ctx.translate(cx, cy + (1 - p) * rise); ctx.scale(s, s); ctx.translate(-cx, -cy);
}

// ---------------------------------------------------------------- type
/** Plain text in the kit's type system. */
export function label(ctx, str, x, y, { size = 34, weight = 400, color = PAL.ink, align = 'left', font = FONT.sans, spacing = null, alpha = 1, italic = false, baseline = 'middle' } = {}) {
  ctx.save(); ctx.globalAlpha *= alpha;
  ctx.font = `${italic ? 'italic ' : ''}${weight} ${size}px '${font}'`;
  ctx.letterSpacing = (spacing ?? (font === FONT.sans && size >= 40 ? -size * 0.03 : 0)) + 'px';
  ctx.textAlign = align; ctx.textBaseline = baseline; ctx.fillStyle = color;
  ctx.fillText(str, x, y);
  const w = ctx.measureText(str).width; ctx.restore(); return w;
}
function segsOf(line) { // "Isinya bukan *uang*." -> [{s:'Isinya bukan ', it:false}, {s:'uang', it:true}, {s:'.', it:false}]
  return line.split(/(\*[^*]+\*)/).filter(Boolean).map((s) => (s.startsWith('*') ? { s: s.slice(1, -1), it: true } : { s, it: false }));
}
function segFont(seg, size, weight) {
  return seg.it ? `italic 400 ${size * 1.1}px '${FONT.serif}'` : `${weight} ${size}px '${FONT.sans}'`;
}
/** Launch-film headline: lines rise through a mask one after another on springs.
 *  lines: ['Satu scan,', '*empat* pihak.'] (asterisks = italic serif accent word in `accent`). */
export function headline(ctx, t, t0, lines, x, y, { size = 92, weight = 700, color = PAL.ink, accent = PAL.accent, align = 'center', gap = 1.08, stagger = 0.09, out = null, alpha = 1 } = {}) {
  const lh = size * gap;
  lines.forEach((line, i) => {
    const p = spring(t - t0 - i * stagger, { z: 0.8, ts: 0.7 });
    let o = 0; if (out !== null) o = ease.inCubic(clamp((t - out - i * 0.04) / 0.35));
    if (p <= 0 || o >= 1) return;
    const segs = segsOf(line);
    ctx.save(); ctx.globalAlpha *= alpha;
    ctx.letterSpacing = `${-size * 0.035}px`; ctx.textBaseline = 'alphabetic';
    let W = 0; for (const s of segs) { ctx.font = segFont(s, size, weight); W += ctx.measureText(s.s).width; }
    let cx = align === 'center' ? x - W / 2 : align === 'right' ? x - W : x;
    const by = y + i * lh;
    ctx.beginPath(); ctx.rect(cx - 40, by - size * 1.05, W + 80, size * 1.38); ctx.clip();
    const dy = (1 - p) * size * 1.15 - o * size * 1.2;
    for (const s of segs) {
      ctx.font = segFont(s, size, weight); ctx.fillStyle = s.it ? accent : color;
      ctx.fillText(s.s, cx, by + dy); cx += ctx.measureText(s.s).width;
    }
    ctx.restore();
  });
}
/** Small caps eyebrow above a headline ("01 · PENERBIT"). */
export function eyebrow(ctx, str, x, y, { color = PAL.ink3, size = 24, align = 'center', alpha = 1 } = {}) {
  label(ctx, str.toUpperCase(), x, y, { size, weight: 700, color, align, spacing: size * 0.18, alpha, font: FONT.sans });
}

// ---------------------------------------------------------------- chips, toasts, rows
/** Pill chip centred at x,y. num = small numbered disc; icon = fn(ctx, x, y, s). Returns width. */
export function chip(ctx, x, y, str, { size = 30, fill = '#fff', color = PAL.ink, num = null, numFill = PAL.ink, icon = null, iconColor = null, elev = 0.6, alpha = 1, scale = 1, border = PAL.line, weight = 700 } = {}) {
  ctx.save();
  ctx.font = `${weight} ${size}px '${FONT.sans}'`; ctx.letterSpacing = `${-size * 0.02}px`;
  const tw = ctx.measureText(str).width, h = size * 2.1, lead = (num !== null || icon) ? h * 0.78 : 0;
  const w = tw + size * 1.4 + lead;
  ctx.translate(x, y); ctx.scale(scale, scale);
  card(ctx, -w / 2, -h / 2, w, h, { r: h / 2, fill, border, elev, alpha });
  ctx.globalAlpha *= alpha;
  let lx = -w / 2 + size * 0.7;
  if (num !== null) {
    ctx.fillStyle = numFill; ctx.beginPath(); ctx.arc(lx + h * 0.3, 0, h * 0.33, 0, TAU); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = `700 ${size * 0.85}px '${FONT.sans}'`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(num), lx + h * 0.3, size * 0.04);
    lx += lead;
  } else if (icon) { icon(ctx, lx + h * 0.28, 0, h * 0.52, iconColor || color); lx += lead; }
  ctx.font = `${weight} ${size}px '${FONT.sans}'`; ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(str, lx, size * 0.04);
  ctx.restore();
  return w * scale;
}
/** Notification toast (iOS-like banner) at x,y (top-left), width w. */
export function toast(ctx, x, y, w, { title, body, icon = null, iconFill = PAL.ok, time = 'sekarang', alpha = 1, elev = 1.1 } = {}) {
  const h = 150;
  card(ctx, x, y, w, h, { r: 40, elev, alpha, fill: 'rgba(255,255,255,0.97)' });
  ctx.save(); ctx.globalAlpha *= alpha;
  roundRect(ctx, x + 28, y + 33, 84, 84, 22); ctx.fillStyle = iconFill; ctx.fill();
  if (icon) icon(ctx, x + 70, y + 75, 46, '#fff');
  label(ctx, title, x + 136, y + 58, { size: 32, weight: 700 });
  label(ctx, body, x + 136, y + 102, { size: 30, color: PAL.ink2 });
  label(ctx, time, x + w - 30, y + 58, { size: 24, color: PAL.ink3, align: 'right' });
  ctx.restore();
}

// ---------------------------------------------------------------- icons (24-unit grid, stroked, round caps)
function iconBegin(ctx, x, y, s, color, lw = 2) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 24, s / 24); ctx.translate(-12, -12);
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
}
export const ICON = {
  /** check mark drawn on with progress p (0..1) */
  check(ctx, x, y, s, color = PAL.ok, p = 1, lw = 2.6) {
    iconBegin(ctx, x, y, s, color, lw);
    const P = [[5, 12.5], [10, 17.5], [19, 7]], L1 = Math.hypot(5, 5), L2 = Math.hypot(9, 10.5), L = (L1 + L2) * clamp(p);
    ctx.beginPath(); ctx.moveTo(...P[0]);
    if (L <= L1) ctx.lineTo(5 + 5 * L / L1, 12.5 + 5 * L / L1);
    else { ctx.lineTo(...P[1]); const u = (L - L1) / L2; ctx.lineTo(10 + 9 * u, 17.5 - 10.5 * u); }
    ctx.stroke(); ctx.restore();
  },
  bank(ctx, x, y, s, color = PAL.ink) {
    iconBegin(ctx, x, y, s, color);
    ctx.beginPath(); ctx.moveTo(3, 9); ctx.lineTo(12, 4); ctx.lineTo(21, 9); ctx.closePath(); ctx.stroke();
    for (const cx of [6, 10, 14, 18]) { ctx.beginPath(); ctx.moveTo(cx, 11); ctx.lineTo(cx, 17); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(3, 20); ctx.lineTo(21, 20); ctx.stroke(); ctx.restore();
  },
  route(ctx, x, y, s, color = PAL.ink) {
    iconBegin(ctx, x, y, s, color);
    ctx.beginPath(); ctx.arc(5, 12, 2.4, 0, TAU); ctx.stroke();
    for (const ty of [5, 12, 19]) { ctx.beginPath(); ctx.arc(19, ty, 2.4, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.moveTo(7.4, 12); ctx.bezierCurveTo(12, 12, 12, ty, 16.6, ty); ctx.stroke(); }
    ctx.restore();
  },
  store(ctx, x, y, s, color = PAL.ink) {
    iconBegin(ctx, x, y, s, color);
    ctx.beginPath(); ctx.moveTo(4, 9); ctx.lineTo(5.5, 4); ctx.lineTo(18.5, 4); ctx.lineTo(20, 9); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(5, 10); ctx.lineTo(5, 20); ctx.lineTo(19, 20); ctx.lineTo(19, 10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(10, 20); ctx.lineTo(10, 15); ctx.lineTo(14, 15); ctx.lineTo(14, 20); ctx.stroke(); ctx.restore();
  },
  shield(ctx, x, y, s, color = PAL.ink) {
    iconBegin(ctx, x, y, s, color);
    ctx.beginPath(); ctx.moveTo(12, 3); ctx.lineTo(19.5, 6); ctx.lineTo(19.5, 12); ctx.bezierCurveTo(19.5, 16.5, 16, 19.5, 12, 21); ctx.bezierCurveTo(8, 19.5, 4.5, 16.5, 4.5, 12); ctx.lineTo(4.5, 6); ctx.closePath(); ctx.stroke();
    ctx.restore(); ICON.check(ctx, x, y + s * 0.02, s * 0.62, color, 1, 3.2);
  },
  lock(ctx, x, y, s, color = PAL.ink) {
    iconBegin(ctx, x, y, s, color);
    roundRect(ctx, 5, 10.5, 14, 10, 2.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(8, 10.5); ctx.lineTo(8, 7.5); ctx.arc(12, 7.5, 4, Math.PI, 0); ctx.lineTo(16, 10.5); ctx.stroke(); ctx.restore();
  },
  bell(ctx, x, y, s, color = PAL.ink) {
    iconBegin(ctx, x, y, s, color);
    ctx.beginPath(); ctx.moveTo(6, 17); ctx.lineTo(6, 11); ctx.arc(12, 11, 6, Math.PI, 0); ctx.lineTo(18, 17); ctx.lineTo(19.5, 18.5); ctx.lineTo(4.5, 18.5); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(10, 21); ctx.lineTo(14, 21); ctx.stroke(); ctx.restore();
  },
  mail(ctx, x, y, s, color = PAL.ink) {
    iconBegin(ctx, x, y, s, color);
    roundRect(ctx, 3, 5.5, 18, 13, 2.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(4, 7); ctx.lineTo(12, 13); ctx.lineTo(20, 7); ctx.stroke(); ctx.restore();
  },
  coin(ctx, x, y, s, color = PAL.ink) {
    iconBegin(ctx, x, y, s, color);
    ctx.beginPath(); ctx.arc(12, 12, 8.5, 0, TAU); ctx.stroke();
    ctx.font = "700 10px 'Inter'"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Rp', 12, 12.6); ctx.restore();
  },
  calendar(ctx, x, y, s, color = PAL.ink) {
    iconBegin(ctx, x, y, s, color);
    roundRect(ctx, 3.5, 5, 17, 15, 3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(3.5, 10); ctx.lineTo(20.5, 10); ctx.moveTo(8, 3); ctx.lineTo(8, 7); ctx.moveTo(16, 3); ctx.lineTo(16, 7); ctx.stroke(); ctx.restore();
  },
  user(ctx, x, y, s, color = PAL.ink) {
    iconBegin(ctx, x, y, s, color);
    ctx.beginPath(); ctx.arc(12, 8.5, 4, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(4.5, 20); ctx.bezierCurveTo(5, 15, 19, 15, 19.5, 20); ctx.stroke(); ctx.restore();
  },
  scan(ctx, x, y, s, color = PAL.ink) {
    iconBegin(ctx, x, y, s, color);
    ctx.beginPath();
    ctx.moveTo(4, 9); ctx.lineTo(4, 4); ctx.lineTo(9, 4); ctx.moveTo(15, 4); ctx.lineTo(20, 4); ctx.lineTo(20, 9);
    ctx.moveTo(20, 15); ctx.lineTo(20, 20); ctx.lineTo(15, 20); ctx.moveTo(9, 20); ctx.lineTo(4, 20); ctx.lineTo(4, 15);
    ctx.moveTo(7, 12); ctx.lineTo(17, 12); ctx.stroke(); ctx.restore();
  },
};

// ---------------------------------------------------------------- pointer & taps
function cursorSprite() {
  return cached('pl-cursor', () => {
    const c = makeCanvas(120, 150), g = c.getContext('2d');
    const path = () => { g.beginPath(); g.moveTo(20, 14); g.lineTo(20, 104); g.lineTo(42, 84); g.lineTo(56, 116); g.lineTo(72, 109); g.lineTo(58, 78); g.lineTo(88, 78); g.closePath(); };
    g.shadowColor = 'rgba(0,0,0,0.28)'; g.shadowBlur = 14; g.shadowOffsetY = 6;
    path(); g.fillStyle = '#fff'; g.fill(); g.shadowColor = 'transparent';
    g.lineJoin = 'round'; g.lineWidth = 7; g.strokeStyle = '#fff'; path(); g.stroke();
    g.save(); g.translate(20, 14); g.scale(0.8, 0.8); g.translate(-20, -14);
    g.beginPath(); g.moveTo(20, 14); g.lineTo(20, 104); g.lineTo(42, 84); g.lineTo(56, 116); g.lineTo(72, 109); g.lineTo(58, 78); g.lineTo(88, 78); g.closePath();
    g.fillStyle = '#111114'; g.fill(); g.restore();
    return c;
  });
}
/** Oversized macOS-like pointer. Tip at x,y. press 0..1 squeezes it (0.9). */
export function cursor(ctx, x, y, { press = 0, alpha = 1, scale = 1 } = {}) {
  if (alpha <= 0) return;
  const s = scale * (1 - 0.1 * press);
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.scale(s, s);
  ctx.drawImage(cursorSprite(), -20, -14); ctx.restore();
}
/** Expanding ring where a tap/click lands. age = seconds since the click. */
export function ripple(ctx, x, y, age, { color = PAL.accent, r = 70, ring = false, dur = 0.6 } = {}) {
  if (age < 0 || age > dur) return;
  const p = ease.outCubic(age / dur);
  ctx.save(); ctx.globalAlpha *= (1 - p) * (ring ? 0.8 : 0.5);
  ctx.beginPath(); ctx.arc(x, y, r * (0.35 + 0.9 * p), 0, TAU);
  if (ring) { ctx.lineWidth = 6 * (1 - p) + 1; ctx.strokeStyle = color; ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); }
  ctx.restore();
}
/** Cursor path: keys [[t, x, y]] with spring glides; clicks [t...] give press + ripple. Returns {x,y,press}. */
export function pointerAt(t, keys, clicks = [], o = { z: 0.9, ts: 0.55 }) {
  const x = springKeys(t, keys.map((k) => [k[0], k[1]]), o), y = springKeys(t, keys.map((k) => [k[0], k[2]]), o);
  let press = 0;
  for (const c of clicks) { const d = t - c; if (d > -0.08 && d < 0.18) press = Math.max(press, d < 0 ? 1 + d / 0.08 : 1 - d / 0.18); }
  return { x, y, press: clamp(press) };
}

// ---------------------------------------------------------------- phone mockup
export const PHONE = { w: 390, h: 844, r: 58, bezel: 13 };
/** Phone mockup centred at x,y with scale s. draw(g) paints the screen in local points (0..390 x 0..844).
 *  Returns a function mapping local screen points to the current canvas space. */
export function phone(ctx, x, y, s, draw, { rot = 0, elev = 1.2, alpha = 1, screen = '#FFFFFF', statusDark = false, time = '9:41' } = {}) {
  const { w, h, r, bezel: b } = PHONE;
  ctx.save(); ctx.globalAlpha *= alpha;
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.translate(-w / 2, -h / 2);
  softShadow(ctx, -b, -b, w + 2 * b, h + 2 * b, r + b, { elev });
  // titanium frame + bezel
  roundRect(ctx, -b - 3, -b - 3, w + 2 * b + 6, h + 2 * b + 6, r + b + 3); ctx.fillStyle = '#C9C6C0'; ctx.fill();
  roundRect(ctx, -b, -b, w + 2 * b, h + 2 * b, r + b); ctx.fillStyle = PAL.bezel; ctx.fill();
  // side buttons
  ctx.fillStyle = '#B9B6B0';
  roundRect(ctx, w + b + 1, 190, 5, 110, 2); ctx.fill();
  roundRect(ctx, -b - 6, 160, 5, 60, 2); ctx.fill(); roundRect(ctx, -b - 6, 240, 5, 60, 2); ctx.fill();
  // screen
  ctx.save(); roundRect(ctx, 0, 0, w, h, r); ctx.clip();
  ctx.fillStyle = screen; ctx.fillRect(0, 0, w, h);
  draw && draw(ctx);
  // status bar + dynamic island
  const sc = statusDark ? '#fff' : PAL.ink;
  label(ctx, time, 52, 30, { size: 17, weight: 700, color: sc, spacing: 0 });
  ctx.fillStyle = sc; for (let i = 0; i < 4; i++) { roundRect(ctx, 296 + i * 6, 34 - i * 3, 4, 6 + i * 3, 1); ctx.fill(); }
  roundRect(ctx, 326, 22, 26, 13, 4); ctx.lineWidth = 1.4; ctx.strokeStyle = sc; ctx.stroke(); roundRect(ctx, 328.5, 24.5, 19, 8, 2); ctx.fill();
  roundRect(ctx, w / 2 - 62, 11, 124, 36, 18); ctx.fillStyle = '#000'; ctx.fill();
  // glass sheen
  const gl = ctx.createLinearGradient(0, 0, w, h * 0.6);
  gl.addColorStop(0, 'rgba(255,255,255,0.10)'); gl.addColorStop(0.35, 'rgba(255,255,255,0)'); ctx.fillStyle = gl; ctx.fillRect(0, 0, w, h);
  ctx.restore();
  ctx.restore();
  const cr = Math.cos(rot), sr = Math.sin(rot);
  return (px, py) => { const lx = (px - w / 2) * s, ly = (py - h / 2) * s; return [x + lx * cr - ly * sr, y + lx * sr + ly * cr]; };
}

// ---------------------------------------------------------------- QR code
/** Deterministic QR-like matrix (finder + timing + alignment patterns, pseudo-random data). Not a real code. */
export function qrMatrix(seed = 7, n = 29) {
  return cached('pl-qr:' + seed + ':' + n, () => {
    const M = Array.from({ length: n }, () => new Array(n).fill(0)), fixed = Array.from({ length: n }, () => new Array(n).fill(false));
    const finder = (ox, oy) => { for (let y = -1; y <= 7; y++) for (let x = -1; x <= 7; x++) { const X = ox + x, Y = oy + y; if (X < 0 || Y < 0 || X >= n || Y >= n) continue; const d = Math.max(Math.abs(x - 3), Math.abs(y - 3)); M[Y][X] = (d === 0 || d === 1 || d === 3) && x >= 0 && y >= 0 && x <= 6 && y <= 6 ? (d === 2 ? 0 : 1) : 0; if (d === 2) M[Y][X] = 0; fixed[Y][X] = true; } };
    finder(0, 0); finder(n - 7, 0); finder(0, n - 7);
    for (let i = 8; i < n - 8; i++) { M[6][i] = M[i][6] = i % 2 ? 0 : 1; fixed[6][i] = fixed[i][6] = true; }
    const ax = n - 9; for (let y = -2; y <= 2; y++) for (let x = -2; x <= 2; x++) { const d = Math.max(Math.abs(x), Math.abs(y)); M[ax + y][ax + x] = d === 1 ? 0 : 1; fixed[ax + y][ax + x] = true; }
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!fixed[y][x]) M[y][x] = hrand(x, y, seed) < 0.48 ? 1 : 0;
    return M;
  });
}
/** Draw the QR at x,y (top-left) size `size`. reveal: 0..1 diagonal wave; hi: highlight wave position (scan). */
export function qrCode(ctx, x, y, size, { seed = 7, color = PAL.ink, reveal = 1, hi = -1, hiColor = PAL.accent, round = 0.28 } = {}) {
  const M = qrMatrix(seed), n = M.length, m = size / n;
  if (reveal >= 1 && hi < 0) {
    const spr = cached(`pl-qrspr:${seed}:${color}`, () => {
      const S = 12, c = makeCanvas(n * S, n * S), g = c.getContext('2d'); g.fillStyle = color;
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) if (M[j][i]) { roundRect(g, i * S + 0.5, j * S + 0.5, S - 1, S - 1, S * round); g.fill(); }
      return c;
    });
    ctx.drawImage(spr, x, y, size, size); return;
  }
  const base = new Path2D(), lit = new Path2D();
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    if (!M[j][i]) continue;
    const d = (i + j) / (2 * n - 2);
    const p = clamp((reveal * 1.4 - d) / 0.4);
    if (p <= 0) continue;
    const s = m * (0.4 + 0.6 * ease.outBack(p, 2)) - 1, cx = x + (i + 0.5) * m, cy = y + (j + 0.5) * m;
    const target = hi >= 0 && Math.abs(d - hi) < 0.06 ? lit : base;
    target.rect(cx - s / 2, cy - s / 2, s, s);
  }
  ctx.fillStyle = color; ctx.fill(base);
  ctx.fillStyle = hiColor; ctx.fill(lit);
}

// ---------------------------------------------------------------- paths, packets, trails
export const bez = (P, u) => {
  const [a, b, c, d] = P, v = 1 - u;
  return [v * v * v * a[0] + 3 * v * v * u * b[0] + 3 * v * u * u * c[0] + u * u * u * d[0], v * v * v * a[1] + 3 * v * v * u * b[1] + 3 * v * u * u * c[1] + u * u * u * d[1]];
};
/** Point along a chain of cubic segments (array of [p0,p1,p2,p3]) at global u 0..1 (equal time per segment). */
export function along(chain, u) {
  const n = chain.length, k = Math.min(n - 1, Math.floor(clamp(u) * n));
  return bez(chain[k], clamp(u) * n - k);
}
/** Dashed route with an animated draw-on (p) and marching dashes. */
export function route(ctx, P, { p = 1, t = 0, color = 'rgba(17,17,20,0.22)', width = 4, dash = [2, 14] } = {}) {
  if (p <= 0) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round';
  ctx.setLineDash(dash); ctx.lineDashOffset = -t * 40;
  ctx.beginPath(); ctx.moveTo(...P[0]);
  const N = 40; for (let i = 1; i <= Math.round(N * clamp(p)); i++) ctx.lineTo(...bez(P, i / N));
  ctx.stroke(); ctx.restore();
}
/** Light trail behind a moving point on a bezier: u = head position, len = trail length (in u). */
export function trail(ctx, P, u, { len = 0.25, color = '79,70,229', width = 10 } = {}) {
  const N = 16;
  ctx.save(); ctx.lineCap = 'round';
  for (let i = 0; i < N; i++) {
    const u0 = u - len * (i + 1) / N, u1 = u - len * i / N;
    if (u1 <= 0) break;
    const a = bez(P, clamp(u0)), b = bez(P, clamp(u1));
    ctx.strokeStyle = `rgba(${color},${(1 - i / N) * 0.55})`; ctx.lineWidth = width * (1 - i / N * 0.7);
    ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke();
  }
  ctx.restore();
}
/** Cached soft glow sprite (radial) stamped at x,y. */
export function glow(ctx, x, y, r, { color = '79,70,229', a = 0.5 } = {}) {
  const spr = cached('pl-glow:' + color, () => {
    const c = makeCanvas(96, 96), g = c.getContext('2d'), gr = g.createRadialGradient(48, 48, 0, 48, 48, 48);
    gr.addColorStop(0, `rgba(${color},1)`); gr.addColorStop(0.4, `rgba(${color},0.35)`); gr.addColorStop(1, `rgba(${color},0)`);
    g.fillStyle = gr; g.fillRect(0, 0, 96, 96); return c;
  });
  ctx.save(); ctx.globalAlpha *= a; ctx.drawImage(spr, x - r, y - r, 2 * r, 2 * r); ctx.restore();
}
/** Gentle float for idle objects (px). */
export const float = (t, seed = 0, amp = 6) => [noise.n2(t * 0.35, seed) * amp, noise.n2(t * 0.3, seed + 9) * amp];
