// Maura Motion 2D drawing helpers shared by every style kit.
import { clamp, lerp, hrand, mulberry32, noise, TAU, rgba } from './core.js';

export function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

export function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const _cache = new Map();
/** Cached builder: build once per key, reuse every frame. */
export function cached(key, build) {
  if (!_cache.has(key)) _cache.set(key, build());
  return _cache.get(key);
}

/** Paper/canvas texture with fibres and blotches. Returns an offscreen canvas. */
export function paperTexture(w, h, { base = '#efe6d2', fiber = 0.06, blotch = 0.05, seed = 3, grainAmt = 18 } = {}) {
  return cached(`paper:${w}:${h}:${base}:${fiber}:${blotch}:${seed}:${grainAmt}`, () => {
    const c = makeCanvas(w, h), g = c.getContext('2d');
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    const r = mulberry32(seed);
    // soft blotches
    for (let i = 0; i < 60; i++) {
      const x = r() * w, y = r() * h, rad = 80 + r() * 380;
      const gr = g.createRadialGradient(x, y, 0, x, y, rad);
      const dark = r() < 0.5;
      gr.addColorStop(0, dark ? `rgba(90,60,20,${blotch * r()})` : `rgba(255,255,255,${blotch * r()})`);
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    // fibres
    g.lineWidth = 1;
    for (let i = 0; i < 2200; i++) {
      const x = r() * w, y = r() * h, len = 6 + r() * 26, a = r() * TAU;
      g.strokeStyle = r() < 0.5 ? `rgba(80,60,30,${fiber * r()})` : `rgba(255,255,255,${fiber * 1.4 * r()})`;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * len * 0.5 + (r() - 0.5) * 6, y + Math.sin(a) * len * 0.5, x + Math.cos(a) * len, y + Math.sin(a) * len); g.stroke();
    }
    // grain
    const id = g.getImageData(0, 0, w, h), d = id.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (r() - 0.5) * grainAmt;
      d[i] += n; d[i + 1] += n; d[i + 2] += n;
    }
    g.putImageData(id, 0, 0);
    return c;
  });
}

/** Animated film grain: pre-baked alpha-noise tiles (light and dark specks) drawn with plain source-over,
 *  which is several times cheaper than an 'overlay' blend on a CPU. */
export function grain(ctx, t, { amount = 0.08, fps = 24, size = 256, blend = 'source-over' } = {}) {
  const tiles = cached(`grain2:${size}`, () => {
    const arr = [];
    for (let k = 0; k < 6; k++) {
      const c = makeCanvas(size, size), g = c.getContext('2d');
      const id = g.createImageData(size, size), d = id.data, r = mulberry32(100 + k);
      for (let i = 0; i < d.length; i += 4) {
        const n = (r() + r() + r()) / 3 - 0.5; // ~gaussian
        const v = n > 0 ? 255 : 0;
        d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = Math.min(255, Math.abs(n) * 2 * 255 * 1.6);
      }
      g.putImageData(id, 0, 0); arr.push(c);
    }
    return arr;
  });
  const f = Math.floor(t * fps);
  const tile = tiles[f % tiles.length];
  const W = ctx.canvas.width, H = ctx.canvas.height;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = amount * 1.6; ctx.globalCompositeOperation = blend;
  const ox = Math.floor(hrand(f, 1) * size), oy = Math.floor(hrand(f, 2) * size);
  for (let y = -oy; y < H; y += size) for (let x = -ox; x < W; x += size) ctx.drawImage(tile, x, y);
  ctx.restore();
}

/** Cached radial vignette (one drawImage per frame instead of a full-screen gradient). */
export function vignette(ctx, { strength = 0.5, color = '0,0,0', inner = 0.45, outer = 0.95 } = {}) {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  const v = cached(`vig:${W}x${H}:${strength}:${color}:${inner}:${outer}`, () => {
    const c = makeCanvas(Math.ceil(W / 4), Math.ceil(H / 4)), g = c.getContext('2d');
    const w = c.width, h = c.height;
    const gr = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * inner * 0.5, w / 2, h / 2, Math.max(w, h) * outer * 0.6);
    gr.addColorStop(0, `rgba(${color},0)`); gr.addColorStop(1, `rgba(${color},${strength})`);
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    return c;
  });
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(v, 0, 0, W, H); ctx.restore();
}

/** Turn a mid-grey texture into light/dark specks with alpha, so it can be laid over anything with source-over. */
export function alphaTexture(src, strength = 1) {
  return cached('atex:' + src.width + ':' + src.height + ':' + strength + ':' + (src.__id || (src.__id = Math.random())), () => {
    const c = makeCanvas(src.width, src.height), g = c.getContext('2d');
    g.drawImage(src, 0, 0);
    const id = g.getImageData(0, 0, c.width, c.height), d = id.data;
    for (let i = 0; i < d.length; i += 4) {
      const l = (d[i] + d[i + 1] + d[i + 2]) / 3 - 128;
      const v = l > 0 ? 255 : 0;
      d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = Math.min(255, Math.abs(l) * 2 * strength);
    }
    g.putImageData(id, 0, 0);
    return c;
  });
}

/** Hand-drawn wobble applied to a polyline. `seed` + time-quantised jitter = line boil. */
export function wobblyPath(ctx, pts, { amp = 2, seed = 0, t = 0, fps = 12, closed = false } = {}) {
  const f = Math.floor(t * fps);
  ctx.beginPath();
  pts.forEach(([x, y], i) => {
    const jx = (hrand(i, seed, f) - 0.5) * 2 * amp, jy = (hrand(i, seed + 9, f) - 0.5) * 2 * amp;
    if (i === 0) ctx.moveTo(x + jx, y + jy); else ctx.lineTo(x + jx, y + jy);
  });
  if (closed) ctx.closePath();
}

/** Sketchy line (rough.js-like): two slightly different passes. */
export function roughLine(ctx, x1, y1, x2, y2, { amp = 2.5, seed = 1, t = 0, fps = 12, passes = 2 } = {}) {
  const f = Math.floor(t * fps);
  for (let p = 0; p < passes; p++) {
    const r = (k) => (hrand(seed, p, k, f) - 0.5) * 2 * amp;
    const mx = lerp(x1, x2, 0.5) + r(1) * 1.5, my = lerp(y1, y2, 0.5) + r(2) * 1.5;
    ctx.beginPath();
    ctx.moveTo(x1 + r(3), y1 + r(4));
    ctx.quadraticCurveTo(mx, my, x2 + r(5), y2 + r(6));
    ctx.stroke();
  }
}
export function roughRect(ctx, x, y, w, h, o = {}) {
  roughLine(ctx, x, y, x + w, y, { ...o, seed: (o.seed || 1) + 1 });
  roughLine(ctx, x + w, y, x + w, y + h, { ...o, seed: (o.seed || 1) + 2 });
  roughLine(ctx, x + w, y + h, x, y + h, { ...o, seed: (o.seed || 1) + 3 });
  roughLine(ctx, x, y + h, x, y, { ...o, seed: (o.seed || 1) + 4 });
}
export function roughCircle(ctx, cx, cy, r, { amp = 2.5, seed = 1, t = 0, fps = 12, passes = 2, steps = 36 } = {}) {
  const f = Math.floor(t * fps);
  for (let p = 0; p < passes; p++) {
    ctx.beginPath();
    const start = hrand(seed, p, f) * TAU, extra = 0.25 + hrand(seed, p, f, 2) * 0.3;
    for (let i = 0; i <= steps; i++) {
      const a = start + (i / steps) * (TAU + extra);
      const rr = r + (noise.n2(Math.cos(a) * 1.3 + seed + p * 7, Math.sin(a) * 1.3 + f * 0.37) * amp * 1.6);
      const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

/** Organic blob (cut paper, clay, leaves). */
export function blob(ctx, cx, cy, r, { seed = 1, wobble = 0.18, t = 0, speed = 0, points = 48, sx = 1, sy = 1 } = {}) {
  ctx.beginPath();
  for (let i = 0; i <= points; i++) {
    const a = (i / points) * TAU;
    const n = noise.n3(Math.cos(a) * 0.9 + seed * 3.1, Math.sin(a) * 0.9 + seed * 1.7, t * speed);
    const rr = r * (1 + n * wobble);
    const x = cx + Math.cos(a) * rr * sx, y = cy + Math.sin(a) * rr * sy;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/** Painterly brush stroke made of many thin bristle lines along a quadratic path. */
export function brushStroke(ctx, x1, y1, x2, y2, { width = 30, color = '#335', seed = 1, bristles = 14, alpha = 0.85, bend = 0.15, dry = 0.25 } = {}) {
  const r = mulberry32(seed);
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const cx = (x1 + x2) / 2 + nx * len * bend * (r() - 0.5) * 2, cy = (y1 + y2) / 2 + ny * len * bend * (r() - 0.5) * 2;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = color;
  for (let b = 0; b < bristles; b++) {
    const off = (b / (bristles - 1) - 0.5) * width;
    const w = (width / bristles) * (1.2 + r() * 1.6);
    const s0 = r() * dry * 0.5, s1 = 1 - r() * dry * 0.6;
    ctx.globalAlpha = alpha * (0.45 + r() * 0.55);
    ctx.lineWidth = w;
    ctx.beginPath();
    const p = (u) => {
      const ix = (1 - u) * (1 - u) * x1 + 2 * (1 - u) * u * cx + u * u * x2;
      const iy = (1 - u) * (1 - u) * y1 + 2 * (1 - u) * u * cy + u * u * y2;
      const taper = Math.sin(Math.PI * clamp(u)) * 0.35 + 0.65;
      return [ix + nx * off * taper, iy + ny * off * taper];
    };
    const [ax, ay] = p(s0); ctx.moveTo(ax, ay);
    for (let k = 1; k <= 8; k++) { const [px, py] = p(lerp(s0, s1, k / 8)); ctx.lineTo(px, py); }
    ctx.stroke();
  }
  ctx.restore();
}

/** Text with optional stroke, shadow and letter spacing. */
export function text(ctx, str, x, y, { font = 'Poppins', size = 64, weight = 700, color = '#fff', align = 'center', baseline = 'middle', stroke = 0, strokeColor = '#000', shadow = null, spacing = 0, alpha = 1, maxWidth = null } = {}) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.font = `${weight} ${size}px '${font}'`;
  ctx.textAlign = align; ctx.textBaseline = baseline;
  if (spacing) ctx.letterSpacing = `${spacing}px`;
  if (maxWidth) { const w = ctx.measureText(str).width; if (w > maxWidth) { const s = maxWidth / w; ctx.translate(x, y); ctx.scale(s, s); x = 0; y = 0; } }
  if (shadow) { ctx.shadowColor = shadow.color || 'rgba(0,0,0,.5)'; ctx.shadowBlur = shadow.blur ?? 12; ctx.shadowOffsetX = shadow.x ?? 0; ctx.shadowOffsetY = shadow.y ?? 4; }
  if (stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = stroke; ctx.strokeStyle = strokeColor; ctx.strokeText(str, x, y); ctx.shadowColor = 'transparent'; }
  ctx.fillStyle = color; ctx.fillText(str, x, y);
  ctx.restore();
}

/** Word-wrap into lines no wider than maxW. */
export function wrap(ctx, str, maxW) {
  const words = str.split(/\s+/), lines = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; } else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

/** Radial speed lines / emphasis burst (manga, cartoon). */
export function speedLines(ctx, cx, cy, { count = 60, inner = 300, outer = 1400, color = '#000', width = 6, seed = 1, t = 0, fps = 12 } = {}) {
  const f = Math.floor(t * fps);
  ctx.save(); ctx.fillStyle = color;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * TAU + (hrand(i, seed, f) - 0.5) * 0.08;
    const r0 = inner * (0.8 + hrand(i, seed + 1, f) * 0.5);
    const w = width * (0.4 + hrand(i, seed + 2, f));
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer);
    ctx.lineTo(cx + Math.cos(a + w / outer) * r0, cy + Math.sin(a + w / outer) * r0);
    ctx.lineTo(cx + Math.cos(a - w / outer) * r0, cy + Math.sin(a - w / outer) * r0);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

/** Draw image/canvas with "cover" fit into a rect. */
export function drawCover(ctx, img, x, y, w, h) {
  const iw = img.width, ih = img.height, s = Math.max(w / iw, h / ih);
  const dw = iw * s, dh = ih * s;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

/** Camera helper for 2D scenes: zoom/pan/rotate about a focus point. */
export function camera(ctx, { x = 540, y = 960, zoom = 1, rot = 0, W = 1080, H = 1920 } = {}) {
  ctx.translate(W / 2, H / 2);
  ctx.rotate(rot);
  ctx.scale(zoom, zoom);
  ctx.translate(-x, -y);
}

export function shakeOffset(t, amp = 10, seed = 0, fps = 30) {
  const f = Math.floor(t * fps);
  return [(hrand(f, seed) - 0.5) * 2 * amp, (hrand(f, seed + 1) - 0.5) * 2 * amp];
}

export { rgba };
