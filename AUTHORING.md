# Authoring an AniMasters style

A style is a reusable look **plus** a demo short that proves it. Everything is drawn by code, frame by
frame, in headless Chrome; narration, music and sound effects are made offline. No image models, no stock,
no downloads at render time.

```
styles/<id>/
  STYLE.md        the style card (template at the bottom): look, motion, why it works, stories it fits, kit API
  kit.js          reusable drawing primitives for this look (ES module)
  demo/
    story.json    the script: lines (narration), voice, music, sfx
    scene.js      the demo short: shots timed to the narration, built with kit.js
    build/        generated (timeline.json, narration.wav, stills/, video.mp4, mix.wav)
    out/<slug>.mp4  the finished short
```

Reference implementation: `styles/wayang-kulit/` (kit.js + demo/scene.js). Read it before you start: it
shows the shot table, cue timing, hand-held props, camera, titles, SFX and the per-cut flash.

## 1. Commands

```bash
SK=/home/claude/animasters            # the skill root (on a user's machine: ~/.claude/skills/animasters)
python3 $SK/audio/tts.py <demo>        # narrate story.json -> build/narration.wav + build/timeline.json (cue times)
node $SK/engine/render.mjs <demo> --stills 0.5,3,7.2,12    # PNG stills + build/stills/sheet.png (look at it!)
node $SK/engine/render.mjs <demo> --range 10:14            # render a few seconds of motion -> build/video.mp4
node $SK/scripts/make.mjs <demo>       # everything: narrate, render, score, mix (-14 LUFS), mux -> demo/out/<slug>.mp4
python3 $SK/audio/music.py x --list    # music presets
```
Stills/renders wait for a free slot automatically (shared machine). Narration is cached: re-running is free
unless the lines change.

## 2. The script (story.json)

```json
{
  "title": "Arjuna di Kurusetra", "slug": "11_wayang-kulit", "style": "wayang-kulit",
  "lang": "id", "voice": "id-m", "music": { "preset": "gamelan", "db": -15 },
  "lead": 0.5, "tail": 2.0, "pause": 0.25,
  "lines": [
    { "id": "hook", "text": "Kesatria terhebat di dunia... menjatuhkan busurnya, sebelum perang dimulai.", "pause": 0.5 },
    { "id": "perang", "text": "Dan perang besar Bharatayudha pun dimulai.", "say": "Dan perang besar Baratayuda pun dimulai." }
  ]
}
```
- **Bahasa Indonesia**, natural spoken register ("kamu"), **4–6 lines, 38–48 words → 15–20 s. HARD LIMIT: the finished video is ≤ 20.0 s** (lead 0.3, pause 0.2, tail 1.0). `tts.py` refuses to pass a story over 20 s.
- `id` per line (short, unique): your shots key off these cue ids.
- `say` = what the narrator pronounces when it differs from the caption (foreign names, English words,
  abbreviations, numbers you want read a certain way). The narrator reads Indonesian phonetically:
  write English words the way an Indonesian would say them (`"say": "...tombol lek..."`).
- Voices: `id-m` (male, default), `id-f` (female), `id-m2` (deeper male), `id-f2` (soft female). English: `en-m`, `en-f`, `en-story`.
- Music presets: gamelan, gamelan-pelog, lofi, cinematic, synthwave, darksynth, musicbox, folk, ambient,
  dreamy, ragtime, anime, tech, playful, noir, hype, tribal, japanese, chiptune. `db` (default -17) sets level under the voice.
- `"captions": false` turns burnt-in captions off (only for styles whose visuals ARE the words, e.g. kinetic type).

### Story craft (this is what makes it watchable)
1. **Hook in line 1** (≤ 14 words): a bold claim, a paradox, a stake or a mystery that makes line 2 necessary.
   Examples: "Gunung ini... sebenarnya perahu yang ditendang hingga terbalik." / "Kenapa harga selalu Rp99.000?"
2. The **visual hook happens in the first second**: motion on frame 1, the style's signature move on screen
   immediately (no slow fade from black, no logo).
3. In 20 s there is room for: hook → 2–3 fast beats → turn → payoff. Context fast (who/where), a **turn at ~2/3** ("Tapi...", "Lalu..."), a payoff, and a
   **last line that lands** (moral, callback to the hook, or a twist). Give it ~1 s of tail.
4. One idea per line. A new picture every 1.5–3 s (cut or big camera move). Name things on screen when the
   narrator names them (nameplates, labels, numbers counting up).
5. The story must play to the style's strength (the catalog gives you the story and hook; refine the words,
   keep the facts). **Verify every factual claim with a web search**; if a number is disputed say "sekitar"/
   "konon"/"menurut catatan". Never invent quotes for real people.

## 3. The scene (scene.js)

```js
import * as K from '/styles/<id>/kit.js';          // your kit
import * as THREE from 'three';                     // if 3D (three r170 + 'three/addons/...')
const { clamp, lerp, ease, prog, env, noise, hrand } = AM.lib;   // AM is global

export const meta = { fps: 24, hold: 1, captions: { preset: 'serif', y: 1480 } };
export async function setup(AM) { /* layers, caches, three scene, AM.sfx(...) cues */ }
export function render(t, AM) { /* draw frame at time t (seconds). Pure function of t. */ }
```

**AM API** (see engine/runtime.js, engine/lib/*.js)
- `AM.W, AM.H` (1080×1920), `AM.fps`, `AM.duration`, `AM.timeline.lines` ([{id,text,start,end,words:[{w,start,end}]}]).
- `AM.cue(id)` → line timing; `AM.wordTime(id, 'kata' | index)` → when a word is spoken (sync big beats to words).
- `AM.layer(name, {z, type:'2d'|'webgl', autoClear:true, scale:1})` → 2D context or a canvas for WebGL.
  2D layers are cleared every frame unless `autoClear:false`. Captions are drawn on their own top layer.
- `AM.sfx(type, time, {gain, pitch, pan})` — register sound effects in `setup` (types below).
- `AM.painter(look, {overrides, scale})` → the Shorts Animator paint pass (oil / watercolor / gouache /
  pastel / ink or a custom look object). Draw FLAT with `P.kit(t, p, seed)` (sky, ridge, ground, water,
  trees, house, city, person with poses…, see engine/sa/KIT.md) or with `P.g` (2D ctx), then `P.paint(tick)`.
  On this CPU-only machine use `scale: 0.5`–`0.6` and `hold: 3`; on a GPU it runs at full size.
- `AM.lib`: math/easing (`clamp lerp map smoothstep ease.* prog(t,a,b,ease) env(t,a,b,in,out)`), randomness
  (`RNG`, `hrand(...)` stateless, `mulberry32`), `noise.n2/n3/fbm2`, `onTwos(t,fps,n)`, `boil(t,seed,amp)`,
  colour (`rgba mixHex shade`), drawing (`makeCanvas cached roundRect paperTexture grain vignette wobblyPath
  roughLine roughRect roughCircle blob brushStroke text wrap speedLines drawCover camera shakeOffset`).
- `AM.rng(seed)`, `AM.load(url)` (images you generated yourself, e.g. a canvas saved in the project — no web assets).

**Caption presets** (`meta.captions.preset`): bold, clean, serif, elegant, pixel, hand, chalk, terminal, comic,
kids, neon, typewriter, none. Override any field: `{ preset:'bold', y:1450, size:70, color:'#fff', active:'#ffd60a',
font:'Fredoka', maxWords:3, box:{fill, pad, radius, border, borderW} }`. Keep `y` within 1380–1560 (above the
platform UI, below faces). Pick the preset that belongs to the style.

**Fonts available** (bundled, use the family name): Poppins, Inter, Bebas Neue, Archivo Black, Anton-like →
'Bebas Neue', Press Start 2P, Silkscreen, VT323, JetBrains Mono, Space Mono, Caveat, Kalam, Patrick Hand,
Gloria Hallelujah, Permanent Marker, Amatic SC, Cinzel, Playfair Display, DM Serif Display, Abril Fatface,
EB Garamond, Noto Serif, Special Elite, Bangers, Luckiest Guy, Fredoka, Baloo 2, Righteous, Orbitron, Rye, Creepster.

**SFX types**: whoosh, swoosh_up, pop, click, chime, ding, sparkle, magic, gong, boom, impact, thud, drum_hit,
riser, paper, page_flip, typewriter, keys, glitch, coin, jump, powerup, heartbeat, camera, shutter, thunder,
rain, wind, fire, sword, arrow, bubble, squish, boing, slide_whistle, scratch, chalk, pencil, stamp, tick, crowd,
bird, bell_temple, kentongan, keprak, cempala. 4–8 well-placed effects per short; gain 0.25–0.6.

### Shot pattern (copy from the wayang demo)
```js
const SHOTS = []; const shot = (id, next, fn) => SHOTS.push({ id, next, fn });
shot('hook', 'line2', (t, a, b) => { ... });   // a = shot start, b = next shot start (seconds)
export function render(t) { pick the last shot whose cue start - 0.12 <= t; call fn(t, a, b) }
```
Cut 0.1–0.15 s before the line starts. Inside a shot use `prog(t, a, a+1.2, ease.outCubic)` for entrances,
`AM.wordTime(id,'kata')` for beats, slow camera drift (push/pan) on every shot, and keep everything a pure
function of `t` so any frame renders on its own (needed for stills and resumable renders).

### 3D (three.js)
`const c = AM.layer('3d', {type:'webgl'}); const R = new THREE.WebGLRenderer({canvas:c, antialias:true, preserveDrawingBuffer:true}); R.setPixelRatio(0.75); R.setSize(1080,1920,false);`
This machine renders WebGL on the CPU (SwiftShader): keep scenes light (≤ ~150k triangles, 1 shadow-casting
light with a 1024 map, no heavy post-processing chains), and measure: a frame should take ≤ 0.35 s. Put 2D
overlays (titles, labels, grain) on a 2D layer above. `MeshToonMaterial` + an outline pass (inverted-hull
back-face mesh) gives the toon look cheaply.

## 4. Quality bar (check every item on your stills sheet and on the final QA sheet)
- [ ] Frame 0.5 s already shows the style's signature and something moving; the hook line has a matching image.
- [ ] Every line has its own picture or a clear change; no shot is static (camera drift, character motion,
      particles, flicker, line boil…). Character animation is the core: people/creatures move, react, gesture.
- [ ] The look is **unmistakably** the style (palette, texture, line, typography, motion grammar from STYLE.md).
- [ ] Text on screen is readable at phone size (contrast!), never collides with the captions, nothing
      important under the caption band or in the bottom 300 px / right 120 px (platform UI).
- [ ] Numbers/names the narrator says appear on screen when spoken (counters, labels, nameplates).
- [ ] Sound: 4–8 SFX on real moments; music preset fits the culture/mood.
- [ ] Ending lands: last line has a final image that holds ~1.5 s, then a soft close (≤ 1 s).
- [ ] No real brand logos, app icons, trademarked characters or celebrity likenesses. Generic UI only.
- [ ] Performance: the renderer prints `draw Xms + capture Yms per drawing`. Target: 2D ≤ 150 ms total,
      3D ≤ 350 ms, paint pass ≤ 2 s (with scale 0.5 and hold 3). See §6.

## 6. Performance rules (this machine has no GPU; Chrome rasterizes 2D canvas on the CPU)
Your JS "draw" time is small; the real cost is paid at capture, when Skia rasterizes what you drew. So:
- **No full-screen non-normal blend modes** (`overlay`, `multiply`, `screen`, `soft-light`, `lighter` on the whole
  frame). For paper/cloth texture use `AM.lib.alphaTexture(paperTexture(...))` drawn with normal source-over at
  low alpha; `AM.lib.grain()` and `AM.lib.vignette()` are already cheap (pre-baked). Small areas are fine.
- **No `ctx.filter = 'blur(...)'` on big images.** For depth-of-field / soft shadows, draw the thing into a small
  offscreen canvas (1/3–1/8 size) and drawImage it back up: the upscale is the blur, almost free.
  (See `puppet()` / `gunungan()` in the wayang kit.) Same for glows: pre-render a radial sprite once and stamp it.
- Cache anything static with `AM.lib.cached(key, build)` (characters, props, backgrounds, textures, text that doesn't change).
- Draw only what the camera sees (`viewRect` in the wayang kit shows how to get the visible world rect).
- Avoid `getImageData`/`putImageData` per frame on large canvases; avoid thousands of tiny `fill()` calls
  with `shadowBlur` (shadowBlur is a blur!). Particles: batch into one path per colour, or stamp a cached sprite.
- Every extra full-screen 2D layer costs capture time: use as few layers as possible (2–3).
- Word times come from the caption `text`; when `say` reads numbers/codes much longer than the caption, time those beats by fractions of the line instead of `AM.wordTime`.
- Hand-made looks (clay, paper, stop motion, flipbook, crayon, paint): `meta.hold = 2` (renders half the frames).

## 5. Finish
1. `node $SK/scripts/make.mjs <demo>` → open `build/qa_sheet.jpg` (8 frames of the real file) and fix anything wrong.
2. Check the result: `ffprobe` duration 15–20 s (never above 20.0), 1080×1920, audio present.
3. Write `styles/<id>/STYLE.md` (template below). Keep kit.js reusable: a future short in this style should
   only need a new story.json + scene.js that imports the kit.

## STYLE.md template
```markdown
---
id: <id>
name: <Nama Indonesia>
no: <catalog number>
source: <drive / shorts-animator / github refs>
family: <2D | 3D | craft | painterly | retro-digital | typography | data | shader>
tech: <canvas2d | three | paint | shader>
music: <preset>   voice: <id-m|id-f>   captions: <preset>
best_for: <kinds of stories, comma separated>
---
# <Nama>
**Ciri khas (look):** palette (hex), line/texture, light, typography.
**Gerak (motion):** how things move; signature moves.
**Kenapa menarik:** why it stops the scroll.
**Cerita yang cocok:** 4–6 story ideas with a one-line hook each.
**Rumus hook:** 2–3 hook templates for this style.
**Kit API:** each exported function, one line each.
**Demo:** title, length, what happens.
```
