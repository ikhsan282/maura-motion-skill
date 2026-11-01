#!/usr/bin/env node
// AniMasters setup: checks Node/ffmpeg/Chrome, installs the renderer driver (playwright-core) and the offline
// narrator (Python venv with kokoro-onnx + piper-tts, voice models) into ~/.cache/animasters. Safe to re-run.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import https from 'node:https';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SKILL = path.resolve(here, '..');
const CACHE = path.join(os.homedir(), '.cache', 'animasters');
const MODELS = path.join(CACHE, 'models');
const win = process.platform === 'win32';
const ok = (m) => console.log('  ✓ ' + m), bad = (m) => console.log('  !! ' + m);
let failed = false;

const has = (bin, args = ['-version']) => spawnSync(bin, args, { encoding: 'utf8' }).status === 0;
console.log('AniMasters setup\n');
if (+process.versions.node.split('.')[0] < 22) { bad(`Node ${process.versions.node}: need 22+ (https://nodejs.org)`); failed = true; } else ok(`Node ${process.versions.node}`);
if (has('ffmpeg')) ok('ffmpeg'); else { bad('ffmpeg not found: ' + (win ? 'winget install Gyan.FFmpeg' : process.platform === 'darwin' ? 'brew install ffmpeg' : 'sudo apt install ffmpeg')); failed = true; }

// renderer driver
const nodeDir = path.join(CACHE, 'node'); fs.mkdirSync(nodeDir, { recursive: true });
if (!fs.existsSync(path.join(nodeDir, 'node_modules', 'playwright-core'))) {
  if (!fs.existsSync(path.join(nodeDir, 'package.json'))) fs.writeFileSync(path.join(nodeDir, 'package.json'), '{"name":"animasters-node","private":true}');
  const r = spawnSync(win ? 'npm.cmd' : 'npm', ['install', '--silent', 'playwright-core@1.49.1'], { cwd: nodeDir, stdio: 'inherit', shell: win });
  if (r.status !== 0) { bad('npm install playwright-core failed'); failed = true; }
}
ok('playwright-core (drives Chrome)');
const chromes = {
  win32: [path.join(process.env['PROGRAMFILES'] || 'C:/Program Files', 'Google/Chrome/Application/chrome.exe'), path.join(process.env['PROGRAMFILES(X86)'] || 'C:/Program Files (x86)', 'Google/Chrome/Application/chrome.exe'), path.join(process.env.LOCALAPPDATA || '', 'Google/Chrome/Application/chrome.exe'), path.join(process.env['PROGRAMFILES(X86)'] || 'C:/Program Files (x86)', 'Microsoft/Edge/Application/msedge.exe')],
  darwin: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'],
  linux: ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser'],
}[process.platform] || [];
const chrome = process.env.CHROME_PATH || chromes.find((p) => fs.existsSync(p));
if (chrome) ok('browser: ' + chrome); else { bad('Chrome/Edge not found: install Google Chrome or set CHROME_PATH'); failed = true; }

// python venv + narrator
const venv = path.join(CACHE, 'venv');
const py = win ? path.join(venv, 'Scripts', 'python.exe') : path.join(venv, 'bin', 'python');
if (!fs.existsSync(py)) {
  const sys = ['python3', 'python', 'py'].find((b) => has(b, ['--version']));
  if (!sys) { bad('Python 3.10+ not found (https://python.org)'); failed = true; }
  else spawnSync(sys, ['-m', 'venv', venv], { stdio: 'inherit' });
}
if (fs.existsSync(py)) {
  const r = spawnSync(py, ['-m', 'pip', 'install', '-q', 'kokoro-onnx', 'piper-tts', 'soundfile', 'scipy', 'numpy'], { stdio: 'inherit' });
  if (r.status === 0) ok('narrator (kokoro-onnx, piper-tts) in ' + venv); else { bad('pip install failed'); failed = true; }
}
fs.mkdirSync(MODELS, { recursive: true });
const get = (url, dest) => new Promise((res, rej) => {
  const go = (u, n = 0) => https.get(u, { headers: { 'user-agent': 'animasters' } }, (r) => {
    if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location && n < 6) { r.resume(); return go(new URL(r.headers.location, u).toString(), n + 1); }
    if (r.statusCode !== 200) { r.resume(); return rej(new Error(`${r.statusCode} ${u}`)); }
    const tmp = dest + '.part', f = fs.createWriteStream(tmp);
    r.pipe(f); f.on('finish', () => { f.close(); fs.renameSync(tmp, dest); res(); });
  }).on('error', rej);
  go(url);
});
const files = [
  ['kokoro-v1.0.onnx', 'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx'],
  ['voices-v1.0.bin', 'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin'],
  ['id_ID-news_tts-medium.onnx', 'https://huggingface.co/rhasspy/piper-voices/resolve/main/id/id_ID/news_tts/medium/id_ID-news_tts-medium.onnx'],
  ['id_ID-news_tts-medium.onnx.json', 'https://huggingface.co/rhasspy/piper-voices/resolve/main/id/id_ID/news_tts/medium/id_ID-news_tts-medium.onnx.json'],
];
for (const [name, url] of files) {
  const dest = path.join(MODELS, name);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) continue;
  process.stdout.write(`  … downloading ${name}\n`);
  try { await get(url, dest); } catch (e) { bad(`download ${name}: ${e.message}`); failed = true; }
}
ok('voice models in ' + MODELS);

if (failed) { console.log('\nFix the lines marked !! and run this again.'); process.exit(1); }
// smoke test: narrate + 2 stills of the wayang demo into a temp copy
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'animasters-'));
fs.cpSync(path.join(SKILL, 'styles', 'wayang-kulit', 'demo', 'story.json'), path.join(tmp, 'story.json'));
fs.cpSync(path.join(SKILL, 'styles', 'wayang-kulit', 'demo', 'scene.js'), path.join(tmp, 'scene.js'));
const r1 = spawnSync(py, [path.join(SKILL, 'audio', 'tts.py'), tmp], { stdio: 'inherit' });
const r2 = spawnSync(process.execPath, [path.join(SKILL, 'engine', 'render.mjs'), tmp, '--stills', '3,40'], { stdio: 'inherit' });
if (r1.status === 0 && r2.status === 0) console.log(`\nAniMasters is ready. Test stills: ${path.join(tmp, 'build', 'stills', 'sheet.png')}`);
else { console.log('\nSetup finished but the smoke test failed (see above).'); process.exit(1); }
