# Gaya: Origami

Dunia miniatur tiga dimensi yang **seluruhnya terlipat dari kertas *washi* Jepang** — bangau kertas (*orizuru*) dengan sayap berengsel yang mengepak di udara, lembaran persegi bermotif tradisional (*asanoha*, *seigaiha*, *yagasuri*, *sakura*, *kikko*) yang melipat dirinya sendiri mengikuti garis lipatan gunung dan lembah, untaian seribu bangau (*senbazuru*), hingga struktur rekayasa modern seperti lipatan *Miura-ori* pada panel surya teleskop antariksa.

## Ciri Visual
- **Geometri Faset Kertas Tajam (`flatShading`)**: Setiap objek — burung bangau, pegunungan, pohon, rumah, awan, matahari, hingga boneka manusia — dibangun dari bidang segitiga datar dengan tepi lipatan yang tegas dan bayangan lembut di atas permukaan kayu atau kertas *washi*.
- **Tekstur Serat Washi Prosedural**: Dibuat secara dinamis dengan motif tradisional Jepang di sisi luar dan warna kertas polos/garis lipatan di sisi dalam (`DoubleSide`).
- **Animasi Lipatan Berengsel**: Lembaran kertas dapat melipat secara bertahap (`makeFoldSheet`) dan bertransformasi menjadi bangau 3D (`makeCrane`) maupun kisi-kisi *Miura-ori* yang mengembang.

## Kit (`styles/origami/kit.js`)
- `PAL`, `WASHI_COLORS` — palet warna kertas Jepang (vermilion, indigo, sakura, matcha, emas, krem washi).
- `createStage`, `lightRig`, `look`, `camLerp`, `orbit`, `toScreen` — pengaturan panggung Three.js, pencahayaan tiga titik (*key*, *hemisphere*, *rim*), dan kamera sinematik.
- `washi`, `paperMat`, `goldMat`, `skyTexture`, `paperFinish` — generator tekstur kertas *washi*, material `MeshStandardMaterial` berfaset datar, langit gradien berserat, serta *post-process* tekstur kertas dan vinyet.
- `makeFoldSheet`, `makeCrane`, `CRANE_POSE`, `mixPose`, `flap`, `craneStaticGeom`, `makeFlock`, `makeGarlands` — lembaran kertas berengsel, bangau utama berartikulasi, kawanan bangau (`InstancedMesh`), dan untaian gantung 1.000 bangau (*senbazuru*).
- `makeDoll`, `runPose`, `paperMountain`, `paperTree`, `paperHouse`, `paperCloud`, `paperSun`, `paperRibbon`, `paperGround`, `bunting` — tokoh dan elemen lanskap kertas lipat.
- `tag`, `title`, `counter`, `flecks` — label kertas terlipat, judul beraksen kanji dan cap merah (*hanko*), penghitung angka, serta partikel serpihan kertas.

## Paket Demo (30–90 Detik)
1. **`demo1` — *Seribu Bangau Kertas — Kisah Sadako Sasaki & Doa Perdamaian Hiroshima*** (`~52s`): Legenda *senbazuru* dan perjuangan Sadako Sasaki melipat lebih dari seribu bangau dari kertas bungkus obat hingga diabadikan pada Monumen Perdamaian Anak di Hiroshima.
2. **`demo2` — *Sains Lipatan Origami — Dari Kertas Washi ke Panel Surya Teleskop Antariksa*** (`~55s`): Bagaimana prinsip lipatan satu lembar kertas tanpa gunting dan lem melahirkan pola *Miura-ori* karya Koryo Miura untuk panel surya satelit, cermin teleskop antariksa, *stent* jantung mikro, dan kubah arsitektur tahan gempa.
3. **`demo3` — *Empat Musim di Desa Kertas Washi — Perjalanan Bangau Origami Melintasi Pegunungan Jepang*** (`~55s`): Perjalanan selembar kertas *washi* dari perendaman serat murbei di sungai musim semi, penjemuran di musim panas, lembah merah musim gugur, hingga festival seribu bangau di tengah salju musim dingin.
