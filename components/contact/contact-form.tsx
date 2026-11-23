"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotionPref } from "@/lib/motion";
import { ArrowUpRight, Check, Copy, MessageCircle, Pencil, ShieldCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Messages } from "@/i18n/dictionaries";
import { siteConfig } from "@/lib/config";
import { buildContactMessage, buildContactWhatsAppUrl, createContactSchema, serviceKeys, type ContactValues, type ServiceKey } from "@/lib/contact";
import styles from "./contact.module.css";

const subscribe = () => () => {};

/** Formulário no idioma da página: rótulos, erros do Zod e a mensagem pronta do WhatsApp. */
export function ContactForm({ initialService = "", form: f }: { initialService?: ServiceKey | ""; form: Messages["form"] }) {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const reducedMotion = useReducedMotionPref();
  const [preparedMessage, setPreparedMessage] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "unavailable">("idle");
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const schema = useMemo(() => createContactSchema(f.errors), [f.errors]);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ContactValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", company: "", service: initialService, message: "", consent: false },
    mode: "onBlur",
  });

  function prepare(values: ContactValues) {
    setPreparedMessage(buildContactMessage(values, f));
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
      <div className={styles.panelHeader}><span className="eyebrow">{f.eyebrow}</span><span className={styles.stepIndicator}>{preparedMessage ? "02 / 02" : "01 / 02"}</span></div>
      <AnimatePresence mode="wait" initial={false}>
        {preparedMessage ? (
          <motion.div key="preview" initial={reducedMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} onAnimationComplete={() => headingRef.current?.focus()} transition={{ duration: reducedMotion ? 0 : 0.2 }}>
            <div className={styles.successIcon}><Check size={23} aria-hidden="true" /></div>
            <h2 ref={headingRef} tabIndex={-1} className={styles.formTitle}>{f.readyTitle}</h2>
            <p className={styles.formDescription}>{f.readyText}</p>
            <label className={styles.fieldLabel} htmlFor="message-preview">{f.previewLabel}</label>
            <textarea ref={messageRef} id="message-preview" className={`${styles.input} ${styles.preview}`} readOnly value={preparedMessage} rows={11} />
            <div className={styles.previewActions}>
              {whatsappHref ? <a className="button button-primary" href={whatsappHref} target="_blank" rel="noopener noreferrer">{f.continue} <ArrowUpRight size={17} aria-hidden="true" /></a> : <p role="status" className={styles.error}>{f.noDestination}</p>}
              <button type="button" className={styles.copyButton} onClick={copyMessage}>{copyStatus === "copied" ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />} {copyStatus === "copied" ? f.copied : f.copy}</button>
            </div>
            <p className={styles.status} role="status" aria-live="polite">{copyStatus === "copied" ? f.copiedStatus : copyStatus === "unavailable" ? f.copyFailed : f.nothingSent}</p>
            <button className={styles.editButton} type="button" onClick={() => { setPreparedMessage(null); setCopyStatus("idle"); }}><Pencil size={15} aria-hidden="true" /> {f.edit}</button>
          </motion.div>
        ) : (
          <motion.form key="form" noValidate onSubmit={handleSubmit(prepare)} initial={false} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.15 }} method="post">
            <h2 className={styles.formTitle}>{f.title}</h2>
            <p className={styles.formDescription}>{f.description}</p>
            <fieldset disabled={!hydrated || isSubmitting} className={styles.fieldset}>
              <legend className="sr-only">{f.legend}</legend>
              <div className={styles.fieldRow}>
                <div className={styles.field}><label htmlFor="contact-name">{f.name} <span aria-hidden="true">*</span></label><input id="contact-name" required className={styles.input} autoComplete="name" maxLength={100} placeholder={f.namePlaceholder} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} {...register("name")} />{errors.name && <p id="name-error" className={styles.error} role="alert">{errors.name.message}</p>}</div>
                <div className={styles.field}><label htmlFor="contact-email">{f.email} <span aria-hidden="true">*</span></label><input id="contact-email" type="email" required className={styles.input} autoComplete="email" maxLength={254} placeholder={f.emailPlaceholder} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} {...register("email")} />{errors.email && <p id="email-error" className={styles.error} role="alert">{errors.email.message}</p>}</div>
              </div>
              <div className={styles.field}><label htmlFor="contact-company">{f.company} <span className={styles.optional}>{f.optional}</span></label><input id="contact-company" className={styles.input} autoComplete="organization" maxLength={120} placeholder={f.companyPlaceholder} aria-invalid={Boolean(errors.company)} aria-describedby={errors.company ? "company-error" : undefined} {...register("company")} />{errors.company && <p id="company-error" className={styles.error} role="alert">{errors.company.message}</p>}</div>
              <div className={styles.field}><label htmlFor="contact-service">{f.service} <span aria-hidden="true">*</span></label><select id="contact-service" required className={styles.input} aria-invalid={Boolean(errors.service)} aria-describedby={errors.service ? "service-error" : undefined} {...register("service")}><option value="">{f.servicePlaceholder}</option>{serviceKeys.map((key) => <option key={key} value={key}>{f.services[key]}</option>)}</select>{errors.service && <p id="service-error" className={styles.error} role="alert">{errors.service.message}</p>}</div>
              <div className={styles.field}><label htmlFor="contact-message">{f.message} <span aria-hidden="true">*</span></label><textarea id="contact-message" required className={styles.input} rows={5} maxLength={1500} placeholder={f.messagePlaceholder} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? "message-hint message-error" : "message-hint"} {...register("message")} /><span id="message-hint" className={styles.hint}>{f.messageHint}</span>{errors.message && <p id="message-error" className={styles.error} role="alert">{errors.message.message}</p>}</div>
              <div className={styles.consent}><input id="contact-consent" type="checkbox" required aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent ? "consent-error" : undefined} {...register("consent")} /><label htmlFor="contact-consent">{f.consentBefore} <Link href="/privacidade">{f.consentLink}</Link>.</label></div>
              {errors.consent && <p id="consent-error" className={styles.error} role="alert">{errors.consent.message}</p>}
              <button type="submit" className={`button button-primary ${styles.submit}`} disabled={!hydrated || isSubmitting}>{isSubmitting ? f.preparing : f.submit}<ArrowUpRight size={18} aria-hidden="true" /></button>
            </fieldset>
            <p className={styles.disclosure}><ShieldCheck size={15} aria-hidden="true" /> {f.disclosure}</p>
            <noscript><p className={styles.error}>{f.noscript}</p></noscript>
          </motion.form>
        )}
      </AnimatePresence>
      <div className={styles.panelFooter}><MessageCircle size={15} aria-hidden="true" /><span>{f.footer}</span></div>
    </div>
  );
}
