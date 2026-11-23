/* ============================================================
   MODO REALISTA: texturas procedurais, luz, foco e câmera na mão
   (sem nanquim: tudo é gradiente, textura e luz)
   ============================================================ */
const LWH = WIN.h, LCX = 270, LCY = WIN.h / 2;
function mk(w, h) { const cv = document.createElement('canvas'); cv.width = Math.round(w); cv.height = Math.round(h); return [cv, cv.getContext('2d')]; }
function vnoise(seed) {
  const sm = t => t * t * (3 - 2 * t);
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), u = sm(x - xi), v = sm(y - yi);
    const a = h2(xi + seed * 131, yi), b = h2(xi + 1 + seed * 131, yi), c0 = h2(xi + seed * 131, yi + 1), d = h2(xi + 1 + seed * 131, yi + 1);
    return a + (b - a) * u + (c0 - a) * v + (a - b - c0 + d) * u * v;
  };
}
const fbm = (n, x, y, o = 4) => { let s = 0, a = .5, f = 1, t = 0; for (let i = 0; i < o; i++) { s += a * n(x * f, y * f); t += a; a *= .5; f *= 2.03; } return s / t; };
const mixc = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
function texture(w, h, fn) {
  const [cv, x] = mk(w, h), im = x.createImageData(w, h), D = im.data;
  for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) { const c = fn(px, py), i = (py * w + px) * 4; D[i] = c[0]; D[i + 1] = c[1]; D[i + 2] = c[2]; D[i + 3] = 255; }
  x.putImageData(im, 0, 0); return cv;
}
const TX = {};
function buildTextures() {
  const n1 = vnoise(11), n2 = vnoise(23), n3 = vnoise(37);
  TX.wood = texture(900, 360, (x, y) => {
    const f = fbm(n1, x / 160, y / 22, 4), g = Math.sin(y * .23 + f * 13) * .5 + .5, k = .22 + .45 * g * g + .33 * fbm(n2, x / 30, y / 5, 3) - .12;
    const seam = (y % 120) < 2 ? .45 : 1;
    return mixc([46, 28, 17], [138, 92, 58], Math.max(0, Math.min(1, k))).map(v => v * seam);
  });
  TX.plaster = texture(512, 512, (x, y) => { const k = .82 + .28 * fbm(n1, x / 70, y / 70, 5) + .05 * n3(x / 3, y / 3); return [118 * k, 120 * k, 126 * k]; });
  TX.sheet = texture(512, 512, (x, y) => { const k = .86 + .12 * fbm(n2, x / 80, y / 60, 4) + .05 * Math.sin(x / 26 + fbm(n1, x / 90, y / 90) * 7) + .02 * ((x + y) % 4 < 2); return [200 * k, 204 * k, 212 * k]; });
  TX.skin = texture(512, 512, (x, y) => { const k = .9 + .1 * fbm(n3, x / 22, y / 22, 4) + .04 * n1(x / 2.5, y / 2.5); return [214 * k, 164 * k, 138 * k]; });
  // a foto antiga da mãe com o filho (desbotada, sem rosto nítido)
  { const [cv, x] = mk(240, 300); const gr = x.createLinearGradient(0, 0, 0, 300); gr.addColorStop(0, '#c9b089'); gr.addColorStop(1, '#8e7656'); x.fillStyle = gr; x.fillRect(0, 0, 240, 300);
    x.filter = 'blur(3px)'; x.fillStyle = '#5b4632'; x.beginPath(); x.ellipse(95, 95, 26, 32, 0, 0, 7); x.fill(); x.beginPath(); x.ellipse(95, 215, 52, 95, 0, 0, 7); x.fill();
    x.fillStyle = '#6b543c'; x.beginPath(); x.ellipse(160, 175, 17, 20, 0, 0, 7); x.fill(); x.beginPath(); x.ellipse(160, 250, 30, 55, 0, 0, 7); x.fill(); x.filter = 'none';
    for (let i = 0; i < 40; i++) { x.strokeStyle = `rgba(255,245,220,${.1 + h2(i, 1) * .2})`; x.lineWidth = .7; x.beginPath(); const sx = h2(i, 2) * 240, sy = h2(i, 3) * 300; x.moveTo(sx, sy); x.lineTo(sx + (h2(i, 4) - .5) * 40, sy + h2(i, 5) * 30); x.stroke(); }
    TX.photo = cv; }
  // a foto do contato: ele mesmo, de moletom, mal iluminado
  { const [cv, x] = mk(200, 200); const gr = x.createRadialGradient(100, 80, 10, 100, 100, 140); gr.addColorStop(0, '#5a6070'); gr.addColorStop(1, '#1b1e26'); x.fillStyle = gr; x.fillRect(0, 0, 200, 200);
    x.filter = 'blur(2px)'; x.fillStyle = '#2c3140'; x.beginPath(); x.ellipse(100, 210, 80, 70, 0, 0, 7); x.fill(); x.fillStyle = '#b48a72'; x.beginPath(); x.ellipse(100, 98, 34, 42, 0, 0, 7); x.fill();
    x.fillStyle = '#21252f'; x.beginPath(); x.ellipse(100, 70, 44, 30, 0, Math.PI, 0); x.fill(); x.fillStyle = '#2a1e18'; x.fillRect(84, 94, 10, 4); x.fillRect(106, 94, 10, 4); x.filter = 'none';
    TX.avatar = cv; }
  // fundo do quarto desfocado, com e sem alguém sentado na beira da cama
  TX.bg = makeBg(false); TX.bgGhost = makeBg(true);
}
function makeBg(ghost) {
  const [cv, x] = mk(LWW * 1.2, 300);
  x.fillStyle = '#16181f'; x.fillRect(0, 0, cv.width, 300);
  x.fillStyle = '#2b3550'; x.fillRect(250, 40, 150, 130);                                  // janela
  for (let i = 0; i < 6; i++) { x.fillStyle = `rgba(255,170,90,${.3 + h2(i, 9) * .4})`; x.beginPath(); x.arc(265 + h2(i, 7) * 120, 70 + h2(i, 8) * 80, 4 + h2(i, 6) * 6, 0, 7); x.fill(); }   // luzes da cidade
  x.fillStyle = '#23262f'; x.fillRect(60, 170, 420, 130);                                   // cama
  x.fillStyle = '#2f3440'; x.fillRect(60, 160, 420, 26);
  if (ghost) { x.fillStyle = '#07080b'; x.beginPath(); x.ellipse(330, 115, 26, 32, 0, 0, 7); x.fill(); x.beginPath(); x.ellipse(330, 200, 48, 80, 0, 0, 7); x.fill();
    x.fillStyle = 'rgba(220,235,255,.85)'; x.fillRect(318, 110, 5, 3); x.fillRect(337, 110, 5, 3); }
  const [b, bx] = mk(cv.width, 300); bx.filter = 'blur(9px)'; bx.drawImage(cv, 0, 0); return b;
}
const LWW = 540;
// desenha uma textura num plano em perspectiva (faixas horizontais)
function plane(img, yTop, yBot, l0, r0, l1, r1, rows = 70, sx = 0, sw = null) {
  sw = sw || img.width;
  for (let i = 0; i < rows; i++) {
    const t0 = i / rows, t1 = (i + 1) / rows, v0 = Math.pow(t0, 1.6), v1 = Math.pow(t1, 1.6);
    const y0 = lerp(yTop, yBot, t0), y1 = lerp(yTop, yBot, t1), lx = lerp(l0, l1, t0), rx = lerp(r0, r1, t0);
    c.drawImage(img, sx, v0 * img.height, sw, Math.max(1, (v1 - v0) * img.height), lx, y0, rx - lx, y1 - y0 + .6);
  }
}
function rr(x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
// iluminação: luz ambiente + pontos de luz, multiplicada sobre a cena
const [LIT, lx] = mk(1, 1);
function applyLights(lights, ambient) {
  if (LIT.width !== W) { LIT.width = W; LIT.height = H; }
  lx.setTransform(1, 0, 0, 1, 0, 0); lx.globalCompositeOperation = 'source-over'; lx.fillStyle = ambient; lx.fillRect(0, 0, W, H);
  lx.setTransform(c.getTransform()); lx.globalCompositeOperation = 'lighter';
  lights.forEach(L => { const g = lx.createRadialGradient(L.x, L.y, 0, L.x, L.y, L.r); g.addColorStop(0, L.col); g.addColorStop(1, 'rgba(0,0,0,0)'); lx.fillStyle = g; lx.save(); if (L.sy) { lx.translate(L.x, L.y); lx.scale(1, L.sy); lx.translate(-L.x, -L.y); } lx.fillRect(L.x - L.r, L.y - L.r, L.r * 2, L.r * 2); lx.restore(); });
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'multiply'; c.drawImage(LIT, 0, 0); c.restore();
}

/* ---------- TEMPO ---------- */
const SH = { mesa: [0, 3.8], foto: [3.8, 7.6], quarto: [7.6, 13], tela: [13, 16.2], chamada: [16.2, 21], olho: [21, 26], colchao: [26, 32], fim: [32, 36] };
const ANSWER = 16.2;
const ringing = t => t < ANSWER || t >= 32;
const vib = t => ringing(t) && (t % 1.1) < .55;                  // vibra em pulsos
const GLIMPSE = d => d >= 4 && d <= 9;                           // o flash da tela mostra alguém na beira da cama
const screenFlash = d => (GLIMPSE(d) ? 2.2 : 1);

/* ---------- O CELULAR ---------- */
function drawPhoneUI(x0, y0, w, h, t, d, emissive) {
  // tela (no passe emissivo ela brilha; no passe base é só o vidro escuro)
  c.save(); rr(x0, y0, w, h, w * .09); c.clip();
  if (!emissive) { c.fillStyle = '#05070a'; c.fillRect(x0, y0, w, h); c.restore(); return; }
  const gr = c.createLinearGradient(0, y0, 0, y0 + h); gr.addColorStop(0, '#2a3348'); gr.addColorStop(1, '#0b0e16'); c.fillStyle = gr; c.fillRect(x0, y0, w, h);
  c.fillStyle = 'rgba(255,255,255,.9)'; c.textAlign = 'center'; c.textBaseline = 'middle';
  const u = w / 100;
  c.font = `500 ${6 * u}px Inter, Helvetica, sans-serif`; c.fillText('3:16', x0 + w / 2, y0 + 8 * u);
  c.save(); c.beginPath(); c.arc(x0 + w / 2, y0 + 40 * u, 17 * u, 0, 7); c.clip(); c.drawImage(TX.avatar, x0 + w / 2 - 17 * u, y0 + 23 * u, 34 * u, 34 * u); c.restore();
  c.font = `600 ${11 * u}px Inter, Helvetica, sans-serif`; c.fillText('Rafael', x0 + w / 2, y0 + 70 * u);
  c.fillStyle = 'rgba(255,255,255,.6)'; c.font = `400 ${5.5 * u}px Inter, Helvetica, sans-serif`;
  if (t < ANSWER || t >= 32) {
    c.fillText('celular · chamando…', x0 + w / 2, y0 + 81 * u);
    [[-1, '#e5484d', 'Recusar'], [1, '#30a46c', 'Atender']].forEach(([s, col, lab]) => {
      const bx = x0 + w / 2 + s * 24 * u, by = y0 + h - 34 * u, pulse = 1 + (s > 0 ? .06 * Math.sin(t * 9) : 0);
      c.fillStyle = col; c.beginPath(); c.arc(bx, by, 11 * u * pulse, 0, 7); c.fill();
      c.save(); c.translate(bx, by); c.rotate(s < 0 ? 2.36 : 0); c.fillStyle = '#fff'; rr(-5 * u, -2 * u, 10 * u, 4 * u, 2 * u); c.fill(); c.restore();
      c.fillStyle = 'rgba(255,255,255,.75)'; c.fillText(lab, bx, by + 17 * u);
    });
  } else {
    const s = Math.floor(t - ANSWER) + 1; c.fillText('00:' + String(s).padStart(2, '0'), x0 + w / 2, y0 + 81 * u);
    for (let i = 0; i < 13; i++) { const a = .3 + .7 * Math.abs(Math.sin(t * 1.4 + i * .5)) * (.6 + .4 * Math.sin(t * .9)); c.fillStyle = 'rgba(255,255,255,.55)'; rr(x0 + w / 2 - 30 * u + i * 4.8 * u, y0 + 96 * u - 7 * u * a, 2.6 * u, 14 * u * a, u); c.fill(); }
    c.fillStyle = '#e5484d'; c.beginPath(); c.arc(x0 + w / 2, y0 + h - 30 * u, 11 * u, 0, 7); c.fill();
  }
  // reflexo do vidro + grade de pixels
  const rg = c.createLinearGradient(x0, y0, x0 + w, y0 + h); rg.addColorStop(.25, 'rgba(255,255,255,0)'); rg.addColorStop(.32, 'rgba(255,255,255,.07)'); rg.addColorStop(.4, 'rgba(255,255,255,0)'); c.fillStyle = rg; c.fillRect(x0, y0, w, h);
  c.restore();
}
function drawPhone(cx, cy, w, h, rot, sy, t, d, emissive) {
  c.save(); c.translate(cx, cy); c.rotate(rot); c.scale(1, sy);
  if (!emissive) {
    c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 18 * R; c.shadowOffsetY = 8 * R;
    c.fillStyle = '#0e0f12'; rr(-w / 2, -h / 2, w, h, w * .12); c.fill(); c.shadowColor = 'transparent';
    c.strokeStyle = 'rgba(200,210,230,.25)'; c.lineWidth = 1.2; rr(-w / 2 + .6, -h / 2 + .6, w - 1.2, h - 1.2, w * .12); c.stroke();
  }
  drawPhoneUI(-w / 2 + w * .045, -h / 2 + w * .045, w * .91, h - w * .09, t, d, emissive);
  c.restore();
}

/* ---------- AS CENAS ---------- */
function shake(t, amp) { return [Math.sin(t * 1.3) * amp + Math.sin(t * 3.1) * amp * .4, Math.cos(t * 1.1) * amp * .7 + Math.sin(t * 2.6) * amp * .3, Math.sin(t * .9) * amp * .0015]; }
function vibOff(t, d) { return vib(t) ? [(h2(d, 3) - .5) * 3, (h2(d, 4) - .5) * 2, (h2(d, 5) - .5) * .012] : [0, 0, 0]; }

function sceneMesa(t, d, pass) {
  const [vx, vy, vr] = vibOff(t, d), fl = screenFlash(d);
  if (pass === 'base') {
    c.drawImage(GLIMPSE(d) ? TX.bgGhost : TX.bg, -60, -40, LWW * 1.25, 330);
    plane(TX.wood, 250, LWH + 30, 10, 530, -160, 700);
    // porta-retrato no fundo e copo d'água
    c.fillStyle = '#2a1d14'; rr(70, 170, 92, 115, 4); c.fill(); c.fillStyle = '#6b5843'; c.fillRect(80, 180, 72, 95); c.globalAlpha = .5; c.drawImage(TX.photo, 80, 180, 72, 95); c.globalAlpha = 1;
    c.fillStyle = 'rgba(190,210,230,.18)'; rr(430, 205, 46, 80, 8); c.fill(); c.strokeStyle = 'rgba(220,235,255,.35)'; c.lineWidth = 1.2; rr(430, 205, 46, 80, 8); c.stroke();
    drawPhone(270 + vx, 395 + vy, 118, 250, -.18 + vr, .55, t, d, false);
  } else if (pass === 'lights') {
    return [{ x: 270 + vx, y: 395, r: 300 * fl, col: `rgba(150,180,255,${.75 * Math.min(1.4, fl)})`, sy: .7 }, { x: 330, y: 60, r: 380, col: 'rgba(80,95,140,.35)' }];
  } else if (pass === 'emissive') {
    drawPhone(270 + vx, 395 + vy, 118, 250, -.18 + vr, .55, t, d, true);
  }
}
function sceneFoto(t, d, pass) {
  const p = vib(t) ? .55 + .45 * Math.abs(Math.sin(t * 40)) : .35;
  if (pass === 'base') {
    c.drawImage(TX.plaster, -50, -40, 640, 660);
    c.save(); c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 22 * R; c.shadowOffsetX = 10 * R; c.shadowOffsetY = 12 * R;
    c.drawImage(TX.wood, 0, 0, 300, 360, 120, 70, 300, 400); c.restore();
    c.fillStyle = '#d8cdb6'; c.fillRect(150, 100, 240, 340); c.drawImage(TX.photo, 160, 110, 220, 320);
    const rg = c.createLinearGradient(150, 100, 390, 440); rg.addColorStop(.3, 'rgba(255,255,255,0)'); rg.addColorStop(.42, 'rgba(255,255,255,.14)'); rg.addColorStop(.5, 'rgba(255,255,255,0)'); c.fillStyle = rg; c.fillRect(150, 100, 240, 340);
  } else if (pass === 'lights') {
    return [{ x: -40, y: 420, r: 520, col: `rgba(140,170,255,${.8 * p})` }, { x: 400, y: 0, r: 300, col: 'rgba(70,80,110,.3)' }];
  }
}
function rainDrops(x0, y0, w, h, t) {
  for (let i = 0; i < 46; i++) {
    const sp = .25 + h2(i, 2) * .8, x = x0 + h2(i, 1) * w, y = y0 + ((h2(i, 3) * h + t * sp * h * .35) % h);
    const r = 1.2 + h2(i, 4) * 2.2;
    c.fillStyle = 'rgba(190,210,240,.35)'; c.beginPath(); c.ellipse(x, y, r * .8, r * 1.2, 0, 0, 7); c.fill();
    c.strokeStyle = 'rgba(190,210,240,.12)'; c.lineWidth = r * .6; c.beginPath(); c.moveTo(x, y - r); c.lineTo(x + (h2(i, 5) - .5) * 3, y - r - 10 - sp * 18); c.stroke();
  }
}
function sceneQuarto(t, d, pass) {
  const [vx, vy] = vibOff(t, d), on = 1;
  if (pass === 'base') {
    c.drawImage(TX.plaster, -40, -60, 640, 470);
    // janela com chuva
    const wg = c.createLinearGradient(0, 60, 0, 250); wg.addColorStop(0, '#26324d'); wg.addColorStop(1, '#141a29'); c.fillStyle = wg; c.fillRect(150, 55, 190, 200);
    for (let i = 0; i < 5; i++) { c.fillStyle = `rgba(255,170,90,${.25 + h2(i, 9) * .3})`; c.beginPath(); c.arc(170 + h2(i, 7) * 150, 150 + h2(i, 8) * 70, 4 + h2(i, 6) * 5, 0, 7); c.fill(); }
    c.save(); c.beginPath(); c.rect(150, 55, 190, 200); c.clip(); rainDrops(150, 55, 190, 200, t); c.restore();
    c.fillStyle = '#b9b6ac'; c.fillRect(142, 47, 206, 10); c.fillRect(142, 253, 206, 12); c.fillRect(142, 47, 10, 216); c.fillRect(338, 47, 10, 216); c.fillRect(242, 47, 7, 216);
    // cortinas
    [[95, 150], [340, 395]].forEach(([a, b]) => { const g = c.createLinearGradient(a, 0, b, 0); for (let k = 0; k <= 6; k++) g.addColorStop(k / 6, k % 2 ? '#4b5468' : '#3a4255'); c.fillStyle = g; c.fillRect(a, 30, b - a, 300); });
    // porta entreaberta à esquerda
    c.fillStyle = '#4a3a2c'; c.fillRect(-10, 40, 92, 360); c.fillStyle = '#020203'; c.fillRect(60, 46, 22, 352);
    // chão de tacos
    plane(TX.wood, 370, LWH + 10, -60, 600, -380, 920);
    // pegadas de terra da porta até a cama (só aparecem quando a tela acende)
    for (let i = 0; i < 6; i++) { const k = i / 5, x = lerp(70, 250, k) + (i % 2 ? 14 : -14), y = lerp(410, 540, k * k), s = lerp(.6, 1.2, k); c.fillStyle = 'rgba(30,18,8,.8)'; c.beginPath(); c.ellipse(x, y, 10 * s, 5.5 * s, .3, 0, 7); c.fill(); c.fillStyle = 'rgba(30,18,8,.6)'; c.beginPath(); c.ellipse(x + 6 * s, y - 7 * s, 4 * s, 3 * s, .3, 0, 7); c.fill(); }
    // criado-mudo com o celular
    c.fillStyle = '#3e2c1f'; c.fillRect(392, 330, 140, 130); c.drawImage(TX.wood, 0, 0, 400, 120, 386, 312, 152, 26); c.fillStyle = '#2c2016'; c.fillRect(402, 360, 120, 40); c.fillStyle = '#b39b6a'; c.beginPath(); c.arc(462, 380, 4, 0, 7); c.fill();
    drawPhone(460 + vx, 318 + vy, 50, 92, 1.45, .35, t, d, false);
    // cobertor desfocado em primeiro plano
    c.save(); c.filter = `blur(${6 * R}px)`; c.drawImage(TX.sheet, -60, 470, 680, 160); c.restore();
  } else if (pass === 'lights') {
    return [{ x: 460 + vx, y: 318, r: 260, col: 'rgba(150,180,255,.85)', sy: .8 }, { x: 245, y: 150, r: 300, col: 'rgba(90,110,170,.45)' }, { x: 245, y: 470, r: 220, col: 'rgba(80,100,160,.28)', sy: .4 }];
  } else if (pass === 'emissive') {
    drawPhone(460 + vx, 318 + vy, 50, 92, 1.45, .35, t, d, true);
  }
}
const [SCR, scx] = mk(1, 1);
function sceneTela(t, d, pass, answered) {
  const [vx, vy, vr] = vibOff(t, d);
  const t0 = answered ? SH.chamada[0] : SH.tela[0], blurK = Math.max(0, 1 - (t - t0) / 1.1);   // o foco "puxa" até a tela ficar nítida
  if (pass === 'base') {
    c.drawImage(TX.bg, -120, -60, 800, 680);
    if (answered) { c.save(); c.filter = `blur(${5 * R}px)`; c.globalAlpha = .9; c.fillStyle = '#26324d'; c.fillRect(-40, 20, 260, 240); c.save(); c.beginPath(); c.rect(-40, 20, 260, 240); c.clip(); rainDrops(-40, 20, 260, 240, t); c.restore(); c.restore(); }
    drawPhone(answered ? 330 : 270 + vx, 290 + vy, 300, 600, (answered ? .12 : -.04) + vr, 1, t, d, false);
  } else if (pass === 'lights') {
    return [{ x: 270, y: 290, r: 520, col: 'rgba(140,170,255,.55)' }];
  } else if (pass === 'emissive') {
    if (blurK > .02) { c.save(); c.filter = `blur(${blurK * 7 * R}px)`; }
    drawPhone(answered ? 330 : 270 + vx, 290 + vy, 300, 600, (answered ? .12 : -.04) + vr, 1, t, d, true);
    if (blurK > .02) c.restore();
  }
}
// olho realista em close (o próprio Rafael), refletindo a tela
function sceneOlho(t, d, pass) {
  const k = (t - SH.olho[0]);
  const look = k > 2.6 ? -1 : 0, lookK = k > 2.6 ? E.o(Math.min(1, (k - 2.6) / .12)) : 0;   // sacada rápida: olha pra trás
  const pupil = lerp(16, 26, Math.min(1, k / 3)), ix = 270 + look * lookK * 62 + Math.sin(t * 7) * .8, iy = 280;
  if (pass === 'base') {
    c.drawImage(TX.skin, -80, -60, 700, 700);
    const sg = c.createRadialGradient(270, 280, 40, 270, 280, 330); sg.addColorStop(0, 'rgba(0,0,0,0)'); sg.addColorStop(1, 'rgba(40,10,10,.55)'); c.fillStyle = sg; c.fillRect(-80, -60, 700, 700);
    // abertura do olho
    c.save(); c.beginPath(); c.moveTo(70, 285); c.bezierCurveTo(160, 150, 380, 150, 475, 270); c.bezierCurveTo(390, 380, 170, 390, 70, 285); c.closePath();
    c.fillStyle = '#e8e2dc'; c.fill(); c.clip();
    const sc = c.createRadialGradient(270, 280, 60, 270, 280, 230); sc.addColorStop(0, '#f1ece6'); sc.addColorStop(1, '#b49a90'); c.fillStyle = sc; c.fillRect(60, 150, 430, 240);
    for (let i = 0; i < 14; i++) { const a = h2(i, 1) * 6.28, r0 = 120; c.strokeStyle = 'rgba(170,40,40,.35)'; c.lineWidth = .9; c.beginPath(); let x = 270 + Math.cos(a) * 200, y = 280 + Math.sin(a) * 110; c.moveTo(x, y); for (let j = 0; j < 5; j++) { x += (270 - x) * .14 + (h2(i, j + 5) - .5) * 14; y += (280 - y) * .14 + (h2(i, j + 9) - .5) * 10; c.lineTo(x, y); } c.stroke(); }
    // íris com fibras
    const ig = c.createRadialGradient(ix, iy, pupil, ix, iy, 78); ig.addColorStop(0, '#6a4a2a'); ig.addColorStop(.55, '#4d5a3c'); ig.addColorStop(1, '#1d2418'); c.fillStyle = ig; c.beginPath(); c.arc(ix, iy, 78, 0, 7); c.fill();
    for (let i = 0; i < 120; i++) { const a = i / 120 * 6.283 + h2(i, 2) * .05, r1 = pupil + 2, r2 = 74 - h2(i, 3) * 14; c.strokeStyle = `rgba(${h2(i, 4) > .5 ? '210,180,120' : '20,25,15'},${.18 + h2(i, 5) * .2})`; c.lineWidth = .8; c.beginPath(); c.moveTo(ix + Math.cos(a) * r1, iy + Math.sin(a) * r1); c.lineTo(ix + Math.cos(a) * r2, iy + Math.sin(a) * r2); c.stroke(); }
    c.fillStyle = '#050505'; c.beginPath(); c.arc(ix, iy, pupil, 0, 7); c.fill();
    const lid = c.createLinearGradient(0, 160, 0, 240); lid.addColorStop(0, 'rgba(60,20,15,.55)'); lid.addColorStop(1, 'rgba(60,20,15,0)'); c.fillStyle = lid; c.fillRect(60, 150, 430, 100);   // sombra da pálpebra
    c.restore();
    // pálpebras e cílios
    c.strokeStyle = 'rgba(90,45,35,.7)'; c.lineWidth = 6; c.beginPath(); c.moveTo(70, 285); c.bezierCurveTo(160, 150, 380, 150, 475, 270); c.stroke();
    c.strokeStyle = 'rgba(120,70,60,.45)'; c.lineWidth = 3; c.beginPath(); c.moveTo(80, 230); c.bezierCurveTo(170, 110, 390, 105, 490, 215); c.stroke();
    for (let i = 0; i < 34; i++) { const u = .05 + i / 34 * .9, x = Math.pow(1 - u, 3) * 70 + 3 * Math.pow(1 - u, 2) * u * 160 + 3 * (1 - u) * u * u * 380 + u * u * u * 475, y = Math.pow(1 - u, 3) * 285 + 3 * Math.pow(1 - u, 2) * u * 150 + 3 * (1 - u) * u * u * 150 + u * u * u * 270; c.strokeStyle = '#1b120e'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + (u - .5) * 14, y - 14, x + (u - .5) * 30, y - 26 - h2(i, 1) * 8); c.stroke(); }
  } else if (pass === 'lights') {
    return [{ x: 200, y: 520, r: 520, col: 'rgba(150,175,255,.8)' }, { x: 520, y: 0, r: 260, col: 'rgba(60,70,100,.25)' }];
  } else if (pass === 'emissive') {
    // reflexo da tela do celular na córnea + brilho úmido
    c.fillStyle = 'rgba(220,232,255,.85)'; rr(ix - 34, iy - 42, 14, 24, 3); c.fill();
    c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.arc(ix + 20, iy - 34, 4, 0, 7); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 2; c.beginPath(); c.moveTo(150, 330); c.quadraticCurveTo(270, 375, 400, 320); c.stroke();
  }
}
// o colchão afundando atrás dele
function sceneColchao(t, d, pass) {
  const k = (t - SH.colchao[0]);
  const sink = E.io(Math.min(1, Math.max(0, (k - .8) / 1.6))) * .6 + E.io(Math.min(1, Math.max(0, (k - 3.2) / 1.4))) * .4;   // afunda em dois tempos, como alguém se ajeitando
  const cx = 300, cy = 225;
  if (pass === 'base') {
    c.fillStyle = '#0d0f14'; c.fillRect(-60, -60, 660, 680);
    plane(TX.sheet, 140, LWH + 40, 40, 560, -260, 860, 90);
    if (sink > 0) {
      c.save(); c.globalCompositeOperation = 'multiply';
      const g = c.createRadialGradient(cx, cy, 4, cx, cy, 150 * (.6 + .4 * sink)); g.addColorStop(0, `rgba(30,30,40,${.85 * sink})`); g.addColorStop(.6, `rgba(90,90,110,${.5 * sink})`); g.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = g; c.save(); c.translate(cx, cy); c.scale(1.5, .55); c.translate(-cx, -cy); c.fillRect(cx - 200, cy - 200, 400, 400); c.restore(); c.restore();
      for (let i = 0; i < 9; i++) { const a = -2.6 + i * .3, r0 = 30 * sink, r1 = 120 + 60 * sink; c.strokeStyle = `rgba(40,42,55,${.35 * sink})`; c.lineWidth = 2.2; c.beginPath(); c.moveTo(cx + Math.cos(a) * r0 * 1.5, cy + Math.sin(a) * r0 * .55); c.quadraticCurveTo(cx + Math.cos(a + .15) * r1 * .9, cy + Math.sin(a + .15) * r1 * .4, cx + Math.cos(a) * r1 * 1.6, cy + Math.sin(a) * r1 * .6); c.stroke(); }
      c.strokeStyle = `rgba(235,238,245,${.25 * sink})`; c.lineWidth = 2; c.beginPath(); c.ellipse(cx, cy + 6, 120 * (.6 + .4 * sink), 34 * (.6 + .4 * sink), 0, 3.4, 6.0); c.stroke();
    }
    c.save(); c.filter = `blur(${7 * R}px)`; c.fillStyle = '#c8ccd6'; c.beginPath(); c.ellipse(60, 560, 220, 120, -.2, 0, 7); c.fill(); c.restore();   // travesseiro em primeiro plano
  } else if (pass === 'lights') {
    return [{ x: 40, y: 560, r: 600, col: 'rgba(150,175,255,.75)' }];
  }
}
const SCENES = { mesa: sceneMesa, foto: sceneFoto, quarto: sceneQuarto, tela: (t, d, p) => sceneTela(t, d, p, false), chamada: (t, d, p) => sceneTela(t, d, p, true), olho: sceneOlho, colchao: sceneColchao, fim: sceneMesa };

/* ---------- PLANOS ---------- */
const S = (a, b, env, cam, o = {}) => ({ a: sec(a), b: sec(b), env, cam, o });
const SHOTS = [
  S(0, 3.8, 'mesa', [1.05, LCX, LCY, 1.16, LCX, LCY + 10], { hand: .8 }),
  S(3.8, 7.6, 'foto', [1.0, LCX, LCY, 1.12, LCX, LCY - 5], { hand: .6 }),
  S(7.6, 13, 'quarto', [1.0, LCX, LCY, 1.08, LCX + 20, LCY], { hand: 1.2 }),
  S(13, 16.2, 'tela', [1.0, LCX, LCY, 1.08, LCX, LCY - 10], { hand: 1.2 }),
  S(16.2, 21, 'chamada', [1.0, LCX, LCY, 1.06, LCX + 10, LCY], { hand: 1.6 }),
  S(21, 26, 'olho', [1.0, LCX, LCY, 1.12, LCX, LCY], { hand: 1.1 }),
  S(26, 32, 'colchao', [1.0, LCX, LCY, 1.15, LCX + 20, LCY - 20], { hand: 1.4 }),
  S(32, 35.75, 'fim', [1.05, LCX, LCY, 1.16, LCX, LCY + 10], { hand: .8 }),
  S(35.75, 36, 'mesa', [1.05, LCX, LCY, 1.05, LCX, LCY], { hand: .8, loop: 1 }),
];
const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
const isSmear = () => false;
const T = { shake: () => 0 };

/* ---------- QUADRO ---------- */
function drawScene(t0, f) {
  const shot = shotAt(t0), o = shot.o;
  const t = o.loop ? 0 : t0 / FPS, d = o.loop ? 0 : t0;
  SEED = d;
  const u = E.io((t0 - shot.a) / Math.max(1, shot.b - shot.a));
  const [z0, x0, y0, z1, x1, y1] = shot.cam;
  const [hx, hy, hr] = shake(t + shot.a, o.hand || 1);
  const z = lerp(z0, z1, u), cx = lerp(x0, x1, u) + hx, cy = lerp(y0, y1, u) + hy;
  const setC = () => c.setTransform(R * z * Math.cos(hr), R * z * Math.sin(hr), -R * z * Math.sin(hr), R * z * Math.cos(hr), R * (WCX - cx * z), R * (WCY - cy * z));
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none';
  c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
  c.save(); c.setTransform(R, 0, 0, R, 0, 0); c.beginPath(); c.rect(WIN.x, WIN.y, WIN.w, WIN.h); c.clip();
  const SC = SCENES[shot.env];
  setC(); SC(t, d, 'base');
  setC(); const lights = SC(t, d, 'lights') || [];
  applyLights(lights, 'rgb(34,36,46)');
  setC(); c.globalCompositeOperation = 'source-over'; SC(t, d, 'emissive');
  c.restore();
}
