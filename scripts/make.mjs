#!/usr/bin/env node
// Maura Motion: one command from a project folder (story.json + scene.js) to a finished, narrated MP4.
//
//   node scripts/make.mjs <project>                 narrate -> render -> score -> mix -> <project>/out/<slug>.mp4
//   node scripts/make.mjs <project> --stills 1,5,9  narrate, then just PNG stills + sheet (check before rendering)
//   node scripts/make.mjs <project> --voice id-f    pick a narrator (see: python audio/tts.py --help / SKILL.md)
//   node scripts/make.mjs <project> --audio-only    redo narration/music/mix and remux with the existing video
//   node scripts/make.mjs <project> --music lofi    override the music preset
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SKILL = path.resolve(here, '..');
const argv = process.argv.slice(2);
const flags = {}; const pos = [];
const BOOL = new Set(['audio-only', 'no-music', 'no-tts', 'force', 'keep']);
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a.startsWith('--')) { const k = a.slice(2); if (!BOOL.has(k) && argv[i + 1] !== undefined && !argv[i + 1].startsWith('--')) flags[k] = argv[++i]; else flags[k] = true; }
  else pos.push(a);
}
const proj = path.resolve(pos[0] || '.');
if (!fs.existsSync(path.join(proj, 'story.json'))) { console.error(`no story.json in ${proj}`); process.exit(1); }

// Auto-discover hermes ffmpeg if not on PATH
if (process.platform === 'win32' && process.env.LOCALAPPDATA) {
  const hTools = path.join(process.env.LOCALAPPDATA, 'hermes', 'tools');
  if (fs.existsSync(hTools)) {
    for (const d of fs.readdirSync(hTools)) {
      const bin = path.join(hTools, d, 'bin');
      if (d.startsWith('ffmpeg-') && fs.existsSync(path.join(bin, 'ffmpeg.exe'))) {
        process.env.PATH = `${bin};${process.env.PATH || ''}`;
        break;
      }
    }
  }
}

function python() {
  if (process.env.AM_PYTHON) return process.env.AM_PYTHON;
  const venvs = [
    path.join(SKILL, '.venv'),
    path.join(os.homedir(), '.cache', 'maura-motion', 'venv'),
  ];
  for (const venv of venvs) {
    const cand = process.platform === 'win32' ? path.join(venv, 'Scripts', 'python.exe') : path.join(venv, 'bin', 'python');
    if (fs.existsSync(cand)) return cand;
  }
  return process.platform === 'win32' ? 'python' : 'python3';
}
const PY = python();
function run(cmd, args, label) {
  const t = Date.now();
  const r = spawnSync(cmd, args, { stdio: 'inherit', cwd: SKILL, env: { ...process.env, PYTHONPATH: path.join(SKILL, 'audio') } });
  if (r.status !== 0) { console.error(`\n✗ ${label} failed (${cmd} ${args.join(' ')})`); process.exit(1); }
  console.log(`✓ ${label} (${((Date.now() - t) / 1000).toFixed(1)}s)`);
}

const story = JSON.parse(fs.readFileSync(path.join(proj, 'story.json'), 'utf8'));
const slug = story.slug || path.basename(proj);
const B = path.join(proj, 'build'); fs.mkdirSync(B, { recursive: true });

// 1. narration
const ttsArgs = [path.join(SKILL, 'audio', 'tts.py'), proj];
if (flags.voice) ttsArgs.push('--voice', flags.voice);
if (flags.force) ttsArgs.push('--force');
if (story.voice !== 'none' && !flags['no-tts']) run(PY, ttsArgs, 'narration');

// 2. stills only
if (flags.stills) {
  run(process.execPath, [path.join(SKILL, 'engine', 'render.mjs'), proj, '--stills', String(flags.stills)], 'stills');
  console.log(`→ ${path.join(B, 'stills', 'sheet.png')}`);
  process.exit(0);
}

// 3. picture
const video = path.join(B, 'video.mp4');
if (!flags['audio-only'] || !fs.existsSync(video)) run(process.execPath, [path.join(SKILL, 'engine', 'render.mjs'), proj], 'picture');

// 4. score + 5. mix
const mArgs = [path.join(SKILL, 'audio', 'music.py'), proj];
if (flags.music) mArgs.push('--preset', flags.music);
if (!flags['no-music']) run(PY, mArgs, 'score');

const mixArgs = [path.join(SKILL, 'audio', 'mix.py'), proj];
if (flags['no-music']) mixArgs.push('--no-music');
if (flags.keep) mixArgs.push('--keep');
run(PY, mixArgs, 'mix');

// 6. mux
const outDir = path.join(proj, 'out'); fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, `${slug}.mp4`);
const mux = spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', video, '-i', path.join(B, 'mix.wav'), '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out], { stdio: 'inherit' });
if (mux.status !== 0) { console.error('✗ mux failed'); process.exit(1); }

// QA sheet: 8 frames from the finished file
const dur = parseFloat(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out], { encoding: 'utf8' }).stdout) || 10;
spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', out, '-vf', `fps=${(8 / dur).toFixed(4)},scale=270:-1,tile=8x1:padding=4:color=white`, '-frames:v', '1', path.join(B, 'qa_sheet.jpg')]);
console.log(`\n★ ${out}  (${dur.toFixed(1)}s)\n  QA sheet: ${path.join(B, 'qa_sheet.jpg')}`);
