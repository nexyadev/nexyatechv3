"""Converte cores fixas dos CSS em tokens de tema (claro/escuro). Roda uma vez; idempotente.

Regras (por declaração):
- sombras (box-shadow, text-shadow, filter): rgba(20,20,20,a) -> rgba(var(--shadow-rgb), a)
- demais: rgba(20,20,20,a) -> rgba(var(--ink-rgb), a); rgba(255,255,255,a) -> rgba(var(--glass-rgb), a);
  rgba(244,244,242,a) -> rgba(var(--paper-rgb), a)
- hex: #141414/#111/#111111 -> var(--ink); #000 (fundo de botão) -> var(--ink-strong); #fff em `color` -> var(--on-ink),
  #fff em fundos/bordas -> var(--surface); #f4f4f2 -> var(--paper); #ecece9 -> var(--surface-2);
  #4a4a48 -> var(--ink-2); #5e5e5c -> var(--ink-3)
Mockups (notebook, celular, telas, vídeos, miniaturas) ficam intactos: são grafite nos dois temas.
"""
import re, sys, pathlib

DEVICE = re.compile(r"laptop|phone|lid\b|\.lid|screen|\.base|devices|device|windowDots|windowControls|deviceBottom|dashboardImage|orderScreen|\.shot|\.sat|satCrop|phoneBody|galleryFrame|videoFrame|\.play|\.preview|\.thumb|indexThumb|videoLive|hero-letter|smart-cursor|silk-")
SHADOW_PROPS = ("box-shadow", "text-shadow", "filter", "-webkit-filter")

def rgba(m, var):
    return f"rgba(var({var}), {m.group(1)})"

def convert_value(prop, value):
    # Não mexe dentro de url(...) (ex.: SVG embutido do grão).
    parts = re.split(r"(url\([^)]*\))", value)
    out = []
    for part in parts:
        if part.startswith("url("):
            out.append(part); continue
        if prop in SHADOW_PROPS:
            part = re.sub(r"rgba\(\s*20\s*,\s*20\s*,\s*20\s*,\s*([\d.]+)\s*\)", lambda m: rgba(m, "--shadow-rgb"), part)
        else:
            part = re.sub(r"rgba\(\s*20\s*,\s*20\s*,\s*20\s*,\s*([\d.]+)\s*\)", lambda m: rgba(m, "--ink-rgb"), part)
            part = re.sub(r"rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*([\d.]+)\s*\)", lambda m: rgba(m, "--glass-rgb"), part)
            part = re.sub(r"rgba\(\s*244\s*,\s*244\s*,\s*242\s*,\s*([\d.]+)\s*\)", lambda m: rgba(m, "--paper-rgb"), part)
            part = re.sub(r"#(?:141414|111111|111)\b", "var(--ink)", part, flags=re.I)
            part = re.sub(r"#000(?:000)?\b", "var(--ink-strong)", part)
            if prop == "color":
                part = re.sub(r"#(?:ffffff|fff)\b", "var(--on-ink)", part, flags=re.I)
            else:
                part = re.sub(r"#(?:ffffff|fff)\b", "var(--surface)", part, flags=re.I)
            part = re.sub(r"#f4f4f2\b", "var(--paper)", part, flags=re.I)
            part = re.sub(r"#ecece9\b", "var(--surface-2)", part, flags=re.I)
            part = re.sub(r"#4a4a48\b", "var(--ink-2)", part, flags=re.I)
            part = re.sub(r"#5e5e5c\b", "var(--ink-3)", part, flags=re.I)
        out.append(part)
    return "".join(out)

def convert_block(m):
    selector, body = m.group(1), m.group(2)
    if DEVICE.search(selector) or selector.strip().startswith(":root") or "@" in selector.split("\n")[-1] and "{" in selector:
        return m.group(0)
    def decl(d):
        prop, value = d.group(1), d.group(2)
        return f"{prop}:{convert_value(prop.strip().lower(), value)}"
    body = re.sub(r"([a-zA-Z-]+)\s*:([^;{}]+)", decl, body)
    return f"{selector}{{{body}}}"

for path in sys.argv[1:]:
    p = pathlib.Path(path)
    css = p.read_text(encoding="utf8")
    new = re.sub(r"([^{}]+)\{([^{}]*)\}", convert_block, css)
    if new != css:
        p.write_text(new, encoding="utf8")
        print("tokenized", path)
