import { notFound } from "next/navigation";

// Qualquer rota desconhecida dentro de um idioma cai no 404 traduzido.
export default function CatchAll() {
  notFound();
}
