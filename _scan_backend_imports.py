import re
import pathlib

root = pathlib.Path('.')
files = list(root.glob('src/pages_backup/*.js')) + list(root.glob('src/pages/**/*.js'))
pattern = re.compile(r"from\s+['\"]backend/([^'\"]+\.jsw)['\"]|import\(\s*['\"]backend/([^'\"]+\.jsw)['\"]\s*\)")

imports = []
for f in files:
    text = f.read_text(encoding='utf-8', errors='ignore')
    for m in pattern.finditer(text):
        mod = m.group(1) or m.group(2)
        imports.append((str(f), mod))

mods = sorted(set(m for _, m in imports))
missing = []
for m in mods:
    a = root / 'src' / 'backend' / m
    b = root / 'backend' / m
    if not a.exists() and not b.exists():
        missing.append(m)

print(f'TOTAL_IMPORTS {len(imports)}')
print(f'UNIQUE_MODULES {len(mods)}')
print(f'MISSING {len(missing)}')
for m in missing:
    print(m)
