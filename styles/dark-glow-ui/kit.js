// Maura Motion style kit: DARK GLOW PRODUCT UI.
// Near-black navy stage with huge soft violet/blue glows (pre-rendered sprites), a faint grid and film noise;
// glassmorphism cards with a 1px rim and top highlight; light trails; giant tabular numbers; mono micro-labels;
// text that scrambles into cipher glyphs and decodes back. Motion: closed-form springs, blur-free "rise + glow-in".
import { clamp, lerp, ease, hrand, noise, TAU } from '/engine/lib/core.js';
import { makeCanvas, cached, roundRect } from '/engine/lib/draw.js';

export const PAL = {
  bg: '#06070C', bg2: '#0B0E1A', navy: '#10152A', ink: '#F3F5FF', ink2: '#9AA0BC', ink3: '#5A6080',
  violet: '#7C6CFF', blue: '#3DA9FF', cyan: '#6FF3FF', pink: '#FF5FD2', mint: '#5BF5B5',
  glass: 'rgba(255,255,255,0.055)', rim: 'rgba(255,255,255,0.14)', tick: '#3DA9FF',
};
export const RGB = { violet: '124,108,255', blue: '61,169,255', cyan: '111,243,255', pink: '255,95,210', mint: '91,245,181', white: '255,255,255' };
export const FONT = { sans: 'Inter', mono: 'JetBrains Mono', display: 'Inter' };

// ---------------------------------------------------------------- springs, timing, camera
export function spring(t, { z = 0.72, ts = 0.5 } = {}) {
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
export const sp = (t, t0, ts = 0.5, z = 0.72) => spring(t - t0, { z, ts });
export const count = (t, t0, dur, a, b) => lerp(a, b, ease.outExpo(clamp((t - t0) / dur)));
export function camAt(t, keys, o = { z: 1, ts: 0.9 }) {
  return {
    x: springKeys(t, keys.map((k) => [k[0], k[1]]), o),
    y: springKeys(t, keys.map((k) => [k[0], k[2]]), o),
    z: Math.exp(springKeys(t, keys.map((k) => [k[0], Math.log(k[3])]), o)),
    rot: springKeys(t, keys.map((k) => [k[0], k[4] || 0]), o),
  };
}
export function applyCam(ctx, c, W = 1080, H = 1920) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(W / 2, H / 2); if (c.rot) ctx.rotate(c.rot); ctx.scale(c.z, c.z); ctx.translate(-c.x, -c.y);
}
export const toScreen = (c, x, y) => [(x - c.x) * c.z + 540, (y - c.y) * c.z + 960];

// ---------------------------------------------------------------- glow sprites & stage
export function glowSprite(rgb, falloff = 0.42) {
  return cached(`dg-glow:${rgb}:${falloff}`, () => {
    const c = makeCanvas(128, 128), g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, `rgba(${rgb},1)`); gr.addColorStop(falloff * 0.5, `rgba(${rgb},0.55)`); gr.addColorStop(falloff, `rgba(${rgb},0.22)`); gr.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return c;
  });
}
/** Soft additive glow (keep radius modest: 'lighter' is only cheap on small areas). */
export function glow(ctx, x, y, r, rgb = RGB.violet, a = 0.6, add = true) {
  if (a <= 0 || r <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; if (add) ctx.globalCompositeOperation = 'lighter';
  ctx.drawImage(glowSprite(rgb), x - r, y - r, 2 * r, 2 * r); ctx.restore();
}
function gridTile() {
  return cached('dg-grid', () => {
    const c = makeCanvas(120, 120), g = c.getContext('2d');
    g.strokeStyle = 'rgba(140,150,255,0.07)'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(0.5, 0); g.lineTo(0.5, 120); g.moveTo(0, 0.5); g.lineTo(120, 0.5); g.stroke();
    g.fillStyle = 'rgba(160,170,255,0.16)'; g.fillRect(0, 0, 2, 2);
    return c;
  });
}
/** The stage: near-black navy, three huge drifting glows, faint grid (parallax). Screen space.
 *  Glows are composed into one small canvas and upscaled once (one full-screen draw instead of four). */
export function stage(ctx, t, { px = 0, py = 0, glows = null, grid = 0.9, intensity = 1 } = {}) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const W = ctx.canvas.width, H = ctx.canvas.height, k = 0.2;
  const lo = cached('dg-stage-lo', () => makeCanvas(Math.round(1080 * k), Math.round(1920 * k))), g = lo.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  const gr = g.createLinearGradient(0, 0, 0, lo.height); gr.addColorStop(0, '#0A0C16'); gr.addColorStop(0.55, '#06070C'); gr.addColorStop(1, '#090A14');
  g.fillStyle = gr; g.fillRect(0, 0, lo.width, lo.height);
  g.scale(k, k);
  const G = glows || [
    { rgb: RGB.violet, x: 250, y: 520, r: 900, a: 0.42 },
    { rgb: RGB.blue, x: 900, y: 1250, r: 950, a: 0.32 },
    { rgb: RGB.pink, x: 140, y: 1700, r: 700, a: 0.12 },
  ];
  G.forEach((q, i) => {
    const x = q.x + Math.sin(t * 0.21 + i * 2.1) * 110 - px * (0.3 + 0.2 * i), y = q.y + Math.cos(t * 0.17 + i) * 90 - py * (0.3 + 0.2 * i);
    const r = q.r * (1 + 0.07 * Math.sin(t * 0.4 + i));
    g.globalAlpha = q.a * intensity; g.drawImage(glowSprite(q.rgb, 0.7), x - r, y - r, 2 * r, 2 * r);
  });
  ctx.imageSmoothingQuality = 'low';
  ctx.drawImage(lo, 0, 0, W, H);
  if (grid > 0) {
    ctx.globalAlpha = grid;
    const pat = cached('dg-gridpat', () => ctx.createPattern(gridTile(), 'repeat'));
    const ox = ((-px * 0.5) % 120 + 120) % 120, oy = ((-py * 0.5) % 120 + 120) % 120;
    ctx.translate(ox - 120, oy - 120); ctx.fillStyle = pat; ctx.fillRect(0, 0, W + 240, H + 240);
  }
  ctx.restore();
}

// ---------------------------------------------------------------- glass cards
function rimSprite(r, blur, rgb) {
  return cached(`dg-rim:${r}:${blur}:${rgb}`, () => {
    const pad = Math.ceil(blur * 1.6) + 2, inner = 2 * r + 2, S = inner + 2 * pad;
    const c = makeCanvas(S, S), g = c.getContext('2d');
    g.shadowColor = `rgba(${rgb},1)`; g.shadowBlur = blur; g.shadowOffsetX = 4000;
    g.fillStyle = '#000'; roundRect(g, pad - 4000, pad, inner, inner, r); g.fill();
    c.pad = pad; c.r = r; return c;
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
const qr = (r) => [8, 12, 18, 24, 32, 44, 60, 80, 110].reduce((a, b) => (Math.abs(b - r) < Math.abs(a - r) ? b : a));
/** Outer halo around a rounded rect (cached 9-slice). */
export function halo(ctx, x, y, w, h, r, { rgb = RGB.violet, a = 0.5, blur = 40 } = {}) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.globalCompositeOperation = 'lighter';
  nine(ctx, rimSprite(qr(Math.min(r, w / 2, h / 2)), blur, rgb), x, y, w, h); ctx.restore();
}
/** Glassmorphism card: dark tinted body, 1px rim brighter at the top, inner top highlight, optional halo. */
export function glass(ctx, x, y, w, h, { r = 28, alpha = 1, tint = 'rgba(16,20,40,0.72)', haloRgb = null, haloA = 0.35, rim = 1, lift = 0 } = {}) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha;
  // drop shadow (dark, soft) for depth
  nine(ctx, rimSprite(qr(Math.min(r, w / 2, h / 2)), 50, '0,0,0'), x, y + 18 + lift * 20, w, h);
  if (haloRgb) halo(ctx, x, y, w, h, r, { rgb: haloRgb, a: haloA });
  roundRect(ctx, x, y, w, h, r); ctx.fillStyle = tint; ctx.fill();
  ctx.fillStyle = PAL.glass; ctx.fill();
  const hl = ctx.createLinearGradient(0, y, 0, y + Math.min(h, 160));
  hl.addColorStop(0, 'rgba(255,255,255,0.10)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hl; ctx.fill();
  const rg = ctx.createLinearGradient(0, y, 0, y + h);
  rg.addColorStop(0, `rgba(255,255,255,${0.30 * rim})`); rg.addColorStop(0.35, `rgba(255,255,255,${0.10 * rim})`); rg.addColorStop(1, `rgba(255,255,255,${0.05 * rim})`);
  ctx.lineWidth = 1.5; ctx.strokeStyle = rg; ctx.stroke();
  ctx.restore();
}
/** Entrance transform: rise + scale + fade on a spring p. */
export function rise(ctx, cx, cy, p, { from = 0.88, dy = 50, tilt = 0 } = {}) {
  const s = lerp(from, 1, p);
  ctx.globalAlpha *= clamp(p * 1.5);
  ctx.translate(cx, cy + (1 - p) * dy); if (tilt) ctx.transform(1, 0, 0, lerp(1 - tilt, 1, p), 0, 0); ctx.scale(s, s); ctx.translate(-cx, -cy);
}

// ---------------------------------------------------------------- type
export function label(ctx, str, x, y, { size = 32, weight = 400, color = PAL.ink, align = 'left', font = FONT.sans, spacing = null, alpha = 1, baseline = 'middle' } = {}) {
  ctx.save(); ctx.globalAlpha *= alpha;
  ctx.font = `${weight} ${size}px '${font}'`;
  ctx.letterSpacing = (spacing ?? (font === FONT.sans && size >= 40 ? -size * 0.03 : 0)) + 'px';
  ctx.textAlign = align; ctx.textBaseline = baseline; ctx.fillStyle = color; ctx.fillText(str, x, y);
  const w = ctx.measureText(str).width; ctx.restore(); return w;
}
/** Mono micro-label (corners, tags). */
export const micro = (ctx, str, x, y, o = {}) => label(ctx, str.toUpperCase(), x, y, { size: 20, font: FONT.mono, color: PAL.ink3, spacing: 3, ...o });
/** Headline rising through a mask; *word* = accent gradient (violet -> blue). */
export function headline(ctx, t, t0, lines, x, y, { size = 86, weight = 700, color = PAL.ink, align = 'center', gap = 1.1, stagger = 0.08, out = null, alpha = 1, accent = [PAL.violet, PAL.blue] } = {}) {
  const lh = size * gap;
  lines.forEach((line, i) => {
    const p = spring(t - t0 - i * stagger, { z: 0.85, ts: 0.7 });
    const o = out !== null ? ease.inCubic(clamp((t - out - i * 0.04) / 0.3)) : 0;
    if (p <= 0 || o >= 1) return;
    const segs = line.split(/(\*[^*]+\*)/).filter(Boolean).map((s) => (s.startsWith('*') ? { s: s.slice(1, -1), a: true } : { s, a: false }));
    ctx.save(); ctx.globalAlpha *= alpha * clamp(p * 1.4) * (1 - o);
    ctx.font = `${weight} ${size}px '${FONT.sans}'`; ctx.letterSpacing = `${-size * 0.035}px`; ctx.textBaseline = 'alphabetic';
    const W = segs.reduce((a, s) => a + ctx.measureText(s.s).width, 0);
    let cx = align === 'center' ? x - W / 2 : align === 'right' ? x - W : x;
    const by = y + i * lh;
    ctx.beginPath(); ctx.rect(cx - 40, by - size * 1.05, W + 80, size * 1.4); ctx.clip();
    const dy = (1 - p) * size * 0.9 - o * size;
    for (const s of segs) {
      const w = ctx.measureText(s.s).width;
      if (s.a) { const g = ctx.createLinearGradient(cx, 0, cx + w, 0); g.addColorStop(0, accent[0]); g.addColorStop(1, accent[1]); ctx.fillStyle = g; }
      else ctx.fillStyle = color;
      ctx.fillText(s.s, cx, by + dy); cx += w;
    }
    ctx.restore();
  });
}
/** Giant power-of-ten numeral: base + superscript exponent. Returns total width. */
export function power(ctx, base, exp, x, y, { size = 300, color = PAL.ink, expColor = null, align = 'center', alpha = 1 } = {}) {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.textBaseline = 'alphabetic';
  ctx.font = `700 ${size}px '${FONT.sans}'`; ctx.letterSpacing = `${-size * 0.04}px`;
  const bw = ctx.measureText(base).width;
  ctx.font = `700 ${size * 0.5}px '${FONT.sans}'`; const ew = ctx.measureText(exp).width;
  const W = bw + ew + size * 0.02;
  let x0 = align === 'center' ? x - W / 2 : x;
  ctx.font = `700 ${size}px '${FONT.sans}'`; ctx.fillStyle = color; ctx.fillText(base, x0, y);
  ctx.font = `700 ${size * 0.5}px '${FONT.sans}'`;
  if (expColor) { const g = ctx.createLinearGradient(x0 + bw, 0, x0 + bw + ew, 0); g.addColorStop(0, expColor[0]); g.addColorStop(1, expColor[1]); ctx.fillStyle = g; }
  ctx.fillText(exp, x0 + bw + size * 0.02, y - size * 0.42);
  ctx.restore(); return W;
}

// ---------------------------------------------------------------- cipher text
const GLY = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=#%&$@';
/** Deterministic cipher string (base64-looking). */
export const cipher = (seed, n) => Array.from({ length: n }, (_, i) => GLY[Math.floor(hrand(seed, i) * 64)]).join('');
/** Text <-> glyphs. u = 0 plain, 1 fully scrambled; characters flip left to right with a flickering front. */
export function scramble(plain, u, t, seed = 1, target = null) {
  const n = plain.length, out = [];
  const f = Math.floor(t * 24);
  for (let i = 0; i < n; i++) {
    const k = clamp(u * 1.35 - (i / n) * 0.35);
    const ch = plain[i];
    if (ch === ' ' && !target) { out.push(k > 0.6 ? GLY[Math.floor(hrand(seed, i, 7) * 64)] : ' '); continue; }
    if (k <= 0) out.push(ch);
    else if (k >= 1) out.push(target ? target[i % target.length] : GLY[Math.floor(hrand(seed, i) * 64)]);
    else out.push(GLY[Math.floor(hrand(seed, i, f) * GLY.length)]);
  }
  return out.join('');
}

// ---------------------------------------------------------------- icons & props
export function padlock(ctx, x, y, s, { open = 0, rgb = RGB.violet, glowA = 0.6, body = 'rgba(20,24,48,0.9)', t = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  glow(ctx, 0, 10, 260, rgb, glowA * 0.6);
  // shackle: lifts and swings open
  ctx.save(); ctx.translate(48, -60 - open * 46); ctx.rotate(-open * 0.0); ctx.translate(-48, 60 + open * 46);
  ctx.lineWidth = 26; ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(200,205,255,0.92)';
  ctx.beginPath(); ctx.moveTo(-58, -40 - open * 46); ctx.lineTo(-58, -92 - open * 46); ctx.arc(0, -92 - open * 46, 58, Math.PI, 0); ctx.lineTo(58, -40 - open * 46 + open * 40); ctx.stroke();
  ctx.restore();
  glass(ctx, -110, -50, 220, 180, { r: 34, tint: body, haloRgb: rgb, haloA: 0.45 });
  // keyhole
  ctx.fillStyle = `rgba(${rgb},1)`; ctx.beginPath(); ctx.arc(0, 22, 18, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-9, 28); ctx.lineTo(9, 28); ctx.lineTo(13, 78); ctx.lineTo(-13, 78); ctx.closePath(); ctx.fill();
  glow(ctx, 0, 40, 70, rgb, 0.7);
  ctx.restore();
}
export function keyIcon(ctx, x, y, s, { rot = 0, rgb = RGB.cyan, alpha = 1 } = {}) {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  glow(ctx, -40, 0, 120, rgb, 0.5);
  ctx.strokeStyle = `rgb(${rgb})`; ctx.fillStyle = `rgb(${rgb})`; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.arc(-60, 0, 36, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-24, 0); ctx.lineTo(90, 0); ctx.moveTo(60, 0); ctx.lineTo(60, 30); ctx.moveTo(84, 0); ctx.lineTo(84, 22); ctx.stroke();
  ctx.restore();
}
/** Ticks: n = 1 or 2, p = draw progress, color. (x,y) = left of the first tick, height ~ s. */
export function ticks(ctx, x, y, n, { s = 22, color = PAL.ink2, p = 1, lw = 3 } = {}) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let i = 0; i < n; i++) {
    const q = clamp(p * n - i), ox = x + i * s * 0.45;
    if (q <= 0) continue;
    ctx.beginPath(); ctx.moveTo(ox, y);
    if (q < 0.4) ctx.lineTo(ox + s * 0.3 * q / 0.4, y + s * 0.3 * q / 0.4);
    else { ctx.lineTo(ox + s * 0.3, y + s * 0.3); const u = (q - 0.4) / 0.6; ctx.lineTo(ox + s * 0.3 + s * 0.5 * u, y + s * 0.3 - s * 0.62 * u); }
    ctx.stroke();
  }
  ctx.restore();
}
/** Server tower (glass) with blinking LEDs; `scan` 0..1 runs a read beam across it. */
export function server(ctx, x, y, s, t, { active = 0, rgb = RGB.blue } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  glow(ctx, 0, 0, 420, rgb, 0.25 + 0.3 * active);
  for (let i = 0; i < 3; i++) {
    const yy = -180 + i * 125;
    glass(ctx, -190, yy, 380, 105, { r: 22, haloRgb: i === 1 && active > 0 ? rgb : null, haloA: 0.4 * active });
    for (let k = 0; k < 3; k++) { const on = hrand(i, k, Math.floor(t * 6)) > 0.35; ctx.fillStyle = on ? `rgba(${k === 0 ? RGB.mint : rgb},0.95)` : 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.arc(-150 + k * 30, yy + 52, 7, 0, TAU); ctx.fill(); }
    for (let k = 0; k < 6; k++) { ctx.fillStyle = 'rgba(255,255,255,0.10)'; roundRect(ctx, 0 + k * 26, yy + 30, 14, 46, 4); ctx.fill(); }
  }
  ctx.restore();
}
export function eyeOff(ctx, x, y, s, color = PAL.ink2) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 24, s / 24); ctx.translate(-12, -12);
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(2, 12); ctx.bezierCurveTo(6, 5, 18, 5, 22, 12); ctx.bezierCurveTo(18, 19, 6, 19, 2, 12); ctx.stroke();
  ctx.beginPath(); ctx.arc(12, 12, 3.2, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(4, 3); ctx.lineTo(20, 21); ctx.stroke(); ctx.restore();
}
export function heart(ctx, x, y, s, color = PAL.pink) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 24, s / 24); ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(0, 8); ctx.bezierCurveTo(-14, -2, -10, -14, 0, -6); ctx.bezierCurveTo(10, -14, 14, -2, 0, 8); ctx.fill(); ctx.restore();
}

// ---------------------------------------------------------------- chat UI
/** Chat bubble anchored at its right edge (mine) or left edge. Returns [w, h]. */
export function bubble(ctx, x, y, text, { mine = true, size = 30, maxW = 560, font = FONT.sans, tickN = 0, tickColor = PAL.ink2, tickP = 1, time = '21.47', alpha = 1, color = null, fill = null, mono = false } = {}) {
  ctx.save(); ctx.globalAlpha *= alpha;
  ctx.font = `${mono ? 400 : 500} ${size}px '${mono ? FONT.mono : font}'`; ctx.letterSpacing = mono ? '0px' : `${-size * 0.01}px`;
  const tw = Math.min(maxW, ctx.measureText(text).width), meta = size * 3.4;
  const w = tw + size * 1.2 + meta, h = size * 2.2;
  const bx = mine ? x - w : x;
  roundRect(ctx, bx, y, w, h, size * 0.75);
  if (fill) ctx.fillStyle = fill;
  else if (mine) { const g = ctx.createLinearGradient(bx, y, bx + w, y + h); g.addColorStop(0, '#5B4DF0'); g.addColorStop(1, '#2F7CF0'); ctx.fillStyle = g; }
  else ctx.fillStyle = 'rgba(255,255,255,0.09)';
  ctx.fill();
  ctx.fillStyle = color || PAL.ink; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.save(); ctx.beginPath(); ctx.rect(bx, y, w - meta + size * 0.3, h); ctx.clip();
  ctx.fillText(text, bx + size * 0.6, y + h / 2 + 1); ctx.restore();
  ctx.font = `400 ${size * 0.55}px '${FONT.sans}'`; ctx.letterSpacing = '0px'; ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText(time, bx + w - meta + size * 0.5, y + h / 2 + size * 0.28);
  if (tickN) ticks(ctx, bx + w - size * 1.25, y + h / 2 + size * 0.12, tickN, { s: size * 0.62, color: tickColor, p: tickP, lw: size * 0.09 });
  ctx.restore();
  return [w, h];
}

// ---------------------------------------------------------------- phone
export const PHONE = { w: 390, h: 844, r: 58, bezel: 12 };
/** Dark phone mockup with rim light. draw(g) paints the screen in local points (0..390, 0..844). */
export function phone(ctx, x, y, s, draw, { rot = 0, alpha = 1, rimRgb = RGB.violet, rimA = 0.5, time = '21.47' } = {}) {
  const { w, h, r, bezel: b } = PHONE;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.translate(-w / 2, -h / 2);
  halo(ctx, -b, -b, w + 2 * b, h + 2 * b, r + b, { rgb: rimRgb, a: rimA, blur: 60 });
  roundRect(ctx, -b - 3, -b - 3, w + 2 * b + 6, h + 2 * b + 6, r + b + 3);
  const fr = ctx.createLinearGradient(-b, -b, w + b, h + b); fr.addColorStop(0, '#5a5f78'); fr.addColorStop(0.5, '#1a1d2a'); fr.addColorStop(1, '#3a3f58');
  ctx.fillStyle = fr; ctx.fill();
  roundRect(ctx, -b, -b, w + 2 * b, h + 2 * b, r + b); ctx.fillStyle = '#020306'; ctx.fill();
  ctx.save(); roundRect(ctx, 0, 0, w, h, r); ctx.clip();
  ctx.fillStyle = '#0B0D16'; ctx.fillRect(0, 0, w, h);
  draw && draw(ctx);
  label(ctx, time, 50, 30, { size: 17, weight: 700, spacing: 0 });
  ctx.fillStyle = PAL.ink; for (let i = 0; i < 4; i++) { roundRect(ctx, 296 + i * 6, 34 - i * 3, 4, 6 + i * 3, 1); ctx.fill(); }
  roundRect(ctx, 326, 22, 26, 13, 4); ctx.lineWidth = 1.4; ctx.strokeStyle = PAL.ink; ctx.stroke(); roundRect(ctx, 328.5, 24.5, 19, 8, 2); ctx.fill();
  roundRect(ctx, w / 2 - 62, 11, 124, 36, 18); ctx.fillStyle = '#000'; ctx.fill();
  ctx.restore(); ctx.restore();
  const cr = Math.cos(rot), sr = Math.sin(rot);
  return (px, py) => { const lx = (px - w / 2) * s, ly = (py - h / 2) * s; return [x + lx * cr - ly * sr, y + lx * sr + ly * cr]; };
}

// ---------------------------------------------------------------- light trails & particles
/** Light trail along a path function P(u) -> [x,y]: bright core + stamped glow, from u-len to u. */
export function lightTrail(ctx, P, u, { len = 0.3, rgb = RGB.violet, width = 6, glowR = 40, steps = 24, head = true } = {}) {
  const u0 = Math.max(0, u - len);
  if (u <= 0) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  for (let i = 0; i < steps; i++) {
    const a = lerp(u0, u, i / steps), b = lerp(u0, u, (i + 1) / steps), k = (i + 1) / steps;
    const [x1, y1] = P(a), [x2, y2] = P(b);
    ctx.strokeStyle = `rgba(${rgb},${0.9 * k})`; ctx.lineWidth = width * (0.3 + 0.7 * k);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    if (i % 4 === 3) { ctx.globalAlpha = 0.25 * k; ctx.drawImage(glowSprite(rgb), x2 - glowR, y2 - glowR, glowR * 2, glowR * 2); ctx.globalAlpha = 1; }
  }
  if (head) { const [hx, hy] = P(u); ctx.globalAlpha = 0.9; ctx.drawImage(glowSprite(rgb), hx - glowR * 2, hy - glowR * 2, glowR * 4, glowR * 4); ctx.drawImage(glowSprite(RGB.white), hx - glowR * 0.6, hy - glowR * 0.6, glowR * 1.2, glowR * 1.2); }
  ctx.restore();
}
/** Burst of sparks at (x,y), age in seconds (deterministic). */
export function sparks(ctx, x, y, age, { n = 24, rgb = RGB.violet, speed = 520, seed = 1, life = 0.8 } = {}) {
  if (age < 0 || age > life) return;
  const p = age / life;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(${rgb},${1 - p})`;
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const a = hrand(seed, i) * TAU, v = speed * (0.4 + hrand(seed, i, 2) * 0.6), d = v * ease.outCubic(p) * life;
    const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d, r = (1 - p) * (3 + hrand(seed, i, 3) * 4);
    ctx.moveTo(px + r, py); ctx.arc(px, py, r, 0, TAU);
  }
  ctx.fill(); ctx.restore();
}
/** Cubic bezier point. */
export const bez = (P, u) => { const [a, b, c, d] = P, v = 1 - u; return [v * v * v * a[0] + 3 * v * v * u * b[0] + 3 * v * u * u * c[0] + u * u * u * d[0], v * v * v * a[1] + 3 * v * v * u * b[1] + 3 * v * u * u * c[1] + u * u * u * d[1]]; };
/** Film noise + vignette finish (cheap: pre-baked tiles). */
export function finish(ctx, t, AM) { AM.lib.vignette(ctx, { strength: 0.55, inner: 0.5 }); AM.lib.grain(ctx, t, { amount: 0.05, fps: 24 }); }
