#!/usr/bin/env python3
"""
Monta a trilha de efeitos sonoros (sons de fundo) de um episódio a partir de uma folha de efeitos.

  sons/<episodio>/efeitos.json  +  arquivos de áudio (ex.: gerados no ElevenLabs)
      ->  terror/sons-<episodio>.js   (window.SONS = { sr, pcm }), mixado pela página por baixo das vozes

Cada efeito da folha:
  arquivo   áudio (mp3/wav)
  inicio    segundo em que começa (ou "trechos": [[inicio, fim], ...] para repetir em loop nesses trechos)
  volume    em dB depois da normalização (0 = pico em -3 dBFS; -12 = bem mais baixo)
  fade      segundos de fade-in/out nas bordas (padrão 0.05; nos trechos em loop, padrão 0.3)
  corte     opcional: começa o arquivo a partir deste segundo
  pan       opcional: -1 (esquerda) … 0 (centro) … 1 (direita); se algum efeito tiver pan, a trilha sai em estéreo

Uso:
  python3 scripts/sonorizar.py sons/valenca/efeitos.json terror/sons-valenca.js
"""
import array
import base64
import json
import math
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SR = 22050


def load(path: Path, corte: float = 0) -> list:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(corte), "-i", str(path), "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"],
                         capture_output=True, check=True).stdout
    a = array.array("h"); a.frombytes(raw)
    peak = max((abs(v) for v in a), default=1) or 1
    g = .708 / peak  # pico em -3 dBFS
    return [v * g for v in a]


def main():
    folha = ROOT / sys.argv[1]
    saida = ROOT / sys.argv[2]
    spec = json.loads(folha.read_text(encoding="utf-8"))
    dur = float(spec["duracao"])
    n = int(dur * SR)
    stereo = any("pan" in ef for ef in spec["efeitos"])
    mixL, mixR = [0.0] * n, [0.0] * n
    base = folha.parent
    relatorio = []
    for ef in spec["efeitos"]:
        clip = load(base / ef["arquivo"], ef.get("corte", 0))
        g = 10 ** (ef.get("volume", 0) / 20)
        pan = max(-1.0, min(1.0, float(ef.get("pan", 0))))
        ang = (pan + 1) * math.pi / 4                      # pan de potência constante
        gL, gR = (math.cos(ang) * math.sqrt(2), math.sin(ang) * math.sqrt(2)) if stereo else (1.0, 1.0)
        if "trechos" in ef:
            fade = int(ef.get("fade", .3) * SR)
            for a, b in ef["trechos"]:
                i0, i1 = int(a * SR), min(n, int(b * SR))
                L = i1 - i0
                for k in range(L):
                    env = min(1, k / max(1, fade), (L - k) / max(1, fade))
                    v = clip[k % len(clip)] * g * env
                    mixL[i0 + k] += v * gL; mixR[i0 + k] += v * gR
            relatorio.append(f"  {ef['arquivo']:22s} em loop: " + ", ".join(f"{a}–{b}s" for a, b in ef["trechos"]) + f"  ({ef.get('volume', 0):+} dB)")
        else:
            fade = int(ef.get("fade", .05) * SR)
            i0 = int(float(ef["inicio"]) * SR)
            L = min(len(clip), n - i0)
            for k in range(L):
                env = min(1, k / max(1, fade), (L - k) / max(1, fade))
                v = clip[k] * g * env
                mixL[i0 + k] += v * gL; mixR[i0 + k] += v * gR
            relatorio.append(f"  {ef['arquivo']:22s} em {float(ef['inicio']):5.2f}s → {float(ef['inicio']) + L / SR:5.2f}s  ({ef.get('volume', 0):+} dB)" + (f"  pan {pan:+.1f}" if pan else ""))
    peak = max(max(abs(v) for v in mixL), max(abs(v) for v in mixR)) or 1
    if peak > .98:
        mixL = [v * .98 / peak for v in mixL]; mixR = [v * .98 / peak for v in mixR]
    if stereo:   # intercalado: L R L R ...
        inter = [0.0] * (2 * n); inter[0::2] = mixL; inter[1::2] = mixR
    else:
        inter = mixL
    pcm = array.array("h", (int(max(-1, min(1, v)) * 32767) for v in inter)).tobytes()
    saida.write_text(
        f"// Gerado por scripts/sonorizar.py a partir de {folha.relative_to(ROOT)}. Não edite à mão.\n"
        "window.SONS = " + json.dumps({"sr": SR, "ch": 2 if stereo else 1, "pcm": base64.b64encode(pcm).decode()}) + ";\n",
        encoding="utf-8")
    print("Efeitos:\n" + "\n".join(relatorio))
    print(f"pico da trilha: {20 * math.log10(min(peak, .98)):.1f} dBFS")
    print(f"→ {saida.relative_to(ROOT)} ({saida.stat().st_size / 1e6:.1f} MB)")


if __name__ == "__main__":
    main()
