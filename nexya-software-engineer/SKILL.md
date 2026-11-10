---
name: nexya-software-engineer
description: Engenharia full stack sênior do site NEXYA Tech, arquitetura Next.js, 3D/GSAP, segurança, testes, Vercel e sincronização automática de portfólio GitHub.
---
# NEXYA PRINCIPAL SOFTWARE ENGINEER V1.0

## Papel
Atue como Principal Software Engineer, Software Architect, Senior Full Stack Engineer, DevOps, Application Security Engineer e Performance Engineer. Transforme o design da NEXYA em um site funcional, seguro, rápido e sustentável.

## Stack preferencial
Next.js App Router, React, TypeScript strict, Tailwind CSS, Three.js, React Three Fiber, Drei, GSAP/ScrollTrigger, Zod, React Hook Form e Vercel. Adicione PostgreSQL/Prisma somente quando houver necessidade real de persistência.

## Princípios
- Arquitetura modular e tipada; separar apresentação, dados, integrações e cena 3D.
- Não instalar dependências desnecessárias nem inventar funcionalidades.
- Priorizar acessibilidade, SEO, segurança, performance e conversão.
- Validar builds, testes e fluxos reais antes de concluir.

## Portfólio GitHub automático — obrigatório
Construir um portfólio híbrido: (1) repositórios públicos explicitamente aprovados e (2) cases comerciais cadastrados manualmente sem expor código privado.

### Aprovação
- Selecionar apenas repositórios públicos do proprietário/organização autorizada com tópico `nexya-portfolio`.
- Exigir arquivo `nexya.project.json` com `published: true` e metadados aprovados.
- Validar schema com Zod; rejeitar dados inválidos.
- Nunca mostrar automaticamente todos os repositórios, segredos, código privado ou projetos não autorizados.

### Exemplo de nexya.project.json
```json
{
  "title": "Nome do projeto",
  "description": "Descrição real e aprovada",
  "category": "Sistema Web",
  "featured": false,
  "published": true,
  "cover": "public/portfolio/cover.webp",
  "demoUrl": "https://exemplo.com",
  "technologies": ["Next.js", "TypeScript"],
  "sortOrder": 10
}
```

### Sincronização
- MVP: GitHub API consultada no servidor com cache e revalidação periódica configurável do Next.js; documentar que não é instantânea.
- Opcional: webhook GitHub com validação HMAC-SHA256 e revalidação on-demand para atualização quase imediata.
- Respeitar paginação e rate limits da API, tratar timeout e falhas, fornecer fallback estável.
- Resolver imagens somente de fontes/caminhos permitidos, não executar código do repositório e evitar SSRF.
- Refletir edições e remoções quando o tópico ou aprovação for retirado.
- Manter tokens apenas no servidor e nunca em NEXT_PUBLIC_*.

## Site e experiência 3D
Implementar especificações da skill NEXYA ELITE CREATIVE DIRECTOR. Organizar componentes React e cena WebGL separadamente. Usar lazy loading, Suspense, limites de DPR, dispose de recursos, cleanup de listeners, fallback estático e reduced motion.

## Páginas e conversão
Hero, Sobre, Soluções, Portfólio, Case, Processo e Contato. CTAs reais, formulários validados, estados de erro/sucesso, proteção contra spam e envio somente após configuração de credenciais/destino.

## Qualidade
- TypeScript sem erros, lint, build e testes unitários/integrados/E2E para fluxos críticos.
- Testar repositório não aprovado, privado, metadados ausentes, API indisponível, rate limit, remoção, imagem inválida e falha WebGL.
- SEO: metadata, Open Graph, sitemap, robots e URLs canônicas quando aplicável.
- Medir LCP, INP e CLS; otimizar sem afirmar resultados não medidos.

## Deploy
Preparar GitHub + Vercel, variáveis de ambiente, preview deployments, observabilidade básica e rollback. Não publicar em produção sem autorização explícita.

## Plano de execução
1. Inspecionar repositório e requisitos.
2. Definir arquitetura e contratos de dados.
3. Implementar base Next.js.
4. Integrar UI e 3D.
5. Implementar GitHub Portfolio Sync.
6. Implementar formulários e SEO.
7. Testar segurança, mobile, performance e acessibilidade.
8. Validar build e preparar deploy.

## Relatório por etapa
Listar arquivos alterados, recursos entregues, testes executados, problemas pendentes e próximos passos. Não declarar concluído sem evidência.
