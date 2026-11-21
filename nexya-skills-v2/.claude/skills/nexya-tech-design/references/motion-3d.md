# Receitas de motion e 3D — NEXYA

Use como ponto de partida e adapte às convenções do projeto. Sempre: lazy load, reduced-motion, cleanup.

---

## 1. Abertura da logo (≤ 1,2s, sem bloquear)

SVG inline de `public/brand/nexya-logo-escuro.svg` (letras com ids próprios).

Sequência:
1. Cada letra: `stroke` branco fino desenhado com `stroke-dasharray/dashoffset` (`getTotalLength()`), escalonado 50ms por letra.
2. `fill-opacity 0 → 1` do preenchimento prata a partir de ~0,6s; o stroke some.
3. Reflexo: `<rect>` com gradiente branco transparente→branco→transparente, recortado por `clipPath` com as letras, atravessando da esquerda para a direita.
4. `#nx-adot` acende por último (opacidade + leve glow).
5. Tagline com fade; `#nx-hairline-l/r` com `scaleX` a partir do centro.
6. Título e CTAs entram em paralelo (CSS `animation`), nunca esperando a logo.

Regras:
- Rolar, clicar ou tecla → termina na hora (estado final).
- `sessionStorage` (com try/catch) para não repetir na sessão.
- reduced-motion → estado final direto.
- Depois da abertura, o reflexo pode seguir o `pointermove` (só `pointer: fine`).

```ts
const paths = svg.querySelectorAll<SVGPathElement>('#nx-wordmark path');
paths.forEach((p, i) => {
  const L = p.getTotalLength();
  p.style.strokeDasharray = `${L}`;
  p.style.strokeDashoffset = `${L}`;
  p.getBoundingClientRect(); // força layout antes da transição
  p.style.transition = `stroke-dashoffset .75s cubic-bezier(.65,0,.35,1) ${i * .05}s, fill-opacity .45s ease ${.6 + i * .04}s, stroke-opacity .4s ease .8s`;
  requestAnimationFrame(() => { p.style.strokeDashoffset = '0'; p.style.fillOpacity = '1'; p.style.strokeOpacity = '0'; });
});
```

---

## 2. Fundo "Seda de Luz" (fragment shader puro, sem Three.js)

Triângulo de tela cheia + fragment shader. Uniforms: resolução, tempo, mouse (suavizado), scroll (em telas), velocidade de scroll, fade-in.

```glsl
precision mediump float;
uniform vec2 r; uniform float t; uniform vec2 m; uniform float s; uniform float v; uniform float ink;
#define RIB 6   // celular: 3
#define LIN 7   // celular: 5
void main(){
  vec2 uv = (gl_FragCoord.xy - .5*r) / r.y;
  float acc = 0.;
  for (int i = 0; i < RIB; i++) {
    float fi = float(i);
    float ang = -.38 + .22*sin(s*.55 + fi*1.37) + fi*.045;       // ângulo muda com o scroll
    float c = cos(ang), sn = sin(ang);
    vec2 q  = vec2(c*uv.x - sn*uv.y, sn*uv.x + c*uv.y);
    vec2 mq = vec2(c*m.x  - sn*m.y,  sn*m.x  + c*m.y);
    float tt = t*.11 + fi*2.31;
    float y = (fi - float(RIB-1)*.5)*.15 + .18*sin(s*.6 + fi*.9)
            + .17*sin(q.x*1.05 + tt*1.6) + .07*sin(q.x*2.4 - tt*1.1 + fi);
    float dx = q.x - mq.x;
    y = mix(y, mq.y, exp(-dx*dx*4.)*.32*exp(-abs(mq.y - y)*1.6)); // curva em direção ao mouse
    float spread = .011 + .007*sin(q.x*1.6 + tt*1.8);               // dobras da seda
    float travel = .35 + .65*pow(.5 + .5*sin(q.x*1.4 - tt*2.6 + fi*1.7), 2.); // brilho viajando
    for (int j = 0; j < LIN; j++) {
      float fj = float(j);
      float yy = y + fj*spread*(1. + .7*sin(q.x*2.7 + fj*.8 + tt));
      float w = .0022 + .0016*fj/float(LIN);
      acc += exp(-abs(q.y - yy)/w) * (1. - fj/float(LIN)*.7) * .42 * travel;
    }
    float d0 = abs(q.y - y - spread*float(LIN)*.5);
    acc += exp(-d0*11.)*.075*travel + exp(-d0*3.)*.018;
  }
  acc *= 1. + v*.9;                          // velocidade do scroll intensifica
  acc += exp(-length(uv - m)*2.4)*.05;       // foco de luz no cursor
  float vig = smoothstep(1.35, .15, length(uv*vec2(.75, 1.)));
  float g = (1. - exp(-acc*vig*1.5)) * ink; // tone mapping + fade-in
  gl_FragColor = vec4(vec3(.02) + vec3(g), 1.);
}
```

Loop JS:
- Canvas fixo, `pointer-events:none`, z-index abaixo do conteúdo.
- Resolução = viewport × 0,7 (celular 0,5) × min(DPR, 1,5).
- Mouse em coordenadas `((x - W/2)/H, (H/2 - y)/H)` com lerp 0,05.
- `s = scrollY / innerHeight` com lerp 0,06; `v = min(|Δscroll|/40, 1)` com lerp 0,08.
- `ink` sobe de 0 a 1 (fade-in) quando o shader fica pronto.
- `document.hidden` → não desenha. Sem `pointer: fine` → mouse oscila sozinho (seno lento).
- Iniciar após `load`/`requestIdleCallback`. Falhou o WebGL → `<div>` com WebP estático do efeito.
- Monitorar FPS (média de 60 frames): abaixo de ~45 → reduza RIB/LIN/resolução; abaixo de ~30 → troque pela imagem.

---

## 3. GSAP no React/Next.js

- Use `@gsap/react` (`useGSAP`) ou `gsap.context()`: o cleanup é automático.
- Use `gsap.matchMedia()` para separar desktop / mobile / reduced-motion.
- Registre plugins uma vez, no client (`'use client'`).

```tsx
useGSAP(() => {
  const mm = gsap.matchMedia();
  mm.add({
    desktop: '(min-width: 901px) and (prefers-reduced-motion: no-preference)',
    mobile: '(max-width: 900px) and (prefers-reduced-motion: no-preference)',
  }, (ctx) => {
    const { desktop } = ctx.conditions!;
    ScrollTrigger.create({
      trigger: stageRef.current, start: desktop ? 'center center' : 'top 70%',
      end: desktop ? '+=130%' : 'bottom 20%', pin: desktop, scrub: true,
      onUpdate: (st) => setProgress(st.progress),
    });
  });
  return () => mm.revert();
}, { scope: rootRef });
```

Lenis (opcional):
- `lenis.on('scroll', ScrollTrigger.update)`
- `gsap.ticker.add((t) => lenis.raf(t * 1000))`
- `gsap.ticker.lagSmoothing(0)`
- Desligue com reduced-motion e garanta que âncoras (#contato) continuem funcionando.

Revelação padrão:

```ts
gsap.from(el, { y: 30, opacity: 0, filter: 'blur(6px)', duration: 1.1, ease: 'expo.out',
  scrollTrigger: { trigger: el, start: 'top 88%' } });
```

Títulos por palavra: envolva cada palavra em `span.w-mask > span`, anime `yPercent: 110 → 0` com `stagger: .05`, e coloque `aria-label` com a frase inteira no título.

---

## 4. História em 3 atos (varredura de luz)

- Moldura de navegador com 2 camadas: site antigo fictício (base) e site novo NEXYA (por cima, com `clip-path: inset(0 X% 0 0)`).
- Uma linha branca de 2px com glow acompanha a borda do recorte.
- O progresso do ScrollTrigger controla o `clip-path` e qual texto de ato está visível (ato 1 < 18% < ato 2 < 82% < ato 3).
- Desktop: pin curto. Mobile: sem pin.
- reduced-motion: mostra o site novo direto.

## 5. Antes e depois arrastável

- Container com `touch-action: pan-y` (não trava a rolagem vertical).
- Pointer events com `setPointerCapture`; a posição vai numa CSS var `--pos` usada no `clip-path` e no handle.
- Handle com `role="slider"`, `tabindex=0`, `aria-valuenow/valuetext`, setas ±5, Home/End.

## 6. Projetos vivos (vídeo do site real)

Gravar com Playwright, só URLs autorizadas e sem dados de clientes:

```ts
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: 'tmp/videos', size: { width: 1440, height: 900 } } });
const page = await ctx.newPage(); await page.goto(url, { waitUntil: 'networkidle' });
await page.mouse.wheel(0, 0); for (let i = 0; i < 40; i++) { await page.mouse.wheel(0, 60); await page.waitForTimeout(120); }
await ctx.close();
```

Comprimir (6–10s, mudo, ~1–2MB):

```
ffmpeg -i in.webm -t 9 -an -vf "scale=1280:-2,fps=30" -c:v libx264 -crf 28 -preset slow -movflags +faststart -pix_fmt yuv420p out.mp4
ffmpeg -i in.webm -t 9 -an -vf "scale=1280:-2,fps=30" -c:v libvpx-vp9 -crf 38 -b:v 0 out.webm
ffmpeg -i out.mp4 -frames:v 1 -q:v 3 poster.webp
```

Atributos do `<video>`: `muted loop playsinline preload="none" poster=...`. Desktop: play no hover/foco. Mobile: `IntersectionObserver` (threshold .6), com play/pause. reduced-motion: só o poster.

## 7. React Three Fiber (quando há objeto 3D de verdade)

- `<Canvas dpr={[1, 1.5]} gl={{ antialias: false, powerPreference: 'high-performance' }} frameloop="demand">`, com `invalidate()` quando algo muda, ou `"always"` só enquanto estiver visível.
- `PerformanceMonitor` (drei) para baixar a qualidade; `AdaptiveDpr`.
- Ambiente: `<Environment resolution={256}>` com `<Lightformer>`, em vez de HDR pesado.
- Pós-processamento (bloom, vinheta, ruído) só no desktop.
- SVG → 3D: `SVGLoader` + `ExtrudeGeometry` com bevel pequeno; uma mesh por letra.
- Unmount: `geometry.dispose()`, `material.dispose()`, `texture.dispose()`.

## 8. Barra fixa de WhatsApp no celular

- Um `IntersectionObserver` olha o CTA do topo, o CTA final e o rodapé. A barra aparece só quando nenhum deles está visível e `scrollY > 200`.
- Padding inferior com `env(safe-area-inset-bottom)`. Não pode cobrir o banner de cookies.

## 9. QA visual

- Playwright: prints em 360, 390, 768, 1440 e 1920px; vídeo da rolagem completa em 1440 e 390.
- Emule `reducedMotion: 'reduce'` e um contexto sem WebGL (`--disable-webgl`) para testar os fallbacks.
- Lighthouse mobile na Home e em 1 página interna; informe os números reais.
