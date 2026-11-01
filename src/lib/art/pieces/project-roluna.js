/* project-roluna: recreated from the cdn-cache Explainer. Listings swept into a cache twice a day, the deck served from it, and the on-demand fallback when a search misses. */
import { Grid } from "../vendor/ascii-magic/lib/kit.js";
import { PALETTE, SOFT, DIM, RED, GOLD, GREEN, BLUE, PINK, columns, route, wire, travel, node } from "./diagram.js";

export const meta = {
  slug: "project-roluna",
  name: "Roluna deck",
  category: "explainers",
  note: "A twice-daily sweep fills the cache, the deck reads from it, a rare search falls back to the API, and right swipes keep their own copy.",
  tags: ["cache", "mobile", "swipe", "diagram"],
  cols: 60, wide: 96, rows: 20, fps: 24,
  palette: PALETTE,
};

// key: [title, sub, column, row, colour]
const NODES = {
  adzuna: ["Adzuna API", "US listings", 0, 0, GOLD],
  ingest: ["ingest cron", "2× a day", 1, 0, BLUE],
  mongo: ["Mongo cache", "14-day TTL", 2, 0, GREEN],
  api: ["Express API", "cache first", 2, 1, BLUE],
  deck: ["swipe deck", "iOS client", 2, 2, RED],
  saved: ["saved role", "snapshot", 0, 2, PINK],
};
const LOOP = 16, EVERY = 2, H = 4, ys = [1, 8, 15];
const back = (cells) => [...cells].reverse();

let focus = null;
export const setFocus = (key) => { focus = key; };

export default function create(cols = meta.cols) {
  const g = new Grid(cols, meta.rows), { w, xs } = columns(cols);
  const left = (c) => xs[c], right = (c) => xs[c] + w, mid = (c) => xs[c] + (w >> 1), y = (row) => ys[row] + 1;
  const fetch = route([right(0), y(0)], [left(1) - 1, y(0)]), store = route([right(1), y(0)], [left(2) - 1, y(0)]);
  const read = route([mid(2), ys[0] + H], [mid(2), ys[1] - 1]), serve = route([mid(2), ys[1] + H], [mid(2), ys[2] - 1]);
  const fallback = route([left(2) - 1, y(1)], [mid(0), y(1)], [mid(0), ys[0] + H]);
  const save = route([left(2) - 1, y(2)], [right(0), y(2)]);
  const between = (a, b, s) => ((a + b - s.length) >> 1);
  return (t) => {
    g.clear();
    const lt = t % LOOP, on = new Set();
    for (const c of [fetch, store, read, serve, fallback, save]) wire(g, c, DIM);
    // The sweep into the cache.
    for (let k = 0; k < 5; k++) {
      travel(g, fetch, (lt - k * 0.25) / 1, GOLD);
      travel(g, store, (lt - 1.2 - k * 0.25) / 1, GOLD);
    }
    if (lt < 1.2) on.add("adzuna");
    if (lt > 0.8 && lt < 2.4) on.add("ingest");
    if (lt > 2 && lt < 3.6) on.add("mongo");
    // Requests from the deck: the cache answers nearly all of them, and one in a loop falls back to the API.
    let stamp = null;
    for (let k = 0; k < LOOP / EVERY; k++) {
      const age = (lt - k * EVERY - 0.5 + LOOP) % LOOP, miss = k === 7, keep = k % 2 === 0;
      const co = miss ? GOLD : BLUE, out = miss ? fallback : back(read), trip = miss ? 1 : 0.4, home = 0.4 + 2 * trip + 0.4;
      travel(g, back(serve), age / 0.4, co);
      travel(g, out, (age - 0.4) / trip, co);
      travel(g, back(out), (age - 0.4 - trip) / trip, co);
      travel(g, serve, (age - 0.4 - 2 * trip) / 0.4, co);
      if (age > 0.3 && age < 0.5) on.add("api");
      if (age > 0.4 + trip - 0.1 && age < 0.4 + trip + 0.1) on.add(miss ? "adzuna" : "mongo");
      if (age >= home && age < home + 0.7) { stamp = keep; on.add("deck"); }
      if (keep) {
        travel(g, save, (age - home - 0.3) / 1, PINK);
        if (age >= home + 1.2 && age < home + 1.6) on.add("saved");
      }
    }
    for (const [key, [title, sub, c, row, co]] of Object.entries(NODES)) {
      node(g, left(c), ys[row], w, H, title, sub, co, focus === key ? 2 : on.has(key) ? 1 : 0);
    }
    g.text(between(mid(0), left(2), " on-demand fallback "), y(1), " on-demand fallback ", GOLD);
    g.text(between(right(0), left(2), " swipe right "), y(2), " swipe right ", SOFT);
    if (stamp !== null) g.text(left(2) - 6, ys[2] - 1, stamp ? "SAVE" : "PASS", stamp ? GREEN : RED);
    return g.frame();
  };
}
