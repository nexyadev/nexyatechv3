import type { Metadata } from "next";
import { Fragment } from "react";
import { PageIntro } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { getMessages } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/routing";
import { siteConfig, whatsappHref } from "@/lib/config";
import { pageContext, type LocaleParams } from "@/lib/page";
import { pageMetadata } from "@/lib/metadata";
import styles from "./privacy.module.css";

/**
 * Política nos 3 idiomas. pt-PT e en incluem RGPD/GDPR e ePrivacy.
 * PENDENTE DE REVISÃO JURÍDICA (todas as versões) e sem os dados do controlador: não publicar em produção
 * antes dessa revisão. As versões pt-PT e en mostram o aviso na própria página e ficam fora do índice de busca.
 */
export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getMessages(locale).privacy;
  return { ...pageMetadata(locale, t.meta.title, t.meta.description, { pathname: "/privacidade" }), ...(t.pendingReview ? { robots: { index: false, follow: true } } : {}) };
}

/** Negrito com **texto**; o resto é texto puro (nunca HTML). */
function Rich({ text }: { text: string }) {
  return <>{text.split(/(\*\*[^*]+\*\*)/).map((part, i) => part.startsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : <Fragment key={i}>{part}</Fragment>)}</>;
}

export default async function PrivacyPage({ params }: LocaleParams) {
  const { locale, m } = await pageContext(params);
  const p = m.privacy;
  const date = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${p.updatedDate}T12:00:00Z`));
  return <>
    <PageIntro eyebrow={p.eyebrow} title={p.title} description={p.description} />
    {p.pendingReview && <p className={`container ${styles.pending}`} role="note">{p.pendingReview}</p>}
    <div className={`container ${styles.layout}`}>
      <aside className={styles.aside}><p>{p.updated}<br /><time dateTime={p.updatedDate}>{date}</time></p><nav aria-label={p.navAria}>{p.sections.map((section) => <a key={section.id} href={`#${section.id}`}>{section.title}</a>)}</nav></aside>
      <div className={styles.content}>
        {p.sections.map((section, i) => <section id={section.id} key={section.id}>
          <h2>{String(i + 1).padStart(2, "0")}. {section.title}</h2>
          {section.paragraphs.map((text) => <p key={text}><Rich text={text} /></p>)}
          {"contactLine" in section && section.contactLine && <p>{siteConfig.whatsappUrl ? <a href={whatsappHref(m.whatsapp.default)} target="_blank" rel="noopener noreferrer">{p.whatsappLink}</a> : <Link href="/contato">{p.contactLink}</Link>}.</p>}
        </section>)}
      </div>
    </div>
  </>;
}
