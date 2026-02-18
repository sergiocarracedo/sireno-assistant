/**
 * Theme management hook.
 * Supports 'light', 'dark', and 'system' (follows OS preference).
 * Persists choice to chrome.storage.local and applies the 'dark' class to <html>.
 */

import { useState, useEffect, useCallback } from "react";

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "ui_theme";

function getSystemDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(theme: Theme) {
  const isDark = theme === "dark" || (theme === "system" && getSystemDark());
  document.documentElement.classList.toggle("dark", isDark);
}

async function loadTheme(): Promise<Theme> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    const stored = result[STORAGE_KEY] as Theme | undefined;
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
  } catch {
    // storage not available (e.g. in tests)
  }
  return "system";
}

async function persistTheme(theme: Theme) {
  try {
    await chrome.storage.local.set({ [STORAGE_KEY]: theme });
  } catch {
    // ignore
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("dark");

  // Load persisted theme on mount and apply it
  useEffect(() => {
    loadTheme().then((stored) => {
      setThemeState(stored);
      applyTheme(stored);
      setResolved(stored === "system" ? (getSystemDark() ? "dark" : "light") : stored);
    });

    // Watch system preference changes
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      setThemeState((current) => {
        if (current === "system") {
          applyTheme("system");
          setResolved(getSystemDark() ? "dark" : "light");
        }
        return current;
      });
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    applyTheme(next);
    setResolved(next === "system" ? (getSystemDark() ? "dark" : "light") : next);
    persistTheme(next);
  }, []);

  return { theme, resolved, setTheme };
}
