import type { Locale } from "@/i18n/routing";
import { getLocalizedProjects } from "./projects";

// Future approved sync belongs behind these functions. Do not fetch GitHub here yet.
export async function getProjects(locale: Locale) {
  return getLocalizedProjects(locale);
}

export async function getProject(locale: Locale, slug: string) {
  return getLocalizedProjects(locale).find((project) => project.slug === slug);
}
