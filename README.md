# Zarko e a Espada Relâmpago

Desenho animado curto no estilo da animação em celuloide dos anos 80 e 90, feito em HTML5 Canvas e JavaScript puro, sem bibliotecas. Um guerreiro espacial respira, se prepara, salta, recebe um raio na espada, golpeia e aterrissa num planeta roxo durante uma tempestade.

## Ver a animação

Abra `index.html` em qualquer navegador. Não precisa instalar nem compilar nada.

- **Play/Pause** pelo botão ou pela barra de espaço. As setas ◀ ▶ avançam ou voltam um quadro de cada vez.
- **Efeito VHS** liga e desliga o grão, as scanlines, a faixa de tracking e o OSD.
- **Folha de exposição (X-sheet)**: mostra os trechos rodados em um (laranja), em dois (verde-água) e os smear frames (magenta). Clique nela para pular para um quadro.

## Técnicas de animação aplicadas

| Técnica | Como foi feita |
|---|---|
| 24 fps, em dois e em um | A linha do tempo tem 168 quadros a 24 fps. Fora da ação, cada desenho fica exposto por 2 quadros (12 desenhos/s). Nos quadros 72 a 105 (salto, raio, golpe e impacto) a troca vai para em um, com um desenho novo a cada quadro. |
| Squash and stretch | Escala não uniforme a partir dos pés, com volume preservado (`sx = 1/sy^0.85`): agacha antes do salto, estica na subida e na queda, achata no impacto e quica de volta. |
| Antecipação e follow-through | O personagem agacha e leva a espada para trás antes do salto. A capa e a antena repetem o caminho do corpo com alguns quadros de atraso (offset no tempo + restrição de comprimento), e a cabeça atrasa um pouco em relação ao tronco. |
| Smear frames e múltiplos | Quando a espada gira rápido demais, o golpe vira um único desenho esticado em leque, com linhas de velocidade. Lâmina e punho aparecem repetidos ao longo do caminho, e o corpo deixa rastros de cor no salto e na queda. |
| Ink & paint / cel shading | Cores chapadas com uma única sombra chapada, mais contorno preto feito em duas passadas, que fica mais grosso no lado da sombra. O traço “ferve” a cada desenho novo. |
| Fundo em guache/aquarela | O fundo é pintado uma vez, de forma procedural: manchas de aquarela, pincel seco no planeta, bordas com pigmento acumulado, desfoque suave, textura de papel e nenhum contorno. |
| TV de tubo e VHS | Grão e tremor da película mudam a cada quadro (como no filme de verdade, mesmo quando o desenho está em dois). Há ainda sangramento de cor, faixa de tracking, poeira, arranhões, scanlines, vinheta e OSD “PLAY / SP”. |

O quadro N sempre sai idêntico: todo o ruído é gerado a partir de seeds. É isso que permite exportar o vídeo quadro a quadro.

## Exportar para MP4

Dependências gratuitas: **Node.js 18+**, **Puppeteer** (Chrome headless) e **FFmpeg**.

```bash
./scripts/instalar.sh      # ou só: npm install
npm run render             # out/zarko.mp4 — 960x720, 24 fps, 2 ciclos (14 s)
npm run render:hd          # 1440x1080, 3 ciclos
npm run render:clean       # sem grão/scanlines/OSD
```

Opções de `node export/render.mjs`: `--out arquivo.mp4`, `--loops n`, `--frames n`, `--size 1920x1440`, `--crf 16`, `--no-vhs`, `--png-dir quadros/` (também salva cada quadro em PNG).

Se o FFmpeg não estiver instalado no sistema, o script usa o binário do pacote `@ffmpeg-installer/ffmpeg`. Para usar um Chrome que você já tem, defina `CHROME_PATH=/caminho/do/chrome`.

Como funciona: o Puppeteer abre `index.html?export=1`, chama `window.RetroToon.frameDataURL(n)` para cada quadro e envia os PNGs direto, por pipe, para o FFmpeg (`libx264`, `-tune animation`, `yuv420p`).

## Trocar a cena

A linha do tempo fica no objeto `T` dentro de `index.html`: uma lista de keyframes `[quadro, valor, easing]` por propriedade. O trecho rodado em um é definido por `ACTION`, e as cores do personagem estão em `C`.

---

# Série de terror para TikTok: Fita Maldita

`terror/index.html` usa as mesmas técnicas do Zarko (ink & paint, em um e em dois, squash and stretch, smears, VHS) num formato pensado para o TikTok.

## Episódio 1: 3:33

Um menino acorda às 3:33 com a TV ligando sozinha. Na tela, uma figura chega mais perto a cada corte, até bater a mão no vidro. Ele se esconde no cobertor, a TV desliga e vem o silêncio. “Ufa… sumiu?” A figura está atrás da cama.

| Tempo | Momento | Para que serve no TikTok |
|---|---|---|
| 0–3 s | A TV liga sozinha + “NÃO olhe pra ela” | gancho para segurar o polegar |
| 3–8 s | O menino acorda e dois olhos piscam na porta | easter egg que faz rever |
| 8–12 s | A figura se aproxima na TV e bate no vidro | escalada |
| 12–16 s | Close tremendo e coração acelerado | tensão |
| 16–21 s | Silêncio, “Ufa… sumiu?” e a sombra | falso alívio |
| 21–22 s | O susto, em um, com smear e quadro invertido | pico |
| 22–24 s | “Você viu ele na porta?” e volta ao quadro 1 | comentários + loop perfeito |

- **Formato:** 1080×1920 (9:16), 24 fps, 24 s. A imagem fica numa janela 4:3, o formato real da TV e do VHS, com o título da série acima e a legenda numa faixa própria abaixo, fora da área que o TikTok cobre. No susto, a criatura rompe a moldura e ocupa a tela inteira.
- **Loop perfeito:** o último quadro emenda no primeiro (a TV está apagada nos dois), então o vídeo parece não ter fim.
- **Legendas e OSD** ficam dentro da zona segura. Na prévia, marque “Zona segura do TikTok” para ver o que a interface do app cobre.
- **Som sintetizado no próprio código**, sem samples nem direitos autorais: chiado de fita, estática, caixinha de música desafinada, drone, coração, cobertor, rangido, respiração e o acorde do susto. Na prévia, clique em “Som”.

```bash
npm run render:terror      # out/fita-maldita-333.mp4 (vídeo + som AAC)
npm run render:terror:3x   # 3 loops seguidos (72 s)
```

A página expõe `RetroToon.audioWAVBase64()`. O exportador grava a trilha em `.wav` e o FFmpeg junta tudo no MP4.

## Narração (voz neural local, grátis)

A narração é gerada no seu computador com o [Piper](https://github.com/rhasspy/piper), uma voz neural de código aberto em português do Brasil. Não usa serviço pago nem tem restrição de uso comercial.

1. Escreva as falas em `voz/roteiro.json`: `inicio` (segundos, ou `"depois"` para vir logo após a anterior), `fala` (como deve ser dita, com números por extenso), `legenda` (o texto na tela, com `*palavra*` em vermelho), `velocidade` (opcional, maior = mais lento) e `limite` (até quando a fala precisa terminar).
2. Rode `npm run narrar`. Na primeira vez, a voz `pt_BR-faber-medium` (~60 MB) é baixada do Hugging Face.
3. O script gera cada fala, aplica o tratamento de fita (tom mais grave sem mudar a velocidade, banda estreita de VHS, compressão, eco de quarto e oscilação de fita) e grava `terror/narracao.js`. Esse arquivo leva o áudio e os tempos das legendas. Se alguma fala passar do limite, o script avisa.
4. A página mistura a voz com a trilha e abaixa a cena automaticamente quando ela fala (ducking). As legendas seguem a duração real de cada fala.

A voz é gerada com um pouco de variação a cada execução, então o tempo de cada fala pode mudar alguns centésimos de segundo.

## Fazer o próximo episódio

Copie `terror/index.html` e mude:
- `SHOTS`: a decupagem (plano, câmera e zoom por trecho de quadros);
- `T`: as curvas de atuação (olhos, tremor, cobertor, susto…);
- `ONES`: os trechos rodados em um;
- `voz/roteiro.json`: a narração e as legendas (depois rode `npm run narrar`);
- `synth()`: os eventos de som, sincronizados pelos mesmos números de quadro.
