---
id: neo-brutalist
name: Bento Neo-Brutalis
no: 41
source: github:neo-brutalist-bento (awesome-opus5-5-videos)
family: 2D
tech: canvas2d
music: tech   voice: el-id-m   captions: comic
best_for: rincian harga, ke mana uangmu pergi, perbandingan, statistik, listicle, "cara sistem ini bekerja", keuangan Gen Z
---
# Bento Neo-Brutalis

**Ciri khas (look):** latar krem `#F4F1E8` dengan titik-titik yang bergeser, papan bento ubin warna jenuh: lime `#C6F432`, coral `#FF5A4E`, kobalt `#3A5BFF`, kuning `#FFD500`, lavender `#B9A6FF`, pink `#FF9ED2`. Garis hitam tebal 5 px, bayangan offset keras 10 px tanpa blur, arsiran diagonal yang bergulir, label pil mono (`Space Mono`), angka besar `Archivo Black`, bar progres dengan sisa berarsir, maskot objek bermata (`cupGuy`, tiket, paket kardus). Label `"PERKIRAAN"` wajib di angka ilustratif.

**Gerak (motion):** ubin muncul dengan pegas keras (overshoot besar) dan sedikit getar bertingkat, papan reflow (ubin pindah dan berubah ukuran) di setiap beat, angka bergulir, bar terisi, tokoh memantul squash-stretch setiap ada ubin baru dan mengganti ekspresi (senang/kaget).

**Kenapa menarik:** energi tinggi, angka sangat terbaca, estetika web Gen-Z yang menonjol di antara konten minimalis beige.

**Cerita yang cocok:**
- Kopi susu kekinian: "Segelas Rp25.000... petani kopinya cuma dapat sekitar Rp1.300."
- Harga tiket konser: "Dari Rp1,5 juta tiketmu, berapa yang sampai ke penyanyinya?"
- Ongkir gratis: "Gratis ongkir itu tidak pernah gratis. Ini yang membayarnya."
- Gaji pertama: "Gaji Rp5 juta, tapi yang benar-benar bisa kamu pakai cuma segini."
- Harga mi instan: "Kenapa mi instan bisa semurah ini?"

**Rumus hook:** "Dari [harga] [barang]... [pihak tak terlihat] cuma dapat [angka kecil]." / "[Angka besar] — ke mana perginya?" / "[Barang sehari-hari] dibedah jadi [n] kotak."

**Kit API (`styles/neo-brutalist/kit.js`):**
- `spring`, `springKeys`, `sp`, `count`, `rp(n)` → `"Rp25.000"`.
- `rectAt(t,[[t,[x,y,w,h]|null],...])` → `{x,y,w,h,s}`: ubin yang reflow antar layout (`null` = sembunyi dengan pop).
- `stage(ctx,t)`, `tile(ctx,R,{fill,hatchIt})`, `inTile(ctx,R,fn)`, `hatch(ctx,x,y,w,h,{t})`.
- `text(ctx,str,x,y,{size,font,maxW})`, `pill(ctx,str,x,y,{fill,align})`, `bar(ctx,x,y,w,h,p,{fill})`, `badge(ctx,n,x,y)`.
- `ICON.{bean,milk,sugar,cup,home,person,bolt,coins,leaf,ticket,mic,box,truck}`, `cupGuy(ctx,x,y,s,{t,mood,squash,wave})`, `jit(t,t0)`.

**Demo (3 Skenario Lengkap, ~62–65 dtk, voice `el-id-m`):**
1. **`demo1` — Ke Mana Perginya Uang Kopi Susu Kekinianmu? (~62 dtk):** Bedah struk es kopi susu Rp25.000: bahan baku ≈Rp6.500 (biji kopi Rp2.500, susu Rp2.000, gula Rp500, gelas & es Rp1.500), operasional & untung kedai ≈Rp18.500, hingga porsi bersih petani kopi ≈Rp1.300 (5%).
2. **`demo2` — Dari Rp1,5 Juta Tiket Konsermu, Berapa yang Sampai ke Penyanyinya? (~64 dtk):** Bedah ekonomi tiket konser Rp1.500.000: pajak hiburan & platform tiket ≈20% (Rp300.000), sewa stadion & produksi panggung ≈35% (Rp525.000), promotor & risiko ≈15% (Rp225.000), dan fee artis kotor Rp450.000 yang menyisakan ≈Rp240.000 (16%) bersih untuk musisi.
3. **`demo3` — Rahasia di Balik Label Gratis Ongkir (~65 dtk):** Bedah checkout belanja Rp100.000 dengan voucher Gratis Ongkir Rp0: potongan komisi admin & program ongkir penjual UMKM ≈10% (Rp10.000), iklan ≈5% (Rp5.000), modal barang & kemasan ≈Rp68.000, alokasi kurir lapangan ≈Rp2.500/paket, dan margin bersih UMKM ≈17%.
