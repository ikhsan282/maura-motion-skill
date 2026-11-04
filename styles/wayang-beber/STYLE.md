# Gaya: Wayang Beber

Wayang Beber adalah seni pertunjukan tertua di Nusantara: sebuah **gulungan kertas kulit kayu (*daluwang*) sepanjang beberapa meter** yang dilukis berurutan (4–5 adegan per gulungan) dan **dibentangkan di antara dua batang penggulung kayu** di bawah kerlip **lampu minyak (*blencong*)**. Sang dalang menunjuk tokoh dengan tongkat tanduk kerbau (***tuding***) sambil menuturkan kisah Panji dan cerita rakyat Jawa, sementara figur-figur lukisan di atas kertas menggerakkan kepala, tangan, dan langkah mereka secara halus.

## Ciri Visual
- **Tekstur Kertas Daluwang**: Warna krem tua hangat (`#e6d2a4`) dengan serat kulit kayu, noda usia, lipatan vertikal antar-adegan, serta bingkai ornamen merah-emas di tepi atas dan bawah gulungan.
- **Garis Tinta & Pigmen Mineral**: Seluruh figur dan latar digambar dengan garis tinta hitam tegas dan blok warna datar dari pigmen alami — merah gincu (`#b83423`), kuning oker (`#d69b38`), biru nila (`#243d5c`), hijau daun (`#3c6238`), dan prada emas (`#e2b24a`).
- **Wajah Tampak Samping Khas Wayang Beber**: Hidung mancung panjang, mata sipit memanjang, mahkota/sanggul *supit urang*, dan kain dodot bermotif parang/kawung.
- **Panggung Ruang Gelap & Lampu Minyak**: Gulungan dilihat di dalam ruangan kayu temaram dengan cahaya *blencong* yang bernapas mengikuti gerak api.

## Kit (`styles/wayang-beber/kit.js`)
- `PAL`, `SCROLL` (`H: 820, SCENE: 1000`) — palet pigmen daluwang dan dimensi gulungan.
- `scrollCanvas(key, scenes)` — merender seluruh adegan statis gulungan (lebar `N * 1000` piksel) ke dalam kanvas *offscreen* lengkap dengan serat kertas, lipatan, dan bingkai.
- `scrollWindow(ctx, S, u0, x, y, w)` — menampilkan potongan gulungan pada posisi geser `u0` lengkap dengan bayangan lengkung dekat batang penggulung.
- `roller(ctx, x, y, h, turn, r, { tied })` — menggambar batang penggulung kayu di sisi kiri dan kanan (opsional terikat pita merah `tied: true`).
- `figure(g, kind, opts)` — menggambar tokoh hidup di atas gulungan (`'putri'`, `'emban'`, `'raja'`, `'patih'`, `'jaka'`, `'abdi'`, `'warga'`) lengkap dengan animasi jalan, gerak lengan (`armF`, `armB`), menoleh (`look`), bicara (`mouth`), dan tari topeng barong (`mask`, `dance`, `drum`).
- `pendopo`, `gate`, `tree`, `vine`, `shape` — elemen arsitektur dan alam khas lukisan beber.
- `lamp`, `lampLight`, `flicker`, `tuding`, `cartouche` — lampu minyak gantung, pendar cahaya, tongkat *tuding* dalang, dan plakat judul berbingkai emas.

## Paket Demo (30–90 Detik)
1. **`demo1` — *Panji & Dewi Sekartaji — Misteri Adegan Ke-24 Wayang Beber Pacitan*** (`~52s`): Kisah pelarian Dewi Sekartaji dari Kediri, sayembara sang Raja, penyamaran Jaka Kembang Kuning sebagai pengamen topeng barong, hingga pantangan sakral adegan ke-24 yang tetap tergulung rapat.
2. **`demo2` — *Ande-Ande Lumut & Klenting Kuning — Kisah Kesetiaan dalam Gulungan Daluwang*** (`~55s`): Perjalanan saudari-saudari Klenting menyeberangi sungai yang dijaga kepiting raksasa Yuyu Kangkang, kesaktian pusaka lidi kuning milik Klenting Kuning, hingga pertemuan kembali Panji dan Sekartaji di Desa Dadapan.
3. **`demo3` — *Jaka Tarub & Selendang Nawangwulan — Kisah Telaga Bidadari di Gulungan Daluwang*** (`~55s`): Legenda tujuh bidadari di telaga hutan, selendang Nawangwulan yang disembunyikan, rahasia setangkai padi di dalam kukusan dapur, hingga kembalinya sang bidadari ke kahyangan.
