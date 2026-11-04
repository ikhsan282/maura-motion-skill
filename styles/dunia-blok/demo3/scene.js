// dunia-blok demo3 — Monas: Rahasia Lidah Api Emas di Puncak Jakarta (10 shots)
// Three.js voxel Monumen Nasional built block-by-block in Medan Merdeka:
// base museum, 17mx45m goblet (cawan), 117m white marble obelisk, viewing deck elevator,
// 14.5-ton bronze flame, and 38 kg -> 50 kg of pure gold voxel blocks coating the flame!
import {
  THREE, stage, shootCam, orbit, toScreen, mat, vbox, Blocks,
  voxTree, voxFlag, worker, workerPose, skyDome, setSky, mix, cubeBurst,
  pixTitle, pixPanel, pixArrow, finish, ease, clamp, lerp, hrand,
} from '../kit.js';

export function createScene(AM) {
  const S = stage(AM); const { scene, sun, amb } = S;
  const sky = skyDome(scene);

  // ---- Medan Merdeka Park Ground & Pathways ----
  const parkGroup = new THREE.Group();
  const lawn = vbox(96, 2, 96, 'grass'); lawn.position.set(0, -1, 0);
  const pathX = vbox(88, 0.25, 6, 'sand'); pathX.position.set(0, 0.12, 0);
  const pathZ = vbox(6, 0.25, 88, 'sand'); pathZ.position.set(0, 0.12, 0);
  const plaza = vbox(28, 0.4, 28, 'andesit'); plaza.position.set(0, 0.2, 0);
  parkGroup.add(lawn, pathX, pathZ, plaza);

  // Park trees & Indonesian Red-White flags around plaza
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2 + 0.15;
    if (Math.abs(Math.cos(a)) > 0.94 || Math.abs(Math.sin(a)) > 0.94) continue;
    const r = 22 + (i % 3) * 5;
    parkGroup.add(voxTree(Math.round(Math.cos(a) * r), 0, Math.round(Math.sin(a) * r), i));
  }
  for (const [fx, fz] of [[-12, 12], [12, 12], [-12, -12], [12, -12]]) {
    parkGroup.add(voxFlag(fx, 0.4, fz, { h: 6, s: 1 }));
  }
  scene.add(parkGroup);

  // Distant Jakarta skyline buildings (visible in wide/high shots & glowing at night in Shot 9)
  const skylineGroup = new THREE.Group();
  const cityLights = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const r = 38 + (i % 3) * 5;
    const bh = 6 + Math.round(hrand(i, 11) * 14);
    const bw = 3 + (i % 2) * 2;
    const bldg = vbox(bw, bh, bw, i % 3 === 0 ? 'andesitDark' : 'andesit');
    bldg.position.set(Math.cos(a) * r, bh / 2, Math.sin(a) * r);
    const crown = vbox(bw * 0.8, 0.8, bw * 0.8, 'gold', { cast: false });
    crown.position.set(Math.cos(a) * r, bh + 0.4, Math.sin(a) * r);
    skylineGroup.add(bldg, crown);
    cityLights.push(crown);
  }
  scene.add(skylineGroup);

  // ---- Block-by-Block Monas Construction (Instanced Blocks) ----
  const B = new Blocks({ drop: 7, dur: 0.42 });

  // 1. Base & Museum Sejarah platform (y = 0.5..2.5, built in Beat 0..2)
  const tB0 = AM.beats[0].start;
  const dur02 = AM.beats[2].end - tB0;
  for (let y = 0; y < 3; y++) {
    const r = 8 - y;
    for (let x = -r; x <= r; x++) for (let z = -r; z <= r; z++) {
      if (y > 0 && Math.abs(x) < r - 1 && Math.abs(z) < r - 1) continue;
      const type = y === 1 ? 'relief' : 'andesit';
      const u = (y * 9 + (x + r) * 0.4 + (z + r) * 0.3) / 38;
      B.add(x, y + 0.4, z, type, tB0 + clamp(u) * dur02 * 0.85, { drop: 6 });
    }
  }

  // 2. Cawan / Goblet (y = 3..7, flares outward from r=3 to r=6, built in Beat 3)
  const tB3 = AM.beats[3].start, dB3 = AM.beats[3].dur;
  const cawanRadii = [3, 4, 5, 6, 6];
  for (let ky = 0; ky < cawanRadii.length; ky++) {
    const y = 3 + ky;
    const r = cawanRadii[ky];
    for (let x = -r; x <= r; x++) for (let z = -r; z <= r; z++) {
      if (ky < 4 && Math.abs(x) < r - 1 && Math.abs(z) < r - 1) continue;
      const type = ky === 4 ? 'andesit' : 'snow';
      const u = (ky + (x + r) / (2 * r + 1) * 0.6) / 5.2;
      B.add(x, y + 0.4, z, type, tB3 + u * dB3 * 0.82, { drop: 7 });
    }
  }

  // 3. Tugu Obelisk Shaft (y = 8..24, 3x3 white marble shaft tapering to 2x2, built in Beat 4)
  const tB4 = AM.beats[4].start, dB4 = AM.beats[4].dur;
  for (let y = 8; y <= 24; y++) {
    const u = (y - 8) / 17;
    const tDrop = tB4 + u * dB4 * 0.82;
    for (let x = -1; x <= 1; x++) for (let z = -1; z <= 1; z++) {
      if (Math.abs(x) === 1 && Math.abs(z) === 1 && y > 15) continue; // taper corners higher up
      B.add(x, y + 0.4, z, 'snow', tDrop + (x + 1) * 0.03, { drop: 8 });
    }
  }

  // 4. Pelataran Puncak / Viewing Deck (y = 25..26, 4x4 deck at top of shaft, built at start of Beat 5)
  const tB5 = AM.beats[5].start;
  for (let x = -2; x <= 2; x++) for (let z = -2; z <= 2; z++) {
    B.add(x, 25.4, z, 'andesitDark', tB5 + 0.15 + (Math.abs(x) + Math.abs(z)) * 0.04, { drop: 6 });
    if (Math.abs(x) === 2 || Math.abs(z) === 2) {
      B.add(x, 26.2, z, 'snow', tB5 + 0.35 + (Math.abs(x) + Math.abs(z)) * 0.04, { s: 0.65, drop: 5 });
    }
  }

  // 5. Lidah Api Perunggu (Bronze Flame core, y = 26.5..31.5, built in Beat 6)
  const tB6 = AM.beats[6].start, dB6 = AM.beats[6].dur;
  const flameCoords = [
    [0, 26.6, 0, 1.2], [-0.8, 27.4, 0, 0.9], [0.8, 27.4, 0, 0.9], [0, 27.4, -0.8, 0.9], [0, 27.4, 0.8, 0.9],
    [0, 28.2, 0, 1.3], [-1.0, 28.5, 0.3, 0.85], [1.0, 28.5, -0.3, 0.85], [0.3, 28.5, 1.0, 0.85], [-0.3, 28.5, -1.0, 0.85],
    [0, 29.4, 0, 1.15], [-0.6, 29.8, 0, 0.8], [0.6, 29.8, 0, 0.8], [0, 29.8, 0.6, 0.8],
    [0, 30.6, 0, 0.9], [0.2, 31.4, 0, 0.65],
  ];
  flameCoords.forEach(([fx, fy, fz, fs], idx) => {
    const tDrop = tB6 + 0.25 + (idx / flameCoords.length) * dB6 * 0.65;
    B.add(fx, fy, fz, 'wood', tDrop, { s: fs, drop: 7, spin: 1.2, tout: AM.beats[7].start + 0.9 + idx * 0.08 });
  });

  // 6. Lidah Api Emas 38 kg -> 50 kg (Golden Flame blocks locking in during Beats 7 & 8)
  const tB7 = AM.beats[7].start, dB7 = AM.beats[7].dur;
  const tB8 = AM.beats[8].start, dB8 = AM.beats[8].dur;
  flameCoords.forEach(([fx, fy, fz, fs], idx) => {
    const tGold = idx < 11
      ? tB7 + 0.4 + (idx / 11) * (dB7 * 0.65)
      : tB8 + 0.3 + ((idx - 11) / 5) * (dB8 * 0.55);
    B.add(fx, fy, fz, 'gold', tGold, { s: fs * 1.06, drop: 6, spin: 1.5 });
  });

  B.build(scene);

  // Glowing golden flame aura mesh for Shot 9 (night beacon)
  const glowFlame = vbox(2.4, 4.6, 2.4, 'gold', { cast: false });
  glowFlame.material = mat('gold', 'side', { emissive: '#ffaa00' });
  glowFlame.position.set(0, 29.0, 0);
  scene.add(glowFlame);

  // Elevator indicator block riding up the obelisk exterior in Beat 5
  const liftBox = vbox(1.4, 1.6, 0.6, 'gold', { cast: false });
  liftBox.material = mat('gold', 'side', { emissive: '#ff9900' });
  scene.add(liftBox);

  // Voxel architects / workers & gold donation chests
  const workers = [
    { w: worker(0), x: -6, y: 0.4, z: 10, ry: 0.4 },
    { w: worker(1), x: 6, y: 0.4, z: 10, ry: -0.4 },
    { w: worker(2), x: -4, y: 8.4, z: 4, ry: 0.2 },
    { w: worker(3), x: 4, y: 8.4, z: 4, ry: -0.2 },
  ];
  workers.forEach(o => { o.w.position.set(o.x, o.y, o.z); o.w.rotation.y = o.ry; scene.add(o.w); });

  return {
    render(ctx, t) {
      const b = AM.beatIndex(t);
      const u = AM.beatProgress(t);
      let flash = 0;
      for (let i = 1; i < 10; i++) flash = Math.max(flash, AM.Sub.pulse(t, AM.beats[i].start, 0.22) * 0.28);

      B.update(t);

      // Animate voxel workers
      workers.forEach((o, i) => {
        o.w.visible = (b <= 4 || b === 7);
        workerPose(o.w, t + i * 0.5, { walk: 0.25, build: b <= 4 ? 1 : 0.4 });
      });

      // Elevator visible in Beat 5
      liftBox.visible = (b === 5);
      if (b === 5) {
        const ly = lerp(8.5, 25.0, ease.inOut(clamp(u * 1.25)));
        liftBox.position.set(0, ly, 1.6);
      }

      // Sky & Day-to-Night Lighting
      glowFlame.visible = false;
      cityLights.forEach(c => { c.visible = false; });

      if (b < 9) {
        setSky(sky, '#3b7de8', '#8fd0ff', '#dff6ff');
        sun.color.set('#fff3d6'); sun.intensity = 1.95; amb.intensity = 1.1;
      } else {
        // Beat 9: Day -> Sunset -> Sparkling Jakarta Night!
        const nMix = clamp((u - 0.25) / 0.45);
        setSky(sky, mix('#3b7de8', '#0b1026', nMix), mix('#8fd0ff', '#1b264e', nMix), mix('#dff6ff', '#ff8833', clamp(nMix * 1.2)));
        sun.color.set(mix('#fff3d6', '#ffaa44', nMix));
        sun.intensity = lerp(1.95, 0.9, nMix);
        amb.intensity = lerp(1.1, 0.65, nMix);
        if (nMix > 0.35) {
          glowFlame.visible = true;
          glowFlame.rotation.y = t * 1.2;
          const pulse = 0.85 + Math.sin(t * 6) * 0.15;
          glowFlame.scale.set(pulse, 1, pulse);
          cityLights.forEach(c => { c.visible = true; });
        }
      }

      // ---- 10 distinct camera shots ----
      let cam = orbit(0.5, 0.4, 34, [0, 8, 0]);
      if (b === 0) {
        // Shot 0: Wide Medan Merdeka park overview as initial blocks drop
        cam = orbit(-0.6 + u * 0.6, 0.46 - u * 0.06, 36 - u * 5, [0, 3, 0]);
      } else if (b === 1) {
        // Shot 1: Architects Silaban & Soedarsono in foreground looking at blueprint/base
        cam = {
          pos: [0 + Math.sin(u * 2) * 3, 4.5, 21 - u * 4],
          look: [0, 3.5, 0],
          fov: 40,
        };
      } else if (b === 2) {
        // Shot 2: Close orbit around the Museum Sejarah base & relief walls
        cam = orbit(0.2 + u * 0.7, 0.32, 22 - u * 2, [0, 2.5, 0]);
      } else if (b === 3) {
        // Shot 3: Cawan (Goblet, 17m high x 45m wide) locking together block-by-block
        cam = orbit(-0.5 + u * 0.8, 0.36, 25, [0, 5.5, 0]);
      } else if (b === 4) {
        // Shot 4: Heroic rising crane shot following the 117m White Marble Obelisk up into the sky
        const lookY = lerp(7, 23, ease.inOut(u));
        cam = orbit(0.3 + u * 0.6, 0.25, 28, [0, lookY, 0]);
      } else if (b === 5) {
        // Shot 5: Tracking the fast elevator to Pelataran Puncak viewing deck overlooking Jakarta
        const ly = lerp(10, 25.5, ease.inOut(clamp(u * 1.2)));
        cam = {
          pos: [12 - u * 3, ly + 2.5, 16 - u * 2],
          look: [0, ly, 0],
          fov: 42,
        };
      } else if (b === 6) {
        // Shot 6: Close-up of the 14.5-ton Bronze Lidah Api crowning the summit
        cam = orbit(-0.4 + u * 0.8, 0.24, 15 - u * 1.5, [0, 28.5, 0]);
      } else if (b === 7) {
        // Shot 7: 38 kg of pure gold blocks (Teuku Markam & citizens) dropping onto the flame!
        cam = orbit(0.4 + u * 0.8, 0.28, 14.5, [0, 28.8, 0]);
      } else if (b === 8) {
        // Shot 8: 1995 (50th Independence) — upgraded to 50 kg of gleaming gold!
        cam = orbit(-0.6 + u * 0.9, 0.34, 16 + u * 3, [0, 28.8, 0]);
      } else {
        // Shot 9: Grand full-monument pullback from day to glowing Jakarta night
        cam = orbit(0.2 + u * 0.9, 0.28 + u * 0.08, 38 + u * 8, [0, 16, 0]);
      }

      shootCam(S, ctx, cam);

      // ---- 2D Pixel HUD & Fact Callouts (Press Start 2P) ----
      if (b === 0) {
        const pMerd = AM.Sub.appear(t, AM.wordTime(0, 'Merdeka', 0.15), 0.35);
        pixTitle(ctx, 'MONUMEN NASIONAL', 540, 215, { size: 42, pop: pMerd, alpha: pMerd });
        const pTujuh = AM.Sub.appear(t, AM.wordTime(0, 'tujuh', 0.55), 0.3);
        const pAgus = AM.Sub.appear(t, AM.wordTime(0, 'Agustus', 0.65), 0.3);
        pixPanel(ctx, 'MEDAN MERDEKA, JAKARTA', 540, 315, { size: 24, pop: pMerd, alpha: pMerd });
        pixPanel(ctx, 'MULAI DIBANGUN: 17 AGUSTUS 1961', 540, 1310, { size: 22, pop: pTujuh, alpha: pAgus, color: '#ffe14a' });
      }

      if (b === 1) {
        const pSil = AM.Sub.appear(t, AM.wordTime(1, 'Silaban', 0.15), 0.3);
        const pLing = AM.Sub.appear(t, AM.wordTime(1, 'Lingga', 0.48), 0.3);
        const pCaw = AM.Sub.appear(t, AM.wordTime(1, 'cawan', 0.72), 0.3);
        pixPanel(ctx, 'ARSITEK: SILABAN & SOEDARSONO', 540, 220, { size: 22, pop: pSil, alpha: pSil });
        pixTitle(ctx, 'LINGGA & YONI', 540, 320, { size: 44, pop: pLing, alpha: pLing });
        pixPanel(ctx, 'TUGU & CAWAN LAMBANG KEABADIAN', 540, 1310, { size: 22, pop: pCaw, alpha: pCaw });
      }

      if (b === 2) {
        const pBeton = AM.Sub.appear(t, AM.wordTime(2, 'beton', 0.2), 0.3);
        const pMus = AM.Sub.appear(t, AM.wordTime(2, 'museum', 0.55), 0.3);
        const pSej = AM.Sub.appear(t, AM.wordTime(2, 'sejarah', 0.65), 0.3);
        pixTitle(ctx, 'PONDasi & MUSEUM', 540, 220, { size: 42, pop: pBeton, alpha: pBeton });
        const sm = toScreen(S.camera, [0, 3.2, 6], AM.W, AM.H);
        pixArrow(ctx, clamp(sm[0], 240, 840), clamp(sm[1] - 50, 400, 1180), t, { alpha: pMus });
        pixPanel(ctx, 'MUSEUM SEJARAH NASIONAL (48 DIORAMA)', 540, 1310, { size: 20, pop: pSej, alpha: pSej });
      }

      if (b === 3) {
        const pCaw = AM.Sub.appear(t, AM.wordTime(3, 'cawan', 0.18), 0.3);
        const pTuj = AM.Sub.appear(t, AM.wordTime(3, 'tujuh', 0.45), 0.3);
        const pEmp = AM.Sub.appear(t, AM.wordTime(3, 'empat', 0.68), 0.3);
        pixTitle(ctx, 'PELATARAN CAWAN', 540, 215, { size: 44, pop: pCaw, alpha: pCaw });
        pixPanel(ctx, 'TINGGI CAWAN: 17 METER', 540, 315, { size: 26, pop: pTuj, alpha: pTuj, color: '#ffe14a' });
        pixPanel(ctx, 'LEBAR CAWAN: 45 x 45 METER (ANGKA 17-8-45)', 540, 1310, { size: 20, pop: pEmp, alpha: pEmp });
      }

      if (b === 4) {
        const pTugu = AM.Sub.appear(t, AM.wordTime(4, 'tugu', 0.18), 0.3);
        const pMar = AM.Sub.appear(t, AM.wordTime(4, 'marmer', 0.38), 0.3);
        const pSer = AM.Sub.appear(t, AM.wordTime(4, 'seratus', 0.68), 0.3);
        pixTitle(ctx, 'OBELISK MARMER', 540, 215, { size: 44, pop: pTugu, alpha: pTugu, color: '#ffffff' });
        pixPanel(ctx, 'LAPISAN MARMER PUTIH ITALIA', 540, 315, { size: 24, pop: pMar, alpha: pMar });
        const curH = Math.round(ease.outCubic(u) * 117);
        pixPanel(ctx, `TINGGI TUGU: ${curH} / 117 METER`, 540, 1310, { size: 26, pop: pSer, alpha: pTugu, color: '#ffe14a' });
      }

      if (b === 5) {
        const pPun = AM.Sub.appear(t, AM.wordTime(5, 'puncak', 0.12), 0.3);
        const pLift = AM.Sub.appear(t, AM.wordTime(5, 'lift', 0.38), 0.3);
        const pJkt = AM.Sub.appear(t, AM.wordTime(5, 'Jakarta', 0.68), 0.3);
        pixTitle(ctx, 'PELATARAN PUNCAK', 540, 215, { size: 42, pop: pPun, alpha: pPun });
        const sl = toScreen(S.camera, [liftBox.position.x, liftBox.position.y + 1.5, liftBox.position.z], AM.W, AM.H);
        pixArrow(ctx, clamp(sl[0], 240, 840), clamp(sl[1] - 40, 380, 1180), t, { alpha: pLift });
        pixPanel(ctx, 'PANORAMA KOTA JAKARTA (115 M)', 540, 1310, { size: 24, pop: pJkt, alpha: pJkt });
      }

      if (b === 6) {
        const pMah = AM.Sub.appear(t, AM.wordTime(6, 'mahkota', 0.12), 0.3);
        const pPer = AM.Sub.appear(t, AM.wordTime(6, 'perunggu', 0.52), 0.3);
        const pEmp = AM.Sub.appear(t, AM.wordTime(6, 'empat', 0.68), 0.3);
        pixTitle(ctx, 'LIDAH API PERUNGGU', 540, 215, { size: 38, pop: pMah, alpha: pMah, color: '#ff9a2a' });
        pixPanel(ctx, 'TINGGI 14 M | DIAMETER 6 M', 540, 315, { size: 24, pop: pPer, alpha: pPer });
        pixPanel(ctx, 'BERAT PERUNGGU: 14,5 TON', 540, 1310, { size: 26, pop: pEmp, alpha: pEmp, color: '#ffe14a' });
      }

      if (b === 7) {
        const tEmas = AM.wordTime(7, 'emas', 0.18);
        const tTiga = AM.wordTime(7, 'tiga', 0.42);
        const tMar = AM.wordTime(7, 'Markam', 0.78);
        const pEmas = AM.Sub.appear(t, tEmas, 0.3);
        const pTiga = AM.Sub.appear(t, tTiga, 0.3);
        const pMar = AM.Sub.appear(t, tMar, 0.3);
        pixTitle(ctx, 'LAPISAN EMAS MURNI', 540, 215, { size: 40, pop: pEmas, alpha: pEmas, color: '#ffe14a' });
        const sf = toScreen(S.camera, [0, 29, 0], AM.W, AM.H);
        cubeBurst(ctx, sf[0], sf[1], (t - tTiga) / 1.0, { n: 22, seed: 38 });
        pixPanel(ctx, 'AWAL: 38 KG EMAS MURNI', 540, 315, { size: 26, pop: pTiga, alpha: pTiga, bg: '#3a1e00', border: '#ffe14a', color: '#ffe14a' });
        pixPanel(ctx, 'SUMBANGAN TEUKU MARKAM & RAKYAT', 540, 1310, { size: 22, pop: pMar, alpha: pMar });
      }

      if (b === 8) {
        const tLima = AM.wordTime(8, 'lima', 0.12);
        const tDit = AM.wordTime(8, 'ditambah', 0.62);
        const tKg = AM.wordTime(8, 'kilogram', 0.85);
        const pLima = AM.Sub.appear(t, tLima, 0.3);
        const pDit = AM.Sub.appear(t, tDit, 0.3);
        const pKg = AM.Sub.appear(t, tKg, 0.3);
        pixTitle(ctx, 'HUT RI KE-50 (1995)', 540, 215, { size: 40, pop: pLima, alpha: pLima });
        const sf = toScreen(S.camera, [0, 29, 0], AM.W, AM.H);
        cubeBurst(ctx, sf[0], sf[1], (t - tDit) / 1.0, { n: 26, seed: 50 });
        const kgCount = Math.round(lerp(38, 50, ease.outCubic(clamp((t - tDit) / 1.2))));
        pixPanel(ctx, `TOTAL EMAS: ${kgCount} KILOGRAM!`, 540, 1310, { size: 28, pop: pKg, alpha: pLima, bg: '#3a1e00', border: '#ffe14a', color: '#ffe14a' });
      }

      if (b === 9) {
        const pMat = AM.Sub.appear(t, AM.wordTime(9, 'matahari', 0.18), 0.3);
        const pMal = AM.Sub.appear(t, AM.wordTime(9, 'malam', 0.38), 0.3);
        const pPad = AM.Sub.appear(t, AM.wordTime(9, 'padam', 0.82), 0.35);
        pixTitle(ctx, 'MONAS JAKARTA', 540, 215, { size: 48, pop: pMat, alpha: pMat, color: '#ffe14a' });
        pixPanel(ctx, 'TINGGI TOTAL: 132 METER', 540, 315, { size: 24, pop: pMal, alpha: pMal });
        cubeBurst(ctx, 540, 1310, (t - AM.wordTime(9, 'padam', 0.82)) / 1.0, { n: 24, seed: 88 });
        pixPanel(ctx, 'API SEMANGAT YANG TAK PERNAH PADAM', 540, 1310, { size: 22, pop: pPad, alpha: pPad, bg: '#3a1e00', border: '#ffe14a', color: '#ffe14a' });
      }

      finish(ctx, AM, t, { flash });
    },
  };
}

