export type Theme = 'light' | 'dark'

const KEY = 'theme'

export function getStoredTheme(): Theme | null {
  const saved = localStorage.getItem(KEY)
  return saved === 'light' || saved === 'dark' ? saved : null
}

export function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function getInitialTheme(): Theme {
  return getStoredTheme() ?? getSystemTheme()
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
}

export function storeTheme(theme: Theme) {
  localStorage.setItem(KEY, theme)
}
