/* ============================================================
   O ELEVADOR (fim do corredor do 4º andar)
   ============================================================ */
const ELEV_OPEN = track([[0, 0], [sec(4.0), 0], [sec(4.12), .05, 'o'], [sec(4.3), .02], [sec(6.6), 1, 'io'], [sec(7), 1], [sec(13.9), 0], [sec(14.25), 0], [sec(14.5), 1.05, 'o'], [sec(14.65), 1], [sec(17.25), 1], [sec(17.72), 0, 'i'], [L, 0]]);
function elevFloor(d) {
  const t = d / FPS;
  if (d >= 4 && d <= 8) return '-7';                               // o relance: com a luz apagada, o visor mostra -7
  if (t < 7 || t >= 14.2) return '4';
  if (t < 11.6) return String(Math.max(-7, 4 - Math.floor((t - 7) / .42)));
  return '-7';
}
const DINGS = [0, 14.2];
const dingAmp = d => DINGS.reduce((s, k) => { const x = (d - sec(k)) / FPS; return s + (x >= 0 && x < .5 ? Math.exp(-x * 6) : 0); }, 0);
const OPEN_POLY = () => Q([-.3, 0, ZF], [-.3, .74, ZF], [.3, .74, ZF], [.3, 0, ZF]);
function elevFar(d, pass) {
  const op = Math.max(0, Math.min(1.05, ELEV_OPEN(d)));
  const ZB = ZF + .55;
  if (pass === 'base') {
    cel(Q([-.37, 0, ZF], [-.37, .8, ZF], [.37, .8, ZF], [.37, 0, ZF]), '#5e615a', '#4b4e47', 60, { lw: 2.8 });   // moldura de aço
    // cabine (aparece quando abre)
    c.save(); trace(c, OPEN_POLY(), true); c.clip();
    cel(Q([-.3, 0, ZB], [-.3, .74, ZB], [.3, .74, ZB], [.3, 0, ZB]), '#8c8f84', '#777a70', 61, { lw: 2 });
    cel(Q([-.3, 0, ZF], [-.3, .74, ZF], [-.3, .74, ZB], [-.3, 0, ZB]), '#7d8076', null, 62, { lw: 2 });
    cel(Q([.3, 0, ZF], [.3, .74, ZF], [.3, .74, ZB], [.3, 0, ZB]), '#7a7d73', null, 63, { lw: 2 });
    cel(Q([-.3, 0, ZF], [.3, 0, ZF], [.3, 0, ZB], [-.3, 0, ZB]), '#4c4e46', null, 64, { lw: 2 });
    stroke([P3(-.28, .34, ZB), P3(.28, .34, ZB)], 2.4, 65);                                                  // corrimão
    if (d >= sec(14.2)) [[-.06, -1], [.05, 1]].forEach(([X], i) => { const [x, y] = P3(X, 0, ZF + .3); cel(circ(x, y - 3, 15, 6, 10), '#15130f', null, 66 + i, { lw: 1.6 }); });   // os sapatos do seu Jorge
    // portas deslizando para os lados
    cel(Q([-.3 - .3 * op, 0, ZF], [-.3 - .3 * op, .74, ZF], [-.3 * op, .74, ZF], [-.3 * op, 0, ZF]), '#8d9088', '#767970', 68, { lw: 2.4 });
    cel(Q([.3 * op, 0, ZF], [.3 * op, .74, ZF], [.3 + .3 * op, .74, ZF], [.3 + .3 * op, 0, ZF]), '#8d9088', '#767970', 69, { lw: 2.4 });
    c.restore();
    // dedos compridos segurando a porta por dentro (pelo lado esquerdo)
    if (d >= sec(15.0)) for (let j = 0; j < 4; j++) {
      const x = (d - sec(15.0) - j * 3) / 8; if (x <= 0) continue;
      const k = x < .4 ? E.o(x / .4) * 1.1 : lerp(1.1, 1, Math.min(1, (x - .4) / .3));
      const Y = .42 + j * .05;
      cel(limb([P3(-.26, Y, ZF + .06), P3(-.32 - .03 * k, Y + .008, ZF + .004), P3(-.32 - .09 * k, Y - .01 - .02 * k, ZF - .01)], [13 / ZF, 11 / ZF, 7.5 / ZF]), SKINE, SKINESH, 70 + j, { lw: 1.6, sh: 2 });
    }
    cel(Q([-.11, .83, ZF], [-.11, .93, ZF], [.11, .93, ZF], [.11, .83, ZF]), '#140a0a', null, 75, { lw: 2 });   // visor
    cel(Q([.42, .4, ZF], [.42, .52, ZF], [.5, .52, ZF], [.5, .4, ZF]), '#6a6d66', null, 76, { lw: 1.6 });        // botão de chamada
  } else if (pass === 'light') {
    if (op > .01) {
      const [hx, hy] = P3(0, .5, ZF + .2); let gr = c.createRadialGradient(hx, hy, 4, hx, hy, 160);
      gr.addColorStop(0, `rgba(255,248,225,${.55 * Math.min(1, op)})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gr; c.fillRect(-140, -160, 820, 730);
      const [, y0] = P3(0, 0, ZF), [, y1] = P3(0, 0, 1.3);
      gr = c.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, `rgba(255,248,225,${.4 * Math.min(1, op)})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
      fillPoly([P3(-.3 * op, 0, ZF), P3(.3 * op, 0, ZF), P3(.75 * op, 0, 1.3), P3(-.75 * op, 0, 1.3)], gr);
    }
  } else if (pass === 'glow') {
    const fl = elevFloor(d), blink = fl === '-7' && d / FPS >= 11.6 ? (Math.floor(d / 5) % 2 === 0) : true;
    c.save(); c.shadowColor = 'rgba(255,40,40,.95)'; c.shadowBlur = 8 * R;
    if (blink) wallText(fl, 0, .878, ZF, 36, '#ff3b30', 'VT323, monospace');
    const da = dingAmp(d);
    if (da > .02) { c.shadowColor = 'rgba(255,170,60,.95)'; const [bx, by] = P3(.46, .46, ZF); c.fillStyle = `rgba(255,190,90,${Math.min(1, da)})`; c.beginPath(); c.arc(bx, by, 3.2, 0, 7); c.fill(); }
    c.restore();
    if (op > .01) { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .25 * Math.min(1, op); fillPoly(Q([-.3 * op, .7, ZF + .3], [.3 * op, .7, ZF + .3], [.3 * op, .74, ZF + .3], [-.3 * op, .74, ZF + .3]), '#fff6dc'); c.restore(); }
  }
}
// close do visor: os números descendo além do térreo
function drawVisor(d, f, o, pass) {
  const fl = elevFloor(d), t = d / FPS, neg = fl.startsWith('-');
  if (pass === 'base') {
    rect(-140, -160, 820, 730, '#6f726b');
    for (let i = 0; i < 40; i++) stroke([[-140, -150 + i * 18], [680, -146 + i * 18]], .8, 300 + i, 'rgba(255,255,255,.07)', .2);   // aço escovado
    cel(box(110, 90, 320, 230, 18), '#2e302b', '#22241f', 1, { lw: 3.4, sh: 6 });
    cel(box(140, 115, 260, 180, 8), '#120808', null, 2, { lw: 2.6 });
    for (let i = -2; i <= 2; i++) { c.fillStyle = '#2a2b27'; c.beginPath(); c.arc(270 + i * 50, 370, 16, 0, 7); c.fill(); }       // botões
  } else if (pass === 'light') {
    const gr = c.createRadialGradient(120, -20, 10, 120, -20, 520); gr.addColorStop(0, 'rgba(255,240,210,.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = gr; c.fillRect(-140, -160, 820, 730);
  } else if (pass === 'glow') {
    const blink = fl === '-7' && t >= 11.6 ? (Math.floor(d / 5) % 2 === 0) : true;
    c.save(); c.shadowColor = 'rgba(255,40,40,.95)'; c.shadowBlur = 16 * R;
    if (blink) { txt(fl, 285, 212, 150, 'VT323, monospace', '#ff3b30'); if (t < 11.6 && t >= 7) txt('▼', 175, 212, 60, 'VT323, monospace', '#ff3b30'); }
    c.restore();
  }
}
ENVS.visor = drawVisor;
