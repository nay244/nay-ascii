/* blog-data-notebook: a code notebook. A cell is typed line by line in coloured bars, it runs, and a table and then a histogram appear underneath. Nothing in it is real code or real data, so it carries no text but its tab. */
import { clamp } from "../vendor/ascii-magic/lib/kit.js";
import { H, DATA, canvas, ease, hex, sceneMeta } from "./scene.js";

export const meta = sceneMeta({
  slug: "blog-data-notebook", name: "Data analytics notebook",
  note: "A notebook cell is typed in coloured bars and run, and a table and then a histogram appear underneath. Nothing in it is real code or real data.",
  tags: ["notebook", "python", "code", "chart", "data"],
  pal: DATA, tone: { curve: 0.5, hi: 0.95 }, // the tab bar sets the white point, so the picture holds steady while the rest comes and goes
});

const TYPE = 4, RUNS = 0.7, TABLE = 0.9, CHART = 2.2, LOOP = 12.8, OUT_AT = 11.9, START = 8.6;
const GOLD = hex("#ffd43b"), PINK = hex("#d97fb0"), SKY = hex("#8fcaf5"), MINT = hex("#a7e3bf"), WHITE = hex("#ffffff"), GREEN = hex("#5cc48a"), BLUE = hex("#4b8bbe"), PLATE = hex("#1c2030"), SHADE = hex("#343a4c"), MID = hex("#565e72"), EDGE = hex("#838b9c"), HOLE = hex("#08140f"), NIGHT = hex("#0f2a1e");
// Each line of code as [colour, width] tokens, the way an editor colours them.
const CODE = [
  [[GOLD, 9], [WHITE, 14], [GOLD, 5], [WHITE, 5]],
  [[WHITE, 8], [PINK, 4], [SKY, 22], [MINT, 20]],
  [[WHITE, 8], [PINK, 4], [WHITE, 6], [SKY, 15], [MINT, 10]],
  [[WHITE, 6], [SKY, 10], [MINT, 16], [GOLD, 7]],
];
const TOTAL = CODE.flat().reduce((n, [, w]) => n + w, 0);
const BINS = [0.08, 0.17, 0.31, 0.52, 0.78, 0.96, 0.88, 0.64, 0.41, 0.23, 0.12, 0.06];

export default function create(cols = meta.cols) {
  const s = canvas(cols, DATA), R = cols - 5, B = 103, OY = 49, CHART_X = 76, CHART_R = R - 7, BASE = B - 8, BIN = (CHART_R - CHART_X) / BINS.length;
  for (let y = 0; y < H; y++) for (let x = 0; x < cols; x++) s.add(x, y, NIGHT);
  s.box((4 + R) / 2, (4 + B) / 2, R - 4, B - 4, 2, PLATE);
  // The tab bar.
  s.rect(5, 5, R - 1, 12, SKY);
  for (const x of [9, 13, 17]) s.disc(x, 8.5, 1, 1, PLATE);
  s.box(45, 9, 38, 8, 1, PLATE);
  s.word("NOTEBOOK", 45, 9, MINT);
  // The code cell, with its prompt.
  s.box((18 + R - 4) / 2, 30, R - 22, 28, 1, HOLE);
  for (const [x, tip] of [[6, 7], [15, 14]]) { s.rect(x, 25, x, 35, EDGE); for (const y of [25, 35]) s.rect(Math.min(x, tip), y, Math.max(x, tip), y, EDGE); }
  s.freeze();
  return (t) => {
    s.begin();
    const lt = (t + START) % LOOP, fade = 1 - ease((lt - OUT_AT) / 0.8), typed = clamp((lt - 0.2) / TYPE) * TOTAL, ran = TYPE + 0.3, shown = ran + RUNS;
    // The code, up to where typing has got.
    let used = 0, caret = null;
    CODE.forEach((line, i) => {
      let x = 21;
      const y = 20 + i * 7;
      for (const [c, w] of line) {
        const on = clamp(typed - used, 0, w);
        if (on > 0) { s.rect(x, y, x + on - 1, y + 2, c, fade); caret = [x + on + 1, y]; }
        used += w;
        x += w + 2;
      }
    });
    if (caret && lt < ran && Math.floor(lt * 4) % 2 === 0) s.rect(caret[0], caret[1] - 1, caret[0], caret[1] + 3, WHITE);
    // The prompt: a spinner while it runs, a green light once it's done.
    if (lt >= ran && lt < shown) { const a = lt * 9; for (let k = 0; k < 3; k++) s.disc(10.5 + Math.cos(a + k * 2.09) * 2, 30 + Math.sin(a + k * 2.09) * 2, 0.9, 0.9, GOLD); }
    else if (lt >= shown) s.disc(10.5, 30, 2, 2, GREEN, fade);
    // The cell's edge goes green when it has run.
    if (lt >= shown) s.rect(18, 16, 18, 44, GREEN, fade);
    // The table first.
    const tableUp = clamp((lt - shown) / TABLE);
    for (let r = 0; r < 6; r++) {
      const a = clamp(tableUp * 6 - r) * fade, y = OY + 3 + r * 8;
      if (a <= 0) continue;
      s.rect(19, y - 2, 69, y + 4, r % 2 ? SHADE : PLATE, a);
      for (let c = 0; c < 3; c++) s.rect(22 + c * 16, y, 22 + c * 16 + (r === 0 ? 11 : 6 + ((r * 5 + c * 3) % 6)), y + 1, r === 0 ? MINT : EDGE, a);
    }
    // Then the histogram, with a curve drawn over it left to right.
    const grow = lt - shown - TABLE;
    if (grow > 0) {
      s.rect(CHART_X, BASE + 1, CHART_R, BASE + 1, EDGE, fade);
      s.rect(CHART_X, OY + 1, CHART_X, BASE, MID, fade);
      BINS.forEach((v, i) => {
        const h = v * (BASE - OY - 5) * ease((grow - i * 0.08) / 0.8), x = CHART_X + 2 + i * BIN;
        if (h > 0.5) s.rect(x, BASE - h, x + BIN - 3, BASE, BLUE, fade);
      });
      const drawn = clamp((grow - 0.6) / (CHART - 0.6));
      for (let u = 0; u < drawn; u += 0.004) {
        const f = u * (BINS.length - 1), k = Math.floor(f), v = BINS[k] + (BINS[Math.min(k + 1, BINS.length - 1)] - BINS[k]) * (f - k);
        s.disc(CHART_X + 2 + (BIN - 3) / 2 + f * BIN, BASE - v * (BASE - OY - 5) - 2, 0.9, 0.9, GOLD, fade);
      }
    }
    return s.finish();
  };
}
