// AniMasters style kit: SYNTHWAVE NEON (1980s retro-future).
// Black-purple sky, striped magenta-orange sun, neon grid floor scrolling to the horizon, wireframe mountains,
// chrome type, neon line art (drummer, drum kit, mic, rack gear) and audio graphics (VU meters, oscilloscope
// waveforms cut by a gate). Glow is cheap: every neon path is stroked 3 times (wide/faint -> thin/bright),
// halos are cached radial sprites, chrome titles are cached canvases. No full-screen blend modes.
import { clamp, lerp, ease, hrand, noise, TAU } from '/engine/lib/core.js';
import { makeCanvas, cached } from '/engine/lib/draw.js';

export const PAL = {
  ink: '#07020f', sky0: '#05010d', sky1: '#1a0633', sky2: '#4a0d5e', sky3: '#a3196f', haze: '#ff3d8b',
  cyan: '#22e6ff', mag: '#ff2bd6', pink: '#ff5fa2', orange: '#ff8a3d', yellow: '#ffe066', white: '#f4f6ff', violet: '#8a5cff', red: '#ff3355', green: '#3dff9a',
};
export const HZ = 980; // horizon y

// ---------------- neon stroke ----------------
/** Stroke the current path as neon: halo + glow + core. */
export function neon(g, color = PAL.cyan, w = 3, { core = '#ffffff', alpha = 1, halo = 1 } = {}) {
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = color;
  if (halo > 0) { g.globalAlpha = 0.12 * alpha * halo; g.lineWidth = w * 6; g.stroke(); }
  g.globalAlpha = 0.35 * alpha; g.lineWidth = w * 2.6; g.stroke();
  g.globalAlpha = alpha; g.lineWidth = w; g.stroke();
  g.strokeStyle = core; g.globalAlpha = 0.75 * alpha; g.lineWidth = Math.max(1, w * 0.35); g.stroke();
  g.restore();
}
/** Cached soft radial glow sprite stamped at (x,y) with radius r. */
export function glow(g, x, y, r, color = PAL.mag, alpha = 1) {
  const s = cached('glow:' + color, () => {
    const c = makeCanvas(128, 128), x2 = c.getContext('2d'), gr = x2.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, color); gr.addColorStop(0.25, color + 'aa'); gr.addColorStop(0.6, color + '22'); gr.addColorStop(1, color + '00');
    x2.fillStyle = gr; x2.fillRect(0, 0, 128, 128); return c;
  });
  g.save(); g.globalAlpha = alpha; g.drawImage(s, x - r, y - r, r * 2, r * 2); g.restore();
}

// ---------------- world ----------------
/** Sky gradient + stars (cached) */
export function sky(g, t, { hz = HZ } = {}) {
  const c = cached('sw-sky:' + hz, () => {
    const o = makeCanvas(270, 480), x = o.getContext('2d'), gr = x.createLinearGradient(0, 0, 0, hz / 4);
    gr.addColorStop(0, PAL.sky0); gr.addColorStop(0.45, PAL.sky1); gr.addColorStop(0.8, PAL.sky2); gr.addColorStop(1, PAL.sky3);
    x.fillStyle = gr; x.fillRect(0, 0, 270, hz / 4 + 1);
    return o;
  });
  g.drawImage(c, 0, 0, 270, hz / 4 + 1, 0, 0, 1080, hz + 4);
  // stars (twinkle)
  g.fillStyle = PAL.white;
  for (let i = 0; i < 90; i++) {
    const x = hrand(i, 1) * 1080, y = hrand(i, 2) * hz * 0.7, tw = 0.4 + 0.6 * Math.abs(Math.sin(t * (1 + hrand(i, 3) * 3) + i));
    g.globalAlpha = tw * (0.4 + hrand(i, 4) * 0.6); g.fillRect(x, y, i % 9 === 0 ? 3 : 2, i % 9 === 0 ? 3 : 2);
  }
  g.globalAlpha = 1;
}
/** Striped retro sun. y = centre, stripes scroll upward. */
export function sun(g, t, { x = 540, y = HZ - 150, r = 290, alpha = 1, pulse = 0 } = {}) {
  glow(g, x, y, r * (2.1 + pulse * 0.4), PAL.mag, 0.55 * alpha);
  const S = 600, c = cached('sw-suncv', () => makeCanvas(S, S)), s = c.getContext('2d');
  s.setTransform(1, 0, 0, 1, 0, 0); s.globalCompositeOperation = 'source-over'; s.clearRect(0, 0, S, S);
  const gr = s.createLinearGradient(0, 0, 0, S);
  gr.addColorStop(0, PAL.yellow); gr.addColorStop(0.45, PAL.orange); gr.addColorStop(0.8, PAL.mag); gr.addColorStop(1, '#a3107a');
  s.fillStyle = gr; s.beginPath(); s.arc(S / 2, S / 2, S / 2 - 2, 0, TAU); s.fill();
  s.globalCompositeOperation = 'destination-out';
  const ph = (t * 18) % 60;
  for (let k = 0; k < 12; k++) {
    const yy = S * 0.42 + k * 32 - ph * 0.53;
    if (yy < S * 0.4) continue;
    const h = 3 + (yy - S * 0.4) / S * 30;
    s.fillRect(0, yy, S, h);
  }
  g.save(); g.globalAlpha = alpha; g.drawImage(c, x - r, y - r, r * 2, r * 2); g.restore();
}
/** Wireframe mountain range on the horizon (dark fill, neon edge). */
export function mountains(g, t, { hz = HZ, color = PAL.mag, seed = 4, shift = 0 } = {}) {
  const pts = [];
  for (let i = 0; i <= 24; i++) {
    const x = i / 24 * 1180 - 50 - shift, edge = Math.min(1, Math.abs(i - 12) / 7);
    const h = (40 + hrand(i, seed) * 150) * edge * (i % 2 ? 1 : 0.55);
    pts.push([x, hz - h]);
  }
  g.beginPath(); g.moveTo(-60, hz); pts.forEach(([x, y]) => g.lineTo(x, y)); g.lineTo(1140, hz); g.closePath();
  g.fillStyle = '#12021f'; g.fill();
  g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); neon(g, color, 2.2, { halo: 0.6 });
  // inner ridge lines
  g.beginPath(); pts.forEach(([x, y], i) => { if (i % 2) { g.moveTo(x, y); g.lineTo(x + 30, hz); } }); neon(g, color, 1.2, { alpha: 0.45, halo: 0 });
}
/** Perspective neon grid floor scrolling toward the camera. speed in rows per second. */
export function grid(g, t, { hz = HZ, speed = 1.2, color = PAL.cyan, color2 = PAL.mag, bend = 0, pulse = 0 } = {}) {
  const fl = cached('sw-floor:' + hz, () => {
    const o = makeCanvas(8, 240), x = o.getContext('2d'), gr = x.createLinearGradient(0, 0, 0, 240);
    gr.addColorStop(0, '#3a0a4f'); gr.addColorStop(0.15, '#14031f'); gr.addColorStop(1, '#05010a');
    x.fillStyle = gr; x.fillRect(0, 0, 8, 240); return o;
  });
  g.drawImage(fl, 0, hz, 1080, 1920 - hz);
  const H = 1920 - hz, vx = 540 + bend;
  // verticals
  g.beginPath();
  for (let i = -14; i <= 14; i++) { const xb = 540 + i * 170; g.moveTo(vx + i * 6, hz); g.lineTo(xb, 1920 + 40); }
  neon(g, color2, 2.4, { alpha: 0.85 + pulse * 0.15, halo: 0.5 });
  // horizontals (z scrolling)
  g.beginPath();
  const ph = (t * speed) % 1;
  for (let k = 0; k < 16; k++) {
    const z = (k + 1 - ph);
    const y = hz + H * (0.9 / z) * 0.35 + (k === 0 ? 0 : 0);
    if (y > 1960 || y < hz + 2) continue;
    g.moveTo(0, y); g.lineTo(1080, y);
  }
  neon(g, color, 2.2, { alpha: 0.9 + pulse * 0.1, halo: 0.5 });
  // horizon line
  g.beginPath(); g.moveTo(0, hz); g.lineTo(1080, hz); neon(g, PAL.pink, 3, { halo: 1 });
}

// ---------------- type ----------------
/** Cached chrome title (80s chrome gradient, dark outline, neon rim). Returns canvas. */
export function chromeText(str, { size = 180, font = 'Bebas Neue', italic = true, rim = PAL.mag, spacing = 6 } = {}) {
  return cached(`chrome:${str}:${size}:${font}:${rim}`, () => {
    const m = makeCanvas(10, 10).getContext('2d');
    m.font = `${italic ? 'italic ' : ''}700 ${size}px '${font}'`; m.letterSpacing = spacing + 'px';
    const w = Math.ceil(m.measureText(str).width + size * 0.6), h = Math.ceil(size * 1.5);
    const c = makeCanvas(w, h), g = c.getContext('2d');
    g.font = m.font; g.letterSpacing = spacing + 'px'; g.textAlign = 'center'; g.textBaseline = 'middle';
    const cx = w / 2, cy = h / 2;
    g.save(); g.shadowColor = rim; g.shadowBlur = size * 0.22; g.lineJoin = 'round'; g.lineWidth = size * 0.07; g.strokeStyle = rim; g.strokeText(str, cx, cy); g.restore();
    g.lineJoin = 'round'; g.lineWidth = size * 0.05; g.strokeStyle = '#1a0630'; g.strokeText(str, cx, cy);
    const gr = g.createLinearGradient(0, cy - size * 0.42, 0, cy + size * 0.42);
    gr.addColorStop(0, '#2b6fff'); gr.addColorStop(0.3, '#cfe9ff'); gr.addColorStop(0.49, '#ffffff'); gr.addColorStop(0.5, '#3a1d3f'); gr.addColorStop(0.62, '#b0466e'); gr.addColorStop(0.85, '#ffd1a1'); gr.addColorStop(1, '#ffffff');
    g.fillStyle = gr; g.fillText(str, cx, cy);
    g.globalAlpha = 0.9; g.lineWidth = 2; g.strokeStyle = '#ffffff'; g.strokeText(str, cx, cy - 1);
    return c;
  });
}
export function chrome(g, str, x, y, { size = 180, alpha = 1, scale = 1, font, rim, italic, spacing } = {}) {
  const c = chromeText(str, { size, font, rim, italic, spacing });
  g.save(); g.globalAlpha = alpha; g.translate(x, y); g.scale(scale, scale); g.drawImage(c, -c.width / 2, -c.height / 2); g.restore();
}
/** Cached neon sign text (Orbitron/Bebas) with glow. */
export function neonText(g, str, x, y, { size = 64, color = PAL.cyan, font = 'Orbitron', alpha = 1, align = 'center', weight = 700, flicker = 0, t = 0 } = {}) {
  const c = cached(`ntxt:${str}:${size}:${color}:${font}:${weight}`, () => {
    const m = makeCanvas(10, 10).getContext('2d'); m.font = `${weight} ${size}px '${font}'`;
    const w = Math.ceil(m.measureText(str).width + size), h = Math.ceil(size * 1.8);
    const o = makeCanvas(w, h), g2 = o.getContext('2d');
    g2.font = m.font; g2.textAlign = 'center'; g2.textBaseline = 'middle';
    g2.shadowColor = color; g2.shadowBlur = size * 0.5; g2.fillStyle = color; g2.fillText(str, w / 2, h / 2);
    g2.shadowBlur = size * 0.15; g2.fillText(str, w / 2, h / 2);
    g2.shadowBlur = 0; g2.fillStyle = '#ffffff'; g2.globalAlpha = 0.85; g2.fillText(str, w / 2, h / 2);
    return o;
  });
  let a = alpha;
  if (flicker && hrand(Math.floor(t * 20), str.length) < flicker) a *= 0.35;
  g.save(); g.globalAlpha = a; g.drawImage(c, align === 'center' ? x - c.width / 2 : align === 'left' ? x - c.height * 0.28 : x - c.width + c.height * 0.28, y - c.height / 2); g.restore();
}

// ---------------- line art ----------------
/** Neon drum kit + drummer. hit: {snare, tom1, tom2, floor, kick} values 0..1 (1 = just hit). arms posed from hits. */
export function drummer(g, x, y, s, t, { hits = {}, color = PAL.cyan, kitColor = PAL.mag, cymbals = 1, alpha = 1 } = {}) {
  const H = (k) => clamp(hits[k] || 0);
  g.save(); g.translate(x, y); g.scale(s, s); g.globalAlpha = alpha;
  // kick drum (front head)
  const kk = H('kick');
  g.beginPath(); g.arc(0, -120, 120 + kk * 8, 0, TAU); neon(g, kitColor, 4);
  g.beginPath(); g.arc(0, -120, 84 + kk * 6, 0, TAU); neon(g, kitColor, 1.6, { alpha: 0.6, halo: 0 });
  // toms
  const drum = (dx, dy, rw, rh, k, col) => {
    const b = H(k) * 6;
    g.beginPath(); g.ellipse(dx, dy, rw + b, rh, 0, 0, TAU); neon(g, col, 3);
    g.beginPath(); g.moveTo(dx - rw, dy); g.lineTo(dx - rw, dy + rh * 3); g.moveTo(dx + rw, dy); g.lineTo(dx + rw, dy + rh * 3);
    g.ellipse(dx, dy + rh * 3, rw, rh, 0, 0, Math.PI); neon(g, col, 2.4, { alpha: 0.8 });
    if (H(k) > 0.2) { g.beginPath(); g.ellipse(dx, dy, (rw + 30) * (1.6 - H(k) * 0.6), rh * 2 * (1.6 - H(k) * 0.6), 0, 0, TAU); neon(g, PAL.white, 2, { alpha: H(k) * 0.8, halo: 0 }); }
  };
  drum(-150, -270, 60, 18, 'tom1', kitColor); drum(150, -270, 64, 19, 'tom2', kitColor);
  drum(-230, -150, 80, 22, 'snare', PAL.violet); drum(250, -120, 90, 24, 'floor', kitColor);
  // cymbals (can be removed)
  if (cymbals > 0) {
    g.globalAlpha = alpha * cymbals;
    for (const [cx, cy, r] of [[-330, -380, 95], [330, -420, 105]]) {
      const w = Math.sin(t * 9 + cx) * 0.06;
      g.beginPath(); g.ellipse(cx, cy, r, r * 0.16, w, 0, TAU); neon(g, PAL.yellow, 3);
      g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx, 0); neon(g, PAL.yellow, 1.5, { alpha: 0.5, halo: 0 });
    }
    g.globalAlpha = alpha;
  }
  // drummer (behind the kit): head, shoulders, arms with sticks
  const sx = 0, sy = -470;
  g.beginPath(); g.arc(sx, sy - 70, 46, 0, TAU); neon(g, color, 3.5);
  g.beginPath(); g.moveTo(sx - 95, sy + 10); g.quadraticCurveTo(sx, sy - 25, sx + 95, sy + 10); g.moveTo(sx - 70, sy + 10); g.lineTo(sx - 60, sy + 170); g.moveTo(sx + 70, sy + 10); g.lineTo(sx + 60, sy + 170); neon(g, color, 3.5);
  const arm = (side, target, lift) => {
    const shx = sx + side * 92, shy = sy + 12;
    const [tx, ty] = target;
    const hx = lerp(shx + side * 40, tx, 0.85), hy = lerp(ty - 40, ty, 1 - lift) - lift * 120;
    const ex = (shx + hx) / 2 + side * 50, ey = (shy + hy) / 2 + 30;
    g.beginPath(); g.moveTo(shx, shy); g.lineTo(ex, ey); g.lineTo(hx, hy); neon(g, color, 3.5);
    // stick
    const ang = Math.atan2(ty - hy, tx - hx) - side * lift * 0.9;
    g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx + Math.cos(ang) * 120, hy + Math.sin(ang) * 120); neon(g, PAL.white, 2.5, { core: PAL.white });
  };
  const L = Math.max(H('snare'), H('tom1')), Rr = Math.max(H('tom2'), H('floor'));
  const lTarget = H('tom1') > H('snare') ? [-150, -270] : [-230, -150];
  const rTarget = H('floor') > H('tom2') ? [250, -120] : [150, -270];
  arm(-1, lTarget, 1 - Math.min(1, L * 1.3));
  arm(1, rTarget, 1 - Math.min(1, Rr * 1.3));
  g.restore();
}
/** Hanging talkback microphone (line art). swing in radians. */
export function mic(g, x, y, s, { swing = 0, color = PAL.cyan, alpha = 1, talk = 0, t = 0 } = {}) {
  g.save(); g.translate(x, 0); g.rotate(swing); g.translate(0, y); g.scale(s, s); g.globalAlpha = alpha;
  g.beginPath(); g.moveTo(0, -y / s); g.lineTo(0, -60); neon(g, color, 2, { alpha: 0.7, halo: 0 });
  g.beginPath(); g.roundRect(-36, -60, 72, 130, 34); neon(g, color, 4);
  g.beginPath(); for (let k = 0; k < 5; k++) { g.moveTo(-26, -40 + k * 14); g.lineTo(26, -40 + k * 14); } neon(g, color, 1.4, { alpha: 0.55, halo: 0 });
  g.beginPath(); g.moveTo(-14, 70); g.lineTo(-20, 110); g.lineTo(20, 110); g.lineTo(14, 70); neon(g, color, 3);
  if (talk > 0) for (let k = 1; k <= 3; k++) { const ph = (t * 1.6 + k / 3) % 1; g.beginPath(); g.arc(0, 10, 60 + ph * 140, -0.6, 0.6); g.moveTo(0, 10); g.arc(0, 10, 60 + ph * 140, Math.PI - 0.6, Math.PI + 0.6); neon(g, PAL.pink, 2.5, { alpha: talk * (1 - ph), halo: 0 }); }
  g.restore();
}
/** LED VU meter (vertical): level 0..1, peak hold. */
export function vu(g, x, y, w, h, level, { segs = 18, peak = null } = {}) {
  const sh = h / segs;
  for (let i = 0; i < segs; i++) {
    const on = i < level * segs, f = i / segs;
    const col = f > 0.83 ? PAL.red : f > 0.6 ? PAL.yellow : PAL.green;
    g.globalAlpha = on ? 1 : 0.13; g.fillStyle = col;
    g.fillRect(x, y + h - (i + 1) * sh + 2, w, sh - 4);
    if (on && i > segs * 0.55) { g.globalAlpha = 0.25; g.fillRect(x - 4, y + h - (i + 1) * sh, w + 8, sh); }
  }
  if (peak !== null) { g.globalAlpha = 1; g.fillStyle = PAL.white; g.fillRect(x, y + h - peak * h - 3, w, 3); }
  g.globalAlpha = 1;
}
/** Analog needle meter in a neon box (the compressor). value 0..1. */
export function needle(g, x, y, w, h, v, { label = 'GR', color = PAL.cyan } = {}) {
  g.beginPath(); g.roundRect(x, y, w, h, 18); neon(g, color, 3);
  const cx = x + w / 2, cy = y + h * 0.92, r = h * 0.72;
  g.beginPath(); g.arc(cx, cy, r, Math.PI * 1.2, Math.PI * 1.8); neon(g, color, 2, { alpha: 0.7, halo: 0 });
  g.beginPath(); for (let k = 0; k <= 10; k++) { const a = Math.PI * (1.2 + k * 0.06); g.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); g.lineTo(cx + Math.cos(a) * (r - (k % 5 ? 14 : 26)), cy + Math.sin(a) * (r - (k % 5 ? 14 : 26))); } neon(g, color, 1.6, { alpha: 0.7, halo: 0 });
  g.beginPath(); g.arc(cx + Math.cos(Math.PI * 1.7) * r, cy + Math.sin(Math.PI * 1.7) * r, 8, 0, TAU); g.fillStyle = PAL.red; g.fill();
  const a = Math.PI * (1.2 + clamp(v) * 0.6);
  g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * r * 0.95, cy + Math.sin(a) * r * 0.95); neon(g, PAL.orange, 3.5);
}
/**
 * Scrolling oscilloscope of drum hits. hits: times (s). Each hit = burst + reverb tail of length `tail`;
 * `gate` (seconds after the hit) chops the tail. Window shows [t - span, t].
 */
export function scope(g, x, y, w, h, t, hits, { span = 2.2, tail = 1.6, gate = null, color = PAL.cyan, threshold = null, label = null } = {}) {
  g.save();
  g.beginPath(); g.rect(x, y, w, h); g.strokeStyle = 'rgba(34,230,255,0.25)'; g.lineWidth = 2; g.stroke();
  g.beginPath(); for (let k = 1; k < 8; k++) { g.moveTo(x + w * k / 8, y); g.lineTo(x + w * k / 8, y + h); } for (let k = 1; k < 4; k++) { g.moveTo(x, y + h * k / 4); g.lineTo(x + w, y + h * k / 4); }
  g.strokeStyle = 'rgba(34,230,255,0.08)'; g.lineWidth = 1; g.stroke();
  const N = 220, mid = y + h / 2;
  g.beginPath();
  for (let i = 0; i <= N; i++) {
    const tt = t - span + (i / N) * span;
    let amp = 0;
    for (const ht of hits) {
      const d = tt - ht; if (d < 0) continue;
      let e = d < 0.03 ? d / 0.03 : Math.exp(-(d - 0.03) * (3.2 / tail)) * (d < 0.12 ? 1 : 0.55);
      if (gate !== null && d > gate) e = 0;
      amp = Math.max(amp, e);
    }
    const v = Math.sin(tt * 260) * 0.6 + Math.sin(tt * 731) * 0.4;
    const px = x + (i / N) * w, py = mid + v * amp * h * 0.46;
    i ? g.lineTo(px, py) : g.moveTo(px, py);
  }
  neon(g, color, 2.6, { halo: 0.4 });
  if (threshold !== null) { g.beginPath(); g.setLineDash([14, 10]); g.moveTo(x, mid - threshold * h * 0.46); g.lineTo(x + w, mid - threshold * h * 0.46); g.moveTo(x, mid + threshold * h * 0.46); g.lineTo(x + w, mid + threshold * h * 0.46); g.strokeStyle = PAL.red; g.globalAlpha = 0.7; g.lineWidth = 2; g.stroke(); g.setLineDash([]); g.globalAlpha = 1; }
  g.restore();
  if (label) neonText(g, label, x + 16, y + 30, { size: 26, color, align: 'left' });
}
/** Expanding shock rings from a hit at time ht. */
export function rings(g, x, y, t, ht, { color = PAL.mag, n = 3, max = 700, dur = 0.8 } = {}) {
  for (let k = 0; k < n; k++) {
    const u = (t - ht - k * 0.08) / dur; if (u < 0 || u > 1) continue;
    g.beginPath(); g.ellipse(x, y, max * ease.outCubic(u), max * 0.32 * ease.outCubic(u), 0, 0, TAU); neon(g, k % 2 ? PAL.cyan : color, 4 * (1 - u), { alpha: 1 - u });
  }
}
/** Hit envelope helper: 1 at the hit, decaying. */
export const hitEnv = (t, times, d = 0.25) => { let v = 0; for (const h of times) { const u = t - h; if (u >= 0 && u < d * 3) v = Math.max(v, Math.exp(-u / d)); } return v; };

/** Cheap scanline + vignette overlay (cached). */
export function crtOverlay(g, { lines = 0.12 } = {}) {
  const W = g.canvas.width, H = g.canvas.height;
  const c = cached('sw-ov:' + lines, () => {
    const o = makeCanvas(4, H), x = o.getContext('2d');
    x.fillStyle = `rgba(0,0,0,${lines})`; for (let y = 0; y < H; y += 4) x.fillRect(0, y, 4, 2); return o;
  });
  g.drawImage(c, 0, 0, W, H);
}
