---
id: ui-morph
name: Morf Satu Bentuk UI
no: 32
source: github:ui-morph-minimal + one-shape-ui-morph (awesome-opus5-5-videos)
family: 2D
tech: canvas2d
music: tech   voice: el-id-m   captions: clean
best_for: alur aplikasi langkah demi langkah, fitur tersembunyi, tips produktivitas, layanan antar, perjalanan pesanan, loop yang bikin ditonton ulang
---
# Morf Satu Bentuk UI

**Ciri khas (look):** panggung abu-abu hangat #ECEAE6 (cahaya lembut di tengah), SATU bentuk hitam #0E0E10 dengan teks putih Inter, satu aksen oranye #FF5A1F. Bayangan lembut dua lapis yang membesar seiring "ketinggian" bentuk. Pointer ala macOS. Dilarang: gradien di UI, glow, partikel, gerak memantul berlebihan. Penghitung langkah kecil abu-abu ("03 / 08 Dikonfirmasi") di kiri atas.

**Gerak (motion):** bentuk tidak pernah dipotong atau diganti; ukuran, radius, posisi dan warnanya berpindah di pegas closed-form (redaman ~0,68, settle 0,36 s). Tepi depan dan belakang memakai pegas berbeda sehingga bentuk "meregang" seperti cairan. Isi berganti lewat roll vertikal singkat (masuk setelah bentuk mulai berubah, keluar sebelum bentuk berikutnya). Kamera ikut "menendang" sedikit di setiap morf. Frame terakhir = frame pertama (loop mulus).

**Kenapa menarik:** hipnotis, presisi level Dribbble, nol potongan terasa seperti sulap, dan loop-nya bikin penonton menonton ulang.

**Cerita yang cocok:**
- Pesan makan malam: "Lihat satu tombol ini... berubah jadi makan malammu."
- Pesan ojek: "Satu tombol, dari peta sampai bintang lima."
- 7 fitur tersembunyi HP: "Satu tombol. Tujuh trik yang belum pernah kamu pakai."
- Bayar tagihan: "Dari tombol Bayar sampai struk, tanpa pindah layar."
- Alarm pagi: "Satu bentuk menemani pagimu: alarm, cuaca, jadwal, kopi."

**Rumus hook:** "Lihat satu [tombol/bentuk] ini... berubah jadi [hasil akhir]." / "Satu [elemen]. [Angka] [trik/langkah]." / "Dari [awal] sampai [akhir], tanpa satu pun potongan."

**Kit API (`styles/ui-morph/kit.js`):**
- `spring`, `springKeys`, `sp`, `mix(hexA,hexB,u)`.
- `shapeAt(t,[[t,{x,y,w,h,r,elev,color}],...],{z,ts,lag})`: bentuk dari keadaan berkunci (tepi kiri/kanan beda pegas); `stateIndex(t,states)`.
- `stage(ctx,t)`, `shadow(ctx,x,y,w,h,r,elev)`, `body(ctx,shape,{press})`: panggung, bayangan 9-slice, badan.
- `swap(t,a,b,{inDur,outDur,roll})` → `{a,dy}` amplop roll isi; `label(...)`; `odometer(ctx,v,x,y,{size,digits})` digit bergulir.
- `G.spinner`, `G.check(ctx,x,y,s,p)`, `G.bell(ctx,x,y,s,swing)`, `G.star(ctx,x,y,r,fill)`, `G.pinHole`, `G.bag`.
- `pointer(ctx,x,y,{press})`, `pointerAt(t,keys,clicks)`, `ring(ctx,x,y,age)`, `stepper(ctx,t,steps,x,y)`.

**Paket 3 Demo (`demo1`, `demo2`, `demo3` — 30–90 detik, voice `el-id-m`):**
- **`demo1` — "Satu Tombol yang Berubah Jadi Makan Malammu — Seni Animasi UI Morph Tanpa Potongan"**: Tombol *"Pesan Rp45.000"* bermetamorfosis tanpa satu pun potongan menjadi loader, tanda centang oranye, pin restoran, kartu peta kurir, timer 12 menit, lonceng pintu, toast notifikasi, hingga 5 bintang penilaian.
- **`demo2` — "Dari Tombol Bayar Sampai Struk Digital — Satu Bentuk Mengawal Transaksimu Tanpa Pindah Layar"**: Satu kapsul *"Bayar Tagihan Rp125.000"* menyusut menjadi pemindai saldo, memercikkan centang oranye, memanjang menjadi lembar struk digital resmi, kapsul cashback koin, dan ulasan 5 bintang.
- **`demo3` — "Satu Kapsul di Pagi Hari — Dari Alarm Jam Enam Sampai Timer Fokus"**: Satu kapsul pintar di pagi hari berubah menjadi lonceng alarm 06.00, kartu cuaca pagi (`24°C Cerah`), penanda pengantaran kopi sarapan, jam Pomodoro 25 menit, hingga lencana target harian tuntas.
