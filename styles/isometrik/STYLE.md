---
id: isometrik
name: Isometrik
no: 58
source: github:isometric-diorama (awesome-opus5-5-videos)
family: 2D
tech: canvas2d
music: tech   voice: id-m   captions: bold
best_for: rantai pasok & logistik, cara kota/sistem bekerja, proses pabrik, ekonomi sederhana, perjalanan sebuah benda, sebelum-sesudah
---
# Isometrik

**Ciri khas (look):** proyeksi isometrik 2:1 di atas navy gelap #0F1530 dengan grid titik samar; blok-blok
kecil berdetail rendah dengan tiga nada (atas terang, kiri sedang, kanan gelap) dan tepi tipis; lantai abu
kebiruan, aspal #2B3358, taman hijau; aksen oranye #FF9F43, paket kraft #E0A86A, laser merah #FF4D5E, mint
#5FE0B5. Label melayang bernomor (pil putih + lingkaran nomor + garis titik ke objek), kartu "Lacak paket"
di atas dengan titik-titik progres dan penghitung mono.

**Gerak (motion):** kamera membuka dengan seluruh diorama (overview), menyelam dan mengikuti objek pahlawan
(rata-rata posisi beberapa saat terakhir = gerak halus), lalu menarik mundur lagi untuk penutup. Objek
berjalan di jalur berkunci (ban berjalan bergaris bergerak, truk, motor kurir, orang berjalan), laser scan
+ "BEEP" di setiap titik, label pop dengan pegas dan berubah jadi centang, siang→malam (bintang, lampu jalan,
lampu truk) saat perjalanan jauh.

**Kenapa menarik:** kepuasan ala SimCity: seluruh sistem terbaca sekilas, dunia mini terasa hidup dan bisa
"dijelajahi".

**Cerita yang cocok:**
- Paket online: "Paketmu berpindah tangan berkali-kali, tanpa pernah dibuka."
- Sampah plastik: "Botol yang kamu buang pagi ini... sore ini sudah di mana?"
- Air PDAM: "Air di keran-mu menempuh jalan sejauh ini."
- Sebutir beras: "Dari sawah ke piringmu, beras ini singgah di tujuh tempat."
- Listrik: "Lampu kamarmu menyala berkat pembangkit puluhan kilometer jauhnya."

**Rumus hook:** "[Benda]mu [melakukan perjalanan/berpindah] [berkali-kali]... tanpa [hal yang mengejutkan]." /
"Dari [titik A] ke [titik B]: [n] pemberhentian." / "Ikuti satu [benda] ini."

**Kit API (`styles/isometrik/kit.js`):**
- `iso(gx,gy,gz)` → [x,y]; `U` (ukuran tile); `spring`, `springKeys`, `sp`, `pathAt(t,[[t,gx,gy,gz],...])`.
- `box(ctx,gx,gy,gz,w,d,h,color,{top,alpha})` blok tiga nada; `slab(...)` lantai; `onPlane(ctx,gz,fn)` gambar di bidang atas.
- `person(ctx,gx,gy,gz,color,t,{walk})`, `parcel(ctx,gx,gy,gz,{glow})`, `conveyor(ctx,a,b,row,t,{axis})`,
  `truck(ctx,gx,gy,t,{night,moving})`, `bike(ctx,gx,gy,t,{rider})`, `tree`, `lamp(ctx,gx,gy,night)`, `house`.
- `tag(ctx,x,y,n,str,{p,done})` label bernomor, `scan(ctx,x0,y0,x1,y1,age)`, `beep(ctx,x,y,age)`, `halo(ctx,x,y,r,a,rgb)`.
- `stage(ctx,t,night)`: navy + grid titik + bintang saat malam. Urutan gambar: lantai dulu, lalu objek diurutkan (gx+gy).

**Demo:** "Perjalanan Paketmu dari Gudang ke Pintu", 20,0 detik. Overview diorama dengan enam label (Gudang,
Sortir, Truk, Hub kota, Kurir, Pintu) → gudang: diambil dari rak, dikemas, scan 1 → mesin sortir membaca label
dan membelokkan paket ke truk → malam: truk melaju di jalan berlampu → hub kota, kurir motor mengantar →
pindaian terakhir di pintu → overview lagi, lalu close-up paket di depan pintu dengan "?" ("Isinya:
rahasiamu."). Enam pindaian dihitung di kartu Lacak paket.
