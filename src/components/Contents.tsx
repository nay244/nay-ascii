"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { TocEntry } from "@/lib/notes";

// A heading counts as reached once its top is within this many pixels of the top of the window.
const REACHED = 120;

// The folded list for a phone and the sticky list down the side of a laptop; CSS shows one of them.
// The side list marks the section being read. `text` is HTML text, such as "Cost &amp; Governance".
export function Contents({ toc }: { toc: TocEntry[] }) {
  // The index of the last heading reached; the first, before any is.
  const subscribe = useCallback((onChange: () => void) => {
    addEventListener("scroll", onChange, { passive: true });
    return () => removeEventListener("scroll", onChange);
  }, []);
  const reading = useCallback(() => {
    let cur = 0;
    toc.forEach((h, i) => {
      const el = document.getElementById(h.id);
      if (el && el.getBoundingClientRect().top < REACHED) cur = i;
    });
    return cur;
  }, [toc]);
  const current = useSyncExternalStore(subscribe, reading, () => 0);

  const item = (h: TocEntry, i: number, marked: boolean) => (
    <li key={h.id} className={`l${h.lvl}`}>
      <a href={`#${h.id}`} className={marked && i === current ? "on" : undefined} dangerouslySetInnerHTML={{ __html: h.text }} />
    </li>
  );
  return (
    <>
      <details className="toc-m">
        <summary>on this page · {toc.length}</summary>
        <ol>{toc.map((h, i) => item(h, i, false))}</ol>
      </details>
      <aside className="toc" aria-label="On this page">
        <span className="toc-head">on this page</span>
        <ol>{toc.map((h, i) => item(h, i, true))}</ol>
      </aside>
    </>
  );
}
