---
id: stickman-caveman
name: Stickman Caveman
no: 71
source: custom:stickman-caveman-kit
family: craft
tech: canvas2d
music: lofi   voice: el-id-m   captions: clean
best_for: psikologi evolusioner, otak purba di era modern, lawan mager, kecemasan amigdala, jebakan dopamin
---
# Stickman Caveman

**Ciri khas (look):** Panggung gua prasejarah hangat (`#17100b` → `#332217`) lengkap dengan stalaktit gantung, lukisan dinding gua oker, dan nyala api unggun. Karakter unik **Si Uga Manusia Gua (`cavemanStickman`)** tampil dengan rambut gondrong diikat **tulang putih (`🦴`) di puncak kepala**, alis tebal menyatu (*unibrow*), **jubah kulit macan tutul satu bahu (`#d9822b`)**, dan **pentungan kayu berduri batu** di tangan.

**Gerak (motion):** Transisi 4 babak psikologi evolusioner dengan kobaran api unggun hidup, batu tugas raksasa yang pecah menjadi kerikil 5 menit, alarm harimau *sabertooth* vs napas tenang, serta kartu batu tablet di paruh bawah layar.

**Kenapa menarik:** Membumikan neurosains dan psikologi evolusioner (mengapa otak purba berusia 200.000 tahun sering salah membaca tugas modern) lewat visual manusia gua yang humoris, hangat, dan mudah diingat.

**Cerita yang cocok:**
- Otak purba vs tugas modern (mengapa otak menghemat kalori dan takut memulai)
- Alarm *Fight-or-Flight* amigdala (mengapa notifikasi kerja terasa seperti harimau *sabertooth*)
- Jebakan dopamin instan (naluri berburu buah beri manis vs fokus jangka panjang)

**Kit API (`styles/stickman-caveman/kit.js`):**
- `PAL` — palet dinding gua, oker hangat, api unggun, kulit macan tutul, dan tulang gading
- `cavemanBg(ctx, t, opts)` — latar batu gua prasejarah + stalaktit + lukisan gua + cahaya api unggun
- `cavemanHeader(ctx, badgeText, title, subtitle, opts)` — header tablet batu pahat
- `cavemanStickman(ctx, x, floorY, pose, opts)` — karakter unik Si Uga Manusia Gua (`'hunt'`, `'panic'`, `'think'`, `'push'`, `'victory'`)
- `cavemanProps(ctx, floorY, type, opts)` — properti gua (`'boulder'`, `'tiger'`, `'berry'`) + api unggun
- `cavemanBubble(ctx, x, y, text, opts)` — balon ucapan batu pahat
- `cavemanCard(ctx, cx, cy, w, h, opts)` — kartu informasi psikologi evolusioner

**Demos:**
1. `demo1` — *Otak Purba & Batu Tugas — Mengapa Otak Manusia Gua Suka Menghemat Energi?* (~64 dtk)
2. `demo2` — *Harimau Sabertooth vs Notifikasi — Mengapa Email Kerja Memicu Alarm Amigdala?* (~64 dtk)
3. `demo3` — *Jebakan Buah Beri Digital — Mengapa Otak Purba Ketagihan Dopamin Instan?* (~65 dtk)
