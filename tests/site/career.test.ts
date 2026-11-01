import assert from "node:assert/strict";
import test from "node:test";
import { CERTS as SITE_CERTS } from "../../src/content/career.ts";
import { hasMockups, hrefs, mockData, page, visibleText } from "./helpers.ts";

test("career content matches the mockup", { skip: !hasMockups }, () => {
  const { ENTRIES, CERTS, SKILLS } = mockData("career.html", ["ENTRIES", "CERTS", "SKILLS"], "const todo");
  const text = visibleText(page("/career"));
  for (const e of ENTRIES) { assert.ok(text.includes(e.title)); for (const p of e.points ?? []) assert.ok(text.includes(visibleText(p)), p); }
  for (const c of CERTS) assert.ok(text.includes(c.name));
  for (const s of SKILLS) for (const i of s.items) assert.ok(text.includes(i), i);
});
test("missing dates show nothing, and verify goes to CompTIA's general page", () => {
  const html = page("/career");
  assert.ok(!visibleText(html).includes("to add"));
  assert.ok(hrefs(html).includes("https://verify.comptia.org"));
  assert.doesNotMatch(html, /class="todo"/);
});
test("links out and to the Azure project", () => {
  const h = hrefs(page("/career"));
  for (const l of ["https://www.linkedin.com/in/naaay-naing/", "https://github.com/nay244/", "/projects/azure/"]) assert.ok(h.includes(l), l);
});
test("a certificate without a date has no date line", () => {
  const html = page("/career");
  const lines = SITE_CERTS.reduce((n, c) => n + 1 + (c.date ? 1 : 0), 0);
  assert.equal([...html.matchAll(/class="meta"/g)].length, lines);
  assert.ok(SITE_CERTS.some((c) => !c.date) && SITE_CERTS.some((c) => c.date));
});
test("back-to-back roles share one employer heading and its span", () => {
  const html = page("/career");
  assert.equal([...html.matchAll(/class="emp"/g)].length, 1);
  assert.ok(visibleText(html).includes("Arlington, VA · Aug 2024 – Sep 2026"));
});
test("the page has one h1, its title, and marks only the career link as current", () => {
  const html = page("/career");
  assert.match(html, /<title>Career · Nay Naing<\/title>/);
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
  assert.equal([...html.matchAll(/aria-current/g)].length, 1);
  const [link] = [...html.matchAll(/<a\b[^>]*aria-current="page"[^>]*>/g)];
  assert.match(link[0], /href="\/career\/"/);
});
