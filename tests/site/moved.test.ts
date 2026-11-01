import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { hrefs, page, visibleText } from "./helpers.ts";

const MOVED = { "about-me": "/", "index-maps": "/", azure: "/blog/az900/", wgu: "/blog/wgu/", "language-learning": "/blog/japanese/", "knowledge-base": "/blog/data/" };

test("old URLs redirect", () => {
  for (const [from, to] of Object.entries(MOVED)) {
    const html = page(`/${from}`);
    assert.match(html, new RegExp(`http-equiv="refresh"[^>]*url=${to}"`), from);
    assert.ok(hrefs(html).includes(to), from);
    assert.match(html, /noindex/);
  }
});

test("the 404 has its art, says what happened and links home", () => {
  const html = readFileSync(join(import.meta.dirname, "..", "..", "out", "404.html"), "utf8");
  assert.ok(hrefs(html).includes("/"));
  assert.match(html, /data-piece="sleepy-moon"/);
  assert.ok(visibleText(html).includes("Page not found"));
  assert.doesNotMatch(html, /This page could not be found/);
});
