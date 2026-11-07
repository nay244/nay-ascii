/* project-techconcepts-lesson: a TechConcepts lesson, drawn literally. A laptop sends a lit GET tag along the cable to a server, the server's lights flicker, an OK tag rides back, and the page on the laptop draws block by block, while a row of step dots below marks where the lesson is. The navy and marigold follow TechConcepts' own blueprint look; the page's blocks are illustration, not a real page. */
import { clamp } from "../vendor/ascii-magic/lib/kit.js";
import { H, canvas, ease, hex, mix, palette, sceneMeta } from "./scene.js";

// Blueprint navy up to the lit blue, paper white, marigold, steel, and green for the reply.
const LESSON = palette([
  ["#0b1630", "#183064", "#22437f", "#2f5c9e", "#3f78c0", "#5a94da", 20],
  ["#2f7bff", "#5aa6ff", "#a8e8ff", 6],
  ["#cdd8ea", "#eef4ff", "#ffffff", 5],
  ["#8a5a10", "#d9962a", "#f5b942", "#ffd77a", 6],
  ["#1c2433", "#2c3648", "#4a5568", "#6a778c", "#8e9ab0", "#b8c2d4", "#dde3ee", 10],
  ["#2f8a5c", "#6fcf8e", 3],
]);

export const meta = sceneMeta({
  slug: "project-techconcepts-lesson", name: "A lesson playing",
  note: "A laptop sends GET along a cable to a server, OK comes back, and the page draws block by block, while step dots below mark the lesson's place.",
  tags: ["lesson", "http", "network", "laptop", "server"],
  pal: LESSON, wide: 324,
  // The white point comes from the brightest 1%, which the screen always fills, so the page drawing in over it doesn't pump the picture.
  tone: { curve: 0.58, hi: 0.99 },
});

const STEPS = 4, SEND = 1.1, ASK = 1.7, THINK = 1.1, REPLY = 1.7, DRAW = 2.2, HOLD = 2.4, RESET = 0.6;
const LOOP = SEND + ASK + THINK + REPLY + DRAW + HOLD + RESET, START = SEND + ASK + THINK + REPLY + DRAW + 0.5;
const PAPER = hex("#eef4ff"), WHITE = hex("#ffffff"), LIT = hex("#2f7bff"), PALE = hex("#a8e8ff"), GOLD = hex("#f5b942"), GREEN = hex("#6fcf8e");
const BODY = hex("#4a5568"), EDGE = hex("#b8c2d4"), DARK = hex("#1c2433"), LINE = hex("#5aa6ff"), DIM = hex("#6a778c");

export default function create(cols = meta.cols) {
  const s = canvas(cols, LESSON), CX = cols / 2, D = 52 * (cols / meta.cols), LX = CX - D, RX = CX + D;
  // The blueprint: mid blue, a little lighter in the middle, with a faint grid. The dots look shrinks dark colours to specks, so nothing big is darker than this.
  for (let y = 0; y < H; y++) for (let x = 0; x < cols; x++) {
    const grid = x % 12 === 0 || y % 12 === 0;
    s.add(x, y, mix(hex("#22437f"), hex("#3f78c0"), clamp(0.55 - Math.hypot((x - CX) / cols, (y - 50) / H) * 0.9 + (grid ? 0.07 : 0))));
  }
  // The plate both machines stand on.
  s.box(CX, 84, (RX - LX) + 70, 12, 5, hex("#183064"));
  s.box(CX, 82, (RX - LX) + 66, 6, 3, hex("#5a94da"), 0.5);
  // The laptop: lid, a paper-white screen, and its base.
  s.box(LX, 46, 48, 34, 2, BODY);
  s.box(LX, 46, 48, 34, 2, EDGE, 0.25);
  s.box(LX, 46, 42, 28, 1, PAPER);
  s.poly([[LX - 30, 64], [LX + 30, 64], [LX + 34, 72], [LX - 34, 72]], BODY);
  s.bar(LX - 30, 64, LX + 30, 64, 1, EDGE);
  s.box(LX, 68, 12, 2, 1, DIM);
  // The server: a tower with four drive bays and a lit top.
  s.box(RX, 46, 32, 52, 2, BODY);
  s.box(RX, 46, 32, 52, 2, EDGE, 0.25);
  s.box(RX, 23, 30, 4, 1, LIT);
  s.box(RX, 22, 26, 1, 1, PALE, 0.8);
  for (let i = 0; i < 4; i++) { s.box(RX, 32 + i * 10, 26, 7, 1, DARK); s.rect(RX - 11, 32 + i * 10, RX + 1, 32 + i * 10, DIM); }
  s.glow(RX, 46, 44, LIT, 0.12);
  // The cable between them, dipping across the plate.
  const cable = (u) => { const a = (1 - u) ** 2, b = 2 * u * (1 - u), c = u * u; return [a * (LX + 30) + b * CX + c * (RX - 16), a * 66 + b * 80 + c * 64]; };
  for (let i = 0; i <= 160; i++) { const [x, y] = cable(i / 160); s.add(x, y, LINE); s.add(x, y + 1, hex("#183064")); }
  // The step track: a line through four dots.
  const dot = (i) => CX - ((STEPS - 1) / 2 - i) * 14;
  s.bar(dot(0), 100, dot(STEPS - 1), 100, 1, DIM);
  s.freeze();

  // A message tag riding the cable, word and all.
  const tag = (u, word, c, a = 1) => {
    const [x, y] = cable(u);
    s.glow(x, y - 6, 9, c, 0.25 * a);
    s.box(x, y - 6, word.length * 4 + 5, 9, 2, c, a);
    s.word(word, x, y - 6, DARK, 1, a);
  };
  return (t) => {
    s.begin();
    const lt = (t + START) % LOOP;
    const ask = clamp((lt - SEND) / ASK), think = clamp((lt - SEND - ASK) / THINK), reply = clamp((lt - SEND - ASK - THINK) / REPLY);
    const drawn = clamp((lt - SEND - ASK - THINK - REPLY) / DRAW), back = clamp((lt - LOOP + RESET) / RESET);
    const step = drawn > 0 ? 3 : reply > 0 ? 2 : ask > 0 ? 1 : 0;
    if (ask > 0 && ask < 1) tag(ease(ask), "GET", PALE);
    if (reply > 0 && reply < 1) tag(1 - ease(reply), "OK", GREEN);
    // The server's lights: idle blinks, then a busy flicker while it works on the request.
    for (let i = 0; i < 4; i++) for (let n = 0; n < 2; n++) {
      const busy = think > 0 && think < 1, on = busy ? Math.sin(t * 23 + i * 5 + n * 3) > 0 : Math.sin(t * (2 + i * 0.6) + i * 2 + n * 4) > 0.3;
      s.disc(RX + 5 + n * 4, 32 + i * 10, 1.1, 1.1, on ? (busy ? PALE : GREEN) : DIM);
    }
    if (think > 0 && think < 1) s.glow(RX, 23, 18, PALE, 0.35 * Math.sin(think * Math.PI));
    // The page draws block by block once the reply is in, and clears for the next round.
    const blocks = [
      [LX, 36, 36, 4, LIT], [LX - 9, 44, 18, 8, hex("#5aa6ff")], [LX + 9, 42, 14, 2, DIM], [LX + 9, 46, 14, 2, DIM],
      [LX, 52, 36, 2, EDGE], [LX - 4, 56, 28, 2, EDGE], [LX + 12, 56, 8, 2, GOLD],
    ];
    blocks.forEach(([x, y, w, h, c], i) => {
      const a = clamp(drawn * blocks.length - i) * (1 - back);
      if (a > 0) s.box(x, y, w, h, 1, c, a);
    });
    // Waiting for the page: a cursor blinks in the address bar.
    if (drawn === 0 && Math.sin(t * 6) > 0) s.rect(LX - 18, 36, LX - 18, 38, LIT);
    // Where the lesson is: past steps lit blue, the current one marigold.
    for (let i = 0; i < STEPS; i++) {
      const now = i === step && back === 0, past = i < step && back === 0;
      s.disc(dot(i), 100, now ? 3 : 2.2, now ? 3 : 2.2, now ? GOLD : past ? LIT : DIM);
      if (now) s.glow(dot(i), 100, 8, GOLD, 0.25);
    }
    return s.finish();
  };
}
