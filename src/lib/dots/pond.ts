// The home page's pond: koi and lotus drawn in braille dots on a canvas, steered by the pointer.
// createPond(stage, theme) starts one in a stage element holding a <canvas> and a .hero (the intro text,
// which the koi steer around); anything else in the stage marked data-avoid is steered around too.
// Every pond shares one animation loop; only ponds on screen move. destroy() hands everything back.
import type { Theme } from "../theme.ts";

const TAU = Math.PI * 2;
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const smooth = (x: number) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
function angleDiff(a: number, b: number) { let d = (a - b) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; }
function hash(x: number, y: number, s: number) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(s | 0, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1103515245); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
function noise(x: number, y: number, s: number) {
  const xi = Math.floor(x), yi = Math.floor(y), u = smooth(x - xi), v = smooth(y - yi);
  const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
type Rgb = [number, number, number];
const hex = (c: string): Rgb => { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const mix = (a: Rgb, b: Rgb, t: number): Rgb => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const css = (c: Rgb) => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;

// What a point on the pond can land on.
const KOI_FIN = 1, KOI_BODY = 2, KOI_EYE = 3, PAD = 4, PAD_VEIN = 5, PAD_RIM = 6, PETAL_OUT = 7, PETAL_IN = 8, CENTER = 9;

type Palette = { bg: string; pal: Record<string, string> };
const THEMES: Record<Theme, Palette> = {
  dark: {
    bg: "#1a1917",
    pal: {
      white: "#f4efe6", red: "#ff6a3d", black: "#55525c", gold: "#f2b84b", fin: "#b9c3d6", goldfin: "#e8c88a",
      pad: "#4f8a5b", padRim: "#7db57d", petalOut: "#ffc2d4", petalIn: "#ff8fb1", center: "#ffd75e", ripple: "#8fb7ff", water: "#41507a",
      food: "#e0a86a",
    },
  },
  // Daylight water. Pale koi get a darker edge (whiteEdge) so they don't vanish into it.
  light: {
    bg: "#eef2f4",
    pal: {
      white: "#a9b3bf", whiteEdge: "#566273", red: "#e0532f", black: "#2f3138", gold: "#d99a28", fin: "#8794a6", goldfin: "#d6ad62",
      pad: "#5d9668", padRim: "#3d7a4b", petalOut: "#f3a2b9", petalIn: "#e46d93", center: "#e0ae2e", ripple: "#6f93c4", water: "#a9bccf",
      food: "#8e5f33",
    },
  },
};

// Dot spacing in CSS pixels; each 2×4 block of dots is one braille cell.
const DOT = 3.6;
// Ordered-dither thresholds for the 2×4 braille dot grid.
const DITHER = [[0.06, 0.56], [0.81, 0.31], [0.19, 0.69], [0.94, 0.44]];
// Most a koi's spine can bend at any one joint, in radians.
const MAX_BEND = 0.22;
// Top share of the pond kept clear of lotus, for the site header.
const HEADER_BAND = 0.15;
// Food pellets: drawn radius in CSS pixels, and seconds they float before sinking away.
const FOOD_R = 3.4, FOOD_LIFE = 14;
// How far a pond's height may drift from its last layout before the koi and lotus are placed again.
// A phone's address bar showing and hiding changes the height by less than this and shouldn't reshuffle the pond.
const RELAYOUT_HEIGHT = 120;
// How far the lotus move in from their sides, and the pond width that starts at: the same as the desktop home text in home.css.
const LOTUS_MOVE_IN = 100, LOTUS_MOVE_IN_FROM = 1024;

type Lotus = {
  side: "left" | "right"; inset: number; y: number; r: number; notch: number; seed: number;
  flower: { angle: number; dist: number; size: number; rot: number };
};
// The pinned lotus arrangement. inset is the distance from the pad's own side edge, in pad radii;
// y is a share of the pond's height, and so is r, except that a tall narrow pond sizes r from its
// width so a phone screen doesn't fill with lotus. Flower angle is in radians, dist and size in pad radii.
const LOTUS_LAYOUT: Lotus[] = [
  { side: "left", inset: 0.629, y: 0.2758, r: 0.1032, notch: 0.6927, seed: 729705, flower: { angle: 0.7895, dist: 0.587, size: 0.867, rot: 4.4034 } },
  { side: "left", inset: 0.734, y: 0.6291, r: 0.0891, notch: 3.3978, seed: 363342, flower: { angle: -0.6703, dist: 0.494, size: 0.807, rot: 5.0285 } },
  { side: "right", inset: 1.429, y: 0.4151, r: 0.1027, notch: 6.1897, seed: 319555, flower: { angle: 3.1287, dist: 0.486, size: 0.747, rot: 5.6163 } },
  { side: "right", inset: 0.623, y: 0.7758, r: 0.0771, notch: 4.8083, seed: 422471, flower: { angle: -2.79, dist: 0.554, size: 0.828, rot: 3.9831 } },
];

// ── koi ──────────────────────────────────────────────────────────
type Patch = { s: number; v: number; r: number; c: string };
type Food = { x: number; y: number; vx: number; vy: number; t0: number; a: number; gone: boolean };
export type Koi = {
  N: number; L: number; W: number; seg: number;
  // p is the follow chain of joints; rp is the drawn spine, the chain plus a travelling wave.
  p: Float32Array; rp: Float32Array;
  heading: number; turn: number; burst: number; burstT: number; excite: number; phase: number;
  depth: number; dz: number; seed: number; base: string; finColor: string; patches: Patch[];
  flareL: number; flareR: number; bb: [number, number, number, number]; idx: number; target: Food | null;
};
// What classifyKoi tells about the spot it was asked of, when it lands on a koi's body or fin.
type Skin = { color: string; ln: number; b: number };

// Half-width along the body as a fraction of the widest point: round head, full shoulders, thin tail stalk.
function bodyHW(s: number) {
  if (s < 0.26) return 0.6 + 0.4 * smooth(s / 0.26);
  if (s < 0.84) return 1 - 0.8 * smooth((s - 0.26) / 0.58);
  return 0.2;
}

function makeKoi(rand: () => number, x: number, y: number, L: number): Koi {
  const N = 16, a = rand() * TAU, seg = L / (N - 1);
  const p = new Float32Array(N * 2), rp = new Float32Array(N * 2);
  for (let i = 0; i < N; i++) { p[2 * i] = x - Math.cos(a) * seg * i; p[2 * i + 1] = y - Math.sin(a) * seg * i; }
  rp.set(p);
  const roll = rand();
  const variety = roll < 0.42 ? "kohaku" : roll < 0.78 ? "sanke" : "ogon";
  const patches: Patch[] = [];
  if (variety !== "ogon") {
    patches.push({ s: 0.07 + rand() * 0.06, v: (rand() - 0.5) * 0.4, r: 0.08 + rand() * 0.05, c: "red" });
    const n = 1 + Math.floor(rand() * 3);
    for (let i = 0; i < n; i++) patches.push({ s: 0.3 + i * 0.16 + rand() * 0.05, v: (rand() - 0.5) * 0.9, r: 0.09 + rand() * 0.07, c: "red" });
    if (variety === "sanke") {
      const m = 3 + Math.floor(rand() * 4);
      for (let i = 0; i < m; i++) patches.push({ s: 0.22 + rand() * 0.55, v: (rand() - 0.5) * 1.6, r: 0.03 + rand() * 0.03, c: "black" });
    }
  }
  return {
    N, L, W: L * 0.165, seg, p, rp, heading: a, turn: 0, burst: rand(), burstT: rand() * 3, excite: 0, phase: rand() * TAU,
    depth: 0.8, dz: 0, seed: (rand() * 1e6) | 0, base: variety === "ogon" ? "gold" : "white", finColor: variety === "ogon" ? "goldfin" : "fin",
    patches, flareL: 1, flareR: 1, bb: [0, 0, 0, 0], idx: 0, target: null,
  };
}

function koiSkin(k: Koi, s: number, lat: number, hw: number, o: Skin) {
  const ln = clamp(Math.abs(lat) / hw, 0, 1), lw = lat / k.W;
  let col = k.base;
  for (let i = 0; i < k.patches.length; i++) {
    const p = k.patches[i];
    const ds = s - p.s, dv = (lw - p.v) * (k.W / k.L);
    const thr = p.r * (0.7 + 0.6 * noise(s * 16 + i * 7.1, lw * 3.2, k.seed + i));
    if (ds * ds + dv * dv < thr * thr) col = p.c;
  }
  o.color = col; o.ln = ln;
  o.b = k.depth * (1 - 0.5 * ln * ln) + (ln < 0.3 && s > 0.12 && s < 0.7 ? 0.08 : 0);
  return KOI_BODY;
}

function classifyKoi(k: Koi, x: number, y: number, o: Skin) {
  const P = k.rp, N = k.N;
  let best = Infinity, bi = 0, bt = 0;
  for (let i = 0; i < N - 1; i++) {
    const ax = P[2 * i], ay = P[2 * i + 1], vx = P[2 * i + 2] - ax, vy = P[2 * i + 3] - ay;
    const l2 = vx * vx + vy * vy || 1e-6;
    const tt = ((x - ax) * vx + (y - ay) * vy) / l2;
    const tc = tt < 0 ? 0 : tt > 1 ? 1 : tt;
    const ex = ax + vx * tc - x, ey = ay + vy * tc - y, d2 = ex * ex + ey * ey;
    if (d2 < best) { best = d2; bi = i; bt = tt; }
  }
  if (bi === N - 2 && bt > 1) return 0;
  const ax = P[2 * bi], ay = P[2 * bi + 1];
  let vx = P[2 * bi + 2] - ax, vy = P[2 * bi + 3] - ay;
  const len = Math.hypot(vx, vy) || 1; vx /= len; vy /= len;
  const tc = clamp(bt, 0, 1);
  const qx = ax + vx * len * tc, qy = ay + vy * len * tc;
  const lat = (x - qx) * -vy + (y - qy) * vx, alat = Math.abs(lat);
  const W = k.W, L = k.L, s = (bi + tc) / (N - 1);
  if (bi === 0 && bt < 0) {
    const r = bodyHW(0) * W;
    return best < r * r ? koiSkin(k, 0, lat, r, o) : 0;
  }
  const hw = bodyHW(s) * W;
  if (s < 0.14) {
    const es = 0.075, el = bodyHW(es) * W * 0.55, er = Math.max(1.6, W * 0.13);
    const ds = (s - es) * L, dl = alat - el;
    if (ds * ds + dl * dl < er * er) return KOI_EYE;
  }
  if (alat < hw && s < 0.86) return koiSkin(k, s, lat, hw, o);
  if (s > 0.78) {
    const hf = W * (0.2 + 0.95 * Math.pow((s - 0.78) / 0.22, 1.15));
    if (alat < hf) {
      if (s > 0.9 && alat < hf * ((s - 0.9) / 0.1) * 0.5) return 0;
      o.color = k.finColor; o.b = k.depth * (0.55 + 0.45 * (1 - (s - 0.78) / 0.22));
      return KOI_FIN;
    }
  }
  const side = lat < 0 ? -1 : 1, out = alat - hw;
  if (out >= 0) {
    let reach = 0;
    if (s > 0.19 && s < 0.37) reach = W * 0.85 * Math.sin(Math.PI * Math.pow((s - 0.19) / 0.18, 0.65)) * (side < 0 ? k.flareL : k.flareR);
    else if (s > 0.5 && s < 0.6) reach = W * 0.38 * Math.sin(Math.PI * (s - 0.5) / 0.1);
    if (out < reach) {
      o.color = k.finColor; o.b = k.depth * (0.8 - 0.35 * out / reach);
      return KOI_FIN;
    }
  }
  return 0;
}

// ── lotus ────────────────────────────────────────────────────────
type Flower = { fx: number; fy: number; R: number; rot: number; bloom: number; x: number; y: number };
type Pad = {
  hx: number; hy: number; x: number; y: number; ox: number; oy: number; vx: number; vy: number;
  R: number; notch: number; seed: number; flower: Flower;
};

// A pad of radius R at (x, y), shaped by its LOTUS_LAYOUT entry.
function makePad(x: number, y: number, R: number, l: Lotus): Pad {
  const f = l.flower, d = f.dist * R;
  const flower: Flower = { fx: Math.cos(f.angle) * d, fy: Math.sin(f.angle) * d, R: f.size * R, rot: f.rot, bloom: 0.84, x: 0, y: 0 };
  return { hx: x, hy: y, x, y, ox: 0, oy: 0, vx: 0, vy: 0, R, notch: l.notch, seed: l.seed, flower };
}

function padHit(p: Pad, x: number, y: number, sw: number, sh: number) {
  const dx = x - p.x, dy = y - p.y, r2 = dx * dx + dy * dy;
  if (r2 > p.R * p.R) return 0;
  const r = Math.sqrt(r2) || 1e-6, th = Math.atan2(dy, dx);
  if (Math.abs(angleDiff(th, p.notch)) < 0.22 && r > sw * 0.8) return 0;
  const ux = Math.abs(dx) / r, uy = Math.abs(dy) / r;
  if (p.R - r < (ux * sw + uy * sh) * 0.95) return PAD_RIM;
  const seg = TAU / 7;
  let ph = (th - p.notch) % seg; if (ph < 0) ph += seg;
  if (Math.min(ph, seg - ph) * r < (uy * sw + ux * sh) * 0.5 && r > (sw + sh) * 0.6) return PAD_VEIN;
  return PAD;
}

// Petals point outward from the centre and narrow to a tip.
function inPetal(r: number, th: number, k: number, LR: number, rot: number) {
  const seg = TAU / k;
  let ph = (th - rot) % seg; if (ph < 0) ph += seg; ph -= seg / 2;
  const q = Math.abs(ph) / (seg * 0.6);
  return q < 1 && r <= LR * Math.pow(1 - q * q, 0.55);
}

function flowerHit(f: Flower, x: number, y: number, t: number) {
  const R = f.R * f.bloom, dx = x - f.x, dy = y - f.y, r2 = dx * dx + dy * dy;
  if (r2 > R * R) return 0;
  const r = Math.sqrt(r2);
  if (r < R * 0.2) return CENTER;
  const th = Math.atan2(dy, dx);
  if (inPetal(r, th, 6, R * 0.6, f.rot + 0.52 + Math.sin(t * 0.7 + f.rot) * 0.05)) return PETAL_IN;
  if (inPetal(r, th, 8, R, f.rot)) return PETAL_OUT;
  return 0;
}

// ── the pond ─────────────────────────────────────────────────────
type Ripple = { x: number; y: number; t0: number; big: boolean; life: number; speed: number; amp: number; hit: Set<Pad> | null };
type Bounds = { l: number; t: number; r: number; b: number };
type Bucket = { col: string; a: number; pts: number[] };

export interface Pond {
  // The koi swimming now. A new array replaces it when the pond is laid out again, so a change here means the koi were placed anew.
  readonly koi: Koi[];
  setTheme(theme: Theme): void;
  destroy(): void;
}

class PondEngine implements Pond {
  el: HTMLElement; seed: number;
  canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; hero: Element;
  o: Skin = { color: "", ln: 0, b: 0 }; o2: Skin = { color: "", ln: 0, b: 0 };
  shades: Record<string, string[]> = {}; buckets = new Map<string, Bucket>(); theme: Palette;
  t = 0; ripples: Ripple[] = []; food: Food[] = []; pads: Pad[] = []; koi: Koi[] = []; order: Koi[] = []; avoid: Bounds[] = [];
  heroBox: Bounds = { l: 0, t: 0, r: 0, b: 0 };
  mx = -1e4; my = -1e4; lastTrail: [number, number] | null = null;
  visible = false; reduced: boolean; destroyed = false;
  // The size the canvas has now, and the size the koi and lotus were last placed for.
  w = 0; h = 0; laidW = 0; laidH = 0;
  scale = 1; cw = DOT * 2; ch = DOT * 4; cols = 0; rows = 0;
  // What dot() leaves behind about the dot it just looked up: brightness, opacity, and whether it is lotus (undimmed under text).
  dotLv = 1; dotA = 1; dotTop = false;
  resizeObserver: ResizeObserver; intersectionObserver: IntersectionObserver;

  constructor(el: HTMLElement, theme: Theme, seed: number) {
    const canvas = el.querySelector("canvas"), hero = el.querySelector(".hero"), ctx = canvas?.getContext("2d");
    if (!canvas || !hero || !ctx) throw new Error("A pond needs a <canvas> and a .hero inside its stage.");
    this.el = el; this.seed = seed; this.canvas = canvas; this.ctx = ctx; this.hero = hero;
    this.theme = THEMES[theme];
    this.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(el);
    this.intersectionObserver = new IntersectionObserver((entries) => { this.visible = entries[entries.length - 1].isIntersecting; });
    this.intersectionObserver.observe(el);
    el.addEventListener("pointermove", this.onMove);
    el.addEventListener("pointerleave", this.onLeave);
    el.addEventListener("pointerdown", this.onDown);
    el.addEventListener("pointerover", this.onOver);
    ponds.push(this);
    if (!this.reduced) startLoop();
    // The first draw doesn't wait for the resize observer's first report.
    this.resize();
  }

  // Stops everything this pond started: its observers, its listeners and, if it was the last moving pond, the shared loop.
  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.resizeObserver.disconnect();
    this.intersectionObserver.disconnect();
    this.el.removeEventListener("pointermove", this.onMove);
    this.el.removeEventListener("pointerleave", this.onLeave);
    this.el.removeEventListener("pointerdown", this.onDown);
    this.el.removeEventListener("pointerover", this.onOver);
    const at = ponds.indexOf(this);
    if (at >= 0) ponds.splice(at, 1);
    if (!ponds.some((p) => !p.reduced)) stopLoop();
  }

  local(e: MouseEvent): [number, number] { const r = this.el.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
  onMove = (e: Event) => {
    const [x, y] = this.local(e as MouseEvent);
    this.mx = x; this.my = y;
    if (this.reduced) return;
    const lt = this.lastTrail;
    if (!lt || Math.hypot(x - lt[0], y - lt[1]) > 26) { if (lt) this.addRipple(x, y, false); this.lastTrail = [x, y]; }
  };
  onLeave = () => { this.mx = this.my = -1e4; this.lastTrail = null; };
  onDown = (e: Event) => {
    // Clicks on links and buttons over the pond belong to them, not to feeding.
    if ((e.target as Element).closest("a, button")) return;
    const [x, y] = this.local(e as MouseEvent);
    this.addRipple(x, y, true);
    this.dropFood(x, y);
    if (this.reduced) this.draw();
  };
  // Hovering a link or button over the pond sends a soft ring out from just below it, into open water
  // (right under the link the pond is dimmed to keep the text readable).
  onOver = (e: Event) => {
    const a = (e.target as Element).closest("a, button"), from = (e as PointerEvent).relatedTarget as Node | null;
    if (!a || !this.el.contains(a) || a.contains(from) || this.reduced) return;
    const sr = this.el.getBoundingClientRect(), r = a.getBoundingClientRect();
    const ring = this.addRipple(r.left + r.width / 2 - sr.left, r.bottom - sr.top + 16, false);
    Object.assign(ring, { life: 1.8, speed: 55 * this.scale, amp: 0.6 });
  };
  // delay is seconds before the ring appears. Returns the ripple, so callers can adjust it.
  addRipple(x: number, y: number, big: boolean, delay = 0) {
    if (this.ripples.length > 36) this.ripples.shift();
    const s = this.scale, t0 = this.t + delay;
    const ring: Ripple = big
      ? { x, y, t0, big, life: 3.4, speed: 64 * s, amp: 1, hit: new Set() }
      : { x, y, t0, big, life: 1.25, speed: 40 * s, amp: 0.4, hit: null };
    this.ripples.push(ring);
    return ring;
  }
  // A small handful of pellets scattered around (x, y), each landing with its own little ring.
  dropFood(x: number, y: number) {
    const n = 3 + Math.floor(Math.random() * 3), sc = this.scale;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU, d = Math.random() * 16 * sc;
      const fx = x + Math.cos(a) * d, fy = y + Math.sin(a) * d;
      // Food landing on a lotus pad would be out of the koi's reach, so none is dropped there.
      if (this.pads.some((p) => Math.hypot(fx - p.x, fy - p.y) < p.R)) continue;
      if (this.food.length >= 40) this.food.shift()!.gone = true;
      this.food.push({ x: fx, y: fy, vx: Math.cos(a) * 6, vy: Math.sin(a) * 6, t0: this.t, a: 1, gone: false });
      this.addRipple(fx, fy, false, 0.08 + Math.random() * 0.25);
    }
  }

  // The canvas always follows the stage. The koi and lotus are placed again only when the width changes,
  // or the height moves more than RELAYOUT_HEIGHT from where they were last placed.
  resize() {
    if (this.destroyed) return;
    const w = this.el.clientWidth, h = this.el.clientHeight;
    if (!w || !h) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    this.w = w; this.h = h;
    this.canvas.width = Math.round(w * dpr); this.canvas.height = Math.round(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.cols = Math.ceil(w / this.cw); this.rows = Math.ceil(h / this.ch);
    // Koi steer around and fade under the intro text and anything else marked data-avoid, like header links.
    const sr = this.el.getBoundingClientRect(), m = 10;
    const box = (r: DOMRect): Bounds => ({ l: r.left - sr.left - m, t: r.top - sr.top - m, r: r.right - sr.left + m, b: r.bottom - sr.top + m });
    this.heroBox = box(this.hero.getBoundingClientRect());
    this.avoid = [this.heroBox, ...[...this.el.querySelectorAll("[data-avoid]")].map((e) => box(e.getBoundingClientRect()))];
    if (!this.laidW || w !== this.laidW || Math.abs(h - this.laidH) > RELAYOUT_HEIGHT) {
      this.laidW = w; this.laidH = h;
      this.layout();
      for (let i = 0; i < 90; i++) this.step(1 / 60);
    }
    this.draw();
  }

  inAvoid(x: number, y: number, m: number) { return this.avoid.some((b) => x > b.l - m && x < b.r + m && y > b.t - m && y < b.b + m); }
  dimAt(x: number, y: number) { return this.inAvoid(x, y, 0); }
  // Which quarter of the pond (x, y) is in: 0 top left, 1 top right, 2 bottom left, 3 bottom right.
  quadrant(x: number, y: number) { return (x < this.w / 2 ? 0 : 1) + (y < this.h / 2 ? 0 : 2); }

  layout() {
    const rand = rng(this.seed), w = this.w, h = this.h;
    this.scale = clamp(w / 900, 0.55, 1);
    // The pinned lotus. On a wide pond each moves in from its side, unless that would put it under the intro text.
    // A pad still under the text moves up just clear of it, but never into the header band.
    // If that lands it on another pad, the pond goes without it.
    this.pads = [];
    for (const l of LOTUS_LAYOUT) {
      const R = l.r * Math.min(h, w * 1.1), b = this.heroBox, mm = R + 12;
      const at = (inset: number) => (l.side === "left" ? inset : w - inset);
      const underText = (x: number, y: number) => x > b.l - mm && x < b.r + mm && y > b.t - mm && y < b.b + mm;
      let x = at(l.inset * R + (w >= LOTUS_MOVE_IN_FROM ? LOTUS_MOVE_IN : 0)), y = l.y * h;
      if (underText(x, y)) x = at(l.inset * R);
      if (underText(x, y)) y = b.t - R - 13;
      y = Math.max(y, h * HEADER_BAND + R);
      if (!this.pads.some((p) => Math.hypot(x - p.x, y - p.y) < R + p.R)) this.pads.push(makePad(x, y, R, l));
    }
    this.koi = [];
    const n = Math.round(clamp((w * h) / 100000, 3, 5));
    // The full-size koi, then two young ones a little over half their length.
    for (let i = 0; i < n + 2; i++) {
      let x, y, t = 0;
      do { x = rand() * w; y = rand() * h; } while (this.inAvoid(x, y, 40) && t++ < 50);
      const k = makeKoi(rand, x, y, (i < n ? 170 + rand() * 70 : 95 + rand() * 30) * this.scale);
      k.idx = i;
      this.koi.push(k);
    }
    this.ripples = []; this.food = [];
  }

  steer(k: Koi, dt: number) {
    const t = this.t, P = k.p, hx = P[0], hy = P[1], w = this.w, h = this.h, sc = this.scale;
    // Mostly hold course, with a gentle pull toward a slowly drifting direction.
    const drift = noise(t * 0.04, k.seed * 0.013, 11) * TAU * 2;
    let tx = Math.cos(k.heading) + Math.cos(drift) * 0.5, ty = Math.sin(k.heading) + Math.sin(drift) * 0.5;
    const m = 70 * sc + k.L * 0.3;
    if (hx < m) tx += ((m - hx) / m) * 3; else if (hx > w - m) tx -= ((hx - w + m) / m) * 3;
    if (hy < m) ty += ((m - hy) / m) * 3; else if (hy > h - m) ty -= ((hy - h + m) / m) * 3;
    // A koi only notices food in its own quarter of the pond. It goes after the nearest pellet there
    // and sticks with it, even across a quarter line, until it's eaten or gone.
    if (k.target && k.target.gone) k.target = null;
    if (!k.target && this.food.length) {
      const q = this.quadrant(hx, hy);
      let best = Infinity;
      for (const f of this.food) {
        if (f.gone || this.quadrant(f.x, f.y) !== q) continue;
        const d = Math.hypot(f.x - hx, f.y - hy);
        if (d < best) { best = d; k.target = f; }
      }
    }
    let chase = Infinity;
    if (k.target) {
      const ax = k.target.x - hx, ay = k.target.y - hy;
      chase = Math.hypot(ax, ay) || 1;
      tx += (ax / chase) * 4; ty += (ay / chase) * 4;
      k.excite = Math.max(k.excite, 0.75);
      // Food floats, so a feeding koi rises toward the surface.
      k.dz += dt * 0.25;
    }
    // Feeding koi crowd in; they give each other less room than usual.
    const crowd = k.target ? 0.35 : 1;
    for (const b of this.avoid) {
      const cx = clamp(hx, b.l, b.r), cy = clamp(hy, b.t, b.b);
      let ax = hx - cx, ay = hy - cy, d = Math.hypot(ax, ay);
      const mm = 46;
      if (d < mm) {
        const inside = d < 0.5;
        if (inside) { ax = hx - (b.l + b.r) / 2; ay = hy - (b.t + b.b) / 2; d = Math.hypot(ax, ay) || 1; }
        const s = inside ? 4 : (1 - d / mm) * 3.2;
        tx += (ax / d) * s; ty += (ay / d) * s;
      }
    }
    // Look a little ahead as well as at the head, so koi start giving way before they meet.
    const fx = hx + Math.cos(k.heading) * k.L * 0.35, fy = hy + Math.sin(k.heading) * k.L * 0.35;
    for (const o of this.koi) {
      if (o === k) continue;
      // Keep clear of the other koi's whole body; koi at similar depths give each other more room.
      const near = (k.W + o.W) * 1.4, care = 1 - clamp(Math.abs(k.depth - o.depth) / 0.35, 0, 0.75);
      const above = k.depth > o.depth || (k.depth === o.depth && k.idx > o.idx);
      for (let i = 0; i < o.N; i += 3) {
        for (let q = 0; q < 2; q++) {
          const ax = (q ? fx : hx) - o.p[2 * i], ay = (q ? fy : hy) - o.p[2 * i + 1], d = Math.hypot(ax, ay);
          if (d >= near || d < 0.01) continue;
          const s = (1 - d / near) * (q ? 1.2 : 1.8) * care * crowd;
          tx += (ax / d) * s; ty += (ay / d) * s;
          // When they do cross, ease them apart in depth so the one on top stays on top.
          if (!q) k.dz += (above ? 1 : -1) * (1 - d / near) * dt * 0.4;
        }
      }
    }
    // Swim in bursts of tail beats, then glide.
    k.burstT -= dt;
    if (k.burstT <= 0) { k.burst = 0.6 + Math.random() * 0.4; k.burstT = 1.4 + Math.random() * 3.6; }
    k.burst *= Math.exp(-dt * 0.85);
    k.excite *= Math.exp(-dt * 0.6);
    const drive = Math.max(k.burst, k.excite);
    // Slow down on the final approach so the turn tightens enough to reach the pellet rather than circle it.
    const approach = chase < k.L * 0.8 ? clamp(chase / (k.L * 0.8), 0.45, 1) : 1;
    const speed = (16 + 44 * k.burst + 46 * k.excite) * sc * approach;
    // Ease toward the wanted heading, never tighter than about half a body length (a little tighter
    // when feeding), so the body can follow the turn without folding.
    const diff = angleDiff(Math.atan2(ty, tx), k.heading);
    const maxRate = speed / (0.5 * k.L) + (k.target ? 0.6 : 0.2);
    const turn = clamp(diff * 2, -maxRate, maxRate) * dt;
    k.heading += turn;
    k.turn += (turn / Math.max(dt, 1e-4) - k.turn) * Math.min(1, dt * 5);
    k.phase += dt * (2.2 + 9 * drive);
    P[0] += Math.cos(k.heading) * speed * dt; P[1] += Math.sin(k.heading) * speed * dt;
    // Eat any pellet within reach of the mouth, with a small ring where it was taken.
    const mx = P[0] + Math.cos(k.heading) * k.W * 0.3, my = P[1] + Math.sin(k.heading) * k.W * 0.3, reach = k.W * 0.55 + 5 * sc;
    for (const f of this.food) {
      if (f.gone || Math.hypot(f.x - mx, f.y - my) >= reach) continue;
      f.gone = true;
      this.addRipple(f.x, f.y, false);
      k.burst = Math.max(k.burst, 0.5);
    }
    // Each segment trails the one ahead, bending at most MAX_BEND per joint so the spine never kinks.
    let ref = k.heading + Math.PI;
    for (let i = 1; i < k.N; i++) {
      const px = P[2 * i - 2], py = P[2 * i - 1];
      let ang = Math.atan2(P[2 * i + 1] - py, P[2 * i] - px);
      const bend = angleDiff(ang, ref);
      if (bend > MAX_BEND) ang = ref + MAX_BEND; else if (bend < -MAX_BEND) ang = ref - MAX_BEND;
      P[2 * i] = px + Math.cos(ang) * k.seg; P[2 * i + 1] = py + Math.sin(ang) * k.seg;
      ref = ang;
    }
    const scull = Math.sin(t * 2.4 + k.seed) * 0.18, tr = clamp(k.turn * 0.35, -0.45, 0.45), tuck = 1 - 0.45 * k.burst;
    k.flareL = clamp((0.8 + scull + tr) * tuck, 0.25, 1.3);
    k.flareR = clamp((0.8 - scull - tr) * tuck, 0.25, 1.3);
    // Drawn spine: the follow chain plus a travelling wave that grows toward the tail.
    const amp = k.W * (0.12 + 0.6 * drive), R = k.rp;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (let i = 0; i < k.N; i++) {
      const j = i < k.N - 1 ? i : i - 1;
      let sx = P[2 * j] - P[2 * j + 2], sy = P[2 * j + 1] - P[2 * j + 3];
      const d = Math.hypot(sx, sy) || 1; sx /= d; sy /= d;
      const off = amp * Math.pow(i / (k.N - 1), 1.5) * Math.sin(k.phase - i * 0.5);
      const x = P[2 * i] - sy * off, y = P[2 * i + 1] + sx * off;
      R[2 * i] = x; R[2 * i + 1] = y;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
    const pad = k.W * 2.1;
    k.bb[0] = x0 - pad; k.bb[1] = y0 - pad; k.bb[2] = x1 + pad; k.bb[3] = y1 + pad;
  }

  step(dt: number) {
    this.t += dt;
    const t = this.t;
    for (const k of this.koi) {
      k.dz = clamp(k.dz * Math.exp(-dt * 0.15), -0.3, 0.3);
      k.depth = clamp(0.58 + 0.42 * noise(t * 0.06, k.seed * 0.01, 21) + k.dz, 0.5, 1);
      this.steer(k, dt);
      // A koi just under the surface now and then breaks it with a small ring.
      if (k.depth > 0.9 && Math.random() < dt * 0.18) this.addRipple(k.p[0], k.p[1], false);
    }
    this.order = this.koi.slice().sort((a, b) => a.depth - b.depth);
    for (const p of this.pads) {
      for (const r of this.ripples) {
        if (!r.hit || r.hit.has(p)) continue;
        const age = t - r.t0, rr = r.speed * age, dx = p.x - r.x, dy = p.y - r.y, d = Math.hypot(dx, dy) || 1;
        if (Math.abs(d - rr) < p.R * 0.5) { r.hit.add(p); const f = 26 * (1 - age / r.life); p.vx += (dx / d) * f; p.vy += (dy / d) * f; }
      }
      p.vx += (-p.ox * 5 - p.vx * 2.2) * dt; p.vy += (-p.oy * 5 - p.vy * 2.2) * dt;
      p.ox += p.vx * dt; p.oy += p.vy * dt;
      p.x = p.hx + p.ox + Math.sin(t * 0.35 + p.seed) * 1.5;
      p.y = p.hy + p.oy + Math.cos(t * 0.3 + p.seed * 0.7) * 1.5;
      const f = p.flower;
      f.x = p.x + f.fx; f.y = p.y + f.fy;
      const target = Math.hypot(this.mx - f.x, this.my - f.y) < f.R * 2.4 ? 1.08 : 0.84;
      f.bloom += (target - f.bloom) * Math.min(1, dt * 3);
      f.rot += dt * 0.03;
    }
    for (const f of this.food) {
      const age = t - f.t0;
      f.vx *= Math.exp(-dt * 0.8); f.vy *= Math.exp(-dt * 0.8);
      f.x += f.vx * dt; f.y += f.vy * dt;
      // Uneaten food floats for a while, then sinks out of sight over its last few seconds.
      f.a = clamp((FOOD_LIFE - age) / 3, 0, 1);
      if (age > FOOD_LIFE) f.gone = true;
    }
    this.food = this.food.filter((f) => !f.gone);
    this.ripples = this.ripples.filter((r) => t - r.t0 < r.life);
  }

  // Opacity of a ripple ring passing through (x, y), or 0.
  rippleAt(x: number, y: number, sw: number, sh: number) {
    const t = this.t;
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const rp = this.ripples[i], age = t - rp.t0, r1 = rp.speed * age;
      const dx = x - rp.x, dy = y - rp.y, d2 = dx * dx + dy * dy, lim = r1 + 12;
      if (d2 > lim * lim) continue;
      const d = Math.sqrt(d2) || 1e-6;
      const band = ((Math.abs(dx) * sw + Math.abs(dy) * sh) / d) * 0.5;
      const fade = Math.pow(1 - age / rp.life, 1.4) * rp.amp;
      if (Math.abs(d - r1) < band) return fade;
      if (rp.big) {
        const r2 = r1 * 0.7 - 6;
        if (r2 > 0 && Math.abs(d - r2) < band) return fade * 0.6;
      }
    }
    return 0;
  }

  // Palette key for one braille dot: null for a dark dot, undefined for open water.
  dot(x: number, y: number, th: number, sw: number, sh: number): string | null | undefined {
    const o = this.o, pads = this.pads;
    this.dotLv = 1; this.dotA = 1; this.dotTop = false;
    for (const p of pads) {
      const m = flowerHit(p.flower, x, y, this.t);
      if (m) { this.dotTop = true; return m === PETAL_OUT ? "petalOut" : m === PETAL_IN ? "petalIn" : "center"; }
    }
    for (const p of pads) {
      const m = padHit(p, x, y, sw, sh);
      if (!m) continue;
      this.dotTop = true;
      return m === PAD_RIM ? "padRim" : m === PAD && th < 0.82 ? "pad" : null;
    }
    for (const f of this.food) {
      const dx = x - f.x, dy = y - f.y;
      if (dx * dx + dy * dy < FOOD_R * FOOD_R) { this.dotA = f.a; return "food"; }
    }
    const ra = this.rippleAt(x, y, sw, sh);
    if (ra) { this.dotA = ra; return "ripple"; }
    const ord = this.order;
    for (let i = ord.length - 1; i >= 0; i--) {
      const k = ord[i], b = k.bb;
      if (x < b[0] || x > b[2] || y < b[1] || y > b[3]) continue;
      const m = classifyKoi(k, x, y, o);
      if (!m) continue;
      if (m === KOI_FIN) {
        // Fins are see-through: dots the dither leaves out show whatever swims beneath.
        if (o.b * 0.9 > th) { this.dotLv = 0.8; return o.color; }
        continue;
      }
      if (m === KOI_EYE) return null;
      // A dark keyline where this koi's edge crosses one below, so the two read as separate bodies.
      if (o.ln > 0.78 && this.koiBelow(i, x, y)) return null;
      if (o.b <= th * 0.7) return null;
      this.dotLv = 0.45 + 0.55 * o.b;
      return o.ln > 0.78 && this.theme.pal[o.color + "Edge"] ? o.color + "Edge" : o.color;
    }
    return undefined;
  }
  koiBelow(i: number, x: number, y: number) {
    const ord = this.order, o = this.o2;
    for (let j = i - 1; j >= 0; j--) {
      const k = ord[j], b = k.bb;
      if (x < b[0] || x > b[2] || y < b[1] || y > b[3]) continue;
      const m = classifyKoi(k, x, y, o);
      if (m === KOI_BODY || m === KOI_EYE) return true;
    }
    return false;
  }

  shade(key: string, lv: number) {
    let arr = this.shades[key];
    if (!arr) {
      const base = hex(this.theme.pal[key]), bg = hex(this.theme.bg);
      arr = this.shades[key] = [];
      for (let i = 0; i < 12; i++) arr.push(css(mix(bg, base, 0.25 + (0.75 * i) / 11)));
    }
    return arr[clamp(Math.round(lv * 11), 0, 11)];
  }
  setTheme(name: Theme) {
    if (this.destroyed) return;
    this.theme = THEMES[name];
    // Cached colours belong to the old theme.
    this.shades = {}; this.buckets.clear();
    this.draw();
  }
  water(c: number, r: number) {
    const t = this.t;
    return noise(c * 0.13 + t * 0.22, r * 0.38 - t * 0.12, 3) * noise(c * 0.04 - t * 0.05, r * 0.11 + t * 0.03, 8);
  }

  draw() {
    const { ctx, cw, ch, cols, rows, buckets } = this;
    if (!this.w) return;
    ctx.globalAlpha = 1;
    ctx.fillStyle = this.theme.bg; ctx.fillRect(0, 0, this.w, this.h);
    const sw = cw / 2, sh = ch / 4, dotR = sw * 0.36;
    // Every dot keeps its own colour; dots are batched by colour and opacity so each batch is one fill.
    for (const bk of buckets.values()) bk.pts.length = 0;
    const add = (key: string, lv: number, a: number, x: number, y: number) => {
      const ai = clamp(Math.round(a * 10), 0, 10);
      if (!ai) return;
      const id = `${key}:${clamp(Math.round(lv * 11), 0, 11)}:${ai}`;
      let bk = buckets.get(id);
      if (!bk) buckets.set(id, (bk = { col: this.shade(key, lv), a: ai / 10, pts: [] }));
      bk.pts.push(x, y);
    };
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x0 = c * cw, y0 = r * ch, dim = this.dimAt(x0 + cw / 2, y0 + ch / 2);
        let open = true;
        for (let j = 0; j < 4; j++) {
          for (let i = 0; i < 2; i++) {
            const x = x0 + (i + 0.5) * sw, y = y0 + (j + 0.5) * sh;
            const key = this.dot(x, y, DITHER[j][i], sw, sh);
            if (key === undefined) continue;
            open = false;
            if (key !== null) add(key, this.dotLv, this.dotA * (dim && !this.dotTop ? 0.15 : 1), x, y);
          }
        }
        if (open) {
          const v = this.water(c, r);
          if (v > 0.42) {
            const j = (c * 7 + r * 3) & 3, i = (c + r) & 1;
            add("water", 1, clamp((v - 0.42) * 5, 0, 0.7) * (dim ? 0.15 : 1), x0 + (i + 0.5) * sw, y0 + (j + 0.5) * sh);
          }
        }
      }
    }
    for (const bk of buckets.values()) {
      const P = bk.pts;
      if (!P.length) continue;
      ctx.globalAlpha = bk.a; ctx.fillStyle = bk.col;
      ctx.beginPath();
      for (let n = 0; n < P.length; n += 2) { ctx.moveTo(P[n] + dotR, P[n + 1]); ctx.arc(P[n], P[n + 1], dotR, 0, TAU); }
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

// Every pond on the page shares one animation loop, which runs while at least one pond is moving.
const ponds: PondEngine[] = [];
let loop = 0, last: number | null = null;
function frame(now: number) {
  loop = 0;
  if (!ponds.some((p) => !p.reduced)) return;
  const dt = last === null ? 0 : clamp((now - last) / 1000, 0, 0.05);
  last = now;
  for (const p of ponds) if (p.visible && !p.reduced && p.w) { p.step(dt); p.draw(); }
  loop = requestAnimationFrame(frame);
}
function startLoop() {
  if (loop) return;
  last = null;
  loop = requestAnimationFrame(frame);
}
function stopLoop() {
  cancelAnimationFrame(loop);
  loop = 0;
}

// Starts a pond in `stage`. The seed places the koi; without one, they start somewhere new on each load.
export function createPond(stage: HTMLElement, theme: Theme, seed: number = (Math.random() * 2 ** 31) | 0): Pond {
  return new PondEngine(stage, theme, seed);
}
