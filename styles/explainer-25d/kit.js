/**
 * Modern Explainer 2.5D (Style No. 84) — Core Visual Kit
 * Pure Canvas2D 3D Perspective Projection Engine (Zero External Dependencies)
 * Canvas: 1080x1920 (9:16 vertical full screen)
 */

export const PAL = {
  bgDark: '#080c14',
  bgStudio: '#0f172a',
  bgRadial: '#1e293b',
  gridLine: 'rgba(56, 189, 248, 0.14)',
  gridGlow: 'rgba(14, 165, 233, 0.28)',
  cyan: '#06b6d4',
  cyanGlow: '#22d3ee',
  blue: '#3b82f6',
  indigo: '#6366f1',
  purple: '#8b5cf6',
  amber: '#f59e0b',
  emerald: '#10b981',
  rose: '#f43f5e',
  glassBg: 'rgba(15, 23, 42, 0.78)',
  glassBorder: 'rgba(255, 255, 255, 0.18)',
  glassBorderHighlight: 'rgba(56, 189, 248, 0.75)',
  ink: '#f8fafc',
  inkMuted: '#94a3b8',
  inkSub: '#64748b',
  cardDark: 'rgba(15, 23, 42, 0.92)'
};

/**
 * Creates camera object with default portrait 2.5D settings
 */
export function createCamera(overrides = {}) {
  return {
    x: 0,
    y: -220,
    z: -700,
    pitch: 0.36, // radians looking down ~20.6 degrees
    yaw: 0,
    roll: 0,
    fov: 960,
    cx: 540,
    cy: 720,
    ...overrides
  };
}

/**
 * Projects 3D world coordinate (wx, wy, wz) into 2D screen coordinate (x, y, scale)
 */
export function project3D(wx, wy, wz, cam) {
  // 1. Translation relative to camera
  const dx = wx - cam.x;
  const dy = wy - cam.y;
  const dz = wz - cam.z;

  // 2. Yaw rotation (Y-axis)
  const cyaw = Math.cos(cam.yaw);
  const syaw = Math.sin(cam.yaw);
  const rx = dx * cyaw - dz * syaw;
  const rz = dx * syaw + dz * cyaw;
  const ry = dy;

  // 3. Pitch rotation (X-axis)
  const cpitch = Math.cos(cam.pitch);
  const spitch = Math.sin(cam.pitch);
  const py = ry * cpitch - rz * spitch;
  const pz = ry * spitch + rz * cpitch;

  // Check near plane
  if (pz <= 20) {
    return { x: 0, y: 0, scale: 0, pz, visible: false };
  }

  // 4. Perspective projection
  const scale = cam.fov / pz;
  const sx = cam.cx + rx * scale;
  const sy = cam.cy + py * scale;

  return {
    x: sx,
    y: sy,
    scale,
    pz,
    visible: true
  };
}

/**
 * Renders dark studio background with radial gradient and horizon fog
 */
export function studioBg(ctx, { width = 1080, height = 1920, t = 0 } = {}) {
  // Deep space-grey radial gradient
  const grad = ctx.createRadialGradient(
    width / 2, height * 0.38, 50,
    width / 2, height * 0.5, height * 0.85
  );
  grad.addColorStop(0, '#1e293b');
  grad.addColorStop(0.45, '#0f172a');
  grad.addColorStop(1, '#060911');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Subtle floating ambient dust particles
  ctx.save();
  ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
  for (let i = 0; i < 28; i++) {
    const px = (i * 97 + Math.sin(t * 0.4 + i) * 80) % width;
    const py = (i * 131 + Math.cos(t * 0.3 + i * 2) * 120 + 200) % (height * 0.7);
    const pr = ((i % 3) + 1) * 1.2;
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * 2.5D Perspective Grid Plane stretching towards horizon
 */
export function perspectiveGrid(ctx, cam, opts = {}) {
  const {
    floorY = 160,
    minX = -800,
    maxX = 800,
    minZ = -300,
    maxZ = 1200,
    stepX = 160,
    stepZ = 120,
    lineCol = PAL.gridLine,
    glowCol = PAL.gridGlow
  } = opts;

  ctx.save();
  ctx.lineWidth = 1.5;

  // Longitudinal lines (Z-direction)
  for (let x = minX; x <= maxX; x += stepX) {
    const p1 = project3D(x, floorY, minZ, cam);
    const p2 = project3D(x, floorY, maxZ, cam);

    if (p1.visible && p2.visible) {
      const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.02)');
      grad.addColorStop(0.3, lineCol);
      grad.addColorStop(0.8, 'rgba(56, 189, 248, 0.08)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0)');

      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
  }

  // Transverse lines (X-direction)
  for (let z = minZ; z <= maxZ; z += stepZ) {
    const p1 = project3D(minX, floorY, z, cam);
    const p2 = project3D(maxX, floorY, z, cam);

    if (p1.visible && p2.visible) {
      // Fade out with distance (Z)
      const alpha = Math.max(0, Math.min(0.35, 1 - (z - minZ) / (maxZ - minZ)));
      ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
  }

  // Horizon glow ellipse
  const centerHorizon = project3D(0, floorY, maxZ * 0.8, cam);
  if (centerHorizon.visible) {
    const rad = ctx.createRadialGradient(
      centerHorizon.x, centerHorizon.y, 10,
      centerHorizon.x, centerHorizon.y, 450
    );
    rad.addColorStop(0, glowCol);
    rad.addColorStop(1, 'rgba(14, 165, 233, 0)');
    ctx.fillStyle = rad;
    ctx.fillRect(centerHorizon.x - 450, centerHorizon.y - 120, 900, 240);
  }

  ctx.restore();
}

/**
 * 2.5D Extruded Slab/Box with Real Shading and Ground Shadow
 */
export function extrudedSlab25D(ctx, cam, opts) {
  const {
    cx = 0,
    cy = 0,
    cz = 0,
    w = 320,
    h = 60,
    d = 220,
    topCol = '#1e293b',
    frontCol = '#0f172a',
    sideCol = '#090d16',
    borderCol = 'rgba(56, 189, 248, 0.4)',
    glow = false,
    label = '',
    labelCol = PAL.ink,
    stat = '',
    statCol = PAL.cyan
  } = opts;

  const hw = w / 2;
  const hd = d / 2;
  const yTop = cy - h;
  const yBot = cy;

  // 8 Vertices
  // Top: T0(-hw, yTop, -hd), T1(hw, yTop, -hd), T2(hw, yTop, hd), T3(-hw, yTop, hd)
  // Bot: B0(-hw, yBot, -hd), B1(hw, yBot, -hd), B2(hw, yBot, hd), B3(-hw, yBot, hd)
  const T0 = project3D(cx - hw, yTop, cz - hd, cam);
  const T1 = project3D(cx + hw, yTop, cz - hd, cam);
  const T2 = project3D(cx + hw, yTop, cz + hd, cam);
  const T3 = project3D(cx - hw, yTop, cz + hd, cam);

  const B0 = project3D(cx - hw, yBot, cz - hd, cam);
  const B1 = project3D(cx + hw, yBot, cz - hd, cam);
  const B2 = project3D(cx + hw, yBot, cz + hd, cam);
  const B3 = project3D(cx - hw, yBot, cz + hd, cam);

  if (!T0.visible || !T2.visible) return;

  ctx.save();

  // 1. Soft Cast Shadow on Ground Plane
  const S0 = project3D(cx - hw + 30, 160, cz - hd + 40, cam);
  const S1 = project3D(cx + hw + 30, 160, cz - hd + 40, cam);
  const S2 = project3D(cx + hw + 30, 160, cz + hd + 40, cam);
  const S3 = project3D(cx - hw + 30, 160, cz + hd + 40, cam);

  if (S0.visible && S2.visible) {
    ctx.beginPath();
    ctx.moveTo(S0.x, S0.y);
    ctx.lineTo(S1.x, S1.y);
    ctx.lineTo(S2.x, S2.y);
    ctx.lineTo(S3.x, S3.y);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();
  }

  // 2. Draw Front Face (T3, T2, B2, B3)
  ctx.beginPath();
  ctx.moveTo(T3.x, T3.y);
  ctx.lineTo(T2.x, T2.y);
  ctx.lineTo(B2.x, B2.y);
  ctx.lineTo(B3.x, B3.y);
  ctx.closePath();
  ctx.fillStyle = frontCol;
  ctx.fill();
  ctx.strokeStyle = borderCol;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 3. Draw Side Face (Right: T1, T2, B2, B1 or Left: T0, T3, B3, B0)
  // Check which side is facing camera
  if (cx >= 0) {
    // Right side facing camera
    ctx.beginPath();
    ctx.moveTo(T1.x, T1.y);
    ctx.lineTo(T2.x, T2.y);
    ctx.lineTo(B2.x, B2.y);
    ctx.lineTo(B1.x, B1.y);
    ctx.closePath();
    ctx.fillStyle = sideCol;
    ctx.fill();
    ctx.strokeStyle = borderCol;
    ctx.stroke();
  } else {
    // Left side facing camera
    ctx.beginPath();
    ctx.moveTo(T0.x, T0.y);
    ctx.lineTo(T3.x, T3.y);
    ctx.lineTo(B3.x, B3.y);
    ctx.lineTo(B0.x, B0.y);
    ctx.closePath();
    ctx.fillStyle = sideCol;
    ctx.fill();
    ctx.strokeStyle = borderCol;
    ctx.stroke();
  }

  // 4. Draw Top Face (T0, T1, T2, T3)
  ctx.beginPath();
  ctx.moveTo(T0.x, T0.y);
  ctx.lineTo(T1.x, T1.y);
  ctx.lineTo(T2.x, T2.y);
  ctx.lineTo(T3.x, T3.y);
  ctx.closePath();
  ctx.fillStyle = topCol;
  ctx.fill();

  if (glow) {
    ctx.shadowColor = borderCol;
    ctx.shadowBlur = 18;
  }
  ctx.strokeStyle = borderCol;
  ctx.lineWidth = 2.2;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 5. Draw Top Label / Stat if provided
  if (label || stat) {
    const centerTop = project3D(cx, yTop, cz, cam);
    if (centerTop.visible) {
      const sc = centerTop.scale;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (label && stat) {
        ctx.fillStyle = statCol;
        ctx.font = `800 ${Math.round(26 * sc)}px "Plus Jakarta Sans", sans-serif`;
        ctx.fillText(stat, centerTop.x, centerTop.y - 12 * sc);

        ctx.fillStyle = labelCol;
        ctx.font = `600 ${Math.round(18 * sc)}px "Plus Jakarta Sans", sans-serif`;
        ctx.fillText(label, centerTop.x, centerTop.y + 16 * sc);
      } else if (label) {
        ctx.fillStyle = labelCol;
        ctx.font = `800 ${Math.round(22 * sc)}px "Plus Jakarta Sans", sans-serif`;
        ctx.fillText(label, centerTop.x, centerTop.y);
      }
    }
  }

  ctx.restore();
}

/**
 * 2.5D Multi-layer Exploded Stack (Pyramid / Hierarchical Architecture)
 */
export function explodedStack25D(ctx, cam, opts) {
  const {
    cx = 0,
    baseY = 120,
    cz = 200,
    layers = [], // array of { title, stat, color, lift, w, d, h }
    spread = 1.0,
    activeIndex = -1
  } = opts;

  let currentY = baseY;

  // Draw layers sorted from bottom to top (back to front in elevation)
  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i];
    const lift = (layer.lift || 70) * spread;
    const yPos = currentY - (i * lift);
    const isAct = i === activeIndex;

    extrudedSlab25D(ctx, cam, {
      cx,
      cy: yPos,
      cz,
      w: layer.w || (420 - i * 50),
      h: layer.h || 45,
      d: layer.d || (280 - i * 35),
      topCol: isAct ? layer.color : 'rgba(30, 41, 59, 0.95)',
      frontCol: isAct ? adjustBrightness(layer.color, -30) : '#0f172a',
      sideCol: isAct ? adjustBrightness(layer.color, -50) : '#090d16',
      borderCol: isAct ? '#ffffff' : (layer.color || PAL.cyan),
      glow: isAct,
      label: layer.title,
      labelCol: isAct ? '#ffffff' : PAL.ink,
      stat: layer.stat || `LEVEL 0${i + 1}`,
      statCol: isAct ? '#ffffff' : (layer.color || PAL.cyan)
    });

    // Draw laser connectors to next layer if separated
    if (i < layers.length - 1 && spread > 0.3) {
      const nextLift = (layers[i + 1].lift || 70) * spread;
      const nextY = yPos - nextLift;

      laserConnector3D(ctx, cam,
        { x: cx - (layer.w || 380) * 0.45, y: yPos - (layer.h || 45), z: cz },
        { x: cx - (layers[i + 1].w || 330) * 0.45, y: nextY, z: cz },
        { col: layer.color || PAL.cyan, pulse: true }
      );

      laserConnector3D(ctx, cam,
        { x: cx + (layer.w || 380) * 0.45, y: yPos - (layer.h || 45), z: cz },
        { x: cx + (layers[i + 1].w || 330) * 0.45, y: nextY, z: cz },
        { col: layer.color || PAL.cyan, pulse: true }
      );
    }
  }
}

/**
 * 2.5D Glowing Laser Connector Line between two 3D points
 */
export function laserConnector3D(ctx, cam, p1, p2, opts = {}) {
  const { col = PAL.cyan, dashed = true, pulse = false, t = 0 } = opts;

  const sp1 = project3D(p1.x, p1.y, p1.z, cam);
  const sp2 = project3D(p2.x, p2.y, p2.z, cam);

  if (!sp1.visible || !sp2.visible) return;

  ctx.save();
  ctx.strokeStyle = col;
  ctx.lineWidth = 2.5;

  if (dashed) {
    ctx.setLineDash([8, 6]);
    ctx.lineDashOffset = -t * 20;
  }

  // Glowing laser line
  ctx.shadowColor = col;
  ctx.shadowBlur = pulse ? 12 : 6;

  ctx.beginPath();
  ctx.moveTo(sp1.x, sp1.y);
  ctx.lineTo(sp2.x, sp2.y);
  ctx.stroke();

  // Endpoint dots
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(sp1.x, sp1.y, 4.5, 0, Math.PI * 2);
  ctx.arc(sp2.x, sp2.y, 4.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * 2.5D Floating Frosted Glass Step Card
 */
export function stepCard25D(ctx, cam, opts) {
  const {
    cx = 0,
    cy = -220,
    cz = 100,
    w = 640,
    h = 360,
    stepBadge = 'LANGKAH 1/5',
    badgeCol = PAL.cyan,
    title = '',
    sub = '',
    fnContent = null
  } = opts;

  const hw = w / 2;
  const hh = h / 2;

  // Project 4 Corners of Card
  const cTL = project3D(cx - hw, cy - hh, cz, cam);
  const cTR = project3D(cx + hw, cy - hh, cz, cam);
  const cBR = project3D(cx + hw, cy + hh, cz, cam);
  const cBL = project3D(cx - hw, cy + hh, cz, cam);

  if (!cTL.visible || !cBR.visible) return;

  ctx.save();

  // Glass card shadow
  ctx.beginPath();
  ctx.moveTo(cTL.x + 12, cTL.y + 16);
  ctx.lineTo(cTR.x + 12, cTR.y + 16);
  ctx.lineTo(cBR.x + 12, cBR.y + 16);
  ctx.lineTo(cBL.x + 12, cBL.y + 16);
  ctx.closePath();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fill();

  // Glass card body
  ctx.beginPath();
  ctx.moveTo(cTL.x, cTL.y);
  ctx.lineTo(cTR.x, cTR.y);
  ctx.lineTo(cBR.x, cBR.y);
  ctx.lineTo(cBL.x, cBL.y);
  ctx.closePath();

  const glassGrad = ctx.createLinearGradient(cTL.x, cTL.y, cBR.x, cBR.y);
  glassGrad.addColorStop(0, 'rgba(30, 41, 59, 0.92)');
  glassGrad.addColorStop(1, 'rgba(15, 23, 42, 0.96)');
  ctx.fillStyle = glassGrad;
  ctx.fill();

  // Glass border with cyan glow edge
  ctx.strokeStyle = PAL.glassBorderHighlight;
  ctx.lineWidth = 2.2;
  ctx.stroke();

  // Center coordinate for flat UI drawing
  const center = project3D(cx, cy, cz, cam);
  const sc = center.scale;

  // Badge pill
  if (stepBadge) {
    const badgeW = 200 * sc;
    const badgeH = 40 * sc;
    const bx = cTL.x + 40 * sc;
    const by = cTL.y + 35 * sc;

    ctx.fillStyle = badgeCol;
    ctx.beginPath();
    ctx.roundRect(bx, by, badgeW, badgeH, 8 * sc);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = `900 ${Math.round(18 * sc)}px "Plus Jakarta Sans", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(stepBadge, bx + badgeW / 2, by + badgeH / 2);
  }

  // Title
  if (title) {
    ctx.fillStyle = PAL.ink;
    ctx.font = `800 ${Math.round(34 * sc)}px "Plus Jakarta Sans", sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(title, cTL.x + 40 * sc, cTL.y + 90 * sc);
  }

  // Subtitle
  if (sub) {
    ctx.fillStyle = PAL.inkMuted;
    ctx.font = `600 ${Math.round(20 * sc)}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillText(sub, cTL.x + 40 * sc, cTL.y + 135 * sc);
  }

  // Optional Custom Content callback
  if (fnContent) {
    fnContent(ctx, center.x, center.y, sc);
  }

  ctx.restore();
}

/**
 * 2.5D Interactive Multiple-Choice Quiz with 3D Depth Buttons
 */
export function interactiveQuiz25D(ctx, cam, opts) {
  const {
    cx = 0,
    cy = -200,
    cz = 120,
    title = 'Kuis Pilihan Ganda',
    options = [],
    selected = null,
    revealAnswer = false,
    timerProgress = 0
  } = opts;

  // Background frame
  stepCard25D(ctx, cam, {
    cx,
    cy,
    cz,
    w: 700,
    h: 460,
    stepBadge: 'KUIS PEMAHAMAN 2.5D',
    badgeCol: PAL.amber,
    title,
    sub: 'Pilih jawaban yang paling tepat sebelum waktu habis'
  });

  const center = project3D(cx, cy, cz, cam);
  const sc = center.scale;

  // Options rendered as 2.5D extruded slabs
  const startY = cy - 35;
  for (let i = 0; i < options.length; i++) {
    const optY = startY + (i * 75);
    const isSelected = selected === i;
    const isCorrect = isSelected && revealAnswer;

    let optCol = isCorrect ? PAL.emerald : (isSelected ? PAL.blue : '#1e293b');
    let borderC = isCorrect ? '#34d399' : (isSelected ? PAL.cyan : 'rgba(255, 255, 255, 0.18)');

    extrudedSlab25D(ctx, cam, {
      cx,
      cy: optY,
      cz: cz + 20,
      w: 600,
      h: 24,
      d: 65,
      topCol: optCol,
      frontCol: adjustBrightness(optCol, -25),
      sideCol: adjustBrightness(optCol, -45),
      borderCol: borderC,
      glow: isSelected,
      label: options[i].text,
      labelCol: '#ffffff',
      stat: isCorrect ? '✔ BENAR' : '',
      statCol: '#ffffff'
    });
  }

  // Countdown timer bar
  if (timerProgress !== undefined) {
    const barW = 600 * (1 - Math.min(1, Math.max(0, timerProgress)));
    const barPos = project3D(cx - 300 + barW / 2, cy + 185, cz + 25, cam);

    if (barPos.visible && barW > 5) {
      ctx.save();
      ctx.fillStyle = PAL.amber;
      ctx.shadowColor = PAL.amber;
      ctx.shadowBlur = 10;
      ctx.fillRect(barPos.x - (barW * sc) / 2, barPos.y, barW * sc, 8 * sc);
      ctx.restore();
    }
  }
}

/**
 * 2.5D Center Narrative Box (Karaoke Card)
 */
export function karaokeCard25D(ctx, cx, cy, w, h, { lines = [], highlights = [], tag = 'KONSEP UTAMA' } = {}) {
  ctx.save();

  // Glass Container
  ctx.fillStyle = PAL.glassBg;
  ctx.strokeStyle = PAL.glassBorderHighlight;
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 28);
  ctx.fill();
  ctx.stroke();

  // Tag header
  if (tag) {
    ctx.fillStyle = PAL.cyan;
    ctx.font = '800 18px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(tag.toUpperCase(), cx - w / 2 + 36, cy - h / 2 + 24);
  }

  // Two Lines of Karaoke Typography
  const startTextY = cy - h / 2 + 65;
  const lineSpacing = 55;

  lines.forEach((lineText, idx) => {
    const currentY = startTextY + idx * lineSpacing;
    let currentX = cx - w / 2 + 36;

    const words = lineText.split(' ');
    words.forEach((word) => {
      const cleanWord = word.replace(/[^a-zA-Z0-9%]/g, '');
      const isHighlighted = highlights.some(hl => hl.toLowerCase().includes(cleanWord.toLowerCase()) && cleanWord.length > 1);

      ctx.font = '800 38px "Plus Jakarta Sans", sans-serif';
      const wordMetrics = ctx.measureText(word);
      const wordW = wordMetrics.width;

      if (isHighlighted) {
        // Glowing highlight pill
        ctx.fillStyle = 'rgba(6, 182, 212, 0.22)';
        ctx.strokeStyle = PAL.cyan;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(currentX - 6, currentY - 6, wordW + 12, 48, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = PAL.cyanGlow;
        ctx.shadowColor = PAL.cyan;
        ctx.shadowBlur = 12;
      } else {
        ctx.fillStyle = PAL.ink;
        ctx.shadowBlur = 0;
      }

      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(word, currentX, currentY);
      ctx.shadowBlur = 0;

      currentX += wordW + 14;
    });
  });

  ctx.restore();
}

/**
 * Standard Floating Educational Callout Card at y: 1485
 */
export function explainerCallout(ctx, cx, cy, w, h, { tag, title, desc, stat, statSub, col = PAL.cyan, a = 1.0 }) {
  if (a <= 0.01) return;

  ctx.save();
  ctx.globalAlpha = a;

  // Frosted Dark Glass container
  ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
  ctx.strokeStyle = col;
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 24);
  ctx.fill();
  ctx.stroke();

  // Left Tag Pill
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.roundRect(cx - w / 2 + 32, cy - h / 2 + 20, 160, 30, 8);
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.font = '900 15px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(tag, cx - w / 2 + 112, cy - h / 2 + 35);

  // Title
  ctx.fillStyle = PAL.ink;
  ctx.font = '800 28px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(title, cx - w / 2 + 32, cy - h / 2 + 62);

  // Description
  ctx.fillStyle = PAL.inkMuted;
  ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(desc, cx - w / 2 + 32, cy - h / 2 + 104);

  // Right Stat Box
  if (stat) {
    const statBoxX = cx + w / 2 - 200;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(statBoxX, cy - h / 2 + 20);
    ctx.lineTo(statBoxX, cy + h / 2 - 20);
    ctx.stroke();

    ctx.fillStyle = col;
    ctx.font = '900 36px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(stat, statBoxX + 95, cy - 8);

    if (statSub) {
      ctx.fillStyle = PAL.inkMuted;
      ctx.font = '800 15px "JetBrains Mono", monospace';
      ctx.fillText(statSub, statBoxX + 95, cy + 28);
    }
  }

  ctx.restore();
}

/**
 * Top Pill Badge at y: 80
 */
export function topHeader25D(ctx, badge, title, { col = PAL.cyan } = {}) {
  ctx.save();
  ctx.translate(540, 80);

  // Container
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.roundRect(-420, -32, 840, 64, 20);
  ctx.fill();
  ctx.stroke();

  // Left Tag Pill
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.roundRect(-400, -20, 150, 40, 10);
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.font = '900 16px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(badge, -325, 0);

  // Title
  ctx.fillStyle = PAL.ink;
  ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(title, -225, 0);

  ctx.restore();
}

// Utility function to darken or lighten hex colors
function adjustBrightness(hex, percent) {
  let num = parseInt(hex.replace('#', ''), 16);
  if (isNaN(num)) return hex;
  let r = (num >> 16) + percent;
  let g = ((num >> 8) & 0x00ff) + percent;
  let b = (num & 0x0000ff) + percent;
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return '#' + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
}

