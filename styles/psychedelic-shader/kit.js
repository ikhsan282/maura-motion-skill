// Maura Motion style kit: PSYCHEDELIC SHADER (Mathematical GLSL-style Fractals, Kaleidoscopes & Reaction-Diffusion Waves).
// Signature: real-time Mandelbrot/Julia escape-time & orbit-trap pixel shader buffer, multi-fold kaleidoscope symmetry,
// neon vortex tunnels, complex-plane orbit tracers, reaction-diffusion spiral waves, and RGB chromatic glitch HUD.
import { clamp, lerp, ease, hrand, mulberry32, TAU } from '/engine/lib/core.js';
import { makeCanvas, cached } from '/engine/lib/draw.js';

export const PAL = {
  bg0: '#060014',
  bg1: '#1a0038',
  neon1: '#ff2fd6',
  neon2: '#27f5ff',
  neon3: '#b6ff2f',
  gold: '#ffd23f',
  violet: '#9d4edd',
  deep: '#12003a',
  white: '#f6f4ff',
};

// ---------------------------------------------------------------- legacy exports
export function bg(ctx, t, c1 = PAL.bg0, c2 = PAL.bg1) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const g = ctx.createLinearGradient(0, 0, 0, 1920);
  g.addColorStop(0, c1); g.addColorStop(1, c2);
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
  ctx.restore();
}
export function title(ctx, text, x, y, { size = 84, color = '#ffffff', p = 1 } = {}) {
  ctx.save(); ctx.globalAlpha = clamp(p); ctx.fillStyle = color;
  ctx.font = `800 ${size}px 'Orbitron', 'Poppins', sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.shadowColor = PAL.neon1; ctx.shadowBlur = 24;
  ctx.fillText(text, x, y); ctx.restore();
}
export function label(ctx, text, x, y, { size = 48, color = '#ffffff', p = 1 } = {}) {
  ctx.save(); ctx.globalAlpha = clamp(p); ctx.fillStyle = color;
  ctx.font = `700 ${size}px 'Plus Jakarta Sans', 'Poppins', sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y); ctx.restore();
}
export function blob(ctx, x, y, r, color, t, { seed = 1 } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.beginPath();
  const n = 10, rnd = mulberry32(seed);
  const off = Array.from({ length: n }, () => 0.75 + rnd() * 0.5);
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * TAU;
    const rr = r * off[i % n] * (1 + 0.06 * Math.sin(t * 1.5 + i));
    const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr * 0.9;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath(); ctx.fill(); ctx.restore();
}
export function ring(ctx, x, y, r, color, w = 8) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); ctx.restore();
}
export function card(ctx, x, y, w, h, fill, { r = 24 } = {}) {
  ctx.save(); ctx.fillStyle = fill;
  ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, r); ctx.fill(); ctx.restore();
}

// ---------------------------------------------------------------- psychedelic shader engine
/** Cosine palette helper (Inigo Quilez style shader palette) -> [r, g, b] 0..255 */
export function iqColor(t, shift = 0) {
  const u = t + shift;
  const r = 0.5 + 0.5 * Math.cos(TAU * (u + 0.0));
  const g = 0.5 + 0.5 * Math.cos(TAU * (u + 0.33));
  const b = 0.5 + 0.5 * Math.cos(TAU * (u + 0.67));
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/** Full-frame psychedelic background stage with warp tunnel rings, starfield, and shader header HUD. */
export function shaderStage(ctx, t, { titleTxt = '', subTxt = '', tag = 'GLSL // FRACTAL.FRAG', tunnel = true } = {}) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const gr = ctx.createRadialGradient(540, 720, 40, 540, 720, 1250);
  gr.addColorStop(0, '#22004a');
  gr.addColorStop(0.55, '#0c0022');
  gr.addColorStop(1, '#04000c');
  ctx.fillStyle = gr;
  ctx.fillRect(0, 0, 1080, 1920);

  if (tunnel) {
    // Hypnotic warping neon rings in background
    for (let i = 0; i < 14; i++) {
      const ph = ((i / 14) + t * 0.08) % 1;
      const rad = 80 + ph * ph * 1050;
      const [r, g, b] = iqColor(i * 0.11, t * 0.18);
      ctx.strokeStyle = `rgba(${r},${g},${b},${(1 - ph) * 0.24})`;
      ctx.lineWidth = 2 + ph * 5;
      ctx.beginPath();
      for (let s = 0; s <= 48; s++) {
        const a = (s / 48) * TAU + t * 0.25 * (i % 2 ? 1 : -1);
        const wr = rad * (1 + 0.06 * Math.sin(a * 6 + t * 2 + i));
        const px = 540 + Math.cos(a) * wr, py = 720 + Math.sin(a) * wr;
        s === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }

  // Top Shader HUD Bar
  ctx.fillStyle = 'rgba(10,0,28,0.82)';
  ctx.strokeStyle = PAL.neon2;
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.roundRect(48, 56, 984, 150, 18); ctx.fill(); ctx.stroke();

  // Tag pill
  ctx.fillStyle = PAL.neon1;
  ctx.font = "700 21px 'Space Mono', monospace";
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(`◈ ${tag}`, 82, 92);

  ctx.fillStyle = PAL.neon3;
  ctx.textAlign = 'right';
  ctx.fillText(`T=${t.toFixed(2)}s`, 998, 92);

  if (titleTxt) {
    ctx.fillStyle = '#ffffff';
    ctx.font = "800 40px 'Orbitron', 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = 'left';
    ctx.shadowColor = PAL.neon2; ctx.shadowBlur = 16;
    ctx.fillText(titleTxt, 82, 140, 910);
    ctx.shadowBlur = 0;
  }
  if (subTxt) {
    ctx.fillStyle = PAL.neon2;
    ctx.font = "600 24px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = 'left';
    ctx.fillText(subTxt, 82, 180, 910);
  }
  ctx.restore();
}

const _fracCv = makeCanvas(220, 220);
const _fracCtx = _fracCv.getContext('2d');
const _fracImg = _fracCtx.createImageData(220, 220);

/**
 * Real-time Mandelbrot / Julia pixel-shader renderer drawn inside a glowing circular or rectangular viewport!
 * mode: 'mandelbrot' | 'julia'
 */
export function drawFractalViewport(ctx, x, y, r = 340, t = 0, {
  mode = 'mandelbrot',
  cx = -0.7436438870371587,
  cy = 0.13182590420531197,
  zoom = 1,
  juliaRe = -0.7,
  juliaIm = 0.27015,
  maxIter = 36,
  hueShift = 0,
} = {}) {
  const N = 220, data = _fracImg.data;
  const span = 2.8 / zoom;

  for (let py = 0; py < N; py++) {
    const im0 = (mode === 'mandelbrot' ? cy : 0) + ((py / N) - 0.5) * span;
    for (let px = 0; px < N; px++) {
      const re0 = (mode === 'mandelbrot' ? cx : 0) + ((px / N) - 0.5) * span;
      let zr = mode === 'mandelbrot' ? 0 : re0;
      let zi = mode === 'mandelbrot' ? 0 : im0;
      const cr = mode === 'mandelbrot' ? re0 : juliaRe;
      const ci = mode === 'mandelbrot' ? im0 : juliaIm;

      let iter = 0;
      let zr2 = zr * zr, zi2 = zi * zi;
      let minTrap = 999;
      while (zr2 + zi2 <= 16.0 && iter < maxIter) {
        zi = 2 * zr * zi + ci;
        zr = zr2 - zi2 + cr;
        zr2 = zr * zr;
        zi2 = zi * zi;
        const d = Math.abs(zr2 + zi2 - 0.5);
        if (d < minTrap) minTrap = d;
        iter++;
      }

      const idx = (py * N + px) * 4;
      if (iter === maxIter) {
        // Interior orbit-trap glow
        const gl = clamp(1 - minTrap * 1.4);
        data[idx] = Math.round(gl * 45);
        data[idx + 1] = Math.round(gl * 15);
        data[idx + 2] = Math.round(35 + gl * 95);
        data[idx + 3] = 255;
      } else {
        // Smooth escape coloring (renormalized iteration count)
        const logZn = Math.log(zr2 + zi2) / 2;
        const nu = Math.log(logZn / Math.LN2) / Math.LN2;
        const smooth = (iter + 1 - nu) * 0.065 + t * 0.22 + hueShift;
        const [cr8, cg8, cb8] = iqColor(smooth, 0);
        data[idx] = cr8;
        data[idx + 1] = cg8;
        data[idx + 2] = cb8;
        data[idx + 3] = 255;
      }
    }
  }
  _fracCtx.putImageData(_fracImg, 0, 0);

  ctx.save();
  ctx.translate(x, y);
  // Outer neon halo
  ctx.shadowColor = PAL.neon1;
  ctx.shadowBlur = 42;
  ctx.strokeStyle = PAL.neon2;
  ctx.lineWidth = 7;
  ctx.beginPath(); ctx.arc(0, 0, r + 6, 0, TAU); ctx.stroke();
  ctx.shadowBlur = 0;

  // Clip circle and draw fractal shader canvas
  ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.clip();
  ctx.drawImage(_fracCv, -r, -r, r * 2, r * 2);

  // Subtle reticle crosshairs
  ctx.strokeStyle = 'rgba(255,255,255,0.28)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-r, 0); ctx.lineTo(r, 0);
  ctx.moveTo(0, -r); ctx.lineTo(0, r);
  ctx.stroke();
  ctx.restore();
}

/** Psychedelic N-fold Kaleidoscope Mandala with interference waves. */
export function drawKaleidoscope(ctx, x, y, r = 330, t = 0, { folds = 10, layers = 5 } = {}) {
  ctx.save();
  ctx.translate(x, y);
  for (let L = layers; L >= 1; L--) {
    const lr = r * (L / layers);
    const [cr, cg, cb] = iqColor(L * 0.16, t * 0.25);
    ctx.strokeStyle = `rgb(${cr},${cg},${cb})`;
    ctx.fillStyle = `rgba(${cr},${cg},${cb},0.16)`;
    ctx.lineWidth = 4;
    for (let f = 0; f < folds; f++) {
      const a0 = (f / folds) * TAU + t * 0.35 * (L % 2 ? 1 : -1);
      ctx.save();
      ctx.rotate(a0);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      const wave = Math.sin(t * 2.5 + L) * 32;
      ctx.quadraticCurveTo(lr * 0.5, -45 - wave, lr, 0);
      ctx.quadraticCurveTo(lr * 0.5, 45 + wave, 0, 0);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }
  ctx.restore();
}

/** Neon HUD info panel with glowing border and monospace metrics. */
export function hudCard(ctx, x, y, w, h, titleStr, subStr = '', { col = PAL.neon2, p = 1 } = {}) {
  if (p <= 0) return;
  const k = ease.outBack(clamp(p), 1.4);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(0.85 + 0.15 * k, 0.85 + 0.15 * k);
  ctx.globalAlpha = clamp(p);
  ctx.fillStyle = 'rgba(11,0,34,0.88)';
  ctx.strokeStyle = col;
  ctx.lineWidth = 3.5;
  ctx.shadowColor = col;
  ctx.shadowBlur = 20;
  ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 20); ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#ffffff';
  ctx.font = "800 36px 'Orbitron', 'Plus Jakarta Sans', sans-serif";
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(titleStr, 0, subStr ? -20 : 0, w - 48);

  if (subStr) {
    ctx.fillStyle = col;
    ctx.font = "600 25px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(subStr, 0, 26, w - 48);
  }
  ctx.restore();
}

/** Koch Snowflake recursive fractal curve generator for coastline / fractal dimension demos. */
export function drawKochSnowflake(ctx, x, y, r = 280, depth = 3, t = 0, { col = PAL.neon2 } = {}) {
  const d = clamp(Math.floor(depth), 0, 4);
  const subdivide = (p1, p2, lvl, out) => {
    if (lvl <= 0) {
      out.push(p2);
      return;
    }
    const dx = (p2[0] - p1[0]) / 3, dy = (p2[1] - p1[1]) / 3;
    const a = [p1[0] + dx, p1[1] + dy];
    const c = [p1[0] + 2 * dx, p1[1] + 2 * dy];
    const ang = -Math.PI / 3;
    const b = [
      a[0] + dx * Math.cos(ang) - dy * Math.sin(ang),
      a[1] + dx * Math.sin(ang) + dy * Math.cos(ang),
    ];
    subdivide(p1, a, lvl - 1, out);
    subdivide(a, b, lvl - 1, out);
    subdivide(b, c, lvl - 1, out);
    subdivide(c, p2, lvl - 1, out);
  };

  const verts = [0, 1, 2].map((i) => {
    const a = -Math.PI / 2 + (i / 3) * TAU + t * 0.15;
    return [x + Math.cos(a) * r, y + Math.sin(a) * r];
  });
  const pts = [verts[0]];
  subdivide(verts[0], verts[1], d, pts);
  subdivide(verts[1], verts[2], d, pts);
  subdivide(verts[2], verts[0], d, pts);

  ctx.save();
  ctx.strokeStyle = col;
  ctx.fillStyle = 'rgba(39,245,255,0.12)';
  ctx.lineWidth = 3.5;
  ctx.shadowColor = col;
  ctx.shadowBlur = 18;
  ctx.beginPath();
  pts.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export { clamp, lerp, ease, hrand, mulberry32, TAU };
