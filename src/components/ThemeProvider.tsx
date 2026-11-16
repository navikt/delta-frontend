"use client";

import { Theme } from "@navikt/ds-react";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react";

type ColorTheme = "light" | "dark";

const STORAGE_KEY = "delta-theme";
const ThemeContext = createContext<{
  theme: ColorTheme | undefined;
  toggleTheme: () => void;
} | undefined>(undefined);

export function ThemeScript() {
  return (
    <script>
      {`(() => {
          let preference;
          try {
            preference = localStorage.getItem("${STORAGE_KEY}");
          } catch (error) {
            console.warn("Could not read the saved theme preference", error);
          }
          const root = document.documentElement;
          if (preference === "light" || preference === "dark") {
            root.dataset.themePreference = preference;
          }
          const dark = root.dataset.themePreference
            ? root.dataset.themePreference === "dark"
            : matchMedia("(prefers-color-scheme: dark)").matches;
          root.classList.toggle("dark", dark);
          root.classList.toggle("light", !dark);
        })();`}
    </script>
  );
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ColorTheme>();

  const applyTheme = useCallback((nextTheme: ColorTheme) => {
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    document.documentElement.classList.toggle("light", nextTheme === "light");
    setTheme(nextTheme);
  }, []);

  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    function syncTheme() {
      const preference = document.documentElement.dataset.themePreference;
      applyTheme(preference === "light" || preference === "dark"
        ? preference
        : media.matches ? "dark" : "light");
    }
    syncTheme();
    media.addEventListener("change", syncTheme);
    return () => media.removeEventListener("change", syncTheme);
  }, [applyTheme]);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.themePreference = nextTheme;
    applyTheme(nextTheme);
    try {
      localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch (error) {
      console.warn("Could not save the theme preference", error);
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Theme theme={theme} hasBackground className="flex flex-col min-h-screen">
        {children}
      </Theme>
    </ThemeContext.Provider>
  );
}

export function useColorTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useColorTheme must be used within ThemeProvider");
  return context;
}
