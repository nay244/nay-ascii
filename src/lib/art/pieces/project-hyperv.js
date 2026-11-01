/* project-hyperv: recreated from the gantt-chart Explainer, keeping only what the résumé says: three teams, three phases, no production downtime, deadline met. */
import { Grid, clamp } from "../vendor/ascii-magic/lib/kit.js";
import { PALETTE, INK, SOFT, DIM, RED, GOLD, GREEN, BLUE, PINK } from "./diagram.js";

export const meta = {
  slug: "project-hyperv",
  name: "VMware to Hyper-V",
  category: "explainers",
  note: "Three teams through plan, test and execute, with production staying up the whole way and the deadline met at the end.",
  tags: ["gantt", "migration", "timeline", "diagram"],
  cols: 60, wide: 96, rows: 20, fps: 20,
  palette: PALETTE,
};

const PHASES = ["plan", "test", "execute"];
const TEAMS = [["network", 4, BLUE], ["server", 6, GOLD], ["application", 8, PINK]];
const X0 = 13, SWEEP = 13, LOOP = 16;

let focus = null;
export const setFocus = (phase) => { focus = phase; };

export default function create(cols = meta.cols) {
  const g = new Grid(cols, meta.rows), pw = Math.floor((cols - X0) / 3), end = X0 + pw * 3 - 2;
  return (t) => {
    g.clear();
    // Starts on the finished chart, so a held first frame shows the whole result, then sweeps.
    const head = clamp(((t + SWEEP + 1) % LOOP) / SWEEP), hx = Math.round(X0 + head * (end - X0));
    g.hline(0, cols - 1, 2, "─", DIM); g.hline(0, cols - 1, 10, "─", DIM); g.hline(0, cols - 1, 14, "─", DIM);
    PHASES.forEach((name, i) => {
      const x = X0 + i * pw, on = hx >= x && hx < x + pw;
      g.text(x + ((pw - 1 - name.length) >> 1), 1, name, focus === name ? RED : on ? INK : SOFT);
      if (focus === name) g.hline(x, x + pw - 2, 2, "━", RED);
      for (const [, y, co] of TEAMS) for (let k = 0; k < pw - 1; k++) g.set(x + k, y, x + k <= hx ? "●" : "·", x + k <= hx ? co : DIM);
    });
    for (const [name, y] of TEAMS) g.text(1, y, name, SOFT);
    // The machines only move in the last phase.
    const moved = clamp((head - 2 / 3) * 3), span = end - X0 - 8;
    g.text(1, 12, "VMware", SOFT);
    for (let k = 0; k <= span; k++) g.set(X0 + k, 12, k < moved * span ? "●" : "·", k < moved * span ? GREEN : DIM);
    g.text(cols - 8, 12, "Hyper-V", moved >= 1 ? INK : SOFT);
    g.text(1, 16, "production", SOFT);
    g.hline(X0, end, 16, "━", GREEN);
    g.text(X0, 18, "zero downtime", GREEN);
    const done = head >= 1;
    g.text(cols - 14, 18, "◆ on deadline", done ? GOLD : DIM);
    for (let y = 3; y < 18; y++) if (y !== 10 && y !== 14 && !(y === 12 && hx >= cols - 8)) g.set(hx, y, "│", BLUE);
    return g.frame();
  };
}
