import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Contents } from "@/components/Contents";
import { Trail } from "@/components/Trail";
import { SERIES } from "@/content/blog";
import type { Series } from "@/content/blog";
import { getNote, hasContents, splitTitle } from "@/lib/notes";
import "./note.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return SERIES.flatMap((s) => s.notes.map((n) => ({ series: s.id, note: n.slug })));
}

export async function generateMetadata({ params }: PageProps<"/blog/[series]/[note]">): Promise<Metadata> {
  const { series, note } = await params;
  const entry = SERIES.find((s) => s.id === series)?.notes.find((n) => n.slug === note);
  return { title: entry && splitTitle(entry.title).name };
}

const noteHref = (s: Series, i: number) => `/blog/${s.id}/${s.notes[i].slug}`;

// Which group a note falls in, and whether it starts one. A series without groups has neither.
function groupOf(s: Series, i: number): { name: string | null; first: boolean } {
  let from = 0;
  for (const [name, count] of s.groups ?? []) {
    if (i < from + count) return { name, first: i === from };
    from += count;
  }
  return { name: null, first: false };
}

export default async function NotePage({ params }: PageProps<"/blog/[series]/[note]">) {
  const { series: id, note: slug } = await params;
  const s = SERIES.find((x) => x.id === id);
  const at = s?.notes.findIndex((n) => n.slug === slug) ?? -1;
  if (!s || at < 0) notFound();

  const { html, toc, words } = getNote(s.id, slug);
  const { code, name } = splitTitle(s.notes[at].title);
  // "WGU · M.S. Data Analytics" is the WGU series; the name stands for it in the back link and the pager.
  const seriesName = splitTitle(s.title).code ?? s.title;
  const seriesHref = `/blog/${s.id}`;
  // A WGU note's course code sits in the line above its title.
  const whereText = [code, `note ${at + 1} of ${s.notes.length}`, groupOf(s, at).name].filter(Boolean).join(" · ");
  const long = hasContents(toc, words);
  const prev = at > 0 ? splitTitle(s.notes[at - 1].title).name : null;
  const next = at < s.notes.length - 1 ? splitTitle(s.notes[at + 1].title).name : null;

  return (
    <div className="page-note">
      <Link className="back" href={seriesHref}>← {seriesName}</Link>
      <Trail
        notes={s.notes.map((n, i) => ({ href: noteHref(s, i), title: n.title, first: groupOf(s, i).first }))}
        current={at}
        whereText={whereText}
      />
      <h1 className="n-title">{name}</h1>
      {s.source && (
        <p className="credit">
          Written by {s.source.author}, from <a href={s.source.url}>{s.source.name} ↗</a>
        </p>
      )}
      <div className={long ? "read has-toc" : "read"}>
        {long && <Contents toc={toc} />}
        <article className="prose" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      <nav className="pager" aria-label="More notes">
        {prev !== null ? (
          <Link href={noteHref(s, at - 1)}><small>← previous</small>{prev}</Link>
        ) : (
          <Link href={seriesHref}><small>← back to the series</small>{seriesName}</Link>
        )}
        {next !== null ? (
          <Link href={noteHref(s, at + 1)}><small>next →</small>{next}</Link>
        ) : (
          <Link href={seriesHref}><small>end of the series →</small>all {seriesName} notes</Link>
        )}
      </nav>
    </div>
  );
}
