import Image from "next/image";
import { ArrowUpRight, CheckCheck, Command, Minus, Square } from "lucide-react";
import type { Messages } from "@/i18n/dictionaries";
import styles from "./product.module.css";

/** Product artwork uses a real, public NEXYA Auto screenshot, never a simulated UI. */
export function ProductDiagram({ compact = false, m }: { compact?: boolean; m: Messages["product"] }) {
  return (
    <figure className={`${styles.productVisual} ${compact ? styles.compact : ""}`}>
      <div className={styles.visualOrbit} aria-hidden="true" />
      <div className={styles.visualCross} aria-hidden="true">+</div>
      <div className={styles.device}>
        <div className={styles.deviceChrome} aria-hidden="true"><div className={styles.windowDots}><i /><i /><i /></div><span><Command size={10} /> {m.windowLabel}</span><div className={styles.windowControls}><Minus size={10} /><Square size={8} /></div></div>
        <Image src="/images/demo/nexya-auto-painel.webp" alt={m.alt} width={1600} height={1000} sizes={compact ? "(max-width: 760px) 92vw, 54vw" : "(max-width: 900px) 92vw, 58vw"} className={styles.dashboardImage} />
        <div className={styles.deviceBottom} aria-hidden="true"><span /><i /></div>
      </div>
      <div className={styles.featureChip}><span className={styles.chipIcon}><CheckCheck size={18} aria-hidden="true" /></span><div><small>{m.chipSmall}</small><strong>{m.chipStrong}</strong></div><ArrowUpRight size={17} aria-hidden="true" /></div>
      <figcaption>{m.caption}</figcaption>
    </figure>
  );
}
