import { ptBR, type Messages } from "./messages/pt-BR";
import { ptPT } from "./messages/pt-PT";
import { en } from "./messages/en";
import type { Locale } from "./routing";

export type { Messages };
const dictionaries: Record<Locale, Messages> = { "pt-BR": ptBR, "pt-PT": ptPT, en };

export function getMessages(locale: Locale): Messages {
  return dictionaries[locale];
}

/** Substitui {chave} pelo valor; o texto nunca é tratado como HTML. */
export function fmt(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`));
}

/** Nome de cada idioma escrito no próprio idioma (mesmo em todas as versões do site). */
export const localeNames: Record<Locale, string> = { "pt-BR": "Português (Brasil)", "pt-PT": "Português (Portugal)", en: "English" };
export const localeCodes: Record<Locale, string> = { "pt-BR": "BR", "pt-PT": "PT", en: "EN" };
