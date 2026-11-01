/* project-servicenow-dashboard: the part people actually see. A dashboard glowing on a desk at night, whose charts ease to new values each time it refreshes. Every value is made up, so there are no numbers or labels on it. */
import { clamp, fbm } from "../vendor/ascii-magic/lib/kit.js";
import { H, NOW, canvas, ease, hex, mix, sceneMeta } from "./scene.js";

export const meta = sceneMeta({
  slug: "project-servicenow-dashboard", name: "ServiceNow night dashboard",
  note: "A dashboard on a desk at night: tiles, bars, a line and a donut that ease to new values on each refresh, with steam off a mug beside it.",
  tags: ["dashboard", "charts", "monitor", "desk", "analytics", "reporting", "servicenow"],
  pal: NOW, wide: 324, tone: { curve: 0.44 },
});

const TABLES = [hex("#e5604d"), hex("#5a8fd8"), hex("#d97fb0"), hex("#6fcf8e")];
const SCREEN = hex("#10262a"), PANEL = hex("#173a3c"), GRID = hex("#225450"), WHITE = hex("#bcc6d0"), LAMP = hex("#ffd9a0"), STEEL = hex("#3a4049");
const EVERY = 5, EASE = 1.4, TAU = Math.PI * 2;
// A repeatable made-up value for slot i at refresh n, in 0..1.
const value = (i, n) => { const v = Math.sin(i * 12.9 + n * 78.2) * 43758.5; return 0.2 + 0.75 * (v - Math.floor(v)); };

export default function create(cols = meta.cols) {
  const s = canvas(cols, NOW), CX = cols / 2, HW = 62 * (cols / meta.cols) ** 0.45, X0 = CX - HW, X1 = CX + HW, Y0 = 7, Y1 = 76;
  // The room, lit only by the screen, and the desk's wood.
  for (let y = 0; y < 90; y++) for (let x = 0; x < cols; x++) s.add(x, y, mix(hex("#5b9f84"), hex("#225450"), clamp(Math.hypot((x - CX) * 0.8, (y - 40) * 1.2) / 104 + 0.2 * (fbm(x / 22, y / 14, 2, 3) - 0.5))));
  for (let y = 90; y < H; y++) for (let x = 0; x < cols; x++) {
    const screenLight = clamp(1 - Math.abs(x - CX) / (HW + (y - 90) * 1.5)) * clamp(1 - (y - 90) / 22);
    s.add(x, y, mix(mix(hex("#8a5a28"), hex("#5a3a1c"), clamp((y - 90) / 18 + 0.5 * (fbm(x / 22, y / 1.6, 2, 6) - 0.5))), hex("#5b9f84"), screenLight * 0.6));
  }
  s.rect(0, 90, cols, 90, hex("#cd7f32"));
  // The monitor.
  s.poly([[CX - 7, Y1], [CX + 7, Y1], [CX + 9, 88], [CX - 9, 88]], hex("#5c6672"));
  s.box(CX, 89, 44, 4, 1.5, hex("#8a94a0"));
  s.box(CX, (Y0 + Y1) / 2, HW * 2 + 6, Y1 - Y0 + 6, 2.5, hex("#3a4049"));
  s.rect(X0, Y0, X1, Y1, SCREEN);
  // The mug and, where there's room, a lamp's shade.
  const MX = X1 + 19;
  s.box(MX, 85, 13, 13, 2, hex("#bcc6d0")); s.bar(MX + 8, 82, MX + 8, 87, 2.4, hex("#8a94a0"));
  s.rect(MX - 5, 80, MX + 5, 80, hex("#5a3a1c"));
  const W = X1 - X0, tileW = (W - 15) / 4, chartY = Y0 + 19, midX = X0 + W * 0.66;
  // The panels' frames: four tiles across the top, then a bar chart with a line over it, and the donut.
  for (let i = 0; i < 4; i++) { const x = X0 + 3 + i * (tileW + 3); s.rect(x, Y0 + 3, x + tileW, Y0 + 15, PANEL); s.rect(x, Y0 + 3, x + tileW, Y0 + 4, TABLES[i]); }
  s.rect(X0 + 3, chartY, midX - 2, Y1 - 3, PANEL);
  s.rect(midX + 1, chartY, X1 - 3, Y1 - 3, PANEL);
  for (let y = chartY + 11; y < Y1 - 6; y += 11) for (let x = X0 + 6; x < midX - 4; x += 2) s.add(x, y, GRID);
  s.freeze();
  const BARS = 7, chartW = midX - X0 - 11, bw = chartW / BARS, base = Y1 - 6, tall = base - chartY - 6, DX = (midX + 1 + X1 - 3) / 2, DY = (chartY + Y1 - 3) / 2, DR = Math.min(X1 - midX - 8, Y1 - chartY - 7) / 2;
  return (t) => {
    s.begin();
    const n = Math.floor(t / EVERY) + 3, e = ease((t - (n - 3) * EVERY) / EASE), at = (i) => value(i, n - 1) + (value(i, n) - value(i, n - 1)) * e;
    // The tiles: a block for the figure, and a small trend.
    for (let i = 0; i < 4; i++) {
      const x = X0 + 3 + i * (tileW + 3);
      s.rect(x + 2, Y0 + 7, x + 2 + (tileW * 0.36) * (0.5 + at(i + 40) * 0.5), Y0 + 12, WHITE);
      for (let k = 0; k < 5; k++) { const h = 1 + 6 * at(i * 7 + k + 50); s.rect(x + tileW * 0.55 + k * (tileW * 0.09), Y0 + 13 - h, x + tileW * 0.55 + k * (tileW * 0.09), Y0 + 13, TABLES[i]); }
    }
    // The bars, in the tables' colours, and the line over them.
    let py = null, px = null;
    for (let i = 0; i < BARS; i++) {
      const x = X0 + 6 + i * bw, h = tall * 0.8 * at(i), y = base - h;
      s.rect(x + 1, y, x + bw - 2, base, TABLES[i % 4]);
      s.rect(x + 1, y, x + bw - 2, y, WHITE);
    }
    for (let i = 0; i < BARS; i++) {
      const x = X0 + 6 + (i + 0.5) * bw, y = base - tall * (0.15 + 0.85 * at(i + 20));
      if (py !== null) s.bar(px, py, x, y, 1, LAMP);
      px = x; py = y;
    }
    for (let i = 0; i < BARS; i++) s.disc(X0 + 6 + (i + 0.5) * bw, base - tall * (0.15 + 0.85 * at(i + 20)), 1.5, 1.5, WHITE);
    // The donut, whose slices change size.
    const parts = [0, 1, 2, 3].map((i) => at(i + 30)), sum = parts.reduce((a, b) => a + b);
    for (let y = Math.floor(DY - DR - 1); y <= DY + DR + 1; y++) for (let x = Math.floor(DX - DR - 1); x <= DX + DR + 1; x++) {
      const d = Math.hypot(x - DX, y - DY);
      if (d > DR || d < DR * 0.56) continue;
      let u = ((Math.atan2(y - DY, x - DX) + Math.PI / 2 + t * 0.05) / TAU % 1 + 1) % 1, k = 0, run = parts[0] / sum;
      while (u > run && k < 3) { k++; run += parts[k] / sum; }
      s.add(x, y, TABLES[k]);
    }
    s.disc(DX, DY, DR * 0.32, DR * 0.32, LAMP, 0.5 + 0.5 * at(35));
    // On refresh, a bar of light runs down the screen, and a dot in the corner blinks.
    const sweep = (t - (n - 3) * EVERY) / 0.8;
    if (sweep < 1) for (let k = 0; k < 4; k++) { const y = Y0 + sweep * (Y1 - Y0) - k * 1; for (let x = X0; x <= X1; x++) s.add(x, y, WHITE, 0.3 * (1 - k / 4)); }
    // Steam off the mug.
    const MX = X1 + 19;
    for (let k = 0; k < 8; k++) { const u = (t * 0.26 + k / 8) % 1; s.disc(MX + Math.sin(u * 7 + k) * 2.4, 78 - u * 22, 0.9 + u * 2.3, 0.9 + u * 2.3, hex("#bcc6d0"), 0.4 * (1 - u)); }
    return s.finish();
  };
}
