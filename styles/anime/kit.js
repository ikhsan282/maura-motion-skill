// AniMasters style kit: ANIME (film anime look: clean lineart, 2-tone cel shading, painted golden-hour skies).
// Signature: towering cumulus lit from below by a low sun, lens flare and light glints, rim-lit characters whose
// hair and clothes move in the wind, huge glossy eyes in close-up, parallax backgrounds (station, train, village).
// Everything is vector-drawn per frame with Path2D; static art (sky, clouds, glow sprites) is cached.
import { clamp, lerp, ease, hrand, noise, mulberry32, TAU, mixHex, hexToRgb } from '/engine/lib/core.js';
import { makeCanvas, cached } from '/engine/lib/draw.js';

export const PAL = {
  line: '#2a1a2e', lineSoft: '#5a3a52',
  skin: '#ffe4d2', skinS: '#f0a898', skinS2: '#d98a86', blush: '#ff7f86', lip: '#d76a72', mouth: '#6e2234', tongue: '#e46f7a',
  white: '#fffaf4', eyeWS: '#e3d2e2',
  rim: '#fff0c8', rimWarm: '#ffc887', rimCool: '#bfe2ff',
  ink: '#1c1428', gold: '#ffd28a', cream: '#fff6e6',
};

export const SKIES = {
  golden: { stops: [[0, '#26397c'], [0.3, '#5e5bb0'], [0.55, '#c47fb1'], [0.72, '#f59d93'], [0.86, '#ffc27e'], [1, '#ffe7b2']],
    cloud: { shadow: '#6a5aa6', base: '#9b84c6', lit: '#ffb99a', hot: '#fff0cf', rim: '#fff6dc' } },
  day: { stops: [[0, '#1d5fcf'], [0.45, '#4f9bef'], [0.85, '#a9d6ff'], [1, '#e6f4ff']],
    cloud: { shadow: '#94a9d6', base: '#d4e0f5', lit: '#ffffff', hot: '#ffffff', rim: '#ffffff' } },
  dusk: { stops: [[0, '#16194a'], [0.35, '#3b2c74'], [0.6, '#9c4a86'], [0.8, '#ee7a6a'], [0.93, '#ffad6a'], [1, '#ffd38a']],
    cloud: { shadow: '#3a2c66', base: '#6b4790', lit: '#f08e7c', hot: '#ffcf9a', rim: '#ffe0b0' } },
  night: { stops: [[0, '#060a22'], [0.45, '#12235a'], [0.8, '#2c3a7c'], [1, '#55487e']],
    cloud: { shadow: '#1b2350', base: '#2c3772', lit: '#5d6aa8', hot: '#9aa6dc', rim: '#c8d2ff' } },
};

// ======================================================================= utils
const rgbA = (hex, a) => { const [r, g, b] = hexToRgb(hex); return `rgba(${r},${g},${b},${a})`; };
export function viewRect(ctx, pad = 40) {
  const m = ctx.getTransform().inverse();
  const W = ctx.canvas.width, H = ctx.canvas.height;
  const pts = [[0, 0], [W, 0], [0, H], [W, H]].map(([x, y]) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]);
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return [Math.min(...xs) - pad, Math.min(...ys) - pad, Math.max(...xs) - Math.min(...xs) + pad * 2, Math.max(...ys) - Math.min(...ys) + pad * 2];
}
/** Tapered lock/leaf from root (x0,y0) width w to a pointed tip, bending sideways by `bend` (and `bend2` for an S). */
export function lockPath(x0, y0, x1, y1, w, bend = 0, bend2 = bend, p = new Path2D()) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L, ny = dx / L;
  const a = [x0 + dx / 3 + nx * bend, y0 + dy / 3 + ny * bend], b = [x0 + dx * 2 / 3 + nx * bend2, y0 + dy * 2 / 3 + ny * bend2];
  // traversed so the winding matches arcs/ellipses (positive), so unions of subpaths fill without holes
  p.moveTo(x0 - nx * w / 2, y0 - ny * w / 2);
  p.bezierCurveTo(a[0] - nx * w * 0.5, a[1] - ny * w * 0.5, b[0] - nx * w * 0.28, b[1] - ny * w * 0.28, x1, y1);
  p.bezierCurveTo(b[0] + nx * w * 0.28, b[1] + ny * w * 0.28, a[0] + nx * w * 0.5, a[1] + ny * w * 0.5, x0 + nx * w / 2, y0 + ny * w / 2);
  p.closePath();
  return p;
}
function capsule(x0, y0, x1, y1, w0, w1, p = new Path2D()) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, a = Math.atan2(dy, dx);
  const nx = -dy / L, ny = dx / L;
  p.moveTo(x0 + nx * w0 / 2, y0 + ny * w0 / 2);
  p.lineTo(x1 + nx * w1 / 2, y1 + ny * w1 / 2);
  p.arc(x1, y1, w1 / 2, a + Math.PI / 2, a - Math.PI / 2, true);
  p.lineTo(x0 - nx * w0 / 2, y0 - ny * w0 / 2);
  p.arc(x0, y0, w0 / 2, a - Math.PI / 2, a + Math.PI / 2, true);
  p.closePath();
  return p;
}
/**
 * Cel fill with an ink outline drawn under the fill (only the silhouette gets a line, even for paths made of many
 * overlapping subpaths) and an inner rim light on the side the light comes from.
 * rim: { dir: -1 left | 1 right | 0 behind, col, a (alpha), k (px), cx, cy (centre, for dir 0) }
 */
function cel(g, path, base, shade, shadeFn, lw, rim = null, line = PAL.line) {
  if (lw > 0) { g.lineWidth = lw * 2; g.strokeStyle = line; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(path); }
  g.save(); g.clip(path);
  g.fillStyle = base; g.fill(path);
  if (rim && rim.a > 0.01) {
    g.globalAlpha = rim.a; g.fillStyle = rim.col; g.fill(path); g.globalAlpha = 1;
    g.save();
    if (rim.dir === 0) { const s = 1 - (rim.k * 2) / (rim.w || 400); g.translate(rim.cx || 0, (rim.cy || 0) + rim.k); g.scale(s, s); g.translate(-(rim.cx || 0), -(rim.cy || 0)); }
    else g.translate(-rim.dir * rim.k, rim.k * 0.35);
    g.fillStyle = base; g.fill(path); g.restore();
  }
  if (shade && shadeFn) { g.fillStyle = shade; shadeFn(g); }
  g.restore();
}
const RIM = (o, k = 7, w = 400, cx = 0, cy = 0) => (o.rim > 0 ? { dir: o.light ?? -1, col: o.rimCol || PAL.rim, a: o.rim, k, w, cx, cy } : null);

// ======================================================================= sky & light
/** Painted sky: gradient + soft stratus wisps, baked small and stretched (cheap). preset: golden|day|dusk|night */
export function skyCanvas(preset) {
  return cached('an-sky:' + preset, () => {
    const W = 270, H = 480, c = makeCanvas(W, H), g = c.getContext('2d');
    const S = SKIES[preset];
    const gr = g.createLinearGradient(0, 0, 0, H);
    for (const [o, col] of S.stops) gr.addColorStop(o, col);
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    const r = mulberry32(preset.length * 31 + 7);
    // horizontal painted wisps (lighter near the horizon)
    for (let i = 0; i < 26; i++) {
      const y = H * (0.25 + r() * 0.65), x = r() * W, w = 40 + r() * 140, h = 2 + r() * 5;
      const lit = y / H;
      g.fillStyle = lit > 0.6 ? `rgba(255,${200 + r() * 40 | 0},${150 + r() * 60 | 0},${0.12 + r() * 0.15})` : `rgba(255,220,255,${0.05 + r() * 0.08})`;
      g.beginPath(); g.ellipse(x, y, w, h, 0, 0, TAU); g.fill();
    }
    if (preset === 'night' || preset === 'dusk') {
      for (let i = 0; i < (preset === 'night' ? 160 : 50); i++) {
        const y = r() * H * (preset === 'night' ? 0.75 : 0.4);
        g.fillStyle = `rgba(255,255,240,${0.3 + r() * 0.7})`; g.fillRect(r() * W, y, r() < 0.15 ? 1.2 : 0.6, r() < 0.15 ? 1.2 : 0.6);
      }
    }
    return c;
  });
}
/** Fill the visible area with a sky (optionally cross-fading into a second preset). y0/y1: world span of the gradient. */
export function sky(ctx, preset = 'golden', { mix = null, k = 0, y0 = 0, y1 = 1920, x0 = -200, x1 = 1280 } = {}) {
  const [vx, vy, vw, vh] = viewRect(ctx);
  const X0 = Math.min(x0, vx), X1 = Math.max(x1, vx + vw);
  const Y0 = Math.min(y0, vy), Y1 = Math.max(y1, vy + vh);
  ctx.save(); ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(skyCanvas(preset), X0, Y0, X1 - X0, Y1 - Y0);
  if (mix && k > 0) { ctx.globalAlpha = clamp(k); ctx.drawImage(skyCanvas(mix), X0, Y0, X1 - X0, Y1 - Y0); }
  ctx.restore();
}
/** Twinkling stars (for dusk/night), cheap: one path. */
export function stars(ctx, t, { n = 120, y1 = 900, alpha = 1, seed = 3 } = {}) {
  const r = mulberry32(seed);
  ctx.save(); ctx.fillStyle = '#fffbe8';
  for (let i = 0; i < n; i++) {
    const x = r() * 1080, y = r() * y1, s = 1 + r() * 2.6, tw = 0.5 + 0.5 * Math.sin(t * (1 + r() * 3) + i);
    ctx.globalAlpha = alpha * (0.25 + 0.75 * tw) * (1 - y / y1 * 0.6);
    ctx.fillRect(x - s / 2, y - s / 2, s, s);
    if (s > 3.2) { ctx.globalAlpha *= 0.5; ctx.fillRect(x - s * 2, y - 0.5, s * 4, 1); ctx.fillRect(x - 0.5, y - s * 2, 1, s * 4); }
  }
  ctx.restore();
}

/** Towering cumulus sprite: overlapping puffs, each cel-lit (shadow crescent / base / lit cap / hot spot), a rim on the
 *  sun side and a soft painted wash. sunDir = direction the light comes FROM (y>0 = from below, golden hour). Cached. */
export function cloudSprite(seed = 1, preset = 'golden', { w = 900, h = 1000, tower = 1, sunDir = [-0.5, 0.85] } = {}) {
  return cached(`an-cloud:${seed}:${preset}:${w}:${h}:${tower}:${sunDir}`, () => {
    const S = SKIES[preset].cloud, sc = 0.6;
    const c = makeCanvas(Math.ceil(w * sc), Math.ceil(h * sc)), g = c.getContext('2d');
    g.scale(sc, sc);
    const r = mulberry32(seed * 97 + 13);
    const base = h * 0.92, k = w / 900;
    const puffs = [];
    const N = 120;
    for (let i = 0; i < N; i++) {
      const u = Math.pow(r(), 1.5) * tower;               // more puffs low down
      const half = w * (0.44 * Math.pow(Math.max(0, 1 - u / Math.max(tower, 0.01)), 0.55) + 0.05);
      const lean = Math.sin(seed + u * 2) * w * 0.05 * u;
      const x = w / 2 + lean + (r() - 0.5) * 2 * half * 0.92;
      const y = base - u * h * 0.78 / Math.max(tower, 0.6) * Math.min(tower, 1.2) - 40 * k;
      const rad = (52 + r() * 70) * k * (1.1 - u * 0.4);
      puffs.push([x, y, rad]);
    }
    for (let i = 0; i < 9; i++) puffs.push([w * (0.08 + i * 0.105) + (r() - 0.5) * 20, base - 20 * k, (44 + r() * 20) * k]);
    const [sx, sy] = sunDir;
    puffs.sort((A, B) => (A[0] * sx + A[1] * sy) - (B[0] * sx + B[1] * sy));
    // rim halo on the sun side
    g.fillStyle = S.rim; g.beginPath();
    for (const [x, y, rr] of puffs) { g.moveTo(x + sx * 6 + rr, y + sy * 6); g.arc(x + sx * 6, y + sy * 6, rr, 0, TAU); } g.fill();
    // each puff: painted radial light (hot -> lit -> base -> shadow edge), nearer-to-sun puffs on top
    for (const [x, y, rr] of puffs) {
      const gr = g.createRadialGradient(x + sx * rr * 0.4, y + sy * rr * 0.4, 0, x + sx * rr * 0.2, y + sy * rr * 0.2, rr * 1.15);
      gr.addColorStop(0, S.hot); gr.addColorStop(0.3, S.lit); gr.addColorStop(0.62, S.base); gr.addColorStop(0.9, S.shadow); gr.addColorStop(1, S.shadow);
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, rr, 0, TAU); g.fill();
    }
    // painted wash: darker away from the sun, lighter toward it (inside the cloud only)
    g.globalCompositeOperation = 'source-atop';
    const gr = g.createLinearGradient(w * (0.5 + sx * 0.5), h * (0.5 + sy * 0.5), w * (0.5 - sx * 0.5), h * (0.5 - sy * 0.6));
    gr.addColorStop(0, rgbA(S.hot, 0.18)); gr.addColorStop(0.45, 'rgba(255,255,255,0)'); gr.addColorStop(1, rgbA(S.shadow, 0.55));
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 700; i++) { g.fillStyle = r() < 0.5 ? 'rgba(255,255,255,0.07)' : rgbA(S.shadow, 0.07); g.fillRect(r() * w, r() * h, 3 + r() * 8, 1 + r() * 2); }
    g.globalCompositeOperation = 'source-over';
    return { canvas: c, w, h };
  });
}
/** Draw a cumulus (cx = centre x, by = bottom y). */
export function cloud(ctx, cx, by, s = 1, opt = {}) {
  const C = cloudSprite(opt.seed || 1, opt.preset || 'golden', opt);
  ctx.save(); ctx.globalAlpha = opt.alpha ?? 1;
  ctx.drawImage(C.canvas, cx - C.w * s / 2, by - C.h * 0.9 * s, C.w * s, C.h * s);
  ctx.restore();
}
/** Pre-rendered radial glow sprite (stamp it instead of blurring). */
export function glowSprite(col = '#ffe6b0', key = 'g') {
  return cached('an-glow:' + col + key, () => {
    const c = makeCanvas(256, 256), g = c.getContext('2d');
    const [r, gg, b] = hexToRgb(col);
    const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, `rgba(${r},${gg},${b},1)`); gr.addColorStop(0.18, `rgba(${r},${gg},${b},0.55)`);
    gr.addColorStop(0.5, `rgba(${r},${gg},${b},0.14)`); gr.addColorStop(1, `rgba(${r},${gg},${b},0)`);
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    return c;
  });
}
export function glow(ctx, x, y, r, col = '#ffe6b0', alpha = 1, add = true) {
  if (alpha <= 0) return;
  ctx.save(); if (add) ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = alpha;
  ctx.drawImage(glowSprite(col), x - r, y - r, r * 2, r * 2); ctx.restore();
}
/** The sun with a soft halo, an anamorphic streak and flare ghosts along the line through the frame centre. */
export function sun(ctx, x, y, { r = 70, t = 0, flare = 1, col = '#fff1c8', halo = '#ffb36b' } = {}) {
  glow(ctx, x, y, r * 9, halo, 0.55);
  glow(ctx, x, y, r * 3.2, '#ffe9c0', 0.9);
  ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.restore();
  if (flare > 0) lensFlare(ctx, x, y, t, flare);
}
export function lensFlare(ctx, x, y, t, k = 1) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const m = ctx.canvas.width / 1080; // works on full-res layers
  ctx.scale(m, m);
  const cx = 540, cy = 960, dx = cx - x, dy = cy - y;
  // streak
  ctx.globalCompositeOperation = 'lighter';
  const st = ctx.createLinearGradient(x - 900, 0, x + 900, 0);
  st.addColorStop(0, 'rgba(255,190,120,0)'); st.addColorStop(0.5, `rgba(255,236,200,${0.55 * k})`); st.addColorStop(1, 'rgba(255,190,120,0)');
  ctx.fillStyle = st; ctx.fillRect(x - 900, y - 3, 1800, 6);
  ctx.globalAlpha = 0.5 * k; ctx.fillRect(x - 600, y - 10, 1200, 20);
  // ghosts
  const G = [[0.35, 26, '#ffd27a', 0.22, 0], [0.6, 60, '#9ad0ff', 0.12, 6], [0.85, 16, '#ffffff', 0.25, 0], [1.25, 110, '#ff9ad2', 0.09, 6], [1.55, 40, '#b8ffcf', 0.14, 6], [1.8, 170, '#ffc48a', 0.06, 0]];
  for (const [u, rad, col, a, sides] of G) {
    const gx = x + dx * u, gy = y + dy * u, rr = rad * (1 + 0.05 * Math.sin(t * 2 + u * 5));
    ctx.globalAlpha = a * k; ctx.fillStyle = col; ctx.beginPath();
    if (sides) for (let i = 0; i <= sides; i++) { const an = i / sides * TAU + 0.3; i ? ctx.lineTo(gx + Math.cos(an) * rr, gy + Math.sin(an) * rr) : ctx.moveTo(gx + Math.cos(an) * rr, gy + Math.sin(an) * rr); }
    else ctx.arc(gx, gy, rr, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}
/** Four-point light glint (eyes, rails, ticket, tears). */
export function glint(ctx, x, y, size = 30, alpha = 1, rot = 0) {
  if (alpha <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = alpha;
  ctx.drawImage(glowSprite('#fff4d8'), -size * 0.9, -size * 0.9, size * 1.8, size * 1.8);
  ctx.fillStyle = '#ffffff'; ctx.beginPath();
  ctx.moveTo(0, -size); ctx.quadraticCurveTo(0, 0, size * 0.75, 0); ctx.quadraticCurveTo(0, 0, 0, size);
  ctx.quadraticCurveTo(0, 0, -size * 0.75, 0); ctx.quadraticCurveTo(0, 0, 0, -size); ctx.fill();
  ctx.restore();
}
/** Floating dust motes / pollen in the light. */
export function motes(ctx, t, { n = 40, x0 = 0, y0 = 0, w = 1080, h = 1920, col = '#fff2cc', alpha = 0.8, seed = 5, drift = [12, -18], size = 5 } = {}) {
  const r = mulberry32(seed);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = col;
  for (let i = 0; i < n; i++) {
    const px = r(), py = r(), sp = 0.5 + r(), s = (0.4 + r()) * size;
    const x = x0 + ((px * w + drift[0] * t * sp + Math.sin(t * 0.8 + i) * 14) % w + w) % w;
    const y = y0 + ((py * h + drift[1] * t * sp) % h + h) % h;
    ctx.globalAlpha = alpha * (0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * 2.2 + i * 1.3)));
    ctx.beginPath(); ctx.arc(x, y, s, 0, TAU); ctx.fill();
  }
  ctx.restore();
}
/** God rays from a point (thin translucent wedges, additive). */
export function rays(ctx, x, y, t, { n = 9, len = 1800, alpha = 0.12, col = '255,226,170', spread = 1.2, dir = Math.PI / 2 } = {}) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const a = dir + (i / (n - 1) - 0.5) * spread + Math.sin(t * 0.3 + i) * 0.02;
    const w = 0.025 + 0.03 * hrand(i, 7);
    const gr = ctx.createLinearGradient(x, y, x + Math.cos(a) * len, y + Math.sin(a) * len);
    gr.addColorStop(0, `rgba(${col},${alpha * (0.6 + 0.4 * Math.sin(t * 0.9 + i * 2))})`); gr.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a - w) * len, y + Math.sin(a - w) * len); ctx.lineTo(x + Math.cos(a + w) * len, y + Math.sin(a + w) * len); ctx.fill();
  }
  ctx.restore();
}
/** Thin white anime speed streaks (horizontal by default). */
export function streaks(ctx, t, { n = 26, dir = -1, speed = 2600, y0 = 0, y1 = 1920, alpha = 0.7, seed = 2, len = 380, col = '255,255,255' } = {}) {
  ctx.save();
  for (let i = 0; i < n; i++) {
    const y = lerp(y0, y1, hrand(i, seed)), L = len * (0.5 + hrand(i, seed + 1));
    const x = ((hrand(i, seed + 2) * 2400 + dir * speed * t * (0.6 + hrand(i, 9) * 0.8)) % 2400 + 2400) % 2400 - 600;
    const gr = ctx.createLinearGradient(x, 0, x - dir * L, 0);
    gr.addColorStop(0, `rgba(${col},${alpha})`); gr.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = gr; ctx.fillRect(Math.min(x, x - dir * L), y, L, 2 + hrand(i, 4) * 4);
  }
  ctx.restore();
}

// ======================================================================= characters
// Head: local units, origin at face centre, face ~224 wide, eyes at y≈38, chin at y=172, skull top y≈-190.
export const CHARS = {
  laras: { hair: 'long', hairC: '#3c2335', hairS: '#24131f', hairH: '#9a6280', eye: '#8a4a2c', eyeD: '#3a1626', eyeL: '#f2b36e',
    jacket: '#3d5f9e', jacketS: '#2a4374', shirt: '#fff8ef', shirtS: '#d4cade', skirt: '#d8743f', skirtS: '#a9532f', bag: '#c8443c', bagS: '#8f2c2a', shoe: '#ffffff', shoeS: '#c9c0d8' },
  kecil: { hair: 'pig', hairC: '#3c2335', hairS: '#24131f', hairH: '#9a6280', eye: '#8a4a2c', eyeD: '#3a1626', eyeL: '#f2b36e', child: true,
    jacket: '#f6d36b', jacketS: '#d9a843', shirt: '#fff8ef', shirtS: '#d4cade', skirt: '#e46b6b', skirtS: '#b44a52', shoe: '#ffffff', shoeS: '#c9c0d8' },
  ibu: { hair: 'hijab', hijab: '#f1e3c8', hijabS: '#cdb08c', hijabL: '#fff9ea', ciput: '#7a4e48', hairC: '#2a1a22', hairS: '#1a0e14', hairH: '#5a3a4a', eye: '#6a3a26', eyeD: '#2a1018', eyeL: '#d49a62', older: true,
    jacket: '#4f8a6e', jacketS: '#356450', shirt: '#4f8a6e', shirtS: '#356450', skirt: '#4f8a6e', skirtS: '#356450', shoe: '#7a5440', shoeS: '#553a2c' },
};
const EXPR = {
  neutral: {}, smile: { smile: 0.8, brow: 0.4 }, worry: { brow: -1, mouth: 0.12 }, surprise: { brow: 1.4, mouth: 0.7, wide: 1 },
  cry: { brow: -1.3, tear: 1, mouth: 0.2, sad: 1 }, determined: { brow: 0.9, mouth: 0, look: [0, -0.2] }, pant: { mouth: 0.55, brow: -0.5 },
  happyCry: { happyEyes: 1, smile: 1, tear: 1, brow: -0.8, blush: 1, mouth: 0.35 }, soft: { smile: 0.45, blush: 0.6, brow: -0.3 },
};
export const expr = (name, extra = {}) => ({ ...(EXPR[name] || {}), ...extra });

function hairBackParts(C, o) {
  const { t = 0, wind = 0.4 } = o;
  const parts = [];
  if (C.hair === 'long') {
    const top = new Path2D(); top.ellipse(0, -36, 156, 160, 0, 0, TAU); parts.push(top);
    const n = 9;
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1) - 0.5;
      const rx = u * 250, ry = -20 + Math.abs(u) * 50;
      const aw = Math.abs(wind);
      const len = 420 + hrand(i, 3) * 80 - aw * 70;
      const sway = Math.sin(t * 3.2 + i * 1.7) * (10 + 26 * aw) + noise.n2(t * 1.3, i) * 18 * aw;
      const tx = rx * 1.3 + wind * (170 + 90 * hrand(i, 5)) + sway, ty = ry + len - aw * hrand(i, 6) * 90;
      parts.push(lockPath(rx, ry, tx, ty, 118, wind * 30 + sway * 0.3, wind * 60 + sway));
    }
  } else if (C.hair === 'pig') {
    const top = new Path2D(); top.ellipse(0, -36, 150, 156, 0, 0, TAU); parts.push(top);
    for (const sd of [-1, 1]) {
      const sw = Math.sin(t * 7 + sd) * 18 + wind * 50;
      parts.push(lockPath(sd * 150, -70, sd * 240 + sw, 170, 92, sd * 34, sd * 10 + sw * 0.5));
      parts.push(lockPath(sd * 145, -80, sd * 205 + sw * 1.2, 210, 58, sd * 22, sw * 0.3));
    }
  }
  return parts;
}
// bangs: [rootX, rootY, tipX, tipY, width, bend]
const BANGS = {
  long: [[-104, -100, -124, 36, 62, -12], [-70, -128, -86, 22, 72, 8], [-30, -146, -38, 4, 70, -6], [10, -150, 18, 16, 74, 8], [50, -138, 66, 0, 68, -10], [88, -114, 114, 38, 60, 12], [-52, -138, -58, -14, 50, -4]],
  pig: [[-96, -110, -114, -12, 70, -10], [-50, -142, -58, 8, 72, 8], [0, -150, 4, -6, 76, 0], [48, -142, 62, 6, 70, -8], [94, -110, 114, -18, 66, 10]],
};
function hairFrontParts(C, o) {
  const { t = 0, wind = 0.4 } = o;
  const parts = [], bangs = [];
  const sw = (i, a = 1) => Math.sin(t * 3.6 + i * 1.9) * (3 + 9 * Math.abs(wind)) * a;
  const cap = new Path2D();
  cap.moveTo(-128, 40); cap.bezierCurveTo(-158, -80, -102, -196, 0, -196); cap.bezierCurveTo(102, -196, 158, -80, 128, 40);
  cap.lineTo(108, 10); cap.bezierCurveTo(104, -50, 60, -74, 0, -76); cap.bezierCurveTo(-60, -74, -104, -50, -108, 10); cap.closePath();
  parts.push(cap);
  (BANGS[C.hair] || []).forEach(([x0, y0, x1, y1, w, b], i) => { const p = lockPath(x0, y0, x1 + wind * 14 + sw(i), y1 + sw(i + 3, 0.4), w, b, b * 0.6 + wind * 6); parts.push(p); bangs.push(p); });
  if (C.hair === 'long') {
    for (const sd of [-1, 1]) {
      const s2 = sw(sd + 5, 1.8), wv = wind * (sd === Math.sign(wind) ? 56 : 30);
      parts.push(lockPath(sd * 108, -70, sd * 132 + wv + s2, 262, 66, sd * 26, -sd * 10 + s2 * 0.6));
      const fine = lockPath(sd * 102, -40, sd * 118 + wv * 0.8 + s2 * 0.7, 160, 32, -sd * 4, sd * 8); parts.push(fine); bangs.push(fine);
    }
  } else if (C.hair === 'pig') {
    for (const sd of [-1, 1]) parts.push(lockPath(sd * 112, -70, sd * 126 + sw(sd, 1.2), 96, 42, sd * 8, 0));
  }
  return { parts, bangs };
}
function facePath(turn = 0, child = false) {
  const tx = turn * 16, p = new Path2D();
  const chin = child ? 150 : 172, jaw = child ? 120 : 128;
  // clockwise (positive winding)
  p.moveTo(-112, -40);
  p.bezierCurveTo(-112, -170, 112, -170, 112, -40);
  p.bezierCurveTo(116, 40 + (child ? 24 : 0), 100 + Math.min(0, turn) * 8, 92, 64 + tx * 0.5, jaw);
  p.bezierCurveTo(40 + tx, chin - 20, 14 + tx, chin - 4, tx * 1.3, chin);
  p.bezierCurveTo(-12 + tx, chin - 4, -36 + tx, chin - 20, -62 + tx * 0.5, jaw);
  p.bezierCurveTo(-100 + Math.max(0, turn) * 8, 92, -116, 40 + (child ? 24 : 0), -112, -40);
  p.closePath();
  return p;
}
function drawEye(g, C, ex, ey, s, o, lw) {
  const { blink = 0, look = [0, 0], tear = 0, happyEyes = 0, wide = 0, sad = 0, t = 0 } = o;
  const inX = ex - s * 30, outX = ex + s * 38;
  if (happyEyes > 0.5) {
    g.strokeStyle = PAL.line; g.lineWidth = lw * 1.9; g.lineCap = 'round';
    g.beginPath(); g.moveTo(inX, ey + 18); g.quadraticCurveTo(ex + s * 4, ey - 10, outX, ey + 14); g.stroke();
    g.lineWidth = lw * 0.8; g.beginPath(); g.moveTo(outX - s * 4, ey + 12); g.lineTo(outX + s * 10, ey + 2); g.stroke();
    if (tear > 0) { g.fillStyle = 'rgba(200,232,255,0.9)'; g.beginPath(); g.ellipse(ex + s * 6, ey + 26, 30, 6 * tear, 0, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(ex + s * 18, ey + 24, 3, 0, TAU); g.fill(); }
    return;
  }
  const open = clamp(1 - blink) * (1 + wide * 0.12);
  const U = (yo, yc) => lerp(yc, yo, open);
  const topY = sad ? -21 : -28;
  const up = [[inX, U(ey + 2, ey + 18)], [ex - s * 14, U(ey + topY, ey + 26)], [ex + s * 22, U(ey + topY - 2 + sad * 8, ey + 26)], [outX, U(ey - 8 + sad * 6, ey + 14)]];
  const lo = [[outX - s * 2, ey + 8], [ex + s * 30, ey + 36], [ex - s * 6, ey + 44], [inX + s * 2, ey + 14]];
  if (open < 0.14) {
    g.strokeStyle = PAL.line; g.lineWidth = lw * 1.8; g.lineCap = 'round';
    g.beginPath(); g.moveTo(inX, ey + 18); g.quadraticCurveTo(ex, ey + 32, outX, ey + 14); g.stroke();
    return;
  }
  const white = new Path2D();
  white.moveTo(...up[0]); white.bezierCurveTo(...up[1], ...up[2], ...up[3]);
  white.lineTo(...lo[0]); white.bezierCurveTo(...lo[1], ...lo[2], ...lo[3]); white.closePath();
  g.fillStyle = PAL.white; g.fill(white);
  g.save(); g.clip(white);
  g.fillStyle = PAL.eyeWS; g.beginPath(); g.moveTo(up[0][0], up[0][1] - 4); g.bezierCurveTo(up[1][0], up[1][1] + 14, up[2][0], up[2][1] + 14, up[3][0], up[3][1] + 8); g.lineTo(outX + s * 20, ey - 60); g.lineTo(inX - s * 20, ey - 60); g.fill();
  const ix = ex + s * 2 + look[0] * 12, iy = ey + 10 + look[1] * 7, rx = 23 * (1 - wide * 0.15), ry = 31 * (1 - wide * 0.12);
  const gr = g.createLinearGradient(0, iy - ry, 0, iy + ry);
  gr.addColorStop(0, C.eyeD); gr.addColorStop(0.45, C.eye); gr.addColorStop(1, C.eyeL);
  g.fillStyle = gr; g.beginPath(); g.ellipse(ix, iy, rx, ry, 0, 0, TAU); g.fill();
  g.fillStyle = rgbA(C.eyeD, 0.85); g.beginPath(); g.ellipse(ix, iy + 2, rx * 0.42, ry * 0.5, 0, 0, TAU); g.fill();
  g.fillStyle = 'rgba(30,10,30,0.35)'; g.beginPath(); g.ellipse(ix, iy - ry * 0.55, rx * 1.05, ry * 0.5, 0, 0, TAU); g.fill();
  g.strokeStyle = rgbA(C.eyeD, 0.9); g.lineWidth = lw * 0.6; g.beginPath(); g.ellipse(ix, iy, rx, ry, 0, 0, TAU); g.stroke();
  g.fillStyle = '#ffffff';
  g.beginPath(); g.ellipse(ix - s * 7 - 2, iy - 12, 7.5, 10, -0.3, 0, TAU); g.fill();
  g.beginPath(); g.arc(ix + s * 9, iy + 13, 3.8, 0, TAU); g.fill();
  g.globalAlpha = 0.55; g.beginPath(); g.ellipse(ix + 2, iy + 19, 11, 4, 0, 0, TAU); g.fillStyle = C.eyeL; g.fill(); g.globalAlpha = 1;
  if (tear > 0) {
    g.fillStyle = `rgba(255,255,255,${0.7 * tear})`;
    g.beginPath(); g.ellipse(ix - s * 2 + Math.sin(t * 7) * 1.5, iy + 6, 4, 6, 0.4, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(ix + s * 12, iy - 4 + Math.cos(t * 6) * 1.5, 3, 3, 0, 0, TAU); g.fill();
    g.fillStyle = `rgba(205,232,255,${0.6 * tear})`; g.beginPath(); g.ellipse(ex + s * 2, ey + 37, 40, 9 * tear, 0, 0, TAU); g.fill();
  }
  g.restore();
  g.strokeStyle = PAL.line; g.lineCap = 'round'; g.lineJoin = 'round';
  g.lineWidth = lw * 2.1; g.beginPath(); g.moveTo(...up[0]); g.bezierCurveTo(...up[1], ...up[2], ...up[3]); g.stroke();
  g.fillStyle = PAL.line; g.beginPath(); g.moveTo(up[3][0] - s * 14, up[3][1] - 2); g.lineTo(up[3][0] + s * 12, up[3][1] - 12 * open); g.lineTo(up[3][0] + s * 2, up[3][1] + 6); g.fill();
  g.lineWidth = lw * 0.7; g.beginPath(); g.moveTo(lo[0][0], lo[0][1] + 4); g.bezierCurveTo(lo[1][0], lo[1][1], lo[1][0] - s * 14, lo[1][1] + 6, ex - s * 2, ey + 42); g.stroke();
  g.lineWidth = lw * 0.55; g.strokeStyle = PAL.lineSoft; g.beginPath(); g.moveTo(ex - s * 8, U(ey - 38, ey + 10)); g.quadraticCurveTo(ex + s * 16, U(ey - 44, ey + 8), ex + s * 32, U(ey - 30, ey + 10)); g.stroke();
}
function drawBrow(g, ex, ey, s, b, lw) {
  const inY = ey - 58 - (b < 0 ? -b * 14 : b * 4), outY = ey - 56 - b * 6 + (b < 0 ? -b * 2 : 0);
  g.strokeStyle = PAL.line; g.lineWidth = lw * 1.05; g.lineCap = 'round';
  g.beginPath(); g.moveTo(ex - s * 22, inY); g.quadraticCurveTo(ex + s * 6, Math.min(inY, outY) - 8, ex + s * 36, outY + 6); g.stroke();
}
function drawMouth(g, o, tx, lw, child) {
  const { mouth = 0, smile = 0, sad = 0 } = o;
  const my = child ? 116 : 128, mx = tx * 1.2;
  g.strokeStyle = PAL.line; g.lineCap = 'round'; g.lineJoin = 'round';
  if (mouth > 0.08) {
    const w = 14 + mouth * 6 + smile * 8, h = 6 + mouth * 22;
    const p = new Path2D();
    p.moveTo(mx - w, my - 2 - smile * 3); p.quadraticCurveTo(mx, my - 6 + sad * 6, mx + w, my - 2 - smile * 3);
    p.quadraticCurveTo(mx + w * 0.7, my + h, mx, my + h + 2); p.quadraticCurveTo(mx - w * 0.7, my + h, mx - w, my - 2 - smile * 3); p.closePath();
    g.fillStyle = PAL.mouth; g.fill(p);
    g.save(); g.clip(p); g.fillStyle = PAL.tongue; g.beginPath(); g.ellipse(mx, my + h + 4, w * 0.6, h * 0.45, 0, 0, TAU); g.fill(); g.restore();
    g.lineWidth = lw * 0.8; g.stroke(p);
  } else {
    const w = 12 + smile * 10;
    g.lineWidth = lw * 0.9; g.beginPath(); g.moveTo(mx - w, my - smile * 5 + sad * 3); g.quadraticCurveTo(mx, my + smile * 6 - sad * 5, mx + w, my - smile * 5 + sad * 3); g.stroke();
  }
}
function unionOf(parts) { const all = new Path2D(); for (const p of parts) all.addPath(p); return all; }
/**
 * Anime head. part: 'back' (hair behind), 'front' (face + front hair), or 'all'.
 * o: { t, wind (-1..1), turn (-1..1), look:[x,y], blink 0..1, mouth 0..1, smile, brow (-1 worried..1 raised), tear 0..1,
 *      tearFall (0..1 drop position, <0 none), blush, happyEyes, light (-1 left, 1 right, 0 back), rim 0..1, rimCol, shade (0..1 face in shadow) }
 */
export function head(g, who, o = {}, part = 'all') {
  const C = CHARS[who];
  const { t = 0, turn = 0, light = -1, shade = 0, blush = 0, tearFall = -1, tear = 0, lw: lwIn } = o;
  const lw = lwIn || 3.2;
  const rimFace = RIM(o, 6, 230, 0, 0);
  if (part === 'back' || part === 'all') {
    if (C.hair === 'hijab') hijabBack(g, C, o, lw);
    else {
      const bp = unionOf(hairBackParts(C, o));
      cel(g, bp, C.hairS, C.hairC, (gg) => { gg.globalAlpha = 0.55; gg.beginPath(); gg.ellipse(light * 120 || 0, 140, 140, 380, 0, 0, TAU); gg.fill(); gg.globalAlpha = 1; }, lw, RIM(o, 8, 500, 0, 120));
      // a few strand lines
      g.save(); g.strokeStyle = rgbA(PAL.line, 0.55); g.lineWidth = lw * 0.6; g.lineCap = 'round';
      const wind = o.wind ?? 0.4;
      for (let i = 0; i < 5; i++) { const u = i / 4 - 0.5, x0 = u * 200; g.beginPath(); g.moveTo(x0, 160); g.quadraticCurveTo(x0 * 1.2 + wind * 60, 260, x0 * 1.3 + wind * 140 + Math.sin(t * 3.2 + i) * 14, 360 - Math.abs(wind) * 60); g.stroke(); }
      g.restore();
    }
    if (part === 'back') return;
  }
  const fp = facePath(turn, C.child);
  const tx = turn * 16;
  const front = C.hair === 'hijab' ? null : hairFrontParts(C, o);
  cel(g, fp, PAL.skin, PAL.skinS, (gg) => {
    if (C.hair === 'hijab') { gg.beginPath(); gg.ellipse(0, -92, 150, 46, 0, 0, TAU); gg.fill(); }
    else { gg.save(); gg.translate(-light * 6, 16); for (const p of front.parts.slice(1)) gg.fill(p); gg.restore(); gg.fillRect(-200, -200, 400, 100); }
    if (light !== 0) { gg.beginPath(); gg.ellipse(-light * 150 + tx, 40, 70, 190, 0, 0, TAU); gg.fill(); }
    if (shade > 0) { gg.globalAlpha = shade * 0.8; gg.fillRect(-200, -200, 400, 400); gg.globalAlpha = 1; }
    gg.fillStyle = PAL.skinS2; gg.beginPath(); gg.moveTo(tx * 1.6 + 2, 78); gg.lineTo(tx * 1.6 - (light || -1) * 9, 98); gg.lineTo(tx * 1.6 + 4, 99); gg.fill();
  }, lw, rimFace);
  const bl = Math.max(blush, o.happyEyes ? 0.6 : 0);
  if (bl > 0) {
    g.save(); g.globalAlpha = 0.45 * bl; g.fillStyle = PAL.blush;
    for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(sd * 62 + tx, 88, 30, 13, 0, 0, TAU); g.fill(); }
    g.globalAlpha = 0.7 * bl; g.strokeStyle = '#e0505e'; g.lineWidth = lw * 0.5;
    for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) { const x = sd * 62 + tx - 14 + k * 12; g.beginPath(); g.moveTo(x + 4, 80); g.lineTo(x - 3, 95); g.stroke(); }
    g.restore();
  }
  const ey = C.child ? 46 : 38, eyeOff = C.child ? 50 : 52;
  for (const s of [-1, 1]) drawEye(g, C, s * eyeOff + tx * 1.1, ey, s, o, lw);
  g.strokeStyle = PAL.line; g.lineWidth = lw * 0.7; g.lineCap = 'round';
  g.beginPath(); g.moveTo(tx * 1.6 + 2, 92); g.lineTo(tx * 1.6 + 6, 98); g.stroke();
  drawMouth(g, o, tx, lw, C.child);
  if (C.older) { g.strokeStyle = 'rgba(160,90,90,0.4)'; g.lineWidth = lw * 0.5; for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * 44 + tx, 104); g.quadraticCurveTo(sd * 52 + tx, 122, sd * 44 + tx, 136); g.stroke(); } }
  if (C.hair === 'hijab') hijabFront(g, C, o, lw);
  else {
    const all = unionOf(front.parts);
    cel(g, all, C.hairC, C.hairS, (gg) => {
      if (light !== 0) { gg.beginPath(); gg.ellipse(-light * 150, 40, 120, 260, 0, 0, TAU); gg.fill(); }
      gg.fillRect(-220, -4, 440, 300);
      if (shade > 0) { gg.globalAlpha = shade * 0.7; gg.fillRect(-250, -250, 500, 600); gg.globalAlpha = 1; }
      // angel-ring highlight: smooth upper arc, scalloped lower edge
      gg.fillStyle = C.hairH; gg.beginPath();
      const ringA0 = Math.PI * ((light || 0) > 0 ? 1.4 : 1.12), ringA1 = Math.PI * ((light || 0) < 0 ? 1.6 : 1.88), cyR = -40;
      for (let i = 0; i <= 20; i++) { const a = lerp(ringA0, ringA1, i / 20); const x = Math.cos(a) * 150, y = cyR + Math.sin(a) * 124; i ? gg.lineTo(x, y) : gg.moveTo(x, y); }
      for (let i = 10; i >= 0; i--) {
        const a = lerp(ringA0, ringA1, i / 10), am = lerp(ringA0, ringA1, (i + 0.5) / 10);
        const x = Math.cos(a) * 128, y = cyR + Math.sin(a) * 104 + 8;
        if (i < 10) gg.quadraticCurveTo(Math.cos(am) * 138, cyR + Math.sin(am) * 114 + 22, x, y); else gg.lineTo(x, y);
      }
      gg.closePath(); gg.globalAlpha = 0.32; gg.fill(); gg.globalAlpha = 1;
    }, lw, RIM(o, 7, 330, 0, -40));
    // strand separations on the bangs (lower parts only)
    g.save(); g.beginPath(); g.rect(-260, -96, 520, 400); g.clip();
    g.strokeStyle = PAL.line; g.lineWidth = lw * 0.75; g.lineJoin = 'round';
    for (const p of front.bangs) g.stroke(p);
    g.restore();
  }
  if (!o.noBrows) for (const s of [-1, 1]) drawBrow(g, s * eyeOff + tx * 1.1, ey, s, o.brow || 0, lw);
  if (tearFall >= 0 && tearFall <= 1 && tear > 0) {
    const sx = eyeOff + tx + 18, sy = ey + 44;
    const y = sy + ease.inQuad(tearFall) * 120, x = sx + tearFall * 10;
    g.save();
    g.strokeStyle = 'rgba(205,232,255,0.7)'; g.lineWidth = lw * 1.1; g.lineCap = 'round';
    g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo(sx + 4, (sy + y) / 2, x, y); g.stroke();
    g.fillStyle = 'rgba(220,240,255,0.97)'; g.beginPath(); g.moveTo(x, y - 14); g.quadraticCurveTo(x + 9, y + 2, x, y + 8); g.quadraticCurveTo(x - 9, y + 2, x, y - 14); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(x - 2, y + 1, 2.4, 0, TAU); g.fill();
    g.restore();
  }
}
function hijabOuter(o, back) {
  const { t = 0, wind = 0.3 } = o;
  const fl = (i) => Math.sin(t * 3 + i) * (5 + 14 * Math.abs(wind));
  const p = new Path2D();
  p.moveTo(-150, -10); p.bezierCurveTo(-166, -150, -92, -214, 0, -214); p.bezierCurveTo(92, -214, 166, -150, 150, -10);
  if (back) {
    p.bezierCurveTo(176, 140, 240 + wind * 40 + fl(1), 300, 290 + wind * 60 + fl(2), 560); p.lineTo(-290 + wind * 60 + fl(3), 560);
    p.bezierCurveTo(-240 + wind * 40 + fl(4), 300, -176, 140, -150, -10);
  } else {
    p.bezierCurveTo(150, 80, 128, 170, 70, 214);
    p.bezierCurveTo(170, 270, 250 + fl(1), 420, 248 + wind * 40 + fl(2), 640);
    p.bezierCurveTo(150 + fl(5), 700, -150 + fl(6), 700, -248 + wind * 40 + fl(3), 640);
    p.bezierCurveTo(-250 + fl(4), 420, -170, 270, -70, 214);
    p.bezierCurveTo(-128, 170, -150, 80, -150, -10);
  }
  p.closePath();
  return p;
}
function hijabOpening() {
  const p = new Path2D();
  p.moveTo(-108, -30); p.bezierCurveTo(-114, 50, -98, 100, -62, 136); p.bezierCurveTo(-32, 168, 32, 168, 62, 136);
  p.bezierCurveTo(98, 100, 114, 50, 108, -30); p.bezierCurveTo(102, -108, 52, -124, 0, -124); p.bezierCurveTo(-52, -124, -102, -108, -108, -30); p.closePath();
  return p;
}
function hijabBack(g, C, o, lw) { cel(g, hijabOuter(o, true), C.hijabS, null, null, lw, RIM(o, 7, 500, 0, 100)); }
function hijabFront(g, C, o, lw) {
  const { light = -1 } = o;
  const outer = hijabOuter(o, false), hole = hijabOpening();
  const p = new Path2D(); p.addPath(outer); p.addPath(hole);
  // outline (outer silhouette + opening edge)
  g.lineWidth = lw; g.strokeStyle = PAL.line; g.lineJoin = 'round';
  g.save(); g.clip(p, 'evenodd');
  g.fillStyle = C.hijab; g.fillRect(-400, -300, 800, 1100);
  const r = RIM(o, 7, 520, 0, 140);
  if (r) { g.globalAlpha = r.a; g.fillStyle = r.col; g.fillRect(-400, -300, 800, 1100); g.globalAlpha = 1; g.save(); if (r.dir === 0) { g.translate(0, 8); g.scale(0.97, 0.97); } else g.translate(-r.dir * 7, 3); g.fillStyle = C.hijab; g.fill(outer); g.restore(); }
  g.fillStyle = C.hijabS;
  if (light !== 0) { g.beginPath(); g.ellipse(-light * 175, 160, 120, 400, 0, 0, TAU); g.fill(); }
  g.beginPath(); g.moveTo(-70, 214); g.quadraticCurveTo(0, 262, 70, 214); g.lineTo(96, 280); g.quadraticCurveTo(0, 320, -96, 280); g.closePath(); g.fill();
  g.strokeStyle = C.hijabS; g.lineWidth = lw * 1.1; g.lineCap = 'round';
  for (let i = 0; i < 4; i++) { const x0 = -110 + i * 74; g.beginPath(); g.moveTo(x0, 300); g.quadraticCurveTo(x0 * 1.3, 470, x0 * 1.6, 650); g.stroke(); }
  g.fillStyle = C.hijabL; g.globalAlpha = 0.85; g.beginPath(); g.ellipse((light || -0.3) * 60, -172, 70, 24, (light || 0) * 0.3, 0, TAU); g.fill(); g.globalAlpha = 1;
  g.restore();
  g.strokeStyle = PAL.line; g.lineWidth = lw * 1.4; g.stroke(outer); g.stroke(hole);
  // inner cap band (ciput) at the forehead
  const band = new Path2D(); band.moveTo(-104, -50); band.bezierCurveTo(-96, -112, 96, -112, 104, -50); band.bezierCurveTo(70, -92, -70, -92, -104, -50); band.closePath();
  g.fillStyle = C.ciput; g.fill(band); g.lineWidth = lw * 0.8; g.stroke(band);
  // pin at the chin
  g.fillStyle = '#ffd36a'; g.beginPath(); g.arc(30, 200, 7, 0, TAU); g.fill(); g.stroke();
}
function torsoPath(br = 0) {
  const p = new Path2D();
  p.moveTo(-50, 236 + br); p.bezierCurveTo(-120, 250 + br, -190, 270 + br, -215, 330 + br);
  p.bezierCurveTo(-238, 400, -246, 600, -250, 900); p.lineTo(250, 900);
  p.bezierCurveTo(246, 600, 238, 400, 215, 330 + br); p.bezierCurveTo(190, 270 + br, 120, 250 + br, 50, 236 + br); p.closePath();
  return p;
}
/**
 * Bust (head + shoulders) at (x, y) = face centre, scale s. o: head params + { breath, tilt, arms:'run'|'none', runPhase, bag }.
 */
export function bust(ctx, who, x, y, s, o = {}) {
  const C = CHARS[who];
  const { t = 0, breath = 1, tilt = 0, light = -1, arms = 'none', runPhase = 0, bag = who === 'laras' } = o;
  const lw = 3.2;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const br = Math.sin(t * 2.4) * 4 * breath;
  ctx.save(); ctx.rotate(tilt); head(ctx, who, { ...o, lw }, 'back'); ctx.restore();
  if (arms === 'run') runArms(ctx, C, runPhase, light, lw, -1, o);
  const neck = new Path2D(); neck.moveTo(-40, 120); neck.lineTo(-44, 262 + br); neck.lineTo(44, 262 + br); neck.lineTo(40, 120); neck.closePath();
  cel(ctx, neck, PAL.skin, PAL.skinS, (g) => { g.beginPath(); g.ellipse(0, 150, 90, 70, 0, 0, TAU); g.fill(); if (light) g.fillRect(light < 0 ? 10 : -60, 120, 50, 200); if (o.shade) { g.globalAlpha = o.shade; g.fillRect(-60, 100, 120, 200); g.globalAlpha = 1; } }, lw, RIM(o, 5, 90, 0, 200));
  const torso = torsoPath(br);
  cel(ctx, torso, C.jacket, C.jacketS, (g) => { if (light) { g.beginPath(); g.ellipse(-light * 230, 600, 150, 420, 0, 0, TAU); g.fill(); } g.fillRect(-300, 260, 600, 30 + br); if (o.shade) { g.globalAlpha = o.shade * 0.8; g.fillRect(-300, 200, 600, 800); g.globalAlpha = 1; } }, lw, RIM(o, 8, 500, 0, 560));
  if (C.hair !== 'hijab') {
    const shirt = new Path2D(); shirt.moveTo(-58, 238 + br); shirt.lineTo(0, 470); shirt.lineTo(58, 238 + br); shirt.closePath();
    cel(ctx, shirt, C.shirt, C.shirtS, (g) => g.fillRect(-80, 230, 160, 50), lw);
    for (const sd of [-1, 1]) {
      const col = new Path2D(); col.moveTo(sd * 44, 236 + br); col.lineTo(sd * 92, 262 + br); col.lineTo(sd * 30, 330 + br); col.closePath();
      cel(ctx, col, C.shirt, C.shirtS, (g) => g.fillRect(sd * 40, 300, sd * 60, 40), lw);
      const lap = new Path2D(); lap.moveTo(sd * 60, 244 + br); lap.lineTo(sd * 120, 270 + br); lap.lineTo(sd * 18, 520); lap.lineTo(sd * 8, 470); lap.closePath();
      cel(ctx, lap, C.jacket, C.jacketS, (g) => { if (sd === -light || o.shade) g.fill(lap); }, lw);
    }
    if (bag) for (const sd of [-1, 1]) {
      const st = new Path2D(); st.moveTo(sd * 128, 268 + br); st.lineTo(sd * 178, 290 + br); st.lineTo(sd * 158, 900); st.lineTo(sd * 112, 900); st.closePath();
      cel(ctx, st, C.bag, C.bagS, (g) => { if (sd === -light) g.fill(st); else g.fillRect(sd * 112 - 10, 268, 16, 700); }, lw);
      ctx.fillStyle = '#d9d2e0'; ctx.strokeStyle = PAL.line; ctx.lineWidth = lw; ctx.beginPath(); ctx.roundRect(sd * 140 - 22, 520, 44, 30, 6); ctx.fill(); ctx.stroke();
    }
  }
  if (arms === 'run') runArms(ctx, C, runPhase, light, lw, 1, o);
  ctx.rotate(tilt);
  head(ctx, who, { ...o, lw }, 'front');
  ctx.restore();
}
/** A loose fist (knuckles + thumb). */
function fist(g, x, y, ang, k, light, lw, shade = 0) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(k, k);
  const p = new Path2D(); p.roundRect(-46, -38, 92, 84, 30);
  cel(g, p, PAL.skin, PAL.skinS, (gg) => { gg.fillRect(light > 0 ? -60 : 10, -60, 60, 140); if (shade) { gg.globalAlpha = shade; gg.fillRect(-60, -60, 120, 140); gg.globalAlpha = 1; } }, lw);
  g.strokeStyle = PAL.line; g.lineWidth = lw * 0.7; g.lineCap = 'round';
  for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-24 + i * 24, -36); g.lineTo(-24 + i * 24, -14); g.stroke(); }
  g.beginPath(); g.moveTo(-40, 10); g.quadraticCurveTo(-6, 24, 22, 4); g.stroke();
  g.restore();
}
function runArms(g, C, ph, light, lw, which, o) {
  for (const sd of [-1, 1]) {
    const sw = Math.sin(ph * TAU + (sd > 0 ? 0 : Math.PI));
    const front = sw > 0;
    if ((which > 0) !== front) continue;
    const sx = sd * 200, sy = 350;
    const ex = sd * (262 + sw * 20), ey = 640 - sw * 60;
    const hx = sd * (190 - sw * 70), hy = 780 - sw * 260;
    const k = 1 + sw * 0.18;
    const sh = front ? 0 : 0.35;
    cel(g, capsule(sx, sy, ex, ey, 120 * k, 104 * k), C.jacket, C.jacketS, (gg) => { gg.fillRect(sd === -light ? -400 : 0, 0, 400, 1200); if (!front) { gg.globalAlpha = 0.4; gg.fillRect(-400, 0, 800, 1200); gg.globalAlpha = 1; } }, lw, RIM(o, 7, 120, sx, sy));
    cel(g, capsule(ex, ey, hx, hy, 104 * k, 92 * k), C.jacket, C.jacketS, (gg) => { gg.fillRect(sd === -light ? -400 : 0, 0, 400, 1200); if (!front) { gg.globalAlpha = 0.4; gg.fillRect(-400, 0, 800, 1200); gg.globalAlpha = 1; } }, lw, RIM(o, 7, 120, ex, ey));
    g.fillStyle = C.shirt; g.beginPath(); g.ellipse(hx, hy, 52 * k, 30 * k, Math.atan2(hy - ey, hx - ex) + Math.PI / 2, 0, TAU); g.fill(); g.lineWidth = lw; g.strokeStyle = PAL.line; g.stroke();
    fist(g, hx + (hx - ex) * 0.12, hy + (hy - ey) * 0.16, Math.atan2(hy - ey, hx - ex) - Math.PI / 2, k * 0.95, light, lw, sh);
  }
}
/** Back view bust (hair + jacket + backpack), for over-the-shoulder and hug shots. */
export function bustBack(ctx, who, x, y, s, o = {}) {
  const C = CHARS[who];
  const { t = 0, wind = 0.2, light = -1 } = o;
  const lw = 3.2;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  cel(ctx, torsoPath(0), C.jacket, C.jacketS, (g) => { if (light) { g.beginPath(); g.ellipse(-light * 230, 600, 150, 420, 0, 0, TAU); g.fill(); } }, lw, RIM(o, 8, 500, 0, 560));
  if (C.bag) {
    const bg = new Path2D(); bg.roundRect(-150, 420, 300, 440, 70);
    cel(ctx, bg, C.bag, C.bagS, (g) => { g.beginPath(); g.ellipse(-(light || 1) * 170, 640, 110, 260, 0, 0, TAU); g.fill(); }, lw, RIM(o, 6, 300, 0, 640));
    const pk = new Path2D(); pk.roundRect(-100, 620, 200, 180, 40); cel(ctx, pk, C.bag, C.bagS, (g) => g.fillRect(-120, 620, 240, 30), lw);
  }
  const parts = [];
  const top = new Path2D(); top.ellipse(0, -30, 162, 170, 0, 0, TAU); parts.push(top);
  for (let i = 0; i < 11; i++) {
    const u = i / 10 - 0.5, sway = Math.sin(t * 3 + i * 1.6) * (10 + 26 * Math.abs(wind));
    parts.push(lockPath(u * 260, -60, u * 330 + wind * 150 + sway, 380 + hrand(i, 2) * 90, 110, wind * 30 + sway * 0.4, wind * 50 + sway));
  }
  const p = unionOf(parts);
  cel(ctx, p, C.hairC, C.hairS, (g) => { if (light) { g.beginPath(); g.ellipse(-light * 160, 120, 170, 400, 0, 0, TAU); g.fill(); } g.fillStyle = C.hairH; g.globalAlpha = 0.3; g.beginPath(); g.ellipse((light || 0) * 50, -130, 90, 16, 0, 0, TAU); g.fill(); g.globalAlpha = 1; }, lw, RIM(o, 8, 400, 0, 100));
  ctx.strokeStyle = rgbA(PAL.line, 0.5); ctx.lineWidth = lw * 0.6;
  for (let i = 0; i < 6; i++) { const u = i / 5 - 0.5; ctx.beginPath(); ctx.moveTo(u * 200, -100); ctx.quadraticCurveTo(u * 260 + wind * 60, 160, u * 300 + wind * 140, 380); ctx.stroke(); }
  ctx.restore();
}

// ---------------------------------------------------------------- full figure
// Local units like the head: feet at y=0, ≈7.4 heads tall (head origin at y≈-2470). Facing right (dir=1).
/**
 * Full-body figure. pose: { lean, legs:[[thigh,knee],[thigh,knee]], arms:[[shoulder,elbow],[shoulder,elbow]], bob, headTilt }
 * angles in radians from straight down; thigh/shoulder positive = forward; knee positive = shin swings back; elbow positive = forearm forward.
 * o: { t, dir, light, rim, wind, sil (flat silhouette colour), ...head params }
 */
export function figure(ctx, who, x, y, s, pose, o = {}) {
  const C = CHARS[who];
  const { dir = 1, light = -1, wind = 0.4, t = 0, sil = null } = o;
  const child = !!C.child, K = child ? 0.56 : 1;
  const lw = 3.2 + 1.2 / Math.max(0.2, s) * 0.3;
  const { lean = 0, legs = [[0.1, 0.1], [-0.1, 0.1]], arms = [[0.15, 0.2], [-0.15, 0.2]], bob = 0, headTilt = 0 } = pose;
  const col = (c) => sil || c;
  const lightL = light * dir;
  const oo = { ...o, light: lightL };
  const rim = (k, w, cx, cy) => (sil ? (o.rim > 0 ? { dir: lightL, col: o.rimCol || PAL.rim, a: o.rim, k, w, cx, cy } : null) : RIM(oo, k, w, cx, cy));
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s);
  const thigh = 600 * K, shin = 580 * K, upper = 400 * K, fore = 360 * K, torsoL = 880 * K;
  const H = [0, -1240 * K + bob];
  const rot = (a, [px, py]) => [px * Math.cos(a) - py * Math.sin(a), px * Math.sin(a) + py * Math.cos(a)];
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const S = add(H, rot(lean, [0, -torsoL]));
  const N = add(S, rot(lean, [0, -50 * K]));
  const legPts = legs.map(([a1, a2], i) => {
    const hip = add(H, rot(lean * 0.3, [(i ? -40 : 40) * K, 0]));
    const knee = add(hip, [Math.sin(a1) * thigh, Math.cos(a1) * thigh]);
    const ank = add(knee, [Math.sin(a1 - a2) * shin, Math.cos(a1 - a2) * shin]);
    return { hip, knee, ank, a: a1 - a2 };
  });
  const armPts = arms.map(([a1, a2], i) => {
    const sh = add(S, rot(lean, [(i ? -30 : 30) * K, 60 * K]));
    const el = add(sh, [Math.sin(a1 + lean) * upper, Math.cos(a1 + lean) * upper]);
    const hd = add(el, [Math.sin(a1 + a2 + lean) * fore, Math.cos(a1 + a2 + lean) * fore]);
    return { sh, el, hd };
  });
  const dim = (c, far) => (far ? mixHex(c, '#3a2850', 0.28) : c);
  const limb = (a, b, w0, w1, base, shade, far) => {
    const p = capsule(a[0], a[1], b[0], b[1], w0, w1);
    cel(ctx, p, col(dim(base, far)), sil ? null : dim(shade, far), (g) => { g.save(); g.translate(-lightL * w0 * 0.45, 0); g.fill(p); g.restore(); }, lw, far ? null : rim(6, w0, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2));
  };
  const shoe = (L, far) => {
    const p = new Path2D();
    ctx.save(); ctx.translate(L.ank[0], L.ank[1]); ctx.rotate(-L.a * 0.55);
    p.moveTo(-40 * K, -24 * K); p.bezierCurveTo(-48 * K, 36 * K, 10 * K, 50 * K, 160 * K, 44 * K); p.bezierCurveTo(186 * K, 22 * K, 150 * K, -12 * K, 60 * K, -34 * K); p.closePath();
    cel(ctx, p, col(dim(C.shoe, far)), sil ? null : C.shoeS, (g) => g.fillRect(-70 * K, 28 * K, 280 * K, 30 * K), lw);
    ctx.restore();
  };
  const legDraw = (L, far) => { limb(L.hip, L.knee, 150 * K, 112 * K, PAL.skin, PAL.skinS, far); limb(L.knee, L.ank, 112 * K, 72 * K, PAL.skin, PAL.skinS, far); shoe(L, far); };
  const armDraw = (A, far) => {
    limb(A.sh, A.el, 124 * K, 100 * K, C.jacket, C.jacketS, far);
    limb(A.el, A.hd, 100 * K, 84 * K, C.jacket, C.jacketS, far);
    const ang = Math.atan2(A.hd[1] - A.el[1], A.hd[0] - A.el[0]);
    const hx = A.hd[0] + Math.cos(ang) * 40 * K, hy = A.hd[1] + Math.sin(ang) * 40 * K;
    const hp = new Path2D(); hp.ellipse(hx, hy, 52 * K, 40 * K, ang, 0, TAU);
    cel(ctx, hp, col(dim(PAL.skin, far)), sil ? null : PAL.skinS, (g) => g.fillRect(hx - (lightL > 0 ? 80 : 0) * K, hy - 80, 80 * K, 200), lw);
  };
  const headC = add(N, rot(lean + headTilt, [0, -232 * K]));
  const hk = child ? 0.86 : 0.98;
  const headCall = (part) => {
    ctx.save(); ctx.translate(headC[0], headC[1]); ctx.rotate(lean * 0.5 + headTilt); ctx.scale(hk, hk);
    if (!sil) head(ctx, who, { ...oo, wind: wind * dir, lw: lw / hk, turn: o.turn ?? 0.5 }, part);
    else {
      const r = rim(7, 330, 0, 0);
      if (part === 'back') { if (C.hair === 'hijab') cel(ctx, hijabOuter(o, true), sil, null, null, lw, r); else cel(ctx, unionOf(hairBackParts(C, { ...o, wind: wind * dir })), sil, null, null, lw, r); }
      else { const f = new Path2D(); f.addPath(facePath(0.5, child)); if (C.hair === 'hijab') f.addPath(hijabOuter(o, false)); else for (const p of hairFrontParts(C, { ...o, wind: wind * dir }).parts) f.addPath(p); cel(ctx, f, sil, null, null, lw, r); }
    }
    ctx.restore();
  };
  armDraw(armPts[1], true);
  legDraw(legPts[1], true);
  headCall('back');
  if (C.bag) {
    const bc = add(S, rot(lean, [-150, 330]));
    ctx.save(); ctx.translate(bc[0], bc[1]); ctx.rotate(lean); const bgp = new Path2D(); bgp.roundRect(-120, -230, 200, 420, 60);
    cel(ctx, bgp, col(C.bag), sil ? null : C.bagS, (g) => g.fillRect(-130, 40, 240, 200), lw, rim(6, 200, -20, 0)); ctx.restore();
  }
  legDraw(legPts[0], false);
  // skirt / long dress
  const long = C.hair === 'hijab';
  const W0 = add(H, rot(lean, [0, -300 * K]));
  const kn = legPts.map((L) => (long ? L.ank : L.knee));
  const hemY = Math.max(kn[0][1], kn[1][1]) + (long ? -40 : 170) * K;
  const minX = Math.min(kn[0][0], kn[1][0]) - 110 * K, maxX = Math.max(kn[0][0], kn[1][0]) + 110 * K;
  const fl = (i) => Math.sin(t * 7 + i * 2.1) * 22 * K * (0.4 + Math.abs(wind));
  const wb = -wind * dir * 70 * K;
  const sk = new Path2D();
  sk.moveTo(W0[0] - 115 * K, W0[1]);
  sk.bezierCurveTo(W0[0] - 175 * K, W0[1] + 320 * K, minX + wb * 0.5, hemY - 260 * K, minX + wb + fl(1), hemY + fl(2) * 0.4);
  for (let i = 1; i <= 4; i++) { const u = i / 4; sk.quadraticCurveTo(lerp(minX, maxX, u - 0.125) + wb * (1 - u + 0.3), hemY + 34 * K + fl(i + 3) * 0.5, lerp(minX, maxX, u) + wb * (1 - u) + fl(i + 6) * 0.4, hemY + fl(i) * 0.4); }
  sk.bezierCurveTo(maxX + 40 * K, hemY - 300 * K, W0[0] + 175 * K, W0[1] + 320 * K, W0[0] + 115 * K, W0[1]); sk.closePath();
  cel(ctx, sk, col(C.skirt), sil ? null : C.skirtS, (g) => { g.save(); g.translate(-lightL * 100 * K, 0); g.scale(0.82, 1); g.fill(sk); g.restore(); }, lw, rim(8, maxX - minX, (minX + maxX) / 2, hemY - 300));
  if (!sil) { ctx.strokeStyle = rgbA(C.skirtS, 1); ctx.lineWidth = lw * 1.1; ctx.lineCap = 'round'; for (let i = 0; i < 3; i++) { const u = 0.3 + i * 0.2; ctx.beginPath(); ctx.moveTo(lerp(W0[0] - 80 * K, W0[0] + 80 * K, u), W0[1] + 120 * K); ctx.quadraticCurveTo(lerp(minX, maxX, u) + wb * 0.5, (W0[1] + hemY) / 2, lerp(minX, maxX, u) + wb * (1 - u), hemY - 20 * K); ctx.stroke(); } }
  // torso (jacket / dress top)
  ctx.save(); ctx.translate(H[0], H[1]); ctx.rotate(lean);
  const tor = new Path2D();
  tor.moveTo(-60 * K, -torsoL - 10 * K); tor.bezierCurveTo(-180 * K, -torsoL + 10 * K, -170 * K, -torsoL + 160 * K, -140 * K, -420 * K);
  tor.bezierCurveTo(-120 * K, -300 * K, -150 * K, -120 * K, -160 * K, 30 * K); tor.lineTo(160 * K, 30 * K);
  tor.bezierCurveTo(150 * K, -120 * K, 120 * K, -300 * K, 140 * K, -420 * K); tor.bezierCurveTo(170 * K, -torsoL + 160 * K, 180 * K, -torsoL + 10 * K, 60 * K, -torsoL - 10 * K); tor.closePath();
  cel(ctx, tor, col(C.jacket), sil ? null : C.jacketS, (g) => { g.save(); g.translate(-lightL * 130 * K, 0); g.scale(0.78, 1); g.fill(tor); g.restore(); }, lw, rim(8, 340 * K, 0, -torsoL / 2));
  if (!sil && !long) {
    const sh = new Path2D(); sh.moveTo(-50 * K, -torsoL); sh.lineTo(40 * K, -480 * K); sh.lineTo(70 * K, -torsoL); sh.closePath(); cel(ctx, sh, C.shirt, C.shirtS, (g) => g.fillRect(-60 * K, -torsoL, 120 * K, 60 * K), lw);
    ctx.strokeStyle = PAL.line; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(40 * K, -480 * K); ctx.lineTo(60 * K, 30 * K); ctx.stroke();
  }
  ctx.restore();
  armDraw(armPts[0], false);
  headCall('front');
  ctx.restore();
}
/** Pose library. phase 0..1 for cycles. */
export const POSE = {
  stand: (t = 0) => ({ lean: 0.02, legs: [[0.05, 0.04], [-0.05, 0.03]], arms: [[0.06, 0.12 + Math.sin(t * 2) * 0.02], [-0.05, 0.15]], bob: Math.sin(t * 2.4) * 6 }),
  run: (ph) => {
    const a = Math.sin(ph * TAU), c = Math.cos(ph * TAU);
    return { lean: 0.2, bob: -Math.abs(c) * 50 + 30, headTilt: -0.12,
      legs: [[0.8 * a + 0.12, 0.25 + 1.3 * Math.max(0, c) + 0.3 * Math.max(0, -a)], [-0.8 * a + 0.12, 0.25 + 1.3 * Math.max(0, -c) + 0.3 * Math.max(0, a)]],
      arms: [[-0.85 * a, 1.45], [0.85 * a, 1.45]] };
  },
  leap: (k = 1) => ({ lean: lerp(0.25, 0.85, k), bob: -lerp(0, 220, k), headTilt: -0.35 * k,
    legs: [[lerp(0.6, 1.25, k), lerp(0.9, 1.5, k)], [lerp(-0.4, -1.0, k), lerp(0.5, 0.25, k)]], arms: [[lerp(0.4, 1.9, k), lerp(0.6, 0.15, k)], [lerp(-0.5, -1.1, k), lerp(0.8, 0.5, k)]] }),
  openArms: (k = 1) => ({ lean: 0.02, legs: [[0.04, 0.03], [-0.04, 0.03]], arms: [[lerp(0.05, 1.1, k), lerp(0.2, 0.5, k)], [lerp(-0.05, 0.75, k), lerp(0.2, 0.6, k)]], bob: 0 }),
  wave: (t = 0) => ({ lean: 0, legs: [[0.04, 0.03], [-0.04, 0.03]], arms: [[2.6 + Math.sin(t * 7) * 0.25, 0.3], [-0.05, 0.2]], bob: Math.sin(t * 2) * 4 }),
};

// ======================================================================= props & places
/** Station clock (round, on a bracket). time in minutes past 16:00 etc. hh, mm (float). */
export function clock(ctx, x, y, r, hh, mm, { t = 0, light = -1, glintA = 0 } = {}) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = '#3a3346'; ctx.fillRect(-r * 0.06, -r * 2.2, r * 0.12, r * 1.2);
  const rimP = new Path2D(); rimP.arc(0, 0, r * 1.12, 0, TAU);
  cel(ctx, rimP, '#4c4560', '#2f2a3e', (g) => { g.beginPath(); g.arc(-light * r * 0.3, 0, r * 1.12, 0, TAU); g.fill(); }, 4);
  const face = new Path2D(); face.arc(0, 0, r, 0, TAU);
  cel(ctx, face, '#fffaf0', '#e9dcd2', (g) => { g.beginPath(); g.arc(-light * r * 0.25, r * 0.15, r, 0, TAU); g.fill(); }, 4);
  ctx.strokeStyle = PAL.line; ctx.lineCap = 'round';
  for (let i = 0; i < 60; i++) {
    const a = i / 60 * TAU, big = i % 5 === 0;
    ctx.lineWidth = big ? r * 0.05 : r * 0.015;
    ctx.beginPath(); ctx.moveTo(Math.sin(a) * r * (big ? 0.76 : 0.86), -Math.cos(a) * r * (big ? 0.76 : 0.86)); ctx.lineTo(Math.sin(a) * r * 0.92, -Math.cos(a) * r * 0.92); ctx.stroke();
  }
  const ha = ((hh % 12) + mm / 60) / 12 * TAU, ma = mm / 60 * TAU;
  ctx.lineWidth = r * 0.07; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(ha) * r * 0.5, -Math.cos(ha) * r * 0.5); ctx.stroke();
  ctx.lineWidth = r * 0.045; ctx.beginPath(); ctx.moveTo(-Math.sin(ma) * r * 0.12, Math.cos(ma) * r * 0.12); ctx.lineTo(Math.sin(ma) * r * 0.8, -Math.cos(ma) * r * 0.8); ctx.stroke();
  ctx.fillStyle = '#c8443c'; ctx.beginPath(); ctx.arc(0, 0, r * 0.06, 0, TAU); ctx.fill();
  // glass sheen
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.ellipse(-r * 0.35, -r * 0.45, r * 0.4, r * 0.16, -0.6, 0, TAU); ctx.fill();
  ctx.restore();
  if (glintA > 0) glint(ctx, x - r * 0.6, y - r * 0.6, r * 0.35, glintA);
}
/** Paper train ticket held in a hand (close-up). k = flutter. */
export function ticketHand(ctx, x, y, s, { t = 0, rot = -0.08, light = -1, lines = ['KERETA TERAKHIR', '17.00'], glintU = -1 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot + Math.sin(t * 2.3) * 0.02); ctx.scale(s, s);
  const lw = 4;
  // fingers behind
  for (let i = 0; i < 4; i++) { const f = capsule(250, -150 + i * 70, 330, -170 + i * 76, 64, 56); cel(ctx, f, PAL.skin, PAL.skinS, (g) => g.fillRect(250, -200 + i * 70 + 26, 120, 40), lw); }
  // ticket card
  const tk = new Path2D(); tk.roundRect(-320, -230, 620, 330, 18);
  const fl = Math.sin(t * 3.1) * 4;
  ctx.save(); ctx.transform(1, 0, fl * 0.002, 1, 0, 0);
  cel(ctx, tk, '#fff6e2', '#ead6bd', (g) => { g.beginPath(); g.moveTo(-320, 60); g.lineTo(300, -20); g.lineTo(300, 120); g.lineTo(-320, 120); g.fill(); }, lw);
  ctx.fillStyle = '#d8743f'; ctx.fillRect(-320, -230, 620, 54);
  ctx.fillStyle = '#3d5f9e'; ctx.fillRect(-320, -176, 620, 12);
  ctx.fillStyle = '#fff'; ctx.font = "800 30px 'Poppins'"; ctx.textBaseline = 'middle'; ctx.fillText('TIKET KERETA', -296, -203);
  ctx.fillStyle = PAL.line; ctx.font = "800 46px 'Poppins'"; ctx.fillText(lines[0], -296, -112);
  ctx.font = "600 26px 'Poppins'"; ctx.fillStyle = '#6a5a6a'; ctx.fillText('BERANGKAT', -296, -48); ctx.fillText('GERBONG 5 · KURSI 12A', -296, 46);
  ctx.font = "800 64px 'Poppins'"; ctx.fillStyle = '#c8443c'; ctx.fillText(lines[1], -296, 0);
  ctx.setLineDash([10, 10]); ctx.strokeStyle = '#b8a48a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(150, -170); ctx.lineTo(150, 100); ctx.stroke(); ctx.setLineDash([]);
  // barcode
  ctx.fillStyle = PAL.line; for (let i = 0; i < 22; i++) if (hrand(i, 4) > 0.35) ctx.fillRect(176 + i * 5, -150, 3, 160);
  if (glintU >= 0 && glintU <= 1) {
    ctx.save(); ctx.clip(tk);
    const gx = lerp(-420, 420, glintU);
    const gr = ctx.createLinearGradient(gx - 80, 0, gx + 80, 0);
    gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.75)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gr; ctx.translate(gx, 0); ctx.rotate(0.4); ctx.fillRect(-80, -400, 160, 800); ctx.restore();
  }
  ctx.restore();
  // thumb in front + palm/wrist from below right
  const palm = new Path2D(); palm.moveTo(220, 60); palm.bezierCurveTo(300, 40, 380, 60, 400, 140); palm.lineTo(440, 600); palm.lineTo(200, 600); palm.bezierCurveTo(210, 300, 180, 140, 220, 60); palm.closePath();
  cel(ctx, palm, PAL.skin, PAL.skinS, (g) => { g.beginPath(); g.ellipse(380, 300, 70, 300, 0, 0, TAU); g.fill(); }, lw);
  const sleeve = new Path2D(); sleeve.moveTo(170, 380); sleeve.lineTo(470, 330); sleeve.lineTo(520, 640); sleeve.lineTo(150, 660); sleeve.closePath();
  cel(ctx, sleeve, CHARS.laras.jacket, CHARS.laras.jacketS, (g) => g.fillRect(380, 300, 200, 400), lw);
  const th = lockPath(250, 110, 120, 10, 80, -14, -6); cel(ctx, th, PAL.skin, PAL.skinS, (g) => g.fillRect(100, 40, 200, 60), lw);
  ctx.fillStyle = '#ffd9d0'; ctx.beginPath(); ctx.ellipse(142, 22, 18, 12, -0.6, 0, TAU); ctx.fill();
  ctx.restore();
}

// ---- 3D-ish station (perspective projection of simple boxes) ----
const proj = (X, Y, Z, cam) => { const z = Math.max(0.2, Z - cam.z); return [cam.cx + (X - cam.x) * cam.f / z, cam.hy - (Y - cam.y) * cam.f / z, z]; };
function quad(ctx, a, b, c, d) { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); }
/**
 * Station platform at golden hour, seen down the platform. cam: { z (dolly), x, y (eye height), f, cx, hy (horizon) }.
 * opts: { trainZ (train offset, moves when departing), sunX, sunY, t }
 */
export function station(ctx, t, { cam = {}, trainZ = 0, preset = 'golden', sunX = 600, sunY = 900, clockAt = null, people = true } = {}) {
  const C = { z: 0, x: 0.4, y: 1.6, f: 820, cx: 540, hy: 930, ...cam };
  const P = (X, Y, Z) => proj(X, Y, Z, C);
  // sky + clouds
  sky(ctx, preset);
  cloud(ctx, 260, 820, 1.25, { seed: 3, preset, sunDir: [0.4, 0.9] });
  cloud(ctx, 900, 760, 0.9, { seed: 7, preset, sunDir: [-0.4, 0.9], tower: 1.1 });
  sun(ctx, sunX, sunY, { r: 46, t, flare: 0 });
  // distant city silhouette at horizon
  ctx.fillStyle = '#7b5d9a';
  for (let i = 0; i < 18; i++) { const x = i * 64 - 20, h = 30 + hrand(i, 3) * 90; ctx.fillRect(x, C.hy - h + 6, 52, h); }
  ctx.fillStyle = '#5a4580'; ctx.fillRect(0, C.hy, 1080, 30);
  // track bed (left of platform)
  const far = 400;
  ctx.fillStyle = '#4a3a58'; quad(ctx, P(-9, 0, 1), P(-1.5, -0.2, 1), P(-1.5, -0.2, far), P(-9, 0, far)); ctx.fill();
  // rails glinting
  ctx.strokeStyle = '#ffd9a8'; ctx.lineWidth = 3;
  for (const rx of [-2.3, -3.7, -6.1, -7.5]) { const a = P(rx, -0.05, 1.2), b = P(rx, -0.05, far); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
  // platform floor
  const fl = ctx.createLinearGradient(0, C.hy, 0, 1920);
  fl.addColorStop(0, '#f2c49a'); fl.addColorStop(0.25, '#c99a8e'); fl.addColorStop(1, '#6f5a7a');
  ctx.fillStyle = fl; quad(ctx, P(-1.5, 0, 0.4), P(7, 0, 0.4), P(7, 0, far), P(-1.5, 0, far)); ctx.fill();
  // yellow safety line + tactile strip + edge
  ctx.fillStyle = '#f4c542'; quad(ctx, P(-1.3, 0, 0.4), P(-0.95, 0, 0.4), P(-0.95, 0, far), P(-1.3, 0, far)); ctx.fill();
  ctx.fillStyle = '#e8dccd'; quad(ctx, P(-1.5, 0, 0.4), P(-1.32, 0, 0.4), P(-1.32, 0, far), P(-1.5, 0, far)); ctx.fill();
  // floor reflections of the sun (long streaks)
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const rf = ctx.createLinearGradient(0, C.hy, 0, 1920); rf.addColorStop(0, 'rgba(255,220,170,0.5)'); rf.addColorStop(1, 'rgba(255,220,170,0)');
  ctx.fillStyle = rf; quad(ctx, P(0.2, 0, 2), P(1.6, 0, 2), P(0.95, 0, far), P(0.7, 0, far)); ctx.fill(); ctx.restore();
  // floor tile seams (moving with dolly)
  ctx.strokeStyle = 'rgba(80,50,90,0.25)'; ctx.lineWidth = 2;
  for (let k = 0; k < 40; k++) { const z = Math.floor(C.z) + k * 2 - (C.z % 2) + 1; if (z - C.z < 0.5) continue; const a = P(-1, 0, z), b = P(7, 0, z); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
  // train (left), long box from z0 to far; side face at X=-1.9
  const tz0 = 1 + trainZ, tz1 = 260 + trainZ;
  const X = -1.75, Xb = -4.6, Y0 = 0.25, Y1 = 3.7;
  ctx.fillStyle = '#d8cfd8'; quad(ctx, P(X, Y1, tz0), P(Xb, Y1 + 0.2, tz0), P(Xb, Y1 + 0.2, tz1), P(X, Y1, tz1)); ctx.fill();
  const side = ctx.createLinearGradient(0, 0, 0, 0);
  ctx.fillStyle = '#f4ece6'; quad(ctx, P(X, Y0, tz0), P(X, Y1, tz0), P(X, Y1, tz1), P(X, Y0, tz1)); ctx.fill();
  // stripes
  ctx.fillStyle = '#d8743f'; quad(ctx, P(X, 0.9, tz0), P(X, 1.15, tz0), P(X, 1.15, tz1), P(X, 0.9, tz1)); ctx.fill();
  ctx.fillStyle = '#3d5f9e'; quad(ctx, P(X, 0.75, tz0), P(X, 0.88, tz0), P(X, 0.88, tz1), P(X, 0.75, tz1)); ctx.fill();
  // windows & doors per car (cars 20 m)
  for (let k = 0; k < 14; k++) {
    const zc = tz0 + k * 20;
    if (zc - C.z > far || zc + 20 - C.z < 0.5) continue;
    for (let w = 0; w < 5; w++) {
      const z0 = zc + 1.5 + w * 3.6, z1 = z0 + 2.6;
      if (w === 2) { // door
        ctx.fillStyle = '#c9bfc9'; quad(ctx, P(X, 0.3, z0 - 0.2), P(X, 2.5, z0 - 0.2), P(X, 2.5, z1 + 0.2), P(X, 0.3, z1 + 0.2)); ctx.fill();
        ctx.fillStyle = '#41355a'; quad(ctx, P(X, 1.5, z0 + 0.2), P(X, 2.3, z0 + 0.2), P(X, 2.3, z1 - 0.2), P(X, 1.5, z1 - 0.2)); ctx.fill();
        continue;
      }
      const a = P(X, 1.45, z0), b = P(X, 2.65, z0), c = P(X, 2.65, z1), d = P(X, 1.45, z1);
      const gr = ctx.createLinearGradient(0, b[1], 0, a[1]);
      gr.addColorStop(0, '#6c5aa8'); gr.addColorStop(0.6, '#f0a090'); gr.addColorStop(1, '#ffd8a0');
      ctx.fillStyle = gr; quad(ctx, a, b, c, d); ctx.fill();
      ctx.strokeStyle = '#5a4a66'; ctx.lineWidth = Math.max(1, 3 * C.f / (z0 - C.z) / 60); ctx.stroke();
    }
    const s0 = P(X, Y0, zc), s1 = P(X, Y1, zc);
    ctx.strokeStyle = '#8a7c90'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(s0[0], s0[1]); ctx.lineTo(s1[0], s1[1]); ctx.stroke();
  }
  // shadow under train
  ctx.fillStyle = 'rgba(40,24,60,0.6)'; quad(ctx, P(X, Y0, tz0), P(X, 0.0, tz0), P(X, 0, tz1), P(X, Y0, tz1)); ctx.fill();
  // canopy over the platform: underside + beams
  const RY = 4.4;
  ctx.fillStyle = '#4a3a62'; quad(ctx, P(-1.2, RY, 0.4), P(8, RY, 0.4), P(8, RY, 140), P(-1.2, RY, 140)); ctx.fill();
  ctx.fillStyle = '#ffb27a'; quad(ctx, P(-1.2, RY - 0.02, 0.4), P(-1.2, RY - 0.35, 0.4), P(-1.2, RY - 0.35, 140), P(-1.2, RY - 0.02, 140)); ctx.fill();
  for (let k = 0; k < 24; k++) {
    const z = k * 6 + 2 - (C.z % 6) + Math.floor(C.z / 6) * 6;
    if (z - C.z < 0.6 || z > 140) continue;
    const a = P(-1.2, RY - 0.3, z), b = P(8, RY - 0.3, z), c = P(8, RY, z), d = P(-1.2, RY, z);
    ctx.fillStyle = '#2f2444'; quad(ctx, a, b, c, d); ctx.fill();
    // lamp
    const L = P(1.5, RY - 0.5, z);
    const sz = 0.5 * C.f / (z - C.z);
    ctx.fillStyle = '#fff6dc'; ctx.fillRect(L[0] - sz, L[1] - sz * 0.15, sz * 2, sz * 0.3);
  }
  // pillars on the right
  for (let k = 0; k < 18; k++) {
    const z = k * 8 + 3 - (C.z % 8) + Math.floor(C.z / 8) * 8;
    if (z - C.z < 0.8 || z > 140) continue;
    const a = P(3.6, 0, z), b = P(3.6, RY, z), w = 0.35 * C.f / (z - C.z);
    ctx.fillStyle = '#5a4a72'; ctx.fillRect(a[0] - w / 2, b[1], w, a[1] - b[1]);
    ctx.fillStyle = '#ffbe8a'; ctx.fillRect(a[0] - w / 2, b[1], w * 0.28, a[1] - b[1]);
    ctx.strokeStyle = PAL.line; ctx.lineWidth = Math.max(1, w * 0.06); ctx.strokeRect(a[0] - w / 2, b[1], w, a[1] - b[1]);
  }
  // hanging sign with platform number
  const sz = 18;
  if (sz - C.z > 1) {
    const a = P(0.3, RY - 0.6, sz), b = P(2.7, RY - 1.2, sz);
    ctx.fillStyle = '#2f3f78'; ctx.fillRect(a[0], a[1], b[0] - a[0], b[1] - a[1]);
    ctx.fillStyle = '#fff'; ctx.font = `800 ${Math.abs(b[1] - a[1]) * 0.6}px 'Poppins'`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('JALUR 3', (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
  }
  if (clockAt) { const c = P(clockAt[0], clockAt[1], clockAt[2]); if (c[2] > 1) clock(ctx, c[0], c[1], 0.45 * C.f / c[2], 16, 59.9, { t }); }
  // haze toward the sun
  glow(ctx, sunX, sunY + 60, 900, '#ffb07a', 0.35);
  return C;
}
/** Side view of a train car with a sliding door at doorX (open 0..1). Platform floor below. */
export function trainSide(ctx, t, { x = 0, doorX = 540, open = 1, y = 1180, interior = true, light = 1, part = 'all' } = {}) {
  const top = y - 860, bot = y;
  ctx.save(); ctx.translate(x, 0);
  const dw = 300, gap = dw * open;
  const dTop = top + 70, dBot = bot - 10;
  if (part !== 'doors') {
  // body
  const body = new Path2D(); body.roundRect(-1400, top, 4000, bot - top, 40);
  cel(ctx, body, '#f4ece6', '#d9cdd6', (g) => g.fillRect(-1400, bot - 200, 4000, 200), 5);
  ctx.fillStyle = '#d8743f'; ctx.fillRect(-1400, bot - 300, 4000, 46);
  ctx.fillStyle = '#3d5f9e'; ctx.fillRect(-1400, bot - 246, 4000, 22);
  ctx.fillStyle = '#c9bfc9'; ctx.fillRect(-1400, top, 4000, 40);
  // windows
  for (let i = -3; i < 7; i++) {
    const wx = doorX + i * 420 - 210 + (i >= 0 ? 260 : -260) * 0;
    if (Math.abs(wx - doorX) < 300) continue;
    const w = new Path2D(); w.roundRect(wx - 150, top + 110, 300, 300, 24);
    const gr = ctx.createLinearGradient(0, top + 110, 0, top + 410);
    gr.addColorStop(0, '#5d4f9e'); gr.addColorStop(0.55, '#e8909a'); gr.addColorStop(1, '#ffcf95');
    ctx.fillStyle = gr; ctx.fill(w);
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.moveTo(wx - 120, top + 400); ctx.lineTo(wx - 40, top + 120); ctx.lineTo(wx, top + 120); ctx.lineTo(wx - 80, top + 400); ctx.fill();
    ctx.lineWidth = 5; ctx.strokeStyle = PAL.line; ctx.stroke(w);
  }
  if (interior && gap > 2) {
    ctx.fillStyle = '#ffe2a6'; ctx.fillRect(doorX - gap / 2, dTop, gap, dBot - dTop);
    ctx.fillStyle = '#f2b979'; ctx.fillRect(doorX - gap / 2, dBot - 120, gap, 120);
    ctx.fillStyle = 'rgba(120,80,60,0.25)'; ctx.fillRect(doorX - gap / 2, dTop, gap, 60);
    // pole
    ctx.fillStyle = '#c8c0d0'; ctx.fillRect(doorX - 6, dTop, 12, dBot - dTop);
  }
  }
  if (part !== 'body') for (const sd of [-1, 1]) {
    const px = sd < 0 ? doorX - gap / 2 - dw / 2 : doorX + gap / 2;
    const d = new Path2D(); d.rect(px, dTop, dw / 2, dBot - dTop);
    cel(ctx, d, '#e9e1e6', '#cfc3cf', (g) => g.fillRect(px, dBot - 160, dw / 2, 160), 5);
    const wi = new Path2D(); wi.roundRect(px + 22, dTop + 60, dw / 2 - 44, 300, 14);
    ctx.fillStyle = '#5d4f9e'; ctx.fill(wi); ctx.lineWidth = 4; ctx.strokeStyle = PAL.line; ctx.stroke(wi);
  }
  ctx.restore();
}
/** Moving landscape outside a window: far mountains, cumulus, trees, paddies, poles. speed in px/s at the nearest layer. */
export function landscape(ctx, t, { x = 0, y = 0, w = 1080, h = 1200, preset = 'golden', speed = 900, horizon = 0.55, sunX = 0.3, sunY = 0.5, clouds = true } = {}) {
  ctx.save(); ctx.translate(x, y);
  const S = SKIES[preset];
  const gr = ctx.createLinearGradient(0, 0, 0, h * horizon);
  for (const [o, c] of S.stops) gr.addColorStop(o, c);
  ctx.fillStyle = gr; ctx.fillRect(0, 0, w, h);
  const hy = h * horizon;
  if (clouds) {
    const off = -t * speed * 0.02;
    for (let i = 0; i < 3; i++) cloud(ctx, ((i * 520 + off) % 1560 + 1560) % 1560 - 240, hy + 20, 0.95 - i * 0.12, { seed: 11 + i, preset, sunDir: [-0.3, 0.9] });
  }
  glow(ctx, w * sunX, hy * sunY + hy * 0.5, 500, '#ffd090', 0.5);
  // far mountains
  const mtn = (par, base, amp, col, seed) => {
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, h);
    const off = t * speed * par;
    for (let px = 0; px <= w + 20; px += 20) { const u = (px + off) / 380; ctx.lineTo(px, base - amp * (0.6 + noise.fbm2(u, seed, 3) * 0.8)); }
    ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
  };
  mtn(0.03, hy + 10, 150, '#8a6fb2', 2);
  mtn(0.07, hy + 30, 70, '#6e5a98', 5);
  // tree line
  ctx.fillStyle = '#4d5a6e';
  const off2 = t * speed * 0.16;
  ctx.beginPath(); ctx.moveTo(0, h);
  for (let px = 0; px <= w + 20; px += 14) { const u = (px + off2) / 90; ctx.lineTo(px, hy + 60 - 30 * Math.abs(noise.n2(u, 3)) - 14 * Math.abs(Math.sin(u * 3))); }
  ctx.lineTo(w, h); ctx.fill();
  // paddies (stripes)
  const pg = ctx.createLinearGradient(0, hy + 50, 0, h);
  pg.addColorStop(0, '#c9a35a'); pg.addColorStop(0.3, '#9aa84e'); pg.addColorStop(1, '#5d7a3e');
  ctx.fillStyle = pg; ctx.fillRect(0, hy + 50, w, h - hy - 50);
  ctx.strokeStyle = 'rgba(255,214,150,0.5)'; ctx.lineWidth = 3;
  for (let i = 0; i < 9; i++) { const yy = hy + 60 + Math.pow(i / 9, 1.8) * (h - hy - 60); ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(w, yy); ctx.stroke(); }
  // water glints in paddies
  ctx.fillStyle = 'rgba(255,230,180,0.55)';
  for (let i = 0; i < 30; i++) { const yy = hy + 70 + hrand(i, 1) * (h - hy - 80); const k = (yy - hy) / (h - hy); const xx = ((hrand(i, 2) * w * 2 - t * speed * (0.2 + k)) % (w * 1.4) + w * 1.4) % (w * 1.4) - 100; ctx.fillRect(xx, yy, 40 + k * 140, 3 + k * 4); }
  // poles + wires whipping by
  const pp = 700, po = (t * speed) % pp;
  ctx.fillStyle = '#2f2640';
  for (let i = -1; i < 3; i++) { const px = w - (i * pp + po); ctx.fillRect(px, hy - 300, 18, h); ctx.fillRect(px - 50, hy - 280, 118, 10); }
  ctx.strokeStyle = 'rgba(40,30,60,0.8)'; ctx.lineWidth = 2;
  for (let k = 0; k < 2; k++) { ctx.beginPath(); for (let px = 0; px <= w; px += 20) { const u = ((w - px - po) % pp + pp) % pp / pp; ctx.lineTo(px, hy - 276 + k * 20 + Math.sin(u * Math.PI) * 26); } ctx.stroke(); }
  ctx.restore();
}
/** Village silhouette layer at dusk: palms, roofs, a mosque with dome and minaret, optional lit windows. */
export function village(ctx, t, { y = 1300, par = 0, col = '#2b1d3c', lit = true, mosqueX = 700, palms = true, scale = 1 } = {}) {
  ctx.save();
  ctx.fillStyle = col;
  const off = par;
  // houses
  for (let i = -2; i < 9; i++) {
    const x = ((i * 190 - off) % 1900 + 1900) % 1900 - 300, w = 150 + hrand(i, 1) * 60, h = 90 + hrand(i, 2) * 50;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - h); ctx.lineTo(x + w / 2, y - h - 70); ctx.lineTo(x + w, y - h); ctx.lineTo(x + w, y); ctx.fill();
    if (lit && hrand(i, 3) > 0.35) { ctx.fillStyle = `rgba(255,${190 + hrand(i, 4) * 50 | 0},110,${0.75 + 0.25 * Math.sin(t * 3 + i)})`; ctx.fillRect(x + w * 0.3, y - h * 0.65, 26, 30); ctx.fillStyle = col; }
  }
  // mosque
  const mx = mosqueX - off * 0.6;
  ctx.fillRect(mx - 130, y - 160, 260, 160);
  ctx.beginPath(); ctx.arc(mx, y - 160, 100, Math.PI, 0); ctx.fill();
  ctx.beginPath(); ctx.moveTo(mx, y - 300); ctx.lineTo(mx - 8, y - 260); ctx.lineTo(mx + 8, y - 260); ctx.fill();
  ctx.fillRect(mx + 170, y - 420, 46, 420); ctx.beginPath(); ctx.moveTo(mx + 160, y - 420); ctx.lineTo(mx + 193, y - 490); ctx.lineTo(mx + 226, y - 420); ctx.fill();
  ctx.beginPath(); ctx.arc(mx + 193, y - 500, 9, 0, TAU); ctx.fill();
  if (lit) {
    ctx.fillStyle = '#ffd98a';
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.roundRect(mx - 100 + i * 56, y - 120, 30, 70, [15, 15, 0, 0]); ctx.fill(); }
    ctx.fillRect(mx + 182, y - 400, 24, 10);
    glow(ctx, mx, y - 90, 260, '#ffc070', 0.35);
  }
  // palms
  if (palms) for (let i = -1; i < 6; i++) {
    const px = ((i * 330 + 90 - off * 1.2) % 2310 + 2310) % 2310 - 300;
    palm(ctx, px, y + 10, (0.9 + hrand(i, 6) * 0.5) * scale, t + i, col);
  }
  ctx.restore();
}
export function palm(ctx, x, y, s, t, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col; ctx.strokeStyle = col;
  ctx.lineCap = 'round';
  ctx.lineWidth = 22; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(30, -260, 10, -520); ctx.stroke();
  for (let i = 0; i < 8; i++) {
    const a = -Math.PI / 2 + (i / 7 - 0.5) * 3.2 + Math.sin(t * 1.4 + i) * 0.05;
    const L = 210 + (i % 2) * 40;
    ctx.beginPath(); ctx.moveTo(10, -520);
    const ex = 10 + Math.cos(a) * L, ey = -520 + Math.sin(a) * L * 0.6 + 70;
    ctx.quadraticCurveTo(10 + Math.cos(a) * L * 0.5, -560 + Math.sin(a) * L * 0.4, ex, ey);
    ctx.quadraticCurveTo(10 + Math.cos(a) * L * 0.5, -540 + Math.sin(a) * L * 0.4, 10, -505); ctx.fill();
  }
  ctx.restore();
}
/** Bamboo torch (obor) with flickering flame and glow. */
export function obor(ctx, x, y, t, s = 1, seed = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#3a2a1e'; ctx.fillRect(-7, -10, 14, 230);
  const f = 1 + noise.n2(t * 6, seed) * 0.25;
  glow(ctx, 0, -40, 160 * f, '#ffb050', 0.6);
  ctx.fillStyle = '#ff9a3a'; ctx.beginPath(); ctx.moveTo(0, -80 * f); ctx.quadraticCurveTo(26, -20, 0, 0); ctx.quadraticCurveTo(-26, -20, 0, -80 * f); ctx.fill();
  ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.moveTo(0, -46 * f); ctx.quadraticCurveTo(12, -12, 0, 0); ctx.quadraticCurveTo(-12, -12, 0, -46 * f); ctx.fill();
  ctx.restore();
}
/** Crescent moon (hilal) with soft glow. */
export function crescent(ctx, x, y, r, { rot = -0.5, alpha = 1 } = {}) {
  glow(ctx, x, y, r * 5, '#fff2c8', 0.4 * alpha);
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = '#fff6da'; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.arc(r * 0.42, -r * 0.1, r * 0.86, 0, TAU, true); ctx.fill('evenodd');
  ctx.restore();
}
/** Village house front (wooden, warm lit doorway). doorOpen 0..1. Returns door centre. */
export function house(ctx, x, y, s, { t = 0, lit = 1 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const lw = 5;
  const wall = new Path2D(); wall.rect(-420, -620, 840, 620);
  cel(ctx, wall, '#a8684a', '#7c4636', (g) => g.fillRect(-420, -620, 840, 120), lw);
  ctx.strokeStyle = 'rgba(60,30,30,0.35)'; ctx.lineWidth = 3;
  for (let i = 1; i < 12; i++) { ctx.beginPath(); ctx.moveTo(-420, -620 + i * 52); ctx.lineTo(420, -620 + i * 52); ctx.stroke(); }
  const roof = new Path2D(); roof.moveTo(-560, -600); roof.lineTo(0, -940); roof.lineTo(560, -600); roof.lineTo(500, -560); roof.lineTo(0, -860); roof.lineTo(-500, -560); roof.closePath();
  cel(ctx, roof, '#7a3b3a', '#4f2430', (g) => g.fillRect(0, -1000, 600, 500), lw);
  const tri = new Path2D(); tri.moveTo(-500, -560); tri.lineTo(0, -860); tri.lineTo(500, -560); tri.closePath();
  cel(ctx, tri, '#8a5240', '#6a3a30', null, lw);
  // door
  const door = new Path2D(); door.rect(-110, -470, 220, 470);
  ctx.fillStyle = `rgb(${255},${200 + lit * 30 | 0},${120 + lit * 40 | 0})`; ctx.fill(door);
  ctx.fillStyle = 'rgba(200,120,60,0.35)'; ctx.fillRect(-110, -470, 220, 80);
  ctx.lineWidth = lw; ctx.strokeStyle = PAL.line; ctx.stroke(door);
  // windows lit
  for (const sd of [-1, 1]) {
    const w = new Path2D(); w.rect(sd * 280 - 70, -430, 140, 150);
    ctx.fillStyle = '#ffd78a'; ctx.fill(w); ctx.stroke(w);
    ctx.beginPath(); ctx.moveTo(sd * 280, -430); ctx.lineTo(sd * 280, -280); ctx.moveTo(sd * 280 - 70, -355); ctx.lineTo(sd * 280 + 70, -355); ctx.stroke();
  }
  // steps
  const st = new Path2D(); st.rect(-200, 0, 400, 50); cel(ctx, st, '#8a7a7a', '#5a4a5a', (g) => g.fillRect(-200, 30, 400, 20), lw);
  // ketupat hanging
  for (const sd of [-1, 1]) {
    const kx = sd * 170, ky = -500 + Math.sin(t * 2 + sd) * 4;
    ctx.strokeStyle = PAL.line; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(kx, -560); ctx.lineTo(kx, ky - 30); ctx.stroke();
    const k = new Path2D(); k.moveTo(kx, ky - 34); k.lineTo(kx + 30, ky); k.lineTo(kx, ky + 34); k.lineTo(kx - 30, ky); k.closePath();
    cel(ctx, k, '#9ccf5a', '#6a9a3a', (g) => { g.beginPath(); g.moveTo(kx, ky - 34); g.lineTo(kx, ky + 34); g.lineTo(kx + 30, ky); g.fill(); }, 3);
    ctx.beginPath(); ctx.moveTo(kx - 15, ky - 17); ctx.lineTo(kx + 15, ky + 17); ctx.moveTo(kx + 15, ky - 17); ctx.lineTo(kx - 15, ky + 17); ctx.stroke();
  }
  ctx.restore();
  glow(ctx, x, y - 240 * s, 420 * s, '#ffc070', 0.45 * lit);
}

// ======================================================================= text & transitions
/** Anime character intro card: name big, thin rules, small caption; slides in. */
export function nameCard(ctx, name, sub, x, y, { alpha = 1, k = 1, size = 96, align = 'left', col = '#ffffff', accent = '#ffcf7a' } = {}) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha;
  const dx = (1 - ease.outCubic(k)) * (align === 'left' ? -80 : 80);
  ctx.translate(x + dx, y);
  ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  ctx.font = `800 ${size}px 'Poppins'`; ctx.letterSpacing = '8px';
  ctx.shadowColor = 'rgba(30,10,40,0.55)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 4;
  ctx.fillStyle = col; ctx.fillText(name, 0, 0);
  const w = ctx.measureText(name).width;
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.fillStyle = accent; const sx = align === 'left' ? 0 : -w;
  ctx.fillRect(sx, 22, w * ease.outCubic(k), 5);
  if (sub) { ctx.font = `600 ${size * 0.32}px 'Poppins'`; ctx.letterSpacing = '4px'; ctx.fillStyle = col; ctx.shadowColor = 'rgba(30,10,40,0.7)'; ctx.shadowBlur = 10; ctx.fillText(sub, 0, 22 + size * 0.48); }
  ctx.restore();
}
/** Elegant film title (serif) with a thin glow. */
export function filmTitle(ctx, text, x, y, { size = 110, alpha = 1, sub = null, col = '#fffaf0', font = 'DM Serif Display', spacing = 4 } = {}) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `400 ${size}px '${font}'`; ctx.letterSpacing = spacing + 'px';
  ctx.shadowColor = 'rgba(255,200,140,0.9)'; ctx.shadowBlur = size * 0.35;
  ctx.fillStyle = col; ctx.fillText(text, x, y);
  ctx.shadowColor = 'rgba(20,10,40,0.6)'; ctx.shadowBlur = 12; ctx.fillText(text, x, y);
  if (sub) { ctx.shadowBlur = 8; ctx.font = `600 ${size * 0.26}px 'Poppins'`; ctx.letterSpacing = '10px'; ctx.fillText(sub, x, y + size * 0.85); }
  ctx.restore();
}
/** Quote / spoken line in a soft rounded box (for remembered dialogue). */
export function quoteBox(ctx, text, x, y, { alpha = 1, size = 54, maxW = 860, col = '#ffffff', bg = 'rgba(30,18,50,0.55)' } = {}) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.font = `italic 400 ${size}px 'Noto Serif'`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const words = text.split(' '), lines = []; let cur = '';
  for (const w of words) { const tt = cur ? cur + ' ' + w : w; if (ctx.measureText(tt).width > maxW && cur) { lines.push(cur); cur = w; } else cur = tt; }
  lines.push(cur);
  const lh = size * 1.3, bw = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 80, bh = lines.length * lh + 50;
  ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(x - bw / 2, y - bh / 2, bw, bh, 30); ctx.fill();
  ctx.fillStyle = col; lines.forEach((l, i) => ctx.fillText(l, x, y - bh / 2 + 25 + lh * (i + 0.5)));
  ctx.restore();
}
/** Soft light leak (for flashbacks / transitions): warm blobs drifting, additive. */
export function lightLeak(ctx, t, alpha = 0.5) {
  glow(ctx, 120 + Math.sin(t * 0.7) * 120, 300 + Math.cos(t * 0.5) * 200, 700, '#ffb070', alpha);
  glow(ctx, 980 + Math.cos(t * 0.6) * 100, 1500 + Math.sin(t * 0.4) * 200, 800, '#ff8aa0', alpha * 0.7);
}
/** Film letterbox-ish soft white vignette for memories. */
export function memoryFrame(ctx, alpha = 1) {
  const v = cached('an-memv', () => {
    const c = makeCanvas(270, 480), g = c.getContext('2d');
    const gr = g.createRadialGradient(135, 240, 90, 135, 240, 300);
    gr.addColorStop(0, 'rgba(255,248,236,0)'); gr.addColorStop(0.7, 'rgba(255,248,236,0.55)'); gr.addColorStop(1, 'rgba(255,248,236,0.95)');
    g.fillStyle = gr; g.fillRect(0, 0, 270, 480); return c;
  });
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = alpha; ctx.drawImage(v, 0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore();
}
export { clamp, lerp, ease, hrand, noise, TAU, mixHex };
