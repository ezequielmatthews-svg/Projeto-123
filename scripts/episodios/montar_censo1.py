# Censo 1991 · A Pisadeira: monta terror/censo1.html a partir de terror/valenca.html (fita VHS caseira)
import re
s = open('terror/valenca.html', encoding='utf-8').read()
def rep(a, b, cnt=1):
    global s
    assert a in s, 'faltou: ' + a[:80]
    s = s.replace(a, b, cnt)
A = s.index('/* ============================================================\n   CURVAS E TEMPO')
B = s.index('/* ============================================================\n   QUADRO')
s = s[:A] + open('scripts/episodios/censo1.js', encoding='utf-8').read() + '\n' + s[B:]
rep("const FPS = 24, L = 2280;                     // 95 s", "const FPS = 24, L = 1464;                     // 61 s")
s = re.sub(r"const ONES = \[.*?\];.*\n", "const ONES = [[0, 72], [644, 1200]];  // o gancho; do telhado até a reza, desenho a desenho\n", s, count=1)
# luz do dia x noite, e cor um pouco mais viva de dia (é uma câmera caseira)
rep("c.fillStyle = env === 'estudio' || env === 'foto' ? 'rgb(170,165,160)' : 'rgb(92,92,108)';", "c.fillStyle = o.day ? 'rgb(214,208,198)' : 'rgb(92,92,108)';")
rep("c.globalAlpha = env === 'estudio' ? .55 : .92;", "c.globalAlpha = o.sat ?? (o.day ? .35 : .88);")
rep("  if (o.tape) vhsTapeFX(t, f, o);\n", "  camFX(t, f, o);\n")
# OSD da câmera: REC, data e hora (no mapa, nada)
rep("""    if (TAPE_ON(t)) {   // OSD de videocassete só quando é a fita do avô
      osd('PLAY ▶', WIN.x + 18, WIN.y + 12);
      g.textAlign = 'right'; osd('SP  0:' + String(Math.floor((t - sec(30)) / FPS) % 60).padStart(2, '0'), WIN.x + WIN.w - 18, WIN.y + 12); g.textAlign = 'left';
    }""", """    const sh = shotAt(t);
    if (!sh.o.noosd) {
      if (Math.floor(f / 12) % 2 === 0) { g.fillStyle = '#ff2a2a'; g.beginPath(); g.arc(WIN.x + 66, WIN.y + 23, 6, 0, 7); g.fill(); }
      osd('REC', WIN.x + 78, WIN.y + 12);
      const mins = (sh.o.clock || 0) + Math.floor((t - sh.a) / FPS / 60), secs = Math.floor((t - sh.a) / FPS) % 60;
      const hh = Math.floor(mins / 60) % 24, ap = hh >= 12 ? 'PM' : 'AM', h12 = ((hh + 11) % 12) + 1;
      g.textAlign = 'right'; osd(h12 + ':' + String(mins % 60).padStart(2, '0') + ap, WIN.x + WIN.w - 58, WIN.y + WIN.h - 34);
      g.textAlign = 'left'; osd(sh.o.date || 'JUN 19 1991', WIN.x + 58, WIN.y + WIN.h - 34);
    }""")
rep("g.fillText('OS VALENÇA · 1', LW / 2 + 78, 150);", "g.font = '22px VT323, ui-monospace, monospace'; g.fillText('CENSO 1991', LW / 2 + 78, 134); g.fillText('A PISADEIRA', LW / 2 + 78, 156);")
# legendas: até 3 palavras por bloco, dentro dos 82% centrais
a = s.index("const CAPS = NARR ? NARR.legendas : ["); b = s.index("];", a) + 2
s = s[:a] + """const CAPS = NARR ? NARR.legendas : [
  [8, 72, 'EU NÃO CONSEGUIA *RESPIRAR*.', 'narrador'],
  [76, 206, 'EM NOVENTA E UM, EU BATIA DE PORTA EM PORTA. CONTANDO *GENTE*.', 'narrador'],
  [216, 258, 'QUANTAS PESSOAS MORAM AQUI?', 'narrador'],
  [262, 330, 'CINCO. CONTANDO *A MÃE*.', 'rafa'],
  [388, 500, 'CHOVEU. A GENTE JANTOU JUNTO, E ME DERAM A CAMA DO MENINO.', 'narrador'],
  [510, 596, 'NÃO DEITA DE *BARRIGA CHEIA*. NEM DE *BARRIGA PRA CIMA*.', 'avo'],
  [600, 640, 'EU ACHEI QUE ERA COISA DE VÓ.', 'narrador'],
  [644, 836, 'LÁ PELAS TRÊS, UMA COISA ANDOU NO *TELHADO*. DEVAGAR. COMO QUEM *CONHECE A CASA*.', 'narrador'],
  [844, 1028, 'A LENDA DIZ QUE ELA MORA NOS TELHADOS. E DESCE EM QUEM DORME DE ESTÔMAGO CHEIO. ELA NÃO MATA. *ELA PESA*.', 'narrador'],
  [1034, 1090, '*MIL CAIRÃO* AO TEU LADO...', 'avo'],
  [1094, 1196, 'A AVÓ ENTROU REZANDO. E O PESO FOI SAINDO DO MEU PEITO.', 'narrador'],
  [1210, 1326, 'EU CONTEI *CINCO*. MAS NA FICHA, NA MINHA LETRA, TINHA *MAIS UMA LINHA*:', 'narrador'],
];""" + s[b:]
rep("const big = t < 96 || t >= 1968;", "const big = false;")
rep("if (!big && words.length > 4) {\n    const n = Math.ceil(words.length / 4)", "if (!big && words.length > 3) {\n    const n = Math.ceil(words.length / 3)")
rep("maxW = 410, cx = 252, cy = 646;", "maxW = 360, cx = 262, cy = 640;")
s = re.sub(r"const SECTIONS = \[.*?\];", "const SECTIONS = [[0, 72, 'GANCHO'], [72, 216, 'A ESTRADA'], [216, 384, 'A CASA'], [384, 600, 'A JANTA'], [600, 840, 'O TELHADO'], [840, 1032, 'O PESO'], [1032, 1258, 'A REZA'], [1258, 1402, 'A FICHA'], [1402, 1464, 'PRÓXIMA CASA']];", s, count=1)
s = re.sub(r"<title>.*?</title>", "<title>Censo 1991 · A Pisadeira</title>", s, count=1)
s = re.sub(r"<h1>.*?</h1>", "<h1>Censo 1991 · A Pisadeira</h1>", s, count=1)
s = re.sub(r'(<div class="side">\s*<h1>.*?</h1>\s*)<p>.*?</p>', lambda m: m.group(1) + '<p>Fita Maldita · Censo 1991 (série: uma lenda por casa) · fita da câmera do recenseador, interior de Minas · 9:16, 1080×1920, 61 s · domicílio nº 001</p>', s, count=1, flags=re.S)
s = re.sub(r'aria-label="[^"]*"', 'aria-label="Censo 1991, a Pisadeira: um recenseador dorme de barriga cheia numa casa do interior de Minas e acorda sem conseguir se mexer"', s, count=1)
rep('<script src="sons-valenca.js"></script>\n<script src="narracao-valenca.js"></script>', '<script src="sons-censo1.js"></script>\n<script src="narracao-censo1.js"></script>')
s = re.sub(r"<code>npm run render:valenca</code> → <code>out/[^<]*</code>", "<code>npm run render:censo1</code> → <code>out/censo1991-pisadeira.mp4</code>", s, count=1)
s = re.sub(r'<ol class="beats">.*?</ol>', '''<ol class="beats">
      <li class="hot"><b>0–3 s</b><span>Madrugada: ele deitado de barriga pra cima, de olhos arregalados, sem conseguir se mexer. Uma velha magra agachada no peito dele, unhas compridas, sorrindo. “Já acordou sem conseguir se mexer?”</span></li>
      <li><b>3–16 s</b><span>Junho de 1991. A estrada de terra na chuva, o crachá do censo, a porta azul. “Quantas pessoas moram aqui?” “Cinco. Contando a mãe.” Ele escreve 5 no domicílio nº 001.</span></li>
      <li><b>16–25 s</b><span>A janta (feijão, torresmo, angu). A avó olha pro forro. Na porta do quarto, com um galho de arruda: “Não deita de barriga cheia. Nem de barriga pra cima.”</span></li>
      <li><b>25–35 s</b><span>A câmera ficou gravando. Passos no forro, poeira caindo, uma tábua afasta, dedos na beira, o cabelo descendo até a cama.</span></li>
      <li><b>35–50 s</b><span>O peso: ela agachada no peito dele. “Ela não mata. Ela pesa.” A avó entra rezando o Salmo 91 com a vela; ela sobe de volta pro forro.</span></li>
      <li class="hot"><b>50–61 s</b><span>Café da manhã: seis xícaras na mesa. Na ficha, o 5 virou 6, e tem mais uma linha na letra dele. Próxima casa: Goiás.</span></li>
    </ol>''', s, flags=re.S)

# ---- modo limpo: traço fino, volume em degradê, quase sem sujeira de fita ----
rep("  trace(c, P, true); c.fillStyle = shade || base; c.fill();\n  if (shade) { c.clip(); const sh = (o.sh ?? 5) * ZK; c.translate(-sh, -sh * .8); trace(c, P, true); c.fillStyle = base; c.fill(); }",
    "  trace(c, P, true);\n  if (shade) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const q of P) { if (q[0] < x0) x0 = q[0]; if (q[1] < y0) y0 = q[1]; if (q[0] > x1) x1 = q[0]; if (q[1] > y1) y1 = q[1]; }\n    const gr = c.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, base); gr.addColorStop(.42, base); gr.addColorStop(1, shade); c.fillStyle = gr; } else c.fillStyle = base;\n  c.fill();")
rep("const P = jit(pts, seed, (o.j ?? 1.2) * ZK);", "const P = jit(pts, seed, (o.j ?? 1.2) * .3 * ZK);")
a = s.index("function inkLine(P, closed, lw, seed) {"); b = s.index("\n}\n", a) + 3
s = s[:a] + "function inkLine(P, closed, lw, seed) {\n  c.save(); c.lineJoin = 'round'; c.lineCap = 'round'; c.strokeStyle = 'rgba(28,20,16,.62)';\n  c.lineWidth = lw * .5 * ZK; trace(c, P, closed); c.stroke(); c.restore();\n}\n" + s[b:]
rep("const P = jit(pts, SEED * 131 + id * 7, amp * ZK);", "const P = jit(pts, SEED * 131 + id * 7, amp * .3 * ZK);")
rep("g.globalCompositeOperation = 'screen'; g.globalAlpha = .12;", "g.globalCompositeOperation = 'screen'; g.globalAlpha = .025;")
rep("const by = ((f * 11) % (H / R + 300) - 150) * R;", "const by = -999;")
rep("g.globalCompositeOperation = 'overlay'; g.globalAlpha = .26;", "g.globalCompositeOperation = 'overlay'; g.globalAlpha = .07;")
rep("if (h2(f, 6) < .4) for", "if (false) for")
rep("if (h2(f, 11) < .1) {", "if (false) {")
rep("    g.fillStyle = scan; g.fillRect(0, 0, W, H);\n", "")
rep("g.fillStyle = 'rgb(14,10,20)'; g.fillRect(0, 0, W, H);", "g.fillStyle = 'rgb(4,3,6)'; g.fillRect(0, 0, W, H);")

open('terror/censo1.html', 'w', encoding='utf-8').write(s)
print('ok', len(s))
