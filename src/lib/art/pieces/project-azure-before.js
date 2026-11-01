/* project-azure-before: recreated from the network-topology Explainer. Two firewalls, four zones: every spoke has its own floating IP, and only FW-1 carries traffic. */
import { Grid } from "../vendor/ascii-magic/lib/kit.js";
import { PALETTE, INK, SOFT, DIM, RED, GOLD, GREEN, BLUE, PINK, WATER, route, wire, travel, node, zone, line } from "./diagram.js";

export const meta = {
  slug: "project-azure-before",
  name: "Azure hub, before",
  category: "explainers",
  note: "An active-passive pair across four zones, with a different next hop for each kind of spoke.",
  tags: ["firewall", "azure", "topology", "diagram"],
  cols: 46, rows: 38, fps: 24,
  palette: PALETTE,
};

const FW1 = 10;
const SPOKES = [[1, 8, "DMZ VNETs", "DMZ zone", GOLD], [16, 23, "enterprise", "inside zone", GREEN], [31, 38, "vendor", "vendor zone", PINK]];

export default function create() {
  const g = new Grid(meta.cols, meta.rows), LOOP = 9;
  const up = SPOKES.map(([, cx]) => route([cx, 31], [cx, 26]));
  const bus = SPOKES.map(([, cx]) => route([cx, 21], [cx, 20], [FW1, 20], [FW1, 12]));
  const onprem = route([27, 15], [FW1, 15], [FW1, 12]);
  const net = route([FW1, 4], [FW1, 6]), gate = route([30, 4], [30, 6]);
  const sync = route([17, 9], [27, 9]);
  return (t) => {
    g.clear();
    g.box(0, 5, 46, 24, "round", WATER);
    g.text(12, 5, " NETHUB VNET ", BLUE);
    zone(g, 1, 6, 44, 7, RED);
    g.text(12, 6, " outside zone ", RED);
    for (const c of [...up, ...bus, onprem, net, gate]) wire(g, c, DIM);
    g.set(FW1, 20, "┴", DIM); g.set(23, 20, "┬", DIM); g.set(FW1, 15, "├", DIM);
    SPOKES.forEach(([, , , , co], i) => {
      for (const k of [0, 1, 2]) {
        const age = ((t + i * 0.7 - k * 3) % LOOP + LOOP) % LOOP;
        travel(g, up[i], age / 0.9, co);
        travel(g, bus[i], (age - 0.9) / 1.4, co);
      }
    });
    const age = t % 4.5;
    travel(g, onprem, (age - 1) / 1.2, SOFT);
    travel(g, net, (age - 2) / 0.6, SOFT);
    travel(g, gate, (age - 3) / 0.6, SOFT);
    wire(g, sync, GOLD, false);
    g.set(17, 9, "◀", GOLD); g.set(27, 9, "▶", GOLD); g.text(20, 9, " HA ", GOLD);
    travel(g, sync, (t % 3) / 1.5, GOLD, "•");
    node(g, 3, 0, 14, 4, "internet", "", WATER);
    node(g, 22, 0, 17, 4, "app gateway", "WAF", SOFT);
    node(g, 3, 8, 14, 4, "FW-1", "active", RED, 1);
    g.box(28, 8, 14, 4, "round", DIM);
    g.text(33, 9, "FW-2", SOFT); g.text(32, 10, "passive", DIM);
    node(g, 28, 14, 17, 4, "gateway subnet", "ExpressRoute ×2", SOFT);
    g.text(11, 14, "on-prem float IP", RED);
    for (const [x, cx, name, zoneName, co] of SPOKES) {
      zone(g, x, 22, 14, 4, co);
      g.text(cx - (zoneName.length >> 1), 23, zoneName, co);
      g.text(cx - 4, 24, "float IP", RED);
      node(g, x, 32, 14, 3, name, "", co);
    }
    line(g, 36, [["3 different next hops", RED]]);
    return g.frame();
  };
}
