"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPond } from "@/lib/dots/pond";
import { currentTheme, onThemeChange } from "@/lib/theme";

// The home page's water: a canvas filling the stage, with the page's header and intro text laid over it.
// The pond starts once the page is in the browser, and stops when the visitor leaves, so going
// away and coming back never leaves a second pond running. The text is in the stage on first render
// because the pond looks for the intro (.hero) as soon as it starts.
export function PondStage({ children }: { children: ReactNode }) {
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!stage.current) return;
    const pond = createPond(stage.current, currentTheme());
    // setTheme is a method, so it's called on the pond rather than handed over loose.
    const stopWatching = onThemeChange((theme) => pond.setTheme(theme));
    return () => {
      stopWatching();
      pond.destroy();
    };
  }, []);

  return (
    <div className="stage" ref={stage}>
      <canvas aria-hidden="true" />
      {children}
    </div>
  );
}
