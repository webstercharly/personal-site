/**
 * Theme management utilities
 */

export type Theme = 'light' | 'dark';

/**
 * Get theme from localStorage if valid
 */
export function getStoredTheme(): Theme | null {
  if (typeof localStorage === 'undefined') return null;
  const stored = localStorage.getItem('theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return null;
}

/**
 * Get theme based on system preference
 */
export function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Apply theme to document
 */
export function applyTheme(theme: Theme): void {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  localStorage.setItem('theme', theme);
}

/**
 * Initialize theme on page load
 */
export function initTheme(): Theme {
  const theme = getStoredTheme() ?? getSystemTheme();
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('theme', theme);
  }
  return theme;
}

/**
 * Toggle theme between light and dark
 */
export function toggleTheme(): Theme {
  const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  const newTheme: Theme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
  return newTheme;
}

/**
 * Get current theme
 */
export function getCurrentTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}
