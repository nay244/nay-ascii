import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Art } from "@/components/Art";
import { Facts } from "@/components/Facts";
import { PROJECT_BODIES } from "@/content/projects/bodies";
import { getProject, PROJECTS } from "@/content/projects";
import "./project.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: getProject(slug)?.title };
}

export default async function Project({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();
  // The pager wraps: the last project leads back to the first.
  const next = PROJECTS[(PROJECTS.indexOf(p) + 1) % PROJECTS.length];
  const Body = PROJECT_BODIES[p.slug];

  return (
    <div className="page-project">
      <Link className="back" href="/projects">← all projects</Link>
      <section className="hero">
        <div>
          <span className={`kind ${p.kind}`}>{p.kind}</span>
          <h1 className="p-title">{p.title}</h1>
          <p className="p-sum">{p.lede}</p>
        </div>
        <Art piece={p.piece} className="art" />
      </section>
      <Facts items={p.facts} />
      <article className="prose">
        <Body />
      </article>
      <nav className="pager" aria-label="More projects">
        <Link href="/projects">← all projects</Link>
        <Link className="next" href={`/projects/${next.slug}`}>
          <small>next</small>
          {next.title} →
        </Link>
      </nav>
    </div>
  );
}
