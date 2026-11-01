"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import type { PieceSlug } from "@/lib/art/load";
import { Art } from "./Art";

// A drawing that stays in view beside its steps. Hovering a step lights its place in the drawing, and leaving clears it.
// The pieces compare the stop they are given as a string, so a numbered stop is turned into one here.
export function Flow({ piece, rows, caption, fallback, steps }: {
  piece: PieceSlug;
  rows: number;
  caption: string;
  fallback: string;
  steps: { stop: string | number; name: string; when: string; children?: ReactNode }[];
}) {
  const [lit, setLit] = useState<string | null>(null);
  return (
    <div className="flow">
      <figure className="panel">
        <figcaption>{caption}</figcaption>
        <Art className="illo" piece={piece} cols={46} rows={rows} fallback={fallback} focus={lit} />
      </figure>
      <ol className="steps">
        {steps.map(({ stop, name, when, children }) => (
          <li key={stop} data-stop={stop} onPointerEnter={() => setLit(String(stop))} onPointerLeave={() => setLit(null)}>
            <h4>
              <span>{name}</span>
              <span className="when">{when}</span>
            </h4>
            {children}
          </li>
        ))}
      </ol>
    </div>
  );
}
