import { firstFrame } from "@/lib/art/first-frame";
import type { DiagramSlug } from "@/lib/art/first-frame";
import { Art } from "./Art";

// One of the write-up diagrams, in a box with the piece's own shape. Its first frame is in the page as text, so the
// labels read and fit before and without the script.
export function Diagram({ piece, cols, rows }: { piece: DiagramSlug; cols: number; rows: number }) {
  return <Art className="illo" piece={piece} cols={cols} rows={rows} fallback={firstFrame(piece, cols)} />;
}
