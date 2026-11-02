import type { Metadata } from "next";

// A page's own title and description for search results and link previews. Next doesn't merge `openGraph`
// from the layout into a page that sets its own, so the page repeats the layout's site name and type.
export function pageMeta(title: string | undefined, description: string): Metadata {
  return { title, description, openGraph: { title, description, siteName: "Nay Naing", type: "website" } };
}
