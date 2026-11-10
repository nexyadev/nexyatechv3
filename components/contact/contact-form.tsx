"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Check, Copy, MessageCircle, Pencil, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/lib/config";
import { buildContactMessage, buildContactWhatsAppUrl, contactSchema, serviceOptions, type ContactValues } from "@/lib/contact";
import styles from "./contact.module.css";

const subscribe = () => () => {};

export function ContactForm({ initialService = "" }: { initialService?: (typeof serviceOptions)[number] | "" }) {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const reducedMotion = useReducedMotion();
  const [preparedMessage, setPreparedMessage] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "unavailable">("idle");
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", company: "", service: initialService, message: "", consent: false },
    mode: "onBlur",
  });

  function prepare(values: ContactValues) {
    setPreparedMessage(buildContactMessage(values));
    setCopyStatus("idle");
  }

  async function copyMessage() {
    if (!preparedMessage) return;
    try {
      await navigator.clipboard.writeText(preparedMessage);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("unavailable");
      messageRef.current?.focus();
      messageRef.current?.select();
    }
  }

  const whatsappHref = preparedMessage ? buildContactWhatsAppUrl(preparedMessage, siteConfig.whatsappNumber) : null;

  return (
    <div className={styles.formPanel}>
      <div className={styles.panelHeader}><span className="eyebrow">Briefing inicial</span><span className={styles.stepIndicator}>{preparedMessage ? "02 / 02" : "01 / 02"}</span></div>
      <AnimatePresence mode="wait" initial={false}>
        {preparedMessage ? (
          <motion.div key="preview" initial={reducedMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} onAnimationComplete={() => headingRef.current?.focus()} transition={{ duration: reducedMotion ? 0 : 0.2 }}>
            <div className={styles.successIcon}><Check size={23} aria-hidden="true" /></div>
            <h2 ref={headingRef} tabIndex={-1} className={styles.formTitle}>Sua conversa está pronta.</h2>
            <p className={styles.formDescription}>Revise a mensagem abaixo. Ela só será compartilhada quando você abrir o WhatsApp e confirmar o envio por lá.</p>
            <label className={styles.fieldLabel} htmlFor="message-preview">Mensagem para a NEXYA</label>
            <textarea ref={messageRef} id="message-preview" className={`${styles.input} ${styles.preview}`} readOnly value={preparedMessage} rows={11} />
            <div className={styles.previewActions}>
              {whatsappHref ? <a className="button button-primary" href={whatsappHref} target="_blank" rel="noopener noreferrer">Continuar no WhatsApp <ArrowUpRight size={17} aria-hidden="true" /></a> : <p role="status" className={styles.error}>O destino do WhatsApp ainda precisa ser configurado. Você pode copiar seu briefing e guardar para entrar em contato.</p>}
              <button type="button" className={styles.copyButton} onClick={copyMessage}>{copyStatus === "copied" ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />} {copyStatus === "copied" ? "Mensagem copiada" : "Copiar mensagem"}</button>
            </div>
            <p className={styles.status} role="status" aria-live="polite">{copyStatus === "copied" ? "Mensagem copiada para a área de transferência." : copyStatus === "unavailable" ? "Não foi possível copiar automaticamente. A mensagem foi selecionada para você copiar manualmente." : "Nenhuma informação foi enviada por este site."}</p>
            <button className={styles.editButton} type="button" onClick={() => { setPreparedMessage(null); setCopyStatus("idle"); }}><Pencil size={15} aria-hidden="true" /> Editar informações</button>
          </motion.div>
        ) : (
          <motion.form key="form" noValidate onSubmit={handleSubmit(prepare)} initial={false} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.15 }} method="post">
            <h2 className={styles.formTitle}>Conte o que você tem em mente.</h2>
            <p className={styles.formDescription}>Algumas informações já ajudam a começar a conversa certa.</p>
            <fieldset disabled={!hydrated || isSubmitting} className={styles.fieldset}>
              <legend className="sr-only">Informações sobre você e seu projeto</legend>
              <div className={styles.fieldRow}>
                <div className={styles.field}><label htmlFor="contact-name">Seu nome <span aria-hidden="true">*</span></label><input id="contact-name" required className={styles.input} autoComplete="name" maxLength={100} placeholder="Como podemos chamar você?" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} {...register("name")} />{errors.name && <p id="name-error" className={styles.error} role="alert">{errors.name.message}</p>}</div>
                <div className={styles.field}><label htmlFor="contact-email">E-mail <span aria-hidden="true">*</span></label><input id="contact-email" type="email" required className={styles.input} autoComplete="email" maxLength={254} placeholder="voce@empresa.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} {...register("email")} />{errors.email && <p id="email-error" className={styles.error} role="alert">{errors.email.message}</p>}</div>
              </div>
              <div className={styles.field}><label htmlFor="contact-company">Empresa <span className={styles.optional}>(opcional)</span></label><input id="contact-company" className={styles.input} autoComplete="organization" maxLength={120} placeholder="Nome do seu negócio" aria-invalid={Boolean(errors.company)} aria-describedby={errors.company ? "company-error" : undefined} {...register("company")} />{errors.company && <p id="company-error" className={styles.error} role="alert">{errors.company.message}</p>}</div>
              <div className={styles.field}><label htmlFor="contact-service">Como podemos ajudar? <span aria-hidden="true">*</span></label><select id="contact-service" required className={styles.input} aria-invalid={Boolean(errors.service)} aria-describedby={errors.service ? "service-error" : undefined} {...register("service")}><option value="">Selecione uma solução</option>{serviceOptions.map((service) => <option key={service} value={service}>{service}</option>)}</select>{errors.service && <p id="service-error" className={styles.error} role="alert">{errors.service.message}</p>}</div>
              <div className={styles.field}><label htmlFor="contact-message">Seu projeto <span aria-hidden="true">*</span></label><textarea id="contact-message" required className={styles.input} rows={5} maxLength={1500} placeholder="Qual desafio você quer resolver? Se já tiver uma ideia, prazo ou contexto, conte para nós." aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? "message-hint message-error" : "message-hint"} {...register("message")} /><span id="message-hint" className={styles.hint}>De 20 a 1.500 caracteres. Evite incluir senhas ou informações sensíveis.</span>{errors.message && <p id="message-error" className={styles.error} role="alert">{errors.message.message}</p>}</div>
              <div className={styles.consent}><input id="contact-consent" type="checkbox" required aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent ? "consent-error" : undefined} {...register("consent")} /><label htmlFor="contact-consent">Concordo em compartilhar estas informações com a NEXYA pelo WhatsApp e li a <Link href="/privacidade">política de privacidade</Link>.</label></div>
              {errors.consent && <p id="consent-error" className={styles.error} role="alert">{errors.consent.message}</p>}
              <button type="submit" className={`button button-primary ${styles.submit}`} disabled={!hydrated || isSubmitting}>{isSubmitting ? "Preparando…" : "Preparar conversa"}<ArrowUpRight size={18} aria-hidden="true" /></button>
            </fieldset>
            <p className={styles.disclosure}><ShieldCheck size={15} aria-hidden="true" /> Você revisa a mensagem antes de abrir o WhatsApp.</p>
            <noscript><p className={styles.error}>Ative o JavaScript para preparar seu briefing ou use o link direto do WhatsApp nesta página.</p></noscript>
          </motion.form>
        )}
      </AnimatePresence>
      <div className={styles.panelFooter}><MessageCircle size={15} aria-hidden="true" /><span>Uma boa solução começa com uma boa conversa.</span></div>
    </div>
  );
}
