/* ============================================================
   GRIMÓRIO: gravura antiga em pergaminho, tinta, folha de ouro e luz de vela
   Nº 1 · OFANIM (Ezequiel 1) · 3º de 9 na hierarquia de Pseudo-Dionísio
   ============================================================ */
const LWH = WIN.h, LCX = 270, LCY = WIN.h / 2, LWW = 540;
const INKC = '#24180f', GOLD = '#b8913f', GOLDSH = '#7a5a22', PAPER = [214, 196, 158];
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
function texture(w, h, fn) {
  const [cv, x] = mk(w, h), im = x.createImageData(w, h), D = im.data;
  for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) { const q = fn(px, py), i = (py * w + px) * 4; D[i] = q[0]; D[i + 1] = q[1]; D[i + 2] = q[2]; D[i + 3] = 255; }
  x.putImageData(im, 0, 0); return cv;
}
const TX = {};
function buildTextures() {
  const n1 = vnoise(5), n2 = vnoise(17), n3 = vnoise(29);
  TX.parch = texture(640, 680, (x, y) => {
    const st = fbm(n1, x / 90, y / 90, 5), fib = fbm(n2, x / 6, y / 40, 3), dx = Math.min(x, 640 - x) / 640, dy = Math.min(y, 680 - y) / 680;
    const edge = Math.min(1, Math.min(dx, dy) * 9), spot = Math.max(0, fbm(n3, x / 40, y / 40, 4) - .62) * 2.2;
    const k = (.72 + .32 * st + .06 * fib - spot * .5) * (.55 + .45 * edge);
    return [PAPER[0] * k, PAPER[1] * k, PAPER[2] * k * .96];
  });
}
// luz: ambiente + pontos, multiplicada sobre a cena
const [LIT, lx] = mk(1, 1);
function applyLights(lights, ambient) {
  if (LIT.width !== W) { LIT.width = W; LIT.height = H; }
  lx.setTransform(1, 0, 0, 1, 0, 0); lx.globalCompositeOperation = 'source-over'; lx.fillStyle = ambient; lx.fillRect(0, 0, W, H);
  lx.setTransform(c.getTransform()); lx.globalCompositeOperation = 'lighter';
  lights.forEach(L => { const g = lx.createRadialGradient(L.x, L.y, 0, L.x, L.y, L.r); g.addColorStop(0, L.col); g.addColorStop(1, 'rgba(0,0,0,0)'); lx.fillStyle = g; lx.fillRect(L.x - L.r, L.y - L.r, L.r * 2, L.r * 2); });
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'multiply'; c.drawImage(LIT, 0, 0); c.restore();
}
const candle = t => .86 + .08 * Math.sin(t * 7.3) + .05 * Math.sin(t * 13.1 + 1) + .03 * Math.sin(t * 23.7);
function paper(x0 = -60, y0 = -60, w = 660, h = 680) { c.drawImage(TX.parch, x0, y0, w, h); }
function inkLine(pts, w = 1.8, col = INKC, a = 1) { c.save(); c.globalAlpha *= a; c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.stroke(); c.restore(); }
function fell(s, x, y, size, col = INKC, align = 'center', font = '"IM Fell English SC", Georgia, serif') { c.font = `${size}px ${font}`; c.textAlign = align; c.textBaseline = 'middle'; c.fillStyle = col; c.fillText(s, x, y); }
// texto "sendo escrito": revela letra a letra
function writeOn(s, x, y, size, k, col = INKC, font) { const n = Math.floor(s.length * Math.max(0, Math.min(1, k))); if (n > 0) fell(s.slice(0, n), x - (s.length - n) * size * .0, y, size, col, 'left', font); }

/* ---------- AS RODAS (Ezequiel 1) ---------- */
// um anel em 3D, com olhos no aro; devolve peças para ordenar por profundidade
function rot3(p, ax, ay, az) {
  let [x, y, z] = p, t;
  t = y * Math.cos(ax) - z * Math.sin(ax); z = y * Math.sin(ax) + z * Math.cos(ax); y = t;
  t = x * Math.cos(ay) + z * Math.sin(ay); z = -x * Math.sin(ay) + z * Math.cos(ay); x = t;
  t = x * Math.cos(az) - y * Math.sin(az); y = x * Math.sin(az) + y * Math.cos(az); x = t;
  return [x, y, z];
}
function ringParts(cx, cy, Rr, band, ax, ay, az, spin, eyes, eyeOpen, look, parts, id) {
  const N = 64, F = 900, P = (a, r) => { const q = rot3([Math.cos(a + spin) * r, Math.sin(a + spin) * r, 0], ax, ay, az); const k = F / (F + q[2]); return [cx + q[0] * k, cy + q[1] * k, q[2], k]; };
  for (let i = 0; i < N; i++) {
    const a0 = i / N * 6.2832, a1 = (i + 1) / N * 6.2832;
    const o0 = P(a0, Rr + band), o1 = P(a1, Rr + band), i0 = P(a0, Rr - band), i1 = P(a1, Rr - band);
    parts.push({ z: (o0[2] + i1[2]) / 2, kind: 'seg', pts: [o0, o1, i1, i0], i, id });
  }
  for (let e = 0; e < eyes; e++) {
    const a = e / eyes * 6.2832, p = P(a, Rr), p2 = P(a + .02, Rr), n = rot3([0, 0, 1], ax, ay, az);
    parts.push({ z: p[2] - 1, kind: 'eye', x: p[0], y: p[1], k: p[3], ang: Math.atan2(p2[1] - p[1], p2[0] - p[0]), face: Math.abs(n[2]), open: eyeOpen(e), look, id: id * 100 + e });
  }
}
function drawEye(x, y, s, ang, open, look, face, id, pass) {
  const w = 22 * s, h = 12 * s * Math.max(.06, open);
  c.save(); c.translate(x, y); c.rotate(ang);
  if (pass === 'base') {
    c.beginPath(); c.moveTo(-w, 0); c.quadraticCurveTo(0, -h * 1.6, w, 0); c.quadraticCurveTo(0, h * 1.6, -w, 0); c.closePath();
    c.fillStyle = '#f3ead2'; c.fill(); c.lineWidth = 2 * s; c.strokeStyle = INKC; c.stroke();
    if (open > .15) {
      c.save(); c.clip();
      const lx2 = look[0] * w * .38, ly2 = look[1] * h * .4, ir = Math.min(w * .5, 7.5 * s);
      c.fillStyle = '#4c5a46'; c.beginPath(); c.arc(lx2, ly2, ir, 0, 7); c.fill();
      for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283; inkLine([[lx2 + Math.cos(a) * ir * .45, ly2 + Math.sin(a) * ir * .45], [lx2 + Math.cos(a) * ir, ly2 + Math.sin(a) * ir]], .7 * s, INKC, .6); }
      c.fillStyle = '#0b0805'; c.beginPath(); c.arc(lx2, ly2, ir * .45, 0, 7); c.fill();
      c.restore();
    }
    // cílios e ruga, em traço de gravura
    for (let i = -3; i <= 3; i++) inkLine([[i * w * .26, -h * 1.15], [i * w * .3, -h * 1.15 - 4 * s]], .9 * s);
    inkLine([[-w * .9, -h * 1.7 - 3 * s], [0, -h * 2.2 - 4 * s], [w * .9, -h * 1.7 - 3 * s]], .8 * s, INKC, .6);
  } else if (pass === 'emissive' && open > .5) {
    c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(255,250,230,.9)'; c.beginPath(); c.arc(look[0] * w * .38 - 2.2 * s, look[1] * h * .4 - 2.2 * s, 1.7 * s, 0, 7); c.fill();
  }
  c.restore();
}
function drawRodas(cx, cy, S, t, pass, o = {}) {
  const parts = [];
  const spin = t * (o.slow ? .25 : .9), wob = Math.sin(t * .7) * .25;
  const open = e => (o.openAt == null ? 1 : Math.max(0, Math.min(1, (t - o.openAt - (e % 5) * .07) / .18)));
  const look = o.look || [Math.sin(t * 2.1) * .8, Math.cos(t * 1.7) * .5];
  ringParts(cx, cy, 150 * S, 16 * S, .3 + wob * .3, .55 + t * .5, .1, spin, 12, open, look, parts, 1);
  ringParts(cx, cy, 150 * S, 16 * S, .7 + t * .35, .2 + wob, .4, -spin * 1.2, 12, open, look, parts, 2);
  parts.sort((a, b) => b.z - a.z);
  for (const p of parts) {
    if (p.kind === 'seg') {
      if (pass !== 'base') continue;
      const dk = Math.max(0, Math.min(1, .5 + p.z / 300));   // o que está atrás fica mais escuro
      c.beginPath(); p.pts.forEach((q, i) => (i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]))); c.closePath();
      c.fillStyle = `rgb(${lerp(184, 92, dk)},${lerp(145, 66, dk)},${lerp(63, 28, dk)})`; c.fill();
      c.lineWidth = 1.2; c.strokeStyle = INKC; c.stroke();
      if (p.i % 2 === 0) inkLine([[lerp(p.pts[0][0], p.pts[1][0], .5), lerp(p.pts[0][1], p.pts[1][1], .5)], [lerp(p.pts[3][0], p.pts[2][0], .5), lerp(p.pts[3][1], p.pts[2][1], .5)]], .8, INKC, .35 + .5 * dk);   // hachura
    } else {
      drawEye(p.x, p.y, p.k * S * (.75 + .35 * p.face), p.ang, p.open * (p.face > .25 ? 1 : .6), p.look, p.face, p.id, pass);
    }
  }
}
// raios de glória gravados atrás das rodas
function rays(cx, cy, r0, r1, n, t, a = .55) { for (let i = 0; i < n; i++) { const an = i / n * 6.283 + t * .05, w = i % 2 ? .7 : 1.4; inkLine([[cx + Math.cos(an) * r0, cy + Math.sin(an) * r0], [cx + Math.cos(an) * r1 * (i % 2 ? .82 : 1), cy + Math.sin(an) * r1 * (i % 2 ? .82 : 1)]], w, INKC, a); } }
function frameBorder() {   // moldura de página de grimório
  c.lineWidth = 2; c.strokeStyle = INKC; c.strokeRect(22, 22, 496, LWH - 44); c.lineWidth = .8; c.strokeRect(30, 30, 480, LWH - 60);
  [[30, 30], [510, 30], [30, LWH - 30], [510, LWH - 30]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 7, 0, 7); c.stroke(); });
}

/* ---------- CENAS ---------- */
function sceneRodas(t, d, pass, o) {
  if (pass === 'base') {
    paper(); frameBorder(); rays(LCX, LCY, 175, 262, 48, t);
    drawRodas(LCX, LCY, 1, t, 'base', { openAt: o.openAt });
  } else if (pass === 'lights') {
    const k = candle(t);
    return [{ x: 90, y: LWH - 40, r: 640 * k, col: `rgba(255,${190 * k | 0},120,.95)` }, { x: LCX, y: LCY, r: 260, col: 'rgba(255,220,150,.25)' }];
  } else if (pass === 'emissive') {
    c.save(); c.globalCompositeOperation = 'lighter';
    const g = c.createRadialGradient(LCX, LCY, 10, LCX, LCY, 220); g.addColorStop(0, `rgba(255,205,110,${.08 * candle(t)})`); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, 540, LWH);
    c.restore(); drawRodas(LCX, LCY, 1, t, 'emissive', { openAt: o.openAt });
  }
}
function sceneTexto(t, d, pass, o) {
  const k = (t - o.t0) / 3.0;
  if (pass === 'base') {
    paper(); frameBorder();
    fell('EZEQUIEL · I', LCX, 78, 40, '#6a1c12');
    inkLine([[150, 104], [390, 104]], 1.2);
    const L1 = ['e o seu aspeto era', 'como se estivesse', 'UMA RODA NO MEIO', 'DE OUTRA RODA', '', 'e os seus aros', 'estavam CHEIOS DE', 'OLHOS ao redor'];
    L1.forEach((s, i) => writeOn(s, 66, 150 + i * 42, 33, k * L1.length - i, i === 2 || i === 3 || i === 7 ? '#6a1c12' : INKC, '"IM Fell English", Georgia, serif'));
    // rodinha desenhada na margem
    c.save(); c.translate(430, 420); c.scale(.32, .32); c.translate(-LCX, -LCY); if (k > .5) drawRodas(LCX, LCY, 1, t, 'base', { slow: 1 }); c.restore();
    fell('Ez 1,16-18', 440, LWH - 60, 18, INKC, 'center', '"IM Fell English", Georgia, serif');
  } else if (pass === 'lights') {
    const kk = candle(t); return [{ x: 470, y: 80, r: 620 * kk, col: `rgba(255,${200 * kk | 0},130,.95)` }];
  }
}
// "andavam para os quatro lados sem se virar"
const DIR = t => { const s = [[0, 0], [-1, 0], [0, -1], [1, 0], [0, 1], [0, 0]], tt = Math.max(0, t) * 1.25, i = Math.min(s.length - 2, Math.floor(tt)), k = E.io(Math.min(1, (tt - i) * 1.6)); return [lerp(s[i][0], s[i + 1][0], k) * 120, lerp(s[i][1], s[i + 1][1], k) * 120, (tt - i) * 1.6 < 1 ? 1 : 0]; };
function sceneQuatro(t, d, pass, o) {
  const [dx, dy, mv] = DIR(t - o.t0);
  if (pass === 'base') {
    paper(); frameBorder();
    // rosa dos ventos gravada
    for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283, r = i % 4 ? 120 : 240; inkLine([[LCX, LCY], [LCX + Math.cos(a) * r, LCY + Math.sin(a) * r]], i % 4 ? .6 : 1.2, INKC, .5); }
    c.lineWidth = 1; c.strokeStyle = INKC; c.globalAlpha = .5; c.beginPath(); c.arc(LCX, LCY, 228, 0, 7); c.stroke(); c.globalAlpha = 1;
    ['N', 'L', 'S', 'O'].forEach((s, i) => { const a = -Math.PI / 2 + i * Math.PI / 2; fell(s, LCX + Math.cos(a) * 252, LCY + Math.sin(a) * 252, 26); });
    // rastro de movimento (as rodas não giram para mudar de direção)
    if (mv) for (let g = 3; g >= 1; g--) { c.save(); c.globalAlpha = .12 * (4 - g); const [px, py] = DIR(t - o.t0 - g * .05); c.translate(px, py); c.translate(LCX, LCY); c.scale(.62, .62); c.translate(-LCX, -LCY); drawRodas(LCX, LCY, 1, t, 'base', {}); c.restore(); }
    c.save(); c.translate(dx, dy); c.translate(LCX, LCY); c.scale(.62, .62); c.translate(-LCX, -LCY); drawRodas(LCX, LCY, 1, t, 'base', {}); c.restore();
  } else if (pass === 'lights') {
    const k = candle(t); return [{ x: 60, y: 520, r: 640 * k, col: `rgba(255,${190 * k | 0},120,.95)` }, { x: LCX + dx, y: LCY + dy, r: 200, col: 'rgba(255,215,140,.4)' }];
  } else if (pass === 'emissive') {
    c.save(); c.translate(dx, dy); c.translate(LCX, LCY); c.scale(.62, .62); c.translate(-LCX, -LCY); drawRodas(LCX, LCY, 1, t, 'emissive', {}); c.restore();
  }
}
// a escada das 9 ordens: a câmera sobe do 9º ao 3º, que acende em ouro
const ORDENS = ['SERAFINS', 'QUERUBINS', 'TRONOS', 'DOMINAÇÕES', 'VIRTUDES', 'POTESTADES', 'PRINCIPADOS', 'ARCANJOS', 'ANJOS'];
const stepY = i => 120 + i * 210;    // i = 0 (1º, Serafins) … 8 (9º, Anjos)
function sceneEscada(t, d, pass, o) {
  const lit = Math.max(0, Math.min(1, (t - o.litAt) / .5));
  if (pass === 'base') {
    paper(-60, -200, 660, 2500);
    for (let i = 0; i < 9; i++) {
      const y = stepY(i), w = 250 - i * 6, me = i === 2;
      c.beginPath(); c.moveTo(LCX - w, y); c.lineTo(LCX + w, y); c.lineTo(LCX + w + 26, y + 70); c.lineTo(LCX - w - 26, y + 70); c.closePath();
      c.fillStyle = me ? `rgb(${lerp(186, 200, lit)},${lerp(170, 160, lit)},${lerp(132, 70, lit)})` : 'rgba(150,130,100,.55)'; c.fill(); c.lineWidth = 1.6; c.strokeStyle = INKC; c.stroke();
      for (let k = 0; k < 18; k++) inkLine([[LCX - w - 20 + k * (w * 2 + 40) / 18, y + 70], [LCX - w - 14 + k * (w * 2 + 40) / 18, y + 96]], .7, INKC, .5);   // sombra hachurada
      fell(`${i + 1}º · ${ORDENS[i]}`, LCX, y + 36, me ? 32 : 26, me ? '#5a1a0e' : INKC);
      if (i === 2 || i === 5) inkLine([[60, y - 44], [480, y - 44]], .8, '#6a1c12', .7);   // separa os 3 grupos (tríades)
    }
    fell('PSEUDO-DIONÍSIO · séc. V', LCX, stepY(8) + 150, 20, INKC, 'center', '"IM Fell English", Georgia, serif');
    rays(LCX, -40, 40, 260, 36, t, .45);   // a luz no topo
  } else if (pass === 'lights') {
    const k = candle(t); return [{ x: LCX, y: -60, r: 900, col: 'rgba(255,225,160,.9)' }, { x: 40, y: stepY(6), r: 700 * k, col: `rgba(255,${180 * k | 0},110,.8)` }, { x: LCX, y: stepY(2) + 35, r: 260 * lit + 1, col: 'rgba(255,215,120,.9)' }];
  } else if (pass === 'emissive' && lit > 0) {
    c.save(); c.globalCompositeOperation = 'lighter';
    const g = c.createRadialGradient(LCX, stepY(2) + 35, 10, LCX, stepY(2) + 35, 300); g.addColorStop(0, `rgba(255,200,90,${.45 * lit})`); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(-60, stepY(2) - 300, 660, 600);
    fell('3º DE 9', LCX, stepY(2) - 52, 40, `rgba(255,214,120,${lit})`, 'center', '"IM Fell English SC", Georgia, serif');
    c.restore();
  }
}
function sceneOlhos(t, d, pass, o) {
  const k = Math.max(0, Math.min(1, (t - o.stareAt) / .25));
  const look = k > 0 ? [0, 0] : [Math.sin(t * 6.1) * .9, Math.cos(t * 4.3) * .6];
  if (pass === 'base') { paper(); rays(LCX, LCY, 200, 330, 60, t, .5); drawRodas(LCX, LCY, 1.55, t * (k > 0 ? .3 : 1), 'base', { look }); }
  else if (pass === 'lights') { const kk = candle(t); return [{ x: LCX, y: LCY + 80, r: 520 * kk, col: `rgba(255,${190 * kk | 0},120,.95)` }]; }
  else if (pass === 'emissive') drawRodas(LCX, LCY, 1.55, t * (k > 0 ? .3 : 1), 'emissive', { look });
}
function sceneFim(t, d, pass, o) {
  if (pass === 'base') {
    paper(); frameBorder();
    c.save(); c.translate(LCX, 205); c.scale(.55, .55); c.translate(-LCX, -LCY); rays(LCX, LCY, 175, 262, 48, t); drawRodas(LCX, LCY, 1, t, 'base', {}); c.restore();
    fell('GRIMÓRIO  Nº 1', LCX, 380, 40, '#6a1c12');
    fell('OFANIM', LCX, 428, 34);
    fell('3º DE 9 · EZEQUIEL 1', LCX, 466, 22, INKC, 'center', '"IM Fell English", Georgia, serif');
    fell('SEGUE PRA COMPLETAR A ESCADA', LCX, 506, 17, '#6a1c12', 'center', '"IM Fell English SC", Georgia, serif');
  } else if (pass === 'lights') { const k = candle(t); return [{ x: LCX, y: 300, r: 560 * k, col: `rgba(255,${195 * k | 0},125,.95)` }]; }
  else if (pass === 'emissive') { c.save(); c.translate(LCX, 205); c.scale(.55, .55); c.translate(-LCX, -LCY); drawRodas(LCX, LCY, 1, t, 'emissive', {}); c.restore(); }
}
// clipe 3D (Blender) embutido: window.CLIPS = { A: [...], B: [...] } (12 quadros por segundo)
const CLIPIMG = {};
window.__clipsReady = new Promise(res => {
  const C = window.CLIPS || {}; const all = []; Object.keys(C).forEach(k => { CLIPIMG[k] = C[k].map(src => { const im = new Image(); all.push(new Promise(r2 => { im.onload = im.onerror = r2; })); im.src = src; return im; }); });
  Promise.all(all).then(res);
});
function sceneClip(t, d, pass, o) {
  if (pass !== 'base') return pass === 'lights' ? null : undefined;
  const fr = CLIPIMG[o.clip] || [], i = Math.max(0, Math.min(fr.length - 1, Math.floor((t - o.t0) * 12)));
  if (fr[i] && fr[i].complete && fr[i].naturalWidth) c.drawImage(fr[i], 0, 0, 540, LWH);
  else { c.fillStyle = '#140c06'; c.fillRect(0, 0, 540, LWH); drawRodas(LCX, LCY, 1, t, 'base', {}); }
}
// o livro aberto na mesa, com a vela
function sceneLivro(t, d, pass, o) {
  if (pass === 'base') {
    const g = c.createLinearGradient(0, 0, 0, LWH); g.addColorStop(0, '#120b07'); g.addColorStop(1, '#2a1a10'); c.fillStyle = g; c.fillRect(-60, -60, 660, LWH + 120);
    for (let i = 0; i < 26; i++) inkLine([[-60, 300 + i * 12 + Math.sin(i) * 4], [600, 290 + i * 13]], 1, 'rgba(0,0,0,.35)');   // veios da mesa
    // capa e páginas (perspectiva)
    c.fillStyle = '#3a160e'; c.beginPath(); c.moveTo(40, 470); c.lineTo(500, 470); c.lineTo(450, 170); c.lineTo(90, 170); c.closePath(); c.fill();
    const pg = (x0, x1, flip) => { c.save(); c.beginPath(); c.moveTo(x0, 455); c.quadraticCurveTo((x0 + x1) / 2, 440, x1, 462); c.lineTo(x1 - (flip ? -38 : 38) * 0 + (flip ? 10 : -10), 185); c.quadraticCurveTo((x0 + x1) / 2, 172, x0 + (flip ? -8 : 8), 180); c.closePath(); c.clip(); c.drawImage(TX.parch, x0 - 20, 170, x1 - x0 + 40, 300); c.restore(); };
    pg(62, 268, false); pg(272, 478, true);
    // gravura pequena na página esquerda, texto na direita
    c.save(); c.translate(165, 315); c.scale(.36, .36); c.translate(-LCX, -LCY); rays(LCX, LCY, 175, 262, 40, t); drawRodas(LCX, LCY, 1, t, 'base', { slow: 1 }); c.restore();
    fell('EZEQUIEL · I', 372, 215, 15, '#6a1c12');
    for (let i = 0; i < 9; i++) inkLine([[300, 245 + i * 21], [300 + 140 + h2(i, 3) * 20, 245 + i * 21]], 2.2, INKC, .55);
    const sp = c.createLinearGradient(240, 0, 300, 0); sp.addColorStop(0, 'rgba(0,0,0,0)'); sp.addColorStop(.5, 'rgba(0,0,0,.45)'); sp.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = sp; c.fillRect(240, 170, 60, 300);   // lombada
    // vela
    c.fillStyle = '#d9cbb0'; c.fillRect(470, 230, 38, 140); c.fillStyle = '#b9a988'; c.fillRect(470, 230, 10, 140);
    c.fillStyle = '#1b120c'; c.fillRect(486, 214, 3, 18);
  } else if (pass === 'lights') {
    const k = candle(t); return [{ x: 488, y: 200, r: 560 * k, col: `rgba(255,${185 * k | 0},110,1)` }];
  } else if (pass === 'emissive') {
    const k = candle(t); c.save(); c.globalCompositeOperation = 'lighter';
    const fx = 487 + Math.sin(t * 9) * 1.5, g = c.createRadialGradient(fx, 196, 2, fx, 196, 26 * k); g.addColorStop(0, 'rgba(255,240,200,1)'); g.addColorStop(.4, 'rgba(255,170,60,.8)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.beginPath(); c.ellipse(fx, 196, 9 * k, 24 * k, 0, 0, 7); c.fill(); c.restore();
  }
}
const SCENES = { clip: sceneClip, livro: sceneLivro, rodas: sceneRodas, texto: sceneTexto, quatro: sceneQuatro, escada: sceneEscada, olhos: sceneOlhos, fim: sceneFim };

const [DOF, dofx] = mk(1, 1), [MSK, mskx] = mk(1, 1);
function realPaper(t, o) {
  if (DOF.width !== W) { DOF.width = W; DOF.height = H; MSK.width = W; MSK.height = H; }
  const x0 = WIN.x * R, y0 = WIN.y * R, w = WIN.w * R, h = WIN.h * R;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  // curvatura da página: escurece de um lado (lombada) e brilha no meio
  const side = o.spine === 'r' ? 1 : 0, g = c.createLinearGradient(x0, 0, x0 + w, 0);
  g.addColorStop(side ? 0 : 1, 'rgba(0,0,0,0)'); g.addColorStop(.62, 'rgba(0,0,0,0)'); g.addColorStop(side, 'rgba(0,0,0,.5)');
  c.globalCompositeOperation = 'multiply'; c.fillStyle = g; c.fillRect(x0, y0, w, h);
  // profundidade de campo: as bordas desfocam
  dofx.setTransform(1, 0, 0, 1, 0, 0); dofx.clearRect(0, 0, W, H); dofx.filter = `blur(${5 * R}px)`; dofx.drawImage(c.canvas, x0, y0, w, h, x0, y0, w, h); dofx.filter = 'none';
  dofx.globalCompositeOperation = 'destination-in'; const rg = dofx.createRadialGradient(x0 + w * (o.fx || .5), y0 + h * (o.fy || .5), w * .22, x0 + w * (o.fx || .5), y0 + h * (o.fy || .5), w * .78);
  rg.addColorStop(0, 'rgba(0,0,0,0)'); rg.addColorStop(1, 'rgba(0,0,0,1)'); dofx.fillStyle = rg; dofx.fillRect(x0, y0, w, h); dofx.globalCompositeOperation = 'source-over';
  c.globalCompositeOperation = 'source-over'; c.drawImage(DOF, 0, 0);
  // a chama da vela fora de foco, num canto, em primeiro plano
  const k = candle(t), bx = x0 + w * (o.flame === 'l' ? .06 : .94), by = y0 + h * .9, fb = c.createRadialGradient(bx, by, 4, bx, by, 150 * R * k);
  fb.addColorStop(0, 'rgba(255,226,170,.85)'); fb.addColorStop(.25, 'rgba(255,150,60,.45)'); fb.addColorStop(1, 'rgba(0,0,0,0)');
  c.globalCompositeOperation = 'lighter'; c.fillStyle = fb; c.fillRect(x0, y0, w, h);
  // poeira flutuando na luz
  for (let i = 0; i < 26; i++) { const px = x0 + ((h2(i, 1) * w + t * 9 * (h2(i, 2) - .3) * R) % w + w) % w, py = y0 + ((h2(i, 3) * h - t * 6 * h2(i, 4) * R) % h + h) % h, a = .25 + .5 * h2(i, 5);
    c.fillStyle = `rgba(255,225,170,${a * (.6 + .4 * Math.sin(t * 2 + i))})`; c.beginPath(); c.arc(px, py, (.8 + 1.6 * h2(i, 6)) * R, 0, 7); c.fill(); }
  c.restore();
}

/* ---------- PLANOS ---------- */
const GLIMPSE = () => false;
const S = (a, b, env, cam, o = {}) => ({ a: sec(a), b: sec(b), env, cam, o });
const SHOTS = [
  S(0, 3.0, 'clip', [1, LCX, LCY, 1, LCX, LCY], { clip: 'A', t0: 0, flat: 1, hand: 0 }),
  S(3.0, 4.6, 'livro', [1.0, LCX, LCY, 1.12, 280, 300], { hand: .7 }),
  S(4.6, 6.6, 'texto', [1.05, LCX, LCY, 1.12, LCX - 10, LCY], { hand: .6, t0: 4.5, real: 1, spine: 'l', flame: 'r' }),
  S(6.6, 8.4, 'texto', [1.7, 220, 380, 1.85, 230, 385], { hand: .8, t0: 4.5, real: 1, spine: 'l', flame: 'r', fy: .55 }),
  S(8.4, 10.4, 'quatro', [1.0, LCX, LCY, 1.05, LCX, LCY], { hand: .6, t0: 8.5, real: 1, spine: 'r', flame: 'l' }),
  S(10.4, 12.2, 'quatro', [1.3, LCX, LCY, 1.4, LCX, LCY], { hand: .7, t0: 8.5, real: 1, spine: 'r', flame: 'l' }),
  S(12.2, 14.2, 'escada', [1.1, LCX, stepY(8) + 40, 1.1, LCX, stepY(6) + 30], { hand: .5, litAt: 15.9, real: 1, spine: 'l', flame: 'r' }),
  S(14.2, 16.4, 'escada', [1.1, LCX, stepY(5) + 30, 1.1, LCX, stepY(2) + 30], { hand: .5, litAt: 15.9, real: 1, spine: 'l', flame: 'r' }),
  S(16.4, 18.2, 'escada', [1.5, LCX, stepY(2) - 10, 1.3, LCX, stepY(0) + 80], { hand: .6, litAt: 15.9, real: 1, spine: 'l', flame: 'r' }),
  S(18.2, 22.2, 'clip', [1, LCX, LCY, 1, LCX, LCY], { clip: 'B', t0: 18.2, flat: 1, hand: 0 }),
  S(22.2, 24.75, 'fim', [1.0, LCX, LCY, 1.05, LCX, LCY], { hand: .4, real: 1, spine: 'l', flame: 'r' }),
  S(24.75, 25, 'clip', [1, LCX, LCY, 1, LCX, LCY], { clip: 'A', t0: 0, flat: 1, hand: 0, loop: 1 }),
];
const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
const isSmear = () => false;
const T = { shake: () => 0 };
function shake(t, amp) { return [Math.sin(t * 1.3) * amp + Math.sin(t * 3.1) * amp * .4, Math.cos(t * 1.1) * amp * .7 + Math.sin(t * 2.6) * amp * .3, Math.sin(t * .9) * amp * .0015]; }

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
  setC(); SC(t, d, 'base', o);
  if (!o.flat) {
    setC(); const lights = SC(t, d, 'lights', o) || [];
    applyLights(lights, 'rgb(96,80,64)');
    setC(); c.globalCompositeOperation = 'source-over'; SC(t, d, 'emissive', o);
  }
  if (o.real) realPaper(t, o);
  c.restore();
}
