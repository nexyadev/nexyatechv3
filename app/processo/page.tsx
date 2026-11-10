import type { Metadata } from "next";
import { Check } from "lucide-react";
import { PageIntro, ButtonLink, FinalCta } from "@/components/ui";
import { Reveal } from "@/components/animations/reveal";
import { pageMetadata } from "@/lib/metadata";
import styles from "./process.module.css";

export const metadata: Metadata = pageMetadata("Como trabalhamos", "Da descoberta à evolução: conheça o processo da NEXYA Tech para transformar desafios em soluções digitais.", "/processo");

const steps = [
  { title:"Descoberta", caption:"Entender o que move o projeto", description:"Antes de falar em funcionalidades, conversamos sobre o negócio. Quem vai usar a solução, como a operação funciona hoje e qual mudança você quer alcançar.", items:["Contexto, necessidades e restrições","Fluxos atuais e pessoas envolvidas","Prioridades e critérios de sucesso"], output:"Um entendimento compartilhado do problema e das prioridades." },
  { title:"Estratégia", caption:"Dar direção à construção", description:"Organizamos as necessidades em um caminho viável. Escopo, experiência e decisões técnicas são definidos em conjunto para que a proposta seja clara.", items:["Escopo e etapas do projeto","Jornadas e direção de interface","Planejamento técnico e dependências"], output:"Uma proposta com entregas, condições e próximos passos definidos." },
  { title:"Desenvolvimento", caption:"Transformar intenção em solução", description:"Design e engenharia se encontram na implementação. As entregas são construídas e avaliadas conforme o plano, com atenção aos cenários reais de uso.", items:["Implementação por prioridades","Validação de funcionalidades e interface","Revisão e preparação da entrega"], output:"A solução implementada e validada conforme o escopo acordado." },
  { title:"Evolução", caption:"Aprender com o uso", description:"A experiência de uso traz novas perguntas. Avaliamos ajustes e oportunidades para definir como a solução pode continuar acompanhando a empresa.", items:["Observações e feedback de uso","Análise de ajustes e melhorias","Planejamento das próximas etapas"], output:"Prioridades de evolução, com escopo e condições definidos em nova etapa." },
];

export default function ProcessPage() {
  return <>
    <PageIntro eyebrow="Processo / Como trabalhamos" title="Grandes soluções começam com clareza." description="Um processo para conectar o desafio do negócio à execução técnica. Você entende o que estamos construindo, por que estamos construindo e qual é o próximo passo." />
    <section className={`container ${styles.timeline}`} aria-label="Etapas do nosso processo">{steps.map((step,index) => <Reveal key={step.title}><article className={styles.step}><div className={styles.stepNumber} aria-hidden="true"><span>0{index+1}</span></div><div className={styles.stepTitle}><p>{step.caption}</p><h2>{step.title}</h2></div><div className={styles.stepContent}><p>{step.description}</p><ul className={styles.stepItems}>{step.items.map((item) => <li key={item}><Check size={14} aria-hidden="true" />{item}</li>)}</ul><div className={styles.output}><strong>Ao final desta etapa</strong><br />{step.output}</div></div></article></Reveal>)}</section>
    <section className={styles.conversation}><div className={`container ${styles.conversationInner}`}><div><p className="eyebrow">A primeira conversa</p><h2>Você traz o contexto.<br />A gente começa a conectar as ideias.</h2></div><div><p>Não precisa chegar com uma especificação técnica. Algumas informações já ajudam a iniciar uma conversa produtiva:</p><ul className={styles.prepareList}><li>O que você quer resolver ou construir.</li><li>Como esse processo funciona hoje.</li><li>Quem vai utilizar a solução.</li><li>Prioridades, referências e prazos importantes.</li></ul><ButtonLink href="/contato">Vamos começar</ButtonLink></div></div></section>
    <FinalCta />
  </>;
}
