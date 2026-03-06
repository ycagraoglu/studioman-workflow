import React, { createContext, useContext, useEffect, useState } from 'react';

export type ColorTheme = 'blue' | 'slate' | 'emerald' | 'zinc';
export type AppearanceMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  colorTheme: ColorTheme;
  appearanceMode: AppearanceMode;
  setColorTheme: (theme: ColorTheme) => void;
  setAppearanceMode: (mode: AppearanceMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    return (localStorage.getItem('colorTheme') as ColorTheme) || 'blue';
  });
  
  const [appearanceMode, setAppearanceMode] = useState<AppearanceMode>(() => {
    return (localStorage.getItem('appearanceMode') as AppearanceMode) || 'system';
  });

  useEffect(() => {
    localStorage.setItem('colorTheme', colorTheme);
    localStorage.setItem('appearanceMode', appearanceMode);
    
    // Apply color theme variables
    const root = document.documentElement;
    const themes = {
      blue: {
        primary: '#2563eb', // blue-600
        hover: '#1d4ed8',   // blue-700
        light: '#eff6ff',   // blue-50
        accent: '#3b82f6'   // blue-500
      },
      slate: {
        primary: '#1e293b', // slate-800
        hover: '#0f172a',   // slate-900
        light: '#f1f5f9',   // slate-100
        accent: '#475569'   // slate-600
      },
      emerald: {
        primary: '#059669', // emerald-600
        hover: '#047857',   // emerald-700
        light: '#ecfdf5',   // emerald-50
        accent: '#10b981'   // emerald-500
      },
      zinc: {
        primary: '#18181b', // zinc-900
        hover: '#09090b',   // zinc-950
        light: '#f4f4f5',   // zinc-100
        accent: '#f59e0b'   // amber-500
      }
    };

    const selected = themes[colorTheme];
    root.style.setProperty('--primary', selected.primary);
    root.style.setProperty('--primary-hover', selected.hover);
    root.style.setProperty('--primary-light', selected.light);
    root.style.setProperty('--accent', selected.accent);
    
    // Apply appearance mode
    const updateAppearance = () => {
      const isDark = appearanceMode === 'dark' || 
        (appearanceMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    updateAppearance();

    // Listen for system changes if in system mode
    if (appearanceMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => updateAppearance();
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [colorTheme, appearanceMode]);

  return (
    <ThemeContext.Provider value={{ colorTheme, appearanceMode, setColorTheme, setAppearanceMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
