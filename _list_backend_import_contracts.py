import pathlib
import re
import collections

root = pathlib.Path('src/pages_backup')
pat = re.compile(r"import\s*\{([^}]*)\}\s*from\s*['\"]backend/([^'\"]+)['\"]")
mods = collections.defaultdict(set)

for p in root.glob('*.js'):
    text = p.read_text(encoding='utf-8', errors='ignore')
    for m in pat.finditer(text):
        names = [n.strip() for n in m.group(1).split(',') if n.strip()]
        mod = m.group(2) + '.jsw'
        for n in names:
            mods[mod].add(n)

for mod in sorted(mods):
    print(f'=== {mod} ===')
    for name in sorted(mods[mod]):
        print(name)
