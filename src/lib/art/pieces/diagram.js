/* Shared drawing for the project pieces, which are recreated from ascii-magic-art's Explainers (MIT, see vendor/ascii-magic/LICENSE):
   boxes, wires and the dots that travel along them, in the site's own colours. */
import { palette } from "../vendor/ascii-magic/lib/kit.js";

export const PALETTE = palette(["#e6e9f2", "#a0a6b3", "#62656d", "#ff6a3d", "#f2b84b", "#7db57d", "#8fb7ff", "#ff8fb1", "#c98a52", "#cfd6e2", "#5a6c9c"]);
export const INK = "0", SOFT = "1", DIM = "2", RED = "3", GOLD = "4", GREEN = "5", BLUE = "6", PINK = "7", BRONZE = "8", SILVER = "9", WATER = "a";

const CORNER = { RD: "╮", RU: "╯", LD: "╭", LU: "╰", DR: "╰", DL: "╯", UR: "╭", UL: "╮" };
const ARROW = { R: "▶", L: "◀", U: "▲", D: "▼" };
const heading = (a, b) => (b[0] > a[0] ? "R" : b[0] < a[0] ? "L" : b[1] > a[1] ? "D" : "U");

// Three columns of boxes, for the widths a piece draws at: 46 in a panel, 60 on a card, 96 in a wide band.
export function columns(cols) {
  const w = cols < 60 ? 14 : cols < 96 ? 17 : 20, m = cols < 60 ? 0 : 1;
  return { w, xs: [m, (cols - w) >> 1, cols - w - m] };
}

// Every cell along straight legs between the given points.
export function route(...pts) {
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    let [x, y] = out[out.length - 1];
    const [tx, ty] = pts[i];
    while (x !== tx || y !== ty) { x += Math.sign(tx - x); y += Math.sign(ty - y); out.push([x, y]); }
  }
  return out;
}

export function wire(g, cells, co, arrow = true) {
  const last = cells.length - 1;
  cells.forEach(([x, y], n) => {
    const out = n < last ? heading(cells[n], cells[n + 1]) : heading(cells[n - 1], cells[n]);
    const into = n ? heading(cells[n - 1], cells[n]) : out;
    g.set(x, y, into === out ? (out === "R" || out === "L" ? "─" : "│") : CORNER[into + out], co);
  });
  if (arrow) g.set(cells[last][0], cells[last][1], ARROW[heading(cells[last - 1], cells[last])], co);
}

// One dot on a wire, p of the way along it; outside 0 to 1 it isn't on the wire.
export function travel(g, cells, p, co, ch = "●") {
  if (p < 0 || p >= 1) return;
  const [x, y] = cells[Math.floor(p * cells.length)];
  g.set(x, y, ch, co);
}

// state: 0 at rest, 1 something is passing through it, 2 its step is hovered on the page.
export function node(g, x, y, w, h, title, sub, co, state = 0) {
  g.box(x, y, w, h, state ? "heavy" : "round", state === 2 ? RED : co);
  const at = (s) => x + ((w - s.length) >> 1);
  g.text(at(title), y + 1, title, state === 2 ? RED : INK);
  if (sub) g.text(at(sub), y + 2, sub, SOFT);
}

// A network zone: a dashed outline, so it reads as a boundary and not a box.
export function zone(g, x, y, w, h, co) {
  g.hline(x, x + w - 1, y, "┄", co); g.hline(x, x + w - 1, y + h - 1, "┄", co);
  g.vline(x, y, y + h - 1, "┆", co); g.vline(x + w - 1, y, y + h - 1, "┆", co);
  g.set(x, y, "╭", co); g.set(x + w - 1, y, "╮", co); g.set(x, y + h - 1, "╰", co); g.set(x + w - 1, y + h - 1, "╯", co);
}

// A centred line made of [text, colour] parts.
export function line(g, y, parts) {
  let x = (g.cols - parts.reduce((n, [s]) => n + s.length, 0)) >> 1;
  for (const [s, co] of parts) { g.text(x, y, s, co); x += s.length; }
}
