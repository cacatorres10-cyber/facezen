"""Aulas em vídeo do Curso: troca os títulos provisórios ("Aula 01"...) em src/content/videoLessons.ts
pelo título do YouTube e baixa a capa de cada vídeo para src/assets/aulas-video/<código>.jpg.
Roda no GitHub Actions (workflow "Atualizar títulos das aulas")."""
import json, os, re, urllib.request

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

# Capas: uma por vídeo, para aparecer mesmo onde o YouTube é bloqueado.
os.makedirs('src/assets/aulas-video', exist_ok=True)
for vid in sorted(set(re.findall(r"youtube: '[^']*?(?:youtu\.be/|v=|/embed/|/shorts/)([\w-]{11})", out))):
    dest = f'src/assets/aulas-video/{vid}.jpg'
    if os.path.exists(dest):
        continue
    for name in ('maxresdefault', 'sddefault', 'hqdefault'):
        try:
            req = urllib.request.Request(f'https://i.ytimg.com/vi/{vid}/{name}.jpg', headers={'User-Agent': 'Mozilla/5.0 (FaceZen build)'})
            with urllib.request.urlopen(req, timeout=30) as r:
                data = r.read()
            if len(data) > 3000:
                open(dest, 'wb').write(data)
                print('capa', vid, name)
                break
        except Exception as e:
            print('sem', name, vid, e)
