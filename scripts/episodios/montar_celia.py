# Prédio 42 · "Onze Anos" (a Dona Célia): monta terror/celia.html a partir de terror/corredor.html
src = open('scripts/episodios/montar_predio42.py', encoding='utf-8').read()
exec(src[:src.index('ELEV = dict(')])
open(SP + '_celia_code.js', 'w', encoding='utf-8').write(open(SP + 'quem.js', encoding='utf-8').read() + '\n' + open(SP + 'celia.js', encoding='utf-8').read())
CELIA = dict(slug='celia', out='onze-anos', title='Onze Anos', code='_celia_code.js', L=528,
  sub='Prédio 42 · a Dona Célia · 9:16, 1080×1920, 22 s · ação do começo ao fim · o fim emenda no começo',
  aria='Curta de terror: a Dona Célia olha pelo olho mágico há onze anos e só consegue manter um rosto',
  knocks='[5.6, 6.18, 6.72]', knocks2='[]', clock0='3 * 3600 + 16 * 60 + 58', bulgek='0', glimpse='d => false',
  ones='[[0, 528]]',
  shots='''  S(0, 2.6, 'olhoC', [1.0, 270, 200, 1.18, 270, 205], { cine: 1 }),
  S(2.6, 5.4, 'lente', [1.0, 270, 200, 1.12, 260, 200], { cine: 1 }),
  S(5.4, 7.0, 'dentro', [1.3, 270, 170, 1.5, 270, 160], { cine: 1 }),
  S(7.0, 8.4, 'lente', [1.0, 270, 200, 1.35, 270, 205], { cine: 1 }),
  S(8.4, 11.2, 'lente', [1.35, 270, 205, 1.5, 270, 200], { cine: 1 }),
  S(11.2, 14.2, 'lente', [1.5, 270, 200, 1.75, 270, 196], { cine: 1 }),
  S(14.2, 17.2, 'mao2', [1.05, 250, 200, 1.4, 300, 196], { cine: 1 }),
  S(17.2, 19.4, 'retrato', [1.2, 270, 170, 1.6, 270, 168], { cine: 1 }),
  S(19.4, 21.75, 'olhoC', [1.25, 270, 205, 1.0, 270, 200], { cine: 1, leave: 19.9, back: 21.1 }),
  S(21.75, 22, 'olhoC', [1.0, 270, 200, 1.0, 270, 200], { cine: 1, loop: 1 }),''',
  caps='''  [0, 62, 'FAZ *11 ANOS* QUE EU OLHO PELO OLHO MÁGICO.', 'narrador'],
  [62, 130, 'ENQUANTO EU OLHO, O MEU MARIDO CONTINUA TENDO *ROSTO*.', 'narrador'],
  [134, 166, '*TOC. TOC. TOC.*', 'coisa'],
  [168, 202, 'HOJE ERAM *DOIS*.', 'narrador'],
  [202, 268, 'O MENINO DO 42. JÁ SEM OS *OLHOS*.', 'narrador'],
  [268, 340, 'EU SÓ CONSIGO SEGURAR *UM* ROSTO.', 'narrador'],
  [342, 412, '*ABRE, CÉLIA. A GENTE TÁ COM FRIO.*', 'coisa'],
  [414, 466, 'ENTÃO EU TIREI O OLHO DA PORTA.', 'narrador'],
  [468, 528, 'E ALGUÉM, DO OUTRO LADO, *ENCOSTOU O DELE*:', 'narrador'],''',
  big='false', sections="[[0, 62, 'GANCHO'], [62, 134, 'O MARIDO'], [134, 168, 'TOC TOC TOC'], [168, 268, 'DOIS'], [268, 342, 'UM ROSTO'], [342, 414, 'A CORRENTE'], [414, 528, 'O OUTRO OLHO']]",
  beats='''      <li class="hot"><b>0–3 s</b><span>Close do olho dela no olho mágico, pulando de um lado pro outro. “Faz 11 anos que eu olho pelo olho mágico.”</span></li>
      <li><b>3–7 s</b><span>Pela lente: o marido, de chapéu, com rosto. Três batidas sacodem a porta dela; a poeira cai, a corrente pula.</span></li>
      <li><b>7–14 s</b><span>Agora são dois: o Mateus sem os olhos. A lente vai de um pro outro, cada vez mais rápido — quem ela olha ganha o rosto, o outro perde.</span></li>
      <li><b>14–19 s</b><span>A mão dela na corrente, tremendo, a corrente escorregando. “Abre, Célia. A gente tá com frio.” O polegar gasta o rosto da foto do marido.</span></li>
      <li class="hot"><b>19–22 s</b><span>O olho sai da lente. Escuro. Um olho volta e encosta — o mesmo do começo. Recomeça.</span></li>''')
s = specific(common(base), CELIA)
s = s.replace("g.fillText('PRÉDIO 42', LW / 2 + 78, 150);", "g.fillText('PRÉDIO 42 · 44', LW / 2 + 78, 150);")
open('terror/celia.html', 'w', encoding='utf-8').write(s)
print('ok celia', len(s))
