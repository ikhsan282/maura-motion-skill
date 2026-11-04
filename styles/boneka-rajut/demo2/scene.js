// boneka-rajut demo2 — Kancil dan Barisan Buaya Sungai (10 shots)
// Stop-motion knitted amigurumi & stitched felt diorama fable:
// Si Kancil tricks a river of hungry knitted crocodiles into forming a living bridge so he can cross to the red apple tree!
import * as K from '../kit.js';
const { PAL, ease, clamp, lerp } = K;

export function createScene(AM) {
  const farHill  = K.hillLayer('kc-far',  { y0: 0, amp: 80, color: PAL.hillFar,  seed: 4, stitch: '#cde4b0', trees: 9 });
  const midHill  = K.hillLayer('kc-mid',  { y0: 0, amp: 58, color: PAL.hillMid,  seed: 5, stitch: '#def0b8', flowers: 16 });
  const bankTop  = K.hillLayer('kc-btop', { y0: 0, amp: 28, color: PAL.hillNear, seed: 6, stitch: '#e9f6c5', flowers: 20 });
  const bankLow  = K.hillLayer('kc-blow', { y0: 0, amp: 32, color: PAL.grass,    seed: 8, stitch: '#eff9d0', flowers: 24 });

  function backdrop(ctx, c, t, { sunset = 0, riverY = 930, riverH = 380 } = {}) {
    K.sky(ctx, { sunset });
    K.cam(ctx, c, 0.15);
    K.sun(ctx, 850, 250 + sunset * 140, { s: 0.9, t, color: sunset > 0.4 ? '#f29b38' : PAL.sun });
    K.cloud(ctx, 210 + ((t * 14) % 1400) - 200, 290, { s: 0.95, seed: 0 });
    K.cloud(ctx, 760 + ((t * 9) % 1400) - 200, 380, { s: 0.8, seed: 1 });
    K.cam(ctx, c, 0.35); K.drawLayer(ctx, farHill, 640);
    K.cam(ctx, c, 0.6);  K.drawLayer(ctx, midHill, 760);
    K.cam(ctx, c, 1);
    K.drawLayer(ctx, bankTop, 860);
    K.river(ctx, riverY, riverH, t);
    K.drawLayer(ctx, bankLow, riverY + riverH);
  }

  return {
    render(ctx, t) {
      const b = AM.beatIndex(t);
      const u = AM.beatProgress(t);
      const tQuant = Math.floor(t * 12) / 12; // subtle stop-motion 12fps feel for puppet wobble

      let flash = 0;
      for (let i = 1; i < 10; i++) flash = Math.max(flash, AM.Sub.pulse(t, AM.beats[i].start, 0.22) * 0.3);

      // ================================================================
      // SHOT 0 — Kancil walks hungrily along the left river bank
      // ================================================================
      if (b === 0) {
        const c = { x: lerp(460, 540, ease.inOut(u)), y: 980, z: lerp(1.0, 1.08, u), rot: 0 };
        backdrop(ctx, c, t);

        const tSungai = AM.wordTime(0, 'sungai', 0.72);
        const stopWalk = clamp((t - (tSungai - 0.3)) / 0.4);
        const kx = lerp(160, 340, ease.outCubic(clamp(u * 1.35)));

        // Far apple tree across the river on the right bank
        K.appleTree(ctx, 900, 880, { s: 0.78, t, apples: 6 });

        K.contactShadow(ctx, kx, 1320, 110, 0.5);
        const kc = K.kancil(ctx, {
          x: kx, y: 1320, s: 0.88, t: tQuant, face: 1,
          walk: stopWalk < 1 ? 10 : 0,
          look: 0.35, mood: stopWalk > 0.5 ? 'o' : 'frown', brows: 'sad',
          armL: 0.3, armR: stopWalk > 0.5 ? 1.1 : 0.3,
        });

        const pKancil = AM.Sub.appear(t, AM.wordTime(0, 'Kancil', 0.18), 0.35);
        K.signpost(ctx, 'SI KANCIL', kx - 120, 1340, { s: 0.85, pop: pKancil, t });

        const pLapar = AM.Sub.appear(t, AM.wordTime(0, 'keroncongan', 0.36), 0.3);
        if (pLapar > 0) {
          K.patch(ctx, 'LAPAR...', kc.head[0] - 20, kc.top[1] - 55, { size: 40, fill: PAL.cream, ink: PAL.red, s: pLapar });
        }

        const pSungai = AM.Sub.appear(t, tSungai, 0.35);
        if (pSungai > 0) {
          K.patch(ctx, 'SUNGAI DERAS!', 640, 1080, { size: 44, fill: PAL.river, ink: PAL.white, s: pSungai });
        }

        K.cam(ctx, { x: 540, y: 960, z: 1 }, 0);
        K.banner(ctx, 'KANCIL & BARISAN BUAYA', 540, 165, { t, size: 52, alpha: AM.Sub.Hold(t, 0.1, AM.beats[0].end - 0.2, 0.35) });
      }

      // ================================================================
      // SHOT 1 — Camera pans to the lush red apple tree across the wide river
      // ================================================================
      else if (b === 1) {
        const pan = ease.inOut(clamp(u * 1.2));
        const c = { x: lerp(520, 700, pan), y: lerp(960, 890, pan), z: lerp(1.05, 1.22, pan), rot: 0 };
        backdrop(ctx, c, t);

        K.appleTree(ctx, 860, 880, { s: 0.95, t, apples: 6 });

        K.contactShadow(ctx, 260, 1320, 105, 0.5);
        const kc = K.kancil(ctx, {
          x: 260, y: 1320, s: 0.85, t: tQuant, face: 1,
          look: 0.45, mood: 'smile', eyes: 'wide', armR: 1.45,
        });

        const pApel = AM.Sub.appear(t, AM.wordTime(1, 'apel', 0.25), 0.35);
        const pMerah = AM.Sub.appear(t, AM.wordTime(1, 'merah', 0.38), 0.35);
        if (pApel > 0) {
          K.patch(ctx, 'APEL MERAH MANIS!', 830, 480, { size: 42, fill: PAL.red, ink: PAL.white, s: pApel });
          K.heart(ctx, 720, 560, { s: 0.85 * pMerah, rot: -0.2 });
          K.heart(ctx, 960, 560, { s: 0.85 * pMerah, rot: 0.2 });
        }

        const pDalam = AM.Sub.appear(t, AM.wordTime(1, 'dalam', 0.65), 0.3);
        if (pDalam > 0) {
          K.drop(ctx, kc.head[0] - 65, kc.head[1] - 20, { s: 0.9 * pDalam });
          K.patch(ctx, 'TERLALU DALAM!', 520, 1110, { size: 38, fill: PAL.cream, ink: PAL.ink, s: pDalam });
        }
      }

      // ================================================================
      // SHOT 2 — Hungry crocodiles surface in the river; Kancil gets a clever idea!
      // ================================================================
      else if (b === 2) {
        const tBuaya = AM.wordTime(2, 'Buaya', 0.22);
        const tMenerkam = AM.wordTime(2, 'menerkam', 0.42);
        const tCerdik = AM.wordTime(2, 'cerdik', 0.72);
        const c = { x: 540, y: 1020, z: lerp(1.08, 1.16, u), rot: 0 };
        backdrop(ctx, c, t);

        const rise = ease.outBack(clamp((t - tBuaya) / 0.55), 1.8);
        const snap = AM.Sub.pulse(t, tMenerkam, 0.6);

        if (rise > 0.02) {
          K.crocodile(ctx, { x: 560, y: lerp(1180, 1050, rise), s: 0.88, t: tQuant, face: -1, open: 0.25 + snap * 0.65, seed: 1 });
          K.crocodile(ctx, { x: 780, y: lerp(1240, 1140, rise), s: 0.82, t: tQuant, face: -1, open: 0.2 + snap * 0.55, seed: 2 });
          K.signpost(ctx, 'BUAYA LAPAR', 760, 1290, { s: 0.8, pop: rise, t });
        }

        const idea = AM.Sub.appear(t, tCerdik, 0.35);
        const hopIdea = AM.Sub.pulse(t, tCerdik, 0.45) * 45;
        K.contactShadow(ctx, 250, 1310, 110, 0.5);
        const kc = K.kancil(ctx, {
          x: 250, y: 1310, s: 0.9, t: tQuant, face: 1, hop: hopIdea,
          look: 0.35, mood: idea > 0.3 ? 'sly' : 'o', brows: idea > 0.3 ? 'sly' : 'up',
          armR: idea > 0.3 ? 1.8 : 0.5,
        });

        if (idea > 0) {
          K.star(ctx, kc.top[0], kc.top[1] - 50, { s: 1.15 * idea, rot: t * 0.8 });
          K.patch(ctx, 'ADA AKAL CERDIK!', kc.head[0] + 40, kc.top[1] - 125, { size: 42, fill: PAL.sun, ink: PAL.ink, s: idea });
        }
      }

      // ================================================================
      // SHOT 3 — Close-up on Kancil wearing a paper/felt crown announcing the King's feast
      // ================================================================
      else if (b === 3) {
        const tRaja = AM.wordTime(3, 'Raja', 0.22);
        const tPesta = AM.wordTime(3, 'pesta', 0.42);
        const tHitung = AM.wordTime(3, 'menghitung', 0.72);
        const c = { x: 340, y: 1120, z: lerp(1.32, 1.42, ease.inOut(u)), rot: -0.015 };
        backdrop(ctx, c, t);

        const pRaja = AM.Sub.appear(t, tRaja, 0.35);
        K.contactShadow(ctx, 290, 1310, 115, 0.5);
        const kc = K.kancil(ctx, {
          x: 290, y: 1310, s: 0.98, t: tQuant, face: 1,
          look: 0.3, mood: 'grin', talk: 1, crown: pRaja,
          armL: 0.6, armR: 1.55 + Math.sin(t * 6) * 0.2,
        });

        // Listening crocodile head peeking from water on right
        K.crocodile(ctx, { x: 640, y: 1120, s: 0.85, t: tQuant, face: -1, open: 0.2, seed: 1 });

        const pPesta = AM.Sub.appear(t, tPesta, 0.35);
        if (pPesta > 0) {
          K.patch(ctx, 'UNDANGAN PESTA RAJA HUTAN!', 410, 860, { size: 38, fill: PAL.red, ink: PAL.white, s: pPesta });
        }
        const pHitung = AM.Sub.appear(t, tHitung, 0.35);
        if (pHitung > 0) {
          K.patch(ctx, 'AYO HITUNG SEMUA BUAYA!', 430, 955, { size: 36, fill: PAL.sun, ink: PAL.ink, s: pHitung });
        }
      }

      // ================================================================
      // SHOT 4 — Crocodile leader rejoices and summons all crocodile friends to surface
      // ================================================================
      else if (b === 4) {
        const tGembira = AM.wordTime(4, 'gembira', 0.38);
        const tTeman = AM.wordTime(4, 'teman-temannya', 0.62);
        const c = { x: 580, y: 1060, z: lerp(1.22, 1.08, ease.inOut(u)), rot: 0.01 };
        backdrop(ctx, c, t);

        K.contactShadow(ctx, 170, 1310, 100, 0.45);
        K.kancil(ctx, { x: 170, y: 1310, s: 0.82, t: tQuant, face: 1, look: 0.35, mood: 'sly', crown: 1 });

        // Leader croc talking & cheering
        const crLead = K.crocodile(ctx, {
          x: 520, y: 1030, s: 0.95, t: tQuant, face: -1,
          open: 0.45, talk: 1, seed: 1,
        });

        const pGembira = AM.Sub.appear(t, tGembira, 0.35);
        if (pGembira > 0) {
          K.heart(ctx, crLead.head[0] - 40, crLead.head[1] - 70, { s: 0.9 * pGembira, rot: -0.2 });
          K.patch(ctx, 'ASIK! MAKAN BESAR!', crLead.head[0] + 60, crLead.head[1] - 95, { size: 38, fill: PAL.cream, ink: PAL.ink, s: pGembira });
        }

        // More crocodiles popping up across the river
        const friends = [
          [380, 1150, 0.0],
          [690, 1130, 0.12],
          [830, 1050, 0.24],
          [920, 1170, 0.36],
        ];
        friends.forEach(([fx, fy, delay], idx) => {
          const pop = ease.outBack(clamp((t - (tTeman + delay)) / 0.45), 2.0);
          if (pop > 0.02) {
            K.crocodile(ctx, { x: fx, y: lerp(fy + 90, fy, pop), s: 0.8 * pop, t: tQuant, face: -1, open: 0.3, seed: idx + 3 });
          }
        });
      }

      // ================================================================
      // SHOT 5 — Overhead/wide view: 6 crocodiles line up into a living bridge across the river!
      // ================================================================
      else if (b === 5) {
        const tBaris = AM.wordTime(5, 'berbaris', 0.22);
        const tJembatan = AM.wordTime(5, 'jembatan', 0.72);
        const c = { x: 540, y: 980, z: lerp(1.05, 0.96, ease.inOut(u)), rot: 0 };
        backdrop(ctx, c, t, { riverY: 780, riverH: 600 });

        // Left & right bank ground patches so it reads as a bridge from left to right bank
        K.appleTree(ctx, 950, 760, { s: 0.82, t, apples: 6 });

        const alignU = ease.inOut(clamp((t - tBaris) / 1.1));
        for (let i = 0; i < 6; i++) {
          const targetX = 240 + i * 125;
          const targetY = 1090 - i * 32;
          const startX = targetX + (i % 2 ? 90 : -90);
          const startY = targetY + (i % 2 ? -80 : 80);
          const cx = lerp(startX, targetX, alignU);
          const cy = lerp(startY, targetY, alignU);
          K.crocodile(ctx, { x: cx, y: cy, s: 0.68, t: tQuant, face: 1, open: 0.1, seed: i + 1 });
        }

        K.contactShadow(ctx, 115, 1180, 95, 0.5);
        K.kancil(ctx, {
          x: 115, y: 1180, s: 0.8, t: tQuant, face: 1,
          look: 0.35, mood: 'smile', armR: 1.5, crown: 1,
        });

        const pJem = AM.Sub.appear(t, tJembatan, 0.35);
        if (pJem > 0) {
          K.patch(ctx, 'JEMBATAN HIDUP BUAYA!', 540, 620, { size: 46, fill: PAL.sun, ink: PAL.ink, s: pJem });
        }
      }

      // ================================================================
      // SHOT 6 — Kancil hops across Crocodiles 1, 2, 3! ("SATU! DUA! TIGA!")
      // ================================================================
      else if (b === 6) {
        const tSatu = AM.wordTime(6, 'Satu', 0.42);
        const tDua  = AM.wordTime(6, 'dua', 0.52);
        const tTiga = AM.wordTime(6, 'tiga', 0.62);

        const c = { x: lerp(380, 520, u), y: 1030, z: 1.15, rot: 0 };
        backdrop(ctx, c, t, { riverY: 840, riverH: 520 });

        const crocs = [
          [260, 1140, tSatu, 1],
          [460, 1110, tDua,  2],
          [660, 1080, tTiga, 3],
          [860, 1050, Infinity, null],
        ];
        crocs.forEach(([cx, cy, tHit, num], idx) => {
          const hitP = t >= tHit ? AM.Sub.pulse(t, tHit, 0.35) : 0;
          K.crocodile(ctx, {
            x: cx, y: cy + hitP * 18, s: 0.78, t: tQuant, face: 1,
            open: 0.08, badge: t >= tHit ? num : null, seed: idx + 1,
          });
        });

        // Kancil hopping arc from bank -> croc 1 -> croc 2 -> croc 3
        let kx = 110, ky = 1180, hopH = 0;
        if (t < tSatu) {
          const p = clamp((t - (tSatu - 0.45)) / 0.45);
          kx = lerp(110, 260, p); ky = lerp(1180, 1070, p); hopH = Math.sin(p * Math.PI) * 110;
        } else if (t < tDua) {
          const p = clamp((t - tSatu) / Math.max(0.25, tDua - tSatu));
          kx = lerp(260, 460, p); ky = lerp(1070, 1040, p); hopH = Math.sin(p * Math.PI) * 120;
        } else {
          const p = clamp((t - tDua) / Math.max(0.25, tTiga - tDua));
          kx = lerp(460, 660, p); ky = lerp(1040, 1010, p); hopH = Math.sin(p * Math.PI) * 120;
        }

        K.kancil(ctx, {
          x: kx, y: ky, s: 0.82, t: tQuant, face: 1, hop: hopH,
          look: 0.3, mood: 'grin', talk: 1, armL: 0.9, armR: 1.4, crown: 1,
        });

        K.cam(ctx, { x: 540, y: 960, z: 1 }, 0);
        const countStr = t >= tTiga ? 'HITUNGAN: 1 - 2 - 3!' : t >= tDua ? 'HITUNGAN: 1 - 2...' : t >= tSatu ? 'HITUNGAN: 1...' : 'MULAI MELOMPAT!';
        K.patch(ctx, countStr, 540, 220, { size: 50, fill: PAL.red, ink: PAL.white });
      }

      // ================================================================
      // SHOT 7 — Kancil hops across Crocodiles 4, 5, 6 and lands on the far right bank!
      // ================================================================
      else if (b === 7) {
        const tEmpat = AM.wordTime(7, 'Empat', 0.08);
        const tLima  = AM.wordTime(7, 'lima', 0.18);
        const tEnam  = AM.wordTime(7, 'enam', 0.28);
        const tSeb   = AM.wordTime(7, 'seberang', 0.78);

        const c = { x: lerp(520, 700, ease.inOut(u)), y: 960, z: 1.12, rot: 0 };
        backdrop(ctx, c, t, { riverY: 840, riverH: 520 });

        K.appleTree(ctx, 960, 830, { s: 0.92, t, apples: 6 });

        const crocs = [
          [280, 1110, tEmpat, 4],
          [480, 1060, tLima,  5],
          [680, 1010, tEnam,  6],
        ];
        crocs.forEach(([cx, cy, tHit, num], idx) => {
          const hitP = t >= tHit ? AM.Sub.pulse(t, tHit, 0.35) : 0;
          K.crocodile(ctx, {
            x: cx, y: cy + hitP * 18, s: 0.78, t: tQuant, face: 1,
            open: 0.08, badge: t >= tHit ? num : null, seed: idx + 4,
          });
        });

        let kx = 280, ky = 1040, hopH = 0;
        if (t < tLima) {
          const p = clamp((t - tEmpat) / Math.max(0.25, tLima - tEmpat));
          kx = lerp(280, 480, p); ky = lerp(1040, 990, p); hopH = Math.sin(p * Math.PI) * 115;
        } else if (t < tEnam + 0.45) {
          const p = clamp((t - tLima) / Math.max(0.25, tEnam - tLima));
          kx = lerp(480, 680, p); ky = lerp(990, 940, p); hopH = Math.sin(p * Math.PI) * 115;
        } else {
          const p = clamp((t - (tEnam + 0.45)) / 0.65);
          kx = lerp(680, 860, ease.outCubic(p)); ky = lerp(940, 855, p); hopH = Math.sin(p * Math.PI) * 130;
        }

        K.kancil(ctx, {
          x: kx, y: ky, s: 0.84, t: tQuant, face: 1, hop: hopH,
          look: 0.3, mood: 'grin', armL: 1.2, armR: 1.5, crown: 1,
        });

        const pSeb = AM.Sub.appear(t, tSeb, 0.35);
        if (pSeb > 0) {
          K.star(ctx, 860, 560, { s: 1.15 * pSeb, rot: t });
          K.patch(ctx, 'SAMPAI DI SEBERANG!', 740, 580, { size: 44, fill: PAL.sun, ink: PAL.ink, s: pSeb });
        }
      }

      // ================================================================
      // SHOT 8 — Kancil waves from the far bank and reveals there is no King's feast!
      // ================================================================
      else if (b === 8) {
        const tTerima = AM.wordTime(8, 'Terima', 0.32);
        const tBuah   = AM.wordTime(8, 'buah', 0.85);
        const c = { x: 660, y: 920, z: lerp(1.18, 1.26, u), rot: 0.01 };
        backdrop(ctx, c, t, { riverY: 880, riverH: 480 });

        K.appleTree(ctx, 940, 850, { s: 0.96, t, apples: 6 });

        // Baffled crocodiles looking up at Kancil
        K.crocodile(ctx, { x: 380, y: 1120, s: 0.82, t: tQuant, face: 1, open: 0.4, badge: 5, seed: 5 });
        K.crocodile(ctx, { x: 560, y: 1050, s: 0.85, t: tQuant, face: 1, open: 0.5, badge: 6, seed: 6 });

        K.contactShadow(ctx, 810, 865, 110, 0.5);
        const kc = K.kancil(ctx, {
          x: 810, y: 865, s: 0.92, t: tQuant, face: -1,
          hop: Math.abs(Math.sin(t * 5)) * 18,
          look: 0.35, mood: 'grin', eyes: 'happy', talk: 1, blush: 0.8,
          armL: 2.1 + Math.sin(t * 9) * 0.35, armR: 0.5,
        });

        const pTer = AM.Sub.appear(t, tTerima, 0.35);
        if (pTer > 0) {
          K.patch(ctx, 'TERIMA KASIH BUAYA!', kc.head[0] - 120, kc.top[1] - 60, { size: 38, fill: PAL.cream, ink: PAL.ink, s: pTer });
        }
        const pBuah = AM.Sub.appear(t, tBuah, 0.35);
        if (pBuah > 0) {
          K.patch(ctx, 'CUMA MAU PETIK APEL!', 560, 740, { size: 38, fill: PAL.red, ink: PAL.white, s: pBuah });
        }
      }

      // ================================================================
      // SHOT 9 — Golden sunset finale: Crocodiles fume in the river while Kancil enjoys red apples; Moral banner
      // ================================================================
      else {
        const tKesal  = AM.wordTime(9, 'kesal', 0.18);
        const tApel   = AM.wordTime(9, 'apel', 0.42);
        const tCerdik = AM.wordTime(9, 'cerdik', 0.68);
        const c = { x: 540, y: 940, z: lerp(1.08, 1.0, ease.inOut(u)), rot: 0 };
        backdrop(ctx, c, t, { sunset: clamp(u * 1.2), riverY: 900, riverH: 440 });

        K.appleTree(ctx, 900, 860, { s: 0.92, t, apples: 4 });

        // Angry/tricked crocodiles in the river
        const cr1 = K.crocodile(ctx, { x: 310, y: 1120, s: 0.85, t: tQuant, face: 1, open: 0.85, seed: 1 });
        const cr2 = K.crocodile(ctx, { x: 540, y: 1060, s: 0.88, t: tQuant, face: 1, open: 0.9, seed: 2 });
        const pKesal = AM.Sub.appear(t, tKesal, 0.35);
        if (pKesal > 0) {
          K.drop(ctx, cr1.head[0] - 40, cr1.head[1] - 50, { s: 0.95 * pKesal });
          K.patch(ctx, 'KITA TERTIPU!', cr2.head[0] - 40, cr2.head[1] - 80, { size: 38, fill: PAL.cream, ink: PAL.red, s: pKesal });
        }

        // Happy Kancil under the apple tree with hearts
        K.contactShadow(ctx, 810, 875, 110, 0.5);
        const kc = K.kancil(ctx, {
          x: 810, y: 875, s: 0.88, t: tQuant, face: -1,
          look: 0.3, mood: 'chew', eyes: 'happy', blush: 1, armL: 1.2, armR: 1.2,
        });
        const pApel = AM.Sub.appear(t, tApel, 0.35);
        if (pApel > 0) {
          K.heart(ctx, kc.head[0] - 60, kc.top[1] - 40, { s: 0.9 * pApel, rot: -0.2 });
          K.star(ctx, kc.head[0] + 60, kc.top[1] - 50, { s: 0.9 * pApel, rot: 0.2 });
        }

        // Moral banner
        K.cam(ctx, { x: 540, y: 960, z: 1 }, 0);
        const pMoral = AM.Sub.appear(t, tCerdik, 0.45);
        K.banner(ctx, 'CERDIK MENGALAHKAN KEKUATAN', 540, 180, { t, size: 46, fill: PAL.red, ink: PAL.white, alpha: pMoral, s: ease.outBack(pMoral) });
        if (pMoral > 0.1) {
          K.patch(ctx, 'TENANG & PENUH AKAL', 540, 1520, { size: 46, fill: PAL.cream, ink: PAL.ink, s: pMoral });
        }
      }

      K.finish(ctx, t, { flash });
    },
  };
}

