#!/usr/bin/env bash
# Instala tudo o que é preciso para exportar a animação em MP4 (tudo gratuito):
#   Node.js 18+  ·  Puppeteer (com Chrome headless)  ·  FFmpeg
set -euo pipefail
cd "$(dirname "$0")/.."

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js não encontrado. Instale a versão LTS em https://nodejs.org (ou: brew install node / sudo apt install nodejs npm / winget install OpenJS.NodeJS.LTS)."
  exit 1
fi
NODE_MAJOR=$(node -p 'process.versions.node.split(".")[0]')
if [ "$NODE_MAJOR" -lt 18 ]; then echo "Precisa de Node.js 18 ou mais novo (você tem $(node -v))."; exit 1; fi

if command -v ffmpeg >/dev/null 2>&1; then
  echo "✓ FFmpeg do sistema: $(ffmpeg -version | head -1)"
else
  echo "• FFmpeg não está no sistema; será usado o binário estático do pacote @ffmpeg-installer/ffmpeg."
  echo "  (Opcional: brew install ffmpeg  |  sudo apt install ffmpeg  |  winget install Gyan.FFmpeg)"
fi

if command -v python3 >/dev/null 2>&1; then
  echo "• Instalando a voz neural local (Piper) para a narração…"
  python3 -m pip install -q piper-tts || echo "  (não foi possível instalar o piper-tts; a narração já gerada continua funcionando)"
else
  echo "• Python 3 não encontrado: a narração já gerada funciona, mas para regravar instale Python 3 e rode: pip install piper-tts"
fi

echo "• Instalando dependências npm (Puppeteer baixa um Chrome headless, ~150 MB)…"
npm install

echo
echo "Tudo pronto. Para gerar o vídeo:"
echo "  npm run render        → out/zarko.mp4 (960x720, 14 s)"
echo "  npm run render:hd     → 1440x1080, 21 s"
echo "  npm run render:clean  → sem efeitos VHS"
echo "  npm run narrar        → regrava a narração da Fita Maldita (voz/roteiro.json)"
echo "  npm run render:terror → out/fita-maldita-333.mp4"
