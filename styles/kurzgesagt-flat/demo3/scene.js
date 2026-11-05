// 79 · KURZGESAGT FLAT MOTION — Demo 3: Paradoks Kesepian
// Mengapa Otak Prasejarah Membenci Isolasi (Full-Screen 1080x1920 8-Beat Standard)

import * as K from '/styles/kurzgesagt-flat/kit.js';

const { clamp, lerp, ease } = AM.lib;
const { PAL, withCamera, drawCosmicBackground, drawHeader, drawKurzgesagtDuck, drawCallout } = K;

export const meta = {
  fps: 30,
  width: 1080,
  height: 1920,
  captions: { preset: 'clean', y: 1700, size: 48 }
};

let ctx;
const C = {};
const pop = (t, a, d = 0.45) => ease.outBack(clamp((t - a) / d), 1.7);

export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
}

export function render(t) {
  ctx.clearRect(0, 0, 1080, 1920);

  // 1. Determine Current Beat (8 Beats)
  let beat = 0;
  if (t >= C.moral?.start) beat = 7;
  else if (t >= C.solusi?.start) beat = 6;
  else if (t >= C.modern?.start) beat = 5;
  else if (t >= C.bahaya?.start) beat = 4;
  else if (t >= C.alarm?.start) beat = 3;
  else if (t >= C.ancaman?.start) beat = 2;
  else if (t >= C.purba?.start) beat = 1;

  // 2. Cosmic Background
  drawCosmicBackground(ctx, t);

  // 3. Dynamic Camera Zoom & Pan
  let zoom = 1.0, fx = 540, fy = 880;
  if (beat === 1 || beat === 2) {
    zoom = 1.15; fx = 500; fy = 860; // Savanna predator threat
  } else if (beat === 3) {
    zoom = 1.20; fx = 540; fy = 820; // Brain alarm close-up
  } else if (beat === 4) {
    zoom = 1.12; fx = 540; fy = 850; // Cortisol stress cage
  } else if (beat === 5) {
    zoom = 1.16; fx = 560; fy = 860; // Dark apartment glowing phone
  } else if (beat === 7) {
    zoom = 1.08; fx = 540; fy = 880; // Group campfire reunion
  }

  // 4. World Content with Camera
  withCamera(ctx, { zoom, fx, fy }, () => {
    const floorY = 1240;

    // Platform pod
    K.kurzgesagtPodPlatform(ctx, 540, floorY, {
      col: beat >= 6 ? PAL.yellow : beat === 4 ? PAL.coral : PAL.purple,
      rx: 440,
      ry: 95
    });

    if (beat === 0) {
      // Beat 0: Solitary duck clutching chest with emotional physical pain
      drawKurzgesagtDuck(ctx, 360, floorY - 30, { scale: 1.5, pose: 'drowsy', t });

      // Hologram of Heart & Pain Matrix (dACC)
      const hx = 710, hy = 760;
      ctx.save();
      // Glowing aura
      const aura = ctx.createRadialGradient(hx, hy, 10, hx, hy, 130);
      aura.addColorStop(0, 'rgba(255, 75, 114, 0.35)');
      aura.addColorStop(1, 'transparent');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(hx, hy, 130, 0, Math.PI * 2);
      ctx.fill();

      // Translucent Heart Box
      ctx.fillStyle = 'rgba(20, 15, 45, 0.9)';
      ctx.strokeStyle = PAL.coral;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(hx - 140, hy - 140, 280, 280, 24);
      ctx.fill(); ctx.stroke();

      // Pulsing Neon Broken Heart Icon
      const hpulse = 1.0 + 0.12 * Math.sin(t * 6);
      ctx.save();
      ctx.translate(hx, hy - 20);
      ctx.scale(hpulse, hpulse);
      ctx.fillStyle = PAL.coral;
      ctx.beginPath();
      ctx.moveTo(0, 35);
      ctx.bezierCurveTo(-60, -20, -75, -80, 0, -50);
      ctx.bezierCurveTo(75, -80, 60, -20, 0, 35);
      ctx.fill();

      // Lightning fracture in heart
      ctx.strokeStyle = PAL.white;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, -50);
      ctx.lineTo(-8, -25);
      ctx.lineTo(8, -5);
      ctx.lineTo(-4, 15);
      ctx.lineTo(0, 35);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = PAL.white;
      ctx.font = '900 18px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('NYERI FISIK NYATA', hx, hy + 90);

      ctx.fillStyle = PAL.muted;
      ctx.font = '600 14px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Korteks Cingulate Anterior', hx, hy + 116);
      ctx.restore();

    } else if (beat === 1) {
      // Beat 1: Prehistoric Savanna (100,000+ years ago)
      drawKurzgesagtDuck(ctx, 270, floorY - 30, { scale: 1.4, pose: 'curious', t });

      // Savanna Acacia Tree Silhouette
      const tx = 740, ty = floorY - 20;
      ctx.save();
      ctx.fillStyle = '#1e1b4b';
      ctx.strokeStyle = '#312e81';
      ctx.lineWidth = 4;
      // Trunk
      ctx.beginPath();
      ctx.moveTo(tx - 18, ty);
      ctx.quadraticCurveTo(tx - 10, ty - 120, tx + 15, ty - 240);
      ctx.lineTo(tx + 45, ty - 240);
      ctx.quadraticCurveTo(tx + 20, ty - 120, tx + 18, ty);
      ctx.closePath();
      ctx.fill(); ctx.stroke();

      // Flat Acacia Canopy Tops
      ctx.fillStyle = '#312e81';
      ctx.beginPath();
      ctx.ellipse(tx - 40, ty - 250, 130, 35, -0.1, 0, Math.PI * 2);
      ctx.ellipse(tx + 70, ty - 275, 110, 30, 0.1, 0, Math.PI * 2);
      ctx.ellipse(tx + 160, ty - 235, 80, 25, 0.05, 0, Math.PI * 2);
      ctx.fill();

      // Prehistoric Savanna Badge
      ctx.fillStyle = 'rgba(15, 14, 40, 0.9)';
      ctx.strokeStyle = PAL.yellow;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(500, 620, 360, 56, 14);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = PAL.yellow;
      ctx.font = '900 17px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('SAVANA PLEISTOSEN: SENDIRIAN = MATI', 680, 655);
      ctx.restore();

    } else if (beat === 2) {
      // Beat 2: Lurking Predator in Tall Grass (Glowing Yellow Eyes)
      drawKurzgesagtDuck(ctx, 230, floorY - 30, { scale: 1.4, pose: 'drowsy', t });

      // Ominous Dark Grass & Lurking Beast
      const bx = 680, by = floorY - 40;
      ctx.save();
      // Lurking Beast Shadow Silhouette
      ctx.fillStyle = '#09081a';
      ctx.strokeStyle = '#2e1065';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(bx, by - 90, 160, 110, 0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();

      // Beast Ears
      ctx.beginPath();
      ctx.moveTo(bx - 90, by - 160); ctx.lineTo(bx - 120, by - 230); ctx.lineTo(bx - 60, by - 180);
      ctx.moveTo(bx + 90, by - 160); ctx.lineTo(bx + 120, by - 230); ctx.lineTo(bx + 60, by - 180);
      ctx.fill(); ctx.stroke();

      // Glowing Sinister Yellow Predator Eyes
      const epulse = 0.8 + 0.2 * Math.sin(t * 8);
      ctx.fillStyle = PAL.yellow;
      ctx.beginPath();
      ctx.ellipse(bx - 45, by - 120, 18 * epulse, 9 * epulse, -0.2, 0, Math.PI * 2);
      ctx.ellipse(bx + 45, by - 120, 18 * epulse, 9 * epulse, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Danger Warning Pill
      ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.strokeStyle = PAL.coral;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(bx - 150, by - 290, 300, 48, 12);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = PAL.coral;
      ctx.font = '900 16px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('! TARGET MUDAH PREDATOR !', bx, by - 260);
      ctx.restore();

    } else if (beat === 3) {
      // Beat 3: Biological Emergency Alarm System (Like Hunger or Thirst)
      drawKurzgesagtDuck(ctx, 220, floorY - 30, { scale: 1.4, pose: 'pointing', t });

      // 3 Biological Alarms Triad
      const ax = 660, ay = 740;
      ctx.save();
      const alarms = [
        { name: 'LAPAR', sub: 'Kurang Nutrisi', icon: 'CAL', col: PAL.orange, y: ay - 110 },
        { name: 'HAUS', sub: 'Kurang Cairan', icon: 'H2O', col: PAL.cyan, y: ay },
        { name: 'KESEPIAN', sub: 'Kurang Kawanan', icon: 'SOS', col: PAL.coral, y: ay + 110 }
      ];

      alarms.forEach(a => {
        ctx.fillStyle = 'rgba(15, 14, 40, 0.9)';
        ctx.strokeStyle = a.col;
        ctx.lineWidth = a.name === 'KESEPIAN' ? 4 : 2.5;
        ctx.beginPath();
        ctx.roundRect(ax - 200, a.y - 40, 400, 78, 16);
        ctx.fill(); ctx.stroke();

        // Icon Pill
        ctx.fillStyle = a.col;
        ctx.beginPath();
        ctx.roundRect(ax - 180, a.y - 25, 68, 50, 10);
        ctx.fill();

        ctx.fillStyle = PAL.ink;
        ctx.font = '900 18px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(a.icon, ax - 146, a.y + 6);

        // Text
        ctx.textAlign = 'left';
        ctx.fillStyle = PAL.white;
        ctx.font = '900 22px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(a.name, ax - 95, a.y - 2);

        ctx.fillStyle = PAL.muted;
        ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(a.sub, ax - 95, a.y + 24);

        if (a.name === 'KESEPIAN') {
          // Blinking Warning Indicator
          const blink = Math.sin(t * 10) > 0;
          ctx.fillStyle = blink ? PAL.coral : PAL.white;
          ctx.font = '900 14px "JetBrains Mono", monospace';
          ctx.textAlign = 'right';
          ctx.fillText('ALARM AKTIF!', ax + 180, a.y + 6);
        }
      });
      ctx.restore();

    } else if (beat === 4) {
      // Beat 4: Stress Mode & High Blood Pressure / Cortisol
      drawKurzgesagtDuck(ctx, 230, floorY - 30, { scale: 1.4, pose: 'drowsy', t });

      // Chemical Stress Laboratory Monitor
      const mx = 660, my = 730;
      ctx.save();
      ctx.fillStyle = 'rgba(12, 10, 36, 0.95)';
      ctx.strokeStyle = PAL.coral;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(mx - 220, my - 140, 440, 280, 22);
      ctx.fill(); ctx.stroke();

      // Top title
      ctx.fillStyle = 'rgba(255, 75, 114, 0.15)';
      ctx.beginPath();
      ctx.roundRect(mx - 200, my - 120, 400, 38, 8);
      ctx.fill();

      ctx.fillStyle = PAL.coral;
      ctx.font = '900 15px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('MODE BERTAHAN HIDUP EKSTREM', mx, my - 95);

      // Heart Rate EKG Line
      ctx.strokeStyle = PAL.coral;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(mx - 180, my - 20);
      ctx.lineTo(mx - 70, my - 20);
      ctx.lineTo(mx - 50, my - 65);
      ctx.lineTo(mx - 30, my + 45);
      ctx.lineTo(mx - 10, my - 20);
      ctx.lineTo(mx + 60, my - 20);
      ctx.lineTo(mx + 80, my - 70);
      ctx.lineTo(mx + 100, my + 40);
      ctx.lineTo(mx + 120, my - 20);
      ctx.lineTo(mx + 180, my - 20);
      ctx.stroke();

      // Stat indicators: Cortisol & Immune suppression
      ctx.fillStyle = PAL.white;
      ctx.font = '800 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Hormon Kortisol: LONJAKAN TINGGI', mx, my + 65);

      ctx.fillStyle = PAL.yellow;
      ctx.font = '700 15px "JetBrains Mono", monospace';
      ctx.fillText('Merusak Sistem Imunitas & Jantung', mx, my + 95);
      ctx.restore();

    } else if (beat === 5) {
      // Beat 5: Modern Solitary Apartment & Glowing Smartphone
      drawKurzgesagtDuck(ctx, 240, floorY - 30, { scale: 1.4, pose: 'drowsy', t });

      // Giant Smartphone Screen glowing in the dark
      const px = 670, py = 740;
      ctx.save();
      // Phone Body
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = PAL.cyan;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(px - 140, py - 170, 280, 340, 26);
      ctx.fill(); ctx.stroke();

      // Screen Inner Light
      const sgrad = ctx.createLinearGradient(px, py - 150, px, py + 150);
      sgrad.addColorStop(0, '#1e1b4b');
      sgrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = sgrad;
      ctx.beginPath();
      ctx.roundRect(px - 125, py - 155, 250, 310, 18);
      ctx.fill();

      // Fake Social Notification bubbles floating on screen
      const notifs = [
        { user: '@social_bot', text: '❤️ 1.4k likes', y: py - 95, col: PAL.coral },
        { user: '@stream_now', text: '🔴 25.0k watching', y: py - 20, col: PAL.yellow },
        { user: '@status_app', text: '💬 0 pesan nyata', y: py + 55, col: PAL.cyan }
      ];

      notifs.forEach(n => {
        ctx.fillStyle = 'rgba(30, 27, 75, 0.85)';
        ctx.strokeStyle = n.col;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(px - 110, n.y - 22, 220, 52, 10);
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = PAL.white;
        ctx.font = '800 13px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(n.user, px - 95, n.y - 4);

        ctx.fillStyle = n.col;
        ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(n.text, px - 95, n.y + 16);
      });
      ctx.restore();

    } else if (beat === 6) {
      // Beat 6: Real Human Connection (Eye Contact & Laughter)
      // Two ducks facing each other warmly
      drawKurzgesagtDuck(ctx, 330, floorY - 30, { scale: 1.35, facing: 1, pose: 'celebrate', t });
      drawKurzgesagtDuck(ctx, 750, floorY - 30, { scale: 1.35, facing: -1, pose: 'curious', t });

      // Warm Campfire in Center
      const fx = 540, fy = floorY - 20;
      ctx.save();
      // Campfire Logs
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(fx - 45, fy); ctx.lineTo(fx + 45, fy - 15);
      ctx.moveTo(fx + 45, fy); ctx.lineTo(fx - 45, fy - 15);
      ctx.stroke();

      // Glowing Fire Flames
      const fpulse = 1.0 + 0.15 * Math.sin(t * 12);
      ctx.fillStyle = PAL.orange;
      ctx.beginPath();
      ctx.moveTo(fx - 35, fy - 15);
      ctx.quadraticCurveTo(fx - 20, fy - 90 * fpulse, fx, fy - 110 * fpulse);
      ctx.quadraticCurveTo(fx + 20, fy - 90 * fpulse, fx + 35, fy - 15);
      ctx.closePath();
      ctx.fill();

      // Inner yellow flame
      ctx.fillStyle = PAL.yellow;
      ctx.beginPath();
      ctx.moveTo(fx - 20, fy - 15);
      ctx.quadraticCurveTo(fx - 10, fy - 65 * fpulse, fx, fy - 75 * fpulse);
      ctx.quadraticCurveTo(fx + 10, fy - 65 * fpulse, fx + 20, fy - 15);
      ctx.closePath();
      ctx.fill();

      // Floating Oxytocin Love Molecules
      for (let h = 0; h < 4; h++) {
        const ox = fx - 70 + h * 45;
        const oy = fy - 140 - Math.sin(t * 3 + h) * 25;
        ctx.fillStyle = PAL.coral;
        ctx.font = '900 24px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('♥', ox, oy);
      }

      // Oxytocin Header Badge
      ctx.fillStyle = 'rgba(15, 14, 40, 0.9)';
      ctx.strokeStyle = PAL.yellow;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(380, 620, 320, 52, 14);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = PAL.yellow;
      ctx.font = '900 17px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('HORMON OKSITOSIN & IKATAN', 540, 653);
      ctx.restore();

    } else if (beat === 7) {
      // Beat 7: Group Clan Reunion (You Are Not Broken)
      // 3 Ducks standing together in solidarity
      drawKurzgesagtDuck(ctx, 290, floorY - 30, { scale: 1.3, facing: 1, pose: 'celebrate', t });
      drawKurzgesagtDuck(ctx, 540, floorY - 30, { scale: 1.45, facing: 1, pose: 'celebrate', t: t + 0.5 });
      drawKurzgesagtDuck(ctx, 790, floorY - 30, { scale: 1.3, facing: -1, pose: 'celebrate', t: t + 1.0 });

      // Golden Aurora Stardust in the Sky
      ctx.save();
      const aurX = 540, aurY = 660;
      const aurGrad = ctx.createRadialGradient(aurX, aurY, 20, aurX, aurY, 260);
      aurGrad.addColorStop(0, 'rgba(0, 242, 254, 0.25)');
      aurGrad.addColorStop(0.5, 'rgba(255, 230, 0, 0.15)');
      aurGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = aurGrad;
      ctx.beginPath();
      ctx.arc(aurX, aurY, 260, 0, Math.PI * 2);
      ctx.fill();

      // Sparkling Stars of Togetherness
      for (let s = 0; s < 8; s++) {
        const sx = aurX - 220 + s * 65;
        const sy = aurY + Math.sin(t * 4 + s) * 20;
        ctx.fillStyle = s % 2 === 0 ? PAL.yellow : PAL.cyan;
        ctx.beginPath();
        ctx.arc(sx, sy, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = PAL.white;
      ctx.font = '900 24px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TEMUKAN KLANMU & PULANGLAH', aurX, aurY - 40);

      ctx.fillStyle = PAL.yellow;
      ctx.font = '800 17px "JetBrains Mono", monospace';
      ctx.fillText('KESEPIAN BUKAN KESALAHAN PRIBADI', aurX, aurY - 5);
      ctx.restore();
    }
  });

  // 5. Header (Standard Kurzgesagt Top Banner)
  drawHeader(
    ctx,
    'BIOLOGI EVOLUSI & NEUROSAINS',
    'PARADOKS KESEPIAN',
    'Mengapa Otak Prasejarah Membenci Isolasi Sosial?'
  );

  // 6. Floating Educational Callout at y: 1485
  const callouts = [
    {
      start: C.hook?.start ?? 0,
      tag: 'NEUROSAINS NYERI',
      title: 'Nyeri Emosional Setara Fisik',
      desc: 'Otak memproses penolakan sosial di sirkuit nyeri yang sama.',
      stat: 'dACC',
      statSub: 'KORTEKS NYERI',
      col: PAL.coral
    },
    {
      start: C.purba?.start,
      tag: 'BIOLOGI EVOLUSI',
      title: 'Savana Pleistosen Afrika',
      desc: 'Sendirian di alam liar sama dengan vonis mati tanpa ampun.',
      stat: '100.000+',
      statSub: 'TAHUN EVOLUSI',
      col: PAL.yellow
    },
    {
      start: C.ancaman?.start,
      tag: 'EKOLOGI PREDATOR',
      title: 'Kelemahan Tanpa Kawanan',
      desc: 'Manusia purba tidak punya taring tajam, hanya kekuatan kerja sama.',
      stat: '0% KLAN',
      statSub: 'TARGET MUDAH',
      col: PAL.purple
    },
    {
      start: C.alarm?.start,
      tag: 'SISTEM DARURAT TUBUH',
      title: 'Sistem Alarm Biologis',
      desc: 'Kesepian adalah alarm lapar sosial agar kamu segera mencari suku.',
      stat: 'DARURAT',
      statSub: 'KEBUTUHAN DASAR',
      col: PAL.cyan
    },
    {
      start: C.bahaya?.start,
      tag: 'PATOLOGI MEDIS',
      title: 'Kortisol & Tekanan Darah',
      desc: 'Isolasi kronis setara bahaya merokok 15 batang setiap hari.',
      stat: '+26%',
      statSub: 'RISIKO KEMATIAN',
      col: PAL.coral
    },
    {
      start: C.modern?.start,
      tag: 'SOSIOLOGI MODERN',
      title: 'Kota Padat tapi Terasing',
      desc: 'Koneksi media sosial palsu tidak memuaskan kebutuhan otak purba.',
      stat: '60%+',
      statSub: 'MERASA KESEPIAN',
      col: PAL.purple
    },
    {
      start: C.solusi?.start,
      tag: 'BIOKIMIA IKATAN',
      title: 'Oksitosin & Kontak Nyata',
      desc: 'Hanya tatap mata dan obrolan tulus yang meredakan alarm stres.',
      stat: 'OKSITOSIN',
      statSub: 'HORMON IKATAN',
      col: PAL.yellow
    },
    {
      start: C.moral?.start,
      tag: 'FILOSOFI KEMANUSIAAN',
      title: 'Kamu Tidak Cacat atau Rusak',
      desc: 'Tubuhmu hanya mengingatkanmu untuk pulang dan saling merangkul.',
      stat: '100%',
      statSub: 'KLAN MANUSIA',
      col: PAL.cyan
    }
  ];

  const currentCallout = callouts[beat] || callouts[0];
  const calloutAlpha = pop(t, currentCallout.start, 0.4);

  drawCallout(ctx, 540, 1485, 960, 165, {
    tag: currentCallout.tag,
    title: currentCallout.title,
    desc: currentCallout.desc,
    stat: currentCallout.stat,
    statSub: currentCallout.statSub,
    col: currentCallout.col,
    a: calloutAlpha
  });
}

