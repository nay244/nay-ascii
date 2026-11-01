/* project-azure: recreated from the pubsub-fanout Explainer. Where its topic copies each event to every subscriber, the load balancer hands each flow to one firewall, because that's what HA ports does. */
import { Grid, rng } from "../vendor/ascii-magic/lib/kit.js";
import { PALETTE, INK, SOFT, DIM, RED, GOLD, GREEN, BLUE, PINK, route, wire, travel } from "./diagram.js";

export const meta = {
  slug: "project-azure",
  name: "Azure firewall fan-out",
  category: "explainers",
  note: "Spokes send every flow to one internal load balancer, which logs it and hands it to one of three active firewalls.",
  tags: ["load-balancer", "firewall", "azure", "fan-out", "diagram"],
  cols: 62, wide: 96, rows: 19, fps: 24,
  palette: PALETTE,
};

const SPOKES = [["DMZ", GOLD], ["Enterprise", GREEN], ["Vendor", PINK]];
const ROWS = [4, 10, 16], MID = 10;
const FACTS = [["Next Hops", "3→1"], ["Firewalls", "2→3"], ["Zones", "4→2"]];
const r = rng(12), N = 39, GAP = 0.8, LOOP = N * GAP;
const LEAD = 0.6, IN = 0.4, OUT = 0.6, EGRESS = 0.7;
// Dealt in shuffled threes, so the spokes and the firewalls share the flows evenly without showing a pattern.
const threes = () => Array.from({ length: N / 3 }, () => {
  const a = [0, 1, 2];
  for (let i = 2; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}).flat();
const SPOKE_OF = threes(), FW_OF = threes();
const FLOWS = Array.from({ length: N }, (_, k) => ({ at: k * GAP, spoke: SPOKE_OF[k], fw: FW_OF[k], hold: 1 + r() * 1.8, net: r() < 0.5 }));

export default function create(cols = meta.cols) {
  const wide = cols > meta.cols, g = new Grid(cols, meta.rows);
  // The wide version has room for the NAT gateway the firewalls leave through.
  const [SX, SW, LX, LW, FX, FW, NX, NW] = wide ? [1, 16, 20, 25, 49, 24, 77, 18] : [1, 15, 18, 21, 41, 20];
  const busIn = (SX + SW + LX - 1) >> 1, busOut = (LX + LW + FX - 1) >> 1, busNat = (FX + FW + NX - 1) >> 1;
  const into = ROWS.map((y) => route([SX + SW, y], [busIn, y], [busIn, MID], [LX - 1, MID]));
  const out = ROWS.map((y) => route([LX + LW, MID], [busOut, MID], [busOut, y], [FX - 1, y]));
  const nat = wide ? ROWS.map((y) => route([FX + FW, y], [busNat, y], [busNat, MID], [NX - 1, MID])) : [];
  const text = FW - 4, BAR = text - 11, SLOTS = (text - 8) >> 1, SEND = SW - 10;
  return (t) => {
    g.clear();
    // A full loop in, so the first frame, which is the one held for reduced motion, already has a log and counts.
    const T = t + LOOP, lt = T % LOOP, open = [[], [], []], passed = [0, 0, 0], sent = [0, 0, 0], fill = [0, 0, 0];
    let leaving = 0, arriving = false;
    for (const c of [...into, ...out, ...nat]) wire(g, c, DIM);
    g.set(busIn, ROWS[0], "╮", DIM); g.set(busIn, MID, "┼", DIM); g.set(busIn, ROWS[2], "╯", DIM);
    g.set(busOut, MID, "┼", DIM);
    if (wide) g.set(busNat, MID, "┼", DIM);
    for (const f of FLOWS) {
      const age = (lt - f.at + LOOP) % LOOP, co = SPOKES[f.spoke][1], inspect = age - IN - OUT, done = f.at + IN + OUT + f.hold, lead = LOOP - age;
      travel(g, into[f.spoke], age / IN, co);
      travel(g, out[f.fw], (age - IN) / OUT, co);
      if (lead < LEAD) fill[f.spoke] = Math.max(fill[f.spoke], 1 - lead / LEAD);
      if (age < IN) fill[f.spoke] = 1;
      sent[f.spoke] += Math.max(0, Math.floor((T - f.at) / LOOP) + 1);
      if (inspect >= 0 && inspect < f.hold) open[f.fw].push([f, inspect / f.hold]);
      passed[f.fw] += Math.max(0, Math.floor((T - done) / LOOP) + 1);
      if (wide && f.net) {
        travel(g, nat[f.fw], (inspect - f.hold) / EGRESS, co);
        if (inspect >= f.hold + EGRESS && inspect < f.hold + EGRESS + 0.4) arriving = true;
        leaving += Math.max(0, Math.floor((T - done - EGRESS) / LOOP) + 1);
      }
    }
    // The spokes.
    SPOKES.forEach(([name, co], i) => {
      const y = ROWS[i], x = SX + 2, lit = Math.round(fill[i] * SEND);
      g.box(SX, y - 2, SW, 5, fill[i] ? "heavy" : "round", co);
      g.text(x, y - 2, ` ${name} `, INK);
      g.text(x, y - 1, "Spoke VNETs", SOFT);
      g.text(x, y, "→ ILB", SOFT);
      for (let k = 0; k < SEND; k++) g.set(x + 6 + k, y, k < lit ? "●" : "·", k < lit ? co : DIM);
      g.text(x, y + 1, `Sent ${sent[i]}`, SOFT);
    });
    // The load balancer and its log of the latest five flows.
    g.box(LX, MID - 5, LW, 10, "heavy", BLUE);
    g.text(LX + 2, MID - 5, " Azure ILB ", BLUE);
    g.text(LX + 2, MID - 4, "1 Frontend IP", INK);
    g.text(LX + 2, MID - 3, "HA Ports, 5-Tuple", SOFT);
    g.hline(LX + 2, LX + LW - 3, MID - 2, "─", DIM);
    const seen = (lt - IN + LOOP) % LOOP, latest = Math.floor(seen / GAP);
    for (let i = 0; i < 5; i++) {
      const f = FLOWS[(latest - i + N) % N], [name, co] = SPOKES[f.spoke], fresh = i === 0 && seen - latest * GAP < 0.5, y = MID + 3 - i;
      g.text(LX + 2, y, name.padEnd(LW - 11), fresh ? co : SOFT);
      g.text(LX + LW - 8, y, `→ FW-${f.fw + 1}`, fresh ? INK : DIM);
    }
    FACTS.forEach(([name, value], i) => { g.text(LX + 2, MID + 5 + i, name, SOFT); g.text(LX + 12, MID + 5 + i, value, INK); });
    // The firewalls.
    ROWS.forEach((y, i) => {
      const list = open[i], x = FX + 2;
      g.box(FX, y - 2, FW, 5, list.length ? "heavy" : "round", RED);
      g.text(x, y - 2, ` FW-${i + 1} `, INK);
      g.text(FX + FW - 10, y - 2, " Active ", GREEN);
      g.text(x, y - 1, "Sessions", SOFT);
      for (let k = 0; k < SLOTS; k++) g.set(x + 9 + k * 2, y - 1, k < list.length ? "●" : "·", k < list.length ? RED : DIM);
      if (list.length) {
        const [f, p] = list[list.length - 1], [name, co] = SPOKES[f.spoke], lit = Math.round(p * BAR);
        g.text(x, y, name, INK);
        for (let k = 0; k < BAR; k++) g.set(x + 11 + k, y, k < lit ? "●" : "·", k < lit ? co : DIM);
      } else g.text(x, y, "Ready", SOFT);
      g.text(x, y + 1, `Passed ${passed[i]}`, SOFT);
    });
    if (wide) {
      g.box(NX, MID - 3, NW, 7, arriving ? "heavy" : "round", GREEN);
      g.text(NX + 2, MID - 2, "NAT GW", INK);
      g.text(NX + 2, MID - 1, "Outside Subnet", SOFT);
      g.text(NX + 2, MID + 1, "To Internet", SOFT);
      g.text(NX + 2, MID + 2, `Out ${leaving}`, SOFT);
    }
    g.text(SX, 0, "Azure Migration", INK);
    g.text(SX + 17, 0, "3-Node Active-Active-Active", SOFT);
    return g.frame();
  };
}
