import assert from "node:assert/strict";
import test from "node:test";
import { page } from "./helpers.ts";

test("home has the theme script and no scaffold", () => {
  const html = page("/");
  assert.match(html, /<html[^>]*data-theme=/);
  assert.match(html, /prefers-color-scheme/);
  assert.doesNotMatch(html, /Create Next App|tailwind/);
  assert.match(html, /<title>Nay Naing<\/title>/);
});

test("every page has a home tab and no name link, and marks its section", () => {
  const inner = page("/projects"), home = page("/");
  for (const html of [inner, home]) {
    assert.match(html, /<a[^>]*href="\/"[^>]*>home<\/a>/);
    assert.doesNotMatch(html, /class="brand"/);
  }
  assert.match(home, /<a(?=[^>]*aria-current="page")(?=[^>]*href="\/")[^>]*>home<\/a>/);
  assert.match(inner, /<a(?=[^>]*aria-current="page")(?=[^>]*href="\/projects\/")[^>]*>projects<\/a>/);
  assert.equal([...inner.matchAll(/aria-current/g)].length, 1);
  assert.match(inner, /<title>Projects · Nay Naing<\/title>/);
});
