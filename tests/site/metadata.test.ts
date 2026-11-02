import assert from "node:assert/strict";
import test from "node:test";
import { page } from "./helpers.ts";

// The content of a <meta> tag, by its name or property, as written in the HTML.
function meta(html: string, key: string): string | undefined {
  return new RegExp(`<meta (?:name|property)="${key}" content="([^"]*)"`).exec(html)?.[1];
}

test("project and note pages have their own description, repeated for link previews", () => {
  const home = meta(page("/"), "description");
  assert.ok(home);
  for (const route of ["/projects/azure", "/blog/japanese/kanji"]) {
    const html = page(route);
    const description = meta(html, "description");
    assert.ok(description, route);
    assert.notEqual(description, home, route);
    assert.equal(meta(html, "og:description"), description, route);
    assert.ok(meta(html, "og:title"), route);
  }
  assert.equal(meta(page("/"), "og:description"), home);
});
