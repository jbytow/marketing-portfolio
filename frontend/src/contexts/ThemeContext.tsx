import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'rose';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'rose',
  setTheme: () => {},
});

// Light theme is temporarily disabled (see Header's theme switcher) — Rose is the default.
function getInitialTheme(): Theme {
  const saved = localStorage.getItem('theme') as Theme;
  if (saved === 'dark' || saved === 'rose') return saved;
  return 'rose';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.removeAttribute('data-theme');
    if (theme !== 'dark') root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeState }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
