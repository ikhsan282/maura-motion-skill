// AniMasters runtime: loads a project (story.json + build/timeline.json + scene.js),
// exposes the AM API to the scene, and lets the renderer draw any frame by index.
import * as core from './lib/core.js';
import * as draw from './lib/draw.js';
import { Captions, CAPTION_PRESETS } from './lib/captions.js';

const params = new URLSearchParams(location.search);
const PROJECT = '/project';
const stage = document.getElementById('stage');

async function getJSON(url, fallback) {
  try { const r = await fetch(url, { cache: 'no-store' }); if (!r.ok) throw new Error(r.status); return await r.json(); }
  catch (e) { if (fallback !== undefined) return fallback; throw new Error(`cannot load ${url}: ${e.message}`); }
}

/** Rough timeline when narration has not been generated yet (for quick visual previews). */
function fakeTimeline(story) {
  let t = story.lead ?? 0.4;
  const lines = story.lines.map((l) => {
    const words = l.text.split(/\s+/).filter(Boolean);
    const dur = Math.max(1.2, words.length / 2.45);
    const per = dur / words.length;
    const line = { id: l.id, text: l.text, start: t, end: t + dur, words: words.map((w, i) => ({ w, start: t + i * per, end: t + (i + 1) * per })) };
    t += dur + (l.pause ?? 0.35);
    return line;
  });
  return { duration: t + (story.tail ?? 1.6), lines, fake: true };
}

const AM = {
  W: 1080, H: 1920, fps: 30, t: 0, frame: 0, duration: 10,
  story: null, timeline: null, layers: [], lib: { ...core, ...draw }, core, draw,
  _sfx: [],
  cue(id) {
    const l = this.timeline.lines.find((x) => x.id === id);
    if (!l) throw new Error(`cue "${id}" not found in story.json lines`);
    return l;
  },
  /** cue that never throws: returns null if missing */
  maybeCue(id) { return this.timeline.lines.find((x) => x.id === id) || null; },
  cueIndex(i) { return this.timeline.lines[Math.max(0, Math.min(this.timeline.lines.length - 1, i))]; },
  lineAt(t) { const L = this.timeline.lines; for (let i = L.length - 1; i >= 0; i--) if (t >= L[i].start) return L[i]; return L[0]; },
  /** time when the given word (by index within line, or by matching text) is spoken */
  wordTime(id, which) {
    const l = this.cue(id);
    if (typeof which === 'number') return (l.words[which] || l.words[l.words.length - 1]).start;
    const norm = (v) => String(v).toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
    const q = norm(which);
    const w = l.words.find((x) => norm(x.w) === q) || l.words.find((x) => norm(x.w).startsWith(q));
    return w ? w.start : l.start;
  },
  layer(name, { z = this.layers.length, type = '2d', autoClear = true, scale = 1 } = {}) {
    const c = document.createElement('canvas');
    c.width = Math.round(this.W * scale); c.height = Math.round(this.H * scale);
    c.style.width = this.W + 'px'; c.style.height = this.H + 'px';
    c.style.zIndex = String(z);
    c.dataset.name = name;
    stage.appendChild(c);
    const L = { name, canvas: c, type, autoClear, ctx: type === '2d' ? c.getContext('2d') : null };
    this.layers.push(L);
    // keep captions on top
    const cap = this.layers.find((x) => x.name === '__captions');
    if (cap) cap.canvas.style.zIndex = '9999';
    return type === '2d' ? L.ctx : c;
  },
  rng(seed) { return new core.RNG(seed); },
  load(url) {
    return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => rej(new Error('image ' + url)); im.src = url; });
  },
  /** Register a sound effect at absolute time (seconds). Types: see audio/sfx.py */
  sfx(type, time, opts = {}) { if (Number.isFinite(time)) this._sfx.push({ type, t: +time.toFixed(3), ...opts }); },
  loadScript(src) {
    if (document.querySelector(`script[data-src="${src}"]`)) return Promise.resolve();
    return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.dataset.src = src; s.onload = res; s.onerror = () => rej(new Error('script ' + src)); document.head.appendChild(s); });
  },
  /**
   * Painterly pipeline (from Shorts Animator): draw a FLAT scene with the kit, then the GPU paint pass
   * repaints it as oil / watercolor / gouache / pastel / ink (or any custom look).
   *   const P = await AM.painter('oil', { overrides: { brush: 14 } });
   *   render: P.clear(); const k = P.kit(t, p, seed); k.sky(...); ...; P.paint(tick);
   */
  async painter(look = 'oil', { z = 0, scale = 1, overrides = {}, name = 'paint' } = {}) {
    await this.loadScript('/engine/sa/kit.js');
    await this.loadScript('/engine/sa/paint.js');
    let L = look;
    if (typeof look === 'string') L = await getJSON(`/engine/sa/looks/${look}.json`);
    else if (look.base) L = { ...(await getJSON(`/engine/sa/looks/${look.base}.json`)), ...look };
    L = { ...L, ...overrides };
    const W = Math.round(this.W * scale), H = Math.round(this.H * scale);
    const flat = document.createElement('canvas'); flat.width = W; flat.height = H;
    const fg = flat.getContext('2d');
    const glc = this.layer(name, { type: 'webgl', z, scale });
    const P = window.ShortsPaint.Painter(glc);
    return {
      g: fg, canvas: flat, W, H, look: L,
      kit: (t, p = 0, seed = 1, pal = {}, beat = null) => window.ShortsKit.make(fg, W, H, t, p, seed, pal, beat),
      clear: (c = '#000') => { fg.setTransform(1, 0, 0, 1, 0, 0); fg.globalAlpha = 1; fg.fillStyle = c; fg.fillRect(0, 0, W, H); },
      paint: (tick) => P.paint(flat, L, tick),
    };
  },
};
window.AM = AM;

async function boot() {
  const story = await getJSON(`${PROJECT}/story.json`);
  AM.story = story;
  const fmt = story.format || '9:16';
  const dims = { '9:16': [1080, 1920], '16:9': [1920, 1080], '1:1': [1080, 1080], '4:5': [1080, 1350] }[fmt] || [1080, 1920];
  AM.W = dims[0]; AM.H = dims[1];
  stage.style.width = AM.W + 'px'; stage.style.height = AM.H + 'px';
  let tl = await getJSON(`${PROJECT}/build/timeline.json`, null);
  if (!tl || params.get('fake') === '1') tl = fakeTimeline(story);
  AM.timeline = tl;
  AM.duration = story.duration || tl.duration;

  // load every bundled font up front so text never pops in late
  await Promise.all([...document.fonts].map((f) => f.load().catch(() => null)));
  await document.fonts.ready;

  const mod = await import(`${PROJECT}/scene.js?v=${Date.now()}`);
  const meta = mod.meta || {};
  AM.fps = meta.fps || story.fps || 30;
  AM.hold = meta.hold || 1; // 2 = animate on twos (render every 2nd frame, hold it)
  AM.meta = meta;
  AM.captions = new Captions(AM);
  const capCtx = AM.layer('__captions', { z: 9999 });
  if (story.captions === false) AM.captions.configure('none');
  else if (meta.captions) AM.captions.configure(meta.captions.preset || 'bold', meta.captions);
  if (story.captionStyle) AM.captions.configure(story.captionStyle.preset || 'bold', { ...(meta.captions || {}), ...story.captionStyle });

  if (mod.setup) await mod.setup(AM);

  // story-level sfx: {"at":"lineId","offset":0,"type":"gong"} or {"t":3.2,...}
  for (const s of story.sfx || []) {
    const base = s.at ? (s.word !== undefined ? AM.wordTime(s.at, s.word) : AM.cue(s.at).start) : 0;
    AM.sfx(s.type, (s.t ?? base) + (s.offset || 0), { gain: s.gain, pitch: s.pitch });
  }

  window.__AM_INFO = { W: AM.W, H: AM.H, fps: AM.fps, duration: AM.duration, frames: Math.ceil(AM.duration * AM.fps), hold: AM.hold, fakeTimeline: !!tl.fake };
  window.__AM_SFX = AM._sfx;
  window.__AM_FRAME = async (i) => {
    AM.frame = i; AM.t = i / AM.fps;
    for (const L of AM.layers) if (L.type === '2d' && L.autoClear) { L.ctx.setTransform(1, 0, 0, 1, 0, 0); L.ctx.clearRect(0, 0, L.canvas.width, L.canvas.height); }
    await mod.render(AM.t, AM);
    AM.captions.draw(capCtx, AM.t);
    return true;
  };
  window.__AM_READY = true;
}

boot().catch((e) => { console.error(e); window.__AM_ERROR = String(e && e.stack || e); });
