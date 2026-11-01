import '/styles/stickman-kisah/kit.js';
export const meta = { fps: 30, width: 1080, height: 1920, captions: { preset: 'clean', y: 1620, size: 48 } };
let ctx, kit;
export async function setup(AM) {
  ctx = AM.layer('world');
  kit = new StickmanKit({ preset: '1080x1920', fps: 30, background: '#0A0E13' });
  StickmanKit.createAntreanScene(kit, { theme: "parkir" });
}
export function render(t) {
  kit.timeline.seek(t, 1 / 30); // sekali jalan 62 dtk, ngikutin naskah
  kit.render();
  ctx.drawImage(kit.canvas, 0, 0, 1080, 1920);
  const D = 62.3, F = 1.0; // fade out 1 dtk di ujung
  if (t > D - F) {
    ctx.fillStyle = `rgba(10,14,19,${Math.min(1, (t - (D - F)) / F)})`;
    ctx.fillRect(0, 0, 1080, 1920);
  }
}
