/* ============================================================
   ONZE ANOS: a Dona Célia, o olho mágico do 44 e os dois rostos
   (usa drawPessoa / MATEUS de quem.js, colado antes deste arquivo)
   ============================================================ */
const sat = x => Math.max(0, Math.min(1, x));
const CSKIN = '#dcc2ad', CSKINSH = '#b89c86';
// o olho dela salta de um ponto pro outro (sacadas), nunca fica parado
const SACC = [[0, -16, -4], [.32, 20, 2], [.7, -6, -8], [1.05, 26, 4], [1.4, -22, 0], [1.72, 8, 6], [2.05, -12, -6], [2.4, 18, 0]];
function saccade(t) {
  const tt = t % 2.6; let a = SACC[0];
  for (const s of SACC) if (tt >= s[0]) a = s;
  const i = SACC.indexOf(a), b = SACC[(i + 1) % SACC.length], k = sat((tt - a[0]) / .06);
  const p = i === SACC.length - 1 ? a : SACC[i - 1] || SACC[SACC.length - 1];
  return [lerp(p[1], a[1], E.o(k)), lerp(p[2], a[2], E.o(k))];
}
// close do olho dela, visto do corredor através da lente; o.leave: o olho sai da lente; o.back: um olho volta
function drawOlhoC(d, f, o, pass) {
  const t = d / FPS;
  let eyeK = 1, scl = 1;
  if (o.leave != null) {
    const kOut = sat((t - o.leave) / .55), kIn = o.back != null ? sat((t - o.back) / .45) : 0;
    eyeK = kIn > 0 ? E.o(kIn) : 1 - E.i(kOut); scl = kIn > 0 ? lerp(.55, 1, E.o(kIn)) : lerp(1, .55, E.i(kOut));
  }
  const blink = (t % 3.1 > 2.92) ? 1 : 0;
  const [sx, sy] = saccade(t + (o.leave != null ? 1.1 : 0));
  if (pass === 'base') {
    rect(-140, -160, 820, 730, WOOD); woodGrain(-60, -80, 660, 560, 900, 20);
    cel(circ(270, 200, 178, 178, 40), BRASS, BRASSSH, 1, { lw: 4, sh: 12 });
    cel(circ(270, 200, 146, 146, 36), '#3a3a30', null, 2, { lw: 3.4 });
    cel(circ(270, 200, 128, 128, 36), '#081009', null, 3, { lw: 3 });
    if (eyeK > .02) {
      c.save(); c.beginPath(); c.arc(270, 200, 127, 0, 7); c.clip(); c.globalAlpha = eyeK;
      c.translate(270, 204); c.scale(scl, scl); c.translate(-270, -204);
      const open = 1 - blink, ry = 70 * open;
      cel(circ(270, 214, 150, 120, 30), CSKIN, CSKINSH, 4, { lw: 2.6 });                         // pele em volta
      for (let i = 0; i < 6; i++) stroke([[150 + i * 6, 150 - i * 9], [270, 126 - i * 11], [390 - i * 6, 150 - i * 9]], 1.6, 40 + i, 'rgba(90,60,45,.55)', .4);   // rugas da pálpebra
      for (let i = 0; i < 4; i++) stroke([[372 + i * 6, 214 + i * 10], [418 + i * 10, 200 + i * 16]], 1.4, 50 + i, 'rgba(90,60,45,.45)', .4);   // pés de galinha
      if (open > 0) {
        cel(circ(270, 210, 112, Math.max(2, ry), 26), '#e4e2d4', '#b9b6a3', 5, { lw: 2.6 });
        c.save(); c.beginPath(); c.ellipse(270, 210, 111, Math.max(1, ry - 1), 0, 0, 7); c.clip();
        for (let i = 0; i < 6; i++) stroke([[170 + h2(i, 1) * 30, 200 + h2(i, 2) * 30], [205 + h2(i, 3) * 20, 205 + h2(i, 4) * 10]], 1, 60 + i, 'rgba(170,60,60,.5)', .6);   // veinhas
        const ix = 270 + sx * 1.6, iy = 210 + sy;
        cel(circ(ix, iy, 46, 46, 20), o.iris || '#6d726a', '#555a52', 6, { lw: 2 });
        for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283; stroke([[ix + Math.cos(a) * 18, iy + Math.sin(a) * 18], [ix + Math.cos(a) * 42, iy + Math.sin(a) * 42]], 1, 70 + i, 'rgba(40,44,38,.45)', .3); }
        c.fillStyle = '#050605'; c.beginPath(); c.arc(ix, iy, 16 + knockAmp(d) * 6, 0, 7); c.fill();
        c.restore();
      }
      stroke([[158, 210], [270, 210 - ry - 6], [382, 210]], 4, 80);                                  // borda da pálpebra
      for (let i = 0; i < 12; i++) { const x = 180 + i * 16, y = 210 - (ry + 6) * Math.sin((x - 158) / 224 * Math.PI); stroke([[x, y], [x - 3, y - 12 * (open ? 1 : .4)]], 1.6, 90 + i); }   // cílios
      c.restore();
    }
  } else if (pass === 'light') {
    const gr = c.createRadialGradient(120, 20, 10, 120, 20, 560); gr.addColorStop(0, 'rgba(255,236,190,.4)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = gr; c.fillRect(-140, -160, 820, 730);
  } else if (pass === 'glow') {
    c.save(); c.globalCompositeOperation = 'lighter';
    if (eyeK < .9) { const gr = c.createRadialGradient(270, 200, 6, 270, 200, 130); gr.addColorStop(0, `rgba(110,255,150,${.55 * (1 - eyeK)})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gr; c.beginPath(); c.arc(270, 200, 128, 0, 7); c.fill(); }
    if (eyeK > .5 && !blink) { const [sx2, sy2] = [270 + sx * 1.6 - 14, 210 + sy - 14]; c.fillStyle = 'rgba(255,255,255,.85)'; c.beginPath(); c.ellipse(sx2, sy2, 7, 4.5, -.5, 0, 7); c.fill(); }   // brilho molhado
    c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(222, 140, 30, 12, -.6, 0, 7); c.fill();   // reflexo do vidro
    c.restore();
  }
}
// o que ela vê pela lente: o corredor em olho de peixe, o marido e o Mateus
const PAN = track([[0, -150], [sec(6.3), -110], [sec(8.2), 0], [sec(13.0), 0], [sec(13.25), 150, 'o'], [sec(13.9), 150], [sec(14.1), -150, 'o'], [sec(14.6), -150], [sec(14.75), 150, 'o'], [sec(15.1), 150], [sec(15.22), -150, 'o'], [sec(15.5), -150], [sec(15.6), 150, 'o'], [sec(16.0), 150], [L, 150]]);
const HUSB_X = -.3, MAT_X = .3;
function rostoDe(d) {   // quanto cada rosto está apagado (0 = rosto inteiro)
  const t = d / FPS, p = PAN(d);
  if (t < 13.0) return { h: 0, m: t < 8.2 ? 1 : lerp(.85, 1, sat((t - 9.6) / 3)) };
  const k = sat((p + 150) / 300);          // 0 olhando o marido, 1 olhando o Mateus
  return { h: E.io(k), m: 1 - E.io(k) };
}
function celiaExtra(d, pass) {
  if (pass !== 'base') return;
  const t = d / FPS, r = rostoDe(d);
  const breathe = Math.sin(t * 2.2) * .006;
  drawPessoa(HUSB_X, 1.12 + breathe, { coat: '#1c1d19', coatSh: '#131410', skin: '#a9a99a', skinSh: '#8a8a7c', hair: '#9a9a90', legs: '#1c1d19', hat: true, alpha: .78, ghost: true, h: .98, erase: r.h }, 230);
  if (t >= 8.2) drawPessoa(MAT_X, 1.16 - breathe, Object.assign({}, MATEUS, { alpha: .72, ghost: true, erase: r.m, knock: t < 8.7 ? .6 : 0 }), 260);
}
function drawLente(d, f, o, pass) {
  const t = d / FPS, R0 = 196;
  if (pass === 'base') rect(-140, -160, 820, 730, '#090807');
  c.save(); c.beginPath(); c.arc(270, 200, R0, 0, 7); c.clip();
  // olho de peixe "falso": o centro maior que as bordas (duas camadas de escala)
  c.translate(270, 200); c.scale(1.28, 1.28); c.translate(-270 - PAN(d) * .55, -200 + 6);
  drawCorredor(d, f, { extra: celiaExtra, cine: 1 }, pass);
  c.restore();
  if (pass === 'base') {
    // borda escura da lente + vinheta
    const gr = c.createRadialGradient(270, 200, R0 * .55, 270, 200, R0); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.85)');
    c.fillStyle = gr; c.beginPath(); c.arc(270, 200, R0, 0, 7); c.fill();
    c.lineWidth = 10; c.strokeStyle = '#000'; c.beginPath(); c.arc(270, 200, R0, 0, 7); c.stroke();
  } else if (pass === 'glow') {
    c.save(); c.globalCompositeOperation = 'lighter';
    c.fillStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.ellipse(200, 110, 70, 24, -.6, 0, 7); c.fill();
    // borrão de movimento nos giros rápidos
    const v = Math.abs(PAN(d) - PAN(Math.max(0, d - 1)));
    if (v > 20) { c.globalAlpha = Math.min(.5, v / 300); c.fillStyle = 'rgba(160,255,190,.25)'; for (let i = 0; i < 9; i++) c.fillRect(80, 60 + i * 34 + (f % 3) * 4, 380, 3); }
    c.restore();
  }
}
// a porta dela por dentro: corrente, poeira, as três batidas
function drawDentro(d, f, o, pass) {
  const ka = knockAmp(d), sh = ka * 6;
  if (pass === 'base') {
    rect(-140, -160, 820, 730, '#3a2f26');
    for (let i = 0; i < 18; i++) stroke([[-140 + i * 50, -160], [-140 + i * 50, 570]], 1, 300 + i, 'rgba(70,55,40,.35)', .3);   // papel de parede
    c.save(); c.translate(270, 210); c.scale(1 + ka * .02, 1 + ka * .02); c.translate(-270 + sh * (f % 2 ? 1 : -1), -210);
    cel(box(110, -40, 320, 520, 4), WOOD, WOODSH, 1, { lw: 3.6, sh: 10 }); woodGrain(120, -30, 300, 500, 700, 16);
    cel(box(140, 10, 260, 170, 6), '#76614c', '#5e4d3c', 2, { lw: 2.6 }); cel(box(140, 220, 260, 220, 6), '#76614c', '#5e4d3c', 3, { lw: 2.6 });
    cel(circ(270, 60, 12, 12, 10), BRASS, BRASSSH, 4, { lw: 2.4 }); c.fillStyle = '#071008'; c.beginPath(); c.arc(270, 60, 6, 0, 7); c.fill();   // olho mágico
    // trinco + corrente balançando
    cel(box(392, 120, 26, 54, 3), BRASS, BRASSSH, 5, { lw: 2.2 }); cel(box(470, 122, 50, 18, 3), BRASS, BRASSSH, 6, { lw: 2.2 });
    const sw = Math.sin(d * .7) * 4 + ka * 22 * Math.sin(d * 2.5);
    for (let i = 0; i < 9; i++) { const k = i / 8, x = lerp(404, 480, k), y = 146 + Math.sin(k * Math.PI) * (30 + sw); cel(circ(x, y, 7, 4.5, 8, k * 3 + i), '#c8ad6a', '#8f7a45', 10 + i, { lw: 1.6 }); }
    cel(box(330, 230, 60, 22, 10), '#c8ad6a', '#8f7a45', 20, { lw: 2.4, sh: 4 });   // maçaneta
    c.restore();
    // poeira caindo do batente a cada batida
    KF.forEach((k, j) => { const x = (d - k) / FPS; if (x < 0 || x > 1.4) return; for (let i = 0; i < 14; i++) { const px = 130 + h2(j, i) * 280, py = -40 + x * x * 260 * (.6 + h2(i, j + 9)) + h2(i, 3) * 20; c.fillStyle = `rgba(200,190,160,${.5 * (1 - x / 1.4)})`; c.fillRect(px, py, 2, 2); } });
  } else if (pass === 'light') {
    const gr = c.createRadialGradient(-60, 260, 10, -60, 260, 520); gr.addColorStop(0, 'rgba(255,200,130,.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)');   // abajur da sala
    c.fillStyle = gr; c.fillRect(-140, -160, 820, 730);
  } else if (pass === 'glow') {
    c.save(); c.globalCompositeOperation = 'lighter';
    const g = .5 + 1.4 * ka; c.fillStyle = `rgba(110,255,150,${Math.min(1, g)})`; c.fillRect(120, 476, 300, 5);   // fresta verde embaixo da porta
    const gr = c.createLinearGradient(0, 480, 0, 600); gr.addColorStop(0, `rgba(80,230,130,${.35 * g})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gr; c.fillRect(60, 480, 420, 120);
    c.fillStyle = `rgba(120,255,160,${.6 + ka})`; c.beginPath(); c.arc(270, 60, 3, 0, 7); c.fill();
    c.restore();
  }
}
// a mão dela na corrente: treme, a corrente escorrega no trilho... e para
const SLIDE = track([[0, 0], [sec(16.4), 0], [sec(17.4), .35, 'io'], [sec(17.7), .33], [sec(18.3), .62, 'io'], [sec(18.6), .6], [L, .6]]);
function drawMao2(d, f, o, pass) {
  const t = d / FPS, tr = Math.sin(d * 1.9) * 1.6 + Math.sin(d * 3.7) * 1.1, s = SLIDE(d);
  if (pass === 'base') {
    rect(-140, -160, 820, 730, WOOD); woodGrain(-60, -80, 660, 560, 760, 20);
    cel(box(60, 150, 440, 60, 8), BRASS, BRASSSH, 1, { lw: 3.2, sh: 8 });          // trilho
    cel(box(78, 172, 410, 14, 6), '#2a2418', null, 2, { lw: 2 });
    const kx = lerp(120, 400, s);                                                    // o pino da corrente no trilho
    cel(circ(kx, 179, 16, 16, 10), '#c8ad6a', '#8f7a45', 3, { lw: 2.4 });
    for (let i = 0; i < 8; i++) { const k = i / 7, x = lerp(kx, -60, k), y = 179 + Math.sin(k * Math.PI) * 70 + tr * k; cel(circ(x, y, 17, 11, 10, k * 3 + i), '#c8ad6a', '#8f7a45', 10 + i, { lw: 2 }); }
    // a mão (velha, aliança no dedo) segurando o pino
    c.save(); c.translate(kx + tr, 186 + tr * .6);
    cel(dense([[-30, 10], [-10, -36], [40, -40], [70, -10], [80, 60], [60, 160], [-10, 170], [-40, 80]], 8), CSKIN, CSKINSH, 30, { lw: 3, sh: 8 });
    for (let i = 0; i < 4; i++) cel(dense([[-6 + i * 20, -30], [4 + i * 20, -62 + Math.abs(i - 1.5) * 6], [16 + i * 20, -58 + Math.abs(i - 1.5) * 6], [14 + i * 20, -26]], 4), CSKIN, CSKINSH, 31 + i, { lw: 2.4 });
    cel(box(20, -52, 20, 9, 3), '#d8b860', '#9c8040', 36, { lw: 1.8 });            // aliança
    for (let i = 0; i < 5; i++) stroke([[-20 + i * 8, 40 + i * 14], [60 - i * 4, 30 + i * 16]], 1.2, 40 + i, 'rgba(90,60,45,.45)', .5);   // pele fina
    for (let i = 0; i < 3; i++) stroke([[0 + i * 16, 60], [10 + i * 18, 130]], 2, 50 + i, 'rgba(90,110,150,.35)', .5);   // veias
    c.restore();
  } else if (pass === 'light') {
    const gr = c.createRadialGradient(-40, 300, 10, -40, 300, 560); gr.addColorStop(0, 'rgba(255,200,130,.5)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = gr; c.fillRect(-140, -160, 820, 730);
  } else if (pass === 'glow') {
    c.save(); c.globalCompositeOperation = 'lighter';
    const gap = sat((s - .3) / .3); if (gap > 0) { c.fillStyle = `rgba(110,255,150,${.25 + .5 * gap})`; c.fillRect(520 - gap * 12, -160, 6 + gap * 10, 730); }   // a fresta da porta clareando
    c.restore();
  }
}
// o retrato do marido: o polegar dela gasta o rosto
function drawRetrato(d, f, o, pass) {
  const t = d / FPS, rub = Math.sin(t * 9), fade = sat((t - 19.7) / 1.7);
  if (pass === 'base') {
    rect(-140, -160, 820, 730, '#463a2e');
    for (let i = 0; i < 16; i++) for (let j = 0; j < 12; j++) { c.fillStyle = 'rgba(90,70,50,.35)'; c.beginPath(); c.arc(-120 + i * 52 + (j % 2) * 26, -140 + j * 52, 5, 0, 7); c.fill(); }   // papel de parede florido
    cel(box(150, 10, 240, 310, 6), '#2a1f16', '#1d150e', 1, { lw: 3.4, sh: 10 });   // moldura
    cel(box(172, 32, 196, 266, 3), '#b9ad94', '#9c917a', 2, { lw: 2.4 });
    // o homem da foto: terno, chapéu
    cel(dense([[196, 298], [214, 220], [326, 220], [344, 298]], 6), '#3b3a34', null, 3, { lw: 2.4 });
    cel(circ(270, 160, 42, 50, 16), '#c9bfa8', '#a99f88', 4, { lw: 2.4 });
    cel(dense([[214, 128], [326, 128], [306, 96], [234, 96]], 4), '#2c2b26', null, 5, { lw: 2.2 }); cel(box(206, 124, 128, 12, 4), '#2c2b26', null, 6, { lw: 2 });
    c.save(); c.globalAlpha = 1 - fade;
    [-1, 1].forEach((sd, i) => { c.fillStyle = '#2a2620'; c.beginPath(); c.ellipse(270 + sd * 16, 160, 4, 6, 0, 0, 7); c.fill(); });
    stroke([[256, 188], [270, 186], [284, 188]], 2.2, 7); stroke([[270, 162], [266, 176], [272, 178]], 1.6, 8);
    c.restore();
    // a mancha clara de tantos anos passando o dedo
    const gr = c.createRadialGradient(270, 165, 4, 270, 165, 48); gr.addColorStop(0, `rgba(230,224,206,${.35 + .6 * fade})`); gr.addColorStop(1, 'rgba(230,224,206,0)'); c.fillStyle = gr; c.beginPath(); c.arc(270, 165, 50, 0, 7); c.fill();
    // o polegar esfregando
    c.save(); c.translate(272 + rub * 22, 176 + Math.cos(t * 9) * 4); c.rotate(-.5);
    cel(dense([[-22, -10], [18, -16], [34, 4], [30, 90], [-30, 110], [-40, 30]], 8), CSKIN, CSKINSH, 20, { lw: 3, sh: 6 });
    cel(circ(4, -6, 14, 10, 10), '#e8d4c4', null, 21, { lw: 1.6 });                // unha
    c.restore();
  } else if (pass === 'light') {
    const gr = c.createRadialGradient(60, 0, 10, 60, 0, 520); gr.addColorStop(0, 'rgba(255,205,140,.5)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = gr; c.fillRect(-140, -160, 820, 730);
  }
}
ENVS.olhoC = drawOlhoC; ENVS.lente = drawLente; ENVS.dentro = drawDentro; ENVS.mao2 = drawMao2; ENVS.retrato = drawRetrato;
