---
id: kartun-3d-sinematik
name: Kartun 3D Sinematik
no: 2
source: drive:02_Kartun_3D_Sinematik + github:toon-cel-3d
family: 3D
tech: three
music: cinematic   voice: el-id-m   captions: bold
best_for: legenda Nusantara, dongeng anak, kisah asal-usul tempat, cerita keluarga, komedi situasi, fabel
---
# Kartun 3D Sinematik

**Ciri khas (look):** dunia film animasi 3D yang bulat dan lucu. Shading toon lembut 4 pita (ramp dengan tepi
halus, bukan cel keras) + **rim light** hangat/dingin di tepi objek + garis tinta tipis (#2a1a14) yang lebarnya
tetap dalam piksel. Tokoh chibi: kepala besar (pipi tembam), mata besar mengkilap (iris dua tingkat, pupil,
dua titik highlight, garis kelopak/bulu mata), alis yang bisa marah/kaget, mulut senyum/terbuka/cemberut, blush.
Langit kubah bergradasi dengan cahaya matahari dan bintang; kabut untuk kedalaman; bayangan kontak lembut.
Palet pagi: langit #3f74d0→#9fd0f5→#fff4dc, rumput #78b84f/#8fd16a; malam: #0d1438/#1f2f6a + jin #5fe3ff;
fajar: #ff6a3a/#ffc070. Judul: Luckiest Guy dengan gradasi emas, stroke cokelat tua, bayangan; nameplate pil gelap
bergaris emas (sub-teks Fredoka). Caption preset `bold`.

**Gerak (motion):** kamera selalu bergerak (crane, dolly, orbit, punch-in + hand-held drift), cut dengan kilat
hangat singkat. Tokoh berjalan/berlari dengan siklus kaki-lengan, berlutut, melambai, menunjuk, kaget (mata
melebar, iris mengecil, tangan ke pipi), marah (wajah memerah, uap). Gerak sekunder: kuncir rambut, selendang,
ujung sabuk dan iket berayun. Gerak khas: **squash & pop-in** ikon 3D kecil saat disebut, **speed lines** +
judul onomatope (DUAKK!, BRUKK!, KUKURUYUUK!), benda besar terlempar lalu jatuh dengan debu dan guncangan kamera.

**Kenapa menarik:** terasa seperti trailer film animasi, wajah ekspresif terbaca jelas di HP, dan legenda
lokal mendapat "kualitas bioskop" — kombinasi yang jarang di feed.

**Cerita yang cocok:**
- Sangkuriang & Tangkuban Perahu (`demo1/`): "Gunung ini sebenarnya perahu yang ditendang hingga terbalik."
- Malin Kundang & Kutukan Batu Pantai Air Manis (`demo2/`): "Di tepi Pantai Air Manis Sumatera Barat, terhampar bongkahan batu yang bentuknya persis seperti manusia sedang bersujud!"
- Roro Jonggrang & Seribu Candi Semalam (`demo3/`): "Pernahkah kamu bertanya mengapa kompleks Candi Prambanan yang megah ini disebut legenda Seribu Candi yang kurang satu?"
- Danau Toba: "Satu janji yang dilanggar menenggelamkan sebuah lembah."
- Si Kancil & Buaya: "Kancil menghitung buaya... untuk menyeberang sungai."

**Rumus hook:** "[Tempat terkenal] ini sebenarnya [benda/kejadian tak terduga]." / "[Tokoh] melakukan [hal
mustahil] dalam [batas waktu]." / "Satu [kesalahan kecil] mengubah [nasib besar]."

**Kit API (`styles/kartun-3d-sinematik/kit.js`):**
- `stage(AM, {pr})` → `{R, cam, ui, render(scene)}`: renderer WebGL + lapisan 2D di atasnya.
- `shootCam(cam, pos, look, fov, roll)`, `drift(t, amp)`, `toScreen(cam, x, y, z)`: kamera, getar halus, proyeksi ke layar.
- `toon(color, {map, emissive, vc, flat, side})`, `basic(color)`, `setRim(color, k)`: material toon + rim global.
- `outline(obj, w, color)`, `outlineMat()`: garis tinta (inverted hull) pada mesh/grup.
- `canvasTex`, `radialTex`, `batikTex(base, ink, accent, 'parang'|'kawung')`, `plankTex`, `bilikTex`: tekstur kanvas.
- `skyDome()`, `setSky(sky, {top, mid, bot, sun, sunC, sunK, stars})`, `mix(a, b, u)`, `lights(scene)` → `{key, hemi, back, set()}`.
- `terrain({w, d, seg, height, color})`, `tree('round'|'palm'|'pine'|'bamboo')`, `sway`, `water(w, d)`, `rock`, `blobShadow`.
- `character({kind:'woman'|'man'|'kid', skin, top, bottom, skirt, hair:'bun'|'short'|'kid', iket, sash, scarf, scar, lashes, eye})`.
- `pose(c, {x,y,z, ry, lean, twist, bob, squash, head:[yaw,pitch,roll], armL/armR:[maju,samping,siku], legL/legR:[maju,lutut], blink, mouth, open, brow, wide, look, blush, scar, t, vel})`.
- `walk(phase, amt, {run})`, `idle(t, seed)`, `blinkAt(t)`, `talk(t, on)`: siklus gerak siap pakai.
- `jin()`, `jinTick()`, `rooster()`, `roosterPose(r, {crow, flap})`, `boat({len, beam, depth})`, `house()`, `centong()`, `heart()`, `cloth()`.
- `burst({n, color, size, ...})` (debu/percikan, `.userData.tick(dt)`), `glow(color, s)`.
- 2D: `title(ctx, str, x, y, {size, pop, fill, stroke, rot})`, `nameplate(ctx, str, x, y, {sub, pop})`, `pointer()`,
  `dizzy()`, `rings()`, `finish(ctx, AM, t, {flash})`, `use(scene, ...objs)`.

**Demos:**
- **`demo1/` ("Sangkuriang & Tangkuban Perahu", 6 shot, voice `el-id-m`):** Gunung berubah jadi perahu, ditendang, jatuh terbalik (BRUKK!) → Sangkuriang melamar Dayang Sumbi → syarat danau dan perahu semalam → para jin memalu perahu → kain ajaib memerahkan langit timur, ayam berkokok → Sangkuriang menendang perahu menjadi Gunung Tangkuban Perahu.
- **`demo2/` ("Malin Kundang & Kutukan Batu Pantai Air Manis", 10 shot, ~55–65 dtk, voice `el-id-m`):** Batu bersujud di Pantai Air Manis → Malin pamit merantau pada Mande Rubayah → doa ibu di dermaga → kapal megah saudagar berlabuh → sambutan ibu yang ditolak dan didorong ke pasir → doa ibu ke langit kelam → badai petir dan ombak menghancurkan kapal → Malin membeku menjadi batu karang.
- **`demo3/` ("Roro Jonggrang & Seribu Candi Semalam", 10 shot, ~55–65 dtk, voice `el-id-m`):** Kompleks Candi Prambanan yang kurang satu → lamaran Bandung Bondowoso → syarat 1.000 candi dalam semalam → pemanggilan pasukan jin → pembangunan candi menembus kabut hingga 999 candi → Roro Jonggrang menumbuk lesung dan membakar jerami timur → ayam berkokok → jin kabur dan Bandung Bondowoso mengutuk sang putri menjadi arca ke-1.000.
