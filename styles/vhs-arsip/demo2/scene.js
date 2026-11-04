// VHS & Arsip CRT — Demo 2: Piringan Emas Voyager 1977 (Voyager Golden Record & Gamelan Puspawarna)
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

function drawGoldenRecord(g, cx, cy, R, rot, { diagram = false, wave = false, t = 0 } = {}) {
  g.save();
  g.translate(cx, cy);
  g.rotate(rot);

  // Outer gold disc
  const gr = g.createRadialGradient(-R * 0.25, -R * 0.25, R * 0.1, 0, 0, R);
  gr.addColorStop(0, '#fff3b8');
  gr.addColorStop(0.55, '#e2a93b');
  gr.addColorStop(1, '#7a520c');
  g.fillStyle = gr;
  g.beginPath();
  g.arc(0, 0, R, 0, TAU);
  g.fill();
  g.strokeStyle = '#fff8d6';
  g.lineWidth = 6;
  g.stroke();

  // Concentric phonograph grooves
  g.strokeStyle = 'rgba(60, 38, 4, 0.45)';
  g.lineWidth = 2;
  for (let r = R * 0.28; r < R * 0.92; r += 16) {
    g.beginPath();
    g.arc(0, 0, r, 0, TAU);
    g.stroke();
  }

  if (diagram) {
    // Pulsar sunburst map (14 radial binary lines) + Hydrogen hyperfine spin-flip symbol
    g.strokeStyle = '#2b1902';
    g.lineWidth = 5;
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * TAU;
      const len = R * (0.35 + (i % 3) * 0.18);
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(Math.cos(a) * len, Math.sin(a) * len);
      g.stroke();
    }
    // Two hydrogen circles at bottom
    g.beginPath();
    g.arc(-60, R * 0.62, 26, 0, TAU);
    g.arc(60, R * 0.62, 26, 0, TAU);
    g.moveTo(-34, R * 0.62);
    g.lineTo(34, R * 0.62);
    g.stroke();
  }

  // Center spindle label
  g.fillStyle = '#3b2404';
  g.beginPath();
  g.arc(0, 0, R * 0.2, 0, TAU);
  g.fill();
  g.fillStyle = '#05070f';
  g.beginPath();
  g.arc(0, 0, R * 0.05, 0, TAU);
  g.fill();

  g.restore();

  if (wave) {
    // Audio waveform below disc
    g.strokeStyle = '#ffd400';
    g.lineWidth = 7;
    g.beginPath();
    for (let i = 0; i <= 80; i++) {
      const u = i / 80;
      const wx = cx - 380 + u * 760;
      const wy = cy + R + 120 + Math.sin(u * 26 + t * 8) * 55 * Math.sin(u * Math.PI);
      i ? g.lineTo(wx, wy) : g.moveTo(wx, wy);
    }
    g.stroke();
  }
}

// 1. Hook — 1977 Launch & Golden Record in Deep Space
shot('hook', (t, a, b, g) => {
  K.nightSky(g, t, { y1: 1920, seed: 3 });
  const lt = t - a;
  const z = lerp(0.88, 1.04, clamp(lt / 4));
  drawGoldenRecord(g, 540, 780, 320 * z, lt * 0.35, { diagram: true, t });
  g.fillStyle = '#ffffff';
  g.font = "700 68px 'Inter'";
  g.textAlign = 'center';
  g.fillText('VOYAGER 1 & 2 (1977)', 540, 340);
  g.fillStyle = '#ffd400';
  g.font = "600 40px 'Inter'";
  g.fillText('PIRINGAN TEMBAGA BERLAPIS EMAS 12 INCI', 540, 1210);
});

// 2. Piringan — Carl Sagan's Cosmic Time Capsule
shot('piringan', (t, a, b, g) => {
  K.nightSky(g, t, { y1: 1920, seed: 7 });
  const lt = t - a;
  drawGoldenRecord(g, 540, 740, 330, lt * 0.5, { diagram: false, t });
  g.fillStyle = '#ffffff';
  g.font = "700 60px 'Inter'";
  g.textAlign = 'center';
  g.fillText('KAPSUL WAKTU ANTARBINTANG', 540, 320);
});

// 3. Diagram — 14 Pulsar Map & Playback Speed Instructions (16 2/3 RPM)
shot('diagram', (t, a, b, g) => {
  g.fillStyle = '#2d271e';
  g.fillRect(0, 0, 1080, 1920);
  K.paper(g, 540, 860, 940, 1360, { bar: 80 });
  drawGoldenRecord(g, 540, 760, 290, 0, { diagram: true, t });
  K.dotText(g, '14 PULSAR COSMIC MAP', 160, 310, { size: 12 });
  K.dotText(g, 'SPEED: 16.67 RPM', 210, 1140, { size: 13 });
  K.penCircle(g, 540, 760, 320, 320, clamp((t - a - 0.3) / 1.2));
});

// 4. Indonesia — "Selamat Malam" & Gamelan Puspawarna (Pura Pakualaman)
shot('indonesia', (t, a, b, g) => {
  K.nightSky(g, t, { y1: 1920, seed: 11 });
  drawGoldenRecord(g, 540, 680, 270, t * 0.8, { diagram: false, wave: true, t });
  g.fillStyle = '#ffffff';
  g.font = "700 58px 'Inter'";
  g.textAlign = 'center';
  g.fillText('TRACK 07: GAMELAN JAWA', 540, 310);
  g.fillStyle = '#ffd400';
  g.font = "700 50px 'Inter'";
  g.fillText('"KETAWANG PUSPAWARNA" (4:43)', 540, 1180);
  g.fillStyle = '#7fe0ff';
  g.font = "600 40px 'Inter'";
  g.fillText('+ SAPAAN: "SELAMAT MALAM, HADIRIN SEKALIAN"', 540, 1250);
});

// 5. Sagan — 115 Images, Rain, Heartbeat & Peace Messages
shot('sagan', (t, a, b, g) => {
  g.fillStyle = '#2d271e';
  g.fillRect(0, 0, 1080, 1920);
  K.paper(g, 540, 860, 940, 1360, { bar: 85, scroll: (t - a) * 60 });
  K.dotText(g, 'CONTENTS OF VOYAGER RECORD', 130, 320, { size: 11 });
  K.dotText(g, '115 ANALOG IMAGES', 160, 480, { size: 13 });
  K.dotText(g, '55 LANGUAGES GREETING', 160, 640, { size: 13 });
  K.dotText(g, '90 MIN WORLD MUSIC', 160, 800, { size: 13 });
  K.dotText(g, 'HEARTBEAT AND RAIN', 160, 960, { size: 13 });
  K.handwrite(g, 'Puspawarna!', 220, 1140, clamp((t - a - 0.6) / 0.9), { size: 110 });
});

// 6. Antariksa — 24 Billion Kilometers in Interstellar Space
shot('antariksa', (t, a, b, g) => {
  K.nightSky(g, t, { y1: 1920, seed: 19 });
  K.waves(g, t, 860, 340, { from: [220, 960], strength: 0.95 });
  drawGoldenRecord(g, 320, 860, 230, t * 0.4, { diagram: true, t });
  g.fillStyle = '#ffffff';
  g.font = "700 72px 'Inter'";
  g.textAlign = 'center';
  g.fillText('JARAK: > 24 MILIAR KM', 540, 360);
  g.fillStyle = '#7fe0ff';
  g.font = "600 42px 'Inter'";
  g.fillText('BERTAHAN 1.000.000.000 TAHUN DI RUANG ANTARBINTANG', 540, 1210);
});

export function render(t, AM) {
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id);
  const g = K.tape();
  const rewEnd = C.antariksa ? C.antariksa.start + 0.4 : -1;
  const rew = s.id === 'antariksa' && t < rewEnd;
  s.fn(rew ? a - (t - a) * 4 : t, Math.max(0, a), b, g);

  const since = t - Math.max(0, a);
  const stopT = AM.duration - 0.55;
  const mode = rew ? 'rew' : s.id === 'indonesia' && since > 1.8 && since < 3.2 ? 'pause' : t > stopT ? 'stop' : 'play';
  const cutJolt = s.id !== 'hook' && since < 0.2 ? 1 - since / 0.2 : 0;
  K.vhs(out, t, { mode, tracking: 0.35 + cutJolt * 2, band: 0.6 + cutJolt * 2, jump: cutJolt > 0.6 ? (1 - cutJolt) * 0.15 : 0 });
  if (t > stopT) {
    out.fillStyle = `rgba(10,20,120,${clamp((t - stopT) / 0.25) * 0.85})`;
    out.fillRect(0, 0, 1080, 1920);
  }
  K.osd(out, t, { mode, counter: 14 * 3600 + 5 * 60 + t, date: s.id === 'hook' ? 'SEP. 05 1977' : null, label: 'NASA JPL ARCHIVE' });
  if (s.id === 'piringan') K.lowerThird(out, 'CARL SAGAN', 'KETUA KOMITE VOYAGER GOLDEN RECORD', 70, 1180, { alpha: clamp((t - a - 0.2) / 0.4) });
  if (s.id === 'indonesia') K.lowerThird(out, 'KETAWANG PUSPAWARNA', 'GAMELAN PAKUALAMAN (K.R.T. WASITODININGRAT)', 70, 1280, { alpha: clamp((t - a - 0.2) / 0.4) });
  K.crt(out);
}

