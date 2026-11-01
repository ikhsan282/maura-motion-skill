// Noir Dokumenter demo (20 s): "Krakatau 1883: suara paling keras dalam sejarah", told as a redacted case file.
// Case file with an engraved eruption photo -> map with pins and red string to Rodrigues (4,800 km) ->
// globe with the pressure wave circling it and a barograph strip -> tsunami engraving, 36,417 dead (official)
// -> Anak Krakatau, stamped BELUM DITUTUP, status AKTIF.
import * as K from '/styles/noir-dokumenter/kit.js';
const { clamp, lerp, ease, prog, env } = AM.lib;

export const meta = { fps: 24, hold: 1, captions: { preset: 'typewriter', y: 1480, size: 58 } };

let ctx, fx;
const C = {};
const W = (id, w) => AM.wordTime(id, w);
const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
export async function setup(AM) {
  ctx = AM.layer('world'); fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;
  AM.sfx('boom', 0.02, { gain: 0.55, pitch: 0.8 });
  AM.sfx('typewriter', 0.35, { gain: 0.35 });
  AM.sfx('paper', C.meriam.start - 0.12, { gain: 0.45 });
  AM.sfx('boom', W('meriam', 'meriam'), { gain: 0.3, pitch: 0.55 });
  AM.sfx('wind', C.bumi.start - 0.1, { gain: 0.3 });
  AM.sfx('stamp', C.korban.start + 0.05, { gain: 0.55 });
  AM.sfx('stamp', W('aktif', 'ditutup') + 0.05, { gain: 0.55 });
  AM.sfx('typewriter', W('aktif', 'masih') - 0.1, { gain: 0.35 });
}
const sc = () => ctx.setTransform(1, 0, 0, 1, 0, 0);
/** Ken Burns camera with gate weave. */
function kb(t, a, b, z0, z1, cx0, cy0, cx1, cy1) {
  const p = prog(t, a, b, ease.inOutSine), [wx, wy] = K.weave(t);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(540 + wx, 960 + wy); const z = lerp(z0, z1, p); ctx.scale(z, z); ctx.translate(-lerp(cx0, cx1, p), -lerp(cy0, cy1, p));
}
const PX = 80, PY = 170; // paper origin (case file)

// 1. The case file: engraved eruption, typed facts, the distance revealed from under a redaction bar.
shot('hook', (t, a, b) => {
  K.desk(ctx);
  kb(t, a, b, 1.12, 1.0, 540, 760, 540, 900);
  K.paper(ctx, PX, PY, 920, 1180, { rot: -0.012, seed: 3 });
  ctx.save(); ctx.translate(PX, PY); ctx.rotate(-0.012);
  K.type(ctx, 'BERKAS PERKARA  No. 1883/08', 60, 100, prog(t, 0.0, 0.7, ease.linear), { size: 40 });
  K.type(ctx, 'SUBJEK: G. KRAKATAU, SELAT SUNDA', 60, 150, prog(t, 0.5, 1.4, ease.linear), { size: 30 });
  // photo with paperclip
  ctx.save(); ctx.translate(130, 200); ctx.rotate(0.02);
  ctx.fillStyle = '#efe6d2'; ctx.fillRect(-14, -14, 688, 588); ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 660, 560); ctx.clip();
  const z = lerp(1.0, 1.12, prog(t, a, b)); const art = K.volcanoArt('big'); ctx.translate(330, 280); ctx.scale(z * 0.76, z * 0.76); ctx.drawImage(art, -450, -470); ctx.restore();
  ctx.restore(); K.clip(ctx, 170, 190, 1.1);
  K.type(ctx, 'Gbr. 1 — letusan, 27 Agustus 1883', 130, 840, prog(t, 0.8, 1.6, ease.linear), { size: 26, color: 'rgba(29,25,21,.75)' });
  // the distance line
  const y = 960, lbl = 'TERDENGAR SEJAUH: ', w0 = K.textW(ctx, lbl, 44);
  K.type(ctx, lbl, 60, y, prog(t, 1.2, 2.2, ease.linear), { size: 44 });
  const rv = W('hook', '4800') - 0.1;
  K.type(ctx, '4.800 km', 60 + w0, y, t > rv ? 1 : 0, { size: 44, caret: false, color: K.PAL.redInk });
  if (t > 1.9) K.redact(ctx, 60 + w0 - 6, y + 6, 230, 56, prog(t, rv, rv + 0.35, ease.linear));
  K.circleMark(ctx, 60 + w0 + 95, y - 14, 140, 46, prog(t, rv + 0.35, rv + 0.9));
  K.type(ctx, '(Pulau Rodrigues, Samudra Hindia)', 60, y + 60, prog(t, rv + 0.5, rv + 1.3, ease.linear), { size: 28 });
  ctx.restore();
});

// 2. The map: pins in Krakatau and Rodrigues, red string across the ocean.
shot('meriam', (t, a, b) => {
  K.desk(ctx);
  kb(t, a, b, 1.08, 1.0, 640, 900, 540, 860);
  const MX = 40, MY = 330;
  ctx.save(); ctx.translate(MX + 500, MY + 450); ctx.rotate(0.01); ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(-490, -440, 1000, 900); ctx.drawImage(K.mapArt(), -500, -450); ctx.restore();
  const [kx, ky] = K.MAP.proj(105.4, -6.1), [rx, ry] = K.MAP.proj(63.4, -19.7);
  const KX = MX + kx, KY = MY + ky, RX = MX + rx, RY = MY + ry;
  K.pin(ctx, KX, KY, prog(t, a, a + 0.3, ease.linear));
  K.pin(ctx, RX, RY, prog(t, W('meriam', 'seberang') - 0.1, W('meriam', 'seberang') + 0.2, ease.linear));
  K.string(ctx, KX, KY - 30, RX, RY - 30, prog(t, W('meriam', 'seberang'), W('meriam', 'mengira'), ease.inOutSine), { sag: 60 });
  const tag = (txt, x, y, p, rot = 0) => { if (p <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = clamp(p * 2); const w = K.textW(ctx, txt, 30) + 30; ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(-w / 2 + 5, -26, w, 50); ctx.fillStyle = '#efe6d2'; ctx.fillRect(-w / 2, -30, w, 50); K.type(ctx, txt, 0, 6, p, { size: 30, align: 'center', caret: false }); ctx.restore(); };
  tag('KRAKATAU', KX - 20, KY + 60, prog(t, a + 0.2, a + 0.7, ease.linear), 0.03);
  tag('P. RODRIGUES', RX + 10, RY + 60, prog(t, W('meriam', 'seberang'), W('meriam', 'seberang') + 0.5, ease.linear), -0.03);
  tag('± 4.800 km', (KX + RX) / 2, (KY + RY) / 2 + 30, prog(t, W('meriam', 'mengira') - 0.1, W('meriam', 'mengira') + 0.4, ease.linear), -0.08);
  sc();
  ctx.save(); ctx.translate(...K.weave(t));
  K.type(ctx, 'LAMPIRAN A — PETA', 80, 250, prog(t, a, a + 0.6, ease.linear), { size: 38, color: K.PAL.sepiaHi });
  ctx.restore();
  tag('dikira dentuman meriam', 540, 1290, prog(t, W('meriam', 'meriam') - 0.2, W('meriam', 'meriam') + 0.5, ease.linear), 0.02);
});

// 3. The pressure wave circles the globe; the barograph records it again and again.
shot('bumi', (t, a, b) => {
  K.desk(ctx);
  kb(t, a, b, 1.0, 1.05, 540, 860, 540, 840);
  const lt = t - a, ph = lt * 2.2;
  const rings = [0, 1.1].map((o) => ({ th: Math.acos(Math.cos(Math.max(0, ph - o))), a: ph - o > 0 ? 0.9 : 0 }));
  K.globe(ctx, 540, 760, 340, -1.55 + lt * 0.25, rings);
  const n = Math.min(7, 1 + Math.floor(lt * 2.4));
  sc(); ctx.save(); ctx.translate(...K.weave(t));
  K.type(ctx, 'LAMPIRAN B — GELOMBANG TEKANAN', 80, 280, prog(t, a, a + 0.7, ease.linear), { size: 34, color: K.PAL.sepiaHi });
  K.type(ctx, `terekam barograf: ${n}x dalam 5 hari`, 80, 1170, prog(t, a + 0.4, a + 1.2, ease.linear), { size: 34, color: K.PAL.sepiaHi });
  K.barograph(ctx, 80, 1205, 900, 120, prog(t, a + 0.2, b, ease.linear), [0.12, 0.27, 0.42, 0.56, 0.7, 0.83, 0.95].map((at, i) => ({ at, amp: 0.38 - i * 0.04 })));
  ctx.restore();
});

// 4. The tsunami: engraving, TSUNAMI stamp, the toll revealed from under the bar.
shot('korban', (t, a, b) => {
  K.desk(ctx);
  kb(t, a, b, 1.0, 1.06, 540, 880, 520, 860);
  K.paper(ctx, 60, 230, 960, 1120, { rot: 0.01, seed: 5 });
  ctx.save(); ctx.translate(60, 230); ctx.rotate(0.01);
  ctx.save(); ctx.translate(30, 40); ctx.fillStyle = '#efe6d2'; ctx.fillRect(-10, -10, 920, 720); ctx.beginPath(); ctx.rect(0, 0, 900, 700); ctx.clip();
  const z = lerp(1.0, 1.1, prog(t, a, b)); ctx.translate(450, 350); ctx.scale(z, z); ctx.translate(-30 * prog(t, a, b), 0); ctx.drawImage(K.waveArt(), -450, -350); ctx.restore();
  K.type(ctx, 'KORBAN JIWA (catatan resmi):', 50, 860, prog(t, a + 0.2, a + 1.0, ease.linear), { size: 40 });
  const rv = W('korban', '36') - 0.1, wl = 50;
  K.type(ctx, '36.417 JIWA', wl, 950, t > rv ? 1 : 0, { size: 78, caret: false, color: K.PAL.redInk });
  if (t > a + 0.5) K.redact(ctx, wl - 10, 962, 480, 86, prog(t, rv, rv + 0.35, ease.linear));
  K.type(ctx, 'sebagian besar akibat tsunami', 50, 1040, prog(t, rv + 0.4, rv + 1.1, ease.linear), { size: 32 });
  ctx.restore();
  K.stamp(ctx, 'TSUNAMI', 760, 420, prog(t, a + 0.05, a + 0.3, ease.linear), { size: 110, rot: -0.16 });
});

// 5. Anak Krakatau: BELUM DITUTUP. Status: AKTIF.
shot('aktif', (t, a, b) => {
  K.desk(ctx);
  kb(t, a, AM.duration, 1.06, 1.0, 540, 820, 540, 900);
  K.paper(ctx, PX, PY, 920, 1180, { rot: -0.012, seed: 3 });
  ctx.save(); ctx.translate(PX, PY); ctx.rotate(-0.012);
  K.type(ctx, 'BERKAS PERKARA  No. 1883/08', 60, 100, 1, { size: 40, caret: false });
  K.type(ctx, 'LANJUTAN', 60, 150, 1, { size: 30, caret: false });
  ctx.save(); ctx.translate(130, 200); ctx.rotate(-0.015);
  ctx.fillStyle = '#efe6d2'; ctx.fillRect(-14, -14, 688, 588); ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 660, 560); ctx.clip();
  const z = lerp(1.0, 1.1, prog(t, a, AM.duration)); ctx.translate(330, 290); ctx.scale(z * 0.76, z * 0.76); ctx.drawImage(K.volcanoArt('small'), -450, -520);
  // fresh ash puffs rising from the young cone
  ctx.strokeStyle = K.PAL.ink; ctx.lineWidth = 3; for (let i = 0; i < 4; i++) { const u = ((t - a) * 0.35 + i / 4) % 1; ctx.globalAlpha = 1 - u; ctx.beginPath(); ctx.arc(0 + Math.sin(i * 2 + u * 3) * 30, -20 - u * 300, 26 + u * 50, 0, Math.PI * 2); ctx.stroke(); }
  ctx.restore(); ctx.restore(); K.clip(ctx, 170, 190, 1.1);
  K.type(ctx, 'Gbr. 2 — Anak Krakatau, muncul dari laut 1927', 130, 840, prog(t, a + 0.1, a + 1.0, ease.linear), { size: 26, color: 'rgba(29,25,21,.75)' });
  const lbl = 'STATUS: ', w0 = K.textW(ctx, lbl, 54), y = 980, rv = W('aktif', 'aktif') - 0.1;
  K.type(ctx, lbl, 60, y, prog(t, W('aktif', 'anak') - 0.2, W('aktif', 'anak') + 0.3, ease.linear), { size: 54 });
  K.type(ctx, 'AKTIF', 60 + w0, y, t > rv ? 1 : 0, { size: 54, caret: false, color: K.PAL.redInk });
  if (t > W('aktif', 'anak')) K.redact(ctx, 60 + w0 - 6, y + 8, 200, 64, prog(t, rv, rv + 0.3, ease.linear));
  K.circleMark(ctx, 60 + w0 + 80, y - 18, 120, 48, prog(t, rv + 0.3, rv + 0.85));
  ctx.restore();
  K.stamp(ctx, 'BELUM DITUTUP', 600, 440, prog(t, W('aktif', 'ditutup') - 0.05, W('aktif', 'ditutup') + 0.2, ease.linear), { size: 100, rot: -0.1, sub: 'BERKAS 1883' });
  const fo = prog(t, AM.duration - 0.4, AM.duration);
  if (fo > 0) { sc(); ctx.fillStyle = `rgba(0,0,0,${fo * 0.7})`; ctx.fillRect(0, 0, 1080, 1920); }
});

export function render(t, AM) {
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start - 0.12) s = sh;
  const L = SHOTS.filter((x) => C[x.id]), i = L.indexOf(s);
  const a = Math.max(0, C[s.id].start - 0.12), b = L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1;
  ctx.save(); s.fn(t, a, b); ctx.restore();
  // hard cut through black (2 frames) on every new exhibit
  if (s.id !== 'hook' && t - a < 2 / 24) { sc(); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 1080, 1920); }
  K.filmLook(fx, t, AM);
}
