---
id: ui-morph
name: Morf Satu Bentuk UI
no: 32
source: github:ui-morph-minimal + one-shape-ui-morph (awesome-opus5-5-videos)
family: 2D
tech: canvas2d
music: tech   voice: id-f   captions: clean
best_for: alur aplikasi langkah demi langkah, fitur tersembunyi, tips produktivitas, layanan antar, perjalanan pesanan, loop yang bikin ditonton ulang
---
# Morf Satu Bentuk UI

**Ciri khas (look):** panggung abu-abu hangat #ECEAE6 (cahaya lembut di tengah), SATU bentuk hitam #0E0E10
dengan teks putih Inter, satu aksen oranye #FF5A1F. Bayangan lembut dua lapis yang membesar seiring
"ketinggian" bentuk. Pointer ala macOS. Dilarang: gradien di UI, glow, partikel, gerak memantul berlebihan.
Penghitung langkah kecil abu-abu ("03 / 08 Dikonfirmasi") di kiri atas.

**Gerak (motion):** bentuk tidak pernah dipotong atau diganti; ukuran, radius, posisi dan warnanya berpindah
di pegas closed-form (redaman ~0,68, settle 0,36 s). Tepi depan dan belakang memakai pegas berbeda sehingga
bentuk "meregang" seperti cairan. Isi berganti lewat roll vertikal singkat (masuk setelah bentuk mulai
berubah, keluar sebelum bentuk berikutnya). Kamera ikut "menendang" sedikit di setiap morf. Frame terakhir =
frame pertama (loop mulus). Teaser cepat di hook: bentuk berkedip melewati semua keadaan dalam ~1 detik.

**Kenapa menarik:** hipnotis, presisi level Dribbble, nol potongan terasa seperti sulap, dan loop-nya bikin
penonton menonton ulang.

**Cerita yang cocok:**
- Pesan makan malam: "Lihat satu tombol ini... berubah jadi makan malammu."
- Pesan ojek: "Satu tombol, dari peta sampai bintang lima."
- 7 fitur tersembunyi HP: "Satu tombol. Tujuh trik yang belum pernah kamu pakai."
- Bayar tagihan: "Dari tombol Bayar sampai struk, tanpa pindah layar."
- Alarm pagi: "Satu bentuk menemani pagimu: alarm, cuaca, jadwal, kopi."

**Rumus hook:** "Lihat satu [tombol/bentuk] ini... berubah jadi [hasil akhir]." / "Satu [elemen]. [Angka]
[trik/langkah]." / "Dari [awal] sampai [akhir], tanpa satu pun potongan."

**Kit API (`styles/ui-morph/kit.js`):**
- `spring`, `springKeys`, `sp`, `mix(hexA,hexB,u)`.
- `shapeAt(t,[[t,{x,y,w,h,r,elev,color}],...],{z,ts,lag})`: bentuk dari keadaan berkunci (tepi kiri/kanan beda pegas); `stateIndex(t,states)`.
- `stage(ctx,t)`, `shadow(ctx,x,y,w,h,r,elev)`, `body(ctx,shape,{press})`: panggung, bayangan 9-slice, badan.
- `swap(t,a,b,{inDur,outDur,roll})` → `{a,dy}` amplop roll isi; `label(...)`; `odometer(ctx,v,x,y,{size,digits})` digit bergulir.
- `G.spinner`, `G.check(ctx,x,y,s,p)`, `G.bell(ctx,x,y,s,swing)`, `G.star(ctx,x,y,r,fill)`, `G.pinHole`, `G.bag`.
- `pointer(ctx,x,y,{press})`, `pointerAt(t,keys,clicks)`, `ring(ctx,x,y,age)`, `stepper(ctx,t,steps,x,y)`.

**Demo:** "Satu Tombol yang Berubah Jadi Makan Malammu", 19,6 detik. Tombol "Pesan Rp45.000" → teaser kilat
(pin, peta, timer, bintang) → klik → loader → centang oranye → pin restoran (ekor tumbuh) → kartu peta dengan
titik kurir melaju → timer 12 menit (digit bergulir, cincin menipis) → bel berayun dengan cincin "ting tong" →
toast "Kurir di depan pintu" → lima bintang (pointer mengklik bintang kelima) → kembali jadi tombol (loop).
