import re, sys, json
SP = 'scripts/episodios/'
base = open('terror/corredor.html', encoding='utf-8').read()

def rep(s, a, b, cnt=1):
    assert a in s, 'faltou: ' + a[:80]
    return s.replace(a, b, cnt)

def common(s):
    # ganchos: parede do fundo trocável, coisas extras no corredor, rótulo da câmera, relógio, força das batidas
    s = rep(s, "    if (rev) {\n      // CAM 03", "    if (o.far) { o.far(d, 'base'); } else if (rev) {\n      // CAM 03")
    s = rep(s, "    // fio e lâmpada", "    if (o.extra) o.extra(d, 'base');\n    // fio e lâmpada")
    s = rep(s, "    if (rev) {\n      const [wx, wy]", "    if (o.far) o.far(d, 'light');\n    else if (rev) {\n      const [wx, wy]")
    s = rep(s, "    if (rev) {\n      c.save(); c.shadowColor = 'rgba(80,255,120,.9)'", "    if (o.extra) o.extra(d, 'glow');\n    if (o.far) { o.far(d, 'glow'); return; }\n    if (rev) {\n      c.save(); c.shadowColor = 'rgba(80,255,120,.9)'")
    s = rep(s, "LAST.cine = !!o.cine;", "LAST.cine = !!o.cine; LAST.label = o.label || null;")
    s = rep(s, "(LAST.cam === 3 ? '  ESCADA' : '  CORREDOR 4º')", "(LAST.label || (LAST.cam === 3 ? '  ESCADA' : '  CORREDOR 4º'))")
    s = rep(s, "const secs = 3 * 3600 + 16 * 60 + 54 + (LAST.loop", "const secs = CLOCK0 + (LAST.loop")
    s = rep(s, "g.fillText('CÂMERA 02', LW / 2 + 78, 150);", "g.fillText('PRÉDIO 42', LW / 2 + 78, 150);")
    s = rep(s, "const bb = bulge(d), Zd", "const bb = bulge(d) * BULGE_K, Zd")
    # a porta 42 fica fechada e a criatura não sai (nestes episódios)
    for k in ('open', 'fing', 'peek', 'step'):
        s = re.sub(r"\n  %s: +track\(.*?\),\n" % k, "\n  %s: track([[0, 0], [L, 0]]),\n" % k, s, count=1)
    # os tremores de imagem do avanço da criatura são só da Câmera do Corredor
    s = rep(s, "  if (d >= 489 && d <= 495) glitchRows(f, .14);\n", "")
    s = rep(s, "  if (d >= 546) glitchRows(f, .15 + (d - 546) * .05);\n", "")
    s = rep(s, "if (!big && words.length > 4) {\n    const n = Math.ceil(words.length / 4)", "if (!big && words.length > 3) {\n    const n = Math.ceil(words.length / 3)")
    # textos da câmera longe das bordas: o TikTok corta ~8% de cada lado em celulares compridos
    s = s.replace("WIN.x + WIN.w - 70", "WIN.x + WIN.w - 112").replace("WIN.x + WIN.w - 16", "WIN.x + WIN.w - 58").replace("WIN.x + 16", "WIN.x + 58")
    s = s.replace("maxW = 420, cx = 252", "maxW = 360, cx = 262")   # legenda dentro dos 82% centrais
    return s

def specific(s, cfg):
    s = rep(s, "const KNOCKS = [6.0, 6.58, 7.12];", "const KNOCKS = %s;" % cfg['knocks'])
    s = rep(s, "const KNOCKS2 = [23.58, 24.16, 24.70];", "const KNOCKS2 = %s;\nconst CLOCK0 = %s, BULGE_K = %s;" % (cfg['knocks2'], cfg['clock0'], cfg['bulgek']))
    s = rep(s, "const FPS = 24, L = 600;                      // 25 s (o fim emenda no começo)", "const FPS = 24, L = %d;   // %s s (o fim emenda no começo)" % (cfg['L'], cfg['L'] / 24))
    s = re.sub(r"const ONES = \[.*?\];.*\n", "const ONES = %s;\n" % cfg['ones'], s, count=1)
    if 'glimpse' in cfg: s = rep(s, "const GLIMPSE = d => d >= 4 && d <= 8;", "const GLIMPSE = %s;" % cfg['glimpse'])
    s = rep(s, "const ENVS = { corredor: drawCorredor, porta: drawPorta, olho: drawOlho, fresta: drawFresta, macaneta: drawMacaneta, dedos: drawDedos };",
            "const ENVS = { corredor: drawCorredor, porta: drawPorta, olho: drawOlho, fresta: drawFresta, macaneta: drawMacaneta, dedos: drawDedos };\n" + open(SP + cfg['code'], encoding='utf-8').read())
    a = s.index("const SHOTS = ["); b = s.index("];", a) + 2
    s = s[:a] + "const SHOTS = [\n" + cfg['shots'] + "\n];" + s[b:]
    a = s.index("const CAPS = NARR ? NARR.legendas : ["); b = s.index("];", a) + 2
    s = s[:a] + "const CAPS = NARR ? NARR.legendas : [\n" + cfg['caps'] + "\n];" + s[b:]
    s = re.sub(r"const big = .*?;", "const big = %s;" % cfg['big'], s, count=1)
    s = re.sub(r"const SECTIONS = \[.*?\];", "const SECTIONS = %s;" % cfg['sections'], s, count=1)
    s = re.sub(r'<ol class="beats">.*?</ol>', '<ol class="beats">\n' + cfg['beats'] + '\n    </ol>', s, flags=re.S)
    s = re.sub(r"<title>.*?</title>", "<title>%s</title>" % cfg['title'], s, count=1)
    s = re.sub(r"<h1>.*?</h1>", "<h1>%s</h1>" % cfg['title'], s, count=1)
    s = re.sub(r'(<div class="side">\s*<h1>.*?</h1>\s*)<p>.*?</p>', lambda m: m.group(1) + '<p>%s</p>' % cfg['sub'], s, count=1, flags=re.S)
    s = re.sub(r'aria-label="Curta de terror:[^"]*"', 'aria-label="%s"' % cfg['aria'], s, count=1)
    s = rep(s, '<script src="sons-corredor.js"></script>\n<script src="narracao-corredor.js"></script>', '<script src="sons-%s.js"></script>\n<script src="narracao-%s.js"></script>' % (cfg['slug'], cfg['slug']))
    s = rep(s, "<code>npm run render:corredor</code> → <code>out/camera-do-corredor.mp4</code>", "<code>npm run render:%s</code> → <code>out/%s.mp4</code>" % (cfg['slug'], cfg['out']))
    return s

ELEV = dict(slug='elevador', out='regra-do-elevador', title='Regra do Elevador', code='elevador.js', L=432,
  sub='Prédio 42 · vídeo curto de regra · 9:16, 1080×1920, 18 s · câmera de segurança + close do visor · o fim emenda no começo',
  aria='Curta de terror: o elevador do quarto andar abre sozinho às 3h17 e desce além do térreo',
  knocks='[]', knocks2='[]', clock0='3 * 3600 + 16 * 60 + 56', bulgek='1',
  ones='[[0, 14], [96, 112], [338, 356], [414, 432]]',
  shots='''  S(0, 4, 'corredor', [1.4, 270, 186, 1.6, 270, 190], { rev: 1, cam: 3, far: elevFar, label: '  ELEVADOR 4º' }),
  S(4, 7, 'corredor', [1.8, 270, 192, 2.3, 270, 198], { rev: 1, cam: 3, far: elevFar, label: '  ELEVADOR 4º' }),
  S(7, 9.3, 'visor', [1.0, 270, 202.5, 1.1, 270, 202.5], { cine: 1 }),
  S(9.3, 11.6, 'visor', [1.25, 270, 205, 1.45, 270, 205], { cine: 1 }),
  S(11.6, 14.2, 'visor', [1.6, 285, 210, 2.0, 285, 210], { cine: 1 }),
  S(14.2, 17.75, 'corredor', [1.9, 270, 196, 2.15, 270, 200], { rev: 1, cam: 3, far: elevFar, label: '  ELEVADOR 4º' }),
  S(17.75, 18, 'corredor', [1.4, 270, 186, 1.4, 270, 186], { rev: 1, cam: 3, far: elevFar, label: '  ELEVADOR 4º', loop: 1 }),''',
  caps='''  [0, 96, 'REGRA DO 4º ANDAR: SE O ELEVADOR ABRIR SOZINHO ÀS *3H17*... *NÃO ENTRE*.', 'narrador'],
  [96, 168, 'ELE *ESPERA*. COM A PORTA ABERTA.', 'narrador'],
  [168, 278, 'ONTEM O SEU JORGE DO 45 *ENTROU*.', 'narrador'],
  [278, 341, 'O PRÉDIO NÃO TEM *SUBSOLO*.', 'narrador'],''',
  big='false', sections="[[0, 96, 'GANCHO'], [96, 168, 'A PORTA ABRE'], [168, 278, 'DESCENDO'], [278, 341, '-7'], [341, 432, 'VOLTOU']]",
  beats='''      <li class="hot"><b>0–4 s</b><span>“Ding.” A câmera do 4º andar mostra o elevador fechado. A luz pisca — e o visor mostra -7 por um instante. “Se o elevador abrir sozinho às 3h17… não entre.”</span></li>
      <li><b>4–7 s</b><span>As portas abrem sozinhas. Luz, cabine vazia. “Ele espera.”</span></li>
      <li><b>7–14 s</b><span>Close do visor descendo: 3, 2, 1, 0, -1… até -7, piscando. “O prédio não tem subsolo.”</span></li>
      <li class="hot"><b>14–18 s</b><span>Ding. As portas abrem: os sapatos do seu Jorge no chão — e dedos compridos segurando a porta por dentro. Fecha. Recomeça.</span></li>''')

QUEM = dict(slug='quem', out='quem-olha-por-voce', title='Quem Olha Por Você', code='quem.js', L=888,
  sub='Prédio 42 · episódio do Mateus · 9:16, 1080×1920, 37 s · câmera de segurança + closes · se entende sozinho',
  aria='Curta de terror: Mateus abriu a porta às 3h17 e agora vive invisível no corredor, mantido por um olhar',
  knocks='[26.6, 27.18, 27.72]', knocks2='[35.28, 35.86, 36.40]', clock0='3 * 3600 + 16 * 60 + 33', bulgek='.35',
  ones='[[0, 14], [470, 480], [636, 672], [688, 704], [840, 888]]',
  shots='''  S(0, 3.4, 'corredor', [1.35, 270, 190, 1.5, 270, 192], { extra: quemExtra }),
  S(3.4, 7.8, 'corredor', [1.5, 270, 192, 1.62, 270, 194], { extra: quemExtra }),
  S(7.8, 12.0, 'olhoV', [1.0, 270, 202.5, 1.25, 270, 200], { cine: 1, iris: '#6d726a', old: 1, num: '44', grain: 410 }),
  S(12.0, 15.4, 'rosto', [1.0, 270, 215, 1.1, 270, 210], { cine: 1 }),
  S(15.4, 17.8, 'corredor', [1.9, 400, 190, 2.1, 410, 192], { extra: quemExtra }),
  S(17.8, 20.5, 'olhoV', [1.3, 270, 200, 1.45, 270, 200], { cine: 1, iris: '#6d726a', old: 1, num: '44', flapClose: 19.7, grain: 410 }),
  S(20.5, 25, 'rosto', [1.1, 270, 210, 1.35, 270, 205], { cine: 1, erase: 1 }),
  S(25, 28.5, 'corredor', [1.5, 270, 196, 1.9, 270, 198], { extra: quemExtra }),
  S(28.5, 32, 'olhoV', [1.15, 270, 200, 1.4, 270, 200], { cine: 1, iris: '#5a3d2a', num: '42', flapOpen: 28.7, eyeIn: 29.0, blinkAt: 30.9, grain: 420 }),
  S(32, 36.75, 'corredor', [1.35, 270, 190, 1.42, 270, 190], { extra: quemExtra }),
  S(36.75, 37, 'corredor', [1.35, 270, 190, 1.35, 270, 190], { extra: quemExtra, loop: 1 }),''',
  caps='''  [0, 72, 'NINGUÉM ABRE A PORTA ÀS *3H17*. EU *ABRI*.', 'narrador'],
  [72, 168, 'AGORA EU MORO NO CORREDOR. NINGUÉM ME *VÊ*.', 'narrador'],
  [168, 264, 'SÓ UMA VIZINHA AINDA ME *OLHA*... PELO OLHO MÁGICO.', 'narrador'],
  [264, 336, 'ENQUANTO ELA OLHA, EU CONTINUO TENDO *ROSTO*.', 'narrador'],
  [336, 408, 'MAS ELA SÓ CONSEGUE OLHAR PRA *UM*.', 'narrador'],
  [408, 456, 'ELA ESCOLHEU O *MARIDO*.', 'narrador'],
  [456, 576, 'PRIMEIRO SUMIRAM OS *OLHOS*... DEPOIS A *BOCA*.', 'narrador'],
  [576, 672, '*TOC. TOC. TOC.*', 'narrador'],
  [672, 768, '*EU OLHO POR VOCÊ, MATEUS.*', 'coisa'],
  [768, 864, 'MAS AMANHÃ... VOCÊ BATE NA PORTA DE *OUTRO*.', 'narrador'],''',
  big='t < 72', sections="[[0, 72, 'GANCHO'], [72, 168, 'NINGUÉM ME VÊ'], [168, 336, 'DONA CÉLIA'], [336, 456, 'A ESCOLHA'], [456, 576, 'SEM ROSTO'], [576, 672, 'O 42'], [672, 768, 'O OLHO'], [768, 888, 'FIM']]",
  beats='''      <li class="hot"><b>0–3 s</b><span>Câmera do corredor: um homem meio transparente parado no meio. A luz apaga — e por 5 quadros dá pra ver quem está atrás dele. “Ninguém abre a porta às 3h17. Eu abri.”</span></li>
      <li><b>3–7 s</b><span>Uma vizinha passa atravessando o corpo dele. “Ninguém me vê.”</span></li>
      <li><b>7–14 s</b><span>O olho mágico do 44: o olho da Dona Célia. Close do rosto do Mateus: “Enquanto ela olha, eu continuo tendo rosto.”</span></li>
      <li><b>14–19 s</b><span>Duas figuras diante do 44: ele e o marido. A tampinha do olho mágico fecha. “Ela escolheu o marido.”</span></li>
      <li><b>19–24 s</b><span>O rosto dele se apaga como borracha: os olhos, depois a boca.</span></li>
      <li><b>24–32 s</b><span>Sem rosto, ele bate três vezes na própria porta, a 42. O olho mágico abre: um olho igual ao dele. “Eu olho por você, Mateus.”</span></li>
      <li class="hot"><b>32–37 s</b><span>“Mas amanhã… você bate na porta de outro.” Corredor vazio, 3 batidas à esquerda — e ele está lá de novo.</span></li>''')

for cfg in (ELEV, QUEM):
    s = specific(common(base), cfg)
    open('terror/%s.html' % cfg['slug'], 'w', encoding='utf-8').write(s)
    print('ok', cfg['slug'], len(s))
