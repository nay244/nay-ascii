"use client";

import Link from "next/link";
import { useState } from "react";

// One dot per note in the series, with a small gap before each group. Hovering or focusing a dot shows that note's
// title in the line beneath the trail, and the line goes back to `whereText` when the pointer or focus leaves.
export function Trail({ notes, current, whereText }: {
  notes: { href: string; title: string; first: boolean }[];
  current: number;
  whereText: string;
}) {
  const [shown, setShown] = useState<string | null>(null);
  return (
    <>
      <nav
        className="trail"
        aria-label="Notes in this series"
        onPointerOver={(ev) => {
          const dot = (ev.target as Element).closest("a");
          if (dot) setShown(dot.title);
        }}
        onFocus={(ev) => setShown((ev.target as HTMLElement).title)}
        onPointerLeave={() => setShown(null)}
        onBlur={() => setShown(null)}
      >
        {notes.map((n, i) => (
          <Link
            key={n.href}
            href={n.href}
            prefetch={false}
            className={n.first ? "first" : undefined}
            title={n.title}
            aria-label={n.title}
            aria-current={i === current ? "page" : undefined}
          />
        ))}
      </nav>
      <p className="where">{shown ?? whereText}</p>
    </>
  );
}
