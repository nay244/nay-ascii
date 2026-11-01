/* project-azure-after: recreated from the network-topology Explainer. Three active firewalls, two zones: every spoke uses one next hop, the load balancer. */
import { Grid, rng } from "../vendor/ascii-magic/lib/kit.js";
import { PALETTE, INK, SOFT, DIM, RED, GREEN, BLUE, WATER, route, wire, travel, node, zone, line } from "./diagram.js";

export const meta = {
  slug: "project-azure-after",
  name: "Azure hub, after",
  category: "explainers",
  note: "Three active firewalls across two zones, with one next hop for every spoke: the internal load balancer.",
  tags: ["firewall", "load-balancer", "azure", "topology", "diagram"],
  cols: 46, rows: 38, fps: 24,
  palette: PALETTE,
};

const FWS = [[3, 9], [17, 23], [31, 37]];
const SPOKES = [[1, 8, "DMZ VNETs"], [16, 23, "enterprise"], [31, 38, "vendor"]];
const r = rng(7), N = 36, GAP = 0.42, LOOP = N * GAP;
const FLOWS = Array.from({ length: N }, (_, k) => [k * GAP, Math.floor(r() * 3), Math.floor(r() * 3)]);
const IN = 1.1, LEG = 0.35, ACROSS = 0.5, EGRESS = 0.9;

export default function create() {
  const g = new Grid(meta.cols, meta.rows);
  const into = SPOKES.map(([, cx]) => route([cx, 31], [cx, 30], [23, 30], [23, 27]));
  const legs = FWS.map(([, cx]) => route([cx, 24], [cx, 23]));
  const egress = FWS.map(([, cx]) => route([cx, 7], [37, 7], [37, 4]));
  const net = route([9, 4], [9, 6]), gate = route([23, 4], [23, 6]);
  return (t) => {
    g.clear();
    const lt = t % LOOP, leg = [0, 0, 0], fw = [0, 0, 0];
    g.box(0, 5, 46, 24, "round", WATER);
    g.text(10, 5, " NETHUB VNET ", BLUE);
    zone(g, 1, 6, 44, 7, RED);
    g.text(10, 6, " outside zone", RED);
    zone(g, 1, 19, 44, 9, GREEN);
    g.text(3, 19, " inside zone ", GREEN);
    for (const c of [...into, ...egress, net, gate]) wire(g, c, DIM);
    g.set(9, 7, "╭", DIM); g.set(23, 7, "┼", DIM); g.set(37, 7, "┤", DIM);
    g.set(23, 30, "┴", DIM);
    for (const [at, s, f] of FLOWS) for (const off of [0, LOOP]) {
      const age = lt + off - at;
      if (age < 0) continue;
      travel(g, into[s], age / IN, GREEN);
      if (age >= IN && age < IN + LEG) g.set(FWS[f][1], 23, "●", GREEN);
      if (age >= IN + LEG && age < IN + LEG + ACROSS) { leg[f] = 1; fw[f] = 1; }
      travel(g, egress[f], (age - IN - LEG - ACROSS) / EGRESS, GREEN);
    }
    for (const [, cx] of FWS) if (g.get(cx, 23) === " ") g.set(cx, 23, "▲", DIM);
    node(g, 1, 0, 13, 4, "internet", "", WATER);
    node(g, 15, 0, 16, 4, "app gateway", "WAF", SOFT);
    node(g, 31, 0, 13, 4, "NAT GW", "new", GREEN);
    FWS.forEach(([x], i) => {
      node(g, x, 8, 12, 4, `FW-${i + 1}`, "active", RED, fw[i]);
      node(g, x, 20, 12, 3, `FW-${i + 1}`, "", RED, leg[i]);
    });
    node(g, 3, 14, 40, 4, "gateway subnet · ExpressRoute ×2", "unchanged", SOFT);
    node(g, 3, 24, 40, 3, "azure ILB · HA ports", "", BLUE, 1);
    for (const [x, , name] of SPOKES) node(g, x, 32, 14, 3, name, "", GREEN);
    line(g, 36, [["1 next hop for every spoke: the ILB", GREEN]]);
    return g.frame();
  };
}
