// dunia-blok demo2 — Letusan Gunung Krakatau 1883 & Lahirnya Anak Krakatau (10 shots)
// Three.js voxel sea & volcanic island with 3 peaks (Perboewatan, Danan, Rakata),
// passing voxel ships, 1883 cataclysmic block explosion, tsunami wave blocks, and Anak Krakatau rising block-by-block.
import {
  THREE, stage, shootCam, orbit, toScreen, mat, vbox, Blocks,
  voxTree, voxShip, skyDome, setSky, mix, cubeBurst,
  pixTitle, pixPanel, pixArrow, finish, ease, clamp, lerp, hrand,
} from '../kit.js';

export function createScene(AM) {
  const S = stage(AM); const { scene, sun, amb } = S;
  const sky = skyDome(scene);

  // ---- Sunda Strait Ocean base ----
  const sea = vbox(110, 2, 110, 'water', { cast: false });
  sea.position.set(0, -1, 0);
  scene.add(sea);

  // Distant coastal edges (Banten on +x, Lampung on -x)
  const bantenCoast = new THREE.Group();
  const bSand = vbox(18, 1.2, 50, 'sand'); bSand.position.set(32, 0.4, 0);
  const bGrass = vbox(16, 2.0, 50, 'grass'); bGrass.position.set(36, 1.2, 0);
  bantenCoast.add(bSand, bGrass);
  for (let i = 0; i < 8; i++) bantenCoast.add(voxTree(30 + (i % 3) * 3, 2.2, -16 + i * 4.5, i + 10));
  scene.add(bantenCoast);

  // ---- Old Krakatau Island (3 peaks: Perboewatan z=-7, Danan z=0, Rakata z=+7) ----
  // Rakata (south peak, z=+7) survives; Perboewatan & Danan collapse in shot 4!
  const rakataGroup = new THREE.Group();
  const rBeach = vbox(16, 1, 14, 'sand'); rBeach.position.set(0, 0.5, 7); rakataGroup.add(rBeach);
  for (let y = 0; y < 11; y++) {
    const w = Math.max(2, 13 - y * 1.05);
    const tier = vbox(w, 1, w, y < 3 ? 'grass' : y < 8 ? 'rock' : 'andesitDark');
    tier.position.set(0, 1 + y + 0.5, 7 + y * 0.15);
    rakataGroup.add(tier);
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 1.2 - 0.6;
    rakataGroup.add(voxTree(Math.cos(a) * 6, 2, 7 + Math.sin(a) * 5, i));
  }
  scene.add(rakataGroup);

  // Collapsing northern/central peaks (Perboewatan & Danan) built with instanced Blocks so they can drop in or blast apart!
  const northBlocks = new Blocks({ drop: 7, dur: 0.4 });
  for (let y = 0; y < 9; y++) {
    const rD = Math.max(1, Math.round(5.5 - y * 0.55));
    for (let x = -rD; x <= rD; x++) for (let z = -rD; z <= rD; z++) {
      if (x * x + z * z > (rD + 0.3) * (rD + 0.3)) continue;
      const type = y === 0 ? 'sand' : y < 3 ? 'grass' : y < 7 ? 'rock' : 'lava';
      northBlocks.add(x, y + 0.5, z - 0.5, type, -1);
    }
  }
  for (let y = 0; y < 7; y++) {
    const rP = Math.max(1, Math.round(4.5 - y * 0.55));
    for (let x = -rP; x <= rP; x++) for (let z = -rP; z <= rP; z++) {
      if (x * x + z * z > (rP + 0.3) * (rP + 0.3)) continue;
      const type = y === 0 ? 'sand' : y < 2 ? 'grass' : y < 5 ? 'rock' : 'lava';
      northBlocks.add(x, y + 0.5, z - 7.5, type, -1);
    }
  }
  northBlocks.build(scene);

  // Flying ejecta / lava / ash blocks for eruptions (shots 2, 3, 4)
  const ejectaGroup = new THREE.Group();
  const ejectaList = [];
  for (let i = 0; i < 95; i++) {
    const isLava = i % 3 === 0;
    const sz = 0.6 + hrand(i, 1) * 0.9;
    const m = vbox(sz, sz, sz, isLava ? 'lava' : i % 2 ? 'ash' : 'rock', { cast: false });
    if (isLava) m.material = mat('lava', 'side', { emissive: '#ff5500' });
    ejectaGroup.add(m);
    const ang = hrand(i, 2) * Math.PI * 2;
    const spd = 4 + hrand(i, 3) * 14;
    const vy = 10 + hrand(i, 4) * 16;
    const z0 = i % 2 === 0 ? -7.5 : -0.5;
    ejectaList.push({ m, ang, spd, vy, z0, phase: hrand(i, 5) });
  }
  scene.add(ejectaGroup);

  // Plume cloud column (stacked ash/lava voxel rings rising above crater)
  const plumeGroup = new THREE.Group();
  const plumeTiers = [];
  for (let k = 0; k < 10; k++) {
    const w = 3 + k * 1.35;
    const p = vbox(w, 1.8, w, k < 2 ? 'lava' : 'ash', { cast: false });
    if (k < 2) p.material = mat('lava', 'side', { emissive: '#ff4400' });
    plumeGroup.add(p);
    plumeTiers.push({ m: p, k, w });
  }
  scene.add(plumeGroup);

  // Voxel ships sailing through Sunda Strait
  const ship1 = voxShip(-14, 0, -4, { s: 0.95 });
  const ship2 = voxShip(13, 0, 5, { s: 0.8 });
  scene.add(ship1, ship2);

  // Tsunami wave wall (tiered water & snow foam blocks)
  const waveGroup = new THREE.Group();
  for (let z = -18; z <= 18; z += 3) {
    const wBase = vbox(3.2, 4.5, 2.8, 'water'); wBase.position.set(0, 2.2, z);
    const wMid = vbox(2.4, 3.5, 2.8, 'water'); wMid.position.set(-0.6, 5.5, z);
    const wCrest = vbox(2.0, 1.4, 2.8, 'snow'); wCrest.position.set(0.4, 7.6, z);
    waveGroup.add(wBase, wMid, wCrest);
  }
  scene.add(waveGroup);

  // Shockwave voxel ring for Shot 5 (sound heard 4,800 km away)
  const ringGroup = new THREE.Group();
  for (let i = 0; i < 32; i++) {
    const a = (i / 32) * Math.PI * 2;
    const seg = vbox(2.2, 0.9, 1.2, i % 2 ? 'snow' : 'gold', { cast: false });
    seg.position.set(Math.cos(a) * 10, 1.2, Math.sin(a) * 10);
    seg.rotation.y = -a;
    ringGroup.add(seg);
  }
  scene.add(ringGroup);

  // Anak Krakatau rising block-by-block in Shot 9!
  const anakBlocks = new Blocks({ drop: 8, dur: 0.45 });
  const tAnak0 = AM.beats[9].start;
  const durAnak = AM.beats[9].dur;
  let anakIdx = 0;
  for (let y = 0; y < 8; y++) {
    const rA = Math.max(1, Math.round(5.0 - y * 0.55));
    for (let x = -rA; x <= rA; x++) for (let z = -rA; z <= rA; z++) {
      if (x * x + z * z > (rA + 0.25) * (rA + 0.25)) continue;
      const type = y === 0 ? 'sand' : y < 6 ? 'andesitDark' : 'lava';
      const tDrop = tAnak0 + 0.4 + (y / 8) * (durAnak * 0.58) + ((anakIdx++ % 7) * 0.04);
      anakBlocks.add(x, y + 0.5, z - 2.5, type, tDrop, { drop: 9, spin: 0.8 });
    }
  }
  anakBlocks.build(scene);

  return {
    render(ctx, t) {
      const b = AM.beatIndex(t);
      const u = AM.beatProgress(t);
      let flash = 0;
      for (let i = 1; i < 10; i++) flash = Math.max(flash, AM.Sub.pulse(t, AM.beats[i].start, 0.22) * 0.3);

      // Default visibility resets per frame
      northBlocks.update(t, { hideAfter: AM.beats[4].start + AM.beats[4].dur * 0.55 });
      anakBlocks.update(t);
      ejectaGroup.visible = false;
      plumeGroup.visible = false;
      waveGroup.visible = false;
      ringGroup.visible = false;
      bantenCoast.visible = (b === 6);
      ship1.visible = (b <= 3 || b === 6);
      ship2.visible = (b <= 2);

      // Sky & lighting mood per beat
      if (b <= 1) {
        setSky(sky, '#3b7de8', '#8fd0ff', '#dff6ff');
        sun.color.set('#fff3d6'); sun.intensity = 1.9; amb.intensity = 1.1;
      } else if (b === 2) {
        setSky(sky, mix('#3b7de8', '#524c58', u), mix('#8fd0ff', '#9c8b82', u), '#d8cfc8');
        sun.color.set('#ffd2a0'); sun.intensity = 1.5; amb.intensity = 0.95;
      } else if (b === 3 || b === 4) {
        setSky(sky, '#221218', '#6e2218', '#d9531e');
        sun.color.set('#ff6a2a'); sun.intensity = 1.8; amb.intensity = 0.75;
      } else if (b === 5 || b === 6) {
        setSky(sky, '#283244', '#5c6b7c', '#a8b4c0');
        sun.color.set('#ffd8b0'); sun.intensity = 1.4; amb.intensity = 0.9;
      } else if (b === 7) {
        setSky(sky, '#2a1028', '#8f2424', '#ff7a28');
        sun.color.set('#ff8833'); sun.intensity = 1.6; amb.intensity = 0.85;
      } else {
        setSky(sky, '#3b7de8', '#8fd0ff', '#dff6ff');
        sun.color.set('#fff3d6'); sun.intensity = 1.9; amb.intensity = 1.1;
      }

      // Animate ships gently bobbing
      ship1.position.y = Math.sin(t * 2.5) * 0.15;
      ship1.rotation.z = Math.sin(t * 2.2) * 0.05;
      ship2.position.y = Math.cos(t * 2.3) * 0.14;

      // ---- 10 distinct camera shots + beat animations ----
      let cam = orbit(0.6, 0.42, 34, [0, 4, 0]);

      if (b === 0) {
        // Shot 0: Wide aerial orbit of Krakatau island with 3 peaks
        cam = orbit(-0.55 + u * 0.65, 0.44 - u * 0.04, 34 - u * 4, [0, 4, 0]);
        ship1.position.set(-14, 0, -6 + u * 8);
        ship2.position.set(14, 0, 8 - u * 6);
      } else if (b === 1) {
        // Shot 1: Low maritime tracking shot alongside voxel ships with volcano looming behind
        ship1.position.set(-11, Math.sin(t * 3) * 0.18, -8 + u * 14);
        ship2.position.set(11, Math.cos(t * 2.7) * 0.15, 6 - u * 10);
        cam = {
          pos: [-18 + u * 3, 4.2 + Math.sin(t * 1.8) * 0.3, -10 + u * 12],
          look: [-2, 5.5, -2 + u * 4],
          fov: 40,
        };
      } else if (b === 2) {
        // Shot 2: May 1883 — Perboewatan crater starts coughing ash plume
        plumeGroup.visible = true;
        plumeTiers.forEach(({ m, k }) => {
          const pu = clamp((u * 1.4) - k * 0.08);
          m.visible = pu > 0;
          m.position.set(Math.sin(t * 2 + k) * 0.6, 7 + k * 1.6 * pu, -7.5);
          m.scale.setScalar(pu);
        });
        cam = orbit(-0.4 + u * 0.4, 0.38, 26 - u * 3, [0, 8, -5]);
      } else if (b === 3) {
        // Shot 3: Late August — violent seismic shaking, glowing lava bombs & lightning flashes
        plumeGroup.visible = true;
        ejectaGroup.visible = true;
        plumeTiers.forEach(({ m, k }) => {
          m.visible = true;
          m.position.set(Math.sin(t * 4 + k) * 0.9, 8 + k * 1.8, -4 + Math.cos(t * 2 + k) * 2);
          m.scale.setScalar(1);
        });
        ejectaList.forEach((e, idx) => {
          const lt = (t * 0.9 + e.phase) % 1;
          const r = e.spd * lt;
          e.m.position.set(Math.cos(e.ang) * r, Math.max(-1, 8 + e.vy * lt - 18 * lt * lt), e.z0 + Math.sin(e.ang) * r);
          e.m.rotation.set(t * 3 + idx, t * 2, 0);
        });
        const shakeX = Math.sin(t * 38) * 0.35, shakeY = Math.cos(t * 44) * 0.35;
        cam = orbit(0.35 + u * 0.5, 0.34, 24, [shakeX, 7 + shakeY, -3]);
        if (Math.sin(t * 19) > 0.92) flash = Math.max(flash, 0.45);
      } else if (b === 4) {
        // Shot 4: Aug 27 10:02 AM — Cataclysmic explosion! Northern peaks blast outward!
        plumeGroup.visible = true;
        ejectaGroup.visible = true;
        const tBlast = AM.wordTime(4, 'empat', 0.32);
        const bu = clamp((t - tBlast) / 1.8);
        plumeTiers.forEach(({ m, k }) => {
          m.visible = true;
          m.position.set(Math.sin(t * 5 + k) * 1.2, 8 + k * (2.2 + bu * 1.4), -3);
          m.scale.setScalar(1 + bu * 0.7);
        });
        ejectaList.forEach((e, idx) => {
          const lt = bu > 0 ? clamp(bu * 1.3 - e.phase * 0.25) : (t * 1.1 + e.phase) % 1;
          const r = e.spd * (1 + bu * 1.2) * lt;
          e.m.position.set(Math.cos(e.ang) * r, Math.max(-1, 7 + e.vy * 1.3 * lt - 15 * lt * lt), e.z0 + Math.sin(e.ang) * r);
          e.m.rotation.set(t * 5 + idx, t * 4, 0);
        });
        const shk = (1 - bu * 0.5) * 0.65;
        cam = orbit(-0.7 + u * 0.6, 0.42, 32 + bu * 6, [Math.sin(t * 45) * shk, 8 + Math.cos(t * 50) * shk, -2]);
        flash = Math.max(flash, AM.Sub.pulse(t, tBlast, 0.45) * 0.85);
      } else if (b === 5) {
        // Shot 5: High bird's-eye shockwave expanding across the ocean (4,800 km sound wave)
        ringGroup.visible = true;
        const rScale = 0.4 + ((u * 2.2) % 1) * 3.2;
        ringGroup.scale.set(rScale, 1, rScale);
        cam = orbit(u * 0.4, 0.82, 46 + u * 6, [0, 3, 2]);
      } else if (b === 6) {
        // Shot 6: 30-meter voxel tsunami wave wall surging toward Banten coast
        waveGroup.visible = true;
        const wx = lerp(6, 26, ease.inOut(u));
        waveGroup.position.set(wx, 0, 0);
        ship1.position.set(wx - 4, 3.5 + Math.sin(t * 6) * 0.6, 2);
        ship1.rotation.z = -0.35 + Math.sin(t * 5) * 0.12;
        cam = {
          pos: [wx + 14, 7.5, 18 - u * 8],
          look: [wx + 2, 4.0, 0],
          fov: 42,
        };
      } else if (b === 7) {
        // Shot 7: Stratospheric ash cloud & volcanic red twilight sky across the world
        plumeGroup.visible = true;
        plumeTiers.forEach(({ m, k }) => {
          m.visible = true;
          m.position.set(Math.sin(t * 1.5 + k) * 2.2, 10 + k * 2.1, 2 + Math.cos(t * 1.2 + k) * 2);
          m.scale.set(1.5 + k * 0.15, 0.8, 1.5 + k * 0.15);
        });
        cam = orbit(-0.3 + u * 0.5, 0.22, 36, [0, 12, 3]);
      } else if (b === 8) {
        // Shot 8: Calm aftermath — two-thirds of the island is gone, leaving cleaved Rakata cliff
        cam = orbit(-0.8 + u * 0.9, 0.46, 28 - u * 3, [0, 4, 4]);
      } else {
        // Shot 9: 1927 — Anak Krakatau rises block-by-block from the submerged caldera!
        cam = orbit(0.2 + u * 0.85, 0.38 + u * 0.08, 25 - u * 3, [0, 4.5, -1]);
      }

      shootCam(S, ctx, cam);

      // ---- 2D Pixel HUD & Annotations (Press Start 2P) ----
      if (b === 0) {
        const pSunda = AM.Sub.appear(t, AM.wordTime(0, 'Sunda', 0.1), 0.35);
        pixTitle(ctx, 'KRAKATAU 1883', 540, 220, { size: 50, pop: pSunda, alpha: pSunda });
        const pTiga = AM.Sub.appear(t, AM.wordTime(0, 'tiga', 0.45), 0.3);
        pixPanel(ctx, 'SELAT SUNDA: 3 PUNCAK', 540, 325, { size: 24, pop: pTiga, alpha: pTiga });
        const pRakata = AM.Sub.appear(t, AM.wordTime(0, 'Rakata', 0.72), 0.3);
        const sP = toScreen(S.camera, [-2, 9, -7.5], AM.W, AM.H);
        const sD = toScreen(S.camera, [0, 11, -0.5], AM.W, AM.H);
        const sR = toScreen(S.camera, [0, 13, 7.5], AM.W, AM.H);
        pixPanel(ctx, 'PERBOEWATAN', clamp(sP[0], 220, 860), clamp(sP[1] - 40, 420, 1280), { size: 18, pop: pTiga, alpha: pTiga });
        pixPanel(ctx, 'DANAN', clamp(sD[0], 220, 860), clamp(sD[1] - 40, 420, 1280), { size: 18, pop: pTiga, alpha: pTiga });
        pixPanel(ctx, 'RAKATA (813 M)', clamp(sR[0], 240, 840), clamp(sR[1] - 45, 420, 1280), { size: 20, pop: pRakata, alpha: pRakata, bg: '#3a1e00', border: '#ffe14a' });
      }

      if (b === 1) {
        const pKapal = AM.Sub.appear(t, AM.wordTime(1, 'Kapal-kapal', 0.08), 0.3);
        pixPanel(ctx, 'JALUR PELAYARAN SELAT SUNDA', 540, 230, { size: 24, pop: pKapal, alpha: pKapal });
        const pBerlayar = AM.Sub.appear(t, AM.wordTime(1, 'berlayar', 0.3), 0.3);
        const sp = toScreen(S.camera, [ship1.position.x, ship1.position.y + 5.5, ship1.position.z], AM.W, AM.H);
        pixArrow(ctx, clamp(sp[0], 200, 880), clamp(sp[1] - 40, 380, 1250), t, { alpha: pBerlayar });
        const pAmarah = AM.Sub.appear(t, AM.wordTime(1, 'amarah', 0.78), 0.3);
        pixPanel(ctx, 'MAGMA AKTIF DI BAWAH LAUT', 540, 1310, { size: 24, pop: pAmarah, alpha: pAmarah, bg: '#4a1208', border: '#ff7a1a', color: '#ffe14a' });
      }

      if (b === 2) {
        const pMei = AM.Sub.appear(t, AM.wordTime(2, 'Mei', 0.08), 0.3);
        pixTitle(ctx, '20 MEI 1883', 540, 220, { size: 48, pop: pMei, alpha: pMei });
        const pPerb = AM.Sub.appear(t, AM.wordTime(2, 'Perboewatan', 0.35), 0.3);
        const pAbu = AM.Sub.appear(t, AM.wordTime(2, 'abu', 0.65), 0.3);
        pixPanel(ctx, 'KAWAH PERBOEWATAN MELETUS', 540, 320, { size: 24, pop: pPerb, alpha: pPerb });
        pixPanel(ctx, 'SEMBURAN ABU & BATU APUNG: 11 KM', 540, 1310, { size: 22, pop: pAbu, alpha: pAbu });
      }

      if (b === 3) {
        const pAgustus = AM.Sub.appear(t, AM.wordTime(3, 'Agustus', 0.1), 0.3);
        pixTitle(ctx, '26 AGUSTUS 1883', 540, 220, { size: 44, pop: pAgustus, alpha: pAgustus, color: '#ff9a2a' });
        const pPijar = AM.Sub.appear(t, AM.wordTime(3, 'pijar', 0.45), 0.3);
        pixPanel(ctx, 'HUJAN BATU PIJAR & PETIR VULKANIK', 540, 320, { size: 22, pop: pPijar, alpha: pPijar, bg: '#3a0e08', border: '#ff7a1a' });
        const pMembara = AM.Sub.appear(t, AM.wordTime(3, 'membara', 0.8), 0.3);
        pixPanel(ctx, 'STATUS: BAHAYA MAKSIMUM!', 540, 1310, { size: 26, pop: pMembara, alpha: pMembara, bg: '#5a0808', border: '#ffe14a', color: '#ffe14a' });
      }

      if (b === 4) {
        const tSep = AM.wordTime(4, 'sepuluh', 0.22);
        const tEmpat = AM.wordTime(4, 'empat', 0.42);
        const tHancur = AM.wordTime(4, 'hancur', 0.75);
        const pSep = AM.Sub.appear(t, tSep, 0.3);
        pixTitle(ctx, '27 AGUSTUS 10:02', 540, 215, { size: 44, pop: pSep, alpha: pSep, color: '#ffe14a' });
        const pEmpat = AM.Sub.appear(t, tEmpat, 0.3);
        pixPanel(ctx, '4 LEDAKAN SUPER (VEI 6)', 540, 315, { size: 28, pop: pEmpat, alpha: pEmpat, bg: '#5a0808', border: '#ffe14a', color: '#ffe14a' });
        cubeBurst(ctx, 540, 820, (t - tEmpat) / 1.1, { n: 26, seed: 44 });
        const pHancur = AM.Sub.appear(t, tHancur, 0.3);
        pixPanel(ctx, 'DAYA LEDAK: 200 MEGATON TNT!', 540, 1310, { size: 24, pop: pHancur, alpha: pHancur });
      }

      if (b === 5) {
        const pKeras = AM.Sub.appear(t, AM.wordTime(5, 'keras', 0.18), 0.3);
        pixTitle(ctx, 'SUARA TERKERAS', 540, 220, { size: 46, pop: pKeras, alpha: pKeras });
        const pAus = AM.Sub.appear(t, AM.wordTime(5, 'Australia', 0.52), 0.3);
        pixPanel(ctx, 'TERDENGAR SAMPAI AUSTRALIA', 540, 320, { size: 24, pop: pAus, alpha: pAus });
        const pKm = AM.Sub.appear(t, AM.wordTime(5, 'kilometer', 0.82), 0.3);
        const dist = Math.round(ease.outCubic(clamp((t - AM.beats[5].start) / (AM.beats[5].dur * 0.8))) * 4800);
        pixPanel(ctx, `RADIUS DENTUMAN: ${dist.toLocaleString('id-ID')} KM`, 540, 1310, { size: 26, pop: pKm, alpha: pKeras, color: '#ffe14a' });
      }

      if (b === 6) {
        const pTsu = AM.Sub.appear(t, AM.wordTime(6, 'tsunami', 0.32), 0.3);
        pixTitle(ctx, 'TSUNAMI 30 METER', 540, 220, { size: 44, pop: pTsu, alpha: pTsu, color: '#8fd0ff' });
        const pTiga = AM.Sub.appear(t, AM.wordTime(6, 'tiga', 0.48), 0.3);
        const sw = toScreen(S.camera, [waveGroup.position.x, 8.5, 0], AM.W, AM.H);
        pixArrow(ctx, clamp(sw[0], 200, 880), clamp(sw[1] - 40, 360, 1200), t, { alpha: pTiga, color: '#8fd0ff' });
        const pPes = AM.Sub.appear(t, AM.wordTime(6, 'pesisir', 0.72), 0.3);
        pixPanel(ctx, 'PESISIR BANTEN & LAMPUNG', 540, 1310, { size: 26, pop: pPes, alpha: pPes });
      }

      if (b === 7) {
        const pDebu = AM.Sub.appear(t, AM.wordTime(7, 'debu', 0.12), 0.3);
        const pStrat = AM.Sub.appear(t, AM.wordTime(7, 'stratosfer', 0.38), 0.3);
        const pMerah = AM.Sub.appear(t, AM.wordTime(7, 'memerah', 0.72), 0.3);
        pixTitle(ctx, 'SENJA MERAH DUNIA', 540, 220, { size: 42, pop: pDebu, alpha: pDebu, color: '#ff9a2a' });
        pixPanel(ctx, 'LAPISAN STRATOSFER: TINGGI 80 KM', 540, 320, { size: 22, pop: pStrat, alpha: pStrat });
        pixPanel(ctx, 'SUHU BUMI TURUN 1.2 DERAJAT C', 540, 1310, { size: 24, pop: pMerah, alpha: pMerah, bg: '#3a1018', border: '#ff7a28' });
      }

      if (b === 8) {
        const pLenyap = AM.Sub.appear(t, AM.wordTime(8, 'lenyap', 0.32), 0.3);
        const pLaut = AM.Sub.appear(t, AM.wordTime(8, 'laut', 0.52), 0.3);
        const pRak = AM.Sub.appear(t, AM.wordTime(8, 'Rakata', 0.78), 0.3);
        pixTitle(ctx, 'KALDERA KRAKATAU', 540, 220, { size: 44, pop: pLenyap, alpha: pLenyap });
        pixPanel(ctx, '2/3 PULAU RUNTUH KE BAWAH LAUT', 540, 320, { size: 22, pop: pLaut, alpha: pLaut });
        const sr = toScreen(S.camera, [0, 12.5, 7.5], AM.W, AM.H);
        pixArrow(ctx, clamp(sr[0], 240, 840), clamp(sr[1] - 50, 380, 1180), t, { alpha: pRak });
        pixPanel(ctx, 'SISA TEBING PUNCAK RAKATA', 540, 1310, { size: 24, pop: pRak, alpha: pRak });
      }

      if (b === 9) {
        const tMuncul = AM.wordTime(9, 'muncul', 0.45);
        const tBlok = AM.wordTime(9, 'blok', 0.55);
        const tAnak = AM.wordTime(9, 'Anak', 0.72);
        const pMuncul = AM.Sub.appear(t, AM.beats[9].start + 0.15, 0.35);
        pixTitle(ctx, 'TAHUN 1927', 540, 210, { size: 48, pop: pMuncul, alpha: pMuncul });
        const pBlok = AM.Sub.appear(t, tBlok, 0.3);
        pixPanel(ctx, 'LAHIR DARI DASAR KALDERA', 540, 310, { size: 24, pop: pBlok, alpha: pBlok });
        const pAnak = AM.Sub.appear(t, tAnak, 0.35);
        cubeBurst(ctx, 540, 1300, (t - tAnak) / 1.0, { n: 22, seed: 99 });
        pixPanel(ctx, 'GUNUNG BARU: ANAK KRAKATAU', 540, 1310, { size: 26, pop: pAnak, alpha: pAnak, bg: '#3a1e00', border: '#ffe14a', color: '#ffe14a' });
      }

      finish(ctx, AM, t, { flash });
    },
  };
}

