import type { Metadata } from "next";
import { THEME_SCRIPT } from "@/lib/theme";
import "@/styles/tokens.css";
import "@/styles/shared.css";

export const metadata: Metadata = {
  title: { default: "Nay Naing", template: "%s · Nay Naing" },
  description: "Security Engineer / Data Analyst, passionate about building the future for the people.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
