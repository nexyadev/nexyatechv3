import { getLocale } from "next-intl/server";
import { ButtonLink } from "@/components/ui";
import { getMessages } from "@/i18n/dictionaries";
import { defaultLocale, isLocale } from "@/i18n/routing";

export default async function NotFound() {
  const requested = await getLocale();
  const s = getMessages(isLocale(requested) ? requested : defaultLocale).status;
  return <section className="container status-page"><p className="eyebrow">{s.notFoundEyebrow}</p><h1>{s.notFoundTitle1}<br />{s.notFoundTitle2}</h1><p>{s.notFoundText}</p><div className="status-actions"><ButtonLink href="/">{s.home}</ButtonLink><ButtonLink href="/solucoes" variant="secondary">{s.solutions}</ButtonLink></div><span className="status-watermark" aria-hidden="true">404</span></section>;
}
