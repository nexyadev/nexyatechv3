import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

/**
 * Next.js 16: "middleware" agora se chama "proxy". Só resolve o idioma pela URL (sem detecção automática).
 * Obs.: os scripts locais usam --hostname localhost. Com 127.0.0.1 o Next entrega a URL como "localhost" e a
 * reescrita interna do idioma vira "externa", entrando em loop.
 */
const handleI18n = createMiddleware(routing);

/** Redirects de canonicalização (slug do idioma errado, prefixo /pt-BR) saem como 301 permanentes. */
export default function proxy(request: NextRequest) {
  const response = handleI18n(request);
  const location = response.headers.get("location");
  if (response.status === 307 && location) return NextResponse.redirect(new URL(location, request.url), 301);
  return response;
}

export const config = {
  // Tudo menos arquivos internos, API, metadados e arquivos estáticos (com extensão).
  matcher: ["/((?!_next|_vercel|api|.*\\..*|sitemap.xml|robots.txt|icon.svg).*)"],
};
