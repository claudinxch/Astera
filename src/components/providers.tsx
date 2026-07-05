import { ThemeProvider as NextThemesProvider } from "next-themes";
import type * as React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // TODO allow light theme
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      // enableSystem
      disableTransitionOnChange
      enableColorScheme
      forcedTheme="dark"
    >
      {children}
    </NextThemesProvider>
  );
}
