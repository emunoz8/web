import React, { createContext, useContext, useEffect } from "react";

type ResolvedTheme = "light";

type ThemeContextType = {
  theme: ResolvedTheme;
};

const ThemeContext = createContext<ThemeContextType>({ theme: "light" });

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = "light";
    root.classList.remove("dark");
    root.classList.add("light");
  }, []);

  return <ThemeContext.Provider value={{ theme: "light" }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
