import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { hasMockups, hrefs, page, visibleText } from "./helpers.ts";

test("home says what Nay wrote, and nothing removed", () => {
  const html = page("/"), text = visibleText(html);
  assert.match(html, /<h1[^>]*>Nay Naing<\/h1>/);
  assert.ok(text.includes("Security Engineer / Data Analyst, passionate about building the future for the people."));
  assert.ok(text.includes("N.R. Walker"));
  assert.ok(!hrefs(html).some((href) => href.includes("goodreads")));
  assert.ok(hrefs(html).includes("https://www.linkedin.com/in/naaay-naing/"));
  assert.ok(hrefs(html).includes("https://github.com/nay244/"));
  assert.doesNotMatch(html, /mailto:|feed the koi|class="brand"|class="mock"/);
  assert.ok(!text.includes("nay naing"));
});

test("the quote is word for word from the mockup", { skip: !hasMockups }, () => {
  const mock = readFileSync(".superpowers/brainstorm/mockups/index.html", "utf8");
  const quote = visibleText(mock.match(/<blockquote[\s\S]*?<p>([\s\S]*?)<\/p>/)[1]);
  assert.ok(visibleText(page("/")).includes(quote));
});

// createPond throws without a canvas and a .hero inside the stage, and the koi steer around anything marked data-avoid.
test("the stage holds the canvas, the intro and the header links, so the pond can start", () => {
  const html = page("/"), at = html.indexOf('class="stage"');
  assert.ok(at >= 0, "no .stage");
  const stage = html.slice(at);
  assert.match(stage, /<canvas[^>]*aria-hidden="true"/);
  assert.match(stage, /<main class="hero">/);
  assert.match(stage, /<nav[^>]*data-avoid/);
});
