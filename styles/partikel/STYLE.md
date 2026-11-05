---
id: partikel
name: Kawanan Partikel
no: 56
source: github:particle-swarm + particle-point-cloud
family: shader
tech: canvas2d
music: dreamy   voice: el-id-m   captions: clean
best_for: Ribuan titik bercahaya (additive glow) pada latar gelap yang membentuk murmurasi burung jalak (boids), sinkronisasi kunang-kunang, dan siklus hujan petrichor
---
# Kawanan Partikel

**Ciri khas (look):** Ribuan partikel titik bercahaya (*additive radial glow* & jejak kecepatan) di atas langit malam observatorium yang bergerak secara kolektif mengikuti aturan fisika/biologi sederhana (*emergent behavior*): murmurasi burung jalak 7-tetangga, sinkronisasi fase kunang-kunang bakau, hingga aerosol *petrichor* saat hujan menyentuh tanah.

**Gerak (motion):** Aliran kawanan *boids* organik dengan garis jaringan topologi tetangga terdekat, gelombang kejut predator, sinkronisasi osilator fase Kuramoto dari acak menjadi serentak, serta transisi partikel uap–awan–tetes hujan–riak tanah.

**Kit API (`styles/partikel/kit.js`):**
- `bg`, `glowDot`, `flock`, `boids`, `cam`, `pop`, `pr`
- `drawStarlingMurmuration(ctx, t, { neighborGraph, ruleSplit, falconDive })`
- `drawFireflyMangrove(ctx, t, { syncProg, chemHighlight })`
- `drawRainPetrichor(ctx, t, { phase, petrichorGlow })`
- `drawParticleHUD(ctx, t, { badge, title, subtitle, pills })`

**3 Demo Siap Pakai (`el-id-m`, 63–65 detik):**
1. **`demo1/` — Ribuan Burung Terbang Tanpa Pemimpin (~64 dtk)**: Rahasia murmurasi burung jalak, algoritma *Boids* Craig Reynolds (Separasi, Alignment, Kohesi), dan aturan topologi 7 tetangga terdekat saat menghindar dari sambaran elang.
2. **`demo2/` — Kunang-Kunang: Cahaya yang Bernyanyi Serentak (~64 dtk)**: Reaksi kimia dingin *lusiferin-lusiferase* efisiensi 100% dan fenomena sinkronisasi osilator biologis di hutan bakau Asia Tenggara.
3. **`demo3/` — Hujan & Petrichor: Satu Tetes, Ribuan Kehidupan (~65 dtk)**: Siklus hidrologi dari penguapan samudra, kondensasi awan, hingga pecahnya gelembung mikroskopis tanah kering yang melepaskan molekul *geosmin* (*petrichor*).
