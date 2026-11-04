// Noir Dokumenter — Demo 3: Misteri Kapal SS Ourang Medan 1947 — Pesan SOS Terakhir dari Selat Malaka
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

// 1. Hook — Case File SS Ourang Medan 1947
shot('hook', (t, a, b) => {
  K.desk(ctx);
  kb(t, a, b, 1.1, 1.0, 540, 780, 540, 900);
  K.paper(ctx, PX, PY, 920, 1180, { rot: -0.012, seed: 9 });
  ctx.save();
  ctx.translate(PX, PY);
  ctx.rotate(-0.012);
  K.type(ctx, 'BERKAS MARITIM  No. 1947/06-MLK', 60, 100, prog(t, a, a + 0.8, ease.linear), { size: 38 });
  K.type(ctx, 'SUBJEK: KAPAL DAGANG SS OURANG MEDAN', 60, 150, prog(t, a + 0.4, a + 1.3, ease.linear), { size: 28 });

  ctx.save();
  ctx.translate(130, 200);
  ctx.fillStyle = '#efe6d2';
  ctx.fillRect(-14, -14, 688, 560);
  ctx.beginPath();
  ctx.rect(0, 0, 660, 532);
  ctx.clip();
  ctx.translate(330, 266);
  ctx.scale(0.82, 0.82);
  ctx.drawImage(K.waveArt(), -450, -350);
  ctx.restore();
  K.clip(ctx, 170, 190, 1.1);

  const rv = a + 2.2;
  K.type(ctx, 'LOKASI SINYAL DARURAT:', 60, 855, prog(t, a + 1.0, a + 1.9, ease.linear), { size: 34 });
  K.type(ctx, 'PERAIRAN SELAT MALAKA', 60, 935, t > rv ? 1 : 0, { size: 48, caret: false, color: K.PAL.redInk });
  K.redact(ctx, 54, 945, 600, 64, prog(t, rv, rv + 0.45, ease.linear));
  K.circleMark(ctx, 340, 918, 300, 48, prog(t, rv + 0.45, rv + 1.1));
  ctx.restore();
});

// 2. SOS — Morse Signal Intercepted
shot('sos', (t, a, b) => {
  K.desk(ctx);
  kb(t, a, b, 1.0, 1.05, 540, 860, 540, 840);
  const lt = t - a, ph = lt * 2.0;
  const rings = [0, 0.8, 1.6].map((o) => ({ th: Math.acos(Math.cos(Math.max(0, ph - o))), a: ph - o > 0 ? 0.85 : 0 }));
  K.globe(ctx, 540, 740, 330, -1.65 + lt * 0.2, rings, { lon0: 100.5, lat0: 2.5 });
  sc();
  ctx.save();
  ctx.translate(...K.weave(t));
  K.type(ctx, 'LAMPIRAN A — INTERSEPSI RADIO MORSE', 80, 265, prog(t, a, a + 0.7, ease.linear), { size: 34, color: K.PAL.sepiaHi });
  K.type(ctx, '••• ——— •••   SINYAL SOS DARI SS OURANG MEDAN', 80, 1165, prog(t, a + 0.5, a + 1.4, ease.linear), { size: 32, color: K.PAL.sepiaHi });
  K.barograph(ctx, 80, 1205, 900, 120, prog(t, a + 0.2, b, ease.linear), [0.18, 0.35, 0.52, 0.69, 0.86].map((at) => ({ at, amp: 0.4 })));
  ctx.restore();
});

// 3. Peta — Final Chilling Morse Message
shot('peta', (t, a, b) => {
  K.desk(ctx);
  kb(t, a, b, 1.06, 1.0, 540, 820, 540, 880);
  K.paper(ctx, PX, PY, 920, 1180, { rot: 0.01, seed: 13 });
  ctx.save();
  ctx.translate(PX, PY);
  ctx.rotate(0.01);
  K.type(ctx, 'TRANSKRIP TELEGRAM SANDI MORSE', 60, 110, prog(t, a, a + 0.7, ease.linear), { size: 38 });
  K.type(ctx, 'OPERATOR STASIUN PANTAI BELANDA & INGGRIS', 60, 160, prog(t, a + 0.4, a + 1.2, ease.linear), { size: 26 });

  K.type(ctx, '"Seluruh perwira termasuk kapten telah', 60, 310, prog(t, a + 0.7, a + 1.6, ease.linear), { size: 34 });
  K.type(ctx, 'tewas di ruang peta dan anjungan."', 60, 365, prog(t, a + 1.4, a + 2.2, ease.linear), { size: 34 });
  K.type(ctx, '"Kemungkinan seluruh awak kapal tewas..."', 60, 455, prog(t, a + 2.0, a + 2.9, ease.linear), { size: 34 });

  const rv = a + 2.6;
  K.type(ctx, 'PESAN TERAKHIR:', 60, 620, prog(t, a + 2.2, a + 2.8, ease.linear), { size: 36 });
  K.type(ctx, '"AKU MATI." (I DIE)', 60, 710, t > rv ? 1 : 0, { size: 64, caret: false, color: K.PAL.redInk });
  K.redact(ctx, 54, 720, 620, 80, prog(t, rv, rv + 0.45, ease.linear));
  K.circleMark(ctx, 350, 690, 320, 56, prog(t, rv + 0.45, rv + 1.1));
  ctx.restore();
  K.stamp(ctx, 'SOS TERPUTUS', 670, 1080, prog(t, a + 1.8, a + 2.2, ease.linear), { size: 88, rot: -0.12 });
});

// 4. Dek — US Vessel Silver Star Tracks Coordinates in Malacca Strait
shot('dek', (t, a, b) => {
  K.desk(ctx);
  kb(t, a, b, 1.08, 1.0, 680, 880, 560, 860);
  const MX = 40, MY = 320;
  ctx.save();
  ctx.translate(MX + 500, MY + 450);
  ctx.rotate(0.01);
  ctx.fillStyle = 'rgba(0,0,0,.5)';
  ctx.fillRect(-490, -440, 1000, 900);
  ctx.drawImage(K.mapArt(), -500, -450);
  ctx.restore();

  const [mx0, my0] = K.MAP.proj(99.5, 3.2), [mx1, my1] = K.MAP.proj(104.0, -2.5);
  const X0 = MX + mx0, Y0 = MY + my0, X1 = MX + mx1, Y1 = MY + my1;
  K.pin(ctx, X0, Y0, prog(t, a, a + 0.35, ease.linear));
  K.pin(ctx, X1, Y1, prog(t, a + 0.5, a + 0.85, ease.linear));
  K.string(ctx, X0, Y0 - 30, X1, Y1 - 30, prog(t, a + 0.6, a + 1.6, ease.inOutSine), { sag: 35 });

  sc();
  ctx.save();
  ctx.translate(...K.weave(t));
  K.type(ctx, 'LAMPIRAN B — KOORDINAT PENEMUAN KAPAL', 80, 245, prog(t, a, a + 0.7, ease.linear), { size: 36, color: K.PAL.sepiaHi });
  K.type(ctx, 'KAPAL SILVER STAR MENEMUKAN AWAK TEWAS TANPA LUKA', 80, 1290, prog(t, a + 1.0, a + 2.0, ease.linear), { size: 28, color: K.PAL.sepiaHi });
  ctx.restore();
});

// 5. Ledakan — Hold No. 4 Explosion & Sinking
shot('ledakan', (t, a, b) => {
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
  ctx.drawImage(K.volcanoArt('big'), -450, -450);
  ctx.restore();

  const rv = a + 1.8;
  K.type(ctx, 'INSIDEN SAAT PROSES PENARIKAN TUNDA:', 50, 835, prog(t, a + 0.3, a + 1.2, ease.linear), { size: 34 });
  K.type(ctx, 'PALKA NO. 4 MELEDAK', 50, 930, t > rv ? 1 : 0, { size: 64, caret: false, color: K.PAL.redInk });
  K.redact(ctx, 44, 942, 620, 80, prog(t, rv, rv + 0.4, ease.linear));
  K.type(ctx, 'Seluruh bangkai kapal tenggelam bersama barang bukti', 50, 1020, prog(t, rv + 0.4, rv + 1.2, ease.linear), { size: 28 });
  ctx.restore();
  K.stamp(ctx, 'BUKTI TENGGELAM', 680, 410, prog(t, a + 0.2, a + 0.55, ease.linear), { size: 84, rot: -0.14 });
});

// 6. Rahasia — Unsolved Cold Case (Chemical Cargo / Sulfuric Acid / Legend)
shot('rahasia', (t, a, b) => {
  K.desk(ctx);
  kb(t, a, AM.duration, 1.06, 1.0, 540, 820, 540, 900);
  K.paper(ctx, PX, PY, 920, 1180, { rot: -0.012, seed: 3 });
  ctx.save();
  ctx.translate(PX, PY);
  ctx.rotate(-0.012);
  K.type(ctx, 'BERKAS COAST GUARD AMERIKA SERIKAT (1952)', 60, 100, 1, { size: 34, caret: false });
  K.type(ctx, 'HIPOTESIS: KARGO ASAM NITRAT / GAS SARAF', 60, 150, 1, { size: 28, caret: false });

  ctx.save();
  ctx.translate(130, 200);
  ctx.fillStyle = '#efe6d2';
  ctx.fillRect(-14, -14, 688, 560);
  ctx.beginPath();
  ctx.rect(0, 0, 660, 532);
  ctx.clip();
  ctx.translate(330, 266);
  ctx.scale(0.82, 0.82);
  ctx.drawImage(K.waveArt(), -450, -350);
  ctx.restore();
  K.clip(ctx, 170, 190, 1.1);

  const rv = a + 1.8;
  K.type(ctx, 'STATUS PENYELIDIKAN MARITIM:', 60, 860, prog(t, a + 0.3, a + 1.2, ease.linear), { size: 34 });
  K.type(ctx, 'BELUM TERPECAHKAN', 60, 950, t > rv ? 1 : 0, { size: 54, caret: false, color: K.PAL.redInk });
  K.redact(ctx, 54, 960, 600, 68, prog(t, rv, rv + 0.35, ease.linear));
  K.circleMark(ctx, 340, 932, 310, 52, prog(t, rv + 0.35, rv + 0.95));
  ctx.restore();
  K.stamp(ctx, 'KASUS DINGIN', 610, 430, prog(t, a + 0.8, a + 1.2, ease.linear), { size: 94, rot: -0.1, sub: 'ARSIP 1947' });
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

