---
id: stickman-duo
name: Stickman Duo
no: 73
source: custom:stickman-duo-kit
family: craft
tech: canvas2d
music: lofi   voice: el-id-m   captions: clean
best_for: akuntabilitas dua sahabat, body doubling, belajar dengan mengajar, obrolan A/B
---
# Stickman Duo

**Ciri khas (look):** Panggung studio terbelah dua (*Split-Studio Co-Op Stage* dengan tanda `ON AIR • DUO` dan panel akustik) yang mempertemukan **dua karakter stickman unik berdampingan (`duoStickman`)**:
1. **Si Raka (`role: 'raka'`)** di sisi kiri: mengenakan **topi *baseball* merah terbalik (*snapback*)**, rompi *varsity* merah bernomor `"01"`, dan *headphone* di leher.
2. **Si Bima (`role: 'bima'`)** di sisi kanan: mengenakan **kacamata hitam *aviator* biru**, jaket biru berkerah dengan ritsleting putih, dan rambut jambul bergelombang.

**Gerak (motion):** Dialog sahut-sahutan antara Raka (balon ucapan merah di kiri) dan Bima (balon ucapan biru di kanan) mengelilingi papan skor kolaborasi di tengah (`duoCenterProp`), disertai 2 kartu prinsip psikologi sosial di bagian bawah.

**Kenapa menarik:** Format *buddy-comedy* / *podcast* dua sahabat membuat konsep psikologi kolaborasi terasa hidup, akrab, dan tidak menggurui.

**Cerita yang cocok:**
- Kekuatan *Accountability Partner* (studi ASTD: peluang sukses melonjak ke 95%)
- Efek *Body Doubling* (mengapa kerja bareng teman bikin fokus meski tanpa mengobrol)
- *The Protégé Effect* & Teknik Feynman (mengapa mengajar sahabat membuat kita paham 90%)

**Kit API (`styles/stickman-duo/kit.js`):**
- `PAL` — palet studio kembar (merah Raka `#e63946`, biru Bima `#2563eb`, hijau kolaborasi `#0d9488`)
- `duoBg(ctx, t, opts)` — latar studio *split-screen* dengan panel akustik & indikator `ON AIR`
- `duoHeader(ctx, badgeText, title, subtitle, opts)` — header papan studio Raka & Bima
- `duoStickman(ctx, x, floorY, role, pose, opts)` — karakter unik `'raka'` (topi balik merah + vest 01) & `'bima'` (kacamata biru + jaket ritsleting)
- `duoCenterProp(ctx, floorY, badge, title, sub, opts)` — papan skor kolaborasi di tengah panggung
- `duoBubble(ctx, x, y, speaker, text, opts)` — balon dialog kembar Raka & Bima
- `duoCard(ctx, cx, cy, w, h, opts)` — kartu informasi psikologi kolaborasi

**Demos:**
1. `demo1` — *Mager Sendirian vs Gas Bareng — Mengapa Partner Akuntabilitas Menaikkan Peluang Sukses ke 95%?* (~64 dtk)
2. `demo2` — *Efek Body Doubling — Mengapa Kerja Satu Meja Bareng Sahabat Bikin Fokus Dua Kali Lipat?* (~64 dtk)
3. `demo3` — *Rahasia Protégé Effect — Mengapa Mengajari Teman Adalah Cara Tercepat Menguasai Ilmu?* (~65 dtk)
