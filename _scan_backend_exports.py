import re
import pathlib

root = pathlib.Path('.')
files = list(root.glob('src/pages_backup/*.js')) + list(root.glob('src/pages/**/*.js'))

# named imports: import { a, b as c } from 'backend/x.jsw'
named_pat = re.compile(r"import\s*\{([^}]+)\}\s*from\s*['\"]backend/([^'\"]+\.jsw)['\"]")
# dynamic destructured: const { a,b } = await import('backend/x.jsw')
dyn_pat = re.compile(r"\{([^}]+)\}\s*=\s*await\s+import\(\s*['\"]backend/([^'\"]+\.jsw)['\"]\s*\)")

needed = {}  # module -> set(symbol)

for f in files:
    txt = f.read_text(encoding='utf-8', errors='ignore')
    for m in named_pat.finditer(txt):
        syms = [s.strip() for s in m.group(1).split(',') if s.strip()]
        mod = m.group(2)
        for s in syms:
            s = s.split(' as ')[0].strip()
            needed.setdefault(mod, set()).add(s)
    for m in dyn_pat.finditer(txt):
        syms = [s.strip() for s in m.group(1).split(',') if s.strip()]
        mod = m.group(2)
        for s in syms:
            s = s.split(':')[0].strip()
            needed.setdefault(mod, set()).add(s)

missing_modules = []
missing_exports = []

for mod, syms in sorted(needed.items()):
    path_candidates = [root / 'src' / 'backend' / mod, root / 'backend' / mod]
    mod_path = next((p for p in path_candidates if p.exists()), None)
    if not mod_path:
        missing_modules.append(mod)
        continue
    txt = mod_path.read_text(encoding='utf-8', errors='ignore')
    exports = set(re.findall(r"export\s+(?:async\s+)?function\s+([A-Za-z_][A-Za-z0-9_]*)", txt))
    exports |= set(re.findall(r"export\s+const\s+([A-Za-z_][A-Za-z0-9_]*)", txt))
    exports |= set(re.findall(r"export\s+\{([^}]+)\}", txt))
    # flatten export { a, b as c }
    flat = set()
    for e in list(exports):
        if ',' in e or ' as ' in e:
            for p in e.split(','):
                flat.add(p.split(' as ')[0].strip())
        else:
            flat.add(e.strip())
    exports = flat
    for s in sorted(syms):
        if s and s not in exports:
            missing_exports.append((mod, s, str(mod_path)))

print(f'MODULES_REFERENCED {len(needed)}')
print(f'MISSING_MODULES {len(missing_modules)}')
for m in missing_modules:
    print('MISSING_MODULE', m)
print(f'MISSING_EXPORTS {len(missing_exports)}')
for mod, sym, path in missing_exports:
    print(f'MISSING_EXPORT {mod}::{sym} in {path}')
