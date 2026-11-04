// Maura Motion style kit: 3D METALLIC / CHROME / Y2K (Liquid Chrome, Molten Gold & Y2K Studio)
const { clamp, lerp, ease, TAU } = AM.lib;

export const PAL = {
  bgTop: '#04050A',
  bgMid: '#0A0D1A',
  bgBot: '#05060C',
  cyan: '#4CF2FF',
  magenta: '#FF4FD8',
  goldHi: '#FFF8D6',
  goldMid: '#F5B932',
  goldDark: '#6B4206',
  chromeHi: '#FFFFFF',
  chromeSky: '#B8D4FF',
  chromeHorizon: '#181E30',
  chromeBounce: '#9A88FF',
  titaniumMid: '#94A2B8',
  ink: '#F5F7FF',
  muted: '#94A0B8',
};

export const FONT = {
  display: "'Syne', 'Space Grotesk', 'Inter', sans-serif",
  sans: "'Space Grotesk', 'Plus Jakarta Sans', sans-serif",
  mono: "'JetBrains Mono', monospace",
};

/** Create a metallic chrome/gold/titanium linear gradient with animated specular shift. */
export function makeMetallicGradient(ctx, x0, y0, x1, y1, metal = 'chrome', t = 0) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  const shift = (Math.sin(t * 1.8) * 0.08);
  if (metal === 'gold') {
    g.addColorStop(0, '#FFFBE6');
    g.addColorStop(clamp(0.24 + shift, 0.08, 0.42), '#FFD65A');
    g.addColorStop(clamp(0.48 + shift, 0.3, 0.65), '#5E3804');
    g.addColorStop(clamp(0.54 + shift, 0.36, 0.72), '#FFF4B8');
    g.addColorStop(0.82, '#C88412');
    g.addColorStop(1, '#3B2103');
  } else if (metal === 'titanium') {
    g.addColorStop(0, '#F1F5F9');
    g.addColorStop(clamp(0.28 + shift, 0.1, 0.45), '#94A3B8');
    g.addColorStop(clamp(0.5 + shift, 0.32, 0.68), '#1E293B');
    g.addColorStop(clamp(0.57 + shift, 0.38, 0.75), '#E2E8F0');
    g.addColorStop(0.85, '#64748B');
    g.addColorStop(1, '#0F172A');
  } else {
    // Liquid Y2K Chrome
    g.addColorStop(0, '#FFFFFF');
    g.addColorStop(clamp(0.25 + shift, 0.08, 0.42), '#BAE6FD');
    g.addColorStop(clamp(0.48 + shift, 0.3, 0.65), '#111827');
    g.addColorStop(clamp(0.54 + shift, 0.36, 0.72), '#FFFFFF');
    g.addColorStop(0.8, '#C4B5FD');
    g.addColorStop(1, '#1E1B4B');
  }
  return g;
}

/** Draw 4-point Y2K metallic starflare sparkle. */
export function drawStarflare(ctx, x, y, r, color = '#FFFFFF', rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    const aMid = a + Math.PI / 4;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    ctx.lineTo(Math.cos(aMid) * (r * 0.16), Math.sin(aMid) * (r * 0.16));
  }
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, 0, r * 0.22, 0, TAU);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.restore();
}

/** Draw dark obsidian Y2K studio stage with perspective horizon grid, orbital rings, and HUD frame. */
export function drawChromeStage(ctx, t, { tag = 'Y2K CHROME STUDIO', code = 'MTL // 2000', step = 1, total = 8, accent = PAL.cyan } = {}) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // Obsidian studio backdrop
  const bg = ctx.createLinearGradient(0, 0, 0, 1920);
  bg.addColorStop(0, PAL.bgTop);
  bg.addColorStop(0.55, PAL.bgMid);
  bg.addColorStop(1, PAL.bgBot);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1080, 1920);

  // Ambient studio glow behind stage
  const glow = ctx.createRadialGradient(540, 820, 40, 540, 820, 520);
  glow.addColorStop(0, 'rgba(76, 242, 255, 0.16)');
  glow.addColorStop(0.5, 'rgba(154, 136, 255, 0.08)');
  glow.addColorStop(1, 'rgba(5, 6, 12, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 260, 1080, 1120);

  // Y2K Perspective Floor Grid (below y = 1180)
  const horizonY = 1160;
  ctx.save();
  ctx.strokeStyle = 'rgba(76, 242, 255, 0.18)';
  ctx.lineWidth = 1.5;
  for (let i = -8; i <= 8; i++) {
    ctx.beginPath();
    ctx.moveTo(540 + i * 38, horizonY);
    ctx.lineTo(540 + i * 195, 1920);
    ctx.stroke();
  }
  const scroll = (t * 0.35) % 1;
  for (let j = 0; j < 8; j++) {
    const u = Math.pow((j + scroll) / 8, 1.7);
    const yy = lerp(horizonY, 1880, u);
    ctx.strokeStyle = `rgba(76, 242, 255, ${(0.06 + u * 0.2).toFixed(3)})`;
    ctx.beginPath();
    ctx.moveTo(0, yy);
    ctx.lineTo(1080, yy);
    ctx.stroke();
  }
  ctx.restore();

  // Top Y2K Chrome Pill Header
  ctx.strokeStyle = 'rgba(255,255,255,0.28)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(64, 72, 952, 58, 29);
  ctx.fillStyle = 'rgba(15, 20, 38, 0.78)';
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = accent;
  ctx.font = `700 20px ${FONT.mono}`;
  ctx.letterSpacing = '2px';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`✦ ${tag.toUpperCase()}`, 94, 101);

  ctx.fillStyle = PAL.ink;
  ctx.textAlign = 'right';
  ctx.fillText(`${code}  ·  0${step}/0${total}`, 986, 101);

  ctx.restore();
}

/** Draw extruded 3D metallic chrome/gold headline with starflares. */
export function drawChromeHeader(ctx, kicker, lines, sub, t = 0, p = 1, metal = 'chrome') {
  const k = ease.outCubic(clamp(p));
  ctx.save();
  ctx.globalAlpha = k;
  ctx.translate(0, (1 - k) * 26);

  // Kicker badge
  ctx.fillStyle = metal === 'gold' ? PAL.goldMid : PAL.cyan;
  ctx.font = `700 22px ${FONT.mono}`;
  ctx.letterSpacing = '3px';
  ctx.textAlign = 'center';
  ctx.fillText(kicker.toUpperCase(), 540, 186);

  // Extruded 3D Metallic Headline lines
  const size = 66;
  const lh = 76;
  lines.forEach((line, i) => {
    const by = 262 + i * lh;
    ctx.font = `800 ${size}px ${FONT.display}`;
    ctx.letterSpacing = '-1px';
    ctx.textAlign = 'center';

    // 3D dark metallic extrusion layers
    for (let d = 6; d >= 1; d--) {
      ctx.fillStyle = d > 3 ? '#090D18' : '#26324D';
      ctx.fillText(line, 540 + d * 1.2, by + d * 1.8);
    }

    // Specular metallic gradient face
    ctx.fillStyle = makeMetallicGradient(ctx, 200, by - 58, 880, by + 16, metal, t + i * 0.4);
    ctx.fillText(line, 540, by);

    // Crisp rim stroke
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 1.2;
    ctx.strokeText(line, 540, by);
  });

  const subY = 262 + lines.length * lh + 10;
  if (sub) {
    ctx.fillStyle = PAL.muted;
    ctx.font = `500 27px ${FONT.sans}`;
    ctx.letterSpacing = '0px';
    ctx.textAlign = 'center';
    ctx.fillText(sub, 540, subY);
  }

  // Animated 4-point starflare on headline corner
  drawStarflare(ctx, 890, 235, 22 + Math.sin(t * 4) * 5, '#FFFFFF', t * 0.8);
  drawStarflare(ctx, 190, 295, 16 + Math.cos(t * 3.5) * 4, metal === 'gold' ? PAL.goldMid : PAL.cyan, -t * 0.6);

  ctx.restore();
}

/** Draw Y2K Chrome / Gold Spec Cards at the bottom of the stage. */
export function drawChromeSpecs(ctx, specs, y = 1230, t = 0, p = 1, metal = 'chrome') {
  const k = ease.outCubic(clamp(p));
  ctx.save();
  ctx.globalAlpha = k;
  const n = specs.length;
  const gap = 22;
  const totalW = 952;
  const cw = (totalW - gap * (n - 1)) / n;

  specs.forEach((sp, i) => {
    const sx = 64 + i * (cw + gap);
    const ck = ease.outBack(clamp(p * 1.3 - i * 0.12));
    ctx.save();
    ctx.translate(0, (1 - ck) * 32);
    ctx.globalAlpha = ck;

    // Metallic bevel frame
    ctx.beginPath();
    ctx.roundRect(sx, y, cw, 220, 24);
    ctx.fillStyle = 'rgba(11, 15, 28, 0.86)';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = makeMetallicGradient(ctx, sx, y, sx + cw, y + 220, metal, t + i);
    ctx.stroke();

    // Top chrome bar accent
    ctx.fillStyle = makeMetallicGradient(ctx, sx + 20, y + 18, sx + cw - 20, y + 32, metal, t);
    ctx.beginPath();
    ctx.roundRect(sx + 20, y + 18, cw - 40, 8, 4);
    ctx.fill();

    // Big value
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `800 40px ${FONT.display}`;
    ctx.textAlign = 'left';
    ctx.fillText(sp.value, sx + 22, y + 88);

    // Label
    ctx.fillStyle = metal === 'gold' ? PAL.goldMid : PAL.cyan;
    ctx.font = `700 20px ${FONT.mono}`;
    ctx.fillText(sp.label.toUpperCase(), sx + 22, y + 132);

    // Sub note
    ctx.fillStyle = PAL.muted;
    ctx.font = `500 21px ${FONT.sans}`;
    ctx.fillText(sp.sub, sx + 22, y + 174);

    ctx.restore();
  });
  ctx.restore();
}

/**
 * Draw rotating 3D/2.5D Metallic Hero Object on turntable:
 * - 'kilonova': colliding binary neutron stars forging molten gold waves
 * - 'gold-chip': smartphone processor chip with 24K gold bonding wires & molten gold sphere
 * - 'y2k-blob': Y2K liquid chrome metaball + orbital CD/MP3 rings
 * - 'titanium-jet': titanium crystal lattice & aerospace SR-71 delta hull / smartphone frame
 */
export function drawMetallicHero(ctx, cx, cy, kind, t = 0, p = 1) {
  const k = ease.outBack(clamp(p));
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(k, k);

  // Turntable chrome pedestal ring below hero
  ctx.save();
  ctx.translate(0, 250);
  ctx.beginPath();
  ctx.ellipse(0, 0, 310, 56, 0, 0, TAU);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = makeMetallicGradient(ctx, -310, -56, 310, 56, kind.includes('gold') || kind === 'kilonova' ? 'gold' : 'chrome', t);
  ctx.stroke();
  ctx.restore();

  if (kind === 'kilonova') {
    // Spiral gravitational wave rings + two orbiting neutron stars + molten gold droplets
    for (let r = 3; r >= 1; r--) {
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 92, r * 48, Math.sin(t * 0.6) * 0.25, 0, TAU);
      ctx.strokeStyle = r === 1 ? PAL.goldHi : 'rgba(245, 185, 50, 0.45)';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    const ang = t * 1.8;
    const dist = 105;
    for (const dir of [-1, 1]) {
      const sx = Math.cos(ang) * dist * dir;
      const sy = Math.sin(ang) * (dist * 0.48) * dir;
      ctx.beginPath();
      ctx.arc(sx, sy, 68, 0, TAU);
      ctx.fillStyle = makeMetallicGradient(ctx, sx - 68, sy - 68, sx + 68, sy + 68, dir === 1 ? 'gold' : 'chrome', t);
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();
      drawStarflare(ctx, sx - 22, sy - 24, 24, '#FFFFFF', t);
    }
    // Central Au-79 atomic core badge
    ctx.beginPath();
    ctx.arc(0, 0, 48, 0, TAU);
    ctx.fillStyle = makeMetallicGradient(ctx, -48, -48, 48, 48, 'gold', t * 1.5);
    ctx.fill();
    ctx.fillStyle = '#1A1002';
    ctx.font = `800 32px ${FONT.mono}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('79 Au', 0, 2);
  } else if (kind === 'gold-chip') {
    // Smartphone CPU package with gleaming 24K gold bonding wires and floating gold nugget
    ctx.fillStyle = '#0B1220';
    ctx.strokeStyle = makeMetallicGradient(ctx, -220, -180, 220, 180, 'chrome', t);
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(-220, -165, 440, 330, 28);
    ctx.fill();
    ctx.stroke();

    // Gold contact pins & bonding wires radiating from center die
    ctx.strokeStyle = makeMetallicGradient(ctx, -190, -140, 190, 140, 'gold', t);
    ctx.lineWidth = 3.5;
    for (let i = -4; i <= 4; i++) {
      const pOff = i * 36;
      ctx.beginPath();
      ctx.moveTo(pOff, -85);
      ctx.lineTo(pOff * 1.2, -165);
      ctx.moveTo(pOff, 85);
      ctx.lineTo(pOff * 1.2, 165);
      ctx.moveTo(-105, pOff * 0.7);
      ctx.lineTo(-220, pOff * 0.9);
      ctx.moveTo(105, pOff * 0.7);
      ctx.lineTo(220, pOff * 0.9);
      ctx.stroke();
    }

    // Central molten 24K Gold Core
    ctx.beginPath();
    ctx.roundRect(-110, -90, 220, 180, 22);
    ctx.fillStyle = makeMetallicGradient(ctx, -110, -90, 110, 90, 'gold', t);
    ctx.fill();
    ctx.strokeStyle = '#FFFBE6';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#1E1202';
    ctx.font = `800 34px ${FONT.mono}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('0.034g Au', 0, -12);
    ctx.font = `700 20px ${FONT.mono}`;
    ctx.fillText('24K BOND WIRE', 0, 28);

    drawStarflare(ctx, 92, -74, 28, '#FFFBE6', t);
  } else if (kind === 'y2k-blob') {
    // Iconic Y2K Orbital Chrome Gyroscope + Liquid Mercury Metaball
    ctx.save();
    ctx.rotate(Math.sin(t * 0.9) * 0.25);
    ctx.beginPath();
    ctx.ellipse(0, 0, 285, 95, -0.38, 0, TAU);
    ctx.lineWidth = 14;
    ctx.strokeStyle = makeMetallicGradient(ctx, -285, -95, 285, 95, 'chrome', t);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, 0, 255, 85, 0.48, 0, TAU);
    ctx.lineWidth = 10;
    ctx.strokeStyle = makeMetallicGradient(ctx, -255, -85, 255, 85, 'chrome', t + 1.2);
    ctx.stroke();
    ctx.restore();

    // Central liquid chrome sphere + orbiting droplets
    ctx.beginPath();
    ctx.arc(0, 0, 118, 0, TAU);
    ctx.fillStyle = makeMetallicGradient(ctx, -118, -118, 118, 118, 'chrome', t);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    for (let i = 0; i < 4; i++) {
      const a = t * 1.4 + (i * TAU) / 4;
      const bx = Math.cos(a) * 185;
      const by = Math.sin(a) * 110;
      ctx.beginPath();
      ctx.arc(bx, by, 32, 0, TAU);
      ctx.fillStyle = makeMetallicGradient(ctx, bx - 32, by - 32, bx + 32, by + 32, 'chrome', t + i);
      ctx.fill();
      drawStarflare(ctx, bx - 10, by - 10, 16, '#FFFFFF', t);
    }
    drawStarflare(ctx, -45, -48, 34, '#FFFFFF', t * 0.7);
  } else if (kind === 'titanium-jet') {
    // Brushed Grade-5 Titanium (Ti-6Al-4V) hexagonal shield + supersonic delta silhouette
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * TAU) / 6 - Math.PI / 2;
      const rx = Math.cos(a) * 195;
      const ry = Math.sin(a) * 195;
      if (i === 0) ctx.moveTo(rx, ry);
      else ctx.lineTo(rx, ry);
    }
    ctx.closePath();
    ctx.fillStyle = makeMetallicGradient(ctx, -195, -195, 195, 195, 'titanium', t);
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#F8FAFC';
    ctx.stroke();

    // Inner supersonic delta wing / precision titanium frame
    ctx.beginPath();
    ctx.moveTo(0, -125);
    ctx.lineTo(115, 95);
    ctx.lineTo(0, 52);
    ctx.lineTo(-115, 95);
    ctx.closePath();
    ctx.fillStyle = '#0F172A';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = PAL.cyan;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `800 32px ${FONT.mono}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('22 Ti', 0, 12);
    drawStarflare(ctx, 0, -125, 28, '#FFFFFF', t);
  }

  ctx.restore();
}

