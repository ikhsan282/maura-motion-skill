---
id: riso-halftone
name: Risograph Halftone
no: 44
source: github:riso-halftone-print + github:halftone-riso-xerox
family: retro-digital
tech: canvas2d
music: folk   voice: id-m   captions: comic
best_for: sejarah musik & subkultur, kisah band, poster gigs, zine politik/budaya, tokoh seni, sejarah kota
---
# Risograph Halftone

**Ciri khas (look):** cetakan risograph di kertas krem #f3eee1 dengan 3 tinta spot: pink fluoro #ff48b0, biru
#0078bf, kuning #ffe800 (+ merah #ff665e untuk cap). Tinta saling tumpang (multiply) jadi ungu/hijau/oranye di
persilangan, tiap tinta sedikit meleset (misregistrasi), nada gelap-terang dibuat titik halftone kasar dengan
sudut layar berbeda per tinta, butir kertas dan bintik fotokopi. Tipografi zine: Archivo Black / Bebas Neue
besar, label selotip bertuliskan mesin tik (Special Elite), cap karet miring.

**Gerak (motion):** animasi 12fps (on twos) seperti cetakan, poster **tercetak lapis demi lapis** (roller
menyapu kuning → biru → pink), lapisan tinta bergeser lalu kembali pas (register) pada ketukan, kertas sedikit
bergetar, cap menghantam (skala 1,7 → 1), siluet band bergoyang memainkan gitar/bass/drum, jeruji turun dengan
pantulan dan naik saat bebas, tally hari bertambah, penonton bernyanyi bersama.

**Kenapa menarik:** tekstur cetak analog terasa dibuat tangan dan menonjol di antara visual AI yang licin;
warna fluoro sangat mencolok di feed; bahasa poster gigs cocok untuk cerita musik dan budaya.

**Cerita yang cocok:**
- Koes Bersaudara 1965: "Sebuah band dipenjara karena musik ngak-ngik-ngok."
- Dara Puspita: "Band perempuan Indonesia yang tur Eropa tahun 1960-an."
- Lahirnya dangdut: "Musik yang dulu diejek 'kampungan' kini masuk istana."
- Poster film Indonesia 80-an dilukis tangan: "Satu pelukis, satu malam, satu poster."
- Pameran seni rupa yang dibredel: "Lukisan yang diturunkan sehari setelah dipasang."
- Kaset pita bajakan Glodok: "Satu album, sejuta salinan, nol royalti."

**Rumus hook:** "Tahun [X], [pelaku seni] [dihukum/dilarang] karena [hal sepele]." / "Poster ini dicetak [kondisi
ekstrem]." / "[Karya] yang dulu dilarang... kini [dirayakan]."

**Kit API (`styles/riso-halftone/kit.js`):**
- `print()` → konteks cetak setengah resolusi (koordinat 1080x1920); `present(ctx, t, {grain, specks, shake})`.
- Tinta: `INK`, `PAPER`, `ink(g, name, t, fn(g), {tone, snap, amt})` (multiply + misregistrasi + nada halftone),
  `halftone(g, name, level)`, `reg(name, t)`.
- Bentuk: `type(g, str, x, y, {size, font, rot, spacing})`, `burst(g, cx, cy, r)`, `bars(g, x0, x1, top, bottom, {rise})`,
  `musician(g, x, y, s, 'guitar'|'bass'|'vocal'|'drums', t)`, `crowd(g, x0, x1, y, t)`, `record(g, x, y, r)`,
  `stamp(g, str, x, y, p)`, `tape(g, str, x, y)` (label selotip, warna normal), `passClip(g, p)` (sapuan roller).

**Demo:** "Band yang Dipenjara karena Lagu", 20,0 detik, 5 cetakan: poster gigs tercetak (sunburst kuning, band biru,
"1965" pink, NGAK-NGIK-NGOK) lalu jeruji jatuh + cap DIPENJARA! → "KOES BERSAUDARA", empat bersaudara bermain
dengan label TONNY/YON/YOK/NOMO, piringan "THE BEATLES", cap MUSIK BARAT: DILARANG → GLODOK: di balik jeruji,
tally hari sampai 90, "TANPA PENGADILAN" → jeruji naik, poster "KOES PLUS" tercetak lapis demi lapis → penonton
bernyanyi, label lagu (Kolam Susu, Bujangan, Kembali ke Jakarta), "DIPENJARA KARENA LAGU / DIKENANG LEWAT LAGU".
