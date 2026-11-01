// How wide a piece draws and how big its text is for a box of a given size. Ported from fit() in the mockups' asciiart.js.

// A character cell's width over its height, in the site's monospace stack.
export const CELL_W = 0.602;

export type PieceMeta = { cols: number; rows: number; cell?: string; cover?: boolean; wide?: number };

// project-* and blog-* pieces are our own; the rest come from the library.
export const isOwn = (slug: string): boolean => /^(project|blog)-/.test(slug);

// Pieces whose subject sits high up keep their top when cropped.
const KEEP_TOP = new Set(["fuji-dawn-lake", "owl-blink"]);
export const keepsTop = (slug: string): boolean => KEEP_TOP.has(slug);

// A page's fixed width wins. Otherwise a banner much wider than it is tall gets the piece's wide version, if it has one.
export function colsFor(meta: PieceMeta, boxW: number, boxH: number, fixed?: number): number {
  return fixed || (meta.wide && boxW / boxH > 2.2 ? meta.wide : meta.cols);
}

// A painted scene or a library piece fills its box and crops; one of our diagrams fits whole, so no label is cut.
export function fontPx(slug: string, meta: PieceMeta, cols: number, boxW: number, boxH: number): number {
  const aspect = meta.cell === "square" ? 1 : 1 / CELL_W;
  const size = isOwn(slug) && !meta.cover ? Math.min : Math.max;
  return size(boxW / (cols * CELL_W), boxH / (meta.rows * CELL_W * aspect));
}
