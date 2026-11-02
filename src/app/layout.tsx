import type { Metadata } from "next";
import { GeistSerif } from "geist/font/serif/variable";
import { THEME_SCRIPT } from "@/lib/theme";
import "@/styles/tokens.css";
import "@/styles/shared.css";

const DESCRIPTION = "Security Engineer / Data Analyst, passionate about building the future for the people.";

export const metadata: Metadata = {
  metadataBase: new URL("https://naaay.dev/"),
  title: { default: "Nay Naing", template: "%s · Nay Naing" },
  description: DESCRIPTION,
  openGraph: { title: "Nay Naing", description: DESCRIPTION, siteName: "Nay Naing", type: "website" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="dark" className={GeistSerif.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
