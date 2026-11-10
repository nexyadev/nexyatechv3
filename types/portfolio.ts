export interface PortfolioProject {
  slug: string;
  title: string;
  category: string;
  description: string;
  featured: boolean;
  status: "documented" | "pending";
  cover: { src: string; alt: string } | null;
  accent: "blue" | "silver" | "amber" | "violet";
  details: string[];
  namePending?: boolean;
}

/** The interface for a future approved source; the current source is local only. */
export interface PortfolioSource {
  list(): Promise<readonly PortfolioProject[]>;
  find(slug: string): Promise<PortfolioProject | undefined>;
}
