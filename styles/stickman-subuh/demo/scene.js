import '/styles/stickman-subuh/kit.js';
export const meta = { fps: 30, width: 1080, height: 1920, captions: { preset: 'clean', y: 1620, size: 48 } };
let ctx, kit;
export async function setup(AM) {
  ctx = AM.layer('world');
  kit = new StickmanKit({ preset: '1080x1920', fps: 30, background: '#0D0D0D' });
  StickmanKit.createFajrScene(kit, { day: 20 });
}
export function render(t, AM) {
  const dur = Math.max(12.9, (AM && AM.duration) || 12.9);
  const kt = Math.min(12.9, Math.max(0, (t / dur) * 12.9));
  kit.timeline.seek(kt, 1 / 30);
  kit.render();
  ctx.drawImage(kit.canvas, 0, 0, 1080, 1920);
}
