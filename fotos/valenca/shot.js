const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + __dirname + '/fotos.html'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
  for (const i of [0, 1, 2]) await (await p.$('#p' + i)).screenshot({ path: __dirname + `/valenca-evidencia-${i + 1}.png` });
  await b.close(); })();
