// Noir Dokumenter — Demo 2: Letusan Tambora 1815 — Tahun Ketika Dunia Kehilangan Musim Panas
import * as K from '/styles/noir-dokumenter/kit.js';
const { clamp, lerp, ease, prog } = AM.lib;

export const meta = { fps: 24, hold: 1, captions: { preset: 'typewriter', y: 1480, size: 54 } };

let ctx, fx;
const C = {};
const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });

export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;
}

const sc = () => ctx.setTransform(1, 0, 0, 1, 0, 0);
function kb(t, a, b, z0, z1, cx0, cy0, cx1, cy1) {
  const p = prog(t, a, b, ease.inOutSine), [wx, wy] = K.weave(t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(540 + wx, 960 + wy);
  const z = lerp(z0, z1, p);
  ctx.scale(z, z);
  ctx.translate(-lerp(cx0, cx1, p), -lerp(cy0, cy1, p));
}
const PX = 80, PY = 170;

// 1. Hook — 1816 Year Without a Summer
shot('hook', (t, a, b) => {
  K.desk(ctx);
  kb(t, a, b, 1.1, 1.0, 540, 780, 540, 900);
  K.paper(ctx, PX, PY, 920, 1180, { rot: -0.01, seed: 7 });
  ctx.save();
  ctx.translate(PX, PY);
  ctx.rotate(-0.01);
  K.type(ctx, 'BERKAS IKLIM GLOBAL  No. 1815/04', 60, 100, prog(t, a, a + 0.8, ease.linear), { size: 38 });
  K.type(ctx, 'SUBJEK: ANOMALI MUSIM DINGIN JUNI 1816', 60, 150, prog(t, a + 0.4, a + 1.3, ease.linear), { size: 28 });

  ctx.save();
  ctx.translate(130, 200);
  ctx.rotate(0.015);
  ctx.fillStyle = '#efe6d2';
  ctx.fillRect(-14, -14, 688, 560);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, 660, 532);
  ctx.clip();
  const z = lerp(1.0, 1.12, prog(t, a, b));
  ctx.translate(330, 266);
  ctx.scale(z * 0.76, z * 0.76);
  ctx.drawImage(K.volcanoArt('big'), -450, -470);
  ctx.restore();
  ctx.restore();
  K.clip(ctx, 170, 190, 1.1);

  K.type(ctx, 'Gbr. 1 — Salju turun di Eropa & Amerika pada bulan Juni 1816', 90, 820, prog(t, a + 0.8, a + 1.8, ease.linear), { size: 25, color: 'rgba(29,25,21,.75)' });
  K.type(ctx, 'SUMBER ANOMALI:', 60, 920, prog(t, a + 1.2, a + 2.0, ease.linear), { size: 36 });
  const rv = a + 2.2;
  K.type(ctx, 'PULAU SUMBAWA, NUSANTARA', 60, 985, t > rv ? 1 : 0, { size: 42, caret: false, color: K.PAL.redInk });
  K.redact(ctx, 54, 992, 650, 58, prog(t, rv, rv + 0.45, ease.linear));
  K.circleMark(ctx, 370, 970, 340, 48, prog(t, rv + 0.45, rv + 1.1));
  ctx.restore();
});

// 2. Abu — Gunung Tambora 10 April 1815 (4.300m -> 2.850m)
shot('abu', (t, a, b) => {
  K.desk(ctx);
  kb(t, a, b, 1.06, 1.0, 540, 820, 540, 880);
  K.paper(ctx, PX, PY, 920, 1180, { rot: 0.012, seed: 11 });
  ctx.save();
  ctx.translate(PX, PY);
  ctx.rotate(0.012);
  K.type(ctx, 'LAMPIRAN A — PUNCAK YANG HILANG', 60, 100, prog(t, a, a + 0.7, ease.linear), { size: 38 });
  K.type(ctx, 'TANGGAL: 10 APRIL 1815 · PULAU SUMBAWA', 60, 150, prog(t, a + 0.4, a + 1.2, ease.linear), { size: 28 });

  ctx.save();
  ctx.translate(130, 200);
  ctx.fillStyle = '#efe6d2';
  ctx.fillRect(-14, -14, 688, 560);
  ctx.beginPath();
  ctx.rect(0, 0, 660, 532);
  ctx.clip();
  ctx.translate(330, 266);
  ctx.scale(0.78, 0.78);
  ctx.drawImage(K.volcanoArt('big'), -450, -470);
  ctx.restore();

  const rv = a + 2.0;
  K.type(ctx, 'TINGGI AWAL: 4.300 MDPL  →  SISA: 2.850 MDPL', 60, 860, prog(t, a + 1.0, a + 2.0, ease.linear), { size: 32 });
  K.type(ctx, '150 KM³ BATUAN & ABU', 60, 955, t > rv ? 1 : 0, { size: 58, caret: false, color: K.PAL.redInk });
  K.redact(ctx, 54, 965, 620, 74, prog(t, rv, rv + 0.45, ease.linear));
  K.type(ctx, 'Kaldera raksasa selebar 7 kilometer terbentuk dalam semalam', 60, 1040, prog(t, rv + 0.4, rv + 1.4, ease.linear), { size: 27 });
  ctx.restore();
  K.stamp(ctx, 'VEI-7 KOLOSAL', 700, 410, prog(t, a + 0.8, a + 1.2, ease.linear), { size: 86, rot: -0.14, sub: 'SUMBAWA 1815' });
});

// 3. Eropa — Stratospheric Aerosol Curtain on Globe
shot('eropa', (t, a, b) => {
  K.desk(ctx);
  kb(t, a, b, 1.0, 1.05, 540, 860, 540, 840);
  const lt = t - a, ph = lt * 1.8;
  const rings = [0, 0.9, 1.8].map((o) => ({ th: Math.acos(Math.cos(Math.max(0, ph - o))), a: ph - o > 0 ? 0.85 : 0 }));
  K.globe(ctx, 540, 750, 340, -1.75 + lt * 0.22, rings, { lon0: 118, lat0: -8.2 });
  sc();
  ctx.save();
  ctx.translate(...K.weave(t));
  K.type(ctx, 'LAMPIRAN B — TIRAI AEROSOL STRATOSFER', 80, 270, prog(t, a, a + 0.8, ease.linear), { size: 34, color: K.PAL.sepiaHi });
  K.type(ctx, '60 JUTA TON BELERANG MENYELIMUTI BUMI', 80, 1165, prog(t, a + 0.5, a + 1.4, ease.linear), { size: 32, color: K.PAL.sepiaHi });
  K.barograph(ctx, 80, 1205, 900, 120, prog(t, a + 0.2, b, ease.linear), [0.15, 0.32, 0.5, 0.68, 0.84].map((at, i) => ({ at, amp: 0.42 - i * 0.05 })));
  ctx.restore();
});

// 4. Lukisan — Global Cooling, Crop Failure & Mary Shelley's Frankenstein
shot('lukisan', (t, a, b) => {
  K.desk(ctx);
  kb(t, a, b, 1.08, 1.0, 620, 900, 540, 860);
  const MX = 40, MY = 320;
  ctx.save();
  ctx.translate(MX + 500, MY + 450);
  ctx.rotate(0.01);
  ctx.fillStyle = 'rgba(0,0,0,.5)';
  ctx.fillRect(-490, -440, 1000, 900);
  ctx.drawImage(K.mapArt(), -500, -450);
  ctx.restore();

  const [sx, sy] = K.MAP.proj(118.0, -8.2), [ex, ey] = K.MAP.proj(40.0, 28.0);
  const SX = MX + sx, SY = MY + sy, EX = MX + ex, EY = MY + ey;
  K.pin(ctx, SX, SY, prog(t, a, a + 0.35, ease.linear));
  K.pin(ctx, EX, EY, prog(t, a + 0.6, a + 0.95, ease.linear));
  K.string(ctx, SX, SY - 30, EX, EY - 30, prog(t, a + 0.7, a + 1.8, ease.inOutSine), { sag: -50 });

  sc();
  ctx.save();
  ctx.translate(...K.weave(t));
  K.type(ctx, 'LAMPIRAN C — DAMPAK LINTAS BENUA (1816)', 80, 245, prog(t, a, a + 0.7, ease.linear), { size: 36, color: K.PAL.sepiaHi });
  K.type(ctx, 'GAGAL PANEN EROPA · LAHIRNYA NOVEL FRANKENSTEIN', 80, 1290, prog(t, a + 1.2, a + 2.2, ease.linear), { size: 30, color: K.PAL.sepiaHi });
  ctx.restore();
});

// 5. Korban — 3 Kingdoms Wiped Out (Tambora, Pekat, Sanggar) & 71,000+ Lives
shot('korban', (t, a, b) => {
  K.desk(ctx);
  kb(t, a, b, 1.0, 1.06, 540, 880, 520, 860);
  K.paper(ctx, 60, 230, 960, 1120, { rot: 0.01, seed: 5 });
  ctx.save();
  ctx.translate(60, 230);
  ctx.rotate(0.01);
  ctx.save();
  ctx.translate(30, 40);
  ctx.fillStyle = '#efe6d2';
  ctx.fillRect(-10, -10, 920, 700);
  ctx.beginPath();
  ctx.rect(0, 0, 900, 680);
  ctx.clip();
  const z = lerp(1.0, 1.1, prog(t, a, b));
  ctx.translate(450, 340);
  ctx.scale(z, z);
  ctx.drawImage(K.waveArt(), -450, -350);
  ctx.restore();

  const rv = a + 1.8;
  K.type(ctx, '3 KERAJAAN TERKUBUR (TAMBORA, PEKAT, SANGGAR):', 50, 835, prog(t, a + 0.3, a + 1.3, ease.linear), { size: 32 });
  K.type(ctx, '71.000+ KORBAN JIWA', 50, 930, t > rv ? 1 : 0, { size: 68, caret: false, color: K.PAL.redInk });
  K.redact(ctx, 44, 942, 660, 82, prog(t, rv, rv + 0.4, ease.linear));
  K.type(ctx, 'Akibat aliran piroklastik, tsunami, dan kelaparan global', 50, 1020, prog(t, rv + 0.4, rv + 1.2, ease.linear), { size: 28 });
  ctx.restore();
  K.stamp(ctx, '3 KERAJAAN LENYAP', 680, 410, prog(t, a + 0.2, a + 0.55, ease.linear), { size: 84, rot: -0.14 });
});

// 6. Arsip — Largest Eruption in 10,000 Years
shot('arsip', (t, a, b) => {
  K.desk(ctx);
  kb(t, a, AM.duration, 1.06, 1.0, 540, 820, 540, 900);
  K.paper(ctx, PX, PY, 920, 1180, { rot: -0.012, seed: 3 });
  ctx.save();
  ctx.translate(PX, PY);
  ctx.rotate(-0.012);
  K.type(ctx, 'BERKAS IKLIM GLOBAL  No. 1815/04', 60, 100, 1, { size: 38, caret: false });
  K.type(ctx, 'KESIMPULAN GEOLOGI HOLOSEN', 60, 150, 1, { size: 28, caret: false });

  ctx.save();
  ctx.translate(130, 200);
  ctx.fillStyle = '#efe6d2';
  ctx.fillRect(-14, -14, 688, 560);
  ctx.beginPath();
  ctx.rect(0, 0, 660, 532);
  ctx.clip();
  ctx.translate(330, 280);
  ctx.scale(0.8, 0.8);
  ctx.drawImage(K.volcanoArt('small'), -450, -520);
  ctx.restore();
  K.clip(ctx, 170, 190, 1.1);

  const rv = a + 1.8;
  K.type(ctx, 'REKOR LETUSAN 10.000 TAHUN TERAKHIR:', 60, 860, prog(t, a + 0.3, a + 1.2, ease.linear), { size: 34 });
  K.type(ctx, 'SKALA VEI-7 TERTINGGI', 60, 950, t > rv ? 1 : 0, { size: 54, caret: false, color: K.PAL.redInk });
  K.redact(ctx, 54, 960, 620, 68, prog(t, rv, rv + 0.35, ease.linear));
  K.circleMark(ctx, 350, 932, 320, 52, prog(t, rv + 0.35, rv + 0.95));
  ctx.restore();
  K.stamp(ctx, 'ARSIP SEJARAH', 610, 430, prog(t, a + 0.8, a + 1.2, ease.linear), { size: 94, rot: -0.1, sub: 'TAMBORA 1815' });
});

export function render(t, AM) {
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start - 0.12) s = sh;
  const L = SHOTS.filter((x) => C[x.id]), i = L.indexOf(s);
  const a = Math.max(0, C[s.id].start - 0.12), b = L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1;
  ctx.save();
  s.fn(t, a, b);
  ctx.restore();
  if (s.id !== 'hook' && t - a < 2 / 24) {
    sc();
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 1080, 1920);
  }
  K.filmLook(fx, t, AM);
}

