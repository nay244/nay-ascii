import assert from "node:assert/strict";
import test from "node:test";
import { blocksOf, hasMockups, hrefs, mockData, visibleText } from "../site/helpers.ts";

test("visibleText drops scripts, styles and comments and decodes entities", () => {
  const html = `<!doctype html><style>p { color: red }</style><p>Tom <!-- -->&amp; <b>Jerry</b>&#39;s &lt;cat&gt;&#x21;</p><script>if (a < b) x()</script>`;
  assert.equal(visibleText(html), "Tom & Jerry 's <cat>!");
});

test("hrefs returns every href and src, decoded", () => {
  const html = `<a class="x" href="/a/?b=1&amp;c=2">a</a><img src="/i.png" alt=""><script src="/s.js"></script><p data-src="no">`;
  assert.deepEqual(hrefs(html), ["/a/?b=1&c=2", "/i.png", "/s.js"]);
});

test("blocksOf lists each block, nested ones included, and skips .todo", () => {
  const html = `<h2>no</h2><p>One <code>two</code></p><ul><li>A<ul><li>B</li></ul></li></ul>
    <p class="todo">skip me</p><p>Keep <span class="x todo">?</span> this</p><div class="todo"><p>nor me</p></div>
    <table><tr><th>H</th><td>C &amp; D<br></td></tr></table><figure><img src="/x.png"><figcaption>Cap</figcaption></figure>`;
  assert.deepEqual(blocksOf(html), ["One two", "A B", "B", "Keep this", "H", "C & D", "Cap"]);
});

test("mockData runs a data file", { skip: !hasMockups }, () => {
  const { PROJECTS } = mockData("projects-data.js", ["PROJECTS"]);
  assert.deepEqual(PROJECTS.map((p: { id: string }) => p.id), ["techconcepts", "azure", "servicenow", "hyperv", "roluna"]);
});

test("mockData runs a page's script up to the text it is told to stop at", { skip: !hasMockups }, () => {
  const { ENTRIES, CERTS, SKILLS } = mockData("career.html", ["ENTRIES", "CERTS", "SKILLS"], "const todo");
  assert.ok(ENTRIES.length > 0 && CERTS.length > 0 && SKILLS.length > 0);
  assert.throws(() => mockData("career.html", ["ENTRIES"], "no such text"), /not in career.html/);
});
