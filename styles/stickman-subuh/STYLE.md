---
id: stickman-subuh
name: Stickman Subuh
no: 66
source: custom:stickman-duel-kit
family: craft
tech: canvas2d
music: lofi   voice: el-id-m   captions: clean
best_for: Disiplin waktu Subuh, perbandingan begadang vs tidur cukup, keheningan tahajud & gelombang otak, serta pembentukan kebiasaan 40 hari
---
# Stickman Subuh (`stickman-subuh`)

**Karakter Unik ("Si Fajar Berpeci" vs "Si Rebahan Malam"):**
- **Si Fajar Berpeci (`role: 'peci'`)**: Stickman monokrom putih bersih dengan **peci/kopiah berlis emas**, sabuk sarung zamrud (`#4ce0b3`), efek *onion-skin ghost trail* saat melangkah, pantulan cermin di lantai (`0.18` mirror reflection), serta halo cahaya hangat saat ruku dan sujud di atas sajadah.
- **Si Rebahan Malam (`role: 'sleepy'`)**: Stickman kontras di kamar sebelah dengan rambut acak-acakan bangun tidur, kantung mata lelah, dan sorot cahaya biru layar HP saat begadang.

**Kit API (`styles/stickman-subuh/kit.js`):**
- `PAL`, `cam`, `pop`, `pr`, `bg(ctx, t, opts)`
- `subuhHeader(ctx, tag, mainTitle, subTitle, opts)` — panel atas lengkap dengan Kalender Hari (`H-1` s/d `H-40`) dan Jam Digital (`04:42`)
- `drawRoomHalf(ctx, side, floorY, opts)` — kamar kiri/kanan dengan jendela bulan sabit, kasur, sajadah, dan riak gelombang alarm
- `subuhStickman(ctx, x, floorY, pose, opts)` — karakter berpeci (`'peci'`) vs begadang (`'sleepy'`) dengan pose `'sleep'`, `'phone-bed'`, `'wake-sit'`, `'walk'`, `'pray-takbir'`, `'pray-ruku'`, `'pray-sujud'`, lengkap dengan pantulan lantai & *ghosting*
- `subuhCard(ctx, x, y, w, h, opts)` — kartu metrik neurosains & kebiasaan di bawah lantai reflektif

**Demos:**
- `demo1` — *Alarm yang Sama, Subuh yang Sama — Bagaimana 40 Hari Mengubah Beban Menjadi Panggilan Hati* (~64 dtk)
- `demo2` — *Begadang Scroll HP vs Tidur Tepat Waktu — Apa yang Terjadi pada Otak Saat Jam Tiga Pagi?* (~64 dtk)
- `demo3` — *Keheningan Sepertiga Malam — Sains Gelombang Otak Alfa, Fokus, dan Ketenangan Tahajud* (~65 dtk)
