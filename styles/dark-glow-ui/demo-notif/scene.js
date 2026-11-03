// Dark Glow Product UI demo-notif: "Notifikasi Tidak Pernah Tidur" (digital detox).
// One hero object, never cut: a phone on the lock screen. Notifications keep sliding in (FOMO),
// a red badge counter climbs, the screen keeps waking. Then the phone is turned face-down / screen
// dims and the notifs fade out: "matikan notif, rebut kembali harimu."
import * as K from '/styles/dark-glow-ui/kit.js';
const { clamp, lerp, ease, prog, env } = AM.lib;
const P = K.PAL, R = K.RGB;

export const meta = { fps: 24, hold: 1, captions: { preset: 'neon', y: 1482, size: 52 } };

let bg, world, ui, fx;
const C = {};
const W = (id, w) => AM.wordTime(id, w);

const PH = { x: 540, y: 1010, s: 1.18 };
const toW = (ph, lx, ly) => [ph.x + (lx - 195) * ph.s, ph.y + (ly - 422) * ph.s];

let CAM = [], T = {};
const NOTIFS = [
  { app: 'IG', name: 'Instagram', color: R.pink,   txt: '2 suka baru', time: 'sekarang' },
  { app: 'WA', name: 'WhatsApp',  color: R.mint,   txt: 'Pesan dari Rina', time: 'sekarang' },
  { app: 'X',  name: 'X',         color: R.blue,   txt: 'Tren #1 untukmu', time: 'sekarang' },
  { app: 'TG', name: 'Telegram',  color: R.cyan,   txt: '3 pesan baru', time: 'sekarang' },
  { app: 'EM', name: 'Email',     color: R.violet, txt: 'Kamu punya 12 email', time: 'sekarang' },
];
const BADGE = 99;

export async function setup(AM) {
  world = AM.layer('world'); ui = AM.layer('ui'); bg = world; fx = ui;
  for (const l of AM.timeline.lines) C[l.id] = l;
  T.dim = C.akhir.start - 0.4;
  CAM = [
    [0, 540, 1010, 1.0],
    [0.2, 540, 1010, 1.06],
    [C.fomo.start - 0.2, 540, 1010, 1.18, 0.02],
    [C.layar.start - 0.2, 540, 1010, 1.28, 0.03],
    [C.otak.start - 0.2, 540, 1010, 1.34, 0.04],
    [T.dim, 540, 1010, 1.0, 0],
    [AM.duration, 540, 1010, 1.0],
  ];
  AM.sfx('pop', C.hook.start + 0.4, { gain: 0.4, pitch: 1.3 });
  AM.sfx('pop', C.fomo.start + 0.3, { gain: 0.4, pitch: 1.5 });
  AM.sfx('pop', C.layar.start + 0.3, { gain: 0.4, pitch: 1.7 });
  AM.sfx('pop', C.otak.start + 0.3, { gain: 0.4, pitch: 1.9 });
  AM.sfx('whoosh', T.dim, { gain: 0.4 });
  AM.sfx('chime', W('akhir', 'rebut'), { gain: 0.4 });
}
let cam = { x: 540, y: 960, z: 1 };
const toS = (x, y) => K.toScreen(cam, x, y);

// ---------------------------------------------------------------- lock screen
function lockScreen(g, t) {
  // wallpaper: dim gradient + faint glow
  const gr = g.createLinearGradient(0, 0, 0, 844); gr.addColorStop(0, '#0B0F22'); gr.addColorStop(1, '#06070C');
  g.fillStyle = gr; g.fillRect(0, 0, 390, 844);
  g.fillStyle = 'rgba(124,108,255,0.12)'; g.beginPath(); g.arc(195, 340, 130, 0, Math.PI * 2); g.fill();
  // clock
  K.label(g, '23:47', 195, 200, { size: 54, weight: 700, align: 'center', spacing: 0 });
  K.label(g, 'Selasa, 3 November', 195, 240, { size: 16, color: P.ink2, align: 'center', spacing: 0 });
  // notifications stack (each slides in)
  NOTIFS.forEach((n, i) => {
    const at = C.hook.start + 0.5 + i * 0.75;
    const p = K.sp(t, at, 0.55, 0.6);
    if (p <= 0) return;
    const y = 530 + i * 82;
    g.save(); K.rise(g, 30, y, p, { from: 0.9, dy: 40 });
    K.glass(g, 30, y, 330, 66, { r: 18, haloRgb: n.color, haloA: 0.3 * p });
    // app icon
    const ic = g.createLinearGradient(58, y + 10, 66, y + 56); ic.addColorStop(0, `rgb(${n.color})`); ic.addColorStop(1, `rgba(${n.color},0.6)`);
    g.fillStyle = ic; g.beginPath(); g.arc(64, y + 33, 18, 0, Math.PI * 2); g.fill();
    K.label(g, n.app[0], 64, y + 34, { size: 14, weight: 700, align: 'center', spacing: 0 });
    K.label(g, n.name, 92, y + 24, { size: 13, weight: 700, spacing: 0 });
    K.label(g, n.time, 350, y + 24, { size: 11, color: P.ink3, align: 'right', spacing: 0 });
    K.label(g, n.txt, 92, y + 46, { size: 14, color: P.ink2, spacing: 0 });
    g.restore();
  });
  // badge counter climbing
  const bc = Math.round(K.count(t, C.hook.start + 0.5, C.otak.end - C.hook.start, 0, BADGE));
  if (t > C.hook.start + 0.4) {
    const bp = K.sp(t, C.hook.start + 0.4, 0.5, 0.6);
    g.save(); K.rise(g, 0, 0, bp, { from: 0.8 });
    g.fillStyle = '#FF3355'; g.beginPath(); g.arc(340, 40, 26, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#fff'; g.lineWidth = 3; g.stroke();
    K.label(g, String(bc), 340, 41, { size: 18, weight: 700, align: 'center', spacing: 0 });
    g.restore();
  }
  // dim after detox
  const d = clamp((t - T.dim) / 0.8);
  if (d > 0) { g.fillStyle = `rgba(6,7,12,${d * 0.85})`; g.fillRect(0, 0, 390, 844); }
}

// ---------------------------------------------------------------- overlays
function overlays(t) {
  const H = (lines, at, out, o = {}) => K.headline(ui, t, at, lines, 540, o.y || 236, { size: 80, out, ...o });
  const E = (str, a, b, y = 150) => K.micro(ui, str, 540, y, { align: 'center', alpha: env(t, a, b, 0.3, 0.3), color: P.ink2, size: 22 });
  if (t < C.fomo.start) { E('FOMO · fear of missing out', 0, C.hook.end); H(['Notifikasi masuk', 'terus.'], 0.05, C.hook.end, { y: 150, size: 64 }); H(['HP-mu *tidak pernah* diam.'], C.hook.start + 0.2, C.hook.end + 0.1, { y: 250, size: 52 }); }
  if (t > C.fomo.start - 0.1 && t < C.layar.start) { H(['Satu bunyi,', 'jari *gatal*.'], C.fomo.start + 0.05, C.fomo.end + 0.1, { y: 150 }); H(['Takut *ketinggalan*', 'sesuatu.'], C.fomo.start + 0.3, C.fomo.end + 0.1, { y: 260 }); }
  if (t > C.layar.start - 0.1 && t < C.otak.start) { H(['Layar menyala,', '*perhatianmu*', 'tersedot.'], C.layar.start + 0.05, C.layar.end + 0.1, { y: 140, size: 58 }); }
  if (t > C.otak.start - 0.1 && t < T.dim) { H(['Otakmu *lelah*.'], C.otak.start + 0.05, C.otak.end + 0.1, { y: 170, size: 76 }); H(['Padahal kamu', 'tidak mengerjakan', 'apa-apa.'], C.otak.start + 0.3, C.otak.end + 0.1, { y: 290, size: 50 }); }
  if (t > T.dim) {
    const a = K.sp(t, T.dim + 0.1, 0.8, 0.7);
    ui.save(); K.rise(ui, 540, 620, a, { dy: 70 });
    K.glass(ui, 120, 540, 840, 170, { r: 85, haloRgb: R.mint, haloA: 0.5 });
    K.label(ui, 'Matikan yang tidak penting.', 540, 617, { size: 54, weight: 700, align: 'center' });
    ui.restore();
    H(['Rebut kembali', '*harimu*.'], W('akhir', 'rebut') - 0.1, 999, { y: 330, size: 72 });
  }
  K.micro(ui, 'DIGITAL DETOX', 60, 70, { size: 18 });
  const sec = Math.floor(t), fr = Math.floor((t % 1) * 24);
  K.micro(ui, `00:${String(sec).padStart(2, '0')}:${String(fr).padStart(2, '0')}`, 940, 70, { size: 18, align: 'right' });
}

// ---------------------------------------------------------------- frame
export function render(t) {
  cam = K.camAt(t, CAM, { z: 1, ts: 0.8 });
  K.stage(bg, t, { px: (cam.x - 540) * 0.06, py: (cam.y - 1010) * 0.06 });
  world.setTransform(1, 0, 0, 1, 0, 0);
  K.applyCam(world, cam);
  K.phone(world, PH.x, PH.y, PH.s, (g) => lockScreen(g, t), { rimRgb: R.violet, rimA: 0.5 });
  overlays(t);
  fx.setTransform(1, 0, 0, 1, 0, 0);
  // glow flash on scene changes
  for (const tt of [C.fomo.start - 0.1, C.layar.start - 0.1, C.otak.start - 0.1, T.dim]) {
    const d = t - tt;
    if (d > 0 && d < 0.3) { fx.globalAlpha = 0.16 * (1 - d / 0.3); fx.drawImage(K.glowSprite(R.violet, 0.9), -540, -200, 2160, 2320); fx.globalAlpha = 1; }
  }
  K.finish(fx, t, AM);
  const f = clamp((t - (AM.duration - 0.4)) / 0.4);
  if (f > 0) { fx.fillStyle = `rgba(6,7,12,${f * 0.9})`; fx.fillRect(0, 0, 1080, 1920); }
  for (const c of [world, ui]) c.setTransform(1, 0, 0, 1, 0, 0);
}
