import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Mode = "light" | "dark" | "system";

const ThemeContext = createContext<{ mode: Mode; setMode: (m: Mode) => void }>({
  mode: "dark",
  setMode: () => {},
});

const STORAGE_KEY = "mithaas-theme";

function apply(mode: Mode) {
  const dark =
    mode === "dark" ||
    (mode === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>("dark");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Mode | null;
    const next = stored ?? "dark";
    setModeState(next);
    apply(next);
  }, []);

  const setMode = (next: Mode) => {
    setModeState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    apply(next);
  };

  return <ThemeContext.Provider value={{ mode, setMode }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
