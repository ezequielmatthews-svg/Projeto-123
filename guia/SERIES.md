# Bíblia das séries · Fita Maldita (@fitamaldita1989)

Registro de cada série: história, personagens, regras do mundo, estilo de animação, som, arquivos e próximos passos.
Antes de continuar qualquer série, leia a parte dela aqui e o [Guia da Fita Maldita](GUIA-FITA-MALDITA.md).

---

## Padrões do canal (valem para tudo)

| Item | Padrão |
|---|---|
| Formato | 9:16, 1080×1920, 24 fps (exportação com `R=2`; prévia em 540×960) |
| Motor | Canvas 2D próprio (`terror/*.html`), API `window.RetroToon` → `export/render.mjs` (Puppeteer + FFmpeg) |
| Traço | Cel animation: contorno preto que "ferve" a cada desenho (jitter por `SEED`), cor chapada + uma sombra deslocada (`cel()`), espessura constante na tela (`ZK = 1/zoom`) |
| Formas retas | Sempre com `box()` / `rrPts()` (pontos densos), senão a suavização vira oval |
| Ritmo | Em dois (12 desenhos/s) nas partes calmas; em um (24/s) na ação (`ONES`) |
| Técnicas | Antecipação, comprimir e esticar, passar do ponto, quadro borrado (smear), ação secundária, pausa dramática |
| Moldura | Faixa de título no topo ("FITA MALDITA" em Creepster vermelho + subtítulo em VT323), janela da imagem, legenda abaixo dentro da zona segura |
| Legenda | Bungee, caixa alta, contorno preto, `*palavra*` em vermelho, blocos de até 4 palavras; cor por personagem |
| Pós | VHS: grão, scanlines, vinheta, barra de tracking, OSD (na Câmera do Corredor, reduzido pela metade) |
| Fontes | Bungee, Creepster, VT323 (+ Permanent Marker no Valença) |
| Vozes | ElevenLabs `eleven_v4`, **uma versão de cada fala** |
| Sons | ElevenLabs `eleven_text_to_sound_v3`, uma versão de cada; folha `sons/<série>/efeitos.json` → `scripts/sonorizar.py` |
| Mixagem | Fundo masterizado embaixo, vozes por cima, fundo abaixa quando alguém fala (ducking), limitador final |
| Narrador do canal | **Antônio** (`oQtRiHTYSl1XeCm4tuUw`), voz grave e calma; sussurrada no terror |

Comandos úteis:
```
python3 scripts/sonorizar.py sons/<série>/efeitos.json terror/sons-<série>.js
python3 scripts/narrar.py --roteiro voz/roteiro-<série>.json --saida terror/narracao-<série>.js
npm run render:<série>        # MP4 em out/
```

---

## 0. Zarko e a Espada Relâmpago (piloto do motor, não é terror)

- **O que é:** o curta de teste do estilo cartoon anos 80/90 ("Episódio 7 · Tempestade no Planeta Violeta").
- **Estilo:** cel animation no espírito dos desenhos clássicos da Warner, com fundo em guache sem contorno e personagem com contorno que ferve. Comprimir e esticar mantendo o volume, antecipação antes do salto, capa e antena atrasadas (ação secundária), smears e múltiplos nos golpes. Grão de película.
- **Arquivos:** `index.html` · `npm run render` → `out/zarko.mp4`
- **Uso:** referência técnica do motor. Tudo de animação nas séries de terror vem daqui.

---

## 1. Fita Maldita · "3:33" → "A Voz da Mãe" (série do Léo)

### História até agora
- **Ep. 1 "3:33"** (24 s, em loop, postado): a TV do quarto do Léo liga sozinha às 3:33. Regra: **"Se a TV ligar às 3:33… NÃO olhe pra ela."** A cada noite, a figura na TV chega mais perto, até bater a mão no vidro. O Léo chama "Mãe…?", silêncio, "Ufa… sumiu?", e uma sombra o cobre: **"Achei você."** Tem um detalhe escondido: dois olhos piscando na porta entreaberta. Fecha com "Você viu ele na porta?" e o vídeo emenda no começo.
- **Ep. 2 "A Voz da Mãe"** (40 s, postado): "Se ele te achar… não grite." **Ele não enxerga no escuro, ele ouve.** A criatura de cabeça torta escuta atrás da cama, os dedos longos rastejam pelo cobertor ("Léo… cadê você?"). Ela vai até a TV e imita a voz da mãe ("Filho… é a mamãe. Pode sair."). O Léo abaixa o cobertor… e a mãe de verdade abre a porta ("Léo? Com quem você tá falando?"). Agora são duas mães: "Vem com a mamãe." Escolha do público: **PORTA ou QUARTO?**

### Personagens
- **Léo:** menino de pijama azul, cobertor vermelho. Voz: Bianca com `[childlike voice]`.
- **A criatura:** membros compridos, cabeça torta, dedos longos. Mora na TV / nas 3:33. Não enxerga no escuro, ouve, e imita quem você mais confia. Voz: Rannox Elion (vilão sombrio); as falas imitadas saem com a voz da pessoa imitada.
- **A mãe:** voz Lucinda. A falsa usa a mesma voz, com o efeito `imitacao`.

### Regras do mundo
1. Tudo começa às **3:33**, quando a TV liga sozinha.
2. Não olhe para a TV.
3. Ela não enxerga no escuro, ela **ouve**. Não grite.
4. Ela imita a voz de quem você ama.

### Estilo de animação
- **Cor:** colorido quente, estilo desenho animado (pele `#f4c29a`, pijama azul `#5d8fd6`, cobertor vermelho `#d24c42`, madeira), quarto à noite iluminado pela TV.
- **Enquadramento:** janela 4:3 (540×405) dentro do 9:16; VHS completo (grão forte, scanlines, tracking).
- **Técnicas:** o close treme em um, smear e quadro invertido no susto, a TV ligando com chiado, tela dividida no Ep. 2.

### Som
- Ep. 1: sons sintetizados no próprio código. Ep. 2: idem, com vozes por cima.

### Arquivos
- Ep. 1: `terror/index.html`, `terror/narracao.js`, `voz/roteiro.json`, `voz/elevenlabs/*.mp3` · `npm run render:terror`
- Ep. 2: `terror/parte2.html`, `terror/narracao-p2.js`, `voz/roteiro-p2.json`, `voz/elevenlabs/p2/` · `npm run render:parte2`

### Pendente
- **Parte 3** (escolha PORTA ou QUARTO). Pelo guia, só vale continuar se o Ep. 2 crescer. Se fizer, a Parte 3 precisa se entender sozinha, sem depender de ter visto as anteriores.

---

## 2. A Batida das 3h17 (série do Mateus) — feita fora deste projeto

> As 3 partes foram produzidas em outra ferramenta (estilo 2.5D mais realista). Registro feito assistindo os vídeos pelo vidIQ.

### História até agora
- **Parte 1** (88 s): o Mateus se muda para o **apartamento 42** em março. O prédio é antigo e o andar está vazio. Toda noite, **às 3h17, três batidas** na porta, e pelo olho mágico não aparece ninguém. Ele instala uma câmera no corredor: a imagem mostra o corredor vazio, mas **o áudio grava as batidas vindo de dentro do apartamento**. Uma noite, pelo olho mágico, ele vê um homem pálido **com o rosto dele**. Abre a porta. O sósia sorri, diz "Obrigado por abrir", entra e tranca a porta por dentro. "Agora são 3h16. Vou bater três vezes. Se você ouvir… não abra." Pergunta final: *Você abriria?*
- **Parte 2** (83 s): o Mateus fica preso no corredor, descalço, num frio que não passa. Bate na própria porta e ninguém atende. Vê a luz amarela da sala acender e sente o cheiro do café dele ("passado forte demais, queimado nas bordas"). De manhã o sósia sai com a jaqueta dele. A **Dona Célia (apto 44)** diz "Bom dia, Mateus" para o sósia, com a mesma voz. O Mateus real fica invisível para os outros, "como a gente olha uma janela". Quando o sósia vai embora, a Dona Célia vira para onde ele está: **"Fica o tempo que precisar."**
- **Parte 3** (43 s, a que mais segurou o público): "Só uma pessoa ainda me enxerga." A Dona Célia abre a porta para ele como quem já esperava. Tem fotos do marido na parede, com o rosto gasto de tanto passarem o dedo. **O marido bateu numa noite. Ela não abriu, mas olhou para ele pelo olho mágico durante 11 anos, para ele não ficar sem rosto.** "Mas eu só consigo olhar pra um, Mateus." Do corredor alguém chama, com a voz do marido e a do Mateus juntas. Termina no meio da frase: "E eu entendi por que, no prédio inteiro…"

### Regras do mundo
1. **3h17**, sempre **três batidas**.
2. A coisa só entra se alguém **abrir** a porta. Aí ela toma o lugar da pessoa (rosto, voz, hábitos).
3. Quem fica para fora vai para o corredor frio e **some para os outros**.
4. Quem fica no corredor **perde o rosto**, a não ser que alguém olhe para ele pelo olho mágico.
5. Cada pessoa só consegue manter **um** rosto.
6. A coisa imita vozes, inclusive várias ao mesmo tempo.

### Personagens
- **Mateus:** narrador, apto 42.
- **O sósia:** pálido, olhos escuros, sorriso, terno escuro.
- **Dona Célia:** apto 44, idosa, cheiro de cera e remédio velho.
- **O marido dela:** preso há 11 anos.

### Estilo (das partes originais)
2.5D sombrio: corredor esverdeado e simétrico, olho mágico com lente olho de peixe, câmera de segurança (CAM 02, REC, hora na tela), rostos apagados, granulado de filme. Títulos com "PARTE X" em vermelho.

### Ideia registrada para a Parte 4 (não produzida)
"Ela escolheu o marido." Em cada apartamento, alguém atrás do olho mágico mantém o rosto de alguém. O Mateus começa a sumir e bate na própria porta, a do 42. O olho mágico abre e um olho igual ao dele olha de volta: "Eu olho por você, Mateus. Mas amanhã… você bate na porta de outro."

> **Ligação:** a "Câmera do Corredor" (série 4) se passa no mesmo prédio (porta 42, 3h17, 3 batidas de dentro), mas foi feita para ser entendida sozinha.

---

## 3. A Dívida dos Valença (série do Tiago)

### História até agora
- **Parte 1** (95 s, postada): **"Na família Valença, todo mundo morre aos 33. Hoje é o meu aniversário."** Bisavô, avô e pai morreram todos aos 33, às **3:33 da manhã**, no dia do aniversário. Aos 9 anos, o Tiago viu o pai esperar a hora chegar sem tentar fugir. A mãe guardou uma **fita VHS do avô**, que o Tiago dá play faltando 42 minutos. O avô na fita: "Se você está vendo isso, eu já morri… Não é doença. **É uma dívida.** Em 1953, o meu pai fez um trato pra família nunca mais passar fome. E toda geração… um Valença paga." Às 3h20, três batidas na porta. Na fita: **"Tem um jeito de você não ir. Você pode… dar outro Valença no seu lugar."** No sofá, o irmão mais novo, Rafa, acorda: "Tiago? Que horas são?" Da porta vem a voz do avô: "Tiago… abre. Sou eu, o vô." Na fita, o avô avisa: "E não abra a porta. Não importa QUEM chame." Pés compridos demais por baixo da porta e dedos entrando às 3:32. Escolha: **ENTREGAR O IRMÃO ou ABRIR A PORTA?**

### Personagens e vozes
| Personagem | Descrição | Voz |
|---|---|---|
| Tiago | 33 anos, bandana, barba por fazer, olhos arregalados | Antônio (`oQtRiHTYSl1XeCm4tuUw`) |
| Vô Augusto | Na fita VHS, cenário de estúdio, sua frio | Sergio (`rnJZLKxtlBZt77uIED10`) |
| Rafa | Irmão mais novo, dorme no sofá | Leandro (`EyPnkQPpWceKpqcMOSpZ`) |
| A coisa | Imita o avô na porta | Sergio + efeito `imitacao` |

### Regras do mundo
1. Todo Valença morre aos **33**, às **3:33**, no dia do aniversário.
2. É uma dívida de um trato de 1953 ("nunca mais passar fome").
3. Dá para escapar **entregando outro Valença** no lugar.
4. Não abrir a porta, não importa quem chame.

### Estilo de animação
- **Recorte (cutout)** como nos virais brasileiros, cenários reaproveitados e ~34 planos (corte a cada 2–4 s).
- **Quase em preto e branco** (composição `saturation`); só o que brilha mantém a cor: chama da vela, relógio, luz da porta.
- **Fita do avô:** efeito VHS próprio (`vhsTapeFX`: linhas tremidas, chiado, barra rolando) com o texto "PLAY ▶ / SP 0:xx" na tela.
- **Cenários:** sala (bolo, retratos, relógio, sofá, porta), memória em sépia, armário, fita, videocassete, estúdio do avô, foto de 1953, tela final com dois botões de escolha.
- **Câmera:** zoom e movimento por plano (`setCam`), boca do avô e do Rafa mexendo nas falas (`AVO_TALK`, `RAFA_TALK`), batidas sincronizadas com o som real.

### Arquivos
`terror/valenca.html`, `terror/sons-valenca.js`, `terror/narracao-valenca.js`, `sons/valenca/`, `voz/roteiro-valenca.json`, `voz/elevenlabs/valenca/` · `npm run render:valenca`

### Pendente
- **Parte 2** depende da escolha nos comentários.
- Também foi sugerida uma versão curta (~35–60 s), com o vídeo abrindo direto na porta ("Sou eu, o vô").

---

## 4. A Câmera do Corredor (parte única, formato novo)

### História
**"Ninguém mora no 42. Mas toda noite, às 3h17… alguém bate."**
- **Batidas:** a câmera de segurança do 4º andar grava três batidas na porta 42. **As batidas vêm de dentro.** O olho mágico pisca verde e há um olho do outro lado. Pela fresta, dois pés andam lá dentro e param.
- **Espera:** a maçaneta gira devagar… e para.
- **A porta abre:** "Eu moro no 41. E ontem… ela abriu." Ele sai: dedos dobrando o batente, a cabeça espiando de lado, o corpo alto demais que se ergue e vira para a câmera.
- **Fim:** "Agora… é a sua porta." Ele avança, "SEM SINAL", três batidas no lado esquerdo do fone, e o vídeo emenda no começo (03:16:54).

### Personagem
- **Ele:** alto demais para a porta, casaco escuro, braços até os joelhos, dedos longos com unha escura, cabeça oval pálida, olhos que brilham e sorriso que abre até as orelhas. Voz: Sergio com o efeito `criatura` (bem grave, metálico, eco de corredor).

### Estilo de animação
- **Câmera de segurança fixa** (CAM 02 / CAM 03): corredor em perspectiva de 1 ponto (`P3`), verde-cinza monocromático, OSD com REC piscando, data e hora (a hora fica vermelha em 03:17:00) e **zoom digital** na tela. No close do rosto, a imagem fica quadriculada como zoom de câmera de verdade.
- **Closes de cinema** cortando no som: a porta inchando (lascas e poeira), o olho mágico, a fresta com os pés, a maçaneta, os dedos. Sem OSD e com cor um pouco mais quente.
- **Animação:**
  - **A porta:** incha a cada batida (recua 2 quadros, estica, passa do ponto e treme) e abre com antecipação (fresta, fecha um pouco, escancara).
  - **Ele saindo:** os dedos dobram o batente um por um, ele se ergue com o pescoço esticando e passando do ponto, e a cabeça vira de uma vez (antecipação, smear com rastro de olhos, passa do ponto e para).
  - **A lâmpada:** balança e pisca (ação secundária).
- **O relance:** nos quadros 4–8 a luz apaga e ele aparece parado diante do 42.
- **Imagem e loop:** janela quase quadrada (540×520), granulado reduzido. O loop não tem emenda: o último quadro é igual ao primeiro.

### Som
- **Sons gerados no ElevenLabs:** lâmpada, zumbido, rangido da porta, maçaneta, passos, dedos, ossos, susto, sem sinal e olho mágico.
- **Reaproveitados do Valença:** batidas, noite, respiração e coração.
- **Estéreo:** as batidas finais saem com `pan -0.85`, à esquerda.

### Arquivos
`terror/corredor.html`, `terror/sons-corredor.js`, `terror/narracao-corredor.js`, `sons/corredor/efeitos.json`, `voz/roteiro-corredor.json`, `voz/elevenlabs/corredor/` · `npm run render:corredor` → `out/camera-do-corredor.mp4`

### Próximos passos
- Medir quanto do vídeo as pessoas assistem e quantas ainda estão vendo no segundo 2. Se funcionar, repetir o formato "câmera de segurança + closes" em outros vídeos de parte única com outras regras: elevador, garagem, escada, portaria.

---

## Efeitos de voz disponíveis (`scripts/narrar.py`)

| Efeito | Uso | Cadeia |
|---|---|---|
| `imitacao` | Criatura imitando alguém conhecido | tom ×0,93 (formantes preservados) + flanger leve |
| `criatura` | A coisa com a voz dela | tom ×0,8 + flanger forte + eco curto |

## Personagens/vozes do ElevenLabs já usados

- **Antônio:** narrador do canal (`oQtRiHTYSl1XeCm4tuUw`).
- **Sergio:** avô / criatura (`rnJZLKxtlBZt77uIED10`).
- **Leandro:** Rafa (`EyPnkQPpWceKpqcMOSpZ`).
- **Bianca:** Léo, com `[childlike voice]`.
- **Rannox Elion:** criatura do Léo.
- **Lucinda:** a mãe.
