// Word-timed captions. Each narration line is split into short chunks (2-4 words),
// shown while spoken, with the active word highlighted. Styles pick a preset and override fields.
import { clamp, ease } from './core.js';
import { roundRect, wrap } from './draw.js';

export const CAPTION_PRESETS = {
  bold: { font: 'Poppins', weight: 800, size: 74, color: '#ffffff', active: '#ffd60a', stroke: 14, strokeColor: '#000000', box: null, upper: false, anim: 'pop', maxWords: 3, y: 1390, shadow: true },
  clean: { font: 'Inter', weight: 700, size: 60, color: '#ffffff', active: '#ffffff', stroke: 0, box: { fill: 'rgba(0,0,0,.55)', pad: 22, radius: 22 }, anim: 'fade', maxWords: 5, y: 1430, dimInactive: 0.55 },
  serif: { font: 'Cinzel', weight: 700, size: 64, color: '#f6e7c1', active: '#ffcf5a', stroke: 10, strokeColor: '#1a0d00', anim: 'fade', maxWords: 4, y: 1420, shadow: true },
  elegant: { font: 'Playfair Display', weight: 700, size: 66, color: '#fffaf0', active: '#ffd27a', stroke: 9, strokeColor: 'rgba(20,12,4,.9)', anim: 'rise', maxWords: 4, y: 1420, shadow: true },
  pixel: { font: 'Press Start 2P', weight: 400, size: 40, color: '#ffffff', active: '#ffd60a', stroke: 0, box: { fill: '#0b0b2a', border: '#ffffff', borderW: 6, pad: 26, radius: 0 }, anim: 'type', maxWords: 4, y: 1460, lineH: 1.5 },
  hand: { font: 'Patrick Hand', weight: 400, size: 76, color: '#2b2b2b', active: '#d0342c', stroke: 0, box: { fill: 'rgba(255,253,245,.92)', pad: 20, radius: 18, border: '#2b2b2b', borderW: 4 }, anim: 'pop', maxWords: 4, y: 1430 },
  chalk: { font: 'Kalam', weight: 700, size: 72, color: '#f4f4ee', active: '#ffe066', stroke: 0, anim: 'fade', maxWords: 4, y: 1440, shadow: false },
  terminal: { font: 'VT323', weight: 400, size: 84, color: '#39ff6a', active: '#d6ffe0', stroke: 0, box: { fill: 'rgba(0,12,4,.82)', pad: 18, radius: 4, border: '#39ff6a', borderW: 3 }, anim: 'type', maxWords: 4, y: 1440, glow: '#39ff6a' },
  comic: { font: 'Bangers', weight: 400, size: 86, color: '#111111', active: '#d62828', stroke: 0, box: { fill: '#fffbe6', pad: 22, radius: 10, border: '#111', borderW: 6 }, anim: 'pop', maxWords: 4, y: 1430, upper: true, spacing: 2 },
  kids: { font: 'Fredoka', weight: 700, size: 76, color: '#ffffff', active: '#ffdd00', stroke: 13, strokeColor: '#3a2a6b', anim: 'pop', maxWords: 3, y: 1400 },
  neon: { font: 'Orbitron', weight: 700, size: 58, color: '#e9fbff', active: '#ff3df2', stroke: 0, anim: 'fade', maxWords: 4, y: 1420, glow: '#22e6ff' },
  typewriter: { font: 'Special Elite', weight: 400, size: 64, color: '#1d1a16', active: '#9b1c1c', stroke: 0, box: { fill: 'rgba(245,238,220,.94)', pad: 20, radius: 4 }, anim: 'type', maxWords: 5, y: 1440 },
  none: null,
};

/** Split a timed line into caption chunks: [{words:[{w,start,end}], start, end}] */
export function chunkLine(line, maxWords = 3) {
  const words = line.words && line.words.length ? line.words : [{ w: line.text, start: line.start, end: line.end }];
  const chunks = [];
  let cur = [];
  const flush = () => { if (cur.length) { chunks.push({ words: cur, start: cur[0].start, end: cur[cur.length - 1].end }); cur = []; } };
  for (const wd of words) {
    cur.push(wd);
    const punct = /[.,!?;:…—]$/.test(wd.w);
    if (cur.length >= maxWords || (punct && cur.length >= 2)) flush();
  }
  flush();
  // merge a trailing single short word into the previous chunk
  if (chunks.length > 1 && chunks[chunks.length - 1].words.length === 1 && chunks[chunks.length - 2].words.length < maxWords + 1) {
    const last = chunks.pop(); const prev = chunks[chunks.length - 1];
    prev.words.push(...last.words); prev.end = last.end;
  }
  // keep each chunk on screen until the next starts (no flicker)
  for (let i = 0; i < chunks.length - 1; i++) chunks[i].end = chunks[i + 1].start;
  return chunks;
}

export class Captions {
  constructor(AM) {
    this.AM = AM;
    this.cfg = { ...CAPTION_PRESETS.bold };
    this.enabled = true;
    this.chunks = null;
  }
  configure(presetOrCfg, overrides = {}) {
    if (presetOrCfg === 'none' || presetOrCfg === false) { this.enabled = false; return; }
    const base = typeof presetOrCfg === 'string' ? CAPTION_PRESETS[presetOrCfg] : presetOrCfg;
    this.cfg = { ...CAPTION_PRESETS.bold, ...(base || {}), ...overrides };
    this.enabled = true;
  }
  build() {
    const maxW = this.cfg.maxWords || 3;
    this.chunks = [];
    for (const line of this.AM.timeline.lines) {
      if (line.caption === false) continue;
      for (const c of chunkLine(line, maxW)) this.chunks.push({ ...c, lineId: line.id });
    }
  }
  draw(ctx, t) {
    if (!this.enabled) return;
    if (!this.chunks) this.build();
    const c = this.chunks.find((ch) => t >= ch.start - 0.04 && t < ch.end + 0.02);
    if (!c) return;
    if (this.cfg.hideFor && this.cfg.hideFor.includes(c.lineId)) return;
    const cfg = this.cfg, W = ctx.canvas.width;
    const age = t - c.start;
    let scale = 1, alpha = 1, dy = 0;
    if (cfg.anim === 'pop') { const p = clamp(age / 0.16); scale = 0.72 + 0.28 * ease.outBack(p, 2.2); alpha = clamp(age / 0.06); }
    else if (cfg.anim === 'fade') { alpha = clamp(age / 0.14); }
    else if (cfg.anim === 'rise') { const p = clamp(age / 0.22); alpha = p; dy = (1 - ease.outCubic(p)) * 26; }

    const words = c.words.map((w) => (cfg.upper ? w.w.toUpperCase() : w.w));
    let visibleChars = Infinity;
    if (cfg.anim === 'type') {
      const total = words.join(' ').length;
      visibleChars = Math.floor(clamp(age / Math.max(0.15, (c.end - c.start) * 0.5)) * total) + 1;
    }
    ctx.save();
    ctx.font = `${cfg.weight} ${cfg.size}px '${cfg.font}'`;
    if (cfg.spacing) ctx.letterSpacing = `${cfg.spacing}px`;
    ctx.textBaseline = 'middle';
    const maxLineW = W * 0.82;
    // layout words into rows
    const space = ctx.measureText(' ').width * (cfg.anim === 'pop' ? 1.35 : 1) + (cfg.stroke || 0) * 0.35;
    const rows = []; let row = []; let rowW = 0;
    words.forEach((w, i) => {
      const ww = ctx.measureText(w).width;
      if (row.length && rowW + space + ww > maxLineW) { rows.push({ row, w: rowW }); row = []; rowW = 0; }
      rowW += (row.length ? space : 0) + ww; row.push({ w, ww, i });
    });
    if (row.length) rows.push({ row, w: rowW });
    const lh = cfg.size * (cfg.lineH || 1.18);
    const blockH = rows.length * lh, blockW = Math.max(...rows.map((r) => r.w));
    const cx = W / 2, cy = cfg.y + dy;
    ctx.translate(cx, cy); ctx.scale(scale, scale); ctx.translate(-cx, -cy);
    ctx.globalAlpha = alpha;
    if (cfg.box) {
      const b = cfg.box, pad = b.pad || 18;
      ctx.fillStyle = b.fill;
      roundRect(ctx, cx - blockW / 2 - pad * 1.4, cy - blockH / 2 - pad, blockW + pad * 2.8, blockH + pad * 2, b.radius ?? 16);
      ctx.fill();
      if (b.border) { ctx.lineWidth = b.borderW || 4; ctx.strokeStyle = b.border; ctx.stroke(); }
    }
    let charCount = 0;
    rows.forEach((r, ri) => {
      let x = cx - r.w / 2;
      const y = cy - blockH / 2 + lh * (ri + 0.5);
      for (const it of r.row) {
        const wd = c.words[it.i];
        const isActive = t >= wd.start && t < wd.end + 0.05;
        const spoken = t >= wd.start;
        let str = it.w;
        if (visibleChars !== Infinity) {
          const remain = visibleChars - charCount; charCount += str.length + 1;
          if (remain <= 0) break; if (remain < str.length) str = str.slice(0, remain);
        }
        ctx.save();
        let col = cfg.color;
        if (isActive) col = cfg.active || cfg.color;
        if (cfg.dimInactive && !spoken) ctx.globalAlpha *= cfg.dimInactive;
        if (isActive && cfg.anim === 'pop') { const ww = it.ww; ctx.translate(x + ww / 2, y); ctx.scale(1.07, 1.07); ctx.translate(-(x + ww / 2), -y); }
        if (cfg.shadow) { ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6; }
        if (cfg.glow) { ctx.shadowColor = cfg.glow; ctx.shadowBlur = 24; }
        if (cfg.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = cfg.stroke; ctx.strokeStyle = cfg.strokeColor; ctx.strokeText(str, x, y); ctx.shadowColor = 'transparent'; }
        ctx.fillStyle = col; ctx.fillText(str, x, y);
        ctx.restore();
        x += it.ww + space;
      }
    });
    ctx.restore();
  }
}
