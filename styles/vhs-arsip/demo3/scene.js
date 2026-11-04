// VHS & Arsip CRT — Demo 3: Gerhana Matahari Total 11 Juni 1983 (5 Menit Siang Jadi Malam di Jawa)
import * as K from '/styles/vhs-arsip/kit.js';
const { clamp, lerp, ease, hrand, TAU } = AM.lib;

export const meta = { fps: 24, captions: { preset: 'typewriter', y: 1470, size: 54, maxWords: 4 } };

let out;
const C = {};
export async function setup(AM) {
  out = AM.layer('tv', { autoClear: false });
  for (const l of AM.timeline.lines) C[l.id] = l;
}

const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => {
  const L = SHOTS.filter((x) => C[x.id]);
  const i = L.findIndex((x) => x.id === id);
  return [C[id].start - 0.12, L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1];
};

function drawEclipse(g, cx, cy, R, phase = 1, t = 0) {
  g.save();
  g.translate(cx, cy);

  // Solar corona glow during totality
  const cg = g.createRadialGradient(0, 0, R * 0.85, 0, 0, R * 2.3);
  cg.addColorStop(0, 'rgba(255, 250, 220, 0.95)');
  cg.addColorStop(0.35, 'rgba(160, 215, 255, 0.45)');
  cg.addColorStop(1, 'rgba(5, 7, 15, 0)');
  g.fillStyle = cg;
  g.beginPath();
  g.arc(0, 0, R * 2.3, 0, TAU);
  g.fill();

  // Corona streamers
  g.strokeStyle = 'rgba(255, 248, 220, 0.35)';
  g.lineWidth = 5;
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * TAU + Math.sin(t + i) * 0.04;
    const len = R * (1.35 + (i % 3) * 0.28);
    g.beginPath();
    g.moveTo(Math.cos(a) * R * 0.95, Math.sin(a) * R * 0.95);
    g.lineTo(Math.cos(a) * len, Math.sin(a) * len);
    g.stroke();
  }

  // Sun disk
  g.fillStyle = '#fff5cc';
  g.beginPath();
  g.arc(0, 0, R, 0, TAU);
  g.fill();

  // Moon silhouette sliding across Sun
  const mx = (1 - clamp(phase)) * R * 1.1;
  g.fillStyle = '#04060d';
  g.beginPath();
  g.arc(mx, 0, R * 1.01, 0, TAU);
  g.fill();

  // Diamond ring / Baily's bead flare on limb
  if (phase > 0.82) {
    const bx = -R * 0.96, by = -R * 0.24;
    const dg = g.createRadialGradient(bx, by, 4, bx, by, 95);
    dg.addColorStop(0, '#ffffff');
    dg.addColorStop(0.4, '#ffd400');
    dg.addColorStop(1, 'rgba(255,212,0,0)');
    g.fillStyle = dg;
    g.beginPath();
    g.arc(bx, by, 95, 0, TAU);
    g.fill();
  }

  g.restore();
}

// 1. Hook — 11:29 WIB 11 June 1983: Day Turns into Night over Java
shot('hook', (t, a, b, g) => {
  const lt = t - a;
  K.nightSky(g, t, { y1: 1400, seed: 8 });
  drawEclipse(g, 540, 680, 210, clamp(lt / 2.2), t);
  // Silhouette of Javanese volcano & Borobudur stupa horizon
  g.fillStyle = '#060810';
  g.beginPath();
  g.moveTo(0, 1340);
  g.lineTo(320, 1120);
  g.lineTo(580, 1300);
  g.lineTo(840, 1180);
  g.lineTo(1080, 1320);
  g.lineTo(1080, 1920);
  g.lineTo(0, 1920);
  g.closePath();
  g.fill();

  g.fillStyle = '#ffffff';
  g.font = "700 66px 'Inter'";
  g.textAlign = 'center';
  g.fillText('11 JUNI 1983 · 11:29 WIB', 540, 320);
});

// 2. Korona — 5 Minutes 10 Seconds (310 Detik) of Totality Across Central & East Java
shot('korona', (t, a, b, g) => {
  const lt = t - a;
  K.nightSky(g, t, { y1: 1920, seed: 12 });
  drawEclipse(g, 540, 680, 230, 1, t);

  const gx = 140, gy = 1040, gw = 800, gh = 200, p = clamp(lt / 3.0);
  g.strokeStyle = 'rgba(255,255,255,0.5)';
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(gx, gy);
  g.lineTo(gx, gy + gh);
  g.lineTo(gx + gw, gy + gh);
  g.stroke();
  g.strokeStyle = '#ffd400';
  g.lineWidth = 8;
  g.beginPath();
  for (let i = 0; i <= 100 * p; i++) {
    const u = i / 100;
    const dip = Math.exp(-((u - 0.5) ** 2) / 0.04);
    const x = gx + u * gw, y = gy + 30 + dip * (gh - 50);
    i ? g.lineTo(x, y) : g.moveTo(x, y);
  }
  g.stroke();
  g.fillStyle = '#ffd400';
  g.font = "700 60px 'Inter'";
  g.textAlign = 'center';
  g.fillText('TOTALITAS: 5 MENIT 10 DETIK', 540, 320);
});

// 3. TVRI — Citizens Watch From Inside Homes via Television
shot('tvri', (t, a, b, g) => {
  g.fillStyle = '#1d1914';
  g.fillRect(0, 0, 1080, 1920);
  // Vintage wooden CRT TV cabinet in a dark living room
  g.fillStyle = '#4a2e16';
  g.fillRect(130, 380, 820, 680);
  g.fillStyle = '#0c101c';
  g.fillRect(175, 425, 590, 590);
  drawEclipse(g, 470, 720, 135, 1, t);
  // TV speaker grille & dials
  g.fillStyle = '#26170a';
  g.fillRect(795, 425, 120, 590);
  g.fillStyle = '#d4b483';
  g.beginPath();
  g.arc(855, 510, 34, 0, TAU);
  g.arc(855, 620, 34, 0, TAU);
  g.fill();

  g.fillStyle = '#ffffff';
  g.font = "700 56px 'Inter'";
  g.textAlign = 'center';
  g.fillText('IMBAUAN MENONTON DARI LAYAR TV', 540, 300);
  g.fillStyle = '#ffd400';
  g.font = "600 40px 'Inter'";
  g.fillText('MENCEGAH KERUSAKAN RETINA MATA TANPA FILTER', 540, 1150);
});

// 4. Hewan — Silent Streets, Temperature Drop & Printout Data
shot('hewan', (t, a, b, g) => {
  g.fillStyle = '#2d271e';
  g.fillRect(0, 0, 1080, 1920);
  K.paper(g, 540, 860, 940, 1360, { bar: 85 });
  K.dotText(g, 'LAPORAN OBSERVASI JAWA 1983', 130, 310, { size: 11 });
  K.dotText(g, 'SUHU TURUN: -6 DERAJAT C', 150, 490, { size: 13 });
  K.dotText(g, 'JALANAN KOTA: LENGANG', 150, 660, { size: 13 });
  K.dotText(g, 'FAUNA: BURUNG PULANG SARANG', 150, 830, { size: 12 });
  K.penCircle(g, 520, 520, 390, 90, clamp((t - a - 0.3) / 1.0));
  K.handwrite(g, 'Siang jadi Malam!', 190, 1090, clamp((t - a - 0.8) / 1.0), { size: 95 });
});

// 5. Observasi — International Astronomers at Borobudur & Tanjung Kodok
shot('observasi', (t, a, b, g) => {
  K.nightSky(g, t, { y1: 1400, seed: 21 });
  drawEclipse(g, 540, 600, 190, 0.96, t);
  K.bigEar(g, 540, 1220, 0.72, { lit: 0.4 });
  g.fillStyle = '#0a0d14';
  g.fillRect(0, 1330, 1080, 600);
  g.fillStyle = '#ffffff';
  g.font = "700 54px 'Inter'";
  g.textAlign = 'center';
  g.fillText('EKSPEDisi BOROBUDUR & TANJUNG KODOK', 540, 300);
});

// 6. Kenangan — Archival Tape Stops
shot('kenangan', (t, a, b, g) => {
  K.nightSky(g, t, { y1: 1920, seed: 33 });
  drawEclipse(g, 540, 720, 240, 1, t);
  g.fillStyle = '#ffd400';
  g.font = "700 60px 'Inter'";
  g.textAlign = 'center';
  g.fillText('ARSIP GERHANA NUSANTARA 1983', 540, 320);
});

export function render(t, AM) {
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id);
  const g = K.tape();
  const rewEnd = C.observasi ? C.observasi.start + 0.45 : -1;
  const rew = s.id === 'observasi' && t < rewEnd;
  s.fn(rew ? a - (t - a) * 5 : t, Math.max(0, a), b, g);

  const since = t - Math.max(0, a);
  const stopT = AM.duration - 0.55;
  const mode = rew ? 'rew' : s.id === 'hewan' && since > 2.2 && since < 3.6 ? 'pause' : t > stopT ? 'stop' : 'play';
  const cutJolt = s.id !== 'hook' && since < 0.2 ? 1 - since / 0.2 : 0;
  K.vhs(out, t, { mode, tracking: 0.35 + cutJolt * 2, band: 0.6 + cutJolt * 2, jump: cutJolt > 0.6 ? (1 - cutJolt) * 0.15 : 0 });
  if (t > stopT) {
    out.fillStyle = `rgba(10,20,120,${clamp((t - stopT) / 0.25) * 0.85})`;
    out.fillRect(0, 0, 1080, 1920);
  }
  K.osd(out, t, { mode, counter: 11 * 3600 + 29 * 60 + t, date: s.id === 'hook' ? 'JUN. 11 1983' : null, rec: s.id === 'tvri' });
  if (s.id === 'korona') K.lowerThird(out, 'GERHANA MATAHARI TOTAL', 'JALUR YOGYAKARTA · SEMARANG · SURABAYA', 70, 1220, { alpha: clamp((t - a - 0.2) / 0.4) });
  if (s.id === 'kenangan') K.lowerThird(out, '11 JUNI 1983', 'DURASI TOTALITAS 5 MENIT 10 DETIK', 70, 1180, { alpha: clamp((t - a - 0.2) / 0.4) });
  K.crt(out);
}

