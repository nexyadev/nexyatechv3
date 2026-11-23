import { z } from "zod";
import type { Messages } from "@/i18n/dictionaries";

/** Valores internos (estáveis entre idiomas); o rótulo exibido vem do dicionário. */
export const serviceKeys = ["sistema", "automacao", "site", "integracao", "auto", "duvida"] as const;
export type ServiceKey = (typeof serviceKeys)[number];

/** ?solucao=<chave da solução> pré-seleciona o serviço. */
export const serviceBySolution: Readonly<Record<string, ServiceKey>> = { sistemas: "sistema", automacoes: "automacao", sites: "site", integracoes: "integracao" };

export function createContactSchema(errors: Messages["form"]["errors"]) {
  return z.object({
    name: z.string().trim().min(2, errors.nameMin).max(100, errors.nameMax),
    email: z.string().trim().max(254, errors.emailMax).email(errors.email),
    company: z.string().trim().max(120, errors.companyMax),
    service: z.string().refine((value) => serviceKeys.some((key) => key === value), errors.service),
    message: z.string().trim().min(20, errors.messageMin).max(1500, errors.messageMax),
    consent: z.boolean().refine((value) => value, errors.consent),
  });
}

export type ContactValues = z.infer<ReturnType<typeof createContactSchema>>;

/** Mensagem do WhatsApp no idioma da página. */
export function buildContactMessage(values: ContactValues, form: Messages["form"]): string {
  const data = createContactSchema(form.errors).parse(values);
  const w = form.whatsapp;
  return [
    w.greeting,
    "",
    `${w.name}: ${data.name}`,
    `${w.email}: ${data.email}`,
    ...(data.company ? [`${w.company}: ${data.company}`] : []),
    `${w.service}: ${form.services[data.service as ServiceKey]}`,
    "",
    w.about,
    data.message,
  ].join("\n");
}

export function buildContactWhatsAppUrl(message: string, phone: string): string | null {
  // The destination is a number configured by the owner, never a visitor-provided URL.
  const digits = phone.replace(/[\s()+-]/g, "");
  if (!/^\d{10,15}$/.test(digits)) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
