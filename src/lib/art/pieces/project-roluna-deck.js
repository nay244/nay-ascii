/* project-roluna-deck: the swipe itself. A phone against the clay night, its top card dragged with the SAVE or PASS stamp fading in as it goes, and an undo bringing a passed card back. */
import { clamp, rng } from "../vendor/ascii-magic/lib/kit.js";
import { H, canvas, clay, ease, hex, mix, rrect, inWord, CREAM, WHITE, GREEN, RED, sceneMeta } from "./scene.js";

export const meta = sceneMeta({
  slug: "project-roluna-deck", name: "Roluna swipe deck",
  note: "A phone with a deck of job cards: right saves, left passes, the stamp fades in with the drag, and undo brings a card back.",
  tags: ["swipe", "phone", "cards", "clay"],
  tone: { curve: 0.48 },
  wide: 324,
});

const STEP = 3, REST = 0.7, DRAG = 1, FLING = 0.35, BACK = 0.6;
// [card, direction, is this an undo of that card's last swipe]
const SEQ = [[0, 1], [1, -1], [1, -1, true], [1, 1], [2, -1], [3, 1]];
const LOOP = SEQ.length * STEP;
// Partway through the first drag, so the frame held for reduced motion already shows a stamp.
const START = REST + 0.8;
const CW = 40, CH = 62, CY = 48;
const CLAY = hex("#cf7040"), INK = hex("#3a2a22"), MID = hex("#9a8270"), PALE = hex("#c9b6a0"), TRACK = hex("#e9d6c0"), RING = hex("#2f8a5c");
const CARDS = [
  { tile: hex("#5a8fd8"), ring: 0.86, title: 30, sub: 20, chip: 20, lines: [32, 27, 31, 18] },
  { tile: hex("#f0c050"), ring: 0.72, title: 24, sub: 26, chip: 17, lines: [30, 32, 22, 26] },
  { tile: hex("#8d6fd1"), ring: 0.93, title: 32, sub: 16, chip: 22, lines: [28, 31, 33, 15] },
  { tile: hex("#4fb3a5"), ring: 0.64, title: 27, sub: 22, chip: 18, lines: [33, 25, 29, 21] },
];
const stars = rng(9);
const SKY = Array.from({ length: 118 }, () => ({ x: stars(), y: stars() * 92, b: 0.25 + stars() * 0.6, phase: stars() * 6.28, rate: 0.5 + stars() }));

// The colour of a card at its own (u, v), stamp included.
function cardAt(c, u, v, amount, dir) {
  let col = WHITE;
  const bar = (x0, len, y, h) => u >= x0 && u < x0 + len && v >= y && v < y + h;
  if (Math.abs(u + 11) < 5.5 && Math.abs(v + 23) < 5.5 && rrect(u + 11, v + 23, 11, 11, 2) < 0) col = c.tile;
  else {
    const rd = Math.hypot(u - 12, v + 23);
    if (rd < 6 && rd > 3.8) {
      const a = (Math.atan2(u - 12, -(v + 23)) / 6.283 + 1) % 1;
      col = a < c.ring ? RING : TRACK;
    } else if (bar(-16, c.title, -13, 2.5)) col = INK;
    else if (bar(-16, c.sub, -8.5, 1.5)) col = MID;
    else if (bar(-16, c.chip, -4, 5) && rrect(u + 16 - c.chip / 2, v - (-1.5), c.chip, 5, 2.5) < 0) col = CLAY;
    else if (bar(-16, c.lines[0], 5, 1.5) || bar(-16, c.lines[1], 9, 1.5) || bar(-16, c.lines[2], 13, 1.5) || bar(-16, c.lines[3], 17, 1.5)) col = PALE;
  }
  if (amount > 0) {
    // The stamp leans against the direction of the swipe, on the side the card is leaving from.
    const lean = dir * -0.2, sx = u + dir * 2, sy = v + 8, k = Math.cos(lean), m = Math.sin(lean), su = sx * k + sy * m, sv = -sx * m + sy * k;
    if (rrect(su, sv, 34, 15, 2) < 0) {
      const word = dir > 0 ? "SAVE" : "PASS", tint = dir > 0 ? RING : hex("#b83a28");
      col = mix(col, inWord(word, su, sv, 2) ? WHITE : tint, amount);
    }
  }
  return col;
}

export default function create(cols = meta.cols) {
  const s = canvas(cols), CX = cols / 2, stretch = cols / meta.cols, MX = CX + 56 * stretch;
  // Far enough past the frame's edge that a flung card's corners are gone too.
  const OFF = CX + 44, sky = SKY.slice(0, Math.round(70 * stretch));
  for (let y = 0; y < H; y++) for (let x = 0; x < cols; x++) s.add(x, y, clay(x, y, 40 * stretch, 8, 220 * stretch));
  s.crescent(MX, 38, 12);
  s.glow(MX, 38, 34, hex("#f2b27a"), 0.14);
  const DUNE = hex("#241008");
  for (let x = 0; x < cols; x++) for (let y = Math.floor(95 + 3 * Math.sin(x / 26 + 0.7) + 2 * Math.sin(x / 11)); y < H; y++) s.add(x, y, DUNE);
  // The phone, on a layer of its own so the sky's glow stays behind it.
  s.onLayer(1);
  const BODY = hex("#140a06"), RIM = hex("#c9b6a0"), SCREEN = hex("#4a2010");
  for (let y = 0; y < H; y++) for (let x = CX - 30; x < CX + 30; x++) {
    const d = rrect(x - CX, y - 54, 52, 104, 7);
    if (d < 0.5) s.add(x, y, d > -1.1 ? RIM : d > -2.6 ? BODY : SCREEN);
  }
  for (let y = 7; y < 14; y++) for (let x = CX - 16; x < CX + 17; x++) if (inWord("ROLUNA", x - CX, y - 10.5)) s.add(x, y, hex("#f2b27a"));
  s.bar(CX - 10, 100, CX + 10, 100, 1.2, RIM);
  s.onLayer(0);
  s.freeze();
  const drawCard = (c, cx, cy, ang, k, amount, dir) => {
    const co = Math.cos(ang), si = Math.sin(ang), R = (Math.hypot(CW, CH) / 2 + 1) * k;
    for (let y = Math.max(0, Math.floor(cy - R)); y <= Math.min(H - 1, cy + R); y++) for (let x = Math.max(0, Math.floor(cx - R)); x <= Math.min(cols - 1, cx + R); x++) {
      const dx = x - cx, dy = y - cy, u = (dx * co + dy * si) / k, v = (-dx * si + dy * co) / k, d = rrect(u, v, CW, CH, 4);
      if (d < 0.5) s.add(x, y, cardAt(c, u, v, amount, dir), clamp(0.5 - d));
    }
  };
  const button = (x, y, col, on) => {
    s.disc(x, y, 6 + on, 6 + on, col, 0.35 + 0.65 * on);
    s.disc(x, y, 4.6 + on, 4.6 + on, hex("#4a2010"), 1 - on);
  };
  return (t) => {
    s.begin();
    for (const p of sky) s.star(p.x * cols, p.y, p.b * (0.65 + 0.35 * Math.sin(t * p.rate + p.phase)), CREAM, 0);
    const lt = (t + START) % LOOP, k = Math.floor(lt / STEP), p = lt - k * STEP, [id, dir, undo] = SEQ[k];
    let dx, rise;
    if (undo) { const a = ease(p / BACK); dx = dir * OFF * (1 - a); rise = 1 - a; }
    else { const f = clamp((p - REST - DRAG) / FLING); dx = dir * (ease((p - REST) / DRAG) * 34 + f * f * (OFF - 34)); rise = ease(f); }
    const amount = clamp(Math.abs(dx) / 24);
    const pose = (i) => [CY + 3.5 * i, 1 - 0.06 * i];
    const [y2, k2] = pose(2 - rise), [y1, k1] = pose(1 - rise);
    drawCard(CARDS[(id + 2) % 4], CX, y2, 0, k2, 0, 0);
    drawCard(CARDS[(id + 1) % 4], CX, y1, 0, k1, 0, 0);
    button(CX - 12, 91, RED, dir < 0 ? amount : 0);
    button(CX + 12, 91, GREEN, dir > 0 ? amount : 0);
    drawCard(CARDS[id], CX + dx, CY + Math.abs(dx) * 0.05, dx * 0.0065, 1, amount, dir);
    return s.finish();
  };
}
