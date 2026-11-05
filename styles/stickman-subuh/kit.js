// Maura Motion style kit: STICKMAN SUBUH (Nocturnal Split-Screen Habit Duel, Mirror Floor & Ghost Trail).
import { clamp, lerp, ease, hrand, mulberry32, TAU, mixHex, rgba } from '/engine/lib/core.js';
import { makeCanvas, cached, roundRect } from '/engine/lib/draw.js';

export const PAL = {
  bg0: '#080a10',
  bg1: '#101522',
  floor: '#0d111b',
  white: '#f5f7ff',
  gold: '#f6c453',
  emerald: '#4ce0b3',
  blue: '#58a6ff',
  red: '#ff6b6b',
  muted: '#8b95af',
  ink: '#06080d',
};

export { clamp, lerp, ease, hrand, TAU, mixHex, rgba };

export function cam(ctx, x, y, z = 1, rot = 0, fy = 960) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(540, fy);
  ctx.rotate(rot);
  ctx.scale(z, z);
  ctx.translate(-x, -y);
}

export const pop = (t, t0, dur = 0.42) => (t < t0 ? 0 : ease.outBack(clamp((t - t0) / dur)));
export const pr = (t, a, b) => ease.inOutCubic(clamp((t - a) / Math.max(1e-6, b - a)));

export function bg(ctx, t = 0, { floorY = 780, split = true, dawn = 0 } = {}) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const gr = ctx.createLinearGradient(0, 0, 0, 1920);
  gr.addColorStop(0, mixHex('#07090f', '#131d38', dawn));
  gr.addColorStop(0.45, mixHex('#0f1422', '#1f2942', dawn));
  gr.addColorStop(1, '#07090e');
  ctx.fillStyle = gr;
  ctx.fillRect(0, 0, 1080, 1920);

  // Subtle floor surface & glowing horizon line
  ctx.fillStyle = 'rgba(10, 14, 24, 0.88)';
  ctx.fillRect(0, floorY, 1080, 1920 - floorY);

  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(40, floorY);
  ctx.lineTo(1040, floorY);
  ctx.stroke();

  if (split) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([12, 12]);
    ctx.beginPath();
    ctx.moveTo(540, 275);
    ctx.lineTo(540, floorY + 130);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

export function subuhHeader(ctx, tag, mainTitle, subTitle, {
  y = 175, a = 1, clockTime = '04:42', clockLabel = 'WAKTU SUBUH', dayNum = 1, accent = PAL.gold,
} = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const w = 960, h = 156, left = 540 - w / 2, top = y - h / 2;

  ctx.fillStyle = 'rgba(14, 19, 32, 0.94)';
  roundRect(ctx, left, top, w, h, 18);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 2.5;
  roundRect(ctx, left, top, w, h, 18);
  ctx.stroke();

  // Left widget: Flip Calendar (HARI X)
  const calX = left + 92, calY = top + h / 2;
  ctx.fillStyle = '#182036';
  roundRect(ctx, calX - 66, calY - 52, 132, 104, 12);
  ctx.fill();
  ctx.fillStyle = accent;
  roundRect(ctx, calX - 66, calY - 52, 132, 30, 12);
  ctx.fill();
  ctx.fillStyle = PAL.ink;
  ctx.font = '900 15px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('KALENDER', calX, calY - 37);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 34px ui-monospace, monospace';
  ctx.fillText(`H-${dayNum}`, calX, calY + 16);

  // Right widget: Digital Fajr Clock
  const clkX = left + w - 108, clkY = top + h / 2;
  ctx.fillStyle = '#090d16';
  roundRect(ctx, clkX - 82, clkY - 52, 164, 104, 12);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  roundRect(ctx, clkX - 82, clkY - 52, 164, 104, 12);
  ctx.stroke();
  ctx.fillStyle = accent;
  ctx.font = '900 34px ui-monospace, monospace';
  ctx.fillText(clockTime, clkX, clkY - 8);
  ctx.fillStyle = PAL.muted;
  ctx.font = '700 15px ui-monospace, monospace';
  ctx.fillText(clockLabel, clkX, clkY + 28);

  // Center Title & Tag
  const midW = w - 410;
  ctx.fillStyle = accent;
  ctx.font = '800 17px ui-monospace, monospace';
  ctx.fillText(tag, 540 - 8, top + 34, midW);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 32px system-ui, sans-serif';
  ctx.fillText(mainTitle, 540 - 8, top + 78, midW);

  if (subTitle) {
    ctx.fillStyle = PAL.muted;
    ctx.font = '600 20px system-ui, sans-serif';
    ctx.fillText(subTitle, 540 - 8, top + 120, midW);
  }
  ctx.restore();
}

export function drawRoomHalf(ctx, side, floorY, {
  t = 0, label = '', subLabel = '', labelCol = PAL.emerald,
  alarmRings = false, phoneGlow = false, hasMat = true, dawn = 0,
} = {}) {
  const isLeft = side === 'left';
  const cx = isLeft ? 280 : 800;

  ctx.save();
  // Room status pill above room
  ctx.fillStyle = 'rgba(20, 27, 45, 0.9)';
  roundRect(ctx, cx - 210, 290, 420, 62, 12);
  ctx.fill();
  ctx.strokeStyle = labelCol;
  ctx.lineWidth = 2;
  roundRect(ctx, cx - 210, 290, 420, 62, 12);
  ctx.stroke();
  ctx.fillStyle = labelCol;
  ctx.font = '800 20px ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, cx, 312, 395);
  if (subLabel) {
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = '600 16px system-ui, sans-serif';
    ctx.fillText(subLabel, cx, 336, 395);
  }

  // Night Window with Crescent Moon & Stars
  const wx = isLeft ? 145 : 915, wy = 455, ww = 120, wh = 135;
  const wGr = ctx.createLinearGradient(wx, wy - wh / 2, wx, wy + wh / 2);
  wGr.addColorStop(0, mixHex('#0d162c', '#243b6b', dawn));
  wGr.addColorStop(1, mixHex('#182647', '#f6c453', dawn * 0.65));
  ctx.fillStyle = wGr;
  roundRect(ctx, wx - ww / 2, wy - wh / 2, ww, wh, 8);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 3;
  roundRect(ctx, wx - ww / 2, wy - wh / 2, ww, wh, 8);
  ctx.stroke();
  // Window panes cross
  ctx.beginPath();
  ctx.moveTo(wx, wy - wh / 2); ctx.lineTo(wx, wy + wh / 2);
  ctx.moveTo(wx - ww / 2, wy); ctx.lineTo(wx + ww / 2, wy);
  ctx.stroke();
  // Crescent moon inside window
  ctx.fillStyle = PAL.gold;
  ctx.beginPath(); ctx.arc(wx - 22, wy - 28, 14, 0, TAU); ctx.fill();
  ctx.fillStyle = mixHex('#0d162c', '#243b6b', dawn);
  ctx.beginPath(); ctx.arc(wx - 15, wy - 31, 12, 0, TAU); ctx.fill();

  // Bed prop
  const bx = isLeft ? 175 : 895;
  const bw = 205, bh = 58;
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 3.5;
  ctx.fillStyle = '#171f33';
  // Mattress
  roundRect(ctx, bx - bw / 2, floorY - bh, bw, bh - 14, 8);
  ctx.fill();
  ctx.stroke();
  // Legs & Headboard
  const hbX = isLeft ? bx - bw / 2 : bx + bw / 2 - 12;
  ctx.fillRect(hbX, floorY - bh - 34, 12, bh + 34);
  ctx.strokeRect(hbX, floorY - bh - 34, 12, bh + 34);
  // Pillow
  const pilX = isLeft ? bx - bw / 2 + 20 : bx + bw / 2 - 62;
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  roundRect(ctx, pilX, floorY - bh - 12, 42, 16, 6);
  ctx.fill();

  // Prayer mat (Sajadah) with mihrab arch
  if (hasMat) {
    const mx = isLeft ? 395 : 675;
    const mw = 135;
    ctx.strokeStyle = isLeft ? PAL.emerald : 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(mx - mw / 2, floorY - 3);
    ctx.lineTo(mx + mw / 2, floorY - 3);
    ctx.stroke();
    // Fringe tassels
    ctx.lineWidth = 2;
    for (let k = -2; k <= 2; k++) {
      ctx.beginPath();
      ctx.moveTo(mx + mw / 2, floorY - 3);
      ctx.lineTo(mx + mw / 2 + 10, floorY - 3 + k * 2);
      ctx.stroke();
    }
  }

  // Soundwave alarm ripples
  if (alarmRings) {
    const ax = isLeft ? bx - 70 : bx + 70, ay = floorY - 75;
    for (let i = 0; i < 3; i++) {
      const p = ((t * 1.4 + i * 0.33) % 1);
      ctx.strokeStyle = rgba(PAL.red, (1 - p) * 0.65);
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(ax, ay, 18 + p * 75, 0, TAU);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/**
 * Unique Subuh Stickman character with Peci/Kopiah & Sarung (role: 'peci')
 * vs Sleepy Bedhead & Phone Glare (role: 'sleepy'), plus Floor Reflection & Ghosting!
 */
export function subuhStickman(ctx, x, floorY, pose = 'pray-sujud', {
  t = 0, role = 'peci', facing = 1, col = '#ffffff', ghost = true, aura = false, a = 1,
} = {}) {
  if (a <= 0.01) return;

  const drawSingle = (ox, oy, alpha, isGhost = false) => {
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(ox, oy);
    ctx.scale(facing, 1);

    const strokeCol = isGhost ? 'rgba(140, 165, 220, 0.35)' : col;
    ctx.strokeStyle = strokeCol;
    ctx.fillStyle = strokeCol;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Aura beam for Fajr / Tahajud prayer
    if (aura && !isGhost) {
      const ag = ctx.createRadialGradient(0, -110, 10, 0, -110, 130);
      ag.addColorStop(0, 'rgba(246, 196, 83, 0.25)');
      ag.addColorStop(0.6, 'rgba(76, 224, 179, 0.08)');
      ag.addColorStop(1, 'rgba(76, 224, 179, 0)');
      ctx.fillStyle = ag;
      ctx.beginPath();
      ctx.arc(0, -110, 130, 0, TAU);
      ctx.fill();
      ctx.fillStyle = strokeCol;
    }

    let hx = 0, hy = -205;
    let headRot = 0;

    if (pose === 'sleep' || pose === 'phone-bed') {
      // Lying horizontally on top of the mattress (y = -68)
      const by = -68;
      hx = -62; hy = by - 14;
      // Torso & legs lying horizontally
      ctx.beginPath();
      ctx.moveTo(-36, by); ctx.lineTo(62, by);
      ctx.stroke();
      // Blanket covering body
      if (!isGhost) {
        ctx.fillStyle = role === 'peci' ? 'rgba(76,224,179,0.22)' : 'rgba(88,166,255,0.22)';
        roundRect(ctx, -32, by - 16, 98, 28, 10);
        ctx.fill();
      }
      if (pose === 'phone-bed') {
        // Arms holding glowing blue smartphone above face
        ctx.beginPath();
        ctx.moveTo(-25, by); ctx.lineTo(-18, by - 44); ctx.lineTo(-34, by - 58);
        ctx.stroke();
        if (!isGhost) {
          ctx.fillStyle = '#58a6ff';
          ctx.fillRect(-44, by - 72, 16, 26);
          // Blue light cone onto face
          ctx.fillStyle = 'rgba(88, 166, 255, 0.28)';
          ctx.beginPath();
          ctx.moveTo(-36, by - 58); ctx.lineTo(-76, by + 6); ctx.lineTo(-42, by + 6);
          ctx.closePath();
          ctx.fill();
        }
      } else {
        // Peaceful Zzz floating
        if (!isGhost) {
          ctx.fillStyle = PAL.muted;
          ctx.font = '700 20px ui-monospace, monospace';
          ctx.fillText('zZz', -60, by - 48 - Math.sin(t * 2.5) * 6);
        }
      }
    } else if (pose === 'wake-sit') {
      // Sitting on edge of bed rubbing eyes
      const hipX = 0, hipY = -62;
      hx = 8; hy = -168 + Math.sin(t * 3) * 3;
      // Legs hanging down to floor
      ctx.beginPath();
      ctx.moveTo(hipX, hipY); ctx.lineTo(32, -55); ctx.lineTo(32, 0);
      ctx.moveTo(hipX, hipY); ctx.lineTo(14, -55); ctx.lineTo(14, 0);
      // Spine & arm rubbing eye
      ctx.moveTo(hipX, hipY); ctx.lineTo(6, -138);
      ctx.moveTo(6, -128); ctx.lineTo(28, -148); ctx.lineTo(16, -165);
      ctx.stroke();
    } else if (pose === 'pray-sujud') {
      // Prostrating in Sujud on the prayer mat
      hx = 58; hy = -24;
      // Knees on mat, hips raised, back angled down to head, hands on mat
      ctx.beginPath();
      ctx.moveTo(-42, -6); ctx.lineTo(-8, -6); // shins on floor
      ctx.lineTo(-16, -68); // thighs up to pelvis
      ctx.lineTo(36, -34); // spine sloping down
      ctx.moveTo(22, -42); ctx.lineTo(42, -6); ctx.lineTo(62, -6); // arms on mat
      ctx.stroke();
      if (!isGhost && role === 'peci') {
        // Sarung pattern band on pelvis/back
        ctx.strokeStyle = PAL.emerald;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-16, -68); ctx.lineTo(6, -54);
        ctx.stroke();
      }
    } else if (pose === 'pray-ruku') {
      // Bowing 90 degrees in Ruku
      hx = 56; hy = -122;
      ctx.beginPath();
      ctx.moveTo(-18, 0); ctx.lineTo(-14, -110); // legs
      ctx.moveTo(0, 0); ctx.lineTo(-6, -110);
      ctx.moveTo(-10, -110); ctx.lineTo(34, -116); // horizontal back
      ctx.moveTo(22, -114); ctx.lineTo(-6, -62); // hands on knees
      ctx.stroke();
    } else {
      // Standing: 'pray-takbir', 'walk', 'stand'
      const walkSw = pose === 'walk' ? Math.sin(t * 6) * 22 : 0;
      const bob = Math.abs(Math.sin(t * 3)) * (pose === 'walk' ? 5 : 2);
      hx = 4; hy = -206 - bob;
      // Legs
      ctx.beginPath();
      ctx.moveTo(0, -102 - bob); ctx.lineTo(-10 - walkSw, -50); ctx.lineTo(-12 - walkSw * 1.2, 0);
      ctx.moveTo(0, -102 - bob); ctx.lineTo(12 + walkSw, -50); ctx.lineTo(14 + walkSw * 1.2, 0);
      // Spine
      ctx.moveTo(0, -102 - bob); ctx.lineTo(2, -176 - bob);
      ctx.stroke();

      // Sarung / Koko detail for 'peci' character
      if (!isGhost && role === 'peci') {
        ctx.strokeStyle = PAL.emerald;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(-12, -104 - bob); ctx.lineTo(14, -104 - bob);
        ctx.stroke();
        ctx.strokeStyle = strokeCol;
        ctx.lineWidth = 8;
      }

      // Arms
      ctx.beginPath();
      if (pose === 'pray-takbir') {
        // Hands folded on chest (sedekap) or raised in takbir
        const raise = Math.sin(t * 1.5) > 0.65;
        if (raise) {
          ctx.moveTo(2, -168 - bob); ctx.lineTo(26, -182 - bob); ctx.lineTo(24, -205 - bob);
        } else {
          ctx.moveTo(2, -168 - bob); ctx.lineTo(22, -142 - bob); ctx.lineTo(6, -134 - bob);
        }
      } else {
        ctx.moveTo(2, -168 - bob); ctx.lineTo(-12 + walkSw, -120 - bob);
        ctx.moveTo(2, -168 - bob); ctx.lineTo(16 - walkSw, -120 - bob);
      }
      ctx.stroke();
    }

    // Draw Head Circle
    ctx.fillStyle = PAL.bg0;
    ctx.beginPath(); ctx.arc(hx, hy, 22, 0, TAU); ctx.fill();
    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = 6.5;
    ctx.beginPath(); ctx.arc(hx, hy, 22, 0, TAU); ctx.stroke();

    // Unique Character Headgear & Hair Silhouette!
    if (!isGhost) {
      if (role === 'peci') {
        // Iconic Peci / Kopiah Songkok with Golden-Emerald Trim
        ctx.save();
        ctx.translate(hx, hy);
        if (pose === 'pray-sujud') ctx.rotate(0.6);
        ctx.fillStyle = '#182238';
        ctx.beginPath();
        ctx.moveTo(-21, -8);
        ctx.lineTo(-18, -28);
        ctx.lineTo(19, -28);
        ctx.lineTo(22, -8);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = PAL.gold;
        ctx.lineWidth = 3;
        ctx.stroke();
        // Gold band on peci
        ctx.beginPath();
        ctx.moveTo(-19, -15); ctx.lineTo(20, -15);
        ctx.stroke();
        ctx.restore();
      } else {
        // Messy Bedhead Spikes + Tired Eye Bags for 'sleepy' character
        ctx.save();
        ctx.translate(hx, hy);
        ctx.strokeStyle = strokeCol;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-16, -16); ctx.lineTo(-26, -32);
        ctx.moveTo(-4, -21); ctx.lineTo(-8, -38);
        ctx.moveTo(8, -20); ctx.lineTo(18, -35);
        ctx.moveTo(16, -12); ctx.lineTo(30, -22);
        ctx.stroke();
        // Tired dark eye circle
        ctx.strokeStyle = PAL.red;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(8, -2, 5, 0.2, Math.PI - 0.2);
        ctx.stroke();
        ctx.restore();
      }
    }
    ctx.restore();
  };

  // 1. Onion-skin ghost trails behind character
  if (ghost && (pose === 'walk' || pose === 'wake-sit' || pose === 'pray-takbir')) {
    drawSingle(x - facing * 26, floorY, a * 0.18, true);
    drawSingle(x - facing * 13, floorY, a * 0.32, true);
  }

  // 2. Main character above floor
  drawSingle(x, floorY, a, false);

  // 3. Mirrored Floor Reflection below floorY
  ctx.save();
  ctx.translate(x, floorY);
  ctx.scale(1, -0.55);
  drawSingle(0, 0, a * 0.18, true);
  ctx.restore();
}

export function subuhCard(ctx, x, y, w, h, {
  tag = '', titleStr = '', subStr = '', stat = '', statSub = '', col = PAL.emerald, a = 1,
} = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const left = x - w / 2, top = y - h / 2;

  ctx.fillStyle = 'rgba(13, 18, 31, 0.94)';
  roundRect(ctx, left, top, w, h, 16);
  ctx.fill();
  ctx.strokeStyle = col;
  ctx.lineWidth = 3;
  roundRect(ctx, left, top, w, h, 16);
  ctx.stroke();

  ctx.fillStyle = col;
  roundRect(ctx, left + 14, top + 16, 8, h - 32, 4);
  ctx.fill();

  const tx = left + 38;
  const maxTW = stat ? w - 260 : w - 60;

  if (tag) {
    ctx.fillStyle = col;
    ctx.font = '800 17px ui-monospace, monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(tag, tx, top + 34, maxTW);
  }
  if (titleStr) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 28px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(titleStr, tx, top + 76, maxTW);
  }
  if (subStr) {
    ctx.fillStyle = PAL.muted;
    ctx.font = '600 21px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(subStr, tx, top + h - 32, maxTW);
  }

  if (stat) {
    const sx = left + w - 118;
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    roundRect(ctx, sx - 90, top + 16, 180, h - 32, 12);
    ctx.fill();
    ctx.strokeStyle = col;
    ctx.lineWidth = 2;
    roundRect(ctx, sx - 90, top + 16, 180, h - 32, 12);
    ctx.stroke();

    ctx.fillStyle = col;
    ctx.font = '900 34px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(stat, sx, top + h * 0.44, 165);
    if (statSub) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 15px ui-monospace, monospace';
      ctx.fillText(statSub, sx, top + h * 0.76, 165);
    }
  }
  ctx.restore();
}
