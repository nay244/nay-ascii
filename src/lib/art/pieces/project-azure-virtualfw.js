/* project-azure-virtualfw: the same three firewalls as software rather than steel. A cloud in outline holds three boxes drawn in light, their dashed edges crawling, the way a diagram marks something virtual. One line forks to them, and each packet goes through one or is turned back. */
import { rng } from "../vendor/ascii-magic/lib/kit.js";
import { H, AZURE, canvas, hex, rrect, sceneMeta } from "./scene.js";

export const meta = sceneMeta({
  slug: "project-azure-virtualfw", name: "Azure virtual firewalls",
  note: "A cloud in outline holds three firewalls drawn in light, their dashed edges crawling to mark them as virtual. One line forks to them, and each packet goes through one or is turned back.",
  tags: ["firewall", "cloud", "virtual", "outline", "security", "azure"],
  pal: AZURE, wide: 324, tone: { curve: 0.46, hi: 0.975 }, // past the envelopes and lamps, whose count would otherwise pump the card's brightness
});

const ROWS = [31, 56, 81], MID = ROWS[1], CH = 20, FLOOR = 104;
const r = rng(12), N = 18, GAP = 1, LOOP = N * GAP, BRANCH = 0.9, CHECK = 0.45, BACK = 0.9, START = 5.9;
// Dealt in shuffled threes, so the boxes share the packets evenly without showing a pattern.
const threes = () => Array.from({ length: N / 3 }, () => {
  const a = [0, 1, 2];
  for (let i = 2; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}).flat();
const GATES = threes(), KINDS = threes();
const FLOWS = Array.from({ length: N }, (_, k) => ({ at: k * GAP, gate: GATES[k], kind: KINDS[k], deny: k % 6 === 4 }));
const TINTS = [hex("#f0c050"), hex("#6fcf8e"), hex("#d97fb0")], GO = hex("#6fcf8e"), STOP = hex("#ee6a55"), AMBER = hex("#f5a53c"), PAPER = hex("#e8f2fa");
const SKY = hex("#070d1c"), FILL = hex("#16294f"), BOX = hex("#0e1a35"), EDGE = hex("#8fcaf5"), DIM = hex("#3a7fcf"), LAMP_OFF = hex("#1e3b6e");
const PUFFS = [[-70, 76, 19], [-58, 52, 22], [-34, 32, 23], [34, 32, 23], [58, 52, 22], [70, 76, 19], [0, 27, 25]];
const line = (x0, y0, x1, y1) => (u) => {
  const dx = (x1 - x0) * 0.6, a = (1 - u) ** 3, b = 3 * u * (1 - u) ** 2, c = 3 * u * u * (1 - u), d = u ** 3;
  return [a * x0 + b * (x0 + dx) + c * (x1 - dx) + d * x1, (a + b) * y0 + (c + d) * y1];
};

export default function create(cols = meta.cols) {
  const s = canvas(cols, AZURE), CX = cols / 2, stretch = cols / meta.cols, HW = Math.round(cols * 0.24), L = CX - HW, R = CX + HW, FX = L - Math.round(26 * stretch ** 0.5), IN = L + 4, OUT = R - 4, q = rng(7), lights = [], ants = [];
  const SPEED = 44, TRUNK = (FX + 8) / SPEED;
  const inPaths = ROWS.map((y) => line(FX, MID, IN, y)), outPaths = ROWS.map((y) => line(OUT, y, cols - FX, MID));
  // The cloud, as one outline: a cell is on the rim if it's in the cloud and a neighbour isn't.
  const lumps = PUFFS.map(([x, y, rad]) => [CX + x * stretch, y, rad * stretch ** 0.3]);
  const inCloud = (x, y) => y <= FLOOR && (rrect(x - CX, y - 72, 150 * stretch, 66, 14) <= 0 || lumps.some(([cx, cy, rad]) => Math.hypot(x - cx, y - cy) <= rad));
  for (let y = 0; y < H; y++) for (let x = 0; x < cols; x++) {
    if (!inCloud(x, y)) { s.add(x, y, SKY); continue; }
    const rim = !inCloud(x - 1, y) || !inCloud(x + 1, y) || !inCloud(x, y - 1) || !inCloud(x, y + 1);
    s.add(x, y, rim ? EDGE : FILL);
  }
  for (const y of ROWS) {
    s.box(CX, y, HW * 2, CH, 1, BOX);
    // Walk the edge once, so the dashes can crawl round it.
    for (let x = L; x <= R; x++) ants.push([x, y - CH / 2]);
    for (let v = y - CH / 2 + 1; v < y + CH / 2; v++) ants.push([R, v]);
    for (let x = R; x >= L; x--) ants.push([x, y + CH / 2]);
    for (let v = y + CH / 2 - 1; v > y - CH / 2; v--) ants.push([L, v]);
    s.word("FIREWALL", CX, y - 3, PAPER);
    // Its interfaces, as small outlined squares in a row each side of the name.
    for (const side of [-1, 1]) for (let x = 24; x < HW - 8; x += 8) for (const dy of [-4, 4]) {
      const px = CX + side * x, py = y + dy;
      s.rect(px - 2, py - 2, px + 2, py - 2, DIM);
      s.rect(px - 2, py + 2, px + 2, py + 2, DIM);
      s.rect(px - 2, py - 2, px - 2, py + 2, DIM);
      s.rect(px + 2, py - 2, px + 2, py + 2, DIM);
      lights.push({ x: px, y: py, rate: 3 + q() * 7, phase: q() * 6.28, bias: q() * 0.5 - 0.3, c: q() < 0.2 ? AMBER : GO });
    }
  }
  for (const p of [...inPaths, ...outPaths]) for (let i = 0; i <= 140; i++) { const [x, y] = p(i / 140); s.disc(x, y, 0.9, 0.9, EDGE); }
  s.bar(-2, MID, FX, MID, 1.4, EDGE);
  s.bar(cols - FX, MID, cols + 2, MID, 1.4, EDGE);
  for (const x of [FX, cols - FX]) { s.disc(x, MID, 3.2, 3.2, PAPER); s.disc(x, MID, 1.4, 1.4, BOX); }
  s.freeze();
  const packet = (x, y, k, tint, a, body = PAPER) => {
    s.box(x, y, 11 * k, 8 * k, k, body, a);
    s.bar(x - 5 * k, y - 3.5 * k, x, y + 0.5 * k, Math.max(0.8, k), tint, a);
    s.bar(x + 5 * k, y - 3.5 * k, x, y + 0.5 * k, Math.max(0.8, k), tint, a);
  };
  return (t) => {
    s.begin();
    const lt = (t + START) % LOOP, lamps = [null, null, null], K = 0.85;
    ants.forEach(([x, y], i) => { if ((i + t * 9) % 6 < 3.6) s.add(x, y, EDGE); });
    for (const p of lights) if (Math.sin(t * p.rate + p.phase) > p.bias) s.rect(p.x - 1, p.y - 1, p.x + 1, p.y + 1, p.c);
    for (const f of FLOWS) {
      const age = (lt - f.at + LOOP) % LOOP, i = f.gate, tint = TINTS[f.kind], at = TRUNK + BRANCH, done = at + CHECK;
      if (age < TRUNK) packet(-8 + (FX + 8) * (age / TRUNK), MID, K, tint, 1);
      else if (age < at) { const [x, y] = inPaths[i]((age - TRUNK) / BRANCH); packet(x, y, K, tint, 1); }
      else if (age < done) lamps[i] = f.deny ? STOP : GO;
      else if (f.deny) {
        if (age < done + BACK) { const u = (age - done) / BACK; packet(IN - 4 - u * 18, ROWS[i] + u * u * 18, K * (1 - u * 0.75), PAPER, 1, STOP); lamps[i] = STOP; }
      } else if (age < done + BRANCH) { const [x, y] = outPaths[i]((age - done) / BRANCH); packet(x, y, K, tint, 1); }
      else if (age < done + BRANCH + TRUNK) packet(cols - FX + (FX + 8) * ((age - done - BRANCH) / TRUNK), MID, K, tint, 1);
    }
    ROWS.forEach((y, i) => {
      const c = lamps[i];
      if (c) s.glow(CX, y + 4, 7, c, 0.45);
      s.disc(CX, y + 4, 2.6, 2.6, c || LAMP_OFF);
    });
    return s.finish();
  };
}
