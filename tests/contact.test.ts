import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildContactMessage, buildContactWhatsAppUrl, createContactSchema, type ContactValues } from "../lib/contact";
import { ptBR } from "../i18n/messages/pt-BR";
import { en } from "../i18n/messages/en";
import { ptPT } from "../i18n/messages/pt-PT";

const form = ptBR.form;
const contactSchema = createContactSchema(form.errors);
const valid: ContactValues = { name: "Ana Lima", email: "ana@example.com", company: "", service: "sistema", message: "Quero organizar os processos da minha empresa.", consent: true };

describe("contact briefing validation", () => {
  it("accepts a complete briefing and trims fields", () => {
    const result = contactSchema.parse({ ...valid, name: "  Ana Lima  ", company: "  " });
    assert.equal(result.name, "Ana Lima");
    assert.equal(result.company, "");
  });
  it("rejects missing consent, invalid email, unknown service and whitespace-only message", () => {
    for (const patch of [{ consent: false }, { email: "invalid" }, { service: "desconhecido" }, { message: "                          " }]) {
      assert.equal(contactSchema.safeParse({ ...valid, ...patch }).success, false);
    }
  });
  it("rejects oversized visitor text", () => {
    assert.equal(contactSchema.safeParse({ ...valid, message: "a".repeat(1501) }).success, false);
    assert.equal(contactSchema.safeParse({ ...valid, company: "a".repeat(121) }).success, false);
  });
  it("never prepares a message without valid consent", () => {
    assert.throws(() => buildContactMessage({ ...valid, consent: false }, form));
  });
  it("omits an empty optional company and includes a provided company", () => {
    assert.equal(buildContactMessage(valid, form).includes("Empresa:"), false);
    assert.match(buildContactMessage({ ...valid, company: "Oficina da Ana" }, form), /Empresa: Oficina da Ana/);
  });
  it("writes the WhatsApp message and the Zod errors in the page language", () => {
    const english = buildContactMessage(valid, en.form);
    assert.match(english, /^Hi, NEXYA!/);
    assert.match(english, /Interest: Custom software/);
    assert.match(buildContactMessage(valid, ptPT.form), /Interesse: Software à medida/);
    const error = createContactSchema(en.form.errors).safeParse({ ...valid, email: "invalid" });
    assert.equal(error.success, false);
    assert.equal(error.error?.issues[0]?.message, "Enter a valid email address.");
  });
});

describe("WhatsApp handoff", () => {
  it("encodes full Portuguese text without changing its content", () => {
    const message = buildContactMessage({ ...valid, message: "Preciso de uma solução: integração & gestão + automação." }, form);
    const href = buildContactWhatsAppUrl(message, "+55 (41) 99783-0046");
    assert.ok(href);
    const url = new URL(href);
    assert.equal(url.origin, "https://wa.me");
    assert.equal(url.pathname, "/5541997830046");
    assert.equal(url.searchParams.get("text"), message);
  });
  it("rejects empty, malformed or injected destinations", () => {
    for (const phone of ["", "123", "javascript:alert(1)", "5541997830046?text=bad", "1".repeat(16)]) {
      assert.equal(buildContactWhatsAppUrl("hello", phone), null);
    }
  });
});
