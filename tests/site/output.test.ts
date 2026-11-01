import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { SERIES } from "../../src/content/blog.ts";
import { hrefs, page, visibleText } from "./helpers.ts";

const htmlFiles = () => readdirSync("out", { recursive: true }).filter((f) => f.endsWith(".html")).map(String);
test("all 70 pages plus the 404 are in the output", () => {
  const pages = ["/", "/projects", ...["azure", "servicenow", "hyperv", "roluna"].map((s) => `/projects/${s}`), "/career", "/blog",
    "/blog/japan-2023", ...SERIES.map((s) => `/blog/${s.id}`), ...SERIES.flatMap((s) => s.notes.map((n) => `/blog/${s.id}/${n.slug}`))];
  assert.equal(pages.length, 70);
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
test("the library's license ships, and no unpicked art does", () => {
  for (const f of ["LICENSE.txt", "NOTICE.txt"]) assert.ok(existsSync(`out/third-party/ascii-magic/${f}`), f);
  const js = readdirSync("out/_next", { recursive: true }).map(String).filter((f) => f.endsWith(".js")).map((f) => readFileSync(join("out/_next", f), "utf8")).join("");
  for (const s of ["sql-query-runner", "packet-sniffer", "ocean-sunset", "starry-ridge", "project-azure-dome", "blog-data-sheet"]) assert.ok(!js.includes(s), s);
  assert.ok(!js.includes("ascii-magic.com"));
});
test("no IPv4 addresses or phone numbers anywhere", () => {
  for (const f of htmlFiles()) {
    const text = visibleText(readFileSync(join("out", f), "utf8"));
    assert.doesNotMatch(text, /(?<![\d.])(?:\d{1,3}\.){3}\d{1,3}(?![\d.])/, f);
    assert.doesNotMatch(text, /(?<!\d)\(?\d{3}\)?[-. ]\d{3}[-. ]\d{4}(?!\d)/, f);
  }
});
test("no private strings", { skip: process.env.CI ? "CI can't see the local file" : false }, () => {
  // A missing or empty terms file fails here. Raw bytes, so the page data in scripts and .txt files is covered too.
  const terms = readFileSync(".private-terms.txt", "utf8").split("\n").filter(Boolean);
  assert.ok(terms.length > 0);
  const files = readdirSync("out", { recursive: true }).map(String).filter((f) => /\.(html|txt|js|css|svg)$/.test(f));
  for (const f of files) {
    const body = readFileSync(join("out", f), "utf8");
    // Not doesNotMatch: its failure message would print the value.
    terms.forEach((t, i) => assert.ok(!body.includes(t), `${f} has the term on line ${i + 1}`));
  }
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
