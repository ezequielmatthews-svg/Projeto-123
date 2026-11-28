/* ============================================================
   CENSO 1991 · A PISADEIRA
   a fita da câmera do Valdir (recenseador), interior de Minas, junho de 1991
   (substitui as seções CURVAS E TEMPO → PLANOS do valenca.html)
   ============================================================ */
const KNOCKS = [];
const knockAmp = d => 0;
const sat = x => Math.max(0, Math.min(1, x));
const dn = (P, step = 8) => { const o = []; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length], n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / step)); for (let k = 0; k < n; k++) o.push([lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)]); } return o; };
const glow = (x, y, r, col) => { const rg = c.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, col); rg.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = rg; c.fillRect(x - r, y - r, r * 2, r * 2); };
const litW = (x, y, r, col) => { const p = toWin(x, y), rr = r * CAM.z; const rg = c.createRadialGradient(p[0], p[1], 0, p[0], p[1], rr); rg.addColorStop(0, col); rg.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = rg; c.fillRect(WIN.x, WIN.y, WIN.w, WIN.h); };

// quem fala (boca mexendo)
const AVO_TALK = [[21.3, 24.8], [43.1, 45.5]];
const LUR_TALK = [[10.9, 13.6]];
const talkingIn = (d, list) => list.some(([a, b]) => d >= sec(a) && d < sec(b));

// passos no telhado (tempo em s, x, y no forro)
const STEPS = [[27.0, 70, 30], [27.8, 130, 44], [28.6, 185, 34], [29.4, 240, 46], [30.3, 285, 38], [31.1, 300, 44]];
const GAP = track([[0, 0], [sec(29.6), 0], [sec(30.6), 1, 'o'], [L, 1]]);           // a tábua do forro afasta
const FING = track([[0, 0], [sec(30.6), 0], [sec(31.5), 1, 'o'], [L, 1]]);           // dedos na beira da tábua
const HANG = track([[0, 0], [sec(31.8), 0], [sec(35.0), 1, 'io'], [L, 1]]);          // o cabelo descendo até a cama
const UP = track([[0, 0], [sec(45.6), 0], [sec(48.2), 1, 'i'], [L, 1]]);             // ela sobe de volta pro forro
const OPEN = track([[0, 0], [sec(9.0), 0], [sec(10.2), 1, 'o'], [L, 1]]);            // a porta da casa abrindo
const AVOLOOK = track([[0, 0], [sec(19.9), 0], [sec(20.6), 1, 'o'], [sec(21.2), 1], [L, 1]]);
const T = {
  shake: d => {
    const t = d / FPS;
    let s = 0;
    if ((t < 3) || (t >= 35 && t < 43)) s += .9 + Math.sin(d * 1.7) * .4;   // tremor de quem não consegue se mexer
    STEPS.forEach(([ts]) => { const x = t - ts; if (x >= 0 && x < .25) s += 3.2 * Math.exp(-x * 16); });
    return s;
  },
};

/* ============================================================
   GENTE (recorte com nanquim, como nos Valença)
   ============================================================ */
const PELE = '#c9967a', PELESH = '#a3735c', PELEV = '#d6b3a0', PELEVSH = '#b08a78';
// busto genérico: origem na base do pescoço; cabeça em (0,-50)
function bust(B, p, id) {
  const H = B.t(0, -50).r(p.tilt || 0);
  const sk = p.skin || PELE, skS = p.skinSh || PELESH;
  // tronco
  cel(B.map(dn([[-60, 2], [60, 2], [76, 40], [82, 130], [-82, 130], [-76, 40]])), p.shirt, p.shirtSh, id, { sh: 6 });
  if (p.shawl) cel(B.map(dn([[-64, 0], [64, 0], [80, 46], [40, 78], [0, 60], [-40, 78], [-80, 46]])), p.shawl, p.shawlSh, id + 1, { sh: 5 });
  if (p.apron) cel(B.map(dn([[-34, 30], [34, 30], [40, 130], [-40, 130]])), p.apron, '#b9b0a0', id + 2, { sh: 3, lw: 2.4 });
  if (p.vest) { cel(B.map(dn([[-60, 4], [-14, 6], [-20, 130], [-82, 130], [-76, 40]])), p.vest, p.vestSh, id + 3, { sh: 4, lw: 2.4 }); cel(B.map(dn([[60, 4], [14, 6], [20, 130], [82, 130], [76, 40]])), p.vest, p.vestSh, id + 4, { sh: 4, lw: 2.4 }); }
  cel(B.map(dn([[-12, -16], [12, -16], [13, 6], [-13, 6]])), sk, skS, id + 5, { lw: 2.4 });
  // cabelo atrás (coque / comprido)
  if (p.style === 'bun' || p.style === 'white') cel(H.map(circ(0, -36, 16, 13, 10)), p.hair, p.hairSh, id + 6, { sh: 3, lw: 2.4 });
  cel(H.map(circ(-30, 2, 5, 8, 8)), sk, skS, id + 7, { sh: 2, lw: 2.2 });
  cel(H.map(circ(30, 2, 5, 8, 8)), sk, skS, id + 8, { sh: 2, lw: 2.2 });
  const face = p.kid ? [[-26, -10], [-22, -28], [-10, -34], [10, -34], [22, -28], [26, -10], [25, 10], [18, 22], [8, 28], [-8, 28], [-18, 22], [-25, 10]]
    : [[-29, -10], [-25, -28], [-12, -38], [12, -38], [25, -28], [29, -10], [28, 12], [21, 26], [9, 33], [-9, 33], [-21, 26], [-28, 12]];
  cel(H.map(face), sk, skS, id + 9, { sh: 6 });
  // cabelo na frente
  if (p.style === 'short') cel(H.map([[-30, -6], [-28, -26], [-14, -40], [8, -41], [26, -32], [30, -10], [24, -22], [6, -28], [-8, -27], [-20, -22]]), p.hair, p.hairSh, id + 10, { sh: 3 });
  if (p.style === 'kid') cel(H.map([[-27, -8], [-24, -28], [-10, -38], [10, -38], [24, -28], [27, -8], [18, -20], [8, -16], [-2, -22], [-12, -16], [-20, -20]]), p.hair, p.hairSh, id + 10, { sh: 3 });
  if (p.style === 'bun' || p.style === 'white') cel(H.map([[-30, -4], [-28, -26], [-14, -39], [14, -39], [28, -26], [30, -4], [22, -22], [0, -28], [-22, -22]]), p.hair, p.hairSh, id + 10, { sh: 3 });
  if (p.style === 'cap') { cel(H.map([[-30, -14], [-26, -32], [-10, -42], [10, -42], [26, -32], [30, -14]]), p.hair, p.hairSh, id + 10, { sh: 3 }); cel(H.map([[18, -16], [48, -12], [46, -6], [16, -10]]), p.hairSh, null, id + 11, { lw: 2.2 }); }
  // rugas
  if (p.old) { [[-14, -20], [0, -22], [14, -20]].forEach(([x, y], i) => stroke(H.map([[x - 6, y], [x + 6, y - 1]]), 1.1, id + 12 + i)); [-1, 1].forEach((s, i) => stroke(H.map([[s * 21, 6], [s * 17, 18], [s * 10, 24]]), 1.1, id + 15 + i)); }
  // olhos
  const lx = p.look || 0, ly = p.lookY || 0, eo = p.eye ?? 1;
  [[-11, -6], [11, -6]].forEach(([x, y], i) => {
    if (eo < .15) { stroke(H.map([[x - 6, y + 1], [x, y + 2.5], [x + 6, y + 1]]), 1.6, id + 20 + i); return; }
    cel(H.map(circ(x, y, 6, 3.4 * eo, 12)), '#ece6dc', null, id + 20 + i, { lw: 1.4, j: .2 });
    const q = H.p(x + lx * 2.2, y + ly * 1.6 * eo), sc = Math.hypot(H.a, H.b);
    c.fillStyle = p.iris || '#4a3020'; c.beginPath(); c.arc(q[0], q[1], 2.9 * sc * Math.min(1, eo + .2), 0, 7); c.fill();
    c.fillStyle = '#0c0806'; c.beginPath(); c.arc(q[0], q[1], 1.3 * sc, 0, 7); c.fill();
    c.fillStyle = 'rgba(255,255,255,.8)'; c.beginPath(); c.arc(q[0] - .9 * sc, q[1] - .9 * sc, .6 * sc, 0, 7); c.fill();
    stroke(H.map([[x - 7, y - .5], [x, y - 3.8 * eo - .4], [x + 7, y - .5]]), 1.8, id + 28 + i, 'rgba(30,20,16,.85)');          // pálpebra de cima
    stroke(H.map([[x - 6, y - 6.5], [x, y - 7.5], [x + 6, y - 6.5]]), 1, id + 30 + i, 'rgba(60,40,30,.35)');                  // dobra
    stroke(H.map([[x - 8, y - 10 - (p.brow || 0)], [x, y - 12 - (p.brow || 0) * 1.5], [x + 8, y - 10.5]]), p.old ? 1.6 : 2.2, id + 22 + i, p.style === 'white' ? 'rgba(120,115,108,.9)' : 'rgba(30,22,18,.9)');
  });
  { const sc = Math.hypot(H.a, H.b); [-1, 1].forEach(sd => { const q = H.p(sd * 15, 8); const rg = c.createRadialGradient(q[0], q[1], 0, q[0], q[1], 9 * sc); rg.addColorStop(0, 'rgba(200,90,80,.22)'); rg.addColorStop(1, 'rgba(200,90,80,0)'); c.fillStyle = rg; c.fillRect(q[0] - 9 * sc, q[1] - 9 * sc, 18 * sc, 18 * sc); });
    const q = H.p(3, 5); const rg = c.createRadialGradient(q[0], q[1], 0, q[0], q[1], 6 * sc); rg.addColorStop(0, 'rgba(60,30,20,.25)'); rg.addColorStop(1, 'rgba(60,30,20,0)'); c.fillStyle = rg; c.fillRect(q[0] - 6 * sc, q[1] - 6 * sc, 12 * sc, 12 * sc); }
  if (p.glasses) [[-11, -6], [11, -6]].forEach(([x, y], i) => { c.save(); c.strokeStyle = INK; c.lineWidth = 1.6 * ZK; trace(c, H.map(circ(x, y, 9, 8, 12)), true); c.stroke(); c.restore(); });
  stroke(H.map([[1, -2], [3, 8], [0, 10.5]]), 1.4, id + 25, 'rgba(40,25,18,.7)'); stroke(H.map([[-4, 11], [0, 12], [4, 11]]), 1, id + 24, 'rgba(40,25,18,.45)');
  if (p.mustache) cel(H.map([[-12, 15], [-3, 12], [0, 13], [3, 12], [12, 15], [8, 18], [0, 16], [-8, 18]]), p.hair, p.hairSh, id + 26, { lw: 1.8, j: .3 });
  const talk = p.talk ? Math.abs(Math.sin(p.d * .9)) : 0;
  if (talk > .25) cel(H.map(circ(0, 22, 5.5, 1.5 + talk * 3.5, 10)), '#3a1418', null, id + 27, { lw: 2, j: .3 });
  else { cel(H.map([[-8, 21], [-3, 19.5], [0, 20.2], [3, 19.5], [8, 21], [3, 24], [-3, 24]]), p.lips || '#a0605a', '#7a4440', id + 27, { lw: 1, j: .1 }); if (p.smile) stroke(H.map([[-9, 20], [0, 22.5], [9, 20]]), 1.2, id + 32, 'rgba(60,25,20,.6)'); }
}
const VALDIR = { skin: PELE, skinSh: PELESH, hair: '#2b2220', hairSh: '#181210', style: 'short', shirt: '#9fb6c8', shirtSh: '#7d93a6', vest: '#b9a37a', vestSh: '#96825c', mustache: 1 };
const LURDES = { skin: '#b98666', skinSh: '#93664a', hair: '#3a2a20', hairSh: '#241912', style: 'bun', shirt: '#8a5a7a', shirtSh: '#6a4460', apron: '#e8dfcc' };
const AVO = { skin: '#a77a5e', skinSh: '#845c44', hair: '#e4e0d8', hairSh: '#b9b4aa', style: 'white', shirt: '#3c3a44', shirtSh: '#28262e', shawl: '#5a5262', shawlSh: '#423c4a', old: 1, glasses: 0 };
const ZE = { skin: '#a77458', skinSh: '#845a42', hair: '#5a4a3a', hairSh: '#3a2e24', style: 'cap', shirt: '#a8a294', shirtSh: '#868072', mustache: 1 };
const TONHO = { skin: '#c49270', skinSh: '#9c6e52', hair: '#2a201a', hairSh: '#16110d', style: 'kid', kid: 1, shirt: '#c8b45a', shirtSh: '#a08e40' };
const ANA = { skin: '#c49270', skinSh: '#9c6e52', hair: '#3a2418', hairSh: '#221410', style: 'bun', kid: 1, shirt: '#d07a6a', shirtSh: '#a85a4c' };

// o arruda: galho com folhinhas miúdas
function arruda(B, id, sway = 0) {
  const pts = [[0, 0], [4 + sway, -30], [8 + sway * 2, -62], [10 + sway * 3, -92]];
  stroke(B.map(pts), 3.6, id, '#1e2614');
  for (let i = 0; i < 18; i++) {
    const k = .15 + i / 18 * .85, p = [lerp(0, 10 + sway * 3, k), -92 * k], s = i % 2 ? 1 : -1;
    cel(B.map(circ(p[0] + s * 9, p[1] - 3, 8, 4, 8, s * .6)), '#4f6a36', '#3a5028', id + 1 + i, { lw: 2, sh: 1, j: .3 });
  }
}
// vela acesa (base) — a chama vai no brilho
function vela(B, id) { cel(B.map(dn([[-7, 0], [7, 0], [7, -46], [-7, -46]], 6)), '#e9e2cc', '#c7bfa6', id, { lw: 2, sh: 2 }); stroke(B.map([[0, -46], [0, -52]]), 1.6, id + 1); }
function chama(B, f, k = 1) {
  const s = .85 + h2(f, 31) * .3, p = B.p(0, -58);
  glow(p[0], p[1], 70 * k, 'rgba(255,190,90,.35)');
  c.fillStyle = '#ffb347'; c.beginPath(); c.moveTo(p[0], p[1] - 12 * s); c.quadraticCurveTo(p[0] + 5, p[1] - 1, p[0], p[1] + 5); c.quadraticCurveTo(p[0] - 5, p[1] - 1, p[0], p[1] - 12 * s); c.fill();
  c.fillStyle = '#fff3c4'; c.beginPath(); c.ellipse(p[0], p[1], 1.8, 4 * s, 0, 0, 7); c.fill();
}

// Valdir deitado de barriga pra cima: a gente vê o rosto de frente, deitado (topo da cabeça à esquerda)
function valdirDeitado(B, d, o = {}) {
  const ey = o.eye ?? 1, breathe = Math.sin(d * .25) * 2 * (o.calm ? 1 : .3);
  cel(B.map(dn([[-96, -46], [30, -50], [40, 52], [-96, 56]], 12)), '#e8e4dc', '#bdb7ab', 600, { sh: 5 });                     // travesseiro
  cel(B.map(dn([[56, -58 - breathe], [470, -50 - breathe], [490, 62], [52, 66]], 14)), '#7a5248', '#5a3a32', 601, { sh: 8 });   // coberta
  for (let i = 0; i < 6; i++) stroke(B.map([[110 + i * 60, -54 - breathe], [104 + i * 62, 62]]), 1.2, 602 + i, 'rgba(0,0,0,.25)', .5);
  cel(B.map(dn([[28, -18], [66, -26], [70, 22], [28, 18]], 8)), PELE, PELESH, 610, { lw: 2.4 });                              // pescoço
  const H = B.s(1.55).r(-Math.PI / 2);
  cel(H.map(circ(-30, 2, 5, 8, 8)), PELE, PELESH, 611, { sh: 2, lw: 2.2 });
  cel(H.map(circ(30, 2, 5, 8, 8)), PELE, PELESH, 612, { sh: 2, lw: 2.2 });
  cel(H.map([[-29, -10], [-25, -28], [-12, -38], [12, -38], [25, -28], [29, -10], [28, 12], [21, 26], [9, 33], [-9, 33], [-21, 26], [-28, 12]]), PELE, PELESH, 613, { sh: 6 });
  cel(H.map([[-31, -4], [-29, -26], [-14, -42], [8, -43], [26, -34], [31, -8], [24, -22], [6, -28], [-8, -27], [-20, -22]]), '#2b2220', '#181210', 614, { sh: 3 });
  [[-11, -6], [11, -6]].forEach(([x, y], i) => {
    if (ey < .15) { stroke(H.map([[x - 6, y + 1], [x, y + 3], [x + 6, y + 1]]), 2.2, 615 + i); return; }
    cel(H.map(circ(x, y, 6.2, 3.6 * ey, 12)), '#ece6dc', null, 615 + i, { lw: 1.4, j: .2 });
    const q = H.p(x, y), sc = Math.hypot(H.a, H.b);
    c.fillStyle = '#3a2416'; c.beginPath(); c.arc(q[0], q[1], 2.6 * sc, 0, 7); c.fill();
    c.fillStyle = '#0c0806'; c.beginPath(); c.arc(q[0], q[1], (ey > 1.1 ? .9 : 1.3) * sc, 0, 7); c.fill();
    c.fillStyle = 'rgba(255,255,255,.8)'; c.beginPath(); c.arc(q[0] - .8 * sc, q[1] - .8 * sc, .55 * sc, 0, 7); c.fill();
    stroke(H.map([[x - 7, y - .5], [x, y - 4 * ey - .4], [x + 7, y - .5]]), 1.8, 625 + i, 'rgba(30,20,16,.85)');
    stroke(H.map([[x - 8, y - 11 - (ey - 1) * 8], [x, y - 13 - (ey - 1) * 10], [x + 8, y - 11 - (ey - 1) * 6]]), 2.2, 617 + i, 'rgba(30,22,18,.9)');
  });
  stroke(H.map([[1, -2], [3, 8], [0, 10.5]]), 1.4, 619, 'rgba(40,25,18,.7)');
  cel(H.map([[-12, 15], [-3, 12], [0, 13], [3, 12], [12, 15], [8, 18], [0, 16], [-8, 18]]), '#2b2220', '#181210', 620, { lw: 1.8, j: .3 });
  if (o.gasp) cel(H.map(circ(0, 24, 5, 3.5 + Math.abs(Math.sin(d * .6)) * 2.5, 10)), '#3a1418', null, 621, { lw: 2, j: .3 });
  else stroke(H.map([[-7, 23], [0, 24], [7, 23]]), 2.2, 621);
  if (o.sweat) { const k = (d % 30) / 30; [[-24, -20], [20, -24]].forEach(([x, y], i) => { const q = H.p(x, y - ((k + i * .5) % 1) * 16); const r = 3 * Math.hypot(B.a, B.b); cel([[q[0], q[1] - r * 1.4], [q[0] + r, q[1]], [q[0], q[1] + r], [q[0] - r, q[1]]], '#d6e6f2', '#9fb3c4', 622 + i, { lw: 1.4, sh: 1 }); }); }
}

// a Pisadeira: velha magra, agachada, cabelo comprido, unhas compridas e um sorriso
// origem nos pés; o.press: a mão afundando no peito; o.alpha
function pisadeira(B, d, o = {}) {
  const t = d / FPS, br = Math.sin(t * 2.1) * 2, bob = Math.sin(t * 1.3) * 1.5;
  const DARK = '#2e2824', DARKS = '#1c1714', PALE = '#d2cabc', PALES = '#a29a8c', NAIL = '#d8cfa2';
  c.save(); if (o.alpha != null) c.globalAlpha = o.alpha;
  // perna de trás + pé
  cel(B.map(limb([[22, -2], [40, -40], [34, -78 + bob]], [12, 11, 13])), PALE, PALES, 700, { sh: 3, lw: 2.4 });
  cel(B.map(dn([[8, 2], [40, 0], [44, 6], [6, 8]], 5)), PALE, PALES, 701, { lw: 2 });
  // corpo curvado (corcunda)
  cel(B.map(dn([[-44, -26], [30, -34], [52, -96], [40, -132 + br], [-6, -148 + br], [-44, -120], [-62, -64]])), DARK, DARKS, 702, { sh: 6 });
  // trapos esfarrapados
  for (let i = 0; i < 8; i++) cel(B.map([[-50 + i * 12, -40 + h2(i, 2) * 6], [-44 + i * 12, -12 + h2(i, 5) * 12], [-38 + i * 12, -38]]), DARK, null, 703 + i, { lw: 1.6, j: .4 });
  // perna da frente (joelho alto, quase no queixo)
  cel(B.map(limb([[-20, -2], [-44, -40], [-40, -84 + bob]], [12, 11, 14])), PALE, PALES, 712, { sh: 3, lw: 2.4 });
  cel(B.map(dn([[-38, 2], [-4, 0], [0, 7], [-40, 8]], 5)), PALE, PALES, 713, { lw: 2 });
  for (let i = 0; i < 4; i++) cel(B.map(limb([[-6 + i * 1, 4], [4 + i * 4, 10 + i], [10 + i * 5, 16 + i]], [3.4, 2.6, 1.4])), NAIL, null, 714 + i, { lw: 1.2, j: .2 });   // unhas do pé
  // braço até o peito dele
  const pr = o.press ?? 1;
  const hand = [-62 - pr * 3, 6 + pr * 5];
  cel(B.map(limb([[-20, -128 + br], [-58, -100], [-70, -48], hand], [13, 11, 9, 8])), PALE, PALES, 720, { sh: 3, lw: 2.4 });
  for (let i = 0; i < 4; i++) {
    const a = -.4 + i * .32, base = [hand[0] - 4, hand[1] + 2], k1 = [base[0] - Math.cos(a) * 18, base[1] + Math.sin(a) * 12 + 6], k2 = [k1[0] - Math.cos(a) * 14, k1[1] + 10];
    cel(B.map(limb([base, k1, k2], [5, 4, 3])), PALE, PALES, 724 + i, { lw: 1.6, sh: 1 });
    cel(B.map(limb([k2, [k2[0] - Math.cos(a) * 14 - 2, k2[1] + 8]], [3, 1])), NAIL, '#a89e70', 728 + i, { lw: 1.4, j: .2 });
  }
  // cabeça pendendo pra frente
  const Hh = B.t(-4, -150 + br).r(.1).s(1.25);
  cel(Hh.map([[-22, -30], [0, -36], [22, -30], [27, -10], [24, 8], [14, 24], [0, 30], [-14, 24], [-24, 8], [-27, -10]]), PALE, PALES, 740, { sh: 5 });
  // órbitas fundas
  [[-10, -4], [11, -4]].forEach(([x, y], i) => cel(Hh.map(circ(x, y, 7, 6, 8)), '#1a1512', null, 741 + i, { lw: 1.6, j: .4 }));
  // o sorriso: largo, fino, com dentinhos
  const sm = Hh.map([[-16, 12], [-6, 16], [6, 16], [16, 11]]);
  stroke(sm, 3, 743); c.save(); c.fillStyle = '#e6e0c8';
  for (let i = 0; i < 7; i++) { const p = Hh.p(-12 + i * 4, 13.4 + Math.sin(i / 6 * Math.PI) * 2.2); c.fillRect(p[0] - .8, p[1] - .6, 1.6, 2.6); }
  c.restore();
  stroke(Hh.map([[-2, 0], [1, 7]]), 1.6, 744);
  // cabelo comprido e ralo caindo
  c.save(); c.lineCap = 'round';
  for (let i = 0; i < 46; i++) {
    const s = (i / 45 - .5) * (i % 2 ? 1 : 1.1), x0 = s * 56, sw = Math.sin(t * 1.6 + i) * 3;
    const len = 90 + h2(i, 9) * 60;
    const side = Math.abs(s) > .3 ? 1 : 0; if (!side && i % 3) continue;
    const P = Hh.map([[x0, -32 + Math.abs(s) * 14], [x0 * 1.25 + sw, side ? 6 : -20], [x0 * 1.4 + sw * 1.4, len * .6], [x0 * 1.45 + sw * 2, len]]);
    c.strokeStyle = i % 3 ? 'rgba(150,146,138,.85)' : 'rgba(90,86,80,.9)'; c.lineWidth = (i % 4 ? 1.3 : 2) * ZK; trace(c, P, false); c.stroke();
  }
  c.restore();
  c.restore();
  return Hh;
}
function pisaGlow(Hh, d, k = 1) {   // os olhinhos que brilham no escuro
  c.save(); c.globalCompositeOperation = 'lighter';
  [[-10, -4], [11, -4]].forEach(([x, y]) => { const p = Hh.p(x + .5, y); glow(p[0], p[1], 9 * k, 'rgba(255,235,170,.55)'); c.fillStyle = 'rgba(255,248,220,.95)'; c.beginPath(); c.arc(p[0], p[1], 1.5, 0, 7); c.fill(); });
  c.restore();
}

/* ============================================================
   CENÁRIOS
   ============================================================ */
function chuva(f, k = 1, x0 = -40, y0 = -40, w = 620, h = 480) {
  c.save(); c.strokeStyle = `rgba(220,228,240,${.35 * k})`; c.lineWidth = 1.1 * ZK;
  for (let i = 0; i < 140 * k; i++) { const x = x0 + h2(i, 3) * w + ((f * 9 + i * 37) % 40), y = y0 + ((h2(i, 4) * h + f * 23) % h); c.beginPath(); c.moveTo(x, y); c.lineTo(x - 5, y + 18); c.stroke(); }
  c.restore();
}
function telhas(x0, y0, w, h, id) {   // telhado de telha colonial
  cel(dn([[x0, y0 + h], [x0 + 30, y0], [x0 + w - 30, y0], [x0 + w, y0 + h]]), '#a6532e', '#7e3c20', id, { sh: 4 });
  for (let r = 1; r < 5; r++) { const y = y0 + h * r / 5; stroke([[x0 + 30 - r * 6, y], [x0 + w - 30 + r * 6, y]], 1.2, id + r, 'rgba(60,20,10,.6)', .6); }
  for (let i = 0; i < w / 14; i++) stroke([[x0 + 30 + i * 14 - 4, y0], [x0 + 26 + i * 14 - 10, y0 + h]], .8, id + 10 + i, 'rgba(60,20,10,.35)', .4);
}

// 1) a estrada de terra na chuva, a casa lá no fim
function drawEstrada(d, f, o, pass) {
  const t = d / FPS, walk = t * 5.2;
  if (pass === 'base') {
    rect(-80, -80, 700, 260, '#9aa1a6');
    cel(dn([[-80, 170], [60, 120], [200, 150], [330, 110], [470, 140], [620, 120], [620, 240], [-80, 240]], 14), '#6f8a4c', '#5a7240', 800, { sh: 6 });
    cel(dn([[-80, 190], [120, 170], [300, 180], [620, 165], [620, 500], [-80, 500]], 14), '#7c9656', '#64803f', 801, { sh: 5 });
    cel(dn([[250, 182], [290, 182], [560, 500], [-20, 500]], 10), '#a45a35', '#86452a', 802, { sh: 4 });                     // estrada de terra
    for (let i = 0; i < 9; i++) { const k = i / 8, y = lerp(186, 480, k * k); stroke([[lerp(262, 120, k * k), y], [lerp(268, 160, k * k), y + 2]], 1.4, 803 + i, 'rgba(70,30,15,.45)', .5); }   // poças/sulcos
    for (let i = 0; i < 8; i++) { const k = i / 7, x = lerp(236, -60, k * k), y = lerp(184, 470, k * k), hh = lerp(12, 90, k * k); cel(box(x - 2 - k * 4, y - hh, 4 + k * 8, hh, 1), '#5a4636', '#3e3024', 815 + i, { lw: 1.6, sh: 1 }); if (i) stroke([[x, y - hh * .7], [lerp(236, -60, ((i - 1) / 7) ** 2), lerp(184, 470, ((i - 1) / 7) ** 2) - lerp(12, 90, ((i - 1) / 7) ** 2) * .7]], 1, 830 + i, 'rgba(40,30,20,.7)', .3); }   // cerca
    // a casa no fim da estrada (cresce no plano "perto")
    const s = o.near ? 2.1 : 1, hx = 312, hy = 178;
    const Hm = new M().t(hx, hy).s(s);
    cel(Hm.map(dn([[-30, 0], [30, 0], [30, -26], [-30, -26]], 6)), '#e8e2d4', '#c8c0ae', 840, { sh: 2, lw: 2 });
    cel(Hm.map(dn([[-36, -24], [36, -24], [24, -42], [-24, -42]], 6)), '#a6532e', '#7e3c20', 841, { sh: 2, lw: 2 });
    cel(Hm.map(dn([[-8, 0], [6, 0], [6, -18], [-8, -18]], 4)), '#4f7fa8', '#3a6080', 842, { lw: 1.6 });
    cel(Hm.map(dn([[12, -8], [22, -8], [22, -18], [12, -18]], 4)), '#4f7fa8', '#3a6080', 843, { lw: 1.4 });
    // o Valdir de costas, andando com a prancheta
    const V = new M().t(300 + Math.sin(walk) * 2, 330 + Math.abs(Math.sin(walk)) * -3).s(o.near ? 1.25 : 1);
    [-1, 1].forEach((sd, i) => { const sw = Math.sin(walk) * sd; cel(V.map(limb([[sd * 10, -40], [sd * 11 + sw * 5, -18], [sd * 12 + sw * 8, 4]], [12, 11, 10])), '#3a4048', '#2a2e34', 850 + i, { lw: 2 }); });
    cel(V.map(dn([[-24, -96], [24, -96], [26, -36], [-26, -36]], 6)), '#b9a37a', '#96825c', 852, { sh: 4 });
    cel(V.map(circ(0, -112, 14, 16, 12)), '#2b2220', '#181210', 853, { sh: 3 });
    cel(V.map(dn([[-15, -118], [15, -118], [12, -130], [-12, -130]], 5)), '#6a6450', '#4a4638', 854, { lw: 2 });   // boné
    cel(V.map(limb([[22, -90], [30, -64], [26, -46]], [9, 8, 7])), '#b9a37a', '#96825c', 855, { lw: 2 });
    cel(V.map(dn([[18, -78], [40, -84], [44, -40], [22, -36]], 5)), '#8a6a44', '#6a5032', 856, { lw: 2 });          // prancheta
    cel(V.map(limb([[-22, -90], [-32, -62], [-30, -44]], [9, 8, 7])), '#b9a37a', '#96825c', 857, { lw: 2 });
  } else if (pass === 'light') {
    litW(300, -40, 520, 'rgba(210,215,225,.18)');
  } else { chuva(f, 1); }
}

// 2) a casa: porta azul abrindo, a Lurdes; a avó lá dentro, na cadeira, olhando o forro
function drawPorta(d, f, o, pass) {
  const op = OPEN(d);
  if (pass === 'base') {
    rect(-80, -80, 700, 560, '#e8e2d4');
    for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(120,110,90,.08)'; c.beginPath(); c.ellipse(h2(i, 1) * 600 - 30, h2(i, 2) * 400, 20 + h2(i, 3) * 40, 6 + h2(i, 4) * 10, 0, 0, 7); c.fill(); }   // cal manchada
    telhas(-120, -80, 780, 70, 870);
    rect(-80, 380, 700, 100, '#8a6a52'); stroke([[-80, 380], [620, 380]], 2.4, 880);
    // janela azul à esquerda
    cel(dn([[20, 110], [120, 110], [120, 250], [20, 250]], 10), '#4f7fa8', '#3a6080', 881, { sh: 4 });
    stroke([[70, 112], [70, 248]], 2, 882);
    // vão da porta (escuro lá dentro)
    cel(dn([[200, 60], [380, 60], [380, 382], [200, 382]], 12), '#2a241f', '#1a1612', 883, { lw: 3.4 });
    // a avó lá no fundo, na cadeira, olhando pra cima
    const A = new M().t(240, 262).s(.62);
    cel(A.map(dn([[-50, -20], [50, -20], [56, 120], [-56, 120]])), '#4a3a2c', '#36291e', 884, { lw: 2 });   // cadeira
    bust(A, Object.assign({}, AVO, { lookY: -1.2, look: .2, d }), 900);
    // folha da porta abrindo (pra dentro, à direita)
    const dx = lerp(0, 150, E.o(op));
    cel(dn([[200 + dx, 60 + dx * .06], [380, 60], [380, 382], [200 + dx, 382 - dx * .06]], 12), '#4f7fa8', '#3a6080', 885, { sh: 5 });
    if (op < .95) cel(circ(220 + dx, 230, 5, 5, 8), '#b8a070', '#8a7450', 886, { lw: 1.6 });
    // a Lurdes na porta
    if (op > .3) { const Lm = new M().t(300, 250).s(1.18); bust(Lm, Object.assign({}, LURDES, { talk: talkingIn(d, LUR_TALK), d, look: -.6, lookY: .1 }), 940); }
  } else if (pass === 'light') {
    litW(270, -60, 600, 'rgba(225,225,230,.16)');
  } else { chuva(f, .55, -80, -80, 700, 140); }
}

// 3) a ficha do censo (e o crachá)
const FORM_ROWS = ['MARIA DE LURDES', 'JOSÉ CARLOS', 'ANTÔNIO (TONHO)', 'ANA LÚCIA', 'BENEDITA (MÃE)'];
function drawFicha(d, f, o, pass) {
  const t = d / FPS, k = sat((t - (o.t0 || 0)) / (o.dur || 2));
  if (pass === 'base') {
    rect(-80, -80, 700, 560, '#5a4636'); for (let i = 0; i < 16; i++) stroke([[-80, -60 + i * 34], [620, -50 + i * 34]], 1, 960 + i, 'rgba(30,20,12,.35)', .4);   // mesa
    cel(dn([[96, -10], [444, -10], [444, 470], [96, 470]], 14), '#8a6a44', '#6a5032', 980, { sh: 6 });                                 // prancheta
    cel(dn([[112, 20], [428, 20], [428, 460], [112, 460]], 14), '#efe9d8', '#d6cfb9', 981, { sh: 3 });                                   // papel
    cel(dn([[220, -24], [320, -24], [326, 14], [214, 14]], 8), '#a8a8a8', '#7a7a7a', 982, { sh: 2, lw: 2.4 });                        // presilha
    const PR = (s, x, y, sz = 11, al = 'left', col = '#3a3a3a') => { c.save(); c.font = `bold ${sz}px "Courier New", monospace`; c.fillStyle = col; c.textAlign = al; c.textBaseline = 'middle'; c.fillText(s, x, y); c.restore(); };
    PR('CENSO DEMOGRÁFICO · 1991', 270, 40, 13, 'center'); PR('QUESTIONÁRIO DO DOMICÍLIO', 270, 56, 10, 'center');
    c.strokeStyle = '#7a7a7a'; c.lineWidth = 1 * ZK;
    c.strokeRect(124, 70, 292, 30); PR('DOMICÍLIO Nº', 132, 85, 11); PR('001', 300, 85, 18, 'left', '#1c1c1c');
    PR('MUNICÍPIO:', 132, 114, 10); PR('UF: MG', 350, 114, 10);
    c.strokeRect(124, 128, 292, 36); PR('TOTAL DE MORADORES', 132, 146, 11); c.strokeRect(352, 132, 52, 28);
    for (let i = 0; i < 7; i++) { const y = 190 + i * 34; stroke([[124, y + 12], [416, y + 12]], .8, 990 + i, '#9a9a9a', .1); PR((i + 1) + '.', 128, y, 10); }
    // caligrafia (caneta azul)
    const HW = (s, x, y, kk, sz = 15, col = '#22315e') => { if (kk <= 0) return; c.save(); c.font = `${sz}px "Permanent Marker", cursive`; c.textBaseline = 'middle'; const w = c.measureText(s).width; c.beginPath(); c.rect(x - 2, y - 20, (w + 4) * kk, 40); c.clip(); c.fillStyle = col; c.fillText(s, x, y); c.restore(); };
    const rowsK = o.seis ? 1 : k;
    HW('Lagoa Seca', 200, 113, o.seis ? 1 : sat(k * 3), 13);
    FORM_ROWS.forEach((s, i) => HW(s, 150, 188 + i * 34, sat(rowsK * 6 - i - .2), 14));
    HW('5', 368, 146, o.seis ? 1 : sat(k * 1.6 - .5), 22);
    if (o.seis) {
      const k6 = sat((t - o.t0) / .9);
      HW('6', 371, 145, k6, 26, '#1a2448');                                  // o 6 por cima do 5
      // a linha 6: um nome que ninguém lê (mesma letra, mesma caneta)
      if (t > o.t0 + .6) {
        c.save(); c.strokeStyle = '#22315e'; c.lineWidth = 2 * ZK; c.lineCap = 'round'; c.beginPath();
        const kk = sat((t - o.t0 - .6) / 1.2);
        for (let i = 0; i <= 60 * kk; i++) { const x = 150 + i * 3.4, y = 358 + Math.sin(i * .9) * 5 + Math.sin(i * .37) * 3; i ? c.lineTo(x, y) : c.moveTo(x, y); }
        c.stroke(); c.restore();
      }
    }
    if (o.cracha) {   // crachá preso na presilha
      c.save(); c.translate(150, 40); c.rotate(-.12);
      cel(dn([[0, 0], [150, 0], [150, 96], [0, 96]], 10), '#f4f2ea', '#d8d4c8', 995, { sh: 3, lw: 2.4 });
      rect(4, 4, 142, 18, '#3a6a4a'); c.font = 'bold 11px "Courier New", monospace'; c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('CENSO 1991', 75, 13);
      cel(dn([[10, 30], [54, 30], [54, 86], [10, 86]], 6), '#9aa0a6', null, 996, { lw: 1.6 });
      cel(circ(32, 52, 12, 14, 10), PELE, PELESH, 997, { lw: 1.4, sh: 1 }); cel([[20, 48], [22, 38], [42, 38], [44, 48], [32, 42]], '#2b2220', null, 998, { lw: 1.2 });
      stroke([[26, 60], [32, 59], [38, 60]], 1.6, 999, '#2b2220');
      c.fillStyle = '#222'; c.textAlign = 'left'; c.font = 'bold 10px "Courier New", monospace';
      c.fillText('RECENSEADOR', 62, 40); c.font = 'bold 12px "Courier New", monospace'; c.fillText('VALDIR R.', 62, 58); c.fillText('SOUZA', 62, 72);
      c.restore();
    }
    // a caneta escrevendo
    if (!o.cracha && (o.seis ? t < o.t0 + 2 : k < 1)) {
      const px = o.seis ? (t < o.t0 + .7 ? 380 : 150 + 204 * sat((t - o.t0 - .6) / 1.2)) : 200 + (k * 240) % 200, py = o.seis ? (t < o.t0 + .7 ? 150 : 360) : 188 + Math.floor(k * 5) * 34;
      c.save(); c.translate(px, py); c.rotate(-.7 + Math.sin(d * 1.3) * .05);
      cel(dn([[-4, 0], [4, 0], [7, 120], [-7, 120]], 8), '#2a3a7a', '#1a2450', 1000, { lw: 2, sh: 2 }); cel([[-4, 0], [4, 0], [0, -10]], '#c9c9c9', null, 1001, { lw: 1.4 });
      cel(circ(-40, 150, 40, 30, 12, .6), PELE, PELESH, 1002, { sh: 4 });
      c.restore();
    }
  } else if (pass === 'light') {
    litW(200, 0, 520, o.night ? 'rgba(255,200,140,.3)' : 'rgba(255,245,225,.2)');
  }
}

// 4) a mesa: janta (lamparina, chuva) ou café da manhã (sol) — no café, seis xícaras
function drawMesa(d, f, o, pass) {
  const day = !!o.cafe, look = AVOLOOK(d);
  if (pass === 'base') {
    rect(-80, -80, 700, 560, '#cfc5b0');
    for (let i = 0; i < 30; i++) { c.fillStyle = 'rgba(110,95,70,.08)'; c.beginPath(); c.ellipse(h2(i, 5) * 600, h2(i, 6) * 260, 30, 10, 0, 0, 7); c.fill(); }
    // janela com chuva / sol
    cel(dn([[392, 40], [500, 40], [500, 170], [392, 170]], 10), day ? '#e8ecd8' : '#26303a', null, 1100, { lw: 3 });
    stroke([[446, 42], [446, 168]], 2.4, 1101); stroke([[394, 105], [498, 105]], 2.4, 1102);
    cel(dn([[380, 30], [392, 30], [392, 180], [380, 180]], 8), '#4f7fa8', '#3a6080', 1103, { lw: 2 });
    // a família atrás da mesa
    const P = [[70, ZE, { look: .4 }], [175, AVO, { lookY: -1.4 * look, look: .1, brow: look * 2 }], [285, TONHO, { look: -.3 }], [380, ANA, { look: -.5 }], [480, LURDES, { look: -.8 }]];
    P.forEach(([x, p, ex], i) => bust(new M().t(x, 218 + (p.kid ? 22 : 0)).s(p.kid ? .82 : .95), Object.assign({}, p, ex, { d, smile: day && i !== 1 }), 1110 + i * 40));
    // mesa
    cel(dn([[-80, 300], [620, 300], [620, 480], [-80, 480]], 16), '#7a5236', '#5e3e28', 1320, { sh: 6 });
    for (let i = 0; i < 6; i++) stroke([[-80, 318 + i * 26], [620, 314 + i * 26]], 1, 1321 + i, 'rgba(40,20,10,.35)', .4);
    if (!day) {
      cel(circ(160, 320, 62, 18, 14), '#3a3a3a', '#222', 1330, { sh: 3 }); cel(circ(160, 314, 50, 12, 14), '#3a2418', null, 1331, { lw: 2 });   // panela de feijão
      for (let i = 0; i < 12; i++) cel(circ(140 + h2(i, 1) * 40, 312 + h2(i, 2) * 5, 3, 2, 6), '#5a3424', null, 1332 + i, { lw: .8, j: .2 });
      cel(circ(390, 330, 56, 14, 14), '#e8e4dc', '#bdb7ab', 1350, { sh: 2 });                                                            // travessa de torresmo
      for (let i = 0; i < 7; i++) cel(dn([[360 + i * 9, 326], [372 + i * 9, 322], [376 + i * 9, 332], [362 + i * 9, 334]], 4), '#d8a05a', '#a87038', 1351 + i, { lw: 1.4, sh: 1 });
      cel(circ(470, 345, 40, 12, 12), '#d8c070', '#b09a50', 1360, { sh: 2 });                                                            // angu
      vela(new M().t(270, 330).s(.8), 1361);                                                                                               // lamparina/vela
    } else {
      cel(dn([[240, 330], [290, 330], [296, 270], [234, 270]], 6), '#d8d4c8', '#aaa494', 1370, { sh: 3 });   // bule
      cel(dn([[290, 290], [318, 278], [320, 286], [296, 300]], 4), '#d8d4c8', null, 1371, { lw: 2 });
      // seis xícaras (a sexta, na ponta da mesa, sem ninguém)
      [[60, 340], [150, 352], [350, 352], [430, 340], [510, 352], [570, 330]].forEach(([x, y], i) => { cel(circ(x, y, 20, 7, 10), '#eee8dc', '#c6bfaf', 1372 + i * 2, { sh: 2 }); cel(dn([[x - 14, y], [x + 14, y], [x + 11, y - 18], [x - 11, y - 18]], 5), '#eee8dc', '#c6bfaf', 1373 + i * 2, { sh: 2, lw: 2 }); });
      cel(circ(190, 395, 40, 16, 12), '#c8964e', '#a07030', 1390, { sh: 3 });                                    // pão
    }
  } else if (pass === 'light') {
    if (day) { litW(450, 100, 560, 'rgba(255,236,190,.38)'); }
    else { litW(270, 280, 300, 'rgba(255,190,120,.5)'); }
  } else {
    if (!day) { chama(new M().t(270, 330).s(.8), f); c.save(); c.beginPath(); c.rect(392, 40, 108, 130); c.clip(); chuva(f, .9, 380, 20, 140, 170); c.restore(); }
  }
}

// 5) a avó na porta do quarto, com o galho de arruda (e a vela)
function drawAviso(d, f, o, pass) {
  const t = d / FPS, sw = Math.sin(t * 1.4) * 2;
  if (pass === 'base') {
    rect(-80, -80, 700, 560, '#1e1a18');
    cel(dn([[150, -40], [390, -40], [390, 470], [150, 470]], 12), '#3a312a', '#2a231e', 1400, { lw: 3.4 });                    // batente
    cel(dn([[166, -30], [374, -30], [374, 470], [166, 470]], 12), '#4a3f35', '#382f27', 1401, { lw: 2 });
    const A = new M().t(270, 250).s(1.5);
    bust(A, Object.assign({}, AVO, { talk: talkingIn(d, AVO_TALK), d, look: o.reza ? 0 : -.2, lookY: o.reza ? -1 : .2, eye: o.reza ? .7 : 1 }), 1410);
    arruda(new M().t(o.reza ? 196 + sw * 3 : 186, 330).s(1.5).r(o.reza ? -.3 + Math.sin(t * 3) * .25 : -.15), 1460, sw * .4);
    cel(circ(o.reza ? 196 : 186, 334, 20, 14, 10), AVO.skin, AVO.skinSh, 1480, { sh: 3 });                                        // mão com o galho
    if (o.reza) { vela(new M().t(352, 380), 1481); cel(circ(352, 384, 20, 14, 10), AVO.skin, AVO.skinSh, 1483, { sh: 3 });
      for (let i = 0; i < 10; i++) cel(circ(330 + i * 3, 380 + i * 5, 3, 3, 6), '#e8e0c8', null, 1484 + i, { lw: .8 }); }      // terço
  } else if (pass === 'light') {
    litW(o.reza ? 330 : 280, o.reza ? 300 : 230, 420, 'rgba(255,195,130,.7)');
  } else if (o.reza) chama(new M().t(352, 380), f, 1.4);
}

// 6) o quarto (a câmera ficou gravando em cima da cômoda)
function drawQuarto(d, f, o, pass) {
  const t = d / FPS, up = UP(d);
  if (pass === 'base') {
    // forro de tábuas
    cel(dn([[-80, -80], [620, -80], [450, 95], [90, 95]], 14), '#5a4836', null, 1500, { lw: 2 });
    for (let i = 0; i <= 16; i++) stroke([[lerp(-80, 620, i / 16), -80], [lerp(90, 450, i / 16), 95]], 1.4, 1501 + i, 'rgba(25,15,8,.7)', .3);
    [10, 55].forEach((y, i) => { const k = (y + 80) / 175; stroke([[lerp(-80, 90, k), y], [lerp(620, 450, k), y]], 2.6, 1520 + i, 'rgba(25,15,8,.8)', .3); });
    // passos: o forro cede um pouco onde ela pisa
    STEPS.forEach(([ts, x, y], i) => { const a = t - ts; if (a < 0) return; const s = Math.exp(-a * 1.2); c.fillStyle = `rgba(0,0,0,${.6 * s + .12})`; c.beginPath(); c.ellipse(x, y, 30, 9, 0, 0, 7); c.fill(); if (a < .3) { c.strokeStyle = 'rgba(0,0,0,.8)'; c.lineWidth = 2 * ZK; c.beginPath(); c.moveTo(x - 30, y); c.quadraticCurveTo(x, y + 8, x + 30, y); c.stroke(); } });
    // a fresta
    const g = GAP(d);
    if (g > 0) { c.fillStyle = '#050403'; c.beginPath(); c.moveTo(286, 30); c.lineTo(318, 30); c.lineTo(322 + g * 4, 30 + 4 + g * 8); c.lineTo(284 - g * 3, 30 + 4 + g * 8); c.closePath(); c.fill(); }
    // paredes
    cel(dn([[90, 95], [450, 95], [450, 330], [90, 330]], 14), '#a8a090', null, 1530, { lw: 2 });
    cel(dn([[-80, -80], [90, 95], [90, 330], [-80, 470]], 14), '#948c7c', null, 1531, { lw: 2 });
    cel(dn([[620, -80], [450, 95], [450, 330], [620, 470]], 14), '#948c7c', null, 1532, { lw: 2 });
    cel(dn([[90, 330], [450, 330], [620, 470], [-80, 470]], 14), '#5a4434', null, 1533, { lw: 2 });
    // janela com luar e chuva
    cel(dn([[130, 140], [210, 140], [210, 225], [130, 225]], 8), '#1c2430', null, 1534, { lw: 2.6 }); stroke([[170, 142], [170, 223]], 2, 1535);
    // porta (à direita): abre na reza
    const dop = o.reza ? sat((t - 45.5) / .6) : 0;
    cel(dn([[470, 128], [540, 110], [540, 380], [470, 348]], 10), dop > 0 ? '#2a1a10' : '#5a4434', null, 1536, { lw: 2.4 });
    if (dop > 0) { cel(dn([[470, 128], [470 + 70 * (1 - dop), 110 + 30 * dop], [470 + 70 * (1 - dop), 380 - 10 * dop], [470, 348]], 10), '#5a4434', null, 1537, { lw: 2.2 }); const A = new M().t(520, 290).s(.55); bust(A, Object.assign({}, AVO, { d, lookY: -1, talk: 1 }), 1540); arruda(new M().t(486, 330).r(-.4 + Math.sin(t * 3) * .3), 1590, 0); }
    // cama
    cel(dn([[150, 210], [176, 210], [176, 330], [150, 330]], 8), '#4a3020', '#36221a', 1600, { sh: 2 });   // cabeceira
    cel(dn([[170, 272], [430, 272], [430, 318], [170, 318]], 10), '#6a4a34', '#4e3626', 1601, { sh: 3 });
    rect(176, 318, 8, 18, '#2a1a10'); rect(420, 318, 8, 18, '#2a1a10');
    valdirDeitado(new M().t(205, 258).s(.42), d, { eye: o.awake ? 1.3 : 0, sweat: o.awake });
    // o cabelo dela descendo da fresta
    const hg = HANG(d) * (1 - up);
    if (hg > 0 && !o.reza) { c.save(); for (let i = 0; i < 28; i++) { const x0 = 288 + i * 1.1, sw = Math.sin(t * 1.5 + i) * 3 * hg; c.strokeStyle = i % 3 ? 'rgba(150,146,138,.85)' : 'rgba(90,86,80,.9)'; c.lineWidth = 1.2 * ZK; c.beginPath(); c.moveTo(x0, 36); c.quadraticCurveTo(x0 + sw, 36 + hg * 90, x0 + sw * 2 + (i - 14) * .4 * hg, 38 + hg * (150 + h2(i, 2) * 50)); c.stroke(); } c.restore(); }
    // os dedos na beira da tábua
    const fg = FING(d) * (1 - up);
    if (fg > 0) for (let i = 0; i < 4; i++) { const x = 290 + i * 8, l = 4 + fg * (8 + (i % 2) * 3); cel(limb([[x, 32], [x + 1, 32 + l * .6], [x + 3, 32 + l]], [3.2, 2.6, 1.6]), '#b8b0a2', '#8e8678', 1620 + i, { lw: 1.2, sh: .6, j: .2 }); cel(limb([[x + 3, 32 + l], [x + 5, 36 + l]], [1.6, .6]), '#d8cfa2', null, 1624 + i, { lw: .8, j: .1 }); }
    // na reza: ela sai do peito dele e sobe de volta pro forro
    if (o.reza && up < 1) { const yy = lerp(262, 40, E.i(up)), sc = lerp(.46, .25, up); const Hh = pisadeira(new M().t(300, yy).s(sc), d, { alpha: 1 - up * .8, press: 1 - up }); o._h = Hh; }
    // poeira caindo dos passos
    STEPS.forEach(([ts, x, y], j) => { const a = t - ts; if (a < 0 || a > 1.8) return; for (let i = 0; i < 12; i++) { const px = x - 14 + h2(j, i) * 28, py = y + 6 + a * a * 140 * (.5 + h2(i, j + 3)); c.fillStyle = `rgba(210,200,170,${.6 * (1 - a / 1.8)})`; c.fillRect(px, py, 1.6, 1.6); } });
  } else if (pass === 'light') {
    litW(170, 182, 240, 'rgba(150,175,230,.28)');                       // luar
    if (o.reza) litW(500, 250, 360, `rgba(255,180,110,${.6 * sat((t - 45.5) / .6)})`);
  } else {
    c.save(); c.beginPath(); c.rect(130, 140, 80, 85); c.clip(); chuva(f, .7, 120, 120, 100, 120); c.restore();
    if (o.reza && o._h && up < .95) pisaGlow(o._h, d, .7);
    if (o.reza) chama(new M().t(548, 316).s(.5), f, .8);
  }
}

// 7) o peito: close dele imóvel, ela agachada em cima
function drawPeito(d, f, o, pass) {
  const t = d / FPS, up = o.free ? 1 : 0;
  if (pass === 'base') {
    rect(-80, -80, 700, 560, '#2a2622');
    for (let i = 0; i < 14; i++) stroke([[-80 + i * 52, -80], [-60 + i * 52, 330]], 1, 1700 + i, 'rgba(0,0,0,.2)', .3);   // parede
    cel(dn([[-80, 300], [620, 290], [620, 480], [-80, 480]], 16), '#5e3e2c', '#46301f', 1720, { sh: 4 });                 // colchão/cama
    valdirDeitado(new M().t(120, 252).s(1.05), d, { eye: o.free ? .1 : 1.35, sweat: !o.free, gasp: !o.free, calm: o.free });
    if (!o.free) o._h = pisadeira(new M().t(300, 262).s(1.08), d, { press: 1 + Math.sin(t * 6) * .1 });
  } else if (pass === 'light') {
    litW(520, -60, 460, 'rgba(150,175,230,.34)');                          // luar pela janela
    if (!o.free) litW(330, 70, 170, 'rgba(170,190,235,.32)');
    litW(120, 250, 150, 'rgba(170,190,235,.2)');
  } else {
    if (o._h) pisaGlow(o._h, d, 1.2);
  }
}

// 8) o mapa: a próxima casa
function drawMapa(d, f, o, pass) {
  const t = d / FPS, k = sat((t - 55.6) / 1.4);
  if (pass === 'base') {
    rect(-80, -80, 700, 560, '#d8c8a2');
    for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(120,90,50,.07)'; c.beginPath(); c.ellipse(h2(i, 7) * 600, h2(i, 8) * 420, 30 + h2(i, 9) * 50, 12, h2(i, 1) * 3, 0, 0, 7); c.fill(); }
    stroke([[270, -80], [270, 480]], 2, 1800, 'rgba(90,70,40,.35)', .2); stroke([[-80, 200], [620, 200]], 2, 1801, 'rgba(90,70,40,.35)', .2);   // dobras do mapa
    // estradas e rios
    for (let i = 0; i < 7; i++) stroke([[-60, 40 + i * 60], [120, 70 + i * 50 + h2(i, 2) * 30], [300, 30 + i * 62], [600, 80 + i * 48]], i % 3 ? 1.2 : 2.4, 1802 + i, i % 3 ? 'rgba(120,80,50,.45)' : 'rgba(170,60,40,.55)', 2);
    stroke([[-60, 340], [80, 300], [200, 330], [340, 280], [600, 300]], 2.4, 1810, 'rgba(70,110,170,.55)', 2);
    // divisa
    c.save(); c.setLineDash([6 * ZK, 5 * ZK]); stroke([[160, -80], [190, 80], [260, 160], [300, 260], [420, 480]], 1.6, 1811, 'rgba(60,40,30,.7)', 1); c.restore();
    c.save(); c.font = '22px VT323, monospace'; c.fillStyle = 'rgba(60,40,30,.75)'; c.textAlign = 'center'; c.fillText('MINAS GERAIS', 430, 380); c.fillText('GOIÁS', 90, 70); c.restore();
    // a rota tracejada
    c.save(); c.strokeStyle = '#b81c24'; c.lineWidth = 3 * ZK; c.setLineDash([9 * ZK, 7 * ZK]); c.beginPath();
    for (let i = 0; i <= 40 * k; i++) { const u = i / 40, x = lerp(420, 110, u), y = lerp(330, 110, u) - Math.sin(u * Math.PI) * 50; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); c.restore();
    cel(circ(420, 330, 7, 7, 8), '#555', null, 1812, { lw: 1.6 });
    if (k >= 1) { cel(circ(110, 98, 11, 11, 10), '#d02028', '#9a1018', 1813, { lw: 2, sh: 2 }); stroke([[110, 108], [110, 128]], 2.4, 1814); }
  }
}

const ENVS = { estrada: drawEstrada, porta: drawPorta, ficha: drawFicha, mesa: drawMesa, aviso: drawAviso, quarto: drawQuarto, peito: drawPeito, mapa: drawMapa };

/* ============================================================
   PLANOS (cortes de 1,5–3 s)
   ============================================================ */
const S = (a, b, env, cam, o = {}) => ({ a: sec(a), b: sec(b), env, cam, o });
const SHOTS = [
  S(0, 1.5, 'peito', [2.5, 168, 236, 2.8, 172, 238], { hook: 1, clock: 3 * 60 + 9 }),
  S(1.5, 3.0, 'peito', [1.18, 270, 185, 1.0, 270, 195], { hook: 1, clock: 3 * 60 + 9 }),
  S(3.0, 5.0, 'estrada', [1.0, 270, 200, 1.12, 280, 205], { day: 1, clock: 16 * 60 + 12, date: 'JUN 18 1991' }),
  S(5.0, 7.0, 'ficha', [1.25, 240, 120, 1.5, 230, 110], { day: 1, cracha: 1, clock: 16 * 60 + 14, date: 'JUN 18 1991' }),
  S(7.0, 9.0, 'estrada', [1.5, 300, 200, 1.85, 312, 186], { day: 1, near: 1, clock: 16 * 60 + 20, date: 'JUN 18 1991' }),
  S(9.0, 10.8, 'porta', [1.0, 270, 210, 1.08, 290, 210], { day: 1, clock: 16 * 60 + 21, date: 'JUN 18 1991' }),
  S(10.8, 12.5, 'porta', [1.9, 300, 190, 2.1, 300, 185], { day: 1, clock: 16 * 60 + 21, date: 'JUN 18 1991' }),
  S(12.5, 14.0, 'porta', [2.4, 240, 222, 2.9, 240, 214], { day: 1, clock: 16 * 60 + 22, date: 'JUN 18 1991' }),
  S(14.0, 16.0, 'ficha', [1.3, 270, 170, 1.45, 270, 175], { day: 1, t0: 14.0, dur: 1.9, clock: 16 * 60 + 23, date: 'JUN 18 1991' }),
  S(16.0, 18.5, 'mesa', [1.0, 270, 210, 1.1, 270, 214], { clock: 19 * 60 + 40, date: 'JUN 18 1991' }),
  S(18.5, 20.0, 'mesa', [2.2, 270, 315, 2.5, 280, 320], { clock: 19 * 60 + 41, date: 'JUN 18 1991' }),
  S(20.0, 21.2, 'mesa', [2.6, 175, 170, 3.0, 175, 160], { clock: 19 * 60 + 42, date: 'JUN 18 1991' }),
  S(21.2, 23.4, 'aviso', [1.0, 270, 215, 1.1, 270, 205], { clock: 22 * 60 + 2, date: 'JUN 18 1991' }),
  S(23.4, 25.0, 'aviso', [1.7, 270, 165, 1.9, 270, 160], { clock: 22 * 60 + 3, date: 'JUN 18 1991' }),
  S(25.0, 26.8, 'quarto', [1.0, 270, 205, 1.06, 270, 210], { cta: 1, clock: 22 * 60 + 40, date: 'JUN 18 1991' }),
  S(26.8, 29.4, 'quarto', [1.7, 150, 70, 1.8, 290, 66], { clock: 3 * 60 + 2, date: 'JUN 19 1991' }),
  S(29.4, 31.8, 'quarto', [3.2, 300, 46, 3.6, 302, 50], { clock: 3 * 60 + 5, date: 'JUN 19 1991' }),
  S(31.8, 35.0, 'quarto', [1.25, 290, 150, 1.4, 290, 175], { clock: 3 * 60 + 6, date: 'JUN 19 1991' }),
  S(35.0, 37.2, 'peito', [2.6, 160, 232, 3.0, 160, 230], { clock: 3 * 60 + 7, date: 'JUN 19 1991' }),
  S(37.2, 40.0, 'peito', [1.0, 270, 195, 1.15, 270, 180], { clock: 3 * 60 + 8, date: 'JUN 19 1991' }),
  S(40.0, 43.0, 'peito', [2.4, 320, 105, 2.8, 322, 100], { clock: 3 * 60 + 8, date: 'JUN 19 1991', glitch: 1 }),
  S(43.0, 45.5, 'aviso', [1.15, 270, 220, 1.3, 270, 215], { reza: 1, clock: 3 * 60 + 9, date: 'JUN 19 1991' }),
  S(45.5, 48.0, 'quarto', [1.15, 330, 175, 1.25, 320, 150], { reza: 1, awake: 1, clock: 3 * 60 + 9, date: 'JUN 19 1991' }),
  S(48.0, 50.0, 'peito', [2.6, 160, 232, 2.8, 158, 236], { free: 1, clock: 3 * 60 + 10, date: 'JUN 19 1991' }),
  S(50.0, 52.0, 'mesa', [1.0, 270, 210, 1.12, 300, 215], { day: 1, cafe: 1, clock: 6 * 60 + 31, date: 'JUN 19 1991' }),
  S(52.0, 55.5, 'ficha', [1.3, 270, 220, 2.3, 300, 330], { day: 1, seis: 1, t0: 52.4, clock: 6 * 60 + 33, date: 'JUN 19 1991' }),
  S(55.5, 58.0, 'mapa', [1.0, 270, 205, 1.05, 260, 200], { day: 1, sat: .1, noosd: 1, teaser: 1 }),
];
const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
const TAPE_ON = t => false;

/* ============================================================
   CÂMERA DE MÃO: tremidinha, linhas de fita, textos por cima
   ============================================================ */
function camFX(t, f, o) {
  c.setTransform(1, 0, 0, 1, 0, 0);
  const x0 = WIN.x * R, y0 = WIN.y * R, w = WIN.w * R, h = WIN.h * R;
  const gl = o.glitch ? .08 : 0;
  for (let y = 0; y < h; y += 6 * R) {
    const off = ((h2(f, y) < gl ? (h2(f, y + 1) - .5) * 26 : 0)) * R;
    if (Math.abs(off) > .3) c.drawImage(scene, x0, y0 + y, w, 6 * R, x0 + off, y0 + y, w, 6 * R);
  }
  c.setTransform(R, 0, 0, R, 0, 0);
  c.globalAlpha = .025; c.drawImage(fillNoise(tapeNoise, f * 17 + 3), WIN.x, WIN.y, WIN.w, WIN.h); c.globalAlpha = 1;
  c.globalCompositeOperation = 'multiply'; c.fillStyle = '#faf0e4'; c.fillRect(WIN.x, WIN.y, WIN.w, WIN.h); c.globalCompositeOperation = 'source-over';
  const T2 = (s, x, y, size, col, font = 'Bungee, "Arial Black", Impact, sans-serif') => { c.save(); c.font = `${size}px ${font}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = size * .28; c.strokeStyle = '#000'; c.strokeText(s, x, y); c.fillStyle = col; c.fillText(s, x, y); c.restore(); };
  if (o.hook) { const k = Math.min(1, (t + 2) / 6); c.globalAlpha = k; T2('JÁ ACORDOU SEM', LW / 2, WIN.y + 44, 26, '#fff'); T2('CONSEGUIR SE MEXER?', LW / 2, WIN.y + 76, 26, '#ff2a3d'); c.globalAlpha = 1; }
  if (o.cta) { const s = 1 + .04 * Math.sin(t * .4); c.save(); c.translate(LW / 2, WIN.y + WIN.h - 44); c.scale(s, s); c.beginPath(); c.roundRect(-150, -20, 300, 40, 12); c.fillStyle = 'rgba(18,13,22,.88)'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#ff2a3d'; c.stroke(); c.restore(); T2('SEGUE PRA VER A PRÓXIMA CASA', LW / 2, WIN.y + WIN.h - 43, 14, '#fff'); }
  if (o.teaser) {
    const a = t - sec(55.5);
    T2('PRÓXIMA CASA:', LW / 2, WIN.y + 60, 24, '#fff');
    if (a > 8) T2('GOIÁS', LW / 2, WIN.y + 112, 52, '#ff2a3d', 'Creepster, Bungee, Impact, sans-serif');
    if (a > 20) { T2('O HOMEM QUE', LW / 2, WIN.y + 176, 20, '#fff'); T2('NEM A TERRA QUIS', LW / 2, WIN.y + 204, 20, '#fff'); }
    if (a > 30) { const s = 1 + .05 * Math.sin(t * .5); c.save(); c.translate(LW / 2, WIN.y + WIN.h - 62); c.scale(s, s); c.beginPath(); c.roundRect(-140, -24, 280, 48, 14); c.fillStyle = '#ff2a3d'; c.fill(); c.restore(); T2('SEGUE PRA NÃO PERDER', LW / 2, WIN.y + WIN.h - 61, 17, '#fff'); }
    c.save(); c.translate(WIN.x + WIN.w - 120, WIN.y + WIN.h - 140); c.rotate(-.2); c.globalAlpha = .75; c.strokeStyle = '#b81c24'; c.lineWidth = 3; c.strokeRect(-70, -18, 140, 36); c.font = '20px VT323, monospace'; c.fillStyle = '#b81c24'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('DOMICÍLIO Nº 002', 0, 1); c.restore();
  }
}
