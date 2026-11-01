"use client";

import { toggleTheme, type Theme } from "@/lib/theme";

// Toggle icons drawn as dots on a 7×7 grid, to match the pond: a crescent moon for dark, a sun for light.
const GRID = 7, STEP = 2.6, START = 1.2;
const SUN_RAYS = new Set(["3,0", "3,6", "0,3", "6,3", "1,1", "5,1", "1,5", "5,5"]);

function dots(name: Theme) {
  const found: { x: string; y: string }[] = [];
  for (let gy = 0; gy < GRID; gy++) {
    for (let gx = 0; gx < GRID; gx++) {
      const x = START + gx * STEP, y = START + gy * STEP;
      const on = name === "dark"
        ? Math.hypot(x - 9, y - 9) <= 8 && Math.hypot(x - 13, y - 5) > 5.6
        : Math.hypot(x - 9, y - 9) < 3 || SUN_RAYS.has(`${gx},${gy}`);
      if (on) found.push({ x: x.toFixed(1), y: y.toFixed(1) });
    }
  }
  return found;
}

function Icon({ name }: { name: Theme }) {
  return (
    <svg className={name === "dark" ? "moon" : "sun"} viewBox="0 0 18 18" aria-hidden="true">
      {dots(name).map(({ x, y }) => <circle key={`${x},${y}`} cx={x} cy={y} r="1" />)}
    </svg>
  );
}

// Both icons are always in the HTML and CSS shows the one for the current theme,
// so the server's page and the browser's agree whatever the visitor has chosen.
export function ThemeToggle() {
  return (
    <button className="toggle" type="button" aria-label="Switch between dark and light" onClick={() => toggleTheme()}>
      <Icon name="dark" />
      <Icon name="light" />
    </button>
  );
}
