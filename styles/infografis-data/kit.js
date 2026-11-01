// AniMasters style kit: INFOGRAFIS DATA (dark data dashboard).
// Near-black navy dashboard, thin axes and gridlines, HUD corner ticks, tabular-number counters that roll,
// person pictograms that light up and physically regroup into a waffle chart, bars that grow, a ranked
// bar list, a 100% stacked bar, and a mono source line. Everything eases with no overshoot except pops.
import { clamp, lerp, ease, hrand, mulberry32, TAU, rgba } from '/engine/lib/core.js';
import { makeCanvas, cached } from '/engine/lib/draw.js';
export { clamp, lerp, ease, TAU, rgba };

export const PAL = {
  bg: '#0a0e19', bg2: '#101729', panel: 'rgba(22,31,52,.78)', line: '#24304a', grid: 'rgba(120,150,200,.08)',
  text: '#eaf0fa', dim: '#7f8ba6', faint: '#3b4763', idle: '#56627e',
  asia: '#ff8a3d', africa: '#ffd23f', europe: '#4da3ff', americas: '#3ddc97', oceania: '#b47cff',
  indo: '#ff3b4e', white: '#ffffff', accent: '#28e0ff',
};
export const pr = (t, a, b, fn = ease.inOutCubic) => fn(clamp((t - a) / Math.max(1e-6, b - a)));
export const pop = (t, t0, d = 0.35) => (t < t0 ? 0 : ease.outBack(clamp((t - t0) / d), 2));
/** Indonesian number format with comma decimals: 3.47 -> "3,5" (dec=1), 8160 -> "8.160". */
export function num(v, dec = 0) {
  const s = Math.abs(v).toFixed(dec).split('.'); const i = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (v < 0 ? '-' : '') + i + (dec ? ',' + s[1] : '');
}

// ------------------------------------------------------------------ dashboard furniture
/** Background: deep navy, faint 60px grid, soft top glow (cached), HUD corner ticks. */
export function dashboard(ctx, t, { glow = PAL.accent } = {}) {
  const c = cached('ig-bg:' + glow, () => {
    const cv = makeCanvas(1080, 1920), g = cv.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 1920); gr.addColorStop(0, '#0d1424'); gr.addColorStop(1, PAL.bg);
    g.fillStyle = gr; g.fillRect(0, 0, 1080, 1920);
    const rg = g.createRadialGradient(540, 300, 0, 540, 300, 900); rg.addColorStop(0, rgba(glow, 0.08)); rg.addColorStop(1, rgba(glow, 0));
    g.fillStyle = rg; g.fillRect(0, 0, 1080, 1920);
    g.strokeStyle = PAL.grid; g.lineWidth = 1;
    for (let x = 60; x < 1080; x += 60) { g.beginPath(); g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5, 1920); g.stroke(); }
    for (let y = 60; y < 1920; y += 60) { g.beginPath(); g.moveTo(0, y + 0.5); g.lineTo(1080, y + 0.5); g.stroke(); }
    // HUD corners
    g.strokeStyle = 'rgba(160,190,240,.35)'; g.lineWidth = 3;
    for (const [x, y, sx, sy] of [[48, 130, 1, 1], [1032, 130, -1, 1], [48, 1350, 1, -1], [1032, 1350, -1, -1]]) { g.beginPath(); g.moveTo(x, y + sy * 40); g.lineTo(x, y); g.lineTo(x + sx * 40, y); g.stroke(); }
    return cv;
  });
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(c, 0, 0); ctx.restore();
}
/** Title block: small mono kicker + bold title, top-left. */
export function title(ctx, kicker, text, { x = 80, y = 190, p = 1, size = 54 } = {}) {
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(p * 1.5);
  ctx.translate(0, (1 - ease.outCubic(clamp(p))) * 20);
  ctx.font = "700 24px 'JetBrains Mono'"; ctx.letterSpacing = '4px'; ctx.fillStyle = PAL.accent; ctx.textBaseline = 'middle';
  ctx.fillText(kicker, x, y - 52);
  ctx.letterSpacing = '0px'; ctx.font = `800 ${size}px 'Inter'`; ctx.fillStyle = PAL.text; ctx.fillText(text, x, y);
  ctx.fillStyle = PAL.accent; ctx.fillRect(x, y + size * 0.62, 70 * clamp(p * 1.3), 4);
  ctx.restore();
}
/** Mono source line + live timecode (bottom of the safe area). */
export function source(ctx, text, t, { y = 1330, alpha = 1 } = {}) {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.font = "400 24px 'JetBrains Mono'"; ctx.fillStyle = PAL.dim; ctx.textBaseline = 'middle';
  ctx.fillText(text, 80, y);
  ctx.textAlign = 'right'; const f = Math.floor(t * 24) % 24, s = Math.floor(t);
  ctx.fillText(`TC 00:00:${String(s).padStart(2, '0')}:${String(f).padStart(2, '0')}`, 940, y); ctx.restore();
}
/** Tabular counter. */
export function counter(ctx, text, x, y, { size = 120, color = PAL.text, align = 'center', weight = 800, alpha = 1, font = 'Inter' } = {}) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.font = `${weight} ${size}px '${font}'`; ctx.textAlign = align; ctx.textBaseline = 'middle';
  ctx.fontVariantNumeric = 'tabular-nums'; ctx.fillStyle = color; ctx.fillText(text, x, y); ctx.restore();
}
/** Small label text. */
export function label(ctx, text, x, y, { size = 30, color = PAL.dim, align = 'left', weight = 700, alpha = 1, font = 'Inter', spacing = 0 } = {}) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.font = `${weight} ${size}px '${font}'`; if (spacing) ctx.letterSpacing = spacing + 'px';
  ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillStyle = color; ctx.fillText(text, x, y); ctx.restore();
}
/** Rounded chip with a colour dot. */
export function chip(ctx, text, x, y, color, { p = 1, size = 30, align = 'left' } = {}) {
  if (p <= 0) return;
  ctx.save(); ctx.font = `700 ${size}px 'Inter'`; const w = ctx.measureText(text).width + size * 1.9, h = size * 1.6;
  const X = align === 'center' ? x - w / 2 : x;
  ctx.globalAlpha *= clamp(p * 1.5); ctx.translate(X + w / 2, y); ctx.scale(lerp(0.85, 1, clamp(p)), lerp(0.85, 1, clamp(p)));
  ctx.fillStyle = PAL.panel; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h / 2); ctx.fill();
  ctx.strokeStyle = rgba(color, 0.6); ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(-w / 2 + size * 0.75, 0, size * 0.22, 0, TAU); ctx.fill();
  ctx.fillStyle = PAL.text; ctx.textBaseline = 'middle'; ctx.fillText(text, -w / 2 + size * 1.25, 1); ctx.restore();
}
/** Panel card (glassy dark rectangle with a 1px border). */
export function panel(ctx, x, y, w, h, { p = 1, r = 22 } = {}) {
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(p * 1.4);
  ctx.fillStyle = PAL.panel; ctx.beginPath(); ctx.roundRect(x, y + (1 - ease.outCubic(clamp(p))) * 30, w, h, r); ctx.fill();
  ctx.strokeStyle = 'rgba(160,190,240,.18)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
}

// ------------------------------------------------------------------ pictograms
/** Person pictogram (head + shoulders), centred at x, feet at y + 0.5*h. s = scale (1 = 44px tall).
 *  frac 0..1 draws only the left part (for "half a person"). */
export function person(ctx, x, y, s, color, { alpha = 1, frac = 1, glow = 0 } = {}) {
  if (alpha <= 0 || s <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.scale(s, s);
  if (frac < 1) { ctx.beginPath(); ctx.rect(-20, -30, 40 * frac, 60); ctx.clip(); }
  if (glow > 0) { ctx.fillStyle = rgba(color, 0.22 * glow); ctx.beginPath(); ctx.arc(0, 0, 30, 0, TAU); ctx.fill(); }
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(0, -12, 8.5, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-15, 22); ctx.lineTo(-15, 8); ctx.quadraticCurveTo(-15, 0, -7, 0); ctx.lineTo(7, 0); ctx.quadraticCurveTo(15, 0, 15, 8); ctx.lineTo(15, 22); ctx.closePath(); ctx.fill();
  ctx.restore();
  if (frac < 1) { ctx.save(); ctx.globalAlpha *= alpha * 0.35; ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.arc(0, -12, 8.5, 0, TAU); ctx.moveTo(-15, 22); ctx.lineTo(-15, 8); ctx.quadraticCurveTo(-15, 0, -7, 0); ctx.lineTo(7, 0); ctx.quadraticCurveTo(15, 0, 15, 8); ctx.lineTo(15, 22); ctx.stroke(); ctx.restore(); }
}
/** Grid slot positions: cols x rows, pitch, top-left (x0,y0). */
export function gridPos(i, cols, pitch, x0, y0) { return [x0 + (i % cols) * pitch, y0 + Math.floor(i / cols) * pitch]; }
/** Deterministic permutation of 0..n-1. */
export function perm(n, seed = 1) { return cached('ig-perm:' + n + ':' + seed, () => { const r = mulberry32(seed), a = [...Array(n).keys()]; for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }); }

// ------------------------------------------------------------------ charts
/** Horizontal bar with value label (grows with p). */
export function hbar(ctx, x, y, w, h, p, color, { value = '', name = '', rank = '', hi = false, alpha = 1 } = {}) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha;
  ctx.fillStyle = 'rgba(160,190,240,.08)'; ctx.fillRect(x, y - h / 2, w, h);
  const bw = w * ease.outCubic(clamp(p));
  ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(x, y - h / 2, Math.max(2, bw), h, 6); ctx.fill();
  ctx.textBaseline = 'middle';
  if (rank) { ctx.font = "700 26px 'JetBrains Mono'"; ctx.fillStyle = PAL.dim; ctx.textAlign = 'right'; ctx.fillText(rank, x - 210, y); }
  if (name) { ctx.font = `${hi ? 800 : 600} 32px 'Inter'`; ctx.fillStyle = hi ? PAL.text : '#c5cee0'; ctx.textAlign = 'right'; ctx.fillText(name, x - 18, y); }
  if (value) { ctx.font = "800 32px 'Inter'"; ctx.fillStyle = hi ? color : PAL.text; ctx.textAlign = 'left'; ctx.globalAlpha *= clamp(p * 2 - 0.6); ctx.fillText(value, x + bw + 14, y); }
  ctx.restore();
}
/** 100% stacked bar of segments [{v, color}] filling left to right; each segment grows when its p > 0. */
export function stackBar(ctx, x, y, w, h, segs) {
  ctx.save(); ctx.fillStyle = 'rgba(160,190,240,.08)'; ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); ctx.fill();
  ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); ctx.clip();
  let cx = x; const tot = segs.reduce((s, g) => s + g.v, 0);
  for (const g of segs) { const sw = w * g.v / tot; ctx.fillStyle = g.color; ctx.fillRect(cx, y, sw * ease.outCubic(clamp(g.p ?? 1)), h); cx += sw; }
  ctx.restore();
}
/** Thin axis with ticks (for bar panels). */
export function axis(ctx, x, y, w, ticks, { p = 1 } = {}) {
  ctx.save(); ctx.strokeStyle = PAL.line; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w * p, y); ctx.stroke();
  ctx.font = "400 22px 'JetBrains Mono'"; ctx.fillStyle = PAL.dim; ctx.textAlign = 'center';
  ticks.forEach(([u, s]) => { if (u > p) return; ctx.beginPath(); ctx.moveTo(x + w * u, y); ctx.lineTo(x + w * u, y + 10); ctx.stroke(); ctx.fillText(s, x + w * u, y + 32); });
  ctx.restore();
}
/** Marble jar (for "fill the jar" counts): glass outline and n marbles stacked bottom-up (p = fraction dropped). */
export function jar(ctx, x, y, w, h, n, color, { p = 1, r = 12, t = 0 } = {}) {
  ctx.save(); ctx.strokeStyle = 'rgba(180,210,255,.45)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + h - 20); ctx.quadraticCurveTo(x, y + h, x + 20, y + h); ctx.lineTo(x + w - 20, y + h); ctx.quadraticCurveTo(x + w, y + h, x + w, y + h - 20); ctx.lineTo(x + w, y); ctx.stroke();
  const cols = Math.max(1, Math.floor((w - 8) / (r * 2))), shown = n * clamp(p);
  for (let i = 0; i < Math.ceil(shown); i++) {
    const fall = clamp(shown - i); const cx = x + 4 + r + (i % cols) * r * 2 + (Math.floor(i / cols) % 2) * r * 0.5, cy = y + h - r - 2 - Math.floor(i / cols) * r * 1.8;
    const yy = lerp(y - 120, cy, ease.outBounce(fall));
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(cx, yy, r - 1, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.arc(cx - r * 0.3, yy - r * 0.3, r * 0.3, 0, TAU); ctx.fill();
  }
  ctx.restore();
}
