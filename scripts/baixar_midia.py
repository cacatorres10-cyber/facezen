"""Baixa aulas (YouTube) e fotos (Pexels) para o app. Roda no GitHub Actions."""
import json, os, urllib.request, xml.etree.ElementTree as ET

PLAYLIST = 'PLpaATTHUE-tQ_7z1lGp5rbDOKb1lrM1Wq'
AULA_GUIADA = 'MPckU0F4Gig'
PEXELS = [4672662, 8102135, 3865570, 7321312, 5137547, 28112145, 8015877, 4960098]
UA = {'User-Agent': 'Mozilla/5.0 (FaceZen build)'}

os.makedirs('src/assets/aulas', exist_ok=True)
os.makedirs('src/assets/fotos', exist_ok=True)

def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
        return r.read()

def save_img(urls, dest, width):
    for u in urls:
        try:
            data = get(u)
            if len(data) < 3000:
                continue
            open(dest, 'wb').write(data)
            return True
        except Exception as e:
            print('falhou', u, e)
    return False

def thumb(vid):
    base = f'https://i.ytimg.com/vi/{vid}/'
    return save_img([base + 'mqdefault.jpg', base + 'hqdefault.jpg'], f'src/assets/aulas/{vid}.jpg', 640)

ns = {'a': 'http://www.w3.org/2005/Atom', 'yt': 'http://www.youtube.com/xml/schemas/2015', 'media': 'http://search.yahoo.com/mrss/'}
aulas = []
oembed = json.loads(get(f'https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={AULA_GUIADA}&format=json'))
aulas.append({'id': AULA_GUIADA, 'title': oembed['title'], 'channel': oembed['author_name'], 'thumb': thumb(AULA_GUIADA)})

feed = ET.fromstring(get(f'https://www.youtube.com/feeds/videos.xml?playlist_id={PLAYLIST}'))
seen = {AULA_GUIADA}
for e in feed.findall('a:entry', ns):
    vid = e.find('yt:videoId', ns).text
    if vid in seen:
        continue
    seen.add(vid)
    title = e.find('a:title', ns).text
    desc = e.find('media:group/media:description', ns)
    channel = e.find('a:author/a:name', ns).text
    aulas.append({'id': vid, 'title': title, 'channel': channel, 'thumb': thumb(vid),
                  'description': (desc.text or '')[:600] if desc is not None else ''})

json.dump(aulas, open('src/content/aulas.json', 'w'), ensure_ascii=False, indent=2)
print(json.dumps(aulas, ensure_ascii=False, indent=2))

for pid in PEXELS:
    ok = save_img([f'https://images.pexels.com/photos/{pid}/pexels-photo-{pid}.jpeg?auto=compress&cs=tinysrgb&w=1000'], f'src/assets/fotos/pexels-{pid}.jpg', 1000)
    print('pexels', pid, ok)
