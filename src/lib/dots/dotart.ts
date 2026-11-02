// A drawing in the pond's braille dots: the same 3.6px grid and ordered dither.
// mountArt(canvas, name, trigger, theme) draws the named shape on the canvas and sends a ripple across it when
// the pointer enters (or keyboard focus lands on) trigger. The page renders a shape's labels itself, from
// shapeInfo(name), in a parent with the shape's aspect ratio (100 / h).
import type { Theme } from "../theme.ts";
import { SHAPES } from "./shapes.ts";
import type { Hit, ShapeName } from "./shapes.ts";

const DOT = 3.6;
const DITHER = [[0.06, 0.56], [0.81, 0.31], [0.19, 0.69], [0.94, 0.44]];
const PALETTES: Record<Theme, { bg: string; pal: Record<string, string> }> = {
  dark: { bg: "#1a1917", pal: { fin: "#b9c3d6", ripple: "#8fb7ff", red: "#ff6a3d", gold: "#f2b84b", pad: "#7db57d", water: "#5a6c9c", bronze: "#c98a52", silver: "#cfd6e2", pink: "#ff8fb1" } },
  light: { bg: "#eef2f4", pal: { fin: "#7d899b", ripple: "#5f86bd", red: "#e0532f", gold: "#d99a28", pad: "#3d7a4b", water: "#8ea5bd", bronze: "#b0703a", silver: "#6f7b8d", pink: "#c4466e" } },
};
const RING_LIFE = 1.1;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
// Colours are worked out once per theme, palette key and level, and shared by every drawing.
const shades = new Map<string, string>();
function shade(theme: Theme, key: string, lv: number) {
  const id = `${theme}:${key}:${lv}`;
  let c = shades.get(id);
  if (!c) {
    const p = PALETTES[theme], a = rgb(p.bg), b = rgb(p.pal[key]), t = 0.25 + (0.75 * lv) / 10;
    c = `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;
    shades.set(id, c);
  }
  return c;
}

export interface Art {
  // Sends a ripple across the drawing from (x, y), in CSS pixels from its top left corner.
  ripple(x: number, y: number): void;
  // The same, from a point in the shape's own 100 × h box.
  rippleAt(u: number, v: number): void;
  setTheme(theme: Theme): void;
  destroy(): void;
}

type Dot = { x: number; y: number; hit: Hit | null };
type Ring = { x: number; y: number; far: number; t0: number };
type Batch = { key: string; lv: number; a: number; pts: number[] };

class Drawing implements Art {
  canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D;
  shape: (u: number, v: number, e: number) => Hit | null; boxH: number;
  theme: Theme; reduced: boolean;
  ring: Ring | null = null; raf = 0; destroyed = false;
  w = 0; h = 0; dots: Dot[] | null = null;
  trigger: Element; resizeObserver: ResizeObserver;

  constructor(canvas: HTMLCanvasElement, name: ShapeName, trigger: Element, theme: Theme) {
    const spec = SHAPES[name], ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("A drawing needs a canvas that can draw in 2D.");
    this.canvas = canvas; this.ctx = ctx; this.trigger = trigger; this.theme = theme;
    this.shape = spec.draw; this.boxH = spec.h;
    this.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.resizeObserver = new ResizeObserver(() => this.layout());
    this.resizeObserver.observe(canvas);
    trigger.addEventListener("pointerenter", this.onEnter);
    trigger.addEventListener("focus", this.onFocus);
    // The first draw doesn't wait for the resize observer's first report.
    this.layout();
  }

  // Stops everything this drawing started. A ripple asked for afterwards does nothing.
  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.resizeObserver.disconnect();
    this.trigger.removeEventListener("pointerenter", this.onEnter);
    this.trigger.removeEventListener("focus", this.onFocus);
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.ring = null;
  }

  onEnter = (e: Event) => {
    const r = this.canvas.getBoundingClientRect(), p = e as PointerEvent;
    this.ripple(clamp(p.clientX - r.left, 0, r.width), clamp(p.clientY - r.top, 0, r.height));
  };
  onFocus = () => this.ripple(this.w / 2, this.h / 2);

  layout() {
    if (this.destroyed) return;
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    if (!w || !h) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    this.canvas.width = Math.round(w * dpr); this.canvas.height = Math.round(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.w = w; this.h = h;
    const H = this.boxH, s = Math.min(w / 100, h / H), ox = (w - 100 * s) / 2, oy = (h - H * s) / 2, e = 2 / s;
    const cols = Math.floor(w / DOT), rows = Math.floor(h / DOT), mx = (w - cols * DOT) / 2, my = (h - rows * DOT) / 2;
    this.dots = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = mx + (c + 0.5) * DOT, y = my + (r + 0.5) * DOT, hit = this.shape((x - ox) / s, (y - oy) / s, e);
        this.dots.push({ x, y, hit: hit && hit[1] > DITHER[r & 3][c & 1] ? hit : null });
      }
    }
    this.draw();
  }
  ripple(x: number, y: number) {
    if (this.reduced || this.destroyed || !this.w) return;
    const far = Math.max(Math.hypot(x, y), Math.hypot(this.w - x, y), Math.hypot(x, this.h - y), Math.hypot(this.w - x, this.h - y));
    this.ring = { x, y, far, t0: performance.now() };
    if (!this.raf) this.loop();
  }
  // A ripple from a point in the shape's own box.
  rippleAt(u: number, v: number) {
    const s = Math.min(this.w / 100, this.h / this.boxH);
    this.ripple((this.w - 100 * s) / 2 + u * s, (this.h - this.boxH * s) / 2 + v * s);
  }
  loop() {
    this.raf = requestAnimationFrame((now) => { this.raf = 0; this.draw(now); if (this.ring) this.loop(); });
  }
  setTheme(theme: Theme) {
    if (this.destroyed) return;
    this.theme = theme;
    this.draw();
  }
  draw(now = performance.now()) {
    const { ctx, dots } = this;
    if (!dots) return;
    ctx.clearRect(0, 0, this.w, this.h);
    let ring: { x: number; y: number; r: number; fade: number } | null = null;
    if (this.ring) {
      const p = (now - this.ring.t0) / 1000 / RING_LIFE;
      if (p >= 1) this.ring = null;
      else ring = { x: this.ring.x, y: this.ring.y, r: this.ring.far * (1 - (1 - p) ** 2), fade: 1 - p };
    }
    const batches = new Map<string, Batch>();
    const add = (key: string, lv: number, a: number, x: number, y: number) => {
      const id = `${key}|${lv}|${a}`;
      let b = batches.get(id);
      if (!b) batches.set(id, (b = { key, lv, a, pts: [] }));
      b.pts.push(x, y);
    };
    for (const { x, y, hit } of dots) {
      let near = 0;
      if (ring) { const d = Math.abs(Math.hypot(x - ring.x, y - ring.y) - ring.r); if (d < 4.5) near = (1 - d / 4.5) * ring.fade; }
      if (hit) add(hit[0], near > 0.2 ? 10 : Math.round(hit[2] * 10), 10, x, y);
      else if (near > 0.2) add("ripple", 6, Math.round(near * 8), x, y);
    }
    const R = DOT * 0.36;
    for (const b of batches.values()) {
      ctx.globalAlpha = b.a / 10; ctx.fillStyle = shade(this.theme, b.key, b.lv);
      ctx.beginPath();
      for (let i = 0; i < b.pts.length; i += 2) { ctx.moveTo(b.pts[i] + R, b.pts[i + 1]); ctx.arc(b.pts[i], b.pts[i + 1], R, 0, Math.PI * 2); }
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

export function mountArt(canvas: HTMLCanvasElement, name: ShapeName, trigger: Element, theme: Theme): Art {
  return new Drawing(canvas, name, trigger, theme);
}
