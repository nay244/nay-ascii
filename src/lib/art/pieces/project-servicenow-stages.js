/* project-servicenow-stages: the diagram beside the step list, recreated from the data-flow Explainer. One run through all nine stages, one source table at a time. */
import { Grid } from "../vendor/ascii-magic/lib/kit.js";
import { PALETTE, INK, SOFT, DIM, GOLD, GREEN, BLUE, BRONZE, SILVER, columns, route, wire, travel, node, line } from "./diagram.js";

export const meta = {
  slug: "project-servicenow-stages",
  name: "ServiceNow stages",
  category: "explainers",
  note: "Each run moves one ServiceNow table through nine stages, from the REST API to Power BI, with no manual step.",
  tags: ["etl", "data-pipeline", "medallion", "diagram", "data"],
  cols: 60, wide: 96, rows: 21, fps: 24,
  palette: PALETTE,
};

// stage: [title, sub, column, row, colour]
const STAGES = {
  1: ["ServiceNow", "REST API", 0, 0, BLUE],
  2: ["AppFlow", "per table", 1, 0, SOFT],
  3: ["Redshift", "bronze", 2, 0, BRONZE],
  4: ["EventBridge", "on success", 2, 1, GOLD],
  5: ["SQS", "buffer", 1, 1, GOLD],
  6: ["Jenkins", "runs DBT", 0, 1, BLUE],
  7: ["Redshift", "silver", 0, 2, SILVER],
  8: ["Power Automate", "refresh", 1, 2, GOLD],
  9: ["Power BI", "dashboards", 2, 2, GREEN],
};
const TABLES = ["Incidents", "Change Requests", "Problems", "CMDB"];
const LOOP = 10, H = 4, TRAIN = [0, 0.1, 0.2];

let focus = null;
export const setFocus = (stage) => { focus = stage; };

export default function create(cols = meta.cols) {
  const g = new Grid(cols, meta.rows), { w, xs } = columns(cols), ys = [1, 7, 13];
  const left = (c) => xs[c], right = (c) => xs[c] + w, mid = (c) => xs[c] + (w >> 1), y = (row) => ys[row] + 1;
  const toSilver = xs[0] + 3, toRefresh = xs[0] + w - 4;
  // [from, to, start, seconds, cells]
  const LEGS = [
    [1, 2, 0.0, 0.7, route([right(0), y(0)], [left(1) - 1, y(0)])],
    [2, 3, 1.1, 0.7, route([right(1), y(0)], [left(2) - 1, y(0)])],
    [3, 4, 2.2, 0.5, route([mid(2), ys[0] + H], [mid(2), ys[1] - 1])],
    [4, 5, 3.1, 0.7, route([left(2) - 1, y(1)], [right(1), y(1)])],
    [5, 6, 4.2, 0.7, route([left(1) - 1, y(1)], [right(0), y(1)])],
    [6, 7, 5.3, 0.5, route([toSilver, ys[1] + H], [toSilver, ys[2] - 1])],
    [6, 8, 5.3, 0.9, route([toRefresh, ys[1] + H - 1], [toRefresh, ys[1] + H], [mid(1), ys[1] + H], [mid(1), ys[2] - 1])],
    [8, 9, 6.6, 0.7, route([right(1), y(2)], [left(2) - 1, y(2)])],
    [7, 9, 6.2, 1.1, route([mid(0), ys[2] + H], [mid(0), 18], [mid(2), 18], [mid(2), ys[2] + H])],
  ];
  return (t) => {
    g.clear();
    const lt = t % LOOP, lit = new Set(lt < 0.5 ? [1] : []);
    for (const [, , , , cells] of LEGS) wire(g, cells, DIM);
    for (const [from, to, start, secs, cells] of LEGS) {
      TRAIN.forEach((gap, k) => travel(g, cells, (lt - start - gap) / secs, STAGES[from][4], k ? "•" : "●"));
      if (lt >= start + secs && lt < start + secs + 0.5) lit.add(to);
    }
    for (const [stage, [title, sub, c, row, co]] of Object.entries(STAGES)) {
      // Too long for a panel's narrow box, so the name takes both lines.
      const [a, b] = cols < 60 && stage === "8" ? ["Power", "Automate"] : [title, sub];
      node(g, left(c), ys[row], w, H, a, b, co, focus === stage ? 2 : lit.has(+stage) ? 1 : 0);
      g.text(left(c) + 1, ys[row], ` ${stage} `, SOFT);
    }
    g.set(toRefresh, ys[1] + H - 1, "┬", STAGES[6][4]);
    g.text(toSilver + 2, ys[2] - 1, "writes", DIM);
    g.text(toRefresh + 2, ys[2] - 1, "webhook", DIM);
    line(g, 18, [[" reads via data gateway ", DIM]]);
    const now = Math.floor(t / LOOP) % TABLES.length;
    line(g, 20, TABLES.flatMap((name, i) => [[name, i === now ? INK : DIM], [i < TABLES.length - 1 ? " · " : "", DIM]]));
    return g.frame();
  };
}
