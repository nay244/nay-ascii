import type { Metadata } from "next";
import Link from "next/link";
import { Art } from "@/components/Art";
import { PROJECTS } from "@/content/projects";
import "./projects.css";

export const metadata: Metadata = { title: "Projects" };

export default function Projects() {
  return (
    <div className="page-projects">
      <h1 className="page-title">projects</h1>
      <p className="page-lede">Selected work and personal builds.</p>
      <ul className="cards">
        {PROJECTS.map((p) => (
          <li key={p.slug}>
            <Link className="proj" href={`/projects/${p.slug}`}>
              <Art piece={p.piece} className="art" />
              <span className="body">
                <span className="top-line">
                  <span className="title">{p.title}</span>
                  <span className={`kind ${p.kind}`}>{p.kind}</span>
                </span>
                <span className="sum">{p.sum}</span>
                <span className="stack">{p.stack.join(" · ")}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
