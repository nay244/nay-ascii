import type { Metadata } from "next";
import Link from "next/link";

// Addresses from the old site, and where each one lives now. A static export can't redirect, so each gets a page
// that sends the browser on with a meta refresh and, for anyone whose browser ignores it, a link.
export const MOVED: Record<string, string> = {
  "about-me": "/",
  "index-maps": "/",
  azure: "/blog/az900/",
  wgu: "/blog/wgu/",
  "language-learning": "/blog/japanese/",
  "knowledge-base": "/blog/data/",
};

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(MOVED).map((old) => ({ old }));
}

// A moved page is not a page to find in a search.
export const metadata: Metadata = { title: "Moved", robots: { index: false } };

export default async function Moved({ params }: PageProps<"/[old]">) {
  const { old } = await params;
  const to = MOVED[old];
  return (
    <main className="main">
      <meta httpEquiv="refresh" content={`0; url=${to}`} />
      <p>
        This page has moved to <Link href={to}>{to}</Link>
      </p>
    </main>
  );
}
