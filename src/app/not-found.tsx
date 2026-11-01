import type { Metadata } from "next";
import Link from "next/link";
import { Art } from "@/components/Art";
import { Header } from "@/components/Header";
import "./not-found.css";

export const metadata: Metadata = { title: "Not found" };

// Outside the (site) group, like home, so it brings its own header.
export default function NotFound() {
  return (
    <div className="page-404">
      <Header />
      <main>
        <Art piece="sleepy-moon" className="art" />
        <h1>Page not found</h1>
        <p>There&apos;s nothing at this address.</p>
        <Link className="home" href="/">← home</Link>
      </main>
    </div>
  );
}
