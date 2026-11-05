// HUD Showreel demo1: "HP Bar: Nyawa Terakhirmu — Rahasia Psikologi Bar Hijau, Damage Ghost & Detik Kritis"
import * as K from '/styles/hud-showreel/kit.js';
const { clamp, lerp, ease, prog, noise } = AM.lib;
const P = K.PAL;

export const meta = {
  fps: 24,
  hold: 1,
  captions: { preset: 'neon', y: 1560, size: 50, maxWords: 4 },
};

let g, ui;
const C = {};

export async function setup(AM) {
  g = AM.layer('world');
  ui = AM.layer('ui');
  for (const l of AM.timeline.lines) C[l.id] = l;
}

const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => {
  const L = SHOTS.filter((x) => C[x.id]);
  const i = L.findIndex((x) => x.id === id);
  return [C[id].start - 0.1, L[i + 1] ? C[L[i + 1].id].start - 0.1 : AM.duration + 1];
};

// 1. Hook: 100 -> 50 slash hit
shot('hook', (t, a, b) => {
  const p = clamp((t - (a + 0.8)) / 0.45);
  const gp = clamp((t - (a + 1.4)) / 0.7);
  const hp = lerp(100, 50, ease.outCubic(p));
  const ghost = lerp(100, 50, ease.outCubic(gp));

  K.frame(g, t, { accent: P.cyan });
  K.cornerHud(ui, t, { left: 'VITALS.HUD // BEAT 01/07', beat: 'BEAT 01/07', accent: P.cyan });
  K.headlineHud(g, 'SATU TEBASAN: HP −50%', 'DAMAGE IMPACT TELEMETRY', { y: 240, accent: P.red, tag: 'COMBAT LOG // HIT #01' });

  K.hpBarHud(g, 540, 820, 880, 125, hp, ghost, 0);

  if (p > 0) {
    K.panel(g, 290, 1020, 500, 140, { r: 20, stroke: P.red, glow: P.red });
    K.label(g, '−50 DMG', 540, 1072, { size: 68, color: P.red, font: K.FONT.mono });
    K.micro(g, 'DIRECT SLASH · ARMOR BYPASSED', 540, 1130, { size: 20, color: P.ink });
  }
});

// 2. Ghost: Damage ghost trail explanation
shot('ghost', (t, a, b) => {
  const cycle = ((t - a) * 0.55) % 1;
  const hp = 45;
  const ghost = lerp(92, 45, ease.inOutCubic(clamp((cycle - 0.25) / 0.6)));

  K.frame(g, t, { accent: P.gold });
  K.cornerHud(ui, t, { left: 'VITALS.HUD // BEAT 02/07', beat: 'BEAT 02/07', accent: P.gold });
  K.headlineHud(g, 'DAMAGE GHOST TRAIL', 'BAYANGAN MERAH PENanda LUKA', { y: 240, accent: P.gold, tag: 'UX PSYCHOLOGY // DELAYED DRAIN' });

  K.hpBarHud(g, 540, 760, 880, 125, hp, ghost, 0, { tag: 'GHOST BUFFER · 0.6s DELAY' });

  // Callout bracket pointing to ghost area
  K.panel(g, 110, 960, 860, 290, { r: 22, stroke: P.gold, bracketColor: P.gold });
  K.micro(g, 'MENGAPA ADA BAYANGAN MERAH?', 540, 1015, { size: 22, color: P.gold });
  K.label(g, 'JEJAK LUKA VISUAL', 540, 1085, { size: 52, color: P.ink });
  K.micro(g, 'MEMBERI WAKTU 600 MILIDETIK BAGI MATA', 540, 1155, { size: 22, color: P.cyan });
  K.micro(g, 'UNTUK MEMBACA BESARNYA SERANGAN MUSUH', 540, 1195, { size: 22, color: P.dim });
});

// 3. Heal & Shield: +30 HP + 25 Shield
shot('heal', (t, a, b) => {
  const p = clamp((t - (a + 0.5)) / 1.1);
  const sp = clamp((t - (a + 1.5)) / 0.9);
  const hp = lerp(50, 80, ease.outCubic(p));
  const shield = lerp(0, 25, ease.outCubic(sp));

  K.frame(g, t, { accent: P.green });
  K.cornerHud(ui, t, { left: 'VITALS.HUD // BEAT 03/07', beat: 'BEAT 03/07', accent: P.green });
  K.headlineHud(g, 'HEAL +30 & SHIELD AKTIF', 'PEMULIHAN DAN PERISAI SEMENTARA', { y: 240, accent: P.green, tag: 'RECOVERY // POTION + BARRIER' });

  K.hpBarHud(g, 540, 780, 880, 125, hp, hp, shield, { tag: 'HP + OVER-SHIELD BUFFER' });

  K.panel(g, 110, 980, 410, 220, { r: 20, stroke: P.green, glow: P.green });
  K.label(g, '+30 HP', 315, 1065, { size: 64, color: P.green, font: K.FONT.mono });
  K.micro(g, 'RAMUAN PENYEMBUH', 315, 1140, { size: 22, color: P.ink });

  K.panel(g, 560, 980, 410, 220, { r: 20, stroke: P.cyan, glow: P.cyan });
  K.label(g, '+25 SHD', 765, 1065, { size: 64, color: P.cyan, font: K.FONT.mono });
  K.micro(g, 'PERISAI ENERGI BIRU', 765, 1140, { size: 22, color: P.ink });
});

// 4. Crit: Boss critical hit leaves 1 HP
shot('crit', (t, a, b) => {
  const p = clamp((t - (a + 0.6)) / 0.9);
  const gp = clamp((t - (a + 1.4)) / 1.1);
  const hp = lerp(80, 1, ease.outExpo(p));
  const ghost = lerp(80, 1, ease.outCubic(gp));
  const shield = lerp(25, 0, ease.outExpo(clamp(p * 2)));

  K.frame(g, t, { accent: P.red });
  K.cornerHud(ui, t, { left: 'VITALS.HUD // BEAT 04/07', beat: 'BEAT 04/07', accent: P.red });
  K.headlineHud(g, 'SERANGAN KRITIS BOS!', 'PERISAI PECAH · TERSISA 1 HP', { y: 240, accent: P.red, tag: 'CRITICAL STRIKE // DANGER ZONE' });

  K.hpBarHud(g, 540, 780, 880, 125, hp, ghost, shield);

  const pulse = 0.65 + 0.35 * Math.sin(t * 14);
  K.panel(g, 150, 980, 780, 250, { r: 24, stroke: P.red, glow: P.red, bracketColor: P.red });
  K.label(g, 'KRITIS! −104 DMG', 540, 1065, { size: 68, color: P.gold, font: K.FONT.mono, alpha: pulse });
  K.micro(g, 'PERISAI HANCUR · NYAWA KRITIS 1 / 100', 540, 1155, { size: 24, color: P.red });
});

// 5. Illusion: Last pixel HP weight
shot('illusion', (t, a, b) => {
  K.frame(g, t, { accent: P.mag });
  K.cornerHud(ui, t, { left: 'VITALS.HUD // BEAT 05/07', beat: 'BEAT 05/07', accent: P.mag });
  K.headlineHud(g, 'RAHASIA 1 HP TERAKHIR', 'BOBOT TERSEMBUNYI PIKSEL PENGHABISAN', { y: 240, accent: P.mag, tag: 'GAME DESIGN SECRET // HIDDEN BUFFER' });

  // Compare Normal Pixel vs Last Pixel weight
  K.panel(g, 100, 480, 880, 340, { r: 22, stroke: P.cyan, bracketColor: P.cyan });
  K.micro(g, 'PERBANDINGAN NILAI TIAP POIN NYAWA', 540, 535, { size: 22, color: P.cyan });

  K.chargeBar(g, 160, 620, 760, 64, 0.35, { color: P.cyan, tag: 'POIN HP BIASA (100 → 2): 1.0x DAYA TAHAN' });
  K.chargeBar(g, 160, 740, 760, 64, 1.0, { color: P.gold, tag: 'POIN HP TERAKHIR (1 HP): HINGGA 3.0x DAYA TAHAN' });

  K.panel(g, 100, 890, 880, 320, { r: 22, stroke: P.gold, glow: P.gold });
  K.label(g, 'CLUTCH MOMENT', 540, 995, { size: 68, color: P.gold });
  K.micro(g, 'DESAINER GAME MEMBUAT 1 HP TERAKHIR LEBIH KEBAL', 540, 1080, { size: 23, color: P.ink });
  K.micro(g, 'AGAR PEMAIN MERASAKAN SENSASI LOLOS DARI MAUT', 540, 1130, { size: 23, color: P.cyan });
});

// 6. KO: 0 HP Game Over
shot('ko', (t, a, b) => {
  const p = clamp((t - (a + 0.5)) / 0.6);
  const hp = lerp(1, 0, p);

  K.frame(g, t, { accent: P.red });
  K.cornerHud(ui, t, { left: 'VITALS.HUD // BEAT 06/07', beat: 'BEAT 06/07', accent: P.red });
  K.headlineHud(g, 'HP 0 · PERMAINAN SELESAI', 'TIDAK ADA LAGI CADANGAN NYAWA', { y: 240, accent: P.red, tag: 'SYSTEM TERMINATED // ZERO VITALS' });

  K.hpBarHud(g, 540, 680, 880, 125, hp, hp, 0);

  if (p > 0.3) {
    const s = ease.outBack(clamp((p - 0.3) / 0.7), 1.4);
    g.save();
    g.translate(540, 1080);
    g.scale(s, s);
    K.panel(g, -400, -170, 800, 340, { r: 28, stroke: P.red, glow: P.red, bracketColor: P.red });
    K.label(g, 'K.O.', 0, -35, { size: 165, color: P.red, font: K.FONT.mono, glow: P.red });
    K.micro(g, 'HEALTH POINT DEPLETION · GAME OVER', 0, 105, { size: 24, color: P.ink, spacing: 4 });
    g.restore();
  }
});

// 7. Akhir: Summary telemetry
shot('akhir', (t, a, b) => {
  const p = ease.outCubic(clamp((t - a) / 0.8));
  K.frame(g, t, { accent: P.cyan });
  K.cornerHud(ui, t, { left: 'VITALS.HUD // BEAT 07/07', beat: 'BEAT 07/07', accent: P.cyan });
  K.headlineHud(g, 'SENI PSIKOLOGI HP BAR', 'TIGA LAPISAN PEMACU ADRENALIN', { y: 240, accent: P.cyan, tag: 'SUMMARY // HUD ARCHITECTURE' });

  K.hpBarHud(g, 540, 620, 880, 120, lerp(0, 100, p), 100, 25, { tag: 'FULL VITALS RESTORED · 100%' });

  const cards = [
    { y: 800, col: P.red, title: '01 · DAMAGE GHOST', desc: 'Bayangan merah memberi waktu mata membaca luka' },
    { y: 980, col: P.cyan, title: '02 · SHIELD OVERLAY', desc: 'Lapisan perisai memberi rasa aman taktis sementara' },
    { y: 1160, col: P.gold, title: '03 · 1 HP MAGIC PIXEL', desc: 'Bobot ekstra di ujung bar demi momen dramatis' },
  ];

  cards.forEach((c) => {
    K.panel(g, 100, c.y, 880, 145, { r: 20, stroke: c.col, bracketColor: c.col });
    K.label(g, c.title, 150, c.y + 52, { size: 36, align: 'left', color: c.col });
    K.micro(g, c.desc, 150, c.y + 104, { size: 21, align: 'left', color: P.ink, spacing: 1 });
  });
});

export function render(t) {
  let cur = SHOTS[0];
  for (const s of SHOTS) {
    if (C[s.id] && t >= C[s.id].start - 0.1) cur = s;
  }
  const [a, b] = span(cur.id);
  g.save();
  g.translate(noise.n2(t * 1.8, 7) * 4, noise.n2(t * 1.8, 9) * 4);
  cur.fn(t, a, b);
  g.restore();

  ui.setTransform(1, 0, 0, 1, 0, 0);
  const f = clamp((t - (AM.duration - 0.4)) / 0.4);
  if (f > 0) {
    ui.fillStyle = `rgba(7,11,20,${f * 0.9})`;
    ui.fillRect(0, 0, 1080, 1920);
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
}
