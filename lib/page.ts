import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getMessages } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/routing";
import { whatsappHref } from "@/lib/config";

export type LocaleParams = { params: Promise<{ locale: string }> };

/** Resolve o idioma da rota (404 se inválido), habilita renderização estática e devolve os textos. */
export async function pageContext(params: Promise<{ locale: string }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const m = getMessages(locale as Locale);
  return { locale: locale as Locale, m, contactHref: whatsappHref(m.whatsapp.default) };
}
