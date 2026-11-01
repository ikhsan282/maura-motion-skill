---
id: neo-brutalist
name: Bento Neo-Brutalis
no: 41
source: github:neo-brutalist-bento (awesome-opus5-5-videos)
family: 2D
tech: canvas2d
music: tech   voice: id-f   captions: comic
best_for: rincian harga, ke mana uangmu pergi, perbandingan, statistik, listicle, "cara sistem ini bekerja", keuangan Gen Z
---
# Bento Neo-Brutalis

**Ciri khas (look):** latar krem #F4F1E8 dengan titik-titik yang bergeser, papan bento ubin warna jenuh: lime
#C6F432, coral #FF5A4E, kobalt #3A5BFF, kuning #FFD500, lavender #B9A6FF, pink #FF9ED2. Garis hitam tebal
5 px, bayangan offset keras 10 px tanpa blur, arsiran diagonal yang bergulir, label pil mono (Space Mono),
angka besar Archivo Black, bar progres dengan sisa berarsir, tokoh gelas kopi bermata. Label "PERKIRAAN"
wajib di angka ilustratif.

**Gerak (motion):** ubin muncul dengan pegas keras (overshoot besar) dan sedikit getar bertingkat, papan
reflow (ubin pindah dan berubah ukuran) di setiap beat, angka bergulir, bar terisi, tokoh memantul
squash-stretch setiap ada ubin baru dan mengganti ekspresi (senang/kaget).

**Kenapa menarik:** energi tinggi, angka sangat terbaca, estetika web Gen-Z yang menonjol di antara konten
minimalis beige.

**Cerita yang cocok:**
- Kopi susu kekinian: "Segelas Rp25.000... petani kopinya cuma dapat sekitar Rp1.300."
- Harga tiket konser: "Dari Rp1,5 juta tiketmu, berapa yang sampai ke penyanyinya?"
- Gaji pertama: "Gaji Rp5 juta, tapi yang benar-benar bisa kamu pakai cuma segini."
- Ongkir gratis: "Gratis ongkir itu tidak pernah gratis. Ini yang membayarnya."
- Harga mi instan: "Kenapa mi instan bisa semurah ini?"

**Rumus hook:** "Dari [harga] [barang]... [pihak tak terlihat] cuma dapat [angka kecil]." / "[Angka besar]
— ke mana perginya?" / "[Barang sehari-hari] dibedah jadi [n] kotak."

**Kit API (`styles/neo-brutalist/kit.js`):**
- `spring`, `springKeys`, `sp`, `count`, `rp(n)` → "Rp25.000".
- `rectAt(t,[[t,[x,y,w,h]|null],...])` → `{x,y,w,h,s}`: ubin yang reflow antar layout (null = sembunyi dengan pop).
- `stage(ctx,t)`, `tile(ctx,R,{fill,hatchIt})`, `inTile(ctx,R,fn)`, `hatch(ctx,x,y,w,h,{t})`.
- `text(ctx,str,x,y,{size,font,maxW})`, `pill(ctx,str,x,y,{fill,align})`, `bar(ctx,x,y,w,h,p,{fill})`, `badge(ctx,n,x,y)`.
- `ICON.{bean,milk,sugar,cup,home,person,bolt,coins,leaf}`, `cupGuy(ctx,x,y,s,{t,mood,squash,wave})`, `jit(t,t0)`.

**Demo:** "Ke Mana Perginya Uang Kopi Susu Kekinianmu?", 19,8 detik. Gelas kopi + Rp25.000 + petani Rp1.300
(≈5%) → bahan ≈Rp6.500 (kopi 2.500, susu 2.000, gula 500, gelas & es 1.500) → sisanya ≈Rp18.500: sewa, gaji
barista, listrik, untung kedai → dari harga biji kopi ≈Rp2.500, petani ≈Rp1.300 (sekitar separuh) → "5%" dan
gelas 100 kotak dengan 5 kotak lime. Sumber perkiraan: HPP es kopi susu dari UKM Indonesia (biji 18 g
Rp2.500, susu Rp2.000, gula Rp500, es Rp200, cup Rp1.300); harga robusta petani Rp55–69 ribu/kg (detik,
Okt 2024) → ±22 g biji hijau per gelas ≈ Rp1.200–1.500.
