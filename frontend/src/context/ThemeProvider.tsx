import React, { createContext, useContext, useEffect } from "react";

type ResolvedTheme = "light";

type ThemeContextType = {
  isDark: boolean;
  theme: ResolvedTheme;
};

const ThemeContext = createContext<ThemeContextType>({ isDark: false, theme: "light" });

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const theme: ResolvedTheme = "light";
  const isDark = false;

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = "light";
    root.classList.remove("dark");
    root.classList.add("light");
  }, []);

  return <ThemeContext.Provider value={{ isDark, theme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
