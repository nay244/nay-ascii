"use client";

import { useEffect, useRef } from "react";
import { CELL_W, keepsTop } from "@/lib/art/fit";
import { loadPiece } from "@/lib/art/load";
import type { PieceSlug } from "@/lib/art/load";
import { mountPiece } from "@/lib/art/mount";
import type { Mounted } from "@/lib/art/mount";

// A piece of animated art in a box that sizes itself; the art never pushes the box bigger.
// The <pre> holds the first frame as text (`fallback`) until the piece loads and takes over with a canvas, so a page
// is whole before and without the script. Give `cols` and `rows` to a diagram and the box takes the piece's own shape,
// with its text sized to fit by CSS alone. It is always a <div>, because a <pre> can't sit inside a <span>.
export function Art({ piece, className, cols, rows, fallback, focus }: {
  piece: PieceSlug;
  className?: string;
  cols?: number;
  rows?: number;
  fallback?: string;
  focus?: string | null;
}) {
  const box = useRef<HTMLDivElement>(null);
  const pre = useRef<HTMLPreElement>(null);
  const mounted = useRef<Mounted | null>(null);
  const lit = useRef<string | null>(null);

  useEffect(() => {
    let live = true;
    loadPiece(piece).then((mod) => {
      // The visitor may have gone, or the piece changed, while the file was loading.
      if (!live || !box.current || !pre.current) return;
      mounted.current = mountPiece(box.current, pre.current, piece, mod, { cols });
      if (lit.current !== null) mounted.current.setFocus(lit.current);
    });
    return () => {
      live = false;
      mounted.current?.destroy();
      mounted.current = null;
    };
  }, [piece, cols]);

  useEffect(() => {
    lit.current = focus ?? null;
    mounted.current?.setFocus(lit.current);
  }, [focus]);

  const width = cols && rows ? Math.round(cols * CELL_W * 1000) / 1000 : 0;
  return (
    <div
      ref={box}
      className={[className, keepsTop(piece) && "keep-top"].filter(Boolean).join(" ") || undefined}
      data-piece={piece}
      aria-hidden="true"
      style={width ? { aspectRatio: `${width} / ${rows}` } : undefined}
    >
      <pre ref={pre} style={width ? { fontSize: `calc(100cqw / ${width})` } : undefined}>{fallback}</pre>
    </div>
  );
}
