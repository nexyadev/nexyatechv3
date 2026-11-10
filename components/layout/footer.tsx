import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/lib/config";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-brand">
          <Link href="/" aria-label="NEXYA Tech — início"><Image src="/images/logo-nexya.png" alt="NEXYA Tech" width={195} height={65} sizes="195px" /></Link>
          <p>Ideias conectadas.<br />Possibilidades em movimento.</p>
          <span className="eyebrow footer-signature">ENGENHARIA + DESIGN + EVOLUÇÃO</span>
        </div>
        <div className="footer-links"><h2>Explore</h2><Link href="/sobre">Sobre a NEXYA</Link><Link href="/portfolio">Portfólio</Link><Link href="/processo">Nosso processo</Link><Link href="/contato">Fale com a gente</Link></div>
        <div className="footer-links"><h2>Soluções</h2><Link href="/solucoes/sistemas">Sistemas sob medida</Link><Link href="/solucoes/automacoes">Automações e IA</Link><Link href="/solucoes/sites">Sites e experiências</Link><Link href="/solucoes/integracoes">Integrações e evolução</Link><Link href="/nexya-auto">NEXYA Auto <ArrowUpRight size={12} /></Link></div>
        <div className="footer-links"><h2>Conecte-se</h2>{siteConfig.socials.map((social) => <a href={social.url} key={social.url} target="_blank" rel="noopener noreferrer">{social.label.replace("Instagram · ", "")} <ArrowUpRight size={12} /></a>)}<Link href="/privacidade">Privacidade</Link></div>
      </div>
      <div className="container footer-bottom"><span>© {new Date().getFullYear()} NEXYA Tech. Todos os direitos reservados.</span><span>Desenvolvido pela <strong>NEXYA Tech</strong><span className="footer-dot" /></span></div>
    </footer>
  );
}
