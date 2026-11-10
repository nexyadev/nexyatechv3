import { z } from "zod";

export const serviceOptions = [
  "Sistema sob medida",
  "Automações e IA",
  "Site ou experiência digital",
  "Integrações e correção de bugs",
  "NEXYA Auto",
  "Quero entender as possibilidades",
] as const;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Conte seu nome, com pelo menos 2 caracteres.").max(100, "Use até 100 caracteres."),
  email: z.string().trim().max(254, "Use um e-mail com até 254 caracteres.").email("Informe um e-mail válido."),
  company: z.string().trim().max(120, "Use até 120 caracteres."),
  service: z.string().refine((value) => serviceOptions.some((option) => option === value), "Selecione a solução que faz sentido para você."),
  message: z.string().trim().min(20, "Conte um pouco mais: use pelo menos 20 caracteres.").max(1500, "Use até 1.500 caracteres."),
  consent: z.boolean().refine((value) => value, "Confirme que deseja compartilhar estas informações pelo WhatsApp."),
});

export type ContactValues = z.infer<typeof contactSchema>;

export function buildContactMessage(values: ContactValues): string {
  const data = contactSchema.parse(values);
  return [
    "Olá, NEXYA! Quero conversar sobre um projeto.",
    "",
    `Nome: ${data.name}`,
    `E-mail: ${data.email}`,
    ...(data.company ? [`Empresa: ${data.company}`] : []),
    `Interesse: ${data.service}`,
    "",
    "Sobre o projeto:",
    data.message,
  ].join("\n");
}

export function buildContactWhatsAppUrl(message: string, phone: string): string | null {
  // The destination is a number configured by the owner, never a visitor-provided URL.
  const digits = phone.replace(/[\s()+-]/g, "");
  if (!/^\d{10,15}$/.test(digits)) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
