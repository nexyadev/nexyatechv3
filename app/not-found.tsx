import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return <section className="container status-page"><p className="eyebrow">404 / FORA DA ROTA</p><h1>A próxima ideia<br />está em outro lugar.</h1><p>Esta página não existe. Explore nossas soluções ou volte ao início para continuar.</p><div className="status-actions"><ButtonLink href="/">Voltar ao início</ButtonLink><ButtonLink href="/solucoes" variant="secondary">Explorar soluções</ButtonLink></div><span className="status-watermark" aria-hidden="true">404</span></section>;
}
