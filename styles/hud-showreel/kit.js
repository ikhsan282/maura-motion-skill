// HUD game kit: cooldown radial, charge bar, combo counter, level-up banner, XP bar.
const { clamp, lerp, ease } = AM.lib;
export const PAL = { bg:'#070b14', panel:'rgba(13,20,36,0.85)', cyan:'#38e1ff', mag:'#ff4fd8', gold:'#ffd23f', green:'#52ffa8', red:'#ff5a5a', ink:'#eaf2ff', dim:'#8fa3c8' };
export const RGB = { cyan:'56,225,255', mag:'255,79,216', gold:'255,210,63', green:'82,255,168' };
export const FONT = { disp:'Orbitron', mono:'JetBrains Mono', sans:'Inter' };

export function label(g, str, x, y, { size=32, weight=700, color=PAL.ink, align='center', font=FONT.disp, spacing=2, alpha=1 }={}) {
  g.save(); g.globalAlpha = alpha; g.font = `${weight} ${size}px ${font}`; g.textAlign = align; g.textBaseline = 'middle';
  try { g.letterSpacing = spacing + 'px'; } catch(e) {}
  g.fillStyle = color; g.fillText(str, x, y); g.restore();
}
export const micro = (g, s, x, y, o={}) => label(g, String(s).toUpperCase(), x, y, { size:22, font:FONT.mono, color:PAL.dim, spacing:3, ...o });

export function frame(g, t) { // bg grid + vignette + scanlines
  g.fillStyle = PAL.bg; g.fillRect(0,0,1080,1920);
  g.strokeStyle = 'rgba(56,225,255,0.07)'; g.lineWidth = 1;
  for (let x=0; x<=1080; x+=90) { g.beginPath(); g.moveTo(x,0); g.lineTo(x,1920); g.stroke(); }
  for (let y=0; y<=1920; y+=90) { g.beginPath(); g.moveTo(0,y); g.lineTo(1080,y); g.stroke(); }
  const v = g.createRadialGradient(540,960,300,540,960,1100);
  v.addColorStop(0,'rgba(0,0,0,0)'); v.addColorStop(1,'rgba(0,0,0,0.55)');
  g.fillStyle = v; g.fillRect(0,0,1080,1920);
  g.fillStyle = 'rgba(0,0,0,0.10)';
  for (let y=(Math.floor(t*24)%4); y<1920; y+=4) g.fillRect(0,y,1080,1);
}
export function panel(g, x, y, w, h, { r=24, glow=null }={}) {
  g.save();
  if (glow) { g.shadowColor = glow; g.shadowBlur = 40; }
  g.fillStyle = PAL.panel; AM.lib.roundRect(g, x, y, w, h, r); g.fill();
  g.shadowBlur = 0; g.strokeStyle = 'rgba(56,225,255,0.35)'; g.lineWidth = 2;
  AM.lib.roundRect(g, x, y, w, h, r); g.stroke(); g.restore();
}
// radial cooldown: p 0..1 (1 = ready). dim sweep + seconds number.
export function cooldown(g, x, y, r, p, { secs=null, readyColor=PAL.gold }={}) {
  g.save();
  g.fillStyle = 'rgba(10,16,30,0.9)'; g.beginPath(); g.arc(x,y,r,0,Math.PI*2); g.fill();
  g.strokeStyle = 'rgba(56,225,255,0.25)'; g.lineWidth = 10;
  g.beginPath(); g.arc(x,y,r,0,Math.PI*2); g.stroke();
  const ready = p >= 1;
  g.strokeStyle = ready ? readyColor : PAL.cyan; g.lineWidth = 14; g.lineCap = 'round';
  if (ready) { g.shadowColor = readyColor; g.shadowBlur = 30; }
  g.beginPath(); g.arc(x,y,r,-Math.PI/2,-Math.PI/2 + Math.PI*2*clamp(p)); g.stroke();
  g.shadowBlur = 0;
  if (ready) label(g, 'READY', x, y, { size:44, color:readyColor });
  else if (secs !== null) label(g, String(Math.ceil(secs)), x, y, { size:96, color:PAL.ink });
  g.restore();
}
// horizontal charge bar 0..1
export function chargeBar(g, x, y, w, h, p, { color=PAL.mag, tag='' }={}) {
  g.save();
  g.fillStyle = 'rgba(10,16,30,0.9)'; AM.lib.roundRect(g, x, y, w, h, h/2); g.fill();
  const f = clamp(p);
  if (f > 0) {
    const gr = g.createLinearGradient(x,0,x+w,0); gr.addColorStop(0,color); gr.addColorStop(1,'#ffffff');
    g.fillStyle = gr; g.shadowColor = color; g.shadowBlur = f >= 1 ? 36 : 16;
    AM.lib.roundRect(g, x+6, y+6, Math.max(4,(w-12)*f), h-12, (h-12)/2); g.fill();
  }
  g.shadowBlur = 0; g.strokeStyle = 'rgba(255,255,255,0.25)'; g.lineWidth = 2;
  AM.lib.roundRect(g, x, y, w, h, h/2); g.stroke();
  if (tag) micro(g, tag, x+w/2, y-28, { size:24 });
  label(g, Math.round(f*100)+'%', x+w/2, y+h/2, { size:34, color:'#fff' });
  g.restore();
}
export function combo(g, x, y, n, pop) {
  g.save(); g.translate(x,y); const s = 1 + 0.25*pop; g.scale(s,s);
  label(g, 'x'+n, 0, 0, { size:150, color: n>=3 ? PAL.gold : PAL.ink });
  if (n>=3) { g.shadowColor = PAL.gold; g.shadowBlur = 40; label(g, 'x'+n, 0, 0, { size:150, color:PAL.gold }); g.shadowBlur = 0; }
  micro(g, 'combo', 0, 95, { size:28, color: n>=3 ? PAL.gold : PAL.dim });
  g.restore();
}
export function levelUp(g, x, y, p, lvl) {
  g.save(); g.globalAlpha = clamp(p*1.5);
  const s = ease.outBack(clamp(p/0.4), 1.5);
  g.translate(x,y); g.scale(Math.max(0.01,s),Math.max(0.01,s));
  panel(g, -360, -90, 720, 180, { r:30, glow:PAL.gold });
  label(g, 'LEVEL '+lvl, 0, -22, { size:72, color:PAL.gold });
  micro(g, 'skill cooldown −50%', 0, 48, { size:26, color:PAL.ink });
  g.restore();
}
export function xpBar(g, x, y, w, p) {
  g.save(); g.fillStyle = 'rgba(255,255,255,0.10)'; AM.lib.roundRect(g, x, y, w, 14, 7); g.fill();
  g.fillStyle = PAL.green; g.shadowColor = PAL.green; g.shadowBlur = 12;
  AM.lib.roundRect(g, x, y, w*clamp(p), 14, 7); g.fill(); g.restore();
}
export function cornerHud(g, t) {
  micro(g, 'SKILL.SYS v2.4', 60, 70, { size:20 });
  const sec = Math.floor(t), fr = Math.floor((t%1)*24);
  micro(g, `T+${String(sec).padStart(2,'0')}:${String(fr).padStart(2,'0')}`, 1020, 70, { size:20, align:'right' });
}
