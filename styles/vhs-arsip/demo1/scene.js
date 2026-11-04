// VHS & Arsip demo: "Sinyal Wow! 1977" — an old documentary tape, 5 shots, ~18 s.
import * as K from '/styles/vhs-arsip/kit.js';
const { clamp, lerp, ease, hrand, noise } = AM.lib;

export const meta = { fps: 24, captions: { preset: 'typewriter', y: 1470, size: 58, maxWords: 4 } };

let out;
const C = {};
const W = (id, w) => AM.wordTime(id, w);
export async function setup(AM) {
  out = AM.layer('tv', { autoClear: false });
  for (const l of AM.timeline.lines) C[l.id] = l;
  AM.sfx('click', 0.05, { gain: 0.4 });
  AM.sfx('heartbeat', W('hook', 'sinyal'), { gain: 0.35 });
  AM.sfx('typewriter', C.kode.start + 0.2, { gain: 0.3 });
  AM.sfx('pencil', C.wow.start + 0.1, { gain: 0.45 });
  AM.sfx('pencil', W('wow', 'Wow'), { gain: 0.45, pitch: 1.2 });
  AM.sfx('scratch', C.sunyi.start - 0.1, { gain: 0.35 });
  AM.sfx('click', AM.duration - 0.6, { gain: 0.4, pitch: 0.8 });
}
const SHOTS = []; const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => { const L = SHOTS.filter((x) => C[x.id]); const i = L.findIndex((x) => x.id === id); return [C[id].start - 0.12, L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1]; };

// The printout: the famous column (channel 2) with 6EQUJ5 running down it.
const COL = ['1', '1', '1', '6', 'E', 'Q', 'U', 'J', '5', '1', '1', '1'];
const ROWH = 150, GS = 22, COLX = -60;
const rowY = (i) => (i - 6) * ROWH;
function printout(g, t, { cx = 540, cy = 960, z = 1, highlight = -1, scroll = 0, flat = false, circle = 0, wow = 0 } = {}) {
  g.save(); g.translate(cx, cy); g.scale(z, z);
  K.paper(g, 0, 0, 1000, 2600, { scroll, bar: ROWH / 2 });
  const sc = ((scroll % (ROWH * 2)) + ROWH * 2) % (ROWH * 2);
  for (let r = -9; r < 9; r++) {
    const y = r * ROWH + sc - ROWH + 30, rr = r - Math.floor(scroll / ROWH);
    let s = '';
    for (let c = 0; c < 5; c++) { const v = hrand(c, rr, 7); s += v < 0.7 ? ' ' : v < 0.92 ? '1' : '2'; }
    K.dotText(g, s, -400, y, { size: 12, alpha: 0.8 });
    let s2 = ''; for (let c = 0; c < 5; c++) { const v = hrand(c + 9, rr, 7); s2 += v < 0.6 ? ' ' : '1'; }
    K.dotText(g, s2, 120, y, { size: 12, alpha: 0.7 });
  }
  for (let i = 3; i <= 3 + highlight && i <= 8; i++) { g.fillStyle = 'rgba(255,212,0,0.45)'; g.fillRect(COLX - 16, rowY(i) - 14, GS * 3 + 32, GS * 5 + 28); }
  COL.forEach((ch, i) => K.dotText(g, flat ? '1' : ch, COLX, rowY(i) + sc * 0, { size: GS, color: K.PAL.ink }));
  if (circle > 0) K.penCircle(g, COLX + GS * 1.5, (rowY(3) + rowY(8) + GS * 5) / 2, 120, (rowY(8) - rowY(3)) / 2 + 150, circle);
  if (wow > 0) K.handwrite(g, 'Wow!', -470, rowY(4), wow, { size: 150 });
  g.restore();
}

// 1. A 1977 tape: the Big Ear telescope under the stars, waves arrive, a 72-second sweep draws itself.
shot('hook', (t, a, b, g) => {
  const lt = t - a;
  K.nightSky(g, t);
  const z = 1 + lt * 0.03;
  g.save(); g.translate(540, 960); g.scale(z, z); g.translate(-540, -960);
  K.waves(g, t, 560, 1110, { from: [880, 160], strength: 0.9 });
  K.bigEar(g, 540, 1180, 0.72, { lit: 0.25 + 0.2 * Math.sin(t * 6) });
  g.fillStyle = '#0a0d14'; g.fillRect(0, 1295, 1080, 700);
  g.restore();
  // 72-second sweep graph (rises 36 s, falls 36 s)
  const gx = 140, gy = 420, gw = 800, gh = 300, p = clamp(lt / 3.0);
  g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 4; g.beginPath(); g.moveTo(gx, gy); g.lineTo(gx, gy + gh); g.lineTo(gx + gw, gy + gh); g.stroke();
  g.strokeStyle = '#7fe0ff'; g.lineWidth = 9; g.beginPath();
  for (let i = 0; i <= 100 * p; i++) { const u = i / 100, v = Math.exp(-((u - 0.5) ** 2) / 0.035); const x = gx + u * gw, y = gy + gh - v * gh * 0.92 - (hrand(i, 3) - 0.5) * 12; i ? g.lineTo(x, y) : g.moveTo(x, y); }
  g.stroke();
  g.fillStyle = '#ffffff'; g.font = "700 84px 'Inter'"; g.textAlign = 'center';
  g.fillText(`${Math.floor(p * 72)} DETIK`, 540, gy - 50);
  g.font = "400 40px 'Inter'"; g.fillText('BIG EAR, OHIO', 540, gy + gh + 70);
});

// 2. The printout: Jerry Ehman sees the column; each character lights as it is spoken.
shot('kode', (t, a, b, g) => {
  const lt = t - a, cs = W('kode', 'kodenya') + 0.45, step = (C.kode.end - cs) / 6;
  g.fillStyle = '#3b3328'; g.fillRect(0, 0, 1080, 1920);
  const z = lerp(0.7, 1.05, ease.inOutCubic(clamp(lt / 3.0)));
  const hi = t > cs ? Math.min(5, Math.floor((t - cs) / step)) : -1;
  printout(g, t, { cx: 560, cy: 860, z, highlight: hi, scroll: 0 });
  const lg = g.createRadialGradient(540, 860, 200, 540, 860, 900); lg.addColorStop(0, 'rgba(255,230,180,0.0)'); lg.addColorStop(1, 'rgba(20,12,4,0.55)');
  g.fillStyle = lg; g.fillRect(0, 0, 1080, 1920);
});

// 3. The red pen: circle, then "Wow!" in the margin. Freeze-frame.
shot('wow', (t, a, b, g) => {
  const lt = t - a, wt = W('wow', 'Wow');
  g.fillStyle = '#3b3328'; g.fillRect(0, 0, 1080, 1920);
  printout(g, t, { cx: 600, cy: 860, z: 1.05, highlight: 5, circle: clamp((lt - 0.1) / 0.9), wow: clamp((t - wt + 0.15) / 0.5) });
  const lg = g.createRadialGradient(540, 860, 260, 540, 860, 950); lg.addColorStop(0, 'rgba(255,230,180,0)'); lg.addColorStop(1, 'rgba(20,12,4,0.5)');
  g.fillStyle = lg; g.fillRect(0, 0, 1080, 1920);
});

// 4. Rewind... the same sky, listened to again: flat line. Years of searching, nothing.
shot('sunyi', (t, a, b, g) => {
  const lt = t - a;
  K.nightSky(g, t, { seed: 5 });
  K.bigEar(g, 540, 1180, 0.72, { lit: 0.1 });
  g.fillStyle = '#0a0d14'; g.fillRect(0, 1295, 1080, 700);
  const gx = 140, gy = 420, gw = 800, gh = 300;
  g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 4; g.beginPath(); g.moveTo(gx, gy); g.lineTo(gx, gy + gh); g.lineTo(gx + gw, gy + gh); g.stroke();
  g.strokeStyle = '#7fe0ff'; g.lineWidth = 9; g.beginPath();
  for (let i = 0; i <= 100 * clamp((lt - 0.5) / 1.5); i++) { const x = gx + i / 100 * gw, y = gy + gh - 20 - (hrand(i, 9) - 0.5) * 14; i ? g.lineTo(x, y) : g.moveTo(x, y); }
  g.stroke();
  const years = ['1977', '1987', '1995', '1999', '2022'];
  const n = Math.min(years.length, Math.floor(clamp((lt - 0.6) / 2.2) * years.length + 1));
  g.font = "700 64px 'Inter'"; g.textAlign = 'left';
  for (let i = 0; i < n; i++) { g.fillStyle = '#ffffff'; g.fillText(years[i], 170, 860 + i * 0); }
  if (n > 0) { g.fillStyle = '#ff5050'; g.font = "700 64px 'Inter'"; g.fillText('— NIHIL', 380, 860); g.fillStyle = '#ffffff'; g.fillText(years[n - 1], 170, 860); }
  g.fillStyle = 'rgba(255,255,255,0.85)'; g.font = "400 40px 'Inter'"; g.textAlign = 'center'; g.fillText('ARAH: SAGITARIUS', 540, gy - 50);
});

// 5. Back to the paper: the circle and the word. The tape stops.
shot('akhir', (t, a, b, g) => {
  const lt = t - a;
  g.fillStyle = '#3b3328'; g.fillRect(0, 0, 1080, 1920);
  const z = lerp(0.95, 1.2, ease.inOutSine(clamp(lt / 4)));
  printout(g, t, { cx: 640, cy: 860, z, highlight: 5, circle: 1, wow: 1 });
  const lg = g.createRadialGradient(540, 860, 260, 540, 860, 950); lg.addColorStop(0, 'rgba(255,230,180,0)'); lg.addColorStop(1, 'rgba(20,12,4,0.5)');
  g.fillStyle = lg; g.fillRect(0, 0, 1080, 1920);
});

export function render(t, AM) {
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id);
  const g = K.tape();
  // rewind into 'sunyi': the picture rolls back for 0.55 s
  const rewEnd = C.sunyi.start + 0.45;
  const rew = s.id === 'sunyi' && t < rewEnd;
  s.fn(rew ? a - (t - a) * 6 : t, Math.max(0, a), b, g);
  const since = t - Math.max(0, a);
  const stopT = AM.duration - 0.55;
  const mode = rew ? 'rew' : s.id === 'wow' && t > W('wow', 'Wow') ? 'pause' : t > stopT ? 'stop' : 'play';
  const cutJolt = s.id !== 'hook' && since < 0.2 ? 1 - since / 0.2 : 0;
  K.vhs(out, t, { mode, tracking: 0.35 + cutJolt * 2, band: 0.6 + cutJolt * 2, jump: cutJolt > 0.6 ? (1 - cutJolt) * 0.15 : 0 });
  if (t > stopT) { out.fillStyle = `rgba(10,20,120,${clamp((t - stopT) / 0.25) * 0.85})`; out.fillRect(0, 0, 1080, 1920); }
  K.osd(out, t, { mode, counter: 22 * 3600 + 16 * 60 + t, date: s.id === 'hook' ? 'AUG. 15 1977' : null });
  if (s.id === 'kode' && t > W('kode', 'Jerry') - 0.2) K.lowerThird(out, 'JERRY R. EHMAN', 'ASTRONOM, OHIO STATE UNIVERSITY', 70, 1180, { alpha: clamp((t - W('kode', 'Jerry') + 0.2) / 0.3) });
  if (s.id === 'akhir' && t > C.akhir.end - 0.3) K.lowerThird(out, '6EQUJ5', 'SINYAL "WOW!", 15 AGUSTUS 1977', 70, 1180, { alpha: clamp((t - C.akhir.end + 0.3) / 0.3) });
  K.crt(out);
}
