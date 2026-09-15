"""Rebuild the curated gallery assets from attributed public URLs (requires Pillow)."""
import concurrent.futures
import io
import json
import pathlib
import urllib.request
from PIL import Image

root = pathlib.Path(__file__).resolve().parents[1]
manifest = (root / 'src/projectMedia.js').read_text(encoding='utf-8')
records = json.loads(manifest.split('export const projectMedia=', 1)[1].strip().rstrip(';'))
target = root / 'public/gallery'

def prepare(item):
    name = item['file']
    if pathlib.Path(name).name != name or not name.endswith('.webp'):
        raise ValueError('Unexpected asset filename')
    with urllib.request.urlopen(item['source'], timeout=30) as response:
        original = Image.open(io.BytesIO(response.read())).convert('RGB')
    original.thumbnail((1440, 1000))
    original.save(target / name, 'WEBP', quality=83)
    return name

if __name__ == '__main__':
    target.mkdir(exist_ok=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(prepare, [item for group in records.values() for item in group]))
    print(f'Prepared {len(results)} attributed gallery images.')
