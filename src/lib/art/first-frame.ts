// The first frame of each diagram as text, for the <pre> a page renders before the art loads.
// Only Server Components import this, which keeps the seven diagrams out of the client bundles.
import * as azure from "./pieces/project-azure.js";
import * as azureAfter from "./pieces/project-azure-after.js";
import * as azureBefore from "./pieces/project-azure-before.js";
import * as hyperv from "./pieces/project-hyperv.js";
import * as roluna from "./pieces/project-roluna.js";
import * as servicenow from "./pieces/project-servicenow.js";
import * as servicenowStages from "./pieces/project-servicenow-stages.js";
import type { PieceModule } from "./load.ts";

const DIAGRAMS = {
  "project-azure": azure,
  "project-azure-before": azureBefore,
  "project-azure-after": azureAfter,
  "project-servicenow": servicenow,
  "project-servicenow-stages": servicenowStages,
  "project-hyperv": hyperv,
  "project-roluna": roluna,
} as unknown as Record<string, PieceModule>;

export type DiagramSlug = "project-azure" | "project-azure-before" | "project-azure-after" | "project-servicenow" | "project-servicenow-stages" | "project-hyperv" | "project-roluna";

export function firstFrame(slug: DiagramSlug, cols: number): string {
  const frame = DIAGRAMS[slug].default(cols)(0);
  return typeof frame === "string" ? frame : frame.text;
}
