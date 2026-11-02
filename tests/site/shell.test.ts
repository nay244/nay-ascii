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

test("inner pages have the name link and mark their section", () => {
  const html = page("/projects");
  assert.match(html, /class="brand"[^>]*href="\/"|href="\/"[^>]*class="brand"/);
  assert.match(html, /aria-current="page"[^>]*>projects|href="\/projects\/"[^>]*aria-current="page"/);
  assert.match(html, /<title>Projects · Nay Naing<\/title>/);
});
