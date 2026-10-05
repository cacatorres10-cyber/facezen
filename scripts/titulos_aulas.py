"""Troca os títulos provisórios ("Aula 01"...) em src/content/videoLessons.ts pelo título do vídeo no YouTube.
Roda no GitHub Actions (workflow "Atualizar títulos das aulas")."""
import json, re, urllib.request

PATH = 'src/content/videoLessons.ts'
src = open(PATH, encoding='utf-8').read()

def title(url):
    req = urllib.request.Request(f'https://www.youtube.com/oembed?url={url}&format=json', headers={'User-Agent': 'Mozilla/5.0 (FaceZen build)'})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())['title'].strip()

def repl(m):
    url = m.group(3)
    try:
        t = title(url)
    except Exception as e:
        print('falhou', url, e)
        return m.group(0)
    t = t.replace('\\', '').replace("'", '’')
    print(m.group(2), '→', t)
    return f"{m.group(1)}title: '{t}', youtube: '{url}'"

# Só troca títulos provisórios no formato "Aula NN".
out = re.sub(r"(\{ id: '[^']+', (?:module: '[^']+', )?)title: '(Aula \d+)', youtube: '([^']+)'", repl, src)
open(PATH, 'w', encoding='utf-8').write(out)
