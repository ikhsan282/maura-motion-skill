---
id: origami
name: Origami
no: 18
source: drive:18_Origami
family: 3D
tech: three
music: japanese   voice: id-f   captions: elegant
best_for: Dunia origami 3D: kertas terlipat dengan tepi tajam, lipatan dan crease shading, kertas bermotif washi
---
# Origami

**Ciri khas (look):** Dunia origami 3D: kertas terlipat dengan tepi tajam, lipatan dan crease shading, kertas bermotif washi. Legenda senbazuru Jepang, kisah Sadako Sasaki (Hiroshima) yang melipat bangau, bangau-bangau berterbangan, Children's Peace Statue. Animasi melipat (kertas datar berubah jadi bangau), kamera lembut, cahaya pagi. Hormat dan tidak sensasional.

**Gerak (motion):** Transisi dan animasi mengikuti irama narasi per baris (`AM.cue`, `AM.wordTime`), dengan pergerakan kamera halus dan elemen visual khas gaya `origami`.

**Kenapa menarik:** Visual Origami memberikan atmosfer khas yang langsung menghentikan scroll pada detik pertama.

**Cerita yang cocok:**
- Seribu Bangau Kertas: "Konon, siapa pun yang melipat seribu bangau kertas... boleh meminta satu permohonan."

**Rumus hook:** "Konon, siapa pun yang melipat seribu bangau kertas... boleh meminta satu permohonan."

**Kit API (`styles/origami/kit.js`):**
- Exports: `PAL`, `WASHI_COLORS`, `createStage`, `lightRig`, `look`, `camLerp`, `orbit`, `washi`, `paperMat`, `goldMat`, `skyTexture`, `triGeom`, `mergeGeoms`, `crumple`, `CRANE_POSE`, `makeCrane`, `mixPose`, `flap`, `craneStaticGeom`, `makeFlock`, `makeGarlands`, `makeFoldSheet`, `makeDoll`, `runPose`, `paperMountain`, `paperTree`, `paperHouse`, `paperCloud`, `paperSun`, `paperRibbon`, `paperGround`, `bunting`, `tag`, `title`, `counter`, `paperFinish`, `toScreen`, `flecks`.

**Demo:** "Seribu Bangau Kertas" — voice `id-f`, musik `japanese`. Hook: "Konon, siapa pun yang melipat seribu bangau kertas... boleh meminta satu permohonan."
