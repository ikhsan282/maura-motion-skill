// Infografis Data demo3 (~64s): "Kirim Kucing ke Mana Aja — Tarif dan Jarak Pengiriman Hewan Kesayangan".
// Bar chart per kota (Bandung/Tasikmalaya/Ciamis) — perbandingan jarak km & tarif paket hewan.
// Counter ongkir, panel ringkasan, dan callout Maura Trans.
import * as K from '/styles/infografis-data/kit.js';
const { clamp, lerp, ease, prog, env } = AM.lib;

export const meta = { fps: 24, hold: 1, captions: { preset: 'clean', y: 1480, size: 54, box: { fill: 'rgba(10,14,25,.85)', pad: 16, radius: 12, border: 'rgba(40,224,255,.35)', borderW: 2 } } };

let ctx, ui;
const C = {};
const W = (id, w) => AM.wordTime(id, w);

const CITIES = [
  { id: 'bdg', name: 'Bandung', km: 140, price: 230000, color: K.PAL.europe },
  { id: 'tsk', name: 'Tasikmalaya', km: 270, price: 250000, color: K.PAL.americas },
  { id: 'cms', name: 'Ciamis', km: 300, price: 300000, color: K.PAL.asia },
];
const P_MAX = 350000;
const BAR_X = 380, BAR_W = 500, BAR_H = 74, BAR_GAP = 54, BAR_Y0 = 510;

let T = {};
export async function setup(AM) {
  ctx = AM.layer('world'); ui = AM.layer('ui');
  for (const l of AM.timeline.lines) C[l.id] = l;
  T.bdg = W('jkt', 'bandung') - 0.1;
  T.tsk = W('bdg', 'tasikmalaya') - 0.1;
  T.cms = W('solo', 'ciamis') - 0.1;
  T.pola = W('pola', 'jelas') - 0.1;
  T.travel = W('travel', 'maura') - 0.1;
  T.tutup = C.tutup.start - 0.1;
  AM.sfx('whoosh', 0.05, { gain: 0.3 });
  AM.sfx('pop', T.bdg + 0.1, { gain: 0.35 });
  AM.sfx('pop', T.tsk + 0.1, { gain: 0.4, pitch: 1.2 });
  AM.sfx('pop', T.cms + 0.1, { gain: 0.45, pitch: 1.3 });
  AM.sfx('ding', T.pola + 0.1, { gain: 0.45 });
  AM.sfx('chime', T.travel + 0.1, { gain: 0.5 });
  AM.sfx('whoosh', T.tutup, { gain: 0.3, pitch: 0.9 });
}

export function render(t) {
  K.dashboard(ctx, t);

  // ---- panel
  const chartP = prog(t, 0.0, 0.5, ease.outCubic);
  K.panel(ctx, 90, 380, 900, 760, { p: chartP });

  // ---- axis baseline & grid
  ctx.save();
  ctx.globalAlpha *= chartP;
  K.label(ctx, 'KOMPARASI TARIF & JARAK TEMPUH RUTE JAWA BARAT', 540, 435, { size: 22, align: 'center', color: K.PAL.accent, font: 'JetBrains Mono', spacing: 1 });
  ctx.strokeStyle = K.PAL.line; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(BAR_X, BAR_Y0 - 20); ctx.lineTo(BAR_X, BAR_Y0 + CITIES.length * (BAR_H + BAR_GAP) - 20); ctx.stroke();
  ctx.font = "400 20px 'JetBrains Mono'"; ctx.fillStyle = K.PAL.dim; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  for (let v = 0; v <= P_MAX; v += 100000) {
    const xx = BAR_X + (v / P_MAX) * BAR_W;
    ctx.fillText('Rp ' + K.num(v / 1000) + 'rb', xx, BAR_Y0 + CITIES.length * (BAR_H + BAR_GAP) + 10);
    ctx.strokeStyle = K.PAL.grid; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(xx + 0.5, BAR_Y0 - 15); ctx.lineTo(xx + 0.5, BAR_Y0 + CITIES.length * (BAR_H + BAR_GAP) - 15); ctx.stroke();
  }
  ctx.restore();

  // ---- bars per city
  const TC = [T.bdg, T.tsk, T.cms];
  CITIES.forEach((c, i) => {
    const tc = TC[i];
    const p = prog(t, tc, tc + 0.65, ease.outCubic);
    const y = BAR_Y0 + i * (BAR_H + BAR_GAP);
    const bw = BAR_W * (c.price / P_MAX);
    // show ghost track early so t=2 frame is informative
    ctx.save();
    ctx.globalAlpha *= chartP;
    ctx.fillStyle = 'rgba(160,190,240,.08)';
    ctx.beginPath(); ctx.roundRect(BAR_X, y, BAR_W, BAR_H, 8); ctx.fill();
    ctx.restore();
    K.label(ctx, c.name.toUpperCase(), BAR_X - 24, y + BAR_H / 2 - 12, { size: 26, align: 'right', color: K.PAL.text, font: 'JetBrains Mono', spacing: 1, alpha: chartP });
    K.chip(ctx, c.km + ' km', BAR_X - 105, y + BAR_H / 2 + 22, K.PAL.dim, { p: chartP, size: 18 });

    const a = clamp(p * 3);
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a;
    ctx.fillStyle = c.color;
    ctx.beginPath(); ctx.roundRect(BAR_X, y, Math.max(2, bw * ease.outCubic(clamp(p))), BAR_H, 8); ctx.fill();
    ctx.restore();
    const priceA = clamp(p * 2 - 0.5);
    K.counter(ctx, 'Rp ' + K.num(c.price), BAR_X + bw + 18, y + BAR_H / 2 + 10, { size: 32, color: c.color, align: 'left', alpha: priceA });
  });

  // ---- pattern summary panel (bottom)
  const pa = env(t, C.sby.start, T.travel, 0.3, 0.3);
  if (pa > 0) {
    K.panel(ctx, 90, 1170, 900, 130, { p: pa });
    ctx.save(); ctx.globalAlpha *= pa;
    K.label(ctx, 'POLA TARIF DOOR-TO-DOOR', 130, 1205, { size: 22, color: K.PAL.accent, font: 'JetBrains Mono', spacing: 2 });
    K.counter(ctx, '140 km', 130, 1265, { size: 42, color: K.PAL.europe, align: 'left' });
    K.label(ctx, '→', 310, 1265, { size: 40, color: K.PAL.dim, align: 'left' });
    K.counter(ctx, '300 km', 365, 1265, { size: 42, color: K.PAL.asia, align: 'left' });
    K.label(ctx, 'Rp 230rb – 300rb', 920, 1265, { size: 30, color: '#c5cee0', align: 'right', font: 'JetBrains Mono' });
    ctx.restore();
  }

  // ---- Maura Trans callout (overlay)
  const ma = prog(t, T.travel, T.travel + 0.45);
  if (ma > 0) {
    K.panel(ui, 90, 1170, 900, 130, { p: ma });
    ui.save(); ui.globalAlpha *= ma;
    K.label(ui, 'LAYANAN PENGIRIMAN HEWAN HARIAN', 130, 1205, { size: 20, color: K.PAL.accent, font: 'JetBrains Mono', spacing: 2 });
    K.counter(ui, 'Maura Trans', 540, 1258, { size: 50, color: K.PAL.accent, align: 'center' });
    K.label(ui, 'BANDUNG · TASIKMALAYA · CIAMIS · DOOR TO DOOR', 540, 1295, { size: 20, color: '#c5cee0', align: 'center', font: 'JetBrains Mono', spacing: 1 });
    ui.restore();
  }

  // ---- screen-space UI
  ui.setTransform(1, 0, 0, 1, 0, 0);
  K.title(ui, 'TARIF PAKET HEWAN · DOOR TO DOOR', 'Kirim Kucing ke Mana Aja', { p: prog(t, 0, 0.5, ease.outCubic) });
  K.source(ui, 'Sumber: mauratransmandiri.com/layanan', t, { alpha: prog(t, 0.3, 0.9) });
}
