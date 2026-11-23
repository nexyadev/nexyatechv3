/** Constantes e script do <head> para o movimento (módulo comum: servidor e cliente). */
export const MOTION_KEY = "nx-motion";
export const MOTION_EVENT = "nx:motion";

/** Roda no <head> antes do primeiro paint. */
export const motionInitScript = `(function(){var m;try{m=localStorage.getItem("${MOTION_KEY}")}catch(e){}if(m!=="full"&&m!=="reduced"){m=matchMedia("(prefers-reduced-motion: reduce)").matches?"reduced":"full"}document.documentElement.dataset.motion=m})()`;


/** Faixas pausadas pelo visitante (botão Pausar/Retomar). Salvo só depois do clique. */
export const BANDS_KEY = "nx-bands";
export const BANDS_EVENT = "nx:bands";
export const bandsInitScript = `(function(){try{if(localStorage.getItem("${BANDS_KEY}")==="paused")document.documentElement.dataset.bands="paused"}catch(e){}})()`;
