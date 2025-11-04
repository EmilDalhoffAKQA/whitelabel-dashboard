"use client";
import { createContext, useContext } from "react";

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  logo: string;
  favicon: string;
}

const ThemeContext = createContext<ThemeConfig | null>(null);

export function ThemeProvider({
  value,
  children,
}: {
  value: ThemeConfig;
  children: React.ReactNode;
}) {
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
