/* project-servicenow: recreated from the data-flow Explainer's layout, with sources on the left, a numbered box in the middle and a warehouse cylinder on the right. Each table runs in turn, and the numbers match the nine stages on the project page. */
import { Grid } from "../vendor/ascii-magic/lib/kit.js";
import { PALETTE, INK, SOFT, DIM, RED, GOLD, GREEN, BLUE, PINK, SILVER, route, wire, travel } from "./diagram.js";

export const meta = {
  slug: "project-servicenow",
  name: "ServiceNow ETL flow",
  category: "explainers",
  note: "Each ServiceNow table runs in turn through the pipeline box into a Redshift Silver cylinder, then Power Automate refreshes Power BI.",
  tags: ["etl", "data-pipeline", "warehouse", "diagram", "data"],
  cols: 62, wide: 96, rows: 19, fps: 24,
  palette: PALETTE,
};

const TABLES = [["Incidents", RED], ["Change Requests", BLUE], ["Problems", PINK], ["CMDB", GREEN]];
const STAGES = [[2, "AppFlow"], [3, "Bronze"], [4, "EventBridge"], [5, "SQS"], [6, "Jenkins + DBT"], [8, "Power Automate"]];
const FACTS = [["Stages", "9"], ["Tables", "4"], ["Manual Steps", "0"]];
const YS = [2, 6, 10, 14], MID = 9, LIST = 7;
// Seconds into a table's run: when each stage in the list starts, when Jenkins starts writing, and when Power BI refreshes.
const AT = [0, 1.7, 2.2, 2.6, 3, 4.3], WRITE = 3.2, REFRESH = 4.8, RUN = 5.6, LOOP = RUN * TABLES.length;
const BURST = 12, GAP = 0.09, IN = 0.7, OUT = 0.6, HOP = 0.5;
// Partway through the second table, so the first frame, which is the one held for reduced motion, already shows a run.
const START = RUN + 3.6;

const cylinder = (w) => {
  const top = "_".repeat(w - 4);
  return [`  ${top}  `, ` /${" ".repeat(w - 4)}\\ `, `|\\${top}/|`, ...Array(4).fill(`|${" ".repeat(w - 2)}|`), ` \\${top}/ `];
};
const passed = (p, from) => { let n = 0; for (let k = 0; k < BURST; k++) if (p >= from + k * GAP) n++; return n; };

export default function create(cols = meta.cols) {
  const wide = cols > meta.cols, g = new Grid(cols, meta.rows);
  const [SX, SW, LX, LW, RX, RW] = wide ? [1, 21, 32, 26, 74, 21] : [1, 19, 23, 20, 45, 16];
  const bus = (SX + SW + LX - 1) >> 1, wx = (LX + LW + RX - 1) >> 1, gx = RX + 2;
  const into = YS.map((y) => route([SX + SW, y + 1], [bus, y + 1], [bus, MID], [LX - 1, MID]));
  const toSilver = route([LX + LW, LIST + 4], [wx, LIST + 4], [wx, 5], [RX - 1, 5]);
  const toBI = route([LX + LW, LIST + 5], [wx, LIST + 5], [wx, 14], [RX - 1, 14]);
  const gateway = route([gx, 9], [gx, 11]);
  const tank = cylinder(RW), held = LW - 4, level = RW - 4;
  return (t) => {
    g.clear();
    const T = t + START, lt = T % LOOP, run = Math.floor(lt / RUN), p = lt - run * RUN, co = TABLES[run][1];
    for (const c of [...into, toSilver, toBI, gateway]) wire(g, c, DIM);
    g.set(bus, YS[0] + 1, "╮", DIM); g.set(bus, YS[1] + 1, "┤", DIM); g.set(bus, MID, "├", DIM); g.set(bus, YS[2] + 1, "┤", DIM); g.set(bus, YS[3] + 1, "╯", DIM);
    g.set(wx, LIST + 4, "╯", DIM); g.set(wx, LIST + 5, "╮", DIM);
    for (let k = 0; k < BURST; k++) {
      travel(g, into[run], (p - k * GAP) / IN, co);
      travel(g, toSilver, (p - WRITE - k * GAP) / OUT, SILVER);
    }
    travel(g, toBI, (p - AT[5]) / HOP, GOLD);
    for (let k = 0; k < 3; k++) travel(g, gateway, (p - REFRESH - k * 0.2) / 0.4, SILVER);
    // The tables.
    g.text(SX, 0, "ServiceNow ETL", INK);
    g.text(SX + 16, 0, "REST API", SOFT);
    TABLES.forEach(([name, c], i) => {
      const y = YS[i], on = i === run && p < BURST * GAP + IN;
      g.box(SX, y, SW, 3, on ? "heavy" : "round", c);
      g.text(SX + 1, y, ` ${name} `, INK);
      g.text(SX + 2, y + 1, on ? "● Extracting" : "○ Idle", on ? c : SOFT);
    });
    // The pipeline: a pointer on the current stage, and a bar for what's inside it.
    const stage = p >= REFRESH ? -1 : AT.reduce((last, at, i) => (p >= at ? i : last), 0);
    g.box(LX, 4, LW, 12, "heavy", GOLD);
    g.text(LX + 2, 5, "Pipeline", INK);
    g.hline(LX + 1, LX + LW - 2, 6, "─", DIM);
    STAGES.forEach(([n, name], i) => {
      if (i === stage) g.set(LX + 1, LIST + i, "▶", GOLD);
      g.text(LX + 2, LIST + i, `${n} ${name}`, i === stage ? GOLD : SOFT);
    });
    const lit = Math.round(((passed(p, IN) - passed(p, WRITE)) / BURST) * held);
    for (let k = 0; k < held; k++) g.set(LX + 2 + k, 13, k < lit ? "●" : "·", k < lit ? co : DIM);
    g.text(LX + 2, 14, TABLES[run][0], co);
    // Silver: the level climbs a table at a time and starts over with the next round.
    const writing = p >= WRITE && p < WRITE + BURST * GAP + OUT;
    tank.forEach((row, i) => g.text(RX, 1 + i, row, writing ? INK : SILVER));
    g.text(RX + 2, 4, "7 Redshift", INK);
    g.text(RX + 2, 5, "Silver", SOFT);
    const filled = Math.round(((run + passed(p, WRITE + OUT) / BURST) / TABLES.length) * level);
    for (let k = 0; k < level; k++) {
      const owner = TABLES[Math.floor((k / level) * TABLES.length)][1];
      g.set(RX + 2 + k, 6, k < filled ? "●" : "·", k < filled ? owner : DIM);
    }
    g.text(gx + 2, 10, "Data Gateway", SOFT);
    // Power BI.
    const refreshing = p >= REFRESH;
    g.box(RX, 12, RW, 5, refreshing ? "heavy" : "round", GREEN);
    g.text(RX + 1, 12, " 9 Power BI ", INK);
    g.text(RX + 2, 13, "Dashboards", SOFT);
    const done = refreshing ? Math.round(((p - REFRESH) / (RUN - REFRESH)) * level) : 0;
    for (let k = 0; k < level; k++) g.set(RX + 2 + k, 14, k < done ? "●" : "·", k < done ? GREEN : DIM);
    g.text(RX + 2, 15, `Refreshed ${Math.floor(T / RUN)}`, SOFT);
    // The facts, under a rule.
    g.hline(0, cols - 1, 17, "─", DIM);
    let x = SX;
    for (const [name, value] of FACTS) {
      g.text(x, 18, name, SOFT);
      g.text(x + name.length + 1, 18, value, INK);
      x += name.length + value.length + 4;
    }
    g.text(cols - 18 - SX + 1, 18, "Daily Incremental", SOFT);
    return g.frame();
  };
}
