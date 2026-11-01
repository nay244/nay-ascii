import assert from "node:assert/strict";
import test from "node:test";
import { SERIES } from "../../src/content/blog.ts";
import { getNote, hasContents } from "../../src/lib/notes.ts";
import { hrefs, page, visibleText } from "./helpers.ts";

test("all 57 note pages exist", () => {
  for (const s of SERIES) for (const n of s.notes) assert.ok(page(`/blog/${s.id}/${n.slug}`).length > 0, n.slug);
});
test("WGU notes put the course code in the line above the title", () => {
  const text = visibleText(page("/blog/wgu/d204-the-data-analytics-journey"));
  assert.ok(text.includes("D204 · note 1 of 11"));
  assert.ok(text.includes("The Data Analytics Journey"));
});
test("Japanese notes carry the credit, and the others don't", () => {
  const h = page("/blog/japanese/japanese-primer");
  assert.ok(visibleText(h).includes("Written by Morg, from Morg Systems ↗"));
  assert.ok(hrefs(h).includes("https://morg.systems/Japanese"));
  assert.ok(!visibleText(page("/blog/az900/cost-governance")).includes("Morg"));
});
test("no note shows read time", () => {
  for (const s of SERIES) for (const n of s.notes) assert.doesNotMatch(visibleText(page(`/blog/${s.id}/${n.slug}`)), /\bmin read\b/, n.slug);
});
test("the contents list appears only on long notes", () => {
  for (const s of SERIES) for (const n of s.notes) {
    const { toc, words } = getNote(s.id, n.slug);
    assert.equal(/class="toc"/.test(page(`/blog/${s.id}/${n.slug}`)), hasContents(toc, words), n.slug);
  }
});
test("previous and next walk the series and return at the ends", () => {
  const first = hrefs(page("/blog/data/excel"));
  assert.ok(first.includes("/blog/data/") && first.includes("/blog/data/pluralsight-excel/"));
  assert.ok(hrefs(page("/blog/data/python")).includes("/blog/data/"));
});
test("note text is in the HTML", () => assert.match(page("/blog/japanese/japanese-primer"), /READ THIS FIRST/));

// The tests below go beyond the brief's.
test("a note is titled by its name, without the course code", () => {
  assert.match(page("/blog/wgu/d204-the-data-analytics-journey"), /<title>The Data Analytics Journey · Nay Naing<\/title>/);
  assert.match(page("/blog/az900/cost-governance"), /<title>Cost &amp; Governance · Nay Naing<\/title>/);
});
test("the trail has a dot for each note, marks this one, and breaks before each Japanese group", () => {
  for (const s of SERIES) for (const [at, n] of s.notes.entries()) {
    const trail = /<nav class="trail"[^>]*>([\s\S]*?)<\/nav>/.exec(page(`/blog/${s.id}/${n.slug}`))?.[1] ?? "";
    const dots = trail.match(/<a [^>]*>/g) ?? [];
    assert.equal(dots.length, s.notes.length, n.slug);
    assert.equal(dots.filter((d) => d.includes('aria-current="page"')).length, 1, n.slug);
    assert.ok(dots[at].includes('aria-current="page"') && dots[at].includes(`href="/blog/${s.id}/${n.slug}/"`), n.slug);
    assert.equal(dots.filter((d) => /class="first"/.test(d)).length, s.groups?.length ?? 0, n.slug);
  }
});
test("the line under the trail says where the note sits, with its group", () => {
  assert.ok(visibleText(page("/blog/japanese/japanese-primer")).includes("note 1 of 38 · start here"));
  assert.ok(visibleText(page("/blog/japanese/kanji")).includes("note 6 of 38 · writing system"));
  assert.ok(visibleText(page("/blog/az900/cost-governance")).includes("note 5 of 5"));
});
test("the first and last notes lead back to the series, in the series' short name", () => {
  const first = visibleText(page("/blog/wgu/d204-the-data-analytics-journey"));
  assert.ok(first.includes("← WGU") && first.includes("← back to the series WGU") && first.includes("next → Data Acquisition"));
  const last = visibleText(page("/blog/wgu/d214-data-analytics-graduate-capstone"));
  assert.ok(last.includes("← previous Advanced Data Analytics") && last.includes("end of the series → all WGU notes"));
});
test("contents entries read as text, with no entity showing", () => {
  for (const [s, n, entry] of [
    ["az900", "azure-services", "Storage Account Types & Services"],
    ["az900", "identity-security", "Security Frameworks & Models"],
    ["japanese", "japanese-sentence-structure-da-explained", "Advanced: Details & Extras"],
  ]) {
    const text = visibleText(page(`/blog/${s}/${n}`));
    assert.ok(text.includes(entry), entry);
    assert.doesNotMatch(text, /&(amp|lt|gt|quot|#\d+);/, `${s}/${n}`);
  }
});
