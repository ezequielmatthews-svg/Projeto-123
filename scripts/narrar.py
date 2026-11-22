#!/usr/bin/env python3
"""
Gera a narração de um episódio da Fita Maldita, 100% local e grátis.

  voz/roteiro.json  ->  falas gravadas ("arquivo", ex.: ElevenLabs) ou Piper (voz neural local)
                    ->  terror/narracao.js  (áudio + tempos das legendas, lido pela página)

Cada fala pode ter: personagem (narrador | menino | criatura, define a cor da legenda),
arquivo (áudio pronto) ou arquivos (várias vozes juntas), efeito ("imitacao"), pausa_max (encurta pausas internas, em s), tempo (acelera sem mudar o tom).

Uso:
  python3 scripts/narrar.py [--roteiro voz/roteiro.json] [--saida terror/narracao.js]

Precisa de: pip install piper-tts  e  ffmpeg (com o filtro rubberband).
A voz (voz/pt_BR-faber-medium.onnx, ~60 MB) é baixada do Hugging Face na primeira vez.
"""
import argparse
import array
import base64
import json
import math
import shutil
import subprocess
import sys
import tempfile
import urllib.request
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FPS, FRAMES = 24, 576          # mesma linha do tempo da página (24 s)
SR = 22050                     # taxa nativa da voz do Piper
VOICE_URL = "https://huggingface.co/rhasspy/piper-voices/resolve/main/pt/pt_BR/{name}/{q}/{voice}.onnx"


def ensure_voice(voice: str) -> Path:
    model = ROOT / "voz" / f"{voice}.onnx"
    if model.exists() and (model.with_suffix(".onnx.json")).exists():
        return model
    lang, name, q = voice.split("-")
    base = VOICE_URL.format(name=name, q=q, voice=voice)
    for url, dest in ((base, model), (base + ".json", model.with_suffix(".onnx.json"))):
        if not dest.exists():
            print(f"Baixando {dest.name}…")
            urllib.request.urlretrieve(url, dest)
    return model


def piper(model: Path, text: str, length_scale: float, out: Path):
    subprocess.run(
        [sys.executable, "-m", "piper", "-m", str(model), "-f", str(out),
         "--length-scale", f"{length_scale:.3f}", "--noise-scale", "0.6", "--noise-w-scale", "0.75"],
        input=text.encode("utf-8"), check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def vhs(src: Path, dst: Path, pitch: float, echo: bool):
    chain = [
        f"rubberband=pitch={pitch}:formant=preserved",   # mais grave, sem mudar a velocidade
        "highpass=f=150", "lowpass=f=5200",               # banda estreita de VHS
        "acompressor=threshold=-22dB:ratio=3:attack=5:release=150:makeup=2",
    ]
    if echo:
        chain.append("aecho=0.85:0.6:55|130:0.22|0.12")     # quarto pequeno
    # oscilação de fita (wow/flutter). Fica no fim: antes dos filtros ele faz o
    # highpass/lowpass do FFmpeg divergir e saturar o áudio inteiro.
    chain += ["vibrato=f=0.9:d=0.05", f"aresample={SR}"]
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-af", ",".join(chain),
                    "-ac", "1", "-ar", str(SR), "-sample_fmt", "s16", str(dst)], check=True)


EFEITOS = {
    # a criatura imitando alguém: um pouco mais grave e com uma ondulação metálica sutil
    "imitacao": ["rubberband=pitch=0.93:formant=preserved", "flanger=delay=1.5:depth=2.5:regen=-20:width=55:speed=0.35"],
    # a criatura de verdade: bem mais grave (formantes junto, voz "grande"), metálica e com um eco curto de corredor
    "criatura": ["rubberband=pitch=0.8", "flanger=delay=2:depth=4:regen=-30:width=70:speed=0.25", "aecho=0.8:0.55:45|90:0.3|0.15"],
}


def gravado(src: Path, dst: Path, pausa_max: float, tempo: float, efeito: str = ""):
    """Áudio já gravado (ex.: ElevenLabs): encurta pausas longas internas e, se pedido, acelera sem mudar o tom."""
    chain = list(EFEITOS.get(efeito, []))
    if pausa_max:
        chain.append(f"silenceremove=stop_periods=-1:stop_duration={pausa_max}:stop_threshold=-42dB:stop_silence={pausa_max * .8:.2f}")
    if tempo and tempo != 1:
        chain.append(f"atempo={tempo}")
    chain.append(f"aresample={SR}")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-af", ",".join(chain),
                    "-ac", "1", "-ar", str(SR), "-sample_fmt", "s16", str(dst)], check=True)


def read_wav(path: Path, tail: float = .25) -> array.array:
    with wave.open(str(path)) as w:
        assert w.getframerate() == SR and w.getnchannels() == 1 and w.getsampwidth() == 2
        a = array.array("h"); a.frombytes(w.readframes(w.getnframes()))
    # corta o silêncio do começo e do fim
    peak0 = max((abs(v) for v in a), default=1) or 1
    thr = peak0 * .04
    i0 = next((i for i, v in enumerate(a) if abs(v) > thr), 0)
    i1 = len(a) - next((i for i, v in enumerate(reversed(a)) if abs(v) > thr), 0)
    pad = int(.03 * SR)
    a = a[max(0, i0 - pad):min(len(a), i1 + int(tail * SR))]  # mantém a cauda do eco
    # cada fala no mesmo volume médio (RMS -18 dB), com o pico limitado a -1,5 dB:
    # assim os sussurros não ficam mais baixos que as falas normais
    peak = max((abs(v) for v in a), default=1) or 1
    act = [v for v in a if abs(v) > peak * .05] or [1]
    rms = math.sqrt(sum(v * v for v in act) / len(act))
    g = min(.126 * 32767 / rms, .84 * 32767 / peak)
    return array.array("h", (int(v * g) for v in a))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--roteiro", default="voz/roteiro.json")
    ap.add_argument("--saida", default="terror/narracao.js")
    a = ap.parse_args()
    if not shutil.which("ffmpeg"):
        sys.exit("ffmpeg não encontrado.")
    script = json.loads((ROOT / a.roteiro).read_text(encoding="utf-8"))
    fx = script.get("tratamento", {})
    model = None
    frames = int(script.get("frames", FRAMES))

    total = int(frames / FPS * SR)
    track = [0] * total
    captions, report, prev_end = [], [], 0.0
    with tempfile.TemporaryDirectory() as tmp:
        for i, line in enumerate(script["falas"]):
            raw, proc = Path(tmp) / f"{i}.wav", Path(tmp) / f"{i}_fx.wav"
            tail = .25
            arquivos = line.get("arquivos") or ([line["arquivo"]] if line.get("arquivo") else [])
            if arquivos:  # fala gravada (ElevenLabs etc.); várias = vozes juntas, em uníssono
                tail = .12
                partes = []
                for k, arq in enumerate(arquivos):
                    pk = Path(tmp) / f"{i}_{k}_fx.wav"
                    gravado(ROOT / arq, pk, line.get("pausa_max", 0), line.get("tempo", 1.0), line.get("efeito", ""))
                    partes.append(read_wav(pk, tail))
                n = max(len(x) for x in partes)
                g = 1.0 if len(partes) == 1 else .7
                pcm = array.array("h", (max(-32768, min(32767, int(sum(x[j] for x in partes if j < len(x)) * g))) for j in range(n)))
            else:                    # fala sintetizada aqui com o Piper
                model = model or ensure_voice(script.get("voz", "pt_BR-faber-medium"))
                piper(model, line["fala"], fx.get("velocidade", 1.1) * line.get("velocidade", 1.0), raw)
                vhs(raw, proc, fx.get("tom", .85), fx.get("eco", True))
                pcm = read_wav(proc, tail)
            dur = len(pcm) / SR
            start = prev_end + .08 if line["inicio"] == "depois" else float(line["inicio"])
            if start < prev_end:
                report.append(f"  ! fala {i + 1} empurrada de {start:.2f}s para {prev_end:.2f}s (a anterior ainda não acabou)")
                start = prev_end
            end = start + dur
            lim = line.get("limite")
            if lim and end - tail > lim:  # a cauda pode passar
                report.append(f"  ! fala {i + 1} termina em {end:.2f}s, depois do limite {lim:.2f}s: encurte o texto ou aumente a velocidade")
            o = int(start * SR)
            for k, v in enumerate(pcm):
                if o + k < total:
                    track[o + k] = max(-32768, min(32767, track[o + k] + v))
            speech_end = end - tail + .05  # sem a cauda
            captions.append([math.floor(start * FPS), math.ceil(speech_end * FPS) + 10, line["legenda"], line.get("personagem", "narrador")])
            report.append(f"  {i + 1}. {start:5.2f}s → {end:5.2f}s  ({dur:.2f}s)  [{line.get('personagem', 'narrador')}] {line['fala']}")
            prev_end = speech_end

    # legenda fica pelo menos 1 s na tela, sem invadir a próxima
    for i, cap in enumerate(captions):
        cap[1] = max(cap[1], cap[0] + FPS)
        if i + 1 < len(captions):
            cap[1] = min(cap[1], captions[i + 1][0])
        cap[1] = min(cap[1], frames)

    pcm = array.array("h", track).tobytes()
    out = ROOT / a.saida
    out.write_text(
        "// Gerado por scripts/narrar.py a partir de voz/roteiro.json. Não edite à mão.\n"
        "window.NARRACAO = " + json.dumps({"sr": SR, "frames": frames, "legendas": captions,
                                           "pcm": base64.b64encode(pcm).decode()}, ensure_ascii=False) + ";\n",
        encoding="utf-8")
    print("Narração:\n" + "\n".join(report))
    print(f"→ {out.relative_to(ROOT)} ({out.stat().st_size / 1e6:.1f} MB)")


if __name__ == "__main__":
    main()
