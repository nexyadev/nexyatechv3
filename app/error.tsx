"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <section className="container status-page"><p className="eyebrow">UMA PAUSA INESPERADA</p><h1>Vamos tentar<br />mais uma vez.</h1><p>Não foi possível carregar esta página. Você pode tentar novamente ou voltar ao início.</p><div className="status-actions"><button type="button" className="button button-primary" onClick={() => reset()}>Tentar novamente ↗</button><Link href="/" className="button button-secondary">Voltar ao início</Link></div></section>;
}
