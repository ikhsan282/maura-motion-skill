// Neo-Brutalist Bento demo (20 s): "Ke Mana Perginya Uang Kopi Susu Kekinianmu?"
// One bento board that reflows on hard springs; the cup character stays on screen the whole time.
// All money figures are labelled PERKIRAAN (illustrative estimates, see STYLE.md for sources).
import * as K from '/styles/neo-brutalist/kit.js';
const { clamp, lerp, ease, env } = AM.lib;
const P = K.PAL;

export const meta = { fps: 24, hold: 1, captions: { preset: 'comic', y: 1445, size: 74 } };

let ctx;
const C = {};
const W = (id, w) => AM.wordTime(id, w);
// word times are estimated from caption text; lines with spoken numbers use fractions of the line
const F = (id, f) => C[id].start + f * (C[id].end - C[id].start);
let TILES = {}, T = {};
const ING = [['KOPI', 2500, K.ICON.bean, 0.62], ['SUSU', 2000, K.ICON.milk, 0.72], ['GULA', 500, K.ICON.sugar, 0.81], ['GELAS & ES', 1500, K.ICON.cup, 0.9]];
const REST = [['SEWA', K.ICON.home, P.lavender, 'sewa'], ['GAJI BARISTA', K.ICON.person, P.yellow, 'gaji'], ['LISTRIK', K.ICON.bolt, P.pink, 'listrik'], ['UNTUNG KEDAI', K.ICON.coins, P.lime, 'untung']];
const Q = [[60, 640, 468, 230], [552, 640, 468, 230], [60, 900, 468, 230], [552, 900, 468, 230]];

export async function setup(AM) {
  ctx = AM.layer('board');
  for (const l of AM.timeline.lines) C[l.id] = l;
  const s1 = C.bahan.start - 0.15, s2 = C.sisa.start - 0.15, s3 = C.petani.start - 0.15, s4 = C.akhir.start - 0.15;
  T = { s1, s2, s3, s4, price: F('hook', 0.2), farmer: F('hook', 0.46), rp1300: F('hook', 0.8), split: W('petani', 'petani') - 0.1, five: W('akhir', 'persen') - 0.2 };
  TILES = {
    cup: [[0, null], [0.02, [60, 170, 468, 700]], [s1, [60, 170, 330, 446]], [s4, [60, 170, 468, 700]]],
    price: [[0, null], [0.18, [552, 170, 468, 330]], [s1, [414, 170, 606, 211]], [s4, null]],
    farmer: [[0, null], [T.farmer - 0.1, [552, 524, 468, 346]], [s1, null]],
    strip: [[0, null], [T.rp1300 - 0.05, [60, 900, 960, 240]], [s1, null]],
    bahanTot: [[0, null], [s1 + 0.05, [414, 405, 606, 211]], [s2, null]],
    sisaTot: [[0, null], [s2 + 0.1, [414, 405, 606, 211]], [s3, null]],
    pct: [[0, null], [s4 + 0.15, [552, 170, 468, 700]]],
    grid: [[0, null], [s4 + 0.3, [60, 900, 960, 330]]],
  };
  ING.forEach((g, i) => { TILES['ing' + i] = [[0, null], [F('bahan', g[3]) - 0.15, Q[i]], [s2, null]]; });
  TILES.ing0.push([s3, [60, 640, 960, 490]], [s4, null]);
  REST.forEach((g, i) => { TILES['rest' + i] = [[0, null], [W('sisa', g[3]) - 0.12, Q[i]], [s3, null]]; });
  AM.sfx('stamp', T.price + 0.1, { gain: 0.45 });
  AM.sfx('pop', T.farmer, { gain: 0.4 });
  AM.sfx('coin', T.rp1300, { gain: 0.4 });
  AM.sfx('pop', F('bahan', 0.62) - 0.1, { gain: 0.35, pitch: 1.2 });
  AM.sfx('thud', s2 + 0.1, { gain: 0.45 });
  AM.sfx('coin', T.split + 0.2, { gain: 0.35, pitch: 1.2 });
  AM.sfx('ding', T.five, { gain: 0.45 });
}
const R = (id, t) => K.rectAt(t, TILES[id]);

// ---------------------------------------------------------------- tile contents
function draw(t) {
  // header strip (mono, top-left)
  K.text(ctx, 'STRUK SEGELAS KOPI SUSU', 60, 112, { size: 26, font: K.FONT.mono, weight: 700 });
  K.pill(ctx, 'PERKIRAAN', 1020 - 120, 112, { size: 22, fill: P.yellow, align: 'right', shadow: 3 });

  // cup tile
  const cu = R('cup', t);
  const mood = t > W('hook', 'cuma') - 0.1 && t < C.bahan.start ? 'shock' : t > T.split && t < C.akhir.start + 0.6 ? 'shock' : 'happy';
  K.tile(ctx, cu, { fill: P.yellow, t, hatchIt: true, hatchColor: 'rgba(17,17,17,0.08)' });
  K.inTile(ctx, cu, () => {
    const s = cu.h / 560;
    const lastHit = [T.price, T.farmer, T.rp1300, T.s1, T.s2, T.s3, T.s4].filter((x) => x < t).pop() || -9;
    const sq = Math.exp(-(t - lastHit) * 6) * Math.sin((t - lastHit) * 22);
    K.cupGuy(ctx, cu.x + cu.w / 2, cu.y + cu.h - 40 * s, 1.15 * s, { t, mood, squash: sq, wave: t > T.s4 + 0.5 ? 1 : 0, look: Math.sin(t * 0.8) });
    K.pill(ctx, 'ES KOPI SUSU', cu.x + 24, cu.y + 40, { size: Math.max(16, 22 * s), shadow: 3 });
  });

  // price
  const pr = R('price', t);
  K.tile(ctx, pr, { fill: P.cobalt });
  K.inTile(ctx, pr, () => {
    const big = pr.h > 200;
    K.text(ctx, 'HARGA SEGELAS', pr.x + 30, pr.y + 42, { size: 22, font: K.FONT.mono, weight: 700, color: P.white });
    K.text(ctx, K.rp(Math.round(K.count(t, 0.1, Math.max(0.5, T.price + 0.35), 0, 25000) / 100) * 100), pr.x + 30, pr.y + pr.h * 0.58, { size: big ? 96 : 84, color: P.white, maxW: pr.w - 60 });
  });

  // farmer
  const fa = R('farmer', t);
  K.tile(ctx, fa, { fill: P.lime });
  K.inTile(ctx, fa, () => {
    K.ICON.leaf(ctx, fa.x + 56, fa.y + 50, 44);
    K.text(ctx, 'PETANI KOPI', fa.x + 92, fa.y + 52, { size: 24, font: K.FONT.mono, weight: 700 });
    const a = K.sp(t, T.rp1300 - 0.1, 0.45, 0.5);
    K.text(ctx, a > 0 ? K.rp(Math.round(K.count(t, T.rp1300 - 0.1, 0.6, 0, 1300) / 100) * 100) : '?', fa.x + 30, fa.y + 190, { size: 100, maxW: fa.w - 60 });
    K.pill(ctx, '≈ per gelas', fa.x + 30, fa.y + 286, { size: 22, shadow: 3 });
  });

  // 5% strip
  const st = R('strip', t);
  K.tile(ctx, st, { fill: P.white });
  K.inTile(ctx, st, () => {
    K.text(ctx, 'BAGIAN PETANI DARI HARGA SEGELAS', st.x + 30, st.y + 46, { size: 22, font: K.FONT.mono, weight: 700 });
    const p = clamp((t - T.rp1300) / 0.5) * 0.052;
    K.bar(ctx, st.x + 30, st.y + 100, st.w - 60, 96, p, { fill: P.lime, t });
    K.text(ctx, '≈ 5%', st.x + 30 + (st.w - 60) * 0.052 + 24, st.y + 150, { size: 40, alpha: clamp((t - T.rp1300 - 0.3) / 0.2) });
  });

  // ingredients total
  const bt = R('bahanTot', t);
  K.tile(ctx, bt, { fill: P.coral });
  K.inTile(ctx, bt, () => {
    const shown = Math.round(K.count(t, F('bahan', 0.27) - 0.1, 0.7, 0, 6500) / 100) * 100;
    K.text(ctx, 'BAHAN', bt.x + 30, bt.y + 40, { size: 22, font: K.FONT.mono, weight: 700 });
    K.text(ctx, '≈ ' + K.rp(shown), bt.x + 30, bt.y + 130, { size: 80, maxW: bt.w - 60 });
  });
  ING.forEach(([name, v, icon], i) => {
    const r = R('ing' + i, t);
    if (!K.tile(ctx, r, { fill: P.white })) return;
    K.inTile(ctx, r, () => {
      const wide = r.w > 700;
      if (!wide) {
        icon(ctx, r.x + 58, r.y + 62, 60);
        K.text(ctx, name, r.x + 104, r.y + 62, { size: 28, font: K.FONT.mono, weight: 700 });
        K.text(ctx, K.rp(v), r.x + 30, r.y + 136, { size: 48 });
        const p = clamp((t - F('bahan', ING[i][3]) + 0.1) / 0.4) * (v / 2500);
        K.bar(ctx, r.x + 26, r.y + 172, r.w - 52, 34, ease.outBack(clamp(p / Math.max(0.01, v / 2500))) * (v / 2500), { fill: [P.coffee, P.milk, P.yellow, P.lavender][i], t });
      } else { // biji kopi split: petani vs the rest of the chain
        icon(ctx, r.x + 60, r.y + 60, 60);
        K.text(ctx, 'HARGA BIJI KOPI PER GELAS', r.x + 110, r.y + 50, { size: 26, font: K.FONT.mono, weight: 700 });
        K.text(ctx, '≈ Rp2.500', r.x + r.w - 30, r.y + 56, { size: 44, align: 'right' });
        const p = ease.outCubic(clamp((t - T.split) / 0.6));
        const bx = r.x + 30, by = r.y + 150, bw = r.w - 60, bh = 150, pw = bw * 0.52 * p;
        AM.lib.roundRect(ctx, bx, by, bw, bh, 20); ctx.fillStyle = P.coral; ctx.fill();
        K.hatch(ctx, bx, by, bw, bh, { t, r: 20, color: 'rgba(17,17,17,0.15)' });
        if (pw > 2) { ctx.save(); AM.lib.roundRect(ctx, bx, by, bw, bh, 20); ctx.clip(); ctx.fillStyle = P.lime; ctx.fillRect(bx, by, pw, bh); ctx.lineWidth = 4; ctx.strokeStyle = P.ink; ctx.beginPath(); ctx.moveTo(bx + pw, by); ctx.lineTo(bx + pw, by + bh); ctx.stroke(); ctx.restore(); }
        AM.lib.roundRect(ctx, bx, by, bw, bh, 20); ctx.lineWidth = 4; ctx.strokeStyle = P.ink; ctx.stroke();
        K.text(ctx, 'PETANI ≈ Rp1.300', bx + 24, by + bh / 2, { size: 30, alpha: clamp(p * 2), maxW: bw * 0.5 - 40 });
        K.text(ctx, 'ROASTER · PEDAGANG', bx + bw - 24, by + bh / 2, { size: 22, font: K.FONT.mono, weight: 700, align: 'right', alpha: clamp(p * 2) });
        K.pill(ctx, '≈ SEPARUH', bx + bw * 0.52, by + bh + 80, { size: 24, fill: P.lime, align: 'center', alpha: clamp((t - T.split - 0.4) / 0.2) });
      }
    });
  });

  // the rest of the money
  const srt = R('sisaTot', t);
  K.tile(ctx, srt, { fill: P.cobalt });
  K.inTile(ctx, srt, () => {
    K.text(ctx, 'SISANYA', srt.x + 30, srt.y + 40, { size: 22, font: K.FONT.mono, weight: 700, color: P.white });
    K.text(ctx, '≈ Rp18.500', srt.x + 30, srt.y + 130, { size: 80, color: P.white, maxW: srt.w - 60 });
  });
  REST.forEach(([name, icon, fill], i) => {
    const r = R('rest' + i, t);
    if (!K.tile(ctx, r, { fill, t, hatchIt: true, hatchColor: 'rgba(17,17,17,0.12)' })) return;
    K.inTile(ctx, r, () => {
      const [jx, jy] = K.jit(t, W('sisa', REST[i][3]) - 0.12);
      icon(ctx, r.x + 70 + jx, r.y + r.h / 2 + jy, 76, P.white);
      K.text(ctx, name, r.x + 130, r.y + r.h / 2, { size: 34, maxW: r.w - 160 });
    });
  });

  // finale: 5% and the 100-box glass
  const pc = R('pct', t);
  K.tile(ctx, pc, { fill: P.lime });
  K.inTile(ctx, pc, () => {
    K.text(ctx, 'UNTUK PETANI', pc.x + 30, pc.y + 50, { size: 24, font: K.FONT.mono, weight: 700 });
    const n = Math.round(K.count(t, T.five - 0.3, 0.6, 0, 5));
    K.text(ctx, n + '%', pc.x + pc.w / 2, pc.y + 340, { size: 250, align: 'center' });
    K.ICON.leaf(ctx, pc.x + pc.w / 2, pc.y + 560, 110, P.white);
  });
  const gr = R('grid', t);
  K.tile(ctx, gr, { fill: P.white });
  K.inTile(ctx, gr, () => {
    K.text(ctx, '1 GELAS = 100 KOTAK', gr.x + 30, gr.y + 44, { size: 22, font: K.FONT.mono, weight: 700 });
    const cs = 42, gx = gr.x + 30, gy = gr.y + 86;
    for (let j = 0; j < 5; j++) for (let i = 0; i < 20; i++) {
      const k = j * 20 + i, on = k < 5 && t > T.five + k * 0.08;
      const x = gx + i * (cs + 3.2), y = gy + j * (cs + 3.2);
      ctx.fillStyle = on ? P.lime : (k < 5 ? '#fff' : '#EDE9DD'); ctx.fillRect(x, y, cs, cs);
      ctx.lineWidth = on ? 3.5 : 1.5; ctx.strokeStyle = on ? P.ink : 'rgba(17,17,17,0.25)'; ctx.strokeRect(x, y, cs, cs);
    }
  });
}

export function render(t) {
  K.stage(ctx, t);
  draw(t);
  const f = clamp((t - (AM.duration - 0.35)) / 0.35);
  if (f > 0) { ctx.fillStyle = `rgba(244,241,232,${f * 0.85})`; ctx.fillRect(0, 0, 1080, 1920); }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
