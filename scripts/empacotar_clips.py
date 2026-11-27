#!/usr/bin/env python3
"""Embute sequências de quadros (JPEG) numa página: window.CLIPS = { nome: [dataURL, ...] }.
O canvas não pode ler imagens de file:// sem "sujar" o export, por isso os quadros vão em base64.
uso: python3 scripts/empacotar_clips.py terror/clips-grimorio1.js A=pasta/A B=pasta/B [--q 82]"""
import base64, io, sys
from pathlib import Path
from PIL import Image
out, args = sys.argv[1], sys.argv[2:]
q = 82
if '--q' in args: q = int(args[args.index('--q') + 1]); args = [a for a in args if a not in ('--q', str(q))]
clips = {}
for a in args:
    name, d = a.split('=', 1)
    fs = sorted(Path(d).glob('*.jpg'))
    lst = []
    for f in fs:
        b = io.BytesIO(); Image.open(f).convert('RGB').save(b, 'JPEG', quality=q, optimize=True)
        lst.append('data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode())
    clips[name] = lst
    print(name, len(lst), 'quadros')
import json
Path(out).write_text('// Gerado por scripts/empacotar_clips.py. Não edite à mão.\nwindow.CLIPS = ' + json.dumps(clips) + ';\n', encoding='utf-8')
print('→', out, round(Path(out).stat().st_size / 1e6, 1), 'MB')
