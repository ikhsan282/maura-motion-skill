// HUD Showreel demo2: "Skill Cooldown & Ekonomi Aksi — Mengapa Ultimate Terkuat Harus Dikunci Waktu?"
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

// 1. Hook: Radial cooldown ring counting down
shot('hook', (t, a, b) => {
  const dur = Math.max(1, b - a);
  const p = clamp((t - a) / dur);
  const secs = Math.max(0, 5.0 * (1 - p));

  K.frame(g, t, { accent: P.cyan });
  K.cornerHud(ui, t, { left: 'SKILL.SYS // BEAT 01/07', beat: 'BEAT 01/07', accent: P.cyan });
  K.headlineHud(g, 'ULTIMATE SKILL: COOLDOWN', 'KUNCI WAKTU JURUS PEMUNGKAS', { y: 240, accent: P.cyan, tag: 'ABILITY LOCK // RADIAL TIMER' });

  K.cooldown(g, 540, 780, 220, p, { secs });

  K.panel(g, 140, 1100, 800, 210, { r: 22, stroke: P.cyan, bracketColor: P.cyan });
  K.label(g, 'STATUS: RECHARGING', 540, 1175, { size: 46, color: P.cyan });
  K.micro(g, 'COOLDOWN TIMER MENCEGAH SPAM SKILL', 540, 1245, { size: 22, color: P.dim });
});

// 2. Spam: Button spam without cooldown vs balanced rhythm
shot('spam', (t, a, b) => {
  K.frame(g, t, { accent: P.red });
  K.cornerHud(ui, t, { left: 'SKILL.SYS // BEAT 02/07', beat: 'BEAT 02/07', accent: P.red });
  K.headlineHud(g, 'TANPA COOLDOWN = RUSAK', 'ADU TEKAN SATU TOMBOL TANPA STRATEGI', { y: 240, accent: P.red, tag: 'BALANCE SIMULATION // SPAM TEST' });

  // Top box: Broken 0.0s cooldown spam
  K.panel(g, 90, 460, 900, 380, { r: 22, stroke: P.red, bracketColor: P.red });
  K.micro(g, 'SIMULASI A: COOLDOWN 0.0 DETIK (BROKEN)', 540, 515, { size: 22, color: P.red });
  const spamHits = Math.floor(((t - a) * 8) % 12) + 1;
  K.label(g, `ULTI SPAM x${spamHits}`, 540, 625, { size: 78, color: P.red, font: K.FONT.mono });
  K.chargeBar(g, 160, 715, 760, 58, 1.0, { color: P.red, tag: 'PERTARUNGAN SELESAI DALAM 2 DETIK' });

  // Bottom box: Balanced cooldown rhythm
  K.panel(g, 90, 900, 900, 380, { r: 22, stroke: P.green, bracketColor: P.green });
  K.micro(g, 'SIMULASI B: COOLDOWN 5.0 DETIK (TAKTIS)', 540, 955, { size: 22, color: P.green });
  const cdProg = clamp(((t - a) % 4) / 3.5);
  K.chargeBar(g, 160, 1060, 760, 64, cdProg, { color: P.cyan, tag: 'RITME SERANGAN · HINDARAN · TIMING' });
  K.micro(g, 'SETIAP PENGGUNAAN SKILL PUNYA KONSEKUENSI', 540, 1205, { size: 23, color: P.ink });
});

// 3. Ulti: 5s charge bar -> 100% -> DMG x3 explosion
shot('ulti', (t, a, b) => {
  const chargeEnd = a + (b - a) * 0.58;
  const p = prog(t, a + 0.2, chargeEnd);
  const ready = t >= chargeEnd;

  K.frame(g, t, { accent: ready ? P.gold : P.mag });
  K.cornerHud(ui, t, { left: 'SKILL.SYS // BEAT 03/07', beat: 'BEAT 03/07', accent: ready ? P.gold : P.mag });
  K.headlineHud(g, ready ? 'OVERCHARGE 100%: DMG x3!' : 'PENGISIAN DAYA ULTIMATE', 'KONVERSI WAKTU MENJADI DAYA LEDAK', {
    y: 240,
    accent: ready ? P.gold : P.mag,
    tag: 'ULTIMATE CHARGE // BURST DAMAGE',
  });

  K.cooldown(g, 540, 620, 165, p, { secs: Math.max(0, 5 * (1 - p)), readyColor: P.gold });
  K.chargeBar(g, 120, 900, 840, 86, p, { color: P.mag, tag: 'PLASMA CORE CHARGING' });

  if (ready) {
    const pop = ease.outBack(clamp((t - chargeEnd) / 0.45), 1.5);
    g.save();
    g.translate(540, 1170);
    g.scale(pop, pop);
    K.panel(g, -400, -110, 800, 220, { r: 24, stroke: P.gold, glow: P.gold, bracketColor: P.gold });
    K.label(g, 'DAMAGE x3.0', 0, -20, { size: 96, color: P.gold });
    K.micro(g, 'BURST OUTPUT MAKSIMUM AKTIF', 0, 65, { size: 24, color: P.ink });
    g.restore();
  }
});

// 4. Combo: 3-hit basic combo while ulti is on cooldown
shot('combo', (t, a, b) => {
  const dur = Math.max(1, b - a);
  const f = (t - a) / dur;
  const n = f > 0.62 ? 3 : f > 0.34 ? 2 : 1;
  const stepStart = a + (n === 3 ? dur * 0.62 : n === 2 ? dur * 0.34 : 0);
  const pop = clamp(1 - (t - stepStart) / 0.45);

  K.frame(g, t, { accent: P.gold });
  K.cornerHud(ui, t, { left: 'SKILL.SYS // BEAT 04/07', beat: 'BEAT 04/07', accent: P.gold });
  K.headlineHud(g, 'RANGKAIAN KOMBO DASAR', 'MENJAGA TEKANAN SAAT ULTI COOLDOWN', { y: 240, accent: P.gold, tag: 'ACTION ECONOMY // BASIC CHAIN' });

  K.combo(g, 540, 680, n, pop);

  // 3 Hit nodes
  for (let i = 0; i < 3; i++) {
    const active = i < n;
    const cx = 270 + i * 270;
    const cy = 1040;
    K.panel(g, cx - 105, cy - 95, 210, 190, {
      r: 22,
      stroke: active ? P.gold : P.dim,
      glow: active ? P.gold : null,
      bracketColor: active ? P.gold : null,
    });
    K.label(g, `HIT 0${i + 1}`, cx, cy - 22, { size: 36, color: active ? P.gold : P.dim });
    K.micro(g, active ? 'CONNECTED' : 'STANDBY', cx, cy + 42, { size: 20, color: active ? P.green : P.dim });
  }

  K.micro(g, 'SERANGAN DASAR MENGISI CELAH WAKTU TUNGGU', 540, 1250, { size: 24, color: P.cyan });
});

// 5. Window of vulnerability: Punish window for enemy
shot('window', (t, a, b) => {
  const rem = Math.max(0.4, 4.2 - (t - a) * 0.45);
  K.frame(g, t, { accent: P.orange });
  K.cornerHud(ui, t, { left: 'SKILL.SYS // BEAT 05/07', beat: 'BEAT 05/07', accent: P.orange });
  K.headlineHud(g, 'CELAH SERANGAN BALIK', 'SAAT COOLDOWN = MOMEN PALING RAWAN', { y: 240, accent: P.orange, tag: 'TACTICAL WINDOW // PUNISH PHASE' });

  // Player side (Offline) vs Enemy side (Ready)
  K.panel(g, 90, 480, 420, 480, { r: 22, stroke: P.red, bracketColor: P.red });
  K.micro(g, 'STATUS PEMAIN', 300, 535, { size: 22, color: P.red });
  K.cooldown(g, 300, 720, 120, 1 - rem / 5, { secs: rem });
  K.micro(g, 'PERTAHANAN TERBUKA', 300, 905, { size: 22, color: P.red });

  K.panel(g, 570, 480, 420, 480, { r: 22, stroke: P.gold, glow: P.gold, bracketColor: P.gold });
  K.micro(g, 'STATUS LAWAN', 780, 535, { size: 22, color: P.gold });
  K.cooldown(g, 780, 720, 120, 1, { readyColor: P.gold, title: 'COUNTER' });
  K.micro(g, 'SIAP MENYERANG BALIK!', 780, 905, { size: 22, color: P.gold });

  K.panel(g, 90, 1020, 900, 220, { r: 22, stroke: P.orange });
  K.label(g, 'PUNISH WINDOW: 5.0 DETIK', 540, 1100, { size: 48, color: P.orange, font: K.FONT.mono });
  K.micro(g, 'PEMAIN PRO SELALU MENGHITUNG COOLDOWN MILIK LAWAN', 540, 1175, { size: 22, color: P.ink });
});

// 6. Level up: XP fills -> Level 12 -> Cooldown -50% (5.0s -> 2.5s)
shot('level', (t, a, b) => {
  const xp = prog(t, a, a + 1.6);
  const lvlP = clamp((t - (a + 1.2)) / 0.9);

  K.frame(g, t, { accent: P.green });
  K.cornerHud(ui, t, { left: 'SKILL.SYS // BEAT 06/07', beat: 'BEAT 06/07', accent: P.green });
  K.headlineHud(g, 'LEVEL UP: COOLDOWN −50%', 'REDUKSI WAKTU TUNGGU DARI 5.0s KE 2.5s', { y: 240, accent: P.green, tag: 'PROGRESSION // CDR UPGRADE' });

  K.micro(g, `EXPERIENCE POINTS · ${Math.round(xp * 100)}%`, 540, 415, { size: 22, color: P.green });
  K.xpBar(g, 120, 445, 840, xp);

  K.levelUp(g, 540, 670, lvlP, 12, { sub: 'COOLDOWN REDUCTION −50% UNLOCKED' });

  // Before vs After CDR
  K.panel(g, 90, 860, 420, 380, { r: 22, stroke: P.dim });
  K.micro(g, 'LEVEL 1 (AWAL)', 300, 915, { size: 22, color: P.dim });
  K.label(g, '5.0s', 300, 1045, { size: 88, color: P.dim, font: K.FONT.mono });
  K.micro(g, 'COOLDOWN STANDAR', 300, 1165, { size: 20, color: P.dim });

  K.panel(g, 570, 860, 420, 380, { r: 22, stroke: P.green, glow: P.green, bracketColor: P.green });
  K.micro(g, 'LEVEL 12 (UPGRADE)', 780, 915, { size: 22, color: P.green });
  K.label(g, '2.5s', 780, 1045, { size: 88, color: P.green, font: K.FONT.mono });
  K.micro(g, '2X LEBIH CEPAT PULIH!', 780, 1165, { size: 20, color: P.ink });
});

// 7. Akhir: Ready ultimate & strategic rhythm summary
shot('akhir', (t, a, b) => {
  const pop = ease.outBack(clamp((t - a) / 0.6), 1.4);
  K.frame(g, t, { accent: P.gold });
  K.cornerHud(ui, t, { left: 'SKILL.SYS // BEAT 07/07', beat: 'BEAT 07/07', accent: P.gold });
  K.headlineHud(g, 'COOLDOWN = DETAK STRATEGI', 'HARGA SEBUAH KEMENANGAN', { y: 240, accent: P.gold, tag: 'CONCLUSION // TACTICAL MASTERY' });

  g.save();
  g.translate(540, 720);
  g.scale(pop, pop);
  g.translate(-540, -720);
  K.cooldown(g, 540, 720, 210, 1, { readyColor: P.gold, title: 'ULTI READY' });
  g.restore();

  K.panel(g, 100, 1040, 880, 250, { r: 24, stroke: P.gold, glow: P.gold, bracketColor: P.gold });
  K.label(g, 'BUKAN HUKUMAN, TAPI IRAMA', 540, 1125, { size: 46, color: P.gold });
  K.micro(g, 'MENGUBAH ADU TEKAN TOMBOL MENJADI PERTARUNGAN TAKTIS', 540, 1205, { size: 22, color: P.ink });
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
