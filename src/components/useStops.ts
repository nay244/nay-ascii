import { useRef, useState } from "react";
import type { RefObject } from "react";
import { shapeInfo } from "@/lib/dots/shapes";
import type { ShapeName } from "@/lib/dots/shapes";
import type { DotArtHandle } from "./DotArt";

// Ties list items to the stops of a dot drawing. Put `artRef` on the drawing and `activeStop` in its props, then spread
// bind(stop) onto the item for that stop: entering it ripples the drawing from the stop and lights the stop's label,
// and leaving it clears the label.
export function useStops(art: ShapeName): {
  artRef: RefObject<DotArtHandle | null>;
  activeStop: string | number | null;
  bind(stop: string | number): { onPointerEnter(): void; onPointerLeave(): void };
} {
  const artRef = useRef<DotArtHandle>(null);
  const [activeStop, setActiveStop] = useState<string | number | null>(null);
  const { points } = shapeInfo(art);

  const bind = (stop: string | number) => ({
    onPointerEnter() {
      const at = points[stop];
      if (at) artRef.current?.rippleAt(...at);
      setActiveStop(stop);
    },
    onPointerLeave() {
      setActiveStop(null);
    },
  });

  return { artRef, activeStop, bind };
}
