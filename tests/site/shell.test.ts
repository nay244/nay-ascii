import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { page } from "./helpers.ts";

test("home has the theme script and no scaffold", () => {
  const html = page("/");
  assert.match(html, /<html[^>]*data-theme=/);
  assert.match(html, /prefers-color-scheme/);
  assert.doesNotMatch(html, /Create Next App|tailwind/);
  assert.match(html, /<title>Nay Naing<\/title>/);
});

test("the site icon is the N and a half with no ground, black or white by the system's theme", () => {
  assert.match(page("/"), /<link rel="icon" href="\/icon\.svg[^"]*"[^>]*type="image\/svg\+xml"/);
  const icon = readFileSync("out/icon.svg", "utf8");
  assert.match(icon, /path\{fill:#000\}@media \(prefers-color-scheme:dark\)\{path\{fill:#fff\}\}/);
  assert.equal([...icon.matchAll(/<path /g)].length, 1);
  // The header draws the same shape, so the two can't drift apart.
  const shape = icon.match(/<path d="([^"]+)"/)[1];
  assert.ok(page("/").includes(`<path d="${shape}"`));
});

test("every page has the logo as its way home and no home tab, and marks its section", () => {
  const inner = page("/projects"), home = page("/");
  for (const html of [inner, home]) {
    assert.match(html, /<a(?=[^>]*class="logo")(?=[^>]*href="\/")(?=[^>]*aria-label="Home")(?=[^>]*data-avoid)[^>]*><svg/);
    assert.doesNotMatch(html, />home<\/a>|class="brand"/);
  }
  assert.doesNotMatch(home, /aria-current/);
  assert.match(inner, /<a(?=[^>]*aria-current="page")(?=[^>]*href="\/projects\/")[^>]*>projects<\/a>/);
  assert.equal([...inner.matchAll(/aria-current/g)].length, 1);
  assert.match(inner, /<title>Projects · Nay Naing<\/title>/);
});
