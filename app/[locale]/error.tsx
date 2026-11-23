"use client";

import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useI18n } from "@/components/i18n/i18n-provider";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const s = useI18n().m.status;
  return <section className="container status-page"><p className="eyebrow">{s.errorEyebrow}</p><h1>{s.errorTitle1}<br />{s.errorTitle2}</h1><p>{s.errorText}</p><div className="status-actions"><button type="button" className="button button-primary" onClick={() => reset()}>{s.retry} <ArrowUpRight size={17} aria-hidden="true" /></button><Link href="/" className="button button-secondary">{s.home}</Link></div></section>;
}
