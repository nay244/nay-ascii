import assert from "node:assert/strict";
import test from "node:test";
import { hasMockups, mockData, page, visibleText } from "./helpers.ts";

test("the days and spending match the mockup", { skip: !hasMockups }, () => {
  const { DAYS, SPEND } = mockData("post.html", ["DAYS", "SPEND"], "const days");
  const text = visibleText(page("/blog/japan-2023"));
  DAYS.forEach(([when, place, acts]: [string, string, string[]], i: number) => {
    assert.ok(text.includes(`${place} day ${i + 1} · ${when}`), `day ${i + 1}`);
    for (const a of acts) assert.ok(text.includes(a), a);
  });
  for (const [name] of SPEND) assert.ok(text.includes(name), name);
});
test("the corrected headings are in place", () => {
  const text = visibleText(page("/blog/japan-2023"));
  for (const d of ["Tokyo day 8 · Oct 29", "Tokyo day 10 · Oct 31", "Nikko day 13 · Nov 3"]) assert.ok(text.includes(d), d);
});
test("the map keeps its stops, and the numbers stay", () => {
  const html = page("/blog/japan-2023"), text = visibleText(html);
  for (const s of ["Kanazawa", "Hakone", "~$68", "~$2,750"]) assert.ok(text.includes(s), s);
  assert.match(html, /data-piece="fuji-dawn-lake"/);
  assert.match(html, /data-art="japan-route"/);
  assert.equal((html.match(/class="lbl[^"]*todo[^"]*"[^>]*>\?</g) ?? []).length, 2);
  // Nothing else on the page, scripts included, is marked as still to fill in.
  assert.equal((html.match(/class="[^"]*todo/g) ?? []).length, 2);
});
test("each bar shows its share, and the facts read label first", { skip: !hasMockups }, () => {
  const { SPEND } = mockData("post.html", ["SPEND"], "const days");
  const html = page("/blog/japan-2023"), text = visibleText(html);
  for (const [name, p] of SPEND) assert.ok(text.includes(`${name} ${p}%`), name);
  assert.equal([...html.matchAll(/class="bar" style="[^"]*--p:\s*[\d.]+/g)].length, SPEND.length);
  assert.ok(text.includes("days 15 total spent ~$2,750 avg. spent per day ~$68 konbinis visited 31"));
});
test("each day and its stop are paired, and the unnamed stops stay unnamed", () => {
  const html = page("/blog/japan-2023");
  for (const place of ["Tokyo", "Nikko", "Kanazawa", "Hakone", "Kyoto", "Osaka", "Nara"]) {
    assert.match(html, new RegExp(`<span[^>]*class="lbl[^"]*"[^>]*data-stop="${place}"[^>]*>${place}<`), place);
  }
  assert.equal([...html.matchAll(/<li[^>]*data-stop="[A-Z][a-z]+"/g)].length, 15);
  assert.equal([...html.matchAll(/<span[^>]*class="lbl[^"]*"[^>]*data-stop=/g)].length, 7);
});
test("the page is titled, has one h1, and marks only the blog link as current", () => {
  const html = page("/blog/japan-2023");
  assert.ok(html.includes("<title>Japan 2023 · Nay Naing</title>"));
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
  const current = [...html.matchAll(/<a\b[^>]*aria-current="page"[^>]*>/g)];
  assert.equal(current.length, 1);
  assert.match(current[0][0], /href="\/blog\/"/);
});
