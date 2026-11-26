# Prédio 42 · "Onze Anos" (a Dona Célia): monta terror/celia.html a partir de terror/corredor.html
src = open('scripts/episodios/montar_predio42.py', encoding='utf-8').read()
exec(src[:src.index('ELEV = dict(')])
open(SP + '_celia_code.js', 'w', encoding='utf-8').write(open(SP + 'quem.js', encoding='utf-8').read() + '\n' + open(SP + 'celia.js', encoding='utf-8').read())
CELIA = dict(slug='celia', out='onze-anos', title='Onze Anos', code='_celia_code.js', L=612,
  sub='Prédio 42 · a Dona Célia · 9:16, 1080×1920, 25 s · ação do começo ao fim · o fim emenda no começo',
  aria='Curta de terror: a Dona Célia olha pelo olho mágico há onze anos e só consegue manter um rosto',
  knocks='[6.6, 7.18, 7.72]', knocks2='[]', clock0='3 * 3600 + 16 * 60 + 58', bulgek='0', glimpse='d => false',
  ones='[[0, 612]]',
  shots='''  S(0, 3.0, 'olhoC', [1.0, 270, 200, 1.18, 270, 205], { cine: 1 }),
  S(3.0, 6.3, 'lente', [1.0, 270, 200, 1.14, 260, 200], { cine: 1 }),
  S(6.3, 8.2, 'dentro', [1.3, 270, 170, 1.5, 270, 160], { cine: 1 }),
  S(8.2, 9.6, 'lente', [1.0, 270, 200, 1.35, 270, 205], { cine: 1 }),
  S(9.6, 13.0, 'lente', [1.35, 270, 205, 1.5, 270, 200], { cine: 1 }),
  S(13.0, 16.0, 'lente', [1.5, 270, 200, 1.75, 270, 196], { cine: 1 }),
  S(16.0, 19.3, 'mao2', [1.05, 250, 200, 1.4, 300, 196], { cine: 1 }),
  S(19.3, 21.8, 'retrato', [1.2, 270, 170, 1.6, 270, 168], { cine: 1 }),
  S(21.8, 25.25, 'olhoC', [1.25, 270, 205, 1.0, 270, 200], { cine: 1, leave: 22.3, back: 24.2 }),
  S(25.25, 25.5, 'olhoC', [1.0, 270, 200, 1.0, 270, 200], { cine: 1, loop: 1 }),''',
  caps='''  [0, 70, 'FAZ *11 ANOS* QUE EU OLHO PELO OLHO MÁGICO.', 'narrador'],
  [72, 152, 'ENQUANTO EU OLHO, O MEU MARIDO CONTINUA TENDO *ROSTO*.', 'narrador'],
  [156, 190, '*TOC. TOC. TOC.*', 'coisa'],
  [199, 310, 'HOJE ERAM *DOIS*. O MENINO DO 42. JÁ SEM OS *OLHOS*.', 'narrador'],
  [316, 378, 'EU SÓ CONSIGO SEGURAR *UM* ROSTO.', 'narrador'],
  [388, 460, '*ABRE, CÉLIA. A GENTE TÁ COM FRIO.*', 'coisa'],
  [466, 520, 'ENTÃO EU TIREI O OLHO DA PORTA.', 'narrador'],
  [526, 600, 'E ALGUÉM, DO OUTRO LADO, *ENCOSTOU O DELE*:', 'narrador'],''',
  big='false', sections="[[0, 72, 'GANCHO'], [72, 156, 'O MARIDO'], [156, 199, 'TOC TOC TOC'], [199, 312, 'DOIS'], [312, 384, 'UM ROSTO'], [384, 464, 'A CORRENTE'], [464, 612, 'O OUTRO OLHO']]",
  beats='''      <li class="hot"><b>0–3 s</b><span>Close do olho dela no olho mágico, pulando de um lado pro outro. “Faz 11 anos que eu olho pelo olho mágico.”</span></li>
      <li><b>3–8 s</b><span>Pela lente: o marido, de chapéu, com rosto. Três batidas sacodem a porta dela; a poeira cai, a corrente pula.</span></li>
      <li><b>8–16 s</b><span>Agora são dois: o Mateus sem os olhos. A lente vai de um pro outro, cada vez mais rápido — quem ela olha ganha o rosto, o outro perde.</span></li>
      <li><b>16–22 s</b><span>A mão dela na corrente, tremendo, a corrente escorregando. “Abre, Célia. A gente tá com frio.” O polegar gasta o rosto da foto do marido.</span></li>
      <li class="hot"><b>22–25 s</b><span>O olho sai da lente. Escuro. Um olho volta e encosta — o mesmo do começo. Recomeça.</span></li>''')
s = specific(common(base), CELIA)
s = s.replace("g.fillText('PRÉDIO 42', LW / 2 + 78, 150);", "g.fillText('PRÉDIO 42 · 44', LW / 2 + 78, 150);")
open('terror/celia.html', 'w', encoding='utf-8').write(s)
print('ok celia', len(s))
