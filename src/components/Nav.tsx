"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

const LINKS = [
  { label: "projects", href: "/projects" },
  { label: "career", href: "/career" },
  { label: "blog", href: "/blog" },
];

// A section stays marked on its inner pages: /projects/azure/ is still projects.
function isCurrent(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Nav() {
  const pathname = usePathname();
  return (
    // data-avoid keeps the koi out from under the links on home; on other pages there's no pond and it does nothing.
    <nav data-avoid>
      {LINKS.map(({ label, href }) => (
        <Link key={href} href={href} aria-current={isCurrent(pathname, href) ? "page" : undefined}>
          {label}
        </Link>
      ))}
      <ThemeToggle />
    </nav>
  );
}
