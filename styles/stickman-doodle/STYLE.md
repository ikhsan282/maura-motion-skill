---
id: stickman-doodle
name: Stickman Doodle
no: 65
source: github:hand-drawn-doodle
family: craft
tech: canvas2d
music: lofi   voice: el-id-m   captions: hand
best_for: Psikologi sehari-hari, prokrastinasi, efek Dunning-Kruger, jebakan gaya hidup/keuangan, dan kebiasaan otak manusia
---
# Stickman Doodle (`stickman-doodle`)

**Karakter Unik ("Si Dodi Buku Tulis" & "Si Otak Pink"):**
- **Si Dodi Buku Tulis**: Karakter stickman spidol hitam tebal di atas kertas buku tulis bergaris biru dengan margin merah ganda. Memiliki kepala bulat berlatar kertas bersih, jambul rambut tiga helai (*3-spike cowlick tuft*), rona pipi merah muda (`blush`), dasi merah kecil di dada (`tie`), dan sepatu kets biru (`shoes`).
- **Si Otak Pink (`brainGuy`)**: Karakter pendamping berbentuk otak merah muda berkaki dua yang bisa berlari panik, berkeringat, dan berinteraksi dengan Si Dodi.
- **Tangan Spidol Live (`markerFor`)**: Spidol fisik yang menggambar garis dan teks secara langsung di atas buku tulis, dengan seluruh garis bergetar (*12fps line-boil*).

**Kit API (`styles/stickman-doodle/kit.js`):**
- `PAL`, `G`, `Sketch`, `Pen`, `setBoil(t, amp, fps)`, `notebook(ctx)`, `cam(ctx, x, y, z, rot, fy)`
- `stick(pose)`, `stickDraw(ctx, pose, t, opts)`, `stickTip(pose, reveal)` — karakter Si Dodi berdasi merah & bersepatu biru
- `brainGuy(ctx, x, y, t, opts)` — karakter pendamping Si Otak Pink berkaki
- `doodleHeader(ctx, tag, mainTitle, subTitle, opts)` — banner kepala halaman buku tulis dengan stabilo kuning
- `doodleCard(ctx, x, y, w, h, opts)` — kartu catatan spidol bergoyang dengan kotak metrik stabilo
- `bubble`, `cloud`, `sweat`, `motion`, `mline`, `mtext`, `marker`, `markerFor`

**Demos:**
- `demo1` — *Kenapa Kita Menunda-nunda? — Drama Amigdala, Awan Bersalah & Aturan Lima Menit* (~64 dtk)
- `demo2` — *Jebakan Dunning-Kruger — Mengapa Makin Sedikit Tahu Justru Makin Percaya Diri?* (~64 dtk)
- `demo3` — *Gaji Naik tapi Tabungan Nol — Mengenal Efek Diderot dan Inflasi Gaya Hidup* (~65 dtk)
