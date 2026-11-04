# Gaya: Kolase Daun & Bunga

Karya seni **herbarium hidup dan kolase botani (*pressed leaf & flower collage / oshibana*)** di atas lembaran kertas kapas krem: bunga raksasa, kantong semar, serangga, dan burung yang **seluruhnya disusun dari daun kering berurat, kelopak bunga pres, ranting kayu, dan biji-bijian** yang direkatkan menggunakan pita kertas herbarium (*mounting strips*).

## Ciri Visual
- **Lembaran Kertas Herbarium (`bg`)**: Kertas kapas krem tua (`#efe6d2` → `#d6c5a3`) dengan garis bingkai ganda museum botani dan serat tumbuhan alami yang terpres di dalam kertas.
- **Daun Berurat & Kelopak Pres**: Setiap helai daun (`leaf`) memiliki tulang daun tengah, urat samping, tangkai ranting, serta bayangan lembut di atas kertas; kelopak bunga (`flower`, `rafflesia`) tersusun melingkar dengan bintik dan benang sari.
- **Pita Perekat & Kartu Spesimen (`herbariumTape`, `herbariumLabel`)**: Ranting dan daun ditempel dengan strip kertas kecil sebagaimana koleksi ilmiah di Herbarium Bogoriense, dilengkapi kartu spesimen bertuliskan nama ilmiah Latin.

## Kit (`styles/kolase-daun-bunga/kit.js`)
- `PAL`, `stepT(t, 12)`, `cam`, `pop`, `pr`, `bg(ctx, t)` — palet botani alami, kuantisasi waktu *stop-motion* halus, dan lembaran latar herbarium.
- `leaf(ctx, x, y, len, wid, ang, col, opts)` — daun pres dengan urat daun dan pita perekat opsional (`tape: true`).
- `flower(ctx, x, y, r, petal, core, opts)` — bunga kelopak pres yang dapat mekar (`open` 0→1).
- `rafflesia(ctx, x, y, r, opts)` — *Rafflesia arnoldii* berkelopak lima merah bata dengan bintik kutil putih, cincin diafragma, dan gelombang aroma (`scent: true`).
- `kantongSemar(ctx, x, y, s, opts)` — tumbuhan pemangsa serangga *Nepenthes* lengkap dengan daun, sulur melingkar, kantong bercorak merah, bibir licin (*peristome*), dan katup penutup (*operculum*).
- `leafCreature(ctx, kind, opts)` — satwa yang dirangkai dari kepingan daun kering, kelopak bunga, ranting, dan biji (`'lalat'`, `'kupu'`, `'burung'`).
- `twig`, `herbariumTape`, `herbariumLabel`, `title`, `caption` — ranting merambat, pita perekat spesimen, dan plakat kartu herbarium.

## Paket Demo (30–90 Detik)
1. **`demo1` — *Rafflesia arnoldii — Bunga Raksasa Berbau Bangkai dari Hutan Bengkulu*** (`~55s`): Keunikan puspa langka Indonesia yang hidup sebagai parasit tanpa daun, batang, maupun akar pada sulur *Tetrastigma*, mekar hingga 1 meter, memikat lalat penyerbuk dengan bau bangkai, hingga perbedaannya dengan bunga bangkai *Amorphophallus titanum*.
2. **`demo2` — *Kantong Semar Nusantara — Tumbuhan Pemangsa Serangga di Tanah Miskin Hara*** (`~55s`): Evolusi cerdas tumbuhan karnivora *Nepenthes* di hutan Kalimantan dan Sumatera: ujung daun yang memanjang menjadi kantong jebakan, nektar manis dan bibir kantong super licin, cairan enzim pencerna, hingga simbiosis unik dengan tupai gunung.
3. **`demo3` — *Seni Herbarium & Kolase Botani — Bagaimana Daun Kering Menyimpan Memori Hutan Tropis*** (`~55s`): Perpaduan seni kolase daun kering (*oshibana*) yang merangkai kupu-kupu dan burung dari guguran daun, serta peran penting 950.000 spesimen kering di Herbarium Bogoriense dalam merekam sejarah iklim dan keanekaragaman hayati Nusantara.
