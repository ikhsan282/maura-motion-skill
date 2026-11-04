// Dark Glow Product UI — Demo 2: Kenapa Server Tidak Pernah Tahu Password-mu? (Hash & Salt)
import * as K from '/styles/dark-glow-ui/kit.js';
const { clamp, lerp, ease, env } = AM.lib;
const P = K.PAL, R = K.RGB;

export const meta = { fps: 24, hold: 1, captions: { preset: 'neon', y: 1482, size: 52 } };

let world, ui;
const C = {};
const HASH_A = 'e3b0c44298fc1c149afbf4c8996fb924';
const HASH_B = '7a9d4f11c82b06e531fa90d24c78b31e';

export async function setup(AM) {
  world = AM.layer('world');
  ui = AM.layer('ui');
  for (const l of AM.timeline.lines) C[l.id] = l;

  AM.sfx('click', C.input.start + 0.3, { gain: 0.45 });
  AM.sfx('glitch', C.hash.start + 0.3, { gain: 0.45 });
  AM.sfx('whoosh', C.satu_arah.start + 0.25, { gain: 0.35 });
  AM.sfx('magic', C.salt.start + 0.35, { gain: 0.4 });
  AM.sfx('tick', C.login.start + 0.5, { gain: 0.45 });
  AM.sfx('impact', C.kebocoran.start + 0.5, { gain: 0.45 });
  AM.sfx('chime', C.penutup.start + 0.4, { gain: 0.4 });
}

export function render(t) {
  K.stage(world, t, { px: Math.sin(t * 0.25) * 40, py: Math.cos(t * 0.2) * 30, intensity: 1 });
  world.setTransform(1, 0, 0, 1, 0, 0);
  ui.setTransform(1, 0, 0, 1, 0, 0);

  // Corner micro HUD
  K.micro(ui, 'ARGON2ID · SHA-256', 64, 72, { size: 18 });
  const sec = Math.floor(t), fr = Math.floor((t % 1) * 24);
  K.micro(ui, `00:${String(sec).padStart(2, '0')}:${String(fr).padStart(2, '0')}`, 1016, 72, { size: 18, align: 'right' });

  // Shot 1: Hook — Server does not know your password
  const a1 = env(t, C.hook.start, C.input.start, 0.25, 0.25);
  if (a1 > 0) {
    world.save();
    world.globalAlpha = a1;
    K.micro(ui, 'KEAMANAN KRIPTOGRAFI · ZERO PLAINTEXT', 540, 155, { align: 'center', alpha: a1, color: P.ink2, size: 22 });
    K.headline(ui, t, C.hook.start + 0.05, ['Server tidak pernah', 'tahu *password*-mu.'], 540, 240, { size: 76, out: C.input.start - 0.1 });

    const p = K.sp(t, C.hook.start + 0.15, 0.65, 0.72);
    world.save();
    K.rise(world, 540, 740, p);
    K.server(world, 540, 680, 1.0, t, { active: 0.6, rgb: R.violet });
    K.glass(world, 170, 960, 740, 140, { r: 42, haloRgb: R.pink, haloA: 0.45 });
    K.eyeOff(world, 250, 1030, 44, P.pink);
    K.label(world, 'Password Asli: TIDAK TERSIMPAN', 305, 1030, { size: 32, weight: 700, color: P.ink });
    world.restore();
    world.restore();
  }

  // Shot 2: Input — Typing secret password on phone
  const a2 = env(t, C.input.start, C.hash.start, 0.25, 0.25);
  if (a2 > 0) {
    world.save();
    world.globalAlpha = a2;
    K.micro(ui, 'LANGKAH 01 · INPUT PENGGUNA', 540, 155, { align: 'center', alpha: a2, color: P.ink2, size: 22 });
    K.headline(ui, t, C.input.start + 0.05, ['Diketik di layar,', 'bukan *disalin* mentah.'], 540, 240, { size: 72, out: C.hash.start - 0.1 });

    const p = K.sp(t, C.input.start + 0.15, 0.6, 0.72);
    const typedLen = Math.floor(clamp((t - C.input.start - 0.3) / 1.8) * 12);
    const raw = 'KopiSenja#99'.slice(0, typedLen);

    world.save();
    K.rise(world, 540, 860, p);
    K.glass(world, 140, 620, 800, 390, { r: 44, haloRgb: R.blue, haloA: 0.45 });
    K.micro(world, 'FORMULIR PENDAFTARAN AKUN', 200, 685, { size: 20, color: P.cyan });
    K.glass(world, 190, 735, 700, 110, { r: 28, tint: 'rgba(8,10,22,0.88)', haloRgb: R.violet, haloA: 0.35 });
    K.keyIcon(world, 255, 790, 0.32, { rgb: R.cyan });
    K.label(world, raw + (Math.floor(t * 3) % 2 ? '|' : ''), 315, 792, { size: 42, weight: 700, font: K.FONT.mono, color: P.ink });
    K.label(world, 'Jangan pernah disimpan sebagai teks biasa (plaintext)', 540, 925, { size: 26, color: P.ink2, align: 'center' });
    world.restore();
    world.restore();
  }

  // Shot 3: Hash — Scrambled into 64-char digest
  const a3 = env(t, C.hash.start, C.satu_arah.start, 0.25, 0.25);
  if (a3 > 0) {
    world.save();
    world.globalAlpha = a3;
    K.micro(ui, 'FUNGSI KRIPTOGRAFI · SHA-256', 540, 155, { align: 'center', alpha: a3, color: P.ink2, size: 22 });
    K.headline(ui, t, C.hash.start + 0.05, ['Digiling jadi 64 karakter', '*sidik digital*.'], 540, 240, { size: 72, out: C.satu_arah.start - 0.1 });

    const u = clamp((t - C.hash.start - 0.35) / 1.4);
    const str = K.scramble('KopiSenja#99    ', u, t, 17, HASH_A.slice(0, 16));

    K.glass(world, 120, 560, 840, 170, { r: 40, haloRgb: R.violet, haloA: 0.5 });
    K.micro(world, u < 0.5 ? 'INPUT PASSWORD' : 'OUTPUT SIDIK HASH (256-BIT)', 540, 608, { align: 'center', size: 20, color: u < 0.5 ? P.ink2 : P.mint });
    K.label(world, str, 540, 668, { size: 48, weight: 700, font: K.FONT.mono, align: 'center', color: u > 0.5 ? '#C9C2FF' : P.ink });

    const p2 = K.sp(t, C.hash.start + 0.8, 0.6, 0.72);
    if (p2 > 0) {
      world.save();
      K.rise(world, 540, 930, p2);
      K.glass(world, 120, 810, 840, 220, { r: 36, haloRgb: R.blue, haloA: 0.35 });
      K.micro(world, 'DIGEST LENGKAP (64 HEX CHARS)', 540, 862, { align: 'center', size: 20, color: P.cyan });
      K.label(world, HASH_A, 540, 920, { size: 28, font: K.FONT.mono, align: 'center', color: P.ink });
      K.label(world, HASH_B, 540, 968, { size: 28, font: K.FONT.mono, align: 'center', color: P.ink2 });
      world.restore();
    }
    if (u > 0 && u < 1) K.sparks(world, 540, 650, t - C.hash.start - 0.35, { n: 28, rgb: R.violet, seed: 11 });
    world.restore();
  }

  // Shot 4: Satu Arah — One-way trapdoor function
  const a4 = env(t, C.satu_arah.start, C.salt.start, 0.25, 0.25);
  if (a4 > 0) {
    world.save();
    world.globalAlpha = a4;
    K.micro(ui, 'SIFAT MATEMATIKA · SATU ARAH (ONE-WAY)', 540, 155, { align: 'center', alpha: a4, color: P.ink2, size: 22 });
    K.headline(ui, t, C.satu_arah.start + 0.05, ['Mudah *maju*,', 'mustahil *dibalik*.'], 540, 240, { size: 78, out: C.salt.start - 0.1 });

    // Top card: Password -> Hash (Green/Mint forward trail)
    K.glass(world, 130, 540, 820, 200, { r: 36, haloRgb: R.mint, haloA: 0.4 });
    K.label(world, '"KopiSenja#99"', 300, 620, { size: 32, weight: 700, font: K.FONT.mono, align: 'center' });
    K.label(world, '→  0,001 dtk  →', 540, 620, { size: 28, weight: 700, color: P.mint, align: 'center' });
    K.label(world, 'e3b0c442...', 780, 620, { size: 32, weight: 700, font: K.FONT.mono, color: P.cyan, align: 'center' });
    K.label(world, 'ARAH MAJU: SANGAT CEPAT DIHITUNG', 540, 695, { size: 22, font: K.FONT.mono, color: P.mint, align: 'center' });

    // Bottom card: Hash -> Password (Blocked red/pink reverse)
    const p2 = K.sp(t, C.satu_arah.start + 0.6, 0.6, 0.72);
    world.save();
    K.rise(world, 540, 930, p2);
    K.glass(world, 130, 810, 820, 220, { r: 36, haloRgb: R.pink, haloA: 0.45 });
    K.label(world, 'e3b0c442...', 300, 895, { size: 32, weight: 700, font: K.FONT.mono, color: P.cyan, align: 'center' });
    K.label(world, '✕  TERKUNCI  ✕', 540, 895, { size: 30, weight: 700, color: P.pink, align: 'center' });
    K.label(world, '????????????', 780, 895, { size: 32, weight: 700, font: K.FONT.mono, color: P.ink3, align: 'center' });
    K.label(world, 'ARAH MUNDUR: TIDAK ADA RUMUS KEBALIKAN', 540, 975, { size: 22, font: K.FONT.mono, color: P.pink, align: 'center' });
    world.restore();
    world.restore();
  }

  // Shot 5: Salt — Adding unique random salt per user
  const a5 = env(t, C.salt.start, C.login.start, 0.25, 0.25);
  if (a5 > 0) {
    world.save();
    world.globalAlpha = a5;
    K.micro(ui, 'LAPISAN PELINDUNG · CRYPTOGRAPHIC SALT', 540, 155, { align: 'center', alpha: a5, color: P.ink2, size: 22 });
    K.headline(ui, t, C.salt.start + 0.05, ['Ditambah bumbu *Salt*', 'unik tiap akun.'], 540, 240, { size: 76, out: C.login.start - 0.1 });

    const p1 = K.sp(t, C.salt.start + 0.15, 0.55, 0.72);
    const p2 = K.sp(t, C.salt.start + 0.55, 0.55, 0.72);
    const p3 = K.sp(t, C.salt.start + 1.0, 0.6, 0.72);

    world.save();
    K.rise(world, 310, 620, p1);
    K.glass(world, 110, 545, 400, 150, { r: 32, haloRgb: R.blue, haloA: 0.35 });
    K.micro(world, 'PASSWORD', 310, 590, { align: 'center', size: 18, color: P.ink2 });
    K.label(world, 'KopiSenja#99', 310, 645, { size: 32, weight: 700, font: K.FONT.mono, align: 'center' });
    world.restore();

    K.label(world, '+', 540, 620, { size: 54, weight: 700, align: 'center', color: P.violet, alpha: p2 });

    world.save();
    K.rise(world, 770, 620, p2);
    K.glass(world, 570, 545, 400, 150, { r: 32, haloRgb: R.pink, haloA: 0.45 });
    K.micro(world, 'SALT ACAK UNIK', 770, 590, { align: 'center', size: 18, color: P.pink });
    K.label(world, '$9x!vQ2_mP', 770, 645, { size: 32, weight: 700, font: K.FONT.mono, align: 'center', color: P.pink });
    world.restore();

    if (p3 > 0) {
      world.save();
      K.rise(world, 540, 910, p3);
      K.glass(world, 110, 790, 860, 230, { r: 38, haloRgb: R.violet, haloA: 0.5 });
      K.padlock(world, 220, 905, 0.42, { open: 0, rgb: R.mint });
      K.micro(world, 'HASIL AKHIR ARGON2ID (KEBAL TABEL PELANGI)', 600, 855, { align: 'center', size: 20, color: P.mint });
      K.label(world, '$argon2id$v=19$9x!vQ2$a8f4c9120e7b...', 600, 925, { size: 28, weight: 700, font: K.FONT.mono, align: 'center', color: P.ink });
      world.restore();
    }
    world.restore();
  }

  // Shot 6: Login — Comparing two hashes on login
  const a6 = env(t, C.login.start, C.kebocoran.start, 0.25, 0.25);
  if (a6 > 0) {
    world.save();
    world.globalAlpha = a6;
    K.micro(ui, 'VERIFIKASI LOGIN · BANDINGKAN SIDIK', 540, 155, { align: 'center', alpha: a6, color: P.ink2, size: 22 });
    K.headline(ui, t, C.login.start + 0.05, ['Cukup cocokkan', '*dua sidik* hash.'], 540, 240, { size: 78, out: C.kebocoran.start - 0.1 });

    const match = clamp((t - C.login.start - 1.1) / 0.5);
    K.glass(world, 120, 530, 840, 160, { r: 34, haloRgb: R.blue, haloA: 0.35 });
    K.micro(world, 'SIDIK KETIKAN HARI INI', 180, 578, { size: 18, color: P.cyan });
    K.label(world, 'a8f4c9120e7b31d59c04...', 180, 635, { size: 34, weight: 700, font: K.FONT.mono });

    K.glass(world, 120, 730, 840, 160, { r: 34, haloRgb: R.violet, haloA: 0.35 });
    K.micro(world, 'SIDIK TERSIMPAN DI DATABASE', 180, 778, { size: 18, color: P.violet });
    K.label(world, 'a8f4c9120e7b31d59c04...', 180, 835, { size: 34, weight: 700, font: K.FONT.mono });

    if (match > 0) {
      world.save();
      K.rise(world, 540, 1020, match);
      K.glass(world, 240, 950, 600, 130, { r: 65, haloRgb: R.mint, haloA: 0.55 });
      K.ticks(world, 320, 1012, 2, { s: 44, color: P.mint, lw: 6, p: match });
      K.label(world, '100% COCOK · AKSES DIBERIKAN', 575, 1015, { size: 30, weight: 700, color: P.mint, align: 'center' });
      world.restore();
    }
    world.restore();
  }

  // Shot 7: Kebocoran — 10^60 brute force attempts
  const a7 = env(t, C.kebocoran.start, C.penutup.start, 0.25, 0.25);
  if (a7 > 0) {
    world.save();
    world.globalAlpha = a7;
    K.micro(ui, 'KETAHANAN BRUTE-FORCE · KOMBINATORIKA', 540, 155, { align: 'center', alpha: a7, color: P.ink2, size: 22 });
    K.headline(ui, t, C.kebocoran.start + 0.05, ['Butuh *10⁶⁰* tebakan', 'untuk membongkarnya.'], 540, 240, { size: 74, out: C.penutup.start - 0.1 });

    for (let i = 0; i < 9; i++) {
      const yy = 470 + i * 95 + ((t * 280) % 95);
      world.globalAlpha = a7 * (0.1 + 0.22 * Math.sin((i / 8) * Math.PI));
      K.label(world, K.cipher(Math.floor(t * 16) + i * 5, 28), 540, yy, { size: 28, font: K.FONT.mono, align: 'center', color: P.ink2 });
    }
    world.globalAlpha = a7;
    const exp = Math.round(K.count(t, C.kebocoran.start + 0.2, 1.6, 1, 60));
    const pop = K.sp(t, C.kebocoran.start + 0.1, 0.6, 0.65);
    world.save();
    K.rise(world, 540, 820, pop, { from: 0.72, dy: 0 });
    K.glow(world, 540, 720, 480, R.violet, 0.42);
    K.power(world, '10', String(exp), 540, 840, { size: 300, expColor: [P.violet, P.blue] });
    world.restore();

    K.glass(world, 170, 950, 740, 105, { r: 52, haloRgb: R.pink, haloA: 0.35 });
    K.label(world, 'Miliaran tahun komputasi untuk 1 password kuat', 540, 1002, { size: 28, weight: 700, align: 'center' });
    world.restore();
  }

  // Shot 8: Penutup — Reset password instead of sending old password
  const a8 = env(t, C.penutup.start, AM.duration, 0.25, 0.25);
  if (a8 > 0) {
    world.save();
    world.globalAlpha = a8;
    K.micro(ui, 'PRINSIP PRIVASI MODERN · ZERO-KNOWLEDGE', 540, 155, { align: 'center', alpha: a8, color: P.ink2, size: 22 });
    K.headline(ui, t, C.penutup.start + 0.05, ['Lupa *password*?', 'Buat baru, bukan dikirim.'], 540, 240, { size: 72 });

    const p = K.sp(t, C.penutup.start + 0.2, 0.65, 0.72);
    world.save();
    K.rise(world, 540, 820, p);
    K.glass(world, 140, 580, 800, 440, { r: 44, haloRgb: R.cyan, haloA: 0.45 });
    K.padlock(world, 540, 720, 0.52, { open: 0, rgb: R.cyan, glowA: 0.65 });
    K.label(world, 'Atur Ulang Kata Sandi Baru', 540, 880, { size: 40, weight: 700, align: 'center' });
    K.label(world, 'Rahasia akunmu tetap milikmu seorang', 540, 945, { size: 28, color: P.mint, font: K.FONT.mono, align: 'center' });
    world.restore();
    world.restore();
  }

  K.finish(ui, t, AM);
}

