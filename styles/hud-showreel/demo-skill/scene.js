// HUD showreel demo-skill: "Skill Cooldown" — ulti charging, combo x3, level up.
import * as K from '/styles/hud-showreel/kit.js';
const { clamp, lerp, ease, prog, env, noise } = AM.lib;
const P = K.PAL;

export const meta = { fps: 24, hold: 1, captions: { preset: 'neon', y: 1470, size: 60, maxWords: 4 } };

let g, ui;
const C = {};
const W = (id, w) => AM.wordTime(id, w);
let T = {};
export async function setup(AM) {
  g = AM.layer('world'); ui = AM.layer('ui');
  for (const l of AM.timeline.lines) C[l.id] = l;
  T.charge0 = C.ulti.start; T.full = W('ulti', 'penuh') - 0.1;
  T.boom = W('ulti', 'meledak') - 0.1;
  T.c1 = W('combo', 'tiga'); T.c3 = W('combo', 'tiga,') >= 0 ? W('combo', 'tiga,') : W('combo', 'menyala');
  T.lvl = C.level.start + 0.4; T.lvlUp = W('level', 'setengah');
  AM.sfx('riser', T.charge0, { gain: 0.4 });
  AM.sfx('powerup', T.full, { gain: 0.55 });
  AM.sfx('boom', T.boom, { gain: 0.6 });
  AM.sfx('drum_hit', T.c1, { gain: 0.45 });
  AM.sfx('drum_hit', T.c1 + 0.35, { gain: 0.5 });
  AM.sfx('drum_hit', T.c3, { gain: 0.55, pitch: 1.2 });
  AM.sfx('chime', T.lvlUp, { gain: 0.5 });
  AM.sfx('magic', C.akhir.start + 0.2, { gain: 0.4 });
}

const SHOTS = []; const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => { const L = SHOTS.filter((x) => C[x.id]); const i = L.findIndex((x) => x.id === id); return [C[id].start - 0.12, L[i+1] ? C[L[i+1].id].start - 0.12 : AM.duration + 1]; };

// 1. hook: locked ulti icon, big countdown ring
shot('hook', (t, a, b) => {
  K.frame(g, t);
  const secs = Math.max(0, 5 - (t - 0.3));
  K.cooldown(g, 540, 800, 220, clamp(1 - secs / 5), { secs });
  K.label(g, 'ULTI TERKUNCI', 540, 1150, { size: 64 });
  K.micro(g, 'skill cooldown · 5.0s', 540, 1220, { size: 26 });
  K.panel(g, 240, 1330, 600, 90, {});
  K.label(g, 'COOLDOWN', 540, 1376, { size: 40, color: P.cyan });
  K.cornerHud(ui, t);
});
// 2. ulti: charge bar fills, then explosion flash
shot('ulti', (t, a, b) => {
  K.frame(g, t);
  const p = prog(t, T.charge0, T.full);
  const boom = t > T.boom ? clamp(1 - (t - T.boom) / 1.0) : 0;
  if (boom > 0) {
    g.save(); g.fillStyle = `rgba(255,79,216,${boom * 0.35})`; g.fillRect(0, 0, 1080, 1920);
    const r = 200 + (1 - boom) * 900;
    g.strokeStyle = `rgba(255,210,63,${boom})`; g.lineWidth = 10;
    for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(540, 800, r - i * 90, 0, Math.PI * 2); g.stroke(); }
    g.restore();
  }
  const shx = boom > 0 ? noise.n2(t * 40, 1) * 24 * boom : 0;
  g.save(); g.translate(shx, 0);
  K.cooldown(g, 540, 620, 150, t > T.full ? 1 : p * 0.95, { secs: t > T.full ? null : Math.max(0, (T.full - t)) });
  K.chargeBar(g, 140, 880, 800, 90, p, { color: P.mag, tag: 'ulti charging' });
  if (t > T.full) {
    K.label(g, 'DMG x3', 540, 1120, { size: 130, color: P.gold });
    K.micro(g, 'damage meledak tiga kali lipat', 540, 1210, { size: 26, color: P.ink });
  }
  g.restore();
  K.cornerHud(ui, t);
});
// 3. combo: three hit flashes, counter climbs to x3
shot('combo', (t, a, b) => {
  K.frame(g, t);
  const n = t > T.c3 ? 3 : t > T.c1 + 0.35 ? 2 : t > T.c1 ? 1 : 0;
  const pop = n > 0 ? clamp(1 - (t - (n === 3 ? T.c3 : n === 2 ? T.c1 + 0.35 : T.c1)) / 0.4) : 0;
  for (let i = 0; i < n; i++) {
    const ht = [T.c1, T.c1 + 0.35, T.c3][i];
    const age = t - ht;
    if (age > 0 && age < 0.6) {
      g.save(); g.globalAlpha = 1 - age / 0.6;
      g.strokeStyle = P.cyan; g.lineWidth = 6;
      g.beginPath(); g.arc(540, 700, 120 + age * 700, 0, Math.PI * 2); g.stroke(); g.restore();
    }
  }
  K.combo(g, 540, 700, Math.max(1, n), pop);
  // hit pips
  for (let i = 0; i < 3; i++) {
    g.save();
    g.fillStyle = i < n ? P.gold : 'rgba(255,255,255,0.12)';
    if (i < n) { g.shadowColor = P.gold; g.shadowBlur = 20; }
    g.beginPath(); g.arc(390 + i * 150, 1000, 44, 0, Math.PI * 2); g.fill(); g.restore();
    K.label(g, String(i + 1), 390 + i * 150, 1001, { size: 44, color: i < n ? '#000' : P.dim });
  }
  if (n >= 3) K.micro(g, 'musuh terpental', 540, 1120, { size: 28, color: P.gold });
  K.cornerHud(ui, t);
});
// 4. level: XP bar fills, LEVEL UP banner, cooldown ring halves
shot('level', (t, a, b) => {
  K.frame(g, t);
  const xp = prog(t, C.level.start, T.lvlUp);
  K.xpBar(g, 140, 420, 800, xp);
  K.micro(g, 'xp', 540, 390, { size: 24 });
  K.levelUp(g, 540, 700, clamp((t - T.lvl) / 0.8), 12);
  if (t > T.lvlUp) {
    K.cooldown(g, 340, 1100, 130, clamp((t - T.lvlUp) / 2.5), { secs: Math.max(0, 2.5 - (t - T.lvlUp)) });
    K.label(g, 'COOLDOWN −50%', 680, 1100, { size: 44, color: P.green, align: 'left' });
    K.micro(g, 'ulti kedua 2x lebih cepat', 680, 1160, { size: 24, align: 'left' });
  }
  K.cornerHud(ui, t);
});
// 5. akhir: ready ulti glows, hold
shot('akhir', (t, a, b) => {
  K.frame(g, t);
  const p = ease.outBack(clamp((t - a) / 0.5), 1.4);
  g.save(); g.translate(540, 800); g.scale(p, p); g.translate(-540, -800);
  K.cooldown(g, 540, 800, 220, 1, {});
  g.restore();
  K.label(g, 'HARGA SEBUAH', 540, 1200, { size: 56 });
  K.label(g, 'KEMENANGAN', 540, 1280, { size: 84, color: P.gold });
  K.cornerHud(ui, t);
});

export function render(t) {
  let cur = SHOTS[0];
  for (const s of SHOTS) { if (C[s.id] && t >= C[s.id].start - 0.12) cur = s; }
  const [a, b] = span(cur.id);
  // drift
  g.save(); g.translate(noise.n2(t * 2, 7) * 6, noise.n2(t * 2, 9) * 6);
  cur.fn(t, a, b);
  g.restore();
  ui.setTransform(1, 0, 0, 1, 0, 0);
  const f = clamp((t - (AM.duration - 0.4)) / 0.4);
  if (f > 0) { ui.fillStyle = `rgba(7,11,20,${f * 0.9})`; ui.fillRect(0, 0, 1080, 1920); }
  g.setTransform(1, 0, 0, 1, 0, 0);
}
