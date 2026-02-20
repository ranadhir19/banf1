import re
import pathlib

root = pathlib.Path('.')
files = list(root.glob('src/pages_backup/*.js')) + list(root.glob('src/pages/**/*.js'))

import_line = re.compile(r"^\s*import\s*\{([^}]+)\}\s*from\s*['\"]backend/([^'\"]+\.jsw)['\"]")
dyn_line = re.compile(r"\{([^}]+)\}\s*=\s*await\s+import\(\s*['\"]backend/([^'\"]+\.jsw)['\"]\s*\)")

needed = {}
for f in files:
    for line in f.read_text(encoding='utf-8', errors='ignore').splitlines():
        m = import_line.search(line)
        if m:
            syms = [s.strip() for s in m.group(1).split(',') if s.strip()]
            mod = m.group(2)
            for s in syms:
                needed.setdefault(mod, set()).add(s.split(' as ')[0].strip())
        m2 = dyn_line.search(line)
        if m2:
            syms = [s.strip() for s in m2.group(1).split(',') if s.strip()]
            mod = m2.group(2)
            for s in syms:
                needed.setdefault(mod, set()).add(s.split(':')[0].strip())

missing_exports = []
for mod, syms in sorted(needed.items()):
    mod_path = root / 'backend' / mod
    if not mod_path.exists():
        continue
    txt = mod_path.read_text(encoding='utf-8', errors='ignore')
    exports = set(re.findall(r"export\s+(?:async\s+)?function\s+([A-Za-z_][A-Za-z0-9_]*)", txt))
    exports |= set(re.findall(r"export\s+const\s+([A-Za-z_][A-Za-z0-9_]*)", txt))
    for s in sorted(syms):
        if s and s not in exports:
            missing_exports.append((mod, s))

print('MISSING_EXPORTS', len(missing_exports))
for mod, sym in missing_exports:
    print(f'  {mod}::{sym}')
