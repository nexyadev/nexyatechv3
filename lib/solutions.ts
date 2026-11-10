export interface Solution {
  slug: string;
  number: string;
  title: string;
  shortTitle: string;
  description: string;
  summary: string;
  eyebrow: string;
  statement: string;
  benefits: { title: string; text: string }[];
  deliverables: string[];
  questions: { question: string; answer: string }[];
}

export const solutions: readonly Solution[] = [
  {
    slug: "sistemas", number: "01", title: "Sistemas sob medida", shortTitle: "Sistemas",
    description: "Sua operação tem uma lógica própria. Seu sistema também pode ter.",
    summary: "Desenvolvemos sistemas a partir dos processos, das pessoas e das necessidades da sua empresa. Da primeira ideia à evolução de uma plataforma existente.",
    eyebrow: "Engenharia para o seu negócio",
    statement: "Menos adaptação ao software. Mais software adaptado a você.",
    benefits: [
      { title: "Processos com clareza", text: "Mapeamos como o trabalho acontece para desenhar fluxos que façam sentido na rotina da equipe." },
      { title: "Informação organizada", text: "Estruturamos cadastros, consultas e regras de negócio conforme as necessidades definidas para o projeto." },
      { title: "Espaço para evoluir", text: "Planejamos a arquitetura e as prioridades para que novas etapas tenham uma base técnica consistente." },
    ],
    deliverables: ["Mapeamento dos fluxos prioritários", "Escopo e jornadas de uso", "Desenvolvimento da solução", "Validação e orientação de uso"],
    questions: [
      { question: "Preciso ter um escopo pronto?", answer: "Não. Podemos começar por uma conversa sobre a operação e o problema que você precisa resolver. O escopo é definido a partir desse entendimento." },
      { question: "Vocês também evoluem sistemas existentes?", answer: "Sim. A NEXYA oferece correções e evolução de sistemas. Primeiro avaliamos o código, o ambiente e as regras atuais para propor um caminho adequado." },
      { question: "Como prazo e investimento são definidos?", answer: "Depois de entender funcionalidades, integrações, prioridades e condições do projeto. A proposta apresenta o escopo e as etapas acordadas." },
    ],
  },
  {
    slug: "automacoes", number: "02", title: "Automações inteligentes", shortTitle: "Automações",
    description: "Dê às pessoas mais espaço para fazer o que importa.",
    summary: "Identificamos tarefas repetitivas e desenhamos automações para conectar etapas do trabalho. Quando faz sentido para o problema, avaliamos também soluções com inteligência artificial.",
    eyebrow: "Fluxos que trabalham juntos",
    statement: "O próximo passo do seu processo não precisa depender de mais uma tarefa manual.",
    benefits: [
      { title: "Rotinas conectadas", text: "Mapeamos entradas, regras e saídas para entender o que pode ser automatizado de forma consistente." },
      { title: "IA com propósito", text: "Avaliamos onde a inteligência artificial pode ajudar e onde regras claras ou revisão humana continuam sendo necessárias." },
      { title: "Controle do fluxo", text: "Definimos exceções e pontos de acompanhamento para que a automação seja compreensível para quem a utiliza." },
    ],
    deliverables: ["Diagnóstico das tarefas repetitivas", "Desenho do fluxo e das exceções", "Implementação das automações acordadas", "Validação com cenários de uso"],
    questions: [
      { question: "Toda automação precisa de IA?", answer: "Não. Muitos processos funcionam melhor com regras determinísticas. A tecnologia é escolhida a partir da necessidade, da previsibilidade e das restrições do projeto." },
      { question: "É possível conectar as ferramentas que já uso?", answer: "A viabilidade depende das APIs, permissões e recursos disponíveis em cada ferramenta. Essa análise faz parte da descoberta antes de assumir uma integração." },
      { question: "Por onde começar?", answer: "Escolha uma tarefa recorrente que consome tempo da equipe e conte como ela funciona hoje. A partir daí, avaliamos o fluxo e as oportunidades." },
    ],
  },
  {
    slug: "sites", number: "03", title: "Sites de alto impacto", shortTitle: "Sites",
    description: "A presença digital que acompanha a ambição da sua empresa.",
    summary: "Unimos direção visual, conteúdo e desenvolvimento para criar sites que apresentam sua empresa com clareza e conduzem o visitante ao próximo passo.",
    eyebrow: "Presença digital com intenção",
    statement: "Uma boa primeira impressão abre a conversa. Uma boa experiência faz ela continuar.",
    benefits: [
      { title: "Identidade reconhecível", text: "A linguagem visual parte da marca e do posicionamento que o seu negócio quer comunicar." },
      { title: "Experiência em qualquer tela", text: "Organizamos navegação, leitura e interações para desktop e celular, com atenção à acessibilidade." },
      { title: "Tecnologia bem resolvida", text: "Performance, estrutura de conteúdo e fundamentos de SEO fazem parte do trabalho técnico." },
    ],
    deliverables: ["Arquitetura de conteúdo", "Direção visual e interface", "Desenvolvimento responsivo", "Validação e preparação para publicação"],
    questions: [
      { question: "O site pode ter várias páginas?", answer: "Sim. A estrutura é definida pelo conteúdo e pelo objetivo do negócio, incluindo páginas institucionais, serviços, produtos e projetos quando fizerem sentido." },
      { question: "Posso usar minha identidade visual atual?", answer: "Sim. Trabalhamos a partir dos materiais e das orientações da marca. A descoberta também identifica quais conteúdos e imagens precisam ser preparados." },
      { question: "Vocês garantem posição no Google?", answer: "Não prometemos posições. Implementamos os fundamentos técnicos e de conteúdo acordados, mas resultados de busca dependem de fatores que vão além do desenvolvimento do site." },
    ],
  },
  {
    slug: "integracoes", number: "04", title: "Integrações e soluções técnicas", shortTitle: "Integrações",
    description: "Conecte as peças. Resolva o que está no caminho.",
    summary: "Integramos sistemas, investigamos bugs e desenvolvemos soluções para desafios técnicos específicos. O ponto de partida é entender o ambiente existente e o que precisa funcionar melhor.",
    eyebrow: "Engenharia para destravar",
    statement: "O problema pode ser específico. A solução precisa ser precisa.",
    benefits: [
      { title: "Sistemas em diálogo", text: "Estudamos os contratos e as possibilidades de integração entre os serviços envolvidos no projeto." },
      { title: "Correções com contexto", text: "Investigamos a origem dos problemas e os fluxos afetados antes de alterar o comportamento do sistema." },
      { title: "Evolução responsável", text: "Consideramos as regras existentes, os dados e a experiência de quem já depende da aplicação." },
    ],
    deliverables: ["Análise do ambiente e do problema", "Proposta técnica com escopo definido", "Implementação ou correção acordada", "Validação dos fluxos afetados"],
    questions: [
      { question: "Vocês corrigem bugs em projetos de terceiros?", answer: "Sim, mediante avaliação técnica e acesso autorizado aos materiais necessários. A análise inicial identifica o problema, as dependências e as condições de execução." },
      { question: "Qualquer sistema pode ser integrado?", answer: "A viabilidade depende de interfaces disponíveis, documentação, permissões e limites de cada serviço. Não assumimos compatibilidade antes dessa avaliação." },
      { question: "O que preciso enviar para começar?", answer: "Uma descrição do problema, o comportamento esperado e informações gerais sobre o sistema. Não envie senhas ou credenciais pelo formulário de contato." },
    ],
  },
];

export function getSolution(slug: string) {
  return solutions.find((solution) => solution.slug === slug);
}
