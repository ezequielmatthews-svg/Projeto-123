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
