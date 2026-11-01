// AniMasters style kit: KINETIC TYPE (colour-block kinetic typography).
// Giant condensed type that fills the column, 1-4 words per beat, each word landing on the frame it is spoken.
// Full-bleed flat fields (tomato, cobalt, sunflower, ink, paper) flip on beats; words slam with a spring,
// rise through a mask line, drop letter by letter, get struck through, boxed, echoed in outline.
// Small pictograms (shoe, book, stopwatch, ballot, stairs) drawn in the same flat, thick graphic language.
import { clamp, lerp, ease, hrand, noise, TAU } from '/engine/lib/core.js';
import { makeCanvas, cached } from '/engine/lib/draw.js';

export const PAL = {
  tomato: '#FF4B2B', cobalt: '#2B3BFF', sun: '#F5C400', ink: '#0E0E0E', paper: '#F2EFE8', white: '#FFFFFF',
};
/** Default ink colour for each field (max contrast) and its accent. */
export const ON = {
  [PAL.tomato]: { ink: PAL.ink, acc: PAL.paper }, [PAL.cobalt]: { ink: PAL.paper, acc: PAL.sun },
  [PAL.sun]: { ink: PAL.ink, acc: PAL.tomato }, [PAL.ink]: { ink: PAL.paper, acc: PAL.tomato },
  [PAL.paper]: { ink: PAL.ink, acc: PAL.tomato },
};
export const FONT = { cond: "'Bebas Neue'", black: "'Archivo Black'", mono: "'JetBrains Mono'" };
/** Column: flush-left at x, keeps clear of the right-side platform UI and the bottom 300 px. */
export const GRID = { x: 70, w: 880, top: 220, bottom: 1520, W: 1080, H: 1920, cy: 860 };

// ---------------------------------------------------------------- timing
/** Replace the syllable-estimated word times with real ones from build/words.json (align.py). */
export async function useAlignedWords(AM) {
  try {
    const r = await fetch('/project/build/words.json', { cache: 'no-store' });
    if (!r.ok) { console.warn('kinetic-type: no build/words.json, using estimated word times (run align.py)'); return false; }
    const j = await r.json();
    if (j.key && AM.timeline.key && j.key !== AM.timeline.key) { console.warn('kinetic-type: words.json is stale, run align.py again'); return false; }
    for (const l of AM.timeline.lines) { const w = j.lines[l.id]; if (w && w.length === l.words.length) l.words = w; }
    return true;
  } catch (e) { return false; }
}
/** Start time of word i (index) of line id. */
export const wt = (AM, id, i) => { const l = AM.cue(id); return (l.words[i] || l.words[l.words.length - 1]).start; };

/** Closed-form damped spring step response: 0 at x<=0, overshoots, settles at 1. x in seconds. */
export function spring(x, { freq = 4.2, damp = 0.42 } = {}) {
  if (x <= 0) return 0;
  const w = TAU * freq, z = damp, wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * x) * (Math.cos(wd * x) + (z * w / wd) * Math.sin(wd * x));
}
/** Decaying impact 1 -> 0 after t0 (for shake / flash). */
export const impact = (t, t0, dur = 0.35) => (t < t0 || t > t0 + dur ? 0 : Math.pow(1 - (t - t0) / dur, 2));
/** Camera shake offset [dx, dy] summed over impact times. */
export function shake(t, hits, amp = 18) {
  let k = 0; for (const h of hits) k = Math.max(k, impact(t, h, 0.32));
  if (!k) return [0, 0];
  const f = Math.floor(t * 48);
  return [(hrand(f, 3) - 0.5) * 2 * amp * k, (hrand(f, 7) - 0.5) * 2 * amp * k];
}

// ---------------------------------------------------------------- type metrics & setting
const _cap = new Map();
/** Cap height of a font as a fraction of its size. */
export function capH(ctx, font) {
  if (!_cap.has(font)) { ctx.save(); ctx.font = `100px ${font}`; ctx.letterSpacing = '0px'; _cap.set(font, ctx.measureText('HMXE').actualBoundingBoxAscent / 100); ctx.restore(); }
  return _cap.get(font);
}
function setFont(ctx, font, size, track) { ctx.font = `${size}px ${font}`; ctx.letterSpacing = `${(track * size).toFixed(2)}px`; }
/** Advance width without the trailing tracking. track is in em (-0.02 = tight). */
export function measure(ctx, text, font, size, track = 0) {
  ctx.save(); setFont(ctx, font, size, track); const w = ctx.measureText(text).width - (text.length ? track * size : 0); ctx.restore(); return w;
}
/** Font size so that `text` is exactly `width` wide. */
export const fitSize = (ctx, text, font, width, track = 0) => (100 * width) / Math.max(1, measure(ctx, text, font, 100, track));

/** Set a line of type. Baseline at y. align: left|center|right. `accent` recolours trailing punctuation (. ? ! ,). */
export function type(ctx, text, x, y, { font = FONT.cond, size = 200, color = PAL.ink, track = 0, align = 'left', outline = 0, accent = null, alpha = 1 } = {}) {
  if (!text) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  setFont(ctx, font, size, track); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const w = ctx.measureText(text).width - track * size;
  let x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  let body = text, tail = '';
  if (accent && /[.?!,:]$/.test(text)) { body = text.slice(0, -1); tail = text.slice(-1); }
  if (outline) { ctx.lineJoin = 'round'; ctx.lineWidth = outline; ctx.strokeStyle = color; ctx.strokeText(body, x0, y); }
  else { ctx.fillStyle = color; ctx.fillText(body, x0, y); }
  if (tail) { const bw = ctx.measureText(body).width; ctx.fillStyle = accent; ctx.fillText(tail, x0 + bw, y); }
  ctx.restore();
  return w;
}

// ---------------------------------------------------------------- the stack (rows that fill the column)
/**
 * Lay out rows of type as a poster stack. Each row: { text, font, size | fit (fraction of column, default 1),
 * track, color, outline, accent, at (time), fx, parts:[{text, at, fx, color}] }.
 * Returns rows with { size, cap, base, x, w } (cached by content).
 */
export function stack(ctx, rows, { x = GRID.x, w = GRID.w, top = null, cy = GRID.cy, gap = 26, align = 'left' } = {}) {
  const key = 'stk:' + JSON.stringify(rows.map((r) => [r.text, r.font, r.size, r.fit, r.track, r.gap])) + [x, w, top, cy, gap, align].join(',');
  const L = cached(key, () => {
    const out = rows.map((r) => {
      const font = r.font || FONT.cond, track = r.track ?? (font === FONT.black ? -0.035 : -0.005);
      const size = r.size || fitSize(ctx, r.text, font, w * (r.fit ?? 1), track);
      const cap = capH(ctx, font) * size;
      return { font, track, size, cap, rw: measure(ctx, r.text, font, size, track), gapAfter: r.gap ?? gap };
    });
    const total = out.reduce((s, r, i) => s + r.cap + (i < out.length - 1 ? r.gapAfter : 0), 0);
    let y = top ?? cy - total / 2;
    for (const r of out) { r.base = y + r.cap; y += r.cap + r.gapAfter; }
    out.forEach((r) => { r.x = align === 'center' ? x + (w - r.rw) / 2 : align === 'right' ? x + w - r.rw : x; });
    return out;
  });
  return rows.map((r, i) => ({ ...r, ...L[i] }));
}

/** Prefix offsets of each part inside a row (for words that land at different times on the same line). */
function partsOf(ctx, r) {
  if (!r.parts) return [{ text: r.text, at: r.at, fx: r.fx, color: r.color, dx: 0 }];
  return cached('parts:' + r.text + r.font + r.size.toFixed(2) + r.track, () => {
    let pre = ''; return r.parts.map((p) => { const dx = pre ? measure(ctx, pre + ' ', r.font, r.size, r.track) + r.track * r.size : 0; pre += (pre ? ' ' : '') + p.text; return { ...p, dx }; });
  }).map((p, i) => ({ ...p, ...r.parts[i], dx: p.dx }));
}

/**
 * Draw one stacked row with its entrance effect at time t. fx:
 *  'cut' instant | 'slam' spring scale-down + misregistration | 'rise' through a mask line | 'drop' letter by letter
 *  'wipe' left-to-right mask | 'stretch' horizontal spring | 'type' character by character | 'ghost' outline then fill
 */
export function drawRow(ctx, r, t, { color = PAL.ink, accent = null, mis = [PAL.tomato, PAL.cobalt] } = {}) {
  for (const p of partsOf(ctx, r)) {
    const at = p.at ?? r.at ?? -1e9; const local = t - at;
    const fx = p.fx || r.fx || 'slam';
    const col = p.color || r.color || color;
    const x = r.x + p.dx, y = r.base, o = { font: r.font, size: r.size, color: col, track: r.track, outline: r.outline || 0, accent: r.accent === false ? null : (r.accent || accent) };
    if (local < 0) { if (r.ghost) type(ctx, p.text, x, y, { ...o, outline: 2.5, alpha: 0.35 }); continue; }
    const pw = measure(ctx, p.text, r.font, r.size, r.track);
    ctx.save();
    if (fx === 'cut') type(ctx, p.text, x, y, o);
    else if (fx === 'slam') {
      const s = 1 + 0.42 * (1 - spring(local, { freq: 5.2, damp: 0.5 }));
      const sq = 1 - 0.1 * Math.exp(-local * 22) * Math.cos(local * 40);
      ctx.translate(x + pw / 2, y - r.cap / 2); ctx.scale(s / sq, s * sq); ctx.translate(-(x + pw / 2), -(y - r.cap / 2));
      if (local < 0.12 && mis) { const d = 7 * (1 - local / 0.12); type(ctx, p.text, x - d, y + d * 0.4, { ...o, color: mis[0], alpha: 0.85 }); type(ctx, p.text, x + d, y - d * 0.4, { ...o, color: mis[1], alpha: 0.85 }); }
      ctx.globalAlpha *= clamp(local / 0.03);
      type(ctx, p.text, x, y, o);
    } else if (fx === 'rise') {
      ctx.beginPath(); ctx.rect(x - 40, y - r.cap * 1.25, pw + 80, r.cap * 1.45); ctx.clip();
      const k = ease.outExpo(clamp(local / 0.32));
      type(ctx, p.text, x, y + (1 - k) * r.cap * 1.3, o);
    } else if (fx === 'fall') {
      ctx.beginPath(); ctx.rect(x - 40, y - r.cap * 1.2, pw + 80, r.cap * 1.45); ctx.clip();
      const k = ease.outExpo(clamp(local / 0.32));
      type(ctx, p.text, x, y - (1 - k) * r.cap * 1.3, o);
    } else if (fx === 'wipe') {
      const k = ease.outExpo(clamp(local / 0.26));
      ctx.beginPath(); ctx.rect(x - 20, y - r.cap * 1.3, (pw + 40) * k, r.cap * 1.6); ctx.clip();
      type(ctx, p.text, x + (1 - k) * -40, y, o);
    } else if (fx === 'stretch') {
      const s = spring(local, { freq: 3.6, damp: 0.38 });
      ctx.translate(x, y); ctx.scale(Math.max(0.02, s), 1 + (1 - s) * 0.25); ctx.translate(-x, -y);
      type(ctx, p.text, x, y, o);
    } else if (fx === 'drop' || fx === 'type') {
      const g = glyphs(ctx, p.text, r.font, r.size, r.track);
      const st = fx === 'drop' ? 0.04 : 0.03;
      for (const c of g) {
        const lc = local - c.i * st; if (lc < 0) break;
        if (fx === 'type') { type(ctx, c.ch, x + c.x, y, o); continue; }
        const k = spring(lc, { freq: 4.6, damp: 0.45 });
        ctx.save(); ctx.globalAlpha *= clamp(lc / 0.05);
        type(ctx, c.ch, x + c.x, y - (1 - k) * r.cap * 0.9, { ...o, accent: null, color: c.ch.match(/[.?!,]/) && o.accent ? o.accent : col });
        ctx.restore();
      }
    } else if (fx === 'ghost') {
      const k = clamp(local / 0.25);
      if (k < 1) type(ctx, p.text, x, y, { ...o, outline: 3 });
      ctx.beginPath(); ctx.rect(x - 10, y - r.cap * 1.3 + (1 - ease.outCubic(k)) * r.cap * 1.5, pw + 20, r.cap * 1.6); ctx.clip();
      type(ctx, p.text, x, y, o);
    }
    ctx.restore();
  }
}
/** Draw a whole stack. Rows without `at` show immediately. */
export function drawStack(ctx, rows, t, opts = {}) { for (const r of rows) drawRow(ctx, r, t, opts); }
/** Glyph x offsets of a word (cached) for per-letter effects. */
export function glyphs(ctx, text, font, size, track = 0) {
  return cached(`gl:${text}:${font}:${size.toFixed(2)}:${track}`, () => {
    const out = []; for (let i = 0; i < text.length; i++) out.push({ ch: text[i], i, x: i ? measure(ctx, text.slice(0, i), font, size, track) + track * size : 0 });
    return out;
  });
}
/** Bounding box of a row part (for strikes, boxes, underlines). */
export function rowBox(ctx, r, partIndex = null) {
  const ps = partsOf(ctx, r); const p = partIndex == null ? null : ps[partIndex];
  const x = r.x + (p ? p.dx : 0), w = measure(ctx, p ? p.text : r.text, r.font, r.size, r.track);
  return { x, y: r.base - r.cap, w, h: r.cap, base: r.base };
}

// ---------------------------------------------------------------- marks: strike, box, underline
/** A strike-through bar drawn left to right (p 0..1), slightly tilted. */
export function strike(ctx, box, p, { color = PAL.tomato, thick = null, tilt = -0.035, over = 26 } = {}) {
  if (p <= 0) return;
  const th = thick || Math.max(14, box.h * 0.13), y = box.y + box.h * 0.52;
  ctx.save(); ctx.translate(box.x - over, y); ctx.rotate(tilt);
  ctx.fillStyle = color; ctx.fillRect(0, -th / 2, (box.w + over * 2) * ease.outExpo(clamp(p)), th);
  ctx.restore();
}
/** Solid box that wipes in behind a word (marker / label). Draw BEFORE the row. */
export function boxBehind(ctx, box, p, { color = PAL.sun, pad = 18, from = 'left' } = {}) {
  if (p <= 0) return;
  const k = ease.outExpo(clamp(p)); ctx.save(); ctx.fillStyle = color;
  const x = box.x - pad, y = box.y - pad, w = box.w + pad * 2, h = box.h + pad * 2;
  if (from === 'left') ctx.fillRect(x, y, w * k, h); else if (from === 'bottom') ctx.fillRect(x, y + h * (1 - k), w, h * k); else ctx.fillRect(x + w * (1 - k), y, w * k, h);
  ctx.restore();
}
export function underline(ctx, box, p, { color = PAL.tomato, thick = 16, gap = 22 } = {}) {
  if (p <= 0) return; ctx.save(); ctx.fillStyle = color; ctx.fillRect(box.x, box.base + gap, box.w * ease.outExpo(clamp(p)), thick); ctx.restore();
}

// ---------------------------------------------------------------- fields & transitions
export function field(ctx, color) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = color; ctx.fillRect(0, 0, GRID.W, GRID.H); ctx.restore(); }
/** A colour block sweeping over the frame (mask wipe). dir: up|down|left|right|diag. p 0..1 */
export function wipeField(ctx, color, p, dir = 'up') {
  if (p <= 0) return; const k = ease.inOutQuart(clamp(p)), W = GRID.W, H = GRID.H;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = color; ctx.beginPath();
  if (dir === 'up') ctx.rect(0, H * (1 - k), W, H * k);
  else if (dir === 'down') ctx.rect(0, 0, W, H * k);
  else if (dir === 'left') ctx.rect(W * (1 - k), 0, W * k, H);
  else if (dir === 'right') ctx.rect(0, 0, W * k, H);
  else { const d = (W + H) * k; ctx.moveTo(0, 0); ctx.lineTo(d, 0); ctx.lineTo(d - H, H); ctx.lineTo(0, H); ctx.closePath(); }
  ctx.fill(); ctx.restore();
}
/** Field colour from a beat list [{t, c}] (hard cuts on beats). */
export function fieldAt(t, flips) { let c = flips[0].c; for (const f of flips) if (t >= f.t) c = f.c; return c; }

// ---------------------------------------------------------------- echo wall (outlined repeats behind)
/** Rows of the word in outline, sliding in alternate directions. Cached strip, cheap to draw. */
export function echoWall(ctx, text, t, { font = FONT.cond, size = 300, color = PAL.ink, alpha = 0.22, line = 3, speed = 70, y0 = 0, rows = 8, lead = 0.92, fill = false, track = -0.005 } = {}) {
  const strip = cached(`echo:${text}:${font}:${size}:${color}:${line}:${fill}`, () => {
    const w1 = measure(ctx, text + '  ', font, size, track) + size * 0.25;
    const c = makeCanvas(Math.ceil(w1 * 2), Math.ceil(size * 1.0)), g = c.getContext('2d');
    g.font = `${size}px ${font}`; g.letterSpacing = `${track * size}px`; g.textBaseline = 'alphabetic';
    g.lineWidth = line; g.strokeStyle = color; g.fillStyle = color; g.lineJoin = 'round';
    const base = capH(g, font) * size + size * 0.12;
    for (let k = 0; k < 2; k++) (fill ? g.fillText(text, k * w1, base) : g.strokeText(text, k * w1, base));
    c.unit = w1; c.rowH = capH(g, font) * size * lead + size * 0.04;
    return c;
  });
  ctx.save(); ctx.globalAlpha *= alpha;
  for (let i = 0; i < rows; i++) {
    const dir = i % 2 ? -1 : 1, off = ((t * speed * dir + i * strip.unit * 0.37) % strip.unit + strip.unit) % strip.unit;
    const y = y0 + i * strip.rowH;
    if (y > GRID.H || y + strip.height < 0) continue;
    ctx.drawImage(strip, -off, y); if (strip.width - off < GRID.W) ctx.drawImage(strip, strip.width - off - strip.unit, y);
  }
  ctx.restore();
}

// ---------------------------------------------------------------- HUD crumbs (tiny mono labels)
export function tc(t, fps = 24) {
  const f = Math.floor(t * fps), s = Math.floor(f / fps), ff = f % fps;
  return `00:00:${String(s).padStart(2, '0')}:${String(ff).padStart(2, '0')}`;
}
/** Corner crumbs: label top-left, beat counter top-right, timecode + scrubber at the bottom of the safe area. */
export function crumbs(ctx, t, { color = PAL.ink, label = 'ATURAN / 02:00', beat = 1, beats = 1, dur = 50, alpha = 0.8 } = {}) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha *= alpha;
  ctx.fillStyle = color; ctx.font = `700 24px ${FONT.mono}`; ctx.letterSpacing = '2px'; ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left'; ctx.fillText('■ ' + label, GRID.x, 132);
  ctx.textAlign = 'right'; ctx.fillText(`BEAT ${String(beat).padStart(2, '0')}/${String(beats).padStart(2, '0')}`, GRID.x + GRID.w, 132);
  ctx.font = `400 22px ${FONT.mono}`; ctx.textAlign = 'left'; ctx.fillText('TC ' + tc(t), GRID.x, 1590);
  ctx.textAlign = 'right'; ctx.fillText('120 BPM · 1080×1920', GRID.x + GRID.w, 1590);
  // scrubber
  const y = 1556, p = clamp(t / dur);
  ctx.globalAlpha *= 0.5; ctx.fillRect(GRID.x, y, GRID.w, 2); ctx.globalAlpha /= 0.5;
  ctx.fillRect(GRID.x, y - 3, GRID.w * p, 8);
  for (let i = 0; i <= 24; i++) ctx.fillRect(GRID.x + (GRID.w * i) / 24, y + (i % 4 ? 10 : 6), 2, i % 4 ? 6 : 14);
  ctx.restore();
}
/** Which beat (1-based) of all words is current; beats = total words. */
export function beatIndex(AM, t) {
  let n = 0, cur = 0; for (const l of AM.timeline.lines) for (const w of l.words) { n++; if (t >= w.start) cur = n; }
  return [Math.max(1, cur), n];
}

// ---------------------------------------------------------------- pictograms (flat, thick, geometric)
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
/** Sneaker, side view, toe to the right. Box ~ 420x230 at s=1, origin = bottom-left of the sole.
 *  lace 0..1 ties the bow, run>0 adds speed lines. */
export function shoe(ctx, x, y, s = 1, { color = PAL.ink, accent = PAL.paper, lace = 1, run = 0, t = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (run > 0) { ctx.fillStyle = color; for (let i = 0; i < 4; i++) { const L = (90 + 50 * hrand(i, Math.floor(t * 12))) * run; ctx.fillRect(-L - 30, -40 - i * 44, L, 12); } }
  ctx.fillStyle = color;
  // sole
  rr(ctx, 0, -46, 420, 46, 23); ctx.fill();
  ctx.fillStyle = accent; ctx.fillRect(26, -30, 360, 9);
  // upper
  ctx.fillStyle = color; ctx.beginPath();
  ctx.moveTo(8, -46); ctx.lineTo(10, -170); ctx.quadraticCurveTo(14, -205, 52, -208); ctx.lineTo(118, -208);
  ctx.quadraticCurveTo(140, -208, 150, -186); ctx.lineTo(196, -128); ctx.quadraticCurveTo(250, -112, 330, -96);
  ctx.quadraticCurveTo(410, -84, 418, -46); ctx.closePath(); ctx.fill();
  // heel tab + toe cap in accent
  ctx.fillStyle = accent; rr(ctx, 18, -196, 22, 70, 10); ctx.fill();
  ctx.beginPath(); ctx.moveTo(330, -96); ctx.quadraticCurveTo(404, -84, 414, -50); ctx.lineTo(372, -50); ctx.quadraticCurveTo(366, -80, 318, -90); ctx.closePath(); ctx.fill();
  // eyelets + laces
  ctx.strokeStyle = accent; ctx.lineWidth = 10; ctx.lineCap = 'round';
  const eye = [[160, -170], [184, -140], [210, -122], [240, -112]];
  for (let i = 0; i < eye.length - 1; i++) { const [ax, ay] = eye[i], [bx, by] = eye[i + 1]; ctx.beginPath(); ctx.moveTo(ax - 22, ay + 6); ctx.lineTo(bx + 18, by - 14); ctx.stroke(); }
  // the bow: two loops + two tails grow with `lace`
  const k = ease.outBack(clamp(lace), 1.6);
  if (k > 0.01) {
    const bx = 152, by = -186;
    ctx.lineWidth = 11;
    ctx.beginPath(); ctx.ellipse(bx - 34 * k, by - 22 * k, 34 * k, 18 * k, -0.5, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(bx + 30 * k, by - 26 * k, 32 * k, 17 * k, 0.45, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(bx - 20, by + 40 * k, bx - 46 * k, by + 62 * k); ctx.moveTo(bx, by); ctx.quadraticCurveTo(bx + 16, by + 34 * k, bx + 36 * k, by + 66 * k); ctx.stroke();
    ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(bx, by, 13 * Math.min(1, k), 0, TAU); ctx.fill();
  } else {
    // loose laces hanging
    ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(150, -184); ctx.quadraticCurveTo(110, -120, 128, -70); ctx.moveTo(156, -184); ctx.quadraticCurveTo(200, -110, 180, -64); ctx.stroke();
  }
  ctx.restore();
}
/** Book. open 0 = closed cover (front view), 1 = open spread. flip 0..1 turns one page right->left.
 *  Box ~ 520x360 at s=1 when open, origin at the spine bottom. */
export function book(ctx, x, y, s = 1, { color = PAL.ink, accent = PAL.paper, page = PAL.paper, open = 1, flip = -1, title = null, titleColor = null, lines = true } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const W = 250, H = 340;
  if (open < 0.5) {
    const k = 1 - open * 2; // cover swings closed->open by scaling
    ctx.fillStyle = color; rr(ctx, -W * 0.5, -H, W, H, 10); ctx.fill();
    ctx.fillStyle = accent; ctx.fillRect(-W * 0.5 + 22, -H, 12, H);
    if (title) {
      ctx.fillStyle = titleColor || accent; ctx.font = `${44}px ${FONT.black}`; ctx.letterSpacing = '-1.5px'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      title.split('\n').forEach((ln, i) => ctx.fillText(ln, -W * 0.5 + 52, -H + 92 + i * 50));
      ctx.fillRect(-W * 0.5 + 52, -H + 92 + title.split('\n').length * 50 - 18, 70, 10);
    }
    ctx.restore(); return;
  }
  // open spread
  ctx.fillStyle = color; rr(ctx, -W - 18, -H - 10, W * 2 + 36, H + 28, 12); ctx.fill();
  ctx.fillStyle = page;
  ctx.beginPath(); ctx.moveTo(-6, -H + 8); ctx.quadraticCurveTo(-W * 0.5, -H - 14, -W, -H + 4); ctx.lineTo(-W, 4); ctx.quadraticCurveTo(-W * 0.5, -12, -6, 8); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(6, -H + 8); ctx.quadraticCurveTo(W * 0.5, -H - 14, W, -H + 4); ctx.lineTo(W, 4); ctx.quadraticCurveTo(W * 0.5, -12, 6, 8); ctx.closePath(); ctx.fill();
  if (lines) { ctx.fillStyle = color; for (const side of [-1, 1]) for (let i = 0; i < 7; i++) ctx.fillRect(side < 0 ? -W + 36 : 40, -H + 60 + i * 38, (W - 80) * (i === 6 ? 0.55 : 1), 12); }
  if (flip >= 0 && flip <= 1) {
    const a = ease.inOutCubic(flip), sx = Math.cos(a * Math.PI); // 1 -> -1
    ctx.save(); ctx.scale(sx, 1);
    ctx.fillStyle = page;
    ctx.beginPath(); ctx.moveTo(4, -H + 8); ctx.quadraticCurveTo(W * 0.5, -H - 30 * Math.sin(a * Math.PI), W, -H + 4); ctx.lineTo(W, 4); ctx.quadraticCurveTo(W * 0.5, -12, 4, 8); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.stroke();
    if (sx > 0.15 && lines) { ctx.fillStyle = color; for (let i = 0; i < 7; i++) ctx.fillRect(40, -H + 60 + i * 38, (W - 80) * (i === 6 ? 0.55 : 1), 12); }
    else if (sx < -0.15) { ctx.fillStyle = accent; ctx.fillRect(40, -H + 60, W - 80, 150); }
    ctx.restore();
  }
  ctx.restore();
}
/** Stopwatch with a progress wedge p (0..1) and a hand. r = dial radius. */
export function stopwatch(ctx, x, y, r, { color = PAL.ink, accent = PAL.tomato, face = PAL.paper, p = 0, hand = null, label = null, labelColor = null } = {}) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = color; rr(ctx, -r * 0.16, -r * 1.36, r * 0.32, r * 0.24, 6); ctx.fill(); ctx.fillRect(-r * 0.06, -r * 1.16, r * 0.12, r * 0.2);
  ctx.save(); ctx.rotate(0.75); rr(ctx, -r * 0.08, -r * 1.24, r * 0.16, r * 0.2, 4); ctx.fill(); ctx.restore();
  ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
  ctx.fillStyle = face; ctx.beginPath(); ctx.arc(0, 0, r * 0.82, 0, TAU); ctx.fill();
  if (p > 0) { ctx.fillStyle = accent; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r * 0.82, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(p)); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = color;
  for (let i = 0; i < 12; i++) { ctx.save(); ctx.rotate((i / 12) * TAU); ctx.fillRect(-r * 0.025, -r * 0.8, r * 0.05, r * (i % 3 ? 0.08 : 0.15)); ctx.restore(); }
  const a = hand ?? p * TAU;
  ctx.save(); ctx.rotate(a); ctx.fillRect(-r * 0.04, -r * 0.7, r * 0.08, r * 0.78); ctx.restore();
  ctx.beginPath(); ctx.arc(0, 0, r * 0.1, 0, TAU); ctx.fill();
  if (label) { ctx.fillStyle = labelColor || color; ctx.font = `700 ${Math.round(r * 0.36)}px ${FONT.mono}`; ctx.letterSpacing = '0px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, 0, r * 1.38); }
  ctx.restore();
}
/** "02:00" style timer text from seconds. */
export const mmss = (sec) => { sec = Math.max(0, Math.ceil(sec)); return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`; };
/** Ballot box with a check mark drawn by p (0..1). */
export function ballot(ctx, x, y, s = 1, { color = PAL.ink, accent = PAL.tomato, p = 1 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.lineWidth = 22; ctx.strokeStyle = color; ctx.lineJoin = 'miter'; ctx.strokeRect(-120, -120, 240, 240);
  if (p > 0) {
    const k = clamp(p); ctx.strokeStyle = accent; ctx.lineWidth = 40; ctx.lineCap = 'square'; ctx.lineJoin = 'miter';
    const P = [[-92, -8], [-24, 66], [132, -118]]; const l1 = Math.hypot(68, 74), l2 = Math.hypot(156, 184), d = k * (l1 + l2);
    ctx.beginPath(); ctx.moveTo(...P[0]);
    if (d <= l1) ctx.lineTo(P[0][0] + 68 * (d / l1), P[0][1] + 74 * (d / l1)); else { ctx.lineTo(...P[1]); const e = (d - l1) / l2; ctx.lineTo(P[1][0] + 156 * e, P[1][1] - 184 * e); }
    ctx.stroke();
  }
  ctx.restore();
}
/** Staircase of n steps growing with p, origin bottom-left. */
export function stairs(ctx, x, y, w, h, n, p, { color = PAL.ink } = {}) {
  ctx.save(); ctx.fillStyle = color;
  for (let i = 0; i < n; i++) { const k = ease.outBack(clamp(p * n - i), 1.4); if (k <= 0) continue; const sw = w / n, sh = (h * (i + 1)) / n; ctx.fillRect(x + i * sw, y - sh * k, sw - 6, sh * k); }
  ctx.restore();
}
/** Tally marks (groups of five). */
export function tally(ctx, x, y, n, { color = PAL.ink, h = 120, gap = 34, w = 14 } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'butt';
  let cx = x;
  for (let i = 0; i < Math.floor(n); i++) {
    const g = i % 5;
    if (g === 4) { ctx.beginPath(); ctx.moveTo(cx - gap * 4 - 18, y - h * 0.2); ctx.lineTo(cx + 2, y - h * 0.82); ctx.stroke(); cx += gap * 0.9; }
    else { ctx.fillRect(cx, y - h, w, h); cx += gap; }
  }
  ctx.restore();
}
/** Big arrow (for "→ 2 MENIT" style diagrams). */
export function arrow(ctx, x1, y, x2, p, { color = PAL.ink, thick = 22 } = {}) {
  const k = ease.outExpo(clamp(p)); if (k <= 0) return; const xe = lerp(x1, x2, k);
  ctx.save(); ctx.fillStyle = color; ctx.fillRect(x1, y - thick / 2, xe - x1 - thick, thick);
  ctx.beginPath(); ctx.moveTo(xe, y); ctx.lineTo(xe - thick * 2.4, y - thick * 1.6); ctx.lineTo(xe - thick * 2.4, y + thick * 1.6); ctx.closePath(); ctx.fill(); ctx.restore();
}

// ---------------------------------------------------------------- camera
/** Slow punch-in around (cx, cy). */
export function punch(ctx, z, cx = 540, cy = 860, dx = 0, dy = 0, rot = 0) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(cx + dx, cy + dy); ctx.rotate(rot); ctx.scale(z, z); ctx.translate(-cx, -cy);
}
/** Smear frames for a whip pan: draw fn at a few offsets with falling alpha. */
export function smear(ctx, fn, dx, n = 4) { for (let i = n; i >= 0; i--) { ctx.save(); ctx.globalAlpha *= i ? 0.18 : 1; ctx.translate(-dx * (i / n), 0); fn(); ctx.restore(); } }
