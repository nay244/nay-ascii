// Starts a piece playing in a box and keeps it fitted. Ported from mount() in the mockups' asciiart.js.
import { colsFor, fontPx, isOwn } from "./fit.ts";
import type { PieceModule } from "./load.ts";
import { play as defaultPlay } from "./vendor/ascii-magic/runtime/player.js";

type MountOptions = {
  cols?: number; // a page's fixed width, which beats a piece's wide version
  play?: typeof defaultPlay; // the player, replaceable in tests
  quiet?: boolean; // the visitor wants no motion, so the player holds one frame; defaults to what the browser says
};

export type Mounted = { setFocus(stop: string | null): void; destroy(): void };

// The player draws on a canvas it puts after the <pre> and remembers on it.
type Pre = HTMLElement & { _canvas?: HTMLCanvasElement | null };

export function mountPiece(box: HTMLElement, pre: HTMLElement, slug: string, mod: PieceModule, options: MountOptions = {}): Mounted {
  const { cols: fixed, play = defaultPlay, quiet = matchMedia("(prefers-reduced-motion: reduce)").matches } = options;
  const own = isOwn(slug);
  let cols = 0, shaped: PieceModule = mod, stopPlayer: (() => void) | undefined;

  const start = () => {
    stopPlayer?.();
    stopPlayer = play(pre, shaped, { look: { look: "dots" } });
  };
  // The text follows the box on every resize. The piece itself is redrawn only when its width changes.
  const fit = () => {
    const want = colsFor(mod.meta, box.clientWidth, box.clientHeight, fixed);
    pre.style.fontSize = `${fontPx(slug, mod.meta, want, box.clientWidth, box.clientHeight)}px`;
    if (want === cols) return;
    cols = want;
    // Our own pieces draw at whatever width they are asked for; a library piece has one.
    shaped = own ? { ...mod, meta: { ...mod.meta, cols: want }, default: () => mod.default(want) } : mod;
    start();
  };
  fit();
  const observer = new ResizeObserver(fit);
  observer.observe(box);

  return {
    // A held frame has to be drawn again to show a change of focus.
    setFocus(stop) {
      if (!mod.setFocus) return;
      mod.setFocus(stop);
      if (quiet) start();
    },
    destroy() {
      observer.disconnect();
      stopPlayer?.();
      stopPlayer = undefined;
      // Focus is module state, which outlives the page when the visitor moves around the site.
      mod.setFocus?.(null);
      const canvas = (pre as Pre)._canvas;
      canvas?.remove();
      (pre as Pre)._canvas = null;
      pre.style.display = "";
    },
  };
}
