export type Theme = "dark" | "light";

// Runs in <head> before the first paint, so the page never shows the wrong theme.
// The visitor's saved choice wins, then their system setting, and a blocked localStorage is no problem.
export const THEME_SCRIPT =
  '(function(){var t;try{t=localStorage.getItem("theme")}catch(e){}' +
  'if(t!=="dark"&&t!=="light")t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";' +
  'document.documentElement.setAttribute("data-theme",t)})()';

const listeners = new Set<(theme: Theme) => void>();

export function currentTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

// Switches to the other theme, remembers it for the visitor's next page and visit, and tells subscribers.
export function toggleTheme(): Theme {
  const next: Theme = currentTheme() === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  try {
    localStorage.setItem("theme", next);
  } catch {}
  for (const listener of listeners) listener(next);
  return next;
}

// Calls `callback` each time toggleTheme runs. Returns the function that stops it.
export function onThemeChange(callback: (theme: Theme) => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}
