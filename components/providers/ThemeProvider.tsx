"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Fix: 'next-themes/dist/types' బదులు ఇలా రాయండి.
// ఇది ఆటోమేటిక్ గా NextThemesProvider కి కావాల్సిన Props ని తీసుకుంటుంది.
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
