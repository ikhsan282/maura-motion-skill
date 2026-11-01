import '/styles/stickman-antrean/kit.js';
export const meta = { fps: 30, width: 1080, height: 1920, captions: { preset: 'clean', y: 1620, size: 48 } };
let ctx, kit;
export async function setup(AM) {
  ctx = AM.layer('world');
  kit = new StickmanKit({ preset: '1080x1920', fps: 30, background: '#0A0E13' });
  StickmanKit.createAntreanScene(kit, {});
}
export function render(t) {
  kit.timeline.seek(Math.min(12.3, Math.max(0, t)), 1 / 30);
  kit.render();
  ctx.drawImage(kit.canvas, 0, 0, 1080, 1920);
}
