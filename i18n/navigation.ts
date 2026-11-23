import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/** Link, redirect e hooks cientes do idioma (traduzem o caminho conforme routing.pathnames). */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
