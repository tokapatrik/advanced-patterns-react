import { createContext, ReactNode, use, useEffect, useState } from "react";

import { getItem, setItem } from "@/lib/utils/localStorage";

enum Theme {
  DARK = "dark",
  LIGHT = "light",
  SYSTEM = "system",
}

const DEFAULT_THEME = Theme.SYSTEM;

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeProviderState>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
});

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

const ThemeProvider = ({
  children,
  defaultTheme = DEFAULT_THEME,
  storageKey = "advanced-react-theme",
}: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(
    getItem<Theme>(storageKey) ?? defaultTheme,
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(Theme.DARK, Theme.LIGHT);

    if (theme === Theme.SYSTEM) {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? Theme.DARK
        : Theme.LIGHT;
      root.classList.add(systemTheme);
      setItem(storageKey, systemTheme);
      return;
    }

    root.classList.add(theme);
    setItem(storageKey, theme);
  }, [theme, storageKey]);

  return <ThemeContext value={{ theme, setTheme }}>{children}</ThemeContext>;
};

const useTheme = () => {
  const context = use(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};

export { ThemeProvider, useTheme, Theme };
