import re
src = open('terror/corredor.html', encoding='utf-8').read()
def rep(s, a, b):
    assert a in s, 'faltou: ' + a[:80]
    return s.replace(a, b, 1)
A = src.index('/* ============================================================\n   CURVAS E TEMPO')
B = src.index('/* ============================================================\n   LEGENDAS')
s = src[:A] + open('scripts/episodios/grimorio1.js', encoding='utf-8').read() + '\n' + src[B:]
# configuração
s = rep(s, 'const WIN = { x: 0, y: 165, w: 540, h: 520 };', 'const WIN = { x: 0, y: 160, w: 540, h: 550 };  // imagem grande: quase a tela toda')
s = re.sub(r"const FPS = 24, L = \d+;.*\n", "const FPS = 24, L = 720;   // 30 s (o fim emenda no começo)\n", s, count=1)
s = re.sub(r"const ONES = \[.*?\];.*\n", "const ONES = [[0, 720]];   // gravura: movimento a 24 desenhos por segundo\n", s, count=1)
s = rep(s, 'family=Bungee&family=Creepster', 'family=Inter:wght@400;500;600&family=IM+Fell+English&family=IM+Fell+English+SC&family=Bungee&family=Creepster')
s = rep(s, "ROOM = paintRoom();", "ROOM = paintRoom(); buildTextures();")
# legendas
a = s.index("const CAPS = NARR ? NARR.legendas : ["); b = s.index("];", a) + 2
s = s[:a] + """const CAPS = NARR ? NARR.legendas : [
  [0, 53, 'ISSO É UM *ANJO*. SEGUNDO A BÍBLIA.', 'narrador'],
  [53, 216, 'O PROFETA EZEQUIEL VIU RODAS DENTRO DE RODAS... COM OS AROS *CHEIOS DE OLHOS*.', 'narrador'],
  [216, 360, 'ELAS ANDAVAM PARA OS *QUATRO LADOS* SEM SE VIRAR. PARA ONDE O ESPÍRITO IA, AS RODAS IAM.', 'narrador'],
  [360, 552, 'NA TRADIÇÃO, ELES SÃO OS *TRONOS*: A TERCEIRA ORDEM DOS ANJOS. ACIMA DELES, SÓ QUERUBINS E SERAFINS.', 'narrador'],
  [552, 672, 'ELES NÃO TÊM ROSTO. SÓ OLHOS. E TODOS *OLHAM PRA VOCÊ*.', 'narrador'],
  [672, 720, 'COMENTA QUAL ANJO EU EXPLICO AMANHÃ:', 'narrador'],
];""" + s[b:]
s = re.sub(r"const big = .*?;", "const big = false;", s, count=1)
s = rep(s, "if (!big && words.length > 4) {\n    const n = Math.ceil(words.length / 4)", "if (!big && words.length > 3) {\n    const n = Math.ceil(words.length / 3)")
s = re.sub(r"maxW = \d+, cx = \d+, cy = \d+;", "maxW = 360, cx = 262, cy = 742;", s, count=1)
# moldura e pós realista (sem VHS)
s = rep(s, "g.fillText('CÂMERA 02', LW / 2 + 78, 150);", "g.fillText('GRIMÓRIO Nº 1', LW / 2 + 78, 150);")
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
    bctx.filter = 'brightness(1.3) contrast(2.8) blur(5px)'; bctx.clearRect(0, 0, BL.width, BL.height); bctx.drawImage(scene, 0, 0, BL.width, BL.height); bctx.filter = 'none';
    g.globalCompositeOperation = 'screen'; g.globalAlpha = .18; g.drawImage(BL, 0, 0, W, H);
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
s = re.sub(r"const SECTIONS = \[.*?\];", "const SECTIONS = [[0, 53, 'GANCHO'], [53, 216, 'EZEQUIEL'], [216, 360, 'QUATRO LADOS'], [360, 552, '3º DE 9'], [552, 672, 'OS OLHOS'], [672, 720, 'COMENTA']];", s, count=1)
s = re.sub(r"<title>.*?</title>", "<title>Grimório Nº 1 · Ofanim</title>", s, count=1)
s = re.sub(r"<h1>.*?</h1>", "<h1>Grimório Nº 1 · Ofanim</h1>", s, count=1)
s = re.sub(r'(<div class="side">\s*<h1>.*?</h1>\s*)<p>.*?</p>', lambda m: m.group(1) + '<p>Fita Maldita · Grimório (série explicativa) · gravura de grimório: pergaminho, tinta, folha de ouro, luz de vela · 9:16, 1080×1920, 30 s · o fim emenda no começo</p>', s, count=1, flags=re.S)
s = re.sub(r'aria-label="Curta de terror:[^"]*"', 'aria-label="Grimório nº 1: os Ofanim, as rodas cheias de olhos de Ezequiel, terceira ordem dos anjos"', s, count=1)
s = rep(s, '<script src="sons-corredor.js"></script>\n<script src="narracao-corredor.js"></script>', '<script src="sons-grimorio1.js"></script>\n<script src="narracao-grimorio1.js"></script>')
s = rep(s, "<code>npm run render:corredor</code> → <code>out/camera-do-corredor.mp4</code>", "<code>npm run render:grimorio1</code> → <code>out/grimorio-01-ofanim.mp4</code>")
s = re.sub(r'<ol class="beats">.*?</ol>', '''<ol class="beats">
      <li class="hot"><b>0–2 s</b><span>Duas rodas de ouro girando uma dentro da outra; os olhos dos aros abrem todos de uma vez. “Isso é um anjo. Segundo a Bíblia.”</span></li>
      <li><b>2–9 s</b><span>A página de Ezequiel 1 sendo escrita à mão: “uma roda no meio de outra roda… os aros cheios de olhos”.</span></li>
      <li><b>9–15 s</b><span>Sobre uma rosa dos ventos, as rodas vão para os quatro lados sem virar.</span></li>
      <li><b>15–23 s</b><span>A escada das 9 ordens: a câmera sobe dos Anjos (9º) até os Tronos, que acendem em ouro: 3º DE 9.</span></li>
      <li class="hot"><b>23–30 s</b><span>Close: os olhos param todos e encaram a câmera. Cartão “Grimório Nº 1 · Ofanim · 3º de 9”. Recomeça.</span></li>
    </ol>''', s, flags=re.S)
open('terror/grimorio1.html', 'w', encoding='utf-8').write(s)
print('ok', len(s))
