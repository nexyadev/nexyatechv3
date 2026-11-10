import type { PortfolioSource } from "@/types/portfolio";
import { projects } from "./projects";

const localSource: PortfolioSource = {
  async list() {
    return projects;
  },
  async find(slug) {
    return projects.find((project) => project.slug === slug);
  },
};

// Future approved sync belongs behind this interface. Do not fetch GitHub here yet.
export async function getProjects() {
  return localSource.list();
}

export async function getProject(slug: string) {
  return localSource.find(slug);
}
