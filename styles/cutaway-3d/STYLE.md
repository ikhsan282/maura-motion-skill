---
id: cutaway-3d
name: 3D Cutaway Explainer
no: 51
source: github:technical-3d-cutaway + exploded-3d-cutaway
family: 3D
tech: three
music: tech   voice: el-id-m   captions: clean
best_for: cara kerja mesin, jam tangan mekanik, mesin jet, otomotif, alat kopi/industri, bedah komponen dalam (exploded view & cross-section)
---
# 3D Cutaway Explainer

**Ciri khas (look):** studio teknis gelap `#080b11` dengan lantai grid koordinat samar, objek 3D PBR logam berkilau (*polished brass* `#e0af48`, *brushed steel* `#c8d4e3`, tembaga `#df7b46`, titanium `#8aa2ba`, kaca safir transparan, dan permata rubi `#f0285a`). Casing luar terpotong (*cutaway shell*) sehingga isi mesin terlihat langsung, dilengkapi garis *callout* terproyeksi 3D→2D dengan target retikel dan panel spesifikasi *monospace* (`JetBrains Mono`).

**Gerak (motion):** kamera mengorbit tenang mengelilingi objek 3D sementara seluruh rakitan melakukan **exploded view** (komponen memisah secara aksial/vertikal ke lapisan masing-masing lalu menyatu kembali dengan presisi). Di saat yang sama, mekanisme internal tetap bekerja hidup: roda gigi berputar saling mengunci, *balance wheel* berosilasi 4 Hz, bilah turbin berputar cepat, dan fluida bertekanan mengalir.

**Kenapa menarik:** memberi kepuasan visual "melihat menembus logam" (*X-ray / cutaway satisfaction*) yang membuat cara kerja mesin rumit langsung masuk akal dalam hitungan detik.

**Cerita yang cocok:**
- Jam tangan mekanik: "Tanpa baterai sepeser pun, berdetak 28.800 kali setiap jam."
- Mesin jet turbofan: "Hisap, tekan, bakar, hembus — empat tahap yang menerbangkan 300 ton di langit."
- Mesin espresso 9 bar: "Mengapa tekanan sembilan atmosfer melahirkan lapisan crema keemasan?"
- Kamera mekanik / lensa: "Rana yang membuka-menutup dalam 1/4000 detik."
- Kunci silinder pin-tumbler: "Lima pin kuningan kecil yang menjaga pintu rumahmu."

**Rumus hook:** "[Mesin/benda] ini bekerja tanpa [hal yang kita kira wajib]... hanya dengan [mekanisme fisik]." / "Kalau kita belah isi [benda], ada [angka mengejutkan] yang bergerak serempak."

**Kit API (`styles/cutaway-3d/kit.js`):**
- `PAL`, `pr(t, a, b)`, `createStage(AM, {fov, bg})`, `projectTo2D(cam, pos)`, `makeMaterials()`, `createGear(...)`.
- Rakitan 3D siap pakai dengan *exploded view* & titik jangkar 3D:
  - `buildMechanicalWatch(scene)` — casing baja *cutaway*, *mainspring barrel*, *gear train*, permata rubi, *escapement*, & *balance wheel* 4 Hz.
  - `buildJetTurbofan(scene)` — *intake cowling cutaway*, kipas titanium, kompresor 4 tingkat, ruang bakar cincin api (*annular combustor*), turbin, & nosel buang.
  - `buildEspressoCutaway(scene)` — boiler tembaga + elemen pemanas, manometer 9 bar, *grouphead* kuningan E61, *portafilter* + *coffee puck*, dan ekstraksi *crema*.
- HUD & anotasi 2D: `drawStudioHUD(ui, t, opts)`, `callout(ui, cam, worldPos, lx, ly, title, spec, p)`, `specPanel(ui, x, y, w, h, header, cols, p)`.

**Demo (3 variasi, 64–65 detik, voice `el-id-m`):**
- **Demo 1 — "Isi Jam Tangan Mekanik — 28.800 Detak per Jam Tanpa Baterai"** (`demo1/`, ~64 dtk): Bedah *exploded view* 5 lapis mesin jam mekanik: pegas utama (*mainspring*), rangkaian roda gigi (*gear train*), bantalan permata rubi sintetis, mekanisme *escapement*, dan *balance wheel* 4 Hz (28.800 vph).
- **Demo 2 — "Mesin Jet Turbofan — Hisap, Tekan, Bakar, Hembus di Ketinggian 10 Kilometer"** (`demo2/`, ~64 dtk): Bedah aksial 5 modul mesin turbofan pesawat komersial: kipas titanium (*fan*), kompresor tekanan tinggi, ruang bakar cincin (*annular combustor*), turbin penggerak poros, dan nosel pendorong.
- **Demo 3 — "Mesin Espresso 9 Bar — Fisika Tekanan Air Panas yang Melahirkan Crema Emas"** (`demo3/`, ~65 dtk): Potongan penampang vertikal mesin espresso dari boiler tembaga 93°C, pompa tekanan 9 bar, *grouphead* kuningan, *coffee puck* 18 gram, hingga emulsi minyak kopi menjadi *crema*.

