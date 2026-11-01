import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { currentTheme, onThemeChange, THEME_SCRIPT, toggleTheme } from "../../src/lib/theme.ts";

type Options = { saved?: string | null; system?: "dark" | "light"; storageThrows?: boolean };

// What the page offers theme code: <html>'s attributes, localStorage and matchMedia.
function fakeBrowser(theme: string | null, { saved = null, system = "dark", storageThrows = false }: Options = {}) {
  const attrs = new Map<string, string>(theme ? [["data-theme", theme]] : []);
  const store = new Map<string, string>(saved === null ? [] : [["theme", saved]]);
  const blocked = () => { throw new Error("storage is blocked"); };
  return {
    attrs,
    store,
    document: {
      documentElement: {
        getAttribute: (name: string) => attrs.get(name) ?? null,
        setAttribute: (name: string, value: string) => { attrs.set(name, value); },
      },
    },
    localStorage: {
      getItem: (key: string) => (storageThrows ? blocked() : store.get(key) ?? null),
      setItem: (key: string, value: string) => (storageThrows ? blocked() : void store.set(key, value)),
    },
    matchMedia: (query: string) => ({ matches: query.includes(`: ${system})`) }),
    get theme() { return attrs.get("data-theme"); },
  };
}

// Puts a fake page in the globals that toggleTheme and currentTheme read.
function fakeDocument(theme: string | null, options?: Options) {
  const browser = fakeBrowser(theme, options);
  Object.defineProperty(globalThis, "document", { value: browser.document, configurable: true, writable: true });
  Object.defineProperty(globalThis, "localStorage", { value: browser.localStorage, configurable: true, writable: true });
  return browser;
}

// Runs THEME_SCRIPT as the browser would, in its own context, and returns the data-theme it set.
function runScript({ saved, system, getterThrows = false }: { saved: string | null; system: "dark" | "light"; getterThrows?: boolean }) {
  const browser = fakeBrowser(null, { saved: saved === "THROW" ? null : saved, system, storageThrows: saved === "THROW" });
  const context: Record<string, unknown> = { document: browser.document, matchMedia: browser.matchMedia };
  if (getterThrows) Object.defineProperty(context, "localStorage", { get() { throw new Error("access is denied"); } });
  else context.localStorage = browser.localStorage;
  vm.runInNewContext(THEME_SCRIPT, context);
  return browser.theme;
}

const cases = [
  { name: "saved light beats a dark system", saved: "light", system: "dark", want: "light" },
  { name: "saved dark beats a light system", saved: "dark", system: "light", want: "dark" },
  { name: "first visit follows a light system", saved: null, system: "light", want: "light" },
  { name: "first visit follows a dark system", saved: null, system: "dark", want: "dark" },
  { name: "junk in storage is ignored", saved: "blue", system: "light", want: "light" },
  { name: "blocked storage follows the system", saved: "THROW", system: "light", want: "light" },
] as const;
for (const c of cases) test(c.name, () => assert.equal(runScript(c), c.want));

test("a storage lookup that itself throws follows the system", () => {
  assert.equal(runScript({ saved: null, system: "light", getterThrows: true }), "light");
});

test("currentTheme reads the attribute", () => {
  fakeDocument("light");
  assert.equal(currentTheme(), "light");
  fakeDocument("dark");
  assert.equal(currentTheme(), "dark");
});

test("toggleTheme flips the attribute and saves the choice", () => {
  const dom = fakeDocument("dark");
  assert.equal(toggleTheme(), "light");
  assert.equal(dom.theme, "light");
  assert.equal(dom.store.get("theme"), "light");
  assert.equal(toggleTheme(), "dark");
  assert.equal(dom.store.get("theme"), "dark");
});

test("toggleTheme flips the attribute even when saving throws", () => {
  const dom = fakeDocument("dark", { storageThrows: true });
  assert.equal(toggleTheme(), "light");
  assert.equal(dom.theme, "light");
});

test("onThemeChange fires on toggle and stops after unsubscribing", () => {
  fakeDocument("dark");
  const seen: string[] = [], off = onThemeChange((t) => seen.push(t));
  toggleTheme();
  off();
  toggleTheme();
  assert.deepEqual(seen, ["light"]);
});
