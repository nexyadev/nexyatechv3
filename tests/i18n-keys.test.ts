import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ptBR } from "../i18n/messages/pt-BR";
import { ptPT } from "../i18n/messages/pt-PT";
import { en } from "../i18n/messages/en";

/** Lista todas as chaves (caminhos) de um dicionário; arrays contam pelo tamanho e pelas chaves dos itens. */
function paths(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) return value.flatMap((v, i) => paths(v, `${prefix}[${i}]`));
  if (value && typeof value === "object") return Object.entries(value).flatMap(([k, v]) => paths(v, prefix ? `${prefix}.${k}` : k));
  return [prefix];
}

describe("translation completeness", () => {
  const base = new Set(paths(ptBR).map((p) => p.replace(/\[\d+\]/g, "[]")));
  for (const [name, dict] of [["pt-PT", ptPT], ["en", en]] as const) {
    it(`${name} has every key of pt-BR (no silent fallback to Portuguese)`, () => {
      const keys = new Set(paths(dict).map((p) => p.replace(/\[\d+\]/g, "[]")));
      const missing = [...base].filter((k) => !keys.has(k));
      const extra = [...keys].filter((k) => !base.has(k));
      assert.deepEqual(missing, [], `${name} sem chaves: ${missing.join(", ")}`);
      assert.deepEqual(extra, [], `${name} com chaves a mais: ${extra.join(", ")}`);
    });
    it(`${name} has no empty strings except where pt-BR is also empty`, () => {
      const emptyBase = new Set(paths(ptBR).filter((p) => p.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k.replace(/\[\d+\]$/, "")], ptBR) === ""));
      const flat = (d: object, p: string) => p.split(/\.|\[|\]/).filter(Boolean).reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], d);
      const empties = paths(dict).filter((p) => flat(dict, p) === "" && flat(ptBR, p) !== "");
      assert.deepEqual(empties, [], `${name} com textos vazios: ${empties.join(", ")}`);
      void emptyBase;
    });
  }
});
