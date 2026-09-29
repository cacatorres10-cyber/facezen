"""Baixa as fotos (Pexels) para o app. Roda no GitHub Actions."""
import os, urllib.request

PEXELS = [4672662, 8102135, 3865570, 7321312, 5137547, 28112145, 8015877, 4960098]
UA = {'User-Agent': 'Mozilla/5.0 (FaceZen build)'}

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

for pid in PEXELS:
    ok = save_img([f'https://images.pexels.com/photos/{pid}/pexels-photo-{pid}.jpeg?auto=compress&cs=tinysrgb&w=1000'], f'src/assets/fotos/pexels-{pid}.jpg', 1000)
    print('pexels', pid, ok)
