/** Tema (claro/escuro). Módulo comum: usado pelo layout (servidor) e pelo botão (cliente). */
export const THEME_KEY = "nx-theme";

/**
 * Modo escuro atrás de flag (NEXT_PUBLIC_ENABLE_DARK=true para ligar). Desligado: o site é sempre claro,
 * sem botão de tema e com UMA versão de cada logo no HTML.
 */
export const darkEnabled = process.env.NEXT_PUBLIC_ENABLE_DARK === "true";

/**
 * Script do <head>, antes do primeiro paint: aplica a escolha salva (localStorage, com try/catch) ou,
 * sem escolha, segue prefers-color-scheme. Sem JS, o CSS também segue o sistema.
 */
export const themeInitScript = !darkEnabled ? `document.documentElement.dataset.theme="light"` : `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){}})()`;

