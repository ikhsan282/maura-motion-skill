// Dark Glow Product UI demo-dashboard (20 s): "Dashboard: Data Hidup di Layar".
// One hero object, never cut: the dashboard panel. A line chart climbs, metric tiles pop in,
// a live "real-time" pulse ticks, and a green alert pill confirms all-clear.
import * as K from '/styles/dark-glow-ui/kit.js';
const { clamp, lerp, ease, prog, env, hrand } = AM.lib;
const { roundRect } = AM.lib;
const P = K.PAL, R = K.RGB;

export const meta = { fps: 24, hold: 1, captions: { preset: 'neon', y: 1482, size: 52 } };

let bg, world, ui, fx;
const C = {};
const W = (id, w) => AM.wordTime(id, w);

// world positions
const PANEL = { x: 540, y: 980, s: 1.0 };
const NUM = { x: 2300, y: 3400 };

let CAM = [], T = {};
export async function setup(AM) {
  // two layers only (+ captions): every extra full-screen layer is another composite at capture time
  world = AM.layer('world'); ui = AM.layer('ui'); bg = world; fx = ui;
  for (const l of AM.timeline.lines) C[l.id] = l;
  T.chart = W('grafik', 'Garis') - 0.15;
  T.climb = W('grafik', 'naik') - 0.1;
  T.met = C.metrik.start + 0.05;
  T.real = C.real.start + 0.05;
  T.alert = W('akhir', 'alert') - 0.1;
  CAM = [
    [0, 540, 900, 1.25, -0.02],
    [0.05, 540, 980, 1.12, 0],
    [T.climb - 0.3, 540, 980, 1.0],
    [T.met, NUM.x, NUM.y, 0.95, 0.02],
    [T.real - 0.2, NUM.x, NUM.y, 1.0],
    [C.akhir.start - 0.15, 540, 980, 0.98],
    [AM.duration, 540, 980, 1.02],
  ];
  AM.sfx('whoosh', T.chart, { gain: 0.4 });
  AM.sfx('tick', T.climb, { gain: 0.5 });
  AM.sfx('click', T.met + 0.15, { gain: 0.5, pitch: 0.7 });
  AM.sfx('tick', T.real, { gain: 0.5 });
  AM.sfx('magic', T.real + 0.3, { gain: 0.35 });
  AM.sfx('chime', T.alert + 0.1, { gain: 0.45 });
  AM.sfx('impact', C.akhir.start + 1.2, { gain: 0.4 });
}
let cam = { x: 540, y: 960, z: 1 };
const toS = (x, y) => K.toScreen(cam, x, y);

// ---------------------------------------------------------------- the hero dashboard panel
const PW = 900, PH = 620, PX = PANEL.x - PW / 2, PY = PANEL.y - PH / 2;
// chart data: y in panel-local px (0..1 of plot area), x spread across plot
const PTS = [0.72, 0.66, 0.70, 0.55, 0.58, 0.40, 0.34, 0.36, 0.20, 0.12];
const PLOT = { x: 90, y: 130, w: 720, h: 300 };
const pt = (i) => [PLOT.x + (i / (PTS.length - 1)) * PLOT.w, PLOT.y + PTS[i] * PLOT.h];
function lineChart(g, t) {
  const p = clamp((t - T.chart) / 1.0);
  const climb = clamp((t - T.climb) / 1.6);
  g.save();
  g.beginPath(); g.rect(PX + PLOT.x - 10, PY + PLOT.y - 20, PLOT.w + 20, PLOT.h + 40); g.clip();
  // grid lines
  g.strokeStyle = 'rgba(140,150,255,0.10)'; g.lineWidth = 1;
  for (let i = 0; i <= 4; i++) { const yy = PY + PLOT.y + (i / 4) * PLOT.h; g.beginPath(); g.moveTo(PX + PLOT.x, yy); g.lineTo(PX + PLOT.x + PLOT.w, yy); g.stroke(); }
  // area fill
  const u = ease.inOutCubic(p) * 0.35 + ease.inOutCubic(climb) * 0.65;
  const n = PTS.length - 1, lastI = u * n;
  g.beginPath(); g.moveTo(...pt(0));
  for (let i = 1; i <= Math.min(n, Math.ceil(lastI)); i++) {
    const [x, y] = pt(i); g.lineTo(x + PX, y + PY);
  }
  const [hx, hy] = (() => { const i = Math.floor(lastI), f = lastI - i; const [ax, ay] = pt(Math.min(i, n)), [bx, by] = pt(Math.min(i + 1, n)); return [lerp(ax, bx, f) + PX, lerp(ay, by, f) + PY]; })();
  g.lineTo(hx, hy);
  g.lineTo(hx, PY + PLOT.y + PLOT.h); g.lineTo(PX + PLOT.x, PY + PLOT.y + PLOT.h); g.closePath();
  const ag = g.createLinearGradient(0, PY + PLOT.y, 0, PY + PLOT.y + PLOT.h);
  ag.addColorStop(0, 'rgba(124,108,255,0.30)'); ag.addColorStop(1, 'rgba(124,108,255,0)');
  g.fillStyle = ag; g.fill();
  // the line itself
  g.beginPath(); g.moveTo(...pt(0));
  for (let i = 1; i <= Math.min(n, Math.ceil(lastI)); i++) { const [x, y] = pt(i); g.lineTo(x + PX, y + PY); }
  g.lineTo(hx, hy);
  g.strokeStyle = P.violet; g.lineWidth = 5; g.lineCap = 'round'; g.lineJoin = 'round';
  g.shadowColor = `rgba(${R.violet},0.8)`; g.shadowBlur = 18; g.stroke();
  // glowing head dot
  K.glow(g, hx, hy, 34, R.violet, 0.8);
  g.fillStyle = '#fff'; g.beginPath(); g.arc(hx, hy, 7, 0, Math.PI * 2); g.fill();
  g.restore();
  // "+32%" badge near the head once the climb is done
  const bp = K.sp(t, T.climb + 1.2, 0.5, 0.7);
  if (bp > 0) {
    g.save(); K.rise(g, PX + PLOT.x + PLOT.w - 90, PY + PLOT.y + 40, bp, { dy: 20 });
    K.glass(g, PX + PLOT.x + PLOT.w - 190, PY + PLOT.y + 10, 200, 64, { r: 32, haloRgb: R.mint, haloA: 0.4 });
    K.label(g, '▲ +32%', PX + PLOT.x + PLOT.w - 90, PY + PLOT.y + 44, { size: 30, weight: 700, align: 'center', color: P.mint, spacing: 0 });
    g.restore();
  }
}
function metricTiles(g, t) {
  const tiles = [
    ['PENGGUNA', '12.4K', R.violet],
    ['PENDAPATAN', 'Rp84Jt', R.blue],
    ['KONVERSI', '4,8%', R.cyan],
  ];
  tiles.forEach(([lab, val, rgb], i) => {
    const p = K.sp(t, T.met + i * 0.22, 0.55, 0.7);
    if (p <= 0) return;
    const w = 216, h = 130, x = PX + 90 + i * 240, y = PY + 470;
    g.save(); K.rise(g, x + w / 2, y + h / 2, p, { dy: 40 });
    K.glass(g, x, y, w, h, { r: 24, haloRgb: rgb, haloA: 0.35 });
    K.label(g, lab, x + 20, y + 34, { size: 16, color: P.ink2, font: K.FONT.mono, spacing: 2 });
    // value counts up
    const target = [12400, 84, 4.8][i];
    const v = K.count(t, T.met + i * 0.22 + 0.15, 0.9, 0, target);
    const fmt = i === 0 ? (v / 1000).toFixed(1).replace('.', ',') + 'K' : i === 1 ? 'Rp' + Math.round(v) + 'Jt' : v.toFixed(1).replace('.', ',') + '%';
    K.label(g, fmt, x + 20, y + 86, { size: 40, weight: 700, spacing: 0, color: P.ink });
    g.restore();
  });
}
function realtimePulse(g, t) {
  const p = K.sp(t, T.real, 0.5, 0.7);
  if (p <= 0) return;
  const x = PX + PW - 150, y = PY + 50;
  g.save(); K.rise(g, x, y, p, { dy: 20 });
  K.glass(g, x - 130, y - 24, 260, 48, { r: 24, haloRgb: R.cyan, haloA: 0.45 });
  // pulsing dot
  const ph = (t * 1.4) % 1;
  K.glow(g, x - 100, y, 20 + ph * 26, R.cyan, 0.8 * (1 - ph));
  g.fillStyle = P.cyan; g.beginPath(); g.arc(x - 100, y, 7, 0, Math.PI * 2); g.fill();
  K.label(g, 'REAL-TIME', x - 78, y + 1, { size: 20, weight: 700, color: P.cyan, font: K.FONT.mono, spacing: 2 });
  g.restore();
  // tiny live ticker numbers under the panel
  g.save(); g.globalAlpha = clamp(p);
  for (let i = 0; i < 5; i++) {
    const v = Math.floor(100 + Math.sin(t * 3 + i * 1.7) * 40 + hrand(7, i, Math.floor(t * 4)) * 20);
    K.label(g, String(v), PX + 120 + i * 150, PY + PH - 30, { size: 22, font: K.FONT.mono, color: P.ink3, align: 'center', spacing: 0 });
  }
  g.restore();
}
function alertPill(g, t) {
  const p = K.sp(t, T.alert, 0.55, 0.7);
  if (p <= 0) return;
  const x = PANEL.x, y = PY + PH + 110;
  g.save(); K.rise(g, x, y, p, { dy: 50 });
  const w = 460, h = 96;
  K.glass(g, x - w / 2, y - h / 2, w, h, { r: 48, haloRgb: R.mint, haloA: 0.55 });
  // check mark
  const cp = clamp((t - T.alert - 0.25) / 0.35);
  g.strokeStyle = P.mint; g.lineWidth = 7; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath();
  const cx = x - 160, cy = y;
  if (cp > 0) {
    g.moveTo(cx - 16, cy); if (cp > 0.4) g.lineTo(cx - 2, cy + 14);
    if (cp > 0.4) { const u = clamp((cp - 0.4) / 0.6); g.lineTo(cx - 2 + 30 * u, cy + 14 - 30 * u); }
    g.stroke();
  }
  K.label(g, 'SEMUA SISTEM AMAN', x - 110, y + 1, { size: 30, weight: 700, color: P.mint, spacing: 0 });
  g.restore();
  if (t - T.alert < 1.0) K.sparks(g, x, y, t - T.alert, { n: 26, rgb: R.mint, seed: 11 });
}
function panel(g, t) {
  const p = K.sp(t, 0.05, 0.8, 0.7);
  g.save(); K.rise(g, PANEL.x, PANEL.y, p, { dy: 90 });
  K.glass(g, PX, PY, PW, PH, { r: 44, haloRgb: R.violet, haloA: 0.5 });
  // header
  K.label(g, 'DASHBOARD', PX + 40, PY + 52, { size: 30, weight: 700, spacing: 1 });
  K.micro(g, 'live · id-jakarta', PX + PW - 40, PY + 52, { size: 18, align: 'right' });
  g.strokeStyle = 'rgba(255,255,255,0.08)'; g.lineWidth = 1;
  g.beginPath(); g.moveTo(PX + 40, PY + 84); g.lineTo(PX + PW - 40, PY + 84); g.stroke();
  lineChart(g, t);
  metricTiles(g, t);
  realtimePulse(g, t);
  g.restore();
  alertPill(g, t);
}

// ---------------------------------------------------------------- numbers stage (metrik besar)
function numbers(g, t) {
  if (t < C.metrik.start - 0.6 || t > C.akhir.start + 0.4) return;
  const x = NUM.x, y = NUM.y, a = env(t, C.metrik.start - 0.2, C.akhir.start + 0.2, 0.35, 0.35);
  g.save(); g.globalAlpha *= a;
  const e = Math.round(K.count(t, T.met + 0.3, 1.5, 1, 12400));
  const pop = K.sp(t, T.met, 0.6, 0.6);
  g.save(); K.rise(g, x, y, pop, { from: 0.7, dy: 0 });
  K.glow(g, x, y - 140, 560, R.violet, 0.4);
  K.label(g, String(e).replace(/\B(?=(\d{3})+(?!\d))/g, '.'), x, y + 60, { size: 220, weight: 700, align: 'center', spacing: -8 });
  K.micro(g, 'pengguna aktif', x, y + 210, { align: 'center', size: 30, color: P.ink2 });
  g.restore();
  // three mini bars
  const bars = [[0.62, R.violet], [0.84, R.blue], [0.48, R.cyan]];
  bars.forEach(([h, rgb], i) => {
    const bp = K.sp(t, T.real + i * 0.15, 0.5, 0.7);
    if (bp <= 0) return;
    const bw = 130, bx = x - 260 + i * 200, by = y + 320;
    const bh = h * 260 * ease.outCubic(bp);
    g.fillStyle = `rgba(${rgb},0.25)`; roundRect(g, bx, by - 260, bw, 260, 16); g.fill();
    g.fillStyle = `rgba(${rgb},0.9)`; roundRect(g, bx, by - bh, bw, bh, 16); g.fill();
    K.glow(g, bx + bw / 2, by - bh, 60, rgb, 0.4 * bp);
  });
  g.restore();
}

// ---------------------------------------------------------------- overlays
function overlays(t) {
  const H = (lines, at, out, o = {}) => K.headline(ui, t, at, lines, 540, o.y || 236, { size: 80, out, ...o });
  const E = (str, a, b, y = 150) => K.micro(ui, str, 540, y, { align: 'center', alpha: env(t, a, b, 0.3, 0.3), color: P.ink2, size: 22 });
  if (t < C.grafik.start) { E('dashboard · data hidup', 0, C.hook.end); H(['Semua data pentingmu', 'hidup *di sini*.'], 0.05, C.hook.end + 0.05, { y: 210 }); }
  if (t > C.grafik.start - 0.1 && t < C.metrik.start) H(['Garis grafik *naik* terus,'], T.chart - 0.05, C.metrik.start - 0.1, { y: 210 });
  if (t > C.grafik.start + 0.8 && t < C.metrik.start) H(['pertumbuhanmu *nyata*.'], W('grafik', 'pertumbuhanku') - 0.1, C.metrik.start - 0.1, { y: 310, size: 70 });
  if (t > C.metrik.start - 0.1 && t < C.real.start) H(['Metrik utama: *pengguna*,', 'pendapatan, konversi.'], C.metrik.start + 0.05, C.real.start - 0.1, { y: 210, size: 66 });
  if (t > C.real.start - 0.1 && t < C.akhir.start) H(['*Real-time*,', 'update tiap detik.'], C.real.start + 0.05, C.akhir.start - 0.1, { y: 210, size: 76 });
  if (t > C.akhir.start) H(['Alert *hijau*: aman.'], T.alert - 0.05, 999, { y: 330 });
  K.micro(ui, 'DASHBOARD · LIVE', 60, 70, { size: 18 });
  const sec = Math.floor(t), fr = Math.floor((t % 1) * 24);
  K.micro(ui, `00:${String(sec).padStart(2, '0')}:${String(fr).padStart(2, '0')}`, 940, 70, { size: 18, align: 'right' });
}

// ---------------------------------------------------------------- frame
export function render(t) {
  cam = K.camAt(t, CAM, { z: 1, ts: 0.8 });
  const deep = env(t, C.metrik.start - 0.2, C.akhir.start, 0.4, 0.4);
  K.stage(bg, t, { px: (cam.x - 540) * 0.06, py: (cam.y - 980) * 0.06, intensity: 1 - deep * 0.35 });
  world.setTransform(1, 0, 0, 1, 0, 0);
  K.applyCam(world, cam);
  panel(world, t);
  numbers(world, t);
  overlays(t);
  fx.setTransform(1, 0, 0, 1, 0, 0);
  for (const tt of [C.metrik.start - 0.1, C.akhir.start - 0.1]) {
    const d = t - tt;
    if (d > 0 && d < 0.35) { fx.globalAlpha = 0.18 * (1 - d / 0.35); fx.drawImage(K.glowSprite(R.violet, 0.9), -540, -200, 2160, 2320); fx.globalAlpha = 1; }
  }
  K.finish(fx, t, AM);
  const f = clamp((t - (AM.duration - 0.4)) / 0.4);
  if (f > 0) { fx.fillStyle = `rgba(6,7,12,${f * 0.9})`; fx.fillRect(0, 0, 1080, 1920); }
  for (const c of [world, ui]) c.setTransform(1, 0, 0, 1, 0, 0);
}
