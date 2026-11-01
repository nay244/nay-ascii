import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { Art } from "@/components/Art";
import { SERIES } from "@/content/blog";
import type { NoteEntry, Series as SeriesData } from "@/content/blog";
import { splitTitle } from "@/lib/notes";
import "./series.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return SERIES.map((s) => ({ series: s.id }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[series]">): Promise<Metadata> {
  const { series } = await params;
  return { title: SERIES.find((s) => s.id === series)?.title };
}

const pad = (i: number) => String(i + 1).padStart(2, "0");
const noteHref = (s: SeriesData, n: NoteEntry) => `/blog/${s.id}/${n.slug}`;

// A long series lists titles only, in two columns that read down and then across. `from` is the number of the first note.
function TitleRows({ series, notes, from }: { series: SeriesData; notes: NoteEntry[]; from: number }) {
  return (
    <ul className="titles">
      {notes.map((n, i) => (
        <li key={n.slug}>
          <Link href={noteHref(series, n)}>
            <span className="num">{pad(from + i)}</span>
            <span>{n.title}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

// A short series lists one column with each note's one-line summary. A course code, as in "D204 · Data Cleaning", takes the place of the number.
function FullRows({ series }: { series: SeriesData }) {
  return (
    <ul className={series.notes.some((n) => splitTitle(n.title).code) ? "full coded" : "full"}>
      {series.notes.map((n, i) => {
        const { code, name } = splitTitle(n.title);
        return (
          <li key={n.slug}>
            <Link href={noteHref(series, n)}>
              <span className="num">{code ?? pad(i)}</span>
              <span className="name">{name}</span>
              <span className="sum">{n.sum}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default async function SeriesPage({ params }: PageProps<"/blog/[series]">) {
  const { series: id } = await params;
  const at = SERIES.findIndex((s) => s.id === id);
  if (at < 0) notFound();
  const s = SERIES[at];
  // The pager wraps: the last series leads on to the first.
  const next = SERIES[(at + 1) % SERIES.length];

  let from = 0;
  const groups = (s.groups ?? []).map(([name, count]) => {
    const group = { name, count, from };
    from += count;
    return group;
  });

  return (
    <div className="page-series">
      <Link className="back" href="/blog">← blog</Link>
      <div className="hero">
        <div>
          <span className="count">series · {s.notes.length} notes</span>
          <h1 className="s-title">{s.title}</h1>
          <p className="s-sum">{s.sum}</p>
          {s.source && (
            <p className="credit">
              All notes here were written by {s.source.author}: <a href={s.source.url}>{s.source.name} ↗</a>
            </p>
          )}
        </div>
        <Art piece={s.piece} className="art" />
      </div>
      {s.groups ? (
        groups.map((g) => (
          <Fragment key={g.name}>
            <h3 className="sec">
              {g.name} <span>· {g.count}</span>
            </h3>
            <TitleRows series={s} notes={s.notes.slice(g.from, g.from + g.count)} from={g.from} />
          </Fragment>
        ))
      ) : (
        <>
          <h3 className="sec">notes</h3>
          <FullRows series={s} />
        </>
      )}
      <nav className="pager" aria-label="More of the blog">
        <Link href="/blog">← blog</Link>
        <Link href={`/blog/${next.id}`}>next series: {next.title} →</Link>
      </nav>
    </div>
  );
}
