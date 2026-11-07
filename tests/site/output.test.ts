import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { SERIES } from "../../src/content/blog.ts";
import { BASE_PATH } from "../../src/lib/base.ts";
import { hrefs, page, visibleText } from "./helpers.ts";

const htmlFiles = () => readdirSync("out", { recursive: true }).filter((f) => f.endsWith(".html")).map(String);
// Every file that isn't a binary, by extension, so a new kind of text file can't slip past a scan.
const BINARY = /\.(png|jpe?g|gif|webp|ico|woff2?)$/i;
const outFiles = () => readdirSync("out", { recursive: true }).map(String).filter((f) => !BINARY.test(f) && statSync(join("out", f)).isFile());
// What to scan in a file: its bytes, and for HTML also what a reader sees.
const views = (f: string, body: string) => (f.endsWith(".html") ? [body, visibleText(body)] : [body]);

// A term as a pattern: any case, a space also written as - _ + or %20, and a term with 7 or more digits also
// matches those digits with up to 3 other characters between them, which covers a phone number in any format.
function termPattern(term: string): RegExp {
  const words = term.trim().split(/\s+/).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const digits = term.replace(/\D/g, "");
  return new RegExp(words.join("(?:[\\s_+-]|%20)+") + (digits.length >= 7 ? `|${[...digits].join("\\D{0,3}")}` : ""), "i");
}
// The line in the terms file of the first term found in a file, 0 if none. Callers report that number and nothing else.
function leak(f: string, body: string, patterns: RegExp[]): number {
  const seen = views(f, body);
  return patterns.findIndex((p) => seen.some((v) => p.test(v))) + 1;
}
// A missing terms file, or one that doesn't hold exactly the four terms, fails here.
function privateTerms(): RegExp[] {
  const terms = readFileSync(".private-terms.txt", "utf8").split("\n").filter(Boolean);
  assert.equal(terms.length, 4);
  return terms.map(termPattern);
}
test("all 71 pages plus the 404 are in the output", () => {
  const pages = ["/", "/projects", ...["techconcepts", "azure", "servicenow", "hyperv", "roluna"].map((s) => `/projects/${s}`), "/career", "/blog",
    "/blog/japan-2023", ...SERIES.map((s) => `/blog/${s.id}`), ...SERIES.flatMap((s) => s.notes.map((n) => `/blog/${s.id}/${n.slug}`))];
  assert.equal(pages.length, 71);
  for (const p of pages) assert.ok(page(p).length > 0, p);
  assert.ok(existsSync("out/404.html"));
});
test("every internal link, image and anchor resolves", () => {
  for (const f of htmlFiles()) {
    const html = readFileSync(join("out", f), "utf8");
    for (const ref of hrefs(html).filter((h) => /^[/#]/.test(h) && !h.startsWith("//"))) {
      const [target, frag] = ref.split("#");
      const path = decodeURIComponent(target.split("?")[0]);
      const file = !path ? f : path.endsWith("/") ? join(path, "index.html") : path;
      assert.ok(existsSync(join("out", file)), `${f}: ${ref}`);
      // Japanese heading ids arrive percent-encoded here and sit raw in the target's HTML.
      if (frag) assert.ok(readFileSync(join("out", file), "utf8").includes(`id="${decodeURIComponent(frag)}"`), `${f}: ${ref}`);
    }
  }
});
test("every root-relative link and image carries the base path", { skip: BASE_PATH ? false : "built for the root of a domain" }, () => {
  for (const f of htmlFiles()) {
    const html = readFileSync(join("out", f), "utf8");
    for (const m of html.matchAll(/\s(?:href|src)="(\/(?!\/)[^"]*)"|url=(\/[^"]*)"/g)) {
      const ref = m[1] ?? m[2];
      assert.ok(ref === BASE_PATH || ref.startsWith(`${BASE_PATH}/`), `${f}: ${ref}`);
    }
  }
});
test("the library's license ships, and no unpicked art does", () => {
  for (const f of ["ascii-magic/LICENSE.txt", "ascii-magic/NOTICE.txt", "geist/LICENSE.txt"]) assert.ok(existsSync(`out/third-party/${f}`), f);
  const js = readdirSync("out/_next", { recursive: true }).map(String).filter((f) => f.endsWith(".js")).map((f) => readFileSync(join("out/_next", f), "utf8")).join("");
  for (const s of ["sql-query-runner", "packet-sniffer", "ocean-sunset", "starry-ridge", "project-azure-dome", "blog-data-sheet"]) assert.ok(!js.includes(s), s);
  assert.ok(!js.includes("ascii-magic.com"));
});
test("every page gets Geist Serif, served from the site itself", () => {
  const css = readdirSync("out/_next", { recursive: true }).map(String).filter((f) => f.endsWith(".css")).map((f) => readFileSync(join("out/_next", f), "utf8")).join("");
  assert.match(css, /--font-geist-serif:/);
  assert.match(css, /font:13px\/1\.7 var\(--font-geist-serif\)/);
  assert.match(css, /@font-face\{[^}]*src:url\([^)]*\.woff2/);
  for (const f of htmlFiles()) assert.doesNotMatch(readFileSync(join("out", f), "utf8"), /fonts\.(googleapis|gstatic)\.com/, f);
});
test("no IPv4 addresses or phone numbers anywhere", () => {
  // Raw bytes of every text file, so hrefs, scripts and page data are covered, and what a reader sees in HTML.
  // Not doesNotMatch: its failure message would print the whole text.
  for (const f of outFiles()) {
    for (const text of views(f, readFileSync(join("out", f), "utf8"))) {
      // static/noticing.svg embeds a Chrome user agent from its export, which has the shape of an address.
      assert.ok(!/(?<![\d.])(?:\d{1,3}\.){3}\d{1,3}(?!\d|\.\d)/.test(text.replace(/Chrome\/[\d.]+/g, "")), `${f}: IPv4 pattern`);
      // The separator after the area code is optional. A bare ten-digit run isn't, as those are charset strings and product IDs.
      assert.ok(!/(?<!\d)\(?\d{3}\)?[-. ]?\d{3}[-. ]\d{4}(?!\d)/.test(text), `${f}: phone pattern`);
    }
  }
});
test("no private strings", { skip: process.env.CI ? "CI can't see the local file" : false }, () => {
  // Raw bytes of every text file in out/, so the page data in scripts and .txt files is covered, and the visible text of HTML.
  // Each term in any case, with its spaces written as - _ + or %20, and a term of 7 or more digits in any format.
  const patterns = privateTerms();
  for (const f of outFiles()) {
    const line = leak(f, readFileSync(join("out", f), "utf8"), patterns);
    // Not doesNotMatch: its failure message would print the value.
    assert.ok(line === 0, `${f} has the term on line ${line}`);
  }
});
test("no private strings in tracked files or git history", { skip: process.env.CI ? "CI can't see the local file" : false }, () => {
  const patterns = privateTerms();
  const tracked = spawnSync("git", ["ls-files", "-z"], { encoding: "utf8", maxBuffer: 1024 ** 3 });
  assert.equal(tracked.status, 0, "git ls-files failed");
  for (const f of tracked.stdout.split("\0").filter((f) => f && !BINARY.test(f) && statSync(f, { throwIfNoEntry: false })?.isFile())) {
    const line = leak(f, readFileSync(f, "utf8"), patterns);
    assert.ok(line === 0, `${f} has the term on line ${line}`);
  }
  // Every commit's message, author and committer, and patch, on every branch.
  const history = spawnSync("git", ["log", "--all", "-p", "--format=%B%n%an %ae %cn %ce"], { encoding: "utf8", maxBuffer: 1024 ** 3 });
  assert.equal(history.status, 0, "git log failed");
  const line = leak("git history", history.stdout, patterns);
  assert.ok(line === 0, `git history has the term on line ${line}`);
});
test("no Partners on project or career pages", () => {
  for (const r of ["/projects", "/projects/azure", "/projects/servicenow", "/projects/hyperv", "/projects/roluna", "/career"])
    assert.ok(!/partners/i.test(visibleText(page(r))), r);
});
test("no mockup scaffolding", () => {
  for (const f of htmlFiles()) {
    const html = readFileSync(join("out", f), "utf8");
    assert.doesNotMatch(html, /class="pick"|class="dead"|note\.html\?|href="(?!https?:)[^"]*\.html"/, f);
    // "to add" alone is ordinary English in the notes.
    assert.doesNotMatch(visibleText(html), /\b(date|school) to add\b/, f);
    const todos = (html.match(/class="[^"]*\btodo\b/g) ?? []).length;
    assert.equal(todos, f === join("blog", "japan-2023", "index.html") ? 2 : 0, f);
  }
});
