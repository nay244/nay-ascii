import type { PieceMeta } from "./fit.ts";

// One literal import per piece, so each is its own chunk and a page loads only the art it shows.
const LOADERS = {
  "project-azure-virtualfw": () => import("./pieces/project-azure-virtualfw.js"),
  "project-servicenow-dashboard": () => import("./pieces/project-servicenow-dashboard.js"),
  "project-hyperv-move": () => import("./pieces/project-hyperv-move.js"),
  "project-roluna-deck": () => import("./pieces/project-roluna-deck.js"),
  "blog-data-notebook": () => import("./pieces/blog-data-notebook.js"),
  "project-azure": () => import("./pieces/project-azure.js"),
  "project-azure-before": () => import("./pieces/project-azure-before.js"),
  "project-azure-after": () => import("./pieces/project-azure-after.js"),
  "project-servicenow": () => import("./pieces/project-servicenow.js"),
  "project-servicenow-stages": () => import("./pieces/project-servicenow-stages.js"),
  "project-hyperv": () => import("./pieces/project-hyperv.js"),
  "project-roluna": () => import("./pieces/project-roluna.js"),
  "fuji-dawn-lake": () => import("./vendor/ascii-magic/pieces/fuji-dawn-lake.js"),
  "autumn-pagoda-maples": () => import("./vendor/ascii-magic/pieces/autumn-pagoda-maples.js"),
  "owl-blink": () => import("./vendor/ascii-magic/pieces/owl-blink.js"),
  "cloud-drift": () => import("./vendor/ascii-magic/pieces/cloud-drift.js"),
  "sleepy-moon": () => import("./vendor/ascii-magic/pieces/sleepy-moon.js"),
} satisfies Record<string, () => Promise<unknown>>;

export type PieceSlug = keyof typeof LOADERS;

// What every piece exports: its meta, a function that makes the drawing for a width, and for some a way to light one part of it.
export type PieceModule = {
  meta: PieceMeta;
  default(cols?: number): (t: number) => string | { text: string; color: string };
  setFocus?(stop: string | null): void;
};

export const loadPiece = (slug: PieceSlug): Promise<PieceModule> => LOADERS[slug]() as Promise<unknown> as Promise<PieceModule>;
