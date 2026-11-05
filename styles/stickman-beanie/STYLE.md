---
id: stickman-beanie
name: Stickman Beanie
no: 70
source: custom:stickman-beanie-hoodie
family: craft
tech: canvas2d
music: lofi   voice: el-id-m   captions: clean
best_for: self-talk anak muda, lawan mager, psikologi sehari-hari, paradoks pilihan, spotlight effect
---
# Stickman Beanie

**Karakter Unik ("Si Kupluk Merah & Hoodie Kuning" — `K.beanieStickman`):**
- Mengenakan **kupluk rajut merah tebal (*chunky red knit beanie*)** dengan **lipatan rajut bergaris vertikal (*ribbed cuff*)** dan **pom-pom bulat** yang memantul di atas kepala.
- Mengenakan **hoodie kuning mustard oversized** lengkap dengan **kantong kanguru depan**, **dua tali hoodie putih** di dada, celana *cuffed denim*, dan sepatu kets merah bersol putih.

**Ciri khas (look):** Kertas *dot-grid* studio hangat (`#f8f5ec`) dengan panel panggung komik berbayangan tegas (*hard comic shadow*), tanaman monstera di pot terakota, meja kerja & laptop, balon dialog komik (`beanieBubble`), serta kartu catatan tebal (`beanieCard`).

**Kit API (`styles/stickman-beanie/kit.js`):**
- `K.beanieBg(ctx, t, { floorY, stageTag, col })`
- `K.beanieHeader(ctx, badge, mainTitle, subTitle, { col, a })`
- `K.beanieProps(ctx, floorY, theme, { phase, t })`
- `K.beanieStickman(ctx, x, floorY, pose, { facing, t, a })`
- `K.beanieBubble(ctx, x, y, text, { tailX, tailY, col, a })`
- `K.beanieCard(ctx, x, y, w, h, { tag, titleStr, subStr, stat, statSub, col, a })`

**3 Demo (64–65 dtk, voice `el-id-m`):**
1. `demo1`: *Kupluk Merah vs Jebakan Rebahan — Mengapa Otak Suka Menawar "Lima Menit Lagi"?*
2. `demo2`: *Paradoks Pilihan di Era Digital — Mengapa Makin Banyak Pilihan Justru Bikin Bingung & Batal?*
3. `demo3`: *Efek Spotlight — Mengapa Kita Merasa Semua Orang Memperhatikan Kesalahan Kecil Kita?*
