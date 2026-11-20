#!/usr/bin/env node
/**
 * Exporta a animação de index.html para MP4.
 *
 * Como funciona:
 *   1. O Puppeteer abre index.html?export=1 num Chrome headless (sem o loop em tempo real).
 *   2. Para cada quadro N (24 fps), chama window.RetroToon.frameDataURL(N): a página desenha
 *      exatamente aquele quadro (é determinístico) e devolve um PNG.
 *   3. Os PNGs vão direto, por pipe, para o FFmpeg, que gera um H.264 compatível com qualquer player.
 *
 * Uso:
 *   node export/render.mjs [opções]
 *     --out <arquivo>      saída (padrão: out/zarko.mp4)
 *     --loops <n>          quantas vezes repetir o ciclo de 7 s (padrão: 2)
 *     --frames <n>         número exato de quadros (sobrepõe --loops)
 *     --size <LxA>         redimensiona na saída, ex.: 1440x1080 (padrão: 960x720)
 *     --crf <n>            qualidade x264, menor = melhor (padrão: 16)
 *     --no-vhs             desliga grão, scanlines e OSD (só o desenho animado)
 *     --png-dir <pasta>    também salva cada quadro como PNG
 *
 * Variáveis de ambiente opcionais:
 *   CHROME_PATH   usa um Chrome/Chromium já instalado em vez do que vem com o Puppeteer
 *   FFMPEG_PATH   usa um ffmpeg específico
 */
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// ---------- argumentos ----------
const argv = process.argv.slice(2);
const opt = (name, def) => { const i = argv.indexOf(`--${name}`); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : def; };
const flag = name => argv.includes(`--${name}`);
const outFile = resolve(root, opt('out', 'out/zarko.mp4'));
const loops = Math.max(1, Number(opt('loops', 2)));
const crf = String(opt('crf', 16));
const size = opt('size', null);
const pngDir = opt('png-dir', null);
const vhs = !flag('no-vhs');

// ---------- ffmpeg ----------
async function findFfmpeg() {
  if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH;
  if (spawnSync('ffmpeg', ['-version']).status === 0) return 'ffmpeg';
  try {
    const mod = await import('@ffmpeg-installer/ffmpeg');
    return (mod.default || mod).path;
  } catch {
    throw new Error('FFmpeg não encontrado. Rode "npm install" ou instale o ffmpeg no sistema.');
  }
}

async function main() {
  const ffmpegPath = await findFfmpeg();
  mkdirSync(dirname(outFile), { recursive: true });
  if (pngDir) mkdirSync(resolve(root, pngDir), { recursive: true });

  const launch = { headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--allow-file-access-from-files'] };
  if (process.env.CHROME_PATH) launch.executablePath = process.env.CHROME_PATH;
  const browser = await puppeteer.launch(launch);
  const page = await browser.newPage();
  page.on('pageerror', e => console.error('[página]', e.message));
  await page.setViewport({ width: 1100, height: 900, deviceScaleFactor: 1 });

  const url = pathToFileURL(resolve(root, 'index.html')).href + '?export=1';
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction('window.RetroToon && window.RetroToon.ready', { timeout: 30000 });
  const info = await page.evaluate(vhsOn => { window.RetroToon.setFX(vhsOn); const r = window.RetroToon; return { fps: r.fps, loop: r.loopFrames, w: r.width, h: r.height }; }, vhs);

  const total = Number(opt('frames', info.loop * loops));
  const filters = [];
  if (size) { const [w, h] = size.split('x').map(Number); filters.push(`scale=${w}:${h}:flags=lanczos`); }
  filters.push('format=yuv420p');

  const args = [
    '-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(info.fps), '-c:v', 'png', '-i', '-',
    '-vf', filters.join(','),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', crf, '-tune', 'animation',
    '-r', String(info.fps), '-movflags', '+faststart',
    outFile,
  ];
  const ff = spawn(ffmpegPath, args, { stdio: ['pipe', 'inherit', 'inherit'] });
  const ffDone = new Promise((res, rej) => { ff.on('error', rej); ff.on('close', code => (code === 0 ? res() : rej(new Error(`ffmpeg saiu com código ${code}`)))); });

  console.log(`Renderizando ${total} quadros (${(total / info.fps).toFixed(1)} s a ${info.fps} fps, ${info.w}x${info.h}${size ? ` → ${size}` : ''}, VHS ${vhs ? 'ligado' : 'desligado'})`);
  const t0 = Date.now();
  for (let n = 0; n < total; n++) {
    const dataUrl = await page.evaluate(i => window.RetroToon.frameDataURL(i, 'image/png'), n);
    const buf = Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64');
    if (pngDir) writeFileSync(resolve(root, pngDir, `quadro_${String(n).padStart(5, '0')}.png`), buf);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (n % 24 === 23 || n === total - 1) process.stdout.write(`\r  ${n + 1}/${total} quadros`);
  }
  ff.stdin.end();
  await ffDone;
  await browser.close();
  console.log(`\nPronto em ${((Date.now() - t0) / 1000).toFixed(1)} s → ${outFile}${existsSync(outFile) ? '' : ' (arquivo não encontrado!)'}`);
}

main().catch(err => { console.error('\nErro:', err.message); process.exit(1); });
