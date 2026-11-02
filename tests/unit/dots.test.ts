import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import { mountArt } from "../../src/lib/dots/dotart.ts";
import type { Art } from "../../src/lib/dots/dotart.ts";
import { createPond } from "../../src/lib/dots/pond.ts";
import type { Pond } from "../../src/lib/dots/pond.ts";
import { SHAPES, shapeInfo } from "../../src/lib/dots/shapes.ts";
import { fakeCanvas, fakeStage, installFakeDom } from "./fake-dom.ts";

// Whatever a test creates is destroyed afterwards, so one failing test can't leave a loop running under the next.
const live: (Pond | Art)[] = [];
const track = <T extends Pond | Art>(engine: T): T => { live.push(engine); return engine; };
afterEach(() => { for (const engine of live.splice(0)) engine.destroy(); });

const BROWSER_GLOBALS = ["window", "document", "matchMedia", "requestAnimationFrame", "ResizeObserver", "IntersectionObserver"];

test("importing the engines touches no browser API", async () => {
  // This runs before any test installs the fake DOM, so a module that reached for a browser API at load would throw here.
  for (const name of BROWSER_GLOBALS) assert.equal(name in globalThis, false, `${name} should not exist yet`);
  // The query string makes Node evaluate each module again instead of reusing the copy imported above.
  for (const name of ["pond", "dotart", "shapes"]) await import(`../../src/lib/dots/${name}.ts?again`);
});

// Each lotus's distance from its own side, in pad radii, in the order they're laid out.
const LOTUS_INSETS = [0.629, 0.734, 1.429, 0.623];
const fromSide = (pond: Pond, w: number) => pond.pads.map((p, i) => (i < 2 ? p.hx : w - p.hx) - LOTUS_INSETS[i] * p.R);

test("on a desktop each lotus sits 100px further in from its side", () => {
  installFakeDom();
  const pond = track(createPond(fakeStage(1440, 900), "dark", 1));
  assert.equal(pond.pads.length, 4);
  for (const moved of fromSide(pond, 1440)) assert.ok(Math.abs(moved - 100) < 0.01, String(moved));
});

test("on a phone the lotus stay at the sides", () => {
  installFakeDom();
  const pond = track(createPond(fakeStage(1023, 768), "dark", 1));
  assert.ok(pond.pads.length > 0);
  for (const moved of fromSide(pond, 1023)) assert.ok(Math.abs(moved) < 0.01, String(moved));
});

test("a lotus that moving in would put under the intro text stays at its side, and the pond keeps all four", () => {
  installFakeDom();
  const stage = fakeStage(1024, 768);
  Object.assign((stage as unknown as { hero: object }).hero, {
    getBoundingClientRect: () => ({ left: 205, top: 418, right: 700, bottom: 568, width: 495, height: 150 }),
  });
  const pond = track(createPond(stage, "dark", 1));
  assert.equal(pond.pads.length, 4);
  const moved = fromSide(pond, 1024);
  assert.ok(Math.abs(moved[0] - 100) < 0.01, String(moved[0]));
  assert.ok(Math.abs(moved[1]) < 0.01, String(moved[1]));
});

test("destroying the last pond stops the loop and cleans up", () => {
  const dom = installFakeDom(), stage = fakeStage(1280, 800);
  const pond = track(createPond(stage, "dark", 1));
  assert.equal(dom.frames.size, 1);
  assert.ok(stage.listenerCount > 0);
  pond.destroy();
  dom.runFrames(16);
  assert.equal(dom.frames.size, 0);
  assert.ok(dom.observers.length > 0 && dom.observers.every((o) => o.disconnected));
  assert.equal(stage.listenerCount, 0);
});

test("create, destroy, create leaves exactly one loop", () => {
  const dom = installFakeDom(), stage = fakeStage(1280, 800);
  track(createPond(stage, "dark", 1)).destroy();
  const second = track(createPond(stage, "dark", 1));
  dom.runFrames(16);
  assert.equal(dom.frames.size, 1);
  dom.runFrames(32);
  assert.equal(dom.frames.size, 1);
  second.destroy();
  assert.equal(dom.frames.size, 0);
});

test("two live ponds share one loop", () => {
  const dom = installFakeDom();
  const a = track(createPond(fakeStage(1280, 800), "dark", 1)), b = track(createPond(fakeStage(375, 812), "dark", 2));
  assert.equal(dom.frames.size, 1);
  // The loop outlives the first pond to go and ends with the last.
  a.destroy();
  a.destroy(); // a second destroy changes nothing
  dom.runFrames(16);
  assert.equal(dom.frames.size, 1);
  b.destroy();
  assert.equal(dom.frames.size, 0);
});

test("reduced motion schedules no frames and still draws", () => {
  const dom = installFakeDom({ reducedMotion: true }), stage = fakeStage(1280, 800);
  const pond = track(createPond(stage, "dark", 1));
  assert.equal(dom.frames.size, 0);
  assert.ok(stage.canvas.ctx.fills > 0, "the still pond should be drawn");
  pond.destroy();
  assert.equal(dom.frames.size, 0);
});

test("a small height change keeps the koi", () => {
  const dom = installFakeDom(), stage = fakeStage(375, 812);
  const pond = track(createPond(stage, "dark", 1)), koi = pond.koi;
  assert.ok(koi.length > 0);
  dom.resize(stage, 375, 752);
  assert.equal(pond.koi, koi);
  assert.equal(stage.canvas.height, 752, "the canvas still follows the stage");
  dom.resize(stage, 700, 752);
  assert.notEqual(pond.koi, koi);
});

test("small height changes add up against the last layout, not the one before", () => {
  const dom = installFakeDom(), stage = fakeStage(375, 812);
  const pond = track(createPond(stage, "dark", 1)), koi = pond.koi;
  dom.resize(stage, 375, 740);
  dom.resize(stage, 375, 700);
  assert.equal(pond.koi, koi, "112 away from the layout is still within 120");
  dom.resize(stage, 375, 670);
  assert.notEqual(pond.koi, koi, "142 away is not, though this step alone was only 30");
});

test("only a pond on screen is drawn each frame", () => {
  const dom = installFakeDom(), stage = fakeStage(1280, 800);
  track(createPond(stage, "dark", 1));
  const ctx = stage.canvas.ctx;
  let fills = ctx.fills;
  dom.runFrames(16);
  assert.equal(ctx.fills, fills, "off screen, nothing is drawn");
  dom.intersect(stage, true);
  dom.runFrames(32);
  assert.ok(ctx.fills > fills, "on screen, a frame is drawn");
  fills = ctx.fills;
  dom.intersect(stage, false);
  dom.runFrames(48);
  assert.equal(ctx.fills, fills);
});

test("a pond redraws in the other palette when its theme changes", () => {
  installFakeDom();
  const stage = fakeStage(1280, 800), ctx = stage.canvas.ctx;
  const pond = track(createPond(stage, "dark", 1));
  assert.equal(ctx.fillRects.at(-1), "#1a1917");
  const dark = new Set(ctx.fillStyles);
  ctx.fillStyles.length = 0;
  pond.setTheme("light");
  assert.equal(ctx.fillRects.at(-1), "#eef2f4");
  const light = new Set(ctx.fillStyles);
  assert.ok(light.size > 0);
  assert.deepEqual([...light].filter((c) => dark.has(c)), [], "no dot keeps its colour from the old palette");
});

test("clicking the water feeds the koi, and a link in the pond keeps its click", () => {
  // With reduced motion nothing animates, so the only redraw after the first is the one a feeding asks for.
  installFakeDom({ reducedMotion: true });
  const stage = fakeStage(1280, 800), ctx = stage.canvas.ctx;
  const pond = track(createPond(stage, "dark", 1));
  const before = ctx.fills;
  const link = { closest: (selector: string) => (selector === "a, button" ? link : null) };
  stage.dispatch("pointerdown", { target: link, clientX: 600, clientY: 300 });
  assert.equal(ctx.fills, before, "a click on a link is not a feeding");
  stage.dispatch("pointerdown", { target: { closest: () => null }, clientX: 600, clientY: 300 });
  assert.ok(ctx.fills > before, "a click on the water is");
  pond.destroy();
  assert.equal(stage.listenerCount, 0);
});

test("destroying a drawing mid-ripple cancels its frame", () => {
  const dom = installFakeDom(), canvas = fakeCanvas(300, 200), trigger = fakeStage(300, 200);
  const art = track(mountArt(canvas, "japan-route", trigger, "dark"));
  art.ripple(100, 100);
  assert.equal(dom.frames.size, 1);
  art.destroy();
  assert.equal(dom.frames.size, 0);
  art.ripple(100, 100);
  art.rippleAt(50, 40);
  assert.equal(dom.frames.size, 0, "a ripple asked for after destroy does nothing");
  assert.ok(dom.observers.every((o) => o.disconnected));
  assert.equal(trigger.listenerCount, 0);
});

test("a drawing ripples from a point in its own box, and not when motion is reduced", () => {
  const dom = installFakeDom();
  const art = track(mountArt(fakeCanvas(300, 234), "japan-route", fakeStage(300, 234), "dark"));
  art.rippleAt(...shapeInfo("japan-route").points.Tokyo);
  assert.equal(dom.frames.size, 1);
  art.destroy();

  const still = installFakeDom({ reducedMotion: true });
  const calm = track(mountArt(fakeCanvas(300, 234), "japan-route", fakeStage(300, 234), "dark"));
  calm.ripple(10, 10);
  assert.equal(still.frames.size, 0);
});

test("a drawing adds no elements to the page and redraws in the other palette", () => {
  installFakeDom();
  const canvas = fakeCanvas(300, 234), ctx = canvas.ctx;
  const art = track(mountArt(canvas, "japan-route", fakeStage(300, 234), "dark"));
  assert.equal(canvas.parentElement.appended, 0, "labels are rendered by the page, not by the engine");
  assert.ok(ctx.fills > 0);
  const dark = new Set(ctx.fillStyles);
  ctx.fillStyles.length = 0;
  art.setTheme("light");
  const light = new Set(ctx.fillStyles);
  assert.ok(light.size > 0);
  assert.deepEqual([...light].filter((c) => dark.has(c)), [], "no colour is shared between the two palettes");
});

test("a drawing caps the device pixel ratio at 2", () => {
  installFakeDom();
  (globalThis as { devicePixelRatio: number }).devicePixelRatio = 3;
  const canvas = fakeCanvas(300, 234);
  track(mountArt(canvas, "japan-route", fakeStage(300, 234), "dark"));
  assert.equal(canvas.width, 600);
  assert.equal(canvas.height, 468);
});

test("the Japan route is the one shape left", () => assert.deepEqual(Object.keys(SHAPES), ["japan-route"]));

test("japan-route labels name their stop", () => {
  const { labels, points } = shapeInfo("japan-route");
  const hakone = labels.find((l) => l[2] === "Hakone");
  assert.equal(hakone?.[4], "Hakone");
  // Every label but the two unplanned "?" stops names a point the page can ripple from.
  const named = labels.filter((l) => l[2] !== "?");
  assert.equal(named.length, 7);
  for (const [, , text, , stop] of named) {
    assert.equal(stop, text);
    assert.ok(points[stop as string], `${text} should be a stop on the map`);
  }
  assert.deepEqual(labels.filter((l) => l[2] === "?").map((l) => l[4]), [undefined, undefined]);
});
