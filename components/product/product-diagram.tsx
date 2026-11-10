import Image from "next/image";
import { ArrowUpRight, CheckCheck, Command, Minus, Square } from "lucide-react";
import styles from "./product.module.css";

/** Product artwork uses a real, public NEXYA Auto screenshot, never a simulated UI. */
export function ProductDiagram({ compact = false }: { compact?: boolean }) {
  return (
    <figure className={`${styles.productVisual} ${compact ? styles.compact : ""}`}>
      <div className={styles.visualOrbit} aria-hidden="true" />
      <div className={styles.visualCross} aria-hidden="true">+</div>
      <div className={styles.device}>
        <div className={styles.deviceChrome} aria-hidden="true"><div className={styles.windowDots}><i /><i /><i /></div><span><Command size={10} /> NEXYA AUTO / VISÃO GERAL</span><div className={styles.windowControls}><Minus size={10} /><Square size={8} /></div></div>
        <Image src="/images/nexya-auto-dashboard.webp" alt="Interface real da NEXYA Auto: visão geral de ordens de serviço, clientes e veículos, com dados de divulgação ocultados." width={1440} height={900} sizes={compact ? "(max-width: 760px) 92vw, 54vw" : "(max-width: 900px) 92vw, 58vw"} className={styles.dashboardImage} />
        <div className={styles.deviceBottom} aria-hidden="true"><span /><i /></div>
      </div>
      <div className={styles.featureChip}><span className={styles.chipIcon}><CheckCheck size={18} aria-hidden="true" /></span><div><small>DA ENTRADA À ENTREGA</small><strong>Sua oficina, conectada.</strong></div><ArrowUpRight size={17} aria-hidden="true" /></div>
      <figcaption>Interface real da NEXYA Auto. Dados ocultados na imagem de divulgação.</figcaption>
    </figure>
  );
}
