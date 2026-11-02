import type { Metadata } from "next";
import Link from "next/link";
import { MOVED } from "@/content/moved";
import { BASE_PATH } from "@/lib/base";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(MOVED).map((old) => ({ old }));
}

// A moved page is not a page to find in a search.
export const metadata: Metadata = { title: "Moved", robots: { index: false } };

// A static export can't redirect, so each old address gets a page that sends the browser on with a meta refresh
// and, for anyone whose browser ignores it, a link.
export default async function Moved({ params }: PageProps<"/[old]">) {
  const { old } = await params;
  const to = MOVED[old];
  return (
    <main className="main">
      <meta httpEquiv="refresh" content={`0; url=${BASE_PATH}${to}`} />
      <p>
        This page has moved to <Link href={to}>{to}</Link>
      </p>
    </main>
  );
}
