"use client";
import { ThemeProvider, ThemeConfig } from "@/lib/theme";

export default function ClientRoot({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: ThemeConfig;
}) {
  return <ThemeProvider value={theme}>{children}</ThemeProvider>;
}
