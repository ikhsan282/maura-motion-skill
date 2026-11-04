// boneka-rajut demo3 — Balap Lari Kelinci Sombong dan Kura-kura (10 shots)
// Stop-motion knitted amigurumi & stitched felt diorama fable:
// Boastful knitted Rabbit races patient knitted Turtle, officiated by Monkey & cheered by Kancil!
import * as K from '../kit.js';
const { PAL, ease, clamp, lerp } = K;

export function createScene(AM) {
  const farHill  = K.hillLayer('rb-far',  { y0: 0, amp: 85, color: PAL.hillFar,  seed: 10, stitch: '#cde4b0', trees: 10 });
  const midHill  = K.hillLayer('rb-mid',  { y0: 0, amp: 60, color: PAL.hillMid,  seed: 11, stitch: '#def0b8', flowers: 18 });
  const nearHill = K.hillLayer('rb-near', { y0: 0, amp: 34, color: PAL.hillNear, seed: 12, stitch: '#e9f6c5', flowers: 22 });
  const ground   = K.hillLayer('rb-gnd',  { y0: 0, amp: 24, color: PAL.grass,    seed: 14, stitch: '#eff9d0', flowers: 26 });

  function backdrop(ctx, c, t, { sunset = 0 } = {}) {
    K.sky(ctx, { sunset });
    K.cam(ctx, c, 0.15);
    K.sun(ctx, 840 - sunset * 280, 250 + sunset * 150, { s: 0.9, t, color: sunset > 0.35 ? '#f29b38' : PAL.sun });
    K.cloud(ctx, 220 + ((t * 15) % 1400) - 200, 310, { s: 0.95, seed: 0 });
    K.cloud(ctx, 780 + ((t * 9) % 1400) - 200, 400, { s: 0.8, seed: 1 });
    K.cam(ctx, c, 0.35); K.drawLayer(ctx, farHill, 680);
    K.cam(ctx, c, 0.6);  K.drawLayer(ctx, midHill, 830);
    K.cam(ctx, c, 0.85); K.drawLayer(ctx, nearHill, 1020);
    K.cam(ctx, c, 1);    K.drawLayer(ctx, ground, 1210);
    // Stitched dirt race track ribbon along the ground
    K.runStitch(ctx, (g) => { g.beginPath(); g.moveTo(-600, 1265); g.lineTo(1800, 1265); }, { color: '#e8d3ad', len: 22, gap: 14, w: 5 });
    K.runStitch(ctx, (g) => { g.beginPath(); g.moveTo(-600, 1385); g.lineTo(1800, 1385); }, { color: '#e8d3ad', len: 22, gap: 14, w: 5 });
  }

  return {
    render(ctx, t) {
      const b = AM.beatIndex(t);
      const u = AM.beatProgress(t);
      const tQuant = Math.floor(t * 12) / 12;

      let flash = 0;
      for (let i = 1; i < 10; i++) flash = Math.max(flash, AM.Sub.pulse(t, AM.beats[i].start, 0.22) * 0.3);

      // ================================================================
      // SHOT 0 — Boastful Rabbit hops circles around patient Turtle
      // ================================================================
      if (b === 0) {
        const c = { x: 540, y: 1020, z: lerp(1.02, 1.1, ease.inOut(u)), rot: 0 };
        backdrop(ctx, c, t);

        const tKelinci = AM.wordTime(0, 'Kelinci', 0.14);
        const tCepat   = AM.wordTime(0, 'cepat', 0.38);
        const tKura    = AM.wordTime(0, 'Kura-kura', 0.62);

        // Patient turtle walking slowly on left
        const tx = lerp(220, 310, u);
        K.contactShadow(ctx, tx, 1335, 160, 0.5);
        const tk = K.turtle(ctx, {
          x: tx, y: 1335, s: 0.86, t: tQuant, face: 1,
          walk: 5, look: 0.3, mood: 'smile',
        });

        // Show-off rabbit hopping energetically on right
        const rx = 740 + Math.sin(t * 5) * 45;
        const rHop = Math.abs(Math.sin(t * 7)) * 55;
        K.contactShadow(ctx, rx, 1325, 115, 0.5 * (1 - rHop / 180));
        const rb = K.rabbit(ctx, {
          x: rx, y: 1325, s: 0.9, t: tQuant, face: -1, hop: rHop,
          walk: 14, look: 0.35, mood: 'grin', brows: 'sly', talk: 1,
          armL: 1.5, armR: 0.8,
        });

        K.signpost(ctx, 'SI KELINCI', 880, 1250, { s: 0.85, pop: AM.Sub.appear(t, tKelinci, 0.35), t });
        K.signpost(ctx, 'SI KURA-KURA', 180, 1250, { s: 0.85, pop: AM.Sub.appear(t, tKura, 0.35), t });

        const pCepat = AM.Sub.appear(t, tCepat, 0.35);
        if (pCepat > 0) {
          K.patch(ctx, 'AKU PALING CEPAT!', rb.head[0] - 40, rb.top[1] - 55, { size: 38, fill: PAL.sun, ink: PAL.ink, s: pCepat });
        }

        K.cam(ctx, { x: 540, y: 960, z: 1 }, 0);
        K.banner(ctx, 'KELINCI & KURA-KURA', 540, 165, { t, size: 56, alpha: AM.Sub.Hold(t, 0.1, AM.beats[0].end - 0.2, 0.35) });
      }

      // ================================================================
      // SHOT 1 — Turtle calmly challenges Rabbit to race to the distant apple tree
      // ================================================================
      else if (b === 1) {
        const tSabar   = AM.wordTime(1, 'sabar', 0.25);
        const tTantang = AM.wordTime(1, 'menantang', 0.42);
        const tApel    = AM.wordTime(1, 'apel', 0.72);

        const c = { x: lerp(420, 540, ease.inOut(u)), y: 1040, z: 1.18, rot: -0.01 };
        backdrop(ctx, c, t);

        // Distant apple tree finish goal on the far right hill
        K.appleTree(ctx, 980, 1020, { s: 0.62, t, apples: 6 });

        K.contactShadow(ctx, 320, 1335, 165, 0.5);
        const tk = K.turtle(ctx, {
          x: 320, y: 1335, s: 0.94, t: tQuant, face: 1,
          neck: 0.45, look: 0.35, mood: 'smile', talk: 1,
        });

        K.contactShadow(ctx, 700, 1325, 115, 0.5);
        const rb = K.rabbit(ctx, {
          x: 700, y: 1325, s: 0.9, t: tQuant, face: -1,
          look: 0.3, mood: 'sly', brows: 'sly', armL: 0.9, armR: 0.9,
        });

        const pTantang = AM.Sub.appear(t, tTantang, 0.35);
        if (pTantang > 0) {
          K.patch(ctx, 'AYO ADU LARI!', tk.head[0] + 10, tk.top[1] - 55, { size: 42, fill: PAL.cream, ink: PAL.ink, s: pTantang });
        }

        const pApel = AM.Sub.appear(t, tApel, 0.35);
        if (pApel > 0) {
          K.patch(ctx, 'GARIS AKHIR: POHON APEL', 830, 680, { size: 34, fill: PAL.red, ink: PAL.white, s: pApel });
        }
      }

      // ================================================================
      // SHOT 2 — Monkey referee waves the start flag; Rabbit rockets off!
      // ================================================================
      else if (b === 2) {
        const tMonyet  = AM.wordTime(2, 'Monyet', 0.08);
        const tWasit   = AM.wordTime(2, 'wasit', 0.22);
        const tMelesat = AM.wordTime(2, 'melesat', 0.62);

        const c = { x: 540, y: 1030, z: 1.06, rot: 0 };
        backdrop(ctx, c, t);

        // Start line signpost
        K.signpost(ctx, 'GARIS AWAL', 360, 1240, { s: 0.9, pop: 1, t });

        // Monkey referee waving start arm
        K.contactShadow(ctx, 510, 1230, 110, 0.45);
        const mk = K.monkey(ctx, {
          x: 510, y: 1230, s: 0.78, t: tQuant,
          look: 0.2, mood: 'grin', talk: t < tMelesat ? 1 : 0,
          armL: 0.4, armR: t >= tMelesat - 0.15 ? 0.5 : 2.5,
        });

        const dashU = ease.inCubic(clamp((t - (tMelesat - 0.1)) / 0.85));
        const rx = lerp(310, 1280, dashU);
        const rHop = dashU > 0 && dashU < 1 ? Math.abs(Math.sin(t * 18)) * 75 : 0;

        // Turtle starting steadily
        const tx = lerp(210, 340, clamp((t - (tMelesat - 0.1)) / 1.8));
        K.contactShadow(ctx, tx, 1355, 155, 0.5);
        K.turtle(ctx, { x: tx, y: 1355, s: 0.84, t: tQuant, face: 1, walk: t >= tMelesat ? 7 : 0, mood: 'smile' });

        // Rabbit zooming right
        K.contactShadow(ctx, rx, 1310, 110, 0.45);
        K.rabbit(ctx, {
          x: rx, y: 1310, s: 0.88, t: tQuant, face: 1, hop: rHop,
          walk: dashU > 0 ? 22 : 0, tilt: dashU > 0 ? 0.22 : 0, earDroop: dashU > 0 ? -0.4 : 0,
          look: 0.4, mood: 'grin', armL: 1.4, armR: 1.4,
        });

        // Felt dust puffs behind Rabbit
        if (dashU > 0.05) {
          for (let k = 0; k < 4; k++) {
            const px = 340 + k * 140;
            const pa = clamp(1 - Math.abs(dashU - (0.15 + k * 0.18)) * 3.5);
            if (pa > 0) K.cloud(ctx, px, 1290, { s: 0.38 * pa, seed: k, alpha: pa });
          }
        }

        const pWasit = AM.Sub.appear(t, tWasit, 0.35);
        if (pWasit > 0) {
          K.patch(ctx, 'SATU... DUA... MULAI!', mk.head[0], mk.top[1] - 55, { size: 38, fill: PAL.sun, ink: PAL.ink, s: pWasit });
        }
        const pMel = AM.Sub.appear(t, tMelesat, 0.3);
        if (pMel > 0) {
          K.patch(ctx, 'WUZZZ! MELESAT!', 760, 960, { size: 44, fill: PAL.red, ink: PAL.white, s: pMel });
        }
      }

      // ================================================================
      // SHOT 3 — Tracking close-up of Turtle stepping steadily with focus
      // ================================================================
      else if (b === 3) {
        const tMelangkah = AM.wordTime(3, 'melangkah', 0.22);
        const tTenang    = AM.wordTime(3, 'tenang', 0.45);
        const tLurus     = AM.wordTime(3, 'lurus', 0.78);

        const c = { x: lerp(420, 560, u), y: 1120, z: 1.28, rot: 0 };
        backdrop(ctx, c, t);

        const tx = lerp(340, 560, u);
        K.contactShadow(ctx, tx, 1335, 165, 0.5);
        const tk = K.turtle(ctx, {
          x: tx, y: 1335, s: 0.96, t: tQuant, face: 1,
          walk: 8, neck: 0.35, look: 0.4, mood: 'smile',
        });

        const pTen = AM.Sub.appear(t, tTenang, 0.35);
        if (pTen > 0) {
          K.patch(ctx, 'SABAR & TENANG', tk.head[0] - 40, tk.top[1] - 55, { size: 40, fill: PAL.cream, ink: PAL.ink, s: pTen });
        }
        const pLur = AM.Sub.appear(t, tLurus, 0.35);
        if (pLur > 0) {
          K.star(ctx, tk.head[0] + 95, tk.head[1] - 60, { s: 0.9 * pLur, rot: t });
          K.patch(ctx, 'FOKUS KE GARIS AKHIR!', tk.head[0] - 10, tk.top[1] - 140, { size: 36, fill: PAL.sun, ink: PAL.ink, s: pLur });
        }
      }

      // ================================================================
      // SHOT 4 — Halfway along, Rabbit looks back, sees nobody, and munches a knitted carrot
      // ================================================================
      else if (b === 4) {
        const tMenoleh  = AM.wordTime(4, 'menoleh', 0.18);
        const tBerhenti = AM.wordTime(4, 'berhenti', 0.58);
        const tWortel   = AM.wordTime(4, 'wortel', 0.75);

        const c = { x: 540, y: 1040, z: lerp(1.12, 1.22, ease.inOut(u)), rot: 0 };
        backdrop(ctx, c, t);

        // Shade tree on the right
        K.appleTree(ctx, 790, 1230, { s: 0.85, t, apples: 0 });

        const eating = t >= tBerhenti;
        K.contactShadow(ctx, 560, 1320, 115, 0.5);
        const rb = K.rabbit(ctx, {
          x: 560, y: 1320, s: 0.94, t: tQuant,
          face: eating ? 1 : -1,
          look: 0.35, mood: eating ? 'chew' : 'sly', brows: 'sly',
          armL: eating ? 1.35 : 0.4, armR: eating ? 1.35 : 1.6,
        });

        const pWortel = AM.Sub.appear(t, tWortel - 0.2, 0.35);
        if (pWortel > 0) {
          K.carrot(ctx, rb.handR[0] + 15, rb.handR[1] - 10, { rot: -0.5 + Math.sin(t * 10) * 0.1, s: 1.05 * pWortel });
          K.patch(ctx, 'MAKAN WORTEL DULU AH~', 540, 860, { size: 40, fill: PAL.cream, ink: PAL.ink, s: pWortel });
        } else {
          const pNoleh = AM.Sub.appear(t, tMenoleh, 0.35);
          K.patch(ctx, 'KURA-KURA MASIH JAUH!', 440, 880, { size: 38, fill: PAL.sun, ink: PAL.ink, s: pNoleh });
        }
      }

      // ================================================================
      // SHOT 5 — Full-bellied Rabbit falls fast asleep under the shady tree ("Zzz...")
      // ================================================================
      else if (b === 5) {
        const tKenyang  = AM.wordTime(5, 'kenyang', 0.18);
        const tTertidur = AM.wordTime(5, 'tertidur', 0.72);

        const c = { x: 600, y: 1060, z: lerp(1.18, 1.28, ease.inOut(u)), rot: 0.015 };
        backdrop(ctx, c, t);

        K.appleTree(ctx, 740, 1230, { s: 0.92, t, apples: 0 });

        // Sleeping rabbit leaning back against the tree trunk with closed eyes & drooping ears
        K.contactShadow(ctx, 640, 1330, 125, 0.5);
        const rb = K.rabbit(ctx, {
          x: 640, y: 1330, s: 0.94, t: tQuant, face: -1,
          tilt: 0.18, headTilt: 0.22, earDroop: 0.65, wob: 0.3,
          look: -0.1, eyes: 'closed', mood: 'o', blush: 0.7,
          armL: 0.2, armR: 0.2,
        });

        // Discarded carrot top on the grass
        K.carrot(ctx, 480, 1355, { rot: 1.35, s: 0.75 });

        const pTidur = AM.Sub.appear(t, tTertidur - 0.3, 0.4);
        if (pTidur > 0) {
          const zFloat = (t * 0.8) % 1;
          K.patch(ctx, 'Zzz...', rb.head[0] - 80, rb.top[1] - 30 - zFloat * 50, { size: 44, fill: PAL.cream, ink: PAL.ink, s: pTidur });
          K.patch(ctx, 'TERTIDUR PULAS!', 460, 880, { size: 40, fill: PAL.sun, ink: PAL.ink, s: pTidur });
        }
      }

      // ================================================================
      // SHOT 6 — Afternoon sun: Turtle marches right past the snoring Rabbit!
      // ================================================================
      else if (b === 6) {
        const tBarat    = AM.wordTime(6, 'barat', 0.22);
        const tMenyusul = AM.wordTime(6, 'menyusul', 0.58);
        const tMelewati = AM.wordTime(6, 'melewati', 0.72);

        const c = { x: lerp(480, 620, ease.inOut(u)), y: 1020, z: 1.08, rot: 0 };
        backdrop(ctx, c, t, { sunset: lerp(0.1, 0.45, u) });

        K.appleTree(ctx, 620, 1220, { s: 0.88, t, apples: 0 });

        // Sleeping Rabbit in mid-ground under the tree
        K.contactShadow(ctx, 540, 1255, 115, 0.45);
        const rb = K.rabbit(ctx, {
          x: 540, y: 1255, s: 0.84, t: tQuant, face: -1,
          tilt: 0.2, headTilt: 0.22, earDroop: 0.7, wob: 0.25,
          eyes: 'closed', mood: 'o',
        });
        K.patch(ctx, 'Zzz', rb.head[0] - 60, rb.top[1] - 35, { size: 34, fill: PAL.cream, ink: PAL.ink });

        // Determined Turtle marching from left (x=180) past Rabbit (x=540) to right (x=880)!
        const tx = lerp(180, 880, ease.inOut(u));
        K.contactShadow(ctx, tx, 1365, 165, 0.5);
        const tk = K.turtle(ctx, {
          x: tx, y: 1365, s: 0.9, t: tQuant, face: 1,
          walk: 9, neck: 0.4, look: 0.35, mood: 'smile',
        });

        const pLewat = AM.Sub.appear(t, tMenyusul, 0.35);
        if (pLewat > 0) {
          K.star(ctx, tk.head[0], tk.top[1] - 40, { s: 1.0 * pLewat, rot: t });
          K.patch(ctx, 'MENYUSUL TANPA HENTI!', 540, 760, { size: 44, fill: PAL.red, ink: PAL.white, s: pLewat });
        }
      }

      // ================================================================
      // SHOT 7 — Rabbit wakes up in shock seeing Turtle right at the finish line!
      // ================================================================
      else if (b === 7) {
        const tBangun = AM.wordTime(7, 'terbangun', 0.14);
        const tKaget  = AM.wordTime(7, 'terkejut', 0.35);
        const tAkhir  = AM.wordTime(7, 'akhir', 0.75);

        const c = { x: lerp(420, 560, ease.inOut(u)), y: 1030, z: 1.12, rot: -0.015 };
        backdrop(ctx, c, t, { sunset: 0.55 });

        // Finish line apple tree & signpost on the right
        K.appleTree(ctx, 940, 1210, { s: 0.85, t, apples: 6 });
        K.signpost(ctx, 'GARIS AKHIR', 820, 1250, { s: 0.85, pop: 1, t });

        // Turtle right near the finish line!
        const tx = lerp(710, 790, u);
        K.contactShadow(ctx, tx, 1340, 155, 0.5);
        K.turtle(ctx, { x: tx, y: 1340, s: 0.84, t: tQuant, face: 1, walk: 8, neck: 0.45, mood: 'grin' });

        // Shocked Rabbit jumping up on the left
        const shockHop = AM.Sub.pulse(t, tKaget, 0.5) * 85;
        K.contactShadow(ctx, 260, 1330, 115, 0.5);
        const rb = K.rabbit(ctx, {
          x: 260, y: 1330, s: 0.94, t: tQuant, face: 1, hop: shockHop,
          look: 0.45, eyes: 'wide', brows: 'up', mood: 'ouch',
          armL: 2.2, armR: 2.2, earDroop: -0.35,
        });

        const pKaget = AM.Sub.appear(t, tKaget, 0.3);
        if (pKaget > 0) {
          K.drop(ctx, rb.head[0] - 75, rb.head[1] - 40, { s: 1.0 * pKaget });
          K.drop(ctx, rb.head[0] + 75, rb.head[1] - 40, { s: 1.0 * pKaget });
          K.patch(ctx, 'HAH?! SUDAH HAMPIR SAMPAI!', rb.head[0] + 110, rb.top[1] - 60, { size: 38, fill: PAL.sun, ink: PAL.ink, s: pKaget });
        }
      }

      // ================================================================
      // SHOT 8 — Turtle crosses the finish line first! Monkey & Kancil cheer!
      // ================================================================
      else if (b === 8) {
        const tTerlambat = AM.wordTime(8, 'terlambat', 0.35);
        const tMenembus  = AM.wordTime(8, 'menembus', 0.55);
        const tGembira   = AM.wordTime(8, 'gembira', 0.78);

        const c = { x: 600, y: 1020, z: lerp(1.06, 1.15, ease.inOut(u)), rot: 0 };
        backdrop(ctx, c, t, { sunset: 0.7 });

        K.appleTree(ctx, 940, 1200, { s: 0.9, t, apples: 6 });
        K.signpost(ctx, 'GARIS AKHIR', 680, 1230, { s: 0.9, pop: 1, t });

        // Cheering Monkey & Kancil behind the finish line
        const cheerHop = Math.abs(Math.sin(t * 7)) * 35;
        K.contactShadow(ctx, 820, 1250, 105, 0.45);
        K.monkey(ctx, { x: 820, y: 1250, s: 0.76, t: tQuant, hop: cheerHop, mood: 'grin', eyes: 'happy', armL: 2.3, armR: 2.3 });
        K.contactShadow(ctx, 960, 1280, 105, 0.45);
        K.kancil(ctx, { x: 960, y: 1280, s: 0.78, t: tQuant, face: -1, hop: cheerHop * 0.8, mood: 'grin', eyes: 'happy', armL: 2.1, armR: 2.1 });

        // Winning Turtle crossing the finish line with joy!
        const winHop = t >= tMenembus ? Math.abs(Math.sin(t * 6)) * 28 : 0;
        const tx = lerp(610, 720, ease.outCubic(clamp(u * 1.3)));
        K.contactShadow(ctx, tx, 1350, 165, 0.5);
        const tk = K.turtle(ctx, {
          x: tx, y: 1350, s: 0.92, t: tQuant, face: 1, hop: winHop,
          walk: t < tMenembus ? 9 : 0, neck: 0.5, mood: 'grin', eyes: 'happy', blush: 1,
        });

        // Panting Rabbit arriving too late on the left
        const rx = lerp(140, 420, ease.outCubic(clamp(u * 1.2)));
        K.contactShadow(ctx, rx, 1340, 115, 0.5);
        const rb = K.rabbit(ctx, {
          x: rx, y: 1340, s: 0.88, t: tQuant, face: 1,
          walk: u < 0.75 ? 18 : 0, tilt: 0.25, earDroop: 0.5,
          mood: 'frown', brows: 'sad',
        });
        K.drop(ctx, rb.head[0] - 50, rb.head[1] - 20, { s: 0.9 });

        const pWin = AM.Sub.appear(t, tMenembus, 0.35);
        if (pWin > 0) {
          K.star(ctx, tk.head[0] - 40, tk.top[1] - 55, { s: 1.15 * pWin, rot: t });
          K.heart(ctx, tk.head[0] + 60, tk.top[1] - 65, { s: 1.0 * pWin, rot: 0.2 });
          K.patch(ctx, 'PEMENANG: SI KURA-KURA!', 580, 740, { size: 46, fill: PAL.sun, ink: PAL.ink, s: pWin });
        }
      }

      // ================================================================
      // SHOT 9 — Sunset moral finale: Rabbit apologizes, Turtle shares friendship, Moral banner
      // ================================================================
      else {
        const tMalu  = AM.wordTime(9, 'malu', 0.16);
        const tMaaf  = AM.wordTime(9, 'maaf', 0.32);
        const tTekun = AM.wordTime(9, 'Ketekunan', 0.58);

        const c = { x: 540, y: 1020, z: lerp(1.12, 1.0, ease.inOut(u)), rot: 0 };
        backdrop(ctx, c, t, { sunset: 0.9 });

        K.appleTree(ctx, 880, 1210, { s: 0.88, t, apples: 6 });

        // Humble Rabbit bowing head apologetically on left
        K.contactShadow(ctx, 340, 1335, 115, 0.5);
        const rb = K.rabbit(ctx, {
          x: 340, y: 1335, s: 0.9, t: tQuant, face: 1,
          headTilt: 0.22, earDroop: 0.65, look: 0.3,
          mood: t >= tTekun ? 'smile' : 'frown', brows: 'sad', blush: 0.9,
          armL: 0.4, armR: 1.1,
        });

        // Kind Turtle smiling warmly on right
        K.contactShadow(ctx, 680, 1345, 165, 0.5);
        const tk = K.turtle(ctx, {
          x: 680, y: 1345, s: 0.92, t: tQuant, face: -1,
          neck: 0.4, look: 0.35, mood: 'grin', eyes: 'happy', blush: 1,
        });

        const pMaaf = AM.Sub.appear(t, tMaaf, 0.35);
        if (pMaaf > 0) {
          K.heart(ctx, 510, 1060, { s: 1.1 * pMaaf, rot: Math.sin(t * 2) * 0.1 });
          K.patch(ctx, 'MAAFKAN AKU YA...', rb.head[0] + 10, rb.top[1] - 45, { size: 36, fill: PAL.cream, ink: PAL.ink, s: pMaaf });
        }

        // Moral banner
        K.cam(ctx, { x: 540, y: 960, z: 1 }, 0);
        const pMoral = AM.Sub.appear(t, tTekun, 0.45);
        K.banner(ctx, 'KETEKUNAN MENGALAHKAN KESOMBONGAN', 540, 180, { t, size: 42, fill: PAL.red, ink: PAL.white, alpha: pMoral, s: ease.outBack(pMoral) });
        if (pMoral > 0.1) {
          K.patch(ctx, 'RAJIN & KONSISTEN PASTI SAMPAI', 540, 1520, { size: 42, fill: PAL.cream, ink: PAL.ink, s: pMoral });
        }
      }

      K.finish(ctx, t, { flash });
    },
  };
}

