import re
s = open('terror/valenca.html', encoding='utf-8').read()
def rep(a, b, cnt=1):
    global s
    assert a in s, 'faltou: ' + a[:80]
    s = s.replace(a, b, cnt)
rep("const FPS = 24, L = 2280;                     // 95 s", "const FPS = 24, L = 960;                      // 40 s")
s = re.sub(r"const ONES = \[.*?\];.*\n", "const ONES = [[90, 130], [530, 556], [684, 722], [900, 960]];  // batidas, a foto virando, o Rafa sentando, o fim\n", s, count=1)
rep("const KNOCKS = [48.0, 48.58, 49.12];", "const KNOCKS = [4.0, 4.58, 5.12];")
rep("const AVO_TALK = [[29.9, 34.8], [34.9, 45.4], [51.9, 57.1], [70.6, 73.6]];", "const AVO_TALK = [[7.3, 10.6]];")
rep("const RAFA_TALK = [[60.5, 63.9]];", "const RAFA_TALK = [[33.6, 35.9]];")
a = s.index("const T = {"); b = s.index("};", a) + 2
s = s[:a] + """const T = {
  lookX:   track([[0,.25],[sec(11.2),.25],[sec(11.6),-1,'o'],[sec(13.2),-1],[sec(13.7),.95,'o'],[sec(15),.95],[sec(27),0],[L,0]]),
  lookY:   track([[0,.2],[sec(2),.6],[sec(4),.2],[L,.2]]),
  eye:     track([[0,1.1],[sec(4),1.1],[sec(4.1),1.45,'o'],[sec(6),1.25],[sec(27),1.25],[sec(29.6),1.7,'o'],[L,1.7]]),
  rafa:    track([[0,0],[sec(28.6),0],[sec(30.1),1,'o'],[L,1]]),
  fingers: track([[0,0],[L,0]]),
  shake:   d => knockAmp(d) * 7 + (d >= sec(29.6) && d < sec(29.9) ? 4 : 0),
};""" + s[b:]
rep("const tvOn = d >= sec(26.8);", "const tvOn = true;")
# cenas novas
rep("const ENVS = { sala: drawSala, memoria: drawMemoria, armario: drawArmario, fita: drawFita, vcr: drawVCR, estudio: drawEstudio, foto: drawFoto };", r"""// a porta aberta: o corredor escuro e uma caixa de sapato no capacho
function drawCapacho(d, f, o, pass) {
  if (pass === 'base') {
    rect(-60, -60, 660, 520, '#17151a');
    cel([[150, 300], [390, 300], [520, 460], [20, 460]], '#2a2730', null, 700, { lw: 2 });          // chão do corredor
    for (let i = 1; i < 6; i++) stroke([[150 - i * 26, 300 + i * 32], [390 + i * 26, 300 + i * 32]], 1.2, 701 + i, 'rgba(0,0,0,.4)', .3);
    cel(box(-40, -60, 110, 520), '#4a3a2e', '#3a2c22', 708, { sh: 4 }); cel(box(470, -60, 110, 520), '#4a3a2e', '#3a2c22', 709, { sh: 4 });   // batente
    cel([[150, 330], [390, 330], [420, 400], [120, 400]], '#5a4632', '#463626', 710, { sh: 3 });     // capacho
    const B = new M().t(270, 352);
    cel(B.map(box(-70, -26, 140, 44, 3)), '#b9a886', '#988a6c', 711, { sh: 5 });                      // caixa
    cel(B.map([[-74, -26], [74, -26], [64, -44], [-64, -44]]), '#cbb996', null, 712, { lw: 2.4 });   // tampa
    txt('TIAGO', 270, 314, 20, '"Permanent Marker", cursive', '#2a221c');
  } else if (pass === 'light') {
    const p = toWin(270, 470), rr = 300 * CAM.z; const rg = c.createRadialGradient(p[0], p[1], 0, p[0], p[1], rr);
    rg.addColorStop(0, 'rgba(255,205,150,.38)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = rg; c.fillRect(WIN.x, WIN.y, WIN.w, WIN.h);
  }
}
// a foto do Rafa criança, nas mãos do Tiago; ela vira e mostra o verso
const FLIP = d => { const t = d / FPS; if (t < 22.2) return 0; if (t < 22.45) return -.06 * E.o((t - 22.2) / .25); return Math.min(1, E.io((t - 22.45) / .5)); };
function drawFotoRafa(d, f, o, pass) {
  const k = FLIP(d), back = k > .5, sx = Math.max(.04, Math.abs(Math.cos(k * Math.PI))) * (k < 0 ? 1 + k : 1);
  const P = new M().t(270, 200).r(-.05 + k * .08).s(sx, 1);
  if (pass === 'base') {
    rect(-60, -60, 660, 520, '#2b231e'); for (let i = 0; i < 9; i++) stroke([[-60, 20 + i * 48], [600, 30 + i * 48]], 1.2, 720 + i, 'rgba(0,0,0,.25)', .4);
    cel(P.map(box(-120, -150, 240, 300, 4)), back ? '#ddd3bd' : '#e6dfcf', back ? '#c4b99f' : '#c9c0aa', 730, { sh: 3 });
    if (!back) {
      c.save(); const q = P.map(box(-104, -134, 208, 230, 2)); trace(c, q, true); c.clip();
      rect(140, 50, 260, 260, '#9a8a6c'); rect(140, 210, 260, 120, '#7d6e54');
      const K = new M().t(270, 300).s(sx, 1).t(-270, -300);
      cel(K.map([[248, 210], [292, 210], [300, 290], [240, 290]]), '#6a7a96', '#4e5c74', 731, { sh: 2 });   // camiseta
      cel(K.map(circ(270, 186, 22, 25, 12)), SKIN, SKINSH, 732, { sh: 2 });
      cel(K.map([[248, 176], [256, 160], [284, 160], [292, 176], [270, 170]]), '#2e2622', null, 733, { lw: 1.8 });
      [[262, 188], [278, 188]].forEach(([x, y], i) => { const pp = K.p(x, y); c.fillStyle = INK; c.beginPath(); c.arc(pp[0], pp[1], 2, 0, 7); c.fill(); });
      stroke(K.map([[262, 198], [270, 202], [278, 198]]), 1.8, 736);
      c.restore();
    }
    // as mãos do Tiago segurando a foto
    [-1, 1].forEach((s2, i) => { const hp = P.p(s2 * 118, 40); cel(circ(hp[0] + s2 * 8, hp[1], 26, 34, 12), SKIN, SKINSH, 740 + i, { sh: 3 }); for (let j = 0; j < 3; j++) stroke([[hp[0] - s2 * 6, hp[1] - 18 + j * 12], [hp[0] - s2 * 18, hp[1] - 16 + j * 12]], 1.4, 744 + i * 3 + j); });
  } else if (pass === 'light') {
    const p = toWin(200, 60), rr = 380 * CAM.z; const rg = c.createRadialGradient(p[0], p[1], 0, p[0], p[1], rr);
    rg.addColorStop(0, 'rgba(255,210,160,.3)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = rg; c.fillRect(WIN.x, WIN.y, WIN.w, WIN.h);
  } else if (pass === 'glow' && back) {
    // a letra do pai, em tinta vermelha escura (fica com cor mesmo no cinza)
    c.save(); const m = P; c.setTransform(c.getTransform().multiply(new DOMMatrix([m.a, m.b, m.c, m.d, m.e, m.f])));
    txt('PAGO.', 0, -30, 46, '"Permanent Marker", cursive', '#8e1a1a'); txt('1999', 0, 30, 40, '"Permanent Marker", cursive', '#8e1a1a');
    c.restore();
  }
}
const ENVS = { sala: drawSala, memoria: drawMemoria, armario: drawArmario, fita: drawFita, vcr: drawVCR, estudio: drawEstudio, foto: drawFoto, capacho: drawCapacho, fotoRafa: drawFotoRafa };""")
a = s.index("const SHOTS = ["); b = s.index("];", a) + 2
s = s[:a] + """const SHOTS = [
  S(0, 3, 'sala', [1.0, 270, 202, 1.18, 280, 215], { clock: 3 * 60 + 32, sweep: 1 }),
  S(3, 7, 'sala', [2.4, 470, 200, 2.65, 470, 205], { clock: 3 * 60 + 32 }),
  S(7, 11, 'estudio', [1.5, 270, 170, 1.85, 270, 160], { tape: 1, lean: 1, sweat: 1 }),
  S(11, 13.2, 'sala', [2.4, 110, 255, 2.7, 100, 258], { clock: 3 * 60 + 32 }),
  S(13.2, 15, 'sala', [3.3, 290, 168, 3.7, 285, 168], { clock: 3 * 60 + 32 }),
  S(15, 17.6, 'capacho', [1.0, 270, 230, 1.25, 270, 300], {}),
  S(17.6, 20, 'capacho', [1.9, 270, 330, 2.3, 270, 320], {}),
  S(20, 24.2, 'fotoRafa', [1.0, 270, 205, 1.15, 270, 200], {}),
  S(24.2, 27, 'fotoRafa', [1.7, 270, 200, 2.0, 270, 200], {}),
  S(27, 30.5, 'sala', [3.9, 290, 166, 4.6, 290, 164], { clock: 3 * 60 + 33 }),
  S(30.5, 33, 'sala', [1.4, 180, 220, 1.55, 160, 230], { clock: 3 * 60 + 33 }),
  S(33, 38, 'sala', [4.4, 55, 245, 5.2, 55, 242], { clock: 3 * 60 + 33 }),
  S(38, 40, 'card', [1.0, 270, 202, 1.0, 270, 202], { clock: 3 * 60 + 33 }),
];""" + s[b:]
# tela final: a pergunta da Parte 2
rep("const dd = card ? sec(81.5) : d;", "const dd = card ? sec(37.9) : d;")
rep("const k = Math.min(1, (t - SHOTS[SHOTS.length - 1].a) / 8);", "const k = Math.min(1, (t - SHOTS[SHOTS.length - 1].a) / 6);")
rep("c.strokeText('O QUE VOCÊ FARIA?', LW / 2, WIN.y + 52); c.fillStyle = '#ff2a3d'; c.fillText('O QUE VOCÊ FARIA?', LW / 2, WIN.y + 52);", "c.strokeText('É O RAFA?', LW / 2, WIN.y + 52); c.fillStyle = '#ff2a3d'; c.fillText('É O RAFA?', LW / 2, WIN.y + 52);")
rep("c.fillText('3:32', LW / 2, WIN.y + 102);", "c.fillText('3:33', LW / 2, WIN.y + 102);")
rep("btn(WIN.x + WIN.w * .26, 'ENTREGAR O IRMÃO', 0);\n  btn(WIN.x + WIN.w * .74, 'ABRIR A PORTA', 1);", "btn(WIN.x + WIN.w * .26, 'É O IRMÃO', 0);\n  btn(WIN.x + WIN.w * .74, 'NÃO É ELE', 1);")
# legendas
a = s.index("const CAPS = NARR ? NARR.legendas : ["); b = s.index("];", a) + 2
s = s[:a] + """const CAPS = NARR ? NARR.legendas : [
  [0, 72, 'NA FAMÍLIA VALENÇA, TODO MUNDO MORRE AOS *33*. ONTEM EU FIZ 33.', 'tiago'],
  [72, 168, 'ÀS 3H32, BATERAM COM A VOZ DO MEU *AVÔ*.', 'tiago'],
  [168, 264, '*DÁ OUTRO VALENÇA NO SEU LUGAR.*', 'avo'],
  [264, 360, 'EU OLHEI PRO MEU IRMÃO... E *ABRI* A PORTA.', 'tiago'],
  [360, 480, 'NÃO TINHA NINGUÉM. SÓ UMA CAIXA DE SAPATO. COM O MEU NOME, NA LETRA DO MEU *PAI*.', 'tiago'],
  [480, 648, 'DENTRO, UMA FOTO DO RAFA COM CINCO ANOS. ATRÁS: *PAGO. 1999.* O ANO EM QUE MEU PAI MORREU.', 'tiago'],
  [648, 792, 'MEU PAI ENTREGOU O *RAFA*. QUANDO A GENTE ERA CRIANÇA.', 'tiago'],
  [792, 912, 'TIAGO? QUE HORAS SÃO?', 'rafa'],
  [912, 960, 'ENTÃO... QUEM DORME NO MEU SOFÁ *HÁ 24 ANOS*?', 'tiago'],
];""" + s[b:]
s = re.sub(r"const big = .*?;", "const big = false;", s, count=1)
rep("if (!big && words.length > 4) {\n    const n = Math.ceil(words.length / 4)", "if (!big && words.length > 3) {\n    const n = Math.ceil(words.length / 3)")
s = re.sub(r"maxW = \d+, cx = \d+, cy = \d+;", "maxW = 360, cx = 262, cy = 646;", s, count=1)
rep("g.fillText('OS VALENÇA · 1', LW / 2 + 78, 150);", "g.fillText('OS VALENÇA · 2', LW / 2 + 78, 150);")
# textos da fita longe das bordas (o TikTok corta as laterais)
rep("osd('PLAY ▶', WIN.x + 18, WIN.y + 12);", "osd('PLAY ▶', WIN.x + 58, WIN.y + 12);")
rep("osd('SP  0:' + String(Math.floor((t - sec(30)) / FPS) % 60).padStart(2, '0'), WIN.x + WIN.w - 18, WIN.y + 12)", "osd('SP  0:' + String(Math.floor((t - sec(7)) / FPS) % 60).padStart(2, '0'), WIN.x + WIN.w - 58, WIN.y + 12)")
rep('<script src="sons-valenca.js"></script>\n<script src="narracao-valenca.js"></script>', '<script src="sons-valenca2.js"></script>\n<script src="narracao-valenca2.js"></script>')
s = re.sub(r"<title>.*?</title>", "<title>Os Valença · Parte 2</title>", s, count=1)
s = re.sub(r"<h1>.*?</h1>", "<h1>Os Valença · Parte 2</h1>", s, count=1)
s = re.sub(r'(<div class="side">\s*<h1>.*?</h1>\s*)<p>.*?</p>', lambda m: m.group(1) + '<p>Fita Maldita · A Dívida dos Valença, Parte 2 · 9:16, 1080×1920, 40 s · se entende sozinha</p>', s, count=1, flags=re.S)
s = re.sub(r"const SECTIONS = \[.*?\];", "const SECTIONS = [[0, 72, 'GANCHO'], [72, 264, 'A BATIDA E A FITA'], [264, 360, 'ABRI'], [360, 480, 'A CAIXA'], [480, 648, 'A FOTO'], [648, 792, 'O RAFA'], [792, 912, 'QUE HORAS SÃO'], [912, 960, 'É O RAFA?']];", s, count=1)
s = re.sub(r'<ol class="beats">.*?</ol>', '''<ol class="beats">
      <li class="hot"><b>0–3 s</b><span>“Na família Valença, todo mundo morre aos 33. Ontem eu fiz 33.” O bolo, o relógio em 3:32.</span></li>
      <li><b>3–11 s</b><span>Três batidas com a voz do avô. Na fita: “Dá outro Valença no seu lugar.”</span></li>
      <li><b>11–20 s</b><span>Ele olha o irmão no sofá… e abre a porta. Ninguém. Uma caixa de sapato com “TIAGO” na letra do pai.</span></li>
      <li><b>20–27 s</b><span>Uma foto do Rafa com cinco anos. Ela vira: “PAGO. 1999.” — o ano em que o pai morreu.</span></li>
      <li class="hot"><b>27–40 s</b><span>“Meu pai entregou o Rafa.” Atrás dele, o Rafa senta: “Tiago? Que horas são?” — igual à Parte 1. É O RAFA? / NÃO É ELE.</span></li>
    </ol>''', s, flags=re.S)
s = s.replace("<code>npm run render:valenca</code> → <code>out/valenca-parte1.mp4</code>", "<code>npm run render:valenca2</code> → <code>out/valenca-parte2.mp4</code>")
open('terror/valenca2.html', 'w', encoding='utf-8').write(s)
print('ok', len(s))
