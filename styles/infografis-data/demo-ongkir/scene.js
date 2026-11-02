// Infografis Data demo-ongkir: "Ongkir ke Mana Aja?".
// Bar chart per kota (Jakarta/Bandung/Solo/Surabaya) — makin jauh makin mahal.
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
const BAR_X = 380, BAR_W = 520, BAR_H = 64, BAR_GAP = 36, BAR_Y0 = 530;

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

  // ---- axis baseline
  ctx.save();
  ctx.globalAlpha *= chartP;
  ctx.strokeStyle = K.PAL.line; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(BAR_X, BAR_Y0 - 20); ctx.lineTo(BAR_X, BAR_Y0 + CITIES.length * (BAR_H + BAR_GAP) - 20); ctx.stroke();
  ctx.font = "400 22px 'JetBrains Mono'"; ctx.fillStyle = K.PAL.dim; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  for (let v = 0; v <= P_MAX; v += 50000) {
    const yy = BAR_Y0 + CITIES.length * (BAR_H + BAR_GAP) - 20 - (v / P_MAX) * (CITIES.length * (BAR_H + BAR_GAP) - 40);
    ctx.fillText(K.num(v), BAR_X - 16, yy);
    ctx.strokeStyle = K.PAL.grid; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(BAR_X, yy + 0.5); ctx.lineTo(BAR_X + BAR_W, yy + 0.5); ctx.stroke();
  }
  ctx.restore();

  // ---- bars per city
  const TC = [T.bdg, T.tsk, T.cms];
  CITIES.forEach((c, i) => {
    const tc = TC[i];
    const p = prog(t, tc, tc + 0.55, ease.outCubic);
    const y = BAR_Y0 + i * (BAR_H + BAR_GAP);
    const bw = BAR_W * (c.price / P_MAX);
    const a = clamp(p * 3);
    if (a <= 0) return;
    // bg track
    ctx.save(); ctx.globalAlpha *= a;
    ctx.fillStyle = 'rgba(160,190,240,.08)'; ctx.beginPath(); ctx.roundRect(BAR_X, y, BAR_W, BAR_H, 8); ctx.fill();
    // bar
    ctx.fillStyle = c.color; ctx.beginPath(); ctx.roundRect(BAR_X, y, Math.max(2, bw * ease.outCubic(clamp(p))), BAR_H, 8); ctx.fill();
    ctx.restore();
    // city label (left)
    K.label(ctx, c.name.toUpperCase(), BAR_X - 24, y + BAR_H / 2, { size: 26, align: 'right', color: K.PAL.text, font: 'JetBrains Mono', spacing: 1, alpha: a });
    // km chip
    K.chip(ctx, c.km + ' km', BAR_X - 130, y + BAR_H / 2, K.PAL.dim, { p: a, size: 20 });
    // price label (right of bar)
    const priceA = clamp(p * 2 - 0.6);
    K.counter(ctx, 'Rp ' + K.num(c.price), BAR_X + bw + 18, y + BAR_H / 2, { size: 32, color: c.color, align: 'left', alpha: priceA });
    // per-kg sublabel
    K.label(ctx, 'paket', BAR_X + bw + 18 + (K.num(c.price).length * 18 + 110), y + BAR_H / 2 + 4, { size: 18, color: K.PAL.dim, alpha: priceA });
  });

  // ---- pattern summary panel (bottom)
  const pa = env(t, T.pola, T.travel, 0.3, 0.3);
  if (pa > 0) {
    K.panel(ctx, 90, 1170, 900, 130, { p: pa });
    ctx.save(); ctx.globalAlpha *= pa;
    K.label(ctx, 'POLA', 130, 1200, { size: 22, color: K.PAL.accent, font: 'JetBrains Mono', spacing: 2 });
    K.counter(ctx, '130 km', 130, 1255, { size: 40, color: K.PAL.americas, align: 'left' });
    K.label(ctx, '→', 320, 1255, { size: 40, color: K.PAL.dim, align: 'left' });
    K.counter(ctx, '780 km', 380, 1255, { size: 40, color: K.PAL.indo, align: 'left' });
    K.label(ctx, '= 4× ongkir', 580, 1255, { size: 28, color: '#c5cee0', align: 'left' });
    K.counter(ctx, '4×', 870, 1255, { size: 44, color: K.PAL.indo, align: 'right' });
    ctx.restore();
  }

  // ---- Maura Trans callout (overlay)
  const ma = env(t, T.travel, T.tutup + 0.3, 0.4, 0.3);
  if (ma > 0) {
    K.panel(ui, 90, 1170, 900, 130, { p: ma });
    ui.save(); ui.globalAlpha *= ma;
    K.label(ui, 'DILAYANI RUTIN', 130, 1200, { size: 22, color: K.PAL.accent, font: 'JetBrains Mono', spacing: 2 });
    K.counter(ui, 'Maura Trans', 540, 1260, { size: 52, color: K.PAL.accent, align: 'center' });
    K.label(ui, 'JAK · BDG · SOL · SBY · setiap hari', 540, 1305, { size: 22, color: '#c5cee0', align: 'center', font: 'JetBrains Mono', spacing: 1 });
    ui.restore();
  }

  // ---- screen-space UI
  ui.setTransform(1, 0, 0, 1, 0, 0);
  K.title(ui, 'ONGKIR PAKET · 1 KG', 'Ongkir ke Mana Aja?', { p: prog(t, 0, 0.5, ease.outCubic) });
  K.source(ui, 'Sumber: Maura Trans · tarif contoh dari Solo', t, { alpha: prog(t, 0.3, 0.9) });
}
