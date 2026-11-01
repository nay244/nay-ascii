import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";

const ROOT = join(import.meta.dirname, "..", "..");
const MOCK = join(ROOT, ".superpowers", "brainstorm", "mockups");

// The mockups are local-only, so tests that compare against them skip when they're missing (CI).
export const hasMockups = existsSync(MOCK);

// The built HTML of a route: "/" is out/index.html, "/projects" is out/projects/index.html.
export function page(route: string): string {
  const folder = route.replace(/^\/+|\/+$/g, "");
  return readFileSync(join(ROOT, "out", folder, "index.html"), "utf8");
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

function decode(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, body: string) => {
    if (body[0] !== "#") return Object.hasOwn(ENTITIES, body.toLowerCase()) ? ENTITIES[body.toLowerCase()] : whole;
    const code = body[1].toLowerCase() === "x" ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
    return code <= 0x10ffff ? String.fromCodePoint(code) : whole;
  });
}

// What a reader sees: no scripts, styles or comments, a space where each tag was, entities decoded.
// Comments go because React puts <!-- --> between adjacent text.
export function visibleText(html: string): string {
  return decode(
    html
      .replace(/<!--[\s\S]*?-->|<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
      .replace(/<!doctype[^>]*>|<\/?[a-z](?:"[^"]*"|'[^']*'|[^>"'])*>/gi, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

// Every href and src, with entities decoded.
export function hrefs(html: string): string[] {
  return [...html.matchAll(/\s(?:href|src)=(?:"([^"]*)"|'([^']*)')/gi)].map((m) => decode(m[1] ?? m[2]));
}

// Values made in the mockups' realm have that realm's Object and Array, which deepEqual treats as foreign.
function plain(value: any): any {
  if (Array.isArray(value)) return Array.from(value, plain);
  if (value && typeof value === "object" && Object.getPrototypeOf(Object.getPrototypeOf(value)) === null) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, plain(item)]));
  }
  return value;
}

// The script of a mockup page that comes last before `stopAt`, cut off at `stopAt`.
function scriptBefore(html: string, stopAt: string | undefined, file: string): string {
  const stop = stopAt === undefined ? html.length : html.indexOf(stopAt);
  if (stop < 0) throw new Error(`mockData: "${stopAt}" is not in ${file}`);
  let code: string | undefined;
  for (const m of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)) {
    if (m.index >= stop) break;
    const from = m.index + m[0].indexOf(">") + 1;
    code = html.slice(from, Math.min(stop, from + m[1].length));
  }
  if (code === undefined) throw new Error(`mockData: no inline script before "${stopAt}" in ${file}`);
  return code;
}

// Runs a mockup's script and returns the named values. Its `const`s aren't properties of the context,
// so the names are read by an expression appended to the code.
export function mockData(file: string, names: string[], stopAt?: string): Record<string, any> {
  let code = readFileSync(join(MOCK, file), "utf8");
  if (file.endsWith(".html")) code = scriptBefore(code, stopAt, file);
  return plain(vm.runInNewContext(`${code}\n;({ ${names.join(", ")} })`, { window: {} }));
}

const BLOCKS = new Set(["p", "li", "td", "th", "h3", "h4", "figcaption"]);
const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
type Span = { start: number; end: number };

// The visible text of each paragraph, list item, table cell, small heading and caption, in order,
// leaving out anything marked .todo.
export function blocksOf(html: string): string[] {
  const blocks: Span[] = [], todos: Span[] = [];
  const open: { name: string; start: number; todo: boolean }[] = [];
  const finish = (el: (typeof open)[number], end: number) => {
    if (el.todo) todos.push({ start: el.start, end });
    if (BLOCKS.has(el.name)) blocks.push({ start: el.start, end });
  };
  const tags = /<!--[\s\S]*?-->|<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>|<(\/?)([a-z][^\s/>]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/gi;
  for (const m of html.matchAll(tags)) {
    if (m[3] === undefined) continue;
    const name = m[3].toLowerCase(), end = m.index + m[0].length;
    if (m[2]) {
      const at = open.findLastIndex((el) => el.name === name);
      if (at < 0) continue;
      // Elements still open inside this one were closed by it.
      const closed = open.splice(at);
      for (const el of closed.reverse()) finish(el, el === closed[closed.length - 1] ? end : m.index);
      continue;
    }
    const classes = (/\bclass\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(m[4]) ?? []).slice(1).join(" ").split(/\s+/);
    const el = { name, start: m.index, todo: classes.includes("todo") };
    if (!VOID.has(name) && !m[4].trimEnd().endsWith("/")) open.push(el);
    else if (el.todo) todos.push({ start: m.index, end });
  }
  for (const el of open.reverse()) finish(el, html.length);

  todos.sort((a, b) => a.start - b.start);
  return blocks
    .sort((a, b) => a.start - b.start)
    .filter((b) => !todos.some((t) => t.start <= b.start && b.end <= t.end))
    .map((b) => {
      let text = "", at = b.start;
      for (const t of todos) {
        if (t.start < at || t.end > b.end) continue;
        text += html.slice(at, t.start);
        at = t.end;
      }
      return visibleText(text + html.slice(at, b.end));
    });
}
