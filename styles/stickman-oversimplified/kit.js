// 78 · STICKMAN OVERSIMPLIFIED — Kit: Bean-Body Historical Cartoon ("Si Ilmuwan Muda & Dunia Sejarah Pop")
import { clamp, lerp } from '/engine/lib/core.js';

export const PAL = {
  ink: '#22120a',
  skin: '#faecd4',
  skinShade: '#edd4b2',
  hairBrown: '#4d2608',
  hairGrey: '#b8b9c4',
  coatBlue: '#0b488f',
  coatGreen: '#3b6e1c',
  coatTeal: '#0d5669',
  gold: '#f7c625',
  amber: '#e88b1a',
  red: '#d93829',
  tealJar: '#53cbb8',
  skyTop: '#2976d6',
  skyBot: '#6cb0f0',
  cobble: '#57586b',
  cobbleDark: '#3f4052',
  wallLight: '#f6e7b2',
  wallStripe: '#ebd58d',
  woodTop: '#d48322',
  woodFront: '#a3560d',
  cardBg: 'rgba(24, 18, 14, 0.90)',
  white: '#ffffff',
};

/**
 * Scene Background:
 * mode === 'street': 19th-century European cobblestone street with receding ochre/brick buildings & top-hat passerby
 * mode === 'lab': Vintage striped laboratory with big window, chemical bottle shelves, and wooden workbench
 */
export function oversimplifiedBg(ctx, t, {
  mode = 'street',
  stageTag = 'SEJARAH POP • OVERSIMPLIFIED',
  col = PAL.gold,
} = {}) {
  ctx.save();

  if (mode === 'street') {
    // 1. Bright blue sky gradient
    const skyG = ctx.createLinearGradient(0, 0, 0, 680);
    skyG.addColorStop(0, PAL.skyTop);
    skyG.addColorStop(1, PAL.skyBot);
    ctx.fillStyle = skyG;
    ctx.fillRect(0, 0, 1080, 680);

    // Fluffy white cloud
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    const cx = 760 + Math.sin(t * 0.4) * 18;
    ctx.beginPath();
    ctx.arc(cx, 130, 62, 0, Math.PI * 2);
    ctx.arc(cx + 58, 120, 74, 0, Math.PI * 2);
    ctx.arc(cx + 125, 136, 54, 0, Math.PI * 2);
    ctx.arc(cx - 52, 142, 46, 0, Math.PI * 2);
    ctx.fill();

    // 2. Perspective 19th-Century Townhouses on left receding to right
    const buildings = [
      { x: 0, w: 195, topY: 18, botY: 580, col: '#e29f38', shutter: '#1d6ec2', rows: 3, cols: 1 },
      { x: 195, w: 290, topY: 90, botY: 562, col: '#cc6733', shutter: '#227834', rows: 3, cols: 3 },
      { x: 485, w: 235, topY: 175, botY: 545, col: '#ebbc4c', shutter: '#3b73b5', rows: 3, cols: 3 },
      { x: 720, w: 210, topY: 245, botY: 534, col: '#d99a36', shutter: '#227834', rows: 2, cols: 3 },
      { x: 930, w: 150, topY: 295, botY: 525, col: '#c97c3a', shutter: '#3b73b5', rows: 2, cols: 2 },
    ];

    buildings.forEach((b) => {
      ctx.fillStyle = b.col;
      ctx.beginPath();
      ctx.moveTo(b.x, b.topY);
      ctx.lineTo(b.x + b.w, b.topY + 48);
      ctx.lineTo(b.x + b.w, b.botY - 8);
      ctx.lineTo(b.x, b.botY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(34,18,10,0.35)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Roof cornice line
      ctx.strokeStyle = '#4a2a14';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(b.x, b.topY);
      ctx.lineTo(b.x + b.w, b.topY + 48);
      ctx.stroke();

      // Windows with shutters
      const winW = Math.max(18, (b.w / (b.cols + 1)) * 0.46);
      const winH = Math.max(32, ((b.botY - b.topY - 90) / (b.rows + 0.6)) * 0.58);
      for (let r = 0; r < b.rows; r++) {
        for (let c = 0; c < b.cols; c++) {
          const fracX = (c + 0.7) / (b.cols + 0.4);
          const wx = b.x + fracX * b.w;
          const slopeY = b.topY + fracX * 48;
          const wy = slopeY + 34 + r * (winH + 26);
          if (wy + winH > b.botY - 24) continue;

          // Left & right shutters
          ctx.fillStyle = b.shutter;
          ctx.fillRect(wx - winW * 0.85, wy, winW * 0.35, winH);
          ctx.fillRect(wx + winW * 0.5, wy, winW * 0.35, winH);

          // White window frame & glass
          ctx.fillStyle = '#d8e6f5';
          ctx.fillRect(wx - winW * 0.5, wy, winW, winH);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(wx - winW * 0.5, wy, winW, winH);
        }
      }
    });

    // 3. Cobblestone Street Floor (y: 525..850)
    const stG = ctx.createLinearGradient(0, 525, 0, 850);
    stG.addColorStop(0, '#c9b79c');
    stG.addColorStop(0.18, PAL.cobble);
    stG.addColorStop(1, PAL.cobbleDark);
    ctx.fillStyle = stG;
    ctx.fillRect(0, 525, 1080, 335);

    // Diagonal shadow cast on street
    ctx.fillStyle = 'rgba(25, 24, 38, 0.32)';
    ctx.beginPath();
    ctx.moveTo(0, 625);
    ctx.lineTo(860, 540);
    ctx.lineTo(1080, 590);
    ctx.lineTo(1080, 860);
    ctx.lineTo(0, 860);
    ctx.closePath();
    ctx.fill();

    // Cobblestone tile pattern
    ctx.fillStyle = 'rgba(255,255,255,0.09)';
    for (let row = 0; row < 8; row++) {
      const ry = 565 + row * 34;
      const tileW = 46 + row * 6;
      const tileH = 16 + row * 1.5;
      const offset = (row % 2) * (tileW * 0.5);
      for (let colI = -1; colI < 22; colI++) {
        const rx = colI * (tileW + 10) + offset;
        ctx.beginPath();
        ctx.roundRect(rx, ry, tileW, tileH, 6);
        ctx.fill();
      }
    }

    // Background Top-Hat Passerby walking slowly
    const walkX = 820 - ((t * 28) % 640);
    drawTopHatPasserby(ctx, walkX, 645, t);
  } else {
    // LABORATORY INTERIOR MODE
    // 1. Striped yellow wallpaper
    ctx.fillStyle = PAL.wallLight;
    ctx.fillRect(0, 0, 1080, 620);
    ctx.fillStyle = PAL.wallStripe;
    for (let x = 0; x < 1080; x += 72) {
      ctx.fillRect(x, 0, 36, 620);
    }

    // 2. Classic Laboratory Window on Left
    ctx.save();
    ctx.fillStyle = '#87b9eb';
    ctx.fillRect(36, 185, 420, 270);
    // Distant house silhouettes outside window
    ctx.fillStyle = '#5f7696';
    ctx.beginPath();
    ctx.moveTo(40, 450);
    ctx.lineTo(40, 350);
    ctx.lineTo(120, 295);
    ctx.lineTo(205, 350);
    ctx.lineTo(205, 320);
    ctx.lineTo(310, 270);
    ctx.lineTo(410, 335);
    ctx.lineTo(450, 335);
    ctx.lineTo(450, 450);
    ctx.closePath();
    ctx.fill();

    // Window white mullions & frame
    ctx.strokeStyle = '#fcfaf2';
    ctx.lineWidth = 14;
    ctx.strokeRect(36, 185, 420, 270);
    ctx.beginPath();
    ctx.moveTo(246, 185);
    ctx.lineTo(246, 455);
    ctx.moveTo(36, 320);
    ctx.lineTo(456, 320);
    ctx.stroke();
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 3.5;
    ctx.strokeRect(30, 180, 432, 280);
    ctx.restore();

    // 3. Shelves with Colorful Chemical Bottles on Right
    const shelvesY = [285, 425];
    shelvesY.forEach((sy, sIdx) => {
      ctx.fillStyle = PAL.woodTop;
      ctx.fillRect(680, sy, 370, 16);
      ctx.strokeStyle = PAL.ink;
      ctx.lineWidth = 3.5;
      ctx.strokeRect(680, sy, 370, 16);

      const bottles = [
        { dx: 715, w: 46, h: 78, c: '#39a878' },
        { dx: 795, w: 50, h: 98, c: '#e06d1f' },
        { dx: 880, w: 48, h: 88, c: '#1877d9' },
        { dx: 965, w: 44, h: 74, c: '#e6c629' },
      ];
      bottles.forEach((bt, bIdx) => {
        if (sIdx === 1 && bIdx === 0) return;
        ctx.fillStyle = bt.c;
        ctx.beginPath();
        ctx.moveTo(bt.dx, sy);
        ctx.lineTo(bt.dx + 4, sy - bt.h * 0.68);
        ctx.lineTo(bt.dx + 14, sy - bt.h * 0.72);
        ctx.lineTo(bt.dx + 16, sy - bt.h);
        ctx.lineTo(bt.dx + bt.w - 16, sy - bt.h);
        ctx.lineTo(bt.dx + bt.w - 14, sy - bt.h * 0.72);
        ctx.lineTo(bt.dx + bt.w - 4, sy - bt.h * 0.68);
        ctx.lineTo(bt.dx + bt.w, sy);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = PAL.ink;
        ctx.lineWidth = 3.5;
        ctx.stroke();
      });
    });

    // Warm sunbeam diagonal from window
    const beamG = ctx.createLinearGradient(150, 220, 620, 720);
    beamG.addColorStop(0, 'rgba(255, 244, 175, 0.28)');
    beamG.addColorStop(1, 'rgba(255, 244, 175, 0.0)');
    ctx.fillStyle = beamG;
    ctx.beginPath();
    ctx.moveTo(140, 200);
    ctx.lineTo(440, 200);
    ctx.lineTo(740, 760);
    ctx.lineTo(360, 760);
    ctx.closePath();
    ctx.fill();

    // Wooden Dado Wainscoting & Lab Countertop
    ctx.fillStyle = '#995314';
    ctx.fillRect(0, 520, 1080, 110);
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 520);
    ctx.lineTo(1080, 520);
    ctx.stroke();

    // Lab Workbench Surface (y: 615..850)
    ctx.fillStyle = PAL.woodTop;
    ctx.fillRect(0, 615, 1080, 70);
    ctx.fillStyle = PAL.woodFront;
    ctx.fillRect(0, 685, 1080, 175);
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 615);
    ctx.lineTo(1080, 615);
    ctx.moveTo(0, 685);
    ctx.lineTo(1080, 685);
    ctx.stroke();
  }

  // Dark lower stage panel for clean infographic cards (y: 845..1920)
  const botG = ctx.createLinearGradient(0, 840, 0, 1920);
  botG.addColorStop(0, '#171311');
  botG.addColorStop(1, '#0e0b0a');
  ctx.fillStyle = botG;
  ctx.fillRect(0, 845, 1080, 1075);

  ctx.strokeStyle = col;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, 845);
  ctx.lineTo(1080, 845);
  ctx.stroke();

  // Stage tag pill at top-left of illustration
  ctx.fillStyle = 'rgba(24, 18, 14, 0.88)';
  ctx.beginPath();
  ctx.roundRect(44, 190, 430, 34, 10);
  ctx.fill();
  ctx.strokeStyle = col;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = col;
  ctx.font = '800 15px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(stageTag, 60, 207, 398);

  ctx.restore();
}

function drawTopHatPasserby(ctx, x, y, t) {
  ctx.save();
  ctx.translate(x, y);
  const stride = Math.sin(t * 5) * 14;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 34, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Thin stick legs with knee bend
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-6, -75);
  ctx.lineTo(-10 - stride * 0.5, -36);
  ctx.lineTo(-4 - stride, 0);
  ctx.moveTo(6, -75);
  ctx.lineTo(10 + stride * 0.5, -36);
  ctx.lineTo(4 + stride, 0);
  ctx.stroke();

  // Bean body in Victorian green/teal coat
  ctx.fillStyle = PAL.coatGreen;
  ctx.beginPath();
  ctx.ellipse(0, -112, 24, 42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 4.5;
  ctx.stroke();

  // Head
  ctx.fillStyle = PAL.skin;
  ctx.beginPath();
  ctx.ellipse(0, -172, 34, 28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Snooty side eye
  ctx.fillStyle = PAL.ink;
  ctx.fillRect(-18, -176, 8, 3);

  // Tall Victorian Top Hat
  ctx.fillStyle = '#18181f';
  ctx.beginPath();
  ctx.roundRect(-26, -238, 52, 46, 4);
  ctx.fill();
  ctx.stroke();
  // Green hat ribbon
  ctx.fillStyle = '#3b8c2a';
  ctx.fillRect(-25, -204, 50, 9);
  // Hat brim
  ctx.fillStyle = '#18181f';
  ctx.beginPath();
  ctx.ellipse(0, -193, 40, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

/**
 * Top Header Banner with Pop-History Badge
 */
export function oversimplifiedHeader(ctx, badgeText, titleStr, subStr, { col = PAL.gold } = {}) {
  ctx.save();
  ctx.fillStyle = 'rgba(22, 16, 12, 0.92)';
  ctx.strokeStyle = col;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(40, 34, 1000, 145, 22);
  ctx.fill();
  ctx.stroke();

  // Left Year / Era Badge
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.roundRect(62, 54, 185, 105, 16);
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 3.5;
  ctx.stroke();

  ctx.fillStyle = PAL.ink;
  ctx.font = '800 14px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ERA SEJARAH', 154, 78, 165);

  ctx.font = '900 32px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.fillText(badgeText, 154, 118, 170);

  // Main Title & Subtitle
  ctx.textAlign = 'left';
  ctx.fillStyle = PAL.white;
  ctx.font = '900 32px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.fillText(titleStr, 272, 92, 745);

  ctx.fillStyle = '#f5d78e';
  ctx.font = '600 20px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.fillText(subStr, 272, 134, 745);
  ctx.restore();
}

/**
 * Unique Character #78: Stickman OverSimplified ("Si Ilmuwan Muda Bean-Body")
 * - Wide oval cream head with bold dark outline
 * - Signature swept brown bowl-cut hair with wavy forehead line & hair-part strokes
 * - Rounded pill/bean torso in Prussian blue coat with 4 golden buttons
 * - Expressive cartoon eyes ('happy' ^^, 'excited' ><, 'focused' --, 'shocked' oo)
 * - Holds glowing solar chemical jar, petri dish, or points to lab apparatus
 */
export function oversimplifiedStickman(ctx, x, y, pose = 'happy', {
  scale = 1,
  t = 0,
  coatColor = PAL.coatBlue,
  hairColor = PAL.hairBrown,
  prop = 'solar_jar', // 'solar_jar' | 'petri' | 'wash_basin' | 'none'
  showLegs = true,
  glasses = false,
} = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const bob = Math.sin(t * 3.5) * 3.5;

  if (showLegs) {
    // Contact shadow on ground
    ctx.fillStyle = 'rgba(12, 12, 24, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 74, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Long thin stick legs
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 8.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-26, -155 + bob);
    ctx.lineTo(-32, 0);
    ctx.moveTo(26, -155 + bob);
    ctx.lineTo(32, 0);
    ctx.stroke();

    // Flat oval shoes
    ctx.fillStyle = PAL.ink;
    ctx.beginPath();
    ctx.roundRect(-56, -10, 36, 12, 5);
    ctx.roundRect(20, -10, 36, 12, 5);
    ctx.fill();
  }

  ctx.translate(0, bob);
  const torsoY = showLegs ? -235 : -95;
  const headY = torsoY - 132;

  // Left stick arm (hanging or gesturing)
  ctx.strokeStyle = '#072f61';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-58, torsoY - 45);
  ctx.quadraticCurveTo(-84, torsoY + 5, -80, torsoY + 55);
  ctx.stroke();

  // Round black hand fist
  ctx.fillStyle = PAL.ink;
  ctx.beginPath();
  ctx.arc(-80, torsoY + 58, 9, 0, Math.PI * 2);
  ctx.fill();

  // BEAN / PILL TORSO
  ctx.fillStyle = coatColor;
  ctx.beginPath();
  ctx.ellipse(0, torsoY, 64, 88, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 7.5;
  ctx.stroke();

  // 4 Vertical Golden Buttons on Coat
  for (let i = 0; i < 4; i++) {
    const by = torsoY - 44 + i * 28;
    ctx.fillStyle = PAL.gold;
    ctx.beginPath();
    ctx.arc(-4, by, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  // Right arm holding prop in front of chest
  if (prop === 'solar_jar') {
    const jarX = 36;
    const jarY = torsoY - 12;

    // Sunlight glow around electrode tip
    const glow = ctx.createRadialGradient(jarX + 8, jarY - 52, 4, jarX + 8, jarY - 52, 68);
    glow.addColorStop(0, 'rgba(255, 245, 158, 0.85)');
    glow.addColorStop(1, 'rgba(255, 245, 158, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(jarX + 8, jarY - 52, 68, 0, Math.PI * 2);
    ctx.fill();

    // Glass jar container
    ctx.fillStyle = '#d8edf7';
    ctx.beginPath();
    ctx.roundRect(jarX - 32, jarY - 44, 64, 86, 10);
    ctx.fill();
    // Yellow chemical electrolyte inside
    ctx.fillStyle = '#ffca18';
    ctx.beginPath();
    ctx.roundRect(jarX - 28, jarY - 12, 56, 50, 6);
    ctx.fill();
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 4;
    ctx.strokeRect(jarX - 32, jarY - 44, 64, 86);

    // Two vertical silver electrodes inside jar
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(jarX - 16, jarY - 54, 10, 68);
    ctx.strokeRect(jarX - 16, jarY - 54, 10, 68);
    ctx.fillRect(jarX + 8, jarY - 58, 10, 72);
    ctx.strokeRect(jarX + 8, jarY - 58, 10, 72);

    // Dark contact terminal at bottom of jar
    ctx.fillStyle = PAL.ink;
    ctx.beginPath();
    ctx.arc(jarX, jarY + 30, 9, 0, Math.PI * 2);
    ctx.fill();
  } else if (prop === 'petri') {
    const px = 42;
    const py = torsoY + 4;
    ctx.fillStyle = '#d8f3dc';
    ctx.beginPath();
    ctx.ellipse(px, py, 36, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 4;
    ctx.stroke();
    // Penicillium mold spot with clear halo
    ctx.fillStyle = '#2d6a4f';
    ctx.beginPath();
    ctx.arc(px - 8, py - 2, 10, 0, Math.PI * 2);
    ctx.fill();
  } else if (prop === 'wash_basin') {
    const bx = 42;
    const by = torsoY + 8;
    ctx.fillStyle = '#74c0fc';
    ctx.beginPath();
    ctx.roundRect(bx - 34, by - 18, 68, 36, 12);
    ctx.fill();
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  // HEAD (Wide Oval Pill/Bean Head)
  ctx.fillStyle = PAL.skin;
  ctx.beginPath();
  ctx.ellipse(0, headY, 84, 72, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 7.5;
  ctx.stroke();

  // Signature Bowl-Cut Swept Hair Cap
  ctx.fillStyle = hairColor;
  ctx.beginPath();
  ctx.arc(0, headY - 4, 84, Math.PI * 0.96, Math.PI * 2.04);
  // Wavy lower fringe across forehead
  ctx.lineTo(82, headY - 12);
  ctx.lineTo(42, headY - 6);
  ctx.lineTo(0, headY - 15);
  ctx.lineTo(-42, headY - 6);
  ctx.lineTo(-82, headY - 12);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 7;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // Hair part & brow accents on hair cap
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(8, headY - 52);
  ctx.lineTo(-4, headY - 24);
  ctx.moveTo(-36, headY - 30);
  ctx.lineTo(-8, headY - 28);
  ctx.moveTo(6, headY - 28);
  ctx.lineTo(36, headY - 30);
  ctx.stroke();

  // Optional Round Spectacles (for Father / Mentor)
  if (glasses) {
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.arc(-20, headY + 4, 15, 0, Math.PI * 2);
    ctx.arc(20, headY + 4, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // EXPRESSIVE EYES & MOUTH
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 5.5;
  ctx.lineCap = 'round';

  if (pose === 'happy') {
    // Happy curved arches ^ ^
    ctx.beginPath();
    ctx.arc(-22, headY + 4, 12, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(22, headY + 4, 12, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  } else if (pose === 'excited') {
    // Squeezed > < eyes
    ctx.beginPath();
    ctx.moveTo(-36, headY - 4);
    ctx.lineTo(-14, headY + 4);
    ctx.lineTo(-36, headY + 12);
    ctx.moveTo(36, headY - 4);
    ctx.lineTo(14, headY + 4);
    ctx.lineTo(36, headY + 12);
    ctx.stroke();
  } else if (pose === 'focused') {
    // Calm horizontal bar eyes - -
    ctx.beginPath();
    ctx.moveTo(-34, headY + 4);
    ctx.lineTo(-10, headY + 4);
    ctx.moveTo(10, headY + 4);
    ctx.lineTo(34, headY + 4);
    ctx.stroke();
  } else {
    // Shocked round eyes
    ctx.fillStyle = PAL.ink;
    ctx.beginPath();
    ctx.arc(-22, headY + 4, 6, 0, Math.PI * 2);
    ctx.arc(22, headY + 4, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Mouth
  if (pose === 'happy' || pose === 'excited') {
    // Open D-mouth with white teeth & tongue
    const mw = pose === 'excited' ? 32 : 24;
    const mh = pose === 'excited' ? 22 : 16;
    ctx.fillStyle = '#4a1c12';
    ctx.beginPath();
    ctx.moveTo(-mw, headY + 24);
    ctx.lineTo(mw, headY + 24);
    ctx.quadraticCurveTo(mw, headY + 24 + mh, 0, headY + 24 + mh);
    ctx.quadraticCurveTo(-mw, headY + 24 + mh, -mw, headY + 24);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 4;
    ctx.stroke();

    // Teeth bar
    ctx.fillStyle = PAL.white;
    ctx.fillRect(-mw + 3, headY + 25, (mw - 3) * 2, 5);
    // Pink tongue
    ctx.fillStyle = '#e87a64';
    ctx.beginPath();
    ctx.ellipse(0, headY + 24 + mh - 5, mw * 0.45, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Simple curved smile
    ctx.beginPath();
    ctx.arc(0, headY + 20, 14, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Laboratory Workbench Apparatus: Chemical Jar + Analog Galvanometer Dial
 */
export function drawLabApparatus(ctx, x, y, t, {
  needleAngle = -0.55,
  label = 'GALVANOMETER (ARUS LISTRIK)',
  jarColor = PAL.tealJar,
} = {}) {
  ctx.save();
  ctx.translate(x, y);

  // 1. Chemical Jar on Left
  ctx.fillStyle = '#d4f1f9';
  ctx.beginPath();
  ctx.roundRect(-145, -108, 92, 108, 10);
  ctx.fill();
  ctx.fillStyle = jarColor;
  ctx.fillRect(-143, -72, 88, 60);
  ctx.fillStyle = PAL.gold;
  ctx.fillRect(-145, -14, 92, 14);
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 4;
  ctx.strokeRect(-145, -108, 92, 108);

  // Two electrodes on top of jar
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(-126, -124, 16, 16);
  ctx.strokeRect(-126, -124, 16, 16);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(-90, -124, 16, 16);
  ctx.strokeRect(-90, -124, 16, 16);

  // Copper wires arching to meter
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(-118, -124);
  ctx.quadraticCurveTo(-75, -162, -32, -132);
  ctx.moveTo(-82, -124);
  ctx.quadraticCurveTo(-55, -150, -24, -132);
  ctx.stroke();

  // 2. Wooden-Framed Analog Galvanometer on Right
  ctx.fillStyle = '#9c470b';
  ctx.beginPath();
  ctx.roundRect(-36, -132, 210, 132, 8);
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 4;
  ctx.stroke();

  // White dial face
  ctx.fillStyle = '#f8f6f0';
  ctx.fillRect(-18, -116, 174, 96);

  // Dial arc & ticks
  const dialCx = 69;
  const dialCy = -32;
  // Pink highlight wedge on right side of dial
  ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
  ctx.beginPath();
  ctx.moveTo(dialCx, dialCy);
  ctx.arc(dialCx, dialCy, 66, -Math.PI * 0.35, -Math.PI * 0.1);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(dialCx, dialCy, 66, -Math.PI * 0.88, -Math.PI * 0.12);
  ctx.stroke();

  // Animated Red Needle
  const ang = needleAngle + Math.sin(t * 6) * 0.05;
  ctx.strokeStyle = PAL.red;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(dialCx, dialCy);
  ctx.lineTo(dialCx + Math.sin(ang) * 62, dialCy - Math.cos(ang) * 62);
  ctx.stroke();

  ctx.fillStyle = PAL.gold;
  ctx.beginPath();
  ctx.arc(dialCx, dialCy, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Label plaque on workbench below meter
  ctx.fillStyle = 'rgba(24, 18, 14, 0.88)';
  ctx.beginPath();
  ctx.roundRect(-145, 14, 320, 32, 8);
  ctx.fill();
  ctx.fillStyle = PAL.gold;
  ctx.font = '800 14px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 15, 30, 300);

  ctx.restore();
}

/**
 * Comic Pop-History Speech Bubble with Outlined Highlight Text
 */
export function oversimplifiedBubble(ctx, x, y, textStr, {
  col = PAL.gold,
} = {}) {
  ctx.save();
  const w = 680;
  const h = 68;
  const bx = clamp(x - w / 2, 48, 1080 - w - 48);

  ctx.fillStyle = 'rgba(22, 16, 12, 0.92)';
  ctx.strokeStyle = col;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(bx, y - h / 2, w, h, 20);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = PAL.white;
  ctx.font = '800 22px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(textStr, bx + w / 2, y, w - 36);
  ctx.restore();
}

/**
 * Lower Historical Fact Card
 */
export function oversimplifiedCard(ctx, cx, cy, w, h, {
  tag = '',
  titleStr = '',
  subStr = '',
  stat = '',
  statSub = '',
  col = PAL.gold,
  a = 1,
} = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(0.92 + 0.08 * a, 0.92 + 0.08 * a);
  ctx.globalAlpha = clamp(a, 0, 1);

  ctx.fillStyle = 'rgba(28, 22, 18, 0.96)';
  ctx.strokeStyle = col;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 20);
  ctx.fill();
  ctx.stroke();

  // Left accent bar
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.roundRect(-w / 2 + 16, -h / 2 + 18, 10, h - 36, 5);
  ctx.fill();

  const textLeft = -w / 2 + 44;
  const maxTextW = stat ? w - 275 : w - 70;

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = col;
  ctx.font = '800 16px "JetBrains Mono", monospace';
  ctx.fillText(tag, textLeft, -h / 2 + 38, maxTextW);

  ctx.fillStyle = PAL.white;
  ctx.font = '800 24px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.fillText(titleStr, textLeft, -2, maxTextW);

  ctx.fillStyle = '#d6c7b2';
  ctx.font = '500 18px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.fillText(subStr, textLeft, h / 2 - 36, maxTextW);

  if (stat) {
    const bx = w / 2 - 118;
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.roundRect(bx - 88, -h / 2 + 22, 176, h - 44, 14);
    ctx.fill();
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = PAL.ink;
    ctx.font = '900 26px "Plus Jakarta Sans", "Inter", sans-serif';
    ctx.fillText(stat, bx, -10, 160);

    if (statSub) {
      ctx.font = '800 14px "JetBrains Mono", monospace';
      ctx.fillText(statSub, bx, 24, 160);
    }
  }

  ctx.restore();
}
