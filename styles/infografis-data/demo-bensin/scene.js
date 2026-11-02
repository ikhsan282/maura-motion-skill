// Infografis Data demo-bensin: "Harga Bensin 10 Tahun".
// Line chart naik 2015-2025 (Rp/liter) dengan titik kejadian penting, counter delta, panel perbandingan.
import * as K from '/styles/infografis-data/kit.js';
const { clamp, lerp, ease, prog, env } = AM.lib;

export const meta = { fps: 24, hold: 1, captions: { preset: 'clean', y: 1480, size: 54, box: { fill: 'rgba(10,14,25,.85)', pad: 16, radius: 12, border: 'rgba(40,224,255,.35)', borderW: 2 } } };

let ctx, ui;
const C = {};
const W = (id, w) => AM.wordTime(id, w);

// Data harga Pertalite (2015-2025), Rp/liter, dibulatkan
const YEARS = [
  { y: 2015, p: 7400, ev: null },
  { y: 2016, p: 7400, ev: null },
  { y: 2017, p: 7400, ev: null },
  { y: 2018, p: 7800, ev: null },
  { y: 2019, p: 7650, ev: null },
  { y: 2020, p: 7650, ev: 'COVID' },
  { y: 2021, p: 7650, ev: null },
  { y: 2022, p: 10000, ev: 'Subsidi naik' },
  { y: 2023, p: 10000, ev: null },
  { y: 2024, p: 10000, ev: null },
  { y: 2025, p: 10000, ev: 'Sekarang' },
];
const P_MIN = 6000, P_MAX = 11000;
const CHART = { x0: 130, x1: 950, y0: 500, y1: 1100 };
const xAt = (i) => lerp(CHART.x0, CHART.x1, i / (YEARS.length - 1));
const yAt = (p) => lerp(CHART.y1, CHART.y0, (p - P_MIN) / (P_MAX - P_MIN));

let T = {};
export async function setup(AM) {
  ctx = AM.layer('world'); ui = AM.layer('ui');
  for (const l of AM.timeline.lines) C[l.id] = l;
  T.awal = W('awal', '2015');
  T.naik1 = W('naik', '2020');
  T.naik2 = W('naik', '2022');
  T.kini = W('kini', '2025');
  T.banding = W('banding', 'empat');
  T.tutup = C.tutup.start - 0.1;
  AM.sfx('whoosh', 0.05, { gain: 0.3 });
  AM.sfx('pop', T.awal + 0.1, { gain: 0.35 });
  AM.sfx('pop', T.naik1 + 0.05, { gain: 0.35, pitch: 1.15 });
  AM.sfx('pop', T.naik2 + 0.05, { gain: 0.4, pitch: 1.3 });
  AM.sfx('chime', T.kini + 0.1, { gain: 0.45 });
  AM.sfx('ding', T.banding + 0.1, { gain: 0.45 });
  AM.sfx('whoosh', T.tutup, { gain: 0.3, pitch: 0.9 });
}

export function render(t) {
  K.dashboard(ctx, t);

  // ---- chart background panel
  const chartP = prog(t, 0.0, 0.5, ease.outCubic);
  K.panel(ctx, 90, 380, 900, 800, { p: chartP });

  // ---- Y axis labels
  ctx.save();
  ctx.globalAlpha *= chartP;
  ctx.font = "400 22px 'JetBrains Mono'"; ctx.fillStyle = K.PAL.dim; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  for (let v = P_MIN; v <= P_MAX; v += 1000) {
    ctx.fillText(K.num(v), CHART.x0 - 16, yAt(v));
    ctx.strokeStyle = K.PAL.grid; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(CHART.x0, yAt(v) + 0.5); ctx.lineTo(CHART.x1, yAt(v) + 0.5); ctx.stroke();
  }
  ctx.restore();

  // ---- X axis labels (years)
  ctx.save();
  ctx.globalAlpha *= chartP;
  ctx.font = "400 22px 'JetBrains Mono'"; ctx.fillStyle = K.PAL.dim; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  YEARS.forEach((d, i) => ctx.fillText(String(d.y), xAt(i), CHART.y1 + 16));
  ctx.restore();

  // ---- draw line up to current progress
  // progress: reveal through years, driven by narrative beats
  const revealEnd = (() => {
    const p1 = prog(t, T.awal - 0.05, T.naik1 + 0.1) * 4; // 0..4
    const p2 = prog(t, T.naik1 + 0.1, T.naik2 + 0.1) * 3; // 0..3
    const p3 = prog(t, T.naik2 + 0.1, T.kini + 0.2) * 3; // 0..3
    return clamp(p1 + p2 + p3);
  })();
  const upTo = Math.min(YEARS.length - 1, revealEnd * (YEARS.length - 1));

  // area fill under line (subtle)
  if (upTo > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(xAt(0), CHART.y1);
    for (let i = 0; i <= upTo; i++) ctx.lineTo(xAt(i), yAt(YEARS[i].p));
    ctx.lineTo(xAt(upTo), CHART.y1);
    ctx.closePath();
    const gr = ctx.createLinearGradient(0, CHART.y0, 0, CHART.y1);
    gr.addColorStop(0, 'rgba(255,138,61,.35)'); gr.addColorStop(1, 'rgba(255,138,61,0)');
    ctx.fillStyle = gr; ctx.fill();
    ctx.restore();
  }

  // line stroke
  if (upTo > 0) {
    ctx.save();
    ctx.strokeStyle = K.PAL.asia; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i <= upTo; i++) {
      const x = xAt(i), y = yAt(YEARS[i].p);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  // ---- dots + event callouts
  for (let i = 0; i <= upTo; i++) {
    const d = YEARS[i];
    const x = xAt(i), y = yAt(d.p);
    const dotA = prog(t, T.awal - 0.05 + i * 0.05, T.awal + 0.05 + i * 0.05);
    ctx.save(); ctx.globalAlpha *= dotA;
    ctx.fillStyle = K.PAL.bg; ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = K.PAL.asia; ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // event callout
    if (d.ev) {
      const ea = env(t, T.awal + i * 0.05, T.tutup, 0.25, 0.2);
      if (ea > 0) {
        ctx.save(); ctx.globalAlpha *= ea;
        ctx.strokeStyle = K.PAL.accent; ctx.lineWidth = 2; ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(x, y - 12); ctx.lineTo(x, y - 60); ctx.stroke();
        ctx.setLineDash([]);
        K.chip(ctx, d.ev, x, y - 78, K.PAL.accent, { p: ea, size: 22 });
        ctx.restore();
      }
    }
  }

  // ---- 2025 big counter (right side) — hilang pas panel delta masuk
  const c2025 = env(t, T.kini, T.banding, 0.3, 0.3);
  if (c2025 > 0) {
    const target = YEARS[YEARS.length - 1].p;
    const v = Math.round(target * prog(t, T.kini, T.kini + 0.7, ease.outCubic));
    K.counter(ctx, 'Rp ' + K.num(v), 540, 1240, { size: 78, color: K.PAL.asia, alpha: c2025 });
    K.label(ctx, 'PER LITER · 2025', 540, 1290, { size: 22, align: 'center', color: K.PAL.dim, font: 'JetBrains Mono', spacing: 2, alpha: c2025 });
  }

  // ---- delta panel: +38%
  const dpa = env(t, T.banding, T.tutup, 0.3, 0.3);
  if (dpa > 0) {
    K.panel(ui, 90, 1200, 900, 110, { p: dpa });
    ui.save(); ui.globalAlpha *= dpa;
    K.counter(ui, '+35%', 200, 1255, { size: 56, color: K.PAL.indo, align: 'left' });
    K.label(ui, 'NAIK DALAM 10 TAHUN', 400, 1255, { size: 24, color: '#c5cee0', align: 'left', font: 'JetBrains Mono', spacing: 1 });
    K.label(ui, 'Rp 7.400 → Rp 10.000', 870, 1255, { size: 24, color: K.PAL.dim, align: 'right', font: 'JetBrains Mono' });
    ui.restore();
  }

  // ---- screen-space UI
  ui.setTransform(1, 0, 0, 1, 0, 0);
  K.title(ui, 'DATA BPH MIGAS · 2015–2025', 'Harga Bensin 10 Tahun', { p: prog(t, 0, 0.5, ease.outCubic) });
  K.source(ui, 'Sumber: BPH Migas, Pertamina · Pertalite', t, { alpha: prog(t, 0.3, 0.9) });
}
