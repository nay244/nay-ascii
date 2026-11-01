import assert from "node:assert/strict";
import test from "node:test";
import { hasMockups, hrefs, mockData, page, visibleText } from "./helpers.ts";

test("the front page has the post, then four series with counts", () => {
  const html = page("/blog"), text = visibleText(html), h = hrefs(html);
  assert.ok(h.includes("/blog/japan-2023/"));
  assert.match(html, /data-piece="fuji-dawn-lake"/);
  for (const s of ["japanese", "wgu", "az900", "data"]) assert.ok(h.includes(`/blog/${s}/`), s);
  for (const c of ["38 notes", "11 notes", "5 notes", "3 notes"]) assert.ok(text.includes(c), c);
});
test("each series runs its picked art, on the card and the page", () => {
  const picks = { japanese: "autumn-pagoda-maples", wgu: "owl-blink", az900: "cloud-drift", data: "blog-data-notebook" };
  for (const [s, piece] of Object.entries(picks)) {
    assert.match(page("/blog"), new RegExp(`data-piece="${piece}"`), s);
    assert.match(page(`/blog/${s}`), new RegExp(`data-piece="${piece}"`), s);
  }
});
test("series copy matches the mockup", { skip: !hasMockups }, () => {
  const { SERIES } = mockData("blog-data.js", ["SERIES"]);
  for (const s of SERIES) {
    const text = visibleText(page(`/blog/${s.id}`));
    assert.ok(text.includes(s.sum));
    for (const n of s.notes) assert.ok(text.includes(n.includes(" · ") ? n.split(" · ")[1] : n), n);
  }
});
test("Japanese is grouped and credited", () => {
  const text = visibleText(page("/blog/japanese"));
  for (const g of ["start here", "writing system", "grammar and pronunciation", "how to study", "questions"]) assert.ok(text.includes(g), g);
  assert.ok(text.includes("Morg Systems"));
});
test("series link to their notes and to the next series", () => {
  const h = hrefs(page("/blog/wgu"));
  assert.ok(h.includes("/blog/wgu/d204-the-data-analytics-journey/"));
  assert.ok(h.includes("/blog/az900/") && h.includes("/blog/"));
});
test("the pages are titled, have one h1, and mark only the blog link as current", () => {
  const titles: Record<string, string> = { "/blog": "Blog", "/blog/japanese": "Japanese", "/blog/wgu": "WGU · M.S. Data Analytics", "/blog/az900": "AZ-900", "/blog/data": "Data analytics" };
  for (const [route, title] of Object.entries(titles)) {
    const html = page(route);
    assert.ok(html.includes(`<title>${title} · Nay Naing</title>`), route);
    assert.equal([...html.matchAll(/<h1\b/g)].length, 1, route);
    const current = [...html.matchAll(/<a\b[^>]*aria-current="page"[^>]*>/g)];
    assert.equal(current.length, 1, route);
    assert.match(current[0][0], /href="\/blog\/"/, route);
  }
});
test("only Japanese carries the credit, in the mockup's words", () => {
  const html = page("/blog/japanese");
  assert.ok(visibleText(html).includes("All notes here were written by Morg: Morg Systems ↗"));
  assert.ok(hrefs(html).includes("https://morg.systems/Japanese"));
  for (const s of ["wgu", "az900", "data"]) assert.ok(!visibleText(page(`/blog/${s}`)).includes("written by"), s);
});
test("the numbers run on through the groups, and a course code takes the place of one", () => {
  const japanese = page("/blog/japanese");
  assert.equal([...japanese.matchAll(/class="num">(\d\d)</g)].map((m) => m[1]).join(), Array.from({ length: 38 }, (_, i) => String(i + 1).padStart(2, "0")).join());
  const wgu = page("/blog/wgu");
  assert.match(wgu, /class="num">D204</);
  assert.match(wgu, /class="num">D214</);
  assert.doesNotMatch(wgu, /class="num">\d\d</);
  assert.match(page("/blog/az900"), /class="num">01</);
});
