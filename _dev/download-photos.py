# -*- coding: utf-8 -*-
# 批量下载飞书文档实拍照片，下载后按 JFIF 头识别并重命名为 .jpg
import os, subprocess, glob

BASE = r"D:\亚欧非大环线\site\photos"
MAP = {
  'kz': ['PsMab7anEo10kJx7sNacdR3Dnkf','DKYybwyKroDxW1xcavwcsSzonzc','Y1U0bHJuWo1LbJxTwh6cAxyDnug','DBOKbzUn6odeKqxlIL5cjscRnTe','Glr7baBxkotMhsxerJiclVQ5nLc','MPZlbNoXJosi6XxoggzcfRwBnub'],
  'ge': ['MTv7bVdExoPvoCxDGo4cBQTcnQc','QrKvbrQruo2Hfexd1FGcuFD6nIh','CLHZbNtecoGZCzxOuLucYOMlnXd','IwkubKNt1oBrMCxx82uc7xGinRg','MVn5bKC56omPoAxGlvgce2l7nih','Z0pMbLaDJodvpTxsnwLclonbnKe','HMBab0AuhoPNIIxni7rcckMtnxh'],
  'am': ['T1MxbybPhoR402xzgOpcw3nRnll','TmnUbjZztoJR4kx4VspckSFMnuc','KOz2beFdFoRdoWxTi40cQcPunnh','KHMpbVlTMosQETxq4JMc2UO8nre','FciLbUMTBoJ8b8xkcmgcfQTsnsf'],
  'tr': ['N3VlblWMUoOkqOxmzo4c3dDLnFh','CLChbgJRWoYWEcxx36jcXdmKnCS','FbI6bPWPSoynT1xOyuwclzRan2c','UfN0bhovkoKdh6xseI3c5k7lnMg','EjpMb29Mkoay7kxMKjrcb8LrniQ','SKZvbqBTIopDHGxnLDUcgRjjnFf','CIEfblFo1o7A5TxrSpRc8vtanNe'],
  'eg': ['TIMfbwBQnosh06xT0PpcAnS8nCc','Q01gbCrWYoQnMnxcAe0cfhVznQg','SV1WbUqWgoF7j0xtktVc6xX7nod','VaSqb6euWo0mhNxF35DcJLCUnVf','N7CnbRAcToHerJxYD9Dc19wknhh','XwJlbqjk6oAFDUx3LeGchfYKnng'],
  'ae': ['MceJb42BHoZIuOxMEllcsocEngb','IdjfbmZ9ro0r8IxCl6wcKElHnpc','Tb50bZUZKof5JjxjmLOcEvmOnBb','IkiibesMaoKms4x1YcRciX0Cncf'],
}

os.makedirs(BASE, exist_ok=True)
for country, toks in MAP.items():
    d = os.path.join(BASE, country)
    os.makedirs(d, exist_ok=True)
    for i, tok in enumerate(toks, 1):
        out = os.path.join(d, f"img{i}")
        r = subprocess.run(['lark-cli','docs','+media-download','--token',tok,'--output',out,'--as','user'],
                           capture_output=True, text=True, encoding='utf-8', errors='replace')
        saved = None
        if r.returncode == 0:
            try:
                import json
                j = json.loads(r.stdout)
                saved = j.get('data', {}).get('saved_path')
            except Exception:
                saved = out
        if saved and os.path.exists(saved):
            # 按内容识别类型：JPEG -> .jpg
            with open(saved, 'rb') as f:
                head = f.read(4)
            ext = '.jpg' if head[:2] == b'\xff\xd8' else ('.png' if head[:4] == b'\x89PNG' else os.path.splitext(saved)[1] or '.bin')
            final = os.path.join(d, f"img{i}{ext}")
            if saved != final:
                os.replace(saved, final)
            print(f"OK   {country} img{i}{ext}  {os.path.getsize(final)} bytes")
        else:
            msg = (r.stdout or r.stderr or '').strip().replace('\n',' ')[:200]
            print(f"FAIL {country} img{i} :: {msg}")
