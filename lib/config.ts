function httpUrl(value: string | undefined): string | null {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    return ["https:", "http:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5541997830046").replace(/\D/g, "");
const techInstagram = httpUrl(process.env.NEXT_PUBLIC_INSTAGRAM_TECH ?? "https://www.instagram.com/nexya.tech/");
const autoInstagram = httpUrl(process.env.NEXT_PUBLIC_INSTAGRAM_AUTO ?? "https://www.instagram.com/nexya.auto/");

export const siteConfig = {
  name: "NEXYA Tech",
  url: httpUrl(process.env.NEXT_PUBLIC_SITE_URL) ?? "http://localhost:3000/",
  whatsappNumber,
  whatsappUrl: /^\d{10,15}$/.test(whatsappNumber) ? `https://wa.me/${whatsappNumber}` : null,
  autoUrl: httpUrl(process.env.NEXT_PUBLIC_AUTO_URL ?? "https://nexyaauto.com/"),
  trialUrl: httpUrl(process.env.NEXT_PUBLIC_AUTO_TRIAL_URL ?? "https://nexyaauto.com/register"),
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || null,
  socials: [
    ...(techInstagram ? [{ label: "Instagram · NEXYA Tech", url: techInstagram }] : []),
    ...(autoInstagram ? [{ label: "Instagram · NEXYA Auto", url: autoInstagram }] : []),
  ],
} as const;

/** Link do WhatsApp com mensagem pronta; sem número configurado, cai em /contato. */
export function whatsappHref(message: string) {
  return siteConfig.whatsappUrl ? `${siteConfig.whatsappUrl}?text=${encodeURIComponent(message)}` : "/contato";
}

export const contactUrl = siteConfig.whatsappUrl
  ? `${siteConfig.whatsappUrl}?text=${encodeURIComponent("Olá! Quero conversar sobre um projeto com a NEXYA Tech.")}`
  : "/contato";
