# NEXYA Tech

Site institucional multipáginas, construído localmente com Next.js App Router,
TypeScript strict, Tailwind CSS, React Three Fiber, Drei, Three.js, GSAP,
ScrollTrigger, Motion, React Hook Form e Zod.

## Abrir localmente

Requisito: Node.js 22 ou superior e npm.

```powershell
npm install
npm run dev
```

Abra **http://127.0.0.1:3000**. O servidor fica restrito à máquina local.
Para conferir a versão de produção:

```powershell
npm run build
npm run start
```

Encerre o servidor de desenvolvimento antes de iniciar produção na mesma porta.

## Configuração

Os contatos informados pelo proprietário já são os valores padrão em
`lib/config.ts`. Para personalizar por ambiente, copie `.env.example` para
`.env.local` e edite os campos abaixo. Reinicie o servidor após alterações.
Variáveis `NEXT_PUBLIC_*` são públicas e incorporadas no build: **não colocar
tokens ou outros segredos nelas**.

| Variável | Uso |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Domínio definitivo para canonical, sitemap e Open Graph. Padrão local; definir antes de publicar. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número internacional, somente dígitos. Atual: `5541997830046`. |
| `NEXT_PUBLIC_AUTO_URL` | Site oficial do produto, `https://nexyaauto.com/`. |
| `NEXT_PUBLIC_AUTO_TRIAL_URL` | Cadastro oficial, `https://nexyaauto.com/register`. |
| `NEXT_PUBLIC_INSTAGRAM_TECH` | Perfil `nexya.tech`. Vazio oculta o link. |
| `NEXT_PUBLIC_INSTAGRAM_AUTO` | Perfil `nexya.auto`. Vazio oculta o link. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | E-mail institucional opcional; não foi inventado. |
| `NEXT_PUBLIC_INTRO_MODE` | `session` (padrão), `always` ou `off`. Redução de movimento sempre dispensa a abertura. |

O cadastro da Auto foi localizado por links do site oficial e respondeu HTTP
200. O teste automático de 7 dias após cadastro foi confirmado pelo proprietário.
Não foi criada conta ou testado o provisionamento do período no produto externo.

## Rotas

| Rota | Conteúdo |
| --- | --- |
| `/` | Home: hero 3D, posicionamento, soluções, produto, projetos, processo e contato. |
| `/solucoes` | Serviços, IA, correção de bugs e evolução. |
| `/solucoes/sistemas` | Sistemas sob medida. |
| `/solucoes/automacoes` | Automações e aplicações de IA. |
| `/solucoes/sites` | Sites e experiências digitais. |
| `/solucoes/integracoes` | Integrações, correção de bugs e evolução. |
| `/nexya-auto` | Produto, capturas reais, recursos, fluxo, FAQ e teste. |
| `/portfolio` | Projetos locais autorizados. |
| `/portfolio/nexya-auto` | Case documentado do produto. |
| `/portfolio/garagem-mendes` | Estrutura de case com material pendente. |
| `/portfolio/ang` | Estrutura de case com material pendente. |
| `/portfolio/veia-criativa` | Estrutura de case, nome e material pendentes. |
| `/sobre` | Posicionamento da NEXYA. |
| `/processo` | Descoberta, estratégia, desenvolvimento e evolução. |
| `/contato` | Briefing validado e encaminhamento ao WhatsApp. |
| `/privacidade` | Comportamento real do site e tratamento do briefing. |

Há ainda loading, tratamento de erro, 404, `robots.txt`, `sitemap.xml` e imagem
Open Graph. Cases sem material aprovado têm `noindex` e não entram no sitemap.
Em localhost, `robots.txt` desabilita indexação.

## Arquitetura e edição

- `app/`: rotas, SEO e layouts. Texto da Home em `app/page.tsx`.
- `app/globals.css`: tokens, tipografia, espaçamento, shell e Home responsiva.
- `components/layout/`: cabeçalho fixo, menu mobile e rodapé.
- `components/ui.tsx`: botões, introduções, títulos e CTA final.
- `components/3d/`: escultura procedural, ambiente de luz local e fallback SVG.
- `components/animations/`: abertura, reveals, transição de página e botão magnético.
- `components/product/`: apresentação das capturas reais em dispositivo.
- `components/contact/`: formulário, revisão de mensagem e feedback.
- `components/portfolio/`: cards e capas dos projetos.
- `lib/config.ts`: contatos e URLs.
- `lib/solutions.ts`: textos e entregáveis dos serviços.
- `lib/portfolio/projects.ts`: nomes, imagens, descrições e status dos cases.
- `lib/portfolio/repository.ts`: contrato de leitura independente de futura fonte.
- `lib/contact.ts`: schema Zod e construção segura da mensagem.
- `types/`, `hooks/`: contratos tipados e detecção de preferências.
- `public/images/`: logo oficial intacta e capturas públicas do produto.
- `public/models/`: reservado para modelos aprovados; a cena atual não depende de arquivos pesados.
- `tests/`: testes de validação e fluxos no navegador.
- `docs/`: direção visual, fontes dos materiais e relatório de validação.

Para trocar uma capa, adicione uma imagem aprovada em `public/images/portfolio/`
e altere `cover` no arquivo de dados. O formato é
`{ src: "/images/portfolio/nome.webp", alt: "Descrição da imagem real" }`.
Não substituir os placeholders por telas fictícias. Os arquivos de skills e a
logo original na raiz foram preservados.

## Formulário e privacidade

O formulário **não possui backend de envio**. Ele valida os campos, apresenta
a mensagem para revisão e oferece um link para continuar no WhatsApp. O envio
ocorre somente quando a pessoa confirma no próprio WhatsApp. Há opção de copiar
a mensagem e retornar à edição; nenhuma mensagem é enviada durante os testes.

Os campos ficam na memória da página. Não há analytics, pixels, cookies de
rastreamento, banco de leads ou credenciais de terceiros. `sessionStorage` é
usado apenas para não repetir a abertura na mesma aba. Fontes e recursos visuais
são servidos localmente.

## 3D e acessibilidade

O conteúdo textual é renderizado no servidor e independe de WebGL. A cena é
carregada em módulo separado, próxima ao viewport, com DPR limitado no celular,
qualidade adaptativa e renderização suspensa fora da tela ou em aba oculta.
O botão de pausa permite interromper o movimento. O CTA usa uma cena estática.
Falha de WebGL e preferência por movimento reduzido apresentam uma ilustração
estática da escultura; ela não substitui nem recria a logo oficial.

Scroll permanece nativo. Há skip link, foco visível, menu com Escape e contenção
de foco, campos com labels e erros, FAQ nativo e redução de movimento global.

## Verificação

```powershell
npm run lint
npm run typecheck
npm run test
npm run build
npm audit
```

Com o servidor em execução:

```powershell
npm run test:e2e
```

O Playwright usa Edge instalado no Windows e viewports desktop/mobile. Em outro
ambiente, configure o canal no `playwright.config.ts` ou instale Chromium para
testes. Evidências e limites das verificações estão em `docs/VALIDACAO.md`.

O override de `minimatch` está limitado a `@typescript-eslint/typescript-estree`
para corrigir uma vulnerabilidade transitiva do ferramental sem alterar os
demais consumidores. Reavaliar ao atualizar o ESLint/Next.

## Próximas configurações editoriais

- Definir domínio institucional antes de gerar o build de publicação.
- Confirmar o nome de exibição de Aveia / Veia Criativa.
- Fornecer material e escopo aprovados de Garagem Mendes, ANG e Veia Criativa.
- E-mail institucional opcional e eventuais informações adicionais da empresa.
- Integração GitHub somente na fase final, após autorização. O ponto de extensão
  está documentado em `lib/portfolio/README.md`; não existe conexão ou token agora.

**Nenhum deploy ou publicação faz parte desta entrega.**
