import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark" | "system";
export type ThemeColor = "blue" | "green" | "purple";
export type LayoutDensity = "comfortable" | "compact";
export type SidebarMode = "expanded" | "collapsed" | "auto";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
  density: LayoutDensity;
  setDensity: (d: LayoutDensity) => void;
  sidebarMode: SidebarMode;
  setSidebarMode: (m: SidebarMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  setTheme: () => {},
  resolvedTheme: "light",
  themeColor: "blue",
  setThemeColor: () => {},
  density: "comfortable",
  setDensity: () => {},
  sidebarMode: "expanded",
  setSidebarMode: () => {},
});

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function isTheme(v: string | null): v is Theme {
  return v === "light" || v === "dark" || v === "system";
}

function isThemeColor(v: string | null): v is ThemeColor {
  return v === "blue" || v === "green" || v === "purple";
}

function isDensity(v: string | null): v is LayoutDensity {
  return v === "comfortable" || v === "compact";
}

function isSidebarMode(v: string | null): v is SidebarMode {
  return v === "expanded" || v === "collapsed" || v === "auto";
}

// HSL values for each color (light mode primary)
const colorTokens: Record<ThemeColor, { primary: string; ring: string }> = {
  blue:   { primary: "221 83% 53%", ring: "221 83% 53%" },
  green:  { primary: "142 71% 45%", ring: "142 71% 45%" },
  purple: { primary: "262 83% 58%", ring: "262 83% 58%" },
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem("eduflow-theme");
    if (isTheme(stored)) return stored;
    return "system";
  });

  const [themeColor, setThemeColorState] = useState<ThemeColor>(() => {
    const stored = localStorage.getItem("eduflow-color");
    if (isThemeColor(stored)) return stored;
    return "blue";
  });

  const [density, setDensityState] = useState<LayoutDensity>(() => {
    const stored = localStorage.getItem("eduflow-density");
    if (isDensity(stored)) return stored;
    return "comfortable";
  });

  const [sidebarMode, setSidebarModeState] = useState<SidebarMode>(() => {
    const stored = localStorage.getItem("eduflow-sidebar");
    if (isSidebarMode(stored)) return stored;
    return "expanded";
  });

  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(() => getSystemTheme());

  const resolvedTheme = theme === "system" ? systemTheme : theme;

  const setTheme = (t: Theme) => { setThemeState(t); localStorage.setItem("eduflow-theme", t); };
  const setThemeColor = (c: ThemeColor) => { setThemeColorState(c); localStorage.setItem("eduflow-color", c); };
  const setDensity = (d: LayoutDensity) => { setDensityState(d); localStorage.setItem("eduflow-density", d); };
  const setSidebarMode = (m: SidebarMode) => { setSidebarModeState(m); localStorage.setItem("eduflow-sidebar", m); };

  // Apply dark/light class
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  // Apply theme color CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const tokens = colorTokens[themeColor];
    root.style.setProperty("--primary", tokens.primary);
    root.style.setProperty("--ring", tokens.ring);
    root.style.setProperty("--sidebar-primary", tokens.primary);
    root.style.setProperty("--sidebar-ring", tokens.ring);
  }, [themeColor]);

  // Apply density class
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("density-comfortable", "density-compact");
    root.classList.add(`density-${density}`);
  }, [density]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemTheme(getSystemTheme());
    const handler = () => setSystemTheme(getSystemTheme());
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme, themeColor, setThemeColor, density, setDensity, sidebarMode, setSidebarMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
