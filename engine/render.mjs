#!/usr/bin/env node
// AniMasters renderer: paints every frame of a project in headless Chrome and encodes an MP4.
//
//   node engine/render.mjs <projectDir>                    full silent video -> <project>/build/video.mp4
//   node engine/render.mjs <projectDir> --stills 0.5,4,9    PNG stills + contact sheet in build/stills/
//   node engine/render.mjs <projectDir> --range 3:8         render only part (seconds)
//   node engine/render.mjs <projectDir> --scale 0.5         half-resolution preview (fast)
//   node engine/render.mjs <projectDir> --fake              ignore narration timing (estimate from text)
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SKILL = path.resolve(here, '..');
const args = process.argv.slice(2);
const BOOL = new Set(['fake']);
const flags = {}; const positional = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a.startsWith('--')) { const k = a.slice(2); if (!BOOL.has(k) && args[i + 1] !== undefined && !args[i + 1].startsWith('--')) flags[k] = args[++i]; else flags[k] = true; }
  else positional.push(a);
}
const projectDir = path.resolve(positional[0] || '.');
const opt = (name, def) => (name in flags ? flags[name] : def);
const stills = opt('stills', null);
const range = opt('range', null);
const scale = parseFloat(opt('scale', '1'));
const fake = !!opt('fake', false);
const quality = parseInt(opt('quality', '93'), 10);
const qs = opt('qs', '');
const outPath = path.resolve(opt('out', path.join(projectDir, 'build', stills ? 'stills' : 'video.mp4')));

// ---------- static server ----------
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.gif': 'image/gif', '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.txt': 'text/plain', '.glsl': 'text/plain' };
function serve() {
  const roots = { '/engine/': path.join(SKILL, 'engine'), '/styles/': path.join(SKILL, 'styles'), '/project/': projectDir, '/shared/': path.join(SKILL, 'shared') };
  const srv = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    if (url === '/' || url === '/index.html') { res.writeHead(200, { 'content-type': 'text/html' }); return fs.createReadStream(path.join(SKILL, 'engine', 'stage.html')).pipe(res); }
    for (const [pre, root] of Object.entries(roots)) {
      if (url.startsWith(pre)) {
        const file = path.join(root, url.slice(pre.length));
        if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) break;
        res.writeHead(200, { 'content-type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' });
        return fs.createReadStream(file).pipe(res);
      }
    }
    res.writeHead(404); res.end('not found ' + url);
  });
  return new Promise((r) => srv.listen(0, '127.0.0.1', () => r(srv)));
}

// ---------- find a browser ----------
function loadPlaywright() {
  const tries = [
    () => createRequire(import.meta.url)('playwright'),
    () => createRequire(import.meta.url)('playwright-core'),
    () => createRequire(path.join(SKILL, 'package.json'))('playwright-core'),
    () => createRequire(path.join(os.homedir(), '.cache', 'animasters', 'node', 'package.json'))('playwright-core'),
    () => createRequire(path.join(os.homedir(), '.cache', 'animasters', 'node', 'package.json'))('playwright'),
    () => createRequire('/opt/npm-tools/package.json')('playwright'),
  ];
  for (const t of tries) { try { return t(); } catch { /* next */ } }
  throw new Error('Playwright not found. Run: node scripts/setup.mjs');
}
function chromePath() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  const c = {
    win32: [path.join(process.env['PROGRAMFILES'] || 'C:/Program Files', 'Google/Chrome/Application/chrome.exe'), path.join(process.env['PROGRAMFILES(X86)'] || 'C:/Program Files (x86)', 'Google/Chrome/Application/chrome.exe'), path.join(process.env.LOCALAPPDATA || '', 'Google/Chrome/Application/chrome.exe'), path.join(process.env['PROGRAMFILES(X86)'] || 'C:/Program Files (x86)', 'Microsoft/Edge/Application/msedge.exe')],
    darwin: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'],
    linux: ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser'],
  }[process.platform] || [];
  return c.find((p) => p && fs.existsSync(p)) || null;
}

// ---------- render slots (limit concurrent full renders on small machines) ----------
async function acquireSlot(pool = 'render', n = parseInt(process.env.AM_RENDER_SLOTS || '2', 10)) {
  const dir = path.join(os.tmpdir(), 'animasters-slots-' + pool); fs.mkdirSync(dir, { recursive: true });
  for (;;) {
    for (let k = 0; k < n; k++) {
      const f = path.join(dir, `slot${k}`);
      try { fs.mkdirSync(f); fs.writeFileSync(path.join(f, 'pid'), String(process.pid)); return () => fs.rmSync(f, { recursive: true, force: true }); }
      catch {
        try { const pid = +fs.readFileSync(path.join(f, 'pid'), 'utf8'); process.kill(pid, 0); }
        catch { fs.rmSync(f, { recursive: true, force: true }); }
      }
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
}

function ffmpegEncoder(file, fps, w, h) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-vf', `scale=${w}:${h}:flags=lanczos,format=yuv420p`, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-maxrate', process.env.AM_MAXRATE || '10M', '-bufsize', '20M', '-r', String(fps), '-movflags', '+faststart', file], { stdio: ['pipe', 'inherit', 'inherit'] });
  return ff;
}

async function main() {
  if (!fs.existsSync(path.join(projectDir, 'story.json'))) throw new Error(`no story.json in ${projectDir}`);
  if (!fs.existsSync(path.join(projectDir, 'scene.js'))) throw new Error(`no scene.js in ${projectDir}`);
  const release = stills ? await acquireSlot('stills', parseInt(process.env.AM_STILL_SLOTS || '3', 10)) : await acquireSlot();
  const srv = await serve();
  const port = srv.address().port;
  const pw = loadPlaywright();
  const exe = chromePath();
  const extra = (process.env.AM_CHROME_ARGS || '').split(' ').filter(Boolean);
  // 2D canvas on the CPU (Skia) is much faster than GPU emulation when there is no real GPU; WebGL still works.
  const gpu = process.env.AM_GPU === '1';
  const launchOpts = { headless: true, args: [...(gpu ? ['--ignore-gpu-blocklist', '--enable-gpu-rasterization'] : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-accelerated-2d-canvas', '--disable-gpu-compositing']), '--disable-web-security', '--autoplay-policy=no-user-gesture-required', '--font-render-hinting=none', ...extra] };
  let browser;
  try { browser = await pw.chromium.launch(launchOpts); }
  catch (e) { if (!exe) throw e; browser = await pw.chromium.launch({ ...launchOpts, executablePath: exe }); }
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: scale });
  const logs = [];
  page.on('console', (m) => { const s = m.text(); if (m.type() === 'error' || m.type() === 'warning') logs.push(s); if (process.env.AM_DEBUG) console.log('[page]', s); });
  page.on('pageerror', (e) => logs.push(String(e)));
  await page.goto(`http://127.0.0.1:${port}/?${fake ? 'fake=1&' : ''}${qs === true ? '' : qs}`);
  const t0 = Date.now();
  for (;;) {
    const st = await page.evaluate(() => ({ ready: !!window.__AM_READY, err: window.__AM_ERROR || null }));
    if (st.err) throw new Error('scene failed to load:\n' + st.err + (logs.length ? '\n' + logs.join('\n') : ''));
    if (st.ready) break;
    if (Date.now() - t0 > 120000) throw new Error('timeout waiting for scene setup\n' + logs.join('\n'));
    await new Promise((r) => setTimeout(r, 100));
  }
  const info = await page.evaluate(() => window.__AM_INFO);
  await page.setViewportSize({ width: info.W, height: info.H });
  const clip = { x: 0, y: 0, width: info.W, height: info.H };
  const sfx = await page.evaluate(() => window.__AM_SFX || []);
  fs.mkdirSync(path.join(projectDir, 'build'), { recursive: true });
  fs.writeFileSync(path.join(projectDir, 'build', 'sfx.json'), JSON.stringify(sfx, null, 1));
  if (info.fakeTimeline && !fake && !stills) console.warn('!! no build/timeline.json yet: timing is estimated. Run the narration step first (scripts/make.mjs does it).');

  const frameAt = async (i) => {
    const ok = await page.evaluate(async (k) => { try { await window.__AM_FRAME(k); return null; } catch (e) { return String(e && e.stack || e); } }, i);
    if (ok) throw new Error(`frame ${i} failed: ${ok}`);
  };

  if (stills) {
    const times = String(stills).split(',').map(Number).filter((x) => Number.isFinite(x));
    fs.rmSync(outPath, { recursive: true, force: true }); fs.mkdirSync(outPath, { recursive: true });
    let k = 0;
    for (const tt of times) {
      const i = Math.min(info.frames - 1, Math.max(0, Math.round(tt * info.fps)));
      await frameAt(i);
      await page.screenshot({ path: path.join(outPath, `still_${String(k).padStart(3, '0')}.png`), clip });
      k++;
    }
    const cols = Math.min(6, times.length), rows = Math.ceil(times.length / cols);
    await new Promise((res) => {
      const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-framerate', '1', '-i', path.join(outPath, 'still_%03d.png'), '-vf', `scale=320:-1,tile=${cols}x${rows}:padding=6:color=white`, '-frames:v', '1', path.join(outPath, 'sheet.png')], { stdio: 'inherit' });
      ff.on('close', res);
    });
    console.log(`stills: ${times.length} -> ${outPath}/ (sheet.png)`);
    if (logs.length) console.log('page warnings:\n' + logs.slice(0, 20).join('\n'));
    await browser.close(); srv.close(); release();
    return;
  }

  let a = 0, b = info.frames;
  if (range) { const [s, e] = String(range).split(':').map(Number); a = Math.max(0, Math.round(s * info.fps)); b = Math.min(info.frames, Math.round(e * info.fps)); }
  const outW = Math.round(info.W * scale / 2) * 2, outH = Math.round(info.H * scale / 2) * 2;
  const ff = ffmpegEncoder(outPath, info.fps, outW, outH);
  const write = (buf) => new Promise((res) => { if (!ff.stdin.write(buf)) ff.stdin.once('drain', res); else res(); });
  const hold = Math.max(1, info.hold | 0);
  let last = null; const tStart = Date.now(); let tDraw = 0, tShot = 0, nDraw = 0;
  for (let i = a; i < b; i++) {
    if (last === null || (i - a) % hold === 0) {
      const t0 = Date.now();
      await frameAt(i);
      const t1 = Date.now();
      last = await page.screenshot({ type: 'jpeg', quality, clip });
      tDraw += t1 - t0; tShot += Date.now() - t1; nDraw++;
    }
    await write(last);
    if ((i - a) % 60 === 0) {
      const el = (Date.now() - tStart) / 1000, done = i - a + 1, eta = (el / done) * (b - a - done);
      process.stdout.write(`\rframe ${i + 1}/${b}  ${(done / el).toFixed(1)} fps  eta ${eta.toFixed(0)}s   `);
    }
  }
  ff.stdin.end();
  await new Promise((res) => ff.on('close', res));
  process.stdout.write(`\nvideo: ${outPath}  (${((Date.now() - tStart) / 1000).toFixed(1)}s, ${b - a} frames @ ${info.fps}fps, hold ${hold}; draw ${(tDraw / nDraw).toFixed(0)}ms + capture ${(tShot / nDraw).toFixed(0)}ms per drawing)\n`);
  if (logs.length) console.log('page warnings:\n' + logs.slice(0, 20).join('\n'));
  await browser.close(); srv.close(); release();
}

main().catch((e) => { console.error(e.message || e); process.exit(1); });
