---
id: stickman-kisah
name: Stickman Kisah
no: 68
source: custom:garis-hidup-antrean
family: social
tech: canvas2d
music: lofi   voice: el-id-m   captions: clean
best_for: cerita moral 1 menit, utang & janji, etika antrean, kejujuran & tanggung jawab sosial
---
# Stickman Kisah

**Karakter Unik (Anatomi Kapsul *Garis Hidup*):**
- **Si Suara Hati (`role: 'hero'`)**: Torso berbentuk **kapsul/tunika bervolume** dengan **lencana hati emas di dada**, **syal suara hati keemasan yang berkibar**, serta aura lembut hijau zamrud di sekeliling tubuh.
- **Si Pelanggar Etika (`role: 'rival'`)**: Torso kapsul ber-**rompi kerah tegak merah koral**, **kacamata hitam miring**, dan rambut jabrik belakang dengan gestur memohon (`beg`), menghindar (`evade`), atau kabur (`run`).
- **Warga / Saksi (`role: 'citizen'`)**: Torso kapsul biru langit dengan tali kartu identitas (*lanyard*).

**Ciri khas (look):** Panggung cerita moral gelap (`#0a0e14`) dengan papan judul gantung berantai (`hangingSign`), sorot lampu panggung, properti tematik (`utang`: meja & amplop cokelat; `antrean`: loket & garis kuning-hitam; `parkir`: sedan biru, baret bemper & kertas pesan tanggung jawab), balon dialog, serta kartu refleksi moral di paruh bawah layar.

**Kit API (`styles/stickman-kisah/kit.js`):**
- `K.kisahBg(ctx, t, { floorY, signText, signCol })`
- `K.kisahHeader(ctx, epTag, mainTitle, subTitle, { badge, col, a })`
- `K.kisahStageProps(ctx, floorY, theme, { phase, t })`
- `K.kisahStickman(ctx, x, floorY, pose, { role: 'hero'|'rival'|'citizen', facing, t, a, label })`
- `K.kisahBubble(ctx, x, y, text, { col, tailX, a })`
- `K.kisahCard(ctx, x, y, w, h, { tag, titleStr, subStr, stat, statSub, col, a })`

**3 Demo (64–65 dtk, voice `el-id-m`):**
1. `demo1`: *Kisah Utang & Amplop Cokelat — Mengapa yang Meminjam Lebih Galak Saat Ditagih?*
2. `demo2`: *Satu Langkah Menyerobot Antrean — Ujian Kecil yang Membuka Karakter Asli Seseorang*
3. `demo3`: *Baret di Parkiran & Selembar Kertas — Berani Tanggung Jawab Saat Tidak Ada yang Melihat*
