import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { colsFor, fontPx } from "../../src/lib/art/fit.ts";
import { firstFrame } from "../../src/lib/art/first-frame.ts";
import type { DiagramSlug } from "../../src/lib/art/first-frame.ts";
import { loadPiece } from "../../src/lib/art/load.ts";
import type { PieceModule, PieceSlug } from "../../src/lib/art/load.ts";
import { mountPiece } from "../../src/lib/art/mount.ts";
import { hasMockups } from "../site/helpers.ts";
import { fakeBox, installFakeDom } from "./fake-dom.ts";

const ART = join(import.meta.dirname, "..", "..", "src", "lib", "art");
const MOCK = join(import.meta.dirname, "..", "..", ".superpowers", "brainstorm", "mockups");

// The widths each piece is drawn at on the site: a scene on a card or in a wide band, a diagram in its panel.
const SCENES: Record<string, number[]> = { "project-azure-virtualfw": [192, 324], "project-servicenow-dashboard": [192, 324], "project-hyperv-move": [192, 324], "project-roluna-deck": [192, 324], "blog-data-notebook": [192] };
const DIAGRAMS: Record<string, number> = { "project-azure": 62, "project-azure-before": 46, "project-azure-after": 46, "project-servicenow": 62, "project-servicenow-stages": 46, "project-hyperv": 46, "project-roluna": 46 };
const LIBRARY = ["fuji-dawn-lake", "autumn-pagoda-maples", "owl-blink", "cloud-drift", "sleepy-moon"];
const FLOWS: Record<string, string[]> = { "project-servicenow-stages": ["1", "2", "3", "4", "5", "6", "7", "8", "9"], "project-hyperv": ["plan", "test", "execute"], "project-roluna": ["adzuna", "ingest", "mongo", "api", "deck"] };
const BANNED = /(?<![\d.])(?:\d{1,3}\.){3}\d{1,3}(?![\d.])|partners?\b|palo ?alto|pan-?os|fortinet|cisco|check ?point|juniper|\bPA-\d/i;

const PIECES = [...Object.keys(SCENES), ...Object.keys(DIAGRAMS), ...LIBRARY] as PieceSlug[];
type Frame = string | { text: string; color: string };
const textOf = (frame: Frame) => (typeof frame === "string" ? frame : frame.text);
// Every width a piece is drawn at, with the module loaded for it.
const widthsOf = (slug: string, mod: PieceModule) => SCENES[slug] ?? (slug in DIAGRAMS ? [DIAGRAMS[slug]] : [mod.meta.cols]);

const BROWSER_GLOBALS = ["window", "document", "matchMedia", "requestAnimationFrame", "ResizeObserver", "IntersectionObserver"];

test("importing the art code touches no browser API", () => {
  // The imports above ran before any test installed the fake DOM, so a module that reached for a browser API at load would have thrown.
  for (const name of BROWSER_GLOBALS) assert.equal(name in globalThis, false, `${name} should not exist yet`);
});

test("only what's in use ships", () => {
  const names = (dir: string) => readdirSync(join(ART, dir)).map((f) => f.replace(/\.js$/, "")).sort();
  assert.deepEqual(names("pieces"), [...Object.keys(SCENES), ...Object.keys(DIAGRAMS), "diagram", "scene"].sort());
  assert.deepEqual(names("vendor/ascii-magic/pieces"), [...LIBRARY].sort());
});

test("the art is byte for byte the approved art", { skip: !hasMockups }, () => {
  // Every file under src/lib/art/pieces and src/lib/art/vendor against its namesake under MOCK/pieces and MOCK/vendor.
  const files = (dir: string): string[] =>
    readdirSync(join(ART, dir), { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)]));
  const shipped = [...files("pieces"), ...files("vendor")];
  assert.ok(shipped.length > 0, "the art folders look empty");
  for (const file of shipped) {
    assert.ok(readFileSync(join(ART, file)).equals(readFileSync(join(MOCK, file))), `${file} differs from the approved copy`);
  }
});

test("each box picks its columns", () => {
  const scene = { cols: 192, rows: 108, cell: "square", cover: true, wide: 324 }, plain = { cols: 192, rows: 108, cell: "square", cover: true };
  assert.equal(colsFor(scene, 405, 228), 192);
  assert.equal(colsFor(scene, 829, 275), 324);
  assert.equal(colsFor(scene, 307, 172), 192);
  assert.equal(colsFor(plain, 829, 275), 192);
  assert.equal(colsFor(scene, 829, 275, 46), 46); // a page's fixed width beats a wide version
});

test("scenes and library pieces fill their box, and diagrams fit whole", () => {
  const near = (a: number, b: number) => assert.ok(Math.abs(a - b) < 0.01, `${a} vs ${b}`);
  near(fontPx("project-roluna-deck", { cols: 192, rows: 108, cell: "square", cover: true }, 192, 405, 228), 3.51);
  near(fontPx("owl-blink", { cols: 76, rows: 38 }, 76, 405, 228), 8.85);
  near(fontPx("project-azure", { cols: 62, rows: 19 }, 62, 805, 410), 21.57);
});

test("every first frame is complete enough to hold", async () => {
  for (const slug of PIECES) {
    const mod = await loadPiece(slug);
    for (const cols of widthsOf(slug, mod)) {
      const marks = new Set([...textOf(mod.default(cols)(0))].filter((c) => c.trim() !== ""));
      assert.ok(marks.size >= 4, `${slug} at ${cols} shows only ${marks.size} kinds of mark at t = 0`);
    }
  }
});

test("no frame shows an IP, Partners or a firewall maker", async () => {
  for (const slug of PIECES) {
    const mod = await loadPiece(slug);
    for (const cols of widthsOf(slug, mod)) {
      const draw = mod.default(cols);
      for (let t = 0; t <= 40; t += 0.5) {
        // Name the piece and the time, never the matching text.
        assert.doesNotMatch(textOf(draw(t)), BANNED, `${slug} at ${cols} shows a banned term at t = ${t}`);
      }
    }
  }
});

test("scenes paint only their approved words", () => {
  // Painted words are drawn in blocks, so the frame test above can't see them. This pins them, including no AZURE on the Azure scene.
  const words = (s: string) => [...new Set([...readFileSync(join(ART, "pieces", `${s}.js`), "utf8").matchAll(/"([A-Z][A-Z -]+)"/g)].map((m) => m[1]))].sort();
  assert.deepEqual(words("project-azure-virtualfw"), ["FIREWALL"]);
  assert.deepEqual(words("project-servicenow-dashboard"), []);
  assert.deepEqual(words("project-hyperv-move"), ["HYPER-V", "VMWARE"]);
  assert.deepEqual(words("project-roluna-deck"), ["PASS", "ROLUNA", "SAVE"]);
  assert.deepEqual(words("blog-data-notebook"), ["NOTEBOOK"]);
});

// How bright a frame's white point is, worked out the way paintTone does in runtime/canvas.js. Neither LV nor L is exported there, so they are copied.
const LV: Record<string, number> = { "▁": 0.135, "▂": 0.257, "▃": 0.378, "▄": 0.51, "▅": 0.635, "▆": 0.757, "▇": 0.878, "█": 1 };
const lums = new Map<string, number>();
const L = (hex: string | null) => {
  if (!hex) return 0.88;
  let v = lums.get(hex);
  if (v === undefined) {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    lums.set(hex, (v = 0.2126 * r + 0.7152 * g + 0.0722 * b));
  }
  return v;
};
function whitePoint(frame: Frame, meta: PieceModule["meta"] & { palette?: Record<string, string>; dots?: { tone?: { hi?: number } } }) {
  const rows = textOf(frame).split("\n");
  const colors = typeof frame === "string" ? null : frame.color.split("\n");
  const values = new Float64Array(textOf(frame).length);
  let n = 0;
  for (let y = 0; y < rows.length; y++) {
    const keys = colors ? [...colors[y]] : [];
    let x = 0;
    for (const glyph of rows[y]) {
      const key = keys[x++];
      if (glyph === " ") continue;
      values[n++] = (LV[glyph] ?? 1) * L(key && key !== " " ? meta.palette?.[key] ?? null : null);
    }
  }
  const sorted = values.subarray(0, n).sort();
  const q = meta.dots?.tone?.hi ?? 0.985;
  return sorted[Math.max(0, Math.ceil(q * n) - 1)];
}

test("scene brightness holds steady", async () => {
  // A scene whose white point jumps between frames flashes on the page.
  for (const slug of Object.keys(SCENES)) {
    const mod = await loadPiece(slug as PieceSlug);
    for (const cols of SCENES[slug]) {
      const draw = mod.default(cols);
      let last = whitePoint(draw(0), mod.meta), worst = 0;
      for (let i = 1; i < 600; i++) {
        const now = whitePoint(draw(i / 15), mod.meta);
        worst = Math.max(worst, Math.abs(now - last));
        last = now;
      }
      // The Hyper-V scene has a known dip in its brief at the wide size, which the spec leaves alone.
      const limit = slug === "project-hyperv-move" && cols === 324 ? 0.08 : 0.05;
      assert.ok(worst <= limit, `${slug} at ${cols} changes by ${worst.toFixed(3)} between frames (limit ${limit})`);
    }
  }
});

test("every flow stop lights its box", async () => {
  for (const [slug, stops] of Object.entries(FLOWS)) {
    const mod = await loadPiece(slug as PieceSlug);
    assert.ok(mod.setFocus, `${slug} has no setFocus`);
    const draw = mod.default(DIAGRAMS[slug]);
    try {
      mod.setFocus(null);
      const rest = JSON.stringify(draw(0));
      for (const stop of stops) {
        mod.setFocus(stop);
        assert.notEqual(JSON.stringify(draw(0)), rest, `${slug} looks the same with "${stop}" lit`);
      }
    } finally {
      mod.setFocus(null);
    }
  }
});

test("the Hyper-V diagram shows no dates or counts", () => assert.doesNotMatch(firstFrame("project-hyperv", 46), /\d/));

test("the first frames carry the labels", () => {
  assert.ok(firstFrame("project-azure-before", 46).includes("vendor zone"));
  assert.ok(firstFrame("project-azure", 62).includes("Azure Migration"));
  assert.ok(firstFrame("project-servicenow", 62).includes("ServiceNow ETL"));
});

test("every diagram has a first frame", () => {
  for (const slug of Object.keys(DIAGRAMS)) {
    const frame = firstFrame(slug as DiagramSlug, DIAGRAMS[slug]);
    assert.equal(typeof frame, "string");
    assert.ok(frame.trim().length > 0, `${slug} has an empty first frame`);
  }
});

// What a mounted piece does to its player and its <pre>, without a browser. The fake play counts starts and stops.
function fakePre() {
  const canvas = { removed: 0, remove() { this.removed++; } };
  return { style: { display: "none", fontSize: "" } as Record<string, string>, _canvas: canvas as { remove(): void } | null } as unknown as HTMLElement & { _canvas: { removed: number } | null };
}
function fakePlay() {
  const started: PieceModule[] = [], stopped: number[] = [];
  const play = (_pre: unknown, mod: PieceModule) => {
    const n = started.push(mod) - 1;
    stopped[n] = 0;
    return () => { stopped[n]++; };
  };
  return { play: play as never, started, stopped };
}

test("destroying a mounted piece stops it and cleans up", async () => {
  const dom = installFakeDom(), box = fakeBox(405, 228), pre = fakePre(), fake = fakePlay();
  const canvas = pre._canvas!;
  const piece = mountPiece(box, pre, "project-azure-virtualfw", await loadPiece("project-azure-virtualfw"), { play: fake.play });
  assert.equal(fake.started.length, 1);
  assert.deepEqual(dom.observers.map((o) => [o.kind, o.targets[0]]), [["resize", box]]);
  piece.destroy();
  assert.equal(fake.stopped[0], 1, "the player was not stopped");
  assert.ok(dom.observers.every((o) => o.disconnected), "the observer is still watching");
  assert.equal(canvas.removed, 1, "the canvas was not removed");
  assert.ok(!pre._canvas, "the canvas is still on the pre");
  assert.equal(pre.style.display, "");
});

test("a resize refits, and crossing a banner's shape restarts once", async () => {
  const dom = installFakeDom(), box = fakeBox(405, 228), pre = fakePre(), fake = fakePlay();
  const piece = mountPiece(box, pre, "project-azure-virtualfw", await loadPiece("project-azure-virtualfw"), { play: fake.play });
  const size = () => parseFloat(pre.style.fontSize);
  assert.ok(Math.abs(size() - 3.51) < 0.01, `font is ${pre.style.fontSize}`);
  dom.resize(box, 410, 230);
  assert.equal(fake.started.length, 1, "a small resize restarted the player");
  assert.ok(Math.abs(size() - 410 / (192 * 0.602)) < 0.01, "the font did not follow the box");
  dom.resize(box, 829, 275);
  assert.equal(fake.started.length, 2);
  assert.equal(fake.stopped[0], 1, "the first player kept running");
  assert.equal(fake.stopped[1], 0);
  assert.deepEqual(fake.started.map((m) => m.meta.cols), [192, 324]);
  piece.destroy();
});

test("a fixed width beats the box's shape", async () => {
  const dom = installFakeDom(), box = fakeBox(805, 410), pre = fakePre(), fake = fakePlay();
  const piece = mountPiece(box, pre, "project-azure", await loadPiece("project-azure"), { play: fake.play, cols: 62 });
  assert.equal(fake.started[0].meta.cols, 62);
  assert.ok(Math.abs(parseFloat(pre.style.fontSize) - 21.57) < 0.01);
  dom.resize(box, 400, 130);
  assert.equal(fake.started.length, 1);
  piece.destroy();
});

test("focus reaches the piece, a held frame redraws, and destroy clears it", async () => {
  installFakeDom();
  const real = await loadPiece("project-hyperv"), lit: (string | null)[] = [];
  const mod: PieceModule = { meta: real.meta, default: real.default, setFocus: (stop) => { lit.push(stop); } };

  const held = fakePlay(), quietly = mountPiece(fakeBox(405, 228), fakePre(), "project-hyperv", mod, { play: held.play, quiet: true });
  quietly.setFocus("plan");
  assert.deepEqual(lit, ["plan"]);
  assert.equal(held.started.length, 2, "a held frame was not drawn again");
  assert.equal(held.stopped[0], 1);
  quietly.destroy();
  assert.equal(lit.at(-1), null);

  lit.length = 0;
  const moving = fakePlay(), animated = mountPiece(fakeBox(405, 228), fakePre(), "project-hyperv", mod, { play: moving.play, quiet: false });
  animated.setFocus("test");
  assert.deepEqual(lit, ["test"]);
  assert.equal(moving.started.length, 1, "a moving piece was restarted for nothing");
  animated.destroy();
  assert.equal(lit.at(-1), null);
});
