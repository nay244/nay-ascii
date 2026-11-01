// The one drawing the dot engine still makes: the Japan 2023 route. The other drawings became animated art.
// Shapes are drawn in a box 100 wide and `h` tall. Distances are in those units; e is half a line's width.

// What a shape says about one spot: [palette key, density (how much of the dither it fills), brightness level].
export type Hit = [key: string, density: number, level: number];

// A piece of text on the drawing, placed by the page: u is a share of the width, v the middle of the line in
// the box's own units. A label with a stop belongs to that named point, so a page can light it up.
export type Label = [u: number, v: number, text: string, classes: string, stop?: string | number];

type Point = [number, number];

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// Distance from (u, v) to the segment (x1, y1)-(x2, y2).
const sg = (u: number, v: number, x1: number, y1: number, x2: number, y2: number) => {
  const dx = x2 - x1, dy = y2 - y1, t = clamp(((u - x1) * dx + (v - y1) * dy) / (dx * dx + dy * dy), 0, 1);
  return Math.hypot(u - x1 - t * dx, v - y1 - t * dy);
};
// Approximate signed distance to an ellipse.
const ell = (u: number, v: number, cx: number, cy: number, a: number, b: number) => {
  const x = u - cx, y = v - cy;
  return ((x * x) / (a * a) + (y * y) / (b * b) - 1) / (Math.hypot((2 * x) / (a * a), (2 * y) / (b * b)) || 1e-6);
};
// (u, v) turned about (cx, cy) by angle a.
const rot = (u: number, v: number, cx: number, cy: number, a: number): Point => {
  const c = Math.cos(a), s = Math.sin(a), x = u - cx, y = v - cy;
  return [cx + x * c + y * s, cy - x * s + y * c];
};

// Central Honshu in the route map's box: lon 134.7 to 140.9, with latitude stretched to keep its shape.
const jp = (lon: number, lat: number): Point => [(lon - 134.7) * 16.13, (37.8 - lat) * 19.7];
const STOP: Record<string, Point> = {
  Tokyo: jp(139.7, 35.68), Nikko: jp(139.6, 36.75), Kanazawa: jp(136.65, 36.56), Hakone: jp(139.03, 35.23), Fuji: jp(138.68, 35.16),
  Kyoto: jp(135.77, 35.01), Osaka: jp(135.5, 34.69), Nara: jp(135.83, 34.68), Wakayama: jp(135.17, 34.23),
};
const ROUTE = ([["Tokyo", "Nikko"], ["Tokyo", "Kanazawa"], ["Tokyo", "Hakone"], ["Tokyo", "Fuji"], ["Tokyo", "Osaka"], ["Osaka", "Kyoto"], ["Osaka", "Nara"], ["Osaka", "Wakayama"]] as const)
  .map(([a, b]): [number, number, number, number] => [...STOP[a], ...STOP[b]]);
// A rough coastline, clockwise from the Sea of Japan. It runs past the box wherever the map crops the land.
const LAND: Point[] = ([[134, 35.55], [134.25, 35.55], [134.8, 35.65], [135.25, 35.78], [135.35, 35.52], [135.75, 35.52], [136.05, 35.7], [136, 36], [136.2, 36.3], [136.6, 36.6], [136.75, 36.9], [136.72, 37.25], [136.95, 37.38], [137.35, 37.52], [137.25, 37.3], [137.05, 37.1], [136.98, 36.85], [137.25, 36.75], [137.45, 36.9], [138.2, 37.18], [138.6, 37.45], [139.05, 37.95], [139.5, 38.3], [140, 39], [141.5, 39], [141, 38.2], [141, 37], [140.65, 36.55], [140.6, 36.3], [140.85, 35.75], [140.4, 35.2], [139.85, 34.93], [139.82, 35.3], [140.1, 35.6], [139.8, 35.65], [139.65, 35.42], [139.7, 35.17], [139.4, 35.3], [139.15, 35.25], [139.1, 34.9], [138.85, 34.6], [138.75, 34.95], [138.85, 35.1], [138.55, 35.12], [138.4, 34.95], [138.2, 34.6], [137.7, 34.65], [137.2, 34.62], [137.05, 34.57], [137.25, 34.75], [136.95, 34.75], [136.85, 35.05], [136.55, 34.75], [136.85, 34.35], [136.9, 34.27], [136.2, 34.07], [136, 33.75], [135.75, 33.45], [135.35, 33.75], [135.1, 34], [135.15, 34.25], [135.25, 34.4], [135.4, 34.65], [135.2, 34.68], [134.65, 34.75], [134, 34.6]] as Point[])
  .map(([lon, lat]) => jp(lon, lat));

// Distance to a closed polygon, negative inside.
function poly(u: number, v: number, pts: Point[]) {
  let d = Infinity, inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [ax, ay] = pts[j], [bx, by] = pts[i];
    d = Math.min(d, sg(u, v, ax, ay, bx, by));
    if (by > v !== ay > v && u < ((ax - bx) * (v - by)) / (ay - by) + bx) inside = !inside;
  }
  return inside ? -d : d;
}

type Shape = {
  h: number;
  points: Record<string, Point>;
  draw(u: number, v: number, e: number): Hit | null;
  labels: Label[];
};

export const SHAPES = {
  // The Japan 2023 route, with the same stops and lines as the map in the original post.
  "japan-route": {
    h: 78,
    points: STOP,
    draw(u, v, e) {
      for (const name in STOP) {
        const [x, y] = STOP[name], r = name === "Tokyo" ? 2.2 : 1.5, d = Math.hypot(u - x, v - y);
        if (d < r) return ["red", 1, 1];
        // A ring of empty dots keeps each stop clear of the lines and the land.
        if (d < r + 1) return null;
      }
      for (const seg of ROUTE) if (sg(u, v, ...seg) < e) return ["gold", 1, 0.85];
      // Lake Biwa, as a small gap in the land.
      const [lu, lv] = rot(u, v, 22.3, 50.2, 0.4), lake = ell(lu, lv, 22.3, 50.2, 1.6, 4.6);
      if (Math.abs(lake) < e) return ["water", 1, 0.7];
      if (lake < 0) return null;
      const d = poly(u, v, LAND);
      if (Math.abs(d) < e) return ["water", 1, 0.85];
      return d < 0 ? ["water", 0.16, 0.5] : null;
    },
    // The two "?" stops are places still to be filled in, so they name no stop.
    labels: [
      [83.5, 41.8, "Tokyo", "l plate", "Tokyo"], [82, 20.7, "Nikko", "l plate", "Nikko"], [28.6, 24.4, "Kanazawa", "r plate", "Kanazawa"],
      [72.2, 51.2, "Hakone", "l plate", "Hakone"], [64.2, 56.2, "?", "todo plate"],
      [19.8, 54.6, "Kyoto", "l plate", "Kyoto"], [10.4, 61.3, "Osaka", "r plate", "Osaka"], [20.6, 64.4, "Nara", "l plate", "Nara"], [10.2, 70.3, "?", "l todo plate"],
    ],
  },
} satisfies Record<string, Shape>;

export type ShapeName = keyof typeof SHAPES;

// What a page needs to lay a drawing out: its box's height, its named points, and its labels.
export function shapeInfo(name: ShapeName): { h: number; points: Record<string | number, [number, number]>; labels: Label[] } {
  const { h, points, labels } = SHAPES[name];
  return { h, points, labels };
}
