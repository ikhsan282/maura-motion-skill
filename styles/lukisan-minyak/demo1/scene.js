// Lukisan Minyak Bergerak demo: "Lukisan Balasan Raden Saleh" (20 s).
// Diponegoro's arrest (1830) painted twice: Pieneman (c. 1835) bowed and beaten, Raden Saleh (1857) upright and
// defiant. Two painted compositions from the kit are reused at every zoom, so the short is a camera travelling
// through living canvases. 8 pictures over 6 lines: some lines cut on a word.
import * as K from '/styles/lukisan-minyak/kit.js';
const { clamp, lerp, ease, prog, env, noise } = AM.lib;

export const meta = { fps: 24, hold: 3, captions: { preset: 'elegant', y: 1470, size: 64 } };

let P, ui, C = {};
const W = (id, w) => AM.wordTime(id, w);
export async function setup(AM) {
  P = await K.painter(AM, { scale: 0.55 });
  ui = AM.layer('ui');
  for (const l of AM.timeline.lines) C[l.id] = l;
  AM.sfx('riser', 0.0, { gain: 0.3 });
  AM.sfx('boom', 0.35, { gain: 0.4, pitch: 0.8 });
  AM.sfx('swoosh_up', C.tunduk.start - 0.1, { gain: 0.25 });
  AM.sfx('thud', W('tunduk', 'kalah') - 0.05, { gain: 0.5, pitch: 0.8 });
  AM.sfx('whoosh', C.tegak.start, { gain: 0.3 });
  AM.sfx('thunder', W('tegak', 'marah') - 0.1, { gain: 0.4 });
  AM.sfx('ding', W('kepala', 'Dibuat'), { gain: 0.3 });
  AM.sfx('chime', W('diri', 'dirinya'), { gain: 0.35 });
  AM.sfx('impact', W('moral', 'kuas'), { gain: 0.45, pitch: 0.7 });
}

// ---------- shot router: a shot starts at a line or at a word inside a line ----------
const SHOTS = [];
const shot = (line, word, fn) => SHOTS.push({ line, word, fn });
const startOf = (s) => (s.word ? W(s.line, s.word) : C[s.line].start) - 0.12;
const FR = { x: 40, y: 620, w: 1000, h: 625 };
const toFrame = (px, py, R = FR) => [R.x + (px * R.w) / K.CANVAS.W, R.y + (py * R.h) / K.CANVAS.H];
const toScreen = (cam, wx, wy) => [540 + (wx - cam.x) * cam.z, 960 + (wy - cam.y) * cam.z];

// 1. HOOK: a framed painting on a dark wall; a spotlight snaps on and the camera pushes into the defiant prince.
shot('hook', null, (t, a, b) => {
  const [dx, dy] = toFrame(860, 520);
  const p = clamp((t - a) / (b - a));
  const push = ease.inOutSine(p);
  const cam = { x: lerp(540, dx, push * 0.8), y: lerp(935, dy, push * 0.8), z: lerp(1.08, 2.0, ease.inQuad(p)) };
  const g = K.view(P, cam);
  const on = prog(t, a, a + 0.45, ease.outCubic);
  K.museumWall(g, { spot: [lerp(-200, 560, on), 920, 980], a: 0.25 + 0.4 * on });
  K.goldFrame(g, FR.x, FR.y, FR.w, FR.h, { b: 56 });
  K.hang(g, FR.x, FR.y, FR.w, FR.h, (pg) => K.salehPainting(pg, t, { chin: -0.18 }));
  const sw = lerp(-300, 1400, prog(t, a + 0.05, a + 1.2));
  const gr = g.createLinearGradient(sw - 200, 0, sw + 200, 300);
  gr.addColorStop(0, 'rgba(255,235,190,0)'); gr.addColorStop(0.5, 'rgba(255,235,190,0.35)'); gr.addColorStop(1, 'rgba(255,235,190,0)');
  g.fillStyle = gr; g.fillRect(FR.x, FR.y, FR.w, FR.h);
  const pa = env(t, a + 0.25, b, 0.4, 0.2);
  K.plaque(ui, 'PENANGKAPAN DIPONEGORO, 1830', 540, 290, { size: 34, alpha: pa, sub: 'dilukis Raden Saleh · 1857', subSize: 28 });
});

// 2a. The Dutch painter Pieneman at his easel, cool north light.
shot('tunduk', null, (t, a, b) => {
  const p = (t - a) / (b - a);
  const g = K.view(P, { x: lerp(560, 500, p), y: 980, z: 1.0 + 0.1 * ease.inOutSine(p) });
  K.studio(g, t, { warm: 0, window: [760, 260, 300, 700] });
  K.easel(g, 330, 1500, { w: 560, h: 350, fn: (cg) => K.pienemanPainting(cg, t, { bowHead: 0.45 }) });
  const stroke = Math.sin(t * 6) * 0.25;
  K.figure(g, { x: 780, y: 1560, h: 760, face: -1, costume: 'pelukis', light: 1, t, pose: { armF: [1.55 + stroke, 0.35 - stroke], armB: [0.5, 1.3], hold: 'brush', head: 0.05 } });
  K.plaque(ui, 'NICOLAAS PIENEMAN', 540, 300, { size: 38, alpha: env(t, a, b, 0.25, 0.15), sub: 'pelukis Belanda · ± 1835', subSize: 28 });
});
// 2b. His version: De Kock high on the steps, Diponegoro lower, head sinking.
shot('tunduk', 'Diponegoro', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const R = { x: -260, y: 300, w: 1600, h: 1000 };
  const tilt = ease.inOutSine(clamp((t - a) / 1.4));
  const cam = { x: lerp(R.x + 1000, R.x + 790, tilt), y: lerp(R.y + 420, R.y + 640, tilt), z: lerp(1.75, 2.05, p) };
  const g = K.view(P, cam);
  g.fillStyle = '#222'; g.fillRect(-1000, -1000, 4000, 4000);
  const bowHead = lerp(0.3, 0.8, prog(t, W('tunduk', 'tertunduk') - 0.1, W('tunduk', 'tertunduk') + 0.5));
  K.hang(g, R.x, R.y, R.w, R.h, (pg) => K.pienemanPainting(pg, t, { bowHead }));
  K.plaque(ui, 'VERSI BELANDA', 540, 300, { size: 36, alpha: env(t, a, b, 0.25, 0.15), sub: 'Pieneman', subSize: 28 });
});

// 3a. Raden Saleh answers with his brush in warm light; the storm fills his canvas.
shot('tegak', null, (t, a, b) => {
  const p = (t - a) / (b - a);
  const g = K.view(P, { x: lerp(520, 580, p), y: 990, z: 1.0 + 0.12 * ease.inOutSine(p) });
  K.studio(g, t, { warm: 1, window: [40, 240, 280, 680] });
  const rect = K.easel(g, 740, 1500, { w: 560, h: 350 });
  K.paintIn(P, g, prog(t, a + 0.1, b, ease.inOutSine), (cg) => K.hang(cg, rect[0], rect[1], rect[2], rect[3], (pg) => K.salehPainting(pg, t)), { rect, seed: 5, n: 30 });
  const stroke = Math.sin(t * 7) * 0.3;
  K.figure(g, { x: 330, y: 1570, h: 780, face: 1, costume: 'saleh', light: -1, t, pose: { armF: [1.6 + stroke, 0.3 - stroke], armB: [0.6, 1.2], hold: 'brush', head: -0.02 } });
  K.radial(g, 300, 900, 420, '#ffb060', 0.18);
  K.plaque(ui, 'RADEN SALEH', 540, 300, { size: 40, alpha: env(t, a, b, 0.25, 0.15), sub: 'pelukis Jawa · 1857', subSize: 28 });
});
// 3b. His version: Diponegoro level with De Kock, chin raised; on "marah" the fist closes and the sky flashes.
shot('tegak', 'Diponegoro', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const cam = { x: lerp(820, 855, p), y: lerp(600, 510, ease.inOutSine(p)), z: lerp(2.3, 2.95, ease.inOutSine(p)) };
  const g = K.view(P, cam);
  const ang = W('tegak', 'marah');
  const react = prog(t, ang - 0.15, ang + 0.35, ease.outCubic);
  const flash = env(t, ang - 0.05, ang + 0.45, 0.05, 0.4);
  K.paintIn(P, g, prog(t, a, a + 0.8, ease.inOutSine), (cg) => K.salehPainting(cg, t, { chin: lerp(-0.06, -0.22, prog(t, a, W('tegak', 'tegak') + 0.2)), react }), { rect: [400, 100, 900, 950], seed: 9, n: 26 });
  if (flash > 0) { g.fillStyle = `rgba(255,236,200,${0.35 * flash})`; g.fillRect(0, 0, 1600, 760); }
  K.plaque(ui, 'VERSI RADEN SALEH', 540, 300, { size: 36, alpha: env(t, a + 0.1, b, 0.25, 0.15), sub: 'sejajar, tidak tunduk', subSize: 28 });
});

// 4. The Dutch heads, a touch too large: the camera walks along the officers; gold rings mark the heads.
shot('kepala', null, (t, a, b) => {
  const p = (t - a) / (b - a);
  const cam = { x: lerp(470, 650, ease.inOutSine(p)), y: 560, z: 2.5 };
  const g = K.view(P, cam);
  K.salehPainting(g, t, { headBig: lerp(1.12, 1.26, prog(t, W('kepala', 'Dibuat') - 0.2, W('kepala', 'kebesaran'))) });
  ['off1', 'off2', 'sold', 'dekock'].forEach((id, i) => {
    const [hx, hy] = K.headPos(K.castFig(id)), [sx, sy] = toScreen(cam, hx, hy - 8);
    const ra = prog(t, a + 0.25 + i * 0.25, a + 0.6 + i * 0.25, ease.outBack);
    if (ra <= 0) return;
    ui.save(); ui.strokeStyle = '#f2cf6a'; ui.lineWidth = 5; ui.setLineDash([14, 10]); ui.shadowColor = 'rgba(0,0,0,.7)'; ui.shadowBlur = 10;
    ui.beginPath(); ui.arc(sx, sy, 95 * ra, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ra); ui.stroke(); ui.restore();
  });
  K.plaque(ui, 'PARA PERWIRA BELANDA', 540, 300, { size: 34, alpha: env(t, a, b, 0.25, 0.15) });
});

// 5. Among the grieving followers, the painter painted himself.
shot('diri', null, (t, a, b) => {
  const p = (t - a) / (b - a);
  const cam = { x: lerp(1190, 1260, ease.inOutSine(p)), y: lerp(640, 680, p), z: lerp(2.3, 2.9, ease.inOutSine(p)) };
  const g = K.view(P, cam);
  const hl = prog(t, W('diri', 'melukis') - 0.1, W('diri', 'dirinya') + 0.3);
  K.salehPainting(g, t, { highlightSelf: hl });
  const [shx, shy] = K.headPos(K.castFig('self')), [sx, sy] = toScreen(cam, shx, shy + 60);
  if (hl > 0) { ui.save(); ui.globalAlpha = hl; ui.strokeStyle = '#f2cf6a'; ui.lineWidth = 6; ui.shadowColor = 'rgba(0,0,0,.7)'; ui.shadowBlur = 12; ui.beginPath(); ui.ellipse(sx, sy, 230, 330, 0, 0, Math.PI * 2 * hl); ui.stroke(); ui.restore(); }
  K.plaque(ui, 'RADEN SALEH', 540, 300, { size: 38, alpha: hl, sub: 'melukis dirinya sendiri', subSize: 26 });
});

// 6. Two versions stacked on the wall: Pieneman's dims, Saleh's glows; we fall into his painting and hold.
shot('moral', null, (t, a, b) => {
  const end = C.moral.end;
  const R1 = { x: 150, y: 230, w: 780, h: 488 }, R2 = { x: 150, y: 880, w: 780, h: 488 };
  const [dx, dy] = toFrame(860, 520, R2);
  const push = prog(t, W('moral', 'Tapi') - 0.2, end + 0.4, ease.inOutCubic);
  const cam = { x: lerp(540, dx, push), y: lerp(800, dy, push), z: lerp(1.0, 2.7, push) };
  const g = K.view(P, cam);
  K.museumWall(g, { spot: [540, lerp(400, 1100, push), 900], a: 0.5 });
  K.goldFrame(g, R1.x, R1.y, R1.w, R1.h, { b: 40 });
  K.hang(g, R1.x, R1.y, R1.w, R1.h, (pg) => K.pienemanPainting(pg, t));
  const dim = prog(t, W('moral', 'pemenang') - 0.1, W('moral', 'Tapi'));
  g.fillStyle = `rgba(20,8,6,${0.6 * dim})`; g.fillRect(R1.x - 50, R1.y - 50, R1.w + 100, R1.h + 100);
  K.goldFrame(g, R2.x, R2.y, R2.w, R2.h, { b: 40 });
  K.hang(g, R2.x, R2.y, R2.w, R2.h, (pg) => K.salehPainting(pg, t, { chin: -0.22 }));
  K.radial(g, dx, dy, 300, '#ffe6b0', 0.25 * push);
  const la = env(t, a, W('moral', 'Tapi'), 0.3, 0.3);
  K.plaque(ui, 'VERSI PEMENANG · 1835', 540, toScreen(cam, 540, R1.y - 78)[1], { size: 26, alpha: la });
  K.plaque(ui, 'VERSI RADEN SALEH · 1857', 540, toScreen(cam, 540, R2.y - 62)[1], { size: 26, alpha: la * (1 - push) });
  const fa = env(t, W('moral', 'kuas') - 0.1, AM.duration + 2, 0.4, 0.3);
  K.title(ui, 'KUAS BISA MELAWAN', 540, 330, { size: 84, alpha: fa, spacing: 4 });
  K.plaque(ui, 'RADEN SALEH · 1857', 540, 450, { size: 30, alpha: fa });
  const close = clamp((t - (AM.duration - 0.5)) / 0.5);
  if (close > 0) { ui.fillStyle = `rgba(8,4,2,${close * 0.85})`; ui.fillRect(0, 0, 1080, 1920); }
});

export function render(t, AM) {
  P.clear('#140c08');
  const list = SHOTS.filter((s) => C[s.line]);
  let i = 0;
  for (let k = 0; k < list.length; k++) if (t >= startOf(list[k])) i = k;
  const s = list[i];
  const a = Math.max(0, startOf(s)), b = list[i + 1] ? startOf(list[i + 1]) : AM.duration + 0.5;
  s.fn(t, a, b);
  P.paint(Math.floor(t * 24 / 3));
  // per cut: a quick varnish glint sweeping across the canvas
  const since = t - a;
  if (since < 0.3 && i > 0) {
    const k = since / 0.3, x = lerp(-600, 1700, k);
    const gr = ui.createLinearGradient(x - 300, 0, x + 300, 400);
    gr.addColorStop(0, 'rgba(255,230,180,0)'); gr.addColorStop(0.5, `rgba(255,230,180,${0.28 * (1 - k)})`); gr.addColorStop(1, 'rgba(255,230,180,0)');
    ui.fillStyle = gr; ui.fillRect(0, 0, 1080, 1920);
  }
}
