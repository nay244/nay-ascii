"use client";

import { useEffect, useImperativeHandle, useRef } from "react";
import type { Ref } from "react";
import { mountArt } from "@/lib/dots/dotart";
import type { Art } from "@/lib/dots/dotart";
import { shapeInfo } from "@/lib/dots/shapes";
import type { ShapeName } from "@/lib/dots/shapes";
import { currentTheme, onThemeChange } from "@/lib/theme";

// What a page can ask of the drawing: a ripple from a point in the shape's own box (see useStops).
export type DotArtHandle = { rippleAt(u: number, v: number): void };

// A drawing in the pond's dots, with its labels laid over it. The box takes the shape's proportions, so the labels, placed
// by percentage, stay on their spots at any width. The canvas is its own trigger: a ripple runs when the pointer enters.
// The stop that is `activeStop` has its label lit. The drawing starts once the page is in the browser and stops when
// the visitor leaves, and it follows the theme toggle.
export function DotArt({ name, activeStop = null, ref }: {
  name: ShapeName;
  activeStop?: string | number | null;
  ref?: Ref<DotArtHandle>;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const art = useRef<Art | null>(null);
  const { h, labels } = shapeInfo(name);

  useImperativeHandle(ref, () => ({ rippleAt: (u, v) => art.current?.rippleAt(u, v) }), []);

  useEffect(() => {
    const el = canvas.current;
    // A browser that can't draw in 2D leaves the labels and the days, which read without the drawing.
    // Anything else that goes wrong in mountArt is a bug, so it is left to surface.
    if (!el || !el.getContext("2d")) return;
    const drawing = mountArt(el, name, el, currentTheme());
    art.current = drawing;
    // setTheme is a method, so it's called on the drawing rather than handed over loose.
    const stopWatching = onThemeChange((theme) => drawing.setTheme(theme));
    return () => {
      stopWatching();
      drawing.destroy();
      art.current = null;
    };
  }, [name]);

  return (
    <div className="illo" style={{ aspectRatio: `100 / ${h}` }}>
      <canvas ref={canvas} aria-hidden="true" data-art={name} />
      {labels.map(([u, v, text, classes, stop], i) => (
        <span
          key={i}
          className={["lbl", classes, stop !== undefined && stop === activeStop && "on"].filter(Boolean).join(" ")}
          style={{ left: `${u}%`, top: `${(v / h) * 100}%` }}
          data-stop={stop}
        >
          {text}
        </span>
      ))}
    </div>
  );
}
