// Infografis Data demo (20 s): "Jika Dunia Hanya 100 Orang".
// 100 pictograms pop into a grid, light up by continent and regroup into a waffle chart (59/18/9/13/1),
// the camera dives into Asia to find Indonesia (about 3.5 of 100, 4th largest), and closes on 1 in 29.
import * as K from '/styles/infografis-data/kit.js';
const { clamp, lerp, ease, prog, env } = AM.lib;

export const meta = { fps: 24, hold: 1, captions: { preset: 'clean', y: 1480, size: 54, box: { fill: 'rgba(10,14,25,.85)', pad: 16, radius: 12, border: 'rgba(40,224,255,.35)', borderW: 2 } } };

let ctx, ui;
const C = {};
const W = (id, w) => AM.wordTime(id, w);
// continents (UN WPP 2024 estimates, rounded to 100 people; Americas = Latin America + Northern America)
const GROUPS = [
  { id: 'asia', name: 'Asia', n: 59, color: K.PAL.asia },
  { id: 'africa', name: 'Afrika', n: 18, color: K.PAL.africa },
  { id: 'europe', name: 'Eropa', n: 9, color: K.PAL.europe },
  { id: 'americas', name: 'Amerika', n: 13, color: K.PAL.americas },
  { id: 'oceania', name: 'Oseania', n: 1, color: K.PAL.oceania },
];
const PER = K.perm(100, 7);
const ICON = []; // per icon: group, slot, hook pos, waffle pos
const WAF = { x0: 400, y0: 470, pitch: 58, gap: 30 };
const rowsStart = [];
(() => {
  let row = 0, k = 0;
  GROUPS.forEach((g, gi) => {
    rowsStart[gi] = row;
    for (let s = 0; s < g.n; s++, k++) {
      const i = PER[k];
      ICON[i] = { g: gi, slot: s, hook: K.gridPos(i, 10, 72, 216, 470), waf: [WAF.x0 + (s % 10) * WAF.pitch, WAF.y0 + (row + Math.floor(s / 10)) * WAF.pitch + gi * WAF.gap] };
    }
    row += Math.ceil(g.n / 10);
  });
})();
let T = {};
export async function setup(AM) {
  ctx = AM.layer('world'); ui = AM.layer('ui');
  for (const l of AM.timeline.lines) C[l.id] = l;
  T.g = [W('asia', '59'), W('asia', '18'), W('lain', 'eropa'), W('lain', 'amerika'), W('lain', 'oseania')].map((x) => x - 0.1);
  T.indo = W('indo', 'indonesia'); T.rank = W('indo', 'terbanyak') - 0.15; T.moral = C.moral.start - 0.12; T.n29 = W('moral', '29');
  AM.sfx('pop', 0.05, { gain: 0.35 });
  AM.sfx('whoosh', T.g[0], { gain: 0.35 });
  AM.sfx('pop', T.g[1] + 0.1, { gain: 0.35, pitch: 1.2 });
  AM.sfx('click', T.g[2] + 0.1, { gain: 0.35 });
  AM.sfx('ding', T.indo + 0.2, { gain: 0.45 });
  AM.sfx('swoosh_up', T.rank, { gain: 0.3 });
  AM.sfx('whoosh', T.moral, { gain: 0.3, pitch: 0.8 });
  AM.sfx('chime', T.n29, { gain: 0.45 });
}

// the 29 people at the end: Indonesia's icon plus 28 others
const MORAL = [PER[0], ...PER.slice(60, 88)];
const isIndo = (i) => ICON[i].g === 0 && ICON[i].slot < 4;

export function render(t) {
  K.dashboard(ctx, t);
  // camera: zoom into Asia to find Indonesia, then back out for the ranking
  const zin = prog(t, T.indo - 0.25, T.indo + 0.45) * (1 - prog(t, T.rank, T.rank + 0.5));
  const z = 1 + 0.75 * zin, cx = lerp(540, 560, zin), cy = lerp(960, 560, zin);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(540, 960); ctx.scale(z, z); ctx.translate(-cx, -cy);

  const mo = prog(t, T.moral, T.moral + 0.9);
  const dimRank = env(t, T.rank, T.moral + 0.2, 0.4, 0.3);
  for (let i = 0; i < 100; i++) {
    const I = ICON[i], g = GROUPS[I.g], tg = T.g[I.g];
    const appear = K.pop(t, (I.hook[1] - 470) / 72 * 0.07 + (I.hook[0] - 216) / 72 * 0.025, 0.3);
    const lit = prog(t, tg, tg + 0.25);
    const mv = K.pr(t, tg + 0.05 + I.slot * 0.008, tg + 0.75 + I.slot * 0.008);
    let x = lerp(I.hook[0], I.waf[0], mv), y = lerp(I.hook[1], I.waf[1], mv), s = lerp(1.35, 1.12, mv);
    let col = lit > 0.5 ? g.color : K.PAL.idle, alpha = 1, frac = 1, glow = 0;
    if (isIndo(i)) { const ip = prog(t, T.indo + 0.1 + I.slot * 0.12, T.indo + 0.3 + I.slot * 0.12); if (ip > 0.5) { col = K.PAL.indo; glow = ip; } if (I.slot === 3 && ip > 0) frac = lerp(1, 0.5, ip); }
    alpha *= 1 - dimRank * (isIndo(i) ? 0.2 : 0.75);
    // the ending: 29 people regroup, the rest fade away
    const mi = MORAL.indexOf(i);
    if (mo > 0) {
      if (mi >= 0) { const [mx, my] = K.gridPos(mi, 6, 112, 540 - 2.5 * 112, 640); const e = K.pr(t, T.moral + mi * 0.012, T.moral + 0.8 + mi * 0.012); x = lerp(x, mx, e); y = lerp(y, my, e); s = lerp(s, 2.0, e); if (mi > 0) col = lerp(0, 1, e) > 0.5 ? '#c9d3e6' : col; else { col = K.PAL.indo; frac = 1; glow = 1; } }
      else alpha *= 1 - mo;
    }
    K.person(ctx, x, y, s * appear, col, { alpha, frac, glow: glow + (lit > 0 && lit < 1 ? 1 - lit : 0) });
  }
  // group labels (left of the waffle)
  GROUPS.forEach((g, gi) => {
    const tg = T.g[gi], a = prog(t, tg, tg + 0.3) * (1 - mo) * (1 - dimRank * 0.8);
    if (a <= 0) return;
    const y = WAF.y0 + rowsStart[gi] * WAF.pitch + gi * WAF.gap + (g.n > 10 ? WAF.pitch * 0.5 : 0);
    const n = Math.round(g.n * prog(t, tg, tg + 0.7, ease.outCubic));
    K.counter(ctx, String(n), 330, y - 6, { size: 66, color: g.color, align: 'right', alpha: a });
    K.label(ctx, g.name.toUpperCase(), 330, y + 38, { size: 22, align: 'right', alpha: a, font: 'JetBrains Mono', spacing: 2 });
  });
  // Indonesia callout inside the zoom
  const ia = env(t, T.indo + 0.3, T.rank + 0.2, 0.3, 0.3);
  if (ia > 0) {
    const [x0, y0] = ICON[PER[0]].waf;
    ctx.save(); ctx.globalAlpha = ia; ctx.strokeStyle = K.PAL.indo; ctx.lineWidth = 2.5; ctx.setLineDash([6, 5]);
    ctx.beginPath(); ctx.roundRect(x0 - 26, y0 - 32, WAF.pitch * 3.5 + 22, 62, 10); ctx.stroke(); ctx.restore();
    K.chip(ctx, 'INDONESIA ≈ 3,5', x0 - 20, y0 - 70, K.PAL.indo, { p: ia, size: 22 });
  }

  // ------------------------------------------------------------ screen-space UI
  ui.setTransform(1, 0, 0, 1, 0, 0);
  K.title(ui, 'DATA PBB · 2024', 'Jika dunia 100 orang', { p: prog(t, 0, 0.5, ease.outCubic) * (1 - mo * 0) });
  // counter 0 -> 100 during the hook, then the 100% bar fills continent by continent
  const hc = prog(t, 0.05, 1.3, ease.outCubic), ha = 1 - prog(t, T.g[0] - 0.3, T.g[0]);
  K.counter(ui, String(Math.round(100 * hc)), 980, 190, { size: 84, align: 'right', color: K.PAL.accent, alpha: ha });
  K.label(ui, '1 orang ≈ 82 juta jiwa', 80, 360, { size: 30, alpha: env(t, 0.6, T.g[0], 0.3, 0.3), color: '#c5cee0' });
  const segA = prog(t, T.g[0] - 0.2, T.g[0] + 0.1) * (1 - mo);
  if (segA > 0) { ui.save(); ui.globalAlpha = segA * (1 - dimRank * 0.7); K.stackBar(ui, 80, 340, 860, 22, GROUPS.map((g, gi) => ({ v: g.n, color: g.color, p: prog(t, T.g[gi], T.g[gi] + 0.6) }))); ui.restore(); }
  // ranking panel: 4th most populous country
  const rp = prog(t, T.rank, T.rank + 0.45, ease.outCubic) * (1 - mo);
  if (rp > 0) {
    K.panel(ui, 70, 760, 940, 520, { p: rp });
    ui.save(); ui.globalAlpha = rp;
    K.label(ui, 'NEGARA TERPADAT · per 100 orang', 110, 815, { size: 24, font: 'JetBrains Mono', color: K.PAL.accent, spacing: 1 });
    const rows = [['1', 'India', 17.8, K.PAL.asia], ['2', 'Tiongkok', 17.4, K.PAL.asia], ['3', 'Amerika Serikat', 4.2, K.PAL.americas], ['4', 'Indonesia', 3.5, K.PAL.indo]];
    rows.forEach(([r, n, v, c], k) => { const p = prog(t, T.rank + 0.15 + k * 0.12, T.rank + 0.75 + k * 0.12); K.hbar(ui, 400, 890 + k * 96, 500 * v / 17.8, 44, p, c, { name: n, value: K.num(v, 1), hi: k === 3, alpha: clamp(p * 3) }); });
    K.axis(ui, 400, 1250, 500, [[0, '0'], [0.5, '9'], [1, '18']], { p: rp });
    ui.restore();
  }
  // the ending: 1 : 29
  if (mo > 0) {
    const pa = K.pop(t, T.n29 - 0.1, 0.4);
    ui.save(); ui.globalAlpha = clamp(pa * 1.5);
    K.counter(ui, '1', 400, 400, { size: 170, color: K.PAL.indo, align: 'right' });
    K.counter(ui, ':', 470, 390, { size: 150, color: K.PAL.dim });
    K.counter(ui, '29', 540, 400, { size: 170, align: 'left' });
    K.label(ui, 'MANUSIA DI BUMI ADALAH ORANG INDONESIA', 540, 500, { size: 24, align: 'center', font: 'JetBrains Mono', color: '#c5cee0', spacing: 1, alpha: prog(t, W('moral', 'indonesia') - 0.3, W('moral', 'indonesia') + 0.3) });
    ui.restore();
  }
  K.source(ui, 'Sumber: PBB, WPP 2024 · dibulatkan', t, { alpha: prog(t, 0.3, 0.9) });
}
