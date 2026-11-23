# Glossário de tradução — NEXYA Tech

Referência para manter os três idiomas consistentes. Os textos ficam em `i18n/messages/`:

- `pt-BR.ts`: idioma padrão. Define os tipos que os outros dois arquivos precisam seguir.
- `pt-PT.ts`: português europeu (AO90). **Precisa de revisão por falante nativo antes de anunciar em Portugal.**
- `en.ts`: inglês americano neutro. **Precisa de revisão por falante nativo antes de anunciar em mercados de língua inglesa.**

## Regras gerais

- **Nomes de marca não se traduzem:** NEXYA, NEXYA Tech, NEXYA Auto, Garagem Mendes, BIOCLASS, Dra. Camila Bioclass, En.r.ico, Enrico Rocha Miascovsky.
- **Nenhum emoji** nem símbolo que vire emoji (setas, visto, estrelas, triângulo de play, símbolo de copyright) em texto, botão, título, `alt`, `aria-label`, metadados ou mensagem do WhatsApp. Ícones são SVG. O teste `anti-emoji` do Playwright falha se algum aparecer.
- **Mensagens do WhatsApp:** sempre no idioma da página e sem emoji. Começam por "Olá, NEXYA!" (pt-BR e pt-PT) ou "Hi, NEXYA!" (en).
- **Números, datas e moeda:** formatados com `Intl`, conforme o idioma. Nos textos, pt-PT usa "1500" sem separador de milhar e pt-BR usa "1.500".
- **pt-PT:**
  - Evitar "você". Preferir formas neutras ("o seu projeto", "Peça", "Conte-nos") ou "si".
  - Nada de gerúndio para ação em curso: usar "estar a + infinitivo".
- **Inglês:** americano, direto, frases curtas, sem jargão de marketing.

## Termos

| pt-BR | pt-PT | en |
|---|---|---|
| tela | ecrã | screen |
| celular | telemóvel | phone / mobile |
| desktop | computador | desktop |
| notebook | portátil | laptop |
| equipe | equipa | team |
| contato | contacto | contact |
| usuário | utilizador | user |
| arquivo | ficheiro | file |
| estamos desenvolvendo | estamos a desenvolver | we are building |
| fale conosco | fale connosco | get in touch |
| agendar reunião | marcar reunião | book a meeting |
| agendamento | marcação | appointment / booking |
| cadastro | registo / ficha | record |
| registro | registo | record |
| planejamento | planeamento | planning |
| escopo | âmbito | scope |
| entender | perceber | understand |
| conectar | ligar | connect |
| link (externo) | ligação | link |
| aba (do navegador) | separador | tab |
| rolar (a página) | deslizar | scroll |
| bug | erro | bug |
| automação | automatização | automation |
| sistema sob medida | software à medida | custom software |
| site | site | website |
| portfólio | portefólio | portfolio |
| case | caso | case study |
| estoque | stock | inventory |
| ordem de serviço (O.S.) | ordem de serviço | work order |
| orçamento | orçamento | estimate (NEXYA Auto) / quote (pedido de orçamento) |
| oficina | oficina | auto shop |
| entrada do veículo | receção do veículo | vehicle check-in |
| fotos | fotografias | photos |
| performance | desempenho | performance |
| pedir orçamento | pedir orçamento | get a quote |
| teste grátis por 7 dias | experimentar grátis durante 7 dias | try free for 7 days |
| senha | palavra-passe | password |

## Termos que pedem decisão do revisor nativo

- **pt-PT, "ordem de serviço":** nas oficinas em Portugal também se usa "ordem de reparação" ou "folha de obra". Mantivemos "ordem de serviço" para combinar com a interface do NEXYA Auto.
- **pt-PT, "site" ou "sítio":** usamos "site", que é comum em contexto comercial.
- **en, "estimate" ou "quote":** no NEXYA Auto, o orçamento da oficina é "estimate". O botão comercial da NEXYA é "Get a quote".
