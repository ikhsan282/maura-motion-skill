---
id: riso-halftone
name: Risograph Halftone
no: 44
source: github:riso-halftone-print + github:halftone-riso-xerox
family: retro-digital
tech: canvas2d
music: folk   voice: el-id-m   captions: comic
best_for: sejarah musik & subkultur, kisah band, poster gigs, zine politik/budaya, tokoh seni, sejarah kota
---
# Risograph Halftone

**Ciri khas (look):** cetakan risograph di kertas krem `#f3eee1` dengan 3 tinta spot: pink fluoro `#ff48b0`, biru `#0078bf`, kuning `#ffe800` (+ merah `#ff665e` untuk cap). Tinta saling tumpang (*multiply*) jadi ungu/hijau/oranye di persilangan, tiap tinta sedikit meleset (*misregistrasi*), nada gelap-terang dibuat titik halftone kasar dengan sudut layar berbeda per tinta, butir kertas dan bintik fotokopi. Tipografi zine: `Archivo Black` / `Bebas Neue` besar, label selotip bertuliskan mesin tik (`Special Elite`), cap karet miring.

**Gerak (motion):** animasi 12fps (*on twos*) seperti cetakan, poster **tercetak lapis demi lapis** (roller menyapu kuning → biru → pink), lapisan tinta bergeser lalu kembali pas (*register*) pada ketukan, kertas sedikit bergetar, cap menghantam (skala 1,7 → 1), siluet band bergoyang memainkan gitar/bass/drum, jeruji turun dengan pantulan dan naik saat bebas, piringan hitam berputar, penonton bernyanyi bersama.

**Kenapa menarik:** tekstur cetak analog terasa dibuat tangan dan menonjol di antara visual AI yang licin; warna fluoro sangat mencolok di feed; bahasa poster gigs cocok untuk cerita musik dan budaya.

**Cerita yang cocok:**
- Koes Bersaudara 1965: "Sebuah band dipenjara karena musik ngak-ngik-ngok."
- Dara Puspita 1968: "Empat gadis Surabaya yang mengguncang 250+ panggung rock Eropa."
- Studio Lokananta Solo 1956: "Pabrik piringan hitam pertama yang merekam jiwa musik Nusantara."
- Poster film Indonesia 80-an dilukis tangan: "Satu pelukis, satu malam, satu poster."
- Kaset pita bajakan Glodok: "Satu album, sejuta salinan, nol royalti."

**Rumus hook:** "Tahun [X], [pelaku seni] [dihukum/dilarang/menembus dunia] karena [kisah unik]." / "Poster ini dicetak [kondisi ekstrem]." / "[Karya] yang dulu dilarang... kini [dirayakan]."

**Kit API (`styles/riso-halftone/kit.js`):**
- `print()` → konteks cetak setengah resolusi (koordinat 1080x1920); `present(ctx, t, {grain, specks, shake})`.
- Tinta: `INK`, `PAPER`, `ink(g, name, t, fn(g), {tone, snap, amt})` (multiply + misregistrasi + nada halftone), `halftone(g, name, level)`, `reg(name, t)`.
- Bentuk: `type(g, str, x, y, {size, font, rot, spacing})`, `burst(g, cx, cy, r)`, `bars(g, x0, x1, top, bottom, {rise})`, `musician(g, x, y, s, 'guitar'|'bass'|'vocal'|'drums', t)`, `crowd(g, x0, x1, y, t)`, `record(g, x, y, r)`, `stamp(g, str, x, y, p)`, `tape(g, str, x, y)` (label selotip, warna normal), `passClip(g, p)` (sapuan roller).

**Demo (3 Skenario Lengkap, ~62–65 dtk, voice `el-id-m`):**
1. **`demo1` — Band yang Dipenjara karena Lagu: Koes Bersaudara 1965 (~62 dtk):** Kisah empat bersaudara (Tonny, Yon, Yok, Nomo) yang ditahan 98 hari di Penjara Glodok karena memainkan lagu *The Beatles* yang dicap musik "ngak-ngik-ngok", hingga bangkit menjadi grup legendaris Koes Plus.
2. **`demo2` — Dara Puspita: Empat Gadis Surabaya yang Mengguncang Panggung Eropa 1968 (~64 dtk):** Kisah pionir band garage rock perempuan Indonesia (Titiek AR, Lies AR, Titiek Hamzah, Susy Nander) dari album *Jang Pertama* hingga tur 250+ panggung melintasi Jerman Barat, Belanda, Inggris, Prancis, Spanyol, dan Hungaria.
3. **`demo3` — Studio Lokananta Solo 1956: Pabrik Piringan Hitam Pertama Nusantara (~65 dtk):** Sejarah berdirinya Lokananta di Surakarta oleh R. Maladi dan Oetojo Soemowidjojo, merekam Gesang (*Bengawan Solo*), Waldjinah (*Walang Kekek*), Bing Slamet, serta menyimpan master asli *Indonesia Raya* 3 stanza dan arsip 40.000+ piringan hitam.
