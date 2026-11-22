/* ============================================================
   QUEM OLHA POR VOCÊ: o Mateus, a vizinha, o marido, os olhos mágicos
   ============================================================ */
const MSKIN = '#cdb8a6', MSKINSH = '#a8907d', HOOD = '#3c4a5c', HOODSH = '#2b3646';
// pessoa comum, em cartoon (cabeça grande, corpo simples); coordenadas do mundo do corredor
function drawPessoa(X, Z, p, id) {
  const k = FYp / Z, [ox, oy] = P3(X, 0, Z), S = (x, y) => [ox + x * k, oy + y * k];
  const h = p.h || 1, walk = p.walk || 0, back = !!p.back;
  c.save(); if (p.alpha != null) c.globalAlpha = p.alpha;
  if (p.ghost) c.translate((h2(SEED, id) - .5) * 3, 0);
  const hipY = -.36 * h + Math.abs(Math.sin(walk)) * .006, shY = hipY - .27 * h;
  [-1, 1].forEach((sd, i) => {
    const sw = Math.sin(walk) * sd;
    cel(limb([S(sd * .03, hipY), S(sd * .033 + sw * .02, hipY * .5), S(sd * .035 + sw * .04, -.006)], [.032 * k, .028 * k, .024 * k]), p.legs || '#2d3340', null, id + i, { lw: 2.2 });
    cel(circ(...S(sd * .035 + sw * .04 + sd * .012, -.006), .022 * k, .009 * k, 8), p.feet || '#1b1b18', null, id + 2 + i, { lw: 1.6 });
  });
  if (p.dress) cel(dense([S(-.075, shY), S(.075, shY), S(.1, hipY + .1), S(-.1, hipY + .1)], 4), p.coat, p.coatSh, id + 4, { lw: 2.4 });
  else cel(dense([S(-.075, shY), S(.075, shY), S(.06, hipY + .03), S(-.06, hipY + .03)], 4), p.coat, p.coatSh, id + 4, { lw: 2.4 });
  [-1, 1].forEach((sd, i) => {
    const sw = -Math.sin(walk) * sd * .04, up = p.knock && sd === 1 ? p.knock : 0;
    const sh = S(sd * .07, shY + .015), el = S(sd * (.09 - .03 * up) + sw, shY + .14 - .1 * up), wr = S(sd * (.085 - .05 * up) + sw * 1.4, shY + .27 - .26 * up);
    cel(limb([sh, el, wr], [.028 * k, .024 * k, .02 * k]), p.coat, p.coatSh, id + 6 + i, { lw: 2.2 });
    cel(circ(wr[0], wr[1] + .01 * k, .016 * k, .016 * k, 8), p.skin, null, id + 8 + i, { lw: 1.6 });
  });
  if (p.hat) cel(dense([S(-.07, shY - .14), S(.07, shY - .14), S(.05, shY - .2), S(-.05, shY - .2)], 3), '#1d1c18', null, id + 10, { lw: 2 });
  const hc = S(0, shY - .075), hr = .058 * k;
  cel(limb([S(0, shY + .01), [hc[0], hc[1] + hr * .8]], [.022 * k, .022 * k]), p.skin, null, id + 11, { lw: 1.8 });
  cel(circ(hc[0], hc[1], hr, hr * 1.12, 16), back ? p.hair : p.skin, back ? null : p.skinSh, id + 12, { lw: 2.4 });
  if (!back) {
    cel(dense([[hc[0] - hr, hc[1] - hr * .1], [hc[0] - hr * .8, hc[1] - hr * 1.05], [hc[0] + hr * .8, hc[1] - hr * 1.05], [hc[0] + hr, hc[1] - hr * .1], [hc[0], hc[1] - hr * .55]], 3), p.hair, null, id + 13, { lw: 2 });
    const er = p.erase || 0;
    if (er < 1) {
      c.save(); c.globalAlpha *= 1 - er;
      [-1, 1].forEach(sd => { c.fillStyle = '#121310'; c.beginPath(); c.ellipse(hc[0] + sd * hr * .38, hc[1] + hr * .1 + er * 4, hr * .1, hr * .16, 0, 0, 7); c.fill(); });
      stroke([[hc[0] - hr * .25, hc[1] + hr * .6], [hc[0] + hr * .25, hc[1] + hr * .62]], 1.3, id + 14);
      c.restore();
    }
  }
  if (p.bun) cel(circ(hc[0], hc[1] - hr * 1.15, hr * .45, hr * .4, 10), p.hair, null, id + 15, { lw: 1.8 });
  if (p.hat) cel(dense([[hc[0] - hr * 1.3, hc[1] - hr * .7], [hc[0] + hr * 1.3, hc[1] - hr * .7], [hc[0] + hr * .8, hc[1] - hr * 1.6], [hc[0] - hr * .8, hc[1] - hr * 1.6]], 3), '#1d1c18', null, id + 16, { lw: 2 });
  c.restore();
}
const MATEUS = { coat: HOOD, coatSh: HOODSH, skin: MSKIN, skinSh: MSKINSH, hair: '#2a2119', legs: '#323a4a', feet: MSKIN };
// onde o Mateus está em cada momento (no mundo do corredor)
function mateusAt(d) {
  const t = d / FPS;
  if (t < 14) return { X: .02, Z: 2.0, alpha: .5 };
  if (t < 24) return { X: .62, Z: 1.62, alpha: .5, back: true };
  const k = Math.min(1, (t - 24) / 1.9);
  return { X: lerp(.32, 0, E.io(k)), Z: lerp(1.9, 2.42, E.io(k)), alpha: .5, back: true, walk: k < 1 ? t * 9 : 0, knock: Math.min(1, knockAmp(d) * 1.4) + (t > 25.6 && t < 27.6 ? .25 : 0), erase: 1 };
}
function quemExtra(d, pass) {
  if (pass !== 'base') return;
  const t = d / FPS;
  // a vizinha passa atravessando o Mateus (3–7 s)
  if (t >= 3 && t < 7.2) {
    const k = (t - 3) / 4.2;
    drawPessoa(lerp(-.95, .95, k), 2.0, { coat: '#6b4d52', coatSh: '#53393e', skin: '#d9b9a0', skinSh: '#b8957c', hair: '#3a2c22', legs: '#3b3030', dress: true, bun: true, walk: t * 8, h: .95 }, 200);
  }
  // o marido da Dona Célia, de chapéu, diante do 44 (14–24 s)
  if (t >= 14 && t < 24) drawPessoa(.8, 1.58, { coat: '#1c1d19', coatSh: '#131410', skin: '#9a9a8c', skinSh: '#7c7c70', hair: '#9a9a90', legs: '#1c1d19', back: true, hat: true, alpha: .62, ghost: true, h: .98 }, 230);
  const m = mateusAt(d);
  if (t < 32) drawPessoa(m.X, m.Z, Object.assign({}, MATEUS, { alpha: m.alpha * (bulbI(d) < .2 ? 1.6 : 1), ghost: true, back: m.back, walk: m.walk, knock: m.knock, erase: m.erase || 0 }), 260);
}
// olho mágico genérico: tampinha que abre/fecha, olho do outro lado com cor e "idade"
function drawOlhoV(d, f, o, pass) {
  const t = d / FPS;
  const flapClosed = o.flapClose ? E.io(Math.max(0, Math.min(1, (t - o.flapClose) / .25))) : o.flapOpen ? 1 - E.o(Math.max(0, Math.min(1, (t - o.flapOpen) / .3))) : 0;
  const eyeK = o.eyeIn != null ? E.o(Math.max(0, Math.min(1, (t - o.eyeIn) / .3))) : 1;
  const blink = o.blinkAt && t > o.blinkAt && t < o.blinkAt + .18 ? 1 : 0;
  if (pass === 'base') {
    rect(-140, -160, 820, 730, o.wood || WOOD); woodGrain(-60, -80, 660, 560, o.grain || 400, 20);
    if (o.num) txt(o.num, 270, 40, 60, 'Bungee, Impact, sans-serif', '#c8b98a', 'center', 4);
    cel(circ(270, 200, 92, 92, 28), BRASS, BRASSSH, 1, { lw: 3.4, sh: 8 });
    cel(circ(270, 200, 66, 66, 24), '#3a3a30', null, 2, { lw: 3 });
    cel(circ(270, 200, 50, 50, 24), '#0c120e', null, 3, { lw: 2.4 });
    if (eyeK > 0 && flapClosed < 1) {
      c.save(); c.beginPath(); c.arc(270, 200, 49, 0, 7); c.clip(); c.globalAlpha = eyeK;
      const open = (1 - blink) * eyeK;
      cel(circ(270, 202, 44, Math.max(1, 26 * open), 20), '#d8dccb', '#a9ae9b', 4, { lw: 2.4 });
      if (open > .2) {
        cel(circ(270 + Math.sin(d * .25) * 3, 202, 17, 17 * Math.min(1, open * 1.2), 16), o.iris || '#3d5a3f', null, 5, { lw: 1.8 });
        c.fillStyle = '#050605'; c.beginPath(); c.arc(270 + Math.sin(d * .25) * 3, 202, 6, 0, 7); c.fill();
      }
      if (o.old) for (let i = 0; i < 4; i++) stroke([[232, 178 - i * 5], [270, 170 - i * 6], [308, 178 - i * 5]], 1.2, 40 + i, 'rgba(60,40,30,.5)', .3);   // rugas
      for (let i = 0; i < 7; i++) stroke([[244 + i * 9, 202 - 26 * open], [242 + i * 9.5, 194 - 26 * open]], 1.4, 50 + i);   // cílios
      c.restore();
    }
    // tampinha de latão girando sobre a lente
    if (flapClosed > 0) {
      const a = (1 - flapClosed) * 1.7, px = 270, py = 128, vx = Math.sin(a) * 72, vy = Math.cos(a) * 72;
      cel(circ(px + vx, py + vy, 54, 54, 20), '#c8ad6a', '#8f7a45', 6, { lw: 3, sh: 6 });
      cel(circ(px, py, 7, 7, 8), '#8f7a45', null, 7, { lw: 1.8 });
    }
  } else if (pass === 'light') {
    const gr = c.createRadialGradient(110, 0, 10, 110, 0, 520); gr.addColorStop(0, 'rgba(255,236,190,.38)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = gr; c.fillRect(-140, -160, 820, 730);
  } else if (pass === 'glow') {
    c.save(); c.globalCompositeOperation = 'lighter';
    if (flapClosed < .9) { c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.ellipse(250, 182, 10, 5, -.6, 0, 7); c.fill(); }
    c.restore();
  }
}
// rosto do Mateus em close: some como se fosse apagado com borracha
function drawRosto(d, f, o, pass) {
  const t = d / FPS;
  const eyesE = o.erase ? Math.max(0, Math.min(1, (t - 19.6) / 1.6)) : 0, mouthE = o.erase ? Math.max(0, Math.min(1, (t - 21.8) / 1.4)) : 0;
  const cx = 270, cy = 215, rx = 118, ry = 150;
  if (pass === 'base') {
    rect(-140, -160, 820, 730, '#5f6259');
    cel(dense([[60, 520], [120, 380], [420, 380], [480, 520]], 10), HOOD, HOODSH, 1, { lw: 3.4 });            // capuz/ombros
    cel(limb([[cx, 400], [cx, 330]], [90, 86]), MSKIN, MSKINSH, 2, { lw: 3 });                                    // pescoço
    cel(circ(cx - rx, cy + 10, 22, 34, 10), MSKIN, MSKINSH, 3, { lw: 2.6 }); cel(circ(cx + rx, cy + 10, 22, 34, 10), MSKIN, MSKINSH, 4, { lw: 2.6 });
    cel(circ(cx, cy, rx, ry, 28).map(([x, y]) => (y > cy ? [cx + (x - cx) * (1 - .25 * (y - cy) / ry), y] : [x, y])), MSKIN, MSKINSH, 5, { lw: 3.6, sh: 10 });
    cel(dense([[cx - rx - 2, cy - 40], [cx - rx + 4, cy - ry + 34], [cx - 64, cy - ry - 8], [cx, cy - ry - 22], [cx + 64, cy - ry - 8], [cx + rx - 4, cy - ry + 34], [cx + rx + 2, cy - 40], [cx + 74, cy - 66], [cx + 46, cy - 98], [cx + 22, cy - 72], [cx - 8, cy - 104], [cx - 30, cy - 76], [cx - 62, cy - 96], [cx - 84, cy - 58]], 7), '#2a2119', null, 6, { lw: 3 });   // cabelo bagunçado com franja
    // sobrancelhas, olhos, nariz, boca (com olheiras de quem não dorme)
    c.save(); c.globalAlpha = 1 - eyesE;
    [-1, 1].forEach((sd, i) => {
      const ex = cx + sd * 46, ey = cy - 8 + eyesE * 30;
      stroke([[ex - 26, ey - 34 - sd * 2], [ex, ey - 40], [ex + 26, ey - 34 + sd * 2]], 5, 10 + i);
      cel(circ(ex, ey, 26, 18, 16), '#e9e6da', null, 12 + i, { lw: 2.6 });
      cel(circ(ex + 3, ey + 2, 11, 11, 12), '#5a3d2a', null, 14 + i, { lw: 1.6 });
      c.fillStyle = '#080706'; c.beginPath(); c.arc(ex + 3, ey + 2, 5, 0, 7); c.fill();
      stroke([[ex - 22, ey + 22], [ex, ey + 28], [ex + 22, ey + 22]], 2, 16 + i, 'rgba(60,40,40,.6)', .3);
    });
    c.restore();
    stroke([[cx - 4, cy + 10], [cx - 14, cy + 52], [cx + 8, cy + 56]], 2.6, 20);
    c.save(); c.globalAlpha = 1 - mouthE;
    stroke([[cx - 34, cy + 92 + mouthE * 16], [cx, cy + 86 + mouthE * 16], [cx + 34, cy + 94 + mouthE * 16]], 4, 22);
    c.restore();
    for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(40,30,25,.35)'; c.fillRect(cx - 60 + h2(i, 1) * 120, cy + 70 + h2(i, 2) * 60, 1.6, 1.6); }   // barba por fazer
    // a "borracha": riscos cor de pele por cima do que está sumindo
    const er = [[eyesE, cy - 8], [mouthE, cy + 90]];
    er.forEach(([e, y], j) => { if (e <= 0) return; for (let i = 0; i < Math.ceil(e * 10); i++) stroke([[cx - 90 + h2(j, i) * 30, y - 20 + i * 4], [cx + 90 - h2(j, i + 9) * 30, y - 16 + i * 4]], 7, 60 + j * 20 + i, MSKIN, .8); });
  } else if (pass === 'light') {
    const gr = c.createRadialGradient(560, 100, 10, 560, 100, 560); gr.addColorStop(0, 'rgba(160,255,190,.32)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = gr; c.fillRect(-140, -160, 820, 730);
  }
}
ENVS.olhoV = drawOlhoV; ENVS.rosto = drawRosto;
