import type { Metadata } from "next";
import { ArrowUpRight, AtSign, Mail, MessageCircle } from "lucide-react";
import { PageIntro } from "@/components/ui";
import { ContactForm } from "@/components/contact/contact-form";
import { getMessages } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/routing";
import { siteConfig, whatsappHref } from "@/lib/config";
import { serviceBySolution } from "@/lib/contact";
import { pageContext, type LocaleParams } from "@/lib/page";
import { pageMetadata } from "@/lib/metadata";
import styles from "@/components/contact/contact.module.css";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getMessages(locale).contact.meta;
  return pageMetadata(locale, t.title, t.description, { pathname: "/contato" });
}

type ContactPageProps = LocaleParams & { searchParams: Promise<{ solucao?: string | string[] }> };

export default async function ContactPage({ params, searchParams }: ContactPageProps) {
  const { m } = await pageContext(params);
  const c = m.contact;
  const query = (await searchParams).solucao;
  const initialService = typeof query === "string" && Object.hasOwn(serviceBySolution, query) ? serviceBySolution[query] ?? "" : "";
  const direct = siteConfig.whatsappUrl ? whatsappHref(m.whatsapp.default) : null;
  return <>
    <PageIntro eyebrow={c.eyebrow} title={c.title} description={c.description} />
    <section className={`container ${styles.layout}`} aria-label={c.sectionAria}>
      <div className={styles.intro}>
        <h2>{c.introTitle}</h2>
        <p>{c.introText}</p>
        {direct && <a href={direct} className={styles.directLink} target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden="true" /><span>{c.whatsapp}<small>{c.whatsappSmall}</small></span><ArrowUpRight aria-hidden="true" /></a>}
        {siteConfig.email && <a href={`mailto:${siteConfig.email}`} className={styles.directLink}><Mail aria-hidden="true" /><span>{siteConfig.email}<small>{c.emailSmall}</small></span><ArrowUpRight aria-hidden="true" /></a>}
        {siteConfig.socials.map((social) => <a key={social.url} href={social.url} className={styles.directLink} target="_blank" rel="noopener noreferrer"><AtSign aria-hidden="true" /><span>{social.label}<small>{c.socialSmall}</small></span><ArrowUpRight aria-hidden="true" /></a>)}
        <div className={styles.processNote}><h3>{c.noteTitle}</h3><p>{c.noteText}</p></div>
      </div>
      <ContactForm initialService={initialService} form={m.form} />
    </section>
  </>;
}
