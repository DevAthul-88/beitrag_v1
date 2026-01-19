'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useEffect, useState, ReactNode } from 'react';

interface SafeThemeProviderProps {
  children: ReactNode;
}

export function SafeThemeProvider({ children }: SafeThemeProviderProps) {
  const [mounted, setMounted] = useState(false);

  // Prevents hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // render nothing until mounted

  return (
    <NextThemesProvider attribute="class" defaultTheme="system">
      {children}
    </NextThemesProvider>
  );
}
