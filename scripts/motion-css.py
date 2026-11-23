"""Converte @media (prefers-reduced-motion: ...) em regras ligadas ao estado do site (<html data-motion>).

Para cada bloco:
- reduce        -> :root[data-motion="reduced"] <seletor>
- no-preference -> :root[data-motion="full"] <seletor>
e mantém o @media original com :root:not([data-motion]) <seletor> (reserva sem JavaScript).
Idempotente: blocos já convertidos (com data-motion) são ignorados.
"""
import re, sys, pathlib

def find_block(css, start):
    """Índice do '}' que fecha o '{' em css[start]."""
    depth = 0
    for i in range(start, len(css)):
        if css[i] == "{": depth += 1
        elif css[i] == "}":
            depth -= 1
            if depth == 0: return i
    raise ValueError("chaves desbalanceadas")

def prefix_selector(sel, attr):
    sel = sel.strip()
    if sel.startswith(":root"):
        return ":root" + attr + sel[len(":root"):]
    if sel.startswith(".js"):
        return ":root.js" + attr + sel[len(".js"):]
    return f":root{attr} {sel}"

def prefix_rules(body, attr):
    out, i = [], 0
    while i < len(body):
        j = body.find("{", i)
        if j < 0: out.append(body[i:]); break
        k = find_block(body, j)
        head = body[i:j]
        lead = head[: len(head) - len(head.lstrip())]
        sels = ", ".join(prefix_selector(s, attr) for s in head.split(",") if s.strip())
        out.append(f"{lead}{sels} {body[j:k + 1]}")
        i = k + 1
    return "".join(out)

def convert(css):
    pattern = re.compile(r"@media\s*\(\s*prefers-reduced-motion\s*:\s*(reduce|no-preference)\s*\)\s*\{")
    out, pos = [], 0
    for m in pattern.finditer(css):
        if m.start() < pos: continue
        open_i = m.end() - 1
        close_i = find_block(css, open_i)
        body = css[open_i + 1:close_i]
        if "data-motion" in body:
            continue
        attr = '[data-motion="reduced"]' if m.group(1) == "reduce" else '[data-motion="full"]'
        site = prefix_rules(body, attr).strip()
        fallback = prefix_rules(body, ":not([data-motion])").strip()
        out.append(css[pos:m.start()])
        out.append(f"/* movimento: {m.group(1)} (estado do site + reserva sem JS) */\n{site}\n@media (prefers-reduced-motion: {m.group(1)}) {{ {fallback} }}")
        pos = close_i + 1
    out.append(css[pos:])
    return "".join(out)

for path in sys.argv[1:]:
    p = pathlib.Path(path)
    css = p.read_text(encoding="utf8")
    new = convert(css)
    if new != css:
        p.write_text(new, encoding="utf8")
        print("convertido", path)
