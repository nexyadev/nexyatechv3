"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./preloader.module.css";

const SESSION_KEY = "nexya:intro-seen";

export function Preloader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const mode = process.env.NEXT_PUBLIC_INTRO_MODE ?? "session";
    if (mode === "off" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      if (mode !== "always" && sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      // Browsers with storage disabled still get the short, non-blocking introduction.
    }
    const start = window.requestAnimationFrame(() => {
      setVisible(true);
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // Session storage is an optional optimisation, not a navigation dependency.
      }
    });
    const end = window.setTimeout(() => setVisible(false), 2300);
    return () => {
      window.cancelAnimationFrame(start);
      window.clearTimeout(end);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={styles.intro} aria-hidden="true">
      <div className={styles.logo}><Image src="/images/logo-nexya.png" alt="" width={2172} height={724} sizes="360px" priority /></div>
      <p className={styles.caption}>TECNOLOGIA EM MOVIMENTO</p>
      <div className={styles.line} />
    </div>
  );
}
