// Maura Motion style kit: GACHA 3D (Toon Cel-Shaded 3D Mobile Game Summon & Reward Stage).
import { clamp, lerp, ease, hrand, mulberry32, TAU, mixHex, rgba } from '/engine/lib/core.js';
import { makeCanvas, cached, roundRect } from '/engine/lib/draw.js';

export const PAL = {
  bg0: '#160c2e',
  bg1: '#35185a',
  ink: '#190b2e',
  cap: '#ffd65e',
  ball: '#ff6f91',
  ball2: '#7af0b0',
  gold: '#ffcf4d',
  purple: '#c46bff',
  blue: '#4dc9ff',
  green: '#5ef2a5',
  white: '#ffffff',
};

export { clamp, lerp, ease, hrand, TAU, mixHex, rgba };

export function cam(ctx, x, y, z = 1, rot = 0, fy = 960) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(540, fy);
  ctx.rotate(rot);
  ctx.scale(z, z);
  ctx.translate(-x, -y);
}

export const pop = (t, t0, dur = 0.45) => (t < t0 ? 0 : ease.outBack(clamp((t - t0) / dur)));
export const pr = (t, a, b) => ease.inOutCubic(clamp((t - a) / Math.max(1e-6, b - a)));

export function bg(ctx, t = 0, { glowCol = '#ffcf4d' } = {}) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const c = cached('gacha-bg-v2', () => {
    const m = makeCanvas(54, 96), g = m.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 96);
    gr.addColorStop(0, '#120826');
    gr.addColorStop(0.55, '#2b134d');
    gr.addColorStop(1, '#180a30');
    g.fillStyle = gr;
    g.fillRect(0, 0, 54, 96);
    return m;
  });
  ctx.drawImage(c, 0, 0, 1080, 1920);

  // Rotating sunburst god-rays behind center stage
  ctx.save();
  ctx.translate(540, 620);
  ctx.rotate(t * 0.18);
  const rays = 18;
  for (let i = 0; i < rays; i++) {
    ctx.save();
    ctx.rotate((i / rays) * TAU);
    const rg = ctx.createLinearGradient(0, 0, 0, -900);
    rg.addColorStop(0, rgba(glowCol, 0.22));
    rg.addColorStop(0.6, rgba(glowCol, 0.05));
    rg.addColorStop(1, rgba(glowCol, 0));
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-55, -900);
    ctx.lineTo(55, -900);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  // Floating 4-point star sparkles
  const rng = mulberry32(64);
  for (let i = 0; i < 20; i++) {
    const sx = 70 + rng() * 940;
    const sy = (rng() * 1700 - t * (28 + (i % 4) * 10) + 3400) % 1700 + 80;
    const sr = (4 + (i % 3) * 3) * (0.65 + 0.35 * Math.sin(t * 3.5 + i));
    ctx.fillStyle = i % 3 === 0 ? glowCol : 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.moveTo(sx, sy - sr * 1.8);
    ctx.lineTo(sx + sr * 0.5, sy - sr * 0.5);
    ctx.lineTo(sx + sr * 1.8, sy);
    ctx.lineTo(sx + sr * 0.5, sy + sr * 0.5);
    ctx.lineTo(sx, sy + sr * 1.8);
    ctx.lineTo(sx - sr * 0.5, sy + sr * 0.5);
    ctx.lineTo(sx - sr * 1.8, sy);
    ctx.lineTo(sx - sr * 0.5, sy - sr * 0.5);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

export function title(ctx, str, x, y, { a = 1, size = 64, col = '#ffffff', maxW = 900 } = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.font = `900 ${size}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 10;
  ctx.strokeStyle = PAL.ink;
  ctx.strokeText(str, x, y, maxW);
  ctx.fillStyle = col;
  ctx.fillText(str, x, y, maxW);
  ctx.restore();
}

export function caption(ctx, str, x, y, { a = 1, size = 36, col = '#ffd65e', maxW = 900 } = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.font = `700 ${size}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 7;
  ctx.strokeStyle = PAL.ink;
  ctx.strokeText(str, x, y, maxW);
  ctx.fillStyle = col;
  ctx.fillText(str, x, y, maxW);
  ctx.restore();
}

export function gachaHeader(ctx, bannerTag, mainTitle, subTitle, { y = 185, a = 1, accent = PAL.gold, pityText = 'PITY 90/90 • SSR GUARANTEED' } = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const w = 900, h = 152, left = 540 - w / 2, top = y - h / 2;

  // Cel-shaded offset shadow
  ctx.fillStyle = PAL.ink;
  roundRect(ctx, left + 8, top + 10, w, h, 24);
  ctx.fill();

  // Banner body gradient
  const gr = ctx.createLinearGradient(left, top, left, top + h);
  gr.addColorStop(0, '#3e1e6d');
  gr.addColorStop(1, '#241042');
  ctx.fillStyle = gr;
  roundRect(ctx, left, top, w, h, 24);
  ctx.fill();

  // Thick cel outline & inner highlight
  ctx.strokeStyle = accent;
  ctx.lineWidth = 5;
  roundRect(ctx, left, top, w, h, 24);
  ctx.stroke();

  // Top banner tag pill & pity counter
  ctx.fillStyle = accent;
  roundRect(ctx, left + 28, top - 18, 360, 34, 17);
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 4;
  roundRect(ctx, left + 28, top - 18, 360, 34, 17);
  ctx.stroke();
  ctx.fillStyle = PAL.ink;
  ctx.font = '900 18px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(bannerTag, left + 208, top - 1, 330);

  if (pityText) {
    ctx.fillStyle = '#190b2e';
    roundRect(ctx, left + w - 340, top - 18, 312, 34, 17);
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    roundRect(ctx, left + w - 340, top - 18, 312, 34, 17);
    ctx.stroke();
    ctx.fillStyle = accent;
    ctx.font = '800 17px system-ui, sans-serif';
    ctx.fillText(pityText, left + w - 184, top - 1, 290);
  }

  // Main title & subtitle
  ctx.font = '900 40px system-ui, sans-serif';
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 8;
  ctx.strokeText(mainTitle, 540, top + 60, w - 56);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(mainTitle, 540, top + 60, w - 56);

  if (subTitle) {
    ctx.fillStyle = accent;
    ctx.font = '700 24px system-ui, sans-serif';
    ctx.fillText(subTitle, 540, top + 112, w - 64);
  }
  ctx.restore();
}

export function machine(ctx, x, y, s, { t = 0, glowA = 1, label = 'GACHA NUSANTARA' } = {}) {
  ctx.save();
  ctx.translate(x, y);
  const w = 420 * s, h = 520 * s;

  // Hard toon shadow
  ctx.fillStyle = PAL.ink;
  roundRect(ctx, -w / 2 + 12 * s, -h / 2 + 16 * s, w, h, 56 * s);
  ctx.fill();

  // Machine body
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, '#ff5e8e');
  g.addColorStop(1, '#7c3aed');
  ctx.fillStyle = g;
  roundRect(ctx, -w / 2, -h / 2, w, h, 56 * s);
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 8 * s;
  roundRect(ctx, -w / 2, -h / 2, w, h, 56 * s);
  ctx.stroke();

  // Glass globe window
  ctx.fillStyle = '#1b0c36';
  roundRect(ctx, -w / 2 + 28 * s, -h / 2 + 32 * s, w - 56 * s, h * 0.48, 36 * s);
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 6 * s;
  roundRect(ctx, -w / 2 + 28 * s, -h / 2 + 32 * s, w - 56 * s, h * 0.48, 36 * s);
  ctx.stroke();

  // Bouncing capsules inside glass window
  const cols = [PAL.blue, PAL.purple, PAL.gold, PAL.green, PAL.ball];
  for (let i = 0; i < 9; i++) {
    const bx = -w / 2 + 86 * s + (i % 3) * 124 * s;
    const by = -h / 2 + 95 * s + Math.floor(i / 3) * 68 * s + Math.sin(t * 3.5 + i * 1.3) * 7 * s;
    const col = cols[i % cols.length];
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(bx, by, 30 * s, 0, TAU); ctx.fill();
    ctx.strokeStyle = PAL.ink; ctx.lineWidth = 4 * s; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.beginPath(); ctx.arc(bx - 9 * s, by - 10 * s, 8 * s, 0, TAU); ctx.fill();
  }

  // Glossy window highlight arc
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  roundRect(ctx, -w / 2 + 40 * s, -h / 2 + 42 * s, (w - 80 * s) * 0.45, h * 0.42, 24 * s);
  ctx.fill();

  // Rotary crank dial
  const dy = h * 0.16;
  ctx.fillStyle = PAL.ink;
  ctx.beginPath(); ctx.arc(0, dy, 54 * s, 0, TAU); ctx.fill();
  ctx.fillStyle = PAL.gold;
  ctx.beginPath(); ctx.arc(0, dy, 42 * s, 0, TAU); ctx.fill();
  ctx.save();
  ctx.translate(0, dy);
  ctx.rotate(t * 1.8);
  ctx.fillStyle = PAL.ink;
  roundRect(ctx, -32 * s, -10 * s, 64 * s, 20 * s, 10 * s);
  ctx.fill();
  ctx.restore();

  // Dispenser chute & label
  ctx.fillStyle = '#1b0c36';
  roundRect(ctx, -95 * s, h * 0.31, 190 * s, 62 * s, 18 * s);
  ctx.fill();
  ctx.strokeStyle = PAL.gold;
  ctx.lineWidth = 3 * s;
  roundRect(ctx, -95 * s, h * 0.31, 190 * s, 62 * s, 18 * s);
  ctx.stroke();

  ctx.fillStyle = PAL.gold;
  ctx.font = `900 ${Math.round(20 * s)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 0, h * 0.31 + 31 * s);
  ctx.restore();
}

export function capsule(ctx, x, y, r, col, { open = 0, t = 0, label = '', stars = 0 } = {}) {
  ctx.save();
  ctx.translate(x, y + Math.sin(t * 3.2) * 8);
  ctx.rotate(Math.sin(t * 2.2) * 0.06);

  // Outer aura glow
  const gr = ctx.createRadialGradient(0, 0, r * 0.4, 0, 0, r * 1.55);
  gr.addColorStop(0, rgba(col, 0.55));
  gr.addColorStop(1, rgba(col, 0));
  ctx.fillStyle = gr;
  ctx.beginPath(); ctx.arc(0, 0, r * 1.55, 0, TAU); ctx.fill();

  const sep = open * r * 0.38;

  // Bottom half (cream/white shell)
  ctx.save();
  ctx.translate(0, sep);
  ctx.fillStyle = '#f7f3ff';
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 7; ctx.stroke();
  ctx.restore();

  // Light burst inside when opening
  if (open > 0.02) {
    const bg = ctx.createRadialGradient(0, 0, 4, 0, 0, r * (0.9 + open * 0.6));
    bg.addColorStop(0, '#ffffff');
    bg.addColorStop(0.5, col);
    bg.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = bg;
    ctx.beginPath(); ctx.arc(0, 0, r * (0.9 + open * 0.6), 0, TAU); ctx.fill();
  }

  // Top half (colored dome)
  ctx.save();
  ctx.translate(0, -sep);
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(0, 0, r, Math.PI, TAU); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 7; ctx.stroke();

  // Specular toon highlight
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.36, -r * 0.42, r * 0.24, r * 0.13, -0.55, 0, TAU);
  ctx.fill();

  // Center metallic belt & button
  ctx.fillStyle = PAL.gold;
  roundRect(ctx, -r * 1.02, -12, r * 2.04, 24, 12);
  ctx.fill();
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 5;
  roundRect(ctx, -r * 1.02, -12, r * 2.04, 24, 12);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(0, 0, r * 0.22, 0, TAU); ctx.fill();
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 5; ctx.stroke();
  ctx.restore();

  if (stars > 0) {
    ctx.fillStyle = PAL.gold;
    ctx.font = `900 ${Math.round(r * 0.34)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.strokeStyle = PAL.ink; ctx.lineWidth = 6;
    const sStr = '★'.repeat(stars);
    ctx.strokeText(sStr, 0, r + sep + 34);
    ctx.fillText(sStr, 0, r + sep + 34);
  }
  if (label) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 22px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.strokeStyle = PAL.ink; ctx.lineWidth = 5;
    const ly = r + sep + (stars > 0 ? 68 : 38);
    ctx.strokeText(label, 0, ly, r * 2.6);
    ctx.fillText(label, 0, ly, r * 2.6);
  }
  ctx.restore();
}

export function mascot(ctx, x, y, r, col, { t = 0, eye = 1, kind = 'tarsius' } = {}) {
  const b = Math.sin(t * 4) * r * 0.05;
  ctx.save();
  ctx.translate(x, y + b);

  // Outer cel-shaded medallion disc
  ctx.fillStyle = PAL.ink;
  ctx.beginPath(); ctx.arc(4, 6, r, 0, TAU); ctx.fill();
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 6;
  ctx.stroke();

  if (kind === 'badak') {
    // Javan Rhino silhouette & iconic single horn
    ctx.fillStyle = '#5c6478';
    ctx.beginPath(); ctx.arc(0, r * 0.08, r * 0.62, 0, TAU); ctx.fill();
    ctx.strokeStyle = PAL.ink; ctx.lineWidth = 5; ctx.stroke();
    // Single golden horn
    ctx.fillStyle = PAL.gold;
    ctx.beginPath();
    ctx.moveTo(-r * 0.18, -r * 0.1);
    ctx.quadraticCurveTo(0, -r * 0.85, r * 0.18, -r * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (kind === 'komodo') {
    // Komodo dragon head + forked yellow tongue
    ctx.fillStyle = '#437a49';
    roundRect(ctx, -r * 0.58, -r * 0.38, r * 1.16, r * 0.76, r * 0.28);
    ctx.fill();
    ctx.strokeStyle = PAL.ink; ctx.lineWidth = 5; ctx.stroke();
    ctx.strokeStyle = '#ff4d6d'; ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, r * 0.38); ctx.lineTo(0, r * 0.68);
    ctx.lineTo(-r * 0.14, r * 0.82);
    ctx.moveTo(0, r * 0.68); ctx.lineTo(r * 0.14, r * 0.82);
    ctx.stroke();
  } else if (kind === 'keris') {
    // Wavy 7-luk Keris blade in golden glow
    ctx.strokeStyle = PAL.gold;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = -5; i <= 5; i++) {
      const py = i * (r * 0.11);
      const px = Math.sin(i * 1.3) * (r * 0.16) * (1 - Math.abs(i) / 7);
      i === -5 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  // Big expressive toon eyes (giant for Tarsius)
  const eyeScale = kind === 'tarsius' ? 1.45 : 1.0;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-r * 0.3, -r * 0.06, r * 0.18 * eye * eyeScale, 0, TAU);
  ctx.arc(r * 0.3, -r * 0.06, r * 0.18 * eye * eyeScale, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 4; ctx.stroke();

  ctx.fillStyle = PAL.ink;
  ctx.beginPath();
  ctx.arc(-r * 0.3, -r * 0.06, r * 0.08 * eyeScale, 0, TAU);
  ctx.arc(r * 0.3, -r * 0.06, r * 0.08 * eyeScale, 0, TAU);
  ctx.fill();

  // Eye sparkles
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-r * 0.34, -r * 0.12, r * 0.035 * eyeScale, 0, TAU);
  ctx.arc(r * 0.26, -r * 0.12, r * 0.035 * eyeScale, 0, TAU);
  ctx.fill();
  ctx.restore();
}

export function gachaRevealCard(ctx, x, y, w, h, {
  t = 0, a = 1, rarity = 'SSR • LEGENDARY', stars = 5, col = PAL.gold,
  name = 'BADAK JAWA', sub = 'Rhinoceros sondaicus • Ujung Kulon',
  kind = 'badak', stats = [],
} = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const left = x - w / 2, top = y - h / 2;

  // Outer aura & hard shadow
  ctx.fillStyle = PAL.ink;
  roundRect(ctx, left + 10, top + 12, w, h, 28);
  ctx.fill();

  const gr = ctx.createLinearGradient(left, top, left, top + h);
  gr.addColorStop(0, '#2f1654');
  gr.addColorStop(1, '#180a2e');
  ctx.fillStyle = gr;
  roundRect(ctx, left, top, w, h, 28);
  ctx.fill();

  ctx.strokeStyle = col;
  ctx.lineWidth = 6;
  roundRect(ctx, left, top, w, h, 28);
  ctx.stroke();

  // Top rarity ribbon
  ctx.fillStyle = col;
  roundRect(ctx, left + 22, top + 18, w - 44, 48, 14);
  ctx.fill();
  ctx.fillStyle = PAL.ink;
  ctx.font = '900 22px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(rarity, left + 42, top + 42);

  ctx.textAlign = 'right';
  ctx.font = '900 24px system-ui, sans-serif';
  ctx.fillText('★'.repeat(stars), left + w - 42, top + 42);

  // Left: Toon Mascot Emblem with rotating halo
  const mx = left + 150, my = top + 185;
  ctx.save();
  ctx.translate(mx, my);
  ctx.rotate(t * 0.8);
  ctx.strokeStyle = rgba(col, 0.45);
  ctx.lineWidth = 3;
  ctx.setLineDash([12, 10]);
  ctx.beginPath(); ctx.arc(0, 0, 96, 0, TAU); ctx.stroke();
  ctx.restore();

  mascot(ctx, mx, my, 78, col, { t, kind });

  // Right: Character / Item Title & Subtitle
  const tx = left + 275, maxTW = w - 305;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 36px system-ui, sans-serif';
  ctx.fillText(name, tx, top + 115, maxTW);

  ctx.fillStyle = col;
  ctx.font = '700 21px system-ui, sans-serif';
  ctx.fillText(sub, tx, top + 152, maxTW);

  // RPG Stat Bars
  stats.forEach((st, i) => {
    const sy = top + 195 + i * 52;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '700 18px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(st.label, tx, sy);

    ctx.fillStyle = col;
    ctx.font = '800 18px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(st.val, left + w - 34, sy);

    // Bar track
    const bx = tx, by = sy + 12, bw = maxTW, bh = 14;
    ctx.fillStyle = '#120724';
    roundRect(ctx, bx, by, bw, bh, 7);
    ctx.fill();
    ctx.fillStyle = st.col || col;
    roundRect(ctx, bx, by, bw * clamp(st.pct, 0.08, 1), bh, 7);
    ctx.fill();
  });

  ctx.restore();
}

export function gachaInfoCard(ctx, x, y, w, h, { tag = '', titleStr = '', subStr = '', stat = '', statSub = '', col = PAL.gold, a = 1 } = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const left = x - w / 2, top = y - h / 2;

  ctx.fillStyle = PAL.ink;
  roundRect(ctx, left + 8, top + 10, w, h, 20);
  ctx.fill();

  ctx.fillStyle = '#251142';
  roundRect(ctx, left, top, w, h, 20);
  ctx.fill();
  ctx.strokeStyle = col;
  ctx.lineWidth = 4;
  roundRect(ctx, left, top, w, h, 20);
  ctx.stroke();

  const textLeft = left + 30;
  const maxTW = stat ? w - 265 : w - 60;

  if (tag) {
    ctx.fillStyle = col;
    ctx.font = '900 18px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(tag, textLeft, top + 34, maxTW);
  }
  if (titleStr) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 28px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(titleStr, textLeft, top + (tag ? 74 : 52), maxTW);
  }
  if (subStr) {
    ctx.fillStyle = 'rgba(255,255,255,0.78)';
    ctx.font = '600 21px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(subStr, textLeft, top + h - 34, maxTW);
  }

  if (stat) {
    const sx = left + w - 120;
    ctx.fillStyle = '#150829';
    roundRect(ctx, sx - 92, top + 16, 184, h - 32, 14);
    ctx.fill();
    ctx.strokeStyle = col;
    ctx.lineWidth = 3;
    roundRect(ctx, sx - 92, top + 16, 184, h - 32, 14);
    ctx.stroke();

    ctx.fillStyle = col;
    ctx.font = '900 34px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(stat, sx, top + h * 0.44, 168);
    if (statSub) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 16px system-ui, sans-serif';
      ctx.fillText(statSub, sx, top + h * 0.76, 168);
    }
  }
  ctx.restore();
}
