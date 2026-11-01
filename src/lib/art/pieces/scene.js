/* scene.js: what the painted project scenes share, by the same method as the library's fuji-dawn-lake. The still part of a scene is painted once and frozen, each frame starts from that copy and adds what moves, and finish() turns the colours into text and colour keys. */
import { clamp, KEYS, noise2 } from "../vendor/ascii-magic/lib/kit.js";

export const W = 192, H = 108;
const HX = new Map();
export const hex = (h) => { let v = HX.get(h); if (!v) { v = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); HX.set(h, v); } return v; };
export const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
export const ramp = (stops, t) => {
  t = clamp(t);
  for (let i = 1; i < stops.length; i++) if (t <= stops[i][0]) return mix(hex(stops[i - 1][1]), hex(stops[i][1]), (t - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0] || 1));
  return hex(stops[stops.length - 1][1]);
};
export const ease = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
const toHex = (c) => "#" + c.map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, "0")).join("");

// A scene's colours. Each anchor list ends with how many steps to fill in; 62 steps is the most the colour keys can name.
export const palette = (anchors) => {
  const colors = anchors.flatMap((a) => {
    const n = a[a.length - 1], cs = a.slice(0, -1).map(hex);
    return Array.from({ length: n }, (_, i) => {
      if (cs.length === 1) return cs[0];
      const t = (i / Math.max(1, n - 1)) * (cs.length - 1), k = Math.min(cs.length - 2, Math.floor(t));
      return mix(cs[k], cs[k + 1], t - k);
    });
  });
  return { colors, lum: colors.map((c) => (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255), keys: Object.fromEntries(colors.map((c, i) => [KEYS[i], toHex(c)])) };
};
// The Roluna icon's clay, plus what its scenes need beside it.
const CLAY_PAL = palette([
  ["#140a06", "#241008", "#34170b", "#4a2010", "#6b2f17", "#8f4020", "#b5562b", "#cf7040", 20],
  ["#d9793f", "#e8904f", "#f2b27a", 5],
  ["#c9b6a0", "#e9d6c0", "#f6eadb", "#fff8ee", 7],
  ["#2f8a5c", "#6fcf8e", 3],
  ["#b83a28", "#ee6a55", 3],
  ["#5a8fd8", "#4fb3a5", "#8d6fd1", "#f0c050", 4],
  ["#3a2a22", "#6d5a4c", "#9a8270", 4],
]);
// Azure's night blues up to cloud white, beacon fire, stone, and the spokes' colours.
export const AZURE = palette([
  ["#070d1c", "#0e1a35", "#16294f", "#1e3b6e", "#2a5a9c", "#3a7fcf", "#5aa6e8", "#8fcaf5", 24],
  ["#c8def0", "#e8f2fa", "#ffffff", 5],
  ["#6e2c10", "#b8501e", "#e8802a", "#f5a53c", "#ffd27a", "#fff2c4", 10],
  ["#2f8a5c", "#6fcf8e", 3],
  ["#b83a28", "#ee6a55", 3],
  ["#1c2030", "#343a4c", "#565e72", "#838b9c", "#b2b8c4", 8],
  ["#d97fb0", "#f0c050", 2],
]);
// ServiceNow's dusk teals, the medallion's bronze and silver, and the four tables' colours.
export const NOW = palette([
  ["#0a1416", "#10262a", "#173a3c", "#225450", "#337868", "#5b9f84", "#9cc8a2", 18],
  ["#2e1c10", "#5a3a1c", "#8a5a28", "#cd7f32", "#eba85a", "#ffd9a0", "#fff1d0", 14],
  ["#5c6672", "#8a94a0", "#bcc6d0", "#eef2f6", 6],
  ["#b83a28", "#e5604d", 2],
  ["#3f6fb8", "#5a8fd8", 2],
  ["#b85f92", "#d97fb0", 2],
  ["#2f8a5c", "#6fcf8e", 2],
  ["#121418", "#23272e", "#3a4049", 4],
  ["#7a9a78", "#a8a868", "#d0a85c", 4],
]);
// Hyper-V's violet night and sunset, cool steel, and the three teams' colours.
export const HYPER = palette([
  ["#0b0a1c", "#161430", "#241f4c", "#3a3070", "#584a98", "#8270bc", "#ad9cd8", 18],
  ["#8a3f6a", "#c4607e", "#e8866e", "#f7ae60", "#ffd78a", "#fff3cc", 14],
  ["#1e2c48", "#3a5a84", "#6c9ac0", "#a8cde0", 6],
  ["#0a0a12", "#1c1c28", "#30303e", "#565664", "#8e8e9c", 7],
  ["#f6eadb", "#fff8ee", 2],
  ["#2f8a5c", "#6fcf8e", 2],
  ["#ee6a55", 1], ["#5a8fd8", 1], ["#f0c050", 1], ["#d97fb0", 1],
]);
// Data analytics: spreadsheet greens, paper, a code editor's blue and gold, chart colours, steel, and a baked crust.
export const DATA = palette([
  ["#08140f", "#0f2a1e", "#184430", "#22704a", "#2f9a63", "#5cc48a", "#a7e3bf", 18],
  ["#d9e4dc", "#f2f6f1", "#ffffff", 5],
  ["#16294f", "#1e3b6e", "#2f6aa3", "#4b8bbe", "#8fcaf5", 10],
  ["#8a6a10", "#f0b429", "#ffd43b", "#ffe98a", 7],
  ["#b83a28", "#ee6a55", 3],
  ["#b85f92", "#d97fb0", "#f2b5d4", 3],
  ["#1c2030", "#343a4c", "#565e72", "#838b9c", "#b2b8c4", 8],
  ["#4a2a12", "#8a5a28", "#cd7f32", "#eba85a", 6],
]);
const LEVELS = "▁▂▃▄▅▆▇█";

export const CREAM = hex("#f6eadb"), WHITE = hex("#fff8ee"), GREEN = hex("#6fcf8e"), RED = hex("#ee6a55"), CLAY = hex("#cf7040"), INK = hex("#140a06");
const SKY = [[0, "#cf7040"], [0.22, "#b5562b"], [0.45, "#8f4020"], [0.7, "#6b2f17"], [1, "#4a2010"]];
// The icon's gradient: brightest up and to the left, falling away to dark brown. The grain keeps the dots from settling into visible rings.
export const clay = (x, y, gx = 56, gy = 9, far = 190) => ramp(SKY, Math.hypot(x - gx, y - gy) / far + 0.09 * (noise2(x / 2.1, y / 2.1, 7) - 0.5));

export const sceneMeta = ({ slug, name, note, tags, tone, wide, pal = CLAY_PAL }) => ({
  slug, name, note, tags, wide, category: "landscapes",
  cols: W, rows: H, fps: 15, cell: "square", look: "dots", cover: true,
  // A curve under 1 lifts the clay, which would otherwise shrink to specks beside the cream.
  dots: { tone: { gamma: 0.62, floor: 0.03, sat: 0.9, curve: 0.62, ...tone } },
  palette: pal.keys,
});

export function inPoly(x, y, P) {
  let c = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    const [xi, yi] = P[i], [xj, yj] = P[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}
// Signed distance to a rounded rectangle centred on the origin: below zero is inside.
export const rrect = (u, v, w, h, r) => {
  const qx = Math.abs(u) - w / 2 + r, qy = Math.abs(v) - h / 2 + r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
};

const FONT = {
  A: "010101111101101", B: "110101110101110", C: "011100100100011", D: "110101101101110", E: "111100110100111", F: "111100110100100", G: "011100101101011", H: "101101111101101", I: "111010010010111",
  K: "101101110101101", L: "100100100100111", M: "101111111101101", N: "110101101101101", O: "010101101101010", P: "110101110100100", R: "110101110101101", S: "011100010001110", T: "111010010010010",
  U: "101101101101111", V: "101101101101010", W: "101101111111101", X: "101101010101101", Y: "101101010010010", Z: "111001010100111", "-": "000000111000000", " ": "000000000000000",
  0: "111101101101111", 1: "010110010010111", 2: "111001111100111", 3: "111001111001111", 4: "101101111001001", 5: "111100111001111", 6: "111100111101111", 7: "111001010010010", 8: "111101111101111", 9: "111101111001111",
};
// Is cell (u, v) of a word set in the 3×5 font, scaled by k and centred on the origin, inked?
export const inWord = (word, u, v, k = 1) => {
  const adv = 4 * k, ix = u + (word.length * adv - k) / 2, iy = v + (5 * k) / 2;
  if (ix < 0 || iy < 0 || iy >= 5 * k) return false;
  const n = Math.floor(ix / adv), px = Math.floor((ix - n * adv) / k), py = Math.floor(iy / k);
  return n < word.length && px < 3 && FONT[word[n]][py * 3 + px] === "1";
};

const FIRE = [[0, "#fff2c4"], [0.25, "#ffd27a"], [0.5, "#f5a53c"], [0.75, "#e8802a"], [1, "#b8501e"]];
// A flame standing on (x, y), h cells tall, licking from side to side.
export const flame = (s, x, y, h, t, seed = 0, strength = 1) => {
  for (let j = 0; j < h; j++) {
    const v = j / h, sway = Math.sin(t * 5 + seed + v * 4) * v * h * 0.09 + Math.sin(t * 9 + seed * 2 + v * 8) * v * h * 0.04;
    const w = h * 0.3 * Math.pow(1 - v, 0.75) * (0.75 + 0.25 * Math.sin(v * 3.1 + 0.4)) * (0.9 + 0.1 * Math.sin(t * 7 + seed));
    for (let dx = -Math.ceil(w) - 1; dx <= w + 1; dx++) {
      const e = clamp(w + 0.5 - Math.abs(dx));
      if (e > 0) s.add(x + sway + dx, y - j, ramp(FIRE, clamp(v * 0.7 + (Math.abs(dx) / (w + 0.01)) * 0.55)), e * strength);
    }
  }
};

// A cartoon cloud: puffs [cx, cy, r] painted back to front, each bright on top and shaded underneath, cut flat along the bottom at y = floor.
export const puff = (s, list, floor, top, bottom, upTo) => {
  for (const [cx, cy, r] of list) for (let y = Math.floor(cy - r - 1); y <= Math.min(floor, cy + r + 1); y++) for (let x = Math.floor(cx - r - 1); x <= cx + r + 1; x++) {
    const e = clamp(r + 0.5 - Math.hypot(x - cx, y - cy));
    if (e > 0) s.add(x, y, mix(top, bottom, clamp((y - cy + r) / (r * 2))), e, upTo);
  }
};

// A scene that draws its own version for a wide band asks for more columns; the rows stay the same.
export function canvas(W = 192, pal = CLAY_PAL) {
  const { colors: PAL, lum: LUM } = pal;
  const out = new Float32Array(W * H * 3), base = new Float32Array(W * H * 3), layer = new Uint8Array(W * H), cache = new Map();
  let paintLayer = 0, taking = null;
  const nearest = (r, g, b) => {
    const k = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
    let hit = cache.get(k);
    if (hit !== undefined) return hit;
    let best = 0, bd = 1e9;
    for (let i = 0; i < PAL.length; i++) { const p = PAL[i], d = (p[0] - r) ** 2 * 0.3 + (p[1] - g) ** 2 * 0.59 + (p[2] - b) ** 2 * 0.11; if (d < bd) { bd = d; best = i; } }
    cache.set(k, best);
    return best;
  };
  // Blend colour c by a at x,y, only where what's painted there is at or behind layer upTo.
  const add = (x, y, c, a = 1, upTo = 255) => {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= W || y >= H || a <= 0) return;
    const i = y * W + x, j = i * 3;
    if (taking) {
      const was = taking.get(i), a0 = was ? was[3] : 0, na = a + a0 * (1 - a), k = a / na;
      taking.set(i, was ? [was[0] + (c[0] - was[0]) * k, was[1] + (c[1] - was[1]) * k, was[2] + (c[2] - was[2]) * k, na] : [c[0], c[1], c[2], na]);
      return;
    }
    if (layer[i] > upTo) return;
    out[j] += (c[0] - out[j]) * a; out[j + 1] += (c[1] - out[j + 1]) * a; out[j + 2] += (c[2] - out[j + 2]) * a;
    if (paintLayer && a > 0.5) layer[i] = paintLayer;
  };
  const disc = (cx, cy, rx, ry, c, a = 1, upTo) => {
    for (let y = Math.floor(cy - ry - 1); y <= cy + ry + 1; y++) for (let x = Math.floor(cx - rx - 1); x <= cx + rx + 1; x++) {
      const e = clamp((1 - Math.hypot((x - cx) / rx, (y - cy) / ry)) * Math.min(rx, ry) + 0.5);
      if (e > 0) add(x, y, c, a * e, upTo);
    }
  };
  const glow = (cx, cy, r, c, a, upTo) => {
    for (let y = Math.max(0, Math.floor(cy - r)); y <= Math.min(H - 1, cy + r); y++) for (let x = Math.max(0, Math.floor(cx - r)); x <= Math.min(W - 1, cx + r); x++) {
      const d = clamp(1 - Math.hypot(x - cx, y - cy) / r);
      if (d > 0) add(x, y, c, a * d * d, upTo);
    }
  };
  const poly = (P, c, a = 1, upTo) => {
    const xs = P.map((p) => p[0]), ys = P.map((p) => p[1]);
    for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) for (let x = Math.floor(Math.min(...xs)); x <= Math.ceil(Math.max(...xs)); x++) {
      let n = 0;
      for (const [sx, sy] of [[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]]) if (inPoly(x + sx, y + sy, P)) n++;
      if (n) add(x, y, c, (a * n) / 4, upTo);
    }
  };
  // A line with round ends, w cells across.
  const bar = (x0, y0, x1, y1, w, c, a = 1, upTo) => {
    const dx = x1 - x0, dy = y1 - y0, L = dx * dx + dy * dy || 1, r = w / 2;
    for (let y = Math.floor(Math.min(y0, y1) - r - 1); y <= Math.max(y0, y1) + r + 1; y++) for (let x = Math.floor(Math.min(x0, x1) - r - 1); x <= Math.max(x0, x1) + r + 1; x++) {
      const k = clamp(((x - x0) * dx + (y - y0) * dy) / L), e = clamp(r + 0.5 - Math.hypot(x - x0 - dx * k, y - y0 - dy * k));
      if (e > 0) add(x, y, c, a * e, upTo);
    }
  };
  // A star: one bright cell, with a soft cross when it's strong enough to carry one.
  const star = (x, y, b, c = CREAM, upTo) => {
    add(x, y, c, b, upTo);
    if (b > 0.5) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) add(x + dx, y + dy, c, (b - 0.5) * 0.9, upTo);
  };
  // The crescent in the icon's r: lit on the right, the rest of the disc barely showing.
  const crescent = (cx, cy, r, a = 1, upTo) => {
    disc(cx, cy, r, r, hex("#8f4020"), 0.35 * a, upTo);
    const ox = cx - r * 0.42, oy = cy - r * 0.08, or = r * 0.86;
    for (let y = Math.floor(cy - r - 1); y <= cy + r + 1; y++) for (let x = Math.floor(cx - r - 1); x <= cx + r + 1; x++) {
      const e = clamp(r + 0.5 - Math.hypot(x - cx, y - cy)) * clamp(Math.hypot(x - ox, y - oy) - or + 0.5);
      if (e > 0) add(x, y, CREAM, a * e, upTo);
    }
  };
  // A filled block, and a rounded one centred on (cx, cy).
  const rect = (x0, y0, x1, y1, c, a = 1, upTo) => {
    for (let y = Math.round(y0); y <= Math.round(y1); y++) for (let x = Math.round(x0); x <= Math.round(x1); x++) add(x, y, c, a, upTo);
  };
  const box = (cx, cy, w, h, r, c, a = 1, upTo) => {
    for (let y = Math.floor(cy - h / 2 - 1); y <= cy + h / 2 + 1; y++) for (let x = Math.floor(cx - w / 2 - 1); x <= cx + w / 2 + 1; x++) {
      const e = clamp(0.5 - rrect(x - cx, y - cy, w, h, r));
      if (e > 0) add(x, y, c, a * e, upTo);
    }
  };
  // A word in the 3×5 font, scaled by k and centred on (cx, cy).
  const word = (text, cx, cy, c, k = 1, a = 1, upTo) => {
    const hw = text.length * 2 * k + 1, hh = 3 * k;
    for (let y = Math.floor(cy - hh); y <= cy + hh; y++) for (let x = Math.floor(cx - hw); x <= cx + hw; x++) if (inWord(text, x - cx, y - cy, k)) add(x, y, c, a, upTo);
  };
  return {
    add, disc, glow, poly, bar, star, crescent, rect, box, word,
    peek: (x, y) => { const j = (Math.round(y) * W + Math.round(x)) * 3; return [out[j], out[j + 1], out[j + 2]]; },
    onLayer: (n) => { paintLayer = n; },
    // Paint into a list instead of the picture, to stamp it again later at any offset.
    capture: (fn) => { taking = new Map(); fn(); const got = [...taking].map(([i, v]) => [i % W, Math.floor(i / W), [v[0], v[1], v[2]], v[3]]); taking = null; return got; },
    stamp: (list, dx = 0, dy = 0, upTo) => { for (const [x, y, c, a] of list) add(x + dx, y + dy, c, a, upTo); },
    freeze: () => { base.set(out); paintLayer = 0; },
    begin: () => out.set(base),
    finish: () => {
      const text = [], color = [];
      for (let y = 0; y < H; y++) {
        let tr = "", cr = "";
        for (let x = 0; x < W; x++) {
          const i = (y * W + x) * 3, r = clamp(out[i], 0, 255), g = clamp(out[i + 1], 0, 255), b = clamp(out[i + 2], 0, 255);
          const k = nearest(r, g, b), Y = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
          tr += LEVELS[Y > 0.86 ? 7 : clamp(Math.round(5 + (Y - LUM[k]) * 12), 3, 6)]; cr += KEYS[k];
        }
        text.push(tr); color.push(cr);
      }
      return { text: text.join("\n"), color: color.join("\n") };
    },
  };
}
