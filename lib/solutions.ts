import { getMessages } from "@/i18n/dictionaries";
import { solutionKeyFromSlug, solutionKeys, solutionSlug, type Locale, type SolutionKey } from "@/i18n/routing";

/** Estrutura fixa; textos vêm do dicionário do idioma (i18n/messages). */
export function getSolutions(locale: Locale) {
  const m = getMessages(locale);
  return solutionKeys.map((key, index) => ({ key, slug: solutionSlug(locale, key), number: String(index + 1).padStart(2, "0"), ...m.solutions[key] }));
}

export type Solution = ReturnType<typeof getSolutions>[number];

export function getSolution(locale: Locale, slug: string) {
  const key = solutionKeyFromSlug(locale, slug);
  return key ? getSolutions(locale).find((s) => s.key === key) : undefined;
}

export type { SolutionKey };
