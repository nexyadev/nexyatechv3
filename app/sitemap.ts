import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";
import { getProjects } from "@/lib/portfolio/repository";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();
  const paths = ["/", "/solucoes", "/solucoes/sistemas", "/solucoes/automacoes", "/solucoes/sites", "/solucoes/integracoes", "/nexya-auto", "/portfolio", "/sobre", "/processo", "/contato", "/privacidade", ...projects.filter((project) => project.status === "documented").map((project) => `/portfolio/${project.slug}`)];
  return paths.map((path) => ({ url: new URL(path, siteConfig.url).toString(), changeFrequency: "monthly", priority: path === "/" ? 1 : path === "/privacidade" ? 0.3 : 0.7 }));
}
