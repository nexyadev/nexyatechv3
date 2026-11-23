/**
 * "Seda Acetinada": receita 2 (Seda de Luz) adaptada para papel claro, com volume de tecido.
 * Composição subtrativa: cor = papel − (dobras largas + fios) × tinta + (brilho nas cristas + brilho dos fios).
 * - Dobras largas: sombreamento de baixa frequência com gradiente através da fita (um lado mais escuro),
 *   que dá corpo de cetim em vez de riscos.
 * - Cristas: destaque branco suave nos "picos" das dobras, que corre devagar ao longo da fita.
 * - Fios finos por cima, mais leves que antes.
 * Tema escuro (uniform dk, 0..1): papel #0A0A0A e fios prateados, mesma composição.
 * As fitas ficam à direita do topo e na metade de baixo; com a rolagem, a parte de baixo enfraquece para não
 * pesar atrás de textos longos. Uma máscara mantém a área do título (alto à esquerda) limpa.
 */
export function satinFragment(ribbons: number, lines: number) {
  return `precision mediump float;
uniform vec2 r; uniform float t; uniform vec2 m; uniform float s; uniform float v; uniform float ink; uniform float dk;
#define RIB ${ribbons}
#define LIN ${lines}
void main(){
  vec2 uv = (gl_FragCoord.xy - .5*r) / r.y;
  vec2 p = gl_FragCoord.xy / r;
  float fold = 0., shine = 0., body = 0., crest = 0.;
  for (int i = 0; i < RIB; i++) {
    float fi = float(i);
    float ang = .36 + .16*sin(s*.55 + fi*1.37) + fi*.04;
    float c = cos(ang), sn = sin(ang);
    vec2 q  = vec2(c*uv.x - sn*uv.y, sn*uv.x + c*uv.y);
    vec2 mq = vec2(c*m.x  - sn*m.y,  sn*m.x  + c*m.y);
    float tt = t*.11 + fi*2.31;
    float y = -.07 + (fi - float(RIB-1)*.5)*.13 + .14*sin(s*.6 + fi*.9)
            + .15*sin(q.x*1.05 + tt*1.6) + .06*sin(q.x*2.4 - tt*1.1 + fi);
    float dx = q.x - mq.x;
    y = mix(y, mq.y, exp(-dx*dx*4.)*.32*exp(-abs(mq.y - y)*1.6));
    float spread = .011 + .007*sin(q.x*1.6 + tt*1.8);
    float travel = pow(.5 + .5*sin(q.x*1.4 - tt*2.6 + fi*1.7), 3.);

    // Volume: faixa larga com gradiente através da fita (lado de baixo da dobra mais escuro).
    float yc = y + spread*float(LIN)*.5;
    float W = .07 + .025*sin(q.x*.9 + tt*1.3 + fi);
    float d = q.y - yc;
    float b = exp(-d*d/(W*W*1.6));
    float side = smoothstep(-W*1.1, W*1.3, d);
    body += b*(.18 + .82*(1. - side))*.30;
    // Crista: brilho largo e suave no pico da dobra, mais forte onde a fita "levanta".
    float lift = .5 + .5*sin(q.x*1.25 - tt*1.15 + fi*2.1);
    float k = (d - W*.28)/(W*.36);
    crest += exp(-k*k)*(.35 + .65*lift)*.42;

    for (int j = 0; j < LIN; j++) {
      float fj = float(j);
      float yy = y + fj*spread*(1. + .7*sin(q.x*2.7 + fj*.8 + tt));
      float w = .0022 + .0016*fj/float(LIN);
      float l = exp(-abs(q.y - yy)/w) * (1. - fj/float(LIN)*.7);
      fold += l*.24;
      shine += l*travel*.7;
    }
    float d0 = abs(d);
    fold += exp(-d0*11.)*.04;
    shine += exp(-d0*9.)*.08*travel;
  }
  fold *= 1. + v*.5;
  shine *= 1. + v*.9;
  crest *= 1. + v*.6;
  shine += exp(-length(uv - m)*2.4)*.05;
  float hero = clamp(1. - s, 0., 1.);
  float topRight = smoothstep(.36, .86, p.x) * smoothstep(.24, .80, p.y) * (.35 + .65*hero);
  float low = smoothstep(.62, .04, p.y) * mix(1., .45, clamp(s*.8, 0., 1.));
  float region = clamp(max(topRight, low), 0., 1.);
  float vig = smoothstep(1.5, .2, length(uv*vec2(.7, 1.)));
  float R = region*vig;
  float F = (1. - exp(-(fold*1.25 + body*.9)*R)) * ink;
  float S = (1. - exp(-(shine*1.7 + crest)*R)) * ink;
  vec3 paper = vec3(.957, .957, .949);
  vec3 col = paper - F*vec3(.24, .24, .235) + S*vec3(.15);
  // Tema escuro: papel quase preto (#0A0A0A); dobras e brilho viram fios prateados de baixa intensidade.
  vec3 dcol = vec3(.039) + F*vec3(.10) + S*vec3(.20);
  gl_FragColor = vec4(min(mix(col, dcol, dk), vec3(1.)), 1.);
}`;
}

export const satinVertex = `attribute vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }`;
