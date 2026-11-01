// AniMasters style kit: VHS & ARSIP CRT (archival videotape).
// Scenes are drawn in normal 1080x1920 coordinates onto a 360x640 "tape" buffer (VHS resolution), then a
// per-pixel VHS pass runs on that small buffer only: chroma blurred and shifted right (colour bleed), luma
// softened, per-line tracking wobble, rolling tracking-noise bands, head-switching noise at the bottom, tape
// noise, lifted blacks and a warm cast. The result is upscaled 3x, then a crisp on-screen display (PLAY/REW/
// STOP, counter, date) is drawn on top with cached scanlines + vignette. Includes printout/paper primitives,
// dot-matrix text, a hand-drawn red pen (circle + handwriting) and the rewind/pause/stop tape grammar.
import { clamp, lerp, ease, hrand, noise, mulberry32, TAU } from '/engine/lib/core.js';
import { makeCanvas, cached } from '/engine/lib/draw.js';

export const TW = 360, TH = 640, TS = 3; // tape buffer size, scale
export const PAL = { paper: '#ece6d2', paperShade: '#d8d0b4', bar: '#cfe3c8', ink: '#2a2a35', red: '#c4161c', night: '#05070f', osd: '#f4f4f4' };

let T = null;
/** Begin drawing a tape frame: returns a 2D context in 1080x1920 coordinates (drawn at 1/3 size). */
export function tape() {
  if (!T) { const c = makeCanvas(TW, TH); T = { c, g: c.getContext('2d', { willReadFrequently: true }), out: makeCanvas(TW, TH) }; }
  const g = T.g; g.setTransform(1 / TS, 0, 0, 1 / TS, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  g.fillStyle = '#000'; g.fillRect(0, 0, 1080, 1920);
  return g;
}

/**
 * The VHS pass + presentation onto `ctx` (1080x1920).
 * opts: tracking (0..1 wobble/noise), band (extra noise band strength), bleed px, noise, sat, warm, mode ('play'|'rew'|'ff'|'pause'),
 * jump (vertical roll offset 0..1).
 */
export function vhs(ctx, t, { tracking = 0.25, band = 0.5, bleed = 4, noiseAmt = 14, sat = 0.78, warm = 1, mode = 'play', jump = 0, seed = 1 } = {}) {
  const src = T.g.getImageData(0, 0, TW, TH), d = src.data;
  const og = T.out.getContext('2d');
  const out = og.createImageData(TW, TH), o = out.data;
  const f = Math.floor(t * 30);
  const rnd = mulberry32(f * 7919 + seed);
  // rolling noise bands (y in rows)
  const bands = [];
  const nb = mode === 'play' || mode === 'pause' ? 1 : 4;
  for (let k = 0; k < nb; k++) bands.push([((t * (mode === 'play' ? 0.07 : 1.3) + k * 0.31 + hrand(k, seed) * 0.5) % 1.2 - 0.1) * TH, 6 + k * 3]);
  const Yr = new Float32Array(TW), U = new Float32Array(TW), V = new Float32Array(TW);
  const roll = Math.floor(jump * TH);
  for (let y = 0; y < TH; y++) {
    const sy = (y + roll) % TH;
    // per-line horizontal displacement
    let dx = noise.n2(y * 0.03, t * 2) * 1.2 * tracking + Math.sin(y * 0.05 + t * 9) * 0.4 * tracking;
    let bandHit = 0;
    for (const [by, bh] of bands) { const dd = Math.abs(y - by); if (dd < bh) bandHit = Math.max(bandHit, 1 - dd / bh); }
    if (mode !== 'play' && mode !== 'pause') dx += Math.sin(y * 0.11 + t * 30) * 3;
    dx += bandHit * (rnd() - 0.3) * 18 * band;
    const head = y > TH - 14 ? (TH - y) / 14 : 0;
    if (head) dx += (1 - head) * -22 + (rnd() - 0.5) * 6;
    const row = sy * TW * 4;
    for (let x = 0; x < TW; x++) {
      let sx = Math.round(x - dx); if (sx < 0) sx = 0; if (sx >= TW) sx = TW - 1;
      const i = row + sx * 4, r = d[i], gg = d[i + 1], b = d[i + 2];
      const Y = 0.299 * r + 0.587 * gg + 0.114 * b;
      Yr[x] = Y; U[x] = b - Y; V[x] = r - Y;
    }
    // chroma: box blur 7 + shift right by `bleed`
    let su = 0, sv = 0; const K = 7;
    const ou = new Float32Array(TW), ov = new Float32Array(TW);
    for (let x = 0; x < TW + K; x++) {
      if (x < TW) { su += U[x]; sv += V[x]; }
      if (x - K >= 0) { su -= U[x - K]; sv -= V[x - K]; }
      const tx = x - Math.floor(K / 2) + bleed;
      if (tx >= 0 && tx < TW) { ou[tx] = su / K; ov[tx] = sv / K; }
    }
    const orow = y * TW * 4;
    for (let x = 0; x < TW; x++) {
      // slight luma softening (1-2-1)
      const Y = (Yr[Math.max(0, x - 1)] + 2 * Yr[x] + Yr[Math.min(TW - 1, x + 1)]) / 4;
      let n = (rnd() - 0.5) * noiseAmt + bandHit * (rnd() - 0.2) * 160 * band;
      if (head) n += (rnd() - 0.5) * 90 * (1 - head);
      let yy = Y + n;
      yy = 16 + yy * 0.9; // lifted blacks
      const u = ou[x] * sat, v = ov[x] * sat;
      let R = yy + v, B = yy + u, G = (yy - 0.299 * R - 0.114 * B) / 0.587;
      R += 10 * warm; B -= 8 * warm;
      const oi = orow + x * 4;
      o[oi] = R; o[oi + 1] = G; o[oi + 2] = B; o[oi + 3] = 255;
    }
  }
  og.putImageData(out, 0, 0);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'low';
  ctx.drawImage(T.out, 0, 0, TW, TH, 0, 0, 1080, 1920);
  ctx.restore();
}

/** Cached scanlines + rounded CRT vignette, drawn after the OSD. */
export function crt(ctx) {
  const c = cached('vhs-crt', () => {
    const o = makeCanvas(1080, 1920), g = o.getContext('2d');
    for (let y = 0; y < 1920; y += 3) { g.fillStyle = 'rgba(0,0,0,0.16)'; g.fillRect(0, y, 1080, 1); }
    const v = g.createRadialGradient(540, 960, 600, 540, 960, 1250);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.75)');
    g.fillStyle = v; g.fillRect(0, 0, 1080, 1920);
    return o;
  });
  ctx.drawImage(c, 0, 0);
}

// ---------------- on-screen display ----------------
const osdFont = (s) => `${s}px 'VT323'`;
export function osdText(ctx, str, x, y, { size = 64, color = PAL.osd, align = 'left', alpha = 1 } = {}) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.font = osdFont(size); ctx.textAlign = align; ctx.textBaseline = 'top';
  ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillText(str, x + 4, y + 4);
  ctx.fillStyle = color; ctx.fillText(str, x, y); ctx.restore();
}
/** Tape OSD: mode label, counter, optional date, REC dot. */
export function osd(ctx, t, { mode = 'play', counter = t, date = null, rec = false, label = null } = {}) {
  const icons = { play: 'PLAY  ▶', rew: '◀◀ REW', ff: 'FF ▶▶', pause: 'PAUSE ❙❙', stop: 'STOP  ■' };
  const blink = Math.floor(t * 2) % 2 === 0;
  if (mode !== 'pause' || blink) osdText(ctx, icons[mode] || mode, 70, 80);
  const s = Math.max(0, counter), hh = Math.floor(s / 3600), mm = Math.floor(s / 60) % 60, ss = Math.floor(s) % 60, ff = Math.floor((s % 1) * 30);
  osdText(ctx, `${hh}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}:${String(ff).padStart(2, '0')}`, 1010, 80, { align: 'right' });
  if (rec) { if (blink) { ctx.fillStyle = '#ff2a2a'; ctx.beginPath(); ctx.arc(80, 186, 16, 0, TAU); ctx.fill(); } osdText(ctx, 'REC', 106, 158); }
  if (date) osdText(ctx, date, 70, 1240, { size: 58 });
  if (label) osdText(ctx, label, 1010, 158, { size: 50, align: 'right' });
}
/** Lower-third caption bar (archival documentary style), drawn crisp. */
export function lowerThird(ctx, title, sub, x, y, { alpha = 1 } = {}) {
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.font = "700 46px 'Inter'"; const w1 = ctx.measureText(title).width; ctx.font = "400 32px 'Inter'"; const w2 = ctx.measureText(sub).width;
  const w = Math.max(w1, w2) + 60;
  ctx.fillStyle = '#ffd400'; ctx.fillRect(x, y, 12, 110);
  ctx.fillStyle = 'rgba(0,0,0,0.72)'; ctx.fillRect(x + 12, y, w, 110);
  ctx.fillStyle = '#ffffff'; ctx.font = "700 46px 'Inter'"; ctx.textBaseline = 'top'; ctx.fillText(title, x + 36, y + 12);
  ctx.fillStyle = '#ffd400'; ctx.font = "400 32px 'Inter'"; ctx.fillText(sub, x + 36, y + 66);
  ctx.restore();
}

// ---------------- drawing primitives (on the tape) ----------------
/** Night sky with stars (stable) and optional milky band. */
export function nightSky(g, t, { y1 = 1200, seed = 2 } = {}) {
  const gr = g.createLinearGradient(0, 0, 0, y1);
  gr.addColorStop(0, '#02030a'); gr.addColorStop(0.7, '#0b1430'); gr.addColorStop(1, '#1d2a4d');
  g.fillStyle = gr; g.fillRect(0, 0, 1080, y1);
  for (let i = 0; i < 260; i++) {
    const x = hrand(i, seed) * 1080, y = hrand(i, seed + 1) * y1 * 0.95, s = hrand(i, seed + 2);
    g.globalAlpha = 0.35 + 0.65 * s * (0.7 + 0.3 * Math.sin(t * 3 + i));
    g.fillStyle = s > 0.9 ? '#fff6d8' : '#cfe0ff'; const r = s > 0.95 ? 6 : s > 0.7 ? 4 : 3;
    g.fillRect(x, y, r, r);
  }
  g.globalAlpha = 1;
}
/** The Big Ear radio telescope (flat tilting reflector, ground plane, parabolic reflector), side view. */
export function bigEar(g, x, y, s, { lit = 0.3 } = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const metal = (a) => `rgba(${150 + lit * 60},${160 + lit * 60},${175 + lit * 50},${a})`;
  // ground plane (perspective grid)
  g.fillStyle = '#1a2130'; g.beginPath(); g.moveTo(-520, 0); g.lineTo(520, 0); g.lineTo(700, 160); g.lineTo(-700, 160); g.closePath(); g.fill();
  g.strokeStyle = metal(0.35); g.lineWidth = 3; g.beginPath();
  for (let k = -10; k <= 10; k++) { g.moveTo(k * 52, 0); g.lineTo(k * 70, 160); }
  for (let k = 1; k < 6; k++) { const yy = k * k * 5; g.moveTo(-520 - yy * 1.1, yy); g.lineTo(520 + yy * 1.1, yy); }
  g.stroke();
  // flat tilting reflector (left): big lattice on stilts
  g.save(); g.translate(-470, 0); g.rotate(-0.42);
  g.fillStyle = metal(0.18); g.fillRect(-30, -330, 70, 330);
  g.strokeStyle = metal(0.8); g.lineWidth = 6; g.strokeRect(-30, -330, 70, 330);
  g.lineWidth = 3; g.beginPath(); for (let k = 1; k < 10; k++) { g.moveTo(-30, -k * 33); g.lineTo(40, -k * 33); } g.moveTo(5, -330); g.lineTo(5, 0); g.stroke();
  g.restore();
  g.strokeStyle = metal(0.6); g.lineWidth = 5; g.beginPath(); g.moveTo(-430, 0); g.lineTo(-360, -150); g.moveTo(-380, 0); g.lineTo(-360, -150); g.stroke();
  // parabolic reflector (right): curved wall
  g.fillStyle = metal(0.22); g.beginPath(); g.moveTo(380, 0); g.quadraticCurveTo(470, -150, 430, -320); g.lineTo(500, -330); g.quadraticCurveTo(540, -150, 470, 0); g.closePath(); g.fill();
  g.strokeStyle = metal(0.85); g.lineWidth = 6; g.stroke();
  g.lineWidth = 3; g.beginPath(); for (let k = 1; k < 9; k++) { const u = k / 9; g.moveTo(380 + 50 * u + Math.sin(u * 3) * 40, -u * 320); g.lineTo(470 + 30 * u + Math.sin(u * 3) * 40, -u * 330); } g.stroke();
  // feed horns hut
  g.fillStyle = '#2b3448'; g.fillRect(-30, -60, 60, 60); g.fillStyle = '#ffd47a'; g.globalAlpha = 0.5 + lit * 0.5; g.fillRect(-16, -44, 14, 12); g.globalAlpha = 1;
  g.restore();
}
/** Radio waves arriving from the sky toward (x,y). */
export function waves(g, t, x, y, { from = [700, 150], color = 'rgba(140,220,255,', n = 5, strength = 1 } = {}) {
  const ang = Math.atan2(y - from[1], x - from[0]);
  for (let k = 0; k < n; k++) {
    const u = ((t * 0.6 + k / n) % 1);
    const px = lerp(from[0], x, u), py = lerp(from[1], y, u);
    g.strokeStyle = color + (strength * (1 - Math.abs(u - 0.5) * 1.6)).toFixed(3) + ')'; g.lineWidth = 7;
    g.beginPath(); g.arc(px, py, 60 + u * 40, ang - Math.PI / 2 - 0.7, ang - Math.PI / 2 + 0.7, false); g.stroke();
  }
}
/** Fan-fold computer printout (green-bar paper with tractor holes), cached base. */
export function paper(g, x, y, w, h, { rot = 0, bar = 90, scroll = 0 } = {}) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.fillStyle = PAL.paper; g.fillRect(-w / 2, -h / 2, w, h);
  g.save(); g.beginPath(); g.rect(-w / 2, -h / 2, w, h); g.clip();
  g.fillStyle = PAL.bar;
  const off = ((scroll % (bar * 2)) + bar * 2) % (bar * 2);
  for (let yy = -h / 2 - bar * 2 + off; yy < h / 2; yy += bar * 2) g.fillRect(-w / 2 + 70, yy, w - 140, bar);
  g.fillStyle = '#b9b39d';
  for (let yy = -h / 2 + (off % 50) - 50; yy < h / 2; yy += 50) { g.beginPath(); g.arc(-w / 2 + 34, yy, 11, 0, TAU); g.arc(w / 2 - 34, yy, 11, 0, TAU); g.fill(); }
  g.strokeStyle = 'rgba(120,110,90,0.4)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-w / 2 + 68, -h / 2); g.lineTo(-w / 2 + 68, h / 2); g.moveTo(w / 2 - 68, -h / 2); g.lineTo(w / 2 - 68, h / 2); g.stroke();
  g.restore(); g.restore();
}
const DOT = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111', F: '111100110100100',
  G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111',
  M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100', Q: '010101101110011', R: '110101110101101',
  S: '011100010001110', T: '111010010010010', U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101',
  Y: '101101010010010', Z: '111001010100111', 0: '111101101101111', 1: '010110010010111', 2: '110001010100111', 3: '110001010001110',
  4: '101101111001001', 5: '111100110001110', 6: '011100111101111', 7: '111001010010010', 8: '111101111101111', 9: '111101111001110',
  '.': '000000000000010', ':': '000010000010000', '-': '000000111000000', '!': '010010010000010',
};
/** Dot-matrix printer text: each glyph pixel is an ink dot. size = dot pitch. */
export function dotText(g, str, x, y, { size = 10, color = PAL.ink, alpha = 1 } = {}) {
  g.save(); g.globalAlpha = alpha; g.fillStyle = color;
  str = String(str).toUpperCase();
  g.beginPath();
  for (let i = 0; i < str.length; i++) {
    const gl = DOT[str[i]]; if (!gl) continue;
    for (let k = 0; k < 15; k++) if (gl[k] === '1') { const cx = x + (i * 4 + (k % 3)) * size + size / 2, cy = y + Math.floor(k / 3) * size + size / 2; g.moveTo(cx + size * 0.42, cy); g.arc(cx, cy, size * 0.42, 0, TAU); }
  }
  g.fill(); g.restore();
}
/** Red pen ellipse drawn progressively (0..1), slightly wobbly, two passes. */
export function penCircle(g, cx, cy, rx, ry, p, { color = PAL.red, w = 9, seed = 3 } = {}) {
  if (p <= 0) return;
  g.save(); g.strokeStyle = color; g.lineCap = 'round'; g.lineJoin = 'round';
  for (let pass = 0; pass < 2; pass++) {
    g.lineWidth = w * (pass ? 0.6 : 1); g.globalAlpha = pass ? 0.6 : 0.95;
    g.beginPath();
    const a0 = -2.2 + pass * 0.3, n = 60, end = (Math.PI * 2 + 0.5) * clamp(p);
    for (let i = 0; i <= n; i++) {
      const a = a0 + (i / n) * end, j = 1 + noise.n2(i * 0.15, seed + pass) * 0.05 + pass * 0.03;
      const x = cx + Math.cos(a) * rx * j, y = cy + Math.sin(a) * ry * j;
      i ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.stroke();
  }
  g.restore();
}
/** Handwritten word revealed left-to-right (0..1). */
export function handwrite(g, str, x, y, p, { size = 150, color = PAL.red, font = 'Permanent Marker', rot = -0.08, weight = 400 } = {}) {
  if (p <= 0) return;
  g.save(); g.translate(x, y); g.rotate(rot);
  g.font = `${weight} ${size}px '${font}'`; g.textBaseline = 'middle'; g.textAlign = 'left';
  const w = g.measureText(str).width;
  g.beginPath(); g.rect(-10, -size, (w + 20) * clamp(p), size * 2); g.clip();
  g.fillStyle = color; g.fillText(str, 0, 0);
  g.restore();
}
/** Bar chart of the 6EQUJ5 intensity sweep (values in sigma above noise). */
export const WOW = [['6', 6], ['E', 14], ['Q', 26], ['U', 30], ['J', 19], ['5', 5]];
