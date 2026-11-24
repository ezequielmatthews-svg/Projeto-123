import re
src = open('terror/corredor.html', encoding='utf-8').read()
def rep(s, a, b):
    assert a in s, 'faltou: ' + a[:80]
    return s.replace(a, b, 1)
A = src.index('/* ============================================================\n   CURVAS E TEMPO')
B = src.index('/* ============================================================\n   LEGENDAS')
s = src[:A] + open('scripts/episodios/regra316.js', encoding='utf-8').read() + '\n' + src[B:]
# configuração
s = rep(s, 'const WIN = { x: 0, y: 165, w: 540, h: 520 };', 'const WIN = { x: 0, y: 160, w: 540, h: 550 };  // imagem grande: quase a tela toda')
s = re.sub(r"const FPS = 24, L = \d+;.*\n", "const FPS = 24, L = 672;   // 28 s (o fim emenda no começo)\n", s, count=1)
s = re.sub(r"const ONES = \[.*?\];.*\n", "const ONES = [[0, 672]];   // realista: movimento a 24 desenhos por segundo\n", s, count=1)
s = rep(s, 'family=Bungee&family=Creepster', 'family=Inter:wght@400;500;600&family=Bungee&family=Creepster')
s = rep(s, "ROOM = paintRoom();", "ROOM = paintRoom(); buildTextures();")
# legendas
a = s.index("const CAPS = NARR ? NARR.legendas : ["); b = s.index("];", a) + 2
s = s[:a] + """const CAPS = NARR ? NARR.legendas : [
  [0, 72, 'SE O CELULAR TOCAR ÀS *3H16*... *NÃO ATENDA*.', 'narrador'],
  [72, 163, 'ONTEM TOCOU. E O NOME NA TELA ERA O MEU. *RAFAEL*.', 'narrador'],
  [163, 230, 'O QUARTO CHEIRAVA A *TERRA MOLHADA*.', 'narrador'],
  [230, 360, 'EU ATENDI. DO OUTRO LADO, CHUVA... E ALGUÉM RESPIRANDO. *NO MEU RITMO*.', 'narrador'],
  [360, 470, '*FICA QUIETO. ELE AINDA NÃO SABE QUE VOCÊ ACORDOU.*', 'coisa'],
  [470, 581, 'ATRÁS DE MIM, O COLCHÃO *AFUNDOU* DEVAGAR.', 'narrador'],
  [581, 672, 'AGORA EU SEI POR QUE A MINHA MÃE DIZIA:', 'narrador'],
];""" + s[b:]
s = re.sub(r"const big = .*?;", "const big = false;", s, count=1)
s = rep(s, "if (!big && words.length > 4) {\n    const n = Math.ceil(words.length / 4)", "if (!big && words.length > 3) {\n    const n = Math.ceil(words.length / 3)")
s = re.sub(r"maxW = \d+, cx = \d+, cy = \d+;", "maxW = 360, cx = 262, cy = 742;", s, count=1)
# moldura e pós realista (sem VHS)
s = rep(s, "g.fillText('CÂMERA 02', LW / 2 + 78, 150);", "g.fillText('REGRA 3H16', LW / 2 + 78, 150);")
a = s.index("function compose(f) {"); b = s.index("/* ============================================================\n   SOM")
s = s[:a] + """const [BL, bctx] = mk(1, 1);
const cgrain = Array.from({ length: 8 }, (_, k) => { const [g, x] = mk(270, 480); const im = x.createImageData(270, 480), Rn = rng(700 + k);
  for (let i = 0; i < im.data.length; i += 4) { const v = (Rn() - .5) * 150; im.data[i] = 128 + v + (Rn() - .5) * 60; im.data[i + 1] = 128 + v + (Rn() - .5) * 40; im.data[i + 2] = 128 + v + (Rn() - .5) * 70; im.data[i + 3] = 255; }
  x.putImageData(im, 0, 0); return g; });
function compose(f) {
  const t = loopT(f);
  drawScene(t, f);
  const g = octx;
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  g.drawImage(scene, 0, 0);
  if (FX) {
    // brilho estourado das luzes (bloom)
    if (BL.width !== W >> 2) { BL.width = W >> 2; BL.height = H >> 2; }
    bctx.filter = 'brightness(1.6) contrast(2.4) blur(5px)'; bctx.clearRect(0, 0, BL.width, BL.height); bctx.drawImage(scene, 0, 0, BL.width, BL.height); bctx.filter = 'none';
    g.globalCompositeOperation = 'screen'; g.globalAlpha = .42; g.drawImage(BL, 0, 0, W, H);
    // borda de lente (aberração cromática leve)
    g.globalAlpha = .05; g.drawImage(scene, 2.2 * R, 0); g.drawImage(scene, -2.2 * R, 0);
    g.globalAlpha = 1;
    // granulado colorido de sensor no escuro
    g.globalCompositeOperation = 'overlay'; g.globalAlpha = .16;
    g.drawImage(cgrain[(hash(f) * cgrain.length) | 0], -h2(f, 4) * 30 * R, -h2(f, 5) * 30 * R, W + 30 * R, H + 30 * R);
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    g.drawImage(vignette, 0, 0);
  }
  drawFrame(g, t);
  drawCaption(g, t);
  if (SAFE && !EXPORT) {
    g.setTransform(R, 0, 0, R, 0, 0);
    g.fillStyle = 'rgba(255,42,61,.28)';
    g.fillRect(0, 0, LW, 110); g.fillRect(0, 760, LW, 200); g.fillRect(470, 380, 70, 380); g.fillRect(0, 0, 46, LH); g.fillRect(LW - 46, 0, 46, LH);
  }
}

""" + s[b:]
s = re.sub(r"const SECTIONS = \[.*?\];", "const SECTIONS = [[0, 79, 'GANCHO'], [79, 163, 'RAFAEL'], [163, 230, 'O QUARTO'], [230, 360, 'ATENDI'], [360, 470, 'A VOZ'], [470, 581, 'O COLCHÃO'], [581, 672, 'EMENDA']];", s, count=1)
s = re.sub(r"<title>.*?</title>", "<title>A Regra das 3h16</title>", s, count=1)
s = re.sub(r"<h1>.*?</h1>", "<h1>A Regra das 3h16</h1>", s, count=1)
s = re.sub(r'(<div class="side">\s*<h1>.*?</h1>\s*)<p>.*?</p>', lambda m: m.group(1) + '<p>Fita Maldita · história completa · modo realista (texturas, luz, foco, câmera na mão) · 9:16, 1080×1920, 28 s · o fim emenda no começo</p>', s, count=1, flags=re.S)
s = re.sub(r'aria-label="Curta de terror:[^"]*"', 'aria-label="Curta de terror realista: o celular toca às 3h16 com o próprio nome de quem dorme"', s, count=1)
s = rep(s, '<script src="sons-corredor.js"></script>\n<script src="narracao-corredor.js"></script>', '<script src="sons-regra316.js"></script>\n<script src="narracao-regra316.js"></script>')
s = rep(s, "<code>npm run render:corredor</code> → <code>out/camera-do-corredor.mp4</code>", "<code>npm run render:regra316</code> → <code>out/a-regra-das-3h16.mp4</code>")
s = re.sub(r'<ol class="beats">.*?</ol>', '''<ol class="beats">
      <li class="hot"><b>0–3,8 s</b><span>O celular vibra na mesinha, às 3:16, chamando “Rafael”. O flash da tela mostra, desfocado no fundo, alguém sentado na beira da cama. “Se o celular tocar às 3h16, não atenda.”</span></li>
      <li><b>3,8–7,6 s</b><span>O porta-retrato: a mãe e o filho, desbotados, piscando na luz azul da vibração.</span></li>
      <li><b>7,6–13 s</b><span>O quarto: chuva na janela, a porta entreaberta, pegadas de terra até a cama, o celular brilhando.</span></li>
      <li><b>13–21 s</b><span>A tela em foco: “Rafael”, com a foto dele mesmo. Ele atende: 00:01, 00:02… alguém respirando.</span></li>
      <li><b>21–26 s</b><span>O olho dele em close, com a tela refletida. “Ele ainda não sabe que você acordou.” O olho foge pra trás.</span></li>
      <li class="hot"><b>26–36 s</b><span>O colchão afunda devagar atrás dele. “Agora eu sei por que a minha mãe dizia:” — e o celular toca de novo às 3:16.</span></li>
    </ol>''', s, flags=re.S)
open('terror/regra316.html', 'w', encoding='utf-8').write(s)
print('ok', len(s))
