# Privacidade, cookies e Google Ads — implementação NEXYA

> Isto é orientação técnica, não parecer jurídico. A política final deve ser revisada pelo responsável legal do cliente. Confira sempre a documentação atual do Google, porque domínios e parâmetros mudam.

## 1. Modelo de consentimento

**Padrão NEXYA: Consent Mode v2 no modo "básico".** Nenhuma tag do Google carrega antes da escolha. É o caminho mais conservador para a LGPD e fácil de provar no teste ("zero requisições antes de aceitar").

O modo "avançado" (a tag carrega com `denied` e manda sinais sem cookies, permitindo modelagem de conversões) só pode ser usado se o cliente pedir explicitamente e ciente da diferença. Registre a decisão.

Categorias:

| Categoria | Precisa de consentimento | Exemplos |
|---|---|---|
| Necessários | Não | `nx_consent`, sessão/login, segurança |
| Medição | Sim | Google Analytics 4 (`analytics_storage`) |
| Marketing | Sim | Google Ads (`ad_storage`, `ad_user_data`, `ad_personalization`) |

Armazenamento da escolha:
- Cookie próprio `nx_consent` (1st-party, `SameSite=Lax`, `Secure`, 12 meses) com o JSON `{"v":1,"analytics":bool,"marketing":bool,"ts":"ISO"}`.
- Suba `v` quando a política ou as categorias mudarem; isso faz o banner reaparecer.
- Envolva toda leitura/escrita em try/catch.

## 2. Código (Next.js App Router)

`lib/consent.ts`:

```ts
export type Consent = { v: 1; analytics: boolean; marketing: boolean; ts: string };
export const CONSENT_VERSION = 1;
export function readConsent(): Consent | null {
  try {
    const m = document.cookie.match(/(?:^|; )nx_consent=([^;]*)/);
    const c = m ? (JSON.parse(decodeURIComponent(m[1])) as Consent) : null;
    return c && c.v === CONSENT_VERSION ? c : null;
  } catch { return null; }
}
export function saveConsent(analytics: boolean, marketing: boolean): Consent {
  const c: Consent = { v: CONSENT_VERSION, analytics, marketing, ts: new Date().toISOString() };
  document.cookie = `nx_consent=${encodeURIComponent(JSON.stringify(c))}; Max-Age=${60*60*24*365}; Path=/; SameSite=Lax; Secure`;
  window.dispatchEvent(new CustomEvent('nx:consent', { detail: c }));
  return c;
}
export function consentToGtag(c: Consent) {
  const m = c.marketing ? 'granted' : 'denied';
  return { ad_storage: m, ad_user_data: m, ad_personalization: m, analytics_storage: c.analytics ? 'granted' : 'denied' } as const;
}
```

`components/Analytics.tsx` (`'use client'`, renderizado no `layout.tsx`):

```tsx
const ADS = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;   // AW-XXXXXXXXX
const GA4 = process.env.NEXT_PUBLIC_GA4_ID;          // G-XXXXXXXXXX
export function Analytics() {
  const [c, setC] = useState<Consent | null>(null);
  useEffect(() => { setC(readConsent()); const h = (e: Event) => setC((e as CustomEvent).detail); addEventListener('nx:consent', h); return () => removeEventListener('nx:consent', h); }, []);
  useEffect(() => { if (c && window.gtag) window.gtag('consent', 'update', consentToGtag(c)); }, [c]);
  if (!c || (!c.analytics && !c.marketing) || (!ADS && !GA4)) return null;   // modo básico: nada antes do consentimento
  const id = ADS || GA4;
  return (<>
    <Script id="gtag-consent" strategy="afterInteractive">{`
      window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);} window.gtag=gtag;
      gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied'});
      gtag('consent','update',${JSON.stringify(consentToGtag(c))});
      gtag('set','ads_data_redaction',true);
      gtag('js',new Date());
      ${ADS && c.marketing ? `gtag('config','${ADS}');` : ''}
      ${GA4 && c.analytics ? `gtag('config','${GA4}',{anonymize_ip:true});` : ''}
    `}</Script>
    <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
  </>);
}
```

Eventos (`lib/track.ts`), que não fazem nada sem gtag ou consentimento:

```ts
export function trackWhatsApp() {
  const label = process.env.NEXT_PUBLIC_ADS_WA_LABEL, ads = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  if (window.gtag && ads && label) window.gtag('event', 'conversion', { send_to: `${ads}/${label}` });
  if (window.gtag) window.gtag('event', 'whatsapp_click');
}
export function trackEvent(name: 'scroll_depth' | 'engaged_time' | 'before_after_used' | 'project_video_play', params: Record<string, string | number> = {}) {
  if (window.gtag) window.gtag('event', name, params);  // NUNCA enviar nome, telefone, e-mail ou texto de formulário
}
```

- WhatsApp: delegação de clique em `a[href*="wa.me"]` chama `trackWhatsApp()`. O link abre em nova aba, então não precisa atrasar a navegação.
- `scroll_depth`: dispare 25/50/75/100 uma vez cada por página, com `{ percent }`.
- `engaged_time`: a cada 30s, só com `document.visibilityState === 'visible'`.

Tipagem: `declare global { interface Window { gtag?: (...args: unknown[]) => void; dataLayer?: unknown[] } }`.

`.env.example`:

```
NEXT_PUBLIC_SITE_URL=https://nexyatech.com.br
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXX
NEXT_PUBLIC_ADS_WA_LABEL=XXXXXXXXXXXXXXXX
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
```

## 3. Banner e preferências (requisitos)

- Aparece na primeira visita e não bloqueia o site (canto inferior; no celular, largura total acima da barra do WhatsApp).
- Texto curto e claro: o que é coletado e para quê, com link para a Política.
- Botões **Aceitar** e **Recusar** com o mesmo tamanho, peso e nível; botão **Preferências** com interruptores por categoria (necessários fixos e ligados; medição e marketing desligados por padrão).
- Sem caixas pré-marcadas e sem "ao continuar navegando você aceita".
- Link permanente **"Preferências de cookies"** no rodapé para reabrir e mudar a escolha. Revogar remove os cookies `_ga*` e `_gcl*` do domínio e envia `consent update` com `denied`.
- Acessível: `role="dialog"`, `aria-labelledby`, foco no primeiro botão ao abrir (sem prender foco, porque não é modal bloqueante), teclado completo, contraste AA.
- Visual: segue a skill de design (vidro fosco, monocromático).

## 4. CSP para o Google tag

Base (confira na documentação atual do Google, "Google tag and Content Security Policy"):

```
script-src  'self' 'nonce-{NONCE}' https://*.googletagmanager.com;
img-src     'self' data: https://*.google-analytics.com https://*.googletagmanager.com https://*.g.doubleclick.net https://*.google.com https://*.google.com.br;
connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.g.doubleclick.net https://*.google.com https://*.google.com.br https://pagead2.googlesyndication.com;
frame-src   https://*.g.doubleclick.net https://td.doubleclick.net https://*.google.com;
```

- Scripts inline (`gtag-consent`) exigem **nonce** (middleware do Next, que gera o nonce por requisição; deixa as páginas dinâmicas) ou **hash** do conteúdo (mantém o estático, mas o script não pode variar). Escolha e documente.
- Valide no navegador: nenhum erro de CSP no console, e as tags disparam no Tag Assistant.

## 5. Política de Privacidade e Cookies (estrutura mínima)

1. Quem somos: controlador (razão social, CNPJ e contato; use [PREENCHER] se faltar).
2. Dados coletados: contato enviado pelo WhatsApp/formulário, dados de navegação (com consentimento), dados técnicos de segurança.
3. Finalidades e bases legais (art. 7º LGPD): responder pedidos de orçamento (procedimentos preliminares de contrato / legítimo interesse), medição e anúncios (consentimento), segurança (legítimo interesse).
4. Cookies: tabela com nome, provedor, finalidade, categoria e duração. Exemplos comuns (confirme no navegador o que de fato é gravado):

   | Cookie | Provedor | Finalidade | Duração |
   |---|---|---|---|
   | `nx_consent` | NEXYA | Guardar sua escolha de cookies | 12 meses |
   | `_ga`, `_ga_<ID>` | Google Analytics | Medir visitas de forma agregada | até 2 anos |
   | `_gcl_au` | Google Ads | Medir conversões de anúncios | 90 dias |

5. Compartilhamento: Google (Ads/Analytics), provedor de hospedagem e WhatsApp/Meta quando a pessoa inicia a conversa.
6. Transferência internacional (art. 33): os servidores do Google e da hospedagem podem estar fora do Brasil.
7. Retenção: por quanto tempo cada dado fica guardado.
8. Direitos do titular (art. 18): confirmação, acesso, correção, anonimização, portabilidade, eliminação, informação sobre compartilhamento e revogação do consentimento, com o canal para exercê-los.
9. Canal de contato/encarregado. Agentes de pequeno porte podem dispensar a nomeação do encarregado (Resolução CD/ANPD nº 2/2022), mas precisam manter um canal de comunicação.
10. Data da última atualização e versão.

## 6. Testes obrigatórios (Playwright)

```ts
test('nenhuma tag do Google antes do consentimento', async ({ page }) => {
  const hits: string[] = [];
  page.on('request', r => { if (/googletagmanager|google-analytics|doubleclick/.test(r.url())) hits.push(r.url()); });
  await page.goto('/'); await page.waitForLoadState('networkidle');
  expect(hits).toEqual([]);
  await page.getByRole('button', { name: 'Recusar' }).click(); await page.reload(); await page.waitForLoadState('networkidle');
  expect(hits).toEqual([]);   // recusar continua sem tags
});
test('aceitar carrega a tag e persiste', async ({ page }) => {
  await page.goto('/'); await page.getByRole('button', { name: 'Aceitar' }).click();
  await expect.poll(() => page.evaluate(() => typeof window.gtag)).toBe('function');
  await page.reload(); await expect(page.getByRole('dialog', { name: /cookies/i })).toBeHidden();
});
```

Inclua também:
- "Preferências de cookies" reabre o banner.
- Revogar remove os cookies `_ga*` e `_gcl*`.
- O clique no WhatsApp chama a conversão só com marketing `granted` (mock do `window.gtag`).

## 7. Checklist de publicação

- [ ] IDs reais (AW-, label, G-) nas variáveis do provedor de deploy, não no código
- [ ] Tag Assistant: estado de consentimento correto antes e depois de aceitar
- [ ] Conversão "Clique no WhatsApp" aparece no Google Ads (pode levar algumas horas)
- [ ] GA4 DebugView recebe scroll_depth/engaged_time só após aceitar
- [ ] Política publicada, linkada no banner e no rodapé, com data
- [ ] CSP sem erros no console
