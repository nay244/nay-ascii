import assert from "node:assert/strict";
import { existsSync, readdirSync } from "node:fs";
import test from "node:test";
import { POSTS, SERIES } from "../../src/content/blog.ts";
import { getNote, hasContents, renderNote, splitTitle } from "../../src/lib/notes.ts";
import { hasMockups, mockData } from "../site/helpers.ts";

test("every index entry has a file, and every file an entry", () => {
  assert.deepEqual(SERIES.map((s) => s.notes.length), [38, 11, 5, 3]);
  for (const s of SERIES) {
    const files = readdirSync(`src/content/notes/${s.id}`).map((f) => f.replace(/\.md$/, "")).sort();
    assert.deepEqual(files, s.notes.map((n) => n.slug).sort());
  }
});
test("slugs are plain ASCII with no repeated dashes", () => {
  const slugs = SERIES.flatMap((s) => s.notes.map((n) => n.slug));
  for (const n of slugs) assert.match(n, /^[a-z0-9]+(-[a-z0-9]+)*$/, n);
  for (const n of ["gikun", "japanese-sentence-structure-da-explained", "cost-governance", "d204-the-data-analytics-journey"]) assert.ok(slugs.includes(n), n);
});
test("headings follow the mockup's rules", () => {
  assert.match(renderNote("# A B").html, /<h2 id="a-b">/);
  assert.match(renderNote("##### Deep").html, /<h4 id="deep">/);
  assert.deepEqual(renderNote("### Hi there\n##### Deep").toc, [{ lvl: 3, id: "hi-there", text: "Hi there" }]);
  assert.match(renderNote('## <a name="k">Named</a>').html, /<h2 id="k">Named<\/h2>/);
});
test("images, tables and raw HTML", () => {
  assert.match(renderNote("![a](/static/x.png)").html, /<figure><img src="\/static\/x.png" alt="a" loading="lazy">/);
  assert.match(renderNote("|a|\n|-|\n|b|").html, /<div class="table"><table>/);
  assert.match(renderNote("x <ruby>漢<rt>かん</rt></ruby> y").html, /<ruby>漢<rt>かん<\/rt><\/ruby>/);
  assert.match(renderNote("<details>\n<summary>s</summary>\n\nbody\n\n</details>").html, /<details>/);
});
test("the whole set matches the mockup's counts", () => {
  const html = SERIES.flatMap((s) => s.notes.map((n) => getNote(s.id, n.slug).html)).join("");
  assert.equal((html.match(/href="\/blog\//g) ?? []).length, 88);
  assert.equal((html.match(/<img /g) ?? []).length, 47);
  assert.equal((html.match(/<ruby/g) ?? []).length, 56);
  assert.equal((html.match(/<table/g) ?? []).length, 16);
  assert.equal((html.match(/<details/g) ?? []).length, 2);
  assert.doesNotMatch(html, /\[\[|note\.html|class="dead"/);
});
test("each note's contents match the mockup", { skip: !hasMockups }, () => {
  const { NOTES } = mockData("notes-data.js", ["NOTES"]);
  for (const s of SERIES) s.notes.forEach((n, i) => {
    const mock = NOTES[s.id][i], { toc, words } = getNote(s.id, n.slug);
    assert.deepEqual(toc, mock.toc, n.slug);
    assert.equal(hasContents(toc, words), hasContents(mock.toc, mock.words), n.slug);
  });
});

test("every link between notes lands on a note and a heading, and every image exists", () => {
  const pages = new Map(SERIES.flatMap((s) => s.notes.map((n) => [`/blog/${s.id}/${n.slug}/`, getNote(s.id, n.slug).html] as const)));
  for (const [from, html] of pages) {
    for (const [, path, frag] of html.matchAll(/href="(\/blog\/[^"#]*)(?:#([^"]*))?"/g)) {
      const target = pages.get(path);
      assert.ok(target, `${from} links to ${path}`);
      if (frag) assert.ok(target.includes(`id="${decodeURIComponent(frag)}"`), `${from} links to #${frag} of ${path}`);
    }
    for (const [, src] of html.matchAll(/<img src="(\/static\/[^"]*)"/g)) assert.ok(existsSync(`public${decodeURI(src)}`), `${from} shows ${src}`);
  }
});
test("the contents list shows for long notes with enough headings", () => {
  const toc = [1, 2, 3].map((n) => ({ lvl: 2, id: `h${n}`, text: `H${n}` }));
  assert.equal(hasContents(toc, 300), true);
  assert.equal(hasContents(toc, 299), false);
  assert.equal(hasContents(toc.slice(1), 5000), false);
});
test("a title splits into its code and its name", () => {
  assert.deepEqual(splitTitle("D204 · The Data Analytics Journey"), { code: "D204", name: "The Data Analytics Journey" });
  assert.deepEqual(splitTitle("Kanji"), { code: null, name: "Kanji" });
});
test("the Japan 2023 post links to its own page", () => {
  assert.equal(POSTS.length, 1);
  assert.equal(POSTS[0].href, "/blog/japan-2023/");
  assert.equal(POSTS[0].piece, "fuji-dawn-lake");
  assert.ok(!("art" in POSTS[0]));
});
