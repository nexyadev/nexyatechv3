import Image from "next/image";
import { Camera, CarFront, Check, ClipboardCheck, FileText, Users, Workflow } from "lucide-react";
import { ButtonLink, SectionHeading } from "@/components/ui";
import { ProductDiagram } from "@/components/product/product-diagram";
import { Reveal } from "@/components/animations/reveal";
import { siteConfig } from "@/lib/config";
import { pageMetadata } from "@/lib/metadata";
import styles from "@/components/product/product.module.css";

export const metadata = pageMetadata("NEXYA Auto — Gestão para oficinas", "Organize clientes, veículos, ordens de serviço, checklists com fotos e orçamentos. Conheça a NEXYA Auto e teste grátis por 7 dias.", "/nexya-auto");

const benefits = [
  { icon: Users, title: "Clientes e veículos organizados", text: "Mantenha os cadastros da oficina em um lugar e encontre as informações que você precisa para cada atendimento." },
  { icon: ClipboardCheck, title: "Ordens de serviço com contexto", text: "Registre os serviços e acompanhe cada atendimento com as informações do cliente e do veículo." },
  { icon: Camera, title: "Entrada registrada com cuidado", text: "Use checklists e fotos de entrada para documentar a condição do veículo antes de começar o serviço." },
  { icon: FileText, title: "Orçamentos que fazem parte do fluxo", text: "Organize os orçamentos junto da rotina de atendimento e mantenha as informações à mão." },
];

const workflow = [
  { number: "01", title: "Entrada do carro", text: "Receba o veículo e identifique o cliente e o atendimento." },
  { number: "02", title: "Registro", text: "Organize o cadastro, o checklist e as fotos de entrada." },
  { number: "03", title: "Serviço", text: "Trabalhe com orçamento e ordem de serviço organizados." },
  { number: "04", title: "Entrega", text: "Consulte os registros do atendimento ao concluir o serviço." },
];

const faqs = [
  { question: "Para quem é a NEXYA Auto?", answer: "A NEXYA Auto é uma plataforma de gestão para oficinas que querem organizar clientes, veículos, ordens de serviço, checklists, fotos de entrada e orçamentos." },
  { question: "Como funciona o teste gratuito de 7 dias?", answer: "Basta criar sua conta no site da NEXYA Auto. O período de 7 dias é liberado automaticamente após o cadastro, para você conhecer o sistema na rotina da sua oficina." },
  { question: "Posso registrar fotos na entrada do veículo?", answer: "Sim. O sistema oferece checklists e fotos de entrada para registrar as condições do veículo antes do serviço." },
  { question: "A NEXYA Auto é um produto da NEXYA Tech?", answer: "Sim. É um produto da NEXYA Tech dedicado à gestão de oficinas. Você pode falar com a equipe para entender o produto e conhecer outras soluções sob medida." },
  { question: "Como posso tirar dúvidas antes de começar?", answer: "Fale com a NEXYA pelo WhatsApp. Conte como funciona sua oficina e quais informações você precisa organizar para conversarmos sobre o uso do sistema." },
];

export default function NexyaAutoPage() {
  const trialHref = siteConfig.trialUrl ?? siteConfig.whatsappUrl ?? "/contato";
  const externalTrial = trialHref.startsWith("https://");
  return <div className={styles.productPage}>
    <section className={styles.productHero}>
      <div className={`container ${styles.heroLayout}`}>
        <div className={styles.heroCopy}>
          <div className={styles.productLabel}>NEXYA AUTO · UM PRODUTO NEXYA TECH</div>
          <h1 className={styles.heroTitle}>Gestão inteligente para oficinas que querem <span>ter controle.</span></h1>
          <p className={styles.heroDescription}>Da entrada do veículo à entrega. Clientes, ordens de serviço, checklists e orçamentos conectados à rotina da sua oficina.</p>
          <div className={styles.heroActions}><ButtonLink href={trialHref} {...(externalTrial ? { target: "_blank", rel: "noopener noreferrer" } : {})}>Testar grátis por 7 dias</ButtonLink><ButtonLink href="#recursos" variant="text">Conhecer os recursos</ButtonLink></div>
          <p className={styles.trialNote}>Crie sua conta. Os 7 dias de teste começam automaticamente.</p>
        </div>
        <ProductDiagram />
      </div>
    </section>
    <div className="container"><div className={styles.featureRail} aria-label="Recursos da NEXYA Auto"><span><Users aria-hidden="true" /> Clientes</span><span><CarFront aria-hidden="true" /> Veículos</span><span><ClipboardCheck aria-hidden="true" /> Ordens de serviço</span><span><Camera aria-hidden="true" /> Checklists e fotos</span><span><FileText aria-hidden="true" /> Orçamentos</span></div></div>
    <section className="section container" id="recursos">
      <div className={styles.benefitLayout}>
        <Reveal><div className={styles.benefitIntro}><span className="eyebrow">01 / Controle na prática</span><h2>A oficina em movimento.<br />A gestão no lugar.</h2><p>Quando as informações estão organizadas, fica mais claro o que precisa acontecer em cada atendimento. A NEXYA Auto reúne os registros essenciais desse caminho.</p></div></Reveal>
        <div className={styles.benefitList}>{benefits.map(({ icon: Icon, title, text }, index) => <Reveal key={title} delay={index * 0.05}><article className={styles.benefit}><Icon aria-hidden="true" /><div><h3>{title}</h3><p>{text}</p></div></article></Reveal>)}</div>
      </div>
    </section>
    <section className={`section ${styles.flowSection}`}>
      <div className="container"><SectionHeading eyebrow="02 / Do início ao fim" title="Um fluxo que acompanha o serviço." description="As etapas da oficina, conectadas por informações organizadas." /><div className={styles.flowGrid}>{workflow.map((step, index) => <Reveal key={step.number} delay={index * 0.07}><article className={styles.flowStep}><span className={styles.flowNumber}>{step.number}</span><h3>{step.title}</h3><p>{step.text}</p></article></Reveal>)}</div></div>
    </section>
    <section className={`section container ${styles.detailSection}`}>
      <Reveal><figure className={styles.orderFigure}><div className={styles.orderScreen}><Image src="/images/nexya-auto-service-order.webp" width={1168} height={750} sizes="(max-width: 900px) 92vw, 52vw" className={styles.orderImage} alt="Tela real de ordem de serviço da NEXYA Auto, com informações sensíveis ocultadas na imagem de divulgação." /></div><figcaption>Ordem de serviço real do produto. Dados ocultados na imagem de divulgação.</figcaption></figure></Reveal>
      <Reveal delay={0.1}><div className={styles.detailCopy}><span className="eyebrow">03 / Informação que acompanha</span><h2>Mais clareza em cada ordem de serviço.</h2><p>Uma operação organizada começa nos registros. Tenha as informações do atendimento por perto, do primeiro contato à conclusão do serviço.</p><ul className={styles.checkList}><li><Check aria-hidden="true" /> Informações do cliente e do veículo</li><li><Check aria-hidden="true" /> Registro dos serviços e orçamentos</li><li><Check aria-hidden="true" /> Checklists e fotos da entrada</li></ul></div></Reveal>
    </section>
    <section className={`section container ${styles.faqLayout}`}>
      <div className={styles.faqIntro}><span className="eyebrow">04 / Antes de começar</span><h2>Vamos esclarecer.</h2><p>Conheça o essencial sobre a NEXYA Auto. Para entender seu cenário, nossa equipe está a uma conversa de distância.</p></div>
      <div className={styles.faqList}>{faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div>
    </section>
    <section className={styles.autoCta}>
      <span className="eyebrow"><Workflow size={14} aria-hidden="true" /> NEXYA AUTO</span><h2>O próximo passo da sua oficina começa aqui.</h2><p>Conheça a NEXYA Auto na prática. Crie sua conta e experimente o sistema por 7 dias.</p><div className={styles.ctaLinks}><ButtonLink href={trialHref} {...(externalTrial ? { target: "_blank", rel: "noopener noreferrer" } : {})}>Testar grátis por 7 dias</ButtonLink><ButtonLink href={siteConfig.whatsappUrl ?? "/contato"} variant="text" {...(siteConfig.whatsappUrl ? { target: "_blank", rel: "noopener noreferrer" } : {})}>Falar com a equipe</ButtonLink></div>
    </section>
  </div>;
}
