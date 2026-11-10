import { ArrowUpRight, AtSign, Mail, MessageCircle } from "lucide-react";
import { PageIntro } from "@/components/ui";
import { ContactForm } from "@/components/contact/contact-form";
import { siteConfig } from "@/lib/config";
import type { serviceOptions } from "@/lib/contact";
import { pageMetadata } from "@/lib/metadata";
import styles from "@/components/contact/contact.module.css";

export const metadata = pageMetadata("Vamos conversar", "Conte seu desafio à NEXYA Tech. Vamos conversar sobre sistemas, automações, sites e soluções técnicas para sua empresa.", "/contato");

const serviceBySlug: Readonly<Record<string, (typeof serviceOptions)[number]>> = {
  sistemas: "Sistema sob medida",
  automacoes: "Automações e IA",
  sites: "Site ou experiência digital",
  integracoes: "Integrações e correção de bugs",
};

type ContactPageProps = { searchParams: Promise<{ solucao?: string | string[] }> };

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const query = (await searchParams).solucao;
  const initialService = typeof query === "string" && Object.hasOwn(serviceBySlug, query)
    ? serviceBySlug[query] ?? ""
    : "";
  return <>
    <PageIntro eyebrow="Contato / Vamos construir" title="Grandes ideias começam com uma conversa." description="Você traz o desafio. A gente pensa na tecnologia para resolver." />
    <section className={`container ${styles.layout}`} aria-label="Entre em contato com a NEXYA">
      <div className={styles.intro}>
        <h2>Qual é o próximo passo da sua empresa?</h2>
        <p>Um sistema que organiza a operação. Uma automação que simplifica a rotina. Uma presença digital à altura do seu negócio. Vamos entender o que faz sentido para você.</p>
        {siteConfig.whatsappUrl && <a href={siteConfig.whatsappUrl} className={styles.directLink} target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden="true" /><span>Conversar pelo WhatsApp<small>Fale diretamente com a NEXYA</small></span><ArrowUpRight aria-hidden="true" /></a>}
        {siteConfig.email && <a href={`mailto:${siteConfig.email}`} className={styles.directLink}><Mail aria-hidden="true" /><span>{siteConfig.email}<small>Prefere escrever um e-mail?</small></span><ArrowUpRight aria-hidden="true" /></a>}
        {siteConfig.socials.map((social) => <a key={social.url} href={social.url} className={styles.directLink} target="_blank" rel="noopener noreferrer"><AtSign aria-hidden="true" /><span>{social.label}<small>Acompanhe nosso universo</small></span><ArrowUpRight aria-hidden="true" /></a>)}
        <div className={styles.processNote}><h3>Primeiro, entender. Depois, propor.</h3><p>A conversa inicial serve para conhecer seu contexto, suas prioridades e o resultado esperado. O escopo e as condições do projeto são definidos com você.</p></div>
      </div>
      <ContactForm initialService={initialService} />
    </section>
  </>;
}
