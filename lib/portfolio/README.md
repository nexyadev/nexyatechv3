# Portfólio local da NEXYA

Os dados publicados nesta fase vêm apenas de `projects.ts`. Nenhuma conta,
API, token, webhook ou sincronização GitHub está conectada.

## Atualização de conteúdo

- `title`: nome de exibição aprovado.
- `slug`: URL da página individual. Evite alterar URLs já divulgadas.
- `category`, `description` e `details`: somente escopo e informações aprovados.
- `cover`: `null` mostra um placeholder explícito; uma imagem aprovada usa
  `{ src: "/images/portfolio/arquivo.webp", alt: "Descrição real da imagem" }`.
- `status`: `pending` mantém o aviso de material em preparação e impede
  indexação da página individual; `documented` libera a apresentação do case.
- `featured`: indica destaque editorial para a camada de apresentação.
- `namePending`: remover após confirmação do nome Aveia / Veia Criativa.

A captura inicial do NEXYA Auto vem da divulgação pública do produto em
`https://nexyaauto.com/`, endereço fornecido pelo proprietário. Os outros projetos
ainda não têm capturas nem escopos aprovados.

## Ponto de extensão futuro

`repository.ts` usa a interface `PortfolioSource` em `types/portfolio.ts`.
A UI consome `getProjects()` e `getProject(slug)`, sem conhecer o provedor.
Uma futura sincronização autorizada pode adicionar um adaptador no servidor
ou atualizar um snapshot local validado, preservando a mesma interface.

A fase futura deverá selecionar somente repositórios públicos explicitamente
aprovados, com tópico `nexya-portfolio`, arquivo `nexya.project.json` válido e
`published: true`. Validar o schema com Zod, fontes de imagens, URLs permitidas,
paginação, limites, remoções, falhas e cache. Nunca expor credenciais em
`NEXT_PUBLIC_*` nem executar conteúdo vindo de um repositório. Repositórios
privados e código de clientes não devem virar cases automaticamente.

Esta documentação não implementa nem autoriza a conexão futura.
