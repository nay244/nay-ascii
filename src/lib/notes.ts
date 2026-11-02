import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Marked, Renderer, type Tokens } from "marked";
import { BASE_PATH } from "./base.ts";

// `text` is the heading as rendered, minus its tags, so it is still HTML text: "Cost &amp; Governance".
export type TocEntry = { lvl: number; id: string; text: string };
export type Note = { html: string; toc: TocEntry[]; words: number };

// Port of build_notes.py's slugify, with Python's \w as [\p{L}\p{N}_]. It makes the id of every heading that has no named anchor.
function slugify(text: string): string {
  return text
    .replace(/<[^>]+>/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^\p{L}\p{N}_\s-]/gu, "")
    .trim()
    .replace(/\s/g, "-");
}

// Rendered HTML without its tags. Quotes need no escape in element text, and the mockup's contents list left them as typed.
const plainText = (html: string) => html.replace(/<[^>]+>/g, "").replace(/&#39;/g, "'").replace(/&quot;/g, '"');

const NAMED_ANCHOR = /<a name="([^"]+)">(.*?)<\/a>/;

function markdown(toc: TocEntry[]): Marked {
  const md: Marked = new Marked({
    gfm: true,
    renderer: {
      heading(this: Renderer, token: Tokens.Heading) {
        const lvl = Math.max(2, token.depth);
        // A heading written as <a name="x">T</a> keeps x as its id, because other notes link to it by that name.
        const named = NAMED_ANCHOR.exec(token.text);
        const inner = named ? md.parseInline(named[2], { async: false }) : this.parser.parseInline(token.tokens);
        const id = named ? named[1] : slugify(token.text);
        if (lvl <= 3) toc.push({ lvl, id, text: plainText(inner) });
        const tag = `h${Math.min(lvl, 4)}`;
        return `<${tag} id="${id}">${inner}</${tag}>\n`;
      },
      // A paragraph of nothing but images is a figure.
      paragraph(this: Renderer, token: Tokens.Paragraph) {
        const parts = token.tokens;
        const onlyImages = parts.some((t) => t.type === "image") && parts.every((t) => t.type === "image" || t.type === "br" || (t.type === "text" && !t.raw.trim()));
        return onlyImages ? `<figure>${this.parser.parseInline(parts)}</figure>\n` : false;
      },
      image(this: Renderer, token: Tokens.Image) {
        return Renderer.prototype.image.call(this, token).replace(/>$/, ' loading="lazy">');
      },
      table(this: Renderer, token: Tokens.Table) {
        return `<div class="table">${Renderer.prototype.table.call(this, token)}</div>\n`;
      },
    },
  });
  return md;
}

// Note links and images are plain HTML, so `Link` can't add the base path to them.
export function prefixPaths(html: string, base: string = BASE_PATH): string {
  return html.replace(/\b(href|src)="\/(?!\/)/g, `$1="${base}/`);
}

// A note's Markdown as HTML, with the headings down to level 3 for its contents list and its word count.
// Raw HTML passes through, because the notes use ruby, details and the like.
export function renderNote(md: string): Note {
  const toc: TocEntry[] = [];
  const html = prefixPaths(markdown(toc).parse(md, { async: false }));
  return { html, toc, words: md.match(/\S+/g)?.length ?? 0 };
}

const NOTES = join(process.cwd(), "src", "content", "notes");
const PLAIN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function getNote(seriesId: string, slug: string): Note {
  for (const part of [seriesId, slug]) if (!PLAIN.test(part)) throw new Error(`"${part}" is not a note path`);
  return renderNote(readFileSync(join(NOTES, seriesId, `${slug}.md`), "utf8"));
}

// The contents list is worth showing only on a note with several sections and enough to read.
export function hasContents(toc: TocEntry[], words: number): boolean {
  return toc.length >= 3 && words >= 300;
}

// "D204 · The Data Analytics Journey" has the code D204. A title without the separator has no code.
export function splitTitle(title: string): { code: string | null; name: string } {
  const at = title.indexOf(" · ");
  return at < 0 ? { code: null, name: title } : { code: title.slice(0, at), name: title.slice(at + 3) };
}
